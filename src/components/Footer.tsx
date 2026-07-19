/**
 * Footer.tsx — shared footer component used on all pages.
 *
 * Props:
 *   onContact  — optional callback to open the contact modal (used on
 *                service/about pages). Omit on the main page (the main
 *                page has its own floating contact widget).
 *   homePage   — when true, nav items use same-page anchor (#sX) scroll
 *                targets; otherwise they use full /#sX hrefs so the
 *                browser navigates to home and then scrolls.
 */

import React, { useEffect } from "react"
import { motion } from "framer-motion"

/* ── design tokens (self-contained so the component has no peer deps) ── */
const T = {
  text:     "#FFFFFF",
  muted:    "rgba(255,255,255,0.78)",
  faint:    "rgba(255,255,255,0.58)",
  border:   "rgba(255,255,255,0.11)",
  accent:   "#7C222B",
  accentLt: "#A83040",
  green:    "#10B981",
} as const

const MONO    = "'JetBrains Mono','SF Mono',ui-monospace,monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const SANS    = "'Geist','Space Grotesk',system-ui,sans-serif"

/* ── scoped CSS injected once per mount ── */
const FOOTER_CSS = `
  .nm-footer {
    position: relative;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
    background: linear-gradient(180deg, transparent 0%, rgba(6,12,24,0.35) 22%, rgba(6,12,24,0.80) 50%, #060C18 100%);
  }
  .nm-footer-wrap {
    max-width: 1120px;
    margin: 0 auto;
    padding: 52px 32px 40px;
    position: relative;
    z-index: 2;
    box-sizing: border-box;
    width: 100%;
  }
  .nm-footer-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 48px;
    align-items: start;
    width: 100%;
    box-sizing: border-box;
  }
  .nm-footer-hide-mobile { display: flex; }
  .nm-footer-bottom {
    margin-top: 44px;
    padding-top: 22px;
    border-top: 1px solid rgba(255,255,255,0.11);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    .nm-footer-wrap {
      padding: 80px 20px 80px;
    }
    .nm-footer-grid {
      grid-template-columns: 1fr !important;
      gap: 0 !important;
    }
    .nm-footer-hide-mobile {
      display: none !important;
    }
    .nm-footer-bottom {
      margin-top: 28px;
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;
    }
    .nm-footer-socials {
      width: 100%;
      justify-content: flex-start;
    }
  }
`

/* ── icons ── */
function LinkedinIcon()  { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> }
function GithubIcon()    { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg> }
function InstagramIcon() { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"/></svg> }
function DiscordIcon()   { return <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> }

const SOCIALS = [
  { label: "LinkedIn",  href: "https://linkedin.com/in/nadiamaar",  Icon: LinkedinIcon  },
  { label: "GitHub",    href: "https://github.com/nadiamaar-dev",    Icon: GithubIcon    },
  { label: "Instagram", href: "https://instagram.com/nadiamaar.dev", Icon: InstagramIcon },
  { label: "Discord",   href: "https://discord.gg/nadiamaar",        Icon: DiscordIcon   },
]

/* nav links — same hrefs work from any page:
   on the main page the browser scrolls to #anchor;
   from other pages it navigates to /#anchor */
const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "About",     href: "/about" },
  { label: "Soluzioni", href: "/#s4" },
  { label: "Projects",  href: "/projects" },
  { label: "Portfolio", href: "/#s6" },
  { label: "Contatti",  href: "/#s9" },
]

/* ── NMmark ── */
function NMmark({ size = 30, id = "nm-ft" }: { size?: number; id?: string }) {
  return (
    <svg viewBox="0 2 28 22" width={size} height={Math.round(size * 22 / 28)} fill="none" strokeLinecap="square" strokeLinejoin="miter">
      <defs>
        <linearGradient id={id} x1="2" y1="12" x2="27" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.90)" />
          <stop offset="44%"  stopColor="rgba(255,255,255,0.90)" />
          <stop offset="56%"  stopColor="#A83040" />
          <stop offset="100%" stopColor="#7C222B" />
        </linearGradient>
      </defs>
      <path d="M 2,22 L 2,2 L 13,22 L 13,2 L 19.5,12 L 26,2 L 26,22"
        stroke={`url(#${id})`} strokeWidth="1.85" />
    </svg>
  )
}

/* ── PingDot ── */
function PingDot({ color = T.green, size = 7 }: { color?: string; size?: number }) {
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

/* ══════════════════════════════════════════════════════════════════════════
   FOOTER COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export interface FooterProps {
  /** Open contact modal — pass a handler from the parent page. */
  onContact?: () => void
}

