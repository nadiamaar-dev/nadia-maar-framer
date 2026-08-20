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

import { type EdgeReq, type EdgeRes, escXml, header, originOf, pgSelect } from "../src/lib/edge.js"
import { META_STR } from "../src/lib/i18n/strings/meta.js"
import {
  DEFAULT_LOCALE,
  LOCALE_TAG,
  type Locale,
  OG_LOCALE,
  isLocale,
  localizedUrl,
  splitLocale,
} from "../src/lib/i18n/locales.js"

type SeoRow = {
  page_slug: string
  locale: string
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
  let rawPath = "/"
  try {
    rawPath = new URL(req.url ?? "/", origin).pathname || "/"
  } catch { /* resta "/" */ }

  /* L'indirizzo porta la lingua davanti (/en/about); a database la pagina è
     scritta col suo path canonico (/about) e una colonna `locale`. */
  const { locale, path } = splitLocale(rawPath)

  const [settingsRows, seoRows] = await Promise.all([
    pgSelect<Settings>("public_site_settings?select=*&limit=1"),
    /* Tutte le lingue di questa pagina in una sola richiesta: una serve a
       riempire i tag, le altre a dichiarare gli hreflang. Due query per lo
       stesso indice sarebbero un viaggio di rete in più su ogni visita di
       un crawler. */
    pgSelect<SeoRow>(`page_seo_configs?select=*&page_slug=eq.${encodeURIComponent(path)}`),
  ])
  const s = settingsRows[0]
  const cfg = seoRows.find(r => r.locale === locale)

  /* Le lingue davvero pubblicate per questa pagina. Una versione marcata
     noindex non è un'alternativa da annunciare: dichiararla e poi chiedere
     di non indicizzarla è la contraddizione che Search Console segnala come
     "alternate page with proper canonical tag". */
  const published = seoRows
    .filter(r => r.is_noindex !== true && isLocale(r.locale))
    .map(r => r.locale as Locale)
    .sort()

  /* Titolo e descrizione di ripiego della lingua richiesta: senza questi, a
     un crawler che chiede /en arriverebbe il titolo italiano del sito, cioè
     un'anteprima in una lingua e una pagina in un'altra. */
  const preset = META_STR[locale]?.[path]
  const title = cfg?.meta_title || preset?.title || s?.default_meta_title || "Nadia Maar — Architetture Digitali ad Alte Prestazioni"
  const desc = cfg?.meta_description || preset?.description || s?.default_meta_description || ""
  /* Se la pagina non ha una sua immagine social e nemmeno il sito ne ha una
     predefinita, se ne genera una: un link nudo accanto a link altrui che
     hanno un'anteprima parte già perdente. */
  const image = cfg?.og_image_url || s?.default_og_image_url
    || `${origin}/api/og?slug=${encodeURIComponent(path)}&locale=${locale}`
  const canonical = cfg?.canonical_url || localizedUrl(origin, path, locale)
  const siteName = s?.site_name || "Nadia Maar"
  const lang = LOCALE_TAG[locale]

  /* /foundry spenta non è da nascondere: è da dichiarare inesistente. Un
     noindex direbbe «c'è ma non guardarla», un 404 dice la verità e fa
     togliere l'indirizzo dall'indice. */
  if (path === "/foundry" && s?.foundry_enabled === false) {
    res.setHeader("content-type", "text/html; charset=utf-8")
    res.setHeader("x-robots-tag", "noindex")
    res.status(404).send(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>${locale === "en" ? "Page not found" : "Pagina non trovata"}</title>
<meta name="robots" content="noindex"></head>
<body><h1>404</h1><p><a href="${escXml(origin)}">Nadia Maar</a></p></body></html>`)
    return
  }

  /* Un noindex qui vale davvero: è nell'HTML che il crawler legge, non in un
     tag scritto dopo da JavaScript che lui non esegue.

     La terza condizione è la regola che rende sicuro pubblicare /en prima di
     aver tradotto tutto: una pagina in una lingua non predefinita SENZA la
     sua scheda non è tradotta — il testo che si vedrebbe è ancora italiano.
     Indicizzarla vorrebbe dire mettere due indirizzi con lo stesso contenuto
     in concorrenza fra loro. Appena qualcuno scrive titolo e descrizione
     inglesi dal pannello, la riga esiste e la pagina diventa indicizzabile
     da sola: nessun deploy, nessuna riga di codice. */
  const untranslated = locale !== DEFAULT_LOCALE && !cfg
  const noindex = cfg?.is_noindex === true || s?.maintenance_mode === true || untranslated

  const head: string[] = [
    `<meta name="description" content="${escXml(desc)}">`,
    `<link rel="canonical" href="${escXml(canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escXml(siteName)}">`,
    `<meta property="og:title" content="${escXml(title)}">`,
    `<meta property="og:description" content="${escXml(desc)}">`,
    `<meta property="og:url" content="${escXml(canonical)}">`,
    `<meta property="og:locale" content="${OG_LOCALE[locale]}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escXml(title)}">`,
    `<meta name="twitter:description" content="${escXml(desc)}">`,
  ]

  /* ── hreflang ──────────────────────────────────────────────────────────
     Si emettono solo se esiste più di una versione pubblicata: un hreflang
     che annuncia una lingua sola è rumore, e Google lo ignora comunque.

     Reciprocità: ogni versione elenca TUTTE le versioni, sé stessa compresa.
     Se la pagina inglese dichiarasse solo l'italiana senza che valga il
     contrario, Google scarta l'intero gruppo — è l'errore più comune con gli
     hreflang, e il più silenzioso.

     x-default punta all'italiano: è la versione che serve chi non rientra in
     nessuna delle due lingue dichiarate. */
  if (published.length > 1) {
    for (const alt of published) {
      head.push(
        `<link rel="alternate" hreflang="${LOCALE_TAG[alt]}" href="${escXml(localizedUrl(origin, path, alt))}">`,
      )
      /* og:locale:alternate non è hreflang: lo legge chi genera le anteprime
         social, che di hreflang non sa niente. */
      if (alt !== locale) head.push(`<meta property="og:locale:alternate" content="${OG_LOCALE[alt]}">`)
    }
    if (published.includes(DEFAULT_LOCALE)) {
      head.push(
        `<link rel="alternate" hreflang="x-default" href="${escXml(localizedUrl(origin, path, DEFAULT_LOCALE))}">`,
      )
    }
  }
  head.push(`<meta property="og:image" content="${escXml(image)}">`)
  head.push(`<meta property="og:image:width" content="1200">`)
  head.push(`<meta property="og:image:height" content="630">`)
  head.push(`<meta name="twitter:image" content="${escXml(image)}">`)
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
      /* index.html è un file statico con lang="it" scritto dentro: per la
         versione inglese va riscritto, o un lettore vocale legge testo
         inglese con la pronuncia italiana. */
      .replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${lang}"`)
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escXml(title)}</title>`)
      /* Il guscio porta una description statica, che serve a chi apre il
         sorgente e ai browser prima che parta il JavaScript. Qui però i
         metadati li decidiamo noi, per pagina e per lingua: se non
         togliessimo quella del guscio il crawler ne troverebbe DUE, e
         sceglierebbe lui quale contare. Stesso ragionamento per canonical e
         Open Graph, oggi assenti dal guscio ma non è detto che restino tali:
         questa riga rende la funzione autorevole invece che additiva. */
      .replace(
        /\s*<meta\s+(?:name|property)="(?:description|canonical|og:[\w:]+|twitter:[\w:]+)"[^>]*>/gi,
        "",
      )
      .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "")
      .replace(/<\/head>/i, `${tag(head.join("\n    "))}\n  </head>`)

    res.setHeader("content-type", "text/html; charset=utf-8")
    res.setHeader("cache-control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400")
    res.setHeader("x-nm-prerender", "1")
    res.status(200).send(html)
  } catch {
    /* Se il guscio non si recupera, meglio un HTML minimo con i metadati
       giusti che un errore: il crawler ha comunque quello che cercava. */
    res.setHeader("content-type", "text/html; charset=utf-8")
    res.status(200).send(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>${escXml(title)}</title>
${head.join("\n")}
</head><body><h1>${escXml(title)}</h1><p>${escXml(desc)}</p>
<p><a href="${escXml(origin)}">${escXml(siteName)}</a></p></body></html>`)
  }
  void header
}
