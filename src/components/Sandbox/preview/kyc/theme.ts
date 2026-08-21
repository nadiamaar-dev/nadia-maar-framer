/* ══════════════════════════════════════════════════════════════════════════
   ONBOARDING KYC — il vestito.

   Identità visiva PROPRIA, come ogni demo del Lab: qui è un prodotto di
   compliance notturno, non una pagina del sito. Vetro vero (sfondo che si
   vede attraverso i pannelli), aurore che si muovono lentamente dietro, e
   una grana sottile sopra tutto — senza la grana il vetro scuro si vede a
   bande sui monitor a 8 bit.

   Le regole di questo tema:
   · il vetro ha SEMPRE un bordo chiaro in alto (inset) e uno scuro in
     basso: è ciò che lo fa sembrare spesso invece che trasparente;
   · l'accento viola illumina solo ciò che è attivo — se brilla tutto, non
     brilla niente;
   · ogni animazione continua si spegne con prefers-reduced-motion. Un
     pannello di compliance che pulsa a chi soffre di vertigini è un
     pannello che non si può usare.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export const KYC_CSS = `
.kyc-root {
  --void: #06070B;
  --ink: #F4F5FA;
  --ink-2: rgba(244,245,250,0.66);
  --ink-3: rgba(244,245,250,0.40);
  --line: rgba(255,255,255,0.09);
  --line-2: rgba(255,255,255,0.055);
  --iris: #7C6BFF;
  --iris-lt: #A99BFF;
  --iris-glow: rgba(124,107,255,0.45);
  --mint: #34E5A0;
  --amber: #FFC46B;
  --rose: #FF5D6E;
  --glass: rgba(255,255,255,0.045);
  --glass-2: rgba(255,255,255,0.028);

  position: relative;
  min-height: 100%;
  font-family: ${FONT};
  color: var(--ink);
  background: var(--void);
  -webkit-font-smoothing: antialiased;
  isolation: isolate;
}

/* ── aurore ─────────────────────────────────────────────────────────────
   Tre macchie che scorrono su piani diversi: è ciò che rende il fondo
   "vivo" senza un video e senza una libreria. Sono in un pseudo-elemento
   fisso, quindi non si muovono con lo scorrimento e non ridisegnano nulla
   quando la pagina è lunga. */
.kyc-root::before {
  content: ""; position: fixed; inset: -20%; z-index: -2; pointer-events: none;
  background:
    radial-gradient(38% 44% at 18% 22%, rgba(124,107,255,0.30), transparent 62%),
    radial-gradient(34% 40% at 82% 12%, rgba(52,229,160,0.14), transparent 60%),
    radial-gradient(46% 50% at 68% 88%, rgba(168,85,247,0.20), transparent 64%);
  filter: blur(24px) saturate(1.15);
  animation: kyc-drift 26s ease-in-out infinite alternate;
}
@keyframes kyc-drift {
  0%   { transform: translate3d(0,0,0) scale(1); }
  50%  { transform: translate3d(2.5%,-2%,0) scale(1.06); }
  100% { transform: translate3d(-2%,2.5%,0) scale(1.02); }
}

/* grana: 1 px di rumore ripetuto, opacità bassissima */
.kyc-root::after {
  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  opacity: 0.035; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>");
}

.kyc-wrap { position: relative; max-width: 680px; margin: 0 auto; padding: clamp(22px,4.5vw,52px) 18px 88px; }

/* ── testata ─────────────────────────────────────────────────────────── */
.kyc-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 26px; }
.kyc-brand-mark {
  width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 16px; letter-spacing: -0.02em; color: #fff;
  background: linear-gradient(140deg, var(--iris), #B06BFF);
  box-shadow: 0 8px 26px rgba(124,107,255,0.42), inset 0 1px 0 rgba(255,255,255,0.42);
}
.kyc-brand-name { font-weight: 700; font-size: 15.5px; letter-spacing: -0.015em; }
.kyc-brand-sub { font-size: 11.5px; color: var(--ink-3); font-family: ${MONO}; letter-spacing: 0.04em; }
.kyc-brand-live {
  margin-left: auto; display: inline-flex; align-items: center; gap: 7px;
  font-family: ${MONO}; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--ink-3); padding: 6px 11px; border-radius: 999px;
  background: var(--glass-2); border: 1px solid var(--line-2);
}
.kyc-brand-live i {
  width: 6px; height: 6px; border-radius: 50%; background: var(--mint);
  box-shadow: 0 0 10px var(--mint); animation: kyc-pulse 2.2s ease-in-out infinite;
}
@keyframes kyc-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }

