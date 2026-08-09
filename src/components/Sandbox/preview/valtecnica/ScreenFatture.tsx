import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  INVOICE_STATE_LABEL, LISTINI, bucketOf, customerById, daysLate, eur, invoiceTotals, num,
  type Customer, type Invoice, type InvoiceState, type RoleId,
} from "./data"
import { AgingBar, Avatar, CardHead, Cartiglio, Denied, ExportBtn, InvoiceStamp, Sheet } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   FATTURE · CLIENTI · LISTINI
   Il fac-simile porta una filigrana ruotata: è l'unico elemento inclinato del
   prodotto, ed è una filigrana, non un timbro. Annullare una fattura emessa
   non è previsto — in Italia si emette nota di credito, e il rifiuto lo dice.
══════════════════════════════════════════════════════════════════════════ */

const FILTERS: { id: InvoiceState | "tutte"; label: string }[] = [
  { id: "tutte", label: "Tutte" },
  { id: "da-pagare", label: "Da pagare" },
  { id: "scaduta", label: "Scadute" },
  { id: "pagata", label: "Pagate" },
]

/* separatore a tutta larghezza del contenitore */
const Divider = () => <div style={{ height: 1, background: "var(--vt-line-soft)", margin: "18px -22px" }} />

export function InvoiceDrawer({ invoice, role, onClose, onPaid, onSollecito, onOpenOrder }: {
  invoice: Invoice
  role: RoleId
  onClose: () => void
  onPaid: (id: string) => void
  onSollecito: (id: string) => void
  onOpenOrder: (id: string) => void
}) {
  const [tab, setTab] = useState<"dettaglio" | "facsimile" | "xml">("dettaglio")
  const c = customerById(invoice.customerId)
  const t = invoiceTotals(invoice)
  const isAdmin = role === "admin"

  return (
    <>
      <div className="vt-drawer-scrim" onClick={onClose} />
      <motion.aside
        className="vt-drawer" role="dialog" aria-label={`Fattura ${invoice.id}`}
        initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
      >
        <div className="vt-drawer-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <h3 className="vt-h2">{invoice.id}</h3>
              <p className="vt-small vt-muted" style={{ marginTop: 3 }}>{c.name}</p>
            </div>
            <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" onClick={onClose} aria-label="Chiudi">Chiudi</button>
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 14, borderBottom: "1px solid var(--vt-line-soft)" }}>
            {([["dettaglio", "Dettaglio"], ["facsimile", "Fac-simile"], ["xml", "XML SdI"]] as const).map(([id, label]) => (
              <button key={id} type="button" className="vt-tab" role="tab"
                aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="vt-drawer-body">
          {tab === "dettaglio" && (
            <>
              <Cartiglio fields={[
                { k: "Documento", v: invoice.id },
                { k: "Emessa", v: invoice.emessa },
                { k: "Scadenza", v: invoice.scadenza },
                { k: "Stato", v: INVOICE_STATE_LABEL[invoice.state] },
              ]} />

              <div style={{ marginTop: 20 }}>
                <h4 className="vt-h3" style={{ marginBottom: 10 }}>Riepilogo IVA</h4>
                <table className="vt-table">
                  <thead>
                    <tr>
                      <th scope="col">Aliquota</th>
                      <th scope="col" style={{ width: 120, textAlign: "right" }}>Imponibile</th>
                      <th scope="col" style={{ width: 110, textAlign: "right" }}>Imposta</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>22 %</td><td className="vt-num">{eur(t.imponibile22)}</td><td className="vt-num">{eur(t.iva22)}</td></tr>
                    {t.imponibile10 > 0 && (
                      <tr><td>10 %</td><td className="vt-num">{eur(t.imponibile10)}</td><td className="vt-num">{eur(t.iva10)}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 16, marginLeft: "auto", width: 280 }}>
                <div style={{ height: 1, background: "var(--vt-line)", marginBottom: 8 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="vt-small">Totale documento</span>
                  <span className="vt-data-lg">{eur(t.totale)}</span>
                </div>
              </div>

              <p style={{ marginTop: 20 }}>
                <span className="vt-label" style={{ display: "block", marginBottom: 4 }}>Condizioni</span>
                <span className="vt-small vt-muted">{c.termini}</span>
              </p>

              {invoice.ordine && (
                <p style={{ marginTop: 16 }}>
                  <span className="vt-label" style={{ display: "block", marginBottom: 4 }}>Ordine collegato</span>
                  <button type="button" className="vt-btn vt-btn-link" onClick={() => onOpenOrder(invoice.ordine!)}>
                    {invoice.ordine}
                  </button>
                </p>
              )}

              <Divider />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="vt-btn vt-btn-primary"
                  disabled={!isAdmin || invoice.state === "pagata"} onClick={() => onPaid(invoice.id)}>
                  Registra incasso
                </button>
                <button type="button" className="vt-btn vt-btn-secondary"
                  disabled={!isAdmin || invoice.state !== "scaduta"} onClick={() => onSollecito(invoice.id)}>
                  Invia sollecito
                </button>
                <button type="button" className="vt-btn vt-btn-secondary" disabled title="Non previsto">
                  Annulla fattura
                </button>
              </div>
              <div style={{ marginTop: 10 }}>
                {!isAdmin
                  ? <Denied>Registrazione incassi e solleciti sono riservati al ruolo Amministratore (403).</Denied>
                  : <Denied>Una fattura emessa non si annulla: si emette nota di credito.</Denied>}
              </div>
            </>
          )}

          {tab === "facsimile" && (
            <div style={{
              position: "relative", border: "1px solid var(--vt-line)",
              borderRadius: "var(--vt-r-tile)",
              padding: 24, overflow: "hidden", background: "var(--vt-sheet)",
            }}>
              <span aria-hidden style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                transform: "rotate(-30deg)", pointerEvents: "none",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 20, fontWeight: 600, letterSpacing: "0.06em",
                color: "rgba(26,22,20,0.07)", whiteSpace: "nowrap",
              }}>FAC-SIMILE · DATI DIMOSTRATIVI</span>

              <div style={{ position: "relative" }}>
                <p className="vt-label">Cedente / prestatore</p>
                <p className="vt-small" style={{ marginBottom: 14 }}>
                  Valtecnica S.r.l. · Via dell'Artigianato 14, 36100 Vicenza · P.IVA 03871420248
                </p>
                <p className="vt-label">Cessionario / committente</p>
                <p className="vt-small" style={{ marginBottom: 14 }}>{c.name} · {c.city}</p>
                <div style={{ height: 1, background: "var(--vt-line-soft)", margin: "14px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="vt-small vt-muted">Documento</span><span className="vt-data">{invoice.id}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span className="vt-small vt-muted">Data</span><span className="vt-data">{invoice.emessa}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span className="vt-small vt-muted">Totale</span><span className="vt-data">{eur(t.totale)}</span>
                </div>
              </div>
            </div>
          )}

          {tab === "xml" && (
            <>
              <pre style={{
                background: "var(--vt-sheet-alt)", border: "1px solid var(--vt-line-soft)", borderRadius: 2,
                padding: 14, margin: 0, overflowX: "auto",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: "18px", color: "var(--vt-ink)",
              }}>{`<FatturaElettronica versione="FPR12">
  <FatturaElettronicaHeader>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>03871420248</IdCodice>
        </IdFiscaleIVA>
        <Denominazione>Valtecnica S.r.l.</Denominazione>
      </DatiAnagrafici>
    </CedentePrestatore>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGeneraliDocumento>
      <TipoDocumento>TD01</TipoDocumento>
      <Divisa>EUR</Divisa>
      <Data>${invoice.emessa.split("/").reverse().join("-")}</Data>
      <Numero>${invoice.id.replace("FT ", "")}</Numero>
      <ImportoTotaleDocumento>${t.totale.toFixed(2)}</ImportoTotaleDocumento>
    </DatiGeneraliDocumento>
  </FatturaElettronicaBody>
</FatturaElettronica>`}</pre>
              <p className="vt-label" style={{ marginTop: 10 }}>
                Estratto dimostrativo del tracciato FatturaPA. Non è un file valido per l'invio allo SdI.
              </p>
            </>
          )}
        </div>
      </motion.aside>
    </>
  )
}

export default function ScreenFatture({
  invoices, role, onOpen, onStatement,
}: {
  invoices: Invoice[]
  role: RoleId
  onOpen: (id: string) => void
  /* estratto conto della partita aperta, in PDF */
  onStatement: () => void
}) {
  const [filter, setFilter] = useState<InvoiceState | "tutte">("tutte")
  const [bucket, setBucket] = useState<string | null>(null)
  const showCustomer = role !== "cliente"

  const counts = useMemo(() => {
    const m: Record<string, number> = { tutte: invoices.length }
    for (const i of invoices) m[i.state] = (m[i.state] ?? 0) + 1
    return m
  }, [invoices])

  const scadute = invoices.filter(i => i.state === "scaduta")
  const scaduto = scadute.reduce((a, i) => a + invoiceTotals(i).totale, 0)
  const rows = useMemo(() => invoices
    .filter(i => filter === "tutte" || i.state === filter)
    .filter(i => !bucket || (i.state !== "pagata" && bucketOf(i).id === bucket)),
    [invoices, filter, bucket])
  const prossima = invoices
    .filter(i => i.state === "da-pagare")
    .map(i => i.scadenza)
    .sort((a, b) => a.split("/").reverse().join().localeCompare(b.split("/").reverse().join()))[0]

  return (
    <div>
      <Sheet>
        <CardHead
          title="Fatture" sub={`${invoices.length} documenti`} right={
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FILTERS.map(f => (
                <button key={f.id} type="button" className="vt-chip"
                  aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                  {f.label} <span className="vt-chip-n">{counts[f.id] ?? 0}</span>
                </button>
              ))}
              <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm" onClick={onStatement}>
                Estratto conto
              </button>
              <ExportBtn name="fatture-valtecnica.csv" rows={() => [
                ["Numero", "Cliente", "Emessa", "Scadenza", "Ordine", "Totale", "Stato", "Giorni di ritardo"],
                ...rows.map(i => [i.id, customerById(i.customerId).name, i.emessa, i.scadenza,
                  i.ordine ?? "", invoiceTotals(i).totale.toFixed(2).replace(".", ","),
                  INVOICE_STATE_LABEL[i.state], i.state === "pagata" ? "" : Math.max(0, daysLate(i.scadenza))]),
              ]} />
            </div>
          }
        />
        {/* Lo scadenzario: quanto credito e quanto vecchio. È la domanda che
            un ufficio crediti si fa per prima, e i segmenti filtrano la lista. */}
        <div style={{ borderTop: "1px solid var(--vt-line-soft)", paddingTop: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <h4 className="vt-h3">Scadenzario</h4>
            {prossima && <span className="vt-micro">prossima scadenza {prossima}</span>}
          </div>
          <AgingBar invoices={invoices} active={bucket} onPick={setBucket} />
        </div>
      </Sheet>

      <Sheet style={{ marginTop: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="vt-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: 142 }}>Numero</th>
                {showCustomer && <th scope="col">Cliente</th>}
                <th scope="col" style={{ width: 110 }}>Emessa</th>
                <th scope="col" style={{ width: 132 }}>Scadenza</th>
                <th scope="col" style={{ width: 140 }}>Ordine</th>
                <th scope="col" style={{ width: 126, textAlign: "right" }}>Totale</th>
                <th scope="col" style={{ width: 140 }}>Stato</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(inv => (
                <tr key={inv.id} className="vt-clickable" onClick={() => onOpen(inv.id)} tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter") onOpen(inv.id) }}>
                  <td><span className="vt-code">{inv.id}</span></td>
                  {showCustomer && (
                    <td className="vt-ell">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                        <Avatar name={customerById(inv.customerId).name} />
                        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {customerById(inv.customerId).name}
                        </span>
                      </span>
                    </td>
                  )}
                  <td className="vt-muted">{inv.emessa}</td>
                  <td className="vt-muted">
                    {inv.scadenza}
                    {inv.state === "scaduta" && (
                      <span className="vt-micro" style={{ display: "block", color: "var(--vt-bad)" }}>
                        {daysLate(inv.scadenza)} gg di ritardo
                      </span>
                    )}
                  </td>
                  <td><span className="vt-code">{inv.ordine ?? "—"}</span></td>
                  <td className="vt-num">{eur(invoiceTotals(inv).totale)}</td>
                  <td><InvoiceStamp s={inv.state} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sheet>
    </div>
  )
}

/* ── Clienti e Listini: registri sottili, ma la loro presenza è parte della
      storia dei permessi ─────────────────────────────────────────────────── */

export function ScreenClienti({ customers, onOpen }: { customers: Customer[]; onOpen: (id: string) => void }) {
  return (
    <div>
      <Sheet>
        <CardHead title="Clienti" sub={`${customers.length} anagrafiche · clicca una riga per la scheda`} />
      </Sheet>
      <Sheet style={{ marginTop: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="vt-table">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col" style={{ width: 90 }}>Listino</th>
                <th scope="col" style={{ width: 116, textAlign: "right" }}>Fido</th>
                <th scope="col" style={{ width: 126, textAlign: "right" }}>Esposizione</th>
                <th scope="col" style={{ width: 116, textAlign: "right" }}>Scaduto</th>
                <th scope="col" style={{ width: 150 }}>Agente</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="vt-clickable" onClick={() => onOpen(c.id)} tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter") onOpen(c.id) }}>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
                      <Avatar name={c.name} />
                      <span style={{ minWidth: 0 }}>
                        {c.name}
                        <span className="vt-micro" style={{ display: "block" }}>{c.city}</span>
                      </span>
                    </span>
                  </td>
                  <td><span className="vt-code">{c.listino}</span></td>
                  <td className="vt-num">{eur(c.fido, 0)}</td>
                  <td className="vt-num">{eur(c.esposizione, 0)}</td>
                  <td className="vt-num" style={c.scaduto > 0 ? { color: "var(--vt-bad)" } : undefined}>
                    {c.scaduto > 0 ? eur(c.scaduto, 0) : "—"}
                  </td>
                  <td className="vt-small">{c.agente}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sheet>
    </div>
  )
}

export function ScreenListini() {
  return (
    <div>
      <Sheet>
        <CardHead title="Listini" sub="Sconti base per fascia commerciale" />
      </Sheet>
      <Sheet style={{ marginTop: 16 }}>
        <div style={{ overflowX: "auto" }}>
        <table className="vt-table">
          <thead>
            <tr>
              <th scope="col" style={{ width: 90 }}>Codice</th>
              <th scope="col">Nome</th>
              <th scope="col" style={{ width: 116, textAlign: "right" }}>Sconto base</th>
              <th scope="col" style={{ width: 150, textAlign: "right" }}>Clienti assegnati</th>
              <th scope="col" style={{ width: 130 }}>Valido dal</th>
            </tr>
          </thead>
          <tbody>
            {LISTINI.map(l => (
              <tr key={l.code}>
                <td><span className="vt-code">{l.code}</span></td>
                <td>{l.name}</td>
                <td className="vt-num">{num(l.sconto)} %</td>
                <td className="vt-num">{l.clienti}</td>
                <td className="vt-muted">{l.dal}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Sheet>
    </div>
  )
}
