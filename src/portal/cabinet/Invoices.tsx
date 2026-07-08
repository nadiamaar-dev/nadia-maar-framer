import React from "react"
import type { ClientHome } from "../../lib/api"
import { fmtDate, fmtEur } from "../../lib/api"
import { Badge, Btn, Empty, Glass, INVOICE_STATUS, MONO, Row, SectionTitle, Stat, T } from "../ui"

export default function Invoices({ home }: { home: ClientHome }) {
  const invoices = home.invoices
  const due = invoices.filter(i => i.status === "sent" || i.status === "overdue")
  const paid = invoices.filter(i => i.status === "paid")
  const projectName = (id?: string) => home.projects.find(p => p.id === id)?.name

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle kicker="Fatture" title="Situazione contabile" sub="Le fatture emesse per i tuoi progetti." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Stat label="Da saldare" value={fmtEur(due.reduce((s, i) => s + i.amount, 0))} icon="euro" tone={due.length > 0 ? "amber" : "green"} hint={due.length > 0 ? `${due.length} fattur${due.length === 1 ? "a" : "e"}` : "tutto in regola"} />
        <Stat label="Pagato" value={fmtEur(paid.reduce((s, i) => s + i.amount, 0))} icon="checkCircle" tone="green" hint={`${paid.length} fattur${paid.length === 1 ? "a" : "e"}`} />
        <Stat label="Totale documenti" value={String(invoices.length)} icon="invoice" tone="silver" />
      </div>

      <Glass variant="panel" style={{ padding: 20 }}>
        {invoices.length === 0 ? (
          <Empty icon="invoice" title="Nessuna fattura" hint="Le fatture emesse dallo studio appariranno qui." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {invoices.map(i => {
              const is = INVOICE_STATUS[i.status]
              const pname = projectName(i.projectId)
              return (
                <Row
                  key={i.id}
                  icon="invoice"
                  iconTone={is.tone}
                  title={`${i.number} — ${i.description}`}
                  sub={[
                    `Emessa ${fmtDate(i.issuedAt)}`,
                    i.dueDate ? `scade ${fmtDate(i.dueDate)}` : null,
                    pname ? `progetto: ${pname}` : null,
                  ].filter(Boolean).join(" · ")}
                  right={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                      <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: T.text }}>{fmtEur(i.amount)}</span>
                      <Badge tone={is.tone} dot>{is.label}</Badge>
                      {i.pdfPath?.startsWith("http") && (
                        <a href={i.pdfPath} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ textDecoration: "none", display: "inline-flex" }}>
                          <Btn size="sm" variant="ghost" icon="download">PDF</Btn>
                        </a>
                      )}
                    </span>
                  }
                />
              )
            })}
          </div>
        )}
      </Glass>
    </div>
  )
}
