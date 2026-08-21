/* ══════════════════════════════════════════════════════════════════════════
   PREVENTIVO & ROI — il vestito.

   Identità propria, come ogni demo del Lab, e volutamente diversa da quella
   dell'onboarding KYC: là vetro viola e aurore, qui nero da sala macchine,
   reticolo tecnico, cifre monospaziate e una sola luce ciano su ciò che è
   acceso. Due demo che si somigliassero direbbero che sappiamo fare un
   tema solo.

   Il pannello del preventivo è di vetro perché deve restare leggibile
   sopra il contenuto che scorre sotto: è l'unico punto in cui la
   trasparenza serve a qualcosa invece di essere decorazione.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export const QUOTE_CSS = `
.qt-root {
  --nero: #05070A;
  --ink: #EAF2F4;
  --ink-2: rgba(234,242,244,0.62);
  --ink-3: rgba(234,242,244,0.36);
  --linea: rgba(255,255,255,0.085);
  --linea-2: rgba(255,255,255,0.05);
  --ciano: #2DE1C2;
  --ciano-2: #7BF3DC;
  --ciano-glow: rgba(45,225,194,0.35);
  --ambra: #FFC46B;
  --rosso: #FF6B78;
  --vetro: rgba(255,255,255,0.035);

  position: relative; min-height: 100%;
  font-family: ${FONT}; color: var(--ink); background: var(--nero);
  -webkit-font-smoothing: antialiased;
}

/* reticolo tecnico: due gradienti ripetuti, nessuna immagine */
.qt-root::before {
  content: ""; position: fixed; inset: 0; z-index: -2; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%);
  -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%);
}
/* alone ciano in alto: dà profondità senza illuminare il testo */
.qt-root::after {
  content: ""; position: fixed; top: -30%; left: 50%; width: 120%; height: 70%;
  transform: translateX(-50%); z-index: -1; pointer-events: none;
  background: radial-gradient(50% 60% at 50% 50%, rgba(45,225,194,0.10), transparent 70%);
  filter: blur(20px);
}

.qt-shell { position: relative; max-width: 1180px; margin: 0 auto; padding: clamp(20px,3.6vw,40px) 18px 40px; }
.qt-grid { display: grid; grid-template-columns: minmax(0,1fr) 358px; gap: 22px; align-items: start; }

/* ── testata ─────────────────────────────────────────────────────────── */
.qt-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.qt-mark {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: ${MONO}; font-weight: 700; font-size: 15px; color: #04120F;
  background: linear-gradient(140deg, var(--ciano), #16B79C);
  box-shadow: 0 6px 22px var(--ciano-glow);
}
.qt-brand-n { font-weight: 700; font-size: 15px; letter-spacing: -0.015em; }
.qt-brand-s { font-family: ${MONO}; font-size: 11px; color: var(--ink-3); letter-spacing: 0.04em; }

/* ── passi ───────────────────────────────────────────────────────────── */
.qt-passi { display: flex; align-items: center; gap: 4px; margin-bottom: 18px; flex-wrap: wrap; }
.qt-passo {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: ${MONO}; font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--ink-3);
  background: none; border: none; padding: 7px 10px; border-radius: 8px;
  transition: color .2s ease, background .2s ease;
}
.qt-passo[data-on="true"] { cursor: pointer; }
.qt-passo[data-on="true"]:hover { color: var(--ink-2); background: var(--vetro); }
.qt-passo[data-stato="attivo"] { color: var(--ciano); background: rgba(45,225,194,0.08); }
.qt-passo[data-stato="fatto"] { color: var(--ink-2); }
.qt-passo .n { font-size: 10px; opacity: 0.7; }
.qt-passo-sep { width: 16px; height: 1px; background: var(--linea); flex-shrink: 0; }

