import React, { useEffect, useState } from "react"
import KycApp, { KYC_CSS, type KycCapability } from "./components/Sandbox/preview/kyc/KycApp"
import { trackEvent } from "./lib/measure"

/* ══════════════════════════════════════════════════════════════════════════
   DEMO — Onboarding & KYC, a schermo intero

   Rotta: /demo/onboarding-kyc. Stesso patto delle altre due demo: qui si
   prova un prodotto, non si legge un portfolio — il sito resta fuori, salvo
   la fascia in alto che dice da dove si è arrivati (e sparisce con ?embed,
   quando la demo vive dentro l'anteprima del Lab).

   Il flusso è in components/Sandbox/preview/kyc/: store, schema e UI
   separati come si farebbe in un progetto vero, perché la demo È
   l'argomento di vendita per questo tipo di progetti.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, system-ui, sans-serif"

const PAGE_CSS = `
  html, body { margin: 0; background: #F7F7FA; }
  .kycp-bar {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; gap: 14px;
    padding: 10px 18px;
    background: rgba(255,255,255,0.78);
    backdrop-filter: blur(18px) saturate(1.3);
    -webkit-backdrop-filter: blur(18px) saturate(1.3);
    border-bottom: 1px solid rgba(22,24,29,0.08);
    font-family: ${FONT};
  }
  .kycp-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: inherit; font-size: 13px; font-weight: 650; color: #4B5160;
    background: none; border: none; cursor: pointer; padding: 6px 4px;
  }
  .kycp-back:hover { color: #16181D; }
  .kycp-title { font-size: 13.5px; color: #16181D; }
  .kycp-title strong { font-weight: 750; letter-spacing: -0.01em; }
  .kycp-sub { display: block; font-size: 11.5px; color: #8A90A0; }
  .kycp-chips { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
  .kycp-chip {
    font-size: 10.5px; font-weight: 650; color: #5747C7;
    background: rgba(109,90,230,0.10); border-radius: 999px; padding: 4px 10px;
  }
  .kycp-caps {
    position: fixed; right: 16px; bottom: 16px; z-index: 41;
    width: 226px; border-radius: 14px; padding: 14px 16px;
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(18px) saturate(1.3);
    -webkit-backdrop-filter: blur(18px) saturate(1.3);
    border: 1px solid rgba(22,24,29,0.08);
    box-shadow: 0 14px 40px rgba(22,24,29,0.14);
    font-family: ${FONT};
  }
  .kycp-caps-t { font-size: 11px; font-weight: 750; letter-spacing: 0.08em; text-transform: uppercase; color: #8A90A0; margin: 0 0 10px; }
  .kycp-cap { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #4B5160; padding: 3.5px 0; }
  .kycp-cap[data-done="true"] { color: #16181D; }
  .kycp-cap .dot {
    width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
    border: 1.5px solid rgba(22,24,29,0.18);
    display: flex; align-items: center; justify-content: center; font-size: 9px; color: #fff;
  }
  .kycp-cap[data-done="true"] .dot { background: #12B76A; border-color: #12B76A; }
  @media (max-width: 760px) {
    .kycp-chips { display: none; }
    .kycp-caps { display: none; }
  }
`

const CAPS: { id: KycCapability; label: string }[] = [
  { id: "compila",   label: "Compila i dati (validati live)" },
  { id: "documenti", label: "Carica i tre documenti" },
  { id: "errore",    label: "Provoca un errore (file > 8 MB)" },
  { id: "invia",     label: "Invia la pratica" },
]

export default function DemoOnboardingKyc() {
  useEffect(() => { trackEvent("demo_open", { demo: "b2b-onboarding-kyc", via: "page" }) }, [])

  const [embedded] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("embed"))
  const [caps, setCaps] = useState<KycCapability[]>([])

  /* L'invio riuscito è un passo della voronka: dice che il visitatore ha
     attraversato TUTTO il flusso, non solo aperto la pagina. */
  useEffect(() => {
    if (caps.includes("invia")) trackEvent("kyc_demo_complete", { demo: "b2b-onboarding-kyc" })
  }, [caps])

  /* La rotta si condivide e si indicizza: senza questi metadati la pagina
     erediterebbe titolo e descrizione della home. */
  useEffect(() => {
    const prevTitle = document.title
    document.title = "Onboarding & KYC — demo di un flusso multistep | Nadia Maar"
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute("content") ?? null
    meta?.setAttribute("content",
      "Prova dal vivo un onboarding KYC multistep: partita IVA verificata col checksum, " +
      "caricamento documenti con stati di errore gestiti, riepilogo in vetro e invio. " +
      "React, Zustand, Zod e Framer Motion — dati dimostrativi.")
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
    <div style={{ minHeight: "100vh" }}>
      <style>{KYC_CSS}</style>
      <style>{PAGE_CSS}</style>

      {!embedded && (
        <header className="kycp-bar">
          <button type="button" className="kycp-back" onClick={back} aria-label="Torna al catalogo">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 3.5L5.5 8l4.5 4.5" />
            </svg>
            Torna al catalogo
          </button>
          <span className="kycp-title">
            <strong>Onboarding & KYC</strong>
            <span className="kycp-sub">Flusso multistep · demo su dati fittizi</span>
          </span>
          <span className="kycp-chips">
            {["React", "TypeScript", "Zustand", "Zod", "Framer Motion"].map(t => (
              <span key={t} className="kycp-chip">{t}</span>
            ))}
          </span>
        </header>
      )}

      <KycApp onCaps={setCaps} />

      {!embedded && (
        <aside className="kycp-caps" aria-label="Cose da provare">
          <p className="kycp-caps-t">Da provare</p>
          {CAPS.map(c => (
            <div key={c.id} className="kycp-cap" data-done={caps.includes(c.id)}>
              <span className="dot" aria-hidden>{caps.includes(c.id) ? "✓" : ""}</span>
              {c.label}
            </div>
          ))}
        </aside>
      )}
    </div>
  )
}
