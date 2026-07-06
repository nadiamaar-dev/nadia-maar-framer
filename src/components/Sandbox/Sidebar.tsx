import React, { useEffect, useState } from "react"
import { SandboxCategory, SandboxType } from "../../data/sandboxData"
import { useBlueprint } from "../../context/BlueprintContext"

const MONO    = "'JetBrains Mono',monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const ACCENT  = "#B04A38"

const CATEGORIES: SandboxCategory[] = [
  "All",
  "B2B Portals",
  "E-commerce & Shopify",
  "Landing Pages",
  "UI Components",
]

const STYLE_ID = "nm-sandbox-sidebar-styles"
const CSS = `
.nm-sb-cat {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 9px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.70);
  text-align: left; transition: all 0.18s ease;
  position: relative;
}
.nm-sb-cat:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.18);
  color: #fff;
}
.nm-sb-cat.active {
  background: rgba(176,74,56,0.16);
  border-color: rgba(176,74,56,0.50);
  color: #fff;
}
.nm-sb-cat.active::before {
  content: '';
  position: absolute; left: -1px; top: 20%; bottom: 20%;
  width: 2px; border-radius: 2px;
  background: ${ACCENT};
}
.nm-sb-type {
  display: flex; align-items: center; justify-content: center;
  padding: 7px 10px; flex: 1;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px; cursor: pointer;
  font-family: ${MONO}; font-size: 10px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  transition: all 0.18s ease;
}
.nm-sb-type:hover {
  color: rgba(255,255,255,0.88);
  border-color: rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.05);
}
.nm-sb-type.active {
  background: rgba(255,255,255,0.10);
  border-color: rgba(255,255,255,0.28);
  color: #fff;
}
.nm-blueprint-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 16px;
  background: rgba(176,74,56,0.12);
  border: 1px solid rgba(176,74,56,0.45);
  border-radius: 10px; cursor: pointer;
  text-decoration: none;
  transition: all 0.18s ease;
}
.nm-blueprint-badge:hover {
  background: rgba(176,74,56,0.22);
  border-color: rgba(176,74,56,0.65);
}
`

interface SidebarProps {
  activeCategory: SandboxCategory
  activeType: SandboxType | "all"
  onCategoryChange: (c: SandboxCategory) => void
  onTypeChange: (t: SandboxType | "all") => void
}

export default function Sidebar({ activeCategory, activeType, onCategoryChange, onTypeChange }: SidebarProps) {
  const { items } = useBlueprint()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  if (isMobile) {
    return (
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Category pills horizontal scroll */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`nm-sb-cat${activeCategory === c ? " active" : ""}`}
              onClick={() => onCategoryChange(c)}
              style={{ whiteSpace: "nowrap", flex: "0 0 auto" }}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Type toggle */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 3,
        }}>
          {(["all", "full-site", "component"] as const).map(t => (
            <button key={t} className={`nm-sb-type${activeType === t ? " active" : ""}`} onClick={() => onTypeChange(t)}>
              {t === "all" ? "Tutti" : t === "full-site" ? "Full Site" : "Component"}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      position: "sticky", top: 96, alignSelf: "flex-start",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      {/* Blueprint badge */}
      <a href="/cabinet" className="nm-blueprint-badge" style={{ marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: "rgba(176,74,56,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: MONO, fontSize: 10, fontWeight: 700,
          color: "#D4695A", letterSpacing: 0,
        }}>
          {items.length}
        </div>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 12, fontWeight: 600, color: "#fff" }}>
            Blueprint
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.60)", letterSpacing: "0.06em" }}>
            {items.length === 0 ? "vuoto" : `${items.length} element${items.length > 1 ? "i" : "o"}`}
          </div>
        </div>
      </a>

      {/* Section label */}
      <div style={{
        fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
        padding: "0 14px", marginBottom: 4,
      }}>
        Categoria
      </div>

      {CATEGORIES.map(c => (
        <button
          key={c}
          className={`nm-sb-cat${activeCategory === c ? " active" : ""}`}
          onClick={() => onCategoryChange(c)}
        >
          {c}
        </button>
      ))}

      {/* Type filter */}
      <div style={{
        fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
        padding: "0 14px", marginTop: 16, marginBottom: 4,
      }}>
        Tipo
      </div>
      <div style={{
        display: "flex", flexDirection: "column",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, padding: 3, gap: 2,
      }}>
        {(["all", "full-site", "component"] as const).map(t => (
          <button key={t} className={`nm-sb-type${activeType === t ? " active" : ""}`} onClick={() => onTypeChange(t)}
            style={{ justifyContent: "flex-start", padding: "8px 12px" }}>
            {t === "all" ? "Tutti" : t === "full-site" ? "Full Site" : "Component"}
          </button>
        ))}
      </div>
    </aside>
  )
}
