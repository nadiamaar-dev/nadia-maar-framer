import React, { createContext, useCallback, useContext, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration: number
}

interface ToastContextValue {
  toast: (opts: { type?: ToastType; title?: string; message: string; duration?: number }) => void
  success: (message: string, title?: string) => void
  error:   (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info:    (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>")
  return ctx
}

/* ─── Visual config ─────────────────────────────────────────── */
const TYPE_CFG: Record<ToastType, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    color: "#10B981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.28)",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>,
  },
  error: {
    color: "#E05050", bg: "rgba(224,80,80,0.10)", border: "rgba(224,80,80,0.28)",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>,
  },
  warning: {
    color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.10)", border: "rgba(200,185,110,0.28)",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  info: {
    color: "#B04A38", bg: "rgba(176,74,56,0.10)", border: "rgba(176,74,56,0.28)",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
  },
}

/* ─── Single toast ──────────────────────────────────────────── */
function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const cfg = TYPE_CFG[item.type]

  React.useEffect(() => {
    const t = setTimeout(() => onDismiss(item.id), item.duration)
    return () => clearTimeout(t)
  }, [item.id, item.duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      style={{
        display: "flex", gap: 12, alignItems: "flex-start",
        padding: "14px 16px",
        background: "rgba(14,17,24,0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        minWidth: 280, maxWidth: 360,
        cursor: "pointer",
      }}
      onClick={() => onDismiss(item.id)}
    >
      <span style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}>
        {cfg.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.title && (
          <div style={{
            fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
            fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2,
          }}>
            {item.title}
          </div>
        )}
        <div style={{
          fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
          fontSize: 12, color: "rgba(255,255,255,0.60)", lineHeight: 1.5,
        }}>
          {item.message}
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDismiss(item.id) }}
        style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </motion.div>
  )
}

/* ─── Provider ──────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback(({ type = "info", title, message, duration = 4500 }: {
    type?: ToastType; title?: string; message: string; duration?: number
  }) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [{ id, type, title, message, duration }, ...prev.slice(0, 4)])
  }, [])

  const ctx: ToastContextValue = {
    toast,
    success: (m, t) => toast({ type: "success", message: m, title: t }),
    error:   (m, t) => toast({ type: "error",   message: m, title: t }),
    warning: (m, t) => toast({ type: "warning", message: m, title: t }),
    info:    (m, t) => toast({ type: "info",    message: m, title: t }),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Fixed container — top-right */}
      <div style={{
        position: "fixed", top: 20, right: 20, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10,
        pointerEvents: "none",
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map(item => (
            <div key={item.id} style={{ pointerEvents: "auto" }}>
              <ToastCard item={item} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
