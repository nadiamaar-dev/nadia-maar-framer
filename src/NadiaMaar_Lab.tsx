/**
 * NadiaMaar_Framer.tsx — Single-file Framer component
 * Paste this file into Framer → Assets → Code → New File
 * Requires: framer-motion (built-in in Framer)
 * No external dependencies.
 */

import React, { useRef, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import Background from "./components/Background"
import Footer from "./components/Footer"
import FloatingContact from "./components/FloatingContact"
import Header from "./components/Header"
import FoundryConfigurator from "./components/foundry/FoundryConfigurator"
import { PROCESSO } from "./data/process"

/* ══════════════════════════════════════════════════════════════════════════
   INLINE SVG ICONS (replaces lucide-react)
══════════════════════════════════════════════════════════════════════════ */
const XIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
  body { font-family: 'Space Grotesk', system-ui, sans-serif; }
  p, li { font-weight: 300; line-height: 1.75; }
  button, a[role="button"], .rainbow-btn { font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; }
  ::placeholder { color: rgba(255,255,255,0.22) !important; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0F1624; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
  html { scroll-behavior: smooth; }

  @media (max-width: 600px) {
    .contact-modal-content { padding: 20px 18px 24px !important; }
    .contact-modal-grid { grid-template-columns: 1fr !important; }
  }

  :root { --x:-9999; --y:-9999; --xp:0; --yp:0; }

  /* neon accent text — solid color, no glow */
  [style*="color: #F53E56"],
  [style*='color: "#F53E56"'],
  [style*="color: #F53E56"],
  [style*='color: "#F53E56"'] {
    color: #F53E56 !important;
  }
  [style*="color: #EE3A52"],
  [style*='color: "#EE3A52"'],
  [style*="color: #EE3A52"],
  [style*='color: "#EE3A52"'] {
    color: #EE3A52 !important;
  }

  [data-glow] {
    --border-size: calc(var(--border,1.5) * 1px);
    --spotlight-size: calc(var(--size,260) * 1px);
    --hue: calc(var(--base,28) + (var(--xp,0) * var(--spread,40)));
    background-image: radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(var(--hue) 24% 82% / var(--bg-spot-opacity,0.05)),
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
      hsl(var(--hue) 26% 74% / var(--border-spot-opacity,0.50)),
      transparent 100%
    );
    filter: brightness(2);
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.4) calc(var(--spotlight-size) * 0.4) at
      calc(var(--x,-9999) * 1px) calc(var(--y,-9999) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity,0.22)),
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
      rgba(255,60,92,0.45), rgba(255,60,92,0.20), rgba(255,70,100,0.35), rgba(255,60,92,0.15),
      rgba(255,60,92,0.45), rgba(255,60,92,0.20), rgba(255,70,100,0.35), rgba(255,60,92,0.15));
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

  /* Soluzioni grid — desktop (6-col base) */
  .hp-soluzioni-grid > div:nth-child(1) { grid-column: span 4; }
  .hp-soluzioni-grid > div:nth-child(2) { grid-column: span 2; }
  .hp-soluzioni-grid > div:nth-child(3) { grid-column: span 2; }
  .hp-soluzioni-grid > div:nth-child(4) { grid-column: span 2; }
  .hp-soluzioni-grid > div:nth-child(5) { grid-column: span 2; }

  @media (max-width: 1024px) {
    .hp-hero-grid { grid-template-columns: 1fr !important; }
    .hp-hero-visual { display: none !important; }
    .hp-hero-cards-desktop { display: none !important; }
    .hp-hero-cards-mobile { display: flex !important; flex-direction: column; gap: 12px; margin-top: 32px; }
    .hp-stat-card { padding: 14px 16px !important; border-radius: 14px !important; max-width: 300px; }
    .hp-stat-icon { font-size: 18px !important; }
    .hp-stat-title { font-size: 13px !important; margin-bottom: 3px !important; }
    .hp-stat-desc { font-size: 11px !important; }
    .hp-skillcards { grid-template-columns: repeat(2, 1fr) !important; }
    .hp-soluzioni-grid { grid-template-columns: repeat(4, 1fr) !important; }
    .hp-soluzioni-grid > div:nth-child(1),
    .hp-soluzioni-grid > div:nth-child(2),
    .hp-soluzioni-grid > div:nth-child(3),
    .hp-soluzioni-grid > div:nth-child(4) { grid-column: span 2 !important; }
    .hp-soluzioni-grid > div:nth-child(5) { grid-column: 1 / -1 !important; }
  }

  /* ── Tablet (768–1024): sections keep 2-col, only targeted adjustments ── */
  @media (max-width: 1024px) {
    .hp-wrap { padding: 0 28px !important; }
    .hp-sec { padding: 64px 0 !important; position: relative; z-index: 1; }
    .hp-hero { padding: 48px 0 !important; min-height: auto !important; }
    .hp-nav-desktop { display: none !important; }
    .hp-nav-burger { display: flex !important; }
    .hp-datetime { display: none !important; }
    .hp-skillcards { grid-template-columns: repeat(2, 1fr) !important; }
    .hp-soluzioni-grid { grid-template-columns: repeat(4, 1fr) !important; }
    .hp-soluzioni-grid > div:nth-child(1),
    .hp-soluzioni-grid > div:nth-child(2),
    .hp-soluzioni-grid > div:nth-child(3),
    .hp-soluzioni-grid > div:nth-child(4) { grid-column: span 2 !important; }
    .hp-soluzioni-grid > div:nth-child(5) { grid-column: 1 / -1 !important; }
    .hp-method-row-num { font-size: 40px !important; width: 58px !important; }
    .hp-method-expanded-inner { padding-left: 110px !important; }
    .hp-allinone-desktop { display: grid !important; }
  }

  /* ── Mobile (<768px): everything 1-col ─────────────────────── */
  @media (max-width: 768px) {
    /* Light 300 loses too much stroke on a dark screen: white-on-dark reads
       thinner than the same weight on white. Regular 400 puts ~27% more ink
       on the glyphs, which is the same gain as going to 18px but without
       making every text block 13% taller. Declared later in this sheet than
       the "p, li" weight-300 rule above, so it wins without !important. */
    p, .hp-body { font-weight: 400; }
    .hp-grid-2 { grid-template-columns: 1fr !important; gap: 40px !important; }
    .hp-grid-3 { grid-template-columns: 1fr !important; gap: 16px !important; }
    .hp-skills-grid { grid-template-columns: 1fr !important; }
    .hp-wrap { padding: 0 20px !important; }
    .hp-sec { padding: 56px 0 !important; }
    .hp-hero { padding: 36px 0 !important; min-height: auto !important; }
    .hp-brand-text { display: none !important; }
    .hp-dt-date { font-size: 9.5px !important; }
    .hp-dt-time { font-size: 11px !important; }
    .hp-hero-ctas-wrap { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
    .hp-hero-ctas { flex-wrap: nowrap !important; align-items: center !important; gap: 6px !important; }
    .hp-hero-primary-btn { flex: 0 0 auto !important; }
    .hp-hero-social-icons { width: 100% !important; justify-content: center !important; }
    .hp-method-row-num { font-size: 26px !important; width: 40px !important; }
    .hp-method-row-accent { width: 16px !important; }
    .hp-method-row-title { font-size: 14px !important; }
    /* body copy stays at 16px on phones — !important beats the inline size */
    .hp-body { font-size: 16px !important; }
    .hp-method-body { font-size: 16px !important; line-height: 1.6 !important; }
    .hp-method-expanded-inner { padding-left: 0 !important; grid-template-columns: 1fr !important; gap: 14px !important; padding-bottom: 16px !important; }
    .hp-method-visual { min-height: unset !important; max-height: unset !important; aspect-ratio: 16/9 !important; }
    .hp-skillcards { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
    .hp-soluzioni-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
    .hp-soluzioni-grid > div:nth-child(n) { grid-column: 1 / -1 !important; }
    .hp-sol-card { flex-direction: row !important; align-items: flex-start !important; padding: 16px !important; }
    .hp-sol-card-head { flex-direction: column !important; align-items: center !important; margin-bottom: 0 !important; margin-right: 14px !important; gap: 8px !important; flex-shrink: 0 !important; width: 42px !important; }
    .hp-sol-card-num { display: none !important; }
    .hp-sol-card-body { flex: 1 !important; }
    .hp-sol-card-title { font-size: 15px !important; margin-bottom: 8px !important; }
    .hp-sol-card-desc { font-size: 16px !important; margin-bottom: 12px !important; }
    .hp-diagnosi-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
    .hp-diagnosi-col-headers { display: none !important; }
    .hp-diagnosi-row { grid-template-columns: 1fr !important; }
    .hp-diagnosi-row > div:nth-child(2) { display: none !important; }
    .hp-diagnosi-row > div:first-child { border-radius: 16px 16px 0 0 !important; border-right: 1px solid rgba(255,255,255,0.20) !important; border-bottom: none !important; }
    .hp-diagnosi-row > div:last-child { border-radius: 0 0 16px 16px !important; border-left: 1px solid rgba(255,255,255,0.20) !important; border-top: none !important; }
    .hp-allinone-desktop { display: none !important; }
    .hp-allinone-mobile { display: block !important; }
    .hp-tech-card { padding: 10px 12px !important; border-radius: 10px !important; }
    .hp-tc-top { margin-bottom: 0 !important; }
    .hp-tc-metric { font-size: 15px !important; }
    .hp-tc-icon { width: 24px !important; height: 24px !important; border-radius: 6px !important; }
    .hp-tc-icon svg { width: 12px !important; height: 12px !important; }
    .hp-tc-title { font-size: 11px !important; margin-bottom: 2px !important; }
    .hp-tc-body { font-size: 16px !important; margin-bottom: 8px !important; line-height: 1.5 !important; }
    .hp-tc-score > div:first-child { margin-bottom: 3px !important; }
    .hp-grid-3 { gap: 7px !important; }
    .hp-purche-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
    .hp-tech-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .hp-contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .hp-contact-row { grid-template-columns: 1fr !important; }
    .hp-footer-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
    .hp-footer-brand { margin-bottom: 32px !important; padding-bottom: 32px !important; border-bottom: 1px solid rgba(255,255,255,0.012) !important; }
    .hp-footer-brand-desc { display: none !important; }
    .hp-footer-nav-col { display: none !important; }
    .hp-footer-contact-col { display: none !important; }
    .hp-hero-live-cards { display: none !important; }
    .hp-risultati-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
    .hp-risultati-grid > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.012); padding: 28px 0 !important; }
    .hp-risultati-grid > div:last-child { border-bottom: none; }
    .hp-risultati-row { gap: 10px 0 !important; flex-direction: column !important; align-items: center !important; text-align: center; }
    .hp-risultati-item { gap: 5px !important; align-items: baseline; }
    .hp-risultati-value { font-size: 18px !important; }
    .hp-risultati-label { font-size: 11px !important; }
    .hp-risultati-sep { display: none !important; }
    .hp-skillcard { padding: 14px !important; aspect-ratio: auto !important; }
    .hp-skillcard h3 { font-size: 13px !important; }
    .hp-skillcard-icon { width: 30px !important; height: 30px !important; border-radius: 8px !important; }
  }

  @media (max-width: 768px) {
    .hp-hero-badge { max-width: 100%; padding: 6px 13px 6px 10px !important; flex-wrap: wrap; }
    .hp-hero-badge-text { white-space: normal !important; letter-spacing: 0.09em !important; font-size: 9px !important; line-height: 1.55; }
  }

  @media (max-width: 480px) {
    .hp-hero-badge-text { letter-spacing: 0.06em !important; font-size: 8.5px !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ── TechRow cards: mobile layout (<680px) ── */
  @media (max-width: 680px) {
    .hp-tech-row  { flex-wrap: wrap !important; }
    .hp-tech-stripe {
      order: 0;
      width: 100% !important; height: 3px !important;
      border-radius: 14px 14px 0 0 !important;
    }
    .hp-tech-metric {
      order: 1;
      flex: 1 1 auto !important; min-width: 0 !important;
      border-right: none !important;
      flex-direction: row !important; align-items: center !important;
      justify-content: flex-start !important; gap: 16px !important;
      padding: 16px 18px !important;
    }
    .hp-tech-metric-progress { flex: 1; }
    .hp-tech-ring {
      order: 2;
      border-left: none !important;
      padding: 16px 18px 16px 0 !important;
      align-self: center !important;
    }
    .hp-tech-content {
      order: 3;
      width: 100% !important; flex: 0 0 100% !important;
      border-top: 1px solid rgba(255,255,255,0.07) !important;
      padding: 14px 18px 18px !important;
    }
    .hp-tech-metric span:first-child { font-size: 26px !important; }
  }

  html { overflow-x: hidden; max-width: 100%; }
  body { overflow-x: clip; max-width: 100%; touch-action: pan-y; }
  #root { overflow-x: clip; }

  .hp-hero-h1 { text-wrap: balance; }
  /* Delicate two-layer lift on section titles — navy-tinted to match the page atmosphere */
  h2 { text-wrap: balance; text-shadow: 0 1px 2px rgba(8,12,28,0.32), 0 4px 16px rgba(8,12,28,0.24); }

  @keyframes label-shimmer {
    0%   { border-color: rgba(70,90,108,0.30); }
    33%  { border-color: rgba(70,90,108,0.38); }
    66%  { border-color: rgba(52,170,135,0.28); }
    100% { border-color: rgba(70,90,108,0.30); }
  }
  .label-shimmer { animation: label-shimmer 3s ease-in-out infinite; }
`

/* ══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#060C18",
  bg2:       "#060C18",
  surface:   "#050915",
  raised:    "#0F1624",
  border:    "rgba(70,90,108,0.22)",
  borderHi:  "rgba(16,185,129,0.42)",
  text:      "#FFFFFF",
  muted:     "#FFFFFF",
  faint:     "#FFFFFF",
  accent:    "#EE3A52",
  accentDim: "rgba(255,255,255,0.09)",
  accentGlo: "rgba(255,60,92,0.55)",
  accentLt:  "#F53E56",
  green:     "#10B981",
  greenGlo:  "rgba(16,185,129,0.28)",
  // neutral card system (contrast + variety)
  steel:     "rgba(255,255,255,0.055)",
  steelHi:   "rgba(255,255,255,0.16)",
  silver:    "rgba(16,185,129,0.92)",
} as const

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
const SANS = "'Geist', 'Space Grotesk', system-ui, sans-serif"
const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"
/* Glass card system */
const G = {
  bg:        "rgba(70,90,108,0.09)",
  bgHov:     "rgba(70,90,108,0.16)",
  bd:        "rgba(70,90,108,0.28)",
  bdHov:     "rgba(70,90,108,0.52)",
  blur:      "blur(12px) brightness(1.05) saturate(1.0)",
  shadow:    "inset 0 1px 0 rgba(255,255,255,0.63), 0 24px 64px rgba(8,12,28,0.55), 0 4px 14px rgba(8,12,28,0.35)",
  shadowHov: "inset 0 1px 0 rgba(255,255,255,0.72), 0 32px 80px rgba(8,12,28,0.70), 0 6px 18px rgba(8,12,28,0.42)",
} as const
const WRAP: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" }
const SEC: React.CSSProperties  = { padding: "80px 0", position: "relative" }

/* ══════════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════════════════════ */
/* Una sola scrollIntoView non basta su questa pagina: mentre lo scorrimento
   morbido è in corso, le sezioni che entrano in vista si compongono e l'altezza
   sopra il bersaglio cambia. Il risultato era che il configuratore si fermava
   circa mezzo schermo più in basso del previsto. Le passate successive
   correggono la deriva e non fanno nulla quando la posizione è già giusta. */
function scrollToSection(id: string) {
  const go = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  go()
  window.setTimeout(go, 700)
  window.setTimeout(go, 1500)
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  )
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

const HERO_SOCIALS = [
  { Icon: GithubIcon,    href: "https://github.com/nadiamaar-dev",          label: "GitHub"    },
  { Icon: LinkedinIcon,  href: "https://linkedin.com/in/nadiamaar",          label: "LinkedIn"  },
  { Icon: InstagramIcon, href: "https://instagram.com/nadiamaar.dev",        label: "Instagram" },
  { Icon: DiscordIcon,   href: "https://discord.gg/nadiamaar",               label: "Discord"   },
]

/* ══════════════════════════════════════════════════════════════════════════
   §1  HERO — editorial (POSSESSD-style)
══════════════════════════════════════════════════════════════════════════ */

/* Hero availability block.
   The right column used to state availability three times (SYS_STATUS,
   the metric label, and a STATUS row) and E-commerce twice, behind seven
   uppercase mono labels. That repetition was the clutter. One status line,
   one metric, done. */
function HeroLiveCards({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="hp-hero-live-cards hp-av">
      <style>{`
        .hp-av { position:relative; }
        /* the global button rule forces uppercase + mono; opt this one out so
           each child can state its own casing */
        .hp-av-in { display:block; width:100%; text-align:left; cursor:pointer;
          background:none; border:0; padding:0; font-family:inherit; color:${T.text};
          text-transform:none; letter-spacing:normal; font-size:inherit; }

        .hp-av-status { display:inline-flex; align-items:center; gap:8px;
          font-family:${MONO}; font-size:10px; letter-spacing:0.20em;
          text-transform:uppercase; color:${T.green}; }

        .hp-av-val { margin-top:16px; font-family:${DISPLAY}; font-size:78px;
          font-weight:800; letter-spacing:-0.045em; line-height:0.80; color:#FFFFFF;
          display:flex; align-items:baseline;
          font-variant-numeric:tabular-nums; font-feature-settings:"tnum" 1;
          transition:transform .34s cubic-bezier(0.16,1,0.3,1); }
        .hp-av-in:hover .hp-av-val { transform:translateX(4px); }

        /* outlined digits: the same treatment the hero gives "Digital Strategist" */
        .hp-av-n { color:transparent;
          -webkit-text-stroke:1.5px rgba(240,243,249,0.88);
          transition:color .32s cubic-bezier(0.16,1,0.3,1); }
        .hp-av-in:hover .hp-av-n { color:rgba(240,243,249,0.16); }
        /* operator optically centred on the digits' cap band, measured against
           the baseline rather than left sitting on it */
        .hp-av-lt { font-size:30px; font-weight:500; letter-spacing:0;
          color:${T.accentLt}; margin-right:10px; transform:translateY(-0.49em); }
        .hp-av-u  { font-family:${DISPLAY}; font-size:26px; font-weight:500;
          letter-spacing:-0.02em; margin-left:5px; color:rgba(255,255,255,0.50); }

        .hp-av-cap { margin-top:9px; font-family:${MONO}; font-size:10px;
          letter-spacing:0.14em; text-transform:uppercase;
          color:rgba(255,255,255,0.60); }
        .hp-av-in:hover .hp-av-cap { color:${T.accentLt}; }

        @media (prefers-reduced-motion: reduce) {
          .hp-av-val { transition:none !important; }
        }
      `}</style>

      <button className="hp-av-in" onClick={onOpen}
        aria-label="Disponibile: apri il form di contatto">
        <span className="hp-av-status">
          <PingDot color={T.green} size={6} />
          Disponibile
        </span>

        <div className="hp-av-val">
          <span className="hp-av-lt">&lt;</span>
          <span className="hp-av-n">24</span>
          <span className="hp-av-u">h</span>
        </div>
        <div className="hp-av-cap">Tempo di risposta</div>
      </button>
    </div>
  )
}

function Hero() {
  const [formOpen, setFormOpen] = useState(false)
  return (
    <section style={{ ...SEC, minHeight: 800, display: "flex", alignItems: "center", overflow: "clip", position: "relative" }} id="s1" className="hp-sec hp-hero">
      <style>{`
        .hp-hero-wordmark { position:absolute; right:14px; top:44px; z-index:0; pointer-events:none; writing-mode:vertical-rl; transform:rotate(180deg); font-family:${DISPLAY}; font-weight:900; font-size:clamp(150px,15vw,214px); letter-spacing:-0.04em; line-height:0.84; white-space:nowrap; color:rgba(255,255,255,0.018); -webkit-text-stroke:1px rgba(255,255,255,0.09); filter:blur(1px); user-select:none; }
        @media(max-width:1024px){.hp-hero-wordmark{display:none}}
        .hp-hero-nm { position:absolute; left:24px; bottom:34px; z-index:1; display:flex; align-items:center; gap:11px; }
        .hp-hero-nm .nm-l { font-family:${DISPLAY}; font-weight:800; font-size:16px; letter-spacing:0.04em; color:#fff; }
        .hp-hero-nm .nm-c { font-family:${MONO}; font-size:8px; letter-spacing:0.16em; text-transform:uppercase; color:#FFFFFF; line-height:1.6; }
        .hp-hero-social-below { display:none; }

        /* ── Process flow timeline ── */
        .hp-hero-flow { position:relative; display:flex; align-items:flex-start; width:100%; margin-top:30px; }
        .hp-hero-flow::after { content:''; position:absolute; left:16px; right:16px; top:20px; height:1px; background:linear-gradient(90deg,rgba(255,255,255,0.30) 0%,rgba(255,255,255,0.08) 100%); pointer-events:none; }
        .hp-flow-step { position:relative; display:flex; flex-direction:column; align-items:center; flex:1; z-index:1; gap:0; }
        .hp-flow-num   { font-family:${MONO}; font-size:8px; letter-spacing:0.16em; margin-bottom:4px; }
        .hp-flow-dot   { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
        .hp-flow-label { font-family:${MONO}; font-size:8.5px; letter-spacing:0.14em; text-transform:uppercase; margin-top:8px; white-space:nowrap; }
        .hp-hero-squares { position:absolute; left:20px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:24px; z-index:0; }
        .hp-hero-ticker { position:absolute; right:22px; top:96px; display:flex; flex-direction:column; gap:20px; align-items:flex-end; z-index:1; }
        .hp-hero-ticker .tk { display:flex; align-items:center; gap:9px; }
        .hp-hero-ticker .tk-l { width:16px; height:1px; background:rgba(255,255,255,0.24); }
        .hp-hero-ticker .tk-l.on { width:24px; background:${T.accent}; }
        .hp-hero-ticker .tk-n { font-family:${MONO}; font-size:8.5px; letter-spacing:0.16em; color:#FFFFFF; min-width:16px; text-align:right; }
        .hp-hero-ticker .tk-n.on { color:${T.accentLt}; }
        .hp-hero-ed-grid { display:grid; grid-template-columns:1fr 300px; gap:48px; align-items:end; }
        .hp-hl { position:relative; display:inline-block; padding:24px 0 16px 0; }
        .hp-hl-corner { position:absolute; width:15px; height:15px; }
        .hp-hl-corner.tl { top:0; left:0; border-top:1px solid rgba(255,255,255,0.32); border-left:1px solid rgba(255,255,255,0.32); }
        .hp-hl-corner.br { bottom:0; right:0; border-bottom:1px solid rgba(255,255,255,0.32); border-right:1px solid rgba(255,255,255,0.32); }
        .hp-hl-tag { position:absolute; top:3px; left:26px; font-family:${MONO}; font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:#FFFFFF; }
        .hp-hl-dim { position:absolute; right:3px; bottom:2px; font-family:${MONO}; font-size:8.5px; letter-spacing:0.16em; color:#FFFFFF; }
        .hp-hero-meta { display:flex; flex-direction:column; gap:22px; }
        .hp-hero-head-row { display:flex; align-items:flex-start; gap:14px; }
        .hp-hero-social-vert { display:none; }
        .hp-hero-botnav { margin-top:46px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.20); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:18px; }
        .hp-hero-handle { font-family:${MONO}; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:#FFFFFF; text-decoration:none; transition:color 0.2s; }
        .hp-hero-handle:hover { color:#fff; }
        /* ── Ticker/wordmark/deco hide ──────────────────────── */
        @media (max-width:1280px){ .hp-hero-ticker{ display:none; } }
        @media (max-width:1024px){ .hp-hero-squares{ display:none; } .hp-hero-nm{ display:none; } }

        /* ── Tablet hero (768–1024): compact 2-col, no mobile layout ── */
        @media (max-width:1024px){
          .hp-hero-ed-grid{ grid-template-columns:1fr 260px !important; gap:24px !important; align-items:start; }
          .hp-hero-meta{ gap:14px; }
        }

        /* ── Mobile hero (<768px) ──────────────────────────────── */
        @media (max-width:768px){
          /* hero section — more breathing room */
          .hp-hero{ padding:68px 0 56px !important; }
          /* eyebrow */
          .hp-hero-eyebrow{ font-size:11px !important; letter-spacing:.10em !important; flex-wrap:wrap; line-height:1.6; }
          /* headline block */
          .hp-hl{ padding:22px 16px 20px !important; width:100%; box-sizing:border-box; }
          .hp-hl-tag{ font-size:7.5px !important; letter-spacing:.12em !important; left:14px !important; }
          .hp-hl-dim{ display:none !important; }
          .hp-hero-h1{ font-size:44px !important; line-height:0.93 !important; letter-spacing:-0.04em !important; }
          /* description */
          .hp-hero-desc{ margin-top:32px !important; font-size:16px !important; line-height:1.8 !important; max-width:100% !important; }
          /* grid */
          .hp-hero-ed-grid{ grid-template-columns:1fr !important; gap:0 !important; }
          .hp-hero-meta{ display:none !important; }
          /* head row — full width, no social beside title */
          .hp-hero-head-row{ gap:0; justify-content:flex-start; align-items:flex-start; }
          .hp-hero-social-vert{ display:none !important; }
          /* CTA — side by side on mobile */
          .hp-hero-cta-row{ flex-direction:row !important; flex-wrap:nowrap !important; max-width:100% !important; gap:8px !important; margin-top:40px !important; }
          .hp-hero-cta-row > button,
          .hp-hero-cta-row > a{ flex:1 1 0 !important; min-height:54px !important; }
          .hp-hero-cta-index{ display:none !important; }
          .hp-hero-cta-inner{ justify-content:center !important; gap:4px !important; font-size:12px !important; letter-spacing:0.09em !important; padding:0 10px !important; }
          .hp-hero-cta-row > a{ font-size:12px !important; letter-spacing:0.09em !important; padding:0 10px !important; gap:5px !important; }
          /* process flow mobile */
          .hp-hero-flow{ margin-top:32px !important; }
          .hp-flow-label{ font-size:7.5px !important; letter-spacing:0.10em !important; }
          /* social below CTAs */
          .hp-hero-social-below{ display:flex !important; justify-content:center !important; align-items:center; gap:14px; margin-top:26px; }
          .hp-hero-social-below a{ width:34px !important; height:34px !important; border-radius:9px !important; }
          /* stats */
          .hp-hero-botnav{ margin-top:44px; padding-top:22px; gap:8px; }
          .hp-hero-scroll{ display:none !important; }
        }
        /* ── Small phones (<400px) ── */
        @media (max-width:400px){
          .hp-hero-h1{ font-size:36px !important; line-height:0.92 !important; }
        }
      `}</style>



      {/* vertical MAAR — absolute in hero, scrolls away with section */}
      <div className="hp-hero-wordmark" aria-hidden>MAAR</div>

      {/* deco squares (POSSESSD signature) */}
      <div className="hp-hero-squares" aria-hidden>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 32, height: 32, border: "1.5px solid rgba(255,255,255,0.20)", borderRadius: 5 }} />)}
      </div>

      {/* small NM monogram + credit */}
      <div className="hp-hero-nm" aria-hidden>
        <span className="nm-l">NM</span>
        <span className="nm-c">Nadia Maar<br />Studio © 2026</span>
      </div>

      {/* right-edge numbered tickers (blueprint) */}
      <div className="hp-hero-ticker" aria-hidden>
        {["01", "02", "03", "04", "05"].map((n, i) => (
          <div className="tk" key={n}>
            <span className={`tk-n${i === 1 ? " on" : ""}`}>{n}</span>
            <span className={`tk-l${i === 1 ? " on" : ""}`} />
          </div>
        ))}
      </div>

      <div style={{ ...WRAP, width: "100%", minWidth: 0, boxSizing: "border-box", position: "relative", zIndex: 1 }} className="hp-wrap">
        {/* eyebrow */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} style={{ marginBottom: 24 }}>
          <div className="hp-hero-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 13, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
            <span style={{ color: T.accentLt }}>//</span>
            <span>[ Development · Performance Marketing ]</span>
          </div>
        </motion.div>

        {/* editorial grid: headline+credits | meta panel */}
        <div className="hp-hero-ed-grid">
          {/* MAIN */}
          <div>
            <div className="hp-hero-head-row">
              <div className="hp-hl">
                <span className="hp-hl-corner tl" />
                <span className="hp-hl-corner br" />
                <span className="hp-hl-tag">Fig. 01 — Identità</span>
                <span className="hp-hl-dim">72PT / DISPLAY</span>
                <motion.h1
                  className="hp-hero-h1"
                  initial={{ opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease }}
                  style={{ fontFamily: DISPLAY, fontSize: "clamp(42px, 5.4vw, 82px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.045em", margin: 0, color: "#FFFFFF", textTransform: "uppercase" as const, filter: "drop-shadow(0 12px 34px rgba(0,0,0,0.6))", textShadow: "0 4px 12px rgba(0, 0, 0, 0.8)" }}
                >
                  <span style={{ whiteSpace: "nowrap" }}>E&#8209;commerce</span><br />
                  <span>Architect</span><br />
                  <span>{"& "}</span>
                  <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(240,243,249,0.88)", textShadow: "none" }}>Digital Strategist</span>
                </motion.h1>
              </div>

              {/* mobile-only: social vertical, to the right of the headline */}
              <div className="hp-hero-social-vert">
                {HERO_SOCIALS.map(({ Icon, href, label }) => (
                  <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    data-glow=""
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 16 }}
                    style={{ '--base': '205', '--spread': '36', '--radius': '11', '--border': '1', '--size': '150', width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, border: `1px solid ${G.bd}`, backgroundColor: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, textDecoration: "none", flexShrink: 0 } as React.CSSProperties}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.accentLt; el.style.borderColor = "rgba(255,60,92,0.55)"; el.style.backgroundColor = "rgba(255,60,92,0.16)" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.muted; el.style.borderColor = G.bd; el.style.backgroundColor = G.bg }}
                  >
                    <Icon />
                  </motion.a>
                ))}
              </div>
            </div>

            <motion.p className="hp-hero-desc"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.22, ease }}
              style={{ fontSize: "clamp(16px, 1.4vw, 17px)", color: "#FFFFFF", fontWeight: 400, fontFamily: "'Geist', system-ui, sans-serif", maxWidth: 340, lineHeight: 1.85, margin: "28px 0 0", letterSpacing: "0.01em", WebkitFontSmoothing: "antialiased" } as React.CSSProperties}
            >
              Un'unica mente tra codice e business. Architetture digitali che scalano — senza intermediari, senza compromessi.
            </motion.p>

            {/* Process flow — visual timeline */}
            <motion.div
              className="hp-hero-flow"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.28, ease }}
              style={{ marginTop: 36 }}
            >
              {(["Idea", "Strategia", "Esecuzione", "Risultato"]).map((label, i) => (
                <div key={label} className="hp-flow-step">
                  <span className="hp-flow-num"  style={{ color: "#FFFFFF" }}>{`0${i + 1}`}</span>
                  <div  className="hp-flow-dot"   style={{ background: "rgba(255,255,255,0.50)" }} />
                  <span className="hp-flow-label" style={{ color: "#FFFFFF" }}>{label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs — under the description */}
            <motion.div
              className="hp-hero-cta-row"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.36, ease }}
              style={{ display: "flex", gap: 10, marginTop: 44, maxWidth: 440 }}
            >
              {/* L'azione principale porta al configuratore (s7): una richiesta
                  che arriva da lì contiene già l'architettura, e vale molto di
                  più di un contatto generico. Prima puntava a s9. */}
              <motion.button
                onClick={() => scrollToSection("s7")}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{ flex: "1.5 1 0", minHeight: 54, padding: 0, borderRadius: 12, cursor: "pointer", border: "1px solid rgba(255,60,92,0.80)", background: "linear-gradient(90deg, rgba(255,60,92,0.34) 0%, rgba(255,60,92,0.20) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0 12px rgba(255,60,92,0.20), inset 0 1px 0 rgba(255,255,255,0.15)", display: "flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO }}
              >
                <span className="hp-hero-cta-index" style={{ padding: "0 14px", borderRight: "1px solid rgba(255,60,92,0.45)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "#FFFFFF" }}>[01]</span>
                <span className="hp-hero-cta-inner" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
                  <span>Configura il Progetto</span>
                  <span style={{ fontSize: 15 }}>→</span>
                </span>
              </motion.button>
              <motion.a
                href="/#s9" whileHover={{ y: -2, background: "rgba(255,255,255,0.13)", borderColor: "rgba(224,224,224,0.38)" }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{ flex: "1 1 0", minHeight: 54, padding: "0 18px", borderRadius: 9, fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center" as const, textDecoration: "none", border: "1px solid rgba(255,255,255,0.30)", background: "rgba(255,255,255,0.012)", color: T.text, boxShadow: "0 6px 28px rgba(8,12,28,0.42), inset 0 1px 0 rgba(255,255,255,0.012)" }}
              >
                Parliamo del Progetto <span style={{ fontSize: 15 }}>→</span>
              </motion.a>
            </motion.div>

            {/* mobile-only: social row below CTAs */}
            <div className="hp-hero-social-below">
              {HERO_SOCIALS.map(({ Icon, href, label }) => (
                <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 16 }}
                  style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, border: `1px solid ${G.bd}`, backgroundColor: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, textDecoration: "none", flexShrink: 0 } as React.CSSProperties}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.accentLt; el.style.borderColor = "rgba(255,60,92,0.55)"; el.style.backgroundColor = "rgba(255,60,92,0.16)" }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.muted; el.style.borderColor = G.bd; el.style.backgroundColor = G.bg }}
                >
                  <Icon />
                </motion.a>
              ))}
            </div>

          </div>

          {/* RIGHT — POSSESSD-style meta panel */}
          <motion.div className="hp-hero-meta" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.32, ease }}>
            {/* availability — the single status statement, opens the form */}
            <HeroLiveCards onOpen={() => setFormOpen(true)} />

            {/* spec rows: key left, value right, one hairline per row.
                The old STATUS row repeated the availability above it. */}
            <div className="hp-hero-spec-block">
              <style>{`
                .hp-hero-spec-block { display:flex; flex-direction:column; }
                .hp-spec-row { display:flex; align-items:baseline; justify-content:space-between;
                  gap:14px; padding:11px 0; border-top:1px solid rgba(255,255,255,0.12); }
                .hp-spec-k { font-family:${MONO}; font-size:9.5px; letter-spacing:0.20em;
                  text-transform:uppercase; color:rgba(255,255,255,0.58); flex-shrink:0; }
                .hp-spec-v { font-family:${MONO}; font-size:12.5px; letter-spacing:0.02em;
                  color:#FFFFFF; text-align:right; }
              `}</style>
              {[["Focus", "E-commerce · Growth"], ["Studio", "NM 2026"]].map(([k, v]) => (
                <div className="hp-spec-row" key={k}>
                  <span className="hp-spec-k">{k}</span>
                  <span className="hp-spec-v">{v}</span>
                </div>
              ))}
            </div>

            {/* social — icons carry their own meaning, no label needed */}
            <div className="hp-hero-meta-social">
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {HERO_SOCIALS.map(({ Icon, href, label }) => (
                  <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    data-glow=""
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 16 }}
                    style={{
                      '--base': '205', '--spread': '36', '--radius': '11', '--border': '1', '--size': '150',
                      width: 42, height: 42, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                      color: T.muted, border: `1px solid ${G.bd}`, backgroundColor: G.bg,
                      backdropFilter: G.blur, WebkitBackdropFilter: G.blur, textDecoration: "none", flexShrink: 0,
                    } as React.CSSProperties}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.accentLt; el.style.borderColor = "rgba(255,60,92,0.55)"; el.style.backgroundColor = "rgba(255,60,92,0.16)" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.muted; el.style.borderColor = G.bd; el.style.backgroundColor = G.bg }}
                  >
                    <Icon />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* bottom — stats grid V3 style + scroll cue */}
        <motion.div className="hp-hero-botnav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.55, ease }}>
          <span className="hp-hero-scroll" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>Scorri ↓</span>
        </motion.div>

        {/* ── Social proof marquee ── */}
        <SocialProof />

      </div>

      <AnimatePresence>
        {formOpen && <ContactModal onClose={() => setFormOpen(false)} />}
      </AnimatePresence>
    </section>
  )
}


/* ══════════════════════════════════════════════════════════════════════════
   §  LE SOLUZIONI — La Matrice di Conversione
══════════════════════════════════════════════════════════════════════════ */
const SOLUZIONI = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #FF3552 0%, #FF334B 100%)",
    glow: "rgba(255,60,92,0.28)",
    title: "E-commerce ad Alta Conversione",
    desc: "Negozi online veloci, stabili e scalabili. Automazione totale di magazzini, cataloghi massivi e logistica.",
    cta: "Ottimizza il tuo E-commerce",
    href: "/ecommerce",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #AEB6C4 0%, #EDF1F7 100%)",
    glow: "rgba(210,220,235,0.24)",
    title: "Applicazioni Web & Automazione Custom",
    desc: "Software e strumenti di produttività su misura. Connettiamo i tuoi sistemi (CRM/ERP) per eliminare l'errore umano.",
    cta: "Automatizza i tuoi Processi",
    href: "/web-app",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        <circle cx="12" cy="12" r="7" strokeDasharray="2 3"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #FF334B 0%, #FF8A96 100%)",
    glow: "rgba(255,60,92,0.28)",
    title: "Integrazione AI & Sistemi Intelligenti",
    desc: "Soluzioni pratiche basate su Intelligenza Artificiale (Agenti AI, LLM). Abbattiamo i costi di gestione e ottimizziamo la routine.",
    cta: "Innova con l'AI",
    href: "/ai",
  },
  {
    num: "04",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #FF3552 0%, #FF8A96 100%)",
    glow: "rgba(255,60,92,0.28)",
    title: "SEO Strutturale & Performance",
    desc: "Posizionamento organico integrato nel codice fin dal primo giorno. Scaliamo Google per intercettare traffico pronto a comprare.",
    cta: "Scala le Classifiche",
    href: "/seo",
  },
  {
    num: "05",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #AEB6C4 0%, #EDF1F7 100%)",
    glow: "rgba(210,220,235,0.24)",
    title: "Corporate & Lead Generation",
    desc: "Presenza digitale premium in React/Next.js: interfacce ad alte performance, Core Web Vitals ottimizzati e funnel di acquisizione pensati per generare lead qualificati.",
    cta: "Potenzia il tuo Brand",
    href: "/corporate",
  },
]

function SolCard({ s, i }: { s: typeof SOLUZIONI[0]; i: number }) {
  const [hover, setHover] = useState(false)
  const featured = i === 0

  const RouteChip = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: MONO, fontSize: 9.5, letterSpacing: ".04em", color: hover ? "rgba(255,255,255,0.72)" : "#FFFFFF", border: `1px solid ${hover ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.16)"}`, borderRadius: 6, padding: "3px 8px", transition: "color .3s, border-color .3s", whiteSpace: "nowrap" as const }}>
      <span style={{ fontSize: 11 }}>↗</span>{s.href}
    </span>
  )

  const IconBox = (
    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.24)", color: "#FFFFFF" }}>
      {s.icon}
    </div>
  )

  const Footer = (
    <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" as const, color: hover ? "#FFFFFF" : "#FFFFFF", transition: "color .3s" }}>{s.cta}</span>
      <motion.span animate={{ x: hover ? 4 : 0, borderColor: hover ? "rgba(255,60,92,0.7)" : "rgba(255,60,92,0.32)", background: hover ? "rgba(255,60,92,0.18)" : "rgba(255,60,92,0.08)" }} transition={{ duration: 0.25 }}
        style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", color: T.accentLt, fontSize: 14, flexShrink: 0 }}>→</motion.span>
    </div>
  )

  const BigNum = (size: number) => (
    <span style={{ fontFamily: MONO, fontWeight: 900, fontSize: size, letterSpacing: "-0.06em", lineHeight: 1, color: "rgba(255,70,100,0.34)" }}>{s.num}</span>
  )

  return (
    <a
      href={s.href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", boxSizing: "border-box" as const,
        boxShadow: "0 4px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.09)",
        textDecoration: "none", cursor: "pointer",
        transition: "transform .35s ease, box-shadow .35s ease",
        transform: hover ? "translateY(-3px)" : "none",
      }}
    >
      {/* Glass background — bottom fade mask */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, background: "rgba(255,255,255,0.008)", backdropFilter: "blur(6px) brightness(1.03)", WebkitBackdropFilter: "blur(6px) brightness(1.03)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", maskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", pointerEvents: "none" }} />

      {/* Gradient border — top + sides fade to mid */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, padding: 1, background: "linear-gradient(to bottom, rgba(255,255,255,0.53) 0%, transparent 52%)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", pointerEvents: "none", zIndex: 2 }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 3, width: "100%", height: "100%",
        padding: featured ? "clamp(20px,2.4vw,26px)" : "20px 20px 18px",
        display: "flex", flexDirection: featured ? "row" : "column", gap: featured ? 32 : 0,
        flexWrap: featured ? "wrap" as const : "nowrap" as const, boxSizing: "border-box" as const,
      }}>
        {featured ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", flex: "1 1 280px", minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                {BigNum(72)}
                {RouteChip}
              </div>
              {IconBox}
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(20px,2.2vw,26px)", letterSpacing: "-0.02em", lineHeight: 1.14, color: T.text, margin: "14px 0 0" }}>{s.title}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: "1 1 280px", minWidth: 220 }}>
              <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", lineHeight: 1.7, color: T.muted, margin: "0 0 16px", flex: 1 }}>{s.desc}</p>
              {Footer}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
              {BigNum(54)}
              {RouteChip}
            </div>
            {IconBox}
            <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16.5, letterSpacing: "-0.018em", lineHeight: 1.25, color: T.text, margin: "14px 0 8px" }}>{s.title}</h3>
            <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", lineHeight: 1.62, color: T.muted, margin: "0 0 16px", flex: 1 }}>{s.desc}</p>
            {Footer}
          </>
        )}
      </div>
    </a>
  )
}

function SoluzioniMatrix() {
  return (
    /* id="s4": è l'ancora a cui puntano il menu e il piè di pagina. Prima la
       sezione non ne aveva nessuna e il link "Soluzioni" ricaricava la home. */
    <section style={{ ...SEC, padding: "80px 0", borderTop: `1px solid ${T.border}` }} id="s4" className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
            <span style={{ color: T.accentLt }}>//</span>
            {/* il kicker precedente, "Core Skills & Tech Stack", era rimasto
                da un'altra sezione e non aveva a che vedere con i servizi */}
            <span>[ Servizi ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.6vw,48px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.025em", margin: "0 0 16px", maxWidth: 780, color: T.text }}>
            Soluzioni ad Alta Ingegneria
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: T.muted, lineHeight: 1.8, maxWidth: 680, margin: "0 0 40px" }}>
            Ogni soluzione è un servizio completo con la <span style={{ color: "#FFFFFF" }}>sua pagina dedicata</span> — architettura, stack tecnologico e casi d'uso spiegati in dettaglio. Clicca su una card per esplorarla.
          </p>
        </Reveal>

        {/* bento 6-col — first spans full, pairs of 2 after */}
        <style>{`
          .sol-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:14px; align-items:stretch; }
          .sol-grid > * { display:flex; }
          .sol-cell-full { grid-column:span 6; }
          .sol-cell-half { grid-column:span 3; }
          @media(max-width:700px){
            .sol-grid { grid-template-columns:1fr !important; gap:10px !important; }
            .sol-cell-full,.sol-cell-half { grid-column:1/-1 !important; }
          }
          @media(min-width:701px) and (max-width:960px){
            .sol-grid { grid-template-columns:repeat(2,1fr) !important; }
            .sol-cell-full { grid-column:1/-1 !important; }
            .sol-cell-half { grid-column:span 1 !important; }
          }
        `}</style>
        <div className="sol-grid">
          {SOLUZIONI.map((s, i) => (
            <motion.div
              key={s.num}
              className={i === 0 ? "sol-cell-full" : "sol-cell-half"}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.07, ease }}
            >
              <SolCard s={s} i={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §  IL PROBLEMA — La Diagnosi
══════════════════════════════════════════════════════════════════════════ */
const DIAGNOSI_PS = [
  {
    problem: {
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
      title: "E-commerce inefficiente",
      body: "Cataloghi disconnessi, errori di magazzino e automatismi rotti. Perdi vendite ogni giorno senza saperlo.",
    },
    solution: {
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      title: "Shopify Custom Automatizzato",
      body: "Sincronizzazione in tempo reale di stock, ordini e cataloghi con 30.000+ SKU. Zero errori manuali, conversioni al massimo.",
    },
  },
  {
    problem: {
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      ),
      title: "Invisibilità su Google",
      body: "Traffico dipendente al 100% dalle Ads. Se smetti di pagare, i clienti spariscono. Nessuna rendita organica.",
    },
    solution: {
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
      ),
      title: "SEO Strutturale + Ads Scalabili",
      body: "Architettura SEO integrata nel codice dal giorno uno. Traffico organico che cresce in autonomia, campagne Google e Meta che amplificano il ROI.",
    },
  },
  {
    problem: {
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          <line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="13" y2="12"/>
        </svg>
      ),
      title: "Sito aziendale debole",
      body: "Presenza online lenta e obsoleta. I clienti premium valutano il tuo brand in 3 secondi — e scelgono il competitor.",
    },
    solution: {
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      title: "Interfaccia Premium ad Alta Conversione",
      body: "Design d'élite in React/Next.js con Core Web Vitals al 100%. La prima impressione è impeccabile e converte clienti B2B di alto profilo.",
    },
  },
  {
    problem: {
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: "Processi manuali e ripetitivi",
      body: "Il tuo team spreca ore su attività che un sistema intelligente farebbe in secondi. Costi operativi fuori controllo.",
    },
    solution: {
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      ),
      title: "Automazione AI su Misura",
      body: "API, middleware e agenti AI che eliminano il lavoro ripetitivo. Il tuo team torna a fare ciò che conta davvero: crescita e strategia.",
    },
  },
]

function DiagnosiCard({ d, i }: { d: typeof DIAGNOSI_PS[0]; i: number }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: (i % 2) * 0.08, ease }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{ position: "relative", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.09)" }}
    >
      {/* Glass background — fades out, text above is unaffected */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, background: "rgba(255,255,255,0.008)", backdropFilter: "blur(6px) brightness(1.03)", WebkitBackdropFilter: "blur(6px) brightness(1.03)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", maskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", pointerEvents: "none" }} />

      {/* Border — top + sides fade to mid */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, padding: 1, background: "linear-gradient(to bottom, rgba(255,255,255,0.53) 0%, transparent 52%)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", pointerEvents: "none", zIndex: 2 }} />



      {/* Контент — всегда полная непрозрачность, поверх фона */}
      <div style={{ position: "relative", zIndex: 3 }}>
        <div style={{ padding: "26px 26px 20px" }}>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase" as const, color: "rgba(239,68,68,0.55)" }}>[ Problema ]</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.24)", color: "#FFFFFF" }}>
              {d.problem.icon}
            </div>
            <h4 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", margin: 0, color: "#FFFFFF", lineHeight: 1.25 }}>{d.problem.title}</h4>
          </div>
          <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", lineHeight: 1.68, color: T.muted, margin: 0 }}>{d.problem.body}</p>
        </div>
        <div style={{ margin: "0 26px", height: 1, background: `linear-gradient(90deg, transparent, ${hov ? "rgba(255,60,92,0.35)" : "rgba(255,255,255,0.07)"}, transparent)`, transition: "background 0.30s" }} />
        <div style={{ padding: "20px 26px 26px" }}>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase" as const, color: hov ? T.accentLt : "rgba(255,60,92,0.55)", transition: "color 0.28s" }}>[ Soluzione ]</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.24)", color: "#FFFFFF" }}>
              {d.solution.icon}
            </div>
            <h4 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", margin: 0, color: "#FFFFFF", lineHeight: 1.25 }}>{d.solution.title}</h4>
          </div>
          <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", lineHeight: 1.68, color: T.muted, margin: 0 }}>{d.solution.body}</p>
        </div>
      </div>
    </motion.div>
  )
}

