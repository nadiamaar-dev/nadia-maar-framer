/* ══════════════════════════════════════════════════════════════════════════
   PREVENTIVO & ROI — il vestito.

   Terza versione, e un cambio di registro completo: da scuro tecnico a
   CHIARO da cruscotto. Fondo avorio caldo, schede bianche con angoli
   generosi e ombre appena accennate, un solo accento verde salvia. È il
   linguaggio dei pannelli finanziari moderni — e nessuna delle altre demo
   del Lab lo usa: il portale fornitori è blu scuro, il CRM verde lime su
   nero, l'onboarding KYC viola su nero. Questa è l'unica chiara, e si
   riconosce a colpo d'occhio nel catalogo.

   LE REGOLE DI QUESTO TEMA
   · Le ombre restano una sola per scheda, ma con un secondo strato corto
     che disegna il bordo: su fondo chiaro la sola ombra larga non basta a
     staccare il bianco dall'avorio, e le schede sembrano galleggiare in
     una nebbia. Due strati — uno di 1px quasi nero, uno largo e tenue —
     danno il contorno senza sporcare.
   · Nessun bordo grigio attorno alle schede. Il contrasto fra il bianco e
     il fondo avorio basta a definirle; un bordo in più le farebbe sembrare
     tabelle.
   · L'accento salvia dipinge UNA scheda per schermata (quella del totale) e
     gli stati attivi. Se il verde è ovunque, non guida più lo sguardo.
   · I numeri grandi sono in Plus Jakarta Sans (già self-hosted nel sito),
     i numeri tabellari in JetBrains Mono: incolonnati, un prezzo non balla
     mai rispetto a quello sopra.
══════════════════════════════════════════════════════════════════════════ */

