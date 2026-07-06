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
import Footer from "./components/Footer"
import FloatingContact from "./components/FloatingContact"
import Header from "./components/Header"

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
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
  p, li { font-weight: 300; line-height: 1.75; }
  button, a[role="button"], .rainbow-btn { font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; }
  ::placeholder { color: rgba(255,255,255,0.22) !important; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #161B22; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 4px; }
  html { scroll-behavior: smooth; }

  @media (max-width: 600px) {
    .contact-modal-content { padding: 20px 18px 24px !important; }
    .contact-modal-grid { grid-template-columns: 1fr !important; }
  }

  :root { --x:-9999; --y:-9999; --xp:0; --yp:0; }

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
      rgba(140,53,37,0.45), rgba(140,53,37,0.20), rgba(176,74,56,0.35), rgba(140,53,37,0.15),
      rgba(140,53,37,0.45), rgba(140,53,37,0.20), rgba(176,74,56,0.35), rgba(140,53,37,0.15));
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
    .hp-method-timeline { overflow-x: auto; padding-bottom: 8px; }
    .hp-method-nav { flex-wrap: wrap !important; }
    .hp-method-nav > button { flex: 0 0 calc(50% - 4px) !important; }
    .hp-allinone-desktop { display: grid !important; }
  }

  /* ── Mobile (<768px): everything 1-col ─────────────────────── */
  @media (max-width: 768px) {
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
    .hp-hero-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; margin-top: 24px !important; }
    .hp-hero-stat-item { padding: 12px 14px !important; gap: 8px !important; }
    .hp-hero-stat-value { font-size: 17px !important; }
    .hp-hero-stat-label { font-size: 10px !important; }
    .hp-method-grid { grid-template-columns: 1fr !important; }
    .hp-method-content { padding: 16px !important; }
    .hp-method-num { font-size: 28px !important; margin-bottom: 8px !important; }
    .hp-method-title { font-size: 14px !important; margin-bottom: 8px !important; }
    .hp-method-body { font-size: 12px !important; line-height: 1.55 !important; }
    .hp-method-visual { border-left: none !important; border-top: 1px solid rgba(255,255,255,0.05) !important; min-height: unset !important; aspect-ratio: 16/9 !important; padding: 12px !important; width: 100% !important; }
    .hp-method-nav > button { flex: 0 0 calc(50% - 4px) !important; padding: 10px 12px !important; font-size: 11px !important; }
    .hp-skillcards { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
    .hp-soluzioni-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
    .hp-soluzioni-grid > div:nth-child(n) { grid-column: 1 / -1 !important; }
    .hp-sol-card { flex-direction: row !important; align-items: flex-start !important; padding: 16px !important; }
    .hp-sol-card-head { flex-direction: column !important; align-items: center !important; margin-bottom: 0 !important; margin-right: 14px !important; gap: 8px !important; flex-shrink: 0 !important; width: 42px !important; }
    .hp-sol-card-num { display: none !important; }
    .hp-sol-card-body { flex: 1 !important; }
    .hp-sol-card-title { font-size: 14px !important; margin-bottom: 8px !important; }
    .hp-sol-card-desc { font-size: 12px !important; margin-bottom: 12px !important; }
    .hp-diagnosi-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
    .hp-diagnosi-col-headers { display: none !important; }
    .hp-diagnosi-row { grid-template-columns: 1fr !important; }
    .hp-diagnosi-row > div:nth-child(2) { display: none !important; }
    .hp-diagnosi-row > div:first-child { border-radius: 16px 16px 0 0 !important; border-right: 1px solid rgba(255,255,255,0.10) !important; border-bottom: none !important; }
    .hp-diagnosi-row > div:last-child { border-radius: 0 0 16px 16px !important; border-left: 1px solid rgba(255,255,255,0.10) !important; border-top: none !important; }
    .hp-allinone-desktop { display: none !important; }
    .hp-allinone-mobile { display: block !important; }
    .hp-tech-card { padding: 10px 12px !important; border-radius: 10px !important; }
    .hp-tc-top { margin-bottom: 0 !important; }
    .hp-tc-metric { font-size: 15px !important; }
    .hp-tc-icon { width: 24px !important; height: 24px !important; border-radius: 6px !important; }
    .hp-tc-icon svg { width: 12px !important; height: 12px !important; }
    .hp-tc-title { font-size: 11px !important; margin-bottom: 2px !important; }
    .hp-tc-body { font-size: 10.5px !important; margin-bottom: 8px !important; line-height: 1.5 !important; }
    .hp-tc-score > div:first-child { margin-bottom: 3px !important; }
    .hp-grid-3 { gap: 7px !important; }
    .hp-purche-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
    .hp-tech-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .hp-contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .hp-contact-row { grid-template-columns: 1fr !important; }
    .hp-footer-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
    .hp-footer-brand { margin-bottom: 32px !important; padding-bottom: 32px !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
    .hp-footer-brand-desc { display: none !important; }
    .hp-footer-nav-col { display: none !important; }
    .hp-footer-contact-col { display: none !important; }
    .hp-hero-live-cards { display: none !important; }
    .hp-risultati-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
    .hp-risultati-grid > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 28px 0 !important; }
    .hp-risultati-grid > div:last-child { border-bottom: none; }
    .hp-risultati-row { gap: 10px 0 !important; flex-direction: column !important; align-items: center !important; text-align: center; }
    .hp-risultati-item { gap: 5px !important; align-items: baseline; }
    .hp-risultati-value { font-size: 18px !important; }
    .hp-risultati-label { font-size: 11px !important; }
    .hp-risultati-sep { display: none !important; }
    .hp-skillcard { padding: 14px !important; aspect-ratio: auto !important; }
    .hp-skillcard h3 { font-size: 12px !important; }
    .hp-skillcard-icon { width: 30px !important; height: 30px !important; border-radius: 8px !important; }
  }

  @media (max-width: 768px) {
    .hp-hero-badge { max-width: 100%; padding: 6px 13px 6px 10px !important; flex-wrap: wrap; }
    .hp-hero-badge-text { white-space: normal !important; letter-spacing: 0.09em !important; font-size: 9px !important; line-height: 1.55; }
  }

  @media (max-width: 480px) {
    .hp-hero-badge-text { letter-spacing: 0.06em !important; font-size: 8.5px !important; }
    .hp-hero-stats { gap: 8px !important; }
    .hp-hero-stat-item { padding: 10px 12px !important; }
    .hp-hero-stat-value { font-size: 15px !important; }
    .hp-hero-stat-label { font-size: 9px !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  html { overflow-x: hidden; max-width: 100%; }
  body { overflow-x: clip; max-width: 100%; touch-action: pan-y; }
  #root { overflow-x: clip; }
`

/* ══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#1A1816",
  bg2:       "#1F1C19",
  surface:   "#262320",
  raised:    "#2E2A27",
  border:    "rgba(255,255,255,0.11)",
  borderHi:  "rgba(16,185,129,0.42)",
  text:      "#FFFFFF",
  muted:     "rgba(255,255,255,0.78)",
  faint:     "rgba(255,255,255,0.58)",
  accent:    "#8C3525",
  accentDim: "rgba(255,255,255,0.06)",
  accentGlo: "rgba(16,185,129,0.22)",
  accentLt:  "#B04A38",
  green:     "#10B981",
  greenGlo:  "rgba(16,185,129,0.28)",
  // neutral card system (contrast + variety)
  steel:     "rgba(255,255,255,0.055)",
  steelHi:   "rgba(255,255,255,0.14)",
  silver:    "rgba(16,185,129,0.92)",
} as const

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"
/* Glass card system */
const G = {
  bg:        "rgba(255,255,255,0.075)",
  bgHov:     "rgba(255,255,255,0.13)",
  bd:        "rgba(255,255,255,0.20)",
  bdHov:     "rgba(255,255,255,0.46)",
  blur:      "blur(34px) brightness(1.14) saturate(0.70)",
  shadow:    "inset 0 1px 0 rgba(255,255,255,0.55), 0 24px 64px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.35)",
  shadowHov: "inset 0 1px 0 rgba(255,255,255,0.72), 0 32px 80px rgba(0,0,0,0.70), 0 6px 18px rgba(0,0,0,0.42)",
} as const
const MONO_STYLE: React.CSSProperties = { fontFamily: MONO, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 12, fontWeight: 500 }

/* white -> amber gradient text fill (matches Solar-Glass headline) */
const gradText = (deg = 100): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${deg}deg, #FFFFFF 0%, #D4897A 48%, #8C3525 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
})

const WRAP: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" }
const SEC: React.CSSProperties  = { padding: "80px 0", position: "relative" }

/* ══════════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════════════════════ */
function useIsMobile(breakpoint = 800) {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= breakpoint)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= breakpoint)
    window.addEventListener("resize", fn, { passive: true })
    return () => window.removeEventListener("resize", fn)
  }, [breakpoint])
  return mobile
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
    <div style={{ display: "inline-flex", alignItems: "center", marginBottom: 20 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "7px 16px 7px 12px",
        borderRadius: 9999,
        background: G.bg,
        backdropFilter: G.blur,
        WebkitBackdropFilter: G.blur,
        border: `1px solid ${G.bd}`,
        boxShadow: "0 2px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.10)",
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.accentLt, flexShrink: 0, boxShadow: `0 0 8px ${T.accentLt}` }} />
        <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.20em", textTransform: "uppercase" as const, color: T.text }}>{text}</span>
      </span>
    </div>
  )
}

function Btn({ children, primary: _primary, small, type = "button", onClick }: {
  children: React.ReactNode; primary?: boolean; small?: boolean; type?: "button" | "submit"; onClick?: () => void
}) {
  return (
    <motion.button type={type} onClick={onClick} className="rainbow-btn"
      whileHover={{ scale: 1.02, opacity: 0.92 }} whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{
        position: "relative", padding: small ? "8px 20px" : "13px 30px",
        borderRadius: 9999, fontSize: 12, fontWeight: 500,
        cursor: "pointer", letterSpacing: "0.14em", textTransform: "uppercase" as const,
        fontFamily: MONO, border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(28px) saturate(1.5)",
        WebkitBackdropFilter: "blur(28px) saturate(1.5)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 12px rgba(0,0,0,0.20)",
        color: T.text, transition: "opacity 0.2s",
      } as React.CSSProperties}
    >
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
      whileHover={{ y: -12, scale: 1.022 }} whileTap={{ scale: 0.982 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      style={{
        '--base': '28', '--spread': '40', '--radius': String(radius), '--border': '1.5', '--size': '270',
        position: "relative",
        backgroundColor: h ? G.bgHov : G.bg,
        backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        borderTop:    `1px solid ${h ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.72)"}`,
        borderRight:  `1px solid ${h ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.22)"}`,
        borderBottom: `1px solid ${h ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)"}`,
        borderLeft:   `1px solid ${h ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.22)"}`,
        borderRadius: radius, padding, height, cursor: onClick ? "pointer" : "default",
        boxShadow: h ? G.shadowHov : G.shadow,
        transition: "background-color 0.25s, border-color 0.25s, box-shadow 0.3s",
      } as React.CSSProperties}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: radius, background: h ? `radial-gradient(160px circle at ${lx}% ${ly}%, rgba(214,222,238,0.16) 0%, transparent 100%)` : "none", transition: "background 0.10s" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: "6%", right: "6%", height: 1, background: `linear-gradient(90deg, transparent, rgba(255,255,255,${h ? 0.22 : 0.10}), transparent)`, pointerEvents: "none", transition: "all 0.3s" }} />

      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   CORNER BRACKETS DECORATION
══════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
   HERO STAT NUMBERS
══════════════════════════════════════════════════════════════════════════ */
/* 4 distinct stat-card treatments — light / graphite / outline / accent */
/* ── V3 Atelier-Grid stat card helpers ─────────────────────────────────── */
function StatCorners() {
  const s: React.CSSProperties = { position: "absolute", width: 10, height: 10, pointerEvents: "none" }
  return (
    <>
      <span style={{ ...s, top: 9, left: 9, borderTop: "1.5px solid rgba(140,53,37,.55)", borderLeft: "1.5px solid rgba(140,53,37,.55)" }} />
      <span style={{ ...s, bottom: 9, right: 9, borderBottom: "1.5px solid rgba(140,53,37,.55)", borderRight: "1.5px solid rgba(140,53,37,.55)" }} />
    </>
  )
}

function statNumeric(v: string): { n: number | null; suffix: string; prefix: string } {
  const m = v.match(/(-?\d+(?:\.\d+)?)/)
  if (!m) return { n: null, suffix: "", prefix: "" }
  const n = parseFloat(m[1])
  if (!Number.isInteger(n)) return { n: null, suffix: "", prefix: "" }
  const idx = v.indexOf(m[1])
  return { n, prefix: v.slice(0, idx), suffix: v.slice(idx + m[1].length) }
}

function StatCountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect() } }, { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let raf = 0
    const start = performance.now(), dur = 1400
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, target])
  return <span ref={ref}>{val}{suffix}</span>
}

