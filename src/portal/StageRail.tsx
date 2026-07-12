import React from "react"
import type { ProjectStage } from "../lib/api"
import { fmtDate } from "../lib/api"
import { APPROVAL_STATE, Badge, DISPLAY, Icon, MONO, STAGE_STATUS, T } from "./ui"

export function stageProgress(stages: ProjectStage[]): number {
  if (stages.length === 0) return 0
  return Math.round((stages.filter(s => s.status === "done").length / stages.length) * 100)
}

const SVG_CHECK  = <><circle cx="12" cy="12" r="10" /><path d="M16 9l-5.5 6L8 12.5" /></>
const SVG_UNLOCK = <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 019.9-1" /></>
const SVG_LOCK   = <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>

function NodeIcon({ d }: { d: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      width={14} height={14} aria-hidden>
      {d}
    </svg>
  )
}

function ProgressBar({ value, tone }: { value: number; tone: "copper" | "green" }) {
  const pct = Math.max(0, Math.min(100, value))
  const fill = tone === "green"
    ? "linear-gradient(90deg,#2DA870,#4BD39B)"
    : "linear-gradient(90deg,#B04A38,#E0836A)"
  const glow = tone === "green" ? "rgba(75,211,155,0.40)" : "rgba(224,131,106,0.45)"
  const label = tone === "green" ? "#4BD39B" : "#F4A882"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: fill, boxShadow: `0 0 8px ${glow}`, transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: label, minWidth: 30, textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  )
}

/** Compact vertical stage rail for the admin dossier view. */
export default function StageRail({ stages, renderAction }: {
  stages: ProjectStage[]
  renderAction?: (s: ProjectStage) => React.ReactNode
}) {
  const sorted = [...stages].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {sorted.map((s, i) => {
        const last = i === sorted.length - 1
        const isActive = s.status === "active"
        const isDone   = s.status === "done"
        const isLocked = s.status === "locked"

        /* Node config */
        const node = isDone
          ? { d: SVG_CHECK,  bg: "rgba(75,211,155,0.18)",   bd: "rgba(75,211,155,0.46)",   fg: "#4BD39B", glow: "0 0 14px rgba(75,211,155,0.28)" }
          : isActive
          ? { d: SVG_UNLOCK, bg: "rgba(224,131,106,0.22)",  bd: "rgba(224,131,106,0.52)",  fg: "#F4A882", glow: "0 0 18px rgba(224,131,106,0.35), inset 0 1px 0 rgba(255,255,255,0.18)" }
          : { d: SVG_LOCK,   bg: "rgba(255,255,255,0.05)",  bd: "rgba(255,255,255,0.10)",  fg: "rgba(255,255,255,0.35)", glow: "none" }

        /* Line below this node */
        const lineGrad = isDone
          ? "linear-gradient(180deg,rgba(75,211,155,0.40) 0%,rgba(75,211,155,0.18) 100%)"
          : isActive
          ? "linear-gradient(180deg,rgba(224,131,106,0.38) 0%,rgba(255,255,255,0.07) 100%)"
          : "rgba(255,255,255,0.08)"

        return (
          <div key={s.id} style={{ display: "flex", gap: 14 }}>
            {/* Node + connector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: node.bg, border: `1px solid ${node.bd}`, color: node.fg,
                boxShadow: node.glow,
                transition: "box-shadow 0.3s ease",
              }}>
                <NodeIcon d={node.d} />
              </div>
              {!last && (
                <div style={{ width: 2, flex: 1, minHeight: 16, margin: "4px 0", background: lineGrad, borderRadius: 1 }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: last ? 0 : 20 }}>
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", minHeight: 32 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: node.fg, letterSpacing: "0.14em", opacity: 0.8 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 style={{
                  fontFamily: DISPLAY, fontSize: 13.5, fontWeight: isLocked ? 500 : 700,
                  letterSpacing: "-0.01em", margin: 0,
                  color: isLocked ? "rgba(255,255,255,0.40)" : isActive ? "#F5EDE8" : "#D4EEE0",
                }}>
                  {s.title}
                </h4>
                <Badge tone={STAGE_STATUS[s.status].tone} dot>{STAGE_STATUS[s.status].label}</Badge>
                {s.approvalState !== "none" && (
                  <Badge tone={APPROVAL_STATE[s.approvalState].tone}>{APPROVAL_STATE[s.approvalState].label}</Badge>
                )}
              </div>

              {/* Dates */}
              {(s.startedAt || s.completedAt) && (
                <p style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.28)", margin: "4px 0 0", letterSpacing: "0.04em" }}>
                  {s.startedAt ? `Avviata ${fmtDate(s.startedAt)}` : ""}
                  {s.startedAt && s.completedAt ? "  ·  " : ""}
                  {s.completedAt ? `Chiusa ${fmtDate(s.completedAt)}` : ""}
                </p>
              )}

              {/* Progress — active + done */}
              {!isLocked && (
                <div style={{ marginTop: 8, maxWidth: 340 }}>
                  <ProgressBar value={s.progress} tone={isDone ? "green" : "copper"} />
                </div>
              )}

              {/* Deliverable card */}
              {(s.deliverableUrl || s.deliverableNote) && (
                <div style={{
                  marginTop: 10, padding: "10px 13px", borderRadius: 11,
                  background: isActive ? "rgba(224,131,106,0.08)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isActive ? "rgba(224,131,106,0.22)" : "rgba(255,255,255,0.09)"}`,
                  borderLeft: isActive ? "2px solid rgba(224,131,106,0.55)" : undefined,
                }}>
                  {s.deliverableNote && (
                    <p style={{ fontFamily: DISPLAY, fontSize: 12.5, lineHeight: 1.6, color: T.muted, margin: 0, whiteSpace: "pre-wrap" }}>
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

              {/* Actions */}
              {renderAction && <div style={{ marginTop: 10 }}>{renderAction(s)}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
