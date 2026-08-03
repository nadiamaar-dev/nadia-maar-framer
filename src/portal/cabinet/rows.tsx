import React from "react"
import type { Invoice, Meeting } from "../../lib/api"
import { fmtDate, fmtDateTime, fmtEur, getInvoicePdfUrl } from "../../lib/api"
import { Badge, Btn, INVOICE_STATUS, MEETING_STATUS, MONO, Row, T } from "../ui"

/* ══════════════════════════════════════════════════════════════════════════
   Shared list rows for invoices and meetings.

   These live here because the project dossier used to show both as read-only
   lists — with a badge counting what needed doing and no way to do it. To pay
   an invoice you had to leave the dossier for the Fatture section. Same row,
   same actions, both places.
══════════════════════════════════════════════════════════════════════════ */

export function InvoiceRow({ invoice: i, projectName, onDeclare, busy }: {
  invoice: Invoice
  projectName?: string
  onDeclare: (i: Invoice) => void
  busy?: boolean
}) {
  const is = INVOICE_STATUS[i.status]
  const payable = i.status === "sent" || i.status === "overdue"
  const declared = !!i.clientMarkedPaidAt
  const pdfUrl = getInvoicePdfUrl(i)

  return (
    <Row
      icon="invoice"
      iconTone={is.tone}
      title={`${i.number} — ${i.description}`}
      sub={[
        `Emessa ${fmtDate(i.issuedAt)}`,
        i.dueDate ? `scade ${fmtDate(i.dueDate)}` : null,
        projectName ? `progetto: ${projectName}` : null,
      ].filter(Boolean).join(" · ")}
      right={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: T.text }}>{fmtEur(i.amount)}</span>
          {payable && declared
            ? <Badge tone="silver" dot>In verifica</Badge>
            : <Badge tone={is.tone} dot>{is.label}</Badge>}
          {payable && !declared && (
            <Btn size="sm" variant="primary" icon="check" busy={busy} onClick={() => onDeclare(i)}>
              Ho pagato
            </Btn>
          )}
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ textDecoration: "none", display: "inline-flex" }}>
              <Btn size="sm" variant="ghost" icon="download">PDF</Btn>
            </a>
          )}
        </span>
      }
    />
  )
}

export function MeetingRow({ meeting: m, projectName, onAct, onCancel, onReschedule, busy, actionable = true }: {
  meeting: Meeting
  projectName?: string
  /** confirm or reject a slot the studio proposed */
  onAct: (m: Meeting, status: "confirmed" | "cancelled") => void
  onCancel: (m: Meeting) => void
  onReschedule: (m: Meeting) => void
  busy?: boolean
  /** false in the archive, where nothing can be acted on */
  actionable?: boolean
}) {
  const ms = MEETING_STATUS[m.status]
  const needsMyConfirm = actionable && m.status === "pending" && m.proposedBy === "admin"
  /* mirrors the RLS policy: a client may always drop their own upcoming slot,
     whoever proposed it — they just cannot confirm their own */
  const canDrop = actionable && !needsMyConfirm &&
    (m.status === "confirmed" || (m.status === "pending" && m.proposedBy === "client"))

  return (
    <Row
      icon="calendar"
      iconTone={ms.tone}
      title={fmtDateTime(m.datetime)}
      sub={[
        `${m.durationMin} min`,
        m.proposedBy === "admin" ? "proposta dallo studio" : "proposta da te",
        projectName ? `progetto: ${projectName}` : null,
        m.adminNote || m.clientNote || null,
      ].filter(Boolean).join(" · ")}
      right={
        needsMyConfirm ? (
          <span style={{ display: "inline-flex", gap: 7 }} onClick={e => e.stopPropagation()}>
            <Btn size="sm" variant="ghost" onClick={() => onAct(m, "cancelled")} busy={busy}>Rifiuta</Btn>
            <Btn size="sm" variant="primary" icon="check" onClick={() => onAct(m, "confirmed")} busy={busy}>Conferma</Btn>
          </span>
        ) : canDrop ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
            <Badge tone={m.status === "pending" ? "amber" : ms.tone} dot>
              {m.status === "pending" ? "In attesa di conferma" : ms.label}
            </Badge>
            <Btn size="sm" variant="ghost" icon="clock" onClick={() => onReschedule(m)}>Sposta</Btn>
            <Btn size="sm" variant="ghost" icon="x" onClick={() => onCancel(m)}>Annulla</Btn>
          </span>
        ) : (
          <Badge tone={ms.tone} dot>{ms.label}</Badge>
        )
      }
    />
  )
}
