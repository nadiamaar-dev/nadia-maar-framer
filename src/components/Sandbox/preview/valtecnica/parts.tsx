import React, { useEffect, useId, useRef, useState } from "react"
import {
  agingTotals, downloadCsv, eur, num, ORDER_STATE_LABEL, INVOICE_STATE_LABEL,
  type Invoice, type InvoiceState, type OrderState,
} from "./data"

/* ══════════════════════════════════════════════════════════════════════════
   Primitivi condivisi.
   Tutti i grafici sono SVG disegnati a mano: nessuna libreria.
══════════════════════════════════════════════════════════════════════════ */

/* ── Stato ──────────────────────────────────────────────────────────────── */
const ORDER_TONE: Record<OrderState, string> = {
  bozza: "neutral", approvazione: "ambra", confermato: "verified",
  preparazione: "ambra", spedito: "verified", consegnato: "verified", rifiutato: "oxide",
}
const INVOICE_TONE: Record<InvoiceState, string> = {
  pagata: "verified", "da-pagare": "ambra", scaduta: "oxide",
}

export function Stamp({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`vt-stamp vt-stamp-${tone}`}>{children}</span>
}

export const OrderStamp = ({ s }: { s: OrderState }) =>
  <Stamp tone={ORDER_TONE[s]}>{ORDER_STATE_LABEL[s]}</Stamp>

export const InvoiceStamp = ({ s }: { s: InvoiceState }) =>
  <Stamp tone={INVOICE_TONE[s]}>{INVOICE_STATE_LABEL[s]}</Stamp>

/* ── Variazione percentuale ─────────────────────────────────────────────── */
export function Delta({ v, suffix }: { v: number; suffix?: string }) {
  const up = v >= 0
  return (
    <span className={`vt-delta ${up ? "vt-delta-up" : "vt-delta-down"}`}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d={up ? "M6 9.5V2.5M6 2.5L2.8 5.7M6 2.5L9.2 5.7" : "M6 2.5v7M6 9.5L2.8 6.3M6 9.5L9.2 6.3"}
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {num(Math.abs(v), 1)} %{suffix ? ` ${suffix}` : ""}
    </span>
  )
}

/* ── Iniziali del cliente ───────────────────────────────────────────────── */
export function Avatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).filter(w => /^[A-Za-zÀ-ÿ]/.test(w)).slice(0, 2)
    .map(w => w[0]).join("").toUpperCase()
  return <span className="vt-avatar" aria-hidden>{initials || "—"}</span>
}

/* ── Etichetta di campo e avviso ────────────────────────────────────────── */
export const FieldLabel = ({ children }: { children: React.ReactNode }) =>
  <span className="vt-field-label">{children}</span>

export const Denied = ({ children }: { children: React.ReactNode }) =>
  <p className="vt-denied" role="note">{children}</p>

