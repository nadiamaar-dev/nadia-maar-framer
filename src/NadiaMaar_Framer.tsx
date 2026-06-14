/**
 * NadiaMaar_Framer.tsx — Single-file Framer component
 * Paste this file into Framer → Assets → Code → New File
 * Requires: framer-motion (built-in in Framer)
 * No external dependencies.
 */

import React, { useRef, useState, useEffect } from "react"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import type { MotionValue } from "framer-motion"

/* ══════════════════════════════════════════════════════════════════════════
   INLINE SVG ICONS (replaces lucide-react)
══════════════════════════════════════════════════════════════════════════ */
const MailIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <polyline points="22,4 12,13 2,4"/>
  </svg>
)
const PhoneIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
)
const MapPinIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const XIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const ArrowRightIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"/>
  </svg>
)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.84 1.56V6.81a4.85 4.85 0 01-1.07-.12z"/>
  </svg>
)
const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.137-1.868 3.137-4.568 0-2.387-1.718-4.056-4.168-4.056-2.837 0-4.502 2.128-4.502 4.328 0 .857.33 1.776.741 2.279a.3.3 0 01.069.286c-.076.315-.245.995-.278 1.134-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
  </svg>
)
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

/* ══════════════════════════════════════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::placeholder { color: rgba(242,242,252,0.22) !important; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #05050a; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 4px; }
  html { scroll-behavior: smooth; }

  :root { --x:-9999; --y:-9999; --xp:0; --yp:0; }

  [data-glow] {
    --border-size: calc(var(--border,1.5) * 1px);
    --spotlight-size: calc(var(--size,260) * 1px);
    --hue: calc(var(--base,220) + (var(--xp,0) * var(--spread,140)));
    background-image: radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(var(--hue) 100% 70% / var(--bg-spot-opacity,0.06)),
      transparent
    );
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-position: 50% 50%;
    background-attachment: fixed;
  }

  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius,16) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent,transparent), linear-gradient(white,white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
    -webkit-mask: linear-gradient(transparent,transparent), linear-gradient(white,white);
    -webkit-mask-clip: padding-box, border-box;
    -webkit-mask-composite: destination-in;
  }

  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.7) calc(var(--spotlight-size) * 0.7) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(var(--hue) 100% 55% / var(--border-spot-opacity,0.9)),
      transparent 100%
    );
    filter: brightness(2);
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.4) calc(var(--spotlight-size) * 0.4) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity,0.45)),
      transparent 100%
    );
  }

  @keyframes rainbow-anim {
    0%   { background-position: 0 0; }
    50%  { background-position: 400% 0; }
    100% { background-position: 0 0; }
  }
  .rainbow-btn { position: relative; isolation: isolate; }
  .rainbow-btn::before,
  .rainbow-btn::after {
    content: '';
    position: absolute;
    left: -1px; top: -1px;
    border-radius: inherit;
    background: linear-gradient(45deg,
      rgba(112,0,255,0.45), rgba(100,0,240,0.20), rgba(153,68,255,0.35), rgba(100,0,240,0.15),
      rgba(112,0,255,0.45), rgba(100,0,240,0.20), rgba(153,68,255,0.35), rgba(100,0,240,0.15));
    background-size: 400%;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    z-index: -1;
    animation: rainbow-anim 32s linear infinite;
  }
  .rainbow-btn::after { filter: blur(18px); opacity: 0.22; }

  @keyframes colon-blink {
    0%, 100% { opacity: 0.55; }
    50%       { opacity: 0.15; }
  }
  .dt-colon { animation: colon-blink 1s ease-in-out infinite; display: inline-block; }

  .hp-hero-cards-mobile { display: none; }

  @media (max-width: 1024px) {
    .hp-hero-grid { grid-template-columns: 1fr !important; }
    .hp-hero-cards-desktop { display: none !important; }
    .hp-hero-cards-mobile { display: flex !important; flex-direction: column; gap: 12px; margin-top: 32px; }
    .hp-stat-card { padding: 14px 16px !important; border-radius: 14px !important; max-width: 300px; }
    .hp-stat-icon { font-size: 18px !important; }
    .hp-stat-title { font-size: 13px !important; margin-bottom: 3px !important; }
    .hp-stat-desc { font-size: 11px !important; }
    .hp-skillcards { grid-template-columns: repeat(2, 1fr) !important; }
  }

  @media (max-width: 800px) {
    .hp-grid-2 { grid-template-columns: 1fr !important; gap: 40px !important; }
    .hp-grid-3 { grid-template-columns: 1fr !important; gap: 16px !important; }
    .hp-skills-grid { grid-template-columns: 1fr !important; }
    .hp-wrap { padding: 0 20px !important; }
    .hp-sec { padding: 80px 0 !important; }
    .hp-hero { padding: 48px 0 !important; min-height: auto !important; }
    .hp-nav-desktop { display: none !important; }
    .hp-nav-burger { display: flex !important; }
    .hp-brand-text  { display: none !important; }
    .hp-datetime    { padding: 5px 11px !important; gap: 7px !important; }
    .hp-dt-date     { font-size: 9.5px !important; letter-spacing: 0.03em !important; }
    .hp-dt-time     { font-size: 11px !important; }
    .hp-hero-ctas { flex-wrap: wrap !important; align-items: flex-start !important; }
    .hp-hero-primary-btn { flex: 0 0 100% !important; }
    .hp-hero-sep { display: none !important; }
    .hp-hero-social-icons { width: 100% !important; justify-content: center !important; }
    .hp-hero-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; margin-top: 24px !important; }
    .hp-hero-stat-item { padding: 12px 14px !important; gap: 8px !important; }
    .hp-hero-stat-value { font-size: 17px !important; }
    .hp-hero-stat-label { font-size: 10px !important; }
    .hp-method-grid { grid-template-columns: 1fr !important; }
    .hp-method-content { padding: 24px 20px !important; }
    .hp-method-visual { border-left: none !important; border-top: 1px solid rgba(255,255,255,0.05) !important; min-height: 150px !important; }
    .hp-method-nav { flex-wrap: wrap !important; }
    .hp-method-nav > button { flex: 0 0 calc(50% - 4px) !important; }
    .hp-skillcards { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
    .hp-skillcard  { padding: 14px !important; }
    .hp-skillcard h3 { font-size: 12px !important; }
    .hp-skillcard-icon { width: 30px !important; height: 30px !important; border-radius: 8px !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`

/* ══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#05050a",
  bg2:       "#080810",
  surface:   "#0e0e1a",
  raised:    "#14142a",
  border:    "rgba(255,255,255,0.07)",
  borderHi:  "rgba(102,0,255,0.45)",
  text:      "#f2f2fa",
  muted:     "rgba(242,242,250,0.50)",
  faint:     "rgba(242,242,250,0.22)",
  accent:    "#6600FF",
  accentDim: "rgba(102,0,255,0.12)",
  accentGlo: "rgba(102,0,255,0.30)",
  accentLt:  "#9944FF",
  green:     "#22c55e",
  greenGlo:  "rgba(34,197,94,0.28)",
} as const

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const WRAP: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" }
const SEC: React.CSSProperties  = { padding: "120px 0", position: "relative" }

/* ══════════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════════════════════ */
function Reveal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

function PingDot({ color = T.green, size = 10 }: { color?: string; size?: number }) {
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

function Tag({ text, size }: { text: string; size?: "sm" }) {
  const [h, setH] = useState(false)
  const sm = size === "sm"
  return (
    <motion.span
      onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)}
      animate={h
        ? { background: T.accent, color: "#fff", borderColor: T.accent, boxShadow: `0 0 14px ${T.accentGlo}` }
        : { background: "rgba(255,255,255,0.05)", color: T.muted, borderColor: "rgba(255,255,255,0.10)", boxShadow: "none" }
      }
      transition={{ duration: 0.18 }}
      style={{ display: "inline-block", padding: sm ? "3px 9px" : "5px 11px", borderRadius: 9999, fontSize: sm ? 10 : 11, fontWeight: 600, cursor: "default", border: "1px solid transparent", letterSpacing: "0.03em" }}
    >{text}</motion.span>
  )
}

function Label({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
      <span style={{ width: 32, height: 1, background: T.accent, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: T.accentLt }}>{text}</span>
    </div>
  )
}

function Btn({ children, primary: _primary, small, type = "button", onClick }: {
  children: React.ReactNode; primary?: boolean; small?: boolean; type?: "button" | "submit"; onClick?: () => void
}) {
  return (
    <motion.button type={type} onClick={onClick} className="rainbow-btn"
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
      style={{
        position: "relative", padding: small ? "9px 20px" : "16px 34px",
        borderRadius: small ? 9 : 12, fontSize: small ? 13 : 15, fontWeight: 600,
        cursor: "pointer", letterSpacing: "0.01em", fontFamily: "inherit", border: "none",
        background: "rgba(255,255,255,0.06)", backdropFilter: "blur(24px) saturate(1.3)",
        WebkitBackdropFilter: "blur(24px) saturate(1.3)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09), 0 2px 10px rgba(0,0,0,0.18)",
        color: T.text, transition: "transform 0.15s",
      } as React.CSSProperties}
    >
      <span aria-hidden style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)", pointerEvents: "none" }} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </motion.button>
  )
}

