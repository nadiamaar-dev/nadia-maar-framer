import React from "react"
import type { AdminKpi } from "../../data/adminData"

interface KpiCardsProps {
  kpi: AdminKpi
}

const fmt = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

interface CardDef {
  label: string
  value: string | number
  sub: string
  color: string       // text color for the value
  glow: string        // border/ring color
  bg: string          // card background tint
  icon: React.ReactNode
  trend?: string
}

export default function KpiCards({ kpi }: KpiCardsProps) {
  const cards: CardDef[] = [
    {
      label: "Clienti Attivi",
      value: kpi.activeClients,
      sub: `${kpi.activeClients} su ${kpi.activeClients + 2} totali`,
      color: "#10B981",
      glow: "rgba(16,185,129,0.30)",
      bg: "rgba(16,185,129,0.07)",
      trend: "+2 questo mese",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
    {
      label: "Progetti in Corso",
      value: kpi.projectsInProgress,
      sub: "Tra tutti i clienti attivi",
      color: "#B04A38",
      glow: "rgba(176,74,56,0.30)",
      bg: "rgba(176,74,56,0.07)",
      trend: "3 in scadenza",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      ),
    },
    {
      label: "Fatture in Attesa",
      value: fmt(kpi.invoicesPendingTotal),
      sub: `${kpi.invoicesPendingCount} documenti da incassare`,
      color: "rgba(200,185,110,0.95)",
      glow: "rgba(200,185,110,0.28)",
      bg: "rgba(200,185,110,0.07)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <path d="M9 13h6M9 17h4"/>
        </svg>
      ),
    },
    {
      label: "Ticket Aperti",
      value: kpi.ticketsOpen,
      sub: kpi.ticketsOpen === 0 ? "Nessuna urgenza" : `${kpi.ticketsOpen} in attesa di risposta`,
      color: kpi.ticketsOpen === 0 ? "rgba(255,255,255,0.50)" : "#E05050",
      glow: kpi.ticketsOpen === 0 ? "rgba(255,255,255,0.10)" : "rgba(224,80,80,0.28)",
      bg: kpi.ticketsOpen === 0 ? "rgba(255,255,255,0.04)" : "rgba(224,80,80,0.07)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: card.bg,
            borderColor: card.glow,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: `0 0 0 1px ${card.glow} inset`,
          }}
        >
          {/* Corner glow */}
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
            style={{ background: card.glow }}
          />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p
                className="mb-1 font-mono text-[9px] uppercase tracking-[0.20em]"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                {card.label}
              </p>
              <p
                className="font-display text-[26px] font-extrabold leading-none tracking-tight"
                style={{ color: card.color }}
              >
                {card.value}
              </p>
            </div>
            <div
              className="mt-0.5 shrink-0 rounded-xl p-2.5"
              style={{ background: card.glow, color: card.color }}
            >
              {card.icon}
            </div>
          </div>

          <p
            className="relative mt-3 font-mono text-[10px] leading-snug"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            {card.sub}
          </p>

          {card.trend && (
            <p
              className="relative mt-1 font-mono text-[10px]"
              style={{ color: card.color, opacity: 0.70 }}
            >
              ↑ {card.trend}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
