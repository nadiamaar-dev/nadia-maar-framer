/* ══════════════════════════════════════════════════════════════════════════
   PREVENTIVO & ROI — il vestito.

   Identità propria, come ogni demo del Lab, e volutamente diversa da quella
   dell'onboarding KYC: là vetro viola e aurore, qui nero da sala macchine,
   reticolo tecnico, cifre monospaziate e una sola luce ciano su ciò che è
   acceso. Due demo che si somigliassero direbbero che sappiamo fare un
   tema solo.

   SUPERFICI, NON TINTE PIATTE. Ogni pannello ha almeno due sorgenti di luce
   (un bordo-gradiente e un'ombra a due strati) e ogni colore vive come
   gradiente, mai come tinta unita: un pulsante `background: #2DE1C2` legge
   come plastica, lo stesso colore in gradiente a due tappe legge come una
   superficie vera. La grana finissima sopra tutto esiste per lo stesso
   motivo del tema KYC: senza, i gradienti scuri bandeggiano sui monitor a
   8 bit e il nero smette di sembrare nero.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export const QUOTE_CSS = `
.qt-root {
  --nero: #131B25;
  --ink: #F3F8F9;
  --ink-2: rgba(243,248,249,0.64);
  --ink-3: rgba(243,248,249,0.38);
  --linea: rgba(255,255,255,0.14);
  --linea-2: rgba(255,255,255,0.08);
  --ciano: #2DE1C2;
  --ciano-2: #8FF6E1;
  --ciano-deep: #12A78E;
  --ciano-glow: rgba(45,225,194,0.38);
  --indaco: #7C8CFF;
  --indaco-glow: rgba(124,140,255,0.22);
  --ambra: #FFC46B;
  --ambra-glow: rgba(255,196,107,0.28);
  --rosso: #FF6B78;
  --vetro: rgba(255,255,255,0.055);
  --vetro-bordo: linear-gradient(155deg, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.09));

  position: relative; min-height: 100%;
  font-family: ${FONT}; color: var(--ink);
  background:
    radial-gradient(58% 46% at 14% 8%, rgba(45,225,194,0.13), transparent 62%),
    radial-gradient(50% 42% at 88% 4%, rgba(124,140,255,0.11), transparent 60%),
    radial-gradient(65% 60% at 82% 96%, rgba(124,140,255,0.07), transparent 65%),
    linear-gradient(170deg, #1B2532 0%, #16202B 42%, var(--nero) 100%);
  -webkit-font-smoothing: antialiased;
}

/* reticolo tecnico: due gradienti ripetuti, nessuna immagine */
.qt-root::before {
  content: ""; position: fixed; inset: 0; z-index: -2; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%);
  -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 78%);
}
/* grana finissima: rompe il bandeggio dei gradienti scuri, invisibile da sola */
.qt-root::after {
  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  opacity: 0.05; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>");
}

.qt-shell { position: relative; max-width: 1180px; margin: 0 auto; padding: clamp(20px,3.6vw,40px) 18px 40px; }
.qt-grid { display: grid; grid-template-columns: minmax(0,1fr) 358px; gap: 22px; align-items: start; }

/* ── testata ─────────────────────────────────────────────────────────── */
.qt-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.qt-mark {
  position: relative; width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: ${MONO}; font-weight: 700; font-size: 16px; color: #04120F;
  background: linear-gradient(150deg, var(--ciano-2) 0%, var(--ciano) 45%, var(--ciano-deep) 100%);
  box-shadow:
    0 8px 22px var(--ciano-glow),
    inset 0 1px 0 rgba(255,255,255,0.55),
    inset 0 -6px 10px rgba(4,18,15,0.28);
}
.qt-brand-n { font-weight: 700; font-size: 15px; letter-spacing: -0.015em; }
.qt-brand-s { font-family: ${MONO}; font-size: 11px; color: var(--ink-3); letter-spacing: 0.04em; }

