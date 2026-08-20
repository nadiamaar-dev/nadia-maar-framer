/**
 * StudioCapabilities — perché la velocità determina il fatturato
 * Sezione nata sulla home e spostata su About, dove viveva già il suo gemello
 * tematico. Il codice è quello originale: cambiano solo i nomi delle classi,
 * che prima dipendevano dal CSS globale di NadiaMaar_Lab.tsx.
 */
import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { DISPLAY, MONO, RESPONSIVE_CSS, Reveal, SANS, SEC, T, WRAP, ease } from "./tokens"
import { useT } from "../../lib/i18n/t"
import { STUDIO_STR } from "../../lib/i18n/strings/studio"


/* Numeri, icona e colori: il testo (etichetta del punteggio, titolo, corpo)
   arriva dal dizionario e si accoppia per posizione. */
const TECH_ART = [
  {
    metric: "< 0.5s",
    score: 96,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    color: "rgba(251,191,36,1)",
    colorDim: "rgba(251,191,36,0.14)",
    colorBd: "rgba(251,191,36,0.30)",
  },
  {
    metric: "100/100",
    score: 100,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    color: T.accentLt,
    colorDim: "rgba(255,70,100,0.14)",
    colorBd: "rgba(255,70,100,0.32)",
  },
  {
    metric: "99.9%",
    score: 99,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    color: T.green,
    colorDim: "rgba(16,185,129,0.12)",
    colorBd: "rgba(16,185,129,0.28)",
  },
]

type TechPoint = typeof TECH_ART[number] & { scoreLabel: string; title: string; body: string }

function TechRow({ metric, score, scoreLabel, icon, title, body, color, colorDim, colorBd, index }: TechPoint & { index: number }) {
  const [hov, setHov] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const R = 26, C = 2 * Math.PI * R

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.10, ease }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      className="studio-tech-row"
      style={{
        position: "relative", display: "flex", alignItems: "stretch",
        borderRadius: 14, overflow: "hidden",
        background: hov ? "rgba(255,255,255,0.042)" : "rgba(255,255,255,0.018)",
        border: `1px solid ${hov ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.07)"}`,
        transition: "background 0.28s, border-color 0.28s",
        cursor: "default",
      } as React.CSSProperties}
    >
      {/* Left accent stripe */}
      <div aria-hidden className="studio-tech-stripe" style={{ width: 3, flexShrink: 0, background: color, opacity: hov ? 1 : 0.55, transition: "opacity 0.28s", borderRadius: "14px 0 0 14px" }} />

      {/* Metric block */}
      <div className="studio-tech-metric" style={{ padding: "26px 28px", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", minWidth: 148, flexShrink: 0, gap: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em", color: hov ? color : "#FFFFFF", transition: "color 0.28s", whiteSpace: "nowrap" as const }}>{metric}</span>
        <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>{scoreLabel}</span>
        <div className="studio-tech-metric-progress" style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.11)", borderRadius: 1, overflow: "hidden", marginTop: 2 }}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: inView ? `${score}%` : "0%" }}
            transition={{ duration: 1.2, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: "100%", background: color, borderRadius: 1 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="studio-tech-content" style={{ padding: "26px 28px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: colorDim, border: `1px solid ${colorBd}`, color, flexShrink: 0, transition: "background 0.25s" }}>
            {icon}
          </div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: "#FFFFFF", margin: 0, lineHeight: 1.2 }}>{title}</h3>
        </div>
        <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", lineHeight: 1.68, color: T.muted, margin: 0 }}>{body}</p>
      </div>

      {/* Score ring */}
      <div className="studio-tech-ring" style={{ padding: "26px 28px", borderLeft: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <svg viewBox="0 0 64 64" width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="2.5" />
            <motion.circle cx="32" cy="32" r={R} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: inView ? C * (1 - score / 100) : C }}
              transition={{ duration: 1.3, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: hov ? color : "#FFFFFF", lineHeight: 1, transition: "color 0.28s" }}>{score}</span>
            <span style={{ fontFamily: MONO, fontSize: 7.5, color: "#FFFFFF", letterSpacing: "0.08em" }}>/100</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function StudioCapabilities() {
  const t = useT(STUDIO_STR).capabilities
  return (
    <section style={{ ...SEC, padding: "80px 0", borderTop: `1px solid ${T.border}` }} className="studio-sec">
      {/* Il layout mobile delle righe viveva nel CSS globale della home:
          spostato qui, altrimenti su About le schede resterebbero a tre
          colonne strette anche sul telefono. */}
      <style>{`
        ${RESPONSIVE_CSS}
        @media (max-width: 680px) {
          .studio-tech-row  { flex-wrap: wrap !important; }
          .studio-tech-stripe {
            order: 0;
            width: 100% !important; height: 3px !important;
            border-radius: 14px 14px 0 0 !important;
          }
          .studio-tech-metric {
            order: 1;
            flex: 1 1 auto !important; min-width: 0 !important;
            border-right: none !important;
            flex-direction: row !important; align-items: center !important;
            justify-content: flex-start !important; gap: 16px !important;
            padding: 16px 18px !important;
          }
          .studio-tech-metric-progress { flex: 1; }
          .studio-tech-ring {
            order: 2;
            border-left: none !important;
            padding: 16px 18px 16px 0 !important;
            align-self: center !important;
          }
          .studio-tech-content {
            order: 3;
            width: 100% !important; flex: 0 0 100% !important;
            border-top: 1px solid rgba(255,255,255,0.07) !important;
            padding: 14px 18px 18px !important;
          }
          .studio-tech-metric span:first-child { font-size: 26px !important; }
        }
      `}</style>
      <div style={WRAP} className="studio-wrap">
        <Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
            <span style={{ color: T.accentLt }}>//</span>
            <span>{t.kicker}</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(30px,3.4vw,50px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 18px", maxWidth: "min(680px,100%)", color: T.text }}>
            {t.title}
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: T.muted, lineHeight: 1.75, maxWidth: "min(740px,100%)", marginBottom: 40 }}>
            {t.lead}
          </p>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TECH_ART.map((pt, i) => (
            <TechRow key={i} {...pt} {...t.items[i]} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
