/**
 * NadiaMaar_Contatti.tsx — pagina /contatti
 *
 * Struttura, nell'ordine in cui serve a chi arriva qui:
 *   1. canali diretti — email, telefono, Telegram: chi vuole scrivere subito
 *      non deve compilare niente;
 *   2. che cosa scrivere — quattro righe che alzano la qualità di ciò che
 *      arriva e fanno risparmiare un giro di domande a entrambi;
 *   3. il modulo, con i campi ridotti al minimo utile;
 *   4. che cosa succede dopo — tre passi, così l'attesa non è al buio;
 *   5. la via alternativa: il configuratore, per chi preferisce comporre
 *      invece di scrivere;
 *   6. dati amministrativi.
 *
 * Niente mappa e niente indirizzo: lo studio lavora da remoto (il piè di
 * pagina dice "Remote · Europa") e una sede inventata farebbe più danno
 * della sua assenza.
 */

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import Background from "./components/Background"
import Footer from "./components/Footer"
import Header from "./components/Header"
import FoundryConfigurator from "./components/foundry/FoundryConfigurator"
import { sendContact } from "./lib/sendContact"
import { CONTACT } from "./lib/contact"
import { useT } from "./lib/i18n/t"
import { CONTATTI_STR } from "./lib/i18n/strings/contatti"

const T = {
  bg: "#060C18", text: "#FFFFFF", muted: "#FFFFFF",
  border: "rgba(70,90,108,0.22)", accent: "#EE3A52", accentLt: "#F53E56", green: "#10B981",
} as const

const MONO    = "'JetBrains Mono','SF Mono',ui-monospace,monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const SANS    = "'Geist','Space Grotesk',system-ui,sans-serif"
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const WRAP: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" }

/* ── Dati di contatto ────────────────────────────────────────────────────
   Il posto unico è src/lib/contact.ts: qui restano solo gli alias, perché
   questa pagina li usa in una quindicina di punti. */
const EMAIL = CONTACT.email
const TEL_DISPLAY = CONTACT.telDisplay
const TEL_HREF = CONTACT.telHref
const TELEGRAM = CONTACT.telegram

/* PLACEHOLDER — dati amministrativi da sostituire con quelli reali.
   Finché contengono "—" il blocco non viene mostrato: meglio niente che
   un numero inventato su una pagina che deve ispirare fiducia. */
const LEGALE = {
  ragioneSociale: "—",
  piva: "—",
  pec: "—",
}

const CSS = `
  .ct-wrap { max-width:1120px; margin:0 auto; padding:0 32px; }
  .ct-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:start; }
  .ct-channels { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .ct-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .ct-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media(max-width:900px){
    .ct-grid { grid-template-columns:1fr !important; gap:48px !important; }
    .ct-channels { grid-template-columns:1fr !important; }
    .ct-steps { grid-template-columns:1fr !important; }
  }
  @media(max-width:560px){
    .ct-wrap { padding:0 20px !important; }
    .ct-field-row { grid-template-columns:1fr !important; }
  }
`

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 0.65, delay, ease }}>
      {children}
    </motion.div>
  )
}

function Kicker({ text }: { text: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
      <span style={{ color: T.accentLt }}>//</span><span>[ {text} ]</span>
    </div>
  )
}

const CARD: React.CSSProperties = {
  borderRadius: 14, background: "rgba(255,255,255,0.012)",
  border: "1px solid rgba(255,255,255,0.13)",
  backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
}

/* ── Canale diretto ──────────────────────────────────────────────────────── */
function Channel({ label, value, href, icon }: { label: string; value: string; href: string; icon: React.ReactNode }) {
  const [h, setH] = useState(false)
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        ...CARD, display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", textDecoration: "none",
        background: h ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.012)",
        borderColor: h ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.13)",
        transform: h ? "translateY(-2px)" : "none",
        transition: "background .22s, border-color .22s, transform .22s",
      }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.22)", color: "#FFFFFF" }}>
        {icon}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: T.accentLt, marginBottom: 4 }}>{label}</span>
        <span style={{ display: "block", fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
      </span>
    </a>
  )
}

