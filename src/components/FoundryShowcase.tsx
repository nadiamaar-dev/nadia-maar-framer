/**
 * FoundryShowcase — the "Digital Foundry: Costruisci la tua architettura"
 * section. Extracted verbatim out of NadiaMaar_Lab.tsx so it can live on the
 * About page without duplicating the code. Self-contained on purpose: the
 * tokens below are copies of the homepage values it was designed against, so
 * it renders identically wherever it is mounted.
 */
import React, { useState } from "react"
import { motion } from "framer-motion"

const T = {
  border: "rgba(70,90,108,0.22)",
  text:   "#FFFFFF",
  muted:  "#FFFFFF",
  green:  "#10B981",
} as const

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
const MONO    = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
const SANS    = "'Geist', 'Space Grotesk', system-ui, sans-serif"
const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"

const WRAP: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" }
const SEC: React.CSSProperties  = { padding: "80px 0", position: "relative" }

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

function MockPortal() {
  return (
    <svg viewBox="0 0 260 150" width="100%" height="100%">
      <rect x="8" y="10" width="244" height="130" rx="10" fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.13)" />
      <rect x="8" y="10" width="244" height="22" rx="10" fill="rgba(255,255,255,0.012)" />
      {[20, 30, 40].map((cx, i) => <circle key={i} cx={cx} cy="21" r="2.6" fill={["#ff5f56", "#ffbd2e", "#27c93f"][i]} opacity="0.75" />)}
      {/* sidebar */}
      <rect x="8" y="32" width="60" height="108" fill="rgba(255,255,255,0.012)" />
      {[44, 58, 72, 86].map((y, i) => (
        <g key={y}>
          <rect x="16" y={y} width="10" height="6" rx="1.5" fill={i === 0 ? "rgba(16,185,129,0.6)" : "rgba(255,255,255,0.15)"} />
          <rect x="30" y={y + 1} width="28" height="4" rx="2" fill={i === 0 ? "rgba(16,185,129,0.45)" : "rgba(255,255,255,0.13)"} />
        </g>
      ))}
      {/* rows */}
      <rect x="78" y="42" width="80" height="8" rx="3" fill="rgba(255,255,255,0.16)" />
      {[60, 78, 96, 114].map((y, i) => (
        <g key={y}>
          <rect x="78" y={y} width="164" height="16" rx="4" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.09)" />
          <circle cx="88" cy={y + 8} r="3" fill="rgba(16,185,129,0.5)" />
          <rect x="98" y={y + 5} width="70" height="4" rx="2" fill="rgba(255,255,255,0.16)" />
          <rect x="210" y={y + 5} width="24" height="6" rx="3" fill={i % 2 ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.13)"} />
        </g>
      ))}
    </svg>
  )
}

function MockCRM() {
  const bars = [26, 40, 32, 54, 46, 64, 58]
  return (
    <svg viewBox="0 0 260 150" width="100%" height="100%">
      <rect x="8" y="10" width="244" height="130" rx="10" fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.13)" />
      <rect x="8" y="10" width="244" height="22" rx="10" fill="rgba(255,255,255,0.012)" />
      {[20, 30, 40].map((cx, i) => <circle key={i} cx={cx} cy="21" r="2.6" fill={["#ff5f56", "#ffbd2e", "#27c93f"][i]} opacity="0.75" />)}
      {/* KPI cards */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={18 + i * 78} y="42" width="68" height="30" rx="6" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.012)" />
          <rect x={26 + i * 78} y="49" width="30" height="8" rx="2" fill={i === 1 ? "rgba(16,185,129,0.6)" : "rgba(255,255,255,0.18)"} />
          <rect x={26 + i * 78} y="61" width="46" height="4" rx="2" fill="rgba(255,255,255,0.13)" />
        </g>
      ))}
      {/* chart */}
      <rect x="18" y="82" width="224" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.09)" />
      {bars.map((h, i) => (
        <motion.rect key={i} x={30 + i * 30} width="16" rx="2" fill={i === 5 ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.16)"}
          initial={{ height: 0, y: 126 }} whileInView={{ height: h, y: 126 - h }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease }} />
      ))}
    </svg>
  )
}

