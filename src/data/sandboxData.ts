export type SandboxCategory =
  | "All"
  | "B2B Portals"
  | "E-commerce & Shopify"
  | "Landing Pages"
  | "UI Components"

export type SandboxType = "full-site" | "component"

export interface SandboxItem {
  id: string
  title: string
  description: string
  category: Exclude<SandboxCategory, "All">
  type: SandboxType
  tech: string[]
  previewUrl?: string
  liveUrl?: string
  accent: string  // hex for card glow
}

export const SANDBOX_ITEMS: SandboxItem[] = [
  /* ── B2B Portals ── */
  {
    id: "b2b-supplier-portal",
    title: "Supplier Portal",
    description: "Portale B2B per la gestione ordini, catalogo riservato e fatturazione integrata. Accessi multi-ruolo e dashboard KPI in tempo reale.",
    category: "B2B Portals",
    type: "full-site",
    tech: ["React", "Node.js", "PostgreSQL", "JWT"],
    accent: "#1E6FAF",
  },
  {
    id: "b2b-crm-dashboard",
    title: "CRM Dashboard",
    description: "Interfaccia CRM con pipeline visuale, anagrafica clienti avanzata, tracking delle opportunità e report esportabili in PDF.",
    category: "B2B Portals",
    type: "full-site",
    tech: ["React", "TypeScript", "Chart.js", "REST API"],
    accent: "#2A8A6E",
  },
  {
    id: "b2b-distributor-hub",
    title: "Distributor Hub",
    description: "Hub dedicato per reti distributive: gestione agenti, listini prezzi per area geografica e portale ordini white-label.",
    category: "B2B Portals",
    type: "full-site",
    tech: ["Next.js", "Prisma", "Stripe", "Vercel"],
    accent: "#7B4FCF",
  },

  /* ── E-commerce & Shopify ── */
  {
    id: "shopify-luxury-fashion",
    title: "Luxury Fashion Store",
    description: "Storefront Shopify premium con configuratore prodotto 3D, lookbook interattivo e checkout ottimizzato per conversioni su mobile.",
    category: "E-commerce & Shopify",
    type: "full-site",
    tech: ["Shopify", "Liquid", "Three.js", "Alpine.js"],
    accent: "#B04A38",
  },
  {
    id: "shopify-b2b-wholesale",
    title: "Wholesale B2B Shop",
    description: "E-commerce wholesale con prezzi per volume, gestione listini multipli, ordini ricorrenti e integrazione ERP via webhook.",
    category: "E-commerce & Shopify",
    type: "full-site",
    tech: ["Shopify Plus", "Liquid", "Klaviyo", "ERP API"],
    accent: "#C17D1E",
  },
  {
    id: "ecommerce-headless",
    title: "Headless Commerce",
    description: "Architettura headless su Next.js con Shopify Storefront API: performance al limite, SEO nativa, PWA e integrazione CMS.",
    category: "E-commerce & Shopify",
    type: "full-site",
    tech: ["Next.js", "Shopify Storefront API", "Sanity", "Vercel"],
    accent: "#10B981",
  },

  /* ── Landing Pages ── */
  {
    id: "landing-saas-launch",
    title: "SaaS Launch Page",
    description: "Landing page per lancio SaaS con hero animato, sezione pricing interattiva, testimonial e form di pre-registrazione con integrazione CRM.",
    category: "Landing Pages",
    type: "full-site",
    tech: ["React", "Framer Motion", "Resend", "Vercel"],
    accent: "#1E6FAF",
  },
  {
    id: "landing-event-conference",
    title: "Event & Conference",
    description: "Pagina evento con countdown live, agenda interattiva, sistema di registrazione e integrazione biglietteria. Ottimizzata per conversioni.",
    category: "Landing Pages",
    type: "full-site",
    tech: ["Next.js", "Stripe", "SendGrid", "Supabase"],
    accent: "#7B4FCF",
  },
  {
    id: "landing-product-reveal",
    title: "Product Reveal",
    description: "Landing cinematografica per lancio prodotto: scroll storytelling, animazioni parallasse, video background e CTA ad alto impatto.",
    category: "Landing Pages",
    type: "full-site",
    tech: ["React", "GSAP", "Three.js", "Framer Motion"],
    accent: "#B04A38",
  },

  /* ── UI Components ── */
  {
    id: "ui-glass-nav",
    title: "Glass Navigation System",
    description: "Header + menu laterale animato in stile glassmorphism. Supporto multi-lingua, megamenu e indicatore sezione attiva con scroll detection.",
    category: "UI Components",
    type: "component",
    tech: ["React", "TypeScript", "Framer Motion"],
    accent: "#2A8A6E",
  },
  {
    id: "ui-data-table",
    title: "Advanced Data Table",
    description: "Tabella dati enterprise con ordinamento multi-colonna, filtri avanzati, paginazione, esportazione CSV/Excel e virtualizzazione per grandi dataset.",
    category: "UI Components",
    type: "component",
    tech: ["React", "TypeScript", "TanStack Table"],
    accent: "#1E6FAF",
  },
  {
    id: "ui-form-wizard",
    title: "Multi-Step Form Wizard",
    description: "Wizard a step multipli con validazione real-time, salvataggio bozza in localStorage, animazioni di transizione e progress tracking visuale.",
    category: "UI Components",
    type: "component",
    tech: ["React", "TypeScript", "React Hook Form", "Zod"],
    accent: "#C17D1E",
  },
  {
    id: "ui-dashboard-widgets",
    title: "KPI Dashboard Widgets",
    description: "Set di widget da dashboard: grafici sparkline, metriche con trend, heatmap e card animati. Drag-and-drop per personalizzare il layout.",
    category: "UI Components",
    type: "component",
    tech: ["React", "Recharts", "DnD Kit", "TypeScript"],
    accent: "#10B981",
  },
]
