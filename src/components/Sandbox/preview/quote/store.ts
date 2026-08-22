import { create } from "zustand"
import {
  type Attivita, ATTIVITA_INIZIALE, FASI, GIORNI_PER_SETTIMANA, MODULI, type Modulo, type ModuloId,
  PIATTAFORME, type PiattaformaId, PRESET, RATE, type RegimeId, REGIMI,
} from "./model"

/* ══════════════════════════════════════════════════════════════════════════
   PREVENTIVO & ROI — lo stato e i conti.

   Regola di questo file: NIENTE numeri scritti nei componenti. Il preventivo
   si ricalcola per intero a ogni cambiamento, da una funzione pura che
   prende le scelte e restituisce righe, totale, tempi e ritorno. La UI
   disegna ciò che trova: se un giorno il listino cambia, non si tocca un
   solo componente.

   Le dipendenze fra i passi vivono in `statoModulo`: è l'unico posto che
   decide se una voce è scegliibile, e il motivo per cui non lo è. Un
   modulo spento senza spiegazione è una scelta di prodotto sbagliata —
   chi configura vuole sapere perché quella casella non si accende.
══════════════════════════════════════════════════════════════════════════ */

export type Passo = 1 | 2 | 3 | 4
export const ULTIMO_PASSO: Passo = 4

export type DisponibilitaModulo =
  | { stato: "ok" }
  | { stato: "escluso"; motivo: string }
  | { stato: "richiede"; modulo: Modulo }

export interface RigaPreventivo {
  id: string
  voce: string
  dettaglio: string
  prezzo: number
  giorni: number
  /** Vero se il prezzo è stato modificato dalle scelte a monte: la riga lo
   *  dichiara invece di far quadrare i conti in silenzio. */
  rettificata?: boolean
}

export interface Ritorno {
  /** Euro al mese liberati dal lavoro manuale tolto di mezzo. */
  risparmioOre: number
  /** Euro al mese non più persi per disallineamento di magazzino. */
  recuperoErrori: number
  risparmioMensile: number
  /** Mesi per rientrare dell'investimento. `null` se non c'è ritorno. */
  rientro: number | null
  oreTolte: number
}

export interface Preventivo {
  righe: RigaPreventivo[]
  totale: number
  giorni: number
  settimane: number
  ritorno: Ritorno
}

/** La fotografia di una configurazione: quanto basta per rifarla identica.
 *  Serve sia allo storico (per annullare) sia agli scenari (per
 *  confrontare due strade senza perdere la prima). */
export interface Scatto {
  piattaforma: PiattaformaId | null
  moduli: ModuloId[]
  regime: RegimeId | null
}

export interface Scenario extends Scatto {
  id: string
  nome: string
  totale: number
  giorni: number
  rientro: number | null
}

interface QuoteState {
  passo: Passo
  maxPasso: Passo
  piattaforma: PiattaformaId | null
  moduli: ModuloId[]
  regime: RegimeId | null
  attivita: Attivita
  /** Cresce a ogni ricalcolo: la UI se ne serve per far pulsare il totale
   *  solo quando cambia davvero. */
  revisione: number
  /** Le configurazioni precedenti, dalla più vecchia alla più recente.
   *  Non è un log: è ciò che rende annullabile ogni scelta. */
  storico: Scatto[]
  /** I totali nell'ordine in cui sono stati raggiunti: alimenta lo
   *  sparkline, che mostra come il preventivo è cresciuto o calato mentre
   *  si configurava. Un grafico che nasce dall'uso, non da dati finti. */
  serieTotali: number[]
  /** Configurazioni messe da parte per il confronto A/B. */
  scenari: Scenario[]

  scegliPiattaforma: (id: PiattaformaId) => void
  alternaModulo: (id: ModuloId) => void
  scegliRegime: (id: RegimeId) => void
  setAttivita: (patch: Partial<Attivita>) => void
  vai: (p: Passo) => void
  avanti: () => void
  indietro: () => void
  azzera: () => void
  annulla: () => void
  applicaPreset: (id: string) => void
  salvaScenario: () => void
  ripristinaScenario: (id: string) => void
  eliminaScenario: (id: string) => void
}

