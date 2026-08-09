/* ══════════════════════════════════════════════════════════════════════════
   MOTORE DI PREZZO — la stessa catena che gira sul server

   Questo file è il gemello nel browser di `docs/supplier-sync/src/pricing.ts`:
   stesse regole, stesso ordine, stessi arrotondamenti. Il pannello non simula
   il calcolo con numeri scritti a mano — lo esegue davvero, ed è per questo
   che spostare un cursore riscrive la colonna del margine riga per riga.

   Funzioni pure: entrano un costo e delle regole, esce un prezzo e la
   spiegazione di come ci si è arrivati.
══════════════════════════════════════════════════════════════════════════ */

export type MarkupKind = "percent_on_cost" | "target_margin" | "fixed_amount" | "fixed_price"
export type RoundingKind = "none" | "cents_99" | "cents_90" | "cents_50" | "integer_up"

export const MARKUP_LABEL: Record<MarkupKind, string> = {
  percent_on_cost: "Ricarico sul costo",
  target_margin: "Margine obiettivo",
  fixed_amount: "Aggiunta fissa",
  fixed_price: "Prezzo imposto",
}

export const ROUNDING_LABEL: Record<RoundingKind, string> = {
  none: "Nessuno",
  cents_99: "a ,99",
  cents_90: "a ,90",
  cents_50: "a mezzo euro",
  integer_up: "all'euro superiore",
}

export type PriceRule = {
  id: string
  name: string
  active: boolean
  priority: number
  /* ambito: null significa "qualunque" */
  supplierId: string | null
  category: string | null
  skuPattern: string | null
  costMin: number | null
  costMax: number | null
  kind: MarkupKind
  value: number
  minMargin: number
  maxPrice: number | null
  rounding: RoundingKind
}

export type PriceCtx = {
  sku: string
  supplierId: string
  category: string | null
  costNet: number
}

export type PriceStep = { label: string; value: number }

export type PriceResult = {
  priceNet: number
  ruleId: string | null
  ruleName: string
  margin: number
  /* i passaggi, in ordine: è la colonna «come si arriva a questo prezzo».
     Un motore di prezzo di cui non si vede il ragionamento non viene
     adottato — si continua a scrivere i prezzi a mano. */
  steps: PriceStep[]
  clamped: null | "margine" | "tetto"
}

const cents = (n: number) => Math.round(n * 100) / 100

/** Costo sbarcato: il trasporto si alloca sul valore, non sul pezzo. Caricare
    3 € fissi su una guarnizione da 0,90 la manderebbe fuori mercato da sola. */
export function landedCost(costGross: number, o: {
  fx?: number; costDiscount?: number; shippingFlat?: number; freeOver?: number | null
}): number {
  const eur = costGross * (o.fx ?? 1)
  const net = eur * (1 - (o.costDiscount ?? 0) / 100)
  const ship = o.freeOver != null && net >= o.freeOver ? 0 : (o.shippingFlat ?? 0)
  return cents(net + ship)
}

/* Vince la regola più specifica; a parità, la priorità più alta. La
   specificità è una somma di pesi, non un albero di if: aggiungere un
   criterio domani è una riga qui. */
export function specificity(r: PriceRule): number {
  return (r.skuPattern ? 8 : 0)
    + (r.category ? 2 : 0)
    + (r.supplierId ? 1 : 0)
    + (r.costMin != null || r.costMax != null ? 1 : 0)
}

function likeToRegExp(pattern: string): RegExp {
  const body = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".")
  return new RegExp(`^${body}$`, "i")
}

function matches(r: PriceRule, c: PriceCtx): boolean {
  if (!r.active) return false
  if (r.supplierId && r.supplierId !== c.supplierId) return false
  if (r.category && r.category !== c.category) return false
  if (r.skuPattern && !likeToRegExp(r.skuPattern).test(c.sku)) return false
  if (r.costMin != null && c.costNet < r.costMin) return false
  if (r.costMax != null && c.costNet > r.costMax) return false
  return true
}

export function pickRule(rules: PriceRule[], c: PriceCtx): PriceRule | null {
  let best: PriceRule | null = null
  let score = -1
  for (const r of rules) {
    if (!matches(r, c)) continue
    const s = specificity(r) * 1000 + r.priority
    if (s > score) { best = r; score = s }
  }
  return best
}

function applyMarkup(cost: number, r: PriceRule): number {
  switch (r.kind) {
    case "percent_on_cost": return cost * (1 + r.value / 100)
    /* Il 30 % di margine NON è il 30 % di ricarico: su un costo di 100 il
       ricarico dà 130 (margine 23 %), il margine dà 142,86. Confondere i due
       è l'errore più caro di tutta la catena. */
    case "target_margin": return r.value >= 100 ? cost : cost / (1 - r.value / 100)
    case "fixed_amount": return cost + r.value
    case "fixed_price": return r.value
  }
}

