import React, { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { relativeDate } from "../lib/api"
import type {
  ApprovalState, ClientPlan, ClientStatus, ConversationStatus, EventType, InvoiceStatus,
  MeetingStatus, ProjectBrief, ProjectEvent, ProjectStatus, StageStatus, TicketPriority, TicketStatus,
} from "../lib/api"

/* ══════════════════════════════════════════════════════════════
   GRAPHITE STUDIO — portal design tokens
   Graphite base · frosted silver glass · sparse copper ember
══════════════════════════════════════════════════════════════ */

export const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
export const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"
export const BODY = "'Plus Jakarta Sans', system-ui, sans-serif"

/* ── Card content (dark glass surfaces) ── */
export const T = {
  bg: "#233D4D",
  bgRaised: "#1E3442",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(255,255,255,0.15)",
  text: "#EEF2F7",
  muted: "rgba(255,255,255,0.72)",
  faint: "rgba(255,255,255,0.48)",
  ghost: "rgba(255,255,255,0.28)",
  copper: "#A12C38",
  copperLt: "#A83040",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#F87171",
  silver: "rgba(255,255,255,0.60)",
} as const

/* ── Chrome (dark petrol sidebar / header) ── */
export const TL = {
  text: "#F1F5F9",
  muted: "rgba(255,255,255,0.72)",
  faint: "rgba(255,255,255,0.50)",
  ghost: "rgba(255,255,255,0.34)",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(255,255,255,0.15)",
} as const

export type Tone = "copper" | "green" | "amber" | "red" | "silver" | "steel"

export const TONE: Record<Tone, { fg: string; bg: string; bd: string }> = {
  copper: { fg: "#A12C38", bg: "rgba(161,44,56,0.09)", bd: "rgba(161,44,56,0.20)" },
  green:  { fg: "#10B981", bg: "rgba(16,185,129,0.15)", bd: "rgba(16,185,129,0.34)" },
  amber:  { fg: "#F59E0B", bg: "rgba(245,158,11,0.14)", bd: "rgba(245,158,11,0.32)" },
  red:    { fg: "#F87171", bg: "rgba(248,113,113,0.14)", bd: "rgba(248,113,113,0.32)" },
  silver: { fg: "rgba(255,255,255,0.68)", bg: "rgba(255,255,255,0.09)", bd: "rgba(255,255,255,0.20)" },
  steel:  { fg: "rgba(255,255,255,0.44)", bg: "rgba(255,255,255,0.05)", bd: "rgba(255,255,255,0.11)" },
}

/* ── Modal overlay backdrop ── */
const GLASS_BLUR = "blur(32px) brightness(0.92) saturate(1.20)"

/* ── GLASS CARD SYSTEM ─────────────────────────────────────────
   panel / accent → exact DiagnosiCard 3-layer technique:
     1. glass bg overlay: rgba(255,255,255,0.008) + blur(6px) brightness(1.03)
        with mask-image fade black→transparent from 40% to 85%
     2. gradient border overlay: white (panel) or crimson (accent) top
        using WebkitMask xor trick, padding:1
     3. content: position:relative zIndex:3
   raised / outline → simple solid surfaces (modals, secondary)
   ─────────────────────────────────────────────────────────── */
export const GLASS: Record<"panel" | "raised" | "outline" | "accent", React.CSSProperties> = {
  panel: {
    background: "rgba(255,255,255,0.008)",
    backdropFilter: "blur(6px) brightness(1.03)",
    WebkitBackdropFilter: "blur(6px) brightness(1.03)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
  },
  raised: {
    background: "rgba(8,14,24,0.94)",
    border: "1px solid rgba(255,255,255,0.13)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 20px 60px rgba(0,0,0,0.65)",
    backdropFilter: "blur(24px) brightness(1.01)",
    WebkitBackdropFilter: "blur(24px) brightness(1.01)",
  },
  outline: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    boxShadow: "none",
  },
  accent: {
    background: "rgba(255,255,255,0.008)",
    backdropFilter: "blur(6px) brightness(1.03)",
    WebkitBackdropFilter: "blur(6px) brightness(1.03)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
  },
}

