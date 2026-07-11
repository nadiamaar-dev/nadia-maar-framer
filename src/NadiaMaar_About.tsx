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
import FloatingContact from "./components/FloatingContact"
import Header from "./components/Header"
import Background from "./components/Background"

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
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"/>
  </svg>
)
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
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

/* NM single-stroke geometric mark */
function NMmark({ size = 32, id = "nm-g", hover = false }: { size?: number; id?: string; hover?: boolean }) {
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
        stroke={`url(#${id})`}
        strokeWidth="1.85"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }, opacity: { duration: 0.01 } }}
      />
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — Obsidian + solar orange / copper aurora
══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#1A1816",
  surface:   "#262320",
  border:    "rgba(255,255,255,0.11)",
  text:      "#FFFFFF",
  muted:     "rgba(255,255,255,0.78)",
  faint:     "rgba(255,255,255,0.58)",
  accent:    "#8C3525",
  accentGlo: "rgba(196,180,154,0.22)",
  accentLt:  "#B04A38",
  green:     "#10B981",
} as const

// warm rgba helpers
const AM = (a: number) => `rgba(140,53,37,${a})`
const LT = (a: number) => `rgba(176,74,56,${a})`
const OR = (a: number) => `rgba(140,53,37,${a})`
const RD = (a: number) => `rgba(100,35,22,${a})`

// white -> amber gradient text fill
const gradText = (deg = 180): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${deg}deg, #FFFFFF 0%, #D4897A 48%, #8C3525 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
})

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/*+<>{}[]"

const G = {
  bg:        "rgba(138,143,149,0.7)",
  bgHov:     "rgba(138,143,149,0.8)",
  bd:        "rgba(255,255,255,0.28)",
  bdHov:     "rgba(255,255,255,0.55)",
  blur:      "blur(52px) saturate(2.2)",
  shadow:    "0 16px 52px 0 rgba(4,2,0,0.58), inset 0 1px 0 rgba(255,255,255,0.50), inset 0 0 0 1px rgba(255,255,255,0.06)",
  shadowHov: "0 32px 80px 0 rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.64), inset 0 0 0 1px rgba(255,255,255,0.09)",
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
  ::-webkit-scrollbar-track { background: #233D4D; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  :root { --x:-9999; --y:-9999; --xp:0; --yp:0; }

  /* brick text glow — подложка */
  [style*="color: #B04A38"],
  [style*="color: #8C3525"] {
    text-shadow: 0 0 22px rgba(176,74,56,0.58), 0 0 8px rgba(140,53,37,0.42);
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
  .abt-tag { display: inline-block; padding: 5px 11px; border-radius: 9999px; font-weight: 400; line-height: 1.4; color: rgba(255,255,255,0.78); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); letter-spacing: 0.01em; cursor: default; transition: background .22s, border-color .22s, color .22s, transform .22s; }
  .abt-tag:hover { background: rgba(176,74,56,0.20); border-color: rgba(176,74,56,0.48); color: #fff; transform: translateY(-1px); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }

  .abt-wrap { max-width: 1160px; margin: 0 auto; padding: 0 40px; }
  .abt-footer-main-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; }
  @media (max-width: 768px) {
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
    border: 1px solid rgba(140,53,37,0.60); pointer-events: none; z-index: 600; mix-blend-mode: screen;
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
function GhostNum({ n, size = 116, top = -6, right = 6 }: { n: string | number; size?: number; top?: number; right?: number }) {
  return (
    <span aria-hidden style={{
      position: "absolute", top, right, fontFamily: DISPLAY, fontWeight: 900,
      fontSize: size, lineHeight: 1, letterSpacing: "-0.06em", pointerEvents: "none",
      color: "transparent", WebkitTextStroke: `1px ${LT(0.15)}`, userSelect: "none",
    }}>{n}</span>
  )
}

/** Warm brick spotlight that fades in from the base of a card on hover. */
function HoverGlow({ show }: { show: boolean }) {
  return (
    <span aria-hidden style={{
      position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
      background: `radial-gradient(120% 88% at 50% 116%, ${OR(0.30)}, transparent 60%)`,
      opacity: show ? 1 : 0, transition: "opacity 0.42s ease",
    }} />
  )
}

/** Spotlight-border vars for [data-glow] cards. */
const glowVars = (radius = 18): React.CSSProperties => ({
  ['--base' as string]: '28', ['--spread' as string]: '30',
  ['--radius' as string]: String(radius), ['--border' as string]: '1.5', ['--size' as string]: '300',
} as React.CSSProperties)

/** Shared refined-glass surface. Pass hover state for the lit variant. */
const glass = (hov = false): React.CSSProperties => ({
  background: hov ? G.bgHov : G.bg,
  backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
  border: `1px solid ${hov ? LT(0.42) : G.bd}`,
  borderTop: `1px solid rgba(255,255,255,0.24)`,
  boxShadow: hov ? `${G.shadowHov}, 0 0 46px ${OR(0.15)}` : G.shadow,
  transition: "background .3s, border-color .3s, box-shadow .35s",
})

/** Numbered editorial section kicker — §NN —— EYEBROW. The cohesion backbone. */
function Kicker({ index, text, center = false }: { index: string; text: string; center?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22, justifyContent: center ? "center" : "flex-start" }}>
      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.18em", color: T.accentLt }}>§{index}</span>
      <span aria-hidden style={{ width: 30, height: 1, background: `linear-gradient(90deg, ${LT(0.6)}, ${LT(0.1)})` }} />
      <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.52)" }}>{text}</span>
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

