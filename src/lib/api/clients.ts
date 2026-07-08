import { supabase } from "./core"
import type { AdminKpi, ClientPlan, ClientRecord, ClientStatus, OwnProfile } from "./types"

export async function fetchOwnProfile(id: string): Promise<OwnProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, company_name, contact_name, phone")
    .eq("id", id)
    .single()
  if (error) throw error
  return {
    id: data.id,
    email: data.email ?? "",
    companyName: data.company_name ?? undefined,
    contactName: data.contact_name ?? undefined,
    phone: data.phone ?? undefined,
  }
}

export async function fetchClients(): Promise<ClientRecord[]> {
  const [profilesRes, projectsRes, invoicesRes, ticketsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, company_name, contact_name, full_name, email, phone, plan, status, joined_at, tags, updated_at")
      .eq("role", "client")
      .order("company_name"),
    supabase
      .from("client_projects")
      .select("client_id, status")
      .in("status", ["active", "pending_approval", "paused"]),
    supabase
      .from("client_invoices")
      .select("client_id, amount, status")
      .in("status", ["sent", "overdue"]),
    supabase
      .from("support_tickets")
      .select("client_id, status")
      .neq("status", "resolved"),
  ])
  if (profilesRes.error) throw profilesRes.error

  const projects = projectsRes.data ?? []
  const invoices = invoicesRes.data ?? []
  const tickets = ticketsRes.data ?? []

  return (profilesRes.data ?? []).map(p => {
    const pi = invoices.filter(i => i.client_id === p.id)
    return {
      id: p.id,
      company: p.company_name || p.email || "—",
      contact: p.contact_name || p.full_name || "—",
      email: p.email ?? "",
      phone: p.phone ?? undefined,
      plan: (p.plan ?? "starter") as ClientPlan,
      status: (p.status ?? "active") as ClientStatus,
      projectsActive: projects.filter(pr => pr.client_id === p.id).length,
      invoicesPending: pi.length,
      invoicePendingAmount: pi.reduce((s, i) => s + (i.amount ?? 0), 0),
      ticketsOpen: tickets.filter(t => t.client_id === p.id).length,
      joinedAt: p.joined_at ?? "",
      updatedAt: p.updated_at ?? "",
      tags: Array.isArray(p.tags) ? p.tags : [],
    }
  })
}

export async function updateClientProfile(
  clientId: string,
  patch: Partial<Pick<ClientRecord, "company" | "contact" | "phone" | "plan" | "status" | "tags">>,
): Promise<void> {
  const db: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.company !== undefined) db.company_name = patch.company
  if (patch.contact !== undefined) db.contact_name = patch.contact
  if (patch.phone !== undefined) db.phone = patch.phone
  if (patch.plan !== undefined) db.plan = patch.plan
  if (patch.status !== undefined) db.status = patch.status
  if (patch.tags !== undefined) db.tags = patch.tags
  const { error } = await supabase.from("profiles").update(db).eq("id", clientId)
  if (error) throw error
}

/** Client updates their own phone (collected during project intake). */
export async function updateOwnPhone(clientId: string, phone: string): Promise<void> {
  const { error } = await supabase.from("profiles").update({ phone: phone.trim() }).eq("id", clientId)
  if (error) throw error
}

export async function fetchKpi(): Promise<AdminKpi> {
  const clients = await fetchClients()
  return {
    activeClients: clients.filter(c => c.status === "active").length,
    projectsInProgress: clients.reduce((s, c) => s + c.projectsActive, 0),
    invoicesPendingCount: clients.reduce((s, c) => s + c.invoicesPending, 0),
    invoicesPendingTotal: clients.reduce((s, c) => s + c.invoicePendingAmount, 0),
    ticketsOpen: clients.reduce((s, c) => s + c.ticketsOpen, 0),
  }
}
