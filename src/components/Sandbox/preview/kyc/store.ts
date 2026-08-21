import { create } from "zustand"
import {
  type CampoId, type Dati, type Ubo, passoDatiValido, passoUboValido, pivaValida, sommaQuote,
} from "./schema"

/* ══════════════════════════════════════════════════════════════════════════
   ONBOARDING KYC — lo stato del flusso.

   Un solo store per i cinque passi: i dati sopravvivono all'andirivieni
   (tornare indietro non cancella niente) e ogni componente legge la fetta
   che gli serve. Stessa scelta del configuratore del sito
   (components/foundry/store.ts): una multistep è un problema di stato, non
   di routing.

   Tutto ciò che qui è «asincrono» — la visura in camera di commercio, il
   caricamento dei file, lo screening delle liste — è SIMULATO con timer.
   Le macchine a stati però sono quelle che si userebbero contro un backend
   vero, ed è il punto della demo: gli stati di confine (in corso, fallito,
   annullato, riprovabile) disegnati prima di collegare qualsiasi API.

   Il diario in fondo (`audit`) non è decorazione: un onboarding regolato
   deve poter dire chi ha fatto cosa e quando. Qui è la stessa struttura,
   con l'orologio del browser al posto di quello del server.
══════════════════════════════════════════════════════════════════════════ */

export type Step = 1 | 2 | 3 | 4 | 5
export const ULTIMO_PASSO: Step = 5

export type DocId = "visura" | "identita" | "indirizzo"
export type DocStatus = "empty" | "uploading" | "done" | "error"

export interface DocState {
  status: DocStatus
  nome: string | null
  dimensione: number
  progresso: number
  errore: string | null
  /** Impronta simulata del file: in un sistema vero sarebbe lo SHA-256 del
   *  contenuto, ed è ciò che si conserva per dimostrare che il documento
   *  archiviato è quello caricato. */
  hash: string | null
}

const DOC_VUOTO: DocState = {
  status: "empty", nome: null, dimensione: 0, progresso: 0, errore: null, hash: null,
}

export const DOCUMENTI: { id: DocId; titolo: string; nota: string }[] = [
  { id: "visura",    titolo: "Visura camerale",   nota: "Emessa da meno di 6 mesi" },
  { id: "identita",  titolo: "Documento d'identità", nota: "Del legale rappresentante, fronte e retro" },
  { id: "indirizzo", titolo: "Prova di indirizzo", nota: "Utenza o estratto conto recente" },
]

const MAX_MB = 8
const TIPI_OK = ["application/pdf", "image/jpeg", "image/png"]

/* ── screening ───────────────────────────────────────────────────────── */

export type ListaId = "sanzioni" | "pep" | "media" | "insolvenze"
export type EsitoLista = "attesa" | "corso" | "pulito" | "attenzione"

export interface ControlloLista {
  id: ListaId
  stato: EsitoLista
  /** Numero di riscontri: zero è la risposta buona. */
  riscontri: number
}

export const LISTE: { id: ListaId; titolo: string; fonte: string }[] = [
  { id: "sanzioni",   titolo: "Liste sanzionatorie",  fonte: "UE · OFAC · UK HMT" },
  { id: "pep",        titolo: "Persone politicamente esposte", fonte: "Banca dati PEP" },
  { id: "media",      titolo: "Adverse media",        fonte: "Rassegna stampa 24 mesi" },
  { id: "insolvenze", titolo: "Procedure concorsuali", fonte: "Registro imprese" },
]

export type ScreeningFase = "idle" | "corso" | "fatto"
export type Rischio = "basso" | "medio" | "alto"

/* ── diario ──────────────────────────────────────────────────────────── */

export interface VoceAudit {
  t: number
  testo: string
}

export type Esito = "idle" | "sending" | "done"
export type LookupStato = "idle" | "corso" | "trovato" | "assente"

const CHIAVE_SESSIONE = "nm-kyc-demo"

