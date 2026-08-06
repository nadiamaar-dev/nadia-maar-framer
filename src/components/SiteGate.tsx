/**
 * SiteGate.tsx — schermata di accesso che copre tutto il sito.
 *
 * ATTENZIONE, e va detto chiaramente: questa NON è una misura di sicurezza.
 * Il controllo avviene nel browser, quindi chiunque apra il codice della
 * pagina può aggirarlo. Serve a tenere il sito fuori dagli occhi di chi
 * capita per caso e dei motori di ricerca finché non è pronto — non a
 * proteggere dati. Per una protezione vera serve un controllo lato server
 * (o la password protection di Vercel, che è una funzione a pagamento).
 *
 * La parola non compare in chiaro nel bundle: si confronta la sua impronta.
 * Non è crittografia, è solo il minimo perché una ricerca testuale nel
 * codice non la restituisca al primo colpo.
 */

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CONTACT, mailLink } from "../lib/contact"
import Background from "./Background"

const T = {
  bg: "#060C18", text: "#FFFFFF",
  accent: "#EE3A52", accentLt: "#F53E56", green: "#10B981",
} as const

const MONO    = "'JetBrains Mono','SF Mono',ui-monospace,monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const SANS    = "'Geist','Space Grotesk',system-ui,sans-serif"
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const STORAGE_KEY = "nm-gate"
/** impronta FNV-1a a 32 bit della parola d'accesso */
const DIGEST = "11di42n"

function digest(s: string): string {
  let x = 0x811c9dc5
  for (const c of s) { x ^= c.codePointAt(0)!; x = Math.imul(x, 0x01000193) >>> 0 }
  return x.toString(36)
}

const CSS = `
  /* Centrata dietro al pannello: sull'hero della home sta al bordo destro
     perché lì bilancia una colonna di contenuto, qui il contenuto è al
     centro e spostarla di lato la faceva sembrare fuori asse. */
  .gate-wordmark {
    position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
    font-family:${DISPLAY}; font-weight:900; font-size:clamp(150px,24vw,400px);
    letter-spacing:-0.055em; line-height:0.8; white-space:nowrap;
    color:rgba(255,255,255,0.016); -webkit-text-stroke:1px rgba(255,255,255,0.055);
    user-select:none; pointer-events:none; z-index:0;
  }
  @media(max-width:900px){ .gate-wordmark{ display:none } }
  .gate-panel { width:100%; max-width:440px; }
  @media(max-width:560px){ .gate-pad { padding:0 20px !important; } }
`

function NMmark({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 2 28 22" width={size} height={Math.round(size * 22 / 28)} fill="none" strokeLinecap="square" strokeLinejoin="miter" aria-hidden>
      <defs>
        <linearGradient id="gate-nm" x1="2" y1="12" x2="27" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
          <stop offset="44%" stopColor="rgba(255,255,255,0.92)" />
          <stop offset="56%" stopColor="#BE3648" />
          <stop offset="100%" stopColor="#7C222B" />
        </linearGradient>
      </defs>
      <motion.path d="M 2,22 L 2,2 L 13,22 L 13,2 L 19.5,12 L 26,2 L 26,22"
        stroke="url(#gate-nm)" strokeWidth="1.85"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 1, ease, delay: 0.2 }, opacity: { duration: 0.01 } }} />
    </svg>
  )
}

export default function SiteGate({ children }: { children: React.ReactNode }) {
  /* si legge una volta sola: se la chiave è già a posto il sito parte
     senza far comparire la schermata nemmeno per un fotogramma */
  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === DIGEST } catch { return false }
  })
  const [value, setValue] = useState("")
  const [wrong, setWrong] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!open) inputRef.current?.focus() }, [open])

  if (open) return <>{children}</>

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (digest(value.trim()) === DIGEST) {
      try { localStorage.setItem(STORAGE_KEY, DIGEST) } catch { /* modalità privata: si entra comunque, per questa sessione */ }
      setOpen(true)
      return
    }
    setWrong(true)
    setValue("")
    inputRef.current?.focus()
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Background />
      <div className="gate-wordmark" aria-hidden>MAAR</div>

      <div className="gate-pad" style={{ position: "relative", zIndex: 1, width: "100%", padding: "0 32px", display: "flex", justifyContent: "center" }}>
        <motion.div className="gate-panel"
          initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
            <NMmark />
            <div>
              <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, letterSpacing: "0.06em", color: "#FFFFFF" }}>NADIA MAAR</div>
              <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
                Digital Studio · 2026
              </div>
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accentLt, flexShrink: 0 }} />
            <span>[ In Costruzione ]</span>
          </div>

          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(32px,5vw,46px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", color: "#FFFFFF", margin: "0 0 16px" }}>
            Torniamo <span style={{ color: "transparent", WebkitTextStroke: "1.4px rgba(255,255,255,0.62)" }}>presto</span>
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", margin: "0 0 34px" }}>
            Il sito è in preparazione. Se hai la parola d'accesso, entra pure.
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label htmlFor="gate-pw" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.6)" }}>
              Parola d'accesso
            </label>
            <input
              id="gate-pw" ref={inputRef} type="password" value={value} autoComplete="current-password"
              onChange={e => { setValue(e.target.value); if (wrong) setWrong(false) }}
              aria-invalid={wrong}
              style={{
                width: "100%", padding: "15px 17px", borderRadius: 12, boxSizing: "border-box",
                background: wrong ? "rgba(255,60,92,0.07)" : "rgba(255,255,255,0.012)",
                border: `1px solid ${wrong ? "rgba(255,70,100,0.6)" : "rgba(255,255,255,0.15)"}`,
                color: "#FFFFFF", fontSize: 16, fontFamily: MONO, letterSpacing: "0.14em", outline: "none",
                transition: "border-color .2s, background .2s",
              }}
              onFocus={e => { if (!wrong) e.target.style.borderColor = "rgba(255,60,92,0.55)" }}
              onBlur={e => { if (!wrong) e.target.style.borderColor = "rgba(255,255,255,0.15)" }}
            />

            <AnimatePresence>
              {wrong && (
                <motion.p role="alert"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", color: "rgba(255,120,120,0.95)", margin: 0 }}>
                  Parola non corretta.
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button type="submit" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
              style={{
                marginTop: 6, minHeight: 52, borderRadius: 12, cursor: "pointer",
                border: "1px solid rgba(255,60,92,0.80)",
                background: "linear-gradient(90deg, rgba(255,60,92,0.30) 0%, rgba(255,60,92,0.17) 100%)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
                display: "flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO,
              }}>
              <span style={{ padding: "0 15px", borderRight: "1px solid rgba(255,60,92,0.42)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "#FFFFFF" }}>[→]</span>
              <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
                Entra
              </span>
            </motion.button>
          </form>

          <div style={{ marginTop: 34, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", gap: 9, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, flexShrink: 0 }} />
            <a href={mailLink()} style={{ color: "inherit", textDecoration: "none" }}>{CONTACT.email}</a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
