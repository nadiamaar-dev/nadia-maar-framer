/**
 * ProjectProgress — client-facing project tracker.
 *
 * Data source: adminApi.fetchTasksForClient(clientId)
 *   • Offline/demo: returns filtered MOCK_TASKS from adminApi.ts
 *   • Live:         Supabase `client_tasks` table, RLS-filtered by auth user
 *
 * Admin updates status/progress via the Admin Panel (TaskManager).
 * This component is read-only for the client.
 */
import React, { useEffect, useState } from "react"
import {
  fetchTasksForClient,
  type AdminTask,
  type TaskStatus,
} from "../../lib/adminApi"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const COPPER  = "#B04A38"
const GREEN   = "#10B981"

/* ─── Default client shown when no Supabase user is available ── */
export const DEMO_CLIENT_ID = "c1"

/* ─── CSS ────────────────────────────────────────────────────── */
const STYLE_ID = "nm-progress-styles"
const CSS = `
.nm-prog-card {
  position: relative; overflow: hidden;
  background: rgba(30,37,48,0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 14px; padding: 22px 24px;
  transition: border-color 0.2s, transform 0.2s;
}
.nm-prog-card:hover {
  border-color: rgba(255,255,255,0.16);
  transform: translateY(-1px);
}
.nm-prog-track {
  height: 4px; border-radius: 99px;
  background: rgba(255,255,255,0.07);
  overflow: hidden; margin-top: 14px;
}
.nm-prog-stat {
  background: rgba(30,37,48,0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 12px; padding: 18px 22px;
  text-align: center;
}
@media (max-width: 640px) {
  .nm-prog-stats { grid-template-columns: 1fr 1fr !important; }
  .nm-prog-cards { grid-template-columns: 1fr !important; }
}
`

/* ─── Status config: maps AdminTask.status → display ─────────── */
const STATUS_CONFIG: Record<TaskStatus, {
  label: string; color: string; bg: string; barColor: string
}> = {
  "todo":        { label: "In Attesa",     color: "rgba(255,255,255,0.35)",    bg: "rgba(255,255,255,0.05)", barColor: "rgba(255,255,255,0.25)" },
  "in-progress": { label: "In Corso",      color: COPPER,                      bg: "rgba(176,74,56,0.12)",   barColor: COPPER },
  "review":      { label: "In Revisione",  color: "rgba(200,185,110,0.95)",    bg: "rgba(200,185,110,0.10)", barColor: "rgba(200,185,110,0.95)" },
  "done":        { label: "Completato",    color: GREEN,                       bg: "rgba(16,185,129,0.12)",  barColor: GREEN },
}

/* ─── Props ──────────────────────────────────────────────────── */
export interface ProjectProgressProps {
  /** Supabase profile ID of the authenticated client. Defaults to demo data. */
  clientId?: string
  /** Optional project label shown in the section heading. */
  projectName?: string
}