const moduloDi = (id: ModuloId) => MODULI.find(m => m.id === id)!

/** Prezzo di un modulo SU una piattaforma, con il ritocco del regime per
 *  chi scambia dati con l'esterno. */
export function prezzoModulo(m: Modulo, p: PiattaformaId | null, regime: RegimeId | null): {
  prezzo: number; rettificato: boolean
} {
  const base = (p && m.prezzoPer?.[p]) ?? m.prezzo
  let prezzo = base
  let rettificato = base !== m.prezzo

  if (m.integra) {
    const piatt = PIATTAFORME.find(x => x.id === p)
    const reg = REGIMI.find(x => x.id === regime)
    const fattore = (piatt?.fattoreIntegrazione ?? 1) * (reg?.fattore ?? 1)
    if (fattore !== 1) { prezzo = Math.round(prezzo * fattore); rettificato = true }
  }
  return { prezzo, rettificato }
}

/** Se un modulo si può scegliere, e in caso contrario perché no. */
export function statoModulo(m: Modulo, p: PiattaformaId | null, scelti: ModuloId[]): DisponibilitaModulo {
  const motivo = p ? m.esclusoDa?.[p] : undefined
  if (motivo) return { stato: "escluso", motivo }
  if (m.richiede && !scelti.includes(m.richiede)) {
    return { stato: "richiede", modulo: moduloDi(m.richiede) }
  }
  return { stato: "ok" }
}

/** Il regime ha senso solo se c'è qualcosa da sincronizzare. */
export function serveRegime(scelti: ModuloId[]): boolean {
  return scelti.some(id => moduloDi(id).integra)
}

/* ── il calcolo, tutto in un posto ───────────────────────────────────── */

export function calcola(
  piattaformaId: PiattaformaId | null,
  moduliScelti: ModuloId[],
  regimeId: RegimeId | null,
  attivita: Attivita,
): Preventivo {
  const righe: RigaPreventivo[] = []
  const piattaforma = PIATTAFORME.find(p => p.id === piattaformaId) ?? null

  if (piattaforma) {
    righe.push({
      id: `piattaforma:${piattaforma.id}`,
      voce: piattaforma.nome,
      dettaglio: `Impianto, modello dati e messa in produzione · ${piattaforma.giorni} gg`,
      prezzo: piattaforma.prezzo,
      giorni: piattaforma.giorni,
    })
  }

  for (const id of moduliScelti) {
    const m = moduloDi(id)
    const { prezzo, rettificato } = prezzoModulo(m, piattaformaId, regimeId)
    righe.push({
      id: `modulo:${m.id}`,
      voce: m.nome,
      dettaglio: rettificato
        ? `Prezzo adeguato alla piattaforma e al regime scelti · ${m.giorni} gg`
        : `${m.giorni} gg`,
      prezzo, giorni: m.giorni, rettificata: rettificato,
    })
  }

  const totale = righe.reduce((t, r) => t + r.prezzo, 0)
  const giorni = righe.reduce((t, r) => t + r.giorni, 0)

  /* ── il ritorno ────────────────────────────────────────────────────────
     Due sole fonti, entrambe verificabili dal cliente sui propri numeri:
     le ore che spariscono e gli ordini che smettono di andare persi. Niente
     "aumento del fatturato del 30%": quello non lo sa nessuno. */
  const oreLorde = moduliScelti.reduce((t, id) => t + (moduloDi(id).oreRisparmiate ?? 0), 0)
  /* Non si può togliere più lavoro di quanto ce ne sia. */
  const oreTolte = Math.min(oreLorde, attivita.oreManuali)
  const risparmioOre = Math.round(oreTolte * attivita.costoOrario * 4.33)

  const reg = REGIMI.find(r => r.id === regimeId)
  const sincronizza = moduliScelti.includes("magazzino")
  const recuperoErrori = sincronizza
    ? Math.round(attivita.ordini * attivita.scontrino * attivita.quotaErrori * (reg?.efficacia ?? 0.55))
    : 0

  const risparmioMensile = risparmioOre + recuperoErrori
  const rientro = risparmioMensile > 0 && totale > 0
    ? Math.round((totale / risparmioMensile) * 10) / 10
    : null

  return {
    righe, totale, giorni,
    settimane: Math.ceil(giorni / GIORNI_PER_SETTIMANA),
    ritorno: { risparmioOre, recuperoErrori, risparmioMensile, rientro, oreTolte },
  }
}

