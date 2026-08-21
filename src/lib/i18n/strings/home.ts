import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   HOME (NadiaMaar_Lab.tsx).

   Titolo e sezioni restano nell'ordine dell'originale: problema → soluzioni →
   prova → processo → trasparenza → configuratore → contatto.

   Sull'inglese, due scelte di registro che valgono per tutto il sito:
   · si dà del "you" diretto come l'italiano dà del "tu": è uno studio, non
     un ufficio commerciale;
   · i termini di mestiere (Core Web Vitals, SKU, middleware, funnel) restano
     invariati — sono già inglesi anche nella versione italiana, tradurli
     renderebbe il testo meno preciso, non più leggibile.
══════════════════════════════════════════════════════════════════════════ */

const it = {
  hero: {
    eyebrow: "[ Development · Performance Marketing ]",
    figTag: "Fig. 01 — Identità",
    /* Il titolo è composto da quattro righe con trattamenti grafici diversi:
       l'ultima è in contorno vuoto. Tenerle separate serve al layout. */
    title1: "E‑commerce",
    title2: "Architect",
    title3: "Digital Strategist",
    desc: "Un'unica mente tra codice e business. Architetture digitali che scalano — senza intermediari, senza compromessi.",
    flow: ["Idea", "Strategia", "Esecuzione", "Risultato"],
    ctaPrimary: "Configura il Progetto",
    ctaSecondary: "Parliamo del Progetto",
    scroll: "Scorri ↓",
    availableAria: "Disponibile: apri il form di contatto",
    available: "Disponibile",
    responseTime: "Tempo di risposta",
    specFocusKey: "Focus",
    specFocusValue: "E-commerce · Growth",
    specStudioKey: "Studio",
    specStudioValue: "NM 2026",
    socialProof: "Tecnologie enterprise e brand che scalano con me:",
    /* Le due demo aperte, senza registrazione: la prova si tocca, non si
       racconta. `demos` si accoppia per posizione con DEMO_ART nel
       componente (id, colore, rotta). */
    demosKicker: "Prova, non promesse",
    demos: [
      { title: "Portale fornitori B2B", desc: "Ordini, fido, listini e fatture SdI — funzionante" },
      { title: "CRM di vendita", desc: "Pipeline, clienti e report PDF — funzionante" },
      { title: "Area clienti — entra come ospite", desc: "Un cabinet vero in sola lettura: la sicurezza è nel database" },
    ],
    demoCta: "Apri la demo",
    credit: "Studio © 2026",
  },

  diagnosi: {
    kicker: "[ Il Problema — La Diagnosi ]",
    title: "Sei bloccato in una di queste situazioni?",
    problemTag: "[ Problema ]",
    solutionTag: "[ Soluzione ]",
    items: [
      {
        problem: {
          title: "E-commerce inefficiente",
          body: "Cataloghi disconnessi, errori di magazzino e automatismi rotti. Perdi vendite ogni giorno senza saperlo.",
        },
        solution: {
          title: "Shopify Custom Automatizzato",
          body: "Sincronizzazione in tempo reale di stock, ordini e cataloghi con 30.000+ SKU. Zero errori manuali, conversioni al massimo.",
        },
      },
      {
        problem: {
          title: "Invisibilità su Google",
          body: "Traffico dipendente al 100% dalle Ads. Se smetti di pagare, i clienti spariscono. Nessuna rendita organica.",
        },
        solution: {
          title: "SEO Strutturale + Ads Scalabili",
          body: "Architettura SEO integrata nel codice dal giorno uno. Traffico organico che cresce in autonomia, campagne Google e Meta che amplificano il ROI.",
        },
      },
      {
        problem: {
          title: "Sito aziendale debole",
          body: "Presenza online lenta e obsoleta. I clienti premium valutano il tuo brand in 3 secondi — e scelgono il competitor.",
        },
        solution: {
          title: "Interfaccia Premium ad Alta Conversione",
          body: "Design d'élite in React/Next.js con Core Web Vitals al 100%. La prima impressione è impeccabile e converte clienti B2B di alto profilo.",
        },
      },
      {
        problem: {
          title: "Processi manuali e ripetitivi",
          body: "Il tuo team spreca ore su attività che un sistema intelligente farebbe in secondi. Costi operativi fuori controllo.",
        },
        solution: {
          title: "Automazione AI su Misura",
          body: "API, middleware e agenti AI che eliminano il lavoro ripetitivo. Il tuo team torna a fare ciò che conta davvero: crescita e strategia.",
        },
      },
    ],
  },

  soluzioni: {
    kicker: "[ Servizi ]",
    title: "Soluzioni ad Alta Ingegneria",
    /* La frase contiene un pezzo evidenziato: sta in tre parti perché in
       inglese l'inciso cade in un punto diverso della frase. */
    leadBefore: "Ogni soluzione è un servizio completo con la ",
    leadHighlight: "sua pagina dedicata",
    leadAfter: " — architettura, stack tecnologico e casi d'uso spiegati in dettaglio. Clicca su una card per esplorarla.",
    items: [
      {
        title: "E-commerce ad Alta Conversione",
        desc: "Negozi online veloci, stabili e scalabili. Automazione totale di magazzini, cataloghi massivi e logistica.",
        cta: "Ottimizza il tuo E-commerce",
      },
      {
        title: "Applicazioni Web & Automazione Custom",
        desc: "Software e strumenti di produttività su misura. Connettiamo i tuoi sistemi (CRM/ERP) per eliminare l'errore umano.",
        cta: "Automatizza i tuoi Processi",
      },
      {
        title: "Integrazione AI & Sistemi Intelligenti",
        desc: "Soluzioni pratiche basate su Intelligenza Artificiale (Agenti AI, LLM). Abbattiamo i costi di gestione e ottimizziamo la routine.",
        cta: "Innova con l'AI",
      },
      {
        title: "SEO Strutturale & Performance",
        desc: "Posizionamento organico integrato nel codice fin dal primo giorno. Scaliamo Google per intercettare traffico pronto a comprare.",
        cta: "Scala le Classifiche",
      },
      {
        title: "Corporate & Lead Generation",
        desc: "Presenza digitale premium in React/Next.js: interfacce ad alte performance, Core Web Vitals ottimizzati e funnel di acquisizione pensati per generare lead qualificati.",
        cta: "Potenzia il tuo Brand",
      },
    ],
  },

  cases: {
    kicker: "[ Casi Studio ]",
    title1: "Progetti ",
    title2: "Soluzioni",
    lead: "Dall'obiettivo all'impatto: come risolviamo sfide tecniche complesse.",
    cta: "Scopri tutti i progetti",
    caseLabel: "CASE",
    resultLabel: "RISULTATO",
    items: [
      {
        cat: "CIVIC TECH · OPEN-GOV · SAAS",
        title: "Piattaforma Civica Regionale",
        metric: "131 Sub-Admin gestiti · dati isolati con RLS",
        desc: "Architettura multi-ruolo su Supabase — Super Admin, 131 Sub-Admin e cabinet cliente — con progetti di donazione e bandi per giovani startup.",
      },
      {
        cat: "E-COMMERCE · SHOPIFY PLUS",
        title: "E-Commerce Enterprise",
        metric: "32.000+ SKU senza latenza · TTI < 1.4s",
        desc: "Piattaforma Shopify Plus scalabile: catalogo 32.000+ SKU, Core Web Vitals ottimizzati e architettura multi-country europea (OSS).",
      },
      {
        cat: "MIDDLEWARE · AUTOMAZIONE B2B",
        title: "Middleware di Automazione Logistica",
        metric: "Uptime 99.9% · ordini processati in < 3s",
        desc: "Software di sincronizzazione stock in tempo reale, architettura fault-tolerant a doppia scrittura e uptime del servizio del 99.9%.",
      },
    ],
  },

  processo: {
    kicker: "[ Il Processo ]",
    title: "Quattro fasi, nessuna sorpresa",
    lead: "Dal primo confronto al monitoraggio dopo il lancio: ogni fase ha una durata dichiarata e un esito verificabile.",
    detail: "Il processo in dettaglio",
  },

  cabinet: {
    kicker: "Lavoro Trasparente",
    title1: "Una roadmap",
    title2: "trasparente,",
    title3: "gestita dal tuo",
    title4: "Cabinet",
    bodyBefore: "Contratti, invoice e stato di ogni attività sono visibili in tempo reale nel tuo ",
    bodyHighlight: "Area Clienti",
    bodyAfter: " privato. Zero sorprese, zero perdita di controllo: segui l'avanzamento del progetto fase per fase.",
    counterLabel1: "fasi · processo",
    counterLabel2: "completo",
    steps: [
      { label: "FASE 1", title: "Analisi Tecnica e di Business", body: "Non inizio a scrivere codice senza una strategia. Analizzo il tuo modello di business, i competitor e i flussi logistici per mappare lo stack tecnologico perfetto in base ai tuoi obiettivi commerciali." },
      { label: "FASE 2", title: "UI/UX Design & Sviluppo", body: "Progetto l'interfaccia focalizzandomi sulla User Experience. Sviluppo l'infrastruttura garantendo velocità di caricamento massime, sicurezza e un design sartoriale studiato sul target." },
      { label: "FASE 3", title: "Ingegnerizzazione & Sincronizzazione API", body: "Collego i sistemi di fornitori e gestionali. Automatizzo l'aggiornamento in tempo reale di scorte, prezzi e ordini. Configuro l'AI per ottimizzare il catalogo ed eliminare i processi manuali." },
      { label: "FASE 4", title: "Lancio, Tracking & Growth Marketing", body: "Configuro i pixel di tracciamento e attivo i canali di acquisizione (SEO, Adv, Social). Monitoro i dati in tempo reale per ottimizzare il tasso di conversione (CRO) e scalare il fatturato." },
    ],
  },

  /* Etichette dentro i disegni SVG del carosello. Corte per forza: stanno
     dentro cerchi e riquadri di poche decine di pixel. */
  visuals: {
    topics: ["Mercato", "Stack Tech", "Obiettivi", "Competitor", "Logistica", "Budget"],
    supplier: "Fornitore",
    months: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug"],
  },

  contact: {
    kicker: "[ Parliamone ]",
    titleBefore: "Pronto a scalare il tuo ",
    titleHighlight: "ecosistema digitale?",
    lead: "Prenota un audit gratuito: analizziamo la tua architettura attuale, individuiamo i colli di bottiglia e ti consegniamo un piano d'azione chiaro, orientato ai numeri.",
    cta: "Prenota un Audit Gratuito",
  },

  modal: {
    kicker: "[ Richiesta Consulenza ]",
    title: "Descrivi il tuo blocco principale",
    name: "Nome",
    namePlaceholder: "Il tuo nome",
    email: "Email",
    emailPlaceholder: "email@azienda.it",
    site: "Sito Web",
    sitePlaceholder: "https://tuosito.it (opzionale)",
    area: "Cosa dobbiamo risolvere?",
    areaPlaceholder: "Seleziona un'area...",
    areas: [
      "E-commerce ad Alta Conversione",
      "Siti Corporate & Lead Generation",
      "Applicazioni Web & Automazione Custom",
      "SEO Strategico & Performance Marketing",
      "Integrazione AI & Sistemi Intelligenti",
    ],
    message: "Messaggio",
    messagePlaceholder: "Descrivi la situazione attuale e il risultato che vuoi ottenere...",
    /* `{email}` viene sostituito con l'indirizzo vero. */
    failed: "Invio non riuscito. Riprova, oppure scrivici a {email}",
    submit: "Invia Richiesta →",
    sentTitle: "Richiesta inviata!",
    sentBody: "Riceverai un piano d'azione chiaro entro 24 ore lavorative.",
    /* Etichette dei campi extra allegati al messaggio inviato. */
    extraSite: "Sito",
    extraArea: "Area",
  },
}

