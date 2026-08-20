import React, { useCallback, useEffect, useRef, useState } from "react"
import { Q_CSS } from "./components/Sandbox/preview/quadrante/style"
import QuadranteApp, { type Capability } from "./components/Sandbox/preview/quadrante/QuadranteApp"

/* ══════════════════════════════════════════════════════════════════════════
   DEMO — Quadrante CRM, a schermo intero

   Vive su /demo/crm-vendite invece che dentro un pop-up: un board kanban ha
   bisogno di tutta la finestra, l'indirizzo si può mandare a un cliente e la
   pagina si indicizza. Il sito dell'agenzia resta fuori — qui dentro si prova
   un prodotto, non si legge un portfolio.
══════════════════════════════════════════════════════════════════════════ */

/* Le promesse, nell'ordine in cui conviene provarle. Ogni voce si spunta
   quando il flusso è stato davvero esercitato, non quando la schermata è
   stata aperta. */
const CAPS: { id: Capability; label: string }[] = [
  { id: "sposta",   label: "Sposta una trattativa" },
  { id: "cliente",  label: "Apri una scheda cliente" },
  { id: "nota",     label: "Scrivi una nota" },
  { id: "crea",     label: "Crea un cliente" },
  { id: "archivia", label: "Archivia un cliente" },
  { id: "cerca",    label: "Cerca con ⌘K" },
  { id: "analisi",  label: "Guarda l'analisi" },
  { id: "pdf",      label: "Scarica il rapporto" },
]

