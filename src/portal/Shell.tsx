import React, { useState } from "react"
import Background from "../components/Background"
import { Avatar, DISPLAY, Icon, MONO, PortalLogo, T, TL, type IconName } from "./ui"

export interface ShellNavItem {
  id: string
  label: string
  icon: IconName
  badge?: number
}

/* ── Exact site values ─────────────────────────────────────────────────────
   Menu panel   → rgba(18,20,24,0.92) + blur(32px) saturate(0.15)
   Header bar   → rgba(18,20,24,0.88) + blur(32px) saturate(0.15)
   Border       → rgba(255,255,255,0.08)
   Accent line  → 2px crimson gradient + 0 0 18px rgba(184,50,64,0.30) glow
   Eyebrow      → // in rgba(184,50,64,0.70) + label in rgba(255,255,255,0.28)
   MAAR ghost   → vertical-rl, rgba(255,255,255,0.025), blur(0.8px)
   Glow BL      → rgba(184,50,64,0.12) radial, blur(70px)
   Glow TR      → rgba(184,50,64,0.06) radial, blur(50px)
───────────────────────────────────────────────────────────────────────── */
const GLASS_BG     = "rgba(6,12,24,0.90)"
const GLASS_FILTER = "blur(24px) saturate(1.0)"
const HDR_BG       = "rgba(6,12,24,0.88)"
const SIDE_BORDER  = "rgba(255,255,255,0.08)"

/* 2 px crimson hairline — identical to the site menu/header top line */
function AccentLine() {
  return (
    <div aria-hidden style={{
      height: 2, flexShrink: 0,
      background: "linear-gradient(90deg, transparent, rgba(184,50,64,0.60) 35%, rgba(184,50,64,0.60) 65%, transparent)",
      boxShadow: "0 0 10px rgba(184,50,64,0.14)",
    }} />
  )
}