const ICON = {
  mail: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>,
  phone: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  tg: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z" /></svg>,
}

/* ── Modulo ──────────────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 15px", borderRadius: 11,
  background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.13)",
  color: "#FFFFFF", fontSize: 15, fontFamily: SANS, outline: "none", boxSizing: "border-box",
  transition: "border-color .2s, background .2s",
}
const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em",
  textTransform: "uppercase" as const, color: "rgba(255,255,255,0.62)", marginBottom: 7,
}

function ContactForm() {
  const t = useT(CONTATTI_STR).form
  const [f, setF] = useState({ name: "", email: "", company: "", message: "", website: "" })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF(s => ({ ...s, [k]: e.target.value }))

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(255,60,92,0.55)"
    e.target.style.background = "rgba(255,60,92,0.05)"
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.13)"
    e.target.style.background = "rgba(255,255,255,0.012)"
  }

  if (sent) {
    return (
      <div style={{ ...CARD, padding: "40px 32px", textAlign: "center" }} role="status">
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green, margin: "0 auto 20px" }} />
        <h3 style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 700, color: "#FFFFFF", margin: "0 0 12px" }}>{t.sentTitle}</h3>
        <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: T.muted, margin: 0, maxWidth: 380, marginInline: "auto" }}>
          {t.sentBody}
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (busy) return
        setBusy(true); setFailed(false)
        const ok = await sendContact(f)
        setBusy(false)
        if (ok) setSent(true); else setFailed(true)
      }}
      style={{ ...CARD, padding: "28px 26px", display: "flex", flexDirection: "column", gap: 14 }}>

      <div className="ct-field-row">
        <div>
          <label style={labelStyle} htmlFor="ct-name">{t.name}</label>
          <input id="ct-name" style={inputStyle} value={f.name} onChange={set("name")} onFocus={focus} onBlur={blur} required maxLength={200} placeholder={t.namePlaceholder} />
        </div>
        <div>
          <label style={labelStyle} htmlFor="ct-email">{t.email}</label>
          <input id="ct-email" type="email" style={inputStyle} value={f.email} onChange={set("email")} onFocus={focus} onBlur={blur} required maxLength={200} placeholder={t.emailPlaceholder} />
        </div>
      </div>

      <div>
        <label style={labelStyle} htmlFor="ct-company">{t.company} <span style={{ textTransform: "none" as const, letterSpacing: 0 }}>{t.companyOptional}</span></label>
        <input id="ct-company" style={inputStyle} value={f.company} onChange={set("company")} onFocus={focus} onBlur={blur} maxLength={200} placeholder={t.companyPlaceholder} />
      </div>

      <div>
        <label style={labelStyle} htmlFor="ct-msg">{t.project}</label>
        <textarea id="ct-msg" rows={6} style={{ ...inputStyle, resize: "vertical", minHeight: 130, lineHeight: 1.65 }}
          value={f.message} onChange={set("message")} onFocus={focus} onBlur={blur} required minLength={10} maxLength={4000}
          placeholder={t.projectPlaceholder} />
      </div>

      {/* honeypot: il nome NON deve somigliare a un campo reale, altrimenti
          l'autofill del browser lo riempie e scarta una richiesta vera */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={f.website} onChange={set("website")}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

      {failed && (
        <p role="alert" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", lineHeight: 1.6, color: "rgba(255,120,120,0.95)", margin: 0 }}>
          {t.failed.replace("{email}", EMAIL)}
        </p>
      )}

      <motion.button type="submit" disabled={busy} whileHover={busy ? undefined : { y: -2 }} whileTap={busy ? undefined : { scale: 0.98 }}
        style={{
          marginTop: 4, minHeight: 52, borderRadius: 12, cursor: busy ? "progress" : "pointer",
          border: "1px solid rgba(255,60,92,0.80)",
          background: "linear-gradient(90deg, rgba(255,60,92,0.30) 0%, rgba(255,60,92,0.17) 100%)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
          display: "flex", alignItems: "stretch", overflow: "hidden", fontFamily: MONO,
          opacity: busy ? 0.62 : 1,
        }}>
        <span style={{ padding: "0 14px", borderRight: "1px solid rgba(255,60,92,0.40)", display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.22em", color: "#FFFFFF" }}>[→]</span>
        <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#FFFFFF" }}>
          {busy ? t.sending : t.submit}
        </span>
      </motion.button>

      <p style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", margin: 0 }}>
        {t.privacy}
      </p>
    </form>
  )
}

