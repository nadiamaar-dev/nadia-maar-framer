/**
 * StageChat — the single discussion thread bound to one project stage.
 * Shared by admin and client. Supports text + PDF/photo attachments and
 * realtime delivery. One thread per stage (getOrCreateStageConversation).
 */
import React, { useEffect, useRef, useState } from "react"
import {
  getOrCreateStageConversation, fetchMessages, sendMessage, uploadAttachment,
  fmtBytes,
  type Conversation, type Message, type Attachment, type ProjectStage,
} from "../../lib/adminApi"
import { supabase, SUPABASE_READY } from "../../lib/supabase"

const COPPER = "#B04A38"

function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000
  if (diff < 1)    return "Adesso"
  if (diff < 60)   return `${Math.floor(diff)}m fa`
  if (diff < 1440) return `${Math.floor(diff / 60)}h fa`
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" })
}

interface Props {
  projectId: string
  clientId: string
  stage: ProjectStage
  authorRole: "admin" | "client"
}

export default function StageChat({ projectId, clientId, stage, authorRole }: Props) {
  const [conv,     setConv]     = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(true)
  const [text,     setText]     = useState("")
  const [files,    setFiles]    = useState<File[]>([])
  const [sending,  setSending]  = useState(false)
  const [authorId, setAuthorId] = useState<string>(clientId)
  const fileRef   = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  /* Resolve the current user's id (admin needs its own uid as author_id) */
  useEffect(() => {
    if (!SUPABASE_READY) { setAuthorId(clientId); return }
    supabase.auth.getUser().then(({ data }) => { if (data.user) setAuthorId(data.user.id) })
  }, [clientId])

  /* Ensure the stage thread exists, then load its messages */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getOrCreateStageConversation({ projectId, stageId: stage.id, clientId, subject: stage.title })
      .then(async c => {
        if (cancelled) return
        setConv(c)
        const msgs = await fetchMessages(c.id)
        if (!cancelled) setMessages(msgs)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [projectId, stage.id, clientId])

  /* Realtime: incoming messages */
  useEffect(() => {
    if (!conv || !SUPABASE_READY) return
    const ch = supabase
      .channel(`stage-chat-${conv.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conv.id}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: { new: any }) => {
          const r = payload.new
          const m: Message = {
            id: r.id, conversationId: r.conversation_id, authorId: r.author_id,
            authorRole: r.author_role, content: r.content ?? "", attachments: r.attachments ?? [],
            isDeleted: r.is_deleted ?? false, editedAt: r.edited_at ?? undefined,
            createdAt: r.created_at, updatedAt: r.updated_at,
          }
          setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m])
        })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [conv])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  async function handleSend() {
    if (!conv || (!text.trim() && files.length === 0)) return
    setSending(true)
    try {
      const attachments: Attachment[] = []
      for (const f of files) attachments.push(await uploadAttachment(conv.id, f))
      const msg = await sendMessage({ conversationId: conv.id, authorId, authorRole, content: text, attachments })
      setMessages(prev => prev.some(x => x.id === msg.id) ? prev : [...prev, msg])
      setText(""); setFiles([])
    } finally { setSending(false) }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Thread */}
      <div className="flex max-h-[340px] min-h-[80px] flex-col gap-3 overflow-y-auto pr-1"
        style={{ scrollbarWidth: "thin" }}>
        {loading ? (
          <p className="py-4 text-center font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>Caricamento…</p>
        ) : messages.length === 0 ? (
          <p className="py-4 text-center font-display text-[13px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            Nessun messaggio in questa fase. Inizia la discussione qui sotto.
          </p>
        ) : messages.map(m => {
          const own = m.authorRole === authorRole
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: own ? "row-reverse" : "row", gap: 8, alignItems: "flex-start" }}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold"
                style={{ background: own ? "rgba(176,74,56,0.20)" : "rgba(255,255,255,0.08)", color: own ? COPPER : "rgba(255,255,255,0.45)" }}>
                {m.authorRole === "admin" ? "A" : "C"}
              </div>
              <div style={{ maxWidth: "80%" }}>
                <div style={{
                  padding: "9px 13px",
                  background: own ? "rgba(176,74,56,0.14)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${own ? "rgba(176,74,56,0.28)" : "rgba(255,255,255,0.09)"}`,
                  borderRadius: own ? "14px 2px 14px 14px" : "2px 14px 14px 14px",
                }}>
                  {m.isDeleted ? (
                    <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Messaggio eliminato</span>
                  ) : (
                    <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.85)", whiteSpace: "pre-wrap" }}>{m.content}</p>
                  )}
                  {!m.isDeleted && m.attachments.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                      {m.attachments.map((att, i) => (
                        <a key={i} href={att.publicUrl ?? "#"} target="_blank" rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", textDecoration: "none",
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.55)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.28)" }}>{fmtBytes(att.size)}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.22)", display: "block", marginTop: 3, textAlign: own ? "right" : "left" }}>{relTime(m.createdAt)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex flex-col gap-2">
        <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
          placeholder="Scrivi un messaggio per questa fase…"
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend() }}
          className="w-full rounded-xl px-3.5 py-2.5 font-display text-[13px] outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)", resize: "none" }} />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <span key={i} className="flex items-center gap-2 rounded-lg px-2.5 py-1 font-mono text-[10px]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.55)" }}>
                {f.name}
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)" }}>×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => fileRef.current?.click()} title="Allega PDF o foto" aria-label="Allega PDF o foto"
            className="rounded-lg p-2 transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.40)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <input ref={fileRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" style={{ display: "none" }}
            onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])} />
          <button onClick={handleSend} disabled={(!text.trim() && files.length === 0) || sending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 font-display text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}>
            {sending ? "Invio…" : "Invia (⌘↵)"}
          </button>
        </div>
      </div>
    </div>
  )
}
