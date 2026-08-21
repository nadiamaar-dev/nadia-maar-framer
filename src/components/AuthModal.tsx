import React, { useState, useEffect, useRef } from "react"
import { useT } from "../lib/i18n/t"
import { AUTH_STR } from "../lib/i18n/strings/auth"
import { supabase } from "../lib/supabase"
import { signInAsDemo } from "../lib/demoAccess"
import { useBlueprint } from "../context/BlueprintContext"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const ACCENT  = "#B83240"

/* Nel JSX, non in un useEffect: così la finestra si apre già stilizzata
   invece di comparire spoglia per un fotogramma. */
const CSS = `
@keyframes nm-modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
.nm-auth-card {
  animation: nm-modal-in 0.28s cubic-bezier(0.16,1,0.3,1) forwards;
  position: relative;
  width: 100%; max-width: 440px;
  background: rgba(13,18,30,0.94);
  backdrop-filter: blur(72px) brightness(0.92) saturate(1.10);
  -webkit-backdrop-filter: blur(72px) brightness(0.92) saturate(1.10);
  border: 1px solid rgba(255,255,255,0.20);
  border-radius: 20px;
  padding: 40px;
  overflow: hidden;
  box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.08), 0 40px 100px rgba(0,0,0,0.65);
}
.nm-auth-card::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #B83240 28%, #BE3648 72%, transparent);
}
.nm-auth-input {
  width: 100%; padding: 13px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 10px;
  font-family: ${DISPLAY}; font-size: 14px;
  color: #FFFFFF;
  outline: none;
  transition: border-color 0.18s, background 0.18s;
  box-sizing: border-box;
}
.nm-auth-input::placeholder { color: rgba(255,255,255,0.32); }
.nm-auth-input:focus {
  border-color: rgba(184,50,64,0.60);
  background: rgba(255,255,255,0.07);
}
.nm-auth-tab {
  flex: 1; padding: 9px 0;
  background: transparent; border: none;
  border-radius: 8px; cursor: pointer;
  font-family: ${DISPLAY}; font-size: 13px; font-weight: 600;
  color: #FFFFFF;
  transition: all 0.18s ease;
}
.nm-auth-tab.active {
  background: linear-gradient(90deg, rgba(184,50,64,0.34) 0%, rgba(184,50,64,0.20) 100%);
  border: 1px solid rgba(184,50,64,0.80);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #fff;
}
.nm-auth-tab:not(.active):hover { color: #FFFFFF; }
.nm-auth-submit {
  width: 100%; padding: 15px;
  background: linear-gradient(90deg, rgba(184,50,64,0.34) 0%, rgba(184,50,64,0.20) 100%);
  border: 1px solid rgba(184,50,64,0.80);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 0 12px rgba(184,50,64,0.20), inset 0 1px 0 rgba(255,255,255,0.12);
  border-radius: 10px; cursor: pointer;
  font-family: ${MONO}; font-size: 11px; font-weight: 600;
  color: #fff; letter-spacing: 0.14em; text-transform: uppercase;
  transition: all 0.20s ease;
  position: relative; overflow: hidden;
}
.nm-auth-submit:hover:not(:disabled) {
  background: linear-gradient(90deg, rgba(184,50,64,0.50) 0%, rgba(184,50,64,0.34) 100%);
  box-shadow: 0 0 24px rgba(184,50,64,0.35), inset 0 1px 0 rgba(255,255,255,0.18);
  transform: translateY(-1px);
}
.nm-auth-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.nm-auth-close {
  position: absolute; top: 16px; right: 16px;
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.20);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #FFFFFF;
  transition: all 0.16s;
}
.nm-auth-close:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}

/* body copy stays at 16px on phones — !important beats the inline size */
@media (max-width: 768px) {
  .hp-body { font-size: 16px !important; }
}
`

type Mode = "login" | "register"

