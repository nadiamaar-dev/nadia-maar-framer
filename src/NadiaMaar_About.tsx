/**
 * NadiaMaar_About.tsx — About Me / Info Page  ·  v3 "Solar Glass"
 * Ultra-modern 2026 · Obsidian base · Orange→copper aurora · Glassmorphism
 *
 * Design language (ref-driven):
 *  · warm aurora glow bleeding across a near-black canvas
 *  · oversized display headlines with white→amber gradient fill
 *  · frosted glass panels & bento stat cards with giant gradient numerals
 *  · solid pill CTAs with a white circular arrow badge
 *  · horizontal "ruler" process timeline
 *  · giant glowing wordmark behind the footer
 *  · editorial mono corner labels (category · index)
 *
 * NOTE: content marked  //PLACEHOLDER  is dummy — replace with real facts.
 */

import React, { useState, useEffect, useRef } from "react"
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useInView,
} from "framer-motion"
import Footer from "./components/Footer"
import { CONTACT, mailLink } from "./lib/contact"
import FloatingContact from "./components/FloatingContact"
import Header from "./components/Header"
import { sendContact, withExtras } from "./lib/sendContact"
import Background from "./components/Background"
import FoundryShowcase from "./components/FoundryShowcase"
import StudioApproach from "./components/studio/StudioApproach"
import StudioCapabilities from "./components/studio/StudioCapabilities"
import { processo, type Fase } from "./data/process"
import { useLocale } from "./lib/i18n/LocaleContext"
import { useT } from "./lib/i18n/t"
import { ABOUT_STR } from "./lib/i18n/strings/about"
import { usePointerGlow } from "./hooks/usePointerGlow"

/* ══════════════════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════════════════ */
const XIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

/* ══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — Obsidian + solar orange / copper aurora
══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#060C18",
  surface:   "#0A1020",
  border:    "rgba(255,255,255,0.11)",
  text:      "#FFFFFF",
  muted:     "#FFFFFF",
  faint:     "#FFFFFF",
  accent:    "#B83240",
  accentGlo: "rgba(184,50,64,0.45)",
  accentLt:  "#BE3648",
  /* Rame per il TESTO. #BE3648 su fondo scuro misura 3,55:1 e sotto i
     18px non arriva alla soglia AA di 4,5:1 — è nato per riempimenti e
     bordi, dove il contrasto non si applica. Stessa distinzione già in
     uso nel portale (copper / copperTx in portal/ui.tsx). */
  accentTx:  "#E4697A",
  green:     "#10B981",
} as const

// warm rgba helpers
const AM = (a: number) => `rgba(184,50,64,${a})`
const LT = (a: number) => `rgba(190,54,72,${a})`
/* Rame per il TESTO: AM e LT nascono per riempimenti e bordi e sotto i 18px
   non arrivano alla soglia AA. Stessa distinzione del portale. */
const TX = (a: number) => `rgba(228,105,122,${a})`
const OR = (a: number) => `rgba(184,50,64,${a})`
const RD = (a: number) => `rgba(120,20,30,${a})`

