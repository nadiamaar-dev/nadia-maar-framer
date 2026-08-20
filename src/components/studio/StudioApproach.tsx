/**
 * StudioApproach — il manifesto «un solo partner»
 * Sezione nata sulla home e spostata su About, dove viveva già il suo gemello
 * tematico. Il codice è quello originale: cambiano solo i nomi delle classi,
 * che prima dipendevano dal CSS globale di NadiaMaar_Lab.tsx.
 */
import React, { useState } from "react"
import { motion } from "framer-motion"
import { DISPLAY, MONO, RESPONSIVE_CSS, Reveal, SANS, SEC, T, WRAP, ease } from "./tokens"
import { useT } from "../../lib/i18n/t"
import { STUDIO_STR } from "../../lib/i18n/strings/studio"


/* Numero e icona: il testo arriva dal dizionario, accoppiato per posizione. */
const ADVANTAGES_ART = [
  {
    n: "01",
    icon: (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>),
  },
  {
    n: "02",
    icon: (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
  },
  {
    n: "03",
    icon: (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>),
  },
]


function MetodoCard({ n, title, body, icon, i }: { n: string; title: string; body: string; icon: React.ReactNode; i: number }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: i * 0.09, ease }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{ position: "relative", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.09)", height: "100%" }}
    >
      {/* Glass background — bottom fade mask */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, background: "rgba(255,255,255,0.008)", backdropFilter: "blur(6px) brightness(1.03)", WebkitBackdropFilter: "blur(6px) brightness(1.03)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", maskImage: "linear-gradient(to bottom, black 40%, transparent 85%)", pointerEvents: "none" }} />

      {/* Gradient border — top + sides fade to mid */}
      <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, padding: 1, background: `linear-gradient(to bottom, ${hov ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.53)"} 0%, transparent 52%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", pointerEvents: "none", zIndex: 2, transition: "background 0.28s" }} />

      {/* Big watermark number — behind content */}
      <div aria-hidden style={{ position: "absolute", bottom: -10, right: 16, fontFamily: DISPLAY, fontSize: 130, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.06em", color: "rgba(255,60,92,0.10)", userSelect: "none" as const, pointerEvents: "none", zIndex: 1 }}>{n}</div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 3, padding: "28px 26px 36px", height: "100%", boxSizing: "border-box" as const, display: "flex", flexDirection: "column" }}>

        {/* Top row: icon + tag */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.24)", color: "#FFFFFF" }}>
            {icon}
          </div>
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.22em", color: "#FFFFFF" }}>[ {n} ]</span>
        </div>

        {/* Title */}
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, lineHeight: 1.22, letterSpacing: "-0.02em", color: "#FFFFFF", margin: "0 0 14px" }}>{title}</h3>

        {/* Red accent divider */}
        <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg, ${T.accent}, transparent)`, marginBottom: 14, borderRadius: 2, opacity: hov ? 1 : 0.55, transition: "opacity 0.28s" }} />

        {/* Body */}
        <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", lineHeight: 1.72, color: T.muted, margin: 0, flex: 1 }}>{body}</p>
      </div>
    </motion.div>
  )
}

export default function StudioApproach() {
  const t = useT(STUDIO_STR).approach
  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }} className="studio-sec">
      <div style={WRAP} className="studio-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
            <span style={{ color: T.accentLt }}>//</span>
            <span>{t.kicker}</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,3.4vw,44px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18, maxWidth: 780, color: T.text }}>
            {/* senza "Il Metodo:" davanti: il metodo è il processo in quattro
                fasi, e due sezioni che si chiamavano entrambe così erano
                proprio il problema da cui è partito questo lavoro */}
            {t.title}
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: T.muted, lineHeight: 1.75, maxWidth: 740, marginBottom: 40 }}>
            {t.lead}
          </p>
        </Reveal>

        <style>{`
          ${RESPONSIVE_CSS}
          .aio-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
          @media(max-width:700px){ .aio-grid{grid-template-columns:1fr!important;gap:10px!important;} }
          @media(min-width:701px) and (max-width:960px){ .aio-grid{grid-template-columns:repeat(2,1fr)!important;} }
        `}</style>
        <div className="aio-grid">
          {ADVANTAGES_ART.map((a, i) => (
            <MetodoCard key={a.n} n={a.n} title={t.items[i].title} body={t.items[i].body} icon={a.icon} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