const DISPLAY = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
const TESTO = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export const QUOTE_CSS = `
.qt-root {
  --avorio: #E4E1D8;
  --carta: #FFFFFF;
  --inchiostro: #171A16;
  --ink-2: #565C52;
  --ink-3: #7E857A;
  --salvia: #4E6353;
  --salvia-scuro: #35452F;
  --salvia-chiaro: #DFE7DD;
  --salvia-vivo: #7E9480;
  --su: #3F9E6A;
  --giu: #D2694E;
  --oro: #C9A227;
  --linea: rgba(23,26,22,0.11);
  --ombra: 0 0 0 1px rgba(23,26,22,0.05), 0 3px 14px rgba(23,26,22,0.07);
  --ombra-alta: 0 0 0 1px rgba(23,26,22,0.07), 0 8px 26px rgba(23,26,22,0.12);
  --raggio: 22px;

  position: relative; min-height: 100%;
  font-family: ${TESTO}; color: var(--inchiostro);
  background: var(--avorio);
  -webkit-font-smoothing: antialiased;
}

.qt-shell {
  position: relative; max-width: 1340px; margin: 0 auto;
  padding: clamp(16px,2.4vw,28px) clamp(14px,2vw,24px) 40px;
  display: grid; grid-template-columns: 64px minmax(0,1fr); gap: 18px; align-items: start;
}

/* ── colonna delle icone, a sinistra ─────────────────────────────────────
   Non è decorazione: è la navigazione fra i passi, ridotta all'osso. Le
   etichette vivono nel tooltip nativo — su un cruscotto la barra laterale
   deve costare 64px, non 200. */
.qt-rail {
  position: sticky; top: 18px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 12px 8px; border-radius: 999px;
  background: var(--carta); box-shadow: var(--ombra);
}
.qt-rail-b {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: ${MONO}; font-size: 12px; font-weight: 700;
  color: var(--ink-3); background: transparent; border: none; cursor: default;
  transition: background .2s ease, color .2s ease, box-shadow .2s ease;
}
.qt-rail-b[data-on="true"] { cursor: pointer; color: var(--ink-2); }
.qt-rail-b[data-on="true"]:hover { background: var(--salvia-chiaro); color: var(--salvia-scuro); }
.qt-rail-b[data-stato="attivo"] {
  background: var(--inchiostro); color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(23,26,22,0.32);
}
.qt-rail-b[data-stato="fatto"] { color: var(--salvia-scuro); background: var(--salvia-chiaro); }
.qt-rail-sep { width: 20px; height: 1px; background: var(--linea); margin: 4px 0; }

/* ── testata ─────────────────────────────────────────────────────────── */
.qt-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
.qt-saluto { flex: 1 1 320px; min-width: 0; }
.qt-titolone {
  font-family: ${DISPLAY}; font-size: clamp(21px,2.5vw,27px); font-weight: 750;
  letter-spacing: -0.03em; margin: 0 0 5px; color: var(--inchiostro);
}
.qt-sottotitolo { font-size: 13.5px; line-height: 1.6; color: var(--ink-2); margin: 0; max-width: 62ch; }
.qt-sottotitolo b { color: var(--inchiostro); font-weight: 620; }
.qt-azioni-top { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* ── pillole d'azione in alto ────────────────────────────────────────── */
.qt-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: ${TESTO}; font-size: 12.5px; font-weight: 600; color: var(--ink-2);
  background: var(--carta); border: none; border-radius: 999px;
  padding: 10px 16px; cursor: pointer; box-shadow: var(--ombra);
  transition: color .18s ease, box-shadow .2s ease, transform .16s ease;
}
.qt-pill:hover:not(:disabled) { color: var(--inchiostro); box-shadow: var(--ombra-alta); transform: translateY(-1px); }
.qt-pill:disabled { opacity: 0.42; cursor: not-allowed; }
.qt-pill.tondo { padding: 0; width: 40px; height: 40px; justify-content: center; }

/* ── riga dei KPI ────────────────────────────────────────────────────── */
.qt-kpi-riga { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 14px; }
.qt-kpi {
  position: relative; overflow: hidden;
  background: var(--carta); border-radius: var(--raggio); padding: 16px 18px;
  box-shadow: var(--ombra); min-height: 92px;
  display: flex; align-items: center; gap: 12px;
}
.qt-kpi-testo { min-width: 0; flex: 1; }
.qt-kpi-l { font-size: 11.5px; color: var(--ink-3); margin: 0 0 4px; font-weight: 500; }
.qt-kpi-v {
  font-family: ${DISPLAY}; font-size: clamp(17px,1.9vw,21px); font-weight: 750;
  letter-spacing: -0.03em; margin: 0; color: var(--inchiostro);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.qt-kpi-n { font-size: 11px; color: var(--ink-3); margin: 3px 0 0; }
.qt-kpi-icona {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--salvia-chiaro); color: var(--salvia);
}
.qt-kpi-graf { flex-shrink: 0; }

/* la quarta scheda è l'unica dipinta: è il numero che conta davvero */
.qt-kpi.forte { background: var(--salvia); color: #FFFFFF; }
.qt-kpi.forte .qt-kpi-l, .qt-kpi.forte .qt-kpi-n { color: rgba(255,255,255,0.72); }
.qt-kpi.forte .qt-kpi-v { color: #FFFFFF; }
.qt-kpi.forte .qt-kpi-icona { background: rgba(255,255,255,0.16); color: #FFFFFF; }

.qt-delta { display: inline-flex; align-items: center; gap: 3px; font-family: ${MONO}; font-size: 11px; font-weight: 650; }
.qt-delta[data-verso="su"] { color: var(--su); }
.qt-delta[data-verso="giu"] { color: var(--giu); }
.qt-kpi.forte .qt-delta { color: #FFFFFF; }

/* ── griglia principale ──────────────────────────────────────────────── */
.qt-grid {
  display: grid; gap: 14px; align-items: start;
  grid-template-columns: minmax(0,1fr) 316px;
  grid-template-areas: "main quote" "piano quote";
}
.qt-pan   { grid-area: main; }
.qt-conto { grid-area: quote; }
.qt-piano { grid-area: piano; }

@media (min-width: 1180px) {
  .qt-grid {
    grid-template-columns: minmax(0,1fr) 300px 232px;
    grid-template-areas: "main quote caps" "piano quote caps";
  }
  .qt-caps { grid-area: caps; position: sticky; top: 18px; }
}

/* ── schede ──────────────────────────────────────────────────────────── */
.qt-pan, .qt-conto, .qt-caps, .qt-piano, .qt-extra {
  background: var(--carta); border-radius: var(--raggio); box-shadow: var(--ombra);
}
.qt-pan { padding: clamp(20px,2.4vw,26px); }
.qt-h1 {
  font-family: ${DISPLAY}; font-size: clamp(17px,2vw,20px); font-weight: 720;
  letter-spacing: -0.025em; margin: 0 0 6px; color: var(--inchiostro);
}
.qt-lead { font-size: 13px; line-height: 1.6; color: var(--ink-2); margin: 0 0 18px; max-width: 60ch; }
.qt-lead b { color: var(--inchiostro); font-weight: 620; }

/* ── carte scegliibili ───────────────────────────────────────────────── */
.qt-carte { display: grid; gap: 10px; }
.qt-carte[data-col="3"] { grid-template-columns: repeat(3, 1fr); }
.qt-carte[data-col="2"] { grid-template-columns: repeat(2, 1fr); }
.qt-carta {
  position: relative; text-align: left; overflow: hidden;
  font-family: inherit; color: var(--inchiostro); cursor: pointer;
  background: #F7F7F4; border: 1.5px solid rgba(23,26,22,0.07); border-radius: 16px;
  padding: 15px; transition: border-color .2s ease, background .2s ease, transform .18s ease, box-shadow .2s ease;
}
.qt-carta:hover:not([data-off="true"]) {
  background: var(--salvia-chiaro); transform: translateY(-2px); box-shadow: var(--ombra);
}
.qt-carta[data-on="true"] {
  background: var(--salvia-chiaro); border-color: var(--salvia);
  box-shadow: 0 4px 14px rgba(92,112,97,0.14);
}
.qt-carta[data-off="true"] { opacity: 0.55; cursor: not-allowed; background: #EFEFEB; border-color: transparent; }
.qt-carta-t { display: flex; align-items: baseline; gap: 8px; margin-bottom: 5px; }
.qt-carta-n { font-family: ${DISPLAY}; font-size: 13.5px; font-weight: 700; letter-spacing: -0.015em; }
.qt-carta-p { margin-left: auto; font-family: ${MONO}; font-size: 12.5px; font-weight: 650; white-space: nowrap; color: var(--salvia); }
.qt-carta[data-off="true"] .qt-carta-p { color: var(--ink-3); }
.qt-carta-s { font-size: 11.5px; line-height: 1.5; color: var(--ink-2); margin: 0; }
.qt-carta-m {
  display: flex; align-items: flex-start; gap: 6px; font-size: 11px; line-height: 1.45;
  color: #8A6D1F; margin: 8px 0 0; padding: 6px 9px; border-radius: 9px;
  background: rgba(201,162,39,0.10);
}
.qt-carta-m[data-tipo="richiede"] { color: var(--salvia-scuro); background: rgba(92,112,97,0.10); }
.qt-tratti { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.qt-tratto {
  font-family: ${MONO}; font-size: 9.5px; letter-spacing: 0.02em; color: var(--ink-2);
  border-radius: 999px; padding: 3px 9px; background: rgba(23,26,22,0.08);
}
.qt-spunta {
  position: absolute; top: 11px; right: 11px; width: 19px; height: 19px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--salvia); color: #FFFFFF;
}

/* ── cursori ─────────────────────────────────────────────────────────── */
.qt-campi { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 22px; }
.qt-campo-t { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
.qt-campo-l { font-size: 12px; font-weight: 600; color: var(--ink-2); }
.qt-campo-v { font-family: ${MONO}; font-size: 13px; font-weight: 700; color: var(--salvia); }
.qt-range {
  width: 100%; appearance: none; height: 5px; border-radius: 3px; outline: none;
  background: rgba(23,26,22,0.14);
}
.qt-range::-webkit-slider-thumb {
  appearance: none; width: 18px; height: 18px; border-radius: 50%; cursor: pointer;
  background: var(--salvia); border: 3px solid #FFFFFF;
  box-shadow: 0 2px 8px rgba(92,112,97,0.35);
}
.qt-range::-moz-range-thumb {
  width: 16px; height: 16px; border-radius: 50%; cursor: pointer;
  background: var(--salvia); border: 3px solid #FFFFFF;
  box-shadow: 0 2px 8px rgba(92,112,97,0.35);
}
.qt-campo-n { font-size: 10.5px; color: var(--ink-3); margin: 6px 0 0; line-height: 1.45; }

/* ── preventivo ──────────────────────────────────────────────────────── */
.qt-conto { position: sticky; top: 18px; padding: 20px; }
.qt-conto-t {
  display: flex; align-items: center; justify-content: space-between;
  font-family: ${MONO}; font-size: 10px; font-weight: 650; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-3); margin: 0 0 12px;
}
.qt-conto-t i { width: 7px; height: 7px; border-radius: 50%; background: var(--salvia); }
.qt-righe { list-style: none; margin: 0 0 12px; padding: 0; max-height: 220px; overflow-y: auto; }
.qt-riga { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--linea); }
.qt-riga:last-child { border-bottom: none; }
.qt-riga-v { font-size: 12.5px; font-weight: 620; line-height: 1.35; }
.qt-riga-d { font-size: 10px; color: var(--ink-3); margin-top: 3px; line-height: 1.4; }
.qt-riga-p { margin-left: auto; font-family: ${MONO}; font-size: 12px; font-weight: 650; white-space: nowrap; }
.qt-riga[data-rett="true"] .qt-riga-p { color: var(--oro); }
.qt-vuoto { font-size: 12px; color: var(--ink-3); line-height: 1.55; margin: 0 0 12px; }

.qt-tot { border-top: 1.5px solid var(--linea); padding-top: 13px; }
.qt-tot-r { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 5px; }
.qt-tot-l { font-size: 11.5px; color: var(--ink-3); }
.qt-tot-v {
  font-family: ${DISPLAY}; font-size: 26px; font-weight: 780; letter-spacing: -0.035em;
  color: var(--inchiostro); display: inline-block;
}
@keyframes qt-batti {
  0% { transform: scale(1); color: var(--inchiostro); }
  35% { transform: scale(1.05); color: var(--salvia); }
  100% { transform: scale(1); color: var(--inchiostro); }
}
.qt-tot-v[data-batte="true"] { animation: qt-batti .5s cubic-bezier(0.16,1,0.3,1); transform-origin: right center; }
.qt-tot-n { font-family: ${MONO}; font-size: 10.5px; color: var(--ink-3); }
.qt-nota { font-size: 10.5px; line-height: 1.55; color: var(--ink-3); margin: 12px 0 0; padding-top: 11px; border-top: 1px solid var(--linea); }
.qt-formula {
  font-family: ${MONO}; font-size: 10px; line-height: 1.6; color: var(--ink-2);
  margin: 10px 0 0; padding: 10px 12px; border-radius: 12px; background: #F2F2EE;
}

/* ── ritorno ─────────────────────────────────────────────────────────── */
.qt-roi { margin-top: 14px; padding-top: 13px; border-top: 1px solid var(--linea); }
.qt-roi-r { display: flex; align-items: baseline; justify-content: space-between; font-size: 11.5px; padding: 5px 0; }
.qt-roi-l { color: var(--ink-3); }
.qt-roi-v { font-family: ${MONO}; font-weight: 650; }
.qt-barra { height: 6px; border-radius: 3px; background: rgba(23,26,22,0.11); margin-top: 9px; overflow: hidden; display: flex; }
.qt-barra i { height: 100%; transition: width .5s cubic-bezier(0.16,1,0.3,1); }
.qt-rientro {
  margin-top: 12px; padding: 13px 15px; border-radius: 16px;
  background: var(--salvia-chiaro);
}
.qt-rientro-n { font-family: ${DISPLAY}; font-size: 22px; font-weight: 780; letter-spacing: -0.03em; color: var(--salvia-scuro); }
.qt-rientro-l { font-size: 11px; color: var(--ink-2); margin-top: 3px; line-height: 1.45; }

/* ── piano: fasi e rate ──────────────────────────────────────────────── */
.qt-piano { padding: 20px; }
.qt-sez-t {
  font-family: ${MONO}; font-size: 10px; font-weight: 650; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-3); margin: 0 0 14px;
  display: flex; align-items: center; justify-content: space-between;
}
.qt-fasi { display: flex; gap: 3px; margin-bottom: 12px; }
.qt-fase {
  flex-grow: 1; border-radius: 10px; padding: 10px 11px; min-width: 0;
  background: #F2F2EE; transition: background .2s ease;
}
.qt-fase:hover { background: var(--salvia-chiaro); }
.qt-fase-n { font-size: 11.5px; font-weight: 680; letter-spacing: -0.01em; margin-bottom: 2px; }
.qt-fase-g { font-family: ${MONO}; font-size: 10px; color: var(--ink-3); }
.qt-fase-s { font-size: 10.5px; line-height: 1.45; color: var(--ink-2); margin: 5px 0 0; }
.qt-nastro { display: flex; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 14px; }
.qt-nastro i { height: 100%; }

.qt-rate { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.qt-rata { padding: 13px 14px; border-radius: 14px; background: #F2F2EE; }
.qt-rata-q { font-family: ${MONO}; font-size: 10.5px; color: var(--salvia); font-weight: 650; }
.qt-rata-v { font-family: ${DISPLAY}; font-size: 17px; font-weight: 750; letter-spacing: -0.025em; margin: 3px 0 2px; }
.qt-rata-l { font-size: 10.5px; color: var(--ink-3); line-height: 1.4; }

/* ── scenari a confronto ─────────────────────────────────────────────── */
.qt-extra { padding: 20px; margin-top: 14px; }
.qt-scen { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
.qt-scen-c { padding: 15px 16px; border-radius: 16px; background: #F2F2EE; position: relative; }
.qt-scen-n { font-family: ${DISPLAY}; font-size: 12.5px; font-weight: 700; margin-bottom: 8px; padding-right: 22px; }
.qt-scen-r { display: flex; justify-content: space-between; font-size: 11.5px; padding: 3px 0; }
.qt-scen-r span:first-child { color: var(--ink-3); }
.qt-scen-r span:last-child { font-family: ${MONO}; font-weight: 650; }
.qt-scen-x {
  position: absolute; top: 11px; right: 11px; width: 20px; height: 20px; border-radius: 50%;
  border: none; background: rgba(23,26,22,0.09); color: var(--ink-3); cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1;
}
.qt-scen-x:hover { background: rgba(210,105,78,0.14); color: var(--giu); }
.qt-scen-b { margin-top: 10px; width: 100%; }
.qt-scen-vuoto { font-size: 12px; color: var(--ink-3); line-height: 1.55; margin: 0; }

/* ── checklist ───────────────────────────────────────────────────────── */
.qt-caps { padding: 18px 19px; }
.qt-caps-t {
  display: flex; align-items: center; justify-content: space-between;
  font-family: ${MONO}; font-size: 10px; font-weight: 650; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-3); margin: 0 0 12px;
}
.qt-caps-t b { color: var(--salvia); font-weight: 700; }
.qt-cap { display: flex; align-items: center; gap: 9px; font-size: 12px; color: var(--ink-2); padding: 5px 0; }
.qt-cap[data-done="true"] { color: var(--inchiostro); }
.qt-cap .dot {
  width: 17px; height: 17px; border-radius: 50%; flex-shrink: 0;
  border: 1.5px solid rgba(23,26,22,0.20);
  display: flex; align-items: center; justify-content: center; font-size: 9px; color: #FFFFFF;
  transition: all .22s ease;
}
.qt-cap[data-done="true"] .dot { background: var(--salvia); border-color: var(--salvia); }

/* ── azioni ──────────────────────────────────────────────────────────── */
.qt-nav { display: flex; gap: 9px; margin-top: 20px; }
.qt-btn {
  font-family: ${TESTO}; font-size: 13px; font-weight: 680; letter-spacing: -0.005em;
  border-radius: 999px; padding: 12px 22px; cursor: pointer; border: none;
  transition: transform .16s ease, box-shadow .2s ease, opacity .2s ease, background .2s ease;
}
.qt-btn.pri {
  margin-left: auto; color: #FFFFFF; background: var(--salvia);
  box-shadow: 0 4px 14px rgba(92,112,97,0.28);
}
.qt-btn.pri:hover:not(:disabled) { background: var(--salvia-scuro); transform: translateY(-1px); box-shadow: 0 7px 20px rgba(92,112,97,0.34); }
.qt-btn.pri:disabled { opacity: 0.38; cursor: not-allowed; box-shadow: none; }
.qt-btn.gho { background: #EDEDE8; color: var(--ink-2); }
.qt-btn.gho:hover { background: #E2E2DB; color: var(--inchiostro); }
.qt-btn.mini { padding: 9px 15px; font-size: 12px; }
.qt-btn.wide { width: 100%; margin-left: 0; }

/* ── JSON ────────────────────────────────────────────────────────────── */
.qt-json {
  margin: 0; padding: 15px 16px; border-radius: 16px; overflow: auto; max-height: 320px;
  background: #23281F; color: rgba(255,255,255,0.86);
  font-family: ${MONO}; font-size: 11px; line-height: 1.6;
}
.qt-json .k { color: #A8C6A0; }
.qt-json .n { color: #E4C05C; }
.qt-json .s { color: rgba(255,255,255,0.92); }
.qt-json .b { color: #E08C6E; }
.qt-azioni-json { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 11px; }

/* ── preset ──────────────────────────────────────────────────────────── */
.qt-preset { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-bottom: 18px; }
.qt-preset-b {
  text-align: left; font-family: inherit; cursor: pointer;
  background: #F2F2EE; border: 1.5px solid rgba(23,26,22,0.07); border-radius: 14px; padding: 12px 13px;
  transition: border-color .2s ease, background .2s ease, transform .16s ease;
}
.qt-preset-b:hover { background: var(--salvia-chiaro); border-color: var(--salvia); transform: translateY(-1px); }
.qt-preset-n { font-family: ${DISPLAY}; font-size: 12.5px; font-weight: 700; margin-bottom: 3px; color: var(--inchiostro); }
.qt-preset-s { font-size: 10.5px; line-height: 1.45; color: var(--ink-2); }

@media (max-width: 1000px) {
  .qt-kpi-riga { grid-template-columns: repeat(2, 1fr); }
  .qt-grid { grid-template-columns: 1fr; grid-template-areas: "main" "quote" "piano"; }
  .qt-conto, .qt-caps { position: static; }
  .qt-carte[data-col="3"] { grid-template-columns: 1fr; }
  .qt-rate { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .qt-shell { grid-template-columns: 1fr; }
  .qt-rail { flex-direction: row; position: static; border-radius: 999px; justify-content: center; }
  .qt-rail-sep { width: 1px; height: 20px; margin: 0 2px; }
  .qt-kpi-riga { grid-template-columns: 1fr; }
  .qt-carte[data-col="2"] { grid-template-columns: 1fr; }
  .qt-campi { grid-template-columns: 1fr; }
  .qt-preset { grid-template-columns: 1fr; }
  .qt-fasi { flex-direction: column; }
  .qt-nav { flex-direction: column-reverse; }
  .qt-btn.pri { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .qt-tot-v[data-batte="true"] { animation: none; }
  .qt-carta:hover:not([data-off="true"]) { transform: none; }
}
`