/* ── pannelli ────────────────────────────────────────────────────────── */
.qt-pan {
  background: linear-gradient(165deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
  border: 1px solid var(--linea); border-radius: 18px;
  padding: clamp(18px,2.6vw,26px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 20px 50px rgba(0,0,0,0.5);
}
.qt-h1 { font-size: clamp(19px,2.4vw,23px); font-weight: 760; letter-spacing: -0.03em; margin: 0 0 6px; }
.qt-lead { font-size: 13.5px; line-height: 1.65; color: var(--ink-2); margin: 0 0 20px; max-width: 62ch; }
.qt-lead b { color: var(--ink); font-weight: 640; }

/* ── carte scegliibili ───────────────────────────────────────────────── */
.qt-carte { display: grid; gap: 11px; }
.qt-carte[data-col="3"] { grid-template-columns: repeat(3, 1fr); }
.qt-carte[data-col="2"] { grid-template-columns: repeat(2, 1fr); }
.qt-carta {
  position: relative; text-align: left; overflow: hidden;
  font-family: inherit; color: var(--ink); cursor: pointer;
  background: var(--vetro); border: 1px solid var(--linea); border-radius: 14px;
  padding: 16px; transition: border-color .2s ease, background .2s ease, transform .2s ease;
}
.qt-carta:hover:not([data-off="true"]) { border-color: rgba(45,225,194,0.4); background: rgba(45,225,194,0.05); transform: translateY(-1.5px); }
.qt-carta[data-on="true"] {
  border-color: var(--ciano); background: rgba(45,225,194,0.09);
  box-shadow: 0 0 0 1px rgba(45,225,194,0.3), 0 10px 28px rgba(45,225,194,0.14);
}
.qt-carta[data-off="true"] { opacity: 0.42; cursor: not-allowed; }
.qt-carta-t { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.qt-carta-n { font-size: 14px; font-weight: 680; letter-spacing: -0.015em; }
.qt-carta-p { margin-left: auto; font-family: ${MONO}; font-size: 13px; font-weight: 600; color: var(--ciano); white-space: nowrap; }
.qt-carta[data-off="true"] .qt-carta-p { color: var(--ink-3); }
.qt-carta-s { font-size: 12px; line-height: 1.55; color: var(--ink-2); margin: 0; }
.qt-carta-m { display: flex; align-items: center; gap: 6px; font-size: 11.5px; line-height: 1.5; color: var(--ambra); margin: 9px 0 0; }
.qt-carta-m[data-tipo="richiede"] { color: var(--ciano-2); }
.qt-tratti { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
.qt-tratto {
  font-family: ${MONO}; font-size: 10px; letter-spacing: 0.03em; color: var(--ink-3);
  border: 1px solid var(--linea); border-radius: 999px; padding: 3px 8px;
}
.qt-spunta {
  position: absolute; top: 12px; right: 12px; width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--ciano); color: #04120F;
}
/* la riga di luce che scorre sul bordo superiore di una carta accesa */
.qt-carta[data-on="true"]::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--ciano-2), transparent);
}

/* ── cursori dell'attività ───────────────────────────────────────────── */
.qt-campi { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
.qt-campo-t { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
.qt-campo-l { font-size: 12.5px; font-weight: 620; color: var(--ink-2); }
.qt-campo-v { font-family: ${MONO}; font-size: 13px; font-weight: 650; color: var(--ciano); }
.qt-range { width: 100%; appearance: none; height: 4px; border-radius: 3px; background: rgba(255,255,255,0.10); outline: none; }
.qt-range::-webkit-slider-thumb {
  appearance: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer;
  background: var(--ciano); border: 2px solid #04120F; box-shadow: 0 0 12px var(--ciano-glow);
}
.qt-range::-moz-range-thumb {
  width: 14px; height: 14px; border-radius: 50%; cursor: pointer; border: 2px solid #04120F;
  background: var(--ciano); box-shadow: 0 0 12px var(--ciano-glow);
}
.qt-campo-n { font-size: 11px; color: var(--ink-3); margin: 6px 0 0; line-height: 1.5; }

/* ── preventivo (colonna di destra) ──────────────────────────────────── */
.qt-conto {
  position: sticky; top: 18px;
  background: linear-gradient(165deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  backdrop-filter: blur(26px) saturate(1.3); -webkit-backdrop-filter: blur(26px) saturate(1.3);
  border: 1px solid var(--linea); border-radius: 18px; padding: 20px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 60px rgba(0,0,0,0.55);
}
.qt-conto-t {
  display: flex; align-items: center; justify-content: space-between;
  font-family: ${MONO}; font-size: 10.5px; font-weight: 650; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-3); margin: 0 0 14px;
}
.qt-conto-t i { width: 6px; height: 6px; border-radius: 50%; background: var(--ciano); box-shadow: 0 0 10px var(--ciano); }
.qt-righe { list-style: none; margin: 0 0 14px; padding: 0; max-height: 232px; overflow-y: auto; }
.qt-riga { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--linea-2); }
.qt-riga:last-child { border-bottom: none; }
.qt-riga-v { font-size: 12.5px; font-weight: 620; line-height: 1.4; }
.qt-riga-d { font-size: 10.5px; color: var(--ink-3); margin-top: 3px; line-height: 1.45; }
.qt-riga-p { margin-left: auto; font-family: ${MONO}; font-size: 12.5px; font-weight: 620; white-space: nowrap; }
.qt-riga[data-rett="true"] .qt-riga-p { color: var(--ambra); }
.qt-vuoto { font-size: 12.5px; color: var(--ink-3); line-height: 1.6; margin: 0 0 14px; }

.qt-tot { border-top: 1px solid var(--linea); padding-top: 14px; }
.qt-tot-r { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
.qt-tot-l { font-size: 12px; color: var(--ink-3); }
.qt-tot-v { font-family: ${MONO}; font-size: 25px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); }
/* la pulsazione del totale: parte solo quando il numero cambia davvero */
@keyframes qt-batti {
  0% { transform: scale(1); color: var(--ink); }
  35% { transform: scale(1.05); color: var(--ciano); text-shadow: 0 0 22px var(--ciano-glow); }
  100% { transform: scale(1); color: var(--ink); }
}
.qt-tot-v[data-batte="true"] { animation: qt-batti .52s cubic-bezier(0.16,1,0.3,1); transform-origin: right center; }
.qt-tot-n { font-family: ${MONO}; font-size: 11px; color: var(--ink-3); letter-spacing: 0.03em; }

/* ── ritorno ─────────────────────────────────────────────────────────── */
.qt-roi { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--linea); }
.qt-roi-r { display: flex; align-items: baseline; justify-content: space-between; font-size: 12px; padding: 5px 0; }
.qt-roi-l { color: var(--ink-3); }
.qt-roi-v { font-family: ${MONO}; font-weight: 620; color: var(--ink); }
.qt-roi-v[data-buono="true"] { color: var(--ciano); }
.qt-rientro {
  margin-top: 12px; padding: 12px 14px; border-radius: 12px;
  background: rgba(45,225,194,0.08); border: 1px solid rgba(45,225,194,0.26);
}
.qt-rientro-n { font-family: ${MONO}; font-size: 22px; font-weight: 700; color: var(--ciano); letter-spacing: -0.02em; }
.qt-rientro-l { font-size: 11.5px; color: var(--ink-2); margin-top: 3px; line-height: 1.5; }
.qt-barra { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.08); margin-top: 10px; overflow: hidden; display: flex; }
.qt-barra i { height: 100%; transition: width .5s cubic-bezier(0.16,1,0.3,1); }

