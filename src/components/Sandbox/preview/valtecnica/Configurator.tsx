import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  CONFIG_AXES, DEFAULT_CONFIG, configListino, configSku, eur, num,
  type Config, type Product,
} from "./data"

/* ══════════════════════════════════════════════════════════════════════════
   CONFIGURATORE DI PRODOTTO
   In una nicchia tecnica il catalogo non è un elenco di articoli, è una
   famiglia di varianti: ogni scelta cambia il codice e il prezzo. Qui il
   codice si ricompone davanti a chi guarda, che è la dimostrazione.
══════════════════════════════════════════════════════════════════════════ */

export default function Configurator({ product, sconto, onAdd, onClose }: {
  product: Product
  sconto: number
  onAdd: (sku: string, qty: number, prezzo: number) => void
  onClose: () => void
}) {
  const [cfg, setCfg] = useState<Config>(DEFAULT_CONFIG)
  const [qty, setQty] = useState(product.lotto)

  const sku = useMemo(() => configSku(cfg), [cfg])
  const listino = useMemo(() => configListino(product.listino, cfg), [product.listino, cfg])
  const prezzo = Math.round(listino * (1 - sconto / 100) * 100) / 100

  return (
    <div className="vt-palette-scrim" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="vt-palette" style={{ maxWidth: 680, maxHeight: "min(84vh,720px)" }}
        role="dialog" aria-label="Configuratore di prodotto"
        initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>

        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--vt-line-soft)", display: "flex", gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h3 className="vt-h2">Configura la valvola</h3>
            <p className="vt-small vt-muted" style={{ marginTop: 4 }}>
              Ogni scelta ricompone il codice e aggiorna il prezzo alle tue condizioni.
            </p>
          </div>
          <button type="button" className="vt-icon-btn" onClick={onClose} aria-label="Chiudi" style={{ marginLeft: "auto" }}>✕</button>
        </div>

        <div className="vt-palette-list" style={{ padding: "18px 24px 8px" }}>
          {CONFIG_AXES.map(ax => (
            <div key={ax.id} style={{ marginBottom: 20 }}>
              <span className="vt-field-label">{ax.label}</span>
              <p className="vt-micro" style={{ marginTop: -3, marginBottom: 9 }}>{ax.hint}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ax.options.map(o => {
                  const on = cfg[ax.id] === o.id
                  return (
                    <button key={o.id} type="button" className="vt-chip" aria-pressed={on}
                      onClick={() => setCfg(c => ({ ...c, [ax.id]: o.id }))}>
                      {o.label}
                      {o.delta !== 0 && (
                        <span className="vt-chip-n">
                          {o.delta > 0 ? "+" : "−"}{eur(Math.abs(o.delta)).replace("€ ", "")}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* il risultato: codice generato e prezzo alle condizioni del cliente */}
        <div style={{ padding: "16px 24px", background: "var(--vt-sheet-alt)", display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <span className="vt-label">Codice generato</span>
            <div className="vt-data-lg" key={sku} style={{ marginTop: 4 }}>{sku}</div>
          </div>
          <div>
            <span className="vt-label">Listino</span>
            <div className="vt-small" key={listino} style={{ marginTop: 6, textDecoration: "line-through", color: "var(--vt-ink-faint)" }}>
              {eur(listino)}
            </div>
          </div>
          <div>
            <span className="vt-label">Il tuo prezzo</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span className="vt-figure" key={prezzo}>{eur(prezzo)}</span>
              <span style={{
                padding: "2px 7px", borderRadius: 999, background: "var(--vt-accent-wash)",
                color: "var(--vt-accent-deep)", fontSize: 11, fontWeight: 600,
              }}>−{num(sconto, sconto % 1 ? 1 : 0)} %</span>
            </div>
          </div>
        </div>

        <div className="vt-pop-foot" style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 24px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span className="vt-label" style={{ whiteSpace: "nowrap" }}>Quantità</span>
            <input className="vt-input" style={{ width: 90, height: 36 }} value={qty} inputMode="numeric"
              aria-label="Quantità"
              onChange={e => setQty(Math.max(0, parseInt(e.target.value || "0", 10) || 0))} />
          </label>
          <span className="vt-small vt-muted">
            lotto multiplo di {product.lotto} · totale {eur(prezzo * qty)}
          </span>
          <span style={{ flex: 1 }} />
          <button type="button" className="vt-btn vt-btn-secondary" onClick={onClose}>Annulla</button>
          <button type="button" className="vt-btn vt-btn-primary"
            disabled={qty <= 0 || qty % product.lotto !== 0}
            onClick={() => { onAdd(sku, qty, prezzo); onClose() }}>
            Aggiungi al carrello
          </button>
        </div>
      </motion.div>
    </div>
  )
}
