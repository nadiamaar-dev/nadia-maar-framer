import React, { useCallback, useEffect, useRef, useState } from "react"
import { useBlueprint } from "../../context/BlueprintContext"
import type { ClientHome, OwnProfile, PortalAction } from "../../lib/api"
import {
  fetchClientHome, fetchOwnProfile, subscribe, supabase, SUPABASE_READY,
} from "../../lib/api"
import Shell, { type ShellNavItem } from "../Shell"
import { Btn, DISPLAY, Glass, Icon, Loading, MONO, PortalLogo, T } from "../ui"
import Dossier from "./Dossier"
import Invoices from "./Invoices"
import Meetings from "./Meetings"
import Messages from "./Messages"
import NewProjectModal from "./NewProjectModal"
import Overview from "./Overview"
import Projects from "./Projects"
import Support from "./Support"

const SECTIONS: Omit<ShellNavItem, "badge">[] = [
  { id: "panoramica", label: "Panoramica", icon: "home" },
  { id: "progetti", label: "Progetti", icon: "layers" },
  { id: "riunioni", label: "Riunioni", icon: "calendar" },
  { id: "fatture", label: "Fatture", icon: "invoice" },
  { id: "messaggi", label: "Messaggi", icon: "chat" },
  { id: "supporto", label: "Supporto", icon: "ticket" },
]

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-root" style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, background: "#233D4D", fontFamily: DISPLAY,
    }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #233D4D 0%, #233D4D 55%, #1E3544 100%)" }} />
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "55%", height: "60%", background: "radial-gradient(ellipse, rgba(226,230,238,0.05) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-25%", right: "-12%", width: "60%", height: "70%", background: "radial-gradient(ellipse, rgba(174,83,80,0.08) 0%, transparent 62%)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  )
}

