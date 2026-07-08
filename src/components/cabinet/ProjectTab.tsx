import React, { useEffect, useState, useRef } from "react"
import {
  fetchClientProject, createProject,
  type ClientProject, type ProjectStatus,
} from "../../lib/adminApi"
import { supabase, SUPABASE_READY } from "../../lib/supabase"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const COPPER  = "#B04A38"
const GREEN   = "#10B981"

/* ─── CSS ────────────────────────────────────────────────────── */
const STYLE_ID = "nm-project-tab-styles"
const CSS = `
.nm-proj-input {
  width: 100%; padding: 13px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 11px; outline: none;
  font-family: ${DISPLAY}; font-size: 14px;
  color: rgba(255,255,255,0.88);
  transition: border-color 0.18s, background 0.18s;
  box-sizing: border-box;
  resize: none;
}
.nm-proj-input::placeholder { color: rgba(255,255,255,0.22); }
.nm-proj-input:focus {
  border-color: rgba(176,74,56,0.55);
  background: rgba(255,255,255,0.07);
}
.nm-proj-cta {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 15px 32px;
  background: linear-gradient(135deg, rgba(176,74,56,0.88), rgba(140,53,37,0.78));
  border: 1px solid rgba(176,74,56,0.60);
  border-radius: 12px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 15px; font-weight: 700;
  color: #fff; letter-spacing: -0.01em;
  transition: all 0.22s ease;
}
.nm-proj-cta:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(196,74,56,0.95), rgba(160,63,42,0.90));
  box-shadow: 0 8px 28px rgba(176,74,56,0.35);
  transform: translateY(-1px);
}
.nm-proj-cta:disabled { opacity: 0.45; cursor: default; }
.nm-proj-cta-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 14px; font-weight: 600;
  color: rgba(255,255,255,0.45);
  transition: all 0.18s ease;
}
.nm-proj-cta-ghost:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.20);
  color: rgba(255,255,255,0.70);
}
@keyframes nm-fadeup {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.nm-proj-animate { animation: nm-fadeup 0.32s ease both; }
@keyframes nm-spin { to { transform: rotate(360deg); } }
`

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_CFG: Record<ProjectStatus, {
  label: string; color: string; bg: string; border: string; message: string
}> = {
  pending_approval: {
    label:   "In Approvazione",
    color:   "rgba(200,185,110,0.95)",
    bg:      "rgba(200,185,110,0.09)",
    border:  "rgba(200,185,110,0.28)",
    message: "Il tuo progetto è stato ricevuto. Il team lo esaminerà entro 24 ore lavorative.",
  },
  active: {
    label:   "Progetto Attivo",
    color:   GREEN,
    bg:      "rgba(16,185,129,0.09)",
    border:  "rgba(16,185,129,0.28)",
    message: "Il progetto è in corso. Monitora l'avanzamento nella sezione dedicata.",
  },
  paused: {
    label:   "In Pausa",
    color:   "rgba(255,255,255,0.42)",
    bg:      "rgba(255,255,255,0.05)",
    border:  "rgba(255,255,255,0.12)",
    message: "Il progetto è temporaneamente sospeso. Contatta il team per riprendere.",
  },
  completed: {
    label:   "Completato",
    color:   GREEN,
    bg:      "rgba(16,185,129,0.07)",
    border:  "rgba(16,185,129,0.22)",
    message: "Progetto consegnato con successo. Grazie per aver scelto Digital Cantiere.",
  },
}

/* ─── Props ──────────────────────────────────────────────────── */
export interface ProjectTabProps {
  clientId: string
}

/* ─── Modal ──────────────────────────────────────────────────── */
interface ModalProps {
  clientId: string
  onCreated: (project: ClientProject) => void
  onClose: () => void
}