/* ── azioni ──────────────────────────────────────────────────────────── */
.qt-nav { display: flex; gap: 10px; margin-top: 20px; }
.qt-btn {
  font-family: inherit; font-size: 13.5px; font-weight: 700; letter-spacing: -0.01em;
  border-radius: 11px; padding: 12px 20px; cursor: pointer; border: 1px solid transparent;
  transition: transform .16s ease, box-shadow .22s ease, opacity .2s ease, background .2s ease;
}
.qt-btn.pri {
  margin-left: auto; color: #04120F;
  background: linear-gradient(140deg, var(--ciano), #19C4A8);
  box-shadow: 0 8px 24px var(--ciano-glow);
}
.qt-btn.pri:hover:not(:disabled) { transform: translateY(-1.5px); box-shadow: 0 12px 32px rgba(45,225,194,0.48); }
.qt-btn.pri:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
.qt-btn.gho { background: var(--vetro); border-color: var(--linea); color: var(--ink-2); }
.qt-btn.gho:hover { border-color: rgba(255,255,255,0.24); color: var(--ink); }
.qt-btn.mini { padding: 9px 13px; font-size: 12px; border-radius: 9px; }
.qt-btn.wide { width: 100%; margin-left: 0; justify-content: center; }

/* ── JSON ────────────────────────────────────────────────────────────── */
.qt-json {
  margin: 0; padding: 15px 16px; border-radius: 12px; overflow: auto; max-height: 340px;
  background: rgba(0,0,0,0.5); border: 1px solid var(--linea);
  font-family: ${MONO}; font-size: 11.5px; line-height: 1.6; color: rgba(234,242,244,0.82);
}
.qt-json .k { color: var(--ciano-2); }
.qt-json .n { color: var(--ambra); }
.qt-json .s { color: rgba(234,242,244,0.9); }
.qt-json .b { color: var(--rosso); }
.qt-azioni-json { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }

@media (max-width: 1000px) {
  .qt-grid { grid-template-columns: 1fr; }
  .qt-conto { position: static; }
  .qt-carte[data-col="3"] { grid-template-columns: 1fr; }
}
@media (max-width: 620px) {
  .qt-carte[data-col="2"] { grid-template-columns: 1fr; }
  .qt-campi { grid-template-columns: 1fr; }
  .qt-nav { flex-direction: column-reverse; }
  .qt-btn.pri { margin-left: 0; }
  .qt-passi .lbl { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .qt-tot-v[data-batte="true"] { animation: none; }
  .qt-carta:hover:not([data-off="true"]) { transform: none; }
}
`
