import { useEffect } from "react"
import { DEFAULT_PUBLIC_SETTINGS, getSiteSettings } from "../lib/siteSettings"
import {
  DEFAULT_LOCALE,
  LOCALE_TAG,
  type Locale,
  OG_LOCALE,
  isLocale,
  localizePath,
  localizedUrl,
} from "../lib/i18n/locales"
import { META_STR } from "../lib/i18n/strings/meta"
import { pick } from "../lib/i18n/t"

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
  locale?: string | null
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

/* Tutte le lingue di una rotta in una richiesta sola, al massimo una volta
   per sessione: una riempie i tag, le altre dicono quali hreflang esistono. */
const cache = new Map<string, Promise<SeoRow[]>>()

function fetchSeo(slug: string): Promise<SeoRow[]> {
  if (cache.has(slug)) return cache.get(slug)!
  const p: Promise<SeoRow[]> = (!URL_ || !KEY)
    ? Promise.resolve([])
    : fetch(`${URL_}/rest/v1/page_seo_configs?select=*&page_slug=eq.${encodeURIComponent(slug)}`, {
        headers: { apikey: KEY, accept: "application/json" },
      })
        .then(r => (r.ok ? r.json() : []))
        .then((rows: SeoRow[]) => rows ?? [])
        .catch(() => [])
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

function link(rel: string, href: string, hreflang?: string) {
  if (!href) return
  const l = document.createElement("link")
  l.rel = rel
  l.href = href
  if (hreflang) l.hreflang = hreflang
  l.setAttribute("data-seo", "")
  document.head.appendChild(l)
}

export default function SEOHead({ slug, locale = DEFAULT_LOCALE, fallbackTitle, fallbackDescription }: {
  /** Path canonico, senza prefisso di lingua: "/about", non "/en/about". */
  slug: string
  locale?: Locale
  /** Usato quando né la scheda né i predefiniti dicono nulla. */
  fallbackTitle?: string
  fallbackDescription?: string
}) {
  useEffect(() => {
    let alive = true

    Promise.all([fetchSeo(slug), getSiteSettings().catch(() => DEFAULT_PUBLIC_SETTINGS)])
      .then(([rows, site]) => {
        if (!alive) return
        drop()

        const row = rows.find(r => (r.locale ?? DEFAULT_LOCALE) === locale) ?? null

        /* Le lingue pubblicate per questa pagina. Stessa regola del
           prerender: una versione noindex non è un'alternativa da annunciare,
           e una lingua senza scheda non è tradotta. */
        const published = rows
          .filter(r => r.is_noindex !== true && isLocale(r.locale ?? DEFAULT_LOCALE))
          .map(r => (r.locale ?? DEFAULT_LOCALE) as Locale)
          .sort()

        const origin = window.location.origin
        /* Ordine: la scheda scritta a mano nel pannello, poi ciò che passa la
           pagina, poi il titolo di ripiego della lingua corrente, e infine il
           default globale del sito — che è in italiano, quindi per l'inglese
           è l'ultima spiaggia e non la prima scelta. */
        const preset = pick(META_STR, locale)[slug]
        const title = row?.meta_title || fallbackTitle || preset?.title || site.defaultMetaTitle
        const desc = row?.meta_description || fallbackDescription || preset?.description || site.defaultMetaDescription
        /* Senza immagine propria si usa quella generata da /api/og: la
           stessa che riceve un crawler, così l'anteprima è una sola. */
        const image = row?.og_image_url || site.defaultOgImageUrl
          || `${origin}/api/og?slug=${encodeURIComponent(slug)}&locale=${locale}`
        const canonical = row?.canonical_url || localizedUrl(origin, slug, locale)

        if (title) document.title = title
        /* Il guscio statico porta una description propria, e l'HTML dei
           crawler (prerender) un'altra ancora: questo componente sta per
           scriverne la versione giusta, e due description sulla stessa
           pagina lasciano al crawler la scelta di quale contare. Googlebot
           esegue JavaScript: passa anche di qui, non solo dal prerender. */
        if (desc) {
          document.querySelectorAll('meta[name="description"]:not([data-seo])').forEach(n => n.remove())
          meta("name", "description", desc)
        }
        if (row?.keywords?.length) meta("name", "keywords", row.keywords.join(", "))
        /* noindex se lo chiede la scheda, oppure se questa lingua non ha una
           scheda affatto: senza traduzione il testo mostrato è ancora quello
           italiano, e due indirizzi con lo stesso contenuto si fanno
           concorrenza da soli. Stessa regola di /api/prerender. */
        if (row?.is_noindex || (locale !== DEFAULT_LOCALE && !row)) {
          meta("name", "robots", "noindex, nofollow")
        }

        /* Stesso ragionamento della description: un canonical statico o
           prerenderizzato che convive col nostro sono due canonical. */
        document.querySelectorAll('link[rel="canonical"]:not([data-seo])').forEach(n => n.remove())
        link("canonical", canonical)

        /* hreflang reciproci: ogni versione elenca tutte le altre, sé stessa
           compresa. Con una lingua sola non si scrive niente — un gruppo di
           uno non è un gruppo. */
        if (published.length > 1) {
          for (const alt of published) {
            link("alternate", localizedUrl(origin, slug, alt), LOCALE_TAG[alt])
          }
          if (published.includes(DEFAULT_LOCALE)) {
            link("alternate", localizedUrl(origin, slug, DEFAULT_LOCALE), "x-default")
          }
        }

        meta("property", "og:type", "website")
        meta("property", "og:url", canonical)
        meta("property", "og:site_name", site.siteName)
        meta("property", "og:locale", OG_LOCALE[locale])
        for (const alt of published) {
          if (alt !== locale) meta("property", "og:locale:alternate", OG_LOCALE[alt])
        }
        if (title) meta("property", "og:title", title)
        if (desc) meta("property", "og:description", desc)
        if (image) meta("property", "og:image", image)

        meta("name", "twitter:card", "summary_large_image")
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
  }, [slug, locale, fallbackTitle, fallbackDescription])

  return null
}

/* `localizePath` è riesportato perché i componenti che costruiscono link
   interni lo prendano da qui invece di ricalcolare il prefisso a mano. */
export { localizePath }