const en: typeof it = {
  hero: {
    eyebrow: "[ Development · Performance Marketing ]",
    figTag: "Fig. 01 — Identity",
    title1: "E‑commerce",
    title2: "Architect",
    title3: "Digital Strategist",
    desc: "One mind across code and business. Digital architectures that scale — no middlemen, no compromises.",
    flow: ["Idea", "Strategy", "Execution", "Result"],
    ctaPrimary: "Configure Your Project",
    ctaSecondary: "Let's Talk About It",
    scroll: "Scroll ↓",
    availableAria: "Available: open the contact form",
    available: "Available",
    responseTime: "Response time",
    specFocusKey: "Focus",
    specFocusValue: "E-commerce · Growth",
    specStudioKey: "Studio",
    specStudioValue: "NM 2026",
    socialProof: "Enterprise technologies and brands that scale with me:",
    demosKicker: "Proof, not promises",
    demos: [
      { title: "B2B supplier portal", desc: "Orders, credit limits, price lists and invoices — working" },
      { title: "Sales CRM", desc: "Pipeline, customers and PDF reports — working" },
      { title: "Client area — enter as a guest", desc: "A real cabinet in read-only mode: the security lives in the database" },
    ],
    demoCta: "Open the demo",
    credit: "Studio © 2026",
  },

  diagnosi: {
    kicker: "[ The Problem — The Diagnosis ]",
    title: "Are you stuck in one of these situations?",
    problemTag: "[ Problem ]",
    solutionTag: "[ Solution ]",
    items: [
      {
        problem: {
          title: "An inefficient e-commerce",
          body: "Disconnected catalogues, stock errors and broken automations. You lose sales every day without knowing it.",
        },
        solution: {
          title: "Automated custom Shopify",
          body: "Real-time sync of stock, orders and catalogues across 30,000+ SKUs. Zero manual errors, conversion at its peak.",
        },
      },
      {
        problem: {
          title: "Invisible on Google",
          body: "Traffic that depends 100% on ads. Stop paying and the customers disappear. No organic income stream.",
        },
        solution: {
          title: "Structural SEO + scalable ads",
          body: "SEO architecture built into the code from day one. Organic traffic that grows on its own, and Google and Meta campaigns that amplify ROI.",
        },
      },
      {
        problem: {
          title: "A weak company site",
          body: "A slow, dated online presence. Premium clients judge your brand in 3 seconds — and pick the competitor.",
        },
        solution: {
          title: "Premium high-conversion interface",
          body: "Elite design in React/Next.js with Core Web Vitals at 100%. The first impression is flawless and converts high-profile B2B clients.",
        },
      },
      {
        problem: {
          title: "Manual, repetitive processes",
          body: "Your team burns hours on work an intelligent system would do in seconds. Operating costs out of control.",
        },
        solution: {
          title: "Tailored AI automation",
          body: "APIs, middleware and AI agents that remove the repetitive work. Your team goes back to what actually matters: growth and strategy.",
        },
      },
    ],
  },

  soluzioni: {
    kicker: "[ Services ]",
    title: "High-engineering solutions",
    leadBefore: "Every solution is a full service with ",
    leadHighlight: "its own dedicated page",
    leadAfter: " — architecture, technology stack and use cases explained in detail. Click a card to explore it.",
    items: [
      {
        title: "High-conversion e-commerce",
        desc: "Online stores that are fast, stable and scalable. Full automation of warehouses, massive catalogues and logistics.",
        cta: "Optimise your e-commerce",
      },
      {
        title: "Web apps & custom automation",
        desc: "Tailor-made software and productivity tools. We connect your systems (CRM/ERP) to remove human error.",
        cta: "Automate your processes",
      },
      {
        title: "AI integration & intelligent systems",
        desc: "Practical solutions built on artificial intelligence (AI agents, LLMs). We cut running costs and streamline the routine.",
        cta: "Innovate with AI",
      },
      {
        title: "Structural SEO & performance",
        desc: "Organic ranking built into the code from the first day. We climb Google to capture traffic that is ready to buy.",
        cta: "Climb the rankings",
      },
      {
        title: "Corporate & lead generation",
        desc: "Premium digital presence in React/Next.js: high-performance interfaces, optimised Core Web Vitals and acquisition funnels designed to generate qualified leads.",
        cta: "Strengthen your brand",
      },
    ],
  },

  cases: {
    kicker: "[ Case Studies ]",
    title1: "Projects ",
    title2: "Solutions",
    lead: "From goal to impact: how we solve complex technical challenges.",
    cta: "See all projects",
    caseLabel: "CASE",
    resultLabel: "RESULT",
    items: [
      {
        cat: "CIVIC TECH · OPEN-GOV · SAAS",
        title: "Regional Civic Platform",
        metric: "131 sub-admins managed · data isolated with RLS",
        desc: "Multi-role architecture on Supabase — super admin, 131 sub-admins and a client cabinet — with donation projects and grant calls for young startups.",
      },
      {
        cat: "E-COMMERCE · SHOPIFY PLUS",
        title: "Enterprise E-Commerce",
        metric: "32,000+ SKUs with no latency · TTI < 1.4s",
        desc: "A scalable Shopify Plus platform: a 32,000+ SKU catalogue, optimised Core Web Vitals and a multi-country European architecture (OSS).",
      },
      {
        cat: "MIDDLEWARE · B2B AUTOMATION",
        title: "Logistics Automation Middleware",
        metric: "99.9% uptime · orders processed in < 3s",
        desc: "Real-time stock synchronisation software, a fault-tolerant dual-write architecture and 99.9% service uptime.",
      },
    ],
  },

  processo: {
    kicker: "[ The Process ]",
    title: "Four phases, no surprises",
    lead: "From the first conversation to post-launch monitoring: every phase has a stated duration and a verifiable outcome.",
    detail: "The process in detail",
  },

  cabinet: {
    kicker: "Transparent Work",
    title1: "A transparent",
    title2: "roadmap,",
    title3: "run from your",
    title4: "Cabinet",
    bodyBefore: "Contracts, invoices and the status of every task are visible in real time in your private ",
    bodyHighlight: "Client Area",
    bodyAfter: ". No surprises, no loss of control: follow the project phase by phase.",
    counterLabel1: "phases · complete",
    counterLabel2: "process",
    steps: [
      { label: "PHASE 1", title: "Technical and business analysis", body: "I don't start writing code without a strategy. I analyse your business model, your competitors and your logistics flows to map the right technology stack against your commercial goals." },
      { label: "PHASE 2", title: "UI/UX design & development", body: "I design the interface around user experience. I build the infrastructure for maximum loading speed, security and a bespoke design shaped on your audience." },
      { label: "PHASE 3", title: "Engineering & API synchronisation", body: "I connect supplier systems and management software. I automate real-time updates of stock, prices and orders. I set up AI to optimise the catalogue and remove manual work." },
      { label: "PHASE 4", title: "Launch, tracking & growth marketing", body: "I set up tracking pixels and switch on the acquisition channels (SEO, ads, social). I monitor the data in real time to optimise the conversion rate (CRO) and scale revenue." },
    ],
  },

  visuals: {
    topics: ["Market", "Tech Stack", "Goals", "Competitors", "Logistics", "Budget"],
    supplier: "Supplier",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  },

  contact: {
    kicker: "[ Let's Talk ]",
    titleBefore: "Ready to scale your ",
    titleHighlight: "digital ecosystem?",
    lead: "Book a free audit: we analyse your current architecture, find the bottlenecks and hand you a clear action plan built around the numbers.",
    cta: "Book a Free Audit",
  },

  modal: {
    kicker: "[ Consultation Request ]",
    title: "Describe your main blocker",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "email@company.com",
    site: "Website",
    sitePlaceholder: "https://yoursite.com (optional)",
    area: "What should we solve?",
    areaPlaceholder: "Select an area…",
    areas: [
      "High-conversion e-commerce",
      "Corporate sites & lead generation",
      "Web apps & custom automation",
      "Strategic SEO & performance marketing",
      "AI integration & intelligent systems",
    ],
    message: "Message",
    messagePlaceholder: "Describe the current situation and the result you want to reach…",
    failed: "Sending failed. Try again, or write to us at {email}",
    submit: "Send request →",
    sentTitle: "Request sent!",
    sentBody: "You'll receive a clear action plan within 24 working hours.",
    extraSite: "Site",
    extraArea: "Area",
  },
}

export const HOME_STR = { it, en } satisfies Bundle<typeof it>
