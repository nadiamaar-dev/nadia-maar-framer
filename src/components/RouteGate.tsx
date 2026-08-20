import React, { useEffect, useState } from "react"
import Background from "./Background"
import { DEFAULT_PUBLIC_SETTINGS, getSiteSettings, type PublicSiteSettings } from "../lib/siteSettings"
import { useLocale } from "../lib/i18n/LocaleContext"
import { useT } from "../lib/i18n/t"
import { COMMON_STR } from "../lib/i18n/strings/common"

/* ══════════════════════════════════════════════════════════════════════════
   INTERRUTTORI DI ROTTA.

   `foundry_enabled` e `maintenance_mode` decidono cosa il sito mostra. Su
   Next.js questo controllo starebbe in un middleware, prima ancora della
   risposta; qui il sito è un'applicazione a rendering client servita da un
   rewrite statico, quindi il controllo avviene appena l'app parte. La
   differenza pratica: chi ha JavaScript disattivato o legge l'HTML grezzo
   vede il guscio vuoto, non la pagina.

   Per la manutenzione questo basta: chi legge l'HTML grezzo vede il guscio
   vuoto, non il sito. Per /foundry invece no — lì il controllo lo fa anche
   /api/route, che risponde 404 vero, perché «pagina spenta» deve valere
   allo stesso modo per una persona, per un crawler e per chi condivide il
   link.
══════════════════════════════════════════════════════════════════════════ */

type State = { phase: "loading" } | { phase: "ready"; settings: PublicSiteSettings }

function useSiteSettings(): State {
  const [state, setState] = useState<State>({ phase: "loading" })
  useEffect(() => {
    let alive = true
    getSiteSettings()
      .then(s => { if (alive) setState({ phase: "ready", settings: s }) })
      .catch(() => { if (alive) setState({ phase: "ready", settings: DEFAULT_PUBLIC_SETTINGS }) })
    return () => { alive = false }
  }, [])
  return state
}

function Curtain({ title, body }: { title: string; body: string }) {
  const t = useT(COMMON_STR)
  const { href: L } = useLocale()
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#121418", position: "relative", padding: 24,
    }}>
      <Background />
      <div style={{
        position: "relative", zIndex: 1, maxWidth: 460, textAlign: "center",
        padding: "34px 30px", borderRadius: 20,
        background: "rgba(28,31,38,0.62)", border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(22px) saturate(0.80)", WebkitBackdropFilter: "blur(22px) saturate(0.80)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 18px rgba(0,0,0,0.32)",
      }}>
        <p style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11.5,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#E4697A", margin: 0,
        }}>
          Nadia Maar
        </p>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 26, fontWeight: 800,
          color: "#FFFFFF", margin: "14px 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          {title}
        </h1>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 15,
          lineHeight: 1.6, color: "#FFFFFF", margin: "0 0 22px",
        }}>
          {body}
        </p>
        <a href={L("/")} style={{
          display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
          padding: "11px 20px", borderRadius: 99,
          background: "linear-gradient(90deg, rgba(184,50,64,0.34), rgba(184,50,64,0.20))",
          border: "1px solid rgba(184,50,64,0.80)", color: "#FFFFFF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 700,
        }}>
          {t.notFound.home}
        </a>
      </div>
    </div>
  )
}

/** Nessuno spinner: la lettura dura pochi millisecondi e un lampo di
 *  «caricamento» prima di ogni pagina costa più di quanto renda. */
const Blank = () => <div style={{ minHeight: "100vh", background: "#121418" }} aria-hidden />

/**
 * Pagina non trovata. Esiste come pagina vera perché prima una rotta
 * sconosciuta mostrava la home con stato 200: per Google un «soft 404», cioè
 * un duplicato della home indicizzato sotto un indirizzo che non esiste.
 * Adesso /api/route risponde davvero 404 e disegna questa.
 */
export function NotFound() {
  const t = useT(COMMON_STR).notFound
  const { href: L } = useLocale()
  const path = typeof window !== "undefined" ? window.location.pathname : ""
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#121418", position: "relative", padding: 24,
    }}>
      <Background />
      <div style={{
        position: "relative", zIndex: 1, maxWidth: 480, textAlign: "center",
        padding: "34px 30px", borderRadius: 20,
        background: "rgba(28,31,38,0.62)", border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(22px) saturate(0.80)", WebkitBackdropFilter: "blur(22px) saturate(0.80)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 18px rgba(0,0,0,0.32)",
      }}>
        <p style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11.5,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#E4697A", margin: 0,
        }}>
          {t.code}
        </p>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 26, fontWeight: 800,
          color: "#FFFFFF", margin: "14px 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          {t.title}
        </h1>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 15,
          lineHeight: 1.6, color: "#FFFFFF", margin: "0 0 8px",
        }}>
          {t.bodyBefore} <code style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 14 }}>{path}</code>{" "}
          {t.bodyAfter}
        </p>
        <div style={{ display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
          <a href={L("/")} style={{
            display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
            padding: "11px 20px", borderRadius: 99,
            background: "linear-gradient(90deg, rgba(184,50,64,0.34), rgba(184,50,64,0.20))",
            border: "1px solid rgba(184,50,64,0.80)", color: "#FFFFFF",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 700,
          }}>
            {t.home}
          </a>
          <a href={L("/contatti")} style={{
            display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
            padding: "11px 20px", borderRadius: 99,
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)",
            color: "#FFFFFF", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: 14, fontWeight: 600,
          }}>
            {t.contact}
          </a>
        </div>
      </div>
    </div>
  )
}

/** Avvolge il sito pubblico. L'area riservata resta raggiungibile: la
 *  manutenzione riguarda i visitatori, non i clienti che hanno un progetto
 *  in corso e le loro fatture da consultare. */
export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const s = useSiteSettings()
  const t = useT(COMMON_STR).maintenance
  if (s.phase === "loading") return <Blank />
  if (s.settings.maintenanceMode) {
    /* Il messaggio scritto dal pannello vince, ed è in una lingua sola: è un
       avviso momentaneo scritto a mano, non contenuto da tradurre. Quando non
       c'è, si usa il testo del dizionario. */
    return (
      <Curtain
        title={t.title}
        body={s.settings.maintenanceMessage?.trim() || t.body}
      />
    )
  }
  return <>{children}</>
}
