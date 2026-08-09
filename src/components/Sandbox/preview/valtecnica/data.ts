/* ══════════════════════════════════════════════════════════════════════════
   VALTECNICA — Portale Fornitori · dati dimostrativi
   Tutto ciò che segue è inventato. Aziende, persone, partite IVA, importi e
   documenti non esistono: servono a far provare il prodotto, non a
   rappresentare clienti reali. Nessuna chiamata di rete, nessuna persistenza.
══════════════════════════════════════════════════════════════════════════ */

export type RoleId = "cliente" | "agente" | "admin"

export type Role = {
  id: RoleId
  person: string
  label: string
  org: string
  /* voci di navigazione visibili: l'ordine è quello del rail */
  nav: ScreenId[]
  scope: string
}

export type ScreenId =
  | "cruscotto" | "catalogo" | "preventivi" | "ordini" | "fatture"
  | "clienti" | "listini" | "prezzi" | "fornitori"
  | "assistenza" | "documenti"

export const ROLES: Record<RoleId, Role> = {
  admin: {
    id: "admin",
    person: "Elena Ricci",
    label: "Amministratore",
    org: "Valtecnica · Back-office",
    nav: ["cruscotto", "catalogo", "preventivi", "ordini", "fatture",
      "clienti", "listini", "prezzi", "fornitori", "assistenza", "documenti"],
    scope: "azienda",
  },
  agente: {
    id: "agente",
    person: "Marco Bianchi",
    label: "Agente",
    org: "Area Nord-Est",
    nav: ["cruscotto", "catalogo", "preventivi", "ordini", "fatture", "assistenza", "clienti"],
    scope: "portafoglio:nord-est",
  },
  cliente: {
    id: "cliente",
    person: "Giulia Fontana",
    label: "Cliente",
    org: "Idroservice Bergamo S.r.l.",
    nav: ["catalogo", "preventivi", "ordini", "fatture", "assistenza", "documenti"],
    scope: "cliente:IDR-004",
  },
}

export const SCREEN_LABEL: Record<ScreenId, string> = {
  cruscotto: "Cruscotto",
  catalogo: "Catalogo",
  preventivi: "Preventivi",
  ordini: "Ordini",
  fatture: "Fatture",
  assistenza: "Assistenza",
  documenti: "Documenti",
  clienti: "Clienti",
  listini: "Listini",
  prezzi: "Regole di prezzo",
  fornitori: "Fornitori",
}

/* Con undici sezioni la pillola in alto non basta più: servono gruppi, e i
   gruppi hanno bisogno di una colonna. Le voci restano definite in un solo
   posto — il ruolo decide quali vede, il gruppo dove finiscono. */
export type NavGroup = { id: string; label: string; items: ScreenId[] }

export const NAV_GROUPS: NavGroup[] = [
  { id: "operativo",   label: "Operativo",          items: ["cruscotto", "catalogo", "preventivi", "ordini", "fatture"] },
  { id: "commerciale", label: "Commerciale",        items: ["clienti", "listini", "prezzi"] },
  { id: "acquisti",    label: "Approvvigionamento", items: ["fornitori"] },
  { id: "servizio",    label: "Servizio",           items: ["assistenza", "documenti"] },
]

/* ── Clienti ──────────────────────────────────────────────────────────────
   `sconto` è lo sconto base del listino assegnato; il prezzo contratto di
   ogni articolo si deriva da qui, non è un secondo numero da tenere allineato. */
export type Customer = {
  id: string
  name: string
  city: string
  listino: string
  sconto: number
  fido: number
  esposizione: number
  scaduto: number
  agente: string
  termini: string
}

export const CUSTOMERS: Customer[] = [
  { id: "IDR-004", name: "Idroservice Bergamo S.r.l.", city: "Bergamo",  listino: "L-02", sconto: 18, fido: 25000, esposizione: 12600, scaduto: 0,    agente: "Marco Bianchi", termini: "Bonifico 60 gg d.f.f.m." },
  { id: "TCN-011", name: "Tecnoidraulica Vicenza",     city: "Vicenza",  listino: "L-02", sconto: 18, fido: 40000, esposizione: 21400, scaduto: 4180, agente: "Marco Bianchi", termini: "Bonifico 30 gg d.f." },
  { id: "MRC-023", name: "Marchiori Impianti S.p.A.",  city: "Padova",   listino: "L-01", sconto: 26, fido: 90000, esposizione: 48250, scaduto: 0,    agente: "Marco Bianchi", termini: "Ri.Ba. 90 gg" },
  { id: "BSS-007", name: "Bassano Termotecnica",       city: "Bassano",  listino: "L-03", sconto: 11, fido: 15000, esposizione: 9860,  scaduto: 3240, agente: "Marco Bianchi", termini: "Bonifico 30 gg d.f." },
  { id: "FRR-002", name: "Ferrandi Utensili S.r.l.",   city: "Brescia",  listino: "L-01", sconto: 26, fido: 60000, esposizione: 31900, scaduto: 2440, agente: "Sara Conti",    termini: "Ri.Ba. 60 gg" },
  { id: "LGR-019", name: "Lagorio Distribuzione",      city: "Genova",   listino: "L-04", sconto: 32, fido: 120000, esposizione: 74300, scaduto: 0,   agente: "Sara Conti",    termini: "Bonifico 90 gg d.f.f.m." },
]

/** Il portafoglio dell'agente: quattro clienti su sei. Le altre due anagrafiche
    non gli arrivano mai, nemmeno nascoste. */
export const AGENT_PORTFOLIO = ["IDR-004", "TCN-011", "MRC-023", "BSS-007"]
export const CLIENT_SELF = "IDR-004"

export const LISTINI = [
  { code: "L-01", name: "Grandi installatori", sconto: 26, clienti: 2, dal: "01/01/2026" },
  { code: "L-02", name: "Installatori",        sconto: 18, clienti: 2, dal: "01/01/2026" },
  { code: "L-03", name: "Retail tecnico",      sconto: 11, clienti: 1, dal: "01/03/2026" },
  { code: "L-04", name: "Distributori",        sconto: 32, clienti: 1, dal: "01/01/2026" },
  { code: "L-05", name: "Ricambi fuori linea", sconto: 8,  clienti: 0, dal: "01/06/2026" },
]

/* ── Catalogo ───────────────────────────────────────────────────────────── */
export type Category = "Valvolame" | "Raccorderia" | "Pompe" | "Strumentazione" | "Utensili" | "Ricambi"

export const CATEGORIES: Category[] = ["Valvolame", "Raccorderia", "Pompe", "Strumentazione", "Utensili", "Ricambi"]

export type Product = {
  sku: string
  name: string
  category: Category
  um: string
  /* prezzo di listino pubblico, IVA esclusa */
  listino: number
  /* costo d'acquisto: raggiunge SOLO il ruolo admin (vedi visibleProduct) */
  costo: number
  /* chi lo fornisce. Il costo qui sopra è quello dell'offerta migliore fra
     quelle sincronizzate: l'articolo è nostro, l'offerta è sua. */
  fornitore: string
  /* spedito direttamente dal fornitore, senza passare dal nostro magazzino */
  dropship?: boolean
  stock: number
  /* data di riassortimento: ha senso solo se stock = 0 */
  restock?: string
  /* prezzo non a listino: si passa da una richiesta di quotazione */
  suRichiesta?: boolean
  /* famiglia configurabile: materiale, diametro, attacco */
  configurabile?: boolean
  lotto: number
  /* scaglioni quantità: sconto aggiuntivo sul prezzo già scontato */
  scaglioni: { da: number; a: number | null; extra: number }[]
}

