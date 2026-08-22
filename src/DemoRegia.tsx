import React, { useCallback, useEffect, useState } from "react"
import RegiaApp from "./components/Sandbox/preview/regia/RegiaApp"
import { REGIA_CSS } from "./components/Sandbox/preview/regia/theme"
import { trackEvent } from "./lib/measure"

/* ══════════════════════════════════════════════════════════════════════════
   DEMO — Regia, la torre di controllo per l'e-commerce

   Rotta: /demo/regia. La pagina di lancio di un prodotto di
   orchestrazione inventato, in stile «sala di regia dietro vetro
   smerigliato»: titoli peso 400, capelli da 0.5px, un solo blu.

   La differenza rispetto a una pagina di marketing è che il quadro
   comandi incorporato LAVORA: la coda ordini scorre, le eccezioni si
   risolvono col clic, i nodi si interrogano e un ordine si può far
   correre attraverso il nastro.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

const PAGE_CSS = `
  html, body { margin: 0; background: #0b0c0e; }
  /* Non sticky: la pagina di Regia ha già la sua barra fissa. */
  .rgp-bar {
    position: relative; z-index: 100;
    display: flex; align-items: center; gap: 14px; padding: 11px 18px;
    background: rgba(11, 12, 14, 0.95);
    box-shadow: inset 0 -0.5px 0 rgba(255, 255, 255, 0.07);
    font-family: ${FONT};
  }
  .rgp-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: inherit; font-size: 13px; font-weight: 400; color: #858687;
    background: none; border: none; cursor: pointer; padding: 6px 4px; transition: color .18s ease;
  }
  .rgp-back:hover { color: #ffffff; }
  .rgp-t { font-size: 13.5px; color: #ffffff; }
  .rgp-t strong { font-weight: 500; letter-spacing: -0.015em; }
  .rgp-s { display: block; font-family: ${MONO}; font-size: 11px; color: #71717a; letter-spacing: 0.03em; }
  .rgp-chips { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
  .rgp-chip {
    font-family: ${MONO}; font-size: 10px; font-weight: 500; letter-spacing: 0.04em;
    color: #cececf;
    background: rgba(255, 255, 255, 0.06);
    border: none;
    border-radius: 999px; padding: 4px 10px;
  }
  @media (max-width: 860px) { .rgp-chips { display: none; } }
`

export default function DemoRegia() {
  useEffect(() => { trackEvent("demo_open", { demo: "b2b-regia-operativa", via: "page" }) }, [])

  const [embedded] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("embed"))

  /* Il fondo dell'imbuto: il visitatore ha FATTO qualcosa — risolto
     un'eccezione o fatto correre un ordine — non solo guardato. */
  const onIngaggio = useCallback(() => {
    trackEvent("regia_demo_ingaggio", { demo: "b2b-regia-operativa" })
  }, [])

  useEffect(() => {
    const prevTitle = document.title
    document.title = "Regia — demo di una torre di controllo per l'e-commerce | Nadia Maar"
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute("content") ?? null
    meta?.setAttribute("content",
      "La pagina di lancio di una torre di controllo inventata per l'e-commerce: la coda ordini " +
      "scorre in diretta, le eccezioni si risolvono con un clic, i nodi del nastro si interrogano " +
      "e un ordine attraversa la regia sotto i tuoi occhi. Dati di scena, prodotto funzionante.")
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
    <div style={{ minHeight: "100vh", background: "#0b0c0e" }}>
      <style>{REGIA_CSS}</style>
      <style>{PAGE_CSS}</style>

      {!embedded && (
        <header className="rgp-bar">
          <button type="button" className="rgp-back" onClick={back} aria-label="Torna al catalogo">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 3.5L5.5 8l4.5 4.5" />
            </svg>
            Torna al catalogo
          </button>
          <span className="rgp-t">
            <strong>Regia operativa</strong>
            <span className="rgp-s">Torre di controllo e-commerce · dati di scena</span>
          </span>
          <span className="rgp-chips">
            {["React", "TypeScript", "Zustand", "Framer Motion"].map(t => (
              <span key={t} className="rgp-chip">{t}</span>
            ))}
          </span>
        </header>
      )}

      <RegiaApp onIngaggio={onIngaggio} />
    </div>
  )
}
