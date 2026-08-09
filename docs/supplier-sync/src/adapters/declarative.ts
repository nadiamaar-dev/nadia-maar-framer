import type {
  AdapterCtx, FieldMap, FieldSpec, NormalizedItem, ProbeResult,
  RawItem, SupplierAdapter, Transform, Transport,
} from "./types"

/* ══════════════════════════════════════════════════════════════════════════
   ADATTATORE DICHIARATIVO
   Copre il caso normale: un endpoint che restituisce un array di oggetti,
   con nomi di campo diversi dai nostri. Non c'è niente da scrivere in
   TypeScript — la differenza fra un fornitore e l'altro sta in `field_map`,
   che è una colonna JSONB modificabile dal pannello.

   Un modulo dedicato (vedi `bespoke/`) serve solo quando il fornitore fa
   qualcosa che una mappatura non esprime: paginazione a cursore firmato,
   listino e giacenze su due chiamate da riconciliare, SOAP con envelope.
══════════════════════════════════════════════════════════════════════════ */

/** "data.items.0.price" senza dipendenze e senza eval. */
function get(obj: unknown, path: string): unknown {
  if (!path) return obj
  let cur: any = obj
  for (const key of path.split(".")) {
    if (cur == null) return undefined
    cur = Array.isArray(cur) && /^\d+$/.test(key) ? cur[Number(key)] : cur[key]
  }
  return cur
}

function applyTransform(v: unknown, t: Transform): unknown {
  if (t.startsWith("default:")) return v == null || v === "" ? t.slice(8) : v
  if (t.startsWith("multiply:")) return Number(v) * Number(t.slice(9))
  if (t.startsWith("split:")) return String(v ?? "").split(t.slice(6)).map(s => s.trim()).filter(Boolean)
  if (t.startsWith("strip:")) return String(v ?? "").replace(new RegExp("^" + t.slice(6)), "")
  switch (t) {
    case "trim":  return String(v ?? "").trim()
    case "upper": return String(v ?? "").toUpperCase()
    case "lower": return String(v ?? "").toLowerCase()
    case "int":   return Math.trunc(Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0)
    case "number": return Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0
    /* Il fornitore tedesco manda "1.234,56": il punto è il separatore delle
       migliaia. Trattarlo come decimale sposta il costo di tre ordini di
       grandezza, e in silenzio. */
    case "comma_decimal":
      return Number(String(v ?? "").replace(/\./g, "").replace(",", ".")) || 0
    case "bool":
      return ["1", "s", "si", "sì", "y", "yes", "true", "t"].includes(String(v ?? "").toLowerCase())
    default: return v
  }
}

function read(raw: RawItem, spec: FieldSpec | undefined): unknown {
  if (spec == null) return undefined
  if (typeof spec === "string") return get(raw, spec)
  const [path, ...chain] = spec
  return chain.reduce<unknown>((v, t) => applyTransform(v, t), get(raw, path))
}

export function normalizeWith(map: FieldMap, raw: RawItem, currency: string): NormalizedItem | null {
  for (const rule of map.skipWhen ?? []) {
    const v = get(raw, rule.path)
    if (rule.empty && (v == null || v === "")) return null
    if ("equals" in rule && v === rule.equals) return null
  }

  const f = map.fields ?? {}
  const supplierSku = String(read(raw, f.supplierSku) ?? "").trim()
  const costGross = Number(read(raw, f.costGross) ?? NaN)

  /* Due sole condizioni non negoziabili: senza codice la riga non si può
     abbinare, senza costo non si può prezzare. Tutto il resto ha un valore
     di ripiego ragionevole. */
  if (!supplierSku) return null
  if (!Number.isFinite(costGross) || costGross < 0) return null

  return {
    supplierSku,
    name: String(read(raw, f.name) ?? supplierSku).trim(),
    costGross,
    currency: String(read(raw, f.currency) ?? currency).toUpperCase(),
    stock: Math.max(0, Math.trunc(Number(read(raw, f.stock) ?? 0)) || 0),
    ean: (read(raw, f.ean) as string) || undefined,
    brand: (read(raw, f.brand) as string) || undefined,
    categoryPath: (read(raw, f.categoryPath) as string[]) || undefined,
    leadTimeDays: Number(read(raw, f.leadTimeDays)) || undefined,
    moq: Number(read(raw, f.moq)) || undefined,
    packSize: Number(read(raw, f.packSize)) || undefined,
    raw,
  }
}

/* ── REST JSON, paginato ─────────────────────────────────────────────────── */
export const restJsonAdapter: SupplierAdapter = {
  key: "declarative:rest_json",
  transport: "rest_json",

  async probe(ctx): Promise<ProbeResult> {
    const t0 = Date.now()
    const url = pageUrl(ctx, 1, 5)
    const res = await ctx.http(url)
    const latencyMs = Date.now() - t0
    if (!res.ok) {
      return { ok: false, latencyMs, message: `HTTP ${res.status} su ${redact(url)}` }
    }
    const body = await res.json()
    const rows = asArray(get(body, ctx.supplier.fieldMap.items ?? ""))
    const sample = rows.slice(0, 3)
      .map(r => normalizeWith(ctx.supplier.fieldMap, r as RawItem, ctx.supplier.currency))
      .filter((x): x is NormalizedItem => x !== null)

    return {
      ok: sample.length > 0,
      latencyMs,
      declared: Number(get(body, "total")) || undefined,
      sample,
      message: sample.length
        ? `Connessione riuscita: ${rows.length} righe lette, ${sample.length} mappate.`
        : `Risposta ricevuta ma nessuna riga mappata: controlla «items» e «supplierSku» nella mappatura.`,
    }
  },

  async *pull(ctx) {
    const size = ctx.supplier.pageSize
    for (let page = 1; ; page++) {
      if (ctx.signal.aborted) return
      const res = await ctx.http(pageUrl(ctx, page, size))
      if (!res.ok) throw new Error(`HTTP ${res.status} alla pagina ${page}`)
      const rows = asArray(get(await res.json(), ctx.supplier.fieldMap.items ?? "")) as RawItem[]
      if (!rows.length) return
      yield rows
      /* Una pagina corta è l'ultima: nessun fornitore è d'accordo su come
         dire "non c'è altro", una pagina non piena lo dice sempre. */
      if (rows.length < size) return
      /* Cintura di sicurezza contro un endpoint che ignora la paginazione e
         restituisce sempre la stessa pagina: la corsa non deve girare a vuoto. */
      if (page > 2000) throw new Error("Troppe pagine: la paginazione non avanza")
    }
  },

  normalize(raw, ctx) {
    return normalizeWith(ctx.supplier.fieldMap, raw, ctx.supplier.currency)
  },
}

