/**
 * NadiaMaar_Architecture.tsx — il manifesto tecnico di questo sito.
 * Rotta: /architecture
 *
 * La pagina che il commento in cima a index.html promette da mesi: come è
 * costruito il sito, raccontato con affermazioni verificabili e con le
 * misure del caricamento in corso — lette dal browser del visitatore, non
 * scritte da noi (src/hooks/useSelfMetrics.ts).
 */

import React from "react"
import { motion } from "framer-motion"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Background from "./components/Background"
import FloatingContact from "./components/FloatingContact"
import { useLocale } from "./lib/i18n/LocaleContext"
import { useT } from "./lib/i18n/t"
import { ARCHITECTURE_STR } from "./lib/i18n/strings/architecture"
import { useSelfMetrics } from "./hooks/useSelfMetrics"
import { usePointerGlow } from "./hooks/usePointerGlow"

/* ── tokens: identici a /projects, la pagina è parte della stessa famiglia ── */
const T = {
  bg: "#060C18", text: "#FFFFFF", muted: "#FFFFFF", faint: "#FFFFFF",
  border: "rgba(255,255,255,0.11)",
  accentLt: "#BE3648", accentTx: "#E4697A", green: "#10B981",
} as const
const MONO = "'JetBrains Mono','SF Mono',ui-monospace,monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const BODY: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif", fontSize: "clamp(16px, 1.4vw, 17px)", fontWeight: 400, lineHeight: 1.85, letterSpacing: "0.01em" }
const WRAP: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "0 32px" }
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const GLASS: React.CSSProperties = {
  background: "rgba(14,24,31,0.22)",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
  border: "1px solid rgba(255,255,255,0.17)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.24)",
}

const ARCH_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; scroll-behavior: smooth; overflow-x: hidden; }
  body { overflow-x: clip; font-family: 'Space Grotesk', system-ui, sans-serif; }
  #root { overflow-x: clip; }
  :root { --x:-9999; --y:-9999; --xp:0; --yp:0; }

  .ar-live-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .ar-flow-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .ar-dec-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ar-verify    { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 1024px) {
    .ar-live-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 860px) {
    .ar-flow-grid, .ar-dec-grid, .ar-verify { grid-template-columns: 1fr; }
    .ar-hero-h1 { font-size: clamp(34px, 10vw, 60px) !important; }
  }
  @media (max-width: 560px) {
    .ar-live-grid { grid-template-columns: 1fr 1fr; }
  }
