/* ══════════════════════════════════════════════════════════════════════════
   ATELIER — il listino della maison.

   Una sola borsa configurabile («Vela») e tre accessori a prezzo fisso.
   I prezzi sono da pelletteria di fascia alta ma non da haute couture:
   1.450–2.250 € per una borsa in pelle conciata al vegetale è la fascia
   di Furla Premium / Coccinelle Artisan, credibile per una maison
   indipendente milanese. Ogni supplemento è dichiarato accanto alla
   scelta: nel lusso il prezzo non si nasconde, si porta bene.
══════════════════════════════════════════════════════════════════════════ */

export type PelleId = "nero" | "avorio" | "cognac" | "bosco" | "bordeaux"

export interface Pelle {
  id: PelleId
  nome: string
  /* Tre toni della stessa pelle: la base, l'ombra dei fianchi e la luce
     della patta. Un colore solo renderebbe la borsa un adesivo piatto. */
  base: string
  ombra: string
  luce: string
  /** Supplemento sul prezzo della misura; 0 = incluso. */
  extra: number
  nota: string
}

export const PELLI: Pelle[] = [
  { id: "nero",     nome: "Nero assoluto",  base: "#26221F", ombra: "#16130F", luce: "#3A342E", extra: 0,   nota: "vitello liscio" },
  { id: "avorio",   nome: "Avorio latte",   base: "#E8DFCE", ombra: "#C9BCA4", luce: "#F5EEDF", extra: 0,   nota: "vitello liscio" },
  { id: "cognac",   nome: "Cognac",         base: "#9A5B2E", ombra: "#6E3D1B", luce: "#B97A45", extra: 90,  nota: "concia al vegetale" },
  { id: "bosco",    nome: "Verde bosco",    base: "#3E4A38", ombra: "#28311F", luce: "#57654C", extra: 120, nota: "tiratura limitata" },
  { id: "bordeaux", nome: "Bordeaux",       base: "#5E2231", ombra: "#40141F", luce: "#7C3A48", extra: 120, nota: "tiratura limitata" },
]

export type MetalloId = "oro" | "palladio" | "rosa"

export interface Metallo {
  id: MetalloId
  nome: string
  chiaro: string
  scuro: string
  extra: number
}

export const METALLI: Metallo[] = [
  { id: "oro",      nome: "Oro chiaro", chiaro: "#E8C476", scuro: "#A88434", extra: 0 },
  { id: "palladio", nome: "Palladio",   chiaro: "#D9DDE2", scuro: "#8E959E", extra: 60 },
  { id: "rosa",     nome: "Oro rosa",   chiaro: "#E9B396", scuro: "#B07657", extra: 140 },
]

export type MisuraId = "mini" | "media" | "grande"

export interface Misura {
  id: MisuraId
  nome: string
  cm: string
  /** Prezzo pieno della borsa in questa misura, pelle inclusa. */
  prezzo: number
  /** Fattore di scala del disegno nel teatro del configuratore. */
  scala: number
}

export const MISURE: Misura[] = [
  { id: "mini",   nome: "Mini",   cm: "19 × 14 × 8",  prezzo: 1450, scala: 0.78 },
  { id: "media",  nome: "Media",  cm: "27 × 19 × 11", prezzo: 1850, scala: 1 },
  { id: "grande", nome: "Grande", cm: "34 × 24 × 14", prezzo: 2250, scala: 1.18 },
]

/** Le iniziali impresse a caldo, fino a tre lettere. */
export const PREZZO_MONOGRAMMA = 45

export interface Configurazione {
  pelle: PelleId
  metallo: MetalloId
  misura: MisuraId
  monogramma: string
}

export const CONFIG_INIZIALE: Configurazione = {
  pelle: "cognac",
  metallo: "oro",
  misura: "media",
  monogramma: "",
}

export function pelleDi(id: PelleId): Pelle { return PELLI.find(p => p.id === id)! }
export function metalloDi(id: MetalloId): Metallo { return METALLI.find(m => m.id === id)! }
export function misuraDi(id: MisuraId): Misura { return MISURE.find(m => m.id === id)! }

/** Il prezzo della borsa configurata: misura + pelle + metallo + iniziali. */
export function prezzoBorsa(c: Configurazione): number {
  return misuraDi(c.misura).prezzo
    + pelleDi(c.pelle).extra
    + metalloDi(c.metallo).extra
    + (c.monogramma.trim() ? PREZZO_MONOGRAMMA : 0)
}

/* ── Gli accessori della collezione: prezzo fisso, aggiunta in un tocco ── */

export type AccessorioId = "foulard" | "portacarte" | "cintura"

export interface Accessorio {
  id: AccessorioId
  nome: string
  materia: string
  prezzo: number
}

export const ACCESSORI: Accessorio[] = [
  { id: "foulard",    nome: "Foulard Alba",     materia: "twill di seta, 90 × 90", prezzo: 320 },
  { id: "portacarte", nome: "Portacarte Linea", materia: "vitello, sei tasche",    prezzo: 240 },
  { id: "cintura",    nome: "Cintura Ora",      materia: "doppio giro, fibbia incisa", prezzo: 290 },
]

export function accessorioDi(id: AccessorioId): Accessorio { return ACCESSORI.find(a => a.id === id)! }

/* In italiano il separatore di migliaia parte da cinque cifre: 1940
   resterebbe «1940». In un listino di borse da 1.450 a 2.250 euro il punto
   fa parte del registro — si raggruppa sempre, come nella demo Preventivo. */
export function euro(n: number): string {
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0, useGrouping: true }).format(n) + " €"
}