export function Glass({
  variant = "panel", hover = false, className = "", style, children, onClick,
}: {
  variant?: keyof typeof GLASS
  hover?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  onClick?: () => void
}) {
  /* raised / outline — unchanged simple surface */
  if (variant === "raised" || variant === "outline") {
    return (
      <div
        onClick={onClick}
        className={`rounded-2xl ${hover ? "portal-glass-hover" : ""} ${className}`}
        style={{ ...GLASS[variant], ...style }}
      >
        {children}
      </div>
    )
  }

  /* panel / accent — DiagnosiCard 3-layer technique */
  const v = GLASS[variant]
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${hover ? "portal-glass-hover" : ""} ${className}`}
      style={{ position: "relative", overflow: "hidden", boxShadow: v.boxShadow }}
    >
      {/* Layer 1 — glass bg + blur + mask fade (black 40% → transparent 85%) */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "rgba(255,255,255,0.008)",
        backdropFilter: "blur(6px) brightness(1.03)",
        WebkitBackdropFilter: "blur(6px) brightness(1.03)",
        WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 85%)",
        maskImage: "linear-gradient(to bottom, black 40%, transparent 85%)",
        pointerEvents: "none",
      }} />
      {/* Layer 2 — gradient border via mask xor, padding:1 */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, borderRadius: "inherit", padding: 1,
        background: variant === "accent"
          ? "linear-gradient(to bottom, rgba(161,44,56,0.60) 0%, rgba(255,255,255,0.05) 3px, transparent 50%)"
          : "linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, transparent 52%)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        pointerEvents: "none", zIndex: 1,
      }} />
      {/* Layer 3 — content above overlays, all layout styles go here */}
      <div style={{ position: "relative", zIndex: 2, ...style }}>
        {children}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ICONS — single stroke set, 24 viewBox
══════════════════════════════════════════════════════════════ */

const P: Record<string, React.ReactNode> = {
  home: <><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h5v-6h4v6h5V9.5" /></>,
  folder: <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />,
  layers: <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  invoice: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></>,
  euro: <><circle cx="12" cy="12" r="10" /><path d="M15.5 8.5A4.5 4.5 0 008 12a4.5 4.5 0 007.5 3.5M6.5 10.5h6M6.5 13.5h6" /></>,
  users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
  ticket: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
  check: <path d="M20 6L9 17l-5-5" />,
  checkCircle: <><circle cx="12" cy="12" r="10" /><path d="M16 9l-5.5 6L8 12.5" /></>,
  x: <path d="M18 6L6 18M6 6l12 12" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrowR: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowL: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevronR: <path d="M9 6l6 6-6 6" />,
  chevronD: <path d="M6 9l6 6 6-6" />,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  paperclip: <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />,
  download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></>,
  trash: <><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" /></>,
  edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  warn: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>,
  bolt: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  doc: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></>,
  bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>,
  external: <><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><path d="M15 3h6v6M10 14L21 3" /></>,
  pause: <path d="M10 4H6v16h4V4zM18 4h-4v16h4V4z" />,
  play: <path d="M5 3l14 9-14 9V3z" />,
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22v-7" /></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  menu: <path d="M3 12h18M3 6h18M3 18h18" />,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>,
  phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></>,
  sparkle: <path d="M12 3l1.9 5.7L19.5 10l-5.6 1.3L12 17l-1.9-5.7L4.5 10l5.6-1.3L12 3z" />,
} as const

export type IconName = keyof typeof P

export function Icon({ name, size = 16, strokeWidth = 1.8, style, className }: {
  name: IconName
  size?: number
  strokeWidth?: number
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      width={size} height={size} style={{ flexShrink: 0, ...style }} className={className}
    >
      {P[name]}
    </svg>
  )
}

/** The site's "NM" monogram (from NadiaMaar_Framer › NMmark), static + solid. */
export function PortalLogo({ size = 34, id = "nm-portal" }: { size?: number; id?: string }) {
  return (
    <svg viewBox="0 2 28 22" width={size} height={Math.round(size * 22 / 28)} fill="none"
      strokeLinecap="square" strokeLinejoin="miter" aria-hidden style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="2" y1="12" x2="27" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
          <stop offset="46%" stopColor="rgba(255,255,255,0.92)" />
          <stop offset="58%" stopColor="#AE5350" />
          <stop offset="100%" stopColor="#733635" />
        </linearGradient>
      </defs>
      <path d="M 2,22 L 2,2 L 13,22 L 13,2 L 19.5,12 L 26,2 L 26,22" stroke={`url(#${id})`} strokeWidth="2" />
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════════════════ */

type BtnVariant = "primary" | "ghost" | "outline" | "danger" | "copper"
type BtnSize = "sm" | "md"

function btnBase(size: BtnSize): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: size === "sm" ? 6 : 8,
    borderRadius: size === "sm" ? 9 : 11,
    padding: size === "sm" ? "7px 13px" : "10px 18px",
    fontFamily: DISPLAY, fontWeight: 700,
    fontSize: size === "sm" ? 13 : 14,
    letterSpacing: "0.01em",
  }
}

