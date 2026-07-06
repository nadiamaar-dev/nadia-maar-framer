import React, { useState, useEffect } from "react"
import {
  fetchTickets, updateTicket,
  type SupportTicket, type TicketStatus, type TicketPriority,
  relativeDate,
} from "../../lib/adminApi"

const COPPER = "#B04A38"
const GREEN  = "#10B981"

/* ─── Config maps ────────────────────────────────────────────── */
const STATUS_CFG: Record<TicketStatus, { label: string; color: string; bg: string; border: string; next: TicketStatus | null }> = {
  "new":         { label: "Nuovo",        color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.09)", border: "rgba(200,185,110,0.28)", next: "in-progress" },
  "in-progress": { label: "In Lavorazione", color: COPPER,                bg: "rgba(176,74,56,0.09)",   border: "rgba(176,74,56,0.28)",   next: "resolved" },
  "resolved":    { label: "Risolto",      color: GREEN,                   bg: "rgba(16,185,129,0.09)",  border: "rgba(16,185,129,0.25)",  next: null },
}

const PRIORITY_CFG: Record<TicketPriority, { label: string; color: string; dot: string }> = {
  critical: { label: "Critica",  color: "#E05050",                dot: "#E05050" },
  high:     { label: "Alta",     color: COPPER,                   dot: COPPER },
  medium:   { label: "Media",    color: "rgba(200,185,110,0.95)", dot: "rgba(200,185,110,0.95)" },
  low:      { label: "Bassa",    color: "rgba(255,255,255,0.35)", dot: "rgba(255,255,255,0.25)" },
}

const PRIORITY_ORDER: TicketPriority[] = ["critical", "high", "medium", "low"]
const STATUSES: (TicketStatus | "all")[] = ["all", "new", "in-progress", "resolved"]

