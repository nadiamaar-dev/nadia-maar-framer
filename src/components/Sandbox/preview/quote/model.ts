/* ══════════════════════════════════════════════════════════════════════════
   PREVENTIVO & ROI — il listino e le regole.

   Il cuore della demo non è il calcolo del totale (sommare è facile): sono
   le DIPENDENZE fra le scelte. Una piattaforma cambia il prezzo dei moduli
   che le stanno sopra, alcuni moduli si escludono a vicenda, altri ne
   pretendono un altro come base, e il regime di sincronizzazione esiste
   solo se c'è qualcosa da sincronizzare.

   È esattamente ciò che rende difficile un configuratore vero e che nessun
   foglio di calcolo regge a lungo: le regole vivono qui, dichiarate e
   leggibili, non sparse dentro i componenti.

   I PREZZI. Tarati sul mercato italiano 2026 per uno studio strutturato:
   la tariffa implicita è intorno ai 480 €/giorno, coerente con le agenzie
   di fascia media (300-400 € il freelance, 600-800 € le grandi società di
   consulenza). Gli impegni in giorni sono quelli veri: un impianto Shopify
   Plus con personalizzazioni serie non si chiude in tre settimane-uomo, e
   scriverlo sarebbe il primo modo per perdere credibilità davanti a chi
   quei progetti li ha già comprati. Restano prezzi dimostrativi: servono a
   far vedere come si muove il preventivo, non a impegnare nessuno.
══════════════════════════════════════════════════════════════════════════ */

export type PiattaformaId = "shopify" | "headless" | "portale"
export type ModuloId =
  | "pim" | "magazzino" | "listini" | "configuratore"
  | "rivenditori" | "ricerca-ai" | "fatturazione" | "analytics"
export type RegimeId = "batch" | "webhook" | "streaming"

export interface Piattaforma {
  id: PiattaformaId
  nome: string
  sommario: string
  /** Impegno di base in giorni/uomo. */
  giorni: number
  prezzo: number
  /** Quanto costa integrare, SU questa piattaforma: un ERP su Shopify si
   *  collega da fuori, su headless si parla direttamente col dominio. */
  fattoreIntegrazione: number
  tratti: string[]
}

export const PIATTAFORME: Piattaforma[] = [
  {
    id: "shopify",
    nome: "Shopify Plus",
    sommario: "Il checkout è già risolto e aggiornato da altri: si parte in fretta, si personalizza dentro i binari.",
    giorni: 32, prezzo: 14500, fattoreIntegrazione: 1.35,
    tratti: ["Checkout gestito", "App store maturo", "Vincoli sul dominio dati"],
  },
  {
    id: "headless",
    nome: "Headless su misura",
    sommario: "Frontend e dominio dati sono nostri: nessun vincolo di piattaforma, tutto il peso dell'infrastruttura.",
    giorni: 78, prezzo: 38000, fattoreIntegrazione: 0.85,
    tratti: ["Modello dati libero", "Prestazioni sotto controllo", "Richiede presidio tecnico"],
  },
  {
    id: "portale",
    nome: "Portale B2B riservato",
    sommario: "Niente vetrina pubblica: listini per fascia, fido, ordini ricorrenti e agenti.",
    giorni: 62, prezzo: 29500, fattoreIntegrazione: 0.95,
    tratti: ["Prezzi per cliente", "Fido e scoperto", "Ordini ricorrenti"],
  },
]

export interface Modulo {
  id: ModuloId
  nome: string
  sommario: string
  prezzo: number
  giorni: number
  /** Vero se il modulo scambia dati con sistemi esterni: è ciò che rende
   *  sensato scegliere un regime di sincronizzazione. */
  integra?: boolean
  /** Prezzo diverso su una piattaforma specifica: la stessa funzione non
   *  costa uguale ovunque, e fingere di sì è il primo modo per sbagliare
   *  un preventivo. */
  prezzoPer?: Partial<Record<PiattaformaId, number>>
  /** Non disponibile su queste piattaforme, con la ragione a fianco. */
  esclusoDa?: Partial<Record<PiattaformaId, string>>
  /** Ne pretende un altro come base. */
  richiede?: ModuloId
  /** Ore di lavoro manuale che toglie di mezzo, ogni settimana: è da qui
   *  che nasce il ritorno, non da una percentuale inventata. */
  oreRisparmiate?: number
}

