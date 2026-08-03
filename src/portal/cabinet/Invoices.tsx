import React, { useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientHome, Invoice } from "../../lib/api"
import { declareInvoicePaid, fmtEur } from "../../lib/api"
import { Empty, Glass, SectionTitle, Stat } from "../ui"
import { InvoiceRow } from "./rows"

export default function Invoices({ home, reload }: { home: ClientHome; reload: () => void }) {
  const toast = useToast()
  const [paying, setPaying] = useState<string | null>(null)
  const invoices = home.invoices
  const due = invoices.filter(i => i.status === "sent" || i.status === "overdue")
  const paid = invoices.filter(i => i.status === "paid")
  const projectName = (id?: string) => home.projects.find(p => p.id === id)?.name

  async function declare(i: Invoice) {
    if (paying) return
    setPaying(i.id)
    try {
      await declareInvoicePaid(i.id)
      toast.success("Grazie! Confermiamo la ricezione a breve.")
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    } finally {
      setPaying(null)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle kicker="Fatture" title="Situazione contabile" sub="Le fatture emesse per i tuoi progetti." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: 12 }}>
        <Stat label="Da saldare" value={fmtEur(due.reduce((s, i) => s + i.amount, 0))} icon="euro" tone={due.length > 0 ? "amber" : "green"} hint={due.length > 0 ? `${due.length} fattur${due.length === 1 ? "a" : "e"}` : "tutto in regola"} />
        <Stat label="Pagato" value={fmtEur(paid.reduce((s, i) => s + i.amount, 0))} icon="checkCircle" tone="green" hint={`${paid.length} fattur${paid.length === 1 ? "a" : "e"}`} />
        <Stat label="Totale documenti" value={String(invoices.length)} icon="invoice" tone="silver" />
      </div>

      <Glass variant="work" style={{ padding: 20 }}>
        {invoices.length === 0 ? (
          <Empty icon="invoice" title="Nessuna fattura" hint="Le fatture emesse dallo studio appariranno qui." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {invoices.map(i => (
              <InvoiceRow
                key={i.id}
                invoice={i}
                projectName={projectName(i.projectId)}
                onDeclare={declare}
                busy={paying === i.id}
              />
            ))}
          </div>
        )}
      </Glass>
    </div>
  )
}
