import React, { useMemo, useState } from "react"
import type { AdminHome, ClientRecord } from "../../lib/api"
import { fmtDate, fmtEur } from "../../lib/api"
import {
  Avatar, Badge, CLIENT_PLAN, CLIENT_STATUS, DISPLAY, Empty, Glass, Icon, Input,
  MONO, SectionTitle, T,
} from "../ui"
import ClientWorkspace from "./ClientWorkspace"

export default function Clients({ clients, home, adminId, reload, onOpenProject }: {
  clients: ClientRecord[]
  home: AdminHome
  adminId: string
  reload: () => void
  onOpenProject: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients
    return clients.filter(c =>
      c.company.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q))
  }, [clients, query])

  const selected = clients.find(c => c.id === selectedId)
  if (selected) {
    return (
      <ClientWorkspace
        client={selected}
        home={home}
        adminId={adminId}
        onBack={() => setSelectedId(null)}
        reload={reload}
        onOpenProject={onOpenProject}
      />
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="CRM"
        title="Clienti"
        sub={`${clients.length} client${clients.length === 1 ? "e" : "i"} registrat${clients.length === 1 ? "o" : "i"}`}
        right={
          <div style={{ position: "relative", width: 240 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.ghost, display: "flex" }}>
              <Icon name="search" size={13} />
            </span>
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca cliente…" style={{ paddingLeft: 32 }} />
          </div>
        }
      />

      <Glass variant="panel" style={{ padding: 12 }}>
        {filtered.length === 0 ? (
          <Empty icon="users" title={query ? "Nessun risultato" : "Nessun cliente"} hint={query ? "Prova con un altro termine." : "I clienti registrati appariranno qui."} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filtered.map(c => {
              const cs = CLIENT_STATUS[c.status]
              const cp = CLIENT_PLAN[c.plan]
              return (
                <button
                  key={c.id}
                  className="portal-row"
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 13, width: "100%", textAlign: "left",
                    padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                    background: "transparent", border: "1px solid transparent",
                  }}
                >
                  <Avatar name={c.company} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 800, color: T.text }}>{c.company}</span>
                      <Badge tone={cs.tone} dot>{cs.label}</Badge>
                      <Badge tone={cp.tone}>{cp.label}</Badge>
                    </div>
                    <p style={{ fontFamily: MONO, fontSize: 10, color: T.faint, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.contact} · {c.email}{c.phone ? ` · ${c.phone}` : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
                    <MiniStat label="progetti" value={String(c.projectsActive)} />
                    <MiniStat label="da incassare" value={c.invoicePendingAmount > 0 ? fmtEur(c.invoicePendingAmount) : "—"} warn={c.invoicePendingAmount > 0} />
                    <MiniStat label="ticket" value={String(c.ticketsOpen)} warn={c.ticketsOpen > 0} />
                    <span style={{ fontFamily: MONO, fontSize: 9, color: T.ghost }}>{c.joinedAt ? fmtDate(c.joinedAt) : ""}</span>
                    <Icon name="chevronR" size={14} />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Glass>
    </div>
  )
}

function MiniStat({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ textAlign: "right", minWidth: 60 }}>
      <p style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: warn ? T.amber : T.muted, margin: 0 }}>{value}</p>
      <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ghost, margin: "2px 0 0" }}>{label}</p>
    </div>
  )
}
