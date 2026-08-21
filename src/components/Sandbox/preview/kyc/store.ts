import { create } from "zustand"
import { type CampoId, type Dati, passoDatiValido } from "./schema"

/* ══════════════════════════════════════════════════════════════════════════
   ONBOARDING KYC — lo stato del flusso.

   Un solo store per i tre passi: i dati sopravvivono all'andirivieni
   (tornare indietro non cancella niente) e ogni componente legge solo la
   fetta che gli serve. Stessa scelta del configuratore del sito
   (components/foundry/store.ts): la multistep è un problema di stato, non
   di routing.

   Il caricamento dei documenti è SIMULATO: un timer che avanza il progresso
   come farebbe una rete vera, con tanto di errore quando il file non
   rispetta i vincoli. La macchina a stati però è quella che si userebbe con
   un backend reale — empty → uploading → done | error — ed è il punto della
   demo: gli stati di confine disegnati PRIMA di collegare l'API.
══════════════════════════════════════════════════════════════════════════ */

export type Step = 1 | 2 | 3

export type DocId = "visura" | "identita" | "indirizzo"

export type DocStatus = "empty" | "uploading" | "done" | "error"

export interface DocState {
  status: DocStatus
  nome: string | null
  dimensione: number
  progresso: number       // 0..100
  errore: string | null
}

const DOC_VUOTO: DocState = { status: "empty", nome: null, dimensione: 0, progresso: 0, errore: null }

export const DOCUMENTI: { id: DocId; titolo: string; nota: string }[] = [
  { id: "visura",   titolo: "Visura camerale",       nota: "Emessa da meno di 6 mesi" },
  { id: "identita", titolo: "Documento del legale rappresentante", nota: "Fronte e retro, leggibile" },
  { id: "indirizzo", titolo: "Prova di indirizzo",   nota: "Utenza o estratto conto recente" },
]

const MAX_MB = 8
const TIPI_OK = ["application/pdf", "image/jpeg", "image/png"]

export type Esito = "idle" | "sending" | "done"

interface KycState {
  step: Step
  /** Il passo più avanti mai raggiunto: la barra di avanzamento non
   *  retrocede quando si torna a correggere. */
  maxStep: Step
  dati: Dati
  /** Un errore si mostra solo per i campi «toccati»: la pagina non accoglie
   *  con cinque righe rosse. */
  toccati: Partial<Record<CampoId, boolean>>
  docs: Record<DocId, DocState>
  /** True appena un caricamento fallisce: la demo lo conta come capacità
   *  esercitata («ho visto un errore gestito»). */
  erroreVisto: boolean
  consenso: boolean
  esito: Esito

  setCampo: (campo: CampoId, valore: string) => void
  tocca: (campo: CampoId) => void
  vai: (s: Step) => void
  avanti: () => void
  indietro: () => void
  carica: (doc: DocId, file: { name: string; size: number; type: string }) => void
  rimuovi: (doc: DocId) => void
  setConsenso: (v: boolean) => void
  invia: () => void
  ricomincia: () => void
}

/* I timer vivono fuori dallo store: non sono stato, sono meccanica. */
const timers = new Map<DocId, ReturnType<typeof setInterval>>()

function fermaTimer(doc: DocId) {
  const t = timers.get(doc)
  if (t) { clearInterval(t); timers.delete(doc) }
}

export function datiValidi(dati: Dati): boolean {
  return passoDatiValido(dati)
}

export function documentiCompleti(docs: Record<DocId, DocState>): boolean {
  return DOCUMENTI.every(d => docs[d.id].status === "done")
}

export const useKycStore = create<KycState>((set, get) => ({
  step: 1,
  maxStep: 1,
  dati: { ragioneSociale: "", piva: "", email: "", pec: "", settore: "" },
  toccati: {},
  docs: { visura: DOC_VUOTO, identita: DOC_VUOTO, indirizzo: DOC_VUOTO },
  erroreVisto: false,
  consenso: false,
  esito: "idle",

  setCampo: (campo, valore) =>
    set(s => ({ dati: { ...s.dati, [campo]: valore } })),

  tocca: campo => set(s => ({ toccati: { ...s.toccati, [campo]: true } })),

  vai: step => set(s => ({ step, maxStep: step > s.maxStep ? step : s.maxStep })),

  avanti: () => {
    const s = get()
    if (s.step === 1 && !datiValidi(s.dati)) {
      /* Avanzare con dati invalidi non è previsto dalla UI (pulsante
         spento), ma lo stato non si fida della UI: segna tutto come
         toccato, così gli errori si vedono. */
      set({ toccati: { ragioneSociale: true, piva: true, email: true, pec: true, settore: true } })
      return
    }
    if (s.step === 2 && !documentiCompleti(s.docs)) return
    if (s.step < 3) get().vai((s.step + 1) as Step)
  },

  indietro: () => { const s = get(); if (s.step > 1) get().vai((s.step - 1) as Step) },

  carica: (doc, file) => {
    fermaTimer(doc)

    /* I vincoli si controllano subito, ma il fallimento si mostra DURANTE
       il caricamento: è così che si comporta una rete vera, ed è lo stato
       che vale la pena disegnare. */
    const troppoGrande = file.size > MAX_MB * 1024 * 1024
    const tipoSbagliato = !TIPI_OK.includes(file.type)

    set(s => ({ docs: { ...s.docs, [doc]: {
      status: "uploading", nome: file.name, dimensione: file.size, progresso: 0, errore: null,
    } } }))

    const t = setInterval(() => {
      const stato = get().docs[doc]
      if (stato.status !== "uploading") { fermaTimer(doc); return }
      const prossimo = Math.min(stato.progresso + 7 + Math.round(Math.random() * 9), 100)

      if ((troppoGrande || tipoSbagliato) && prossimo >= 44) {
        fermaTimer(doc)
        set(s => ({
          erroreVisto: true,
          docs: { ...s.docs, [doc]: {
            ...stato, status: "error", progresso: 0,
            errore: troppoGrande
              ? `Il file supera gli ${MAX_MB} MB: comprimi o esporta di nuovo.`
              : "Formato non accettato: servono PDF, JPG o PNG.",
          } },
        }))
        return
      }

      if (prossimo >= 100) {
        fermaTimer(doc)
        set(s => ({ docs: { ...s.docs, [doc]: { ...stato, status: "done", progresso: 100 } } }))
        return
      }

      set(s => ({ docs: { ...s.docs, [doc]: { ...stato, progresso: prossimo } } }))
    }, 120)
    timers.set(doc, t)
  },

  rimuovi: doc => { fermaTimer(doc); set(s => ({ docs: { ...s.docs, [doc]: DOC_VUOTO } })) },

  setConsenso: v => set({ consenso: v }),

  invia: () => {
    const s = get()
    if (s.esito !== "idle" || !s.consenso) return
    if (!datiValidi(s.dati) || !documentiCompleti(s.docs)) return
    set({ esito: "sending" })
    /* Latenza verosimile: un invio istantaneo sembra finto quanto uno lento. */
    setTimeout(() => set({ esito: "done" }), 1400)
  },

  ricomincia: () => {
    DOCUMENTI.forEach(d => fermaTimer(d.id))
    set({
      step: 1, maxStep: 1,
      dati: { ragioneSociale: "", piva: "", email: "", pec: "", settore: "" },
      toccati: {},
      docs: { visura: DOC_VUOTO, identita: DOC_VUOTO, indirizzo: DOC_VUOTO },
      erroreVisto: false, consenso: false, esito: "idle",
    })
  },
}))
