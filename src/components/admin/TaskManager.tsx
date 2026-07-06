import React, { useState, useEffect, useCallback } from "react"
import {
  fetchTasks, createTask, updateTask, deleteTask,
  type AdminTask, type TaskStatus, type TaskPhase,
} from "../../lib/adminApi"
import { MOCK_CLIENTS } from "../../data/adminData"

/* ─── Design tokens ──────────────────────────────────────────── */
const COPPER  = "#B04A38"
const GREEN   = "#10B981"
const GOLD    = "rgba(200,185,110,0.95)"

const STATUS_CFG: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  "todo":        { label: "Da Fare",       color: "rgba(255,255,255,0.40)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)" },
  "in-progress": { label: "In Corso",      color: COPPER,                   bg: "rgba(176,74,56,0.10)",   border: "rgba(176,74,56,0.28)" },
  "review":      { label: "In Revisione",  color: GOLD,                     bg: "rgba(200,185,110,0.08)", border: "rgba(200,185,110,0.25)" },
  "done":        { label: "Completato",    color: GREEN,                    bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)" },
}

const PHASES: TaskPhase[] = ["strategia", "design", "sviluppo", "testing", "deploy"]
const PHASE_LABELS: Record<TaskPhase, string> = {
  strategia: "Strategia", design: "Design", sviluppo: "Sviluppo", testing: "Testing", deploy: "Deploy",
}

const STATUSES: TaskStatus[] = ["todo", "in-progress", "review", "done"]

/* ─── Shared atoms ──────────────────────────────────────────── */
function StatusBadge({ status }: { status: TaskStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
      {c.label}
    </span>
  )
}

function ProgressBar({ value, status }: { value: number; status: TaskStatus }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          background: status === "done"
            ? `linear-gradient(90deg, ${GREEN}80, ${GREEN})`
            : `linear-gradient(90deg, ${COPPER}80, ${STATUS_CFG[status].color})`,
        }}
      />
    </div>
  )
}

/* ─── Add / Edit Task Drawer ─────────────────────────────────── */
interface TaskDrawerProps {
  initialClientId: string
  editTask?: AdminTask | null
  onSave: (task: AdminTask) => void
  onClose: () => void
}

