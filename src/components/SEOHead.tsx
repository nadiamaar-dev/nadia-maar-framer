import { useEffect } from "react"
import { DEFAULT_PUBLIC_SETTINGS, getSiteSettings } from "../lib/siteSettings"

/* ══════════════════════════════════════════════════════════════════════════
   <SEOHead slug="/about" />

   Legge la scheda di `page_seo_configs` per quella rotta e scrive title,
   description, canonical, Open Graph, Twitter e JSON-LD nel <head>. Se la
   scheda non c'è usa i predefiniti del sito, e se non ci sono nemmeno quelli
   lascia in piedi ciò che sta già in index.html.

   LIMITE DA CONOSCERE — questo è un sito a rendering client: i tag li scrive
   JavaScript, e Googlebot esegue JavaScript ma Bingbot, GPTBot, ClaudeBot e
   PerplexityBot in gran parte no. Per loro c'è /api/prerender, che consegna
   un HTML con gli stessi tag già dentro (vercel.json instrada lì i crawler
   riconosciuti). Questo componente serve a browser, condivisioni social
   fatte da app che eseguono JS, e a tenere il <head> coerente durante la
   navigazione interna.

   Tutti i nodi scritti qui portano `data-seo`, così al cambio rotta si
   rimuovono senza toccare i tag statici di index.html.
══════════════════════════════════════════════════════════════════════════ */

interface SeoRow {
  meta_title?: string | null
  meta_description?: string | null
  og_image_url?: string | null
  canonical_url?: string | null
  keywords?: string[] | null
  is_noindex?: boolean | null
  json_ld_schema?: Record<string, unknown> | null
}

const URL_ = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ""
const KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ""

/* Una scheda per rotta, richiesta al massimo una volta per sessione. */
const cache = new Map<string, Promise<SeoRow | null>>()

function fetchSeo(slug: string): Promise<SeoRow | null> {
  if (cache.has(slug)) return cache.get(slug)!
  const p: Promise<SeoRow | null> = (!URL_ || !KEY)
    ? Promise.resolve(null)
    : fetch(`${URL_}/rest/v1/page_seo_configs?select=*&page_slug=eq.${encodeURIComponent(slug)}&limit=1`, {
        headers: { apikey: KEY, accept: "application/json" },
      })
        .then(r => (r.ok ? r.json() : []))
        .then((rows: SeoRow[]) => rows?.[0] ?? null)
        .catch(() => null)
  cache.set(slug, p)
  return p
}

function drop() {
  document.querySelectorAll("[data-seo]").forEach(n => n.remove())
}

function meta(attr: "name" | "property", key: string, content: string) {
  if (!content) return
  const m = document.createElement("meta")
  m.setAttribute(attr, key)
  m.setAttribute("content", content)
  m.setAttribute("data-seo", "")
  document.head.appendChild(m)
}

function link(rel: string, href: string) {
  if (!href) return
  const l = document.createElement("link")
  l.rel = rel
  l.href = href
  l.setAttribute("data-seo", "")
  document.head.appendChild(l)
}

export default function SEOHead({ slug, fallbackTitle, fallbackDescription }: {
  slug: string
  /** Usato quando né la scheda né i predefiniti dicono nulla. */
  fallbackTitle?: string
  fallbackDescription?: string
}) {
  useEffect(() => {
    let alive = true

    Promise.all([fetchSeo(slug), getSiteSettings().catch(() => DEFAULT_PUBLIC_SETTINGS)])
      .then(([row, site]) => {
        if (!alive) return
        drop()

        const title = row?.meta_title || fallbackTitle || site.defaultMetaTitle
        const desc = row?.meta_description || fallbackDescription || site.defaultMetaDescription
        const image = row?.og_image_url || site.defaultOgImageUrl
        const canonical = row?.canonical_url || `${window.location.origin}${slug === "/" ? "/" : slug}`

        if (title) document.title = title
        if (desc) meta("name", "description", desc)
        if (row?.keywords?.length) meta("name", "keywords", row.keywords.join(", "))
        /* noindex vale solo se lo chiede la scheda: il predefinito è
           «indicizzabile», altrimenti un campo dimenticato spegne una pagina. */
        if (row?.is_noindex) meta("name", "robots", "noindex, nofollow")

        link("canonical", canonical)

        meta("property", "og:type", "website")
        meta("property", "og:url", canonical)
        meta("property", "og:site_name", site.siteName)
        if (title) meta("property", "og:title", title)
        if (desc) meta("property", "og:description", desc)
        if (image) meta("property", "og:image", image)

        meta("name", "twitter:card", image ? "summary_large_image" : "summary")
        if (title) meta("name", "twitter:title", title)
        if (desc) meta("name", "twitter:description", desc)
        if (image) meta("name", "twitter:image", image)

        if (row?.json_ld_schema) {
          const s = document.createElement("script")
          s.type = "application/ld+json"
          s.setAttribute("data-seo", "")
          s.textContent = JSON.stringify(row.json_ld_schema)
          document.head.appendChild(s)
        }
      })

    return () => { alive = false }
  }, [slug, fallbackTitle, fallbackDescription])

  return null
}
