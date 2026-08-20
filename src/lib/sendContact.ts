/* ══════════════════════════════════════════════════════════════════════════
   INVIO DEL MODULO CONTATTI (lato browser)
   Un solo punto di uscita per tutti i moduli del sito: i tre modali sparsi
   fra home, About e pagine servizio, più la pagina /contatti.

   Prima ogni modale faceva `e.preventDefault(); setSent(true)` e mostrava il
   ringraziamento senza spedire niente: chi scriveva era convinto di aver
   contattato lo studio. Qui la richiesta parte davvero.
══════════════════════════════════════════════════════════════════════════ */

import { firstTouch, sessionId, trackEvent } from "./measure"

export type ContactPayload = {
  name: string
  email: string
  company?: string
  message: string
  /** honeypot: se valorizzato è un bot */
  website?: string
}

/** Campi accessori dei modali (sito, area d'interesse): non hanno una colonna
 *  dedicata, ma buttarli via significherebbe perdere quello che il visitatore
 *  ha scritto. Finiscono in coda al messaggio. */
export function withExtras(message: string, extras: Record<string, string | undefined>): string {
  const tail = Object.entries(extras)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v!.trim()}`)
    .join("\n")
  return tail ? `${message.trim()}\n\n—\n${tail}` : message.trim()
}

/**
 * true = la richiesta è arrivata (archiviata e/o notificata).
 * In `vite dev` le funzioni Vercel non esistono e l'endpoint risponde 404:
 * solo quel caso viene simulato, così i moduli restano provabili in locale.
 * Ogni altro stato HTTP resta un errore vero anche in sviluppo.
 */
export async function sendContact(p: ContactPayload): Promise<boolean> {
  const body = JSON.stringify({
    ...p,
    page: typeof location !== "undefined" ? location.pathname : "/",
    /* attribuzione del primo tocco + sessione: vedi measure.ts. L'endpoint
       li valida e li scrive nelle colonne dedicate del lead. */
    session: sessionId(),
    touch: firstTouch(),
  })

  let r: Response
  try {
    r = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    })
  } catch {
    if (import.meta.env.DEV) {
      console.info("[contatti] DEV — endpoint assente, invio simulato:", p)
      return true
    }
    return false
  }

  if (r.ok) {
    trackEvent("lead_submit", { source: "contatti" })
    return true
  }
  if (import.meta.env.DEV && r.status === 404) {
    console.info("[contatti] DEV — endpoint assente, invio simulato:", p)
    return true
  }
  return false
}
