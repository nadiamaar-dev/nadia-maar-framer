import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   PAGINA /projects — i tre casi studio.

   I disegni SVG accanto a ogni caso hanno etichette dentro (riquadri di
   trenta pixel): stanno in `visuals` e restano corte per forza.
══════════════════════════════════════════════════════════════════════════ */

const it = {
  hero: {
    kicker: "Case Studies",
    over: "Il mio",
    lineOutlined: "SELECTED",
    lineSolid: "WORKS",
    subBefore: "Ingegneria e scaling di",
    subHighlight: "prodotti digitali complessi.",
    lead: "Tre case study reali — dall'e-commerce enterprise all'automazione B2B fino alle piattaforme civiche. Ogni progetto è raccontato secondo la struttura Obiettivo · Sfida · Soluzione · Impatto.",
  },

  labels: {
    stack: "Stack —",
    goal: "Obiettivo del Progetto",
    challenge: "La Sfida Tecnica",
    solutions: "Soluzioni & Impatto Business",
  },

  visuals: {
    supplier: "Fornitore",
    middleware: "Middleware",
    store: "Store",
    superAdmin: "Super Admin",
    superAdminSub: "controllo totale",
    subAdmin: "120+ Sub-Admin",
    subAdminSub: "gestione territoriale",
    cabinet: "Cabinet Cliente",
    cabinetSub: "area riservata",
    region: "Ente Regionale",
  },

  cases: [
    {
      category: "Civic Tech · Open-Gov · SaaS",
      title: "Piattaforma Civica Regionale",
      subtitle: "Piattaforma istituzionale full-stack per un ente regionale. Partecipazione dei cittadini, raccolta fondi e bandi per startup, orchestrati da un'architettura multi-ruolo sicura su Supabase.",
      obiettivo: "Un ecosistema digitale istituzionale di nuova generazione, pensato per avvicinare cittadini e pubblica amministrazione. Un unico spazio dove convergono raccolta fondi, bandi per giovani startup e gestione operativa del territorio — con più trasparenza e partecipazione reale.",
      sfida: "Al centro, un'architettura multi-tenant con una gerarchia di ruoli articolata: un Super Admin dal controllo totale, oltre 120 Sub-Admin con permessi territoriali circoscritti e i Cabinet Cliente ad accesso riservato. La sfida: isolare i dati di ogni ruolo con row-level security, gestire donazioni e candidature in tempo reale e mantenere un'estetica premium senza mai sacrificare le prestazioni.",
      soluzioni: [
        { t: "Backend & Autenticazione su Supabase", d: "Infrastruttura su Supabase — PostgreSQL, Auth, Storage e Realtime — con Row-Level Security a livello di database: ogni ruolo vede solo i dati di sua competenza, sempre." },
        { t: "Architettura Multi-Ruolo", d: "Super Admin per il controllo totale, oltre 120 Sub-Admin per la gestione territoriale decentralizzata e un Cabinet Cliente dedicato. Ognuno con dashboard, permessi e flussi su misura." },
        { t: "Donazioni & Bandi per Startup", d: "Un sistema integrato per creare e monitorare progetti di donazione e pubblicare bandi rivolti alle giovani startup, con gestione delle candidature end-to-end." },
        { t: "Mappa Regionale & UI d'Avanguardia", d: "Cartografia vettoriale della regione integrata nel codice — glassmorphism, accenti metallici e transizioni fluide — alleggerita su mobile per una UX impeccabile." },
      ],
      metrics: [
        { v: "120+", l: "Sub-Admin territoriali" },
        { v: "RLS", l: "Sicurezza Supabase" },
        { v: "3", l: "Livelli di ruolo" },
      ],
    },
    {
      category: "E-Commerce · Shopify Plus",
      title: "E-Commerce Enterprise",
      subtitle: "Un e-commerce enterprise costruito per scalare sul mercato europeo, con un catalogo di oltre 32.000 SKU sempre veloce e reattivo.",
      obiettivo: "Un e-commerce di livello enterprise pensato per l'espansione in tutta l'Unione Europea. L'obiettivo: reggere un catalogo massivo offrendo, in ogni mercato, un'esperienza fluida, localizzata e orientata alla conversione.",
      sfida: "Gestire oltre 32.000 prodotti attivi impone un'architettura dati impeccabile, priva di colli di bottiglia. La sfida vera è stata ottimizzare i Core Web Vitals (LCP, FID, CLS) su mobile — con filtri complessi e varianti dinamiche — senza perdere un millisecondo di velocità.",
      soluzioni: [
        { t: "Performance Optimization", d: "Refactoring profondo del codice Liquid e taglio degli script di terze parti: tempo di interattività portato sotto 1,4 secondi." },
        { t: "Architettura Multi-Country", d: "Mercati internazionali nativi, con valute locali, regimi fiscali europei (OSS) e traduzioni dinamiche del catalogo gestite in automatico." },
        { t: "Filtrazione Avanzata", d: "Una faceted navigation che lascia filtrare migliaia di prodotti all'istante, senza mai ricaricare la pagina." },
      ],
      metrics: [
        { v: "32K+", l: "SKU attivi" },
        { v: "<1.4s", l: "Time to Interactive" },
        { v: "EU", l: "Multi-country OSS" },
      ],
    },
    {
      category: "Middleware · Automazione B2B",
      title: "Middleware di Automazione Logistica",
      subtitle: "Un middleware software per sincronizzare lo stock in tempo reale e automatizzare l'intera catena di approvvigionamento in dropshipping.",
      obiettivo: "Un middleware proprietario per azzerare i processi manuali tra fornitori all'ingrosso (B2B) e store online: ordini, tracciamenti spedizioni e disponibilità prodotti, tutto automatizzato end-to-end.",
      sfida: "In un business ad alto volume, il disallineamento dello stock — vendere articoli a inventario zero — è un rischio critico. Il sistema doveva reggere transazioni concorrenti massive e restare fault-tolerant anche con timeout delle API fornitore o picchi di traffico imprevisti.",
      soluzioni: [
        { t: "Architettura ad Alta Affidabilità", d: "Persistenza a doppia scrittura (Dual-Write): la velocità di un database relazionale SQLite, con un mirror in JSON come backup d'emergenza." },
        { t: "Integrità dei Dati & Autocommit", d: "Conflitti di concorrenza risolti con una gestione avanzata dei batch: ogni ordine elaborato entro 3 secondi dall'evento webhook." },
        { t: "Gestione dei Processi", d: "Monitoraggio continuo con PM2 per un uptime del servizio del 99,9%." },
      ],
      metrics: [
        { v: "99.9%", l: "Uptime servizio" },
        { v: "<3s", l: "Order processing" },
        { v: "0", l: "Over-selling" },
      ],
    },
  ],

  cta: {
    kicker: "Prossimo Progetto",
    title: "Pronto a discutere il tuo prossimo progetto?",
    lead: "Raccontami la sfida tecnica. Riceverai un piano d'azione chiaro, con architettura e stima, entro 24 ore lavorative.",
    primary: "Avvia il tuo Progetto",
    secondary: "Scrivimi via Email",
  },
}

