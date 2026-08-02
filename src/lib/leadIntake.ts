/* ══════════════════════════════════════════════════════════════════════════
   INTAKE DELLE RICHIESTE — parti comuni alle funzioni serverless
   Usato da api/foundry-lead.ts e api/contact.ts. Prima esisteva una sola
   funzione e tutto stava dentro; con la seconda, freno anti-flood e invio
   Telegram sarebbero diventati due copie destinate a divergere.

   Nessun SDK e nessuna API del browser: solo fetch e process.env letto da
   globalThis, così il file resta compilabile dal builder di Vercel.
══════════════════════════════════════════════════════════════════════════ */

/** letto da globalThis: il file resta type-checkabile senza @types/node */
export function readEnv(): Record<string, string | undefined> {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
}

/** Elimina CR/LF: un subject con a capo permetterebbe di iniettare header. */
export function oneLine(s: string, max = 160): string {
  return s.replace(/[\r\n]+/g, " ").trim().slice(0, max)
}

/** Telegram accetta solo &, <, > come entità: le altre non sono garantite. */
export function escTg(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Uno @handle diventa un link tappabile: si risponde senza copiare nulla. */
export function tgHandle(v: string): string {
  return /^@[A-Za-z0-9_]{4,32}$/.test(v) ? `<a href="https://t.me/${v.slice(1)}">${escTg(v)}</a>` : escTg(v)
}

export async function sendTelegram(token: string, chatId: string, text: string) {
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  })
  /* Telegram sa rispondere 200 con ok:false (es. parse_mode non valido):
     controllare solo lo stato HTTP lascerebbe passare un invio fallito. */
  const body = (await r.json().catch(() => null)) as { ok?: boolean; description?: string } | null
  if (!r.ok || body?.ok === false) throw new Error(`Telegram ${r.status}: ${body?.description ?? "errore sconosciuto"}`)
}

/* ── Salvataggio su Supabase (PostgREST, nessun SDK) ─────────────────────────
   Scrive con la chiave anon: la policy fl_anon_insert consente solo INSERT su
   public.foundry_leads, quindi anche se la chiave è pubblica non si può
   rileggere né modificare nulla. Nessuna service-role key sul server. */
export async function insertLead(row: Record<string, unknown>): Promise<boolean> {
  const env = readEnv()
  const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
  const key = env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return false

  const r = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/foundry_leads`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  })
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`)
  return true
}

/* ── Freno anti-flood ────────────────────────────────────────────────────────
   In memoria: le istanze serverless sono effimere e più d'una può essere viva,
   quindi non è una garanzia — è un freno a mano contro gli invii ripetuti dallo
   stesso IP. Per un limite reale serve uno store condiviso (KV/Upstash). */
const HITS = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 5

export function tooMany(ip: string): boolean {
  const now = Date.now()
  const seen = (HITS.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  seen.push(now)
  HITS.set(ip, seen)
  if (HITS.size > 500) for (const [k, v] of HITS) if (!v.some(t => now - t < WINDOW_MS)) HITS.delete(k)
  return seen.length > MAX_HITS
}

export function clientIp(headers: Record<string, string | string[] | undefined>): string {
  const f = headers["x-forwarded-for"]
  const raw = Array.isArray(f) ? f[0] : f
  return (raw ?? "").split(",")[0].trim() || "unknown"
}
