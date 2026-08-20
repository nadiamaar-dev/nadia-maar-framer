import React from "react"
import type { ActivityKind, Priority, Rep, StageId } from "./types"
import { PRIORITY_LABEL, STAGE_BY_ID, repById } from "./data"

/* ══════════════════════════════════════════════════════════════════════════
   PEZZI COMUNI
   Icone disegnate a mano (nessuna libreria) e i pochi elementi che compaiono
   in più schermate. Tutto ciò che sta qui non conosce lo stato: riceve dati
   e disegna.
══════════════════════════════════════════════════════════════════════════ */

const I = {
  board:   <><rect x="2.6" y="3" width="4.2" height="12" rx="1.2" /><rect x="8.4" y="3" width="4.2" height="8" rx="1.2" /><rect x="14.2" y="3" width="1.2" height="10" rx="0.6" /></>,
  chart:   <><path d="M2.8 15.2h12.4" /><rect x="4" y="8.6" width="2.6" height="4.6" rx="0.8" /><rect x="8.2" y="5.4" width="2.6" height="7.8" rx="0.8" /><rect x="12.4" y="10.4" width="2.6" height="2.8" rx="0.8" /></>,
  people:  <><circle cx="7.2" cy="6.4" r="2.6" /><path d="M2.6 15a4.6 4.6 0 019.2 0" /><path d="M12.4 4.2a2.6 2.6 0 010 4.6M13.4 15a4.6 4.6 0 00-1.6-3.5" /></>,
  search:  <><circle cx="7.6" cy="7.6" r="4.8" /><path d="M11.2 11.2L15 15" /></>,
  bell:    <><path d="M5 7.4a4 4 0 018 0c0 3 1.2 4.2 1.6 4.6a.5.5 0 01-.35.9H3.75a.5.5 0 01-.35-.9C3.8 11.6 5 10.4 5 7.4z" /><path d="M7.4 14.9a1.8 1.8 0 003.2 0" /></>,
  help:    <><circle cx="9" cy="9" r="6.8" /><path d="M7.1 7a2 2 0 013.9.6c0 1.3-1.9 1.7-1.9 2.9" /><circle cx="9" cy="13.2" r="0.7" fill="currentColor" stroke="none" /></>,
  gear:    <><circle cx="9" cy="9" r="2.4" /><path d="M9 2.2v1.6M9 14.2v1.6M15.8 9h-1.6M3.8 9H2.2M13.8 4.2l-1.1 1.1M5.3 12.7l-1.1 1.1M13.8 13.8l-1.1-1.1M5.3 5.3L4.2 4.2" /></>,
  exit:    <><path d="M7 15.2H4.2a1.6 1.6 0 01-1.6-1.6V4.4a1.6 1.6 0 011.6-1.6H7" /><path d="M11.6 12.4L15 9l-3.4-3.4M15 9H7" /></>,
  plus:    <path d="M9 4.2v9.6M4.2 9h9.6" />,
  download:<><path d="M9 3v8" /><path d="M5.8 8.2L9 11.4l3.2-3.2" /><path d="M3.4 13.6h11.2" /></>,
  phone:   <><path d="M6.2 3.4l1.6 2.8-1.4 1.4a8.6 8.6 0 004 4l1.4-1.4 2.8 1.6-.6 2.2a1.2 1.2 0 01-1.3.8A11.8 11.8 0 013.2 4.5a1.2 1.2 0 01.8-1.3z" /></>,
  meeting: <><rect x="2.8" y="4" width="12.4" height="11" rx="2" /><path d="M12 2.4v3M6 2.4v3M2.8 7.8h12.4" /></>,
  mail:    <><rect x="2.4" y="4.2" width="13.2" height="9.6" rx="2" /><path d="M2.9 5.4L9 9.8l6.1-4.4" /></>,
  note:    <><rect x="3.6" y="2.8" width="10.8" height="12.4" rx="2" /><path d="M6.4 6.6h5.2M6.4 9.2h5.2M6.4 11.8h3" /></>,
  doc:     <><path d="M4.4 2.8h5.2l4 4v8.4H4.4z" /><path d="M9.6 2.8v4h4" /></>,
  move:    <><path d="M9 3.2v11.6M3.2 9h11.6" /><path d="M6.6 5.6L9 3.2l2.4 2.4M6.6 12.4L9 14.8l2.4-2.4M5.6 6.6L3.2 9l2.4 2.4M12.4 6.6L14.8 9l-2.4 2.4" /></>,
  check:   <path d="M3.6 9.4l3.6 3.6L14.4 5.8" />,
  clock:   <><circle cx="9" cy="9" r="6.6" /><path d="M9 5.2V9l2.6 1.6" /></>,
  euro:    <><path d="M13 4.6a5 5 0 100 8.8" /><path d="M3.4 7.6h6.4M3.4 10.4h6.4" /></>,
  archive: <><rect x="2.6" y="3.2" width="12.8" height="3.6" rx="1.2" /><path d="M4.1 6.8v6.4a1.8 1.8 0 001.8 1.8h6.2a1.8 1.8 0 001.8-1.8V6.8" /><path d="M7.3 10h3.4" /></>,
  trash:   <><path d="M3.4 5.2h11.2" /><path d="M7.3 5.2V3.9a1.1 1.1 0 011.1-1.1h1.2a1.1 1.1 0 011.1 1.1v1.3" /><path d="M5.1 5.2l.6 8.3a1.5 1.5 0 001.5 1.4h3.6a1.5 1.5 0 001.5-1.4l.6-8.3" /><path d="M7.6 7.8v4.4M10.4 7.8v4.4" /></>,
  undo:    <><path d="M3.3 8.6a5.7 5.7 0 105.7-5.4c-2 0-3.8 1-4.9 2.7" /><path d="M2.9 3.2v3.3h3.3" /></>,
  dots:    <><circle cx="4.4" cy="9" r="1.25" fill="currentColor" stroke="none" /><circle cx="9" cy="9" r="1.25" fill="currentColor" stroke="none" /><circle cx="13.6" cy="9" r="1.25" fill="currentColor" stroke="none" /></>,
  pencil:  <><path d="M11.6 3.4l3 3-7.4 7.4-3.6.6.6-3.6z" /><path d="M10.2 4.8l3 3" /></>,
}

