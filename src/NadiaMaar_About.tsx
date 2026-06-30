/**
 * NadiaMaar_About.tsx — About Me / Info Page
 * Elite minimalism · Obsidian palette · Deep purple accents
 */

import React, { useState, useEffect, useRef } from "react"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import type { MotionValue } from "framer-motion"

/* ══════════════════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════════════════ */
const ArrowUpRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </svg>
)
const ChevronDown = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const LinkedinIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
)
const GithubIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
  </svg>
)
const MailIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/>
  </svg>
)

/* ══════════════════════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; scroll-behavior: smooth; }
  p, li { font-weight: 300; line-height: 1.8; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #060608; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  :root { --x:-9999; --y:-9999; --xp:0; --yp:0; }

  [data-glow] {
    --border-size: calc(var(--border,1.5) * 1px);
    --spotlight-size: calc(var(--size,260) * 1px);
    --hue: calc(var(--base,220) + (var(--xp,0) * var(--spread,140)));
    background-image: radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(var(--hue) 100% 70% / var(--bg-spot-opacity,0.032)), transparent
    );
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-position: 50% 50%;
    background-attachment: fixed;
  }
  [data-glow]::before, [data-glow]::after {
    pointer-events: none; content: "";
    position: absolute; inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius,16) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat; background-position: 50% 50%;
    mask: linear-gradient(transparent,transparent), linear-gradient(white,white);
    mask-clip: padding-box, border-box; mask-composite: intersect;
    -webkit-mask: linear-gradient(transparent,transparent), linear-gradient(white,white);
    -webkit-mask-clip: padding-box, border-box; -webkit-mask-composite: destination-in;
  }
  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.7) calc(var(--spotlight-size) * 0.7) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(var(--hue) 100% 55% / var(--border-spot-opacity,0.48)), transparent 100%
    ); filter: brightness(2);
  }
  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.4) calc(var(--spotlight-size) * 0.4) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity,0.20)), transparent 100%
    );
  }

  @keyframes rainbow-anim {
    0%   { background-position: 0 0; }
    50%  { background-position: 400% 0; }
    100% { background-position: 0 0; }
  }
  .abt-rainbow { position: relative; isolation: isolate; }
  .abt-rainbow::before, .abt-rainbow::after {
    content: ''; position: absolute; left: -1px; top: -1px;
    border-radius: inherit;
    background: linear-gradient(45deg,
      rgba(112,0,255,0.45), rgba(100,0,240,0.18), rgba(153,68,255,0.35), rgba(100,0,240,0.15),
      rgba(112,0,255,0.45), rgba(100,0,240,0.18), rgba(153,68,255,0.35), rgba(100,0,240,0.15));
    background-size: 400%; width: calc(100% + 2px); height: calc(100% + 2px); z-index: -1;
    animation: rainbow-anim 32s linear infinite;
  }
  .abt-rainbow::after { filter: blur(18px); opacity: 0.20; }

  @keyframes colon-blink { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.15; } }
  .abt-colon { animation: colon-blink 1s ease-in-out infinite; display: inline-block; }

  .abt-wrap { max-width: 1120px; margin: 0 auto; padding: 0 40px; }

  @media (max-width: 900px) {
    .abt-philosophy-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
    .abt-toolkit-grid { grid-template-columns: 1fr 1fr !important; gap: 40px 32px !important; }
    .abt-hero-h1 { font-size: clamp(40px, 10vw, 72px) !important; }
    .abt-hero-actions { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
    .abt-cta-h2 { font-size: clamp(38px, 9vw, 80px) !important; }
    .abt-nav-links { display: none !important; }
  }
  @media (max-width: 560px) {
    .abt-wrap { padding: 0 20px !important; }
    .abt-toolkit-grid { grid-template-columns: 1fr !important; }
    .abt-footer-links { flex-direction: column !important; gap: 10px !important; text-align: center; }
    .abt-hero-h1 { font-size: clamp(34px, 12vw, 56px) !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`

/* ══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#0A0A0B",
  surface:   "#141415",
  border:    "rgba(255,255,255,0.08)",
  text:      "#FFFFFF",
  muted:     "rgba(255,255,255,0.60)",
  faint:     "rgba(255,255,255,0.30)",
  titanium:  "rgba(230,230,240,0.85)",
  accent:    "#6600FF",
  accentGlo: "rgba(102,0,255,0.28)",
  accentLt:  "#9944FF",
  green:     "#22c55e",
} as const

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"

const G = {
  bg:     "rgba(255,255,255,0.055)",
  bgHov:  "rgba(255,255,255,0.095)",
  bd:     "rgba(255,255,255,0.18)",
  bdHov:  "rgba(255,255,255,0.34)",
  blur:   "blur(24px) saturate(1.8)",
  shadow: "0 8px 32px 0 rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.26)",
  shadowHov: "0 18px 56px 0 rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.32)",
} as const

const MONO_LABEL: React.CSSProperties = {
  fontFamily: MONO, letterSpacing: "0.20em",
  textTransform: "uppercase", fontSize: 10.5, fontWeight: 500,
}

/* ══════════════════════════════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════════════════════════════ */
function PingDot({ color = T.accentLt, size = 7 }: { color?: string; size?: number }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: size, height: size, flexShrink: 0 }}>
      <motion.span aria-hidden
        style={{ position: "absolute", inset: -2, borderRadius: "50%", background: color, opacity: 0.50 }}
        animate={{ scale: [1, 3.2], opacity: [0.50, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <span style={{ width: "100%", height: "100%", borderRadius: "50%", background: color, display: "block" }} />
    </span>
  )
}

function ChipLabel({ text }: { text: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", marginBottom: 24 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "7px 16px 7px 12px", borderRadius: 9999,
        background: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        border: `1px solid ${G.bd}`,
        boxShadow: "0 2px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.10)",
      }}>
        <PingDot />
        <span style={{ ...MONO_LABEL, color: T.text, whiteSpace: "nowrap" as const }}>{text}</span>
      </span>
    </div>
  )
}

