import React from "react"
import type { ProjectStage } from "../lib/api"
import { fmtDate } from "../lib/api"
import { APPROVAL_STATE, Badge, Btn, DISPLAY, Icon, MONO, STAGE_STATUS, T } from "./ui"

/* ── Inline icon paths ────────────────────────────────────── */
const LOCK_CLOSED = (
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </>
)
const LOCK_OPEN = (
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 019.9-1" />
  </>
)
const CHECK_CIRCLE = (
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 9l-5.5 6L8 12.5" />
  </>
)

function StatusIcon({ status }: { status: ProjectStage["status"] }) {
  const configs = {
    locked: { paths: LOCK_CLOSED, color: "rgba(255,255,255,0.28)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.10)" },
    active: { paths: LOCK_OPEN, color: "#D4695A", bg: "rgba(176,74,56,0.18)", border: "rgba(176,74,56,0.38)" },
    done: { paths: CHECK_CIRCLE, color: "#3DBE8B", bg: "rgba(61,190,139,0.13)", border: "rgba(61,190,139,0.30)" },
  }
  const c = configs[status]
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: c.bg, border: `1px solid ${c.border}`, color: c.color, flexShrink: 0,
      boxShadow: status === "active"
        ? "0 0 18px rgba(176,74,56,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
        : status === "done"
          ? "inset 0 1px 0 rgba(255,255,255,0.14)"
          : "inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
        strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
        {c.paths}
      </svg>
    </div>
  )
}

/* Thin horizontal arrow connector between cards in a row */
function ArrowH({ lit }: { lit: boolean }) {
  const color = lit ? "rgba(212,105,90,0.55)" : "rgba(255,255,255,0.14)"
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, width: 32, pointerEvents: "none",
    }}>
      <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
        <line x1="2" y1="8" x2="22" y2="8" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M19 4.5L23.5 8 19 11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

/* Right-side wrap connector between row 1 end and row 2 start */
function RowWrap({ lit }: { lit: boolean }) {
  const color = lit ? "rgba(212,105,90,0.45)" : "rgba(255,255,255,0.12)"
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "0 4px", margin: "4px 0" }}>
      <svg width="52" height="36" viewBox="0 0 52 36" fill="none" style={{ display: "block" }}>
        {/* Right edge → curves down → points right (into next row start) */}
        <path
          d="M2 4 L2 18 Q2 32 16 32 L50 32"
          stroke={color} strokeWidth="1.5" strokeDasharray="3.5 2.5"
          fill="none" strokeLinecap="round"
        />
        {/* Arrowhead pointing right at the end */}
        <path d="M46 27.5L50.5 32 46 36.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color, marginLeft: 4 }}>
        continua
      </span>
    </div>
  )
}

/* Animated shimmer bar for active stages */
function ActiveBar() {
  return (
    <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: 99,
        background: "linear-gradient(90deg, transparent 0%, #D4695A 40%, #B04A38 70%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "stageBarPulse 2s ease-in-out infinite",
      }} />
    </div>
  )
}

