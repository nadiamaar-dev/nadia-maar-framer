import React from "react"
import type { ClientHome } from "../../lib/api"
import { DISPLAY, Icon, MONO, T, TL, type IconName } from "../ui"

type Step = { key: string; label: string; hint: string; icon: IconName }

const STEPS: Step[] = [
  { key: "brief", label: "Brief", hint: "Raccontaci il progetto: obiettivi, budget e tempi.", icon: "send" },
  { key: "valutazione", label: "Valutazione & Contratto", hint: "Valutiamo il brief, firmi il contratto in «Documenti» e saldi l'acconto in «Fatture».", icon: "doc" },
  { key: "design", label: "Design", hint: "Rivedi le proposte nel progetto e premi «Approva fase» per procedere.", icon: "sparkle" },
  { key: "sviluppo", label: "Sviluppo", hint: "Segui i progressi delle fasi; segnala eventuali problemi in «Supporto».", icon: "layers" },
  { key: "consegna", label: "Consegna", hint: "Ricevi accessi e materiali finali nella scheda «Consegna» del progetto.", icon: "checkCircle" },
]

/** Maps the client's current situation to the journey step to highlight. */
function currentStep(home: ClientHome): number {
  if (home.projects.length === 0) return 0
  const primary = home.projects.find(p => p.status === "active") ?? home.projects[0]
  if (primary.status === "pending_approval") return 1
  if (primary.status === "completed") return 4
  // active → infer from the furthest-reached stage
  const stages = home.stagesByProject[primary.id] ?? []
  if (stages.length === 0) return 1
  const activeStage = stages.find(s => s.status === "active")
  const idx = activeStage ? activeStage.orderIndex : stages.filter(s => s.status === "done").length
  // seeded order: 1 analisi, 2 preparazione, 3 design, 4 sviluppo, 5 testing, 6 consegna
  if (idx <= 2) return 1
  if (idx === 3) return 2
  if (idx <= 5) return 3
  return 4
}

/** Client onboarding guide — shows the journey so the client always knows the next step. */
export default function GuideStrip({ home }: { home: ClientHome }) {
  const cur = currentStep(home)
  return (
    <div className="gs-root" style={{
      padding: "18px 20px", borderRadius: 16,
      background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
    }}>
      <style>{`
        @media (max-width: 600px) {
          .gs-root { padding: 16px 15px !important; }
          .gs-steps { flex-direction: column !important; gap: 4px !important; }
          .gs-step { flex: 1 1 auto !important; width: 100% !important; flex-direction: row !important; align-items: center !important; text-align: left !important; gap: 12px !important; padding: 5px 0 !important; }
          .gs-label { font-size: 13px !important; }
          .gs-sep { display: none !important; }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Icon name="flag" size={13} style={{ color: T.copperLt }} />
        <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: T.copperLt, margin: 0 }}>
          Come procede il tuo progetto
        </p>
      </div>

      <div className="gs-steps" style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
        {STEPS.map((s, i) => {
          const done = i < cur
          const active = i === cur
          const fg = done ? T.green : active ? T.copperLt : T.faint
          const bg = done ? "rgba(75,211,155,0.14)" : active ? "rgba(161,44,56,0.16)" : "rgba(255,255,255,0.05)"
          const bd = done ? "rgba(75,211,155,0.34)" : active ? "rgba(161,44,56,0.40)" : T.border
          return (
            <React.Fragment key={s.key}>
              <div className="gs-step" style={{ flex: "1 1 130px", minWidth: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, textAlign: "center" }}>
                <span style={{
                  width: 38, height: 38, borderRadius: 11, position: "relative", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: bg, border: `1px solid ${bd}`, color: fg,
                  boxShadow: active ? "0 0 16px rgba(161,44,56,0.30)" : "none",
                }}>
                  <Icon name={done ? "check" : s.icon} size={17} />
                  <span style={{
                    position: "absolute", top: -6, right: -6,
                    width: 16, height: 16, borderRadius: 99,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? T.green : active ? T.copper : "rgba(255,255,255,0.10)",
                    color: done || active ? "#122" : T.faint,
                    fontFamily: MONO, fontSize: 8.5, fontWeight: 800,
                  }}>{i + 1}</span>
                </span>
                <span className="gs-label" style={{
                  fontFamily: DISPLAY, fontSize: 11.5, fontWeight: active ? 800 : 600,
                  color: active ? TL.text : done ? T.muted : T.faint, lineHeight: 1.25,
                }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="gs-sep" style={{ flex: "0 0 16px", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 18 }}>
                  <span style={{ color: i < cur ? T.green : T.ghost, opacity: 0.6, fontSize: 13 }}>›</span>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      <div style={{
        marginTop: 14, padding: "10px 14px", borderRadius: 11,
        background: "rgba(161,44,56,0.08)", border: "1px solid rgba(161,44,56,0.20)",
        display: "flex", gap: 9, alignItems: "flex-start",
      }}>
        <Icon name="sparkle" size={14} style={{ color: T.copperLt, marginTop: 2 }} />
        <p style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.5, color: T.muted, margin: 0 }}>
          <span style={{ color: T.text, fontWeight: 700 }}>Passo {cur + 1} · {STEPS[cur].label}.</span>{" "}
          {STEPS[cur].hint}
        </p>
      </div>
    </div>
  )
}
