import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   IL CATALOGO DEL CONFIGURATORE (components/foundry/modules.ts).

   Ogni voce è indicizzata per id: `b-sync`, `a-dash`… Gli id, i pesi, i
   gruppi e le dipendenze stanno nel modulo del configuratore, perché sono
   struttura; qui c'è come quelle voci si chiamano e si spiegano.

   `node` è l'etichetta corta che compare sul canvas dell'architettura: due
   parole al massimo, altrimenti esce dal riquadro.

   Il resoconto finale (il "blueprint") è una frase composta a runtime: i
   modelli stanno in `blueprint`, con i segnaposto {focus} {list} {node}
   {count}. Tenerli come frasi intere e non come pezzi concatenati è ciò che
   permette all'inglese di ordinare le parti a modo suo.
══════════════════════════════════════════════════════════════════════════ */

const it = {
  vectors: {
    ecommerce: {
      label: "E-commerce ad Alta Conversione",
      focus: "Negozi online e scalabilità delle vendite",
      node: "E-commerce Engine",
      stack: "Next.js · Headless Commerce",
      tech: "Nucleo e-commerce headless: storefront Next.js disaccoppiato dal backend, progettato per cataloghi da decine di migliaia di prodotti e per reggere i picchi di traffico senza degrado.",
    },
    webapp: {
      label: "Applicazioni Web & Automazione Custom",
      focus: "Gestionali, CRM/ERP e aree riservate",
      node: "Web App Core",
      stack: "Next.js · Supabase · API",
      tech: "Nucleo applicativo su misura: ecosistema web con logica di business propria, ruoli e permessi, costruito per eliminare l'errore umano dai processi interni.",
    },
    ai: {
      label: "Integrazione AI & Sistemi Intelligenti",
      focus: "Agenti autonomi e modelli linguistici",
      node: "AI Core",
      stack: "LLM · RAG · Orchestrazione",
      tech: "Nucleo di intelligenza artificiale: modelli linguistici collegati ai dati aziendali, con agenti autonomi che gestiscono le attività ripetitive e restano operativi 24 ore su 24.",
    },
    seo: {
      label: "SEO Strutturale & Performance",
      focus: "Traffico organico e velocità",
      node: "SEO Core",
      stack: "SSR · Schema · Web Vitals",
      tech: "Nucleo SEO tecnico: architettura del codice pensata per i motori di ricerca fin dal primo commit, con rendering lato server e Core Web Vitals in fascia verde.",
    },
    corporate: {
      label: "Corporate & Lead Generation",
      focus: "Immagine di marca e acquisizione contatti",
      node: "Corporate Core",
      stack: "React · Next.js · Motion",
      tech: "Nucleo corporate: presenza digitale premium in React/Next.js con design sartoriale e micro-interazioni, calibrata sulla conversione di contatti qualificati.",
    },
  },

  items: {
    "b-sync": {
      label: "Magazzino e fornitori sempre allineati",
      plain: "Stock, prezzi e ordini si aggiornano da soli, in tempo reale.",
      node: "Sync ERP",
      tech: "Middleware di integrazione con fornitori ed ERP: sincronizzazione in tempo reale di giacenze, listini e ordini, testata su cataloghi da oltre 30.000 referenze.",
    },
    "b-orders": {
      label: "Ordini e clienti in un unico pannello",
      plain: "Una sola schermata per gestire ordini, clienti e documenti.",
      node: "Order Hub",
      tech: "Pannello unificato di gestione ordini e anagrafiche clienti, con stati, documenti e flussi operativi in un'unica interfaccia.",
    },
    "b-intl": {
      label: "Vendere in più lingue e valute",
      plain: "Un catalogo solo, mercati diversi, senza duplicare il lavoro.",
      node: "Multi-Market",
      tech: "Catalogo multilingua e multivaluta con instradamento geografico, listini per mercato e gestione centralizzata dei contenuti.",
    },
    "b-crm": {
      label: "Un gestionale che segue le tue regole",
      plain: "CRM o ERP costruito sui processi reali dell'azienda, non il contrario.",
      node: "CRM Custom",
      tech: "Sistema CRM/ERP su misura modellato sui regolamenti interni: entità, stati e automazioni disegnati sul processo aziendale esistente.",
    },
    "b-roles": {
      label: "Aree riservate per clienti e team",
      plain: "Ognuno entra e vede soltanto ciò che gli compete.",
      node: "Ruoli & Accessi",
      tech: "Aree riservate per clienti e collaboratori con autenticazione, gerarchia dei ruoli e permessi granulari applicati anche a livello di dati.",
    },
    "b-docs": {
      label: "Pagamenti e documenti automatizzati",
      plain: "Incassi e documenti generati e archiviati senza passaggi manuali.",
      node: "Pagamenti & Doc",
      tech: "Integrazione dei gateway di pagamento e del ciclo documentale: generazione, firma e archiviazione automatica dei documenti collegati alle transazioni.",
    },
    "b-rag": {
      label: "L'AI che conosce la tua azienda",
      plain: "Il modello risponde usando i tuoi documenti, non frasi generiche.",
      node: "Knowledge Base",
      tech: "Sistema RAG che collega la base di conoscenza aziendale al modello linguistico: risposte ancorate ai documenti interni e verificabili alla fonte.",
    },
    "b-intake": {
      label: "Richieste e documenti letti in automatico",
      plain: "Email, PDF e moduli in entrata vengono capiti e smistati da soli.",
      node: "Intake AI",
      tech: "Pipeline di estrazione e classificazione automatica di richieste e documenti in entrata, con instradamento ai flussi operativi corretti.",
    },
    "b-arch": {
      label: "Un sito costruito per posizionarsi",
      plain: "La struttura tecnica lavora per te su Google, non contro di te.",
      node: "SEO Architecture",
      tech: "Architettura tecnica orientata al posizionamento: struttura semantica delle URL, dati strutturati, gestione di canonical e indicizzazione.",
    },
    "b-funnel": {
      label: "Trasformare le visite in richieste",
      plain: "Percorsi pensati perché chi arriva lasci un contatto.",
      node: "Funnel CRO",
      tech: "Percorsi di conversione con landing dedicate, ottimizzazione CRO continua e tracciamento puntuale di ogni passaggio del funnel.",
    },
    "b-quiz": {
      label: "Configuratori e quiz interattivi",
      plain: "Strumenti che guidano il visitatore e qualificano la richiesta.",
      node: "Configuratore",
      tech: "Configuratori e quiz interattivi che guidano il visitatore nella definizione della propria esigenza e restituiscono una richiesta già qualificata.",
    },
    "b-cms": {
      label: "Contenuti gestibili in autonomia",
      plain: "Aggiorni testi e pagine da solo, senza chiamare uno sviluppatore.",
      node: "Headless CMS",
      tech: "CMS headless con modelli di contenuto su misura: pubblicazione autonoma su sito, landing e canali collegati da un'unica fonte.",
    },
    "a-dash": {
      label: "Cruscotto dei numeri in tempo reale",
      plain: "Vendite, traffico e margini in una schermata sola.",
      node: "Live Dashboard",
      tech: "Dashboard di analitica end-to-end: metriche commerciali e finanziarie aggregate da tutte le fonti e aggiornate in tempo reale.",
    },
    "a-portal": {
      label: "Portale trasparente per i clienti",
      plain: "I tuoi clienti seguono da soli lo stato di ordini e progetti.",
      node: "Client Portal",
      tech: "Portale clienti con stato avanzamento di ordini e progetti, documenti condivisi e canale di comunicazione tracciato.",
    },
    "a-support": {
      label: "Assistente AI per il primo contatto",
      plain: "Risponde alle domande frequenti e accompagna alla vendita, sempre.",
      node: "AI Support",
      tech: "Agente AI di primo livello: gestisce le richieste ricorrenti, qualifica il contatto e passa all'operatore solo i casi che lo richiedono.",
    },
    "a-copilot": {
      label: "Contenuti e schede scritti dall'AI",
      plain: "Descrizioni prodotto e metadati generati e ottimizzati in serie.",
      node: "Content Copilot",
      tech: "Copilot per contenuti e SEO: generazione massiva di descrizioni e metadati, con ottimizzazione continua delle schede prodotto.",
    },
    "a-workflow": {
      label: "I tuoi strumenti che si parlano",
      plain: "CRM, messaggistica, fogli di calcolo ed email collegati tra loro.",
      node: "Workflow Engine",
      tech: "Motore di automazione dei flussi: orchestrazione fra CRM, messaggistica (Telegram/WhatsApp), fogli di calcolo ed email con regole condizionali.",
    },
    "a-pseo": {
      label: "Migliaia di pagine mirate, generate a sistema",
      plain: "Una pagina per ogni micro-ricerca dei tuoi clienti, senza scriverle a mano.",
      node: "Programmatic SEO",
      tech: "SEO programmatica: generazione automatica di landing su base dati per intercettare la coda lunga delle ricerche, con controllo editoriale sui modelli.",
    },
    "a-geo": {
      label: "Essere citati dalle AI, non solo da Google",
      plain: "Comparire nelle risposte di ChatGPT, Perplexity e Gemini.",
      node: "GEO / AI Search",
      tech: "Ottimizzazione per i motori di risposta AI (GEO): struttura dei contenuti, dati strutturati e segnali di autorevolezza leggibili da ChatGPT, Perplexity e Gemini.",
    },
    "a-speed": {
      label: "Velocità garantita in fascia verde",
      plain: "Pagine che caricano subito, su qualsiasi telefono.",
      node: "Speed Shield",
      tech: "Presidio prestazionale sui Core Web Vitals: budget di performance, monitoraggio continuo e obiettivo stabile in fascia verde su dispositivi reali.",
    },
    "a-ui": {
      label: "Un'interfaccia che si riconosce",
      plain: "Un linguaggio visivo tuo, non un tema comprato.",
      node: "Custom UI System",
      tech: "Sistema visivo su misura (glassmorphism, tipografia e griglia proprietarie) documentato come design system riutilizzabile.",
    },
    "a-motion": {
      label: "Animazioni e micro-interazioni",
      plain: "Ogni gesto risponde: il sito sembra vivo, non statico.",
      node: "Motion Design",
      tech: "Motion design e micro-interazioni calibrate sul gesto dell'utente, con rispetto delle preferenze di movimento ridotto.",
    },
  },

  groups: {
    base:    { label: "Funzionalità Base", sub: "Il cuore operativo" },
    control: { label: "Dashboard & Controllo", sub: "Vedere e governare i numeri" },
    agents:  { label: "Agenti AI & Automazioni", sub: "Far lavorare il sistema da solo" },
    growth:  { label: "SEO & Crescita", sub: "Portare e misurare la domanda" },
    brand:   { label: "Brand & Design", sub: "Farsi riconoscere" },
  },

  complexity: [
    { label: "Contenuta", weeks: "2–3 settimane", note: "Impianto lineare, un solo flusso da presidiare." },
    { label: "Media", weeks: "3–5 settimane", note: "Più componenti da coordinare, integrazioni contenute." },
    { label: "Alta", weeks: "5–8 settimane", note: "Integrazioni multiple e logica di business articolata." },
    { label: "Molto Alta", weeks: "8–12 settimane", note: "Sistema esteso: va affrontato per fasi, con rilasci progressivi." },
  ],

  blueprint: {
    /** Congiunzione dell'ultimo elemento di un elenco: "a, b e c". */
    and: " e ",
    /** I numeri a parole, da zero a cinque: "si innestano tre livelli". */
    numbers: ["zero", "uno", "due", "tre", "quattro", "cinque"],
    goalWithBase: "{focus}. Il perimetro parte da {list}.",
    goalBare: "{focus}.",
    archWithLayers: "Sul nucleo {node} si innestano {count} livelli aggiuntivi: {list}. Progettati per funzionare come un unico sistema.",
    archBare: "L'impianto resta concentrato sul nucleo {node}, senza livelli aggiuntivi: perimetro stretto, rilascio rapido.",
    groupPhrase: {
      control: "un livello di controllo che rende leggibili i numeri",
      agents: "un livello di automazione che toglie lavoro ripetitivo alle persone",
      growth: "un livello di crescita che porta domanda qualificata e ne misura il ritorno",
      brand: "un livello di identità che rende l'esperienza riconoscibile",
    },
    nextStep: "Invia la configurazione: la analizzo personalmente e ti rispondo entro 24 ore con una valutazione tecnica e i passi successivi.",
  },
}

