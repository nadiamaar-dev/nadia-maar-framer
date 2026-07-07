import React, { useEffect, useState } from "react"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const COPPER  = "#B04A38"
const GREEN   = "#10B981"

const STYLE_ID = "nm-support-styles"
const CSS = `
.nm-sup-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}
@media (max-width: 768px) {
  .nm-sup-grid {
    grid-template-columns: 1fr;
  }
  .nm-sup-sidebar {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 0;
  }
}
.nm-sup-input {
  width: 100%; padding: 12px 16px;
  background: rgba(255,255,255,0.045);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 10px; outline: none;
  font-family: ${DISPLAY}; font-size: 14px;
  color: rgba(255,255,255,0.85);
  transition: border-color 0.18s, background 0.18s;
  box-sizing: border-box;
  resize: none;
}
.nm-sup-input::placeholder { color: rgba(255,255,255,0.22); }
.nm-sup-input:focus {
  border-color: rgba(176,74,56,0.50);
  background: rgba(255,255,255,0.07);
}
.nm-sup-prio-btn {
  flex: 1; padding: 10px 8px; cursor: pointer;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 8px;
  font-family: ${MONO}; font-size: 10px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.32);
  transition: all 0.15s ease; text-align: center;
}
.nm-sup-prio-btn:hover:not(.active) {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.55);
}
.nm-sup-submit {
  width: 100%; padding: 15px 24px;
  background: linear-gradient(135deg, rgba(176,74,56,0.90), rgba(140,53,37,0.80));
  border: 1px solid rgba(176,74,56,0.60);
  border-radius: 10px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 15px; font-weight: 700;
  color: #fff; letter-spacing: "-0.01em";
  transition: all 0.22s ease;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.nm-sup-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(196,74,56,0.95), rgba(160,63,42,0.90));
  box-shadow: 0 8px 28px rgba(176,74,56,0.35);
  transform: translateY(-1px);
}
.nm-sup-submit:disabled {
  opacity: 0.55; cursor: default;
}
`

/* ─── Types ──────────────────────────────────────────────────── */
export type Priority = "low" | "medium" | "high" | "critical"

export interface SupportTicket {
  subject: string
  message: string
  priority: Priority
}

export interface SupportFormProps {
  onSubmit?: (data: SupportTicket) => Promise<void>
  adminEmail?: string
}

/* ─── Helpers ────────────────────────────────────────────────── */
const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  low:      { label: "Bassa",    color: "rgba(255,255,255,0.45)", bg: "rgba(255,255,255,0.07)",  border: "rgba(255,255,255,0.14)" },
  medium:   { label: "Media",    color: "rgba(200,185,110,0.95)", bg: "rgba(200,185,110,0.10)",  border: "rgba(200,185,110,0.30)" },
  high:     { label: "Alta",     color: COPPER,                   bg: "rgba(176,74,56,0.12)",    border: "rgba(176,74,56,0.36)" },
  critical: { label: "Critica",  color: "#E05050",                bg: "rgba(224,80,80,0.12)",    border: "rgba(224,80,80,0.40)" },
}

const PRIORITY_ORDER: Priority[] = ["low", "medium", "high", "critical"]