function PillCTA({ label, href, onClick, target }: { label: string; href?: string; onClick?: () => void; target?: string }) {
  const [h, setH] = useState(false)
  const btnStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "stretch",
    borderRadius: 12, cursor: "pointer",
    border: `1px solid ${h ? "rgba(176,74,56,0.90)" : "rgba(176,74,56,0.65)"}`,
    background: "linear-gradient(90deg, rgba(176,74,56,0.78) 0%, rgba(176,74,56,0.60) 100%)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    boxShadow: h ? "0 0 56px rgba(140,53,37,0.38), 0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)" : "0 0 36px rgba(140,53,37,0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
    textDecoration: "none", overflow: "hidden",
    transition: "border-color 0.25s, box-shadow 0.30s",
  }
  const inner = (
    <>
      <span style={{ padding: "14px 14px 14px 18px", borderRight: "1px solid rgba(140,53,37,0.45)", display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>[01]</span>
      <span style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
        {label}
        <motion.span animate={{ x: h ? [0,4,0] : 0 }} transition={{ duration: 0.55, repeat: h ? Infinity : 0, ease: "easeInOut" }} style={{ fontSize: 14, color: "rgba(255,255,255,0.92)" }}>→</motion.span>
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
function DateTimeWidget() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const hh  = String(now.getHours()).padStart(2, "0")
  const mm  = String(now.getMinutes()).padStart(2, "0")
  const ss  = now.getSeconds()
  const ssStr = String(ss).padStart(2, "0")
  const day = new Intl.DateTimeFormat("en", { weekday: "short" }).format(now).toUpperCase()
  const date = now.getDate()
  const mon = new Intl.DateTimeFormat("en", { month: "short" }).format(now).toUpperCase()
  return (
    <div className="abt-datetime" aria-label="Local time" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 10, padding: "5px 14px 5px 8px", borderRadius: 100, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(22px) saturate(1.6)", WebkitBackdropFilter: "blur(22px) saturate(1.6)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 14px rgba(0,0,0,0.22)", whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none", zIndex: 10 } as React.CSSProperties}>
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8.5" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
        <motion.circle cx="11" cy="11" r="8.5" fill="none" stroke="#B04A38" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-90 11 11)" animate={{ pathLength: ss / 60 }} transition={{ duration: 0.85, ease: "easeOut" }} />
      </svg>
      <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.92)", display: "inline-flex", alignItems: "baseline", gap: 1 }}>
        {hh}
        <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} style={{ margin: "0 1px", color: "rgba(255,255,255,0.30)" }}>:</motion.span>
        {mm}
        <span style={{ fontSize: 9, opacity: 0.36, marginLeft: 4, letterSpacing: "0.04em" }}>{ssStr}</span>
      </span>
      <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.10)", flexShrink: 0 }} />
      <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 500, letterSpacing: "0.14em", color: "rgba(255,255,255,0.36)" }}>{day} {date} {mon}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   BACKGROUND — identical to main page
══════════════════════════════════════════════════════════════════════════ */
function GrainOverlay() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext("2d", { alpha: true }); if (!ctx) return
    const S = 512; let id = 0; let frame = 0
    const draw = () => {
      c.width = S; c.height = S
      const img = ctx.createImageData(S, S); const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255
        d[i] = v; d[i+1] = v; d[i+2] = v; d[i+3] = 7
      }
      ctx.putImageData(img, 0, 0)
    }
    const loop = () => { if (frame % 3 === 0) draw(); frame++; id = requestAnimationFrame(loop) }
    draw(); id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <canvas ref={ref} aria-hidden style={{
      position: "fixed", inset: 0, width: "100vw", height: "100vh",
      pointerEvents: "none", opacity: 0.032, imageRendering: "pixelated" as const,
      mixBlendMode: "overlay", zIndex: 1,
    }} />
  )
}

