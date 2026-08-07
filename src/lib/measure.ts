import { getSiteSettings } from "./siteSettings"

/* ══════════════════════════════════════════════════════════════════════════
   MISURAZIONE.

   Quattro strumenti, due categorie ben diverse:

   INTERNO — /api/track. Nessun cookie, nessun IP in chiaro (l'impronta la
   calcola il server, dove l'IP si vede). Non profila, quindi non richiede
   consenso e parte sempre. Esiste perché circa un visitatore su tre blocca
   gli script di Google, e in GA4 quel terzo semplicemente non compare.

   TERZE PARTI — GA4, Google Tag Manager, Meta Pixel. Profilano, quindi
   partono solo se: (a) sono configurati nel pannello, e (b) o il consenso
   è disattivato in impostazioni, o l'utente ha accettato.

   La regola che conta: se il banner è acceso e l'utente rifiuta, gli script
   NON vengono caricati affatto. Un banner che carica comunque è peggio di
   nessun banner, perché è una dichiarazione falsa.
══════════════════════════════════════════════════════════════════════════ */

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown }
    _fbq?: unknown
  }
}

const CONSENT_KEY = "nm-consent"
const PRIVATE = ["/cabinet", "/dashboard"]

export function hasStoredConsent(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) !== null } catch { return false }
}
export function consentGranted(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) === "1" } catch { return false }
}
export function grantConsent(): void {
  try { localStorage.setItem(CONSENT_KEY, "1") } catch { /* privata */ }
  /* Si caricano subito: chiedere di ricaricare la pagina dopo un «accetta»
     è il modo più rapido di perdere la visita che si voleva misurare. */
  void loadThirdParty()
}
export function refuseConsent(): void {
  try { localStorage.setItem(CONSENT_KEY, "0") } catch { /* privata */ }
}

/* ── Script di terze parti ─────────────────────────────────────────────── */

let loaded = false

function script(id: string, src: string) {
  if (document.getElementById(id)) return
  const s = document.createElement("script")
  s.id = id
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || []
  if (!window.gtag) {
    // eslint-disable-next-line prefer-rest-params
    window.gtag = function gtag() { window.dataLayer!.push(arguments) }
  }
}

function injectGa4(id: string) {
  ensureDataLayer()
  script("ga4-src", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`)
  window.gtag!("js", new Date())
  window.gtag!("config", id, { send_page_view: true })
}

function injectGtm(id: string) {
  ensureDataLayer()
  window.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" })
  script("gtm-src", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`)
}

function injectMetaPixel(id: string) {
  if (window.fbq) return
  /* Lo snippet ufficiale, riscritto in modo leggibile: una coda che
     raccoglie le chiamate finché la libreria non è pronta. */
  const fbq = function (...args: unknown[]) {
    const f = fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] }
    if (f.callMethod) f.callMethod(...args)
    else f.queue.push(args)
  } as unknown as NonNullable<Window["fbq"]>
  ;(fbq as unknown as { queue: unknown[] }).queue = []
  ;(fbq as unknown as { loaded: boolean }).loaded = true
  ;(fbq as unknown as { version: string }).version = "2.0"
  window.fbq = fbq
  window._fbq = fbq
  script("meta-pixel-src", "https://connect.facebook.net/en_US/fbevents.js")
  window.fbq("init", id)
  window.fbq("track", "PageView")
}

/** Carica GA4 / GTM / Pixel se configurati e se il consenso lo permette. */
async function loadThirdParty(): Promise<void> {
  if (loaded) return
  const s = await getSiteSettings().catch(() => null)
  if (!s) return

  /* Il banner è acceso → serve un sì esplicito. È spento → si assume che il
     consenso sia gestito altrove (o non serva nella giurisdizione scelta),
     ed è una decisione del pannello, non di questo file. */
  if (s.cookieConsentEnabled && !consentGranted()) return

  loaded = true
  if (s.googleAnalyticsId) injectGa4(s.googleAnalyticsId)
  if (s.gtmContainerId) injectGtm(s.gtmContainerId)
  if (s.metaPixelId) injectMetaPixel(s.metaPixelId)
}

function injectGscTag(token: string) {
  if (document.querySelector('meta[name="google-site-verification"]')) return
  const m = document.createElement("meta")
  m.name = "google-site-verification"
  /* Si accetta sia il token nudo sia la riga <meta> copiata da Search
     Console: incollare quello che Google dà è il gesto naturale. */
  const match = token.match(/content=["']([^"']+)["']/)
  m.content = (match ? match[1] : token).trim()
  document.head.appendChild(m)
}

/** Dati strutturati dell'organizzazione, presenti su ogni pagina: è così che
 *  Google collega le entità fra loro invece di vedere omonimi scollegati. */
function injectOrgSchema(schema: Record<string, unknown>) {
  if (document.getElementById("org-schema")) return
  const s = document.createElement("script")
  s.id = "org-schema"
  s.type = "application/ld+json"
  s.textContent = JSON.stringify(schema)
  document.head.appendChild(s)
}

/* ── Conteggio interno ─────────────────────────────────────────────────── */

function logVisit(path: string) {
  try {
    const body = JSON.stringify({ path, referrer: document.referrer || null })
    /* sendBeacon sopravvive alla chiusura della scheda; fetch keepalive è il
       ripiego dove non c'è. L'errore si ignora: una visita non contata non
       deve rompere la pagina che stava contando. */
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))
    } else {
      fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } })
        .catch(() => {})
    }
  } catch { /* ignorato di proposito */ }
}

/** Una volta all'avvio dell'app pubblica. */
export function initMeasurement(): void {
  if (typeof window === "undefined") return
  const path = window.location.pathname
  /* L'area riservata non si misura: sono due persone, e i loro percorsi
     interni non sono traffico del sito. */
  if (PRIVATE.some(p => path.startsWith(p))) return

  logVisit(path)

  getSiteSettings().then(s => {
    if (s.gscVerificationTag) injectGscTag(s.gscVerificationTag)
    if (s.organizationSchema) injectOrgSchema(s.organizationSchema)
  })

  void loadThirdParty()
}

/** Navigazione interna che non ricarica la pagina. */
export function trackPageview(path: string): void {
  if (PRIVATE.some(p => path.startsWith(p))) return
  logVisit(path)
  window.gtag?.("event", "page_view", { page_path: path, page_location: window.location.href })
  window.fbq?.("track", "PageView")
}