const SC_STD = [
  { da: 1, a: 9, extra: 0 },
  { da: 10, a: 49, extra: 4 },
  { da: 50, a: null, extra: 9 },
]

export const PRODUCTS: Product[] = [
  { sku: "VLV-4471-B", fornitore: "ROSSI", name: "Valvola a sfera ottone PN40 DN25 passaggio totale", category: "Valvolame",      um: "pz", listino: 12.40,  costo: 6.85,   stock: 1840, lotto: 5,  configurabile: true, scaglioni: SC_STD },
  { sku: "VLV-4472-B", fornitore: "ROSSI", name: "Valvola a sfera ottone PN40 DN32 passaggio totale", category: "Valvolame",      um: "pz", listino: 18.90,  costo: 10.40,  stock: 620,  lotto: 5,  scaglioni: SC_STD },
  { sku: "VLV-6110-I", fornitore: "EUROTHERM", name: "Valvola di ritegno inox AISI 316 DN50 a clapet",    category: "Valvolame",      um: "pz", listino: 74.50,  costo: 43.20,  stock: 96,   lotto: 1,  scaglioni: SC_STD },
  { sku: "RCC-2208-Z", fornitore: "ROSSI", name: "Raccordo a compressione zincato 3/4\" M-F",         category: "Raccorderia",    um: "pz", listino: 3.15,   costo: 1.62,   stock: 9400, lotto: 25, scaglioni: SC_STD },
  { sku: "RCC-2310-R", fornitore: "ROSSI", name: "Curva 90° rame Ø22 mm a saldare",                   category: "Raccorderia",    um: "pz", listino: 1.85,   costo: 0.94,   stock: 12600, lotto: 50, scaglioni: SC_STD },
  { sku: "RCC-2455-M", fornitore: "IDROPART", dropship: true, name: "Manicotto multistrato Ø26 a pressare",              category: "Raccorderia",    um: "pz", listino: 6.70,   costo: 3.55,   stock: 0, restock: "24/08/2026", lotto: 10, scaglioni: SC_STD },
  { sku: "PMP-8801-C", fornitore: "NORDICA", name: "Circolatore elettronico 25-60 130 mm",              category: "Pompe",          um: "pz", listino: 168.00, costo: 101.50, stock: 74,   lotto: 1,  scaglioni: SC_STD },
  { sku: "PMP-8840-S", fornitore: "NORDICA", dropship: true, name: "Elettropompa sommersa 4\" 0,75 kW monofase",        category: "Pompe",          um: "pz", listino: 412.00, costo: 258.00, stock: 12,   lotto: 1,  suRichiesta: true, scaglioni: SC_STD },
  { sku: "STR-3120-M", fornitore: "EUROTHERM", name: "Manometro radiale Ø63 0-10 bar attacco 1/4\"",      category: "Strumentazione", um: "pz", listino: 9.80,   costo: 4.90,   stock: 430,  lotto: 10, scaglioni: SC_STD },
  { sku: "STR-3350-T", fornitore: "EUROTHERM", name: "Termometro bimetallico Ø80 0-120 °C posteriore",    category: "Strumentazione", um: "pz", listino: 14.20,  costo: 7.35,   stock: 208,  lotto: 5,  scaglioni: SC_STD },
  { sku: "UTN-5502-P", fornitore: "IDROPART", dropship: true, name: "Pinza a pressare idraulica profilo TH 16-32",       category: "Utensili",       um: "pz", listino: 985.00, costo: 640.00, stock: 6,    lotto: 1,  suRichiesta: true, scaglioni: SC_STD },
  { sku: "UTN-5610-C", fornitore: "IDROPART", name: "Cesoia per tubo multistrato fino a Ø40",            category: "Utensili",       um: "pz", listino: 46.30,  costo: 25.10,  stock: 88,   lotto: 1,  scaglioni: SC_STD },
  { sku: "RIC-9001-G", fornitore: "ROSSI", name: "Guarnizione EPDM Ø25 confezione 100 pz",            category: "Ricambi",        um: "cf", listino: 8.40,   costo: 3.90,   stock: 340,  lotto: 1,  scaglioni: SC_STD },
  { sku: "RIC-9044-K", fornitore: "NORDICA", name: "Kit tenute per circolatore serie 8800",             category: "Ricambi",        um: "kit", listino: 27.60, costo: 14.80,  stock: 41,   lotto: 1,  scaglioni: SC_STD },
]

/** Prezzo contratto: listino meno lo sconto del listino assegnato, meno
    l'eventuale scaglione quantità. Un solo posto in cui si calcola. */
export function contractPrice(p: Product, sconto: number, qty = 1): number {
  const sc = p.scaglioni.find(s => qty >= s.da && (s.a === null || qty <= s.a))
  const extra = sc?.extra ?? 0
  return round2(p.listino * (1 - sconto / 100) * (1 - extra / 100))
}

export function scaglionePrice(p: Product, sconto: number, extra: number): number {
  return round2(p.listino * (1 - sconto / 100) * (1 - extra / 100))
}

export function marginPct(p: Product, price: number): number {
  if (price <= 0) return 0
  return Math.round(((price - p.costo) / price) * 1000) / 10
}

/* ── Ordini ─────────────────────────────────────────────────────────────── */
export type OrderState = "bozza" | "approvazione" | "confermato" | "preparazione" | "spedito" | "consegnato" | "rifiutato"

export const ORDER_STATE_LABEL: Record<OrderState, string> = {
  bozza: "Bozza",
  approvazione: "In approvazione",
  confermato: "Confermato",
  preparazione: "In preparazione",
  spedito: "Spedito",
  consegnato: "Consegnato",
  rifiutato: "Rifiutato",
}

export type OrderLine = { sku: string; qty: number; price: number }

export type Order = {
  id: string
  customerId: string
  date: string
  consegna: string
  state: OrderState
  lines: OrderLine[]
  trasporto: number
  ddt?: string
  colli?: number
  peso?: number
  /* vettore e lettera di vettura: la domanda vera del cliente è "dov'è" */
  vettore?: string
  tracking?: string
  fattura?: string
  note?: string
}

