import React from "react"
import {
  customerById, eur, num, ORDER_STATE_LABEL, orderTotals, PERIODS, STATS,
  type Customer, type Order, type OrderState, type PeriodId, type RoleId,
} from "./data"
import {
  ActivityFeed, Avatar, CardHead, ColumnChart, Delta, FidoGauge, LedgerRow,
  MetricTile, OrderStamp, Sheet, StackedBar,
} from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   CRUSCOTTO
   Si apre da Amministratore: la prima commutazione di ruolo TOGLIE
   interfaccia, e sottrarre è più leggibile che aggiungere.
   Struttura ripresa dai riferimenti: saluto, sintesi con istogramma,
   tre tessere metriche di cui una scura, poi lo storico.
══════════════════════════════════════════════════════════════════════════ */

const WEEK_LABELS = ["sett. 20", "sett. 21", "sett. 22", "sett. 23", "sett. 24", "sett. 25",
  "sett. 26", "sett. 27", "sett. 28", "sett. 29", "sett. 30", "sett. 31"]

/* piccole serie per gli spark: derivano dalla serie principale, non sono
   numeri inventati a parte */
const tail = (s: number[], k: number) => s.slice(-k)

export default function ScreenCruscotto({
  role, period, setPeriod, feed, paused, togglePause,
  approvals, onOpenApprovals, onPickState, self, topClients, recent, onOpenOrder,
}: {
  role: RoleId
  period: PeriodId
  setPeriod: (p: PeriodId) => void
  feed: { t: string; who: string; ago: number }[]
  paused: boolean
  togglePause: () => void
  approvals: number
  onOpenApprovals: () => void
  onPickState: (s: OrderState) => void
  self: Customer
  topClients: { name: string; value: number }[]
  recent: Order[]
  onOpenOrder: (id: string) => void
}) {
  const s = STATS[period]
  const scoped = role === "agente"

  /* Il cliente non ha un cruscotto aziendale: ha la sua posizione. */
  if (role === "cliente") {
    return (
      <div className="vt-grid vt-grid-side">
        <Sheet>
          <CardHead title="La tua posizione" sub={self.name} />
          <div className="vt-figure-lg">{eur(47310, 0)}</div>
          <p className="vt-label" style={{ marginTop: 6 }}>Spesa 2026, imponibile</p>
          <div style={{ marginTop: 18 }}>
            <LedgerRow k="Ordini aperti" v="2" sub="in approvazione o in transito" />
            <LedgerRow k="Fido residuo" v={eur(self.fido - self.esposizione, 0)} sub={`su ${eur(self.fido, 0)} concessi`} />
          </div>
          <div style={{ marginTop: 18 }}>
            <FidoGauge fido={self.fido} esposizione={self.esposizione} ordine={0} />
          </div>
          <p className="vt-micro" style={{ marginTop: 14 }}>Condizioni: {self.termini}</p>
        </Sheet>

        <Sheet>
          <CardHead title="Ultimi ordini" sub="I tuoi documenti più recenti." />
          <RecentTable recent={recent} onOpen={onOpenOrder} showCustomer={false} />
        </Sheet>
      </div>
    )
  }

  return (
    <>
      {/* ── sintesi + tessere metriche ────────────────────────────────────── */}
      <div className="vt-grid vt-grid-main">
        <Sheet>
          <CardHead
            title="Sintesi"
            sub="Andamento del fatturato."
            right={
              <div className="vt-seg">
                {PERIODS.map(p => (
                  <button key={p.id} type="button" aria-pressed={p.id === period} onClick={() => setPeriod(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            }
          />

          <div style={{
            background: "var(--vt-sheet-alt)", borderRadius: "var(--vt-r-tile)", padding: 18,
          }}>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 20 }}>
              <div>
                <span className="vt-label">Fatturato</span>
                <div className="vt-figure-lg" key={s.fatturato} style={{ marginTop: 6 }}>{eur(s.fatturato, 0)}</div>
                <div style={{ marginTop: 6 }}><Delta v={s.delta} suffix="sul periodo prec." /></div>
              </div>
              <div>
                <span className="vt-label">Ticket medio</span>
                <div className="vt-figure-lg" key={s.ticket} style={{ marginTop: 6 }}>{eur(s.ticket, 0)}</div>
                <div className="vt-micro" style={{ marginTop: 8 }}>su {num(s.ordini)} ordini</div>
              </div>
            </div>
            <ColumnChart series={s.serie} labels={WEEK_LABELS} />
          </div>
        </Sheet>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div className="vt-sheet" style={{ paddingBottom: 20 }}>
            <CardHead
              title="Andamento"
              sub="Le voci che muovono il periodo."
              right={
                <button type="button" className="vt-icon-btn" onClick={onOpenApprovals} aria-label="Apri gli ordini da approvare">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 12.5l9-9M6 3.5h6.5V10" />
                  </svg>
                </button>
              }
            />
            <div className="vt-grid vt-grid-3">
              <MetricTile
                label="Ordini" value={num(s.ordini)} delta={s.delta}
                series={tail(s.serie, 8)}
              />
              {!scoped && (
                <MetricTile
                  label="Margine medio" value={`${num(s.margine, 1)} %`} delta={0.6}
                  series={tail(s.serie, 8).map(v => v * 0.94)}
                />
              )}
              {scoped && (
                <MetricTile
                  label="Clienti attivi" value="4" delta={0}
                  series={tail(s.serie, 8).map(v => v * 0.9)}
                />
              )}
              {/* la tessera scura porta il dato che deve pesare */}
              <MetricTile
                label="Scaduto" value={eur(s.scaduto, 0)} delta={-20.5}
                series={tail(s.serie, 8).map(v => v * 0.7).reverse()}
                variant="dark"
              />
            </div>
          </div>

          {approvals > 0 && (
            <button type="button" onClick={onOpenApprovals} className="vt-sheet" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 16, textAlign: "left", width: "100%", flex: 1, minHeight: 96,
            }}>
              <span>
                <span className="vt-h3" style={{ display: "block" }}>Ordini da approvare</span>
                <span className="vt-label">fido superato o cliente con scaduto</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <span className="vt-figure" style={{ color: "var(--vt-accent)" }}>{approvals}</span>
                <span className="vt-icon-btn" aria-hidden>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3.5L10.5 8L6 12.5" />
                  </svg>
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── stato ordini + attività ───────────────────────────────────────── */}
      <div className="vt-grid vt-grid-main" style={{ marginTop: 16 }}>
        <Sheet>
          <CardHead title="Stato ordini" sub="Clicca un segmento per filtrare la lista." />
          <StackedBar data={s.stati} onPick={onPickState} />

          <div style={{ marginTop: 24 }}>
            <h3 className="vt-h3" style={{ marginBottom: 4 }}>
              {scoped ? "Clienti del portafoglio" : "Primi clienti per esposizione"}
            </h3>
            {topClients.map(c => {
              const max = Math.max(...topClients.map(t => t.value), 1)
              return (
                <div key={c.name} style={{ padding: "12px 0", borderTop: "1px solid var(--vt-line-soft)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 7 }}>
                    <span className="vt-small vt-ell" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    <span className="vt-data" style={{ flexShrink: 0 }}>{eur(c.value, 0)}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--vt-sheet-alt)", borderRadius: 999 }}>
                    <div style={{ height: "100%", width: `${(c.value / max) * 100}%`, background: "var(--vt-accent-ghost)", borderRadius: 999 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Sheet>

        <Sheet>
          <ActivityFeed entries={feed} paused={paused} onToggle={togglePause} />
        </Sheet>
      </div>

      {/* ── storico ───────────────────────────────────────────────────────── */}
      <Sheet style={{ marginTop: 16 }}>
        <CardHead title="Ordini recenti" sub="Gli ultimi documenti nel tuo perimetro." />
        <RecentTable recent={recent} onOpen={onOpenOrder} showCustomer />
      </Sheet>

      <p className="vt-micro" style={{ marginTop: 16 }}>
        Aziende, persone e importi sono fittizi. Le cifre non descrivono clienti reali.
      </p>
    </>
  )
}

/* ── tabella compatta condivisa dai due cruscotti ───────────────────────── */
function RecentTable({ recent, onOpen, showCustomer }: {
  recent: Order[]; onOpen: (id: string) => void; showCustomer: boolean
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="vt-table">
        <thead>
          <tr>
            {showCustomer && <th scope="col">Cliente</th>}
            <th scope="col" style={{ width: 130 }}>Numero</th>
            <th scope="col" style={{ width: 120 }}>Data</th>
            <th scope="col" style={{ width: 160 }}>Stato</th>
            <th scope="col" style={{ width: 130, textAlign: "right" }}>Totale</th>
          </tr>
        </thead>
        <tbody>
          {recent.map(o => (
            <tr key={o.id} className="vt-clickable" onClick={() => onOpen(o.id)} tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") onOpen(o.id) }}>
              {showCustomer && (
                <td className="vt-ell">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                    <Avatar name={customerById(o.customerId).name} />
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {customerById(o.customerId).name}
                    </span>
                  </span>
                </td>
              )}
              <td><span className="vt-code">{o.id}</span></td>
              <td className="vt-muted">{o.date}</td>
              <td><OrderStamp s={o.state} /></td>
              <td className="vt-num">{eur(orderTotals(o).totale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { ORDER_STATE_LABEL }
