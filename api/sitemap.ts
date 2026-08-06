/* ══════════════════════════════════════════════════════════════════════════
   /sitemap.xml

   Le rotte del sito sono in un `switch` dentro App.tsx: non c'è un
   filesystem di pagine da scandire come in Next.js, quindi l'elenco base è
   dichiarato qui e va tenuto allineato a quello (il test di build lo
   verifica). A quelle si aggiungono le rotte che hanno una scheda in
   `page_seo_configs`, e si tolgono quelle marcate `is_noindex` o spente.

   `lastmod` viene dalla scheda SEO quando c'è: è l'unica data che segnala
   davvero un cambiamento di contenuto, mentre una data di build direbbe
   soltanto «ho ricompilato».
══════════════════════════════════════════════════════════════════════════ */

import { type EdgeReq, type EdgeRes, escXml, originOf, pgSelect, xml } from "../src/lib/edge"

/** Deve restare allineato al `switch` di src/App.tsx (rotte pubbliche). */
const ROUTES: { path: string; priority: number; changefreq: string }[] = [
  { path: "/",          priority: 1.0, changefreq: "weekly" },
  { path: "/about",     priority: 0.8, changefreq: "monthly" },
  { path: "/projects",  priority: 0.9, changefreq: "weekly" },
  { path: "/contatti",  priority: 0.7, changefreq: "yearly" },
  { path: "/foundry",   priority: 0.9, changefreq: "monthly" },
  { path: "/ecommerce", priority: 0.8, changefreq: "monthly" },
  { path: "/corporate", priority: 0.8, changefreq: "monthly" },
  { path: "/web-app",   priority: 0.8, changefreq: "monthly" },
  { path: "/seo",       priority: 0.8, changefreq: "monthly" },
  { path: "/ai",        priority: 0.8, changefreq: "monthly" },
]

type SeoRow = { page_slug: string; is_noindex: boolean; updated_at: string; canonical_url: string | null }

export default async function handler(req: EdgeReq, res: EdgeRes) {
  const origin = originOf(req)

  const [settings, seo] = await Promise.all([
    pgSelect<{ foundry_enabled: boolean; maintenance_mode: boolean }>("public_site_settings?select=foundry_enabled,maintenance_mode&limit=1"),
    pgSelect<SeoRow>("page_seo_configs?select=page_slug,is_noindex,updated_at,canonical_url"),
  ])
  const s = settings[0]

  if (s?.maintenance_mode) {
    /* Sitemap vuota ma valida: dice «non ho niente da proporre adesso»,
       che è diverso da un 404 su /sitemap.xml (letto come sito rotto). */
    xml(res, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, 300)
    return
  }

  const bySlug = new Map(seo.map(r => [r.page_slug, r]))

  /* Le rotte dichiarate più eventuali slug presenti solo nel database: se un
     domani nasce una pagina nuova, basta darle una scheda SEO per vederla in
     sitemap senza toccare questo file. */
  const extra = seo
    .map(r => r.page_slug)
    .filter(p => p && !ROUTES.some(r => r.path === p) && !p.startsWith("/cabinet") && !p.startsWith("/dashboard"))
    .map(p => ({ path: p, priority: 0.6, changefreq: "monthly" }))

  const urls = [...ROUTES, ...extra]
    .filter(r => !(r.path === "/foundry" && s?.foundry_enabled === false))
    .filter(r => !bySlug.get(r.path)?.is_noindex)
    .map(r => {
      const cfg = bySlug.get(r.path)
      const loc = cfg?.canonical_url?.trim() || `${origin}${r.path}`
      const lastmod = cfg?.updated_at ? new Date(cfg.updated_at).toISOString().slice(0, 10) : null
      return [
        "  <url>",
        `    <loc>${escXml(loc)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        `    <changefreq>${r.changefreq}</changefreq>`,
        `    <priority>${r.priority.toFixed(1)}</priority>`,
        "  </url>",
      ].filter(Boolean).join("\n")
    })

  xml(res, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`, 1800)
}
