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

    if (!SUPABASE_READY) { setRole("client"); setReady(true); return }

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
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.37)", textTransform: "uppercase" }}>
            Verifica accesso...
          </span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    )
  }

  /* Admin panel */
  return <AdminApp />
}