export default function Footer({ onContact }: FooterProps) {
  /* inject scoped CSS once */
  useEffect(() => {
    const id = "nm-footer-styles"
    if (document.getElementById(id)) return
    const el = document.createElement("style")
    el.id = id
    el.textContent = FOOTER_CSS
    document.head.appendChild(el)
    return () => { /* intentionally keep styles for page lifetime */ }
  }, [])

  return (
    <footer className="nm-footer">

      {/* ── accent top line ── */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(124,34,43,0.70) 28%, rgba(168,48,64,0.95) 50%, rgba(124,34,43,0.70) 72%, transparent 100%)", boxShadow: "0 0 8px rgba(124,34,43,0.30)" }} />

      {/* ── main grid ── */}
      <div className="nm-footer-wrap">
        <div className="nm-footer-grid">

          {/* col 1 — brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
                <NMmark size={30} id="nm-footer-logo" />
                <span aria-hidden style={{ width: 1, height: 14, background: "rgba(255,255,255,0.16)", flexShrink: 0 }} />
                <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.78)" }}>
                  Nadia Maar
                </span>
              </div>
              <p className="nm-footer-hide-mobile" style={{ fontFamily: SANS, fontSize: "clamp(15px, 1.4vw, 17px)", color: T.faint, lineHeight: 1.85, maxWidth: 280, letterSpacing: "0.01em", flexDirection: "column" }}>
                E-commerce, Web Apps, AI e Performance Marketing.<br />Architettura digitale ad alte prestazioni.
              </p>
            </div>
            <div className="nm-footer-hide-mobile"
              style={{ alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 9999, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.22)", width: "fit-content" }}>
              <PingDot color={T.green} size={7} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(190,245,220,0.90)" }}>Disponibile · 2026</span>
            </div>
          </div>

          {/* col 2 — nav */}
          <div className="nm-footer-hide-mobile" style={{ flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", marginBottom: 16 }}>
              Navigazione
            </div>
            {NAV_LINKS.map(({ label, href }) => (
              <motion.a key={label} href={href}
                whileHover={{ x: 4 }} transition={{ duration: 0.18 }}
                style={{ textDecoration: "none", padding: "5px 0", display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.10em", color: T.faint, transition: "color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.faint }}
              >
                <span style={{ width: 14, height: 1, background: "rgba(161,44,56,0.45)", display: "inline-block" }} aria-hidden />
                {label}
              </motion.a>
            ))}
          </div>

          {/* col 3 — contact */}
          <div className="nm-footer-hide-mobile" style={{ flexDirection: "column", gap: 14 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", marginBottom: 4 }}>
              Contatti
            </div>

            <a href="mailto:nadiamaar.dev@gmail.com"
              style={{ fontFamily: MONO, fontSize: 11.5, color: T.faint, textDecoration: "none", letterSpacing: "0.04em", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = T.faint)}
            >nadiamaar.dev@gmail.com</a>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(161,44,56,0.60)", flexShrink: 0 }} />
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)" }}>Remote · Europa</span>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "2px 0" }} />

            <motion.a
              href="/#s9"
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ display: "inline-flex", alignItems: "stretch", borderRadius: 10, textDecoration: "none", border: "1px solid rgba(161,44,56,0.50)", background: "linear-gradient(90deg, rgba(161,44,56,0.34) 0%, rgba(161,44,56,0.20) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0 12px rgba(161,44,56,0.20), inset 0 1px 0 rgba(255,255,255,0.12)", overflow: "hidden", width: "fit-content", transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "linear-gradient(90deg, rgba(161,44,56,0.50) 0%, rgba(161,44,56,0.34) 100%)"; el.style.borderColor = "rgba(161,44,56,0.80)"; el.style.boxShadow = "0 0 24px rgba(161,44,56,0.35), inset 0 1px 0 rgba(255,255,255,0.18)" }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "linear-gradient(90deg, rgba(161,44,56,0.34) 0%, rgba(161,44,56,0.20) 100%)"; el.style.borderColor = "rgba(161,44,56,0.50)"; el.style.boxShadow = "0 0 12px rgba(161,44,56,0.20), inset 0 1px 0 rgba(255,255,255,0.12)" }}
            >
              <span style={{ padding: "9px 12px 9px 14px", borderRight: "1px solid rgba(161,44,56,0.45)", display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>[01]</span>
              <span style={{ display: "flex", alignItems: "center", padding: "9px 16px", fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>Prenota una Call</span>
            </motion.a>

            {onContact && (
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onContact}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{ display: "flex", alignItems: "stretch", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", cursor: "pointer", overflow: "hidden", width: "fit-content", transition: "background 0.25s, border-color 0.25s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.08)"; el.style.borderColor = "rgba(255,255,255,0.22)" }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(255,255,255,0.12)" }}
              >
                <span style={{ padding: "9px 12px 9px 14px", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,255,255,0.40)", flexShrink: 0 }}>[✉]</span>
                <span style={{ display: "flex", alignItems: "center", padding: "9px 16px", fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: T.faint }}>Scrivimi</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* ── bottom row — copyright + socials ── */}
        <div className="nm-footer-bottom">
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.24)" }}>
            © NADIA MAAR 2026 — Digital Architecture Studio
          </span>
          <div className="nm-footer-socials" style={{ display: "flex", gap: 8 }}>
            {SOCIALS.map(({ label, href, Icon }) => (
              <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                data-glow=""
                whileHover={{ y: -3, scale: 1.08 }} whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 16 }}
                style={{
                  "--base": "28", "--spread": "36", "--radius": "10", "--border": "1", "--size": "130",
                  width: 38, height: 38, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.faint, border: `1px solid ${T.border}`,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(12px)",
                  textDecoration: "none", flexShrink: 0,
                } as React.CSSProperties}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.accentLt; el.style.borderColor = "rgba(161,44,56,0.45)"; el.style.backgroundColor = "rgba(161,44,56,0.10)"; el.style.boxShadow = "0 0 14px rgba(161,44,56,0.18)" }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.faint; el.style.borderColor = T.border; el.style.backgroundColor = "rgba(255,255,255,0.03)"; el.style.boxShadow = "none" }}
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </div>

      </div>

      {/* ── giant MAAR watermark ── */}
      <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center", lineHeight: 0.85, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 900, letterSpacing: "-0.04em", fontSize: "clamp(88px,20vw,300px)", color: "rgba(255,255,255,0.012)", filter: "blur(1px)", userSelect: "none", transform: "translateY(28%)" }}>MAAR</span>
      </div>
    </footer>
  )
}
