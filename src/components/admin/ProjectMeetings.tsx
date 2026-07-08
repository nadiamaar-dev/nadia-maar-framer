/**
 * ProjectMeetings — Riunioni tab of the dossier. Meetings scoped to one
 * project. Admin proposes a slot (client + project prefilled) and can
 * confirm / cancel the client's own proposals.
 */
import React, { useCallback, useEffect, useState } from "react"
import {
  fetchMeetingsByProject, adminProposeMeeting, updateMeetingStatus,
  type Meeting, type MeetingStatus,
} from "../../lib/adminApi"
import { SLOT_TIMES, toLocalDate } from "../../hooks/useMeetingAvailability"

const COPPER = "#B04A38"
const GREEN  = "#10B981"

const CFG: Record<MeetingStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "Da confermare", color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.09)", border: "rgba(200,185,110,0.28)" },
  confirmed:   { label: "Confermato",    color: GREEN,                    bg: "rgba(16,185,129,0.09)",  border: "rgba(16,185,129,0.28)" },
  cancelled:   { label: "Annullato",     color: "rgba(255,255,255,0.30)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
  rescheduled: { label: "Ripianificato", color: COPPER,                   bg: "rgba(176,74,56,0.09)",   border: "rgba(176,74,56,0.25)" },
}

export default function ProjectMeetings({ projectId, clientId }: { projectId: string; clientId: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading,  setLoading]  = useState(true)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchMeetingsByProject(projectId).then(setMeetings).catch(() => {}).finally(() => setLoading(false))
  }, [projectId])
  useEffect(() => { load() }, [load])

  async function propose(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) return
    setSaving(true)
    try {
      await adminProposeMeeting({ clientId, projectId, datetime: `${date}T${time}`, adminNote: note.trim() || undefined })
      setDate(""); setTime(""); setNote(""); load()
    } finally { setSaving(false) }
  }

  async function setStatus(m: Meeting, status: MeetingStatus) {
    await updateMeetingStatus(m.id, status)
    setMeetings(prev => prev.map(x => x.id === m.id ? { ...x, status } : x))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Propose */}
      <form onSubmit={propose} className="rounded-2xl p-5" style={{ background: "rgba(176,74,56,0.05)", border: "1px solid rgba(176,74,56,0.20)" }}>
        <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>Proponi una riunione</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Data</label>
            <input type="date" min={toLocalDate(new Date())} value={date} onChange={e => setDate(e.target.value)}
              className="rounded-xl px-3 py-2 font-mono text-[12px] outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }} />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Orario</label>
            <div className="flex flex-wrap gap-1.5">
              {SLOT_TIMES.map(t => (
                <button key={t} type="button" onClick={() => setTime(t === time ? "" : t)}
                  className="rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-all"
                  style={{ background: time === t ? "rgba(176,74,56,0.18)" : "rgba(255,255,255,0.04)", border: `1px solid ${time === t ? "rgba(176,74,56,0.45)" : "rgba(255,255,255,0.08)"}`, color: time === t ? "#D4695A" : "rgba(255,255,255,0.45)" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Nota (es. Sprint review)…" maxLength={200}
          className="mt-3 w-full rounded-xl px-3.5 py-2.5 font-display text-[13px] outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }} />
        <button type="submit" disabled={!date || !time || saving}
          className="mt-3 rounded-xl px-4 py-2.5 font-display text-[13px] font-bold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}>
          {saving ? "Invio…" : "Invia proposta"}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p className="py-4 text-center font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>Caricamento…</p>
      ) : meetings.length === 0 ? (
        <p className="py-4 text-center font-display text-[13px]" style={{ color: "rgba(255,255,255,0.30)" }}>Nessuna riunione per questo progetto.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {meetings.map(m => {
            const cfg = CFG[m.status]
            const dt = new Date(m.datetime)
            const dateLabel = dt.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })
            const canAct = m.status === "pending" && m.proposedBy === "client" && dt > new Date()
            return (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4" style={{ background: "rgba(22,27,34,0.55)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <div>
                  <p className="font-display text-[13px] font-semibold text-white">{dateLabel} · <span style={{ color: COPPER }}>{m.datetime.slice(11, 16)}</span></p>
                  <p className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {m.proposedBy === "admin" ? "Proposto dal team" : "Richiesto dal cliente"}{m.adminNote || m.clientNote ? ` · ${m.adminNote || m.clientNote}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
                  {canAct && (
                    <>
                      <button onClick={() => setStatus(m, "confirmed")} className="rounded-lg px-2.5 py-1.5 font-mono text-[10px] font-bold" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.30)", color: GREEN }}>Conferma</button>
                      <button onClick={() => setStatus(m, "cancelled")} className="rounded-lg px-2.5 py-1.5 font-mono text-[10px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.35)" }}>Annulla</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
