import React, { useState } from "react"
import type { ProjectCredential } from "../../lib/api"
import { Badge, Btn, DISPLAY, Empty, Icon, MONO, Note, T } from "../ui"

function SecretRow({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  const [shown, setShown] = useState(!secret)
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch { /* clipboard blocked — ignore */ }
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint, width: 70, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        flex: 1, minWidth: 0, fontFamily: MONO, fontSize: 12, color: T.text,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        letterSpacing: shown ? "normal" : "0.15em",
      }}>
        {shown ? value : "••••••••••"}
      </span>
      {secret && (
        <button onClick={() => setShown(s => !s)} title={shown ? "Nascondi" : "Mostra"}
          style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, display: "inline-flex", padding: 4 }}>
          <Icon name={shown ? "x" : "search"} size={13} />
        </button>
      )}
      <button onClick={copy} title="Copia"
        style={{ background: "none", border: "none", cursor: "pointer", color: copied ? T.green : T.faint, display: "inline-flex", padding: 4 }}>
        <Icon name={copied ? "check" : "paperclip"} size={13} />
      </button>
    </div>
  )
}

function CredCard({ c }: { c: ProjectCredential }) {
  const isAccess = c.kind === "access"
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 14,
      background: "rgba(224,131,106,0.06)", border: "1px solid rgba(224,131,106,0.22)",
      borderLeft: "2px solid rgba(224,131,106,0.6)",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(224,131,106,0.14)", border: "1px solid rgba(224,131,106,0.30)", color: T.copperLt,
        }}>
          <Icon name={isAccess ? "lock" : "external"} size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 700, color: T.text, margin: 0 }}>{c.label}</p>
        </div>
        <Badge tone={isAccess ? "copper" : "green"}>{isAccess ? "Accesso" : "Risorsa"}</Badge>
      </div>

      {(c.url || c.username || c.secret) && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 9,
          padding: "12px 14px", borderRadius: 11,
          background: "rgba(0,0,0,0.22)", border: `1px solid ${T.border}`,
        }}>
          {c.url && <SecretRow label="URL" value={c.url} />}
          {c.username && <SecretRow label="Utente" value={c.username} />}
          {c.secret && <SecretRow label="Password" value={c.secret} secret />}
        </div>
      )}

      {c.note && (
        <p style={{ fontFamily: DISPLAY, fontSize: 12.5, lineHeight: 1.55, color: T.muted, margin: 0, whiteSpace: "pre-wrap" }}>
          {c.note}
        </p>
      )}

      {c.url && (
        <a href={c.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
          <Btn size="sm" variant="ghost" icon="external">Apri</Btn>
        </a>
      )}
    </div>
  )
}

/** Client-facing handover: released access credentials + resources (Fase 5). */
export default function HandoverPanel({ credentials, completed }: { credentials: ProjectCredential[]; completed: boolean }) {
  if (credentials.length === 0) {
    return (
      <Empty
        icon="lock"
        title={completed ? "Consegna in preparazione" : "Non ancora disponibile"}
        hint={completed
          ? "Accessi, credenziali e materiali di consegna appariranno qui non appena rilasciati dallo studio."
          : "Al termine del progetto troverai qui gli accessi (hosting, pannello) e i materiali di consegna."}
      />
    )
  }
  const access = credentials.filter(c => c.kind === "access")
  const resources = credentials.filter(c => c.kind === "resource")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Note tone="copper">Questi accessi sono riservati: conservali in un luogo sicuro e non condividerli.</Note>
      {access.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.faint, margin: 0 }}>Accessi & credenziali</p>
          {access.map(c => <CredCard key={c.id} c={c} />)}
        </div>
      )}
      {resources.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.faint, margin: 0 }}>Guide & risorse</p>
          {resources.map(c => <CredCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  )
}
