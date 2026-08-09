import React, { useMemo, useState } from "react"
import {
  CATEGORIES, PRODUCTS, contractPrice, marginPct, scaglionePrice,
  eur, num, type Category, type Customer, type Product, type RoleId,
} from "./data"
import { CardHead, Denied, ExportBtn, QtyStep, Sheet, Stamp } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   CATALOGO RISERVATO
   Il momento centrale della demo: cambiare "Operi come" ririprezza l'intero
   catalogo all'istante e ridisegna ogni filo contratto da sinistra a destra.
   Il prezzo che vale per te non è scritto: è sottolineato.
══════════════════════════════════════════════════════════════════════════ */

function Availability({ p }: { p: Product }) {
  if (p.stock === 0) return (
    <span>
      <Stamp tone="oxide">Esaurito</Stamp>
      {p.restock && <span className="vt-micro" style={{ display: "block", marginTop: 3 }}>dal {p.restock}</span>}
    </span>
  )
  if (p.stock < 50) return <Stamp tone="ambra">{`Scorta ${num(p.stock)}`}</Stamp>
  return <Stamp tone="verified">{`${num(p.stock)} ${p.um}`}</Stamp>
}

export default function ScreenCatalogo({
  role, customer, cart, setQty, onAdd, extraSconto, setExtraSconto, showMargins, onImport, onQuote, onConfigure,
}: {
  role: RoleId
  customer: Customer
  cart: Record<string, number>
  setQty: (sku: string, n: number) => void
  onAdd: (sku: string) => void
  extraSconto: number
  setExtraSconto: (n: number) => void
  /* l'interruttore nelle impostazioni: nasconde le colonne economiche
     quando si mostra lo schermo al cliente */
  showMargins: boolean
  /* apre l'incolla-righe dal gestionale del compratore */
  onImport: () => void
  /* le voci fuori listino passano da una richiesta di quotazione */
  onQuote: (sku: string) => void
  /* le famiglie con varianti si compongono, non si scelgono da un elenco */
  onConfigure: (sku: string) => void
}) {
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<Category | null>(null)
  const [onlyStock, setOnlyStock] = useState(false)
  const [open, setOpen] = useState<string | null>(null)

  const showMargin = (role === "agente" || role === "admin") && showMargins
  const showCost = role === "admin" && showMargins
  /* Da quando il catalogo è alimentato da piu fornitori, «chi lo fornisce» è
     una domanda operativa: cambia il tempo di consegna e chi spedisce. */
  const showSupplier = role === "admin"
  const sconto = customer.sconto + (role === "agente" ? extraSconto : 0)

  const rows = useMemo(() => PRODUCTS.filter(p => {
    if (cat && p.category !== cat) return false
    if (onlyStock && p.stock === 0) return false
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      return p.sku.toLowerCase().includes(t) || p.name.toLowerCase().includes(t)
    }
    return true
  }), [q, cat, onlyStock])

  return (
    <div>
      <Sheet>
        <CardHead
          title="Catalogo riservato"
          sub={`Listino ${customer.listino} · sconto base ${num(customer.sconto)} % su ${customer.name}`}
          right={
            <span style={{ display: "flex", gap: 8 }}>
              <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm" onClick={onImport}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M8 10.5V3M5 5.8L8 3l3 2.8M3 12.5h10" />
                </svg>
                Importa righe
              </button>
              <ExportBtn name="catalogo-valtecnica.csv" rows={() => [
                ["Codice", "Descrizione", "U.M.", "Disponibilita", "Listino", "Prezzo contratto", "Sconto %"],
                ...rows.map(p => [p.sku, p.name, p.um, p.stock,
                  p.listino.toFixed(2).replace(".", ","),
                  contractPrice(p, sconto).toFixed(2).replace(".", ","), sconto]),
              ]} />
            </span>
          }
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="vt-input" style={{ width: 280 }} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Cerca codice o descrizione" aria-label="Cerca nel catalogo"
          />
          <button type="button" className="vt-chip" aria-pressed={cat === null} onClick={() => setCat(null)}>Tutte</button>
          {CATEGORIES.map(c => (
            <button key={c} type="button" className="vt-chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
          ))}
          <button type="button" className="vt-chip" aria-pressed={onlyStock} onClick={() => setOnlyStock(v => !v)}>
            Solo disponibili
          </button>
        </div>

        {role === "agente" && (
          <>
            <div style={{ height: 1, background: "var(--vt-line-soft)", margin: "18px -20px" }} />
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ minWidth: 260 }}>
                <span className="vt-field-label">Sconto extra concesso · max 5 %</span>
                <input
                  type="range" min={0} max={5} step={0.5} value={extraSconto}
                  onChange={e => setExtraSconto(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--vt-accent)" }}
                />
              </label>
              <span className="vt-data-lg">{num(extraSconto, 1)} %</span>
              {extraSconto >= 5 && (
                <span className="vt-small vt-muted">Oltre il 5 % serve approvazione back-office.</span>
              )}
            </div>
          </>
        )}
      </Sheet>

      <Sheet style={{ marginTop: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="vt-table vt-table-tall" style={{ minWidth: showSupplier ? 1300 : 1160 }}>
            <thead>
              <tr>
                <th scope="col" style={{ width: 142 }}>Codice</th>
                <th scope="col" style={{ minWidth: 300 }}>Descrizione</th>
                <th scope="col" style={{ width: 56 }}>U.M.</th>
                <th scope="col" style={{ width: 128 }}>Disponibilità</th>
                {showSupplier && <th scope="col" style={{ width: 132 }}>Fornitore</th>}
                {showCost && <th scope="col" style={{ width: 100, textAlign: "right" }}>Costo</th>}
                {showMargin && <th scope="col" style={{ width: 86, textAlign: "right" }}>Margine</th>}
                <th scope="col" style={{ width: 210, textAlign: "right" }}>Prezzo</th>
                <th scope="col" style={{ width: 128 }}>Q.tà</th>
                <th scope="col" style={{ width: 118 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map(p => {
                const inCart = cart[p.sku] ?? 0
                const price = contractPrice(p, sconto, Math.max(1, inCart))
                const isOpen = open === p.sku
                return (
                  <React.Fragment key={p.sku}>
                    <tr className="vt-clickable" onClick={() => setOpen(isOpen ? null : p.sku)}>
                      <td><span className="vt-code">{p.sku}</span></td>
                      <td>{p.name}</td>
                      <td className="vt-muted">{p.um}</td>
                      <td><Availability p={p} /></td>
                      {showSupplier && (
                        <td>
                          <span className="vt-small" style={{ display: "block" }}>{p.fornitore}</span>
                          {p.dropship && <span className="vt-micro">spedizione diretta</span>}
                        </td>
                      )}
                      {showCost && <td className="vt-num">{eur(p.costo)}</td>}
                      {showMargin && <td className="vt-num">{num(marginPct(p, price), 1)} %</td>}
                      <td>
                        {/* il momento del prezzo: listino sbarrato sopra,
                            prezzo contratto e sconto sulla stessa riga.
                            Sulle voci fuori listino non si scrive una cifra
                            che poi cambia in trattativa. */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                          {p.suRichiesta ? (
                            <span className="vt-small vt-muted">Prezzo su richiesta</span>
                          ) : (<>
                          <span className="vt-micro" style={{ textDecoration: "line-through" }}>
                            {eur(p.listino)}
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span className="vt-data-lg" key={price}>{eur(price)}</span>
                            <span style={{
                              padding: "2px 7px", borderRadius: 999,
                              background: "var(--vt-accent-wash)", color: "var(--vt-accent-deep)",
                              fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                            }}>−{num(sconto, sconto % 1 ? 1 : 0)} %</span>
                          </span></>)}
                        </div>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <QtyStep value={inCart} lotto={p.lotto} onChange={n => setQty(p.sku, n)} />
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {p.suRichiesta ? (
                          <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm"
                            onClick={() => onQuote(p.sku)}>Richiedi quota</button>
                        ) : p.configurabile ? (
                          <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm"
                            onClick={() => onConfigure(p.sku)}>Configura</button>
                        ) : (
                          <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm"
                            disabled={p.stock === 0} onClick={() => onAdd(p.sku)}>Aggiungi</button>
                        )}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={20} style={{ background: "var(--vt-sheet-alt)", padding: "14px 10px" }}>
                          <span className="vt-label" style={{ display: "block", marginBottom: 8 }}>Scaglioni quantità · lotto minimo {p.lotto} {p.um}</span>
                          {p.scaglioni.map(s => {
                            const active = inCart >= s.da && (s.a === null || inCart <= s.a)
                            return (
                              <div
                                key={s.da}
                                style={{
                                  display: "flex", justifyContent: "space-between", gap: 16, maxWidth: 380,
                                  padding: "7px 10px", borderTop: "1px solid var(--vt-line-soft)",
                                  borderLeft: active ? "2px solid var(--vt-accent)" : "2px solid transparent",
                                  background: active ? "var(--vt-accent-wash)" : "transparent",
                                }}
                              >
                                <span className="vt-small">
                                  {s.a === null ? `${s.da}+ ${p.um}` : `${s.da} – ${s.a} ${p.um}`}
                                </span>
                                <span className="vt-data">{eur(scaglionePrice(p, sconto, s.extra))}</span>
                              </div>
                            )
                          })}
                          {role === "cliente" && (
                            <div style={{ marginTop: 12, maxWidth: 520 }}>
                              <Denied>
                                Costo d'acquisto e margine non sono disponibili per il tuo ruolo (403).
                              </Denied>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <p className="vt-body vt-muted" style={{ padding: 24, textAlign: "center" }}>
            Nessun articolo per questi filtri.
          </p>
        )}
      </Sheet>

      <p className="vt-label" style={{ marginTop: 16 }}>
        {showCost
          ? "Il costo d'acquisto è visibile solo al ruolo Amministratore."
          : showMargin
            ? "Il margine è derivato: il costo d'acquisto non raggiunge il ruolo Agente."
            : "Il tuo ruolo vede il prezzo contratto, non il listino interno né il margine."}
      </p>
    </div>
  )
}
