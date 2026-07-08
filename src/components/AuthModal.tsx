import React, { useState, useEffect, useRef } from "react"
import { supabase } from "../lib/supabase"
import { useBlueprint } from "../context/BlueprintContext"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const ACCENT  = "#B04A38"

const STYLE_ID = "nm-auth-modal-styles"
const CSS = `
@keyframes nm-modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
.nm-auth-card {
  animation: nm-modal-in 0.28s cubic-bezier(0.16,1,0.3,1) forwards;
  position: relative;
  width: 100%; max-width: 440px;
  background: rgba(22,27,34,0.88);
  backdrop-filter: blur(40px) saturate(140%);
  -webkit-backdrop-filter: blur(40px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05) inset;
}
.nm-auth-input {
  width: 100%; padding: 13px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 10px;
  font-family: ${DISPLAY}; font-size: 14px;
  color: #fff;
  outline: none;
  transition: border-color 0.18s, background 0.18s;
  box-sizing: border-box;
}
.nm-auth-input::placeholder { color: rgba(255,255,255,0.32); }
.nm-auth-input:focus {
  border-color: rgba(176,74,56,0.60);
  background: rgba(255,255,255,0.07);
}
.nm-auth-tab {
  flex: 1; padding: 9px 0;
  background: transparent; border: none;
  border-radius: 8px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.45);
  transition: all 0.18s ease;
}
.nm-auth-tab.active {
  background: rgba(176,74,56,0.18);
  border: 1px solid rgba(176,74,56,0.45);
  color: #fff;
}
.nm-auth-tab:not(.active):hover { color: rgba(255,255,255,0.80); }
.nm-auth-submit {
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, rgba(176,74,56,0.90), rgba(140,53,37,0.80));
  border: 1px solid rgba(176,74,56,0.60);
  border-radius: 10px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 14px; font-weight: 700;
  color: #fff; letter-spacing: 0.01em;
  transition: all 0.20s ease;
  position: relative; overflow: hidden;
}
.nm-auth-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(200,90,66,0.95), rgba(160,62,42,0.90));
  box-shadow: 0 6px 24px rgba(176,74,56,0.40);
  transform: translateY(-1px);
}
.nm-auth-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.nm-auth-close {
  position: absolute; top: 16px; right: 16px;
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.55);
  transition: all 0.16s;
}
.nm-auth-close:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}
`

type Mode = "login" | "register"

export default function AuthModal() {
  const { closeAuthModal } = useBlueprint()
  const [mode, setMode]     = useState<Mode>("login")
  const [email, setEmail]   = useState("")
  const [password, setPass] = useState("")
  const [fullName, setFullName] = useState("")
  const [company,  setCompany]  = useState("")
  const [error, setError]   = useState("")
  const [busy, setBusy]     = useState("")   // "loading" | "success" | ""
  const backdropRef         = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style")
      el.id = STYLE_ID; el.textContent = CSS
      document.head.appendChild(el)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeAuthModal() }
    document.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey) }
  }, [closeAuthModal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setBusy("loading")
    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setBusy("") }
      else setBusy("success")
    } else {
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name:    fullName.trim(),
            contact_name: fullName.trim(),
            company_name: company.trim(),
          },
        },
      })
      if (err) { setError(err.message); setBusy("") }
      else setBusy("success")
    }
  }

  const switchMode = (m: Mode) => { setMode(m); setError(""); setBusy(""); setFullName(""); setCompany("") }

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) closeAuthModal() }}
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(8,10,14,0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div className="nm-auth-card">

        {/* Close */}
        <button className="nm-auth-close" onClick={closeAuthModal} aria-label="Chiudi">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Logo + headline */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(176,74,56,0.16)",
            border: "1px solid rgba(176,74,56,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
          }}>
            <svg viewBox="0 2 28 22" width="26" height="20" fill="none" strokeLinecap="square" strokeLinejoin="miter">
              <defs>
                <linearGradient id="nm-modal-grad" x1="2" y1="12" x2="27" y2="12" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.90)" />
                  <stop offset="55%"  stopColor="rgba(255,255,255,0.90)" />
                  <stop offset="100%" stopColor="#B04A38" />
                </linearGradient>
              </defs>
              <path d="M 2,22 L 2,2 L 13,22 L 13,2 L 19.5,12 L 26,2 L 26,22"
                stroke="url(#nm-modal-grad)" strokeWidth="1.85"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: DISPLAY, fontSize: 22, fontWeight: 800,
            color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em",
          }}>
            {mode === "login" ? "Bentornato." : "Crea la tua Architettura."}
          </h2>
          <p style={{
            fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.6,
            color: "rgba(255,255,255,0.55)", margin: 0,
          }}>
            {mode === "login"
              ? "Accedi per salvare il tuo Blueprint e gestire i progetti."
              : "Registrati gratuitamente per salvare componenti nel Blueprint e collaborare con noi."
            }
          </p>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: "flex", gap: 6, padding: 4,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 12, marginBottom: 24,
        }}>
          <button className={`nm-auth-tab${mode === "login" ? " active" : ""}`} onClick={() => switchMode("login")}>
            Accedi
          </button>
          <button className={`nm-auth-tab${mode === "register" ? " active" : ""}`} onClick={() => switchMode("register")}>
            Registrati
          </button>
        </div>

        {/* Success state */}
        {busy === "success" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(16,185,129,0.16)",
              border: "1px solid rgba(16,185,129,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
              {mode === "register" ? "Controlla la tua email!" : "Accesso riuscito!"}
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.50)" }}>
              {mode === "register"
                ? "Abbiamo inviato un link di conferma al tuo indirizzo email."
                : "Benvenuto nel tuo Blueprint."
              }
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <>
                <input
                  className="nm-auth-input"
                  type="text" required autoComplete="name"
                  placeholder="Nome e cognome"
                  value={fullName} onChange={e => setFullName(e.target.value)}
                />
                <input
                  className="nm-auth-input"
                  type="text" autoComplete="organization"
                  placeholder="Azienda (facoltativo)"
                  value={company} onChange={e => setCompany(e.target.value)}
                />
              </>
            )}
            <input
              className="nm-auth-input"
              type="email" required autoComplete="email"
              placeholder="Email aziendale"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input
              className="nm-auth-input"
              type="password" required autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Password"
              value={password} onChange={e => setPass(e.target.value)}
            />

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(176,74,56,0.12)",
                border: "1px solid rgba(176,74,56,0.35)",
                borderRadius: 8,
                fontFamily: DISPLAY, fontSize: 12.5,
                color: "#E07060",
              }}>
                {error}
              </div>
            )}

            <button className="nm-auth-submit" type="submit" disabled={busy === "loading"}>
              {busy === "loading"
                ? "..."
                : mode === "login" ? "Accedi al Blueprint" : "Crea Account Gratuito"
              }
            </button>

            <div style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em",
              textAlign: "center", color: "rgba(255,255,255,0.28)",
            }}>
              {mode === "register"
                ? "Registrandoti accetti i nostri termini di servizio."
                : "Nessun account? Clicca su Registrati."
              }
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
