import React, { useCallback, useEffect, useRef, useState } from "react"
import { useToast } from "../context/ToastContext"
import {
  deleteMessage, editMessage, fetchMessages, fmtBytes, fmtDateTime, markConversationRead,
  sendMessage, subscribe, updateConversationStatus, uploadAttachment,
} from "../lib/api"
import type { Attachment, Conversation, Message } from "../lib/api"
import { Btn, ConfirmDialog, DISPLAY, FileBtn, Icon, Loading, MONO, T } from "./ui"

const EDIT_WINDOW_MS = 15 * 60_000

/** Role-aware message thread: bubbles, attachments, edit/delete, read receipts, auto status flip. */
export default function ChatThread({ conversation, role, authorId, height = 420, onChanged }: {
  conversation: Conversation
  role: "admin" | "client"
  authorId: string
  height?: number | string
  onChanged?: () => void
}) {
  const toast = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [pending, setPending] = useState<Attachment[]>([])
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [toDelete, setToDelete] = useState<Message | null>(null)
  const [deleting, setDeleting] = useState(false)
  /* a failed fetch used to render as "Nessun messaggio." — telling the
     client an empty conversation when the network had failed */
  const [failed, setFailed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const list = await fetchMessages(conversation.id)
      setMessages(list)
      setFailed(false)
      markConversationRead(conversation.id).then(() => onChanged?.()).catch(() => {})
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id])

  useEffect(() => {
    setLoading(true)
    load()
    return subscribe(`thread-${conversation.id}`, { table: "messages", filter: `conversation_id=eq.${conversation.id}` }, load)
  }, [conversation.id, load])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length, loading])

  const closedForMe = conversation.status === "closed" && role === "client"

  async function handleSend() {
    const content = text.trim()
    if ((!content && pending.length === 0) || busy) return
    setBusy(true)
    try {
      await sendMessage({ conversationId: conversation.id, authorId, authorRole: role, content, attachments: pending })
      setText("")
      setPending([])
      const flip = role === "admin" ? "answered" : "has_questions"
      if (conversation.status !== flip) await updateConversationStatus(conversation.id, flip).catch(() => {})
      await load()
      onChanged?.()
    } catch (e) {
      toast.error(`Invio non riuscito: ${(e as Error)?.message ?? "riprova"}`)
    } finally {
      setBusy(false)
    }
  }

  async function handleFiles(files: File[]) {
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const att = await uploadAttachment(conversation.id, file)
        setPending(p => [...p, att])
      }
    } catch (e) {
      toast.error(`Allegato non caricato: ${(e as Error)?.message ?? "riprova"}`)
    } finally {
      setUploading(false)
    }
  }

  function canModify(m: Message): boolean {
    if (m.isDeleted || m.authorId !== authorId) return false
    if (role === "admin") return true
    return Date.now() - new Date(m.createdAt).getTime() < EDIT_WINDOW_MS
  }

  async function saveEdit(id: string) {
    const v = editText.trim()
    if (!v) return
    await editMessage(id, v)
    setEditingId(null)
    await load()
  }

  async function confirmDelete() {
    const m = toDelete
    if (!m || deleting) return
    setDeleting(true)
    try {
      await deleteMessage(m.id)
      setToDelete(null)
      await load()
      onChanged?.()
    } catch {
      toast.error("Eliminazione non riuscita.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height, minHeight: 260 }}>
      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "4px 2px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <Loading label="Apro la conversazione" />
        ) : failed ? (
          <div style={{ margin: "auto", textAlign: "center", padding: 24 }}>
            <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700, color: T.text, margin: 0 }}>Messaggi non caricati</p>
            <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 12.5, color: T.secondary, margin: "4px 0 12px" }}>La conversazione non è vuota: non siamo riusciti a leggerla.</p>
            <Btn size="sm" variant="primary" onClick={load}>Riprova</Btn>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", padding: 24 }}>
            <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13, color: T.secondary, margin: 0 }}>Nessun messaggio.</p>
            <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 12, color: T.tertiary, margin: "4px 0 0" }}>Scrivi il primo messaggio qui sotto.</p>
          </div>
        ) : (
          messages.map(m => {
            const own = m.authorId === authorId
            const bubbleBg = m.isDeleted
              ? "rgba(255,255,255,0.03)"
              : own
              ? "linear-gradient(145deg, rgba(184,50,64,0.36), rgba(184,50,64,0.22))"
              : "rgba(255,255,255,0.09)"
            const bubbleBorder = m.isDeleted
              ? "rgba(255,255,255,0.07)"
              : own
              ? "rgba(184,50,64,0.40)"
              : "rgba(255,255,255,0.13)"
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: own ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "78%", padding: "10px 14px", borderRadius: 16,
                  borderTopRightRadius: own ? 5 : 16, borderTopLeftRadius: own ? 16 : 5,
                  background: bubbleBg,
                  border: `1px solid ${bubbleBorder}`,
                  boxShadow: m.isDeleted ? "none" : own
                    ? "0 4px 16px rgba(184,50,64,0.18), inset 0 1px 0 rgba(255,255,255,0.14)"
                    : "inset 0 1px 0 rgba(255,255,255,0.10)",
                  backdropFilter: m.isDeleted ? "none" : "blur(8px)",
                  WebkitBackdropFilter: m.isDeleted ? "none" : "blur(8px)",
                }}>
                  {m.isDeleted ? (
                    <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 12.5, fontStyle: "italic", color: T.tertiary, margin: 0 }}>
                      Messaggio eliminato
                    </p>
                  ) : editingId === m.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
                      <textarea
                        className="portal-input pt-body"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        style={{ minHeight: 60, fontSize: 13 }}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <Btn size="sm" variant="ghost" onClick={() => setEditingId(null)}>Annulla</Btn>
                        <Btn size="sm" variant="primary" onClick={() => saveEdit(m.id)}>Salva</Btn>
                      </div>
                    </div>
                  ) : (
                    <>
                      {m.content && (
                        <p className="pt-body" style={{
                          fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.6,
                          color: "#FFFFFF",
                          margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
                        }}>
                          {m.content}
                        </p>
                      )}
                      {m.attachments.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: m.content ? 9 : 0 }}>
                          {m.attachments.map((a, i) => {
                            /* an attachment without a URL used to render as a
                               link to "#", which navigates nowhere and looks
                               broken; unavailable is stated instead */
                            const body = (
                              <>
                                <Icon name="paperclip" size={11} />
                                <span style={{ fontFamily: MONO, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                                  {a.name}
                                </span>
                                <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.62)", flexShrink: 0 }}>
                                  {a.publicUrl ? fmtBytes(a.size) : "non disponibile"}
                                </span>
                              </>
                            )
                            const box: React.CSSProperties = {
                              display: "flex", alignItems: "center", gap: 7,
                              padding: "6px 10px", borderRadius: 9,
                              background: "rgba(0,0,0,0.24)", border: "1px solid rgba(255,255,255,0.18)",
                              textDecoration: "none", color: "#FFFFFF",
                            }
                            return a.publicUrl ? (
                              <a key={i} href={a.publicUrl} target="_blank" rel="noreferrer" className="portal-link" style={box}>{body}</a>
                            ) : (
                              <span key={i} style={{ ...box, opacity: 0.6 }}>{body}</span>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, padding: "0 5px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: T.tertiary, letterSpacing: "0.04em" }}>
                    {fmtDateTime(m.createdAt)}{m.editedAt ? " · modificato" : ""}
                  </span>
                  {canModify(m) && editingId !== m.id && (
                    <>
                      <button
                        className="portal-link portal-icon-btn"
                        onClick={() => { setEditingId(m.id); setEditText(m.content) }}
                        style={{ background: "none", border: "none", padding: 0, color: T.secondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Modifica"
                      >
                        <Icon name="edit" size={12} />
                      </button>
                      <button
                        className="portal-link portal-icon-btn"
                        onClick={() => setToDelete(m)}
                        style={{ background: "none", border: "none", padding: 0, color: T.secondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Elimina"
                      >
                        <Icon name="trash" size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Composer */}
      {closedForMe ? (
        <div style={{
          marginTop: 12, padding: "12px 16px", borderRadius: 12, textAlign: "center",
          background: "rgba(255,255,255,0.04)", border: `1px dashed ${T.border}`,
          fontFamily: DISPLAY, fontSize: 13, color: T.secondary,
        }}>
          Conversazione chiusa — riaprila dalla sezione Messaggi per rispondere.
        </div>
      ) : (
        <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: 12 }}>
          {pending.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 9 }}>
              {pending.map((a, i) => (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 10px", borderRadius: 8,
                  background: "rgba(184,50,64,0.12)", border: "1px solid rgba(184,50,64,0.28)",
                  fontFamily: MONO, fontSize: 11, color: T.copperTx,
                }}>
                  <Icon name="paperclip" size={10} />
                  {a.name}
                  <button
                    onClick={() => setPending(p => p.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer", display: "flex" }}
                  >
                    <Icon name="x" size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <FileBtn
              variant="ghost"
              onFiles={handleFiles}
              busy={uploading}
              title="Allega file"
              style={{ padding: "10px 11px", flexShrink: 0 }}
            >
              {!uploading && <Icon name="paperclip" size={14} />}
            </FileBtn>
            <textarea
              className="portal-input pt-body"
              placeholder="Scrivi un messaggio…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              style={{ minHeight: 42, maxHeight: 130, resize: "none", lineHeight: 1.55, fontSize: 13.5 }}
              rows={1}
            />
            <Btn variant="primary" onClick={handleSend} busy={busy} icon="send" style={{ padding: "10px 16px", flexShrink: 0 }}>
              Invia
            </Btn>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        kicker="Messaggio"
        title="Eliminare il messaggio?"
        confirmLabel="Elimina"
        confirmIcon="trash"
        busy={deleting}
        body="Resta al suo posto come «messaggio eliminato»: l'altra parte vede che c'era qualcosa, non cosa."
      />
    </div>
  )
}
