/* ══════════════════════════════════════════════════════════════════════════
   /api/og — la scheda social generata al volo.

   Una pagina senza og:image, condivisa su WhatsApp o LinkedIn, compare come
   un link nudo accanto a link altrui che hanno un'immagine. Disegnarne una
   a mano per ogni pagina è un lavoro che si smette di fare al terzo giro;
   questa la compone dal titolo e dalla descrizione già presenti nella scheda
   SEO, con la grafica del sito.

   Runtime edge: `@vercel/og` disegna con Satori e rasterizza con resvg in
   WebAssembly, che gira solo lì.

   Il colore è quello del portale — grafite #121418 con l'accento rame
   #B83240 — perché una scheda social è la prima cosa che si vede del sito e
   deve somigliargli.
══════════════════════════════════════════════════════════════════════════ */

import { ImageResponse } from "@vercel/og"
import { DEFAULT_LOCALE, type Locale, isLocale, splitLocale } from "../src/lib/i18n/locales.js"

export const config = { runtime: "edge" }

/* Le poche parole disegnate nell'immagine. Non è un sistema di traduzioni:
   sono due stringhe, e un dizionario per due stringhe sarebbe un file in più
   da aprire per capire cosa c'è scritto su una figura. */
const COPY: Record<Locale, { pill: string; fallbackTitle: string }> = {
  it: {
    pill: "Full-stack su misura",
    fallbackTitle: "Nadia Maar — Architetture Digitali ad Alte Prestazioni",
  },
  en: {
    pill: "Custom full-stack",
    fallbackTitle: "Nadia Maar — High-Performance Digital Architecture",
  },
}

const SUPA_URL = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env?.VITE_SUPABASE_URL ?? ""
const SUPA_KEY = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env?.VITE_SUPABASE_ANON_KEY ?? ""

type SeoRow = { meta_title: string | null; meta_description: string | null }

async function seoFor(slug: string, locale: Locale): Promise<SeoRow | null> {
  if (!SUPA_URL || !SUPA_KEY) return null
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/page_seo_configs?select=meta_title,meta_description`
      + `&page_slug=eq.${encodeURIComponent(slug)}&locale=eq.${locale}&limit=1`,
      { headers: { apikey: SUPA_KEY, authorization: `Bearer ${SUPA_KEY}` } },
    )
    if (!r.ok) return null
    const rows = (await r.json()) as SeoRow[]
    return rows[0] ?? null
  } catch {
    return null
  }
}

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const rawSlug = url.searchParams.get("slug") || "/"

  /* La lingua arriva esplicita (?locale=en) oppure si legge dallo slug, che
     può essere passato già con il prefisso (/en/about). Accettare entrambe
     le forme evita di dover ricordare quale delle due usa chi chiama. */
  const fromSlug = splitLocale(rawSlug)
  const param = url.searchParams.get("locale")
  const locale: Locale = isLocale(param) ? param : fromSlug.locale
  const slug = fromSlug.path
  const copy = COPY[locale] ?? COPY[DEFAULT_LOCALE]

  /* I parametri espliciti vincono sulla scheda: servono all'anteprima nel
     pannello, dove si vuole vedere l'effetto di un titolo prima di salvarlo. */
  const row = await seoFor(slug, locale)
  const title = (url.searchParams.get("title") || row?.meta_title
    || copy.fallbackTitle).slice(0, 110)
  const subtitle = (url.searchParams.get("desc") || row?.meta_description || "").slice(0, 170)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "72px 80px",
          background: "linear-gradient(135deg, #121418 0%, #171B22 55%, #1E1418 100%)",
          fontFamily: "sans-serif", position: "relative",
        }}
      >
        {/* filo rame in alto: la firma del sito, ridotta all'essenziale */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "#B83240", display: "flex" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "rgba(184,50,64,0.16)", border: "2px solid rgba(184,50,64,0.75)",
            color: "#E4697A", fontSize: 24, fontWeight: 700, letterSpacing: 1,
          }}>
            NM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#FFFFFF", fontSize: 27, fontWeight: 700, letterSpacing: -0.5 }}>Nadia Maar</span>
            <span style={{ color: "rgba(255,255,255,0.62)", fontSize: 17, letterSpacing: 3, textTransform: "uppercase" }}>
              Digital Architecture
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{
            color: "#FFFFFF", fontSize: title.length > 62 ? 54 : 64, fontWeight: 800,
            lineHeight: 1.12, letterSpacing: -1.6, display: "flex",
          }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 26, lineHeight: 1.42, display: "flex" }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* L'indirizzo mostrato è quello pubblico, prefisso compreso: è
              quello che vedrà chi riceve il link condiviso. */}
          <span style={{ color: "rgba(255,255,255,0.52)", fontSize: 21 }}>
            nadiamaar.dev{locale === DEFAULT_LOCALE ? "" : `/${locale}`}{slug === "/" ? "" : slug}
          </span>
          <span style={{
            color: "#E4697A", fontSize: 19, letterSpacing: 2.5, textTransform: "uppercase",
            padding: "9px 20px", borderRadius: 999, border: "2px solid rgba(184,50,64,0.55)", display: "flex",
          }}>
            {copy.pill}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        /* L'immagine cambia solo quando cambia la scheda SEO: un giorno di
           CDN e una settimana di stale-while-revalidate tengono i social
           veloci senza congelare una correzione. */
        "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  )
}