export const MODULI: Modulo[] = [
  {
    id: "pim",
    nome: "PIM · anagrafica prodotti",
    sommario: "Una sola fonte per schede, attributi e traduzioni, con pubblicazione controllata.",
    prezzo: 11500, giorni: 24, oreRisparmiate: 6,
    prezzoPer: { shopify: 13800 },
  },
  {
    id: "magazzino",
    nome: "Sincronizzazione magazzino",
    sommario: "Giacenze allineate col gestionale: niente vendite a scaffale vuoto.",
    /* Niente `prezzoPer` qui, ed è una regola non un'omissione: per un modulo
       che integra, la differenza fra piattaforme la esprime GIÀ
       `fattoreIntegrazione`. Metterla anche nel listino la conterebbe due
       volte — il primo giro di test lo ha beccato: 13.365 € invece di
       10.530 €. Una causa, un posto solo. */
    prezzo: 9800, giorni: 20, integra: true, oreRisparmiate: 9,
  },
  {
    id: "listini",
    nome: "Listini per fascia cliente",
    sommario: "Prezzi diversi per cliente o gruppo, scaglioni e valute.",
    prezzo: 7200, giorni: 15, oreRisparmiate: 3,
    esclusoDa: { shopify: "Su Shopify i listini per cliente richiedono B2B nativo, fuori da questo perimetro." },
  },
  {
    id: "configuratore",
    nome: "Configuratore di prodotto",
    sommario: "Varianti dipendenti, regole di compatibilità e prezzo calcolato.",
    prezzo: 16800, giorni: 35, richiede: "pim", oreRisparmiate: 4,
  },
  {
    id: "rivenditori",
    nome: "Area rivenditori",
    sommario: "Ordini per conto terzi, fido, storico e documenti scaricabili.",
    prezzo: 13500, giorni: 28, oreRisparmiate: 7,
    esclusoDa: { shopify: "L'area rivenditori con fido non si regge sulle app di piattaforma." },
  },
  {
    id: "ricerca-ai",
    nome: "Ricerca semantica",
    sommario: "Ricerca che capisce la domanda invece di cercare la parola esatta.",
    prezzo: 8900, giorni: 18, richiede: "pim", oreRisparmiate: 2,
  },
  {
    id: "fatturazione",
    nome: "Fatturazione elettronica",
    sommario: "Emissione verso SdI, conservazione e riconciliazione degli incassi.",
    prezzo: 7400, giorni: 15, integra: true, oreRisparmiate: 8,
  },
  {
    id: "analytics",
    nome: "Cruscotto direzionale",
    sommario: "Margine per canale, rotazione di magazzino, coorti di riacquisto.",
    prezzo: 6200, giorni: 13, integra: true, oreRisparmiate: 4,
  },
]

export interface Regime {
  id: RegimeId
  nome: string
  sommario: string
  /** Moltiplicatore sul costo dei moduli che integrano. */
  fattore: number
  latenza: string
  /** Quota del disallineamento che questo regime evita davvero. */
  efficacia: number
}

export const REGIMI: Regime[] = [
  {
    id: "batch",
    nome: "Batch notturno",
    sommario: "Un allineamento al giorno, fuori orario. Semplice, robusto, in ritardo di ore.",
    fattore: 1, latenza: "fino a 24 h", efficacia: 0.55,
  },
  {
    id: "webhook",
    nome: "Eventi quasi in tempo reale",
    sommario: "Ogni movimento spinge un evento, con coda, ritentativi e chiave di idempotenza.",
    fattore: 1.28, latenza: "secondi", efficacia: 0.9,
  },
  {
    id: "streaming",
    nome: "Flusso bidirezionale",
    sommario: "Le due parti si scrivono a vicenda con risoluzione dei conflitti. Serve presidio.",
    fattore: 1.55, latenza: "sotto il secondo", efficacia: 0.97,
  },
]

/* ── i numeri dell'attività, per il ritorno ──────────────────────────── */

export interface Attivita {
  /** Ordini al mese. */
  ordini: number
  /** Scontrino medio, euro. */
  scontrino: number
  /** Ore di lavoro manuale alla settimana, oggi. */
  oreManuali: number
  /** Costo orario pieno di chi le fa. */
  costoOrario: number
  /** Quota di ordini persi o rimborsati per disallineamento di magazzino. */
  quotaErrori: number
}

/* Un'azienda che valuta un progetto da decine di migliaia di euro non fa
   600 ordini al mese: i valori di partenza sono quelli di una PMI già
   strutturata. Il costo orario è quello AZIENDALE pieno (RAL + contributi
   + TFR), non lo stipendio netto — chi firma ragiona su quello. */
export const ATTIVITA_INIZIALE: Attivita = {
  ordini: 2000, scontrino: 145, oreManuali: 30, costoOrario: 30, quotaErrori: 0.015,
}

