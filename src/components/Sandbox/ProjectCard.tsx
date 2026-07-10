import React, { useEffect, useState } from "react"
import { SandboxItem } from "../../data/sandboxData"
import { useBlueprint } from "../../context/BlueprintContext"

const MONO    = "'JetBrains Mono',monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"

const STYLE_ID = "nm-project-card-styles"
const CSS = `
.nm-card {
  position: relative; overflow: hidden;
  background: rgba(30,37,48,0.83);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 14px;
  padding: 22px;
  display: flex; flex-direction: column; gap: 14px;
  cursor: default;
  transition: border-color 0.24s ease, transform 0.22s ease, box-shadow 0.24s ease;
}
.nm-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.32);
  box-shadow: 0 4px 24px rgba(0,0,0,0.28);
}
.nm-card-glow {
  position: absolute; top: -60%; left: -40%;
  width: 180%; height: 180%;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.32s ease;
  pointer-events: none;
}
.nm-card:hover .nm-card-glow { opacity: 1; }
.nm-tech-badge {
  display: inline-flex; align-items: center;
  padding: 3px 9px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.20);
  border-radius: 4px;
  font-family: ${MONO}; font-size: 10px;
  color: rgba(255,255,255,0.70); letter-spacing: 0.04em;
}
.nm-card-btn {
  flex: 1; padding: 10px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 8px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.88);
  transition: all 0.18s ease;
  text-align: center;
}
.nm-card-btn:hover {
  background: rgba(255,255,255,0.10);
  color: #fff;
  border-color: rgba(255,255,255,0.40);
}
.nm-card-btn-primary {
  background: rgba(176,74,56,0.59);
  border-color: rgba(176,74,56,0.55);
  color: #fff;
}
.nm-card-btn-primary:hover {
  background: rgba(176,74,56,0.66);
  border-color: rgba(176,74,56,0.80);
  color: #fff;
}
.nm-card-btn-remove {
  background: rgba(176,74,56,0.55);
  border-color: rgba(176,74,56,0.40);
  color: #fff;
}
.nm-card-btn-remove:hover {
  background: rgba(176,74,56,0.62);
  border-color: rgba(176,74,56,0.65);
  color: #fff;
}
`

interface ProjectCardProps {
  item: SandboxItem
}

export default function ProjectCard({ item }: ProjectCardProps) {
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
    <div
      className="nm-card"
      style={{ boxShadow: inBlueprint ? `0 0 0 1px ${item.accent}44, 0 8px 32px ${item.accent}18` : undefined }}
    >
      {/* Glow layer */}
      <div
        className="nm-card-glow"
        style={{ background: `radial-gradient(circle at 40% 40%, ${item.accent}22 0%, transparent 65%)` }}
      />

      {/* Top row: category + type tag */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{
          fontFamily: MONO, fontSize: 9, letterSpacing: "0.20em", textTransform: "uppercase",
          color: item.accent, opacity: 0.85,
        }}>
          {item.category}
        </span>
        <span style={{
          fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.60)",
          padding: "2px 7px",
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: 4,
        }}>
          {item.type === "full-site" ? "Full Site" : "Component"}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 style={{
          fontFamily: DISPLAY, fontSize: 17, fontWeight: 700,
          color: "#fff", margin: 0, lineHeight: 1.25,
          letterSpacing: "-0.01em",
        }}>
          {item.title}
        </h3>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.65,
        color: "rgba(255,255,255,0.72)",
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
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 -22px" }} />

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {item.liveUrl && (
          <a
            href={item.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nm-card-btn"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginRight: 5 }}>
              <path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Live Preview
          </a>
        )}
        <button
          className={`nm-card-btn ${inBlueprint ? "nm-card-btn-remove" : "nm-card-btn-primary"}`}
          onClick={handleBlueprint}
        >
          {added
            ? "✓ Aggiunto"
            : inBlueprint
              ? "− Rimuovi"
              : "+ Blueprint"
          }
        </button>
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${item.accent}66, transparent)`,
        opacity: inBlueprint ? 1 : 0,
        transition: "opacity 0.3s ease",
      }} />
    </div>
  )
}
