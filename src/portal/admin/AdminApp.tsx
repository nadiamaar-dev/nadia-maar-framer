import React, { useCallback, useEffect, useRef, useState } from "react"
import Background from "../../components/Background"
import { useBlueprint } from "../../context/BlueprintContext"
import type { AdminHome, ClientRecord, PortalAction } from "../../lib/api"
import type { FoundryLead } from "../../lib/api"
import { fetchAdminHome, fetchClients, fetchLeads, subscribe, supabase } from "../../lib/api"
import ErrorBoundary from "../ErrorBoundary"
import Shell, { type ShellNavItem } from "../Shell"
import { useHashRoute } from "../useHashRoute"
import { Btn, DISPLAY, Glass, Icon, Loading, MONO, T } from "../ui"
import Billing from "./Billing"
import Clients from "./Clients"
import ClientWorkspace from "./ClientWorkspace"
import LeadsAdmin from "./LeadsAdmin"
import DossierAdmin from "./DossierAdmin"
import MeetingsAdmin from "./MeetingsAdmin"
import InboxAdmin from "./InboxAdmin"
import Overview from "./Overview"
import SettingsAdmin from "./SettingsAdmin"
import ProjectsBoard from "./ProjectsBoard"

const SECTIONS: Omit<ShellNavItem, "badge">[] = [
  { id: "panoramica", label: "Panoramica", icon: "home" },
  { id: "clienti", label: "Clienti", icon: "users" },
  { id: "progetti", label: "Progetti", icon: "layers" },
  { id: "riunioni", label: "Riunioni", icon: "calendar" },
  { id: "fatturazione", label: "Fatturazione", icon: "invoice" },
  { id: "inbox", label: "Inbox", icon: "chat" },
  { id: "lead", label: "Lead", icon: "bolt" },
  { id: "impostazioni", label: "Impostazioni", icon: "lock" },
]

const SECTION_IDS = SECTIONS.map(s => s.id)

const WATCHED_TABLES = [
  "profiles", "client_projects", "project_stages", "project_events",
  "conversations", "meetings", "client_invoices", "support_tickets", "foundry_leads",
  /* client-driven tables: without these, a client upload or a signature
     lands silently and the admin only sees it after a manual reload */
  "client_assets", "client_documents",
]