interface KycState {
  step: Step
  /** Il passo più avanti mai raggiunto: la barra non retrocede quando si
   *  torna indietro a correggere. */
  maxStep: Step
  dati: Dati
  toccati: Partial<Record<CampoId, boolean>>
  lookup: LookupStato
  ubi: Ubo[]
  docs: Record<DocId, DocState>
  liste: ControlloLista[]
  screening: ScreeningFase
  punteggio: number
  erroreVisto: boolean
  ripresa: boolean
  consenso: boolean
  esito: Esito
  protocollo: string | null
  audit: VoceAudit[]

  setCampo: (campo: CampoId, valore: string) => void
  tocca: (campo: CampoId) => void
  cercaRegistro: () => void
  vai: (s: Step) => void
  avanti: () => void
  indietro: () => void
  aggiungiUbo: () => void
  aggiornaUbo: (id: string, patch: Partial<Ubo>) => void
  rimuoviUbo: (id: string) => void
  carica: (doc: DocId, file: { name: string; size: number; type: string }) => void
  annulla: (doc: DocId) => void
  rimuovi: (doc: DocId) => void
  avviaScreening: () => void
  setConsenso: (v: boolean) => void
  invia: () => void
  ricomincia: () => void
  riprendi: () => boolean
  scarta: () => void
}

/* I timer vivono fuori dallo store: non sono stato, sono meccanica. */
const timers = new Map<string, ReturnType<typeof setInterval>>()
function fermaTimer(k: string) {
  const t = timers.get(k)
  if (t) { clearInterval(t); timers.delete(k) }
}
export function fermaTuttiITimer() {
  timers.forEach(t => clearInterval(t))
  timers.clear()
}

const DATI_VUOTI: Dati = {
  ragioneSociale: "", piva: "", email: "", pec: "", paese: "IT", settore: "", fatturato: "",
}

const uid = () => `u${Math.random().toString(36).slice(2, 9)}`

export function uboVuoto(): Ubo {
  return { id: uid(), nome: "", nascita: "", quota: 0, pep: false }
}

export const datiValidi = passoDatiValido
export const uboValidi = passoUboValido

export function documentiCompleti(docs: Record<DocId, DocState>): boolean {
  return DOCUMENTI.every(d => docs[d.id].status === "done")
}

/**
 * Il punteggio di rischio, calcolato dai dati raccolti e non estratto a
 * caso: un titolare politicamente esposto pesa, un paese extra-UE pesa, un
 * fatturato grande pesa poco ma pesa, una procedura concorsuale pesa molto.
 * È una regola dichiarata — la si può discutere, ed è esattamente ciò che
 * un compliance officer vuole poter fare.
 */
export function calcolaPunteggio(dati: Dati, ubi: Ubo[], liste: ControlloLista[]): number {
  let p = 12
  if (ubi.some(u => u.pep)) p += 34
  if (dati.paese !== "IT") p += 10
  if (dati.settore === "Servizi finanziari" || dati.settore === "Import / Export") p += 12
  if (dati.fatturato === "l") p += 6
  if (dati.fatturato === "xl") p += 12
  if (ubi.length > 3) p += 6
  for (const l of liste) p += l.riscontri * 18
  return Math.max(0, Math.min(100, p))
}

export function livelloRischio(p: number): Rischio {
  return p >= 60 ? "alto" : p >= 32 ? "medio" : "basso"
}

/* ── memoria di sessione ─────────────────────────────────────────────── */

interface Salvato {
  step: Step; maxStep: Step; dati: Dati; ubi: Ubo[]
}

function salva(s: KycState) {
  try {
    const payload: Salvato = { step: s.step, maxStep: s.maxStep, dati: s.dati, ubi: s.ubi }
    sessionStorage.setItem(CHIAVE_SESSIONE, JSON.stringify(payload))
  } catch { /* sessionStorage negato: la demo funziona lo stesso */ }
}

