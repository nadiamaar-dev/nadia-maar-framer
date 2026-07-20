import React, { useCallback, useEffect, useRef, useState } from "react"
import { useToast } from "../context/ToastContext"
import {
  deleteMessage, editMessage, fetchMessages, fmtBytes, fmtDateTime, markConversationRead,
  sendMessage, subscribe, updateConversationStatus, uploadAttachment,
} from "../lib/api"
import type { Attachment, Conversation, Message } from "../lib/api"
import { Btn, DISPLAY, FileBtn, Icon, Loading, MONO, T } from "./ui"

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
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const list = await fetchMessages(conversation.id)
      setMessages(list)
      markConversationRead(conversation.id).then(() => onChanged?.()).catch(() => {})
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height, minHeight: 260 }}>
      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "4px 2px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <Loading label="Apro la conversazione" />
        ) : messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", padding: 24 }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 13, color: T.faint, margin: 0 }}>Nessun messaggio.</p>
            <p style={{ fontFamily: DISPLAY, fontSize: 12, color: T.ghost, margin: "4px 0 0" }}>Scrivi il primo messaggio qui sotto.</p>
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
                    <p style={{ fontFamily: DISPLAY, fontSize: 12.5, fontStyle: "italic", color: T.ghost, margin: 0 }}>
                      Messaggio eliminato
                    </p>
                  ) : editingId === m.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
                      <textarea
                        className="portal-input"
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
                        <p style={{
                          fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.6,
                          color: own ? "#FFE8DC" : T.text,
                          margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
                        }}>
                          {m.content}
                        </p>
                      )}
                      {m.attachments.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: m.content ? 9 : 0 }}>
                          {m.attachments.map((a, i) => (
                            <a
                              key={i}
                              href={a.publicUrl ?? "#"}
                              target="_blank" rel="noreferrer"
                              className="portal-link"
                              style={{
                                display: "flex", alignItems: "center", gap: 7,
                                padding: "6px 10px", borderRadius: 9,
                                background: "rgba(0,0,0,0.24)", border: "1px solid rgba(255,255,255,0.18)",
                                textDecoration: "none", color: T.muted,
                              }}
                            >
                              <Icon name="paperclip" size={11} />
                              <span style={{ fontFamily: MONO, fontSize: 10.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                                {a.name}
                              </span>
                              <span style={{ fontFamily: MONO, fontSize: 9, color: T.ghost, flexShrink: 0 }}>{fmtBytes(a.size)}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, padding: "0 5px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 8.5, color: T.ghost, letterSpacing: "0.04em" }}>
                    {fmtDateTime(m.createdAt)}{m.editedAt ? " · modificato" : ""}
                  </span>
                  {canModify(m) && editingId !== m.id && (
                    <>
                      <button
                        className="portal-link"
                        onClick={() => { setEditingId(m.id); setEditText(m.content) }}
                        style={{ background: "none", border: "none", padding: 0, color: T.ghost, cursor: "pointer", display: "flex" }}
                        title="Modifica"
                      >
                        <Icon name="edit" size={10.5} />
                      </button>
                      <button
                        className="portal-link"
                        onClick={async () => { await deleteMessage(m.id); await load() }}
                        style={{ background: "none", border: "none", padding: 0, color: T.ghost, cursor: "pointer", display: "flex" }}
                        title="Elimina"
                      >
                        <Icon name="trash" size={10.5} />
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
          fontFamily: DISPLAY, fontSize: 13, color: T.ghost,
        }}>
          Conversazione chiusa
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
                  fontFamily: MONO, fontSize: 10, color: T.copperLt,
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
              className="portal-input"
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
    </div>
  )
}
