/* ══════════════════════════════════════════════════════════════════════════
   /api/pagespeed — passacarte verso PageSpeed Insights.

   L'API di Google si potrebbe chiamare dal browser, ma allora la chiave
   finirebbe nell'URL di una richiesta visibile nel pannello di rete. Qui
   resta su Vercel.

   La chiave è comunque facoltativa: senza, l'API risponde lo stesso con una
   quota più bassa. Il pannello quindi funziona da subito e la chiave si
   aggiunge quando le esecuzioni diventano tante.

   Ordine di ricerca della chiave:
     1. PAGESPEED_API_KEY (variabile d'ambiente Vercel) — la via consigliata;
     2. site_settings.pagespeed_api_key, letta qui lato server;
     3. nessuna chiave.
══════════════════════════════════════════════════════════════════════════ */

import { env, type EdgeReq, type EdgeRes, header, originOf, supabaseEnv } from "../src/lib/edge"

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"]

/** Chiave dal database, con la anon key: la RLS di `site_settings` è
 *  admin-only, quindi qui non si legge nulla — è di proposito un ripiego che
 *  funziona solo se si configura SUPABASE_SERVICE_ROLE_KEY su Vercel. */
async function keyFromDb(): Promise<string> {
  const service = env("SUPABASE_SERVICE_ROLE_KEY")
  const sb = supabaseEnv()
  if (!service || !sb) return ""
  try {
    const r = await fetch(`${sb.url}/rest/v1/site_settings?select=pagespeed_api_key&limit=1`, {
      headers: { apikey: service, authorization: `Bearer ${service}`, accept: "application/json" },
    })
    if (!r.ok) return ""
    const rows = (await r.json()) as { pagespeed_api_key: string | null }[]
    return rows?.[0]?.pagespeed_api_key ?? ""
  } catch {
    return ""
  }
}

function qp(req: EdgeReq, name: string): string {
  const direct = req.query?.[name]
  if (typeof direct === "string") return direct
  if (Array.isArray(direct)) return direct[0] ?? ""
  try {
    const u = new URL(req.url ?? "", `https://${header(req, "host") || "localhost"}`)
    return u.searchParams.get(name) ?? ""
  } catch {
    return ""
  }
}

export default async function handler(req: EdgeReq, res: EdgeRes) {
  const origin = originOf(req)
  const raw = qp(req, "url") || origin
  const strategy = qp(req, "strategy") === "desktop" ? "desktop" : "mobile"

  /* Solo il proprio dominio: senza questo vincolo l'endpoint diventerebbe un
     servizio gratuito di analisi per chiunque, a spese della nostra quota. */
  let target: URL
  try {
    target = new URL(raw)
  } catch {
    res.status(400).json({ error: "URL non valido" })
    return
  }
  const allowedHost = new URL(origin).hostname
  if (target.hostname !== allowedHost) {
    res.status(400).json({ error: `Analizzabile solo ${allowedHost}` })
    return
  }
  if (target.protocol !== "https:") {
    res.status(400).json({ error: "PageSpeed richiede HTTPS" })
    return
  }

  const key = env("PAGESPEED_API_KEY") || (await keyFromDb())

  const params = new URLSearchParams({ url: target.toString(), strategy })
  for (const c of CATEGORIES) params.append("category", c)
  if (key) params.set("key", key)

  try {
    /* PageSpeed carica davvero la pagina e la misura: sotto i 30 secondi non
       torna quasi mai, e il limite delle funzioni Vercel è vicino. */
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 55_000)
    const r = await fetch(`${ENDPOINT}?${params}`, { signal: controller.signal })
    clearTimeout(timer)

    const body = await r.json().catch(() => null)
    if (!r.ok) {
      const msg = (body as { error?: { message?: string } })?.error?.message
      res.status(r.status === 429 ? 429 : 502).json({
        error: r.status === 429
          ? "Quota PageSpeed esaurita. Aggiungi una chiave API per alzarla."
          : msg || `PageSpeed ha risposto ${r.status}`,
      })
      return
    }
    res.setHeader("cache-control", "no-store")
    res.status(200).json(body)
  } catch (e) {
    const aborted = (e as Error)?.name === "AbortError"
    res.status(504).json({
      error: aborted
        ? "PageSpeed ha impiegato troppo. Riprova: la prima esecuzione su un dominio è la più lenta."
        : "Non è stato possibile contattare PageSpeed.",
    })
  }
}
