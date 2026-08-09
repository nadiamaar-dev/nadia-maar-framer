/* ══════════════════════════════════════════════════════════════════════════
   VALTECNICA — sistema visivo
   Bianco e grafite, con l'arancio come brace. Schede bianche a raggio ampio
   su una scrivania grigio fredda, ombre appena accennate, numeri grandi.

   Due accenti, e ognuno ha un mestiere. La GRAFITE è la struttura: pulsanti,
   voce attiva, interruttori — tutto ciò su cui si preme. L'ARANCIO non si
   preme mai: è il marchio, è ciò che sta accadendo adesso (una corsa in
   corso, una notifica non letta) e sono i dati sul grafico. Se comparisse
   anche sui pulsanti smetterebbe di voler dire qualcosa.

   La gerarchia la costruiscono lo spazio e la dimensione, non i bordi.
   Il vetro c'è solo dove qualcosa sta davvero sopra qualcos'altro: barra
   superiore, menu, palette, foglio di navigazione. Mai sui dati.

   Resta l'inverso del sito che gli sta sotto — near-black, vetro, cremisi.
══════════════════════════════════════════════════════════════════════════ */

export const VT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.vt-root {
  /* ── superfici ── */
  --vt-desk:#F4F5F7;        /* la scrivania sotto le schede */
  --vt-sheet:#FFFFFF;       /* la scheda */
  --vt-sheet-alt:#F5F6F8;   /* riquadri annidati, righe alterne, campi */
  --vt-ink-card:#1B1F24;    /* la scheda scura: una sola per schermata */

  /* ── inchiostri ── */
  --vt-ink:#14171A;
  --vt-ink-muted:#4C555F;   /* 7,6:1 su bianco · 7,0:1 sul grigio: AA ovunque */
  --vt-ink-faint:#676E77;   /* 5,1:1 / 4,8:1 — il piu chiaro che superi il 4,5:1 */

  /* ── struttura: la grafite, ciò su cui si preme ──
     Il testo bianco sopra dà 16,5:1: nessun riempimento ha bisogno di una
     seconda tinta piu scura per passare l'AA. */
  --vt-accent-fill:#1B2027;
  --vt-accent-deep:#0A0C0E;
  --vt-accent-ghost:#E6E9ED;   /* le barre "spente" dell'istogramma */

  /* ── brace: l'arancio, ciò che accade e ciò che è del marchio ──
     «--vt-accent» resta il nome storico ed è SOLO grafica: filetti, barre,
     anelli di fuoco. Il testo bianco su #F1592A dà 3,39:1 e non passa l'AA,
     quindi i riempimenti che portano testo usano la brace piu profonda
     (4,9:1); l'occhio non distingue i due, il contrasto sì. */
  --vt-accent:#F1592A;
  --vt-ember:#F1592A;
  --vt-ember-fill:#CC3F14;
  --vt-ember-deep:#B8380F;     /* 5,9:1 su bianco: passa anche da testo */
  --vt-accent-wash:#FDEEE8;
  --vt-ember-wash:#FDEEE8;

  /* ── stati ── */
  --vt-ok:#177A45;   --vt-ok-wash:#E6F4EC;   /* 4,74:1 sul proprio fondo */
  --vt-warn:#96610F; --vt-warn-wash:#FBF1E0; /* 4,67:1 */
  --vt-bad:#B03421;  --vt-bad-wash:#FBEAE6;  /* 5,36:1 */

  /* ── linee e ombre ── */
  --vt-line:#E5E8EC;
  --vt-line-soft:#EFF1F4;
  --vt-sh-1:0 1px 2px rgba(20,23,26,0.05);
  --vt-sh-2:0 1px 2px rgba(20,23,26,0.05), 0 10px 28px -14px rgba(20,23,26,0.18);
  --vt-sh-pop:0 24px 56px -22px rgba(20,23,26,0.30), 0 2px 8px rgba(20,23,26,0.06);

  /* ── vetro: solo per ciò che sta SOPRA il contenuto ── */
  --vt-glass:rgba(255,255,255,0.74);
  --vt-glass-solid:#FFFFFF;
  --vt-glass-line:rgba(20,23,26,0.07);
  --vt-blur:saturate(180%) blur(20px);

  /* ── forma ── */
  --vt-r-card:22px;
  --vt-r-tile:16px;
  --vt-r-ctl:12px;
  --vt-r-pill:999px;

  --vt-sans:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  --vt-e:cubic-bezier(0.22,1,0.36,1);

  font-family:var(--vt-sans);
  font-variant-numeric:tabular-nums;
  -webkit-font-smoothing:antialiased;
  color:var(--vt-ink);
  font-size:14px; line-height:1.5;
  letter-spacing:-0.011em;
}

/* il sito sotto forza <p> a peso 300 e i <button> a maiuscolo: qui si riparte */
.vt-root p, .vt-root li { font-weight:400; line-height:1.5; margin:0; }
/* :where() azzera la specificità della parte fra parentesi, così questa
   riazzeratura batte le regole globali del sito (selettore di tipo, 0-0-1)
   ma PERDE contro le classi dei componenti qui sotto. Senza, ".vt-root button"
   valeva 0-1-1 e vinceva su ".vt-chip" e ".vt-btn": pillole e pulsanti
   restavano senza padding e senza fondo. */
.vt-root :where(button, a[role="button"]) {
  text-transform:none; letter-spacing:inherit; font-family:var(--vt-sans);
  border:0; background:none; padding:0; color:inherit; cursor:pointer;
}
.vt-root *, .vt-root *::before, .vt-root *::after { box-sizing:border-box; }
.vt-root h1,.vt-root h2,.vt-root h3 { margin:0; font-weight:600; letter-spacing:-0.02em; }
.vt-root table { border-collapse:collapse; width:100%; }
.vt-root input, .vt-root select { font-family:var(--vt-sans); font-size:14px; letter-spacing:inherit; }
/* niente border-radius qui: a 0-2-0 batteva .vt-chip e .vt-btn e trasformava
   ogni pillola in un rettangolo appena riceveva il fuoco */
