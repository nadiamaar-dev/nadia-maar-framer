import { create } from "zustand"
import { baseFor, type VectorId } from "./modules"
import { trackEvent } from "../../lib/measure"

/* ══════════════════════════════════════════════════════════════════════════
   SOLUTION ARCHITECT — stato globale (Zustand)
   Passi 1→4, vettore, selezione moduli, stato del flusso lead.
   Nessun prezzo, nessun carrello.
══════════════════════════════════════════════════════════════════════════ */

export type Step = 1 | 2 | 3 | 4
export type LeadStatus = "idle" | "sending" | "sent" | "error"

type State = {
  step: Step
  vector: VectorId | null
  selected: string[]
  activeGroup: string
  modalOpen: boolean
  /** incrementato a ogni apertura: identifica l'invio in corso */
  openSeq: number
  leadStatus: LeadStatus

  setStep: (s: Step) => void
  next: () => void
  back: () => void
  pickVector: (v: VectorId) => void
  toggle: (id: string) => void
  setActiveGroup: (g: string) => void
  reset: () => void
  openModal: () => void
  closeModal: () => void
  setLeadStatus: (s: LeadStatus) => void
}

/* L'avanzamento si misura QUI e non nei componenti: lo stato cambia in un
   posto solo, quindi l'evento parte una volta sola — da qualunque pulsante,
   scorciatoia o pre-selezione arrivi il cambio. `config_step` con il numero
   del passo raggiunto è ciò che permette di vedere DOVE la gente si ferma:
   il passo 3 mai raggiunto e il passo 3 abbandonato sono due problemi
   diversi con due rimedi diversi. */
const misuraPasso = (step: Step, vector: VectorId | null) =>
  trackEvent("config_step", { step, vector })

export const useFoundryStore = create<State>((set, get) => ({
  step: 1,
  vector: null,
  selected: [],
  activeGroup: "control",
  modalOpen: false,
  openSeq: 0,
  leadStatus: "idle",

  setStep: s => {
    if (s !== get().step) misuraPasso(s, get().vector)
    set({ step: s })
  },
  next: () => {
    const st = get()
    const dopo = Math.min(4, st.step + 1) as Step
    if (dopo !== st.step) misuraPasso(dopo, st.vector)
    set({ step: dopo })
  },
  /* il ritorno indietro non si misura: la voronka guarda l'avanzamento,
     e contare i ripensamenti come progresso gonfierebbe i numeri */
  back: () => set(st => ({ step: Math.max(1, st.step - 1) as Step })),

  /* cambiando vettore le funzionalità base del vettore precedente non hanno
     più senso: restano solo i moduli aggiuntivi, che sono trasversali */
  pickVector: v => {
    const prev = get().vector
    if (get().step === 1) misuraPasso(2, v)
    if (prev === v) { set({ step: 2 }); return }
    const baseIds = new Set(baseFor(prev).map(i => i.id))
    set(st => ({ vector: v, selected: st.selected.filter(id => !baseIds.has(id)), step: 2 }))
  },

  toggle: id =>
    set(st => ({
      selected: st.selected.includes(id) ? st.selected.filter(x => x !== id) : [...st.selected, id],
    })),

  setActiveGroup: g => set({ activeGroup: g }),
  reset: () => set({ step: 1, vector: null, selected: [], activeGroup: "control", leadStatus: "idle" }),

  openModal: () => set(st => ({ modalOpen: true, leadStatus: "idle", openSeq: st.openSeq + 1 })),
  closeModal: () => set({ modalOpen: false }),
  setLeadStatus: s => set({ leadStatus: s }),
}))