export const ORDERS: Order[] = [
  { id: "ORD-8841", customerId: "IDR-004", date: "04/08/2026", consegna: "12/08/2026", state: "approvazione", trasporto: 45, note: "Fido superato: inviato ad approvazione back-office.", lines: [ { sku: "PMP-8801-C", qty: 18, price: 132.10 }, { sku: "VLV-4471-B", qty: 60, price: 9.25 }, { sku: "STR-3120-M", qty: 40, price: 7.71 } ] },
  { id: "ORD-8838", customerId: "IDR-004", date: "29/07/2026", consegna: "05/08/2026", state: "spedito", trasporto: 45, ddt: "DDT 2026/1187", colli: 3, peso: 42, vettore: "BRT", tracking: "0182456739104", fattura: "FT 2026/0231", lines: [ { sku: "RCC-2208-Z", qty: 400, price: 2.35 }, { sku: "RCC-2310-R", qty: 600, price: 1.38 } ] },
  { id: "ORD-8829", customerId: "IDR-004", date: "18/07/2026", consegna: "24/07/2026", state: "consegnato", trasporto: 0, ddt: "DDT 2026/1104", colli: 1, peso: 8, fattura: "FT 2026/0218", lines: [ { sku: "RIC-9044-K", qty: 6, price: 22.63 } ] },
  { id: "ORD-8820", customerId: "IDR-004", date: "09/07/2026", consegna: "16/07/2026", state: "consegnato", trasporto: 45, ddt: "DDT 2026/1041", colli: 2, peso: 27, fattura: "FT 2026/0202", lines: [ { sku: "VLV-6110-I", qty: 12, price: 61.09 }, { sku: "STR-3350-T", qty: 25, price: 11.18 } ] },
  { id: "ORD-8812", customerId: "IDR-004", date: "01/07/2026", consegna: "08/07/2026", state: "bozza", trasporto: 0, lines: [ { sku: "UTN-5610-C", qty: 3, price: 37.97 } ] },

  { id: "ORD-8845", customerId: "TCN-011", date: "06/08/2026", consegna: "14/08/2026", state: "approvazione", trasporto: 45, note: "Cliente con scaduto: verifica contabilità.", lines: [ { sku: "PMP-8840-S", qty: 4, price: 337.84 }, { sku: "VLV-4472-B", qty: 30, price: 14.10 } ] },
  { id: "ORD-8836", customerId: "TCN-011", date: "27/07/2026", consegna: "03/08/2026", state: "confermato", trasporto: 45, lines: [ { sku: "RCC-2455-M", qty: 120, price: 5.00 } ] },
  { id: "ORD-8824", customerId: "TCN-011", date: "13/07/2026", consegna: "21/07/2026", state: "consegnato", trasporto: 0, ddt: "DDT 2026/1062", colli: 4, peso: 61, fattura: "FT 2026/0209", lines: [ { sku: "RCC-2208-Z", qty: 800, price: 2.35 } ] },

  { id: "ORD-8843", customerId: "MRC-023", date: "05/08/2026", consegna: "19/08/2026", state: "confermato", trasporto: 0, lines: [ { sku: "UTN-5502-P", qty: 2, price: 663.31 }, { sku: "PMP-8801-C", qty: 24, price: 113.11 } ] },
  { id: "ORD-8839", customerId: "MRC-023", date: "30/07/2026", consegna: "11/08/2026", state: "preparazione", trasporto: 0, lines: [ { sku: "VLV-6110-I", qty: 40, price: 50.15 } ] },
  { id: "ORD-8831", customerId: "MRC-023", date: "21/07/2026", consegna: "29/07/2026", state: "spedito", trasporto: 0, ddt: "DDT 2026/1128", colli: 9, peso: 154, vettore: "GLS", tracking: "ITA9930451182", fattura: "FT 2026/0224", lines: [ { sku: "RCC-2310-R", qty: 2400, price: 1.25 }, { sku: "RCC-2208-Z", qty: 1200, price: 2.12 } ] },

  { id: "ORD-8844", customerId: "BSS-007", date: "05/08/2026", consegna: "13/08/2026", state: "approvazione", trasporto: 45, note: "Fido superato di € 1.240.", lines: [ { sku: "STR-3120-M", qty: 90, price: 7.94 } ] },
  { id: "ORD-8833", customerId: "BSS-007", date: "23/07/2026", consegna: "31/07/2026", state: "confermato", trasporto: 45, lines: [ { sku: "RIC-9001-G", qty: 30, price: 7.18 } ] },

  { id: "ORD-8846", customerId: "FRR-002", date: "07/08/2026", consegna: "20/08/2026", state: "confermato", trasporto: 0, lines: [ { sku: "UTN-5502-P", qty: 3, price: 663.31 } ] },
]

/* ── Fatture ────────────────────────────────────────────────────────────── */
export type InvoiceState = "pagata" | "da-pagare" | "scaduta"

export const INVOICE_STATE_LABEL: Record<InvoiceState, string> = {
  pagata: "Pagata",
  "da-pagare": "Da pagare",
  scaduta: "Scaduta",
}

export type Invoice = {
  id: string
  customerId: string
  emessa: string
  scadenza: string
  ordine?: string
  imponibile: number
  /* riga a IVA 10%: nel riepilogo IVA compaiono due aliquote */
  imponibile10?: number
  state: InvoiceState
}

export const INVOICES: Invoice[] = [
  { id: "FT 2026/0231", customerId: "IDR-004", emessa: "05/08/2026", scadenza: "31/10/2026", ordine: "ORD-8838", imponibile: 1768.00, state: "da-pagare" },
  { id: "FT 2026/0218", customerId: "IDR-004", emessa: "25/07/2026", scadenza: "30/09/2026", ordine: "ORD-8829", imponibile: 135.78, state: "da-pagare" },
  { id: "FT 2026/0202", customerId: "IDR-004", emessa: "17/07/2026", scadenza: "30/09/2026", ordine: "ORD-8820", imponibile: 1057.58, imponibile10: 45.00, state: "pagata" },
  { id: "FT 2026/0181", customerId: "IDR-004", emessa: "28/06/2026", scadenza: "31/08/2026", imponibile: 2410.00, state: "da-pagare" },

  { id: "FT 2026/0229", customerId: "TCN-011", emessa: "04/08/2026", scadenza: "03/09/2026", ordine: "ORD-8836", imponibile: 600.00, state: "da-pagare" },
  { id: "FT 2026/0209", customerId: "TCN-011", emessa: "22/05/2026", scadenza: "21/06/2026", ordine: "ORD-8824", imponibile: 1880.00, state: "scaduta" },
  { id: "FT 2026/0164", customerId: "TCN-011", emessa: "12/06/2026", scadenza: "12/07/2026", imponibile: 2300.00, state: "scaduta" },

  { id: "FT 2026/0224", customerId: "MRC-023", emessa: "29/07/2026", scadenza: "27/10/2026", ordine: "ORD-8831", imponibile: 5544.00, state: "da-pagare" },
  { id: "FT 2026/0196", customerId: "MRC-023", emessa: "10/07/2026", scadenza: "08/10/2026", imponibile: 8120.00, state: "pagata" },

  { id: "FT 2026/0227", customerId: "BSS-007", emessa: "31/07/2026", scadenza: "30/08/2026", imponibile: 215.40, state: "da-pagare" },
  { id: "FT 2026/0171", customerId: "BSS-007", emessa: "19/04/2026", scadenza: "19/05/2026", imponibile: 3240.00, state: "scaduta" },

  { id: "FT 2026/0188", customerId: "FRR-002", emessa: "02/07/2026", scadenza: "31/08/2026", imponibile: 2440.00, state: "pagata" },
]

/* ── Serie per il cruscotto ───────────────────────────────────────────────
   Quattro periodi precalcolati: cambiare periodo ricalcola davvero i riquadri,
   non li dissolve soltanto. */
export type PeriodId = "oggi" | "7g" | "30g" | "trim"

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "oggi", label: "Oggi" },
  { id: "7g", label: "7 giorni" },
  { id: "30g", label: "30 giorni" },
  { id: "trim", label: "Trimestre" },
]

export type PeriodStats = {
  fatturato: number
  delta: number
  ordini: number
  ticket: number
  margine: number
  scaduto: number
  /* 12 colonne: l'ultima è il periodo corrente */
  serie: number[]
  stati: { state: OrderState; n: number }[]
}

