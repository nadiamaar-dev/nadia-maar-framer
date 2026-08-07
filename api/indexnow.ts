/* ══════════════════════════════════════════════════════════════════════════
   /api/indexnow — indicizzazione immediata.

   IndexNow è un protocollo aperto: si annuncia una lista di URL cambiati e i
   motori che lo supportano vengono a riprenderli in minuti invece che in
   settimane. Lo onorano Bing, Yandex, Seznam e Naver, e un annuncio a uno
   solo di loro vale per tutti.

   GOOGLE NON PARTECIPA, e vale la pena dirlo invece di lasciarlo credere:
   la sua Indexing API esiste ma è documentata per i soli tipi JobPosting e
   BroadcastEvent, e usarla per pagine normali è fuori dalle sue condizioni
   d'uso. Quello che si può fare davvero — e che questa funzione fa — è
   segnalargli la sitemap aggiornata; per una singola pagina urgente resta
   lo Strumento di controllo URL in Search Console, un click, e il pannello
   ci porta direttamente.

   Prova di possesso: IndexNow richiede che la chiave sia leggibile come
   file di testo sul dominio. Ci pensa /api/indexnow-key, instradato da
   vercel.json su /<chiave>.txt.
══════════════════════════════════════════════════════════════════════════ */

import { type EdgeReq, type EdgeRes, env, header, originOf, pgSelect, supabaseEnv } from "../src/lib/edge"

const ENDPOINT = "https://api.indexnow.org/indexnow"

/** Le rotte pubbliche del sito: le stesse di /api/sitemap. */
const ROUTES = ["/", "/about", "/projects", "/contatti", "/foundry",
  "/ecommerce", "/corporate", "/web-app", "/seo", "/ai"]

/** La chiave sta in site_settings, che è admin-only: qui serve il service
 *  role. Senza, la funzione lo dice invece di fallire in silenzio. */
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
  if (req.method !== "POST") {
    res.setHeader("allow", "POST")
    res.status(405).json({ ok: false, error: "method_not_allowed" })
    return
  }

  const origin = originOf(req)
  const host = new URL(origin).hostname

  /* Su un dominio non pubblico non c'è niente da annunciare, e i motori
     risponderebbero comunque 403 sulla prova di possesso. */
  if (/localhost|127\.|\.local$/.test(host)) {
    res.status(400).json({ ok: false, error: "Dominio locale: non c'è nulla da annunciare." })
    return
  }

  let body: { urls?: unknown } = {}
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body as typeof body) ?? {}
  } catch { /* si usa l'elenco completo */ }

  /* Solo URL del nostro dominio: annunciare l'altrui è ciò che fa
     squalificare una chiave. */
  const requested = Array.isArray(body.urls)
    ? (body.urls as unknown[]).filter((u): u is string => typeof u === "string")
    : []

  const noindex = await pgSelect<{ page_slug: string }>("page_seo_configs?select=page_slug&is_noindex=eq.true")
  const excluded = new Set(noindex.map(r => r.page_slug))

  const urlList = (requested.length
    ? requested.map(u => (u.startsWith("http") ? u : `${origin}${u.startsWith("/") ? u : `/${u}`}`))
    : ROUTES.filter(r => !excluded.has(r)).map(r => `${origin}${r === "/" ? "" : r}`)
  ).filter(u => {
    try { return new URL(u).hostname === host } catch { return false }
  }).slice(0, 100)

  if (!urlList.length) {
    res.status(400).json({ ok: false, error: "Nessun URL valido da annunciare." })
    return
  }

  const key = await readKey()
  if (!key) {
    res.status(503).json({
      ok: false,
      error: "Chiave IndexNow non leggibile. Serve SUPABASE_SERVICE_ROLE_KEY fra le variabili d'ambiente di Vercel.",
    })
    return
  }

  const result: Record<string, unknown> = { urls: urlList.length }

  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `${origin}/${key}.txt`, urlList }),
    })
    /* 200 e 202 sono entrambi successo; 403 significa che la prova di
       possesso non è stata trovata, ed è l'errore che vale la pena spiegare. */
    result.indexnow = r.status
    result.indexnowOk = r.status === 200 || r.status === 202
    if (r.status === 403) {
      result.indexnowHint = `Chiave non verificata: ${origin}/${key}.txt deve rispondere con la chiave.`
    }
  } catch {
    result.indexnowOk = false
    result.indexnowHint = "Non è stato possibile contattare IndexNow."
  }

  /* A Google si segnala la sitemap: è l'unico canale di ping documentato e
     lecito per pagine normali. */
  try {
    const r = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${origin}/sitemap.xml`)}`)
    result.googleSitemapPing = r.status
  } catch {
    result.googleSitemapPing = null
  }

  res.status(200).json({ ok: true, ...result, keyLocation: `${origin}/${key}.txt` })
  void header
}