function DiagnosiBlock() {
  return (
    <section style={{ ...SEC, padding: "80px 0", borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
            <span style={{ color: T.accentLt }}>//</span>
            <span>[ Il Problema — La Diagnosi ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.4vw,46px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 40px", maxWidth: 680, color: T.text }}>
            Sei bloccato in una di queste situazioni?
          </h2>
        </Reveal>
        <style>{`
          .diag-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
          @media(max-width:700px){ .diag-grid { grid-template-columns:1fr !important; gap:10px !important; } }
        `}</style>
        <div className="diag-grid">
          {DIAGNOSI_PS.map((d, i) => <DiagnosiCard key={i} d={d} i={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §  IL MIO METODO — Perché lavorare con me
══════════════════════════════════════════════════════════════════════════ */

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
          stroke="rgba(255,60,92,0.10)" strokeWidth="1" fill="none" strokeDasharray="4 3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
        />
      ))}
      <motion.circle cx={cx} cy={cy} r={36} fill="rgba(120,20,30,0.03)"
        animate={{ r: [36, 45, 36] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle cx={cx} cy={cy} r={28}
        fill="rgba(120,20,30,0.06)" stroke="rgba(255,60,92,0.18)" strokeWidth="1.5"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 250, delay: 0.1 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={9} fontWeight="700"
        fill="rgba(255,255,255,0.82)" fontFamily="Inter,sans-serif">Business</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize={6.5} fill="rgba(168,85,247,0.5)"
        fontFamily="Inter,sans-serif">Analysis</text>
      {sats.map((s, i) => (
        <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 280 }}
          style={{ transformOrigin: `${s.x}px ${s.y}px` }}
        >
          <circle cx={s.x} cy={s.y} r={21} fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.13)" strokeWidth="1"/>
          <text x={s.x} y={s.y + 1.5} textAnchor="middle" fontSize={7} fill="rgba(242,242,250,0.68)"
            fontFamily="Inter,sans-serif">{s.label}</text>
        </motion.g>
      ))}
      {sats.map((s, i) => (
        <motion.circle key={`p${i}`} cx={cx} cy={cy} r={2.5} fill="rgba(255,60,92,0.40)"
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
        fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.13)" strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}
      />
      <motion.rect x={15} y={10} width={270} height={30} rx={10}
        fill="rgba(255,255,255,0.09)"
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
        fill="rgba(255,255,255,0.012)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
      />
      <motion.rect x={25} y={50} width={250} height={16} rx={5}
        fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.012)" strokeWidth="1"
        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ transformOrigin: "150px 58px" }}
      />
      <motion.rect x={25} y={76} width={250} height={50} rx={7}
        fill="rgba(120,20,30,0.04)" stroke="rgba(255,60,92,0.07)" strokeWidth="1"
        initial={{ opacity: 0, scaleX: 0.7 }} animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.34, duration: 0.4, ease: [0.16,1,0.3,1] }}
        style={{ transformOrigin: "150px 101px" }}
      />
      <motion.rect x={55} y={90} width={0} height={8} rx={4} fill="rgba(255,60,92,0.14)"
        animate={{ width: 110 }} transition={{ delay: 0.54, duration: 0.5 }}
      />
      <motion.rect x={80} y={105} width={0} height={5} rx={3} fill="rgba(255,255,255,0.16)"
        animate={{ width: 60 }} transition={{ delay: 0.68, duration: 0.35 }}
      />
      <motion.rect x={167} y={89} width={2} height={11} rx={1} fill="rgba(255,60,92,0.35)"
        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.9 }}
      />
      {[25,112,199].map((x, i) => (
        <motion.g key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54 + i * 0.09, duration: 0.35, ease: [0.16,1,0.3,1] }}
        >
          <rect x={x} y={138} width={76} height={54} rx={7}
            fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.11)" strokeWidth="1"/>
          <circle cx={x+38} cy={157} r={9} fill="rgba(120,20,30,0.09)"/>
          <rect x={x+16} y={172} width={44} height={4} rx={2} fill="rgba(255,255,255,0.13)"/>
          <rect x={x+22} y={180} width={32} height={3} rx={2} fill="rgba(255,255,255,0.09)"/>
        </motion.g>
      ))}
    </svg>
  )
}

