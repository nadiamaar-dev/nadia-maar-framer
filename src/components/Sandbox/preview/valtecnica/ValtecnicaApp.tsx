import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AGENT_PORTFOLIO, CLIENT_SELF, CUSTOMERS, FEED_SEED, ORDERS, PRICE_RULES, PRODUCTS,
  INVOICES, QUOTES, SUPPLIERS, SYNC_PHASES, SYNC_RUNS, TICKETS, ROLES, SCREEN_LABEL,
  contractPrice, customerById, customersFor, docsFor, eur, num, productBySku, supplierById,
  type Doc, type Invoice, type Order, type OrderState, type PeriodId, type Quote,
  type RoleId, type ScreenId, type Supplier, type SyncRun, type Ticket,
} from "./data"
import type { PriceRule } from "./pricing"
import { Cartiglio, Denied, FidoGauge, QtyStep } from "./parts"
import {
  CommandPalette, HelpPanel, Ico, NavSheet, NotificationsMenu, ProfileMenu,
  ScreenIcon, Sidebar, SettingsPanel, buildNotices,
  type NavBadge, type Notice, type Prefs,
} from "./Chrome"
import ScreenFornitori, { NewSupplierModal, SupplierDrawer, type SyncLive } from "./ScreenFornitori"
import ScreenPrezzi from "./ScreenPrezzi"
import ScreenCruscotto from "./ScreenCruscotto"
import ScreenCatalogo from "./ScreenCatalogo"
import ScreenOrdini, { OrderDrawer } from "./ScreenOrdini"
import ScreenFatture, { InvoiceDrawer, ScreenClienti, ScreenListini } from "./ScreenFatture"
import CustomerDrawer from "./CustomerDrawer"
import ImportPanel from "./ImportPanel"
import Configurator from "./Configurator"
import {
  NewRequestModal, QuoteDrawer, ScreenAssistenza, ScreenDocumenti, ScreenPreventivi, TicketDrawer,
} from "./ScreensExtra"
import { downloadDocPdf, downloadStatement } from "./docPdf"

/* ══════════════════════════════════════════════════════════════════════════
   L'APPLICAZIONE
   Ruolo, impersonificazione, carrello e ogni mutazione vivono in un solo
   reducer, così "Ripristina demo" è una riga sola e non resta stato orfano.
══════════════════════════════════════════════════════════════════════════ */

export type Capability =
  | "ruolo" | "prezzi" | "preventivo" | "ordine" | "fattura"
  | "assistenza" | "kpi" | "fornitore" | "regola"

type Drawer = { kind: "order" | "invoice"; id: string } | null

type State = {
  role: RoleId
  screen: ScreenId
  impersonate: string
  period: PeriodId
  orders: Order[]
  invoices: Invoice[]
  quotes: Quote[]
  tickets: Ticket[]
  suppliers: Supplier[]
  runs: SyncRun[]
  rules: PriceRule[]
  cart: Record<string, number>
  drawer: Drawer
  orderFilter: OrderState | "tutti"
  extraSconto: number
  cartOpen: boolean
  cartStep: 1 | 2 | 3
  consegna: string
  touched: Capability[]
  lastChange: number
}

const initial: State = {
  role: "admin",
  screen: "cruscotto",
  impersonate: CLIENT_SELF,
  period: "7g",
  orders: ORDERS,
  invoices: INVOICES,
  quotes: QUOTES,
  tickets: TICKETS,
  suppliers: SUPPLIERS,
  runs: SYNC_RUNS,
  rules: PRICE_RULES,
  cart: {},
  drawer: null,
  orderFilter: "tutti",
  extraSconto: 0,
  cartOpen: false,
  cartStep: 1,
  consegna: "20/08/2026",
  touched: [],
  lastChange: 0,
}

type Action =
  | { t: "role"; v: RoleId }
  | { t: "screen"; v: ScreenId }
  | { t: "impersonate"; v: string }
  | { t: "period"; v: PeriodId }
  | { t: "qty"; sku: string; n: number }
  | { t: "drawer"; v: Drawer }
  | { t: "orderFilter"; v: OrderState | "tutti" }
  | { t: "extra"; v: number }
  | { t: "cartOpen"; v: boolean }
  | { t: "cartStep"; v: 1 | 2 | 3 }
  | { t: "consegna"; v: string }
  | { t: "approve"; id: string }
  | { t: "reject"; id: string }
  | { t: "paid"; id: string }
  | { t: "submit" }
  | { t: "reorder"; order: Order }
  | { t: "quoteRespond"; id: string; prezzo: number }
  | { t: "quoteAccept"; id: string }
  | { t: "newQuote"; sku: string; qty: number; note: string }
  | { t: "ticketReply"; id: string; text: string }
  | { t: "ticketResolve"; id: string }
  | { t: "newTicket"; kind: Ticket["kind"]; subject: string; text: string; ordine?: string }
  | { t: "addMany"; rows: { sku: string; qty: number }[] }
  | { t: "syncDone"; supplierId: string }
  | { t: "addSupplier"; supplier: Supplier }
  | { t: "rule"; id: string; patch: Partial<PriceRule> }
  | { t: "ruleToggle"; id: string }
  | { t: "reset" }

function touch(s: State, c: Capability): Capability[] {
  return s.touched.includes(c) ? s.touched : [...s.touched, c]
}