const en: typeof it = {
  hero: {
    kicker: "Case Studies",
    over: "My",
    lineOutlined: "SELECTED",
    lineSolid: "WORKS",
    subBefore: "Engineering and scaling",
    subHighlight: "complex digital products.",
    lead: "Three real case studies — from enterprise e-commerce to B2B automation and civic platforms. Every project is told through the same structure: Goal · Challenge · Solution · Impact.",
  },

  labels: {
    stack: "Stack —",
    goal: "Project Goal",
    challenge: "The Technical Challenge",
    solutions: "Solutions & Business Impact",
  },

  visuals: {
    supplier: "Supplier",
    middleware: "Middleware",
    store: "Store",
    superAdmin: "Super Admin",
    superAdminSub: "full control",
    subAdmin: "120+ sub-admins",
    subAdminSub: "regional management",
    cabinet: "Client Cabinet",
    cabinetSub: "private area",
    region: "Regional Authority",
  },

  cases: [
    {
      category: "Civic Tech · Open-Gov · SaaS",
      title: "Regional Civic Platform",
      subtitle: "A full-stack institutional platform for a regional authority. Citizen participation, fundraising and startup grant calls, orchestrated by a secure multi-role architecture on Supabase.",
      obiettivo: "A new-generation institutional digital ecosystem, built to bring citizens and public administration closer. One space where fundraising, grant calls for young startups and day-to-day regional management converge — with more transparency and real participation.",
      sfida: "At the centre, a multi-tenant architecture with an articulated role hierarchy: a super admin with full control, over 120 sub-admins with scoped regional permissions, and client cabinets behind private access. The challenge: isolating each role's data with row-level security, handling donations and applications in real time, and keeping a premium aesthetic without ever sacrificing performance.",
      soluzioni: [
        { t: "Supabase backend & authentication", d: "Infrastructure on Supabase — PostgreSQL, Auth, Storage and Realtime — with row-level security at the database layer: every role sees only the data it owns, always." },
        { t: "Multi-role architecture", d: "A super admin for full control, over 120 sub-admins for decentralised regional management and a dedicated client cabinet. Each with its own dashboard, permissions and flows." },
        { t: "Donations & startup grant calls", d: "An integrated system to create and monitor donation projects and publish calls aimed at young startups, with end-to-end application handling." },
        { t: "Regional map & advanced UI", d: "Vector cartography of the region built into the code — glassmorphism, metallic accents and fluid transitions — lightened on mobile for a flawless experience." },
      ],
      metrics: [
        { v: "120+", l: "Regional sub-admins" },
        { v: "RLS", l: "Supabase security" },
        { v: "3", l: "Role levels" },
      ],
    },
    {
      category: "E-Commerce · Shopify Plus",
      title: "Enterprise E-Commerce",
      subtitle: "An enterprise e-commerce built to scale across the European market, with a catalogue of over 32,000 SKUs that stays fast and responsive.",
      obiettivo: "An enterprise-grade e-commerce designed for expansion across the European Union. The goal: carry a massive catalogue while offering, in every market, a fluid, localised experience built around conversion.",
      sfida: "Running over 32,000 active products demands a flawless data architecture with no bottlenecks. The real challenge was optimising Core Web Vitals (LCP, FID, CLS) on mobile — with complex filters and dynamic variants — without losing a millisecond of speed.",
      soluzioni: [
        { t: "Performance optimisation", d: "Deep refactoring of the Liquid code and trimming of third-party scripts: time to interactive brought below 1.4 seconds." },
        { t: "Multi-country architecture", d: "Native international markets, with local currencies, European tax regimes (OSS) and dynamic catalogue translations handled automatically." },
        { t: "Advanced filtering", d: "Faceted navigation that lets you filter thousands of products instantly, without ever reloading the page." },
      ],
      metrics: [
        { v: "32K+", l: "Active SKUs" },
        { v: "<1.4s", l: "Time to Interactive" },
        { v: "EU", l: "Multi-country OSS" },
      ],
    },
    {
      category: "Middleware · B2B Automation",
      title: "Logistics Automation Middleware",
      subtitle: "Middleware software to synchronise stock in real time and automate the entire dropshipping supply chain.",
      obiettivo: "A proprietary middleware to eliminate manual steps between wholesale suppliers (B2B) and online stores: orders, shipment tracking and product availability, automated end to end.",
      sfida: "In a high-volume business, stock drift — selling items that are at zero inventory — is a critical risk. The system had to hold massive concurrent transactions and stay fault-tolerant even with supplier API timeouts or unexpected traffic spikes.",
      soluzioni: [
        { t: "High-reliability architecture", d: "Dual-write persistence: the speed of a relational SQLite database, with a JSON mirror as an emergency backup." },
        { t: "Data integrity & autocommit", d: "Concurrency conflicts resolved with advanced batch handling: every order processed within 3 seconds of the webhook event." },
        { t: "Process management", d: "Continuous monitoring with PM2 for 99.9% service uptime." },
      ],
      metrics: [
        { v: "99.9%", l: "Service uptime" },
        { v: "<3s", l: "Order processing" },
        { v: "0", l: "Over-selling" },
      ],
    },
  ],

  cta: {
    kicker: "Next Project",
    title: "Ready to discuss your next project?",
    lead: "Tell me about the technical challenge. You'll get a clear action plan, with architecture and an estimate, within 24 working hours.",
    primary: "Start Your Project",
    secondary: "Email Me",
  },
}

export const PROJECTS_STR = { it, en } satisfies Bundle<typeof it>
