import { resolveAdapter } from "./adapters"
import type { AdapterCtx, NormalizedItem, SupplierRow } from "./adapters/types"
import { computePrice, landedCost, type PriceRule } from "./pricing"
import { createHash } from "node:crypto"

/* ══════════════════════════════════════════════════════════════════════════
   LA CORSA DI SINCRONIZZAZIONE

   Struttura, in ordine:

     lock → apri corsa → per ogni pagina: normalizza, confronta, scrivi
          → riprezza ciò che è cambiato → chiudi corsa → sblocca

   Tre proprietà da difendere a ogni modifica:

     · idempotente — la stessa risposta due volte lascia il database uguale
     · resiliente  — una riga sbagliata finisce nel diario, non ferma le altre
     · economica   — se il costo non è cambiato non si scrive niente, e si
                     vede: 40.000 righe lette, 300 aggiornate.

   `db` è un client Postgres qualunque (pg, postgres.js). Resta un parametro
   perché la corsa deve girare dentro una transazione nei test.
══════════════════════════════════════════════════════════════════════════ */

export type Db = {
  query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>
}

export type SyncTrigger = "cron" | "manuale" | "webhook" | "retry" | "primo_avvio"

export type SyncSummary = {
  runId: string
  status: "ok" | "parziale" | "errore"
  read: number; created: number; updated: number; unchanged: number
  skipped: number; errors: number
  costUp: number; costDown: number; wentOos: number; backInStock: number; priceChanged: number
  durationMs: number
}

const BATCH = 500

export async function runSync(
  db: Db,
  supplier: SupplierRow,
  trigger: SyncTrigger,
  opts: { jobId?: string; signal?: AbortSignal; secretKey: string } ,
): Promise<SyncSummary> {

  /* Il lock è consultivo e legato alla connessione: se il processo muore, il
     database lo rilascia da solo. Un flag su tabella, invece, resta acceso
     per sempre dopo un OOM e blocca il fornitore fino all'intervento a mano. */
  const { rows: [lock] } = await db.query<{ ok: boolean }>(
    "select try_lock_supplier($1) as ok", [supplier.id])
  if (!lock.ok) throw new SyncBusyError(supplier.code)

  const started = Date.now()
  const { rows: [run] } = await db.query<{ id: string }>(
    `insert into sync_runs (supplier_id, job_id, trigger, status, started_at)
     values ($1,$2,$3,'in_corso', now()) returning id`,
    [supplier.id, opts.jobId ?? null, trigger])

  const log = makeLogger(db, run.id)
  const acc: SyncSummary = {
    runId: run.id, status: "ok",
    read: 0, created: 0, updated: 0, unchanged: 0, skipped: 0, errors: 0,
    costUp: 0, costDown: 0, wentOos: 0, backInStock: 0, priceChanged: 0, durationMs: 0,
  }

  try {
    const { rows: [sec] } = await db.query<{ s: Record<string, string> }>(
      "select supplier_secret($1,$2) as s", [supplier.id, opts.secretKey])

    const adapter = resolveAdapter(supplier)
    const ctx: AdapterCtx = {
      supplier, secret: sec?.s ?? {}, log,
      http: makeHttp(supplier, sec?.s ?? {}, log),
      signal: opts.signal ?? new AbortController().signal,
    }
    log.info("avvio", `Adattatore ${adapter.key}, trasporto ${supplier.transport}`)

    const rules = await loadRules(db, supplier.id)
    const seen = new Set<string>()

    for await (const page of adapter.pull(ctx)) {
      if (opts.signal?.aborted) { acc.status = "parziale"; break }
      const items: NormalizedItem[] = []

      for (const raw of page) {
        acc.read++
        let item: NormalizedItem | null = null
        try {
          item = adapter.normalize(raw, ctx)
        } catch (e) {
          acc.errors++
          log.error("mapping_ko", `Mappatura fallita: ${(e as Error).message}`, raw)
          continue
        }
        if (!item) { acc.skipped++; log.debug("scartata", "Riga senza codice o senza costo", raw); continue }
        if (seen.has(item.supplierSku)) {
          acc.skipped++
          log.warn("duplicato", `Codice ripetuto nel feed: ${item.supplierSku}`, undefined, item.supplierSku)
          continue
        }
        seen.add(item.supplierSku)
        items.push(item)
      }

      for (let i = 0; i < items.length; i += BATCH) {
        await upsertBatch(db, supplier, items.slice(i, i + BATCH), rules, run.id, acc, log)
      }
    }

    /* Ciò che non è più comparso nel feed non si cancella: si disattiva. Un
       feed troncato a metà non deve svuotare il catalogo, e una riga tornata
       la settimana dopo mantiene la sua storia di prezzo. */
    const { rows: gone } = await db.query<{ n: string }>(
      `update supplier_products set active = false
       where supplier_id = $1 and active and last_seen_at < $2
       returning 1 as n`,
      [supplier.id, new Date(started).toISOString()])
    if (gone.length) log.info("uscite", `${gone.length} offerte non più presenti nel feed: disattivate`)

    await db.query(`select refresh_primary_offers($1)`, [supplier.id]).catch(() => {
      /* La funzione è opzionale: se non c'è, il ricalcolo avviene per riga. */
    })

    if (acc.errors > 0 && acc.read > 0) acc.status = acc.errors / acc.read > 0.1 ? "errore" : "parziale"

  } catch (e) {
    acc.status = "errore"
    acc.errors++
    log.error("corsa_interrotta", (e as Error).message)
    await db.query(`update sync_runs set error_text = $2 where id = $1`, [run.id, (e as Error).message])
  } finally {
    acc.durationMs = Date.now() - started
    await db.query(
      `update sync_runs set status=$2, finished_at=now(), duration_ms=$3,
              read_count=$4, created_count=$5, updated_count=$6, unchanged_count=$7,
              skipped_count=$8, error_count=$9,
              cost_up=$10, cost_down=$11, went_oos=$12, back_in_stock=$13, price_changed=$14
       where id = $1`,
      [run.id, acc.status, acc.durationMs, acc.read, acc.created, acc.updated, acc.unchanged,
       acc.skipped, acc.errors, acc.costUp, acc.costDown, acc.wentOos, acc.backInStock, acc.priceChanged])

    await db.query(
      `update suppliers set last_run_at = now(),
              last_ok_at = case when $2 = 'ok' then now() else last_ok_at end,
              consecutive_errors = case when $2 = 'errore' then consecutive_errors + 1 else 0 end,
              state = case when $2 = 'errore' and consecutive_errors + 1 >= 3 then 'errore'::supplier_state
                           else state end
       where id = $1`, [supplier.id, acc.status])

    await log.flush()
    await db.query("select unlock_supplier($1)", [supplier.id])
  }

  return acc
}

