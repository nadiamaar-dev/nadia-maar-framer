/**
 * NadiaMaar_Projects.tsx — "My Projects" / Selected Works page
 * Route: /projects
 *
 * Full-screen case-study sections following the Case Study standard
 * (Obiettivo · Sfida · Soluzioni & Impatto). Reuses the shared
 * Header / Background / Footer / FloatingContact primitives.
 */

import React, { useState, useEffect, useRef } from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Background from "./components/Background"
import FloatingContact from "./components/FloatingContact"

/* ── tokens ── */
const T = {
  bg: "#060C18", text: "#F0F3F9", muted: "rgba(255,255,255,0.78)",
  faint: "rgba(255,255,255,0.58)", border: "rgba(255,255,255,0.11)",
  accent: "#B83240", accentLt: "#BE3648", green: "#10B981",
  surface: "rgba(255,255,255,0.055)", surfaceHi: "rgba(255,255,255,0.10)",
} as const
const MONO = "'JetBrains Mono','SF Mono',ui-monospace,monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
/* Body copy — identical to the homepage hero description (Geist). */
const BODY: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif", fontSize: "clamp(16px, 1.4vw, 17px)", fontWeight: 400, lineHeight: 1.85, letterSpacing: "0.01em" }
const WRAP: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "0 32px" }
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* glass surface used across cards — transparent so the background grid shows */
const GLASS: React.CSSProperties = {
  background: "rgba(14,24,31,0.22)",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
  border: "1px solid rgba(255,255,255,0.17)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.24)",
}

/* solid frosted glass — used for the SVG visual cards */
const GLASS_SOLID: React.CSSProperties = {
  background: "rgba(255,255,255,0.055)",
  backdropFilter: "blur(30px) brightness(1.10) saturate(0.80)",
  WebkitBackdropFilter: "blur(30px) brightness(1.10) saturate(0.80)",
  border: "1px solid rgba(255,255,255,0.17)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 20px 50px rgba(0,0,0,0.30)",
}

