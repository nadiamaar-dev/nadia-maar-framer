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
    configurator: "Configuratore",
    contact: "Contatti",
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
    configurator: "Configurator",
    contact: "Contact",
  },
}

export const FOOTER_STR = { it, en } satisfies Bundle<typeof it>