.vt-root :focus-visible { outline:2px solid var(--vt-accent); outline-offset:2px; }
.vt-root :focus:not(:focus-visible) { outline:none; }

/* ── tipografia ─────────────────────────────────────────────────────────── */
.vt-display { font-size:30px; line-height:1.12; font-weight:600; letter-spacing:-0.03em; }
.vt-h1      { font-size:26px; line-height:1.2;  font-weight:600; letter-spacing:-0.028em; }
.vt-h2      { font-size:17px; line-height:1.3;  font-weight:600; letter-spacing:-0.02em; }
.vt-h3      { font-size:15px; line-height:1.35; font-weight:600; letter-spacing:-0.015em; }
.vt-body    { font-size:14px; line-height:1.6; }
.vt-small   { font-size:13px; line-height:1.5; }
.vt-label   { font-size:12px; line-height:1.4; color:var(--vt-ink-muted); }
.vt-micro   { font-size:11px; line-height:1.3; color:var(--vt-ink-faint); }
.vt-muted   { color:var(--vt-ink-muted); }
/* la cifra che porta il messaggio della scheda */
.vt-figure    { font-size:26px; line-height:1.15; font-weight:600; letter-spacing:-0.03em; font-variant-numeric:tabular-nums; }
.vt-figure-lg { font-size:34px; line-height:1.1;  font-weight:600; letter-spacing:-0.034em; font-variant-numeric:tabular-nums; }
.vt-data      { font-size:13.5px; font-weight:500; font-variant-numeric:tabular-nums; }
.vt-data-lg   { font-size:20px; font-weight:600; letter-spacing:-0.025em; font-variant-numeric:tabular-nums; }

/* ── schede ─────────────────────────────────────────────────────────────── */
.vt-sheet {
  background:var(--vt-sheet); border-radius:var(--vt-r-card);
  box-shadow:var(--vt-sh-1); padding:20px;
}
.vt-tile {
  background:var(--vt-sheet); border-radius:var(--vt-r-tile);
  box-shadow:var(--vt-sh-1); padding:16px; min-width:0;
}
/* la scheda scura: una per schermata, porta il dato che deve pesare */
.vt-tile-dark {
  background:var(--vt-ink-card); color:#FFFFFF;
  border-radius:var(--vt-r-tile); padding:16px; min-width:0;
  box-shadow:var(--vt-sh-2);
}
.vt-tile-dark .vt-label, .vt-tile-dark .vt-micro, .vt-tile-dark .vt-muted { color:rgba(255,255,255,0.62); }
/* Il terzo registro: la scheda che chiede di essere guardata. Non è un
   riempimento arancio pieno — il testo bianco su brace non passa l'AA e un
   riquadro acceso accanto a quello scuro farebbe a pugni: è una velatura
   calda con un filo di brace, che pesa meno della scura e piu della semplice. */
.vt-tile-accent {
  background:var(--vt-ember-wash); color:var(--vt-ink);
  border-radius:var(--vt-r-tile); padding:16px; min-width:0;
  box-shadow:inset 0 0 0 1px rgba(204,63,20,0.16);
}

/* il comando a destra (segmenti, ricerca) va a capo invece di schiacciare
   il titolo: su schermo stretto "Sintesi" finiva sotto il selettore */
.vt-card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:16px; flex-wrap:wrap; }
.vt-card-head > :first-child { min-width:min(100%,180px); flex:1 1 auto; }

