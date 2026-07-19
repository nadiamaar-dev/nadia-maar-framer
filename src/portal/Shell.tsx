import React, { useState } from "react"
import Background from "../components/Background"
import { Avatar, DISPLAY, Icon, MONO, T, TL, type IconName } from "./ui"

export interface ShellNavItem {
  id: string
  label: string
  icon: IconName
  badge?: number
}


export default function Shell({
  items, active, onSelect,
  email, roleLabel, onSignOut, onEditProfile, topRight, children,
}: {
  items: ShellNavItem[]
  active: string
  onSelect: (id: string) => void
  email?: string
  roleLabel: string
  onSignOut: () => void
  onEditProfile?: () => void
  topRight?: React.ReactNode
  children: React.ReactNode
}) {
  const [drawer, setDrawer] = useState(false)
  const current = items.find(i => i.id === active)

  const sidebar = (
    <>
      {/* Client profile — top of sidebar */}
      <div style={{ padding: "24px 16px 20px", borderBottom: `1px solid ${TL.border}` }}>
        <button
          onClick={onEditProfile ? () => { onEditProfile(); setDrawer(false) } : undefined}
          disabled={!onEditProfile}
          className={onEditProfile ? "portal-nav-item" : undefined}
          title={onEditProfile ? "Modifica il tuo profilo" : undefined}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
            background: "transparent", border: "1px solid transparent", borderRadius: 12,
            padding: onEditProfile ? "8px 10px" : 0, margin: onEditProfile ? "-8px -10px" : 0,
            cursor: onEditProfile ? "pointer" : "default",
          }}
        >
          <Avatar name={email ?? "?"} size={42} />
          <div style={{ minWidth: 0, flex: 1 }}>
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
          {onEditProfile && <Icon name="edit" size={13} style={{ color: TL.faint, flexShrink: 0 }} />}
        </button>
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
                background: isActive ? "rgba(161,44,56,0.14)" : "transparent",
                border: `1px solid ${isActive ? "rgba(161,44,56,0.30)" : "transparent"}`,
                borderLeft: isActive ? "3px solid #A12C38" : "3px solid transparent",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.14)" : "none",
                color: isActive ? "rgba(255,255,255,0.92)" : TL.muted,
                cursor: "pointer", transition: "all 0.16s ease",
              }}
            >
              <Icon name={item.icon} size={16} />
              <span style={{ flex: 1, fontFamily: DISPLAY, fontSize: 13.5, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
              {(item.badge ?? 0) > 0 && (
                <span style={{
                  minWidth: 18, height: 18, padding: "0 5px", borderRadius: 99,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(161,44,56,0.85)",
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
      <Background />

      {/* Desktop sidebar — solid, not glass */}
      <aside
        className="hidden lg:flex"
        style={{
          position: "relative", zIndex: 2, width: 268, flexShrink: 0,
          flexDirection: "column",
          background: "linear-gradient(180deg, #0C1020 0%, #080E1C 100%)",
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
            background: "linear-gradient(180deg, #0C1020 0%, #080E1C 100%)",
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
          background: "linear-gradient(180deg, #0C1020 0%, #080E1C 100%)",
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
