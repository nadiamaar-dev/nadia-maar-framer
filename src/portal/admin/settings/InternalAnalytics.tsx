import React, { useCallback, useEffect, useState } from "react"
import { useToast } from "../../../context/ToastContext"
import type { VisitorStats } from "../../../lib/api"
import { fetchVisitorStats } from "../../../lib/api"
import { Badge, Btn, DISPLAY, Empty, Glass, Icon, Loading, MONO, Stat, T, Tabs, TONE } from "../../ui"

/* ══════════════════════════════════════════════════════════════════════════
   ANALYTICS INTERNE.

   Non sostituisce GA4 e non ci prova: risponde a una domanda sola — «cosa è
   successo sul sito adesso» — e la risponde per tutti, compreso quel terzo
   di visitatori che blocca gli script di Google e che in GA4 non esiste.

   Nessun grafico a linee con librerie da 200 KB: barre costruite con dei div,
   che a questa scala dicono la stessa cosa e pesano zero.
══════════════════════════════════════════════════════════════════════════ */

type Window_ = "24" | "168" | "720"

const WINDOWS: { id: Window_; label: string }[] = [
  { id: "24", label: "24 ore" },
  { id: "168", label: "7 giorni" },
  { id: "720", label: "30 giorni" },
]

const DEVICE_LABEL: Record<string, string> = {
  mobile: "Mobile", desktop: "Desktop", tablet: "Tablet", bot: "Bot",
}

export default function InternalAnalytics() {
  const toast = useToast()
  const [hours, setHours] = useState<Window_>("24")
  const [stats, setStats] = useState<VisitorStats | null>(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (h: Window_) => {
    setBusy(true)
    try {
      setStats(await fetchVisitorStats(Number(h)))
      setError(false)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => { load(hours) }, [hours, load])

  const total = stats?.pageviews ?? 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Tabs<Window_> value={hours} onChange={setHours} items={WINDOWS} />
        <span style={{ flex: 1 }} />
        <Btn variant="ghost" icon="bolt" busy={busy} onClick={() => load(hours)}>Aggiorna</Btn>
      </div>

      {error ? (
        <Glass variant="panel" style={{ padding: 20 }}>
          <Empty
            icon="warn"
            title="Statistiche non disponibili"
            hint="Il conteggio interno richiede la migrazione portal_18. Se l'hai appena applicata, ricarica la pagina."
            action={<Btn variant="primary" icon="bolt" onClick={() => load(hours)}>Riprova</Btn>}
          />
        </Glass>
      ) : stats === null ? (
        <Glass variant="panel" style={{ padding: 20 }}><Loading label="Conto le visite" /></Glass>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px,100%),1fr))", gap: 12 }}>
            <Stat label="Pagine viste" value={stats.pageviews.toLocaleString("it-IT")} icon="layers" tone="silver" />
            <Stat label="Visitatori unici" value={stats.uniques.toLocaleString("it-IT")} icon="users" tone="copper"
              hint="per impronta anonima dell'IP" />
            <Stat
              label="Pagine per visitatore"
              value={stats.uniques ? (stats.pageviews / stats.uniques).toFixed(1) : "—"}
              icon="doc" tone="silver"
            />
            <Stat
              label="Da mobile"
              value={`${pct(stats.devices.find(d => d.device === "mobile")?.views ?? 0, total)}%`}
              icon="phone"
              tone="silver"
            />
          </div>

          {total === 0 ? (
            <Glass variant="panel" style={{ padding: 20 }}>
              <Empty
                icon="sparkle"
                title="Ancora nessuna visita in questa finestra"
                hint="Il conteggio parte dal primo deploy con /api/track attivo. Le visite all'area riservata non vengono registrate di proposito."
              />
            </Glass>
          ) : (
            <>
              <Glass variant="panel" style={{ padding: 20 }}>
                <Header icon="clock" title="Andamento" sub={hours === "24" ? "ora per ora" : "per ora, aggregato"} />
                <HourBars data={stats.byHour} />
              </Glass>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px,100%),1fr))", gap: 16, alignItems: "start" }}>
                <Glass variant="panel" style={{ padding: 20 }}>
                  <Header icon="doc" title="Pagine più viste" />
                  <BarList
                    items={stats.topPages.map(p => ({ label: p.path, value: p.views, note: `${p.uniques} unici` }))}
                    total={stats.topPages[0]?.views ?? 1}
                    tone="copper"
                  />
                </Glass>

                <Glass variant="panel" style={{ padding: 20 }}>
                  <Header icon="external" title="Da dove arrivano" sub="solo il dominio, mai l'URL completo" />
                  <BarList
                    items={stats.referrers.map(r => ({ label: r.source, value: r.views }))}
                    total={stats.referrers[0]?.views ?? 1}
                    tone="silver"
                  />
                </Glass>
              </div>

              <Glass variant="panel" style={{ padding: 20 }}>
                <Header icon="layers" title="Dispositivi" />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                  {stats.devices.map(d => (
                    <div key={d.device} style={{
                      flex: "1 1 140px", padding: "14px 16px", borderRadius: 13,
                      background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
                    }}>
                      <p style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", color: T.secondary, margin: 0 }}>
                        {DEVICE_LABEL[d.device] ?? d.device}
                      </p>
                      <p style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 800, color: T.text, margin: "6px 0 0" }}>
                        {pct(d.views, total)}%
                      </p>
                      <p style={{ fontFamily: MONO, fontSize: 12, color: T.secondary, margin: "3px 0 0" }}>
                        {d.views.toLocaleString("it-IT")} viste
                      </p>
                    </div>
                  ))}
                </div>
              </Glass>
            </>
          )}
        </>
      )}

      <Glass variant="work" style={{ padding: "14px 16px" }}>
        <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.6, color: T.secondary, margin: 0 }}>
          <Icon name="lock" size={13} style={{ verticalAlign: "-2px", marginRight: 7 }} />
          Nessun cookie e nessun indirizzo IP in chiaro: si salva un'impronta salata che distingue due
          visitatori e non risale a una persona. Per questo non serve un banner di consenso — a differenza di GA4.
        </p>
      </Glass>
    </div>
  )
}

