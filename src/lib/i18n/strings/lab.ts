import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   IL LAB (/foundry): la libreria di soluzioni e componenti.
   Comprende la pagina, la barra dei filtri, le schede e l'anteprima.

   Le categorie sono chiavi tecniche in inglese ("B2B Portals") e restano
   tali nei dati: qui c'è solo come si chiamano a schermo.
══════════════════════════════════════════════════════════════════════════ */

const it = {
  page: {
    kicker: "[ Digital Foundry · Sandbox ]",
    title1: "Costruisci il tuo",
    title2: "progetto ideale",
    lead: "Esplora la libreria di soluzioni e componenti. Seleziona ciò che ti serve, salvalo nel Blueprint e ricevi un'offerta su misura.",
    /** "{n} soluzioni disponibili" */
    count: "{n} soluzioni disponibili",
    emptyTag: "[ 0 risultati ]",
    empty: "Nessun risultato per i filtri selezionati.",
  },

  filters: {
    categoryLabel: "Categoria",
    typeLabel: "Tipo",
    blueprint: "Blueprint",
    categories: {
      "All": "Tutte",
      "B2B Portals": "Portali B2B",
      "E-commerce & Shopify": "E-commerce & Shopify",
      "Landing Pages": "Landing Page",
      "UI Components": "Componenti UI",
    },
    /** Etichette corte per la barra orizzontale su schermo stretto. */
    categoriesShort: {
      "All": "Tutte",
      "B2B Portals": "B2B",
      "E-commerce & Shopify": "E-com",
      "Landing Pages": "Landing",
      "UI Components": "UI",
    },
    types: {
      all: "Tutti",
      "full-site": "Sito completo",
      component: "Componente",
    },
    /** La stessa scelta, accorciata dove lo spazio è quello di un pulsante. */
    typesShort: {
      all: "Tutti",
      "full-site": "Sito",
      component: "Comp.",
    },
  },

  card: {
    fullSite: "Sito completo",
    component: "Componente",
    preview: "Anteprima di {title}",
    previewOverlay: "Anteprima · {title}",
    closePreview: "Chiudi anteprima",
    added: "✓ Aggiunto",
    remove: "Rimuovi",
    blueprint: "Blueprint",
  },

  /* Le voci della libreria: titolo e descrizione. Categoria, tecnologie e
     colore restano in data/sandboxData.ts, che è la struttura. */
  items: {
    "b2b-supplier-portal": {
      title: "Supplier Portal",
      description: "Catalogo, ordini e fatturazione B2B: i prezzi si calcolano da soli dai costi dei fornitori.",
    },
    "b2b-crm-dashboard": {
      title: "CRM Dashboard",
      description: "Pipeline visuale, anagrafica clienti e report esportabili in PDF.",
    },
    "b2b-onboarding-kyc": {
      title: "Onboarding & KYC",
      description: "Flusso multistep con partita IVA verificata col checksum, caricamento documenti e stati di errore gestiti.",
    },
    "b2b-preventivo-roi": {
      title: "Preventivo & ROI",
      description: "Configuratore dove le scelte si vincolano: la piattaforma cambia i prezzi dei moduli, il ritorno si calcola sui tuoi numeri, l'ordine esce in JSON.",
    },
    "b2b-regia-operativa": {
      title: "Regia operativa",
      description: "Torre di controllo per l'e-commerce: la coda ordini scorre in diretta, le eccezioni si risolvono con un clic e un ordine attraversa il nastro sotto i tuoi occhi.",
    },
    "b2b-distributor-hub": {
      title: "Distributor Hub",
      description: "Gestione agenti, listini per area geografica e ordini white-label.",
    },
    "shopify-luxury-fashion": {
      title: "Luxury Fashion Store",
      description: "La boutique di una maison: borsa configurabile in cinque pelli con le iniziali impresse, busta di vetro e cassa da pollice con i wallet simulati.",
    },
    "shopify-b2b-wholesale": {
      title: "Wholesale B2B Shop",
      description: "Prezzi per volume, listini multipli e ordini ricorrenti, con ERP collegato.",
    },
    "ecommerce-headless": {
      title: "Headless Commerce",
      description: "Headless su Next.js e Shopify: performance al limite e SEO nativa.",
    },
    "landing-saas-launch": {
      title: "SaaS Launch Page",
      description: "Pagina di lancio di vetro smerigliato su fondo notte, con il widget di accesso che funziona davvero e si riveste del tuo marchio.",
    },
    "landing-event-conference": {
      title: "Event & Conference",
      description: "Countdown live, agenda interattiva e registrazione biglietti.",
    },
    "landing-product-reveal": {
      title: "Product Reveal",
      description: "Scroll storytelling, parallasse e video background per il lancio prodotto.",
    },
    "ui-glass-nav": {
      title: "Glass Navigation System",
      description: "Header e menu glassmorphism, con megamenu e sezione attiva sullo scroll.",
    },
    "ui-data-table": {
      title: "Advanced Data Table",
      description: "Tabella enterprise con filtri avanzati, paginazione ed export CSV/Excel.",
    },
    "ui-form-wizard": {
      title: "Multi-Step Form Wizard",
      description: "Wizard multi-step con validazione in tempo reale e bozza salvata in automatico.",
    },
    "ui-dashboard-widgets": {
      title: "KPI Dashboard Widgets",
      description: "Widget da dashboard — sparkline, trend, heatmap — riordinabili col drag-and-drop.",
    },
  },
}

