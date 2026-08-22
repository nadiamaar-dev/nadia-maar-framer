import React, { useEffect, useState } from "react"
import QuoteApp, { QUOTE_CSS, type QuoteCapability } from "./components/Sandbox/preview/quote/QuoteApp"
import { trackEvent } from "./lib/measure"

/* ══════════════════════════════════════════════════════════════════════════
   DEMO — Preventivo & ROI, a schermo intero

   Rotta: /demo/preventivo-roi. Non è il configuratore del sito (quello
   raccoglie un blueprint e un contatto): qui si dimostra un motore di
   PREZZO — scelte che si vincolano fra loro, listino che si adegua da sé,
   ritorno calcolato sui numeri di chi guarda e ordine in JSON pronto da
   spedire a un backend.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

const PAGE_CSS = `
  html, body { margin: 0; background: #E4E1D8; }
  .qtp-bar {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; gap: 14px; padding: 11px 18px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(22px) saturate(1.4); -webkit-backdrop-filter: blur(22px) saturate(1.4);
    border-bottom: 1px solid rgba(23,26,22,0.09);
    box-shadow: 0 2px 14px rgba(23,26,22,0.06);
    font-family: ${FONT};
  }
  .qtp-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: inherit; font-size: 13px; font-weight: 650; color: #565C52;
    background: none; border: none; cursor: pointer; padding: 6px 4px; transition: color .18s ease;
  }
  .qtp-back:hover { color: #171A16; }
  .qtp-t { font-size: 13.5px; color: #171A16; }
  .qtp-t strong { font-weight: 740; letter-spacing: -0.015em; }
  .qtp-s { display: block; font-family: ${MONO}; font-size: 11px; color: #7E857A; letter-spacing: 0.03em; }
  .qtp-chips { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
  .qtp-chip {
    font-family: ${MONO}; font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
    color: #35452F;
    background: #DFE7DD;
    border: none;
    border-radius: 999px; padding: 4px 10px;
  }
  @media (max-width: 860px) { .qtp-chips { display: none; } }
`

export default function DemoQuoteEngine() {
  useEffect(() => { trackEvent("demo_open", { demo: "b2b-preventivo-roi", via: "page" }) }, [])

  const [embedded] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("embed"))
  const [caps, setCaps] = useState<QuoteCapability[]>([])

  /* Il JSON generato è il fondo dell'imbuto di questa demo: dice che il
     visitatore ha configurato tutto, non che ha aperto la pagina. */
  useEffect(() => {
    if (caps.includes("json")) trackEvent("quote_demo_complete", { demo: "b2b-preventivo-roi" })
  }, [caps])

  useEffect(() => {
    const prevTitle = document.title
    document.title = "Preventivo & ROI — demo di un configuratore di prezzo | Nadia Maar"
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute("content") ?? null
    meta?.setAttribute("content",
      "Prova un configuratore di preventivo dove le scelte si vincolano fra loro: la piattaforma " +
      "cambia i prezzi dei moduli, la sincronia li moltiplica, il ritorno si calcola sui tuoi numeri " +
      "e l'ordine esce in JSON. Dati dimostrativi.")
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
    <div style={{ minHeight: "100vh", background: "#E4E1D8" }}>
      <style>{QUOTE_CSS}</style>
      <style>{PAGE_CSS}</style>

      {!embedded && (
        <header className="qtp-bar">
          <button type="button" className="qtp-back" onClick={back} aria-label="Torna al catalogo">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 3.5L5.5 8l4.5 4.5" />
            </svg>
            Torna al catalogo
          </button>
          <span className="qtp-t">
            <strong>Preventivo &amp; ROI</strong>
            <span className="qtp-s">Configuratore con vincoli · prezzi indicativi</span>
          </span>
          <span className="qtp-chips">
            {["React", "TypeScript", "Zustand", "Framer Motion"].map(t => (
              <span key={t} className="qtp-chip">{t}</span>
            ))}
          </span>
        </header>
      )}

      <QuoteApp onCaps={setCaps} mostraCaps={!embedded} />

    </div>
  )
}
