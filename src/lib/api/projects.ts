import { supabase } from "./core"
import type {
  AdminProject, ClientProject, EventType, ProjectBrief, ProjectEvent, ProjectStage, ProjectStatus, StageStatus,
} from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapProject(r: any): ClientProject {
  return {
    id: r.id,
    clientId: r.client_id,
    name: r.name,
    description: r.description ?? "",
    status: r.status as ProjectStatus,
    brief: (r.brief && typeof r.brief === "object" ? r.brief : {}) as ProjectBrief,
    adminNote: r.admin_note ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function mapStage(r: any): ProjectStage {
  return {
    id: r.id,
    projectId: r.project_id,
    key: r.key,
    title: r.title,
    orderIndex: r.order_index,
    status: r.status as StageStatus,
    approvalState: r.approval_state ?? "none",
    progress: r.status === "done" ? 100 : Math.max(0, Math.min(100, r.progress ?? 0)),
    deliverableUrl: r.deliverable_url ?? undefined,
    deliverableNote: r.deliverable_note ?? undefined,
    startedAt: r.started_at ?? undefined,
    completedAt: r.completed_at ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function mapEvent(r: any): ProjectEvent {
  return {
    id: r.id,
    projectId: r.project_id,
    clientId: r.client_id,
    actorRole: r.actor_role,
    type: r.type as EventType,
    title: r.title,
    detail: r.detail ?? undefined,
    createdAt: r.created_at,
    projectName: r.client_projects?.name ?? undefined,
    clientName: r.profiles?.company_name || r.profiles?.contact_name || undefined,
  }
}

/* ── Projects ──────────────────────────────────────────────── */

export async function fetchProjectsByClient(clientId: string): Promise<ClientProject[]> {
  const { data, error } = await supabase
    .from("client_projects")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapProject)
}

export async function fetchProjectById(id: string): Promise<ClientProject | null> {
  const { data, error } = await supabase
    .from("client_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data ? mapProject(data) : null
}

export async function fetchAllProjects(): Promise<AdminProject[]> {
  const { data, error } = await supabase
    .from("client_projects")
    .select("*, profiles!client_id(company_name, email)" as any)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    ...mapProject(r),
    clientName: r.profiles?.company_name || r.profiles?.email || r.client_id,
    clientEmail: r.profiles?.email ?? "",
  }))
}

export async function createProject(payload: {
  clientId: string
  name: string
  description: string
  brief?: ProjectBrief
}): Promise<ClientProject> {
  const brief = payload.brief
    ? Object.fromEntries(Object.entries(payload.brief).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]).filter(([, v]) => v))
    : {}
  const { data, error } = await supabase
    .from("client_projects")
    .insert({
      client_id: payload.clientId,
      name: payload.name.trim(),
      description: payload.description.trim(),
      brief,
    })
    .select()
    .single()
  if (error) throw error
  return mapProject(data)
}

/** Admin approves / pauses / resumes / completes a project (admin RLS). */
export async function updateProjectStatus(id: string, status: ProjectStatus, adminNote?: string): Promise<void> {
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (adminNote !== undefined) patch.admin_note = adminNote
  const { error } = await supabase.from("client_projects").update(patch).eq("id", id)
  if (error) throw error
}

export async function countPendingProjects(): Promise<number> {
  const { count, error } = await supabase
    .from("client_projects")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_approval")
  if (error) return 0
  return count ?? 0
}

/* ── Stages ────────────────────────────────────────────────── */

export async function fetchProjectStages(projectId: string): Promise<ProjectStage[]> {
  const { data, error } = await supabase
    .from("project_stages")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapStage)
}

export async function createStage(projectId: string, title: string, orderIndex: number): Promise<ProjectStage> {
  const key = title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "fase"
  const { data, error } = await supabase
    .from("project_stages")
    .insert({ project_id: projectId, key, title: title.trim(), order_index: orderIndex, status: "locked" })
    .select()
    .single()
  if (error) throw error
  return mapStage(data)
}

export async function updateStage(
  id: string,
  patch: Partial<Pick<ProjectStage, "title" | "status" | "orderIndex" | "progress" | "deliverableNote">>,
): Promise<void> {
  const db: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.title !== undefined) db.title = patch.title
  if (patch.orderIndex !== undefined) db.order_index = patch.orderIndex
  if (patch.progress !== undefined) db.progress = Math.max(0, Math.min(100, Math.round(patch.progress)))
  if (patch.deliverableNote !== undefined) db.deliverable_note = patch.deliverableNote.trim() || null
  if (patch.status !== undefined) {
    db.status = patch.status
    if (patch.status === "active") db.started_at = new Date().toISOString()
    if (patch.status === "done") db.completed_at = new Date().toISOString()
  }
  const { error } = await supabase.from("project_stages").update(db).eq("id", id)
  if (error) throw error
}

export async function deleteStage(id: string): Promise<void> {
  const { error } = await supabase.from("project_stages").delete().eq("id", id)
  if (error) throw error
}

/**
 * Admin closes a stage → next unlocks → project auto-completes when all done.
 * Atomic server-side RPC; events are journaled by DB triggers.
 */
export async function advanceStage(stageId: string): Promise<void> {
  const { error } = await supabase.rpc("advance_stage", { p_stage: stageId })
  if (error) throw error
}

/** Admin attaches a deliverable and asks the client to sign off the stage. */
export async function requestStageApproval(
  stageId: string,
  payload: { url?: string; note?: string },
): Promise<void> {
  const { error } = await supabase
    .from("project_stages")
    .update({
      approval_state: "requested",
      deliverable_url: payload.url?.trim() || null,
      deliverable_note: payload.note?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stageId)
  if (error) throw error
}

/** Client signs off a requested stage → RPC validates, closes it, unlocks the next. */
export async function approveStage(stageId: string): Promise<void> {
  const { error } = await supabase.rpc("approve_stage", { p_stage: stageId })
  if (error) throw error
}

/* ── Events (project journal) ──────────────────────────────── */

export async function fetchProjectEvents(projectId: string, limit = 60): Promise<ProjectEvent[]> {
  const { data, error } = await supabase
    .from("project_events")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(mapEvent)
}

/** Latest events across the client's projects (cabinet overview). */
export async function fetchClientEvents(clientId: string, limit = 20): Promise<ProjectEvent[]> {
  const { data, error } = await supabase
    .from("project_events")
    .select("*, client_projects!project_id(name)" as any)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(mapEvent)
}

/** Latest events across all clients (admin overview). */
export async function fetchRecentEvents(limit = 25): Promise<ProjectEvent[]> {
  const { data, error } = await supabase
    .from("project_events")
    .select("*, client_projects!project_id(name), profiles!client_id(company_name, contact_name)" as any)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(mapEvent)
}
