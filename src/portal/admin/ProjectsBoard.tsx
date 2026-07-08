import React, { useState } from "react"
import type { AdminHome, ProjectStatus } from "../../lib/api"
import { fmtDate, isUnreadFor } from "../../lib/api"
import { Badge, DISPLAY, Empty, Glass, Icon, MONO, PROJECT_STATUS, SectionTitle, T, Tabs } from "../ui"

type Filter = "tutti" | ProjectStatus

export default function ProjectsBoard({ home, onOpenProject }: {
  home: AdminHome
  onOpenProject: (id: string) => void
}) {
  const [filter, setFilter] = useState<Filter>("tutti")
  const counts = (s: ProjectStatus) => home.projects.filter(p => p.status === s).length
  const list = filter === "tutti" ? home.projects : home.projects.filter(p => p.status === filter)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle kicker="Produzione" title="Progetti" sub={`${home.projects.length} progett${home.projects.length === 1 ? "o" : "i"} in archivio`} />

      <Tabs<Filter>
        items={[
          { id: "tutti", label: "Tutti" },
          { id: "pending_approval", label: "In valutazione", badge: counts("pending_approval") || undefined },
          { id: "active", label: "In corso", badge: counts("active") || undefined },
          { id: "paused", label: "In pausa" },
          { id: "completed", label: "Completati" },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <Glass variant="panel" style={{ padding: 12 }}>
        {list.length === 0 ? (
          <Empty icon="folder" title="Nessun progetto" hint="In questo stato non c'è nulla al momento." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {list.map(p => {
              const st = PROJECT_STATUS[p.status]
              const unread = home.threads.filter(c => c.projectId === p.id && isUnreadFor(c, "admin")).length
              return (
                <button
                  key={p.id}
                  className="portal-row"
                  onClick={() => onOpenProject(p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 13, width: "100%", textAlign: "left",
                    padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                    background: "transparent", border: "1px solid transparent",
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.faint,
                  }}>
                    <Icon name="folder" size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 800, color: T.text }}>{p.name}</span>
                      <Badge tone={st.tone} dot>{st.label}</Badge>
                      {unread > 0 && <Badge tone="copper" dot>{unread} da leggere</Badge>}
                    </div>
                    <p style={{ fontFamily: MONO, fontSize: 10, color: T.faint, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.clientName} · {fmtDate(p.createdAt)}
                    </p>
                  </div>
                  <Icon name="chevronR" size={14} />
                </button>
              )
            })}
          </div>
        )}
      </Glass>
    </div>
  )
}
