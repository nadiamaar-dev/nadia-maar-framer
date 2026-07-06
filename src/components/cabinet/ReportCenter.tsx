import React, { useEffect, useState } from "react"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const COPPER  = "#B04A38"
const GREEN   = "#10B981"

const STYLE_ID = "nm-report-styles"
const CSS = `
.nm-rep-card {
  position: relative; overflow: hidden;
  background: rgba(30,37,48,0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 14px; padding: 22px;
  display: flex; flex-direction: column; gap: 10px;
  transition: border-color 0.2s, transform 0.2s;
}
.nm-rep-card:hover {
  border-color: rgba(255,255,255,0.16);
  transform: translateY(-2px);
}
.nm-rep-action {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px; cursor: pointer;
  font-family: ${MONO}; font-size: 10px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: rgba(255,255,255,0.45); text-decoration: none;
  transition: all 0.18s ease; flex: 1; justify-content: center;
}
.nm-rep-action:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.22);
  color: rgba(255,255,255,0.75);
}
.nm-rep-action.primary {
  background: linear-gradient(135deg, rgba(176,74,56,0.18), rgba(176,74,56,0.08));
  border-color: rgba(176,74,56,0.32);
  color: #D4695A;
}
.nm-rep-action.primary:hover {
  background: linear-gradient(135deg, rgba(176,74,56,0.28), rgba(176,74,56,0.14));
  border-color: rgba(176,74,56,0.52);
  box-shadow: 0 4px 14px rgba(176,74,56,0.18);
}
.nm-rep-filter-btn {
  padding: 7px 16px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 7px; cursor: pointer;
  font-family: ${MONO}; font-size: 10px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.38);
  transition: all 0.15s ease;
  white-space: nowrap;
}
.nm-rep-filter-btn:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.65);
}
.nm-rep-filter-btn.active {
  background: rgba(176,74,56,0.14);
  border-color: rgba(176,74,56,0.38);
  color: #D4695A;
}
@media (max-width: 860px) { .nm-rep-grid { grid-template-columns: repeat(2, 1fr) !important; } }
@media (max-width: 540px) { .nm-rep-grid { grid-template-columns: 1fr !important; } }
`

/* ─── Types ──────────────────────────────────────────────────── */
export type ReportCategory = "Tutti" | "SEO" | "Marketing" | "Sviluppo" | "Analytics"

export interface Report {
  id: string
  title: string
  category: Exclude<ReportCategory, "Tutti">
  month: string      // e.g. "2025-06"
  monthLabel: string // e.g. "Giugno 2025"
  summary: string
  downloadUrl?: string
  previewUrl?: string
}

export interface ReportCenterProps {
  reports?: Report[]
  onDownload?: (report: Report) => void
  onPreview?: (report: Report) => void
}

/* ─── Mock data ──────────────────────────────────────────────── */
const MOCK_REPORTS: Report[] = [
  {
    id: "1",
    title: "Performance Organica & Keyword Ranking",
    category: "SEO",
    month: "2025-06",
    monthLabel: "Giugno 2025",
    summary: "CTR in crescita del 18%. Posizionamento top-3 su 12 keyword strategiche. Crawl budget ottimizzato.",
    downloadUrl: "#",
    previewUrl: "#",
  },
  {
    id: "2",
    title: "Campagne Social & Lead Generation",
    category: "Marketing",
    month: "2025-06",
    monthLabel: "Giugno 2025",
    summary: "Costo per lead ridotto del 24%. Tasso di conversione landing page al 4.2%. 3 campagne A/B concluse.",
    downloadUrl: "#",
  },
  {
    id: "3",
    title: "Sprint Tecnico — Frontend & CMS",
    category: "Sviluppo",
    month: "2025-05",
    monthLabel: "Maggio 2025",
    summary: "22 task completati. Lighthouse score 96. Integrazione Supabase Auth completata e in staging.",
    downloadUrl: "#",
    previewUrl: "#",
  },
  {
    id: "4",
    title: "Traffico & Comportamento Utenti",
    category: "Analytics",
    month: "2025-05",
    monthLabel: "Maggio 2025",
    summary: "Sessioni +31% YoY. Bounce rate sceso al 42%. Heatmap analizzate su 5 pagine chiave.",
    downloadUrl: "#",
  },
  {
    id: "5",
    title: "Audit Tecnico SEO & Core Web Vitals",
    category: "SEO",
    month: "2025-04",
    monthLabel: "Aprile 2025",
    summary: "LCP < 2.1s su desktop. 47 errori tecnici corretti. Schema markup implementato su 8 pagine.",
    downloadUrl: "#",
    previewUrl: "#",
  },
  {
    id: "6",
    title: "Email Marketing & Automazioni",
    category: "Marketing",
    month: "2025-04",
    monthLabel: "Aprile 2025",
    summary: "Open rate 38%. 2 automazioni attive. Lista contatti cresciuta del 15% in 4 settimane.",
    downloadUrl: "#",
  },
]

