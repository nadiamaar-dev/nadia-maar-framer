import React, { useCallback, useEffect, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { CredentialKind, ProjectCredential } from "../../lib/api"
import {
  createCredential, deleteCredential, fetchCredentialsByProject, setCredentialReleased,
  subscribe, updateCredential,
} from "../../lib/api"
import {
  Badge, Btn, DISPLAY, Empty, Field, Glass, Icon, Input, Loading, MONO, Note, Select, T, Textarea,
} from "../ui"

type Draft = {
  id?: string
  kind: CredentialKind
  label: string
  url: string
  username: string
  secret: string
  note: string
  release: boolean
}

const EMPTY: Draft = { kind: "access", label: "", url: "", username: "", secret: "", note: "", release: true }

export default function DossierHandoverAdmin({ projectId, clientId }: { projectId: string; clientId: string }) {
  const toast = useToast()
  const [creds, setCreds] = useState<ProjectCredential[] | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setCreds(await fetchCredentialsByProject(projectId))
  }, [projectId])

  useEffect(() => {
    load()
    const un = subscribe(`adm-cred-${projectId}`, { table: "project_credentials", filter: `project_id=eq.${projectId}` }, load)
    return () => { un() }
  }, [projectId, load])

  function openNew() { setDraft({ ...EMPTY }) }
  function openEdit(c: ProjectCredential) {
    setDraft({
      id: c.id, kind: c.kind, label: c.label,
      url: c.url ?? "", username: c.username ?? "", secret: c.secret ?? "", note: c.note ?? "",
      release: !!c.releasedAt,
    })
  }

  async function save() {
    if (!draft || busy || !draft.label.trim()) return
    setBusy(true)
    try {
      if (draft.id) {
        await updateCredential(draft.id, {
          label: draft.label, url: draft.url, username: draft.username, secret: draft.secret, note: draft.note,
        })
      } else {
        await createCredential({
          projectId, clientId, kind: draft.kind, label: draft.label,
          url: draft.url, username: draft.username, secret: draft.secret, note: draft.note, release: draft.release,
        })
      }
      setDraft(null)
      toast.success(draft.id ? "Accesso aggiornato" : "Accesso creato")
      await load()
    } catch {
      toast.error("Operazione non riuscita.")
    } finally {
      setBusy(false)
    }
  }

  async function toggleRelease(c: ProjectCredential) {
    if (toggling) return
    setToggling(c.id)
    try {
      await setCredentialReleased(c.id, !c.releasedAt)
      toast.success(c.releasedAt ? "Accesso revocato" : "Accesso rilasciato al cliente")
      await load()
    } catch {
      toast.error("Operazione non riuscita.")
    } finally {
      setToggling(null)
    }
  }

  async function remove(c: ProjectCredential) {
    setToggling(c.id)
    try {
      await deleteCredential(c.id)
      await load()
    } catch {
      toast.error("Eliminazione non riuscita.")
    } finally {
      setToggling(null)
    }
  }

  if (creds === null) {
    return <Glass variant="panel" style={{ padding: 20 }}><Loading label="Carico gli accessi" /></Glass>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Glass variant="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: creds.length > 0 ? 14 : 0 }}>
          <div>
            <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.copperLt, margin: 0 }}>Consegna</p>
            <p style={{ fontFamily: DISPLAY, fontSize: 13, color: T.faint, margin: "5px 0 0" }}>Accessi (hosting, pannello) e risorse. Visibili al cliente solo dopo il rilascio.</p>
          </div>
          <Btn variant="primary" icon="plus" onClick={openNew}>Nuovo</Btn>
        </div>

        {creds.length === 0 ? (
          <Empty icon="lock" title="Nessun accesso" hint="Aggiungi le credenziali di hosting/pannello e le guide da consegnare al cliente." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {creds.map(c => {
              const released = !!c.releasedAt
              return (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", borderRadius: 12,
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`,
                }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(224,131,106,0.12)", border: "1px solid rgba(224,131,106,0.26)", color: T.copperLt }}>
                    <Icon name={c.kind === "access" ? "lock" : "external"} size={15} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <Badge tone={c.kind === "access" ? "copper" : "green"}>{c.kind === "access" ? "Accesso" : "Risorsa"}</Badge>
                      <Badge tone={released ? "green" : "steel"} dot>{released ? "Rilasciato" : "Bozza"}</Badge>
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", gap: 7, flexShrink: 0 }}>
                    <Btn size="sm" variant={released ? "outline" : "copper"} icon={released ? "lock" : "send"} busy={toggling === c.id} onClick={() => toggleRelease(c)}>
                      {released ? "Revoca" : "Rilascia"}
                    </Btn>
                    <Btn size="sm" variant="ghost" icon="edit" onClick={() => openEdit(c)} />
                    <Btn size="sm" variant="danger" icon="trash" busy={toggling === c.id} onClick={() => remove(c)} />
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Glass>

      {/* Editor modal — reuses Field/Input from the toolkit inside a lightweight sheet */}
      {draft && (
        <div
          onClick={() => !busy && setDraft(null)}
          style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(8,18,28,0.74)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto",
            borderRadius: 22, padding: 24,
            background: "rgba(16,30,44,0.98)", border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 40px 100px rgba(0,0,0,0.72)",
          }}>
            <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.copperLt, margin: 0 }}>Consegna</p>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: T.text, margin: "6px 0 18px" }}>
              {draft.id ? "Modifica accesso" : "Nuovo accesso"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {!draft.id && (
                <Field label="Tipo">
                  <Select value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value as CredentialKind })}>
                    <option value="access">Accesso (hosting, pannello, login)</option>
                    <option value="resource">Risorsa (guida, video, link)</option>
                  </Select>
                </Field>
              )}
              <Field label="Etichetta">
                <Input value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="Es. Pannello admin WordPress" autoFocus />
              </Field>
              <Field label="URL (opzionale)">
                <Input value={draft.url} onChange={e => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" inputMode="url" />
              </Field>
              {draft.kind === "access" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Utente (opzionale)">
                    <Input value={draft.username} onChange={e => setDraft({ ...draft, username: e.target.value })} placeholder="admin" />
                  </Field>
                  <Field label="Password (opzionale)">
                    <Input value={draft.secret} onChange={e => setDraft({ ...draft, secret: e.target.value })} placeholder="••••••" />
                  </Field>
                </div>
              )}
              <Field label="Note (opzionale)">
                <Textarea value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} rows={3} placeholder="Istruzioni per il cliente…" style={{ resize: "vertical" }} />
              </Field>
              {!draft.id && (
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: DISPLAY, fontSize: 13, color: T.muted }}>
                  <input type="checkbox" checked={draft.release} onChange={e => setDraft({ ...draft, release: e.target.checked })} style={{ accentColor: "#E0836A", width: 16, height: 16 }} />
                  Rilascia subito al cliente
                </label>
              )}
              {draft.id && <Note tone="silver">Lo stato di rilascio si gestisce dalla lista.</Note>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
              <Btn variant="ghost" onClick={() => setDraft(null)} disabled={busy}>Annulla</Btn>
              <Btn variant="primary" icon="check" busy={busy} disabled={!draft.label.trim()} onClick={save}>Salva</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
