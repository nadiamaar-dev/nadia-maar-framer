/* ══════════════════════════════════════════════════════════════════════════
   SOGLIA — il vestito: una cattedrale di vetro smerigliato a mezzanotte.

   Il sistema è dichiarato da un design token set preciso e questo file lo
   rispetta alla lettera. Le regole che NON vanno negoziate:

   · un solo colore cromatico, il viola #663af3, e solo sul pulsante che
     manda avanti il form di accesso. Ogni altro accento romperebbe il
     monocromatico che tiene insieme tutta la pagina;
   · nessun bordo pieno: i contorni sono filetti INTERNI di bianco-azzurro
     all'12%, cioè ombre inset, non border. È la lingua del vetro;
   · nessuna ombra portata classica: il rilievo nasce da una luce inset in
     alto, un bagliore inset diffuso e un alone scuro freddo sotto;
   · le famiglie di raggio non si mescolano — pulsanti 999px, schede 16px,
     etichette e campi 6px, contenitori d'icona cerchio pieno;
   · il gradiente Skywash vive solo sul logotipo e sui titoli più grandi,
     mai sul testo corrente né sui pulsanti.

   I tre caratteri della specifica (Untitled Sans, aeonikPro, dotDigital)
   sono commerciali: si usano i sostituti indicati — Inter, Space Grotesk,
   JetBrains Mono — che questo sito ospita già per conto suo.

   Nota tecnica: questo CSS vive dentro un template literal, quindi nei
   commenti non compaiono apici inversi. Hanno già rotto la build due volte.
══════════════════════════════════════════════════════════════════════════ */

