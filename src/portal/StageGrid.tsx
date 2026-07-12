import React from "react"
import type { ProjectStage } from "../lib/api"
import { fmtDate } from "../lib/api"
import { APPROVAL_STATE, Badge, DISPLAY, Icon, MONO, T, TL } from "./ui"

/* ── SVG icon paths ─────────────────────────────────────────── */
const PATH_CHECK = <><circle cx="12" cy="12" r="10" /><path d="M16 9l-5.5 6L8 12.5" /></>
const PATH_UNLOCK = <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 019.9-1" /></>
const PATH_LOCK   = <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>

function SvgIcon({ d, size = 18 }: { d: React.ReactNode; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      width={size} height={size} aria-hidden>
      {d}
    </svg>
  )
}

/* ── Progress bar ─────────────────────────────────────────────── */
function ProgressBar({ value, tone }: { value: number; tone: "copper" | "green" }) {
  const pct = Math.max(0, Math.min(100, value))
  const fill   = tone === "green" ? "linear-gradient(90deg,#2DA870,#4BD39B)" : "linear-gradient(90deg,#B04A38,#E0836A)"
  const glow   = tone === "green" ? "rgba(75,211,155,0.45)" : "rgba(224,131,106,0.50)"
  const label  = tone === "green" ? "#4BD39B" : "#F4A882"
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
          Avanzamento
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: label }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.09)", overflow: "hidden" }}>
        <div
          className={tone === "copper" ? "stage-progress-fill" : undefined}
          style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: fill, boxShadow: `0 0 10px ${glow}`, transition: "width 0.65s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </div>
    </div>
  )
}

