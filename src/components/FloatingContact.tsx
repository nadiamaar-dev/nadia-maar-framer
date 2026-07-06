import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const MONO = "'JetBrains Mono','SF Mono',ui-monospace,monospace"

const T = {
  accentLt: "#B04A38",
  muted: "rgba(245,245,247,0.52)",
  text: "#F5F5F7",
} as const

/* ── icons ── */
const XIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const MailIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,4 12,13 2,4" />
  </svg>
)
const PhoneIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
  </svg>
)
const MapPinIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const WhatsAppIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

/* ── action button inside popup ── */
function FloatingActionBtn({ href, icon, label, external }: {
  href: string; icon: React.ReactNode; label: string; external?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <motion.a
      href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      whileHover={{ scale: 1.07, y: -2 }} whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        padding: "10px 4px", borderRadius: 12,
        background: hov ? "rgba(140,53,37,0.18)" : "rgba(255,255,255,0.07)",
        border: `1px solid ${hov ? "rgba(140,53,37,0.58)" : "rgba(255,255,255,0.14)"}`,
        boxShadow: hov ? "0 0 18px rgba(140,53,37,0.28), inset 0 1px 0 rgba(255,255,255,0.14)" : "none",
        color: hov ? "#fff" : "rgba(255,255,255,0.85)",
        fontSize: 10, fontWeight: 600, letterSpacing: "0.03em",
        textDecoration: "none", cursor: "pointer",
        transition: "background 0.18s, border-color 0.18s, box-shadow 0.20s, color 0.18s",
        fontFamily: MONO,
      }}>
      {icon}{label}
    </motion.a>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   FLOATING CONTACT WIDGET
