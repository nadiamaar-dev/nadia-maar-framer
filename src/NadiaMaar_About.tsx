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
  useInView,
} from "framer-motion"

/* ══════════════════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════════════════ */
const XIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const ArrowUpRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </svg>
)
const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
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
   DESIGN TOKENS — Obsidian + solar orange / copper aurora
══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#080604",
  surface:   "#141010",
  border:    "rgba(255,255,255,0.08)",
  text:      "#FFFFFF",
  muted:     "rgba(255,255,255,0.60)",
  faint:     "rgba(255,255,255,0.30)",
  titanium:  "rgba(242,236,228,0.86)",
  accent:    "#F5852A",   // copper-amber
  accentGlo: "rgba(245,133,42,0.28)",
  accentLt:  "#FFB25C",   // light amber
  accentTx:  "rgba(255,206,160,0.92)",
  green:     "#34d399",
} as const

// warm rgba helpers
const AM = (a: number) => `rgba(245,133,42,${a})`   // copper-amber
const LT = (a: number) => `rgba(255,178,92,${a})`   // light amber
const OR = (a: number) => `rgba(255,106,0,${a})`    // bright orange
const RD = (a: number) => `rgba(255,55,0,${a})`     // solar red

// white -> amber gradient text fill
const gradText = (deg = 180): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${deg}deg, #FFFFFF 0%, #FFD6AC 50%, #F5852A 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
})

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/*+<>{}[]"

const G = {
  bg:     "rgba(255,255,255,0.045)",
  bgHov:  "rgba(255,255,255,0.085)",
  bd:     "rgba(255,255,255,0.14)",
  bdHov:  "rgba(255,255,255,0.30)",
  blur:   "blur(28px) saturate(1.7)",
  shadow: "0 8px 32px 0 rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.22)",
  shadowHov: "0 18px 56px 0 rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.30)",
} as const

const MONO_LABEL: React.CSSProperties = {
  fontFamily: MONO, letterSpacing: "0.20em",
  textTransform: "uppercase", fontSize: 10.5, fontWeight: 500,
}

/* ══════════════════════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; scroll-behavior: smooth; }
  p, li { font-weight: 300; line-height: 1.8; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #050403; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  :root { --x:-9999; --y:-9999; --xp:0; --yp:0; }

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

  /* ── next-gen background layers ───────────────────────────── */
  @keyframes abt-spin      { to { transform: rotate(360deg); } }
  @keyframes abt-spin-rev  { to { transform: rotate(-360deg); } }
  @keyframes abt-breathe   { 0%,100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.06); } }
  @keyframes abt-beam      { 0%,100% { opacity: 0.12; } 50% { opacity: 0.34; } }

  /* rotating conic aurora */
  .abt-conic { position: absolute; top: 50%; left: 50%; width: 160vmax; height: 160vmax;
    transform: translate(-50%,-50%); border-radius: 50%; will-change: transform;
    background: conic-gradient(from 0deg at 50% 50%,
      ${OR(0.10)} 0deg, ${RD(0.05)} 60deg, ${AM(0.11)} 130deg, rgba(120,40,0,0.03) 200deg,
      ${OR(0.08)} 270deg, ${RD(0.05)} 330deg, ${OR(0.10)} 360deg);
    filter: blur(120px); animation: abt-spin 46s linear infinite; opacity: 0.85; }

  /* dot-matrix grid with radial mask */
  .abt-dots { position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1.4px);
    background-size: 26px 26px;
    -webkit-mask-image: radial-gradient(ellipse 82% 72% at 50% 38%, #000 28%, transparent 80%);
    mask-image: radial-gradient(ellipse 82% 72% at 50% 38%, #000 28%, transparent 80%); }

  /* thin sun-ray beams from top */
  .abt-beams { position: absolute; top: -30%; left: 50%; width: 140vmax; height: 140vmax;
    transform: translateX(-50%); will-change: transform; animation: abt-spin-rev 90s linear infinite;
    background: repeating-conic-gradient(from 0deg at 50% 50%,
      transparent 0deg, ${OR(0.05)} 2deg, transparent 5deg, transparent 20deg);
    -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 60%);
    mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 60%);
    animation: abt-spin-rev 90s linear infinite, abt-beam 12s ease-in-out infinite; }

  /* interactive spotlight that follows the cursor */
  .abt-spotlight { position: fixed; inset: 0; z-index: 0; pointer-events: none; mix-blend-mode: screen;
    background: radial-gradient(560px circle at calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      ${OR(0.11)} 0%, ${RD(0.05)} 32%, transparent 62%); }

  @media (prefers-reduced-motion: reduce) {
    .abt-conic, .abt-beams { animation: none !important; }
  }

  .abt-wrap { max-width: 1160px; margin: 0 auto; padding: 0 40px; }

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
    border: 1px solid ${OR(0.6)}; pointer-events: none; z-index: 600; mix-blend-mode: screen;
    transform: translate(calc(var(--x) * 1px - 15px), calc(var(--y) * 1px - 15px));
    transition: transform 0.12s ease-out, width 0.2s, height 0.2s, opacity 0.2s; }

  @media (max-width: 1024px) {
    .abt-hero-grid { grid-template-columns: 1fr !important; }
    .abt-hero-right { display: none !important; }
    .abt-cursor-ring { display: none !important; }
  }
  @media (max-width: 900px) {
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

/** Magnetic wrapper — element gently follows the cursor. */
function Magnetic({ children, strength = 0.32 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    setPos({ x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength })
  }
  return (
    <motion.div
      ref={ref} onMouseMove={onMove} onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.4 }}
      style={{ display: "inline-flex" }}
    >
      {children}
    </motion.div>
  )
}

