import React from "react"
import type { ClientHome } from "../../lib/api"
import { DISPLAY, MONO, T, TL } from "../ui"

type Step = { key: string; label: string; hint: string }

const STEPS: Step[] = [
  { key: "brief",       label: "Brief",                  hint: "Raccontaci il progetto: obiettivi, budget e tempi." },
  { key: "valutazione", label: "Valutazione & Contratto", hint: "Valutiamo il brief, firmi il contratto in «Documenti» e saldi l'acconto in «Fatture»." },
  { key: "design",      label: "Design",                  hint: "Rivedi le proposte nel progetto e premi «Approva fase» per procedere." },
  { key: "sviluppo",    label: "Sviluppo",                hint: "Segui i progressi delle fasi; segnala eventuali problemi in «Supporto»." },
  { key: "consegna",    label: "Consegna",                hint: "Ricevi accessi e materiali finali nella scheda «Consegna» del progetto." },
]

function currentStep(home: ClientHome): number {
  if (home.projects.length === 0) return 0
  const primary = home.projects.find(p => p.status === "active") ?? home.projects[0]
  if (primary.status === "pending_approval") return 1
  if (primary.status === "completed") return 4
  const stages = home.stagesByProject[primary.id] ?? []
  if (stages.length === 0) return 1
  const activeStage = stages.find(s => s.status === "active")
  const idx = activeStage ? activeStage.orderIndex : stages.filter(s => s.status === "done").length
  if (idx <= 2) return 1
  if (idx === 3) return 2
  if (idx <= 5) return 3
  return 4
}

/* Checkmark SVG */
function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function GuideStrip({ home }: { home: ClientHome }) {
  const cur = currentStep(home)

  return (
    <div style={{
      borderRadius: 16,
      background: "rgba(255,255,255,0.008)",
      border: "1px solid rgba(255,255,255,0.16)",
      overflow: "hidden",
    }}>

      {/* ── Header ──────────────────────────────── */}
      <div style={{
        padding: "16px 22px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.20em",
          textTransform: "uppercase" as const,
          color: "rgba(255,255,255,0.40)",
        }}>
          <span style={{ color: "rgba(184,50,64,0.60)" }}>//</span>
          <span>Come procede il tuo progetto</span>
        </div>
        <span style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em",
          fontWeight: 600,
          color: cur === STEPS.length - 1 ? "#10B981" : "rgba(184,50,64,0.70)",
        }}>
          {cur + 1} / {STEPS.length}
        </span>
      </div>

      {/* ── Desktop steps ───────────────────────── */}
      <div style={{ padding: "24px 22px 8px" }}>
        <style>{`
          @media (max-width: 640px) {
            .gs-desktop { display: none !important; }
            .gs-mobile  { display: flex !important; }
          }
          .gs-desktop { display: flex; }
          .gs-mobile  { display: none;  }
        `}</style>

        <div className="gs-desktop" style={{ alignItems: "flex-start", gap: 0 }}>
          {STEPS.map((s, i) => {
            const done   = i < cur
            const active = i === cur
            const isLast = i === STEPS.length - 1

            /* node colours */
            const nodeBg  = done
              ? "#10B981"
              : active
              ? "rgba(184,50,64,0.18)"
              : "rgba(255,255,255,0.04)"
            const nodeBd  = done
              ? "#10B981"
              : active
              ? "rgba(184,50,64,0.70)"
              : "rgba(255,255,255,0.12)"
            const nodeCol = done ? "#fff" : active ? "#BE3648" : "rgba(255,255,255,0.32)"

            /* line colour */
            const lineCol = done
              ? "rgba(16,185,129,0.35)"
              : "rgba(255,255,255,0.08)"

            /* label */
            const labelCol = active ? "#fff" : done ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.32)"

            return (
              <div key={s.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* connector + circle row */}
                <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 1, background: i === 0 ? "transparent" : lineCol }} />
                  <div style={{
                    width: active ? 40 : 34,
                    height: active ? 40 : 34,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: nodeBg,
                    border: `2px solid ${nodeBd}`,
                    color: nodeCol,
                    boxShadow: active ? "0 0 0 4px rgba(184,50,64,0.10)" : "none",
                    transition: "all 0.3s ease",
                  }}>
                    {done
                      ? <Check />
                      : <span style={{ fontFamily: MONO, fontSize: active ? 13 : 11, fontWeight: 700, letterSpacing: "0.02em" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                    }
                  </div>
                  <div style={{ flex: 1, height: 1, background: isLast ? "transparent" : lineCol }} />
                </div>

                {/* label */}
                <span style={{
                  fontFamily: DISPLAY,
                  fontSize: active ? 12.5 : 11.5,
                  fontWeight: active ? 700 : 500,
                  color: labelCol,
                  textAlign: "center",
                  lineHeight: 1.3,
                  maxWidth: 90,
                  paddingBottom: 16,
                }}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* ── Mobile ── */}
        <div className="gs-mobile" style={{ flexDirection: "column", gap: 8, paddingBottom: 16 }}>
          {STEPS.map((s, i) => {
            const done   = i < cur
            const active = i === cur
            if (!done && !active && i > cur + 1) return null  // show max next+1
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 14, opacity: i > cur ? 0.4 : 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "#10B981" : active ? "rgba(184,50,64,0.18)" : "rgba(255,255,255,0.04)",
                  border: `2px solid ${done ? "#10B981" : active ? "rgba(184,50,64,0.70)" : "rgba(255,255,255,0.10)"}`,
                  color: done ? "#fff" : active ? "#BE3648" : "rgba(255,255,255,0.32)",
                }}>
                  {done
                    ? <Check />
                    : <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                  }
                </div>
                <span style={{
                  fontFamily: DISPLAY, fontSize: 14, fontWeight: active ? 700 : 500,
                  color: active ? "#fff" : done ? "rgba(255,255,255,0.60)" : T.faint,
                }}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Current step hint ─────────────────── */}
      <div style={{
        padding: "14px 22px 18px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.012)",
        display: "flex", gap: 14, alignItems: "flex-start",
      }}>
        {/* Step number badge */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(184,50,64,0.25)",
          color: "rgba(184,50,64,0.70)",
        }}>
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>
            {String(cur + 1).padStart(2, "0")}
          </span>
        </div>
        <div>
          <p style={{
            fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: "rgba(184,50,64,0.60)", margin: "0 0 5px",
          }}>
            Passo {cur + 1} · {STEPS[cur].label}
          </p>
          <p style={{
            fontFamily: DISPLAY, fontSize: 14.5, lineHeight: 1.65,
            color: "rgba(255,255,255,0.72)", margin: 0,
          }}>
            {STEPS[cur].hint}
          </p>
        </div>
      </div>
    </div>
  )
}
