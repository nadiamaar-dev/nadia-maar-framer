import { supabase } from "./core"
import type { PageSeoConfig } from "./types"
import { DEFAULT_LOCALE, type Locale, isLocale } from "../i18n/locales"

/* ══════════════════════════════════════════════════════════════════════════
   SCHEDE SEO PER PAGINA.

   Lettura pubblica (in una meta tag non c'è niente di riservato), scrittura
   solo admin. Le legge <SEOHead> nel browser, /api/sitemap per la sitemap,
   /api/llms per l'indice destinato ai bot e /api/prerender per servire ai
   crawler un HTML che le contiene già.
══════════════════════════════════════════════════════════════════════════ */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Le rotte che il router conosce: sono le pagine indicizzabili del sito. */
export const SITE_ROUTES: { slug: string; label: string }[] = [
  { slug: "/", label: "Home" },
  { slug: "/about", label: "Chi sono" },
  { slug: "/projects", label: "Progetti" },
  { slug: "/contatti", label: "Contatti" },
  { slug: "/foundry", label: "Digital Foundry" },
  { slug: "/ecommerce", label: "E-commerce" },
  { slug: "/corporate", label: "Siti corporate" },
  { slug: "/web-app", label: "Web app" },
  { slug: "/seo", label: "SEO" },
  { slug: "/ai", label: "AI" },
]

/** Rotte private: non entrano in sitemap né in llms.txt, e vanno bloccate. */
export const PRIVATE_ROUTES = ["/cabinet", "/dashboard"]

function map(r: any): PageSeoConfig {
  return {
    id: r.id,
    pageSlug: r.page_slug,
    /* Le righe scritte prima della migrazione multilingua non avevano la
       colonna: erano tutte italiane, ed è quello che il default dichiara. */
    locale: isLocale(r.locale) ? r.locale : DEFAULT_LOCALE,
    metaTitle: r.meta_title ?? undefined,
    metaDescription: r.meta_description ?? undefined,
    ogImageUrl: r.og_image_url ?? undefined,
    keywords: Array.isArray(r.keywords) ? r.keywords : [],
    canonicalUrl: r.canonical_url ?? undefined,
    isNoindex: !!r.is_noindex,
    jsonLdSchema: r.json_ld_schema ?? undefined,
    updatedAt: r.updated_at,
  }
}

/** Tutte le schede, tutte le lingue. Il pannello le raggruppa da sé. */
export async function fetchSeoConfigs(): Promise<PageSeoConfig[]> {
  const { data, error } = await supabase
    .from("page_seo_configs").select("*").order("page_slug").order("locale")
  if (error) throw error
  return (data ?? []).map(map)
}

export async function fetchSeoConfig(slug: string, locale: Locale = DEFAULT_LOCALE): Promise<PageSeoConfig | null> {
  const { data, error } = await supabase
    .from("page_seo_configs").select("*")
    .eq("page_slug", slug).eq("locale", locale).maybeSingle()
  if (error) throw error
  return data ? map(data) : null
}

/** Le lingue già pubblicate per una pagina: alimenta gli hreflang e dice al
 *  pannello quali schede esistono davvero. */
export async function fetchPublishedLocales(slug: string): Promise<Locale[]> {
  const { data, error } = await supabase
    .from("page_seo_configs").select("locale")
    .eq("page_slug", slug).eq("is_noindex", false)
  if (error) throw error
  return (data ?? []).map(r => r.locale).filter(isLocale).sort()
}

export type SeoDraft = Omit<PageSeoConfig, "id" | "updatedAt">

/** Una scheda per (slug, lingua): `upsert` sul vincolo unico evita la doppia
 *  domanda «esiste già?» → «allora aggiorna», che in mezzo può perdere una
 *  corsa. Il vincolo è composto, quindi `onConflict` deve nominarli entrambi:
 *  con il solo page_slug, salvare l'inglese sovrascriverebbe l'italiano. */
export async function saveSeoConfig(draft: SeoDraft): Promise<PageSeoConfig> {
  const { data, error } = await supabase
    .from("page_seo_configs")
    .upsert({
      page_slug: draft.pageSlug.trim(),
      locale: draft.locale,
      meta_title: draft.metaTitle?.trim() || null,
      meta_description: draft.metaDescription?.trim() || null,
      og_image_url: draft.ogImageUrl?.trim() || null,
      keywords: draft.keywords.map(k => k.trim()).filter(Boolean),
      canonical_url: draft.canonicalUrl?.trim() || null,
      is_noindex: draft.isNoindex,
      json_ld_schema: draft.jsonLdSchema ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "page_slug,locale" })
    .select().single()
  if (error) throw error
  return map(data)
}

export async function deleteSeoConfig(id: string): Promise<void> {
  const { error } = await supabase.from("page_seo_configs").delete().eq("id", id)
  if (error) throw error
}

/* ── Consigli, non regole ──────────────────────────────────────────────────
   Google non ha un limite in caratteri: taglia in pixel. Questi numeri sono
   la soglia oltre la quale il taglio diventa probabile, quindi si segnalano
   in giallo e non in rosso: un titolo lungo non è un errore. */
export const SEO_LIMITS = { title: 60, description: 158 } as const

export function seoHealth(c: Partial<PageSeoConfig>): { level: "ok" | "warn" | "todo"; note: string } {
  if (!c.metaTitle && !c.metaDescription) return { level: "todo", note: "Nessun metadato: eredita i predefiniti" }
  const problems: string[] = []
  if (!c.metaTitle) problems.push("manca il titolo")
  else if (c.metaTitle.length > SEO_LIMITS.title) problems.push(`titolo lungo (${c.metaTitle.length})`)
  if (!c.metaDescription) problems.push("manca la descrizione")
  else if (c.metaDescription.length > SEO_LIMITS.description) problems.push(`descrizione lunga (${c.metaDescription.length})`)
  if (!c.ogImageUrl) problems.push("nessuna immagine social")
  return problems.length ? { level: "warn", note: problems.join(" · ") } : { level: "ok", note: "Completa" }
}

/* ── Generatore JSON-LD ───────────────────────────────────────────────────
   Tre soli tipi, quelli che questo sito usa davvero. Un generatore che li
   copre tutti sarebbe un editor di testo con più passaggi. */
export type JsonLdKind = "Organization" | "WebSite" | "Service" | "BreadcrumbList"

export function buildJsonLd(kind: JsonLdKind, v: {
  name: string; url: string; description?: string; logo?: string; serviceType?: string
}): Record<string, unknown> {
  const base = { "@context": "https://schema.org" }
  switch (kind) {
    case "Organization":
      return { ...base, "@type": "Organization", name: v.name, url: v.url,
        ...(v.logo ? { logo: v.logo } : {}), ...(v.description ? { description: v.description } : {}) }
    case "WebSite":
      return { ...base, "@type": "WebSite", name: v.name, url: v.url,
        ...(v.description ? { description: v.description } : {}) }
    case "Service":
      return { ...base, "@type": "Service", name: v.name, serviceType: v.serviceType || v.name,
        provider: { "@type": "Organization", name: "Nadia Maar", url: new URL(v.url).origin },
        ...(v.description ? { description: v.description } : {}) }
    case "BreadcrumbList":
      return { ...base, "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: new URL(v.url).origin },
        { "@type": "ListItem", position: 2, name: v.name, item: v.url },
      ] }
  }
}