/* Ghost MAAR watermark — identical to site menu panel */
function MaarGhost({ direction = "vertical" }: { direction?: "vertical" | "horizontal" }) {
  if (direction === "horizontal") {
    return (
      <div aria-hidden style={{
        position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)",
        fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(72px,28vw,130px)",
        letterSpacing: "-0.05em", color: "rgba(255,255,255,0.022)",
        filter: "blur(1px)", userSelect: "none", whiteSpace: "nowrap",
        pointerEvents: "none", zIndex: 0,
      }}>MAAR</div>
    )
  }
  return (
    <div aria-hidden style={{
      position: "absolute", right: -10, top: 0, bottom: 0,
      display: "flex", alignItems: "center",
      pointerEvents: "none", zIndex: 0, overflow: "hidden",
    }}>
      <span style={{
        writingMode: "vertical-rl", transform: "rotate(180deg)",
        fontFamily: DISPLAY, fontWeight: 900,
        fontSize: "clamp(72px,9vw,120px)", letterSpacing: "-0.04em",
        color: "rgba(255,255,255,0.025)", filter: "blur(0.8px)",
        userSelect: "none", lineHeight: 0.82,
      }}>MAAR</span>
    </div>
  )
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

  /* ── Sidebar content ────────────────────────────────────────────────── */
  const sidebarContent = (
    <>
      {/* Logo strip — matches site Header logo row */}
      <div style={{
        padding: "22px 20px 16px",
        borderBottom: `1px solid ${SIDE_BORDER}`,
        flexShrink: 0,
      }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <PortalLogo size={28} id="nm-shell-logo" />
          <span aria-hidden style={{ width: 1, height: 14, background: "rgba(255,255,255,0.16)", flexShrink: 0 }} />
          <span style={{
            fontFamily: MONO, fontWeight: 600, fontSize: 11,
            letterSpacing: "0.22em", textTransform: "uppercase" as const,
            color: "#fff", whiteSpace: "nowrap" as const,
          }}>
            Nadia Maar
          </span>
        </a>
        {/* // [ Area Clienti ] eyebrow — identical to Header // [ Navigazione ] */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12,
          fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em",
          textTransform: "uppercase" as const, color: "rgba(255,255,255,0.28)",
        }}>
          <span style={{ color: "rgba(184,50,64,0.50)" }}>//</span>
          <span>[ Area Clienti ]</span>
        </div>
      </div>

      {/* Client profile card */}
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${SIDE_BORDER}`, flexShrink: 0 }}>
        <button
          onClick={onEditProfile ? () => { onEditProfile(); setDrawer(false) } : undefined}
          disabled={!onEditProfile}
          className={onEditProfile ? "portal-nav-item" : undefined}
          title={onEditProfile ? "Modifica il tuo profilo" : undefined}
          style={{
            display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.32)",
            borderRadius: 11, padding: "9px 11px",
            cursor: onEditProfile ? "pointer" : "default",
            transition: "background 0.18s, border-color 0.18s",
          }}
          onMouseEnter={onEditProfile ? e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = "rgba(255,255,255,0.07)"
            el.style.borderColor = "rgba(255,255,255,0.36)"
          } : undefined}
          onMouseLeave={onEditProfile ? e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = "rgba(255,255,255,0.04)"
            el.style.borderColor = "rgba(255,255,255,0.22)"
          } : undefined}
        >
          <Avatar name={email ?? "?"} size={38} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700,
              color: TL.text, margin: 0, lineHeight: 1.25,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {roleLabel}
            </p>
            <p style={{
              fontFamily: MONO, fontSize: 9.5, color: "rgba(255,255,255,0.46)",
              margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {email ?? "—"}
            </p>
          </div>
          {onEditProfile && <Icon name="edit" size={12} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />}
        </button>
      </div>

      {/* Navigation — [01] numbered indices, left accent bar */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "14px 12px", overflowY: "auto" }}>
        {items.map((item, idx) => {
          const isActive = item.id === active
          const num = String(idx + 1).padStart(2, "0")
          return (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); setDrawer(false) }}
              className={isActive ? undefined : "portal-nav-item"}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "10px 12px", borderRadius: 10, textAlign: "left",
                background: isActive ? "rgba(184,50,64,0.07)" : "transparent",
                border: `1px solid ${isActive ? "rgba(184,50,64,0.16)" : "transparent"}`,
                borderLeft: isActive ? "3px solid rgba(184,50,64,0.70)" : "3px solid transparent",
                boxShadow: "none",
                color: isActive ? "rgba(255,255,255,0.95)" : TL.muted,
                cursor: "pointer", transition: "all 0.16s ease",
              }}
            >
              {/* [01] index — matches Header menu [01] style */}
              <span style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", flexShrink: 0, width: 22,
                color: isActive ? "rgba(184,50,64,0.55)" : "rgba(255,255,255,0.20)",
              }}>
                [{num}]
              </span>
              <Icon name={item.icon} size={15} />
              <span style={{ flex: 1, fontFamily: DISPLAY, fontSize: 14, fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
              {(item.badge ?? 0) > 0 && (
                <span style={{
                  minWidth: 18, height: 18, padding: "0 5px", borderRadius: 99,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(184,50,64,0.55)",
                  color: "#FFF", fontFamily: MONO, fontSize: 9.5, fontWeight: 700,
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer — Sito + Esci in site mono style */}
      <div style={{
        padding: "12px 12px 18px",
        borderTop: `1px solid ${SIDE_BORDER}`,
        display: "flex", gap: 8,
      }}>
        {[
          { href: "/", icon: "home" as IconName, label: "Sito" },
        ].map(({ href, icon, label }) => (
          <a
            key={label}
            href={href}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "9px 10px", borderRadius: 9, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)",
              fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.10em",
              textTransform: "uppercase" as const, color: "rgba(255,255,255,0.46)",
              transition: "all 0.18s",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.color = "#fff"; el.style.borderColor = "rgba(255,255,255,0.18)"
              el.style.background = "rgba(255,255,255,0.08)"
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.color = "rgba(255,255,255,0.46)"; el.style.borderColor = "rgba(255,255,255,0.08)"
              el.style.background = "rgba(255,255,255,0.04)"
            }}
          >
            <Icon name={icon} size={13} />
            {label}
          </a>
        ))}
        <button
          onClick={onSignOut}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "9px 10px", borderRadius: 9,
            border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)",
            fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.10em",
            textTransform: "uppercase" as const, color: "rgba(255,255,255,0.46)",
            cursor: "pointer", transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = "#fff"; el.style.borderColor = "rgba(184,50,64,0.45)"
            el.style.background = "rgba(184,50,64,0.10)"
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = "rgba(255,255,255,0.46)"; el.style.borderColor = "rgba(255,255,255,0.08)"
            el.style.background = "rgba(255,255,255,0.04)"
          }}
        >
          <Icon name="logout" size={13} />
          Esci
        </button>
      </div>
    </>
  )

  /* ── Layout ─────────────────────────────────────────────────────────── */
  return (
    <div
      className="portal-root"
      style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg, fontFamily: DISPLAY }}
    >
      <Background portal />

      {/* ── Desktop sidebar — transparent = identical to Background ── */}
      <aside
        className="hidden lg:flex"
        style={{
          position: "relative", zIndex: 2, width: 268, flexShrink: 0,
          flexDirection: "column",
          background: "transparent",
          borderRight: `1px solid ${SIDE_BORDER}`,
          overflow: "hidden",
        }}
      >
        <AccentLine />
        {/* MAAR — vertical, right side, matches site menu panel */}
        <MaarGhost direction="vertical" />
        {/* Ambient glow bottom-left */}
        <div aria-hidden style={{
          position: "absolute", bottom: "20%", left: -55, width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,50,64,0.06) 0%, transparent 70%)",
          filter: "blur(65px)", pointerEvents: "none",
        }} />
        {/* Ambient glow top-right */}
        <div aria-hidden style={{
          position: "absolute", top: "8%", right: -10, width: 150, height: 150, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,50,64,0.03) 0%, transparent 70%)",
          filter: "blur(45px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          {sidebarContent}
        </div>
      </aside>

      {/* ── Mobile drawer ── */}
      {drawer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} className="lg:hidden">
          <div
            onClick={() => setDrawer(false)}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            }}
          />
          <aside style={{
            position: "absolute", top: 0, bottom: 0, left: 0, width: 284,
            display: "flex", flexDirection: "column", overflow: "hidden",
            background: "#060C18",
            borderRight: `1px solid ${SIDE_BORDER}`,
            boxShadow: "24px 0 60px rgba(0,0,0,0.55)",
          }}>
            <AccentLine />
            <MaarGhost direction="horizontal" />
            <div aria-hidden style={{
              position: "absolute", bottom: "18%", left: -55, width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(184,50,64,0.06) 0%, transparent 70%)",
              filter: "blur(60px)", pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
              {sidebarContent}
            </div>
          </aside>
        </div>
      )}

      {/* ── Main column ── */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top header — site header-scrolled glass */}
        <header style={{
          flexShrink: 0, height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "0 28px",
          background: "transparent",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            {/* Hamburger — matches site header close button style */}
            <button
              className="portal-nav-item lg:hidden"
              onClick={() => setDrawer(true)}
              style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.17)", background: "rgba(255,255,255,0.04)",
                color: TL.muted, cursor: "pointer",
                transition: "background 0.18s, border-color 0.18s, color 0.18s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = "rgba(184,50,64,0.14)"
                el.style.borderColor = "rgba(184,50,64,0.45)"
                el.style.color = "#fff"
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = "rgba(255,255,255,0.04)"
                el.style.borderColor = "rgba(255,255,255,0.10)"
                el.style.color = TL.muted
              }}
            >
              <Icon name="menu" size={16} />
            </button>

            <div style={{ minWidth: 0 }}>
              {/* // [ Section ] eyebrow — matches Header.tsx desktop eyebrow */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 3,
                fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em",
                textTransform: "uppercase" as const, color: "rgba(255,255,255,0.28)",
              }}>
                <span style={{ color: "rgba(184,50,64,0.50)" }}>//</span>
                <span>[ {current?.label ?? ""} ]</span>
              </div>
              <h1 style={{
                fontFamily: DISPLAY, fontSize: 19, fontWeight: 800,
                color: TL.text, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15,
              }}>
                {current?.label ?? ""}
              </h1>
            </div>
          </div>

          {topRight && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
              {topRight}
            </div>
          )}
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