function reducer(s: State, a: Action): State {
  const stamp = s.lastChange + 1
  switch (a.t) {
    case "role": {
      const nav = ROLES[a.v].nav
      /* cambiando ruolo la schermata corrente può non esistere più */
      const screen = nav.includes(s.screen) ? s.screen : nav[0]
      const imp = a.v === "cliente" ? CLIENT_SELF
        : a.v === "agente" && !AGENT_PORTFOLIO.includes(s.impersonate) ? AGENT_PORTFOLIO[0]
        : s.impersonate
      return { ...s, role: a.v, screen, impersonate: imp, drawer: null, extraSconto: 0, touched: touch(s, "ruolo"), lastChange: stamp }
    }
    case "screen":      return { ...s, screen: a.v, drawer: null }
    case "impersonate": return { ...s, impersonate: a.v, touched: touch(s, "prezzi"), lastChange: stamp }
    case "period":      return { ...s, period: a.v, touched: touch(s, "kpi"), lastChange: stamp }
    case "qty": {
      const cart = { ...s.cart }
      if (a.n <= 0) delete cart[a.sku]; else cart[a.sku] = a.n
      return { ...s, cart, touched: touch(s, "prezzi") }
    }
    case "drawer":
      return { ...s, drawer: a.v, touched: a.v?.kind === "invoice" ? touch(s, "fattura") : s.touched }
    case "orderFilter": return { ...s, orderFilter: a.v }
    case "extra":       return { ...s, extraSconto: a.v, touched: touch(s, "prezzi"), lastChange: stamp }
    case "cartOpen":    return { ...s, cartOpen: a.v, cartStep: a.v ? 1 : s.cartStep }
    case "cartStep":    return { ...s, cartStep: a.v }
    case "consegna":    return { ...s, consegna: a.v }
    case "approve":
      return { ...s, orders: s.orders.map(o => o.id === a.id ? { ...o, state: "confermato", note: undefined } : o), lastChange: stamp }
    case "reject":
      return { ...s, orders: s.orders.map(o => o.id === a.id ? { ...o, state: "rifiutato" } : o), lastChange: stamp }
    case "paid":
      return { ...s, invoices: s.invoices.map(i => i.id === a.id ? { ...i, state: "pagata" } : i), lastChange: stamp }
    case "submit": {
      const cust = customerById(s.impersonate)
      const lines = Object.entries(s.cart).map(([sku, qty]) => ({
        sku, qty, price: contractPrice(productBySku(sku), cust.sconto + (s.role === "agente" ? s.extraSconto : 0), qty),
      }))
      if (!lines.length) return s
      const totale = lines.reduce((x, l) => x + l.qty * l.price, 0) * 1.22
      const over = cust.esposizione + totale > cust.fido
      /* il prossimo numero è il massimo in essere più uno: contare le righe
         non basta, perché sommava di nuovo la base e produceva ORD-17694 */
      const next = s.orders.reduce((max, o) => {
        const v = parseInt(o.id.replace("ORD-", ""), 10)
        return Number.isNaN(v) ? max : Math.max(max, v)
      }, 8846) + 1
      const order: Order = {
        id: `ORD-${next}`,
        customerId: cust.id,
        date: "08/08/2026",
        consegna: s.consegna,
        state: over ? "approvazione" : "confermato",
        lines, trasporto: 45,
        note: over ? `Fido superato di ${eur(cust.esposizione + totale - cust.fido, 0)}: inviato ad approvazione.` : undefined,
      }
      return {
        ...s, orders: [order, ...s.orders], cart: {}, cartOpen: false, cartStep: 1,
        screen: "ordini", orderFilter: "tutti", drawer: { kind: "order", id: order.id },
        touched: touch(s, "ordine"), lastChange: stamp,
      }
    }
    /* Riordinare significa ripartire da righe già decise: il carrello viene
       sostituito, non sommato, altrimenti si mescola con quello in corso. */
    case "reorder": {
      const cart: Record<string, number> = {}
      for (const l of a.order.lines) cart[l.sku] = l.qty
      return { ...s, cart, cartOpen: true, cartStep: 1, drawer: null,
        impersonate: s.role === "cliente" ? s.impersonate : a.order.customerId,
        touched: touch(s, "ordine") }
    }
    case "addMany": {
      const cart = { ...s.cart }
      for (const r of a.rows) cart[r.sku] = (cart[r.sku] ?? 0) + r.qty
      return { ...s, cart, cartOpen: true, cartStep: 1, touched: touch(s, "prezzi") }
    }
    /* Il preventivo è un flusso a due mani: il back-office quota, il cliente
       accetta. Entrambe le mosse restano nello stesso reducer. */
    case "quoteRespond":
      return { ...s, quotes: s.quotes.map(q => q.id === a.id
        ? { ...q, state: "quotata" as const, prezzo: a.prezzo, validaAl: "08/09/2026" } : q),
        touched: touch(s, "preventivo"), lastChange: stamp }
    case "quoteAccept":
      return { ...s, quotes: s.quotes.map(q => q.id === a.id ? { ...q, state: "accettata" as const } : q), lastChange: stamp }
    case "newQuote": {
      const n = s.quotes.reduce((m, q) => Math.max(m, parseInt(q.id.replace("RFQ-", ""), 10) || 0), 412) + 1
      const quote: Quote = {
        id: `RFQ-${String(n).padStart(4, "0")}`,
        customerId: s.role === "cliente" ? CLIENT_SELF : s.impersonate,
        sku: a.sku, qty: a.qty, note: a.note || undefined,
        date: "09/08/2026", state: "inviata",
      }
      return { ...s, quotes: [quote, ...s.quotes], screen: "preventivi", drawer: null, touched: touch(s, "preventivo"), lastChange: stamp }
    }
    case "ticketReply":
      return { ...s, tickets: s.tickets.map(t => t.id === a.id ? { ...t,
        state: t.state === "aperto" ? "in-lavorazione" as const : t.state,
        thread: [...t.thread, {
          from: s.role === "cliente" ? "cliente" as const : "valtecnica" as const,
          who: ROLES[s.role].person, when: "09/08/2026 10:20", text: a.text,
        }] } : t), touched: touch(s, "assistenza"), lastChange: stamp }
    case "ticketResolve":
      return { ...s, tickets: s.tickets.map(t => t.id === a.id ? { ...t, state: "risolto" as const } : t), lastChange: stamp }
    case "newTicket": {
      const n = s.tickets.reduce((m, t) => Math.max(m, parseInt(t.id.split("-")[2], 10) || 0), 41) + 1
      const ticket: Ticket = {
        id: `RMA-2026-${String(n).padStart(3, "0")}`,
        customerId: s.role === "cliente" ? CLIENT_SELF : s.impersonate,
        kind: a.kind, subject: a.subject, ordine: a.ordine, date: "09/08/2026", state: "aperto",
        thread: [{ from: "cliente", who: ROLES[s.role].person, when: "09/08/2026 10:20", text: a.text }],
      }
      return { ...s, tickets: [ticket, ...s.tickets], screen: "assistenza", drawer: null, touched: touch(s, "assistenza"), lastChange: stamp }
    }
    /* La corsa è finita: il diario guadagna una riga vera, con i numeri che
       l'avanzamento ha appena mostrato, e il fornitore torna in salute. Un
       «Sincronizza ora» che non cambia niente nel diario è un pulsante finto. */
    case "syncDone": {
      const sup = s.suppliers.find(x => x.id === a.supplierId)
      if (!sup) return s
      const updated = Math.max(8, Math.round(sup.offers * 0.031))
      const created = sup.state === "errore" ? Math.round(sup.offers * 0.004) : 0
      const priceChanged = Math.round(updated * 0.62)
      const n = s.runs.reduce((m, r) => Math.max(m, parseInt(r.id.replace("RUN-", ""), 10) || 0), 99312) + 1
      const run: SyncRun = {
        id: `RUN-${n}`, supplierId: sup.id, trigger: "manuale", status: "ok",
        when: `${TODAY_TIME}`, durationMs: SYNC_PHASES.reduce((x, p) => x + p.ms, 0),
        read: sup.offers, created, updated, unchanged: sup.offers - updated - created,
        skipped: 0, errors: 0, priceChanged,
        costUp: Math.round(priceChanged * 0.6), costDown: priceChanged - Math.round(priceChanged * 0.6),
        wentOos: 0,
      }
      return {
        ...s,
        runs: [run, ...s.runs],
        suppliers: s.suppliers.map(x => x.id === sup.id ? {
          ...x, state: "attivo" as const, consecutiveErrors: 0,
          lastRun: TODAY_TIME, lastOk: TODAY_TIME,
          offers: x.offers + created, unmatched: Math.max(0, x.unmatched - 2),
        } : x),
        touched: touch(s, "fornitore"), lastChange: stamp,
      }
    }
    /* Un fornitore nuovo entra come BOZZA, non attivo: la connessione è
       provata ma la mappatura dei campi è ancora vuota, e pubblicare righe
       non mappate sporcherebbe il catalogo. */
    case "addSupplier":
      return { ...s, suppliers: [...s.suppliers, a.supplier], touched: touch(s, "fornitore"), lastChange: stamp }
    case "rule":
      return { ...s, rules: s.rules.map(r => r.id === a.id ? { ...r, ...a.patch } : r),
        touched: touch(s, "regola"), lastChange: stamp }
    case "ruleToggle":
      return { ...s, rules: s.rules.map(r => r.id === a.id ? { ...r, active: !r.active } : r),
        touched: touch(s, "regola"), lastChange: stamp }
    case "reset": return { ...initial }
  }
}

