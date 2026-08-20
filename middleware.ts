import { next } from "@vercel/edge"
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  localeFromCookieHeader,
  localizePath,
  preferredLocale,
  splitLocale,
} from "./src/lib/i18n/locales.js"

/* ══════════════════════════════════════════════════════════════════════════
   MIDDLEWARE EDGE — che lingua serviamo.

   Gira sulla rete di Vercel prima di ogni richiesta di pagina. Sta nella
   radice del progetto e non in app/: questo non è un progetto Next, e il
   middleware di Vercel funziona con qualunque framework.

   ── LA REGOLA CHE CONTA: I CRAWLER NON SI REINDIRIZZANO MAI ──────────────
   Reindirizzare automaticamente in base ad Accept-Language è esattamente
   ciò che Google sconsiglia: il suo crawler visita quasi sempre con
   Accept-Language vuoto e da indirizzi IP americani. Se lo assecondassimo
   finirebbe sempre e solo sulla versione inglese, e la versione italiana —
   che è il sito vero — non verrebbe indicizzata affatto. Peggio: le due
   versioni si dichiarano a vicenda con gli hreflang, e un hreflang che
   punta a un indirizzo che risponde 307 è un hreflang che Google scarta.

   Quindi: bot → si serve esattamente l'indirizzo chiesto, sempre.

   ── PER LE PERSONE ──────────────────────────────────────────────────────
   1. Scelta esplicita (cookie, messo dal selettore di lingua): vince su
      tutto. Chi ha cliccato "EN" non deve ricliccarlo a ogni pagina.
   2. Nessun cookie: si guarda Accept-Language, con i valori di qualità.
   3. Nulla di riconoscibile: italiano, che è il default.

   Il redirect è 307 e non 301: la destinazione dipende da chi chiede, e un
   301 verrebbe messo in cache dal browser e dai proxy: chi cambia idea
   resterebbe inchiodato alla lingua di prima anche dopo aver cliccato il
   selettore.

   ── SE QUESTO FILE NON GIRA ─────────────────────────────────────────────
   Il sito continua a funzionare: ogni indirizzo resta raggiungibile, il
   selettore di lingua fa una navigazione normale e gli hreflang sono
   scritti dal prerender. Si perde solo il riconoscimento automatico alla
   prima visita. È voluto: il rilevamento della lingua è una comodità, non
   deve essere un punto di rottura.
══════════════════════════════════════════════════════════════════════════ */

/** Rotte che non hanno una versione per lingua: sono strumenti, non pagine. */
const PRIVATE = ["/cabinet", "/dashboard"]

/* Lo stesso elenco di user-agent di src/lib/edge.ts. Qui serve per NON
   agire, non per servire contenuti diversi: nessun rischio di cloaking —
   bot e persone ricevono la stessa pagina allo stesso indirizzo, cambia
   solo se li accompagniamo o no a un indirizzo diverso. */
const BOT_RE = /(bot|crawler|spider|crawl|slurp|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator|whatsapp|telegram|discord|linkedinbot|gptbot|claudebot|claude-web|perplexitybot|ccbot|anthropic|google-extended|applebot|bingpreview|lighthouse|pagespeed|chrome-lighthouse)/i

export const config = {
  /* Fuori: le funzioni serverless, gli asset con hash, i file di Vercel e
     qualunque cosa abbia un'estensione (favicon.svg, robots.txt, .png…).
     Dentro: solo le pagine vere. */
  matcher: ["/((?!api/|assets/|_vercel|.*\\.[a-zA-Z0-9]+$).*)"],
}

/* ── L'INDIRIZZO CANONICO ─────────────────────────────────────────────────
   Il sito risponde anche da nadia-maar-framer.vercel.app: senza questo
   blocco esistono DUE copie identiche di ogni pagina, e Google sceglie lui
   quale contare — di solito quella sbagliata. L'alias di produzione e
   l'apex vengono quindi rimandati con un 308 (permanente, conserva il
   metodo) all'host canonico.

   Solo questi due host, elencati per nome: le anteprime di deploy
   (nadia-maar-framer-git-*.vercel.app e simili) devono restare visitabili
   dove stanno, altrimenti ogni branch preview rimbalzerebbe in produzione
   e diventerebbe invisibile. */
const CANONICAL_HOST = "www.nadiamaar.dev"
const ALIAS_HOSTS = new Set(["nadia-maar-framer.vercel.app", "nadiamaar.dev"])

export default function middleware(request: Request): Response | undefined {
  const url = new URL(request.url)

  if (ALIAS_HOSTS.has(url.hostname)) {
    const to = new URL(url.toString())
    to.hostname = CANONICAL_HOST
    to.protocol = "https:"
    return new Response(null, {
      status: 308,
      headers: {
        location: to.toString(),
        /* qui la destinazione NON dipende da chi chiede: cache lunga */
        "cache-control": "public, max-age=86400",
      },
    })
  }

  const { locale, path, prefixed } = splitLocale(url.pathname)

  /* Il pannello e l'area cliente non hanno versione linguistica: entrarci
     con /en davanti non deve creare un secondo indirizzo per la stessa
     schermata. */
  if (PRIVATE.some(p => path === p || path.startsWith(`${p}/`))) {
    return prefixed ? redirect(url, path) : next()
  }

  /* /it/... non è canonico: l'italiano vive senza prefisso. Qui il 301 è
     giusto — è una regola del sito, non una preferenza di chi visita. */
  if (prefixed && locale === DEFAULT_LOCALE) {
    return redirect(url, path, 301)
  }

  const ua = request.headers.get("user-agent") ?? ""
  if (BOT_RE.test(ua)) return next()

  /* Indirizzo già esplicito in una lingua non predefinita: ci si resta, e
     si ricorda la scelta. Chi arriva su /en da un link condiviso non deve
     cliccare il selettore per non essere rimbalzato via alla pagina dopo. */
  if (prefixed) {
    const res = next()
    if (localeFromCookieHeader(request.headers.get("cookie")) !== locale) {
      res.headers.append("set-cookie", cookie(locale))
    }
    return res
  }

  /* Da qui in giù: indirizzo senza prefisso, cioè la versione italiana. */
  const chosen =
    localeFromCookieHeader(request.headers.get("cookie")) ??
    preferredLocale(request.headers.get("accept-language"))

  if (chosen && chosen !== DEFAULT_LOCALE) {
    return redirect(url, localizePath(path, chosen))
  }

  /* Vary: senza, la cache condivisa di Vercel potrebbe servire la risposta
     decisa per un visitatore a tutti quelli dopo di lui. */
  const res = next()
  res.headers.append("vary", "Accept-Language, Cookie")
  return res
}

function redirect(url: URL, pathname: string, status: 301 | 307 = 307): Response {
  const to = new URL(url.toString())
  to.pathname = pathname
  return new Response(null, {
    status,
    headers: {
      location: to.toString(),
      /* La destinazione dipende da cookie e lingua del browser: va detto,
         altrimenti una CDN la considera valida per chiunque. */
      vary: "Accept-Language, Cookie",
      "cache-control": status === 301 ? "public, max-age=3600" : "no-store",
    },
  })
}

function cookie(locale: string): string {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`
}
