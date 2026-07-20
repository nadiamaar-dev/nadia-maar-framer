import React, { useEffect } from "react"
import { SandboxCategory, SandboxType } from "../../data/sandboxData"
import { useBlueprint } from "../../context/BlueprintContext"

const MONO    = "'JetBrains Mono',monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const ACCENT  = "#B83240"

const CATEGORIES: SandboxCategory[] = [
  "All",
  "B2B Portals",
  "E-commerce & Shopify",
  "Landing Pages",
  "UI Components",
]

const CAT_SHORT: Record<string, string> = {
  "All":                  "Tutti",
  "B2B Portals":          "B2B",
  "E-commerce & Shopify": "E-com",
  "Landing Pages":        "Landing",
  "UI Components":        "UI",
}

const TYPE_OPTIONS = [
  { value: "all",       label: "Tutti"    },
  { value: "full-site", label: "Full Site"},
  { value: "component", label: "Comp."    },
] as const

const STYLE_ID = "nm-sidebar-styles"
const CSS = `
/* ── category button ── */
.nm-sb-cat {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 9px 14px;
  background: transparent; border: 1px solid transparent;
  border-radius: 8px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.63);
  text-align: left; transition: all 0.18s ease; position: relative;
}
.nm-sb-cat:hover {
  background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.10); color: rgba(255,255,255,0.88);
}
.nm-sb-cat.active {
  background: linear-gradient(90deg, rgba(184,50,64,0.22), rgba(184,50,64,0.10));
  border-color: rgba(184,50,64,0.35); color: #fff;
}
.nm-sb-cat.active::before {
  content: ''; position: absolute; left: -1px; top: 20%; bottom: 20%;
  width: 2px; border-radius: 2px; background: ${ACCENT};
}

/* ── type button (desktop) ── */
.nm-sb-type {
  display: flex; align-items: center; justify-content: flex-start;
  padding: 8px 12px; background: transparent; border: 1px solid transparent;
  border-radius: 6px; cursor: pointer;
  font-family: ${MONO}; font-size: 10px; font-weight: 500;
  letter-spacing: 0.10em; text-transform: uppercase;
  color: rgba(255,255,255,0.53); transition: all 0.18s ease;
}
.nm-sb-type:hover {
  color: rgba(255,255,255,0.80); border-color: rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
}
.nm-sb-type.active {
  background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.18); color: #fff;
}

/* ── blueprint badge — [→] mono glass style ── */
.nm-blueprint-badge {
  display: flex; align-items: stretch; overflow: hidden;
  border-radius: 10px; cursor: pointer; text-decoration: none;
  border: 1px solid rgba(184,50,64,0.50);
  background: linear-gradient(90deg, rgba(184,50,64,0.34) 0%, rgba(184,50,64,0.18) 100%);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 0 10px rgba(184,50,64,0.14), inset 0 1px 0 rgba(255,255,255,0.10);
  transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
}
.nm-blueprint-badge:hover {
  border-color: rgba(184,50,64,0.80);
  background: linear-gradient(90deg, rgba(184,50,64,0.50) 0%, rgba(184,50,64,0.30) 100%);
  box-shadow: 0 0 20px rgba(184,50,64,0.28), inset 0 1px 0 rgba(255,255,255,0.14);
}
.nm-blueprint-tag {
  padding: 12px 12px;
  border-right: 1px solid rgba(184,50,64,0.38);
  display: flex; align-items: center;
  font-family: ${MONO}; font-size: 9px; letter-spacing: 0.20em;
  color: rgba(255,255,255,0.70); flex-shrink: 0;
}
.nm-blueprint-body {
  flex: 1; padding: 10px 14px;
  display: flex; flex-direction: column; justify-content: center; gap: 2px;
}

/* ── responsive show/hide ── */
.nm-sidebar-mobile  { display: flex; }
.nm-sidebar-desktop { display: none; }

@media (min-width: 768px) {
  .nm-sidebar-mobile  { display: none; }
  .nm-sidebar-desktop { display: flex;  }
}
`

interface Props {
  activeCategory: SandboxCategory
  activeType: SandboxType | "all"
  onCategoryChange: (c: SandboxCategory) => void
  onTypeChange: (t: SandboxType | "all") => void
}

