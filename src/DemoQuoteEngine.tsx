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
  html, body { margin: 0; background: #131B25; }
  .qtp-bar {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; gap: 14px; padding: 11px 18px;
    background: linear-gradient(180deg, rgba(27,37,50,0.92), rgba(19,27,37,0.88));
    backdrop-filter: blur(22px) saturate(1.4); -webkit-backdrop-filter: blur(22px) saturate(1.4);
    border-bottom: 1px solid rgba(255,255,255,0.09);
    box-shadow: 0 1px 0 rgba(255,255,255,0.04), 0 12px 30px rgba(0,0,0,0.25);
    font-family: ${FONT};
  }
  .qtp-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: inherit; font-size: 13px; font-weight: 650; color: rgba(234,242,244,0.6);
    background: none; border: none; cursor: pointer; padding: 6px 4px; transition: color .18s ease;
  }
  .qtp-back:hover { color: #EAF2F4; }
  .qtp-t { font-size: 13.5px; color: #EAF2F4; }
  .qtp-t strong { font-weight: 740; letter-spacing: -0.015em; }
  .qtp-s { display: block; font-family: ${MONO}; font-size: 11px; color: rgba(234,242,244,0.36); letter-spacing: 0.03em; }
  .qtp-chips { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
  .qtp-chip {
    font-family: ${MONO}; font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
    color: rgba(143,246,225,0.95);
    background: linear-gradient(165deg, rgba(45,225,194,0.16), rgba(45,225,194,0.05));
    border: 1px solid rgba(45,225,194,0.24);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
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
    <div style={{ minHeight: "100vh", background: "#131B25" }}>
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
