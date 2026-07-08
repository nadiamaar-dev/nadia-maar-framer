/**
 * ClientWorkspace — the "client-selected" level of the admin drill-down.
 *
 *   Clienti → [Client]  ← you are here
 *
 * Shows the client's profile (editable) and the grid of their projects.
 * Selecting a project drills into the ProjectDossier.
 */
import React, { useCallback, useEffect, useState } from "react"
import {
  fetchProjectsByClient, updateClientProfile,
  type ClientProject, type ProjectStatus,
} from "../../lib/adminApi"
import type { ClientRecord, ClientStatus, ClientPlan } from "../../data/adminData"

const COPPER = "#B04A38"
const GREEN  = "#10B981"
const GOLD   = "rgba(200,185,110,0.95)"

const PROJ_CFG: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  pending_approval: { label: "In Approvazione", color: GOLD,                     bg: "rgba(200,185,110,0.09)", border: "rgba(200,185,110,0.28)" },
  active:           { label: "Attivo",          color: GREEN,                    bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)" },
  paused:           { label: "In Pausa",        color: "rgba(255,255,255,0.40)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)" },
  completed:        { label: "Completato",      color: "rgba(100,200,160,0.85)", bg: "rgba(100,200,160,0.07)", border: "rgba(100,200,160,0.22)" },
}

const PLAN_LABEL: Record<ClientPlan, string> = { starter: "Starter", pro: "Pro", enterprise: "Enterprise" }
const STATUS_LABEL: Record<ClientStatus, string> = { active: "Attivo", onboarding: "Onboarding", paused: "In Pausa" }

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })

interface Props {
  client: ClientRecord
  onBack: () => void
  onOpenProject: (project: ClientProject) => void
  onClientUpdated?: (client: ClientRecord) => void
}

export default function ClientWorkspace({ client, onBack, onOpenProject, onClientUpdated }: Props) {
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchProjectsByClient(client.id)
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [client.id])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        <button onClick={onBack} className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>
          Clienti
        </button>
        <span style={{ color: "rgba(255,255,255,0.20)" }}>/</span>
        <span style={{ color: COPPER }}>{client.company}</span>
      </div>

      {/* Client header card */}
      <div className="overflow-hidden rounded-2xl" style={{ background: "rgba(22,27,34,0.60)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div className="h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${COPPER}, transparent)` }} />
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-extrabold"
              style={{ background: "rgba(176,74,56,0.16)", color: COPPER, border: "1px solid rgba(176,74,56,0.30)" }}>
              {client.company?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">{client.company}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.42)" }}>
                <span>{client.contact}</span>
                <a href={`mailto:${client.email}`} className="transition-opacity hover:opacity-80" style={{ color: COPPER }}>{client.email}</a>
                <span>· {PLAN_LABEL[client.plan]} · {STATUS_LABEL[client.status]}</span>
              </div>
              {client.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {client.tags.map(t => (
                    <span key={t} className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide"
                      style={{ color: "rgba(255,255,255,0.38)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 font-display text-[12px] font-semibold transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.04)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
            </svg>
            Modifica profilo
          </button>
        </div>
      </div>

      {/* Projects */}
      <div className="flex items-center gap-4">
        <div className="font-display text-base font-bold text-white">Progetti</div>
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        <span className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wide"
          style={{ background: "rgba(176,74,56,0.12)", color: "#D4695A", border: "1px solid rgba(176,74,56,0.25)" }}>
          {loading ? "…" : `${projects.length} progett${projects.length === 1 ? "o" : "i"}`}
        </span>
      </div>

      {loading ? (
        <div className="py-14 text-center font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>Caricamento progetti…</div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-16" style={{ border: "1px dashed rgba(255,255,255,0.09)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" className="mb-3 h-9 w-9">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
          <p className="font-display text-[14px]" style={{ color: "rgba(255,255,255,0.30)" }}>Questo cliente non ha ancora progetti.</p>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {projects.map(p => {
            const cfg = PROJ_CFG[p.status]
            return (
              <button key={p.id} onClick={() => onOpenProject(p)}
                className="group flex flex-col gap-3 rounded-2xl p-5 text-left transition-all"
                style={{ background: "rgba(22,27,34,0.60)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(176,74,56,0.35)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}>
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
                    {cfg.label}
                  </span>
                  <span className="font-mono text-[13px] transition-colors" style={{ color: "rgba(255,255,255,0.20)" }}>→</span>
                </div>
                <h3 className="font-display text-[15px] font-bold leading-snug text-white">{p.name}</h3>
                {p.description && (
                  <p className="line-clamp-2 font-mono text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{p.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                  <span>Avviato {fmtDate(p.createdAt)}</span>
                  <span>Aggiornato {fmtDate(p.updatedAt)}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {editing && (
        <EditProfilePanel
          client={client}
          onClose={() => setEditing(false)}
          onSaved={c => { onClientUpdated?.(c); setEditing(false) }}
        />
      )}
    </div>
  )
}

/* ─── Inline profile editor (company / contact / phone / plan / status / tags) ─── */
function EditProfilePanel({ client, onClose, onSaved }: { client: ClientRecord; onClose: () => void; onSaved: (c: ClientRecord) => void }) {
  const [form, setForm] = useState({
    company: client.company === "—" ? "" : client.company,
    contact: client.contact === "—" ? "" : client.contact,
    plan: client.plan, status: client.status,
    tags: client.tags.join(", "),
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean)
    try {
      await updateClientProfile(client.id, { company: form.company.trim(), contact: form.contact.trim(), plan: form.plan, status: form.status, tags })
      onSaved({ ...client, company: form.company.trim() || "—", contact: form.contact.trim() || "—", plan: form.plan, status: form.status, tags })
    } finally { setSaving(false) }
  }

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 font-mono text-[12px] outline-none"
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }
  const labelCls = "mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]"
  const labelStyle = { color: "rgba(255,255,255,0.30)" }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto"
        style={{ background: "rgba(18,22,30,0.95)", backdropFilter: "blur(40px)", borderLeft: "1px solid rgba(255,255,255,0.09)", boxShadow: "-20px 0 60px rgba(0,0,0,0.50)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>Modifica Profilo</p>
            <h2 className="font-display text-lg font-extrabold text-white">{client.email}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2" style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-5 p-6">
          <div><label className={labelCls} style={labelStyle}>Azienda</label>
            <input className={inputCls} style={inputStyle} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Nome azienda" /></div>
          <div><label className={labelCls} style={labelStyle}>Referente</label>
            <input className={inputCls} style={inputStyle} value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Nome e cognome" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls} style={labelStyle}>Piano</label>
              <select className={inputCls} style={inputStyle} value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value as ClientPlan }))}>
                {(["starter", "pro", "enterprise"] as ClientPlan[]).map(p => <option key={p} value={p}>{PLAN_LABEL[p]}</option>)}
              </select></div>
            <div><label className={labelCls} style={labelStyle}>Stato</label>
              <select className={inputCls} style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ClientStatus }))}>
                {(["active", "onboarding", "paused"] as ClientStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select></div>
          </div>
          <div><label className={labelCls} style={labelStyle}>Tag (separati da virgola)</label>
            <input className={inputCls} style={inputStyle} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="E-commerce, SEO" /></div>
        </div>
        <div className="border-t p-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-display text-[13px] font-bold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}>
              {saving ? "Salvataggio…" : "Salva modifiche"}
            </button>
            <button onClick={onClose} className="rounded-xl border px-4 py-3 font-display text-[13px] font-semibold"
              style={{ borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.04)" }}>Annulla</button>
          </div>
        </div>
      </div>
    </div>
  )
}
