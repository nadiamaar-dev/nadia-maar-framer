import React, { useEffect, useState } from "react"
import Background from "./components/Background"
import { useBlueprint } from "./context/BlueprintContext"
import { supabase, SUPABASE_READY } from "./lib/supabase"
import AdminApp from "./portal/admin/AdminApp"

const MONO    = "'JetBrains Mono',monospace"

/* Reads role from public.profiles and routes:
   - not logged in → /
   - client        → /cabinet
   - admin         → admin panel (inline, until digital-cantiere is deployed) */
export default function DashboardGate() {
  const { user, loading: authLoading } = useBlueprint()
  const [role, setRole]   = useState<"admin" | "client" | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      window.location.replace("/")
      return
    }

    /* Without Supabase there is no role to read, so nothing can be
       authorised — this used to fall through and render the admin panel. */
    if (!SUPABASE_READY) { setRole(null); setReady(true); return }

    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(
        ({ data }) => {
          const r = (data?.role as "admin" | "client") ?? "client"
          if (r === "client") {
            window.location.replace("/cabinet")
          } else {
            setRole("admin")
            setReady(true)
          }
        },
        () => window.location.replace("/"),
      )
  }, [user, authLoading])

  /* Loading state */
  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#060C18", position: "relative",
      }}>
        <Background />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "2px solid rgba(184,50,64,0.25)",
            borderTopColor: "#B83240",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", color: "#FFFFFF", textTransform: "uppercase" }}>
            Verifica accesso...
          </span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    )
  }

  /* Admin panel — only when the profile actually said so. The role was
     fetched but never read here, so this returned AdminApp unconditionally.
     RLS still gated the data, but the shell should not render at all. */
  if (role !== "admin") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#060C18", position: "relative", padding: 24, textAlign: "center",
      }}>
        <Background />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 360 }}>
          <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", color: "#E4697A", textTransform: "uppercase", margin: 0 }}>
            Accesso negato
          </p>
          <p style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.82)", margin: "12px 0 20px" }}>
            Questa pagina è riservata allo studio. La tua area è in /cabinet.
          </p>
          <a href="/cabinet" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFFFFF" }}>
            [ Vai alla tua area ]
          </a>
        </div>
      </div>
    )
  }

  return <AdminApp />
}