function HeroStat({ value, label, index }: { value: string; label: string; index: number }) {
  const [hover, setHover] = useState(false)
  const nm = statNumeric(value)
  return (
    <div
      className="hp-hero-stat-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        borderRadius: 14,
        border: `1px solid ${hover ? "rgba(140,53,37,.55)" : "rgba(255,255,255,0.13)"}`,
        background: hover ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: hover
          ? "inset 0 1.5px 0 rgba(255,255,255,0.55), inset 1px 0 0 rgba(255,255,255,0.14)"
          : "inset 0 1.5px 0 rgba(255,255,255,0.35), inset 1px 0 0 rgba(255,255,255,0.08)",
        padding: "20px 18px",
        overflow: "hidden",
        display: "flex", flexDirection: "column", gap: 0,
        cursor: "default",
        transition: "background .35s ease, border-color .35s ease, transform .35s ease, box-shadow .35s ease",
        transform: hover ? "translateY(-3px)" : "none",
      }}
    >
      {/* rim-light shimmer */}
      <span style={{ position: "absolute", inset: 0, borderRadius: 14, background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 28%, transparent 52%)", pointerEvents: "none" }} />
      {/* brick glow on hover */}
      <span style={{
        position: "absolute", inset: 0, borderRadius: 14,
        background: "radial-gradient(120% 90% at 50% 120%, rgba(140,53,37,.45), transparent 62%)",
        opacity: hover ? 1 : 0, transition: "opacity .35s ease", pointerEvents: "none",
      }} />
      {/* scanline */}
      <span style={{
        position: "absolute", left: 18, bottom: 4, height: 2,
        width: hover ? "calc(100% - 36px)" : 0,
        background: "linear-gradient(90deg, #8C3525, #B04A38)",
        transition: "width .4s cubic-bezier(.2,.7,.2,1)", pointerEvents: "none",
        zIndex: 0,
      }} />
      <StatCorners />
      {/* [01] index */}
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", color: T.accent, marginBottom: 8, position: "relative" }}>
        [0{index + 1}]
      </div>
      {/* value */}
      <span className="hp-hero-stat-value" style={{ fontFamily: MONO, fontSize: "clamp(22px,2.6vw,34px)", fontWeight: 700, lineHeight: 1, letterSpacing: ".02em", color: "#FFFFFF", position: "relative" } as React.CSSProperties}>
        {nm.n !== null ? <>{nm.prefix}<StatCountUp target={nm.n} suffix={nm.suffix} /></> : value}
      </span>
      {/* label */}
      <span className="hp-hero-stat-label" style={{ fontFamily: MONO, fontSize: 10, color: T.accent, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase" as const, lineHeight: 1.4, marginTop: 8, position: "relative", zIndex: 1 } as React.CSSProperties}>
        {label}
      </span>
    </div>
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
const HERO_STATS = [
  { value: "05+", label: "Anni" },
  { value: "30k+", label: "Prodotti" },
  { value: "100%", label: "Custom" },
  { value: "50+", label: "Progetti" },
]

/* Ultra-modern hero side panel */
function HeroLiveCards({ onOpen }: { onOpen: () => void }) {
  const SERVICES = ["E-commerce", "AI Automation", "Web Apps", "Marketing", "API Integration"]
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2800)
    return () => clearInterval(id)
  }, [])

  const card: React.CSSProperties = {
    position: "relative", width: "100%", textAlign: "left", cursor: "pointer",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderTop: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 16px 48px rgba(0,0,0,0.40)",
    color: T.text, overflow: "hidden",
  }

  return (
    <div className="hp-hero-live-cards" style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Card A — status monitor */}
      <motion.button onClick={onOpen} aria-label="Status — apri form"
        whileHover={{ y: -2, borderColor: "rgba(140,53,37,0.45)" }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        style={{ ...card, borderRadius: 14, padding: 0, display: "block" }}
      >
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.24em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.35)" }}>SYS_STATUS</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <PingDot color={T.green} size={5} />
            <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: T.green }}>ACTIVE</span>
          </span>
        </div>

        {/* main metric */}
        <div style={{ padding: "14px 14px 10px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.20em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>DISPONIBILE</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>
              {"< 24"}
              <span style={{ fontSize: 13, fontFamily: MONO, fontWeight: 400, color: T.accentLt, marginLeft: 4, letterSpacing: "0.08em" }}>h</span>
            </div>
          </div>
          {/* mini bar chart */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, paddingBottom: 2 }}>
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} style={{ width: 4, height: h * 0.36, borderRadius: 2, background: i === 6 ? T.accentLt : "rgba(255,255,255,0.18)", transition: "height 0.4s" }} />
            ))}
          </div>
        </div>

        {/* scrolling service ticker */}
        <div style={{ padding: "8px 14px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.16em", color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>NOW→</span>
          <AnimatePresence mode="wait">
            <motion.span key={tick}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.accentLt }}
            >
              {SERVICES[tick % SERVICES.length]}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Card B — project CTA */}
      <motion.button onClick={onOpen} aria-label="Avvia progetto — apri form"
        whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        style={{ ...card, borderRadius: 14, padding: 0, display: "flex", alignItems: "stretch",
          border: "1px solid rgba(176,74,56,0.55)",
          borderTop: "1px solid rgba(176,74,56,0.70)",
          background: "linear-gradient(90deg, rgba(140,53,37,0.22) 0%, rgba(176,74,56,0.10) 100%)",
        }}
      >
        <span style={{ padding: "14px 12px 14px 16px", borderRight: "1px solid rgba(140,53,37,0.35)", display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.22em", color: "rgba(255,180,150,0.70)", flexShrink: 0 }}>[02]</span>
        <div style={{ flex: 1, padding: "14px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.2 }}>Avvia un progetto</span>
          <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.10em", color: "rgba(255,255,255,0.40)" }}>risposta garantita · 50+ clienti</span>
        </div>
        <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ padding: "14px 16px", display: "flex", alignItems: "center", color: T.accentLt, fontSize: 16, flexShrink: 0 }}>→</motion.span>
      </motion.button>
    </div>
  )
}