const BTN_VARIANTS: Record<BtnVariant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(90deg, rgba(161,44,56,0.34) 0%, rgba(161,44,56,0.20) 100%)",
    border: "1px solid rgba(161,44,56,0.80)",
    color: "#FFFFFF",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 0 12px rgba(161,44,56,0.20), inset 0 1px 0 rgba(255,255,255,0.12)",
  },
  ghost: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.82)",
  },
  outline: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "rgba(255,255,255,0.80)",
  },
  danger: {
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.30)",
    color: "#FCA5A5",
  },
  copper: {
    background: "rgba(161,44,56,0.60)",
    border: "1px solid rgba(161,44,56,0.80)",
    color: "#fff",
  },
}

function BtnSpinner() {
  return (
    <span style={{
      width: 13, height: 13, borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "currentColor",
      animation: "portal-spin 0.7s linear infinite",
    }} />
  )
}

export function Btn({
  variant = "ghost", size = "md", busy = false, icon, children, className = "", style, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant
  size?: BtnSize
  busy?: boolean
  icon?: IconName
}) {
  return (
    <button
      className={`portal-btn portal-btn-${variant} ${className}`}
      style={{ ...btnBase(size), ...BTN_VARIANTS[variant], ...style }}
      disabled={busy || rest.disabled}
      {...rest}
    >
      {busy ? <BtnSpinner /> : icon && <Icon name={icon} size={size === "sm" ? 13 : 15} />}
      {children}
    </button>
  )
}

/**
 * File-picker button rendered as a <label> wrapping its own <input type="file">:
 * label activation opens the picker natively, without the programmatic
 * input.click() that Safari gesture-gates and can silently ignore.
 */
export function FileBtn({
  variant = "ghost", size = "md", busy = false, icon, multiple = true, accept, onFiles, title, style, children,
}: {
  variant?: BtnVariant
  size?: BtnSize
  busy?: boolean
  icon?: IconName
  multiple?: boolean
  accept?: string
  onFiles: (files: File[]) => void
  title?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  return (
    <label
      className={`portal-btn portal-btn-${variant}`}
      title={title}
      style={{
        ...btnBase(size), ...BTN_VARIANTS[variant],
        cursor: busy ? "not-allowed" : "pointer",
        opacity: busy ? 0.45 : undefined,
        pointerEvents: busy ? "none" : undefined,
        position: "relative", overflow: "hidden",
        ...style,
      }}
    >
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        disabled={busy}
        tabIndex={-1}
        onChange={e => {
          const files = Array.from(e.currentTarget.files ?? [])
          e.currentTarget.value = ""
          if (files.length) onFiles(files)
        }}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />
      {busy ? <BtnSpinner /> : icon && <Icon name={icon} size={size === "sm" ? 13 : 15} />}
      {children}
    </label>
  )
}

export function Badge({ tone = "steel", children, dot = false }: {
  tone?: Tone
  children: React.ReactNode
  dot?: boolean
}) {
  const t = TONE[tone]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px", borderRadius: 99,
      background: t.bg, border: `1px solid ${t.bd}`, color: t.fg,
      fontFamily: MONO, fontSize: 10, fontWeight: 600,
      letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.fg }} />}
      {children}
    </span>
  )
}

export function Kicker({ children, tone = "copper" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <p style={{
      fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.24em", textTransform: "uppercase",
      color: TONE[tone].fg, margin: 0,
    }}>
      {children}
    </p>
  )
}

