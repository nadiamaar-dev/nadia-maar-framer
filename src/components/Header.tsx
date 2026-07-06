/**
 * Header.tsx — shared header + side menu used on all pages.
 *
 * Navbar  : service-page style — DateTimeWidget left, NM logo centre, burger right.
 * MenuOverlay : main-page style — large numbered items, full-screen on mobile,
 *               460 px glass slide panel on desktop.
 *
 * Navigation: when on "/" smooth-scrolls to section IDs; otherwise navigates
 *             to "/#sX" so the browser goes home and then scrolls.
 */

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useBlueprint } from "../context/BlueprintContext"
import { supabase } from "../lib/supabase"

/* ── tokens ── */
const T = {
  text:     "#FFFFFF",
  muted:    "rgba(255,255,255,0.78)",
  faint:    "rgba(255,255,255,0.58)",
  border:   "rgba(255,255,255,0.11)",
  accent:   "#8C3525",
  accentLt: "#B04A38",
  green:    "#10B981",
} as const

const MONO    = "'JetBrains Mono','SF Mono',ui-monospace,monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const ease: [number,number,number,number] = [0.16,1,0.3,1]

/* ── NMmark ── */
function NMmark({ size = 30, id = "nm-h", hover = false }: { size?: number; id?: string; hover?: boolean }) {
  return (
    <svg viewBox="0 2 28 22" width={size} height={Math.round(size * 22 / 28)} fill="none" strokeLinecap="square" strokeLinejoin="miter">
      <defs>
        <linearGradient id={id} x1="2" y1="12" x2="27" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={hover ? "#ffffff" : "rgba(255,255,255,0.90)"} />
          <stop offset="44%"  stopColor={hover ? "#ffffff" : "rgba(255,255,255,0.90)"} />
          <stop offset="56%"  stopColor="#B04A38" />
          <stop offset="100%" stopColor={hover ? "#A8452C" : "#8C3525"} />
        </linearGradient>
      </defs>
      <motion.path
        d="M 2,22 L 2,2 L 13,22 L 13,2 L 19.5,12 L 26,2 L 26,22"
        stroke={`url(#${id})`} strokeWidth="1.85"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 0.9, ease, delay: 0.15 }, opacity: { duration: 0.01 } }}
      />
    </svg>
  )
}

/* ── PingDot ── */
function PingDot({ color = T.green, size = 5 }: { color?: string; size?: number }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: size, height: size, flexShrink: 0 }}>
      <motion.span aria-hidden
        style={{ position: "absolute", inset: -2, borderRadius: "50%", background: color, opacity: 0.55 }}
        animate={{ scale: [1, 3.2], opacity: [0.55, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
      <span style={{ width: "100%", height: "100%", borderRadius: "50%", background: color, display: "block", position: "relative" }} />
    </span>
  )
}

const HDR_STYLE = `@keyframes hdr-colon-blink{0%,100%{opacity:.55}50%{opacity:.15}}`

/* ── DateTimeWidget — minimal, no border ── */
function DateTimeWidget() {
  useEffect(() => {
    const id = "hdr-dt-style"
    if (document.getElementById(id)) return
    const el = document.createElement("style")
    el.id = id; el.textContent = HDR_STYLE
    document.head.appendChild(el)
  }, [])
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, userSelect: "none", pointerEvents: "none" }}>
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.30)" }}>
        {now.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)" }}>
        {pad(now.getHours())}<span style={{ animation: "hdr-colon-blink 1s ease-in-out infinite", display: "inline-block" }}>:</span>{pad(now.getMinutes())}<span style={{ animation: "hdr-colon-blink 1s ease-in-out infinite", display: "inline-block" }}>:</span>{pad(now.getSeconds())}
      </span>
    </div>
  )
}

