import React, { useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientHome, Conversation, SupportTicket, TicketPriority } from "../../lib/api"
import {
  acceptTicketEstimate, createTicket, fmtDateTime, fmtEur,
  getOrCreateTicketConversation, isUnreadFor, relativeDate,
} from "../../lib/api"
import ChatThread from "../ChatThread"
import {
  Badge, Btn, DISPLAY, Empty, Field, Glass, Icon, Input, Kicker, Loading, Modal, MONO,
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
  const [projectId, setProjectId] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [chatTicket, setChatTicket] = useState<SupportTicket | null>(null)
  const [chatConvo, setChatConvo] = useState<Conversation | null>(null)

  const projectName = (id?: string) => home.projects.find(p => p.id === id)?.name
  const threadFor = (ticketId: string) => home.threads.find(t => t.ticketId === ticketId)

  /* A ticket carries one admin_note that each reply overwrites, so the
     conversation has to live in the chat — which already does history,
     attachments, unread markers and notifying the studio. */
  async function openTicketChat(t: SupportTicket) {
    setChatTicket(t)
    setChatConvo(null)
    try {
      const convo = await getOrCreateTicketConversation({
        ticketId: t.id,
        clientId: userId,
        projectId: t.projectId,
        subject: `Ticket — ${t.subject}`,
      })
      setChatConvo(convo)
    } catch {
      setChatTicket(null)
      toast.error("Impossibile aprire la discussione.")
    }
  }

  async function submit() {
    if (!subject.trim() || !message.trim() || busy) return
    setBusy(true)
    try {
      await createTicket({ clientId: userId, subject, message, priority, projectId: projectId || undefined })
      setSubject(""); setMessage(""); setPriority("medium"); setProjectId("")
      toast.success("Ticket inviato — ti rispondiamo a breve")
      reload()
    } catch {
      toast.error("Invio non riuscito. Riprova.")
    } finally {
      setBusy(false)
    }
  }

  async function acceptEstimate(id: string) {
    if (accepting) return
    setAccepting(id)
    try {
      await acceptTicketEstimate(id)
      toast.success("Preventivo approvato — procediamo")
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    } finally {
      setAccepting(null)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle kicker="Supporto" title="Assistenza tecnica" sub="Segnala un problema: priorità alta e critica hanno precedenza." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 16, alignItems: "start" }}>
        {/* New ticket */}
        <Glass variant="work" style={{ padding: 20, maxWidth: 460 }}>
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
            {home.projects.length > 0 && (
              <Field label="Progetto (opzionale)" hint="Collega il ticket a un progetto per un supporto più rapido.">
                <Select value={projectId} onChange={e => setProjectId(e.target.value)}>
                  <option value="">Nessun progetto</option>
                  {home.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
            )}
            <Field label="Descrizione" hint="Cosa succede, dove, e da quando.">
              <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Descrivi il problema…" style={{ resize: "vertical" }} />
            </Field>
            <Btn variant="primary" icon="send" onClick={submit} busy={busy} disabled={!subject.trim() || !message.trim()}>
              Invia ticket
            </Btn>
          </div>
        </Glass>

        {/* Ticket history */}
        <Glass variant="work" style={{ padding: 20 }}>
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
                    padding: "16px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h4 style={{ flex: "1 1 100%", fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: T.text, margin: 0, wordBreak: "break-word" }}>
                        {t.subject}
                      </h4>
                      <Badge tone={tp.tone}>{tp.label}</Badge>
                      <Badge tone={ts.tone} dot>{ts.label}</Badge>
                      {t.projectId && <Badge tone="silver">{projectName(t.projectId) ?? "Progetto"}</Badge>}
                    </div>
                    <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: T.secondary, margin: "9px 0 0", whiteSpace: "pre-wrap" }}>
                      {t.message}
                    </p>
                    <p style={{ fontFamily: MONO, fontSize: 11, color: T.secondary, margin: "9px 0 0", letterSpacing: "0.05em" }}>
                      {relativeDate(t.createdAt)}
                    </p>
                    {/* four items in one non-wrapping row overflowed a phone-width card */}
                    {(t.estimateAmount != null || t.estimateHours != null) && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10, marginTop: 12, padding: "10px 14px", borderRadius: 11,
                        flexWrap: "wrap", rowGap: 8,
                        background: "rgba(184,50,64,0.08)", border: "1px solid rgba(184,50,64,0.24)",
                      }}>
                        <Icon name="euro" size={15} style={{ color: T.copperTx, flexShrink: 0 }} />
                        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.copperTx }}>Preventivo</span>
                        <span style={{ flex: "1 0 0" }} />
                        <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 800, color: T.text }}>
                          {[t.estimateAmount != null ? fmtEur(t.estimateAmount) : null, t.estimateHours != null ? `${t.estimateHours} h` : null].filter(Boolean).join(" · ")}
                        </span>
                        {t.estimateAcceptedAt
                          ? <Badge tone="green" dot>Approvato</Badge>
                          : <Btn size="sm" variant="primary" icon="check" busy={accepting === t.id} onClick={() => acceptEstimate(t.id)}>Approva</Btn>}
                      </div>
                    )}
                    {t.adminNote && (
                      <div style={{
                        marginTop: 12, padding: "12px 15px", borderRadius: 11,
                        background: "rgba(184,50,64,0.10)", border: "1px solid rgba(184,50,64,0.26)",
                        borderLeft: "3px solid #B83240",
                      }}>
                        <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: T.copperTx, margin: 0 }}>
                          <Icon name="sparkle" size={10} /> Risposta dello studio
                        </p>
                        <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: T.text, margin: "7px 0 0", whiteSpace: "pre-wrap" }}>
                          {t.adminNote}
                        </p>
                        {t.respondedAt && (
                          <p style={{ fontFamily: MONO, fontSize: 11, color: T.tertiary, margin: "7px 0 0" }}>{fmtDateTime(t.respondedAt)}</p>
                        )}
                      </div>
                    )}

                    {/* The reply above is a single field the studio overwrites.
                        Everything that follows it belongs in a real thread. */}
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
                      <Btn size="sm" variant="outline" icon="chat" onClick={() => openTicketChat(t)}>
                        {threadFor(t.id) ? "Apri la discussione" : "Continua in chat"}
                      </Btn>
                      {(() => {
                        const th = threadFor(t.id)
                        return th && isUnreadFor(th, "client")
                          ? <Badge tone="copper" dot>Nuova risposta</Badge>
                          : null
                      })()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Glass>
      </div>

      {/* Ticket discussion */}
      <Modal
        open={!!chatTicket}
        onClose={() => { setChatTicket(null); setChatConvo(null) }}
        kicker="Discussione ticket"
        title={chatTicket?.subject ?? ""}
        width={680}
      >
        {chatConvo
          ? <ChatThread conversation={chatConvo} role="client" authorId={userId} height={440} onChanged={reload} />
          : <Loading label="Apro la discussione" />}
      </Modal>
    </div>
  )
}