export function SectionTitle({ kicker, title, sub, right }: {
  kicker?: string
  title: string
  sub?: string
  right?: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div>
        {kicker && <div style={{ marginBottom: 8 }}><Kicker>{kicker}</Kicker></div>}
        <h2 style={{ fontFamily: DISPLAY, fontSize: 25, fontWeight: 800, letterSpacing: "-0.02em", color: TL.text, margin: 0, lineHeight: 1.15 }}>
          {title}
        </h2>
        {sub && <p style={{ fontFamily: DISPLAY, fontSize: 15, color: TL.muted, margin: "7px 0 0", lineHeight: 1.5 }}>{sub}</p>}
      </div>
      {right && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{right}</div>}
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{
        display: "block", marginBottom: 8,
        fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase",
        color: T.faint,
      }}>
        {label}
      </span>
      {children}
      {hint && <span style={{ display: "block", marginTop: 7, fontFamily: DISPLAY, fontSize: 13, color: T.ghost, lineHeight: 1.5 }}>{hint}</span>}
    </label>
  )
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) { return <input ref={ref} {...props} className={`portal-input ${props.className ?? ""}`} /> },
)

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`portal-input ${props.className ?? ""}`} style={{ cursor: "pointer", ...props.style }} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`portal-input ${props.className ?? ""}`} style={{ resize: "vertical", minHeight: 88, lineHeight: 1.55, ...props.style }} />
}

export function Tabs<Id extends string>({ items, value, onChange }: {
  items: { id: Id; label: string; badge?: number }[]
  value: Id
  onChange: (id: Id) => void
}) {
  return (
    <div style={{
      display: "inline-flex", gap: 3, padding: 4, borderRadius: 13,
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
      maxWidth: "100%", overflowX: "auto",
    }}>
      {items.map(it => {
        const active = it.id === value
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={`portal-btn portal-pill ${active ? "is-active" : ""}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 18px", borderRadius: 9, border: "1px solid transparent",
              background: active ? "rgba(255,255,255,0.14)" : "transparent",
              borderColor: active ? "rgba(255,255,255,0.20)" : "transparent",
              boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.28), 0 1px 3px rgba(0,0,0,0.18)" : "none",
              color: active ? TL.text : TL.faint,
              fontFamily: DISPLAY, fontSize: 14, fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
            }}
          >
            {it.label}
            {(it.badge ?? 0) > 0 && (
              <span style={{
                minWidth: 16, height: 16, padding: "0 4px", borderRadius: 99,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "rgba(174,83,80,0.85)", color: "#fff",
                fontFamily: MONO, fontSize: 9, fontWeight: 700,
              }}>
                {it.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Modal({ open, onClose, title, kicker, width = 520, children, footer }: {
  open: boolean
  onClose: () => void
  title: string
  kicker?: string
  width?: number
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.20 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 90,
            background: "rgba(8,18,28,0.74)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: width, maxHeight: "88vh",
              display: "flex", flexDirection: "column",
              borderRadius: 20, overflow: "hidden",
              position: "relative",
              background: "rgba(255,255,255,0.008)",
              backdropFilter: "blur(6px) brightness(1.03)",
              WebkitBackdropFilter: "blur(6px) brightness(1.03)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.55), 0 40px 100px rgba(0,0,0,0.60)",
            }}
          >
            {/* DiagnosiCard gradient top border */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, borderRadius: "inherit", padding: 1,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.38) 0%, transparent 40%)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor", maskComposite: "exclude",
              pointerEvents: "none", zIndex: 10,
            }} />

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              flexShrink: 0, position: "relative", zIndex: 2,
            }}>
              <div>
                {kicker && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 8, fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.28)" }}>
                    <span style={{ color: "rgba(161,44,56,0.50)" }}>//</span>
                    <span>[ {kicker} ]</span>
                  </div>
                )}
                <h3 style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 800, color: TL.text, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="portal-btn portal-btn-ghost"
                style={{
                  width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: TL.muted,
                  flexShrink: 0, transition: "background 0.18s, border-color 0.18s, color 0.18s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(161,44,56,0.14)"; el.style.borderColor = "rgba(161,44,56,0.45)"; el.style.color = "#fff" }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(255,255,255,0.10)"; el.style.color = TL.muted }}
              >
                <Icon name="x" size={14} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "22px 24px", overflowY: "auto", position: "relative", zIndex: 2 }}>{children}</div>

            {/* Footer */}
            {footer && (
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 10,
                padding: "14px 24px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0, position: "relative", zIndex: 2,
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Bar({ value, tone = "copper", height = 5 }: { value: number; tone?: Tone; height?: number }) {
  const t = TONE[tone]
  return (
    <div style={{ height, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", borderRadius: 99,
        background: `linear-gradient(90deg, ${t.fg}AA, ${t.fg})`,
        boxShadow: `0 0 10px ${t.bg}`,
        transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
      }} />
    </div>
  )
}

export function Ring({ value, size = 46, stroke = 4, tone = "copper" }: {
  value: number
  size?: number
  stroke?: number
  tone?: Tone
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={TONE[tone].fg} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <span style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: MONO, fontSize: size >= 44 ? 10 : 8.5, fontWeight: 600, color: T.muted,
      }}>
        {Math.round(pct)}%
      </span>
    </div>
  )
}

export function Stat({ label, value, hint, icon, tone = "silver" }: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: IconName
  tone?: Tone
}) {
  const t = TONE[tone]
  return (
    <Glass variant="panel" style={{
      padding: "18px 20px 16px",
      display: "flex", flexDirection: "column", gap: 11,
      borderTop: `2px solid ${t.fg}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.20em", textTransform: "uppercase", color: T.faint }}>
          {label}
        </span>
        {icon && (
          <span style={{
            width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            color: t.fg,
          }}>
            <Icon name={icon} size={15} />
          </span>
        )}
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", color: T.text, lineHeight: 1 }}>
        {value}
      </div>
      {hint && <div style={{ fontFamily: DISPLAY, fontSize: 12.5, color: t.fg, opacity: 0.75 }}>{hint}</div>}
    </Glass>
  )
}

export function Empty({ icon = "sparkle", title, hint, action }: {
  icon?: IconName
  title: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      padding: "52px 24px", textAlign: "center",
      border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 16,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 14, marginBottom: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.faint,
      }}>
        <Icon name={icon} size={20} strokeWidth={1.5} />
      </div>
      <p style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, color: T.muted, margin: 0 }}>{title}</p>
      {hint && <p style={{ fontFamily: DISPLAY, fontSize: 14, color: T.faint, margin: "4px 0 0", maxWidth: 380, lineHeight: 1.6 }}>{hint}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function Avatar({ name, size = 30, tone = "copper" }: { name: string; size?: number; tone?: Tone }) {
  const t = TONE[tone]
  const initials = name
    .split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "?"
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: t.bg, border: `1px solid ${t.bd}`, color: t.fg,
      fontFamily: MONO, fontSize: size * 0.34, fontWeight: 700, letterSpacing: "0.02em",
    }}>
      {initials}
    </span>
  )
}

