import React, { useEffect, useState } from "react"
import { useBlueprint } from "./context/BlueprintContext"
import { supabase, SUPABASE_READY } from "./lib/supabase"

const MONO    = "'JetBrains Mono',monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"

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
      .then(({ data }) => {
        const r = (data?.role as "admin" | "client") ?? "client"
        if (r === "client") {
          window.location.replace("/cabinet")
        } else {
          setRole("admin")
          setReady(true)
        }
      })
      .catch(() => window.location.replace("/"))
  }, [user, authLoading])

  /* Loading state */
  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#161B22",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "2px solid rgba(176,74,56,0.25)",
            borderTopColor: "#B04A38",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase" }}>
            Verifica accesso...
          </span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    )
  }

  /* Admin panel */
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: DISPLAY }}>

      {/* Top bar */}
      <div style={{
        height: 56, background: "#fff",
        borderBottom: "1px solid #e9ecef",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: "#8c3525", letterSpacing: "0.1em" }}>DC</span>
          <span style={{ width: 1, height: 14, background: "#dee2e6" }} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: "#868e96", letterSpacing: "0.12em", textTransform: "uppercase" }}>Admin Panel</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: "#adb5bd" }}>{user?.email}</span>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/" }}
            style={{
              padding: "6px 14px", borderRadius: 7,
              border: "1px solid #dee2e6", background: "#f8f9fa",
              fontFamily: MONO, fontSize: 10, cursor: "pointer", color: "#495057",
            }}
          >
            Esci
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px" }}>
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#adb5bd", marginBottom: 8 }}>
          Digital Cantiere
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#212529", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Bentornata, Admin.
        </h1>
        <p style={{ fontSize: 14, color: "#868e96", margin: "0 0 40px" }}>
          Accesso confermato. Il portale completo Digital Cantiere è in fase di deploy.
        </p>

        {/* Status card */}
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1px solid #e9ecef", padding: "28px 32px",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: "#10B981", letterSpacing: "0.1em" }}>
              AUTENTICAZIONE OK
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "UID",   value: user?.id ?? "—" },
              { label: "Email", value: user?.email ?? "—" },
              { label: "Ruolo", value: "admin" },
              { label: "Stato", value: "Attivo" },
            ].map(item => (
              <div key={item.label} style={{ padding: "12px 16px", background: "#f8f9fa", borderRadius: 10 }}>
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#adb5bd", marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, color: "#212529", wordBreak: "break-all" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "Foundry",    sub: "Sandbox componenti",  href: "/foundry",  accent: "#8c3525" },
            { label: "Supabase",   sub: "Database & Auth",     href: "https://supabase.com/dashboard/project/htzgtdmetfecxbygebkb", accent: "#3ecf8e" },
          ].map(item => (
            <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
              style={{
                display: "flex", flexDirection: "column", gap: 4,
                padding: "20px 24px", borderRadius: 12,
                border: "1px solid #e9ecef", background: "#fff",
                textDecoration: "none", transition: "border-color 0.18s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = item.accent)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#e9ecef")}
            >
              <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "#212529" }}>{item.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#adb5bd" }}>{item.sub}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