/* ── barra dei passi ─────────────────────────────────────────────────── */
.kyc-steps {
  display: flex; align-items: center; gap: 6px; margin-bottom: 22px;
  padding: 10px 12px; border-radius: 16px;
  background: var(--glass-2); border: 1px solid var(--line-2);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  overflow-x: auto; scrollbar-width: none;
}
.kyc-steps::-webkit-scrollbar { display: none; }
.kyc-step-dot {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0;
  font-family: inherit; font-size: 12px; font-weight: 600; color: var(--ink-3);
  background: none; border: none; padding: 4px 6px; border-radius: 10px;
  transition: color .22s ease;
}
.kyc-step-dot[data-reachable="true"] { cursor: pointer; }
.kyc-step-dot[data-reachable="true"]:hover { color: var(--ink-2); }
.kyc-step-dot .n {
  width: 25px; height: 25px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11.5px; font-weight: 700; font-family: ${MONO};
  color: var(--ink-3); background: var(--glass); border: 1px solid var(--line);
  transition: all .28s cubic-bezier(0.16,1,0.3,1);
}
.kyc-step-dot[data-state="active"] { color: var(--ink); }
.kyc-step-dot[data-state="active"] .n {
  color: #fff; border-color: transparent;
  background: linear-gradient(140deg, var(--iris), #9B6BFF);
  box-shadow: 0 0 0 4px rgba(124,107,255,0.16), 0 6px 18px var(--iris-glow);
}
.kyc-step-dot[data-state="done"] { color: var(--ink-2); }
.kyc-step-dot[data-state="done"] .n {
  color: var(--mint); border-color: rgba(52,229,160,0.35); background: rgba(52,229,160,0.10);
}
.kyc-step-line { flex: 1 0 14px; min-width: 14px; height: 1.5px; background: var(--line-2); border-radius: 2px; overflow: hidden; }
.kyc-step-line i { display: block; height: 100%; width: 0; border-radius: 2px; background: linear-gradient(90deg, var(--iris), var(--iris-lt)); transition: width .5s cubic-bezier(0.16,1,0.3,1); }

/* ── vetro ───────────────────────────────────────────────────────────── */
.kyc-glass, .kyc-card {
  position: relative;
  background: linear-gradient(160deg, rgba(255,255,255,0.062), rgba(255,255,255,0.022));
  backdrop-filter: blur(30px) saturate(1.35);
  -webkit-backdrop-filter: blur(30px) saturate(1.35);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.16),
    inset 0 -1px 0 rgba(0,0,0,0.35),
    0 26px 70px rgba(0,0,0,0.55);
}
.kyc-card { padding: clamp(20px,3.6vw,32px); overflow: hidden; }
/* filo di luce sul bordo superiore: il dettaglio che rende il vetro «spesso» */
.kyc-card::before {
  content: ""; position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(168,155,255,0.75), transparent);
}
.kyc-glass { padding: 18px; margin-bottom: 16px; border-radius: 16px; }

.kyc-h1 { font-size: clamp(20px,2.9vw,25px); font-weight: 780; letter-spacing: -0.03em; margin: 0 0 7px; }
.kyc-lead { font-size: 13.5px; line-height: 1.65; color: var(--ink-2); margin: 0 0 24px; }
.kyc-lead b { color: var(--ink); font-weight: 650; }

