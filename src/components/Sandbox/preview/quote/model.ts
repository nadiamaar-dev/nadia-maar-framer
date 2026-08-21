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

   I prezzi sono realistici ma dimostrativi: servono a far vedere come si
   muove il preventivo, non a impegnare nessuno.
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
    giorni: 24, prezzo: 21000, fattoreIntegrazione: 1.35,
    tratti: ["Checkout gestito", "App store maturo", "Vincoli sul dominio dati"],
  },
  {
    id: "headless",
    nome: "Headless su misura",
    sommario: "Frontend e dominio dati sono nostri: nessun vincolo di piattaforma, tutto il peso dell'infrastruttura.",
    giorni: 42, prezzo: 38000, fattoreIntegrazione: 0.85,
    tratti: ["Modello dati libero", "Prestazioni sotto controllo", "Richiede presidio tecnico"],
  },
  {
    id: "portale",
    nome: "Portale B2B riservato",
    sommario: "Niente vetrina pubblica: listini per fascia, fido, ordini ricorrenti e agenti.",
    giorni: 34, prezzo: 31000, fattoreIntegrazione: 0.95,
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
    prezzo: 9500, giorni: 12, oreRisparmiate: 6,
    prezzoPer: { shopify: 11500 },
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
    prezzo: 7800, giorni: 9, integra: true, oreRisparmiate: 9,
  },
  {
    id: "listini",
    nome: "Listini per fascia cliente",
    sommario: "Prezzi diversi per cliente o gruppo, scaglioni e valute.",
    prezzo: 6400, giorni: 8, oreRisparmiate: 3,
    esclusoDa: { shopify: "Su Shopify i listini per cliente richiedono B2B nativo, fuori da questo perimetro." },
  },
  {
    id: "configuratore",
    nome: "Configuratore di prodotto",
    sommario: "Varianti dipendenti, regole di compatibilità e prezzo calcolato.",
    prezzo: 12500, giorni: 15, richiede: "pim", oreRisparmiate: 4,
  },
  {
    id: "rivenditori",
    nome: "Area rivenditori",
    sommario: "Ordini per conto terzi, fido, storico e documenti scaricabili.",
    prezzo: 10800, giorni: 13, oreRisparmiate: 7,
    esclusoDa: { shopify: "L'area rivenditori con fido non si regge sulle app di piattaforma." },
  },
  {
    id: "ricerca-ai",
    nome: "Ricerca semantica",
    sommario: "Ricerca che capisce la domanda invece di cercare la parola esatta.",
    prezzo: 8200, giorni: 10, richiede: "pim", oreRisparmiate: 2,
  },
  {
    id: "fatturazione",
    nome: "Fatturazione elettronica",
    sommario: "Emissione verso SdI, conservazione e riconciliazione degli incassi.",
    prezzo: 7200, giorni: 9, integra: true, oreRisparmiate: 8,
  },
  {
    id: "analytics",
    nome: "Cruscotto direzionale",
    sommario: "Margine per canale, rotazione di magazzino, coorti di riacquisto.",
    prezzo: 5900, giorni: 7, integra: true, oreRisparmiate: 4,
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

export const ATTIVITA_INIZIALE: Attivita = {
  ordini: 1400, scontrino: 180, oreManuali: 22, costoOrario: 32, quotaErrori: 0.025,
}

/** Tariffa giornaliera usata per tradurre i giorni in una data di consegna. */
export const GIORNI_PER_SETTIMANA = 5

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