export function Spinner({ size = 26 }: { size?: number }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      border: "2px solid rgba(174,83,80,0.22)", borderTopColor: T.copper,
      animation: "portal-spin 0.75s linear infinite",
    }} />
  )
}

export function Loading({ label = "Caricamento" }: { label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 13, padding: "64px 0" }}>
      <Spinner />
      <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: TL.ghost }}>
        {label}…
      </span>
    </div>
  )
}

export function Note({ tone = "silver", children }: { tone?: Tone; children: React.ReactNode }) {
  const t = TONE[tone]
  return (
    <div style={{
      display: "flex", gap: 9, alignItems: "flex-start",
      padding: "12px 15px", borderRadius: 11,
      background: t.bg, border: `1px solid ${t.bd}`,
      fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.55, color: t.fg,
    }}>
      <Icon name={tone === "red" || tone === "amber" ? "warn" : "sparkle"} size={15} style={{ marginTop: 1 }} />
      <span>{children}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   DOMAIN VOCABULARY — one source of truth for both portals
══════════════════════════════════════════════════════════════ */

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: Tone }> = {
  pending_approval: { label: "In valutazione", tone: "amber" },
  active: { label: "In corso", tone: "green" },
  paused: { label: "In pausa", tone: "silver" },
  completed: { label: "Completato", tone: "copper" },
}

export const STAGE_STATUS: Record<StageStatus, { label: string; tone: Tone }> = {
  locked: { label: "In coda", tone: "steel" },
  active: { label: "In corso", tone: "green" },
  done: { label: "Chiusa", tone: "silver" },
}

export const APPROVAL_STATE: Record<ApprovalState, { label: string; tone: Tone }> = {
  none: { label: "—", tone: "steel" },
  requested: { label: "Da approvare", tone: "amber" },
  approved: { label: "Approvata", tone: "green" },
  changes_requested: { label: "Modifiche richieste", tone: "red" },
}

export const MEETING_STATUS: Record<MeetingStatus, { label: string; tone: Tone }> = {
  pending: { label: "In attesa", tone: "amber" },
  confirmed: { label: "Confermata", tone: "green" },
  cancelled: { label: "Annullata", tone: "red" },
  rescheduled: { label: "Riprogrammata", tone: "silver" },
}

export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  draft: { label: "Bozza", tone: "steel" },
  sent: { label: "Da saldare", tone: "amber" },
  paid: { label: "Pagata", tone: "green" },
  overdue: { label: "Scaduta", tone: "red" },
}