function Hero() {
  const [formOpen, setFormOpen] = useState(false)
  return (
    <section style={{ ...SEC, minHeight: 800, display: "flex", alignItems: "center", overflow: "clip", position: "relative" }} id="s1" className="hp-sec hp-hero">
      <style>{`
        .hp-hero-geo { position:absolute; inset:0; z-index:0; pointer-events:none; }
        .hp-hero-wordmark { position:absolute; right:14px; top:88px; bottom:auto; z-index:0; pointer-events:none; }
        .hp-hero-wordmark span { writing-mode:vertical-rl; transform:rotate(180deg); display:block; font-family:${DISPLAY}; font-weight:900; font-size:clamp(150px,15vw,214px); letter-spacing:-0.04em; line-height:0.84; white-space:nowrap; color:rgba(75,85,105,0.14); filter:blur(1px); user-select:none; }
        .hp-hero-nm { position:absolute; left:24px; bottom:34px; z-index:1; display:flex; align-items:center; gap:11px; }
        .hp-hero-nm .nm-l { font-family:${DISPLAY}; font-weight:800; font-size:16px; letter-spacing:0.04em; color:#fff; }
        .hp-hero-nm .nm-c { font-family:${MONO}; font-size:8px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.42); line-height:1.6; }
        .hp-hero-squares { position:absolute; left:20px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:24px; z-index:0; }
        .hp-hero-ticker { position:absolute; right:22px; top:96px; display:flex; flex-direction:column; gap:20px; align-items:flex-end; z-index:1; }
        .hp-hero-ticker .tk { display:flex; align-items:center; gap:9px; }
        .hp-hero-ticker .tk-l { width:16px; height:1px; background:rgba(255,255,255,0.24); }
        .hp-hero-ticker .tk-l.on { width:24px; background:${T.accent}; }
        .hp-hero-ticker .tk-n { font-family:${MONO}; font-size:8.5px; letter-spacing:0.16em; color:rgba(255,255,255,0.52); min-width:16px; text-align:right; }
        .hp-hero-ticker .tk-n.on { color:${T.accentLt}; }
        .hp-hero-ed-grid { display:grid; grid-template-columns:1fr 300px; gap:48px; align-items:end; }
        .hp-hl { position:relative; display:inline-block; padding:24px 0 16px 0; }
        .hp-hl-corner { position:absolute; width:15px; height:15px; }
        .hp-hl-corner.tl { top:0; left:0; border-top:1px solid rgba(255,255,255,0.32); border-left:1px solid rgba(255,255,255,0.32); }
        .hp-hl-corner.br { bottom:0; right:0; border-bottom:1px solid rgba(255,255,255,0.32); border-right:1px solid rgba(255,255,255,0.32); }
        .hp-hl-tag { position:absolute; top:3px; left:26px; font-family:${MONO}; font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.52); }
        .hp-hl-dim { position:absolute; right:3px; bottom:2px; font-family:${MONO}; font-size:8.5px; letter-spacing:0.16em; color:rgba(255,255,255,0.24); }
        .hp-hero-meta { display:flex; flex-direction:column; gap:22px; }
        .hp-hero-head-row { display:flex; align-items:flex-start; gap:14px; }
        .hp-hero-social-vert { display:none; }
        .hp-hero-botnav { margin-top:46px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.11); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:18px; }
        .hp-hero-handle { font-family:${MONO}; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.48); text-decoration:none; transition:color 0.2s; }
        .hp-hero-handle:hover { color:#fff; }
        /* ── Ticker/wordmark/deco hide ──────────────────────── */
        @media (max-width:1280px){ .hp-hero-ticker{ display:none; } }
        @media (max-width:1024px){ .hp-hero-wordmark{ display:none; } .hp-hero-squares{ display:none; } .hp-hero-nm{ display:none; } .hp-hero-geo{ display:none; } }

        /* ── Tablet hero (768–1024): compact 2-col, no mobile layout ── */
        @media (max-width:1024px){
          .hp-hero-ed-grid{ grid-template-columns:1fr 260px !important; gap:24px !important; align-items:start; }
          .hp-hero-meta{ gap:14px; }
        }

        /* ── Mobile hero (<768px): 1-col, vertical socials ──────── */
        @media (max-width:768px){
          .hp-hl{ padding:18px 14px 14px; }
          .hp-hero-ed-grid{ grid-template-columns:1fr !important; gap:28px 0 !important; }
          .hp-hero-head-row{ gap:10px; justify-content:space-between; align-items:flex-start; }
          .hp-hero-social-vert{ display:flex; flex-direction:column; gap:7px; flex-shrink:0; margin-top:0; }
          .hp-hero-social-vert a{ width:36px !important; height:36px !important; }
          .hp-hero-desc{ margin-top:20px !important; }
          .hp-hero-spec-block{ display:none !important; }
          .hp-hero-meta-social{ display:none !important; }
          .hp-hero-botnav{ margin-top:20px; padding-top:16px; gap:10px; }
          .hp-hero-scroll{ display:none !important; }
          .hp-hero-stats-row{ display:grid !important; grid-template-columns:repeat(2,1fr) !important; gap:8px !important; width:100%; }
        }
      `}</style>


      {/* frosted-glass wordmark (no stroke) — vertical right */}
      <motion.div className="hp-hero-wordmark" aria-hidden
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 0.15, ease }}>
        <span>MAAR</span>
      </motion.div>

      {/* thin geometric shapes — ultra-modern */}
      <div className="hp-hero-geo" aria-hidden>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", left: -46, top: 250, width: 210, height: 210 }}>
          <svg width="210" height="210" viewBox="0 0 210 210"><circle cx="105" cy="105" r="92" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="2 11" /></svg>
        </motion.div>
        <svg style={{ position: "absolute", left: 64, top: 320 }} width="58" height="58"><circle cx="29" cy="29" r="28" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" /></svg>
        <svg style={{ position: "absolute", left: 774, top: 536 }} width="50" height="44"><path d="M25 2 L48 42 L2 42 Z" fill="none" stroke="rgba(176,74,56,0.22)" strokeWidth="1" /></svg>
        <svg style={{ position: "absolute", left: 74, bottom: 176 }} width="34" height="34"><rect x="8" y="8" width="18" height="18" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" transform="rotate(45 17 17)" /></svg>
        {[[152, 118], [702, 470], [902, 250], [1168, 150]].map(([x, y], i) => (
          <svg key={i} style={{ position: "absolute", left: x, top: y }} width="12" height="12"><path d="M6 0 V12 M0 6 H12" stroke="rgba(255,255,255,0.22)" strokeWidth="1" /></svg>
        ))}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none"><line x1="59%" y1="0" x2="73%" y2="100%" stroke="rgba(255,255,255,0.05)" strokeWidth="1" /></svg>
      </div>

      {/* deco squares (POSSESSD signature) */}
      <div className="hp-hero-squares" aria-hidden>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 32, height: 32, border: "1.5px solid rgba(255,255,255,0.10)", borderRadius: 5 }} />)}
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

      <div style={{ ...WRAP, position: "relative", zIndex: 1 }} className="hp-wrap">
        {/* eyebrow */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} style={{ marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
            <span style={{ color: T.accent }}>//</span>
            <span>[ Development · AI Automation · Performance Marketing ]</span>
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
                  initial={{ opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease }}
                  style={{ fontFamily: DISPLAY, fontSize: "clamp(34px, 5.4vw, 74px)", fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.04em", margin: 0, color: "#FFFFFF", textTransform: "uppercase" as const, filter: "drop-shadow(0 12px 34px rgba(0,0,0,0.6))" }}
                >
                  <span>E-commerce</span><br />
                  <span>Architect</span><br />
                  <span style={{ fontWeight: 300 }}>{"& "}</span>
                  <span>Digital Strategist</span>
                </motion.h1>
              </div>

              {/* mobile-only: social vertical, to the right of the headline */}
              <div className="hp-hero-social-vert">
                {HERO_SOCIALS.map(({ Icon, href, label }) => (
                  <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    data-glow=""
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 16 }}
                    style={{ '--base': '28', '--spread': '36', '--radius': '11', '--border': '1', '--size': '150', width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, border: `1px solid ${G.bd}`, backgroundColor: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, textDecoration: "none", flexShrink: 0 } as React.CSSProperties}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.accentLt; el.style.borderColor = "rgba(140,53,37,0.55)"; el.style.backgroundColor = "rgba(140,53,37,0.16)" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.muted; el.style.borderColor = G.bd; el.style.backgroundColor = G.bg }}
                  >
                    <Icon />
                  </motion.a>
                ))}
              </div>
            </div>

            <motion.p className="hp-hero-desc"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.22, ease }}
              style={{ fontSize: "clamp(14px, 1.3vw, 16px)", color: "rgba(255,255,255,0.62)", fontWeight: 300, maxWidth: 500, lineHeight: 1.8, margin: "28px 0 0", WebkitFontSmoothing: "antialiased" } as React.CSSProperties}
            >
              E-commerce, Web Apps, AI e Performance Marketing. Un'unica mente strategica e codice ad alte prestazioni per il pieno controllo su advertising, promozione e scalabilità del tuo business.
            </motion.p>

            {/* CTAs — under the description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.36, ease }}
              style={{ display: "flex", gap: 10, marginTop: 34, maxWidth: 440 }}
            >
              <motion.button
                onClick={() => document.getElementById("s9")?.scrollIntoView({ behavior: "smooth" })}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{ flex: "1.5 1 0", minHeight: 54, padding: 0, borderRadius: 12, cursor: "pointer", border: "1px solid rgba(176,74,56,0.80)", background: "linear-gradient(90deg, rgba(140,53,37,0.55) 0%, rgba(176,74,56,0.28) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0 36px rgba(140,53,37,0.22), inset 0 1px 0 rgba(255,255,255,0.12)", display: "flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO }}
              >
                <span style={{ padding: "0 14px", borderRight: "1px solid rgba(140,53,37,0.45)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,220,200,0.80)" }}>[01]</span>
                <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
                  <span>Avvia il tuo Progetto</span>
                  <span style={{ fontSize: 14, color: "rgba(255,220,200,0.90)" }}>→</span>
                </span>
              </motion.button>
              <motion.a
                href="/about" whileHover={{ y: -2, background: "rgba(255,255,255,0.10)", borderColor: "rgba(224,224,224,0.38)" }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{ flex: "1 1 0", minHeight: 54, padding: "0 18px", borderRadius: 9, fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" as const, textDecoration: "none", border: "1px solid rgba(255,255,255,0.20)", background: "rgba(255,255,255,0.04)", color: T.text }}
              >
                About Me
              </motion.a>
            </motion.div>

          </div>

          {/* RIGHT — POSSESSD-style meta panel */}
          <motion.div className="hp-hero-meta" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.32, ease }}>
            {/* double glass card — live metric + contact (opens form) */}
            <HeroLiveCards onOpen={() => setFormOpen(true)} />

            <div className="hp-hero-spec-block" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[["Focus", "E-commerce · Growth"], ["ID", "NM — 2026"]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.56)", marginBottom: 5 }}>{l}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: T.text, letterSpacing: "0.02em" }}>{v}</div>
                </div>
              ))}
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.56)", marginBottom: 7 }}>Status</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 13, color: "rgba(190,245,220,0.92)" }}>
                  <PingDot color={T.green} size={7} /> Disponibile
                </div>
              </div>
            </div>

            {/* social — glass icon cards (desktop; hidden on mobile) */}
            <div className="hp-hero-meta-social">
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.56)", marginBottom: 11 }}>Social</div>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {HERO_SOCIALS.map(({ Icon, href, label }) => (
                  <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    data-glow=""
                    whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 16 }}
                    style={{
                      '--base': '28', '--spread': '36', '--radius': '11', '--border': '1', '--size': '150',
                      width: 42, height: 42, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                      color: T.muted, border: `1px solid ${G.bd}`, backgroundColor: G.bg,
                      backdropFilter: G.blur, WebkitBackdropFilter: G.blur, textDecoration: "none", flexShrink: 0,
                    } as React.CSSProperties}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#FFFFFF"; el.style.borderColor = "rgba(235,240,250,0.60)"; el.style.backgroundColor = "rgba(226,232,244,0.18)"; el.style.boxShadow = "0 0 18px rgba(214,222,238,0.28)" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.muted; el.style.borderColor = G.bd; el.style.backgroundColor = G.bg; el.style.boxShadow = "none" }}
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
          <div
            className="hp-hero-stats-row"
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, width: "100%" }}
          >
            {HERO_STATS.map((s, i) => (
              <HeroStat key={s.label} value={s.value} label={s.label} index={i} />
            ))}
          </div>
          <span className="hp-hero-scroll" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.52)" }}>Scorri ↓</span>
        </motion.div>

        {/* ── All-In-One block: immediately after stats ── */}
        <style>{`
          .aio-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
          .ris-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
          @media(max-width:700px){
            .aio-grid { grid-template-columns:1fr !important; gap:10px !important; }
            .ris-grid  { grid-template-columns:1fr !important; gap:10px !important; }
          }
          @media(min-width:701px) and (max-width:960px){
            .aio-grid { grid-template-columns:repeat(2,1fr) !important; }
            .ris-grid  { grid-template-columns:repeat(2,1fr) !important; }
          }
        `}</style>
        <div id="s3" style={{ marginTop: 64, paddingTop: 64, borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.55)", marginBottom: 20 }}>
            <span style={{ color: T.accent }}>//</span>
            <span>[ The All-In-One Advantage ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.4vw,44px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18, maxWidth: 780, color: T.text }}>
            Perché i brand lungimiranti scelgono un unico Partner Strategico?
          </h2>
          <p style={{ fontFamily: MONO, fontSize: "clamp(12.5px,1.4vw,13.5px)", color: T.muted, lineHeight: 1.75, maxWidth: 740, marginBottom: 40 }}>
            Gestire un business online oggi richiede uno sviluppatore, un designer, un esperto di automazioni API e un'agenzia di marketing. Risultato? Costi frammentati, problemi di comunicazione e ritardi continui. Ottieni tutto questo in un'unica soluzione integrata:
          </p>
          <div className="aio-grid">
            {ADVANTAGES.map((a, i) => (
              <CatalogCard key={a.n} index={a.n}>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, lineHeight: 1.25, margin: "0 0 10px", color: "#1A1410" }}>{a.title}</h3>
                <p style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.68, color: "rgba(36,29,24,.68)", margin: 0 }}>{a.body}</p>
              </CatalogCard>
            ))}
          </div>

          {/* Risultati strip — V3 style */}
          <div className="ris-grid" style={{ marginTop: 56, paddingTop: 56, borderTop: `1px solid ${T.border}` }}>
            {RISULTATI.map((r, i) => {
              const nm = statNumeric(r.value)
              return (
                <div
                  key={r.label}
                  style={{
                    position: "relative",
                    border: `1px solid rgba(255,255,255,0.13)`,
                    borderRadius: 14,
                    padding: "30px 26px",
                    background: "rgba(255,255,255,.03)",
                    boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.38), inset 1px 0 0 rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ position: "absolute", inset: 0, borderRadius: 14, background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 28%, transparent 52%)", pointerEvents: "none" }} />
                  <StatCorners />
                  <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(36px,5vw,60px)", letterSpacing: "-.03em", color: T.accentLt, lineHeight: 1 }}>
                    {nm.n !== null
                      ? <>{nm.prefix}<StatCountUp target={nm.n} suffix={nm.suffix} /></>
                      : r.value}
                    {r.symbol && <span style={{ color: T.accent }}>{r.symbol}</span>}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.6, color: T.muted, marginTop: 14, letterSpacing: ".04em" }}>
                    {r.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      <AnimatePresence>
        {formOpen && <ContactModal onClose={() => setFormOpen(false)} />}
      </AnimatePresence>
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

const ADV_VARIANTS = {
  featured: { bg: "rgba(255,255,255,0.13)", bd: "rgba(255,255,255,0.50)", bdT: "rgba(255,255,255,0.80)", bdB: "rgba(255,255,255,0.10)", num: "#FFFFFF",             sh: "0 28px 72px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.72), inset 0 0 0 1px rgba(255,255,255,0.08)", tag: "rgba(255,255,255,0.55)" },
  graphite: { bg: "rgba(255,255,255,0.05)", bd: "rgba(255,255,255,0.20)", bdT: "rgba(255,255,255,0.45)", bdB: "rgba(255,255,255,0.07)", num: "rgba(255,255,255,0.35)", sh: "0 18px 52px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.40), inset 0 0 0 1px rgba(255,255,255,0.05)", tag: "rgba(255,255,255,0.55)" },
  accent:   { bg: "rgba(255,255,255,0.10)", bd: "rgba(255,255,255,0.50)", bdT: "rgba(255,255,255,0.78)", bdB: "rgba(255,255,255,0.10)", num: "#FFFFFF",             sh: "0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.70), inset 0 0 0 1px rgba(255,255,255,0.07)", tag: "rgba(255,255,255,0.72)" },
} as const

function AdvCard({ n, title, body, variant = "graphite", tall = false }: { n: string; title: string; body: string; variant?: keyof typeof ADV_VARIANTS; tall?: boolean }) {
  const V = ADV_VARIANTS[variant]
  return (
    <motion.div
      data-glow="" whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}
      style={{
        '--base': '28', '--spread': '36', '--radius': '18', '--border': '1', '--size': '240',
        position: "relative", height: "100%", borderRadius: 18, overflow: "hidden",
        padding: tall ? "28px 26px" : "20px 20px",
        display: "flex", flexDirection: "column", justifyContent: tall ? "space-between" : "flex-start", gap: tall ? 0 : 10,
        background: V.bg,
        borderTop:    `1px solid ${V.bdT}`,
        borderRight:  `1px solid ${V.bd}`,
        borderBottom: `1px solid ${V.bdB}`,
        borderLeft:   `1px solid ${V.bd}`,
        boxShadow: V.sh,
        backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
      } as React.CSSProperties}
    >
      <span aria-hidden style={{ position: "absolute", top: 14, right: 16, fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.16em", color: V.tag }}>[ {n} ]</span>
      <div style={{ fontFamily: DISPLAY, fontSize: tall ? 68 : 30, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", color: V.num, marginBottom: tall ? 0 : 12 }}>{n}</div>
      <div>
        <h3 style={{ fontSize: tall ? 17 : 14, fontWeight: 600, letterSpacing: "-0.012em", marginBottom: 8, color: T.text, lineHeight: 1.3 }}>{title}</h3>
        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.72, margin: 0 }}>{body}</p>
      </div>
    </motion.div>
  )
}

/* ── V3 CatalogCard (reused for AllInOne) ─────────────────────────── */
function CatalogCard({ index, children, style }: { index?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        borderRadius: 16,
        borderTop: `1px solid ${hover ? "rgba(224,224,224,0.55)" : "rgba(224,224,224,0.22)"}`,
        borderRight: `1px solid ${hover ? "rgba(140,53,37,.55)" : "rgba(255,255,255,0.12)"}`,
        borderBottom: `1px solid ${hover ? "rgba(140,53,37,.55)" : "rgba(255,255,255,0.08)"}`,
        borderLeft: `1px solid ${hover ? "rgba(140,53,37,.55)" : "rgba(255,255,255,0.12)"}`,
        background: hover ? "rgba(255,255,255,.58)" : "rgba(255,255,255,.5)",
        backdropFilter: "blur(36px) saturate(1.1)",
        WebkitBackdropFilter: "blur(36px) saturate(1.1)",
        boxShadow: hover
          ? "inset 0 1.5px 0 rgba(255,255,255,0.95), inset 1px 0 0 rgba(255,255,255,0.35), 0 20px 50px rgba(0,0,0,0.22)"
          : "inset 0 1.5px 0 rgba(255,255,255,0.80), inset 1px 0 0 rgba(255,255,255,0.22), 0 12px 36px rgba(0,0,0,0.16)",
        padding: "26px 24px 24px",
        color: "#241D18",
        overflow: "hidden",
        transition: "background .35s ease, border-color .35s ease, transform .35s ease, box-shadow .35s ease",
        transform: hover ? "translateY(-3px)" : "none",
        height: "100%",
        boxSizing: "border-box" as const,
        ...style,
      }}
    >
      {/* rim-light shimmer — top-left ray of light */}
      <span style={{
        position: "absolute", inset: 0, borderRadius: 16,
        background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, transparent 55%)",
        pointerEvents: "none",
      }} />
      {/* corner brackets */}
      <span style={{ position: "absolute", top: 9, left: 9, width: 10, height: 10, borderTop: "1.5px solid rgba(140,53,37,.55)", borderLeft: "1.5px solid rgba(140,53,37,.55)" }} />
      <span style={{ position: "absolute", bottom: 9, right: 9, width: 10, height: 10, borderBottom: "1.5px solid rgba(140,53,37,.55)", borderRight: "1.5px solid rgba(140,53,37,.55)" }} />
      {/* index */}
      {index && (
        <div style={{ position: "relative", fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "#8C3525", marginBottom: 14 }}>
          [{index}]
        </div>
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  )
}

function AllInOne() {
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }} id="s3" className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          {/* V3 eyebrow: // [ The All-In-One Advantage ] */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.55)", marginBottom: 20 }}>
            <span style={{ color: T.accent }}>//</span>
            <span>[ The All-In-One Advantage ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.4vw,44px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18, maxWidth: 780, color: T.text }}>
            Perché i brand lungimiranti scelgono un unico Partner Strategico?
          </h2>
          <p style={{ fontFamily: MONO, fontSize: 13.5, color: T.muted, lineHeight: 1.75, maxWidth: 740, marginBottom: 40 }}>
            Gestire un business online oggi richiede uno sviluppatore, un designer, un esperto di automazioni API e un'agenzia di marketing. Risultato? Costi frammentati, problemi di comunicazione e ritardi continui. Ottieni tutto questo in un'unica soluzione integrata:
          </p>
        </Reveal>

        {/* 3-column V3 catalog cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {ADVANTAGES.map((a, i) => (
            <Reveal key={a.n} delay={i * 0.07}>
              <CatalogCard index={a.n}>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, lineHeight: 1.25, margin: "0 0 10px", color: "#1A1410" }}>{a.title}</h3>
                <p style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.68, color: "rgba(36,29,24,.68)", margin: 0 }}>{a.body}</p>
              </CatalogCard>
            </Reveal>
          ))}
        </div>

        {/* mobile: stack */}
        <style>{`@media(max-width:680px){.ag-allinone-grid{grid-template-columns:1fr!important;}}`}</style>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §  RISULTATI — Fatti, non promesse
══════════════════════════════════════════════════════════════════════════ */
const RISULTATI = [
  { value: "100%",   symbol: "",    label: "Automazione dei processi di magazzino" },
  { value: "< 0.5",  symbol: "s",   label: "Tempi di caricamento delle piattaforme" },
  { value: "+150",   symbol: "%",   label: "Crescita media del traffico organico (SEO)" },
]

function RisultatiBlock() {
  const SEP = (
    <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(176,74,56,0.38)", flexShrink: 0 }} />
  )
  return (
    <section style={{ padding: "36px 0" }}>
      <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "14px 0" }} className="hp-wrap hp-risultati-row">
        {RISULTATI.map(({ value, symbol, label }, i) => (
          <React.Fragment key={i}>
            <div className="hp-risultati-item" style={{ display: "flex", alignItems: "baseline", gap: 7, flexShrink: 0 }}>
              <span className="hp-risultati-value" style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", color: T.text }}>
                {value}{symbol}
              </span>
              <span className="hp-risultati-label" style={{ fontSize: 13, fontWeight: 400, color: T.muted, whiteSpace: "nowrap" as const }}>
                {label}
              </span>
            </div>
            {i < RISULTATI.length - 1 && <span className="hp-risultati-sep" style={{ margin: "0 28px" }}>{SEP}</span>}
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §  TECNOLOGIA ALL'AVANGUARDIA
══════════════════════════════════════════════════════════════════════════ */
const TECH_POINTS = [
  {
    metric: "< 0.5s",
    score: 96,
    scoreLabel: "Performance",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "Caricamento Istantaneo",
    body: "Un sito istantaneo abbatte il tasso di abbandono e aumenta drasticamente la conversione finale.",
    color: "rgba(251,191,36,1)",
    colorDim: "rgba(251,191,36,0.14)",
    colorBd: "rgba(251,191,36,0.30)",
  },
  {
    metric: "100/100",
    score: 100,
    scoreLabel: "Core Web Vitals",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Core Web Vitals Perfetti",
    body: "Google premia i siti tecnicamente perfetti. Vantaggio competitivo immediato sul posizionamento organico.",
    color: T.accentLt,
    colorDim: "rgba(176,74,56,0.14)",
    colorBd: "rgba(176,74,56,0.32)",
  },
  {
    metric: "99.9%",
    score: 99,
    scoreLabel: "Uptime",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Infrastruttura Serverless",
    body: "Zero downtime durante i picchi di traffico e massima protezione contro le vulnerabilità informatiche.",
    color: T.green,
    colorDim: "rgba(16,185,129,0.12)",
    colorBd: "rgba(16,185,129,0.28)",
  },
]

function TechCard({ metric, score, scoreLabel, icon, title, body, color, colorDim, colorBd, index }: typeof TECH_POINTS[0] & { index: number }) {
  const [hov, setHov] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.div ref={ref}
      className="hp-tech-card"
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.60, delay: index * 0.12, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      style={{
        position: "relative", borderRadius: 20, padding: "28px 26px",
        background: hov ? colorDim : G.bg,
        backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        border: `1px solid ${hov ? colorBd : G.bd}`,
        boxShadow: hov ? `0 16px 48px rgba(0,0,0,0.50), 0 0 0 1px ${colorBd}, inset 0 1px 0 rgba(255,255,255,0.12)` : G.shadow,
        transition: "background 0.28s, border-color 0.28s, box-shadow 0.32s",
        overflow: "hidden", cursor: "default",
      } as React.CSSProperties}
    >
      {/* corner glow */}
      <motion.div aria-hidden animate={{ opacity: hov ? 1 : 0 }} transition={{ duration: 0.28 }}
        style={{ position: "absolute", top: -24, right: -24, width: 110, height: 110, borderRadius: "50%", background: `radial-gradient(circle, ${colorDim} 0%, transparent 70%)`, filter: "blur(16px)", pointerEvents: "none" }}
      />

      {/* top row: metric + icon */}
      <div className="hp-tc-top" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <span className="hp-tc-metric" style={{ fontFamily: MONO, fontSize: 32, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em", color: hov ? color : T.text, transition: "color 0.28s" }}>
          {metric}
        </span>
        <div className="hp-tc-icon" style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: hov ? colorDim : "rgba(255,255,255,0.05)", border: `1px solid ${hov ? colorBd : "rgba(255,255,255,0.10)"}`, color: hov ? color : T.faint, transition: "all 0.25s" }}>
          {icon}
        </div>
      </div>

      {/* title + body */}
      <h3 className="hp-tc-title" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.013em", color: T.text, marginBottom: 8, lineHeight: 1.32 }}>{title}</h3>
      <p className="hp-tc-body" style={{ fontSize: 13, color: T.muted, lineHeight: 1.78, margin: "0 0 22px" }}>{body}</p>

      {/* score bar */}
      <div className="hp-tc-score">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.faint }}>{scoreLabel}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, color: hov ? color : T.faint, transition: "color 0.28s" }}>{score}/100</span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: inView ? `${score}%` : "0%" }}
            transition={{ duration: 1.2, delay: index * 0.15 + 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: "100%", borderRadius: 2, background: hov ? color : `linear-gradient(90deg, ${T.accent}, ${T.accentLt})`, transition: "background 0.28s" }}
          />
        </div>
      </div>

      {/* bottom accent */}
      <motion.div animate={{ scaleX: hov ? 1 : 0 }} transition={{ duration: 0.32, ease }}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, transformOrigin: "left", borderRadius: "0 0 20px 20px" }}
      />
    </motion.div>
  )
}

