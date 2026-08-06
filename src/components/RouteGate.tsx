import React, { useEffect, useState } from "react"
import Background from "./Background"
import { DEFAULT_PUBLIC_SETTINGS, getSiteSettings, type PublicSiteSettings } from "../lib/siteSettings"

/* ══════════════════════════════════════════════════════════════════════════
   INTERRUTTORI DI ROTTA.

   `foundry_enabled` e `maintenance_mode` decidono cosa il sito mostra. Su
   Next.js questo controllo starebbe in un middleware, prima ancora della
   risposta; qui il sito è un'applicazione a rendering client servita da un
   rewrite statico, quindi il controllo avviene appena l'app parte. La
   differenza pratica: chi ha JavaScript disattivato o legge l'HTML grezzo
   vede il guscio vuoto, non la pagina.

   Per questo lo spegnimento NON si ferma alla facciata: /api/foundry-lead
   rifiuta le richieste quando l'interruttore è giù. Se il senso di spegnere
   /foundry è «non voglio ricevere configurazioni», quel senso è rispettato
   dal server, non dalla schermata.
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
        <a href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
          padding: "11px 20px", borderRadius: 99,
          background: "linear-gradient(90deg, rgba(184,50,64,0.34), rgba(184,50,64,0.20))",
          border: "1px solid rgba(184,50,64,0.80)", color: "#FFFFFF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 700,
        }}>
          Torna alla home
        </a>
      </div>
    </div>
  )
}

/** Nessuno spinner: la lettura dura pochi millisecondi e un lampo di
 *  «caricamento» prima di ogni pagina costa più di quanto renda. */
const Blank = () => <div style={{ minHeight: "100vh", background: "#121418" }} aria-hidden />

/** Avvolge /foundry. */
export function FoundryGate({ children }: { children: React.ReactNode }) {
  const s = useSiteSettings()
  if (s.phase === "loading") return <Blank />
  if (!s.settings.foundryEnabled) {
    return (
      <Curtain
        title="Configuratore non disponibile"
        body="Il Digital Foundry è temporaneamente chiuso. Per un preventivo scrivimi dalla pagina contatti: rispondo entro 24 ore."
      />
    )
  }
  return <>{children}</>
}

/** Avvolge il sito pubblico. L'area riservata resta raggiungibile: la
 *  manutenzione riguarda i visitatori, non i clienti che hanno un progetto
 *  in corso e le loro fatture da consultare. */
export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const s = useSiteSettings()
  if (s.phase === "loading") return <Blank />
  if (s.settings.maintenanceMode) {
    return (
      <Curtain
        title="Torniamo fra poco"
        body={s.settings.maintenanceMessage?.trim() || "Stiamo aggiornando il sito. L'area clienti resta accessibile su /cabinet."}
      />
    )
  }
  return <>{children}</>
}