function AuroraBackground() {
  return (
    <>
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "#233D4D" }} />
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "42%", background: "#2E4C5F", borderRight: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "34%", width: "16%", background: "linear-gradient(90deg, #2E4C5F, #233D4D)" }} />
        <div style={{ position: "absolute", top: "-10%", left: "-8%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,120,180,0.11) 0%, rgba(10,90,140,0.05) 50%, transparent 72%)", filter: "blur(90px)", pointerEvents: "none" }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%), linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%), linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1.4px)",
          backgroundSize: "26px 26px",
          WebkitMaskImage: "radial-gradient(ellipse 52% 48% at 50% 36%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 52%, transparent 76%)",
          maskImage: "radial-gradient(ellipse 52% 48% at 50% 36%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 52%, transparent 76%)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 108% 86% at 50% 42%, transparent 30%, rgba(10,10,13,0.80) 100%)" }} />
      </div>
      <GrainOverlay />
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
        background: "linear-gradient(90deg, rgba(100,35,22,1), #8C3525, #B04A38)",
        boxShadow: "0 0 12px rgba(140,53,37,0.7)",
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
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
        <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
          <NMmark size={30} id="nm-abt-nav" hover={h} />
          <motion.span aria-hidden
            animate={{ opacity: h ? 1 : 0 }}
            transition={{ duration: 0.30 }}
            style={{ position: "absolute", right: -3, bottom: -1, width: 20, height: 20, background: "radial-gradient(circle, rgba(140,53,37,0.55) 0%, transparent 70%)", filter: "blur(7px)", pointerEvents: "none" }}
          />
        </span>
        <span aria-hidden style={{ width: 1, height: 14, background: "rgba(255,255,255,0.16)", flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const, color: h ? "#fff" : "rgba(255,255,255,0.68)", transition: "color 0.28s" }}>
          Nadia Maar
        </span>
      </span>
    </motion.button>
  )
}

