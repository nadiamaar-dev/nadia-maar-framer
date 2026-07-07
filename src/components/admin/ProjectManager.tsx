/**
 * ProjectManager — Admin panel section for reviewing and approving client projects.
 *
 * Flow:
 *   Client submits → status = "pending_approval" → appears here
 *   Admin approves → status = "active"           → client sees it in their cabinet
 *   Admin rejects  → status = "paused"           → client notified via adminNote
 */
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  fetchAllProjects, updateProjectStatus,
  type AdminProject, type ProjectStatus,
} from "../../lib/adminApi"
import { supabase, SUPABASE_READY } from "../../lib/supabase"

/* ─── Design tokens ──────────────────────────────────────────── */
const COPPER = "#B04A38"
const GREEN  = "#10B981"
const GOLD   = "rgba(200,185,110,0.95)"

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_CFG: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  pending_approval: { label: "In Approvazione", color: GOLD,                         bg: "rgba(200,185,110,0.09)", border: "rgba(200,185,110,0.28)" },
  active:           { label: "Attivo",           color: GREEN,                        bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)" },
  paused:           { label: "In Pausa",         color: "rgba(255,255,255,0.40)",     bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)" },
  completed:        { label: "Completato",       color: "rgba(100,200,160,0.85)",     bg: "rgba(100,200,160,0.07)", border: "rgba(100,200,160,0.22)" },
}

function StatusPill({ status }: { status: ProjectStatus }) {
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

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })
}