/* ── Configuratore in finestra ───────────────────────────────────────────────
   Prima il pulsante puntava a /#s7: portava via dalla pagina dei contatti,
   ricaricava la home e faceva scorrere fin quasi in fondo. Chi era arrivato
   qui per scrivere si ritrovava altrove. Ora il widget si apre sul posto.

   z-index 800: sopra l'header (500) e il pulsante flottante (401), ma sotto
   il modale del lead che il configuratore apre al quarto passo (2000), che
   deve restare in cima. */
function ConfiguratorDialog({ onClose }: { onClose: () => void }) {
  const t = useT(CONTATTI_STR).alt
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)

    /* blocco di scroll compatibile con iOS: overflow:hidden su <html> lì non basta */
    const y = window.scrollY
    const b = document.body.style
    const prev = { position: b.position, top: b.top, width: b.width, overflow: b.overflow }
    b.position = "fixed"; b.top = `-${y}px`; b.width = "100%"; b.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", onKey)
      b.position = prev.position; b.top = prev.top; b.width = prev.width; b.overflow = prev.overflow
      window.scrollTo(0, y)
    }
  }, [onClose])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.26 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-label={t.dialogLabel}
      style={{
        position: "fixed", inset: 0, zIndex: 800, overflowY: "auto", overscrollBehavior: "contain",
        background: "rgba(3,7,14,0.72)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        padding: "0 0 40px",
      }}>
      <motion.div
        initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.34, ease }}
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative", maxWidth: 1200, margin: "0 auto",
          background: T.bg, borderRadius: 18, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
        }}>
        <button onClick={onClose} aria-label={t.close}
          style={{
            position: "sticky", top: 14, left: "100%", zIndex: 5, transform: "translateX(-58px)",
            width: 40, height: 40, borderRadius: 11, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.22)",
            color: "#FFFFFF", fontSize: 20, lineHeight: 1, fontFamily: MONO,
          }}>×</button>
        {/* margine negativo: il pulsante è sticky e non deve lasciare un vuoto */}
        <div style={{ marginTop: -54 }}>
          <FoundryConfigurator />
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

/* ── Pagina ──────────────────────────────────────────────────────────────── */

