import React, { useCallback, useEffect, useState } from "react"
import type { AuditLog } from "../../lib/api"
import { fetchAuditLogs, fmtDateTime, subscribe } from "../../lib/api"
import { Badge, DISPLAY, Icon, MONO, T, type Tone } from "../ui"

const ACTION: Record<string, { label: string; tone: Tone }> = {
  stage_approved:          { label: "Fase approvata dal cliente", tone: "green" },
  stage_changes_requested: { label: "Modifiche richieste dal cliente", tone: "red" },
  document_signed:         { label: "Documento firmato",          tone: "green" },
  payment_declared:        { label: "Pagamento dichiarato",       tone: "amber" },
  estimate_accepted:       { label: "Preventivo approvato",       tone: "green" },
  stage_advanced:          { label: "Fase chiusa dallo studio",   tone: "copper" },
}

function subjectOf(l: AuditLog): string | null {
  const d = l.detail || {}
  return (d.title as string) || (d.name as string) || (d.number as string) || null
}

export default function AuditTrail({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<AuditLog[] | null>(null)

  const load = useCallback(async () => {
    try { setLogs(await fetchAuditLogs(projectId)) } catch { setLogs([]) }
  }, [projectId])

  useEffect(() => {
    load()
    const un = subscribe(`adm-audit-${projectId}`, { table: "audit_logs", filter: `project_id=eq.${projectId}` }, load)
    return () => { un() }
  }, [projectId, load])

  return (
    <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name="lock" size={13} style={{ color: T.copperLt }} />
        <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: T.copperLt, margin: 0 }}>
          Audit trail
        </p>
        <span style={{ fontFamily: DISPLAY, fontSize: 12, color: T.faint }}>· registro legale delle conferme</span>
      </div>

      {logs === null ? (
        <p style={{ fontFamily: MONO, fontSize: 10, color: T.ghost, margin: 0 }}>Carico…</p>
      ) : logs.length === 0 ? (
        <p style={{ fontFamily: DISPLAY, fontSize: 12.5, color: T.faint, margin: 0 }}>
          Nessuna azione registrata ancora. Approvazioni, firme e pagamenti verranno tracciati qui con data, IP e dispositivo.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {logs.map(l => {
            const meta = ACTION[l.action] ?? { label: l.action, tone: "silver" as Tone }
            const subj = subjectOf(l)
            return (
              <div key={l.id} style={{
                display: "flex", alignItems: "flex-start", gap: 11,
                padding: "11px 13px", borderRadius: 11,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
              }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(161,44,56,0.10)", border: "1px solid rgba(161,44,56,0.22)", color: T.copperLt }}>
                  <Icon name="check" size={13} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, color: T.text }}>
                      {meta.label}{subj ? ` — ${subj}` : ""}
                    </span>
                    <Badge tone={l.actorRole === "client" ? "copper" : l.actorRole === "admin" ? "silver" : "steel"}>
                      {l.actorRole === "client" ? "cliente" : l.actorRole === "admin" ? "studio" : "sistema"}
                    </Badge>
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: 9, color: T.faint, margin: "5px 0 0", letterSpacing: "0.03em" }}>
                    {fmtDateTime(l.createdAt)}
                    {l.ip ? `  ·  IP ${l.ip}` : ""}
                  </p>
                  {l.userAgent && (
                    <p style={{ fontFamily: MONO, fontSize: 8.5, color: T.ghost, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.userAgent}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