/* ─── Atoms ──────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px",
      background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
      borderRadius: 99,
      fontFamily: MONO, fontSize: 10, fontWeight: 600,
      letterSpacing: "0.06em", textTransform: "uppercase",
      color: cfg.color,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: cfg.color,
        boxShadow: `0 0 6px ${cfg.color}`,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  )
}

function ProgressBar({ value, status }: { value: number; status: TaskStatus }) {
  const color = STATUS_CONFIG[status].barColor
  return (
    <div className="nm-prog-track">
      <div style={{
        height: "100%",
        width: `${value}%`,
        background: value === 100
          ? `linear-gradient(90deg, ${GREEN}99, ${GREEN})`
          : `linear-gradient(90deg, ${COPPER}99, ${color})`,
        borderRadius: 99,
        transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  )
}

function TaskCard({ task }: { task: AdminTask }) {
  const cfg = STATUS_CONFIG[task.status]
  return (
    <div className="nm-prog-card">
      {/* Left accent stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, transparent, ${cfg.barColor}80, transparent)`,
        borderRadius: "14px 0 0 14px",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <span style={{
          fontFamily: MONO, fontSize: 9, letterSpacing: "0.20em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          padding: "2px 8px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4,
        }}>
          {task.category}
        </span>
        <StatusBadge status={task.status} />
      </div>

      <h3 style={{
        fontFamily: DISPLAY, fontSize: 15, fontWeight: 700,
        color: "#fff", margin: "10px 0 0", letterSpacing: "-0.01em",
      }}>
        {task.title}
      </h3>

      <p style={{
        fontFamily: DISPLAY, fontSize: 12, lineHeight: 1.6,
        color: "rgba(255,255,255,0.40)", margin: "6px 0 0",
      }}>
        {task.description}
      </p>

      <ProgressBar value={task.progress} status={task.status} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
          {task.dueDate && `Scadenza: ${task.dueDate}`}
        </span>
        <span style={{
          fontFamily: MONO, fontSize: 11, fontWeight: 700,
          color: task.progress === 100 ? GREEN : "rgba(255,255,255,0.45)",
        }}>
          {task.progress}%
        </span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="nm-prog-card" style={{ gap: 0 }}>
      {[80, 55, 100, 70].map((w, i) => (
        <div key={i} style={{
          height: i === 2 ? 14 : 10,
          width: `${w}%`,
          marginTop: i === 0 ? 0 : 10,
          borderRadius: 6,
          background: "rgba(255,255,255,0.06)",
          animation: "nm-pulse 1.4s ease-in-out infinite",
          animationDelay: `${i * 0.12}s`,
        }} />
      ))}
      <style>{`@keyframes nm-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
export default function ProjectProgress({
  clientId = DEMO_CLIENT_ID,
  projectName = "Il tuo Progetto",
}: ProjectProgressProps) {
  const [tasks,   setTasks]   = useState<AdminTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    fetchTasksForClient(clientId)
      .then(data  => { if (!cancelled) setTasks(data) })
      .catch(()   => { if (!cancelled) setError("Impossibile caricare i task.") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [clientId])

  const completed  = tasks.filter(t => t.status === "done").length
  const inProgress = tasks.filter(t => t.status === "in-progress").length
  const pending    = tasks.filter(t => t.status === "todo" || t.status === "review").length
  const overall    = tasks.length
    ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length)
    : 0

  return (
    <section>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: COPPER, marginBottom: 8 }}>
          Avanzamento Progetto
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          {projectName}
        </h2>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 24, padding: "12px 16px",
          background: "rgba(224,80,80,0.08)", border: "1px solid rgba(224,80,80,0.22)",
          borderRadius: 10, fontFamily: DISPLAY, fontSize: 13, color: "rgba(224,80,80,0.80)",
        }}>
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="nm-prog-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Avanzamento", value: `${overall}%`,      color: COPPER },
          { label: "Completati",  value: String(completed),  color: GREEN },
          { label: "In Corso",    value: String(inProgress), color: COPPER },
          { label: "In Attesa",   value: String(pending),    color: "rgba(255,255,255,0.35)" },
        ].map(s => (
          <div key={s.label} className="nm-prog-stat">
            <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: s.color, marginBottom: 4 }}>
              {loading ? "—" : s.value}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div style={{
        background: "rgba(30,37,48,0.40)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12, padding: "16px 20px", marginBottom: 28,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.40)", minWidth: 88, letterSpacing: "0.08em" }}>
          PROGRESSO TOTALE
        </span>
        <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: loading ? "0%" : `${overall}%`,
            background: `linear-gradient(90deg, ${COPPER}99, ${COPPER}, ${GREEN})`,
            borderRadius: 99,
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: COPPER, minWidth: 38, textAlign: "right" }}>
          {loading ? "—" : `${overall}%`}
        </span>
      </div>

      {/* Task grid */}
      <div className="nm-prog-cards" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : tasks.map(task => <TaskCard key={task.id} task={task} />)
        }
      </div>

      {!loading && tasks.length === 0 && !error && (
        <div style={{
          textAlign: "center", padding: "48px 20px",
          fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.30)",
        }}>
          Nessun task ancora pianificato. Il team aggiornerà questa sezione a breve.
        </div>
      )}
    </section>
  )
}
