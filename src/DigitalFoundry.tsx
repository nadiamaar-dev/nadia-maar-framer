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

const STYLE_ID = "nm-foundry-styles"
const CSS = `
.nm-foundry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 1100px) {
  .nm-foundry-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .nm-foundry-grid { grid-template-columns: 1fr; gap: 14px; }
}
.nm-foundry-layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}
@media (max-width: 767px) {
  .nm-foundry-layout { flex-direction: column; gap: 0; }
}
/* Mobile hero */
.nm-foundry-hero {
  max-width: 1160px; margin: 0 auto; padding: 0 32px 60px;
}
@media (max-width: 767px) {
  .nm-foundry-hero { padding: 0 16px 36px; }
}
/* Mobile content wrapper */
.nm-foundry-content {
  max-width: 1160px; margin: 0 auto; padding: 0 32px;
}
@media (max-width: 767px) {
  .nm-foundry-content { padding: 0 16px; }
}
/* Mobile main offset */
.nm-foundry-main {
  position: relative; z-index: 2; padding-top: 120px; padding-bottom: 80px;
}
@media (max-width: 767px) {
  .nm-foundry-main { padding-top: 88px; padding-bottom: 56px; }
}
/* Result count */
.nm-foundry-count {
  font-family: 'JetBrains Mono',monospace; font-size: 10px;
  letter-spacing: 0.16em; color: rgba(255,255,255,0.28);
  text-transform: uppercase; margin-bottom: 20px;
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
    <div style={{ minHeight: "100vh", background: "#233D4D", position: "relative" }}>
      <Background />
      <Header />
      <FloatingContact />

      <main className="nm-foundry-main">

        {/* Hero header */}
        <div className="nm-foundry-hero">
          <div style={{
            fontFamily: MONO, fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase",
            color: "#B04A38", marginBottom: 16,
          }}>
            Digital Foundry · Sandbox
          </div>
          <h1 style={{
            fontFamily: DISPLAY, fontSize: "clamp(34px, 5vw, 58px)", fontWeight: 800,
            color: "#fff", margin: 0, lineHeight: 1.12, letterSpacing: "-0.03em",
          }}>
            Costruisci il tuo
            <br />
            <span style={{ color: "#fff" }}>progetto ideale.</span>
          </h1>
          <p style={{
            fontFamily: DISPLAY, fontSize: 16, lineHeight: 1.7,
            color: "#fff", margin: "20px 0 0", maxWidth: 520,
          }}>
            Esplora la libreria di soluzioni e componenti. Seleziona ciò che ti serve, salvalo nel Blueprint e ricevi un'offerta su misura.
          </p>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="nm-foundry-content">
          <div className="nm-foundry-layout">
            <Sidebar
              activeCategory={category}
              activeType={type}
              onCategoryChange={setCategory}
              onTypeChange={setType}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Result count */}
              <div className="nm-foundry-count">
                {filtered.length} soluzioni
              </div>

              {filtered.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "60px 20px",
                  color: "rgba(255,255,255,0.30)",
                  fontFamily: DISPLAY, fontSize: 15,
                }}>
                  Nessun risultato per i filtri selezionati.
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