`

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease }}
    >{children}</motion.div>
  )
}

function Kicker({ n, text }: { n: string; text: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.18em", color: T.accentTx }}>{n}</span>
      <span aria-hidden style={{ width: 30, height: 1, background: "linear-gradient(90deg, rgba(190,54,72,0.6), rgba(190,54,72,0.1))" }} />
      <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>{text}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §00 Hero
══════════════════════════════════════════════════════════════════════════ */
function Hero() {
  const t = useT(ARCHITECTURE_STR)
  return (
    <section style={{ padding: "132px 0 76px", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", right: 14, top: 88, zIndex: 0, pointerEvents: "none", writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(150px,15vw,214px)", letterSpacing: "-0.04em", lineHeight: 0.84, whiteSpace: "nowrap", color: "rgba(255,255,255,0.012)", filter: "blur(1px)", userSelect: "none" }}>MAAR</div>
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <Reveal><Kicker n="§00" text={t.hero.kicker} /></Reveal>

        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.26em", color: "#FFFFFF", marginBottom: 10, textTransform: "uppercase" as const }}>{t.hero.over}</div>

        <motion.h1 className="ar-hero-h1"
          initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(40px,7vw,96px)", lineHeight: 0.9, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.58)", userSelect: "none" }}>
          {t.hero.lineOutlined}
        </motion.h1>
        <motion.div className="ar-hero-h1"
          initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.18, ease }}
          style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(40px,7vw,96px)", lineHeight: 0.9, letterSpacing: "-0.05em", color: "#FFFFFF", userSelect: "none" }}>
          {t.hero.lineSolid}
        </motion.div>

        <Reveal delay={0.24}>
          <p style={{ ...BODY, color: T.muted, maxWidth: 680, margin: "26px 0 0" }}>{t.hero.lead}</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §01 Le misure del caricamento in corso
══════════════════════════════════════════════════════════════════════════ */
function fmt(v: number | null, unit: string, waiting: string): string {
  if (v === null) return waiting
  return unit === "ms" && v >= 1000 ? `${(v / 1000).toFixed(2)} s` : `${v}${unit === "ms" ? " ms" : unit === "kb" ? " kB" : ""}`
}

function LiveMetrics() {
  const t = useT(ARCHITECTURE_STR)
  const m = useSelfMetrics()

  const cards: { label: string; value: string; good?: boolean }[] = [
    { label: t.live.ttfb, value: fmt(m.ttfb, "ms", t.live.waiting) },
    { label: t.live.fcp, value: fmt(m.fcp, "ms", t.live.waiting) },
    { label: t.live.js, value: fmt(m.jsKb, "kb", t.live.waiting) },
    { label: t.live.requests, value: m.requests === null ? t.live.waiting : String(m.requests) },
    {
      label: t.live.thirdParty,
      value: m.thirdPartyBeforePaint === null ? t.live.waiting : String(m.thirdPartyBeforePaint),
      good: m.thirdPartyBeforePaint === 0,
    },
  ]

  return (
    <section style={{ padding: "70px 0", borderTop: `1px solid ${T.border}` }}>
      <div style={WRAP}>
        <Reveal><Kicker n="§01" text={t.live.kicker} /></Reveal>
        <Reveal delay={0.06}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.2vw,42px)", lineHeight: 1.08, letterSpacing: "-0.035em", color: "#FFFFFF", margin: "0 0 14px" }}>{t.live.title}</h2>
          <p style={{ ...BODY, color: T.muted, maxWidth: 640, margin: "0 0 34px" }}>{t.live.lead}</p>
        </Reveal>

        <Reveal delay={0.12}>
          {/* aria-live: i valori arrivano dopo il load, uno screen reader deve saperlo */}
          <div className="ar-live-grid" aria-live="polite">
            {cards.map(c => (
              <div key={c.label} style={{ padding: "18px 16px", borderRadius: 14, ...GLASS }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(20px,2.2vw,28px)", letterSpacing: "-0.03em", lineHeight: 1, color: c.good ? "rgba(150,240,200,0.95)" : "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>
                  {c.value}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "#FFFFFF", marginTop: 10, lineHeight: 1.5 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <p style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.8, letterSpacing: "0.02em", color: "rgba(255,255,255,0.55)", maxWidth: 640, margin: "22px 0 0" }}>
            {t.live.disclaimer}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §02 Persona / crawler: i due percorsi
══════════════════════════════════════════════════════════════════════════ */
function FlowColumn({ label, steps, accent }: { label: string; steps: string[]; accent?: boolean }) {
  return (
    <div style={{ padding: "24px 22px", borderRadius: 16, ...GLASS, borderColor: accent ? "rgba(190,54,72,0.35)" : "rgba(255,255,255,0.17)" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent ? T.accentLt : T.green, boxShadow: `0 0 10px ${accent ? "rgba(190,54,72,0.6)" : "rgba(16,185,129,0.6)"}` }} />
        <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>{label}</span>
      </div>
      <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map((s, i) => (
          <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color: accent ? T.accentTx : "rgba(150,240,200,0.9)", paddingTop: 5, flexShrink: 0 }}>0{i + 1}</span>
            <span style={{ ...BODY, fontSize: 15, lineHeight: 1.7, color: T.muted }}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Flow() {
  const t = useT(ARCHITECTURE_STR)
  return (
    <section style={{ padding: "70px 0", borderTop: `1px solid ${T.border}` }}>
      <div style={WRAP}>
        <Reveal><Kicker n="§02" text={t.flow.kicker} /></Reveal>
        <Reveal delay={0.06}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.2vw,42px)", lineHeight: 1.08, letterSpacing: "-0.035em", color: "#FFFFFF", margin: "0 0 14px", maxWidth: 760 }}>{t.flow.title}</h2>
          <p style={{ ...BODY, color: T.muted, maxWidth: 640, margin: "0 0 34px" }}>{t.flow.lead}</p>
        </Reveal>

        <div className="ar-flow-grid">
          <Reveal delay={0.1}><FlowColumn label={t.flow.human.label} steps={t.flow.human.steps} /></Reveal>
          <Reveal delay={0.16}><FlowColumn label={t.flow.bot.label} steps={t.flow.bot.steps} accent /></Reveal>
        </div>

        <Reveal delay={0.22}>
          <div style={{ marginTop: 18, padding: "14px 18px", borderRadius: 12, background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.10)", overflowX: "auto" }}>
            <code style={{ fontFamily: MONO, fontSize: 11.5, lineHeight: 1.7, color: "rgba(255,255,255,0.72)", whiteSpace: "pre-wrap" }}>{t.flow.note}</code>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §03 Le sette decisioni
══════════════════════════════════════════════════════════════════════════ */
function Decisions() {
  const t = useT(ARCHITECTURE_STR)
  return (
    <section style={{ padding: "70px 0", borderTop: `1px solid ${T.border}` }}>
      <div style={WRAP}>
        <Reveal><Kicker n="§03" text={t.decisions.kicker} /></Reveal>
        <Reveal delay={0.06}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.2vw,42px)", lineHeight: 1.08, letterSpacing: "-0.035em", color: "#FFFFFF", margin: "0 0 14px" }}>{t.decisions.title}</h2>
          <p style={{ ...BODY, color: T.muted, maxWidth: 640, margin: "0 0 34px" }}>{t.decisions.lead}</p>
        </Reveal>

        <div className="ar-dec-grid">
          {t.decisions.items.map((it, i) => (
            <Reveal key={it.t} delay={0.06 + (i % 2) * 0.06}>
              <div style={{ padding: "24px 22px", borderRadius: 16, height: "100%", ...GLASS }}>
                <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase" as const, color: "rgba(184,50,64,0.55)", marginBottom: 14 }}>[ 0{i + 1} ]</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", lineHeight: 1.25, margin: "0 0 9px", color: "#FFFFFF" }}>{it.t}</h3>
                <p style={{ ...BODY, fontSize: 15, lineHeight: 1.75, color: T.muted, margin: 0 }}>{it.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §04 Verificalo da solo
══════════════════════════════════════════════════════════════════════════ */
function Verify() {
  const t = useT(ARCHITECTURE_STR)
  return (
    <section style={{ padding: "70px 0", borderTop: `1px solid ${T.border}` }}>
      <div style={WRAP}>
        <Reveal><Kicker n="§04" text={t.verify.kicker} /></Reveal>
        <Reveal delay={0.06}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.2vw,42px)", lineHeight: 1.08, letterSpacing: "-0.035em", color: "#FFFFFF", margin: "0 0 14px" }}>{t.verify.title}</h2>
          <p style={{ ...BODY, color: T.muted, maxWidth: 640, margin: "0 0 30px" }}>{t.verify.lead}</p>
        </Reveal>

        <div className="ar-verify">
          {t.verify.items.map((it, i) => {
            const inner = (
              <>
                <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase" as const, color: T.accentTx, marginBottom: 10 }}>{it.label}</div>
                <code style={{ fontFamily: MONO, fontSize: 11.5, lineHeight: 1.65, color: "rgba(255,255,255,0.78)", display: "block", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  <span aria-hidden style={{ color: "rgba(150,240,200,0.7)" }}>$ </span>{it.cmd}
                </code>
              </>
            )
            const box: React.CSSProperties = { padding: "18px 20px", borderRadius: 14, background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.10)", display: "block", textDecoration: "none" }
            return (
              <Reveal key={it.label} delay={0.06 + (i % 2) * 0.05}>
                {"href" in it && it.href
                  ? <a href={it.href} target="_blank" rel="noopener noreferrer" style={box}>{inner}</a>
                  : <div style={box}>{inner}</div>}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   §05 CTA
══════════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  const t = useT(ARCHITECTURE_STR)
  const { href: L } = useLocale()
  return (
    <section style={{ padding: "90px 0 46px", borderTop: `1px solid ${T.border}` }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ borderRadius: 24, position: "relative", overflow: "hidden", ...GLASS, padding: "clamp(36px,5vw,64px)" }}>
            <div style={{ position: "relative", zIndex: 1, maxWidth: 660 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" as const, color: T.accentTx, marginBottom: 20 }}>
                <span>●</span><span>{t.cta.kicker}</span>
              </div>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.06, letterSpacing: "-0.04em", color: "#FFFFFF", margin: "0 0 18px" }}>{t.cta.title}</h2>
              <p style={{ ...BODY, color: T.muted, margin: "0 0 34px", maxWidth: 540 }}>{t.cta.lead}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <motion.a href={`${L("/")}#s7`} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  style={{ minHeight: 54, borderRadius: 12, textDecoration: "none", border: "1px solid rgba(184,50,64,0.80)", background: "linear-gradient(90deg, rgba(184,50,64,0.34) 0%, rgba(184,50,64,0.20) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0 12px rgba(184,50,64,0.20), inset 0 1px 0 rgba(255,255,255,0.12)", display: "inline-flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO }}>
                  <span style={{ padding: "0 14px", borderRight: "1px solid rgba(184,50,64,0.45)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "#FFFFFF" }}>[→]</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 20px", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>{t.cta.primary}</span>
                </motion.a>
                <motion.a href={L("/contatti")} whileHover={{ y: -2, background: "rgba(255,255,255,0.09)" }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  style={{ minHeight: 54, padding: "0 22px", borderRadius: 12, fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, display: "inline-flex", alignItems: "center", textDecoration: "none", border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.04)", color: T.text }}>
                  {t.cta.secondary}
                </motion.a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Pagina
══════════════════════════════════════════════════════════════════════════ */
export default function NadiaMaarArchitecture() {
  usePointerGlow()

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Space Grotesk', system-ui, sans-serif", overflowX: "clip", minHeight: "100vh", position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: ARCH_CSS }} />
      <Background />
      <FloatingContact />
      <Header />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <LiveMetrics />
        <Flow />
        <Decisions />
        <Verify />
        <FinalCTA />
      </div>
      <Footer />
    </div>
  )
}