/* ── l'oggetto che partirebbe verso il backend ───────────────────────── */

export interface OrdineJson {
  versione: string
  emesso: string
  configurazione: {
    piattaforma: { id: string; nome: string; prezzo: number } | null
    moduli: { id: string; nome: string; prezzo: number; rettificato: boolean }[]
    regime: { id: string; nome: string; fattore: number; latenza: string } | null
  }
  attivita: Attivita
  totali: { imponibile: number; giorni: number; settimane: number; valuta: "EUR" }
  ritorno: { risparmioMensile: number; rientroMesi: number | null; oreSettimanaliTolte: number }
}

export function componiOrdine(s: {
  piattaforma: PiattaformaId | null; moduli: ModuloId[]; regime: RegimeId | null
  attivita: Attivita; emesso: string
}): OrdineJson {
  const preventivo = calcola(s.piattaforma, s.moduli, s.regime, s.attivita)
  const piatt = PIATTAFORME.find(p => p.id === s.piattaforma) ?? null
  const reg = REGIMI.find(r => r.id === s.regime) ?? null

  return {
    versione: "1.0",
    emesso: s.emesso,
    configurazione: {
      piattaforma: piatt ? { id: piatt.id, nome: piatt.nome, prezzo: piatt.prezzo } : null,
      moduli: s.moduli.map(id => {
        const m = moduloDi(id)
        const { prezzo, rettificato } = prezzoModulo(m, s.piattaforma, s.regime)
        return { id: m.id, nome: m.nome, prezzo, rettificato }
      }),
      regime: reg ? { id: reg.id, nome: reg.nome, fattore: reg.fattore, latenza: reg.latenza } : null,
    },
    attivita: s.attivita,
    totali: {
      imponibile: preventivo.totale, giorni: preventivo.giorni,
      settimane: preventivo.settimane, valuta: "EUR",
    },
    ritorno: {
      risparmioMensile: preventivo.ritorno.risparmioMensile,
      rientroMesi: preventivo.ritorno.rientro,
      oreSettimanaliTolte: preventivo.ritorno.oreTolte,
    },
  }
}

/* ── il piano: fasi e pagamenti ──────────────────────────────────────────
   Entrambi derivano dai giorni e dal totale già calcolati: non sono numeri
   nuovi, sono lo stesso preventivo raccontato lungo il tempo. Se un giorno
   cambia il listino, questi due si aggiornano da soli — e non possono
   contraddire il totale, perché non lo conoscono per vie separate. */

export interface FaseCalcolata {
  id: string
  nome: string
  sommario: string
  giorni: number
  /** Settimana di inizio e di fine, contate dal via. */
  daSettimana: number
  aSettimana: number
  quota: number
}

export function pianoFasi(giorniTotali: number): FaseCalcolata[] {
  if (giorniTotali <= 0) return []
  let cursore = 0
  return FASI.map(f => {
    const giorni = Math.max(1, Math.round(giorniTotali * f.quota))
    const da = cursore
    cursore += giorni
    return {
      id: f.id, nome: f.nome, sommario: f.sommario, giorni, quota: f.quota,
      daSettimana: Math.floor(da / GIORNI_PER_SETTIMANA) + 1,
      aSettimana: Math.max(1, Math.ceil(cursore / GIORNI_PER_SETTIMANA)),
    }
  })
}