export default function CabinetApp() {
  const { user, loading: authLoading, openAuthModal } = useBlueprint()
  const [home, setHome] = useState<ClientHome | null>(null)
  const [profile, setProfile] = useState<OwnProfile | null>(null)
  const [failed, setFailed] = useState(false)
  const [section, setSection] = useState("panoramica")
  const [projectId, setProjectId] = useState<string | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const userId = user?.id ?? null

  const reload = useCallback(async () => {
    if (!userId) return
    try {
      const [h, p] = await Promise.all([fetchClientHome(userId), fetchOwnProfile(userId)])
      setHome(h)
      setProfile(p)
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }, [userId])

  useEffect(() => {
    setHome(null)
    setProfile(null)
    setFailed(false)
    if (userId) reload()
  }, [userId, reload])

  // Realtime: any change in my rows re-hydrates the whole home payload (debounced).
  useEffect(() => {
    if (!userId) return
    const bump = () => {
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(reload, 400)
    }
    const mine = `client_id=eq.${userId}`
    const unsubs = [
      subscribe("cab-projects", { table: "client_projects", filter: mine }, bump),
      subscribe("cab-stages", { table: "project_stages" }, bump),
      subscribe("cab-events", { table: "project_events", filter: mine }, bump),
      subscribe("cab-convos", { table: "conversations", filter: mine }, bump),
      subscribe("cab-meetings", { table: "meetings", filter: mine }, bump),
      subscribe("cab-invoices", { table: "client_invoices", filter: mine }, bump),
      subscribe("cab-tickets", { table: "support_tickets", filter: mine }, bump),
    ]
    return () => {
      clearTimeout(debounceRef.current)
      unsubs.forEach(u => u())
    }
  }, [userId, reload])

  // Default project when entering Progetti: the active one, else the most recent.
  const defaultProjectId = home
    ? home.projects.find(p => p.status === "active")?.id ?? home.projects[0]?.id ?? null
    : null

  function handleAction(a: PortalAction) {
    if (a.kind === "start_project") {
      setWizardOpen(true)
      return
    }
    setSection(a.section)
    if (a.section === "progetti") setProjectId(a.projectId ?? defaultProjectId)
    else setProjectId(null)
  }

  function handleSelect(id: string) {
    setSection(id)
    if (id === "progetti") setProjectId(prev => prev ?? defaultProjectId)
    else setProjectId(null)
  }

  /* ── Gates ─────────────────────────────────────────────── */
  if (!SUPABASE_READY) {
    return (
      <FullScreen>
        <Glass variant="panel" style={{ padding: 28, maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.copperLt, margin: 0 }}>Configurazione</p>
          <p style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: T.muted, margin: "10px 0 0" }}>
            Supabase non è configurato: aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
          </p>
        </Glass>
      </FullScreen>
    )
  }

  if (authLoading) {
    return <FullScreen><Loading label="Verifico l'accesso" /></FullScreen>
  }

  if (!user) {
    return (
      <FullScreen>
        <Glass variant="panel" style={{ padding: "44px 40px 36px", maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <PortalLogo size={52} id="nm-gate" />
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.2 }}>
            Area Clienti
          </h1>
          <p style={{ fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.65, color: T.muted, margin: "11px 0 0" }}>
            Segui i tuoi progetti in tempo reale — fasi, riunioni, fatture e chat con lo studio, tutto in un unico posto.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
            <Btn variant="primary" icon="lock" onClick={openAuthModal} style={{ width: "100%", justifyContent: "center", padding: "13px 20px", fontSize: 14 }}>
              Accedi al tuo spazio
            </Btn>
            <a href="/" className="portal-link" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px 16px", borderRadius: 10,
              border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.05)",
              fontFamily: DISPLAY, fontSize: 13, fontWeight: 500, color: T.faint, textDecoration: "none",
            }}>
              <Icon name="arrowL" size={13} /> Torna al sito
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 28, paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
            {[
              { icon: "layers" as const, label: "Progetti" },
              { icon: "calendar" as const, label: "Riunioni" },
              { icon: "invoice" as const, label: "Fatture" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(194,86,64,0.08)", border: "1px solid rgba(194,86,64,0.18)", color: T.copper,
                }}>
                  <Icon name={item.icon} size={16} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: T.faint }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Glass>
      </FullScreen>
    )
  }

  if (failed) {
    return (
      <FullScreen>
        <Glass variant="panel" style={{ padding: 28, maxWidth: 400, textAlign: "center" }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 800, color: T.text, margin: 0 }}>Caricamento non riuscito</p>
          <p style={{ fontFamily: DISPLAY, fontSize: 12.5, color: T.faint, margin: "8px 0 18px" }}>Controlla la connessione e riprova.</p>
          <Btn variant="primary" onClick={reload}>Riprova</Btn>
        </Glass>
      </FullScreen>
    )
  }

  if (!home) {
    return <FullScreen><Loading label="Preparo il tuo spazio" /></FullScreen>
  }

  /* ── App ───────────────────────────────────────────────── */
  const badgeFor = (id: string) => home.actions.filter(a => a.section === id).length || undefined
  const items: ShellNavItem[] = SECTIONS.map(s => ({
    ...s,
    badge: s.id === "panoramica" ? undefined : badgeFor(s.id),
  }))

  return (
    <Shell
      items={items}
      active={section}
      onSelect={handleSelect}
      email={profile?.email ?? user.email ?? undefined}
      roleLabel={profile?.companyName ?? profile?.contactName ?? "Cliente"}
      onSignOut={() => { supabase.auth.signOut() }}
      topRight={home.actions.length > 0 ? (
        <button
          onClick={() => setSection("panoramica")}
          className="portal-nav-item"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 12px", borderRadius: 99, cursor: "pointer",
            background: "rgba(174,83,80,0.13)", border: "1px solid rgba(174,83,80,0.32)",
            fontFamily: MONO, fontSize: 10, fontWeight: 700, color: T.copperLt,
          }}
        >
          <Icon name="bolt" size={11} />
          {home.actions.length} da fare
        </button>
      ) : undefined}
    >
      {section === "panoramica" && (
        <Overview
          home={home}
          onAction={handleAction}
          onOpenProject={id => { setSection("progetti"); setProjectId(id) }}
          userName={profile?.contactName ?? profile?.email?.split("@")[0]}
        />
      )}
      {section === "progetti" && (
        home.projects.length === 0
          ? <Projects onNewProject={() => setWizardOpen(true)} />
          : <Dossier
              projectId={projectId ?? defaultProjectId!}
              home={home}
              userId={user.id}
              onSwitchProject={setProjectId}
              onNewProject={() => setWizardOpen(true)}
              reload={reload}
            />
      )}
      {section === "riunioni" && <Meetings home={home} userId={user.id} reload={reload} />}
      {section === "fatture" && <Invoices home={home} />}
      {section === "messaggi" && <Messages home={home} userId={user.id} reload={reload} />}
      {section === "supporto" && <Support home={home} userId={user.id} reload={reload} />}

      <NewProjectModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        userId={user.id}
        profile={profile}
        reload={reload}
      />
    </Shell>
  )
}
