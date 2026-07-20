import React, { useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"

/* ── Animated film grain ── */
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

/* ── MAAR watermark — centred, fades in after hero, fades before footer ── */
function MaarWatermark() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0.04, 0.14, 0.86, 0.96], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0.04, 0.96], ["3%", "-3%"])
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
        color: "rgba(255,255,255,0.012)", filter: "blur(1px)",
        userSelect: "none", whiteSpace: "nowrap",
      }}>MAAR</motion.span>
    </motion.div>
  )
}

/* ── Thin geometric ornaments — Lab signature decorations ── */
function GeoDecoration() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>

      {/* Slowly rotating dashed ring — top-left */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", left: "-3%", top: "10%", width: 210, height: 210 }}
      >
        <svg width="210" height="210" viewBox="0 0 210 210">
          <circle cx="105" cy="105" r="92" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="2 11" />
        </svg>
      </motion.div>

      {/* Small static circle */}
      <svg style={{ position: "absolute", left: "4%", top: "28%" }} width="58" height="58">
        <circle cx="29" cy="29" r="28" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
      </svg>

      {/* Rotated square — bottom-left */}
      <svg style={{ position: "absolute", left: "5%", bottom: "22%" }} width="34" height="34">
        <rect x="8" y="8" width="18" height="18" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" transform="rotate(45 17 17)" />
      </svg>

      {/* Red accent triangle — mid-right */}
      <svg style={{ position: "absolute", right: "12%", top: "52%" }} width="50" height="44">
        <path d="M25 2 L48 42 L2 42 Z" fill="none" stroke="rgba(168,48,64,0.22)" strokeWidth="1" />
      </svg>

      {/* Crosshair markers */}
      {([["10%","52%"],["48%","8%"],["70%","36%"],["88%","14%"]] as [string,string][]).map(([x,y],i) => (
        <svg key={i} style={{ position: "absolute", left: x, top: y }} width="12" height="12">
          <path d="M6 0 V12 M0 6 H12" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
        </svg>
      ))}

      {/* Diagonal accent line */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
        <line x1="72%" y1="0" x2="86%" y2="100%" stroke="rgba(255,255,255,0.012)" strokeWidth="1" />
      </svg>

      {/* Vertical mono labels */}
      <span style={{
        position: "absolute", left: 16, top: "14%",
        fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.12)", writingMode: "vertical-rl", transform: "rotate(180deg)",
        userSelect: "none",
      }}>Digital Studio · 2026</span>
      <span style={{
        position: "absolute", right: 16, top: "22%",
        fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.10)", writingMode: "vertical-rl",
        userSelect: "none",
      }}>Digital Architect · NM</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   BACKGROUND — single source of truth for all pages.
   Edit here → changes globally everywhere.
══════════════════════════════════════════════════════════════════════════ */
export default function Background({ portal = false }: { portal?: boolean }) {
  return (
    <>
      {/* Mobile fixes injected once */}
      <style>{`
        /* Fix 1 — OLED black crush: lift base on mobile so #060C18 doesn't merge into black */
        @media (max-width: 768px) {
          .bg-base   { background: #0d1829 !important; }
          .bg-wash-1 { opacity: 0.22 !important; }
          .bg-wash-2 { opacity: 0.24 !important; }
        }
        /* Fix 2 — High-DPI grid visibility: thicker lines + smaller cell on mobile */
        @media (max-width: 768px) {
          .bg-grid {
            background-image:
              linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px) !important;
            background-size: 36px 36px !important;
          }
          .bg-dots {
            background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1.4px) !important;
            background-size: 20px 20px !important;
          }
        }
        /* Fix 3 — Vignette: softer on mobile so edges don't crush */
        @media (max-width: 768px) {
          .bg-bezel { box-shadow: inset 0 0 80px rgba(0,0,0,0.70) !important; }
          .bg-bezel-portal { box-shadow: inset 0 0 120px rgba(0,0,0,0.85) !important; }
        }
      `}</style>

      {/* 1 · Base dark surface + perspective grid + dot layer + edge vignette */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div className="bg-base" style={{ position: "absolute", inset: 0, background: "#060C18" }} />

        {/* Perspective-warped line grid */}
        <div style={{ position: "absolute", inset: 0, perspective: "820px" }}>
          <motion.div
            className="bg-grid"
            animate={{
              rotateX: [7, 13, 7],
              rotateY: [-0.8, -3, -0.8],
              scale:   [1.06, 1.10, 1.06],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              WebkitMaskImage: "radial-gradient(ellipse 92% 80% at 50% 40%, black 22%, rgba(0,0,0,0.55) 60%, transparent 90%)",
              maskImage: "radial-gradient(ellipse 92% 80% at 50% 40%, black 22%, rgba(0,0,0,0.55) 60%, transparent 90%)",
              transformOrigin: "50% 62%",
            }}
          />
        </div>

        {/* Fine dot layer */}
        <div className="bg-dots" style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1.4px)",
          backgroundSize: "26px 26px",
          WebkitMaskImage: "radial-gradient(ellipse 52% 48% at 50% 36%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 52%, transparent 76%)",
          maskImage: "radial-gradient(ellipse 52% 48% at 50% 36%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 52%, transparent 76%)",
        }} />

        {/* Edge vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 108% 86% at 50% 42%, transparent 30%, rgba(10,14,23,0.80) 100%)" }} />

        {/* Mobile radial glow — adds depth so grid doesn't float in void on OLED */}
        <div aria-hidden style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: "min(600px, 100vw)", height: "min(600px, 100vw)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,40,80,0.35) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
      </div>

      {/* 2 · Depth washes — lighter on mobile to avoid OLED black crush */}
      <div className="bg-wash-1" aria-hidden style={{ position: "fixed", inset: 0, background: "#060C18", opacity: 0.45, pointerEvents: "none", zIndex: 0 }} />
      <div className="bg-wash-2" aria-hidden style={{ position: "fixed", inset: 0, background: "#1A1A1E", opacity: 0.48, pointerEvents: "none", zIndex: 0 }} />

      {/* 3 · Geometric ornaments — hidden in portal/cabinet mode */}
      {!portal && <GeoDecoration />}

      {/* 4 · Screen bezel — softer on mobile */}
      <div className={portal ? "bg-bezel-portal" : "bg-bezel"} aria-hidden style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none", boxShadow: portal ? "inset 0 0 220px rgba(0,0,0,0.98)" : "inset 0 0 150px rgba(0,0,0,0.95)" }} />

      {/* 5 · Film grain */}
      <GrainOverlay />

      {/* 7 · MAAR watermark */}
      {!portal && <MaarWatermark />}
    </>
  )
}
