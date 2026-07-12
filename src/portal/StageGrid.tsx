import React from "react"
import type { ProjectStage } from "../lib/api"
import { fmtDate } from "../lib/api"
import { APPROVAL_STATE, Badge, DISPLAY, Icon, MONO, T } from "./ui"

/* ── Inline status-icon paths ─────────────────────────────── */
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
    locked: { paths: LOCK_CLOSED, color: "rgba(255,255,255,0.34)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.11)", label: "Fase bloccata" },
    active: { paths: LOCK_OPEN, color: "#E0836A", bg: "rgba(174,83,80,0.20)", border: "rgba(174,83,80,0.42)", label: "Fase in corso" },
    done: { paths: CHECK_CIRCLE, color: "#4BD39B", bg: "rgba(61,190,139,0.16)", border: "rgba(61,190,139,0.36)", label: "Fase completata" },
  }
  const c = configs[status]
  return (
    <div role="img" aria-label={c.label} style={{
      width: 38, height: 38, borderRadius: 12,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: c.bg, border: `1px solid ${c.border}`, color: c.color, flexShrink: 0,
      boxShadow: status === "active"
        ? "0 0 20px rgba(174,83,80,0.30), inset 0 1px 0 rgba(255,255,255,0.20)"
        : "inset 0 1px 0 rgba(255,255,255,0.10)",
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
        strokeLinecap="round" strokeLinejoin="round" width={18} height={18} aria-hidden="true">
        {c.paths}
      </svg>
    </div>
  )
}

/* Real progress bar — filled to `value`%. Active stages get a subtle sheen
   overlay (disabled under prefers-reduced-motion). */
function ProgressBar({ value, tone }: { value: number; tone: "copper" | "green" }) {
  const pct = Math.max(0, Math.min(100, value))
  const fill = tone === "green"
    ? "linear-gradient(90deg, #2E9E70, #4BD39B)"
    : "linear-gradient(90deg, #9E3F2E, #E0836A)"
  const glow = tone === "green" ? "rgba(61,190,139,0.35)" : "rgba(212,105,90,0.40)"
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ghost }}>
          Avanzamento
        </span>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: tone === "green" ? "#4BD39B" : "#E0836A" }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div className={tone === "copper" ? "stage-progress-fill" : undefined} style={{
          width: `${pct}%`, height: "100%", borderRadius: 99,
          background: fill, boxShadow: `0 0 12px ${glow}`,
          transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  )
}

/* Horizontal arrow connector between cards in a row */
function ArrowH({ lit }: { lit: boolean }) {
  const color = lit ? "rgba(224,131,106,0.65)" : "rgba(255,255,255,0.16)"
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 34, pointerEvents: "none" }}>
      <svg width="30" height="16" viewBox="0 0 30 16" fill="none" aria-hidden="true">
        <line x1="2" y1="8" x2="23" y2="8" stroke={color} strokeWidth="1.6" strokeDasharray="3 2.5" />
        <path d="M20 4.5L24.5 8 20 11.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

/* Right-side wrap connector between row 1 and row 2 (straight L→R reading in both rows) */
function RowWrap({ lit }: { lit: boolean }) {
  const color = lit ? "rgba(224,131,106,0.55)" : "rgba(255,255,255,0.14)"
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "0 6px", margin: "6px 0" }}>
      <svg width="54" height="38" viewBox="0 0 54 38" fill="none" style={{ display: "block" }} aria-hidden="true">
        <path d="M2 4 L2 20 Q2 34 16 34 L52 34" stroke={color} strokeWidth="1.6" strokeDasharray="3.5 2.5" fill="none" strokeLinecap="round" />
        <path d="M48 29.5L52.5 34 48 38.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color, marginLeft: 5 }}>
        continua
      </span>
    </div>
  )
}