function HairRule() {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent 0%, ${T.border} 20%, ${T.border} 80%, transparent 100%)`,
    }} />
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ANIMATED BACKGROUND
══════════════════════════════════════════════════════════════════════════ */
function NoiseGrain({ alpha = 14 }: { alpha?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext("2d", { alpha: true }); if (!ctx) return
    const S = 1024; let frame = 0, id = 0
    const resize = () => { c.width = S; c.height = S; c.style.width = "100vw"; c.style.height = "100vh" }
    const draw = () => {
      const img = ctx.createImageData(S, S); const d = img.data
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = v; d[i+1] = v; d[i+2] = v; d[i+3] = alpha }
      ctx.putImageData(img, 0, 0)
    }
    const loop = () => { if (frame % 2 === 0) draw(); frame++; id = requestAnimationFrame(loop) }
    window.addEventListener("resize", resize); resize(); loop()
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(id) }
  }, [alpha])
  return <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", imageRendering: "pixelated" as const }} />
}

function AnimatedBackground() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <motion.div animate={{ x: [0, 100, -50, 90, 0], y: [0, -70, 100, -45, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-10%", left: "8%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(102,0,255,0.11) 0%, transparent 65%)", filter: "blur(90px)", willChange: "transform" }}
      />
      <motion.div animate={{ x: [0, -90, 60, -70, 0], y: [0, 90, -70, 60, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        style={{ position: "absolute", top: "30%", right: "-5%", width: 580, height: 580, borderRadius: "50%", background: "radial-gradient(circle, rgba(102,0,255,0.07) 0%, transparent 65%)", filter: "blur(88px)", willChange: "transform" }}
      />
      <motion.div animate={{ x: [0, 60, -80, 50, 0], y: [0, 50, -60, 80, 0] }}
        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut", delay: 14 }}
        style={{ position: "absolute", bottom: "-8%", left: "20%", width: 580, height: 580, borderRadius: "50%", background: "radial-gradient(circle, rgba(80,0,200,0.06) 0%, transparent 65%)", filter: "blur(80px)", willChange: "transform" }}
      />
      <motion.div
        animate={{ scaleX: [1, 1.40, 0.70, 1.20, 1], opacity: [0.18, 0.32, 0.07, 0.22, 0.18] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: "absolute", top: "22%", left: 0, right: 0, height: 80, background: "linear-gradient(90deg, transparent, rgba(102,0,255,0.05) 15%, rgba(102,0,255,0.07) 40%, transparent)", filter: "blur(28px)", transformOrigin: "center", willChange: "transform, opacity" }}
      />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(100,116,139,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.055) 1px, transparent 1px)", backgroundSize: "11px 12px" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle 700px at 50% 0px, rgba(102,0,255,0.07), transparent 70%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 28%, rgba(6,6,8,0.88) 100%)" }} />
      <NoiseGrain alpha={14} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   CURSOR GLOW
══════════════════════════════════════════════════════════════════════════ */
const BUBBLES = [
  { sz: 11, s: 72, d: 22, m: 0.50, a: 0.85, ox:  9, oy: -7 },
  { sz:  8, s: 46, d: 15, m: 0.38, a: 0.70, ox:-11, oy:  6 },
  { sz: 14, s: 22, d: 10, m: 0.85, a: 0.52, ox:  6, oy: 13 },
  { sz:  6, s: 90, d: 26, m: 0.30, a: 0.78, ox:-16, oy: -3 },
  { sz:  9, s: 34, d: 12, m: 0.60, a: 0.62, ox: 14, oy: -9 },
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
    <motion.div aria-hidden animate={{ opacity: visible ? a : 0 }} transition={{ duration: 0.45 }}
      style={{ position: "fixed", top: 0, left: 0, width: sz, height: sz, borderRadius: "50%", background: `radial-gradient(circle at 32% 32%, rgba(230,190,255,0.90) 0%, rgba(148,30,255,0.70) 22%, rgba(102,0,255,0.48) 50%, rgba(60,0,180,0.26) 75%, transparent 100%)`, border: "1px solid rgba(180,100,255,0.68)", boxShadow: [`inset ${hl}px ${hl}px ${hl*2}px rgba(230,200,255,0.42)`, `0 0 ${sz*0.7}px rgba(102,0,255,0.52)`].join(", "), backdropFilter: "blur(1px)", pointerEvents: "none", zIndex: 7, x, y }}
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
    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeave)
    return () => { window.removeEventListener("mousemove", onMove); document.removeEventListener("mouseleave", onLeave) }
  }, [mx, my])
  return <>{BUBBLES.map((b, i) => <Bubble key={i} mx={mx} my={my} visible={visible} {...b} />)}</>
}

/* ══════════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════════ */
function Logo3D({ onClick }: { onClick: () => void }) {
  const [h, setH] = useState(false)
  return (
    <motion.button onClick={onClick} onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)}
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} transition={{ duration: 0.22, ease }}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", position: "relative", width: 36, height: 36, flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: h ? "linear-gradient(145deg, #1a1a2e 0%, #12122a 100%)" : "linear-gradient(145deg, #141428 0%, #0e0e1e 100%)", border: `1.5px solid ${h ? "rgba(102,0,255,0.70)" : "rgba(102,0,255,0.30)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 16V4L9.5 13.5V4M10.5 4V16L17 6.5V16" stroke="url(#n-grad-abt)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs><linearGradient id="n-grad-abt" x1="3" y1="4" x2="17" y2="16" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#c7d0ff"/><stop offset="100%" stopColor="#6b85f9"/></linearGradient></defs>
        </svg>
      </div>
    </motion.button>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return (
    <motion.header initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", backdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none", WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none", background: scrolled ? "rgba(5,5,10,0.80)" : "transparent", borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`, transition: "background 0.4s, border-color 0.4s" } as React.CSSProperties}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <Logo3D onClick={() => window.location.href = "/"} />
        <button onClick={() => window.location.href = "/"} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: T.text }}>Nadia Maar</span>
        </button>
      </div>
      <nav className="abt-nav-links" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {[
          { label: "Home", href: "/" },
          { label: "Contatti", href: "/#s9" },
        ].map(({ label, href }) => (
          <motion.a key={label} href={href}
            whileHover={{ color: T.text }} transition={{ duration: 0.18 }}
            style={{ ...MONO_LABEL, fontSize: 11, color: T.muted, textDecoration: "none", padding: "8px 16px", borderRadius: 8, display: "block" }}>
            {label}
          </motion.a>
        ))}
        <motion.a href="mailto:nadiamaar.dev@gmail.com"
          className="abt-rainbow"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ ...MONO_LABEL, fontSize: 11, color: T.text, textDecoration: "none", padding: "9px 22px", borderRadius: 9999, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", marginLeft: 8, display: "inline-block" } as React.CSSProperties}>
          Get in Touch
        </motion.a>
      </nav>
    </motion.header>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §1  HERO & CORE IDENTITY
