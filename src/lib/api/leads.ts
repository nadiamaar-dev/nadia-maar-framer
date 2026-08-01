import { supabase } from "./core"

/* eslint-disable @typescript-eslint/no-explicit-any */

export type LeadStatus = "new" | "contacted" | "archived"

export type FoundryLeadModule = { node: string; tech: string; group: string; label: string }

export type FoundryLeadBlueprint = {
  obiettivo: string
  architettura: string
  scaffali: { label: string; group: string; righe: { node: string; tech: string }[] }[]
}

export type FoundryLead = {
  id: string
  name: string
  email: string
  messenger?: string
  vectorLabel: string
  vectorNode: string
  vectorStack?: string
  complexity?: string
  weeks?: string
  level?: number
  modules: FoundryLeadModule[]
  blueprint?: FoundryLeadBlueprint
  status: LeadStatus
  adminNote?: string
  page?: string
  emailSent: boolean
  createdAt: string
  handledAt?: string
}

function mapLead(r: any): FoundryLead {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    messenger: r.messenger ?? undefined,
    vectorLabel: r.vector_label ?? "",
    vectorNode: r.vector_node ?? "",
    vectorStack: r.vector_stack ?? undefined,
    complexity: r.complexity ?? undefined,
    weeks: r.weeks ?? undefined,
    level: r.level ?? undefined,
    modules: Array.isArray(r.modules) ? r.modules : [],
    blueprint: r.blueprint ?? undefined,
    status: (r.status as LeadStatus) ?? "new",
    adminNote: r.admin_note ?? undefined,
    page: r.page ?? undefined,
    emailSent: Boolean(r.email_sent),
    createdAt: r.created_at,
    handledAt: r.handled_at ?? undefined,
  }
}

export async function fetchLeads(limit = 200): Promise<FoundryLead[]> {
  const { data, error } = await supabase
    .from("foundry_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(mapLead)
}

export async function updateLead(id: string, patch: { status?: LeadStatus; adminNote?: string }): Promise<void> {
  const db: Record<string, unknown> = {}
  if (patch.status !== undefined) {
    db.status = patch.status
    /* handled_at marca il momento in cui la richiesta esce da "nuova" */
    db.handled_at = patch.status === "new" ? null : new Date().toISOString()
  }
  if (patch.adminNote !== undefined) db.admin_note = patch.adminNote.trim() || null
  const { error } = await supabase.from("foundry_leads").update(db).eq("id", id)
  if (error) throw error
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from("foundry_leads").delete().eq("id", id)
  if (error) throw error
}