/* ── Large menu nav item (main-page style) ── */
function MenuNavItem({ num, label, onClick, index, active = false }: {
  num: string; label: string; onClick: () => void; index: number; active?: boolean
}) {
  const [h, setH] = useState(false)
  const lit = h || active
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.08, duration: 0.55, ease }}>
      <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ background: "none", border: "none", cursor: "pointer", width: "100%", display: "flex", alignItems: "baseline", gap: 18, padding: "14px 0", borderBottom: `1px solid ${lit ? "rgba(140,53,37,0.40)" : "rgba(255,255,255,0.08)"}`, transition: "border-color 0.22s", textAlign: "left" as const, position: "relative" }}>
        {/* accent left bar */}
        <motion.span aria-hidden
          animate={{ scaleY: lit ? 1 : 0, opacity: lit ? 1 : 0 }} transition={{ duration: 0.2 }}
          style={{ position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)", width: 2, height: "60%", background: T.accent, borderRadius: 2, transformOrigin: "center" }} />
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: lit ? T.accent : "rgba(255,255,255,0.30)", transition: "color 0.22s", minWidth: 26, flexShrink: 0 }}>[{num}]</span>
        <span style={{ fontFamily: DISPLAY, fontSize: "clamp(28px,8vw,46px)", fontWeight: 800, letterSpacing: "-0.032em", lineHeight: 1.1, color: active ? T.accentLt : h ? "#fff" : "rgba(255,255,255,0.75)", transition: "color 0.22s" }}>{label}</span>
        <motion.span animate={{ x: lit ? 10 : 0, opacity: lit ? 1 : 0 }} transition={{ duration: 0.18 }}
          style={{ marginLeft: "auto", color: T.accent, fontSize: 20, lineHeight: 1, flexShrink: 0 }}>→</motion.span>
      </button>
    </motion.div>
  )
}

