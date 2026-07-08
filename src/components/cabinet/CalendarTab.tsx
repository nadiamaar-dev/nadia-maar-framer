import React, { useEffect, useState, useCallback } from "react"
import {
  fetchClientMeetings, proposeMeeting, updateMeetingStatus,
  type Meeting, type MeetingStatus,
} from "../../lib/adminApi"
import {
  useMeetingAvailability, toLocalDate, toSlotKey,
  SLOT_TIMES, isWeekend, isTodayOrFuture,
} from "../../hooks/useMeetingAvailability"
import { supabase, SUPABASE_READY } from "../../lib/supabase"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const COPPER  = "#B04A38"
const GREEN   = "#10B981"

/* ─── CSS ────────────────────────────────────────────────────── */
const STYLE_ID = "nm-cal-styles"
const CSS = `
.nm-cal-day {
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  border-radius: 9px; cursor: pointer;
  font-family: ${MONO}; font-size: 12px;
  border: 1px solid transparent;
  transition: all 0.14s ease;
  position: relative;
}
.nm-cal-day.available {
  color: rgba(255,255,255,0.80);
  background: rgba(255,255,255,0.05);
}
.nm-cal-day.available:hover {
  background: rgba(176,74,56,0.14);
  border-color: rgba(176,74,56,0.35);
  color: #D4695A;
}
.nm-cal-day.selected {
  background: rgba(176,74,56,0.20) !important;
  border-color: rgba(176,74,56,0.55) !important;
  color: #D4695A !important;
  font-weight: 700;
}
.nm-cal-day.today { font-weight: 700; }
.nm-cal-day.today::after {
  content: '';
  position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%);
  width: 4px; height: 4px; border-radius: 50%;
  background: ${COPPER};
}
.nm-cal-day.disabled {
  color: rgba(255,255,255,0.15); cursor: default;
}
.nm-cal-slot {
  padding: 8px 12px; border-radius: 8px; cursor: pointer;
  font-family: ${MONO}; font-size: 11px; font-weight: 600;
  border: 1px solid rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.60);
  background: rgba(255,255,255,0.04);
  transition: all 0.14s ease;
  text-align: center;
}
.nm-cal-slot:hover:not(.blocked):not(.selected-slot) {
  background: rgba(255,255,255,0.09);
  border-color: rgba(255,255,255,0.20);
  color: rgba(255,255,255,0.90);
}
.nm-cal-slot.selected-slot {
  background: rgba(176,74,56,0.18);
  border-color: rgba(176,74,56,0.45);
  color: #D4695A; font-weight: 700;
}
.nm-cal-slot.blocked {
  opacity: 0.25; cursor: not-allowed; text-decoration: line-through;
}
.nm-cal-submit {
  width: 100%; padding: 13px 20px;
  background: linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78));
  border: 1px solid rgba(176,74,56,0.55); border-radius: 10px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 14px; font-weight: 700; color: #fff;
  transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.nm-cal-submit:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(176,74,56,0.30); transform: translateY(-1px);
}
.nm-cal-submit:disabled { opacity: 0.40; cursor: default; }
@keyframes nm-fadeup { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.nm-cal-animate { animation: nm-fadeup 0.25s ease both; }
`

/* ─── Constants ──────────────────────────────────────────────── */
const IT_MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
                   "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"]
const IT_DAYS_SHORT = ["Lu","Ma","Me","Gi","Ve","Sa","Do"]

const STATUS_CFG: Record<MeetingStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "In Attesa",  color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.09)", border: "rgba(200,185,110,0.28)" },
  confirmed:   { label: "Confermato", color: GREEN,                    bg: "rgba(16,185,129,0.09)",  border: "rgba(16,185,129,0.28)" },
  cancelled:   { label: "Annullato",  color: "rgba(255,255,255,0.30)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
  rescheduled: { label: "Ripianificato", color: COPPER,               bg: "rgba(176,74,56,0.09)",  border: "rgba(176,74,56,0.25)" },
}