function MenuNavItem({ num, label, onClick, index, active = false }: { num: string; label: string; onClick: () => void; index: number; active?: boolean }) {
  const [h, setH] = useState(false)
  const lit = h || active
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        onClick={onClick}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ background: "none", border: "none", cursor: "pointer", width: "100%", display: "flex", alignItems: "baseline", gap: 18, padding: "14px 0", borderBottom: `1px solid ${lit ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}`, transition: "border-color 0.22s", textAlign: "left" as const, position: "relative" }}
      >
        <motion.span aria-hidden
          animate={{ scaleY: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)", width: 2, height: "60%", background: T.accent, borderRadius: 2, transformOrigin: "center" }}
        />
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: active ? T.accentLt : lit ? T.accent : "rgba(255,255,255,0.30)", transition: "color 0.22s", minWidth: 26, flexShrink: 0 }}>[{num}]</span>
        <span style={{ fontFamily: DISPLAY, fontSize: "clamp(28px, 8vw, 46px)", fontWeight: 800, letterSpacing: "-0.032em", lineHeight: 1.1, color: lit ? "#fff" : "rgba(255,255,255,0.75)", transition: "color 0.22s" }}>{label}</span>
        <motion.span animate={{ x: lit ? 6 : 0, opacity: lit ? 1 : 0 }} transition={{ duration: 0.20 }} style={{ marginLeft: "auto", color: T.accentLt, fontSize: 20, lineHeight: 1 }}>→</motion.span>
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

  const isAboutPage = typeof window !== "undefined" && window.location.pathname.includes("about")

  const NAV = [
    { num: "01", label: "Home",      action: () => { window.location.href = "/" },     key: "Home" },
    { num: "02", label: "About Me",  action: onClose,                                   key: "About Me" },
    { num: "03", label: "Soluzioni", action: () => { window.location.href = "/#s3" },  key: "Soluzioni" },
    { num: "04", label: "Risultati", action: () => { window.location.href = "/#s5" },  key: "Risultati" },
    { num: "05", label: "Contatti",  action: () => { window.location.href = "/#s9" },  key: "Contatti" },
  ]

  const MENU_SOCIALS = [
    { label: "LI",  href: "https://linkedin.com/in/nadiamaar" },
    { label: "GH",  href: "https://github.com/nadiamaar-dev" },
    { label: "IG",  href: "https://instagram.com/nadiamaar.dev" },
    { label: "DC",  href: "https://discord.gg/nadiamaar" },
  ]

  const GLASS = {
    background: "rgba(22,27,34,0.82)",
    backdropFilter: "blur(72px) brightness(1.08) saturate(0.80)",
    WebkitBackdropFilter: "blur(72px) brightness(1.08) saturate(0.80)",
  } as React.CSSProperties

  const menuFooter = (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.42, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ paddingBottom: 36, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.10)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <a href="mailto:nadiamaar.dev@gmail.com"
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: "rgba(255,255,255,0.50)", textDecoration: "none", transition: "color 0.18s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.50)")}>
          nadiamaar.dev@gmail.com
        </a>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <PingDot color={T.green} size={5} />
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(190,245,220,0.80)" }}>Disponibile</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {MENU_SOCIALS.map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none", transition: "all 0.18s" }}
            onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.color="#fff"; el.style.borderColor="rgba(140,53,37,0.55)"; el.style.background="rgba(140,53,37,0.14)" }}
            onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.color="rgba(255,255,255,0.55)"; el.style.borderColor="rgba(255,255,255,0.12)"; el.style.background="rgba(255,255,255,0.07)" }}
          >{label}</a>
        ))}
      </div>
    </motion.div>
  )

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", padding: "0 28px", overflow: "hidden", ...GLASS }}
      >
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(140,53,37,0.70), rgba(176,74,56,0.45), transparent)", flexShrink: 0 }} />
        <div style={{ height: 64, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <NMmark size={26} id="nm-abt-menu-mob" hover={false} />
        </div>
        <div aria-hidden style={{ position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)", fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(80px,32vw,160px)", letterSpacing: "-0.05em", color: "rgba(74,94,118,0.15)", filter: "blur(1px)", userSelect: "none", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 0 }}>MAAR</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0, position: "relative", zIndex: 1, paddingLeft: 20 }}>
          {NAV.map((item, i) => (
            <MenuNavItem key={item.key} num={item.num} label={item.label} onClick={item.action} index={i} active={isAboutPage ? item.key === "About Me" : item.key === "Home"} />
          ))}
        </div>
        {menuFooter}
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.26 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 299 }}
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 36 }}
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, zIndex: 300, display: "flex", flexDirection: "column", padding: "0 40px", borderLeft: "1px solid rgba(255,255,255,0.14)", ...GLASS }}
      >
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(140,53,37,0.70) 40%, rgba(176,74,56,0.45) 70%, transparent)", flexShrink: 0 }} />
        <div style={{ height: 64, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.36)" }}>Navigation</span>
        </div>
        <div aria-hidden style={{ position: "absolute", right: -8, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(80px,9vw,130px)", letterSpacing: "-0.04em", color: "rgba(74,94,118,0.15)", filter: "blur(0.8px)", userSelect: "none", lineHeight: 0.82 }}>MAAR</span>
        </div>
        <div aria-hidden style={{ position: "absolute", bottom: "25%", right: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,53,37,0.10) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0, position: "relative", zIndex: 1, paddingLeft: 4 }}>
          {NAV.map((item, i) => (
            <MenuNavItem key={item.key} num={item.num} label={item.label} onClick={item.action} index={i} active={isAboutPage ? item.key === "About Me" : item.key === "Home"} />
          ))}
        </div>
        {menuFooter}
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
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 400, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", backdropFilter: scrolled ? "blur(32px) saturate(0.85)" : "none", WebkitBackdropFilter: scrolled ? "blur(32px) saturate(0.85)" : "none", background: scrolled ? "rgba(22,27,34,0.78)" : "transparent", borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`, transition: "background 0.4s, border-color 0.4s" } as React.CSSProperties}>
        <Logo3D onClick={() => { window.location.href = "/" }} />
        <DateTimeWidget />
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
        {["#FF5F57", "#FEBC2E", "#10B981"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
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
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.accentLt }}>Nadia Maar® — Digital Studio</span>
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.faint }}>About / 01</span>
        </motion.div>

        <div className="abt-hero-grid">
          {/* LEFT */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
              <Kicker index="01" text="Architecture & Code" />
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
              <ScrambleLine text="ARCHITECT" delay={430} style={{ color: "#FFFFFF" }} /><br />
              <ScrambleLine text="&" delay={560} style={{ color: "rgba(255,255,255,0.24)", fontWeight: 300 }} />{" "}
              <ScrambleLine text="E-COM" delay={620} style={{ color: "#FFFFFF" }} /><br />
              <ScrambleLine text="DEVELOPER" delay={760} style={{ color: "#FFFFFF" }} />
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
            </motion.div>
          </div>

          {/* RIGHT — frosted glass tablet + terminal */}
          <motion.div className="abt-hero-right" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.90, delay: 0.30, ease }}
            style={{ position: "relative" }}>
            {/* glow behind card */}
            <div aria-hidden style={{ position: "absolute", inset: "-30px -20px", borderRadius: 28, background: `radial-gradient(circle at 70% 30%, ${OR(0.28)}, ${RD(0.12)} 45%, transparent 72%)`, filter: "blur(38px)", zIndex: -1 }} />

            <div data-glow="" style={{
              ...glowVars(22), position: "relative",
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
                <div style={{ ...MONO_LABEL, fontSize: 9.5, color: T.faint }}>Digital Architect · E-Commerce Dev</div>
              </div>
              <div style={{ height: 1, background: T.border, margin: "0 0 20px" }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {["React / Next.js", "Shopify Custom", "AI Automation", "SEO & Ads", "UI/UX Design"].map(tag => (
                  <span key={tag} style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 500, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: T.muted, letterSpacing: "0.04em" }}>{tag}</span>
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
          <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: i % 2 ? T.accentLt : "rgba(255,255,255,0.62)" }}>{it}</span>
          <span style={{ color: T.accentLt, fontSize: 8 }}>◆</span>
        </span>
      ))}
    </span>
  )
  return (
    <div className="abt-marquee" style={{ position: "relative", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, overflow: "hidden", padding: "18px 0", background: "rgba(0,0,0,0.18)" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 140, background: "linear-gradient(90deg, #233D4D, transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 140, background: "linear-gradient(270deg, #233D4D, transparent)", zIndex: 2, pointerEvents: "none" }} />
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
  const [hov, setHov] = useState(false)
  const display = (s.pad ? String(val).padStart(s.pad, "0") : String(val)) + s.suffix
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.08, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      animate={{ y: hov ? -5 : 0 }}
      style={{
        position: "relative", overflow: "hidden", borderRadius: 16,
        padding: "28px 28px 28px 32px", minHeight: 196,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        background: hov ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.018)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: `3px solid rgba(255,255,255,${hov ? 0.28 : 0.14})`,
        boxShadow: hov ? "0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)" : "0 8px 28px rgba(0,0,0,0.38)",
        transition: "background .3s, border-color .3s, box-shadow .35s",
      }}>
      {/* index — top right */}
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.20)", alignSelf: "flex-end" }}>0{i + 1} / 03</span>

      {/* giant number */}
      <div style={{
        fontFamily: DISPLAY, fontSize: "clamp(58px, 7vw, 90px)", fontWeight: 900,
        lineHeight: 0.88, letterSpacing: "-0.055em", color: "#FFFFFF",
        fontVariantNumeric: "tabular-nums",
      }}>{display}</div>

      {/* separator + label */}
      <div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 14 }} />
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.55, fontWeight: 300 }}>{s.sub}</div>
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
  return (
    <section className="abt-section-pad" style={{ padding: "100px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
          <div>
            <Kicker index="02" text="By The Numbers" />
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              IMPATTO <span style={{ color: "#FFFFFF" }}>MISURABILE</span>
            </h2>
          </div>
          <span style={{ ...MONO_LABEL, fontSize: 10.5, color: T.faint, paddingBottom: 6 }}>Aggiornato · 2026</span>
        </div>

        <div className="abt-stat-grid">
          {STATS.map((s, i) => <StatCard key={i} s={s} i={i} />)}

          {/* accent statement card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            style={{ position: "relative", overflow: "hidden", borderRadius: 20, padding: "30px 28px", minHeight: 190, display: "flex", flexDirection: "column", justifyContent: "space-between", border: `1px solid ${LT(0.24)}`, borderTop: `1px solid ${LT(0.4)}`, background: `linear-gradient(135deg, ${AM(0.16)}, ${RD(0.08)} 60%, rgba(255,255,255,0.03))`, boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 40px ${OR(0.12)}, inset 0 1px 0 rgba(255,255,255,0.16)` }}>
            <span style={{ ...MONO_LABEL, fontSize: 9.5, color: T.accentLt }}>100% CUSTOM</span>
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
const PHILOSOPHY = [
  { n: "01", label: "Vision",       text: "Mi bastano poche parole per mappare l'intera struttura del tuo business. Questa lettura immediata, unita a un pensiero creativo profondo, mi permette di decodificare la tua visione commerciale e tradurla subito in un'architettura digitale ad altissime prestazioni." },
  { n: "02", label: "Performance",  text: "Fondo l'eleganza del minimalismo visivo con prestazioni frontend eccezionali. Ogni riga di codice, ogni layout e ogni campagna hanno un solo scopo: eliminare il superfluo, massimizzare la conversione e dominare il posizionamento di mercato." },
  { n: "03", label: "AI + Code",    text: "Integro l'AI in ogni fase — dallo sviluppo alla SEO. Scrivo codice più pulito, testo più a fondo e consegno infrastrutture complesse a una velocità semplicemente fuori portata per un'agenzia tradizionale." },
]

function PhilosophySection() {
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">

        {/* header row */}
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 64, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Kicker index="03" text="The Approach" />
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(32px, 3.8vw, 56px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              THE APPROACH
            </h2>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", color: T.faint, paddingBottom: 6 }}>3 principi · Studio NM</span>
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
                background: hov
                  ? "rgba(46,76,95,0.55)"
                  : "rgba(46,76,95,0.28)",
                backdropFilter: hov ? "blur(14px)" : "blur(6px)",
                WebkitBackdropFilter: hov ? "blur(14px)" : "blur(6px)",
                boxShadow: hov ? "inset 0 1px 0 rgba(255,255,255,0.10), 0 6px 28px rgba(0,0,0,0.22)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
                transition: "background .35s, box-shadow .35s, backdrop-filter .35s",
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
                  <p style={{ fontSize: "clamp(14px, 1.2vw, 16px)", color: T.muted, lineHeight: 1.9, fontWeight: 300, margin: 0 }}>{p.text}</p>
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
//PLACEHOLDER process steps — replace durations/copy with real workflow
const PROCESS = [
  { n: "01", title: "Scoping & Strategia",     metric: "3–5",  metricLabel: "giorni di analisi",      dur: "3–5 giorni", desc: "Analizziamo obiettivi, target e vincoli. Definisco architettura e roadmap tecnica prima di scrivere una riga di codice." },
  { n: "02", title: "UI/UX Design",            metric: "1–2",  metricLabel: "settimane di design",    dur: "1–2 sett.",  desc: "Concept UI premium in Framer. Scegli la direzione, la rifinisco fino al pixel garantendo un'esperienza sartoriale." },
  { n: "03", title: "Sviluppo & Engineering",  metric: "2–4",  metricLabel: "settimane di sviluppo", dur: "2–4 sett.",  desc: "Codice frontend pulito, performante e scalabile. Test rigorosi ad ogni step per un'infrastruttura solida." },
  { n: "04", title: "Launch & Growth",         metric: "24/7", metricLabel: "growth continuo",        dur: "Ongoing",    desc: "Go-live, SEO tecnica e campagne. Ottimizzazione continua sulla conversione per scalare il fatturato." },
]

function ProcessCard({ p, i }: { p: typeof PROCESS[number]; i: number }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: i * 0.09, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      animate={{ y: hov ? -3 : 0 }}
      style={{
        position: "relative", borderRadius: 16, overflow: "hidden",
        padding: "26px 24px 24px",
        borderTop:    `1px solid ${hov ? "rgba(224,224,224,0.55)" : "rgba(224,224,224,0.22)"}`,
        borderRight:  `1px solid ${hov ? "rgba(140,53,37,.55)" : "rgba(255,255,255,0.12)"}`,
        borderBottom: `1px solid ${hov ? "rgba(140,53,37,.55)" : "rgba(255,255,255,0.08)"}`,
        borderLeft:   `1px solid ${hov ? "rgba(140,53,37,.55)" : "rgba(255,255,255,0.12)"}`,
        background: hov ? "rgba(255,255,255,.58)" : "rgba(255,255,255,.50)",
        backdropFilter: "blur(36px) saturate(1.1)",
        WebkitBackdropFilter: "blur(36px) saturate(1.1)",
        boxShadow: hov
          ? "inset 0 1.5px 0 rgba(255,255,255,0.95), inset 1px 0 0 rgba(255,255,255,0.35), 0 20px 50px rgba(0,0,0,0.22)"
          : "inset 0 1.5px 0 rgba(255,255,255,0.80), inset 1px 0 0 rgba(255,255,255,0.22), 0 12px 36px rgba(0,0,0,0.16)",
        display: "flex", flexDirection: "column",
        transition: "background .3s, border-color .3s, box-shadow .3s",
      }}>

      {/* rim-light shimmer */}
      <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, transparent 55%)", pointerEvents: "none" }} />

      {/* corner brackets — brick */}
      <span aria-hidden style={{ position: "absolute", top: 9, left: 9, width: 10, height: 10, borderTop: "1.5px solid rgba(140,53,37,.55)", borderLeft: "1.5px solid rgba(140,53,37,.55)" }} />
      <span aria-hidden style={{ position: "absolute", bottom: 9, right: 9, width: 10, height: 10, borderBottom: "1.5px solid rgba(140,53,37,.55)", borderRight: "1.5px solid rgba(140,53,37,.55)" }} />

      {/* [01] tag */}
      <div style={{ position: "relative", fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: T.accentLt, marginBottom: 14 }}>[{p.n}]</div>

      {/* brick metric */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(34px, 5vw, 50px)", letterSpacing: "-0.04em", color: T.accentLt, lineHeight: 1 }}>{p.metric}</div>
        <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.accentLt, marginTop: 8, opacity: 0.80 }}>{p.metricLabel}</div>
      </div>

      {/* title */}
      <h3 style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, lineHeight: 1.25, margin: "0 0 10px", color: "#1A1410" }}>{p.title}</h3>

      {/* body */}
      <p style={{ position: "relative", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.68, color: "rgba(36,29,24,.68)", margin: 0, flex: 1 }}>{p.desc}</p>
    </motion.div>
  )
}

