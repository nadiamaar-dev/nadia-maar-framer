import React, { useCallback, useEffect, useState } from "react"
import SogliaApp from "./components/Sandbox/preview/soglia/SogliaApp"
import { SOGLIA_CSS } from "./components/Sandbox/preview/soglia/theme"
import { trackEvent } from "./lib/measure"

/* ══════════════════════════════════════════════════════════════════════════
   DEMO — Soglia, la pagina di lancio di un prodotto SaaS

   Rotta: /demo/lancio-saas. Un prodotto di autenticazione inventato,
   presentato come lo presenterebbe chi lo vende: cattedrale di vetro
   smerigliato a mezzanotte, un solo accento cromatico, e il prodotto
   stesso come unica immagine della pagina.

   Non è una pagina di sole parole: le schede di accesso funzionano
   davvero (password + secondo fattore, codice via e-mail, SSO con
   controllo del dominio) e gli ispettori del banco da lavoro le
   rivestono in tempo reale.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

const PAGE_CSS = `
  html, body { margin: 0; background: #05060f; }
  /* Non sticky: la pagina di Soglia ha una sua barra fissa, e due barre
     appiccicate una sull'altra sono il modo più veloce di rovinare
     un'apertura a tutto schermo. */
  .sgp-bar {
    position: relative; z-index: 100;
    display: flex; align-items: center; gap: 14px; padding: 11px 18px;
    background: rgba(5, 6, 15, 0.94);
    backdrop-filter: blur(22px) saturate(1.4); -webkit-backdrop-filter: blur(22px) saturate(1.4);
    box-shadow: inset 0 -1px 0 rgba(186, 215, 247, 0.12);
    font-family: ${FONT};
  }
  .sgp-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: inherit; font-size: 13px; font-weight: 600; color: #9da7ba;
    background: none; border: none; cursor: pointer; padding: 6px 4px; transition: color .18s ease;
  }
  .sgp-back:hover { color: #d1e4fa; }
  .sgp-t { font-size: 13.5px; color: #d1e4fa; }
  .sgp-t strong { font-weight: 600; letter-spacing: -0.015em; }
  .sgp-s { display: block; font-family: ${MONO}; font-size: 11px; color: #9da7ba; letter-spacing: 0.03em; }
  .sgp-chips { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
  .sgp-chip {
    font-family: ${MONO}; font-size: 10px; font-weight: 500; letter-spacing: 0.04em;
    color: #d1e4fa;
    background: rgba(199, 211, 234, 0.12);
    border: none;
    border-radius: 999px; padding: 4px 10px;
  }
  @media (max-width: 860px) { .sgp-chips { display: none; } }
`

export default function DemoSoglia() {
  useEffect(() => { trackEvent("demo_open", { demo: "landing-saas-launch", via: "page" }) }, [])

  const [embedded] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("embed"))

  /* Il fondo dell'imbuto qui è un accesso portato a termine: dice che il
     visitatore ha attraversato il widget, non che ha letto il titolo. */
  const onAccesso = useCallback(() => {
    trackEvent("soglia_demo_accesso", { demo: "landing-saas-launch" })
  }, [])

  useEffect(() => {
    const prevTitle = document.title
    document.title = "Soglia — demo della pagina di lancio di un SaaS | Nadia Maar"
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute("content") ?? null
    meta?.setAttribute("content",
      "La pagina di lancio di un prodotto di autenticazione inventato: vetro smerigliato su fondo " +
      "notte, schede di accesso che funzionano davvero (password, secondo fattore, codice, SSO) e " +
      "un banco da lavoro che le riveste del tuo marchio in tempo reale. Dati dimostrativi.")
    return () => {
      document.title = prevTitle
      if (prevDesc !== null) meta?.setAttribute("content", prevDesc)
    }
  }, [])

  const back = () => {
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) window.history.back()
    else window.location.assign("/foundry")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#05060f" }}>
      <style>{SOGLIA_CSS}</style>
      <style>{PAGE_CSS}</style>

      {!embedded && (
        <header className="sgp-bar">
          <button type="button" className="sgp-back" onClick={back} aria-label="Torna al catalogo">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 3.5L5.5 8l4.5 4.5" />
            </svg>
            Torna al catalogo
          </button>
          <span className="sgp-t">
            <strong>SaaS Launch Page</strong>
            <span className="sgp-s">Pagina di lancio · widget di accesso funzionante</span>
          </span>
          <span className="sgp-chips">
            {["React", "TypeScript", "Zustand", "Framer Motion"].map(t => (
              <span key={t} className="sgp-chip">{t}</span>
            ))}
          </span>
        </header>
      )}

      <SogliaApp onAccesso={onAccesso} />
    </div>
  )
}