function GlassCard({ children, padding = "36px 30px", radius = 16, height = "100%", onClick }: {
  children: React.ReactNode; padding?: string | number; radius?: number; height?: string | number; onClick?: () => void
}) {
  const [h, setH] = useState(false)
  const [lx, setLx] = useState(50)
  const [ly, setLy] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const trackCursor = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (r) { setLx(((e.clientX - r.left) / r.width) * 100); setLy(((e.clientY - r.top) / r.height) * 100) }
  }
  return (
    <motion.div ref={ref} data-glow="" onClick={onClick}
      onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)} onMouseMove={trackCursor}
      whileHover={{ y: -7, scale: 1.016 }} whileTap={{ scale: 0.982 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={{
        '--base': '220', '--spread': '140', '--radius': String(radius), '--border': '1.5', '--size': '270',
        position: "relative",
        backgroundColor: h ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.026)",
        backdropFilter: "blur(16px) saturate(1.5)", WebkitBackdropFilter: "blur(16px) saturate(1.5)",
        border: `1px solid ${h ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: radius, padding, height, cursor: onClick ? "pointer" : "default",
        boxShadow: h
          ? "0 22px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(102,0,255,0.13), inset 0 1px 0 rgba(255,255,255,0.10)"
          : "0 4px 20px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)",
        transition: "background-color 0.25s, border-color 0.25s, box-shadow 0.3s",
      } as React.CSSProperties}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: radius, background: h ? `radial-gradient(140px circle at ${lx}% ${ly}%, rgba(102,0,255,0.13) 0%, transparent 100%)` : "none", transition: "background 0.12s" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: `linear-gradient(90deg, transparent, rgba(255,255,255,${h ? 0.15 : 0.06}), transparent)`, pointerEvents: "none", transition: "all 0.3s" }} />
      <CornerBrackets />
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   CORNER BRACKETS DECORATION
══════════════════════════════════════════════════════════════════════════ */
function CornerBrackets({ color = "rgba(255,255,255,0.22)", size = 12, inset = 7 }: { color?: string; size?: number; inset?: number }) {
  const base: React.CSSProperties = { position: "absolute", width: size, height: size, borderColor: color, borderStyle: "solid", pointerEvents: "none" }
  return (
    <>
      <span aria-hidden style={{ ...base, top: inset,    left: inset,  borderWidth: "1.5px 0 0 1.5px" }} />
      <span aria-hidden style={{ ...base, bottom: inset, right: inset, borderWidth: "0 1.5px 1.5px 0" }} />
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   HERO CARD LABEL (pill with pulsing dot)
══════════════════════════════════════════════════════════════════════════ */
function HeroCardLabel({ text }: { text: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "8px 16px 8px 10px", borderRadius: 100, marginBottom: 26,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(16px) saturate(120%)", WebkitBackdropFilter: "blur(16px) saturate(120%)",
      border: "1px solid rgba(255,255,255,0.09)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.09)",
    }}>
      <PingDot color="#8B1A2F" size={6} />
      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase" as const, color: T.accentLt }}>{text}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   HERO STAT NUMBERS
══════════════════════════════════════════════════════════════════════════ */
function HeroStat({ value, label, index }: { value: string; label: string; index: number }) {
  return (
    <motion.div
      className="hp-hero-stat-item"
      animate={{ y: [0, index % 2 === 0 ? -5 : -7, 0] }}
      transition={{ duration: 3.2 + index * 0.38, repeat: Infinity, ease: "easeInOut", delay: index * 0.55 }}
      whileHover={{ scale: 1.05 }}
      style={{
        padding: "18px 16px 15px",
        borderRadius: 16, cursor: "default", position: "relative",
        display: "flex", flexDirection: "column", gap: 10,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px) saturate(120%)", WebkitBackdropFilter: "blur(16px) saturate(120%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)",
      } as React.CSSProperties}
    >
      <CornerBrackets />
      <span className="hp-hero-stat-value" style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #BF5FFF 0%, #C084FC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } as React.CSSProperties}>
        {value}
      </span>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4 }}>
        <span className="hp-hero-stat-label" style={{ fontSize: 9, color: "rgba(242,242,250,0.42)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, lineHeight: 1.4 }}>{label}</span>
        <span style={{ fontSize: 9, color: "rgba(242,242,250,0.20)", fontWeight: 600, letterSpacing: "0.06em", fontFamily: "'SF Mono','Fira Code','Consolas',monospace", lineHeight: 1, flexShrink: 0 }}>{String(index + 1).padStart(2, "0")}</span>
      </div>
    </motion.div>
  )
}

const HERO_SOCIALS = [
  { Icon: GithubIcon,    href: "https://github.com/nadiamaar-dev",          label: "GitHub"    },
  { Icon: LinkedinIcon,  href: "https://linkedin.com/in/nadiamaar",          label: "LinkedIn"  },
  { Icon: InstagramIcon, href: "https://instagram.com/nadiamaar.dev",        label: "Instagram" },
  { Icon: DiscordIcon,   href: "https://discord.gg/nadiamaar",               label: "Discord"   },
]

/* ══════════════════════════════════════════════════════════════════════════
   §1  HERO
══════════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section style={{ ...SEC, minHeight: 860, display: "flex", alignItems: "center", overflow: "hidden" }} id="s1" className="hp-sec hp-hero">
      {/* Orb 1 — purple, multi-axis animated */}
      <motion.div aria-hidden
        animate={{ x: [0, 60, -40, 70, 0], y: [0, -80, 60, -50, 0], scale: [1, 1.15, 0.9, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "5%", left: "32%", width: 720, height: 720, borderRadius: "50%", background: "radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }}
      />
      {/* Orb 2 — pink, desynchronized loop */}
      <motion.div aria-hidden
        animate={{ x: [0, -50, 80, -60, 0], y: [0, 70, -60, 80, 0], scale: [1, 0.85, 1.2, 0.92, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        style={{ position: "absolute", top: "25%", right: "-2%", width: 540, height: 540, borderRadius: "50%", background: "radial-gradient(circle, rgba(219,39,119,0.10) 0%, transparent 70%)", filter: "blur(72px)", pointerEvents: "none" }}
      />

      <div style={{ ...WRAP, position: "relative", zIndex: 1 }} className="hp-wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <Label text="Shopify Expert · AI Automation · Growth Marketing" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          style={{ fontSize: "clamp(38px, 5.2vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.036em", margin: "0 0 28px", maxWidth: 760 }}
        >
          Full-Stack Developer {" + "}
          <span style={{ background: "linear-gradient(95deg, #BF5FFF 0%, #F0ABFC 50%, #C084FC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } as React.CSSProperties}>
            Digital Strategist
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.22, ease }}
          style={{ fontSize: "clamp(15px, 1.4vw, 18px)", color: T.muted, maxWidth: 580, lineHeight: 1.82, margin: "0 0 40px" }}
        >
          Sviluppo <strong style={{ color: T.text, fontWeight: 700 }}>Shopify enterprise su misura</strong> con integrazioni API complesse per cataloghi oltre 30.000 SKU. Implemento{" "}
          <strong style={{ color: T.text, fontWeight: 700 }}>agenti AI autonomi</strong> per content generation e automazione operativa, sincronizzati con le campagne{" "}
          <strong style={{ color: T.text, fontWeight: 700 }}>Meta e Google Ads</strong> per massimizzare il ROI in ogni fase del funnel.
        </motion.p>

        {/* CTA + social icons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.36, ease }}
          className="hp-hero-ctas"
          style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
        >
          <motion.button
            className="rainbow-btn hp-hero-primary-btn"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            style={{
              position: "relative", padding: "16px 34px", borderRadius: 12, fontSize: 15, fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.01em", fontFamily: "inherit", border: "none",
              background: "rgba(255,255,255,0.06)", backdropFilter: "blur(24px) saturate(1.3)",
              WebkitBackdropFilter: "blur(24px) saturate(1.3)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09), 0 2px 10px rgba(0,0,0,0.18)",
              color: T.text,
            } as React.CSSProperties}
          >
            <span aria-hidden style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)", pointerEvents: "none" }} />
            <span style={{ position: "relative", zIndex: 1 }}>Avvia il tuo Progetto</span>
          </motion.button>

          <span className="hp-hero-sep" style={{ width: 1, height: 36, background: "rgba(255,255,255,0.10)", flexShrink: 0 }} />

          <div className="hp-hero-social-icons" style={{ display: "flex", gap: 10 }}>
            {HERO_SOCIALS.map(({ Icon, href, label }) => (
              <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(102,0,255,0.14)" }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                style={{
                  width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center",
                  justifyContent: "center", color: T.muted, border: "1px solid rgba(255,255,255,0.09)",
                  backgroundColor: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)", textDecoration: "none", flexShrink: 0,
                } as React.CSSProperties}
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Stats row — 4 cols desktop / 2×2 mobile */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.52, ease }}
          className="hp-hero-stats"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 32 }}
        >
          <HeroStat value="05+" label="Anni di Esperienza"      index={0} />
          <HeroStat value="30k+" label="Prodotti Sincronizzati" index={1} />
          <HeroStat value="100%" label="Soluzioni Custom"       index={2} />
          <HeroStat value="50+" label="Progetti Completati"     index={3} />
        </motion.div>
      </div>
    </section>
  )
}


/* ══════════════════════════════════════════════════════════════════════════
   §3  ALL-IN-ONE ADVANTAGE
══════════════════════════════════════════════════════════════════════════ */
const ADVANTAGES = [
  { n: "01", title: "Velocità di Esecuzione", body: "Nessun passaggio di consegne o perdita di informazioni. Dal codice alla campagna pubblicitaria, tutto è perfettamente allineato." },
  { n: "02", title: "Infrastrutture Senza Errori", body: "Le automazioni e le connessioni ai fornitori vengono testate da chi ha progettato l'architettura del sito." },
  { n: "03", title: "Ottimizzazione del Budget", body: "Meno intermediari significa che ogni euro investito va direttamente a potenziare il tuo ROI." },
]

function AdvCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <GlassCard>
      <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 24, background: `linear-gradient(135deg, ${T.accent}60, ${T.accentLt}28)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } as React.CSSProperties}>{n}</div>
      <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 14, color: T.text }}>{title}</h3>
      <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.8 }}>{body}</p>
    </GlassCard>
  )
}

function AllInOne() {
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }} id="s3" className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <Label text="The All-In-One Advantage" />
          <h2 style={{ fontSize: "clamp(26px, 3.4vw, 44px)", fontWeight: 700, lineHeight: 1.13, letterSpacing: "-0.028em", marginBottom: 18, maxWidth: 720 }}>
            Perché i brand lungimiranti scelgono un unico Partner Strategico?
          </h2>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.8, maxWidth: 680, marginBottom: 64 }}>
            Gestire un business online oggi richiede uno sviluppatore, un designer, un esperto di automazioni API e un'agenzia di marketing. Risultato? Costi frammentati, problemi di comunicazione e ritardi continui. Ottieni tutto questo in un'unica soluzione integrata:
          </p>
        </Reveal>
        <div className="hp-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {ADVANTAGES.map((a, i) => <Reveal key={i}><AdvCard {...a} /></Reveal>)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SKILL CARD ICONS
