import type { LegalDoc } from "../../legal"
import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   COOKIE POLICY — articolo 122 del D.lgs. 196/2003 e Linee guida cookie del
   Garante (provvedimento n. 231 del 10 giugno 2021).

   L'elenco degli strumenti NON è un modello: ogni riga è stata verificata
   nel codice. Le chiavi di memoria sono quelle vere —
   `nm_locale` (src/lib/i18n/locales.ts), `nm-consent` e `nm-session`
   (src/lib/measure.ts), `nm-promo-closed` (src/components/SiteChrome.tsx) —
   e i tre strumenti di terze parti sono quelli che src/lib/measure.ts sa
   caricare, nessuno in più.

   Chi aggiunge un cookie o una chiave di localStorage al sito senza
   aggiungere una riga a questa tabella pubblica una dichiarazione falsa:
   è il caso tipico che il Garante sanziona, e costa più del cookie.
══════════════════════════════════════════════════════════════════════════ */

const it: LegalDoc = {
  kicker: "Cookie policy",
  title: "Cookie e strumenti di tracciamento",
  lead: "Quali cookie e quali aree di memoria del browser usa questo sito, a che cosa servono, quanto durano e come dare, verificare o revocare il consenso. Redatta ai sensi dell'articolo 122 del D.lgs. 196/2003 e delle Linee guida del Garante per la protezione dei dati personali del 10 giugno 2021.",

  sections: [
    {
      id: "cosa-sono",
      title: "Cosa sono i cookie e gli strumenti equivalenti",
      blocks: [
        { p: "I cookie sono piccoli file di testo che un sito salva sul dispositivo di chi lo visita e rilegge alle visite successive. Accanto a essi esistono strumenti che ottengono lo stesso risultato per altra via — localStorage, sessionStorage, identificatori generati dal browser, impronte del dispositivo. Le Linee guida del Garante li equiparano ai cookie: contano la finalità e l'accesso al dispositivo, non il meccanismo. Questa pagina li elenca tutti allo stesso modo." },
        { p: "La distinzione che conta davvero è un'altra:" },
        { ul: [
          "gli strumenti tecnici servono a far funzionare il sito o a fornire un servizio che hai chiesto tu: ricordare la lingua scelta, tenere aperta una sessione autenticata, non riproporre un avviso che hai già chiuso. L'articolo 122 li esenta dal consenso e per questo sono sempre attivi;",
          "gli strumenti di profilazione e di analisi di terze parti servono invece a costruire profili di comportamento o a misurare la navigazione con strumenti altrui, e richiedono un consenso libero, specifico, informato e revocabile.",
        ] },
      ],
    },
    {
      id: "impostazione",
      title: "Come è impostato questo sito",
      blocks: [
        { p: "Il sito non installa cookie di profilazione propri, non usa cookie pubblicitari e non partecipa a circuiti di aste pubblicitarie. I numeri di traffico che lo Studio consulta arrivano da un conteggio interno che non usa cookie e non conserva l'indirizzo IP: come funziona è descritto più avanti." },
        { p: "Gli strumenti di terze parti — Google Analytics 4, Google Tag Manager e Meta Pixel — sono predisposti nel pannello di amministrazione ma partono soltanto se sono stati configurati e soltanto dopo un consenso esplicito. Il punto merita di essere detto con chiarezza, perché è ciò che distingue un banner vero da uno di facciata: se rifiuti, gli script non vengono richiesti alla rete, non vengono scaricati e non vengono eseguiti. Non vengono caricati e poi messi a riposo: proprio non vengono caricati." },
        { p: "Non ci sono cookie di rete pubblicitaria, non ci sono pulsanti social che ti riconoscono prima del clic e i caratteri tipografici sono ospitati su questo dominio: nessuna richiesta parte verso i server di Google per disegnare il testo che stai leggendo." },
      ],
    },
    {
      id: "tecnici",
      title: "Strumenti tecnici, sempre attivi",
      blocks: [
        { p: "Sono necessari al funzionamento del sito e non richiedono consenso ai sensi dell'articolo 122, comma 1, del D.lgs. 196/2003. Sono tutti di prima parte, cioè impostati da questo dominio e leggibili solo da questo dominio." },
        { table: {
          head: ["Nome", "Tipo", "Finalità", "Durata"],
          rows: [
            ["nm_locale", "Cookie", "Ricorda la lingua scelta con il selettore, così le pagine successive non ricominciano a indovinarla.", "12 mesi"],
            ["nm-consent", "localStorage", "Conserva la tua scelta sul consenso agli strumenti di terze parti, per non riproporre il banner a ogni pagina.", "Fino a cancellazione manuale"],
            ["nm-session", "sessionStorage", "Identificatore casuale che collega i passaggi di una singola visita nelle statistiche interne. Non identifica la persona e non viene mai collegato al nome o all'email.", "Fino alla chiusura della scheda"],
            ["nm-first-touch", "sessionStorage", "Conserva la sorgente della visita (parametri utm_* e sito di provenienza) per capire quale canale porta le richieste.", "Fino alla chiusura della scheda"],
            ["nm-promo-closed", "sessionStorage", "Ricorda che hai chiuso la barra degli avvisi, per non riaprirla a ogni pagina.", "Fino alla chiusura della scheda"],
            ["sb-<progetto>-auth-token", "localStorage", "Mantiene la sessione autenticata nell'area riservata. Impostato dalla libreria di autenticazione Supabase, presente solo dopo l'accesso.", "Fino alla disconnessione o alla scadenza della sessione"],
          ],
        } },
        { note: "La disattivazione di questi strumenti dalle impostazioni del browser è sempre possibile, ma può impedire il funzionamento di ciò che servono a fare: senza il token di autenticazione, per esempio, l'area riservata non riesce a tenerti collegato." },
      ],
    },
    {
      id: "statistiche-interne",
      title: "Le statistiche interne, senza cookie",
      blocks: [
        { p: "Ogni pagina vista viene contata da una funzione del sito stesso. È utile perché una parte consistente dei visitatori blocca gli script di analisi di terze parti, e in quei pannelli semplicemente non compare; ma è costruita per non profilare nessuno:" },
        { ul: [
          "non usa cookie e non scrive identificatori persistenti sul dispositivo;",
          "l'identificatore di sessione vive in sessionStorage, viene generato a caso e muore con la scheda: due visite in giorni diversi non sono collegabili fra loro;",
          "l'indirizzo IP non viene conservato: il server lo trasforma in un'impronta con SHA-256 e un sale segreto, ne tiene 128 bit e scarta l'originale;",
          "i dati non vengono incrociati con altre fonti, non vengono trasmessi a terzi per finalità proprie e non lasciano l'infrastruttura dello Studio;",
          "le rotte dell'area riservata sono escluse dal conteggio.",
        ] },
        { p: "Per queste ragioni il trattamento rientra fra quelli che le Linee guida del Garante consentono senza consenso, in quanto misurazione di prima parte con dati resi non identificabili. La base giuridica e i tempi di conservazione sono indicati nell'[informativa privacy](/privacy)." },
      ],
    },
    {
      id: "terze-parti",
      title: "Strumenti di terze parti, soggetti a consenso",
      blocks: [
        { p: "I tre strumenti seguenti vengono caricati soltanto se attivati nel pannello e soltanto dopo il tuo consenso. Quando sono attivi, i cookie che segue sono impostati direttamente dai rispettivi fornitori, che agiscono per finalità anche proprie: per una descrizione completa dei loro trattamenti occorre leggere le loro informative, indicate qui sotto." },
        { table: {
          head: ["Strumento", "Cookie principali", "Finalità", "Durata"],
          rows: [
            ["Google Analytics 4 — Google Ireland Ltd. ([informativa](https://policies.google.com/privacy))", "_ga, _ga_<ID>", "Statistiche di navigazione: pagine viste, provenienza, comportamento aggregato dei visitatori.", "Fino a 2 anni"],
            ["Google Tag Manager — Google Ireland Ltd. ([informativa](https://policies.google.com/privacy))", "Nessun cookie proprio", "Gestore di tag: non misura di per sé, ma può caricare altri strumenti secondo la configurazione attiva.", "Dipende dai tag caricati"],
            ["Meta Pixel — Meta Platforms Ireland Ltd. ([informativa](https://www.facebook.com/privacy/policy))", "_fbp, fr", "Misurazione delle campagne pubblicitarie e costruzione di pubblici per la pubblicità comportamentale.", "Fino a 3 mesi"],
          ],
        } },
        { p: "Nessuno di questi strumenti è attivo per impostazione predefinita: sono opzioni che il pannello di amministrazione consente di accendere, e l'accensione comporta la richiesta del consenso prima di qualsiasi caricamento. Questa tabella è l'elenco completo di ciò che il sito è in grado di caricare, e viene aggiornata se uno strumento viene aggiunto o rimosso." },
      ],
    },
    {
      id: "consenso",
      title: "Come dare, verificare o revocare il consenso",
      blocks: [
        { p: "Quando gli strumenti di terze parti sono attivi, alla prima visita compare un pannello che ti permette di accettare o rifiutare. Rifiutare è tanto immediato quanto accettare: sono due pulsanti affiancati, senza percorsi più lunghi per il «no» e senza opzioni preselezionate. La scelta viene ricordata nel tuo browser." },
        { p: "Per cambiare idea in un secondo momento hai tre strade:" },
        { ol: [
          "cancellare i dati del sito dalle impostazioni del browser: alla visita successiva la scelta ti verrà richiesta di nuovo;",
          "rimuovere la sola voce nm-consent dal localStorage di questo dominio, dagli strumenti per sviluppatori del browser;",
          "scrivere a {email}: il Titolare provvederà e ti confermerà l'esito.",
        ] },
        { p: "La revoca del consenso non pregiudica la liceità del trattamento svolto prima della revoca e non comporta alcuna limitazione nell'uso del sito." },
      ],
    },
    {
      id: "browser",
      title: "Gestire cookie e memoria dal browser",
      blocks: [
        { p: "Indipendentemente dalle scelte fatte qui, ogni browser consente di bloccare o cancellare cookie e dati dei siti. Le istruzioni aggiornate dei principali browser:" },
        { ul: [
          "[Google Chrome](https://support.google.com/chrome/answer/95647)",
          "[Mozilla Firefox](https://support.mozilla.org/kb/protezione-antitracciamento-avanzata-firefox-desktop)",
          "[Safari](https://support.apple.com/it-it/guide/safari/sfri11471/mac)",
          "[Microsoft Edge](https://support.microsoft.com/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)",
        ] },
        { note: "Il blocco totale dei cookie e della memoria locale impedisce anche il funzionamento degli strumenti tecnici: l'area riservata non riuscirà a mantenere l'accesso e la lingua scelta verrà dimenticata a ogni pagina." },
      ],
    },
    {
      id: "aggiornamenti",
      title: "Aggiornamenti di questa pagina",
      blocks: [
        { p: "L'elenco viene aggiornato ogni volta che uno strumento viene aggiunto o rimosso dal sito. La data di ultimo aggiornamento è indicata in testa alla pagina; se l'aggiunta riguarda uno strumento soggetto a consenso, il consenso viene richiesto di nuovo prima che quello strumento venga caricato." },
        { p: "Per tutto ciò che riguarda finalità, basi giuridiche, destinatari, trasferimenti fuori dall'Unione europea e diritti dell'interessato si rimanda all'[informativa privacy](/privacy), della quale questa pagina costituisce parte integrante." },
      ],
    },
  ],
}