/* ── campi ───────────────────────────────────────────────────────────── */
.kyc-field { margin-bottom: 15px; }
.kyc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.kyc-label { display: flex; align-items: baseline; gap: 6px; font-size: 11.5px; font-weight: 620; letter-spacing: 0.02em; color: var(--ink-2); margin-bottom: 7px; }
.kyc-label .opt { font-weight: 500; color: var(--ink-3); font-size: 11px; }
.kyc-input-wrap { position: relative; }
.kyc-input {
  width: 100%; box-sizing: border-box;
  padding: 12px 42px 12px 14px;
  font-family: inherit; font-size: 14.5px; color: var(--ink);
  background: rgba(255,255,255,0.045);
  border: 1px solid var(--line); border-radius: 12px;
  outline: none; appearance: none;
  transition: border-color .2s ease, box-shadow .25s ease, background .2s ease;
}
.kyc-input::placeholder { color: rgba(244,245,250,0.26); }
.kyc-input:hover:not(:focus) { border-color: rgba(255,255,255,0.16); }
.kyc-input:focus {
  border-color: rgba(124,107,255,0.75);
  background: rgba(124,107,255,0.07);
  box-shadow: 0 0 0 4px rgba(124,107,255,0.14), 0 0 26px rgba(124,107,255,0.16);
}
.kyc-input[data-invalid="true"] { border-color: rgba(255,93,110,0.65); }
.kyc-input[data-invalid="true"]:focus { box-shadow: 0 0 0 4px rgba(255,93,110,0.13); }
.kyc-input[readonly] { color: var(--ink-2); }
.kyc-mono { font-family: ${MONO}; letter-spacing: 0.06em; }
.kyc-check { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); color: var(--mint); pointer-events: none; }
.kyc-err { display: flex; gap: 6px; align-items: baseline; font-size: 12px; color: var(--rose); margin: 7px 0 0; }
select.kyc-input {
  padding-right: 38px; cursor: pointer;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='rgba(244,245,250,0.45)' stroke-width='1.8' stroke-linecap='round'/></svg>");
  background-repeat: no-repeat; background-position: right 14px center;
}
select.kyc-input option { background: #12131A; color: var(--ink); }
select.kyc-input[data-empty="true"] { color: rgba(244,245,250,0.28); }

/* pillole di scelta (fatturato) */
.kyc-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.kyc-pill {
  font-family: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink-2);
  padding: 9px 14px; border-radius: 999px; cursor: pointer;
  background: var(--glass); border: 1px solid var(--line);
  transition: all .2s ease;
}
.kyc-pill:hover { border-color: rgba(255,255,255,0.2); color: var(--ink); }
.kyc-pill[data-on="true"] {
  color: #fff; border-color: transparent;
  background: linear-gradient(140deg, rgba(124,107,255,0.9), rgba(155,107,255,0.75));
  box-shadow: 0 6px 20px var(--iris-glow);
}

/* ── ricerca nel registro ────────────────────────────────────────────── */
.kyc-lookup {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin: -4px 0 16px; padding: 11px 14px; border-radius: 12px;
  background: var(--glass-2); border: 1px solid var(--line-2);
  font-size: 12.5px; color: var(--ink-2);
}
.kyc-lookup-btn {
  font-family: inherit; font-size: 12px; font-weight: 680; color: var(--iris-lt);
  background: rgba(124,107,255,0.12); border: 1px solid rgba(124,107,255,0.32);
  border-radius: 9px; padding: 7px 13px; cursor: pointer; transition: all .2s ease;
}
.kyc-lookup-btn:hover:not(:disabled) { background: rgba(124,107,255,0.22); box-shadow: 0 0 18px rgba(124,107,255,0.25); }
.kyc-lookup-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.kyc-spinner {
  width: 13px; height: 13px; border-radius: 50%; flex-shrink: 0;
  border: 1.8px solid rgba(255,255,255,0.18); border-top-color: var(--iris-lt);
  animation: kyc-spin .7s linear infinite;
}
@keyframes kyc-spin { to { transform: rotate(360deg) } }

/* ── titolari effettivi ──────────────────────────────────────────────── */
.kyc-ubo { position: relative; padding: 15px; border-radius: 14px; margin-bottom: 11px; background: var(--glass-2); border: 1px solid var(--line-2); }
.kyc-ubo-head { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }
.kyc-ubo-n {
  width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: ${MONO}; font-size: 10.5px; font-weight: 700; color: var(--iris-lt);
  background: rgba(124,107,255,0.14); border: 1px solid rgba(124,107,255,0.3);
}
.kyc-ubo-title { font-size: 12.5px; font-weight: 650; color: var(--ink-2); }
.kyc-ubo-del {
  margin-left: auto; font-family: inherit; font-size: 11.5px; font-weight: 620;
  color: var(--ink-3); background: none; border: none; cursor: pointer; padding: 4px 6px; border-radius: 8px;
  transition: color .18s ease;
}
.kyc-ubo-del:hover { color: var(--rose); }
.kyc-ubo-del:disabled { opacity: 0.3; cursor: not-allowed; }
.kyc-quota-wrap { position: relative; }
.kyc-quota-suffix { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-family: ${MONO}; font-size: 13px; color: var(--ink-3); pointer-events: none; }
/* Le frecce native del campo numerico finivano sopra il segno di
   percentuale. Si tolgono: la quota si scrive, non si incrementa di uno. */
