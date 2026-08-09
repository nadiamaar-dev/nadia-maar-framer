import React, { useMemo, useState } from "react"
import {
  PRODUCTS, eur, num, supplierById, supplierName, type Product,
} from "./data"
import {
  MARKUP_LABEL, ROUNDING_LABEL, TAX_RATES, computePrice, landedCost, ruleLabel, scopeLabel,
  type MarkupKind, type PriceResult, type PriceRule, type RoundingKind,
} from "./pricing"
import { CardHead, ExportBtn, MetricTile, Sheet, Stamp } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   REGOLE DI PREZZO
   Il prezzo di vendita non si scrive: si ricava dal costo. Qui si governa la
   regola, e la tabella accanto mostra subito su quali articoli cade e che
   cosa produce — perché un motore di prezzo di cui non si vede l'effetto non
   viene adottato: si continua a scrivere i prezzi a mano.

   Il calcolo è quello vero (`pricing.ts`, gemello del modulo sul server):
   muovere il cursore ricalcola riga per riga, non anima una barra.
══════════════════════════════════════════════════════════════════════════ */

type Row = { p: Product; costo: number; res: PriceResult }

export default function ScreenPrezzi({ rules, onRule, onToggle }: {
  rules: PriceRule[]
  onRule: (id: string, patch: Partial<PriceRule>) => void
  onToggle: (id: string) => void
}) {
  const [sel, setSel] = useState<string>(rules[0]?.id ?? "")
  const [open, setOpen] = useState<string | null>(null)
  const rule = rules.find(r => r.id === sel) ?? rules[0]

  /* Il costo sbarcato del catalogo è già il risultato della catena — cambio,
     sconto di contratto, trasporto ammortizzato — perché nel sistema vero
     arriva dalla vista dell'offerta migliore, calcolato durante la
     sincronizzazione. Rifarlo qui lo conterebbe due volte: `landedCost` resta
     dov'è di casa, sul server. Qui si parte dal numero e si prezza. */
  const rows = useMemo<Row[]>(() => PRODUCTS.map(p => {
    const costo = p.costo
    return {
      p, costo,
      res: computePrice(rules, { sku: p.sku, supplierId: p.fornitore, category: p.category, costNet: costo }),
    }
  }), [rules])

  const coperti = rows.filter(r => r.res.ruleId).length
  const scoperti = rows.length - coperti
  const suQuesta = rows.filter(r => r.res.ruleId === rule?.id)
  const margine = suQuesta.length
    ? Math.round(suQuesta.reduce((a, r) => a + r.res.margin, 0) / suQuesta.length * 10) / 10
    : 0
  /* Scostamento dal listino in vigore: è il numero che dice se pubblicare la
     regola è un ritocco o un terremoto. */
  const delta = rows.length
    ? Math.round(rows.reduce((a, r) => a + (r.res.priceNet - r.p.listino), 0) / rows.length * 100) / 100
    : 0

  return (
    <div>
      <div className="vt-grid vt-grid-4">
        <MetricTile label="Con regola" value={`${coperti} / ${rows.length}`} />
        <MetricTile label="Senza regola" value={num(scoperti)} variant={scoperti ? "accent" : "plain"} />
        <MetricTile label="Margine medio" value={`${num(margine, 1)} %`} variant="dark" />
        <MetricTile label="Scostamento" value={eur(delta)} />
      </div>

      <div className="vt-grid vt-grid-side" style={{ marginTop: 16 }}>
        {/* ── l'elenco delle regole ─────────────────────────────────────── */}
        <Sheet>
          <CardHead title="Regole" sub="Vince la più specifica; a parità, la priorità più alta." />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rules.map(r => {
              const n = rows.filter(x => x.res.ruleId === r.id).length
              return (
                <button key={r.id} type="button"
                  className={`vt-rule${r.active ? "" : " is-off"}`}
                  aria-pressed={r.id === sel} onClick={() => setSel(r.id)}>
                  <span className="vt-rule-prio" title="Priorità">{r.priority}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span className="vt-h3" style={{ display: "block" }}>{r.name}</span>
                    <span className="vt-micro" style={{ display: "block", marginTop: 2 }}>
                      {scopeLabel(r, supplierName)}
                    </span>
                  </span>
                  <span style={{ textAlign: "right", flexShrink: 0 }}>
                    <span className="vt-data" style={{ display: "block" }}>{ruleLabel(r)}</span>
                    <span className="vt-micro">{r.active ? `${n} articoli` : "spenta"}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className="vt-micro" style={{ marginTop: 14 }}>
            Specificità: codice 8 · categoria 2 · fornitore 1 · fascia di costo 1.
            «Valvolame a codice» batte «Rossi · ricarico standard» anche se ha priorità più bassa.
          </p>
        </Sheet>

        {/* ── l'editor della regola scelta ──────────────────────────────── */}
        <Sheet>
          {rule && (
            <>
              <CardHead
                title={rule.name}
                sub={scopeLabel(rule, supplierName)}
                right={
                  <button type="button" role="switch" aria-checked={rule.active}
                    aria-label={`Regola ${rule.name} attiva`}
                    className="vt-switch" onClick={() => onToggle(rule.id)} />
                }
              />

              <label>
                <span className="vt-field-label">Come si ricarica</span>
                <select className="vt-select" value={rule.kind}
                  onChange={e => onRule(rule.id, { kind: e.target.value as MarkupKind })}>
                  {(Object.keys(MARKUP_LABEL) as MarkupKind[]).map(k =>
                    <option key={k} value={k}>{MARKUP_LABEL[k]}</option>)}
                </select>
              </label>
              <p className="vt-micro" style={{ marginTop: 6 }}>
                Ricarico e margine non sono la stessa cosa: su un costo di 100, il 30 % di
                ricarico dà 130 (margine 23 %), il 30 % di margine dà 142,86.
              </p>

              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="vt-field-label" style={{ marginBottom: 0 }}>
                    {rule.kind === "fixed_amount" ? "Aggiunta" : rule.kind === "fixed_price" ? "Prezzo" : "Valore"}
                  </span>
                  <span className="vt-data-lg">
                    {rule.kind === "fixed_amount" || rule.kind === "fixed_price"
                      ? eur(rule.value) : `${num(rule.value, rule.value % 1 ? 1 : 0)} %`}
                  </span>
                </div>
                <input type="range" className="vt-range"
                  min={0} max={rule.kind === "target_margin" ? 80 : rule.kind === "percent_on_cost" ? 150 : 300}
                  step={rule.kind === "fixed_amount" || rule.kind === "fixed_price" ? 0.5 : 1}
                  value={rule.value} aria-label="Valore della regola"
                  onChange={e => onRule(rule.id, { value: Number(e.target.value) })} />
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="vt-field-label" style={{ marginBottom: 0 }}>Margine minimo</span>
                  <span className="vt-data-lg">{num(rule.minMargin)} %</span>
                </div>
                <input type="range" className="vt-range" min={0} max={60} step={1}
                  value={rule.minMargin} aria-label="Margine minimo"
                  onChange={e => onRule(rule.id, { minMargin: Number(e.target.value) })} />
                <p className="vt-micro" style={{ marginTop: 4 }}>
                  Rete di sicurezza: qualunque cosa dica la regola, sotto questo margine non si vende.
                  Un fornitore che sbaglia un decimale nel feed non ci fa vendere in perdita.
                </p>
              </div>

              <label style={{ display: "block", marginTop: 16 }}>
                <span className="vt-field-label">Arrotondamento</span>
                <select className="vt-select" value={rule.rounding}
                  onChange={e => onRule(rule.id, { rounding: e.target.value as RoundingKind })}>
                  {(Object.keys(ROUNDING_LABEL) as RoundingKind[]).map(k =>
                    <option key={k} value={k}>{ROUNDING_LABEL[k]}</option>)}
                </select>
              </label>

              <div style={{ marginTop: 18, padding: 14, borderRadius: "var(--vt-r-tile)", background: "var(--vt-sheet-alt)" }}>
                <span className="vt-field-label">Effetto</span>
                <p className="vt-small">
                  Cade su <strong>{suQuesta.length}</strong> articoli
                  {suQuesta.length > 0 && <> con un margine medio del <strong>{num(margine, 1)} %</strong></>}.
                  {!rule.active && <> La regola è spenta: gli articoli passano a quella sotto.</>}
                </p>
              </div>
            </>
          )}
        </Sheet>
      </div>

      {/* ── l'impatto, articolo per articolo ──────────────────────────────── */}
      <Sheet style={{ marginTop: 16 }}>
        <CardHead
          title="Impatto sul catalogo"
          sub="Costo sbarcato, regola vincente, prezzo che ne esce e scostamento dal listino in vigore."
          right={<ExportBtn name="impatto-prezzi.csv" rows={() => [
            ["Codice", "Articolo", "Fornitore", "Costo", "Regola", "Prezzo calcolato", "Listino", "Scostamento", "Margine %"],
            ...rows.map(r => [r.p.sku, r.p.name, r.p.fornitore, r.costo, r.res.ruleName,
              r.res.priceNet, r.p.listino, Math.round((r.res.priceNet - r.p.listino) * 100) / 100, r.res.margin]),
          ]} />}
        />
        <div style={{ overflowX: "auto" }}>
          <table className="vt-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: 116 }}>Codice</th>
                <th scope="col">Articolo</th>
                <th scope="col" style={{ width: 108 }}>Fornitore</th>
                <th scope="col" style={{ width: 96, textAlign: "right" }}>Costo</th>
                <th scope="col" style={{ width: 168 }}>Regola</th>
                <th scope="col" style={{ width: 104, textAlign: "right" }}>Prezzo</th>
                <th scope="col" style={{ width: 108, textAlign: "right" }}>Scostamento</th>
                <th scope="col" style={{ width: 88, textAlign: "right" }}>Margine</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const scost = Math.round((r.res.priceNet - r.p.listino) * 100) / 100
                const isOpen = open === r.p.sku
                return (
                  <React.Fragment key={r.p.sku}>
                    <tr className="vt-clickable" onClick={() => setOpen(isOpen ? null : r.p.sku)}>
                      <td><span className="vt-code">{r.p.sku}</span></td>
                      <td className="vt-ell">{r.p.name}</td>
                      <td className="vt-muted">{r.p.fornitore}</td>
                      <td className="vt-num">{eur(r.costo)}</td>
                      <td>
                        {r.res.ruleId
                          ? <span className="vt-small">{r.res.ruleName}</span>
                          : <Stamp tone="ambra">senza regola</Stamp>}
                        {r.res.clamped && (
                          <span className="vt-micro" style={{ display: "block", marginTop: 2 }}>
                            {r.res.clamped === "margine" ? "alzato al margine minimo" : "abbassato al tetto"}
                          </span>
                        )}
                      </td>
                      <td className="vt-num">{r.res.priceNet ? eur(r.res.priceNet) : "—"}</td>
                      <td className="vt-num" style={{
                        color: !r.res.priceNet ? "var(--vt-ink-faint)"
                          : scost > 0 ? "var(--vt-ok)" : scost < 0 ? "var(--vt-bad)" : "var(--vt-ink-faint)",
                      }}>
                        {r.res.priceNet ? `${scost > 0 ? "+" : ""}${eur(scost)}` : "—"}
                      </td>
                      <td className="vt-num">{r.res.priceNet ? `${num(r.res.margin, 1)} %` : "—"}</td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={8} style={{ background: "var(--vt-sheet-alt)", padding: "14px" }}>
                          <span className="vt-field-label">Come si arriva a questo prezzo</span>
                          <div className="vt-steps">
                            {r.res.steps.map((st, i) => (
                              <React.Fragment key={st.label}>
                                {i > 0 && <span className="vt-step-arrow" aria-hidden>→</span>}
                                <span className={`vt-step-pill${i === r.res.steps.length - 1 ? " is-last" : ""}`}>
                                  {st.label}<b>{eur(st.value)}</b>
                                </span>
                              </React.Fragment>
                            ))}
                          </div>
                          <p className="vt-micro" style={{ marginTop: 10 }}>
                            Fornitore {supplierName(r.p.fornitore)} · consegna {supplierById(r.p.fornitore).leadTime} giorni
                            {r.p.dropship && " · spedizione diretta al cliente"}
                          </p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Sheet>

      {/* ── IVA ───────────────────────────────────────────────────────────── */}
      <Sheet style={{ marginTop: 16 }}>
        <CardHead title="Aliquote IVA" sub="I prezzi si conservano al netto: il lordo è una vista, non un dato memorizzato." />
        <div style={{ overflowX: "auto" }}>
          <table className="vt-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: 100 }}>Codice</th>
                <th scope="col">Descrizione</th>
                <th scope="col" style={{ width: 100, textAlign: "right" }}>Aliquota</th>
                <th scope="col" style={{ width: 130 }}>Natura SdI</th>
                <th scope="col" style={{ width: 150, textAlign: "right" }}>Esempio su 100 €</th>
              </tr>
            </thead>
            <tbody>
              {TAX_RATES.map(t => (
                <tr key={t.code}>
                  <td><span className="vt-code">{t.code}</span></td>
                  <td>{t.label}</td>
                  <td className="vt-num">{num(t.rate * 100)} %</td>
                  <td className="vt-muted">{t.natura ?? "—"}</td>
                  <td className="vt-num">{eur(100 * (1 + t.rate))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="vt-micro" style={{ marginTop: 12 }}>
          Un'aliquota a zero senza natura è una fattura che lo SdI rifiuta: il campo è
          obbligatorio, non decorativo.
        </p>
      </Sheet>
    </div>
  )
}
