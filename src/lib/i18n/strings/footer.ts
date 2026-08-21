import type { Bundle } from "../t"

const it = {
  tagline: {
    line1: "E-commerce, Web Apps, AI e Performance Marketing.",
    line2: "Architettura digitale ad alte prestazioni.",
  },
  available: "Disponibile · 2026",
  navTitle: "Navigazione",
  contactTitle: "Contatti",
  location: "Remote · Europa",
  bookCall: "Prenota una Call",
  writeUs: "Scrivici",
  copyright: "© NADIA MAAR 2026 — Digital Architecture Studio",

  nav: {
    home: "Home",
    method: "Metodo",
    services: "Servizi",
    projects: "Progetti",
    architecture: "Architettura",
    configurator: "Configuratore",
    contact: "Contatti",
  },

  /* Il distintivo Lighthouse in fondo: il numero arriva da Google via
     /api/lighthouse, mai scritto a mano. */
  proof: {
    measured: "misurato da Google · mobile",
    aria: "Punteggio Lighthouse della home, misurato da PageSpeed Insights",
  },
}

const en: typeof it = {
  tagline: {
    line1: "E-commerce, web apps, AI and performance marketing.",
    line2: "High-performance digital architecture.",
  },
  available: "Available · 2026",
  navTitle: "Navigation",
  contactTitle: "Contact",
  location: "Remote · Europe",
  bookCall: "Book a Call",
  writeUs: "Write to us",
  copyright: "© NADIA MAAR 2026 — Digital Architecture Studio",

  nav: {
    home: "Home",
    method: "Method",
    services: "Services",
    projects: "Projects",
    architecture: "Architecture",
    configurator: "Configurator",
    contact: "Contact",
  },

  proof: {
    measured: "measured by Google · mobile",
    aria: "Lighthouse score of the home page, measured by PageSpeed Insights",
  },
}

export const FOOTER_STR = { it, en } satisfies Bundle<typeof it>
