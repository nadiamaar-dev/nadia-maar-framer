import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  LISTINI, customerSummary, eur, invoiceTotals, num, orderTotals,
  type Customer, type Invoice, type Order, type RoleId,
} from "./data"
import { Avatar, Cartiglio, Denied, FidoGauge, InvoiceStamp, OrderStamp } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   SCHEDA CLIENTE
   L'anagrafica da sola non serve a nessuno: quello che si guarda davvero è
   quanto ha comprato, quanto deve e a che condizioni. Qui le tre cose stanno
   nella stessa scheda, con i documenti raggiungibili in un clic.
══════════════════════════════════════════════════════════════════════════ */

export default function CustomerDrawer({ customer, orders, invoices, role, onClose, onOpenOrder, onOpenInvoice }: {
  customer: Customer
  orders: Order[]
  invoices: Invoice[]
  role: RoleId
  onClose: () => void
  onOpenOrder: (id: string) => void
  onOpenInvoice: (id: string) => void
}) {
  const [tab, setTab] = useState<"panoramica" | "ordini" | "fatture">("panoramica")
  const sum = customerSummary(customer.id, orders, invoices)
  const listino = LISTINI.find(l => l.code === customer.listino)
  const isAdmin = role === "admin"

  return (
    <>
      <div className="vt-drawer-scrim" onClick={onClose} />
      <motion.aside
        className="vt-drawer" role="dialog" aria-label={`Cliente ${customer.name}`}
        initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="vt-drawer-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div style={{ display: "flex", gap: 13, alignItems: "center", minWidth: 0 }}>
              <span className="vt-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
                <Avatar name={customer.name} />
              </span>
              <div style={{ minWidth: 0 }}>
                <h3 className="vt-h2" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {customer.name}
                </h3>
                <p className="vt-small vt-muted" style={{ marginTop: 3 }}>
                  {customer.city} · {customer.id}
                </p>
              </div>
            </div>
            <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" onClick={onClose} aria-label="Chiudi">Chiudi</button>
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 14 }}>
            {([["panoramica", "Panoramica"], ["ordini", `Ordini · ${sum.nOrdini}`], ["fatture", `Fatture · ${sum.invoices.length}`]] as const).map(([id, label]) => (
              <button key={id} type="button" className="vt-tab" role="tab"
                aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="vt-drawer-body">
          {tab === "panoramica" && (
            <>
              <div className="vt-grid vt-grid-2" style={{ marginBottom: 18 }}>
                <div className="vt-tile" style={{ boxShadow: "none", background: "var(--vt-sheet-alt)" }}>
                  <span className="vt-label">Fatturato incassato</span>
                  <div className="vt-figure" style={{ marginTop: 6 }}>{eur(sum.fatturato, 0)}</div>
                </div>
                <div className="vt-tile" style={{ boxShadow: "none", background: "var(--vt-sheet-alt)" }}>
                  <span className="vt-label">Da incassare</span>
                  <div className="vt-figure" style={{ marginTop: 6, color: sum.scaduto > 0 ? "var(--vt-bad)" : undefined }}>
                    {eur(sum.aperto, 0)}
                  </div>
                  {sum.scaduto > 0 && (
                    <span className="vt-micro" style={{ color: "var(--vt-bad)" }}>
                      di cui {eur(sum.scaduto, 0)} scaduti
                    </span>
                  )}
                </div>
              </div>

              <h4 className="vt-h3" style={{ marginBottom: 10 }}>Fido e condizioni</h4>
              <FidoGauge fido={customer.fido} esposizione={customer.esposizione} ordine={0} />

              <div style={{ marginTop: 18 }}>
                <Cartiglio fields={[
                  { k: "Listino assegnato", v: `${customer.listino} · ${listino?.name ?? "—"}` },
                  { k: "Sconto base", v: `${num(customer.sconto)} %` },
                  { k: "Pagamento", v: customer.termini },
                  { k: "Agente", v: customer.agente },
                ]} />
              </div>

              {isAdmin ? (
                <div style={{ marginTop: 18 }}>
                  <span className="vt-field-label">Cambia listino assegnato</span>
                  <p className="vt-small vt-muted">
                    In produzione questa scelta ririprezza il catalogo del cliente al salvataggio.
                    Nella demo si prova dal catalogo con «Operi come».
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: 18 }}>
                  <Denied>Fido, listino e condizioni sono modificabili solo dal ruolo Amministratore (403).</Denied>
                </div>
              )}
            </>
          )}

          {tab === "ordini" && (
            sum.orders.length === 0
              ? <p className="vt-body vt-muted">Nessun ordine per questo cliente.</p>
              : (
                <table className="vt-table">
                  <thead>
                    <tr>
                      <th scope="col">Numero</th>
                      <th scope="col" style={{ width: 108 }}>Data</th>
                      <th scope="col" style={{ width: 150 }}>Stato</th>
                      <th scope="col" style={{ width: 110, textAlign: "right" }}>Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sum.orders.map(o => (
                      <tr key={o.id} className="vt-clickable" onClick={() => onOpenOrder(o.id)}>
                        <td><span className="vt-code">{o.id}</span></td>
                        <td className="vt-muted">{o.date}</td>
                        <td><OrderStamp s={o.state} /></td>
                        <td className="vt-num">{eur(orderTotals(o).totale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
          )}

          {tab === "fatture" && (
            sum.invoices.length === 0
              ? <p className="vt-body vt-muted">Nessuna fattura per questo cliente.</p>
              : (
                <table className="vt-table">
                  <thead>
                    <tr>
                      <th scope="col">Numero</th>
                      <th scope="col" style={{ width: 108 }}>Scadenza</th>
                      <th scope="col" style={{ width: 140 }}>Stato</th>
                      <th scope="col" style={{ width: 110, textAlign: "right" }}>Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sum.invoices.map(i => (
                      <tr key={i.id} className="vt-clickable" onClick={() => onOpenInvoice(i.id)}>
                        <td><span className="vt-code">{i.id}</span></td>
                        <td className="vt-muted">{i.scadenza}</td>
                        <td><InvoiceStamp s={i.state} /></td>
                        <td className="vt-num">{eur(invoiceTotals(i).totale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
          )}
        </div>
      </motion.aside>
    </>
  )
}
