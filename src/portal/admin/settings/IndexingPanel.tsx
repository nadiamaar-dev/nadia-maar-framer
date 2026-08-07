import React, { useState } from "react"
import { useToast } from "../../../context/ToastContext"
import type { IndexNowResult } from "../../../lib/api"
import { pingIndexNow, SITE_ROUTES } from "../../../lib/api"
import {
  Badge, Btn, DISPLAY, Field, Glass, Icon, MONO, Note, SectionTitle, Select, T,
} from "../../ui"

/* ══════════════════════════════════════════════════════════════════════════
   INDICIZZAZIONE IMMEDIATA.

   IndexNow è un protocollo aperto: si annunciano gli URL cambiati e i motori
   che vi aderiscono tornano a leggerli in minuti invece che in settimane.
   Lo onorano Bing, Yandex, Seznam e Naver — annunciarlo a uno vale per tutti.

   Google NON vi aderisce, e questa scheda lo dice invece di lasciarlo
   credere: la sua Indexing API è documentata per i soli JobPosting e
   BroadcastEvent, e usarla per pagine normali è fuori dalle sue condizioni.
   Quello che si può fare per Google è segnalare la sitemap — che il pulsante
   fa — e, per una pagina urgente, lo Strumento di controllo URL in Search
   Console, un click da qui.
══════════════════════════════════════════════════════════════════════════ */

export default function IndexingPanel({ origin, isLocal }: { origin: string; isLocal: boolean }) {
  const toast = useToast()
  const [scope, setScope] = useState("__all__")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<IndexNowResult | null>(null)

  async function run() {
    if (busy) return
    setBusy(true)
    setResult(null)
    try {
      const r = await pingIndexNow(scope === "__all__" ? [] : [scope])
      setResult(r)
      if (r.ok && r.indexnowOk) toast.success(`${r.urls} URL annunciati`)
      else if (r.ok) toast.info("Annuncio inviato, ma i motori non l'hanno accettato.")
      else toast.error(r.error || "Annuncio non riuscito.")
    } catch {
      toast.error("Annuncio non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  const inspectUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(origin)}&id=${encodeURIComponent(scope === "__all__" ? origin : `${origin}${scope}`)}`

  return (
    <Glass variant="panel" style={{ padding: 20 }}>
      <SectionTitle
        kicker="Indicizzazione"
        title="Annuncia le modifiche ai motori"
        sub="Invece di aspettare che passino, li si avvisa che c'è qualcosa di nuovo."
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 16 }}>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <Field label="Cosa annunciare">
            <Select value={scope} onChange={e => setScope(e.target.value)}>
              <option value="__all__">Tutte le pagine indicizzabili</option>
              {SITE_ROUTES.map(r => <option key={r.slug} value={r.slug}>{r.slug} — {r.label}</option>)}
            </Select>
          </Field>
        </div>
        <Btn variant="primary" icon="bolt" onClick={run} busy={busy} disabled={isLocal}>
          {busy ? "Invio in corso…" : "Annuncia ora"}
        </Btn>
        <a href={inspectUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex" }}>
          <Btn variant="ghost" icon="external">Controlla su Google</Btn>
        </a>
      </div>

      {isLocal && (
        <div style={{ marginTop: 14 }}>
          <Note tone="amber">
            In locale non c'è nulla da annunciare: i motori devono poter raggiungere sia gli URL sia il file
            che dimostra il possesso della chiave. Il pulsante si accende sul dominio pubblicato.
          </Note>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <ResultRow
            ok={!!result.indexnowOk}
            label="IndexNow"
            detail={result.indexnowOk
              ? `${result.urls} URL accettati — Bing, Yandex, Seznam, Naver`
              : result.indexnowHint || result.error || `Risposta ${result.indexnow ?? "assente"}`}
          />
          <ResultRow
            ok={result.googleSitemapPing === 200}
            label="Google · segnalazione sitemap"
            detail={result.googleSitemapPing === 200
              ? "Sitemap segnalata. Google decide da sé quando passare."
              : "Google non ha risposto. La sitemap resta comunque in Search Console."}
          />
          {result.keyLocation && (
            <p style={{ fontFamily: MONO, fontSize: 12, color: T.secondary, margin: 0, wordBreak: "break-all" }}>
              Chiave pubblicata su {result.keyLocation}
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.65, color: T.secondary, margin: 0 }}>
          <Icon name="sparkle" size={13} style={{ verticalAlign: "-2px", marginRight: 7 }} />
          <strong style={{ color: T.text }}>Google non aderisce a IndexNow.</strong> La sua Indexing API esiste
          ma è documentata per i soli annunci di lavoro ed eventi in diretta: usarla per pagine normali è fuori
          dalle sue condizioni d'uso, quindi non è stata collegata. Per una pagina urgente, «Controlla su Google»
          apre lo strumento che chiede l'indicizzazione manuale.
        </p>
      </div>
    </Glass>
  )
}

function ResultRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", borderRadius: 12,
      background: ok ? "rgba(16,185,129,0.09)" : "rgba(245,158,11,0.09)",
      border: `1px solid ${ok ? "rgba(16,185,129,0.28)" : "rgba(245,158,11,0.28)"}`,
    }}>
      <span style={{ color: ok ? T.green : T.amber, display: "flex", marginTop: 1 }}>
        <Icon name={ok ? "checkCircle" : "warn"} size={16} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 700, color: T.text, margin: 0 }}>{label}</p>
        <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.5, color: T.secondary, margin: "4px 0 0" }}>
          {detail}
        </p>
      </div>
    </div>
  )
}