/* ── Scrittura di un lotto ─────────────────────────────────────────────────
   Una sola andata e ritorno per lotto. L'impronta decide se la riga cambia:
   confrontarla costa un hash, riscriverla costa un WAL, un indice e un
   trigger per ognuna delle 40.000 righe. */
async function upsertBatch(
  db: Db, supplier: SupplierRow, items: NormalizedItem[],
  rules: PriceRule[], runId: string, acc: SyncSummary, log: Logger,
): Promise<void> {
  const rows = items.map(it => {
    const costNet = landedCost({
      costGross: it.costGross,
      fxRate: 1,                       // la tabella dei cambi entra qui
      costDiscountPct: supplier.costDiscountPct,
    })
    return {
      supplierSku: it.supplierSku,
      ean: it.ean ?? null,
      name: it.name,
      costGross: it.costGross,
      currency: it.currency,
      costNet,
      stock: it.stock,
      leadTimeDays: it.leadTimeDays ?? null,
      moq: it.moq ?? 1,
      packSize: it.packSize ?? 1,
      raw: it.raw,
      hash: fingerprint(it, costNet),
    }
  })

  const { rows: out } = await db.query<{
    supplier_sku: string; action: "created" | "updated" | "unchanged"
    product_id: string | null; old_cost: string | null; new_cost: string
    old_stock: number | null; new_stock: number
  }>(
    `with incoming as (select * from jsonb_to_recordset($2::jsonb) as x(
        "supplierSku" text, ean text, name text, "costGross" numeric,
        currency text, "costNet" numeric, stock int, "leadTimeDays" int,
        moq int, "packSize" int, raw jsonb, hash text)),
     before as (select supplier_sku, cost_net, stock, hash, product_id
                from supplier_products
                where supplier_id = $1
                  and supplier_sku = any(select "supplierSku" from incoming)),
     up as (
       insert into supplier_products (supplier_id, supplier_sku, ean, name_raw,
              cost_gross, currency, cost_net, stock, lead_time_days, moq, pack_size,
              raw, hash, active, last_seen_at)
       select $1, i."supplierSku", i.ean, i.name, i."costGross", i.currency,
              i."costNet", i.stock, i."leadTimeDays", i.moq, i."packSize",
              i.raw, i.hash, true, now()
       from incoming i
       on conflict (supplier_id, supplier_sku) do update set
         -- last_seen_at si aggiorna SEMPRE: serve a capire chi è sparito dal feed
         last_seen_at = now(), active = true,
         ean = excluded.ean, name_raw = excluded.name_raw,
         cost_gross = excluded.cost_gross, cost_net = excluded.cost_net,
         stock = excluded.stock, lead_time_days = excluded.lead_time_days,
         moq = excluded.moq, pack_size = excluded.pack_size,
         raw = excluded.raw, hash = excluded.hash
       where supplier_products.hash is distinct from excluded.hash
          or supplier_products.stock is distinct from excluded.stock
       returning supplier_sku, product_id, cost_net, stock)
     select i."supplierSku" as supplier_sku,
            case when b.supplier_sku is null then 'created'
                 when b.hash is distinct from i.hash or b.stock is distinct from i.stock then 'updated'
                 else 'unchanged' end as action,
            b.product_id, b.cost_net as old_cost, i."costNet" as new_cost,
            b.stock as old_stock, i.stock as new_stock
     from incoming i left join before b on b.supplier_sku = i."supplierSku"`,
    [supplier.id, JSON.stringify(rows)])

  for (const r of out) {
    if (r.action === "created") acc.created++
    else if (r.action === "updated") acc.updated++
    else { acc.unchanged++; continue }

    const oldCost = r.old_cost == null ? null : Number(r.old_cost)
    const newCost = Number(r.new_cost)
    if (oldCost != null && newCost > oldCost) acc.costUp++
    if (oldCost != null && newCost < oldCost) acc.costDown++
    if ((r.old_stock ?? 0) > 0 && r.new_stock === 0) acc.wentOos++
    if ((r.old_stock ?? 0) === 0 && r.new_stock > 0) acc.backInStock++

    /* Un costo che si muove di più di un terzo in una notte quasi sempre è
       un errore del feed, non del mercato: si segnala e si lascia decidere. */
    if (oldCost && Math.abs(newCost - oldCost) / oldCost > 0.33) {
      log.warn("salto_costo",
        `Costo da ${oldCost.toFixed(4)} a ${newCost.toFixed(4)}: verifica prima di pubblicare`,
        undefined, r.supplier_sku)
    }

    if (r.product_id) {
      const changed = await repriceProduct(db, r.product_id, supplier.id, rules, runId)
      if (changed) acc.priceChanged++
    }
  }
}

