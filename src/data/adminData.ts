export type ClientStatus = "active" | "onboarding" | "paused"
export type ClientPlan   = "starter" | "pro" | "enterprise"

export interface ClientRecord {
  id: string
  company: string
  contact: string
  email: string
  plan: ClientPlan
  status: ClientStatus
  projectsActive: number
  invoicesPending: number
  invoicePendingAmount: number
  ticketsOpen: number
  joinedAt: string
  lastActivity: string
  tags: string[]
}

export interface AdminKpi {
  activeClients: number
  projectsInProgress: number
  invoicesPendingCount: number
  invoicesPendingTotal: number
  ticketsOpen: number
}

export const MOCK_CLIENTS: ClientRecord[] = [
  {
    id: "c1",
    company: "Nexus Italia S.r.l.",
    contact: "Marco Ferretti",
    email: "m.ferretti@nexusitalia.it",
    plan: "enterprise",
    status: "active",
    projectsActive: 2,
    invoicesPending: 1,
    invoicePendingAmount: 3500,
    ticketsOpen: 0,
    joinedAt: "Gen 2025",
    lastActivity: "Oggi",
    tags: ["E-commerce", "SEO"],
  },
  {
    id: "c2",
    company: "Arteca Studio",
    contact: "Valentina Ruoti",
    email: "v.ruoti@arteca.studio",
    plan: "pro",
    status: "active",
    projectsActive: 1,
    invoicesPending: 2,
    invoicePendingAmount: 4200,
    ticketsOpen: 1,
    joinedAt: "Feb 2025",
    lastActivity: "Ieri",
    tags: ["Branding", "Web App"],
  },
  {
    id: "c3",
    company: "Meridia Consulting",
    contact: "Luca Amendola",
    email: "l.amendola@meridia.com",
    plan: "enterprise",
    status: "onboarding",
    projectsActive: 1,
    invoicesPending: 0,
    invoicePendingAmount: 0,
    ticketsOpen: 2,
    joinedAt: "Mag 2025",
    lastActivity: "2 giorni fa",
    tags: ["Corporate", "Analytics"],
  },
  {
    id: "c4",
    company: "Verde Agri Tech",
    contact: "Giorgia Mantovani",
    email: "g.mantovani@verdeagri.eu",
    plan: "pro",
    status: "active",
    projectsActive: 1,
    invoicesPending: 1,
    invoicePendingAmount: 2200,
    ticketsOpen: 0,
    joinedAt: "Mar 2025",
    lastActivity: "3 giorni fa",
    tags: ["Landing Page", "SEO"],
  },
  {
    id: "c5",
    company: "Forma Pura Design",
    contact: "Simone Calvi",
    email: "s.calvi@formapura.it",
    plan: "starter",
    status: "active",
    projectsActive: 1,
    invoicesPending: 0,
    invoicePendingAmount: 0,
    ticketsOpen: 0,
    joinedAt: "Apr 2025",
    lastActivity: "1 settimana fa",
    tags: ["Portfolio", "UI"],
  },
  {
    id: "c6",
    company: "Orbita Labs",
    contact: "Elena Schwarz",
    email: "e.schwarz@orbitalabs.io",
    plan: "enterprise",
    status: "active",
    projectsActive: 3,
    invoicesPending: 1,
    invoicePendingAmount: 4300,
    ticketsOpen: 0,
    joinedAt: "Gen 2025",
    lastActivity: "Oggi",
    tags: ["SaaS", "AI", "Web App"],
  },
  {
    id: "c7",
    company: "Studio Civico",
    contact: "Francesco Merlino",
    email: "f.merlino@studiocivico.it",
    plan: "pro",
    status: "paused",
    projectsActive: 0,
    invoicesPending: 0,
    invoicePendingAmount: 0,
    ticketsOpen: 0,
    joinedAt: "Dic 2024",
    lastActivity: "1 mese fa",
    tags: ["Corporate"],
  },
]

export const MOCK_KPI: AdminKpi = {
  activeClients: MOCK_CLIENTS.filter(c => c.status === "active").length,
  projectsInProgress: MOCK_CLIENTS.reduce((s, c) => s + c.projectsActive, 0),
  invoicesPendingCount: MOCK_CLIENTS.reduce((s, c) => s + c.invoicesPending, 0),
  invoicesPendingTotal: MOCK_CLIENTS.reduce((s, c) => s + c.invoicePendingAmount, 0),
  ticketsOpen: MOCK_CLIENTS.reduce((s, c) => s + c.ticketsOpen, 0),
}