function TechGauge({ score }: { score: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: shown ? `${score}%` : "0%", background: `linear-gradient(90deg, ${T.accentDim ? T.accent : "#6B2418"}, ${T.accentLt})`, borderRadius: 99, transition: "width 1.3s cubic-bezier(.2,.7,.2,1) .1s" }} />
    </div>
  )
}

function TechBlock() {
  return (
    <section style={{ ...SEC, padding: "80px 0", borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.55)", marginBottom: 20 }}>
            <span style={{ color: T.accent }}>//</span>
            <span>[ Tecnologia all&apos;Avanguardia ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.4vw,46px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 18px", maxWidth: 680, color: T.text }}>
            Perché la Velocità Determina il tuo Fatturato
          </h2>
          <p style={{ fontFamily: MONO, fontSize: "clamp(12.5px,1.4vw,13.5px)", color: T.muted, lineHeight: 1.75, maxWidth: 740, marginBottom: 40 }}>
            Ogni millisecondo conta. Un&apos;architettura tecnica di alto livello non è un lusso — è il fondamento su cui si costruisce la crescita del fatturato.
          </p>
        </Reveal>

        {/* 3 data modules */}
        <style>{`
          .tech-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
          @media(max-width:700px){ .tech-grid { grid-template-columns:1fr !important; gap:10px !important; } }
          @media(min-width:701px) and (max-width:960px){ .tech-grid { grid-template-columns:repeat(2,1fr) !important; } }
        `}</style>
        <div className="tech-grid">
          {TECH_POINTS.map((pt, i) => (
            <motion.div
              key={pt.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08, ease }}
              style={{
                position: "relative",
                border: `1px solid ${T.border}`,
                borderRadius: 16,
                padding: "24px 22px",
                background: "rgba(255,255,255,.04)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.38), inset 1px 0 0 rgba(255,255,255,0.08)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ position: "absolute", inset: 0, borderRadius: 16, background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 28%, transparent 52%)", pointerEvents: "none" }} />
              <StatCorners />
              {/* header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", color: "rgba(255,255,255,.35)" }}>
                  [MODULE.{i + 1}]
                </span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: T.accentLt }}>● LIVE</span>
              </div>
              {/* metric */}
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,3.6vw,42px)", letterSpacing: "-.02em", color: T.accentLt, lineHeight: 1, margin: "0 0 14px" }}>
                {pt.metric}
              </div>
              {/* gauge label + bar */}
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: T.muted, marginBottom: 6 }}>
                <span>{pt.scoreLabel}</span>
                <span style={{ color: T.accentLt }}>{pt.score}/100</span>
              </div>
              <TechGauge score={pt.score} />
              {/* title + body */}
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, margin: "18px 0 8px", color: T.text }}>{pt.title}</h3>
              <p style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.65, color: T.muted, margin: 0, flex: 1 }}>{pt.body}</p>
            </motion.div>
          ))}
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
    <motion.div ref={ref} className="hp-skillcard" data-glow=""
      onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)} onMouseMove={track}
      whileHover={{ y: -8, scale: 1.016 }} whileTap={{ scale: 0.982 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      style={{
        '--base': '28', '--spread': '36', '--radius': '18', '--border': '1', '--size': '200',
        aspectRatio: "1 / 1",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "22px",
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: h ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)",
        backdropFilter: "blur(34px) brightness(1.14) saturate(0.70)",
        WebkitBackdropFilter: "blur(34px) brightness(1.14) saturate(0.70)",
        border: `1px solid ${h ? "rgba(255,255,255,0.36)" : "rgba(255,255,255,0.16)"}`,
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
    gradient: "linear-gradient(135deg, #8C3525 0%, #B04A38 100%)",
    glow: "rgba(140,53,37,0.28)",
    title: "E-commerce ad Alta Conversione",
    desc: "Negozi online veloci, stabili e scalabili. Automazione totale di magazzini, cataloghi massivi e logistica.",
    cta: "Ottimizza il tuo E-commerce",
    href: "/ecommerce",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #AEB6C4 0%, #EDF1F7 100%)",
    glow: "rgba(210,220,235,0.24)",
    title: "Siti Corporate & Lead Generation",
    desc: "Identità digitale d'élite per aziende e professionisti. Design esclusivo focalizzato sull'acquisizione di clienti qualificati.",
    cta: "Potenzia il tuo Brand",
    href: "/corporate",
  },
  {
    num: "03",
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
    num: "04",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #8C3525 0%, #E8B49A 100%)",
    glow: "rgba(140,53,37,0.28)",
    title: "SEO Strategico & Performance Marketing",
    desc: "Posizionamento organico integrato nel codice fin dal primo giorno. Scaliamo Google per intercettare traffico pronto a comprare.",
    cta: "Scala le Classifiche",
    href: "/seo",
  },
  {
    num: "05",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        <circle cx="12" cy="12" r="7" strokeDasharray="2 3"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #B04A38 0%, #E8B49A 100%)",
    glow: "rgba(140,53,37,0.28)",
    title: "Integrazione AI & Sistemi Intelligenti",
    desc: "Soluzioni pratiche basate su Intelligenza Artificiale (Agenti AI, LLM). Abbattiamo i costi di gestione e ottimizziamo la routine.",
    cta: "Innova con l'AI",
    href: "/ai",
  },
]

function SoluzioneCard({ num, icon, gradient, glow, title, desc, cta, index }: typeof SOLUZIONI[0] & { index: number }) {
  const [hovered, setHovered] = useState(false)
  const variant = index === 0 ? "light" : index === SOLUZIONI.length - 1 ? "accent" : "graphite"
  const SV = ({
    light:    { bg: "rgba(255,255,255,0.10)",  bgHov: "rgba(255,255,255,0.17)", bd: "rgba(255,255,255,0.65)", bdHov: "rgba(255,255,255,0.82)" },
    graphite: { bg: "rgba(255,255,255,0.04)",  bgHov: "rgba(255,255,255,0.09)", bd: "rgba(255,255,255,0.18)", bdHov: "rgba(255,255,255,0.36)" },
    accent:   { bg: "rgba(255,255,255,0.10)",  bgHov: "rgba(255,255,255,0.17)", bd: "rgba(255,255,255,0.65)", bdHov: "rgba(255,255,255,0.82)" },
  } as const)[variant]
  return (
    <motion.div
      className="hp-sol-card"
      data-glow=""
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        '--base': '28', '--spread': '36', '--radius': '20', '--border': '1', '--size': '220',
        position: "relative",
        borderRadius: 20,
        padding: "36px 32px 32px",
        background: hovered ? SV.bgHov : SV.bg,
        backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        border: `1px solid ${hovered ? SV.bdHov : SV.bd}`,
        boxShadow: hovered ? `0 18px 50px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.16)` : G.shadow,
        cursor: "pointer",
        transition: "border-color 0.25s, box-shadow 0.3s",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        overflow: "hidden",
      } as React.CSSProperties}
    >
      {/* glow orb on hover */}
      <motion.div
        aria-hidden
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, filter: "blur(30px)", pointerEvents: "none" }}
      />

      {/* left: icon column (стаёт левым блоком на мобайле) */}
      <div className="hp-sol-card-head" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <span className="hp-sol-card-num" style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(242,242,250,0.18)", lineHeight: 1 }}>{num}</span>
        <div className="hp-sol-card-icon" style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: hovered ? gradient : "rgba(255,255,255,0.06)",
          border: `1px solid ${hovered ? "transparent" : "rgba(255,255,255,0.14)"}`,
          boxShadow: hovered ? `0 0 22px ${glow}` : "none",
          color: hovered ? (variant === "graphite" ? "#0A0B0D" : "#fff") : T.silver,
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s, color 0.3s",
        }}>
          {icon}
        </div>
      </div>

      {/* right: text body */}
      <div className="hp-sol-card-body" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 className="hp-sol-card-title" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em", color: T.text, marginBottom: 14 }}>
          {title}
        </h3>

        <p className="hp-sol-card-desc" style={{ fontSize: 14, color: T.muted, lineHeight: 1.78, marginBottom: 28, flex: 1 }}>
          {desc}
        </p>

        <motion.div
          animate={{ x: hovered ? 4 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, ...MONO_STYLE, color: hovered ? T.silver : T.faint, transition: "color 0.25s" }}
        >
          {cta}
          <motion.span animate={{ x: hovered ? 4 : 0 }} transition={{ duration: 0.2 }}>
            <ArrowRightIcon size={11} />
          </motion.span>
        </motion.div>
      </div>

      {/* bottom accent line */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease }}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: gradient, transformOrigin: "left", borderRadius: "0 0 20px 20px" }}
      />
    </motion.div>
  )
}