const en: typeof it = {
  page: {
    kicker: "[ Digital Foundry · Sandbox ]",
    title1: "Build your",
    title2: "ideal project",
    lead: "Explore the library of solutions and components. Pick what you need, save it to the Blueprint and get a tailored proposal.",
    count: "{n} solutions available",
    emptyTag: "[ 0 results ]",
    empty: "No results for the selected filters.",
  },

  filters: {
    categoryLabel: "Category",
    typeLabel: "Type",
    blueprint: "Blueprint",
    categories: {
      "All": "All",
      "B2B Portals": "B2B Portals",
      "E-commerce & Shopify": "E-commerce & Shopify",
      "Landing Pages": "Landing Pages",
      "UI Components": "UI Components",
    },
    categoriesShort: {
      "All": "All",
      "B2B Portals": "B2B",
      "E-commerce & Shopify": "E-com",
      "Landing Pages": "Landing",
      "UI Components": "UI",
    },
    types: {
      all: "All",
      "full-site": "Full site",
      component: "Component",
    },
    typesShort: {
      all: "All",
      "full-site": "Site",
      component: "Comp.",
    },
  },

  card: {
    fullSite: "Full site",
    component: "Component",
    preview: "Preview of {title}",
    previewOverlay: "Preview · {title}",
    closePreview: "Close preview",
    added: "✓ Added",
    remove: "Remove",
    blueprint: "Blueprint",
  },

  items: {
    "b2b-supplier-portal": {
      title: "Supplier Portal",
      description: "B2B catalogue, orders and invoicing: prices compute themselves from supplier costs.",
    },
    "b2b-crm-dashboard": {
      title: "CRM Dashboard",
      description: "Visual pipeline, customer records and reports exportable to PDF.",
    },
    "b2b-onboarding-kyc": {
      title: "Onboarding & KYC",
      description: "A multi-step flow with checksum-verified VAT numbers, document upload and handled error states.",
    },
    "b2b-preventivo-roi": {
      title: "Quote & ROI engine",
      description: "A configurator where choices constrain each other: the platform reprices the modules, the return is computed on your own numbers, the order comes out as JSON.",
    },
    "b2b-regia-operativa": {
      title: "Ops mission control",
      description: "A control tower for e-commerce: the order queue streams live, exceptions resolve with one click and an order runs the pipeline before your eyes.",
    },
    "b2b-distributor-hub": {
      title: "Distributor Hub",
      description: "Agent management, price lists by territory and white-label orders.",
    },
    "shopify-luxury-fashion": {
      title: "Luxury Fashion Store",
      description: "A maison's boutique: a bag configurable in five leathers with hot-stamped initials, a frosted-glass cart and a thumb-first checkout with simulated wallets.",
    },
    "shopify-b2b-wholesale": {
      title: "Wholesale B2B Shop",
      description: "Volume pricing, multiple price lists and recurring orders, with the ERP connected.",
    },
    "ecommerce-headless": {
      title: "Headless Commerce",
      description: "Headless on Next.js and Shopify: performance at the limit and SEO built in.",
    },
    "landing-saas-launch": {
      title: "SaaS Launch Page",
      description: "A frosted-glass launch page on a midnight canvas, with a sign-in widget that actually works and rebrands itself live.",
    },
    "landing-event-conference": {
      title: "Event & Conference",
      description: "Live countdown, interactive agenda and ticket registration.",
    },
    "landing-product-reveal": {
      title: "Product Reveal",
      description: "Scroll storytelling, parallax and a video background for the product launch.",
    },
    "ui-glass-nav": {
      title: "Glass Navigation System",
      description: "Glassmorphism header and menu, with a megamenu and the active section tracked on scroll.",
    },
    "ui-data-table": {
      title: "Advanced Data Table",
      description: "An enterprise table with advanced filters, pagination and CSV/Excel export.",
    },
    "ui-form-wizard": {
      title: "Multi-Step Form Wizard",
      description: "A multi-step wizard with real-time validation and an automatically saved draft.",
    },
    "ui-dashboard-widgets": {
      title: "KPI Dashboard Widgets",
      description: "Dashboard widgets — sparklines, trends, heatmaps — reorderable by drag-and-drop.",
    },
  },
}

export const LAB_STR = { it, en } satisfies Bundle<typeof it>
