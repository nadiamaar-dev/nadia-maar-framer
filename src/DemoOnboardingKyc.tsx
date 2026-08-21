import React, { useEffect, useState } from "react"
import KycApp, { KYC_CSS, type KycCapability } from "./components/Sandbox/preview/kyc/KycApp"
import { trackEvent } from "./lib/measure"

/* ══════════════════════════════════════════════════════════════════════════
   DEMO — Onboarding & KYC, a schermo intero

   Rotta: /demo/onboarding-kyc. Stesso patto delle altre demo: qui si prova
   un prodotto, non si legge un portfolio — il sito resta fuori, salvo la
   fascia in alto che dice da dove si è arrivati (e sparisce con ?embed,
   quando la demo vive dentro l'anteprima del Lab).

   Il flusso sta in components/Sandbox/preview/kyc/: store, schema, tema,
   ricevuta PDF e UI separati come in un progetto vero — perché per questo
   tipo di lavori la demo È l'argomento di vendita.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

const PAGE_CSS = `
  html, body { margin: 0; background: #06070B; }
  .kycp-bar {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; gap: 14px;
    padding: 11px 18px;
    background: rgba(10,11,16,0.72);
    backdrop-filter: blur(22px) saturate(1.3);
    -webkit-backdrop-filter: blur(22px) saturate(1.3);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    font-family: ${FONT};
  }
  .kycp-back {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: inherit; font-size: 13px; font-weight: 650;
    color: rgba(244,245,250,0.62);
    background: none; border: none; cursor: pointer; padding: 6px 4px;
    transition: color .18s ease;
  }
  .kycp-back:hover { color: #F4F5FA; }
  .kycp-title { font-size: 13.5px; color: #F4F5FA; }
  .kycp-title strong { font-weight: 740; letter-spacing: -0.015em; }
  .kycp-sub { display: block; font-family: ${MONO}; font-size: 11px; color: rgba(244,245,250,0.38); letter-spacing: 0.03em; }
  .kycp-chips { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
  .kycp-chip {
    font-family: ${MONO}; font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
    color: rgba(169,155,255,0.92);
    background: rgba(124,107,255,0.12); border: 1px solid rgba(124,107,255,0.22);
    border-radius: 999px; padding: 4px 10px;
  }
  .kycp-caps {
    position: fixed; right: 16px; bottom: 16px; z-index: 41;
    width: 244px; border-radius: 16px; padding: 15px 16px;
    background: linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025));
    backdrop-filter: blur(26px) saturate(1.35);
    -webkit-backdrop-filter: blur(26px) saturate(1.35);
    border: 1px solid rgba(255,255,255,0.09);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 24px 60px rgba(0,0,0,0.6);
    font-family: ${FONT};
  }
  .kycp-caps-t {
    display: flex; align-items: center; justify-content: space-between;
    font-family: ${MONO}; font-size: 10px; font-weight: 650; letter-spacing: 0.16em;
    text-transform: uppercase; color: rgba(244,245,250,0.38); margin: 0 0 11px;
  }
  .kycp-caps-t b { color: rgba(169,155,255,0.95); font-weight: 700; }
  .kycp-cap { display: flex; align-items: center; gap: 9px; font-size: 12px; color: rgba(244,245,250,0.6); padding: 4px 0; transition: color .2s ease; }
  .kycp-cap[data-done="true"] { color: #F4F5FA; }
  .kycp-cap .dot {
    width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
    border: 1.5px solid rgba(255,255,255,0.16);
    display: flex; align-items: center; justify-content: center;
    font-size: 8.5px; color: #06070B; transition: all .25s ease;
  }
  .kycp-cap[data-done="true"] .dot {
    background: #34E5A0; border-color: #34E5A0;
    box-shadow: 0 0 12px rgba(52,229,160,0.5);
  }
  @media (max-width: 860px) {
    .kycp-chips { display: none; }
    .kycp-caps { display: none; }
  }
`

const CAPS: { id: KycCapability; label: string }[] = [
  { id: "compila",   label: "Compila i dati (P.IVA col checksum)" },
  { id: "registro",  label: "Interroga il registro imprese" },
  { id: "titolari",  label: "Chiudi le quote al 100%" },
  { id: "documenti", label: "Carica i tre documenti" },
  { id: "errore",    label: "Provoca un errore (file > 8 MB)" },
  { id: "screening", label: "Guarda screening e rischio" },
  { id: "invia",     label: "Invia la pratica" },
  { id: "pdf",       label: "Scarica la ricevuta PDF" },
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
      "Prova dal vivo un onboarding KYC in cinque passi: partita IVA verificata col checksum, " +
      "titolari effettivi con quote al 100%, caricamento documenti con errori gestiti, screening " +
      "su quattro liste, punteggio di rischio e ricevuta PDF. Dati dimostrativi.")
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
    <div style={{ minHeight: "100vh", background: "#06070B" }}>
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
            <strong>Onboarding &amp; KYC</strong>
            <span className="kycp-sub">Flusso in 5 passi · dati fittizi</span>
          </span>
          <span className="kycp-chips">
            {["React", "TypeScript", "Zustand", "Zod", "Framer Motion", "pdf-lib"].map(t => (
              <span key={t} className="kycp-chip">{t}</span>
            ))}
          </span>
        </header>
      )}

      <KycApp onCaps={setCaps} />

      {!embedded && (
        <aside className="kycp-caps" aria-label="Cose da provare">
          <p className="kycp-caps-t">
            <span>Da provare</span>
            <b>{caps.length}/{CAPS.length}</b>
          </p>
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
