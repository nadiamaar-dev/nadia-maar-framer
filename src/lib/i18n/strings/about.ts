import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   ABOUT / METODO (NadiaMaar_About.tsx).

   I titoloni della pagina sono in maiuscolo pieno e spesso spezzati su due
   righe con trattamenti diversi (pieno / contorno): restano quindi in pezzi
   separati, perché il punto in cui si spezzano è una scelta grafica e in
   inglese cade su parole diverse.
══════════════════════════════════════════════════════════════════════════ */

const it = {
  hero: {
    corner: "Nadia Maar® — Digital Studio",
    cornerRight: "About / 01",
    kicker: "Architettura & Codice",
    /* Le quattro righe del titolo, animate una per volta. */
    h1: ["DIGITAL", "ARCHITECT", "&", "E-COM", "DEVELOPER"],
    location: "BASED IN ITALY / AVAILABLE WORLDWIDE",
    lead: "Costruisco ecosistemi digitali che vendono. Un solo punto di contatto dalla strategia al codice di produzione: design premium, sviluppo frontend solido, SEO e advertising — cuciti insieme in un unico flusso, guidato dalla logica e privo di compromessi.",
    cta: "Lavoriamo insieme",
    identity: "[ IDENTITY ]",
    available: "DISPONIBILE",
    role: "Digital Architect · E-Commerce Dev",
    locationRow: "Italia · Remote in tutto il mondo",
  },

  stats: {
    kicker: "I Numeri",
    title1: "IMPATTO",
    title2: "MISURABILE",
    updated: "Aggiornato · 2026",
    items: [
      { cat: "Esperienza", sub: "Anni a costruire prodotti digitali" },
      { cat: "Delivery",   sub: "Progetti spediti in produzione" },
      { cat: "Scala",      sub: "Prodotti e-commerce sincronizzati" },
    ],
    customTag: "100% CUSTOM",
    customText: "Ogni progetto è su misura. Zero template, zero scorciatoie.",
  },

  philosophy: {
    kicker: "L'Approccio",
    title: "COME LAVORIAMO",
    meta: "3 principi · Studio NM",
    items: [
      { label: "Vision", text: "Mi bastano poche parole per mappare l'intera struttura del tuo business. Questa lettura immediata, unita a un pensiero creativo profondo, mi permette di decodificare la tua visione commerciale e tradurla subito in un'architettura digitale ad altissime prestazioni." },
      { label: "Performance", text: "Fondo l'eleganza del minimalismo visivo con prestazioni frontend eccezionali. Ogni riga di codice, ogni layout e ogni campagna hanno un solo scopo: eliminare il superfluo, massimizzare la conversione e dominare il posizionamento di mercato." },
      { label: "AI + Code", text: "Integro l'AI in ogni fase — dallo sviluppo alla SEO. Scrivo codice più pulito, testo più a fondo e consegno infrastrutture complesse a una velocità semplicemente fuori portata per un'agenzia tradizionale." },
    ],
  },

  process: {
    kicker: "Il Processo",
    watermark: "PROCESSO",
    over: "Il tuo",
    lineOutlined: "PROSSIMO",
    lineSolid: "PRODOTTO",
    lineLight: "parte da qui",
    attributes: ["strategico", "elegante", "redditizio"],
  },

  toolkit: {
    kicker: "Competenze",
    title: "LO STACK",
    meta: "4 aree · 24 competenze",
    groups: [
      { title: "Design & Thinking", items: ["Pensiero Creativo & Strategia", "Premium UI/UX Design", "Minimalist Aesthetics", "Advanced Design Systems", "Framer Prototyping", "Mobile-First Architecture"] },
      { title: "E-Commerce Eng.", items: ["Shopify Custom Sviluppo", "Headless Commerce", "Custom Checkouts", "Data Migrations", "CRO Optimization", "E-commerce Analytics"] },
      { title: "Web, Mobile & AI", items: ["React.js & Next.js", "Tailwind CSS", "JavaScript (ES6+)", "Expo & Supabase", "AI-Driven Coding Workflows", "Claude Code & Cursor"] },
      { title: "Acquisition & Growth", items: ["SEO Avanzato & AI SEO Audit", "Google Ads (Search & Pmax)", "Meta Ads (FB & Instagram)", "Funnel Strategy & Growth", "B2B Lead Generation", "Conversion Tracking Advanced"] },
    ],
  },

  faq: {
    kicker: "Domande Frequenti",
    title1: "LOGICA&",
    title2: "TRASPARENZA",
    lead: "Risposte dirette alle domande che contano davvero.",
    items: [
      { q: 'Cosa significa lavorare con un "Digital Architect"?', a: "Significa un solo punto di contatto per l'intero progetto: dall'analisi strategica iniziale allo sviluppo dell'interfaccia premium, dal codice frontend alla SEO e al growth marketing. Niente intermediari, niente colli di bottiglia — solo esecuzione diretta." },
      { q: "Ti occupi anche di acquisizione traffico e advertising?", a: "Sì. Un prodotto eccezionale ha bisogno di visibilità eccezionale. Integro la SEO avanzata basata su AI fin dalla progettazione e gestisco campagne ad alto budget su Google Ads e Meta Ads, con funnel completi per la lead generation B2B e la vendita e-commerce." },
      { q: "Qual è il tuo stack tecnologico principale?", a: "React.js e Next.js con Tailwind CSS per web app e interfacce dinamiche. Expo e Supabase per mobile e backend agili. Per l'e-commerce ad alta scalabilità lavoro su Shopify Custom." },
      { q: "Come usi l'Intelligenza Artificiale nel flusso di lavoro?", a: "Uso AI-assisted coding di ultima generazione e modelli predittivi per SEO e advertising. Questo accelera in modo esponenziale scrittura del codice, analisi dei dati e ottimizzazione — consegno infrastrutture perfette in tempi ridotti." },
      { q: "Come gestisci tempi, costi e migrazioni?", a: "Ogni progetto parte da uno scoping tecnico accurato: timeline realistica (di solito da poche settimane a due mesi) e preventivo fisso. Per le piattaforme obsolete gestisco la migrazione verso Shopify preservando SEO, meta tag e dati storici." },
    ],
  },

  cta: {
    title1: "HAI QUALCOSA",
    title2: "DA COSTRUIRE?",
    button: "Iniziamo a parlarne",
  },

  modal: {
    kicker: "RICHIESTA CONSULENZA",
    title: "Raccontami il tuo progetto",
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
    failed: "Invio non riuscito. Riprova, oppure scrivici a {email}",
    submit: "Invia Richiesta →",
    sentTitle: "Richiesta inviata!",
    sentBody: "Riceverai un piano d'azione chiaro entro 24 ore lavorative.",
    extraSite: "Sito",
    extraArea: "Area",
  },
}

