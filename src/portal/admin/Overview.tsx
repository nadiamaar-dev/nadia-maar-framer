import React, { useEffect, useState } from "react"
import type { AdminHome, PortalAction } from "../../lib/api"
import { fmtEur } from "../../lib/api"
import { fetchFunnelStats, type FunnelWeek } from "../../lib/api/analytics"
import {
  Collapsible, Empty, Glass, Icon, MONO, Row, SectionTitle, Stat, Timeline,
  type IconName, type Tone,
} from "../ui"

const ACTION_META: Record<string, { icon: IconName; tone: Tone }> = {
  revise_stage: { icon: "edit", tone: "red" },
  estimate_accepted: { icon: "checkCircle", tone: "green" },
  review_project: { icon: "folder", tone: "amber" },
  confirm_payment: { icon: "euro", tone: "copper" },
  confirm_meeting: { icon: "calendar", tone: "copper" },
  reply_ticket: { icon: "ticket", tone: "red" },
  answer_chat: { icon: "chat", tone: "silver" },
  overdue_invoice: { icon: "euro", tone: "red" },
}

/* ── La voronka in prima pagina ──────────────────────────────────────────
   Prima il traffico viveva in Impostazioni e i lead nella loro sezione:
   nessun posto mostrava il PERCORSO — sessioni che diventano demo aperte,
   demo che diventano configurazioni, configurazioni che diventano
   richieste. La carta legge la RPC funnel_stats: quattro settimane, una
   riga per settimana, e la settimana corrente in testa. */
function FunnelCard() {
  const [rows, setRows] = useState<FunnelWeek[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    fetchFunnelStats(4)
      .then(r => { if (alive) setRows(r.slice().reverse()) })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [])

  const COLS: { key: keyof FunnelWeek; label: string }[] = [
    { key: "sessions",  label: "Sessioni" },
    { key: "demo",      label: "Demo" },
    { key: "config",    label: "Config." },
    { key: "blueprint", label: "Blueprint" },
    { key: "leads",     label: "Richieste" },
    { key: "advanced",  label: "Avanzate" },
    { key: "won",       label: "Vinte" },
  ]

  return (
    <Glass variant="panel" style={{ padding: 20 }}>
      <SectionTitle kicker="Voronka" title="Dal visitatore alla richiesta"
        sub="Ultime 4 settimane · sessioni uniche per passo" />
      {failed ? (
        <Empty icon="alert" title="La voronka non risponde"
          hint="Serve la migrazione 22 (funnel_stats): finché non è applicata, questa carta resta vuota." />
      ) : !rows ? (
        <Empty title="Carico…" />
      ) : rows.every(r => r.sessions === 0 && r.leads === 0) ? (
        <Empty title="Ancora nessun dato"
          hint="Gli eventi si accumulano dal primo deploy con la migrazione applicata." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 11.5 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 10px 8px 0", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>Settimana</th>
                {COLS.map(c => (
                  <th key={c.key} style={{ textAlign: "right", padding: "6px 10px 8px", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.week} style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <td style={{ padding: "8px 10px 8px 0", color: i === 0 ? "#FFFFFF" : "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>
                    {r.week}{i === 0 ? " ·" : ""}
                  </td>
                  {COLS.map(c => (
                    <td key={c.key} style={{ textAlign: "right", padding: "8px 10px", color: i === 0 ? "#FFFFFF" : "rgba(255,255,255,0.60)", fontVariantNumeric: "tabular-nums" }}>
                      {String(r[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Glass>
  )
}

export default function Overview({ home, onAction, onGo }: {
  home: AdminHome
  onAction: (a: PortalAction) => void
  /** Le KPI sono la via d'ingresso alla sezione che riassumono. */
  onGo: (section: string) => void
}) {
  const { kpi } = home

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Ogni numero porta dove sta il suo dettaglio: leggere «2 fatture
          aperte» e poi doverle andare a cercare a mano è il tipo di attrito
          che fa aprire il gestionale una volta a settimana invece che ogni
          mattina. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: 12 }}>
        <Stat label="Clienti attivi" value={String(kpi.activeClients)} icon="users" tone="silver"
          onClick={() => onGo("clienti")} title="Apri l'elenco clienti" />
        <Stat label="Progetti in corso" value={String(kpi.projectsInProgress)} icon="layers" tone="copper"
          onClick={() => onGo("progetti")} title="Apri i progetti" />
        <Stat label="Da incassare" value={fmtEur(kpi.invoicesPendingTotal)} icon="euro"
          tone={kpi.invoicesPendingCount > 0 ? "amber" : "green"}
          hint={kpi.invoicesPendingCount > 0 ? `${kpi.invoicesPendingCount} fatture aperte` : "tutto incassato"}
          onClick={() => onGo("fatturazione")} title="Apri la fatturazione" />
        <Stat label="Ticket aperti" value={String(kpi.ticketsOpen)} icon="ticket"
          tone={kpi.ticketsOpen > 0 ? "red" : "green"}
          onClick={() => onGo("inbox")} title="Apri l'inbox" />
      </div>

      <FunnelCard />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: 16, alignItems: "start" }}>
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

        {/* Il diario si consulta, non si sorveglia: sta chiuso finché non
            serve, e chiuso occupa una riga invece di uno schermo. La scelta
            resta memorizzata, altrimenti richiuderlo ogni volta sarebbe solo
            un modo più lento di non averlo. */}
        <Glass variant="panel" style={{ padding: 20 }}>
          <Collapsible
            kicker="Diario"
            title="Attività recente"
            sub={home.events.length === 0
              ? "Nessuna attività"
              : `${home.events.length} event${home.events.length === 1 ? "o" : "i"} da tutti i clienti`}
            storageKey="nm-adm-diario"
          >
            {home.events.length === 0 ? (
              <Empty icon="sparkle" title="Nessuna attività" hint="Qui scorre il giornale di tutti i progetti." />
            ) : (
              <Timeline events={home.events} showProject showClient limit={14} />
            )}
          </Collapsible>
        </Glass>
      </div>
    </div>
  )
}