function CreateModal({ clientId, onCreated, onClose }: ModalProps) {
  const [name,        setName]        = useState("")
  const [description, setDescription] = useState("")
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState("")
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true); setError("")
    try {
      const project = await createProject({ clientId, name, description })
      onCreated(project)
    } catch {
      setError("Errore durante la creazione. Riprova o contatta il supporto.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(6,8,14,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }} />

      {/* Modal card */}
      <div
        className="nm-proj-animate"
        style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 520,
          background: "rgba(22,27,36,0.96)",
          backdropFilter: "blur(48px) brightness(1.08) saturate(0.85)",
          WebkitBackdropFilter: "blur(48px) brightness(1.08) saturate(0.85)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.18), inset 1px 0 0 rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.60)",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top copper accent line */}
        <div style={{
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COPPER} 28%, rgba(180,90,60,0.80) 72%, transparent)`,
        }} />

        <div style={{ padding: "28px 32px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em",
                textTransform: "uppercase", color: COPPER, marginBottom: 8,
              }}>
                Nuovo Progetto
              </div>
              <h2 style={{
                fontFamily: DISPLAY, fontSize: 22, fontWeight: 800,
                color: "#fff", margin: 0, letterSpacing: "-0.02em",
              }}>
                Avvia il tuo progetto
              </h2>
              <p style={{
                fontFamily: DISPLAY, fontSize: 13,
                color: "rgba(255,255,255,0.38)", margin: "6px 0 0",
              }}>
                Riceverai conferma di approvazione entro 24 ore lavorative.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: 2, flexShrink: 0,
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8, cursor: "pointer",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Name */}
            <div>
              <label style={{
                display: "block", marginBottom: 8,
                fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
              }}>
                Nome del progetto *
              </label>
              <input
                ref={nameRef}
                className="nm-proj-input"
                type="text"
                placeholder="es. Sito Web Aziendale, App Mobile, Campagna ADV…"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{
                  fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
                }}>
                  Descrizione breve
                </label>
                <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.18)" }}>
                  {description.length}/500
                </span>
              </div>
              <textarea
                className="nm-proj-input"
                placeholder="Descrivi brevemente gli obiettivi, il settore e le aspettative del progetto…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
              />
            </div>

            {/* Info note */}
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
              <p style={{ fontFamily: DISPLAY, fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6 }}>
                Lo stato iniziale sarà <strong style={{ color: "rgba(200,185,110,0.85)" }}>In Approvazione</strong>.
                Il team esaminerà la tua richiesta e ti contatterà per i dettagli operativi.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(224,80,80,0.08)", border: "1px solid rgba(224,80,80,0.22)",
                borderRadius: 9, fontFamily: DISPLAY, fontSize: 12, color: "rgba(224,80,80,0.85)",
              }}>
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button type="submit" className="nm-proj-cta" disabled={!name.trim() || submitting} style={{ flex: 1 }}>
                {submitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ animation: "nm-spin 0.9s linear infinite" }}>
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Invio in corso…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
                    </svg>
                    Invia Richiesta
                  </>
                )}
              </button>
              <button type="button" className="nm-proj-cta-ghost" onClick={onClose}>
                Annulla
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ─── Project card (has project) ─────────────────────────────── */
function ProjectCard({ project, onNewProject }: { project: ClientProject; onNewProject: () => void }) {
  const cfg = STATUS_CFG[project.status]

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="nm-proj-animate" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Status banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        padding: "14px 20px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
      }}>
        <span style={{
          display: "flex", alignItems: "center", gap: 7,
          fontFamily: MONO, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.10em", textTransform: "uppercase",
          color: cfg.color,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: cfg.color, boxShadow: `0 0 7px ${cfg.color}`,
            flexShrink: 0,
            animation: project.status === "pending_approval" ? "nm-pulse-dot 1.6s ease-in-out infinite" : undefined,
          }} />
          {cfg.label}
        </span>
        <span style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
          {cfg.message}
        </span>
        <style>{`@keyframes nm-pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
      </div>

      {/* Main card */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "rgba(30,37,48,0.55)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 18,
      }}>
        {/* Top copper accent */}
        <div style={{
          height: 2,
          background: `linear-gradient(90deg, transparent, ${cfg.color}70, transparent)`,
        }} />

        <div style={{ padding: "28px 32px 32px" }}>

          {/* Label + date */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <span style={{
              fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
            }}>
              Il tuo progetto
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
              Avviato il {formatDate(project.createdAt)}
            </span>
          </div>

          {/* Project name */}
          <h2 style={{
            fontFamily: DISPLAY, fontSize: "clamp(22px, 3.5vw, 34px)",
            fontWeight: 800, color: "#fff", margin: "0 0 12px",
            letterSpacing: "-0.03em", lineHeight: 1.15,
          }}>
            {project.name}
          </h2>

          {/* Description */}
          {project.description && (
            <p style={{
              fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.7,
              color: "rgba(255,255,255,0.50)", margin: "0 0 24px",
            }}>
              {project.description}
            </p>
          )}

          {/* Admin note */}
          {project.adminNote && (
            <div style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              padding: "14px 18px", marginBottom: 24,
              background: "rgba(176,74,56,0.08)",
              border: "1px solid rgba(176,74,56,0.20)",
              borderRadius: 12,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COPPER} strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: COPPER, marginBottom: 4 }}>
                  Nota dal team
                </div>
                <p style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.60)", margin: 0, lineHeight: 1.6 }}>
                  {project.adminNote}
                </p>
              </div>
            </div>
          )}

          {/* Metadata row */}
          <div style={{
            display: "flex", gap: 16, flexWrap: "wrap",
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { label: "Stato",               value: cfg.label,                        color: cfg.color },
              { label: "Creato il",           value: formatDate(project.createdAt),    color: "rgba(255,255,255,0.55)" },
              { label: "Ultimo aggiornamento", value: formatDate(project.updatedAt),   color: "rgba(255,255,255,0.55)" },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: m.color }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contextual action — only show if completed */}
      {project.status === "completed" && (
        <button
          className="nm-proj-cta"
          onClick={onNewProject}
          style={{ alignSelf: "flex-start" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Avvia un nuovo progetto
        </button>
      )}
    </div>
  )
}

