import type { Bundle } from "../t"

/* Il configuratore a 4 passi: l'interfaccia. Le voci del catalogo — vettori,
   moduli, gruppi — stanno in strings/modules.ts, perché servono anche fuori
   da React (il PDF della roadmap). */

const it = {
  steps: ["Direzione", "Funzioni Base", "Moduli", "Blueprint"],
  stepperLabel: "Fasi del configuratore",

  hints: {
    vector: "Da dove parte il tuo progetto? Scegli la direzione principale: definisce il nucleo dell'architettura.",
    /* `{vector}` è il nome della direzione scelta, mostrato in grassetto. */
    base: "Funzioni portanti di {vector}. Attiva quelle che ti servono davvero: si può partire anche solo dal nucleo.",
    addons: "Moduli trasversali: si innestano su qualsiasi nucleo. Sono le richieste più frequenti del momento.",
    actions: "La tua architettura è pronta. Qui sotto la stima di impegno tecnico; il dettaglio completo è nel resoconto.",
  },

  nav: {
    back: "← Indietro",
    next: "Avanti",
    seeBlueprint: "Vedi il Blueprint",
    restart: "Ricomincia",
    pickFirst: "Scegli una direzione per continuare",
  },

  complexity: {
    label: "Complessità",
    duration: "Durata orientativa",
  },

  actions: {
    cta: "Richiedi Proposta",
    pdf: "Scarica Roadmap PDF",
    pdfBusy: "Preparazione…",
    note: "Un PDF con architettura, stima di impegno e fasi di lavoro: si scarica subito, senza lasciare l'email.",
  },

  canvas: {
    tag: "Architettura // Live",
    /* Singolare e plurale: "1 Modulo" / "3 Moduli". */
    moduleOne: "Modulo",
    moduleMany: "Moduli",
    waiting: "In attesa del nucleo",
    waitingHint: "Scegli una direzione: l'architettura si assembla qui, dal vivo.",
    removeModule: "Rimuovi il modulo {node}",
    remove: "Rimuovi",
  },

  summary: {
    tag: "Resoconto // Generato dalla tua selezione",
    empty: "Scegli la direzione del progetto: il resoconto dell'architettura si scrive da solo, in tempo reale.",
    goal: "[ Obiettivo ]",
    architecture: "[ Architettura ]",
  },

  modal: {
    close: "Chiudi",
    kicker: "[ Richiesta di Proposta ]",
    title: "Invia la tua Architettura",
    lead: "Ogni configurazione viene letta personalmente: risposta entro 24 ore. Il blueprint resta tuo, puoi salvarlo in PDF subito dopo l'invio.",
    selectedModules: "Moduli selezionati",
    name: "Nome",
    namePlaceholder: "Il tuo nome",
    email: "Email",
    emailPlaceholder: "nome@azienda.it",
    messenger: "Telegram / WhatsApp",
    messengerPlaceholder: "@username oppure +39…",
    error: "Invio non riuscito. Riprova tra qualche istante, oppure scrivici direttamente dalla sezione contatti.",
    sending: "Invio in corso…",
    submit: "Invia per l'Analisi",
    privacy: "Nessuna newsletter · Solo la risposta al tuo progetto",
    sentTitle: "Configurazione salvata",
    sentBody: "Ti ricontattiamo entro 24 ore per discutere i dettagli del progetto.",
    sentWithCopy: " Una copia del resoconto ti arriverà via email.",
    sentWithoutCopy: " Intanto porta con te il blueprint: è il riepilogo di ciò che hai appena composto.",
  },

  /* Il PDF/stampa della roadmap. Il documento esce nella lingua in cui è
     stato composto il blueprint: chi legge in inglese non deve ritrovarsi
     un allegato in italiano. */
  roadmap: {
    docTitle: "Roadmap",
    brand: "Nadia Maar — Digital Foundry",
    complexity: "Complessità",
    duration: "Durata orientativa",
    date: "Data",
    goal: "Obiettivo",
    architecture: "Architettura",
    components: "Componenti",
    phases: "Fasi di lavoro",
    noteTitle: "Nota",
    note: "Complessità e durata sono una stima tecnica preliminare, basata sui moduli selezionati. Il perimetro definitivo si stabilisce dopo l'analisi dei processi e dei sistemi esistenti.",
    footer: "Nadia Maar · Digital Foundry — Development & Growth",
    /** Ripetuto sotto la voce di uno scaffale che continua nella pagina dopo. */
    continued: "(segue)",
    fileName: "roadmap",
  },

  section: {
    kicker: "[ Digital Foundry — Configuratore ]",
    titlePresetBefore: "Completa la tua ",
    titleBefore: "Componi la tua ",
    titleHighlight: "Architettura",
    leadPreset: "Il nucleo è già quello di questa pagina. Aggiungi i moduli che ti servono attorno: il configuratore assembla dal vivo l'architettura, ne stima l'impegno e la traduce in un blueprint che puoi salvare.",
    lead: "Quattro passi, in linguaggio semplice. Il configuratore assembla dal vivo l'architettura tecnica della soluzione, ne stima l'impegno e la traduce in un blueprint che puoi salvare.",
  },
}