export default function Sidebar({ activeCategory, activeType, onCategoryChange, onTypeChange }: Props) {
  const { items } = useBlueprint()

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  const typeIndex = TYPE_OPTIONS.findIndex(t => t.value === activeType)

  /* ── Blueprint badge — [→] mono glass style ── */
  const BlueprintBadge = (
    <a href="/cabinet" className="nm-blueprint-badge">
      <span className="nm-blueprint-tag">
        [{items.length}]
      </span>
      <span className="nm-blueprint-body">
        <span style={{ fontFamily: DISPLAY, fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Blueprint</span>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.63)" }}>
          {items.length === 0 ? "vuoto · aggiungi" : `${items.length} element${items.length > 1 ? "i" : "o"}`}
        </span>
      </span>
      <span style={{ padding: "0 14px", display: "flex", alignItems: "center", color: "rgba(255,255,255,0.58)", flexShrink: 0 }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </a>
  )

  return (
    <>
      {/* ════════════════════════════════════════
          MOBILE  — unified segmented control
          Shown below 768px via CSS
      ════════════════════════════════════════ */}
      <div className="nm-sidebar-mobile" style={{ flexDirection: "column", gap: 10, paddingBottom: 20, width: "100%" }}>

        {BlueprintBadge}

        {/* Glass container wrapping both filter rows */}
        <div style={{
          width: "100%",
          background: "rgba(13,18,30,0.88)",
          backdropFilter: "blur(24px) saturate(0.15)",
          WebkitBackdropFilter: "blur(24px) saturate(0.15)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 4,
          boxSizing: "border-box",
        }}>

          {/* — Row 1: Categories (equal-width, full stretch) — */}
          <div style={{ display: "flex", gap: 2 }}>
            {CATEGORIES.map(c => {
              const active = activeCategory === c
              return (
                <button key={c} onClick={() => onCategoryChange(c)} style={{
                  flex: 1, minWidth: 0, padding: "8px 4px",
                  borderRadius: 11,
                  border: "1px solid " + (active ? "rgba(184,50,64,0.55)" : "transparent"),
                  background: active ? "rgba(184,50,64,0.60)" : "transparent",
                  fontFamily: DISPLAY, fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#fff" : "rgba(255,255,255,0.52)",
                  textAlign: "center" as const,
                  cursor: "pointer", transition: "all 0.18s ease",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                }}>
                  {CAT_SHORT[c] ?? c}
                </button>
              )
            })}
          </div>

          {/* — Divider — */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "2px 4px" }} />

          {/* — Row 2: Type with sliding indicator — */}
          <div style={{ position: "relative", display: "flex" }}>
            {/* Sliding copper pill */}
            <div aria-hidden style={{
              position: "absolute",
              top: 2, bottom: 2, left: 2,
              width: "calc((100% - 4px) / 3)",
              background: "rgba(184,50,64,0.61)",
              border: "1px solid rgba(184,50,64,0.52)",
              borderRadius: 10,
              transform: `translateX(calc(${typeIndex} * 100%))`,
              transition: "transform 0.22s cubic-bezier(0.16,1,0.3,1)",
              pointerEvents: "none",
            }} />
            {TYPE_OPTIONS.map(t => (
              <button key={t.value} onClick={() => onTypeChange(t.value)} style={{
                flex: 1, padding: "9px 0",
                background: "transparent", border: "none",
                borderRadius: 10, cursor: "pointer",
                fontFamily: MONO, fontSize: 10, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
                color: activeType === t.value ? "#fff" : "rgba(255,255,255,0.40)",
                transition: "color 0.18s ease",
                position: "relative", zIndex: 1,
              }}>
                {t.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════
          DESKTOP — sticky vertical sidebar
          Shown at 768px+ via CSS
      ════════════════════════════════════════ */}
      <aside className="nm-sidebar-desktop" style={{
        width: 220, flexShrink: 0,
        position: "sticky", top: 96, alignSelf: "flex-start",
        flexDirection: "column", gap: 6,
      }}>
        {/* Blueprint badge */}
        <div style={{ marginBottom: 16 }}>{BlueprintBadge}</div>

        {/* Category label */}
        <div style={{
          fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
          padding: "0 14px", marginBottom: 4,
        }}>
          Categoria
        </div>

        {CATEGORIES.map(c => (
          <button key={c}
            className={`nm-sb-cat${activeCategory === c ? " active" : ""}`}
            onClick={() => onCategoryChange(c)}>
            {c}
          </button>
        ))}

        {/* Type label */}
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
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 8, padding: 3, gap: 2,
        }}>
          {TYPE_OPTIONS.map(t => (
            <button key={t.value}
              className={`nm-sb-type${activeType === t.value ? " active" : ""}`}
              onClick={() => onTypeChange(t.value)}>
              {t.value === "all" ? "Tutti" : t.value === "full-site" ? "Full Site" : "Component"}
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}