function pct(v: number, total: number): number {
  return total ? Math.round((v / total) * 100) : 0
}

function Header({ icon, title, sub }: { icon: Parameters<typeof Icon>[0]["name"]; title: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ color: T.secondary, display: "flex" }}><Icon name={icon} size={15} /></span>
      <span style={{ fontFamily: DISPLAY, fontSize: 16.5, fontWeight: 700, color: T.text }}>{title}</span>
      {sub && <span style={{ fontFamily: MONO, fontSize: 12, color: T.secondary }}>· {sub}</span>}
    </div>
  )
}

function BarList({ items, total, tone }: {
  items: { label: string; value: number; note?: string }[]
  total: number
  tone: "copper" | "silver"
}) {
  if (!items.length) {
    return <p style={{ fontFamily: DISPLAY, fontSize: 14, color: T.secondary, margin: "16px 0 0" }}>Nessun dato.</p>
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 15 }}>
      {items.map(i => (
        <div key={i.label}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 5 }}>
            <span style={{
              fontFamily: MONO, fontSize: 13, color: T.text, minWidth: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {i.label}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: T.text, flexShrink: 0 }}>
              {i.value.toLocaleString("it-IT")}
              {i.note && <span style={{ fontWeight: 400, color: T.secondary }}> · {i.note}</span>}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.max(3, (i.value / Math.max(total, 1)) * 100)}%`,
              background: TONE[tone].fg, borderRadius: 99,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function HourBars({ data }: { data: { bucket: string; views: number }[] }) {
  if (!data.length) {
    return <p style={{ fontFamily: DISPLAY, fontSize: 14, color: T.secondary, margin: "16px 0 0" }}>Nessun dato.</p>
  }
  const max = Math.max(...data.map(d => d.views), 1)
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120, marginTop: 18, overflowX: "auto" }}>
      {data.map(d => {
        const h = Math.max(4, (d.views / max) * 100)
        const label = new Date(d.bucket).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit" })
        return (
          <div
            key={d.bucket}
            title={`${label} — ${d.views} viste`}
            style={{
              flex: "1 0 8px", minWidth: 8, height: `${h}%`, borderRadius: "4px 4px 0 0",
              background: "linear-gradient(180deg, rgba(184,50,64,0.85), rgba(184,50,64,0.30))",
            }}
          />
        )
      })}
    </div>
  )
}
