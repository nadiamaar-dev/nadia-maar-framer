import React, { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ORDER_STATE_LABEL, ORDER_STEPS, customerById, eur, num, orderTotals,
  productBySku, stepsDone, type Order, type OrderState, type RoleId,
} from "./data"
import { Avatar, CardHead, Cartiglio, Denied, ExportBtn, OrderStamp, Sheet } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   ORDINI
   La riga apre un cassetto con il ciclo di vita del documento a sette passi.
   Il pulsante "Approva" esiste anche per chi non può usarlo: è disabilitato e
   dichiara il motivo. Nascondere il rifiuto non insegna nulla; mostrarlo sì.
══════════════════════════════════════════════════════════════════════════ */

const FILTERS: { id: OrderState | "tutti"; label: string }[] = [
  { id: "tutti", label: "Tutti" },
  { id: "bozza", label: "Bozza" },
  { id: "approvazione", label: "In approvazione" },
  { id: "confermato", label: "Confermati" },
  { id: "spedito", label: "Spediti" },
  { id: "consegnato", label: "Consegnati" },
]

/* separatore a tutta larghezza del cassetto */
const Divider = () => <div style={{ height: 1, background: "var(--vt-line-soft)", margin: "18px -22px" }} />

export function OrderDrawer({ order, role, onClose, onApprove, onReject, onOpenInvoice, onReorder }: {
  order: Order
  role: RoleId
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onOpenInvoice: (id: string) => void
  /* rimette le righe nel carrello: nel B2B si riordina piu spesso di quanto
     si compili un ordine da zero */
  onReorder: (o: Order) => void
}) {
  const [tab, setTab] = useState<"dettaglio" | "spedizione">("dettaglio")
  const c = customerById(order.customerId)
  const t = orderTotals(order)
  const done = stepsDone(order.state)
  const canApprove = role === "admin"
  const pending = order.state === "approvazione"
  const sconto = order.lines.reduce((a, l) => a + (productBySku(l.sku).listino - l.price) * l.qty, 0)

  return (
    <>
      <div className="vt-drawer-scrim" onClick={onClose} />
      <motion.aside
        className="vt-drawer" role="dialog" aria-label={`Ordine ${order.id}`}
        initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
      >
        <div className="vt-drawer-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <h3 className="vt-h2">{order.id}</h3>
              <p className="vt-small vt-muted" style={{ marginTop: 3 }}>{c.name} · {c.city}</p>
            </div>
            <span style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm" onClick={() => onReorder(order)}>
                {order.state === "bozza" ? "Riprendi" : "Riordina"}
              </button>
              <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" onClick={onClose} aria-label="Chiudi">Chiudi</button>
            </span>
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 14 }}>
            {(["dettaglio", "spedizione"] as const).map(id => (
              <button key={id} type="button" className="vt-tab" role="tab"
                aria-selected={tab === id} onClick={() => setTab(id)}>
                {id === "dettaglio" ? "Dettaglio" : "Spedizione"}
              </button>
            ))}
          </div>
        </div>

        <div className="vt-drawer-body">
          {tab === "dettaglio" ? (
            <>
              <Cartiglio fields={[
                { k: "Documento", v: order.id },
                { k: "Emesso", v: order.date },
                { k: "Consegna richiesta", v: order.consegna },
                { k: "Stato", v: ORDER_STATE_LABEL[order.state] },
              ]} />

              {/* ciclo di vita: quadratini pieni per i passi conclusi */}
              <div style={{ marginTop: 20 }}>
                <h4 className="vt-h3" style={{ marginBottom: 12 }}>Ciclo dell'ordine</h4>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  {ORDER_STEPS.map((s, i) => {
                    const complete = i < done
                    return (
                      <div key={s.id} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                          <span style={{ flex: 1, height: 2, borderRadius: 999, background: i === 0 ? "transparent" : (i <= done - 1 ? "var(--vt-accent-fill)" : "var(--vt-line)") }} />
                          <span style={{
                            width: 10, height: 10, flexShrink: 0, borderRadius: 999,
                            background: complete ? "var(--vt-accent-fill)" : "var(--vt-sheet-alt)",
                            boxShadow: complete ? "none" : "inset 0 0 0 1px var(--vt-line)",
                          }} />
                          <span style={{ flex: 1, height: 2, borderRadius: 999, background: i === ORDER_STEPS.length - 1 ? "transparent" : (i < done - 1 ? "var(--vt-accent-fill)" : "var(--vt-line)") }} />
                        </div>
                        <span className="vt-micro" style={{
                          marginTop: 8, textAlign: "center", fontSize: 10, lineHeight: "13px",
                          color: complete ? "var(--vt-ink)" : "var(--vt-ink-muted)",
                        }}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Divider />

              <h4 className="vt-h3" style={{ marginBottom: 8 }}>Righe</h4>
              <table className="vt-table">
                <thead>
                  <tr>
                    <th scope="col">Articolo</th>
                    <th scope="col" style={{ width: 60, textAlign: "right" }}>Q.tà</th>
                    <th scope="col" style={{ width: 104, textAlign: "right" }}>Prezzo</th>
                    <th scope="col" style={{ width: 118, textAlign: "right" }}>Importo</th>
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map(l => {
                    const p = productBySku(l.sku)
                    return (
                      <tr key={l.sku}>
                        <td>
                          <span className="vt-code" style={{ display: "block" }}>{p.sku}</span>
                          <span className="vt-micro">{p.name}</span>
                        </td>
                        <td className="vt-num">{num(l.qty)}</td>
                        <td className="vt-num">{eur(l.price)}</td>
                        <td className="vt-num">{eur(l.qty * l.price)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* registro dei totali, allineato a destra sulla virgola */}
              <div style={{ marginTop: 16, marginLeft: "auto", width: 300 }}>
                {[
                  ["Imponibile", eur(t.imponibile)],
                  ["Sconto applicato", `− ${eur(sconto)}`],
                  ["Trasporto", eur(t.trasporto)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                    <span className="vt-small vt-muted">{k}</span><span className="vt-data">{v}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: "var(--vt-line)", margin: "6px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                  <span className="vt-small vt-muted">IVA 22 %</span><span className="vt-data">{eur(t.iva)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0" }}>
                  <span className="vt-small">Totale</span><span className="vt-data-lg">{eur(t.totale)}</span>
                </div>
              </div>

              {order.note && (
                <div style={{ marginTop: 16 }}><Denied>{order.note}</Denied></div>
              )}

              {pending && (
                <div style={{ marginTop: 20 }}>
                  <Divider />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button" className="vt-btn vt-btn-primary"
                      disabled={!canApprove} onClick={() => onApprove(order.id)}
                    >Approva</button>
                    <button
                      type="button" className="vt-btn vt-btn-secondary"
                      disabled={!canApprove} onClick={() => onReject(order.id)}
                    >Rifiuta</button>
                  </div>
                  {!canApprove && (
                    <div style={{ marginTop: 10 }}>
                      <Denied>Azione riservata al ruolo Amministratore (403).</Denied>
                    </div>
                  )}
                  {canApprove && t.totale > 50000 && (
                    <div style={{ marginTop: 10 }}>
                      <Denied>Oltre € 50.000 serve un secondo approvatore — Direzione commerciale.</Denied>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <h4 className="vt-h3" style={{ marginBottom: 12 }}>Spedizione</h4>
              {order.ddt ? (
                <>
                  <Cartiglio fields={[
                    { k: "DDT", v: order.ddt },
                    { k: "Colli", v: String(order.colli ?? "—") },
                    { k: "Peso", v: `${order.peso ?? 0} kg` },
                    { k: "Resa", v: "Franco fabbrica" },
                  ]} />
                  {order.tracking && (
                    <div style={{
                      marginTop: 16, padding: 16, borderRadius: "var(--vt-r-tile)",
                      background: "var(--vt-sheet-alt)",
                    }}>
                      <span className="vt-label">Tracciabilità</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                        <span className="vt-h3">{order.vettore}</span>
                        <span className="vt-data-lg">{order.tracking}</span>
                      </div>
                      <p className="vt-micro" style={{ marginTop: 8 }}>
                        Il numero è quello del vettore: nel sistema reale il collegamento porta
                        alla pagina di tracciamento del corriere.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="vt-body vt-muted">Nessun DDT emesso: l'ordine non è ancora partito.</p>
              )}
              {order.fattura && (
                <p style={{ marginTop: 20 }}>
                  <span className="vt-label" style={{ display: "block", marginBottom: 4 }}>Fattura collegata</span>
                  <button type="button" className="vt-btn vt-btn-link" onClick={() => onOpenInvoice(order.fattura!)}>
                    {order.fattura}
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </motion.aside>
    </>
  )
}

export default function ScreenOrdini({
  orders, role, filter, setFilter, onOpen,
}: {
  orders: Order[]
  role: RoleId
  filter: OrderState | "tutti"
  setFilter: (f: OrderState | "tutti") => void
  onOpen: (id: string) => void
}) {
  const [q, setQ] = useState("")
  const showCustomer = role !== "cliente"

  const counts = useMemo(() => {
    const m: Record<string, number> = { tutti: orders.length }
    for (const o of orders) m[o.state] = (m[o.state] ?? 0) + 1
    return m
  }, [orders])

  const rows = useMemo(() => orders.filter(o => {
    if (filter !== "tutti" && o.state !== filter) return false
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      return o.id.toLowerCase().includes(t) || customerById(o.customerId).name.toLowerCase().includes(t)
    }
    return true
  }), [orders, filter, q])

  return (
    <div>
      <Sheet>
        <CardHead
          title="Ordini"
          sub={showCustomer ? `${orders.length} documenti nel tuo perimetro` : "I tuoi ordini"}
          right={
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input className="vt-input" style={{ width: 210 }} value={q}
                onChange={e => setQ(e.target.value)} placeholder="Cerca numero o cliente"
                aria-label="Cerca fra gli ordini" />
              <ExportBtn name="ordini-valtecnica.csv" rows={() => [
                ["Numero", "Cliente", "Data", "Consegna", "Righe", "Totale", "Stato"],
                ...rows.map(o => [o.id, customerById(o.customerId).name, o.date, o.consegna,
                  o.lines.length, orderTotals(o).totale.toFixed(2).replace(".", ","), ORDER_STATE_LABEL[o.state]]),
              ]} />
            </span>
          }
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button key={f.id} type="button" className="vt-chip"
              aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} <span className="vt-chip-n">{counts[f.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet style={{ marginTop: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="vt-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: 150 }}>Numero</th>
                {showCustomer && <th scope="col">Cliente</th>}
                <th scope="col" style={{ width: 112 }}>Data</th>
                <th scope="col" style={{ width: 148 }}>Consegna richiesta</th>
                <th scope="col" style={{ width: 64, textAlign: "right" }}>Righe</th>
                <th scope="col" style={{ width: 132, textAlign: "right" }}>Totale</th>
                <th scope="col" style={{ width: 156 }}>Stato</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(o => (
                <tr key={o.id} className="vt-clickable" onClick={() => onOpen(o.id)} tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter") onOpen(o.id) }}>
                  <td><span className="vt-code">{o.id}</span></td>
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
                  <td className="vt-muted">{o.date}</td>
                  <td className="vt-muted">{o.consegna}</td>
                  <td className="vt-num">{o.lines.length}</td>
                  <td className="vt-num">{eur(orderTotals(o).totale)}</td>
                  <td><OrderStamp s={o.state} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="vt-body vt-muted" style={{ padding: 24, textAlign: "center" }}>
            Nessun ordine in questo stato.
          </p>
        )}
      </Sheet>
    </div>
  )
}

export { AnimatePresence }
