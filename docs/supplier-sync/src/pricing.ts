/* ══════════════════════════════════════════════════════════════════════════
   MOTORE DI PREZZO

   Funzioni pure: entrano un costo e delle regole, esce un prezzo e la
   spiegazione di come ci si è arrivati. Nessuna query, nessun orologio,
   nessun `process.env` — è la parte del sistema che deve essere coperta da
   test a unità, perché è quella che sbaglia in silenzio.

   La catena è sempre la stessa e sempre in questo ordine:

     costo fornitore
       → in EUR (cambio)
       → meno lo sconto di contratto
       → più il trasporto allocato          = COSTO SBARCATO
       → regola di ricarico
       → pavimento di margine minimo
       → tetto di prezzo
       → arrotondamento                     = PREZZO B2B NETTO
       → IVA                                = PREZZO LORDO

   L'arrotondamento sta DOPO il pavimento di margine di proposito: arrotondare
   per difetto sotto il margine minimo lo violerebbe, quindi il pavimento
   viene riapplicato dopo l'arrotondamento e vince lui.
══════════════════════════════════════════════════════════════════════════ */

export type MarkupKind = "percent_on_cost" | "target_margin" | "fixed_amount" | "fixed_price"
export type RoundingKind = "none" | "cents_99" | "cents_90" | "cents_50" | "integer_up" | "integer_near"

export type PriceRule = {
  id: string
  name: string
  active: boolean
  priority: number
  supplierId?: string | null
  categoryId?: string | null
  brand?: string | null
  skuPattern?: string | null
  costMin?: number | null
  costMax?: number | null
  kind: MarkupKind
  value: number
  minMarginPct: number
  maxPrice?: number | null
  rounding: RoundingKind
  validFrom?: string | null
  validTo?: string | null
}

export type PriceCtx = {
  sku: string
  supplierId: string
  categoryId?: string | null
  brand?: string | null
  costNet: number
  /** Data di riferimento in ISO: passata, mai letta dall'orologio, così il
      calcolo di ieri si può rifare identico. */
  on: string
}

export type PriceResult = {
  priceNet: number
  ruleId: string | null
  ruleName: string
  marginPct: number
  /** I passaggi, nell'ordine, per la colonna «Come si arriva a questo prezzo»
      del pannello. Un motore di prezzo di cui non si vede il ragionamento non
      viene adottato: si continua a scrivere i prezzi a mano. */
  steps: { label: string; value: number }[]
  clamped: null | "margine_minimo" | "prezzo_massimo"
}

const cents = (n: number) => Math.round(n * 100) / 100

/* ── Costo sbarcato ───────────────────────────────────────────────────────
   Il trasporto si alloca sul valore, non sul pezzo: caricare 3 € fissi su una
   guarnizione da 0,90 la manderebbe fuori mercato da sola. */
export function landedCost(o: {
  costGross: number
  fxRate: number
  costDiscountPct: number
  shippingFlat?: number
  freeShippingOver?: number | null
}): number {
  const inEur = o.costGross * o.fxRate
  const net = inEur * (1 - o.costDiscountPct / 100)
  const shipping = o.freeShippingOver != null && net >= o.freeShippingOver ? 0 : (o.shippingFlat ?? 0)
  return cents(net + shipping)
}

/* ── Scelta della regola ──────────────────────────────────────────────────
   Vince la più specifica; a parità di specificità la priorità più alta.
   La specificità è una somma di pesi, non un albero di if: aggiungere un
   criterio di ambito domani è una riga qui e una colonna nello schema. */
export function specificity(r: PriceRule): number {
  return (r.skuPattern ? 8 : 0)
    + (r.brand ? 4 : 0)
    + (r.categoryId ? 2 : 0)
    + (r.supplierId ? 1 : 0)
    + (r.costMin != null || r.costMax != null ? 1 : 0)
}

function matches(r: PriceRule, c: PriceCtx): boolean {
  if (!r.active) return false
  if (r.supplierId && r.supplierId !== c.supplierId) return false
  if (r.categoryId && r.categoryId !== c.categoryId) return false
  if (r.brand && r.brand !== c.brand) return false
  if (r.skuPattern && !likeToRegExp(r.skuPattern).test(c.sku)) return false
  if (r.costMin != null && c.costNet < r.costMin) return false
  if (r.costMax != null && c.costNet > r.costMax) return false
  if (r.validFrom && c.on < r.validFrom) return false
  if (r.validTo && c.on > r.validTo) return false
  return true
}

/** Lo stesso `LIKE` di Postgres, così pannello e database concordano. */
function likeToRegExp(pattern: string): RegExp {
  const body = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".")
  return new RegExp(`^${body}$`, "i")
}

export function pickRule(rules: PriceRule[], c: PriceCtx): PriceRule | null {
  let best: PriceRule | null = null
  let bestScore = -1
  for (const r of rules) {
    if (!matches(r, c)) continue
    const score = specificity(r) * 1000 + r.priority
    if (score > bestScore) { best = r; bestScore = score }
  }
  return best
}