export interface RataCalcolata {
  id: string
  nome: string
  quando: string
  quota: number
  importo: number
}

export function pianoRate(totale: number): RataCalcolata[] {
  if (totale <= 0) return []
  /* L'ultima rata assorbe l'arrotondamento: tre quote arrotondate a parte
     non tornano quasi mai al totale, e un piano di pagamenti che non
     somma alla cifra firmata è un piano che il commercialista rimanda
     indietro. */
  const parziali = RATE.slice(0, -1).map(r => ({ ...r, importo: Math.round(totale * r.quota) }))
  const residuo = totale - parziali.reduce((t, r) => t + r.importo, 0)
  const ultima = RATE[RATE.length - 1]
  return [...parziali, { ...ultima, importo: residuo }]
}

const scattoDi = (s: { piattaforma: PiattaformaId | null; moduli: ModuloId[]; regime: RegimeId | null }): Scatto =>
  ({ piattaforma: s.piattaforma, moduli: [...s.moduli], regime: s.regime })

const MAX_STORICO = 24

export const useQuoteStore = create<QuoteState>((set, get) => ({
  passo: 1,
  maxPasso: 1,
  piattaforma: null,
  moduli: [],
  regime: null,
  attivita: { ...ATTIVITA_INIZIALE },
  revisione: 0,
  storico: [],
  serieTotali: [],
  scenari: [],

  /* Cambiare piattaforma non azzera le scelte: toglie SOLO quelle che su
     quella piattaforma non esistono, e lo fa vedere. Ricominciare da capo
     per aver cambiato idea al primo passo è il modo più rapido di far
     chiudere un configuratore. */
  scegliPiattaforma: id => set(s => {
    const superstiti = s.moduli.filter(m => !moduloDi(m).esclusoDa?.[id])
    /* Un modulo che perde la sua base cade con lei. */
    const coerenti = superstiti.filter(m => {
      const req = moduloDi(m).richiede
      return !req || superstiti.includes(req)
    })
    const regime = serveRegime(coerenti) ? s.regime : null
    const totale = calcola(id, coerenti, regime, s.attivita).totale
    return {
      piattaforma: id, moduli: coerenti, regime,
      revisione: s.revisione + 1,
      storico: [...s.storico, scattoDi(s)].slice(-MAX_STORICO),
      serieTotali: [...s.serieTotali, totale].slice(-40),
    }
  }),

  alternaModulo: id => set(s => {
    const dentro = s.moduli.includes(id)
    let moduli = dentro ? s.moduli.filter(m => m !== id) : [...s.moduli, id]

    if (dentro) {
      /* Togliendo una base cadono anche i moduli che la pretendono. */
      moduli = moduli.filter(m => moduloDi(m).richiede !== id)
    } else {
      const req = moduloDi(id).richiede
      /* Aggiungendo un modulo con prerequisito, il prerequisito entra da sé:
         chiedere all'utente di indovinare l'ordine giusto è pigrizia. */
      if (req && !moduli.includes(req)) moduli = [req, ...moduli]
    }

    const regime = serveRegime(moduli) ? s.regime : null
    const totale = calcola(s.piattaforma, moduli, regime, s.attivita).totale
    return {
      moduli, regime,
      revisione: s.revisione + 1,
      storico: [...s.storico, scattoDi(s)].slice(-MAX_STORICO),
      serieTotali: [...s.serieTotali, totale].slice(-40),
    }
  }),

  scegliRegime: id => set(s => ({
    regime: id,
    revisione: s.revisione + 1,
    storico: [...s.storico, scattoDi(s)].slice(-MAX_STORICO),
    serieTotali: [...s.serieTotali, calcola(s.piattaforma, s.moduli, id, s.attivita).totale].slice(-40),
  })),

  setAttivita: patch => set(s => ({ attivita: { ...s.attivita, ...patch }, revisione: s.revisione + 1 })),

  vai: p => set(s => ({ passo: p, maxPasso: p > s.maxPasso ? p : s.maxPasso })),

  avanti: () => {
    const s = get()
    if (s.passo === 1 && !s.piattaforma) return
    if (s.passo === 2 && s.moduli.length === 0) return
    if (s.passo < ULTIMO_PASSO) {
      /* Il regime si salta quando non c'è niente da sincronizzare: un passo
         con una sola risposta possibile è un passo da togliere. */
      const prossimo = (s.passo === 2 && !serveRegime(s.moduli) ? 4 : s.passo + 1) as Passo
      get().vai(prossimo)
    }
  },

  indietro: () => {
    const s = get()
    if (s.passo === 1) return
    const precedente = (s.passo === 4 && !serveRegime(s.moduli) ? 2 : s.passo - 1) as Passo
    get().vai(precedente)
  },

  azzera: () => set(s => ({
    passo: 1, maxPasso: 1, piattaforma: null, moduli: [], regime: null,
    attivita: { ...ATTIVITA_INIZIALE }, revisione: s.revisione + 1,
    storico: [], serieTotali: [],
    /* Gli scenari messi da parte sopravvivono all'azzeramento: sono il
       lavoro di confronto, non la configurazione corrente. */
  })),

  /* Annulla l'ultima scelta strutturale. Non tocca i cursori dell'attività:
     quelli si muovono di continuo e riempirebbero lo storico di rumore,
     seppellendo le scelte vere. */
  annulla: () => set(s => {
    const precedente = s.storico[s.storico.length - 1]
    if (!precedente) return s
    return {
      ...precedente,
      moduli: [...precedente.moduli],
      storico: s.storico.slice(0, -1),
      serieTotali: s.serieTotali.slice(0, -1),
      revisione: s.revisione + 1,
    }
  }),

  applicaPreset: id => set(s => {
    const p = PRESET.find(x => x.id === id)
    if (!p) return s
    const totale = calcola(p.piattaforma, p.moduli, p.regime, s.attivita).totale
    return {
      piattaforma: p.piattaforma, moduli: [...p.moduli], regime: p.regime,
      passo: 2, maxPasso: s.maxPasso > 2 ? s.maxPasso : 2,
      revisione: s.revisione + 1,
      storico: [...s.storico, scattoDi(s)].slice(-MAX_STORICO),
      serieTotali: [...s.serieTotali, totale].slice(-40),
    }
  }),

  /* Mette da parte la configurazione corrente per confrontarla con la
     prossima. Due scenari bastano a decidere: il terzo si sostituisce al
     più vecchio invece di allungare una lista che nessuno rilegge. */
  salvaScenario: () => set(s => {
    if (!s.piattaforma) return s
    const p = calcola(s.piattaforma, s.moduli, s.regime, s.attivita)
    const nome = PIATTAFORME.find(x => x.id === s.piattaforma)?.nome ?? "Scenario"
    const nuovo: Scenario = {
      id: `sc${s.revisione}-${s.scenari.length}`,
      nome: `${nome} · ${s.moduli.length} moduli`,
      piattaforma: s.piattaforma, moduli: [...s.moduli], regime: s.regime,
      totale: p.totale, giorni: p.giorni, rientro: p.ritorno.rientro,
    }
    return { scenari: [...s.scenari, nuovo].slice(-2) }
  }),

  ripristinaScenario: id => set(s => {
    const sc = s.scenari.find(x => x.id === id)
    if (!sc) return s
    return {
      piattaforma: sc.piattaforma, moduli: [...sc.moduli], regime: sc.regime,
      revisione: s.revisione + 1,
      storico: [...s.storico, scattoDi(s)].slice(-MAX_STORICO),
      serieTotali: [...s.serieTotali, sc.totale].slice(-40),
    }
  }),

  eliminaScenario: id => set(s => ({ scenari: s.scenari.filter(x => x.id !== id) })),
}))