══════════════════════════════════════════════════════════════════════════ */
const TkShopify = () => (<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h14l-1.5 11H4.5L3 5z"/><path d="M7 5V3.5a3 3 0 0 1 6 0V5"/></svg>)
const TkFramer  = () => (<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="4 2 16 2 16 10 10 10 10 18 4 10"/></svg>)
const TkAPI     = () => (<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7H3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2"/><path d="M15 7h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><rect x="5" y="5" width="10" height="10" rx="2"/></svg>)
const TkAI      = () => (<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="3"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="10" y1="16" x2="10" y2="18"/><line x1="2" y1="10" x2="4" y2="10"/><line x1="16" y1="10" x2="18" y2="10"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="13.66" y1="13.66" x2="15.07" y2="15.07"/><line x1="4.93" y1="15.07" x2="6.34" y2="13.66"/><line x1="13.66" y1="6.34" x2="15.07" y2="4.93"/></svg>)

const SKILL_CARDS_DATA = [
  {
    icon: <TkShopify />,
    title: "E-Commerce Development",
    tags: ["Shopify", "Liquid Optimization", "Enterprise Stores", "Cataloghi 30k+ SKU", "Scalable Platforms", "Conversion Rate Optimization"],
  },
  {
    icon: <TkFramer />,
    title: "Design & Frontend",
    tags: ["Framer", "Webflow", "React Components", "UI/UX Design", "Fluid Animations", "Interactive Interfaces", "High-Impact Portfolios"],
  },
  {
    icon: <TkAPI />,
    title: "Process Engineering & API",
    tags: ["Node.js", "Python", "Custom Middleware", "API Integration", "Real-Time Sync", "Dropshipping Systems", "ERP & CRM"],
  },
  {
    icon: <TkAI />,
    title: "AI & Growth Automation",
    tags: ["AI Content Automation", "E-Commerce SEO", "AI Chatbots", "Conversion Recovery", "Smart Cart Recovery", "Meta Ads"],
  },
]

function SkillCard({ icon, title, tags }: { icon: React.ReactNode; title: string; tags: string[] }) {
  const [h, setH] = useState(false)
  const [lx, setLx] = useState(50)
  const [ly, setLy] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const track = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (r) { setLx(((e.clientX - r.left) / r.width) * 100); setLy(((e.clientY - r.top) / r.height) * 100) }
  }
  return (
    <motion.div ref={ref} className="hp-skillcard"
      onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)} onMouseMove={track}
      whileHover={{ y: -8, scale: 1.016 }} whileTap={{ scale: 0.982 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      style={{
        aspectRatio: "1 / 1",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "22px",
        borderRadius: 18,
        overflow: "hidden",
        /* 1. Glass background */
        backgroundColor: h ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        /* 2. Backdrop blur — core glass effect */
        backdropFilter: "blur(16px) saturate(120%)",
        WebkitBackdropFilter: "blur(16px) saturate(120%)",
        /* 3. Crisp glass edge */
        border: `1px solid ${h ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"}`,
        /* 4. Depth shadow */
        boxShadow: h
          ? "0 16px 48px 0 rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)"
          : "0 8px 32px 0 rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.07)",
        transition: "background-color 0.28s, border-color 0.28s, box-shadow 0.32s",
      } as React.CSSProperties}
    >
      {/* Subtle cursor-tracking glow — only on hover */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 18, background: h ? `radial-gradient(180px circle at ${lx}% ${ly}%, rgba(255,255,255,0.055) 0%, transparent 100%)` : "none", transition: "background 0.14s" }} />
      {/* Top-edge reflection line */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, pointerEvents: "none", background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,${h ? 0.22 : 0.10}) 40%, rgba(255,255,255,${h ? 0.18 : 0.07}) 70%, transparent 100%)` }} />
      {/* Left-edge reflection line (glass edge illusion) */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 1, bottom: 0, pointerEvents: "none", background: `linear-gradient(180deg, rgba(255,255,255,${h ? 0.20 : 0.08}) 0%, transparent 60%)` }} />
      <CornerBrackets color="rgba(255,255,255,0.20)" />

      {/* 5. Content — title + icon row */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em", lineHeight: 1.35 }}>{title}</h3>
        <div className="hp-skillcard-icon" style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.accentLt,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
          transition: "background 0.22s",
        }}>
          {icon}
        </div>
      </div>

      {/* 5. Tags — glass-tinted badges */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: 6, alignContent: "flex-start" }}>
        {tags.map((tag, j) => <Tag key={j} text={tag} size="sm" />)}
      </div>
    </motion.div>
  )
}

function SkillsCardsGrid() {
  return (
    <section style={{ ...SEC, padding: "88px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 18 }}>
            <span style={{ width: 28, height: 1, background: T.accent, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: T.accentLt }}>Stack Tecnologico</span>
            <span style={{ width: 28, height: 1, background: T.accent, flexShrink: 0 }} />
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.4vw, 44px)", fontWeight: 700, lineHeight: 1.13, letterSpacing: "-0.028em", marginBottom: 12 }}>
            Skills
          </h2>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.7 }}>
            Esperienze UI/UX fluide e codice pulito
          </p>
        </div>
        <div className="hp-skillcards" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {SKILL_CARDS_DATA.map((card, i) => <SkillCard key={i} {...card} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §4  SKILLS
══════════════════════════════════════════════════════════════════════════ */
const SkillIconLayers = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
    <defs><linearGradient id="sk-g1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#9944FF"/><stop offset="1" stopColor="#C084FC"/></linearGradient></defs>
    <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="url(#sk-g1)"/>
    <polyline points="2 17 12 22 22 17" stroke="url(#sk-g1)"/>
    <polyline points="2 12 12 17 22 12" stroke="url(#sk-g1)"/>
  </svg>
)
const SkillIconCpu = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
    <defs><linearGradient id="sk-g2" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#9944FF"/><stop offset="1" stopColor="#C084FC"/></linearGradient></defs>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="url(#sk-g2)"/>
    <rect x="9" y="9" width="6" height="6" stroke="url(#sk-g2)"/>
    <line x1="9" y1="1" x2="9" y2="4" stroke="url(#sk-g2)"/>
    <line x1="15" y1="1" x2="15" y2="4" stroke="url(#sk-g2)"/>
    <line x1="9" y1="20" x2="9" y2="23" stroke="url(#sk-g2)"/>
    <line x1="15" y1="20" x2="15" y2="23" stroke="url(#sk-g2)"/>
    <line x1="20" y1="9" x2="23" y2="9" stroke="url(#sk-g2)"/>
    <line x1="20" y1="14" x2="23" y2="14" stroke="url(#sk-g2)"/>
    <line x1="1" y1="9" x2="4" y2="9" stroke="url(#sk-g2)"/>
    <line x1="1" y1="14" x2="4" y2="14" stroke="url(#sk-g2)"/>
  </svg>
)
const SkillIconRocket = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
    <defs><linearGradient id="sk-g3" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#9944FF"/><stop offset="1" stopColor="#C084FC"/></linearGradient></defs>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke="url(#sk-g3)"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="url(#sk-g3)"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" stroke="url(#sk-g3)"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="url(#sk-g3)"/>
  </svg>
)

const SKILLS: { icon: React.ReactNode; title: string; items: { name: string; desc: string }[] }[] = [
  { icon: <SkillIconLayers />, title: "Sviluppo & Architettura Web", items: [
    { name: "Piattaforme E-Commerce Scalabili", desc: "Sviluppo avanzato su Shopify con ottimizzazione del codice Liquid per cataloghi massivi oltre i 30.000 prodotti. Store enterprise ottimizzati per conversioni e velocità di caricamento fulminee." },
    { name: "Siti Corporate & Portfolio d'Impatto", desc: "Creazione di interfacce interattive e moderne con Framer e Webflow, utilizzando componentistica React personalizzata per animazioni fluide e una UX superiore." },
    { name: "Ingegnerizzazione dei Processi & API", desc: "Integrazione e configurazione di API/Middleware personalizzati (Node.js, Python) per connettere in tempo reale fornitori, dropshipper, inventari, gestionali (ERP) e CRM." },
  ]},
  { icon: <SkillIconCpu />, title: "Intelligenza Artificiale & Automazione", items: [
    { name: "Content Automation", desc: "Implementazione di sistemi AI per la generazione massiva e l'ottimizzazione SEO di schede prodotto, descrizioni e attributi tecnici, migliorando l'efficienza operativa." },
    { name: "Customer Experience", desc: "Sviluppo di Chatbot intelligenti e assistenti virtuali per automatizzare il customer care e incrementare le conversioni." },
    { name: "Smart Conversion & Recovery", desc: "Intercettazione intelligente degli abbandoni tramite AI. Sistemi automatizzati per il recupero dei carrelli e sconti dinamici in tempo reale, progettati per abbattere il tasso di abbandono e recuperare vendite perse." },
  ]},
  { icon: <SkillIconRocket />, title: "Performance Marketing & Growth", items: [
    { name: "E-Commerce SEO", desc: "Architettura SEO avanzata studiata per garantire il massimo posizionamento organico su motori di ricerca per cataloghi di grandi dimensioni." },
    { name: "Paid Advertising orientato al ROI", desc: "Strategia, setup e scaling di campagne pubblicitarie ad alto budget su Meta (Facebook & Instagram), Google Ads e Pinterest." },
    { name: "UI/UX Design & Sviluppo Applicativo", desc: "Studio del comportamento dell'utente per interfacce fluide. Sviluppo di web app e funzionalità su misura per differenziare il brand sul mercato." },
  ]},
]

function SkillAccordion({ icon, title, items, defaultOpen }: { icon: React.ReactNode; title: string; items: { name: string; desc: string }[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <Reveal>
      <div data-glow="" style={{ '--base': '220', '--spread': '140', '--radius': '16', '--border': '1.5', '--size': '270', borderRadius: 16, position: "relative", backgroundColor: "rgba(255,255,255,0.026)", backdropFilter: "blur(16px) saturate(1.4)", WebkitBackdropFilter: "blur(16px) saturate(1.4)", border: `1px solid ${open ? "rgba(102,0,255,0.32)" : "rgba(255,255,255,0.07)"}`, boxShadow: open ? "0 10px 30px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.07)" : "0 2px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background-color 0.25s, border-color 0.25s, box-shadow 0.3s" } as React.CSSProperties}>
        <CornerBrackets />
        <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 18, padding: "26px 32px", background: open ? "rgba(102,0,255,0.07)" : "transparent", border: "none", cursor: "pointer", color: T.text, textAlign: "left", fontFamily: "inherit", transition: "background 0.25s" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: open ? "rgba(102,0,255,0.20)" : "rgba(102,0,255,0.10)", border: `1px solid ${open ? "rgba(153,68,255,0.45)" : "rgba(153,68,255,0.22)"}`, boxShadow: open ? "0 0 14px rgba(102,0,255,0.28), inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.05)", transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s" }}>
            {icon}
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", flex: 1 }}>{title}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ fontSize: 11, color: T.accentLt, lineHeight: 1 }}>▼</motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} style={{ overflow: "hidden" }}>
              <div className="hp-skills-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: T.border }}>
                {items.map((item, i) => (
                  <div key={i} style={{ background: T.bg, padding: "28px 32px" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 10, letterSpacing: "-0.01em" }}>{item.name}</h4>
                    <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.8 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

function Skills() {
  return (
    <section id="s4" style={{ ...SEC, borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <Label text="Core Skills & Tech Stack" />
          <h2 style={{ fontSize: "clamp(26px, 3.4vw, 44px)", fontWeight: 700, lineHeight: 1.13, letterSpacing: "-0.028em", marginBottom: 60, maxWidth: 560 }}>
            Soluzioni su misura per scalare il tuo business online
          </h2>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SKILLS.map((s, i) => <SkillAccordion key={i} {...s} defaultOpen={i === 0} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §5  METHOD — CAROUSEL + ANIMATED VISUALS
══════════════════════════════════════════════════════════════════════════ */

function VisualAnalisi() {
  const cx = 150, cy = 125, R = 80
  const topics = ["Mercato","Stack Tech","Obiettivi","Competitor","Logistica","Budget"]
  const sats = topics.map((label, i) => {
    const a = (i * 60 - 90) * (Math.PI / 180)
    return { label, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
  })
  return (
    <svg viewBox="0 0 300 250" width="100%" height="100%">
      {sats.map((s, i) => (
        <motion.path key={i} d={`M${cx},${cy}L${s.x},${s.y}`}
          stroke="rgba(153,68,255,0.28)" strokeWidth="1" fill="none" strokeDasharray="4 3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
        />
      ))}
      <motion.circle cx={cx} cy={cy} r={36} fill="rgba(102,0,255,0.07)"
        animate={{ r: [36, 45, 36] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle cx={cx} cy={cy} r={28}
        fill="rgba(102,0,255,0.18)" stroke="rgba(192,132,252,0.55)" strokeWidth="1.5"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 250, delay: 0.1 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={9} fontWeight="700"
        fill="#C084FC" fontFamily="Inter,sans-serif">Business</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize={6.5} fill="rgba(192,132,252,0.5)"
        fontFamily="Inter,sans-serif">Analysis</text>
      {sats.map((s, i) => (
        <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 280 }}
          style={{ transformOrigin: `${s.x}px ${s.y}px` }}
        >
          <circle cx={s.x} cy={s.y} r={21} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.13)" strokeWidth="1"/>
          <text x={s.x} y={s.y + 1.5} textAnchor="middle" fontSize={7} fill="rgba(242,242,250,0.68)"
            fontFamily="Inter,sans-serif">{s.label}</text>
        </motion.g>
      ))}
      {sats.map((s, i) => (
        <motion.circle key={`p${i}`} cx={cx} cy={cy} r={2.5} fill="#9944FF"
          animate={{ x: [0, s.x - cx, 0], y: [0, s.y - cy, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.38, ease: "easeInOut" }}
        />
      ))}
    </svg>
  )
}

function VisualDesign() {
  return (
    <svg viewBox="0 0 300 220" width="100%" height="100%">
      <motion.rect x={15} y={10} width={270} height={200} rx={10}
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.11)" strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}
      />
      <motion.rect x={15} y={10} width={270} height={30} rx={10}
        fill="rgba(255,255,255,0.06)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
      />
      {[22,32,42].map((x, i) => (
        <motion.circle key={i} cx={x} cy={25} r={4}
          fill={["#ff5f56","#ffbd2e","#27c93f"][i]}
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.75, scale: 1 }}
          transition={{ delay: 0.12 + i * 0.05, type: "spring" }}
          style={{ transformOrigin: `${x}px 25px` }}
        />
      ))}
      <motion.rect x={65} y={17} width={170} height={16} rx={8}
        fill="rgba(255,255,255,0.07)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
      />
      <motion.rect x={25} y={50} width={250} height={16} rx={5}
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" strokeWidth="1"
        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ transformOrigin: "150px 58px" }}
      />
      <motion.rect x={25} y={76} width={250} height={50} rx={7}
        fill="rgba(102,0,255,0.09)" stroke="rgba(153,68,255,0.20)" strokeWidth="1"
        initial={{ opacity: 0, scaleX: 0.7 }} animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.34, duration: 0.4, ease: [0.16,1,0.3,1] }}
        style={{ transformOrigin: "150px 101px" }}
      />
      <motion.rect x={55} y={90} width={0} height={8} rx={4} fill="rgba(192,132,252,0.45)"
        animate={{ width: 110 }} transition={{ delay: 0.54, duration: 0.5 }}
      />
      <motion.rect x={80} y={105} width={0} height={5} rx={3} fill="rgba(255,255,255,0.14)"
        animate={{ width: 60 }} transition={{ delay: 0.68, duration: 0.35 }}
      />
      <motion.rect x={167} y={89} width={2} height={11} rx={1} fill="rgba(192,132,252,0.75)"
        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.9 }}
      />
      {[25,112,199].map((x, i) => (
        <motion.g key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54 + i * 0.09, duration: 0.35, ease: [0.16,1,0.3,1] }}
        >
          <rect x={x} y={138} width={76} height={54} rx={7}
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          <circle cx={x+38} cy={157} r={9} fill="rgba(102,0,255,0.17)"/>
          <rect x={x+16} y={172} width={44} height={4} rx={2} fill="rgba(255,255,255,0.10)"/>
          <rect x={x+22} y={180} width={32} height={3} rx={2} fill="rgba(255,255,255,0.06)"/>
        </motion.g>
      ))}
    </svg>
  )
}

function VisualAPI() {
  const boxes = [
    { label: "Fornitore", sub: "ERP/CRM",     x: 14,  y: 72, w: 76, h: 86,  ac: "rgba(102,0,255,0.16)", bd: "rgba(153,68,255,0.36)" },
    { label: "API Layer", sub: "Middleware",   x: 112, y: 50, w: 76, h: 130, ac: "rgba(192,132,252,0.10)", bd: "rgba(192,132,252,0.40)" },
    { label: "Shopify",   sub: "+ Analytics",  x: 210, y: 72, w: 76, h: 86,  ac: "rgba(102,0,255,0.16)", bd: "rgba(153,68,255,0.36)" },
  ]
  return (
    <svg viewBox="0 0 300 230" width="100%" height="100%">
      <motion.text x={150} y={20} textAnchor="middle" fontSize={15} fontWeight="800"
        fill="#C084FC" fontFamily="Inter,sans-serif"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      >30.247 SKU</motion.text>
      <motion.text x={150} y={36} textAnchor="middle" fontSize={7} fill="rgba(192,132,252,0.48)"
        fontFamily="Inter,sans-serif"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
      >sincronizzati in tempo reale</motion.text>
      {[[90,115,112,115],[188,115,210,115]].map(([x1,y1,x2,y2], i) => (
        <motion.path key={i} d={`M${x1},${y1}L${x2},${y2}`}
          stroke="rgba(153,68,255,0.26)" strokeWidth="1.5" fill="none" strokeDasharray="5 3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.15 }}
        />
      ))}
      {[112,210].map((x, i) => (
        <motion.polygon key={i} points={`${x},111 ${x},119 ${x+7},115`}
          fill="rgba(153,68,255,0.48)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.15 }}
        />
      ))}
      {boxes.map((b, i) => (
        <motion.g key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.14, duration: 0.45, ease: [0.16,1,0.3,1] }}
        >
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={11} fill={b.ac} stroke={b.bd} strokeWidth="1"/>
          <text x={b.x+b.w/2} y={b.y+b.h/2-5} textAnchor="middle" fontSize={8} fontWeight="600"
            fill="rgba(242,242,250,0.88)" fontFamily="Inter,sans-serif">{b.label}</text>
          <text x={b.x+b.w/2} y={b.y+b.h/2+8} textAnchor="middle" fontSize={6.5}
            fill="rgba(242,242,250,0.38)" fontFamily="Inter,sans-serif">{b.sub}</text>
          <motion.circle cx={b.x+b.w-11} cy={b.y+11} r={3.5} fill="#22c55e"
            animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.45 }}/>
          <motion.circle cx={b.x+b.w-11} cy={b.y+11} r={7} fill="rgba(34,197,94,0.16)"
            animate={{ r: [7,13,7], opacity: [0.35,0,0.35] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i*0.45 }}/>
        </motion.g>
      ))}
      {[0,1].map(edge => [0,1,2].map(j => (
        <motion.rect key={`p${edge}-${j}`}
          x={edge===0 ? 86 : 184} y={112} width={8} height={6} rx={2} fill="rgba(153,68,255,0.65)"
          animate={{ x: [0,22,22], opacity: [0,1,0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: j*0.4 + edge*0.22, ease: "easeInOut" }}
        />
      )))}
    </svg>
  )
}

function VisualLancio() {
  const pts: [number,number][] = [[22,178],[57,162],[92,147],[127,124],[162,92],[197,62],[232,34]]
  const lineD = `M${pts.map(([x,y])=>`${x},${y}`).join(" L")}`
  const areaD = `${lineD} L232,192 L22,192 Z`
  return (
    <svg viewBox="0 0 260 205" width="100%" height="100%">
      <defs>
        <linearGradient id="mgl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#F0ABFC"/>
        </linearGradient>
        <linearGradient id="mga" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(102,0,255,0.20)"/><stop offset="100%" stopColor="rgba(102,0,255,0)"/>
        </linearGradient>
      </defs>
      {[40,80,120,160].map((y,i) => (
        <line key={i} x1={22} y1={y} x2={242} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      ))}
      <motion.path d={areaD} fill="url(#mga)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
      />
      <motion.path d={lineD} stroke="url(#mgl)" strokeWidth="2.5" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: [0.16,1,0.3,1], delay: 0.2 }}
      />
      {pts.map(([x,y],i) => (
        <motion.circle key={i} cx={x} cy={y} r={4}
          fill="#C084FC" stroke="rgba(5,5,10,0.8)" strokeWidth="2"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.25 + (i/pts.length)*1.3, type: "spring", stiffness: 350 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      ))}
      {["Gen","Feb","Mar","Apr","Mag","Giu","Lug"].map((m,i) => (
        <text key={i} x={22+i*35} y={200} textAnchor="middle" fontSize={6.5}
          fill="rgba(242,242,250,0.26)" fontFamily="Inter,sans-serif">{m}</text>
      ))}
      {[{v:"+240%",l:"ROI",x:152,y:56},{v:"+85%",l:"CRO",x:152,y:106}].map((m,i) => (
        <motion.g key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 + i * 0.18, duration: 0.4 }}
        >
          <rect x={m.x} y={m.y-14} width={58} height={28} rx={8}
            fill="rgba(102,0,255,0.16)" stroke="rgba(153,68,255,0.35)" strokeWidth="1"/>
          <text x={m.x+29} y={m.y-1} textAnchor="middle" fontSize={13} fontWeight="800"
            fill="#C084FC" fontFamily="Inter,sans-serif">{m.v}</text>
          <text x={m.x+29} y={m.y+9} textAnchor="middle" fontSize={7}
            fill="rgba(192,132,252,0.52)" fontFamily="Inter,sans-serif">{m.l}</text>
        </motion.g>
      ))}
    </svg>
  )
}

const METHOD_STEPS = [
  { n: "01", label: "FASE 1", title: "Analisi Tecnica e di Business", body: "Non inizio a scrivere codice senza una strategia. Analizzo il tuo modello di business, i competitor e i flussi logistici per mappare lo stack tecnologico perfetto in base ai tuoi obiettivi commerciali." },
  { n: "02", label: "FASE 2", title: "UI/UX Design & Sviluppo", body: "Progetto l'interfaccia focalizzandomi sulla User Experience. Sviluppo l'infrastruttura garantendo velocità di caricamento massime, sicurezza e un design sartoriale studiato sul target." },
  { n: "03", label: "FASE 3", title: "Ingegnerizzazione & Sincronizzazione API", body: "Collego i sistemi di fornitori e gestionali. Automatizzo l'aggiornamento in tempo reale di scorte, prezzi e ordini. Configuro l'AI per ottimizzare il catalogo ed eliminare i processi manuali." },
  { n: "04", label: "FASE 4", title: "Lancio, Tracking & Growth Marketing", body: "Configuro i pixel di tracciamento e attivo i canali di acquisizione (SEO, Adv, Social). Monitoro i dati in tempo reale per ottimizzare il tasso di conversione (CRO) e scalare il fatturato." },
]

const METHOD_VISUALS = [VisualAnalisi, VisualDesign, VisualAPI, VisualLancio]

function MethodNavBtn({ active, tick, duration, label, onClick }: {
  active: boolean; tick: number; duration: number; label: string; onClick: () => void
}) {
  const [h, setH] = useState(false)
  const [lx, setLx] = useState(50)
  const [ly, setLy] = useState(50)
  const ref = useRef<HTMLButtonElement>(null)
  const trackCursor = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (r) { setLx(((e.clientX - r.left) / r.width) * 100); setLy(((e.clientY - r.top) / r.height) * 100) }
  }
  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      data-glow=""
      onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onMouseMove={trackCursor}
      animate={{ opacity: active ? 1 : 0.68 }}
      style={{
        "--base": "220", "--spread": "140", "--radius": "12", "--border": "1.5", "--size": "260",
        flex: 1, padding: "16px 18px", borderRadius: 12, cursor: "pointer",
        fontFamily: "inherit", textAlign: "left" as const, position: "relative",
        backgroundColor: active ? "rgba(102,0,255,0.11)" : h ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.026)",
        border: `1px solid ${active ? "rgba(102,0,255,0.38)" : h ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: h || active ? "0 8px 28px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.10)" : "0 2px 10px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        transition: "background-color 0.25s, border-color 0.25s, box-shadow 0.3s",
      } as React.CSSProperties}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 12, background: h ? `radial-gradient(110px circle at ${lx}% ${ly}%, rgba(102,0,255,0.16) 0%, transparent 100%)` : "none", transition: "background 0.1s" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, pointerEvents: "none", background: `linear-gradient(90deg, transparent, rgba(255,255,255,${h ? 0.14 : 0.05}), transparent)`, transition: "all 0.3s" }} />
      {active && (
        <motion.div key={tick} initial={{ width: "0%" }} animate={{ width: "100%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, ${T.accentLt})` }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, fontSize: 13, fontWeight: 600, color: active ? T.text : T.muted, letterSpacing: "0.02em" }}>
        {label}
      </div>
    </motion.button>
  )
}

function MethodCarousel() {
  const [step, setStep] = useState(0)
  const [tick, setTick] = useState(0)
  const [ch, setCh] = useState(false)
  const [lx, setLx] = useState(50)
  const [ly, setLy] = useState(50)
  const cardRef = useRef<HTMLDivElement>(null)
  const STEP_MS = 9000

  useEffect(() => {
    const t = setTimeout(() => { setStep(s => (s + 1) % 4); setTick(k => k + 1) }, STEP_MS)
    return () => clearTimeout(t)
  }, [step])

  const goTo = (i: number) => { setStep(i); setTick(k => k + 1) }
  const Visual = METHOD_VISUALS[step]
  const trackCursor = (e: React.MouseEvent) => {
    const r = cardRef.current?.getBoundingClientRect()
    if (r) { setLx(((e.clientX - r.left) / r.width) * 100); setLy(((e.clientY - r.top) / r.height) * 100) }
  }

  return (
    <div>
      <motion.div ref={cardRef} data-glow=""
        onHoverStart={() => setCh(true)} onHoverEnd={() => setCh(false)} onMouseMove={trackCursor}
        style={{
          '--base': '220', '--spread': '140', '--radius': '20', '--border': '1.5', '--size': '320',
          borderRadius: 20, overflow: "hidden", position: "relative",
          background: ch ? "rgba(255,255,255,0.042)" : "rgba(255,255,255,0.026)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${ch ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.08)"}`,
          boxShadow: ch
            ? "0 22px 50px rgba(0,0,0,0.50), 0 0 0 1px rgba(102,0,255,0.13), inset 0 1px 0 rgba(255,255,255,0.10)"
            : "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
          marginBottom: 28,
          transition: "background 0.25s, border-color 0.25s, box-shadow 0.3s",
        } as React.CSSProperties}>
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, borderRadius: 20, background: ch ? `radial-gradient(240px circle at ${lx}% ${ly}%, rgba(102,0,255,0.11) 0%, transparent 100%)` : "none", transition: "background 0.12s" }} />
        <div aria-hidden style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, pointerEvents: "none", zIndex: 0, background: `linear-gradient(90deg, transparent, rgba(255,255,255,${ch ? 0.14 : 0.06}), transparent)`, transition: "all 0.3s" }} />
        <CornerBrackets inset={10} />
        <div className="hp-method-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative", zIndex: 1 }}>
          <div className="hp-method-content" style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.38, ease: [0.16,1,0.3,1] }}>
                <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 18, background: `linear-gradient(135deg, ${T.accent}55, ${T.accentLt}28)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } as React.CSSProperties}>
                  {METHOD_STEPS[step].n}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: T.text, marginBottom: 18, lineHeight: 1.25, overflowWrap: "break-word" }}>
                  {METHOD_STEPS[step].title}
                </h3>
                <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.82, overflowWrap: "break-word" }}>
                  {METHOD_STEPS[step].body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="hp-method-visual" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.13)", borderLeft: "1px solid rgba(255,255,255,0.05)", padding: "28px", minHeight: 320 }}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.38, ease: [0.16,1,0.3,1] }} style={{ width: "100%", height: "100%" }}>
                <Visual />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      <div className="hp-method-nav" style={{ display: "flex", gap: 8 }}>
        {METHOD_STEPS.map((s, i) => (
          <MethodNavBtn key={i} active={step === i} tick={tick} duration={STEP_MS} label={s.label} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  )
}

function Method() {
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }} id="s5" className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <Label text="Il Metodo di Lavoro" />
          <h2 style={{ fontSize: "clamp(26px, 3.4vw, 44px)", fontWeight: 700, lineHeight: 1.13, letterSpacing: "-0.028em", marginBottom: 48, maxWidth: 580, color: T.text }}>
            Una roadmap chiara e trasparente,{" "}
            <span style={{ background: "linear-gradient(90deg, #BF5FFF, #C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } as React.CSSProperties}>
              orientata ai risultati.
            </span>
          </h2>
        </Reveal>
        <MethodCarousel />
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §6  PORTFOLIO
══════════════════════════════════════════════════════════════════════════ */
const PROJECTS = [
  { title: "E-Commerce Enterprise", desc: "Store scalabile con catalogo 30k+ SKU, logistica sincronizzata e velocità di caricamento ottimizzata per conversioni massime.", tags: ["Shopify", "API Custom", "Liquid", "CRO"] },
  { title: "Corporate Brand Identity", desc: "Sito istituzionale con interfaccia interattiva, animazioni React personalizzate e UX ad alto impatto visivo.", tags: ["Framer", "React Custom", "UI/UX"] },
  { title: "SEO Architecture Platform", desc: "Infrastruttura SEO tecnica per catalogo massivo con architettura ottimizzata per il posizionamento organico.", tags: ["Webflow", "SEO Arch", "CMS"] },
  { title: "API Integration Suite", desc: "Middleware per sincronizzazione ERP/CRM in tempo reale con aggiornamento automatico di stock, prezzi e ordini.", tags: ["Node.js", "Python", "REST API"] },
  { title: "Growth Marketing System", desc: "Setup full-funnel con tracciamento avanzato, ottimizzazione CRO e campagne ad alto budget su Meta e Google.", tags: ["Meta Ads", "Google Ads", "Analytics"] },
  { title: "AI Automation Engine", desc: "Sistema AI per generazione massiva di contenuti, ottimizzazione SEO prodotti e automazione dei processi operativi.", tags: ["AI / LLM", "Python", "Automation"] },
]

function ProjectCard({ title, desc, tags }: { title: string; desc: string; tags: string[] }) {
  const [h, setH] = useState(false)
  return (
    <GlassCard padding={0} onClick={() => {}}>
      <div style={{ height: 172, background: "linear-gradient(135deg, rgba(8,8,22,0.9) 0%, rgba(20,20,46,0.8) 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
        <motion.div animate={{ opacity: h ? 0.6 : 0.2, scale: h ? 1.1 : 1 }} transition={{ duration: 0.35 }} style={{ fontSize: 44, color: T.accentLt }} onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)}>◈</motion.div>
        <AnimatePresence>
          {h && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${T.accentDim}, rgba(102,0,255,0.07))` }} />}
        </AnimatePresence>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 8, color: T.text }}>{title}</h3>
        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.75, marginBottom: 16, flex: 1 }}>{desc}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{tags.map((tag, i) => <Tag key={i} text={tag} />)}</div>
      </div>
    </GlassCard>
  )
}

function Portfolio() {
  return (
    <section id="s6" style={SEC} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <Label text="Social Proof / Portfolio" />
          <h2 style={{ fontSize: "clamp(26px, 3.4vw, 44px)", fontWeight: 700, lineHeight: 1.13, letterSpacing: "-0.028em", marginBottom: 18 }}>Piattaforme che Guidano la Crescita</h2>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.8, maxWidth: 620, marginBottom: 56 }}>Esplora i progetti commerciali e corporate che ho ingegnerizzato, trasformandoli in asset digitali ad alto rendimento.</p>
        </Reveal>
        <div className="hp-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {PROJECTS.map((p, i) => <Reveal key={i}><ProjectCard {...p} /></Reveal>)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §7  SCARCITY
══════════════════════════════════════════════════════════════════════════ */
function Scarcity() {
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }} id="s7" className="hp-sec">
      <div style={{ ...WRAP, textAlign: "center" }} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: `${T.green}10`, border: `1px solid ${T.green}30`, borderRadius: 100, padding: "10px 24px", marginBottom: 44, cursor: "default" }}>
            <PingDot />
            <span style={{ fontSize: 14, fontWeight: 600, color: T.green }}>Disponibilità Attuale: solo 1 slot libero per questo mese.</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.2vw, 44px)", fontWeight: 700, lineHeight: 1.18, letterSpacing: "-0.028em", margin: "0 auto 22px", maxWidth: 640 }}>Prenota una Sessione Strategica di 15 minuti.</h2>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.8, maxWidth: 580, margin: "0 auto 18px" }}>Lavoro esclusivamente con un massimo di 2 nuovi progetti al mese per garantire la massima dedizione e qualità ingegneristica ad ogni brand.</p>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.8, maxWidth: 580, margin: "0 auto 48px" }}>Stai per lanciare un nuovo progetto commerciale o vuoi ottimizzare un sito esistente? Analizzeremo gli obiettivi del tuo business e individueremo lo stack tecnologico e le automazioni ideali per il tuo mercato.</p>
          <Btn primary>Prenota la Consulenza</Btn>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §8  FAQ
══════════════════════════════════════════════════════════════════════════ */
const FAQS = [
  { q: "D: Quale piattaforma è meglio per il mio business: Shopify o Framer?", a: "R: Dipende dal progetto. Se hai bisogno di un e-commerce con migliaia di prodotti e logistica complessa integrata, Shopify è imbattibile. Se cerchi un sito aziendale, una landing page o un portfolio ad altissimo impatto visivo e design sartoriale, Framer è la scelta ideale. Valuteremo lo strumento perfetto durante la nostra prima call." },
  { q: "D: Puoi collegare qualsiasi fornitore o gestionale al mio sito?", a: "R: Sì. Sviluppo integrazioni API personalizzate e middleware su misura per sincronizzare in tempo reale stock, prezzi e ordini con i principali fornitori ed ERP europei e globali, eliminando la gestione manuale." },
  { q: `D: Offri anche la gestione della pubblicità dopo lo sviluppo?`, a: `R: Certamente. Un sito eccellente non serve a nulla senza traffico qualificato. Offro un servizio completo "chiavi in mano" che include il lancio, il tracciamento avanzato e l'ottimizzazione di campagne pubblicitarie su Meta, Google e Pinterest.` },
]

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <motion.div data-glow="" whileHover={open ? {} : { scale: 1.008 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{ '--base': '220', '--spread': '140', '--radius': '14', '--border': '1.5', '--size': '260', borderRadius: 14, position: "relative", backgroundColor: "rgba(255,255,255,0.026)", backdropFilter: "blur(16px) saturate(1.5)", WebkitBackdropFilter: "blur(16px) saturate(1.5)", border: `1px solid ${open ? "rgba(102,0,255,0.35)" : "rgba(255,255,255,0.07)"}`, boxShadow: open ? "0 12px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background-color 0.25s, border-color 0.25s, box-shadow 0.3s" } as React.CSSProperties}
    >
      <CornerBrackets />
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "22px 28px", background: open ? "rgba(102,0,255,0.06)" : "transparent", border: "none", cursor: "pointer", color: T.text, textAlign: "left", fontFamily: "inherit", transition: "background 0.25s" }}>
        <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }} style={{ fontSize: 24, color: T.accentLt, flexShrink: 0, lineHeight: 1 }}>+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 28px 26px", background: "rgba(102,0,255,0.04)" }}>
              <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.82 }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="s8" style={SEC} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <Label text="FAQ — Friction Killers" />
          <h2 style={{ fontSize: "clamp(26px, 3.4vw, 44px)", fontWeight: 700, lineHeight: 1.13, letterSpacing: "-0.028em", marginBottom: 48, maxWidth: 480 }}>Domande Frequenti</h2>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 820 }}>
          {FAQS.map((f, i) => (
            <Reveal key={i}>
              <FAQItem {...f} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §9  CONTACT
══════════════════════════════════════════════════════════════════════════ */
function Field({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder: string; type?: string; value: string; onChange: (v: string) => void }) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.faint, marginBottom: 8, letterSpacing: "0.12em", textTransform: "uppercase" as const }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onFocus={() => setF(true)} onBlur={() => setF(false)} required
        style={{ width: "100%", padding: "16px 20px", background: T.surface, border: `1px solid ${f ? T.accent : T.border}`, borderRadius: 12, color: T.text, fontSize: 15, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit", transition: "border-color 0.2s" }} />
    </div>
  )
}

function FieldArea({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.faint, marginBottom: 8, letterSpacing: "0.12em", textTransform: "uppercase" as const }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={6} onFocus={() => setF(true)} onBlur={() => setF(false)} required
        style={{ width: "100%", padding: "16px 20px", background: T.surface, border: `1px solid ${f ? T.accent : T.border}`, borderRadius: 12, color: T.text, fontSize: 15, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" as const, transition: "border-color 0.2s" }} />
    </div>
  )
}

function Contact() {
  const [fields, setFields] = useState({ name: "", email: "", site: "", desc: "" })
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof fields) => (v: string) => setFields(f => ({ ...f, [k]: v }))
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}` }} id="s9" className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <Label text="Contatto" />
          <h2 style={{ fontSize: "clamp(26px, 3.4vw, 44px)", fontWeight: 700, lineHeight: 1.13, letterSpacing: "-0.028em", marginBottom: 18, maxWidth: 600 }}>Il tuo prossimo livello aziendale inizia da qui.</h2>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.8, maxWidth: 600, marginBottom: 56 }}>Compila il modulo per richiedere un'analisi preliminare del tuo progetto. Riceverai una proposta di roadmap strategica iniziale entro 24 ore lavorative.</p>
        </Reveal>
        <Reveal>
          {!sent ? (
            <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
              <Field label="Nome e Cognome / Azienda" placeholder="Nome e Cognome / Azienda" value={fields.name} onChange={set("name")} />
              <Field label="Email Professionale" placeholder="Email Professionale" type="email" value={fields.email} onChange={set("email")} />
              <Field label="Link al sito attuale" placeholder="Link al sito attuale (se esistente)" value={fields.site} onChange={set("site")} />
              <FieldArea label="Descrizione del Progetto e Obiettivi Principali" placeholder="Descrizione del Progetto e Obiettivi Principali" value={fields.desc} onChange={set("desc")} />
              <div style={{ paddingTop: 12 }}>
                <Btn primary type="submit">Invia i Dati & Prenota la Consulenza Tecnica</Btn>
              </div>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "44px 40px", background: T.surface, borderRadius: 20, border: `1px solid ${T.green}35`, maxWidth: 720 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                <PingDot />
                <span style={{ fontSize: 18, fontWeight: 600, color: T.green }}>Messaggio inviato con successo!</span>
              </div>
              <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.8 }}>Riceverai una proposta di roadmap strategica iniziale entro 24 ore lavorative.</p>
            </motion.div>
          )}
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   FOOTER (inlined from FooterSite.tsx)
══════════════════════════════════════════════════════════════════════════ */
const FOOTER_DATA = {
  name: "Nadia Maar",
  tagline: "Architetture Digitali ad Alte Prestazioni. Sviluppo soluzioni end-to-end: da e-commerce scalabili a integrazioni API avanzate.",
  email: "nadiamaar.dev@gmail.com",
  location: "Remote · Europa",
  contactUrl: "#s9",
  contactCtaLabel: "Prenota una Call",
  socials: [
    { Icon: GithubIcon,    label: "GitHub",    href: "https://github.com/nadiamaar-dev" },
    { Icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/nadiamaar.dev" },
    { Icon: TikTokIcon,    label: "TikTok",    href: "https://tiktok.com/@nadiamaar" },
    { Icon: PinterestIcon, label: "Pinterest", href: "https://pinterest.com/nadiamaar" },
    { Icon: LinkedinIcon,  label: "LinkedIn",  href: "https://linkedin.com/in/nadiamaar" },
  ],
  services: [
    { label: "Shopify E-Commerce", href: "#s4" },
    { label: "Landing Page",       href: "#s4" },
    { label: "Video AI",           href: "#s4" },
    { label: "Grafica & Branding", href: "#s4" },
    { label: "Advertising",        href: "#s4" },
  ],
  nav: [
    { label: "Home",      href: "#s1" },
    { label: "Chi Sono",  href: "#s2" },
    { label: "Portfolio", href: "#s6" },
    { label: "Blog",      href: "#s1" },
    { label: "Contatti",  href: "#s9" },
  ],
  copyright: "© 2025 Nadia Maar. Tutti i diritti riservati.",
}

const FC = {
  bg: "#0A0A0F", border: "rgba(255,255,255,0.06)", text: "#F5F5F7", muted: "#A1A1AA",
  dimLink: "rgba(245,245,247,0.45)", accent: "#7C3AED", accentBg: "rgba(124,58,237,0.1)",
  accentBd: "rgba(124,58,237,0.3)", gold: "#D4AF37", surface: "rgba(255,255,255,0.03)",
}

function FooterColHeader({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: 20 }}>{children}</p>
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ display: "flex", alignItems: "center", gap: 0, fontSize: 13, color: FC.dimLink, textDecoration: "none", transition: "color 0.18s, gap 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.color = FC.text; e.currentTarget.style.gap = "6px" }}
      onMouseLeave={e => { e.currentTarget.style.color = FC.dimLink; e.currentTarget.style.gap = "0px" }}
    >
      <span style={{ color: FC.accent, overflow: "hidden", width: 0, opacity: 0, transition: "width 0.18s, opacity 0.18s" }} aria-hidden>›</span>
      {children}
    </a>
  )
}

function FooterAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", borderBottom: `1px solid ${open ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.07)"}`, cursor: "pointer", padding: "14px 0", fontFamily: "inherit", transition: "border-color 0.25s" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: open ? FC.text : "#A1A1AA", margin: 0, transition: "color 0.2s" }}>{title}</p>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ color: open ? FC.accent : "#A1A1AA", fontSize: 9, lineHeight: 1, transition: "color 0.2s" }}>▼</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "14px 0 16px" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FooterSocialBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <motion.a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A1A1AA", transition: "color 0.2s, border-color 0.2s, background 0.2s", flexShrink: 0 }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = FC.text; el.style.borderColor = FC.accentBd; el.style.background = FC.accentBg }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#A1A1AA"; el.style.borderColor = "rgba(255,255,255,0.08)"; el.style.background = "transparent" }}
    >{children}</motion.a>
  )
}

