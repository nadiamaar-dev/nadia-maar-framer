import React, { useState, useMemo, useEffect } from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Background from "./components/Background"
import FloatingContact from "./components/FloatingContact"
import Sidebar from "./components/Sandbox/Sidebar"
import ProjectCard from "./components/Sandbox/ProjectCard"
import { SANDBOX_ITEMS, SandboxCategory, SandboxType } from "./data/sandboxData"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const BODY: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif", fontSize: "clamp(16px, 1.4vw, 17px)", fontWeight: 400, lineHeight: 1.85, letterSpacing: "0.01em" }

const STYLE_ID = "nm-foundry-styles"
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
.nm-foundry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
@media (max-width: 1100px) {
  .nm-foundry-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .nm-foundry-grid { grid-template-columns: 1fr; gap: 12px; }
}
.nm-foundry-layout {
  display: flex;
  gap: 48px;
  align-items: flex-start;
}
@media (max-width: 767px) {
  .nm-foundry-layout { flex-direction: column; gap: 0; }
}
.nm-foundry-hero {
  max-width: 1160px; margin: 0 auto; padding: 0 32px 72px;
  position: relative;
}
@media (max-width: 767px) {
  .nm-foundry-hero { padding: 0 16px 40px; }
  .nm-foundry-h1 { font-size: clamp(30px, 9vw, 48px) !important; line-height: 0.96 !important; }
}
@media (max-width: 400px) {
  .nm-foundry-h1 { font-size: clamp(28px, 10vw, 42px) !important; }
}
.nm-foundry-content {
  max-width: 1160px; margin: 0 auto; padding: 0 32px;
}
@media (max-width: 767px) {
  .nm-foundry-content { padding: 0 16px; }
}
.nm-foundry-main {
  position: relative; z-index: 2; padding-top: 120px; padding-bottom: 100px;
}
@media (max-width: 767px) {
  .nm-foundry-main { padding-top: 88px; padding-bottom: 64px; }
}
.nm-foundry-count {
  font-family: 'JetBrains Mono',monospace; font-size: 9px;
  letter-spacing: 0.22em; color: rgba(255,255,255,0.28);
  text-transform: uppercase; margin-bottom: 22px;
  display: flex; align-items: center; gap: 10px;
}
.nm-foundry-count::before {
  content: ''; display: inline-block; width: 4px; height: 4px;
  border-radius: 50%; background: rgba(184,50,64,0.70);
}
@media (max-width: 767px) {
  .nm-foundry-count { margin-bottom: 14px; }
}
`

export default function DigitalFoundry() {
  const [category, setCategory] = useState<SandboxCategory>("All")
  const [type, setType] = useState<SandboxType | "all">("all")

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  const filtered = useMemo(() => {
    return SANDBOX_ITEMS.filter(item => {
      const catMatch = category === "All" || item.category === category
      const typeMatch = type === "all" || item.type === type
      return catMatch && typeMatch
    })
  }, [category, type])

  return (
    <div style={{ minHeight: "100vh", background: "#060C18", position: "relative" }}>
      <Background />
      <Header />
      <FloatingContact />

      <main className="nm-foundry-main">

        {/* ── Hero ── */}
        <div className="nm-foundry-hero">

          {/* MAAR watermark */}
          <div aria-hidden style={{
            position: "absolute", right: -8, top: 0, bottom: 0,
            display: "flex", alignItems: "center", pointerEvents: "none",
            zIndex: 0, overflow: "hidden",
          }}>
            <span style={{
              writingMode: "vertical-rl", transform: "rotate(180deg)",
              fontFamily: DISPLAY, fontWeight: 900,
              fontSize: "clamp(120px, 18vw, 220px)",
              letterSpacing: "-0.04em", lineHeight: 0.84,
              color: "rgba(255,255,255,0.012)", filter: "blur(1px)",
              userSelect: "none", whiteSpace: "nowrap",
            }}>MAAR</span>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* eyebrow */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: MONO, fontSize: 11, letterSpacing: ".20em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.63)",
              marginBottom: 22,
            }}>
              <span style={{ color: "#BE3648" }}>//</span>
              <span>[ Digital Foundry · Sandbox ]</span>
            </div>

            {/* headline */}
            <h1 className="nm-foundry-h1" style={{
              fontFamily: DISPLAY, fontSize: "clamp(32px, 4.2vw, 56px)", fontWeight: 900,
              color: "#fff", margin: "0 0 8px", lineHeight: 0.96, letterSpacing: "-0.04em",
            }}>
              Costruisci il tuo
            </h1>
            <h1 className="nm-foundry-h1" style={{
              fontFamily: DISPLAY, fontSize: "clamp(32px, 4.2vw, 56px)", fontWeight: 900,
              color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.40)",
              margin: "0 0 28px", lineHeight: 0.96, letterSpacing: "-0.04em",
            }}>
              progetto ideale
            </h1>

            {/* description */}
            <p style={{ ...BODY, color: "rgba(255,255,255,0.72)", margin: 0, maxWidth: 500 }}>
              Esplora la libreria di soluzioni e componenti. Seleziona ciò che ti serve,
              salvalo nel Blueprint e ricevi un'offerta su misura.
            </p>

            {/* thin accent divider */}
            <div style={{
              marginTop: 40, height: 1,
              background: "linear-gradient(90deg, rgba(184,50,64,0.60), rgba(184,50,64,0.15) 50%, transparent)",
              maxWidth: 500,
            }} />
          </div>
        </div>

        {/* ── Layout: Sidebar + Grid ── */}
        <div className="nm-foundry-content">
          <div className="nm-foundry-layout">
            <Sidebar
              activeCategory={category}
              activeType={type}
              onCategoryChange={setCategory}
              onTypeChange={setType}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm-foundry-count">
                {filtered.length} soluzioni disponibili
              </div>

              {filtered.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "80px 20px",
                  border: "1px dashed rgba(255,255,255,0.10)",
                  borderRadius: 16,
                }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>[ 0 risultati ]</div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 15, color: "rgba(255,255,255,0.40)" }}>Nessun risultato per i filtri selezionati.</div>
                </div>
              ) : (
                <div className="nm-foundry-grid">
                  {filtered.map(item => (
                    <ProjectCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div style={{ position: "relative", zIndex: 2 }}>
        <Footer />
      </div>
    </div>
  )
}
