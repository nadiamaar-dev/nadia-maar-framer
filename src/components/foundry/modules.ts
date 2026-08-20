import { DEFAULT_LOCALE, type Locale } from "../../lib/i18n/locales"
import { MODULES_STR } from "../../lib/i18n/strings/modules"
import { pick } from "../../lib/i18n/t"

/* ══════════════════════════════════════════════════════════════════════════
   SOLUTION ARCHITECT — catalogo, indice di complessità, resoconto
   Flusso a 4 passi:
     1. Vettore principale  → il CORE dell'architettura
     2. Funzionalità base   → dipendono dal vettore scelto
     3. Moduli aggiuntivi   → trasversali, raggruppati per famiglia
     4. Blueprint           → resoconto tecnico + complessità + invio
   Nessun prezzo, nessun carrello: il configuratore produce solo testo.

   ── DOVE STA IL TESTO ────────────────────────────────────────────────────
   Qui c'è la struttura: quali voci esistono, a che gruppo appartengono, che
   peso hanno nel calcolo della complessità. Come si chiamano e come si
   spiegano sta in src/lib/i18n/strings/modules.ts, indicizzato per id.

   Ogni funzione che restituisce testo vuole quindi una lingua. Non è un
   dettaglio fastidioso: il resoconto finisce anche in un PDF generato fuori
   da React, dove non esiste un contesto da cui dedurla.
══════════════════════════════════════════════════════════════════════════ */

export type VectorId = "ecommerce" | "webapp" | "ai" | "seo" | "corporate"
export type GroupId  = "base" | "control" | "agents" | "growth" | "brand"

export type Vector = {
  id: VectorId
  label: string
  focus: string
  /** etichetta del nodo CORE sul canvas */
  node: string
  /** stack mostrato sotto il nodo CORE */
  stack: string
  /** riga di apertura del resoconto */
  tech: string
  weight: number
}

export type Item = {
  id: string
  group: GroupId
  /** solo per il gruppo "base": a quale vettore appartiene */
  vector?: VectorId
  /** titolo in linguaggio di business */
  label: string
  /** spiegazione non tecnica */
  plain: string
  /** etichetta corta del nodo sul canvas */
  node: string
  /** riga di specifica professionale per il resoconto e il brief */
  tech: string
  weight: number
}

/* ── La struttura: id, gruppo, vettore di appartenenza, peso ───────────── */

const VECTOR_ART: { id: VectorId; weight: number }[] = [
  { id: "ecommerce", weight: 4 },
  { id: "webapp",    weight: 4 },
  { id: "ai",        weight: 4 },
  { id: "seo",       weight: 3 },
  { id: "corporate", weight: 3 },
]

type ItemArt = { id: string; group: GroupId; vector?: VectorId; weight: number }

/* Passo 2 — funzionalità base, per vettore */
const BASE_ART: ItemArt[] = [
  { id: "b-sync",   group: "base", vector: "ecommerce", weight: 3 },
  { id: "b-orders", group: "base", vector: "ecommerce", weight: 2 },
  { id: "b-intl",   group: "base", vector: "ecommerce", weight: 2 },
  { id: "b-crm",    group: "base", vector: "webapp",    weight: 3 },
  { id: "b-roles",  group: "base", vector: "webapp",    weight: 2 },
  { id: "b-docs",   group: "base", vector: "webapp",    weight: 3 },
  { id: "b-rag",    group: "base", vector: "ai",        weight: 3 },
  { id: "b-intake", group: "base", vector: "ai",        weight: 3 },
  { id: "b-arch",   group: "base", vector: "seo",       weight: 2 },
  { id: "b-funnel", group: "base", vector: "seo",       weight: 2 },
  { id: "b-quiz",   group: "base", vector: "corporate", weight: 2 },
  { id: "b-cms",    group: "base", vector: "corporate", weight: 2 },
]

/* Passo 3 — moduli aggiuntivi, trasversali */
const ADDON_ART: ItemArt[] = [
  { id: "a-dash",     group: "control", weight: 3 },
  { id: "a-portal",   group: "control", weight: 3 },
  { id: "a-support",  group: "agents",  weight: 3 },
  { id: "a-copilot",  group: "agents",  weight: 2 },
  { id: "a-workflow", group: "agents",  weight: 2 },
  { id: "a-pseo",     group: "growth",  weight: 3 },
  { id: "a-geo",      group: "growth",  weight: 2 },
  { id: "a-speed",    group: "growth",  weight: 2 },
  { id: "a-ui",       group: "brand",   weight: 3 },
  { id: "a-motion",   group: "brand",   weight: 2 },
]

const ITEM_ART: ItemArt[] = [...BASE_ART, ...ADDON_ART]

type ItemTextId = keyof typeof MODULES_STR.it.items

/* ── Struttura + testo, nella lingua chiesta ──────────────────────────── */

export function vectors(locale: Locale = DEFAULT_LOCALE): Vector[] {
  const txt = pick(MODULES_STR, locale).vectors
  return VECTOR_ART.map(v => ({ id: v.id, weight: v.weight, ...txt[v.id] }))
}