// white -> amber gradient text fill

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"
const BODY: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif", fontSize: "clamp(16px, 1.4vw, 17px)", fontWeight: 400, lineHeight: 1.85, letterSpacing: "0.01em" }
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/*+<>{}[]"

const MONO_LABEL: React.CSSProperties = {
  fontFamily: MONO, letterSpacing: "0.20em",
  textTransform: "uppercase", fontSize: 10.5, fontWeight: 500,
}

/* ══════════════════════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; scroll-behavior: smooth; }
  p, li { font-weight: 300; line-height: 1.8; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #060C18; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  :root { --x:-9999; --y:-9999; --xp:0; --yp:0; }

  /* brick text — semi-transparent + warm glow, matching button quality */
  [style*="color: #BE3648"],
  [style*='color: "#BE3648"'] {
    color: rgba(190,54,72,0.82) !important;
    text-shadow:
      0 0 52px rgba(190,54,72,0.38),
      0 0 18px rgba(190,54,72,0.26),
      0 2px 6px rgba(0,0,0,0.28);
  }
  [style*="color: #B83240"],
  [style*='color: "#B83240"'] {
    text-shadow: 0 0 24px rgba(184,50,64,0.45), 0 0 8px rgba(184,50,64,0.26);
  }

  [data-glow] {
    --border-size: calc(var(--border,1.5) * 1px);
    --spotlight-size: calc(var(--size,260) * 1px);
    --hue: calc(var(--base,28) + (var(--xp,0) * var(--spread,40)));
    background-image: radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(var(--hue) 100% 60% / var(--bg-spot-opacity,0.05)), transparent
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
      hsl(var(--hue) 100% 58% / var(--border-spot-opacity,0.60)), transparent 100%
    ); filter: brightness(1.5);
  }
  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.4) calc(var(--spotlight-size) * 0.4) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity,0.20)), transparent 100%
    );
  }

  @keyframes colon-blink { 0%, 100% { opacity: 0.9; } 50% { opacity: 0.1; } }
  .abt-caret { display: inline-block; width: 8px; height: 1.05em; background: ${T.accentLt}; vertical-align: -2px; margin-left: 2px; animation: colon-blink 1s steps(1) infinite; }

  @keyframes abt-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .abt-marquee-track { display: inline-flex; align-items: center; white-space: nowrap; animation: abt-marquee 34s linear infinite; will-change: transform; }
  .abt-marquee:hover .abt-marquee-track { animation-play-state: paused; }

  @keyframes abt-bar { 0%,100% { transform: scaleY(0.35); opacity:0.5; } 50% { transform: scaleY(1); opacity:1; } }

  /* interactive capability tag */
  .abt-tag { display: inline-block; padding: 5px 11px; border-radius: 9999px; font-weight: 400; line-height: 1.4; color: #FFFFFF; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14); letter-spacing: 0.01em; cursor: default; transition: background .22s, border-color .22s, color .22s, transform .22s; }
  .abt-tag:hover { background: rgba(190,54,72,0.20); border-color: rgba(190,54,72,0.48); color: #fff; transform: translateY(-1px); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }

  .abt-wrap { max-width: 1160px; margin: 0 auto; padding: 0 40px; }
  .abt-footer-main-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; }
  @media (max-width: 768px) {
    /* body copy stays at 16px on phones — !important beats the inline size */
    .hp-body { font-size: 16px !important; }
    .abt-footer-main-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
    .abt-footer-brand-desc { display: none !important; }
    .abt-footer-nav-col { display: none !important; }
    .abt-footer-contact-col { display: none !important; }
    .abt-datetime { display: none !important; }
  }

  .abt-hero-grid { display: grid; grid-template-columns: 1fr 400px; gap: 0 56px; align-items: center; }
  .abt-hero-right { display: flex; flex-direction: column; gap: 16px; }

  .abt-stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }

  .abt-bento { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
  .abt-bento-item:nth-child(1) { grid-column: span 4; grid-row: span 2; }
  .abt-bento-item:nth-child(2) { grid-column: span 2; }
  .abt-bento-item:nth-child(3) { grid-column: span 2; }
  .abt-bento-item:nth-child(4) { grid-column: span 6; }

  .abt-now-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  .abt-process-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 44px; }
  .abt-process-steps > :nth-child(even) { margin-top: 52px; }
  .abt-ruler { position: relative; height: 46px; border-radius: 10px; border: 1px solid ${T.border};
    background:
      repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 12px),
      linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008));
    display: flex; align-items: center; justify-content: space-around; overflow: hidden; }

  .abt-cursor-ring { position: fixed; top: 0; left: 0; width: 30px; height: 30px; border-radius: 50%;
    border: 1px solid rgba(124,34,43,0.60); pointer-events: none; z-index: 600; mix-blend-mode: screen;
    transform: translate(calc(var(--x) * 1px - 15px), calc(var(--y) * 1px - 15px));
    transition: transform 0.12s ease-out, width 0.2s, height 0.2s, opacity 0.2s; }

  @media (max-width: 1024px) {
    .abt-hero-grid { grid-template-columns: 1fr !important; }
    .abt-hero-right { display: none !important; }
    .abt-cursor-ring { display: none !important; }
  }
  .abt-approach-row { display: grid; grid-template-columns: 96px 1fr; gap: 0 48px; padding: 40px 0 44px; align-items: start; }
  .abt-process-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

  @media (max-width: 900px) {
    .abt-approach-row { grid-template-columns: 64px 1fr; gap: 0 24px; padding: 28px 0 32px; }
    .abt-process-cards { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .abt-philosophy-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .abt-hero-h1 { font-size: clamp(38px, 9vw, 62px) !important; }
    .abt-hero-actions { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
    .abt-cta-h2 { font-size: clamp(40px, 10vw, 84px) !important; }
    .abt-stat-grid { grid-template-columns: 1fr !important; }
    .abt-faq-grid { grid-template-columns: 1fr !important; }
    .abt-bento { grid-template-columns: 1fr !important; }
    .abt-bento-item { grid-column: auto !important; grid-row: auto !important; }
    .abt-now-grid { grid-template-columns: 1fr !important; }
    .abt-process-steps { grid-template-columns: 1fr !important; }
    .abt-process-steps > * { margin-top: 0 !important; }
    .abt-ruler { display: none !important; }
    .abt-section-pad { padding-top: 76px !important; padding-bottom: 76px !important; }
    .abt-philosophy-sticky { position: static !important; }
    .abt-faq-sticky { position: static !important; margin-bottom: 40px !important; }
    .abt-wordmark { font-size: clamp(90px, 30vw, 200px) !important; }
  }
  @media (max-width: 640px) {
    .abt-approach-row { grid-template-columns: 1fr; gap: 12px 0; padding: 24px 0 28px; }
    .abt-process-cards { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .abt-wrap { padding: 0 20px !important; }
    .abt-footer-links { flex-direction: column !important; gap: 10px !important; text-align: center; }
    .abt-hero-h1 { font-size: clamp(36px, 13vw, 58px) !important; }
    .abt-section-pad { padding-top: 60px !important; padding-bottom: 60px !important; }
    .abt-hero-inner { padding-top: 36px !important; padding-bottom: 52px !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    .abt-marquee-track { animation: none !important; }
    .abt-cursor-ring { display: none !important; }
  }
`

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

/** Big translucent index numeral — editorial watermark behind card content. */

/** Shared refined-glass surface. Pass hover state for the lit variant. */
/** Numbered editorial section kicker — §NN —— EYEBROW. The cohesion backbone. */
function Kicker({ index, text, center = false }: { index: string; text: string; center?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22, justifyContent: center ? "center" : "flex-start" }}>
      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.18em", color: T.accentTx }}>§{index}</span>
      <span aria-hidden style={{ width: 30, height: 1, background: `linear-gradient(90deg, ${LT(0.6)}, ${LT(0.1)})` }} />
      <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>{text}</span>
    </div>
  )
}

/** Magnetic wrapper — element gently follows the cursor. */
function PillCTA({ label, href, onClick, target }: { label: string; href?: string; onClick?: () => void; target?: string }) {
  const [h, setH] = useState(false)
  const btnStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "stretch",
    borderRadius: 12, cursor: "pointer",
    border: `1px solid ${h ? "rgba(184,50,64,0.80)" : "rgba(184,50,64,0.50)"}`,
    background: "linear-gradient(90deg, rgba(184,50,64,0.34) 0%, rgba(184,50,64,0.20) 100%)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    boxShadow: h ? "0 0 24px rgba(184,50,64,0.35), inset 0 1px 0 rgba(255,255,255,0.18)" : "0 0 12px rgba(184,50,64,0.20), inset 0 1px 0 rgba(255,255,255,0.12)",
    textDecoration: "none", overflow: "hidden",
    transition: "border-color 0.25s, box-shadow 0.30s",
  }
  const inner = (
    <>
      <span style={{ padding: "14px 14px 14px 18px", borderRight: "1px solid rgba(184,50,64,0.45)", display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", color: "#FFFFFF", flexShrink: 0 }}>[01]</span>
      <span style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
        {label}
        <motion.span animate={{ x: h ? [0,4,0] : 0 }} transition={{ duration: 0.55, repeat: h ? Infinity : 0, ease: "easeInOut" }} style={{ fontSize: 14, color: "#FFFFFF" }}>→</motion.span>
      </span>
    </>
  )
  return (
    <motion.div onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} style={{ display: "inline-flex" }}>
      {href ? <a href={href} target={target} rel={target ? "noopener noreferrer" : undefined} style={btnStyle}>{inner}</a>
             : <button onClick={onClick} style={btnStyle}>{inner}</button>}
    </motion.div>
  )
}

/** Text that scrambles into place on mount and re-scrambles on hover. */
function ScrambleLine({ text, delay = 0, style }: { text: string; delay?: number; style?: React.CSSProperties }) {
  const [out, setOut] = useState(text)
  const idRef = useRef<number | null>(null)
  const scramble = () => {
    if (idRef.current) clearInterval(idRef.current)
    let frame = 0
    idRef.current = window.setInterval(() => {
      setOut(
        text.split("").map((c, i) => {
          if (c === " ") return " "
          return i < frame ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }).join("")
      )
      frame += 0.5
      if (frame >= text.length) { if (idRef.current) clearInterval(idRef.current); setOut(text) }
    }, 34)
  }
  useEffect(() => {
    const t = setTimeout(scramble, delay)
    return () => { clearTimeout(t); if (idRef.current) clearInterval(idRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <span onMouseEnter={scramble} style={{ cursor: "default", ...style }}>{out}</span>
}

/* ══════════════════════════════════════════════════════════════════════════
   DATETIME WIDGET
══════════════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS + CURSOR RING
══════════════════════════════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 })
  return (
    <motion.div aria-hidden
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 500,
        transformOrigin: "0% 50%", scaleX,
        background: "linear-gradient(90deg, rgba(90,40,40,1), #7C222B, #BE3648)",
        boxShadow: "0 0 12px rgba(124,34,43,0.7)",
      }}
    />
  )
}

function CursorRing() {
  return <div aria-hidden className="abt-cursor-ring" />
}

/* ══════════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
   §1  HERO — editorial labels · gradient headline · glass tablet · pill CTA
══════════════════════════════════════════════════════════════════════════ */
//PLACEHOLDER boot-log lines for the glass terminal
const TERMINAL_LINES = [
  { p: "$", t: " whoami", c: T.accentLt },
  { p: ">", t: " nadia_maar · digital_architect", c: "rgba(160,220,160,0.85)" },
  { p: "$", t: " cat stack.json", c: T.accentLt },
  { p: ">", t: " react · next · shopify · supabase", c: "rgba(120,190,255,0.80)" },
  { p: "$", t: " status --now", c: T.accentLt },
  { p: ">", t: " available_for_work ✓", c: T.green },
]

function LiveTerminal() {
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  useEffect(() => {
    if (lineIdx >= TERMINAL_LINES.length) return
    const full = TERMINAL_LINES[lineIdx].p + TERMINAL_LINES[lineIdx].t
    if (charIdx < full.length) {
      const id = setTimeout(() => setCharIdx(c => c + 1), 32 + Math.random() * 34)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => { setLineIdx(i => i + 1); setCharIdx(0) }, 460)
    return () => clearTimeout(id)
  }, [lineIdx, charIdx])

  return (
    <div style={{
      borderRadius: 16, padding: "18px 20px 20px",
      background: "rgba(0,0,0,0.12)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.14)",
      fontFamily: MONO, fontSize: 12, lineHeight: 1.95,
      boxShadow: "0 8px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)",
      minHeight: 190,
    }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["#FF5F57", "#FEBC2E", "#10B981"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
        <span style={{ marginLeft: "auto", fontSize: 9.5, letterSpacing: "0.14em", color: "#FFFFFF", textTransform: "uppercase" as const }}>zsh — nadia@dev</span>
      </div>
      {TERMINAL_LINES.map((ln, i) => {
        if (i > lineIdx) return null
        const full = ln.p + ln.t
        const shown = i < lineIdx ? full : full.slice(0, charIdx)
        return (
          <div key={i} style={{ whiteSpace: "pre-wrap" }}>
            <span style={{ color: ln.p === "$" ? "#FFFFFF" : ln.c }}>{shown.slice(0, 1)}</span>
            <span style={{ color: ln.p === "$" ? "#FFFFFF" : ln.c }}>{shown.slice(1)}</span>
            {i === lineIdx && <span className="abt-caret" />}
          </div>
        )
      })}
    </div>
  )
}

function HeroSection() {
  const t = useT(ABOUT_STR).hero
  return (
    <section style={{ minHeight: "100svh", display: "flex", alignItems: "flex-start", position: "relative", overflow: "clip", paddingTop: 64 }}>
      <div className="abt-wrap abt-hero-inner" style={{ position: "relative", zIndex: 1, paddingTop: 40, paddingBottom: 64, width: "100%" }}>

        {/* editorial corner row */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 40 }}>
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.accentTx }}>{t.corner}</span>
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.faint }}>{t.cornerRight}</span>
        </motion.div>

        <div className="abt-hero-grid">
          {/* LEFT */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
              <Kicker index="01" text={t.kicker} />
            </motion.div>

            <motion.h1
              className="abt-hero-h1"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.10, ease }}
              style={{
                fontFamily: DISPLAY, fontSize: "clamp(42px, 5.2vw, 78px)", fontWeight: 900,
                lineHeight: 0.95, letterSpacing: "-0.045em", color: T.text, margin: "0 0 30px",
              }}
            >
              <ScrambleLine text={t.h1[0]} delay={280} /><br />
              <ScrambleLine text={t.h1[1]} delay={430} style={{ color: "#FFFFFF" }} /><br />
              <ScrambleLine text={t.h1[2]} delay={560} style={{ color: "#FFFFFF", fontWeight: 300 }} />{" "}
              <ScrambleLine text={t.h1[3]} delay={620} style={{ color: "#FFFFFF" }} /><br />
              <ScrambleLine text={t.h1[4]} delay={760} style={{ color: "#FFFFFF" }} />
            </motion.h1>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.22, ease }}
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
              <PingDot color={T.green} size={7} />
              <span style={{ ...MONO_LABEL, fontSize: 11, color: T.muted, letterSpacing: "0.26em" }}>
                {t.location}
              </span>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.80, delay: 0.30, ease }}
              style={{ ...BODY, color: T.muted, maxWidth: 540, margin: "0 0 44px" }}>
              {t.lead}
            </motion.p>

            <motion.div className="abt-hero-actions" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.70, delay: 0.40, ease }}
              style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <PillCTA label={t.cta} href={mailLink()} />
            </motion.div>
          </div>

          {/* RIGHT — frosted glass tablet + terminal */}
          <motion.div className="abt-hero-right" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.90, delay: 0.30, ease }}
            style={{ position: "relative" }}>
            <div style={{
              position: "relative",
              borderRadius: 22, padding: "28px 28px 24px",
              background: "rgba(6,12,24,0.08)",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>
              {/* ── Eyebrow ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: T.faint }}>
                  <span style={{ color: T.accentTx }}>//</span> {t.identity}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 10px", borderRadius: 99, background: "rgba(75,211,155,0.08)", border: "1px solid rgba(75,211,155,0.22)" }}>
                  <PingDot color={T.green} size={5} />
                  <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.20em", textTransform: "uppercase", color: T.green }}>{t.available}</span>
                </div>
              </div>

              {/* ── Name block ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                {/* NM badge */}
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(184,50,64,0.14)", border: "1px solid rgba(184,50,64,0.35)" }}>
                  <svg viewBox="0 2 28 22" width="22" height="18" fill="none" strokeLinecap="square" strokeLinejoin="miter">
                    <defs>
                      <linearGradient id="nm-about" x1="2" y1="12" x2="27" y2="12" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
                        <stop offset="46%" stopColor="rgba(255,255,255,0.92)" />
                        <stop offset="58%" stopColor="#B83240" />
                        <stop offset="100%" stopColor="#7C222B" />
                      </linearGradient>
                    </defs>
                    <path d="M 2,22 L 2,2 L 13,22 L 13,2 L 19.5,12 L 26,2 L 26,22" stroke="url(#nm-about)" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em", color: T.text, lineHeight: 1.1 }}>Nadia Maar</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: T.faint, marginTop: 4 }}>{t.role}</div>
                </div>
              </div>

              {/* ── Red accent divider ── */}
              <div style={{ height: 1, background: `linear-gradient(90deg, rgba(184,50,64,0.70), rgba(184,50,64,0.20), transparent)`, margin: "0 0 18px" }} />

              {/* ── Skills grid 2-col ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 18 }}>
                {["React / Next.js", "Shopify Custom", "AI Automation", "SEO & Ads", "UI/UX Design", "TypeScript"].map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: AM(0.75), flexShrink: 0 }} />
                    <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.10em", color: T.muted, whiteSpace: "nowrap" }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* ── Location row ── */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 0 16px" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: T.accentTx }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: T.faint }}>{t.locationRow}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: TX(0.60), padding: "3px 8px", borderRadius: 6, border: `1px solid ${AM(0.22)}`, background: AM(0.08) }}>EU +</span>
              </div>
            </div>

            <LiveTerminal />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MARQUEE — tech ticker
══════════════════════════════════════════════════════════════════════════ */
//PLACEHOLDER tech / service keywords
const MARQUEE_ITEMS = [
  "React", "Next.js", "TypeScript", "Shopify Custom", "Tailwind CSS", "Supabase",
  "Framer Motion", "AI-Assisted Dev", "Headless Commerce", "SEO Avanzato",
  "Google Ads", "Meta Ads", "CRO", "UI/UX Design",
]

function MarqueeStrip() {
  const row = (
    <span className="abt-marquee-track">
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((it, i) => {
        const n = (i % MARQUEE_ITEMS.length) + 1
        return (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "0 22px" }}>
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 500, letterSpacing: "0.18em", color: T.accentTx }}>
              {String(n).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
              {it}
            </span>
            <span aria-hidden style={{ width: 1, height: 13, background: "rgba(255,255,255,0.13)", marginLeft: 10 }} />
          </span>
        )
      })}
    </span>
  )
  return (
    <div className="abt-marquee" style={{ position: "relative", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, overflow: "hidden", padding: "15px 0", background: "transparent" }}>
      {/* top red hairline accent */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${LT(0.45)} 30%, ${LT(0.45)} 70%, transparent)` }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 160, background: "linear-gradient(90deg, #060C18, transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 160, background: "linear-gradient(270deg, #060C18, transparent)", zIndex: 2, pointerEvents: "none" }} />
      {row}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §2  STAT BENTO — giant gradient numerals + accent statement card
══════════════════════════════════════════════════════════════════════════ */
//PLACEHOLDER metrics
/* Numeri e suffissi restano nel codice, categoria e didascalia nel dizionario:
   "5+" non cambia da una lingua all'altra, "Anni a costruire…" sì. */
const STATS_ART = [
  { n: 5,   pad: 2, suffix: "+"  },
  { n: 50,  pad: 0, suffix: "+"  },
  { n: 30,  pad: 0, suffix: "k+" },
]

type Stat = typeof STATS_ART[number] & { cat: string; sub: string }

function useCountUp(target: number, run: boolean, dur = 1300) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    let start: number | undefined
    let id = 0
    const step = (t: number) => {
      if (start === undefined) start = t
      const p = Math.min((t - start) / dur, 1)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [run, target, dur])
  return v
}

function StatCard({ s, i }: { s: Stat; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const val = useCountUp(s.n, inView)
  const [hov, setHov] = useState(false)
  const numStr = s.pad ? String(val).padStart(s.pad, "0") : String(val)
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.08, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      animate={{ y: hov ? -5 : 0 }}
      style={{
        position: "relative", overflow: "hidden", borderRadius: 14,
        padding: "16px 20px 18px", minHeight: 150,
        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14,
        background: hov ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.018)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: hov ? `0 20px 60px rgba(0,0,0,0.55), 0 0 34px ${OR(0.10)}, inset 0 1px 0 rgba(255,255,255,0.07)` : "0 8px 28px rgba(0,0,0,0.38)",
        transition: "background .3s, box-shadow .35s",
      }}>
      {/* top accent line — lights up red on hover */}
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${LT(hov ? 0.85 : 0.28)}, ${LT(hov ? 0.30 : 0.06)} 55%, transparent)`, transition: "background .4s" }} />

      {/* corner watermark digit */}
      <span aria-hidden style={{ position: "absolute", right: -4, bottom: -12, fontFamily: DISPLAY, fontWeight: 900, fontSize: 92, lineHeight: 1, letterSpacing: "-0.06em", color: "transparent", WebkitTextStroke: `1px ${LT(hov ? 0.14 : 0.06)}`, userSelect: "none", pointerEvents: "none", transition: "all .4s" }}>{i + 1}</span>

      {/* top row — category + index */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 9, letterSpacing: "0.20em", textTransform: "uppercase", color: hov ? T.accentTx : T.faint, transition: "color .3s" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: AM(hov ? 0.95 : 0.55), boxShadow: hov ? `0 0 8px ${OR(0.7)}` : "none", transition: "all .3s" }} />
          {s.cat}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", color: "#FFFFFF" }}>0{i + 1}/03</span>
      </div>

      {/* giant number with red-accent suffix */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "baseline", gap: 2 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: "clamp(44px, 5.2vw, 64px)", fontWeight: 900, lineHeight: 0.86, letterSpacing: "-0.055em", color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{numStr}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", color: T.accentTx }}>{s.suffix}</span>
      </div>

      {/* red gradient divider + label */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ height: 1.5, borderRadius: 2, marginBottom: 9, background: `linear-gradient(90deg, ${LT(hov ? 0.75 : 0.45)}, ${LT(0.12)} 45%, transparent)`, transition: "background .4s" }} />
        <div style={{ fontSize: 12, color: "#FFFFFF", lineHeight: 1.5, fontWeight: 300, maxWidth: 220 }}>{s.sub}</div>
      </div>
    </motion.div>
  )
}

function AccentBars() {
  return (
    <div aria-hidden style={{ position: "absolute", right: 22, bottom: 22, display: "flex", alignItems: "flex-end", gap: 5, height: 64, opacity: 0.9 }}>
      {[0.5, 0.8, 0.4, 1, 0.65, 0.9, 0.55, 0.75].map((h, i) => (
        <div key={i} style={{ width: 6, height: `${h * 100}%`, borderRadius: 3, transformOrigin: "bottom", background: `linear-gradient(180deg, ${T.accentLt}, ${OR(0.4)})`, animation: `abt-bar ${1.4 + i * 0.12}s ease-in-out ${i * 0.08}s infinite` }} />
      ))}
    </div>
  )
}

function StatBento() {
  const t = useT(ABOUT_STR).stats
  const STATS: Stat[] = STATS_ART.map((art, i) => ({ ...art, ...t.items[i] }))
  return (
    <section className="abt-section-pad" style={{ padding: "100px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
          <div>
            <Kicker index="02" text={t.kicker} />
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              {t.title1} <span style={{ color: "#FFFFFF" }}>{t.title2}</span>
            </h2>
          </div>
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.faint, paddingBottom: 6 }}>{t.updated}</span>
        </div>

        <div className="abt-stat-grid">
          {STATS.map((s, i) => <StatCard key={i} s={s} i={i} />)}

          {/* accent statement card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            style={{ position: "relative", overflow: "hidden", borderRadius: 14, padding: "18px 22px", minHeight: 150, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12, border: `1px solid ${LT(0.24)}`, borderTop: `1px solid ${LT(0.4)}`, background: `linear-gradient(135deg, ${AM(0.16)}, ${RD(0.08)} 60%, rgba(255,255,255,0.03))`, boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 40px ${OR(0.12)}, inset 0 1px 0 rgba(255,255,255,0.16)` }}>
            <span style={{ ...MONO_LABEL, fontSize: 9, color: T.accentTx }}>{t.customTag}</span>
            <p style={{ fontFamily: DISPLAY, fontSize: "clamp(16px, 1.7vw, 20px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25, color: T.text, margin: 0, maxWidth: 260 }}>
              {t.customText}
            </p>
            <AccentBars />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §3  APPROACH / PHILOSOPHY
══════════════════════════════════════════════════════════════════════════ */
function PhilosophySection() {
  const t = useT(ABOUT_STR).philosophy
  const PHILOSOPHY = t.items.map((p, i) => ({ n: `0${i + 1}`, ...p }))
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">

        {/* header row */}
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 64, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Kicker index="03" text={t.kicker} />
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(32px, 3.8vw, 56px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              {t.title}
            </h2>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", color: T.faint, paddingBottom: 6 }}>{t.meta}</span>
        </motion.div>

        {/* principle rows — §04 style */}
        {PHILOSOPHY.map((p, i) => {
          const [hov, setHov] = React.useState(false)
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
              onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
              style={{ position: "relative" }}>
              <div style={{ height: 1, background: hov ? LT(0.50) : "rgba(255,255,255,0.09)", transition: "background .3s" }} />
              <div className="abt-approach-row" style={{
                background: "transparent",
                boxShadow: "none",
                transition: "box-shadow .35s",
                position: "relative",
                borderRadius: 2,
              }}>
                {/* brick bottom glow */}
                <span aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${LT(hov ? 0.65 : 0.10)}, transparent 60%)`, transition: "background .4s" }} />

                {/* brick outlined number */}
                <div style={{
                  fontFamily: DISPLAY, fontWeight: 900, fontSize: 72, lineHeight: 1,
                  letterSpacing: "-0.06em", color: "transparent",
                  WebkitTextStroke: `1.5px ${hov ? T.accentLt : LT(0.55)}`,
                  transition: "all .35s", userSelect: "none", paddingTop: 2,
                }}>{p.n}</div>

                {/* label + text */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                    <h3 style={{ fontFamily: DISPLAY, fontSize: "clamp(20px, 2.2vw, 28px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", margin: 0, lineHeight: 1.1 }}>{p.label}</h3>
                    <span aria-hidden style={{ flex: 1, height: 1, maxWidth: 60, background: `linear-gradient(90deg, ${LT(hov ? 0.50 : 0.22)}, transparent)`, transition: "background .3s" }} />
                  </div>
                  <p style={{ ...BODY, color: T.muted, margin: 0 }}>{p.text}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
        <div style={{ height: 1, background: "rgba(255,255,255,0.09)" }} />
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §4  PROCESS — horizontal ruler timeline
══════════════════════════════════════════════════════════════════════════ */
/* Le fasi arrivano da src/data/process.ts: le stesse che finiscono nella
   roadmap in PDF e nella striscia in home. Un solo testo, tre superfici. */
function ProcessCard({ p, i }: { p: Fase; i: number }) {
  const [hover, setHover] = useState(false)
  const SANS = "'Inter', system-ui, sans-serif"
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: i * 0.09, ease }}
      onHoverStart={() => setHover(true)} onHoverEnd={() => setHover(false)}
      animate={{ y: hover ? -3 : 0 }}
      style={{
        position: "relative", width: "100%", height: "100%", borderRadius: 16, overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.09)", boxSizing: "border-box" as const,
      }}
    >
      {/* Glass background — bottom fade mask */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, background: "rgba(255,255,255,0.008)", backdropFilter: "blur(6px) brightness(1.03)", WebkitBackdropFilter: "blur(6px) brightness(1.03)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", maskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", pointerEvents: "none" }} />

      {/* Gradient border — top + sides fade to mid */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, padding: 1, background: "linear-gradient(to bottom, rgba(255,255,255,0.53) 0%, transparent 52%)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" as const, pointerEvents: "none", zIndex: 2 }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 3, width: "100%", height: "100%", padding: "20px 20px 18px", display: "flex", flexDirection: "column", boxSizing: "border-box" as const }}>
        {/* top row — duration chip */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-end", gap: 10, marginBottom: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: MONO, fontSize: 9.5, letterSpacing: ".04em", color: hover ? "#FFFFFF" : "#FFFFFF", border: `1px solid ${hover ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.14)"}`, borderRadius: 6, padding: "3px 8px", transition: "color .3s, border-color .3s", whiteSpace: "nowrap" as const }}>{p.dur}</span>
        </div>

        {/* metric block */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(28px, 3.6vw, 40px)", letterSpacing: "-0.04em", color: T.accentTx, lineHeight: 1 }}>{p.metric}</div>
          <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#FFFFFF", marginTop: 7 }}>{p.metricLabel}</div>
        </div>

        {/* title */}
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16.5, letterSpacing: "-0.018em", lineHeight: 1.25, color: T.text, margin: "0 0 8px" }}>{p.title}</h3>

        {/* body */}
        <p className="hp-body" style={{ fontFamily: SANS, fontSize: "clamp(13px, 1.3vw, 15px)", lineHeight: 1.62, color: T.muted, margin: 0, flex: 1 }}>{p.desc}</p>
      </div>
    </motion.div>
  )
}

function ProcessSection() {
  const t = useT(ABOUT_STR).process
  const { locale } = useLocale()
  const PROCESSO = processo(locale)
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}`, overflow: "hidden" }}>
      <motion.div aria-hidden animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-10%", right: "8%", width: 520, height: 520, borderRadius: "50%", background: `radial-gradient(circle, ${OR(0.12)} 0%, transparent 66%)`, filter: "blur(80px)", pointerEvents: "none" }} />
      <div className="abt-wrap" style={{ position: "relative", zIndex: 1 }}>
        <motion.div style={{ marginBottom: 80, position: "relative", overflow: "hidden" }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>

          {/* background watermark */}
          <div aria-hidden style={{
            position: "absolute", top: -20, right: -20, pointerEvents: "none", userSelect: "none",
            fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(100px, 18vw, 220px)",
            lineHeight: 1, letterSpacing: "-0.05em", whiteSpace: "nowrap",
            color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.04)",
          }}>{t.watermark}</div>

          <Kicker index="04" text={t.kicker} />

          {/* typographic composition */}
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.26em", color: "#FFFFFF", marginBottom: 10, textTransform: "uppercase" as const }}>{t.over}</div>

            {/* outlined */}
            <motion.div
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(50px, 8.5vw, 116px)", lineHeight: 0.88, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.58)", userSelect: "none" }}>
              {t.lineOutlined}
            </motion.div>

            {/* solid */}
            <motion.div
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.18, ease }}
              style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(50px, 8.5vw, 116px)", lineHeight: 0.88, letterSpacing: "-0.05em", color: "#FFFFFF", userSelect: "none" }}>
              {t.lineSolid}
            </motion.div>

            {/* "parte da qui" light */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.30, ease }}
              style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(20px, 2.4vw, 34px)", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              {t.lineLight}
              <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} style={{ fontSize: 22, color: "#FFFFFF" }}>→</motion.span>
            </motion.div>

            {/* attributes row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.42, ease }}
              style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.16)" }}>
              {t.attributes.map((w, i) => (
                <React.Fragment key={w}>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: i === 2 ? "#FFFFFF" : "#FFFFFF" }}>{w}</span>
                  {i < 2 && <span aria-hidden style={{ margin: "0 22px", width: 1, height: 12, background: "rgba(255,255,255,0.15)", display: "inline-block" }} />}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* 2×2 card grid */}
        <div className="abt-process-cards">
          {PROCESSO.map((p, i) => <ProcessCard key={p.n} p={p} i={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §5  TECH TOOLKIT — bento grid with spotlight borders
══════════════════════════════════════════════════════════════════════════ */
type ToolkitGroup = { num: string; title: string; items: string[] }

const TOOLKIT_SLUGS = ["design_thinking", "ecommerce_eng", "web_mobile_ai", "acquisition_growth"]

function ToolkitPanel({ data, i }: { data: ToolkitGroup; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const [hov, setHov] = useState(false)
  const slug = TOOLKIT_SLUGS[i]
  const cmd = `cat ${slug}.json`

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: i * 0.08, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      animate={{ y: hov ? -5 : 0 }}
      style={{
        borderRadius: 16, overflow: "hidden",
        background: hov ? "rgba(0,0,0,0.20)" : "rgba(0,0,0,0.10)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        border: `1px solid rgba(255,255,255,${hov ? 0.13 : 0.07})`,
        boxShadow: hov
          ? "0 24px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 8px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.04)",
        fontFamily: MONO, display: "flex", flexDirection: "column",
        transition: "background .3s, border-color .3s, box-shadow .35s",
      }}>

      {/* title bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 16px 11px", borderBottom: `1px solid rgba(255,255,255,${hov ? 0.09 : 0.05})`, background: "rgba(255,255,255,0.025)", flexShrink: 0 }}>
        {["#FF5F57","#FEBC2E","#10B981"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: hov ? 0.88 : 0.52, transition: "opacity .3s" }} />
        ))}
        <span style={{ marginLeft: "auto", fontSize: 9.5, letterSpacing: "0.14em", color: "#FFFFFF", textTransform: "uppercase" as const }}>
          {data.num} -- {slug}
        </span>
      </div>

      {/* terminal body */}
      <div style={{ padding: "16px 18px 20px", flex: 1, fontSize: 12.5, lineHeight: 1.85 }}>
        {/* command line */}
        <div style={{ marginBottom: 10 }}>
          <span style={{ color: "#FFFFFF" }}>$ </span>
          <span style={{ color: "#FFFFFF" }}>{cmd}</span>
        </div>
        {/* output — category title */}
        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.25, delay: 0.1 + i * 0.05 }}
          style={{ color: hov ? T.accentTx : TX(0.70), fontWeight: 500, marginBottom: 10, transition: "color .3s" }}>
          {data.title}
        </motion.div>
        {/* skills */}
        {data.items.map((item, ii) => (
          <motion.div key={item}
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.22, delay: 0.18 + i * 0.05 + ii * 0.07 }}
            style={{ color: "#FFFFFF", paddingLeft: 16, lineHeight: 1.75, fontSize: 12 }}>
            {item}
          </motion.div>
        ))}
        {/* blinking cursor after last item */}
        {inView && <span className="abt-caret" style={{ marginLeft: 16 }} />}
      </div>

      {/* footer */}
      <div style={{ padding: "10px 18px 12px", borderTop: `1px solid rgba(255,255,255,${hov ? 0.08 : 0.04})`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.015)", flexShrink: 0 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.12em", color: hov ? T.accentTx : TX(0.50), transition: "color .3s" }}>{data.num}</span>
        <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#FFFFFF" }}>{data.items.length} capabilities</span>
      </div>
    </motion.div>
  )
}

function ToolkitSection() {
  const t = useT(ABOUT_STR).toolkit
  const TOOLKIT: ToolkitGroup[] = t.groups.map((g, i) => ({ num: `0${i + 1}`, ...g }))
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 64 }}>
          <div>
            <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
              <Kicker index="05" text={t.kicker} />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.08, ease }}
              style={{ fontFamily: DISPLAY, fontSize: "clamp(30px, 4vw, 60px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              {t.title}
            </motion.h2>
          </div>
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", color: T.faint, paddingBottom: 6 }}>
            {t.meta}
          </motion.span>
        </div>

        <div className="abt-process-cards">
          {TOOLKIT.map((data, i) => <ToolkitPanel key={i} data={data} i={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §7  FAQs
══════════════════════════════════════════════════════════════════════════ */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.50, delay: index * 0.06, ease }}
      style={{ position: "relative" }}>

      {/* top rule */}
      <div style={{ height: 1, background: open ? LT(0.45) : "rgba(255,255,255,0.09)", transition: "background .3s" }} />

      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 32, padding: "24px 0", background: "none", border: "none", cursor: "pointer",
          color: T.text, textAlign: "left" as const, fontFamily: "inherit",
        }}>
        {/* brick accent dot when open */}
        <span aria-hidden style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", marginTop: 7, background: open ? T.accentLt : "rgba(255,255,255,0.20)", transition: "background .3s" }} />
        <span style={{ flex: 1, fontSize: "clamp(14px, 1.2vw, 16px)", fontWeight: 500, lineHeight: 1.45, letterSpacing: "-0.01em", color: open ? "#FFFFFF" : T.muted, transition: "color .3s" }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.28, ease }}
          style={{ flexShrink: 0, marginTop: 4, fontSize: 20, lineHeight: 1, color: open ? T.accentTx : "#FFFFFF", transition: "color .3s" }}>
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.36, ease }}
            style={{ overflow: "hidden" }}>
            <p style={{ ...BODY, color: T.muted, margin: 0, paddingLeft: 38, paddingBottom: 24 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQSection() {
  const t = useT(ABOUT_STR).faq
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div className="abt-faq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 80px", alignItems: "start" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}
            className="abt-faq-sticky" style={{ position: "sticky", top: 100 }}>
            <Kicker index="06" text={t.kicker} />
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              {t.title1}<br /><span style={{ color: "#FFFFFF" }}>{t.title2}</span>
            </h2>
            <p style={{ ...BODY, color: T.muted, marginTop: 20, maxWidth: 240 }}>
              {t.lead}
            </p>
          </motion.div>
          <div>
            {t.items.map((faq, i) => <FAQItem key={i} {...faq} index={i} />)}
            <div style={{ height: 1, background: "rgba(255,255,255,0.09)" }} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   CONTACT FORM COMPONENTS
══════════════════════════════════════════════════════════════════════════ */
function GlassInput({ label, placeholder, type = "text", value, onChange }: {
  label: string; placeholder: string; type?: string; value: string; onChange: (v: string) => void
}) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: f ? T.accentTx : T.faint, marginBottom: 8, transition: "color 0.2s" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setF(true)} onBlur={() => setF(false)} required
        style={{ width: "100%", padding: "13px 16px", background: f ? AM(0.08) : "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${f ? LT(0.55) : "rgba(255,255,255,0.11)"}`, borderRadius: 12, color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit", boxShadow: f ? `0 0 0 3px ${AM(0.12)}, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s" }} />
    </div>
  )
}