export default function AuthModal() {
  const t = useT(AUTH_STR).auth
  const { closeAuthModal } = useBlueprint()
  const [mode, setMode]     = useState<Mode>("login")
  const [email, setEmail]   = useState("")
  const [password, setPass] = useState("")
  const [fullName, setFullName] = useState("")
  const [company,  setCompany]  = useState("")
  const [error, setError]   = useState("")
  const [busy, setBusy]     = useState("")   // "loading" | "success" | ""
  const [magicSent, setMagicSent] = useState(false)
  const backdropRef         = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

  const sendMagicLink = async () => {
    if (!email.trim()) { setError(t.magicLinkNoEmail); return }
    setError(""); setBusy("loading")
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/`, shouldCreateUser: false },
    })
    if (err) { setError(err.message); setBusy("") }
    else { setMagicSent(true); setBusy("success") }
  }

  const switchMode = (m: Mode) => { setMode(m); setError(""); setBusy(""); setMagicSent(false); setFullName(""); setCompany("") }

  /* L'accesso ospite porta DENTRO il cabinet, non su questa pagina: dopo il
     login si naviga lì, qualunque sia la pagina da cui si è aperta la
     finestra. La sola lettura la impone il database (migrazione 25). */
  const demoLogin = async () => {
    setError(""); setBusy("loading")
    const err = await signInAsDemo("auth_modal")
    if (err) { setError(err); setBusy("") }
    else window.location.assign("/cabinet")
  }

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
      <style>{CSS}</style>

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
            background: "rgba(184,50,64,0.16)",
            border: "1px solid rgba(184,50,64,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
          }}>
            <svg viewBox="0 2 28 22" width="26" height="20" fill="none" strokeLinecap="square" strokeLinejoin="miter">
              <defs>
                <linearGradient id="nm-modal-grad" x1="2" y1="12" x2="27" y2="12" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.90)" />
                  <stop offset="55%"  stopColor="rgba(255,255,255,0.90)" />
                  <stop offset="100%" stopColor="#B83240" />
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
            {mode === "login" ? t.titleLogin : t.titleRegister}
          </h2>
          <p className="hp-body" style={{
            fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.6,
            color: "#FFFFFF", margin: 0,
          }}>
            {mode === "login"
              ? t.leadLogin
              : t.leadRegister
            }
          </p>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: "flex", gap: 6, padding: 4,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.17)",
          borderRadius: 12, marginBottom: 24,
        }}>
          <button className={`nm-auth-tab${mode === "login" ? " active" : ""}`} onClick={() => switchMode("login")}>
            {t.tabLogin}
          </button>
          <button className={`nm-auth-tab${mode === "register" ? " active" : ""}`} onClick={() => switchMode("register")}>
            {t.tabRegister}
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
              {mode === "register" || magicSent ? t.doneCheckEmail : t.doneLogin}
            </div>
            <div className="hp-body" style={{ fontFamily: DISPLAY, fontSize: 13, color: "#FFFFFF" }}>
              {magicSent
                ? t.doneMagic
                : mode === "register"
                  ? t.doneRegister
                  : t.doneWelcome
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
                  placeholder={t.fullName}
                  value={fullName} onChange={e => setFullName(e.target.value)}
                />
                <input
                  className="nm-auth-input"
                  type="text" autoComplete="organization"
                  placeholder={t.company}
                  value={company} onChange={e => setCompany(e.target.value)}
                />
              </>
            )}
            <input
              className="nm-auth-input"
              type="email" required autoComplete="email"
              placeholder={t.email}
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input
              className="nm-auth-input"
              type="password" required autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={t.password}
              value={password} onChange={e => setPass(e.target.value)}
            />

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(184,50,64,0.12)",
                border: "1px solid rgba(184,50,64,0.35)",
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
                : mode === "login" ? t.submitLogin : t.submitRegister
              }
            </button>

            {mode === "login" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}>
                  <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.10)" }} />
                  <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", color: "#FFFFFF" }}>{t.or}</span>
                  <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.10)" }} />
                </div>
                <button
                  type="button"
                  onClick={sendMagicLink}
                  disabled={busy === "loading"}
                  style={{
                    width: "100%", padding: 13,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.24)",
                    borderRadius: 10, cursor: busy === "loading" ? "not-allowed" : "pointer",
                    fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.18s ease",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" />
                  </svg>
                  {t.magicLink}
                </button>
                <button
                  type="button"
                  onClick={demoLogin}
                  disabled={busy === "loading"}
                  title={t.demoHint}
                  style={{
                    width: "100%", padding: 13,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.24)",
                    borderRadius: 10, cursor: busy === "loading" ? "not-allowed" : "pointer",
                    fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.18s ease",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                  {t.demoButton}
                </button>
              </>
            )}

            <div style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em",
              textAlign: "center", color: "#FFFFFF",
            }}>
              {mode === "register"
                ? t.footerRegister
                : t.footerLogin
              }
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