/* ── Blocco chiave/valore del riepilogo documento ───────────────────────── */
export function Cartiglio({ fields }: { fields: { k: string; v: string; last?: boolean }[] }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 1,
      background: "var(--vt-line-soft)", borderRadius: "var(--vt-r-tile)", overflow: "hidden",
    }}>
      {fields.map(f => (
        <div key={f.k} style={{ background: "var(--vt-sheet-alt)", padding: "11px 14px", minWidth: 0 }}>
          <div className="vt-micro">{f.k}</div>
          <div className="vt-data" key={f.v} style={{ marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {f.v}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Stepper quantità, con lotto minimo/multiplo ────────────────────────── */
export function QtyStep({ value, lotto, onChange }: {
  value: number; lotto: number; onChange: (n: number) => void
}) {
  const step = (d: number) => onChange(Math.max(0, value + d * lotto))
  return (
    <span className="vt-step">
      <button type="button" onClick={() => step(-1)} disabled={value <= 0} aria-label="Diminuisci quantità">−</button>
      <input
        type="number" value={value} inputMode="numeric" aria-label="Quantità"
        onChange={e => {
          const n = parseInt(e.target.value || "0", 10)
          onChange(Number.isNaN(n) ? 0 : Math.max(0, n))
        }}
      />
      <button type="button" onClick={() => step(1)} aria-label="Aumenta quantità">+</button>
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   GRAFICI
══════════════════════════════════════════════════════════════════════════ */

/** Istogramma: le colonne recenti sono in arancio, le più vecchie spente.
    È la lettura dei riferimenti — il colore indica il tempo, non la categoria. */
export function ColumnChart({ series, labels, height = 150, hot = 5 }: {
  series: number[]; labels: string[]; height?: number; hot?: number
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...series, 1)
  const n = series.length
  const gap = 34 / n
  const bw = (100 - gap * (n - 1)) / n

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 100 ${height}`} preserveAspectRatio="none"
        style={{ width: "100%", height, display: "block", overflow: "visible" }}
        role="img" aria-label={`Andamento su ${n} periodi, valore corrente ${eur(series[n - 1], 0)}`}
      >
        {series.map((v, i) => {
          const h = Math.max(3, (v / max) * height)
          const isHot = i >= n - hot
          const r = Math.min(bw / 2, 3)
          return (
            <rect
              key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} rx={r} ry={r}
              fill={isHot ? "var(--vt-accent)" : "var(--vt-accent-ghost)"}
              opacity={hover === null || hover === i ? 1 : 0.55}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              tabIndex={0} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              style={{ transition: "opacity 160ms cubic-bezier(0.22,1,0.36,1)", outline: "none" }}
            >
              <title>{`${labels[i]} · ${eur(v, 0)}`}</title>
            </rect>
          )
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <span className="vt-micro">{labels[0]}</span>
        <span className="vt-micro">{labels[n - 1]}</span>
      </div>
      {hover !== null && (
        <div style={{
          position: "absolute", top: -4, left: `${(hover / n) * 100}%`, transform: "translate(-50%,-100%)",
          background: "var(--vt-ink)", color: "#FFFFFF", padding: "6px 10px", borderRadius: 10,
          fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", pointerEvents: "none",
          boxShadow: "var(--vt-sh-2)",
        }}>
          {labels[hover]} · {eur(series[hover], 0)}
        </div>
      )}
    </div>
  )
}

/** Spark line con riempimento sfumato, come le tessere dei riferimenti. */
export function Spark({ series, tone = "accent", height = 62 }: {
  series: number[]; tone?: "accent" | "light"; height?: number
}) {
  const gid = useId().replace(/:/g, "")
  const max = Math.max(...series), min = Math.min(...series)
  const span = max - min || 1
  const n = series.length
  const pts = series.map((v, i) => {
    const x = (i / (n - 1)) * 100
    const y = height - 6 - ((v - min) / span) * (height - 14)
    return [x, y] as const
  })

  /* curva morbida: ogni segmento passa per il punto medio con un controllo
     quadratico, così non servono derivate né una libreria */
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i]
    d += ` Q ${px + (cx - px) / 2} ${py}, ${px + (cx - px) / 2} ${(py + cy) / 2} T ${cx} ${cy}`
  }
  const stroke = tone === "accent" ? "var(--vt-accent)" : "#FFFFFF"

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden
      style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={tone === "accent" ? 0.22 : 0.30} />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L 100 ${height} L 0 ${height} Z`} fill={`url(#g${gid})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Tessera metrica: etichetta, cifra, variazione e spark. Tre vesti. */
export function MetricTile({ label, value, delta, series, variant = "plain", icon, action }: {
  label: string
  value: string
  delta?: number
  series?: number[]
  variant?: "plain" | "dark" | "accent"
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  const cls = variant === "dark" ? "vt-tile-dark" : variant === "accent" ? "vt-tile-accent" : "vt-tile"
  return (
    <div className={cls} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {icon}
          <span className="vt-label" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        </span>
        {action}
      </div>
      {delta !== undefined && <div style={{ marginBottom: 4 }}><Delta v={delta} /></div>}
      <div className="vt-figure" key={value}>{value}</div>
      {series && (
        <div style={{ marginTop: 12, marginInline: -16, marginBottom: -16 }}>
          <Spark series={series} tone={variant === "plain" ? "accent" : "light"} />
        </div>
      )}
    </div>
  )
}

/** Barra impilata degli stati ordine: segmenti arrotondati e staccati. */
export function StackedBar({ data, onPick }: {
  data: { state: OrderState; n: number }[]
  onPick?: (s: OrderState) => void
}) {
  const tot = data.reduce((a, d) => a + d.n, 0) || 1
  const tones = ["var(--vt-accent)", "#F79A6E", "#F7C6A9", "#E9E2DB", "#D8CFC7"]
  return (
    <div>
      <div style={{ display: "flex", gap: 4, height: 12 }}>
        {data.map((d, i) => (
          <button
            key={d.state} type="button" onClick={() => onPick?.(d.state)}
            title={`${ORDER_STATE_LABEL[d.state]} · ${d.n} ordini`}
            aria-label={`${ORDER_STATE_LABEL[d.state]}: ${d.n} ordini. Apri la lista filtrata.`}
            style={{
              width: `${(d.n / tot) * 100}%`, background: tones[i % tones.length],
              borderRadius: 999, cursor: onPick ? "pointer" : "default", minWidth: 6,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 16 }}>
        {data.map((d, i) => (
          <button key={d.state} type="button" onClick={() => onPick?.(d.state)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: tones[i % tones.length], flexShrink: 0 }} />
            <span className="vt-small vt-muted">{ORDER_STATE_LABEL[d.state]}</span>
            <span className="vt-data">{d.n}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/** Indicatore fido a barra morbida. */
export function FidoGauge({ fido, esposizione, ordine }: {
  fido: number; esposizione: number; ordine: number
}) {
  const used = Math.min(1, esposizione / fido)
  const add = Math.max(0, Math.min(1 - used, ordine / fido))
  const over = esposizione + ordine > fido
  return (
    <div>
      <div style={{ display: "flex", gap: 3, height: 10, background: "var(--vt-sheet-alt)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${used * 100}%`, background: "var(--vt-ink-faint)" }} />
        <div style={{ width: `${add * 100}%`, background: over ? "var(--vt-bad)" : "var(--vt-accent)" }} />
      </div>
      <p className="vt-small vt-muted" style={{ marginTop: 10 }}>
        Fido {eur(fido, 0)} · esposizione {eur(esposizione, 0)} · questo ordine {eur(ordine, 0)}
        {over
          ? <> → <span style={{ color: "var(--vt-bad)", fontWeight: 500 }}>fido superato di {eur(esposizione + ordine - fido, 0)}</span></>
          : <> → residuo {eur(fido - esposizione - ordine, 0)}</>}
      </p>
    </div>
  )
}

/** Riga di registro chiave/valore, per le colonne di sintesi. */
export function LedgerRow({ k, v, sub, tone }: {
  k: string; v: string; sub?: string; tone?: string
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      padding: "15px 0", borderTop: "1px solid var(--vt-line-soft)",
    }}>
      <div style={{ minWidth: 0 }}>
        <div className="vt-small">{k}</div>
        {sub && <div className="vt-micro" style={{ marginTop: 2 }}>{sub}</div>}
      </div>
      <span className="vt-data-lg" key={v} style={tone ? { color: tone } : undefined}>{v}</span>
    </div>
  )
}

/* ── Feed attività ─────────────────────────────────────────────────────── */
export function ActivityFeed({ entries, paused, onToggle }: {
  entries: { t: string; who: string; ago: number }[]
  paused: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <div className="vt-card-head" style={{ marginBottom: 6 }}>
        <div>
          <h3 className="vt-h2">Attività</h3>
          <p className="vt-label" style={{ marginTop: 3 }}>Ultimi movimenti registrati.</p>
        </div>
        <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" onClick={onToggle}>
          {paused ? "Riprendi" : "Pausa"}
        </button>
      </div>
      <div role="log" aria-live="polite" aria-relevant="additions">
        {entries.map((e, i) => (
          <div key={`${e.t}-${i}`} style={{
            padding: "13px 0", borderTop: "1px solid var(--vt-line-soft)",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: 999, flexShrink: 0, marginTop: 6,
              background: i === 0 ? "var(--vt-accent)" : "var(--vt-line)",
            }} />
            <span style={{ minWidth: 0, flex: 1 }}>
              <span className="vt-small" style={{ display: "block" }}>{e.t}</span>
              <span className="vt-micro">{e.who} · {e.ago === 0 ? "adesso" : `${e.ago} s fa`}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Contenitori ───────────────────────────────────────────────────────── */
export function Sheet({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <section className="vt-sheet" style={style}>{children}</section>
}

/** Intestazione di scheda: titolo, sottotitolo, comandi a destra. */
export function CardHead({ title, sub, right }: {
  title: string; sub?: string; right?: React.ReactNode
}) {
  return (
    <div className="vt-card-head">
      <div style={{ minWidth: 0 }}>
        <h3 className="vt-h2">{title}</h3>
        {sub && <p className="vt-label" style={{ marginTop: 3 }}>{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export const money = eur
export const qty = num


/* ── Esportazione ──────────────────────────────────────────────────────── */
export function ExportBtn({ name, rows, label = "Esporta" }: {
  name: string
  rows: () => (string | number)[][]
  label?: string
}) {
  return (
    <button type="button" className="vt-btn vt-btn-secondary vt-btn-sm"
      onClick={() => downloadCsv(name, rows())} title="Scarica in CSV">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M8 2.5v7.5M5 7.2L8 10l3-2.8M3 12.5h10" />
      </svg>
      {label}
    </button>
  )
}

/* ── Scadenzario: l'anzianità del credito in quattro fasce ─────────────── */
export function AgingBar({ invoices, active, onPick }: {
  invoices: Invoice[]
  active: string | null
  onPick: (id: string | null) => void
}) {
  const buckets = agingTotals(invoices)
  const tot = buckets.reduce((a, b) => a + b.total, 0) || 1
  const tones = ["var(--vt-ink-faint)", "var(--vt-warn)", "#E2802F", "var(--vt-bad)"]

  return (
    <div>
      <div style={{ display: "flex", gap: 4, height: 10, marginBottom: 14 }}>
        {buckets.map((b, i) => b.total > 0 && (
          <button key={b.bucket.id} type="button"
            onClick={() => onPick(active === b.bucket.id ? null : b.bucket.id)}
            aria-label={`${b.bucket.label}: ${eur(b.total, 0)} su ${b.n} fatture`}
            title={`${b.bucket.label} · ${eur(b.total, 0)}`}
            style={{
              width: `${(b.total / tot) * 100}%`, minWidth: 8, borderRadius: 999,
              background: tones[i], opacity: !active || active === b.bucket.id ? 1 : 0.35,
              transition: "opacity 160ms cubic-bezier(0.22,1,0.36,1)",
            }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
        {buckets.map((b, i) => (
          <button key={b.bucket.id} type="button"
            onClick={() => onPick(active === b.bucket.id ? null : b.bucket.id)}
            aria-pressed={active === b.bucket.id}
            style={{
              textAlign: "left", padding: "10px 12px", borderRadius: 12,
              background: active === b.bucket.id ? "var(--vt-sheet-alt)" : "transparent",
            }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: tones[i], flexShrink: 0 }} />
              <span className="vt-micro">{b.bucket.label}</span>
            </span>
            <span className="vt-data-lg" style={{ display: "block" }}>{eur(b.total, 0)}</span>
            <span className="vt-micro">{b.n} {b.n === 1 ? "fattura" : "fatture"}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