function GlassTextarea({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: f ? T.accentTx : T.faint, marginBottom: 8, transition: "color 0.2s" }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
        onFocus={() => setF(true)} onBlur={() => setF(false)} required
        style={{ width: "100%", padding: "13px 16px", background: f ? AM(0.08) : "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${f ? LT(0.55) : "rgba(255,255,255,0.11)"}`, borderRadius: 12, color: T.text, fontSize: 14, outline: "none", resize: "none" as const, fontFamily: "inherit", boxSizing: "border-box" as const, boxShadow: f ? `0 0 0 3px ${AM(0.12)}, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s" }} />
    </div>
  )
}

function GlassSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [f, setF] = useState(false)
  const t = useT(ABOUT_STR).modal
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: f ? T.accentTx : T.faint, marginBottom: 8, transition: "color 0.2s" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)} required
        style={{ width: "100%", padding: "13px 16px", background: f ? AM(0.08) : "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${f ? LT(0.55) : "rgba(255,255,255,0.11)"}`, borderRadius: 12, color: value ? T.text : T.faint, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit", appearance: "none" as const, cursor: "pointer", boxShadow: f ? `0 0 0 3px ${AM(0.12)}, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s" }}>
        <option value="" disabled style={{ background: "#141010", color: T.muted }}>{t.areaPlaceholder}</option>
        {t.areas.map(o => <option key={o} value={o} style={{ background: "#141010", color: T.text }}>{o}</option>)}
      </select>
    </div>
  )
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const t = useT(ABOUT_STR).modal
  const [fields, setFields] = useState({ name: "", email: "", site: "", area: "", msg: "" })
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const set = (k: keyof typeof fields) => (v: string) => setFields(f => ({ ...f, [k]: v }))
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [onClose])

  return (
    <motion.div ref={overlayRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.26 }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "16px", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" } as React.CSSProperties}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 28 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 16 }} transition={{ duration: 0.38, ease }}
        style={{ width: "100%", maxWidth: 600, marginTop: "auto", marginBottom: "auto", flexShrink: 0, position: "relative", borderRadius: 20, background: "rgba(13,18,30,0.94)", backdropFilter: "blur(72px) brightness(0.92) saturate(1.10)", WebkitBackdropFilter: "blur(72px) brightness(0.92) saturate(1.10)", border: "1px solid rgba(255,255,255,0.20)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.08), 0 40px 100px rgba(0,0,0,0.65)", overflow: "hidden" } as React.CSSProperties}>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${OR(1)} 28%, ${T.accentLt} 72%, transparent)`, borderRadius: "24px 24px 0 0" }} />
        <div className="contact-modal-content" style={{ padding: "30px 34px 34px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 26 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <PingDot color={T.accentLt} size={6} />
                <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: T.accentTx }}>{t.kicker}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", color: T.text, margin: 0, lineHeight: 1.22 }}>{t.title}</h3>
            </div>
            <motion.button onClick={onClose} whileHover={{ scale: 1.10, background: "rgba(255,255,255,0.10)" }} whileTap={{ scale: 0.92 }}
              style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,0.20)", background: "rgba(255,255,255,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, transition: "background 0.18s" }}>
              <XIcon size={13} />
            </motion.button>
          </div>
          {!sent ? (
            <form onSubmit={async e => {
                e.preventDefault()
                if (busy) return
                setBusy(true); setFailed(false)
                const ok = await sendContact({
                  name: fields.name, email: fields.email,
                  message: withExtras(fields.msg, { [t.extraSite]: fields.site, [t.extraArea]: fields.area }),
                })
                setBusy(false)
                if (ok) setSent(true); else setFailed(true)
              }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="contact-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <GlassInput label={t.name} placeholder={t.namePlaceholder} value={fields.name} onChange={set("name")} />
                <GlassInput label={t.email} placeholder={t.emailPlaceholder} type="email" value={fields.email} onChange={set("email")} />
              </div>
              <GlassInput label={t.site} placeholder={t.sitePlaceholder} value={fields.site} onChange={set("site")} />
              <GlassSelect label={t.area} value={fields.area} onChange={set("area")} />
              <GlassTextarea label={t.message} placeholder={t.messagePlaceholder} value={fields.msg} onChange={set("msg")} />
              {failed && (
                <p role="alert" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", lineHeight: 1.6, color: "rgba(255,120,120,0.95)", margin: 0 }}>
                  {t.failed.replace("{email}", CONTACT.email)}
                </p>
              )}
              <motion.button type="submit" disabled={busy} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 380, damping: 18 }}
                style={{ marginTop: 4, width: "100%", padding: 0, borderRadius: 12, cursor: "pointer", border: "1px solid rgba(184,50,64,0.80)", background: "linear-gradient(90deg, rgba(184,50,64,0.34) 0%, rgba(184,50,64,0.20) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0 12px rgba(184,50,64,0.20), inset 0 1px 0 rgba(255,255,255,0.12)", display: "flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO }}>
                <span style={{ padding: "14px 14px 14px 18px", borderRight: "1px solid rgba(184,50,64,0.45)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "#FFFFFF" }}>[→]</span>
                <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#FFFFFF", padding: "14px 0" }}>{t.submit}</span>
              </motion.button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "36px 0" }}>
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.08 }}
                style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: 26, color: T.green }}>
                ✓
              </motion.div>
              <h4 style={{ fontSize: 19, fontWeight: 700, color: T.green, marginBottom: 10 }}>{t.sentTitle}</h4>
              <p className="hp-body" style={{ fontSize: 14, color: T.muted, lineHeight: 1.8, margin: 0 }}>{t.sentBody}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SITE FOOTER — identical to main page
