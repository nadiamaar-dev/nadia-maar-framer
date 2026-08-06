/* ══════════════════════════════════════════════════════════════════════════
   PEZZI COMUNI DELLE FUNZIONI SERVERLESS.

   robots.txt, sitemap.xml, llms.txt, /api/track e /api/prerender hanno tutti
   bisogno delle stesse tre cose: leggere PostgREST senza portarsi dietro
   supabase-js (che in una funzione serverless è peso e cold start inutili),
   sapere su quale dominio stanno rispondendo, e riconoscere un bot.

   Questo file NON è nel bundle del sito: lo importano solo le funzioni in
   api/, che Vercel compila per conto suo.
══════════════════════════════════════════════════════════════════════════ */

export type EdgeReq = {
  method?: string
  url?: string
  body?: unknown
  query?: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
}
export type EdgeRes = {
  status: (code: number) => EdgeRes
  json: (body: unknown) => void
  send: (body: string) => void
  setHeader: (k: string, v: string) => void
  end: () => void
}

export function header(req: EdgeReq, name: string): string {
  const v = req.headers[name] ?? req.headers[name.toLowerCase()]
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "")
}

/* `process` non è tipizzato: il tsconfig del progetto copre src/ per il
   browser, e le funzioni in api/ le compila Vercel per conto suo. Stessa
   soluzione già usata da leadIntake.ts — leggere l'ambiente da globalThis
   invece di aggiungere @types/node a un bundle che non ne ha bisogno. */
export function env(name: string): string {
  const p = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  return p?.env?.[name] ?? ""
}

/** Le variabili del sito sono prefissate VITE_ perché servono anche al
 *  browser; su Vercel esistono comunque anche lato server. */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = env("VITE_SUPABASE_URL") || env("SUPABASE_URL")
  const key = env("VITE_SUPABASE_ANON_KEY") || env("SUPABASE_ANON_KEY")
  return url && key ? { url: url.replace(/\/+$/, ""), key } : null
}

/** SELECT su PostgREST. Torna [] su qualunque intoppo: una sitemap parziale
 *  è meglio di un 500, che Google interpreta come «sito rotto». */
export async function pgSelect<T = Record<string, unknown>>(path: string): Promise<T[]> {
  const env = supabaseEnv()
  if (!env) return []
  try {
    const r = await fetch(`${env.url}/rest/v1/${path}`, {
      headers: { apikey: env.key, authorization: `Bearer ${env.key}`, accept: "application/json" },
    })
    if (!r.ok) return []
    return (await r.json()) as T[]
  } catch {
    return []
  }
}

export async function pgInsert(table: string, row: Record<string, unknown>): Promise<boolean> {
  const env = supabaseEnv()
  if (!env) return false
  try {
    const r = await fetch(`${env.url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: env.key, authorization: `Bearer ${env.key}`,
        "content-type": "application/json", prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    })
    return r.ok
  } catch {
    return false
  }
}

/** Origine pubblica su cui stiamo rispondendo. `SITE_URL` ha la precedenza
 *  perché su Vercel l'host di una preview non è il dominio del sito, e una
 *  sitemap che elenca URL di preview è peggio di nessuna sitemap. */
export function originOf(req: EdgeReq): string {
  const explicit = env("SITE_URL").replace(/\/+$/, "")
  if (explicit) return explicit.startsWith("http") ? explicit : `https://${explicit}`
  const host = header(req, "x-forwarded-host") || header(req, "host") || "nadiamaar.com"
  const proto = header(req, "x-forwarded-proto") || "https"
  return `${proto}://${host}`
}

const BOT_RE = /(bot|crawler|spider|crawl|slurp|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator|whatsapp|telegram|discord|linkedinbot|gptbot|claudebot|claude-web|perplexitybot|ccbot|anthropic|google-extended|applebot|bingpreview)/i

export function isBot(ua: string): boolean {
  return BOT_RE.test(ua)
}

export function deviceOf(ua: string): "mobile" | "tablet" | "desktop" | "bot" {
  if (isBot(ua)) return "bot"
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet"
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return "mobile"
  return "desktop"
}

export function clientIpOf(req: EdgeReq): string {
  const fwd = header(req, "x-forwarded-for")
  return (fwd.split(",")[0] || header(req, "x-real-ip") || "").trim()
}

/**
 * Impronta dell'IP, non l'IP. Il sale sta in una variabile d'ambiente: senza,
 * chiunque avesse il database potrebbe rifare l'hash di tutti gli IPv4 del
 * mondo in pochi minuti e ottenere di nuovo gli indirizzi in chiaro.
 *
 * Senza `IP_SALT` configurato si usa un ripiego costante — l'impronta resta
 * inutile a chi non ha già il database, ma va impostato.
 */
export async function hashIp(ip: string): Promise<string | null> {
  if (!ip) return null
  const salt = env("IP_SALT") || "nm-visitor-salt-fallback"
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest)).slice(0, 16)
    .map(b => b.toString(16).padStart(2, "0")).join("")
}

export function xml(res: EdgeRes, body: string, maxAge = 3600): void {
  res.setHeader("content-type", "application/xml; charset=utf-8")
  res.setHeader("cache-control", `public, max-age=0, s-maxage=${maxAge}, stale-while-revalidate=86400`)
  res.status(200).send(body)
}

export function text(res: EdgeRes, body: string, maxAge = 3600): void {
  res.setHeader("content-type", "text/plain; charset=utf-8")
  res.setHeader("cache-control", `public, max-age=0, s-maxage=${maxAge}, stale-while-revalidate=86400`)
  res.status(200).send(body)
}

export function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}
