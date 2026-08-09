import React, { useCallback, useEffect, useState } from "react"
import { VT_CSS } from "./components/Sandbox/preview/valtecnica/style"
import ValtecnicaApp, { type Capability } from "./components/Sandbox/preview/valtecnica/ValtecnicaApp"

/* ══════════════════════════════════════════════════════════════════════════
   DEMO — Portale Fornitori Valtecnica, a schermo intero

   Vive su /demo/portale-fornitori invece che dentro un pop-up perché una
   tabella B2B densa ha bisogno di tutta la finestra, l'indirizzo si può
   mandare a un cliente e la pagina si indicizza. Il sito dell'agenzia resta
   fuori: qui dentro si prova un prodotto, non si legge un portfolio.
══════════════════════════════════════════════════════════════════════════ */

/* Le nove promesse della scheda, nell'ordine in cui conviene provarle.
   Ogni voce si spunta quando il flusso è stato davvero esercitato. */
const CAPS: { id: Capability; label: string }[] = [
  { id: "ruolo",      label: "Cambia ruolo" },
  { id: "prezzi",     label: "Prezzi per cliente" },
  { id: "preventivo", label: "Chiedi una quotazione" },
  { id: "ordine",     label: "Invia un ordine" },
  { id: "fattura",    label: "Apri una fattura" },
  { id: "assistenza", label: "Apri una pratica" },
  { id: "kpi",        label: "Muovi i KPI" },
  { id: "fornitore",  label: "Sincronizza un fornitore" },
  { id: "regola",     label: "Cambia una regola di prezzo" },
]

export default function DemoSupplierPortal() {
  const [touched, setTouched] = useState<Capability[]>([])
  const [open, setOpen] = useState(false)
  const handleCaps = useCallback((l: Capability[]) => setTouched(l), [])
  const noop = useCallback(() => {}, [])

  /* Dentro l'anteprima della griglia la pagina gira in un iframe, e lì la
     cornice la mette già l'overlay: due intestazioni sovrapposte confondono
     e rubano 52px di altezza a un riquadro che ne ha pochi. Letto una volta
     sola — la rotta non cambia mentre la pagina è viva. */
  const [embedded] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("embed"))

  /* La rotta è pensata per essere condivisa e indicizzata: senza questi
     metadati la pagina eredita titolo e descrizione della home del sito. */
  useEffect(() => {
    const prevTitle = document.title
    document.title = "Supplier Portal — demo interattiva di un portale B2B | Nadia Maar"
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute("content") ?? null
    meta?.setAttribute("content",
      "Prova dal vivo un portale B2B multi-fornitore: catalogo con prezzi per cliente, preventivi, " +
      "ordini con controllo del fido, fatturazione, sincronizzazione dei fornitori in dropshipping " +
      "e motore di prezzo con regole di ricarico. Dati dimostrativi.")
    return () => {
      document.title = prevTitle
      if (prevDesc !== null) meta?.setAttribute("content", prevDesc)
    }
  }, [])

  const back = () => {
    /* se si arriva dal catalogo la storia esiste e "indietro" è più naturale
       di una navigazione nuova, che lascerebbe la demo nello stack */
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) window.history.back()
    else window.location.assign("/foundry")
  }

  return (
    <div className="vt-root vt-demo-page">
      <style>{VT_CSS}</style>
      <style>{PAGE_CSS}</style>

      {/* ── fascia di contesto: l'unico pezzo di agenzia rimasto ─────────── */}
      {!embedded && (
      <header className="vt-demo-bar">
        <button type="button" className="vt-demo-back" onClick={back} aria-label="Torna al catalogo">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 3.5L5.5 8l4.5 4.5" />
          </svg>
          <span>Torna al catalogo</span>
        </button>

        <span className="vt-demo-sep" aria-hidden />

        <span className="vt-demo-title">
          <strong>Supplier Portal</strong>
          <span className="vt-demo-sub">Portale B2B · demo interattiva su dati fittizi</span>
        </span>

        <span className="vt-demo-tech">
          {["React", "Node.js", "PostgreSQL", "BullMQ"].map(t => (
            <span key={t} className="vt-demo-chip">{t}</span>
          ))}
        </span>

        {/* Il checklist non è decorazione: guida la visita e dimostra che ogni
            promessa della scheda è stata davvero toccata. */}
        <button type="button" className="vt-demo-prog" onClick={() => setOpen(o => !o)}
          aria-expanded={open} aria-controls="vt-demo-caps">
          <span className="vt-demo-prog-bar" aria-hidden>
            <span style={{ width: `${(touched.length / CAPS.length) * 100}%` }} />
          </span>
          {touched.length}/{CAPS.length} funzioni provate
        </button>

        {open && (
          <div className="vt-demo-caps" id="vt-demo-caps">
            {CAPS.map(c => {
              const done = touched.includes(c.id)
              return (
                <span key={c.id} className={`vt-demo-cap${done ? " is-done" : ""}`}>
                  <span className="vt-demo-box">{done ? "✓" : ""}</span>{c.label}
                </span>
              )
            })}
          </div>
        )}
      </header>
      )}

      <div className="vt-demo-app">
        <ValtecnicaApp onRoute={noop} onCapability={handleCaps} onExit={back} />
      </div>
    </div>
  )
}

