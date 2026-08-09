/* ══════════════════════════════════════════════════════════════════════════
   /<chiave>.txt — la prova di possesso richiesta da IndexNow.

   Il protocollo vuole che la chiave sia leggibile come file di testo alla
   radice del dominio: è così che i motori verificano che chi annuncia gli
   URL controlli davvero il sito. Qui il file non esiste su disco — la
   chiave sta nel database e vercel.json instrada /<qualcosa>.txt su questa
   funzione.

   Risponde con la chiave SOLO se quella richiesta coincide con quella
   configurata: altrimenti chiunque potrebbe scoprirla chiedendo un nome a
   caso, e con la chiave in mano potrebbe annunciare a nome nostro.
══════════════════════════════════════════════════════════════════════════ */

import { type EdgeReq, type EdgeRes, env, header, supabaseEnv, text } from "../src/lib/edge.js"

async function readKey(): Promise<string> {
  const service = env("SUPABASE_SERVICE_ROLE_KEY")
  const sb = supabaseEnv()
  if (!sb) return ""
  const headers = service
    ? { apikey: service, authorization: `Bearer ${service}`, accept: "application/json" }
    : { apikey: sb.key, authorization: `Bearer ${sb.key}`, accept: "application/json" }
  try {
    const r = await fetch(`${sb.url}/rest/v1/site_settings?select=indexnow_key&limit=1`, { headers })
    if (!r.ok) return ""
    const rows = (await r.json()) as { indexnow_key: string | null }[]
    return rows[0]?.indexnow_key ?? ""
  } catch {
    return ""
  }
}

export default async function handler(req: EdgeReq, res: EdgeRes) {
  let asked = ""
  try {
    const u = new URL(req.url ?? "/", `https://${header(req, "host") || "localhost"}`)
    asked = (u.searchParams.get("key") || u.pathname.replace(/^\//, "").replace(/\.txt$/, "")).trim()
  } catch { /* asked resta vuoto */ }

  const key = await readKey()

  if (!key || !asked || asked !== key) {
    res.setHeader("content-type", "text/plain; charset=utf-8")
    res.setHeader("x-robots-tag", "noindex")
    res.status(404).send("Not found")
    return
  }

  res.setHeader("x-robots-tag", "noindex")
  text(res, key, 86400)
}