/** Solid orange pill CTA with a white circular arrow badge. */
function PillCTA({ label, href, onClick, target }: { label: string; href?: string; onClick?: () => void; target?: string }) {
  const [h, setH] = useState(false)
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 16,
    padding: "7px 8px 7px 26px", borderRadius: 9999, cursor: "pointer",
    border: "none", textDecoration: "none",
    background: "linear-gradient(100deg, #FF6A00 0%, #F5852A 100%)",
    boxShadow: h ? `0 14px 44px ${OR(0.42)}, inset 0 1px 0 rgba(255,255,255,0.3)` : `0 6px 26px ${OR(0.30)}, inset 0 1px 0 rgba(255,255,255,0.25)`,
    transition: "box-shadow 0.3s",
  }
  const inner = (
    <>
      <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em", color: "#1c0d02" }}>{label}</span>
      <span style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#1c0d02", flexShrink: 0 }}>
        <motion.span animate={{ x: h ? 3 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
          <ArrowRight size={17} />
        </motion.span>
      </span>
    </>
  )
  return (
    <Magnetic strength={0.4}>
      {href ? (
        <motion.a href={href} target={target} rel={target ? "noopener noreferrer" : undefined}
          onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)} whileTap={{ scale: 0.97 }} style={base}>
          {inner}
        </motion.a>
      ) : (
        <motion.button onClick={onClick}
          onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)} whileTap={{ scale: 0.97 }} style={base}>
          {inner}
        </motion.button>
      )}
    </Magnetic>
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
   AURORA BACKGROUND