export type IconName = keyof typeof I

export const Ico = ({ n, size = 18 }: { n: IconName; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
    style={{ flexShrink: 0 }}>
    {I[n]}
  </svg>
)

/** L'icona giusta per ogni tipo di evento della cronologia. */
export const ACTIVITY_ICON: Record<ActivityKind, IconName> = {
  chiamata: "phone",
  riunione: "meeting",
  email: "mail",
  nota: "note",
  documento: "doc",
  stato: "move",
}

/* ── avatar ────────────────────────────────────────────────────────────── */
export function Avatar({ rep, size = 28 }: { rep: Rep; size?: number }) {
  return (
    <span
      className={`q-avatar${size >= 40 ? " q-avatar-lg" : ""}`}
      style={{ background: rep.tint, width: size, height: size }}
      title={`${rep.name} · ${rep.role}`}
    >
      {rep.initials}
    </span>
  )
}

export const AvatarOf = ({ id, size }: { id: string; size?: number }) =>
  <Avatar rep={repById(id)} size={size} />

/* ── priorità ──────────────────────────────────────────────────────────── */
export const PRIORITY_COLOR: Record<Priority, string> = {
  alta: "var(--q-bad)",
  media: "var(--q-warn)",
  bassa: "var(--q-line)",
}

/** Un trattino verticale sul bordo della card. Tre pallini accesi su ogni
    scheda farebbero rumore; un filo dice la stessa cosa senza gridare. */
export const PriorityBar = ({ p }: { p: Priority }) => (
  <span className="q-prio" style={{ background: PRIORITY_COLOR[p] }}
    title={`Priorità ${PRIORITY_LABEL[p].toLowerCase()}`} aria-hidden />
)

/* ── pillola di stato ──────────────────────────────────────────────────── */
export function StageChip({ id }: { id: StageId }) {
  const s = STAGE_BY_ID[id]
  return (
    <span className="q-chip q-chip-dot" style={{ color: s.color }}>
      <span style={{ color: "var(--q-ink-muted)" }}>{s.title}</span>
    </span>
  )
}

/* ── intestazione di riquadro ──────────────────────────────────────────── */
export function CardHead({ title, sub, right }: {
  title: string
  sub?: string
  right?: React.ReactNode
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      gap: 14, marginBottom: 14, flexWrap: "wrap",
    }}>
      <div style={{ minWidth: "min(100%,170px)", flex: "1 1 auto" }}>
        <h3 className="q-h2">{title}</h3>
        {sub && <p className="q-micro" style={{ marginTop: 3 }}>{sub}</p>}
      </div>
      {right}
    </div>
  )
}

/* ── riga chiave/valore ────────────────────────────────────────────────── */
export function Kv({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl style={{ margin: 0 }}>
      {rows.map(([k, v]) => (
        <div className="q-kv" key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ── riquadro metrica ──────────────────────────────────────────────────── */
export function Metric({ label, value, hint, variant = "dark", icon }: {
  label: string
  value: string
  hint?: React.ReactNode
  variant?: "dark" | "lime"
  icon?: React.ReactNode
}) {
  return (
    <div className={variant === "lime" ? "q-card-lime" : "q-card"}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span className="q-eyebrow" style={{
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          color: variant === "lime" ? "rgba(12,14,17,0.66)" : undefined,
        }}>{label}</span>
        {icon && <span style={{ marginLeft: "auto", opacity: 0.5 }}>{icon}</span>}
      </div>
      <div className="q-figure q-num">{value}</div>
      {hint && <div className="q-micro" style={{
        marginTop: 6, color: variant === "lime" ? "rgba(12,14,17,0.66)" : undefined,
      }}>{hint}</div>}
    </div>
  )
}

/* ── stato vuoto ───────────────────────────────────────────────────────── */
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="q-micro" style={{ padding: "22px 4px", textAlign: "center" }}>
      {children}
    </p>
  )
}
