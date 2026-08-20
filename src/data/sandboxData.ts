import type { DemoId } from "./demos"
import { DEFAULT_LOCALE, type Locale } from "../lib/i18n/locales"
import { LAB_STR } from "../lib/i18n/strings/lab"
import { pick } from "../lib/i18n/t"

export type SandboxCategory =
  | "All"
  | "B2B Portals"
  | "E-commerce & Shopify"
  | "Landing Pages"
  | "UI Components"

export type SandboxType = "full-site" | "component"

export interface SandboxItem {
  id: string
  /** Titolo e descrizione arrivano dal dizionario: vedi lib/i18n/strings/lab.ts */
  title: string
  description: string
  category: Exclude<SandboxCategory, "All">
  type: SandboxType
  tech: string[]
  /* Screenshot in cima alla scheda, indicato SENZA estensione: la scheda
     compone da sé le varianti (AVIF, WebP, JPEG a 480 e 960 px) e lascia
     scegliere al browser. Indicare un solo file voleva dire servire a tutti
     lo stesso JPEG da 1600 px per un riquadro largo 360.
     Senza questo campo la scheda mostra un segnaposto con le iniziali del
     titolo sul colore `accent`. */
  previewUrl?: string
  liveUrl?: string
  /* Le schede con una demo interattiva si aprono in anteprima al clic.
     Il valore è l'id della demo, non un booleano: ognuna ha la sua rotta,
     elencata una volta sola in data/demos.ts. */
  demo?: DemoId
  accent: string  // hex for card glow
}

/* La struttura delle voci: categoria, tipo, tecnologie, colore, anteprima.
   Titolo e descrizione sono testo e vivono in lib/i18n/strings/lab.ts,
   indicizzati per `id`; `sandboxItems(locale)` qui sotto li unisce. */
export const SANDBOX_ART: Omit<SandboxItem, "title" | "description">[] = [
  /* ── B2B Portals ── */
  {
    id: "b2b-supplier-portal",
    category: "B2B Portals",
    type: "full-site",
    tech: ["React", "Node.js", "PostgreSQL", "BullMQ"],
    accent: "#1E6FAF",
    demo: "supplier-portal",
    previewUrl: "/previews/supplier-portal",
  },
  {
    id: "b2b-crm-dashboard",
    category: "B2B Portals",
    type: "full-site",
    tech: ["React", "TypeScript", "SVG", "pdf-lib"],
    accent: "#C6F24E",
    demo: "crm-dashboard",
    previewUrl: "/previews/crm-dashboard",
  },
  {
    id: "b2b-distributor-hub",
    category: "B2B Portals",
    type: "full-site",
    tech: ["Next.js", "Prisma", "Stripe", "Vercel"],
    accent: "#7B4FCF",
  },

  /* ── E-commerce & Shopify ── */
  {
    id: "shopify-luxury-fashion",
    category: "E-commerce & Shopify",
    type: "full-site",
    tech: ["Shopify", "Liquid", "Three.js", "Alpine.js"],
    accent: "#B04A38",
  },
  {
    id: "shopify-b2b-wholesale",
    category: "E-commerce & Shopify",
    type: "full-site",
    tech: ["Shopify Plus", "Liquid", "Klaviyo", "ERP API"],
    accent: "#C17D1E",
  },
  {
    id: "ecommerce-headless",
    category: "E-commerce & Shopify",
    type: "full-site",
    tech: ["Next.js", "Shopify Storefront API", "Sanity", "Vercel"],
    accent: "#10B981",
  },

  /* ── Landing Pages ── */
  {
    id: "landing-saas-launch",
    category: "Landing Pages",
    type: "full-site",
    tech: ["React", "Framer Motion", "Resend", "Vercel"],
    accent: "#1E6FAF",
  },
  {
    id: "landing-event-conference",
    category: "Landing Pages",
    type: "full-site",
    tech: ["Next.js", "Stripe", "SendGrid", "Supabase"],
    accent: "#7B4FCF",
  },
  {
    id: "landing-product-reveal",
    category: "Landing Pages",
    type: "full-site",
    tech: ["React", "GSAP", "Three.js", "Framer Motion"],
    accent: "#B04A38",
  },

  /* ── UI Components ── */
  {
    id: "ui-glass-nav",
    category: "UI Components",
    type: "component",
    tech: ["React", "TypeScript", "Framer Motion"],
    accent: "#2A8A6E",
  },
  {
    id: "ui-data-table",
    category: "UI Components",
    type: "component",
    tech: ["React", "TypeScript", "TanStack Table"],
    accent: "#1E6FAF",
  },
  {
    id: "ui-form-wizard",
    category: "UI Components",
    type: "component",
    tech: ["React", "TypeScript", "React Hook Form", "Zod"],
    accent: "#C17D1E",
  },
  {
    id: "ui-dashboard-widgets",
    category: "UI Components",
    type: "component",
    tech: ["React", "Recharts", "DnD Kit", "TypeScript"],
    accent: "#10B981",
  },
]

/** Le voci della libreria, già nella lingua richiesta. */
export function sandboxItems(locale: Locale = DEFAULT_LOCALE): SandboxItem[] {
  const txt = pick(LAB_STR, locale).items
  return SANDBOX_ART.map(a => ({ ...a, ...txt[a.id as keyof typeof txt] }))
}