/* ─── Component ──────────────────────────────────────────────── */
export default function SupportForm({ onSubmit, adminEmail = "marchenkonadiia84@gmail.com" }: SupportFormProps) {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
  }, [])

  const [subject,  setSubject]  = useState("")
  const [message,  setMessage]  = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState("")

  const canSubmit = subject.trim().length > 2 && message.trim().length > 10 && !sending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSending(true); setError("")

    const ticket: SupportTicket = { subject: subject.trim(), message: message.trim(), priority }

    try {
      if (onSubmit) {
        await onSubmit(ticket)
      } else {
        const priorityLabel = PRIORITY_CONFIG[priority].label
        const mailSubject = encodeURIComponent(`[${priorityLabel.toUpperCase()}] Supporto Cabinet: ${ticket.subject}`)
        const mailBody    = encodeURIComponent(
          `Priorità: ${priorityLabel}\nOggetto: ${ticket.subject}\n\n${ticket.message}`
        )
        window.location.href = `mailto:${adminEmail}?subject=${mailSubject}&body=${mailBody}`
      }
      setSent(true)
      setSubject(""); setMessage(""); setPriority("medium")
    } catch {
      setError("Invio fallito. Riprova o scrivi direttamente a " + adminEmail)
    } finally {
      setSending(false)
    }
  }

  return (
    <section>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: COPPER, marginBottom: 8 }}>
          Comunicazione & Supporto
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          Segnalazione & Urgenze
        </h2>
        <p style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "8px 0 0" }}>
          Per bug critici o richieste urgenti. Il team risponde entro 4 ore nei giorni lavorativi.
        </p>
      </div>

      <div className="nm-sup-grid">

        {/* Form card */}
        <div style={{
          background: "rgba(30,37,48,0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16, padding: "28px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Top accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${COPPER}80, transparent)`,
          }} />

          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(16,185,129,0.12)",
                border: `1px solid rgba(16,185,129,0.30)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                Messaggio inviato
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.40)" }}>
                Il team ti risponderà entro 4 ore lavorative.
              </div>
              <button
                onClick={() => setSent(false)}
                style={{
                  marginTop: 24, padding: "9px 20px",
                  background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, cursor: "pointer",
                  fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.45)",
                }}
              >
                Nuova segnalazione
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Priority selector */}
              <div>
                <label style={{ display: "block", fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
                  Priorità
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {PRIORITY_ORDER.map(p => {
                    const cfg = PRIORITY_CONFIG[p]
                    const isActive = priority === p
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`nm-sup-prio-btn${isActive ? " active" : ""}`}
                        onClick={() => setPriority(p)}
                        style={isActive ? {
                          background: cfg.bg,
                          borderColor: cfg.border,
                          color: cfg.color,
                        } : {}}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
                {priority === "critical" && (
                  <div style={{
                    marginTop: 10, padding: "9px 14px",
                    background: "rgba(224,80,80,0.08)", border: "1px solid rgba(224,80,80,0.22)",
                    borderRadius: 8,
                    fontFamily: DISPLAY, fontSize: 12, color: "rgba(224,80,80,0.80)",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                    Le segnalazioni critiche vengono inoltrate immediatamente al team tecnico.
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: "block", fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
                  Oggetto
                </label>
                <input
                  className="nm-sup-input"
                  type="text"
                  placeholder="es. Errore 404 sulla pagina contatti"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: "block", fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
                  Messaggio
                </label>
                <textarea
                  className="nm-sup-input"
                  placeholder="Descrivi il problema con il maggior dettaglio possibile. Includi il browser, i passaggi per riprodurlo e lo screenshot se disponibile."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  required
                />
                <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.20)", textAlign: "right", marginTop: 5 }}>
                  {message.length}/2000
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: "10px 14px", background: "rgba(224,80,80,0.08)",
                  border: "1px solid rgba(224,80,80,0.22)", borderRadius: 8,
                  fontFamily: DISPLAY, fontSize: 12, color: "rgba(224,80,80,0.80)",
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button className="nm-sup-submit" type="submit" disabled={!canSubmit}>
                {sending ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Invio in corso…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
                    </svg>
                    Invia Segnalazione
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Info sidebar */}
        <div className="nm-sup-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* SLA card */}
          <div style={{
            background: "rgba(30,37,48,0.50)", backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "20px",
          }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 14 }}>
              Tempi di risposta
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PRIORITY_ORDER.map(p => {
                const cfg = PRIORITY_CONFIG[p]
                const times: Record<Priority, string> = { critical: "< 1 ora", high: "< 4 ore", medium: "< 24 ore", low: "< 48 ore" }
                return (
                  <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 600, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.40)" }}>
                      {times[p]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Direct contact */}
          <div style={{
            background: "rgba(30,37,48,0.50)", backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "20px",
          }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>
              Contatto diretto
            </div>
            <p style={{ fontFamily: DISPLAY, fontSize: 12, color: "rgba(255,255,255,0.42)", margin: "0 0 12px", lineHeight: 1.6 }}>
              Per questioni urgenti puoi scrivere direttamente all'amministratore.
            </p>
            <a
              href={`mailto:${adminEmail}`}
              style={{
                display: "block", padding: "10px 14px",
                background: "rgba(176,74,56,0.10)", border: "1px solid rgba(176,74,56,0.25)",
                borderRadius: 8, textDecoration: "none",
                fontFamily: MONO, fontSize: 11, fontWeight: 600, color: "#D4695A",
                textAlign: "center", transition: "all 0.15s",
              }}
            >
              {adminEmail}
            </a>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </section>
  )
}
