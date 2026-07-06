import React, { useEffect } from "react"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const COPPER  = "#B04A38"
const GREEN   = "#10B981"

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

/* ─── Types ──────────────────────────────────────────────────── */
export type TaskStatus = "completed" | "in-progress" | "review" | "pending"

export interface ProjectTask {
  id: string
  title: string
  description: string
  category: string
  status: TaskStatus
  progress: number   // 0–100
  dueDate?: string
}

export interface ProjectProgressProps {
  tasks?: ProjectTask[]
  projectName?: string
}

/* ─── Mock data ──────────────────────────────────────────────── */
const MOCK_TASKS: ProjectTask[] = [
  {
    id: "1",
    title: "Analisi dei Requisiti",
    description: "Raccolta brief, benchmark competitivi e definizione degli obiettivi di progetto.",
    category: "Strategia",
    status: "completed",
    progress: 100,
    dueDate: "Gen 2025",
  },
  {
    id: "2",
    title: "Design System & UI",
    description: "Palette, tipografia, componenti base e prototipo Figma ad alta fedeltà.",
    category: "Design",
    status: "completed",
    progress: 100,
    dueDate: "Feb 2025",
  },
  {
    id: "3",
    title: "Sviluppo Homepage",
    description: "Implementazione React, animazioni Framer Motion e sezioni above-the-fold.",
    category: "Sviluppo UI",
    status: "in-progress",
    progress: 72,
    dueDate: "Lug 2025",
  },
  {
    id: "4",
    title: "Integrazione CMS & Backend",
    description: "Connessione Supabase, gestione contenuti e autenticazione utenti.",
    category: "Backend",
    status: "in-progress",
    progress: 45,
    dueDate: "Ago 2025",
  },
  {
    id: "5",
    title: "Testing & QA",
    description: "Test cross-browser, performance Lighthouse e verifica accessibilità WCAG.",
    category: "Testing",
    status: "review",
    progress: 20,
    dueDate: "Set 2025",
  },
  {
    id: "6",
    title: "Deploy & Go Live",
    description: "Configurazione Vercel, domini, CDN e monitoraggio post-lancio.",
    category: "Deploy",
    status: "pending",
    progress: 0,
    dueDate: "Ott 2025",
  },
]

/* ─── Helpers ────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; barColor: string }> = {
  completed:   { label: "Completato",    color: GREEN,                       bg: "rgba(16,185,129,0.12)",  barColor: GREEN },
  "in-progress":{ label: "In Corso",     color: COPPER,                      bg: "rgba(176,74,56,0.12)",   barColor: COPPER },
  review:      { label: "In Revisione",  color: "rgba(200,185,110,0.95)",    bg: "rgba(200,185,110,0.10)", barColor: "rgba(200,185,110,0.95)" },
  pending:     { label: "In Attesa",     color: "rgba(255,255,255,0.35)",    bg: "rgba(255,255,255,0.05)", barColor: "rgba(255,255,255,0.25)" },
}

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

function TaskCard({ task }: { task: ProjectTask }) {
  return (
    <div className="nm-prog-card">
      {/* Left accent stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, transparent, ${STATUS_CONFIG[task.status].barColor}80, transparent)`,
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

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 6,
      }}>
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

/* ─── Component ──────────────────────────────────────────────── */
export default function ProjectProgress({ tasks = MOCK_TASKS, projectName = "Progetto Cliente" }: ProjectProgressProps) {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  const completed  = tasks.filter(t => t.status === "completed").length
  const inProgress = tasks.filter(t => t.status === "in-progress").length
  const pending    = tasks.filter(t => t.status === "pending" || t.status === "review").length
  const overall    = tasks.length ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) : 0

  return (
    <section>
      {/* Section header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: COPPER, marginBottom: 8 }}>
          Avanzamento Progetto
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          {projectName}
        </h2>
      </div>

      {/* Stats row */}
      <div className="nm-prog-stats" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28,
      }}>
        {[
          { label: "Avanzamento",  value: `${overall}%`,      color: COPPER },
          { label: "Completati",   value: String(completed),  color: GREEN },
          { label: "In Corso",     value: String(inProgress), color: COPPER },
          { label: "In Attesa",    value: String(pending),    color: "rgba(255,255,255,0.35)" },
        ].map(s => (
          <div key={s.label} className="nm-prog-stat">
            <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: s.color, marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div style={{
        background: "rgba(30,37,48,0.40)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12, padding: "16px 20px",
        marginBottom: 28, display: "flex", alignItems: "center", gap: 16,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.40)", minWidth: 88, letterSpacing: "0.08em" }}>
          PROGRESSO TOTALE
        </span>
        <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${overall}%`,
            background: `linear-gradient(90deg, ${COPPER}99, ${COPPER}, ${GREEN})`,
            borderRadius: 99, transition: "width 1s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: COPPER, minWidth: 38, textAlign: "right" }}>
          {overall}%
        </span>
      </div>

      {/* Task grid */}
      <div className="nm-prog-cards" style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14,
      }}>
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </div>
    </section>
  )
}
