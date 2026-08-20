import type { Bundle } from "../t"

/* Intestazione e menu. Le etichette restano corte anche in inglese: nella
   barra lo spazio è quello che è, e una voce che va a capo è peggio di una
   parola meno precisa. */

const it = {
  eyebrow: "[ Navigazione ]",
  closeMenu: "Chiudi menu",
  menu: "Menu",
  available: "Disponibile · 2026",
  configurator: "Configuratore",
  dashboard: "Dashboard",
  signOut: "Esci",
  clientArea: "Area Clienti",

  nav: {
    home: "Home",
    /* "About" suonava come "chi sono": la pagina è il metodo di lavoro. */
    method: "Metodo",
    services: "Servizi",
    projects: "Progetti",
    lab: "Lab",
    contact: "Contatti",
  },

  /* Etichette corte dei cinque servizi: nel menu contano leggibilità e
     riconoscibilità, non il titolo completo della pagina. */
  services: {
    ecommerce: "E-commerce",
    corporate: "Siti Corporate",
    webapp: "Applicazioni Web",
    seo: "SEO & Performance",
    ai: "Integrazione AI",
  },
}

const en: typeof it = {
  eyebrow: "[ Navigation ]",
  closeMenu: "Close menu",
  menu: "Menu",
  available: "Available · 2026",
  configurator: "Configurator",
  dashboard: "Dashboard",
  signOut: "Sign out",
  clientArea: "Client Area",

  nav: {
    home: "Home",
    method: "Method",
    services: "Services",
    projects: "Projects",
    lab: "Lab",
    contact: "Contact",
  },

  services: {
    ecommerce: "E-commerce",
    corporate: "Corporate Sites",
    webapp: "Web Apps",
    seo: "SEO & Performance",
    ai: "AI Integration",
  },
}

export const HEADER_STR = { it, en } satisfies Bundle<typeof it>
