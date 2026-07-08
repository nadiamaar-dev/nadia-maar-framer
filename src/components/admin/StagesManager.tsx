/**
 * StagesManager — admin control of a project's stages (Fasi).
 *
 * Sequential gate: the active stage can be completed, which unlocks the next.
 * Admin can add, rename and delete stages. Selecting a stage reveals its
 * discussion thread (StageChat, F3).
 */
import React, { useState } from "react"
import {
  advanceStage, createStage, updateStage, deleteStage,
  type ProjectStage,
} from "../../lib/adminApi"
import StageChat from "./StageChat"

const COPPER = "#B04A38"
const GREEN  = "#10B981"

const STAGE_CFG: Record<ProjectStage["status"], { color: string; label: string; bg: string }> = {
  locked: { color: "rgba(255,255,255,0.35)", label: "Da fare",     bg: "rgba(255,255,255,0.04)" },
  active: { color: COPPER,                    label: "In corso",    bg: "rgba(176,74,56,0.08)" },
  done:   { color: GREEN,                     label: "Completato",  bg: "rgba(16,185,129,0.07)" },
}

interface Props {
  projectId: string
  clientId: string
  stages: ProjectStage[]
  onReload: () => void
}

export default function StagesManager({ projectId, clientId, stages, onReload }: Props) {
  const [openId,    setOpenId]    = useState<string | null>(null)
  const [busy,      setBusy]      = useState<string | null>(null)
  const [editId,    setEditId]    = useState<string | null>(null)
  const [editText,  setEditText]  = useState("")
  const [newTitle,  setNewTitle]  = useState("")
  const [adding,    setAdding]    = useState(false)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  async function handleAdvance(s: ProjectStage) {
    setBusy(s.id)
    try { await advanceStage(projectId, s.id); onReload() } finally { setBusy(null) }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    const nextOrder = (stages.reduce((m, s) => Math.max(m, s.orderIndex), 0)) + 1
    try { await createStage(projectId, newTitle, nextOrder); setNewTitle(""); onReload() } finally { setAdding(false) }
  }

  async function saveRename(s: ProjectStage) {
    if (editText.trim() && editText.trim() !== s.title) {
      await updateStage(s.id, { title: editText.trim() }); onReload()
    }
    setEditId(null)
  }

  async function handleDelete(id: string) {
    await deleteStage(id); setConfirmDel(null); if (openId === id) setOpenId(null); onReload()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Stage list (ordered timeline) */}
      {stages.map((s, idx) => {
        const cfg = STAGE_CFG[s.status]
        const isOpen = openId === s.id
        const isLast = idx === stages.length - 1
        return (
          <div key={s.id} className="overflow-hidden rounded-2xl"
            style={{ background: isOpen ? "rgba(30,37,48,0.65)" : "rgba(22,27,34,0.55)", border: `1px solid ${isOpen ? "rgba(176,74,56,0.30)" : "rgba(255,255,255,0.09)"}` }}>
            <div className="flex items-center gap-3 p-4">
              {/* order / check */}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
                style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}45` }}>
                {s.status === "done" ? "✓" : idx + 1}
              </span>

              {/* title (inline editable) */}
              <div className="min-w-0 flex-1">
                {editId === s.id ? (
                  <input autoFocus value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={() => saveRename(s)}
                    onKeyDown={e => { if (e.key === "Enter") saveRename(s); if (e.key === "Escape") setEditId(null) }}
                    className="w-full rounded-lg px-2 py-1 font-display text-[14px] font-semibold outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(176,74,56,0.40)", color: "#fff" }} />
                ) : (
                  <button onDoubleClick={() => { setEditId(s.id); setEditText(s.title) }}
                    className="block truncate text-left font-display text-[14px] font-semibold"
                    style={{ color: s.status === "locked" ? "rgba(255,255,255,0.45)" : "#fff" }}
                    title="Doppio clic per rinominare">
                    {s.title}
                  </button>
                )}
                <span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>

              {/* actions */}
              <div className="flex shrink-0 items-center gap-2">
                {s.status === "active" && (
                  <button onClick={() => handleAdvance(s)} disabled={busy === s.id}
                    className="rounded-lg px-3 py-1.5 font-display text-[12px] font-bold text-white disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.80), rgba(12,150,100,0.70))", border: "1px solid rgba(16,185,129,0.45)" }}>
                    {busy === s.id ? "…" : (isLast ? "Concludi" : "Completa fase →")}
                  </button>
                )}
                <button onClick={() => setOpenId(isOpen ? null : s.id)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[10px] transition-colors"
                  style={{ color: isOpen ? COPPER : "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Chat
                </button>
                <button onClick={() => setConfirmDel(s.id)} title="Elimina fase" aria-label="Elimina fase"
                  className="rounded-lg p-1.5 transition-colors"
                  style={{ color: "rgba(224,80,80,0.45)", background: "rgba(224,80,80,0.06)", border: "1px solid rgba(224,80,80,0.12)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>

            {/* Stage chat (F3) */}
            {isOpen && (
              <div className="border-t p-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <StageChat projectId={projectId} clientId={clientId} stage={s} authorRole="admin" />
              </div>
            )}

            {/* Delete confirm */}
            {confirmDel === s.id && (
              <div className="flex items-center justify-between gap-3 border-t px-4 py-3" style={{ borderColor: "rgba(224,80,80,0.20)", background: "rgba(224,80,80,0.06)" }}>
                <span className="font-mono text-[11px]" style={{ color: "rgba(224,80,80,0.85)" }}>Eliminare la fase "{s.title}"?</span>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(s.id)} className="rounded-lg px-3 py-1.5 font-mono text-[10px] font-bold" style={{ background: "rgba(224,80,80,0.20)", border: "1px solid rgba(224,80,80,0.35)", color: "#E05050" }}>Elimina</button>
                  <button onClick={() => setConfirmDel(null)} className="rounded-lg px-3 py-1.5 font-mono text-[10px]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)" }}>Annulla</button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add stage */}
      <form onSubmit={handleAdd} className="flex gap-2 rounded-2xl p-2" style={{ border: "1px dashed rgba(176,74,56,0.28)" }}>
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Aggiungi una fase…"
          className="flex-1 rounded-xl px-3.5 py-2.5 font-display text-[13px] outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)" }} />
        <button type="submit" disabled={!newTitle.trim() || adding}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[13px] font-bold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path d="M12 5v14M5 12h14"/></svg>
          Aggiungi
        </button>
      </form>

      {stages.length === 0 && (
        <p className="py-4 text-center font-display text-[13px]" style={{ color: "rgba(255,255,255,0.30)" }}>
          Nessuna fase. Approva il progetto per generare il modello, oppure aggiungine una qui sopra.
        </p>
      )}
    </div>
  )
}