══════════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════════
   §8  FINAL CTA
══════════════════════════════════════════════════════════════════════════ */
function FinalCTA({ onOpenModal }: { onOpenModal: () => void }) {
  const t = useT(ABOUT_STR).cta
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", fn, { passive: true })
    return () => window.removeEventListener("resize", fn)
  }, [])
  return (
    <section style={{ position: "relative", borderTop: `1px solid ${T.border}`, overflow: "hidden" }}>
      <motion.div aria-hidden animate={{ scale: [1, 1.15, 0.92, 1.1, 1], opacity: [0.6, 0.95, 0.45, 0.8, 0.6] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 760, height: 760, borderRadius: "50%", background: `radial-gradient(circle, ${OR(0.16)} 0%, ${RD(0.08)} 40%, transparent 66%)`, filter: "blur(90px)", pointerEvents: "none" }} />

      <div className="abt-wrap abt-cta-section" style={{ paddingTop: isMobile ? 150 : 120, paddingBottom: isMobile ? 200 : 60, position: "relative", zIndex: 1, textAlign: "center" }}>
        <motion.h2 className="abt-cta-h2" initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.90, ease }}
          style={{ fontFamily: DISPLAY, fontSize: "clamp(44px, 7vw, 100px)", fontWeight: 900, lineHeight: 0.94, letterSpacing: "-0.045em", color: T.text, margin: "0 auto 52px", maxWidth: 920 }}>
          {t.title1}<br /><span style={{ color: "#FFFFFF" }}>{t.title2}</span>
        </motion.h2>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.70, delay: 0.18, ease }}
          style={{ display: "flex", justifyContent: "center" }}>
          <PillCTA label={t.button} onClick={onOpenModal} />
        </motion.div>
      </div>
    </section>
  )
}


