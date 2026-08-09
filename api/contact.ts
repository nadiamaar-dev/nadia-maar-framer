/* ══════════════════════════════════════════════════════════════════════════
   /api/contact — Vercel Serverless Function
   Riceve le richieste dal modulo contatti: quello della pagina /contatti e
   quello dei modali sparsi nel sito.

   Prima di questo endpoint i moduli non spedivano niente: il submit faceva
   `e.preventDefault(); setSent(true)` e mostrava il ringraziamento. Chi
   scriveva era convinto di aver contattato lo studio, e il messaggio non
   arrivava da nessuna parte.

   Le richieste finiscono nella stessa tabella dei lead del configuratore,
   distinte da source='contatti': una sola posta in arrivo, in area admin
   sotto "Richieste".

   CONFIGURAZIONE (Vercel → Settings → Environment Variables):
     TELEGRAM_BOT_TOKEN  notifica immediata
     TELEGRAM_CHAT_ID    chat che la riceve
   Senza, la richiesta viene comunque archiviata: il database è la fonte
   di verità, Telegram è solo il campanello.
══════════════════════════════════════════════════════════════════════════ */

import { clientIp, escTg, insertLead, readEnv, sendTelegram, tgHandle, tooMany } from "../src/lib/leadIntake.js"

/* req/res tipizzati a mano: la funzione è compilata da Vercel, non dal tsc
   del progetto (tsconfig include solo src/), quindi niente @vercel/node. */
type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> }
type Res = { status: (code: number) => Res; json: (body: unknown) => void; setHeader: (k: string, v: string) => void }

type Payload = {
  name: string
  email: string
  company: string | null
  message: string
  page: string | null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX = { name: 200, email: 200, company: 200, message: 4000, page: 200 }

function validate(p: unknown): { ok: true; value: Payload } | { ok: false } {
  if (!p || typeof p !== "object") return { ok: false }
  const q = p as Record<string, unknown>

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")
  const name = str(q.name)
  const email = str(q.email)
  const company = str(q.company)
  const message = str(q.message)

  if (!name || name.length > MAX.name) return { ok: false }
  if (!email || email.length > MAX.email || !EMAIL_RE.test(email)) return { ok: false }
  if (company.length > MAX.company) return { ok: false }
  /* il messaggio è il motivo per cui esiste il modulo: senza, la richiesta
     non è utile a nessuno e la si scarta invece di archiviare un vuoto */
  if (message.length < 10 || message.length > MAX.message) return { ok: false }

  return {
    ok: true,
    value: { name, email, company: company || null, message, page: str(q.page).slice(0, MAX.page) || null },
  }
}

function telegramText(p: Payload): string {
  const L: string[] = ["<b>Nuova richiesta dal modulo contatti</b>", ""]
  L.push(`<b>${escTg(p.name)}</b>`)
  L.push(`<a href="mailto:${encodeURIComponent(p.email)}">${escTg(p.email)}</a>`)
  if (p.company) L.push(tgHandle(p.company))
  if (p.page) L.push(`<i>da ${escTg(p.page)}</i>`)
  L.push("", escTg(p.message))
  return L.join("\n")
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    res.status(405).json({ ok: false, error: "method_not_allowed" })
    return
  }

  let raw: unknown
  try {
    raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body
  } catch {
    res.status(400).json({ ok: false, error: "invalid_json" })
    return
  }

  /* honeypot: campo nascosto compilato = bot. Rispondiamo 200 senza fare
     nulla, così il bot non capisce di essere stato scartato. */
  if (raw && typeof raw === "object" && typeof (raw as { website?: unknown }).website === "string"
      && (raw as { website: string }).website.trim() !== "") {
    res.status(200).json({ ok: true })
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
  const tgToken = env.TELEGRAM_BOT_TOKEN
  const tgChat = env.TELEGRAM_CHAT_ID

  /* ─ 1. Campanello ─────────────────────────────────────────────────────── */
  let notified = false
  if (tgToken && tgChat) {
    try {
      await sendTelegram(tgToken, tgChat, telegramText(p))
      notified = true
    } catch (err) {
      console.error("[contact] notifica Telegram fallita:", err)
    }
  }

  /* ─ 2. Archiviazione (fonte di verità) ────────────────────────────────── */
  let stored = false
  try {
    stored = await insertLead({
      name: p.name,
      email: p.email,
      company: p.company,
      message: p.message,
      page: p.page,
      source: "contatti",
    })
  } catch (err) {
    console.error("[contact] salvataggio su Supabase fallito:", err)
  }

  /* Nessun canale ha funzionato: meglio un errore esplicito che un
     ringraziamento per un messaggio che non è arrivato a nessuno. */
  if (!stored && !notified) {
    console.error("[contact] richiesta NON archiviata:", JSON.stringify({ ...p, message: p.message.slice(0, 200) }))
    res.status(502).json({ ok: false, error: "not_stored" })
    return
  }

  res.status(200).json({ ok: true, stored, notified })
}