══════════════════════════════════════════════════════════════════════════ */
function NoiseGrain({ alpha = 13 }: { alpha?: number }) {
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

function AuroraBackground() {
  return (
    <>
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        {/* rotating conic aurora — living warm hue sweep */}
        <div className="abt-conic" />

        {/* thin rotating sun-ray beams */}
        <div className="abt-beams" />

        {/* drifting warm blooms for organic depth */}
        <motion.div animate={{ x: [0, 80, -40, 60, 0], y: [0, -50, 60, -30, 0], scale: [1, 1.12, 0.94, 1.06, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "-18%", right: "-8%", width: 780, height: 780, borderRadius: "50%", background: `radial-gradient(circle, ${OR(0.18)} 0%, ${RD(0.09)} 42%, transparent 70%)`, filter: "blur(100px)", willChange: "transform" }}
        />
        <motion.div animate={{ x: [0, -70, 50, -60, 0], y: [0, 70, -50, 50, 0] }}
          transition={{ duration: 34, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          style={{ position: "absolute", top: "38%", left: "-12%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${AM(0.12)} 0%, transparent 66%)`, filter: "blur(96px)", willChange: "transform" }}
        />

        {/* dot-matrix grid with radial fade */}
        <div className="abt-dots" />

        {/* top glow + vignette to protect text contrast */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle 780px at 78% -6%, ${OR(0.09)}, transparent 58%)` }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 112% 88% at 50% 46%, transparent 22%, rgba(4,3,2,0.92) 100%)" }} />

        <NoiseGrain alpha={12} />
      </div>

      {/* interactive cursor spotlight (own layer, follows --x/--y) */}
      <div aria-hidden className="abt-spotlight" />
    </>
  )
}

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
        background: `linear-gradient(90deg, ${RD(1)}, ${T.accent}, ${T.accentLt})`,
        boxShadow: `0 0 12px ${OR(0.7)}`,
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
function Logo3D({ onClick }: { onClick: () => void }) {
  const [h, setH] = useState(false)
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}
    >
      <span style={{
        fontFamily: DISPLAY, fontSize: 12, fontWeight: 700,
        letterSpacing: "0.22em", textTransform: "uppercase" as const,
        color: h ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.60)",
        transition: "color 0.28s", whiteSpace: "nowrap" as const,
      }}>Nadia Maar</span>
    </motion.button>
  )
}

function MenuNavItem({ num, label, onClick, index }: { num: string; label: string; onClick: () => void; index: number }) {
  const [h, setH] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.07, duration: 0.52, ease }}>
      <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ background: "none", border: "none", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", gap: 20, padding: "16px 0", borderBottom: `1px solid ${h ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)"}`, transition: "border-color 0.22s", textAlign: "left" as const }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.20em", color: h ? T.accentLt : "rgba(255,255,255,0.22)", transition: "color 0.22s", minWidth: 28 }}>{num}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: "clamp(30px, 10vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: h ? "#fff" : "rgba(255,255,255,0.72)", transition: "color 0.24s" }}>{label}</span>
        <motion.span animate={{ x: h ? 8 : 0, opacity: h ? 1 : 0 }} transition={{ duration: 0.20 }} style={{ marginLeft: "auto", color: T.accentLt, fontSize: 22, lineHeight: 1 }}>→</motion.span>
      </button>
    </motion.div>
  )
}

function DesktopMenuNavItem({ num, label, onClick, index }: { num: string; label: string; onClick: () => void; index: number }) {
  const [h, setH] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + index * 0.07, duration: 0.48, ease }}>
      <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ background: "none", border: "none", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", gap: 18, padding: "14px 0", borderBottom: `1px solid ${h ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)"}`, transition: "border-color 0.22s", textAlign: "left" as const }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.20em", color: h ? T.accentLt : "rgba(255,255,255,0.22)", transition: "color 0.22s", minWidth: 24 }}>{num}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, color: h ? "#fff" : "rgba(255,255,255,0.68)", transition: "color 0.24s" }}>{label}</span>
        <motion.span animate={{ x: h ? 6 : 0, opacity: h ? 1 : 0 }} transition={{ duration: 0.18 }} style={{ marginLeft: "auto", color: T.accentLt, fontSize: 18, lineHeight: 1 }}>→</motion.span>
      </button>
    </motion.div>
  )
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth <= 800 : false)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 800)
    window.addEventListener("resize", onResize)
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("resize", onResize); document.body.style.overflow = ""; document.removeEventListener("keydown", onKey) }
  }, [onClose])

  const NAV = [
    { num: "01", label: "Home",     action: () => { window.location.href = "/" } },
    { num: "02", label: "About Me", action: onClose },
    { num: "03", label: "Contatti", action: () => { window.location.href = "/#s9" } },
  ]
  const SOCIALS = [
    { label: "GitHub",    href: "https://github.com/nadiamaar-dev" },
    { label: "Instagram", href: "https://instagram.com/nadiamaar.dev" },
    { label: "LinkedIn",  href: "https://linkedin.com/in/nadiamaar" },
  ]
  const footer = (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.45, ease }}
      style={{ padding: "24px 0 36px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <a href="mailto:nadiamaar.dev@gmail.com"
          style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.18s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
          nadiamaar.dev@gmail.com
        </a>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.10em", color: "rgba(255,255,255,0.22)" }}>Remote · Europa</span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {SOCIALS.map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.28)", textDecoration: "none", transition: "color 0.18s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}>
            {label}
          </a>
        ))}
      </div>
    </motion.div>
  )

  if (isMobile) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.38, ease }}
        style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(9,6,3,0.97)", backdropFilter: "blur(40px) saturate(1.8)", WebkitBackdropFilter: "blur(40px) saturate(1.8)", display: "flex", flexDirection: "column", padding: "0 28px" } as React.CSSProperties}>
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "flex-end", flexShrink: 0 }}>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.10)" }} whileTap={{ scale: 0.90 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.65)" }}>
            <XIcon size={14} />
          </motion.button>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${OR(0.55)}, ${LT(0.35)}, transparent)`, flexShrink: 0 }} />
        <div aria-hidden style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${OR(0.12)} 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0, position: "relative" }}>
          {NAV.map((item, i) => <MenuNavItem key={item.label} num={item.num} label={item.label} onClick={item.action} index={i} />)}
        </div>
        {footer}
      </motion.div>
    )
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 299 }} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 38 }}
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, zIndex: 300, background: "rgba(11,7,3,0.97)", backdropFilter: "blur(48px) saturate(1.8)", WebkitBackdropFilter: "blur(48px) saturate(1.8)", borderLeft: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", padding: "0 40px" } as React.CSSProperties}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${OR(0.55)}, ${LT(0.35)}, transparent)`, flexShrink: 0 }} />
        <div style={{ height: 64, flexShrink: 0 }} />
        <div aria-hidden style={{ position: "absolute", bottom: "20%", right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${OR(0.14)} 0%, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0, position: "relative" }}>
          {NAV.map((item, i) => <DesktopMenuNavItem key={item.label} num={item.num} label={item.label} onClick={item.action} index={i} />)}
        </div>
        {footer}
      </motion.div>
    </>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return (
    <>
      <motion.header initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 400, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", backdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none", WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none", background: scrolled ? "rgba(7,5,3,0.72)" : "transparent", borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`, transition: "background 0.4s, border-color 0.4s" } as React.CSSProperties}>
        <Logo3D onClick={() => { window.location.href = "/" }} />
        <motion.button onClick={() => setMenuOpen(o => !o)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }} aria-label="Menu"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", display: "flex", flexDirection: "column", gap: 5, zIndex: 401, flexShrink: 0 }}>
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} transition={{ duration: 0.26 }} style={{ display: "block", width: 22, height: 1.8, background: menuOpen ? "#fff" : "rgba(255,255,255,0.80)", borderRadius: 2, transformOrigin: "center" }} />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1, width: menuOpen ? 0 : 14 }} transition={{ duration: 0.18 }} style={{ display: "block", width: 14, height: 1.8, background: "rgba(255,255,255,0.80)", borderRadius: 2 }} />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} transition={{ duration: 0.26 }} style={{ display: "block", width: 22, height: 1.8, background: menuOpen ? "#fff" : "rgba(255,255,255,0.80)", borderRadius: 2, transformOrigin: "center" }} />
        </motion.button>
      </motion.header>
      <AnimatePresence>{menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}</AnimatePresence>
    </>
  )
}

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
      background: "rgba(0,0,0,0.34)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontFamily: MONO, fontSize: 12, lineHeight: 1.95,
      boxShadow: "0 8px 32px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.05)",
      minHeight: 190,
    }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
        <span style={{ marginLeft: "auto", fontSize: 9.5, letterSpacing: "0.14em", color: "rgba(255,255,255,0.24)", textTransform: "uppercase" as const }}>zsh — nadia@dev</span>
      </div>
      {TERMINAL_LINES.map((ln, i) => {
        if (i > lineIdx) return null
        const full = ln.p + ln.t
        const shown = i < lineIdx ? full : full.slice(0, charIdx)
        return (
          <div key={i} style={{ whiteSpace: "pre-wrap" }}>
            <span style={{ color: ln.p === "$" ? "rgba(255,255,255,0.30)" : ln.c }}>{shown.slice(0, 1)}</span>
            <span style={{ color: ln.p === "$" ? "rgba(255,255,255,0.85)" : ln.c }}>{shown.slice(1)}</span>
            {i === lineIdx && <span className="abt-caret" />}
          </div>
        )
      })}
    </div>
  )
}

