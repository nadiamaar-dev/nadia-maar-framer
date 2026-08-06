import type {
  AdminHome, AdminProject, Conversation, Invoice, Meeting, ProjectEvent, SupportTicket,
} from "../../lib/api"
import { isUnreadFor } from "../../lib/api"

/* ══════════════════════════════════════════════════════════════════════════
   UN CLIENTE, RITAGLIATO DA `AdminHome`.

   `AdminHome` è già tutto quello che serve — progetti, fatture, fili,
   riunioni, richieste, diario — solo che è ordinato per tipo. Chi lavora
   però non pensa «le fatture», pensa «questo cliente»: cos'ha in ballo, cosa
   aspetta da me, cosa gli ho già mandato.

   Questa funzione fa quel giro una volta sola. Prima ogni schermata se lo
   rifaceva per conto suo con filtri leggermente diversi, ed è così che
   l'elenco clienti e la scheda dello stesso cliente arrivavano a mostrare
   due conteggi diversi della stessa cosa.
══════════════════════════════════════════════════════════════════════════ */

export interface ClientLens {
  projects: AdminProject[]
  /** progetti ancora in corso, nell'ordine in cui vanno guardati */
  running: AdminProject[]
  invoices: Invoice[]
  /** fili di conversazione del cliente, escluse le discussioni di fase
   *  (quelle vivono nel dossier del progetto, non nella scheda cliente) */
  threads: Conversation[]
  meetings: Meeting[]
  tickets: SupportTicket[]
  events: ProjectEvent[]

  /* ── cosa aspetta una mia mossa ── */
  unread: number
  pendingProjects: number
  openTickets: number
  pendingMeetings: number
  dueInvoices: number
  dueAmount: number
  declaredInvoices: number
  overdueInvoices: number
  /** somma di tutto ciò che sopra è diverso da zero: l'ordinamento
   *  dell'elenco e il pallino sulla riga vengono da qui */
  todo: number

  /** quanto è stato incassato in totale: l'unico numero che dice se un
   *  rapporto archiviato è valso qualcosa */
  paidAmount: number
}

export function clientLens(home: AdminHome, clientId: string): ClientLens {
  const projects = home.projects.filter(p => p.clientId === clientId)
  const invoices = home.invoices.filter(i => i.clientId === clientId)
  const threads = home.threads.filter(c => c.clientId === clientId && !c.stageId)
  const meetings = home.meetings.filter(m => m.clientId === clientId)
  const tickets = home.tickets.filter(t => t.clientId === clientId)
  const events = home.events.filter(e => e.clientId === clientId)

  const unread = threads.filter(c => c.status !== "closed" && isUnreadFor(c, "admin")).length
  const pendingProjects = projects.filter(p => p.status === "pending_approval").length
  const openTickets = tickets.filter(t => t.status !== "resolved").length
  const pendingMeetings = meetings.filter(m => m.status === "pending" && m.proposedBy === "client").length

  const due = invoices.filter(i => i.status === "sent" || i.status === "overdue")
  const declaredInvoices = invoices.filter(i => i.clientMarkedPaidAt && i.status !== "paid").length
  const overdueInvoices = invoices.filter(i => i.status === "overdue").length

  return {
    projects,
    running: projects.filter(p => p.status !== "completed"),
    invoices, threads, meetings, tickets, events,
    unread, pendingProjects, openTickets, pendingMeetings,
    dueInvoices: due.length,
    dueAmount: due.reduce((s, i) => s + i.amount, 0),
    declaredInvoices, overdueInvoices,
    /* le fatture da saldare non contano: aspettano il cliente, non me.
       Quelle scadute e quelle già dichiarate pagate sì. */
    todo: unread + pendingProjects + openTickets + pendingMeetings + declaredInvoices + overdueInvoices,
    paidAmount: invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0),
  }
}