/* ─── Calendar grid helpers ──────────────────────────────────── */
function buildMonthGrid(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Mon=0 … Sun=6
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/* ─── Upcoming meetings card ─────────────────────────────────── */
function MeetingCard({
  meeting,
  onConfirm, onDecline,
}: {
  meeting: Meeting
  onConfirm: (m: Meeting) => void
  onDecline: (m: Meeting) => void
}) {
  const cfg = STATUS_CFG[meeting.status]
  const dt  = new Date(`${meeting.datetime}`)
  const dateLabel = dt.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
  const timeLabel = meeting.datetime.slice(11, 16)
  const isAdminProposal = meeting.proposedBy === "admin" && meeting.status === "pending"
  const isClientPending = meeting.proposedBy === "client" && meeting.status === "pending"
  const isFuture = new Date(meeting.datetime) > new Date()

  return (
    <div style={{
      background: "rgba(30,37,48,0.55)", backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Status stripe */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${cfg.color}70, transparent)` }} />

      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>
              {meeting.proposedBy === "admin" ? "Proposto dal team" : "Tua richiesta"} · {meeting.durationMin} min
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "#fff" }}>
              {dateLabel}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: cfg.color, marginTop: 2 }}>
              {timeLabel}
            </div>
          </div>
          <span style={{
            padding: "4px 12px", borderRadius: 99,
            fontFamily: MONO, fontSize: 10, fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase",
            color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
          }}>
            {cfg.label}
          </span>
        </div>

        {/* Note */}
        {(meeting.adminNote || meeting.clientNote) && (
          <p style={{ fontFamily: DISPLAY, fontSize: 12, color: "rgba(255,255,255,0.42)", margin: "0 0 14px", lineHeight: 1.6 }}>
            {meeting.adminNote || meeting.clientNote}
          </p>
        )}

        {/* Actions: admin proposed → client can confirm or decline */}
        {isAdminProposal && isFuture && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onConfirm(meeting)}
              style={{
                flex: 1, padding: "9px 16px",
                background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.35)",
                borderRadius: 8, cursor: "pointer",
                fontFamily: DISPLAY, fontSize: 12, fontWeight: 700, color: GREEN,
              }}
            >
              ✓ Conferma
            </button>
            <button
              onClick={() => onDecline(meeting)}
              style={{
                flex: 1, padding: "9px 16px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8, cursor: "pointer",
                fontFamily: DISPLAY, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.40)",
              }}
            >
              ✗ Proponi altro
            </button>
          </div>
        )}

        {/* Client's own pending proposal */}
        {isClientPending && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", background: "rgba(200,185,110,0.07)",
            border: "1px solid rgba(200,185,110,0.18)", borderRadius: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(200,185,110,0.90)", animation: "nm-pulse-dot 1.6s ease infinite" }} />
            <style>{`@keyframes nm-pulse-dot{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(200,185,110,0.80)" }}>
              In attesa di conferma dal team
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Props ──────────────────────────────────────────────────── */
export interface CalendarTabProps {
  clientId: string
}

/* ─── Main component ─────────────────────────────────────────── */
export default function CalendarTab({ clientId }: CalendarTabProps) {
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const [meetings,       setMeetings]       = useState<Meeting[]>([])
  const [meetsLoading,   setMeetsLoading]   = useState(true)

  const [selectedDate,   setSelectedDate]   = useState<string | null>(null)
  const [selectedTime,   setSelectedTime]   = useState<string | null>(null)
  const [note,           setNote]           = useState("")
  const [submitting,     setSubmitting]     = useState(false)
  const [submitSuccess,  setSubmitSuccess]  = useState(false)
  const [submitError,    setSubmitError]    = useState("")

  const [refreshKey, setRefreshKey] = useState(0)
  const { loading: avLoading, isBlocked, hasAvailableSlots, availableSlotsForDay } =
    useMeetingAvailability(refreshKey)

  /* Inject CSS */
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  /* Load client meetings */
  useEffect(() => {
    let cancelled = false
    setMeetsLoading(true)
    fetchClientMeetings(clientId)
      .then(data => { if (!cancelled) setMeetings(data) })
      .finally(() => { if (!cancelled) setMeetsLoading(false) })
    return () => { cancelled = true }
  }, [clientId, refreshKey])

  /* Realtime: admin proposals / confirmations land live + free-up slots.
     RLS scopes meetings to the authenticated client's own rows. */
  useEffect(() => {
    if (!SUPABASE_READY) return
    const ch = supabase
      .channel(`client-meetings-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, () => {
        setRefreshKey(k => k + 1)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [clientId])

  /* Month navigation */
  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null); setSelectedTime(null)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null); setSelectedTime(null)
  }

  const todayStr = toLocalDate(today)
  const grid = buildMonthGrid(viewYear, viewMonth)

  /* Submit booking */
  async function handleBook() {
    if (!selectedDate || !selectedTime) return
    setSubmitting(true); setSubmitError("")
    try {
      const meeting = await proposeMeeting({
        clientId,
        datetime: toSlotKey(selectedDate, selectedTime),
        clientNote: note.trim() || undefined,
      })
      setMeetings(prev => [...prev, meeting])
      setSelectedDate(null); setSelectedTime(null); setNote("")
      setSubmitSuccess(true)
      setRefreshKey(k => k + 1)
      setTimeout(() => setSubmitSuccess(false), 4000)
    } catch {
      setSubmitError("Errore durante la prenotazione. Riprova.")
    } finally {
      setSubmitting(false)
    }
  }

  /* Client confirms admin proposal */
  const handleConfirm = useCallback(async (m: Meeting) => {
    await updateMeetingStatus(m.id, "confirmed")
    setMeetings(prev => prev.map(x => x.id === m.id ? { ...x, status: "confirmed" } : x))
    setRefreshKey(k => k + 1)
  }, [])

  /* Client declines → cancelled, let them book again */
  const handleDecline = useCallback(async (m: Meeting) => {
    await updateMeetingStatus(m.id, "cancelled")
    setMeetings(prev => prev.map(x => x.id === m.id ? { ...x, status: "cancelled" } : x))
  }, [])

  const upcomingMeetings = meetings.filter(m =>
    m.status !== "cancelled" &&
    new Date(m.datetime) >= new Date(todayStr + "T00:00")
  )
  const slotsForDay = selectedDate ? availableSlotsForDay(selectedDate) : []

  return (
    <section>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: COPPER, marginBottom: 8 }}>
          Prenota una Chiamata
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          Calendario Appuntamenti
        </h2>
        <p style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "8px 0 0" }}>
          Slot disponibili da lunedì al venerdì, 9:00–18:00. Durata: 30 minuti.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

        {/* ── Left: Calendar ──────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Month navigator */}
          <div style={{
            background: "rgba(30,37,48,0.55)", backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "20px 22px",
          }}>
            {/* Nav row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <button onClick={prevMonth} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                color: "rgba(255,255,255,0.50)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "#fff" }}>
                {IT_MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                color: "rgba(255,255,255,0.50)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>

            {/* Day-of-week header */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {IT_DAYS_SHORT.map(d => (
                <div key={d} style={{
                  textAlign: "center", fontFamily: MONO, fontSize: 9,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)", padding: "4px 0",
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {grid.map((day, idx) => {
                if (!day) return <div key={`e${idx}`} />
                const dateStr = toDateStr(viewYear, viewMonth, day)
                const isPast    = dateStr < todayStr
                const isToday   = dateStr === todayStr
                const weekend   = isWeekend(dateStr)
                const avail     = !isPast && !weekend && hasAvailableSlots(dateStr)
                const isSelected = selectedDate === dateStr
                const disabled  = isPast || weekend || (!avail && !isToday)

                let cls = "nm-cal-day"
                if (isSelected) cls += " selected"
                else if (isToday) cls += " today available"
                else if (avail) cls += " available"
                else cls += " disabled"

                return (
                  <button
                    key={dateStr}
                    className={cls}
                    disabled={disabled && !avail}
                    onClick={() => {
                      if (!disabled || avail) {
                        setSelectedDate(dateStr)
                        setSelectedTime(null)
                      }
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { color: COPPER, label: "Selezionato" },
                { color: "rgba(255,255,255,0.60)", label: "Disponibile" },
                { color: "rgba(255,255,255,0.18)", label: "Non disponibile" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", color: "rgba(255,255,255,0.28)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time slot picker */}
          {selectedDate && (
            <div className="nm-cal-animate" style={{
              background: "rgba(30,37,48,0.55)", backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "20px 22px",
            }}>
              <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 14 }}>
                Orari disponibili — {new Date(`${selectedDate}T12:00`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
              </div>

              {avLoading ? (
                <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Caricamento disponibilità…</div>
              ) : slotsForDay.length === 0 ? (
                <div style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                  Nessuno slot disponibile in questa data. Scegli un altro giorno.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {SLOT_TIMES.map(time => {
                    const blocked = isBlocked(selectedDate, time) || !slotsForDay.includes(time)
                    const isSelected = selectedTime === time
                    return (
                      <button
                        key={time}
                        className={`nm-cal-slot ${blocked ? "blocked" : ""} ${isSelected ? "selected-slot" : ""}`}
                        disabled={blocked}
                        onClick={() => setSelectedTime(isSelected ? null : time)}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Booking form */}
              {selectedTime && (
                <div className="nm-cal-animate" style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 10 }}>
                    Nota per il team (opzionale)
                  </div>
                  <textarea
                    style={{
                      width: "100%", padding: "11px 14px", marginBottom: 12,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: 9, outline: "none", resize: "none",
                      fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.80)",
                      boxSizing: "border-box",
                    }}
                    placeholder="Di cosa vuoi discutere? (facoltativo)"
                    rows={2}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    maxLength={300}
                  />
                  {submitError && (
                    <div style={{ marginBottom: 10, fontFamily: DISPLAY, fontSize: 12, color: "rgba(224,80,80,0.80)" }}>
                      {submitError}
                    </div>
                  )}
                  <button className="nm-cal-submit" onClick={handleBook} disabled={submitting}>
                    {submitting ? "Invio in corso…" : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
                        </svg>
                        Conferma — {selectedDate.split("-").reverse().join("/")} alle {selectedTime}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success toast */}
          {submitSuccess && (
            <div className="nm-cal-animate" style={{
              padding: "14px 18px",
              background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.28)",
              borderRadius: 12, display: "flex", alignItems: "center", gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontFamily: DISPLAY, fontSize: 13, color: GREEN }}>
                Richiesta inviata. Il team ti confermerà l'appuntamento entro 24 ore.
              </span>
            </div>
          )}
        </div>

        {/* ── Right: Upcoming meetings ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
            Prossimi Appuntamenti
          </div>

          {meetsLoading ? (
            <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.22)" }}>Caricamento…</div>
          ) : upcomingMeetings.length === 0 ? (
            <div style={{
              padding: "20px 18px", textAlign: "center",
              background: "rgba(30,37,48,0.40)", border: "1px dashed rgba(255,255,255,0.08)",
              borderRadius: 14, fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.28)",
            }}>
              Nessun appuntamento pianificato
            </div>
          ) : (
            upcomingMeetings.map(m => (
              <MeetingCard key={m.id} meeting={m} onConfirm={handleConfirm} onDecline={handleDecline} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