/* ── Riprezzatura di un prodotto ──────────────────────────────────────────── */
async function repriceProduct(
  db: Db, productId: string, supplierId: string, rules: PriceRule[], runId: string,
): Promise<boolean> {
  const { rows: [p] } = await db.query<{
    sku: string; category_id: string | null; brand: string | null
    cost_net: string | null; price_net: string | null; price_locked: boolean
  }>(
    `select p.sku, p.category_id, p.brand, bo.cost_net, p.price_net, p.price_locked
     from products p join v_best_offer bo on bo.product_id = p.id where p.id = $1`,
    [productId])
  if (!p) return false

  /* Il prezzo bloccato a mano non si tocca mai, nemmeno quando il costo sale:
     l'avviso è compito del cruscotto, non di questa funzione. */
  if (p.price_locked) return false

  const costNet = Number(p.cost_net)
  const res = computePrice(rules, {
    sku: p.sku, supplierId, categoryId: p.category_id, brand: p.brand,
    costNet, on: new Date().toISOString().slice(0, 10),
  })

  const oldPrice = p.price_net == null ? null : Number(p.price_net)
  if (oldPrice != null && Math.abs(oldPrice - res.priceNet) < 0.005) return false

  await db.query(
    `update products set cost_net=$2, price_net=$3, price_rule_id=$4,
            price_computed_at=now(), published = ($3 > 0), updated_at=now()
     where id=$1`,
    [productId, costNet, res.priceNet, res.ruleId])

  await db.query(
    `insert into price_changes (product_id, run_id, old_cost, new_cost, old_price, new_price, rule_id, reason)
     values ($1,$2,$3,$4,$5,$6,$7,'sync')`,
    [productId, runId, null, costNet, oldPrice, res.priceNet, res.ruleId])

  return true
}

