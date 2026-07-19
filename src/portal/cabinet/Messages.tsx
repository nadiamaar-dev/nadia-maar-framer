import React, { useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientHome } from "../../lib/api"
import { createConversation, isUnreadFor, relativeDate, updateConversationStatus } from "../../lib/api"
import ChatThread from "../ChatThread"
import {
  Badge, Btn, CONVO_STATUS, DISPLAY, Empty, Field, Glass, Input, Modal, MONO,
  SectionTitle, T,
} from "../ui"

export default function Messages({ home, userId, reload }: {
  home: ClientHome
  userId: string
  reload: () => void
}) {
  const toast = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [busy, setBusy] = useState(false)

  const inbox = useMemo(() => {
    return home.threads
      .filter(c => !c.stageId)
      .sort((a, b) => {
        if (a.status === "closed" && b.status !== "closed") return 1
        if (b.status === "closed" && a.status !== "closed") return -1
        return b.lastMessageAt.localeCompare(a.lastMessageAt)
      })
  }, [home.threads])

  const selected = inbox.find(c => c.id === selectedId) ?? null

  async function create() {
    if (!subject.trim() || busy) return
    setBusy(true)
    try {
      const convo = await createConversation({ clientId: userId, subject })
      setOpen(false)
      setSubject("")
      setSelectedId(convo.id)
      reload()
    } catch {
      toast.error("Creazione non riuscita. Riprova.")
    } finally {
      setBusy(false)
    }
  }

  async function closeConvo() {
    if (!selected) return
    try {
      await updateConversationStatus(selected.id, "closed")
      toast.info("Conversazione chiusa")
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Messaggi"
        title="Conversazioni con lo studio"
        sub="Per i temi legati a una fase usa la discussione dentro il dossier."
        right={<Btn variant="primary" icon="plus" onClick={() => setOpen(true)}>Nuova conversazione</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, alignItems: "start" }}>
        {/* Thread list */}
        <Glass variant="panel" style={{ padding: 12, maxWidth: 420 }}>
          {inbox.length === 0 ? (
            <Empty icon="chat" title="Nessuna conversazione" hint="Apri un tema: rispondiamo il prima possibile." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 560, overflowY: "auto" }}>
              {inbox.map(c => {
                const cs = CONVO_STATUS[c.status]
                const unread = isUnreadFor(c, "client")
                const isSel = c.id === selectedId
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={isSel ? undefined : "portal-row"}
                    style={{
                      display: "flex", flexDirection: "column", gap: 5, textAlign: "left",
                      padding: "11px 13px", borderRadius: 11, cursor: "pointer",
                      background: isSel ? "rgba(161,44,56,0.14)" : "transparent",
                      border: `1px solid ${isSel ? "rgba(161,44,56,0.32)" : "transparent"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                      {unread && <span style={{ width: 7, height: 7, borderRadius: 99, background: T.copperLt, flexShrink: 0, boxShadow: "0 0 8px rgba(212,105,90,0.8)" }} />}
                      <span style={{
                        flex: 1, minWidth: 0, fontFamily: DISPLAY, fontSize: 12.5, fontWeight: unread ? 800 : 600,
                        color: c.status === "closed" ? T.faint : T.text,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {c.subject}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 8.5, color: T.ghost, flexShrink: 0 }}>{relativeDate(c.lastMessageAt)}</span>
                    </div>
                    <Badge tone={cs.tone} dot>{cs.label}</Badge>
                  </button>
                )
              })}
            </div>
          )}
        </Glass>

        {/* Thread pane */}
        <Glass variant="panel" style={{ padding: 18, gridColumn: "span 1 / -1" }}>
          {selected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 800, color: T.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selected.subject}
                  </h3>
                  <div style={{ marginTop: 5 }}>
                    <Badge tone={CONVO_STATUS[selected.status].tone} dot>{CONVO_STATUS[selected.status].label}</Badge>
                  </div>
                </div>
                {selected.status !== "closed" && (
                  <Btn size="sm" variant="outline" icon="check" onClick={closeConvo}>Chiudi</Btn>
                )}
              </div>
              <ChatThread conversation={selected} role="client" authorId={userId} height={430} onChanged={reload} />
            </div>
          ) : (
            <Empty icon="chat" title="Seleziona una conversazione" hint="Oppure aprine una nuova per iniziare." />
          )}
        </Glass>
      </div>

      {/* New conversation */}
      <Modal
        open={open}
        onClose={() => !busy && setOpen(false)}
        kicker="Messaggi"
        title="Nuova conversazione"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={create} busy={busy} disabled={!subject.trim()}>Apri</Btn>
          </>
        }
      >
        <Field label="Oggetto" hint="Un tema per conversazione aiuta a risponderti più in fretta.">
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") create() }}
            placeholder="Es. Revisione preventivo"
            autoFocus
          />
        </Field>
      </Modal>
    </div>
  )
}
