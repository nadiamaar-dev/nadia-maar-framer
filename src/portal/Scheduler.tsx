import React, { useMemo, useState } from "react"
import {
  isTodayOrFuture, isWeekend, toLocalDate, toSlotKey, useMeetingAvailability,
} from "../hooks/useMeetingAvailability"
import { DISPLAY, Icon, MONO, Spinner, T } from "./ui"

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]
const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
]

/** Controlled month-grid slot picker. `value` is a "YYYY-MM-DDTHH:mm" slot key or null. */
export default function Scheduler({ value, onChange, refreshKey = 0 }: {
  value: string | null
  onChange: (v: string | null) => void
  refreshKey?: number
}) {
  const { loading, hasAvailableSlots, availableSlotsForDay } = useMeetingAvailability(refreshKey)
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const selDate = value ? value.slice(0, 10) : null
  const selTime = value ? value.slice(11, 16) : null
  const [openDay, setOpenDay] = useState<string | null>(selDate)

  const atCurrentMonth = cursor.y === today.getFullYear() && cursor.m === today.getMonth()

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1)
    const lead = (first.getDay() + 6) % 7 // Monday-first offset
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
    const out: (string | null)[] = Array.from({ length: lead }, () => null)
    for (let d = 1; d <= days; d++) out.push(toLocalDate(new Date(cursor.y, cursor.m, d)))
    return out
  }, [cursor])

  const dayTimes = openDay ? availableSlotsForDay(openDay) : []

  function nav(dir: 1 | -1) {
    if (dir === -1 && atCurrentMonth) return
    setCursor(c => {
      const m = c.m + dir
      return m < 0 ? { y: c.y - 1, m: 11 } : m > 11 ? { y: c.y + 1, m: 0 } : { ...c, m }
    })
  }

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button
          type="button"
          className="portal-nav-item"
          onClick={() => nav(-1)}
          disabled={atCurrentMonth}
          style={{
            width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.03)",
            color: atCurrentMonth ? T.ghost : T.faint, cursor: atCurrentMonth ? "default" : "pointer",
            opacity: atCurrentMonth ? 0.4 : 1,
          }}
        >
          <Icon name="arrowL" size={13} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 800, color: T.text }}>
            {MONTHS[cursor.m]} {cursor.y}
          </span>
          {loading && <Spinner size={13} />}
        </div>
        <button
          type="button"
          className="portal-nav-item"
          onClick={() => nav(1)}
          style={{
            width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.03)", color: T.faint, cursor: "pointer",
          }}
        >
          <Icon name="arrowR" size={13} />
        </button>
      </div>

      {/* Weekday header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ghost, padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`x${i}`} />
          const disabled = isWeekend(date) || !isTodayOrFuture(date) || (!loading && !hasAvailableSlots(date))
          const isOpen = openDay === date
          const isSelDay = selDate === date
          const isToday = date === toLocalDate(today)
          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              onClick={() => setOpenDay(isOpen ? null : date)}
              className={disabled ? undefined : "portal-nav-item"}
              style={{
                aspectRatio: "1 / 0.82", borderRadius: 9,
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                background: isSelDay
                  ? "linear-gradient(140deg, rgba(161,44,56,0.34), rgba(161,44,56,0.18))"
                  : isOpen ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${isSelDay ? "rgba(161,44,56,0.55)" : isOpen ? T.borderHi : T.border}`,
                boxShadow: isSelDay || isOpen ? "inset 0 1px 0 rgba(255,255,255,0.16)" : "none",
                color: disabled ? T.ghost : isSelDay ? T.copperLt : T.muted,
                fontFamily: MONO, fontSize: 11.5, fontWeight: isSelDay ? 700 : 500,
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.35 : 1,
              }}
            >
              {Number(date.slice(8, 10))}
              {isToday && !isSelDay && (
                <span style={{ position: "absolute", bottom: 4, width: 3.5, height: 3.5, borderRadius: 99, background: T.copperLt }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Time chips for the open day */}
      {openDay && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: T.ghost, margin: "0 0 9px" }}>
            Orari · {new Date(`${openDay}T12:00`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {dayTimes.length === 0 ? (
            <p style={{ fontFamily: DISPLAY, fontSize: 12, color: T.faint, margin: 0 }}>Nessun orario disponibile.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {dayTimes.map(t => {
                const key = toSlotKey(openDay, t)
                const sel = value === key && selTime === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange(sel ? null : key)}
                    className={sel ? undefined : "portal-nav-item"}
                    style={{
                      padding: "6px 11px", borderRadius: 8,
                      background: sel ? "linear-gradient(140deg, rgba(161,44,56,0.38), rgba(161,44,56,0.20))" : "rgba(255,255,255,0.035)",
                      border: `1px solid ${sel ? "rgba(161,44,56,0.60)" : T.border}`,
                      boxShadow: sel ? "inset 0 1px 0 rgba(255,255,255,0.18)" : "none",
                      color: sel ? "#FFE9E3" : T.muted,
                      fontFamily: MONO, fontSize: 11, fontWeight: sel ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
