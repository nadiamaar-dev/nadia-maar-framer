import { useEffect, useState } from "react"

/* ══════════════════════════════════════════════════════════════════════════
   LE MISURE DEL CARICAMENTO IN CORSO, DAL BROWSER DEL VISITATORE.

   /architecture promette numeri verificabili: il modo più onesto di
   mantenerla è non scriverli affatto, e leggerli dalle Performance API del
   caricamento che il visitatore ha appena fatto. Niente da aggiornare a
   mano, niente da gonfiare — e se un giorno il sito ingrassa, questa pagina
   lo confessa da sola.

   Ogni campo è null finché non è misurabile (o se l'API manca): la UI
   distingue «sto misurando» da «questo browser non lo sa dire».
══════════════════════════════════════════════════════════════════════════ */

export type SelfMetrics = {
  /** Millisecondi dal via alla prima risposta del server. */
  ttfb: number | null
  /** First Contentful Paint, in millisecondi. */
  fcp: number | null
  /** kB di JavaScript trasferiti (compressi), bundle iniziale + frammenti. */
  jsKb: number | null
  /** Richieste di rete totali registrate finora. */
  requests: number | null
  /** Origini terze contattate PRIMA del primo dipinto: il percorso critico. */
  thirdPartyBeforePaint: number | null
}

const EMPTY: SelfMetrics = { ttfb: null, fcp: null, jsKb: null, requests: null, thirdPartyBeforePaint: null }

function read(): SelfMetrics {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
    const paint = performance.getEntriesByType("paint")
      .find(e => e.name === "first-contentful-paint")
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[]

    const fcp = paint ? Math.round(paint.startTime) : null

    /* transferSize è 0 per le risposte servite dalla cache locale: contare 0
       è corretto — al visitatore quel byte non è arrivato dalla rete. */
    const jsBytes = resources
      .filter(r => r.initiatorType === "script" || /\.m?js(\?|$)/.test(r.name))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0)

    const origin = window.location.origin
    const before = fcp === null ? resources : resources.filter(r => r.startTime < fcp)
    const foreign = new Set(
      before
        .map(r => { try { return new URL(r.name).origin } catch { return origin } })
        .filter(o => o !== origin),
    )

    return {
      ttfb: nav ? Math.round(nav.responseStart - nav.startTime) : null,
      fcp,
      jsKb: Math.round(jsBytes / 1024),
      /* +1: il documento stesso, che non compare fra le "resource". */
      requests: resources.length + (nav ? 1 : 0),
      thirdPartyBeforePaint: foreign.size,
    }
  } catch {
    return EMPTY
  }
}

export function useSelfMetrics(): SelfMetrics {
  const [m, setM] = useState<SelfMetrics>(EMPTY)

  useEffect(() => {
    /* Due letture: una appena il quadro è stabile, una tardiva che raccoglie
       i frammenti lazy arrivati dopo (questa pagina stessa è uno di loro). */
    let late: ReturnType<typeof setTimeout> | null = null
    const measure = () => { setM(read()); late = setTimeout(() => setM(read()), 2500) }

    if (document.readyState === "complete") measure()
    else {
      const onLoad = () => measure()
      window.addEventListener("load", onLoad, { once: true })
      return () => { window.removeEventListener("load", onLoad); if (late) clearTimeout(late) }
    }
    return () => { if (late) clearTimeout(late) }
  }, [])

  return m
}
