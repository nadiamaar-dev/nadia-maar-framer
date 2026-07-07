/**
 * ChatTab — client-side conversation accordion.
 *
 * Features:
 * - Accordion list: active conversations first (newest-first), closed last
 * - Status badges: Aperto / Risposto / Ha domande / Chiuso
 * - Per-message CRUD: Edit (within 15 min), soft Delete
 * - File attachments (uploads to Supabase Storage)
 * - New conversation form
 * - Integrates with useToast for success/error feedback
 */
import React, { useEffect, useState, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  fetchConversations, fetchMessages, sendMessage, createConversation,
  editMessage, deleteMessage, uploadAttachment, updateConversationStatus,
  type Conversation, type Message, type ConversationStatus, type Attachment,
  fmtBytes,
} from "../../lib/adminApi"
import { useToast } from "../../context/ToastContext"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const COPPER  = "#B04A38"
const GREEN   = "#10B981"

/* ─── CSS ────────────────────────────────────────────────────── */
const STYLE_ID = "nm-chat-styles"
const CSS = `
.nm-chat-input {
  width: 100%; padding: 11px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 10px; outline: none;
  font-family: ${DISPLAY}; font-size: 13px;
  color: rgba(255,255,255,0.85);
  transition: border-color 0.18s; resize: none; box-sizing: border-box;
}
.nm-chat-input::placeholder { color: rgba(255,255,255,0.22); }
.nm-chat-input:focus { border-color: rgba(176,74,56,0.50); }
.nm-msg-action {
  padding: 4px 10px; border-radius: 6px; cursor: pointer;
  font-family: ${MONO}; font-size: 10px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  background: transparent; border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.30); transition: all 0.15s;
}
.nm-msg-action:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.60); }
.nm-msg-action.del:hover { background: rgba(224,80,80,0.10); border-color: rgba(224,80,80,0.25); color: rgba(224,80,80,0.70); }
.nm-acc-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; text-align: left; cursor: pointer;
  background: transparent; border: none;
  transition: background 0.15s;
}
.nm-acc-header:hover { background: rgba(255,255,255,0.025); }
`

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_CFG: Record<ConversationStatus, { label: string; color: string; bg: string; border: string }> = {
  open:          { label: "Aperto",      color: COPPER,                   bg: "rgba(176,74,56,0.09)",   border: "rgba(176,74,56,0.25)" },
  answered:      { label: "Risposto",    color: GREEN,                    bg: "rgba(16,185,129,0.09)",  border: "rgba(16,185,129,0.25)" },
  has_questions: { label: "Ha domande",  color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.09)", border: "rgba(200,185,110,0.28)" },
  closed:        { label: "Chiuso",      color: "rgba(255,255,255,0.30)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
}

function StatusPill({ status }: { status: ConversationStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 99,
      fontFamily: MONO, fontSize: 10, fontWeight: 600,
      letterSpacing: "0.06em", textTransform: "uppercase",
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  )
}

function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000
  if (diff < 1)   return "Adesso"
  if (diff < 60)  return `${Math.floor(diff)}m fa`
  if (diff < 1440) return `${Math.floor(diff / 60)}h fa`
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" })
}

const EDIT_WINDOW_MS = 15 * 60_000

