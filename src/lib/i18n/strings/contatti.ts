import type { Bundle } from "../t"

/* Pagina /contatti. La traduzione tiene il registro dell'originale: diretto,
   senza formule di cortesia commerciali ("we would be delighted to…") che in
   inglese suonano da agenzia generalista e qui stonerebbero. */

const it = {
  hero: {
    kicker: "Contatti",
    title: "Parliamo del tuo progetto",
    lead: "Scrivi come preferisci: modulo, email, telefono o Telegram. Rispondiamo entro 24 ore nei giorni lavorativi, e la prima call è gratuita.",
  },

  channels: {
    email: "Email",
    phone: "Telefono",
    telegram: "Telegram",
  },

  how: {
    kicker: "Come Scrivere",
    title: "Quattro righe bastano",
    lead: "Non serve un capitolato. Questi quattro punti ci evitano un giro di domande e ti fanno arrivare una risposta utile già al primo scambio.",
    points: [
      "Che cosa vendi o gestisci, e su quale piattaforma gira oggi",
      "Che cosa funziona già e che cosa invece ti fa perdere tempo o vendite",
      "Il risultato che vuoi ottenere, possibilmente in numeri",
      "Entro quando ti serve, e se c'è una scadenza fissa",
    ],
  },

  form: {
    name: "Nome",
    namePlaceholder: "Il tuo nome",
    email: "Email",
    emailPlaceholder: "nome@azienda.it",
    company: "Azienda",
    companyOptional: "(opzionale)",
    companyPlaceholder: "Nome dell'azienda",
    project: "Il progetto",
    projectPlaceholder: "Che cosa vendi o gestisci, che cosa funziona già, che cosa vorresti ottenere e in quali tempi.",
    sending: "Invio in corso…",
    submit: "Invia la richiesta",
    privacy: "I dati servono solo a risponderti. Nessuna newsletter, nessuna condivisione con terzi.",
    /* `{email}` viene sostituito con l'indirizzo vero: non si spezza la frase
       in due pezzi, perché in inglese l'ordine delle parti cambia. */
    failed: "Invio non riuscito. Riprova fra un istante, oppure scrivici direttamente a {email}.",
    sentTitle: "Richiesta ricevuta",
    sentBody: "Ti rispondiamo entro 24 ore, nei giorni lavorativi. Se serve prima, il telefono qui sopra è il modo più rapido.",
  },

  after: {
    kicker: "Dopo l'Invio",
    title: "Che cosa succede dopo",
    steps: [
      { n: "01", t: "Leggiamo", d: "Ogni richiesta viene letta personalmente. Nessun assistente automatico in mezzo." },
      { n: "02", t: "Rispondiamo entro 24 ore", d: "Nei giorni lavorativi. Nella risposta trovi una prima valutazione tecnica, non un listino." },
      { n: "03", t: "Ci parliamo", d: "Una call di trenta minuti per capire se ha senso lavorare insieme. Gratuita e senza impegno." },
    ],
  },

  alt: {
    kicker: "In Alternativa",
    title: "Preferisci comporre invece di scrivere?",
    body: "Il configuratore monta l'architettura in quattro passi e la traduce in un blueprint scaricabile. La richiesta arriva già con il perimetro definito.",
    cta: "Apri il configuratore",
    dialogLabel: "Configuratore",
    close: "Chiudi",
  },

  legal: { vat: "P.IVA", pec: "PEC" },
}

const en: typeof it = {
  hero: {
    kicker: "Contact",
    title: "Let's talk about your project",
    lead: "Reach out however you prefer: form, email, phone or Telegram. We reply within 24 hours on working days, and the first call is free.",
  },

  channels: {
    email: "Email",
    phone: "Phone",
    telegram: "Telegram",
  },

  how: {
    kicker: "How To Write",
    title: "Four lines are enough",
    lead: "No specification document needed. These four points save us a round of questions and get you a useful answer on the very first exchange.",
    points: [
      "What you sell or manage, and which platform it runs on today",
      "What already works, and what is costing you time or sales",
      "The result you want, in numbers if possible",
      "When you need it by, and whether there is a hard deadline",
    ],
  },

  form: {
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "name@company.com",
    company: "Company",
    companyOptional: "(optional)",
    companyPlaceholder: "Company name",
    project: "The project",
    projectPlaceholder: "What you sell or manage, what already works, what you want to achieve and on what timeline.",
    sending: "Sending…",
    submit: "Send request",
    privacy: "Your details are used only to reply to you. No newsletter, nothing shared with third parties.",
    failed: "Sending failed. Try again in a moment, or write to us directly at {email}.",
    sentTitle: "Request received",
    sentBody: "We'll reply within 24 hours on working days. If you need us sooner, the phone number above is the fastest route.",
  },

  after: {
    kicker: "After Sending",
    title: "What happens next",
    steps: [
      { n: "01", t: "We read it", d: "Every request is read personally. No automated assistant in between." },
      { n: "02", t: "We reply within 24 hours", d: "On working days. The reply carries a first technical assessment, not a price list." },
      { n: "03", t: "We talk", d: "A thirty-minute call to see whether working together makes sense. Free, no strings attached." },
    ],
  },

  alt: {
    kicker: "Alternatively",
    title: "Prefer building to writing?",
    body: "The configurator assembles the architecture in four steps and turns it into a downloadable blueprint. The request arrives with its scope already defined.",
    cta: "Open the configurator",
    dialogLabel: "Configurator",
    close: "Close",
  },

  legal: { vat: "VAT", pec: "PEC" },
}

export const CONTATTI_STR = { it, en } satisfies Bundle<typeof it>
