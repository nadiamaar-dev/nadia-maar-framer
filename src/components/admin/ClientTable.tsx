import React, { useState, useMemo } from "react"
import type { ClientRecord, ClientStatus, ClientPlan } from "../../data/adminData"

interface ClientTableProps {
  clients: ClientRecord[]
  onSelectClient: (client: ClientRecord | null) => void
  selectedClient: ClientRecord | null
}

/* ─── Config maps ─────────────────────────────────────────────── */
const STATUS_CFG: Record<ClientStatus, { label: string; color: string; dot: string }> = {
  active:     { label: "Attivo",      color: "#10B981", dot: "#10B981" },
  onboarding: { label: "Onboarding",  color: "rgba(200,185,110,0.95)", dot: "rgba(200,185,110,0.95)" },
  paused:     { label: "In Pausa",    color: "rgba(255,255,255,0.35)", dot: "rgba(255,255,255,0.25)" },
}

const PLAN_CFG: Record<ClientPlan, { label: string; color: string }> = {
  starter:    { label: "Starter",    color: "rgba(255,255,255,0.35)" },
  pro:        { label: "Pro",        color: "#B04A38" },
  enterprise: { label: "Enterprise", color: "rgba(200,185,110,0.95)" },
}

const fmt = (n: number) =>
  n === 0 ? "—" : new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

type SortKey = keyof Pick<ClientRecord, "company" | "plan" | "status" | "projectsActive" | "invoicesPending" | "ticketsOpen" | "lastActivity">
type SortDir = "asc" | "desc"

