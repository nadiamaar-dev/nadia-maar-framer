import React, { Suspense, lazy, useEffect } from "react"
import NadiaMaar from "./NadiaMaar_Lab" // landing: eager, protects the homepage LCP
import SEOHead from "./components/SEOHead"
import { MaintenanceGate, NotFound } from "./components/RouteGate"
import { useFoundryEnabled } from "./lib/useSiteSettings"
import SiteChrome from "./components/SiteChrome"
import { initMeasurement } from "./lib/measure"
import { LocaleProvider } from "./lib/i18n/LocaleContext"
import { LOCALE_TAG, splitLocale } from "./lib/i18n/locales"

/* Every non-home route is a separate chunk, fetched only when visited.
   This keeps the portal (Supabase + cabinet/admin UI) and the service
   pages out of the initial homepage download. */
const NadiaMaarAbout    = lazy(() => import("./NadiaMaar_About"))
const NadiaMaarArchitecture = lazy(() => import("./NadiaMaar_Architecture"))
const NadiaMaarProjects = lazy(() => import("./NadiaMaar_Projects"))
const NadiaMaarContatti = lazy(() => import("./NadiaMaar_Contatti"))
const EcommercePage     = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.EcommercePage })))
const CorporatePage     = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.CorporatePage })))
const WebAppPage        = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.WebAppPage })))
const SeoPage           = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.SeoPage })))
const AiPage            = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.AiPage })))
/* I tre documenti legali stanno in un pacchetto solo: chi apre l'informativa
   privacy apre spesso subito dopo la cookie policy, e la seconda arriva
   allora senza un altro viaggio di rete. */
const PrivacyPage       = lazy(() => import("./NadiaMaar_Legal").then(m => ({ default: m.PrivacyPage })))
const CookiePage        = lazy(() => import("./NadiaMaar_Legal").then(m => ({ default: m.CookiePage })))
const TermsPage         = lazy(() => import("./NadiaMaar_Legal").then(m => ({ default: m.TermsPage })))
const DigitalFoundry    = lazy(() => import("./DigitalFoundry"))
const DemoSupplierPortal = lazy(() => import("./DemoSupplierPortal"))
const DemoCrmDashboard   = lazy(() => import("./DemoCrmDashboard"))
const DemoOnboardingKyc  = lazy(() => import("./DemoOnboardingKyc"))
const DemoQuoteEngine    = lazy(() => import("./DemoQuoteEngine"))
const CabinetApp        = lazy(() => import("./portal/cabinet/CabinetApp"))
const DashboardGate     = lazy(() => import("./DashboardGate"))

/** Neutral, on-brand placeholder while a route chunk loads (no white flash). */
function RouteFallback() {
  return <div style={{ minHeight: "100vh", background: "#121418" }} aria-hidden />
}

/** Le rotte riservate: niente metadati pubblici, niente manutenzione, niente
 *  conteggio delle visite. Sono strumenti, non pagine. */
const PRIVATE = new Set(["/cabinet", "/dashboard"])

export default function App() {
  /* La lingua è un prefisso dell'indirizzo, non una rotta a sé: /en/about e
     /about sono la STESSA pagina in due lingue. Il router lavora sul path
     canonico (senza prefisso), così aggiungere una lingua non raddoppia i
     `case` qui sotto — che sarebbe il modo più rapido di far divergere le
     due versioni del sito. */
  const { locale, path } = splitLocale(window.location.pathname)

  /* Una volta per caricamento: registra la visita e, se configurato, accende
     GA4 e la meta di verifica Search Console. */
  useEffect(() => { initMeasurement() }, [])

  /* index.html è servito con lang="it" perché è un file statico solo. Chi
     legge con uno screen reader sente la pronuncia della lingua dichiarata
     qui: sbagliarla rende l'inglese incomprensibile a voce. */
  useEffect(() => {
    document.documentElement.lang = LOCALE_TAG[locale]
  }, [locale])

  /* Spenta dal pannello, /foundry non è «temporaneamente chiusa»: non
     esiste. Stessa pagina e stesso stato di un indirizzo inventato —
     /api/route risponde già 404, qui si disegna di conseguenza. */
  const foundryOn = useFoundryEnabled()

  let el: React.ReactNode
  let known = true
  /* `bare`: pagina indicizzabile ma senza la barra promo del sito, perché
     dentro ci si immerge in un prodotto che non è il sito. */
  let bare = false
  switch (path) {
    /* La home ha un `case` suo. Prima veniva servita dal `default`, cioè
       dallo stesso ramo che oggi disegna il 404: aggiungere la pagina «non
       trovata» senza aggiungere anche questa riga ha spento la home. */
    case "/":          el = <NadiaMaar />; break
    case "/about":     el = <NadiaMaarAbout />; break
    case "/architecture": el = <NadiaMaarArchitecture />; break
    case "/projects":  el = <NadiaMaarProjects />; break
    case "/contatti":  el = <NadiaMaarContatti />; break
    case "/ecommerce": el = <EcommercePage />; break
    case "/corporate": el = <CorporatePage />; break
    case "/web-app":   el = <WebAppPage />; break
    case "/seo":       el = <SeoPage />; break
    case "/ai":        el = <AiPage />; break
    /* Le pagine legali non dipendono da nessuna impostazione del pannello:
       un'informativa privacy raggiungibile solo quando una funzione è accesa
       non assolve l'obbligo di informare. */
    case "/privacy":      el = <PrivacyPage />; break
    case "/cookie-policy": el = <CookiePage />; break
    case "/termini":      el = <TermsPage />; break
    case "/foundry":
      if (foundryOn) { el = <DigitalFoundry />; break }
      el = <NotFound />; known = false; break
    /* La demo del portale fornitori vive su una rotta propria: a schermo
       intero le tabelle dense si leggono, l'indirizzo si può condividere e la
       pagina si indicizza. In un pop-up nessuna delle tre cose valeva. */
    case "/demo/portale-fornitori":
      if (foundryOn) { el = <DemoSupplierPortal />; bare = true; break }
      el = <NotFound />; known = false; break
    case "/demo/crm-vendite":
      if (foundryOn) { el = <DemoCrmDashboard />; bare = true; break }
      el = <NotFound />; known = false; break
    case "/demo/onboarding-kyc":
      if (foundryOn) { el = <DemoOnboardingKyc />; bare = true; break }
      el = <NotFound />; known = false; break
    case "/demo/preventivo-roi":
      if (foundryOn) { el = <DemoQuoteEngine />; bare = true; break }
      el = <NotFound />; known = false; break
    case "/cabinet":   el = <CabinetApp />; break
    case "/dashboard": el = <DashboardGate />; break
    /* Una rotta sconosciuta è un 404, non la home: /api/route risponde già
       con lo stato giusto e registra il link rotto, qui si disegna. */
    default:           el = <NotFound />; known = false; break
  }

  if (PRIVATE.has(path)) {
    return <Suspense fallback={<RouteFallback />}>{el}</Suspense>
  }

  /* Una pagina che non esiste non ha metadati da promuovere e non va
     indicizzata: niente <SEOHead>, niente barra promo. */
  if (!known) return el

  return (
    <LocaleProvider locale={locale} path={path}>
      <MaintenanceGate>
        <SEOHead slug={path} locale={locale} />
        {!bare && <SiteChrome />}
        <Suspense fallback={<RouteFallback />}>{el}</Suspense>
      </MaintenanceGate>
    </LocaleProvider>
  )
}