/* ── Card ─────────────────────────────────────────────────── */
function StageCard({ stage, index, renderAction }: {
  stage: ProjectStage
  index: number
  renderAction?: (s: ProjectStage) => React.ReactNode
}) {
  const isActive = stage.status === "active"
  const isDone = stage.status === "done"
  const isLocked = stage.status === "locked"

  /* Opaque, matte, LIGHTER than the page — cards read as physical tiles. */
  const surface = isActive ? "#2b2421" : isDone ? "#23271f" : "#262730"
  const borderCol = isActive ? "rgba(174,83,80,0.42)" : isDone ? "rgba(61,190,139,0.30)" : "rgba(255,255,255,0.10)"
  const shadow = isActive
    ? "0 8px 30px rgba(174,83,80,0.16), 0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10)"
    : "0 6px 22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.07)"

  const titleColor = isLocked ? "rgba(255,255,255,0.50)" : T.text
  const action = renderAction?.(stage)

  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: surface,
      border: `1px solid ${borderCol}`,
      borderRadius: 18,
      padding: "20px 20px 18px",
      boxShadow: shadow,
      display: "flex", flexDirection: "column", gap: 13,
      opacity: isLocked ? 0.82 : 1,
      transition: "box-shadow 0.3s cubic-bezier(0.32,0.72,0,1)",
    }}>
      {/* Top: number pill + status icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em",
          color: isActive ? "#E0836A" : "rgba(255,255,255,0.40)",
          padding: "4px 9px", borderRadius: 99,
          background: isActive ? "rgba(174,83,80,0.14)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isActive ? "rgba(174,83,80,0.28)" : "rgba(255,255,255,0.09)"}`,
        }}>
          FASE {String(index + 1).padStart(2, "0")}
        </span>
        <StatusIcon status={stage.status} />
      </div>

      {/* Title + approval badge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <h4 style={{
          fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em",
          lineHeight: 1.3, color: titleColor, margin: 0, flex: 1, minWidth: 0,
        }}>
          {stage.title}
        </h4>
        {stage.approvalState !== "none" && (
          <Badge tone={APPROVAL_STATE[stage.approvalState].tone}>
            {APPROVAL_STATE[stage.approvalState].label}
          </Badge>
        )}
      </div>

      {/* Admin description */}
      {stage.deliverableNote && (
        <p style={{
          fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.6,
          color: isLocked ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.72)",
          margin: 0, whiteSpace: "pre-wrap",
          display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {stage.deliverableNote}
        </p>
      )}

      {/* Deliverable link */}
      {stage.deliverableUrl && (
        <a href={stage.deliverableUrl} target="_blank" rel="noreferrer" className="portal-link" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: MONO, fontSize: 11.5, color: T.copperLt, textDecoration: "none",
        }}>
          <Icon name="external" size={13} /> Apri deliverable
        </a>
      )}

      {/* Action slot */}
      {action && <div>{action}</div>}

      {/* Footer: progress bar + dates, pinned to bottom */}
      <div style={{ marginTop: "auto", paddingTop: 4, display: "flex", flexDirection: "column", gap: 10 }}>
        {(isActive || isDone) && (
          <ProgressBar value={stage.progress} tone={isDone ? "green" : "copper"} />
        )}
        {(stage.startedAt || stage.completedAt) && (
          <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.34)", margin: 0, letterSpacing: "0.04em" }}>
            {stage.startedAt ? `Avviata ${fmtDate(stage.startedAt)}` : ""}
            {stage.startedAt && stage.completedAt ? " · " : ""}
            {stage.completedAt ? `Chiusa ${fmtDate(stage.completedAt)}` : ""}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Grid ─────────────────────────────────────────────────── */
export default function StageGrid({ stages, renderAction }: {
  stages: ProjectStage[]
  renderAction?: (s: ProjectStage) => React.ReactNode
}) {
  if (stages.length === 0) return null

  const sorted = [...stages].sort((a, b) => a.orderIndex - b.orderIndex)
  const COLS = 3
  const rows: ProjectStage[][] = []
  for (let i = 0; i < sorted.length; i += COLS) rows.push(sorted.slice(i, i + COLS))

  const lastLitIdx = sorted.reduce((acc, s, i) => (s.status !== "locked" ? i : acc), -1)

  return (
    <>
      <style>{`
        @keyframes stageFillSheen { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .stage-progress-fill { position: relative; }
        .stage-progress-fill::after {
          content: ""; position: absolute; inset: 0; border-radius: 99px;
          background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: stageFillSheen 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .stage-progress-fill::after { animation: none; display: none; }
        }
        @media (max-width: 680px) {
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
                  return (
                    <React.Fragment key={stage.id}>
                      <StageCard stage={stage} index={globalIdx} renderAction={renderAction} />
                      {colIdx < row.length - 1 && (
                        <div className="stage-grid-arrow">
                          <ArrowH lit={globalIdx < lastLitIdx} />
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
