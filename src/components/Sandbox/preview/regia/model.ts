/* ══════════════════════════════════════════════════════════════════════════
   REGIA — i dati di scena.

   Una torre di controllo si giudica da ciò che le scorre dentro: ordini,
   sincronizzazioni, eccezioni. Qui tutto è finto ma NIENTE è casuale:
   le sequenze sono scritte per intero, così due visite (e due esecuzioni
   del test) vedono la stessa regia. Un flusso che cambia a ogni render
   non si può né raccontare né verificare.
══════════════════════════════════════════════════════════════════════════ */

export type StatoOrdine = "ricevuto" | "sincronizzato" | "in consegna"

export interface Ordine {
  id: string
  cliente: string
  citta: string
  canale: "Negozio" | "B2B" | "Marketplace"
  articoli: number
  corriere: "BRT" | "GLS" | "DHL"
}

/* La lista è più lunga di quanto se ne mostri: la lente scorre e la
   lente si richiude sull'inizio quando arriva in fondo. */
export const ORDINI: Ordine[] = [
  { id: "RG-4207", cliente: "Marelli Casa", citta: "Verona", canale: "B2B", articoli: 24, corriere: "BRT" },
  { id: "RG-4208", cliente: "L. Fontana", citta: "Torino", canale: "Negozio", articoli: 2, corriere: "GLS" },
  { id: "RG-4209", cliente: "Bottega Prisma", citta: "Bari", canale: "Marketplace", articoli: 6, corriere: "DHL" },
  { id: "RG-4210", cliente: "G. Severini", citta: "Milano", canale: "Negozio", articoli: 1, corriere: "GLS" },
  { id: "RG-4211", cliente: "Arreda Più", citta: "Padova", canale: "B2B", articoli: 48, corriere: "BRT" },
  { id: "RG-4212", cliente: "C. Ottaviani", citta: "Roma", canale: "Negozio", articoli: 3, corriere: "DHL" },
  { id: "RG-4213", cliente: "Studio Manin", citta: "Venezia", canale: "B2B", articoli: 12, corriere: "GLS" },
  { id: "RG-4214", cliente: "P. Aliprandi", citta: "Bologna", canale: "Marketplace", articoli: 4, corriere: "BRT" },
  { id: "RG-4215", cliente: "Elettra Forniture", citta: "Firenze", canale: "B2B", articoli: 30, corriere: "DHL" },
  { id: "RG-4216", cliente: "M. Ruggeri", citta: "Napoli", canale: "Negozio", articoli: 2, corriere: "GLS" },
]

export interface Eccezione {
  id: string
  ordine: string
  titolo: string
  dettaglio: string
  /** I passi che la regia esegue quando si preme «Risolvi». */
  rimedio: string[]
}

export const ECCEZIONI: Eccezione[] = [
  {
    id: "ex-1",
    ordine: "RG-4205",
    titolo: "Giacenza insufficiente",
    dettaglio: "Il magazzino di Verona ha 3 pezzi, l'ordine ne chiede 5.",
    rimedio: [
      "Interrogo il magazzino di Bergamo… 14 pezzi disponibili",
      "Divido la spedizione su due colli",
      "Aggiorno la promessa di consegna: +1 giorno",
      "Avviso il cliente via e-mail — nessun ticket aperto",
    ],
  },
  {
    id: "ex-2",
    ordine: "RG-4198",
    titolo: "Indirizzo incompleto",
    dettaglio: "Manca il civico; il corriere ha già rifiutato la presa.",
    rimedio: [
      "Confronto con l'ultimo indirizzo valido del cliente",
      "Civico ricostruito dallo storico: via Ormea 27/B",
      "Rigenero l'etichetta BRT",
      "Riprenoto il ritiro per domani, ore 11–13",
    ],
  },
]

/* ── il nastro di lavorazione: i quattro passi di ogni ordine ── */

export interface Nodo {
  id: string
  nome: string
  descr: string
  /** Le righe di diario che il nodo mostra quando lo si interroga. */
  diario: string[]
  tinta: "blu" | "verde" | "ambra"
}

export const NODI: Nodo[] = [
  {
    id: "ingresso",
    nome: "Ordine in ingresso",
    descr: "Negozio, B2B o marketplace: una porta sola.",
    tinta: "blu",
    diario: [
      "payload validato · schema v3",
      "cliente riconosciuto · id 8842",
      "priorità: standard",
    ],
  },
  {
    id: "stock",
    nome: "Verifica giacenze",
    descr: "Tre magazzini interrogati in parallelo.",
    tinta: "ambra",
    diario: [
      "verona: 12 disponibili",
      "bergamo: 14 disponibili",
      "riservo 5 pezzi · lotto 2209",
    ],
  },
  {
    id: "corriere",
    nome: "Scelta del corriere",
    descr: "Regole per peso, zona e promessa di consegna.",
    tinta: "blu",
    diario: [
      "regola «nord-est entro 24h» → BRT",
      "etichetta generata · 412 ms",
      "ritiro prenotato: domani 9–12",
    ],
  },
  {
    id: "chiusura",
    nome: "Fattura e avvisi",
    descr: "Fattura elettronica, e-mail, registro.",
    tinta: "verde",
    diario: [
      "XML inviato allo SdI",
      "e-mail di conferma spedita",
      "riga scritta nel registro eventi",
    ],
  },
]