function SolCard({ s, i }: { s: typeof SOLUZIONI[0]; i: number }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={s.href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 16,
        border: `1px solid ${hover ? "rgba(140,53,37,.55)" : T.border}`,
        background: hover ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.045)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow: hover
          ? "inset 0 1.5px 0 rgba(255,255,255,0.55), inset 1px 0 0 rgba(255,255,255,0.14), 0 20px 50px rgba(0,0,0,0.45)"
          : "inset 0 1.5px 0 rgba(255,255,255,0.38), inset 1px 0 0 rgba(255,255,255,0.08), 0 12px 36px rgba(0,0,0,0.35)",
        padding: "26px 24px 24px",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        transition: "background .35s ease, border-color .35s ease, transform .35s ease, box-shadow .35s ease",
        transform: hover ? "translateY(-3px)" : "none",
        boxSizing: "border-box" as const,
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      {/* rim-light shimmer */}
      <span style={{ position: "absolute", inset: 0, borderRadius: 16, background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 30%, transparent 55%)", pointerEvents: "none" }} />
      {/* brick glow */}
      <span style={{ position: "absolute", inset: 0, borderRadius: 16, background: "radial-gradient(120% 90% at 50% 120%, rgba(140,53,37,.38), transparent 62%)", opacity: hover ? 1 : 0, transition: "opacity .35s ease", pointerEvents: "none" }} />
      {/* scanline */}
      <span style={{ position: "absolute", left: 24, bottom: 14, height: 2, width: hover ? "calc(100% - 48px)" : 0, background: "linear-gradient(90deg, #8C3525, #B04A38)", transition: "width .4s cubic-bezier(.2,.7,.2,1)", pointerEvents: "none" }} />
      {/* corner brackets */}
      <span style={{ position: "absolute", top: 9, left: 9, width: 10, height: 10, borderTop: "1.5px solid rgba(140,53,37,.55)", borderLeft: "1.5px solid rgba(140,53,37,.55)" }} />
      <span style={{ position: "absolute", bottom: 9, right: 9, width: 10, height: 10, borderBottom: "1.5px solid rgba(140,53,37,.55)", borderRight: "1.5px solid rgba(140,53,37,.55)" }} />
      {/* index */}
      <div style={{ position: "relative", fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: T.accent, marginBottom: 14 }}>[{s.num}]</div>
      <h3 style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 700, fontSize: i === 0 ? 22 : 18, lineHeight: 1.25, margin: "0 0 10px", color: T.text }}>
        {s.title}
      </h3>
      <p style={{ position: "relative", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.68, color: T.muted, margin: "0 0 18px", flex: 1 }}>
        {s.desc}
      </p>
      <span style={{ position: "relative", fontFamily: MONO, fontSize: 12, letterSpacing: ".06em", color: T.accentLt, fontWeight: 600 }}>
        {s.cta} →
      </span>
    </a>
  )
}

function SoluzioniMatrix() {
  return (
    <section style={{ ...SEC, padding: "80px 0", borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.55)", marginBottom: 20 }}>
            <span style={{ color: T.accent }}>//</span>
            <span>[ Core Skills &amp; Tech Stack ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.6vw,48px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.025em", margin: "0 0 40px", maxWidth: 780, color: T.text }}>
            Soluzioni su misura per scalare il tuo business online
          </h2>
        </Reveal>

        {/* bento 6-col — first spans full, pairs of 3 after */}
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

function DiagnosiRow({ problem, solution, index }: typeof DIAGNOSI_PS[0] & { index: number }) {
  const [hov, setHov] = useState(false)
  const isMobile = useIsMobile()
  const active = hov || isMobile
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.60, delay: index * 0.10, ease }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      className="hp-diagnosi-row"
      style={{ display: "grid", gridTemplateColumns: "1fr 56px 1fr", alignItems: "stretch", gap: 0 }}
    >
      {/* ── PROBLEMA ── */}
      <div style={{
        position: "relative", borderRadius: "16px 0 0 16px",
        padding: "28px 28px",
        background: active ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)",
        backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        borderTop: `1px solid ${active ? "rgba(239,68,68,0.30)" : "rgba(255,255,255,0.10)"}`,
        borderLeft: `1px solid ${active ? "rgba(239,68,68,0.30)" : "rgba(255,255,255,0.10)"}`,
        borderBottom: `1px solid ${active ? "rgba(239,68,68,0.30)" : "rgba(255,255,255,0.10)"}`,
        borderRight: "none",
        transition: "background 0.28s, border-color 0.28s",
        overflow: "hidden",
      }}>
        <motion.div aria-hidden
          animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 0.30 }}
          style={{ position: "absolute", top: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.14) 0%, transparent 70%)", filter: "blur(18px)", pointerEvents: "none" }}
        />
        {/* label */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: active ? "#FCA5A5" : "rgba(239,68,68,0.55)", transition: "color 0.28s" }}>Problema</span>
        </div>
        {/* icon + title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${active ? "rgba(239,68,68,0.30)" : "rgba(255,255,255,0.09)"}`, color: active ? "#FCA5A5" : "rgba(242,242,250,0.50)", transition: "all 0.25s" }}>
            {problem.icon}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.014em", color: T.text, margin: 0, lineHeight: 1.32, paddingTop: 2 }}>{problem.title}</h3>
        </div>
        <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.78, margin: 0 }}>{problem.body}</p>
        {/* bottom accent */}
        <motion.div animate={{ scaleX: active ? 1 : 0 }} transition={{ duration: 0.32, ease }}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, rgba(239,68,68,0.65), rgba(251,113,133,0.35))", transformOrigin: "left" }} />
      </div>

      {/* ── ARROW ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.025)", borderTop: `1px solid rgba(255,255,255,0.08)`, borderBottom: `1px solid rgba(255,255,255,0.08)`, flexShrink: 0 }}>
        <motion.div
          animate={{ x: active ? 3 : 0, color: active ? T.silver : "rgba(255,255,255,0.22)" }}
          transition={{ duration: 0.24 }}
          style={{ fontSize: 18, lineHeight: 1 }}
        >→</motion.div>
      </div>

      {/* ── SOLUZIONE ── */}
      <div style={{
        position: "relative", borderRadius: "0 16px 16px 0",
        padding: "28px 28px",
        background: active ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        borderTop: `1px solid ${active ? "rgba(235,240,250,0.34)" : "rgba(255,255,255,0.10)"}`,
        borderRight: `1px solid ${active ? "rgba(235,240,250,0.34)" : "rgba(255,255,255,0.10)"}`,
        borderBottom: `1px solid ${active ? "rgba(235,240,250,0.34)" : "rgba(255,255,255,0.10)"}`,
        borderLeft: "none",
        transition: "background 0.28s, border-color 0.28s",
        overflow: "hidden",
      }}>
        <motion.div aria-hidden
          animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 0.30 }}
          style={{ position: "absolute", top: -20, right: -20, width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,222,238,0.15) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }}
        />
        {/* label */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: active ? T.silver : "rgba(210,218,236,0.50)", transition: "color 0.28s" }}>Soluzione</span>
        </div>
        {/* icon + title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "rgba(222,230,245,0.14)" : "rgba(255,255,255,0.05)", border: `1px solid ${active ? "rgba(235,240,250,0.34)" : "rgba(255,255,255,0.09)"}`, color: active ? T.silver : "rgba(242,242,250,0.50)", transition: "all 0.25s" }}>
            {solution.icon}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.014em", color: T.text, margin: 0, lineHeight: 1.32, paddingTop: 2 }}>{solution.title}</h3>
        </div>
        <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.78, margin: 0 }}>{solution.body}</p>
        {/* bottom accent */}
        <motion.div animate={{ scaleX: active ? 1 : 0 }} transition={{ duration: 0.32, ease }}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, rgba(228,234,246,0.75), rgba(185,196,216,0.40))", transformOrigin: "left" }} />
      </div>
    </motion.div>
  )
}

function DiagnosiBlock() {
  return (
    <section style={{ ...SEC, padding: "80px 0", borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">

        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.55)", marginBottom: 20 }}>
            <span style={{ color: T.accent }}>//</span>
            <span>[ Il Problema — La Diagnosi ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.4vw,46px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 40px", maxWidth: 680, color: T.text }}>
            Sei bloccato in una di queste situazioni?
          </h2>
        </Reveal>

        {/* 2-col bento, each cell split Problema | Soluzione */}
        <style>{`
          .diag-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
          @media(max-width:700px){ .diag-grid { grid-template-columns:1fr !important; gap:10px !important; } }
          .diag-cell { border:1px solid ${T.border}; border-radius:16px; overflow:hidden; display:grid; grid-template-columns:1fr 1fr; }
          @media(max-width:700px){ .diag-cell { grid-template-columns:1fr !important; } }
        `}</style>
        <div className="diag-grid">
          {DIAGNOSI_PS.map((d, i) => (
            <motion.div
              key={i}
              className="diag-cell"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: (i % 2) * 0.07, ease }}
            >
              {/* Problema */}
              <div style={{ padding: "24px 22px", borderRight: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".16em", color: "rgba(255,255,255,.35)", textTransform: "uppercase" as const, marginBottom: 12 }}>
                  [ Problema ]
                </div>
                <h4 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, margin: "0 0 8px", color: T.text, lineHeight: 1.3 }}>
                  {d.problem.title}
                </h4>
                <p style={{ fontFamily: MONO, fontSize: 11.5, lineHeight: 1.65, color: "rgba(255,255,255,.45)", margin: 0 }}>
                  {d.problem.body}
                </p>
              </div>
              {/* Soluzione — brick glow */}
              <div style={{ position: "relative", padding: "24px 22px", background: "radial-gradient(120% 100% at 100% 0%, rgba(140,53,37,.18), transparent 65%)" }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".16em", color: T.accentLt, textTransform: "uppercase" as const, marginBottom: 12 }}>
                  [ Soluzione ]
                </div>
                <h4 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, margin: "0 0 8px", color: T.text, lineHeight: 1.3 }}>
                  {d.solution.title}
                </h4>
                <p style={{ fontFamily: MONO, fontSize: 11.5, lineHeight: 1.65, color: T.muted, margin: 0 }}>
                  {d.solution.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §  IL MIO METODO — Perché lavorare con me
══════════════════════════════════════════════════════════════════════════ */
const PERCHE_ITEMS = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Capacità di gestire la complessità",
    body: "Sviluppo architetture pesanti. Sincronizzo ecosistemi con oltre 35.000 prodotti in tempo reale, senza far crollare le performance del sito.",
    metric: "35.000+",
    metricLabel: "prodotti sincronizzati",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Trasparenza e Approccio Diretto",
    body: "Comunicazione chiara, zero costi nascosti, rispetto rigoroso di scadenze e confini. So esattamente quanto costa il tuo tempo.",
    metric: "0",
    metricLabel: "costi nascosti",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
        <line x1="18" y1="8" x2="22" y2="8"/><line x1="20" y1="6" x2="20" y2="10"/>
      </svg>
    ),
    title: "Unico Referente, Zero Scuse",
    body: "Sviluppo tecnico, logica aziendale, integrazione AI e SEO gestiti da un'unica mente strategica. Nessun rimpallo di responsabilità.",
    metric: "1",
    metricLabel: "referente strategico",
  },
]

function PurcheCard({ num, icon, title, body, metric, metricLabel, index }: typeof PERCHE_ITEMS[0] & { index: number }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      data-glow=""
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.10, ease }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        '--base': '28', '--spread': '36', '--radius': '20', '--border': '1', '--size': '220',
        position: "relative", borderRadius: 20, padding: "36px 30px 30px",
        backgroundColor: hov ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.05)",
        backdropFilter: "blur(34px) brightness(1.14) saturate(0.70)",
        WebkitBackdropFilter: "blur(34px) brightness(1.14) saturate(0.70)",
        border: `1px solid ${hov ? "rgba(255,255,255,0.44)" : "rgba(255,255,255,0.14)"}`,
        boxShadow: hov
          ? "0 16px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.60)"
          : "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.30)",
        transition: "background-color 0.28s, border-color 0.28s, box-shadow 0.32s",
        display: "flex", flexDirection: "column", gap: 0, overflow: "hidden", cursor: "default",
      } as React.CSSProperties}
    >
      {/* purple glow orb */}
      <motion.div aria-hidden
        animate={{ opacity: hov ? 1 : 0 }} transition={{ duration: 0.3 }}
        style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,222,238,0.16) 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }}
      />

      {/* top row: num + icon */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(242,242,250,0.18)", lineHeight: 1 }}>{num}</span>
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: hov ? "linear-gradient(135deg, #E4EAF6 0%, #B9C4D8 100%)" : "rgba(222,230,245,0.10)",
          border: `1px solid ${hov ? "transparent" : "rgba(235,240,250,0.24)"}`,
          color: hov ? "#141821" : T.silver,
          boxShadow: hov ? "0 0 22px rgba(214,222,238,0.36)" : "none",
          transition: "background 0.28s, border-color 0.28s, color 0.28s, box-shadow 0.28s",
        }}>
          {icon}
        </div>
      </div>

      {/* metric callout */}
      <div style={{ marginBottom: 16 }}>
        <span style={{
          fontSize: 36, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em",
          color: "#FFFFFF",
        }}>{metric}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.silver, letterSpacing: "0.10em", textTransform: "uppercase" as const, marginLeft: 10, verticalAlign: "middle", opacity: 0.80 }}>{metricLabel}</span>
      </div>

      {/* title */}
      <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.018em", color: T.text, marginBottom: 12, lineHeight: 1.28 }}>
        {title}
      </h3>

      {/* body */}
      <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.80, margin: 0, flex: 1 }}>
        {body}
      </p>

      {/* bottom accent line */}
      <motion.div
        animate={{ scaleX: hov ? 1 : 0 }}
        transition={{ duration: 0.34, ease }}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #E4EAF6, #B9C4D8)", transformOrigin: "left", borderRadius: "0 0 20px 20px" }}
      />
    </motion.div>
  )
}

