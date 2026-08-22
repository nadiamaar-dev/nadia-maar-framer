/* ══════════════════════════════════════════════════════════════════════════
   ATELIER — il vestito.

   Una maison su fondo porcellana: molta aria, grafite quasi nera, un serif
   (Fraunces) riservato ai titoli e ai prezzi importanti. Il vetro smerigliato
   fa tre mestieri precisi — la barra di navigazione, i pannelli che
   galleggiano sopra la sala dell'atelier, la busta della spesa — e non
   viene sparso altrove: il lusso è dire poche cose con calma.

   L'unica stanza scura è l'atelier: la borsa sta sotto un faro caldo e i
   comandi le fanno cerchio su lastre di vetro fumé. Il contrasto fra la
   pagina chiara e la sala buia è il momento di teatro della demo.

   Nota tecnica: questo CSS vive in un template literal, quindi dentro i
   commenti non compaiono apici inversi — hanno già rotto la build due volte.
══════════════════════════════════════════════════════════════════════════ */

export const AT_SANS = "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
export const AT_SERIF = "'Fraunces', 'Iowan Old Style', Georgia, 'Times New Roman', serif"

export const ATELIER_CSS = `
  .at-root {
    --porcellana: #F6F4EF;
    --carta: #FFFFFF;
    --grafite: #1B1916;
    --fumo: #6C675F;
    --cenere: #9B958A;
    --filo: rgba(27, 25, 22, 0.1);
    --cognac: #9A5B2E;

    --sala: #17140F;
    --sala-2: #221D15;
    --avorio-caldo: #F3EEE2;
    --sabbia: #B3A995;
    --vetro-scuro: rgba(30, 26, 20, 0.52);
    --filo-chiaro: rgba(243, 238, 226, 0.13);

    font-family: ${AT_SANS};
    color: var(--grafite);
    background: var(--porcellana);
    -webkit-font-smoothing: antialiased;
    font-synthesis: none;
  }
  .at-root *, .at-root *::before, .at-root *::after { box-sizing: border-box; }
  .at-root ::selection { background: rgba(154, 91, 46, 0.22); }
  .at-root button { font-family: inherit; }
  .at-root img, .at-root svg { display: block; }

  .at-serif { font-family: ${AT_SERIF}; }

  /* ── etichette maiuscole: il registro «couture» ── */
  .at-kicker {
    font-size: 10.5px; font-weight: 560; letter-spacing: 0.24em;
    text-transform: uppercase; color: var(--fumo);
  }

  /* ══ NAVIGAZIONE — vetro sulla pagina ══
     Sticky, non fixed: sopra questa pagina vive la barra «Torna al
     catalogo» della demo, e due barre fisse si contenderebbero lo stesso
     bordo. Così la barra della demo scorre via e la maison resta. */
  .at-nav {
    position: sticky; top: 0; z-index: 60;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
    height: 62px; padding: 0 26px;
    background: rgba(246, 244, 239, 0.82);
    backdrop-filter: blur(22px) saturate(1.5);
    -webkit-backdrop-filter: blur(22px) saturate(1.5);
    border-bottom: 1px solid var(--filo);
  }
  .at-nav-links { display: flex; gap: 24px; }
  .at-nav-link {
    background: none; border: none; padding: 4px 0; cursor: pointer;
    font-size: 12px; font-weight: 540; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--fumo); transition: color 0.2s ease;
  }
  .at-nav-link:hover { color: var(--grafite); }
  .at-brand { text-align: center; line-height: 1.05; user-select: none; }
  .at-brand-nome {
    font-family: ${AT_SERIF};
    font-size: 21px; font-weight: 620; letter-spacing: 0.16em; color: var(--grafite);
  }
  .at-brand-citta {
    display: block; font-size: 8.5px; font-weight: 600;
    letter-spacing: 0.5em; text-transform: uppercase; color: var(--cenere);
    margin-top: 2px; text-indent: 0.5em;
  }
  .at-nav-destra { display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
  .at-busta-btn {
    position: relative; display: inline-flex; align-items: center; gap: 8px;
    background: none; border: 1px solid transparent; border-radius: 999px;
    padding: 8px 14px; cursor: pointer;
    font-size: 12px; font-weight: 560; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--grafite); transition: border-color 0.2s ease, background 0.2s ease;
  }
  .at-busta-btn:hover { border-color: var(--filo); background: rgba(255, 255, 255, 0.55); }
  .at-badge {
    display: inline-grid; place-items: center; min-width: 18px; height: 18px;
    padding: 0 5px; border-radius: 999px;
    background: var(--grafite); color: var(--porcellana);
    font-size: 10.5px; font-weight: 650; font-variant-numeric: tabular-nums;
  }

  /* ══ HERO — porcellana e seta ══ */
  .at-hero {
    position: relative; min-height: calc(100svh - 62px); overflow: hidden;
    display: grid; align-items: center;
    padding: 40px 6vw 80px;
  }
  .at-seta {
    position: absolute; border-radius: 50%; filter: blur(90px);
    pointer-events: none; will-change: transform;
  }
  .at-seta-a { width: 54vw; height: 54vw; right: -12vw; top: -18vw;
    background: radial-gradient(circle at 40% 40%, rgba(206, 164, 122, 0.5), rgba(206, 164, 122, 0) 68%); }
  .at-seta-b { width: 44vw; height: 44vw; left: -16vw; bottom: -20vw;
    background: radial-gradient(circle at 60% 40%, rgba(179, 169, 149, 0.42), rgba(179, 169, 149, 0) 70%); }
  .at-hero-griglia {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 4vw; align-items: center; max-width: 1240px; margin: 0 auto; width: 100%;
  }
  .at-h1 {
    font-family: ${AT_SERIF};
    font-size: clamp(44px, 6.2vw, 84px); font-weight: 480; line-height: 1.02;
    letter-spacing: -0.015em; margin: 18px 0 22px; color: var(--grafite);
    text-wrap: balance;
  }
  .at-h1 em { font-style: italic; font-weight: 440; color: var(--cognac); }
  .at-hero-sub {
    font-size: 16.5px; line-height: 1.65; color: var(--fumo);
    max-width: 46ch; margin: 0 0 34px;
  }
  .at-hero-cta { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }

  .at-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    border-radius: 999px; border: 1px solid transparent; cursor: pointer;
    font-size: 13.5px; font-weight: 580; letter-spacing: 0.02em;
    padding: 15px 30px; transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
  }
  .at-btn:active { transform: scale(0.98); }
  .at-btn--nero {
    background: var(--grafite); color: var(--porcellana);
    box-shadow: 0 10px 26px rgba(27, 25, 22, 0.22);
  }
  .at-btn--nero:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(27, 25, 22, 0.28); }
  .at-btn--filo {
    background: transparent; color: var(--grafite); border-color: rgba(27, 25, 22, 0.25);
  }
  .at-btn--filo:hover { border-color: var(--grafite); background: rgba(255, 255, 255, 0.5); }

  .at-hero-scena { position: relative; display: grid; place-items: center; min-height: 380px; }
  .at-hero-borsa { position: relative; z-index: 1; width: min(78%, 380px); }
  .at-hero-ombra {
    position: absolute; bottom: 6%; left: 50%; transform: translateX(-50%);
    width: 58%; height: 34px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(27, 25, 22, 0.28), rgba(27, 25, 22, 0) 70%);
    filter: blur(6px);
  }
  .at-hero-targa {
    position: absolute; z-index: 2; right: 2%; bottom: 14%;
    display: flex; flex-direction: column; gap: 3px;
    padding: 13px 18px; border-radius: 16px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(18px) saturate(1.4); -webkit-backdrop-filter: blur(18px) saturate(1.4);
    border: 1px solid rgba(255, 255, 255, 0.75);
    box-shadow: 0 12px 30px rgba(27, 25, 22, 0.1);
  }
  .at-hero-targa strong { font-family: ${AT_SERIF}; font-size: 15px; font-weight: 600; }
  .at-hero-targa span { font-size: 11.5px; color: var(--fumo); }

  .at-scorri {
    position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%);
    font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--cenere);
  }

  /* ══ FASCIA — le tre promesse ══ */
  .at-fascia {
    background: var(--sala); color: var(--sabbia);
    display: flex; justify-content: center; gap: clamp(24px, 6vw, 90px);
    padding: 15px 24px; flex-wrap: wrap;
  }
  .at-fascia span {
    font-size: 10.5px; font-weight: 560; letter-spacing: 0.22em; text-transform: uppercase;
    white-space: nowrap;
  }

  /* ══ COLLEZIONE ══ */
  .at-collezione { padding: clamp(70px, 9vw, 120px) 6vw; max-width: 1240px; margin: 0 auto; }
  .at-sez-testa { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 42px; }
  .at-h2 {
    font-family: ${AT_SERIF};
    font-size: clamp(30px, 3.6vw, 46px); font-weight: 500; letter-spacing: -0.01em;
    line-height: 1.08; margin: 12px 0 0;
  }
  .at-sez-nota { font-size: 13.5px; color: var(--fumo); max-width: 34ch; text-align: right; line-height: 1.55; }

  .at-griglia-prodotti {
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px;
  }
  .at-prodotto {
    position: relative; display: flex; flex-direction: column;
    background: var(--carta); border-radius: 22px; overflow: hidden;
    border: 1px solid rgba(27, 25, 22, 0.06);
    box-shadow: 0 2px 10px rgba(27, 25, 22, 0.05);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .at-prodotto:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(27, 25, 22, 0.12); }
  .at-prod-scena {
    position: relative; aspect-ratio: 1 / 1.06; display: grid; place-items: center;
    overflow: hidden;
  }
  .at-prod-scena svg { width: 68%; height: auto; transition: transform 0.4s cubic-bezier(0.2, 0.6, 0.2, 1); }
  .at-prodotto:hover .at-prod-scena svg { transform: scale(1.05) rotate(-1.2deg); }
  .at-prod-corpo { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .at-prod-nome { font-family: ${AT_SERIF}; font-size: 17px; font-weight: 580; }
  .at-prod-materia { font-size: 12px; color: var(--fumo); }
  .at-prod-piede { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
  .at-prod-prezzo { font-size: 14px; font-weight: 620; font-variant-numeric: tabular-nums; }
  .at-prod-aggiungi {
    border: 1px solid rgba(27, 25, 22, 0.22); background: transparent; color: var(--grafite);
    border-radius: 999px; padding: 8px 16px; font-size: 12px; font-weight: 580; cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  }
  .at-prod-aggiungi:hover { background: var(--grafite); border-color: var(--grafite); color: var(--porcellana); }

  /* ══ ATELIER — la sala scura ══ */
  .at-atelier {
    position: relative; overflow: hidden;
    background:
      radial-gradient(1100px 620px at 50% 8%, rgba(214, 168, 110, 0.16), rgba(214, 168, 110, 0) 60%),
      linear-gradient(180deg, var(--sala-2), var(--sala) 55%);
    color: var(--avorio-caldo);
    padding: clamp(70px, 8vw, 110px) 5vw clamp(80px, 9vw, 130px);
  }
  .at-atelier .at-kicker { color: var(--sabbia); }
  .at-atelier-testa { text-align: center; max-width: 640px; margin: 0 auto clamp(40px, 5vw, 70px); }
  .at-atelier-testa .at-h2 { color: var(--avorio-caldo); }
  .at-atelier-testa p { font-size: 15px; line-height: 1.65; color: var(--sabbia); margin: 16px 0 0; }

  .at-sala {
    display: grid; grid-template-columns: minmax(250px, 300px) minmax(0, 1fr) minmax(280px, 330px);
    gap: clamp(18px, 2.6vw, 34px); align-items: stretch;
    max-width: 1280px; margin: 0 auto;
  }

  /* il teatro con la borsa */
  .at-teatro {
    position: relative; display: grid; place-items: center;
    min-height: 480px; border-radius: 28px; overflow: hidden;
    background:
      radial-gradient(640px 420px at 50% 28%, rgba(233, 196, 138, 0.2), rgba(233, 196, 138, 0) 62%),
      radial-gradient(900px 700px at 50% 110%, rgba(12, 10, 7, 0.9), rgba(12, 10, 7, 0) 60%),
      linear-gradient(180deg, #262019, #191510 70%);
    border: 1px solid var(--filo-chiaro);
    touch-action: none;
  }
  .at-teatro-borsa { position: relative; z-index: 2; width: min(58%, 330px); will-change: transform; }
  .at-teatro-ombra {
    position: absolute; z-index: 1; bottom: 11%; left: 50%; transform: translateX(-50%);
    width: 52%; height: 40px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0) 70%);
    filter: blur(8px);
  }
  .at-teatro-luce {
    position: absolute; inset: 0; z-index: 3; pointer-events: none; mix-blend-mode: soft-light;
  }
  .at-teatro-hint {
    position: absolute; z-index: 4; bottom: 16px; left: 0; right: 0; text-align: center;
    font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(179, 169, 149, 0.75);
    pointer-events: none;
  }
  .at-teatro-prezzo {
    position: absolute; z-index: 4; top: 18px; right: 18px;
    padding: 10px 16px; border-radius: 14px; text-align: right;
    background: var(--vetro-scuro);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--filo-chiaro);
  }
  .at-teatro-prezzo small { display: block; font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--sabbia); margin-bottom: 3px; }
  .at-teatro-prezzo strong { font-family: ${AT_SERIF}; font-size: 22px; font-weight: 560; font-variant-numeric: tabular-nums; }

  /* i pannelli di vetro fumé */
  .at-pannello {
    display: flex; flex-direction: column; gap: 22px;
    padding: 24px; border-radius: 24px;
    background: var(--vetro-scuro);
    backdrop-filter: blur(20px) saturate(1.3); -webkit-backdrop-filter: blur(20px) saturate(1.3);
    border: 1px solid var(--filo-chiaro);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  }
  .at-campo { display: flex; flex-direction: column; gap: 11px; }
  .at-campo-testa { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .at-campo-nome { font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--sabbia); }
  .at-campo-valore { font-size: 12.5px; color: var(--avorio-caldo); }
  .at-campo-extra { font-size: 11.5px; color: var(--sabbia); font-variant-numeric: tabular-nums; }

  .at-swatches { display: flex; gap: 10px; flex-wrap: wrap; }
  .at-swatch {
    position: relative; width: 38px; height: 38px; border-radius: 50%;
    border: 2px solid transparent; padding: 0; cursor: pointer;
    background: transparent;
    transition: transform 0.15s ease;
  }
  .at-swatch::after {
    content: ""; position: absolute; inset: 3px; border-radius: 50%;
    background: var(--sw, #888);
    box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.22), inset 0 -3px 6px rgba(0, 0, 0, 0.3);
  }
  .at-swatch:hover { transform: scale(1.08); }
  .at-swatch[data-on="true"] { border-color: var(--avorio-caldo); }

  .at-segmenti { display: flex; gap: 8px; }
  .at-segmento {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 11px 8px; border-radius: 14px; cursor: pointer;
    background: rgba(243, 238, 226, 0.05);
    border: 1px solid var(--filo-chiaro); color: var(--avorio-caldo);
    transition: background 0.18s ease, border-color 0.18s ease;
  }
  .at-segmento:hover { background: rgba(243, 238, 226, 0.1); }
  .at-segmento[data-on="true"] { background: rgba(243, 238, 226, 0.14); border-color: rgba(243, 238, 226, 0.5); }
  .at-segmento b { font-size: 13px; font-weight: 620; }
  .at-segmento small { font-size: 10px; color: var(--sabbia); font-variant-numeric: tabular-nums; }

  .at-monogramma { display: flex; align-items: center; gap: 12px; }
  .at-monogramma input {
    width: 96px; padding: 11px 14px; border-radius: 12px;
    background: rgba(243, 238, 226, 0.07); border: 1px solid var(--filo-chiaro);
    color: var(--avorio-caldo); font-family: ${AT_SERIF}; font-size: 17px; font-style: italic;
    letter-spacing: 0.22em; text-transform: uppercase; outline: none; text-align: center;
    transition: border-color 0.18s ease;
  }
  .at-monogramma input:focus { border-color: rgba(243, 238, 226, 0.45); }
  .at-monogramma input::placeholder { color: rgba(179, 169, 149, 0.55); letter-spacing: 0.22em; }
  .at-monogramma span { font-size: 11.5px; color: var(--sabbia); line-height: 1.5; }

  .at-conto { border-top: 1px solid var(--filo-chiaro); padding-top: 18px; display: flex; flex-direction: column; gap: 8px; }
  .at-conto-riga { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--sabbia); font-variant-numeric: tabular-nums; }
  .at-conto-riga.tot { color: var(--avorio-caldo); font-size: 14px; font-weight: 620; margin-top: 4px; }
  .at-btn--avorio {
    background: var(--avorio-caldo); color: var(--sala); width: 100%;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  }
  .at-btn--avorio:hover { transform: translateY(-1px); box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45); }
  .at-atelier-nota { margin: 10px 0 0; font-size: 11px; color: rgba(179, 169, 149, 0.8); text-align: center; line-height: 1.5; }

  /* ══ FOOTER ══ */
  .at-piede {
    padding: clamp(50px, 7vw, 90px) 6vw 46px; text-align: center;
    border-top: 1px solid var(--filo);
  }
  .at-piede .at-brand-nome { font-size: 26px; }
  .at-piede p { font-size: 12.5px; color: var(--fumo); margin: 16px auto 0; max-width: 52ch; line-height: 1.6; }

  /* ══ LA BUSTA — cassetto di vetro ══ */
  .at-velo {
    position: fixed; inset: 0; z-index: 80;
    background: rgba(23, 20, 15, 0.4);
    backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
  }
  .at-cassetto {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 90;
    width: min(430px, 100vw);
    display: flex; flex-direction: column;
    /* Quasi opaco: dove il backdrop-filter manca (vecchi Firefox) un 0.88
       lasciava leggere la pagina ATTRAVERSO la busta — sembrava un difetto,
       non un vetro. Il blur, dove c'è, lavora sul bordo comunque. */
    background: rgba(250, 249, 245, 0.96);
    backdrop-filter: blur(28px) saturate(1.5); -webkit-backdrop-filter: blur(28px) saturate(1.5);
    border-left: 1px solid rgba(255, 255, 255, 0.7);
    box-shadow: -30px 0 80px rgba(27, 25, 22, 0.25);
  }
  .at-cassetto-testa {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--filo);
  }
  .at-cassetto-titolo { font-family: ${AT_SERIF}; font-size: 20px; font-weight: 580; }
  .at-cassetto-titolo small { font-family: ${AT_SANS}; font-size: 12px; color: var(--fumo); margin-left: 8px; font-variant-numeric: tabular-nums; }
  .at-chiudi {
    display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%;
    background: none; border: 1px solid var(--filo); color: var(--fumo); cursor: pointer;
    transition: color 0.18s ease, border-color 0.18s ease;
  }
  .at-chiudi:hover { color: var(--grafite); border-color: var(--grafite); }

  .at-cassetto-corpo { flex: 1; overflow-y: auto; padding: 10px 24px; }
  .at-riga { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--filo); }
  .at-riga-thumb {
    width: 64px; height: 64px; flex: none; border-radius: 14px; display: grid; place-items: center;
    background: linear-gradient(160deg, #EFEBE2, #E2DCCE);
    border: 1px solid rgba(27, 25, 22, 0.06);
  }
  .at-riga-thumb svg { width: 72%; height: auto; }
  .at-riga-corpo { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .at-riga-nome { font-family: ${AT_SERIF}; font-size: 15px; font-weight: 580; }
  .at-riga-dett { font-size: 11.5px; color: var(--fumo); line-height: 1.45; }
  .at-riga-piede { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
  .at-qty { display: inline-flex; align-items: center; gap: 2px; border: 1px solid var(--filo); border-radius: 999px; padding: 2px; }
  .at-qty button {
    display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%;
    background: none; border: none; color: var(--fumo); cursor: pointer; font-size: 14px; line-height: 1;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .at-qty button:hover { background: var(--grafite); color: var(--porcellana); }
  .at-qty b { min-width: 20px; text-align: center; font-size: 12.5px; font-variant-numeric: tabular-nums; }
  .at-riga-prezzo { font-size: 13.5px; font-weight: 620; font-variant-numeric: tabular-nums; }
  .at-rimuovi {
    background: none; border: none; padding: 2px 0; cursor: pointer; align-self: flex-start;
    font-size: 11px; color: var(--cenere); text-decoration: underline; text-underline-offset: 2px;
  }
  .at-rimuovi:hover { color: var(--grafite); }

  .at-vuota { display: grid; place-items: center; gap: 16px; text-align: center; padding: 70px 20px; }
  .at-vuota p { font-family: ${AT_SERIF}; font-size: 19px; margin: 0; }
  .at-vuota span { font-size: 12.5px; color: var(--fumo); }

  .at-cassa { padding: 18px 24px 24px; border-top: 1px solid var(--filo); background: rgba(255, 255, 255, 0.55); }
  .at-cassa-riga { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; color: var(--fumo); padding: 3px 0; }
  .at-cassa-riga.tot { font-size: 15px; color: var(--grafite); font-weight: 640; padding-top: 8px; }
  .at-cassa-riga .at-serif { font-size: 21px; font-weight: 580; font-variant-numeric: tabular-nums; }

  .at-express { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0 4px; }
  .at-pay {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    height: 46px; border-radius: 12px; cursor: pointer;
    font-size: 15px; font-weight: 600; letter-spacing: -0.01em;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .at-pay:active { transform: scale(0.98); }
  .at-pay--apple { background: #000; color: #fff; border: 1px solid #000; }
  .at-pay--apple:hover { opacity: 0.85; }
  .at-pay--google { background: #fff; color: #1b1916; border: 1px solid rgba(27, 25, 22, 0.28); }
  .at-pay--google:hover { border-color: var(--grafite); }
  .at-oppure {
    display: flex; align-items: center; gap: 12px; margin: 12px 0;
    font-size: 10.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--cenere);
  }
  .at-oppure::before, .at-oppure::after { content: ""; flex: 1; height: 1px; background: var(--filo); }
  .at-cassa-nota { margin: 12px 0 0; font-size: 10.5px; color: var(--cenere); text-align: center; line-height: 1.5; }

  /* ── i dati, versione da pollice: pochi campi, grandi ── */
  .at-dati { display: flex; flex-direction: column; gap: 10px; padding: 16px 24px; }
  .at-dati label { display: flex; flex-direction: column; gap: 5px; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fumo); }
  .at-dati input {
    padding: 13px 14px; border-radius: 12px; border: 1px solid rgba(27, 25, 22, 0.16);
    background: #fff; font-family: ${AT_SANS}; font-size: 15px; color: var(--grafite); outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .at-dati input:focus { border-color: var(--grafite); box-shadow: 0 0 0 3px rgba(27, 25, 22, 0.08); }
  .at-dati-fila { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .at-indietro {
    background: none; border: none; padding: 4px 0; cursor: pointer; align-self: flex-start;
    font-size: 12px; color: var(--fumo); text-decoration: underline; text-underline-offset: 3px;
  }
  .at-indietro:hover { color: var(--grafite); }

  /* ── il foglio di pagamento: la recita del wallet ── */
  .at-foglio-velo { position: fixed; inset: 0; z-index: 110; background: rgba(0, 0, 0, 0.45); display: grid; place-items: end center; }
  .at-foglio {
    width: min(400px, calc(100vw - 24px)); margin-bottom: 18px;
    border-radius: 24px; padding: 22px 22px 26px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(30px) saturate(1.6); -webkit-backdrop-filter: blur(30px) saturate(1.6);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  }
  .at-foglio-testa { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .at-foglio-testa b { font-size: 14px; }
  .at-foglio-testa span { font-size: 11px; color: var(--cenere); }
  .at-foglio-riga { display: flex; justify-content: space-between; padding: 9px 0; font-size: 13px; color: var(--fumo); border-top: 1px solid var(--filo); }
  .at-foglio-riga.tot { color: var(--grafite); font-weight: 640; font-size: 15px; }
  .at-foglio-stato { display: grid; place-items: center; gap: 10px; padding: 22px 0 6px; text-align: center; }
  .at-foglio-stato p { margin: 0; font-size: 12.5px; color: var(--fumo); }

  /* ── ordine confermato ── */
  .at-fatto { display: grid; place-items: center; gap: 6px; text-align: center; padding: 46px 28px; }
  .at-fatto-cerchio {
    width: 74px; height: 74px; border-radius: 50%; display: grid; place-items: center;
    background: var(--grafite); color: var(--porcellana); margin-bottom: 14px;
    box-shadow: 0 18px 44px rgba(27, 25, 22, 0.3);
  }
  .at-fatto h3 { font-family: ${AT_SERIF}; font-size: 30px; font-weight: 520; margin: 0; }
  .at-fatto-ordine {
    font-size: 12px; letter-spacing: 0.14em; color: var(--fumo);
    font-variant-numeric: tabular-nums; margin-top: 6px;
  }
  .at-fatto p { font-size: 13px; color: var(--fumo); line-height: 1.6; margin: 14px 0 22px; max-width: 30ch; }

  /* ══ RESPONSIVE ══ */
  @media (max-width: 1080px) {
    .at-sala { grid-template-columns: 1fr 1fr; }
    .at-teatro { grid-column: 1 / -1; order: -1; min-height: 420px; }
  }
  @media (max-width: 860px) {
    .at-nav { grid-template-columns: auto 1fr auto; padding: 0 16px; }
    .at-nav-links { display: none; }
    .at-brand { text-align: left; }
    .at-hero { padding-top: 26px; }
    .at-hero-griglia { grid-template-columns: 1fr; gap: 30px; }
    .at-hero-scena { min-height: 300px; order: 2; }
    .at-hero-borsa { width: min(64%, 300px); }
    .at-griglia-prodotti { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .at-sez-testa { flex-direction: column; align-items: flex-start; }
    .at-sez-nota { text-align: left; }
  }
  @media (max-width: 700px) {
    .at-sala { grid-template-columns: 1fr; }
    .at-busta-btn span.at-busta-parola { display: none; }
  }
  @media (max-width: 460px) {
    .at-griglia-prodotti { grid-template-columns: 1fr; }
    .at-express { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .at-root *, .at-root *::before, .at-root *::after { transition-duration: 0.01ms !important; }
  }
`
