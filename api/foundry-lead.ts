/* ══════════════════════════════════════════════════════════════════════════
   /api/foundry-lead — Vercel Serverless Function
   Riceve il blueprint del Solution Architect e prepara due invii:
     1. Al proprietario: brief dettagliato (riepilogo leggibile + JSON grezzo).
     2. Al cliente: email HTML con l'architettura, la stima di complessità, il
        ringraziamento e la conferma "configurazione salvata, ti contatto
        entro 24 ore".

   CANALI (Vercel → Settings → Environment Variables, tutti opzionali):
     TELEGRAM_BOT_TOKEN  token di @BotFather — notifica immediata al proprietario
     TELEGRAM_CHAT_ID    chat che riceve la notifica
     RESEND_API_KEY      chiave API di https://resend.com
     LEAD_TO_EMAIL       email del proprietario che riceve il brief
     LEAD_FROM_EMAIL     mittente verificato su Resend, es. "Nadia Maar <studio@dominio.it>"

   Telegram è il canale primario: non richiede dominio né record DNS, quindi
   funziona da subito. Le email restano scritte ma DORMIENTI — senza le tre
   variabili RESEND/LEAD non parte nulla, e si accendono in seguito solo
   aggiungendole, senza toccare il codice.

   La fonte di verità resta comunque la tabella public.foundry_leads: la
   richiesta si considera persa (502) solo se NESSUN canale ha funzionato.

   NOTA DEPLOY: vercel.json instrada tutto su /index.html tramite "rewrites".
   I rewrites vengono valutati DOPO il filesystem e le funzioni serverless,
   quindi /api/foundry-lead resta raggiungibile. (Con "routes" al posto di
   "rewrites" non sarebbe così: quelle hanno la precedenza sul filesystem.)
══════════════════════════════════════════════════════════════════════════ */

import { CANVAS_BANDS, ITEMS, VECTORS, complexityOf, buildBlueprint, type VectorId } from "../src/components/foundry/modules"
import { clientIp, escTg, insertLead, oneLine, readEnv, sendTelegram, tgHandle, tooMany } from "../src/lib/leadIntake"

/* req/res tipizzati a mano: la funzione è compilata da Vercel, non dal tsc
   del progetto (tsconfig include solo src/), quindi niente @vercel/node. */
type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> }
type Res = { status: (code: number) => Res; json: (body: unknown) => void; setHeader: (k: string, v: string) => void }