/* ─── Project card ───────────────────────────────────────────── */
function ProjectCard({
  project, onUpdated,
}: {
  project: AdminProject
  onUpdated: (id: string, status: ProjectStatus, note?: string) => void
}) {
  const [expanded,  setExpanded]  = useState(false)
  const [note,      setNote]      = useState(project.adminNote ?? "")
  const [saving,    setSaving]    = useState<ProjectStatus | null>(null)
  const isPending = project.status === "pending_approval"

  async function handleAction(newStatus: ProjectStatus) {
    setSaving(newStatus)
    try {
      await updateProjectStatus(project.id, newStatus, note.trim() || undefined)
      onUpdated(project.id, newStatus, note.trim() || undefined)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div
      className="overflow-hidden rounded-2xl transition-all"
      style={{
        background:   isPending ? "rgba(200,185,110,0.04)" : "rgba(22,27,34,0.60)",
        backdropFilter: "blur(20px)",
        border:       `1px solid ${isPending ? "rgba(200,185,110,0.22)" : "rgba(255,255,255,0.09)"}`,
        boxShadow:    isPending ? "0 0 0 1px rgba(200,185,110,0.12) inset" : undefined,
      }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-col gap-2">
          {/* Client badge */}
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[9px] font-bold uppercase"
              style={{ background: "rgba(176,74,56,0.18)", color: COPPER }}
            >
              {project.clientName?.[0] ?? "?"}
            </div>
            <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>
              {project.clientName}
            </span>
            {project.clientEmail && (
              <a
                href={`mailto:${project.clientEmail}`}
                className="font-mono text-[9px] transition-opacity hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.22)" }}
              >
                {project.clientEmail}
              </a>
            )}
          </div>

          {/* Project name */}
          <h3
            className="font-display text-[15px] font-bold leading-tight text-white"
          >
            {project.name}
          </h3>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={project.status} />
            <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              Inviato {fmt(project.createdAt)}
            </span>
          </div>
        </div>

        {/* Expand / pending indicator */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          {isPending && (
            <div
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wide"
              style={{ background: "rgba(200,185,110,0.12)", color: GOLD, border: "1px solid rgba(200,185,110,0.28)" }}
            >
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: GOLD }} />
              Richiede approvazione
            </div>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="rounded-lg p-2 transition-colors"
            style={{ color: "rgba(255,255,255,0.30)", background: "rgba(255,255,255,0.05)" }}
          >
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="h-4 w-4 transition-transform"
              style={{ transform: expanded ? "rotate(180deg)" : undefined }}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="flex flex-col gap-4 border-t p-5"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          {/* Description */}
          <div>
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.28)" }}>
              Descrizione cliente
            </p>
            <p className="font-display text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
              {project.description || "—"}
            </p>
          </div>

          {/* Admin note textarea */}
          <div>
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.28)" }}>
              Nota per il cliente (opzionale)
            </p>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Es: Progetto approvato! Iniziamo lunedì…"
              className="w-full rounded-xl px-4 py-3 font-display text-[13px] outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.80)",
                resize: "vertical",
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5">
            {/* Approve */}
            {project.status !== "active" && (
              <button
                onClick={() => handleAction("active")}
                disabled={!!saving}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-[13px] font-bold text-white transition-all disabled:opacity-40"
                style={{
                  background: saving === "active"
                    ? "rgba(16,185,129,0.50)"
                    : "linear-gradient(135deg, rgba(16,185,129,0.80), rgba(12,150,100,0.70))",
                  border: "1px solid rgba(16,185,129,0.45)",
                }}
              >
                {saving === "active" ? (
                  <span className="font-mono text-[11px]">Salvataggio…</span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Approva Progetto
                  </>
                )}
              </button>
            )}

            {/* Pause / reject */}
            {project.status !== "paused" && project.status !== "completed" && (
              <button
                onClick={() => handleAction("paused")}
                disabled={!!saving}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-[13px] font-semibold transition-all disabled:opacity-40"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.50)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
                {saving === "paused" ? "Salvataggio…" : "Metti in Pausa"}
              </button>
            )}

            {/* Complete */}
            {project.status === "active" && (
              <button
                onClick={() => handleAction("completed")}
                disabled={!!saving}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-[13px] font-semibold transition-all disabled:opacity-40"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(100,200,160,0.85)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {saving === "completed" ? "Salvataggio…" : "Segna Completato"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
const STATUS_TABS: Array<ProjectStatus | "all"> = ["all", "pending_approval", "active", "paused", "completed"]
const TAB_LABELS: Record<ProjectStatus | "all", string> = {
  all: "Tutti", pending_approval: "In Approvazione", active: "Attivi", paused: "In Pausa", completed: "Completati",
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<ProjectStatus | "all">("pending_approval")
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const load = useCallback(() => {
    fetchAllProjects()
      .then(data => { setProjects(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()

    // Realtime: refresh list when any project is inserted or updated
    if (!SUPABASE_READY) return
    const ch = supabase
      .channel("admin-projects-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "client_projects" }, load)
      .subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [load])

  function handleUpdated(id: string, status: ProjectStatus, note?: string) {
    setProjects(prev =>
      prev.map(p => p.id === id ? { ...p, status, adminNote: note ?? p.adminNote } : p)
    )
  }

  const pendingCount = projects.filter(p => p.status === "pending_approval").length

  const visible = tab === "all" ? projects : projects.filter(p => p.status === tab)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>
          Gestione Progetti
        </p>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
            Progetti Clienti
          </h2>
          {pendingCount > 0 && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: "rgba(200,185,110,0.10)", border: "1px solid rgba(200,185,110,0.28)" }}
            >
              <span className="inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: GOLD }} />
              <span className="font-mono text-[11px] font-semibold" style={{ color: GOLD }}>
                {pendingCount} {pendingCount === 1 ? "progetto in attesa" : "progetti in attesa"}
              </span>
            </div>
          )}
        </div>
        <p className="mt-1 font-display text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Approva le richieste dei clienti e aggiorna lo stato dei progetti in corso.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(t => {
          const count = t === "all" ? projects.length : projects.filter(p => p.status === t).length
          const isActive = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.08em] transition-all"
              style={{
                background: isActive ? "rgba(176,74,56,0.14)" : "transparent",
                border:     `1px solid ${isActive ? "rgba(176,74,56,0.38)" : "rgba(255,255,255,0.09)"}`,
                color:      isActive ? "#D4695A" : "rgba(255,255,255,0.35)",
              }}
            >
              {TAB_LABELS[t]}
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold"
                  style={{
                    background: isActive ? "rgba(176,74,56,0.25)" : "rgba(255,255,255,0.08)",
                    color:      isActive ? "#D4695A" : "rgba(255,255,255,0.40)",
                  }}
                >
                  {count}
                </span>
              )}
              {t === "pending_approval" && count > 0 && (
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>
          Caricamento progetti…
        </div>
      ) : visible.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-20"
          style={{ border: "1px dashed rgba(255,255,255,0.09)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" className="mb-4 h-10 w-10">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
          <p className="font-display text-[14px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            {tab === "pending_approval" ? "Nessuna richiesta in attesa" : "Nessun progetto in questa categoria"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(p => (
            <ProjectCard key={p.id} project={p} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  )
}
