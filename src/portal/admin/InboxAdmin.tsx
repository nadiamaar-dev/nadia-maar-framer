import React, { useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { AdminHome, Conversation, SupportTicket, TicketStatus } from "../../lib/api"
import {
  fmtDateTime, fmtEur, isUnreadFor, relativeDate, updateConversationStatus, updateTicket,
} from "../../lib/api"
import ChatThread from "../ChatThread"
import {
  Badge, Btn, CONVO_STATUS, DISPLAY, Empty, Field, Glass, Icon, Input, MONO,
  SectionTitle, Select, T, Tabs, Textarea, TICKET_PRIORITY, TICKET_STATUS,
} from "../ui"

/* ══════════════════════════════════════════════════════════════════════════
   INBOX — la metà studio di «Richieste».

   Rimpiazza MessagesAdmin e SupportAdmin, che mostravano gli stessi clienti
   in due elenchi separati: rispondere a un ticket voleva dire aprire un
   modale e riscrivere ogni volta l'unico campo `admin_note`, mentre la
   conversazione con la stessa persona viveva in un'altra sezione.

   Qui la conversazione è sempre in vista e i comandi della richiesta di
   lavoro (stato, preventivo, sintesi) stanno accanto, non al posto suo.
══════════════════════════════════════════════════════════════════════════ */

type Filter = "da-gestire" | "tutte"

export default function InboxAdmin({ home, adminId, reload, focusId = null }: {
  home: AdminHome
  adminId: string
  reload: () => void
  /** Filo da aprire arrivando da fuori (coda operativa, scheda cliente). */
  focusId?: string | null
}) {
  const toast = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("da-gestire")
  const [busy, setBusy] = useState(false)

  /* pannello richiesta */
  const [note, setNote] = useState("")
  const [status, setStatus] = useState<TicketStatus>("in-progress")
  const [estAmount, setEstAmount] = useState("")
  const [estHours, setEstHours] = useState("")

  const ticketOf = (c: Conversation): SupportTicket | undefined =>
    c.ticketId ? home.tickets.find(t => t.id === c.ticketId) : undefined

  const all = useMemo(() => home.threads.filter(c => !c.stageId).sort((a, b) => {
    const ua = isUnreadFor(a, "admin") ? 0 : 1
    const ub = isUnreadFor(b, "admin") ? 0 : 1
    if (ua !== ub) return ua - ub
    if (a.status === "closed" && b.status !== "closed") return 1
    if (b.status === "closed" && a.status !== "closed") return -1
    return b.lastMessageAt.localeCompare(a.lastMessageAt)
  }), [home.threads])

  const pending = (c: Conversation) => {
    const t = ticketOf(c)
    return isUnreadFor(c, "admin") || (t ? t.status !== "resolved" : c.status !== "closed")
  }
  const inbox = filter === "da-gestire" ? all.filter(pending) : all
  const pendingCount = all.filter(pending).length

  const selected = inbox.find(c => c.id === selectedId) ?? null
  const selectedTicket = selected ? ticketOf(selected) : undefined
  const projectName = (id?: string) => home.projects.find(p => p.id === id)?.name

  /* Il pannello segue la selezione: i campi si ricaricano dal ticket aperto,
     altrimenti si scriverebbe la sintesi di una richiesta dentro un'altra. */
  const select = React.useCallback((c: Conversation) => {
    setSelectedId(c.id)
    const t = c.ticketId ? home.tickets.find(x => x.id === c.ticketId) : undefined
    setNote(t?.adminNote ?? "")
    setStatus(t?.status === "new" ? "in-progress" : t?.status ?? "in-progress")
    setEstAmount(t?.estimateAmount != null ? String(t.estimateAmount) : "")
    setEstHours(t?.estimateHours != null ? String(t.estimateHours) : "")
  }, [home.tickets])

  /* Arrivo mirato: la coda operativa dice «Rispondi a X», e X va aperto. Se
     il filo è già chiuso passiamo a «Tutte», altrimenti il filtro predefinito
     lo nasconderebbe e sembrerebbe che il link non abbia fatto niente.

     Una volta sola per ogni focusId: `all` si ricostruisce a ogni refresh
     realtime, e senza questo guardiano la selezione tornerebbe da sola sul
     filo del link ogni volta che arriva un messaggio qualsiasi. */
  const focusDone = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (!focusId) { focusDone.current = null; return }
    if (focusDone.current === focusId) return
    const c = all.find(x => x.id === focusId)
    if (!c) return
    focusDone.current = focusId
    select(c)
    if (!pending(c)) setFilter("tutte")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, all, select])

  async function saveTicket() {
    if (!selectedTicket || busy) return
    setBusy(true)
    try {
      const amount = estAmount.trim() ? Number(estAmount.replace(",", ".")) : null
      const hours = estHours.trim() ? Number(estHours.replace(",", ".")) : null
      await updateTicket(selectedTicket.id, {
        status,
        adminNote: note.trim() || undefined,
        estimateAmount: amount != null && !Number.isNaN(amount) ? amount : null,
        estimateHours: hours != null && !Number.isNaN(hours) ? hours : null,
      })
      toast.success("Richiesta aggiornata")
      reload()
    } catch {
      toast.error("Aggiornamento non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  async function setConvoStatus(s: "closed" | "open") {
    if (!selected) return
    try {
      await updateConversationStatus(selected.id, s)
      toast.info(s === "closed" ? "Conversazione chiusa" : "Conversazione riaperta")
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Inbox"
        title="Richieste e messaggi"
        sub="Un filo per cliente e tema. Le discussioni di fase restano nei dossier dei progetti."
        right={
          <Tabs<Filter>
            value={filter}
            onChange={setFilter}
            items={[
              { id: "da-gestire", label: "Da gestire", badge: pendingCount || undefined },
              { id: "tutte", label: "Tutte" },
            ]}
          />
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 16, alignItems: "start" }}>
        {/* ── Elenco ── */}
        <Glass variant="work" style={{ padding: 12, maxWidth: 420 }}>
          {inbox.length === 0 ? (
            <Empty icon="chat" title={filter === "da-gestire" ? "Niente da gestire" : "Inbox vuota"}
              hint={filter === "da-gestire" ? "Tutte le richieste sono state chiuse." : "Le richieste dei clienti appariranno qui."} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 620, overflowY: "auto" }}>
              {inbox.map(c => {
                const t = ticketOf(c)
                const unread = isUnreadFor(c, "admin")
                const sel = c.id === selectedId
                return (
                  <button
                    key={c.id}
                    onClick={() => select(c)}
                    className={sel ? undefined : "portal-row"}
                    style={{
                      display: "flex", flexDirection: "column", gap: 6, textAlign: "left",
                      padding: "11px 13px", borderRadius: 11, cursor: "pointer",
                      background: sel ? "rgba(184,50,64,0.14)" : "transparent",
                      border: `1px solid ${sel ? "rgba(184,50,64,0.32)" : "transparent"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                      {unread && <span style={{ width: 7, height: 7, borderRadius: 99, background: T.copperLt, flexShrink: 0, boxShadow: "0 0 8px rgba(184,50,64,0.85)" }} />}
                      <span style={{
                        flex: 1, minWidth: 0, fontFamily: DISPLAY, fontSize: 14, fontWeight: unread ? 800 : 600,
                        color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {c.subject}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 11.5, color: T.secondary, flexShrink: 0 }}>{relativeDate(c.lastMessageAt)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: MONO, fontSize: 12.5, color: T.secondary, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.clientName ?? "—"}
                      </span>
                      {t ? (
                        <>
                          <Badge tone={TICKET_PRIORITY[t.priority].tone}>{TICKET_PRIORITY[t.priority].label}</Badge>
                          <Badge tone={TICKET_STATUS[t.status].tone} dot>{TICKET_STATUS[t.status].label}</Badge>
                          {t.estimateAcceptedAt && <Badge tone="green" dot>Approvato</Badge>}
                        </>
                      ) : (
                        <Badge tone={CONVO_STATUS[c.status].tone} dot>{CONVO_STATUS[c.status].label}</Badge>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </Glass>

        {/* ── Filo + pannello richiesta ── */}
        <Glass variant="work" style={{ padding: 18 }}>
          {selected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, paddingBottom: 12, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ fontFamily: DISPLAY, fontSize: 16.5, fontWeight: 800, color: T.text, margin: 0 }}>{selected.subject}</h3>
                  <p style={{ fontFamily: DISPLAY, fontSize: 13.5, color: T.secondary, margin: "6px 0 0" }}>
                    {selected.clientName ?? "—"}
                    {selectedTicket?.projectId ? ` · ${projectName(selectedTicket.projectId) ?? "progetto"}` : ""}
                  </p>
                </div>
                {selected.status === "closed"
                  ? <Btn size="sm" variant="outline" icon="play" onClick={() => setConvoStatus("open")}>Riapri</Btn>
                  : <Btn size="sm" variant="outline" icon="check" onClick={() => setConvoStatus("closed")}>Chiudi</Btn>}
              </div>

              {/* Pannello richiesta di lavoro — presente solo se il filo è
                  tipizzato come tale; altrimenti è una conversazione e basta. */}
              {selectedTicket && (
                <div style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(184,50,64,0.07)", border: "1px solid rgba(184,50,64,0.22)",
                  display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Icon name="ticket" size={14} style={{ color: T.copperTx }} />
                    <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.11em", textTransform: "uppercase", color: T.copperTx }}>
                      Richiesta di lavoro
                    </span>
                    <span style={{ flex: 1 }} />
                    {selectedTicket.estimateAcceptedAt && (
                      <Badge tone="green" dot>Preventivo approvato {fmtDateTime(selectedTicket.estimateAcceptedAt)}</Badge>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))", gap: 12 }}>
                    <Field label="Stato">
                      <Select value={status} onChange={e => setStatus(e.target.value as TicketStatus)}>
                        <option value="in-progress">In lavorazione</option>
                        <option value="resolved">Risolto</option>
                      </Select>
                    </Field>
                    <Field label="Preventivo €">
                      <Input value={estAmount} onChange={e => setEstAmount(e.target.value)} placeholder="0" inputMode="decimal" />
                    </Field>
                    <Field label="Ore stimate">
                      <Input value={estHours} onChange={e => setEstHours(e.target.value)} placeholder="0" inputMode="decimal" />
                    </Field>
                  </div>

                  <Field label="Sintesi per il cliente" hint="Un campo solo: riscriverlo sostituisce il precedente. Il botta e risposta sta nel filo qui sotto.">
                    <Textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ resize: "vertical" }}
                      placeholder="Esito, prossimi passi, cosa serve da loro…" />
                  </Field>

                  <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                    <Btn variant="primary" icon="check" onClick={saveTicket} busy={busy}>Salva richiesta</Btn>
                    {selectedTicket.estimateAmount != null && !selectedTicket.estimateAcceptedAt && (
                      <span style={{ display: "inline-flex", alignItems: "center", fontFamily: DISPLAY, fontSize: 13.5, color: T.secondary }}>
                        In attesa che il cliente approvi {fmtEur(selectedTicket.estimateAmount)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <ChatThread conversation={selected} role="admin" authorId={adminId} height={430} onChanged={reload} />
            </div>
          ) : (
            <Empty icon="chat" title="Seleziona una richiesta" hint="I fili con messaggi non letti sono in cima." />
          )}
        </Glass>
      </div>
    </div>
  )
}
