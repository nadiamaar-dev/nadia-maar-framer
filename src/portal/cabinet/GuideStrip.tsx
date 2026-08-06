import React from "react"
import type { ClientHome } from "../../lib/api"
import { DISPLAY, Glass, MONO, T } from "../ui"

type Step = { key: string; label: string; hint: string }

const STEPS: Step[] = [
  { key: "brief",       label: "Brief",                  hint: "Raccontaci il progetto: obiettivi, budget e tempi." },
  { key: "valutazione", label: "Valutazione & Contratto", hint: "Valutiamo il brief, firmi il contratto in «Documenti» e saldi l'acconto in «Fatture»." },
  { key: "design",      label: "Design",                  hint: "Rivedi le proposte nel progetto e premi «Approva fase» per procedere." },
  { key: "sviluppo",    label: "Sviluppo",                hint: "Segui i progressi delle fasi; segnala eventuali problemi in «Richieste»." },
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
    /* Frosted, like every other card in the cabinet — this one used to be a
       flat solid slab (T.surface with no blur), so it read as a plainer,
       older-generation panel next to the frosted work cards around it. */
    <Glass variant="work" style={{ padding: 0, position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes gsPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.55); }
        }
        .gs-pulse { animation: gsPulse 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .gs-pulse { display: none; } }
      `}</style>

      {/* top highlight spray */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 80,
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Header ──────────────────────────────── */}
      <div style={{
        padding: "16px 22px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.11em",
          textTransform: "uppercase" as const,
          color: "#FFFFFF",
        }}>
          <span style={{ color: T.copperTx }}>//</span>
          <span>Come procede il tuo progetto</span>
        </div>
        <span style={{
          fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em",
          fontWeight: 600,
          color: cur === STEPS.length - 1 ? "#10B981" : T.copperTx,
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
            const nodeCol = done ? "#fff" : active ? T.copperTx : "#FFFFFF"

            /* line colour — a done segment now reads as filled progress
               rather than a slightly brighter hairline */
            const lineCol = done
              ? "rgba(16,185,129,0.60)"
              : "rgba(255,255,255,0.08)"
            const lineGlow = done ? "0 0 6px rgba(16,185,129,0.30)" : "none"

            /* label */
            const labelCol = "#FFFFFF"

            return (
              <div key={s.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* connector + circle row */}
                <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 2, borderRadius: 1, background: i === 0 ? "transparent" : lineCol, boxShadow: i === 0 ? "none" : lineGlow }} />
                  {/* Pulse ring is a CHILD of the sized circle div, not a
                      sibling in an unsized wrapper — a wrapper only as big
                      as its static content still counts the ring's absolute
                      -5px bleed toward its scrollWidth, which overflowed the
                      row. StageGrid's own "in corso" ring avoids this by
                      nesting the same way. */}
                  <div style={{
                    width: active ? 40 : 34,
                    height: active ? 40 : 34,
                    borderRadius: "50%",
                    flexShrink: 0,
                    position: "relative", zIndex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: nodeBg,
                    border: `2px solid ${nodeBd}`,
                    color: nodeCol,
                    boxShadow: active ? "0 0 0 4px rgba(184,50,64,0.12), 0 0 16px rgba(184,50,64,0.20)" : done ? "0 0 10px rgba(16,185,129,0.20)" : "none",
                    transition: "all 0.3s ease",
                  }}>
                    {active && (
                      <span aria-hidden className="gs-pulse" style={{
                        position: "absolute", inset: -5, borderRadius: "50%",
                        border: "1.5px solid rgba(184,50,64,0.55)",
                      }} />
                    )}
                    {done
                      ? <Check />
                      : <span style={{ fontFamily: MONO, fontSize: active ? 13 : 11, fontWeight: 700, letterSpacing: "0.02em" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                    }
                  </div>
                  <div style={{ flex: 1, height: 2, borderRadius: 1, background: isLast ? "transparent" : lineCol, boxShadow: isLast ? "none" : lineGlow }} />
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
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "#10B981" : active ? "rgba(184,50,64,0.18)" : "rgba(255,255,255,0.04)",
                  border: `2px solid ${done ? "#10B981" : active ? "rgba(184,50,64,0.70)" : "rgba(255,255,255,0.10)"}`,
                  color: done ? "#fff" : active ? T.copperTx : "#FFFFFF",
                  boxShadow: active ? "0 0 0 4px rgba(184,50,64,0.12)" : "none",
                }}>
                  {done
                    ? <Check />
                    : <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                  }
                </div>
                <span style={{
                  fontFamily: DISPLAY, fontSize: 14, fontWeight: active ? 700 : 500,
                  color: "#FFFFFF",
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
          color: T.copperTx,
        }}>
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>
            {String(cur + 1).padStart(2, "0")}
          </span>
        </div>
        <div>
          <p style={{
            fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.11em",
            textTransform: "uppercase" as const,
            color: T.copperTx, margin: "0 0 5px",
          }}>
            Passo {cur + 1} · {STEPS[cur].label}
          </p>
          <p className="pt-body" style={{
            fontFamily: DISPLAY, fontSize: 14.5, lineHeight: 1.65,
            color: "#FFFFFF", margin: 0,
          }}>
            {STEPS[cur].hint}
          </p>
        </div>
      </div>
    </Glass>
  )
}
