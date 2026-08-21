import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   TITOLO E DESCRIZIONE DI RIPIEGO, PER PAGINA E PER LINGUA.

   La fonte buona resta il pannello: le schede SEO scritte a mano vincono
   sempre su queste. Questi valori servono quando una scheda non c'è ancora —
   e senza di essi la pagina inglese erediterebbe il titolo italiano, che è
   il peggiore dei due mondi: indirizzo inglese, contenuto inglese, anteprima
   in italiano.

   Le chiavi sono i path canonici, gli stessi del router.
══════════════════════════════════════════════════════════════════════════ */

type PageMeta = { title: string; description: string }

const it: Record<string, PageMeta> = {
  "/": {
    title: "Nadia Maar — E-commerce Architect & Digital Strategist",
    description: "Architetture digitali che scalano: e-commerce ad alta conversione, applicazioni web, integrazione AI, SEO e performance marketing. Un solo referente dal codice alla crescita.",
  },
  "/about": {
    title: "Metodo e competenze — Nadia Maar",
    description: "Come si lavora: quattro fasi con durata dichiarata ed esito verificabile, i numeri dello studio e lo stack tecnologico che regge i progetti.",
  },
  "/projects": {
    title: "Case study — Nadia Maar",
    description: "Tre progetti reali raccontati per obiettivo, sfida tecnica, soluzione e impatto: piattaforma civica regionale, e-commerce enterprise, middleware di automazione B2B.",
  },
  "/architecture": {
    title: "L'architettura di questo sito — Nadia Maar",
    description: "Come è costruito nadiamaar.dev: prerender per i crawler, sicurezza a livello di database, caratteri self-hosted, analytics senza cookie e un budget di prestazione pubblico — con i numeri misurati sul tuo dispositivo.",
  },
  "/contatti": {
    title: "Contatti — Nadia Maar",
    description: "Scrivi come preferisci: modulo, email, telefono o Telegram. Risposta entro 24 ore nei giorni lavorativi, prima call gratuita.",
  },
  "/ecommerce": {
    title: "E-commerce ad alta conversione — Nadia Maar",
    description: "Architetture Shopify su misura e headless commerce: giacenze, cataloghi ad alto volume e logistica multi-corriere in un unico sistema.",
  },
  "/corporate": {
    title: "Siti corporate & lead generation — Nadia Maar",
    description: "Presenza digitale per aziende e studi professionali, costruita per reggere il confronto e trasformare la visita in un contatto qualificato.",
  },
  "/web-app": {
    title: "Applicazioni web & automazione — Nadia Maar",
    description: "Software su misura che collega CRM, ERP e sistemi di terze parti: via i passaggi manuali, i dati in un solo posto, strumenti che lavorano da soli.",
  },
  "/seo": {
    title: "SEO strategico & performance marketing — Nadia Maar",
    description: "Posizionamento organico previsto nell'architettura dal primo giorno e campagne Google e Meta governate sugli stessi dati.",
  },
  "/ai": {
    title: "Integrazione AI & sistemi intelligenti — Nadia Maar",
    description: "Agenti, modelli linguistici e ricerca sui documenti aziendali, integrati nei processi esistenti. Casi d'uso scelti perché hanno un ritorno calcolabile.",
  },
  "/foundry": {
    title: "Digital Foundry — la libreria di soluzioni",
    description: "Esplora soluzioni e componenti reali: portali B2B, e-commerce, landing e componenti UI. Salva ciò che serve nel Blueprint e ricevi un'offerta su misura.",
  },
}

const en: Record<string, PageMeta> = {
  "/": {
    title: "Nadia Maar — E-commerce Architect & Digital Strategist",
    description: "Digital architectures that scale: high-conversion e-commerce, web apps, AI integration, SEO and performance marketing. One point of contact from code to growth.",
  },
  "/about": {
    title: "Method and capabilities — Nadia Maar",
    description: "How the work runs: four phases with a stated duration and a verifiable outcome, the studio's numbers and the technology stack behind the projects.",
  },
  "/projects": {
    title: "Case studies — Nadia Maar",
    description: "Three real projects told through goal, technical challenge, solution and impact: a regional civic platform, an enterprise e-commerce, a B2B automation middleware.",
  },
  "/architecture": {
    title: "How this site is built — Nadia Maar",
    description: "Under the hood of nadiamaar.dev: crawler prerendering, database-level security, self-hosted fonts, cookieless analytics and a public performance budget — with numbers measured on your own device.",
  },
  "/contatti": {
    title: "Contact — Nadia Maar",
    description: "Reach out however you prefer: form, email, phone or Telegram. A reply within 24 hours on working days, first call free.",
  },
  "/ecommerce": {
    title: "High-conversion e-commerce — Nadia Maar",
    description: "Bespoke Shopify architectures and headless commerce: stock, high-volume catalogues and multi-carrier logistics in one system.",
  },
  "/corporate": {
    title: "Corporate sites & lead generation — Nadia Maar",
    description: "Digital presence for companies and professional firms, built to hold up under scrutiny and turn the visit into a qualified contact.",
  },
  "/web-app": {
    title: "Web apps & automation — Nadia Maar",
    description: "Bespoke software connecting CRM, ERP and third-party systems: manual steps removed, data in one place, tools that work on their own.",
  },
  "/seo": {
    title: "Strategic SEO & performance marketing — Nadia Maar",
    description: "Organic ranking planned into the architecture from day one, and Google and Meta campaigns governed on the same data.",
  },
  "/ai": {
    title: "AI integration & intelligent systems — Nadia Maar",
    description: "Agents, language models and search over company documents, built into existing processes. Use cases chosen because the return can be calculated.",
  },
  "/foundry": {
    title: "Digital Foundry — the solutions library",
    description: "Explore real solutions and components: B2B portals, e-commerce, landing pages and UI components. Save what you need to the Blueprint and get a tailored proposal.",
  },
}

export const META_STR = { it, en } satisfies Bundle<Record<string, PageMeta>>