/* ─── Message bubble ─────────────────────────────────────────── */
function MessageBubble({
  msg, currentUserId, isAdmin,
  onEdit, onDelete,
}: {
  msg: Message
  currentUserId: string
  isAdmin: boolean
  onEdit: (m: Message, newContent: string) => void
  onDelete: (m: Message) => void
}) {
  const isOwn   = msg.authorId === currentUserId || (isAdmin && msg.authorRole === "admin")
  const canEdit = isOwn && !msg.isDeleted && (Date.now() - new Date(msg.createdAt).getTime()) < EDIT_WINDOW_MS
  const canDel  = isOwn && !msg.isDeleted

  const [editing,    setEditing]    = useState(false)
  const [editValue,  setEditValue]  = useState(msg.content)
  const [showMenu,   setShowMenu]   = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showMenu])

  const content = msg.isDeleted ? (
    <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
      Messaggio eliminato
    </span>
  ) : editing ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea
        className="nm-chat-input"
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        rows={3}
        autoFocus
      />
      <div style={{ display: "flex", gap: 6 }}>
        <button className="nm-msg-action" onClick={() => { onEdit(msg, editValue); setEditing(false) }}
          style={{ color: GREEN, borderColor: "rgba(16,185,129,0.30)" }}>
          Salva
        </button>
        <button className="nm-msg-action" onClick={() => setEditing(false)}>Annulla</button>
      </div>
    </div>
  ) : (
    <p style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.80)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
      {msg.content}
    </p>
  )

  return (
    <div style={{ display: "flex", flexDirection: isOwn ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: MONO, fontSize: 10, fontWeight: 700,
        background: isOwn ? "rgba(176,74,56,0.20)" : "rgba(255,255,255,0.08)",
        color: isOwn ? COPPER : "rgba(255,255,255,0.45)",
      }}>
        {msg.authorRole === "admin" ? "A" : "C"}
      </div>

      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 4, alignItems: isOwn ? "flex-end" : "flex-start" }}>
        {/* Bubble */}
        <div style={{
          padding: "10px 14px",
          background: isOwn ? "rgba(176,74,56,0.14)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${isOwn ? "rgba(176,74,56,0.28)" : "rgba(255,255,255,0.09)"}`,
          borderRadius: isOwn ? "14px 2px 14px 14px" : "2px 14px 14px 14px",
          position: "relative",
        }}>
          {content}

          {/* Attachments */}
          {!msg.isDeleted && msg.attachments.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {msg.attachments.map((att, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.50)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {att.name}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
                    {fmtBytes(att.size)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 3-dot menu */}
          {(canEdit || canDel) && !editing && (
            <div ref={menuRef} style={{ position: "absolute", top: 4, right: isOwn ? "auto" : 4, left: isOwn ? 4 : "auto" }}>
              <button
                onClick={() => setShowMenu(v => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "rgba(255,255,255,0.20)", opacity: 0 }}
                className="nm-msg-menu-trigger"
              >
                ···
              </button>
              <style>{`.nm-msg-menu-trigger { opacity: 0; transition: opacity 0.15s; } *:hover > .nm-msg-menu-trigger { opacity: 1; }`}</style>
              {showMenu && (
                <div style={{
                  position: "absolute", top: "100%", [isOwn ? "left" : "right"]: 0, zIndex: 10,
                  background: "rgba(14,17,24,0.98)", backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10,
                  padding: 6, display: "flex", flexDirection: "column", gap: 2,
                  minWidth: 120, boxShadow: "0 8px 24px rgba(0,0,0,0.40)",
                }}>
                  {canEdit && (
                    <button className="nm-msg-action" onClick={() => { setEditing(true); setShowMenu(false) }}
                      style={{ textAlign: "left", width: "100%", padding: "6px 10px" }}>
                      ✎ Modifica
                    </button>
                  )}
                  {canDel && (
                    <button className="nm-msg-action del" onClick={() => { onDelete(msg); setShowMenu(false) }}
                      style={{ textAlign: "left", width: "100%", padding: "6px 10px" }}>
                      ✕ Elimina
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.20)" }}>
            {relTime(msg.createdAt)}
          </span>
          {msg.editedAt && !msg.isDeleted && (
            <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.18)", fontStyle: "italic" }}>
              modificato
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Conversation accordion item ────────────────────────────── */
function ConvItem({
  conv, clientId, isOpen, onToggle,
}: {
  conv: Conversation; clientId: string; isOpen: boolean; onToggle: () => void
}) {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [loaded,    setLoaded]    = useState(false)
  const [text,      setText]      = useState("")
  const [files,     setFiles]     = useState<File[]>([])
  const [sending,   setSending]   = useState(false)
  const [status,    setStatus]    = useState<ConversationStatus>(conv.status)
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { success, error: toastError } = useToast()

  useEffect(() => {
    if (isOpen && !loaded) {
      fetchMessages(conv.id).then(msgs => { setMessages(msgs); setLoaded(true) })
    }
  }, [isOpen, loaded, conv.id])

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  async function handleSend() {
    if (!text.trim() && files.length === 0) return
    setSending(true)
    try {
      const attachments: Attachment[] = []
      for (const f of files) {
        attachments.push(await uploadAttachment(conv.id, f))
      }
      const msg = await sendMessage({ conversationId: conv.id, authorId: clientId, authorRole: "client", content: text, attachments })
      setMessages(prev => [...prev, msg])
      setText(""); setFiles([])
      // Update status to has_questions
      const newStatus: ConversationStatus = "has_questions"
      setStatus(newStatus)
      await updateConversationStatus(conv.id, newStatus)
      success("Messaggio inviato", "Il team risponderà al più presto.")
    } catch {
      toastError("Errore nell'invio. Riprova.")
    } finally {
      setSending(false)
    }
  }

  const handleEdit = useCallback(async (msg: Message, newContent: string) => {
    await editMessage(msg.id, newContent)
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: newContent, editedAt: new Date().toISOString() } : m))
  }, [])

  const handleDelete = useCallback(async (msg: Message) => {
    await deleteMessage(msg.id)
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isDeleted: true, content: "" } : m))
  }, [])

  const cfg = STATUS_CFG[status]

  return (
    <div style={{
      background: "rgba(30,37,48,0.55)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${isOpen ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 14, overflow: "hidden",
      transition: "border-color 0.18s",
    }}>
      {/* Top accent */}
      {isOpen && <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${cfg.color}70, transparent)` }} />}

      {/* Accordion header */}
      <button className="nm-acc-header" onClick={onToggle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {conv.subject}
            </p>
            <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)", margin: "3px 0 0" }}>
              Ultimo messaggio: {relTime(conv.lastMessageAt)}
            </p>
          </div>
          <StatusPill status={status} />
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ marginLeft: 12, color: "rgba(255,255,255,0.30)", flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </motion.span>
      </button>

      {/* Accordion body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "16px 18px 18px" }}>
              {/* Message thread */}
              <div style={{
                maxHeight: 320, overflowY: "auto",
                display: "flex", flexDirection: "column", gap: 12,
                marginBottom: 16, paddingRight: 4,
                scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.10) transparent",
              }}>
                {!loaded ? (
                  <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.22)", textAlign: "center", padding: "16px 0" }}>
                    Caricamento messaggi…
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.30)", textAlign: "center", padding: "16px 0" }}>
                    Inizia la conversazione qui sotto.
                  </div>
                ) : (
                  messages.map(m => (
                    <MessageBubble
                      key={m.id} msg={m}
                      currentUserId={clientId} isAdmin={false}
                      onEdit={handleEdit} onDelete={handleDelete}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Reply form — hidden if closed */}
              {status !== "closed" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <textarea
                    className="nm-chat-input"
                    placeholder="Scrivi un messaggio…"
                    rows={3}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend() }}
                  />

                  {/* File preview */}
                  {files.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {files.map((f, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "4px 10px",
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                          borderRadius: 7,
                        }}>
                          <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.50)" }}>{f.name}</span>
                          <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.30)", padding: 0 }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {/* Attach */}
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 8, padding: "8px 10px", cursor: "pointer",
                        color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center",
                      }}
                      title="Allega file"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                      </svg>
                    </button>
                    <input ref={fileRef} type="file" multiple className="hidden" style={{ display: "none" }}
                      onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])} />

                    <button
                      onClick={handleSend}
                      disabled={(!text.trim() && files.length === 0) || sending}
                      style={{
                        flex: 1, padding: "9px 16px",
                        background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))",
                        border: "1px solid rgba(176,74,56,0.55)", borderRadius: 8, cursor: "pointer",
                        fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, color: "#fff",
                        opacity: (!text.trim() && files.length === 0) || sending ? 0.4 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                    >
                      {sending ? "Invio…" : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
                          </svg>
                          Invia (⌘↵)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.25)", padding: "8px 0" }}>
                  Questa conversazione è chiusa.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── New conversation form ──────────────────────────────────── */
function NewConvForm({ clientId, onCreated }: { clientId: string; onCreated: (c: Conversation) => void }) {
  const [show,    setShow]    = useState(false)
  const [subject, setSubject] = useState("")
  const [saving,  setSaving]  = useState(false)
  const { success, error: toastError } = useToast()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim()) return
    setSaving(true)
    try {
      const conv = await createConversation({ clientId, subject })
      onCreated(conv)
      setSubject(""); setShow(false)
      success("Conversazione aperta", "Il team riceverà una notifica.")
    } catch {
      toastError("Errore nella creazione. Riprova.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {!show ? (
        <button
          onClick={() => setShow(true)}
          style={{
            width: "100%", padding: "13px 20px",
            background: "rgba(176,74,56,0.09)", border: "1px dashed rgba(176,74,56,0.30)",
            borderRadius: 12, cursor: "pointer",
            fontFamily: DISPLAY, fontSize: 13, fontWeight: 600,
            color: COPPER, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Apri nuova conversazione
        </button>
      ) : (
        <form onSubmit={handleCreate} style={{
          background: "rgba(30,37,48,0.55)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(176,74,56,0.25)", borderRadius: 14, padding: "18px",
        }}>
          <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: COPPER, marginBottom: 12 }}>
            Nuova Conversazione
          </p>
          <input
            className="nm-chat-input"
            placeholder="Oggetto (es. Bug nella pagina contatti)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            maxLength={120}
            required
            autoFocus
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button type="submit" disabled={!subject.trim() || saving}
              style={{
                flex: 1, padding: "9px 16px",
                background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))",
                border: "1px solid rgba(176,74,56,0.55)", borderRadius: 8, cursor: "pointer",
                fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, color: "#fff",
                opacity: !subject.trim() || saving ? 0.4 : 1,
              }}>
              {saving ? "Creazione…" : "Crea"}
            </button>
            <button type="button" onClick={() => { setShow(false); setSubject("") }}
              style={{
                padding: "9px 14px", background: "transparent",
                border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, cursor: "pointer",
                fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.40)",
              }}>
              Annulla
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
export interface ChatTabProps { clientId: string }

export default function ChatTab({ clientId }: ChatTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading,       setLoading]       = useState(true)
  const [openId,        setOpenId]        = useState<string | null>(null)

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style"); el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  useEffect(() => {
    fetchConversations(clientId).then(data => { setConversations(data); setLoading(false) })
  }, [clientId])

  function handleCreated(conv: Conversation) {
    setConversations(prev => [conv, ...prev])
    setOpenId(conv.id)
  }

  return (
    <section>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: COPPER, marginBottom: 8 }}>Messaggi</div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Centro Messaggi</h2>
        <p style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "8px 0 0" }}>
          Conversazioni con il team. Le risposte arrivano entro 4 ore lavorative.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 720 }}>
        <NewConvForm clientId={clientId} onCreated={handleCreated} />

        {loading ? (
          <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.22)", padding: "20px 0", textAlign: "center" }}>
            Caricamento…
          </div>
        ) : conversations.length === 0 ? (
          <div style={{
            padding: "32px 20px", textAlign: "center",
            fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.28)",
            background: "rgba(30,37,48,0.30)", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 14,
          }}>
            Nessuna conversazione. Aprine una nuova qui sopra.
          </div>
        ) : (
          conversations.map(conv => (
            <ConvItem
              key={conv.id} conv={conv} clientId={clientId}
              isOpen={openId === conv.id}
              onToggle={() => setOpenId(prev => prev === conv.id ? null : conv.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}