══════════════════════════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 64 }}>
      {/* ambient orb */}
      <motion.div aria-hidden
        animate={{ x: [0, 60, -40, 50, 0], y: [0, -80, 60, -40, 0], scale: [1, 1.12, 0.90, 1.06, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "5%", left: "30%", width: 820, height: 820, borderRadius: "50%", background: "radial-gradient(circle, rgba(85,0,210,0.10) 0%, transparent 70%)", filter: "blur(70px)", pointerEvents: "none" }}
      />

      <div className="abt-wrap" style={{ position: "relative", zIndex: 1, paddingTop: 80, paddingBottom: 80 }}>
        {/* chip label */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <ChipLabel text="Architecture & Code" />
        </motion.div>

        {/* H1 */}
        <motion.h1
          className="abt-hero-h1"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.10, ease }}
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(52px, 7.5vw, 108px)",
            fontWeight: 900,
            lineHeight: 0.96,
            letterSpacing: "-0.04em",
            color: T.text,
            margin: "0 0 32px",
            maxWidth: 900,
            filter: [
              "drop-shadow(0 1px 0 rgba(120,60,255,0.60))",
              "drop-shadow(0 3px 0 rgba(100,0,255,0.38))",
              "drop-shadow(0 6px 0 rgba(70,0,200,0.22))",
              "drop-shadow(0 12px 28px rgba(0,0,0,0.70))",
              "drop-shadow(0 28px 48px rgba(102,0,255,0.14))",
            ].join(" "),
          }}
        >
          DIGITAL<br />ARCHITECT<span style={{ color: "rgba(255,255,255,0.28)", fontWeight: 300 }}>&amp;</span><br />
          <span style={{ color: T.titanium }}>E-COMMERCE<br />DEVELOPER</span>
        </motion.h1>

        {/* location badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}
        >
          <PingDot color={T.green} size={7} />
          <span style={{ ...MONO_LABEL, fontSize: 11, color: T.muted, letterSpacing: "0.28em" }}>
            BASED IN ITALY&nbsp;/&nbsp;AVAILABLE WORLDWIDE
          </span>
        </motion.div>

        {/* description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.80, delay: 0.30, ease }}
          style={{ fontSize: "clamp(15px, 1.4vw, 18px)", color: T.muted, fontWeight: 300, maxWidth: 600, lineHeight: 1.90, margin: "0 0 48px" }}
        >
          Progetto e sviluppo ecosistemi digitali d'élite combinando un'estetica visiva premium
          con una solida ingegneria software. Dal primo sketch concettuale al codice di produzione
          pronto per la scalabilità: un unico flusso di lavoro lineare, guidato dalla logica
          e privo di compromessi.
        </motion.p>

        {/* actions */}
        <motion.div
          className="abt-hero-actions"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.70, delay: 0.40, ease }}
          style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}
        >
          {/* email contact */}
          <motion.a href="mailto:nadiamaar.dev@gmail.com"
            whileHover={{ color: T.text, x: 2 }} transition={{ duration: 0.20 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, color: T.muted, textDecoration: "none", ...MONO_LABEL }}>
            <MailIcon size={13} />
            CONTACT: nadiamaar.dev@gmail.com
          </motion.a>

          {/* vertical divider */}
          <span style={{ width: 1, height: 20, background: T.border, flexShrink: 0 }} />

          {/* CV button */}
          <motion.a href="#" target="_blank" rel="noopener noreferrer"
            className="abt-rainbow"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "13px 28px", borderRadius: 9999, textDecoration: "none",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 12px rgba(0,0,0,0.22)",
              color: T.text, ...MONO_LABEL,
            } as React.CSSProperties}
          >
            VIEW CV
            <ArrowUpRight size={12} />
          </motion.a>
        </motion.div>

        {/* bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.7, ease }}
          style={{ height: 1, background: `linear-gradient(90deg, ${T.accent}, ${T.accentLt}, transparent)`, marginTop: 80, transformOrigin: "left", maxWidth: 480, opacity: 0.40 }}
        />
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §2  PHILOSOPHY & METHOD
══════════════════════════════════════════════════════════════════════════ */
const PHILOSOPHY_PARAS = [
  "Mi bastano due parole per comprendere e mappare l'intera struttura del tuo business. Questa intuizione immediata, unita a un profondo pensiero creativo, mi permette di decodificare la tua visione commerciale e modellarla istantaneamente in un'architettura digitale ad altissime prestazioni.",
  "Fondo l'eleganza del minimalismo visivo con prestazioni frontend eccezionali. Ogni singola linea di codice, ogni campagna e ogni scelta di layout sono progettate per un unico scopo: eliminare il superfluo, massimizzare la conversione B2B e dominare il posizionamento di mercato.",
  "Ottimizzo il flusso di lavoro integrando i più avanzati sistemi di intelligenza artificiale applicata allo sviluppo e alla SEO. Questo mi permette di scrivere codice impeccabile, condurre test rigorosi e consegnare infrastrutture complesse a una velocità inarrivabile per le agenzie tradizionali.",
]

function PhilosophySection() {
  return (
    <section style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div
          className="abt-philosophy-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "0 100px", alignItems: "start" }}
        >
          {/* left — sticky title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}
            style={{ position: "sticky", top: 100 }}
          >
            <ChipLabel text="The Approach" />
            <h2 style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(32px, 3.8vw, 56px)",
              fontWeight: 900, lineHeight: 1.05,
              letterSpacing: "-0.04em", color: T.text,
              margin: 0,
            }}>
              THE<br />
              <span style={{ color: T.accentLt }}>APPROACH</span>
            </h2>

            {/* decorative accent mark */}
            <div style={{
              width: 48, height: 3, marginTop: 32, borderRadius: 2,
              background: `linear-gradient(90deg, ${T.accent}, ${T.accentLt})`,
            }} />
          </motion.div>

          {/* right — paragraphs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {PHILOSOPHY_PARAS.map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.70, delay: i * 0.12, ease }}
                style={{
                  padding: i === 0 ? "0 0 48px" : "48px 0",
                  borderBottom: i < PHILOSOPHY_PARAS.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                {/* paragraph number */}
                <span style={{
                  display: "block", ...MONO_LABEL, fontSize: 10,
                  color: T.accentLt, marginBottom: 20, opacity: 0.70,
                }}>
                  0{i + 1}
                </span>
                <p style={{
                  fontSize: "clamp(15px, 1.3vw, 17px)",
                  color: T.titanium, lineHeight: 1.90,
                  fontWeight: 300, margin: 0,
                }}>
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §3  CORE CAPABILITIES & TECH TOOLKIT
══════════════════════════════════════════════════════════════════════════ */
const TOOLKIT = [
  {
    num: "01",
    title: "Design & Thinking",
    items: [
      "Pensiero Creativo & Strategia",
      "Premium UI/UX Design",
      "Minimalist Aesthetics",
      "Advanced Design Systems",
      "Framer Prototyping",
      "Mobile-First Architecture",
    ],
  },
  {
    num: "02",
    title: "E-Commerce Eng.",
    items: [
      "Shopify Custom Sviluppo",
      "Headless Commerce",
      "Custom Checkouts",
      "Data Migrations",
      "CRO Optimization",
      "E-commerce Analytics",
    ],
  },
  {
    num: "03",
    title: "Web, Mobile & AI",
    items: [
      "React.js & Next.js",
      "Tailwind CSS",
      "JavaScript (ES6+)",
      "Expo & Supabase",
      "AI-Driven Coding Workflows",
      "Claude Code & Cursor",
    ],
  },
  {
    num: "04",
    title: "Acquisition & Growth",
    items: [
      "SEO Avanzato & AI SEO Audit",
      "Google Ads (Search & Pmax)",
      "Meta Ads (FB & Instagram)",
      "Funnel Strategy & Growth",
      "B2B Lead Generation",
      "Conversion Tracking Advanced",
    ],
  },
]

function ToolkitSection() {
  return (
    <section style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        {/* header */}
        <div style={{ marginBottom: 80 }}>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
            <ChipLabel text="Core Capabilities" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.08, ease }}
            style={{ fontFamily: DISPLAY, fontSize: "clamp(30px, 4vw, 60px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", color: T.text, margin: 0, maxWidth: 700 }}
          >
            TECH TOOLKIT
          </motion.h2>
        </div>

        {/* 4-column grid */}
        <div
          className="abt-toolkit-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0 48px" }}
        >
          {TOOLKIT.map(({ num, title, items }, ci) => (
            <motion.div
              key={ci}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: ci * 0.09, ease }}
            >
              {/* column header */}
              <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${T.border}` }}>
                <span style={{ ...MONO_LABEL, fontSize: 10, color: T.accentLt, display: "block", marginBottom: 10 }}>{num}</span>
                <h3 style={{
                  fontFamily: DISPLAY, fontSize: 15, fontWeight: 800,
                  letterSpacing: "-0.01em", color: T.text,
                  textTransform: "uppercase" as const,
                }}>
                  {title}
                </h3>
              </div>

              {/* items list */}
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 0 }}>
                {items.map((item, ii) => (
                  <motion.li
                    key={ii}
                    initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: ci * 0.08 + ii * 0.05, ease }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "11px 0",
                      borderBottom: ii < items.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none",
                      cursor: "default",
                    }}
                    whileHover={{ x: 3 }}
                  >
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.accentLt, flexShrink: 0, marginTop: 7, opacity: 0.60 }} />
                    <span style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.55, fontWeight: 300 }}>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §4  FAQs
══════════════════════════════════════════════════════════════════════════ */
const FAQS = [
  {
    q: "Cosa significa sviluppare con un approccio \"Digital Architect\"?",
    a: "Significa che il tuo progetto non viene delegato a figure intermedie. Gestisco l'intero processo: dall'analisi logica iniziale basata su pochi elementi chiave, allo sviluppo dell'interfaccia premium, fino alla scrittura del codice frontend, all'ottimizzazione SEO e al Growth Marketing. Un unico punto di contatto, zero colli di bottiglia.",
  },
  {
    q: "Oltre allo sviluppo, ti occupi anche di acquisizione traffico e advertising?",
    a: "Sì. Un ecosistema digitale eccezionale richiede una visibilità straordinaria. Integro nativamente l'ottimizzazione SEO avanzata basata su AI fin dalla progettazione e gestisco campagne di acquisizione ad alto budget su Google Ads e Meta Ads, strutturando funnel completi per la lead generation B2B e la vendita e-commerce.",
  },
  {
    q: "Qual è il tuo stack tecnologico principale?",
    a: "Per le applicazioni web e le interfacce dinamiche utilizzo React.js e Next.js combinati con Tailwind CSS. Per lo sviluppo mobile e le infrastrutture backend agili mi affido a Expo e Supabase. Nel campo dell'e-commerce focalizzato sulla massima scalabilità e stabilità, opero esclusivamente su piattaforma Shopify Custom.",
  },
  {
    q: "Come applichi l'Intelligenza Artificiale nel tuo flusso di lavoro?",
    a: "Utilizzo strumenti di AI-assisted coding di ultima generazione e algoritmi predittivi per la SEO e le campagne Meta/Google. Questo accelera in modo esponenziale la scrittura del codice, il monitoraggio dei dati e l'ottimizzazione dei motori di ricerca, permettendomi di consegnare infrastrutture perfette in tempi ridotti.",
  },
  {
    q: "Come gestisci i tempi, i costi e le migrazioni di siti esistenti?",
    a: "Ogni progetto parte con una fase accurata di scoping tecnico. Fornisco sempre una timeline realistica (solitamente da poche settimane a due mesi) e un preventivo fisso. Se hai una piattaforma obsoleta, gestisco la migrazione verso Shopify preservando integralmente il tuo posizionamento SEO, i meta tag e la sicurezza dei dati storici.",
  },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      data-glow=""
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.60, delay: index * 0.07, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      style={{
        '--base': '220', '--spread': '90', '--radius': '16', '--border': '1.5', '--size': '280',
        position: "relative", borderRadius: 16,
        background: open ? "rgba(102,0,255,0.05)" : hov ? G.bgHov : G.bg,
        backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        border: `1px solid ${open ? "rgba(102,0,255,0.42)" : hov ? G.bdHov : G.bd}`,
        boxShadow: open ? "0 12px 44px rgba(0,0,0,0.50), 0 0 0 1px rgba(102,0,255,0.14), inset 0 1px 0 rgba(255,255,255,0.10)" : G.shadow,
        transition: "background 0.25s, border-color 0.25s, box-shadow 0.30s",
        overflow: "hidden",
      } as React.CSSProperties}
    >
      {/* top accent on open */}
      <div style={{ height: 2, background: open ? `linear-gradient(90deg, ${T.accent}, ${T.accentLt}, transparent)` : "transparent", transition: "background 0.3s" }} />

      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, padding: "28px 32px", background: "none", border: "none", cursor: "pointer", color: T.text, textAlign: "left", fontFamily: "inherit" }}
      >
        <span style={{ fontSize: "clamp(14px, 1.2vw, 16px)", fontWeight: 500, lineHeight: 1.45, letterSpacing: "-0.01em", flex: 1 }}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0, color: open ? T.accentLt : T.faint }}
          transition={{ duration: 0.30, ease }}
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 32px 32px", paddingTop: 0 }}>
              <p style={{ fontSize: "clamp(14px, 1.15vw, 15.5px)", color: T.muted, lineHeight: 1.88, margin: 0, fontWeight: 300 }}>
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQSection() {
  return (
    <section style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 80px", alignItems: "start" }}>
          {/* left label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease }}
            style={{ position: "sticky", top: 100 }}
          >
            <ChipLabel text="FAQ" />
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              LOGICA&<br />TRASPAR<span style={{ color: T.accentLt }}>ENZA</span>
            </h2>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, marginTop: 20, fontWeight: 300, maxWidth: 240 }}>
              Risposte dirette alle domande che contano davvero.
            </p>
          </motion.div>

          {/* right FAQ list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} {...faq} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §5  FINAL CTA + FOOTER
══════════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  const [hov, setHov] = useState(false)
  return (
    <section style={{ position: "relative", borderTop: `1px solid ${T.border}`, overflow: "hidden" }}>
      {/* large ambient orb */}
      <motion.div aria-hidden
        animate={{ scale: [1, 1.15, 0.90, 1.10, 1], opacity: [0.60, 0.90, 0.40, 0.78, 0.60] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(102,0,255,0.10) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }}
      />

      <div className="abt-wrap" style={{ paddingTop: 120, paddingBottom: 80, position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* H2 */}
        <motion.h2
          className="abt-cta-h2"
          initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.90, ease }}
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(44px, 7vw, 100px)",
            fontWeight: 900, lineHeight: 0.94,
            letterSpacing: "-0.045em",
            color: T.text, margin: "0 auto 60px",
            maxWidth: 900,
          }}
        >
          GOT SOMETHING
          <br />
          <span style={{
            WebkitTextStroke: "1.5px rgba(255,255,255,0.28)",
            color: "transparent",
          }}>
            WORTH BUILDING?
          </span>
        </motion.h2>

        {/* CTA link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.70, delay: 0.18, ease }}
        >
          <motion.a
            href="mailto:nadiamaar.dev@gmail.com"
            onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              padding: "18px 42px", borderRadius: 9999, textDecoration: "none",
              background: hov ? "rgba(102,0,255,0.18)" : "rgba(255,255,255,0.06)",
              border: `1.5px solid ${hov ? "rgba(153,68,255,0.55)" : "rgba(255,255,255,0.14)"}`,
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              boxShadow: hov ? `0 0 40px rgba(102,0,255,0.28), inset 0 1px 0 rgba(255,255,255,0.12)` : "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.28)",
              color: T.text,
              fontFamily: MONO, fontSize: 13, fontWeight: 500,
              letterSpacing: "0.22em", textTransform: "uppercase" as const,
              transition: "background 0.25s, border-color 0.25s, box-shadow 0.30s",
            } as React.CSSProperties}
          >
            GET IN TOUCH
            <motion.span
              animate={{ x: hov ? 4 : 0, y: hov ? -4 : 0 }}
              transition={{ duration: 0.20 }}
            >
              <ArrowUpRight size={15} />
            </motion.span>
          </motion.a>
        </motion.div>

        {/* Decorative thin rule */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.border} 30%, ${T.border} 70%, transparent)`, margin: "80px 0 48px" }} />

        {/* Footer */}
        <div
          className="abt-footer-links"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}
        >
          <span style={{ ...MONO_LABEL, fontSize: 10, color: T.faint }}>
            © NADIA MAAR 2026
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {[
              { label: "LINKEDIN", href: "https://linkedin.com/in/nadiamaar", Icon: LinkedinIcon },
              { label: "GITHUB",   href: "https://github.com/nadiamaar-dev", Icon: GithubIcon },
            ].map(({ label, href, Icon }) => (
              <motion.a
                key={label} href={href} target="_blank" rel="noopener noreferrer"
                whileHover={{ color: T.text, y: -1 }} transition={{ duration: 0.18 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, ...MONO_LABEL, fontSize: 10, color: T.faint, textDecoration: "none" }}
              >
                <Icon size={12} />
                {label}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════════════════════ */
export default function NadiaMaarAbout() {
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
    <div style={{
      background: T.bg,
      color: T.text,
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      overflowX: "hidden",
      minHeight: "100vh",
      position: "relative",
    }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <CursorGlow />
      <AnimatedBackground />
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <HeroSection />
        <HairRule />
        <PhilosophySection />
        <ToolkitSection />
        <FAQSection />
        <FinalCTA />
      </div>
    </div>
  )
}
