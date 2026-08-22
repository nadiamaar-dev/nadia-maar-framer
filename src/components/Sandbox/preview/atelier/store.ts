import { create } from "zustand"
import {
  type AccessorioId, type Configurazione, CONFIG_INIZIALE, accessorioDi,
  metalloDi, misuraDi, pelleDi, prezzoBorsa,
} from "./model"

/* ══════════════════════════════════════════════════════════════════════════
   ATELIER — lo stato: configurazione, carrello, cassa.

   Il carrello è una lista di righe già prezzate: la borsa entra con la sua
   configurazione congelata (cambiare l'atelier DOPO non tocca ciò che è già
   nella busta), gli accessori entrano per riferimento con la quantità.

   La cassa è una macchina a stati esplicita: carrello → pagamento in corso
   → confermato. Il «pagamento» è una recita dichiarata — nessun PSP viene
   chiamato — ma la recita segue i tempi veri di un foglio Apple Pay, perché
   è proprio la sensazione di quel passaggio che la demo deve vendere.
══════════════════════════════════════════════════════════════════════════ */

export interface RigaBorsa {
  tipo: "borsa"
  chiave: string
  config: Configurazione
  prezzo: number
  qty: number
}

export interface RigaAccessorio {
  tipo: "accessorio"
  chiave: string
  accessorio: AccessorioId
  prezzo: number
  qty: number
}

export type Riga = RigaBorsa | RigaAccessorio

export type Metodo = "apple" | "google" | "carta"
export type Cassa =
  | { fase: "carrello" }
  | { fase: "pagamento"; metodo: Metodo }
  | { fase: "confermato"; ordine: string; totale: number }

interface AtelierState {
  config: Configurazione
  righe: Riga[]
  aperto: boolean
  cassa: Cassa
  /* Un contatore, non un timestamp: il numero d'ordine deve restare uguale
     fra due render e fra due esecuzioni del test. */
  progressivo: number

  scegli: (patch: Partial<Configurazione>) => void
  aggiungiBorsa: () => void
  aggiungiAccessorio: (id: AccessorioId) => void
  cambiaQty: (chiave: string, delta: number) => void
  rimuovi: (chiave: string) => void
  apri: () => void
  chiudi: () => void
  paga: (metodo: Metodo) => void
  conferma: () => void
  nuovoOrdine: () => void
}

/** La chiave di riga di una borsa: due configurazioni uguali si sommano. */
function chiaveBorsa(c: Configurazione): string {
  return ["borsa", c.misura, c.pelle, c.metallo, c.monogramma.trim().toUpperCase()].join("|")
}

export function subtotale(righe: Riga[]): number {
  return righe.reduce((t, r) => t + r.prezzo * r.qty, 0)
}

export function pezzi(righe: Riga[]): number {
  return righe.reduce((t, r) => t + r.qty, 0)
}

/** La descrizione di riga che compare nel carrello, già in italiano. */
export function descriviRiga(r: Riga): { nome: string; dettaglio: string } {
  if (r.tipo === "accessorio") {
    const a = accessorioDi(r.accessorio)
    return { nome: a.nome, dettaglio: a.materia }
  }
  const c = r.config
  const parti = [misuraDi(c.misura).nome, pelleDi(c.pelle).nome, metalloDi(c.metallo).nome]
  if (c.monogramma.trim()) parti.push(`iniziali ${c.monogramma.trim().toUpperCase()}`)
  return { nome: "Borsa Vela", dettaglio: parti.join(" · ") }
}

export const useAtelier = create<AtelierState>((set, get) => ({
  config: CONFIG_INIZIALE,
  righe: [],
  aperto: false,
  cassa: { fase: "carrello" },
  progressivo: 0,

  scegli: patch => set(s => ({
    config: {
      ...s.config,
      ...patch,
      /* Le iniziali: solo lettere, al massimo tre, sempre maiuscole. */
      ...(patch.monogramma !== undefined
        ? { monogramma: patch.monogramma.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() }
        : {}),
    },
  })),

  aggiungiBorsa: () => set(s => {
    const chiave = chiaveBorsa(s.config)
    const esiste = s.righe.find(r => r.chiave === chiave)
    const righe = esiste
      ? s.righe.map(r => r.chiave === chiave ? { ...r, qty: r.qty + 1 } : r)
      : [...s.righe, {
        tipo: "borsa" as const, chiave,
        config: { ...s.config, monogramma: s.config.monogramma.trim().toUpperCase() },
        prezzo: prezzoBorsa(s.config), qty: 1,
      }]
    return { righe, aperto: true, cassa: { fase: "carrello" as const } }
  }),

  aggiungiAccessorio: id => set(s => {
    const chiave = `acc|${id}`
    const esiste = s.righe.find(r => r.chiave === chiave)
    const righe = esiste
      ? s.righe.map(r => r.chiave === chiave ? { ...r, qty: r.qty + 1 } : r)
      : [...s.righe, { tipo: "accessorio" as const, chiave, accessorio: id, prezzo: accessorioDi(id).prezzo, qty: 1 }]
    return { righe, aperto: true, cassa: { fase: "carrello" as const } }
  }),

  cambiaQty: (chiave, delta) => set(s => ({
    righe: s.righe
      .map(r => r.chiave === chiave ? { ...r, qty: r.qty + delta } : r)
      .filter(r => r.qty > 0),
  })),

  rimuovi: chiave => set(s => ({ righe: s.righe.filter(r => r.chiave !== chiave) })),

  apri: () => set({ aperto: true }),
  chiudi: () => set(s => ({
    aperto: false,
    /* Chiudere il cassetto a metà pagamento annulla la recita, non l'ordine:
       le righe restano, si ricomincia dal carrello. */
    cassa: s.cassa.fase === "pagamento" ? { fase: "carrello" } : s.cassa,
  })),

  paga: metodo => {
    if (get().righe.length === 0) return
    set({ cassa: { fase: "pagamento", metodo } })
  },

  conferma: () => set(s => {
    if (s.cassa.fase !== "pagamento") return s
    const n = s.progressivo + 1
    /* Il numero d'ordine è teatro, ma teatro coerente: progressivo di
       sessione, niente date né casualità che cambierebbero a ogni render. */
    const ordine = `MA-26-${String(1207 + n * 13).padStart(4, "0")}`
    return {
      progressivo: n,
      cassa: { fase: "confermato", ordine, totale: subtotale(s.righe) },
      righe: [],
    }
  }),

  nuovoOrdine: () => set({ cassa: { fase: "carrello" }, aperto: false }),
}))