══════════════════════════════════════════════════════════════════════════ */
export default function FloatingContact() {
  const name      = "Nadia Maar"
  const email     = "nadiamaar.dev@gmail.com"
  const phone     = "+39 000 000 0000"
  const whatsapp  = "+390000000000"
  const location  = "Remote · Europa"
  const initials  = "NM"

  const [open,     setOpen]     = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const btnRef  = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check, { passive: true })
    return () => window.removeEventListener("resize", check)
  }, [])

  /* close on outside click */
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const inCard = cardRef.current?.contains(e.target as Node)
      const inBtn  = btnRef.current?.contains(e.target as Node)
      if (!inCard && !inBtn) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const mobileVariants = {
    hidden:  { opacity: 0, y: 48,  scale: 0.92 },
    visible: { opacity: 1, y: 0,   scale: 1    },
    exit:    { opacity: 0, y: 32,  scale: 0.94 },
  }
  const desktopVariants = {
    hidden:  { opacity: 0, x: 18,  scale: 0.94 },
    visible: { opacity: 1, x: 0,   scale: 1    },
    exit:    { opacity: 0, x: 14,  scale: 0.96 },
  }

  const cardBase: React.CSSProperties = {
    position: "fixed", zIndex: 400,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(48px) saturate(1.5) brightness(0.90)",
    WebkitBackdropFilter: "blur(48px) saturate(1.5) brightness(0.90)",
    border: "1px solid rgba(140,53,37,0.42)",
    boxShadow: [
      "0 0 0 1px rgba(140,53,37,0.10)",
      "0 28px 64px rgba(0,0,0,0.65)",
      "0 0 40px rgba(140,53,37,0.10)",
      "inset 0 1px 0 rgba(255,255,255,0.12)",
    ].join(", "),
    overflow: "hidden",
  }

  const mobileCardStyle: React.CSSProperties  = { ...cardBase, left: 16, right: 16, bottom: 84, borderRadius: 20 }
  const desktopCardStyle: React.CSSProperties = { ...cardBase, right: 90, top: "50%", transform: "translateY(-50%)", width: 262, borderRadius: 18 }

  return (
    <>
      {/* backdrop — mobile only */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div key="fc-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.60)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 398 } as React.CSSProperties}
          />
        )}
      </AnimatePresence>

      {/* popup card */}
      <AnimatePresence>
        {open && (
          <motion.div key="fc-card" ref={cardRef}
            style={isMobile ? mobileCardStyle : desktopCardStyle}
            variants={isMobile ? mobileVariants : desktopVariants}
            initial="hidden" animate="visible" exit="exit"
            transition={{ type: "spring", stiffness: 520, damping: 28 }}
          >
            {/* accent top line */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(140,53,37,0.80), rgba(176,74,56,0.55), transparent)" }} />

            {/* header */}
            <div style={{ padding: "14px 14px 12px", display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(140,53,37,0.50)", boxShadow: "0 0 12px rgba(140,53,37,0.22), inset 0 1px 0 rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.90)" }}>{initials}</span>
                </div>
                <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: T.accentLt, border: "2px solid rgba(10,5,20,0.90)", display: "block" }}>
                  <motion.span
                    style={{ position: "absolute", inset: -2, borderRadius: "50%", background: T.accentLt, opacity: 0.55 }}
                    animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.35, marginBottom: 4 }}>Web Architecture & Digital Strategy</div>
                <span style={{ fontSize: 9, fontWeight: 600, color: T.accentLt, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>● Available</span>
              </div>
              <motion.button onClick={() => setOpen(false)}
                whileHover={{ scale: 1.14, background: "rgba(255,255,255,0.10)" }} whileTap={{ scale: 0.90 }}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 7, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.muted, flexShrink: 0, transition: "background 0.16s" }}>
                <XIcon size={11} />
              </motion.button>
            </div>

            {/* contact info */}
            <div style={{ padding: "9px 14px", display: "flex", flexDirection: "column", gap: 7, borderTop: "1px solid rgba(140,53,37,0.18)" }}>
              <a href={`mailto:${email}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.muted, textDecoration: "none", transition: "color 0.16s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.90)")}
                onMouseLeave={e => (e.currentTarget.style.color = T.muted)}>
                <MailIcon size={11} /><span style={{ wordBreak: "break-all" }}>{email}</span>
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.muted }}>
                <MapPinIcon size={11} /><span>{location}</span>
              </div>
            </div>

            {/* action buttons */}
            <div style={{ padding: "9px 12px 14px", borderTop: "1px solid rgba(140,53,37,0.18)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              <FloatingActionBtn href={`mailto:${email}`}                                                        icon={<MailIcon size={13} />}    label="Email"     />
              <FloatingActionBtn href={`tel:${phone.replace(/\s/g, "")}`}                                        icon={<PhoneIcon size={13} />}   label="Chiama"    />
              <FloatingActionBtn href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Ciao%20Nadia!`}   icon={<WhatsAppIcon />}          label="WhatsApp"  external />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* trigger button */}
      <motion.button ref={btnRef}
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.09 }} whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 440, damping: 20 }}
        aria-label="Contatta Nadia Maar"
        style={{
          position: "fixed",
          right:  isMobile ? 16 : 24,
          bottom: isMobile ? 24 : "auto",
          top:    isMobile ? "auto" : "50%",
          transform: isMobile ? "none" : "translateY(-50%)",
          zIndex: 401,
          borderRadius: 12,
          border: `1px solid ${open ? "rgba(176,74,56,0.90)" : "rgba(176,74,56,0.65)"}`,
          background: "linear-gradient(90deg, rgba(140,53,37,0.55) 0%, rgba(176,74,56,0.28) 100%)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: open
            ? "0 0 56px rgba(140,53,37,0.38), 0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)"
            : "0 0 36px rgba(140,53,37,0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
          cursor: "pointer", display: "flex", alignItems: "stretch",
          transition: "border-color 0.24s, box-shadow 0.24s",
          flexShrink: 0, overflow: "hidden",
        } as React.CSSProperties}
      >
        <span style={{ padding: "12px 10px 12px 14px", borderRight: "1px solid rgba(140,53,37,0.45)", display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 8, letterSpacing: "0.20em", color: "rgba(255,220,200,0.80)" }}>NM</span>
        <span style={{ padding: "12px 14px", display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 13, color: "#fff" }}>→</span>
      </motion.button>
    </>
  )
}
