import React, { useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientHome, TicketPriority } from "../../lib/api"
import { createTicket, fmtDateTime, relativeDate } from "../../lib/api"
import {
  Badge, Btn, DISPLAY, Empty, Field, Glass, Icon, Input, Kicker, MONO,
  SectionTitle, Select, T, Textarea, TICKET_PRIORITY, TICKET_STATUS,
} from "../ui"

export default function Support({ home, userId, reload }: {
  home: ClientHome
  userId: string
  reload: () => void
}) {
  const toast = useToast()
  const [subject, setSubject] = useState("")
  const [priority, setPriority] = useState<TicketPriority>("medium")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!subject.trim() || !message.trim() || busy) return
    setBusy(true)
    try {
      await createTicket({ clientId: userId, subject, message, priority })
      setSubject(""); setMessage(""); setPriority("medium")
      toast.success("Ticket inviato — ti rispondiamo a breve")
      reload()
    } catch {
      toast.error("Invio non riuscito. Riprova.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle kicker="Supporto" title="Assistenza tecnica" sub="Segnala un problema: priorità alta e critica hanno precedenza." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, alignItems: "start" }}>
        {/* New ticket */}
        <Glass variant="panel" style={{ padding: 20, maxWidth: 460 }}>
          <Kicker>Nuovo ticket</Kicker>
          <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 14 }}>
            <Field label="Oggetto">
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Es. Errore nel form contatti" />
            </Field>
            <Field label="Priorità">
              <Select value={priority} onChange={e => setPriority(e.target.value as TicketPriority)}>
                {(Object.keys(TICKET_PRIORITY) as TicketPriority[]).map(p => (
                  <option key={p} value={p}>{TICKET_PRIORITY[p].label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Descrizione" hint="Cosa succede, dove, e da quando.">
              <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Descrivi il problema…" style={{ resize: "vertical" }} />
            </Field>
            <Btn variant="primary" icon="send" onClick={submit} busy={busy} disabled={!subject.trim() || !message.trim()}>
              Invia ticket
            </Btn>
          </div>
        </Glass>

        {/* Ticket history */}
        <Glass variant="panel" style={{ padding: 20 }}>
          <Kicker>I tuoi ticket</Kicker>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {home.tickets.length === 0 ? (
              <Empty icon="ticket" title="Nessun ticket" hint="Le tue segnalazioni e le nostre risposte vivono qui." />
            ) : (
              home.tickets.map(t => {
                const ts = TICKET_STATUS[t.status]
                const tp = TICKET_PRIORITY[t.priority]
                return (
                  <div key={t.id} style={{
                    padding: "13px 15px", borderRadius: 12,
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h4 style={{ flex: 1, minWidth: 140, fontFamily: DISPLAY, fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>
                        {t.subject}
                      </h4>
                      <Badge tone={tp.tone}>{tp.label}</Badge>
                      <Badge tone={ts.tone} dot>{ts.label}</Badge>
                    </div>
                    <p style={{ fontFamily: DISPLAY, fontSize: 12, lineHeight: 1.55, color: T.faint, margin: "7px 0 0", whiteSpace: "pre-wrap" }}>
                      {t.message}
                    </p>
                    <p style={{ fontFamily: MONO, fontSize: 8.5, color: T.ghost, margin: "8px 0 0", letterSpacing: "0.05em" }}>
                      {relativeDate(t.createdAt)}
                    </p>
                    {t.adminNote && (
                      <div style={{
                        marginTop: 10, padding: "10px 13px", borderRadius: 10,
                        background: "rgba(176,74,56,0.08)", borderLeft: `2px solid ${T.copper}`,
                      }}>
                        <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.copperLt, margin: 0 }}>
                          <Icon name="sparkle" size={10} /> Risposta dello studio
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
              })
            )}
          </div>
        </Glass>
      </div>
    </div>
  )
}