export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: Tone }> = {
  "new": { label: "Nuovo", tone: "red" },
  "in-progress": { label: "In lavorazione", tone: "amber" },
  "resolved": { label: "Risolto", tone: "green" },
}

export const TICKET_PRIORITY: Record<TicketPriority, { label: string; tone: Tone }> = {
  low: { label: "Bassa", tone: "steel" },
  medium: { label: "Media", tone: "silver" },
  high: { label: "Alta", tone: "amber" },
  critical: { label: "Critica", tone: "red" },
}

export const CONVO_STATUS: Record<ConversationStatus, { label: string; tone: Tone }> = {
  open: { label: "Aperta", tone: "silver" },
  answered: { label: "Risposto", tone: "green" },
  has_questions: { label: "In attesa", tone: "amber" },
  closed: { label: "Chiusa", tone: "steel" },
}

export const CLIENT_STATUS: Record<ClientStatus, { label: string; tone: Tone }> = {
  active: { label: "Attivo", tone: "green" },
  onboarding: { label: "Onboarding", tone: "amber" },
  paused: { label: "In pausa", tone: "steel" },
}

export const CLIENT_PLAN: Record<ClientPlan, { label: string; tone: Tone }> = {
  starter: { label: "Starter", tone: "steel" },
  pro: { label: "Pro", tone: "silver" },
  enterprise: { label: "Enterprise", tone: "copper" },
}

export const EVENT_META: Record<EventType, { icon: IconName; tone: Tone }> = {
  project_submitted: { icon: "flag", tone: "silver" },
  project_approved: { icon: "checkCircle", tone: "green" },
  project_paused: { icon: "pause", tone: "amber" },
  project_resumed: { icon: "play", tone: "green" },
  project_completed: { icon: "sparkle", tone: "copper" },
  stage_started: { icon: "bolt", tone: "silver" },
  stage_completed: { icon: "check", tone: "green" },
  approval_requested: { icon: "bell", tone: "amber" },
  approval_granted: { icon: "checkCircle", tone: "green" },
  changes_requested: { icon: "edit", tone: "red" },
  invoice_issued: { icon: "invoice", tone: "silver" },
  invoice_paid: { icon: "euro", tone: "green" },
  invoice_overdue: { icon: "warn", tone: "red" },
  payment_declared: { icon: "euro", tone: "amber" },
  meeting_proposed: { icon: "calendar", tone: "silver" },
  meeting_confirmed: { icon: "calendar", tone: "green" },
  meeting_cancelled: { icon: "x", tone: "red" },
  meeting_rescheduled: { icon: "clock", tone: "amber" },
  document_shared: { icon: "doc", tone: "silver" },
  document_signed: { icon: "checkCircle", tone: "green" },
  credentials_released: { icon: "lock", tone: "copper" },
  note: { icon: "doc", tone: "steel" },
}

/* Vocabulary for documents & handover credentials. */
export const DOC_TYPE: Record<"report" | "contract" | "invoice" | "handover" | "other", { label: string; tone: Tone; icon: IconName }> = {
  contract: { label: "Contratto", tone: "copper", icon: "doc" },
  invoice: { label: "Fattura", tone: "amber", icon: "invoice" },
  report: { label: "Report", tone: "silver", icon: "doc" },
  handover: { label: "Consegna", tone: "green", icon: "sparkle" },
  other: { label: "Documento", tone: "steel", icon: "doc" },
}