function VisualAPI() {
  const boxes = [
    { label: "Fornitore", sub: "ERP/CRM",     x: 14,  y: 72, w: 76, h: 86,  ac: "rgba(120,20,30,0.05)", bd: "rgba(255,60,92,0.12)" },
    { label: "API Layer", sub: "Middleware",   x: 112, y: 50, w: 76, h: 130, ac: "rgba(255,60,92,0.05)", bd: "rgba(255,60,92,0.13)" },
    { label: "Shopify",   sub: "+ Analytics",  x: 210, y: 72, w: 76, h: 86,  ac: "rgba(120,20,30,0.05)", bd: "rgba(255,60,92,0.12)" },
  ]
  return (
    <svg viewBox="0 0 300 230" width="100%" height="100%">
      <motion.text x={150} y={20} textAnchor="middle" fontSize={15} fontWeight="800"
        fill="rgba(255,255,255,0.82)" fontFamily="Inter,sans-serif"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      >30.247 SKU</motion.text>
      <motion.text x={150} y={36} textAnchor="middle" fontSize={7} fill="rgba(255,60,92,0.14)"
        fontFamily="Inter,sans-serif"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
      >sincronizzati in tempo reale</motion.text>
      {[[90,115,112,115],[188,115,210,115]].map(([x1,y1,x2,y2], i) => (
        <motion.path key={i} d={`M${x1},${y1}L${x2},${y2}`}
          stroke="rgba(255,60,92,0.09)" strokeWidth="1.5" fill="none" strokeDasharray="5 3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.15 }}
        />
      ))}
      {[112,210].map((x, i) => (
        <motion.polygon key={i} points={`${x},111 ${x},119 ${x+7},115`}
          fill="rgba(255,60,92,0.14)"
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
          <motion.circle cx={b.x+b.w-11} cy={b.y+11} r={3.5} fill="#10B981"
            animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.45 }}/>
          <motion.circle cx={b.x+b.w-11} cy={b.y+11} r={7} fill="rgba(16,185,129,0.16)"
            animate={{ r: [7,13,7], opacity: [0.35,0,0.35] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i*0.45 }}/>
        </motion.g>
      ))}
      {[0,1].map(edge => [0,1,2].map(j => (
        <motion.rect key={`p${edge}-${j}`}
          x={edge===0 ? 86 : 184} y={112} width={8} height={6} rx={2} fill="rgba(255,60,92,0.18)"
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
          <stop offset="0%" stopColor="rgba(120,20,30,0.85)"/><stop offset="100%" stopColor="rgba(255,70,100,0.55)"/>
        </linearGradient>
        <linearGradient id="mga" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(120,20,30,0.07)"/><stop offset="100%" stopColor="rgba(124,16,240,0)"/>
        </linearGradient>
      </defs>
      {[40,80,120,160].map((y,i) => (
        <line key={i} x1={22} y1={y} x2={242} y2={y} stroke="rgba(255,255,255,0.012)" strokeWidth="1"/>
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
          fill="rgba(255,255,255,0.82)" stroke="rgba(7,10,18,0.8)" strokeWidth="2"
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
            fill="rgba(120,20,30,0.05)" stroke="rgba(255,60,92,0.12)" strokeWidth="1"/>
          <text x={m.x+29} y={m.y-1} textAnchor="middle" fontSize={13} fontWeight="800"
            fill="rgba(255,255,255,0.82)" fontFamily="Inter,sans-serif">{m.v}</text>
          <text x={m.x+29} y={m.y+9} textAnchor="middle" fontSize={7}
            fill="rgba(255,60,92,0.28)" fontFamily="Inter,sans-serif">{m.l}</text>
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

function MethodCarousel() {
  const [step, setStep] = useState<number | null>(0)
  const [tick, setTick] = useState(0)
  const STEP_MS = 8500

  useEffect(() => {
    const t = setTimeout(() => { setStep(s => s === null ? 0 : (s + 1) % 4); setTick(k => k + 1) }, STEP_MS)
    return () => clearTimeout(t)
  }, [step])

  const goTo = (i: number) => {
    if (step === i) { setStep(null) } else { setStep(i); setTick(k => k + 1) }
  }

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.012)" }}>
      {METHOD_STEPS.map((s, i) => {
        const isActive = step === i
        const isDone = step !== null && i < step
        const Visual = METHOD_VISUALS[i]

        return (
          <div key={i} style={{ borderBottom: `1px solid ${isActive ? "rgba(255,60,92,0.18)" : "rgba(255,255,255,0.012)"}`, transition: "border-color 0.4s" }}>

            {/* ── Row header ── */}
            <button
              onClick={() => goTo(i)}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "20px 0", display: "flex", alignItems: "center", gap: 16 } as React.CSSProperties}
            >
              {/* Large step number */}
              <motion.span
                className="hp-method-row-num"
                animate={{ color: isActive ? "rgba(255,60,92,0.75)" : isDone ? "rgba(255,60,92,0.22)" : "#FFFFFF" }}
                transition={{ duration: 0.35 }}
                style={{ fontFamily: MONO, fontSize: 50, fontWeight: 200, lineHeight: 1, letterSpacing: "-0.04em", textAlign: "right" as const, flexShrink: 0, width: 72 }}
              >{s.n}</motion.span>

              {/* Accent dash */}
              <motion.div
                className="hp-method-row-accent"
                animate={{ background: isActive ? "rgba(255,60,92,0.65)" : "rgba(255,255,255,0.13)" }}
                transition={{ duration: 0.35 }}
                style={{ height: 1, width: 32, flexShrink: 0 }}
              />

              {/* Title + phase label */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 4, textAlign: "left" as const }}>
                <motion.span
                  className="hp-method-row-title"
                  animate={{ color: isActive ? "#FFFFFF" : "#FFFFFF" }}
                  transition={{ duration: 0.35 }}
                  style={{ fontFamily: DISPLAY, fontSize: "clamp(14px,1.5vw,17px)", fontWeight: isActive ? 700 : 400, letterSpacing: "-0.015em", lineHeight: 1.2 }}
                >{s.title}</motion.span>
                <motion.span
                  animate={{ opacity: isActive ? 0.7 : 0.22 }}
                  transition={{ duration: 0.35 }}
                  style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".20em", textTransform: "uppercase" as const, color: "rgba(255,60,92,0.55)" }}
                >{s.label}</motion.span>
              </div>

              {/* Done check */}
              {isDone
                ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 13, color: "rgba(255,60,92,0.60)", flexShrink: 0 }}>✓</motion.span>
                : <div style={{ width: 13 }} />
              }

              {/* Expand circle */}
              <motion.div
                animate={{ rotate: isActive ? 45 : 0, borderColor: isActive ? "rgba(255,60,92,0.65)" : "rgba(255,255,255,0.18)", color: isActive ? "rgba(255,60,92,0.75)" : "#FFFFFF" }}
                transition={{ duration: 0.3 }}
                style={{ width: 24, height: 24, border: "1.5px solid", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, lineHeight: 1, flexShrink: 0 }}
              >+</motion.div>
            </button>

            {/* ── Expanded content ── */}
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="hp-method-expanded-inner"
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingLeft: 148, paddingRight: 4, paddingBottom: 20 }}
                  >
                    {/* Left: text + progress bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: "flex", flexDirection: "column" as const, justifyContent: "space-between" }}
                    >
                      <p className="hp-method-body" style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: T.muted, lineHeight: 1.7, margin: "0 0 16px" }}>{s.body}</p>
                      <div style={{ height: 2, background: "rgba(255,255,255,0.012)", borderRadius: 2, overflow: "hidden" }}>
                        <motion.div
                          key={tick}
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                          style={{ height: "100%", background: `linear-gradient(90deg, rgba(100,18,28,0.90), rgba(255,60,92,0.70))`, borderRadius: 2 }}
                        />
                      </div>
                    </motion.div>

                    {/* Right: SVG visual */}
                    <motion.div
                      className="hp-method-visual"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{ borderRadius: 6, background: "rgba(0,0,0,0.14)", border: "1px solid rgba(255,255,255,0.16)", minHeight: 130, maxHeight: 160, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Visual />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §5  IL PROCESSO — striscia compatta
   Il processo non compariva affatto in home: stava solo su About e nel PDF,
   con parole diverse fra loro. Qui ci sono le quattro fasi in una riga sola
   ciascuna; il dettaglio resta su About, a un clic di distanza.
══════════════════════════════════════════════════════════════════════════ */
function ProcessStrip() {
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}` }} id="s5" className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <style>{`
          .hp-proc-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
          @media(max-width:900px){ .hp-proc-grid{grid-template-columns:repeat(2,1fr)!important;} }
          @media(max-width:560px){ .hp-proc-grid{grid-template-columns:1fr!important;gap:10px!important;} }
        `}</style>

        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
            <span style={{ color: T.accentLt }}>//</span>
            <span>[ Il Processo ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.4vw,44px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 16px", maxWidth: 680, color: T.text }}>
            Quattro fasi, nessuna sorpresa
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: T.muted, lineHeight: 1.8, maxWidth: 640, margin: "0 0 40px" }}>
            Dal primo confronto al monitoraggio dopo il lancio: ogni fase ha una durata dichiarata e un esito verificabile.
          </p>
        </Reveal>

        <div className="hp-proc-grid">
          {PROCESSO.map((f, i) => (
            <motion.div key={f.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              style={{
                position: "relative", borderRadius: 14, padding: "22px 20px 24px",
                background: "rgba(255,255,255,0.012)",
                border: "1px solid rgba(255,255,255,0.13)",
                backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                display: "flex", flexDirection: "column" as const, gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", color: T.accentLt }}>[ {f.n} ]</span>
                <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap" as const }}>{f.dur}</span>
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, lineHeight: 1.25, letterSpacing: "-0.015em", color: "#FFFFFF", margin: 0 }}>{f.title}</h3>
              <div style={{ width: 26, height: 1.5, background: `linear-gradient(90deg, ${T.accent}, transparent)`, borderRadius: 2 }} />
              <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.68, color: T.muted, margin: 0 }}>{f.short}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <a href="/about" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "#FFFFFF", textDecoration: "none", borderBottom: `1px solid ${T.accentLt}`, paddingBottom: 3 }}>
            Il processo in dettaglio <span style={{ color: T.accentLt }}>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* Si chiamava Method, ma il metodo non lo racconta: racconta il Cabinet, cioè
   la trasparenza sul lavoro in corso. Il processo vero sta in ProcessStrip,
   che ora la precede. */
function Cabinet() {
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }} id="s6" className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, marginBottom: 56, flexWrap: "wrap" as const }}>

            {/* left — eyebrow + headline */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <span style={{ width: 24, height: 1, background: "linear-gradient(90deg, rgba(255,60,92,0.50), transparent)" }} />
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase" as const, color: "rgba(255,60,92,0.55)" }}>Lavoro Trasparente</span>
                <span style={{ width: 24, height: 1, background: "linear-gradient(270deg, rgba(255,60,92,0.50), transparent)" }} />
              </div>

              <h2 style={{ fontFamily: DISPLAY, fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", margin: 0, fontSize: "clamp(30px,3.8vw,52px)" }}>
                <span style={{ color: "#FFFFFF" }}>Una roadmap</span>{" "}
                <span style={{ color: "#FFFFFF", fontWeight: 300 }}>trasparente,</span>
                <br />
                <span style={{ color: "#FFFFFF", fontWeight: 300 }}>gestita dal tuo</span>{" "}
                <span style={{ color: "#FFFFFF" }}>Cabinet</span>
              </h2>
              <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: T.muted, lineHeight: 1.8, maxWidth: 460, margin: "22px 0 0" }}>
                Contratti, invoice e stato di ogni attività sono visibili in tempo reale nel tuo <span style={{ color: "#FFFFFF" }}>Area Clienti</span> privato. Zero sorprese, zero perdita di controllo: segui l'avanzamento del progetto fase per fase.
              </p>
            </div>

            {/* right — editorial counter */}
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 4, paddingBottom: 8, flexShrink: 0 }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.07em", color: "#FFFFFF" }}>04</span>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" as const, color: "#FFFFFF", textAlign: "right" as const, lineHeight: 1.6 }}>fasi · processo<br />completo</span>
            </div>

          </div>
        </Reveal>
        <MethodCarousel />
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §6  PORTFOLIO
══════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
   §6b  CASE STUDIES FEATURE — teaser → /projects
══════════════════════════════════════════════════════════════════════════ */
const CASE_LIST = [
  { n: "01", cat: "CIVIC TECH · OPEN-GOV · SAAS",  title: "Piattaforma Civica Regionale",
    metric: "131 Sub-Admin gestiti · dati isolati con RLS",
    desc: "Architettura multi-ruolo su Supabase — Super Admin, 131 Sub-Admin e cabinet cliente — con progetti di donazione e bandi per giovani startup." },
  { n: "02", cat: "E-COMMERCE · SHOPIFY PLUS",     title: "E-Commerce Enterprise",
    metric: "32.000+ SKU senza latenza · TTI < 1.4s",
    desc: "Piattaforma Shopify Plus scalabile: catalogo 32.000+ SKU, Core Web Vitals ottimizzati e architettura multi-country europea (OSS)." },
  { n: "03", cat: "MIDDLEWARE · AUTOMAZIONE B2B",  title: "Middleware di Automazione Logistica",
    metric: "Uptime 99.9% · ordini processati in < 3s",
    desc: "Software di sincronizzazione stock in tempo reale, architettura fault-tolerant a doppia scrittura e uptime del servizio del 99.9%." },
]

function CaseMiniCard({ c, i }: { c: typeof CASE_LIST[number]; i: number }) {
  const [h, setH] = useState(false)
  return (
    <motion.a
      href={`/projects#case-${c.n}`}
      initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: i * 0.09, ease }}
      onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)}
      className="cs-card"
      style={{
        position: "relative", overflow: "hidden", borderRadius: 16, textDecoration: "none", display: "flex",
        background: h ? "rgba(255,255,255,0.038)" : "rgba(255,255,255,0.018)",
        border: `1px solid ${h ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.11)"}`,
        boxShadow: h ? "0 20px 56px rgba(0,0,0,0.32)" : "0 8px 28px rgba(0,0,0,0.20)",
        transition: "background .28s, border-color .28s, box-shadow .28s",
      } as React.CSSProperties}
    >
      {/* Left accent stripe */}
      <div aria-hidden style={{ width: 3, flexShrink: 0, background: `linear-gradient(to bottom, rgba(255,60,92,0.90), rgba(255,60,92,0.20))`, borderRadius: "16px 0 0 16px", opacity: h ? 1 : 0.55, transition: "opacity .28s" }} />

      {/* Number column */}
      <div style={{ padding: "28px 24px 28px 28px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.16)" }}>
        <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.20em", color: "#FFFFFF", marginBottom: 6, textTransform: "uppercase" as const }}>CASE</span>
        <span style={{ fontFamily: DISPLAY, fontSize: "clamp(52px,6vw,80px)", fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1, color: h ? "rgba(255,60,92,0.70)" : "rgba(255,60,92,0.45)", transition: "color .28s" }}>{c.n}</span>
      </div>

      {/* Body */}
      <div className="cs-card-inner" style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", gap: 24, padding: "28px 24px 28px 28px", minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 10 }}>{c.cat}</div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(18px,2.2vw,24px)", letterSpacing: "-0.02em", lineHeight: 1.2, color: "#FFFFFF", margin: "0 0 14px" }}>{c.title}</h3>
          <p style={{ fontFamily: SANS, fontSize: "16px", lineHeight: 1.72, color: T.muted, margin: 0, maxWidth: 500 }}>{c.desc}</p>
        </div>

        {/* Result callout */}
        <div className="cs-card-arrow" style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.20)", textAlign: "right" as const }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.18em", color: "#FFFFFF", marginBottom: 5, textTransform: "uppercase" as const }}>RISULTATO</div>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.02em", whiteSpace: "nowrap" as const }}>{c.metric}</div>
          </div>
          <motion.div
            animate={{ x: h ? 4 : 0, background: h ? "rgba(255,60,92,0.18)" : "rgba(255,255,255,0.012)", borderColor: h ? "rgba(255,60,92,0.55)" : "rgba(255,255,255,0.16)" }}
            transition={{ duration: 0.25 }}
            style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", color: h ? T.accentLt : "#FFFFFF", fontSize: 16, transition: "color .25s" }}
          >→</motion.div>
        </div>
      </div>
    </motion.a>
  )
}