function ProcessSection() {
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
          }}>PROCESSO</div>

          <Kicker index="04" text="Il Processo" />

          {/* typographic composition */}
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.26em", color: "rgba(255,255,255,0.50)", marginBottom: 10, textTransform: "uppercase" as const }}>Il tuo</div>

            {/* outlined */}
            <motion.div
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(50px, 8.5vw, 116px)", lineHeight: 0.88, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.50)", userSelect: "none" }}>
              PROSSIMO
            </motion.div>

            {/* solid */}
            <motion.div
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.18, ease }}
              style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(50px, 8.5vw, 116px)", lineHeight: 0.88, letterSpacing: "-0.05em", color: "#FFFFFF", userSelect: "none" }}>
              PRODOTTO
            </motion.div>

            {/* "parte da qui" light */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.30, ease }}
              style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(20px, 2.4vw, 34px)", color: "rgba(255,255,255,0.68)", letterSpacing: "-0.02em" }}>
              parte da qui
              <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} style={{ fontSize: 22, color: "rgba(255,255,255,0.25)" }}>→</motion.span>
            </motion.div>

            {/* attributes row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.42, ease }}
              style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.09)" }}>
              {(["strategico", "elegante", "redditizio"] as const).map((w, i) => (
                <React.Fragment key={w}>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: i === 2 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.55)" }}>{w}</span>
                  {i < 2 && <span aria-hidden style={{ margin: "0 22px", width: 1, height: 12, background: "rgba(255,255,255,0.15)", display: "inline-block" }} />}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* 2×2 card grid */}
        <div className="abt-process-cards">
          {PROCESS.map((p, i) => <ProcessCard key={i} p={p} i={i} />)}
        </div>
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