export const SG_SANS = "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
export const SG_DISPLAY = "'Space Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
export const SG_MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export const SOGLIA_CSS = `
  .sg-root {
    /* ── colori ── */
    --mezzanotte: #05060f;
    --acciaio: #2f343e;
    --nebbia: #9da7ba;
    --bruma: #c7d3ea;
    --brina: #d1e4fa;
    --ghiaccio: #d8ecf8;
    --bianco: #ffffff;
    --viola: #663af3;
    --blu-progetto: #b6d9fc;
    --brace: #e46d4c;
    --blu-segnale: #027dea;
    --verde-teal: #269684;
    --skywash: linear-gradient(180deg, #d8ecf8 0%, #98c0ef 100%);

    /* ── filetti e velature ── */
    --filo: rgba(186, 215, 247, 0.12);
    --filo-forte: rgba(186, 214, 247, 0.24);
    --velo: rgba(186, 214, 247, 0.06);
    --velo-2: rgba(199, 211, 234, 0.12);
    --vetro: rgba(186, 214, 247, 0.03);

    /* ── rilievi: luce inset in alto, bagliore inset, alone freddo ── */
    --ril-scheda: inset 0 1px 1px rgba(199, 211, 234, 0.12),
                  inset 0 24px 48px rgba(199, 211, 234, 0.05),
                  0 24px 32px rgba(6, 6, 14, 0.7);
    --ril-modale: inset 0 1px 1px rgba(216, 236, 248, 0.2),
                  inset 0 24px 48px rgba(168, 216, 245, 0.06),
                  0 16px 32px rgba(0, 0, 0, 0.3);
    --ril-filo: inset 0 0 0 1px rgba(186, 215, 247, 0.12);
    --alone: 0 0 6px rgba(186, 207, 247, 0.32), 0 0 12px rgba(238, 186, 247, 0.24);

    position: relative;
    background: var(--mezzanotte);
    color: var(--brina);
    font-family: ${SG_SANS};
    font-size: 16px; line-height: 1.5; letter-spacing: -0.01em;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  .sg-root *, .sg-root *::before, .sg-root *::after { box-sizing: border-box; }
  .sg-root button { font-family: inherit; }
  .sg-root ::selection { background: rgba(102, 58, 243, 0.4); color: #fff; }
  .sg-root svg { display: block; }

  /* ══ ATMOSFERA — griglia da cianografia e faro conico ══ */
  .sg-atmosfera { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .sg-griglia {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(186, 215, 247, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(186, 215, 247, 0.06) 1px, transparent 1px);
    background-size: 80px 80px;
    /* sfuma ai bordi: una griglia che tocca il taglio dello schermo sembra
       una tabella, non un'atmosfera */
    -webkit-mask-image: radial-gradient(ellipse 78% 58% at 50% 22%, #000 25%, transparent 78%);
    mask-image: radial-gradient(ellipse 78% 58% at 50% 22%, #000 25%, transparent 78%);
  }
  /* la seconda isola di griglia, più giù: l'atmosfera non finisce col hero */
  .sg-griglia--bassa {
    -webkit-mask-image: radial-gradient(ellipse 70% 34% at 50% 62%, #000 15%, transparent 75%);
    mask-image: radial-gradient(ellipse 70% 34% at 50% 62%, #000 15%, transparent 75%);
    opacity: 0.7;
  }
  .sg-faro {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: min(1500px, 160vw); height: 780px;
    background: conic-gradient(at 50% -5%,
      transparent 45%,
      rgba(124, 145, 182, 0.3) 49%,
      rgba(124, 145, 182, 0.5) 50%,
      rgba(124, 145, 182, 0.3) 51%,
      transparent 55%);
    -webkit-mask-image: linear-gradient(180deg, #000 0%, transparent 82%);
    mask-image: linear-gradient(180deg, #000 0%, transparent 82%);
    opacity: 0.85;
  }
  .sg-corpo { position: relative; z-index: 1; }

  /* ══ IMPIANTO ══ */
  .sg-contenitore { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .sg-sezione { padding: 120px 0; }
  @media (max-width: 860px) { .sg-sezione { padding: 80px 0; } }

  /* ══ TIPOGRAFIA ══ */
  .sg-sopra {
    display: block; text-align: center;
    font-family: ${SG_MONO};
    font-size: 15px; font-weight: 400; line-height: 1.2; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--bruma);
    font-feature-settings: "tnum" on;
  }
  /* l'etichetta di sezione con i due filetti che sfumano ai lati */
  .sg-sopra-riga { display: flex; align-items: center; gap: 20px; justify-content: center; }
  .sg-sopra-riga::before, .sg-sopra-riga::after {
    content: ""; height: 1px; flex: 1; max-width: 220px;
  }
  .sg-sopra-riga::before { background: linear-gradient(90deg, transparent, var(--filo)); }
  .sg-sopra-riga::after { background: linear-gradient(90deg, var(--filo), transparent); }

  .sg-titolo {
    font-family: ${SG_DISPLAY};
    font-weight: 500; font-size: 44px; line-height: 1.16; letter-spacing: normal;
    text-align: center; margin: 24px 0 0;
    background: var(--skywash);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent;
    text-wrap: balance;
  }
  @media (max-width: 700px) { .sg-titolo { font-size: 32px; } }
  .sg-sommario {
    max-width: 640px; margin: 20px auto 0; text-align: center;
    font-size: 16px; line-height: 1.5; letter-spacing: -0.16px; color: var(--bruma);
  }

  /* ══ PULSANTI ══ */
  .sg-pill {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border: none; border-radius: 999px; padding: 8px 16px; cursor: pointer;
    font-size: 14px; font-weight: 500; line-height: 1.43; letter-spacing: -0.01em;
    color: var(--bianco); background: var(--velo);
    box-shadow: var(--ril-filo);
    transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  }
  .sg-pill:hover { background: rgba(186, 214, 247, 0.12); }
  .sg-pill:active { transform: scale(0.985); }
  .sg-pill--vuoto { background: transparent; color: var(--brina); }
  .sg-pill--vuoto:hover { background: var(--velo); }
  .sg-pill--grande { padding: 12px 24px; font-size: 16px; }

  /* ══ NAVIGAZIONE ══ */
  .sg-nav {
    position: sticky; top: 0; z-index: 40;
    background: rgba(5, 6, 15, 0.72);
    backdrop-filter: blur(20px) saturate(1.3); -webkit-backdrop-filter: blur(20px) saturate(1.3);
    box-shadow: inset 0 -1px 0 var(--filo);
  }
  .sg-nav-int {
    max-width: 1200px; margin: 0 auto; padding: 12px 24px;
    display: flex; align-items: center; gap: 24px;
  }
  .sg-marchio { display: inline-flex; align-items: center; gap: 9px; color: var(--brina); }
  .sg-marchio-testo { font-size: 16px; font-weight: 500; letter-spacing: -0.01em; }
  .sg-nav-link {
    background: none; border: none; padding: 6px 0; cursor: pointer;
    font-size: 14px; font-weight: 400; color: var(--bruma);
    transition: color 0.18s ease;
  }
  .sg-nav-link:hover { color: var(--brina); }
  .sg-nav-centro { display: flex; gap: 24px; margin: 0 auto; }
  .sg-nav-destra { display: flex; gap: 8px; align-items: center; }
  @media (max-width: 860px) { .sg-nav-centro { display: none; } }

  /* ══ APERTURA ══ */
  .sg-apertura { padding: 100px 0 0; text-align: center; }
  .sg-logotipo {
    font-family: ${SG_DISPLAY};
    font-weight: 500; font-size: clamp(72px, 13vw, 168px); line-height: 1.05;
    letter-spacing: -0.02em; margin: 28px 0 0;
    background: var(--skywash);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent;
    filter: drop-shadow(0 0 24px rgba(186, 207, 247, 0.22));
  }
  .sg-apertura-sub {
    max-width: 560px; margin: 18px auto 0;
    font-size: 18px; line-height: 1.33; color: var(--bruma);
  }
  .sg-apertura-cta { display: flex; gap: 12px; justify-content: center; margin-top: 32px; flex-wrap: wrap; }

  /* ══ IL VENTAGLIO DI SCHEDE ══ */
  .sg-ventaglio {
    position: relative; margin: 56px auto 0; max-width: 1060px; min-height: 560px;
    display: flex; align-items: flex-start; justify-content: center;
  }
  .sg-ventaglio-lato {
    position: absolute; top: 42px; width: 320px; opacity: 0.55;
    pointer-events: none; filter: blur(0.4px);
  }
  .sg-ventaglio-lato.sx { left: 0; transform: rotate(-7deg) translateY(14px); }
  .sg-ventaglio-lato.dx { right: 0; transform: rotate(7deg) translateY(14px); }
  .sg-ventaglio-centro { position: relative; z-index: 2; width: min(420px, 100%); }
  @media (max-width: 1080px) { .sg-ventaglio-lato { display: none; } .sg-ventaglio { min-height: 0; } }

  /* ══ LA SCHEDA DI ACCESSO — il prodotto ══ */
  .sg-scheda {
    --s-bg: rgba(5, 6, 15, 0.97);
    --s-testo: #ffffff;
    --s-fioco: #c7d3ea;
    --s-filo: rgba(186, 215, 247, 0.12);
    --s-campo: rgba(199, 211, 234, 0.06);
    --s-raggio: 16px;
    --s-accento: #663af3;

    background: var(--s-bg);
    border-radius: var(--s-raggio);
    padding: 28px 24px 24px;
    box-shadow: var(--ril-modale);
    text-align: left;
    transition: background 0.3s ease, border-radius 0.25s ease;
  }
  /* la modalità chiara è una funzione DEL PRODOTTO, non del sito: la
     pagina resta scura, la scheda sa vestirsi di bianco */
  .sg-scheda[data-chiaro="true"] {
    --s-bg: #ffffff;
    --s-testo: #10121c;
    --s-fioco: #5d6478;
    --s-filo: rgba(16, 18, 28, 0.12);
    --s-campo: rgba(16, 18, 28, 0.04);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 16px 32px rgba(0, 0, 0, 0.45);
  }

  .sg-scheda-testa { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 22px; }
  .sg-scheda-logo {
    width: 40px; height: 40px; border-radius: 9999px;
    display: grid; place-items: center;
    background: var(--s-campo); color: var(--s-accento);
    box-shadow: inset 0 0 0 1px var(--s-filo);
  }
  .sg-scheda-titolo {
    font-family: ${SG_DISPLAY};
    font-size: 20px; font-weight: 500; color: var(--s-testo); text-align: center;
  }
  .sg-scheda-sub { font-size: 14px; line-height: 1.43; color: var(--s-fioco); text-align: center; }

  /* selettore di modalità: pillole piccole */
  .sg-modi { display: flex; gap: 6px; padding: 4px; border-radius: 999px; background: var(--s-campo); margin-bottom: 20px; }
  .sg-modo {
    flex: 1; border: none; background: transparent; cursor: pointer;
    border-radius: 999px; padding: 7px 10px;
    font-size: 12px; font-weight: 500; color: var(--s-fioco);
    transition: background 0.18s ease, color 0.18s ease;
  }
  .sg-modo:hover { color: var(--s-testo); }
  .sg-modo[data-on="true"] { background: rgba(186, 214, 247, 0.12); color: var(--s-testo); box-shadow: inset 0 0 0 1px var(--s-filo); }
  .sg-scheda[data-chiaro="true"] .sg-modo[data-on="true"] { background: #ffffff; box-shadow: 0 1px 3px rgba(16, 18, 28, 0.16); }

  .sg-campo { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .sg-etichetta { font-size: 12px; font-weight: 500; color: var(--s-fioco); }
  .sg-input {
    width: 100%; border: none; border-radius: 6px; padding: 10px 12px;
    background: var(--s-campo); color: var(--s-testo);
    font-family: ${SG_SANS}; font-size: 14px; line-height: 1.43;
    box-shadow: inset 0 0 0 1px var(--s-filo);
    outline: none; transition: box-shadow 0.18s ease;
  }
  .sg-input::placeholder { color: var(--s-fioco); opacity: 0.6; }
  .sg-input:focus { box-shadow: inset 0 0 0 1px rgba(186, 215, 247, 0.24); }
  .sg-scheda[data-chiaro="true"] .sg-input:focus { box-shadow: inset 0 0 0 1px rgba(16, 18, 28, 0.28); }
  .sg-input[aria-invalid="true"] { box-shadow: inset 0 0 0 1px rgba(228, 109, 76, 0.55); }

  .sg-errore { font-size: 12px; line-height: 1.33; color: #e46d4c; }

  /* il solo pulsante cromatico del sistema */
  .sg-cta {
    width: 100%; border: none; cursor: pointer;
    border-radius: 6px; padding: 12px 24px; margin-top: 6px;
    background: var(--s-accento); color: #ffffff;
    font-family: ${SG_SANS}; font-size: 14px; font-weight: 500; letter-spacing: -0.01em;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    transition: filter 0.18s ease, transform 0.12s ease;
  }
  .sg-cta:hover { filter: brightness(1.12); }
  .sg-cta:active { transform: scale(0.99); }
  .sg-cta:disabled { opacity: 0.6; cursor: default; }

  .sg-oppure {
    display: flex; align-items: center; gap: 12px; margin: 18px 0 14px;
    font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--s-fioco);
  }
  .sg-oppure::before, .sg-oppure::after { content: ""; flex: 1; height: 1px; background: var(--s-filo); }

  .sg-provider {
    width: 100%; display: inline-flex; align-items: center; gap: 10px;
    border: none; cursor: pointer; border-radius: 6px; padding: 11px 14px; margin-bottom: 8px;
    background: var(--s-campo); color: var(--s-testo);
    font-family: ${SG_SANS}; font-size: 14px; font-weight: 500;
    box-shadow: inset 0 0 0 1px var(--s-filo);
    transition: background 0.18s ease;
  }
  .sg-provider:hover { background: rgba(186, 214, 247, 0.12); }
  .sg-scheda[data-chiaro="true"] .sg-provider:hover { background: rgba(16, 18, 28, 0.07); }

  .sg-piede-scheda { margin-top: 16px; text-align: center; font-size: 12px; color: var(--s-fioco); }
  .sg-piede-scheda button {
    background: none; border: none; padding: 0; cursor: pointer;
    color: var(--s-testo); font-size: 12px; font-family: inherit;
    text-decoration: underline; text-underline-offset: 2px;
  }

  /* ── le sei caselle del codice ── */
  .sg-codice { display: flex; gap: 8px; justify-content: space-between; margin: 4px 0 12px; }
  .sg-cifra {
    width: 100%; aspect-ratio: 1 / 1.16; min-width: 0;
    border: none; border-radius: 6px; text-align: center;
    background: var(--s-campo); color: var(--s-testo);
    font-family: ${SG_MONO}; font-size: 18px; font-weight: 500;
    box-shadow: inset 0 0 0 1px var(--s-filo); outline: none;
    transition: box-shadow 0.15s ease;
  }
  .sg-cifra:focus { box-shadow: inset 0 0 0 1px rgba(186, 215, 247, 0.32); }

  /* ── esito ── */
  .sg-esito { display: grid; place-items: center; gap: 12px; padding: 26px 0 12px; text-align: center; }
  .sg-esito-cerchio {
    width: 56px; height: 56px; border-radius: 9999px; display: grid; place-items: center;
    background: var(--s-campo); color: var(--s-accento);
    box-shadow: inset 0 0 0 1px var(--s-filo);
  }
  .sg-esito-titolo { font-family: ${SG_DISPLAY}; font-size: 20px; font-weight: 500; color: var(--s-testo); }
  .sg-esito-nota { font-size: 13px; line-height: 1.5; color: var(--s-fioco); max-width: 30ch; }
  .sg-esito-dati {
    width: 100%; margin-top: 6px; padding: 12px; border-radius: 6px;
    background: var(--s-campo); box-shadow: inset 0 0 0 1px var(--s-filo);
    font-family: ${SG_MONO}; font-size: 11.5px; line-height: 1.8; color: var(--s-fioco);
    text-align: left; white-space: pre; overflow-x: auto;
  }
  .sg-esito-dati b { color: var(--s-testo); font-weight: 500; }

  /* ══ INTERRUTTORE CHIARO/SCURO ══ */
  .sg-tema { display: flex; justify-content: center; margin-top: 40px; }
  .sg-tema-gruppo {
    display: inline-flex; gap: 4px; padding: 4px; height: 40px;
    border-radius: 999px; background: var(--velo); box-shadow: var(--ril-filo);
  }
  .sg-tema-btn {
    display: inline-flex; align-items: center; gap: 7px;
    border: none; background: transparent; cursor: pointer;
    border-radius: 999px; padding: 0 14px; color: var(--bruma);
    font-size: 13px; font-weight: 500; transition: background 0.18s ease, color 0.18s ease;
  }
  .sg-tema-btn[data-on="true"] { background: rgba(186, 214, 247, 0.12); color: var(--bianco); }

  /* ══ FILA DELLE FUNZIONI ══ */
  .sg-funzioni { position: relative; display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-top: 56px; }
  /* la linea che collega i cerchi si DISEGNA quando la fila entra in vista:
     è un elemento animato, non uno pseudo, perché deve crescere da sinistra */
  .sg-funzioni-linea {
    position: absolute; top: 28px; left: 8%; right: 8%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--filo) 12%, var(--filo) 88%, transparent);
    transform-origin: left center;
  }
  .sg-funzione { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
  .sg-funzione-tile {
    width: 56px; height: 56px; border-radius: 9999px; display: grid; place-items: center;
    background: var(--velo); color: var(--brina);
    box-shadow: var(--ril-filo);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    transition: background 0.22s ease, transform 0.22s ease;
  }
  .sg-funzione:hover .sg-funzione-tile { background: rgba(186, 214, 247, 0.12); transform: translateY(-2px); }
  .sg-funzione-nome { font-size: 14px; font-weight: 500; color: var(--bruma); }
  @media (max-width: 860px) {
    .sg-funzioni { grid-template-columns: repeat(3, 1fr); gap: 24px 12px; }
    .sg-funzioni::before { display: none; }
  }

  /* ══ IL BANCO DA LAVORO — finestra finta e ispettori ══ */
  .sg-banco { position: relative; margin-top: 64px; display: grid; place-items: center; min-height: 560px; }
  .sg-finestra {
    position: relative; z-index: 2; width: min(560px, 100%);
    border-radius: 16px; overflow: hidden;
    background: rgba(186, 214, 247, 0.03);
    box-shadow: var(--ril-scheda);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  }
  .sg-finestra-barra {
    display: flex; align-items: center; gap: 8px; padding: 12px 16px;
    box-shadow: inset 0 -1px 0 var(--filo);
  }
  .sg-semaforo { display: flex; gap: 6px; }
  .sg-semaforo i { width: 9px; height: 9px; border-radius: 9999px; background: var(--velo-2); }
  .sg-finestra-url {
    flex: 1; text-align: center; font-family: ${SG_MONO}; font-size: 11px; color: var(--nebbia);
    background: rgba(199, 211, 234, 0.06); border-radius: 6px; padding: 4px 10px;
    box-shadow: var(--ril-filo);
  }
  .sg-finestra-corpo { padding: 32px 24px; display: grid; place-items: center; transition: background 0.3s ease; }
  .sg-finestra-corpo[data-chiaro="true"] { background: #eef1f7; }
  .sg-finestra-corpo .sg-scheda { width: min(360px, 100%); }

  .sg-ispettore {
    position: absolute; z-index: 3; width: 232px;
    border-radius: 16px; padding: 16px;
    background: rgba(5, 6, 15, 0.86);
    backdrop-filter: blur(18px) saturate(1.3); -webkit-backdrop-filter: blur(18px) saturate(1.3);
    box-shadow: var(--ril-modale);
  }
  .sg-isp-sx-alto { top: 0; left: 0; }
  .sg-isp-dx-alto { top: 46px; right: 0; }
  .sg-isp-sx-basso { bottom: 34px; left: 22px; }
  .sg-isp-dx-basso { bottom: 0; right: 24px; }
  .sg-isp-titolo {
    font-family: ${SG_MONO}; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--nebbia); margin-bottom: 12px;
  }
  .sg-campioni { display: flex; gap: 4px; }
  .sg-campione {
    width: 24px; height: 24px; border-radius: 6px; border: none; cursor: pointer; padding: 0;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .sg-campione:hover { transform: scale(1.08); }
  .sg-campione[data-on="true"] { box-shadow: 0 0 0 2px var(--mezzanotte), 0 0 0 3px var(--brina); }
  .sg-isp-valore { font-family: ${SG_MONO}; font-size: 11px; color: var(--brina); }
  .sg-isp-riga { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }

  .sg-cursore { -webkit-appearance: none; appearance: none; width: 100%; height: 3px; border-radius: 999px;
    background: var(--velo-2); outline: none; cursor: pointer; }
  .sg-cursore::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none; width: 15px; height: 15px; border-radius: 9999px;
    background: var(--brina); box-shadow: 0 0 0 1px rgba(5, 6, 15, 0.6), var(--shadow-sm, 0 0 6px rgba(186, 207, 247, 0.32));
    cursor: pointer;
  }
  .sg-cursore::-moz-range-thumb {
    width: 15px; height: 15px; border: none; border-radius: 9999px; background: var(--brina); cursor: pointer;
  }

  .sg-isp-loghi { display: flex; gap: 6px; }
  .sg-isp-logo {
    width: 34px; height: 34px; border-radius: 9999px; border: none; cursor: pointer;
    display: grid; place-items: center;
    background: var(--velo); color: var(--brina);
    box-shadow: var(--ril-filo); transition: background 0.16s ease;
  }
  .sg-isp-logo:hover { background: rgba(186, 214, 247, 0.12); }
  .sg-isp-logo[data-on="true"] { box-shadow: inset 0 0 0 1px var(--filo-forte); background: rgba(186, 214, 247, 0.12); }

  .sg-isp-input {
    width: 100%; border: none; border-radius: 6px; padding: 8px 10px;
    background: rgba(199, 211, 234, 0.06); color: var(--bianco);
    font-family: ${SG_SANS}; font-size: 12.5px;
    box-shadow: var(--ril-filo); outline: none;
  }
  .sg-isp-input:focus { box-shadow: inset 0 0 0 1px var(--filo-forte); }

  /* Sul desktop il contenitore degli ispettori non esiste: i pannelli si
     ancorano ai quattro angoli del banco. Sotto i 1100px torna un blocco
     vero e li mette in griglia sotto la finestra — in un telefono un
     pannello «flottante» finirebbe sopra la scheda che deve mostrare. */
  .sg-ispettori { display: contents; }
  @media (max-width: 1100px) {
    .sg-banco { min-height: 0; gap: 20px; }
    .sg-ispettore { position: static; width: 100%; }
    .sg-ispettori { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; width: 100%; }
  }
  @media (max-width: 560px) { .sg-ispettori { grid-template-columns: 1fr; } }

  /* ══ SCHEDE DI INTEGRAZIONE ══ */
  .sg-griglia-schede { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 56px; }
  .sg-vetro {
    border-radius: 16px; padding: 24px;
    background: rgba(186, 214, 247, 0.03);
    box-shadow: var(--ril-scheda);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    display: flex; flex-direction: column; gap: 12px;
  }
  .sg-vetro-icona {
    width: 44px; height: 44px; border-radius: 9999px; display: grid; place-items: center;
    background: var(--velo); color: var(--brina); box-shadow: var(--ril-filo);
  }
  .sg-vetro h3 { font-family: ${SG_DISPLAY}; font-size: 18px; font-weight: 500; color: var(--ghiaccio); margin: 4px 0 0; }
  .sg-vetro p { font-size: 14px; line-height: 1.5; color: var(--nebbia); margin: 0; }
  .sg-tag-fila { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; padding-top: 8px; }
  .sg-tag {
    border-radius: 6px; padding: 4px 8px;
    background: rgba(199, 211, 234, 0.12); color: var(--brina);
    font-size: 12px; font-weight: 500; line-height: 1.33;
    box-shadow: inset 0 1px 1px rgba(199, 211, 234, 0.12);
  }
  @media (max-width: 900px) { .sg-griglia-schede { grid-template-columns: 1fr; } }

  /* ══ CODICE ══ */
  .sg-codice-blocco {
    margin-top: 40px; border-radius: 16px; overflow: hidden;
    background: rgba(5, 6, 15, 0.86); box-shadow: var(--ril-modale);
  }
  .sg-codice-testa {
    display: flex; align-items: center; gap: 10px; padding: 10px 16px;
    box-shadow: inset 0 -1px 0 var(--filo);
    font-family: ${SG_MONO}; font-size: 11px; color: var(--nebbia);
  }
  .sg-codice-corpo {
    margin: 0; padding: 20px 24px; overflow-x: auto;
    font-family: ${SG_MONO}; font-size: 12.5px; line-height: 2; color: var(--bruma);
  }
  .sg-codice-corpo .k { color: #b6d9fc; }
  .sg-codice-corpo .s { color: #98c0ef; }
  .sg-codice-corpo .c { color: #5d6478; }

  /* ══ CHIUSURA ══ */
  .sg-chiusura { text-align: center; padding: 120px 0 100px; }
  .sg-piede {
    padding: 40px 0 48px; text-align: center;
    box-shadow: inset 0 1px 0 var(--filo);
  }
  .sg-piede p { font-size: 12.5px; line-height: 1.6; color: var(--nebbia); max-width: 62ch; margin: 14px auto 0; }

  /* ══ IL RESPIRO DEL LOGOTIPO — l'alone pulsa piano, come una vetrata
     illuminata da dietro. Il gradiente vive sulle singole lettere perché
     ognuna entra in scena per conto suo. ══ */
  .sg-logotipo-lettera {
    display: inline-block;
    background: var(--skywash);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent;
  }
  @keyframes sg-respiro {
    0%, 100% { filter: drop-shadow(0 0 22px rgba(186, 207, 247, 0.18)); }
    50%      { filter: drop-shadow(0 0 42px rgba(186, 207, 247, 0.34)); }
  }
  .sg-logotipo { animation: sg-respiro 5.5s ease-in-out infinite; }

  /* ══ PULVISCOLO — granelli di luce che salgono nell'apertura ══ */
  .sg-pulviscolo { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .sg-pulviscolo span {
    position: absolute; border-radius: 9999px;
    background: rgba(186, 215, 247, 0.55);
    box-shadow: 0 0 6px rgba(186, 215, 247, 0.45);
  }

  /* ══ NASTRO DEI CLIENTI — marchi inventati che scorrono senza fine ══ */
  .sg-nastro-sezione { padding: 40px 0 8px; }
  .sg-nastro {
    overflow: hidden; margin-top: 32px;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
  }
  .sg-nastro-fila {
    display: flex; align-items: center; gap: 64px; width: max-content;
    padding-right: 64px;
    animation: sg-scorri 30s linear infinite;
  }
  .sg-nastro:hover .sg-nastro-fila { animation-play-state: paused; }
  @keyframes sg-scorri { to { transform: translateX(-50%); } }
  .sg-cliente {
    display: inline-flex; align-items: center; gap: 9px; white-space: nowrap;
    font-family: ${SG_DISPLAY}; font-size: 17px; font-weight: 500;
    color: var(--nebbia); transition: color 0.25s ease;
  }
  .sg-cliente:hover { color: var(--brina); }
  .sg-cliente svg { opacity: 0.75; }

  /* ══ COME FUNZIONA — tre nodi e l'impulso che viaggia ══ */
  .sg-flusso { display: flex; align-items: stretch; margin-top: 56px; }
  .sg-nodo {
    width: 240px; flex: none;
    border-radius: 16px; padding: 24px 20px; text-align: center;
    background: var(--vetro); box-shadow: var(--ril-scheda);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .sg-nodo-icona {
    position: relative;
    width: 52px; height: 52px; border-radius: 9999px; display: grid; place-items: center;
    background: var(--velo); color: var(--brina); box-shadow: var(--ril-filo);
  }
  .sg-nodo-eco {
    position: absolute; inset: 0; border-radius: 9999px;
    box-shadow: 0 0 0 1px rgba(186, 215, 247, 0.35);
  }
  .sg-nodo h3 { font-family: ${SG_DISPLAY}; font-size: 17px; font-weight: 500; color: var(--ghiaccio); margin: 0; }
  .sg-nodo p { font-size: 13px; line-height: 1.45; color: var(--nebbia); margin: 0; }
  .sg-tratta {
    flex: 1; position: relative; align-self: center; height: 44px; min-width: 60px;
    display: grid; align-items: center;
  }
  .sg-tratta::before {
    content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--filo-forte), transparent);
  }
  .sg-tratta-eti {
    position: absolute; left: 50%; transform: translateX(-50%); top: -4px;
    font-family: ${SG_MONO}; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--nebbia); white-space: nowrap;
  }
  .sg-impulso {
    position: absolute; top: 50%; left: 0; margin-top: -3.5px;
    width: 7px; height: 7px; border-radius: 9999px;
    background: #d1e4fa;
    box-shadow: 0 0 8px rgba(209, 228, 250, 0.9), 0 0 20px rgba(152, 192, 239, 0.5);
  }
  @media (max-width: 880px) {
    .sg-flusso { flex-direction: column; align-items: center; gap: 0; }
    .sg-nodo { width: min(300px, 100%); }
    .sg-tratta { width: 1px; min-width: 0; height: 44px; flex: none; }
    .sg-tratta::before { left: 50%; right: auto; top: 0; bottom: 0; width: 1px; height: auto;
      background: linear-gradient(180deg, transparent, var(--filo-forte), transparent); }
    .sg-tratta-eti, .sg-impulso { display: none; }
  }

  /* ══ NUMERI CHE REGGONO ══ */
  .sg-statistiche { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 64px; }
  .sg-stat {
    text-align: center; padding: 30px 24px; border-radius: 16px;
    background: var(--vetro); box-shadow: var(--ril-scheda);
  }
  .sg-stat-num {
    font-family: ${SG_DISPLAY}; font-size: 42px; font-weight: 500; line-height: 1.1;
    color: var(--ghiaccio); font-feature-settings: "tnum" on;
  }
  .sg-stat-eti { display: block; margin-top: 8px; font-size: 14px; color: var(--nebbia); }
  @media (max-width: 760px) { .sg-statistiche { grid-template-columns: 1fr; } }

  /* ══ SICUREZZA — il radar che spazza e le difese elencate ══ */
  .sg-sicurezza {
    display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
    gap: 48px; align-items: center; margin-top: 56px;
  }
  .sg-radar-scena { display: grid; place-items: center; }
  .sg-radar {
    position: relative; width: min(360px, 78vw); aspect-ratio: 1;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(186, 214, 247, 0.06), rgba(186, 214, 247, 0.015) 55%, transparent 72%);
    box-shadow: var(--ril-filo);
  }
  /* gli anelli interni e il mirino: solo filetti, come tutto il resto */
  .sg-radar::before, .sg-radar::after {
    content: ""; position: absolute; border-radius: 9999px;
    box-shadow: inset 0 0 0 1px rgba(186, 215, 247, 0.1);
  }
  .sg-radar::before { inset: 17%; }
  .sg-radar::after { inset: 34%; }
  .sg-radar-assi { position: absolute; inset: 0; }
  .sg-radar-assi::before, .sg-radar-assi::after {
    content: ""; position: absolute; background: rgba(186, 215, 247, 0.08);
  }
  .sg-radar-assi::before { left: 0; right: 0; top: 50%; height: 1px; }
  .sg-radar-assi::after { top: 0; bottom: 0; left: 50%; width: 1px; }
  .sg-radar-spazzata {
    position: absolute; inset: 0; border-radius: 9999px; overflow: hidden;
    background: conic-gradient(from 0deg,
      rgba(186, 215, 247, 0.3) 0deg,
      rgba(186, 215, 247, 0.08) 38deg,
      transparent 70deg, transparent 360deg);
    /* il cono parte pieno al bordo del giro e sfuma: è la spazzata */
  }
  .sg-radar-centro {
    position: absolute; inset: 0; display: grid; place-items: center; color: var(--brina);
  }
  .sg-radar-centro span {
    width: 54px; height: 54px; border-radius: 9999px; display: grid; place-items: center;
    background: rgba(5, 6, 15, 0.85); box-shadow: var(--ril-modale);
  }
  .sg-blip {
    position: absolute; width: 6px; height: 6px; border-radius: 9999px;
    background: #d1e4fa; box-shadow: 0 0 8px rgba(209, 228, 250, 0.9), 0 0 18px rgba(152, 192, 239, 0.5);
  }
  .sg-difese { display: flex; flex-direction: column; gap: 14px; }
  .sg-difesa {
    display: flex; gap: 16px; align-items: flex-start;
    border-radius: 16px; padding: 18px 20px;
    background: var(--vetro); box-shadow: var(--ril-scheda);
  }
  .sg-difesa-icona {
    flex: none; width: 40px; height: 40px; border-radius: 9999px; display: grid; place-items: center;
    background: var(--velo); color: var(--brina); box-shadow: var(--ril-filo);
  }
  .sg-difesa h3 { font-family: ${SG_DISPLAY}; font-size: 16px; font-weight: 500; color: var(--ghiaccio); margin: 0 0 3px; }
  .sg-difesa p { font-size: 13.5px; line-height: 1.5; color: var(--nebbia); margin: 0; }
  @media (max-width: 980px) { .sg-sicurezza { grid-template-columns: 1fr; gap: 36px; } }

  /* ══ L'ORBITA — i sei metodi girano intorno alla stessa sessione ══ */
  .sg-orbita-scena { display: grid; place-items: center; margin-top: 56px; }
  .sg-orbita { position: relative; width: min(460px, 88vw); aspect-ratio: 1; }
  .sg-anello {
    position: absolute; border-radius: 9999px;
    box-shadow: inset 0 0 0 1px rgba(186, 215, 247, 0.1);
  }
  .sg-anello--uno { inset: 11%; }
  .sg-anello--due { inset: 30%; }
  .sg-orb-icona {
    position: absolute; top: 50%; left: 50%; margin: -24px 0 0 -24px;
    width: 48px; height: 48px; border-radius: 9999px; display: grid; place-items: center;
    background: rgba(5, 6, 15, 0.88); color: var(--brina);
    box-shadow: var(--ril-modale);
  }
  .sg-orbita-centro {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 76px; height: 76px; border-radius: 9999px; display: grid; place-items: center;
    background: rgba(5, 6, 15, 0.92); color: var(--ghiaccio);
    box-shadow: var(--ril-modale);
  }
  .sg-orbita-dida {
    margin: 28px auto 0; max-width: 480px; text-align: center;
    font-size: 14px; line-height: 1.6; color: var(--nebbia);
  }

  /* ══ DOMANDE ══ */
  .sg-faq { max-width: 720px; margin: 48px auto 0; display: flex; flex-direction: column; gap: 12px; }
  .sg-domanda {
    border-radius: 16px; overflow: hidden;
    background: var(--vetro); box-shadow: var(--ril-scheda);
  }
  .sg-domanda-testa {
    width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px;
    border: none; background: transparent; cursor: pointer; text-align: left;
    padding: 18px 22px;
    font-family: ${SG_SANS}; font-size: 15.5px; font-weight: 500; color: var(--brina);
    transition: color 0.18s ease;
  }
  .sg-domanda-testa:hover { color: var(--ghiaccio); }
  .sg-domanda-piu { flex: none; color: var(--nebbia); transition: transform 0.28s ease; }
  .sg-domanda-testa[aria-expanded="true"] .sg-domanda-piu { transform: rotate(45deg); }
  .sg-domanda-corpo { padding: 0 22px 18px; font-size: 14px; line-height: 1.6; color: var(--nebbia); }

  /* ══ IL CANTIERE DIETRO — la firma dell'agenzia ══
     Un bordo di luce che gira intorno alla scheda: il conic-gradient vive
     su un livello sotto, sporge dai bordi e ruota; la scheda interna,
     opaca e inset di 1px, lascia vedere solo l'anello. */
  .sg-agenzia { position: relative; border-radius: 16px; padding: 1px; overflow: hidden; margin-top: 56px; }
  .sg-agenzia-luce {
    position: absolute; inset: -75%;
    background: conic-gradient(from 0deg,
      transparent 0deg, transparent 288deg,
      rgba(186, 215, 247, 0.4) 324deg,
      rgba(216, 236, 248, 0.55) 342deg,
      transparent 360deg);
    animation: sg-gira 8s linear infinite;
  }
  @keyframes sg-gira { to { transform: rotate(360deg); } }
  .sg-agenzia-int {
    position: relative; border-radius: 15px; text-align: center;
    background: rgba(5, 6, 15, 0.96);
    padding: 56px 32px 52px;
    box-shadow: inset 0 1px 1px rgba(216, 236, 248, 0.2), inset 0 24px 48px rgba(168, 216, 245, 0.06);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  }
  .sg-agenzia-stack {
    margin-top: 22px;
    font-family: ${SG_MONO}; font-size: 11.5px; letter-spacing: 0.06em; color: var(--nebbia);
  }
  .sg-agenzia .sg-apertura-cta { margin-top: 28px; }
  a.sg-pill { text-decoration: none; }

  /* ══ IL CURSORE DEL CODICE ══ */
  .sg-caret {
    display: inline-block; width: 7px; height: 13px; margin-left: 2px; vertical-align: -2px;
    background: #98c0ef; animation: sg-lampeggia 1.1s steps(2, start) infinite;
  }
  @keyframes sg-lampeggia { 50% { opacity: 0; } }

  @media (prefers-reduced-motion: reduce) {
    .sg-root *, .sg-root *::before, .sg-root *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
    .sg-nastro-fila { animation: none; }
  }
`