.kyc-quota-wrap input { -moz-appearance: textfield; appearance: textfield; }
.kyc-quota-wrap input::-webkit-outer-spin-button,
.kyc-quota-wrap input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.kyc-pep {
  display: flex; align-items: center; gap: 9px; margin-top: 11px; cursor: pointer;
  font-size: 12.5px; color: var(--ink-2); line-height: 1.5;
}
.kyc-pep input { width: 16px; height: 16px; accent-color: var(--iris); flex-shrink: 0; }
.kyc-pep-hint { font-size: 11.5px; color: var(--ink-3); }

.kyc-quote-bar { margin: 14px 0 4px; }
.kyc-quote-track { height: 6px; border-radius: 4px; background: rgba(255,255,255,0.07); overflow: hidden; display: flex; }
.kyc-quote-seg { height: 100%; transition: width .4s cubic-bezier(0.16,1,0.3,1); }
.kyc-quote-legend { display: flex; justify-content: space-between; font-family: ${MONO}; font-size: 11px; margin-top: 8px; color: var(--ink-3); }
.kyc-quote-legend b { color: var(--ink); font-weight: 700; }
.kyc-quote-legend b[data-ok="true"] { color: var(--mint); }
.kyc-quote-legend b[data-ok="false"] { color: var(--amber); }

.kyc-add {
  width: 100%; font-family: inherit; font-size: 13px; font-weight: 650; color: var(--iris-lt);
  padding: 12px; border-radius: 12px; cursor: pointer;
  background: rgba(124,107,255,0.07); border: 1px dashed rgba(124,107,255,0.36);
  transition: all .2s ease;
}
.kyc-add:hover { background: rgba(124,107,255,0.14); border-color: rgba(124,107,255,0.6); }

/* ── documenti ───────────────────────────────────────────────────────── */
.kyc-doc {
  position: relative; overflow: hidden;
  padding: 15px; margin-bottom: 11px; border-radius: 14px;
  background: var(--glass-2); border: 1px dashed var(--line);
  transition: border-color .22s ease, background .22s ease, transform .22s ease;
}
.kyc-doc[data-drag="true"] {
  border-color: var(--iris); background: rgba(124,107,255,0.12);
  transform: scale(1.012); box-shadow: 0 0 30px rgba(124,107,255,0.22);
}
.kyc-doc[data-status="done"] { border-style: solid; border-color: rgba(52,229,160,0.34); background: rgba(52,229,160,0.055); }
.kyc-doc[data-status="error"] { border-style: solid; border-color: rgba(255,93,110,0.42); background: rgba(255,93,110,0.05); }
.kyc-doc[data-status="uploading"] { border-style: solid; border-color: rgba(124,107,255,0.42); }
.kyc-doc-row { display: flex; align-items: center; gap: 12px; }
.kyc-doc-ico {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(124,107,255,0.13); color: var(--iris-lt); border: 1px solid rgba(124,107,255,0.22);
}
.kyc-doc[data-status="done"] .kyc-doc-ico { background: rgba(52,229,160,0.12); color: var(--mint); border-color: rgba(52,229,160,0.28); }
.kyc-doc[data-status="error"] .kyc-doc-ico { background: rgba(255,93,110,0.12); color: var(--rose); border-color: rgba(255,93,110,0.3); }
.kyc-doc-name { font-size: 13.5px; font-weight: 660; letter-spacing: -0.01em; }
.kyc-doc-sub { font-size: 11.5px; color: var(--ink-3); margin-top: 3px; overflow-wrap: anywhere; }
.kyc-doc-sub .hash { font-family: ${MONO}; color: rgba(52,229,160,0.75); }
.kyc-doc-act {
  margin-left: auto; flex-shrink: 0;
  font-family: inherit; font-size: 12px; font-weight: 660; color: var(--iris-lt);
  background: rgba(124,107,255,0.10); border: 1px solid rgba(124,107,255,0.26);
  border-radius: 9px; padding: 7px 12px; cursor: pointer; transition: all .2s ease;
}
.kyc-doc-act:hover { background: rgba(124,107,255,0.2); }
.kyc-doc-act.muted { color: var(--ink-3); background: var(--glass); border-color: var(--line); }
.kyc-doc-act.muted:hover { color: var(--ink); }
.kyc-bar { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.07); margin-top: 12px; overflow: hidden; position: relative; }
.kyc-bar i {
  display: block; height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, var(--iris), var(--iris-lt));
  box-shadow: 0 0 14px var(--iris-glow);
  transition: width .13s linear;
  position: relative; overflow: hidden;
}
/* riflesso che scorre sopra la barra: dice «sta lavorando» anche quando la
   percentuale avanza a scatti */
