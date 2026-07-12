import React, { useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { AdminHome, SupportTicket, TicketStatus } from "../../lib/api"
import { fmtDateTime, relativeDate, updateTicket } from "../../lib/api"
import {
  Badge, Btn, DISPLAY, Empty, Field, Glass, Icon, Modal, MONO, SectionTitle, Select,
  T, Tabs, Textarea, TICKET_PRIORITY, TICKET_STATUS,
} from "../ui"

type Filter = "aperti" | "tutti"

export default function SupportAdmin({ home, reload }: {
  home: AdminHome
  reload: () => void
}) {
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>("aperti")
  const [replying, setReplying] = useState<SupportTicket | null>(null)
  const [reply, setReply] = useState("")
  const [replyStatus, setReplyStatus] = useState<TicketStatus>("resolved")
  const [busy, setBusy] = useState(false)

  const openCount = home.tickets.filter(t => t.status !== "resolved").length
  const list = filter === "aperti" ? home.tickets.filter(t => t.status !== "resolved") : home.tickets

  function openReply(t: SupportTicket) {
    setReply(t.adminNote ?? "")
    setReplyStatus(t.status === "new" ? "in-progress" : t.status)
    setReplying(t)
  }

  async function sendReply() {
    if (!replying || busy) return
    setBusy(true)
    try {
      await updateTicket(replying.id, { status: replyStatus, adminNote: reply.trim() || undefined })
      setReplying(null)
      toast.success("Ticket aggiornato")
      reload()
    } catch {
      toast.error("Aggiornamento non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle kicker="Supporto" title="Ticket di assistenza" sub={openCount > 0 ? `${openCount} ticket apert${openCount === 1 ? "o" : "i"}` : "Nessun ticket aperto"} />

      <Tabs<Filter>
        items={[
          { id: "aperti", label: "Aperti", badge: openCount || undefined },
          { id: "tutti", label: "Tutti" },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <Glass variant="panel" style={{ padding: 20 }}>
        {list.length === 0 ? (
          <Empty icon="checkCircle" title="Nessun ticket" hint={filter === "aperti" ? "Tutto risolto." : "Le segnalazioni dei clienti appariranno qui."} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map(t => {
              const ts = TICKET_STATUS[t.status]
              const tp = TICKET_PRIORITY[t.priority]
              return (
                <div key={t.id} style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h4 style={{ flex: 1, minWidth: 160, fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 800, color: T.text, margin: 0 }}>
                      {t.subject}
                    </h4>
                    <Badge tone={tp.tone}>{tp.label}</Badge>
                    <Badge tone={ts.tone} dot>{ts.label}</Badge>
                    <Btn size="sm" variant={t.status === "new" ? "primary" : "outline"} icon="send" onClick={() => openReply(t)}>
                      {t.adminNote ? "Aggiorna risposta" : "Rispondi"}
                    </Btn>
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: 9.5, color: T.ghost, margin: "6px 0 0" }}>
                    {t.clientName} · {relativeDate(t.createdAt)}
                  </p>
                  <p style={{ fontFamily: DISPLAY, fontSize: 12.5, lineHeight: 1.55, color: T.faint, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>
                    {t.message}
                  </p>
                  {t.adminNote && (
                    <div style={{
                      marginTop: 10, padding: "10px 13px", borderRadius: 10,
                      background: "rgba(174,83,80,0.08)", borderLeft: `2px solid ${T.copper}`,
                    }}>
                      <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.copperLt, margin: 0 }}>
                        <Icon name="sparkle" size={10} /> La tua risposta
                      </p>
                      <p style={{ fontFamily: DISPLAY, fontSize: 12.5, lineHeight: 1.55, color: T.muted, margin: "6px 0 0", whiteSpace: "pre-wrap" }}>
                        {t.adminNote}
                      </p>
                      {t.respondedAt && (
                        <p style={{ fontFamily: MONO, fontSize: 8.5, color: T.ghost, margin: "6px 0 0" }}>{fmtDateTime(t.respondedAt)}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Glass>

      {/* Reply modal */}
      <Modal
        open={!!replying}
        onClose={() => !busy && setReplying(null)}
        kicker="Supporto"
        title={replying ? `Rispondi · ${replying.subject}` : ""}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setReplying(null)} disabled={busy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={sendReply} busy={busy}>Salva risposta</Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {replying && (
            <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(255,255,255,0.035)", border: `1px solid ${T.border}` }}>
              <p style={{ fontFamily: MONO, fontSize: 9, color: T.ghost, margin: 0 }}>{replying.clientName}</p>
              <p style={{ fontFamily: DISPLAY, fontSize: 12.5, lineHeight: 1.5, color: T.faint, margin: "5px 0 0", whiteSpace: "pre-wrap" }}>
                {replying.message}
              </p>
            </div>
          )}
          <Field label="Risposta" hint="Visibile al cliente nella sua area Supporto.">
            <Textarea value={reply} onChange={e => setReply(e.target.value)} rows={5} autoFocus style={{ resize: "vertical" }} />
          </Field>
          <Field label="Stato">
            <Select value={replyStatus} onChange={e => setReplyStatus(e.target.value as TicketStatus)}>
              <option value="in-progress">In lavorazione</option>
              <option value="resolved">Risolto</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
