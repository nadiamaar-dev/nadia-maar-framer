import React, { useEffect, useState } from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Background from "./components/Background"
import FloatingContact from "./components/FloatingContact"
import { useBlueprint } from "./context/BlueprintContext"
import { SandboxItem } from "./data/sandboxData"
import ProjectProgress from "./components/cabinet/ProjectProgress"
import InvoiceTable    from "./components/cabinet/InvoiceTable"
import ReportCenter    from "./components/cabinet/ReportCenter"
import SupportForm     from "./components/cabinet/SupportForm"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const ACCENT  = "#B04A38"

type Tab = "blueprint" | "progress" | "invoices" | "reports" | "support"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "blueprint",
    label: "Blueprint",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  },
  {
    id: "progress",
    label: "Avanzamento",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  },
  {
    id: "invoices",
    label: "Fatture",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  },
  {
    id: "reports",
    label: "Report",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  {
    id: "support",
    label: "Supporto",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
]

const STYLE_ID = "nm-cabinet-styles"
const CSS = `
.nm-cab-tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 9px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.38);
  transition: all 0.18s ease; white-space: nowrap;
}
.nm-cab-tab:hover:not(.active) {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.60);
}
.nm-cab-tab.active {
  background: rgba(176,74,56,0.14);
  border-color: rgba(176,74,56,0.38);
  color: #D4695A;
}
@media (max-width: 640px) {
  .nm-cab-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .nm-cab-tabs::-webkit-scrollbar { display: none; }
}

.nm-cab-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 1100px) { .nm-cab-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .nm-cab-grid { grid-template-columns: 1fr; } }
.nm-cab-item {
  position: relative; overflow: hidden;
  background: rgba(30,37,48,0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 14px; padding: 22px;
  display: flex; flex-direction: column; gap: 12px;
  transition: border-color 0.2s;
}
.nm-cab-item:hover { border-color: rgba(255,255,255,0.16); }
.nm-cab-remove {
  background: transparent;
  border: 1px solid rgba(176,74,56,0.25);
  border-radius: 7px; padding: 7px 13px;
  font-family: ${MONO}; font-size: 10px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(176,74,56,0.65); cursor: pointer;
  transition: all 0.18s ease;
  align-self: flex-start;
}
.nm-cab-remove:hover {
  background: rgba(176,74,56,0.12);
  color: #D4695A;
  border-color: rgba(176,74,56,0.45);
}
.nm-cab-tech {
  display: inline-flex; align-items: center;
  padding: 2px 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  font-family: ${MONO}; font-size: 10px;
  color: rgba(255,255,255,0.42);
}
.nm-send-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, rgba(176,74,56,0.22), rgba(176,74,56,0.10));
  border: 1px solid rgba(176,74,56,0.40);
  border-radius: 10px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 15px; font-weight: 700;
  color: #D4695A; text-decoration: none;
  transition: all 0.22s ease;
}
.nm-send-btn:hover {
  background: linear-gradient(135deg, rgba(176,74,56,0.36), rgba(176,74,56,0.18));
  border-color: rgba(176,74,56,0.65);
  color: #E08070;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(176,74,56,0.22);
}
`

function BlueprintItem({ item }: { item: SandboxItem }) {
  const { removeFromBlueprint } = useBlueprint()
  return (
    <div className="nm-cab-item">
      {/* Accent bottom line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${item.accent}55, transparent)`,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{
          fontFamily: MONO, fontSize: 9, letterSpacing: "0.20em", textTransform: "uppercase",
          color: item.accent, opacity: 0.85,
        }}>
          {item.category}
        </span>
        <span style={{
          fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.28)",
          padding: "2px 7px", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 4,
        }}>
          {item.type === "full-site" ? "Full Site" : "Component"}
        </span>
      </div>

      <h3 style={{
        fontFamily: DISPLAY, fontSize: 16, fontWeight: 700,
        color: "#fff", margin: 0, letterSpacing: "-0.01em",
      }}>
        {item.title}
      </h3>

      <p style={{
        fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6,
        color: "rgba(255,255,255,0.45)", margin: 0,
      }}>
        {item.description}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {item.tech.map(t => <span key={t} className="nm-cab-tech">{t}</span>)}
      </div>

      <button className="nm-cab-remove" onClick={() => removeFromBlueprint(item.id)}>
        − Rimuovi
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      textAlign: "center", padding: "80px 20px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: "rgba(176,74,56,0.10)",
        border: "1px solid rgba(176,74,56,0.20)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(176,74,56,0.65)" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.70)", marginBottom: 8 }}>
          Blueprint vuoto
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.35)", maxWidth: 320 }}>
          Aggiungi soluzioni dalla libreria Digital Foundry per iniziare a costruire il tuo progetto.
        </div>
      </div>
      <a href="/foundry" style={{
        fontFamily: DISPLAY, fontSize: 13, fontWeight: 600,
        color: ACCENT, textDecoration: "none",
        borderBottom: `1px solid ${ACCENT}55`, paddingBottom: 2,
      }}>
        Vai al Foundry →
      </a>
    </div>
  )
}

export default function Cabinet() {
  const { items, clearBlueprint } = useBlueprint()
  const [activeTab, setActiveTab] = useState<Tab>("blueprint")

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  const mailBody = encodeURIComponent(
    `Ciao Nadia,\n\nHo selezionato le seguenti soluzioni per il mio progetto:\n\n${items.map(i => `• ${i.title} (${i.category})`).join("\n")}\n\nVorrei discutere i dettagli.\n\nGrazie`
  )
  const mailSubject = encodeURIComponent(`Blueprint — ${items.length} soluzioni selezionate`)

  return (
    <div style={{ minHeight: "100vh", background: "#161B22", position: "relative" }}>
      <Background />
      <Header />
      <FloatingContact />

      <main style={{ position: "relative", zIndex: 2, paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>

          {/* Page header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase",
              color: ACCENT, marginBottom: 12,
            }}>
              Cabinet Cliente
            </div>
            <h1 style={{
              fontFamily: DISPLAY, fontSize: "clamp(26px, 3.8vw, 44px)", fontWeight: 800,
              color: "#fff", margin: 0, lineHeight: 1.12, letterSpacing: "-0.03em",
            }}>
              Il tuo spazio personale
            </h1>
            <p style={{
              fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.38)",
              margin: "10px 0 0",
            }}>
              Monitora l'avanzamento del progetto, gestisci i documenti e comunica con il team.
            </p>
          </div>

          {/* Tab bar */}
          <div className="nm-cab-tabs" style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`nm-cab-tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Blueprint */}
          {activeTab === "blueprint" && (
            <>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", marginBottom: 8 }}>
                      Architettura selezionata
                    </div>
                    <p style={{
                      fontFamily: DISPLAY, fontSize: 14, color: "rgba(255,255,255,0.40)", margin: 0,
                    }}>
                      {items.length === 0
                        ? "Nessuna soluzione aggiunta ancora."
                        : `${items.length} soluzione${items.length > 1 ? "i" : "e"} nel blueprint.`
                      }
                    </p>
                  </div>
                  {items.length > 0 && (
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button
                        onClick={clearBlueprint}
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 8, padding: "10px 18px",
                          fontFamily: DISPLAY, fontSize: 13, fontWeight: 600,
                          color: "rgba(255,255,255,0.45)", cursor: "pointer",
                        }}
                      >
                        Svuota tutto
                      </button>
                      <a
                        href={`mailto:marchenkonadiia84@gmail.com?subject=${mailSubject}&body=${mailBody}`}
                        className="nm-send-btn"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
                        </svg>
                        Invia Blueprint
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {items.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="nm-cab-grid">
                    {items.map(item => <BlueprintItem key={item.id} item={item} />)}
                  </div>

                  <div style={{
                    marginTop: 48,
                    background: "rgba(30,37,48,0.50)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14, padding: "28px 32px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: 24,
                  }}>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>
                        Pronto per il preventivo
                      </div>
                      <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, color: "#fff" }}>
                        Invia il Blueprint a Nadia
                      </div>
                      <div style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.40)", marginTop: 4 }}>
                        Riceverai un'analisi personalizzata entro 24 ore.
                      </div>
                    </div>
                    <a
                      href={`mailto:marchenkonadiia84@gmail.com?subject=${mailSubject}&body=${mailBody}`}
                      className="nm-send-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
                      </svg>
                      Invia Blueprint
                    </a>
                  </div>
                </>
              )}
            </>
          )}

          {/* Tab: Avanzamento Progetto */}
          {activeTab === "progress" && <ProjectProgress />}

          {/* Tab: Finanze & Fatturazione */}
          {activeTab === "invoices" && <InvoiceTable />}

          {/* Tab: Centro Report */}
          {activeTab === "reports" && <ReportCenter />}

          {/* Tab: Comunicazione / Supporto */}
          {activeTab === "support" && <SupportForm />}

        </div>
      </main>

      <div style={{ position: "relative", zIndex: 2 }}>
        <Footer />
      </div>
    </div>
  )
}