/* ─── Sub-components ─────────────────────────────────────────── */
function StatusPill({ status }: { status: ClientStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]"
      style={{
        color: cfg.color,
        background: `${cfg.dot}18`,
        border: `1px solid ${cfg.dot}35`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

function PlanBadge({ plan }: { plan: ClientPlan }) {
  const cfg = PLAN_CFG[plan]
  return (
    <span
      className="rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em]"
      style={{ color: cfg.color, background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}
    >
      {cfg.label}
    </span>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide"
      style={{
        color: "rgba(255,255,255,0.38)",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {label}
    </span>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
      {active && dir === "desc" ? "↓" : "↑"}
    </span>
  )
}

/* ─── Detail Drawer ──────────────────────────────────────────── */
function ClientDrawer({ client, onClose }: { client: ClientRecord; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Drawer panel */}
      <div
        className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto"
        style={{
          background: "rgba(18,22,30,0.95)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderLeft: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.50)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div
          className="flex items-start justify-between border-b p-6"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div>
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: "#B04A38" }}>
              Profilo Cliente
            </p>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-white">
              {client.company}
            </h2>
            <p className="mt-1 font-mono text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
              {client.contact} · {client.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 rounded-lg p-2 transition-colors"
            style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-6">

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={client.status} />
            <PlanBadge plan={client.plan} />
            {client.tags.map(t => <Tag key={t} label={t} />)}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Progetti attivi",   value: client.projectsActive || "—",          color: "#B04A38" },
              { label: "Fatture in attesa",  value: fmt(client.invoicePendingAmount),       color: "rgba(200,185,110,0.95)" },
              { label: "Ticket aperti",     value: client.ticketsOpen || "—",              color: client.ticketsOpen > 0 ? "#E05050" : "rgba(255,255,255,0.40)" },
              { label: "Ultima attività",   value: client.lastActivity,                    color: "rgba(255,255,255,0.70)" },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.28)" }}>
                  {s.label}
                </p>
                <p className="font-mono text-sm font-bold" style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Info rows */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>
              Dettagli Account
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { k: "Piano",       v: PLAN_CFG[client.plan].label },
                { k: "Stato",       v: STATUS_CFG[client.status].label },
                { k: "Cliente dal", v: client.joinedAt },
                { k: "Email",       v: client.email },
              ].map(row => (
                <div key={row.k} className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                    {row.k}
                  </span>
                  <span className="font-mono text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {row.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5">
            <a
              href={`mailto:${client.email}`}
              className="flex items-center justify-center gap-2 rounded-xl py-3 font-display text-[13px] font-bold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78))",
                border: "1px solid rgba(176,74,56,0.55)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Invia Email
            </a>
            <button
              className="flex items-center justify-center gap-2 rounded-xl border py-3 font-display text-[13px] font-semibold transition-colors"
              style={{
                borderColor: "rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.45)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Modifica Profilo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main table ─────────────────────────────────────────────── */
export default function ClientTable({ clients, onSelectClient, selectedClient }: ClientTableProps) {
  const [search,  setSearch]  = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("company")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all")

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const filtered = useMemo(() => {
    let list = clients
    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.company.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [clients, search, sortKey, sortDir, statusFilter])

  const colHdr = (label: string, key: SortKey) => (
    <th
      key={key}
      className="group cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left font-mono text-[9px] uppercase tracking-[0.18em] transition-colors"
      style={{ color: sortKey === key ? "#B04A38" : "rgba(255,255,255,0.28)" }}
      onClick={() => toggleSort(key)}
    >
      {label}
      <SortIcon active={sortKey === key} dir={sortDir} />
    </th>
  )

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Cerca cliente, tag, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl py-2.5 pl-10 pr-4 font-mono text-[12px] outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.80)",
            }}
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2">
          {(["all", "active", "onboarding", "paused"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] transition-all"
              style={{
                background: statusFilter === s ? "rgba(176,74,56,0.14)" : "transparent",
                border: `1px solid ${statusFilter === s ? "rgba(176,74,56,0.38)" : "rgba(255,255,255,0.09)"}`,
                color: statusFilter === s ? "#D4695A" : "rgba(255,255,255,0.35)",
              }}
            >
              {s === "all" ? "Tutti" : STATUS_CFG[s].label}
            </button>
          ))}
        </div>

        <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          {filtered.length} risultat{filtered.length === 1 ? "o" : "i"}
        </span>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "rgba(22,27,34,0.60)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {colHdr("Azienda",  "company")}
                {colHdr("Piano",    "plan")}
                {colHdr("Stato",    "status")}
                {colHdr("Progetti", "projectsActive")}
                {colHdr("Fatture",  "invoicesPending")}
                {colHdr("Ticket",   "ticketsOpen")}
                {colHdr("Attività", "lastActivity")}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center font-mono text-sm" style={{ color: "rgba(255,255,255,0.22)" }}>
                    Nessun cliente trovato
                  </td>
                </tr>
              ) : (
                filtered.map((client, idx) => {
                  const isSelected = selectedClient?.id === client.id
                  return (
                    <tr
                      key={client.id}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        background: isSelected ? "rgba(176,74,56,0.08)" : undefined,
                      }}
                      onClick={() => onSelectClient(isSelected ? null : client)}
                      onMouseEnter={e => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = ""
                      }}
                    >
                      {/* Company */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="font-display text-[13px] font-semibold text-white leading-tight">
                            {client.company}
                          </span>
                          <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.32)" }}>
                            {client.contact}
                          </span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3.5">
                        <PlanBadge plan={client.plan} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusPill status={client.status} />
                      </td>

                      {/* Projects */}
                      <td className="px-4 py-3.5">
                        <span
                          className="font-mono text-sm font-bold"
                          style={{ color: client.projectsActive > 0 ? "#B04A38" : "rgba(255,255,255,0.25)" }}
                        >
                          {client.projectsActive || "—"}
                        </span>
                      </td>

                      {/* Invoices */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className="font-mono text-sm font-bold"
                            style={{ color: client.invoicesPending > 0 ? "rgba(200,185,110,0.95)" : "rgba(255,255,255,0.25)" }}
                          >
                            {client.invoicesPending > 0 ? client.invoicesPending : "—"}
                          </span>
                          {client.invoicePendingAmount > 0 && (
                            <span className="font-mono text-[10px]" style={{ color: "rgba(200,185,110,0.55)" }}>
                              {fmt(client.invoicePendingAmount)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tickets */}
                      <td className="px-4 py-3.5">
                        <span
                          className="font-mono text-sm font-bold"
                          style={{ color: client.ticketsOpen > 0 ? "#E05050" : "rgba(255,255,255,0.25)" }}
                        >
                          {client.ticketsOpen > 0 ? client.ticketsOpen : "—"}
                        </span>
                      </td>

                      {/* Activity */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {client.lastActivity}
                        </span>
                      </td>

                      {/* Arrow */}
                      <td className="px-4 py-3.5">
                        <span
                          className="font-mono text-[13px] transition-colors"
                          style={{ color: isSelected ? "#B04A38" : "rgba(255,255,255,0.20)" }}
                        >
                          {isSelected ? "×" : "→"}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tags summary */}
      <div className="flex flex-wrap gap-2">
        {[...new Set(clients.flatMap(c => c.tags))].map(tag => (
          <button
            key={tag}
            onClick={() => setSearch(tag)}
            className="rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors hover:border-white/20 hover:text-white/55"
            style={{
              color: "rgba(255,255,255,0.28)",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Drawer */}
      {selectedClient && (
        <ClientDrawer client={selectedClient} onClose={() => onSelectClient(null)} />
      )}
    </div>
  )
}