function PurcheBlock() {
  return (
    <section style={{ ...SEC, padding: "80px 0", borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.55)", marginBottom: 20 }}>
            <span style={{ color: T.accent }}>//</span>
            <span>[ Il Mio Metodo ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.6vw,48px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 40px", maxWidth: 560, color: T.text }}>
            Perché lavorare con me.
          </h2>
        </Reveal>

        <style>{`
          .purche-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
          @media(max-width:700px){ .purche-grid { grid-template-columns:1fr !important; gap:10px !important; } }
          @media(min-width:701px) and (max-width:960px){ .purche-grid { grid-template-columns:repeat(2,1fr) !important; } }
        `}</style>
        <div className="purche-grid">
          {PERCHE_ITEMS.map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08, ease }}
              style={{ display: "flex" }}
            >
              <CatalogCard index={item.num} style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,3.6vw,40px)", color: T.accentLt, letterSpacing: "-.02em", marginBottom: 4, lineHeight: 1 }}>
                  {item.metric}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", color: T.muted, textTransform: "uppercase" as const, marginBottom: 16 }}>
                  {item.metricLabel}
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, margin: "0 0 8px", color: "#1A1410", lineHeight: 1.3 }}>{item.title}</h3>
                <p style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.65, color: "rgba(36,29,24,.65)", margin: 0, flex: 1 }}>{item.body}</p>
              </CatalogCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillsCardsGrid() {
  return (
    <section style={{ ...SEC, padding: "44px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }} className="hp-sec">
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
    <defs><linearGradient id="sk-g1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#B04A38"/><stop offset="1" stopColor="#FFFFFF"/></linearGradient></defs>
    <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="url(#sk-g1)"/>
    <polyline points="2 17 12 22 22 17" stroke="url(#sk-g1)"/>
    <polyline points="2 12 12 17 22 12" stroke="url(#sk-g1)"/>
  </svg>
)
const SkillIconCpu = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
    <defs><linearGradient id="sk-g2" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#B04A38"/><stop offset="1" stopColor="#FFFFFF"/></linearGradient></defs>
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
    <defs><linearGradient id="sk-g3" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#B04A38"/><stop offset="1" stopColor="#FFFFFF"/></linearGradient></defs>
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
      <div data-glow="" style={{ '--base': '28', '--spread': '40', '--radius': '16', '--border': '1.5', '--size': '270', borderRadius: 16, position: "relative", backgroundColor: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${open ? "rgba(255,255,255,0.42)" : G.bd}`, boxShadow: open ? G.shadowHov : G.shadow, transition: "background-color 0.25s, border-color 0.25s, box-shadow 0.3s" } as React.CSSProperties}>

        <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 18, padding: "26px 32px", background: open ? "rgba(255,255,255,0.06)" : "transparent", border: "none", cursor: "pointer", color: T.text, textAlign: "left", fontFamily: "inherit", transition: "background 0.25s" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: open ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", border: `1px solid ${open ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.22)"}`, boxShadow: open ? "0 0 14px rgba(214,222,238,0.24), inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.05)", transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s" }}>
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
          stroke="rgba(176,74,56,0.28)" strokeWidth="1" fill="none" strokeDasharray="4 3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
        />
      ))}
      <motion.circle cx={cx} cy={cy} r={36} fill="rgba(140,53,37,0.07)"
        animate={{ r: [36, 45, 36] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle cx={cx} cy={cy} r={28}
        fill="rgba(140,53,37,0.18)" stroke="rgba(176,74,56,0.55)" strokeWidth="1.5"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 250, delay: 0.1 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={9} fontWeight="700"
        fill="rgba(255,255,255,0.82)" fontFamily="Inter,sans-serif">Business</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize={6.5} fill="rgba(176,74,56,0.5)"
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
        <motion.circle key={`p${i}`} cx={cx} cy={cy} r={2.5} fill="#B04A38"
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
        fill="rgba(140,53,37,0.09)" stroke="rgba(176,74,56,0.20)" strokeWidth="1"
        initial={{ opacity: 0, scaleX: 0.7 }} animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.34, duration: 0.4, ease: [0.16,1,0.3,1] }}
        style={{ transformOrigin: "150px 101px" }}
      />
      <motion.rect x={55} y={90} width={0} height={8} rx={4} fill="rgba(176,74,56,0.45)"
        animate={{ width: 110 }} transition={{ delay: 0.54, duration: 0.5 }}
      />
      <motion.rect x={80} y={105} width={0} height={5} rx={3} fill="rgba(255,255,255,0.14)"
        animate={{ width: 60 }} transition={{ delay: 0.68, duration: 0.35 }}
      />
      <motion.rect x={167} y={89} width={2} height={11} rx={1} fill="rgba(176,74,56,0.75)"
        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.9 }}
      />
      {[25,112,199].map((x, i) => (
        <motion.g key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54 + i * 0.09, duration: 0.35, ease: [0.16,1,0.3,1] }}
        >
          <rect x={x} y={138} width={76} height={54} rx={7}
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          <circle cx={x+38} cy={157} r={9} fill="rgba(140,53,37,0.17)"/>
          <rect x={x+16} y={172} width={44} height={4} rx={2} fill="rgba(255,255,255,0.10)"/>
          <rect x={x+22} y={180} width={32} height={3} rx={2} fill="rgba(255,255,255,0.06)"/>
        </motion.g>
      ))}
    </svg>
  )
}