function MockHub() {
  const nodes = [[70, 56], [190, 46], [206, 104], [64, 108]]
  const cx = 130, cy = 82
  return (
    <svg viewBox="0 0 260 150" width="100%" height="100%">
      <rect x="8" y="10" width="244" height="130" rx="10" fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.13)" />
      <rect x="8" y="10" width="244" height="22" rx="10" fill="rgba(255,255,255,0.012)" />
      {[20, 30, 40].map((c, i) => <circle key={i} cx={c} cy="21" r="2.6" fill={["#ff5f56", "#ffbd2e", "#27c93f"][i]} opacity="0.75" />)}
      {nodes.map(([x, y], i) => (
        <motion.path key={i} d={`M${cx},${cy}L${x},${y}`} stroke="rgba(16,185,129,0.30)" strokeWidth="1.2" strokeDasharray="4 3"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }} />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <motion.circle cx={x} cy={y} r="4" fill="rgba(255,255,255,0.6)"
            initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 260 }} style={{ transformOrigin: `${x}px ${y}px` }} />
          <motion.circle cx={cx} cy={cy} r="2.6" fill="rgba(16,185,129,0.9)"
            animate={{ cx: [cx, x, cx], cy: [cy, y, cy], opacity: [0, 0.9, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r="14" fill="rgba(16,185,129,0.14)" stroke="rgba(16,185,129,0.5)" strokeWidth="1.2" />
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize="7" fontWeight="700" fill="rgba(255,255,255,0.8)" fontFamily="Inter,sans-serif">HUB</text>
    </svg>
  )
}

const FOUNDRY_DEMOS = [
  { tag: "B2B PORTAL", title: "Supplier Portal", desc: "Onboarding fornitori, listini e ordini sincronizzati in tempo reale.", Visual: MockPortal },
  { tag: "CRM", title: "CRM Dashboard", desc: "Pipeline, clienti e metriche di vendita in un'unica dashboard.", Visual: MockCRM },
  { tag: "DISTRIBUTION", title: "Distributor Hub", desc: "Rete distributori, stock multi-sede e logistica automatizzata.", Visual: MockHub },
]

function FoundryDemoCard({ d, i }: { d: typeof FOUNDRY_DEMOS[number]; i: number }) {
  const [h, setH] = useState(false)
  const { Visual } = d
  return (
    <motion.a
      href="/foundry"
      initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: i * 0.09, ease }}
      onHoverStart={() => setH(true)} onHoverEnd={() => setH(false)}
      animate={{ y: h ? -2 : 0 }}
      style={{
        display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 14, textDecoration: "none",
        background: h ? "rgba(8,12,22,0.34)" : "rgba(8,12,22,0.20)",
        backdropFilter: "none", WebkitBackdropFilter: "none",
        border: `1px solid ${h ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.13)"}`,
        borderTop: `1px solid ${h ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.16)"}`,
        boxShadow: h ? "0 8px 32px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.11)" : "inset 0 1px 0 rgba(255,255,255,0.012)",
        transition: "background .24s, border-color .24s, box-shadow .24s",
      } as React.CSSProperties}
    >
      {/* preview */}
      <div style={{ padding: 14, background: "rgba(0,0,0,0.16)", borderBottom: "1px solid rgba(255,255,255,0.16)" }}>
        <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "260 / 150" }}>
          <Visual />
        </div>
      </div>
      {/* body */}
      <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".18em", color: T.green, marginBottom: 9 }}>{d.tag}</div>
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: "#FFFFFF", margin: "0 0 8px" }}>{d.title}</h3>
        <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", lineHeight: 1.7, color: T.muted, margin: 0, flex: 1 }}>{d.desc}</p>
        <motion.span animate={{ opacity: h ? 1 : 0.4, x: h ? 0 : -4 }} transition={{ duration: 0.25 }}
          style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: T.green }}>
          Apri demo <span style={{ fontSize: 14 }}>→</span>
        </motion.span>
      </div>
    </motion.a>
  )
}

function FoundryShowcase() {
  return (
    <section id="foundry-showcase" style={{ ...SEC, padding: "80px 0", borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <div style={WRAP} className="hp-wrap">
        <style>{`
          .foundry-head { display:flex; align-items:flex-end; justify-content:space-between; gap:32px; flex-wrap:wrap; margin-bottom:44px; }
          .foundry-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
          @media(max-width:900px){ .foundry-grid{ grid-template-columns:1fr !important; gap:12px !important; } .foundry-head{ margin-bottom:32px; } }
          @media(min-width:901px) and (max-width:1100px){ .foundry-grid{ gap:12px; } }
        `}</style>

        <Reveal>
          <div className="foundry-head">
            {/* left — eyebrow + title + subtitle */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
                <span style={{ color: T.green }}>//</span>
                <span>[ Digital Foundry ]</span>
              </div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(28px,3.6vw,46px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.035em", margin: "0 0 18px", maxWidth: 760, color: T.text }}>
                Digital Foundry:<br />
                <span style={{ color: "#FFFFFF" }}>Costruisci la tua architettura</span>
              </h2>
              <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: T.muted, lineHeight: 1.8, maxWidth: 620, margin: 0 }}>
                Non comprare a scatola chiusa. Esplora la nostra libreria di soluzioni reali (CRM, Portali B2B, E-commerce), testa le demo e costruisci il tuo Blueprint per un preventivo istantaneo.
              </p>
            </div>

            {/* right — CTA button, top-right at title level */}
            <motion.a
              href="/foundry" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ flexShrink: 0, minHeight: 52, borderRadius: 12, cursor: "pointer", textDecoration: "none", border: "1px solid rgba(16,185,129,0.28)", background: "rgba(16,185,129,0.08)", backdropFilter: "blur(20px) brightness(1.08) saturate(1.3)", WebkitBackdropFilter: "blur(20px) brightness(1.08) saturate(1.3)", boxShadow: "0 0 12px rgba(16,185,129,0.10), inset 0 1px 0 rgba(190,245,220,0.10)", display: "inline-flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO }}
            >
              <span style={{ padding: "0 14px", borderRight: "1px solid rgba(16,185,129,0.20)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "rgba(190,245,220,0.70)" }}>[→]</span>
              <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 22px", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(190,245,220,0.92)" }}>
                Entra nella Foundry <span style={{ fontSize: 14 }}>→</span>
              </span>
            </motion.a>
          </div>
        </Reveal>

        <div className="foundry-grid">
          {FOUNDRY_DEMOS.map((d, i) => <FoundryDemoCard key={d.title} d={d} i={i} />)}
        </div>
      </div>
    </section>
  )
}

export default FoundryShowcase
