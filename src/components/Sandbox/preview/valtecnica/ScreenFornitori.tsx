import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  AUTH_LABEL, SUPPLIER_STATE_LABEL, SYNC_PHASES, SYNC_STATUS_LABEL, TRANSPORT_LABEL,
  eur, num, productsOf, type Supplier, type SyncRun, type SyncStatus,
} from "./data"
import { CardHead, ExportBtn, MetricTile, Sheet, Stamp } from "./parts"
import { Ico } from "./Chrome"

/* ══════════════════════════════════════════════════════════════════════════
   FORNITORI
   Il catalogo non si scrive più a mano: quattro connessioni lo alimentano.
   Questa schermata risponde a tre domande, in quest'ordine — chi è collegato,
   quando ha parlato l'ultima volta, e che cosa ha cambiato.

   L'avanzamento della corsa non è una barra che scorre per far scena: sono
   le fasi vere di `docs/supplier-sync/src/sync.ts`, con i contatori che si
   riempiono man mano.
══════════════════════════════════════════════════════════════════════════ */

export type SyncLive = { supplierId: string; phase: number; read: number; updated: number } | null

const statusTone = (s: SyncStatus) =>
  s === "ok" ? "verified" : s === "parziale" ? "ambra" : s === "errore" ? "oxide" : "neutral"

const stateTone = (s: Supplier["state"]) =>
  s === "attivo" ? "verified" : s === "errore" ? "oxide" : s === "sospeso" ? "ambra" : "neutral"