function ProjectsFeature() {
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <style>{`
          .cs-head { display:flex; align-items:flex-end; justify-content:space-between; gap:32px; flex-wrap:wrap; margin-bottom:44px; }
          .cs-cards { display:flex; flex-direction:column; gap:14px; }
          @media(max-width:820px){ .cs-head{ margin-bottom:32px; } }
          @media(max-width:600px){
            .cs-card-inner { flex-wrap:wrap !important; gap:16px !important; padding:24px !important; }
            .cs-card-arrow { display:none !important; }
          }
        `}</style>

        <Reveal>
          <div className="cs-head">
            {/* title + subtitle */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 18 }}>
                <span style={{ color: T.accentLt }}>//</span>
                <span>[ Casi Studio ]</span>
              </div>

              <h2 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(34px,5vw,66px)", lineHeight: 0.98, letterSpacing: "-0.04em", margin: 0 }}>
                <span style={{ color: "#FFFFFF" }}>Progetti </span>
                <span style={{ color: "#FFFFFF", fontWeight: 300 }}>&amp; </span>
                <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.63)" }}>Soluzioni</span>
              </h2>

              <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: T.muted, lineHeight: 1.8, maxWidth: 560, margin: "20px 0 0" }}>
                Dall'obiettivo all'impatto: come risolviamo sfide tecniche complesse.
              </p>
            </div>

            {/* CTA — top-right at title level */}
            <motion.a
              href="/projects" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ flexShrink: 0, minHeight: 52, borderRadius: 12, cursor: "pointer", textDecoration: "none", border: "1px solid rgba(255,60,92,0.80)", background: "linear-gradient(90deg, rgba(255,60,92,0.34) 0%, rgba(255,60,92,0.20) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0 12px rgba(255,60,92,0.20), inset 0 1px 0 rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO }}
            >
              <span style={{ padding: "0 14px", borderRight: "1px solid rgba(255,60,92,0.45)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "#FFFFFF" }}>[→]</span>
              <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
                Scopri tutti i progetti <span style={{ fontSize: 14 }}>→</span>
              </span>
            </motion.a>
          </div>
        </Reveal>

        {/* cards row */}
        <div className="cs-cards">
          {CASE_LIST.map((c, i) => <CaseMiniCard key={c.n} c={c} i={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §7  SCARCITY
══════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
   §8  FAQ
══════════════════════════════════════════════════════════════════════════ */

/* ── Contact modal ── */
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

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    background: "rgba(255,255,255,0.012)",
    border: "1px solid rgba(255,255,255,0.20)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09)",
    color: "#FFFFFF", fontFamily: MONO, fontSize: 12,
    letterSpacing: "0.04em", outline: "none",
    transition: "border-color .2s, background .2s",
    boxSizing: "border-box" as const,
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: MONO, fontSize: 10, letterSpacing: ".16em",
    textTransform: "uppercase" as const,
    color: "#FFFFFF", marginBottom: 6, display: "block",
  }

  return createPortal(
    <motion.div ref={overlayRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        background: "rgba(7,10,18,0.72)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      } as React.CSSProperties}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%", maxWidth: 580, position: "relative",
          borderRadius: 20,
          background: "rgba(13,18,30,0.94)",
          backdropFilter: "blur(72px) brightness(0.92) saturate(1.10)",
          WebkitBackdropFilter: "blur(72px) brightness(0.92) saturate(1.10)",
          border: "1px solid rgba(255,255,255,0.24)",
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.11), 0 40px 100px rgba(0,0,0,0.65)",
          overflow: "hidden",
        } as React.CSSProperties}
      >
        {/* top brick accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${T.accent} 28%, ${T.accentLt} 72%, transparent)` }} />

        {/* rim shimmer */}
        <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 20, background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, transparent 40%)", pointerEvents: "none" }} />

        <div style={{ padding: "28px 32px 32px", position: "relative" }}>

          {/* header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 10 }}>
                <span style={{ color: T.accentLt }}>//</span>
                <span>[ Richiesta Consulenza ]</span>
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, letterSpacing: "-0.022em", color: "#FFFFFF", margin: 0, lineHeight: 1.2 }}>
                Descrivi il tuo blocco principale
              </h3>
            </div>
            <button onClick={onClose}
              style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.20)", background: "rgba(255,255,255,0.012)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", transition: "all 0.18s" }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,255,255,0.12)"; el.style.color="#fff" }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,255,255,0.012)"; el.style.color="#FFFFFF" }}
            >
              <XIcon size={13} />
            </button>
          </div>

          {!sent ? (
            <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* grid Nome + Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Nome</label>
                  <input style={inputStyle} placeholder="Il tuo nome" value={fields.name} onChange={e => set("name")(e.target.value)}
                    onFocus={e => { e.currentTarget.style.borderColor="rgba(255,60,92,.5)"; e.currentTarget.style.background="rgba(255,255,255,0.012)" }}
                    onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"; e.currentTarget.style.background="rgba(255,255,255,0.012)" }} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" placeholder="email@azienda.it" value={fields.email} onChange={e => set("email")(e.target.value)}
                    onFocus={e => { e.currentTarget.style.borderColor="rgba(255,60,92,.5)"; e.currentTarget.style.background="rgba(255,255,255,0.012)" }}
                    onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"; e.currentTarget.style.background="rgba(255,255,255,0.012)" }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Sito Web</label>
                <input style={inputStyle} placeholder="https://tuosito.it (opzionale)" value={fields.site} onChange={e => set("site")(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor="rgba(255,60,92,.5)"; e.currentTarget.style.background="rgba(255,255,255,0.012)" }}
                  onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"; e.currentTarget.style.background="rgba(255,255,255,0.012)" }} />
              </div>
              <div>
                <label style={labelStyle}>Cosa dobbiamo risolvere?</label>
                <select style={{ ...inputStyle, appearance: "none" as const, WebkitAppearance: "none" as const }} value={fields.area} onChange={e => set("area")(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor="rgba(255,60,92,.5)" }}
                  onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.13)" }}>
                  <option value="" style={{ background: "#060C18" }}>Seleziona un'area...</option>
                  {["E-commerce ad Alta Conversione","Siti Corporate & Lead Generation","Applicazioni Web & Automazione Custom","SEO Strategico & Performance Marketing","Integrazione AI & Sistemi Intelligenti"].map(o => (
                    <option key={o} value={o} style={{ background: "#060C18" }}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Messaggio</label>
                <textarea style={{ ...inputStyle, resize: "vertical" as const, minHeight: 90 }} placeholder="Descrivi la situazione attuale e il risultato che vuoi ottenere..." value={fields.msg} onChange={e => set("msg")(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor="rgba(255,60,92,.5)"; e.currentTarget.style.background="rgba(255,255,255,0.012)" }}
                  onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"; e.currentTarget.style.background="rgba(255,255,255,0.012)" }} />
              </div>

              {/* divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.11)", margin: "4px 0" }} />

              <button type="submit"
                style={{ width: "100%", padding: "13px 32px", borderRadius: 10, cursor: "pointer", border: "1px solid rgba(255,70,100,0.28)", background: "rgba(255,70,100,0.08)", backdropFilter: "blur(20px) brightness(1.08) saturate(1.2)", WebkitBackdropFilter: "blur(20px) brightness(1.08) saturate(1.2)", boxShadow: "0 0 12px rgba(255,70,100,0.10), inset 0 1px 0 rgba(255,70,100,0.10)", color: "rgba(255,70,100,0.92)", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" as const, transition: "all .22s" }}
                onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,70,100,0.14)"; el.style.boxShadow="0 0 20px rgba(255,70,100,0.18), inset 0 1px 0 rgba(255,70,100,0.15)"; el.style.transform="translateY(-1px)"; el.style.borderColor="rgba(255,70,100,0.50)" }}
                onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,70,100,0.08)"; el.style.boxShadow="0 0 12px rgba(255,70,100,0.10), inset 0 1px 0 rgba(255,70,100,0.10)"; el.style.transform=""; el.style.borderColor="rgba(255,70,100,0.28)" }}
              >
                Invia Richiesta →
              </button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "36px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.30)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24, color: T.green }}>✓</div>
              <h4 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: T.green, marginBottom: 10 }}>Richiesta inviata!</h4>
              <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: T.muted, lineHeight: 1.8, margin: 0 }}>Riceverai un piano d'azione chiaro entro 24 ore lavorative.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  , document.body)
}

function CTAContactButton({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [mx, setMx] = useState(0)
  const [my, setMy] = useState(0)

  const onMove = (e: React.MouseEvent) => {
    const r = btnRef.current?.getBoundingClientRect()
    if (r) { setMx(e.clientX - r.left); setMy(e.clientY - r.top) }
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>

      {/* pulsing rings */}
      {[0, 1].map(i => (
        <motion.div key={i} aria-hidden
          animate={{ scale: [1, 1.55 + i * 0.35], opacity: [0.38 - i * 0.10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: i * 0.70 }}
          style={{ position: "absolute", inset: -6, borderRadius: 9999, border: `1px solid rgba(${i === 0 ? "255,255,255,0.30" : "255,255,255,0.18"})`, pointerEvents: "none" }}
        />
      ))}

      {/* bottom shadow glow */}
      <motion.div aria-hidden
        animate={{ opacity: [0.55, 0.90, 0.55], scale: [0.88, 1.04, 0.88] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: -16, left: "10%", right: "10%", height: 24, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,60,92,0.55) 0%, transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }}
      />

      <motion.button
        ref={btnRef}
        onClick={onClick}
        onHoverStart={() => setHov(true)}
        onHoverEnd={() => setHov(false)}
        onMouseMove={onMove}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 20 }}
        style={{
          position: "relative", overflow: "hidden", cursor: "pointer",
          padding: "0 0 0 0", borderRadius: 12,
          border: `1px solid rgba(255,60,92,${hov ? "0.80" : "0.50"})`,
          background: hov ? "linear-gradient(90deg, rgba(255,60,92,0.34) 0%, rgba(255,60,92,0.20) 100%)" : "rgba(255,60,92,0.14)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: hov
            ? "0 0 24px rgba(255,60,92,0.35), inset 0 1px 0 rgba(255,255,255,0.18)"
            : "0 0 12px rgba(255,60,92,0.20), inset 0 1px 0 rgba(255,255,255,0.15)",
          color: "#FFFFFF", fontFamily: MONO,
          display: "flex", alignItems: "stretch",
          transition: "border-color 0.25s, box-shadow 0.30s, background 0.25s",
        } as React.CSSProperties}
      >
        {/* index tag */}
        <div style={{ padding: "17px 16px 17px 20px", borderRight: "1px solid rgba(255,60,92,0.45)", display: "flex", alignItems: "center", position: "relative" }}>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", color: "#FFFFFF" }}>[01]</span>
        </div>
        {/* label */}
        <div style={{ padding: "17px 28px", display: "flex", alignItems: "center", gap: 14, position: "relative", fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase" as const }}>
          Prenota un Audit Gratuito
          <motion.span
            animate={{ x: hov ? [0, 5, 0] : 0 }}
            transition={{ duration: 0.55, repeat: hov ? Infinity : 0, ease: "easeInOut" }}
            style={{ fontSize: 15, color: "#FFFFFF", lineHeight: 1 }}
          >→</motion.span>
        </div>
      </motion.button>
    </div>
  )
}

