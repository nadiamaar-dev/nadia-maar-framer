import { supabase } from "./core"
import type { SupportTicket, TicketPriority, TicketStatus } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapTicket(r: any): SupportTicket {
  return {
    id: r.id,
    clientId: r.client_id,
    clientName: r.client_name ?? "",
    projectId: r.project_id ?? undefined,
    subject: r.subject,
    message: r.message,
    priority: r.priority as TicketPriority,
    status: r.status as TicketStatus,
    createdAt: r.created_at,
    adminNote: r.admin_note ?? undefined,
    respondedAt: r.responded_at ?? undefined,
    estimateAmount: r.estimate_amount ?? undefined,
    estimateHours: r.estimate_hours ?? undefined,
    estimateAcceptedAt: r.estimate_accepted_at ?? undefined,
  }
}

export async function fetchTickets(status?: TicketStatus): Promise<SupportTicket[]> {
  let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false })
  if (status) q = q.eq("status", status)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapTicket)
}

export async function fetchClientTickets(clientId: string): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapTicket)
}

/** client_name is filled server-side by trigger set_ticket_client_name. */
export async function createTicket(payload: {
  clientId: string
  subject: string
  message: string
  priority: TicketPriority
  projectId?: string
}): Promise<SupportTicket> {
  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      client_id: payload.clientId,
      project_id: payload.projectId ?? null,
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      priority: payload.priority,
    })
    .select()
    .single()
  if (error) throw error
  return mapTicket(data)
}

/** Client accepts a quoted estimate on a ticket (RPC guards ownership). */
export async function acceptTicketEstimate(id: string): Promise<void> {
  const { error } = await supabase.rpc("accept_ticket_estimate", { p_ticket: id })
  if (error) throw error
}

export async function updateTicket(id: string, patch: {
  status?: TicketStatus
  adminNote?: string
  estimateAmount?: number | null
  estimateHours?: number | null
}): Promise<void> {
  const db: Record<string, unknown> = {}
  if (patch.status !== undefined) db.status = patch.status
  if (patch.adminNote !== undefined) {
    db.admin_note = patch.adminNote
    db.responded_at = new Date().toISOString()
  }
  if (patch.estimateAmount !== undefined) db.estimate_amount = patch.estimateAmount
  if (patch.estimateHours !== undefined) db.estimate_hours = patch.estimateHours
  const { error } = await supabase.from("support_tickets").update(db).eq("id", id)
  if (error) throw error
}
