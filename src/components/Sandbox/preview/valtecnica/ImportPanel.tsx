import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { contractPrice, eur, num, parseImport, productBySku, type ImportRow } from "./data"

/* ══════════════════════════════════════════════════════════════════════════
   IMPORTAZIONE RIGHE
   Il compratore B2B non naviga il catalogo: incolla l'elenco che ha già nel
   proprio gestionale. Qui lo si accetta in tre formati, si valida riga per
   riga contro lotto minimo e disponibilità, e si dice cosa non torna PRIMA
   di mettere qualcosa nel carrello.
══════════════════════════════════════════════════════════════════════════ */

const ESEMPIO = `VLV-4471-B;60
RCC-2208-Z;400
STR-3120-M 40
PMP-8801-C,6`

export default function ImportPanel({ sconto, onConfirm, onClose }: {
  sconto: number
  onConfirm: (rows: { sku: string; qty: number }[]) => void
  onClose: () => void
}) {
  const [text, setText] = useState("")
  const rows = useMemo<ImportRow[]>(() => (text.trim() ? parseImport(text) : []), [text])
  const ok = rows.filter(r => !r.error && r.sku && r.qty) as { sku: string; qty: number; raw: string }[]
  const bad = rows.filter(r => r.error)
  const totale = ok.reduce((a, r) => a + r.qty * contractPrice(productBySku(r.sku), sconto, r.qty), 0)

  return (
    <div className="vt-palette-scrim" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="vt-palette" style={{ maxWidth: 640 }} role="dialog" aria-label="Importa righe d'ordine"
        initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>

        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid var(--vt-line-soft)", display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <h3 className="vt-h2">Importa righe</h3>
            <p className="vt-small vt-muted" style={{ marginTop: 4 }}>
              Incolla dal tuo gestionale: un articolo per riga, codice e quantità.
              Separatore punto e virgola, virgola o spazio.
            </p>
          </div>
          <button type="button" className="vt-icon-btn" onClick={onClose} aria-label="Chiudi" style={{ marginLeft: "auto" }}>✕</button>
        </div>

        <div style={{ padding: "16px 22px 0" }}>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder={ESEMPIO} aria-label="Righe da importare"
            spellCheck={false}
            style={{
              width: "100%", height: 132, padding: 14, resize: "vertical",
              background: "var(--vt-sheet-alt)", border: 0, borderRadius: 14,
              fontSize: 13.5, lineHeight: 1.7, color: "var(--vt-ink)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          />
          {!text.trim() && (
            <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" style={{ marginTop: 8 }}
              onClick={() => setText(ESEMPIO)}>
              Inserisci un esempio
            </button>
          )}
        </div>

        {rows.length > 0 && (
          <div className="vt-palette-list" style={{ padding: "12px 22px 0" }}>
            {ok.length > 0 && (
              <>
                <div className="vt-palette-group">Righe valide · {ok.length}</div>
                {ok.map((r, i) => {
                  const p = productBySku(r.sku)
                  const price = contractPrice(p, sconto, r.qty)
                  return (
                    <div key={`${r.sku}-${i}`} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "9px 0",
                      borderTop: "1px solid var(--vt-line-soft)",
                    }}>
                      <span className="vt-code" style={{ width: 118, flexShrink: 0 }}>{p.sku}</span>
                      <span className="vt-small" style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                      </span>
                      <span className="vt-data" style={{ flexShrink: 0 }}>{num(r.qty)} {p.um}</span>
                      <span className="vt-data" style={{ width: 92, textAlign: "right", flexShrink: 0 }}>
                        {eur(r.qty * price)}
                      </span>
                    </div>
                  )
                })}
              </>
            )}

            {bad.length > 0 && (
              <>
                <div className="vt-palette-group" style={{ color: "var(--vt-bad)" }}>
                  Righe da correggere · {bad.length}
                </div>
                {bad.map((r, i) => (
                  <div key={`b-${i}`} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "9px 0",
                    borderTop: "1px solid var(--vt-line-soft)",
                  }}>
                    <span className="vt-code" style={{ width: 118, flexShrink: 0, color: "var(--vt-bad)" }}>
                      {r.sku ?? "—"}
                    </span>
                    <span className="vt-small vt-muted" style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      «{r.raw}»
                    </span>
                    <span className="vt-micro" style={{ color: "var(--vt-bad)", flexShrink: 0 }}>{r.error}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <div className="vt-pop-foot" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px" }}>
          <span className="vt-small vt-muted">
            {ok.length === 0 ? "Nessuna riga valida" : <>Totale imponibile <span className="vt-data">{eur(totale)}</span></>}
          </span>
          <span style={{ flex: 1 }} />
          <button type="button" className="vt-btn vt-btn-secondary" onClick={onClose}>Annulla</button>
          <button type="button" className="vt-btn vt-btn-primary" disabled={ok.length === 0}
            onClick={() => { onConfirm(ok.map(r => ({ sku: r.sku, qty: r.qty }))); onClose() }}>
            Aggiungi {ok.length > 0 ? `${ok.length} righe` : ""}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
