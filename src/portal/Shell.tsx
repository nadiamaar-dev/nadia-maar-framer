import React, { useState } from "react"
import { Avatar, DISPLAY, Icon, MONO, PortalLogo, T, type IconName } from "./ui"

export interface ShellNavItem {
  id: string
  label: string
  icon: IconName
  badge?: number
}

/* Layered graphite backdrop: neutral base, one silver bloom, one copper ember, technical grid. */
function Backdrop() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: T.bg }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #131316 0%, #141418 60%, #161412 100%)",
      }} />
      <div style={{
        position: "absolute", top: "-20%", left: "-10%", width: "55%", height: "60%",
        background: "radial-gradient(ellipse, rgba(226,230,238,0.055) 0%, transparent 65%)",
      }} />
      <div style={{
        position: "absolute", bottom: "-25%", right: "-12%", width: "60%", height: "70%",
        background: "radial-gradient(ellipse, rgba(176,74,56,0.075) 0%, transparent 62%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, opacity: 0.05,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 42%, transparent 55%, rgba(10,10,13,0.55) 100%)",
      }} />
    </div>
  )
}

export default function Shell({
  brandName, roleTag, items, active, onSelect,
  email, roleLabel, onSignOut, topRight, children,
}: {
  brandName: string
  roleTag: string
  items: ShellNavItem[]
  active: string
  onSelect: (id: string) => void
  email?: string
  roleLabel: string
  onSignOut: () => void
  topRight?: React.ReactNode
  children: React.ReactNode
}) {
  const [drawer, setDrawer] = useState(false)
  const current = items.find(i => i.id === active)

  const sidebar = (
    <>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "22px 20px 20px", borderBottom: `1px solid ${T.border}` }}>
        <PortalLogo size={34} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            {brandName}
          </p>
          <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.faint, margin: "3px 0 0" }}>
            {roleTag}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "16px 12px", overflowY: "auto" }}>
        {items.map(item => {
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); setDrawer(false) }}
              className={isActive ? undefined : "portal-nav-item"}
              style={{
                display: "flex", alignItems: "center", gap: 13,
                padding: "13px 14px", borderRadius: 12, textAlign: "left",
                background: isActive ? "rgba(176,74,56,0.16)" : "transparent",
                border: `1px solid ${isActive ? "rgba(176,74,56,0.34)" : "transparent"}`,
                boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.10)" : "none",
                color: isActive ? T.copperLt : T.muted,
                cursor: "pointer",
              }}
            >
              <Icon name={item.icon} size={18} />
              <span style={{ flex: 1, fontFamily: DISPLAY, fontSize: 15, fontWeight: 700 }}>{item.label}</span>
              {(item.badge ?? 0) > 0 && (
                <span style={{
                  minWidth: 20, height: 20, padding: "0 6px", borderRadius: 99,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? "rgba(212,105,90,0.90)" : "rgba(176,74,56,0.80)",
                  color: "#FFF", fontFamily: MONO, fontSize: 10.5, fontWeight: 700,
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: "15px 14px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 6px 14px" }}>
          <Avatar name={email ?? "?"} size={36} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: T.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {email ?? "—"}
            </p>
            <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint, margin: "3px 0 0" }}>
              {roleLabel}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href="/"
            className="portal-nav-item"
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 12px", borderRadius: 11, textDecoration: "none",
              border: `1px solid ${T.borderHi}`, background: "rgba(255,255,255,0.06)",
              fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700, color: T.muted,
            }}
          >
            <Icon name="home" size={15} />
            Sito
          </a>
          <button
            onClick={onSignOut}
            className="portal-nav-item"
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 12px", borderRadius: 11,
              border: `1px solid ${T.borderHi}`, background: "rgba(255,255,255,0.06)",
              fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700, color: T.muted, cursor: "pointer",
            }}
          >
            <Icon name="logout" size={15} />
            Esci
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="portal-root" style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg, fontFamily: DISPLAY }}>
      <Backdrop />

      {/* Desktop sidebar — solid, not glass */}
      <aside
        className="hidden lg:flex"
        style={{
          position: "relative", zIndex: 2, width: 268, flexShrink: 0,
          flexDirection: "column",
          background: "#1a1b20",
          borderRight: `1px solid ${T.borderHi}`,
        }}
      >
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} className="lg:hidden">
          <div
            onClick={() => setDrawer(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(8,8,10,0.62)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          />
          <aside style={{
            position: "absolute", top: 0, bottom: 0, left: 0, width: 280,
            display: "flex", flexDirection: "column",
            background: "#1a1b20",
            borderRight: `1px solid ${T.borderHi}`,
          }}>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{
          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "15px 26px",
          background: "#17181c",
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
            <button
              className="portal-nav-item lg:hidden"
              onClick={() => setDrawer(true)}
              style={{
                width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${T.borderHi}`, background: "rgba(255,255,255,0.06)", color: T.muted, cursor: "pointer",
              }}
            >
              <Icon name="menu" size={18} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                {current?.label ?? ""}
              </h1>
              <p style={{ fontFamily: MONO, fontSize: 11.5, color: T.faint, margin: "3px 0 0", letterSpacing: "0.04em" }}>
                {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          {topRight && <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>{topRight}</div>}
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "26px 24px 48px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