function VisualAPI() {
  const boxes = [
    { label: "Fornitore", sub: "ERP/CRM",     x: 14,  y: 72, w: 76, h: 86,  ac: "rgba(140,53,37,0.16)", bd: "rgba(176,74,56,0.36)" },
    { label: "API Layer", sub: "Middleware",   x: 112, y: 50, w: 76, h: 130, ac: "rgba(176,74,56,0.10)", bd: "rgba(176,74,56,0.40)" },
    { label: "Shopify",   sub: "+ Analytics",  x: 210, y: 72, w: 76, h: 86,  ac: "rgba(140,53,37,0.16)", bd: "rgba(176,74,56,0.36)" },
  ]
  return (
    <svg viewBox="0 0 300 230" width="100%" height="100%">
      <motion.text x={150} y={20} textAnchor="middle" fontSize={15} fontWeight="800"
        fill="rgba(255,255,255,0.82)" fontFamily="Inter,sans-serif"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      >30.247 SKU</motion.text>
      <motion.text x={150} y={36} textAnchor="middle" fontSize={7} fill="rgba(176,74,56,0.48)"
        fontFamily="Inter,sans-serif"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
      >sincronizzati in tempo reale</motion.text>
      {[[90,115,112,115],[188,115,210,115]].map(([x1,y1,x2,y2], i) => (
        <motion.path key={i} d={`M${x1},${y1}L${x2},${y2}`}
          stroke="rgba(176,74,56,0.26)" strokeWidth="1.5" fill="none" strokeDasharray="5 3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.15 }}
        />
      ))}
      {[112,210].map((x, i) => (
        <motion.polygon key={i} points={`${x},111 ${x},119 ${x+7},115`}
          fill="rgba(176,74,56,0.48)"
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
          x={edge===0 ? 86 : 184} y={112} width={8} height={6} rx={2} fill="rgba(176,74,56,0.65)"
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
          <stop offset="0%" stopColor="#8C3525"/><stop offset="100%" stopColor="#E8B49A"/>
        </linearGradient>
        <linearGradient id="mga" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(140,53,37,0.20)"/><stop offset="100%" stopColor="rgba(140,53,37,0)"/>
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
          fill="rgba(255,255,255,0.82)" stroke="rgba(5,5,10,0.8)" strokeWidth="2"
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
            fill="rgba(140,53,37,0.16)" stroke="rgba(176,74,56,0.35)" strokeWidth="1"/>
          <text x={m.x+29} y={m.y-1} textAnchor="middle" fontSize={13} fontWeight="800"
            fill="rgba(255,255,255,0.82)" fontFamily="Inter,sans-serif">{m.v}</text>
          <text x={m.x+29} y={m.y+9} textAnchor="middle" fontSize={7}
            fill="rgba(176,74,56,0.52)" fontFamily="Inter,sans-serif">{m.l}</text>
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
  const [step, setStep] = useState(0)
  const [tick, setTick] = useState(0)
  const STEP_MS = 9000

  useEffect(() => {
    const t = setTimeout(() => { setStep(s => (s + 1) % 4); setTick(k => k + 1) }, STEP_MS)
    return () => clearTimeout(t)
  }, [step])

  const goTo = (i: number) => { setStep(i); setTick(k => k + 1) }
  const Visual = METHOD_VISUALS[step]

  return (
    <div>
      {/* ── Timeline ── */}
      <div className="hp-method-timeline" style={{ display: "flex", alignItems: "center", marginBottom: 32, position: "relative" }}>
        {METHOD_STEPS.map((s, i) => (
          <React.Fragment key={i}>
            {/* connector line */}
            {i > 0 && (
              <div style={{ flex: 1, height: 1, position: "relative", background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease }}
                  style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${T.accent}, ${T.accentLt})`, height: "100%" }}
                />
              </div>
            )}

            {/* step node */}
            <button onClick={() => goTo(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <motion.div
                animate={step === i
                  ? { background: `linear-gradient(135deg, ${T.accent}, ${T.accentLt})`, borderColor: T.accentLt, boxShadow: `0 0 0 4px rgba(140,53,37,0.18), 0 0 24px rgba(140,53,37,0.40)` }
                  : i < step
                    ? { background: "rgba(140,53,37,0.22)", borderColor: "rgba(176,74,56,0.50)", boxShadow: "none" }
                    : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.14)", boxShadow: "none" }
                }
                transition={{ duration: 0.35 }}
                style={{ width: 48, height: 48, borderRadius: "50%", border: "1.5px solid", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}
              >
                {/* progress ring for active */}
                {step === i && (
                  <svg style={{ position: "absolute", inset: 0, width: 48, height: 48, transform: "rotate(-90deg)" }}>
                    <motion.circle cx={24} cy={24} r={22}
                      fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      key={tick}
                      initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                    />
                  </svg>
                )}
                {/* checkmark for done, number for others */}
                {i < step
                  ? <span style={{ fontSize: 16, color: T.accentLt }}>✓</span>
                  : <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: step === i ? "#fff" : T.faint, letterSpacing: "0.04em" }}>{s.n}</span>
                }
              </motion.div>

              <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: step === i ? T.accentLt : T.faint, transition: "color 0.3s", whiteSpace: "nowrap" as const }}>
                {s.label}
              </span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* ── Content card ── */}
      <motion.div
        style={{
          borderRadius: 20, overflow: "hidden", position: "relative",
          background: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.07)",
        } as React.CSSProperties}
      >
        {/* giant watermark number */}
        <AnimatePresence mode="wait">
          <motion.div key={`wm-${step}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            aria-hidden
            style={{ position: "absolute", top: -10, left: -6, fontFamily: MONO, fontSize: 140, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.06em", color: "rgba(255,255,255,0.028)", pointerEvents: "none", userSelect: "none", zIndex: 0 }}
          >
            {METHOD_STEPS[step].n}
          </motion.div>
        </AnimatePresence>

        <div className="hp-method-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative", zIndex: 1 }}>
          {/* left: content */}
          <div className="hp-method-content" style={{ padding: "24px 26px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 10px", borderRadius: 9999, background: "rgba(140,53,37,0.12)", border: "1px solid rgba(176,74,56,0.28)", marginBottom: 12 }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: T.accentLt }}>{METHOD_STEPS[step].label}</span>
                </div>
                <h3 className="hp-method-title" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.016em", color: T.text, marginBottom: 10, lineHeight: 1.28 }}>
                  {METHOD_STEPS[step].title}
                </h3>
                <p className="hp-method-body" style={{ fontSize: 13, color: T.muted, lineHeight: 1.75, margin: 0 }}>
                  {METHOD_STEPS[step].body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* right: animated visual */}
          <div className="hp-method-visual" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.14)", borderLeft: "1px solid rgba(255,255,255,0.05)", padding: 12, minHeight: 130 }}>
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: "100%", height: "100%" }}
              >
                <Visual />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Method() {
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }} id="s5" className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
            <span style={{ color: T.accent }}>//</span>
            <span>[ Il Metodo di Lavoro ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.4vw,44px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 48, maxWidth: 580, color: "#FFFFFF" }}>
            Una roadmap chiara e trasparente, orientata ai risultati
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
          {h && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${T.accentDim}, rgba(140,53,37,0.07))` }} />}
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
    <section id="s6" style={{ ...SEC, padding: "80px 0", borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.55)", marginBottom: 20 }}>
            <span style={{ color: T.accent }}>//</span>
            <span>[ Social Proof / Portfolio ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.4vw,44px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 18px", maxWidth: 680, color: T.text }}>
            Piattaforme che Guidano la Crescita
          </h2>
          <p style={{ fontFamily: MONO, fontSize: "clamp(12.5px,1.4vw,13.5px)", color: T.muted, lineHeight: 1.75, maxWidth: 620, marginBottom: 40 }}>
            Esplora i progetti commerciali e corporate che ho ingegnerizzato, trasformandoli in asset digitali ad alto rendimento.
          </p>
        </Reveal>

        <style>{`
          .portfolio-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
          @media(max-width:700px){ .portfolio-grid { grid-template-columns:1fr !important; gap:10px !important; } }
          @media(min-width:701px) and (max-width:960px){ .portfolio-grid { grid-template-columns:repeat(2,1fr) !important; } }
        `}</style>
        <div className="portfolio-grid">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.07, ease }}
              style={{ display: "flex" }}
            >
              <CatalogCard index={`0${i + 1}`} style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(255,255,255,.3)", marginBottom: 12 }}>
                  ls ~/projects/0{i + 1}
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, margin: "0 0 10px", color: "#1A1410", lineHeight: 1.25 }}>
                  {p.title}
                </h3>
                <p style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.65, color: "rgba(36,29,24,.65)", margin: "0 0 16px", flex: 1 }}>
                  {p.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ fontFamily: MONO, fontSize: 10.5, color: "#8C3525", border: "1px solid rgba(140,53,37,.3)", borderRadius: 6, padding: "4px 9px" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </CatalogCard>
            </motion.div>
          ))}
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
const FAQS = [
  { q: "D: Quale piattaforma è meglio per il mio business: Shopify o Framer?", a: "R: Dipende dal progetto. Se hai bisogno di un e-commerce con migliaia di prodotti e logistica complessa integrata, Shopify è imbattibile. Se cerchi un sito aziendale, una landing page o un portfolio ad altissimo impatto visivo e design sartoriale, Framer è la scelta ideale. Valuteremo lo strumento perfetto durante la nostra prima call." },
  { q: "D: Puoi collegare qualsiasi fornitore o gestionale al mio sito?", a: "R: Sì. Sviluppo integrazioni API personalizzate e middleware su misura per sincronizzare in tempo reale stock, prezzi e ordini con i principali fornitori ed ERP europei e globali, eliminando la gestione manuale." },
  { q: `D: Offri anche la gestione della pubblicità dopo lo sviluppo?`, a: `R: Certamente. Un sito eccellente non serve a nulla senza traffico qualificato. Offro un servizio completo "chiavi in mano" che include il lancio, il tracciamento avanzato e l'ottimizzazione di campagne pubblicitarie su Meta, Google e Pinterest.` },
]

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <motion.div data-glow="" whileHover={open ? {} : { scale: 1.008 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{ '--base': '28', '--spread': '40', '--radius': '14', '--border': '1.5', '--size': '260', borderRadius: 14, position: "relative", backgroundColor: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${open ? "rgba(255,255,255,0.42)" : G.bd}`, boxShadow: open ? G.shadowHov : G.shadow, transition: "background-color 0.25s, border-color 0.25s, box-shadow 0.3s" } as React.CSSProperties}
    >

      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "22px 28px", background: open ? "rgba(255,255,255,0.06)" : "transparent", border: "none", cursor: "pointer", color: T.text, textAlign: "left", fontFamily: "inherit", transition: "background 0.25s" }}>
        <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }} style={{ fontSize: 24, color: T.silver, flexShrink: 0, lineHeight: 1 }}>+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 28px 26px", background: "rgba(255,255,255,0.04)" }}>
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
/* ── Glass form fields ── */
function GlassInput({ label, placeholder, type = "text", value, onChange }: {
  label: string; placeholder: string; type?: string; value: string; onChange: (v: string) => void
}) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: f ? T.accentLt : T.faint, marginBottom: 8, transition: "color 0.2s" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setF(true)} onBlur={() => setF(false)} required
        style={{ width: "100%", padding: "13px 16px", background: f ? "rgba(140,53,37,0.07)" : "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${f ? "rgba(176,74,56,0.55)" : "rgba(255,255,255,0.11)"}`, borderRadius: 12, color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit", boxShadow: f ? "0 0 0 3px rgba(140,53,37,0.11), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s" }} />
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
        style={{ width: "100%", padding: "13px 16px", background: f ? "rgba(140,53,37,0.07)" : "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${f ? "rgba(176,74,56,0.55)" : "rgba(255,255,255,0.11)"}`, borderRadius: 12, color: T.text, fontSize: 14, outline: "none", resize: "none" as const, fontFamily: "inherit", boxSizing: "border-box" as const, boxShadow: f ? "0 0 0 3px rgba(140,53,37,0.11), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s" }} />
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
        style={{ width: "100%", padding: "13px 16px", background: f ? "rgba(140,53,37,0.07)" : "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${f ? "rgba(176,74,56,0.55)" : "rgba(255,255,255,0.11)"}`, borderRadius: 12, color: value ? T.text : T.faint, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit", appearance: "none" as const, cursor: "pointer", boxShadow: f ? "0 0 0 3px rgba(140,53,37,0.11), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.04)", transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s" }}>
        <option value="" disabled style={{ background: "#141415", color: T.muted }}>Seleziona un'area...</option>
        {options.map(o => <option key={o} value={o} style={{ background: "#141415", color: T.text }}>{o}</option>)}
      </select>
    </div>
  )
}

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
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    color: "#FFFFFF", fontFamily: MONO, fontSize: 12,
    letterSpacing: "0.04em", outline: "none",
    transition: "border-color .2s, background .2s",
    boxSizing: "border-box" as const,
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: MONO, fontSize: 10, letterSpacing: ".16em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.38)", marginBottom: 6, display: "block",
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
        background: "rgba(6,6,8,0.72)",
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
          background: "rgba(30,37,50,0.88)",
          backdropFilter: "blur(72px) brightness(1.12) saturate(0.80)",
          WebkitBackdropFilter: "blur(72px) brightness(1.12) saturate(0.80)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.08), 0 40px 100px rgba(0,0,0,0.65)",
          overflow: "hidden",
        } as React.CSSProperties}
      >
        {/* top brick accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${T.accent} 28%, ${T.accentLt} 72%, transparent)` }} />

        {/* rim shimmer */}
        <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 20, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%)", pointerEvents: "none" }} />

        <div style={{ padding: "28px 32px 32px", position: "relative" }}>

          {/* header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.40)", marginBottom: 10 }}>
                <span style={{ color: T.accent }}>//</span>
                <span>[ Richiesta Consulenza ]</span>
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, letterSpacing: "-0.022em", color: "#FFFFFF", margin: 0, lineHeight: 1.2 }}>
                Descrivi il tuo blocco principale
              </h3>
            </div>
            <button onClick={onClose}
              style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.45)", transition: "all 0.18s" }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,255,255,0.09)"; el.style.color="#fff" }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,255,255,0.04)"; el.style.color="rgba(255,255,255,0.45)" }}
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
                    onFocus={e => { e.currentTarget.style.borderColor="rgba(140,53,37,.5)"; e.currentTarget.style.background="rgba(255,255,255,0.07)" }}
                    onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.10)"; e.currentTarget.style.background="rgba(255,255,255,0.05)" }} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" placeholder="email@azienda.it" value={fields.email} onChange={e => set("email")(e.target.value)}
                    onFocus={e => { e.currentTarget.style.borderColor="rgba(140,53,37,.5)"; e.currentTarget.style.background="rgba(255,255,255,0.07)" }}
                    onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.10)"; e.currentTarget.style.background="rgba(255,255,255,0.05)" }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Sito Web</label>
                <input style={inputStyle} placeholder="https://tuosito.it (opzionale)" value={fields.site} onChange={e => set("site")(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor="rgba(140,53,37,.5)"; e.currentTarget.style.background="rgba(255,255,255,0.07)" }}
                  onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.10)"; e.currentTarget.style.background="rgba(255,255,255,0.05)" }} />
              </div>
              <div>
                <label style={labelStyle}>Cosa dobbiamo risolvere?</label>
                <select style={{ ...inputStyle, appearance: "none" as const, WebkitAppearance: "none" as const }} value={fields.area} onChange={e => set("area")(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor="rgba(140,53,37,.5)" }}
                  onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.10)" }}>
                  <option value="" style={{ background: "#0d0d10" }}>Seleziona un'area...</option>
                  {["E-commerce ad Alta Conversione","Siti Corporate & Lead Generation","Applicazioni Web & Automazione Custom","SEO Strategico & Performance Marketing","Integrazione AI & Sistemi Intelligenti"].map(o => (
                    <option key={o} value={o} style={{ background: "#0d0d10" }}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Messaggio</label>
                <textarea style={{ ...inputStyle, resize: "vertical" as const, minHeight: 90 }} placeholder="Descrivi la situazione attuale e il risultato che vuoi ottenere..." value={fields.msg} onChange={e => set("msg")(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor="rgba(140,53,37,.5)"; e.currentTarget.style.background="rgba(255,255,255,0.07)" }}
                  onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.10)"; e.currentTarget.style.background="rgba(255,255,255,0.05)" }} />
              </div>

              {/* divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />

              <button type="submit"
                style={{ width: "100%", padding: "13px 32px", borderRadius: 10, cursor: "pointer", border: "1px solid rgba(140,53,37,0.45)", background: "rgba(140,53,37,0.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)", color: "#FFFFFF", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" as const, transition: "all .22s" }}
                onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background="rgba(140,53,37,0.30)"; el.style.borderColor="rgba(176,74,56,0.65)" }}
                onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background="rgba(140,53,37,0.18)"; el.style.borderColor="rgba(140,53,37,0.45)" }}
              >
                Invia Richiesta →
              </button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "36px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.30)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24, color: T.green }}>✓</div>
              <h4 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: T.green, marginBottom: 10 }}>Richiesta inviata!</h4>
              <p style={{ fontFamily: MONO, fontSize: 13, color: T.muted, lineHeight: 1.8, margin: 0 }}>Riceverai un piano d'azione chiaro entro 24 ore lavorative.</p>
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
        style={{ position: "absolute", bottom: -16, left: "10%", right: "10%", height: 24, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(140,53,37,0.45) 0%, transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }}
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
          border: `1px solid ${hov ? "rgba(176,74,56,0.90)" : "rgba(176,74,56,0.80)"}`,
          background: "linear-gradient(90deg, rgba(140,53,37,0.55) 0%, rgba(176,74,56,0.28) 100%)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: hov
            ? "0 0 56px rgba(140,53,37,0.38), 0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)"
            : "0 0 36px rgba(140,53,37,0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
          color: "#FFFFFF", fontFamily: MONO,
          display: "flex", alignItems: "stretch",
          transition: "border-color 0.25s, box-shadow 0.30s, background 0.25s",
        } as React.CSSProperties}
      >
        {/* index tag */}
        <div style={{ padding: "17px 16px 17px 20px", borderRight: "1px solid rgba(140,53,37,0.40)", display: "flex", alignItems: "center", position: "relative" }}>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", color: T.accentLt }}>[01]</span>
        </div>
        {/* label */}
        <div style={{ padding: "17px 28px", display: "flex", alignItems: "center", gap: 14, position: "relative", fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase" as const }}>
          Richiedi Piano d'Azione
          <motion.span
            animate={{ x: hov ? [0, 5, 0] : 0 }}
            transition={{ duration: 0.55, repeat: hov ? Infinity : 0, ease: "easeInOut" }}
            style={{ fontSize: 15, color: T.accentLt, lineHeight: 1 }}
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
            <span style={{ color: T.accent }}>//</span>
            <span>[ Call to Action ]</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 16px", color: "#FFFFFF" }}>
            Mettiamo fine ai blocchi tecnici della tua azienda.
          </h2>
        </Reveal>
        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.16, ease }}
          style={{ fontSize: 15, color: T.muted, lineHeight: 1.82, marginBottom: 52, maxWidth: 580 }}
        >
          Seleziona il problema principale che sta frenando la tua crescita. Riceverai un piano d'azione chiaro e orientato ai numeri.
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

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href}
      style={{ display: "flex", alignItems: "center", gap: 0, fontSize: 13, color: T.muted, textDecoration: "none", transition: "color 0.20s, gap 0.20s" }}
      onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.gap = "6px" }}
      onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.gap = "0px" }}
    >
      <span style={{ color: T.accentLt, overflow: "hidden", width: 0, opacity: 0, transition: "width 0.20s, opacity 0.20s" }} aria-hidden>›</span>
      {children}
    </a>
  )
}

function FooterSocialBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <motion.a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      data-glow=""
      whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 16 }}
      style={{ '--base': '28', '--spread': '36', '--radius': '10', '--border': '1', '--size': '140', width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, backgroundColor: "transparent", transition: "color 0.22s, border-color 0.22s, background-color 0.22s", flexShrink: 0, textDecoration: "none" } as React.CSSProperties}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.text; el.style.borderColor = "rgba(235,240,250,0.45)"; el.style.backgroundColor = "rgba(226,232,244,0.12)" }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.muted; el.style.borderColor = "rgba(255,255,255,0.08)"; el.style.backgroundColor = "transparent" }}
    >{children}</motion.a>
  )
}