async function loadRules(db: Db, supplierId: string): Promise<PriceRule[]> {
  const { rows } = await db.query(
    `select id, name, active, priority, supplier_id as "supplierId",
            category_id as "categoryId", brand, sku_pattern as "skuPattern",
            cost_min as "costMin", cost_max as "costMax", kind, value,
            min_margin_pct as "minMarginPct", max_price as "maxPrice", rounding,
            valid_from as "validFrom", valid_to as "validTo"
     from price_rules
     where active and (supplier_id is null or supplier_id = $1)`,
    [supplierId])
  return rows as PriceRule[]
}

/** L'impronta esclude di proposito i campi che il fornitore riscrive a ogni
    export senza che cambi niente (timestamp, contatori di visualizzazione). */
function fingerprint(it: NormalizedItem, costNet: number): string {
  return createHash("sha1").update(JSON.stringify([
    it.supplierSku, it.name, costNet, it.currency, it.ean ?? "",
    it.moq ?? 1, it.packSize ?? 1, it.leadTimeDays ?? null,
  ])).digest("hex")
}

/* ── Diario ───────────────────────────────────────────────────────────────
   Le righe si accumulano e partono in blocco: una INSERT per riga di log
   raddoppierebbe il costo della corsa. */
type Logger = ReturnType<typeof makeLogger>

function makeLogger(db: Db, runId: string) {
  let buf: unknown[][] = []
  const push = (level: string, code: string, message: string, payload?: unknown, sku?: string) => {
    buf.push([runId, level, sku ?? null, code, message, payload ? JSON.stringify(payload).slice(0, 4000) : null])
    if (buf.length >= 200) void flush()
  }
  const flush = async () => {
    if (!buf.length) return
    const rows = buf; buf = []
    const values = rows.map((_, i) =>
      `($${i * 6 + 1},$${i * 6 + 2},$${i * 6 + 3},$${i * 6 + 4},$${i * 6 + 5},$${i * 6 + 6}::jsonb)`).join(",")
    await db.query(
      `insert into sync_events (run_id, level, supplier_sku, code, message, payload) values ${values}`,
      rows.flat())
  }
  return {
    debug: (c: string, m: string, p?: unknown) => push("debug", c, m, p),
    info:  (c: string, m: string, p?: unknown) => push("info", c, m, p),
    warn:  (c: string, m: string, p?: unknown, sku?: string) => push("warn", c, m, p, sku),
    error: (c: string, m: string, p?: unknown, sku?: string) => push("error", c, m, p, sku),
    flush,
  }
}

/* ── HTTP con limite di frequenza, timeout e ritentativi ──────────────────── */
function makeHttp(supplier: SupplierRow, secret: Record<string, string>, log: Logger) {
  const minGap = 60_000 / Math.max(1, supplier.rateLimitRpm)
  let last = 0

  return async function http(url: string, init: RequestInit = {}): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      const wait = Math.max(0, last + minGap - Date.now())
      if (wait) await sleep(wait)
      last = Date.now()

      const ac = new AbortController()
      const timer = setTimeout(() => ac.abort(), supplier.timeoutMs)
      try {
        const res = await fetch(url, {
          ...init, signal: ac.signal,
          headers: { ...supplier.httpHeaders, ...authHeaders(supplier, secret), ...(init.headers ?? {}) },
        })
        /* 429 e 5xx si ritentano con attesa crescente; 4xx no: ritentare una
           credenziale sbagliata non la fa diventare giusta. */
        if ((res.status === 429 || res.status >= 500) && attempt < 3) {
          const retryAfter = Number(res.headers.get("retry-after")) * 1000
          const backoff = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 2 ** attempt * 1000
          log.warn("http_ritento", `HTTP ${res.status}, nuovo tentativo fra ${Math.round(backoff / 1000)} s`)
          await sleep(backoff)
          continue
        }
        return res
      } catch (e) {
        if (attempt >= 3) throw e
        await sleep(2 ** attempt * 1000)
      } finally {
        clearTimeout(timer)
      }
    }
  }
}

function authHeaders(supplier: SupplierRow, s: Record<string, string>): Record<string, string> {
  switch (supplier.auth) {
    case "api_key": return { [s.header ?? "X-API-Key"]: s.key }
    case "basic":   return { Authorization: "Basic " + Buffer.from(`${s.user}:${s.password}`).toString("base64") }
    case "bearer":  return { Authorization: `Bearer ${s.token}` }
    /* oauth2_cc: il token si prende una volta e si tiene in cache finché
       scade — vedi `oauth.ts`, non è compito di questa funzione. */
    default: return {}
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export class SyncBusyError extends Error {
  constructor(code: string) { super(`Sincronizzazione già in corso per ${code}`) }
}
