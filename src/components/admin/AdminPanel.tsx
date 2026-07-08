import React, { useEffect, useRef, useState } from "react"
import KpiCards          from "./KpiCards"
import ClientTable       from "./ClientTable"
import TaskManager       from "./TaskManager"
import ProjectManager    from "./ProjectManager"
import DocumentManager   from "./DocumentManager"
import SupportCenter     from "./SupportCenter"
import MeetingManager    from "./MeetingManager"
import { MOCK_CLIENTS, MOCK_KPI, type ClientRecord, type AdminKpi } from "../../data/adminData"
import { fetchClients, fetchKpi, countPendingProjects } from "../../lib/adminApi"
import { supabase, SUPABASE_READY } from "../../lib/supabase"

interface AdminPanelProps {
  userEmail?: string
}

type NavSection = "crm" | "projects" | "invoices" | "meetings" | "support" | "settings"

interface NavItem { id: NavSection; label: string; icon: React.ReactNode }

const NAV_ITEMS: NavItem[] = [
  {
    id: "crm",
    label: "CRM Clienti",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    id: "projects",
    label: "Progetti",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  },
  {
    id: "invoices",
    label: "Fatturazione",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/></svg>,
  },
  {
    id: "meetings",
    label: "Riunioni",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  },
  {
    id: "support",
    label: "Supporto",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
  {
    id: "settings",
    label: "Impostazioni",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  },
]

/* ─── Placeholder content for non-CRM sections ───────────────── */
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl py-24 font-display" style={{ border: "1px dashed rgba(255,255,255,0.10)" }}>
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "rgba(176,74,56,0.10)", border: "1px solid rgba(176,74,56,0.20)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#B04A38" strokeWidth="1.5" className="h-7 w-7">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <p className="text-base font-bold text-white/60">{label}</p>
      <p className="mt-1 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
        Sezione in sviluppo
      </p>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
export default function AdminPanel({ userEmail }: AdminPanelProps) {
  const [activeSection,   setActiveSection]   = useState<NavSection>("crm")
  const [selectedClient,  setSelectedClient]  = useState<ClientRecord | null>(null)
  const [sidebarOpen,     setSidebarOpen]     = useState(false)
  const [clients,         setClients]         = useState<ClientRecord[]>(MOCK_CLIENTS)
  const [kpi,             setKpi]             = useState<AdminKpi>(MOCK_KPI)
  const [crmLoading,      setCrmLoading]      = useState(true)
  const [pendingCount,    setPendingCount]    = useState(0)
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchClients(), fetchKpi(), countPendingProjects()])
      .then(([c, k, pending]) => {
        if (cancelled) return
        setClients(c)
        setKpi(k)
        setPendingCount(pending)
      })
      .catch(() => { /* keep mock fallback on error */ })
      .finally(() => { if (!cancelled) setCrmLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Realtime: update pending badge when a client submits a new project
  useEffect(() => {
    if (!SUPABASE_READY) return
    const ch = supabase
      .channel("admin-pending-projects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_projects" },
        () => { countPendingProjects().then(setPendingCount) }
      )
      .subscribe()
    realtimeRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div
      className="admin-root flex h-screen overflow-hidden"
      style={{ background: "#0E1118", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}
    >

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-60 flex-col
          lg:relative lg:translate-x-0
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: "rgba(14,17,24,0.90)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold"
            style={{ background: "rgba(176,74,56,0.20)", border: "1px solid rgba(176,74,56,0.35)", color: "#D4695A" }}
          >
            DC
          </div>
          <div>
            <p className="font-display text-[13px] font-bold text-white leading-tight">Digital Cantiere</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.28)" }}>
              Admin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id
            const badge = item.id === "projects" && pendingCount > 0 ? pendingCount : 0
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all"
                style={{
                  background: isActive ? "rgba(176,74,56,0.14)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(176,74,56,0.28)" : "transparent"}`,
                  color: isActive ? "#D4695A" : "rgba(255,255,255,0.38)",
                }}
              >
                <span>{item.icon}</span>
                <span className="flex-1 font-display text-[13px] font-semibold">{item.label}</span>
                {badge > 0 && (
                  <span
                    className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                    style={{ background: "rgba(200,185,110,0.90)", color: "#1a1400" }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mb-2 flex items-center gap-2.5 px-3 py-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold uppercase"
              style={{ background: "rgba(176,74,56,0.20)", color: "#B04A38" }}
            >
              {userEmail?.[0] ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.60)" }}>
                {userEmail ?? "Admin"}
              </p>
              <p className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-display text-[12px] font-semibold transition-colors"
            style={{
              color: "rgba(255,255,255,0.30)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Disconnetti
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header
          className="flex shrink-0 items-center justify-between px-6 py-3.5"
          style={{
            background: "rgba(14,17,24,0.80)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              className="rounded-lg p-1.5 transition-colors lg:hidden"
              style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.05)" }}
              onClick={() => setSidebarOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>

            <div>
              <h1
                className="font-display text-base font-extrabold leading-tight tracking-tight text-white"
              >
                {NAV_ITEMS.find(n => n.id === activeSection)?.label}
              </h1>
              <p className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Right: status + client link */}
          <div className="flex items-center gap-3">
            <a
              href="/cabinet"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors"
              style={{ color: "rgba(255,255,255,0.28)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
              Portale
            </a>
            <div
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px]"
              style={{ color: "#10B981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.20)" }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#10B981" }} />
              Online
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-[1280px] space-y-6">

            {activeSection === "crm" && (
              <>
                {/* Section label */}
                <div>
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: "#B04A38" }}>
                    Dashboard
                  </p>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
                    Panoramica Agenzia
                  </h2>
                  <p className="mt-1 font-display text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {crmLoading ? "Caricamento…" : `${kpi.activeClients} clienti attivi · ${kpi.projectsInProgress} progetti in corso`}
                  </p>
                </div>

                <KpiCards kpi={kpi} />

                {/* Divider */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="font-display text-base font-bold text-white">Lista Clienti</div>
                  <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <span className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wide" style={{ background: "rgba(176,74,56,0.12)", color: "#D4695A", border: "1px solid rgba(176,74,56,0.25)" }}>
                    {crmLoading ? "…" : `${clients.length} clienti`}
                  </span>
                </div>

                <ClientTable
                  clients={clients}
                  selectedClient={selectedClient}
                  onSelectClient={setSelectedClient}
                  onClientUpdated={c => setClients(prev => prev.map(x => x.id === c.id ? c : x))}
                />
              </>
            )}

            {activeSection === "projects"  && <ProjectManager />}
            {activeSection === "invoices"  && <DocumentManager />}
            {activeSection === "meetings"  && <MeetingManager />}
            {activeSection === "support"   && <SupportCenter />}
            {activeSection === "settings"  && <ComingSoon label="Impostazioni" />}

          </div>
        </main>
      </div>
    </div>
  )
}