export default function DemoCrmDashboard() {
  const [touched, setTouched] = useState<Capability[]>([])
  const [open, setOpen] = useState(false)
  const handleCaps = useCallback((l: Capability[]) => setTouched(l), [])

  /* Il pannello si chiude con Escape o cliccando fuori. Il «fuori» è un velo
     trasparente a tutto schermo, non un ascoltatore su document: con
     l'ascoltatore il clic chiude il pannello E arriva anche a quello che sta
     sotto, così chi voleva solo chiudere si ritrova una scheda cliente
     aperta per sbaglio. Il velo se lo mangia. */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false) } }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [open])

  /* Dentro l'anteprima della griglia la pagina gira in un iframe, e lì la
     cornice la mette già l'overlay: due intestazioni sovrapposte confondono
     e rubano altezza a un riquadro che ne ha poca. Letto una volta sola —
     la rotta non cambia mentre la pagina è viva. */
  const [embedded] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("embed"))

  /* La rotta è pensata per essere condivisa e indicizzata: senza questi
     metadati la pagina eredita titolo e descrizione della home del sito. */
  useEffect(() => {
    const prevTitle = document.title
    document.title = "CRM Dashboard — demo interattiva di un CRM vendite | Nadia Maar"
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute("content") ?? null
    meta?.setAttribute("content",
      "Prova dal vivo un CRM di vendita: pipeline kanban trascinabile, scheda cliente con " +
      "cronologia di chiamate e riunioni, imbuto di conversione, andamento mensile e " +
      "rapporto PDF scaricabile. Dati dimostrativi.")
    return () => {
      document.title = prevTitle
      if (prevDesc !== null) meta?.setAttribute("content", prevDesc)
    }
  }, [])

  const back = () => {
    /* se si arriva dal catalogo la storia esiste e «indietro» è più naturale
       di una navigazione nuova, che lascerebbe la demo nello stack */
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) window.history.back()
    else window.location.assign("/foundry")
  }

  const noop = useCallback(() => {}, [])

  return (
    <div className="q-root q-demo-page">
      <style>{Q_CSS}</style>
      <style>{PAGE_CSS}</style>

      {!embedded && (
        <header className="q-demo-bar">
          <button type="button" className="q-demo-back" onClick={back} aria-label="Torna al catalogo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 3.5L5.5 8l4.5 4.5" />
            </svg>
            <span>Torna al catalogo</span>
          </button>

          <span className="q-demo-sep" aria-hidden />

          <span className="q-demo-title">
            <strong>CRM Dashboard</strong>
            <span className="q-demo-sub">Quadrante · demo interattiva su dati fittizi</span>
          </span>

          <span className="q-demo-tech">
            {["React", "TypeScript", "SVG", "pdf-lib"].map(t => (
              <span key={t} className="q-demo-chip">{t}</span>
            ))}
          </span>

          {/* Il checklist non è decorazione: guida la visita e dimostra che ogni
              promessa della scheda è stata davvero toccata. */}
          <div className="q-demo-progwrap">
            <button type="button" className="q-demo-prog" onClick={() => setOpen(o => !o)}
              aria-expanded={open} aria-controls="q-demo-caps">
              <span className="q-demo-prog-bar" aria-hidden>
                <span style={{ width: `${(touched.length / CAPS.length) * 100}%` }} />
              </span>
              {touched.length}/{CAPS.length} funzioni provate
            </button>

            {open && <div className="q-demo-shade" onClick={() => setOpen(false)} aria-hidden />}
            {open && (
              <div className="q-demo-caps" id="q-demo-caps" role="group"
                aria-label="Funzioni della demo">
                <p className="q-demo-caps-head">
                  {touched.length === CAPS.length
                    ? "Provate tutte. Grazie per la pazienza."
                    : "Si spuntano provandole davvero, non aprendo la schermata."}
                </p>
                {CAPS.map(c => {
                  const done = touched.includes(c.id)
                  return (
                    <span key={c.id} className={`q-demo-cap${done ? " is-done" : ""}`}>
                      <span className="q-demo-box" aria-hidden>{done ? "✓" : ""}</span>
                      {c.label}
                      <span className="q-demo-sr">{done ? " — fatto" : " — da provare"}</span>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </header>
      )}

      <div className="q-demo-app">
        <QuadranteApp onCapability={handleCaps} onExit={back} />
      </div>
    </div>
  )
}

/* ── il telaio della pagina ───────────────────────────────────────────────
   Questo foglio vive fuori da style.ts e usa gli stessi token: quando la
   demo è passata da tema scuro a tema chiaro, --q-panel/--q-panel-2/
   --q-panel-3/--q-bg/--q-on-lime sono spariti da style.ts e qui sono
   rimasti scritti. Una variabile CSS che non esiste non è un errore: il
   browser la ignora e la proprietà torna al valore iniziale — cioè
   background trasparente. Risultato: barra e pannello del checklist erano
   testo quasi bianco su niente. L'audit dei token morti girava solo su
   style.ts e non poteva vederli.
   Sotto ci sono soltanto token vivi, e c'è un test che lo verifica. */
const PAGE_CSS = `
.q-demo-page {
  position:fixed; inset:0; display:flex; flex-direction:column;
  background:var(--q-page); overflow:hidden;
}
.q-demo-bar {
  position:relative; z-index:2; flex-shrink:0; height:52px;
  display:flex; align-items:center; gap:14px;
  padding:0 18px; background:var(--q-dark); color:var(--q-on-dark);
}
.q-demo-back {
  display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px 0 10px;
  border-radius:var(--q-r-pill); background:var(--q-dark-2); color:var(--q-on-dark);
  font-size:13px; font-weight:500; flex-shrink:0;
  transition:background 160ms var(--q-e);
}
.q-demo-back:hover { background:var(--q-dark-3); }
.q-demo-sep { width:1px; height:22px; background:var(--q-line-dark-2); flex-shrink:0; }
.q-demo-title { display:flex; flex-direction:column; min-width:0; }
.q-demo-title strong { font-size:14px; font-weight:600; letter-spacing:-0.015em; }
.q-demo-sub {
  font-size:11.5px; color:var(--q-on-dark-faint);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.q-demo-tech { display:flex; gap:6px; margin-left:auto; flex-shrink:0; }
.q-demo-chip {
  font-size:11px; color:var(--q-on-dark-faint);
  border:1px solid var(--q-line-dark-2); border-radius:var(--q-r-pill);
  padding:3px 9px; white-space:nowrap;
}
.q-demo-progwrap { position:relative; flex-shrink:0; }
.q-demo-prog {
  display:inline-flex; align-items:center; gap:9px; height:34px; padding:0 14px;
  border-radius:var(--q-r-pill); background:var(--q-dark-2); color:var(--q-on-dark);
  font-size:12.5px; font-weight:500; white-space:nowrap;
  transition:background 160ms var(--q-e);
}
.q-demo-prog:hover, .q-demo-prog[aria-expanded="true"] { background:var(--q-dark-3); }
.q-demo-prog-bar {
  width:54px; height:5px; border-radius:999px; background:rgba(255,255,255,0.20);
  overflow:hidden; flex-shrink:0;
}
.q-demo-prog-bar > span {
  display:block; height:100%; background:var(--q-lime); border-radius:999px;
  transition:width 320ms var(--q-e);
}
.q-demo-shade { position:fixed; inset:0; z-index:59; }
.q-demo-caps {
  position:absolute; top:calc(100% + 10px); right:0; z-index:60; width:270px;
  background:var(--q-dark); color:var(--q-on-dark);
  border-radius:var(--q-r-lg); box-shadow:var(--q-sh-pop);
  padding:14px 16px 15px; display:flex; flex-direction:column; gap:10px;
}
.q-demo-caps-head {
  font-size:11px; line-height:1.45; color:var(--q-on-dark-faint);
  padding-bottom:11px; border-bottom:1px solid var(--q-line-dark-2);
}
.q-demo-cap { display:flex; align-items:center; gap:9px; font-size:13px; color:var(--q-on-dark-faint); }
.q-demo-cap.is-done { color:var(--q-on-dark); }
.q-demo-box {
  width:17px; height:17px; flex-shrink:0; border:1px solid var(--q-line-dark-2);
  border-radius:5px; display:flex; align-items:center; justify-content:center;
  font-size:10px; line-height:1;
}
.q-demo-cap.is-done .q-demo-box {
  background:var(--q-lime); border-color:var(--q-lime); color:var(--q-on-pastel);
}
/* la spunta è un carattere decorativo: chi legge con la sintesi vocale
   sente questo, non un «✓» che a seconda della voce diventa silenzio */
.q-demo-sr {
  position:absolute; width:1px; height:1px; overflow:hidden;
  clip:rect(0 0 0 0); clip-path:inset(50%); white-space:nowrap;
}

.q-demo-app { flex:1; min-height:0; min-width:0; display:flex; }
.q-demo-app > .q-app { flex:1; min-width:0; }

@media (max-width: 900px) {
  .q-demo-tech { display:none; }
  /* i chip portavano il margin-left:auto: senza di loro il checklist
     resterebbe appiccicato al titolo invece che al bordo destro */
  .q-demo-progwrap { margin-left:auto; }
}
@media (max-width: 640px) {
  .q-demo-bar { gap:10px; padding:0 12px; }
  .q-demo-sep, .q-demo-sub { display:none; }
  .q-demo-back span { display:none; }
  .q-demo-back { width:34px; padding:0; justify-content:center; }
  .q-demo-title strong { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .q-demo-caps { width:min(270px,calc(100vw - 24px)); }
}
`
