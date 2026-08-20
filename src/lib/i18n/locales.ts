/* ══════════════════════════════════════════════════════════════════════════
   LE LINGUE DEL SITO — sorgente unica di verità.

   Lo importano il browser (App, SEOHead, LanguageSwitcher, pannello),
   le funzioni serverless (prerender, sitemap, og, robots, llms) e il
   middleware di Vercel. È l'unico posto dove sta scritto quali lingue
   esistono e come si scrivono negli indirizzi: la ricognizione su questo
   progetto ha trovato l'elenco delle rotte duplicato in sei file diversi,
   e non serve un settimo elenco che si scollega dagli altri.

   REGOLA DEGLI INDIRIZZI. L'italiano è la lingua predefinita e NON ha
   prefisso; l'inglese vive sotto /en.

       italiano   /            /about        /contatti
       inglese    /en          /en/about     /en/contatti

   Perché il default senza prefisso: gli indirizzi italiani sono già
   indicizzati e linkati. Spostarli tutti su /it vorrebbe dire trecento
   redirect 301 e la perdita temporanea di posizionamento su ogni pagina,
   in cambio di niente — una simmetria che vede solo chi legge il codice.

   Il "path canonico" è l'indirizzo senza prefisso: è la chiave con cui la
   pagina è scritta a database (page_slug) e con cui il router la risolve.
   La lingua è una dimensione separata, non parte del nome della pagina.

   Questo file non importa niente: deve poter girare nel bundle del browser,
   in una funzione serverless e nel runtime edge del middleware.
══════════════════════════════════════════════════════════════════════════ */

export const LOCALES = ["it", "en"] as const

export type Locale = (typeof LOCALES)[number]

/** L'italiano: nessun prefisso negli indirizzi, e ripiego quando manca tutto. */
export const DEFAULT_LOCALE: Locale = "it"

/** Etichette del selettore. `native` è come la lingua chiama sé stessa —
    "English", non "Inglese": chi cerca la propria lingua in un menu cerca
    la parola che conosce. */
export const LOCALE_LABEL: Record<Locale, { native: string; short: string }> = {
  it: { native: "Italiano", short: "IT" },
  en: { native: "English", short: "EN" },
}

/** Il valore dell'attributo `lang` e degli hreflang. Volutamente la lingua
    nuda senza regione: `it-IT` direbbe «italiano d'Italia» ed escluderebbe
    chi legge italiano dalla Svizzera. */
export const LOCALE_TAG: Record<Locale, string> = { it: "it", en: "en" }

/** `og:locale` vuole invece la forma con regione. */
export const OG_LOCALE: Record<Locale, string> = { it: "it_IT", en: "en_US" }

/** Il cookie che ricorda la scelta esplicita. Un anno: la lingua in cui uno
    legge non cambia da una settimana all'altra. */
export const LOCALE_COOKIE = "nm_locale"
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isLocale(v: string | null | undefined): v is Locale {
  return v === "it" || v === "en"
}

/**
 * Divide un pathname in lingua + path canonico.
 *
 *   /en/about  →  { locale: "en", path: "/about" }
 *   /en        →  { locale: "en", path: "/" }
 *   /about     →  { locale: "it", path: "/about" }
 *   /          →  { locale: "it", path: "/" }
 *
 * `prefixed` dice se la lingua era scritta nell'indirizzo o dedotta dal
 * default: serve al middleware per non reindirizzare all'infinito una
 * pagina che è già dove deve stare.
 */
export function splitLocale(pathname: string): {
  locale: Locale
  path: string
  prefixed: boolean
} {
  const clean = normalizePath(pathname)
  const seg = clean.split("/")[1] ?? ""

  if (isLocale(seg) && seg !== DEFAULT_LOCALE) {
    const rest = clean.slice(seg.length + 1)
    return { locale: seg, path: normalizePath(rest), prefixed: true }
  }

  /* /it esiste come indirizzo scrivibile a mano ma non è canonico: lo
     riconosciamo per poterlo mandare via con un redirect, non per servirlo. */
  if (seg === DEFAULT_LOCALE) {
    const rest = clean.slice(seg.length + 1)
    return { locale: DEFAULT_LOCALE, path: normalizePath(rest), prefixed: true }
  }

  return { locale: DEFAULT_LOCALE, path: clean, prefixed: false }
}

/**
 * Da path canonico + lingua all'indirizzo pubblico.
 *
 *   ("/about", "en")  →  "/en/about"
 *   ("/about", "it")  →  "/about"
 *   ("/",      "en")  →  "/en"
 */
export function localizePath(path: string, locale: Locale): string {
  const clean = normalizePath(path)
  if (locale === DEFAULT_LOCALE) return clean
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`
}

/** Indirizzo assoluto, per canonical, hreflang e sitemap. */
export function localizedUrl(origin: string, path: string, locale: Locale): string {
  return `${origin.replace(/\/+$/, "")}${localizePath(path, locale)}`
}

/** Una barra iniziale, nessuna barra finale, niente doppie barre. Senza
    questo `/about/` e `/about` diventerebbero due pagine per Google. */
export function normalizePath(p: string): string {
  const s = (p || "/").split("?")[0].split("#")[0].replace(/\/{2,}/g, "/")
  if (!s.startsWith("/")) return normalizePath(`/${s}`)
  if (s.length > 1 && s.endsWith("/")) return s.slice(0, -1)
  return s || "/"
}

/**
 * La lingua preferita da un header Accept-Language.
 *
 * Legge i valori di qualità (`it;q=0.9`) invece di fidarsi dell'ordine:
 * Safari e Chrome mandano liste dove l'ordine da solo non basta. Torna null
 * se nessuna lingua conosciuta compare — e null vuol dire «non decidere»,
 * non «italiano»: sono due cose diverse per chi chiama.
 */
export function preferredLocale(acceptLanguage: string | null | undefined): Locale | null {
  if (!acceptLanguage) return null

  const ranked = acceptLanguage
    .split(",")
    .map(part => {
      const [tagRaw, ...params] = part.trim().split(";")
      const qParam = params.find(p => p.trim().startsWith("q="))
      const q = qParam ? Number.parseFloat(qParam.split("=")[1]) : 1
      return { tag: tagRaw.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 }
    })
    .filter(x => x.tag && x.q > 0)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    /* "en-GB" conta come "en": la regione qui non cambia quale testo mostrare. */
    const base = tag.split("-")[0]
    if (isLocale(base)) return base
  }
  return null
}

/** Legge il cookie della lingua da un header Cookie grezzo (middleware e
    funzioni serverless non hanno `document.cookie`). */
export function localeFromCookieHeader(cookieHeader: string | null | undefined): Locale | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=")
    if (k === LOCALE_COOKIE) {
      const val = decodeURIComponent(v.join("=")).trim()
      return isLocale(val) ? val : null
    }
  }
  return null
}