.kyc-bar i::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: kyc-sheen 1.1s ease-in-out infinite;
}
@keyframes kyc-sheen { from { transform: translateX(-100%) } to { transform: translateX(100%) } }
.kyc-doc-err { font-size: 12px; color: var(--rose); margin: 10px 0 0; line-height: 1.5; }

/* ── screening ───────────────────────────────────────────────────────── */
.kyc-lista { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-bottom: 1px solid var(--line-2); }
.kyc-lista:last-of-type { border-bottom: none; }
.kyc-lista-ico {
  width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--glass); border: 1px solid var(--line); color: var(--ink-3);
  transition: all .3s ease;
}
.kyc-lista[data-stato="pulito"] .kyc-lista-ico { color: var(--mint); background: rgba(52,229,160,0.10); border-color: rgba(52,229,160,0.3); }
.kyc-lista[data-stato="attenzione"] .kyc-lista-ico { color: var(--amber); background: rgba(255,196,107,0.10); border-color: rgba(255,196,107,0.34); }
.kyc-lista-t { font-size: 13px; font-weight: 640; }
.kyc-lista-f { font-family: ${MONO}; font-size: 10.5px; color: var(--ink-3); margin-top: 2px; letter-spacing: 0.03em; }
.kyc-lista-e { margin-left: auto; font-family: ${MONO}; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); }
.kyc-lista[data-stato="pulito"] .kyc-lista-e { color: var(--mint); }
.kyc-lista[data-stato="attenzione"] .kyc-lista-e { color: var(--amber); }

/* punteggio di rischio */
.kyc-score { display: flex; align-items: center; gap: 18px; }
.kyc-gauge { position: relative; width: 96px; height: 96px; flex-shrink: 0; }
.kyc-gauge svg { transform: rotate(-90deg); }
.kyc-gauge-v {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  font-family: ${MONO}; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;
}
.kyc-gauge-v small { font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); margin-top: 2px; }
.kyc-score-t { font-size: 15px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 5px; }
.kyc-score-d { font-size: 12.5px; line-height: 1.6; color: var(--ink-2); margin: 0; }
.kyc-badge {
  display: inline-flex; align-items: center; gap: 6px; margin-bottom: 8px;
  font-family: ${MONO}; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 5px 11px; border-radius: 999px;
}
.kyc-badge[data-l="basso"] { color: var(--mint); background: rgba(52,229,160,0.12); border: 1px solid rgba(52,229,160,0.3); }
.kyc-badge[data-l="medio"] { color: var(--amber); background: rgba(255,196,107,0.12); border: 1px solid rgba(255,196,107,0.32); }
.kyc-badge[data-l="alto"]  { color: var(--rose);  background: rgba(255,93,110,0.12); border: 1px solid rgba(255,93,110,0.32); }

/* ── riepilogo ───────────────────────────────────────────────────────── */
.kyc-sum-row { display: flex; justify-content: space-between; gap: 16px; padding: 9px 0; border-bottom: 1px solid var(--line-2); font-size: 13px; }
.kyc-sum-row:last-child { border-bottom: none; }
.kyc-sum-k { color: var(--ink-3); flex-shrink: 0; }
.kyc-sum-v { font-weight: 640; text-align: right; overflow-wrap: anywhere; }
.kyc-sum-v .ok { color: var(--mint); }
.kyc-edit { font-family: inherit; font-size: 11.5px; font-weight: 660; color: var(--iris-lt); background: none; border: none; cursor: pointer; padding: 0; }
.kyc-edit:hover { text-decoration: underline; }

.kyc-consent { display: flex; gap: 11px; align-items: flex-start; font-size: 12.5px; line-height: 1.6; color: var(--ink-2); cursor: pointer; margin-bottom: 18px; }
.kyc-consent input { width: 17px; height: 17px; margin-top: 1px; accent-color: var(--iris); flex-shrink: 0; }