function SiteFooter() {
  return (
    <footer style={{ background: FC.bg, borderTop: `1px solid ${FC.border}` }}>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent 0%, ${FC.accent}88 25%, ${FC.gold}66 75%, transparent 100%)` }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 32px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "48px 32px", marginBottom: 56 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <defs><linearGradient id="fs-grad" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#7C3AED"/><stop offset="1" stopColor="#D4AF37"/></linearGradient></defs>
                <path d="M10 0.5C9.4 5.4 5.4 9.4 0.5 10C5.4 10.6 9.4 14.6 10 19.5C10.6 14.6 14.6 10.6 19.5 10C14.6 9.4 10.6 5.4 10 0.5Z" fill="url(#fs-grad)"/>
              </svg>
              <span style={{ fontSize: "1rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: FC.text }}>{FOOTER_DATA.name}</span>
            </div>
            <p style={{ fontSize: 13, color: FC.muted, lineHeight: 1.75, maxWidth: 230, marginBottom: 24 }}>{FOOTER_DATA.tagline}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FOOTER_DATA.socials.map(({ Icon, label, href }) => (
                <FooterSocialBtn key={label} href={href} label={label}><Icon /></FooterSocialBtn>
              ))}
            </div>
          </div>
          {/* Services + Nav grouped */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <FooterAccordion title="Servizi">
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {FOOTER_DATA.services.map(({ label, href }) => <li key={label}><FooterLink href={href}>{label}</FooterLink></li>)}
              </ul>
            </FooterAccordion>
            <FooterAccordion title="Esplora">
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {FOOTER_DATA.nav.map(({ label, href }) => <li key={label}><FooterLink href={href}>{label}</FooterLink></li>)}
              </ul>
            </FooterAccordion>
          </div>
          {/* Contact */}
          <div>
            <FooterColHeader>Contatto</FooterColHeader>
            <ul style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <li>
                <a href={`mailto:${FOOTER_DATA.email}`} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: FC.dimLink, textDecoration: "none", transition: "color 0.18s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = FC.text)} onMouseLeave={e => (e.currentTarget.style.color = FC.dimLink)}>
                  <MailIcon size={13} /><span style={{ wordBreak: "break-all" }}>{FOOTER_DATA.email}</span>
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: FC.dimLink }}>
                <MapPinIcon size={13} /><span>{FOOTER_DATA.location}</span>
              </li>
            </ul>
            <motion.a href={FOOTER_DATA.contactUrl} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, background: "linear-gradient(135deg, rgba(124,58,237,0.22), rgba(212,175,55,0.10))", border: `1px solid ${FC.accentBd}`, color: FC.text, fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "border-color 0.2s, background 0.2s" }}>
              {FOOTER_DATA.contactCtaLabel}<ArrowRightIcon size={13} />
            </motion.a>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${FC.border}`, paddingTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontSize: 11, color: FC.muted }}>{FOOTER_DATA.copyright}</p>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="#" style={{ fontSize: 11, color: "rgba(161,161,170,0.6)", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = FC.muted)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(161,161,170,0.6)")}>Privacy Policy</a>
            <a href="#" style={{ fontSize: 11, color: "rgba(161,161,170,0.6)", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = FC.muted)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(161,161,170,0.6)")}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   FLOATING CONTACT (inlined from FloatingContact.tsx)
══════════════════════════════════════════════════════════════════════════ */
const FCC = {
  bg: "rgba(14, 4, 28, 0.88)", border: "rgba(102,0,255,0.30)",
  accent: "#7000FF", accentL: "#9944FF", text: "#F5F5F7",
  muted: "rgba(245,245,247,0.52)", green: "#22c55e",
}

function FloatingActionBtn({ href, icon, label, color, bg, border, external }: {
  href: string; icon: React.ReactNode; label: string; color: string; bg: string; border: string; external?: boolean
}) {
  return (
    <motion.a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.96 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 4px", borderRadius: 12, background: bg, border: `1px solid ${border}`, color: color, fontSize: 10, fontWeight: 600, letterSpacing: "0.03em", textDecoration: "none", cursor: "pointer", transition: "background 0.18s" }}>
      {icon}{label}
    </motion.a>
  )
}

function FloatingContact() {
  const name = "Nadia Maar"
  const email = "nadiamaar.dev@gmail.com"
  const phone = "+39 000 000 0000"
  const whatsapp = "+390000000000"
  const location = "Remote · Europa"
  const available = true

  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const cardVariants = isMobile
    ? { hidden: { opacity: 0, y: 20, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.96 } }
    : { hidden: { opacity: 0, x: 16, scale: 0.96 }, visible: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: 16, scale: 0.96 } }

  return (
    <div ref={cardRef} style={{ position: "fixed", right: isMobile ? 16 : 24, bottom: isMobile ? 24 : "auto", top: isMobile ? "auto" : "50%", transform: isMobile ? "none" : "translateY(-50%)", zIndex: 400, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
      <AnimatePresence>
        {open && (
          <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: FCC.bg, backdropFilter: "blur(28px) saturate(1.7)", WebkitBackdropFilter: "blur(28px) saturate(1.7)", border: `1px solid ${FCC.border}`, borderRadius: 20, width: isMobile ? "calc(100vw - 32px)" : 292, maxWidth: 340, boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.60), 0 0 50px rgba(102,0,255,0.18), inset 0 1px 0 rgba(255,255,255,0.08)", overflow: "hidden" } as React.CSSProperties}>
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(102,0,255,0.7), rgba(153,68,255,0.5), transparent)" }} />
            <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(112,0,255,0.5)", boxShadow: "0 0 16px rgba(102,0,255,0.35)", overflow: "hidden", background: "linear-gradient(135deg, rgba(102,0,255,0.4), rgba(60,0,180,0.3))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "rgba(200,160,255,0.95)" }}>{initials}</span>
                </div>
                {available && (
                  <span style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: "50%", background: FCC.green, border: "2px solid rgba(14,4,28,0.9)", display: "block" }}>
                    <motion.span style={{ position: "absolute", inset: -2, borderRadius: "50%", background: FCC.green, opacity: 0.5 }} animate={{ scale: [1, 2.4], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: FCC.text, letterSpacing: "-0.01em", marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 11, color: FCC.muted, lineHeight: 1.4, marginBottom: 5 }}>Web Architecture & Digital Strategy</div>
                {available && <span style={{ fontSize: 10, fontWeight: 600, color: FCC.green, letterSpacing: "0.04em" }}>● Disponibile</span>}
              </div>
              <motion.button onClick={() => setOpen(false)} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: FCC.muted, flexShrink: 0 }}>
                <XIcon size={13} />
              </motion.button>
            </div>
            <div style={{ padding: "14px 20px 14px", display: "flex", flexDirection: "column", gap: 9, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <a href={`mailto:${email}`} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: FCC.muted, textDecoration: "none", transition: "color 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.color = FCC.accentL)} onMouseLeave={e => (e.currentTarget.style.color = FCC.muted)}>
                <MailIcon size={13} /><span style={{ wordBreak: "break-all" }}>{email}</span>
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: FCC.muted }}>
                <MapPinIcon size={13} /><span>{location}</span>
              </div>
            </div>
            <div style={{ padding: "12px 16px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <FloatingActionBtn href={`mailto:${email}`} icon={<MailIcon size={15} />} label="Email" color="#9944FF" bg="rgba(102,0,255,0.14)" border="rgba(102,0,255,0.35)" />
              <FloatingActionBtn href={`tel:${phone.replace(/\s/g, "")}`} icon={<PhoneIcon size={15} />} label="Chiama" color="#22c55e" bg="rgba(34,197,94,0.10)" border="rgba(34,197,94,0.30)" />
              <FloatingActionBtn href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Ciao%20Nadia!`} icon={<WhatsAppIcon />} label="WhatsApp" color="#25D366" bg="rgba(37,211,102,0.10)" border="rgba(37,211,102,0.30)" external />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button onClick={() => setOpen(o => !o)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} aria-label="Contatta Nadia Maar"
        style={{ width: 54, height: 54, borderRadius: "50%", border: open ? "2px solid rgba(112,0,255,0.75)" : "2px solid rgba(112,0,255,0.45)", boxShadow: open ? "0 0 0 4px rgba(102,0,255,0.18), 0 8px 28px rgba(0,0,0,0.5), 0 0 24px rgba(102,0,255,0.4)" : "0 0 0 3px rgba(102,0,255,0.10), 0 6px 20px rgba(0,0,0,0.45), 0 0 18px rgba(102,0,255,0.22)", overflow: "hidden", cursor: "pointer", background: "linear-gradient(135deg, rgba(60,0,140,0.9), rgba(14,4,28,0.95))", position: "relative", flexShrink: 0, transition: "border-color 0.25s, box-shadow 0.25s", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: "rgba(200,160,255,0.95)" }}>{initials}</span>
        {available && (
          <span style={{ position: "absolute", bottom: 2, right: 2, width: 11, height: 11, borderRadius: "50%", background: FCC.green, border: "2px solid rgba(14,4,28,0.9)" }}>
            <motion.span style={{ position: "absolute", inset: -2, borderRadius: "50%", background: FCC.green, opacity: 0.55 }} animate={{ scale: [1, 2.6], opacity: [0.55, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
          </span>
        )}
      </motion.button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   DATE-TIME WIDGET
══════════════════════════════════════════════════════════════════════════ */
function DateTimeWidget() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const datePart = new Intl.DateTimeFormat("it-IT", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).format(now)
  const hh = String(now.getHours()).padStart(2, "0")
  const mm = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")
  return (
    <div aria-label="Data e ora locale" className="hp-datetime" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 10, padding: "6px 18px", borderRadius: 100, background: "rgba(16, 4, 32, 0.55)", backdropFilter: "blur(18px) saturate(1.6)", WebkitBackdropFilter: "blur(18px) saturate(1.6)", border: "1px solid rgba(112, 0, 255, 0.28)", boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 24px rgba(112,0,255,0.12)", whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none", zIndex: 10 } as React.CSSProperties}>
      <span style={{ position: "relative", display: "inline-flex", width: 6, height: 6, flexShrink: 0 }}>
        <motion.span aria-hidden style={{ position: "absolute", inset: -2, borderRadius: "50%", background: "#7000FF", opacity: 0.5 }} animate={{ scale: [1, 2.8], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
        <span style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#7000FF", display: "block" }} />
      </span>
      <span className="hp-dt-date" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "rgba(196, 160, 255, 0.72)", textTransform: "capitalize" }}>{datePart}</span>
      <span style={{ width: 1, height: 13, background: "rgba(112,0,255,0.35)", flexShrink: 0 }} />
      <span className="hp-dt-time" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.10em", fontFamily: "'SF Mono','Fira Code','Consolas',monospace", color: "rgba(225, 205, 255, 0.95)", display: "inline-flex", alignItems: "baseline", gap: 0 }}>
        {hh}<span className="dt-colon">:</span>{mm}
        <span style={{ fontSize: 10, opacity: 0.55, marginLeft: 1 }}><span className="dt-colon">:</span>{ss}</span>
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { label: "Servizi",   id: "s4" },
  { label: "Metodo",    id: "s5" },
  { label: "Portfolio", id: "s6" },
  { label: "Contatti",  id: "s9" },
]

function Logo3D({ onClick }: { onClick: () => void }) {
  const [h, setH] = useState(false)
  return (
    <motion.button onClick={onClick} onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} transition={{ duration: 0.22, ease }}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", position: "relative", width: 36, height: 36, flexShrink: 0 }}>
      <motion.div animate={{ opacity: h ? 1 : 0, scale: h ? 1 : 0.85 }} transition={{ duration: 0.25 }} style={{ position: "absolute", inset: -5, borderRadius: 14, background: "radial-gradient(circle, rgba(102,0,255,0.35) 0%, transparent 70%)", filter: "blur(6px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: h ? "linear-gradient(145deg, #1a1a2e 0%, #12122a 100%)" : "linear-gradient(145deg, #141428 0%, #0e0e1e 100%)", border: `1.5px solid ${h ? "rgba(102,0,255,0.7)" : "rgba(102,0,255,0.3)"}`, boxShadow: h ? "0 0 0 1px rgba(102,0,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.05)", transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <motion.div animate={{ x: h ? 60 : -60, opacity: h ? 0.4 : 0 }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ position: "absolute", top: 0, left: -20, bottom: 0, width: 20, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)", transform: "skewX(-20deg)", pointerEvents: "none" }} />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 16V4L9.5 13.5V4M10.5 4V16L17 6.5V16" stroke="url(#n-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs><linearGradient id="n-grad" x1="3" y1="4" x2="17" y2="16" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#c7d0ff"/><stop offset="100%" stopColor="#6b85f9"/></linearGradient></defs>
        </svg>
      </div>
    </motion.button>
  )
}

function NavLinkAdv({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [h, setH] = useState(false)
  const [lx, setLx] = useState(0)
  const [ly, setLy] = useState(0)
  const btnRef = useRef<HTMLButtonElement>(null)
  const onMove = (e: React.MouseEvent) => { const r = btnRef.current?.getBoundingClientRect(); if (r) { setLx(e.clientX - r.left); setLy(e.clientY - r.top) } }
  return (
    <button ref={btnRef} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onMouseMove={onMove}
      style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: active ? T.text : h ? T.text : T.muted, fontSize: 13, fontWeight: active ? 600 : 500, letterSpacing: "0.04em", padding: "8px 16px", borderRadius: 8, overflow: "hidden", fontFamily: "inherit", transition: "color 0.18s" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: h ? `radial-gradient(55px circle at ${lx}px ${ly}px, rgba(102,0,255,0.22) 0%, transparent 100%)` : "none", transition: "background 0.08s" }} />
      <motion.div animate={{ opacity: h || active ? 1 : 0, background: active ? "rgba(102,0,255,0.14)" : "rgba(255,255,255,0.05)" }} transition={{ duration: 0.18 }} style={{ position: "absolute", inset: 0, borderRadius: 8, border: active ? "1px solid rgba(102,0,255,0.28)" : "1px solid transparent" }} />
      {active && <motion.div layoutId="nav-active-dot" style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: T.accent, boxShadow: `0 0 6px ${T.accent}` }} />}
      <span style={{ position: "relative" }}>{label}</span>
    </button>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState("s1")
  const [cx, setCx] = useState(-400)
  const [cy, setCy] = useState(32)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    const ids = ["s1", ...NAV_LINKS.map(l => l.id)]
    const map: Record<string, boolean> = {}
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { map[e.target.id] = e.isIntersecting })
      const first = ids.find(id => map[id])
      if (first) setActive(first)
    }, { threshold: 0.25, rootMargin: "-64px 0px 0px 0px" })
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const onMove  = (e: MouseEvent) => { const r = el.getBoundingClientRect(); setCx(e.clientX - r.left); setCy(e.clientY - r.top) }
    const onLeave = () => setCx(-400)
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave) }
  }, [])

  const goto = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false) }

  return (
    <>
      <motion.header ref={headerRef} initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", backdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none", WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none", background: scrolled ? "rgba(5,5,10,0.78)" : "transparent", borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`, transition: "background 0.4s, border-color 0.4s", overflow: "hidden" } as React.CSSProperties}>
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(320px circle at ${cx}px ${cy}px, rgba(102,0,255,0.13) 0%, transparent 100%)` }} />
        <DateTimeWidget />
        <div style={{ display: "flex", alignItems: "center", gap: 11, position: "relative" }}>
          <Logo3D onClick={() => goto("s1")} />
          <button onClick={() => goto("s1")} className="hp-brand-text" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" as const, background: `linear-gradient(135deg, ${T.text} 20%, ${T.accentLt} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } as React.CSSProperties}>Nadia Maar</span>
          </button>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 2, position: "relative" }} className="hp-nav-desktop">
          {NAV_LINKS.map(({ label, id }) => <NavLinkAdv key={id} label={label} active={active === id} onClick={() => goto(id)} />)}
          <div style={{ marginLeft: 14 }}><Btn primary small onClick={() => goto("s9")}>Prenota Call</Btn></div>
        </nav>
        <button onClick={() => setMenuOpen(o => !o)} className="hp-nav-burger" style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, color: T.text }}>
          <div style={{ width: 22, height: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
            <motion.div
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: 22, height: 2, background: "currentColor", borderRadius: 1, transformOrigin: "50% 50%" }}
            />
            <motion.div
              animate={{ opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.25 }}
              style={{ width: 22, height: 2, background: "currentColor", borderRadius: 1 }}
            />
            <motion.div
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: 22, height: 2, background: "currentColor", borderRadius: 1, transformOrigin: "50% 50%" }}
            />
          </div>
        </button>
      </motion.header>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22, ease }}
            style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 199, background: "rgba(8,8,16,0.97)", backdropFilter: "blur(22px)", borderBottom: `1px solid ${T.border}`, padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV_LINKS.map(({ label, id }) => (
              <button key={id} onClick={() => goto(id)} style={{ background: "none", border: "none", cursor: "pointer", color: active === id ? T.text : T.muted, fontSize: 16, fontWeight: active === id ? 600 : 500, padding: "14px 8px", textAlign: "left", fontFamily: "inherit", borderBottom: `1px solid ${T.border}` }}>{label}</button>
            ))}
            <div style={{ paddingTop: 16 }}><Btn primary onClick={() => goto("s9")}>Prenota Call</Btn></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   CURSOR BUBBLES
