import type { Bundle } from "../t"

/* Le tre sezioni in fondo alla pagina About: il manifesto «un solo partner»,
   le capacità tecniche e la vetrina del Lab. */

const it = {
  approach: {
    kicker: "[ Un Solo Partner ]",
    title: "Un Solo Partner, Zero Scuse.",
    lead: "Sviluppatore, designer, esperto di automazioni API e agenzia di marketing sono di solito quattro fornitori diversi — con costi frammentati, comunicazione lenta e responsabilità sfumate. Lo studio li tiene insieme in un'unica mente strategica.",
    items: [
      { title: "Infrastrutture Senza Errori", body: "Architetture testate da chi le ha progettate. Codice pulito, automazioni e connessioni ai fornitori affidabili: zero bug in produzione, sistemi che reggono la scala." },
      { title: "Velocità di Esecuzione", body: "Nessun passaggio di consegne né perdita di informazioni. Dal codice alla campagna di marketing, tutto vive in un unico flusso perfettamente allineato." },
      { title: "Unico Referente Strategico", body: "Sviluppo tecnico, logica di business, integrazione AI e SEO gestiti da un'unica mente. Nessun rimpallo di responsabilità, nessuna scusa." },
    ],
  },

  capabilities: {
    kicker: "[ Tecnologia all'Avanguardia ]",
    title: "Perché la Velocità Determina il tuo Fatturato",
    lead: "Ogni millisecondo conta. Un'architettura tecnica di alto livello non è un lusso — è il fondamento su cui si costruisce la crescita del fatturato.",
    items: [
      {
        scoreLabel: "Performance",
        title: "Caricamento Istantaneo",
        body: "Un sito istantaneo abbatte il tasso di abbandono e aumenta drasticamente la conversione finale.",
      },
      {
        scoreLabel: "Core Web Vitals",
        title: "Core Web Vitals Perfetti",
        body: "Google premia i siti tecnicamente perfetti. Vantaggio competitivo immediato sul posizionamento organico.",
      },
      {
        scoreLabel: "Uptime",
        title: "Infrastruttura Serverless",
        body: "Zero downtime durante i picchi di traffico e massima protezione contro le vulnerabilità informatiche.",
      },
    ],
  },

  showcase: {
    kicker: "[ Digital Foundry ]",
    titleOver: "Digital Foundry:",
    title: "Costruisci la tua architettura",
    lead: "Non comprare a scatola chiusa. Esplora la nostra libreria di soluzioni reali (CRM, Portali B2B, E-commerce), testa le demo e costruisci il tuo Blueprint per un preventivo istantaneo.",
    cta: "Entra nella Foundry",
    items: [
      { tag: "B2B PORTAL", title: "Supplier Portal", desc: "Onboarding fornitori, listini e ordini sincronizzati in tempo reale." },
      { tag: "CRM", title: "CRM Dashboard", desc: "Pipeline, clienti e metriche di vendita in un'unica dashboard." },
      { tag: "DISTRIBUTION", title: "Distributor Hub", desc: "Rete distributori, stock multi-sede e logistica automatizzata." },
    ],
  },
}

const en: typeof it = {
  approach: {
    kicker: "[ One Single Partner ]",
    title: "One Partner, No Excuses.",
    lead: "A developer, a designer, an API automation specialist and a marketing agency are usually four different suppliers — with fragmented costs, slow communication and blurred responsibility. The studio holds them together in a single strategic mind.",
    items: [
      { title: "Infrastructure Without Errors", body: "Architectures tested by the person who designed them. Clean code, reliable automations and supplier connections: no bugs in production, systems that hold at scale." },
      { title: "Speed of Execution", body: "No handovers, no information lost along the way. From code to marketing campaign, everything lives in one perfectly aligned flow." },
      { title: "A Single Strategic Contact", body: "Technical development, business logic, AI integration and SEO handled by one mind. No passing the blame, no excuses." },
    ],
  },

  capabilities: {
    kicker: "[ Leading-Edge Technology ]",
    title: "Why Speed Determines Your Revenue",
    lead: "Every millisecond counts. A high-grade technical architecture isn't a luxury — it's the foundation revenue growth is built on.",
    items: [
      {
        scoreLabel: "Performance",
        title: "Instant Loading",
        body: "An instant site cuts the bounce rate and dramatically raises final conversion.",
      },
      {
        scoreLabel: "Core Web Vitals",
        title: "Flawless Core Web Vitals",
        body: "Google rewards technically flawless sites. An immediate competitive edge on organic ranking.",
      },
      {
        scoreLabel: "Uptime",
        title: "Serverless Infrastructure",
        body: "Zero downtime during traffic peaks and maximum protection against security vulnerabilities.",
      },
    ],
  },

  showcase: {
    kicker: "[ Digital Foundry ]",
    titleOver: "Digital Foundry:",
    title: "Build your architecture",
    lead: "Don't buy sight unseen. Explore our library of real solutions (CRM, B2B portals, e-commerce), try the demos and build your Blueprint for an instant quote.",
    cta: "Enter the Foundry",
    items: [
      { tag: "B2B PORTAL", title: "Supplier Portal", desc: "Supplier onboarding, price lists and orders synchronised in real time." },
      { tag: "CRM", title: "CRM Dashboard", desc: "Pipeline, customers and sales metrics in a single dashboard." },
      { tag: "DISTRIBUTION", title: "Distributor Hub", desc: "Distributor network, multi-site stock and automated logistics." },
    ],
  },
}

export const STUDIO_STR = { it, en } satisfies Bundle<typeof it>
