import React, { useEffect } from "react"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const COPPER  = "#B04A38"
const GREEN   = "#10B981"

const STYLE_ID = "nm-invoice-styles"
const CSS = `
.nm-inv-row {
  display: grid;
  grid-template-columns: 110px 1fr 100px 110px 130px 120px;
  align-items: center;
  gap: 16px;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: background 0.15s;
}
.nm-inv-row:last-child { border-bottom: none; }
.nm-inv-row:hover { background: rgba(255,255,255,0.03); }
.nm-inv-header {
  display: grid;
  grid-template-columns: 110px 1fr 100px 110px 130px 120px;
  gap: 16px;
  padding: 10px 20px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.09);
}
.nm-inv-dl-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  background: linear-gradient(135deg, rgba(176,74,56,0.18), rgba(176,74,56,0.08));
  border: 1px solid rgba(176,74,56,0.32);
  border-radius: 7px; cursor: pointer;
  font-family: ${MONO}; font-size: 10px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #D4695A; text-decoration: none;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.nm-inv-dl-btn:hover {
  background: linear-gradient(135deg, rgba(176,74,56,0.30), rgba(176,74,56,0.14));
  border-color: rgba(176,74,56,0.55);
  box-shadow: 0 4px 14px rgba(176,74,56,0.18);
}
.nm-inv-dl-btn:disabled, .nm-inv-dl-btn[aria-disabled="true"] {
  opacity: 0.32; cursor: default; pointer-events: none;
}
@media (max-width: 860px) {
  .nm-inv-row, .nm-inv-header {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .nm-inv-col-hide { display: none; }
}
`

/* ─── Types ──────────────────────────────────────────────────── */
export type InvoiceStatus = "paid" | "pending" | "overdue"

export interface Invoice {
  id: string
  number: string
  description: string
  issuedAt: string
  amount: number
  currency?: string
  status: InvoiceStatus
  pdfUrl?: string
}

export interface InvoiceTableProps {
  invoices?: Invoice[]
  onDownload?: (invoice: Invoice) => void
}

/* ─── Mock data ──────────────────────────────────────────────── */
const MOCK_INVOICES: Invoice[] = [
  {
    id: "1",
    number: "FAT-2025-001",
    description: "Fase 1 — Analisi & Design System",
    issuedAt: "15 Gen 2025",
    amount: 2800,
    currency: "EUR",
    status: "paid",
    pdfUrl: "#",
  },
  {
    id: "2",
    number: "FAT-2025-002",
    description: "Fase 2 — Sviluppo Frontend",
    issuedAt: "15 Mar 2025",
    amount: 3500,
    currency: "EUR",
    status: "paid",
    pdfUrl: "#",
  },
  {
    id: "3",
    number: "FAT-2025-003",
    description: "Fase 3 — Backend & CMS Integration",
    issuedAt: "15 Mag 2025",
    amount: 2200,
    currency: "EUR",
    status: "pending",
  },
  {
    id: "4",
    number: "FAT-2025-004",
    description: "Fase 4 — Testing, Deploy & Go Live",
    issuedAt: "15 Ott 2025",
    amount: 1800,
    currency: "EUR",
    status: "pending",
  },
]

/* ─── Helpers ────────────────────────────────────────────────── */
const STATUS_CFG: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  paid:    { label: "Pagato",     color: GREEN,                    bg: "rgba(16,185,129,0.12)" },
  pending: { label: "In attesa",  color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.10)" },
  overdue: { label: "Scaduto",    color: "#E05050",                bg: "rgba(224,80,80,0.12)" },
}

function formatAmount(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(amount)
}

function StatusPill({ status }: { status: InvoiceStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px",
      background: cfg.bg,
      border: `1px solid ${cfg.color}35`,
      borderRadius: 99,
      fontFamily: MONO, fontSize: 10, fontWeight: 600,
      letterSpacing: "0.06em", textTransform: "uppercase",
      color: cfg.color, whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: cfg.color, flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  )
}

/* ─── Component ──────────────────────────────────────────────── */
export default function InvoiceTable({ invoices = MOCK_INVOICES, onDownload }: InvoiceTableProps) {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  const paid    = invoices.filter(i => i.status === "paid")
  const pending = invoices.filter(i => i.status !== "paid")
  const totalPaid    = paid.reduce((s, i) => s + i.amount, 0)
  const totalPending = pending.reduce((s, i) => s + i.amount, 0)

  function handleDownload(inv: Invoice) {
    if (onDownload) { onDownload(inv); return }
    if (inv.pdfUrl && inv.pdfUrl !== "#") {
      window.open(inv.pdfUrl, "_blank", "noopener")
    }
  }

  return (
    <section>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: COPPER, marginBottom: 8 }}>
          Finanze & Fatturazione
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          Storico Fatture
        </h2>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.20)",
          borderRadius: 12, padding: "16px 20px",
        }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(16,185,129,0.60)", marginBottom: 6 }}>
            Totale Pagato
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: GREEN }}>
            {formatAmount(totalPaid)}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 3 }}>
            {paid.length} fattur{paid.length === 1 ? "a" : "e"}
          </div>
        </div>
        <div style={{
          background: "rgba(200,185,110,0.07)", border: "1px solid rgba(200,185,110,0.18)",
          borderRadius: 12, padding: "16px 20px",
        }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(200,185,110,0.60)", marginBottom: 6 }}>
            In Attesa
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: "rgba(200,185,110,0.95)" }}>
            {formatAmount(totalPending)}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 3 }}>
            {pending.length} fattur{pending.length === 1 ? "a" : "e"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "rgba(30,37,48,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 14, overflow: "hidden",
      }}>
        {/* Column headers */}
        <div className="nm-inv-header">
          {["Numero", "Descrizione", "Importo", "Data Emissione", "Stato", "Documento"].map(h => (
            <span key={h} style={{
              fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {invoices.map(inv => (
          <div key={inv.id} className="nm-inv-row">
            <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              {inv.number}
            </span>
            <span style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.80)" }}>
              {inv.description}
            </span>
            <span style={{
              fontFamily: MONO, fontSize: 13, fontWeight: 700,
              color: inv.status === "paid" ? GREEN : "rgba(255,255,255,0.70)",
            }}>
              {formatAmount(inv.amount, inv.currency)}
            </span>
            <span className="nm-inv-col-hide" style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {inv.issuedAt}
            </span>
            <span>
              <StatusPill status={inv.status} />
            </span>
            <span>
              <button
                className="nm-inv-dl-btn"
                onClick={() => handleDownload(inv)}
                aria-disabled={!inv.pdfUrl}
                title={inv.pdfUrl ? "Scarica PDF" : "Documento non disponibile"}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 3v13M7 11l5 5 5-5"/>
                  <path d="M5 20h14"/>
                </svg>
                Scarica PDF
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{
        fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.22)",
        marginTop: 14, letterSpacing: "0.04em",
      }}>
        * Le fatture elettroniche vengono emesse tramite SDI. Per richieste contabili contatta il team.
      </p>
    </section>
  )
}
