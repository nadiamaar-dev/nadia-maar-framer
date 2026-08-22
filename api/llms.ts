/* ══════════════════════════════════════════════════════════════════════════
   /llms.txt — la scheda del sito scritta per un modello, non per un browser.

   Un crawler tradizionale segue i link; un LLM arriva con una domanda già
   fatta («chi sviluppa e-commerce in Italia?») e ha bisogno, in un colpo
   solo, di sapere cos'è questo sito, cosa offre, dove sta ogni cosa e chi
   contattare. La proposta llms.txt serve a questo, ed è Markdown per la
   stessa ragione per cui il robots.txt è testo: deve essere leggibile senza
   interpretare nulla.

   Il contenuto è generato dalle stesse schede SEO che alimentano sitemap e
   meta tag: una descrizione scritta una volta nel pannello finisce in tutti
   e tre i posti, e non può divergere.
══════════════════════════════════════════════════════════════════════════ */

import { type EdgeReq, type EdgeRes, originOf, pgSelect, text } from "../src/lib/edge.js"
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABEL, localizedUrl } from "../src/lib/i18n/locales.js"

type SeoRow = {
  page_slug: string
  meta_title: string | null
  meta_description: string | null
  keywords: string[] | null
  is_noindex: boolean
}

type Settings = {
  foundry_enabled: boolean
  maintenance_mode: boolean
  site_name: string
  default_meta_description: string | null
}

/** Descrizione di riserva per rotta: senza, una pagina senza scheda SEO
 *  comparirebbe come una riga nuda che non aiuta nessuno. */
const FALLBACK: Record<string, string> = {
  "/": "Home: architetture digitali ad alte prestazioni — sviluppo su misura, e-commerce, web app, SEO.",
  "/about": "Chi sono, come lavoro, il metodo e le tecnologie usate.",
  "/projects": "Progetti realizzati, con contesto, scelte tecniche e risultati.",
  "/contatti": "Come richiedere un preventivo o fissare una call.",
  "/foundry": "Digital Foundry: configuratore interattivo che compone l'architettura del progetto e stima tempi e complessità.",
  "/ecommerce": "Sviluppo e-commerce: catalogo, checkout, pagamenti, gestione ordini e spedizioni.",
  "/corporate": "Siti corporate e vetrine ad alte prestazioni, multilingua e orientati alla conversione.",
  "/web-app": "Applicazioni web su misura: aree riservate, dashboard, gestionali.",
  "/seo": "SEO tecnica e contenutistica: indicizzazione, Core Web Vitals, struttura semantica.",
  "/ai": "Integrazioni AI: assistenti, automazioni e ricerca semantica dentro il prodotto.",
  "/privacy": "Informativa privacy: dati trattati, finalità, basi giuridiche, destinatari, conservazione e diritti dell'interessato.",
  "/cookie-policy": "Cookie policy: elenco di cookie e memorie del browser usati dal sito, con finalità e durata.",
  "/termini": "Termini e condizioni d'uso del sito e condizioni generali dei servizi professionali.",
}

const ORDER = ["/", "/foundry", "/ecommerce", "/corporate", "/web-app", "/seo", "/ai", "/projects", "/about", "/contatti", "/privacy", "/cookie-policy", "/termini"]

