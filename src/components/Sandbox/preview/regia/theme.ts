/* ══════════════════════════════════════════════════════════════════════════
   REGIA — il vestito: sala di regia dietro vetro smerigliato.

   Il sistema di token è preciso e le sue regole non si negoziano:

   · i titoli sussurrano — Inter peso 400 anche a 52–64px, MAI 600+;
     l'autorità viene dalla dimensione, non dal volume;
   · l'azione primaria è una pillola color osso (#f2f2f2, testo #333):
     nessun colore cromatico sui pulsanti, mai;
   · il blu #3b82f6 è l'unico accento di marca: stati attivi, link,
     icone. Mai come fondo, mai come riempimento largo;
   · verde e rosso sono SEGNALI (successo/errore), non decorazione;
   · i bordi sono capelli da 0.5px — mai 1px pieno; il rilievo nasce da
     un filo di luce inset in alto, non da ombre portate;
   · superfici a tre piani: tela #0b0c0e → scheda #131416 → velo
     rgba(255,255,255,0.05) al passaggio del mouse;
   · Inter con ss01 e ss03 accesi: le alternative geometriche fanno
     parte dell'identità.

   Nota tecnica: CSS dentro un template literal — niente apici inversi
   nei commenti, hanno già rotto la build due volte.
══════════════════════════════════════════════════════════════════════════ */

