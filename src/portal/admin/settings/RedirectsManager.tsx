import React, { useCallback, useEffect, useState } from "react"
import { useToast } from "../../../context/ToastContext"
import type { Redirect } from "../../../lib/api"
import {
  deleteRedirect, fetchRedirects, PRIVATE_ROUTES, saveRedirect, SITE_ROUTES, validateRedirect,
} from "../../../lib/api"
import {
  Badge, Btn, ConfirmDialog, DISPLAY, Empty, Field, Glass, Icon, Input, Loading, Modal, MONO,
  Note, Row, SectionTitle, Select, T,
} from "../../ui"

/* ══════════════════════════════════════════════════════════════════════════
   REDIRECT.

   Servono quando un indirizzo cambia o sparisce. Un 301 dice ai motori «si
   è spostato qui per sempre» e trasferisce il posizionamento che quella
   pagina si era guadagnata; senza, quel posizionamento va perso e chi
   arriva dal vecchio link trova un 404.

   Il controllo prima del salvataggio è la parte che conta: un redirect che
   punta a se stesso o che chiude un anello manda il browser a girare a
   vuoto, e un 301 sbagliato resta nella cache dei browser molto più a lungo
   di quanto serva a rendersene conto.
══════════════════════════════════════════════════════════════════════════ */

const LIVE = [...SITE_ROUTES.map(r => r.slug), ...PRIVATE_ROUTES]

const EMPTY = { oldPath: "", newPath: "", type: 301 as 301 | 302, active: true, note: "" }

export default function RedirectsManager() {
  const toast = useToast()
  const [list, setList] = useState<Redirect[] | null>(null)
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: string }) | null>(null)
  const [removing, setRemoving] = useState<Redirect | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try { setList(await fetchRedirects()) } catch { setList([]) }
  }, [])
  useEffect(() => { load() }, [load])

  const problem = editing && (editing.oldPath || editing.newPath)
    ? validateRedirect(editing, list ?? [], LIVE)
    : null

  async function save() {
    if (!editing || busy || problem) return
    setBusy(true)
    try {
      await saveRedirect(editing)
      toast.success(editing.id ? "Redirect aggiornato" : `${editing.oldPath} → ${editing.newPath}`)
      setEditing(null)
      load()
    } catch {
      toast.error("Salvataggio non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  async function toggle(r: Redirect) {
    try {
      await saveRedirect({ ...r, active: !r.active })
      load()
    } catch {
      toast.error("Operazione non riuscita.")
    }
  }

  async function remove() {
    if (!removing) return
    try {
      await deleteRedirect(removing.id)
      toast.info("Redirect eliminato")
      load()
    } catch {
      toast.error("Eliminazione non riuscita.")
    } finally {
      setRemoving(null)
    }
  }

  return (
    <Glass variant="panel" style={{ padding: 20 }}>
      <SectionTitle
        kicker="Indirizzi"
        title="Redirect"
        sub="Quando un indirizzo cambia, un 301 porta con sé anche il posizionamento."
        right={<Btn variant="primary" icon="plus" onClick={() => setEditing({ ...EMPTY })}>Nuovo redirect</Btn>}
      />

      <div style={{ marginTop: 16 }}>
        {list === null ? (
          <Loading label="Carico i redirect" />
        ) : list.length === 0 ? (
          <Empty
            icon="arrowR"
            title="Nessun redirect"
            hint="Aggiungine uno quando sposti o elimini una pagina. Nella scheda Traffico trovi i 404 registrati: sono i candidati naturali."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {list.map(r => (
              <Row
                key={r.id}
                icon="arrowR"
                iconTone={r.active ? (r.type === 301 ? "green" : "amber") : "steel"}
                title={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 9, flexWrap: "wrap", fontFamily: MONO, fontSize: 13.5 }}>
                    <span>{r.oldPath}</span>
                    <Icon name="arrowR" size={12} />
                    <span style={{ color: T.copperTx }}>{r.newPath}</span>
                  </span>
                }
                sub={[
                  `${r.type} ${r.type === 301 ? "permanente" : "temporaneo"}`,
                  r.hits > 0 ? `${r.hits} usi` : "mai usato",
                  r.note || null,
                ].filter(Boolean).join(" · ")}
                right={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                    <Badge tone={r.active ? "green" : "steel"} dot>{r.active ? "Attivo" : "Sospeso"}</Badge>
                    <Btn size="sm" variant="ghost" icon={r.active ? "pause" : "play"} onClick={() => toggle(r)}>
                      {r.active ? "Sospendi" : "Attiva"}
                    </Btn>
                    <Btn size="sm" variant="ghost" icon="edit" onClick={() => setEditing({ ...r, note: r.note ?? "" })} />
                    <Btn size="sm" variant="danger" icon="trash" onClick={() => setRemoving(r)} />
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => !busy && setEditing(null)}
        kicker="Indirizzi"
        title={editing?.id ? "Modifica redirect" : "Nuovo redirect"}
        width={560}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setEditing(null)} disabled={busy}>Annulla</Btn>
            <Btn variant="primary" icon="check" onClick={save} busy={busy}
              disabled={!editing?.oldPath.trim() || !editing?.newPath.trim() || !!problem}>
              Salva
            </Btn>
          </>
        }
      >
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Da (vecchio indirizzo)" hint="Il percorso che non esiste più, con la barra iniziale.">
              <Input value={editing.oldPath} onChange={e => setEditing({ ...editing, oldPath: e.target.value })}
                placeholder="/vecchia-pagina" style={{ fontFamily: MONO }} autoFocus />
            </Field>
            <Field label="A (nuovo indirizzo)" hint="Un percorso del sito, oppure un URL completo per uscire.">
              <Input value={editing.newPath} onChange={e => setEditing({ ...editing, newPath: e.target.value })}
                placeholder="/projects" style={{ fontFamily: MONO }} />
            </Field>
            <Field label="Tipo">
              <Select value={String(editing.type)} onChange={e => setEditing({ ...editing, type: Number(e.target.value) as 301 | 302 })}>
                <option value="301">301 — permanente, trasferisce il posizionamento</option>
                <option value="302">302 — temporaneo, non lo trasferisce</option>
              </Select>
            </Field>
            <Field label="Nota (facoltativa)" hint="Fra sei mesi servirà a ricordare perché esiste.">
              <Input value={editing.note} onChange={e => setEditing({ ...editing, note: e.target.value })}
                placeholder="Vecchio URL della pagina servizi" />
            </Field>

            {problem
              ? <Note tone="red">{problem}</Note>
              : editing.type === 301 && (
                <Note tone="amber">
                  I browser tengono un 301 in cache molto a lungo: se non sei certo che sia definitivo, usa un 302.
                </Note>
              )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        kicker="Indirizzi"
        title="Eliminare il redirect?"
        confirmLabel="Elimina"
        body={removing
          ? `${removing.oldPath} tornerà a rispondere 404. Chi ha ancora il vecchio link non arriverà più a destinazione.`
          : undefined}
      />
    </Glass>
  )
}