/* ─── Atoms ──────────────────────────────────────────────────── */
function PriorityDot({ priority }: { priority: TicketPriority }) {
  const c = PRIORITY_CFG[priority]
  return (
    <span className="flex h-2 w-2 shrink-0 rounded-full"
      style={{ background: c.dot, boxShadow: `0 0 5px ${c.dot}` }} />
  )
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

/* ─── Ticket detail panel ────────────────────────────────────── */
interface DetailPanelProps {
  ticket: SupportTicket
  onUpdate: (updated: SupportTicket) => void
  onClose: () => void
}

function DetailPanel({ ticket, onUpdate, onClose }: DetailPanelProps) {
  const [note,    setNote]    = useState(ticket.adminNote ?? "")
  const [status,  setStatus]  = useState<TicketStatus>(ticket.status)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateTicket(ticket.id, { status, adminNote: note })
    const updated: SupportTicket = {
      ...ticket,
      status,
      adminNote: note,
      respondedAt: note !== ticket.adminNote ? new Date().toISOString() : ticket.respondedAt,
    }
    onUpdate(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleAdvance() {
    const next = STATUS_CFG[status].next
    if (next) setStatus(next)
  }

  const pCfg = PRIORITY_CFG[ticket.priority]
  const sCfg = STATUS_CFG[status]

  return (
    <div
      className="flex h-full flex-col overflow-y-auto"
      style={{
        background: "rgba(14,17,24,0.70)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex-1 pr-3">
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: pCfg.color }}>
              {pCfg.label}
            </span>
            <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.20)" }}>·</span>
            <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
              {relativeDate(ticket.createdAt)}
            </span>
          </div>
          <h3 className="font-display text-base font-extrabold leading-snug text-white">{ticket.subject}</h3>
          <p className="mt-1 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.38)" }}>
            {ticket.clientName}
          </p>
        </div>
        <button onClick={onClose}
          className="mt-0.5 shrink-0 rounded-lg p-1.5"
          style={{ color: "rgba(255,255,255,0.30)", background: "rgba(255,255,255,0.06)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-5 py-5">
        {/* Client message */}
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.25)" }}>
            Messaggio del cliente
          </p>
          <p className="font-display text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
            {ticket.message}
          </p>
        </div>

        {/* Status selector */}
        <div>
          <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>
            Stato Ticket
          </p>
          <div className="flex gap-2">
            {(["new", "in-progress", "resolved"] as TicketStatus[]).map(s => {
              const c = STATUS_CFG[s]
              const isActive = status === s
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="flex-1 rounded-xl py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wide transition-all"
                  style={{
                    background: isActive ? c.bg : "transparent",
                    border: `1px solid ${isActive ? c.border : "rgba(255,255,255,0.08)"}`,
                    color: isActive ? c.color : "rgba(255,255,255,0.28)",
                  }}
                >
                  {c.label}
                </button>
              )
            })}
          </div>

          {/* Advance shortcut */}
          {sCfg.next && (
            <button
              onClick={handleAdvance}
              className="mt-2.5 w-full rounded-xl py-2.5 font-display text-[12px] font-semibold transition-all"
              style={{ background: "rgba(176,74,56,0.07)", border: "1px solid rgba(176,74,56,0.18)", color: COPPER }}
            >
              → Avanza a "{STATUS_CFG[sCfg.next].label}"
            </button>
          )}
        </div>

        {/* Admin response note */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>
            Nota di risposta interna
          </p>
          <textarea
            className="w-full rounded-xl px-3.5 py-3 font-display text-[13px] leading-relaxed outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.80)",
              resize: "none",
            }}
            placeholder="Inserisci una nota per il team o la risposta da comunicare al cliente…"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={5}
            maxLength={1000}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(176,74,56,0.45)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.18)" }}>{note.length}/1000</span>
            {ticket.respondedAt && (
              <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                Ultima risposta: {relativeDate(ticket.respondedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl py-3 font-display text-[13px] font-bold text-white transition-all disabled:opacity-40"
          style={{
            background: saved
              ? "linear-gradient(135deg, rgba(16,185,129,0.70), rgba(16,185,129,0.55))"
              : "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))",
            border: `1px solid ${saved ? "rgba(16,185,129,0.50)" : "rgba(176,74,56,0.55)"}`,
          }}
        >
          {saving ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 animate-spin">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Salvataggio…
            </>
          ) : saved ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Salvato
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
              </svg>
              Salva & Aggiorna
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function SupportCenter() {
  const [tickets,         setTickets]         = useState<SupportTicket[]>([])
  const [loading,         setLoading]         = useState(true)
  const [statusFilter,    setStatusFilter]    = useState<TicketStatus | "all">("all")
  const [priorityFilter,  setPriorityFilter]  = useState<TicketPriority | "all">("all")
  const [selectedTicket,  setSelectedTicket]  = useState<SupportTicket | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchTickets().then(data => { setTickets(data); setLoading(false) })
  }, [])

  const filtered = tickets.filter(t =>
    (statusFilter   === "all" || t.status   === statusFilter) &&
    (priorityFilter === "all" || t.priority === priorityFilter)
  )

  const counts: Record<TicketStatus | "all", number> = {
    all:           tickets.length,
    new:           tickets.filter(t => t.status === "new").length,
    "in-progress": tickets.filter(t => t.status === "in-progress").length,
    resolved:      tickets.filter(t => t.status === "resolved").length,
  }

  function handleUpdate(updated: SupportTicket) {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
    setSelectedTicket(updated)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>Centro Supporto</p>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">Ticketing</h2>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter */}
        <div className="flex gap-1.5">
          {STATUSES.map(s => {
            const cfg = s !== "all" ? STATUS_CFG[s] : null
            const isActive = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wide transition-all"
                style={{
                  background: isActive ? (cfg ? cfg.bg : "rgba(255,255,255,0.07)") : "transparent",
                  border: `1px solid ${isActive ? (cfg ? cfg.border : "rgba(255,255,255,0.18)") : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? (cfg ? cfg.color : "#fff") : "rgba(255,255,255,0.30)",
                }}
              >
                {s === "all" ? "Tutti" : STATUS_CFG[s].label}
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full font-mono text-[9px]"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                  }}
                >
                  {counts[s]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Priority filter */}
        <div className="flex gap-1.5 ml-auto">
          <button
            onClick={() => setPriorityFilter("all")}
            className="rounded-lg px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-all"
            style={{
              background: priorityFilter === "all" ? "rgba(255,255,255,0.07)" : "transparent",
              border: `1px solid ${priorityFilter === "all" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)"}`,
              color: priorityFilter === "all" ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)",
            }}
          >
            Tutte le priorità
          </button>
          {PRIORITY_ORDER.map(p => {
            const c = PRIORITY_CFG[p]
            const isActive = priorityFilter === p
            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-all"
                style={{
                  background: isActive ? `${c.dot}18` : "transparent",
                  border: `1px solid ${isActive ? `${c.dot}45` : "rgba(255,255,255,0.07)"}`,
                  color: isActive ? c.color : "rgba(255,255,255,0.25)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Two-panel layout */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "rgba(22,27,34,0.60)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.09)",
          display: "grid",
          gridTemplateColumns: selectedTicket ? "1fr 400px" : "1fr",
          minHeight: "520px",
        }}
      >
        {/* Ticket list */}
        <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 640 }}>
          {/* List header */}
          <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.28)" }}>
              {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
            </span>
            {loading && (
              <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>Caricamento…</span>
            )}
          </div>

          {filtered.length === 0 && !loading ? (
            <div className="flex flex-1 items-center justify-center py-16 font-mono text-sm" style={{ color: "rgba(255,255,255,0.22)" }}>
              Nessun ticket trovato
            </div>
          ) : (
            filtered
              .sort((a, b) => {
                const pOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                const sOrder = { new: 0, "in-progress": 1, resolved: 2 }
                return sOrder[a.status] - sOrder[b.status] || pOrder[a.priority] - pOrder[b.priority]
              })
              .map((ticket, idx) => {
                const sCfg = STATUS_CFG[ticket.status]
                const pCfg = PRIORITY_CFG[ticket.priority]
                const isSelected = selectedTicket?.id === ticket.id
                return (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(isSelected ? null : ticket)}
                    className="flex w-full items-start gap-3.5 px-5 py-4 text-left transition-all"
                    style={{
                      borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      background: isSelected ? "rgba(176,74,56,0.08)" : undefined,
                      borderLeft: isSelected ? `3px solid ${COPPER}` : "3px solid transparent",
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)" }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "" }}
                  >
                    {/* Priority dot */}
                    <div className="mt-1 shrink-0">
                      <PriorityDot priority={ticket.priority} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-display text-[13px] font-semibold leading-snug text-white truncate">
                          {ticket.subject}
                        </p>
                        <StatusBadge status={ticket.status} />
                      </div>
                      <p className="line-clamp-2 font-mono text-[10px] leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] font-semibold" style={{ color: pCfg.color }}>
                          {pCfg.label}
                        </span>
                        <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.22)" }}>·</span>
                        <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {ticket.clientName}
                        </span>
                        <span className="ml-auto font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                          {relativeDate(ticket.createdAt)}
                        </span>
                      </div>
                      {ticket.adminNote && (
                        <div className="mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                          style={{ background: "rgba(176,74,56,0.07)", border: "1px solid rgba(176,74,56,0.15)" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke={COPPER} strokeWidth="2" className="h-3 w-3 shrink-0">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                          </svg>
                          <p className="truncate font-mono text-[9px]" style={{ color: "rgba(176,74,56,0.75)" }}>
                            {ticket.adminNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })
          )}
        </div>

        {/* Detail panel */}
        {selectedTicket && (
          <DetailPanel
            key={selectedTicket.id}
            ticket={selectedTicket}
            onUpdate={handleUpdate}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </div>
    </div>
  )
}
