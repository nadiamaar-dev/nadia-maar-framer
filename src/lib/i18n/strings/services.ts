import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   LE CINQUE PAGINE SERVIZIO (NadiaMaar_ServicePage.tsx).

   Qui c'è solo testo. Icone, colori, motivo animato, disposizione delle
   schede e ordine delle sezioni stanno nel componente, in `SERVICES_ART`:
   sono scelte di disegno e non cambiano da una lingua all'altra.

   Le voci di `offer` si accoppiano per posizione con `SERVICES_ART[slug].icons`:
   la terza voce prende la terza icona. Aggiungerne una qui senza aggiungere
   l'icona corrispondente lascia la scheda senza simbolo.

   Sull'inglese: i numeri restano nella forma internazionale (30K+, <1.2s) e
   i nomi di prodotto non si traducono. "Audit", "checkout", "funnel" sono già
   inglesi nell'originale — non c'è niente da fare, ed è giusto così.
══════════════════════════════════════════════════════════════════════════ */

const it = {
  /* Etichette del guscio, uguali per tutte e cinque le pagine. */
  ui: {
    otherServices: "Altri Servizi",
    modalKicker: "// [ Richiesta Consulenza ]",
    modalTitle: "Iniziamo a parlarne",
    modalLead: "Descrivi il tuo progetto. Rispondo entro 24h.",
    name: "Nome",
    email: "Email",
    company: "Azienda (opzionale)",
    messagePlaceholder: "Descrivi il tuo progetto o problema principale...",
    submit: "Invia Messaggio",
    failed: "Invio non riuscito. Riprova, oppure scrivici a {email}",
    sentTitle: "Messaggio inviato",
    sentBody: "Ti rispondo entro 24 ore.",
    /* Le due colonne del blocco "prima e dopo" della pagina web-app. */
    flowBefore: "Oggi",
    flowAfter: "Dopo",
    home: "Home",
    allServices: "Tutti i servizi",
  },

  ecommerce: {
    title: "E-commerce ad Alta Conversione",
    subtitle: "Architetture Shopify su misura e headless commerce. Giacenze, cataloghi ad alto volume e logistica multi-corriere in un unico sistema: l'infrastruttura accompagna la crescita invece di frenarla.",
    eyebrow: "E-Commerce · Shopify · Automazione",
    kickers: { what: "Il Problema", offer: "L'Infrastruttura", how: "Dall'Audit al Lancio" },
    extra: {
      kicker: "Prima del Go-Live",
      heading: "Che cosa viene verificato prima di dire che è pronto",
      intro: "Un e-commerce non si consegna perché «il sito si vede». Si consegna quando questi punti sono verdi su dati reali, non su un ambiente di prova pulito.",
      items: [
        "Il venduto non supera mai il disponibile, nemmeno con due ordini nello stesso secondo",
        "Il checkout regge il traffico del picco previsto, misurato con traffico simulato",
        "Ogni prezzo e ogni giacenza hanno una sola fonte, e si sa qual è",
        "Le etichette di spedizione si generano senza intervento manuale",
        "Un reso parte dal cliente e arriva in magazzino senza scambi di email",
        "LCP sotto 1,2s sulle schede prodotto, non solo in home",
        "Se un fornitore non risponde, il sito continua a vendere ciò che ha",
        "Esiste un modo per tornare indietro entro un minuto se qualcosa non torna",
      ],
    },
    whatWeDo: {
      heading: "Il tuo e-commerce è un asset — non un sito.",
      body: [
        "Molte aziende trattano lo store online come una vetrina statica. Noi lo progettiamo come un sistema operativo: giacenze allineate in tempo reale, checkout costruito per ridurre l'abbandono, integrazioni con i fornitori che tolgono di mezzo l'inserimento manuale.",
        "Lavoriamo su cataloghi da poche centinaia a oltre 30.000 referenze, marketplace B2B, configuratori di prodotto e architetture multi-store internazionali. Il perimetro cambia, il principio no: l'architettura si dimensiona prima del picco, non dopo.",
      ],
      stats: [
        { value: "30K+", label: "SKU gestiti su progetti reali" },
        { value: "<1.2s", label: "LCP: obiettivo su ogni build" },
        { value: "0", label: "Over-selling ammesso in produzione" },
      ],
    },
    offer: {
      heading: "Cosa costruiamo per te",
      items: [
        { title: "Shopify su misura & headless", desc: "Temi custom, app private, checkout personalizzato. Architetture Hydrogen o Remix quando il tema standard diventa il collo di bottiglia." },
        { title: "Magazzino sincronizzato", desc: "Giacenze allineate con ERP, fornitori e marketplace. Un solo dato di verità, così il venduto non supera mai il disponibile." },
        { title: "Catalogo e listini B2B", desc: "Varianti, listini riservati per cliente, sconti a scaglioni e cataloghi differenziati per segmento commerciale." },
        { title: "Logistica integrata", desc: "Connessione con GLS, DHL, BRT e SDA: etichette generate in automatico, tracking in tempo reale, flusso resi senza scambi di email." },
        { title: "Core Web Vitals", desc: "LCP sotto 1,2s, layout stabile, interazione nella fascia verde. Immagini, caricamento differito, CDN e cache a più livelli." },
        { title: "Misurazione e CRO", desc: "GA4 con eventi e-commerce, mappe di calore, imbuto di checkout. Test A/B sulle fasi che perdono più carrelli." },
      ],
    },
    how: {
      heading: "Dall'audit al lancio",
      steps: [
        { title: "Audit tecnico e analisi delle perdite", desc: "Analizziamo lo stack attuale, individuiamo i punti in cui il funnel perde e ne quantifichiamo l'impatto. Ne esce un report con le priorità in ordine di ritorno." },
        { title: "Architettura e pianificazione", desc: "Scelta dello stack, mappa delle integrazioni, piano di migrazione dei dati e calendario dei rilasci." },
        { title: "Sviluppo e integrazioni", desc: "Tema su misura, app private, connettori API. Ogni integrazione viene provata su dati reali prima di toccare la produzione." },
        { title: "Collaudo e test di carico", desc: "Traffico simulato sui picchi previsti, verifica dei flussi critici — checkout, resi, notifiche — e approvazione del tuo team prima del go-live." },
        { title: "Lancio graduale e presidio", desc: "Rilascio progressivo con feature flag e rientro immediato se qualcosa non torna. Monitoraggio attivo nelle prime 72 ore." },
      ],
    },
    cta: {
      heading: "Il tuo store regge la prossima campagna?",
      sub: "Analisi gratuita dello store attuale, con i punti di perdita in ordine di impatto. Nessun impegno.",
      btn: "Richiedi l'Audit Gratuito",
    },
  },

  corporate: {
    title: "Siti Corporate & Lead Generation",
    subtitle: "Presenza digitale per aziende e studi professionali. Architetture web costruite per reggere il confronto nel momento in cui il decisore vi sta valutando, e per trasformare quella visita in un contatto utile al commerciale.",
    eyebrow: "Corporate · UI/UX Premium · Lead Generation",
    kickers: { what: "Perché Conta", offer: "Cosa Comprende", how: "Il Percorso" },
    extra: {
      kicker: "Due Modi di Intenderlo",
      heading: "Vetrina o strumento commerciale",
      left: {
        title: "Sito vetrina",
        points: [
          "Racconta l'azienda a chi già la conosce",
          "Si aggiorna quando qualcuno se ne ricorda",
          "I contatti arrivano in una casella condivisa",
          "Nessuno sa quale pagina abbia portato la richiesta",
          "Il confronto con i concorrenti non è mai stato fatto",
        ],
      },
      right: {
        title: "Strumento commerciale",
        points: [
          "Risponde alle domande che il decisore si fa prima di scrivere",
          "Il team pubblica in autonomia, senza passare dallo sviluppo",
          "Il contatto entra nel CRM già qualificato",
          "Ogni richiesta porta con sé la pagina da cui è nata",
          "Le pagine chiave si rivedono sui dati, non sulle opinioni",
        ],
      },
    },
    whatWeDo: {
      heading: "Il tuo sito è il tuo miglior commerciale.",
      body: [
        "Un sito corporate mediocre non è neutro: lavora contro di te. Chi deve firmare un contratto importante ti valuta anche da lì, e ogni euro speso in campagne finisce su una pagina che non regge il confronto. Costruiamo presenze digitali che sostengono il posizionamento invece di indebolirlo.",
        "Tipografia, gerarchia dei contenuti, micro-interazioni, tempi di caricamento: ogni scelta risponde a un obiettivo dichiarato, cioè portare il visitatore giusto a lasciare un contatto con cui il tuo commerciale possa davvero lavorare.",
      ],
      stats: [
        { value: "100", label: "Lighthouse Performance: soglia di consegna" },
        { value: "<0.8s", label: "LCP su desktop: obiettivo di progetto" },
        { value: "1", label: "Referente unico dal brief al lancio" },
      ],
    },
    offer: {
      heading: "Architettura completa per la tua presenza digitale",
      items: [
        { title: "Design system", desc: "Dal file Figma al codice senza scarti: token, componenti riutilizzabili, tema chiaro e scuro, animazioni coerenti su tutto il sito." },
        { title: "Architettura di acquisizione", desc: "Moduli progettati per essere compilati davvero, collegamento a HubSpot o Salesforce, sequenze di follow-up e qualificazione automatica del contatto." },
        { title: "CMS headless", desc: "Sanity o Contentful: il tuo team pubblica e aggiorna senza passare dallo sviluppo e senza rischiare di rompere il layout." },
        { title: "Performance", desc: "Next.js con App Router, rendering ibrido statico e dinamico, rigenerazione incrementale per le sezioni che cambiano spesso." },
        { title: "SEO strutturale", desc: "Dati strutturati, sitemap dinamica, Open Graph, Core Web Vitals. La visibilità organica nasce dall'architettura, non da un plugin aggiunto dopo." },
        { title: "Misurazione", desc: "GA4 con eventi su misura, mappe di calore, imbuti di conversione e un pannello sintetico pensato per la direzione." },
      ],
    },
    how: {
      heading: "Dal brief al primo contatto qualificato",
      steps: [
        { title: "Discovery e strategia", desc: "Due ore di confronto su mercato, cliente ideale, concorrenti e obiettivi di crescita. Gli indicatori si definiscono prima di disegnare qualsiasi schermata." },
        { title: "Design e prototipo", desc: "Wireframe, design system, prototipo navigabile in Figma. Approvi ogni schermata prima che parta lo sviluppo: nessuna sorpresa a fine lavoro." },
        { title: "Sviluppo e integrazioni", desc: "Next.js, CMS headless e CRM. TypeScript, test end-to-end e integrazione continua: le performance si verificano a ogni commit, non alla fine." },
        { title: "Impianto SEO", desc: "Struttura degli URL, modelli di meta tag, dati strutturati, sitemap e Search Console. Il sito è indicizzabile dal primo giorno di vita." },
        { title: "Lancio e taratura", desc: "Go-live con monitoraggio attivo. Nei trenta giorni successivi si interviene su titoli, inviti all'azione e percorsi di contatto sulla base dei dati reali." },
      ],
    },
    cta: {
      heading: "Il tuo brand merita una presenza all'altezza.",
      sub: "Ti mostriamo un'analisi del sito attuale e ne discutiamo insieme: dove perde autorevolezza e dove perde contatti.",
      btn: "Analizza il mio Sito",
    },
  },

  webapp: {
    title: "Applicazioni Web & Automazione Custom",
    subtitle: "Software su misura che collega CRM, ERP e sistemi di terze parti. Togliamo di mezzo i passaggi manuali, mettiamo i dati in un solo posto e costruiamo strumenti interni che lavorano anche quando l'ufficio è chiuso.",
    eyebrow: "Web App · CRM/ERP · Automazione Processi",
    kickers: { what: "Il Costo Nascosto", offer: "Cosa Costruiamo", how: "Come Procediamo" },
    extra: {
      kicker: "Una Giornata Tipo",
      heading: "Lo stesso lavoro, prima e dopo",
      before: [
        "Si esporta il file dal gestionale",
        "Si sistemano a mano le colonne che non tornano",
        "Si carica sul CRM e si controlla che non ci siano doppioni",
        "Si avvisa il commerciale su WhatsApp",
        "A fine mese si ricostruisce il report cercando negli allegati",
      ],
      after: [
        "Il gestionale scrive sul CRM appena il dato cambia",
        "I doppioni non entrano: la regola sta nel sistema",
        "Il commerciale riceve una notifica con il contesto già dentro",
        "Il report esiste sempre, aggiornato, senza che qualcuno lo compili",
      ],
    },
    whatWeDo: {
      heading: "Ogni processo manuale è un costo nascosto.",
      body: [
        "Il costo di un'operazione manuale non è solo il tempo: sono gli errori di trascrizione, le decisioni prese in ritardo e l'impossibilità di crescere senza assumere. Quando una persona passa tre ore al giorno a spostare dati fra due sistemi, stai pagando una professionalità per fare il lavoro di uno script.",
        "Costruiamo applicazioni web e automazioni che parlano con gli strumenti già in uso, tolgono la routine e restituiscono al team le ore che oggi finiscono in copia-incolla. Il ritorno si calcola prima di iniziare, sul costo reale del processo attuale.",
      ],
      stats: [
        { value: "1", label: "Fonte unica per ogni dato" },
        { value: "24/7", label: "Automazioni attive senza presidio" },
        { value: "0", label: "Passaggi di copia-incolla previsti" },
      ],
    },
    offer: {
      heading: "Soluzioni software per ogni livello di complessità",
      items: [
        { title: "Applicazioni web su misura", desc: "Frontend React o Next.js, backend Node.js o Python. Autenticazione, permessi per ruolo e un'architettura che regge la crescita del team." },
        { title: "Integrazioni CRM ed ERP", desc: "Salesforce, HubSpot, SAP, Odoo o gestionale interno. I dati si allineano da soli, in una direzione decisa e sempre tracciabile." },
        { title: "Automazione dei flussi", desc: "n8n, Zapier o script dedicati in Python e Node. Attivazioni su evento, avvisi mirati, report che partono da soli." },
        { title: "Gateway API e middleware", desc: "Servizi REST e GraphQL che centralizzano le chiamate, governano i limiti di traffico e rendono visibile ciò che passa fra i sistemi." },
        { title: "Pannelli di controllo", desc: "Numeri di business aggiornati, indicatori scelti insieme, approfondimento fino al singolo record, invii programmati via email o Slack." },
        { title: "Portali B2B", desc: "Area riservata per clienti e partner: ordini, fatture, documenti e comunicazioni in un unico posto, con traccia di chi ha fatto cosa." },
      ],
    },
    how: {
      heading: "Dall'analisi dei processi al presidio",
      steps: [
        { title: "Analisi dei processi", desc: "Mappatura dei flussi esistenti: ogni passaggio manuale, ogni integrazione mancante e il costo operativo di come si lavora oggi." },
        { title: "Progettazione dell'architettura", desc: "Schema del sistema: quali strumenti si collegano, come si muovono i dati, quali automazioni entrano in gioco. Approvato prima di scrivere una riga di codice." },
        { title: "Sviluppo a iterazioni", desc: "Sprint settimanali con dimostrazione dal vivo: vedi crescere il prodotto e puoi correggere la rotta a ogni passaggio." },
        { title: "Integrazione e collaudo", desc: "Collegamento ai sistemi esistenti in ambiente di prova, test di carico e di sicurezza, verifica dei flussi critici su dati reali resi anonimi." },
        { title: "Rilascio e formazione", desc: "Messa in produzione con rientro automatico in caso di anomalia, sessione di formazione per il team e documentazione tecnica completa." },
        { title: "Presidio ed evoluzione", desc: "Monitoraggio dopo il rilascio. Il sistema cresce con te: nuove automazioni, nuove integrazioni, nuovi moduli quando servono davvero." },
      ],
    },
    cta: {
      heading: "Ogni ora persa in processi manuali è denaro bruciato.",
      sub: "Raccontaci il processo che vi costa di più. In mezz'ora ti diciamo se si può automatizzare, come, e che cosa serve per farlo.",
      btn: "Parla dei tuoi Processi",
    },
  },

  seo: {
    title: "SEO Strategico & Performance Marketing",
    subtitle: "Posizionamento organico previsto nell'architettura dal primo giorno e campagne Google e Meta governate sugli stessi dati. Due canali che si sostengono a vicenda, invece di competere per lo stesso budget.",
    eyebrow: "SEO Tecnico · Google Ads · Meta Ads",
    kickers: { what: "La Logica", offer: "Le Leve", how: "Il Percorso" },
    extra: {
      kicker: "Che Cosa Aspettarsi",
      heading: "I primi dodici mesi, senza scorciatoie",
      phases: [
        { when: "Mese 1–2", what: "Correzioni tecniche e struttura. In questa fase i numeri si muovono poco: si sta togliendo ciò che frena." },
        { when: "Mese 3–4", what: "Prime pagine posizionate sulle ricerche di coda lunga. Il traffico cresce su termini specifici, non ancora su quelli generici." },
        { when: "Mese 5–8", what: "I gruppi tematici si consolidano. Le pagine si sostengono a vicenda e iniziano a salire anche le query più contese." },
        { when: "Mese 9–12", what: "L'organico regge una quota stabile della domanda. Da qui il budget delle campagne può iniziare a spostarsi." },
      ],
    },
    whatWeDo: {
      heading: "L'organico è l'unico canale che non si spegne quando smetti di pagare.",
      body: [
        "Dipendere solo dalle campagne significa affittare la propria visibilità: il giorno in cui il budget si ferma, si ferma anche il traffico. Il lavoro organico costruisce invece qualcosa che resta — una pagina ben posizionata continua a portare visite molto dopo essere stata scritta.",
        "Teniamo insieme SEO tecnico, strategia dei contenuti e campagne a pagamento in un unico piano. Le campagne coprono la domanda mentre l'organico cresce; man mano che l'organico regge, il peso del budget si sposta.",
      ],
      stats: [
        { value: "12–18", label: "Mesi: orizzonte realistico dell'organico" },
        { value: "0", label: "Tecniche a rischio penalizzazione" },
        { value: "1", label: "Pannello unico per organico e campagne" },
      ],
    },
    offer: {
      heading: "Le leve su cui lavoriamo",
      items: [
        { title: "SEO tecnico", desc: "Core Web Vitals, scansione, hreflang, dati strutturati, sitemap dinamica, analisi dei log del server. La parte che Google misura e che dipende solo da noi." },
        { title: "Strategia delle query", desc: "Analisi per intento di ricerca, confronto con i concorrenti, architettura dei contenuti per gruppi tematici e pagine pilastro." },
        { title: "Architettura dei contenuti", desc: "Brief per ogni pagina che conta, ottimizzazione on-page, collegamenti interni ragionati e revisione di ciò che è già pubblicato." },
        { title: "Google Ads", desc: "Search, Shopping e Performance Max con offerte automatiche governate. L'obiettivo di ROAS si fissa insieme nel brief e si rivede ogni mese sui dati reali." },
        { title: "Meta e social ads", desc: "Campagne su Feed, Storie e Reels. Retargeting per livelli di interesse, pubblici simili e test sistematico dei creativi." },
        { title: "Report e letture", desc: "Pannello aggiornato con posizioni, traffico, conversioni e ritorno sulla spesa. Ogni mese un'analisi con le azioni in ordine di priorità." },
      ],
    },
    how: {
      heading: "Dall'audit alla crescita stabile",
      steps: [
        { title: "Audit SEO", desc: "Analisi tecnica del sito, report di scansione, studio dei concorrenti organici, interventi rapidi e opportunità di lungo periodo. Ne esce una roadmap in ordine di priorità." },
        { title: "Strategia di query e contenuti", desc: "Mappa delle ricerche per ogni fase del percorso d'acquisto, architettura dei contenuti, confronto con i concorrenti. Si decide cosa creare, cosa rivedere e cosa togliere." },
        { title: "Interventi tecnici", desc: "Correzioni sul sito, dati strutturati, tempi di caricamento, errori di scansione. In parallelo partono le prime campagne, che intanto coprono la domanda." },
        { title: "Produzione e autorevolezza", desc: "Contenuti ottimizzati, digital PR per citazioni autorevoli, rapporti editoriali. Solo tecniche che reggono un aggiornamento dell'algoritmo." },
        { title: "Taratura mensile", desc: "Analisi dei dati, test sulle pagine di atterraggio, aggiornamento dei contenuti in calo, apertura di nuovi gruppi tematici quando i primi sono consolidati." },
      ],
    },
    cta: {
      heading: "Ogni giorno senza SEO è un giorno regalato ai competitor.",
      sub: "Analisi gratuita del posizionamento attuale a confronto con i concorrenti. In mezz'ora sai dove sei, che cosa manca e in che ordine intervenire.",
      btn: "Ottieni l'Analisi SEO Gratuita",
    },
  },

  ai: {
    title: "Integrazione AI & Sistemi Intelligenti",
    subtitle: "Agenti, modelli linguistici e ricerca sui documenti aziendali, integrati nei processi che già esistono. Non progetti pilota fini a sé stessi: casi d'uso scelti perché hanno un ritorno calcolabile.",
    eyebrow: "AI Agents · LLM · Automazione Intelligente",
    kickers: { what: "Quando Conviene", offer: "Gli Ambiti", how: "Dalla Valutazione alla Produzione" },
    extra: {
      kicker: "Quando Diciamo di No",
      heading: "Dove l'AI non conviene",
      intro: "Metà del valore di questo lavoro sta nell'escludere i casi sbagliati prima di spenderci mesi. Questi li scartiamo in fase di valutazione.",
      items: [
        { t: "Processi che cambiano a ogni cliente", d: "Se non esiste una regola ricorrente, non c'è niente da automatizzare: c'è da riprogettare il processo, ed è un altro lavoro." },
        { t: "Dati assenti o inaffidabili", d: "Un modello addestrato su archivi incompleti restituisce risposte sicure e sbagliate. Prima si sistemano i dati." },
        { t: "Decisioni con responsabilità legale", d: "Approvazioni contrattuali, valutazioni del personale, questioni sanitarie: l'AI può preparare, non decidere." },
        { t: "Volumi troppo bassi", d: "Sotto una certa soglia di ripetizioni il costo di costruzione e presidio non rientra. Meglio dirlo subito." },
      ],
    },
    whatWeDo: {
      heading: "L'AI conviene dove il processo è ripetitivo e i dati ci sono già.",
      body: [
        "Il valore non arriva dall'adottare un modello, ma dallo scegliere il punto giusto in cui inserirlo. Un'attività ripetitiva, con regole chiare e dati già disponibili, è il candidato ideale. Un processo che cambia forma a ogni cliente, quasi mai — e dirlo prima fa risparmiare mesi.",
        "Implementiamo cose che poi restano in produzione: assistenti che rispondono alle richieste ricorrenti, sistemi che rendono cercabile la documentazione interna, generazione assistita delle schede prodotto. Ogni caso d'uso parte da una misura del prima, così il dopo è verificabile.",
      ],
      stats: [
        { value: "2", label: "Settimane per il primo prototipo utile" },
        { value: "1", label: "Caso d'uso alla volta, misurato" },
        { value: "0", label: "Dati inviati a modelli non concordati" },
      ],
    },
    offer: {
      heading: "Dove l'AI porta un vantaggio reale",
      items: [
        { title: "Agenti su misura", desc: "LangChain, AutoGen, CrewAI. Sequenze che cercano, analizzano, redigono e passano la mano all'operatore quando il caso esce dal previsto." },
        { title: "Ricerca sui documenti interni", desc: "Manuali, contratti, capitolati, email: il sistema trova il passaggio giusto e ne cita la fonte, invece di inventare una risposta plausibile." },
        { title: "Scelta e integrazione dei modelli", desc: "OpenAI, Anthropic, Mistral o modelli ospitati da voi. Il criterio è costo, latenza e vincoli di riservatezza, non la moda del mese." },
        { title: "AI per l'e-commerce", desc: "Schede prodotto generate e poi revisionate, arricchimento del catalogo, assistente di pre-vendita collegato alle giacenze reali." },
        { title: "Assistenti conversazionali", desc: "Qualificazione dei contatti, primo livello di supporto, onboarding. Collegati al CRM, con passaggio a una persona nel momento in cui serve." },
        { title: "Modelli predittivi", desc: "Previsione della domanda e delle scorte, rilevamento delle anomalie, segnali che arrivano prima che il problema si veda in bilancio." },
      ],
    },
    how: {
      heading: "Dalla valutazione al sistema in produzione",
      steps: [
        { title: "Valutazione di fattibilità", desc: "Quali dati esistono e in che stato, quali processi sono candidati e quale ritorno è plausibile per ciascuno. Ne esce una lista ordinata per rapporto fra valore e sforzo." },
        { title: "Prototipo sul caso più promettente", desc: "Due settimane per una versione funzionante sul caso a maggiore impatto. Si misura sui vostri dati prima di impegnarsi sull'implementazione completa." },
        { title: "Architettura", desc: "Scelta dei modelli, flusso dei dati, archivio vettoriale, limiti di sicurezza e comportamento previsto quando il modello non sa rispondere." },
        { title: "Integrazione nei processi", desc: "Collegamento a CRM, ERP, e-commerce e banche dati. Il sistema diventa un passaggio del lavoro quotidiano, non uno strumento a parte da ricordarsi di aprire." },
        { title: "Adattamento ai vostri dati", desc: "Messa a punto sui casi reali, prove sui casi limite, raccolta strutturata dei riscontri per migliorare nel tempo." },
        { title: "Rilascio e presidio", desc: "Attivazione graduale a confronto con il processo manuale. Monitoraggio di accuratezza, tempi di risposta e costo per richiesta." },
      ],
    },
    cta: {
      heading: "Non tutti i processi meritano l'AI. Alcuni sì.",
      sub: "In 45 minuti guardiamo insieme i vostri processi e individuiamo quelli che valgono un'automazione — e quelli che non la valgono.",
      btn: "Prenota la Sessione AI",
    },
  },
}

