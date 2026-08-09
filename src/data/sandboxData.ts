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
  /* screenshot mostrato in cima alla scheda. Senza, la scheda mostra un
     segnaposto con le iniziali del titolo sul colore `accent`. */
  previewUrl?: string
  liveUrl?: string
  /* Le schede con una demo interattiva si aprono in anteprima al clic.
     Il valore è l'id della demo, non un booleano: le prossime avranno la loro. */
  demo?: "supplier-portal"
  accent: string  // hex for card glow
}

export const SANDBOX_ITEMS: SandboxItem[] = [
  /* ── B2B Portals ── */
  {
    id: "b2b-supplier-portal",
    title: "Supplier Portal",
    description: "Catalogo, ordini e fatturazione B2B: i prezzi si calcolano da soli dai costi dei fornitori.",
    category: "B2B Portals",
    type: "full-site",
    tech: ["React", "Node.js", "PostgreSQL", "BullMQ"],
    accent: "#1E6FAF",
    demo: "supplier-portal",
    previewUrl: "/previews/supplier-portal.jpg",
  },
  {
    id: "b2b-crm-dashboard",
    title: "CRM Dashboard",
    description: "Pipeline visuale, anagrafica clienti e report esportabili in PDF.",
    category: "B2B Portals",
    type: "full-site",
    tech: ["React", "TypeScript", "Chart.js", "REST API"],
    accent: "#2A8A6E",
  },
  {
    id: "b2b-distributor-hub",
    title: "Distributor Hub",
    description: "Gestione agenti, listini per area geografica e ordini white-label.",
    category: "B2B Portals",
    type: "full-site",
    tech: ["Next.js", "Prisma", "Stripe", "Vercel"],
    accent: "#7B4FCF",
  },

  /* ── E-commerce & Shopify ── */
  {
    id: "shopify-luxury-fashion",
    title: "Luxury Fashion Store",
    description: "Storefront Shopify con configuratore 3D e checkout ottimizzato per mobile.",
    category: "E-commerce & Shopify",
    type: "full-site",
    tech: ["Shopify", "Liquid", "Three.js", "Alpine.js"],
    accent: "#B04A38",
  },
  {
    id: "shopify-b2b-wholesale",
    title: "Wholesale B2B Shop",
    description: "Prezzi per volume, listini multipli e ordini ricorrenti, con ERP collegato.",
    category: "E-commerce & Shopify",
    type: "full-site",
    tech: ["Shopify Plus", "Liquid", "Klaviyo", "ERP API"],
    accent: "#C17D1E",
  },
  {
    id: "ecommerce-headless",
    title: "Headless Commerce",
    description: "Headless su Next.js e Shopify: performance al limite e SEO nativa.",
    category: "E-commerce & Shopify",
    type: "full-site",
    tech: ["Next.js", "Shopify Storefront API", "Sanity", "Vercel"],
    accent: "#10B981",
  },

  /* ── Landing Pages ── */
  {
    id: "landing-saas-launch",
    title: "SaaS Launch Page",
    description: "Hero animato, pricing interattivo e form di pre-registrazione collegato al CRM.",
    category: "Landing Pages",
    type: "full-site",
    tech: ["React", "Framer Motion", "Resend", "Vercel"],
    accent: "#1E6FAF",
  },
  {
    id: "landing-event-conference",
    title: "Event & Conference",
    description: "Countdown live, agenda interattiva e registrazione biglietti.",
    category: "Landing Pages",
    type: "full-site",
    tech: ["Next.js", "Stripe", "SendGrid", "Supabase"],
    accent: "#7B4FCF",
  },
  {
    id: "landing-product-reveal",
    title: "Product Reveal",
    description: "Scroll storytelling, parallasse e video background per il lancio prodotto.",
    category: "Landing Pages",
    type: "full-site",
    tech: ["React", "GSAP", "Three.js", "Framer Motion"],
    accent: "#B04A38",
  },

  /* ── UI Components ── */
  {
    id: "ui-glass-nav",
    title: "Glass Navigation System",
    description: "Header e menu glassmorphism, con megamenu e sezione attiva sullo scroll.",
    category: "UI Components",
    type: "component",
    tech: ["React", "TypeScript", "Framer Motion"],
    accent: "#2A8A6E",
  },
  {
    id: "ui-data-table",
    title: "Advanced Data Table",
    description: "Tabella enterprise con filtri avanzati, paginazione ed export CSV/Excel.",
    category: "UI Components",
    type: "component",
    tech: ["React", "TypeScript", "TanStack Table"],
    accent: "#1E6FAF",
  },
  {
    id: "ui-form-wizard",
    title: "Multi-Step Form Wizard",
    description: "Wizard multi-step con validazione in tempo reale e bozza salvata in automatico.",
    category: "UI Components",
    type: "component",
    tech: ["React", "TypeScript", "React Hook Form", "Zod"],
    accent: "#C17D1E",
  },
  {
    id: "ui-dashboard-widgets",
    title: "KPI Dashboard Widgets",
    description: "Widget da dashboard — sparkline, trend, heatmap — riordinabili col drag-and-drop.",
    category: "UI Components",
    type: "component",
    tech: ["React", "Recharts", "DnD Kit", "TypeScript"],
    accent: "#10B981",
  },
]
