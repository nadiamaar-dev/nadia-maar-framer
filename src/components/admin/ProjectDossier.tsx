/**
 * ProjectDossier — the "project-selected" level of the admin drill-down.
 *
 *   Clienti → [Client] → [Project]  ← you are here
 *
 * The dossier: overview + stages/chat + meetings + invoices, all scoped to
 * this one project. F1 ships Panoramica (functional) and the tab shell;
 * Fasi&Chat (F2/F3), Riunioni (F4), Fatture (F4) fill in next.
 */
import React, { useCallback, useEffect, useState } from "react"
import {
  fetchProjectStages, updateProjectStatus,
  type ClientProject, type ProjectStatus, type ProjectStage,
} from "../../lib/adminApi"
import type { ClientRecord } from "../../data/adminData"
import StagesManager from "./StagesManager"
import ProjectMeetings from "./ProjectMeetings"
import ProjectInvoices from "./ProjectInvoices"

const COPPER = "#B04A38"
const GREEN  = "#10B981"
const GOLD   = "rgba(200,185,110,0.95)"

const PROJ_CFG: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  pending_approval: { label: "In Approvazione", color: GOLD,                     bg: "rgba(200,185,110,0.09)", border: "rgba(200,185,110,0.28)" },
  active:           { label: "Attivo",          color: GREEN,                    bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)" },
  paused:           { label: "In Pausa",        color: "rgba(255,255,255,0.40)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)" },
  completed:        { label: "Completato",      color: "rgba(100,200,160,0.85)", bg: "rgba(100,200,160,0.07)", border: "rgba(100,200,160,0.22)" },
}

const STAGE_CFG: Record<ProjectStage["status"], { color: string; label: string }> = {
  locked: { color: "rgba(255,255,255,0.30)", label: "Da fare" },
  active: { color: COPPER,                    label: "In corso" },
  done:   { color: GREEN,                     label: "Completato" },
}

type Tab = "overview" | "stages" | "meetings" | "invoices"
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Panoramica" },
  { id: "stages",   label: "Fasi & Chat" },
  { id: "meetings", label: "Riunioni" },
  { id: "invoices", label: "Fatture" },
]

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })

interface Props {
  project: ClientProject
  client: ClientRecord
  onBack: () => void
  onBackToClients: () => void
}

export default function ProjectDossier({ project: initial, client, onBack, onBackToClients }: Props) {
  const [project, setProject] = useState(initial)
  const [tab, setTab]         = useState<Tab>("overview")
  const [stages, setStages]   = useState<ProjectStage[]>([])
  const [loading, setLoading] = useState(true)

  const loadStages = useCallback(() => {
    setLoading(true)
    fetchProjectStages(project.id).then(setStages).catch(() => {}).finally(() => setLoading(false))
  }, [project.id])

  useEffect(() => { loadStages() }, [loadStages])

  const cfg = PROJ_CFG[project.status]
  const doneCount = stages.filter(s => s.status === "done").length
  const pct = stages.length ? Math.round((doneCount / stages.length) * 100) : 0

  async function setStatus(status: ProjectStatus) {
    await updateProjectStatus(project.id, status)
    setProject(p => ({ ...p, status }))
    if (status === "active") loadStages() // stages auto-seed on activation
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        <button onClick={onBackToClients} className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>Clienti</button>
        <span style={{ color: "rgba(255,255,255,0.20)" }}>/</span>
        <button onClick={onBack} className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{client.company}</button>
        <span style={{ color: "rgba(255,255,255,0.20)" }}>/</span>
        <span style={{ color: COPPER }}>{project.name}</span>
      </div>

      {/* Header */}
      <div className="overflow-hidden rounded-2xl" style={{ background: "rgba(22,27,34,0.60)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div className="h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />{cfg.label}
            </span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white">{project.name}</h2>
            <p className="mt-1 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Avviato {fmtDate(project.createdAt)}</p>
          </div>

          {/* Status actions */}
          <div className="flex flex-wrap gap-2">
            {project.status === "pending_approval" && (
              <button onClick={() => setStatus("active")}
                className="rounded-xl px-4 py-2 font-display text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.80), rgba(12,150,100,0.70))", border: "1px solid rgba(16,185,129,0.45)" }}>
                Approva & Avvia
              </button>
            )}
            {project.status === "active" && (
              <>
                <button onClick={() => setStatus("paused")} className="rounded-xl border px-4 py-2 font-display text-[13px] font-semibold"
                  style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.04)" }}>Metti in pausa</button>
                <button onClick={() => setStatus("completed")} className="rounded-xl border px-4 py-2 font-display text-[13px] font-semibold"
                  style={{ borderColor: "rgba(100,200,160,0.30)", color: "rgba(100,200,160,0.85)", background: "rgba(100,200,160,0.06)" }}>Segna completato</button>
              </>
            )}
            {project.status === "paused" && (
              <button onClick={() => setStatus("active")} className="rounded-xl px-4 py-2 font-display text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.80), rgba(12,150,100,0.70))", border: "1px solid rgba(16,185,129,0.45)" }}>Riprendi</button>
            )}
          </div>
        </div>

        {/* Progress strip */}
        {stages.length > 0 && (
          <div className="flex items-center gap-4 border-t px-6 py-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: "rgba(255,255,255,0.40)" }}>Avanzamento</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${COPPER}, ${GREEN})`, transition: "width 0.6s" }} />
            </div>
            <span className="font-mono text-[12px] font-bold" style={{ color: COPPER }}>{doneCount}/{stages.length} · {pct}%</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b" style={{ borderColor: "rgba(255,255,255,0.08)", scrollbarWidth: "none" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="relative -mb-px shrink-0 whitespace-nowrap px-4 py-3 font-display text-[13px] font-semibold transition-colors"
            style={{ color: tab === t.id ? "#fff" : "rgba(255,255,255,0.35)", borderBottom: `2px solid ${tab === t.id ? COPPER : "transparent"}` }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="flex flex-col gap-5">
          {project.description && (
            <div className="rounded-2xl p-5" style={{ background: "rgba(22,27,34,0.60)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.28)" }}>Descrizione</p>
              <p className="font-display text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{project.description}</p>
            </div>
          )}
          {/* Stage timeline (read-only preview; full engine in Fasi & Chat) */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(22,27,34,0.60)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.28)" }}>Fasi del progetto</p>
              <button onClick={() => setTab("stages")} className="font-mono text-[10px] transition-colors hover:opacity-80" style={{ color: COPPER }}>Gestisci →</button>
            </div>
            {loading ? (
              <p className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>Caricamento…</p>
            ) : stages.length === 0 ? (
              <p className="font-display text-[13px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                Le fasi si creano quando il progetto viene approvato.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {stages.map(s => {
                  const sc = STAGE_CFG[s.status]
                  return (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold"
                        style={{ background: `${sc.color}22`, color: sc.color, border: `1px solid ${sc.color}45` }}>
                        {s.status === "done" ? "✓" : s.orderIndex}
                      </span>
                      <span className="flex-1 font-display text-[13px] font-semibold" style={{ color: s.status === "locked" ? "rgba(255,255,255,0.40)" : "#fff" }}>{s.title}</span>
                      <span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: sc.color }}>{sc.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "stages" && (
        <StagesManager projectId={project.id} clientId={project.clientId} stages={stages} onReload={loadStages} />
      )}

      {tab === "meetings" && <ProjectMeetings projectId={project.id} clientId={project.clientId} />}
      {tab === "invoices" && <ProjectInvoices projectId={project.id} clientId={project.clientId} />}
    </div>
  )
}