function pageUrl(ctx: AdapterCtx, page: number, size: number): string {
  const base = `${ctx.supplier.baseUrl ?? ""}${ctx.supplier.catalogPath ?? ""}`
  const u = new URL(base)
  u.searchParams.set("page", String(page))
  u.searchParams.set("limit", String(size))
  return u.toString()
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : []
}

/** Nei log l'URL non porta mai una chiave in query string. */
function redact(url: string): string {
  return url.replace(/([?&](api[_-]?key|token|secret|password)=)[^&]+/gi, "$1•••")
}

/* ── Feed XML e CSV ──────────────────────────────────────────────────────────
   Cambia solo il modo di ottenere le righe: la normalizzazione è la stessa,
   il che è esattamente il punto dell'astrazione. */

export const feedXmlAdapter: SupplierAdapter = {
  key: "declarative:feed_xml",
  transport: "feed_xml",
  probe: makeFeedProbe(parseXmlRows),
  async *pull(ctx) {
    const res = await ctx.http(`${ctx.supplier.baseUrl}${ctx.supplier.catalogPath ?? ""}`)
    if (!res.ok) throw new Error(`HTTP ${res.status} sul feed`)
    const rows = parseXmlRows(await res.text(), ctx.supplier.fieldMap)
    for (let i = 0; i < rows.length; i += ctx.supplier.pageSize) {
      yield rows.slice(i, i + ctx.supplier.pageSize)
    }
  },
  normalize: (raw, ctx) => normalizeWith(ctx.supplier.fieldMap, raw, ctx.supplier.currency),
}

export const feedCsvAdapter: SupplierAdapter = {
  key: "declarative:feed_csv",
  transport: "feed_csv",
  probe: makeFeedProbe(parseCsvRows),
  async *pull(ctx) {
    const res = await ctx.http(`${ctx.supplier.baseUrl}${ctx.supplier.catalogPath ?? ""}`)
    if (!res.ok) throw new Error(`HTTP ${res.status} sul feed`)
    const rows = parseCsvRows(await res.text(), ctx.supplier.fieldMap)
    for (let i = 0; i < rows.length; i += ctx.supplier.pageSize) {
      yield rows.slice(i, i + ctx.supplier.pageSize)
    }
  },
  normalize: (raw, ctx) => normalizeWith(ctx.supplier.fieldMap, raw, ctx.supplier.currency),
}

function makeFeedProbe(parse: (text: string, map: FieldMap) => RawItem[]) {
  return async (ctx: AdapterCtx): Promise<ProbeResult> => {
    const t0 = Date.now()
    const res = await ctx.http(`${ctx.supplier.baseUrl}${ctx.supplier.catalogPath ?? ""}`)
    const latencyMs = Date.now() - t0
    if (!res.ok) return { ok: false, latencyMs, message: `HTTP ${res.status} sul feed` }
    const rows = parse(await res.text(), ctx.supplier.fieldMap)
    const sample = rows.slice(0, 3)
      .map(r => normalizeWith(ctx.supplier.fieldMap, r, ctx.supplier.currency))
      .filter((x): x is NormalizedItem => x !== null)
    return {
      ok: sample.length > 0, latencyMs, declared: rows.length, sample,
      message: `Feed letto: ${rows.length} righe, ${sample.length} mappate sul campione.`,
    }
  }
}

/* Il parser XML vero è una dipendenza (fast-xml-parser): qui resta il punto
   di innesto, perché è l'unica riga che cambia fra un feed e l'altro. */
declare function parseXml(text: string): unknown
function parseXmlRows(text: string, map: FieldMap): RawItem[] {
  const doc = parseXml(text)
  return asArray(get(doc, map.itemNode ?? map.items ?? "")) as RawItem[]
}

/** CSV con intestazione. Separatore dedotto dalla prima riga: mezza Italia
    esporta con il punto e virgola perché la virgola è già nei decimali. */
function parseCsvRows(text: string, _map: FieldMap): RawItem[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (!lines.length) return []
  const sep = (lines[0].match(/;/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? ";" : ","
  const head = splitCsvLine(lines[0], sep)
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line, sep)
    const row: RawItem = {}
    head.forEach((h, i) => { row[h.trim()] = cells[i] })
    return row
  })
}

function splitCsvLine(line: string, sep: string): string[] {
  const out: string[] = []
  let cur = "", quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') quoted = false
      else cur += ch
    } else if (ch === '"') quoted = true
    else if (ch === sep) { out.push(cur); cur = "" }
    else cur += ch
  }
  out.push(cur)
  return out
}
