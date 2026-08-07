import React, { useCallback, useEffect, useState } from "react"
import { useToast } from "../../../context/ToastContext"
import type { NotFoundStats } from "../../../lib/api"
import { fetchNotFoundStats, relativeDate, saveRedirect, SITE_ROUTES, validateRedirect } from "../../../lib/api"
import {
  Badge, Btn, DISPLAY, Empty, Field, Glass, Icon, Loading, Modal, MONO, Note, Row,
  SectionTitle, Select, T,
} from "../../ui"

/* ══════════════════════════════════════════════════════════════════════════
   LINK ROTTI.

   Un 404 è una visita già guadagnata e buttata via: qualcuno ha cliccato un
   link verso questo sito e non ha trovato niente. Perciò l'elenco non si
   limita a mostrarli — accanto a ognuno c'è il pulsante che lo trasforma in
   un redirect, che è l'unica cosa sensata da farne.

   Persone e bot sono contati a parte perché si risolvono in modo diverso:
   un bot che tenta /wp-admin.php è rumore da ignorare, una persona che
   arriva da un link vero è una pagina da recuperare.
══════════════════════════════════════════════════════════════════════════ */

type Window_ = "24" | "168" | "720"

const WINDOWS: { id: Window_; label: string }[] = [
  { id: "24", label: "24 ore" },
  { id: "168", label: "7 giorni" },
  { id: "720", label: "30 giorni" },
]

const LIVE = SITE_ROUTES.map(r => r.slug)

export default function NotFoundLog() {
  const toast = useToast()
  const [hours, setHours] = useState<Window_>("168")
  const [stats, setStats] = useState<NotFoundStats | null>(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [fixing, setFixing] = useState<{ from: string; to: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (h: Window_) => {
    setBusy(true)
    try {
      setStats(await fetchNotFoundStats(Number(h)))
      setError(false)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => { load(hours) }, [hours, load])

  async function createRedirect() {
    if (!fixing || saving) return
    const problem = validateRedirect({ oldPath: fixing.from, newPath: fixing.to }, [], LIVE)
    if (problem) { toast.error(problem); return }
    setSaving(true)
    try {
      await saveRedirect({ oldPath: fixing.from, newPath: fixing.to, type: 301, active: true, note: "Da log 404" })
      toast.success(`${fixing.from} → ${fixing.to}`)
      setFixing(null)
    } catch {
      toast.error("Creazione non riuscita.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Glass variant="panel" style={{ padding: 20 }}>
      <SectionTitle
        kicker="Diagnostica"
        title="Link rotti (404)"
        sub="Indirizzi richiesti che non esistono. Ognuno è una visita persa e un redirect mancante."
        right={
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            <Select value={hours} onChange={e => setHours(e.target.value as Window_)} style={{ width: 130 }}>
              {WINDOWS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
            </Select>
            <Btn variant="ghost" icon="bolt" busy={busy} onClick={() => load(hours)}>Aggiorna</Btn>
          </div>
        }
      />

      <div style={{ marginTop: 16 }}>
        {error ? (
          <Empty icon="warn" title="Registro non disponibile"
            hint="Richiede la migrazione portal_19. Se l'hai appena applicata, ricarica la pagina." />
        ) : stats === null ? (
          <Loading label="Cerco i link rotti" />
        ) : stats.paths.length === 0 ? (
          <Empty icon="checkCircle" title="Nessun link rotto"
            hint="In questa finestra nessuno ha chiesto un indirizzo inesistente." />
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <Badge tone={stats.humans > 0 ? "red" : "steel"} dot>
                {stats.humans} da persone
              </Badge>
              <Badge tone="steel" dot>{stats.total - stats.humans} da bot</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {stats.paths.map(p => (
                <Row
                  key={p.path}
                  icon="warn"
                  iconTone={p.humanHits > 0 ? "red" : "steel"}
                  title={<span style={{ fontFamily: MONO, fontSize: 13.5 }}>{p.path}</span>}
                  sub={[
                    `${p.hits} richieste`,
                    p.humanHits > 0 ? `${p.humanHits} da persone` : "solo bot",
                    p.topReferrer ? `da ${p.topReferrer}` : null,
                    relativeDate(p.lastSeen),
                  ].filter(Boolean).join(" · ")}
                  right={
                    <span onClick={e => e.stopPropagation()}>
                      <Btn size="sm" variant={p.humanHits > 0 ? "primary" : "ghost"} icon="arrowR"
                        onClick={() => setFixing({ from: p.path, to: "/" })}>
                        Crea redirect
                      </Btn>
                    </span>
                  }
                />
              ))}
            </div>

            {stats.total - stats.humans > stats.humans * 3 && (
              <div style={{ marginTop: 14 }}>
                <Note tone="silver">
                  Quasi tutti questi tentativi vengono da bot che cercano pannelli di WordPress o file di
                  configurazione: è rumore di fondo di internet, non un problema del sito. Vale la pena
                  intervenire solo su quelli con richieste da persone.
                </Note>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={!!fixing}
        onClose={() => !saving && setFixing(null)}
        kicker="Indirizzi"
        title="Recupera questo indirizzo"
        width={520}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setFixing(null)} disabled={saving}>Annulla</Btn>
            <Btn variant="primary" icon="check" onClick={createRedirect} busy={saving}>Crea il redirect 301</Btn>
          </>
        }
      >
        {fixing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              padding: "12px 14px", borderRadius: 12,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
            }}>
              <span style={{ fontFamily: MONO, fontSize: 13.5, color: T.text }}>{fixing.from}</span>
              <Icon name="arrowR" size={13} />
              <span style={{ fontFamily: MONO, fontSize: 13.5, color: T.copperTx }}>{fixing.to}</span>
            </div>
            <Field label="Porta a" hint="Scegli la pagina che risponde davvero alla richiesta di chi ha cliccato quel link.">
              <Select value={fixing.to} onChange={e => setFixing({ ...fixing, to: e.target.value })}>
                {SITE_ROUTES.map(r => <option key={r.slug} value={r.slug}>{r.slug} — {r.label}</option>)}
              </Select>
            </Field>
            <Note tone="silver">
              Un 301 trasferisce anche il posizionamento che il vecchio indirizzo si era guadagnato.
              Mandare tutto alla home è comodo ma spreca quel segnale: meglio la pagina più pertinente.
            </Note>
          </div>
        )}
      </Modal>
    </Glass>
  )
}