type LeadModule = { id: string; node: string; tech: string; group: string; label: string }
type Shelf = { label: string; group: string; righe: { node: string; tech: string }[] }
type LeadPayload = {
  contact: { name: string; email: string; messenger: string | null }
  company?: string // honeypot
  vector: { id: string; label: string; node: string; stack: string } | null
  complexity: { label: string; weeks: string; level: number } | null
  modules: LeadModule[]
  blueprint: { obiettivo: string; architettura: string; scaffali: Shelf[] } | null
  meta?: { page?: string; locale?: string; ts?: string }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX = { name: 200, email: 200, messenger: 200, modules: 40, text: 4000 }

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function isStr(v: unknown, max = MAX.text): v is string {
  return typeof v === "string" && v.length <= max
}

/* ── Validazione ─────────────────────────────────────────────────────────────
   Il client invia SOLO identificatori. Ogni testo che finisce nelle email
   (nomi dei moduli, specifiche, obiettivo, architettura, complessità) viene
   ricostruito qui dal catalogo, così l'endpoint non può essere usato per
   spedire contenuto arbitrario da un dominio verificato. L'unico testo libero
   che sopravvive è il nome del contatto: limitato, su una riga, HTML-escapato.
──────────────────────────────────────────────────────────────────────────── */
function validate(p: unknown): { ok: true; value: LeadPayload } | { ok: false } {
  if (!p || typeof p !== "object") return { ok: false }
  const q = p as Record<string, unknown>

  const c = q.contact as Record<string, unknown> | undefined
  if (!c || typeof c !== "object") return { ok: false }
  const name = typeof c.name === "string" ? c.name.trim() : ""
  const email = typeof c.email === "string" ? c.email.trim() : ""
  const messenger = typeof c.messenger === "string" ? c.messenger.trim() : null
  if (!name || name.length > MAX.name) return { ok: false }
  if (!email || email.length > MAX.email || !EMAIL_RE.test(email)) return { ok: false }
  if (messenger && messenger.length > MAX.messenger) return { ok: false }

  const vRaw = q.vector as Record<string, unknown> | null | undefined
  const vId = vRaw && typeof vRaw.id === "string" ? vRaw.id : null
  const vec = VECTORS.find(v => v.id === vId) ?? null
  if (!vec) return { ok: false }

  if (!Array.isArray(q.modules) || q.modules.length > MAX.modules) return { ok: false }
  const ids: string[] = []
  const modules: LeadModule[] = []
  for (const m of q.modules) {
    if (!m || typeof m !== "object") return { ok: false }
    const id = (m as Record<string, unknown>).id
    if (!isStr(id, 80)) return { ok: false }
    const known = ITEMS.find(i => i.id === id)
    if (!known) return { ok: false }            // id sconosciuto → richiesta scartata
    if (ids.includes(known.id)) continue        // duplicati ignorati
    ids.push(known.id)
    modules.push({ id: known.id, node: known.node, tech: known.tech, group: known.group, label: known.label })
  }

  /* resoconto e complessità rigenerati server-side dagli stessi id */
  const bp = buildBlueprint(vec.id as VectorId, ids)
  const cx = complexityOf(vec.id as VectorId, ids)

  return {
    ok: true,
    value: {
      contact: { name, email, messenger: messenger || null },
      company: typeof q.company === "string" ? q.company : "",
      vector: { id: vec.id, label: vec.label, node: vec.node, stack: vec.stack },
      complexity: cx ? { label: cx.label, weeks: cx.weeks, level: cx.level } : null,
      modules,
      blueprint: bp ? { obiettivo: bp.obiettivo, architettura: bp.architettura, scaffali: bp.scaffali } : null,
      meta: { page: "/", locale: "it", ts: new Date().toISOString() },
    },
  }
}

/* ── Brief per il proprietario ───────────────────────────────────────────── */
function ownerBrief(p: LeadPayload) {
  return {
    tipo: "foundry-configurator-lead",
    ricevuto: new Date().toISOString(),
    contatto: p.contact,
    vettore: p.vector,
    complessita: p.complexity,
    moduli: p.modules,
    blueprint: p.blueprint,
    meta: p.meta ?? null,
  }
}

function ownerHtml(p: LeadPayload): string {
  const rows = p.modules
    .map(
      m => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #223047;font-family:'Courier New',monospace;font-size:11px;color:#8CA0B8;white-space:nowrap;vertical-align:top;">${esc(m.group).toUpperCase()}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #223047;font-size:14px;color:#FFFFFF;font-weight:700;vertical-align:top;">${esc(m.node)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #223047;font-size:13px;color:#D7DEE8;line-height:1.55;">${esc(m.tech)}</td>
      </tr>`,
    )
    .join("")

  return `
  <div style="background:#0B1120;padding:28px;font-family:Helvetica,Arial,sans-serif;color:#FFFFFF;">
    <h2 style="margin:0 0 4px;font-size:19px;">Nuova configurazione Foundry</h2>
    <p style="margin:0 0 18px;font-size:13px;color:#8CA0B8;">${esc(p.meta?.ts)} · ${esc(p.meta?.page ?? "/")}</p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
      <tr><td style="padding:2px 12px 2px 0;font-size:13px;color:#8CA0B8;">Nome</td><td style="font-size:14px;font-weight:700;">${esc(p.contact.name)}</td></tr>
      <tr><td style="padding:2px 12px 2px 0;font-size:13px;color:#8CA0B8;">Email</td><td style="font-size:14px;">${esc(p.contact.email)}</td></tr>
      <tr><td style="padding:2px 12px 2px 0;font-size:13px;color:#8CA0B8;">Messenger</td><td style="font-size:14px;">${esc(p.contact.messenger ?? "—")}</td></tr>
      <tr><td style="padding:2px 12px 2px 0;font-size:13px;color:#8CA0B8;">Nucleo</td><td style="font-size:14px;">${esc(p.vector?.label ?? "—")}</td></tr>
      <tr><td style="padding:2px 12px 2px 0;font-size:13px;color:#8CA0B8;">Complessità</td><td style="font-size:14px;">${esc(p.complexity?.label ?? "—")} · ${esc(p.complexity?.weeks ?? "—")}</td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #223047;">${rows}</table>
    <pre style="margin-top:20px;padding:14px;background:#060C18;border:1px solid #223047;border-radius:8px;font-size:11px;line-height:1.5;color:#9FB2C8;white-space:pre-wrap;word-break:break-word;">${esc(
      JSON.stringify(ownerBrief(p), null, 2),
    )}</pre>
  </div>`
}

/* ── Email HTML per il cliente ───────────────────────────────────────────── */
function clientHtml(p: LeadPayload): string {
  const name = esc(p.contact.name)
  const bp = p.blueprint

  const shelf = (label: string, inner: string) => `
    <tr><td style="padding:22px 32px 0;">
      <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;color:#F53E56;">// [ ${esc(label).toUpperCase()} ]</p>
      ${inner}
      <div style="height:1px;background:#223047;margin-top:22px;"></div>
    </td></tr>`

  const shelves = (bp?.scaffali ?? [])
    .map(s =>
      shelf(
        s.label,
        s.righe
          .map(
            r => `<p style="margin:0 0 4px;font-size:14px;color:#FFFFFF;font-weight:700;">${esc(r.node)}</p>
                  <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#C9D3E0;">${esc(r.tech)}</p>`,
          )
          .join(""),
      ),
    )
    .join("")

  return `<!doctype html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>La tua architettura — Nadia Maar</title></head>
<body style="margin:0;padding:0;background:#060C18;" bgcolor="#060C18">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060C18;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0B1120;border:1px solid #223047;border-radius:16px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;">

        <tr><td style="padding:30px 32px 0;">
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;color:#8CA0B8;">NADIA MAAR — DIGITAL FOUNDRY</p>
          <h1 style="margin:14px 0 6px;font-size:24px;line-height:1.2;color:#FFFFFF;letter-spacing:-0.5px;">La tua architettura è pronta, ${name}.</h1>
          <p style="margin:0;font-size:14px;line-height:1.65;color:#C9D3E0;">Grazie per aver composto la tua configurazione. Qui sotto trovi il resoconto ordinato di ciò che hai selezionato.</p>
          <div style="height:1px;background:#223047;margin-top:24px;"></div>
        </td></tr>

        ${p.vector ? `<tr><td style="padding:22px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#101a2c;border:1px solid #2c3a52;border-radius:12px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 3px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:2px;color:#8CA0B8;">NUCLEO</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#FFFFFF;">${esc(p.vector.node)}</p>
                <p style="margin:2px 0 0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:1.4px;color:#8CA0B8;">${esc(p.vector.stack)}</p>
              </td>
              ${p.complexity ? `<td align="right" style="padding:16px 20px;">
                <p style="margin:0 0 3px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:2px;color:#8CA0B8;">COMPLESSITÀ</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#FFFFFF;">${esc(p.complexity.label)}</p>
                <p style="margin:2px 0 0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:1.4px;color:#8CA0B8;">${esc(p.complexity.weeks)}</p>
              </td>` : ""}
            </tr>
          </table>
        </td></tr>` : ""}

        ${bp ? shelf("Obiettivo", `<p style="margin:0;font-size:14px;line-height:1.65;color:#EDF1F7;">${esc(bp.obiettivo)}</p>`) : ""}
        ${bp ? shelf("Architettura", `<p style="margin:0;font-size:14px;line-height:1.65;color:#EDF1F7;">${esc(bp.architettura)}</p>`) : ""}
        ${shelves}

        <tr><td style="padding:24px 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#101a2c;border:1px solid #2c3a52;border-radius:12px;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#10B981;">✓ &nbsp;La tua configurazione è stata salvata con successo.</p>
              <p style="margin:0;font-size:13px;line-height:1.65;color:#C9D3E0;">
                Ti ricontattiamo entro <strong style="color:#FFFFFF;">24 ore</strong> per discutere i dettagli del progetto: ogni configurazione viene letta personalmente, e la risposta include una valutazione tecnica e i passi successivi.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:16px 32px 0;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#8CA0B8;font-style:italic;">Complessità e durata sono una stima tecnica preliminare, basata sui moduli selezionati. Il perimetro definitivo si stabilisce dopo l'analisi dei processi e dei sistemi esistenti.</p>
        </td></tr>

        <tr><td style="padding:20px 32px 30px;">
          <p style="margin:0 0 2px;font-size:14px;color:#FFFFFF;font-weight:700;">Nadia Maar</p>
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;color:#8CA0B8;">DIGITAL FOUNDRY · DEVELOPMENT &amp; GROWTH</p>
        </td></tr>

      </table>
      <p style="margin:16px 0 0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:1px;color:#5C6E84;">NESSUNA NEWSLETTER · SOLO LA RISPOSTA AL TUO PROGETTO</p>
    </td></tr>
  </table>
</body>
</html>`
}