/* ── introduzione: a che serve questo arnese ─────────────────────────────
   Senza, il visitatore atterra su tre carte e un totale e deve indovinare
   che cosa sta guardando. Tre righe in cima costano poco spazio e tolgono
   l'unica domanda che fa chiudere la pagina: «e quindi?». */
.qt-intro {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--linea-2);
  border-radius: 16px; overflow: hidden; margin-bottom: 16px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 16px 40px rgba(0,0,0,0.35);
  border: 1px solid var(--linea);
}
.qt-intro-c {
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
  padding: 16px 18px;
}
.qt-intro-c::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--ciano), transparent 85%);
  opacity: 0.7;
}
.qt-intro-n {
  font-family: ${MONO}; font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
  background: linear-gradient(120deg, var(--ciano-2), var(--ciano));
  -webkit-background-clip: text; background-clip: text; color: transparent;
  margin-bottom: 8px;
}
.qt-intro-t { font-size: 13px; font-weight: 690; letter-spacing: -0.01em; margin-bottom: 4px; }
.qt-intro-d { font-size: 12px; line-height: 1.55; color: var(--ink-2); margin: 0; }
.qt-titolone {
  font-size: clamp(21px,2.7vw,28px); font-weight: 800; letter-spacing: -0.035em; margin: 0 0 7px;
  background: linear-gradient(100deg, #FFFFFF 20%, rgba(255,255,255,0.72));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-sottotitolo { font-size: 13.5px; line-height: 1.6; color: var(--ink-2); margin: 0 0 16px; max-width: 74ch; }
.qt-sottotitolo b { color: var(--ink); font-weight: 640; }

/* nota sotto il conto: che cosa comprende e che cosa no */
.qt-nota {
  font-size: 11px; line-height: 1.6; color: var(--ink-3);
  margin: 12px 0 0; padding-top: 12px;
  border-top: 1px solid var(--linea-2);
}
.qt-formula {
  font-family: ${MONO}; font-size: 10.5px; line-height: 1.65; color: var(--ink-2);
  margin: 10px 0 0; padding: 10px 12px; border-radius: 10px;
  background: linear-gradient(165deg, rgba(0,0,0,0.30), rgba(0,0,0,0.16));
  border: 1px solid var(--linea-2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(45,225,194,0.05);
}

@media (max-width: 860px) { .qt-intro { grid-template-columns: 1fr; } }

/* ── passi ───────────────────────────────────────────────────────────── */
.qt-passi {
  display: flex; align-items: center; gap: 4px; margin-bottom: 18px; flex-wrap: wrap;
  padding: 5px; border-radius: 13px;
  background: rgba(0,0,0,0.18); border: 1px solid var(--linea-2);
}
.qt-passo {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: ${MONO}; font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--ink-3);
  background: none; border: none; padding: 7px 11px; border-radius: 9px;
  transition: color .2s ease, background .2s ease, box-shadow .2s ease;
}
.qt-passo[data-on="true"] { cursor: pointer; }
.qt-passo[data-on="true"]:hover { color: var(--ink-2); background: var(--vetro); }
.qt-passo[data-stato="attivo"] {
  color: #04120F;
  background: linear-gradient(135deg, var(--ciano-2), var(--ciano));
  box-shadow: 0 4px 16px var(--ciano-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}
.qt-passo[data-stato="attivo"] .n { opacity: 0.75; }
.qt-passo[data-stato="fatto"] { color: var(--ink-2); }
.qt-passo .n { font-size: 10px; opacity: 0.7; }
.qt-passo-sep { width: 16px; height: 1px; background: var(--linea); flex-shrink: 0; }
.qt-passo[data-stato="fatto"] + .qt-passo-sep { background: linear-gradient(90deg, var(--ciano-deep), var(--linea)); }

/* ── pannelli ────────────────────────────────────────────────────────── */
.qt-pan {
  position: relative;
  background: linear-gradient(165deg, rgba(255,255,255,0.07), rgba(255,255,255,0.022) 55%, rgba(255,255,255,0.035));
  border-radius: 18px;
  padding: clamp(18px,2.6vw,26px);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.07),
    0 28px 60px rgba(0,0,0,0.48),
    0 8px 20px rgba(0,0,0,0.32);
  border: 1px solid transparent;
  background-clip: padding-box;
}
.qt-pan::before {
  content: ""; position: absolute; inset: 0; border-radius: 18px; padding: 1px;
  background: var(--vetro-bordo);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none;
}
.qt-h1 {
  font-size: clamp(19px,2.4vw,23px); font-weight: 760; letter-spacing: -0.03em; margin: 0 0 6px;
  color: var(--ink);
}
.qt-lead { font-size: 13.5px; line-height: 1.65; color: var(--ink-2); margin: 0 0 20px; max-width: 62ch; }
.qt-lead b { color: var(--ink); font-weight: 640; }

/* ── carte scegliibili ───────────────────────────────────────────────── */
.qt-carte { display: grid; gap: 11px; }
.qt-carte[data-col="3"] { grid-template-columns: repeat(3, 1fr); }
.qt-carte[data-col="2"] { grid-template-columns: repeat(2, 1fr); }
.qt-carta {
  position: relative; text-align: left; overflow: hidden;
  font-family: inherit; color: var(--ink); cursor: pointer;
  background: linear-gradient(165deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
  border: 1px solid transparent;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.04), 0 10px 22px rgba(0,0,0,0.22);
  transition: background .25s ease, transform .2s ease, box-shadow .25s ease;
}
/* L'anello del bordo vive in un pseudo-elemento a parte, ritagliato con una
   maschera «a ciambella» — non nel trucco a doppio background (fill in
   padding-box, colore in border-box). Quel trucco lega le due cose:
   perché il bordo resti opaco e nitido, il riempimento sopra di lui deve
   essere altrettanto opaco da coprirlo ovunque tranne il filo. Con un
   riempimento semitrasparente (necessario per il vetro) il bordo — pieno,
   acceso — trapelava su TUTTA la carta, non solo sul contorno: era la causa
   vera dell'effetto «al neon» che sembrava un riempimento saturo anche
   dopo aver abbassato l'alpha del riempimento stesso. Qui i due strati non
   si toccano: l'opacità dell'uno non trascina quella dell'altro. */
.qt-carta::after {
  content: ""; position: absolute; inset: 0; border-radius: 14px; padding: 1px;
  background: linear-gradient(155deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02) 55%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none; transition: background .25s ease;
}
.qt-carta:hover:not([data-off="true"]) {
  transform: translateY(-2px);
  background: linear-gradient(165deg, rgba(45,225,194,0.06), rgba(45,225,194,0.014));
  box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 16px 34px rgba(0,0,0,0.34);
}
.qt-carta:hover:not([data-off="true"])::after {
  background: linear-gradient(155deg, rgba(45,225,194,0.55), rgba(45,225,194,0.06) 55%);
}
/* Selezionata: il segnale è il bordo netto e la spunta, non un riempimento
   pieno — su tre o quattro carte insieme un tono saturo legge come un
   pannello al neon invece che come uno stato acceso fra tanti spenti. */
.qt-carta[data-on="true"] {
  background: linear-gradient(165deg, rgba(45,225,194,0.10), rgba(45,225,194,0.022) 60%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.09),
    0 12px 26px rgba(0,0,0,0.28),
    0 0 20px rgba(45,225,194,0.10);
}
.qt-carta[data-on="true"]::after {
  background: linear-gradient(155deg, var(--ciano-2), var(--ciano-deep) 65%);
}
.qt-carta[data-off="true"] { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.qt-carta-t { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.qt-carta-n { font-size: 14px; font-weight: 680; letter-spacing: -0.015em; }
.qt-carta-p {
  margin-left: auto; font-family: ${MONO}; font-size: 13px; font-weight: 650; white-space: nowrap;
  background: linear-gradient(120deg, var(--ciano-2), var(--ciano));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-carta[data-off="true"] .qt-carta-p { background: none; -webkit-background-clip: initial; background-clip: initial; color: var(--ink-3); }
.qt-carta-s { font-size: 12px; line-height: 1.55; color: var(--ink-2); margin: 0; }
.qt-carta-m {
  display: flex; align-items: center; gap: 6px; font-size: 11.5px; line-height: 1.5;
  color: var(--ambra); margin: 9px 0 0; padding: 6px 9px; border-radius: 8px;
  background: linear-gradient(90deg, var(--ambra-glow), transparent);
}
.qt-carta-m[data-tipo="richiede"] { color: var(--ciano-2); background: linear-gradient(90deg, rgba(45,225,194,0.14), transparent); }
.qt-tratti { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
.qt-tratto {
  font-family: ${MONO}; font-size: 10px; letter-spacing: 0.03em; color: var(--ink-3);
  border: 1px solid var(--linea); border-radius: 999px; padding: 3px 9px;
  background: rgba(255,255,255,0.03);
}
.qt-spunta {
  position: absolute; top: 12px; right: 12px; width: 19px; height: 19px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(150deg, var(--ciano-2), var(--ciano-deep)); color: #04120F;
  box-shadow: 0 3px 10px var(--ciano-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}
/* la riga di luce che scorre sul bordo superiore di una carta accesa */
.qt-carta[data-on="true"]::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--ciano-2), transparent);
  filter: blur(0.4px);
}

/* ── cursori dell'attività ───────────────────────────────────────────── */
.qt-campi { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 22px; }
.qt-campo-t { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 9px; }
.qt-campo-l { font-size: 12.5px; font-weight: 620; color: var(--ink-2); }
.qt-campo-v {
  font-family: ${MONO}; font-size: 13.5px; font-weight: 700;
  background: linear-gradient(120deg, var(--ciano-2), var(--ciano));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-range {
  width: 100%; appearance: none; height: 5px; border-radius: 3px; outline: none;
  background: linear-gradient(90deg, rgba(45,225,194,0.5), rgba(255,255,255,0.10) 0%);
  background-size: 100% 100%;
}
.qt-range::-webkit-slider-thumb {
  appearance: none; width: 17px; height: 17px; border-radius: 50%; cursor: pointer;
  background: linear-gradient(150deg, var(--ciano-2), var(--ciano-deep));
  border: 2px solid #0B141C;
  box-shadow: 0 0 0 1px rgba(45,225,194,0.3), 0 3px 10px var(--ciano-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}
.qt-range::-moz-range-thumb {
  width: 15px; height: 15px; border-radius: 50%; cursor: pointer; border: 2px solid #0B141C;
  background: linear-gradient(150deg, var(--ciano-2), var(--ciano-deep));
  box-shadow: 0 3px 10px var(--ciano-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}
.qt-campo-n { font-size: 11px; color: var(--ink-3); margin: 6px 0 0; line-height: 1.5; }

/* ── preventivo (colonna di destra) ──────────────────────────────────── */
.qt-conto {
  /* position: sticky da sola basta come contesto per lo pseudo-elemento
     del bordo qui sotto: un secondo "position" più avanti nella regola
     vincerebbe in cascata e la spegnerebbe. È successo — position: relative
     scritto qui sotto per errore aveva annullato lo sticky, e con
     top: 18px ancora attivo il pannello si disegnava 18px più in basso del
     suo spazio riservato, scavalcando la carta sotto di lui. Una carta che
     si sovrappone senza motivo, in un layout a griglia, è quasi sempre un
     secondo "position" nascosto più giù nella stessa regola. */
  position: sticky; top: 18px;
  background: linear-gradient(165deg, rgba(255,255,255,0.085), rgba(255,255,255,0.03) 55%, rgba(45,225,194,0.02));
  backdrop-filter: blur(28px) saturate(1.4); -webkit-backdrop-filter: blur(28px) saturate(1.4);
  border-radius: 18px; padding: 20px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.10),
    0 30px 70px rgba(0,0,0,0.55),
    0 0 0 1px rgba(45,225,194,0.05);
  border: 1px solid transparent;
  background-clip: padding-box;
}
.qt-conto::before {
  content: ""; position: absolute; inset: 0; border-radius: 18px; padding: 1px;
  background: linear-gradient(155deg, rgba(45,225,194,0.35), rgba(255,255,255,0.05) 40%, rgba(124,140,255,0.14));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none;
}
.qt-conto-t {
  display: flex; align-items: center; justify-content: space-between;
  font-family: ${MONO}; font-size: 10.5px; font-weight: 650; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-3); margin: 0 0 14px;
}
.qt-conto-t i {
  width: 7px; height: 7px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--ciano-2), var(--ciano-deep));
  box-shadow: 0 0 12px var(--ciano);
}
.qt-righe { list-style: none; margin: 0 0 14px; padding: 0; max-height: 232px; overflow-y: auto; }
.qt-riga { display: flex; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--linea-2); }
.qt-riga:last-child { border-bottom: none; }
.qt-riga-v { font-size: 12.5px; font-weight: 620; line-height: 1.4; }
.qt-riga-d { font-size: 10.5px; color: var(--ink-3); margin-top: 3px; line-height: 1.45; }
.qt-riga-p { margin-left: auto; font-family: ${MONO}; font-size: 12.5px; font-weight: 650; white-space: nowrap; color: var(--ink); }
.qt-riga[data-rett="true"] .qt-riga-p {
  background: linear-gradient(120deg, #FFDCA0, var(--ambra));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-vuoto { font-size: 12.5px; color: var(--ink-3); line-height: 1.6; margin: 0 0 14px; }

.qt-tot { border-top: 1px solid var(--linea); padding-top: 14px; }
.qt-tot-r { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
.qt-tot-l { font-size: 12px; color: var(--ink-3); }
.qt-tot-v {
  font-family: ${MONO}; font-size: 27px; font-weight: 750; letter-spacing: -0.02em;
  background: linear-gradient(120deg, #FFFFFF, var(--ciano-2) 130%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 0 0 transparent);
  display: inline-block;
}
/* la pulsazione del totale: parte solo quando il numero cambia davvero.
   Il colore vive nel gradiente di riempimento, quindi l'animazione lavora
   su scala e bagliore, non sul colore di riempimento — che qui non
   dipinge nulla. */
@keyframes qt-batti {
  0% { transform: scale(1); filter: drop-shadow(0 0 0 transparent); }
  35% { transform: scale(1.06); filter: drop-shadow(0 0 16px rgba(45,225,194,0.55)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0 transparent); }
}
.qt-tot-v[data-batte="true"] { animation: qt-batti .52s cubic-bezier(0.16,1,0.3,1); transform-origin: right center; }
.qt-tot-n { font-family: ${MONO}; font-size: 11px; color: var(--ink-3); letter-spacing: 0.03em; }

/* ── ritorno ─────────────────────────────────────────────────────────── */
.qt-roi { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--linea); }
.qt-roi-r { display: flex; align-items: baseline; justify-content: space-between; font-size: 12px; padding: 5px 0; }
.qt-roi-l { color: var(--ink-3); }
.qt-roi-v { font-family: ${MONO}; font-weight: 650; color: var(--ink); }
.qt-roi-v[data-buono="true"] { color: var(--ciano-2); }
.qt-rientro {
  position: relative; overflow: hidden;
  margin-top: 12px; padding: 13px 15px; border-radius: 13px;
  background: linear-gradient(155deg, rgba(45,225,194,0.14), rgba(45,225,194,0.03) 70%);
  border: 1px solid rgba(45,225,194,0.28);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 26px rgba(45,225,194,0.08);
}
.qt-rientro::before {
  content: ""; position: absolute; top: -40%; right: -20%; width: 70%; height: 140%;
  background: radial-gradient(circle, rgba(45,225,194,0.16), transparent 70%);
  pointer-events: none;
}
.qt-rientro-n {
  position: relative; font-family: ${MONO}; font-size: 24px; font-weight: 750; letter-spacing: -0.02em;
  background: linear-gradient(120deg, var(--ciano-2), var(--ciano));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-rientro-l { position: relative; font-size: 11.5px; color: var(--ink-2); margin-top: 4px; line-height: 1.5; }
.qt-barra { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); margin-top: 10px; overflow: hidden; display: flex; box-shadow: inset 0 1px 2px rgba(0,0,0,0.3); }
.qt-barra i { height: 100%; transition: width .5s cubic-bezier(0.16,1,0.3,1); }

/* ── checklist sotto il preventivo ───────────────────────────────────── */
.qt-caps {
  margin-top: 14px; padding: 15px 17px; border-radius: 16px;
  background: linear-gradient(165deg, rgba(255,255,255,0.05), rgba(255,255,255,0.018));
  border: 1px solid var(--linea);
  box-shadow: 0 1px 0 rgba(255,255,255,0.05), 0 14px 30px rgba(0,0,0,0.3);
}
.qt-caps-t {
  display: flex; align-items: center; justify-content: space-between;
  font-family: ${MONO}; font-size: 10px; font-weight: 650; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-3); margin: 0 0 11px;
}
.qt-caps-t b {
  background: linear-gradient(120deg, var(--ciano-2), var(--ciano));
  -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: 700;
}
.qt-cap { display: flex; align-items: center; gap: 9px; font-size: 12px; color: var(--ink-2); padding: 4px 0; transition: color .2s ease; }
.qt-cap[data-done="true"] { color: var(--ink); }
.qt-cap .dot {
  width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
  border: 1.5px solid rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center; font-size: 8.5px; color: #04120F;
  transition: all .25s ease;
}
.qt-cap[data-done="true"] .dot {
  background: linear-gradient(150deg, var(--ciano-2), var(--ciano-deep));
  border-color: transparent;
  box-shadow: 0 0 10px var(--ciano-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}

/* ── azioni ──────────────────────────────────────────────────────────── */
.qt-nav { display: flex; gap: 10px; margin-top: 20px; }
.qt-btn {
  position: relative;
  font-family: inherit; font-size: 13.5px; font-weight: 700; letter-spacing: -0.01em;
  border-radius: 11px; padding: 12px 20px; cursor: pointer; border: 1px solid transparent;
  transition: transform .16s ease, box-shadow .22s ease, opacity .2s ease, background .2s ease;
}
.qt-btn.pri {
  margin-left: auto; color: #04120F;
  background: linear-gradient(150deg, var(--ciano-2) 0%, var(--ciano) 55%, var(--ciano-deep) 100%);
  box-shadow: 0 10px 26px var(--ciano-glow), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -3px 8px rgba(4,18,15,0.2);
}
.qt-btn.pri:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 14px 34px rgba(45,225,194,0.5), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -3px 8px rgba(4,18,15,0.2);
}
.qt-btn.pri:active:not(:disabled) { transform: translateY(0); }
.qt-btn.pri:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
.qt-btn.gho {
  background: linear-gradient(165deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border-color: var(--linea); color: var(--ink-2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
}
.qt-btn.gho:hover { border-color: rgba(255,255,255,0.28); color: var(--ink); background: linear-gradient(165deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03)); }
.qt-btn.mini { padding: 9px 13px; font-size: 12px; border-radius: 9px; }
.qt-btn.wide { width: 100%; margin-left: 0; justify-content: center; }

/* ── JSON ────────────────────────────────────────────────────────────── */
.qt-json {
  margin: 0; padding: 15px 16px; border-radius: 12px; overflow: auto; max-height: 340px;
  background: linear-gradient(165deg, rgba(0,0,0,0.42), rgba(0,0,0,0.24));
  border: 1px solid var(--linea);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.35);
  font-family: ${MONO}; font-size: 11.5px; line-height: 1.6; color: rgba(243,248,249,0.84);
}
.qt-json .k { color: var(--ciano-2); }
.qt-json .n { color: var(--ambra); }
.qt-json .s { color: rgba(243,248,249,0.92); }
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
