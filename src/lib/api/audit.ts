import { supabase } from "./core"
import type { AuditLog } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapAudit(r: any): AuditLog {
  return {
    id: r.id,
    actorId: r.actor_id ?? undefined,
    actorRole: r.actor_role,
    action: r.action,
    entityType: r.entity_type ?? undefined,
    entityId: r.entity_id ?? undefined,
    projectId: r.project_id ?? undefined,
    clientId: r.client_id ?? undefined,
    ip: r.ip ?? undefined,
    userAgent: r.user_agent ?? undefined,
    detail: (r.detail && typeof r.detail === "object" ? r.detail : {}) as Record<string, unknown>,
    createdAt: r.created_at,
  }
}

/** Audit trail for a project (admin: all rows; client: RLS returns own only). */
export async function fetchAuditLogs(projectId: string, limit = 100): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(mapAudit)
}

/** Audit trail scoped to a client (their own confirmations). */
export async function fetchClientAuditLogs(clientId: string, limit = 100): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(mapAudit)
}
