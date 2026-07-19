import React, { Suspense, lazy } from "react"
import NadiaMaar from "./NadiaMaar_Lab" // landing: eager, protects the homepage LCP

/* Every non-home route is a separate chunk, fetched only when visited.
   This keeps the portal (Supabase + cabinet/admin UI) and the service
   pages out of the initial homepage download. */
const NadiaMaarAbout    = lazy(() => import("./NadiaMaar_About"))
const NadiaMaarProjects = lazy(() => import("./NadiaMaar_Projects"))
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
  return <div style={{ minHeight: "100vh", background: "#060C18" }} aria-hidden />
}

export default function App() {
  const path = window.location.pathname

  let el: React.ReactNode = null
  switch (path) {
    case "/about":     el = <NadiaMaarAbout />; break
    case "/projects":  el = <NadiaMaarProjects />; break
    case "/ecommerce": el = <EcommercePage />; break
    case "/corporate": el = <CorporatePage />; break
    case "/web-app":   el = <WebAppPage />; break
    case "/seo":       el = <SeoPage />; break
    case "/ai":        el = <AiPage />; break
    case "/foundry":   el = <DigitalFoundry />; break
    case "/cabinet":   el = <CabinetApp />; break
    case "/dashboard": el = <DashboardGate />; break
    default:           return <NadiaMaar />
  }

  return <Suspense fallback={<RouteFallback />}>{el}</Suspense>
}