export const STATS: Record<PeriodId, PeriodStats> = {
  oggi: {
    fatturato: 8420, delta: 12.4, ordini: 3, ticket: 2806, margine: 34.1, scaduto: 9860,
    serie: [520, 780, 410, 960, 1180, 640, 890, 1240, 700, 1090, 1420, 8420],
    stati: [{ state: "bozza", n: 1 }, { state: "approvazione", n: 3 }, { state: "confermato", n: 5 }, { state: "spedito", n: 3 }, { state: "consegnato", n: 2 }],
  },
  "7g": {
    fatturato: 41280, delta: 7.8, ordini: 11, ticket: 3753, margine: 33.6, scaduto: 9860,
    serie: [26400, 31200, 28900, 34100, 29800, 37600, 30400, 35900, 32700, 38400, 36100, 41280],
    stati: [{ state: "bozza", n: 1 }, { state: "approvazione", n: 3 }, { state: "confermato", n: 5 }, { state: "spedito", n: 3 }, { state: "consegnato", n: 2 }],
  },
  "30g": {
    fatturato: 164900, delta: -3.2, ordini: 42, ticket: 3926, margine: 32.9, scaduto: 9860,
    serie: [138000, 152000, 141000, 168000, 149000, 172000, 158000, 181000, 163000, 176000, 170300, 164900],
    stati: [{ state: "bozza", n: 4 }, { state: "approvazione", n: 6 }, { state: "confermato", n: 14 }, { state: "spedito", n: 9 }, { state: "consegnato", n: 9 }],
  },
  trim: {
    fatturato: 487600, delta: 5.1, ordini: 128, ticket: 3809, margine: 33.2, scaduto: 9860,
    serie: [398000, 421000, 407000, 445000, 432000, 458000, 441000, 476000, 452000, 481000, 464000, 487600],
    stati: [{ state: "bozza", n: 9 }, { state: "approvazione", n: 11 }, { state: "confermato", n: 41 }, { state: "spedito", n: 28 }, { state: "consegnato", n: 39 }],
  },
}

/** Voci del feed Attività. Vengono consumate in ordine e in modo ciclico:
    nessun testo casuale, nessun importo inventato al volo. */
export const FEED_SEED: { t: string; who: string }[] = [
  { t: "ORD-8846 confermato · Ferrandi Utensili", who: "Elena Ricci" },
  { t: "Incasso registrato € 2.440 su FT 2026/0188", who: "Contabilità" },
  { t: "ORD-8845 inviato ad approvazione", who: "Marco Bianchi" },
  { t: "DDT 2026/1187 emesso · 3 colli", who: "Magazzino" },
  { t: "Listino L-03 aggiornato · +2 articoli", who: "Elena Ricci" },
  { t: "Sollecito inviato · FT 2026/0164", who: "Contabilità" },
  { t: "ORD-8843 confermato · Marchiori Impianti", who: "Elena Ricci" },
  { t: "Giacenza RCC-2455-M azzerata", who: "Magazzino" },
]

/* ── Formattazione italiana ───────────────────────────────────────────────
   Punto per le migliaia, virgola per i decimali, simbolo prima dell'importo. */
function round2(n: number): number { return Math.round(n * 100) / 100 }

/* useGrouping "always": in italiano il CLDR raggruppa solo da cinque cifre,
   quindi 3753 uscirebbe senza punto accanto a 41.280 che ce l'ha. In un
   gestionale le colonne di importi devono incolonnarsi allo stesso modo. */
/* il cast serve perché i tipi di TS dichiarano ancora useGrouping booleano,
   mentre "always" è ES2023 ed è supportato da tutti i browser di destinazione */
const GROUP = { useGrouping: "always" } as unknown as Intl.NumberFormatOptions

