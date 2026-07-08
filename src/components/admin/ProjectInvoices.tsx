/**
 * ProjectInvoices — Fatture tab of the dossier. Invoices scoped to one
 * project. Admin issues an invoice (fattura obbligatoria) and updates status.
 */
import React, { useCallback, useEffect, useState } from "react"
import {
  fetchInvoicesByProject, createInvoice, updateInvoiceStatus,
  type AdminInvoice, type InvoiceAdminStatus, fmtEur,
} from "../../lib/adminApi"

const COPPER = "#B04A38"
const GREEN  = "#10B981"

const CFG: Record<InvoiceAdminStatus, { label: string; color: string; bg: string }> = {
  draft:   { label: "Bozza",   color: "rgba(255,255,255,0.40)", bg: "rgba(255,255,255,0.05)" },
  sent:    { label: "Inviata", color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.08)" },
  paid:    { label: "Pagata",  color: GREEN,                    bg: "rgba(16,185,129,0.08)" },
  overdue: { label: "Scaduta", color: "#E05050",                bg: "rgba(224,80,80,0.08)" },
}

export default function ProjectInvoices({ projectId, clientId }: { projectId: string; clientId: string }) {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([])
  const [loading,  setLoading]  = useState(true)
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ number: "", description: "", amount: "", dueDate: "", status: "sent" as InvoiceAdminStatus })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchInvoicesByProject(projectId).then(setInvoices).catch(() => {}).finally(() => setLoading(false))
  }, [projectId])
  useEffect(() => { load() }, [load])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!form.number.trim() || !form.description.trim() || !form.amount) return
    setSaving(true)
    const now = new Date().toISOString().slice(0, 10)
    try {
      const inv = await createInvoice({
        clientId, projectId, number: form.number.trim(), description: form.description.trim(),
        amount: Number(form.amount), currency: "EUR", status: form.status, issuedAt: now, dueDate: form.dueDate || now,
      })
      setInvoices(prev => [inv, ...prev]); setShow(false)
      setForm({ number: "", description: "", amount: "", dueDate: "", status: "sent" })
    } finally { setSaving(false) }
  }

  function changeStatus(inv: AdminInvoice, status: InvoiceAdminStatus) {
    updateInvoiceStatus(inv.id, status)
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status } : i))
  }

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 font-mono text-[12px] outline-none"
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }
  const total = invoices.reduce((s, i) => s + i.amount, 0)
  const paid  = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-5">
          <div><span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.30)" }}>Totale</span>
            <p className="font-mono text-[15px] font-bold text-white">{fmtEur(total)}</p></div>
          <div><span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.30)" }}>Incassato</span>
            <p className="font-mono text-[15px] font-bold" style={{ color: GREEN }}>{fmtEur(paid)}</p></div>
        </div>
        <button onClick={() => setShow(v => !v)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[13px] font-bold text-white"
          style={{ background: show ? "rgba(255,255,255,0.07)" : "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: `1px solid ${show ? "rgba(255,255,255,0.12)" : "rgba(176,74,56,0.55)"}` }}>
          {show ? "Annulla" : (<><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path d="M12 5v14M5 12h14"/></svg>Nuova fattura</>)}
        </button>
      </div>

      {show && (
        <form onSubmit={create} className="rounded-2xl p-5" style={{ background: "rgba(176,74,56,0.05)", border: "1px solid rgba(176,74,56,0.20)" }}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Numero *</label>
              <input className={inputCls} style={inputStyle} placeholder="FAT-2026-XXX" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} required /></div>
            <div><label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Importo (€) *</label>
              <input type="number" min="1" className={inputCls} style={inputStyle} placeholder="2500" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></div>
            <div className="col-span-2"><label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Descrizione *</label>
              <input className={inputCls} style={inputStyle} placeholder="es. Fase Design — acconto" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required /></div>
            <div><label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Scadenza</label>
              <input type="date" className={inputCls} style={inputStyle} value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            <div><label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Stato</label>
              <select className={inputCls} style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as InvoiceAdminStatus }))}>
                {(["draft", "sent"] as InvoiceAdminStatus[]).map(s => <option key={s} value={s}>{CFG[s].label}</option>)}
              </select></div>
          </div>
          <button type="submit" disabled={saving} className="mt-4 rounded-xl px-4 py-2.5 font-display text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}>
            {saving ? "Salvataggio…" : "Emetti fattura"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="py-4 text-center font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>Caricamento…</p>
      ) : invoices.length === 0 ? (
        <p className="py-4 text-center font-display text-[13px]" style={{ color: "rgba(255,255,255,0.30)" }}>Nessuna fattura per questo progetto.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {invoices.map(inv => {
            const cfg = CFG[inv.status]
            return (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4" style={{ background: "rgba(22,27,34,0.55)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <div className="min-w-0">
                  <p className="font-display text-[13px] font-semibold text-white">{inv.description}</p>
                  <p className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>{inv.number} · scad. {inv.dueDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[15px] font-bold" style={{ color: inv.status === "paid" ? GREEN : "#fff" }}>{fmtEur(inv.amount)}</span>
                  <select value={inv.status} onChange={e => changeStatus(inv, e.target.value as InvoiceAdminStatus)}
                    className="rounded-lg px-2.5 py-1.5 font-mono text-[10px] outline-none cursor-pointer"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}35`, color: cfg.color }}>
                    {(["draft", "sent", "paid", "overdue"] as InvoiceAdminStatus[]).map(s => <option key={s} value={s}>{CFG[s].label}</option>)}
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