/* ─── Empty state (no project) ───────────────────────────────── */
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div
      className="nm-proj-animate"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center",
        padding: "64px 24px",
        background: "rgba(30,37,48,0.40)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px dashed rgba(255,255,255,0.10)",
        borderRadius: 20,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: "rgba(176,74,56,0.10)",
        border: "1px solid rgba(176,74,56,0.22)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COPPER} strokeWidth="1.5">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
      </div>

      <div style={{
        fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em",
        textTransform: "uppercase", color: COPPER, marginBottom: 12,
      }}>
        Nessun progetto attivo
      </div>

      <h3 style={{
        fontFamily: DISPLAY, fontSize: 22, fontWeight: 800,
        color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em",
      }}>
        Avvia il tuo primo progetto
      </h3>

      <p style={{
        fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.7,
        color: "rgba(255,255,255,0.38)", maxWidth: 420, margin: "0 0 32px",
      }}>
        Compila il modulo con il nome e una breve descrizione. Il team esaminerà
        la tua richiesta e ti contatterà entro 24 ore lavorative.
      </p>

      <button className="nm-proj-cta" onClick={onNew}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Crea nuovo progetto
      </button>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{
      background: "rgba(30,37,48,0.40)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18, padding: "32px",
    }}>
      <style>{`@keyframes nm-skel { 0%,100%{opacity:0.35} 50%{opacity:0.65} }`}</style>
      {[60, 80, 100, 65, 45].map((w, i) => (
        <div key={i} style={{
          height: i === 1 ? 32 : 12, width: `${w}%`,
          marginBottom: i < 4 ? 16 : 0,
          borderRadius: 6,
          background: "rgba(255,255,255,0.07)",
          animation: `nm-skel 1.5s ease-in-out ${i * 0.10}s infinite`,
        }} />
      ))}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
export default function ProjectTab({ clientId }: ProjectTabProps) {
  const [project,     setProject]     = useState<ClientProject | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState("")
  const [showModal,   setShowModal]   = useState(false)

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError("")
    fetchClientProject(clientId)
      .then(p  => { if (!cancelled) setProject(p) })
      .catch(() => { if (!cancelled) setError("Impossibile caricare il progetto.") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [clientId])

  /* Realtime: reflect admin approval / status changes without a reload.
     RLS scopes client_projects to the authenticated client's own rows. */
  useEffect(() => {
    if (!SUPABASE_READY) return
    const ch = supabase
      .channel(`client-project-${clientId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "client_projects" }, () => {
        fetchClientProject(clientId).then(setProject).catch(() => {})
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [clientId])

  function handleCreated(newProject: ClientProject) {
    setProject(newProject)
    setShowModal(false)
  }

  return (
    <section>
      {/* Section header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: COPPER, marginBottom: 8 }}>
          Progetto
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          Panoramica Progetto
        </h2>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 20, padding: "12px 16px",
          background: "rgba(224,80,80,0.08)", border: "1px solid rgba(224,80,80,0.22)",
          borderRadius: 10, fontFamily: DISPLAY, fontSize: 13, color: "rgba(224,80,80,0.80)",
        }}>
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Skeleton />
      ) : project ? (
        <ProjectCard
          project={project}
          onNewProject={() => setShowModal(true)}
        />
      ) : (
        <EmptyState onNew={() => setShowModal(true)} />
      )}

      {/* Modal */}
      {showModal && (
        <CreateModal
          clientId={clientId}
          onCreated={handleCreated}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  )
}
