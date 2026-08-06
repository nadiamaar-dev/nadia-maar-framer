import { getSiteSettings } from "./siteSettings"

/* ══════════════════════════════════════════════════════════════════════════
   MISURAZIONE — GA4, verifica Search Console e conteggio interno.

   Tre cose separate perché rispondono a domande diverse:
   · GA4 dice cosa fanno i visitatori che accettano di essere seguiti;
   · la meta di Search Console serve una volta sola, per dimostrare a Google
     che il dominio è nostro;
   · il conteggio interno dice quante visite ci sono state davvero, comprese
     quelle di chi blocca GA — cioè circa una su tre.

   Tutto parte da `site_settings`: senza ID GA4 configurato non viene
   caricato nessuno script di Google, e questo è il comportamento voluto.
══════════════════════════════════════════════════════════════════════════ */

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}

let gaLoaded = false

function injectGa(id: string) {
  if (gaLoaded || document.getElementById("ga4-src")) return
  gaLoaded = true

  const s = document.createElement("script")
  s.id = "ga4-src"
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(s)

  window.dataLayer = window.dataLayer || []
  /* eslint-disable-next-line prefer-rest-params */
  window.gtag = function gtag() { window.dataLayer!.push(arguments) }
  window.gtag("js", new Date())
  /* Il router è fatto a mano e non fa navigazioni reali fra le rotte SPA:
     `send_page_view` automatico misurerebbe solo la prima. Le successive le
     manda trackPageview(). */
  window.gtag("config", id, { send_page_view: true })
}

function injectGscTag(token: string) {
  if (document.querySelector('meta[name="google-site-verification"]')) return
  const m = document.createElement("meta")
  m.name = "google-site-verification"
  /* Si accetta sia il token nudo sia la riga <meta> copiata da Search
     Console: incollare quello che Google dà è il gesto naturale, e
     rifiutarlo sarebbe pedanteria. */
  const match = token.match(/content=["']([^"']+)["']/)
  m.content = (match ? match[1] : token).trim()
  document.head.appendChild(m)
}

/** Una riga per visita, verso /api/track: niente cookie, niente IP in chiaro. */
function logVisit(path: string) {
  try {
    const body = JSON.stringify({ path, referrer: document.referrer || null })
    /* sendBeacon sopravvive alla chiusura della scheda; fetch keepalive è il
       ripiego dove non c'è (Safari vecchio). L'errore si ignora: una visita
       non contata non deve rompere la pagina che stava contando. */
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))
    } else {
      fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } })
        .catch(() => {})
    }
  } catch { /* ignorato di proposito */ }
}

const PRIVATE = ["/cabinet", "/dashboard"]

/** Da chiamare una volta all'avvio dell'app pubblica. */
export function initMeasurement(): void {
  if (typeof window === "undefined") return
  const path = window.location.pathname
  /* L'area riservata non si misura: sono due persone, e i loro percorsi
     interni non sono traffico del sito. */
  if (PRIVATE.some(p => path.startsWith(p))) return

  logVisit(path)

  getSiteSettings().then(s => {
    if (s.googleAnalyticsId) injectGa(s.googleAnalyticsId)
    if (s.gscVerificationTag) injectGscTag(s.gscVerificationTag)
  })
}

/** Per una navigazione interna che non ricarica la pagina. */
export function trackPageview(path: string): void {
  if (PRIVATE.some(p => path.startsWith(p))) return
  logVisit(path)
  window.gtag?.("event", "page_view", { page_path: path, page_location: window.location.href })
}
