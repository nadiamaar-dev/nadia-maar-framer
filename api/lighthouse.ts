/* ══════════════════════════════════════════════════════════════════════════
   /api/lighthouse — il punteggio della home, misurato da Google, per il
   distintivo nel footer.

   Differenza rispetto ad /api/pagespeed (il passacarte del pannello admin):
   qui l'URL non si sceglie — è sempre la home del dominio su cui stiamo
   rispondendo — e la risposta è ridotta a quattro numeri. Il costo di quota
   lo governa la CDN: `s-maxage=86400` fa sì che PageSpeed venga interpellato
   al più una volta al giorno per regione, chiunque e quanti guardino il
   footer. Il primo visitatore della giornata aspetta la misura (~30 s, il
   distintivo compare in ritardo solo per lui); tutti gli altri leggono la
   copia in cache.

   Se la misura fallisce si risponde 204 senza corpo e SENZA cache: il footer
   semplicemente non mostra il distintivo, e il tentativo successivo riparte
   da zero. Mai mostrare un numero vecchio spacciandolo per fresco, mai
   rompere il footer per colpa di una API esterna.
══════════════════════════════════════════════════════════════════════════ */

import { env, type EdgeReq, type EdgeRes, originOf } from "../src/lib/edge.js"

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

type Psi = {
  lighthouseResult?: {
    categories?: { performance?: { score?: number } }
    audits?: Record<string, { numericValue?: number }>
  }
}

export default async function handler(req: EdgeReq, res: EdgeRes) {
  const origin = originOf(req)

  const params = new URLSearchParams({
    url: `${origin}/`,
    strategy: "mobile",
    category: "performance",
  })
  const key = env("PAGESPEED_API_KEY")
  if (key) params.set("key", key)

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 50_000)
    const r = await fetch(`${ENDPOINT}?${params}`, { signal: controller.signal })
    clearTimeout(timer)
    if (!r.ok) throw new Error(String(r.status))

    const body = (await r.json()) as Psi
    const score = body.lighthouseResult?.categories?.performance?.score
    if (typeof score !== "number") throw new Error("punteggio assente")

    const audits = body.lighthouseResult?.audits ?? {}
    res.setHeader("cache-control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800")
    res.status(200).json({
      performance: Math.round(score * 100),
      lcpMs: Math.round(audits["largest-contentful-paint"]?.numericValue ?? -1),
      cls: Number((audits["cumulative-layout-shift"]?.numericValue ?? -1).toFixed(3)),
      strategy: "mobile",
    })
  } catch {
    res.setHeader("cache-control", "no-store")
    res.status(204).end()
  }
}
