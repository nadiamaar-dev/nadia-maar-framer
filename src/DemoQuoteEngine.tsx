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
  html, body { margin: 0; background: #05070A; }
  .qtp-bar {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; gap: 14px; padding: 11px 18px;
    background: rgba(5,7,10,0.78);
    backdrop-filter: blur(20px) saturate(1.3); -webkit-backdrop-filter: blur(20px) saturate(1.3);
    border-bottom: 1px solid rgba(255,255,255,0.07);
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
    color: rgba(123,243,220,0.9);
    background: rgba(45,225,194,0.10); border: 1px solid rgba(45,225,194,0.2);
    border-radius: 999px; padding: 4px 10px;
  }
  .qtp-caps {
    position: fixed; right: 16px; bottom: 16px; z-index: 41; width: 236px;
    border-radius: 14px; padding: 14px 16px;
    background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    backdrop-filter: blur(24px) saturate(1.3); -webkit-backdrop-filter: blur(24px) saturate(1.3);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 22px 56px rgba(0,0,0,0.62);
    font-family: ${FONT};
  }
  .qtp-caps-t {
    display: flex; align-items: center; justify-content: space-between;
    font-family: ${MONO}; font-size: 10px; font-weight: 650; letter-spacing: 0.16em;
    text-transform: uppercase; color: rgba(234,242,244,0.36); margin: 0 0 11px;
  }
  .qtp-caps-t b { color: rgba(123,243,220,0.95); font-weight: 700; }
  .qtp-cap { display: flex; align-items: center; gap: 9px; font-size: 12px; color: rgba(234,242,244,0.58); padding: 4px 0; transition: color .2s ease; }
  .qtp-cap[data-done="true"] { color: #EAF2F4; }
  .qtp-cap .dot {
    width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
    border: 1.5px solid rgba(255,255,255,0.16);
    display: flex; align-items: center; justify-content: center; font-size: 8.5px; color: #04120F;
    transition: all .25s ease;
  }
  .qtp-cap[data-done="true"] .dot { background: #2DE1C2; border-color: #2DE1C2; box-shadow: 0 0 12px rgba(45,225,194,0.5); }
  @media (max-width: 1100px) { .qtp-caps { display: none; } }
  @media (max-width: 860px) { .qtp-chips { display: none; } }
`

const CAPS: { id: QuoteCapability; label: string }[] = [
  { id: "piattaforma", label: "Scegli la piattaforma" },
  { id: "moduli",      label: "Aggiungi moduli" },
  { id: "vincolo",     label: "Tocca un modulo escluso" },
  { id: "regime",      label: "Cambia il regime di sincronia" },
  { id: "roi",         label: "Muovi i tuoi numeri" },
  { id: "json",        label: "Genera l'ordine JSON" },
]

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
    <div style={{ minHeight: "100vh", background: "#05070A" }}>
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

      <QuoteApp onCaps={setCaps} />

      {!embedded && (
        <aside className="qtp-caps" aria-label="Cose da provare">
          <p className="qtp-caps-t"><span>Da provare</span><b>{caps.length}/{CAPS.length}</b></p>
          {CAPS.map(c => (
            <div key={c.id} className="qtp-cap" data-done={caps.includes(c.id)}>
              <span className="dot" aria-hidden>{caps.includes(c.id) ? "✓" : ""}</span>
              {c.label}
            </div>
          ))}
        </aside>
      )}
    </div>
  )
}
