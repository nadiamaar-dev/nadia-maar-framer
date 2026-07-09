import React from "react"
import type { ProjectStage } from "../lib/api"
import { fmtDate } from "../lib/api"
import { APPROVAL_STATE, Badge, Bar, DISPLAY, Icon, MONO, STAGE_STATUS, T } from "./ui"

export function stageProgress(stages: ProjectStage[]): number {
  if (stages.length === 0) return 0
  return Math.round((stages.filter(s => s.status === "done").length / stages.length) * 100)
}

/** Vertical stage rail with status nodes, deliverables and a per-stage action slot. */
export default function StageRail({ stages, renderAction }: {
  stages: ProjectStage[]
  renderAction?: (s: ProjectStage) => React.ReactNode
}) {
  const sorted = [...stages].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {sorted.map((s, i) => {
        const last = i === sorted.length - 1
        const node = s.status === "done"
          ? { icon: "check" as const, bg: "rgba(61,190,139,0.16)", bd: "rgba(61,190,139,0.45)", fg: T.green }
          : s.status === "active"
            ? { icon: "bolt" as const, bg: "rgba(176,74,56,0.20)", bd: "rgba(176,74,56,0.55)", fg: T.copperLt }
            : { icon: "lock" as const, bg: "rgba(255,255,255,0.04)", bd: T.border, fg: T.ghost }
        return (
          <div key={s.id} style={{ display: "flex", gap: 14 }}>
            {/* Node + connector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: node.bg, border: `1px solid ${node.bd}`, color: node.fg,
                boxShadow: s.status === "active" ? "0 0 18px rgba(176,74,56,0.30), inset 0 1px 0 rgba(255,255,255,0.20)" : "inset 0 1px 0 rgba(255,255,255,0.10)",
              }}>
                <Icon name={node.icon} size={13} />
              </div>
              {!last && (
                <div style={{
                  width: 1.5, flex: 1, minHeight: 18, margin: "4px 0",
                  background: s.status === "done" ? "rgba(61,190,139,0.35)" : "rgba(255,255,255,0.10)",
                }} />
              )}
            </div>

            {/* Body */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: last ? 0 : 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: T.ghost, letterSpacing: "0.1em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 style={{
                  fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 800, margin: 0, letterSpacing: "-0.01em",
                  color: s.status === "locked" ? T.faint : T.text,
                }}>
                  {s.title}
                </h4>
                <Badge tone={STAGE_STATUS[s.status].tone} dot>{STAGE_STATUS[s.status].label}</Badge>
                {s.approvalState !== "none" && (
                  <Badge tone={APPROVAL_STATE[s.approvalState].tone}>{APPROVAL_STATE[s.approvalState].label}</Badge>
                )}
              </div>

              {(s.startedAt || s.completedAt) && (
                <p style={{ fontFamily: MONO, fontSize: 9.5, color: T.ghost, margin: "5px 0 0", letterSpacing: "0.04em" }}>
                  {s.startedAt ? `Avviata ${fmtDate(s.startedAt)}` : ""}
                  {s.startedAt && s.completedAt ? " · " : ""}
                  {s.completedAt ? `Chiusa ${fmtDate(s.completedAt)}` : ""}
                </p>
              )}

              {s.status !== "locked" && (
                <div style={{ marginTop: 8, maxWidth: 320 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ghost }}>Avanzamento</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: s.status === "done" ? T.green : T.copperLt }}>{s.progress}%</span>
                  </div>
                  <Bar value={s.progress} tone={s.status === "done" ? "green" : "copper"} height={4} />
                </div>
              )}

              {(s.deliverableUrl || s.deliverableNote) && (
                <div style={{
                  marginTop: 9, padding: "9px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.035)", border: `1px solid ${T.border}`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                }}>
                  {s.deliverableNote && (
                    <p style={{ fontFamily: DISPLAY, fontSize: 12, lineHeight: 1.55, color: T.muted, margin: 0, whiteSpace: "pre-wrap" }}>
                      {s.deliverableNote}
                    </p>
                  )}
                  {s.deliverableUrl && (
                    <a
                      href={s.deliverableUrl}
                      target="_blank" rel="noreferrer"
                      className="portal-link"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        marginTop: s.deliverableNote ? 7 : 0,
                        fontFamily: MONO, fontSize: 10.5, color: T.copperLt, textDecoration: "none",
                      }}
                    >
                      <Icon name="external" size={11} />
                      Apri deliverable
                    </a>
                  )}
                </div>
              )}

              {renderAction && <div style={{ marginTop: 9 }}>{renderAction(s)}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