/* ─── Helpers ────────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<Exclude<ReportCategory, "Tutti">, { color: string; bg: string }> = {
  SEO:        { color: GREEN,                         bg: "rgba(16,185,129,0.12)" },
  Marketing:  { color: COPPER,                        bg: "rgba(176,74,56,0.12)" },
  Sviluppo:   { color: "rgba(120,160,220,0.90)",      bg: "rgba(120,160,220,0.10)" },
  Analytics:  { color: "rgba(200,185,110,0.95)",      bg: "rgba(200,185,110,0.10)" },
}

const CATEGORIES: ReportCategory[] = ["Tutti", "SEO", "Marketing", "Sviluppo", "Analytics"]

function getUniqueMonths(reports: Report[]): string[] {
  const months = [...new Set(reports.map(r => r.month))].sort().reverse()
  return months
}

function CategoryBadge({ category }: { category: Exclude<ReportCategory, "Tutti"> }) {
  const cfg = CATEGORY_COLORS[category] ?? { color: "rgba(255,255,255,0.45)", bg: "rgba(255,255,255,0.06)" }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 9px",
      background: cfg.bg,
      border: `1px solid ${cfg.color}35`,
      borderRadius: 5,
      fontFamily: MONO, fontSize: 9, fontWeight: 700,
      letterSpacing: "0.14em", textTransform: "uppercase",
      color: cfg.color,
    }}>
      {category}
    </span>
  )
}

function ReportCard({ report, onDownload, onPreview }: { report: Report; onDownload?: (r: Report) => void; onPreview?: (r: Report) => void }) {
  const cfg = CATEGORY_COLORS[report.category] ?? { color: "rgba(255,255,255,0.45)", bg: "" }

  function handleDownload() {
    if (onDownload) { onDownload(report); return }
    if (report.downloadUrl && report.downloadUrl !== "#") window.open(report.downloadUrl, "_blank", "noopener")
  }
  function handlePreview() {
    if (onPreview) { onPreview(report); return }
    if (report.previewUrl && report.previewUrl !== "#") window.open(report.previewUrl, "_blank", "noopener")
  }

  return (
    <div className="nm-rep-card">
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${cfg.color}70, transparent)`,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <CategoryBadge category={report.category} />
        <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em" }}>
          {report.monthLabel}
        </span>
      </div>

      <h3 style={{
        fontFamily: DISPLAY, fontSize: 14, fontWeight: 700,
        color: "#fff", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.35,
      }}>
        {report.title}
      </h3>

      <p style={{
        fontFamily: DISPLAY, fontSize: 12, lineHeight: 1.65,
        color: "rgba(255,255,255,0.42)", margin: 0, flexGrow: 1,
      }}>
        {report.summary}
      </p>

      {/* Action row */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          className="nm-rep-action primary"
          onClick={handleDownload}
          disabled={!report.downloadUrl}
          title="Scarica report"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/>
          </svg>
          Scarica
        </button>
        {report.previewUrl && (
          <button
            className="nm-rep-action"
            onClick={handlePreview}
            title="Anteprima rapida"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Component ──────────────────────────────────────────────── */
export default function ReportCenter({ reports = MOCK_REPORTS, onDownload, onPreview }: ReportCenterProps) {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  const [activeCategory, setActiveCategory] = useState<ReportCategory>("Tutti")
  const [activeMonth, setActiveMonth] = useState<string>("all")

  const months = getUniqueMonths(reports)

  const filtered = reports.filter(r => {
    const catOk = activeCategory === "Tutti" || r.category === activeCategory
    const monOk = activeMonth === "all" || r.month === activeMonth
    return catOk && monOk
  })

  return (
    <section>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: COPPER, marginBottom: 8 }}>
          Centro Report
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          Report Periodici
        </h2>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
        marginBottom: 24, paddingBottom: 20,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`nm-rep-filter-btn${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.10)", flexShrink: 0 }} />

        {/* Month filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            className={`nm-rep-filter-btn${activeMonth === "all" ? " active" : ""}`}
            onClick={() => setActiveMonth("all")}
          >
            Tutti i mesi
          </button>
          {months.map(m => {
            const label = reports.find(r => r.month === m)?.monthLabel ?? m
            return (
              <button
                key={m}
                className={`nm-rep-filter-btn${activeMonth === m ? " active" : ""}`}
                onClick={() => setActiveMonth(m)}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <div style={{
        fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.30)",
        letterSpacing: "0.08em", marginBottom: 16,
      }}>
        {filtered.length} report{filtered.length !== 1 ? " trovati" : " trovato"}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 20px",
          color: "rgba(255,255,255,0.30)", fontFamily: DISPLAY, fontSize: 14,
        }}>
          Nessun report per i filtri selezionati.
        </div>
      ) : (
        <div className="nm-rep-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {filtered.map(r => (
            <ReportCard key={r.id} report={r} onDownload={onDownload} onPreview={onPreview} />
          ))}
        </div>
      )}
    </section>
  )
}
