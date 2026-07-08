import React, { useState, useEffect, useCallback } from "react"
import {
  fetchAllMeetings, adminProposeMeeting, updateMeetingStatus, fetchClients,
  type Meeting, type MeetingStatus,
} from "../../lib/adminApi"
import type { ClientRecord } from "../../data/adminData"
import { SLOT_TIMES, toLocalDate } from "../../hooks/useMeetingAvailability"

const COPPER = "#B04A38"
const GREEN  = "#10B981"

const STATUS_CFG: Record<MeetingStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "Da Confermare", color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.09)", border: "rgba(200,185,110,0.28)" },
  confirmed:   { label: "Confermato",    color: GREEN,                    bg: "rgba(16,185,129,0.09)",  border: "rgba(16,185,129,0.28)" },
  cancelled:   { label: "Annullato",     color: "rgba(255,255,255,0.30)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
  rescheduled: { label: "Ripianificato", color: COPPER,                   bg: "rgba(176,74,56,0.09)",   border: "rgba(176,74,56,0.25)" },
}

const FILTER_TABS: { id: MeetingStatus | "all"; label: string }[] = [
  { id: "all",       label: "Tutti" },
  { id: "pending",   label: "Da Confermare" },
  { id: "confirmed", label: "Confermati" },
  { id: "cancelled", label: "Annullati" },
]