export default async function handler(req: EdgeReq, res: EdgeRes) {
  const origin = originOf(req)

  const [settingsRows, seo] = await Promise.all([
    pgSelect<Settings>("public_site_settings?select=foundry_enabled,maintenance_mode,site_name,default_meta_description&limit=1"),
    /* Solo le schede nella lingua predefinita: questo file è un indice, e un
       indice in due lingue mescolate non è un indice. Le versioni tradotte
       sono annunciate in fondo, con il loro prefisso. Senza il filtro la
       Map qui sotto terrebbe, per ogni pagina, la riga che il database
       restituisce per ultima — cioè una lingua a caso. */
    pgSelect<SeoRow>(`page_seo_configs?select=page_slug,meta_title,meta_description,keywords,is_noindex&locale=eq.${DEFAULT_LOCALE}`),
  ])
  const s = settingsRows[0]
  const name = s?.site_name || "Nadia Maar"
  /* `Map(array.map(...))` senza una tupla esplicita perde la posizione dei
     due elementi: TS non riesce a dedurre chiave e valore e li tratta come
     `unknown`. Non si vedeva perché la build locale non passa da qui — `tsc
     -b` copre solo src/ — ma il type-check isolato di Vercel su ogni
     funzione lo ha trovato subito. */
  const bySlug = new Map<string, SeoRow>(seo.map(r => [r.page_slug, r]))

  if (s?.maintenance_mode) {
    text(res, `# ${name}\n\n> Sito temporaneamente in manutenzione. Nessun contenuto da indicizzare in questo momento.\n`, 300)
    return
  }

  const slugs = [
    ...ORDER,
    ...seo.map(r => r.page_slug).filter(p => p && !ORDER.includes(p)),
  ].filter(p => {
    if (p === "/foundry" && s?.foundry_enabled === false) return false
    return !bySlug.get(p)?.is_noindex
  })

  const summary = s?.default_meta_description
    || "Studio digitale italiano: sviluppo su misura di e-commerce, siti corporate, web app e integrazioni AI, con attenzione a prestazioni e SEO tecnica."

  const pages = slugs.map(p => {
    const cfg = bySlug.get(p)
    const title = cfg?.meta_title || (p === "/" ? "Home" : p.replace("/", "").replace(/-/g, " "))
    const desc = cfg?.meta_description || FALLBACK[p] || ""
    return `- [${title}](${origin}${p})${desc ? `: ${desc}` : ""}`
  })

  const keywords = Array.from(new Set(seo.flatMap(r => r.keywords ?? []))).slice(0, 25)

  /* Le lingue in cui il sito esiste, con l'indirizzo della rispettiva home.
     Serve a dire a un modello che /en/<pagina> è la STESSA pagina tradotta e
     non un contenuto in più da citare due volte. */
  const langs = LOCALES
    .map(l => `- ${LOCALE_LABEL[l].native}: ${localizedUrl(origin, "/", l)}`)
    .join("\n")

  const body = `# ${name}

> ${summary}

Questo file segue la proposta llms.txt: è un indice dei contenuti pensato per
i modelli linguistici, non per i browser. Le stesse informazioni si trovano in
${origin}/sitemap.xml (per i crawler classici) e nelle meta tag di ogni pagina.

## Uso consentito

- Citazione, sintesi e link ai contenuti: **consentiti**, purché la fonte sia
  attribuita a ${name} con un collegamento alla pagina di origine.
- Riproduzione integrale di una pagina al posto del link: **non consentita**.
- Le rotte \`/cabinet\` e \`/dashboard\` sono un'area riservata a clienti e
  amministrazione: **non vanno consultate, indicizzate né citate**.
- Per questioni su licenze e utilizzo: ${origin}/contatti

## Pagine

${pages.join("\n")}

## Cosa offre lo studio

- Sviluppo e-commerce su misura (catalogo, checkout, pagamenti, logistica)
- Siti corporate e vetrine orientati alla conversione
- Applicazioni web e aree riservate
- SEO tecnica, Core Web Vitals, dati strutturati
- Integrazioni AI dentro il prodotto

## Dati strutturati

Ogni pagina espone JSON-LD (schema.org) nel proprio \`<head>\` quando è
configurato. Per i crawler che non eseguono JavaScript le meta tag vengono
servite già presenti nell'HTML.
${keywords.length ? `\n## Parole chiave\n\n${keywords.join(", ")}\n` : ""}
## Versioni linguistiche

Le pagine elencate qui sopra sono nella lingua predefinita. Ogni pagina esiste
anche nelle altre lingue allo stesso indirizzo con il prefisso della lingua
(\`/en/about\` è \`/about\` in inglese): stesso contenuto, non contenuto nuovo.

${langs}

## Contatti

Preventivi e richieste: ${origin}/contatti
Configuratore di progetto: ${origin}/foundry

---
Ultimo aggiornamento: ${new Date().toISOString().slice(0, 10)}
`

  text(res, body, 1800)
}