const en: LegalDoc = {
  kicker: "Cookie policy",
  title: "Cookies and tracking tools",
  lead: "Which cookies and browser storage this site uses, what they are for, how long they last and how to give, check or withdraw consent. Drawn up under Article 122 of Italian Legislative Decree 196/2003 and the Italian Data Protection Authority's cookie guidelines of 10 June 2021.",

  sections: [
    {
      id: "cosa-sono",
      title: "What cookies and equivalent tools are",
      blocks: [
        { p: "Cookies are small text files that a site saves on a visitor's device and reads back on later visits. Alongside them sit tools that achieve the same result by other means — localStorage, sessionStorage, browser-generated identifiers, device fingerprints. The Italian Authority's guidelines treat them the same way as cookies: what matters is the purpose and the access to your device, not the mechanism. This page lists them all on equal footing." },
        { p: "The distinction that actually matters is a different one:" },
        { ul: [
          "technical tools make the site work or provide a service you asked for: remembering the language you picked, keeping an authenticated session open, not re-opening a notice you already dismissed. Article 122 exempts them from consent, which is why they are always active;",
          "third-party profiling and analytics tools build behavioural profiles or measure your visit with someone else's tooling, and require freely given, specific, informed and revocable consent.",
        ] },
      ],
    },
    {
      id: "impostazione",
      title: "How this site is set up",
      blocks: [
        { p: "The site sets no first-party profiling cookies, uses no advertising cookies and takes part in no ad-auction networks. The traffic figures the Studio looks at come from an internal counter that uses no cookies and keeps no IP address: how it works is described below." },
        { p: "The third-party tools — Google Analytics 4, Google Tag Manager and Meta Pixel — are wired into the admin panel but start only if they have been configured and only after explicit consent. That point is worth stating plainly, because it is what separates a real banner from a decorative one: if you decline, the scripts are not requested from the network, not downloaded and not executed. They are not loaded and then muted: they are not loaded at all." },
        { p: "There are no ad-network cookies, no social buttons that recognise you before you click, and the typefaces are hosted on this domain: no request goes out to Google's servers to draw the text you are reading." },
      ],
    },
    {
      id: "tecnici",
      title: "Technical tools, always active",
      blocks: [
        { p: "These are necessary for the site to work and require no consent under Article 122(1) of Legislative Decree 196/2003. They are all first-party: set by this domain and readable only by this domain." },
        { table: {
          head: ["Name", "Type", "Purpose", "Duration"],
          rows: [
            ["nm_locale", "Cookie", "Remembers the language chosen with the switcher, so later pages do not start guessing again.", "12 months"],
            ["nm-consent", "localStorage", "Stores your choice about third-party tools, so the banner is not shown again on every page.", "Until manually cleared"],
            ["nm-session", "sessionStorage", "A random identifier linking the steps of a single visit in the internal statistics. It does not identify the person and is never linked to a name or an email address.", "Until the tab is closed"],
            ["nm-first-touch", "sessionStorage", "Keeps the source of the visit (utm_* parameters and referring site) to understand which channel brings enquiries.", "Until the tab is closed"],
            ["nm-promo-closed", "sessionStorage", "Remembers that you dismissed the notice bar, so it does not reopen on every page.", "Until the tab is closed"],
            ["sb-<project>-auth-token", "localStorage", "Keeps the authenticated session in the client area. Set by the Supabase authentication library and present only after sign-in.", "Until sign-out or session expiry"],
          ],
        } },
        { note: "You can always disable these from your browser settings, but doing so prevents what they exist for: without the authentication token, for instance, the client area cannot keep you signed in." },
      ],
    },
    {
      id: "statistiche-interne",
      title: "Internal statistics, without cookies",
      blocks: [
        { p: "Every page view is counted by a function of the site itself. This is useful because a substantial share of visitors block third-party analytics scripts and simply never appear in those dashboards; but it is built so that nobody is profiled:" },
        { ul: [
          "it uses no cookies and writes no persistent identifier to your device;",
          "the session identifier lives in sessionStorage, is randomly generated and dies with the tab: two visits on different days cannot be linked;",
          "the IP address is not kept: the server turns it into a fingerprint using SHA-256 with a secret salt, keeps 128 bits and discards the original;",
          "the data is not combined with other sources, is not passed to third parties for their own purposes and never leaves the Studio's infrastructure;",
          "client-area routes are excluded from counting altogether.",
        ] },
        { p: "For these reasons the processing falls within what the Italian Authority's guidelines allow without consent, as first-party measurement with data rendered non-identifiable. The legal basis and retention periods are set out in the [privacy notice](/privacy)." },
      ],
    },
    {
      id: "terze-parti",
      title: "Third-party tools, subject to consent",
      blocks: [
        { p: "The three tools below are loaded only if enabled in the panel and only after your consent. When they are active, the cookies listed are set directly by the respective providers, who act partly for their own purposes: for a complete description of their processing you need to read their notices, linked below." },
        { table: {
          head: ["Tool", "Main cookies", "Purpose", "Duration"],
          rows: [
            ["Google Analytics 4 — Google Ireland Ltd. ([notice](https://policies.google.com/privacy))", "_ga, _ga_<ID>", "Navigation statistics: page views, traffic sources, aggregate visitor behaviour.", "Up to 2 years"],
            ["Google Tag Manager — Google Ireland Ltd. ([notice](https://policies.google.com/privacy))", "No cookies of its own", "Tag manager: it does not measure by itself, but can load other tools depending on the active configuration.", "Depends on the tags loaded"],
            ["Meta Pixel — Meta Platforms Ireland Ltd. ([notice](https://www.facebook.com/privacy/policy))", "_fbp, fr", "Advertising campaign measurement and audience building for behavioural advertising.", "Up to 3 months"],
          ],
        } },
        { p: "None of these tools is active by default: they are options the admin panel can switch on, and switching one on means consent is requested before anything is loaded. This table is the complete list of what the site is able to load, and it is updated whenever a tool is added or removed." },
      ],
    },
    {
      id: "consenso",
      title: "Giving, checking or withdrawing consent",
      blocks: [
        { p: "When third-party tools are active, a panel appears on your first visit allowing you to accept or decline. Declining is exactly as immediate as accepting: two buttons side by side, no longer path for «no» and no pre-ticked options. Your choice is remembered in your browser." },
        { p: "To change your mind later you have three routes:" },
        { ol: [
          "clear the site data from your browser settings: on your next visit the choice will be asked again;",
          "remove just the nm-consent entry from this domain's localStorage, using your browser's developer tools;",
          "write to {email}: the Controller will see to it and confirm the outcome.",
        ] },
        { p: "Withdrawing consent does not affect the lawfulness of processing carried out beforehand and places no limits on your use of the site." },
      ],
    },
    {
      id: "browser",
      title: "Managing cookies and storage from your browser",
      blocks: [
        { p: "Whatever you choose here, every browser lets you block or delete cookies and site data. Up-to-date instructions for the main browsers:" },
        { ul: [
          "[Google Chrome](https://support.google.com/chrome/answer/95647)",
          "[Mozilla Firefox](https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop)",
          "[Safari](https://support.apple.com/guide/safari/sfri11471/mac)",
          "[Microsoft Edge](https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)",
        ] },
        { note: "Blocking cookies and local storage entirely also stops the technical tools working: the client area will not be able to keep you signed in, and your language choice will be forgotten on every page." },
      ],
    },
    {
      id: "aggiornamenti",
      title: "Updates to this page",
      blocks: [
        { p: "The list is updated whenever a tool is added to or removed from the site. The last-updated date is shown at the top of the page; if the addition concerns a tool subject to consent, consent is asked again before that tool is loaded." },
        { p: "For everything concerning purposes, legal bases, recipients, transfers outside the European Union and data subject rights, see the [privacy notice](/privacy), of which this page forms an integral part." },
      ],
    },
  ],
}

export const COOKIE_STR = { it, en } satisfies Bundle<LegalDoc>
