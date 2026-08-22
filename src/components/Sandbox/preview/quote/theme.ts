/* ══════════════════════════════════════════════════════════════════════════
   PREVENTIVO & ROI — il vestito.

   Seconda versione: via il ciano da sala macchine, dentro una coppia di
   colori caldi — ambra e corallo, "ember" — su un grafite neutro invece
   che blu-navy. Un secondo accento freddo (violetto tenue, "dusk") vive
   solo nel fondo e in un paio di dettagli piccoli: dà profondità cromatica
   senza contendere l'attenzione all'accento principale. Nessuna delle
   altre demo del Lab usa questa coppia — il portale fornitori è blu, il
   CRM è verde lime, l'onboarding KYC è viola pieno.

   FORMA. Pulsanti e barra dei passi sono a pillola (raggio 999px) invece
   che rettangoli smussati: è il linguaggio dei prodotti dark-mode più
   recenti (Linear, Arc, Raycast), e qui distingue anche visivamente questa
   demo dalle altre tre, che restano su raggi più squadrati.

   STRUTTURA. La checklist "Da provare" non è più impilata sotto il
   preventivo nella stessa colonna — è una terza colonna a parte, dalla
   larghezza in giù. Il bug della versione precedente (un `position`
   duplicato che toglieva lo sticky e faceva scavalcare il pannello sotto)
   non può più ripresentarsi in questa forma: i due pannelli non
   condividono più un contenitore, quindi non c'è più un bordo comune da
   scavalcare. Sticky per il preventivo resta attivo dalla larghezza media
   in su; sticky per la checklist SOLO quando ha una colonna tutta sua
   (≥1280px) — nella fascia media i due vivono nello stesso spazio
   verticale a colonne diverse, e due sticky nello stesso punto
   ricreerebbero esattamente il problema che si voleva chiudere.
══════════════════════════════════════════════════════════════════════════ */

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export const QUOTE_CSS = `
.qt-root {
  --nero: #16130F;
  --ink: #F7F3EC;
  --ink-2: rgba(247,243,236,0.66);
  --ink-3: rgba(247,243,236,0.40);
  --linea: rgba(255,255,255,0.14);
  --linea-2: rgba(255,255,255,0.08);

  /* Ember — l'accento caldo principale, sempre in gradiente, mai a tinta */
  --ember-1: #FFC168;
  --ember-2: #FF7A45;
  --ember-deep: #D9481F;
  --ember-glow: rgba(255,122,69,0.40);

  /* Dusk — il contrappunto freddo: solo fondo e piccoli dettagli */
  --dusk: #8D93FF;
  --dusk-glow: rgba(141,147,255,0.20);

  --oro: #F0C24B;
  --oro-glow: rgba(240,194,75,0.24);
  --rosso: #FF6B6B;
  --vetro: rgba(255,255,255,0.055);
  --vetro-bordo: linear-gradient(155deg, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.09));

  position: relative; min-height: 100%;
  font-family: ${FONT}; color: var(--ink);
  background:
    radial-gradient(52% 42% at 12% 6%, rgba(255,122,69,0.14), transparent 62%),
    radial-gradient(46% 38% at 90% 2%, rgba(141,147,255,0.10), transparent 60%),
    radial-gradient(60% 55% at 84% 94%, rgba(141,147,255,0.07), transparent 65%),
    linear-gradient(170deg, #1E1A15 0%, #19150F 42%, var(--nero) 100%);
  -webkit-font-smoothing: antialiased;
}

/* reticolo tecnico: due gradienti ripetuti, nessuna immagine */
.qt-root::before {
  content: ""; position: fixed; inset: 0; z-index: -2; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.042) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.042) 1px, transparent 1px);
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

.qt-shell { position: relative; max-width: 1320px; margin: 0 auto; padding: clamp(20px,3.6vw,44px) 18px 44px; }

/* ── testata ─────────────────────────────────────────────────────────── */
.qt-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 26px; }
.qt-mark {
  position: relative; width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: ${MONO}; font-weight: 700; font-size: 16px; color: #2A0F02;
  background: linear-gradient(150deg, var(--ember-1) 0%, var(--ember-2) 55%, var(--ember-deep) 100%);
  box-shadow:
    0 8px 22px var(--ember-glow),
    inset 0 1px 0 rgba(255,255,255,0.55),
    inset 0 -6px 10px rgba(42,15,2,0.28);
}
.qt-brand-n { font-weight: 700; font-size: 15px; letter-spacing: -0.015em; }
.qt-brand-s { font-family: ${MONO}; font-size: 11px; color: var(--ink-3); letter-spacing: 0.04em; }

/* eyebrow sopra il titolo: lo stesso linguaggio dei "Kicker" del sito */
.qt-kicker {
  display: inline-flex; align-items: center; gap: 9px;
  font-family: ${MONO}; font-size: 11px; font-weight: 650; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-3); margin-bottom: 12px;
}
.qt-kicker::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--ember-1), var(--ember-2));
  box-shadow: 0 0 10px var(--ember-glow);
}

/* ── introduzione: a che serve questo arnese ─────────────────────────────
   Senza, il visitatore atterra su tre carte e un totale e deve indovinare
   che cosa sta guardando. Tre righe in cima costano poco spazio e tolgono
   l'unica domanda che fa chiudere la pagina: «e quindi?». */
.qt-intro {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--linea-2);
  border-radius: 20px; overflow: hidden; margin-bottom: 18px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 16px 40px rgba(0,0,0,0.35);
  border: 1px solid var(--linea);
}
.qt-intro-c {
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
  padding: 17px 19px;
}
.qt-intro-c::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--ember-2), transparent 85%);
  opacity: 0.75;
}
.qt-intro-n {
  font-family: ${MONO}; font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
  background: linear-gradient(120deg, var(--ember-1), var(--ember-2));
  -webkit-background-clip: text; background-clip: text; color: transparent;
  margin-bottom: 8px;
}
.qt-intro-t { font-size: 13px; font-weight: 690; letter-spacing: -0.01em; margin-bottom: 4px; }
.qt-intro-d { font-size: 12px; line-height: 1.55; color: var(--ink-2); margin: 0; }
.qt-titolone {
  font-size: clamp(23px,3vw,32px); font-weight: 820; letter-spacing: -0.04em; margin: 0 0 8px;
  background: linear-gradient(100deg, #FFFFFF 20%, rgba(255,255,255,0.74));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-sottotitolo { font-size: 14px; line-height: 1.65; color: var(--ink-2); margin: 0 0 18px; max-width: 74ch; }
.qt-sottotitolo b { color: var(--ink); font-weight: 640; }

/* nota sotto il conto: che cosa comprende e che cosa no */
.qt-nota {
  font-size: 11px; line-height: 1.6; color: var(--ink-3);
  margin: 12px 0 0; padding-top: 12px;
  border-top: 1px solid var(--linea-2);
}
.qt-formula {
  font-family: ${MONO}; font-size: 10.5px; line-height: 1.65; color: var(--ink-2);
  margin: 10px 0 0; padding: 10px 12px; border-radius: 11px;
  background: linear-gradient(165deg, rgba(0,0,0,0.30), rgba(0,0,0,0.16));
  border: 1px solid var(--linea-2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,122,69,0.05);
}

@media (max-width: 860px) { .qt-intro { grid-template-columns: 1fr; } }

/* ── passi: barra a pillola ──────────────────────────────────────────── */
.qt-passi {
  display: flex; align-items: center; gap: 4px; margin-bottom: 20px; flex-wrap: wrap;
  padding: 5px; border-radius: 999px;
  background: rgba(0,0,0,0.20); border: 1px solid var(--linea-2);
  width: fit-content; max-width: 100%;
}
.qt-passo {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: ${MONO}; font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--ink-3);
  background: none; border: none; padding: 8px 14px; border-radius: 999px;
  transition: color .2s ease, background .2s ease, box-shadow .2s ease;
}
.qt-passo[data-on="true"] { cursor: pointer; }
.qt-passo[data-on="true"]:hover { color: var(--ink-2); background: var(--vetro); }
.qt-passo[data-stato="attivo"] {
  color: #2A0F02;
  background: linear-gradient(135deg, var(--ember-1), var(--ember-2));
  box-shadow: 0 4px 16px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}
.qt-passo[data-stato="attivo"] .n { opacity: 0.8; }
.qt-passo[data-stato="fatto"] { color: var(--ink-2); }
.qt-passo .n { font-size: 10px; opacity: 0.7; }
.qt-passo-sep { width: 14px; height: 1px; background: var(--linea); flex-shrink: 0; }
.qt-passo[data-stato="fatto"] + .qt-passo-sep { background: linear-gradient(90deg, var(--ember-deep), var(--linea)); }

/* ── pannelli ────────────────────────────────────────────────────────── */
.qt-pan {
  position: relative;
  background: linear-gradient(165deg, rgba(255,255,255,0.07), rgba(255,255,255,0.022) 55%, rgba(255,255,255,0.035));
  border-radius: 22px;
  padding: clamp(20px,2.8vw,30px);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.07),
    0 28px 60px rgba(0,0,0,0.48),
    0 8px 20px rgba(0,0,0,0.32);
  border: 1px solid transparent;
  background-clip: padding-box;
}
.qt-pan::before {
  content: ""; position: absolute; inset: 0; border-radius: 22px; padding: 1px;
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
  border-radius: 16px;
  padding: 17px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.04), 0 10px 22px rgba(0,0,0,0.22);
  transition: background .25s ease, transform .2s ease, box-shadow .25s ease;
}
/* L'anello del bordo vive in un pseudo-elemento a parte, ritagliato con una
   maschera "a ciambella" — non nel trucco a doppio background (fill in
   padding-box, colore in border-box). Quel trucco lega le due cose: perché
   il bordo resti nitido, il riempimento sopra di lui deve essere opaco
   abbastanza da coprirlo ovunque tranne il filo. Con un riempimento
   semitrasparente (necessario per il vetro) il bordo pieno trapelava su
   TUTTA la carta, non solo sul contorno — la carta selezionata sembrava
   dipinta al neon anche con l'alpha del riempimento abbassata. Qui i due
   strati non si toccano. */
.qt-carta::after {
  content: ""; position: absolute; inset: 0; border-radius: 16px; padding: 1px;
  background: linear-gradient(155deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02) 55%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none; transition: background .25s ease;
}
.qt-carta:hover:not([data-off="true"]) {
  transform: translateY(-2px);
  background: linear-gradient(165deg, rgba(255,122,69,0.06), rgba(255,122,69,0.014));
  box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 16px 34px rgba(0,0,0,0.34);
}
.qt-carta:hover:not([data-off="true"])::after {
  background: linear-gradient(155deg, rgba(255,122,69,0.55), rgba(255,122,69,0.06) 55%);
}
/* Selezionata: il segnale è il bordo netto e la spunta, non un riempimento
   pieno — su tre o quattro carte insieme un tono saturo legge come un
   pannello al neon invece che come uno stato acceso fra tanti spenti. */
.qt-carta[data-on="true"] {
  background: linear-gradient(165deg, rgba(255,122,69,0.10), rgba(255,122,69,0.022) 60%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.09),
    0 12px 26px rgba(0,0,0,0.28),
    0 0 20px rgba(255,122,69,0.10);
}
.qt-carta[data-on="true"]::after {
  background: linear-gradient(155deg, var(--ember-1), var(--ember-deep) 65%);
}
.qt-carta[data-off="true"] { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.qt-carta-t { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.qt-carta-n { font-size: 14px; font-weight: 680; letter-spacing: -0.015em; }
.qt-carta-p {
  margin-left: auto; font-family: ${MONO}; font-size: 13px; font-weight: 650; white-space: nowrap;
  background: linear-gradient(120deg, var(--ember-1), var(--ember-2));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-carta[data-off="true"] .qt-carta-p { background: none; -webkit-background-clip: initial; background-clip: initial; color: var(--ink-3); }
.qt-carta-s { font-size: 12px; line-height: 1.55; color: var(--ink-2); margin: 0; }
.qt-carta-m {
  display: flex; align-items: center; gap: 6px; font-size: 11.5px; line-height: 1.5;
  color: var(--oro); margin: 9px 0 0; padding: 6px 9px; border-radius: 9px;
  background: linear-gradient(90deg, var(--oro-glow), transparent);
}
.qt-carta-m[data-tipo="richiede"] { color: var(--dusk); background: linear-gradient(90deg, var(--dusk-glow), transparent); }
.qt-tratti { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
.qt-tratto {
  font-family: ${MONO}; font-size: 10px; letter-spacing: 0.03em; color: var(--ink-3);
  border: 1px solid var(--linea); border-radius: 999px; padding: 3px 9px;
  background: rgba(255,255,255,0.03);
}
.qt-spunta {
  position: absolute; top: 12px; right: 12px; width: 19px; height: 19px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(150deg, var(--ember-1), var(--ember-deep)); color: #2A0F02;
  box-shadow: 0 3px 10px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}
/* la riga di luce che scorre sul bordo superiore di una carta accesa */
.qt-carta[data-on="true"]::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--ember-1), transparent);
  filter: blur(0.4px);
}

/* ── cursori dell'attività ───────────────────────────────────────────── */
.qt-campi { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 22px; }
.qt-campo-t { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 9px; }
.qt-campo-l { font-size: 12.5px; font-weight: 620; color: var(--ink-2); }
.qt-campo-v {
  font-family: ${MONO}; font-size: 13.5px; font-weight: 700;
  background: linear-gradient(120deg, var(--ember-1), var(--ember-2));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-range {
  width: 100%; appearance: none; height: 5px; border-radius: 3px; outline: none;
  background: linear-gradient(90deg, rgba(255,122,69,0.5), rgba(255,255,255,0.10) 0%);
  background-size: 100% 100%;
}
.qt-range::-webkit-slider-thumb {
  appearance: none; width: 17px; height: 17px; border-radius: 50%; cursor: pointer;
  background: linear-gradient(150deg, var(--ember-1), var(--ember-deep));
  border: 2px solid #17120D;
  box-shadow: 0 0 0 1px rgba(255,122,69,0.3), 0 3px 10px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}
.qt-range::-moz-range-thumb {
  width: 15px; height: 15px; border-radius: 50%; cursor: pointer; border: 2px solid #17120D;
  background: linear-gradient(150deg, var(--ember-1), var(--ember-deep));
  box-shadow: 0 3px 10px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}
.qt-campo-n { font-size: 11px; color: var(--ink-3); margin: 6px 0 0; line-height: 1.5; }

/* ── griglia a tre colonne indipendenti ──────────────────────────────────
   Base: scheda + preventivo, con la checklist impilata sotto il preventivo
   NELLA STESSA colonna (via grid-template-areas, non un div che li
   contiene entrambi: le due cose sembrano uguali ma non lo sono — un
   contenitore condiviso è quello che aveva reso possibile il bug dello
   sticky scavalcante). Da 1280px la checklist guadagna una colonna sua. */
.qt-grid {
  display: grid; gap: 20px; align-items: start;
  grid-template-columns: minmax(0,1fr) 330px;
  grid-template-areas: "main quote" "main caps";
}
.qt-grid[data-caps="false"] { grid-template-areas: "main quote"; }
.qt-pan  { grid-area: main; }
.qt-conto { grid-area: quote; }
.qt-caps { grid-area: caps; }

@media (min-width: 1280px) {
  .qt-grid { grid-template-columns: minmax(0,1fr) 320px 264px; grid-template-areas: "main quote caps"; }
  .qt-grid[data-caps="false"] { grid-template-columns: minmax(0,1fr) 330px; grid-template-areas: "main quote"; }
  /* Solo qui la checklist ha una colonna tutta sua: solo qui può restare
     agganciata in alto senza contendere lo stesso spazio verticale al
     preventivo. Nella fascia media scorre via normalmente. */
  .qt-caps { position: sticky; top: 18px; }
}

/* ── preventivo ──────────────────────────────────────────────────────── */
.qt-conto {
  position: sticky; top: 18px;
  background: linear-gradient(165deg, rgba(255,255,255,0.085), rgba(255,255,255,0.03) 55%, rgba(255,122,69,0.02));
  backdrop-filter: blur(28px) saturate(1.4); -webkit-backdrop-filter: blur(28px) saturate(1.4);
  border-radius: 22px; padding: 22px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.10),
    0 30px 70px rgba(0,0,0,0.55),
    0 0 0 1px rgba(255,122,69,0.05);
  border: 1px solid transparent;
  background-clip: padding-box;
}
.qt-conto::before {
  content: ""; position: absolute; inset: 0; border-radius: 22px; padding: 1px;
  background: linear-gradient(155deg, rgba(255,122,69,0.35), rgba(255,255,255,0.05) 40%, rgba(141,147,255,0.16));
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
  background: radial-gradient(circle at 35% 30%, var(--ember-1), var(--ember-deep));
  box-shadow: 0 0 12px var(--ember-2);
}
.qt-righe { list-style: none; margin: 0 0 14px; padding: 0; max-height: 232px; overflow-y: auto; }
.qt-riga { display: flex; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--linea-2); }
.qt-riga:last-child { border-bottom: none; }
.qt-riga-v { font-size: 12.5px; font-weight: 620; line-height: 1.4; }
.qt-riga-d { font-size: 10.5px; color: var(--ink-3); margin-top: 3px; line-height: 1.45; }
.qt-riga-p { margin-left: auto; font-family: ${MONO}; font-size: 12.5px; font-weight: 650; white-space: nowrap; color: var(--ink); }
.qt-riga[data-rett="true"] .qt-riga-p {
  background: linear-gradient(120deg, var(--ember-1), var(--ember-2));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-vuoto { font-size: 12.5px; color: var(--ink-3); line-height: 1.6; margin: 0 0 14px; }

.qt-tot { border-top: 1px solid var(--linea); padding-top: 14px; }
.qt-tot-r { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
.qt-tot-l { font-size: 12px; color: var(--ink-3); }
.qt-tot-v {
  font-family: ${MONO}; font-size: 27px; font-weight: 750; letter-spacing: -0.02em;
  background: linear-gradient(120deg, #FFFFFF, var(--ember-1) 130%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  display: inline-block;
}
/* la pulsazione del totale: parte solo quando il numero cambia davvero.
   Il colore vive nel gradiente di riempimento, quindi l'animazione lavora
   su scala e bagliore, non sul colore di riempimento — che qui non
   dipinge nulla. */
@keyframes qt-batti {
  0% { transform: scale(1); filter: drop-shadow(0 0 0 transparent); }
  35% { transform: scale(1.06); filter: drop-shadow(0 0 16px rgba(255,122,69,0.55)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0 transparent); }
}
.qt-tot-v[data-batte="true"] { animation: qt-batti .52s cubic-bezier(0.16,1,0.3,1); transform-origin: right center; }
.qt-tot-n { font-family: ${MONO}; font-size: 11px; color: var(--ink-3); letter-spacing: 0.03em; }

/* ── ritorno ─────────────────────────────────────────────────────────── */
.qt-roi { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--linea); }
.qt-roi-r { display: flex; align-items: baseline; justify-content: space-between; font-size: 12px; padding: 5px 0; }
.qt-roi-l { color: var(--ink-3); }
.qt-roi-v { font-family: ${MONO}; font-weight: 650; color: var(--ink); }
.qt-roi-v[data-buono="true"] { color: var(--ember-1); }
.qt-rientro {
  position: relative; overflow: hidden;
  margin-top: 12px; padding: 14px 16px; border-radius: 16px;
  background: linear-gradient(155deg, rgba(255,122,69,0.14), rgba(255,122,69,0.03) 70%);
  border: 1px solid rgba(255,122,69,0.28);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 26px rgba(255,122,69,0.08);
}
.qt-rientro::before {
  content: ""; position: absolute; top: -40%; right: -20%; width: 70%; height: 140%;
  background: radial-gradient(circle, rgba(255,122,69,0.16), transparent 70%);
  pointer-events: none;
}
.qt-rientro-n {
  position: relative; font-family: ${MONO}; font-size: 24px; font-weight: 750; letter-spacing: -0.02em;
  background: linear-gradient(120deg, var(--ember-1), var(--ember-2));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.qt-rientro-l { position: relative; font-size: 11.5px; color: var(--ink-2); margin-top: 4px; line-height: 1.5; }
.qt-barra { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); margin-top: 10px; overflow: hidden; display: flex; box-shadow: inset 0 1px 2px rgba(0,0,0,0.3); }
.qt-barra i { height: 100%; transition: width .5s cubic-bezier(0.16,1,0.3,1); }

/* ── checklist ───────────────────────────────────────────────────────── */
.qt-caps {
  padding: 17px 19px; border-radius: 20px;
  background: linear-gradient(165deg, rgba(255,255,255,0.05), rgba(255,255,255,0.018));
  border: 1px solid var(--linea);
  box-shadow: 0 1px 0 rgba(255,255,255,0.05), 0 14px 30px rgba(0,0,0,0.3);
}
.qt-caps-t {
  display: flex; align-items: center; justify-content: space-between;
  font-family: ${MONO}; font-size: 10px; font-weight: 650; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-3); margin: 0 0 12px;
}
.qt-caps-t b {
  background: linear-gradient(120deg, var(--ember-1), var(--ember-2));
  -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: 700;
}
.qt-cap { display: flex; align-items: center; gap: 9px; font-size: 12.5px; color: var(--ink-2); padding: 5px 0; transition: color .2s ease; }
.qt-cap[data-done="true"] { color: var(--ink); }
.qt-cap .dot {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  border: 1.5px solid rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center; font-size: 9px; color: #2A0F02;
  transition: all .25s ease;
}
.qt-cap[data-done="true"] .dot {
  background: linear-gradient(150deg, var(--ember-1), var(--ember-deep));
  border-color: transparent;
  box-shadow: 0 0 10px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,0.5);
}

/* ── azioni: pulsanti a pillola ──────────────────────────────────────── */
.qt-nav { display: flex; gap: 10px; margin-top: 22px; }
.qt-btn {
  position: relative;
  font-family: inherit; font-size: 13.5px; font-weight: 700; letter-spacing: -0.01em;
  border-radius: 999px; padding: 13px 24px; cursor: pointer; border: 1px solid transparent;
  transition: transform .16s ease, box-shadow .22s ease, opacity .2s ease, background .2s ease;
}
.qt-btn.pri {
  margin-left: auto; color: #2A0F02;
  background: linear-gradient(150deg, var(--ember-1) 0%, var(--ember-2) 55%, var(--ember-deep) 100%);
  box-shadow: 0 10px 26px var(--ember-glow), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -3px 8px rgba(42,15,2,0.2);
}
.qt-btn.pri:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 14px 34px rgba(255,122,69,0.5), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -3px 8px rgba(42,15,2,0.2);
}
.qt-btn.pri:active:not(:disabled) { transform: translateY(0); }
.qt-btn.pri:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
.qt-btn.gho {
  background: linear-gradient(165deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border-color: var(--linea); color: var(--ink-2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
}
.qt-btn.gho:hover { border-color: rgba(255,255,255,0.28); color: var(--ink); background: linear-gradient(165deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03)); }
.qt-btn.mini { padding: 9px 16px; font-size: 12px; }
.qt-btn.wide { width: 100%; margin-left: 0; justify-content: center; }

/* ── JSON ────────────────────────────────────────────────────────────── */
.qt-json {
  margin: 0; padding: 15px 16px; border-radius: 14px; overflow: auto; max-height: 340px;
  background: linear-gradient(165deg, rgba(0,0,0,0.42), rgba(0,0,0,0.24));
  border: 1px solid var(--linea);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.35);
  font-family: ${MONO}; font-size: 11.5px; line-height: 1.6; color: rgba(247,243,236,0.84);
}
.qt-json .k { color: var(--dusk); }
.qt-json .n { color: var(--oro); }
.qt-json .s { color: rgba(247,243,236,0.92); }
.qt-json .b { color: var(--rosso); }
.qt-azioni-json { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }

@media (max-width: 1000px) {
  .qt-grid { grid-template-columns: 1fr; grid-template-areas: "main" "quote" "caps"; }
  .qt-conto, .qt-caps { position: static; }
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
