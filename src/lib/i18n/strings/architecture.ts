import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   PAGINA /architecture — il manifesto tecnico di QUESTO sito.

   Regola editoriale: ogni affermazione qui deve essere verificabile da chi
   legge — nel sorgente, con un curl, o con i numeri misurati sul suo stesso
   dispositivo. Se una frase non supera quel test, non va in questa pagina:
   per le promesse c'è il resto del sito.
══════════════════════════════════════════════════════════════════════════ */

const it = {
  hero: {
    kicker: "Architettura",
    over: "Nessuno slide, solo sorgente",
    lineOutlined: "QUESTO SITO",
    lineSolid: "È IL CASO STUDIO",
    lead: "Chi valuta uno studio tecnico apre PageSpeed sul suo dominio prima di leggere qualsiasi portfolio. Giusto così. Questa pagina documenta come è costruito nadiamaar.dev — le decisioni, i vincoli e i numeri — perché ogni affermazione qui si può verificare: nel sorgente, con un curl, o con le misure raccolte adesso sul tuo dispositivo.",
  },

  live: {
    kicker: "Misurato adesso",
    title: "I numeri di questo caricamento",
    lead: "Non sono medie di laboratorio: sono le misure del caricamento che il tuo browser ha appena fatto, lette dalle Performance API. Ricarica la pagina e cambieranno — di poco, se l'architettura fa il suo lavoro.",
    ttfb: "Primo byte dal server",
    fcp: "Primo contenuto a schermo",
    js: "JavaScript trasferito",
    requests: "Richieste di rete",
    thirdParty: "Domini terzi prima del primo dipinto",
    waiting: "misurazione…",
    unsupported: "n/d",
    disclaimer: "TTFB e primo dipinto dipendono anche dalla tua rete e dal tuo dispositivo: è il punto. Un'architettura onesta regge la misura ovunque, non solo sull'hardware di chi la presenta.",
  },

  flow: {
    kicker: "Due percorsi",
    title: "Un visitatore e un crawler non vedono lo stesso HTML",
    lead: "Il sito è un'applicazione a rendering client servita come file statici da una CDN. I metadati però li scrive JavaScript — e Bingbot, GPTBot o l'anteprima di WhatsApp non lo eseguono. Per loro c'è un percorso dedicato.",
    human: {
      label: "Persona",
      steps: [
        "Il browser riceve il guscio statico dalla CDN — nessuna funzione server nel percorso.",
        "Il CSS critico e la schermata di avvio sono già nell'HTML: il primo fotogramma è scuro, non bianco.",
        "React monta l'applicazione; ogni rotta oltre la home è un frammento scaricato solo se visitato.",
      ],
    },
    bot: {
      label: "Crawler",
      steps: [
        "Lo user-agent viene riconosciuto al bordo e la richiesta instradata a una funzione di prerender.",
        "La funzione legge titolo, description, hreflang e JSON-LD della rotta dal database.",
        "Il crawler riceve HTML con i metadati già dentro — gli stessi che il pannello di amministrazione governa senza deploy.",
      ],
    },
    note: "Prova tu stesso: `curl -A \"GPTBot\" https://www.nadiamaar.dev/` risponde con i meta nel sorgente; senza quello user-agent arriva il guscio statico.",
  },

  decisions: {
    kicker: "Le decisioni",
    title: "Sette scelte che si vedono nei numeri",
    lead: "Nessuna è esotica. La differenza la fa che siano scritte, misurate e difese da test che falliscono quando qualcuno le smonta per distrazione.",
    items: [
      {
        t: "Caratteri serviti da noi, con un test a guardia",
        d: "Cinque famiglie come woff2 variabili su questo dominio, sottoinsiemi latin ed extended, le due del primo schermo in preload. Un test di build fallisce se una sola richiesta parte verso Google Fonts: un @import è una riga, e rientra facilmente durante un refactor.",
      },
      {
        t: "Bilingue con completezza verificata dal compilatore",
        d: "Ogni testo vive in un dizionario italiano+inglese la cui forma è vincolata dal type system: una chiave tradotta a metà non è un avviso, è una build che non parte. La lingua è un prefisso dell'indirizzo, gli hreflang sono reciproci e la sitemap li dichiara per intero.",
      },
      {
        t: "SEO governata dal database, non dal deploy",
        d: "Titoli, description e dati strutturati stanno in Postgres e si modificano dal pannello. Il prerender li serve ai crawler, la sitemap si aggiorna da sola, e pubblicare una nuova lingua per una pagina è una riga a database — nessuna ricompilazione.",
      },
      {
        t: "Analytics senza cookie, IP mai in chiaro",
        d: "Niente banner perché niente da confessare: la sessione è un identificatore effimero in sessionStorage, l'indirizzo IP diventa un'impronta salata prima di toccare il database, e gli eventi della voronka viaggiano via sendBeacon senza bloccare la navigazione.",
      },
      {
        t: "Sicurezza a livello di riga, non di interfaccia",
        d: "L'area clienti è isolata con Row-Level Security di Postgres: il filtro sui dati vale per qualsiasi client, non solo per l'interfaccia che si ricorda di applicarlo. I moduli pubblici inseriscono con la chiave anonima dentro vincoli CHECK, e le letture aggregate passano da funzioni security-definer.",
      },
      {
        t: "Un solo indirizzo canonico",
        d: "L'alias di piattaforma e il dominio apice rispondono 308 verso www.nadiamaar.dev. Un sito raggiungibile da due indirizzi è due siti che si fanno concorrenza nell'indice — e il redirect permanente è l'unico modo di dirlo a Google senza ambiguità.",
      },
      {
        t: "Un budget di prestazione scritto, con soglie scomode",
        d: "LCP sotto 1,8 s su mobile, meno di 320 kB di JavaScript al primo caricamento, zero richieste a terze parti nel percorso critico. Il budget è nel repository accanto al codice: quando una modifica lo sfora, il problema è della modifica.",
      },
    ],
  },

  verify: {
    kicker: "Fidarsi è bene",
    title: "Verificalo da solo",
    lead: "Quattro controlli che chiunque può fare in un minuto, senza credere a una parola di questa pagina.",
    items: [
      { label: "Cosa riceve un crawler", cmd: "curl -A \"GPTBot\" https://www.nadiamaar.dev/ | grep description" },
      { label: "Gli header di sicurezza", cmd: "curl -sI https://www.nadiamaar.dev/ | grep -iE \"strict-transport|content-type-op\"" },
      { label: "La misura di Google", cmd: "pagespeed.web.dev → www.nadiamaar.dev", href: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.nadiamaar.dev%2F" },
      { label: "L'indice per le AI", cmd: "www.nadiamaar.dev/llms.txt", href: "https://www.nadiamaar.dev/llms.txt" },
    ],
  },

  cta: {
    kicker: "La stessa cura, sul tuo progetto",
    title: "Questa è la soglia minima che accetto di firmare",
    lead: "Se il sito che vende architetture non regge le proprie metriche, il resto è teatro. Raccontami cosa deve reggere il tuo — e riceverai un piano con numeri altrettanto verificabili.",
    primary: "Configura il tuo progetto",
    secondary: "Parliamone",
  },
}

const en: typeof it = {
  hero: {
    kicker: "Architecture",
    over: "No slides, just source",
    lineOutlined: "THIS SITE",
    lineSolid: "IS THE CASE STUDY",
    lead: "Anyone evaluating a technical studio opens PageSpeed on its own domain before reading a single portfolio page. Rightly so. This page documents how nadiamaar.dev is built — the decisions, the constraints and the numbers — because every claim here can be checked: in the source, with a curl, or against measurements taken right now on your own device.",
  },

  live: {
    kicker: "Measured right now",
    title: "The numbers of this very page load",
    lead: "These are not lab averages: they are the measurements of the load your browser just performed, read from the Performance APIs. Reload the page and they will change — only slightly, if the architecture is doing its job.",
    ttfb: "First byte from the server",
    fcp: "First content on screen",
    js: "JavaScript transferred",
    requests: "Network requests",
    thirdParty: "Third-party origins before first paint",
    waiting: "measuring…",
    unsupported: "n/a",
    disclaimer: "TTFB and first paint also depend on your network and your device — that is the point. An honest architecture holds up wherever it is measured, not just on the presenter's hardware.",
  },

  flow: {
    kicker: "Two paths",
    title: "A visitor and a crawler do not see the same HTML",
    lead: "The site is a client-rendered application served as static files from a CDN. Metadata, however, is written by JavaScript — and Bingbot, GPTBot or a WhatsApp preview never execute it. They get a dedicated path.",
    human: {
      label: "Person",
      steps: [
        "The browser receives the static shell from the CDN — no server function in the path.",
        "Critical CSS and the boot screen are already in the HTML: the first frame is dark, not white.",
        "React mounts the application; every route beyond the home page is a chunk downloaded only when visited.",
      ],
    },
    bot: {
      label: "Crawler",
      steps: [
        "The user-agent is recognised at the edge and the request routed to a prerender function.",
        "The function reads the route's title, description, hreflang and JSON-LD from the database.",
        "The crawler receives HTML with the metadata already inside — the same metadata the admin panel governs without a deploy.",
      ],
    },
    note: "Try it yourself: `curl -A \"GPTBot\" https://www.nadiamaar.dev/` answers with the meta tags in the source; without that user-agent you get the static shell.",
  },

  decisions: {
    kicker: "The decisions",
    title: "Seven choices you can see in the numbers",
    lead: "None of them is exotic. What makes the difference is that they are written down, measured, and defended by tests that fail when someone dismantles them by accident.",
    items: [
      {
        t: "Fonts served by us, with a test standing guard",
        d: "Five families as variable woff2 on this domain, latin and extended subsets, the two above-the-fold ones preloaded. A build test fails if a single request leaves for Google Fonts: an @import is one line, and it slips back in easily during a refactor.",
      },
      {
        t: "Bilingual, with completeness enforced by the compiler",
        d: "Every text lives in an Italian+English dictionary whose shape is constrained by the type system: a half-translated key is not a warning, it is a build that refuses to start. The language is an address prefix, hreflang links are reciprocal, and the sitemap declares them in full.",
      },
      {
        t: "SEO governed by the database, not by deploys",
        d: "Titles, descriptions and structured data live in Postgres and are edited from the panel. The prerender serves them to crawlers, the sitemap updates itself, and publishing a new language for a page is one database row — no recompilation.",
      },
      {
        t: "Cookieless analytics, IP never stored in the clear",
        d: "No banner because there is nothing to confess: the session is an ephemeral identifier in sessionStorage, the IP address becomes a salted fingerprint before touching the database, and funnel events travel via sendBeacon without blocking navigation.",
      },
      {
        t: "Security at row level, not interface level",
        d: "The client area is isolated with Postgres Row-Level Security: the data filter holds for any client, not just for the interface that remembers to apply it. Public forms insert with the anonymous key inside CHECK constraints, and aggregate reads go through security-definer functions.",
      },
      {
        t: "One canonical address",
        d: "The platform alias and the apex domain answer 308 towards www.nadiamaar.dev. A site reachable at two addresses is two sites competing against each other in the index — and a permanent redirect is the only unambiguous way to tell Google.",
      },
      {
        t: "A written performance budget, with uncomfortable thresholds",
        d: "LCP under 1.8 s on mobile, less than 320 kB of JavaScript on first load, zero third-party requests in the critical path. The budget lives in the repository next to the code: when a change breaks it, the problem belongs to the change.",
      },
    ],
  },

  verify: {
    kicker: "Trust is good",
    title: "Verify it yourself",
    lead: "Four checks anyone can run in a minute, without believing a word of this page.",
    items: [
      { label: "What a crawler receives", cmd: "curl -A \"GPTBot\" https://www.nadiamaar.dev/ | grep description" },
      { label: "The security headers", cmd: "curl -sI https://www.nadiamaar.dev/ | grep -iE \"strict-transport|content-type-op\"" },
      { label: "Google's own measurement", cmd: "pagespeed.web.dev → www.nadiamaar.dev", href: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.nadiamaar.dev%2F" },
      { label: "The index for AI assistants", cmd: "www.nadiamaar.dev/llms.txt", href: "https://www.nadiamaar.dev/llms.txt" },
    ],
  },

  cta: {
    kicker: "The same care, on your project",
    title: "This is the minimum bar I am willing to sign",
    lead: "If the site selling architectures cannot hold its own metrics, the rest is theatre. Tell me what yours has to hold — and you will get a plan with numbers just as verifiable.",
    primary: "Configure your project",
    secondary: "Let's talk",
  },
}

export const ARCHITECTURE_STR = { it, en } satisfies Bundle<typeof it>
