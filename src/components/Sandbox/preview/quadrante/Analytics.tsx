import React, { useId, useMemo, useState } from "react"
import type { Deal } from "./types"
import {
  byRep, eur, eurShort, funnel, headline, monthlySeries, num, pct,
} from "./data"
import { AvatarOf, CardHead, Ico, Metric } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   ANALITICA

   I grafici sono SVG scritti a mano, non Chart.js. La scelta è deliberata:
   due diagrammi non giustificano ~180 kB di libreria su una pagina che deve
   aprirsi in fretta da un portfolio, e soprattutto Chart.js disegna su
   <canvas> — niente testo selezionabile, niente contrasto verificabile con
   gli strumenti del browser, niente lettura da parte di uno screen reader.
   In SVG le barre sono elementi veri, hanno un <title>, e il tema le colora
   con le stesse variabili CSS del resto.

   Se serve Chart.js per un requisito esterno, il punto di innesto è uno solo:
   questi due componenti ricevono già i dati aggregati e pronti.
══════════════════════════════════════════════════════════════════════════ */

export default function Analytics({ deals, onExport, exporting }: {
  deals: Deal[]
  onExport: () => void
  exporting: boolean
}) {
  const h = useMemo(() => headline(deals), [deals])
  const rows = useMemo(() => funnel(deals), [deals])
  const months = useMemo(() => monthlySeries(deals), [deals])
  const reps = useMemo(() => byRep(deals), [deals])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="q-grid q-grid-4">
        <Metric label="Pipeline aperta" value={eurShort(h.openValue)}
          hint={`${h.openCount} trattative`} />
        <Metric label="Previsione ponderata" value={eurShort(h.forecast)} variant="lime"
          hint="Valore per probabilità di stato" icon={<Ico n="chart" size={15} />} />
        <Metric label="Firmato" value={eurShort(h.wonValue)}
          hint={`Ticket medio ${eur(h.avgTicket)}`} />
        <Metric label="Tasso di successo" value={pct(h.winRate, 1)}
          hint="Sulle trattative chiuse" />
      </div>

      <div className="q-grid q-grid-2">
        <FunnelChart rows={rows} />
        <MonthlyChart months={months} />
      </div>

      <div className="q-card">
        <CardHead
          title="Per commerciale"
          sub="Firmato nel periodo e portafoglio ancora aperto."
          right={
            <button type="button" className="q-btn q-btn-lime q-btn-sm"
              onClick={onExport} disabled={exporting}>
              <Ico n="download" size={14} />
              {exporting ? "Genero…" : "Rapporto PDF"}
            </button>
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reps.map(r => {
            const max = reps[0].won || 1
            return (
              <div key={r.rep.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <AvatarOf id={r.rep.id} size={30} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className="q-h3" style={{ color: "var(--q-ink)" }}>{r.rep.name}</span>
                    <span className="q-micro" style={{ color: "var(--q-ink-faint)" }}>
                      {r.rep.role} · {num(r.winRate)} % di successo
                    </span>
                    <span className="q-h3 q-num" style={{ marginLeft: "auto", color: "var(--q-ink)" }}>
                      {eurShort(r.won)}
                    </span>
                  </span>
                  <span className="q-bar-track" style={{ marginTop: 7, display: "block" }}>
                    <span style={{
                      width: `${Math.round((r.won / max) * 100)}%`,
                      background: r.rep.id === reps[0].rep.id ? "var(--q-lime)" : "var(--q-sheet-3)",
                    }} />
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   IMBUTO DI CONVERSIONE
   Barre orizzontali: i nomi degli stati sono lunghi e in verticale
   andrebbero ruotati, cioè resi illeggibili.
══════════════════════════════════════════════════════════════════════════ */
function FunnelChart({ rows }: { rows: ReturnType<typeof funnel> }) {
  const max = rows[0]?.count || 1
  return (
    <div className="q-card">
      <CardHead title="Imbuto di conversione"
        sub="Quante trattative arrivano almeno a ciascuno stato." />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r, i) => (
          <div key={r.stage.id}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span className="q-small" style={{ color: "var(--q-ink)" }}>{r.stage.title}</span>
              <span className="q-micro" style={{ color: "var(--q-ink-faint)" }}>
                {r.count} · {eurShort(r.value)}
              </span>
              {/* la conversione dallo scalino prima: sul primo non esiste */}
              {i > 0 && (
                <span className="q-micro q-num" style={{
                  marginLeft: "auto",
                  color: r.stepPct >= 60 ? "var(--q-lime-deep)" : "var(--q-ink-muted)",
                }}>
                  {pct(r.stepPct, 0)} dal precedente
                </span>
              )}
            </div>
            <div style={{
              height: 26, borderRadius: 7, background: "var(--q-sheet-3)",
              overflow: "hidden", position: "relative",
            }}>
              <div
                style={{
                  width: `${Math.max(2, Math.round((r.count / max) * 100))}%`,
                  height: "100%", borderRadius: 7,
                  background: r.stage.color,
                  transition: "width 480ms cubic-bezier(0.22,1,0.36,1)",
                }}
                title={`${r.stage.title}: ${r.count} trattative, ${eur(r.value)}`}
              />
              <span className="q-micro q-num" style={{
                position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
                color: "var(--q-ink-muted)",
              }}>
                {pct(r.reachedPct, 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="q-micro" style={{ marginTop: 14, color: "var(--q-ink-faint)" }}>
        Le trattative perse contano fino allo stato in cui si sono fermate, non oltre:
        altrimenti risulterebbero passate anche da «firmato».
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ANDAMENTO MENSILE
   Colonne appaiate: firmato sopra la linea, perso sotto. Sovrapporle
   nasconderebbe la più piccola dietro la più grande.
══════════════════════════════════════════════════════════════════════════ */
function MonthlyChart({ months }: { months: ReturnType<typeof monthlySeries> }) {
  const uid = useId()
  const [hover, setHover] = useState<number | null>(null)

  const W = 520
  const H = 190
  const PAD_B = 26   // spazio per le etichette dei mesi
  const PAD_T = 8
  const max = Math.max(...months.map(m => Math.max(m.won, m.lost)), 1)
  const zone = H - PAD_B - PAD_T
  const step = W / months.length
  const bw = Math.min(26, step * 0.34)

  const y = (v: number) => PAD_T + zone - (v / max) * zone

  return (
    <div className="q-card">
      <CardHead
        title="Firmato e perso per mese"
        sub="Valore delle trattative chiuse, per mese di chiusura."
        right={
          <span className="q-legend">
            <span><i style={{ background: "var(--q-lime)" }} />Firmato</span>
            <span><i style={{ background: "var(--q-st-perso)" }} />Perso</span>
          </span>
        }
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={`Andamento mensile: ${months.map(m => `${m.label} firmato ${eurShort(m.won)}`).join(", ")}`}
        style={{ display: "block", overflow: "visible" }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`${uid}-won`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--q-lime)" />
            <stop offset="100%" stopColor="#B9E63A" />
          </linearGradient>
        </defs>

        {/* linee guida: tre, non dieci — servono a stimare, non a misurare */}
        {[0, 0.5, 1].map(f => (
          <line key={f} x1={0} x2={W} y1={y(max * f)} y2={y(max * f)}
            stroke="var(--q-line)" strokeWidth={1} />
        ))}

        {months.map((m, i) => {
          const cx = i * step + step / 2
          const on = hover === i
          return (
            <g key={m.key}
              onPointerEnter={() => setHover(i)}
              style={{ cursor: "default" }}>
              {/* bersaglio invisibile: le colonne sottili sono difficili da
                  centrare col puntatore, la fascia intera no */}
              <rect x={i * step} y={0} width={step} height={H - PAD_B}
                fill={on ? "var(--q-sheet-2)" : "transparent"} />

              <rect
                x={cx - bw - 2} y={y(m.won)} width={bw} height={Math.max(1, zone - (y(m.won) - PAD_T))}
                rx={4} fill={`url(#${uid}-won)`} opacity={hover === null || on ? 1 : 0.45}
              >
                <title>{`${m.label}: firmato ${eur(m.won)} · ${m.count} trattative`}</title>
              </rect>

              <rect
                x={cx + 2} y={y(m.lost)} width={bw} height={Math.max(1, zone - (y(m.lost) - PAD_T))}
                rx={4} fill="var(--q-st-perso)" opacity={hover === null || on ? 0.85 : 0.35}
              >
                <title>{`${m.label}: perso ${eur(m.lost)}`}</title>
              </rect>

              <text x={cx} y={H - 8} textAnchor="middle"
                fill={on ? "var(--q-ink)" : "var(--q-ink-faint)"}
                fontSize={11} fontWeight={on ? 600 : 400}>
                {m.label}
              </text>
            </g>
          )
        })}
      </svg>

      <div style={{ marginTop: 10, minHeight: 34 }}>
        {hover !== null ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
            <span className="q-h3" style={{ color: "var(--q-ink)" }}>{months[hover].label}</span>
            <span className="q-small q-num" style={{ color: "var(--q-lime-deep)" }}>
              {eur(months[hover].won)} firmato
            </span>
            <span className="q-small q-num" style={{ color: "#B4581F" }}>
              {eur(months[hover].lost)} perso
            </span>
          </div>
        ) : (
          <p className="q-micro" style={{ color: "var(--q-ink-faint)" }}>
            Passa sopra un mese per i valori esatti.
          </p>
        )}
      </div>
    </div>
  )
}
