/* ══════════════════════════════════════════════════════════════════════════
   /api/notify — Vercel Serverless Function

   Il campanello dell'area clienti. Fino a qui nessuna azione dentro il
   portale raggiungeva nessuno: il cliente apriva una richiesta, approvava un
   preventivo o dichiarava un pagamento, e lo studio lo scopriva solo
   riaprendo la dashboard.

   Chi chiama non è il browser ma il database: i trigger della migrazione
   portal_16 fanno `net.http_post` qui a ogni evento. Questo è voluto — una
   chiamata dal client si potrebbe saltare disabilitando JavaScript o
   chiudendo la scheda a metà, mentre il trigger è legato al fatto che la
   riga esista davvero.

   CONFIGURAZIONE (Vercel → Settings → Environment Variables):
     TELEGRAM_BOT_TOKEN  token di @BotFather
     TELEGRAM_CHAT_ID    chat che riceve
     NOTIFY_SECRET       stessa stringa salvata nel Vault di Supabase

   Senza NOTIFY_SECRET l'endpoint rifiuta tutto: meglio muto che aperto a
   chiunque conosca l'URL.
══════════════════════════════════════════════════════════════════════════ */

import { escTg, readEnv, sendTelegram } from "../src/lib/leadIntake"

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> }
type Res = { status: (code: number) => Res; json: (body: unknown) => void; setHeader: (k: string, v: string) => void }

/** Ogni evento che il database sa segnalare, con la sua riga di testo. */
type Event =
  | "request_new" | "estimate_accepted" | "payment_declared"
  | "stage_approved" | "stage_changes" | "message_new" | "project_new"

const TITLE: Record<Event, string> = {
  request_new:       "🆕 Nuova richiesta",
  estimate_accepted: "✅ Preventivo approvato",
  payment_declared:  "💶 Pagamento dichiarato",
  stage_approved:    "👍 Fase approvata",
  stage_changes:     "✋ Modifiche richieste",
  message_new:       "💬 Nuovo messaggio",
  project_new:       "📁 Nuovo progetto",
}

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "")

function header(h: Req["headers"], k: string): string {
  const v = h[k] ?? h[k.toLowerCase()]
  return Array.isArray(v) ? v[0] ?? "" : v ?? ""
}

/** Confronto a tempo costante: un `===` su una stringa esce al primo byte
 *  diverso e lascia misurare il segreto un carattere alla volta. */
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    res.status(405).json({ error: "method_not_allowed" })
    return
  }

  const env = readEnv()
  const secret = env.NOTIFY_SECRET
  if (!secret) {
    /* Non configurato = non attivo. Rispondiamo 204 e non 500 perché a
       chiamare è un trigger: un errore ripetuto riempirebbe la coda di
       pg_net senza che nessuno lo veda. */
    res.status(204).json({ ok: false, reason: "not_configured" })
    return
  }
  if (!sameSecret(header(req.headers, "x-notify-secret"), secret)) {
    res.status(401).json({ error: "unauthorized" })
    return
  }

  const body = (typeof req.body === "string" ? safeParse(req.body) : req.body) as Record<string, unknown> | null
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "bad_request" })
    return
  }

  const event = str(body.event, 40) as Event
  if (!(event in TITLE)) {
    res.status(400).json({ error: "unknown_event" })
    return
  }

  const client = str(body.client, 120)
  const subject = str(body.subject, 160)
  const detail = str(body.detail, 400)

  const lines = [
    `<b>${escTg(TITLE[event])}</b>`,
    client ? `Cliente: ${escTg(client)}` : "",
    subject ? `${escTg(subject)}` : "",
    detail ? `\n${escTg(detail)}` : "",
  ].filter(Boolean)

  const token = env.TELEGRAM_BOT_TOKEN
  const chat = env.TELEGRAM_CHAT_ID
  if (!token || !chat) {
    res.status(204).json({ ok: false, reason: "telegram_not_configured" })
    return
  }

  try {
    await sendTelegram(token, chat, lines.join("\n"))
    res.status(200).json({ ok: true })
  } catch {
    /* Il messaggio è perso, ma il dato è già salvo nel database: non è un
       errore che valga la pena rimettere in coda. */
    res.status(204).json({ ok: false, reason: "send_failed" })
  }
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s) } catch { return null }
}