const en: typeof it = {
  vectors: {
    ecommerce: {
      label: "High-Conversion E-commerce",
      focus: "Online stores and sales scalability",
      node: "E-commerce Engine",
      stack: "Next.js · Headless Commerce",
      tech: "Headless e-commerce core: a Next.js storefront decoupled from the backend, designed for catalogues of tens of thousands of products and for absorbing traffic peaks without degrading.",
    },
    webapp: {
      label: "Web Apps & Custom Automation",
      focus: "Management systems, CRM/ERP and private areas",
      node: "Web App Core",
      stack: "Next.js · Supabase · API",
      tech: "Bespoke application core: a web ecosystem with its own business logic, roles and permissions, built to remove human error from internal processes.",
    },
    ai: {
      label: "AI Integration & Intelligent Systems",
      focus: "Autonomous agents and language models",
      node: "AI Core",
      stack: "LLM · RAG · Orchestration",
      tech: "Artificial intelligence core: language models connected to company data, with autonomous agents that handle repetitive tasks and stay operational around the clock.",
    },
    seo: {
      label: "Structural SEO & Performance",
      focus: "Organic traffic and speed",
      node: "SEO Core",
      stack: "SSR · Schema · Web Vitals",
      tech: "Technical SEO core: a code architecture designed for search engines from the first commit, with server-side rendering and Core Web Vitals in the green band.",
    },
    corporate: {
      label: "Corporate & Lead Generation",
      focus: "Brand image and lead acquisition",
      node: "Corporate Core",
      stack: "React · Next.js · Motion",
      tech: "Corporate core: a premium digital presence in React/Next.js with bespoke design and micro-interactions, calibrated on converting qualified leads.",
    },
  },

  items: {
    "b-sync": {
      label: "Stock and suppliers always in sync",
      plain: "Stock, prices and orders update themselves, in real time.",
      node: "Sync ERP",
      tech: "Integration middleware for suppliers and ERP: real-time synchronisation of stock, price lists and orders, tested on catalogues of over 30,000 references.",
    },
    "b-orders": {
      label: "Orders and customers in one panel",
      plain: "A single screen to manage orders, customers and documents.",
      node: "Order Hub",
      tech: "A unified panel for order and customer management, with statuses, documents and operational flows in a single interface.",
    },
    "b-intl": {
      label: "Selling in several languages and currencies",
      plain: "One catalogue, different markets, without duplicating the work.",
      node: "Multi-Market",
      tech: "Multilingual, multi-currency catalogue with geographic routing, per-market price lists and centralised content management.",
    },
    "b-crm": {
      label: "A management system that follows your rules",
      plain: "A CRM or ERP built on how the company actually works, not the reverse.",
      node: "CRM Custom",
      tech: "A bespoke CRM/ERP modelled on your internal rules: entities, statuses and automations designed around the existing business process.",
    },
    "b-roles": {
      label: "Private areas for clients and team",
      plain: "Everyone logs in and sees only what concerns them.",
      node: "Roles & Access",
      tech: "Private areas for clients and staff with authentication, a role hierarchy and granular permissions enforced down to the data layer.",
    },
    "b-docs": {
      label: "Automated payments and documents",
      plain: "Payments and paperwork generated and filed with no manual steps.",
      node: "Payments & Docs",
      tech: "Integration of payment gateways and the document cycle: automatic generation, signing and archiving of the documents tied to each transaction.",
    },
    "b-rag": {
      label: "AI that knows your company",
      plain: "The model answers from your documents, not from generic phrases.",
      node: "Knowledge Base",
      tech: "A RAG system connecting the company knowledge base to the language model: answers anchored to internal documents and verifiable at the source.",
    },
    "b-intake": {
      label: "Incoming requests and documents read automatically",
      plain: "Email, PDFs and inbound forms get understood and routed on their own.",
      node: "Intake AI",
      tech: "A pipeline for automatic extraction and classification of incoming requests and documents, routed into the right operational flows.",
    },
    "b-arch": {
      label: "A site built to rank",
      plain: "The technical structure works for you on Google, not against you.",
      node: "SEO Architecture",
      tech: "A technical architecture oriented to ranking: semantic URL structure, structured data, canonical handling and indexing control.",
    },
    "b-funnel": {
      label: "Turning visits into enquiries",
      plain: "Paths designed so that whoever arrives leaves a contact.",
      node: "Funnel CRO",
      tech: "Conversion paths with dedicated landing pages, continuous CRO optimisation and precise tracking of every funnel step.",
    },
    "b-quiz": {
      label: "Interactive configurators and quizzes",
      plain: "Tools that guide the visitor and qualify the enquiry.",
      node: "Configurator",
      tech: "Interactive configurators and quizzes that guide the visitor through defining their own need and return an already-qualified request.",
    },
    "b-cms": {
      label: "Content you manage yourself",
      plain: "You update copy and pages on your own, without calling a developer.",
      node: "Headless CMS",
      tech: "A headless CMS with bespoke content models: publishing to the site, landing pages and connected channels from a single source.",
    },
    "a-dash": {
      label: "A real-time dashboard of the numbers",
      plain: "Sales, traffic and margins on a single screen.",
      node: "Live Dashboard",
      tech: "End-to-end analytics dashboard: commercial and financial metrics aggregated from every source and updated in real time.",
    },
    "a-portal": {
      label: "A transparent portal for your clients",
      plain: "Your clients follow the status of orders and projects themselves.",
      node: "Client Portal",
      tech: "A client portal with the progress of orders and projects, shared documents and a tracked communication channel.",
    },
    "a-support": {
      label: "An AI assistant for first contact",
      plain: "Answers frequent questions and guides towards the sale, always.",
      node: "AI Support",
      tech: "A first-line AI agent: it handles recurring requests, qualifies the contact and escalates to a person only the cases that need it.",
    },
    "a-copilot": {
      label: "Content and product copy written by AI",
      plain: "Product descriptions and metadata generated and optimised in bulk.",
      node: "Content Copilot",
      tech: "A copilot for content and SEO: bulk generation of descriptions and metadata, with continuous optimisation of product pages.",
    },
    "a-workflow": {
      label: "Your tools talking to each other",
      plain: "CRM, messaging, spreadsheets and email connected together.",
      node: "Workflow Engine",
      tech: "A workflow automation engine: orchestration between CRM, messaging (Telegram/WhatsApp), spreadsheets and email with conditional rules.",
    },
    "a-pseo": {
      label: "Thousands of targeted pages, generated systematically",
      plain: "A page for every micro-search your customers make, without writing them by hand.",
      node: "Programmatic SEO",
      tech: "Programmatic SEO: automatic generation of data-driven landing pages to capture the long tail of search, with editorial control over the templates.",
    },
    "a-geo": {
      label: "Being cited by AI, not only by Google",
      plain: "Appearing in the answers of ChatGPT, Perplexity and Gemini.",
      node: "GEO / AI Search",
      tech: "Optimisation for AI answer engines (GEO): content structure, structured data and authority signals readable by ChatGPT, Perplexity and Gemini.",
    },
    "a-speed": {
      label: "Speed guaranteed in the green band",
      plain: "Pages that load instantly, on any phone.",
      node: "Speed Shield",
      tech: "Performance stewardship on Core Web Vitals: a performance budget, continuous monitoring and a stable target in the green band on real devices.",
    },
    "a-ui": {
      label: "An interface people recognise",
      plain: "A visual language of your own, not a bought theme.",
      node: "Custom UI System",
      tech: "A bespoke visual system (glassmorphism, proprietary typography and grid) documented as a reusable design system.",
    },
    "a-motion": {
      label: "Animation and micro-interactions",
      plain: "Every gesture responds: the site feels alive, not static.",
      node: "Motion Design",
      tech: "Motion design and micro-interactions calibrated on the user's gesture, respecting reduced-motion preferences.",
    },
  },

  groups: {
    base:    { label: "Core Features", sub: "The operational heart" },
    control: { label: "Dashboards & Control", sub: "Seeing and governing the numbers" },
    agents:  { label: "AI Agents & Automation", sub: "Letting the system do the work" },
    growth:  { label: "SEO & Growth", sub: "Bringing demand in and measuring it" },
    brand:   { label: "Brand & Design", sub: "Being recognised" },
  },

  complexity: [
    { label: "Contained", weeks: "2–3 weeks", note: "A linear build, one flow to look after." },
    { label: "Medium", weeks: "3–5 weeks", note: "More components to coordinate, contained integrations." },
    { label: "High", weeks: "5–8 weeks", note: "Multiple integrations and articulated business logic." },
    { label: "Very High", weeks: "8–12 weeks", note: "An extended system: it has to be taken in phases, with progressive releases." },
  ],

  blueprint: {
    and: " and ",
    numbers: ["zero", "one", "two", "three", "four", "five"],
    goalWithBase: "{focus}. The scope starts from {list}.",
    goalBare: "{focus}.",
    archWithLayers: "On the {node} sit {count} additional layers: {list}. Designed to work as a single system.",
    archBare: "The build stays focused on the {node}, with no additional layers: tight scope, fast release.",
    groupPhrase: {
      control: "a control layer that makes the numbers readable",
      agents: "an automation layer that takes repetitive work off people",
      growth: "a growth layer that brings in qualified demand and measures its return",
      brand: "an identity layer that makes the experience recognisable",
    },
    nextStep: "Send the configuration: I read it personally and reply within 24 hours with a technical assessment and the next steps.",
  },
}

export const MODULES_STR = { it, en } satisfies Bundle<typeof it>
