import { supabase } from "./core"
import type { ProjectReference, ReferenceKind } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapReference(r: any): ProjectReference {
  return {
    id: r.id,
    projectId: r.project_id,
    clientId: r.client_id,
    kind: r.kind as ReferenceKind,
    title: r.title,
    url: r.url ?? undefined,
    imageUrl: r.image_url ?? undefined,
    note: r.note ?? undefined,
    source: r.source ?? undefined,
    addedBy: (r.added_by ?? "client") as "client" | "admin",
    createdAt: r.created_at,
  }
}

export async function fetchReferences(projectId: string): Promise<ProjectReference[]> {
  const { data, error } = await supabase
    .from("project_references")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapReference)
}

export async function createReference(payload: {
  projectId: string
  clientId: string
  kind: ReferenceKind
  title: string
  url?: string
  imageUrl?: string
  note?: string
  source?: string
  addedBy?: "client" | "admin"
}): Promise<ProjectReference> {
  const { data, error } = await supabase
    .from("project_references")
    .insert({
      project_id: payload.projectId,
      client_id: payload.clientId,
      kind: payload.kind,
      title: payload.title.trim(),
      url: payload.url?.trim() || null,
      image_url: payload.imageUrl?.trim() || null,
      note: payload.note?.trim() || null,
      source: payload.source?.trim() || null,
      added_by: payload.addedBy ?? "client",
    })
    .select()
    .single()
  if (error) throw error
  return mapReference(data)
}

/** Bulk insert (used by onboarding: links + imported Foundry items). */
export async function createReferences(rows: Array<{
  projectId: string
  clientId: string
  kind: ReferenceKind
  title: string
  url?: string
  note?: string
  source?: string
  addedBy?: "client" | "admin"
}>): Promise<void> {
  if (rows.length === 0) return
  const payload = rows.map(r => ({
    project_id: r.projectId,
    client_id: r.clientId,
    kind: r.kind,
    title: r.title.trim(),
    url: r.url?.trim() || null,
    note: r.note?.trim() || null,
    source: r.source?.trim() || null,
    added_by: r.addedBy ?? "client",
  }))
  const { error } = await supabase.from("project_references").insert(payload)
  if (error) throw error
}

export async function deleteReference(id: string): Promise<void> {
  const { error } = await supabase.from("project_references").delete().eq("id", id)
  if (error) throw error
}

/** Best-effort URL → title (hostname) when the client doesn't type one. */
export function titleFromUrl(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