const TOOLKIT_SLUGS = ["design_thinking", "ecommerce_eng", "web_mobile_ai", "acquisition_growth"]

function ToolkitPanel({ data, i }: { data: typeof TOOLKIT[number]; i: number }) {
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
        background: hov ? "rgba(0,0,0,0.50)" : "rgba(0,0,0,0.36)",
        border: `1px solid rgba(255,255,255,${hov ? 0.13 : 0.07})`,
        boxShadow: hov
          ? "0 24px 60px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 8px 24px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04)",
        fontFamily: MONO, display: "flex", flexDirection: "column",
        transition: "background .3s, border-color .3s, box-shadow .35s",
      }}>

      {/* title bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 16px 11px", borderBottom: `1px solid rgba(255,255,255,${hov ? 0.09 : 0.05})`, background: "rgba(255,255,255,0.025)", flexShrink: 0 }}>
        {["#FF5F57","#FEBC2E","#10B981"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: hov ? 0.88 : 0.52, transition: "opacity .3s" }} />
        ))}
        <span style={{ marginLeft: "auto", fontSize: 9.5, letterSpacing: "0.14em", color: "rgba(255,255,255,0.26)", textTransform: "uppercase" as const }}>
          {data.num} -- {slug}
        </span>
      </div>

      {/* terminal body */}
      <div style={{ padding: "16px 18px 20px", flex: 1, fontSize: 12.5, lineHeight: 1.85 }}>
        {/* command line */}
        <div style={{ marginBottom: 10 }}>
          <span style={{ color: "rgba(255,255,255,0.30)" }}>$ </span>
          <span style={{ color: "rgba(255,255,255,0.85)" }}>{cmd}</span>
        </div>
        {/* output — category title */}
        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.25, delay: 0.1 + i * 0.05 }}
          style={{ color: hov ? T.accentLt : LT(0.70), fontWeight: 500, marginBottom: 10, transition: "color .3s" }}>
          {data.title}
        </motion.div>
        {/* skills */}
        {data.items.map((item, ii) => (
          <motion.div key={item}
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.22, delay: 0.18 + i * 0.05 + ii * 0.07 }}
            style={{ color: "rgba(255,255,255,0.72)", paddingLeft: 16, lineHeight: 1.75, fontSize: 12 }}>
            {item}
          </motion.div>
        ))}
        {/* blinking cursor after last item */}
        {inView && <span className="abt-caret" style={{ marginLeft: 16 }} />}
      </div>

      {/* footer */}
      <div style={{ padding: "10px 18px 12px", borderTop: `1px solid rgba(255,255,255,${hov ? 0.08 : 0.04})`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.015)", flexShrink: 0 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.12em", color: hov ? T.accentLt : LT(0.50), transition: "color .3s" }}>{data.num}</span>
        <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)" }}>{data.items.length} capabilities</span>
      </div>
    </motion.div>
  )
}