export default function ScreenFornitori({ suppliers, runs, live, onOpen, onSync, onNew }: {
  suppliers: Supplier[]
  runs: SyncRun[]
  live: SyncLive
  onOpen: (id: string) => void
  onSync: (id: string) => void
  onNew: () => void
}) {
  const attivi = suppliers.filter(s => s.state === "attivo").length
  const offerte = suppliers.reduce((a, s) => a + s.offers, 0)
  const daAbbinare = suppliers.reduce((a, s) => a + s.unmatched, 0)
  const inErrore = suppliers.filter(s => s.state === "errore").length
  const cambi = runs.slice(0, 8).reduce((a, r) => a + r.priceChanged, 0)

  return (
    <div>
      {/* Etichette corte apposta: .vt-label non va a capo (nowrap+ellipsis),
          quindi una frase lunga qui si tronca a "Connessioni att…" prima
          ancora che il tema sia una questione di colonne. */}
      <div className="vt-grid vt-grid-4">
        <MetricTile label="Connessioni" value={`${attivi} / ${suppliers.length}`} />
        <MetricTile label="Articoli" value={num(offerte)} />
        <MetricTile label="Ricalcoli oggi" value={num(cambi)} variant="dark" />
        <MetricTile label="Da abbinare" value={num(daAbbinare)} variant={daAbbinare ? "accent" : "plain"} />
      </div>

      {inErrore > 0 && (
        <div style={{
          marginTop: 16, padding: "13px 16px", borderRadius: "var(--vt-r-tile)",
          background: "var(--vt-bad-wash)", color: "var(--vt-bad)",
          display: "flex", alignItems: "center", gap: 11, fontSize: 13.5,
        }}>
          <Ico n="bell" size={16} />
          <span>
            {inErrore === 1 ? "Una connessione è in errore" : `${inErrore} connessioni sono in errore`}: il
            catalogo continua a servire l'ultimo dato buono, ma i costi non si stanno aggiornando.
          </span>
        </div>
      )}

      <Sheet style={{ marginTop: 16 }}>
        <CardHead
          title="Connessioni"
          sub="Un fornitore, un formato, un ritmo. La mappatura dei campi è un dato, non del codice."
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <ExportBtn name="fornitori.csv" rows={() => [
                ["Codice", "Fornitore", "Paese", "Trasporto", "Ritmo", "Stato", "Offerte", "Ultima corsa"],
                ...suppliers.map(s => [s.id, s.name, s.country, TRANSPORT_LABEL[s.transport], s.cronLabel,
                  SUPPLIER_STATE_LABEL[s.state], s.offers, s.lastRun]),
              ]} />
              <button type="button" className="vt-btn vt-btn-primary vt-btn-sm" onClick={onNew}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M8 3.5v9M3.5 8h9" /></svg>
                Nuovo fornitore
              </button>
            </div>
          }
        />

        <div style={{ overflowX: "auto" }}>
          <table className="vt-table vt-table-tall">
            <thead>
              <tr>
                <th scope="col">Fornitore</th>
                <th scope="col" style={{ width: 200 }}>Integrazione</th>
                <th scope="col" style={{ width: 150 }}>Ritmo</th>
                <th scope="col" style={{ width: 168 }}>Ultima corsa</th>
                <th scope="col" style={{ width: 110, textAlign: "right" }}>Offerte</th>
                <th scope="col" style={{ width: 130 }} />
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => {
                const isLive = live?.supplierId === s.id
                return (
                  <tr key={s.id} className="vt-clickable" onClick={() => onOpen(s.id)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                        <span className="vt-avatar">{s.country}</span>
                        <span style={{ minWidth: 0 }}>
                          <span className="vt-h3" style={{ display: "block" }}>{s.name}</span>
                          <span className="vt-micro">
                            {s.id} · {s.currency}
                            {s.dropship && " · spedizione diretta"}
                            {s.unmatched > 0 && ` · ${s.unmatched} da abbinare`}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="vt-small" style={{ display: "block" }}>{TRANSPORT_LABEL[s.transport]}</span>
                      <span className="vt-micro">{AUTH_LABEL[s.auth]}</span>
                    </td>
                    <td className="vt-muted">{s.cronLabel}</td>
                    <td>
                      {isLive
                        ? <Stamp tone="neutral">In corso…</Stamp>
                        : <>
                          <Stamp tone={stateTone(s.state)}>{SUPPLIER_STATE_LABEL[s.state]}</Stamp>
                          <span className="vt-micro" style={{ display: "block", marginTop: 4 }}>{s.lastRun}</span>
                        </>}
                    </td>
                    <td className="vt-num">{num(s.offers)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm"
                        disabled={!!live}
                        onClick={e => { e.stopPropagation(); onSync(s.id) }}>
                        {isLive ? "In corso…" : "Sincronizza"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Sheet>

      <Sheet style={{ marginTop: 16 }}>
        <CardHead title="Diario delle corse" sub="Che cosa ha cambiato ogni sincronizzazione, e quanto è costata." />
        <div style={{ overflowX: "auto" }}>
          <table className="vt-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: 116 }}>Corsa</th>
                <th scope="col" style={{ width: 150 }}>Fornitore</th>
                <th scope="col" style={{ width: 150 }}>Quando</th>
                <th scope="col" style={{ width: 130 }}>Esito</th>
                <th scope="col" style={{ width: 92, textAlign: "right" }}>Lette</th>
                <th scope="col" style={{ width: 100, textAlign: "right" }}>Aggiornate</th>
                <th scope="col" style={{ width: 100, textAlign: "right" }}>Prezzi</th>
                <th scope="col" style={{ width: 92, textAlign: "right" }}>Durata</th>
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 10).map(r => (
                <tr key={r.id} className="vt-clickable" onClick={() => onOpen(r.supplierId)}>
                  <td><span className="vt-code">{r.id}</span></td>
                  <td className="vt-ell">{r.supplierId}</td>
                  <td className="vt-muted">{r.when}</td>
                  <td><Stamp tone={statusTone(r.status)}>{SYNC_STATUS_LABEL[r.status]}</Stamp></td>
                  <td className="vt-num">{num(r.read)}</td>
                  <td className="vt-num">{num(r.updated)}</td>
                  <td className="vt-num">{r.priceChanged ? num(r.priceChanged) : "—"}</td>
                  <td className="vt-num">{(r.durationMs / 1000).toFixed(1)} s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="vt-micro" style={{ marginTop: 12 }}>
          «Lette» conta le righe arrivate dal fornitore, «Aggiornate» quelle che erano davvero
          cambiate. La differenza è il lavoro risparmiato dal confronto delle impronte.
        </p>
      </Sheet>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SCHEDA DEL FORNITORE
══════════════════════════════════════════════════════════════════════════ */
type Tab = "panoramica" | "mappatura" | "diario"

export function SupplierDrawer({ supplier, runs, live, onSync, onClose }: {
  supplier: Supplier
  runs: SyncRun[]
  live: SyncLive
  onSync: (id: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>("panoramica")
  const [probe, setProbe] = useState<null | "attesa" | "ok">(null)
  const isLive = live?.supplierId === supplier.id
  const campione = useMemo(() => productsOf(supplier.id).slice(0, 3), [supplier.id])

  return (
    <>
      <div className="vt-drawer-scrim" onClick={onClose} />
      <motion.aside className="vt-drawer" role="dialog" aria-label={`Fornitore ${supplier.name}`}
        initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}>

        <div className="vt-drawer-head">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <span className="vt-avatar" style={{ width: 42, height: 42, fontSize: 13 }}>{supplier.country}</span>
            <div style={{ minWidth: 0 }}>
              <h3 className="vt-h2">{supplier.name}</h3>
              <p className="vt-micro" style={{ marginTop: 3 }}>
                {supplier.id} · {TRANSPORT_LABEL[supplier.transport]} · {supplier.cronLabel}
              </p>
            </div>
            <button type="button" className="vt-icon-btn" onClick={onClose} aria-label="Chiudi"
              style={{ marginLeft: "auto" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 14, borderBottom: "1px solid var(--vt-line-soft)" }}>
            {([["panoramica", "Panoramica"], ["mappatura", "Mappatura"], ["diario", "Diario"]] as const).map(([id, l]) => (
              <button key={id} type="button" className="vt-tab" role="tab"
                aria-selected={tab === id} onClick={() => setTab(id)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="vt-drawer-body">
          {tab === "panoramica" && (
            <>
              <SyncPanel supplier={supplier} live={live} onSync={onSync} />

              <span className="vt-field-label" style={{ marginTop: 22 }}>Connessione</span>
              <div className="vt-map" style={{ gridTemplateColumns: "minmax(0,1fr)", gap: 8 }}>
                <span className="vt-path" title={supplier.endpoint}>{supplier.endpoint}</span>
              </div>
              <Kv rows={[
                ["Autenticazione", AUTH_LABEL[supplier.auth]],
                ["Credenziale", `${supplier.credHint} · ruotata il ${supplier.credRotated}`],
                ["Adattatore", supplier.adapter ?? "dichiarativo (guidato dalla mappatura)"],
                ["Latenza media", supplier.latencyMs ? `${num(supplier.latencyMs)} ms` : "—"],
              ]} />
              <p className="vt-micro" style={{ marginTop: 8 }}>
                La chiave è cifrata nel database e non esce mai da una lettura ordinaria:
                qui se ne vedono le ultime quattro cifre e la data di rotazione.
              </p>

              <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm" style={{ marginTop: 12 }}
                disabled={probe === "attesa"}
                onClick={() => { setProbe("attesa"); setTimeout(() => setProbe("ok"), 900) }}>
                {probe === "attesa" ? "Verifico…" : "Prova connessione"}
              </button>

              {probe === "ok" && (
                <div style={{ marginTop: 12, padding: 14, borderRadius: "var(--vt-r-tile)", background: "var(--vt-sheet-alt)" }}>
                  <span className="vt-small" style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>
                    Risposta in {num(supplier.latencyMs || 340)} ms · campione mappato
                  </span>
                  {campione.map(p => (
                    <div key={p.sku} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
                      <span className="vt-micro" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.sku} · {p.name}
                      </span>
                      <span className="vt-data" style={{ flexShrink: 0 }}>{eur(p.costo)}</span>
                    </div>
                  ))}
                  <p className="vt-micro" style={{ marginTop: 8 }}>
                    Se questi tre valori sono giusti, la mappatura legge i campi giusti su tutte le righe.
                  </p>
                </div>
              )}

              <span className="vt-field-label" style={{ marginTop: 22 }}>Condizioni</span>
              <Kv rows={[
                ["Spedizione diretta", supplier.dropship ? "Sì · spedisce lui al cliente finale" : "No · passa dal nostro magazzino"],
                ["Tempo di consegna", `${supplier.leadTime} giorni lavorativi`],
                ["Sconto di contratto", `${num(supplier.costDiscount)} % sul suo listino`],
                ["Trasporto", supplier.shippingFlat
                  ? `${eur(supplier.shippingFlat)}${supplier.freeOver ? ` · franco sopra ${eur(supplier.freeOver, 0)}` : ""}`
                  : "incluso"],
                ["Ordine minimo", supplier.minOrder ? eur(supplier.minOrder, 0) : "nessuno"],
                ["Valuta", supplier.currency === "EUR" ? "EUR" : `${supplier.currency} · cambio ${supplier.fx}`],
              ]} />
            </>
          )}

          {tab === "mappatura" && (
            <>
              <p className="vt-small vt-muted" style={{ marginBottom: 16 }}>
                Il nostro campo a sinistra, il percorso nella risposta del fornitore a destra.
                Questa tabella è una colonna del database: aggiungere un fornitore non richiede
                un rilascio, solo una mappatura.
              </p>
              <div className="vt-map">
                {supplier.fieldMap.map(m => (
                  <React.Fragment key={m.our}>
                    <span className="vt-data" style={{ minWidth: 0 }}>{m.our}</span>
                    <span className="vt-map-arrow" aria-hidden>←</span>
                    <span style={{ minWidth: 0 }}>
                      <span className="vt-path" style={{ display: "block" }} title={m.their}>{m.their}</span>
                      {(m.transform || m.note) && (
                        <span className="vt-micro" style={{ display: "block", marginTop: 3 }}>
                          {m.transform}{m.transform && m.note ? " · " : ""}{m.note}
                        </span>
                      )}
                    </span>
                  </React.Fragment>
                ))}
              </div>
              {supplier.adapter && (
                <div style={{ marginTop: 18, padding: 14, borderRadius: "var(--vt-r-tile)", background: "var(--vt-warn-wash)" }}>
                  <span className="vt-small" style={{ display: "block", fontWeight: 500, color: "var(--vt-warn)" }}>
                    Adattatore dedicato: {supplier.adapter}
                  </span>
                  <p className="vt-micro" style={{ marginTop: 5, color: "var(--vt-warn)" }}>
                    Questo fornitore deposita un file su SFTP invece di esporre un endpoint: la
                    lettura è scritta a mano, la mappatura qui sopra resta quella dichiarativa.
                  </p>
                </div>
              )}
            </>
          )}

          {tab === "diario" && (
            <>
              {runs.length === 0 && <p className="vt-body vt-muted">Nessuna corsa registrata.</p>}
              {runs.map(r => (
                <div key={r.id} style={{ padding: "14px 0", borderTop: "1px solid var(--vt-line-soft)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span className="vt-code">{r.id}</span>
                    <Stamp tone={statusTone(r.status)}>{SYNC_STATUS_LABEL[r.status]}</Stamp>
                    <span className="vt-micro">{r.trigger === "manuale" ? "avviata a mano" : "pianificata"}</span>
                    <span className="vt-micro" style={{ marginLeft: "auto" }}>{r.when}</span>
                  </div>
                  {r.status !== "errore" && (
                    <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                      {[["lette", r.read], ["nuove", r.created], ["aggiornate", r.updated],
                        ["invariate", r.unchanged], ["scartate", r.skipped], ["prezzi", r.priceChanged]]
                        .map(([k, v]) => (
                          <span key={k as string} style={{ minWidth: 0 }}>
                            <span className="vt-data" style={{ display: "block" }}>{num(v as number)}</span>
                            <span className="vt-micro">{k}</span>
                          </span>
                        ))}
                    </div>
                  )}
                  {r.message && (
                    <p className="vt-micro" style={{
                      marginTop: 10, padding: "9px 12px", borderRadius: 10,
                      background: r.status === "errore" ? "var(--vt-bad-wash)" : "var(--vt-warn-wash)",
                      color: r.status === "errore" ? "var(--vt-bad)" : "var(--vt-warn)",
                    }}>{r.message}</p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </motion.aside>
    </>
  )
}

/* ── Il riquadro della corsa: fermo, in movimento o appena finito ────────── */
function SyncPanel({ supplier, live, onSync }: {
  supplier: Supplier
  live: SyncLive
  onSync: (id: string) => void
}) {
  const isLive = live?.supplierId === supplier.id
  const done = isLive ? live!.phase : -1
  const pct = isLive ? Math.round(((live!.phase + 1) / SYNC_PHASES.length) * 100) : 0

  return (
    <div style={{ padding: 16, borderRadius: "var(--vt-r-tile)", background: "var(--vt-sheet-alt)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ minWidth: 0 }}>
          <span className="vt-h3" style={{ display: "block" }}>
            {isLive ? "Sincronizzazione in corso" : "Sincronizzazione"}
          </span>
          <span className="vt-micro">
            {isLive
              ? `${num(live!.read)} righe lette · ${num(live!.updated)} aggiornate`
              : `${supplier.cronLabel} · ultima ${supplier.lastRun}`}
          </span>
        </span>
        {/* Mentre gira, l'avanzamento NON resta dentro un pulsante disattivato:
            un comando spento che porta un'informazione la rende illeggibile
            (opacità 0,42) e invita a premere ciò che non si può premere. */}
        {isLive ? (
          <span className="vt-data-lg" style={{ marginLeft: "auto" }} aria-live="polite">{pct} %</span>
        ) : (
          <button type="button" className="vt-btn vt-btn-primary vt-btn-sm"
            style={{ marginLeft: "auto" }} disabled={!!live}
            onClick={() => onSync(supplier.id)}>
            Sincronizza ora
          </button>
        )}
      </div>

      {isLive && (
        <>
          <div className="vt-bar" style={{ marginTop: 14 }}><span style={{ width: `${pct}%` }} /></div>
          <div style={{ marginTop: 8 }}>
            {SYNC_PHASES.map((p, i) => (
              <div key={p.id} className={`vt-phase${i < done ? " is-done" : i === done ? " is-live" : ""}`}>
                <span className="vt-phase-dot">{i < done ? "✓" : ""}</span>
                <span className="vt-phase-label">{p.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!isLive && (
        <p className="vt-micro" style={{ marginTop: 10 }}>
          Una corsa avviata a mano non scavalca quella pianificata: prende priorità in coda, ma
          un blocco sul fornitore impedisce che le due scrivano i costi nello stesso momento.
        </p>
      )}
    </div>
  )
}

function Kv({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ marginTop: 10 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{
          display: "flex", justifyContent: "space-between", gap: 16,
          padding: "9px 0", borderTop: "1px solid var(--vt-line-soft)",
        }}>
          <span className="vt-small vt-muted" style={{ flexShrink: 0 }}>{k}</span>
          <span className="vt-small" style={{ textAlign: "right", minWidth: 0 }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   NUOVO FORNITORE
   Il modulo è breve di proposito: cinque campi bastano a stabilire una
   connessione, e la mappatura dei campi si compila DOPO, quando la prova ha
   già mostrato che cosa risponde il fornitore. Chiedere trenta campi prima di
   aver visto una riga di risposta è il modo sicuro di sbagliarli tutti.
══════════════════════════════════════════════════════════════════════════ */
const CRONS: { cron: string; label: string }[] = [
  { cron: "*/15 * * * *", label: "Ogni 15 minuti" },
  { cron: "*/30 * * * *", label: "Ogni 30 minuti" },
  { cron: "0 * * * *", label: "Ogni ora" },
  { cron: "0 */6 * * *", label: "Ogni 6 ore" },
  { cron: "15 2 * * *", label: "Ogni notte alle 02:15" },
]

export function NewSupplierModal({ onSave, onClose }: {
  onSave: (s: Supplier) => void
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [country, setCountry] = useState("IT")
  const [currency, setCurrency] = useState("EUR")
  const [transport, setTransport] = useState<Supplier["transport"]>("rest_json")
  const [auth, setAuth] = useState<Supplier["auth"]>("api_key")
  const [endpoint, setEndpoint] = useState("")
  const [secret, setSecret] = useState("")
  const [cron, setCron] = useState(CRONS[2].cron)
  const [dropship, setDropship] = useState(false)
  const [leadTime, setLeadTime] = useState(3)
  const [discount, setDiscount] = useState(0)
  const [probe, setProbe] = useState<null | "attesa" | "ok" | "ko">(null)

  const code = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 9) || "NUOVO"
  const canProbe = name.trim().length > 1 && /^(https?|sftp):\/\/.+/.test(endpoint.trim()) && secret.trim().length > 3
  const cronLabel = CRONS.find(c => c.cron === cron)!.label

  function save() {
    onSave({
      id: code, name: name.trim(), country, currency, fx: currency === "EUR" ? 1 : 0.0873,
      transport, auth, endpoint: endpoint.trim(),
      cron, cronLabel, state: "bozza", dropship, leadTime,
      costDiscount: discount, shippingFlat: 0, freeOver: null, minOrder: 0,
      offers: 0, unmatched: 0,
      lastRun: "—", lastOk: "—", latencyMs: 0, consecutiveErrors: 0,
      credHint: "••••" + (secret.trim().slice(-4) || "0000"),
      credRotated: "09/08/2026",
      /* la mappatura di partenza: i quattro campi senza i quali una riga non
         si può né abbinare né prezzare. Il resto si aggiunge dopo la prova. */
      fieldMap: [
        { our: "supplierSku", their: "", transform: "trim · upper", note: "da compilare dopo la prova" },
        { our: "name", their: "" },
        { our: "costGross", their: "", transform: "number" },
        { our: "stock", their: "", transform: "int" },
      ],
    })
    onClose()
  }

  return (
    <div className="vt-palette-scrim" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="vt-palette" style={{ maxWidth: 620, maxHeight: "min(86vh,780px)" }}
        role="dialog" aria-label="Nuovo fornitore"
        initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>

        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--vt-line-soft)", display: "flex", gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h3 className="vt-h2">Collega un fornitore</h3>
            <p className="vt-small vt-muted" style={{ marginTop: 4 }}>
              Prima la connessione, poi la mappatura dei campi.
            </p>
          </div>
          <button type="button" className="vt-icon-btn" onClick={onClose} aria-label="Chiudi" style={{ marginLeft: "auto" }}>✕</button>
        </div>

        <div className="vt-palette-list" style={{ padding: "18px 24px 8px" }}>
          <label>
            <span className="vt-field-label">Ragione sociale</span>
            <input className="vt-input" value={name} placeholder="Rossi Componenti S.p.A."
              onChange={e => { setName(e.target.value); setProbe(null) }} />
          </label>
          <p className="vt-micro" style={{ marginTop: 5 }}>Codice interno: <strong>{code}</strong></p>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <label style={{ flex: 1 }}>
              <span className="vt-field-label">Paese</span>
              <select className="vt-select" value={country} onChange={e => setCountry(e.target.value)}>
                {["IT", "DE", "FR", "ES", "SE", "NL", "PL"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={{ flex: 1 }}>
              <span className="vt-field-label">Valuta</span>
              <select className="vt-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                {["EUR", "SEK", "PLN", "GBP"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          {currency !== "EUR" && (
            <p className="vt-micro" style={{ marginTop: 5 }}>
              I costi arrivano in {currency} e vengono convertiti al cambio del giorno prima di prezzare.
            </p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <label style={{ flex: 1 }}>
              <span className="vt-field-label">Come parla</span>
              <select className="vt-select" value={transport}
                onChange={e => { setTransport(e.target.value as Supplier["transport"]); setProbe(null) }}>
                {(Object.keys(TRANSPORT_LABEL) as Supplier["transport"][]).map(t =>
                  <option key={t} value={t}>{TRANSPORT_LABEL[t]}</option>)}
              </select>
            </label>
            <label style={{ flex: 1 }}>
              <span className="vt-field-label">Autenticazione</span>
              <select className="vt-select" value={auth}
                onChange={e => { setAuth(e.target.value as Supplier["auth"]); setProbe(null) }}>
                {(Object.keys(AUTH_LABEL) as Supplier["auth"][]).map(a =>
                  <option key={a} value={a}>{AUTH_LABEL[a]}</option>)}
              </select>
            </label>
          </div>

          <label style={{ display: "block", marginTop: 16 }}>
            <span className="vt-field-label">
              {transport === "sftp_csv" ? "Percorso SFTP" : "Endpoint del catalogo"}
            </span>
            <input className="vt-input" value={endpoint} spellCheck={false}
              placeholder={transport === "sftp_csv"
                ? "sftp://sftp.fornitore.it/out/listino.csv"
                : "https://api.fornitore.it/v1/catalog"}
              onChange={e => { setEndpoint(e.target.value); setProbe(null) }} />
          </label>

          <label style={{ display: "block", marginTop: 16 }}>
            <span className="vt-field-label">
              {auth === "ssh_key" ? "Chiave privata" : auth === "basic" ? "Utente e password" : "Chiave o segreto"}
            </span>
            <input className="vt-input" type="password" value={secret} autoComplete="off"
              placeholder="•••••••••••••"
              onChange={e => { setSecret(e.target.value); setProbe(null) }} />
          </label>
          <p className="vt-micro" style={{ marginTop: 5 }}>
            Viene cifrata prima di toccare il database: da qui in poi se ne vedono solo le
            ultime quattro cifre. Nemmeno un backup completo la restituisce in chiaro.
          </p>

          <label style={{ display: "block", marginTop: 16 }}>
            <span className="vt-field-label">Ogni quanto sincronizzare</span>
            <select className="vt-select" value={cron} onChange={e => setCron(e.target.value)}>
              {CRONS.map(c => <option key={c.cron} value={c.cron}>{c.label}</option>)}
            </select>
          </label>
          <p className="vt-micro" style={{ marginTop: 5 }}>
            {cron === "*/15 * * * *"
              ? "Ritmo adatto a chi ha giacenze che si muovono davvero: 96 corse al giorno."
              : "La pianificazione vive nella coda, non in un cron di sistema: si può cambiare senza rilasci."}
          </p>

          <div style={{ marginTop: 18, padding: 14, borderRadius: "var(--vt-r-tile)", background: "var(--vt-sheet-alt)" }}>
            <button type="button" role="switch" aria-checked={dropship}
              onClick={() => setDropship(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left" }}>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="vt-small" style={{ display: "block", fontWeight: 500 }}>Spedizione diretta</span>
                <span className="vt-micro">Spedisce lui al cliente finale: la merce non passa dal nostro magazzino.</span>
              </span>
              <span className="vt-switch" aria-hidden data-on={dropship}
                style={{ background: dropship ? "var(--vt-accent-fill)" : "var(--vt-line)" }} />
            </button>

            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <label style={{ flex: 1 }}>
                <span className="vt-field-label">Consegna (giorni)</span>
                <input className="vt-input" inputMode="numeric" value={leadTime}
                  onChange={e => setLeadTime(Math.max(0, parseInt(e.target.value || "0", 10) || 0))} />
              </label>
              <label style={{ flex: 1 }}>
                <span className="vt-field-label">Sconto di contratto (%)</span>
                <input className="vt-input" inputMode="numeric" value={discount}
                  onChange={e => setDiscount(Math.min(90, Math.max(0, parseInt(e.target.value || "0", 10) || 0)))} />
              </label>
            </div>
          </div>

          {probe === "ok" && (
            <div style={{ marginTop: 14, padding: 13, borderRadius: 12, background: "var(--vt-ok-wash)", color: "var(--vt-ok)" }}>
              <span className="vt-small" style={{ fontWeight: 500 }}>Connessione riuscita · 4.180 righe dichiarate</span>
              <p className="vt-micro" style={{ marginTop: 4, color: "var(--vt-ok)" }}>
                Il fornitore risponde e l'autenticazione passa. Alla prima corsa le righe restano
                in attesa di abbinamento finché la mappatura non è compilata.
              </p>
            </div>
          )}
          {probe === "ko" && (
            <div style={{ marginTop: 14, padding: 13, borderRadius: 12, background: "var(--vt-bad-wash)", color: "var(--vt-bad)" }}>
              <span className="vt-small" style={{ fontWeight: 500 }}>Compila nome, endpoint e credenziale</span>
            </div>
          )}
        </div>

        <div className="vt-pop-foot" style={{ display: "flex", gap: 10, alignItems: "center", padding: "14px 24px" }}>
          <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm"
            disabled={probe === "attesa"}
            onClick={() => {
              if (!canProbe) { setProbe("ko"); return }
              setProbe("attesa"); setTimeout(() => setProbe("ok"), 950)
            }}>
            {probe === "attesa" ? "Verifico…" : "Prova connessione"}
          </button>
          <span style={{ flex: 1 }} />
          <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" onClick={onClose}>Annulla</button>
          {/* Si salva solo dopo una prova riuscita: un fornitore in elenco che
              non risponde è peggio di un fornitore assente, perché sembra a posto. */}
          <button type="button" className="vt-btn vt-btn-primary vt-btn-sm" disabled={probe !== "ok"} onClick={save}>
            Salva come bozza
          </button>
        </div>
      </motion.div>
    </div>
  )
}