export const RG_FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
export const RG_MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export const REGIA_CSS = `
  .rg-root {
    --tela: #0b0c0e;
    --grafite: #131416;
    --carbone: #1f1f21;
    --fumo: #3c3d3e;
    --acciaio: #71717a;
    --nebbia: #858687;
    --cenere: #9d9e9f;
    --gesso: #cececf;
    --neve: #ffffff;
    --osso: #f2f2f2;
    --china: #333333;
    --blu: #3b82f6;
    --blu-arco: #60a5fa;
    --blu-anello: #93c5fd;
    --menta: #4ade80;
    --felce: #22c55e;
    --corallo: #f87171;
    --ambra: #ea580c;

    --capello: rgba(255, 255, 255, 0.07);
    --capello-forte: rgba(255, 255, 255, 0.12);
    --velo: rgba(255, 255, 255, 0.05);

    /* rilievo: filo di luce sopra + capello intorno + ombra fredda sotto */
    --ril-scheda: inset 0 1px 0 rgba(255, 255, 255, 0.08),
                  0 0 0 0.5px rgba(255, 255, 255, 0.07),
                  0 20px 44px rgba(0, 0, 0, 0.14),
                  0 4px 10px rgba(0, 0, 0, 0.08);
    --ril-pannello: inset 0 1px 0 rgba(255, 255, 255, 0.09),
                    0 0 0 0.5px rgba(255, 255, 255, 0.07),
                    0 16px 36px rgba(0, 0, 0, 0.12);

    background: var(--tela);
    color: var(--neve);
    font-family: ${RG_FONT};
    font-size: 15px; line-height: 1.5; letter-spacing: -0.015em;
    font-feature-settings: "ss01" on, "ss03" on;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  .rg-root *, .rg-root *::before, .rg-root *::after { box-sizing: border-box; }
  .rg-root button { font-family: inherit; }
  .rg-root ::selection { background: rgba(59, 130, 246, 0.35); color: #fff; }
  .rg-root svg { display: block; }

  .rg-contenitore { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
  .rg-sezione { padding: 96px 0; }
  @media (max-width: 800px) { .rg-sezione { padding: 64px 0; } }

  /* ══ TIPOGRAFIA — il sussurro ══ */
  .rg-occhiello {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: ${RG_MONO}; font-size: 11px; font-weight: 400;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--acciaio);
  }
  .rg-occhiello::before { content: ""; width: 5px; height: 5px; border-radius: 999px; background: var(--blu); }
  .rg-display {
    font-size: 52px; font-weight: 400; line-height: 1.02; letter-spacing: -1.3px;
    color: var(--neve); margin: 16px 0 0; text-wrap: balance;
  }
  .rg-titolo {
    font-size: 32px; font-weight: 400; line-height: 1.25; letter-spacing: -0.64px;
    color: var(--neve); margin: 14px 0 0; text-wrap: balance;
  }
  .rg-sotto {
    font-size: 16px; font-weight: 400; line-height: 1.55; letter-spacing: -0.2px;
    color: var(--nebbia); margin: 14px 0 0; max-width: 56ch;
  }
  @media (max-width: 700px) { .rg-display { font-size: 38px; } .rg-titolo { font-size: 26px; } }

  /* ══ PULSANTI ══ */
  .rg-osso {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--osso); color: var(--china);
    border: none; border-radius: 10px; padding: 9px 20px; cursor: pointer;
    font-size: 14px; font-weight: 400; letter-spacing: -0.023em;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1);
    transition: transform 0.15s ease, filter 0.2s ease;
  }
  .rg-osso:hover { filter: brightness(1.05); }
  .rg-osso:active { transform: scale(0.985); }
  .rg-osso:disabled { opacity: 0.55; cursor: default; }
  .rg-spettro {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--velo); color: var(--neve);
    border: none; border-radius: 10px; padding: 9px 16px; cursor: pointer;
    font-size: 14px; font-weight: 400; letter-spacing: -0.023em;
    transition: background 0.18s ease;
  }
  .rg-spettro:hover { background: rgba(255, 255, 255, 0.09); }
  a.rg-osso, a.rg-spettro { text-decoration: none; }

  /* ══ STRISCIA ANNUNCI + NAVIGAZIONE ══ */
  .rg-annuncio {
    text-align: center; padding: 9px 16px;
    font-size: 13px; letter-spacing: -0.026em; color: var(--cenere);
    box-shadow: inset 0 -0.5px 0 var(--capello);
  }
  .rg-annuncio b { color: var(--neve); font-weight: 400; }
  .rg-nav {
    position: sticky; top: 0; z-index: 40; height: 64px;
    background: rgba(11, 12, 14, 0.78);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    box-shadow: inset 0 -0.5px 0 var(--capello);
  }
  .rg-nav-int {
    max-width: 1080px; margin: 0 auto; padding: 0 24px; height: 100%;
    display: flex; align-items: center; gap: 20px;
  }
  .rg-marchio { display: inline-flex; align-items: center; gap: 8px; color: var(--neve); font-size: 15px; }
  .rg-marchio svg { color: var(--blu); }
  .rg-nav-voci { display: flex; gap: 20px; margin: 0 auto; }
  .rg-nav-voce {
    background: none; border: none; padding: 6px 0; cursor: pointer;
    font-size: 14px; font-weight: 400; letter-spacing: -0.023em;
    color: rgba(255, 255, 255, 0.65); transition: color 0.18s ease;
  }
  .rg-nav-voce:hover { color: rgba(255, 255, 255, 0.92); }
  .rg-nav-fine { display: flex; align-items: center; gap: 10px; }
  @media (max-width: 820px) { .rg-nav-voci { display: none; } }

  /* ══ APERTURA — due colonne, poi il quadro comandi ══ */
  .rg-apertura { padding: 84px 0 0; }
  .rg-apertura-griglia {
    display: grid; grid-template-columns: 3fr 2fr; gap: 48px; align-items: end;
  }
  .rg-apertura-destra { padding-bottom: 6px; }
  .rg-apertura-cta { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
  @media (max-width: 860px) { .rg-apertura-griglia { grid-template-columns: 1fr; gap: 20px; } }

  /* ══ IL QUADRO COMANDI — tre pannelli vivi ══ */
  .rg-quadro {
    margin-top: 52px;
    display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
    gap: 14px; align-items: stretch;
  }
  .rg-colonna { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  @media (max-width: 920px) { .rg-quadro { grid-template-columns: 1fr; } }

  .rg-pannello {
    background: var(--grafite); border-radius: 12px;
    box-shadow: var(--ril-pannello);
    overflow: hidden; display: flex; flex-direction: column;
  }
  .rg-pannello-testa {
    display: flex; align-items: center; gap: 10px; padding: 11px 16px;
    box-shadow: inset 0 -0.5px 0 var(--capello);
    font-size: 12px; letter-spacing: -0.015em; color: var(--cenere);
  }
  .rg-pannello-testa b { color: var(--neve); font-weight: 500; font-size: 12px; }
  .rg-vivo {
    margin-left: auto;
    display: inline-flex; align-items: center; gap: 5px;
    border: 1px solid var(--menta); border-radius: 5.26px; padding: 2px 7px;
    font-size: 9.5px; font-weight: 500; letter-spacing: 0.04em; color: var(--menta);
  }
  .rg-vivo::before { content: ""; width: 4px; height: 4px; border-radius: 999px; background: var(--menta);
    box-shadow: 0 0 4px rgba(34, 197, 94, 0.55); }

  /* KPI in testa al quadro */
  .rg-kpi-fila { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
  .rg-kpi { padding: 14px 16px; }
  .rg-kpi + .rg-kpi { box-shadow: inset 0.5px 0 0 var(--capello); }
  .rg-kpi-num { font-size: 26px; font-weight: 400; letter-spacing: -0.6px; color: var(--neve);
    font-variant-numeric: tabular-nums; }
  .rg-kpi-eti { font-size: 11px; color: var(--acciaio); letter-spacing: -0.015em; margin-top: 2px; }

  /* la tabella del flusso ordini */
  .rg-tab { width: 100%; border-collapse: collapse; font-size: 12px; letter-spacing: -0.015em; }
  .rg-tab th {
    text-align: left; padding: 8px 16px; font-size: 9.5px; font-weight: 500;
    letter-spacing: 0.05em; text-transform: uppercase; color: var(--acciaio);
    box-shadow: inset 0 -0.5px 0 var(--capello);
  }
  .rg-tab td {
    padding: 9px 16px; color: var(--gesso);
    box-shadow: inset 0 -0.5px 0 rgba(255, 255, 255, 0.05);
    white-space: nowrap;
  }
  .rg-tab td:first-child { color: var(--neve); }
  .rg-tab .num { text-align: right; font-variant-numeric: tabular-nums; }

  .rg-stato {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: 5.26px; padding: 2px 7px;
    font-size: 10px; font-weight: 500; letter-spacing: 0.02em;
    border: 1px solid transparent;
  }
  .rg-stato::before { content: ""; width: 4px; height: 4px; border-radius: 999px; background: currentColor; }
  .rg-stato[data-s="ricevuto"] { color: var(--blu-arco); border-color: rgba(96, 165, 250, 0.45); }
  .rg-stato[data-s="sincronizzato"] { color: var(--menta); border-color: rgba(74, 222, 128, 0.45); }
  .rg-stato[data-s="in consegna"] { color: var(--cenere); border-color: rgba(157, 158, 159, 0.35); }

  /* ── le eccezioni: il pannello dove si CLICCA ── */
  .rg-ecc { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
  .rg-ecc-voce {
    border-radius: 8.77px; padding: 12px 14px;
    background: var(--carbone);
    box-shadow: 0 0 0 0.5px var(--capello);
  }
  .rg-ecc-testa { display: flex; align-items: center; gap: 8px; }
  .rg-ecc-titolo { font-size: 13px; font-weight: 500; letter-spacing: -0.026em; color: var(--neve); }
  .rg-ecc-ordine { font-family: ${RG_MONO}; font-size: 10px; color: var(--acciaio); }
  .rg-ecc-dettaglio { font-size: 12px; line-height: 1.45; color: var(--nebbia); margin: 5px 0 10px; }
  .rg-ecc-punto { color: var(--corallo); }
  .rg-risolvi {
    background: var(--velo); color: var(--neve);
    border: none; border-radius: 8px; padding: 6px 12px; cursor: pointer;
    font-size: 12px; font-weight: 400; transition: background 0.18s ease;
  }
  .rg-risolvi:hover { background: rgba(255, 255, 255, 0.09); }
  .rg-rimedio { margin: 8px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 5px; }
  .rg-rimedio li {
    display: flex; gap: 7px; align-items: flex-start;
    font-family: ${RG_MONO}; font-size: 10.5px; line-height: 1.5; color: var(--gesso);
  }
  .rg-rimedio li::before { content: "›"; color: var(--blu-arco); }
  .rg-ecc-voce[data-risolta="true"] { box-shadow: 0 0 0 0.5px rgba(74, 222, 128, 0.4); }
  .rg-ecc-fatta {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 500; color: var(--menta);
  }
  .rg-ecc-vuoto { font-size: 12px; color: var(--acciaio); padding: 6px 2px; }

  /* ── il nastro dei nodi ── */
  .rg-nastro { padding: 18px 16px 20px; display: flex; align-items: stretch; gap: 0; }
  .rg-nodo {
    flex: 1; min-width: 0;
    background: var(--carbone); border-radius: 8.77px; padding: 11px 12px;
    box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.08);
    cursor: pointer; text-align: left; border: none; color: inherit;
    transition: box-shadow 0.2s ease, background 0.2s ease;
  }
  .rg-nodo:hover { background: #232427; }
  .rg-nodo[data-attivo="true"] { box-shadow: 0 0 0 1.5px rgba(59, 130, 246, 0.55), 0 0 12px rgba(59, 130, 246, 0.25); }
  .rg-nodo[data-fatto="true"] { box-shadow: 0 0 0 0.5px rgba(74, 222, 128, 0.5); }
  .rg-nodo-nome { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 500;
    letter-spacing: -0.026em; color: var(--neve); }
  .rg-nodo-nome svg { flex: none; }
  .rg-nodo[data-tinta="blu"] .rg-nodo-nome svg { color: var(--blu-arco); }
  .rg-nodo[data-tinta="verde"] .rg-nodo-nome svg { color: var(--menta); }
  .rg-nodo[data-tinta="ambra"] .rg-nodo-nome svg { color: var(--ambra); }
  .rg-nodo-descr { font-size: 10px; line-height: 1.4; color: var(--nebbia); margin-top: 4px; }
  .rg-giunto { flex: none; width: 22px; display: grid; place-items: center; position: relative; }
  .rg-giunto::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 0.5px; background: var(--capello-forte); }
  .rg-giunto i { width: 5px; height: 5px; border-radius: 999px; background: var(--fumo); position: relative; }
  .rg-giunto[data-acceso="true"] i { background: var(--blu); box-shadow: 0 0 6px rgba(59, 130, 246, 0.7); }
  @media (max-width: 920px) { .rg-nastro { flex-direction: column; gap: 8px; } .rg-giunto { display: none; } }

  /* il diario del nodo interrogato */
  .rg-diario { padding: 0 16px 16px; }
  .rg-diario pre {
    margin: 0; padding: 12px 14px; border-radius: 8.77px;
    background: var(--tela); box-shadow: 0 0 0 0.5px var(--capello);
    font-family: ${RG_MONO}; font-size: 10.5px; line-height: 1.8; color: var(--gesso);
    overflow-x: auto;
  }
  .rg-diario .blu { color: var(--blu-arco); }

  /* ══ NASTRO LOGHI ══ */
  .rg-loghi {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 20px 48px;
    margin-top: 40px; opacity: 0.9;
  }
  .rg-logo-voce { font-size: 14px; letter-spacing: -0.023em; color: var(--nebbia); white-space: nowrap;
    display: inline-flex; align-items: center; gap: 7px; }
  .rg-logo-voce svg { opacity: 0.7; }

  /* ══ SEZIONE A LINGUETTE ══ */
  .rg-linguette {
    display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 7fr);
    gap: 32px; margin-top: 44px; align-items: start;
  }
  .rg-lista-linguette { display: flex; flex-direction: column; gap: 4px; }
  .rg-linguetta {
    display: flex; flex-direction: column; gap: 3px; text-align: left;
    background: none; border: none; cursor: pointer;
    border-radius: 10px; padding: 12px 14px;
    transition: background 0.18s ease;
  }
  .rg-linguetta:hover { background: var(--velo); }
  .rg-linguetta[data-attiva="true"] { background: var(--velo); box-shadow: inset 2px 0 0 var(--blu); }
  .rg-linguetta-nome { display: inline-flex; align-items: center; gap: 8px;
    font-size: 14px; font-weight: 400; letter-spacing: -0.023em; color: var(--neve); }
  .rg-linguetta-nome svg { color: var(--blu); }
  .rg-linguetta-descr { font-size: 12px; line-height: 1.45; color: var(--acciaio); }
  .rg-vetrina { min-width: 0; }
  .rg-vetrina-corpo { padding: 18px 20px; }
  .rg-vetrina-titolo { font-size: 18px; font-weight: 400; letter-spacing: -0.034em; color: var(--neve); margin: 0; }
  .rg-vetrina-testo { font-size: 13px; line-height: 1.55; color: var(--nebbia); margin: 8px 0 16px; max-width: 58ch; }
  @media (max-width: 860px) { .rg-linguette { grid-template-columns: 1fr; } }

  /* ══ LO STACK — piastrelle a profondità diverse ══ */
  .rg-piastrelle {
    position: relative; margin-top: 44px;
    display: flex; flex-wrap: wrap; justify-content: center; gap: 14px;
  }
  .rg-piastrella {
    display: inline-flex; align-items: center; gap: 9px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8.77px; padding: 12px 16px;
    box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.08);
    font-size: 13px; letter-spacing: -0.026em; color: var(--gesso);
    white-space: nowrap;
  }
  .rg-piastrella svg { color: var(--nebbia); }
  .rg-piastrella[data-piano="2"] { opacity: 0.55; }
  .rg-piastrella[data-piano="3"] { opacity: 0.3; filter: blur(1px); }

  /* ══ IL REGISTRO — terminale ══ */
  .rg-terminale {
    margin-top: 44px; border-radius: 12px; overflow: hidden;
    background: var(--tela); box-shadow: var(--ril-scheda);
  }
  .rg-terminale-corpo {
    margin: 0; padding: 16px 18px; min-height: 240px;
    font-family: ${RG_MONO}; font-size: 11.5px; line-height: 2; color: var(--gesso);
    overflow-x: auto; white-space: pre;
  }
  .rg-terminale-corpo .t { color: var(--acciaio); }
  .rg-terminale-corpo .ok { color: var(--menta); }
  .rg-terminale-corpo .blu { color: var(--blu-arco); }
  .rg-caret {
    display: inline-block; width: 7px; height: 12px; margin-left: 2px; vertical-align: -1px;
    background: var(--blu-arco); animation: rg-lampeggia 1.1s steps(2, start) infinite;
  }
  @keyframes rg-lampeggia { 50% { opacity: 0; } }

  /* ══ LA FIRMA DELL'AGENZIA ══ */
  .rg-firma {
    margin-top: 96px; border-radius: 12px; padding: 48px 32px; text-align: center;
    background: var(--grafite); box-shadow: var(--ril-scheda);
  }
  .rg-firma .rg-sotto { margin-left: auto; margin-right: auto; }
  .rg-firma-cta { display: flex; gap: 10px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }
  .rg-firma-stack {
    margin-top: 20px; font-family: ${RG_MONO}; font-size: 11px;
    letter-spacing: 0.04em; color: var(--acciaio);
  }

  /* ══ PIÈ DI PAGINA ══ */
  .rg-piede {
    margin-top: 96px; padding: 40px 0 48px; text-align: center;
    box-shadow: inset 0 0.5px 0 var(--capello);
  }
  .rg-piede p { font-size: 12px; line-height: 1.6; color: var(--acciaio); max-width: 64ch; margin: 12px auto 0; }

  @media (prefers-reduced-motion: reduce) {
    .rg-root *, .rg-root *::before, .rg-root *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`
