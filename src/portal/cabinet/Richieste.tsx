import React, { useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientHome, Conversation, SupportTicket, TicketPriority } from "../../lib/api"
import {
  acceptTicketEstimate, createRequest, fmtDateTime, fmtEur, isUnreadFor, relativeDate,
  updateConversationStatus,
} from "../../lib/api"
import ChatThread from "../ChatThread"
import {
  Badge, Btn, CONVO_STATUS, DISPLAY, Empty, Field, Glass, Icon, Input, Modal, MONO,
  Note, SectionTitle, Select, T, Textarea, TICKET_PRIORITY, TICKET_STATUS,
} from "../ui"

/* ══════════════════════════════════════════════════════════════════════════
   RICHIESTE — un solo posto per scrivere allo studio.

   Prima erano due sezioni, Messaggi e Supporto, con due moduli diversi. Sul
   piano dei dati sono davvero due cose (il ticket porta priorità, stato di
   lavorazione e preventivo; la conversazione porta allegati e non letti), ma
   il cliente quella differenza non la vede: da fuori sono entrambe «scrivo
   allo studio», e la scelta gli chiedeva di indovinare la nostra tassonomia.

   Qui la lista è una sola. Una conversazione con `ticketId` mostra i gradi
   della richiesta di lavoro; senza, è una conversazione e basta.
══════════════════════════════════════════════════════════════════════════ */