export const GIORNI_LAVORATIVI_SETTIMANA = 5

/** Persone che lavorano in parallelo su un progetto tipico: uno sviluppo
 *  pieno più le quote parziali di design, PM e collaudo. Serve a tradurre
 *  i giorni/uomo in settimane di calendario — dividere per una persona
 *  sola darebbe date di consegna che nessuno rispetta, e che nessun
 *  cliente crederebbe. */
export const PERSONE_TEAM = 2.5

/** Giorni/uomo assorbiti in una settimana di calendario dal team. */
export const GIORNI_PER_SETTIMANA = GIORNI_LAVORATIVI_SETTIMANA * PERSONE_TEAM

/* `useGrouping: true` non è ridondante: in italiano il separatore di
   migliaia parte solo da cinque cifre (8200 resta «8200», 11500 diventa
   «11.500»). È corretto in un testo, ma in una colonna di prezzi
   incolonnati produce un allineamento che sembra un difetto. Qui i numeri
   stanno in tabella, quindi si raggruppa sempre. */
export const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: true,
  }).format(n)

export const numero = (n: number) =>
  new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(n)

/* ══════════════════════════════════════════════════════════════════════════
   IL PIANO — fasi, pagamenti, punti di partenza.

   Un preventivo che dice solo «quanto» è mezzo preventivo: chi firma vuole
   sapere anche QUANDO consegnamo e QUANDO paga. Le due cose stanno qui
   perché derivano dallo stesso impegno in giorni già calcolato, e non
   devono poter divergere da esso.
══════════════════════════════════════════════════════════════════════════ */

export interface Fase {
  id: string
  nome: string
  /** Quota dell'impegno totale che questa fase assorbe. Somma = 1. */
  quota: number
  sommario: string
}

/** Le quattro fasi con cui lavoriamo davvero, nelle proporzioni tipiche.
 *  Non sono uguali fra loro: la costruzione pesa più del doppio della
 *  scoperta, e un piano che le mostrasse identiche mentirebbe sul rischio. */
export const FASI: Fase[] = [
  { id: "discovery", nome: "Discovery", quota: 0.15, sommario: "Requisiti, dati esistenti, vincoli dei sistemi da collegare." },
  { id: "design",    nome: "Design",    quota: 0.22, sommario: "Architettura, modello dati, interfacce dei flussi principali." },
  { id: "build",     nome: "Sviluppo",  quota: 0.45, sommario: "Implementazione, integrazioni, test automatici." },
  { id: "lancio",    nome: "Lancio",    quota: 0.18, sommario: "Migrazione, collaudo in produzione, formazione." },
]

export interface Rata {
  id: string
  nome: string
  quota: number
  quando: string
}

/** Stato avanzamento lavori: si paga contro consegne verificabili, non a
 *  calendario. È la struttura che protegge entrambe le parti. */
export const RATE: Rata[] = [
  { id: "avvio",   nome: "All'avvio",           quota: 0.30, quando: "firma" },
  { id: "sal",     nome: "A metà sviluppo",     quota: 0.40, quando: "demo funzionante" },
  { id: "consegna", nome: "Alla messa in linea", quota: 0.30, quando: "collaudo superato" },
]

export interface Preset {
  id: string
  nome: string
  sommario: string
  piattaforma: PiattaformaId
  moduli: ModuloId[]
  regime: RegimeId | null
}

/** Tre punti di partenza realistici. Servono a chi apre la demo e non sa
 *  da dove cominciare: un clic e il preventivo è già popolato di scelte
 *  coerenti, da lì si toglie e si aggiunge. */
export const PRESET: Preset[] = [
  {
    id: "avvio", nome: "Primo e-commerce",
    sommario: "Vendere online in fretta, con il catalogo in ordine.",
    piattaforma: "shopify", moduli: ["pim"], regime: null,
  },
  {
    id: "crescita", nome: "Scala e integra",
    sommario: "Il gestionale parla col negozio, niente più doppio inserimento.",
    piattaforma: "headless", moduli: ["pim", "magazzino", "analytics"], regime: "webhook",
  },
  {
    id: "b2b", nome: "Rete di rivenditori",
    sommario: "Listini per fascia, fido e ordini ricorrenti.",
    piattaforma: "portale", moduli: ["pim", "listini", "rivenditori", "fatturazione"], regime: "batch",
  },
]

/** Percentuale con una cifra, per etichette compatte. */
export const perc = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "percent", maximumFractionDigits: 0 }).format(n)