function ToolkitSection() {
  return (
    <section className="abt-section-pad" style={{ padding: "120px 0", position: "relative", borderTop: `1px solid ${T.border}` }}>
      <div className="abt-wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 64 }}>
          <div>
            <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
              <Kicker index="05" text="Core Capabilities" />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.08, ease }}
              style={{ fontFamily: DISPLAY, fontSize: "clamp(30px, 4vw, 60px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              TECH TOOLKIT
            </motion.h2>
          </div>
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", color: T.faint, paddingBottom: 6 }}>
            4 aree · 24 competenze
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
const FAQS = [
  { q: "Cosa significa lavorare con un \"Digital Architect\"?", a: "Significa un solo punto di contatto per l'intero progetto: dall'analisi strategica iniziale allo sviluppo dell'interfaccia premium, dal codice frontend alla SEO e al growth marketing. Niente intermediari, niente colli di bottiglia — solo esecuzione diretta." },
  { q: "Ti occupi anche di acquisizione traffico e advertising?", a: "Sì. Un prodotto eccezionale ha bisogno di visibilità eccezionale. Integro la SEO avanzata basata su AI fin dalla progettazione e gestisco campagne ad alto budget su Google Ads e Meta Ads, con funnel completi per la lead generation B2B e la vendita e-commerce." },
  { q: "Qual è il tuo stack tecnologico principale?", a: "React.js e Next.js con Tailwind CSS per web app e interfacce dinamiche. Expo e Supabase per mobile e backend agili. Per l'e-commerce ad alta scalabilità lavoro su Shopify Custom." },
  { q: "Come usi l'Intelligenza Artificiale nel flusso di lavoro?", a: "Uso AI-assisted coding di ultima generazione e modelli predittivi per SEO e advertising. Questo accelera in modo esponenziale scrittura del codice, analisi dei dati e ottimizzazione — consegno infrastrutture perfette in tempi ridotti." },
  { q: "Come gestisci tempi, costi e migrazioni?", a: "Ogni progetto parte da uno scoping tecnico accurato: timeline realistica (di solito da poche settimane a due mesi) e preventivo fisso. Per le piattaforme obsolete gestisco la migrazione verso Shopify preservando SEO, meta tag e dati storici." },
]

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
          style={{ flexShrink: 0, marginTop: 4, fontSize: 20, lineHeight: 1, color: open ? T.accentLt : "rgba(255,255,255,0.35)", transition: "color .3s" }}>
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.36, ease }}
            style={{ overflow: "hidden" }}>
            <p style={{ fontSize: "clamp(14px, 1.1vw, 15.5px)", color: T.muted, lineHeight: 1.88, margin: 0, fontWeight: 300, paddingLeft: 38, paddingBottom: 24 }}>{a}</p>
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
            <Kicker index="07" text="FAQ" />
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px, 3vw, 44px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.04em", color: T.text, margin: 0 }}>
              LOGICA&<br /><span style={{ color: "#FFFFFF" }}>TRASPARENZA</span>
            </h2>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, marginTop: 20, fontWeight: 300, maxWidth: 240 }}>
              Risposte dirette alle domande che contano davvero.
            </p>
          </motion.div>
          <div>
            {FAQS.map((faq, i) => <FAQItem key={i} {...faq} index={i} />)}
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
        style={{ width: "100%", maxWidth: 600, marginTop: "auto", marginBottom: "auto", flexShrink: 0, position: "relative", borderRadius: 20, background: "rgba(30,37,50,0.88)", backdropFilter: "blur(72px) brightness(1.12) saturate(0.80)", WebkitBackdropFilter: "blur(72px) brightness(1.12) saturate(0.80)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.08), 0 40px 100px rgba(0,0,0,0.65)", overflow: "hidden" } as React.CSSProperties}>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${OR(1)} 28%, ${T.accentLt} 72%, transparent)`, borderRadius: "24px 24px 0 0" }} />
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
                style={{ marginTop: 4, width: "100%", padding: 0, borderRadius: 12, cursor: "pointer", border: "1px solid rgba(176,74,56,0.80)", background: "linear-gradient(90deg, rgba(176,74,56,0.78) 0%, rgba(176,74,56,0.60) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0 36px rgba(140,53,37,0.22), inset 0 1px 0 rgba(255,255,255,0.12)", display: "flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO }}>
                <span style={{ padding: "14px 14px 14px 18px", borderRight: "1px solid rgba(140,53,37,0.45)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.85)" }}>[→]</span>
                <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#FFFFFF", padding: "14px 0" }}>Invia Richiesta →</span>
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
   SITE FOOTER — identical to main page
══════════════════════════════════════════════════════════════════════════ */
const FOOTER_NAV_ABT = [
  { label: "Servizi",    href: "/#s3" },
  { label: "Soluzioni",  href: "/#s4" },
  { label: "Risultati",  href: "/#s5" },
  { label: "Metodo",     href: "/#s8" },
  { label: "Contatti",   href: "/#s9" },
]
const FOOTER_SOCIALS_FULL = [
  { label: "LinkedIn",  href: "https://linkedin.com/in/nadiamaar",        Icon: LinkedinIcon  },
  { label: "GitHub",    href: "https://github.com/nadiamaar-dev",          Icon: GithubIcon    },
  { label: "Instagram", href: "https://instagram.com/nadiamaar.dev",       Icon: InstagramIcon },
  { label: "Discord",   href: "https://discord.gg/nadiamaar",              Icon: DiscordIcon   },
]
/* ══════════════════════════════════════════════════════════════════════════
   §8  FINAL CTA
══════════════════════════════════════════════════════════════════════════ */
function FinalCTA({ onOpenModal }: { onOpenModal: () => void }) {
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
          HAI QUALCOSA<br /><span style={{ color: "#FFFFFF" }}>DA COSTRUIRE?</span>
        </motion.h2>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.70, delay: 0.18, ease }}
          style={{ display: "flex", justifyContent: "center" }}>
          <PillCTA label="Iniziamo a parlarne" onClick={onOpenModal} />
        </motion.div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MAAR WATERMARK — центральный, как на главной
══════════════════════════════════════════════════════════════════════════ */
function MaarWatermark() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0.04, 0.14, 0.86, 0.96], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0.04, 0.96], ["3%", "-3%"])
  return (
    <motion.div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", opacity }}>
      <motion.span style={{ y, fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(110px, 30vw, 460px)", letterSpacing: "-0.05em", lineHeight: 1, color: "rgba(74,94,118,0.15)", filter: "blur(1px)", userSelect: "none", whiteSpace: "nowrap" }}>MAAR</motion.span>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   GEO DECORATION — мелкие фигуры и надписи как на главной
══════════════════════════════════════════════════════════════════════════ */
function GeoDecoration() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
        {/* большой круг — левый верх */}
        <circle cx="9%" cy="18%" r="160" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <circle cx="9%" cy="18%" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        {/* диагональная линия */}
        <line x1="70%" y1="0%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        {/* повёрнутый квадрат — правый низ */}
        <rect x="80%" y="65%" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" transform="rotate(18,850,720)"/>
        {/* крестик */}
        <line x1="86%" y1="28%" x2="86%" y2="35%" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
        <line x1="83%" y1="31.5%" x2="89%" y2="31.5%" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
        {/* горизонтальная метка слева */}
        <line x1="0%" y1="55%" x2="14%" y2="55%" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      </svg>
      {/* мелкие mono-надписи */}
      <span style={{ position: "absolute", left: 18, top: "14%", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.12)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>About / Studio · 2026</span>
      <span style={{ position: "absolute", right: 18, top: "22%", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.10)", writingMode: "vertical-rl" }}>Digital Architect · NM</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════════════════════ */
export default function NadiaMaarAbout() {
  const [modalOpen, setModalOpen] = useState(false)

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
      background: "#233D4D", color: T.text,
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
        <PhilosophySection />
        <ProcessSection />
        <ToolkitSection />
        <FAQSection />
        <FinalCTA onOpenModal={() => setModalOpen(true)} />
      </div>
      <Footer onContact={() => setModalOpen(true)} />
    </div>
  )
}
