import React, { useEffect, useState } from "react"
import { useT } from "../lib/i18n/t"
import { AUTH_STR } from "../lib/i18n/strings/auth"
import { DEFAULT_PUBLIC_SETTINGS, getSiteSettings, type PublicSiteSettings } from "../lib/siteSettings"
import { grantConsent, hasStoredConsent, refuseConsent } from "../lib/measure"

/* ══════════════════════════════════════════════════════════════════════════
   CHROME DEL SITO — barra promozionale e richiesta di consenso.

   Due elementi che compaiono solo se accesi dal pannello, e che condividono
   una regola: non devono mai coprire il contenuto al primo sguardo. La
   barra promo sta in cima e spinge la pagina in giù; il consenso sta in
   basso a sinistra ed è piccolo, perché un pannello che occupa mezzo
   schermo è il motivo per cui tutti cliccano «accetta» senza leggere.

   SUL CONSENSO — il conteggio interno non ne ha bisogno: nessun cookie,
   nessun IP in chiaro. Serve per GA4, Google Tag Manager e Meta Pixel, che
   invece profilano. Perciò quei tre NON vengono caricati finché il consenso
   non c'è, e rifiutare significa che non partono affatto: un banner che
   carica comunque gli script è peggio di nessun banner, perché è una
   dichiarazione falsa.
══════════════════════════════════════════════════════════════════════════ */

const MONO = "'JetBrains Mono', ui-monospace, monospace"
const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"

export default function SiteChrome() {
  const t = useT(AUTH_STR).chrome
  const [s, setS] = useState<PublicSiteSettings | null>(null)
  const [promoClosed, setPromoClosed] = useState(() => {
    try { return sessionStorage.getItem("nm-promo-closed") === "1" } catch { return false }
  })
  const [consentAsked, setConsentAsked] = useState(() => hasStoredConsent())

  useEffect(() => {
    let alive = true
    getSiteSettings()
      .then(v => { if (alive) setS(v) })
      .catch(() => { if (alive) setS(DEFAULT_PUBLIC_SETTINGS) })
    return () => { alive = false }
  }, [])

  if (!s) return null

  const showPromo = s.promoBarActive && !!s.promoBarText?.trim() && !promoClosed
  /* Il banner ha senso solo se c'è qualcosa da cui dipendere: senza nessuno
     strumento di profilazione configurato, chiedere il consenso a cosa? */
  const tracksSomething = !!(s.googleAnalyticsId || s.gtmContainerId || s.metaPixelId)
  const showConsent = s.cookieConsentEnabled && tracksSomething && !consentAsked

  return (
    <>
      {showPromo && (
        <div style={{
          position: "relative", zIndex: 60, width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
          padding: "11px 46px 11px 18px",
          background: "linear-gradient(90deg, rgba(184,50,64,0.92), rgba(126,34,45,0.92))",
          borderBottom: "1px solid rgba(255,255,255,0.14)",
        }}>
          <span style={{
            fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 600, color: "#FFFFFF",
            textAlign: "center", lineHeight: 1.4,
          }}>
            {s.promoBarText}
          </span>
          {s.promoBarLink?.trim() && (
            <a
              href={s.promoBarLink}
              style={{
                flexShrink: 0, textDecoration: "none", whiteSpace: "nowrap",
                padding: "5px 14px", borderRadius: 99,
                background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.34)",
                fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700, color: "#FFFFFF",
              }}
            >
              {t.promoCta}
            </a>
          )}
          <button
            type="button"
            aria-label={t.promoClose}
            onClick={() => {
              setPromoClosed(true)
              try { sessionStorage.setItem("nm-promo-closed", "1") } catch { /* privata */ }
            }}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              width: 26, height: 26, borderRadius: 8, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.24)",
              color: "#FFFFFF", fontSize: 15, lineHeight: 1, padding: 0,
            }}
          >
            ×
          </button>
        </div>
      )}

      {showConsent && (
        <div
          role="dialog"
          aria-label={t.consentLabel}
          style={{
            position: "fixed", left: 16, bottom: 16, zIndex: 90, maxWidth: 380,
            padding: "17px 19px", borderRadius: 16,
            background: "rgba(18,20,24,0.92)", border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 18px 48px rgba(0,0,0,0.55)",
          }}
        >
          <p style={{
            fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#E4697A", margin: 0,
          }}>
            {t.consentTitle}
          </p>
          <p style={{
            fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.6, color: "#FFFFFF", margin: "9px 0 14px",
          }}>
            {t.consentBody}
          </p>
          <div style={{ display: "flex", gap: 9 }}>
            <button
              type="button"
              onClick={() => { refuseConsent(); setConsentAsked(true) }}
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 99, cursor: "pointer",
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)",
                fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF",
              }}
            >
              {t.consentRefuse}
            </button>
            <button
              type="button"
              onClick={() => { grantConsent(); setConsentAsked(true) }}
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 99, cursor: "pointer",
                background: "linear-gradient(90deg, rgba(184,50,64,0.42), rgba(184,50,64,0.26))",
                border: "1px solid rgba(184,50,64,0.80)",
                fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700, color: "#FFFFFF",
              }}
            >
              {t.consentAccept}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