export function eur(n: number, decimals = 2): string {
  return "€ " + n.toLocaleString("it-IT", { ...GROUP, minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function num(n: number, decimals = 0): string {
  return n.toLocaleString("it-IT", { ...GROUP, minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function pct(n: number): string {
  const s = n.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return (n > 0 ? "+" : "") + s + " %"
}

/* ── Derivazioni ──────────────────────────────────────────────────────────
   I permessi non sono uno stile: ciò che un ruolo non può vedere non entra
   proprio nei dati che gli passiamo. */

export function customersFor(role: RoleId): Customer[] {
  if (role === "admin") return CUSTOMERS
  if (role === "agente") return CUSTOMERS.filter(c => AGENT_PORTFOLIO.includes(c.id))
  return CUSTOMERS.filter(c => c.id === CLIENT_SELF)
}

export function ordersFor(role: RoleId): Order[] {
  const ids = customersFor(role).map(c => c.id)
  return ORDERS.filter(o => ids.includes(o.customerId))
}

export function invoicesFor(role: RoleId): Invoice[] {
  const ids = customersFor(role).map(c => c.id)
  return INVOICES.filter(i => ids.includes(i.customerId))
}

export function customerById(id: string): Customer {
  return CUSTOMERS.find(c => c.id === id) ?? CUSTOMERS[0]
}

export function productBySku(sku: string): Product {
  return PRODUCTS.find(p => p.sku === sku) ?? PRODUCTS[0]
}

export function orderTotals(o: Order) {
  const imponibile = round2(o.lines.reduce((a, l) => a + l.qty * l.price, 0))
  const trasporto = o.trasporto
  const iva = round2((imponibile + trasporto) * 0.22)
  return { imponibile, trasporto, iva, totale: round2(imponibile + trasporto + iva) }
}

export function invoiceTotals(i: Invoice) {
  const iva22 = round2(i.imponibile * 0.22)
  const iva10 = round2((i.imponibile10 ?? 0) * 0.10)
  return {
    imponibile22: i.imponibile,
    imponibile10: i.imponibile10 ?? 0,
    iva22, iva10,
    totale: round2(i.imponibile + (i.imponibile10 ?? 0) + iva22 + iva10),
  }
}

/** I sette passi del ciclo ordine, nell'ordine in cui il magazzino li tocca. */
export const ORDER_STEPS: { id: string; label: string }[] = [
  { id: "ricevuto", label: "Ricevuto" },
  { id: "approvato", label: "Approvato" },
  { id: "confermato", label: "Confermato" },
  { id: "preparazione", label: "Preparazione" },
  { id: "ddt", label: "DDT emesso" },
  { id: "spedito", label: "Spedito" },
  { id: "consegnato", label: "Consegnato" },
]

export function stepsDone(state: OrderState): number {
  switch (state) {
    case "bozza": return 0
    case "approvazione": return 1
    case "rifiutato": return 1
    case "confermato": return 3
    case "preparazione": return 4
    case "spedito": return 6
    case "consegnato": return 7
  }
}


/* ══════════════════════════════════════════════════════════════════════════
   SCADENZARIO — l'anzianità del credito, come la guarda un ufficio crediti
══════════════════════════════════════════════════════════════════════════ */
export type AgingBucket = { id: string; label: string; from: number; to: number | null }

export const AGING: AgingBucket[] = [
  { id: "corrente", label: "A scadere",   from: -9999, to: 0 },
  { id: "b30",      label: "1 – 30 gg",   from: 1, to: 30 },
  { id: "b60",      label: "31 – 60 gg",  from: 31, to: 60 },
  { id: "oltre",    label: "Oltre 60 gg", from: 61, to: null },
]

/** Il "oggi" della demo è fisso: una data di sistema farebbe invecchiare i
    dati da soli e il giorno dopo il racconto non tornerebbe più. */
export const TODAY = "09/08/2026"

function toDate(it: string): number {
  const [d, m, y] = it.split("/").map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Giorni di ritardo rispetto alla scadenza: negativo se deve ancora scadere. */
export function daysLate(scadenza: string): number {
  return Math.round((toDate(TODAY) - toDate(scadenza)) / 86400000)
}

export function bucketOf(i: Invoice): AgingBucket {
  if (i.state === "pagata") return AGING[0]
  const n = daysLate(i.scadenza)
  return AGING.find(b => n >= b.from && (b.to === null || n <= b.to)) ?? AGING[0]
}

export function agingTotals(invoices: Invoice[]): { bucket: AgingBucket; total: number; n: number }[] {
  return AGING.map(bucket => {
    const rows = invoices.filter(i => i.state !== "pagata" && bucketOf(i).id === bucket.id)
    return { bucket, n: rows.length, total: rows.reduce((a, i) => a + invoiceTotals(i).totale, 0) }
  })
}

/* ══════════════════════════════════════════════════════════════════════════
   ESPORTAZIONE — CSV con punto e virgola, come lo si apre in Italia
══════════════════════════════════════════════════════════════════════════ */
export function toCsv(rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const t = String(v)
    return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
  }
  /* il BOM fa aprire correttamente gli accenti a Excel in italiano */
  return "\uFEFF" + rows.map(r => r.map(esc).join(";")).join("\r\n")
}

export function downloadCsv(name: string, rows: (string | number)[][]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ══════════════════════════════════════════════════════════════════════════
   IMPORTAZIONE RIGHE — il compratore incolla dal proprio gestionale
   Formati accettati per riga: "SKU;qta"  ·  "SKU qta"  ·  "SKU,qta"
══════════════════════════════════════════════════════════════════════════ */
export type ImportRow = { raw: string; sku?: string; qty?: number; error?: string }

export function parseImport(text: string): ImportRow[] {
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(raw => {
    const m = raw.split(/[;,\t ]+/).filter(Boolean)
    if (m.length < 2) return { raw, error: "manca la quantità" }
    const sku = m[0].toUpperCase()
    const qty = parseInt(m[m.length - 1].replace(/[^\d]/g, ""), 10)
    const p = PRODUCTS.find(x => x.sku.toUpperCase() === sku)
    if (!p) return { raw, sku, error: "codice non trovato a catalogo" }
    if (!qty || qty <= 0) return { raw, sku, error: "quantità non valida" }
    if (p.stock === 0) return { raw, sku, qty, error: "articolo esaurito" }
    if (qty % p.lotto !== 0) return { raw, sku, qty, error: `lotto multiplo di ${p.lotto}` }
    return { raw, sku, qty }
  })
}

/* ── Aggregati per cliente: alimentano la scheda anagrafica ─────────────── */
export function customerSummary(id: string, orders: Order[], invoices: Invoice[]) {
  const o = orders.filter(x => x.customerId === id)
  const i = invoices.filter(x => x.customerId === id)
  const fatturato = i.filter(x => x.state === "pagata").reduce((a, x) => a + invoiceTotals(x).totale, 0)
  const aperto = i.filter(x => x.state !== "pagata").reduce((a, x) => a + invoiceTotals(x).totale, 0)
  const scaduto = i.filter(x => x.state === "scaduta").reduce((a, x) => a + invoiceTotals(x).totale, 0)
  return { orders: o, invoices: i, fatturato, aperto, scaduto, nOrdini: o.length }
}


/* ══════════════════════════════════════════════════════════════════════════
   PREVENTIVI (RFQ)
   Non tutto ha un prezzo a listino: sulle voci complesse si tratta. Questo è
   il cuore del B2B, ed è un flusso a sé — richiesta, quotazione, accettazione.
══════════════════════════════════════════════════════════════════════════ */
export type QuoteState = "inviata" | "quotata" | "accettata" | "rifiutata" | "scaduta"

export const QUOTE_STATE_LABEL: Record<QuoteState, string> = {
  inviata: "In attesa di quotazione",
  quotata: "Quotata",
  accettata: "Accettata",
  rifiutata: "Rifiutata",
  scaduta: "Scaduta",
}

export type Quote = {
  id: string
  customerId: string
  sku: string
  qty: number
  note?: string
  date: string
  state: QuoteState
  /* compilati dal back-office in fase di risposta */
  prezzo?: number
  validaAl?: string
  rispostaNote?: string
}

export const QUOTES: Quote[] = [
  { id: "RFQ-0412", customerId: "MRC-023", sku: "UTN-5502-P", qty: 4, date: "05/08/2026", state: "quotata",
    prezzo: 611.00, validaAl: "05/09/2026", note: "Serve la versione con ganasce TH incluse.",
    rispostaNote: "Prezzo valido per ritiro unico. Ganasce TH 16-20-26 incluse." },
  { id: "RFQ-0409", customerId: "IDR-004", sku: "PMP-8840-S", qty: 6, date: "31/07/2026", state: "inviata",
    note: "Quadro di comando incluso? Consegna entro fine mese." },
  { id: "RFQ-0398", customerId: "TCN-011", sku: "UTN-5502-P", qty: 2, date: "14/07/2026", state: "accettata",
    prezzo: 664.00, validaAl: "13/08/2026" },
  { id: "RFQ-0381", customerId: "BSS-007", sku: "PMP-8840-S", qty: 3, date: "22/06/2026", state: "scaduta",
    prezzo: 349.00, validaAl: "22/07/2026" },
]

/* ══════════════════════════════════════════════════════════════════════════
   ASSISTENZA E RECLAMI
   Il rapporto non finisce alla consegna: il reso di un pezzo difettoso è il
   momento in cui il cliente decide se ricomprare.
══════════════════════════════════════════════════════════════════════════ */
export type TicketKind = "reclamo" | "tecnico" | "amministrativo"
export type TicketState = "aperto" | "in-lavorazione" | "risolto"

export const TICKET_KIND_LABEL: Record<TicketKind, string> = {
  reclamo: "Reclamo / reso", tecnico: "Domanda tecnica", amministrativo: "Amministrativo",
}
export const TICKET_STATE_LABEL: Record<TicketState, string> = {
  aperto: "Aperto", "in-lavorazione": "In lavorazione", risolto: "Risolto",
}

export type TicketMsg = { from: "cliente" | "valtecnica"; who: string; when: string; text: string }

export type Ticket = {
  id: string
  customerId: string
  kind: TicketKind
  subject: string
  ordine?: string
  sku?: string
  date: string
  state: TicketState
  thread: TicketMsg[]
}

export const TICKETS: Ticket[] = [
  {
    id: "RMA-2026-041", customerId: "IDR-004", kind: "reclamo", state: "in-lavorazione",
    subject: "Circolatore rumoroso dopo 3 giorni", ordine: "ORD-8838", sku: "PMP-8801-C", date: "06/08/2026",
    thread: [
      { from: "cliente", who: "Giulia Fontana", when: "06/08/2026 09:12", text: "Due dei circolatori consegnati vibrano in modo anomalo a bassa portata. Allego foto della targhetta." },
      { from: "valtecnica", who: "Assistenza tecnica", when: "06/08/2026 14:40", text: "Ricevuto. Numero RMA assegnato. Ritiro programmato per il 12/08 con il vettore che ha effettuato la consegna: nessun costo a suo carico." },
    ],
  },
  {
    id: "RMA-2026-038", customerId: "TCN-011", kind: "tecnico", state: "risolto",
    subject: "Compatibilità raccordo multistrato Ø26", sku: "RCC-2455-M", date: "28/07/2026",
    thread: [
      { from: "cliente", who: "Ufficio acquisti", when: "28/07/2026 11:05", text: "Il manicotto Ø26 è compatibile con tubo multistrato 26x3?" },
      { from: "valtecnica", who: "Assistenza tecnica", when: "28/07/2026 16:22", text: "Sì, profilo TH, spessore parete fino a 3 mm. Scheda tecnica allegata nel Centro documenti." },
    ],
  },
  {
    id: "RMA-2026-035", customerId: "BSS-007", kind: "amministrativo", state: "aperto",
    subject: "Richiesta copia fattura 2026/0171", date: "03/08/2026",
    thread: [
      { from: "cliente", who: "Amministrazione", when: "03/08/2026 08:40", text: "Non troviamo la fattura 2026/0171 in conservazione. Potete reinviarla?" },
    ],
  },
]

/* ══════════════════════════════════════════════════════════════════════════
   CENTRO DOCUMENTI
   Contratti, certificati e schede tecniche: il cliente li cerca sempre e non
   li trova mai. Qui stanno accanto a ciò a cui si riferiscono.
══════════════════════════════════════════════════════════════════════════ */
export type DocKind = "contratto" | "certificato" | "scheda" | "garanzia" | "listino"

export const DOC_KIND_LABEL: Record<DocKind, string> = {
  contratto: "Contratto", certificato: "Certificato CE", scheda: "Scheda tecnica",
  garanzia: "Garanzia", listino: "Listino",
}

export type Doc = {
  id: string
  kind: DocKind
  title: string
  /* a cosa si riferisce: articolo, ordine o cliente */
  sku?: string
  ordine?: string
  customerId?: string
  date: string
  pages: number
}

export const DOCS: Doc[] = [
  { id: "DOC-1042", kind: "contratto",   title: "Condizioni di fornitura 2026", customerId: "IDR-004", date: "12/01/2026", pages: 6 },
  { id: "DOC-1039", kind: "listino",     title: "Listino L-02 · edizione gennaio 2026", customerId: "IDR-004", date: "01/01/2026", pages: 14 },
  { id: "DOC-1101", kind: "certificato", title: "Dichiarazione CE · circolatori serie 8800", sku: "PMP-8801-C", date: "18/03/2026", pages: 2 },
  { id: "DOC-1102", kind: "scheda",      title: "Scheda tecnica · valvola a sfera PN40", sku: "VLV-4471-B", date: "04/02/2026", pages: 3 },
  { id: "DOC-1118", kind: "scheda",      title: "Scheda tecnica · manicotto multistrato Ø26", sku: "RCC-2455-M", date: "22/04/2026", pages: 2 },
  { id: "DOC-1134", kind: "garanzia",    title: "Garanzia 24 mesi · ORD-8838", ordine: "ORD-8838", customerId: "IDR-004", date: "05/08/2026", pages: 1 },
  { id: "DOC-1127", kind: "certificato", title: "Certificato materiali inox AISI 316", sku: "VLV-6110-I", date: "09/05/2026", pages: 4 },
  { id: "DOC-1140", kind: "garanzia",    title: "Garanzia 24 mesi · ORD-8831", ordine: "ORD-8831", customerId: "MRC-023", date: "29/07/2026", pages: 1 },
]

/* ══════════════════════════════════════════════════════════════════════════
   CONFIGURATORE
   Una famiglia di prodotto con varianti: ogni scelta cambia il codice e il
   prezzo. È la differenza fra un catalogo e un catalogo tecnico.
══════════════════════════════════════════════════════════════════════════ */
export type ConfigOption = { id: string; label: string; delta: number; suffix: string }
export type ConfigAxis = { id: string; label: string; hint: string; options: ConfigOption[] }

export const CONFIG_AXES: ConfigAxis[] = [
  {
    id: "materiale", label: "Materiale corpo", hint: "Determina resistenza e certificazioni.",
    options: [
      { id: "ottone", label: "Ottone nichelato", delta: 0, suffix: "B" },
      { id: "inox",   label: "Inox AISI 316",    delta: 41.60, suffix: "I" },
      { id: "bronzo", label: "Bronzo marino",    delta: 22.80, suffix: "Z" },
    ],
  },
  {
    id: "dn", label: "Diametro nominale", hint: "Il passaggio interno, in millimetri.",
    options: [
      { id: "dn20", label: "DN 20", delta: -2.10, suffix: "4470" },
      { id: "dn25", label: "DN 25", delta: 0,     suffix: "4471" },
      { id: "dn32", label: "DN 32", delta: 6.50,  suffix: "4472" },
      { id: "dn50", label: "DN 50", delta: 24.90, suffix: "4474" },
    ],
  },
  {
    id: "attacco", label: "Attacco", hint: "Come si collega all'impianto.",
    options: [
      { id: "ff", label: "Femmina / femmina", delta: 0, suffix: "" },
      { id: "mf", label: "Maschio / femmina", delta: 1.20, suffix: "M" },
      { id: "pr", label: "A pressare",        delta: 4.40, suffix: "P" },
    ],
  },
  {
    id: "leva", label: "Comando", hint: "Manuale o predisposto per attuatore.",
    options: [
      { id: "leva", label: "Leva in alluminio", delta: 0, suffix: "" },
      { id: "farf", label: "Volantino a farfalla", delta: 3.10, suffix: "F" },
      { id: "att",  label: "Predisposto ISO 5211", delta: 12.70, suffix: "A" },
    ],
  },
]

export type Config = Record<string, string>

export const DEFAULT_CONFIG: Config = { materiale: "ottone", dn: "dn25", attacco: "ff", leva: "leva" }

export function configSku(cfg: Config): string {
  const dn = CONFIG_AXES[1].options.find(o => o.id === cfg.dn)!.suffix
  const mat = CONFIG_AXES[0].options.find(o => o.id === cfg.materiale)!.suffix
  const att = CONFIG_AXES[2].options.find(o => o.id === cfg.attacco)!.suffix
  const lev = CONFIG_AXES[3].options.find(o => o.id === cfg.leva)!.suffix
  return `VLV-${dn}-${mat}${att}${lev}`
}

/** Prezzo di listino della variante: base della famiglia più i delta. */
export function configListino(base: number, cfg: Config): number {
  const delta = CONFIG_AXES.reduce((a, ax) => {
    const o = ax.options.find(x => x.id === cfg[ax.id])
    return a + (o?.delta ?? 0)
  }, 0)
  return Math.round((base + delta) * 100) / 100
}

/* ── Derivazioni per ruolo dei nuovi archivi ───────────────────────────── */
export function quotesFor(role: RoleId): Quote[] {
  const ids = customersFor(role).map(c => c.id)
  return QUOTES.filter(q => ids.includes(q.customerId))
}
export function ticketsFor(role: RoleId): Ticket[] {
  const ids = customersFor(role).map(c => c.id)
  return TICKETS.filter(t => ids.includes(t.customerId))
}
export function docsFor(role: RoleId): Doc[] {
  const ids = customersFor(role).map(c => c.id)
  /* i documenti di prodotto sono pubblici, quelli intestati no */
  return DOCS.filter(d => !d.customerId || ids.includes(d.customerId))
}

/* ══════════════════════════════════════════════════════════════════════════
   FORNITORI E SINCRONIZZAZIONE
   Il catalogo non nasce più a mano: quattro fornitori lo alimentano, ognuno
   con il suo formato e il suo ritmo. Qui vivono le connessioni, il diario
   delle corse e la mappatura dei campi — cioè le tre cose che un operatore
   guarda quando un prezzo sembra sbagliato.
══════════════════════════════════════════════════════════════════════════ */

export type Transport = "rest_json" | "feed_xml" | "feed_csv" | "sftp_csv" | "soap_xml"
export type AuthKind = "none" | "api_key" | "basic" | "bearer" | "oauth2_cc" | "ssh_key"
export type SupplierState = "attivo" | "sospeso" | "errore" | "bozza"

export const TRANSPORT_LABEL: Record<Transport, string> = {
  rest_json: "API REST · JSON",
  feed_xml: "Feed XML",
  feed_csv: "Feed CSV",
  sftp_csv: "CSV su SFTP",
  soap_xml: "Web service SOAP",
}

export const AUTH_LABEL: Record<AuthKind, string> = {
  none: "Nessuna",
  api_key: "Chiave in intestazione",
  basic: "Basic",
  bearer: "Token bearer",
  oauth2_cc: "OAuth2 · client credentials",
  ssh_key: "Chiave SSH",
}

export const SUPPLIER_STATE_LABEL: Record<SupplierState, string> = {
  attivo: "Attivo", sospeso: "Sospeso", errore: "In errore", bozza: "Bozza",
}

/** Una riga della mappatura: il nostro campo, il percorso nella risposta del
    fornitore, le trasformazioni applicate in ordine. È DATO, non codice —
    aggiungere un fornitore non è un rilascio. */
export type MapRow = { our: string; their: string; transform?: string; note?: string }

export type Supplier = {
  id: string
  name: string
  country: string
  currency: string
  /* cambio verso l'euro: 1 per chi fattura in euro */
  fx: number
  transport: Transport
  auth: AuthKind
  endpoint: string
  /* modulo dedicato: vuoto quando basta la mappatura dichiarativa */
  adapter?: string
  cron: string
  cronLabel: string
  state: SupplierState
  dropship: boolean
  leadTime: number
  /* sconto di contratto già applicato sul listino che il fornitore pubblica */
  costDiscount: number
  shippingFlat: number
  freeOver: number | null
  minOrder: number
  offers: number
  unmatched: number
  lastRun: string
  lastOk: string
  latencyMs: number
  consecutiveErrors: number
  credHint: string
  credRotated: string
  fieldMap: MapRow[]
}

export const SUPPLIERS: Supplier[] = [
  {
    id: "ROSSI", name: "Rossi Componenti S.p.A.", country: "IT", currency: "EUR", fx: 1,
    transport: "rest_json", auth: "oauth2_cc",
    endpoint: "https://api.rossicomponenti.it/v2/catalog",
    cron: "*/30 * * * *", cronLabel: "Ogni 30 minuti",
    state: "attivo", dropship: false, leadTime: 2,
    costDiscount: 34, shippingFlat: 0, freeOver: null, minOrder: 250,
    offers: 4812, unmatched: 0,
    lastRun: "09/08/2026 09:30", lastOk: "09/08/2026 09:30", latencyMs: 412, consecutiveErrors: 0,
    credHint: "••••7714", credRotated: "02/06/2026",
    fieldMap: [
      { our: "supplierSku", their: "data.products[].code", transform: "trim · upper" },
      { our: "name", their: "data.products[].description" },
      { our: "costGross", their: "data.products[].price.net", transform: "number" },
      { our: "stock", their: "data.products[].availability.qty", transform: "int" },
      { our: "ean", their: "data.products[].gtin" },
      { our: "brand", their: "data.products[].manufacturer.name" },
      { our: "leadTimeDays", their: "data.products[].delivery.days", transform: "int · default:2" },
    ],
  },
  {
    id: "EUROTHERM", name: "EuroTherm Supply GmbH", country: "DE", currency: "EUR", fx: 1,
    transport: "feed_xml", auth: "basic",
    endpoint: "https://feeds.eurotherm-supply.de/partner/valtecnica.xml",
    cron: "0 * * * *", cronLabel: "Ogni ora",
    state: "attivo", dropship: false, leadTime: 5,
    costDiscount: 0, shippingFlat: 12, freeOver: 800, minOrder: 400,
    offers: 2140, unmatched: 18,
    lastRun: "09/08/2026 09:00", lastOk: "09/08/2026 09:00", latencyMs: 2380, consecutiveErrors: 0,
    credHint: "••••2091", credRotated: "14/01/2026",
    fieldMap: [
      { our: "supplierSku", their: "artikel/nr", transform: "trim" },
      { our: "name", their: "artikel/bezeichnung" },
      /* il punto separa le migliaia: leggerlo come decimale sposterebbe il
         costo di tre ordini di grandezza, e in silenzio */
      { our: "costGross", their: "artikel/preis", transform: "comma_decimal", note: "1.234,56 → 1234.56" },
      { our: "stock", their: "artikel/lager", transform: "int" },
      { our: "ean", their: "artikel/ean" },
      { our: "packSize", their: "artikel/vpe", transform: "int · default:1" },
    ],
  },
  {
    id: "IDROPART", name: "IdroPart Ricambi S.r.l.", country: "IT", currency: "EUR", fx: 1,
    transport: "sftp_csv", auth: "ssh_key", adapter: "bespoke:idropart-sftp",
    endpoint: "sftp://sftp.idropart.it/out/listino_valtecnica.csv",
    cron: "15 2 * * *", cronLabel: "Ogni notte alle 02:15",
    state: "errore", dropship: true, leadTime: 3,
    costDiscount: 21, shippingFlat: 0, freeOver: null, minOrder: 0,
    offers: 1268, unmatched: 4,
    lastRun: "09/08/2026 02:15", lastOk: "07/08/2026 02:15", latencyMs: 0, consecutiveErrors: 2,
    credHint: "ed25519 ••••a41f", credRotated: "30/11/2025",
    fieldMap: [
      { our: "supplierSku", their: "CODICE", transform: "trim · strip:ART-" },
      { our: "name", their: "DESCRIZIONE" },
      { our: "costGross", their: "PREZZO_NETTO", transform: "comma_decimal" },
      { our: "stock", their: "GIACENZA", transform: "int" },
      { our: "moq", their: "MULTIPLO", transform: "int · default:1" },
    ],
  },
  {
    id: "NORDICA", name: "Nordica Pumps AB", country: "SE", currency: "SEK", fx: 0.0873,
    transport: "rest_json", auth: "api_key",
    endpoint: "https://api.nordicapumps.se/v1/products",
    cron: "*/15 * * * *", cronLabel: "Ogni 15 minuti",
    state: "attivo", dropship: true, leadTime: 7,
    costDiscount: 12, shippingFlat: 0, freeOver: null, minOrder: 0,
    offers: 986, unmatched: 2,
    lastRun: "09/08/2026 09:45", lastOk: "09/08/2026 09:45", latencyMs: 686, consecutiveErrors: 0,
    credHint: "••••b3d0", credRotated: "21/07/2026",
    fieldMap: [
      { our: "supplierSku", their: "items[].articleNumber", transform: "trim · upper" },
      { our: "name", their: "items[].name" },
      { our: "costGross", their: "items[].netPrice", transform: "number", note: "in SEK, convertito a 0,0873" },
      { our: "currency", their: "items[].currency" },
      { our: "stock", their: "items[].stockBalance", transform: "int" },
      { our: "leadTimeDays", their: "items[].leadTime", transform: "int · default:7" },
    ],
  },
]

export type SyncStatus = "ok" | "parziale" | "errore" | "in_corso"

export const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  ok: "Completata", parziale: "Con avvisi", errore: "Fallita", in_corso: "In corso",
}

export type SyncRun = {
  id: string
  supplierId: string
  trigger: "cron" | "manuale" | "webhook"
  status: SyncStatus
  when: string
  durationMs: number
  read: number
  created: number
  updated: number
  unchanged: number
  skipped: number
  errors: number
  priceChanged: number
  costUp: number
  costDown: number
  wentOos: number
  message?: string
}

export const SYNC_RUNS: SyncRun[] = [
  { id: "RUN-99312", supplierId: "NORDICA",   trigger: "cron", status: "ok",       when: "09/08/2026 09:45", durationMs: 6420,  read: 986,  created: 0,  updated: 31,  unchanged: 955,  skipped: 0,  errors: 0,  priceChanged: 24, costUp: 19, costDown: 12, wentOos: 1 },
  { id: "RUN-99308", supplierId: "ROSSI",     trigger: "cron", status: "ok",       when: "09/08/2026 09:30", durationMs: 18240, read: 4812, created: 4,  updated: 186, unchanged: 4622, skipped: 0,  errors: 0,  priceChanged: 141, costUp: 92, costDown: 49, wentOos: 6 },
  { id: "RUN-99301", supplierId: "EUROTHERM", trigger: "cron", status: "parziale", when: "09/08/2026 09:00", durationMs: 41880, read: 2140, created: 0,  updated: 74,  unchanged: 2024, skipped: 42, errors: 0,  priceChanged: 61, costUp: 44, costDown: 17, wentOos: 0,
    message: "42 righe senza EAN: restano in attesa di abbinamento." },
  { id: "RUN-99288", supplierId: "IDROPART",  trigger: "cron", status: "errore",   when: "09/08/2026 02:15", durationMs: 3110,  read: 0,    created: 0,  updated: 0,   unchanged: 0,    skipped: 0,  errors: 1,  priceChanged: 0, costUp: 0, costDown: 0, wentOos: 0,
    message: "Autenticazione SFTP rifiutata: chiave ed25519 non riconosciuta dal server." },
  { id: "RUN-99276", supplierId: "ROSSI",     trigger: "cron", status: "ok",       when: "09/08/2026 09:00", durationMs: 17960, read: 4812, created: 1,  updated: 122, unchanged: 4689, skipped: 0,  errors: 0,  priceChanged: 88,  costUp: 61, costDown: 27, wentOos: 2 },
  { id: "RUN-99270", supplierId: "NORDICA",   trigger: "manuale", status: "ok",    when: "09/08/2026 08:52", durationMs: 6180,  read: 986,  created: 2,  updated: 44,  unchanged: 940,  skipped: 0,  errors: 0,  priceChanged: 39,  costUp: 30, costDown: 9,  wentOos: 0 },
  { id: "RUN-99244", supplierId: "IDROPART",  trigger: "cron", status: "errore",   when: "08/08/2026 02:15", durationMs: 2980,  read: 0,    created: 0,  updated: 0,   unchanged: 0,    skipped: 0,  errors: 1,  priceChanged: 0, costUp: 0, costDown: 0, wentOos: 0,
    message: "Autenticazione SFTP rifiutata: chiave ed25519 non riconosciuta dal server." },
  { id: "RUN-99201", supplierId: "IDROPART",  trigger: "cron", status: "ok",       when: "07/08/2026 02:15", durationMs: 9440,  read: 1268, created: 7,  updated: 63,  unchanged: 1198, skipped: 0,  errors: 0,  priceChanged: 52,  costUp: 38, costDown: 14, wentOos: 3 },
]

/** Le fasi di una corsa, con la durata che hanno davvero sul campo. Il
    pulsante «Sincronizza ora» le percorre: non è una barra che scorre, è la
    stessa sequenza descritta in `docs/supplier-sync/src/sync.ts`. */
export const SYNC_PHASES: { id: string; label: string; ms: number }[] = [
  { id: "coda",          label: "In coda",                     ms: 420 },
  { id: "connessione",   label: "Connessione e autenticazione", ms: 780 },
  { id: "lettura",       label: "Lettura del catalogo",         ms: 1500 },
  { id: "mappatura",     label: "Mappatura dei campi",          ms: 900 },
  { id: "confronto",     label: "Confronto delle impronte",     ms: 820 },
  { id: "prezzi",        label: "Riprezzatura",                 ms: 940 },
  { id: "pubblicazione", label: "Pubblicazione",                ms: 520 },
]

export function supplierById(id: string): Supplier {
  return SUPPLIERS.find(s => s.id === id) ?? SUPPLIERS[0]
}

export function supplierName(id: string): string {
  return SUPPLIERS.find(s => s.id === id)?.name ?? id
}

export function runsOf(id: string): SyncRun[] {
  return SYNC_RUNS.filter(r => r.supplierId === id)
}

export function productsOf(id: string): Product[] {
  return PRODUCTS.filter(p => p.fornitore === id)
}

/* ══════════════════════════════════════════════════════════════════════════
   REGOLE DI PREZZO
   Otto regole che si sovrappongono davvero: è nella sovrapposizione che si
   capisce se il motore funziona. Vince la più specifica (codice 8 · categoria
   2 · fornitore 1 · fascia di costo 1), a parità la priorità più alta.
══════════════════════════════════════════════════════════════════════════ */
export const PRICE_RULES: import("./pricing").PriceRule[] = [
  { id: "PR-01", name: "Base catalogo", active: true, priority: 10,
    supplierId: null, category: null, skuPattern: null, costMin: null, costMax: null,
    kind: "percent_on_cost", value: 42, minMargin: 18, maxPrice: null, rounding: "cents_90" },

  { id: "PR-02", name: "Rossi · ricarico standard", active: true, priority: 50,
    supplierId: "ROSSI", category: null, skuPattern: null, costMin: null, costMax: null,
    kind: "percent_on_cost", value: 38, minMargin: 20, maxPrice: null, rounding: "cents_90" },

  { id: "PR-03", name: "Pompe · margine obiettivo", active: true, priority: 50,
    supplierId: null, category: "Pompe", skuPattern: null, costMin: null, costMax: null,
    kind: "target_margin", value: 34, minMargin: 25, maxPrice: null, rounding: "integer_up" },

  { id: "PR-04", name: "Nordica · dropship dal nord", active: true, priority: 60,
    supplierId: "NORDICA", category: null, skuPattern: null, costMin: null, costMax: null,
    kind: "target_margin", value: 31, minMargin: 22, maxPrice: null, rounding: "cents_99" },

  { id: "PR-05", name: "Utensili oltre 500 €", active: true, priority: 70,
    supplierId: null, category: "Utensili", skuPattern: null, costMin: 500, costMax: null,
    kind: "percent_on_cost", value: 26, minMargin: 15, maxPrice: null, rounding: "integer_up" },

  { id: "PR-06", name: "Valvolame a codice", active: true, priority: 40,
    supplierId: null, category: null, skuPattern: "VLV-%", costMin: null, costMax: null,
    kind: "percent_on_cost", value: 46, minMargin: 22, maxPrice: null, rounding: "cents_90" },

  { id: "PR-07", name: "Ricambi minuti sotto 5 €", active: true, priority: 55,
    supplierId: null, category: "Ricambi", skuPattern: null, costMin: null, costMax: 5,
    kind: "percent_on_cost", value: 85, minMargin: 30, maxPrice: null, rounding: "cents_50" },

  /* Spenta: resta scritta perché a settembre si riaccende. Cancellarla
     costringerebbe a riscriverla a memoria. */
  { id: "PR-08", name: "Promo estate raccorderia", active: false, priority: 80,
    supplierId: null, category: "Raccorderia", skuPattern: null, costMin: null, costMax: null,
    kind: "percent_on_cost", value: 22, minMargin: 12, maxPrice: null, rounding: "cents_99" },
]