/* ── Applicazione ─────────────────────────────────────────────────────────── */
function applyMarkup(cost: number, r: PriceRule): number {
  switch (r.kind) {
    case "percent_on_cost": return cost * (1 + r.value / 100)
    /* Attenzione al margine: il 30 % di margine NON è il 30 % di ricarico.
       Su un costo di 100 il ricarico dà 130 (margine 23 %), il margine dà
       142,86. Confondere i due è l'errore più caro di tutta questa catena. */
    case "target_margin":   return r.value >= 100 ? cost : cost / (1 - r.value / 100)
    case "fixed_amount":    return cost + r.value
    case "fixed_price":     return r.value
  }
}

export function applyRounding(v: number, kind: RoundingKind): number {
  switch (kind) {
    case "none":         return cents(v)
    case "cents_99":     return Math.floor(v) + 0.99
    case "cents_90":     return Math.floor(v) + 0.90
    case "cents_50":     return Math.round(v * 2) / 2
    case "integer_up":   return Math.ceil(v)
    case "integer_near": return Math.round(v)
  }
}

export function marginPct(priceNet: number, costNet: number): number {
  if (priceNet <= 0) return 0
  return Math.round(((priceNet - costNet) / priceNet) * 1000) / 10
}

/** Il prezzo netto sotto cui non si scende, dato un margine minimo. */
export function floorForMargin(costNet: number, minMarginPct: number): number {
  if (minMarginPct <= 0) return 0
  if (minMarginPct >= 100) return Infinity
  return cents(costNet / (1 - minMarginPct / 100))
}

export function computePrice(rules: PriceRule[], c: PriceCtx): PriceResult {
  const steps: { label: string; value: number }[] = [{ label: "Costo sbarcato", value: cents(c.costNet) }]
  const rule = pickRule(rules, c)

  if (!rule) {
    /* Nessuna regola non è un prezzo zero: è un articolo che non va
       pubblicato. Il chiamante lo lascia `published = false` e lo mostra
       nella lista «senza regola di prezzo». */
    return {
      priceNet: 0, ruleId: null, ruleName: "nessuna regola applicabile",
      marginPct: 0, steps, clamped: null,
    }
  }

  let p = applyMarkup(c.costNet, rule)
  steps.push({ label: labelOf(rule), value: cents(p) })

  let clamped: PriceResult["clamped"] = null

  const floor = floorForMargin(c.costNet, rule.minMarginPct)
  if (p < floor) { p = floor; clamped = "margine_minimo"; steps.push({ label: `Margine minimo ${rule.minMarginPct} %`, value: cents(p) }) }

  if (rule.maxPrice != null && p > rule.maxPrice) {
    p = rule.maxPrice; clamped = "prezzo_massimo"
    steps.push({ label: "Prezzo massimo", value: cents(p) })
  }

  if (rule.rounding !== "none") {
    const before = p
    p = applyRounding(p, rule.rounding)
    /* L'arrotondamento per difetto può far scendere sotto il pavimento:
       in quel caso il pavimento vince e si arrotonda per eccesso. */
    if (p < floor) p = applyRounding(floor + 0.005, rule.rounding === "cents_50" ? "cents_50" : "integer_up")
    if (cents(before) !== cents(p)) steps.push({ label: "Arrotondamento", value: cents(p) })
  }

  const priceNet = cents(p)
  return { priceNet, ruleId: rule.id, ruleName: rule.name, marginPct: marginPct(priceNet, c.costNet), steps, clamped }
}

function labelOf(r: PriceRule): string {
  switch (r.kind) {
    case "percent_on_cost": return `Ricarico ${r.value} %`
    case "target_margin":   return `Margine obiettivo ${r.value} %`
    case "fixed_amount":    return `Aggiunta fissa ${r.value.toFixed(2)} €`
    case "fixed_price":     return "Prezzo imposto"
  }
}

/* ── IVA ──────────────────────────────────────────────────────────────────
   I prezzi si conservano SEMPRE al netto: il lordo è una vista. Un cliente
   intracomunitario e uno italiano leggono lo stesso `price_net` e vedono due
   totali diversi, e nessuno dei due è memorizzato. */
export type TaxRate = { id: string; code: string; rate: number; natura?: string | null }

export function withVat(priceNet: number, tax: TaxRate, opts?: { reverseCharge?: boolean }) {
  const rate = opts?.reverseCharge ? 0 : tax.rate
  const vat = cents(priceNet * rate)
  return {
    net: cents(priceNet),
    vat,
    gross: cents(priceNet + vat),
    rate,
    /* Aliquota zero senza natura è una fattura che lo SdI rifiuta. */
    natura: rate === 0 ? (opts?.reverseCharge ? "N6.9" : tax.natura ?? null) : null,
  }
}
