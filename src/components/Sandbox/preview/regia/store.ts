import { useCallback, useEffect, useState } from "react"
import { create } from "zustand"
import { ECCEZIONI, ORDINI, type StatoOrdine } from "./model"

/* ══════════════════════════════════════════════════════════════════════════
   REGIA — lo stato di scena.

   Due meccanismi, separati apposta:

   1. LA MAREA (zustand) — la lente degli ordini che scorre da sola, i
      contatori che salgono, le eccezioni che si risolvono. È il «prodotto
      che lavora» e va avanti qualunque cosa il visitatore guardi.

   2. LA PROVA (hook locale) — l'ordine che il visitatore fa attraversare
      alla regia col pulsante: quattro nodi, un log per nodo, un esito.
      È un giro solo, guidato, e riparte da capo a ogni pressione.

   Regola ereditata dal KYC: MAI un contatore dentro setInterval — sotto
   carico perde colpi. Ogni avanzamento si ricava dal tempo trascorso.
══════════════════════════════════════════════════════════════════════════ */

export interface RigaFeed {
  ordine: typeof ORDINI[number]
  stato: StatoOrdine
  /** Indice d'arrivo: serve alla riga per sapere quanto è giovane. */
  n: number
}

interface RegiaState {
  feed: RigaFeed[]
  arrivati: number
  sincronizzati: number
  eccezioniAperte: string[]
  eccezioniRisolte: string[]
  /* L'eccezione in corso di rimedio: id → quante righe del rimedio sono
     già state mostrate. */
  rimedioInCorso: { id: string; passo: number } | null

  batte: () => void
  risolvi: (id: string) => void
  avanzaRimedio: () => void
}

const MAX_RIGHE = 6

export const useRegia = create<RegiaState>((set, get) => ({
  feed: [],
  arrivati: 0,
  sincronizzati: 0,
  eccezioniAperte: ECCEZIONI.map(e => e.id),
  eccezioniRisolte: [],
  rimedioInCorso: null,

  /* Un battito della marea: entra un ordine nuovo, i vecchi maturano.
     ricevuto → sincronizzato → in consegna, una tacca per battito. */
  batte: () => set(s => {
    const prossimo = ORDINI[s.arrivati % ORDINI.length]
    const maturati: RigaFeed[] = s.feed.map(r => ({
      ...r,
      stato: r.stato === "ricevuto" ? "sincronizzato" as const
        : r.stato === "sincronizzato" ? "in consegna" as const : r.stato,
    }))
    const feed = [{ ordine: prossimo, stato: "ricevuto" as const, n: s.arrivati }, ...maturati].slice(0, MAX_RIGHE)
    return {
      feed,
      arrivati: s.arrivati + 1,
      sincronizzati: s.sincronizzati + (s.feed.some(r => r.stato === "ricevuto") ? 1 : 0),
    }
  }),

  risolvi: id => {
    const s = get()
    if (s.rimedioInCorso || !s.eccezioniAperte.includes(id)) return
    set({ rimedioInCorso: { id, passo: 0 } })
  },

  /* Chiamato a cadenza dall'esterno: mostra la riga successiva del
     rimedio e, finite le righe, archivia l'eccezione. */
  avanzaRimedio: () => set(s => {
    if (!s.rimedioInCorso) return s
    const ecc = ECCEZIONI.find(e => e.id === s.rimedioInCorso!.id)!
    const passo = s.rimedioInCorso.passo + 1
    if (passo < ecc.rimedio.length) return { rimedioInCorso: { id: ecc.id, passo } }
    return {
      rimedioInCorso: null,
      eccezioniAperte: s.eccezioniAperte.filter(x => x !== ecc.id),
      eccezioniRisolte: [...s.eccezioniRisolte, ecc.id],
    }
  }),
}))

/** Il battito della marea e l'avanzare dei rimedi, agganciati al montaggio. */
export function useMarea() {
  const batte = useRegia(s => s.batte)
  const avanzaRimedio = useRegia(s => s.avanzaRimedio)
  const rimedio = useRegia(s => s.rimedioInCorso)

  useEffect(() => {
    /* Primo battito subito: una tabella vuota per due secondi sembra un
       segnaposto rotto, non una demo dal vivo. */
    batte()
    const t = setInterval(batte, 2600)
    return () => clearInterval(t)
  }, [batte])

  useEffect(() => {
    if (!rimedio) return
    const t = setInterval(avanzaRimedio, 750)
    return () => clearInterval(t)
  }, [rimedio, avanzaRimedio])
}

/* ══════════════════════════════════════════════════════════════════════════
   LA PROVA — un ordine attraversa i quattro nodi sotto gli occhi di chi
   guarda. Stato derivato dal tempo, non da un contatore.
══════════════════════════════════════════════════════════════════════════ */

export interface ProvaApi {
  /** −1 = ferma; 0..3 = nodo attivo; 4 = arrivata in fondo. */
  passo: number
  inCorsa: boolean
  avvia: () => void
}

const PASSO_MS = 1350

export function useProva(): ProvaApi {
  const [passo, setPasso] = useState(-1)
  /* Ogni pressione di «avvia» è una corsa nuova: l'effetto riparte sul
     numero di corsa, e il progresso si ricava dal tempo trascorso. */
  const [corsa, setCorsa] = useState(0)

  useEffect(() => {
    if (corsa === 0) return
    const inizio = performance.now()
    let raf = 0
    const tick = () => {
      const p = Math.min(4, Math.floor((performance.now() - inizio) / PASSO_MS))
      setPasso(p)
      if (p < 4) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [corsa])

  const avvia = useCallback(() => { setPasso(0); setCorsa(c => c + 1) }, [])

  return { passo, inCorsa: passo >= 0 && passo < 4, avvia }
}
