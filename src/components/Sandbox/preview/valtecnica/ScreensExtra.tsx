import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  DOC_KIND_LABEL, PRODUCTS, QUOTE_STATE_LABEL, TICKET_KIND_LABEL, TICKET_STATE_LABEL,
  contractPrice, customerById, eur, num, productBySku,
  type Doc, type DocKind, type Quote, type QuoteState, type RoleId,
  type Ticket, type TicketKind, type TicketState,
} from "./data"
import { Avatar, CardHead, Cartiglio, Denied, ExportBtn, Sheet, Stamp } from "./parts"

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ══════════════════════════════════════════════════════════════════════════
   PREVENTIVI (RFQ)
   Sulle voci senza prezzo a listino si tratta: richiesta → quotazione →
   accettazione. È il flusso che distingue un portale B2B da un e-commerce.
══════════════════════════════════════════════════════════════════════════ */

const QUOTE_TONE: Record<QuoteState, string> = {
  inviata: "ambra", quotata: "verified", accettata: "verified", rifiutata: "oxide", scaduta: "neutral",
}

export const QuoteStamp = ({ s }: { s: QuoteState }) =>
  <Stamp tone={QUOTE_TONE[s]}>{QUOTE_STATE_LABEL[s]}</Stamp>

export function ScreenPreventivi({ quotes, role, onOpen, onNew }: {
  quotes: Quote[]; role: RoleId; onOpen: (id: string) => void; onNew: () => void
}) {
  const [filter, setFilter] = useState<QuoteState | "tutti">("tutti")
  const showCustomer = role !== "cliente"

  const counts = useMemo(() => {
    const m: Record<string, number> = { tutti: quotes.length }
    for (const q of quotes) m[q.state] = (m[q.state] ?? 0) + 1
    return m
  }, [quotes])
  const rows = filter === "tutti" ? quotes : quotes.filter(q => q.state === filter)

  return (
    <div>
      <Sheet>
        <CardHead
          title="Preventivi"
          sub="Richieste di quotazione sulle voci fuori listino."
          right={
            <span style={{ display: "flex", gap: 8 }}>
              <ExportBtn name="preventivi-valtecnica.csv" rows={() => [
                ["Numero", "Cliente", "Articolo", "Quantita", "Data", "Prezzo quotato", "Valido al", "Stato"],
                ...rows.map(q => [q.id, customerById(q.customerId).name, q.sku, q.qty, q.date,
                  q.prezzo ? q.prezzo.toFixed(2).replace(".", ",") : "", q.validaAl ?? "", QUOTE_STATE_LABEL[q.state]]),
              ]} />
              <button type="button" className="vt-btn vt-btn-primary vt-btn-sm" onClick={onNew}>
                Nuova richiesta
              </button>
            </span>
          }
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([["tutti", "Tutti"], ["inviata", "In attesa"], ["quotata", "Quotate"], ["accettata", "Accettate"], ["scaduta", "Scadute"]] as const).map(([id, label]) => (
            <button key={id} type="button" className="vt-chip"
              aria-pressed={filter === id} onClick={() => setFilter(id as QuoteState | "tutti")}>
              {label} <span className="vt-chip-n">{counts[id] ?? 0}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet style={{ marginTop: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="vt-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: 130 }}>Numero</th>
                {showCustomer && <th scope="col">Cliente</th>}
                <th scope="col" style={{ width: 150 }}>Articolo</th>
                <th scope="col" style={{ width: 80, textAlign: "right" }}>Q.tà</th>
                <th scope="col" style={{ width: 110 }}>Richiesta</th>
                <th scope="col" style={{ width: 130, textAlign: "right" }}>Quotato</th>
                <th scope="col" style={{ width: 190 }}>Stato</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(q => (
                <tr key={q.id} className="vt-clickable" onClick={() => onOpen(q.id)} tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter") onOpen(q.id) }}>
                  <td><span className="vt-code">{q.id}</span></td>
                  {showCustomer && (
                    <td className="vt-ell">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                        <Avatar name={customerById(q.customerId).name} />
                        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {customerById(q.customerId).name}
                        </span>
                      </span>
                    </td>
                  )}
                  <td><span className="vt-code">{q.sku}</span></td>
                  <td className="vt-num">{num(q.qty)}</td>
                  <td className="vt-muted">{q.date}</td>
                  <td className="vt-num">{q.prezzo ? eur(q.prezzo) : "—"}</td>
                  <td><QuoteStamp s={q.state} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="vt-body vt-muted" style={{ padding: 24, textAlign: "center" }}>
            Nessun preventivo in questo stato.
          </p>
        )}
      </Sheet>
    </div>
  )
}

export function QuoteDrawer({ quote, role, onClose, onRespond, onAccept, onToCart }: {
  quote: Quote
  role: RoleId
  onClose: () => void
  onRespond: (id: string, prezzo: number) => void
  onAccept: (id: string) => void
  onToCart: (q: Quote) => void
}) {
  const p = productBySku(quote.sku)
  const c = customerById(quote.customerId)
  const isAdmin = role === "admin"
  const [prezzo, setPrezzo] = useState(String(quote.prezzo ?? Math.round(p.listino * 0.72 * 100) / 100))

  return (
    <>
      <div className="vt-drawer-scrim" onClick={onClose} />
      <motion.aside className="vt-drawer" role="dialog" aria-label={`Preventivo ${quote.id}`}
        initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.18, ease }}>
        <div className="vt-drawer-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <h3 className="vt-h2">{quote.id}</h3>
              <p className="vt-small vt-muted" style={{ marginTop: 3 }}>{c.name}</p>
            </div>
            <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" onClick={onClose}>Chiudi</button>
          </div>
        </div>

        <div className="vt-drawer-body">
          <Cartiglio fields={[
            { k: "Articolo", v: p.sku },
            { k: "Quantità", v: `${num(quote.qty)} ${p.um}` },
            { k: "Richiesta il", v: quote.date },
            { k: "Stato", v: QUOTE_STATE_LABEL[quote.state] },
          ]} />

          <p className="vt-small" style={{ marginTop: 16 }}>{p.name}</p>

          {quote.note && (
            <div style={{ marginTop: 16 }}>
              <span className="vt-label" style={{ display: "block", marginBottom: 6 }}>Richiesta del cliente</span>
              <p className="vt-body" style={{ padding: 14, background: "var(--vt-sheet-alt)", borderRadius: "var(--vt-r-ctl)" }}>
                {quote.note}
              </p>
            </div>
          )}

          {quote.prezzo != null && (
            <div style={{ marginTop: 18, padding: 16, borderRadius: "var(--vt-r-tile)", background: "var(--vt-sheet-alt)" }}>
              <span className="vt-label">Prezzo quotato</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
                <span className="vt-figure">{eur(quote.prezzo)}</span>
                <span className="vt-small vt-muted">
                  a listino {eur(p.listino)} · totale {eur(quote.prezzo * quote.qty)}
                </span>
              </div>
              {quote.validaAl && (
                <p className="vt-micro" style={{ marginTop: 8 }}>
                  Offerta valida fino al {quote.validaAl}
                  {quote.state === "scaduta" && " · termine superato"}
                </p>
              )}
              {quote.rispostaNote && (
                <p className="vt-small vt-muted" style={{ marginTop: 10 }}>{quote.rispostaNote}</p>
              )}
            </div>
          )}

          <div style={{ height: 1, background: "var(--vt-line-soft)", margin: "20px -22px" }} />

          {/* Il back-office quota, il cliente accetta: due azioni, due ruoli. */}
          {isAdmin && quote.state === "inviata" && (
            <div>
              <span className="vt-field-label">Rispondi con un prezzo unitario</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input className="vt-input" style={{ width: 160 }} value={prezzo}
                  onChange={e => setPrezzo(e.target.value)} aria-label="Prezzo unitario quotato" inputMode="decimal" />
                <button type="button" className="vt-btn vt-btn-primary"
                  onClick={() => {
                    const n = parseFloat(prezzo.replace(",", "."))
                    if (!Number.isNaN(n) && n > 0) onRespond(quote.id, n)
                  }}>
                  Invia quotazione
                </button>
              </div>
              <p className="vt-micro" style={{ marginTop: 8 }}>
                L'offerta viene emessa con validità 30 giorni.
              </p>
            </div>
          )}

          {!isAdmin && quote.state === "inviata" && (
            <Denied>In attesa della quotazione del back-office. Ti avvisiamo appena è pronta.</Denied>
          )}

          {quote.state === "quotata" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="vt-btn vt-btn-primary" onClick={() => onAccept(quote.id)}>
                Accetta l'offerta
              </button>
              <button type="button" className="vt-btn vt-btn-secondary" onClick={() => onToCart(quote)}>
                Porta nel carrello
              </button>
            </div>
          )}

          {quote.state === "accettata" && (
            <button type="button" className="vt-btn vt-btn-primary" onClick={() => onToCart(quote)}>
              Ordina al prezzo concordato
            </button>
          )}

          {quote.state === "scaduta" && (
            <Denied>
              L'offerta è scaduta il {quote.validaAl}: per ordinare serve una nuova richiesta,
              perché i prezzi delle voci fuori listino cambiano con il mercato.
            </Denied>
          )}
        </div>
      </motion.aside>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ASSISTENZA E RECLAMI
══════════════════════════════════════════════════════════════════════════ */
const TICKET_TONE: Record<TicketState, string> = {
  aperto: "ambra", "in-lavorazione": "ambra", risolto: "verified",
}

export function ScreenAssistenza({ tickets, role, onOpen, onNew }: {
  tickets: Ticket[]; role: RoleId; onOpen: (id: string) => void; onNew: () => void
}) {
  const [kind, setKind] = useState<TicketKind | "tutti">("tutti")
  const showCustomer = role !== "cliente"
  const rows = kind === "tutti" ? tickets : tickets.filter(t => t.kind === kind)

  return (
    <div>
      <Sheet>
        <CardHead
          title="Assistenza"
          sub="Resi, domande tecniche e pratiche amministrative."
          right={
            <button type="button" className="vt-btn vt-btn-primary vt-btn-sm" onClick={onNew}>
              Apri una richiesta
            </button>
          }
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([["tutti", "Tutte"], ["reclamo", "Resi"], ["tecnico", "Tecniche"], ["amministrativo", "Amministrative"]] as const).map(([id, label]) => (
            <button key={id} type="button" className="vt-chip"
              aria-pressed={kind === id} onClick={() => setKind(id as TicketKind | "tutti")}>
              {label} <span className="vt-chip-n">
                {id === "tutti" ? tickets.length : tickets.filter(t => t.kind === id).length}
              </span>
            </button>
          ))}
        </div>
      </Sheet>

      <div className="vt-grid" style={{ marginTop: 16, gap: 12 }}>
        {rows.map(t => (
          <button key={t.id} type="button" className="vt-sheet" onClick={() => onOpen(t.id)}
            style={{ textAlign: "left", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
                <span className="vt-code">{t.id}</span>
                <Stamp tone={TICKET_TONE[t.state]}>{TICKET_STATE_LABEL[t.state]}</Stamp>
                <span className="vt-micro">{TICKET_KIND_LABEL[t.kind]}</span>
              </span>
              <span className="vt-h3" style={{ display: "block" }}>{t.subject}</span>
              <span className="vt-micro" style={{ display: "block", marginTop: 4 }}>
                {showCustomer && `${customerById(t.customerId).name} · `}
                aperta il {t.date} · {t.thread.length} messaggi
                {t.ordine && ` · ${t.ordine}`}
              </span>
            </span>
            <span className="vt-icon-btn" aria-hidden>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3.5L10.5 8L6 12.5" /></svg>
            </span>
          </button>
        ))}
        {rows.length === 0 && (
          <Sheet><p className="vt-body vt-muted" style={{ textAlign: "center", padding: 16 }}>
            Nessuna richiesta di questo tipo.
          </p></Sheet>
        )}
      </div>
    </div>
  )
}

export function TicketDrawer({ ticket, role, onClose, onReply, onResolve }: {
  ticket: Ticket
  role: RoleId
  onClose: () => void
  onReply: (id: string, text: string) => void
  onResolve: (id: string) => void
}) {
  const [text, setText] = useState("")
  const isStaff = role !== "cliente"

  return (
    <>
      <div className="vt-drawer-scrim" onClick={onClose} />
      <motion.aside className="vt-drawer" role="dialog" aria-label={`Richiesta ${ticket.id}`}
        initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.18, ease }}>
        <div className="vt-drawer-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <h3 className="vt-h2">{ticket.subject}</h3>
              <p className="vt-small vt-muted" style={{ marginTop: 3 }}>
                {ticket.id} · {TICKET_KIND_LABEL[ticket.kind]} · {customerById(ticket.customerId).name}
              </p>
            </div>
            <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" onClick={onClose}>Chiudi</button>
          </div>
        </div>

        <div className="vt-drawer-body">
          <Cartiglio fields={[
            { k: "Aperta il", v: ticket.date },
            { k: "Stato", v: TICKET_STATE_LABEL[ticket.state] },
            { k: "Ordine", v: ticket.ordine ?? "—" },
            { k: "Articolo", v: ticket.sku ?? "—" },
          ]} />

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {ticket.thread.map((m, i) => {
              const mine = m.from === "cliente"
              return (
                <div key={i} style={{
                  padding: 14, borderRadius: "var(--vt-r-tile)",
                  background: mine ? "var(--vt-sheet-alt)" : "var(--vt-accent-wash)",
                  marginLeft: mine ? 0 : 24, marginRight: mine ? 24 : 0,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                    <span className="vt-small" style={{ fontWeight: 600 }}>{m.who}</span>
                    <span className="vt-micro">{m.when}</span>
                  </div>
                  <p className="vt-small">{m.text}</p>
                </div>
              )
            })}
          </div>

          {ticket.state !== "risolto" ? (
            <div style={{ marginTop: 20 }}>
              <span className="vt-field-label">Rispondi</span>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Scrivi un messaggio…" aria-label="Messaggio"
                style={{
                  width: "100%", height: 84, padding: 14, resize: "vertical", border: 0,
                  background: "var(--vt-sheet-alt)", borderRadius: "var(--vt-r-ctl)",
                  fontSize: 14, lineHeight: 1.6, color: "var(--vt-ink)", fontFamily: "inherit",
                }} />
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button type="button" className="vt-btn vt-btn-primary" disabled={!text.trim()}
                  onClick={() => { onReply(ticket.id, text.trim()); setText("") }}>
                  Invia
                </button>
                <button type="button" className="vt-btn vt-btn-secondary" disabled={!isStaff}
                  onClick={() => onResolve(ticket.id)}>
                  Segna come risolta
                </button>
              </div>
              {!isStaff && (
                <div style={{ marginTop: 10 }}>
                  <Denied>Solo l'assistenza può chiudere una pratica (403).</Denied>
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <Denied>Pratica chiusa. Per riaprirla, apri una nuova richiesta citando {ticket.id}.</Denied>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   CENTRO DOCUMENTI
══════════════════════════════════════════════════════════════════════════ */
const DOC_ICON: Record<DocKind, string> = {
  contratto: "M4 2.5h8l2 2v11H4z", certificato: "M8 2.5l5 2.5v4c0 3-2 5-5 6-3-1-5-3-5-6v-4z",
  scheda: "M4 2.5h8v13H4z", garanzia: "M8 2.5l5 2.5v4c0 3-2 5-5 6-3-1-5-3-5-6v-4z", listino: "M3 4h10M3 8h10M3 12h7",
}

export function ScreenDocumenti({ docs, onDownload }: {
  docs: Doc[]; onDownload: (d: Doc) => void
}) {
  const [kind, setKind] = useState<DocKind | "tutti">("tutti")
  const [q, setQ] = useState("")

  const rows = useMemo(() => docs.filter(d => {
    if (kind !== "tutti" && d.kind !== kind) return false
    if (!q.trim()) return true
    const t = q.trim().toLowerCase()
    return d.title.toLowerCase().includes(t) || (d.sku ?? "").toLowerCase().includes(t) || (d.ordine ?? "").toLowerCase().includes(t)
  }), [docs, kind, q])

  const kinds: (DocKind | "tutti")[] = ["tutti", "contratto", "certificato", "scheda", "garanzia", "listino"]

  return (
    <div>
      <Sheet>
        <CardHead
          title="Centro documenti"
          sub="Contratti, certificati e schede tecniche, accanto a ciò a cui si riferiscono."
          right={
            <input className="vt-input" style={{ width: 230 }} value={q} onChange={e => setQ(e.target.value)}
              placeholder="Cerca documento o codice" aria-label="Cerca fra i documenti" />
          }
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {kinds.map(k => (
            <button key={k} type="button" className="vt-chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
              {k === "tutti" ? "Tutti" : DOC_KIND_LABEL[k]}
              <span className="vt-chip-n">{k === "tutti" ? docs.length : docs.filter(d => d.kind === k).length}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet style={{ marginTop: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="vt-table">
            <thead>
              <tr>
                <th scope="col">Documento</th>
                <th scope="col" style={{ width: 140 }}>Tipo</th>
                <th scope="col" style={{ width: 150 }}>Riferimento</th>
                <th scope="col" style={{ width: 110 }}>Data</th>
                <th scope="col" style={{ width: 80, textAlign: "right" }}>Pagine</th>
                <th scope="col" style={{ width: 120 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map(d => (
                <tr key={d.id}>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        background: "var(--vt-sheet-alt)", color: "var(--vt-ink-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                          strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d={DOC_ICON[d.kind]} />
                        </svg>
                      </span>
                      <span style={{ minWidth: 0 }}>
                        {d.title}
                        <span className="vt-micro" style={{ display: "block" }}>{d.id}</span>
                      </span>
                    </span>
                  </td>
                  <td className="vt-muted">{DOC_KIND_LABEL[d.kind]}</td>
                  <td><span className="vt-code">{d.sku ?? d.ordine ?? "—"}</span></td>
                  <td className="vt-muted">{d.date}</td>
                  <td className="vt-num">{d.pages}</td>
                  <td>
                    <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm" onClick={() => onDownload(d)}>
                      Scarica PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="vt-body vt-muted" style={{ padding: 24, textAlign: "center" }}>
            Nessun documento per questi filtri.
          </p>
        )}
      </Sheet>

      <p className="vt-micro" style={{ marginTop: 14 }}>
        I PDF sono fac-simile generati al momento: contengono l'intestazione reale del documento
        e la dicitura che si tratta di dati dimostrativi.
      </p>
    </div>
  )
}

export { PRODUCTS, contractPrice }


/* ══════════════════════════════════════════════════════════════════════════
   NUOVA RICHIESTA — una sola finestra per preventivo e assistenza
   Cambia il contenuto, non la meccanica: stessa cornice, stessa uscita.
══════════════════════════════════════════════════════════════════════════ */
export function NewRequestModal({ mode, orders, onQuote, onTicket, onClose }: {
  mode: "quote" | "ticket"
  orders: { id: string }[]
  onQuote: (sku: string, qty: number, note: string) => void
  onTicket: (kind: TicketKind, subject: string, text: string, ordine?: string) => void
  onClose: () => void
}) {
  const quotables = PRODUCTS.filter(p => p.suRichiesta)
  const [sku, setSku] = useState(quotables[0]?.sku ?? PRODUCTS[0].sku)
  const [qty, setQty] = useState("4")
  const [note, setNote] = useState("")
  const [kind, setKind] = useState<TicketKind>("reclamo")
  const [subject, setSubject] = useState("")
  const [ordine, setOrdine] = useState("")

  const isQuote = mode === "quote"
  const valid = isQuote ? Number(qty) > 0 : subject.trim().length > 3 && note.trim().length > 5

  const field: React.CSSProperties = {
    width: "100%", padding: 14, border: 0, background: "var(--vt-sheet-alt)",
    borderRadius: "var(--vt-r-ctl)", fontSize: 14, color: "var(--vt-ink)", fontFamily: "inherit",
  }

  return (
    <div className="vt-palette-scrim" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="vt-palette" style={{ maxWidth: 560 }} role="dialog"
        aria-label={isQuote ? "Nuova richiesta di quotazione" : "Nuova richiesta di assistenza"}
        initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.18, ease }}>

        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid var(--vt-line-soft)", display: "flex", gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h3 className="vt-h2">{isQuote ? "Richiedi una quotazione" : "Apri una richiesta"}</h3>
            <p className="vt-small vt-muted" style={{ marginTop: 4 }}>
              {isQuote
                ? "Per le voci fuori listino il prezzo si concorda: rispondiamo entro un giorno lavorativo."
                : "Reso di merce difettosa, domanda tecnica o pratica amministrativa."}
            </p>
          </div>
          <button type="button" className="vt-icon-btn" onClick={onClose} aria-label="Chiudi" style={{ marginLeft: "auto" }}>✕</button>
        </div>

        <div className="vt-palette-list" style={{ padding: "18px 22px 4px", display: "flex", flexDirection: "column", gap: 16 }}>
          {isQuote ? (
            <>
              <label>
                <span className="vt-field-label">Articolo</span>
                <select className="vt-select" value={sku} onChange={e => setSku(e.target.value)}
                  style={{ height: 46, borderRadius: "var(--vt-r-ctl)" }}>
                  {quotables.map(p => <option key={p.sku} value={p.sku}>{p.sku} — {p.name}</option>)}
                </select>
              </label>
              <label>
                <span className="vt-field-label">Quantità</span>
                <input className="vt-input" value={qty} onChange={e => setQty(e.target.value)}
                  inputMode="numeric" style={{ height: 46, borderRadius: "var(--vt-r-ctl)" }} />
              </label>
              <label>
                <span className="vt-field-label">Note per il back-office · facoltativo</span>
                <textarea value={note} onChange={e => setNote(e.target.value)} style={{ ...field, height: 92, resize: "vertical" }}
                  placeholder="Vincoli di consegna, accessori, varianti…" />
              </label>
            </>
          ) : (
            <>
              <div>
                <span className="vt-field-label">Tipo di richiesta</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(Object.keys(TICKET_KIND_LABEL) as TicketKind[]).map(k => (
                    <button key={k} type="button" className="vt-chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
                      {TICKET_KIND_LABEL[k]}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                <span className="vt-field-label">Oggetto</span>
                <input className="vt-input" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="In due parole, di cosa si tratta" style={{ height: 46, borderRadius: "var(--vt-r-ctl)" }} />
              </label>
              <label>
                <span className="vt-field-label">Ordine di riferimento · facoltativo</span>
                <select className="vt-select" value={ordine} onChange={e => setOrdine(e.target.value)}
                  style={{ height: 46, borderRadius: "var(--vt-r-ctl)" }}>
                  <option value="">Nessuno</option>
                  {orders.slice(0, 12).map(o => <option key={o.id} value={o.id}>{o.id}</option>)}
                </select>
              </label>
              <label>
                <span className="vt-field-label">Descrizione</span>
                <textarea value={note} onChange={e => setNote(e.target.value)} style={{ ...field, height: 108, resize: "vertical" }}
                  placeholder="Cosa è successo, su quale articolo, da quando." />
              </label>
            </>
          )}
        </div>

        <div className="vt-pop-foot" style={{ display: "flex", gap: 10, padding: "14px 22px" }}>
          <p className="vt-micro" style={{ flex: 1 }}>
            {isQuote ? "Nessun impegno: è una richiesta di prezzo." : "Riceverai una risposta in questa stessa pratica."}
          </p>
          <button type="button" className="vt-btn vt-btn-secondary" onClick={onClose}>Annulla</button>
          <button type="button" className="vt-btn vt-btn-primary" disabled={!valid}
            onClick={() => {
              if (isQuote) onQuote(sku, parseInt(qty, 10) || 1, note.trim())
              else onTicket(kind, subject.trim(), note.trim(), ordine || undefined)
              onClose()
            }}>
            Invia
          </button>
        </div>
      </motion.div>
    </div>
  )
}
