import React, { useState, useEffect, useRef } from "react"
import {
  fetchDocuments, uploadDocument, deleteDocument, getDocumentDownloadUrl,
  fetchInvoices, createInvoice, updateInvoiceStatus,
  type ClientDocument, type AdminInvoice, type DocType, type InvoiceAdminStatus,
  fmtBytes, fmtEur,
} from "../../lib/adminApi"
import { MOCK_CLIENTS } from "../../data/adminData"

const COPPER = "#B04A38"
const GREEN  = "#10B981"

/* ─── Invoice status config ──────────────────────────────────── */
const INV_STATUS: Record<InvoiceAdminStatus, { label: string; color: string; bg: string }> = {
  draft:   { label: "Bozza",     color: "rgba(255,255,255,0.40)", bg: "rgba(255,255,255,0.05)" },
  sent:    { label: "Inviata",   color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.08)" },
  paid:    { label: "Pagata",    color: GREEN,                    bg: "rgba(16,185,129,0.08)" },
  overdue: { label: "Scaduta",   color: "#E05050",                bg: "rgba(224,80,80,0.08)" },
}

const DOC_TYPE_CFG: Record<DocType, { label: string; icon: React.ReactNode; color: string }> = {
  report:   { label: "Report",    color: COPPER,   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
  contract: { label: "Contratto", color: "#10B981", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
  invoice:  { label: "Fattura",   color: "rgba(200,185,110,0.95)", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg> },
  other:    { label: "Altro",     color: "rgba(255,255,255,0.35)", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg> },
}

const glassPanel = {
  background: "rgba(22,27,34,0.60)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.09)",
}

/* ─── Documents Tab ──────────────────────────────────────────── */
function DocumentsTab({ clientId }: { clientId: string }) {
  const [docs,        setDocs]        = useState<ClientDocument[]>([])
  const [loading,     setLoading]     = useState(true)
  const [dragging,    setDragging]    = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [docType,     setDocType]     = useState<DocType>("report")
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    fetchDocuments(clientId === "all" ? undefined : clientId).then(d => { setDocs(d); setLoading(false) })
  }, [clientId])

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadDocument(clientId === "all" ? "c1" : clientId, file, docType)
        setDocs(prev => [uploaded, ...prev])
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(doc: ClientDocument) {
    await deleteDocument(doc)
    setDocs(prev => prev.filter(d => d.id !== doc.id))
    setDeleteId(null)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Upload area */}
      <div
        className="flex flex-col items-center justify-center rounded-2xl px-8 py-10 text-center transition-colors"
        style={{
          border: `2px dashed ${dragging ? "rgba(176,74,56,0.60)" : "rgba(255,255,255,0.10)"}`,
          background: dragging ? "rgba(176,74,56,0.06)" : "rgba(255,255,255,0.02)",
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "rgba(176,74,56,0.10)", border: "1px solid rgba(176,74,56,0.22)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COPPER} strokeWidth="1.8" className="h-6 w-6">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p className="font-display text-sm font-semibold text-white/70">
          {uploading ? "Caricamento in corso…" : "Trascina qui i file o clicca per selezionare"}
        </p>
        <p className="mt-1 font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          PDF, contratti, report — max 20 MB per file
        </p>

        <div className="mt-5 flex items-center gap-3">
          {/* Type selector */}
          <select
            value={docType}
            onChange={e => setDocType(e.target.value as DocType)}
            className="rounded-lg px-3 py-2 font-mono text-[11px] outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.65)" }}
          >
            {(["report", "contract", "invoice", "other"] as DocType[]).map(t => (
              <option key={t} value={t}>{DOC_TYPE_CFG[t].label}</option>
            ))}
          </select>

          <button
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-display text-[13px] font-bold text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Seleziona file
          </button>
        </div>
        <input ref={fileInput} type="file" multiple accept=".pdf,.doc,.docx,.xlsx,.png,.jpg" className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* File list */}
      <div className="overflow-hidden rounded-2xl" style={glassPanel}>
        <div className="border-b px-5 py-3.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.30)" }}>
            {docs.length} document{docs.length !== 1 ? "i" : "o"} caricati
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center font-mono text-sm" style={{ color: "rgba(255,255,255,0.22)" }}>Caricamento…</div>
        ) : docs.length === 0 ? (
          <div className="py-10 text-center font-mono text-sm" style={{ color: "rgba(255,255,255,0.22)" }}>Nessun documento caricato</div>
        ) : (
          docs.map((doc, idx) => {
            const cfg = DOC_TYPE_CFG[doc.type]
            const clientName = MOCK_CLIENTS.find(c => c.id === doc.clientId)?.company ?? doc.clientId
            const url = getDocumentDownloadUrl(doc)
            return (
              <div
                key={doc.id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{ borderBottom: idx < docs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                {/* Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                  {cfg.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-display text-[13px] font-semibold text-white">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.22)" }}>·</span>
                    <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>{clientName}</span>
                    <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.22)" }}>·</span>
                    <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>{fmtBytes(doc.sizeBytes)}</span>
                  </div>
                </div>

                {/* Date */}
                <span className="hidden font-mono text-[10px] sm:block" style={{ color: "rgba(255,255,255,0.28)" }}>{doc.uploadedAt}</span>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[10px] transition-colors"
                    style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                      <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
                    </svg>
                    Download
                  </a>
                  <button
                    onClick={() => setDeleteId(doc.id)}
                    className="flex items-center justify-center rounded-lg p-1.5 transition-colors"
                    style={{ color: "rgba(224,80,80,0.45)", background: "rgba(224,80,80,0.06)", border: "1px solid rgba(224,80,80,0.12)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (() => {
        const doc = docs.find(d => d.id === deleteId)!
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-10 max-w-sm rounded-2xl p-6 mx-4"
              style={{ background: "rgba(18,22,30,0.97)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.09)" }}
              onClick={e => e.stopPropagation()}>
              <p className="font-display text-base font-bold text-white mb-2">Eliminare questo documento?</p>
              <p className="font-mono text-[11px] mb-5" style={{ color: "rgba(255,255,255,0.40)" }}>{doc?.name}</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(doc!)}
                  className="flex-1 rounded-xl py-2.5 font-display text-sm font-bold"
                  style={{ background: "rgba(224,80,80,0.20)", border: "1px solid rgba(224,80,80,0.35)", color: "#E05050" }}>
                  Elimina
                </button>
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 rounded-xl py-2.5 font-display text-sm font-semibold"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)" }}>
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

/* ─── Invoices Tab ───────────────────────────────────────────── */
function InvoicesTab({ clientId }: { clientId: string }) {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    clientId: clientId === "all" ? MOCK_CLIENTS[0].id : clientId,
    number: "", description: "", amount: "", dueDate: "", status: "draft" as InvoiceAdminStatus,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchInvoices(clientId === "all" ? undefined : clientId).then(d => { setInvoices(d); setLoading(false) })
  }, [clientId])

  useEffect(() => {
    if (clientId !== "all") setForm(f => ({ ...f, clientId }))
  }, [clientId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.number.trim() || !form.description.trim() || !form.amount) return
    setSaving(true)
    try {
      const now = new Date().toISOString().slice(0, 10)
      const inv = await createInvoice({
        clientId: form.clientId, number: form.number, description: form.description,
        amount: Number(form.amount), currency: "EUR", status: form.status,
        issuedAt: now, dueDate: form.dueDate || now,
      })
      setInvoices(prev => [inv, ...prev])
      setShowForm(false)
      setForm(f => ({ ...f, number: "", description: "", amount: "", dueDate: "" }))
    } finally {
      setSaving(false)
    }
  }

  function handleStatusChange(inv: AdminInvoice, newStatus: InvoiceAdminStatus) {
    updateInvoiceStatus(inv.id, newStatus)
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: newStatus } : i))
  }

  const inputCls  = "w-full rounded-xl px-3.5 py-2.5 font-mono text-[12px] outline-none"
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)" }

  return (
    <div className="flex flex-col gap-5">
      {/* Create button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          {(["paid", "sent", "draft", "overdue"] as InvoiceAdminStatus[]).map(s => {
            const cnt = invoices.filter(i => i.status === s).length
            if (!cnt) return null
            const cfg = INV_STATUS[s]
            return (
              <div key={s} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
                <span className="font-mono text-[10px]" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="font-mono text-[11px] font-bold" style={{ color: cfg.color }}>{cnt}</span>
              </div>
            )
          })}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[13px] font-bold text-white"
          style={{ background: showForm ? "rgba(255,255,255,0.07)" : "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: `1px solid ${showForm ? "rgba(255,255,255,0.12)" : "rgba(176,74,56,0.55)"}` }}
        >
          {showForm ? "Annulla" : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path d="M12 5v14M5 12h14"/></svg>
              Nuova Fattura
            </>
          )}
        </button>
      </div>

      {/* New invoice form */}
      {showForm && (
        <form onSubmit={handleCreate}
          className="rounded-2xl p-6"
          style={{ background: "rgba(176,74,56,0.06)", border: "1px solid rgba(176,74,56,0.20)" }}
        >
          <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>
            Crea Nuova Fattura
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Client */}
            <div className="col-span-2">
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Cliente *</label>
              <select className={inputCls} style={inputStyle} value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
                {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </div>
            {/* Number */}
            <div>
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Numero *</label>
              <input className={inputCls} style={inputStyle} placeholder="FAT-2025-XXX" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} required />
            </div>
            {/* Amount */}
            <div>
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Importo (€) *</label>
              <input className={inputCls} style={inputStyle} type="number" min="1" placeholder="2500" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            {/* Description */}
            <div className="col-span-2">
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Descrizione *</label>
              <input className={inputCls} style={inputStyle} placeholder="es. Fase 2 — Sviluppo Frontend" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            </div>
            {/* Due date + status */}
            <div>
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Scadenza</label>
              <input type="date" className={inputCls} style={inputStyle} value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.30)" }}>Stato iniziale</label>
              <select className={inputCls} style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as InvoiceAdminStatus }))}>
                {(["draft", "sent"] as InvoiceAdminStatus[]).map(s => <option key={s} value={s}>{INV_STATUS[s].label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl py-3 font-display text-sm font-bold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))", border: "1px solid rgba(176,74,56,0.55)" }}>
              {saving ? "Salvataggio…" : "Crea Fattura"}
            </button>
          </div>
        </form>
      )}

      {/* Invoice table */}
      <div className="overflow-hidden rounded-2xl" style={glassPanel}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Numero", "Cliente", "Descrizione", "Importo", "Scadenza", "Stato"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center font-mono text-sm" style={{ color: "rgba(255,255,255,0.22)" }}>Caricamento…</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center font-mono text-sm" style={{ color: "rgba(255,255,255,0.22)" }}>Nessuna fattura</td></tr>
              ) : invoices.map((inv, idx) => {
                const cfg = INV_STATUS[inv.status]
                const clientName = MOCK_CLIENTS.find(c => c.id === inv.clientId)?.company ?? inv.clientId
                return (
                  <tr key={inv.id}
                    className="transition-colors"
                    style={{ borderBottom: idx < invoices.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <td className="px-4 py-3.5 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{inv.number}</td>
                    <td className="px-4 py-3.5 font-display text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{clientName}</td>
                    <td className="px-4 py-3.5 font-display text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>{inv.description}</td>
                    <td className="px-4 py-3.5 font-mono text-sm font-bold" style={{ color: inv.status === "paid" ? GREEN : "rgba(255,255,255,0.70)" }}>
                      {fmtEur(inv.amount)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{inv.dueDate}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={inv.status}
                        onChange={e => handleStatusChange(inv, e.target.value as InvoiceAdminStatus)}
                        className="rounded-lg px-2.5 py-1.5 font-mono text-[10px] outline-none cursor-pointer"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.color}35`, color: cfg.color }}
                      >
                        {(["draft", "sent", "paid", "overdue"] as InvoiceAdminStatus[]).map(s => (
                          <option key={s} value={s}>{INV_STATUS[s].label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function DocumentManager() {
  const [activeTab,      setActiveTab]      = useState<"docs" | "invoices">("docs")
  const [selectedClient, setSelectedClient] = useState<string>("all")

  const tabs = [
    { id: "docs"     as const, label: "Documenti",   count: null },
    { id: "invoices" as const, label: "Fatture",      count: null },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: COPPER }}>Manager Documenti</p>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">Documenti & Fatture</h2>
        </div>

        {/* Client selector */}
        <select
          value={selectedClient}
          onChange={e => setSelectedClient(e.target.value)}
          className="rounded-xl px-3.5 py-2 font-mono text-[11px] outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.70)" }}
        >
          <option value="all">Tutti i clienti</option>
          {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
        </select>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="relative -mb-px flex items-center gap-2 px-4 py-3 font-display text-[13px] font-semibold transition-colors"
            style={{
              color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.35)",
              borderBottom: `2px solid ${activeTab === t.id ? COPPER : "transparent"}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "docs"     && <DocumentsTab clientId={selectedClient} />}
      {activeTab === "invoices" && <InvoicesTab  clientId={selectedClient} />}
    </div>
  )
}