const PROJECTS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; scroll-behavior: smooth; overflow-x: hidden; }
  body { overflow-x: clip; font-family: 'Space Grotesk', system-ui, sans-serif; }
  #root { overflow-x: clip; }
  p, li { font-weight: 300; line-height: 1.8; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #060C18; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 4px; }
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
  [style*="color: #7C222B"],
  [style*='color: "#7C222B"'] {
    text-shadow: 0 0 24px rgba(124,34,43,0.45), 0 0 8px rgba(124,34,43,0.26);
  }

  .pr-case-grid { display: grid; grid-template-columns: 4.6fr 6fr; gap: 60px; align-items: start; }
  .pr-case-id { position: sticky; top: 104px; align-self: start; }
  .pr-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .pr-hero-index { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .pr-hero-row { display: flex; gap: 34px; align-items: stretch; }
  .pr-hero-rail { display: flex; }
  @media (max-width: 680px) {
    .pr-hero-row { gap: 0; }
    .pr-hero-rail { display: none !important; }
  }
  .pr-solutions-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }

  @media (max-width: 1024px) {
    .pr-case-grid { gap: 44px; }
    .pr-hero-wordmark { display: none; }
  }
  @media (max-width: 860px) {
    .pr-case-grid { grid-template-columns: 1fr !important; gap: 34px !important; }
    .pr-case-id { position: static !important; }
    .pr-case-watermark { font-size: 120px !important; top: -6px !important; }
    .pr-hero-index { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 768px) {
    .pr-hero-h1 { font-size: clamp(38px, 11vw, 62px) !important; line-height: 0.92 !important; }
  }
  @media (max-width: 400px) {
    .pr-hero-h1 { font-size: clamp(34px, 13vw, 56px) !important; }
  }
  @media (max-width: 520px) {
    .pr-metrics { grid-template-columns: 1fr !important; }
  }
`

/* ── ScrollProgress ── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 })
  return (
    <motion.div aria-hidden style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 500,
      transformOrigin: "0% 50%", scaleX,
      background: "linear-gradient(90deg, rgba(90,40,40,1), #7C222B, #BE3648)",
      boxShadow: "0 0 12px rgba(124,34,43,0.7)",
    }} />
  )
}

/* ── small reveal wrapper ── */
function Reveal({ children, delay = 0, y = 22 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease }}
    >{children}</motion.div>
  )
}

/* ── Chip ── */
function Chip({ text }: { text: string }) {
  return (
    <span style={{
      fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.04em",
      color: "rgba(255,255,255,0.72)", padding: "5px 11px", borderRadius: 7,
      border: "1px solid rgba(255,255,255,0.20)", background: "rgba(255,255,255,0.035)",
      whiteSpace: "nowrap" as const,
    }}>{text}</span>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Case-study SVG visuals
══════════════════════════════════════════════════════════════════════════ */
function VisualEcommerce() {
  return (
    <svg viewBox="0 0 320 190" width="100%" height="100%">
      {/* catalog grid */}
      {[0, 1, 2, 3].map(c => [0, 1, 2].map(r => {
        const x = 18 + c * 46, y = 20 + r * 46
        const i = c * 3 + r
        return (
          <motion.g key={`${c}-${r}`}
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.03, duration: 0.4, ease }}
            style={{ transformOrigin: `${x + 18}px ${y + 18}px` }}
          >
            <rect x={x} y={y} width={36} height={36} rx={7}
              fill={i === 4 ? "rgba(190,54,72,0.16)" : "rgba(255,255,255,0.045)"}
              stroke={i === 4 ? "rgba(190,54,72,0.45)" : "rgba(255,255,255,0.10)"} strokeWidth="1" />
            <rect x={x + 7} y={y + 24} width={22} height={3} rx={1.5} fill="rgba(255,255,255,0.16)" />
          </motion.g>
        )
      }))}
      {/* performance gauge */}
      <motion.g initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
        <rect x={210} y={22} width={92} height={70} rx={11} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <text x={256} y={44} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.42)" fontFamily="Inter,sans-serif">TIME TO INTERACTIVE</text>
        <text x={256} y={70} textAnchor="middle" fontSize={22} fontWeight="800" fill="rgba(255,255,255,0.90)" fontFamily="Inter,sans-serif">1.4s</text>
        <motion.rect x={222} y={80} width={0} height={4} rx={2} fill="url(#pr-e-grad)"
          initial={{ width: 0 }} animate={{ width: 68 }} transition={{ delay: 0.7, duration: 0.9, ease }} />
      </motion.g>
      {/* SKU counter */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
        <rect x={210} y={102} width={92} height={64} rx={11} fill="rgba(190,54,72,0.10)" stroke="rgba(190,54,72,0.30)" strokeWidth="1" />
        <text x={256} y={128} textAnchor="middle" fontSize={19} fontWeight="800" fill="rgba(255,255,255,0.90)" fontFamily="Inter,sans-serif">32.000</text>
        <text x={256} y={146} textAnchor="middle" fontSize={8} fill="rgba(190,54,72,0.72)" fontFamily="Inter,sans-serif">SKU · Multi-country EU</text>
      </motion.g>
      <defs>
        <linearGradient id="pr-e-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C222B" /><stop offset="100%" stopColor="#BE3648" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function VisualMiddleware() {
  const nodes = [
    { x: 20, y: 74, label: "Fornitore", sub: "B2B / ERP" },
    { x: 128, y: 62, label: "Middleware", sub: "Dual-Write" },
    { x: 236, y: 74, label: "Store", sub: "Shopify" },
  ]
  return (
    <svg viewBox="0 0 320 190" width="100%" height="100%">
      {/* connectors */}
      {[[84, 92, 128, 92], [192, 92, 236, 92]].map(([x1, y1, x2, y2], i) => (
        <motion.path key={i} d={`M${x1},${y1}L${x2},${y2}`} stroke="rgba(190,54,72,0.28)" strokeWidth="1.5" strokeDasharray="5 3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }} />
      ))}
      {/* flowing packets */}
      {[0, 1].map(edge => [0, 1, 2].map(j => (
        <motion.rect key={`${edge}-${j}`} x={edge === 0 ? 84 : 192} y={89} width={8} height={6} rx={2} fill="rgba(190,54,72,0.7)"
          animate={{ x: [0, 44, 44], opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.4 + edge * 0.22, ease: "easeInOut" }} />
      )))}
      {nodes.map((n, i) => (
        <motion.g key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.14, duration: 0.45, ease }}>
          <rect x={n.x} y={n.y} width={64} height={i === 1 ? 56 : 40} rx={11}
            fill={i === 1 ? "rgba(190,54,72,0.14)" : "rgba(255,255,255,0.05)"}
            stroke={i === 1 ? "rgba(190,54,72,0.42)" : "rgba(255,255,255,0.13)"} strokeWidth="1" />
          <text x={n.x + 32} y={n.y + (i === 1 ? 26 : 18)} textAnchor="middle" fontSize={8.5} fontWeight="600" fill="rgba(255,255,255,0.88)" fontFamily="Inter,sans-serif">{n.label}</text>
          <text x={n.x + 32} y={n.y + (i === 1 ? 38 : 30)} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.40)" fontFamily="Inter,sans-serif">{n.sub}</text>
          <motion.circle cx={n.x + 54} cy={n.y + 10} r={3.2} fill="#10B981" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }} />
        </motion.g>
      ))}
      {/* uptime badge */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <rect x={92} y={140} width={136} height={34} rx={9} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <text x={128} y={161} textAnchor="middle" fontSize={15} fontWeight="800" fill="rgba(255,255,255,0.90)" fontFamily="Inter,sans-serif">99.9%</text>
        <text x={186} y={158} textAnchor="middle" fontSize={7.5} fill="rgba(255,255,255,0.44)" fontFamily="Inter,sans-serif">UPTIME</text>
        <text x={186} y={168} textAnchor="middle" fontSize={7.5} fill="rgba(16,185,129,0.75)" fontFamily="Inter,sans-serif">PM2 · &lt;3s</text>
      </motion.g>
    </svg>
  )
}

function VisualCivic() {
  // role hierarchy on the left
  const roles = [
    { y: 26, label: "Super Admin", sub: "controllo totale", accent: true },
    { y: 74, label: "131 Sub-Admin", sub: "gestione territoriale", accent: false },
    { y: 122, label: "Cabinet Cliente", sub: "area riservata", accent: false },
  ]
  // region outline only — no city markers
  const region = "M110,44 L176,38 L214,66 L228,112 L198,150 L150,158 L112,132 L96,88 Z"
  return (
    <svg viewBox="0 0 320 190" width="100%" height="100%">
      {/* ── role hierarchy ── */}
      <motion.path d="M40,50 L40,98 M40,98 L40,146" stroke="rgba(190,54,72,0.30)" strokeWidth="1.4"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.7 }} />
      {roles.map((r, i) => (
        <motion.g key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.14, duration: 0.45, ease }}>
          <rect x={22} y={r.y} width={116} height={36} rx={9}
            fill={r.accent ? "rgba(190,54,72,0.16)" : "rgba(255,255,255,0.05)"}
            stroke={r.accent ? "rgba(190,54,72,0.45)" : "rgba(255,255,255,0.12)"} strokeWidth="1" />
          <circle cx={40} cy={r.y + 18} r={5.5} fill={r.accent ? "rgba(190,54,72,0.85)" : "rgba(255,255,255,0.14)"} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <text x={54} y={r.y + 15} fontSize={8.5} fontWeight="600" fill="rgba(255,255,255,0.88)" fontFamily="Inter,sans-serif">{r.label}</text>
          <text x={54} y={r.y + 26} fontSize={7} fill="rgba(255,255,255,0.42)" fontFamily="Inter,sans-serif">{r.sub}</text>
        </motion.g>
      ))}

      {/* ── region (no cities) ── */}
      <g transform="translate(62,2) scale(0.82)">
        <motion.path d={region} fill="rgba(190,54,72,0.09)" stroke="rgba(190,54,72,0.40)" strokeWidth="1.6" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.4, ease }} />
        <motion.circle cx={162} cy={100} r={20} fill="rgba(190,54,72,0.16)"
          animate={{ r: [20, 34, 20], opacity: [0.5, 0, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx={162} cy={100} r={5} fill="rgba(190,54,72,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: "spring", stiffness: 240 }} style={{ transformOrigin: "162px 100px" }} />
      </g>
      <motion.text x={228} y={150} textAnchor="middle" fontSize={8} fontWeight="500" fill="rgba(255,255,255,0.5)" fontFamily="Inter,sans-serif"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>Regione Basilicata</motion.text>

      {/* ── Supabase badge ── */}
      <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
        <rect x={22} y={166} width={116} height={20} rx={7} fill="rgba(16,185,129,0.10)" stroke="rgba(16,185,129,0.32)" strokeWidth="1" />
        <motion.circle cx={36} cy={176} r={3.2} fill="#10B981" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <text x={46} y={179} fontSize={7.5} fontWeight="500" fill="rgba(255,255,255,0.72)" fontFamily="Inter,sans-serif">Supabase · Postgres RLS</text>
      </motion.g>
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Data
══════════════════════════════════════════════════════════════════════════ */
type CaseStudy = {
  n: string; category: string; title: string; subtitle: string;
  obiettivo: string; sfida: string;
  soluzioni: { t: string; d: string }[];
  stack: string[]; metrics: { v: string; l: string }[];
  Visual: React.ComponentType;
}

const CASES: CaseStudy[] = [
  {
    n: "01",
    category: "Civic Tech · Open-Gov · SaaS",
    title: "Piattaforma Civica Regionale",
    subtitle: "Piattaforma istituzionale full-stack per la Regione Basilicata. Democrazia partecipativa, raccolta fondi e bandi per startup, orchestrati da un'architettura multi-ruolo sicura su Supabase.",
    obiettivo: "Un ecosistema digitale istituzionale di nuova generazione, pensato per avvicinare cittadini e pubblica amministrazione. Un unico spazio dove convergono raccolta fondi, bandi per giovani startup e gestione operativa del territorio — con più trasparenza e partecipazione reale.",
    sfida: "Al centro, un'architettura multi-tenant con una gerarchia di ruoli articolata: un Super Admin dal controllo totale, 131 Sub-Admin con permessi territoriali circoscritti e i Cabinet Cliente ad accesso riservato. La sfida: isolare i dati di ogni ruolo con row-level security, gestire donazioni e candidature in tempo reale e mantenere un'estetica premium senza mai sacrificare le prestazioni.",
    soluzioni: [
      { t: "Backend & Autenticazione su Supabase", d: "Infrastruttura su Supabase — PostgreSQL, Auth, Storage e Realtime — con Row-Level Security a livello di database: ogni ruolo vede solo i dati di sua competenza, sempre." },
      { t: "Architettura Multi-Ruolo", d: "Super Admin per il controllo totale, 131 Sub-Admin per la gestione territoriale decentralizzata e un Cabinet Cliente dedicato. Ognuno con dashboard, permessi e flussi su misura." },
      { t: "Donazioni & Bandi per Startup", d: "Un sistema integrato per creare e monitorare progetti di donazione e pubblicare bandi rivolti alle giovani startup, con gestione delle candidature end-to-end." },
      { t: "Mappa Regionale & UI d'Avanguardia", d: "Cartografia vettoriale della regione integrata nel codice — glassmorphism, accenti metallici e transizioni fluide — alleggerita su mobile per una UX impeccabile." },
    ],
    stack: ["Next.js / React", "Supabase", "PostgreSQL · RLS", "Tailwind CSS", "Framer Motion", "Vercel"],
    metrics: [{ v: "131", l: "Sub-Admin territoriali" }, { v: "RLS", l: "Sicurezza Supabase" }, { v: "3", l: "Livelli di ruolo" }],
    Visual: VisualCivic,
  },
  {
    n: "02",
    category: "E-Commerce · Shopify Plus",
    title: "E-Commerce Enterprise",
    subtitle: "Un e-commerce enterprise costruito per scalare sul mercato europeo, con un catalogo di oltre 32.000 SKU sempre veloce e reattivo.",
    obiettivo: "Un e-commerce di livello enterprise pensato per l'espansione in tutta l'Unione Europea. L'obiettivo: reggere un catalogo massivo offrendo, in ogni mercato, un'esperienza fluida, localizzata e orientata alla conversione.",
    sfida: "Gestire oltre 32.000 prodotti attivi impone un'architettura dati impeccabile, priva di colli di bottiglia. La sfida vera è stata ottimizzare i Core Web Vitals (LCP, FID, CLS) su mobile — con filtri complessi e varianti dinamiche — senza perdere un millisecondo di velocità.",
    soluzioni: [
      { t: "Performance Optimization", d: "Refactoring profondo del codice Liquid e taglio degli script di terze parti: tempo di interattività portato sotto 1,4 secondi." },
      { t: "Architettura Multi-Country", d: "Mercati internazionali nativi, con valute locali, regimi fiscali europei (OSS) e traduzioni dinamiche del catalogo gestite in automatico." },
      { t: "Filtrazione Avanzata", d: "Una faceted navigation che lascia filtrare migliaia di prodotti all'istante, senza mai ricaricare la pagina." },
    ],
    stack: ["Shopify Plus", "Liquid", "Tailwind CSS", "GraphQL Admin API"],
    metrics: [{ v: "32K+", l: "SKU attivi" }, { v: "<1.4s", l: "Time to Interactive" }, { v: "EU", l: "Multi-country OSS" }],
    Visual: VisualEcommerce,
  },
  {
    n: "03",
    category: "Middleware · Automazione B2B",
    title: "Middleware di Automazione Logistica",
    subtitle: "Un middleware software per sincronizzare lo stock in tempo reale e automatizzare l'intera catena di approvvigionamento in dropshipping.",
    obiettivo: "Un middleware proprietario per azzerare i processi manuali tra fornitori all'ingrosso (B2B) e store online: ordini, tracciamenti spedizioni e disponibilità prodotti, tutto automatizzato end-to-end.",
    sfida: "In un business ad alto volume, il disallineamento dello stock — vendere articoli a inventario zero — è un rischio critico. Il sistema doveva reggere transazioni concorrenti massive e restare fault-tolerant anche con timeout delle API fornitore o picchi di traffico imprevisti.",
    soluzioni: [
      { t: "Architettura ad Alta Affidabilità", d: "Persistenza a doppia scrittura (Dual-Write): la velocità di un database relazionale SQLite, con un mirror in JSON come backup d'emergenza." },
      { t: "Integrità dei Dati & Autocommit", d: "Conflitti di concorrenza risolti con una gestione avanzata dei batch: ogni ordine elaborato entro 3 secondi dall'evento webhook." },
      { t: "Gestione dei Processi", d: "Monitoraggio continuo con PM2 per un uptime del servizio del 99,9%." },
    ],
    stack: ["Node.js", "SQLite", "REST / Webhook", "PM2", "GitHub CI/CD", "Linux VPS"],
    metrics: [{ v: "99.9%", l: "Uptime servizio" }, { v: "<3s", l: "Order processing" }, { v: "0", l: "Over-selling" }],
    Visual: VisualMiddleware,
  },
]

/* ══════════════════════════════════════════════════════════════════════════
   Hero
══════════════════════════════════════════════════════════════════════════ */
/* ── Blueprint rail — vertical garnet bar with tick marks + index ── */
function BlueprintRail() {
  return (
    <div className="pr-hero-rail" aria-hidden style={{ position: "relative", flexShrink: 0, width: 46, flexDirection: "column", justifyContent: "space-between", paddingTop: 6, paddingBottom: 6 }}>
      {/* vertical bar + glow */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, borderRadius: 2, background: "linear-gradient(180deg, rgba(190,54,72,0) 0%, rgba(190,54,72,0.75) 14%, rgba(124,34,43,0.75) 86%, rgba(124,34,43,0) 100%)", boxShadow: "0 0 16px rgba(190,54,72,0.35)" }} />
      {["01", "02", "03"].map((n, i) => (
        <motion.div key={n}
          initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease }}
          style={{ position: "relative", display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 12, height: 1, background: T.accentLt, boxShadow: "0 0 8px rgba(190,54,72,0.6)" }} />
          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", color: "rgba(190,54,72,0.85)" }}>{n}</span>
        </motion.div>
      ))}
    </div>
  )
}

function Hero() {
  return (
    <section style={{ padding: "132px 0 84px", position: "relative", overflow: "hidden" }}>
      {/* ghost MAAR — identical to the /lab hero wordmark */}
      <div className="pr-hero-wordmark" aria-hidden style={{ position: "absolute", right: 14, top: 88, zIndex: 0, pointerEvents: "none", writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(150px,15vw,214px)", letterSpacing: "-0.04em", lineHeight: 0.84, whiteSpace: "nowrap", color: "rgba(255,255,255,0.012)", filter: "blur(1px)", userSelect: "none" }}>MAAR</div>
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
       <div className="pr-hero-row">
        <BlueprintRail />
        <div style={{ flex: 1, minWidth: 0 }}>
        {/* kicker — §-style like About */}
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.18em", color: T.accentLt }}>§00</span>
            <span aria-hidden style={{ width: 30, height: 1, background: "linear-gradient(90deg, rgba(190,54,72,0.6), rgba(190,54,72,0.1))" }} />
            <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.52)" }}>Case Studies</span>
          </div>
        </Reveal>

        {/* headline — §04 typographic composition (outlined + solid white) */}
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.26em", color: "rgba(255,255,255,0.58)", marginBottom: 10, textTransform: "uppercase" as const }}>Il mio</div>

          <motion.h1
            className="pr-hero-h1"
            initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(48px,9vw,120px)", lineHeight: 0.88, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.58)", userSelect: "none" }}>
            SELECTED
          </motion.h1>

          <motion.div
            className="pr-hero-h1"
            initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.18, ease }}
            style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(48px,9vw,120px)", lineHeight: 0.88, letterSpacing: "-0.05em", color: "#F0F3F9", userSelect: "none" }}>
            WORKS
          </motion.div>
        </div>

        <Reveal delay={0.16}>
          <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(18px,2.4vw,28px)", lineHeight: 1.28, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.86)", margin: "22px 0 0", maxWidth: 720 }}>
            Ingegneria e scaling di{" "}
            <span style={{ color: "rgba(255,255,255,0.53)", fontWeight: 300 }}>prodotti digitali complessi.</span>
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <p style={{ ...BODY, color: T.muted, maxWidth: 600, margin: "24px 0 0" }}>
            Tre case study reali — dall'e-commerce enterprise all'automazione B2B fino alle piattaforme civiche.
            Ogni progetto è raccontato secondo la struttura Obiettivo · Sfida · Soluzione · Impatto.
          </p>
        </Reveal>

        {/* index of projects */}
        <Reveal delay={0.32}>
          <div className="pr-hero-index" style={{ marginTop: 52 }}>
            {CASES.map((c) => (
              <a key={c.n} href={`#case-${c.n}`}
                style={{ textDecoration: "none", display: "block", padding: "18px 20px", borderRadius: 14, ...GLASS }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 900, letterSpacing: "-0.05em", color: "rgba(190,54,72,0.55)" }}>{c.n}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, letterSpacing: ".13em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.62)" }}>{c.category}</span>
                </div>
                <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17.5, letterSpacing: "-0.015em", lineHeight: 1.3, color: "#F0F3F9", display: "block" }}>{c.title}</span>
              </a>
            ))}
          </div>
        </Reveal>
        </div>
       </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Case block (Obiettivo / Sfida)