const en: typeof it = {
  hero: {
    corner: "Nadia Maar® — Digital Studio",
    cornerRight: "About / 01",
    kicker: "Architecture & Code",
    h1: ["DIGITAL", "ARCHITECT", "&", "E-COM", "DEVELOPER"],
    location: "BASED IN ITALY / AVAILABLE WORLDWIDE",
    lead: "I build digital ecosystems that sell. A single point of contact from strategy to production code: premium design, solid frontend development, SEO and advertising — stitched into one flow, driven by logic and free of compromises.",
    cta: "Let's work together",
    identity: "[ IDENTITY ]",
    available: "AVAILABLE",
    role: "Digital Architect · E-Commerce Dev",
    locationRow: "Italy · Remote worldwide",
  },

  stats: {
    kicker: "The Numbers",
    title1: "MEASURABLE",
    title2: "IMPACT",
    updated: "Updated · 2026",
    items: [
      { cat: "Experience", sub: "Years building digital products" },
      { cat: "Delivery",   sub: "Projects shipped to production" },
      { cat: "Scale",      sub: "E-commerce products synchronised" },
    ],
    customTag: "100% CUSTOM",
    customText: "Every project is bespoke. No templates, no shortcuts.",
  },

  philosophy: {
    kicker: "The Approach",
    title: "HOW WE WORK",
    meta: "3 principles · Studio NM",
    items: [
      { label: "Vision", text: "A few words are enough for me to map the whole structure of your business. That immediate read, paired with deep creative thinking, lets me decode your commercial vision and turn it straight into a very high-performance digital architecture." },
      { label: "Performance", text: "I fuse the elegance of visual minimalism with exceptional frontend performance. Every line of code, every layout and every campaign has one purpose: strip out the superfluous, maximise conversion and own the market position." },
      { label: "AI + Code", text: "I bring AI into every phase — from development to SEO. I write cleaner code, test more deeply and deliver complex infrastructure at a speed simply out of reach for a traditional agency." },
    ],
  },

  process: {
    kicker: "The Process",
    watermark: "PROCESS",
    over: "Your",
    lineOutlined: "NEXT",
    lineSolid: "PRODUCT",
    lineLight: "starts here",
    attributes: ["strategic", "elegant", "profitable"],
  },

  toolkit: {
    kicker: "Capabilities",
    title: "THE STACK",
    meta: "4 areas · 24 capabilities",
    groups: [
      { title: "Design & Thinking", items: ["Creative Thinking & Strategy", "Premium UI/UX Design", "Minimalist Aesthetics", "Advanced Design Systems", "Framer Prototyping", "Mobile-First Architecture"] },
      { title: "E-Commerce Eng.", items: ["Custom Shopify Development", "Headless Commerce", "Custom Checkouts", "Data Migrations", "CRO Optimization", "E-commerce Analytics"] },
      { title: "Web, Mobile & AI", items: ["React.js & Next.js", "Tailwind CSS", "JavaScript (ES6+)", "Expo & Supabase", "AI-Driven Coding Workflows", "Claude Code & Cursor"] },
      { title: "Acquisition & Growth", items: ["Advanced SEO & AI SEO Audit", "Google Ads (Search & Pmax)", "Meta Ads (FB & Instagram)", "Funnel Strategy & Growth", "B2B Lead Generation", "Conversion Tracking Advanced"] },
    ],
  },

  faq: {
    kicker: "Frequent Questions",
    title1: "LOGIC&",
    title2: "TRANSPARENCY",
    lead: "Direct answers to the questions that actually matter.",
    items: [
      { q: 'What does working with a "Digital Architect" mean?', a: "It means a single point of contact for the whole project: from the initial strategic analysis to the premium interface, from frontend code to SEO and growth marketing. No middlemen, no bottlenecks — just direct execution." },
      { q: "Do you also handle traffic acquisition and advertising?", a: "Yes. An exceptional product needs exceptional visibility. I build AI-driven advanced SEO in from the design stage and run high-budget campaigns on Google Ads and Meta Ads, with complete funnels for B2B lead generation and e-commerce sales." },
      { q: "What is your main technology stack?", a: "React.js and Next.js with Tailwind CSS for web apps and dynamic interfaces. Expo and Supabase for agile mobile and backend work. For highly scalable e-commerce I work on custom Shopify." },
      { q: "How do you use artificial intelligence in your workflow?", a: "I use latest-generation AI-assisted coding and predictive models for SEO and advertising. That exponentially speeds up writing code, analysing data and optimising — I deliver flawless infrastructure in less time." },
      { q: "How do you handle timelines, costs and migrations?", a: "Every project starts from careful technical scoping: a realistic timeline (usually from a few weeks to two months) and a fixed quote. For legacy platforms I run the migration to Shopify while preserving SEO, meta tags and historical data." },
    ],
  },

  cta: {
    title1: "GOT SOMETHING",
    title2: "TO BUILD?",
    button: "Let's start talking",
  },

  modal: {
    kicker: "CONSULTATION REQUEST",
    title: "Tell me about your project",
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

export const ABOUT_STR = { it, en } satisfies Bundle<typeof it>