function HeroSection() {
  return (
    <section style={{ minHeight: "100svh", display: "flex", alignItems: "flex-start", position: "relative", overflow: "clip", paddingTop: 64 }}>
      <div className="abt-wrap abt-hero-inner" style={{ position: "relative", zIndex: 1, paddingTop: 40, paddingBottom: 64, width: "100%" }}>

        {/* editorial corner row */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 40 }}>
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.accentTx }}>Nadia Maar® — Digital Studio</span>
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.faint }}>About / 01</span>
        </motion.div>

        <div className="abt-hero-grid">
          {/* LEFT */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
              <ChipLabel text="Architecture & Code" />
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
              <ScrambleLine text="DIGITAL" delay={280} /><br />
              <ScrambleLine text="ARCHITECT" delay={430} style={gradText(96)} /><br />
              <ScrambleLine text="&" delay={560} style={{ color: "rgba(255,255,255,0.24)", fontWeight: 300 }} />{" "}
              <ScrambleLine text="E-COM" delay={620} style={{ color: T.titanium }} /><br />
              <ScrambleLine text="DEVELOPER" delay={760} style={gradText(96)} />
            </motion.h1>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.22, ease }}
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
              <PingDot color={T.green} size={7} />
              <span style={{ ...MONO_LABEL, fontSize: 11, color: T.muted, letterSpacing: "0.26em" }}>
                BASED IN ITALY&nbsp;/&nbsp;AVAILABLE WORLDWIDE
              </span>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.80, delay: 0.30, ease }}
              style={{ fontSize: "clamp(15px, 1.4vw, 18px)", color: T.muted, fontWeight: 300, maxWidth: 540, lineHeight: 1.86, margin: "0 0 44px" }}>
              Costruisco ecosistemi digitali che vendono. Un solo punto di contatto dalla
              strategia al codice di produzione: design premium, sviluppo frontend solido,
              SEO e advertising — cuciti insieme in un unico flusso, guidato dalla logica
              e privo di compromessi.
            </motion.p>

            <motion.div className="abt-hero-actions" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.70, delay: 0.40, ease }}
              style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <PillCTA label="Lavoriamo insieme" href="mailto:nadiamaar.dev@gmail.com" />
              <Magnetic>
                <motion.a href="#" target="_blank" rel="noopener noreferrer"
                  whileHover={{ color: T.text }} transition={{ duration: 0.20 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 9, color: T.muted, textDecoration: "none", ...MONO_LABEL }}>
                  VIEW CV <ArrowUpRight size={12} />
                </motion.a>
              </Magnetic>
            </motion.div>
          </div>

          {/* RIGHT — frosted glass tablet + terminal */}
          <motion.div className="abt-hero-right" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.90, delay: 0.30, ease }}
            style={{ position: "relative" }}>
            {/* glow behind card */}
            <div aria-hidden style={{ position: "absolute", inset: "-30px -20px", borderRadius: 28, background: `radial-gradient(circle at 70% 30%, ${OR(0.28)}, ${RD(0.12)} 45%, transparent 72%)`, filter: "blur(38px)", zIndex: -1 }} />

            <div style={{
              borderRadius: 22, padding: "28px 28px 24px",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(40px) saturate(1.7)", WebkitBackdropFilter: "blur(40px) saturate(1.7)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderTop: "1px solid rgba(255,255,255,0.30)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <span style={{ ...MONO_LABEL, fontSize: 9.5, color: T.faint }}>IDENTITY</span>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <PingDot color={T.green} size={6} />
                  <span style={{ ...MONO_LABEL, fontSize: 9.5, color: T.green }}>AVAILABLE</span>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: T.text, marginBottom: 4 }}>Nadia Maar</div>
                <div style={{ ...MONO_LABEL, fontSize: 9.5, color: T.accentLt }}>Digital Architect · E-Commerce Dev</div>
              </div>
              <div style={{ height: 1, background: T.border, margin: "0 0 20px" }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {["React / Next.js", "Shopify Custom", "AI Automation", "SEO & Ads", "UI/UX Design"].map(tag => (
                  <span key={tag} style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 500, background: AM(0.12), border: `1px solid ${LT(0.26)}`, color: T.accentTx, letterSpacing: "0.04em" }}>{tag}</span>
                ))}
              </div>
              <div style={{ height: 1, background: T.border, margin: "0 0 20px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: T.faint }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <span style={{ ...MONO_LABEL, fontSize: 9.5, color: T.faint }}>Italy · Remote Worldwide</span>
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
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 22, padding: "0 22px" }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: i % 2 ? T.accentTx : "rgba(255,255,255,0.42)" }}>{it}</span>
          <span style={{ color: T.accent, fontSize: 8 }}>◆</span>
        </span>
      ))}
    </span>
  )
  return (
    <div className="abt-marquee" style={{ position: "relative", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, overflow: "hidden", padding: "18px 0", background: "rgba(0,0,0,0.22)" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 120, background: `linear-gradient(90deg, ${T.bg}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 120, background: `linear-gradient(270deg, ${T.bg}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
      {row}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §2  STAT BENTO — giant gradient numerals + accent statement card
══════════════════════════════════════════════════════════════════════════ */
//PLACEHOLDER metrics
const STATS = [
  { n: 5,   pad: 2, suffix: "+",  sub: "Anni a costruire prodotti digitali" },
  { n: 50,  pad: 0, suffix: "+",  sub: "Progetti spediti in produzione" },
  { n: 30,  pad: 0, suffix: "k+", sub: "Prodotti e-commerce sincronizzati" },
]

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

function StatCard({ s, i }: { s: typeof STATS[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const val = useCountUp(s.n, inView)
  const display = (s.pad ? String(val).padStart(s.pad, "0") : String(val)) + s.suffix
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.08, ease }}
      style={{ borderRadius: 20, padding: "30px 28px", background: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.bd}`, borderTop: "1px solid rgba(255,255,255,0.24)", boxShadow: G.shadow }}>
      <div style={{ fontFamily: DISPLAY, fontSize: "clamp(52px, 6vw, 82px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.05em", ...gradText(150) }}>{display}</div>
      <div style={{ marginTop: 16, fontSize: 13.5, color: T.muted, lineHeight: 1.6, fontWeight: 300, maxWidth: 220 }}>{s.sub}</div>
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
  return (
    <section className="abt-section-pad" style={{ padding: "100px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.accentTx }}>By The Numbers</span>
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.faint }}>Impatto misurabile · 2026</span>
        </div>

        <div className="abt-stat-grid">
          {STATS.map((s, i) => <StatCard key={i} s={s} i={i} />)}

          {/* accent statement card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            style={{ position: "relative", overflow: "hidden", borderRadius: 20, padding: "30px 28px", minHeight: 190, display: "flex", flexDirection: "column", justifyContent: "space-between", border: `1px solid ${LT(0.24)}`, borderTop: `1px solid ${LT(0.4)}`, background: `linear-gradient(135deg, ${AM(0.16)}, ${RD(0.08)} 60%, rgba(255,255,255,0.03))`, boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 40px ${OR(0.12)}, inset 0 1px 0 rgba(255,255,255,0.16)` }}>
            <span style={{ ...MONO_LABEL, fontSize: 9.5, color: T.accentTx }}>100% CUSTOM</span>
            <p style={{ fontFamily: DISPLAY, fontSize: "clamp(18px, 2vw, 23px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25, color: T.text, margin: 0, maxWidth: 260 }}>
              Ogni progetto è su misura. Zero template, zero scorciatoie.
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
const PHILOSOPHY_PARAS = [
  "Mi bastano poche parole per mappare l'intera struttura del tuo business. Questa lettura immediata, unita a un pensiero creativo profondo, mi permette di decodificare la tua visione commerciale e tradurla subito in un'architettura digitale ad altissime prestazioni.",
  "Fondo l'eleganza del minimalismo visivo con prestazioni frontend eccezionali. Ogni riga di codice, ogni layout e ogni campagna hanno un solo scopo: eliminare il superfluo, massimizzare la conversione e dominare il posizionamento di mercato.",
  "Integro l'AI in ogni fase — dallo sviluppo alla SEO. Scrivo codice più pulito, testo più a fondo e consegno infrastrutture complesse a una velocità semplicemente fuori portata per un'agenzia tradizionale.",
]

function PhilosophySection() {
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div className="abt-philosophy-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "0 100px", alignItems: "start" }}>
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}
            className="abt-philosophy-sticky" style={{ position: "sticky", top: 100 }}>
            <ChipLabel text="The Approach" />
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(32px, 3.8vw, 56px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              THE<br /><span style={gradText(96)}>APPROACH</span>
            </h2>
            <div style={{ width: 48, height: 3, marginTop: 32, borderRadius: 2, background: `linear-gradient(90deg, ${OR(1)}, ${T.accentLt})` }} />
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {PHILOSOPHY_PARAS.map((text, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.70, delay: i * 0.12, ease }}
                style={{ padding: i === 0 ? "0 0 48px" : "48px 0", borderBottom: i < PHILOSOPHY_PARAS.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <span style={{ display: "block", ...MONO_LABEL, fontSize: 10, color: T.accentLt, marginBottom: 20, opacity: 0.75 }}>0{i + 1}</span>
                <p style={{ fontSize: "clamp(15px, 1.3vw, 17px)", color: T.titanium, lineHeight: 1.9, fontWeight: 300, margin: 0 }}>{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §4  PROCESS — horizontal ruler timeline
══════════════════════════════════════════════════════════════════════════ */
//PLACEHOLDER process steps — replace durations/copy with real workflow
const PROCESS = [
  { n: "01", title: "Scoping", dur: "3–5 giorni", desc: "Analizziamo obiettivi, target e vincoli. Definisco architettura e roadmap tecnica." },
  { n: "02", title: "Design", dur: "1–2 sett.", desc: "Concept UI premium in Framer. Scegli la direzione, la rifinisco fino al pixel." },
  { n: "03", title: "Sviluppo", dur: "2–4 sett.", desc: "Codice frontend pulito, performante e scalabile. Test rigorosi ad ogni step." },
  { n: "04", title: "Launch & Growth", dur: "Ongoing", desc: "Go-live, SEO tecnica e campagne. Ottimizzazione continua sulla conversione." },
]

function ProcessSection() {
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}`, overflow: "hidden" }}>
      <motion.div aria-hidden animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-10%", right: "8%", width: 520, height: 520, borderRadius: "50%", background: `radial-gradient(circle, ${OR(0.12)} 0%, transparent 66%)`, filter: "blur(80px)", pointerEvents: "none" }} />
      <div className="abt-wrap" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", marginBottom: 20 }}>
            <span style={{ ...MONO_LABEL, fontSize: 10, color: T.accentTx, padding: "7px 16px", borderRadius: 9999, background: G.bg, border: `1px solid ${G.bd}`, backdropFilter: G.blur, WebkitBackdropFilter: G.blur }}>Il Processo</span>
          </div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}
            style={{ fontFamily: DISPLAY, fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.04em", color: T.text, margin: "0 auto", maxWidth: 780 }}>
            Il tuo prossimo prodotto parte da qui:{" "}
            <span style={gradText(96)}>strategico, elegante, redditizio.</span>
          </motion.h2>
        </div>

        {/* steps */}
        <div className="abt-process-steps">
          {PROCESS.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
              style={{ borderRadius: 16, padding: "22px 20px", background: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.bd}`, borderTop: "1px solid rgba(255,255,255,0.22)", boxShadow: G.shadow }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ ...MONO_LABEL, fontSize: 10, color: T.accentLt }}>{p.n}</span>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", color: T.accentTx, padding: "3px 9px", borderRadius: 9999, background: AM(0.12), border: `1px solid ${LT(0.24)}` }}>{p.dur}</span>
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: T.text, margin: "0 0 8px" }}>{p.title}</h3>
              <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.7, fontWeight: 300, margin: 0 }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ruler with duration chips */}
        <motion.div className="abt-ruler" initial={{ opacity: 0, scaleX: 0.96 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
          {PROCESS.map((p, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, color: T.text }}>{p.dur}</span>
              <span style={{ width: 16, height: 16, borderRadius: 5, background: `linear-gradient(135deg, ${OR(1)}, ${T.accent})`, boxShadow: `0 0 12px ${OR(0.6)}` }} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §5  TECH TOOLKIT — bento grid with spotlight borders
══════════════════════════════════════════════════════════════════════════ */
const TOOLKIT = [
  { num: "01", title: "Design & Thinking", items: ["Pensiero Creativo & Strategia", "Premium UI/UX Design", "Minimalist Aesthetics", "Advanced Design Systems", "Framer Prototyping", "Mobile-First Architecture"] },
  { num: "02", title: "E-Commerce Eng.", items: ["Shopify Custom Sviluppo", "Headless Commerce", "Custom Checkouts", "Data Migrations", "CRO Optimization", "E-commerce Analytics"] },
  { num: "03", title: "Web, Mobile & AI", items: ["React.js & Next.js", "Tailwind CSS", "JavaScript (ES6+)", "Expo & Supabase", "AI-Driven Coding Workflows", "Claude Code & Cursor"] },
  { num: "04", title: "Acquisition & Growth", items: ["SEO Avanzato & AI SEO Audit", "Google Ads (Search & Pmax)", "Meta Ads (FB & Instagram)", "Funnel Strategy & Growth", "B2B Lead Generation", "Conversion Tracking Advanced"] },
]

function BentoCard({ data, i, big }: { data: typeof TOOLKIT[number]; i: number; big?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div className="abt-bento-item" data-glow=""
      initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay: i * 0.08, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      style={{
        '--base': '28', '--spread': '30', '--radius': '20', '--border': '1.5', '--size': '300',
        position: "relative", borderRadius: 20, padding: big ? "32px 30px" : "26px 24px",
        background: hov ? G.bgHov : G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        border: `1px solid ${G.bd}`, borderTop: "1px solid rgba(255,255,255,0.24)",
        boxShadow: hov ? G.shadowHov : G.shadow,
        display: "flex", flexDirection: "column", transition: "background 0.25s, box-shadow 0.3s", overflow: "hidden",
      } as React.CSSProperties}>
      <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ ...MONO_LABEL, fontSize: 10, color: T.accentLt }}>{data.num}</span>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: AM(0.12), border: `1px solid ${LT(0.26)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, opacity: 0.9 }} />
          </div>
        </div>
        <h3 style={{ fontFamily: DISPLAY, fontSize: big ? 20 : 14, fontWeight: 800, letterSpacing: "-0.01em", color: T.text, textTransform: "uppercase" as const, margin: 0, lineHeight: 1.3 }}>{data.title}</h3>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {data.items.map((item, ii) => (
          <motion.span key={ii} initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 + ii * 0.04, ease }}
            style={{ display: "inline-block", padding: "5px 11px", borderRadius: 9999, fontSize: big ? 12.5 : 11.5, fontWeight: 400, lineHeight: 1.4, color: T.muted, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", letterSpacing: "0.01em", cursor: "default" }}>
            {item}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}

function ToolkitSection() {
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div style={{ marginBottom: 64 }}>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
            <ChipLabel text="Core Capabilities" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.08, ease }}
            style={{ fontFamily: DISPLAY, fontSize: "clamp(30px, 4vw, 60px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
            TECH <span style={gradText(96)}>TOOLKIT</span>
          </motion.h2>
        </div>
        <div className="abt-bento">
          {TOOLKIT.map((data, i) => <BentoCard key={i} data={data} i={i} big={i === 0} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §6  NOW / CURRENTLY
══════════════════════════════════════════════════════════════════════════ */
//PLACEHOLDER "now" content — replace with real facts
const NOW = [
  { k: "Building", v: "Piattaforma e-commerce headless per un brand fashion europeo.", tag: "In corso" },
  { k: "Learning", v: "AI agents applicati all'automazione di workflow di sviluppo e SEO.", tag: "Focus" },
  { k: "Available", v: "1 slot per nuovi progetti a partire dal Q3 2026.", tag: "Aperto" },
]

function NowSection() {
  return (
    <section className="abt-section-pad" style={{ padding: "100px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
          <div>
            <ChipLabel text="Now" />
            <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}
              style={{ fontFamily: DISPLAY, fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              COSA STO FACENDO <span style={gradText(96)}>ORA</span>
            </motion.h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PingDot color={T.green} size={6} />
            <span style={{ ...MONO_LABEL, fontSize: 10, color: T.faint }}>UPDATED · LUG 2026</span>
          </div>
        </div>
        <div className="abt-now-grid">
          {NOW.map((n, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
              style={{ borderRadius: 18, padding: "26px 24px", background: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.bd}`, borderTop: "1px solid rgba(255,255,255,0.22)", boxShadow: G.shadow, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ ...MONO_LABEL, fontSize: 10, color: T.accentLt }}>{n.k}</span>
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", color: T.accentTx, padding: "3px 9px", borderRadius: 9999, background: AM(0.12), border: `1px solid ${LT(0.22)}` }}>{n.tag}</span>
              </div>
              <p style={{ fontSize: 14.5, color: T.titanium, lineHeight: 1.75, fontWeight: 300, margin: 0 }}>{n.v}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §7  FAQs
══════════════════════════════════════════════════════════════════════════ */
const FAQS = [
  { q: "Cosa significa lavorare con un \"Digital Architect\"?", a: "Significa un solo punto di contatto per l'intero progetto: dall'analisi strategica iniziale allo sviluppo dell'interfaccia premium, dal codice frontend alla SEO e al growth marketing. Niente intermediari, niente colli di bottiglia — solo esecuzione diretta." },
  { q: "Ti occupi anche di acquisizione traffico e advertising?", a: "Sì. Un prodotto eccezionale ha bisogno di visibilità eccezionale. Integro la SEO avanzata basata su AI fin dalla progettazione e gestisco campagne ad alto budget su Google Ads e Meta Ads, con funnel completi per la lead generation B2B e la vendita e-commerce." },
  { q: "Qual è il tuo stack tecnologico principale?", a: "React.js e Next.js con Tailwind CSS per web app e interfacce dinamiche. Expo e Supabase per mobile e backend agili. Per l'e-commerce ad alta scalabilità lavoro su Shopify Custom." },
  { q: "Come usi l'Intelligenza Artificiale nel flusso di lavoro?", a: "Uso AI-assisted coding di ultima generazione e modelli predittivi per SEO e advertising. Questo accelera in modo esponenziale scrittura del codice, analisi dei dati e ottimizzazione — consegno infrastrutture perfette in tempi ridotti." },
  { q: "Come gestisci tempi, costi e migrazioni?", a: "Ogni progetto parte da uno scoping tecnico accurato: timeline realistica (di solito da poche settimane a due mesi) e preventivo fisso. Per le piattaforme obsolete gestisco la migrazione verso Shopify preservando SEO, meta tag e dati storici." },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  const [hov, setHov] = useState(false)
  return (
    <motion.div data-glow=""
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.60, delay: index * 0.07, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      style={{
        '--base': '28', '--spread': '30', '--radius': '16', '--border': '1.5', '--size': '280',
        position: "relative", borderRadius: 16,
        background: open ? AM(0.07) : hov ? G.bgHov : G.bg,
        backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        border: `1px solid ${open ? LT(0.42) : hov ? G.bdHov : G.bd}`,
        boxShadow: open ? `0 12px 44px rgba(0,0,0,0.50), 0 0 0 1px ${OR(0.16)}, inset 0 1px 0 rgba(255,255,255,0.10)` : G.shadow,
        transition: "background 0.25s, border-color 0.25s, box-shadow 0.30s", overflow: "hidden",
      } as React.CSSProperties}>
      <div style={{ height: 2, background: open ? `linear-gradient(90deg, ${OR(1)}, ${T.accentLt}, transparent)` : "transparent", transition: "background 0.3s" }} />
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, padding: "28px 32px", background: "none", border: "none", cursor: "pointer", color: T.text, textAlign: "left", fontFamily: "inherit" }}>
        <span style={{ fontSize: "clamp(14px, 1.2vw, 16px)", fontWeight: 500, lineHeight: 1.45, letterSpacing: "-0.01em", flex: 1 }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0, color: open ? T.accentLt : T.faint }} transition={{ duration: 0.30, ease }} style={{ flexShrink: 0, marginTop: 2 }}>
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.38, ease }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 32px 32px", paddingTop: 0 }}>
              <p style={{ fontSize: "clamp(14px, 1.15vw, 15.5px)", color: T.muted, lineHeight: 1.88, margin: 0, fontWeight: 300 }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQSection() {
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div className="abt-faq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 80px", alignItems: "start" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}
            className="abt-faq-sticky" style={{ position: "sticky", top: 100 }}>
            <ChipLabel text="FAQ" />
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              LOGICA&<br /><span style={gradText(96)}>TRASPARENZA</span>
            </h2>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, marginTop: 20, fontWeight: 300, maxWidth: 240 }}>
              Risposte dirette alle domande che contano davvero.
            </p>
          </motion.div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq, i) => <FAQItem key={i} {...faq} index={i} />)}
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
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: f ? T.accentLt : T.faint, marginBottom: 8, transition: "color 0.2s" }}>{label}</label>
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
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: f ? T.accentLt : T.faint, marginBottom: 8, transition: "color 0.2s" }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
        onFocus={() => setF(true)} onBlur={() => setF(false)} required
        style={{ width: "100%", padding: "13px 16px", background: f ? AM(0.08) : "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${f ? LT(0.55) : "rgba(255,255,255,0.11)"}`, borderRadius: 12, color: T.text, fontSize: 14, outline: "none", resize: "none" as const, fontFamily: "inherit", boxSizing: "border-box" as const, boxShadow: f ? `0 0 0 3px ${AM(0.12)}, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s" }} />
    </div>
  )
}

function GlassSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [f, setF] = useState(false)
  const options = ["E-commerce ad Alta Conversione", "Siti Corporate & Lead Generation", "Applicazioni Web & Automazione Custom", "SEO Strategico & Performance Marketing", "Integrazione AI & Sistemi Intelligenti"]
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: f ? T.accentLt : T.faint, marginBottom: 8, transition: "color 0.2s" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)} required
        style={{ width: "100%", padding: "13px 16px", background: f ? AM(0.08) : "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${f ? LT(0.55) : "rgba(255,255,255,0.11)"}`, borderRadius: 12, color: value ? T.text : T.faint, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit", appearance: "none" as const, cursor: "pointer", boxShadow: f ? `0 0 0 3px ${AM(0.12)}, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s" }}>
        <option value="" disabled style={{ background: "#141010", color: T.muted }}>Seleziona un'area...</option>
        {options.map(o => <option key={o} value={o} style={{ background: "#141010", color: T.text }}>{o}</option>)}
      </select>
    </div>
  )
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [fields, setFields] = useState({ name: "", email: "", site: "", area: "", msg: "" })
  const [sent, setSent] = useState(false)
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
        style={{ width: "100%", maxWidth: 600, marginTop: "auto", marginBottom: "auto", flexShrink: 0, position: "relative", borderRadius: 24, background: "rgba(18,12,7,0.85)", backdropFilter: "blur(44px) saturate(2)", WebkitBackdropFilter: "blur(44px) saturate(2)", borderTop: "1px solid rgba(255,255,255,0.55)", borderRight: "1px solid rgba(255,255,255,0.16)", borderBottom: "1px solid rgba(255,255,255,0.08)", borderLeft: "1px solid rgba(255,255,255,0.16)", boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px rgba(0,0,0,0.80), 0 0 100px ${OR(0.22)}, inset 0 1px 0 rgba(255,255,255,0.28)` } as React.CSSProperties}>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${OR(1)} 28%, ${T.accentLt} 72%, transparent)`, borderRadius: "24px 24px 0 0" }} />
        <div aria-hidden style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 360, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${OR(0.20)} 0%, transparent 70%)`, filter: "blur(30px)", pointerEvents: "none" }} />
        <div className="contact-modal-content" style={{ padding: "30px 34px 34px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 26 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <PingDot color={T.accentLt} size={6} />
                <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: T.accentLt }}>RICHIESTA CONSULENZA</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", color: T.text, margin: 0, lineHeight: 1.22 }}>Raccontami il tuo progetto</h3>
            </div>
            <motion.button onClick={onClose} whileHover={{ scale: 1.10, background: "rgba(255,255,255,0.10)" }} whileTap={{ scale: 0.92 }}
              style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, transition: "background 0.18s" }}>
              <XIcon size={13} />
            </motion.button>
          </div>
          {!sent ? (
            <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="contact-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <GlassInput label="Nome" placeholder="Il tuo nome" value={fields.name} onChange={set("name")} />
                <GlassInput label="Email" placeholder="email@azienda.it" type="email" value={fields.email} onChange={set("email")} />
              </div>
              <GlassInput label="Sito Web" placeholder="https://tuosito.it (opzionale)" value={fields.site} onChange={set("site")} />
              <GlassSelect label="Cosa dobbiamo risolvere?" value={fields.area} onChange={set("area")} />
              <GlassTextarea label="Messaggio" placeholder="Descrivi la situazione attuale e il risultato che vuoi ottenere..." value={fields.msg} onChange={set("msg")} />
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 380, damping: 18 }}
                style={{ marginTop: 4, width: "100%", padding: "15px 32px", borderRadius: 9999, cursor: "pointer", border: "none", background: "linear-gradient(100deg, #FF6A00, #F5852A)", boxShadow: `0 10px 34px ${OR(0.32)}, inset 0 1px 0 rgba(255,255,255,0.25)`, color: "#1c0d02", fontFamily: DISPLAY, fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em" }}>
                Invia Richiesta →
              </motion.button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "36px 0" }}>
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.08 }}
                style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: 26, color: T.green }}>
                ✓
              </motion.div>
              <h4 style={{ fontSize: 19, fontWeight: 700, color: T.green, marginBottom: 10 }}>Richiesta inviata!</h4>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.8, margin: 0 }}>Riceverai un piano d'azione chiaro entro 24 ore lavorative.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §8  FINAL CTA + GIANT WORDMARK FOOTER