══════════════════════════════════════════════════════════════════════════ */
function CaseBlock({ label, mark, children }: { label: string; mark: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: "rgba(190,54,72,0.12)", border: "1px solid rgba(190,54,72,0.30)" }}>{mark}</span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, letterSpacing: ".22em", textTransform: "uppercase" as const, color: T.accentLt }}>{label}</span>
      </div>
      <p style={{ ...BODY, color: T.muted, margin: 0 }}>{children}</p>
    </div>
  )
}

/* ── Solution card — white frosted glass, matching About §04 ProcessCard ── */
function SolutionCard({ s, i }: { s: { t: string; d: string }; i: number }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: i * 0.08, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      animate={{ y: hov ? -3 : 0 }}
      style={{ position: "relative", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.09)" }}>

      {/* Glass background — bottom fade mask (text above unaffected) */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, background: "rgba(255,255,255,0.008)", backdropFilter: "blur(6px) brightness(1.03)", WebkitBackdropFilter: "blur(6px) brightness(1.03)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", maskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", pointerEvents: "none" }} />

      {/* Gradient border — top + sides fade to mid */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, padding: 1, background: "linear-gradient(to bottom, rgba(255,255,255,0.53) 0%, transparent 52%)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" as const, pointerEvents: "none", zIndex: 2 }} />

      {/* Content — full opacity above the fading glass */}
      <div style={{ position: "relative", zIndex: 3, padding: "24px 22px" }}>
        {/* [0X] tag */}
        <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase" as const, color: hov ? T.accentLt : "rgba(184,50,64,0.55)", marginBottom: 14, transition: "color 0.28s" }}>[ 0{i + 1} ]</div>

        {/* title */}
        <h4 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", lineHeight: 1.25, margin: "0 0 9px", color: "#F0F3F9" }}>{s.t}</h4>

        {/* body */}
        <p style={{ ...BODY, color: T.muted, margin: 0 }}>{s.d}</p>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Case study section
══════════════════════════════════════════════════════════════════════════ */
function CaseSection({ c, first }: { c: CaseStudy; first?: boolean }) {
  const { Visual } = c
  return (
    <section id={`case-${c.n}`} style={{ position: "relative", padding: "76px 0", borderTop: first ? "none" : `1px solid ${T.border}`, minHeight: "92vh" }}>
      {/* watermark */}
      <div aria-hidden className="pr-case-watermark" style={{
        position: "absolute", top: 24, right: 20, fontFamily: MONO, fontSize: 220, fontWeight: 900,
        lineHeight: 1, letterSpacing: "-0.07em", color: "rgba(255,255,255,0.025)", pointerEvents: "none", userSelect: "none", zIndex: 0,
      }}>{c.n}</div>

      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <div className="pr-case-grid">

          {/* LEFT — identity (sticky) */}
          <div className="pr-case-id">
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 900, letterSpacing: "-0.06em", color: T.accentLt, lineHeight: 1 }}>{c.n}</span>
                <span style={{ width: 26, height: 1, background: `linear-gradient(90deg, ${T.accentLt}, transparent)` }} />
                <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)" }}>{c.category}</span>
              </div>

              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.2vw,42px)", lineHeight: 1.06, letterSpacing: "-0.035em", color: "#F0F3F9", margin: "0 0 16px" }}>{c.title}</h2>

              <p style={{ ...BODY, color: T.faint, margin: "0 0 26px", maxWidth: 420 }}>{c.subtitle}</p>
            </Reveal>

            {/* visual — screen-preview frame */}
            <Reveal delay={0.1}>
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", ...GLASS_SOLID, marginBottom: 22 }}>
                {/* top accent line */}
                <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.accentLt} 30%, ${T.accentLt} 70%, transparent)`, opacity: 0.55, zIndex: 2 }} />

                {/* chrome header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["#FF5F57", "#FEBC2E", "#28C840"].map(col => (
                    <span key={col} style={{ width: 9, height: 9, borderRadius: "50%", background: col, opacity: 0.72 }} />
                  ))}
                  <span style={{ marginLeft: 6, fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.42)" }}>{c.category} · preview</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }} />
                    <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.34)" }}>LIVE</span>
                  </span>
                </div>

                {/* screen */}
                <div style={{ padding: 14 }}>
                  <div style={{ position: "relative", borderRadius: 10, background: "radial-gradient(ellipse at 50% -10%, rgba(184,50,64,0.07), rgba(0,0,0,0.22) 70%)", border: "1px solid rgba(255,255,255,0.12)", aspectRatio: "320 / 190", minHeight: 160, overflow: "hidden" }}>
                    {/* faint grid */}
                    <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
                    {/* corner ticks */}
                    <span aria-hidden style={{ position: "absolute", top: 8, left: 8, width: 8, height: 8, borderTop: "1px solid rgba(255,255,255,0.28)", borderLeft: "1px solid rgba(255,255,255,0.28)" }} />
                    <span aria-hidden style={{ position: "absolute", bottom: 8, right: 8, width: 8, height: 8, borderBottom: "1px solid rgba(255,255,255,0.28)", borderRight: "1px solid rgba(255,255,255,0.28)" }} />
                    {/* edge vignette */}
                    <div aria-hidden style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)", borderRadius: 10, pointerEvents: "none" }} />
                    <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}><Visual /></div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* metrics */}
            <Reveal delay={0.16}>
              <div className="pr-metrics" style={{ marginBottom: 18 }}>
                {c.metrics.map((m, i) => (
                  <div key={i} style={{ padding: "14px 12px", borderRadius: 12, ...GLASS }}>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: "#F0F3F9", lineHeight: 1 }}>{m.v}</div>
                    <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)", marginTop: 7 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* stack */}
            <Reveal delay={0.22}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.32)", alignSelf: "center", marginRight: 4 }}>Stack —</span>
                {c.stack.map(s => <Chip key={s} text={s} />)}
              </div>
            </Reveal>
          </div>

          {/* RIGHT — body */}
          <div style={{ paddingTop: 6 }}>
            <Reveal delay={0.06}>
              <CaseBlock label="Obiettivo del Progetto" mark="🎯">{c.obiettivo}</CaseBlock>
            </Reveal>
            <Reveal delay={0.1}>
              <CaseBlock label="La Sfida Tecnica" mark="⚡">{c.sfida}</CaseBlock>
            </Reveal>

            <Reveal delay={0.14}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 4 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: "rgba(190,54,72,0.12)", border: "1px solid rgba(190,54,72,0.30)" }}>🚀</span>
                <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, letterSpacing: ".22em", textTransform: "uppercase" as const, color: T.accentLt }}>Soluzioni & Impatto Business</span>
              </div>
            </Reveal>

            <div className="pr-solutions-grid">
              {c.soluzioni.map((s, i) => (
                <SolutionCard key={i} s={s} i={i} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Final CTA
══════════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section style={{ padding: "96px 0 40px", borderTop: `1px solid ${T.border}` }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ borderRadius: 24, overflow: "hidden", position: "relative", ...GLASS, padding: "clamp(36px,5vw,64px)" }}>

            {/* ghost MAAR vertical — identical to the homepage hero wordmark */}
            <div aria-hidden style={{ position: "absolute", right: -6, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
              <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(90px,12vw,180px)", letterSpacing: "-0.04em", color: "rgba(255,255,255,0.012)", filter: "blur(1px)", userSelect: "none", lineHeight: 0.82 }}>MAAR</span>
            </div>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 640 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" as const, color: T.accentLt, marginBottom: 20 }}>
                <span>●</span><span>Prossimo Progetto</span>
              </div>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(28px,4vw,50px)", lineHeight: 1.06, letterSpacing: "-0.04em", color: "#F0F3F9", margin: "0 0 18px" }}>
                Pronto a discutere il tuo prossimo progetto?
              </h2>
              <p style={{ ...BODY, color: T.muted, margin: "0 0 34px", maxWidth: 520 }}>
                Raccontami la sfida tecnica. Riceverai un piano d'azione chiaro, con architettura e stima, entro 24 ore lavorative.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <motion.a href="/#s9" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  style={{ minHeight: 54, padding: 0, borderRadius: 12, cursor: "pointer", textDecoration: "none", border: "1px solid rgba(184,50,64,0.80)", background: "linear-gradient(90deg, rgba(184,50,64,0.34) 0%, rgba(184,50,64,0.20) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0 12px rgba(184,50,64,0.20), inset 0 1px 0 rgba(255,255,255,0.12)", display: "inline-flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO }}>
                  <span style={{ padding: "0 14px", borderRight: "1px solid rgba(184,50,64,0.45)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.85)" }}>[→]</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 20px", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#F0F3F9" }}>
                    Avvia il tuo Progetto <span style={{ fontSize: 14 }}>→</span>
                  </span>
                </motion.a>

                <motion.a href="mailto:nadiamaar.dev@gmail.com" whileHover={{ y: -2, background: "rgba(255,255,255,0.09)" }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  style={{ minHeight: 54, padding: "0 22px", borderRadius: 12, fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, display: "inline-flex", alignItems: "center", textDecoration: "none", border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.04)", color: T.text }}>
                  Scrivimi via Email
                </motion.a>
              </div>

              {/* social links */}
              <div style={{ display: "flex", gap: 22, marginTop: 34, flexWrap: "wrap" }}>
                {[
                  { label: "GitHub", href: "https://github.com/nadiamaar-dev" },
                  { label: "LinkedIn", href: "https://linkedin.com/in/nadia-maar" },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: T.faint, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7, transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = T.faint)}>
                    <span style={{ color: T.accentLt }}>↗</span>{s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════════════════ */
export default function NadiaMaarProjects() {
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
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      overflowX: "clip", minHeight: "100vh", position: "relative",
    }}>
      <style dangerouslySetInnerHTML={{ __html: PROJECTS_CSS }} />
      <Background />
      <ScrollProgress />
      <FloatingContact />
      <Header />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        {CASES.map((c, i) => <CaseSection key={c.n} c={c} first={i === 0} />)}
        <FinalCTA />
      </div>
      <Footer />
    </div>
  )
}
