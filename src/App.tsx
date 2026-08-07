import React, { Suspense, lazy, useEffect } from "react"
import NadiaMaar from "./NadiaMaar_Lab" // landing: eager, protects the homepage LCP
import SEOHead from "./components/SEOHead"
import { FoundryGate, MaintenanceGate, NotFound } from "./components/RouteGate"
import SiteChrome from "./components/SiteChrome"
import { initMeasurement } from "./lib/measure"

/* Every non-home route is a separate chunk, fetched only when visited.
   This keeps the portal (Supabase + cabinet/admin UI) and the service
   pages out of the initial homepage download. */
const NadiaMaarAbout    = lazy(() => import("./NadiaMaar_About"))
const NadiaMaarProjects = lazy(() => import("./NadiaMaar_Projects"))
const NadiaMaarContatti = lazy(() => import("./NadiaMaar_Contatti"))
const EcommercePage     = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.EcommercePage })))
const CorporatePage     = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.CorporatePage })))
const WebAppPage        = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.WebAppPage })))
const SeoPage           = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.SeoPage })))
const AiPage            = lazy(() => import("./NadiaMaar_ServicePage").then(m => ({ default: m.AiPage })))
const DigitalFoundry    = lazy(() => import("./DigitalFoundry"))
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
  const path = window.location.pathname

  /* Una volta per caricamento: registra la visita e, se configurato, accende
     GA4 e la meta di verifica Search Console. */
  useEffect(() => { initMeasurement() }, [])

  let el: React.ReactNode = null
  let known = true
  switch (path) {
    case "/about":     el = <NadiaMaarAbout />; break
    case "/projects":  el = <NadiaMaarProjects />; break
    case "/contatti":  el = <NadiaMaarContatti />; break
    case "/ecommerce": el = <EcommercePage />; break
    case "/corporate": el = <CorporatePage />; break
    case "/web-app":   el = <WebAppPage />; break
    case "/seo":       el = <SeoPage />; break
    case "/ai":        el = <AiPage />; break
    case "/foundry":   el = <FoundryGate><DigitalFoundry /></FoundryGate>; break
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
    <MaintenanceGate>
      <SEOHead slug={path === "/" ? "/" : path} />
      <SiteChrome />
      <Suspense fallback={<RouteFallback />}>{el}</Suspense>
    </MaintenanceGate>
  )
}
