import React, { useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"

/* ── Grain ── */
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

/* ── MAAR watermark — fades in after hero, fades before footer ── */
function MaarWatermark() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0.04, 0.14, 0.86, 0.96], [0, 1, 1, 0])
  const y       = useTransform(scrollYProgress, [0.04, 0.96], ["3%", "-3%"])
  return (
    <motion.div aria-hidden style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity,
    }}>
      <motion.span style={{
        y,
        fontFamily: DISPLAY, fontWeight: 900,
        fontSize: "clamp(110px, 30vw, 460px)",
        letterSpacing: "-0.05em", lineHeight: 1,
        color: "rgba(75,85,105,0.13)", filter: "blur(1px)",
        userSelect: "none", whiteSpace: "nowrap",
      }}>MAAR</motion.span>
    </motion.div>
  )
}

/* ── Geometric decoration — abstract shapes + mono labels ── */
function GeoDecoration() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
        {/* large circle — top left */}
        <circle cx="9%" cy="18%" r="160" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <circle cx="9%" cy="18%" r="52"  fill="none" stroke="rgba(8,10,13,0.45)"    strokeWidth="1"/>
        {/* diagonal line */}
        <line x1="70%" y1="0%"   x2="100%" y2="50%" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        {/* rotated square — bottom right */}
        <rect x="80%" y="65%" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" transform="rotate(18,850,720)"/>
        {/* crosshair */}
        <line x1="86%" y1="28%"   x2="86%" y2="35%"   stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
        <line x1="83%" y1="31.5%" x2="89%" y2="31.5%" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
        {/* left horizontal mark */}
        <line x1="0%"  y1="55%"   x2="14%" y2="55%"   stroke="rgba(8,10,13,0.45)"    strokeWidth="1"/>
      </svg>
      {/* mono labels */}
      <span style={{ position: "absolute", left: 18, top: "14%", fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.12)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
        Digital Studio · 2026
      </span>
      <span style={{ position: "absolute", right: 18, top: "22%", fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.10)", writingMode: "vertical-rl" }}>
        Digital Architect · NM
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   BACKGROUND — split panels + grid + grain + MAAR + geo
   Used on About and all service pages. Main page keeps its own background.
══════════════════════════════════════════════════════════════════════════ */
export default function Background() {
  return (
    <>
      {/* ── Split panel base ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>

        <div style={{ position: "absolute", inset: 0, background: "#161B22" }} />
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "42%", background: "#1E2530", borderRight: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "34%", width: "16%", background: "linear-gradient(90deg, #1E2530, #161B22)" }} />

        {/* Blue Lagoon bloom */}
        <div style={{ position: "absolute", top: "-10%", left: "-8%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,120,180,0.11) 0%, rgba(10,90,140,0.05) 50%, transparent 72%)", filter: "blur(90px)", pointerEvents: "none" }} />

        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%), linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%), linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }} />

        {/* Dot layer */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1.4px)",
          backgroundSize: "26px 26px",
          WebkitMaskImage: "radial-gradient(ellipse 52% 48% at 50% 36%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 52%, transparent 76%)",
          maskImage: "radial-gradient(ellipse 52% 48% at 50% 36%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 52%, transparent 76%)",
        }} />

        {/* Edge vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 108% 86% at 50% 42%, transparent 30%, rgba(10,10,13,0.80) 100%)" }} />
      </div>

      <GrainOverlay />
      <MaarWatermark />
      <GeoDecoration />
    </>
  )
}