/* ── Auth section inside the menu ── */
function MenuAuthSection({ onClose }: { onClose: () => void }) {
  const { user, openAuthModal } = useBlueprint()
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.52, duration: 0.36 }}
      style={{ paddingBottom: 16, paddingTop: 18 }}>
      {user ? (
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href="/dashboard"
            onClick={onClose}
            style={{
              flex: 1, padding: "11px 16px",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: 10, textDecoration: "none", cursor: "pointer",
              fontFamily: DISPLAY, fontSize: 13, fontWeight: 700,
              color: "rgba(255,255,255,0.88)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.18s, border-color 0.18s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.32)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.20)" }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            Dashboard
          </a>
          <button
            onClick={handleSignOut}
            title="Esci"
            style={{
              padding: "11px 16px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, cursor: "pointer",
              fontFamily: MONO, fontSize: 11, fontWeight: 600,
              color: "rgba(255,255,255,0.40)",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.18s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.40)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)" }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Esci
          </button>
        </div>
      ) : (
        <button
          onClick={() => { openAuthModal(); onClose() }}
          style={{
            width: "100%", padding: "13px 20px",
            background: "rgba(140,53,37,0.12)", border: "1px solid rgba(140,53,37,0.38)",
            borderRadius: 10, cursor: "pointer",
            fontFamily: DISPLAY, fontSize: 13, fontWeight: 700,
            color: "#D4695A",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "background 0.18s, border-color 0.18s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(140,53,37,0.20)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,53,37,0.60)" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(140,53,37,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,53,37,0.38)" }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Accedi · Area Clienti
        </button>
      )}
    </motion.div>
  )
}

/* ── MenuOverlay (main-page style) ── */
function MenuOverlay({ onClose }: { onClose: () => void }) {
  const isHome = typeof window !== "undefined" && window.location.pathname === "/"
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 800)
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 800)
    window.addEventListener("resize", onResize)
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("resize", onResize)
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  /* active section — only meaningful on home page */
  useEffect(() => {
    if (!isHome) return
    const ids = ["s1", "s3", "s5", "s9"]
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) })
    }, { threshold: 0.3 })
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [isHome])

  /* smart navigation: smooth scroll on home, href on other pages */
  const nav = (sectionId: string, href: string) => {
    if (isHome && sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
      onClose()
    } else {
      window.location.href = href
    }
  }

  const NAV = [
    { num: "01", label: "Home",      sectionId: "s1", href: "/",         action: () => nav("s1", "/") },
    { num: "02", label: "About",     sectionId: "",   href: "/about",    action: () => { window.location.href = "/about" } },
    { num: "03", label: "Soluzioni", sectionId: "s3", href: "/#s3",      action: () => nav("s3", "/#s3") },
    { num: "04", label: "Foundry",   sectionId: "",   href: "/foundry",  action: () => { window.location.href = "/foundry" } },
    { num: "05", label: "Portfolio", sectionId: "s6", href: "/#s6",      action: () => nav("s6", "/#s6") },
    { num: "06", label: "Contatti",  sectionId: "s9", href: "/#s9",      action: () => nav("s9", "/#s9") },
  ]

  const MENU_SOCIALS = [
    { label: "LI", href: "https://linkedin.com/in/nadiamaar" },
    { label: "GH", href: "https://github.com/nadiamaar-dev" },
    { label: "IG", href: "https://instagram.com/nadiamaar.dev" },
    { label: "DC", href: "https://discord.gg/nadiamaar" },
  ]

  const GLASS = {
    background: "rgba(22,27,34,0.82)",
    backdropFilter: "blur(72px) brightness(1.08) saturate(0.80)",
    WebkitBackdropFilter: "blur(72px) brightness(1.08) saturate(0.80)",
  } as React.CSSProperties

  const menuFooter = (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.42, duration: 0.4, ease }}
      style={{ paddingBottom: 36, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.10)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <a href="mailto:nadiamaar.dev@gmail.com"
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: "rgba(255,255,255,0.50)", textDecoration: "none", transition: "color 0.18s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.50)")}>
          nadiamaar.dev@gmail.com
        </a>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <PingDot color={T.green} size={5} />
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(190,245,220,0.80)" }}>Disponibile</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {MENU_SOCIALS.map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", transition: "all 0.18s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#fff"; el.style.borderColor = "rgba(140,53,37,0.55)"; el.style.background = "rgba(140,53,37,0.14)" }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(255,255,255,0.55)"; el.style.borderColor = "rgba(255,255,255,0.12)"; el.style.background = "rgba(255,255,255,0.07)" }}>
            {label}
          </a>
        ))}
      </div>
    </motion.div>
  )

  /* Mobile — full-screen overlay */
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease }}
        style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", padding: "0 28px", overflow: "hidden", ...GLASS }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(140,53,37,0.70), rgba(176,74,56,0.45), transparent)", flexShrink: 0 }} />
        <div style={{ height: 64, flexShrink: 0 }} />
        {/* ghost MAAR */}
        <div aria-hidden style={{ position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)", fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(80px,32vw,160px)", letterSpacing: "-0.05em", color: "rgba(75,85,105,0.13)", filter: "blur(1px)", userSelect: "none", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 0 }}>MAAR</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0, position: "relative", zIndex: 1, paddingLeft: 20 }}>
          {NAV.map((item, i) => (
            <MenuNavItem key={item.label} num={item.num} label={item.label} onClick={item.action} index={i} active={!!item.sectionId && activeId === item.sectionId} />
          ))}
          <MenuAuthSection onClose={onClose} />
        </div>
        {menuFooter}
      </motion.div>
    )
  }

  /* Desktop — right slide-in panel + backdrop */
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.26 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 299 }} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 36 }}
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, zIndex: 300, display: "flex", flexDirection: "column", padding: "0 40px", borderLeft: "1px solid rgba(255,255,255,0.14)", ...GLASS }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(140,53,37,0.70) 40%, rgba(176,74,56,0.45) 70%, transparent)", flexShrink: 0 }} />
        <div style={{ height: 64, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.36)" }}>Navigation</span>
        </div>
        {/* ghost MAAR vertical */}
        <div aria-hidden style={{ position: "absolute", right: -8, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(80px,9vw,130px)", letterSpacing: "-0.04em", color: "rgba(75,85,105,0.13)", filter: "blur(0.8px)", userSelect: "none", lineHeight: 0.82 }}>MAAR</span>
        </div>
        {/* ambient glow */}
        <div aria-hidden style={{ position: "absolute", bottom: "25%", right: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,53,37,0.10) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0, position: "relative", zIndex: 1, paddingLeft: 4 }}>
          {NAV.map((item, i) => (
            <MenuNavItem key={item.label} num={item.num} label={item.label} onClick={item.action} index={i} active={!!item.sectionId && activeId === item.sectionId} />
          ))}
          <MenuAuthSection onClose={onClose} />
        </div>
        {menuFooter}
      </motion.div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   HEADER (exported)
══════════════════════════════════════════════════════════════════════════ */
export default function Header() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [logoHover, setLogoHover] = useState(false)
  const { user, openAuthModal }   = useBlueprint()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 400, height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px",
          backdropFilter: scrolled ? "blur(32px) saturate(0.85)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(32px) saturate(0.85)" : "none",
          background: scrolled ? "rgba(22,27,34,0.78)" : "transparent",
          borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`,
          transition: "background 0.4s, border-color 0.4s",
        } as React.CSSProperties}
      >
        {/* ── left: datetime ── */}
        <div style={{ flex: 1 }}>
          <DateTimeWidget />
        </div>

        {/* ── centre: NM logo → / ── */}
        <motion.a
          href="/"
          onHoverStart={() => setLogoHover(true)} onHoverEnd={() => setLogoHover(false)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
          <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
            <NMmark size={30} id="nm-header-logo" hover={logoHover} />
            <motion.span aria-hidden
              animate={{ opacity: logoHover ? 1 : 0 }} transition={{ duration: 0.30 }}
              style={{ position: "absolute", right: -3, bottom: -1, width: 20, height: 20, background: "radial-gradient(circle, rgba(140,53,37,0.55) 0%, transparent 70%)", filter: "blur(7px)", pointerEvents: "none" }} />
          </span>
          <span aria-hidden style={{ width: 1, height: 14, background: "rgba(255,255,255,0.16)", flexShrink: 0 }} />
          <motion.span
            animate={{ opacity: logoHover ? 1 : 0.70 }} transition={{ duration: 0.25 }}
            style={{ fontFamily: MONO, fontWeight: 600, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#fff", whiteSpace: "nowrap" as const }}>
            Nadia Maar
          </motion.span>
        </motion.a>

        {/* ── right: auth pill + hamburger ── */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>

          {/* Auth button */}
          <AnimatePresence mode="wait">
            {user ? (
              <motion.div key="auth-in"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.22 }}
                style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <motion.a
                  href="/dashboard"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  style={{
                    padding: "6px 13px",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.20)",
                    borderRadius: 8, textDecoration: "none", cursor: "pointer",
                    fontFamily: DISPLAY, fontSize: 12, fontWeight: 600,
                    color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" as const,
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.11)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.32)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.20)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                    <rect x="8" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                    <rect x="1" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                    <rect x="8" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  Dashboard
                </motion.a>
                <motion.button
                  onClick={handleSignOut}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  title="Esci"
                  style={{
                    width: 30, height: 30,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 7, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.38)",
                    transition: "color 0.18s, border-color 0.18s, background 0.18s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.70)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2H2.5A1 1 0 001.5 3v8a1 1 0 001 1H5M9.5 10l3-3-3-3M12.5 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </motion.div>
            ) : (
              <motion.button key="auth-out"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.22 }}
                onClick={openAuthModal}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                style={{
                  padding: "6px 14px",
                  background: "rgba(140,53,37,0.10)", border: "1px solid rgba(140,53,37,0.38)",
                  borderRadius: 8, cursor: "pointer",
                  fontFamily: DISPLAY, fontSize: 12, fontWeight: 600,
                  color: "#D4695A", whiteSpace: "nowrap" as const,
                  transition: "background 0.18s, border-color 0.18s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(140,53,37,0.20)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,53,37,0.60)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(140,53,37,0.10)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,53,37,0.38)" }}
              >
                Accedi
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setMenuOpen(o => !o)}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-label="Menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", display: "flex", flexDirection: "column", gap: 5, zIndex: 401, flexShrink: 0 }}>
            <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} transition={{ duration: 0.26 }}
              style={{ display: "block", width: 22, height: 1.8, background: menuOpen ? "#fff" : "rgba(255,255,255,0.80)", borderRadius: 2, transformOrigin: "center" }} />
            <motion.span animate={{ opacity: menuOpen ? 0 : 1, width: menuOpen ? 0 : 14 }} transition={{ duration: 0.18 }}
              style={{ display: "block", width: 14, height: 1.8, background: "rgba(255,255,255,0.80)", borderRadius: 2 }} />
            <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} transition={{ duration: 0.26 }}
              style={{ display: "block", width: 22, height: 1.8, background: menuOpen ? "#fff" : "rgba(255,255,255,0.80)", borderRadius: 2, transformOrigin: "center" }} />
          </motion.button>

        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