export function items(locale: Locale = DEFAULT_LOCALE): Item[] {
  const txt = pick(MODULES_STR, locale).items
  return ITEM_ART.map(i => ({ ...i, ...txt[i.id as ItemTextId] }))
}

export function addonGroups(locale: Locale = DEFAULT_LOCALE): { id: GroupId; label: string; sub: string }[] {
  const g = pick(MODULES_STR, locale).groups
  return [
    { id: "control", ...g.control },
    { id: "agents",  ...g.agents  },
    { id: "growth",  ...g.growth  },
    { id: "brand",   ...g.brand   },
  ]
}

/** Etichette dei livelli mostrati sul canvas. */
export function canvasBands(locale: Locale = DEFAULT_LOCALE): { id: GroupId; label: string; sub: string }[] {
  const g = pick(MODULES_STR, locale).groups
  return [{ id: "base", ...g.base }, ...addonGroups(locale)]
}

export const GROUP_COLOR: Record<GroupId, string> = {
  base:    "#EDF1F7",
  control: "#7FD1FF",
  agents:  "#F53E56",
  growth:  "#10B981",
  brand:   "#C69BFF",
}

export const vectorById = (id: VectorId | null, locale: Locale = DEFAULT_LOCALE) =>
  vectors(locale).find(v => v.id === id) ?? null
export const itemById = (id: string, locale: Locale = DEFAULT_LOCALE) =>
  items(locale).find(i => i.id === id)
export const addonsOf = (g: GroupId, locale: Locale = DEFAULT_LOCALE) =>
  items(locale).filter(i => i.group === g)

/** Le funzionalità base di un vettore. Senza lingua torna solo la struttura,
 *  che è ciò che serve allo store per potare le selezioni: gli id bastano. */
export const baseFor = (v: VectorId | null, locale: Locale = DEFAULT_LOCALE) =>
  v ? items(locale).filter(i => i.vector === v) : []

/* ══════════════════════════════════════════════════════════════════════════
   INDICE DI COMPLESSITÀ — nessun prezzo: solo impegno tecnico e tempi
══════════════════════════════════════════════════════════════════════════ */
export type Complexity = { label: string; weeks: string; level: 1 | 2 | 3 | 4; note: string }

export function complexityOf(
  vector: VectorId | null,
  selected: string[],
  locale: Locale = DEFAULT_LOCALE,
): Complexity | null {
  const art = VECTOR_ART.find(v => v.id === vector)
  if (!art) return null
  const w = art.weight + ITEM_ART.filter(i => selected.includes(i.id)).reduce((a, i) => a + i.weight, 0)

  const scale = pick(MODULES_STR, locale).complexity
  const level: 1 | 2 | 3 | 4 = w <= 7 ? 1 : w <= 12 ? 2 : w <= 18 ? 3 : 4
  return { level, ...scale[level - 1] }
}

/* ══════════════════════════════════════════════════════════════════════════
   RESOCONTO — dalla selezione a un riassunto professionale a scaffali
══════════════════════════════════════════════════════════════════════════ */

/** "a, b e c" in italiano, "a, b and c" in inglese. */
function joinList(parts: string[], and: string): string {
  if (parts.length <= 1) return parts[0] ?? ""
  return parts.slice(0, -1).join(", ") + and + parts[parts.length - 1]
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "")
}

export type Blueprint = {
  vector: Vector
  obiettivo: string
  architettura: string
  scaffali: { label: string; group: GroupId; righe: { node: string; tech: string }[] }[]
  complexity: Complexity
  passo: string
}

export function buildBlueprint(
  vector: VectorId | null,
  selected: string[],
  locale: Locale = DEFAULT_LOCALE,
): Blueprint | null {
  const v = vectorById(vector, locale)
  if (!v) return null

  const str = pick(MODULES_STR, locale).blueprint
  const chosen = items(locale).filter(i => selected.includes(i.id))

  const base = chosen.filter(i => i.group === "base")
  const obiettivo = base.length
    ? fill(str.goalWithBase, {
        focus: v.focus,
        list: joinList(base.map(b => b.node.toLowerCase()), str.and),
      })
    : fill(str.goalBare, { focus: v.focus })

  const groups = addonGroups(locale).filter(g => chosen.some(i => i.group === g.id))
  const architettura = groups.length
    ? fill(str.archWithLayers, {
        node: v.node,
        count: str.numbers[groups.length] ?? String(groups.length),
        list: joinList(
          groups.map(g => str.groupPhrase[g.id as Exclude<GroupId, "base">]),
          str.and,
        ),
      })
    : fill(str.archBare, { node: v.node })

  const scaffali = canvasBands(locale)
    .map(b => ({
      label: b.label,
      group: b.id,
      righe: chosen.filter(i => i.group === b.id).map(i => ({ node: i.node, tech: i.tech })),
    }))
    .filter(s => s.righe.length > 0)

  return {
    vector: v,
    obiettivo,
    architettura,
    scaffali,
    complexity: complexityOf(vector, selected, locale)!,
    passo: str.nextStep,
  }
}
