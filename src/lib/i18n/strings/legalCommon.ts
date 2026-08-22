import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   LA CORNICE DEI DOCUMENTI LEGALI.

   Non il testo delle informative — quello sta in legalPrivacy.ts,
   legalCookie.ts e legalTerms.ts — ma tutto ciò che li circonda: l'indice,
   la riga dell'ultimo aggiornamento, il blocco di identificazione del
   titolare e i rimandi fra un documento e l'altro. Sta a parte perché è
   identico in tutti e tre, e tre copie dello stesso indice sono tre indici
   che prima o poi si scrivono in modo diverso.
══════════════════════════════════════════════════════════════════════════ */

const it = {
  toc: "Indice",
  updated: "Ultimo aggiornamento",
  backToTop: "Torna all'indice",
  print: "Stampa o salva in PDF",
  seeAlsoTitle: "Documenti collegati",

  /* Il blocco di identificazione in cima a ogni documento. */
  identity: {
    title: "Titolare del trattamento e gestore del sito",
    name: "Denominazione",
    address: "Sede",
    vat: "Partita IVA",
    taxCode: "Codice fiscale",
    email: "Email",
    pec: "PEC",
    phone: "Telefono",
    site: "Sito",
    /* Mostrato finché sede e partita IVA non esistono. Dirlo apertamente è
       più corretto che lasciare due righe vuote: chi legge capisce che il
       dato manca perché non è ancora stato attribuito, non perché sia
       stato omesso. */
    pending:
      "Sede legale e partita IVA sono in corso di attribuzione e verranno pubblicate in questa pagina non appena disponibili. Nel frattempo il canale valido per qualsiasi comunicazione, anche formale, è l'indirizzo email indicato sopra, al quale il Titolare risponde direttamente.",
  },

  /* Il richiamo che compare sotto i moduli: l'articolo 13 chiede che
     l'informativa sia data PRIMA della raccolta, non dopo. */
  formNotice: "Informativa privacy",

  /* Le etichette dei link nel footer e nel banner del consenso. */
  links: {
    privacy: "Privacy",
    cookie: "Cookie",
    terms: "Termini",
    legalNote: "Note legali",
  },
}

const en: typeof it = {
  toc: "Contents",
  updated: "Last updated",
  backToTop: "Back to contents",
  print: "Print or save as PDF",
  seeAlsoTitle: "Related documents",

  identity: {
    title: "Data controller and site operator",
    name: "Name",
    address: "Registered office",
    vat: "VAT number",
    taxCode: "Tax code",
    email: "Email",
    pec: "Certified email (PEC)",
    phone: "Phone",
    site: "Website",
    pending:
      "The registered office and VAT number are in the process of being assigned and will be published on this page as soon as they are available. In the meantime, the valid channel for any communication, including formal notices, is the email address shown above, which the controller answers personally.",
  },

  formNotice: "Privacy notice",

  links: {
    privacy: "Privacy",
    cookie: "Cookies",
    terms: "Terms",
    legalNote: "Legal notice",
  },
}

export const LEGAL_COMMON_STR = { it, en } satisfies Bundle<typeof it>