/* ── Invio via Resend (REST, nessun SDK) ─────────────────────────────────── */
async function send(apiKey: string, msg: { from: string; to: string; subject: string; html: string; replyTo?: string }) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: msg.from,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
    }),
  })
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`)
}

/* ── Notifica Telegram (canale primario) ─────────────────────────────────────
   Nessun dominio, nessun record DNS, nessuna cartella spam: per avvisare il
   proprietario è la via più corta. Il contenuto è lo stesso brief delle email,
   compresso in un messaggio leggibile dal telefono. */

const GROUP_LABEL: Record<string, string> = Object.fromEntries(
  CANVAS_BANDS.map(b => [b.id, b.label]),
)

/* Un messaggio non può superare i 4096 caratteri. Invece di tagliare il testo
   finito — cosa che spezzerebbe un tag HTML a metà e farebbe fallire l'invio —
   si limita il numero di righe, l'unica parte che può crescere davvero. */
const TG_MAX_ROWS = 25

function telegramText(p: LeadPayload): string {
  const c = p.contact
  const L: string[] = ["<b>Nuova configurazione Foundry</b>", ""]

  L.push(`<b>${escTg(c.name)}</b>`)
  L.push(`<a href="mailto:${encodeURIComponent(c.email)}">${escTg(c.email)}</a>`)
  if (c.messenger) {
    /* uno @handle diventa un link tappabile: si risponde senza copiare nulla */
    L.push(/^@[A-Za-z0-9_]{4,32}$/.test(c.messenger)
      ? `<a href="https://t.me/${c.messenger.slice(1)}">${escTg(c.messenger)}</a>`
      : escTg(c.messenger))
  }

  L.push("")
  if (p.vector) L.push(`Nucleo · <b>${escTg(p.vector.node)}</b>`)
  if (p.complexity) L.push(`Complessità · <b>${escTg(p.complexity.label)}</b> (${escTg(p.complexity.weeks)})`)

  if (p.modules.length) {
    L.push("", `<b>Moduli (${p.modules.length})</b>`)
    for (const m of p.modules.slice(0, TG_MAX_ROWS)) {
      L.push(`• ${escTg(m.node)} <i>${escTg(GROUP_LABEL[m.group] ?? m.group)}</i>`)
    }
    const rest = p.modules.length - TG_MAX_ROWS
    if (rest > 0) L.push(`<i>…e altri ${rest}. Il dettaglio completo è in area admin.</i>`)
  }

  return L.join("\n")
}

/* ── Handler ─────────────────────────────────────────────────────────────── */
/**
 * L'interruttore /foundry vale anche qui, non solo sulla facciata.
 *
 * Il sito è a rendering client: nascondere il configuratore ferma chi lo
 * apre con un browser, non chi conosce già l'indirizzo di questa funzione.
 * Se spegnere /foundry significa «non voglio ricevere configurazioni»,
 * allora deve essere il server a rifiutarle.
 *
 * In caso di dubbio si accetta: un errore di rete verso il database non
 * deve trasformarsi in una richiesta di lavoro persa.
 */
async function foundryDisabled(): Promise<boolean> {
  const env = readEnv()
  const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
  const key = env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return false
  try {
    const r = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/public_site_settings?select=foundry_enabled&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
    })
    if (!r.ok) return false
    const rows = (await r.json()) as { foundry_enabled?: boolean }[]
    return rows?.[0]?.foundry_enabled === false
  } catch {
    return false
  }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    res.status(405).json({ ok: false, error: "method_not_allowed" })
    return
  }

  if (await foundryDisabled()) {
    res.status(503).json({ ok: false, error: "foundry_disabled" })
    return
  }

  let raw: unknown
  try {
    raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body
  } catch {
    res.status(400).json({ ok: false, error: "invalid_json" })
    return
  }

  /* honeypot: campo nascosto compilato = bot. Rispondiamo 200 senza inviare
     nulla, così il bot non capisce di essere stato scartato. */
  if (raw && typeof raw === "object" && typeof (raw as { company?: unknown }).company === "string"
      && (raw as { company: string }).company.trim() !== "") {
    res.status(200).json({ ok: true, delivered: false })
    return
  }

  if (tooMany(clientIp(req.headers))) {
    res.status(429).json({ ok: false, error: "too_many_requests" })
    return
  }

  const checked = validate(raw)
  if (!checked.ok) {
    res.status(400).json({ ok: false, error: "invalid_payload" })
    return
  }
  const p = checked.value

  const env = readEnv()
  const apiKey  = env.RESEND_API_KEY
  const toOwner = env.LEAD_TO_EMAIL
  const from    = env.LEAD_FROM_EMAIL
  const canMail = Boolean(apiKey && toOwner && from)

  const tgToken   = env.TELEGRAM_BOT_TOKEN
  const tgChat    = env.TELEGRAM_CHAT_ID
  const canNotify = Boolean(tgToken && tgChat)

  /* ─ 1. Telegram (canale primario) ──────────────────────────────────────
     Primo perché è il più veloce e il più affidabile dei tre: se qualcosa
     più avanti va storto, l'avviso è comunque già partito. */
  let notified = false
  if (canNotify) {
    try {
      await sendTelegram(tgToken!, tgChat!, telegramText(p))
      notified = true
    } catch (err) {
      console.error("[foundry-lead] notifica Telegram fallita:", err)
    }
  }

  /* ─ 2. Email (dormienti finché non configurate) ────────────────────────
     Partono prima del salvataggio, così la riga in database registra
     l'esito reale dell'invio. Un fallimento qui NON è fatale: ciò che
     conta è che la richiesta venga archiviata. */
  let ownerMailed = false
  let clientCopy  = false
  if (canMail) {
    const n = p.modules.length
    try {
      await send(apiKey!, {
        from: from!, to: toOwner!, replyTo: p.contact.email,
        subject: oneLine(`[Foundry] ${p.contact.name} — ${p.vector?.node ?? "senza nucleo"} (${n} ${n === 1 ? "modulo" : "moduli"})`),
        html: ownerHtml(p),
      })
      ownerMailed = true
    } catch (err) {
      console.error("[foundry-lead] invio al proprietario fallito:", err)
    }
    try {
      await send(apiKey!, {
        from: from!, to: p.contact.email,
        subject: "La tua architettura è pronta — Nadia Maar · Digital Foundry",
        html: clientHtml(p),
      })
      clientCopy = true
    } catch (err) {
      console.error("[foundry-lead] copia al cliente fallita:", err)
    }
  }

  /* ─ 3. Salvataggio (fonte di verità) ──────────────────────────────────── */
  let stored = false
  try {
    stored = await insertLead({
      name: p.contact.name,
      email: p.contact.email,
      messenger: p.contact.messenger,
      vector_id: p.vector?.id ?? null,
      vector_label: p.vector?.label ?? null,
      vector_node: p.vector?.node ?? null,
      vector_stack: p.vector?.stack ?? null,
      complexity: p.complexity?.label ?? null,
      weeks: p.complexity?.weeks ?? null,
      level: p.complexity?.level ?? null,
      module_ids: p.modules.map(m => m.id),
      modules: p.modules.map(m => ({ node: m.node, tech: m.tech, group: m.group, label: m.label })),
      blueprint: p.blueprint,
      page: p.meta?.page ?? null,
      email_sent: clientCopy,
      source: "configuratore",
    })
  } catch (err) {
    console.error("[foundry-lead] salvataggio su Supabase fallito:", err)
  }

  /* Nessun canale ha funzionato: la richiesta andrebbe persa in silenzio.
     Meglio un errore esplicito — l'utente riprova o scrive dai contatti. */
  if (!stored && !ownerMailed && !notified) {
    console.error("[foundry-lead] richiesta NON archiviata — brief:", JSON.stringify(ownerBrief(p)))
    res.status(502).json({ ok: false, error: "not_stored" })
    return
  }

  res.status(200).json({ ok: true, delivered: true, stored, notified, clientCopy })
}