/** Project journal / activity feed. */
export function Timeline({ events, showProject = false, showClient = false, limit }: {
  events: ProjectEvent[]
  showProject?: boolean
  showClient?: boolean
  limit?: number
}) {
  const list = limit ? events.slice(0, limit) : events
  if (list.length === 0) {
    return <Empty icon="clock" title="Nessuna attività" hint="Gli eventi del progetto compariranno qui." />
  }
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 14, top: 10, bottom: 10, width: 1, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {list.map(ev => {
          const meta = EVENT_META[ev.type] ?? EVENT_META.note
          const t = TONE[meta.tone]
          const context = [showClient ? ev.clientName : null, showProject ? ev.projectName : null]
            .filter(Boolean).join(" · ")
          return (
            <div key={ev.id} style={{ position: "relative", display: "flex", gap: 13, padding: "8px 0", alignItems: "flex-start" }}>
              <span style={{
                position: "relative", zIndex: 1,
                width: 29, height: 29, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: t.bg, border: `1px solid ${t.bd}`, color: t.fg,
                boxShadow: "0 0 0 4px #1E3442",
              }}>
                <Icon name={meta.icon} size={12.5} />
              </span>
              <div style={{ minWidth: 0, paddingTop: 3 }}>
                <p style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: T.text, margin: 0, lineHeight: 1.4 }}>
                  {ev.title}
                </p>
                <p style={{ fontFamily: MONO, fontSize: 10, color: T.faint, margin: "3px 0 0", letterSpacing: "0.04em" }}>
                  {relativeDate(ev.createdAt)}{context ? `  ·  ${context}` : ""}
                </p>
                {ev.detail && (
                  <p style={{ fontFamily: DISPLAY, fontSize: 13.5, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>
                    {ev.detail}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Structured onboarding brief — read-only summary card. */
export function BriefCard({ brief, description }: { brief?: ProjectBrief; description?: string }) {
  const fields = [
    { label: "Tipo", value: brief?.projectType, icon: "layers" as IconName },
    { label: "Budget", value: brief?.budgetRange, icon: "euro" as IconName },
    { label: "Tempistiche", value: brief?.deadline, icon: "clock" as IconName },
  ].filter(f => f.value)
  const hasRefs = !!brief?.references
  if (fields.length === 0 && !hasRefs && !description) return null
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 14,
      background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <p style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.copperLt, margin: 0 }}>
        <Icon name="briefcase" size={12} /> Brief del progetto
      </p>
      {fields.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {fields.map(f => (
            <div key={f.label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 11,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
            }}>
              <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: TONE.copper.fg }}>
                <Icon name={f.icon} size={14} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint, margin: 0 }}>{f.label}</p>
                <p style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, color: T.text, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis" }}>{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {description && (
        <div>
          <p style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint, margin: "0 0 5px" }}>Obiettivi</p>
          <p style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: T.muted, margin: 0, whiteSpace: "pre-wrap" }}>{description}</p>
        </div>
      )}
      {hasRefs && (
        <div>
          <p style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint, margin: "0 0 5px" }}>Riferimenti</p>
          <p style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: T.muted, margin: 0, whiteSpace: "pre-wrap" }}>{brief!.references}</p>
        </div>
      )}
    </div>
  )
}

/** Generic list row: icon · text/sub · right slot. */
export function Row({ icon, iconTone = "steel", title, sub, right, onClick }: {
  icon?: IconName
  iconTone?: Tone
  title: React.ReactNode
  sub?: React.ReactNode
  right?: React.ReactNode
  onClick?: () => void
}) {
  const t = TONE[iconTone]
  return (
    <div
      onClick={onClick}
      className={onClick ? "portal-row" : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 4px",
        borderTop: `1px solid ${T.border}`,
        background: "transparent",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {icon && (
        <span style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: t.fg,
        }}>
          <Icon name={icon} size={16} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: DISPLAY, fontSize: 15.5, fontWeight: 700, color: T.text,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {title}
        </div>
        {sub && (
          <div style={{
            fontFamily: DISPLAY, fontSize: 14, color: T.faint, marginTop: 3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {sub}
          </div>
        )}
      </div>
      {right && <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>{right}</div>}
    </div>
  )
}