══════════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
    <section style={{ position: "relative", borderTop: `1px solid ${T.border}`, overflow: "hidden" }}>
      <motion.div aria-hidden animate={{ scale: [1, 1.15, 0.92, 1.1, 1], opacity: [0.6, 0.95, 0.45, 0.8, 0.6] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 760, height: 760, borderRadius: "50%", background: `radial-gradient(circle, ${OR(0.16)} 0%, ${RD(0.08)} 40%, transparent 66%)`, filter: "blur(90px)", pointerEvents: "none" }} />

      <div className="abt-wrap" style={{ paddingTop: 120, paddingBottom: 60, position: "relative", zIndex: 1, textAlign: "center" }}>
        <motion.h2 className="abt-cta-h2" initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.90, ease }}
          style={{ fontFamily: DISPLAY, fontSize: "clamp(44px, 7vw, 100px)", fontWeight: 900, lineHeight: 0.94, letterSpacing: "-0.045em", color: T.text, margin: "0 auto 52px", maxWidth: 920 }}>
          HAI QUALCOSA<br /><span style={gradText(96)}>DA COSTRUIRE?</span>
        </motion.h2>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.70, delay: 0.18, ease }}
          style={{ display: "flex", justifyContent: "center" }}>
          <PillCTA label="Iniziamo a parlarne" onClick={() => setModalOpen(true)} />
        </motion.div>
      </div>

      {/* giant glowing wordmark footer */}
      <div style={{ position: "relative", overflow: "hidden", paddingTop: 40, background: "linear-gradient(180deg, transparent 0%, rgba(4,2,1,0.55) 28%, rgba(2,1,0,0.92) 100%)", borderTop: `1px solid ${T.border}` }}>
        <div className="abt-wrap" style={{ position: "relative", zIndex: 2 }}>
          <div className="abt-footer-links" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, paddingBottom: 28 }}>
            <span style={{ ...MONO_LABEL, fontSize: 10, color: T.faint }}>© NADIA MAAR 2026</span>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {[
                { label: "LINKEDIN", href: "https://linkedin.com/in/nadiamaar", Icon: LinkedinIcon },
                { label: "GITHUB",   href: "https://github.com/nadiamaar-dev", Icon: GithubIcon },
                { label: "EMAIL",    href: "mailto:nadiamaar.dev@gmail.com",   Icon: MailIcon },
              ].map(({ label, href, Icon }) => (
                <motion.a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  whileHover={{ color: T.text, y: -1 }} transition={{ duration: 0.18 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, ...MONO_LABEL, fontSize: 10, color: T.faint, textDecoration: "none" }}>
                  <Icon size={12} />
                  {label}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* wordmark — same glass style as hero */}
        <div aria-hidden style={{ position: "relative", textAlign: "center", lineHeight: 0.8, padding: "0 12px" }}>
          <span className="abt-wordmark" style={{
            display: "block", fontFamily: DISPLAY, fontWeight: 900, letterSpacing: "-0.04em",
            fontSize: "clamp(110px, 22vw, 340px)",
            color: "rgba(255,236,220,0.07)",
            filter: "blur(1px) drop-shadow(0 0 60px rgba(212,67,28,0.18)) drop-shadow(0 0 120px rgba(212,67,28,0.08))",
            position: "relative", zIndex: 1, userSelect: "none" as const,
            transform: "translateY(18%)",
          }}>MAAR</span>
        </div>
      </div>
    </section>

    <AnimatePresence>{modalOpen && <ContactModal onClose={() => setModalOpen(false)} />}</AnimatePresence>
    </>
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
      background: T.bg, color: T.text,
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      overflowX: "clip", minHeight: "100vh", position: "relative",
    }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <AuroraBackground />
      <ScrollProgress />
      <CursorRing />
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <HeroSection />
        <MarqueeStrip />
        <StatBento />
        <PhilosophySection />
        <ProcessSection />
        <ToolkitSection />
        <NowSection />
        <FAQSection />
        <FinalCTA />
      </div>
    </div>
  )
}