const en: typeof it = {
  steps: ["Direction", "Core Features", "Modules", "Blueprint"],
  stepperLabel: "Configurator steps",

  hints: {
    vector: "Where does your project start? Pick the main direction: it defines the core of the architecture.",
    base: "The load-bearing features of {vector}. Switch on the ones you genuinely need — starting from the core alone is fine.",
    addons: "Cross-cutting modules: they sit on any core. These are the most frequent requests right now.",
    actions: "Your architecture is ready. Below is the technical effort estimate; the full detail is in the summary.",
  },

  nav: {
    back: "← Back",
    next: "Next",
    seeBlueprint: "See the Blueprint",
    restart: "Start over",
    pickFirst: "Pick a direction to continue",
  },

  complexity: {
    label: "Complexity",
    duration: "Indicative duration",
  },

  actions: {
    cta: "Request a Proposal",
    pdf: "Download Roadmap PDF",
    pdfBusy: "Preparing…",
    note: "A PDF with the architecture, the effort estimate and the work phases: it downloads right away, no email required.",
  },

  canvas: {
    tag: "Architecture // Live",
    moduleOne: "Module",
    moduleMany: "Modules",
    waiting: "Waiting for the core",
    waitingHint: "Pick a direction: the architecture assembles here, live.",
    removeModule: "Remove the {node} module",
    remove: "Remove",
  },

  summary: {
    tag: "Summary // Generated from your selection",
    empty: "Pick the direction of the project: the architecture summary writes itself, in real time.",
    goal: "[ Goal ]",
    architecture: "[ Architecture ]",
  },

  modal: {
    close: "Close",
    kicker: "[ Proposal Request ]",
    title: "Send Your Architecture",
    lead: "Every configuration is read personally: an answer within 24 hours. The blueprint stays yours — you can save it as a PDF right after sending.",
    selectedModules: "Selected modules",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "name@company.com",
    messenger: "Telegram / WhatsApp",
    messengerPlaceholder: "@username or +39…",
    error: "Sending failed. Try again in a moment, or write to us directly from the contact section.",
    sending: "Sending…",
    submit: "Send for Analysis",
    privacy: "No newsletter · Only the answer to your project",
    sentTitle: "Configuration saved",
    sentBody: "We'll get back to you within 24 hours to discuss the details of the project.",
    sentWithCopy: " A copy of the summary will reach you by email.",
    sentWithoutCopy: " In the meantime take the blueprint with you: it's the summary of what you've just composed.",
  },

  roadmap: {
    docTitle: "Roadmap",
    brand: "Nadia Maar — Digital Foundry",
    complexity: "Complexity",
    duration: "Indicative duration",
    date: "Date",
    goal: "Goal",
    architecture: "Architecture",
    components: "Components",
    phases: "Work phases",
    noteTitle: "Note",
    note: "Complexity and duration are a preliminary technical estimate based on the selected modules. The final scope is set after analysing the existing processes and systems.",
    footer: "Nadia Maar · Digital Foundry — Development & Growth",
    continued: "(continued)",
    fileName: "roadmap",
  },

  section: {
    kicker: "[ Digital Foundry — Configurator ]",
    titlePresetBefore: "Complete your ",
    titleBefore: "Compose your ",
    titleHighlight: "Architecture",
    leadPreset: "The core is already the one on this page. Add the modules you need around it: the configurator assembles the architecture live, estimates the effort and turns it into a blueprint you can save.",
    lead: "Four steps, in plain language. The configurator assembles the technical architecture of the solution live, estimates the effort and turns it into a blueprint you can save.",
  },
}

export const CONFIGURATOR_STR = { it, en } satisfies Bundle<typeof it>
