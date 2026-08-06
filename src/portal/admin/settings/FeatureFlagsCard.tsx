import React from "react"
import { Badge, Btn, DISPLAY, Glass, Icon, MONO, SectionTitle, T, TONE, type IconName, type Tone } from "../../ui"

/* ══════════════════════════════════════════════════════════════════════════
   INTERRUTTORI.

   Un interruttore che spegne una parte del sito deve dire tre cose prima di
   essere toccato: com'è adesso, cosa succede se lo giro, e chi se ne accorge.
   Un semplice toggle con l'etichetta accanto ne dice una sola.
══════════════════════════════════════════════════════════════════════════ */

export function Toggle({ checked, onChange, disabled, label }: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="portal-btn pt-toggle"
      style={{
        width: 52, height: 30, borderRadius: 99, flexShrink: 0, position: "relative",
        padding: 0, cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "rgba(16,185,129,0.32)" : "rgba(255,255,255,0.10)",
        border: `1px solid ${checked ? "rgba(16,185,129,0.70)" : T.borderHi}`,
      }}
    >
      <span aria-hidden style={{
        position: "absolute", top: 3, left: checked ? 25 : 3,
        width: 22, height: 22, borderRadius: "50%",
        background: checked ? "#10B981" : "rgba(255,255,255,0.72)",
        transition: "left 0.18s cubic-bezier(0.16,1,0.3,1), background 0.18s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }} />
    </button>
  )
}

export function FlagRow({ icon, tone = "silver", title, description, effect, checked, onChange, busy }: {
  icon: IconName
  tone?: Tone
  title: string
  description: string
  /** Cosa cambia davvero quando è spento — la riga che evita il ripensamento. */
  effect: string
  checked: boolean
  onChange: (v: boolean) => void
  busy?: boolean
}) {
  return (
    <div style={{
      display: "flex", gap: 15, alignItems: "flex-start", padding: "16px 0",
      borderTop: `1px solid ${T.border}`,
    }}>
      <span style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: TONE[tone].bg, border: `1px solid ${TONE[tone].bd}`, color: TONE[tone].tx,
      }}>
        <Icon name={icon} size={17} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 15.5, fontWeight: 700, color: T.text }}>{title}</span>
          <Badge tone={checked ? "green" : "steel"} dot>{checked ? "Attivo" : "Spento"}</Badge>
        </div>
        <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.55, color: T.secondary, margin: "5px 0 0" }}>
          {description}
        </p>
        <p style={{
          fontFamily: MONO, fontSize: 12, lineHeight: 1.5, color: checked ? T.secondary : T.amber,
          margin: "7px 0 0",
        }}>
          {checked ? `Da spento: ${effect}` : effect}
        </p>
      </div>

      <Toggle checked={checked} onChange={onChange} disabled={busy} label={title} />
    </div>
  )
}

export function Card({ kicker, title, sub, right, children }: {
  kicker?: string
  title: string
  sub?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Glass variant="panel" style={{ padding: 20 }}>
      <SectionTitle kicker={kicker} title={title} sub={sub} right={right} />
      <div style={{ marginTop: 16 }}>{children}</div>
    </Glass>
  )
}

/** Riga «salva» ricorrente: stato sporco + bottone, sempre nello stesso posto. */
export function SaveBar({ dirty, busy, onSave, onReset, hint }: {
  dirty: boolean
  busy: boolean
  onSave: () => void
  onReset?: () => void
  hint?: string
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.border}`,
    }}>
      <span style={{ flex: 1, minWidth: 160, fontFamily: DISPLAY, fontSize: 13.5, color: dirty ? T.amber : T.secondary }}>
        {dirty ? "Modifiche non salvate" : hint ?? "Tutto salvato"}
      </span>
      {dirty && onReset && <Btn variant="ghost" onClick={onReset} disabled={busy}>Annulla</Btn>}
      <Btn variant="primary" icon="check" onClick={onSave} busy={busy} disabled={!dirty}>Salva</Btn>
    </div>
  )
}