══════════════════════════════════════════════════════════════════════════ */
const BUBBLES = [
  { sz: 11, s: 72, d: 22, m: 0.50, a: 0.88, ox:   9, oy:  -7 },
  { sz:  8, s: 46, d: 15, m: 0.38, a: 0.72, ox: -11, oy:   6 },
  { sz: 15, s: 22, d: 10, m: 0.85, a: 0.55, ox:   6, oy:  13 },
  { sz:  6, s: 90, d: 26, m: 0.30, a: 0.80, ox: -16, oy:  -3 },
  { sz:  9, s: 34, d: 12, m: 0.60, a: 0.65, ox:  14, oy:  -9 },
  { sz: 13, s: 16, d:  9, m: 1.10, a: 0.45, ox:  -8, oy:  19 },
]

function Bubble({ mx, my, sz, s, d, m, a, ox, oy, visible }: {
  mx: MotionValue<number>; my: MotionValue<number>
  sz: number; s: number; d: number; m: number; a: number; ox: number; oy: number; visible: boolean
}) {
  const bx = useSpring(mx, { stiffness: s, damping: d, mass: m })
  const by = useSpring(my, { stiffness: s, damping: d, mass: m })
  const x  = useTransform(bx, v => v - sz / 2 + ox)
  const y  = useTransform(by, v => v - sz / 2 + oy)
  const hl = Math.round(sz * 0.28)
  return (
    <motion.div aria-hidden animate={{ opacity: visible ? a : 0 }} transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ position: "fixed", top: 0, left: 0, width: sz, height: sz, borderRadius: "50%", background: `radial-gradient(circle at 32% 32%, rgba(230,190,255,0.92) 0%, rgba(148,30,255,0.72) 22%, rgba(102,0,255,0.50) 50%, rgba(60,0,180,0.28) 75%, rgba(20,0,80,0.12) 100%)`, border: "1px solid rgba(180,100,255,0.70)", boxShadow: [`inset ${hl}px ${hl}px ${hl * 2}px rgba(230,200,255,0.45)`, `inset -${hl}px -${hl}px ${hl * 2}px rgba(0,0,60,0.40)`, `0 0 ${sz * 0.7}px rgba(102,0,255,0.55)`, `0 ${Math.round(sz*0.12)}px ${Math.round(sz*0.35)}px rgba(0,0,0,0.38)`].join(", "), backdropFilter: "blur(1px)", pointerEvents: "none", zIndex: 7, x, y, willChange: "transform" }}
    />
  )
}