export default function Richieste({ home, userId, reload }: {
  home: ClientHome
  userId: string
  reload: () => void
}) {
  const toast = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  /* composer */
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [asTicket, setAsTicket] = useState(false)
  const [priority, setPriority] = useState<TicketPriority>("medium")
  const [projectId, setProjectId] = useState("")

  /* Le discussioni di fase vivono dentro il dossier del progetto: qui
     finirebbero fuori contesto. */
  const inbox = useMemo(() => home.threads.filter(c => !c.stageId).sort((a, b) => {
    if (a.status === "closed" && b.status !== "closed") return 1
    if (b.status === "closed" && a.status !== "closed") return -1
    return b.lastMessageAt.localeCompare(a.lastMessageAt)
  }), [home.threads])

  const ticketOf = (c: Conversation): SupportTicket | undefined =>
    c.ticketId ? home.tickets.find(t => t.id === c.ticketId) : undefined

  const selected = inbox.find(c => c.id === selectedId) ?? null
  const selectedTicket = selected ? ticketOf(selected) : undefined
  const projectName = (id?: string) => home.projects.find(p => p.id === id)?.name

  function resetComposer() {
    setSubject(""); setMessage(""); setAsTicket(false); setPriority("medium"); setProjectId("")
  }

  async function create() {
    if (!subject.trim() || !message.trim() || busy) return
    setBusy(true)
    try {
      const convo = await createRequest({
        clientId: userId,
        subject, message, asTicket,
        priority: asTicket ? priority : undefined,
        projectId: asTicket && projectId ? projectId : undefined,
      })
      setOpen(false)
      resetComposer()
      setSelectedId(convo.id)
      toast.success(asTicket ? "Richiesta inviata — la valutiamo a breve" : "Conversazione aperta")
      reload()
    } catch {
      toast.error("Invio non riuscito. Riprova.")
    } finally {
      setBusy(false)
    }
  }

  async function setStatus(status: "closed" | "has_questions") {
    if (!selected) return
    try {
      await updateConversationStatus(selected.id, status)
      toast.info(status === "closed" ? "Conversazione chiusa" : "Conversazione riaperta")
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    }
  }

  async function acceptEstimate(id: string) {
    if (busy) return
    setBusy(true)
    try {
      await acceptTicketEstimate(id)
      toast.success("Preventivo approvato — procediamo")
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Richieste"
        title="Scrivi allo studio"
        sub="Domande, materiali, modifiche: tutto in un unico filo. Per i temi legati a una fase usa la discussione dentro il progetto."
        right={<Btn variant="primary" icon="plus" onClick={() => setOpen(true)}>Nuova richiesta</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 16, alignItems: "start" }}>
        {/* ── Elenco ── */}
        <Glass variant="work" style={{ padding: 12, maxWidth: 420 }}>
          {inbox.length === 0 ? (
            <Empty icon="chat" title="Nessuna richiesta" hint="Apri un tema: rispondiamo il prima possibile." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 560, overflowY: "auto" }}>
              {inbox.map(c => {
                const cs = CONVO_STATUS[c.status]
                const t = ticketOf(c)
                const unread = isUnreadFor(c, "client")
                const isSel = c.id === selectedId
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={isSel ? undefined : "portal-row"}
                    style={{
                      display: "flex", flexDirection: "column", gap: 6, textAlign: "left",
                      padding: "11px 13px", borderRadius: 11, cursor: "pointer",
                      background: isSel ? "rgba(184,50,64,0.14)" : "transparent",
                      border: `1px solid ${isSel ? "rgba(184,50,64,0.32)" : "transparent"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                      {unread && <span style={{ width: 7, height: 7, borderRadius: 99, background: T.copperLt, flexShrink: 0, boxShadow: "0 0 8px rgba(184,50,64,0.85)" }} />}
                      <span style={{
                        flex: 1, minWidth: 0, fontFamily: DISPLAY, fontSize: 12.5, fontWeight: unread ? 800 : 600,
                        color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {c.subject}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: T.tertiary, flexShrink: 0 }}>{relativeDate(c.lastMessageAt)}</span>
                    </div>
                    <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                      {/* una richiesta di lavoro si legge dal grado, non da un'etichetta generica */}
                      {t ? (
                        <>
                          <Badge tone={TICKET_PRIORITY[t.priority].tone}>{TICKET_PRIORITY[t.priority].label}</Badge>
                          <Badge tone={TICKET_STATUS[t.status].tone} dot>{TICKET_STATUS[t.status].label}</Badge>
                          {(t.estimateAmount != null || t.estimateHours != null) && (
                            <Badge tone={t.estimateAcceptedAt ? "green" : "copper"} dot={!!t.estimateAcceptedAt}>
                              {t.estimateAmount != null ? fmtEur(t.estimateAmount) : `${t.estimateHours} h`}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <Badge tone={cs.tone} dot>{cs.label}</Badge>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </Glass>

        {/* ── Filo ── */}
        <Glass variant="work" style={{ padding: 18 }}>
          {selected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, paddingBottom: 12, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 800, color: T.text, margin: 0 }}>
                    {selected.subject}
                  </h3>
                  <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Badge tone={CONVO_STATUS[selected.status].tone} dot>{CONVO_STATUS[selected.status].label}</Badge>
                    {selectedTicket && (
                      <>
                        <Badge tone={TICKET_PRIORITY[selectedTicket.priority].tone}>{TICKET_PRIORITY[selectedTicket.priority].label}</Badge>
                        <Badge tone={TICKET_STATUS[selectedTicket.status].tone} dot>{TICKET_STATUS[selectedTicket.status].label}</Badge>
                      </>
                    )}
                    {selectedTicket?.projectId && <Badge tone="silver">{projectName(selectedTicket.projectId) ?? "Progetto"}</Badge>}
                  </div>
                </div>
                {selected.status === "closed"
                  ? <Btn size="sm" variant="outline" icon="play" onClick={() => setStatus("has_questions")}>Riapri</Btn>
                  : <Btn size="sm" variant="outline" icon="check" onClick={() => setStatus("closed")}>Chiudi</Btn>}
              </div>

              {/* Preventivo — l'unica cosa che una richiesta di lavoro ha e una
                  conversazione no, quindi vive qui e non in una sezione a parte */}
              {selectedTicket && (selectedTicket.estimateAmount != null || selectedTicket.estimateHours != null) && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 11,
                  flexWrap: "wrap", rowGap: 8,
                  background: "rgba(184,50,64,0.08)", border: "1px solid rgba(184,50,64,0.24)",
                }}>
                  <Icon name="euro" size={15} style={{ color: T.copperTx, flexShrink: 0 }} />
                  <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.11em", textTransform: "uppercase", color: T.copperTx }}>Preventivo</span>
                  <span style={{ flex: "1 0 0" }} />
                  <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 800, color: T.text }}>
                    {[
                      selectedTicket.estimateAmount != null ? fmtEur(selectedTicket.estimateAmount) : null,
                      selectedTicket.estimateHours != null ? `${selectedTicket.estimateHours} h` : null,
                    ].filter(Boolean).join(" · ")}
                  </span>
                  {selectedTicket.estimateAcceptedAt
                    ? <Badge tone="green" dot>Approvato</Badge>
                    : <Btn size="sm" variant="primary" icon="check" busy={busy} onClick={() => acceptEstimate(selectedTicket.id)}>Approva</Btn>}
                </div>
              )}

              {selectedTicket?.respondedAt && selectedTicket.adminNote && (
                <Note tone="silver">
                  <strong style={{ fontFamily: DISPLAY }}>Sintesi dello studio</strong> · {fmtDateTime(selectedTicket.respondedAt)}
                  <br />{selectedTicket.adminNote}
                </Note>
              )}

              <ChatThread conversation={selected} role="client" authorId={userId} height={420} onChanged={reload} />
            </div>
          ) : (
            <Empty icon="chat" title="Seleziona una richiesta" hint="Oppure aprine una nuova per iniziare." />
          )}
        </Glass>
      </div>

      {/* ── Composer ── */}
      <Modal
        open={open}
        onClose={() => !busy && setOpen(false)}
        kicker="Richieste"
        title="Nuova richiesta"
        width={560}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={create} busy={busy} disabled={!subject.trim() || !message.trim()}>
              Invia
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="Oggetto" hint="Un tema per richiesta: è così che ti rispondiamo più in fretta.">
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Es. Revisione del catalogo prodotti" autoFocus />
          </Field>

          <Field label="Messaggio">
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Racconta cosa ti serve." style={{ resize: "vertical" }} />
          </Field>

          {/* Il bivio è qui e non nella navigazione: il cliente dichiara che
              cosa vuole, non in quale delle nostre tabelle finisce. */}
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
            padding: "12px 14px", borderRadius: 11,
            background: asTicket ? "rgba(184,50,64,0.10)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${asTicket ? "rgba(184,50,64,0.28)" : T.border}`,
            transition: "background 0.18s, border-color 0.18s",
          }}>
            <input type="checkbox" checked={asTicket} onChange={e => setAsTicket(e.target.checked)}
              style={{ accentColor: "#B83240", width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
            <span>
              <span style={{ display: "block", fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: T.text }}>
                È una richiesta di lavoro
              </span>
              <span className="pt-body" style={{ display: "block", fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.55, color: T.secondary, marginTop: 3 }}>
                La prendiamo in carico con una priorità, la segui fino alla chiusura e, se comporta lavoro extra, ti mandiamo un preventivo da approvare.
              </span>
            </span>
          </label>

          {asTicket && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 12 }}>
              <Field label="Priorità">
                <Select value={priority} onChange={e => setPriority(e.target.value as TicketPriority)}>
                  {(Object.keys(TICKET_PRIORITY) as TicketPriority[]).map(p => (
                    <option key={p} value={p}>{TICKET_PRIORITY[p].label}</option>
                  ))}
                </Select>
              </Field>
              {home.projects.length > 0 && (
                <Field label="Progetto (opzionale)">
                  <Select value={projectId} onChange={e => setProjectId(e.target.value)}>
                    <option value="">Nessun progetto</option>
                    {home.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </Field>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