function leggiSalvato(): Salvato | null {
  try {
    const raw = sessionStorage.getItem(CHIAVE_SESSIONE)
    if (!raw) return null
    const p = JSON.parse(raw) as Salvato
    if (!p?.dati || typeof p.step !== "number") return null
    /* Una pratica appena iniziata non vale la pena di riprenderla. */
    if (!p.dati.ragioneSociale && !p.dati.piva) return null
    return p
  } catch { return null }
}

export function esisteBozza(): boolean { return leggiSalvato() !== null }

const ora = () => Date.now()

export const useKycStore = create<KycState>((set, get) => {
  /** Aggiunge una riga al diario evitando i doppioni consecutivi. */
  const nota = (testo: string) =>
    set(s => (s.audit[s.audit.length - 1]?.testo === testo
      ? s
      : { audit: [...s.audit, { t: ora(), testo }].slice(-40) }))

  return {
    step: 1,
    maxStep: 1,
    dati: { ...DATI_VUOTI },
    toccati: {},
    lookup: "idle",
    ubi: [uboVuoto()],
    docs: { visura: DOC_VUOTO, identita: DOC_VUOTO, indirizzo: DOC_VUOTO },
    liste: LISTE.map(l => ({ id: l.id, stato: "attesa" as EsitoLista, riscontri: 0 })),
    screening: "idle",
    punteggio: 0,
    erroreVisto: false,
    ripresa: false,
    consenso: false,
    esito: "idle",
    protocollo: null,
    audit: [],

    setCampo: (campo, valore) => {
      set(s => ({ dati: { ...s.dati, [campo]: valore } }))
      /* La partita IVA cambiata invalida la visura già scaricata. */
      if (campo === "piva") set({ lookup: "idle" })
      salva(get())
    },

    tocca: campo => set(s => ({ toccati: { ...s.toccati, [campo]: true } })),

    /* Interrogazione simulata del registro imprese: la si lancia a mano,
       riempie i campi noti e lascia gli altri all'utente. Con un backend
       vero cambierebbe solo il corpo di questa funzione. */
    cercaRegistro: () => {
      const { dati, lookup } = get()
      if (lookup === "corso" || !pivaValida(dati.piva)) return
      set({ lookup: "corso" })
      nota(`Interrogazione registro imprese · P.IVA ${dati.piva}`)
      fermaTimer("lookup")
      const t = setTimeout(() => {
        /* Lo stato si rilegge ADESSO, non dalla chiusura: fra il clic e la
           risposta l'utente può aver corretto la partita IVA, e rispondere
           sui dati vecchi sarebbe peggio che non rispondere. */
        const corrente = get()
        if (corrente.lookup !== "corso") return
        /* Deterministico sulla P.IVA: la demo dev'essere ripetibile. */
        const trovato = (corrente.dati.piva.charCodeAt(10) - 48) % 4 !== 0
        if (!trovato) {
          set({ lookup: "assente" })
          nota("Nessun riscontro nel registro: dati da inserire a mano")
          return
        }
        set(s => ({
          lookup: "trovato",
          dati: {
            ...s.dati,
            ragioneSociale: s.dati.ragioneSociale || "Aurora Living S.r.l.",
            settore: s.dati.settore || "E-commerce & Retail",
            pec: s.dati.pec || "auroraliving@pec.it",
          },
        }))
        nota("Anagrafica recuperata dal registro imprese")
        salva(get())
      }, 1200)
      timers.set("lookup", t as unknown as ReturnType<typeof setInterval>)
    },

    vai: step => {
      set(s => ({ step, maxStep: step > s.maxStep ? step : s.maxStep }))
      salva(get())
    },

    avanti: () => {
      const s = get()
      if (s.step === 1 && !datiValidi(s.dati)) {
        /* La UI tiene il pulsante spento, ma lo stato non si fida della UI:
           segna tutto come toccato così gli errori diventano visibili. */
        set({ toccati: {
          ragioneSociale: true, piva: true, email: true, pec: true,
          paese: true, settore: true, fatturato: true,
        } })
        return
      }
      if (s.step === 2 && !uboValidi(s.ubi)) return
      if (s.step === 3 && !documentiCompleti(s.docs)) return
      if (s.step === 4 && s.screening !== "fatto") return
      if (s.step < ULTIMO_PASSO) {
        const prossimo = (s.step + 1) as Step
        get().vai(prossimo)
        nota(`Passo ${prossimo} raggiunto`)
        if (prossimo === 4 && get().screening === "idle") get().avviaScreening()
      }
    },

    indietro: () => { const s = get(); if (s.step > 1) get().vai((s.step - 1) as Step) },

    /* ── titolari effettivi ── */
    aggiungiUbo: () => {
      set(s => ({ ubi: [...s.ubi, uboVuoto()] }))
      nota("Aggiunto un titolare effettivo")
      salva(get())
    },
    aggiornaUbo: (id, patch) => {
      set(s => ({ ubi: s.ubi.map(u => (u.id === id ? { ...u, ...patch } : u)) }))
      salva(get())
    },
    rimuoviUbo: id => {
      set(s => (s.ubi.length <= 1 ? s : { ubi: s.ubi.filter(u => u.id !== id) }))
      salva(get())
    },

    /* ── documenti ── */
    carica: (doc, file) => {
      fermaTimer(doc)

      /* I vincoli si conoscono subito, ma il fallimento si mostra DURANTE il
         caricamento: è così che si comporta una rete vera, ed è lo stato che
         vale la pena disegnare. */
      const troppoGrande = file.size > MAX_MB * 1024 * 1024
      const tipoSbagliato = !TIPI_OK.includes(file.type)

      set(s => ({ docs: { ...s.docs, [doc]: {
        status: "uploading", nome: file.name, dimensione: file.size,
        progresso: 0, errore: null, hash: null,
      } } }))
      nota(`Caricamento avviato · ${file.name}`)

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
                ? `Il file supera gli ${MAX_MB} MB: comprimi il PDF o esportalo di nuovo.`
                : "Formato non accettato: servono PDF, JPG o PNG.",
            } },
          }))
          nota(`Caricamento fallito · ${file.name}`)
          return
        }

        if (prossimo >= 100) {
          fermaTimer(doc)
          const hash = Array.from({ length: 8 },
            () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")
          set(s => ({ docs: { ...s.docs, [doc]: { ...stato, status: "done", progresso: 100, hash } } }))
          nota(`Documento acquisito · ${file.name} · ${hash}`)
          return
        }

        set(s => ({ docs: { ...s.docs, [doc]: { ...stato, progresso: prossimo } } }))
      }, 110)
      timers.set(doc, t)
    },

    annulla: doc => {
      fermaTimer(doc)
      set(s => ({ docs: { ...s.docs, [doc]: {
        ...s.docs[doc], status: "error", progresso: 0,
        errore: "Caricamento annullato.",
      } } }))
      nota("Caricamento annullato dall'utente")
    },

    rimuovi: doc => { fermaTimer(doc); set(s => ({ docs: { ...s.docs, [doc]: DOC_VUOTO } })) },

    /* ── screening ──────────────────────────────────────────────────────
       Lo stato si RICALCOLA dal tempo trascorso invece di avanzare a ogni
       tick. Con un contatore nella chiusura, un tick perso — la scheda
       passa in secondo piano, il browser rallenta i timer, la macchina è
       sotto carico — lasciava la verifica ferma per sempre su una lista a
       metà: successo, ed è il motivo di questa forma. Qui un tick perso
       viene semplicemente recuperato dal successivo. */
    avviaScreening: () => {
      if (get().screening === "corso") return
      fermaTimer("screening")

      const PASSO = 700
      const inizio = Date.now()
      const riscontriDi = (id: ListaId, ubi: Ubo[]) =>
        /* Il riscontro PEP non è casuale: se un titolare è stato dichiarato
           politicamente esposto, la lista lo trova. Coerenza fra ciò che
           l'utente ha detto e ciò che il sistema "scopre". */
        id === "pep" && ubi.some(u => u.pep) ? 1 : 0

      set({
        screening: "corso",
        liste: LISTE.map((l, idx) => ({
          id: l.id, riscontri: 0, stato: (idx === 0 ? "corso" : "attesa") as EsitoLista,
        })),
      })
      nota("Screening avviato su quattro fonti")

      const t = setInterval(() => {
        const s = get()
        if (s.screening !== "corso") { fermaTimer("screening"); return }

        const concluse = Math.floor((Date.now() - inizio) / PASSO)
        const liste: ControlloLista[] = LISTE.map((l, idx) => {
          if (idx < concluse) {
            const riscontri = riscontriDi(l.id, s.ubi)
            return { id: l.id, riscontri, stato: riscontri > 0 ? "attenzione" : "pulito" }
          }
          return { id: l.id, riscontri: 0, stato: idx === concluse ? "corso" : "attesa" }
        })

        if (concluse >= LISTE.length) {
          fermaTimer("screening")
          const punteggio = calcolaPunteggio(s.dati, s.ubi, liste)
          set({ liste, screening: "fatto", punteggio })
          nota(`Screening concluso · rischio ${livelloRischio(punteggio)} (${punteggio}/100)`)
          return
        }
        set({ liste })
      }, 140)
      timers.set("screening", t)
    },

    setConsenso: v => set({ consenso: v }),

    invia: () => {
      const s = get()
      if (s.esito !== "idle" || !s.consenso) return
      if (!datiValidi(s.dati) || !uboValidi(s.ubi) || !documentiCompleti(s.docs)) return
      set({ esito: "sending" })
      nota("Invio della pratica")
      /* Latenza verosimile: un invio istantaneo sembra finto quanto uno lento. */
      setTimeout(() => {
        const protocollo = `KYC-2026-${String(1000 + Math.floor(Math.random() * 8999))}`
        set({ esito: "done", protocollo })
        nota(`Pratica protocollata · ${protocollo}`)
        try { sessionStorage.removeItem(CHIAVE_SESSIONE) } catch { /* ignora */ }
      }, 1500)
    },

    ricomincia: () => {
      fermaTuttiITimer()
      try { sessionStorage.removeItem(CHIAVE_SESSIONE) } catch { /* ignora */ }
      set({
        step: 1, maxStep: 1, dati: { ...DATI_VUOTI }, toccati: {}, lookup: "idle",
        ubi: [uboVuoto()],
        docs: { visura: DOC_VUOTO, identita: DOC_VUOTO, indirizzo: DOC_VUOTO },
        liste: LISTE.map(l => ({ id: l.id, stato: "attesa" as EsitoLista, riscontri: 0 })),
        screening: "idle", punteggio: 0, erroreVisto: false, ripresa: false,
        consenso: false, esito: "idle", protocollo: null, audit: [],
      })
    },

    /* Ripresa della bozza: i documenti NON si riprendono — i file non sono
       serializzabili, e fingere di averli sarebbe una bugia. Si torna al
       passo giusto con i dati compilati. */
    riprendi: () => {
      const p = leggiSalvato()
      if (!p) return false
      const step = Math.min(p.step, 3) as Step
      set({
        dati: { ...DATI_VUOTI, ...p.dati },
        ubi: p.ubi?.length ? p.ubi : [uboVuoto()],
        step, maxStep: Math.max(step, p.maxStep ?? step) as Step,
        ripresa: true,
      })
      nota("Bozza ripresa da questa sessione")
      return true
    },

    scarta: () => {
      try { sessionStorage.removeItem(CHIAVE_SESSIONE) } catch { /* ignora */ }
      set({ ripresa: false })
    },
  }
})

export { sommaQuote }