function Contact() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}` }} id="s9" className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
            <span style={{ color: T.accentLt }}>//</span>
            <span>[ Parliamone ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 16px", color: "#FFFFFF" }}>
            Pronto a scalare il tuo <span style={{ color: "#FFFFFF" }}>ecosistema digitale?</span>
          </h2>
        </Reveal>
        <motion.p className="hp-body"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.16, ease }}
          style={{ fontSize: 15, color: T.muted, lineHeight: 1.82, marginBottom: 52, maxWidth: 580 }}
        >
          Prenota un audit gratuito: analizziamo la tua architettura attuale, individuiamo i colli di bottiglia e ti consegniamo un piano d'azione chiaro, orientato ai numeri.
        </motion.p>

        {/* CTA button */}
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.24, ease }}>
          <CTAContactButton onClick={() => setModalOpen(true)} />
        </motion.div>
      </div>

      <AnimatePresence>
        {modalOpen && <ContactModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   FOOTER (inlined from FooterSite.tsx)
══════════════════════════════════════════════════════════════════════════ */



/* ══════════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 })
  return (
    <motion.div aria-hidden
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 500,
        transformOrigin: "0% 50%", scaleX,
        background: "linear-gradient(90deg, rgba(150,34,48,1), #FF3552, #FF334B)",
        boxShadow: "0 0 12px rgba(255,60,92,0.7)",
      }}
    />
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §1b  SOCIAL PROOF — tech / partner marquee
══════════════════════════════════════════════════════════════════════════ */
const SP_TECH = ["Shopify Plus", "Supabase", "Stripe", "Vercel", "Next.js", "Node.js", "React", "Framer Motion"]

function SocialProof() {
  return (
    <div className="sp-root" style={{ marginTop: 30, padding: "18px 26px", borderRadius: 14, background: "rgba(10,15,27,0.38)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.012)", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes sp-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .sp-row { display:flex; align-items:center; gap:32px; }
        .sp-marquee { position:relative; flex:1; overflow:hidden; -webkit-mask-image:linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image:linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
        .sp-track { display:flex; align-items:center; width:max-content; animation:sp-scroll 26s linear infinite; }
        .sp-marquee:hover .sp-track { animation-play-state:paused; }
        .sp-item { display:flex; align-items:center; gap:26px; padding-right:26px; }
        @media(max-width:760px){
          .sp-root{ padding:14px 14px !important; margin-top:18px !important; border-radius:10px !important; }
          .sp-row{ flex-direction:column; align-items:flex-start; gap:10px; }
          .sp-label{ width:100%; }
          .sp-label-text{ font-size:9.5px !important; letter-spacing:.06em !important; white-space:normal !important; line-height:1.4; }
          .sp-marquee{ width:100%; }
          .sp-tech-name{ font-size:13px !important; }
        }
      `}</style>
      <div className="sp-row">
        {/* label */}
        <div className="sp-label" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accentLt, flexShrink: 0 }} />
          <span className="sp-label-text" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: "#FFFFFF" }}>
            Tecnologie enterprise e brand che scalano con me:
          </span>
        </div>

        {/* marquee */}
        <div className="sp-marquee">
          <div className="sp-track">
            {[0, 1].map(dup => (
              <div className="sp-item" key={dup} aria-hidden={dup === 1 ? true : undefined}>
                {SP_TECH.map((t, i) => (
                  <React.Fragment key={t}>
                    <span className="sp-tech-name" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", color: "#FFFFFF", whiteSpace: "nowrap" as const }}>{t}</span>
                    {i < SP_TECH.length - 1 && <span aria-hidden style={{ color: T.accentLt, fontSize: 10, opacity: 0.7 }}>◇</span>}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT EXPORT — default export for Framer
══════════════════════════════════════════════════════════════════════════ */
export default function NadiaMaarLab() {
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
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Space Grotesk', system-ui, sans-serif", minHeight: "100vh", position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <ScrollProgress />
      <Background />
      <FloatingContact />
      <Header />
      <div style={{ position: "relative", zIndex: 1, paddingTop: 64 }}>
        {/* L'ordine racconta una storia: prima il problema, poi che cosa si
            costruisce, poi la prova che funziona, poi come si lavora e con
            quale trasparenza. Il configuratore arriva alla fine, quando chi
            legge ha gli elementi per comporre qualcosa di sensato — prima
            stava al quarto posto, cioè prima ancora dell'elenco dei servizi. */}
        <Hero />
        <DiagnosiBlock />
        <SoluzioniMatrix />
        <ProjectsFeature />
        <ProcessStrip />
        <Cabinet />
        {/* ancora s7: il configuratore è un componente esterno e non può
            portarsela dentro */}
        <div id="s7"><FoundryConfigurator /></div>
        <Contact />
        <Footer />
      </div>
    </div>
  )
}