/* ── navigazione ─────────────────────────────────────────────────────── */
.kyc-nav { display: flex; gap: 10px; margin-top: 24px; }
.kyc-btn {
  font-family: inherit; font-size: 14px; font-weight: 700; letter-spacing: -0.01em;
  border-radius: 12px; padding: 13px 22px; cursor: pointer; border: 1px solid transparent;
  transition: transform .16s ease, box-shadow .24s ease, opacity .2s ease, background .2s ease;
}
.kyc-btn.primary {
  margin-left: auto; color: #fff;
  background: linear-gradient(140deg, var(--iris), #9B6BFF);
  box-shadow: 0 10px 30px var(--iris-glow), inset 0 1px 0 rgba(255,255,255,0.28);
}
.kyc-btn.primary:hover:not(:disabled) { transform: translateY(-1.5px); box-shadow: 0 14px 38px rgba(124,107,255,0.55), inset 0 1px 0 rgba(255,255,255,0.32); }
.kyc-btn.primary:active:not(:disabled) { transform: translateY(0); }
.kyc-btn.primary:disabled { opacity: 0.38; cursor: not-allowed; box-shadow: none; }
.kyc-btn.ghost { background: var(--glass); border-color: var(--line); color: var(--ink-2); }
.kyc-btn.ghost:hover { border-color: rgba(255,255,255,0.22); color: var(--ink); }
.kyc-btn.wide { width: 100%; margin-left: 0; }
.kyc-hint { font-family: ${MONO}; font-size: 10.5px; color: var(--ink-3); text-align: center; margin: 14px 0 0; letter-spacing: 0.04em; }
.kyc-hint kbd {
  font-family: ${MONO}; font-size: 10px; padding: 2px 6px; border-radius: 5px;
  background: var(--glass); border: 1px solid var(--line); color: var(--ink-2);
}

/* ── esito ───────────────────────────────────────────────────────────── */
.kyc-done { text-align: center; padding: 20px 4px 6px; }
.kyc-done-ico {
  width: 68px; height: 68px; border-radius: 50%; margin: 0 auto 20px;
  display: flex; align-items: center; justify-content: center; color: var(--mint);
  background: rgba(52,229,160,0.10); border: 1px solid rgba(52,229,160,0.34);
  box-shadow: 0 0 40px rgba(52,229,160,0.28);
}
.kyc-ref {
  display: inline-block; margin-top: 14px; padding: 8px 14px; border-radius: 10px;
  font-family: ${MONO}; font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
  color: var(--iris-lt); background: rgba(124,107,255,0.12); border: 1px solid rgba(124,107,255,0.3);
}

/* ── diario ──────────────────────────────────────────────────────────── */
.kyc-audit { margin-top: 16px; }
.kyc-audit-t {
  display: flex; align-items: center; gap: 8px; width: 100%;
  font-family: ${MONO}; font-size: 10.5px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--ink-3); background: none; border: none; cursor: pointer; padding: 10px 2px;
}
.kyc-audit-t:hover { color: var(--ink-2); }
.kyc-audit-t .caret { margin-left: auto; transition: transform .25s ease; }
.kyc-audit-t[data-open="true"] .caret { transform: rotate(180deg); }
.kyc-audit-l { list-style: none; margin: 0; padding: 4px 0 0; max-height: 190px; overflow-y: auto; }
.kyc-audit-i { display: flex; gap: 11px; font-size: 12px; color: var(--ink-2); padding: 5px 0; }
.kyc-audit-i time { font-family: ${MONO}; font-size: 11px; color: var(--ink-3); flex-shrink: 0; }

/* ── ripresa bozza ───────────────────────────────────────────────────── */
.kyc-resume { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px; background: rgba(255,196,107,0.08); border: 1px solid rgba(255,196,107,0.28); font-size: 12.5px; color: var(--ink-2); }
.kyc-resume b { color: var(--amber); font-weight: 700; }
.kyc-resume-act { margin-left: auto; display: flex; gap: 8px; }

@media (max-width: 620px) {
  .kyc-steps .lbl { display: none; }
  .kyc-row { grid-template-columns: 1fr; }
  .kyc-nav { flex-direction: column-reverse; }
  .kyc-btn.primary { margin-left: 0; }
  .kyc-score { flex-direction: column; align-items: flex-start; gap: 14px; }
}

/* Chi ha chiesto meno movimento riceve la stessa interfaccia, ferma. */
@media (prefers-reduced-motion: reduce) {
  .kyc-root::before { animation: none; }
  .kyc-bar i::after { animation: none; }
  .kyc-brand-live i { animation: none; }
  .kyc-spinner { animation-duration: 2s; }
}
`
