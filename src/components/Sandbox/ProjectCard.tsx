import React, { useEffect, useState } from "react"
import { SandboxItem } from "../../data/sandboxData"
import { useBlueprint } from "../../context/BlueprintContext"

const MONO    = "'JetBrains Mono',monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const BODY    = "'Geist', system-ui, sans-serif"

const STYLE_ID = "nm-project-card-styles"
const CSS = `
.nm-card {
  position: relative; overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.22);
  display: flex; flex-direction: column;
  cursor: default;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}
.nm-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.38);
}

/* Glass background — bottom fade */
.nm-card-glass {
  position: absolute; inset: 0; border-radius: 16px;
  background: rgba(255,255,255,0.008);
  backdrop-filter: blur(6px) brightness(1.03);
  -webkit-backdrop-filter: blur(6px) brightness(1.03);
  -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 85%);
  mask-image: linear-gradient(to bottom, black 40%, transparent 85%);
  pointer-events: none;
}

/* Gradient border — top + sides fade to mid */
.nm-card-border {
  position: absolute; inset: 0; border-radius: 16px;
  padding: 1px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.40) 0%, transparent 52%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none; z-index: 2;
}

.nm-card-inner {
  position: relative; z-index: 3;
  padding: 20px 20px 18px;
  display: flex; flex-direction: column; gap: 12px;
  height: 100%;
}

.nm-tech-badge {
  display: inline-flex; align-items: center;
  padding: 3px 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 4px;
  font-family: ${MONO}; font-size: 9.5px;
  color: rgba(255,255,255,0.55); letter-spacing: 0.06em;
}

/* Blueprint CTA button — [01] style */
.nm-card-btn-row {
  display: flex; gap: 8px; margin-top: auto; padding-top: 4px;
}
.nm-card-btn-outline {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 8px; cursor: pointer;
  font-family: ${MONO}; font-size: 9.5px; font-weight: 500;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255,255,255,0.55); text-decoration: none;
  transition: all 0.18s ease; flex-shrink: 0;
}
.nm-card-btn-outline:hover {
  border-color: rgba(255,255,255,0.30);
  color: rgba(255,255,255,0.88);
  background: rgba(255,255,255,0.05);
}

/* Blueprint button — [01] mono glass style */
.nm-card-btn-bp {
  flex: 1;
  display: flex; align-items: stretch; overflow: hidden;
  border-radius: 9px; cursor: pointer;
  border: 1px solid rgba(161,44,56,0.50);
  background: linear-gradient(90deg, rgba(161,44,56,0.34) 0%, rgba(161,44,56,0.18) 100%);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 0 10px rgba(161,44,56,0.15), inset 0 1px 0 rgba(255,255,255,0.10);
  transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
}
.nm-card-btn-bp:hover {
  border-color: rgba(161,44,56,0.80);
  background: linear-gradient(90deg, rgba(161,44,56,0.50) 0%, rgba(161,44,56,0.30) 100%);
  box-shadow: 0 0 20px rgba(161,44,56,0.28), inset 0 1px 0 rgba(255,255,255,0.14);
}
.nm-card-btn-bp-tag {
  padding: 9px 10px;
  border-right: 1px solid rgba(161,44,56,0.38);
  display: flex; align-items: center;
  font-family: ${MONO}; font-size: 8.5px; letter-spacing: 0.20em;
  color: rgba(255,255,255,0.70); flex-shrink: 0;
}
.nm-card-btn-bp-label {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-family: ${MONO}; font-size: 9.5px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: #fff; padding: 9px 12px;
}

/* In-blueprint glow border */
.nm-card-inbp {
  box-shadow: 0 0 0 1px rgba(161,44,56,0.45), 0 8px 32px rgba(161,44,56,0.12) !important;
}

/* Bottom accent line when in blueprint */
.nm-card-accent-line {
  position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  transition: opacity 0.3s ease; pointer-events: none; z-index: 4;
}
`

export default function ProjectCard({ item }: { item: SandboxItem }) {
  const { user, isInBlueprint, addToBlueprint, removeFromBlueprint, openAuthModal } = useBlueprint()
  const inBlueprint = isInBlueprint(item.id)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  const handleBlueprint = () => {
    if (!user) { openAuthModal(); return }
    if (inBlueprint) {
      removeFromBlueprint(item.id)
      setAdded(false)
    } else {
      addToBlueprint(item)
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    }
  }

  return (
    <div className={`nm-card${inBlueprint ? " nm-card-inbp" : ""}`}>

      {/* Glass bg — bottom fade */}
      <div className="nm-card-glass" />

      {/* Gradient border */}
      <div className="nm-card-border" />

      {/* Bottom accent glow line when in blueprint */}
      <div className="nm-card-accent-line" style={{
        background: `linear-gradient(90deg, transparent, ${item.accent}88, transparent)`,
        opacity: inBlueprint ? 1 : 0,
      }} />

      <div className="nm-card-inner">

        {/* Top row: category tag + type badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: "0.20em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
          }}>
            {item.category}
          </span>
          <span style={{
            fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.40)",
            padding: "2px 7px",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 4,
          }}>
            {item.type === "full-site" ? "Full Site" : "Component"}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: DISPLAY, fontSize: 17, fontWeight: 700,
          color: "#fff", margin: 0, lineHeight: 1.25,
          letterSpacing: "-0.015em",
        }}>
          {item.title}
        </h3>

        {/* Description */}
        <p style={{
          fontFamily: BODY, fontSize: 14, fontWeight: 400,
          lineHeight: 1.70, letterSpacing: "0.005em",
          color: "rgba(255,255,255,0.65)",
          margin: 0, flexGrow: 1,
        }}>
          {item.description}
        </p>

        {/* Tech stack */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {item.tech.map(t => (
            <span key={t} className="nm-tech-badge">{t}</span>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04) 60%, transparent)",
        }} />

        {/* Actions */}
        <div className="nm-card-btn-row">
          {item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nm-card-btn-outline"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Preview
            </a>
          )}
          <button className="nm-card-btn-bp" onClick={handleBlueprint}>
            <span className="nm-card-btn-bp-tag">{inBlueprint ? "[−]" : "[+]"}</span>
            <span className="nm-card-btn-bp-label">
              {added ? "✓ Aggiunto" : inBlueprint ? "Rimuovi" : "Blueprint"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