function TaskDrawer({ initialClientId, editTask, onSave, onClose }: TaskDrawerProps) {
  const [clientId,    setClientId]    = useState(editTask?.clientId    ?? initialClientId)
  const [title,       setTitle]       = useState(editTask?.title       ?? "")
  const [description, setDescription] = useState(editTask?.description ?? "")
  const [category,    setCategory]    = useState(editTask?.category    ?? "")
  const [phase,       setPhase]       = useState<TaskPhase>(editTask?.phase    ?? "sviluppo")
  const [status,      setStatus]      = useState<TaskStatus>(editTask?.status  ?? "todo")
  const [progress,    setProgress]    = useState(editTask?.progress    ?? 0)
  const [dueDate,     setDueDate]     = useState(editTask?.dueDate     ?? "")
  const [saving,      setSaving]      = useState(false)

  async function handleSave() {
    if (!title.trim() || !clientId) return
    setSaving(true)
    try {
      let saved: AdminTask
      if (editTask) {
        await updateTask(editTask.id, { status, progress, phase, title, description, dueDate })
        saved = { ...editTask, title, description, category, phase, status, progress, dueDate, updatedAt: new Date().toISOString().slice(0,10) }
      } else {
        saved = await createTask({ clientId, title, description, category, phase, status, progress, dueDate })
      }
      onSave(saved)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 font-mono text-[12px] outline-none transition-colors"
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }
  const labelCls  = "mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]"
  const labelStyle = { color: "rgba(255,255,255,0.30)" }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto"
        style={{ background: "rgba(14,17,24,0.97)", backdropFilter: "blur(40px)", borderLeft: "1px solid rgba(255,255,255,0.09)", boxShadow: "-20px 0 60px rgba(0,0,0,0.55)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>
              {editTask ? "Modifica Task" : "Nuovo Task"}
            </p>
            <h2 className="mt-1 font-display text-lg font-extrabold text-white">
              {editTask ? editTask.title : "Aggiungi al progetto"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2" style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-1 flex-col gap-5 px-6 py-5">
          {/* Client */}
          <div>
            <label className={labelCls} style={labelStyle}>Cliente</label>
            <select
              className={inputCls}
              style={inputStyle}
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              disabled={!!editTask}
            >
              <option value="">— Seleziona cliente —</option>
              {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className={labelCls} style={labelStyle}>Titolo Task *</label>
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="es. Sviluppo pagina prodotto"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls} style={labelStyle}>Descrizione</label>
            <textarea
              className={inputCls}
              style={{ ...inputStyle, resize: "none" }}
              placeholder="Dettagli e note operative…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Category + Phase row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={labelStyle}>Categoria</label>
              <input
                className={inputCls}
                style={inputStyle}
                placeholder="es. Frontend"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Fase</label>
              <select className={inputCls} style={inputStyle} value={phase} onChange={e => setPhase(e.target.value as TaskPhase)}>
                {PHASES.map(p => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
              </select>
            </div>
          </div>

          {/* Status + Due date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={labelStyle}>Stato</label>
              <select className={inputCls} style={inputStyle} value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Scadenza</label>
              <input
                type="text"
                className={inputCls}
                style={inputStyle}
                placeholder="es. Ago 2025"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Progress slider */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelCls} style={{ ...labelStyle, marginBottom: 0 }}>Avanzamento</label>
              <span className="font-mono text-sm font-bold" style={{ color: STATUS_CFG[status].color }}>
                {progress}%
              </span>
            </div>
            <input
              type="range" min={0} max={100} step={5}
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-[#B04A38]"
            />
            <ProgressBar value={progress} status={status} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!title.trim() || !clientId || saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-display text-[13px] font-bold text-white transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}
            >
              {saving ? "Salvataggio…" : editTask ? "Salva modifiche" : "Crea Task"}
            </button>
            <button onClick={onClose} className="rounded-xl border px-4 py-3 font-display text-[13px] font-semibold transition-colors" style={{ borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.04)" }}>
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Kanban Column ──────────────────────────────────────────── */
function KanbanColumn({
  status, tasks, onEdit, onMoveStatus, onDelete,
}: {
  status: TaskStatus
  tasks: AdminTask[]
  onEdit: (t: AdminTask) => void
  onMoveStatus: (t: AdminTask, next: TaskStatus) => void
  onDelete: (id: string) => void
}) {
  const cfg = STATUS_CFG[status]
  const nextStatus: Record<TaskStatus, TaskStatus | null> = { "todo": "in-progress", "in-progress": "review", "review": "done", "done": null }
  const prevStatus: Record<TaskStatus, TaskStatus | null> = { "todo": null, "in-progress": "todo", "review": "in-progress", "done": "review" }

  return (
    <div className="flex min-w-[260px] flex-1 flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between rounded-xl px-3 py-2.5"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        <span className="flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-bold"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5">
        {tasks.map(task => {
          const clientName = MOCK_CLIENTS.find(c => c.id === task.clientId)?.company ?? task.clientId
          return (
            <div
              key={task.id}
              className="group relative flex flex-col gap-2.5 rounded-xl p-3.5 transition-all duration-150"
              style={{
                background: "rgba(22,27,34,0.65)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            >
              {/* Left accent line */}
              <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl"
                style={{ background: `linear-gradient(180deg, transparent, ${cfg.color}70, transparent)` }} />

              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {task.category && (
                    <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide"
                      style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {task.category}
                    </span>
                  )}
                  <span className="rounded px-1.5 py-0.5 font-mono text-[9px]"
                    style={{ color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.04)" }}>
                    {PHASE_LABELS[task.phase]}
                  </span>
                </div>
                {/* Action buttons (visible on hover) */}
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => onEdit(task)}
                    className="rounded p-1 transition-colors"
                    style={{ color: "rgba(255,255,255,0.30)", background: "rgba(255,255,255,0.06)" }}
                    title="Modifica">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
                    </svg>
                  </button>
                  <button onClick={() => onDelete(task.id)}
                    className="rounded p-1 transition-colors"
                    style={{ color: "rgba(224,80,80,0.50)", background: "rgba(224,80,80,0.06)" }}
                    title="Elimina">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Title */}
              <p className="font-display text-[13px] font-semibold leading-snug text-white">
                {task.title}
              </p>

              {task.description && (
                <p className="line-clamp-2 font-mono text-[10px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.32)" }}>
                  {task.description}
                </p>
              )}

              {/* Progress */}
              <div>
                <ProgressBar value={task.progress} status={status} />
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                    {clientName}
                  </span>
                  <span className="font-mono text-[10px] font-bold" style={{ color: cfg.color }}>
                    {task.progress}%
                  </span>
                </div>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between gap-2">
                {task.dueDate && (
                  <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                    ⏳ {task.dueDate}
                  </span>
                )}
                {/* Move arrows */}
                <div className="ml-auto flex gap-1">
                  {prevStatus[status] && (
                    <button
                      onClick={() => onMoveStatus(task, prevStatus[status]!)}
                      className="rounded px-1.5 py-0.5 font-mono text-[9px] transition-colors"
                      style={{ color: "rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                      title="Sposta indietro"
                    >
                      ←
                    </button>
                  )}
                  {nextStatus[status] && (
                    <button
                      onClick={() => onMoveStatus(task, nextStatus[status]!)}
                      className="rounded px-1.5 py-0.5 font-mono text-[9px] transition-colors"
                      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                      title="Avanza"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {tasks.length === 0 && (
          <div className="rounded-xl py-6 text-center font-mono text-[10px]"
            style={{ color: "rgba(255,255,255,0.18)", border: "1px dashed rgba(255,255,255,0.07)" }}>
            Nessun task
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function TaskManager() {
  const [tasks,          setTasks]          = useState<AdminTask[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [phaseFilter,    setPhaseFilter]    = useState<TaskPhase | "all">("all")
  const [showDrawer,     setShowDrawer]     = useState(false)
  const [editingTask,    setEditingTask]    = useState<AdminTask | null>(null)
  const [loading,        setLoading]        = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchTasks(selectedClient === "all" ? undefined : selectedClient)
    setTasks(data)
    setLoading(false)
  }, [selectedClient])

  useEffect(() => { load() }, [load])

  const filtered = tasks.filter(t =>
    (selectedClient === "all" || t.clientId === selectedClient) &&
    (phaseFilter === "all" || t.phase === phaseFilter)
  )

  function tasksByStatus(s: TaskStatus) {
    return filtered.filter(t => t.status === s)
  }

  function handleSave(saved: AdminTask) {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === saved.id)
      return idx >= 0 ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev]
    })
    setShowDrawer(false)
    setEditingTask(null)
  }

  function handleMoveStatus(task: AdminTask, newStatus: TaskStatus) {
    const updated = { ...task, status: newStatus, progress: newStatus === "done" ? 100 : task.progress }
    updateTask(task.id, { status: newStatus, progress: updated.progress })
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
  }

  function handleDelete(id: string) {
    deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const totalByStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasksByStatus(s).length }), {} as Record<TaskStatus, number>)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>Task Manager</p>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">Gestione Progetti</h2>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowDrawer(true) }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[13px] font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nuovo Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Client selector */}
        <select
          value={selectedClient}
          onChange={e => setSelectedClient(e.target.value)}
          className="rounded-xl px-3.5 py-2 font-mono text-[11px] outline-none transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.70)" }}
        >
          <option value="all">Tutti i clienti</option>
          {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
        </select>

        {/* Phase filter */}
        <div className="flex gap-1.5 flex-wrap">
          {(["all", ...PHASES] as const).map(p => (
            <button
              key={p}
              onClick={() => setPhaseFilter(p)}
              className="rounded-lg px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-all"
              style={{
                background: phaseFilter === p ? "rgba(176,74,56,0.14)" : "transparent",
                border: `1px solid ${phaseFilter === p ? "rgba(176,74,56,0.35)" : "rgba(255,255,255,0.08)"}`,
                color: phaseFilter === p ? "#D4695A" : "rgba(255,255,255,0.32)",
              }}
            >
              {p === "all" ? "Tutte le fasi" : PHASE_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Stats pills */}
        <div className="ml-auto flex gap-2">
          {STATUSES.map(s => {
            const cfg = STATUS_CFG[s]
            return (
              <span key={s} className="rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold"
                style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                {totalByStatus[s]}
              </span>
            )
          })}
        </div>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex items-center justify-center py-20 font-mono text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
          Caricamento…
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.10) transparent" }}>
          {STATUSES.map(s => (
            <KanbanColumn
              key={s}
              status={s}
              tasks={tasksByStatus(s)}
              onEdit={t => { setEditingTask(t); setShowDrawer(true) }}
              onMoveStatus={handleMoveStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      {showDrawer && (
        <TaskDrawer
          initialClientId={selectedClient === "all" ? MOCK_CLIENTS[0].id : selectedClient}
          editTask={editingTask}
          onSave={handleSave}
          onClose={() => { setShowDrawer(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}