/* ── le schede della sezione a linguette ── */

export interface Linguetta {
  id: string
  nome: string
  titolo: string
  testo: string
}

export const LINGUETTE: Linguetta[] = [
  {
    id: "ordini",
    nome: "Ordini",
    titolo: "Ogni canale entra dalla stessa porta.",
    testo: "Negozio, listini B2B e marketplace confluiscono in una coda sola, già normalizzati: un solo formato, una sola verità.",
  },
  {
    id: "magazzino",
    nome: "Magazzino",
    titolo: "La giacenza è una, ovunque la guardi.",
    testo: "Tre magazzini, un contatore: ogni vendita sottrae, ogni reso restituisce, e il sito non promette mai ciò che non c'è.",
  },
  {
    id: "corrieri",
    nome: "Corrieri",
    titolo: "Il corriere lo scelgono le regole, non l'abitudine.",
    testo: "Peso, zona, promessa di consegna: la regia confronta i contratti e prenota il ritiro senza che nessuno apra un portale.",
  },
  {
    id: "regole",
    nome: "Regole",
    titolo: "Le decisioni si scrivono una volta.",
    testo: "«Se il B2B supera i 30 colli, chiedi conferma»: le regole si leggono come frasi e si cambiano senza rilasci.",
  },
]

/* Contenuto tabellare delle linguette: righe finte ma coerenti col resto. */
export const TABELLE: Record<string, { intestazioni: string[]; righe: string[][] }> = {
  ordini: {
    intestazioni: ["Ordine", "Canale", "Stato", "Colli"],
    righe: [
      ["RG-4211", "B2B", "sincronizzato", "4"],
      ["RG-4210", "Negozio", "in consegna", "1"],
      ["RG-4209", "Marketplace", "sincronizzato", "1"],
      ["RG-4208", "Negozio", "in consegna", "1"],
    ],
  },
  magazzino: {
    intestazioni: ["Articolo", "Verona", "Bergamo", "Riservati"],
    righe: [
      ["Lampada Iride", "12", "14", "5"],
      ["Sedia Tempo", "3", "22", "2"],
      ["Tavolo Fondale", "0", "7", "1"],
      ["Mensola Voce", "41", "18", "0"],
    ],
  },
  corrieri: {
    intestazioni: ["Corriere", "Ritiri oggi", "Puntualità", "Zona"],
    righe: [
      ["BRT", "18", "98,2%", "Nord"],
      ["GLS", "11", "97,1%", "Centro"],
      ["DHL", "6", "99,0%", "Estero"],
      ["Poste", "4", "94,8%", "Isole"],
    ],
  },
  regole: {
    intestazioni: ["Regola", "Ambito", "Stato", "Scatti oggi"],
    righe: [
      ["B2B > 30 colli → conferma", "Ordini", "attiva", "2"],
      ["Nord-est 24h → BRT", "Corrieri", "attiva", "9"],
      ["Giacenza < 5 → riordino", "Magazzino", "attiva", "3"],
      ["Estero → DHL Express", "Corrieri", "attiva", "6"],
    ],
  },
}

/* ── le piastrelle dello stack: gli strumenti che la regia tiene insieme ── */

export interface Piastrella {
  nome: string
  /** Profondità di scena: 1 nitida in primo piano, 3 sfocata nel fondo. */
  piano: 1 | 2 | 3
}

export const PIASTRELLE: Piastrella[] = [
  { nome: "Shopify", piano: 1 },
  { nome: "SAP B1", piano: 2 },
  { nome: "BRT", piano: 1 },
  { nome: "Fatture in Cloud", piano: 2 },
  { nome: "GLS", piano: 3 },
  { nome: "Amazon", piano: 2 },
  { nome: "DHL", piano: 3 },
  { nome: "Klaviyo", piano: 1 },
  { nome: "Danea", piano: 3 },
  { nome: "Stripe", piano: 2 },
]

/* ── il terminale: le righe che scorrono nel registro eventi ── */

export const REGISTRO: string[] = [
  "09:41:07  ordine RG-4211 ricevuto dal canale B2B",
  "09:41:07  giacenza riservata · verona −4",
  "09:41:08  regola «nord-est 24h» → BRT",
  "09:41:09  etichetta 660412998 generata",
  "09:41:12  ordine RG-4212 ricevuto dal canale negozio",
  "09:41:13  fattura RG-4207 accettata dallo SdI",
  "09:41:15  webhook consegnato a klaviyo · 200",
  "09:41:18  giacenza «Sedia Tempo» sotto soglia → riordino proposto",
  "09:41:21  ordine RG-4213 ricevuto dal canale B2B",
  "09:41:22  ritiro BRT confermato per le 11:00",
]