/* ── Card ─────────────────────────────────────────────────── */
function StageCard({
  stage, index, renderAction,
}: {
  stage: ProjectStage
  index: number
  renderAction?: (s: ProjectStage) => React.ReactNode
}) {
  const isActive = stage.status === "active"
  const isDone = stage.status === "done"
  const isLocked = stage.status === "locked"

  /* Matte solid card — no backdrop-blur, float shadow */
  const cardBg = isActive
    ? "#1F1C1B"
    : isDone
      ? "#191E1B"
      : "#1C1D23"
  const cardBorder = isActive
    ? "rgba(176,74,56,0.32)"
    : isDone
      ? "rgba(61,190,139,0.22)"
      : "rgba(255,255,255,0.08)"
  const cardShadow = isActive
    ? "0 6px 32px rgba(176,74,56,0.14), 0 2px 8px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.09)"
    : isDone
      ? "0 4px 24px rgba(0,0,0,0.44), 0 1px 4px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.08)"
      : "0 4px 20px rgba(0,0,0,0.38), 0 1px 3px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)"

  const titleColor = isLocked ? "rgba(255,255,255,0.36)" : T.text
  const action = renderAction?.(stage)

  return (
    /* Outer bezel — thin ring + slightly elevated bg */
    <div style={{
      flex: 1, minWidth: 0,
      padding: 1.5,
      border: `1px solid ${cardBorder}`,
      borderRadius: 18,
      background: isActive
        ? "linear-gradient(145deg, rgba(176,74,56,0.08), transparent)"
        : "rgba(255,255,255,0.025)",
      boxShadow: cardShadow,
      transition: "box-shadow 0.3s cubic-bezier(0.32,0.72,0,1)",
    }}>
      {/* Inner core */}
      <div style={{
        background: cardBg,
        borderRadius: 16,
        padding: "18px 18px 16px",
        height: "100%",
        display: "flex", flexDirection: "column", gap: 12,
        boxSizing: "border-box",
      }}>
        {/* Top row: number + status icon */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
            color: isActive ? T.copperLt : "rgba(255,255,255,0.28)",
            padding: "3px 8px", borderRadius: 99,
            background: isActive ? "rgba(176,74,56,0.12)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isActive ? "rgba(176,74,56,0.24)" : "rgba(255,255,255,0.08)"}`,
          }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <StatusIcon status={stage.status} />
        </div>

        {/* Title + badge row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <h4 style={{
            fontFamily: DISPLAY, fontSize: 15, fontWeight: 700,
            letterSpacing: "-0.01em", lineHeight: 1.3,
            color: titleColor, margin: 0, flex: 1, minWidth: 0,
          }}>
            {stage.title}
          </h4>
          {stage.approvalState !== "none" && (
            <Badge tone={APPROVAL_STATE[stage.approvalState].tone}>
              {APPROVAL_STATE[stage.approvalState].label}
            </Badge>
          )}
        </div>

        {/* Admin note / description */}
        {stage.deliverableNote && (
          <p style={{
            fontFamily: DISPLAY, fontSize: 12.5, lineHeight: 1.6,
            color: isLocked ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.56)",
            margin: 0, whiteSpace: "pre-wrap",
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {stage.deliverableNote}
          </p>
        )}

        {/* Deliverable link */}
        {stage.deliverableUrl && (
          <a
            href={stage.deliverableUrl}
            target="_blank" rel="noreferrer"
            className="portal-link"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: MONO, fontSize: 10, color: T.copperLt,
              textDecoration: "none", marginTop: -4,
            }}
          >
            <Icon name="external" size={11} />
            Apri deliverable
          </a>
        )}

        {/* Action slot */}
        {action && (
          <div style={{ marginTop: "auto" }}>
            {action}
          </div>
        )}

        {/* Footer: progress bar (active) or date */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {isActive && <ActiveBar />}

          {(stage.startedAt || stage.completedAt) && (
            <p style={{
              fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.24)",
              margin: 0, letterSpacing: "0.04em",
            }}>
              {stage.startedAt ? `Avviata ${fmtDate(stage.startedAt)}` : ""}
              {stage.startedAt && stage.completedAt ? " · " : ""}
              {stage.completedAt ? `Chiusa ${fmtDate(stage.completedAt)}` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main export ─────────────────────────────────────────── */
export default function StageGrid({ stages, renderAction }: {
  stages: ProjectStage[]
  renderAction?: (s: ProjectStage) => React.ReactNode
}) {
  if (stages.length === 0) return null

  const sorted = [...stages].sort((a, b) => a.orderIndex - b.orderIndex)
  const COLS = 3
  const rows: ProjectStage[][] = []
  for (let i = 0; i < sorted.length; i += COLS) {
    rows.push(sorted.slice(i, i + COLS))
  }

  /* Find last "lit" (non-locked) stage to know where to color arrows */
  const lastActiveDoneIdx = sorted.reduce(
    (acc, s, i) => (s.status !== "locked" ? i : acc), -1,
  )

  return (
    <>
      <style>{`
        @keyframes stageBarPulse {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 640px) {
          .stage-grid-row { flex-direction: column !important; }
          .stage-grid-arrow { display: none !important; }
          .stage-grid-wrap { display: none !important; }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, rowIdx) => {
          const rowStartIdx = rowIdx * COLS
          return (
            <React.Fragment key={rowIdx}>
              {rowIdx > 0 && (
                <div className="stage-grid-wrap">
                  <RowWrap lit={sorted[rowStartIdx]?.status !== "locked"} />
                </div>
              )}
              <div className="stage-grid-row" style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                {row.map((stage, colIdx) => {
                  const globalIdx = rowStartIdx + colIdx
                  const arrowLit = globalIdx < lastActiveDoneIdx
                  return (
                    <React.Fragment key={stage.id}>
                      <StageCard stage={stage} index={globalIdx} renderAction={renderAction} />
                      {colIdx < row.length - 1 && (
                        <div className="stage-grid-arrow">
                          <ArrowH lit={arrowLit} />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </>
  )
}