const PAGE_CSS = `
.vt-demo-page {
  position:fixed; inset:0; display:flex; flex-direction:column;
  background:var(--vt-desk); overflow:hidden;
}
.vt-demo-bar {
  position:relative; flex-shrink:0; height:52px; display:flex; align-items:center; gap:14px;
  padding:0 18px; background:var(--vt-sheet); border-bottom:1px solid var(--vt-line);
}
.vt-demo-back {
  display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px 0 10px;
  border-radius:var(--vt-r-pill); background:var(--vt-sheet-alt); color:var(--vt-ink);
  font-size:13px; font-weight:500; flex-shrink:0;
  transition:background 160ms var(--vt-e);
}
.vt-demo-back:hover { background:var(--vt-line); }
.vt-demo-sep { width:1px; height:22px; background:var(--vt-line); flex-shrink:0; }
.vt-demo-title { display:flex; flex-direction:column; min-width:0; }
.vt-demo-title strong { font-size:14px; font-weight:600; letter-spacing:-0.015em; }
.vt-demo-sub { font-size:11.5px; color:var(--vt-ink-faint); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.vt-demo-tech { display:flex; gap:6px; margin-left:auto; flex-shrink:0; }
.vt-demo-chip {
  font-size:11px; color:var(--vt-ink-faint); border:1px solid var(--vt-line);
  border-radius:var(--vt-r-pill); padding:3px 9px; white-space:nowrap;
}
.vt-demo-prog {
  display:inline-flex; align-items:center; gap:9px; height:34px; padding:0 14px;
  border-radius:var(--vt-r-pill); background:var(--vt-sheet-alt); color:var(--vt-ink);
  font-size:12.5px; font-weight:500; flex-shrink:0;
}
.vt-demo-prog:hover { background:var(--vt-line); }
.vt-demo-prog-bar {
  width:54px; height:5px; border-radius:999px; background:var(--vt-line); overflow:hidden; flex-shrink:0;
}
.vt-demo-prog-bar > span {
  display:block; height:100%; background:var(--vt-ember-fill); border-radius:999px;
  transition:width 320ms var(--vt-e);
}
.vt-demo-caps {
  position:absolute; top:calc(100% + 8px); right:18px; z-index:60;
  background:var(--vt-sheet); border-radius:16px; box-shadow:var(--vt-sh-pop);
  padding:12px 16px; display:flex; flex-direction:column; gap:9px; min-width:230px;
}
.vt-demo-cap { display:flex; align-items:center; gap:9px; font-size:13px; color:var(--vt-ink-faint); }
.vt-demo-cap.is-done { color:var(--vt-ink); }
.vt-demo-box {
  width:16px; height:16px; flex-shrink:0; border:1px solid var(--vt-line); border-radius:5px;
  display:flex; align-items:center; justify-content:center; font-size:10px; line-height:1;
}
.vt-demo-cap.is-done .vt-demo-box { background:var(--vt-ember-fill); border-color:var(--vt-ember-fill); color:#FFFFFF; }

.vt-demo-app { flex:1; min-height:0; min-width:0; display:flex; }
.vt-demo-app > .vt-app { flex:1; min-width:0; }

@media (max-width: 900px) {
  .vt-demo-tech { display:none; }
}
@media (max-width: 640px) {
  .vt-demo-bar { gap:10px; padding:0 12px; }
  .vt-demo-sep, .vt-demo-sub { display:none; }
  .vt-demo-back span { display:none; }
  .vt-demo-back { width:34px; padding:0; justify-content:center; }
  .vt-demo-prog { margin-left:auto; }
}
`
