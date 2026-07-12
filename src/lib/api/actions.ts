import { fetchDocuments, fetchInvoices } from "./billing"
import { fetchThreads, isUnreadFor } from "./chat"
import { fetchKpi } from "./clients"
import { fmtDateTime, fmtEur } from "./format"
import { fetchAllMeetings, fetchClientMeetings } from "./meetings"
import {
  fetchAllProjects, fetchClientEvents, fetchProjectsByClient, fetchProjectStages, fetchRecentEvents,
} from "./projects"
import { fetchClientTickets, fetchTickets } from "./tickets"
import type {
  AdminKpi, AdminProject, ClientDocument, ClientProject, Conversation, Invoice, Meeting,
  PortalAction, ProjectEvent, ProjectStage, SupportTicket,
} from "./types"

/*
 * The action center is a pure derivation over fetched snapshots: no cron, no
 * server workers. Each home fetcher pulls the role's world in parallel and
 * distills "what needs your move next", ordered by urgency.
 */

export interface ClientHome {
  projects: ClientProject[]
  stagesByProject: Record<string, ProjectStage[]>
  invoices: Invoice[]
  documents: ClientDocument[]
  meetings: Meeting[]
  threads: Conversation[]
  tickets: SupportTicket[]
  events: ProjectEvent[]
  actions: PortalAction[]
}

export interface AdminHome {
  kpi: AdminKpi
  projects: AdminProject[]
  invoices: Invoice[]
  meetings: Meeting[]
  threads: Conversation[]
  tickets: SupportTicket[]
  events: ProjectEvent[]
  actions: PortalAction[]
}

export async function fetchClientHome(clientId: string): Promise<ClientHome> {
  const [projects, invoices, documents, meetings, threads, tickets, events] = await Promise.all([
    fetchProjectsByClient(clientId),
    fetchInvoices(clientId),
    fetchDocuments(clientId),
    fetchClientMeetings(clientId),
    fetchThreads(clientId),
    fetchClientTickets(clientId),
    fetchClientEvents(clientId),
  ])

  const running = projects.filter(p => p.status === "active")
  const stagePairs = await Promise.all(running.map(async p => [p.id, await fetchProjectStages(p.id)] as const))
  const stagesByProject = Object.fromEntries(stagePairs)

  const actions: PortalAction[] = []

  for (const [projectId, stages] of stagePairs) {
    const project = running.find(p => p.id === projectId)
    for (const s of stages) {
      if (s.approvalState === "requested") {
        actions.push({
          id: `approve_stage:${s.id}`,
          kind: "approve_stage",
          label: `Approva la fase «${s.title}»`,
          sublabel: project?.name,
          section: "progetti",
          projectId,
        })
      }
    }
  }

  for (const m of meetings) {
    if (m.status === "pending" && m.proposedBy === "admin") {
      actions.push({
        id: `confirm_meeting:${m.id}`,
        kind: "confirm_meeting",
        label: "Conferma la riunione proposta",
        sublabel: fmtDateTime(m.datetime),
        section: "riunioni",
      })
    }
  }

  for (const i of invoices) {
    // Skip once the client has already declared payment — awaiting admin confirmation.
    if ((i.status === "overdue" || i.status === "sent") && !i.clientMarkedPaidAt) {
      actions.push({
        id: `pay_invoice:${i.id}`,
        kind: "pay_invoice",
        label: i.status === "overdue" ? `Fattura ${i.number} scaduta` : `Fattura ${i.number} da saldare`,
        sublabel: fmtEur(i.amount),
        section: "fatture",
      })
    }
  }

  for (const d of documents) {
    if (d.requiresSignature && !d.signedAt) {
      actions.push({
        id: `sign_document:${d.id}`,
        kind: "sign_document",
        label: `Firma il documento «${d.name}»`,
        section: "documenti",
      })
    }
  }

  for (const t of threads) {
    if (t.status !== "closed" && isUnreadFor(t, "client")) {
      actions.push({
        id: `unread_chat:${t.id}`,
        kind: "unread_chat",
        label: `Nuova risposta: ${t.subject}`,
        section: t.stageId ? "progetti" : "messaggi",
        projectId: t.projectId,
      })
    }
  }

  if (projects.length === 0) {
    actions.push({
      id: "start_project",
      kind: "start_project",
      label: "Avvia il tuo primo progetto",
      sublabel: "Raccontaci cosa vuoi costruire",
      section: "progetti",
    })
  }

  const order: PortalAction["kind"][] = ["approve_stage", "sign_document", "confirm_meeting", "pay_invoice", "unread_chat", "start_project"]
  actions.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))

  return { projects, stagesByProject, invoices, documents, meetings, threads, tickets, events, actions }
}

export async function fetchAdminHome(): Promise<AdminHome> {
  const [kpi, projects, invoices, meetings, threads, tickets, events] = await Promise.all([
    fetchKpi(),
    fetchAllProjects(),
    fetchInvoices(),
    fetchAllMeetings(),
    fetchThreads(),
    fetchTickets(),
    fetchRecentEvents(),
  ])

  const actions: PortalAction[] = []

  for (const p of projects) {
    if (p.status === "pending_approval") {
      actions.push({
        id: `review_project:${p.id}`,
        kind: "review_project",
        label: `Valuta il progetto «${p.name}»`,
        sublabel: p.clientName,
        section: "progetti",
        projectId: p.id,
      })
    }
  }

  for (const m of meetings) {
    if (m.status === "pending" && m.proposedBy === "client") {
      actions.push({
        id: `confirm_meeting:${m.id}`,
        kind: "confirm_meeting",
        label: `Riunione richiesta da ${m.clientName ?? "cliente"}`,
        sublabel: fmtDateTime(m.datetime),
        section: "riunioni",
      })
    }
  }

  for (const t of tickets) {
    if (t.status === "new") {
      actions.push({
        id: `reply_ticket:${t.id}`,
        kind: "reply_ticket",
        label: `Ticket: ${t.subject}`,
        sublabel: t.clientName,
        section: "supporto",
      })
    }
  }

  for (const t of threads) {
    if (t.status !== "closed" && isUnreadFor(t, "admin")) {
      actions.push({
        id: `answer_chat:${t.id}`,
        kind: "answer_chat",
        label: `Rispondi: ${t.subject}`,
        sublabel: t.clientName,
        section: t.stageId ? "progetti" : "messaggi",
        projectId: t.projectId,
      })
    }
  }

  for (const i of invoices) {
    if (i.clientMarkedPaidAt && i.status !== "paid") {
      actions.push({
        id: `confirm_payment:${i.id}`,
        kind: "confirm_payment",
        label: `Conferma pagamento ${i.number}`,
        sublabel: fmtEur(i.amount),
        section: "fatturazione",
      })
    } else if (i.status === "overdue") {
      actions.push({
        id: `overdue_invoice:${i.id}`,
        kind: "overdue_invoice",
        label: `Fattura ${i.number} scaduta`,
        sublabel: fmtEur(i.amount),
        section: "fatturazione",
      })
    }
  }

  const order: PortalAction["kind"][] = ["review_project", "confirm_payment", "confirm_meeting", "reply_ticket", "answer_chat", "overdue_invoice"]
  actions.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))

  return { kpi, projects, invoices, meetings, threads, tickets, events, actions }
}
