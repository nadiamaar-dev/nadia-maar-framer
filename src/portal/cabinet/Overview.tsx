import React from "react"
import type { ClientHome, PortalAction } from "../../lib/api"
import { fmtDateTime, fmtEur, isUnreadFor } from "../../lib/api"
import GuideStrip from "./GuideStrip"
import {
  DISPLAY, Empty, Glass, Icon, MONO, PROJECT_STATUS, Row, SectionTitle, Stat, T, TL, Timeline,
  type IconName, type Tone,
} from "../ui"

const ACTION_META: Record<string, { icon: IconName; tone: Tone }> = {
  approve_stage: { icon: "flag", tone: "amber" },
  sign_document: { icon: "edit", tone: "amber" },
  confirm_meeting: { icon: "calendar", tone: "copper" },
  pay_invoice: { icon: "euro", tone: "red" },
  unread_chat: { icon: "chat", tone: "silver" },
  start_project: { icon: "plus", tone: "copper" },
}

function Greeting({ name }: { name?: string }) {
  const now = new Date()
  const h = now.getHours()
  const saluto = h < 5 ? "Buonanotte" : h < 12 ? "Buongiorno" : h < 18 ? "Buon pomeriggio" : "Buona sera"
  const firstName = name?.split(" ")[0] ?? name?.split("@")[0]
  return (
    <div style={{ paddingBottom: 4 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10, fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: T.faint }}>
        <span style={{ color: T.copperLt }}>//</span>
        <span>{now.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</span>
      </div>
      <h1 style={{
        fontFamily: DISPLAY, fontSize: 29, fontWeight: 800,
        color: TL.text, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.15,
      }}>
        {saluto}{firstName ? (
          <>, <span style={{ color: T.copperLt }}>{firstName}</span></>
        ) : ""}
      </h1>
      <p style={{
        fontFamily: DISPLAY, fontSize: 14, color: TL.muted,
        margin: "6px 0 0", lineHeight: 1.5,
      }}>
        Ecco un riepilogo del tuo spazio di lavoro.
      </p>
    </div>
  )
}

export default function Overview({ home, onAction, onOpenProject, userName }: {
  home: ClientHome
  onAction: (a: PortalAction) => void
  onOpenProject: (id: string) => void
  userName?: string
}) {
  const active = home.projects.filter(p => p.status === "active")
  const dueSum = home.invoices
    .filter(i => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0)
  const nowKey = new Date().toISOString().slice(0, 16)
  const nextMeeting = home.meetings
    .filter(m => m.status === "confirmed" && m.datetime >= nowKey)
    .sort((a, b) => a.datetime.localeCompare(b.datetime))[0]
  const unread = home.threads.filter(c => isUnreadFor(c, "client")).length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <Greeting name={userName} />

      {/* Client journey guide */}
      <GuideStrip home={home} />

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Stat label="Progetti attivi" value={String(active.length)} icon="layers" tone="copper"
          hint={home.projects.length > active.length ? `${home.projects.length} totali` : undefined} />
        <Stat label="Da saldare" value={fmtEur(dueSum)} icon="euro" tone={dueSum > 0 ? "amber" : "green"} />
        <Stat label="Prossima riunione" value={nextMeeting ? fmtDateTime(nextMeeting.datetime) : "—"} icon="calendar" tone="silver" />
        <Stat label="Messaggi non letti" value={String(unread)} icon="chat" tone={unread > 0 ? "copper" : "steel"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, alignItems: "start" }}>
        {/* Action center */}
        <Glass variant="panel" style={{ padding: 20 }}>
          <SectionTitle kicker="Azioni" title="Da fare ora" sub={home.actions.length === 0 ? undefined : `${home.actions.length} in attesa di te`} />
          {home.actions.length === 0 ? (
            <Empty icon="checkCircle" title="Tutto in ordine" hint="Nessuna azione richiesta al momento." />
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

        {/* Activity */}
        <Glass variant="panel" style={{ padding: 20 }}>
          <SectionTitle kicker="Diario" title="Attività recente" />
          <div style={{ marginTop: 14 }}>
            {home.events.length === 0 ? (
              <Empty icon="sparkle" title="Ancora nessuna attività" hint="Qui vedrai avanzamenti, fatture e riunioni." />
            ) : (
              <Timeline events={home.events} showProject limit={10} />
            )}
          </div>
        </Glass>
      </div>

      {/* Projects strip */}
      {home.projects.length > 0 && (
        <Glass variant="panel" style={{ padding: 20 }}>
          <SectionTitle kicker="Progetti" title="I tuoi progetti" />
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 14 }}>
            {home.projects.slice(0, 4).map(p => {
              const st = PROJECT_STATUS[p.status]
              const stages = home.stagesByProject[p.id] ?? []
              const done = stages.filter(s => s.status === "done").length
              return (
                <Row
                  key={p.id}
                  icon="folder"
                  iconTone={st.tone}
                  title={p.name}
                  sub={stages.length > 0 ? `${done}/${stages.length} fasi completate` : st.label}
                  right={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: DISPLAY, fontSize: 11, color: T.faint }}>
                      {st.label}
                      <Icon name="chevronR" size={13} />
                    </span>
                  }
                  onClick={() => onOpenProject(p.id)}
                />
              )
            })}
          </div>
        </Glass>
      )}
    </div>
  )
}
