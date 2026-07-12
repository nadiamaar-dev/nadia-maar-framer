import { supabase } from "./core"
import type { CredentialKind, ProjectCredential } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapCredential(r: any): ProjectCredential {
  return {
    id: r.id,
    projectId: r.project_id,
    clientId: r.client_id,
    kind: r.kind as CredentialKind,
    label: r.label,
    url: r.url ?? undefined,
    username: r.username ?? undefined,
    secret: r.secret ?? undefined,
    note: r.note ?? undefined,
    releasedAt: r.released_at ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

/** Admin view: every credential of a project (released or not). Client view: RLS returns only released ones. */
export async function fetchCredentialsByProject(projectId: string): Promise<ProjectCredential[]> {
  const { data, error } = await supabase
    .from("project_credentials")
    .select("*")
    .eq("project_id", projectId)
    .order("kind", { ascending: true })
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapCredential)
}

export async function fetchClientCredentials(clientId: string): Promise<ProjectCredential[]> {
  const { data, error } = await supabase
    .from("project_credentials")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapCredential)
}

export async function createCredential(payload: {
  projectId: string
  clientId: string
  kind: CredentialKind
  label: string
  url?: string
  username?: string
  secret?: string
  note?: string
  release?: boolean
}): Promise<ProjectCredential> {
  const { data, error } = await supabase
    .from("project_credentials")
    .insert({
      project_id: payload.projectId,
      client_id: payload.clientId,
      kind: payload.kind,
      label: payload.label.trim(),
      url: payload.url?.trim() || null,
      username: payload.username?.trim() || null,
      secret: payload.secret?.trim() || null,
      note: payload.note?.trim() || null,
      released_at: payload.release ? new Date().toISOString() : null,
    })
    .select()
    .single()
  if (error) throw error
  return mapCredential(data)
}

export async function updateCredential(id: string, patch: {
  label?: string
  url?: string | null
  username?: string | null
  secret?: string | null
  note?: string | null
}): Promise<void> {
  const db: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.label !== undefined) db.label = patch.label.trim()
  if (patch.url !== undefined) db.url = patch.url?.trim() || null
  if (patch.username !== undefined) db.username = patch.username?.trim() || null
  if (patch.secret !== undefined) db.secret = patch.secret?.trim() || null
  if (patch.note !== undefined) db.note = patch.note?.trim() || null
  const { error } = await supabase.from("project_credentials").update(db).eq("id", id)
  if (error) throw error
}

/** Release (or revoke) a credential to the client. */
export async function setCredentialReleased(id: string, released: boolean): Promise<void> {
  const { error } = await supabase
    .from("project_credentials")
    .update({ released_at: released ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

export async function deleteCredential(id: string): Promise<void> {
  const { error } = await supabase.from("project_credentials").delete().eq("id", id)
  if (error) throw error
}