export default function NadiaMaarContatti() {
  const t = useT(CONTATTI_STR)
  const COSA_SCRIVERE = t.how.points
  const DOPO = t.after.steps
  const hasLegale = Object.values(LEGALE).some(v => v !== "—")
  const [cfgOpen, setCfgOpen] = useState(false)

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: SANS, minHeight: "100vh", position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Background />
      <Header />

      <div style={{ position: "relative", zIndex: 1, paddingTop: 64 }}>

        {/* ── HERO + canali diretti ── */}
        <section style={{ padding: "80px 0 64px", borderBottom: `1px solid ${T.border}` }}>
          <div className="ct-wrap">
            <Reveal>
              <Kicker text={t.hero.kicker} />
              <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(38px,5vw,68px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", color: "#FFFFFF", margin: "0 0 20px", maxWidth: 780 }}>
                {t.hero.title}
              </h1>
              <p style={{ fontFamily: SANS, fontSize: "clamp(16px,1.4vw,17px)", lineHeight: 1.8, color: T.muted, maxWidth: 620, margin: "0 0 40px" }}>
                {t.hero.lead}
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="ct-channels">
                <Channel label={t.channels.email}    value={EMAIL}       href={`mailto:${EMAIL}`} icon={ICON.mail} />
                <Channel label={t.channels.phone}    value={TEL_DISPLAY} href={`tel:${TEL_HREF}`} icon={ICON.phone} />
                <Channel label={t.channels.telegram} value="@Nadiamaar_bot" href={TELEGRAM}       icon={ICON.tg} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Cosa scrivere + modulo ── */}
        <section style={{ padding: "80px 0", borderBottom: `1px solid ${T.border}` }}>
          <div className="ct-wrap">
            <div className="ct-grid">
              <div>
                <Reveal>
                  <Kicker text={t.how.kicker} />
                  <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,2.8vw,38px)", fontWeight: 700, lineHeight: 1.14, letterSpacing: "-0.025em", color: "#FFFFFF", margin: "0 0 18px" }}>
                    {t.how.title}
                  </h2>
                  <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.75, color: T.muted, margin: "0 0 30px", maxWidth: 480 }}>
                    {t.how.lead}
                  </p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, margin: 0, padding: 0 }}>
                    {COSA_SCRIVERE.map((c, i) => (
                      <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <span aria-hidden style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.accentLt, flexShrink: 0, paddingTop: 4 }}>0{i + 1}</span>
                        <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.65, color: T.muted }}>{c}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>

              <Reveal delay={0.1}><ContactForm /></Reveal>
            </div>
          </div>
        </section>

        {/* ── Che cosa succede dopo ── */}
        <section style={{ padding: "80px 0", borderBottom: `1px solid ${T.border}` }}>
          <div className="ct-wrap">
            <Reveal>
              <Kicker text={t.after.kicker} />
              <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,2.8vw,38px)", fontWeight: 700, lineHeight: 1.14, letterSpacing: "-0.025em", color: "#FFFFFF", margin: "0 0 44px" }}>
                {t.after.title}
              </h2>
            </Reveal>
            <div className="ct-steps">
              {DOPO.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.08}>
                  <div style={{ ...CARD, padding: "24px 22px", height: "100%", boxSizing: "border-box" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", color: T.accentLt }}>[ {s.n} ]</span>
                    <h3 style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, color: "#FFFFFF", margin: "14px 0 10px", lineHeight: 1.25 }}>{s.t}</h3>
                    <div aria-hidden style={{ width: 26, height: 1.5, background: `linear-gradient(90deg, ${T.accent}, transparent)`, borderRadius: 2, marginBottom: 12 }} />
                    <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.68, color: T.muted, margin: 0 }}>{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Via alternativa: il configuratore ── */}
        <section style={{ padding: "72px 0", borderBottom: `1px solid ${T.border}` }}>
          <div className="ct-wrap">
            <Reveal>
              <div style={{ ...CARD, padding: "36px 34px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, flexWrap: "wrap" }}>
                <div style={{ minWidth: 260, flex: 1 }}>
                  <Kicker text={t.alt.kicker} />
                  <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", color: "#FFFFFF", margin: "0 0 10px" }}>
                    {t.alt.title}
                  </h2>
                  <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: T.muted, margin: 0, maxWidth: 520 }}>
                    {t.alt.body}
                  </p>
                </div>
                <button onClick={() => setCfgOpen(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 22px", borderRadius: 11, cursor: "pointer", border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.03)", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#FFFFFF", flexShrink: 0 }}>
                  {t.alt.cta} <span style={{ color: T.accentLt }}>→</span>
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Dati amministrativi — appaiono solo quando sono reali ── */}
        {hasLegale && (
          <section style={{ padding: "56px 0" }}>
            <div className="ct-wrap">
              <Reveal>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "18px 56px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", color: "rgba(255,255,255,0.55)" }}>
                  <span>{LEGALE.ragioneSociale}</span>
                  <span>{t.legal.vat} {LEGALE.piva}</span>
                  <span>{t.legal.pec} {LEGALE.pec}</span>
                </div>
              </Reveal>
            </div>
          </section>
        )}
      </div>

      <Footer />

      <AnimatePresence>
        {cfgOpen && <ConfiguratorDialog onClose={() => setCfgOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