/** L'orologio della demo è fermo: una data di sistema farebbe invecchiare i
    dati da soli e il giorno dopo il racconto non tornerebbe più. */
const TODAY_TIME = "09/08/2026 10:20"

const SUBTITLE: Record<ScreenId, string> = {
  cruscotto: "Tieni sotto controllo ordini, margini e incassi.",
  catalogo:  "Prezzi e disponibilità per il cliente selezionato.",
  ordini:    "Tutti i documenti del tuo perimetro.",
  fatture:   "Scadenze, incassi e stato dei pagamenti.",
  preventivi: "Richieste di quotazione sulle voci fuori listino.",
  assistenza: "Resi, domande tecniche e pratiche amministrative.",
  documenti:  "Contratti, certificati e schede tecniche.",
  clienti:   "Anagrafiche, fidi ed esposizione.",
  listini:   "Fasce commerciali e sconti base.",
  prezzi:    "Dal costo d'acquisto al prezzo B2B, regola per regola.",
  fornitori: "Connessioni, ritmo di sincronizzazione e diario delle corse.",
}

/* Fisso, non legato all'ora della macchina: la demo mostra sempre la stessa
   giornata e un saluto che cambia da solo la smentirebbe. */
const greeting = "Buongiorno"

export default function ValtecnicaApp({ onRoute, onCapability, onExit }: {
  onRoute: (path: string) => void
  onCapability: (list: Capability[]) => void
  onExit: () => void
}) {
  const [s, d] = useReducer(reducer, initial)
  const [feedTick, setFeedTick] = useState(0)
  const [paused, setPaused] = useState(false)
  /* pannelli dell'impalcatura: uno solo per volta */
  const [panel, setPanel] = useState<null | "notifiche" | "profilo" | "impostazioni">(null)
  const [overlay, setOverlay] = useState<null | "cerca" | "guida">(null)
  const [readIds, setReadIds] = useState<string[]>([])
  const [customerOpen, setCustomerOpen] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState<string | null>(null)
  const [ticketOpen, setTicketOpen] = useState<string | null>(null)
  const [newForm, setNewForm] = useState<null | "quote" | "ticket">(null)
  const [configSkuOpen, setConfigSkuOpen] = useState<string | null>(null)
  const [supplierOpen, setSupplierOpen] = useState<string | null>(null)
  const [navSheet, setNavSheet] = useState(false)
  const [newSupplier, setNewSupplier] = useState(false)
  /* la corsa in corso: vive fuori dal reducer perché è un'animazione, non un
     dato: quando finisce lascia una riga vera nel diario e poi sparisce */
  const [sync, setSync] = useState<SyncLive>(null)
  const [prefs, setPrefsState] = useState<Prefs>({ density: "comfortable", showMargins: true, liveFeed: true })
  const setPrefs = useCallback((p: Partial<Prefs>) => setPrefsState(v => ({ ...v, ...p })), [])
  /* il gestore di Escape legge da qui: registrato una volta sola */
  const stateRef = useRef({ overlay, panel, drawer: s.drawer, cartOpen: s.cartOpen, importOpen, customerOpen, quoteOpen, ticketOpen, newForm, configSkuOpen, supplierOpen, navSheet, newSupplier })
  stateRef.current = { overlay, panel, drawer: s.drawer, cartOpen: s.cartOpen, importOpen, customerOpen, quoteOpen, ticketOpen, newForm, configSkuOpen, supplierOpen, navSheet, newSupplier }
  const role = ROLES[s.role]

  useEffect(() => { onRoute(`portale.valtecnica.it/${s.screen}`) }, [s.screen, onRoute])
  useEffect(() => { onCapability(s.touched) }, [s.touched, onCapability])

  /* Il feed avanza da solo, ma si ferma con prefers-reduced-motion e con il
     pulsante Pausa: un contenuto che si muove da solo dev'essere fermabile. */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (paused || reduce || !prefs.liveFeed) return
    const t = setInterval(() => setFeedTick(v => v + 1), 7000)
    return () => clearInterval(t)
  }, [paused, prefs.liveFeed])

  /* ── la corsa di sincronizzazione ────────────────────────────────────────
     Percorre le fasi di `sync.ts` con le loro durate. Durante la lettura il
     contatore sale davvero verso il numero di articoli del fornitore: è la
     parte che un utente riconosce come "sta leggendo", non come "sta
     aspettando". Chiuso il giro, il diario riceve una riga e lo stato del
     fornitore cambia — un pulsante che non lascia traccia è finto. */
  /* Le dipendenze sono i due campi, NON l'oggetto: i contatori che salgono
     durante la lettura cambiano l'identità di `sync` a ogni scatto, e con
     l'oggetto in dipendenza l'effetto si rimontava di continuo azzerando il
     timer della fase — la corsa restava per sempre a «Lettura del catalogo». */
  const syncId = sync?.supplierId ?? null
  const syncPhase = sync?.phase ?? -1

  useEffect(() => {
    if (!syncId || syncPhase < 0) return

    if (syncPhase >= SYNC_PHASES.length) {
      d({ t: "syncDone", supplierId: syncId })
      setSync(null)
      return
    }

    const sup = supplierById(syncId)
    const ph = SYNC_PHASES[syncPhase]
    const timers: number[] = []

    if (ph.id === "lettura") {
      const steps = 12
      for (let k = 1; k <= steps; k++) {
        timers.push(window.setTimeout(
          () => setSync(v => v && { ...v, read: Math.round(sup.offers * (k / steps)) }),
          (ph.ms / steps) * k))
      }
    }
    if (ph.id === "confronto") {
      timers.push(window.setTimeout(
        () => setSync(v => v && { ...v, updated: Math.max(8, Math.round(sup.offers * 0.031)) }),
        ph.ms * 0.6))
    }

    timers.push(window.setTimeout(() => setSync(v => v && { ...v, phase: v.phase + 1 }), ph.ms))
    return () => timers.forEach(clearTimeout)
  }, [syncId, syncPhase])

  const startSync = useCallback((id: string) => {
    setSync(v => v ?? { supplierId: id, phase: 0, read: 0, updated: 0 })
  }, [])

  const feed = useMemo(() => {
    const out: { t: string; who: string; ago: number }[] = []
    for (let i = 0; i < 5; i++) {
      const e = FEED_SEED[(feedTick + i) % FEED_SEED.length]
      out.push({ ...e, ago: i === 0 ? 0 : i * 7 + (feedTick % 3) })
    }
    return out
  }, [feedTick])

  const customer = customerById(s.role === "cliente" ? CLIENT_SELF : s.impersonate)
  const myOrders = useMemo(() => {
    const ids = customersFor(s.role).map(c => c.id)
    return s.orders.filter(o => ids.includes(o.customerId))
  }, [s.orders, s.role])
  const myInvoices = useMemo(() => {
    const ids = customersFor(s.role).map(c => c.id)
    return s.invoices.filter(i => ids.includes(i.customerId))
  }, [s.invoices, s.role])

  const myQuotes = useMemo(() => {
    const ids = customersFor(s.role).map(c => c.id)
    return s.quotes.filter(q => ids.includes(q.customerId))
  }, [s.quotes, s.role])
  const myTickets = useMemo(() => {
    const ids = customersFor(s.role).map(c => c.id)
    return s.tickets.filter(t => ids.includes(t.customerId))
  }, [s.tickets, s.role])
  const myDocs = useMemo(() => docsFor(s.role), [s.role])

  const cartLines = Object.entries(s.cart)
  const cartTotal = cartLines.reduce((a, [sku, q]) =>
    a + q * contractPrice(productBySku(sku), customer.sconto + (s.role === "agente" ? s.extraSconto : 0), q), 0)
  const cartIva = cartTotal * 0.22
  const approvals = myOrders.filter(o => o.state === "approvazione").length

  const topClients = useMemo(() => customersFor(s.role)
    .map(c => ({ name: c.name, value: c.esposizione }))
    .sort((a, b) => b.value - a.value).slice(0, 5), [s.role])

  const openInvoiceById = useCallback((id: string) => {
    d({ t: "screen", v: "fatture" }); d({ t: "drawer", v: { kind: "invoice", id } })
  }, [])
  const openOrderById = useCallback((id: string) => {
    d({ t: "screen", v: "ordini" }); d({ t: "drawer", v: { kind: "order", id } })
  }, [])

  /* Le notifiche non sono un elenco finto: nascono dallo stato corrente. */
  const notices = useMemo(() => buildNotices(myOrders, myInvoices, s.role), [myOrders, myInvoices, s.role])
  const unread = notices.filter(n => !readIds.includes(n.id)).length

  const goTo = useCallback((g: { screen: ScreenId; drawer?: { kind: "order" | "invoice"; id: string } }) => {
    d({ t: "screen", v: g.screen })
    if (g.drawer) d({ t: "drawer", v: g.drawer })
    setPanel(null); setOverlay(null); setNavSheet(false)
  }, [])

  /* I contrassegni della colonna: numeri che qualcuno deve guardare, non
     decorazione. Il pallino rosso su Fornitori significa costi fermi. */
  const badges = useMemo<Partial<Record<ScreenId, NavBadge>>>(() => ({
    ordini: approvals ? { n: approvals } : undefined,
    preventivi: (() => {
      const n = myQuotes.filter(q => s.role === "cliente" ? q.state === "quotata" : q.state === "inviata").length
      return n ? { n } : undefined
    })(),
    assistenza: (() => {
      const n = myTickets.filter(t => t.state !== "risolto").length
      return n ? { n } : undefined
    })(),
    fornitori: s.suppliers.some(x => x.state === "errore") ? { alert: true } : undefined,
  }), [approvals, myQuotes, myTickets, s.role, s.suppliers])

  /* ⌘K apre la ricerca; Escape chiude UN livello per volta.
     Senza questa gerarchia il tasto arrivava alla finestra dell'anteprima e
     chiudeva tutto: da un ordine aperto si finiva fuori dalla demo. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); e.stopPropagation()
        setOverlay(o => (o === "cerca" ? null : "cerca"))
        return
      }
      if (e.key !== "Escape") return
      const st = stateRef.current
      if (st.overlay) { e.stopPropagation(); setOverlay(null); return }
      if (st.panel) { e.stopPropagation(); setPanel(null); return }
      if (st.newForm) { e.stopPropagation(); setNewForm(null); return }
      if (st.configSkuOpen) { e.stopPropagation(); setConfigSkuOpen(null); return }
      if (st.importOpen) { e.stopPropagation(); setImportOpen(false); return }
      if (st.cartOpen) { e.stopPropagation(); d({ t: "cartOpen", v: false }); return }
      if (st.newSupplier) { e.stopPropagation(); setNewSupplier(false); return }
      if (st.navSheet) { e.stopPropagation(); setNavSheet(false); return }
      if (st.customerOpen) { e.stopPropagation(); setCustomerOpen(null); return }
      if (st.supplierOpen) { e.stopPropagation(); setSupplierOpen(null); return }
      if (st.quoteOpen) { e.stopPropagation(); setQuoteOpen(null); return }
      if (st.ticketOpen) { e.stopPropagation(); setTicketOpen(null); return }
      if (st.drawer) { e.stopPropagation(); d({ t: "drawer", v: null }); return }
      /* nessun livello aperto: l'evento prosegue e chiude l'anteprima */
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [])

  const drawerOrder = s.drawer?.kind === "order" ? s.orders.find(o => o.id === s.drawer!.id) : undefined
  const drawerInvoice = s.drawer?.kind === "invoice" ? s.invoices.find(i => i.id === s.drawer!.id) : undefined

  return (
    <div className="vt-app" data-density={prefs.density}>
      {/* ── la colonna: TUTTE le destinazioni, raggruppate ────────────────── */}
      <Sidebar
        nav={role.nav} screen={s.screen} badges={badges}
        onGo={id => d({ t: "screen", v: id })}
        onSettings={() => setPanel(p => (p === "impostazioni" ? null : "impostazioni"))}
        onHelp={() => setOverlay("guida")}
        settingsOpen={panel === "impostazioni"}
        settingsSlot={
          <AnimatePresence>
            {panel === "impostazioni" && (
              <SettingsPanel prefs={prefs} setPrefs={setPrefs} role={s.role} onClose={() => setPanel(null)} rail />
            )}
          </AnimatePresence>
        }
      />

      {/* ── colonna principale ───────────────────────────────────────────── */}
      <div className="vt-main" style={{ position: "relative" }}>
        <div className="vt-work">
        {/* La barra porta STRUMENTI, mai destinazioni: quelle stanno tutte
            nella colonna, e una volta sola. Il titolo qui evita di ripetere
            l'intestazione grande su ogni schermata. */}
        <div className="vt-topbar">
          <button type="button" className="vt-icon-btn vt-menu-btn" aria-label="Tutte le sezioni"
            aria-expanded={navSheet} onClick={() => setNavSheet(true)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M3 5h12M3 9h12M3 13h12" />
            </svg>
          </button>

          <span className="vt-topbar-title">
            <strong>{SCREEN_LABEL[s.screen]}</strong>
            <span>{SUBTITLE[s.screen]}</span>
          </span>

          <div style={{ flex: 1 }} />

          <div className="vt-tools">
            <button type="button" className="vt-search-btn" onClick={() => setOverlay("cerca")} aria-label="Cerca">
              <Ico n="search" size={16} />
              <span className="vt-search-label">Cerca</span>
              <span className="vt-kbd">⌘K</span>
            </button>

            {cartLines.length > 0 && (
              <button type="button" className="vt-btn vt-btn-primary vt-btn-sm" onClick={() => d({ t: "cartOpen", v: true })}>
                Carrello · {cartLines.length}
              </button>
            )}

            <span style={{ position: "relative" }}>
              <button type="button" className="vt-tool-btn" aria-label={`Notifiche${unread ? `, ${unread} non lette` : ""}`}
                aria-expanded={panel === "notifiche"}
                onClick={() => setPanel(p => (p === "notifiche" ? null : "notifiche"))}>
                <Ico n="bell" />
                {unread > 0 && <span className="vt-badge">{unread}</span>}
              </button>
              <AnimatePresence>
                {panel === "notifiche" && (
                  <NotificationsMenu
                    notices={notices} read={readIds}
                    onRead={id => setReadIds(r => (r.includes(id) ? r : [...r, id]))}
                    onReadAll={() => setReadIds(notices.map(n => n.id))}
                    onGo={(n: Notice) => goTo(n.go)}
                    onClose={() => setPanel(null)}
                  />
                )}
              </AnimatePresence>
            </span>

            <span style={{ position: "relative" }}>
              <button type="button" className="vt-profile" aria-label="Profilo e ruolo"
                aria-expanded={panel === "profilo"}
                onClick={() => setPanel(p => (p === "profilo" ? null : "profilo"))}>
                <span className="vt-avatar" style={{ width: 36, height: 36 }}>
                  {role.person.split(" ").map(w => w[0]).join("")}
                </span>
                <span style={{ minWidth: 0, textAlign: "left" }} className="vt-profile-text">
                  <span className="vt-profile-name" style={{ display: "block" }}>{role.person}</span>
                  <span className="vt-profile-mail" style={{ display: "block" }}>{role.label}</span>
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
                  style={{ color: "var(--vt-ink-faint)", flexShrink: 0 }}>
                  <path d="M3 4.5L6 7.5L9 4.5" />
                </svg>
              </button>
              <AnimatePresence>
                {panel === "profilo" && (
                  <ProfileMenu
                    role={s.role}
                    onRole={r => d({ t: "role", v: r })}
                    onReset={() => d({ t: "reset" })}
                    onExit={onExit}
                    onClose={() => setPanel(null)}
                  />
                )}
              </AnimatePresence>
            </span>

          </div>
        </div>

        {/* ── comandi di contesto: il titolo sta in alto, qui restano solo le
               leve che cambiano ciò che si sta guardando ─────────────────── */}
          <div className="vt-page-head">
            {s.screen === "cruscotto" ? (
              <div style={{ minWidth: 0 }}>
                <h2 className="vt-display">{greeting}, {role.person.split(" ")[0]}</h2>
                <p className="vt-label" style={{ marginTop: 6 }}>{role.org}</p>
              </div>
            ) : <span />}

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {s.role !== "cliente" && (s.screen === "catalogo" || s.screen === "cruscotto") && (
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="vt-label" style={{ whiteSpace: "nowrap" }}>Operi come</span>
                  <select className="vt-select" style={{ width: 210 }}
                    value={s.impersonate} onChange={e => d({ t: "impersonate", v: e.target.value })}>
                    {customersFor(s.role).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              )}
              {s.screen !== "fornitori" && s.screen !== "prezzi" && (
                <button type="button" className="vt-btn vt-btn-primary"
                  onClick={() => d({ t: "screen", v: "catalogo" })}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                    <path d="M8 3.5v9M3.5 8h9" />
                  </svg>
                  Nuovo ordine
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${s.screen}-${s.role}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
            >
              {s.screen === "cruscotto" && (
                <ScreenCruscotto
                  role={s.role} period={s.period} setPeriod={v => d({ t: "period", v })}
                  feed={feed} paused={paused} togglePause={() => setPaused(p => !p)}
                  recent={myOrders.slice(0, 5)}
                  onOpenOrder={id => d({ t: "drawer", v: { kind: "order", id } })}
                  approvals={approvals}
                  onOpenApprovals={() => { d({ t: "screen", v: "ordini" }); d({ t: "orderFilter", v: "approvazione" }) }}
                  onPickState={st => { d({ t: "screen", v: "ordini" }); d({ t: "orderFilter", v: st }) }}
                  self={customerById(CLIENT_SELF)} topClients={topClients}
                />
              )}
              {s.screen === "catalogo" && (
                <ScreenCatalogo
                  role={s.role} customer={customer}
                  cart={s.cart} setQty={(sku, n) => d({ t: "qty", sku, n })}
                  onAdd={sku => d({ t: "qty", sku, n: Math.max(s.cart[sku] ?? 0, productBySku(sku).lotto) })}
                  extraSconto={s.extraSconto} setExtraSconto={v => d({ t: "extra", v })}
                  showMargins={prefs.showMargins}
                  onImport={() => setImportOpen(true)}
                  onQuote={() => setNewForm("quote")}
                  onConfigure={sku => setConfigSkuOpen(sku)}
                />
              )}
              {s.screen === "ordini" && (
                <ScreenOrdini
                  orders={myOrders} role={s.role}
                  filter={s.orderFilter} setFilter={v => d({ t: "orderFilter", v })}
                  onOpen={id => d({ t: "drawer", v: { kind: "order", id } })}
                />
              )}
              {s.screen === "fatture" && (
                <ScreenFatture
                  invoices={myInvoices} role={s.role}
                  onOpen={id => d({ t: "drawer", v: { kind: "invoice", id } })}
                  onStatement={() => { void downloadStatement(
                    s.role === "cliente" ? CLIENT_SELF : s.impersonate, s.invoices) }}
                />
              )}
              {s.screen === "preventivi" && (
                <ScreenPreventivi quotes={myQuotes} role={s.role}
                  onOpen={setQuoteOpen} onNew={() => setNewForm("quote")} />
              )}
              {s.screen === "assistenza" && (
                <ScreenAssistenza tickets={myTickets} role={s.role}
                  onOpen={setTicketOpen} onNew={() => setNewForm("ticket")} />
              )}
              {s.screen === "documenti" && (
                <ScreenDocumenti docs={myDocs} onDownload={(d: Doc) => { void downloadDocPdf(d) }} />
              )}
              {s.screen === "clienti" && <ScreenClienti customers={customersFor(s.role)} onOpen={setCustomerOpen} />}
              {s.screen === "listini" && <ScreenListini />}
              {s.screen === "fornitori" && (
                <ScreenFornitori
                  suppliers={s.suppliers} runs={s.runs} live={sync}
                  onOpen={setSupplierOpen} onSync={startSync}
                  onNew={() => setNewSupplier(true)}
                />
              )}
              {s.screen === "prezzi" && (
                <ScreenPrezzi
                  rules={s.rules}
                  onRule={(id, patch) => d({ t: "rule", id, patch })}
                  onToggle={id => d({ t: "ruleToggle", id })}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── barra inferiore del telefono: quattro destinazioni piu «Altro»,
               che apre lo stesso elenco raggruppato della colonna ───────── */}
        <nav className="vt-tabbar" aria-label="Sezioni">
          {role.nav.slice(0, 4).map(id => (
            <button key={id} type="button" aria-current={s.screen === id ? "page" : undefined}
              onClick={() => d({ t: "screen", v: id })}>
              <ScreenIcon id={id} /><span>{SCREEN_LABEL[id]}</span>
            </button>
          ))}
          {role.nav.length > 4 && (
            <button type="button" aria-label="Tutte le sezioni" aria-expanded={navSheet}
              aria-current={role.nav.slice(4).includes(s.screen) ? "page" : undefined}
              onClick={() => setNavSheet(true)}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                <path d="M3 5h12M3 9h12M3 13h12" />
              </svg>
              <span>Altro</span>
            </button>
          )}
        </nav>

        <AnimatePresence>
          {navSheet && (
            <NavSheet
              nav={role.nav} screen={s.screen} badges={badges}
              onGo={id => d({ t: "screen", v: id })}
              onHelp={() => setOverlay("guida")}
              onClose={() => setNavSheet(false)}
              onSettings={() => setPanel(p => (p === "impostazioni" ? null : "impostazioni"))}
              settingsOpen={panel === "impostazioni"}
              settingsSlot={
                <AnimatePresence>
                  {panel === "impostazioni" && (
                    <SettingsPanel prefs={prefs} setPrefs={setPrefs} role={s.role} onClose={() => setPanel(null)} rail />
                  )}
                </AnimatePresence>
              }
            />
          )}
        </AnimatePresence>

        {/* ── ricerca globale e guida ──────────────────────────────────────── */}
        <AnimatePresence>
          {overlay === "cerca" && (
            <CommandPalette
              orders={myOrders} invoices={myInvoices} role={s.role}
              onGo={goTo} onClose={() => setOverlay(null)}
            />
          )}
          {overlay === "guida" && <HelpPanel onClose={() => setOverlay(null)} />}
        </AnimatePresence>

        {/* ── cassetti ─────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {drawerOrder && (
            <OrderDrawer
              key={drawerOrder.id} order={drawerOrder} role={s.role}
              onClose={() => d({ t: "drawer", v: null })}
              onApprove={id => d({ t: "approve", id })}
              onReject={id => d({ t: "reject", id })}
              onOpenInvoice={openInvoiceById}
              onReorder={o => d({ t: "reorder", order: o })}
            />
          )}
          {drawerInvoice && (
            <InvoiceDrawer
              key={drawerInvoice.id} invoice={drawerInvoice} role={s.role}
              onClose={() => d({ t: "drawer", v: null })}
              onPaid={id => d({ t: "paid", id })}
              onSollecito={() => {}}
              onOpenOrder={openOrderById}
            />
          )}
        </AnimatePresence>

        {/* ── configuratore ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {configSkuOpen && (
            <Configurator
              product={productBySku(configSkuOpen)}
              sconto={customer.sconto + (s.role === "agente" ? s.extraSconto : 0)}
              onAdd={(sku, qty) => {
                /* la variante entra nel carrello con il proprio codice: il
                   prezzo lo ricalcola il carrello dalla famiglia di partenza */
                d({ t: "qty", sku: configSkuOpen, n: qty })
                d({ t: "cartOpen", v: true })
              }}
              onClose={() => setConfigSkuOpen(null)}
            />
          )}
        </AnimatePresence>

        {/* ── nuova richiesta ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {newForm && (
            <NewRequestModal
              mode={newForm} orders={myOrders}
              onQuote={(sku, qty, note) => d({ t: "newQuote", sku, qty, note })}
              onTicket={(kind, subject, text, ordine) => d({ t: "newTicket", kind, subject, text, ordine })}
              onClose={() => setNewForm(null)}
            />
          )}
        </AnimatePresence>

        {/* ── preventivo e pratica ─────────────────────────────────────────── */}
        <AnimatePresence>
          {quoteOpen && s.quotes.find(q => q.id === quoteOpen) && (
            <QuoteDrawer
              key={quoteOpen} quote={s.quotes.find(q => q.id === quoteOpen)!} role={s.role}
              onClose={() => setQuoteOpen(null)}
              onRespond={(id, prezzo) => d({ t: "quoteRespond", id, prezzo })}
              onAccept={id => d({ t: "quoteAccept", id })}
              onToCart={q => { d({ t: "qty", sku: q.sku, n: q.qty }); d({ t: "cartOpen", v: true }); setQuoteOpen(null) }}
            />
          )}
          {ticketOpen && s.tickets.find(t => t.id === ticketOpen) && (
            <TicketDrawer
              key={ticketOpen} ticket={s.tickets.find(t => t.id === ticketOpen)!} role={s.role}
              onClose={() => setTicketOpen(null)}
              onReply={(id, text) => d({ t: "ticketReply", id, text })}
              onResolve={id => d({ t: "ticketResolve", id })}
            />
          )}
        </AnimatePresence>

        {/* ── scheda cliente ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {customerOpen && (
            <CustomerDrawer
              key={customerOpen}
              customer={customerById(customerOpen)}
              orders={s.orders} invoices={s.invoices} role={s.role}
              onClose={() => setCustomerOpen(null)}
              onOpenOrder={id => { setCustomerOpen(null); openOrderById(id) }}
              onOpenInvoice={id => { setCustomerOpen(null); openInvoiceById(id) }}
            />
          )}
        </AnimatePresence>

        {/* ── nuovo fornitore ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {newSupplier && (
            <NewSupplierModal
              onSave={supplier => d({ t: "addSupplier", supplier })}
              onClose={() => setNewSupplier(false)}
            />
          )}
        </AnimatePresence>

        {/* ── scheda del fornitore ─────────────────────────────────────────── */}
        <AnimatePresence>
          {supplierOpen && (
            <SupplierDrawer
              key={supplierOpen}
              supplier={s.suppliers.find(x => x.id === supplierOpen) ?? s.suppliers[0]}
              runs={s.runs.filter(r => r.supplierId === supplierOpen)}
              live={sync} onSync={startSync}
              onClose={() => setSupplierOpen(null)}
            />
          )}
        </AnimatePresence>

        {/* ── importazione righe ───────────────────────────────────────────── */}
        <AnimatePresence>
          {importOpen && (
            <ImportPanel
              sconto={customer.sconto + (s.role === "agente" ? s.extraSconto : 0)}
              onConfirm={rows => d({ t: "addMany", rows })}
              onClose={() => setImportOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ── carrello in tre passi ────────────────────────────────────────── */}
        <AnimatePresence>
          {s.cartOpen && (
            <>
              <div className="vt-drawer-scrim" onClick={() => d({ t: "cartOpen", v: false })} />
              <motion.aside
                className="vt-drawer" style={{ width: "min(480px, 92%)" }} role="dialog" aria-label="Carrello"
                initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
              >
                <div className="vt-drawer-head">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <h3 className="vt-h2">Nuovo ordine</h3>
                    <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" onClick={() => d({ t: "cartOpen", v: false })}>Chiudi</button>
                  </div>
                  <div style={{ display: "flex", gap: 2, marginTop: 14, borderBottom: "1px solid var(--vt-line-soft)" }}>
                    {(["Righe", "Consegna", "Riepilogo"] as const).map((label, i) => (
                      <button key={label} type="button" className="vt-tab" role="tab"
                        aria-selected={s.cartStep === i + 1} onClick={() => d({ t: "cartStep", v: (i + 1) as 1 | 2 | 3 })}>
                        {i + 1} {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="vt-drawer-body">
                  {s.cartStep === 1 && (
                    cartLines.length === 0
                      ? <p className="vt-body vt-muted">Il carrello è vuoto. Aggiungi articoli dal catalogo.</p>
                      : cartLines.map(([sku, q]) => {
                        const p = productBySku(sku)
                        const price = contractPrice(p, customer.sconto + (s.role === "agente" ? s.extraSconto : 0), q)
                        return (
                          <div key={sku} style={{ padding: "12px 0", borderTop: "1px solid var(--vt-line-soft)" }}>
                            <span className="vt-data" style={{ display: "block" }}>{p.sku}</span>
                            <span className="vt-small" style={{ display: "block", marginBottom: 8 }}>{p.name}</span>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                              <QtyStep value={q} lotto={p.lotto} onChange={n => d({ t: "qty", sku, n })} />
                              <span className="vt-data">{eur(q * price)}</span>
                            </div>
                          </div>
                        )
                      })
                  )}

                  {s.cartStep === 2 && (
                    <>
                      <label>
                        <span className="vt-field-label">Data di consegna richiesta</span>
                        <input className="vt-input" value={s.consegna} onChange={e => d({ t: "consegna", v: e.target.value })} />
                      </label>
                      <p className="vt-small vt-muted" style={{ marginTop: 12 }}>
                        Destinazione: {customer.name} · {customer.city}
                      </p>
                      <p className="vt-small vt-muted" style={{ marginTop: 6 }}>
                        Resa franco fabbrica · trasporto {eur(45, 0)} sotto i {eur(500, 0)} imponibili.
                      </p>
                    </>
                  )}

                  {s.cartStep === 3 && (
                    <>
                      <Cartiglio fields={[
                        { k: "Cliente", v: customer.name },
                        { k: "Consegna", v: s.consegna },
                        { k: "Righe", v: String(cartLines.length) },
                        { k: "Condizioni", v: customer.listino },
                      ]} />
                      <div style={{ marginTop: 18 }}>
                        {[["Imponibile", eur(cartTotal)], ["Trasporto", eur(45)], ["IVA 22 %", eur(cartIva)]].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                            <span className="vt-small vt-muted">{k}</span><span className="vt-data">{v}</span>
                          </div>
                        ))}
                        <div style={{ height: 1, background: "var(--vt-line)", margin: "6px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span className="vt-small">Totale</span>
                          <span className="vt-data-lg">{eur(cartTotal + 45 + cartIva)}</span>
                        </div>
                      </div>
                      <div style={{ height: 1, background: "var(--vt-line-soft)", margin: "18px -22px" }} />
                      <span className="vt-field-label">Fido cliente</span>
                      <FidoGauge fido={customer.fido} esposizione={customer.esposizione} ordine={cartTotal + 45 + cartIva} />
                      {customer.esposizione + cartTotal + 45 + cartIva > customer.fido && (
                        <div style={{ marginTop: 12 }}>
                          <Denied>Fido superato: l'ordine verrà inviato ad approvazione del back-office.</Denied>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div style={{ flexShrink: 0, padding: 16, borderTop: "1px solid var(--vt-line-soft)", display: "flex", gap: 10 }}>
                  {s.cartStep > 1 && (
                    <button type="button" className="vt-btn vt-btn-secondary"
                      onClick={() => d({ t: "cartStep", v: (s.cartStep - 1) as 1 | 2 | 3 })}>Indietro</button>
                  )}
                  <div style={{ flex: 1 }} />
                  {s.cartStep < 3 ? (
                    <button type="button" className="vt-btn vt-btn-primary" disabled={!cartLines.length}
                      onClick={() => d({ t: "cartStep", v: (s.cartStep + 1) as 1 | 2 | 3 })}>Avanti</button>
                  ) : (
                    <button type="button" className="vt-btn vt-btn-primary" onClick={() => d({ t: "submit" })}>
                      {customer.esposizione + cartTotal + 45 + cartIva > customer.fido
                        ? "Invia ad approvazione" : "Conferma ordine"}
                    </button>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export { CUSTOMERS, PRODUCTS }
