import React, { useCallback, useEffect, useState } from "react"
import AtelierApp from "./components/Sandbox/preview/atelier/AtelierApp"
import { ATELIER_CSS } from "./components/Sandbox/preview/atelier/theme"
import { trackEvent } from "./lib/measure"

/* ══════════════════════════════════════════════════════════════════════════
   DEMO — Atelier di moda, a schermo intero

   Rotta: /demo/atelier-moda. La vetrina di un e-commerce di lusso:
   configuratore visivo della borsa (il disegno si ricolora e si inclina),
   carrello a cassetto di vetro e cassa pensata per il pollice, con la
   recita dei wallet. Tutto finto nei pagamenti, vero nel funzionamento.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

const PAGE_CSS = `
  html, body { margin: 0; background: #F6F4EF; }
  /* Non sticky: il ruolo di barra fissa qui lo fa la navigazione della
     maison; questa riga di servizio scorre via col primo gesto. */
  .atp-bar {
    position: relative; z-index: 100;
    display: flex; align-items: center; gap: 14px; padding: 11px 18px;
    background: rgba(27, 25, 22, 0.92);
    backdrop-filter: blur(22px) saturate(1.4); -webkit-backdrop-filter: blur(22px) saturate(1.4);
    border-bottom: 1px solid rgba(246, 244, 239, 0.12);
    font-family: ${FONT};
  }
  .atp-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: inherit; font-size: 13px; font-weight: 650; color: #B3A995;
    background: none; border: none; cursor: pointer; padding: 6px 4px; transition: color .18s ease;
  }
  .atp-back:hover { color: #F6F4EF; }
  .atp-t { font-size: 13.5px; color: #F6F4EF; }
  .atp-t strong { font-weight: 740; letter-spacing: -0.015em; }
  .atp-s { display: block; font-family: ${MONO}; font-size: 11px; color: #9B958A; letter-spacing: 0.03em; }
  .atp-chips { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
  .atp-chip {
    font-family: ${MONO}; font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
    color: #E8DFCE;
    background: rgba(246, 244, 239, 0.1);
    border: none;
    border-radius: 999px; padding: 4px 10px;
  }
  @media (max-width: 860px) { .atp-chips { display: none; } }
`

export default function DemoAtelier() {
  useEffect(() => { trackEvent("demo_open", { demo: "shopify-luxury-fashion", via: "page" }) }, [])

  const [embedded] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("embed"))

  /* Il fondo dell'imbuto di QUESTA demo è l'ordine confermato: dice che il
     visitatore ha configurato, riempito la busta e attraversato la cassa. */
  const onOrdine = useCallback((totale: number) => {
    trackEvent("atelier_demo_ordine", { demo: "shopify-luxury-fashion", totale })
  }, [])

  useEffect(() => {
    const prevTitle = document.title
    document.title = "Atelier di moda — demo di una boutique con configuratore | Nadia Maar"
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute("content") ?? null
    meta?.setAttribute("content",
      "Prova la boutique di una maison: configura la borsa in cinque pelli e tre misure con le tue " +
      "iniziali, riempi la busta e attraversa una cassa disegnata per il telefono, con Apple Pay e " +
      "Google Pay simulati. Dati dimostrativi, nessun pagamento reale.")
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
    <div style={{ minHeight: "100vh", background: "#F6F4EF" }}>
      <style>{ATELIER_CSS}</style>
      <style>{PAGE_CSS}</style>

      {!embedded && (
        <header className="atp-bar">
          <button type="button" className="atp-back" onClick={back} aria-label="Torna al catalogo">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 3.5L5.5 8l4.5 4.5" />
            </svg>
            Torna al catalogo
          </button>
          <span className="atp-t">
            <strong>Luxury Fashion Store</strong>
            <span className="atp-s">Boutique con configuratore · pagamenti simulati</span>
          </span>
          <span className="atp-chips">
            {["React", "TypeScript", "Zustand", "Framer Motion"].map(t => (
              <span key={t} className="atp-chip">{t}</span>
            ))}
          </span>
        </header>
      )}

      <AtelierApp onOrdine={onOrdine} />
    </div>
  )
}