/* ── pulsanti ───────────────────────────────────────────────────────────── */
.vt-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  height:40px; padding:0 16px; border-radius:var(--vt-r-pill);
  font-size:14px; font-weight:500; white-space:nowrap;
  transition:background 160ms var(--vt-e), color 160ms var(--vt-e), box-shadow 160ms var(--vt-e), transform 160ms var(--vt-e);
}
.vt-btn:active:not(:disabled) { transform:scale(0.98); }
.vt-btn-sm { height:34px; padding:0 13px; font-size:13px; }
.vt-btn-primary { background:var(--vt-accent-fill); color:#FFFFFF; box-shadow:0 8px 20px -12px rgba(20,23,26,0.9); }
.vt-btn-primary:hover:not(:disabled) { background:var(--vt-accent-deep); }
.vt-btn-dark { background:var(--vt-ink); color:#FFFFFF; }
.vt-btn-dark:hover:not(:disabled) { background:#000000; }
/* un filo sottile: senza, sulla riga in hover (stesso --vt-sheet-alt) il
   pulsante spariva del tutto, contrasto 1,00:1 */
.vt-btn-secondary { background:var(--vt-sheet-alt); color:var(--vt-ink); box-shadow:inset 0 0 0 1px var(--vt-line); }
.vt-btn-secondary:hover:not(:disabled) { background:var(--vt-line); }
.vt-btn-quiet { background:transparent; color:var(--vt-ink-muted); }
.vt-btn-quiet:hover:not(:disabled) { background:var(--vt-sheet-alt); color:var(--vt-ink); }
.vt-btn-link { background:none; height:auto; padding:0; color:var(--vt-ember-deep); font-size:13px; font-weight:500; }
.vt-btn-link:hover { text-decoration:underline; text-underline-offset:2px; }
.vt-btn:disabled { opacity:0.42; cursor:not-allowed; box-shadow:none; }

/* pulsante tondo per le azioni d'angolo, come nei riferimenti */
.vt-icon-btn {
  width:38px; height:38px; border-radius:var(--vt-r-pill); flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  background:var(--vt-sheet-alt); color:var(--vt-ink-muted);
  transition:background 160ms var(--vt-e), color 160ms var(--vt-e);
}
.vt-icon-btn:hover { background:var(--vt-line); color:var(--vt-ink); }
.vt-tile-dark .vt-icon-btn { background:rgba(255,255,255,0.12); color:#FFFFFF; }

/* ── segmenti e pillole ─────────────────────────────────────────────────── */
.vt-seg {
  display:inline-flex; align-items:center; gap:2px; padding:4px;
  background:var(--vt-sheet-alt); border-radius:var(--vt-r-pill);
}
.vt-seg button {
  height:30px; padding:0 14px; flex-shrink:0; white-space:nowrap; border-radius:var(--vt-r-pill);
  font-size:13px; font-weight:500; color:var(--vt-ink-muted);
  transition:background 160ms var(--vt-e), color 160ms var(--vt-e);
}
.vt-seg button:hover { color:var(--vt-ink); }
.vt-seg button[aria-pressed="true"] { background:var(--vt-sheet); color:var(--vt-ink); box-shadow:var(--vt-sh-1); }

.vt-chip {
  height:34px; padding:0 14px; border-radius:var(--vt-r-pill); flex-shrink:0;
  background:var(--vt-sheet-alt);
  color:var(--vt-ink-muted); font-size:13px; font-weight:500;
  display:inline-flex; align-items:center; gap:7px;
  transition:background 160ms var(--vt-e), color 160ms var(--vt-e);
}
.vt-chip:hover { color:var(--vt-ink); background:var(--vt-line); }
.vt-chip[aria-pressed="true"] { background:var(--vt-ink); color:#FFFFFF; }
.vt-chip[aria-pressed="true"] .vt-chip-n { color:rgba(255,255,255,0.72); }
.vt-chip-n { color:var(--vt-ink-faint); font-variant-numeric:tabular-nums; }

/* stato: pillola tenue con pallino */
.vt-stamp {
  display:inline-flex; align-items:center; gap:6px;
  padding:5px 11px 5px 9px; border-radius:var(--vt-r-pill);
  font-size:12px; font-weight:500; white-space:nowrap;
}
.vt-stamp::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; flex-shrink:0; }
.vt-stamp-verified { color:var(--vt-ok);   background:var(--vt-ok-wash); }
.vt-stamp-ambra    { color:var(--vt-warn); background:var(--vt-warn-wash); }
.vt-stamp-oxide    { color:var(--vt-bad);  background:var(--vt-bad-wash); }
.vt-stamp-neutral  { color:var(--vt-ink-muted); background:var(--vt-sheet-alt); }

/* variazione percentuale, come "↑ 11,5%" dei riferimenti */
.vt-delta { display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:500; }
.vt-delta-up { color:var(--vt-ok); }
.vt-delta-down { color:var(--vt-bad); }
.vt-tile-dark .vt-delta-down { color:#FFB3A3; }
.vt-tile-dark .vt-delta-up { color:#8FE3B4; }

/* ── tabelle: niente filetti verticali, righe alte, hover morbido ───────── */
.vt-table th {
  text-align:left; font-size:12px; font-weight:500; color:var(--vt-ink-faint);
  padding:0 14px; height:40px; white-space:nowrap; background:transparent;
}
.vt-table td {
  padding:0 14px; height:58px; font-size:14px; vertical-align:middle;
  border-top:1px solid var(--vt-line-soft);
}
.vt-table tbody tr { transition:background 140ms var(--vt-e); }
.vt-table tbody tr.vt-clickable { cursor:pointer; }
.vt-table tbody tr.vt-clickable:hover { background:#F9FAFB; }
.vt-table td.vt-ell { max-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.vt-num { text-align:right; font-variant-numeric:tabular-nums; font-weight:500; white-space:nowrap; }

/* il catalogo porta due piani nella cella prezzo: la riga cresce */
.vt-table-tall td { height:70px; }

/* identificativo di documento */
.vt-code { font-size:13px; font-weight:500; color:var(--vt-ink-muted); font-variant-numeric:tabular-nums; white-space:nowrap; }

/* iniziali del cliente: la riga acquista un volto, come nei riferimenti */
.vt-avatar {
  width:34px; height:34px; border-radius:var(--vt-r-pill); flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:600;
  background:var(--vt-sheet-alt); color:var(--vt-ink-muted);
  box-shadow:inset 0 0 0 1px var(--vt-line);
}

/* ── controlli ──────────────────────────────────────────────────────────── */
.vt-input, .vt-select {
  height:40px; padding:0 14px; background:var(--vt-sheet-alt);
  border:0; border-radius:var(--vt-r-pill); color:var(--vt-ink); width:100%;
  transition:box-shadow 160ms var(--vt-e);
}
.vt-input::placeholder { color:var(--vt-ink-faint); }
.vt-select {
  cursor:pointer; padding-right:34px; appearance:none; -webkit-appearance:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M3 4.5L6 7.5L9 4.5' stroke='%23676E77' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  background-repeat:no-repeat; background-position:right 13px center;
}
.vt-input:focus, .vt-select:focus { box-shadow:inset 0 0 0 1px var(--vt-line); }

.vt-step { display:inline-flex; align-items:center; background:var(--vt-sheet-alt); border-radius:var(--vt-r-pill); height:36px; padding:3px; box-shadow:inset 0 0 0 1px var(--vt-line); }
.vt-step button {
  width:30px; height:30px; border-radius:var(--vt-r-pill); color:var(--vt-ink-muted);
  font-size:16px; line-height:1; transition:background 140ms var(--vt-e);
}
.vt-step button:hover:not(:disabled) { background:var(--vt-sheet); color:var(--vt-ink); }
.vt-step input {
  width:42px; height:30px; border:0; background:transparent; text-align:center;
  font-size:14px; font-weight:500; color:var(--vt-ink);
  font-variant-numeric:tabular-nums; -moz-appearance:textfield;
}
.vt-step input::-webkit-outer-spin-button, .vt-step input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }

/* etichetta di campo */
.vt-field-label { display:block; font-size:12px; font-weight:500; color:var(--vt-ink-muted); margin-bottom:7px; }

/* ══════════════════════════════════════════════════════════════════════════
   GUSCIO — colonna a sinistra, barra di vetro in alto

   Con undici sezioni la pillola orizzontale non regge: o va a scorrimento
   (e metà voci restano fuori vista) o schiaccia il resto della barra. La
   colonna raggruppa, non nasconde, e ogni sezione esiste in UN SOLO posto —
   la barra in alto porta strumenti, mai destinazioni.
══════════════════════════════════════════════════════════════════════════ */
/* min-width:0 non è pedanteria: senza, un contenuto largo (una tabella densa)
   allarga la colonna invece di scorrere dentro di sé, il guscio diventa piu
   largo della finestra e sul telefono il foglio di navigazione — ancorato a
   .vt-main — finisce fuori schermo a sinistra. */
.vt-app { flex:1; display:flex; min-height:0; min-width:0; background:var(--vt-desk); }

.vt-side {
  width:238px; flex-shrink:0; display:flex; flex-direction:column;
  background:var(--vt-sheet); border-right:1px solid var(--vt-line);
  padding:14px 12px 10px;
}
.vt-side-brand { display:flex; align-items:center; gap:11px; padding:2px 8px 6px; min-width:0; }
.vt-side-mark {
  width:30px; height:30px; border-radius:9px; flex-shrink:0;
  background:var(--vt-ember-fill); color:#FFFFFF;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; letter-spacing:-0.02em;
}
.vt-side-name { font-size:13.5px; font-weight:600; letter-spacing:-0.015em; line-height:1.2; }
.vt-side-env  { font-size:10.5px; color:var(--vt-ink-faint); line-height:1.2; }

.vt-side-scroll { flex:1; min-height:0; overflow-y:auto; overscroll-behavior:contain; scrollbar-width:none; margin-top:6px; }
.vt-side-scroll::-webkit-scrollbar { display:none; }

.vt-side-group {
  padding:14px 10px 5px; font-size:10px; font-weight:600;
  letter-spacing:0.08em; text-transform:uppercase; color:var(--vt-ink-faint);
}
.vt-side-link {
  position:relative; display:flex; align-items:center; gap:11px;
  width:100%; height:36px; padding:0 10px; border-radius:9px;
  font-size:13.5px; font-weight:500; color:var(--vt-ink-muted); text-align:left;
  transition:color 160ms var(--vt-e), background 160ms var(--vt-e);
}
.vt-side-link:hover { background:var(--vt-sheet-alt); color:var(--vt-ink); }
.vt-side-link[aria-current="page"] { color:#FFFFFF; }
.vt-side-link[aria-current="page"]:hover { background:transparent; }
/* La pastiglia attiva è un elemento solo che scivola fra le voci: è il
   motivo per cui il cambio di sezione si legge come un movimento e non
   come due riquadri che si accendono e si spengono. */
/* Il selettore discendente vale 0-2-0 e deve stare SOPRA la regola che segue:
   a pari specificità vinceva quella dopo, la pastiglia diventava relative,
   inset spariva e il riquadro collassava a zero — la voce attiva restava
   bianca su bianco, cioè invisibile. */
.vt-side-link > .vt-side-active {
  position:absolute; inset:0; border-radius:9px; background:var(--vt-ink); z-index:0;
}
.vt-side-link > * { position:relative; z-index:1; }
.vt-side-count { margin-left:auto; font-size:11px; font-weight:500; color:var(--vt-ink-faint); font-variant-numeric:tabular-nums; }
.vt-side-link[aria-current="page"] .vt-side-count { color:rgba(255,255,255,0.65); }
.vt-side-flag {
  margin-left:auto; width:7px; height:7px; border-radius:999px; flex-shrink:0;
  box-shadow:0 0 0 3px rgba(176,52,33,0.14);
}
.vt-side-foot { flex-shrink:0; border-top:1px solid var(--vt-line-soft); padding-top:7px; margin-top:6px; }
/* Ancora reale per il pannello Impostazioni: altezza vera (quella del
   bottone), non quella di un wrapper vuoto. .vt-pop-rail si posiziona
   rispetto a QUESTO elemento. */
.vt-side-anchor { position:relative; display:block; }

.vt-settings-row {
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:14px 0; border-top:1px solid var(--vt-line-soft);
}

.vt-main { flex:1; min-width:0; display:flex; flex-direction:column; }

/* Il contenuto scorre SOTTO la barra: è la sola ragione per cui qui il vetro
   ha senso. Su una barra che non copre niente sarebbe decorazione. */
.vt-work {
  /* mai in orizzontale: a scorrere è la singola tabella, dentro il proprio
     riquadro. Altrimenti una tabella larga trascina con sé la barra superiore
     e il profilo esce dallo schermo. */
  flex:1; min-width:0; overflow-y:auto; overflow-x:hidden; overscroll-behavior:contain;
  padding:0 24px 28px; scroll-padding-top:76px;
}
.vt-topbar {
  position:sticky; top:0; z-index:20; margin:0 -24px 18px; padding:0 24px;
  height:64px; display:flex; align-items:center; gap:12px;
  background:var(--vt-glass);
  backdrop-filter:var(--vt-blur); -webkit-backdrop-filter:var(--vt-blur);
  border-bottom:1px solid var(--vt-glass-line);
}
/* Dove il vetro non esiste il fondo torna pieno, altrimenti le righe della
   tabella si leggerebbero attraverso la barra. */
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) {
  .vt-topbar { background:var(--vt-glass-solid); }
}
.vt-topbar-title { min-width:0; display:flex; flex-direction:column; justify-content:center; }
/* nowrap+ellipsis anche sul titolo: senza, in uno spazio compresso dai
   fratelli che non si restringono (ricerca, notifiche, profilo) il titolo
   andava a capo parola per parola invece di troncarsi con puntini */
.vt-topbar-title strong {
  font-size:15px; font-weight:600; letter-spacing:-0.02em; line-height:1.25;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.vt-topbar-title span {
  font-size:11.5px; color:var(--vt-ink-faint); line-height:1.3;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.vt-menu-btn { display:none; }

/* intestazione di pagina: solo i comandi di contesto — il titolo sta in alto */
.vt-page-head { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; flex-wrap:wrap; margin-bottom:20px; }

/* griglie ricorrenti */
.vt-grid { display:grid; gap:16px; }
.vt-grid-2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
.vt-grid-3 { grid-template-columns:repeat(3,minmax(0,1fr)); }
.vt-grid-4 { grid-template-columns:repeat(4,minmax(0,1fr)); }
.vt-grid-main { grid-template-columns:minmax(0,5fr) minmax(0,7fr); }
.vt-grid-side { grid-template-columns:minmax(0,4fr) minmax(0,8fr); }

/* ── cassetti ───────────────────────────────────────────────────────────── */
/* Sopra la barra superiore (z 20): con z-index 5 la barra copriva la testata
   del cassetto e i suoi pulsanti non si potevano cliccare. */
.vt-drawer-scrim { position:absolute; inset:0; background:rgba(20,23,26,0.26); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px); z-index:30; }
.vt-drawer {
  position:absolute; top:12px; right:12px; bottom:12px; width:min(560px,92%); z-index:31;
  background:var(--vt-sheet); border-radius:var(--vt-r-card);
  box-shadow:var(--vt-sh-pop); display:flex; flex-direction:column; overflow:hidden;
}
.vt-drawer-head { flex-shrink:0; padding:20px 22px 0; }
.vt-drawer-body { flex:1; overflow-y:auto; overflow-x:auto; overscroll-behavior:contain; padding:20px 22px 22px; }

.vt-tab {
  height:38px; padding:0 14px; border-radius:var(--vt-r-pill);
  font-size:13.5px; font-weight:500; color:var(--vt-ink-muted);
  transition:background 160ms var(--vt-e), color 160ms var(--vt-e);
}
.vt-tab:hover { color:var(--vt-ink); }
.vt-tab[aria-selected="true"] { background:var(--vt-sheet-alt); color:var(--vt-ink); }

/* avviso di permesso negato */
.vt-denied {
  background:var(--vt-sheet-alt); border-radius:var(--vt-r-ctl);
  padding:11px 14px; font-size:13px; line-height:1.5; color:var(--vt-ink-muted);
}

/* ── finestra dell'anteprima ────────────────────────────────────────────── */
.vt-overlay {
  position:fixed; inset:0; z-index:3000; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:14px; padding:28px;
  background:rgba(8,10,14,0.82); overscroll-behavior:contain;
}
.vt-window {
  width:100%; max-width:1320px; height:min(90vh,900px);
  display:flex; flex-direction:column; overflow:hidden;
  background:var(--vt-desk); border-radius:26px; box-shadow:0 40px 90px -30px rgba(0,0,0,0.6);
}
.vt-chrome {
  height:46px; flex-shrink:0; display:flex; align-items:center; gap:10px; padding:0 16px;
  background:var(--vt-sheet); border-bottom:1px solid var(--vt-line);
}
.vt-route {
  font-size:12px; color:var(--vt-ink-faint); background:var(--vt-sheet-alt);
  border-radius:var(--vt-r-pill); padding:5px 12px;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.vt-chrome-btn {
  height:30px; padding:0 12px; border-radius:var(--vt-r-pill);
  background:var(--vt-sheet-alt); color:var(--vt-ink-muted);
  font-size:12.5px; font-weight:500; display:inline-flex; align-items:center; gap:6px;
  transition:background 160ms var(--vt-e), color 160ms var(--vt-e);
}
.vt-chrome-btn:hover { background:var(--vt-line); color:var(--vt-ink); }
.vt-chrome-btn[aria-pressed="true"] { background:var(--vt-ink); color:#FFFFFF; }

.vt-caption {
  width:100%; max-width:1320px; flex-shrink:0;
  background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.11);
  border-radius:18px; padding:14px 18px; color:#FFFFFF;
  display:grid; grid-template-columns:minmax(0,1fr) auto; gap:20px; align-items:center;
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
}
.vt-cap-chip {
  font-size:11.5px; color:rgba(255,255,255,0.74);
  border:1px solid rgba(255,255,255,0.17); border-radius:var(--vt-r-pill); padding:3px 10px;
}
.vt-cap-step {
  display:flex; align-items:center; gap:8px; font-size:12.5px;
  color:rgba(255,255,255,0.52); transition:color 200ms var(--vt-e);
}
.vt-cap-step.is-done { color:#FFFFFF; }
.vt-cap-box {
  width:15px; height:15px; flex-shrink:0; border:1px solid rgba(255,255,255,0.30);
  border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:9px; line-height:1;
}
.vt-cap-step.is-done .vt-cap-box { border-color:var(--vt-accent); background:var(--vt-accent); color:#FFFFFF; }

/* ── barra inferiore, solo sotto i 760px ────────────────────────────────── */
.vt-tabbar { display:none; }

/* ══════════════════════════════════════════════════════════════════════════
   DENSITÀ
   Comoda per leggere, compatta per lavorare: cambia solo l'altezza delle
   righe e il passo verticale, mai la dimensione del testo.
══════════════════════════════════════════════════════════════════════════ */
[data-density="compact"] .vt-table td { height:46px; }
[data-density="compact"] .vt-table th { height:34px; }
[data-density="compact"] .vt-sheet { padding:16px; }
[data-density="compact"] .vt-tile { padding:13px; }
[data-density="compact"] .vt-avatar { width:28px; height:28px; font-size:11px; }
[data-density="compact"] .vt-grid { gap:12px; }

/* ══════════════════════════════════════════════════════════════════════════
   BARRA SUPERIORE — ricerca, notifiche, aiuto, profilo
══════════════════════════════════════════════════════════════════════════ */
.vt-tools { display:flex; align-items:center; gap:6px; flex-shrink:0; }

.vt-search-btn {
  display:inline-flex; align-items:center; gap:9px; height:40px; padding:0 12px 0 14px;
  border-radius:var(--vt-r-pill); background:var(--vt-sheet); box-shadow:var(--vt-sh-1);
  color:var(--vt-ink-faint); font-size:13.5px; min-width:190px;
  transition:box-shadow 160ms var(--vt-e), color 160ms var(--vt-e);
}
.vt-search-btn:hover { color:var(--vt-ink-muted); box-shadow:var(--vt-sh-2); }
.vt-kbd {
  margin-left:auto; font-size:11px; font-weight:500; color:var(--vt-ink-faint);
  background:var(--vt-sheet-alt); border-radius:6px; padding:3px 7px; line-height:1;
}

.vt-tool-btn {
  position:relative; width:40px; height:40px; border-radius:var(--vt-r-pill); flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  background:var(--vt-sheet); box-shadow:var(--vt-sh-1); color:var(--vt-ink-muted);
  transition:color 160ms var(--vt-e), box-shadow 160ms var(--vt-e);
}
.vt-tool-btn:hover { color:var(--vt-ink); box-shadow:var(--vt-sh-2); }
.vt-tool-btn[aria-expanded="true"] { color:var(--vt-ink); box-shadow:var(--vt-sh-2); }
.vt-badge {
  position:absolute; top:5px; right:5px; min-width:17px; height:17px; padding:0 4px;
  border-radius:var(--vt-r-pill); background:var(--vt-ember-fill); color:#FFFFFF;
  font-size:10px; font-weight:600; line-height:17px; text-align:center;
  box-shadow:0 0 0 2px var(--vt-sheet);
}

.vt-profile {
  display:inline-flex; align-items:center; gap:10px; height:44px; padding:0 12px 0 4px;
  border-radius:var(--vt-r-pill); background:var(--vt-sheet); box-shadow:var(--vt-sh-1);
  transition:box-shadow 160ms var(--vt-e);
}
.vt-profile:hover { box-shadow:var(--vt-sh-2); }
.vt-profile-name { font-size:13px; font-weight:600; line-height:1.25; }
.vt-profile-mail { font-size:11px; color:var(--vt-ink-faint); line-height:1.25; }

/* ══════════════════════════════════════════════════════════════════════════
   MENU A TENDINA E PANNELLI
══════════════════════════════════════════════════════════════════════════ */
.vt-pop {
  position:absolute; top:calc(100% + 8px); right:0; z-index:40;
  background:var(--vt-sheet); border-radius:18px; box-shadow:var(--vt-sh-pop);
  min-width:260px; max-width:min(380px,92vw); overflow:hidden;
}
/* Impostazioni, in fondo alla colonna: verso il basso non c'è spazio, quindi
   il pannello sale dal bottone invece di scendere sotto, e sconfina a destra
   della colonna invece di restringersi dentro i suoi 238px. */
.vt-pop-rail { top:auto; bottom:0; left:calc(100% + 10px); right:auto; }

.vt-pop-head { padding:14px 16px 12px; border-bottom:1px solid var(--vt-line-soft); }
.vt-pop-body { max-height:min(420px,55vh); overflow-y:auto; overscroll-behavior:contain; }
.vt-pop-foot { padding:10px 12px; border-top:1px solid var(--vt-line-soft); }
.vt-pop-item {
  display:flex; align-items:center; gap:11px; width:100%; padding:11px 16px;
  text-align:left; font-size:13.5px; color:var(--vt-ink);
  transition:background 140ms var(--vt-e);
}
.vt-pop-item:hover { background:var(--vt-sheet-alt); }
.vt-pop-item[aria-current="true"] { background:var(--vt-sheet-alt); }

.vt-notif {
  display:flex; gap:12px; width:100%; padding:13px 16px; text-align:left;
  border-bottom:1px solid var(--vt-line-soft); transition:background 140ms var(--vt-e);
}
.vt-notif:hover { background:var(--vt-sheet-alt); }
.vt-notif-dot { width:8px; height:8px; border-radius:999px; flex-shrink:0; margin-top:5px; }
.vt-notif.is-read .vt-notif-dot { background:transparent; box-shadow:inset 0 0 0 1px var(--vt-ink-faint); }

/* interruttore */
.vt-switch {
  width:40px; height:23px; border-radius:999px; flex-shrink:0; position:relative;
  background:var(--vt-line); transition:background 180ms var(--vt-e);
}
.vt-switch[aria-checked="true"] { background:var(--vt-accent-fill); }
.vt-switch::after {
  content:''; position:absolute; top:3px; left:3px; width:17px; height:17px; border-radius:999px;
  background:#FFFFFF; transition:transform 180ms var(--vt-e); box-shadow:0 1px 2px rgba(0,0,0,0.2);
}
.vt-switch[aria-checked="true"]::after { transform:translateX(17px); }

/* ══════════════════════════════════════════════════════════════════════════
   PALETTA DEI COMANDI (⌘K)
══════════════════════════════════════════════════════════════════════════ */
.vt-palette-scrim {
  position:absolute; inset:0; z-index:50; background:rgba(20,23,26,0.34);
  backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
  display:flex; align-items:flex-start; justify-content:center; padding:12vh 20px 20px;
}
.vt-palette {
  width:100%; max-width:620px; background:var(--vt-sheet); border-radius:20px;
  box-shadow:var(--vt-sh-pop); overflow:hidden; display:flex; flex-direction:column;
  max-height:min(70vh,540px);
}
.vt-palette-input {
  width:100%; height:58px; padding:0 20px; border:0; background:transparent;
  font-size:16px; color:var(--vt-ink); border-bottom:1px solid var(--vt-line-soft);
}
.vt-palette-input::placeholder { color:var(--vt-ink-faint); }
.vt-palette-list { flex:1; overflow-y:auto; overscroll-behavior:contain; padding:6px; }
.vt-palette-group { font-size:11px; font-weight:600; color:var(--vt-ink-faint); padding:10px 14px 6px; }
.vt-palette-item {
  display:flex; align-items:center; gap:12px; width:100%; padding:10px 14px;
  border-radius:12px; text-align:left; font-size:14px; color:var(--vt-ink);
}
.vt-palette-item[aria-selected="true"] { background:var(--vt-sheet-alt); }
.vt-palette-meta { margin-left:auto; font-size:12px; color:var(--vt-ink-faint); flex-shrink:0; }

/* ══════════════════════════════════════════════════════════════════════════
   RAIL DI SERVIZIO — non ripete le sezioni: porta gli strumenti
══════════════════════════════════════════════════════════════════════════ */
.vt-rail-sep { width:22px; height:1px; background:var(--vt-line); margin:6px 0; flex-shrink:0; }
.vt-rail-spacer { flex:1; }

/* ── adattamenti ────────────────────────────────────────────────────────── */
@media (max-width: 1180px) {
  .vt-grid-main, .vt-grid-side { grid-template-columns:minmax(0,1fr); }
  .vt-grid-3, .vt-grid-4 { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
/* Sotto i 1080 px la colonna si stringe alle sole icone: le sezioni restano
   tutte raggiungibili, sparisce solo il nome. */
@media (max-width: 1080px) and (min-width: 901px) {
  .vt-side { width:64px; padding:14px 10px 10px; align-items:center; }
  .vt-side-text, .vt-side-group, .vt-side-count { display:none; }
  .vt-side-link { justify-content:center; padding:0; width:40px; }
  .vt-side-brand { padding:2px 0 6px; justify-content:center; }
  .vt-side-flag { position:absolute; top:6px; right:6px; margin:0; }
}

@media (max-width: 900px) {
  .vt-side { display:none; }
  .vt-menu-btn { display:inline-flex; }
  /* Nel foglio di navigazione il bottone Impostazioni sta vicino al bordo
     sinistro di un pannello largo min(300px,86%): "esce a destra" lo spinge
     in gran parte fuori dai 390px tipici di un telefono. Qui sale dal
     bottone invece di uscire di lato e resta incollato al bordo sinistro.
     La larghezza è quella del FOGLIO, non dello schermo: il foglio scrolla
     in proprio (overflow-y:auto forza anche overflow-x:auto per regola CSS),
     quindi un pannello più largo dei suoi 300px veniva tagliato di netto sul
     bordo destro invece che restare semplicemente stretto. */
  .vt-pop-rail {
    top:auto; bottom:calc(100% + 8px); left:0; right:auto;
    width:auto; max-width:236px;
  }
  /* Sotto i 236px complessivi la riga "etichetta a sinistra, controllo a
     destra" lascia al testo una colonna larga quanto un'unghia: "leggere"
     andava a capo lettera per lettera. Qui il controllo scende sotto. */
  .vt-pop-rail .vt-settings-row { flex-direction:column; align-items:flex-start; gap:10px; }
}

@media (max-width: 760px) {
  .vt-overlay { padding:0; gap:0; }
  .vt-window { max-width:none; height:100dvh; border-radius:0; }
  .vt-caption { display:none; }
  .vt-topbar { height:56px; margin:0 -16px 14px; padding:0 16px; gap:8px; }
  .vt-work { padding:0 16px 24px; }
  /* «Cerca ⌘K» a tutta pillola e nome+ruolo del profilo insieme pesano
     ~330px: sommati al titolo e al bottone del menu non ci stanno in un
     telefono da 390px, ed è per questo che sul telefono il profilo finiva
     tagliato a metà oltre il bordo destro dello schermo. La scorciatoia da
     tastiera poi non significa nulla su un touch-screen. Qui la ricerca
     torna un'icona sola e il profilo perde nome ed e-mail, restando
     l'avatar: l'azione (aprire ricerca, aprire il menu profilo) resta,
     l'etichetta superflua no. */
  .vt-search-btn {
    min-width:0; width:40px; height:40px; padding:0; justify-content:center;
    border-radius:var(--vt-r-pill);
  }
  .vt-search-label, .vt-kbd { display:none; }
  .vt-profile { padding:0; width:40px; height:40px; justify-content:center; }
  .vt-profile-text, .vt-profile > svg { display:none; }
  .vt-grid-2, .vt-grid-3 { grid-template-columns:minmax(0,1fr); }
  .vt-display { font-size:24px; }
  .vt-figure-lg { font-size:28px; }
  /* un registro denso scorre invece di schiacciare le colonne */
  .vt-table { min-width:640px; }
  .vt-table td.vt-ell { max-width:none; }
  .vt-drawer { inset:auto 0 0 0; width:100%; height:90%; border-radius:22px 22px 0 0; }
  .vt-route, .vt-chrome > .vt-brand { display:none; }
}

/* ══════════════════════════════════════════════════════════════════════════
   NAVIGAZIONE SUL TELEFONO
   Un sistema solo: quattro destinazioni in basso piu «Altro», che apre lo
   stesso elenco raggruppato della colonna. Niente hamburger in alto E barra
   in basso: sarebbe la stessa navigazione disegnata due volte.
══════════════════════════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  .vt-tabbar {
    flex-shrink:0; height:58px; display:flex; z-index:22;
    background:var(--vt-glass);
    backdrop-filter:var(--vt-blur); -webkit-backdrop-filter:var(--vt-blur);
    border-top:1px solid var(--vt-glass-line);
    padding-bottom:env(safe-area-inset-bottom);
  }
  .vt-tabbar button {
    flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
    font-size:10.5px; font-weight:500; color:var(--vt-ink-faint); min-width:0;
  }
  .vt-tabbar button > span { max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .vt-tabbar button[aria-current="page"] { color:var(--vt-ember-deep); }
}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) {
  .vt-tabbar { background:var(--vt-glass-solid); }
}

.vt-nav-scrim {
  position:absolute; inset:0; z-index:44; background:rgba(20,23,26,0.34);
  backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
}
/* Qui il vetro è vero: il foglio sta davvero sopra l'applicazione, e sotto
   c'è uno strato scuro uniforme, quindi il contrasto del testo è prevedibile.
   Sopra ci va solo inchiostro pieno o attenuato, mai il grigio piu chiaro. */
.vt-nav-sheet {
  position:absolute; inset:0 auto 0 0; z-index:45; width:min(300px,86%);
  background:rgba(255,255,255,0.84);
  backdrop-filter:var(--vt-blur); -webkit-backdrop-filter:var(--vt-blur);
  box-shadow:var(--vt-sh-pop); display:flex; flex-direction:column;
  padding:16px 12px 12px; overflow-y:auto; overscroll-behavior:contain;
}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) {
  .vt-nav-sheet { background:var(--vt-glass-solid); }
}
.vt-nav-sheet .vt-side-group { color:var(--vt-ink-muted); }

/* ══════════════════════════════════════════════════════════════════════════
   SINCRONIZZAZIONE — fasi, avanzamento, diario
══════════════════════════════════════════════════════════════════════════ */
.vt-phase { display:flex; align-items:center; gap:11px; padding:9px 0; }
.vt-phase-dot {
  width:18px; height:18px; border-radius:999px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  box-shadow:inset 0 0 0 1px var(--vt-line); color:#FFFFFF; font-size:9px;
}
.vt-phase.is-done .vt-phase-dot { background:var(--vt-ok); box-shadow:none; }
.vt-phase.is-live .vt-phase-dot { background:var(--vt-ember-fill); box-shadow:none; }
.vt-phase.is-live .vt-phase-dot::after {
  content:''; width:6px; height:6px; border-radius:999px; background:#FFFFFF;
  animation:vt-pulse 1s var(--vt-e) infinite;
}
.vt-phase-label { font-size:13px; color:var(--vt-ink-faint); }
.vt-phase.is-done .vt-phase-label, .vt-phase.is-live .vt-phase-label { color:var(--vt-ink); }
.vt-phase-n { margin-left:auto; font-size:12px; color:var(--vt-ink-faint); font-variant-numeric:tabular-nums; }
@keyframes vt-pulse { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.35; transform:scale(0.7) } }

.vt-bar { height:5px; border-radius:999px; background:var(--vt-line); overflow:hidden; }
.vt-bar > span { display:block; height:100%; background:var(--vt-ember-fill); border-radius:999px; transition:width 260ms linear; }

.vt-log {
  font-family:ui-monospace,'SF Mono',Menlo,monospace; font-size:11.5px; line-height:1.7;
  background:var(--vt-ink-card); color:rgba(255,255,255,0.82);
  border-radius:var(--vt-r-tile); padding:14px 16px;
  max-height:210px; overflow-y:auto; overscroll-behavior:contain;
  white-space:pre-wrap; word-break:break-word;
}
.vt-log b { color:#FFFFFF; font-weight:600; }
.vt-log .warn { color:#F0C878; }
.vt-log .err  { color:#FFB3A3; }
.vt-log .ok   { color:#8FE3B4; }

/* la mappatura: nostro campo ← loro percorso */
.vt-map { display:grid; grid-template-columns:minmax(0,1fr) 18px minmax(0,1.35fr); gap:8px 10px; align-items:center; }
.vt-map-arrow { color:var(--vt-ink-faint); text-align:center; font-size:12px; }
.vt-path {
  font-family:ui-monospace,'SF Mono',Menlo,monospace; font-size:11.5px;
  background:var(--vt-sheet-alt); border-radius:7px; padding:5px 8px;
  color:var(--vt-ink-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}

/* ══════════════════════════════════════════════════════════════════════════
   REGOLE DI PREZZO
══════════════════════════════════════════════════════════════════════════ */
.vt-rule {
  display:flex; align-items:center; gap:14px; width:100%; text-align:left;
  padding:14px 16px; border-radius:var(--vt-r-tile);
  background:var(--vt-sheet); box-shadow:inset 0 0 0 1px var(--vt-line);
  transition:box-shadow 160ms var(--vt-e), background 160ms var(--vt-e);
}
.vt-rule:hover { box-shadow:inset 0 0 0 1px var(--vt-ink-faint); }
.vt-rule[aria-pressed="true"] { box-shadow:inset 0 0 0 2px var(--vt-ink); }
.vt-rule.is-off { background:var(--vt-sheet-alt); }
.vt-rule.is-off .vt-h3, .vt-rule.is-off .vt-data { color:var(--vt-ink-faint); }
.vt-rule-prio {
  width:30px; height:30px; border-radius:9px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:var(--vt-sheet-alt); color:var(--vt-ink-muted);
  font-size:12px; font-weight:600; font-variant-numeric:tabular-nums;
}

/* il passaggio del calcolo: costo → ricarico → pavimento → arrotondamento */
.vt-steps { display:flex; flex-wrap:wrap; align-items:center; gap:7px; }
.vt-step-pill {
  display:inline-flex; align-items:baseline; gap:7px; padding:6px 11px;
  border-radius:var(--vt-r-pill); background:var(--vt-sheet-alt); font-size:12px;
  color:var(--vt-ink-muted); white-space:nowrap;
}
.vt-step-pill b { font-size:13px; font-weight:600; color:var(--vt-ink); font-variant-numeric:tabular-nums; }
.vt-step-pill.is-last { background:var(--vt-ink); color:rgba(255,255,255,0.7); }
.vt-step-pill.is-last b { color:#FFFFFF; }
.vt-step-arrow { color:var(--vt-ink-faint); font-size:12px; }

.vt-range { -webkit-appearance:none; appearance:none; width:100%; height:22px; background:transparent; cursor:pointer; }
.vt-range::-webkit-slider-runnable-track { height:5px; border-radius:999px; background:var(--vt-line); }
.vt-range::-moz-range-track { height:5px; border-radius:999px; background:var(--vt-line); }
.vt-range::-webkit-slider-thumb {
  -webkit-appearance:none; appearance:none; width:18px; height:18px; margin-top:-6.5px;
  border-radius:999px; background:var(--vt-ink); box-shadow:0 1px 4px rgba(20,23,26,0.4);
}
.vt-range::-moz-range-thumb {
  width:18px; height:18px; border:0; border-radius:999px;
  background:var(--vt-ink); box-shadow:0 1px 4px rgba(20,23,26,0.4);
}

@media (prefers-reduced-motion: reduce) {
  .vt-root *, .vt-root *::before, .vt-root *::after {
    animation-duration:0.01ms !important; animation-iteration-count:1 !important;
    transition-duration:0.01ms !important;
  }
}
`
