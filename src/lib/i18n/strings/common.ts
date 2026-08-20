import type { Bundle } from "../t"

/* Testi che compaiono in più punti del sito e non appartengono a una pagina
   sola: il widget di contatto flottante, le pagine di servizio del router
   (404, manutenzione), le etichette di stato. */

const it = {
  floating: {
    trigger: "Contatta Nadia Maar",
    role: "Architettura Web & Strategia Digitale",
    available: "● Disponibile",
    location: "Remote · Europa",
    call: "Chiama",
    email: "Email",
    whatsapp: "WhatsApp",
    /** Messaggio già scritto in WhatsApp: evita il «Salve, avrei una domanda». */
    waGreeting: "Ciao Nadia! Ho visto il sito e vorrei parlare di un progetto.",
  },

  notFound: {
    code: "Errore 404",
    title: "Questa pagina non esiste",
    /* La frase è spezzata attorno all'indirizzo, che si mostra in monospazio.
       Tenerla in due pezzi invece che con un segnaposto è voluto: il pezzo
       dopo cambia posizione fra le due lingue solo qui, e così resta leggibile
       nel componente senza costruire JSX dentro il dizionario. */
    bodyBefore: "L'indirizzo",
    bodyAfter: "non corrisponde a nessuna pagina. Se ci sei arrivato da un link, l'ho già registrato: lo sistemo io.",
    home: "Torna alla home",
    contact: "Contatti",
  },

  maintenance: {
    title: "Torniamo fra poco",
    body: "Stiamo aggiornando il sito. L'area clienti resta accessibile su /cabinet.",
  },
}

const en: typeof it = {
  floating: {
    trigger: "Contact Nadia Maar",
    role: "Web Architecture & Digital Strategy",
    available: "● Available",
    location: "Remote · Europe",
    call: "Call",
    email: "Email",
    whatsapp: "WhatsApp",
    waGreeting: "Hi Nadia! I saw your site and I'd like to talk about a project.",
  },

  notFound: {
    code: "Error 404",
    title: "This page doesn't exist",
    bodyBefore: "The address",
    bodyAfter: "doesn't match any page. If you got here from a link, it's already been logged — I'll fix it.",
    home: "Back to home",
    contact: "Contact",
  },

  maintenance: {
    title: "Back shortly",
    body: "We're updating the site. The client area stays reachable at /cabinet.",
  },
}

export const COMMON_STR = { it, en } satisfies Bundle<typeof it>
