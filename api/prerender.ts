/* ══════════════════════════════════════════════════════════════════════════
   /api/prerender — l'HTML che vedono i crawler.

   IL PROBLEMA. Questo sito è un'applicazione a rendering client: le meta tag
   le scrive <SEOHead> con JavaScript. Googlebot esegue JavaScript e le
   vedrebbe comunque, ma Bingbot, GPTBot, ClaudeBot, PerplexityBot e le
   anteprime di WhatsApp/Telegram/LinkedIn in gran parte no: a loro
   arriverebbe l'HTML nudo di index.html, con lo stesso titolo su tutte le
   pagine. Senza questa funzione, `page_seo_configs` sarebbe un pannello che
   riempie un database e non cambia niente per chi conta.

   COSA FA. Vercel instrada qui le richieste con user-agent da bot
   (vercel.json). La funzione prende il guscio index.html già costruito,
   ci inietta titolo, description, canonical, Open Graph e JSON-LD della
   rotta richiesta, e lo restituisce. Gli utenti veri continuano a ricevere
   il file statico, senza passare da nessuna funzione.

   PERCHÉ NON RIGENERA L'HTML DA ZERO: i nomi dei bundle contengono l'hash
   della build e cambiano a ogni deploy. Riscriverli a mano vorrebbe dire
   servire ai crawler una pagina che non si carica.
══════════════════════════════════════════════════════════════════════════ */

import { type EdgeReq, type EdgeRes, escXml, header, originOf, pgSelect } from "../src/lib/edge"

type SeoRow = {
  page_slug: string
  meta_title: string | null
  meta_description: string | null
  og_image_url: string | null
  canonical_url: string | null
  keywords: string[] | null
  is_noindex: boolean
  json_ld_schema: Record<string, unknown> | null
}

type Settings = {
  foundry_enabled: boolean
  maintenance_mode: boolean
  site_name: string
  default_meta_title: string | null
  default_meta_description: string | null
  default_og_image_url: string | null
}

/* Il guscio cambia solo a ogni deploy, e un'istanza calda serve più
   richieste: tenerlo in memoria evita una fetch per ogni crawler. */
let shellCache: { html: string; at: number } | null = null
const SHELL_TTL = 10 * 60 * 1000

async function shell(origin: string): Promise<string> {
  if (shellCache && Date.now() - shellCache.at < SHELL_TTL) return shellCache.html

  /* Un tentativo in più: se questo recupero fallisce, un crawler che esegue
     JavaScript (Googlebot) riceverebbe il ripiego minimo al posto
     dell'applicazione. Un errore di rete passeggero non deve costare una
     pagina vuota nell'indice. In caso di fallimento NON si mette niente in
     cache, così il tentativo successivo riparte pulito. */
  let last: unknown
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      /* User-agent neutro di proposito: con un UA da bot il rewrite di
         vercel.json rimanderebbe la richiesta qui dentro, all'infinito. */
      const r = await fetch(`${origin}/index.html`, { headers: { "user-agent": "nm-prerender" } })
      if (!r.ok) throw new Error(String(r.status))
      const html = await r.text()
      if (!html.includes("<div id=\"root\">")) throw new Error("guscio inatteso")
      shellCache = { html, at: Date.now() }
      return html
    } catch (e) {
      last = e
    }
  }
  throw last instanceof Error ? last : new Error("guscio non recuperabile")
}

const tag = (s: string) => s

export default async function handler(req: EdgeReq, res: EdgeRes) {
  const origin = originOf(req)
  let path = "/"
  try {
    path = new URL(req.url ?? "/", origin).pathname || "/"
  } catch { /* resta "/" */ }

  const [settingsRows, seoRows] = await Promise.all([
    pgSelect<Settings>("public_site_settings?select=*&limit=1"),
    pgSelect<SeoRow>(`page_seo_configs?select=*&page_slug=eq.${encodeURIComponent(path)}&limit=1`),
  ])
  const s = settingsRows[0]
  const cfg = seoRows[0]

  const title = cfg?.meta_title || s?.default_meta_title || "Nadia Maar — Architetture Digitali ad Alte Prestazioni"
  const desc = cfg?.meta_description || s?.default_meta_description || ""
  const image = cfg?.og_image_url || s?.default_og_image_url || ""
  const canonical = cfg?.canonical_url || `${origin}${path}`
  const siteName = s?.site_name || "Nadia Maar"

  /* Un noindex qui vale davvero: è nell'HTML che il crawler legge, non in un
     tag scritto dopo da JavaScript che lui non esegue. */
  const noindex = cfg?.is_noindex === true
    || s?.maintenance_mode === true
    || (path === "/foundry" && s?.foundry_enabled === false)

  const head: string[] = [
    `<meta name="description" content="${escXml(desc)}">`,
    `<link rel="canonical" href="${escXml(canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escXml(siteName)}">`,
    `<meta property="og:title" content="${escXml(title)}">`,
    `<meta property="og:description" content="${escXml(desc)}">`,
    `<meta property="og:url" content="${escXml(canonical)}">`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${escXml(title)}">`,
    `<meta name="twitter:description" content="${escXml(desc)}">`,
  ]
  if (image) {
    head.push(`<meta property="og:image" content="${escXml(image)}">`)
    head.push(`<meta name="twitter:image" content="${escXml(image)}">`)
  }
  if (cfg?.keywords?.length) head.push(`<meta name="keywords" content="${escXml(cfg.keywords.join(", "))}">`)
  if (noindex) head.push(`<meta name="robots" content="noindex, nofollow">`)
  if (cfg?.json_ld_schema) {
    /* `</script>` dentro i dati chiuderebbe il blocco in anticipo e il resto
       finirebbe nel corpo della pagina come testo. */
    const json = JSON.stringify(cfg.json_ld_schema).replace(/<\//g, "<\\/")
    head.push(`<script type="application/ld+json">${json}</script>`)
  }

  try {
    const base = await shell(origin)
    const html = base
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escXml(title)}</title>`)
      .replace(/<\/head>/i, `${tag(head.join("\n    "))}\n  </head>`)

    res.setHeader("content-type", "text/html; charset=utf-8")
    res.setHeader("cache-control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400")
    res.setHeader("x-nm-prerender", "1")
    res.status(200).send(html)
  } catch {
    /* Se il guscio non si recupera, meglio un HTML minimo con i metadati
       giusti che un errore: il crawler ha comunque quello che cercava. */
    res.setHeader("content-type", "text/html; charset=utf-8")
    res.status(200).send(`<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>${escXml(title)}</title>
${head.join("\n")}
</head><body><h1>${escXml(title)}</h1><p>${escXml(desc)}</p>
<p><a href="${escXml(origin)}">${escXml(siteName)}</a></p></body></html>`)
  }
  void header
}