export default function AdminApp() {
  const { user } = useBlueprint()
  const [home, setHome] = useState<AdminHome | null>(null)
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [leads, setLeads] = useState<FoundryLead[]>([])
  const [failed, setFailed] = useState(false)
  /* same reason as the cabinet: F5 and Back used to dump you on the
     overview, and a project could not be linked to.
     Under `clienti` the first segment is the client and the second, when
     present, is one of their projects: `#clienti/<cliente>/<progetto>`. The
     dossier then opens *inside* the client instead of throwing you into the
     global project list, where nothing says whose project you are editing. */
  const { section, id: routeId, sub, go } = useHashRoute("panoramica", SECTION_IDS)
  const projectId = section === "clienti" ? sub : routeId
  const clientId = section === "clienti" ? routeId : null
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const reload = useCallback(async () => {
    try {
      const [h, c, l] = await Promise.all([
        fetchAdminHome(),
        fetchClients(),
        /* la tabella potrebbe non esistere ancora (migrazione non applicata):
           in quel caso la sezione resta vuota invece di far fallire tutto */
        fetchLeads().catch(() => [] as FoundryLead[]),
      ])
      setHome(h)
      setClients(c)
      setLeads(l)
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
    go(a.section, a.section === "progetti" ? a.projectId ?? null : a.focusId ?? null)
  }

  /* Cambiare sezione dal menù azzera il record aperto. Prima «Progetti» dal
     menù riapriva il dossier in cui si era già, cioè non faceva niente;
     adesso riporta all'elenco, che è l'unica cosa che quel comando può
     ragionevolmente voler dire. */
  function handleSelect(id: string) {
    go(id, null)
  }

  if (failed) {
    return (
      <div className="portal-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: DISPLAY, position: "relative" }}>
        <Background />
        <Glass variant="panel" style={{ padding: 28, maxWidth: 400, textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 800, color: T.text, margin: 0 }}>Caricamento non riuscito</p>
          <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 12.5, color: T.secondary, margin: "8px 0 18px" }}>Controlla la connessione e riprova.</p>
          <Btn variant="primary" onClick={reload}>Riprova</Btn>
        </Glass>
      </div>
    )
  }

  if (!home || !user) {
    return (
      <div className="portal-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, position: "relative" }}>
        <Background />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Loading label="Apro lo studio" />
        </div>
      </div>
    )
  }

  /* Cercato per id e non tenuto in stato: dopo un reload i dati sono nuovi e
     una copia in stato sarebbe quella vecchia — badge e conteggi della scheda
     resterebbero fermi mentre il resto della pagina si aggiorna. */
  const selectedClient = clientId ? clients.find(c => c.id === clientId) : undefined

  const newLeads = leads.filter(l => l.status === "new").length
  const badgeFor = (id: string) =>
    id === "lead" ? newLeads || undefined : home.actions.filter(a => a.section === id).length || undefined
  const items: ShellNavItem[] = SECTIONS.map(s => ({
    ...s,
    badge: s.id === "panoramica" ? undefined : badgeFor(s.id),
  }))

  return (
    <Shell
      items={items}
      active={section}
      onSelect={handleSelect}
      email={user.email ?? undefined}
      roleLabel="Amministratore"
      areaLabel="Studio"
      onSignOut={() => { supabase.auth.signOut().then(() => window.location.replace("/")) }}
      topRight={home.actions.length > 0 && section !== "panoramica" ? (
        <button
          onClick={() => go("panoramica")}
          className="portal-nav-item"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 14px", borderRadius: 99, cursor: "pointer",
            background: "rgba(184,50,64,0.14)", border: "1px solid rgba(184,50,64,0.32)",
            fontFamily: MONO, fontSize: 11, fontWeight: 700, color: T.copperTx,
          }}
        >
          <Icon name="bell" size={11} />
          {home.actions.length} in coda
        </button>
      ) : undefined}
    >
      <ErrorBoundary resetKey={`${section}:${clientId ?? ""}:${projectId ?? ""}`}>
        {section === "panoramica" && <Overview home={home} onAction={handleAction} onGo={s => go(s, null)} />}
        {section === "lead" && <LeadsAdmin leads={leads} reload={reload} />}
        {section === "clienti" && (
          selectedClient ? (
            projectId ? (
              <DossierAdmin
                projectId={projectId}
                home={home}
                adminId={user.id}
                backLabel={selectedClient.company}
                onBack={() => go("clienti", selectedClient.id)}
                reload={reload}
              />
            ) : (
              <ClientWorkspace
                client={selectedClient}
                home={home}
                adminId={user.id}
                onBack={() => go("clienti", null)}
                reload={reload}
                onOpenProject={id => go("clienti", selectedClient.id, id)}
              />
            )
          ) : (
            <Clients clients={clients} home={home} onOpen={id => go("clienti", id)} />
          )
        )}
        {section === "progetti" && (
          projectId
            ? <DossierAdmin projectId={projectId} home={home} adminId={user.id} onBack={() => go("progetti")} reload={reload} />
            : <ProjectsBoard home={home} onOpenProject={id => go("progetti", id)} />
        )}
        {section === "riunioni" && <MeetingsAdmin home={home} clients={clients} reload={reload} />}
        {section === "fatturazione" && <Billing home={home} clients={clients} reload={reload} />}
        {section === "impostazioni" && <SettingsAdmin />}
        {section === "inbox" && <InboxAdmin home={home} adminId={user.id} reload={reload} focusId={section === "inbox" ? routeId : null} />}
      </ErrorBoundary>
    </Shell>
  )
}