function StatusPill({ status }: { status: MeetingStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

function ProposerBadge({ proposedBy }: { proposedBy: "admin" | "client" }) {
  return (
    <span className="rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide"
      style={proposedBy === "admin"
        ? { color: COPPER, background: "rgba(176,74,56,0.12)", border: "1px solid rgba(176,74,56,0.25)" }
        : { color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }
      }>
      {proposedBy === "admin" ? "Team" : "Cliente"}
    </span>
  )
}

/* ─── Propose meeting form (slide-in panel) ──────────────────── */
function ProposePanel({ clients, onProposed, onClose }: { clients: ClientRecord[]; onProposed: (m: Meeting) => void; onClose: () => void }) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "")
  const [date,     setDate]     = useState("")
  const [time,     setTime]     = useState("")
  const [note,     setNote]     = useState("")
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState("")

  const minDate = toLocalDate(new Date())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) return
    setSaving(true); setErr("")
    try {
      const meeting = await adminProposeMeeting({ clientId, datetime: `${date}T${time}`, adminNote: note.trim() || undefined })
      onProposed(meeting)
    } catch {
      setErr("Errore durante la proposta. Riprova.")
    } finally {
      setSaving(false)
    }
  }

  const inputCls  = "w-full rounded-xl px-3.5 py-2.5 font-mono text-[12px] outline-none"
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto"
        style={{ background: "rgba(14,17,24,0.97)", backdropFilter: "blur(40px)", borderLeft: "1px solid rgba(255,255,255,0.09)", boxShadow: "-20px 0 60px rgba(0,0,0,0.55)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>Admin</p>
            <h2 className="mt-1 font-display text-lg font-extrabold text-white">Proponi Orario</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2" style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 px-6 py-5">
          {/* Client */}
          <div>
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Cliente *</label>
            <select className={inputCls} style={inputStyle} value={clientId} onChange={e => setClientId(e.target.value)}>
              {clients.length === 0 && <option value="">— Nessun cliente —</option>}
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.company}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Data *</label>
            <input type="date" className={inputCls} style={inputStyle} min={minDate} value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          {/* Time slot */}
          <div>
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Orario *</label>
            <div className="grid grid-cols-4 gap-2">
              {SLOT_TIMES.map(t => (
                <button key={t} type="button"
                  onClick={() => setTime(t === time ? "" : t)}
                  className="rounded-lg py-2 font-mono text-[11px] font-semibold transition-all"
                  style={{
                    background: time === t ? "rgba(176,74,56,0.18)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${time === t ? "rgba(176,74,56,0.45)" : "rgba(255,255,255,0.08)"}`,
                    color: time === t ? "#D4695A" : "rgba(255,255,255,0.45)",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Nota per il cliente</label>
            <textarea className={inputCls} style={{ ...inputStyle, resize: "none" }} rows={3}
              placeholder="es. Sprint review, allineamento strategico…"
              value={note} onChange={e => setNote(e.target.value)} maxLength={300} />
          </div>

          {err && <p className="font-display text-[12px]" style={{ color: "rgba(224,80,80,0.80)" }}>{err}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={!clientId || !date || !time || saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-display text-[13px] font-bold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}>
              {saving ? "Invio…" : "Invia Proposta"}
            </button>
            <button type="button" onClick={onClose}
              className="rounded-xl border px-4 py-3 font-display text-[13px] font-semibold"
              style={{ borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.04)" }}>
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
export default function MeetingManager() {
  const [meetings,    setMeetings]    = useState<Meeting[]>([])
  const [clients,     setClients]     = useState<ClientRecord[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState<MeetingStatus | "all">("all")
  const [showPropose, setShowPropose] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchAllMeetings().then(data => { setMeetings(data); setLoading(false) })
    fetchClients().then(setClients).catch(() => {})
  }, [])

  const counts = {
    all:       meetings.length,
    pending:   meetings.filter(m => m.status === "pending").length,
    confirmed: meetings.filter(m => m.status === "confirmed").length,
    cancelled: meetings.filter(m => m.status === "cancelled").length,
  }

  const filtered = filter === "all" ? meetings : meetings.filter(m => m.status === filter)

  const handleConfirm = useCallback(async (m: Meeting) => {
    await updateMeetingStatus(m.id, "confirmed")
    setMeetings(prev => prev.map(x => x.id === m.id ? { ...x, status: "confirmed" } : x))
  }, [])

  const handleCancel = useCallback(async (m: Meeting) => {
    await updateMeetingStatus(m.id, "cancelled")
    setMeetings(prev => prev.map(x => x.id === m.id ? { ...x, status: "cancelled" } : x))
  }, [])

  const handleProposed = useCallback((m: Meeting) => {
    setMeetings(prev => [m, ...prev])
    setShowPropose(false)
  }, [])

  const glassPanel = {
    background: "rgba(22,27,34,0.60)",
    backdropFilter: "blur(24px)" as const,
    WebkitBackdropFilter: "blur(24px)" as const,
    border: "1px solid rgba(255,255,255,0.09)",
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>Calendario</p>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">Riunioni</h2>
        </div>
        <button
          onClick={() => setShowPropose(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[13px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Proponi Orario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Totale",        value: counts.all,       color: "rgba(255,255,255,0.55)" },
          { label: "Da Confermare", value: counts.pending,   color: "rgba(200,185,110,0.95)" },
          { label: "Confermati",    value: counts.confirmed, color: GREEN },
          { label: "Annullati",     value: counts.cancelled, color: "rgba(255,255,255,0.28)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="font-mono text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.25)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wide transition-all"
            style={{
              background: filter === tab.id ? "rgba(176,74,56,0.14)" : "transparent",
              border: `1px solid ${filter === tab.id ? "rgba(176,74,56,0.35)" : "rgba(255,255,255,0.08)"}`,
              color: filter === tab.id ? "#D4695A" : "rgba(255,255,255,0.30)",
            }}
          >
            {tab.label}
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.40)" }}>
              {counts[tab.id as keyof typeof counts] ?? counts.all}
            </span>
          </button>
        ))}
      </div>

      {/* Meeting list */}
      <div className="overflow-hidden rounded-2xl" style={glassPanel}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Cliente", "Data & Ora", "Proposto da", "Nota", "Stato", "Azioni"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center font-mono text-sm" style={{ color: "rgba(255,255,255,0.22)" }}>Caricamento…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center font-mono text-sm" style={{ color: "rgba(255,255,255,0.22)" }}>Nessuna riunione</td></tr>
              ) : filtered.map((m, idx) => {
                const dt = new Date(`${m.datetime}`)
                const dateLabel = dt.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                const timeLabel = m.datetime.slice(11, 16)
                const isPast    = dt < new Date()
                const canAct    = m.status === "pending" && !isPast

                return (
                  <tr key={m.id} className="transition-colors"
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>

                    <td className="px-4 py-3.5">
                      <p className="font-display text-[13px] font-semibold text-white">{m.clientName ?? m.clientId}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-display text-[13px] font-semibold" style={{ color: isPast ? "rgba(255,255,255,0.35)" : "#fff" }}>{dateLabel}</p>
                      <p className="font-mono text-[12px] font-bold" style={{ color: isPast ? "rgba(255,255,255,0.25)" : COPPER }}>{timeLabel}</p>
                    </td>
                    <td className="px-4 py-3.5"><ProposerBadge proposedBy={m.proposedBy} /></td>
                    <td className="px-4 py-3.5">
                      <p className="max-w-[180px] truncate font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {m.adminNote || m.clientNote || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5"><StatusPill status={m.status} /></td>
                    <td className="px-4 py-3.5">
                      {canAct && m.proposedBy === "client" ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleConfirm(m)}
                            className="rounded-lg px-2.5 py-1.5 font-mono text-[10px] font-bold transition-colors"
                            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.30)", color: GREEN }}>
                            Conferma
                          </button>
                          <button onClick={() => handleCancel(m)}
                            className="rounded-lg px-2.5 py-1.5 font-mono text-[10px] font-semibold transition-colors"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.35)" }}>
                            Annulla
                          </button>
                        </div>
                      ) : canAct && m.proposedBy === "admin" ? (
                        <span className="font-mono text-[10px]" style={{ color: "rgba(200,185,110,0.60)" }}>
                          In attesa cliente
                        </span>
                      ) : (
                        <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPropose && <ProposePanel clients={clients} onProposed={handleProposed} onClose={() => setShowPropose(false)} />}
    </div>
  )
}