/* ── Single timeline row ─────────────────────────────────────── */
function StageRow({ stage, index, isLast, renderAction }: {
  stage: ProjectStage
  index: number
  isLast: boolean
  renderAction?: (s: ProjectStage) => React.ReactNode
}) {
  const isActive = stage.status === "active"
  const isDone   = stage.status === "done"
  const isLocked = stage.status === "locked"

  const action = renderAction?.(stage)

  /* ── Circle config ── */
  const circle = isActive
    ? { bg: "rgba(224,131,106,0.22)", border: "rgba(224,131,106,0.55)", color: "#F4A882", glow: "0 0 22px rgba(224,131,106,0.40), 0 0 6px rgba(224,131,106,0.25)", icon: PATH_UNLOCK }
    : isDone
    ? { bg: "rgba(75,211,155,0.18)",  border: "rgba(75,211,155,0.46)",  color: "#4BD39B", glow: "0 0 16px rgba(75,211,155,0.28)", icon: PATH_CHECK }
    : { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.32)", glow: "none", icon: PATH_LOCK }

  /* ── Connector line ── */
  const lineColor = isDone
    ? "linear-gradient(180deg, rgba(75,211,155,0.45) 0%, rgba(75,211,155,0.20) 100%)"
    : isActive
    ? "linear-gradient(180deg, rgba(224,131,106,0.42) 0%, rgba(255,255,255,0.08) 100%)"
    : "rgba(255,255,255,0.08)"

  /* ── Content card (only active + done) ── */
  const cardBg     = isActive ? "rgba(18,32,44,0.72)"   : "rgba(12,40,28,0.58)"
  const cardBorder = isActive ? "rgba(224,131,106,0.32)" : "rgba(75,211,155,0.22)"
  const descColor  = "rgba(255,255,255,0.64)"

  const numLabel = String(index + 1).padStart(2, "0")

  return (
    <div style={{ display: "flex", gap: 0, position: "relative" }}>
      {/* ── Left: circle + line ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 64, flexShrink: 0 }}>
        {/* Circle */}
        <div style={{
          width: isActive ? 48 : 42, height: isActive ? 48 : 42,
          borderRadius: "50%", flexShrink: 0,
          background: circle.bg,
          border: `1.5px solid ${circle.border}`,
          color: circle.color,
          boxShadow: circle.glow,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", zIndex: 1,
          transition: "all 0.3s ease",
        }}>
          {isLocked
            ? <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{numLabel}</span>
            : <SvgIcon d={circle.icon} size={isActive ? 19 : 17} />
          }
          {/* Active pulse ring */}
          {isActive && (
            <div className="stage-pulse" style={{
              position: "absolute", inset: -5, borderRadius: "50%",
              border: "1.5px solid rgba(224,131,106,0.28)",
            }} />
          )}
        </div>

        {/* Connector */}
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: 20, marginTop: 4,
            background: lineColor,
            borderRadius: 1,
          }} />
        )}
      </div>

      {/* ── Right: content ── */}
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 28, paddingTop: 2 }}>
        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          minHeight: isActive ? 48 : 42,
        }}>
          {/* Fase label */}
          <span style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: "0.20em", textTransform: "uppercase",
            color: circle.color, flexShrink: 0,
          }}>
            FASE {numLabel}
          </span>

          {/* Title */}
          <h4 style={{
            fontFamily: DISPLAY,
            fontSize: isActive ? 17 : isLocked ? 14 : 15,
            fontWeight: isActive ? 800 : isLocked ? 500 : 700,
            letterSpacing: "-0.01em", lineHeight: 1.25,
            color: isLocked ? "rgba(255,255,255,0.38)" : isActive ? "#F5EDE8" : "#D4EEE0",
            margin: 0, flex: 1, minWidth: 0,
          }}>
            {stage.title}
          </h4>

          {/* Status pill */}
          <div style={{ flexShrink: 0 }}>
            {isDone && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 99,
                background: "rgba(75,211,155,0.12)", border: "1px solid rgba(75,211,155,0.28)",
                fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.06em",
                color: "#4BD39B",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4BD39B" }} />
                Completata
              </span>
            )}
            {isActive && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 99,
                background: "rgba(224,131,106,0.14)", border: "1px solid rgba(224,131,106,0.34)",
                fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.06em",
                color: "#F4A882",
              }}>
                <span className="stage-dot-pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: "#F4A882" }} />
                In corso
              </span>
            )}
            {isLocked && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "2px 9px", borderRadius: 99,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.28)",
              }}>
                In attesa
              </span>
            )}
          </div>
        </div>

        {/* Approval state badge */}
        {stage.approvalState !== "none" && (
          <div style={{ marginTop: 6 }}>
            <Badge tone={APPROVAL_STATE[stage.approvalState].tone}>
              {APPROVAL_STATE[stage.approvalState].label}
            </Badge>
          </div>
        )}

        {/* Content card — only active + done */}
        {!isLocked && (
          <div style={{
            marginTop: 12,
            padding: "18px 20px",
            borderRadius: 16,
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderLeft: isActive ? "3px solid rgba(224,131,106,0.70)" : `1px solid ${cardBorder}`,
            backdropFilter: "blur(14px) saturate(1.4)",
            WebkitBackdropFilter: "blur(14px) saturate(1.4)",
            boxShadow: isActive
              ? "0 0 0 1px rgba(224,131,106,0.08), 0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.07)"
              : "inset 0 1px 0 rgba(75,211,155,0.07)",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            {/* Description */}
            {stage.deliverableNote && (
              <p style={{
                fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.65,
                color: descColor, margin: 0, whiteSpace: "pre-wrap",
                display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {stage.deliverableNote}
              </p>
            )}

            {/* Progress — active only */}
            {isActive && (
              <ProgressBar value={stage.progress} tone="copper" />
            )}

            {/* Deliverable link */}
            {stage.deliverableUrl && (
              <a
                href={stage.deliverableUrl}
                target="_blank" rel="noreferrer"
                className="portal-link"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: MONO, fontSize: 11, color: T.copperLt, textDecoration: "none",
                }}
              >
                <Icon name="external" size={12} /> Apri deliverable
              </a>
            )}

            {/* Actions — injected from Dossier */}
            {action && <div style={{ paddingTop: 2 }}>{action}</div>}

            {/* Dates */}
            {(stage.startedAt || stage.completedAt) && (
              <p style={{
                fontFamily: MONO, fontSize: 9.5, color: "rgba(255,255,255,0.28)",
                margin: 0, letterSpacing: "0.04em",
              }}>
                {stage.startedAt ? `Avviata ${fmtDate(stage.startedAt)}` : ""}
                {stage.startedAt && stage.completedAt ? "  ·  " : ""}
                {stage.completedAt ? `Chiusa ${fmtDate(stage.completedAt)}` : ""}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main export ────────────────────────────────────────────── */
export default function StageGrid({ stages, renderAction }: {
  stages: ProjectStage[]
  renderAction?: (s: ProjectStage) => React.ReactNode
}) {
  if (stages.length === 0) return null

  const sorted = [...stages].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <>
      <style>{`
        @keyframes stageFillSheen {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .stage-progress-fill { position: relative; }
        .stage-progress-fill::after {
          content: ""; position: absolute; inset: 0; border-radius: 99px;
          background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: stageFillSheen 2.8s ease-in-out infinite;
        }
        @keyframes stagePulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.6); }
        }
        .stage-pulse { animation: stagePulse 2s ease-in-out infinite; }
        @keyframes stageDotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .stage-dot-pulse { animation: stageDotPulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .stage-progress-fill::after,
          .stage-pulse,
          .stage-dot-pulse { animation: none; }
          .stage-pulse { display: none; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {sorted.map((stage, i) => (
          <StageRow
            key={stage.id}
            stage={stage}
            index={i}
            isLast={i === sorted.length - 1}
            renderAction={renderAction}
          />
        ))}
      </div>
    </>
  )
}
