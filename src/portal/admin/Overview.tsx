import React from "react"
import type { AdminHome, PortalAction } from "../../lib/api"
import { fmtEur } from "../../lib/api"
import {
  Empty, Glass, Icon, Row, SectionTitle, Stat, Timeline,
  type IconName, type Tone,
} from "../ui"

const ACTION_META: Record<string, { icon: IconName; tone: Tone }> = {
  review_project: { icon: "folder", tone: "amber" },
  confirm_meeting: { icon: "calendar", tone: "copper" },
  reply_ticket: { icon: "ticket", tone: "red" },
  answer_chat: { icon: "chat", tone: "silver" },
  overdue_invoice: { icon: "euro", tone: "red" },
}

export default function Overview({ home, onAction }: {
  home: AdminHome
  onAction: (a: PortalAction) => void
}) {
  const { kpi } = home

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Stat label="Clienti attivi" value={String(kpi.activeClients)} icon="users" tone="silver" />
        <Stat label="Progetti in corso" value={String(kpi.projectsInProgress)} icon="layers" tone="copper" />
        <Stat label="Da incassare" value={fmtEur(kpi.invoicesPendingTotal)} icon="euro" tone={kpi.invoicesPendingCount > 0 ? "amber" : "green"}
          hint={kpi.invoicesPendingCount > 0 ? `${kpi.invoicesPendingCount} fatture aperte` : "tutto incassato"} />
        <Stat label="Ticket aperti" value={String(kpi.ticketsOpen)} icon="ticket" tone={kpi.ticketsOpen > 0 ? "red" : "green"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, alignItems: "start" }}>
        <Glass variant="panel" style={{ padding: 20 }}>
          <SectionTitle kicker="Coda operativa" title="Richiede la tua attenzione" sub={home.actions.length === 0 ? undefined : `${home.actions.length} elementi in coda`} />
          {home.actions.length === 0 ? (
            <Empty icon="checkCircle" title="Coda vuota" hint="Nessuna richiesta dai clienti in attesa." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 14 }}>
              {home.actions.map(a => {
                const meta = ACTION_META[a.kind] ?? { icon: "bolt" as IconName, tone: "silver" as Tone }
                return (
                  <Row
                    key={a.id}
                    icon={meta.icon}
                    iconTone={meta.tone}
                    title={a.label}
                    sub={a.sublabel}
                    right={<Icon name="chevronR" size={13} />}
                    onClick={() => onAction(a)}
                  />
                )
              })}
            </div>
          )}
        </Glass>

        <Glass variant="panel" style={{ padding: 20 }}>
          <SectionTitle kicker="Diario" title="Attività recente" />
          <div style={{ marginTop: 14 }}>
            {home.events.length === 0 ? (
              <Empty icon="sparkle" title="Nessuna attività" hint="Qui scorre il giornale di tutti i progetti." />
            ) : (
              <Timeline events={home.events} showProject showClient limit={14} />
            )}
          </div>
        </Glass>
      </div>
    </div>
  )
}