function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 800)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (!mobile) {
    return (
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: T.faint, marginBottom: 20, margin: "0 0 20px" }}>{title}</p>
        {children}
      </div>
    )
  }

  return (
    <div style={{ borderBottom: `1px solid ${open ? "rgba(140,53,37,0.28)" : T.border}`, transition: "border-color 0.25s" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: open ? "rgba(140,53,37,0.05)" : "transparent", border: "none", cursor: "pointer", padding: "16px 0", fontFamily: "inherit", transition: "background 0.25s" }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: open ? T.accentLt : T.faint, transition: "color 0.25s" }}>{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.28 }} style={{ color: open ? T.accentLt : T.faint, fontSize: 9, lineHeight: 1 }}>▼</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "4px 0 20px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FOOTER_NAV = [
  { label: "Servizi",    action: "s3" },
  { label: "Soluzioni",  action: "s4" },
  { label: "Risultati",  action: "s5" },
  { label: "Metodo",     action: "s8" },
  { label: "Contatti",   action: "s9" },
]
const FOOTER_SOCIALS_FULL = [
  { label: "LinkedIn",  href: "https://linkedin.com/in/nadiamaar",        Icon: LinkedinIcon  },
  { label: "GitHub",    href: "https://github.com/nadiamaar-dev",          Icon: GithubIcon    },
  { label: "Instagram", href: "https://instagram.com/nadiamaar.dev",       Icon: InstagramIcon },
  { label: "Discord",   href: "https://discord.gg/nadiamaar",              Icon: DiscordIcon   },
]


/* ══════════════════════════════════════════════════════════════════════════
   DATE-TIME WIDGET
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
    <div
      className="hp-datetime"
      aria-label="Local time"
      style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        display: "flex", alignItems: "center", gap: 10,
        padding: "5px 14px 5px 8px", borderRadius: 100,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(22px) saturate(1.6)", WebkitBackdropFilter: "blur(22px) saturate(1.6)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 14px rgba(0,0,0,0.22)",
        whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none", zIndex: 10,
      } as React.CSSProperties}
    >
      {/* seconds arc */}
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8.5" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
        <motion.circle
          cx="11" cy="11" r="8.5"
          fill="none" stroke="#B04A38" strokeWidth="1.5" strokeLinecap="round"
          transform="rotate(-90 11 11)"
          animate={{ pathLength: ss / 60 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        />
      </svg>

      {/* HH:MM + ss */}
      <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.92)", display: "inline-flex", alignItems: "baseline", gap: 1 }}>
        {hh}
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          style={{ margin: "0 1px", color: "rgba(255,255,255,0.30)" }}
        >:</motion.span>
        {mm}
        <span style={{ fontSize: 9, opacity: 0.36, marginLeft: 4, letterSpacing: "0.04em" }}>{ssStr}</span>
      </span>

      {/* divider */}
      <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.10)", flexShrink: 0 }} />

      {/* date */}
      <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 500, letterSpacing: "0.14em", color: "rgba(255,255,255,0.36)" }}>
        {day} {date} {mon}
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
          <NMmark size={30} id="nm-nav" hover={h} />
          <motion.span aria-hidden
            animate={{ opacity: h ? 1 : 0 }} transition={{ duration: 0.30 }}
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

function NavLinkAdv({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [h, setH] = useState(false)
  const [lx, setLx] = useState(0)
  const [ly, setLy] = useState(0)
  const btnRef = useRef<HTMLButtonElement>(null)
  const onMove = (e: React.MouseEvent) => { const r = btnRef.current?.getBoundingClientRect(); if (r) { setLx(e.clientX - r.left); setLy(e.clientY - r.top) } }
  return (
    <button ref={btnRef} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onMouseMove={onMove}
      style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: active ? T.text : h ? T.text : T.muted, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, padding: "8px 16px", borderRadius: 8, overflow: "hidden", fontFamily: MONO, transition: "color 0.18s" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: h ? `radial-gradient(55px circle at ${lx}px ${ly}px, rgba(140,53,37,0.22) 0%, transparent 100%)` : "none", transition: "background 0.08s" }} />
      <motion.div animate={{ opacity: h || active ? 1 : 0, background: active ? "rgba(140,53,37,0.14)" : "rgba(255,255,255,0.05)" }} transition={{ duration: 0.18 }} style={{ position: "absolute", inset: 0, borderRadius: 8, border: active ? "1px solid rgba(140,53,37,0.28)" : "1px solid transparent" }} />
      {active && <motion.div layoutId="nav-active-dot" style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: T.accent, boxShadow: `0 0 6px ${T.accent}` }} />}
      <span style={{ position: "relative" }}>{label}</span>
    </button>
  )
}

/* Large nav item — for mobile full-screen overlay */
/* Shared nav item — used in both mobile and desktop panel */
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
        style={{
          background: "none", border: "none", cursor: "pointer", width: "100%",
          display: "flex", alignItems: "baseline", gap: 18, padding: "14px 0",
          borderBottom: `1px solid ${lit ? "rgba(140,53,37,0.40)" : "rgba(255,255,255,0.08)"}`,
          transition: "border-color 0.22s", textAlign: "left" as const, position: "relative",
        }}
      >
        {/* accent left bar */}
        <motion.span aria-hidden
          animate={{ scaleY: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)", width: 2, height: "60%", background: T.accent, borderRadius: 2, transformOrigin: "center" }}
        />
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: lit ? T.accent : "rgba(255,255,255,0.30)", transition: "color 0.22s", minWidth: 26, flexShrink: 0 }}>[{num}]</span>
        <span style={{
          fontFamily: DISPLAY, fontSize: "clamp(28px, 8vw, 46px)", fontWeight: 800,
          letterSpacing: "-0.032em", lineHeight: 1.1,
          color: active ? T.accentLt : h ? "#fff" : "rgba(255,255,255,0.75)",
          transition: "color 0.22s",
        }}>{label}</span>
        <motion.span
          animate={{ x: lit ? 10 : 0, opacity: lit ? 1 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ marginLeft: "auto", color: T.accent, fontSize: 20, lineHeight: 1, flexShrink: 0 }}
        >→</motion.span>
      </button>
    </motion.div>
  )
}

/* DesktopMenuNavItem now reuses MenuNavItem */
function DesktopMenuNavItem({ num, label, onClick, index }: { num: string; label: string; onClick: () => void; index: number }) {
  return <MenuNavItem num={num} label={label} onClick={onClick} index={index} />
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

  const goto = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); onClose() }

  const NAV = [
    { num: "01", label: "Home",      action: () => goto("s1"), sectionId: "s1" },
    { num: "02", label: "About Me",  action: () => { window.location.href = "/about" }, sectionId: "" },
    { num: "03", label: "Soluzioni", action: () => goto("s3"), sectionId: "s3" },
    { num: "04", label: "Risultati", action: () => goto("s5"), sectionId: "s5" },
    { num: "05", label: "Contatti",  action: () => goto("s9"), sectionId: "s9" },
  ]

  const MENU_SOCIALS = [
    { label: "LI",  href: "https://linkedin.com/in/nadiamaar" },
    { label: "GH",  href: "https://github.com/nadiamaar-dev" },
    { label: "IG",  href: "https://instagram.com/nadiamaar.dev" },
    { label: "DC",  href: "https://discord.gg/nadiamaar" },
  ]

  /* active section detection */
  const [activeId, setActiveId] = useState("")
  useEffect(() => {
    const ids = ["s1","s3","s5","s9"]
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) })
    }, { threshold: 0.3 })
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  /* shared glass styles */
  const GLASS = {
    background: "rgba(22,27,34,0.82)",
    backdropFilter: "blur(72px) brightness(1.08) saturate(0.80)",
    WebkitBackdropFilter: "blur(72px) brightness(1.08) saturate(0.80)",
  } as React.CSSProperties

  /* shared footer row */
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
        {/* top accent gradient line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(140,53,37,0.70), rgba(176,74,56,0.45), transparent)", flexShrink: 0 }} />

        {/* spacer — same height as navbar */}
        <div style={{ height: 64, flexShrink: 0 }} />

        {/* ghost MAAR */}
        <div aria-hidden style={{ position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)", fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(80px,32vw,160px)", letterSpacing: "-0.05em", color: "rgba(75,85,105,0.13)", filter: "blur(1px)", userSelect: "none", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 0 }}>MAAR</div>

        {/* nav */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0, position: "relative", zIndex: 1, paddingLeft: 20 }}>
          {NAV.map((item, i) => (
            <MenuNavItem key={item.label} num={item.num} label={item.label} onClick={item.action} index={i} active={!!item.sectionId && activeId === item.sectionId} />
          ))}
        </div>

        {menuFooter}
      </motion.div>
    )
  }

  /* Desktop — right slide panel + backdrop */
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
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 460, zIndex: 300,
          display: "flex", flexDirection: "column", padding: "0 40px",
          borderLeft: "1px solid rgba(255,255,255,0.14)",
          ...GLASS,
        }}
      >
        {/* top accent line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(140,53,37,0.70) 40%, rgba(176,74,56,0.45) 70%, transparent)", flexShrink: 0 }} />

        {/* header */}
        <div style={{ height: 64, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.36)" }}>Navigation</span>
        </div>

        {/* ghost MAAR — vertical right edge */}
        <div aria-hidden style={{ position: "absolute", right: -8, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(80px,9vw,130px)", letterSpacing: "-0.04em", color: "rgba(75,85,105,0.13)", filter: "blur(0.8px)", userSelect: "none", lineHeight: 0.82 }}>MAAR</span>
        </div>

        {/* vermillion ambient glow */}
        <div aria-hidden style={{ position: "absolute", bottom: "25%", right: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,53,37,0.10) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

        {/* nav links */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0, position: "relative", zIndex: 1, paddingLeft: 4 }}>
          {NAV.map((item, i) => (
            <MenuNavItem key={item.label} num={item.num} label={item.label} onClick={item.action} index={i} active={!!item.sectionId && activeId === item.sectionId} />
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

  const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease }}
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
        <DateTimeWidget />
        <Logo3D onClick={() => goto("s1")} />

        {/* hamburger */}
        <motion.button
          onClick={() => setMenuOpen(o => !o)}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label="Menu"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", display: "flex", flexDirection: "column", gap: 5, zIndex: 401, flexShrink: 0 }}
        >
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} transition={{ duration: 0.26 }}
            style={{ display: "block", width: 22, height: 1.8, background: menuOpen ? "#fff" : "rgba(255,255,255,0.80)", borderRadius: 2, transformOrigin: "center" }} />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1, width: menuOpen ? 0 : 14 }} transition={{ duration: 0.18 }}
            style={{ display: "block", width: 14, height: 1.8, background: "rgba(255,255,255,0.80)", borderRadius: 2 }} />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} transition={{ duration: 0.26 }}
            style={{ display: "block", width: 22, height: 1.8, background: menuOpen ? "#fff" : "rgba(255,255,255,0.80)", borderRadius: 2, transformOrigin: "center" }} />
        </motion.button>
      </motion.header>

      <AnimatePresence>
        {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  )
}


/* ══════════════════════════════════════════════════════════════════════════
   ANIMATED BACKGROUND
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

function AnimatedBackground() {
  return (
    <>
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>

        {/* ── Dark right panel (base) ── */}
        <div style={{ position: "absolute", inset: 0, background: "#161B22" }} />
        {/* ── Lighter left panel — vertical split ── */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "42%", background: "#1E2530", borderRight: "1px solid rgba(255,255,255,0.06)" }} />
        {/* ── Soft blend at the split edge ── */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "34%", width: "16%", background: "linear-gradient(90deg, #1E2530, #161B22)" }} />

        {/* ── Blue Lagoon bloom — top-left, under grid ── */}
        <div style={{ position: "absolute", top: "-10%", left: "-8%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,120,180,0.11) 0%, rgba(10,90,140,0.05) 50%, transparent 72%)", filter: "blur(90px)", pointerEvents: "none" }} />

        {/* ── Grid ── */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%), linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%), linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }} />
        {/* ── Fine dot layer ── */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1.4px)",
          backgroundSize: "26px 26px",
          WebkitMaskImage: "radial-gradient(ellipse 52% 48% at 50% 36%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 52%, transparent 76%)",
          maskImage: "radial-gradient(ellipse 52% 48% at 50% 36%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 52%, transparent 76%)",
        }} />

        {/* ── Top spotlight ── */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle 780px at 50% -6%, rgba(230,232,240,0.06), transparent 56%)" }} />
        {/* ── Edge vignette ── */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 108% 86% at 50% 42%, transparent 30%, rgba(10,10,13,0.80) 100%)" }} />
      </div>

      {/* ── Grain overlay ── */}
      <GrainOverlay />
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   GHOST "MAAR" WATERMARK — fixed, barely-there accent.
   Fades in after the Hero section and fades back out before the Footer.
══════════════════════════════════════════════════════════════════════════ */
function MaarWatermark() {
  const { scrollYProgress } = useScroll()
  // 0-8%  = Hero (hidden) · fade in by 16% · hold · fade out from 86% · 96%+ = Footer (hidden)
  const opacity = useTransform(scrollYProgress, [0.06, 0.16, 0.86, 0.96], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0.06, 0.96], ["3%", "-3%"])
  return (
    <motion.div aria-hidden style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity,
    }}>
      <motion.span style={{
        y,
        fontFamily: DISPLAY, fontWeight: 900,
        fontSize: "clamp(110px, 30vw, 460px)", letterSpacing: "-0.05em", lineHeight: 1,
        color: "rgba(75,85,105,0.13)", filter: "blur(1px)",
        userSelect: "none", whiteSpace: "nowrap",
      }}>MAAR</motion.span>
    </motion.div>
  )
}

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
        background: "linear-gradient(90deg, rgba(115,38,22,1), #8C3525, #B04A38)",
        boxShadow: "0 0 12px rgba(140,53,37,0.7)",
      }}
    />
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
    <div style={{ background: "#161B22", color: T.text, fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif", minHeight: "100vh", position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <ScrollProgress />
      <AnimatedBackground />
      <MaarWatermark />
      <FloatingContact />
      <Header />
      <div style={{ position: "relative", zIndex: 1, paddingTop: 64 }}>
        <Hero />
        <SoluzioniMatrix />
        <DiagnosiBlock />
        <TechBlock />
        <PurcheBlock />
        <Method />
        <Portfolio />
        <Contact />
        <Footer />
      </div>
    </div>
  )
}
