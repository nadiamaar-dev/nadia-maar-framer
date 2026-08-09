import { useEffect, useState } from "react"
import {
  DEFAULT_PUBLIC_SETTINGS, getCachedSiteSettings, getSiteSettings, type PublicSiteSettings,
} from "./siteSettings"

/* ══════════════════════════════════════════════════════════════════════════
   Le impostazioni pubbliche dentro un componente.

   Parte dalla cache di sessione, che è sincrona: dalla seconda pagina in
   poi il primo render sa già la verità, e non si vede comparire e poi
   sparire una voce di menu.

   Alla primissima visita la cache è vuota e si assume il valore
   predefinito — cioè «tutto acceso», che è il caso normale. L'alternativa
   (assumere spento) farebbe lampeggiare in negativo ogni caricamento di
   ogni visitatore per coprire un caso raro.
══════════════════════════════════════════════════════════════════════════ */

export function useSiteSettings(): PublicSiteSettings {
  const [s, setS] = useState<PublicSiteSettings>(() => getCachedSiteSettings() ?? DEFAULT_PUBLIC_SETTINGS)

  useEffect(() => {
    let alive = true
    getSiteSettings()
      .then(v => { if (alive) setS(v) })
      .catch(() => { /* si tiene quello che c'è */ })
    return () => { alive = false }
  }, [])

  return s
}

/**
 * `/foundry` — la pagina Lab, la galleria degli esperimenti — è accesa?
 *
 * ATTENZIONE, distinzione che si sbaglia facilmente: questo interruttore
 * riguarda QUELLA pagina e i collegamenti che ci portano. NON riguarda il
 * configuratore incorporato in home, in /contatti e nelle pagine servizio,
 * che è un componente diverso e continua a funzionare.
 */
export function useFoundryEnabled(): boolean {
  return useSiteSettings().foundryEnabled
}
