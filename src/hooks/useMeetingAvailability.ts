/**
 * useMeetingAvailability
 *
 * Fetches ALL confirmed meeting slots (from every client, via the
 * Supabase RPC get_confirmed_meeting_slots which bypasses RLS) and
 * exposes helpers to check slot availability in the calendar.
 *
 * The hook refreshes when `refreshKey` changes — pass a counter that
 * increments after a successful booking to update the calendar.
 */
import { useState, useEffect, useCallback } from "react"
import { fetchConfirmedSlots } from "../lib/api"

/* ─── Time slot configuration ────────────────────────────────── */
export const SLOT_TIMES: string[] = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  // 12:00–12:30 skipped (lunch)
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
]

/** Returns "YYYY-MM-DD" for a given Date object using local time. */
export function toLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Combines a "YYYY-MM-DD" date string and "HH:mm" time string into the
 *  canonical slot key used throughout the availability system. */
export function toSlotKey(date: string, time: string): string {
  return `${date}T${time}`
}

/** Returns true if `date` is a Saturday (6) or Sunday (0). */
export function isWeekend(dateStr: string): boolean {
  const dow = new Date(`${dateStr}T12:00`).getDay()
  return dow === 0 || dow === 6
}

/** Returns true if `dateStr` is today or in the future (ignoring time). */
export function isTodayOrFuture(dateStr: string): boolean {
  const today = toLocalDate(new Date())
  return dateStr >= today
}

/** Returns true if a specific slot datetime is in the future (slot hasn't passed). */
export function isSlotInFuture(dateStr: string, time: string): boolean {
  const slotMs = new Date(`${dateStr}T${time}`).getTime()
  return slotMs > Date.now() + 30 * 60_000 // at least 30 min from now
}

/* ─── Hook ───────────────────────────────────────────────────── */
export interface UseMeetingAvailability {
  /** True while fetching confirmed slots from Supabase/mock. */
  loading: boolean
  /** Call to manually refresh (e.g. after a new booking). */
  refetch: () => void
  /** True if the slot is confirmed for ANY client (globally blocked). */
  isBlocked: (date: string, time: string) => boolean
  /** True if day has at least one non-blocked, non-past slot. */
  hasAvailableSlots: (date: string) => boolean
  /** All available times for a given day. */
  availableSlotsForDay: (date: string) => string[]
}

export function useMeetingAvailability(refreshKey = 0): UseMeetingAvailability {
  const [blocked,  setBlocked]  = useState<Set<string>>(new Set())
  const [loading,  setLoading]  = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const slots = await fetchConfirmedSlots()
      setBlocked(slots)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load, refreshKey])

  const isBlocked = useCallback(
    (date: string, time: string) => blocked.has(toSlotKey(date, time)),
    [blocked],
  )

  const availableSlotsForDay = useCallback(
    (date: string): string[] => {
      if (isWeekend(date) || !isTodayOrFuture(date)) return []
      return SLOT_TIMES.filter(
        t => !isBlocked(date, t) && isSlotInFuture(date, t),
      )
    },
    [isBlocked],
  )

  const hasAvailableSlots = useCallback(
    (date: string): boolean => availableSlotsForDay(date).length > 0,
    [availableSlotsForDay],
  )

  return { loading, refetch: load, isBlocked, hasAvailableSlots, availableSlotsForDay }
}
