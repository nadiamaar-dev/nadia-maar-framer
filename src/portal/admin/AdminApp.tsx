import React, { useCallback, useEffect, useRef, useState } from "react"
import { useBlueprint } from "../../context/BlueprintContext"
import type { AdminHome, ClientRecord, PortalAction } from "../../lib/api"
import { fetchAdminHome, fetchClients, subscribe, supabase } from "../../lib/api"
import Shell, { type ShellNavItem } from "../Shell"
import { Btn, DISPLAY, Glass, Icon, Loading, MONO, T } from "../ui"
import Billing from "./Billing"
import Clients from "./Clients"
import DossierAdmin from "./DossierAdmin"
import MeetingsAdmin from "./MeetingsAdmin"
import MessagesAdmin from "./MessagesAdmin"
import Overview from "./Overview"
import ProjectsBoard from "./ProjectsBoard"
import SupportAdmin from "./SupportAdmin"

const SECTIONS: Omit<ShellNavItem, "badge">[] = [
  { id: "panoramica", label: "Panoramica", icon: "home" },
  { id: "clienti", label: "Clienti", icon: "users" },
  { id: "progetti", label: "Progetti", icon: "layers" },
  { id: "riunioni", label: "Riunioni", icon: "calendar" },
  { id: "fatturazione", label: "Fatturazione", icon: "invoice" },
  { id: "messaggi", label: "Messaggi", icon: "chat" },
  { id: "supporto", label: "Supporto", icon: "ticket" },
]

const WATCHED_TABLES = [
  "profiles", "client_projects", "project_stages", "project_events",
  "conversations", "meetings", "client_invoices", "support_tickets",
]

export default function AdminApp() {
  const { user } = useBlueprint()
  const [home, setHome] = useState<AdminHome | null>(null)
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [failed, setFailed] = useState(false)
  const [section, setSection] = useState("panoramica")
  const [projectId, setProjectId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const reload = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([fetchAdminHome(), fetchClients()])
      setHome(h)
      setClients(c)
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    const bump = () => {
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(reload, 500)
    }
    const unsubs = WATCHED_TABLES.map(t => subscribe(`adm-${t}`, { table: t }, bump))
    return () => {
      clearTimeout(debounceRef.current)
      unsubs.forEach(u => u())
    }
  }, [reload])

  function handleAction(a: PortalAction) {
    setSection(a.section)
    setProjectId(a.section === "progetti" ? a.projectId ?? null : null)
  }

  function handleSelect(id: string) {
    setSection(id)
    if (id !== "progetti") setProjectId(null)
  }

  if (failed) {
    return (
      <div className="portal-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: DISPLAY }}>
        <Glass variant="panel" style={{ padding: 28, maxWidth: 400, textAlign: "center" }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 800, color: T.text, margin: 0 }}>Caricamento non riuscito</p>
          <p style={{ fontFamily: DISPLAY, fontSize: 12.5, color: T.faint, margin: "8px 0 18px" }}>Controlla la connessione e riprova.</p>
          <Btn variant="primary" onClick={reload}>Riprova</Btn>
        </Glass>
      </div>
    )
  }

  if (!home || !user) {
    return (
      <div className="portal-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <Loading label="Apro lo studio" />
      </div>
    )
  }

  const badgeFor = (id: string) => home.actions.filter(a => a.section === id).length || undefined
  const items: ShellNavItem[] = SECTIONS.map(s => ({
    ...s,
    badge: s.id === "panoramica" ? undefined : badgeFor(s.id),
  }))

  return (
    <Shell
      brandMark="NM"
      brandName="Nadia Maar"
      roleTag="Studio Admin"
      items={items}
      active={section}
      onSelect={handleSelect}
      email={user.email ?? undefined}
      roleLabel="Amministratore"
      onSignOut={() => { supabase.auth.signOut().then(() => window.location.replace("/")) }}
      topRight={home.actions.length > 0 ? (
        <button
          onClick={() => setSection("panoramica")}
          className="portal-nav-item"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 12px", borderRadius: 99, cursor: "pointer",
            background: "rgba(176,74,56,0.13)", border: "1px solid rgba(176,74,56,0.32)",
            fontFamily: MONO, fontSize: 10, fontWeight: 700, color: T.copperLt,
          }}
        >
          <Icon name="bell" size={11} />
          {home.actions.length} in coda
        </button>
      ) : undefined}
    >
      {section === "panoramica" && <Overview home={home} onAction={handleAction} />}
      {section === "clienti" && (
        <Clients
          clients={clients}
          home={home}
          adminId={user.id}
          reload={reload}
          onOpenProject={id => { setSection("progetti"); setProjectId(id) }}
        />
      )}
      {section === "progetti" && (
        projectId
          ? <DossierAdmin projectId={projectId} home={home} adminId={user.id} onBack={() => setProjectId(null)} reload={reload} />
          : <ProjectsBoard home={home} onOpenProject={setProjectId} />
      )}
      {section === "riunioni" && <MeetingsAdmin home={home} clients={clients} reload={reload} />}
      {section === "fatturazione" && <Billing home={home} clients={clients} reload={reload} />}
      {section === "messaggi" && <MessagesAdmin home={home} adminId={user.id} reload={reload} />}
      {section === "supporto" && <SupportAdmin home={home} reload={reload} />}
    </Shell>
  )
}