export function applyRounding(v: number, k: RoundingKind): number {
  switch (k) {
    case "none": return cents(v)
    case "cents_99": return Math.floor(v) + 0.99
    case "cents_90": return Math.floor(v) + 0.90
    case "cents_50": return Math.round(v * 2) / 2
    case "integer_up": return Math.ceil(v)
  }
}

export function marginOf(price: number, cost: number): number {
  if (price <= 0) return 0
  return Math.round(((price - cost) / price) * 1000) / 10
}

export function floorForMargin(cost: number, minMargin: number): number {
  if (minMargin <= 0) return 0
  if (minMargin >= 100) return Infinity
  return cents(cost / (1 - minMargin / 100))
}

export function computePrice(rules: PriceRule[], c: PriceCtx): PriceResult {
  const steps: PriceStep[] = [{ label: "Costo sbarcato", value: cents(c.costNet) }]
  const rule = pickRule(rules, c)

  /* Nessuna regola non è un prezzo zero: è un articolo che non va pubblicato.
     Nel pannello finisce nella lista «senza regola di prezzo». */
  if (!rule) {
    return { priceNet: 0, ruleId: null, ruleName: "nessuna regola applicabile", margin: 0, steps, clamped: null }
  }

  let p = applyMarkup(c.costNet, rule)
  steps.push({ label: ruleLabel(rule), value: cents(p) })

  let clamped: PriceResult["clamped"] = null
  const floor = floorForMargin(c.costNet, rule.minMargin)
  if (p < floor) {
    p = floor; clamped = "margine"
    steps.push({ label: `Margine minimo ${rule.minMargin} %`, value: cents(p) })
  }
  if (rule.maxPrice != null && p > rule.maxPrice) {
    p = rule.maxPrice; clamped = "tetto"
    steps.push({ label: "Prezzo massimo", value: cents(p) })
  }
  if (rule.rounding !== "none") {
    const before = p
    p = applyRounding(p, rule.rounding)
    /* Arrotondare per difetto può far scendere sotto il pavimento: in quel
       caso il pavimento vince e si arrotonda per eccesso. */
    if (p < floor) p = applyRounding(floor + 0.005, rule.rounding === "cents_50" ? "cents_50" : "integer_up")
    if (cents(before) !== cents(p)) steps.push({ label: `Arrotondamento ${ROUNDING_LABEL[rule.rounding]}`, value: cents(p) })
  }

  const priceNet = cents(p)
  return { priceNet, ruleId: rule.id, ruleName: rule.name, margin: marginOf(priceNet, c.costNet), steps, clamped }
}

export function ruleLabel(r: PriceRule): string {
  switch (r.kind) {
    case "percent_on_cost": return `Ricarico ${r.value} %`
    case "target_margin": return `Margine obiettivo ${r.value} %`
    case "fixed_amount": return `Aggiunta fissa ${r.value.toFixed(2).replace(".", ",")} €`
    case "fixed_price": return "Prezzo imposto"
  }
}

/** L'ambito, in una riga leggibile. */
export function scopeLabel(r: PriceRule, supplierName: (id: string) => string): string {
  const bits: string[] = []
  if (r.supplierId) bits.push(supplierName(r.supplierId))
  if (r.category) bits.push(r.category)
  if (r.skuPattern) bits.push(`codice ${r.skuPattern}`)
  if (r.costMin != null || r.costMax != null) {
    const a = r.costMin != null ? `${r.costMin}` : "0"
    const b = r.costMax != null ? `${r.costMax}` : "∞"
    bits.push(`costo ${a}–${b} €`)
  }
  return bits.length ? bits.join(" · ") : "Tutto il catalogo"
}

/* ── IVA ──────────────────────────────────────────────────────────────────
   I prezzi si conservano SEMPRE al netto: il lordo è una vista. */
export type TaxRate = { code: string; rate: number; label: string; natura?: string }

export const TAX_RATES: TaxRate[] = [
  { code: "22", rate: 0.22, label: "Aliquota ordinaria" },
  { code: "10", rate: 0.10, label: "Aliquota ridotta · manutenzioni" },
  { code: "4", rate: 0.04, label: "Aliquota minima" },
  { code: "0-ue", rate: 0, label: "Cessione intracomunitaria", natura: "N3.2" },
  { code: "0-rc", rate: 0, label: "Inversione contabile · edilizia", natura: "N6.7" },
]

export function withVat(net: number, t: TaxRate) {
  const vat = cents(net * t.rate)
  return { net: cents(net), vat, gross: cents(net + vat), natura: t.rate === 0 ? t.natura ?? null : null }
}
