import React, { useState } from "react"
import { useToast } from "../../../context/ToastContext"
import type { PageSpeedRun } from "../../../lib/api"
import { runPageSpeed, scoreTone, SITE_ROUTES } from "../../../lib/api"
import {
  Badge, Btn, DISPLAY, Empty, Glass, Icon, MONO, Note, Ring, SectionTitle, Select, T, TONE,
} from "../../ui"

/* ══════════════════════════════════════════════════════════════════════════
   PAGESPEED INSIGHTS.

   Misura la pagina pubblicata, non quella in sviluppo: Google carica l'URL
   dall'esterno, quindi in locale non c'è niente da misurare — e la scheda lo
   dice invece di lasciare girare una rotellina che non finirà.

   Mobile e desktop si lanciano insieme perché sono due misure diverse dello
   stesso sito e guardarne una sola porta a conclusioni sbagliate: il
   punteggio desktop è quasi sempre più alto, ed è quello che nessuno usa.
══════════════════════════════════════════════════════════════════════════ */

export default function PageSpeedWidget({ origin, isLocal }: { origin: string; isLocal: boolean }) {
  const toast = useToast()
  const [slug, setSlug] = useState("/")
  const [runs, setRuns] = useState<Record<"mobile" | "desktop", PageSpeedRun | null>>({ mobile: null, desktop: null })
  const [busy, setBusy] = useState(false)

  const target = `${origin}${slug === "/" ? "" : slug}`

  async function run() {
    if (busy) return
    setBusy(true)
    setRuns({ mobile: null, desktop: null })
    /* allSettled: se una delle due strategie fallisce, l'altra va comunque
       mostrata — mezza misura è meglio di nessuna. */
    const [m, d] = await Promise.allSettled([
      runPageSpeed(target, "mobile"),
      runPageSpeed(target, "desktop"),
    ])
    setRuns({
      mobile: m.status === "fulfilled" ? m.value : null,
      desktop: d.status === "fulfilled" ? d.value : null,
    })
    if (m.status === "rejected" && d.status === "rejected") {
      toast.error(m.reason?.message || "PageSpeed non ha risposto.")
    } else if (m.status === "rejected" || d.status === "rejected") {
      toast.info("Una delle due misure non è riuscita.")
    } else {
      toast.success("Misura completata")
    }
    setBusy(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Glass variant="panel" style={{ padding: 20 }}>
        <SectionTitle
          kicker="Google PageSpeed Insights"
          title="Misura le prestazioni"
          sub="Google carica la pagina pubblicata e la valuta come farebbe un visitatore."
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 16 }}>
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <label style={{
              display: "block", marginBottom: 8, fontFamily: MONO, fontSize: 11.5,
              letterSpacing: "0.11em", textTransform: "uppercase", color: T.secondary,
            }}>
              Pagina
            </label>
            <Select value={slug} onChange={e => setSlug(e.target.value)}>
              {SITE_ROUTES.map(r => <option key={r.slug} value={r.slug}>{r.slug} — {r.label}</option>)}
            </Select>
          </div>
          <Btn variant="primary" icon="bolt" onClick={run} busy={busy} disabled={isLocal}>
            {busy ? "Misura in corso…" : "Esegui la misura"}
          </Btn>
          <a href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(target)}`} target="_blank" rel="noreferrer"
            style={{ textDecoration: "none", display: "inline-flex" }}>
            <Btn variant="ghost" icon="external">Apri su Google</Btn>
          </a>
        </div>

        <p style={{ fontFamily: MONO, fontSize: 12.5, color: T.secondary, margin: "12px 0 0", wordBreak: "break-all" }}>
          {target}
        </p>

        {isLocal && (
          <div style={{ marginTop: 14 }}>
            <Note tone="amber">
              In locale non c'è niente da misurare: PageSpeed carica l'URL dall'esterno e <code style={{ fontFamily: MONO }}>localhost</code> non
              è raggiungibile dai server di Google. Il pulsante si accende sul sito pubblicato.
            </Note>
          </div>
        )}
        {busy && (
          <div style={{ marginTop: 14 }}>
            <Note tone="silver">
              La prima misura su un dominio richiede fino a un minuto: Google carica davvero la pagina, due volte, con due profili di rete diversi.
            </Note>
          </div>
        )}
      </Glass>

      {(runs.mobile || runs.desktop) ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(330px,100%),1fr))", gap: 16, alignItems: "start" }}>
          {(["mobile", "desktop"] as const).map(s => (
            <ScoreCard key={s} strategy={s} run={runs[s]} />
          ))}
        </div>
      ) : !busy && (
        <Glass variant="panel" style={{ padding: 20 }}>
          <Empty
            icon="bolt"
            title="Nessuna misura ancora"
            hint="Scegli una pagina e lancia la misura. I punteggi non vengono archiviati: ogni esecuzione è una fotografia del momento."
          />
        </Glass>
      )}
    </div>
  )
}

const CATEGORY_LABEL: { key: keyof PageSpeedRun; label: string }[] = [
  { key: "performance", label: "Prestazioni" },
  { key: "accessibility", label: "Accessibilità" },
  { key: "bestPractices", label: "Buone pratiche" },
  { key: "seo", label: "SEO" },
]

function ScoreCard({ strategy, run }: { strategy: "mobile" | "desktop"; run: PageSpeedRun | null }) {
  return (
    <Glass variant="panel" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ color: T.secondary, display: "flex" }}>
          <Icon name={strategy === "mobile" ? "phone" : "layers"} size={16} />
        </span>
        <span style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, color: T.text, textTransform: "capitalize" }}>
          {strategy}
        </span>
        <span style={{ flex: 1 }} />
        {run && <Badge tone="steel">{new Date(run.fetchedAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</Badge>}
      </div>

      {!run ? (
        <Empty icon="warn" title="Misura non riuscita" hint="Riprova: capita che Google rifiuti una richiesta e accetti la successiva." />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 14 }}>
            {CATEGORY_LABEL.map(c => {
              const score = run[c.key] as number | null
              const tone = scoreTone(score)
              return (
                <div key={c.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
                  <Ring value={score ?? 0} size={64} tone={tone === "steel" ? "silver" : tone} />
                  <span style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 600, color: T.text, textAlign: "center" }}>
                    {c.label}
                  </span>
                </div>
              )
            })}
          </div>

          {run.vitals.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
              <p style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.11em", textTransform: "uppercase", color: T.secondary, margin: "0 0 12px" }}>
                Core Web Vitals
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {run.vitals.map(v => {
                  const tone = scoreTone(v.score)
                  return (
                    <div key={v.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                        background: tone === "steel" ? "rgba(255,255,255,0.4)" : TONE[tone].fg,
                      }} />
                      <span style={{ flex: 1, minWidth: 0, fontFamily: DISPLAY, fontSize: 13.5, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {v.label}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: tone === "steel" ? T.text : TONE[tone].tx, flexShrink: 0 }}>
                        {v.display}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </Glass>
  )
}