function CursorGlow() {
  const mx = useMotionValue(-800)
  const my = useMotionValue(-800)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onMove  = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); setVisible(true) }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)
    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)
    return () => { window.removeEventListener("mousemove", onMove); document.removeEventListener("mouseleave", onLeave); document.removeEventListener("mouseenter", onEnter) }
  }, [mx, my])
  return <>{BUBBLES.map((b, i) => <Bubble key={i} mx={mx} my={my} visible={visible} {...b} />)}</>
}

/* ══════════════════════════════════════════════════════════════════════════
   ANIMATED BACKGROUND
══════════════════════════════════════════════════════════════════════════ */
function AnimatedBackground() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Purple — primary brand orb */}
      <motion.div animate={{ x: [0, 120, -60, 100, 0], y: [0, -80, 120, -50, 0] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-12%", left: "4%", width: 780, height: 780, borderRadius: "50%", background: "radial-gradient(circle, rgba(102,0,255,0.30) 0%, transparent 65%)", filter: "blur(90px)", willChange: "transform" }} />
      {/* Indigo/blue — depth right */}
      <motion.div animate={{ x: [0, -100, 70, -80, 0], y: [0, 100, -80, 70, 0] }} transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        style={{ position: "absolute", top: "22%", right: "-8%", width: 640, height: 640, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.24) 0%, transparent 65%)", filter: "blur(88px)", willChange: "transform" }} />
      {/* Teal/green — aurora signature */}
      <motion.div animate={{ x: [0, 80, -100, 60, 0], y: [0, 60, -70, 90, 0] }} transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", delay: 14 }}
        style={{ position: "absolute", bottom: "-5%", left: "18%", width: 660, height: 660, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 65%)", filter: "blur(80px)", willChange: "transform" }} />
      {/* Cyan — bottom-left accent */}
      <motion.div animate={{ x: [0, -50, 80, -40, 0], y: [0, -90, 60, -70, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{ position: "absolute", top: "58%", left: "-6%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 65%)", filter: "blur(64px)", willChange: "transform" }} />
      {/* Violet — top-right accent */}
      <motion.div animate={{ x: [0, -40, 55, -45, 0], y: [0, 55, -40, 50, 0] }} transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 11 }}
        style={{ position: "absolute", top: "3%", right: "6%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.20) 0%, transparent 65%)", filter: "blur(70px)", willChange: "transform" }} />

      {/* Aurora band 1 — upper */}
      <motion.div
        animate={{ scaleX: [1, 1.35, 0.72, 1.18, 1], opacity: [0.45, 0.70, 0.24, 0.55, 0.45] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: "absolute", top: "20%", left: 0, right: 0, height: 90, background: "linear-gradient(90deg, transparent 0%, rgba(102,0,255,0.08) 12%, rgba(99,102,241,0.16) 38%, rgba(16,185,129,0.06) 65%, transparent 100%)", filter: "blur(28px)", transformOrigin: "center", willChange: "transform, opacity" }} />
      {/* Aurora band 2 — middle */}
      <motion.div
        animate={{ scaleX: [0.8, 1.28, 0.60, 1.10, 0.8], opacity: [0.30, 0.52, 0.14, 0.42, 0.30] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        style={{ position: "absolute", top: "54%", left: 0, right: 0, height: 70, background: "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.09) 14%, rgba(99,102,241,0.12) 44%, rgba(102,0,255,0.08) 74%, transparent 100%)", filter: "blur(22px)", transformOrigin: "center", willChange: "transform, opacity" }} />
      {/* Aurora band 3 — lower */}
      <motion.div
        animate={{ scaleX: [1.1, 0.68, 1.28, 0.88, 1.1], opacity: [0.22, 0.40, 0.10, 0.30, 0.22] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 12 }}
        style={{ position: "absolute", bottom: "12%", left: 0, right: 0, height: 55, background: "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.10) 18%, rgba(6,182,212,0.12) 50%, rgba(99,102,241,0.08) 80%, transparent 100%)", filter: "blur(20px)", transformOrigin: "center", willChange: "transform, opacity" }} />

      {/* Dot grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      {/* Edge vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 45%, rgba(5,5,10,0.68) 100%)" }} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT EXPORT — default export for Framer
══════════════════════════════════════════════════════════════════════════ */
export default function NadiaMaar() {
  useEffect(() => {
    const sync = (e: PointerEvent) => {
      const r = document.documentElement
      r.style.setProperty("--x", e.clientX.toFixed(2))
      r.style.setProperty("--y", e.clientY.toFixed(2))
      r.style.setProperty("--xp", (e.clientX / window.innerWidth).toFixed(4))
      r.style.setProperty("--yp", (e.clientY / window.innerHeight).toFixed(4))
    }
    document.addEventListener("pointermove", sync)
    return () => document.removeEventListener("pointermove", sync)
  }, [])

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Inter', 'Geist', system-ui, -apple-system, BlinkMacSystemFont, sans-serif", overflowX: "hidden", minHeight: "100vh", position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <CursorGlow />
      <AnimatedBackground />
      <FloatingContact />
      <Navbar />
      <div style={{ position: "relative", zIndex: 1, paddingTop: 64 }}>
        <Hero />
        <SkillsCardsGrid />
        <Skills />
        <AllInOne />
        <Method />
        <Portfolio />
        <Scarcity />
        <FAQ />
        <Contact />
        <SiteFooter />
      </div>
    </div>
  )
}