const en: typeof it = {
  ui: {
    otherServices: "Other Services",
    modalKicker: "// [ Consultation Request ]",
    modalTitle: "Let's start talking",
    modalLead: "Describe your project. I reply within 24h.",
    name: "Name",
    email: "Email",
    company: "Company (optional)",
    messagePlaceholder: "Describe your project or your main problem…",
    submit: "Send Message",
    failed: "Sending failed. Try again, or write to us at {email}",
    sentTitle: "Message sent",
    sentBody: "I'll reply within 24 hours.",
    flowBefore: "Today",
    flowAfter: "After",
    home: "Home",
    allServices: "All services",
  },

  ecommerce: {
    title: "High-Conversion E-commerce",
    subtitle: "Bespoke Shopify architectures and headless commerce. Stock, high-volume catalogues and multi-carrier logistics in one system: infrastructure that carries growth instead of holding it back.",
    eyebrow: "E-Commerce · Shopify · Automation",
    kickers: { what: "The Problem", offer: "The Infrastructure", how: "From Audit to Launch" },
    extra: {
      kicker: "Before Go-Live",
      heading: "What gets verified before we call it ready",
      intro: "An e-commerce isn't delivered because \"the site shows up\". It's delivered when these points are green on real data, not on a clean staging environment.",
      items: [
        "What's sold never exceeds what's available, not even with two orders in the same second",
        "Checkout holds the expected peak traffic, measured with simulated load",
        "Every price and stock level has one source, and everyone knows which",
        "Shipping labels are generated with no manual step",
        "A return leaves the customer and reaches the warehouse without a single email thread",
        "LCP under 1.2s on product pages, not just on the homepage",
        "If a supplier stops responding, the site keeps selling what it has",
        "There is a way to roll back within a minute if something looks wrong",
      ],
    },
    whatWeDo: {
      heading: "Your e-commerce is an asset — not a website.",
      body: [
        "Many companies treat their online store as a static shop window. We design it as an operating system: stock aligned in real time, a checkout built to reduce abandonment, supplier integrations that take manual data entry out of the picture.",
        "We work on catalogues from a few hundred to over 30,000 references, B2B marketplaces, product configurators and international multi-store architectures. The scope changes, the principle doesn't: architecture is sized before the peak, not after it.",
      ],
      stats: [
        { value: "30K+", label: "SKUs managed on real projects" },
        { value: "<1.2s", label: "LCP: the target on every build" },
        { value: "0", label: "Over-selling allowed in production" },
      ],
    },
    offer: {
      heading: "What we build for you",
      items: [
        { title: "Custom Shopify & headless", desc: "Custom themes, private apps, tailored checkout. Hydrogen or Remix architectures when the standard theme becomes the bottleneck." },
        { title: "Synchronised warehouse", desc: "Stock aligned with your ERP, suppliers and marketplaces. One source of truth, so what's sold never exceeds what's available." },
        { title: "B2B catalogue and price lists", desc: "Variants, customer-specific price lists, tiered discounts and catalogues differentiated by commercial segment." },
        { title: "Integrated logistics", desc: "Connections to GLS, DHL, BRT and SDA: labels generated automatically, real-time tracking, a returns flow with no email threads." },
        { title: "Core Web Vitals", desc: "LCP under 1.2s, stable layout, interaction in the green band. Images, lazy loading, CDN and multi-layer caching." },
        { title: "Measurement and CRO", desc: "GA4 with e-commerce events, heatmaps, checkout funnel. A/B tests on the steps that lose the most carts." },
      ],
    },
    how: {
      heading: "From audit to launch",
      steps: [
        { title: "Technical audit and loss analysis", desc: "We analyse the current stack, find the points where the funnel leaks and quantify the impact. The output is a report with priorities ordered by return." },
        { title: "Architecture and planning", desc: "Stack choice, integration map, data migration plan and release calendar." },
        { title: "Development and integrations", desc: "Bespoke theme, private apps, API connectors. Every integration is tested on real data before it touches production." },
        { title: "Testing and load tests", desc: "Simulated traffic at the expected peaks, verification of the critical flows — checkout, returns, notifications — and sign-off from your team before go-live." },
        { title: "Gradual launch and monitoring", desc: "Progressive release behind feature flags, with an immediate rollback if something looks wrong. Active monitoring through the first 72 hours." },
      ],
    },
    cta: {
      heading: "Will your store hold up to the next campaign?",
      sub: "A free analysis of your current store, with the leak points ordered by impact. No strings attached.",
      btn: "Request the Free Audit",
    },
  },

  corporate: {
    title: "Corporate Sites & Lead Generation",
    subtitle: "Digital presence for companies and professional firms. Web architectures built to hold up at the moment a decision-maker is evaluating you, and to turn that visit into a contact your sales team can actually use.",
    eyebrow: "Corporate · Premium UI/UX · Lead Generation",
    kickers: { what: "Why It Matters", offer: "What's Included", how: "The Path" },
    extra: {
      kicker: "Two Ways to See It",
      heading: "Shop window or sales instrument",
      left: {
        title: "Shop-window site",
        points: [
          "Describes the company to people who already know it",
          "Gets updated whenever someone remembers to",
          "Enquiries land in a shared inbox",
          "Nobody knows which page produced the request",
          "The comparison with competitors was never made",
        ],
      },
      right: {
        title: "Sales instrument",
        points: [
          "Answers the questions a decision-maker asks before writing",
          "The team publishes on its own, without going through development",
          "The contact enters the CRM already qualified",
          "Every request carries the page it came from",
          "Key pages are revised on data, not on opinions",
        ],
      },
    },
    whatWeDo: {
      heading: "Your site is your best salesperson.",
      body: [
        "A mediocre corporate site isn't neutral: it works against you. Someone about to sign a significant contract judges you partly from there, and every euro spent on campaigns lands on a page that doesn't hold up. We build digital presences that support your positioning instead of weakening it.",
        "Typography, content hierarchy, micro-interactions, loading times: every choice answers a stated goal — getting the right visitor to leave a contact your sales team can genuinely work with.",
      ],
      stats: [
        { value: "100", label: "Lighthouse Performance: delivery threshold" },
        { value: "<0.8s", label: "LCP on desktop: project target" },
        { value: "1", label: "One point of contact from brief to launch" },
      ],
    },
    offer: {
      heading: "Complete architecture for your digital presence",
      items: [
        { title: "Design system", desc: "From the Figma file to code with nothing lost: tokens, reusable components, light and dark themes, animations consistent across the whole site." },
        { title: "Acquisition architecture", desc: "Forms designed to actually be filled in, connection to HubSpot or Salesforce, follow-up sequences and automatic lead qualification." },
        { title: "Headless CMS", desc: "Sanity or Contentful: your team publishes and updates without going through development and without risking the layout." },
        { title: "Performance", desc: "Next.js with the App Router, hybrid static and dynamic rendering, incremental regeneration for the sections that change often." },
        { title: "Structural SEO", desc: "Structured data, dynamic sitemap, Open Graph, Core Web Vitals. Organic visibility comes from the architecture, not from a plugin added later." },
        { title: "Measurement", desc: "GA4 with bespoke events, heatmaps, conversion funnels and a concise dashboard written for management." },
      ],
    },
    how: {
      heading: "From brief to the first qualified contact",
      steps: [
        { title: "Discovery and strategy", desc: "Two hours on market, ideal customer, competitors and growth goals. The metrics are defined before a single screen is drawn." },
        { title: "Design and prototype", desc: "Wireframes, design system, a clickable prototype in Figma. You approve every screen before development starts: no surprises at the end." },
        { title: "Development and integrations", desc: "Next.js, headless CMS and CRM. TypeScript, end-to-end tests and continuous integration: performance is checked on every commit, not at the end." },
        { title: "SEO foundations", desc: "URL structure, meta tag templates, structured data, sitemap and Search Console. The site is indexable from its first day." },
        { title: "Launch and tuning", desc: "Go-live with active monitoring. Over the next thirty days we adjust headlines, calls to action and contact paths based on real data." },
      ],
    },
    cta: {
      heading: "Your brand deserves a presence that matches it.",
      sub: "We'll show you an analysis of your current site and go through it together: where it loses authority, and where it loses contacts.",
      btn: "Analyse My Site",
    },
  },

  webapp: {
    title: "Web Apps & Custom Automation",
    subtitle: "Bespoke software connecting CRM, ERP and third-party systems. We take the manual steps out, put the data in one place and build internal tools that keep working when the office is closed.",
    eyebrow: "Web Apps · CRM/ERP · Process Automation",
    kickers: { what: "The Hidden Cost", offer: "What We Build", how: "How We Proceed" },
    extra: {
      kicker: "A Typical Day",
      heading: "The same work, before and after",
      before: [
        "You export the file from the management system",
        "You fix the columns that don't line up, by hand",
        "You upload it to the CRM and check for duplicates",
        "You ping the salesperson on WhatsApp",
        "At month end you rebuild the report by digging through attachments",
      ],
      after: [
        "The management system writes to the CRM the moment the data changes",
        "Duplicates never get in: the rule lives in the system",
        "The salesperson gets a notification with the context already in it",
        "The report always exists, up to date, without anyone compiling it",
      ],
    },
    whatWeDo: {
      heading: "Every manual process is a hidden cost.",
      body: [
        "The cost of a manual operation isn't just the time: it's the transcription errors, the decisions taken late and the inability to grow without hiring. When someone spends three hours a day moving data between two systems, you're paying for expertise to do a script's job.",
        "We build web apps and automations that talk to the tools already in use, remove the routine and give the team back the hours currently lost to copy-paste. The return is calculated before we start, against the real cost of the current process.",
      ],
      stats: [
        { value: "1", label: "One source for every piece of data" },
        { value: "24/7", label: "Automations running unattended" },
        { value: "0", label: "Copy-paste steps by design" },
      ],
    },
    offer: {
      heading: "Software solutions at every level of complexity",
      items: [
        { title: "Bespoke web applications", desc: "React or Next.js frontend, Node.js or Python backend. Authentication, role-based permissions and an architecture that survives the team growing." },
        { title: "CRM and ERP integrations", desc: "Salesforce, HubSpot, SAP, Odoo or an in-house system. Data aligns on its own, in a decided direction and always traceable." },
        { title: "Workflow automation", desc: "n8n, Zapier or dedicated scripts in Python and Node. Event triggers, targeted alerts, reports that send themselves." },
        { title: "API gateways and middleware", desc: "REST and GraphQL services that centralise calls, govern rate limits and make visible what moves between systems." },
        { title: "Control dashboards", desc: "Business numbers kept current, metrics chosen together, drill-down to the single record, scheduled delivery by email or Slack." },
        { title: "B2B portals", desc: "A private area for clients and partners: orders, invoices, documents and messages in one place, with a record of who did what." },
      ],
    },
    how: {
      heading: "From process analysis to ongoing support",
      steps: [
        { title: "Process analysis", desc: "Mapping the existing flows: every manual step, every missing integration and the operating cost of how you work today." },
        { title: "Architecture design", desc: "The system diagram: which tools connect, how data moves, which automations come into play. Approved before a line of code is written." },
        { title: "Iterative development", desc: "Weekly sprints with a live demo: you watch the product grow and can correct course at every step." },
        { title: "Integration and testing", desc: "Connection to the existing systems in staging, load and security tests, verification of the critical flows on anonymised real data." },
        { title: "Release and training", desc: "Going into production with automatic rollback on failure, a training session for the team and complete technical documentation." },
        { title: "Support and evolution", desc: "Monitoring after release. The system grows with you: new automations, new integrations, new modules when they're genuinely needed." },
      ],
    },
    cta: {
      heading: "Every hour lost to manual processes is money burnt.",
      sub: "Tell us about the process that costs you most. In half an hour we'll tell you whether it can be automated, how, and what it takes.",
      btn: "Talk About Your Processes",
    },
  },

  seo: {
    title: "Strategic SEO & Performance Marketing",
    subtitle: "Organic ranking planned into the architecture from day one, and Google and Meta campaigns governed on the same data. Two channels that support each other instead of competing for the same budget.",
    eyebrow: "Technical SEO · Google Ads · Meta Ads",
    kickers: { what: "The Logic", offer: "The Levers", how: "The Path" },
    extra: {
      kicker: "What to Expect",
      heading: "The first twelve months, no shortcuts",
      phases: [
        { when: "Month 1–2", what: "Technical fixes and structure. The numbers barely move in this phase: we're removing what holds things back." },
        { when: "Month 3–4", what: "First pages ranking on long-tail searches. Traffic grows on specific terms, not yet on the generic ones." },
        { when: "Month 5–8", what: "The topic clusters consolidate. Pages support each other and the more contested queries start climbing too." },
        { when: "Month 9–12", what: "Organic holds a stable share of demand. From here the campaign budget can start shifting." },
      ],
    },
    whatWeDo: {
      heading: "Organic is the only channel that doesn't switch off when you stop paying.",
      body: [
        "Depending on campaigns alone means renting your visibility: the day the budget stops, the traffic stops with it. Organic work builds something that stays — a well-ranked page keeps bringing visits long after it was written.",
        "We hold technical SEO, content strategy and paid campaigns together in one plan. Campaigns cover demand while organic grows; as organic takes the load, the weight of the budget shifts.",
      ],
      stats: [
        { value: "12–18", label: "Months: the realistic horizon for organic" },
        { value: "0", label: "Techniques that risk a penalty" },
        { value: "1", label: "One dashboard for organic and campaigns" },
      ],
    },
    offer: {
      heading: "The levers we work on",
      items: [
        { title: "Technical SEO", desc: "Core Web Vitals, crawling, hreflang, structured data, dynamic sitemap, server log analysis. The part Google measures and that depends only on us." },
        { title: "Query strategy", desc: "Analysis by search intent, competitor comparison, content architecture around topic clusters and pillar pages." },
        { title: "Content architecture", desc: "A brief for every page that matters, on-page optimisation, deliberate internal linking and a review of what's already published." },
        { title: "Google Ads", desc: "Search, Shopping and Performance Max with governed automated bidding. The ROAS target is set together in the brief and reviewed monthly on real data." },
        { title: "Meta and social ads", desc: "Campaigns on Feed, Stories and Reels. Retargeting by level of interest, lookalike audiences and systematic creative testing." },
        { title: "Reporting and reviews", desc: "A live dashboard with rankings, traffic, conversions and return on spend. Every month, an analysis with the actions in priority order." },
      ],
    },
    how: {
      heading: "From audit to stable growth",
      steps: [
        { title: "SEO audit", desc: "Technical site analysis, crawl report, study of the organic competitors, quick wins and long-term opportunities. The output is a roadmap in priority order." },
        { title: "Query and content strategy", desc: "A map of searches for every stage of the buying journey, content architecture, competitor comparison. We decide what to create, what to revise and what to remove." },
        { title: "Technical work", desc: "Fixes on the site, structured data, loading times, crawl errors. In parallel the first campaigns start and cover demand in the meantime." },
        { title: "Production and authority", desc: "Optimised content, digital PR for authoritative citations, editorial relationships. Only techniques that survive an algorithm update." },
        { title: "Monthly tuning", desc: "Data analysis, landing page tests, refreshing content that's declining, opening new topic clusters once the first ones are consolidated." },
      ],
    },
    cta: {
      heading: "Every day without SEO is a day handed to your competitors.",
      sub: "A free analysis of your current ranking against the competition. In half an hour you'll know where you stand, what's missing and in what order to fix it.",
      btn: "Get the Free SEO Analysis",
    },
  },

  ai: {
    title: "AI Integration & Intelligent Systems",
    subtitle: "Agents, language models and search over company documents, built into the processes you already have. Not pilot projects for their own sake: use cases chosen because the return can be calculated.",
    eyebrow: "AI Agents · LLM · Intelligent Automation",
    kickers: { what: "When It's Worth It", offer: "The Areas", how: "From Assessment to Production" },
    extra: {
      kicker: "When We Say No",
      heading: "Where AI isn't worth it",
      intro: "Half the value of this work is ruling out the wrong cases before spending months on them. These get discarded at the assessment stage.",
      items: [
        { t: "Processes that change with every client", d: "If there's no recurring rule, there's nothing to automate: there's a process to redesign, and that's a different job." },
        { t: "Missing or unreliable data", d: "A model trained on incomplete archives returns answers that are confident and wrong. The data gets fixed first." },
        { t: "Decisions carrying legal liability", d: "Contract approvals, personnel evaluations, medical matters: AI can prepare, not decide." },
        { t: "Volumes that are too low", d: "Below a certain number of repetitions the cost of building and maintaining doesn't pay back. Better said upfront." },
      ],
    },
    whatWeDo: {
      heading: "AI pays off where the process is repetitive and the data already exists.",
      body: [
        "The value doesn't come from adopting a model, but from choosing the right point to insert it. A repetitive task, with clear rules and data already available, is the ideal candidate. A process that changes shape with every client, almost never — and saying so early saves months.",
        "We implement things that then stay in production: assistants that answer recurring requests, systems that make internal documentation searchable, assisted generation of product descriptions. Every use case starts from a measurement of the before, so the after is verifiable.",
      ],
      stats: [
        { value: "2", label: "Weeks to the first useful prototype" },
        { value: "1", label: "One use case at a time, measured" },
        { value: "0", label: "Data sent to models you haven't agreed to" },
      ],
    },
    offer: {
      heading: "Where AI brings a real advantage",
      items: [
        { title: "Bespoke agents", desc: "LangChain, AutoGen, CrewAI. Sequences that search, analyse, draft and hand over to a person when the case falls outside the expected." },
        { title: "Search over internal documents", desc: "Manuals, contracts, specifications, email: the system finds the right passage and cites its source instead of inventing a plausible answer." },
        { title: "Model choice and integration", desc: "OpenAI, Anthropic, Mistral or models hosted by you. The criteria are cost, latency and confidentiality constraints — not the fashion of the month." },
        { title: "AI for e-commerce", desc: "Product descriptions generated and then reviewed, catalogue enrichment, a pre-sales assistant wired to real stock levels." },
        { title: "Conversational assistants", desc: "Lead qualification, first-line support, onboarding. Connected to the CRM, with a handover to a person the moment it's needed." },
        { title: "Predictive models", desc: "Demand and stock forecasting, anomaly detection, signals that arrive before the problem shows up in the accounts." },
      ],
    },
    how: {
      heading: "From assessment to a system in production",
      steps: [
        { title: "Feasibility assessment", desc: "Which data exists and in what state, which processes are candidates and what return is plausible for each. The output is a list ordered by value against effort." },
        { title: "Prototype on the most promising case", desc: "Two weeks for a working version of the highest-impact case. It's measured on your data before committing to the full implementation." },
        { title: "Architecture", desc: "Model choice, data flow, vector store, safety limits and the expected behaviour when the model doesn't know the answer." },
        { title: "Integration into the processes", desc: "Connection to CRM, ERP, e-commerce and databases. The system becomes a step in daily work, not a separate tool someone has to remember to open." },
        { title: "Adaptation to your data", desc: "Tuning on real cases, testing on edge cases, structured collection of feedback to improve over time." },
        { title: "Release and monitoring", desc: "Gradual rollout alongside the manual process. Monitoring of accuracy, response times and cost per request." },
      ],
    },
    cta: {
      heading: "Not every process deserves AI. Some do.",
      sub: "In 45 minutes we go through your processes together and identify the ones worth automating — and the ones that aren't.",
      btn: "Book the AI Session",
    },
  },
}

export const SERVICES_STR = { it, en } satisfies Bundle<typeof it>
