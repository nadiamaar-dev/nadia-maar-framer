/* ══════════════════════════════════════════════════════════════════════════
   QUADRANTE CRM — sistema visivo

   Pannelli che galleggiano su una pagina grigio chiaro. Tre materiali, e
   ognuno vuol dire una cosa precisa:

     · NERO   — la colonna e il pannello di lavoro. È il posto da cui si
                sceglie: sta fermo, si guarda di sfuggita, non compete.
     · BIANCO — il dettaglio. Qui si legge davvero, e su bianco un testo
                denso si legge meglio, sempre.
     · PASTELLO (lime e lavanda) — le schede che portano una decisione:
                stato della trattativa, prossima azione. Sono poche di
                proposito: se ogni riquadro fosse colorato, il colore non
                direbbe più «guarda qui».

   Il lime porta SEMPRE inchiostro nero (15,9:1). Bianco su lime dà 1,3:1 —
   non è una scelta stilistica, è illeggibile.

   È il contrario del portale fornitori (bianco, grafite, brace arancione) di
   proposito: due prodotti diversi non devono somigliarsi in portfolio.
══════════════════════════════════════════════════════════════════════════ */

export const Q_CSS = `

.q-root {
  /* ── la pagina e i pannelli ── */
  --q-page:#E8E9EA;         /* il piano su cui tutto galleggia */
  --q-dark:#121417;         /* pannello nero */
  --q-dark-2:#1B1E23;       /* riquadro dentro il nero */
  --q-dark-3:#262A31;       /* controllo sul nero */
  --q-sheet:#FFFFFF;
  --q-sheet-2:#F4F5F6;      /* riga alterna, campo, colonna del board */
  --q-sheet-3:#E9EAEC;

  /* ── inchiostri sul chiaro ── */
  --q-ink:#14161A;          /* 16,9:1 su bianco */
  --q-ink-muted:#4F565F;    /* 7,3:1 su bianco · 6,7:1 su #F4F5F6 */
  --q-ink-faint:#6A727C;    /* 4,9:1 / 4,6:1 — il piu chiaro che superi l'AA */

  /* ── inchiostri sul nero ── */
  --q-on-dark:#F4F5F7;      /* 16,8:1 su --q-dark */
  --q-on-dark-muted:#A5ADB8;/* 7,6:1 */
  --q-on-dark-faint:#828A95;/* 4,9:1 — il minimo ammesso sul nero */

  /* ── pastelli ── */
  --q-lime:#D4F94F;
  --q-lime-2:#E4FB8D;       /* velatura */
  --q-lime-deep:#4F6B00;    /* lime come TESTO su bianco: 5,9:1 */
  --q-lav:#C9BDFB;
  --q-lav-deep:#4B36A8;     /* lavanda come anello/testo su chiaro: 7,4:1 su bianco */
  --q-on-pastel:#14161A;    /* inchiostro sopra lime e lavanda */

  /* ── stati della pipeline ── */
  --q-st-nuovo:#9AA5B4;
  --q-st-contatto:#7DC8F7;
  --q-st-negoz:#C9BDFB;
  --q-st-vinto:#D4F94F;
  --q-st-perso:#F5A97A;

  /* ── segnali ── */
  --q-hot:#FF6B45;          /* la pillola «alta» del riferimento */
  --q-ok:#177A45;   --q-ok-wash:#E6F4EC;
  --q-warn:#8A5A00; --q-warn-wash:#FBF1DF;
  --q-bad:#B02A24;  --q-bad-wash:#FBEAE8;

  /* ── linee e ombre ── */
  --q-line:#E4E6E9;
  --q-line-soft:#EFF0F2;
  --q-line-dark-2:rgba(255,255,255,0.15);
  --q-sh-1:0 1px 2px rgba(10,12,15,0.05);
  --q-sh-pop:0 26px 60px -22px rgba(10,12,15,0.42), 0 2px 10px rgba(10,12,15,0.10);
  --q-sh-drag:0 20px 42px -12px rgba(10,12,15,0.34);

  /* ── forma: raggi ampi, è metà del carattere del prodotto ── */
  --q-r-xl:24px;
  --q-r-lg:20px;
  --q-r:14px;
  --q-r-sm:10px;
  --q-r-pill:999px;

  --q-sans:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  --q-e:cubic-bezier(0.22,1,0.36,1);

  font-family:var(--q-sans);
  font-variant-numeric:tabular-nums;
  -webkit-font-smoothing:antialiased;
  color:var(--q-ink);
  font-size:14px; line-height:1.5;
  letter-spacing:-0.011em;
}

/* Il sito sotto forza <p> a peso 300 e i <button> a maiuscolo. :where()
   azzera la specificità: batte le regole globali del sito (selettore di
   tipo) ma perde contro le classi dei componenti qui sotto. */
.q-root :where(button, a[role="button"]) {
  text-transform:none; letter-spacing:inherit; font-family:var(--q-sans);
  border:0; background:none; padding:0; color:inherit; cursor:pointer;
}
.q-root p, .q-root li { font-weight:400; line-height:1.5; margin:0; }
.q-root *, .q-root *::before, .q-root *::after { box-sizing:border-box; }
.q-root h1,.q-root h2,.q-root h3,.q-root h4 { margin:0; font-weight:600; letter-spacing:-0.022em; }
.q-root table { border-collapse:collapse; width:100%; }
.q-root input, .q-root select, .q-root textarea {
  font-family:var(--q-sans); font-size:14px; letter-spacing:inherit;
}
/* niente border-radius qui: batterebbe le pillole e le renderebbe
   rettangoli appena ricevono il fuoco */
.q-root :focus-visible { outline:2px solid var(--q-ink); outline-offset:2px; }
.q-root :focus:not(:focus-visible) { outline:none; }
.q-dark-panel :focus-visible { outline-color:var(--q-lime); }

/* ── tipografia ─────────────────────────────────────────────────────────── */
.q-display { font-size:32px; line-height:1.06; font-weight:700; letter-spacing:-0.036em; }
.q-h1 { font-size:21px; line-height:1.2; font-weight:600; letter-spacing:-0.028em; }
.q-h2 { font-size:16px; line-height:1.3; font-weight:600; letter-spacing:-0.022em; }
.q-h3 { font-size:13.5px; line-height:1.35; font-weight:600; letter-spacing:-0.015em; }
.q-small { font-size:13px; line-height:1.5; }
.q-label { font-size:12px; line-height:1.4; color:var(--q-ink-muted); }
.q-micro { font-size:11px; line-height:1.35; color:var(--q-ink-faint); }
.q-eyebrow {
  font-size:10px; font-weight:600; letter-spacing:0.09em; text-transform:uppercase;
  color:var(--q-ink-faint);
}
.q-figure { font-size:27px; line-height:1.05; font-weight:700; letter-spacing:-0.035em; }
.q-figure-lg { font-size:36px; line-height:1.02; font-weight:700; letter-spacing:-0.04em; }
.q-num { font-variant-numeric:tabular-nums; }

/* dentro un pannello nero gli inchiostri si ribaltano, i pesi no */
.q-dark-panel { color:var(--q-on-dark); }
.q-dark-panel .q-label { color:var(--q-on-dark-muted); }
.q-dark-panel .q-micro, .q-dark-panel .q-eyebrow { color:var(--q-on-dark-faint); }

/* ══════════════════════════════════════════════════════════════════════════
   GUSCIO — pannelli che galleggiano, non riquadri incollati ai bordi
══════════════════════════════════════════════════════════════════════════ */
.q-app {
  flex:1; display:flex; min-height:0; min-width:0;
  background:var(--q-page); padding:10px; gap:10px;
}

.q-rail {
  width:62px; flex-shrink:0; display:flex; flex-direction:column; align-items:center;
  gap:5px; padding:14px 0 12px;
  background:var(--q-dark); border-radius:var(--q-r-xl);
  color:var(--q-on-dark);
}
.q-mark {
  width:36px; height:36px; border-radius:12px; flex-shrink:0; margin-bottom:14px;
  background:var(--q-lime); color:var(--q-on-pastel);
  display:flex; align-items:center; justify-content:center;
  font-size:16px; font-weight:800; letter-spacing:-0.04em;
}
.q-rail-btn {
  position:relative; width:40px; height:40px; border-radius:13px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  color:var(--q-on-dark-faint); background:transparent;
  transition:background 160ms var(--q-e), color 160ms var(--q-e);
}
.q-rail-btn:hover { background:var(--q-dark-2); color:var(--q-on-dark); }
.q-rail-btn[aria-current="page"] { background:var(--q-lime); color:var(--q-on-pastel); }
.q-rail-spacer { flex:1; }
/* etichetta al passaggio: una colonna di sole icone senza nomi si impara a
   memoria o non si impara affatto */
.q-rail-btn::after {
  content:attr(data-label);
  position:absolute; left:calc(100% + 10px); top:50%; transform:translateY(-50%);
  padding:6px 11px; border-radius:9px; white-space:nowrap;
  background:var(--q-dark); color:var(--q-on-dark);
  font-size:12px; font-weight:500; letter-spacing:-0.01em;
  opacity:0; pointer-events:none; transition:opacity 140ms var(--q-e);
  box-shadow:var(--q-sh-pop); z-index:8;
}
.q-rail-btn:hover::after, .q-rail-btn:focus-visible::after { opacity:1; }

.q-main { flex:1; min-width:0; display:flex; flex-direction:column; gap:10px; }

/* ── barra superiore: pannello bianco, non una fascia a tutta larghezza ── */
.q-topbar {
  flex-shrink:0; height:62px; display:flex; align-items:center; gap:12px;
  padding:0 16px 0 20px;
  background:var(--q-sheet); border-radius:var(--q-r-xl); box-shadow:var(--q-sh-1);
}
.q-topbar-title { min-width:0; display:flex; flex-direction:column; justify-content:center; }
.q-topbar-title strong {
  font-size:16px; font-weight:700; letter-spacing:-0.026em; line-height:1.2;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.q-topbar-title span {
  font-size:11.5px; color:var(--q-ink-faint); line-height:1.3;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
/* Il pulsante-panino serve solo quando la colonna di sinistra sparisce.
   Il selettore è .q-topbar .q-menu-btn (0-2-0) e non .q-menu-btn (0-1-0):
   il pulsante porta ANCHE la classe .q-tool, che vale altrettanto ma è
   scritta piu sotto in questo foglio — a parità di specificità vince
   l'ultima, quindi display:inline-flex di .q-tool ribaltava questo none e
   l'icona restava visibile anche a schermo intero, dove apre un pannello
   che a quella larghezza non ha stili. */
.q-topbar .q-menu-btn { display:none; }

.q-search {
  display:inline-flex; align-items:center; gap:9px; height:38px; padding:0 14px;
  border-radius:var(--q-r-pill); background:var(--q-sheet-2);
  color:var(--q-ink-faint); font-size:13px; min-width:190px;
  transition:background 160ms var(--q-e), color 160ms var(--q-e);
}
.q-search:hover { background:var(--q-sheet-3); color:var(--q-ink-muted); }
.q-kbd {
  margin-left:auto; font-size:10.5px; font-weight:600; color:var(--q-ink-faint);
  background:var(--q-sheet); border-radius:6px; padding:3px 6px; line-height:1;
}

.q-tool {
  position:relative; width:38px; height:38px; border-radius:var(--q-r-pill); flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  background:var(--q-sheet-2); color:var(--q-ink-muted);
  transition:background 160ms var(--q-e), color 160ms var(--q-e);
}
.q-tool:hover { background:var(--q-sheet-3); color:var(--q-ink); }
.q-badge {
  position:absolute; top:3px; right:3px; min-width:16px; height:16px; padding:0 4px;
  border-radius:var(--q-r-pill); background:var(--q-hot); color:#FFFFFF;
  font-size:9.5px; font-weight:700; line-height:16px; text-align:center;
  box-shadow:0 0 0 2px var(--q-sheet);
}

.q-me {
  display:inline-flex; align-items:center; gap:10px; height:42px; padding:0 12px 0 4px;
  border-radius:var(--q-r-pill); background:var(--q-sheet-2);
  transition:background 160ms var(--q-e);
}
.q-me:hover { background:var(--q-sheet-3); }

.q-work {
  flex:1; min-width:0; min-height:0; overflow-y:auto; overflow-x:hidden;
  overscroll-behavior:contain;
}
.q-page-head {
  display:flex; align-items:flex-end; justify-content:space-between;
  gap:20px; flex-wrap:wrap; margin-bottom:14px;
}

/* ══════════════════════════════════════════════════════════════════════════
   RIQUADRI
══════════════════════════════════════════════════════════════════════════ */
.q-card {
  background:var(--q-sheet); border-radius:var(--q-r-lg); padding:18px;
  box-shadow:var(--q-sh-1); min-width:0;
}
.q-card-dark {
  background:var(--q-dark); color:var(--q-on-dark);
  border-radius:var(--q-r-lg); padding:18px; min-width:0;
}
.q-card-lime {
  background:var(--q-lime); color:var(--q-on-pastel);
  border-radius:var(--q-r-lg); padding:18px; min-width:0;
}
.q-card-lav {
  background:var(--q-lav); color:var(--q-on-pastel);
  border-radius:var(--q-r-lg); padding:18px; min-width:0;
}
.q-card-lime .q-label, .q-card-lime .q-micro, .q-card-lime .q-eyebrow,
.q-card-lav .q-label, .q-card-lav .q-micro, .q-card-lav .q-eyebrow {
  color:rgba(20,22,26,0.62);
}
/* la trattativa che ha aperto la scheda cliente: una striscia, non una
   scheda-decisione — il colore lo porta solo il filo a sinistra (lo stato
   della trattativa) e la pillola StageChip, non uno sfondo pieno */
.q-panel-focus {
  display:flex; align-items:center; gap:12px; margin-bottom:16px;
  padding:11px 13px; border-radius:var(--q-r-sm); background:var(--q-sheet-2);
}
.q-panel-focus-bar { width:3px; align-self:stretch; border-radius:2px; flex-shrink:0; }
.q-sheet { background:var(--q-sheet); border-radius:var(--q-r-xl); padding:18px; box-shadow:var(--q-sh-1); min-width:0; }

.q-grid { display:grid; gap:10px; }
.q-grid-4 { grid-template-columns:repeat(4,minmax(0,1fr)); }
.q-grid-3 { grid-template-columns:repeat(3,minmax(0,1fr)); }
.q-grid-2 { grid-template-columns:repeat(2,minmax(0,1fr)); }

/* ══════════════════════════════════════════════════════════════════════════
   CONTROLLI
══════════════════════════════════════════════════════════════════════════ */
.q-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  height:38px; padding:0 17px; border-radius:var(--q-r-pill);
  font-size:13.5px; font-weight:600; white-space:nowrap;
  transition:background 160ms var(--q-e), color 160ms var(--q-e), transform 140ms var(--q-e);
}
.q-btn:active:not(:disabled) { transform:scale(0.98); }
.q-btn-sm { height:32px; padding:0 13px; font-size:12.5px; }
.q-btn-lime { background:var(--q-lime); color:var(--q-on-pastel); }
.q-btn-lime:hover:not(:disabled) { background:#C3EE33; }
.q-btn-ink { background:var(--q-ink); color:#FFFFFF; }
.q-btn-ink:hover:not(:disabled) { background:#000000; }
.q-btn-light { background:var(--q-sheet-2); color:var(--q-ink); }
.q-btn-light:hover:not(:disabled) { background:var(--q-sheet-3); }
.q-btn-ghost { background:transparent; color:var(--q-on-dark-muted); box-shadow:inset 0 0 0 1px var(--q-line-dark-2); }
.q-btn-ghost:hover:not(:disabled) { color:var(--q-on-dark); background:var(--q-dark-2); }
.q-btn:disabled { opacity:0.45; cursor:not-allowed; }

.q-icon-btn {
  width:34px; height:34px; border-radius:var(--q-r-pill); flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  background:var(--q-sheet-2); color:var(--q-ink-muted);
  transition:background 160ms var(--q-e), color 160ms var(--q-e);
}
.q-icon-btn:hover { background:var(--q-sheet-3); color:var(--q-ink); }

/* i cerchi di contatto del riferimento: lime, azione diretta */
.q-round {
  width:38px; height:38px; border-radius:var(--q-r-pill); flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  background:var(--q-lime); color:var(--q-on-pastel);
  transition:transform 160ms var(--q-e), background 160ms var(--q-e);
}
.q-round:hover { background:#C3EE33; transform:translateY(-1px); }
.q-round-quiet { background:var(--q-sheet-2); color:var(--q-ink-muted); }
.q-round-quiet:hover { background:var(--q-sheet-3); color:var(--q-ink); }

.q-seg {
  display:inline-flex; align-items:center; gap:2px; padding:3px;
  background:var(--q-sheet-2); border-radius:var(--q-r-pill);
}
.q-seg button {
  height:28px; padding:0 13px; border-radius:var(--q-r-pill); white-space:nowrap;
  font-size:12.5px; font-weight:500; color:var(--q-ink-faint);
  transition:background 160ms var(--q-e), color 160ms var(--q-e);
}
.q-seg button:hover { color:var(--q-ink); }
.q-seg button[aria-pressed="true"] { background:var(--q-ink); color:#FFFFFF; font-weight:600; }

.q-input, .q-select {
  height:38px; padding:0 13px; background:var(--q-sheet-2);
  border:0; border-radius:var(--q-r-sm); color:var(--q-ink); width:100%;
}
.q-input::placeholder { color:var(--q-ink-faint); }
.q-select {
  cursor:pointer; padding-right:32px; appearance:none; -webkit-appearance:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M3 4.5L6 7.5L9 4.5' stroke='%236A727C' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  background-repeat:no-repeat; background-position:right 11px center;
}
textarea.q-input { height:auto; padding:11px 13px; resize:vertical; line-height:1.55; }

/* ── pillole ───────────────────────────────────────────────────────────── */
.q-chip {
  display:inline-flex; align-items:center; gap:6px;
  height:26px; padding:0 11px; border-radius:var(--q-r-pill);
  font-size:11.5px; font-weight:600; white-space:nowrap;
  background:var(--q-sheet-2); color:var(--q-ink-muted);
}
.q-chip-dot::before {
  content:''; width:6px; height:6px; border-radius:50%; background:currentColor; flex-shrink:0;
}
.q-chip-hot  { background:var(--q-hot); color:#FFFFFF; }
.q-chip-lime { background:var(--q-lime); color:var(--q-on-pastel); }
.q-chip-lav  { background:var(--q-lav); color:var(--q-on-pastel); }
.q-chip-ok   { background:var(--q-ok-wash);   color:var(--q-ok); }
.q-chip-warn { background:var(--q-warn-wash); color:var(--q-warn); }
.q-chip-bad  { background:var(--q-bad-wash);  color:var(--q-bad); }

.q-prio { width:3px; border-radius:2px; flex-shrink:0; align-self:stretch; }

.q-avatar {
  width:28px; height:28px; border-radius:var(--q-r-pill); flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  font-size:10.5px; font-weight:700; letter-spacing:-0.01em;
  color:var(--q-on-pastel);
}
.q-avatar-lg { width:44px; height:44px; font-size:14px; }
.q-avatar-xl { width:84px; height:84px; font-size:26px; font-weight:800; }

/* ══════════════════════════════════════════════════════════════════════════
   POSTAZIONE DI LAVORO — nero a sinistra, bianco al centro, pastello a destra
══════════════════════════════════════════════════════════════════════════ */
.q-ws {
  display:grid; grid-template-columns:296px minmax(0,1fr) 268px;
  gap:10px; align-items:start; min-height:0;
}
.q-ws-left {
  background:var(--q-dark); border-radius:var(--q-r-xl); padding:14px;
  color:var(--q-on-dark); display:flex; flex-direction:column; gap:12px;
  min-width:0;
}
.q-ws-mid {
  background:var(--q-sheet); border-radius:var(--q-r-xl);
  display:flex; flex-direction:column; min-width:0; overflow:hidden;
  box-shadow:var(--q-sh-1);
}
.q-ws-right { display:flex; flex-direction:column; gap:10px; min-width:0; }

/* i quattro riquadrini in cima al pannello nero */
.q-mini {
  background:var(--q-dark-2); border-radius:var(--q-r); padding:11px 12px 12px;
  min-width:0;
}
.q-mini-top { display:flex; align-items:center; gap:7px; margin-bottom:8px; }
.q-mini-dot { width:9px; height:9px; border-radius:3px; flex-shrink:0; }
.q-mini-label {
  font-size:10.5px; color:var(--q-on-dark-muted); font-weight:500;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.q-mini-n { font-size:23px; font-weight:700; letter-spacing:-0.035em; line-height:1; }

/* ── gli attrezzi in cima all'elenco: cerca, filtro, nuovo ─────────────── */
.q-wl-tools { display:flex; flex-direction:column; gap:9px; }
.q-wl-find { position:relative; display:flex; align-items:center; }
.q-wl-find > svg { position:absolute; left:11px; color:var(--q-on-dark-faint); pointer-events:none; }
.q-wl-find input {
  width:100%; height:36px; padding:0 32px 0 33px; border:0; border-radius:var(--q-r-sm);
  background:var(--q-dark-2); color:var(--q-on-dark); font-size:12.5px;
}
.q-wl-find input::placeholder { color:var(--q-on-dark-faint); }
.q-wl-find button {
  position:absolute; right:5px; width:24px; height:24px; border-radius:var(--q-r-pill);
  display:inline-flex; align-items:center; justify-content:center;
  color:var(--q-on-dark-faint); font-size:12px;
}
.q-wl-find button:hover { background:var(--q-dark-3); color:var(--q-on-dark); }

/* lo stesso segmento del tema chiaro, ribaltato sul nero */
.q-seg-dark { background:var(--q-dark-2); }
.q-seg-dark button { color:var(--q-on-dark-faint); }
.q-seg-dark button:hover { color:var(--q-on-dark); }
.q-seg-dark button[aria-pressed="true"] { background:var(--q-lime); color:var(--q-on-pastel); }

.q-wl-new {
  display:flex; align-items:center; justify-content:center; gap:8px; width:100%;
  height:38px; border-radius:var(--q-r-sm); flex-shrink:0;
  background:var(--q-lime); color:var(--q-on-pastel);
  font-size:13px; font-weight:600;
  transition:background 160ms var(--q-e), transform 140ms var(--q-e);
}
.q-wl-new:hover { background:#C3EE33; }
.q-wl-new:active { transform:scale(0.985); }

/* elenco di lavoro dentro il pannello nero: schede bianche, quella scelta lime */
.q-wl { display:flex; flex-direction:column; gap:7px; overflow-y:auto; overscroll-behavior:contain; }
/* una scheda archiviata è ancora leggibile, ma non compete con le attive */
.q-wl-item.is-arch { background:var(--q-dark-2); color:var(--q-on-dark); }
.q-wl-item.is-arch .q-wl-sub, .q-wl-item.is-arch .q-micro { color:var(--q-on-dark-faint); }
.q-wl-item.is-arch .q-wl-foot { border-top-color:var(--q-line-dark-2); }
.q-wl-item.is-arch[aria-current="true"] {
  background:var(--q-dark-3); box-shadow:inset 0 0 0 1.5px var(--q-lime);
}
.q-wl-empty {
  padding:22px 12px; text-align:center; font-size:12px; line-height:1.5;
  color:var(--q-on-dark-faint); background:var(--q-dark-2); border-radius:var(--q-r);
}
.q-wl-item {
  display:flex; gap:10px; width:100%; text-align:left; align-items:flex-start;
  background:var(--q-sheet); color:var(--q-ink);
  border-radius:var(--q-r); padding:11px 12px;
  transition:transform 160ms var(--q-e), background 160ms var(--q-e);
}
.q-wl-item:hover { transform:translateY(-1px); }
.q-wl-item[aria-current="true"] { background:var(--q-lime); }
.q-wl-sub {
  font-size:10.5px; color:var(--q-ink-faint);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.q-wl-item[aria-current="true"] .q-wl-sub { color:rgba(20,22,26,0.60); }
/* la riga in fondo alla scheda: stato + pillola di priorità */
.q-wl-foot {
  display:flex; align-items:center; gap:7px; margin-top:9px;
  padding-top:9px; border-top:1px solid var(--q-line-soft);
}
.q-wl-item[aria-current="true"] .q-wl-foot { border-top-color:rgba(20,22,26,0.14); }

/* ── testata del dettaglio ─────────────────────────────────────────────── */
.q-detail-head { padding:20px 22px 0; flex-shrink:0; }
.q-detail-owner { display:flex; align-items:center; gap:9px; flex-shrink:0; margin-left:auto; }
.q-detail-body { flex:1; min-height:0; overflow-y:auto; overflow-x:auto; overscroll-behavior:contain; padding:16px 22px 20px; }
.q-tabs { display:flex; gap:2px; margin-top:16px; border-bottom:1px solid var(--q-line-soft); }
.q-tab {
  height:36px; padding:0 13px; border-radius:var(--q-r-pill) var(--q-r-pill) 0 0;
  font-size:13px; font-weight:500; color:var(--q-ink-faint); position:relative;
  transition:color 160ms var(--q-e);
}
.q-tab:hover { color:var(--q-ink); }
.q-tab[aria-selected="true"] { color:var(--q-ink); font-weight:600; }
.q-tab[aria-selected="true"]::after {
  content:''; position:absolute; left:10px; right:10px; bottom:-1px;
  height:2px; border-radius:2px; background:var(--q-ink);
}

/* ── liste con spunta, dentro le schede pastello ───────────────────────── */
.q-check { display:flex; align-items:flex-start; gap:9px; padding:6px 0; font-size:12.5px; }
.q-check-box {
  width:16px; height:16px; border-radius:5px; flex-shrink:0; margin-top:1px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(20,22,26,0.10); color:var(--q-on-pastel);
}
.q-check.is-on .q-check-box { background:var(--q-on-pastel); color:var(--q-lime); }
.q-check.is-off { color:rgba(20,22,26,0.52); }

/* ══════════════════════════════════════════════════════════════════════════
   BOARD KANBAN
══════════════════════════════════════════════════════════════════════════ */
.q-board {
  display:flex; gap:10px; align-items:flex-start;
  overflow-x:auto; overscroll-behavior-x:contain; padding-bottom:6px;
}
.q-col {
  flex:1 1 0; min-width:232px;
  background:var(--q-sheet); border-radius:var(--q-r-lg);
  display:flex; flex-direction:column; box-shadow:var(--q-sh-1);
  transition:background 160ms var(--q-e), box-shadow 160ms var(--q-e);
}
.q-col.is-over { background:var(--q-lime-2); box-shadow:0 0 0 2px var(--q-lime); }
.q-col-head {
  padding:13px 14px 11px; display:flex; align-items:center; gap:8px;
}
.q-col-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.q-col-count {
  margin-left:auto; font-size:11px; font-weight:700; color:var(--q-ink-faint);
  background:var(--q-sheet-2); border-radius:var(--q-r-pill); padding:2px 8px;
}
.q-col-body { padding:0 10px; display:flex; flex-direction:column; gap:7px; min-height:110px; }
.q-col-foot {
  padding:12px 14px; margin-top:auto; font-size:11px; color:var(--q-ink-faint);
  font-variant-numeric:tabular-nums;
}

.q-deal {
  position:relative; display:flex; gap:10px; width:100%; text-align:left;
  background:var(--q-sheet-2); border-radius:var(--q-r); padding:11px 12px;
  /* pan-y e non none: col dito si continua a scorrere la pagina partendo da
     una card, mentre il movimento ORIZZONTALE — l'unico che serve a cambiare
     colonna — resta nostro. Con touch-action:none la pagina non scorreva più
     appoggiando il dito su una scheda, che è quasi sempre. */
  cursor:grab; touch-action:pan-y;
  transition:box-shadow 160ms var(--q-e), background 160ms var(--q-e);
}
.q-deal:hover { background:var(--q-sheet-3); }
.q-deal:active { cursor:grabbing; }
.q-deal.is-ghost { opacity:0.32; }
.q-deal-drag {
  position:fixed; z-index:60; pointer-events:none; background:var(--q-sheet);
  box-shadow:var(--q-sh-drag); transform:rotate(1.5deg) scale(1.02); cursor:grabbing;
}
.q-deal-title {
  font-size:13px; font-weight:600; letter-spacing:-0.014em; line-height:1.3;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.q-deal-foot { display:flex; align-items:center; gap:8px; margin-top:9px; }
.q-deal-value { font-size:13.5px; font-weight:700; font-variant-numeric:tabular-nums; letter-spacing:-0.02em; }

@keyframes q-pulse { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
.q-flag { width:6px; height:6px; border-radius:50%; flex-shrink:0; background:var(--q-hot); animation:q-pulse 1.8s var(--q-e) infinite; }

/* ══════════════════════════════════════════════════════════════════════════
   PANNELLO LATERALE (dal board)
══════════════════════════════════════════════════════════════════════════ */
.q-scrim {
  position:absolute; inset:0; z-index:30; background:rgba(10,12,15,0.42);
  backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
}
.q-slide {
  position:absolute; top:10px; right:10px; bottom:10px; width:min(600px,94%); z-index:31;
  background:var(--q-sheet); color:var(--q-ink); border-radius:var(--q-r-xl);
  box-shadow:var(--q-sh-pop); display:flex; flex-direction:column; overflow:hidden;
}
/* .q-slide-head/.q-slide-body non avevano MAI avuto una regola qui: il
   contenuto (avatar, titolo, tab, cronologia) toccava i bordi del pannello
   a filo, e l'avatar in alto a sinistra veniva tagliato dalla maschera del
   border-radius del pannello — non un effetto voluto, semplicemente non
   c'era mai stato un padding. Stessi valori di .q-detail-head/.q-detail-body
   nella postazione «Clienti», per coerenza fra i due pannelli. */
.q-slide-head { padding:20px 22px 0; flex-shrink:0; }
.q-slide-body { flex:1; min-height:0; overflow-y:auto; overflow-x:auto; overscroll-behavior:contain; padding:16px 22px 20px; }

/* ── cronologia ────────────────────────────────────────────────────────── */
.q-timeline { position:relative; padding-left:30px; }
.q-timeline::before {
  content:''; position:absolute; left:12px; top:12px; bottom:12px;
  width:1px; background:var(--q-line);
}
.q-ev { position:relative; padding:0 0 18px; }
.q-ev-dot {
  position:absolute; left:-30px; top:0;
  width:25px; height:25px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:var(--q-sheet-2); color:var(--q-ink-muted);
}
/* un appuntamento futuro non è cronologia: è un impegno, e si vede */
.q-ev.is-future .q-ev-dot { background:var(--q-lime); color:var(--q-on-pastel); }
.q-ev-when { font-size:11px; color:var(--q-ink-faint); font-variant-numeric:tabular-nums; }
.q-ev-body {
  margin-top:7px; padding:11px 13px; border-radius:var(--q-r);
  background:var(--q-sheet-2); font-size:12.5px; line-height:1.6; color:var(--q-ink-muted);
}
.q-file {
  display:inline-flex; align-items:center; gap:8px; margin-top:7px;
  padding:8px 12px; border-radius:var(--q-r-sm); background:var(--q-sheet-2);
  font-size:12px; color:var(--q-ink-muted);
}

.q-kv { display:flex; justify-content:space-between; gap:16px; padding:9px 0; border-top:1px solid var(--q-line-soft); }
.q-kv:first-child { border-top:0; }
.q-kv dt { font-size:12.5px; color:var(--q-ink-faint); flex-shrink:0; }
.q-kv dd { font-size:12.5px; margin:0; text-align:right; min-width:0; word-break:break-word; font-weight:500; }

/* ══════════════════════════════════════════════════════════════════════════
   TABELLE
══════════════════════════════════════════════════════════════════════════ */
.q-table th {
  text-align:left; font-size:10.5px; font-weight:600; color:var(--q-ink-faint);
  letter-spacing:0.06em; text-transform:uppercase;
  padding:0 12px; height:34px; white-space:nowrap;
}
.q-table td { padding:0 12px; height:54px; font-size:13.5px; vertical-align:middle; border-top:1px solid var(--q-line-soft); }
.q-table tbody tr.q-clickable { cursor:pointer; transition:background 140ms var(--q-e); }
.q-table tbody tr.q-clickable:hover { background:var(--q-sheet-2); }
.q-table td.q-ell { max-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.q-td-num { text-align:right; font-variant-numeric:tabular-nums; font-weight:600; white-space:nowrap; }

/* ══════════════════════════════════════════════════════════════════════════
   PALETTA E MENU
══════════════════════════════════════════════════════════════════════════ */
.q-palette-scrim {
  position:absolute; inset:0; z-index:50; background:rgba(10,12,15,0.44);
  backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
  display:flex; align-items:flex-start; justify-content:center; padding:11vh 20px 20px;
}
.q-palette {
  width:100%; max-width:620px; background:var(--q-sheet); color:var(--q-ink);
  border-radius:var(--q-r-xl); box-shadow:var(--q-sh-pop);
  overflow:hidden; display:flex; flex-direction:column; max-height:min(74vh,560px);
}
.q-palette-input {
  width:100%; height:56px; padding:0 22px; border:0; background:transparent;
  font-size:15.5px; color:var(--q-ink); border-bottom:1px solid var(--q-line-soft);
}
.q-palette-input::placeholder { color:var(--q-ink-faint); }
.q-palette-list { flex:1; overflow-y:auto; overscroll-behavior:contain; padding:6px; }
.q-palette-group { font-size:10.5px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--q-ink-faint); padding:10px 14px 5px; }
.q-palette-item {
  display:flex; align-items:center; gap:11px; width:100%; padding:10px 14px;
  border-radius:var(--q-r-sm); text-align:left; font-size:13.5px; color:var(--q-ink);
}
.q-palette-item[aria-selected="true"] { background:var(--q-sheet-2); }
.q-palette-meta { margin-left:auto; font-size:11.5px; color:var(--q-ink-faint); flex-shrink:0; }

/* Il «fuori» di un menu aperto. È trasparente e non fa niente se non
   raccogliere il clic che lo chiude: senza, quel clic chiude il menu E
   arriva a quello che sta sotto — si voleva solo chiudere e si è aperta
   una scheda. */
.q-shade { position:fixed; inset:0; z-index:39; }
.q-pop {
  position:absolute; top:calc(100% + 8px); right:0; z-index:40;
  background:var(--q-sheet); color:var(--q-ink); border-radius:var(--q-r-lg);
  box-shadow:var(--q-sh-pop); min-width:230px; max-width:min(340px,92vw); overflow:hidden;
}
.q-pop-head { padding:13px 15px 10px; border-bottom:1px solid var(--q-line-soft); }
.q-pop-body { max-height:min(400px,54vh); overflow-y:auto; overscroll-behavior:contain; }
.q-pop-item {
  display:flex; align-items:center; gap:10px; width:100%; padding:10px 15px;
  text-align:left; font-size:13px; color:var(--q-ink);
  transition:background 140ms var(--q-e);
}
.q-pop-item:hover { background:var(--q-sheet-2); }
/* la riga che stacca l'azione distruttiva dalle altre: un menu dove
   «Archivia» ed «Elimina» sono adiacenti e identici è un menu che prima o
   poi cancella la cosa sbagliata */
.q-pop-rule { height:1px; margin:5px 0; background:var(--q-line-soft); }

/* ── la fascia del cliente archiviato ──────────────────────────────────── */
.q-note-arch {
  display:flex; align-items:center; gap:12px; flex-wrap:wrap;
  margin-top:16px; padding:12px 14px; border-radius:var(--q-r);
  background:var(--q-warn-wash); color:var(--q-warn);
  font-size:12px; line-height:1.5;
}
.q-note-arch > span { flex:1 1 220px; min-width:0; }
.q-note-arch > svg { flex-shrink:0; }

/* ══════════════════════════════════════════════════════════════════════════
   FINESTRE — creare un cliente, confermare una cancellazione
══════════════════════════════════════════════════════════════════════════ */
.q-modal-scrim {
  position:absolute; inset:0; z-index:70; background:rgba(10,12,15,0.50);
  backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center; padding:20px;
}
.q-modal {
  width:100%; background:var(--q-sheet); color:var(--q-ink);
  border-radius:var(--q-r-xl); box-shadow:var(--q-sh-pop);
  display:flex; flex-direction:column; max-height:min(88vh,720px); overflow:hidden;
}
.q-modal > form { display:flex; flex-direction:column; min-height:0; }
.q-modal-head {
  display:flex; align-items:flex-start; gap:13px; flex-shrink:0;
  padding:20px 22px 16px; border-bottom:1px solid var(--q-line-soft);
}
.q-modal-body { flex:1; min-height:0; overflow-y:auto; overscroll-behavior:contain; padding:6px 22px 18px; }
.q-modal-foot {
  display:flex; align-items:center; justify-content:flex-end; gap:9px;
  flex-shrink:0; flex-wrap:wrap;
  padding:14px 22px; border-top:1px solid var(--q-line-soft); background:var(--q-sheet-2);
}
/* qui il fondo È già --q-sheet-2: un pulsante chiaro sopra un fondo chiaro
   identico è un pulsante che si vede solo passandoci sopra */
.q-modal-foot .q-btn-light {
  background:var(--q-sheet); box-shadow:inset 0 0 0 1px var(--q-line);
}
.q-modal-foot .q-btn-light:hover:not(:disabled) { background:var(--q-sheet-3); }

/* ── campi ─────────────────────────────────────────────────────────────── */
.q-form-legend { display:block; margin:18px 0 9px; }
.q-modal-body > .q-form-legend:first-child { margin-top:12px; }
.q-form-row { display:flex; gap:11px; flex-wrap:wrap; }
.q-field { min-width:0; }
.q-field-label {
  display:block; font-size:11.5px; font-weight:500; color:var(--q-ink-muted); margin-bottom:5px;
}
.q-req { color:var(--q-hot); font-weight:700; }
.q-field-note {
  font-size:10.5px; line-height:1.35; color:var(--q-ink-faint);
  /* l'altezza è riservata sempre: senza, la comparsa di un errore sposta
     in basso tutto il modulo e il campo dopo scappa da sotto il puntatore */
  min-height:24px; padding:4px 2px 0;
}
.q-field-note.is-error { color:var(--q-bad); font-weight:500; }
.q-field.has-error .q-input, .q-field.has-error .q-select {
  box-shadow:inset 0 0 0 1.5px var(--q-bad); background:var(--q-bad-wash);
}
.q-sr {
  position:absolute; width:1px; height:1px; overflow:hidden;
  clip:rect(0 0 0 0); clip-path:inset(50%); white-space:nowrap;
}

/* ── elenco delle conseguenze, nella conferma ──────────────────────────── */
.q-conseq { margin:14px 0 0; padding:13px 15px; list-style:none; border-radius:var(--q-r); background:var(--q-sheet-2); }
.q-conseq li { display:flex; align-items:baseline; gap:10px; font-size:12.5px; color:var(--q-ink); padding:4px 0; }
.q-conseq-dot { width:5px; height:5px; border-radius:50%; background:var(--q-ink-faint); flex-shrink:0; }

.q-btn-bad { background:var(--q-bad); color:#FFFFFF; }
.q-btn-bad:hover:not(:disabled) { background:#8E211C; }
.q-round-bad { background:var(--q-bad-wash); color:var(--q-bad); }

/* ══════════════════════════════════════════════════════════════════════════
   AVVISI EFFIMERI

   Ogni azione che toglie qualcosa dallo schermo lascia qui la sua scia, con
   il modo di tornare indietro. È il motivo per cui archiviare e cancellare
   non hanno bisogno di chiedere «sei sicuro?» due volte: si disfa.
══════════════════════════════════════════════════════════════════════════ */
.q-toasts {
  position:absolute; left:50%; bottom:18px; transform:translateX(-50%);
  z-index:66; display:flex; flex-direction:column; gap:8px;
  align-items:center; pointer-events:none; max-width:min(520px,calc(100% - 32px));
}
.q-toast {
  pointer-events:auto; display:flex; align-items:center; gap:14px;
  padding:11px 12px 11px 17px; border-radius:var(--q-r-pill);
  background:var(--q-dark); color:var(--q-on-dark); box-shadow:var(--q-sh-pop);
  font-size:13px; max-width:100%;
}
.q-toast-text { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.q-toast-undo {
  flex-shrink:0; height:30px; padding:0 14px; border-radius:var(--q-r-pill);
  background:var(--q-lime); color:var(--q-on-pastel);
  font-size:12.5px; font-weight:600; transition:background 160ms var(--q-e);
}
.q-toast-undo:hover { background:#C3EE33; }
.q-toast-x {
  flex-shrink:0; width:30px; height:30px; border-radius:var(--q-r-pill);
  display:inline-flex; align-items:center; justify-content:center;
  color:var(--q-on-dark-faint); font-size:13px;
}
.q-toast-x:hover { background:var(--q-dark-3); color:var(--q-on-dark); }

/* ══════════════════════════════════════════════════════════════════════════
   GRAFICI
══════════════════════════════════════════════════════════════════════════ */
.q-bar-track { height:7px; border-radius:999px; background:var(--q-sheet-3); overflow:hidden; }
.q-bar-track > span { display:block; height:100%; border-radius:999px; transition:width 420ms var(--q-e); }
.q-card-dark .q-bar-track { background:var(--q-dark-3); }

.q-legend { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.q-legend span { display:inline-flex; align-items:center; gap:6px; font-size:11.5px; color:var(--q-ink-faint); }
.q-legend i { width:9px; height:9px; border-radius:3px; display:inline-block; }

.q-tabbar { display:none; }

/* ══════════════════════════════════════════════════════════════════════════
   ADATTAMENTI
══════════════════════════════════════════════════════════════════════════ */
@media (max-width: 1280px) {
  /* le schede pastello scendono sotto: sono un corredo, non la sostanza */
  .q-ws { grid-template-columns:274px minmax(0,1fr); }
  .q-ws-right { grid-column:1 / -1; flex-direction:row; }
  .q-ws-right > * { flex:1; }
}
@media (max-width: 1180px) {
  .q-grid-4, .q-grid-3 { grid-template-columns:repeat(2,minmax(0,1fr)); }
}

@media (max-width: 980px) {
  .q-ws { grid-template-columns:minmax(0,1fr); }
  .q-ws-left { max-height:none; }
  .q-ws-right { flex-direction:column; }
}

@media (max-width: 900px) {
  .q-app { padding:8px; gap:8px; }
  .q-rail { display:none; }
  .q-topbar .q-menu-btn { display:inline-flex; }
  .q-search { min-width:0; width:38px; padding:0; justify-content:center; background:var(--q-sheet-2); }
  .q-search-label, .q-kbd { display:none; }
  .q-me { padding:0; width:38px; height:38px; justify-content:center; }
  .q-me-text, .q-me-caret { display:none; }

  .q-tabbar {
    flex-shrink:0; height:58px; display:flex; z-index:22;
    background:var(--q-dark); border-radius:var(--q-r-xl);
    padding-bottom:env(safe-area-inset-bottom);
  }
  .q-tabbar button {
    flex:1; min-width:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:4px;
    font-size:10px; font-weight:500; color:var(--q-on-dark-faint);
  }
  .q-tabbar button > span { max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .q-tabbar button[aria-current="page"] { color:var(--q-lime); }

  .q-nav-scrim { position:absolute; inset:0; z-index:44; background:rgba(10,12,15,0.48); }
  .q-nav-sheet {
    position:absolute; inset:8px auto 8px 8px; z-index:45; width:min(272px,84%);
    background:var(--q-dark); color:var(--q-on-dark); border-radius:var(--q-r-xl);
    box-shadow:var(--q-sh-pop); display:flex; flex-direction:column;
    padding:16px 12px 12px; overflow-y:auto; overscroll-behavior:contain;
  }
  .q-nav-link {
    display:flex; align-items:center; gap:11px; width:100%; height:42px;
    padding:0 12px; border-radius:var(--q-r); text-align:left;
    font-size:13.5px; font-weight:500; color:var(--q-on-dark-muted);
  }
  .q-nav-link:hover { background:var(--q-dark-2); color:var(--q-on-dark); }
  .q-nav-link[aria-current="page"] { background:var(--q-lime); color:var(--q-on-pastel); }

  /* l'avviso non deve finire sotto la barra delle schede del telefono:
     un «Annulla» coperto è un «Annulla» che non esiste */
  .q-toasts { bottom:78px; }
  .q-modal-scrim { align-items:flex-end; padding:12px; }
  .q-modal { max-height:88vh; }
}

@media (max-width: 760px) {
  .q-topbar { height:56px; padding:0 12px 0 14px; gap:8px; border-radius:var(--q-r-lg); }
  .q-grid-4, .q-grid-3, .q-grid-2 { grid-template-columns:minmax(0,1fr); }
  /* eccezione: i quattro contatori del pannello nero restano 2x2 anche sul
     telefono. Sono numeri di una cifra — impilarli costa mezzo schermo di
     scorrimento prima di arrivare all'elenco, che è la ragione per cui si
     è aperta questa schermata */
  .q-ws-left .q-grid-2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .q-mini-n { font-size:20px; }
  .q-display { font-size:24px; }
  .q-figure-lg { font-size:28px; }
  .q-slide { inset:auto 0 0 0; width:100%; height:92%; border-radius:var(--q-r-xl) var(--q-r-xl) 0 0; }
  /* le colonne non si schiacciano: il board scorre di lato, come su Trello */
  .q-col { min-width:78vw; }
  .q-table { min-width:560px; }
  .q-avatar-xl { width:64px; height:64px; font-size:20px; }
}

@media (prefers-reduced-motion: reduce) {
  .q-root *, .q-root *::before, .q-root *::after {
    animation-duration:0.01ms !important; animation-iteration-count:1 !important;
    transition-duration:0.01ms !important;
  }
}
`