/* ══════════════════════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════════════════════ */
export default function NadiaMaarAbout() {
  const [modalOpen, setModalOpen] = useState(false)

  usePointerGlow()

  return (
    <div style={{
      background: T.bg, color: T.text,
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      overflowX: "clip", minHeight: "100vh", position: "relative",
    }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <Background />
      <ScrollProgress />
      <CursorRing />
      <FloatingContact />
      <Header />
      <AnimatePresence>{modalOpen && <ContactModal onClose={() => setModalOpen(false)} />}</AnimatePresence>
      <div style={{ position: "relative", zIndex: 1 }}>
        <HeroSection />
        <MarqueeStrip />
        <StatBento />
        {/* L'approccio raccontato due volte: la filosofia qui, il manifesto
            «un solo partner» che stava in home. Ora sono vicini e si leggono
            come un discorso solo. */}
        <PhilosophySection />
        <StudioApproach />
        <ProcessSection />
        {/* Stesso ragionamento: le capacità e il perché tecnico erano su due
            pagine diverse. */}
        <ToolkitSection />
        <StudioCapabilities />
        <FAQSection />
        {/* moved here from the homepage — last content block before the CTA */}
        <FoundryShowcase />
        <FinalCTA onOpenModal={() => setModalOpen(true)} />
      </div>
      <Footer onContact={() => setModalOpen(true)} />
    </div>
  )
}
