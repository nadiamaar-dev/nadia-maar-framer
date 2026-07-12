import React, { useState } from "react"
import { Avatar, DISPLAY, Icon, MONO, T, TL, type IconName } from "./ui"

export interface ShellNavItem {
  id: string
  label: string
  icon: IconName
  badge?: number
}

/* Layered graphite backdrop: neutral base, one silver bloom, one copper ember, technical grid. */
function Backdrop() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "#233D4D" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #233D4D 0%, #233D4D 55%, #1E3544 100%)",
      }} />
      <div style={{
        position: "absolute", top: "-20%", left: "-10%", width: "55%", height: "60%",
        background: "radial-gradient(ellipse, rgba(226,230,238,0.055) 0%, transparent 65%)",
      }} />
      <div style={{
        position: "absolute", bottom: "-25%", right: "-12%", width: "60%", height: "70%",
        background: "radial-gradient(ellipse, rgba(174,83,80,0.075) 0%, transparent 62%)",
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
  items, active, onSelect,
  email, roleLabel, onSignOut, topRight, children,
}: {
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
      {/* Client profile — top of sidebar */}
      <div style={{ padding: "24px 16px 20px", borderBottom: `1px solid ${TL.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={email ?? "?"} size={42} />
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontFamily: DISPLAY, fontSize: 14, fontWeight: 700,
              color: TL.text, margin: 0, lineHeight: 1.25,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {roleLabel}
            </p>
            <p style={{
              fontFamily: MONO, fontSize: 10, color: TL.faint,
              margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {email ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "14px 10px", overflowY: "auto" }}>
        {items.map(item => {
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); setDrawer(false) }}
              className={isActive ? undefined : "portal-nav-item"}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 11, textAlign: "left",
                background: isActive ? "rgba(194,86,64,0.14)" : "transparent",
                border: `1px solid ${isActive ? "rgba(194,86,64,0.30)" : "transparent"}`,
                borderLeft: isActive ? "3px solid #D4856A" : "3px solid transparent",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.14)" : "none",
                color: isActive ? "#F4C5B4" : TL.muted,
                cursor: "pointer", transition: "all 0.16s ease",
              }}
            >
              <Icon name={item.icon} size={16} />
              <span style={{ flex: 1, fontFamily: DISPLAY, fontSize: 13.5, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
              {(item.badge ?? 0) > 0 && (
                <span style={{
                  minWidth: 18, height: 18, padding: "0 5px", borderRadius: 99,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(212,105,90,0.88)",
                  color: "#FFF", fontFamily: MONO, fontSize: 9.5, fontWeight: 700,
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div style={{ padding: "12px 10px 16px", borderTop: `1px solid ${TL.border}`, display: "flex", gap: 8 }}>
        <a
          href="/"
          className="portal-nav-item"
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 12px", borderRadius: 10, textDecoration: "none",
            border: `1px solid ${TL.border}`, background: "rgba(255,255,255,0.05)",
            fontFamily: DISPLAY, fontSize: 13, fontWeight: 500, color: TL.faint,
          }}
        >
          <Icon name="home" size={14} />
          Sito
        </a>
        <button
          onClick={onSignOut}
          className="portal-nav-item"
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 12px", borderRadius: 10,
            border: `1px solid ${TL.border}`, background: "rgba(255,255,255,0.05)",
            fontFamily: DISPLAY, fontSize: 13, fontWeight: 500, color: TL.faint, cursor: "pointer",
          }}
        >
          <Icon name="logout" size={14} />
          Esci
        </button>
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
          background: "linear-gradient(180deg, #1B2C37 0%, #182833 100%)",
          borderRight: `1px solid ${TL.borderHi}`,
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
            background: "linear-gradient(180deg, #1B2C37 0%, #182833 100%)",
            borderRight: `1px solid ${TL.borderHi}`,
          }}>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{
          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "14px 28px",
          background: "linear-gradient(180deg, #1A2C38 0%, #162830 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.22)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <button
              className="portal-nav-item lg:hidden"
              onClick={() => setDrawer(true)}
              style={{
                width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${TL.borderHi}`, background: "rgba(255,255,255,0.06)", color: TL.muted, cursor: "pointer",
              }}
            >
              <Icon name="menu" size={18} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: TL.text, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                {current?.label ?? ""}
              </h1>
              <p style={{ fontFamily: MONO, fontSize: 10.5, color: TL.faint, margin: "3px 0 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          {topRight && <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>{topRight}</div>}
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 26px 52px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
