import React, { useCallback, useEffect, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientAsset, ClientDocument, DocType } from "../../lib/api"
import {
  deleteDocument, fetchAssetsByProject, fetchDocumentsByProject, fmtDate,
  getAssetSignedUrl, getDocumentDownloadUrl, subscribe, uploadDocument,
} from "../../lib/api"
import { Badge, Btn, DISPLAY, DOC_TYPE, Empty, FileBtn, Glass, Icon, Loading, MONO, Note, Select, T } from "../ui"

function fmtBytes(n: number): string {
  if (!n) return "—"
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

const UPLOAD_TYPES: DocType[] = ["contract", "invoice", "report", "handover", "other"]

export default function DossierDocsAdmin({ projectId, clientId }: { projectId: string; clientId: string }) {
  const toast = useToast()
  const [docs, setDocs] = useState<ClientDocument[] | null>(null)
  const [assets, setAssets] = useState<ClientAsset[]>([])
  const [type, setType] = useState<DocType>("contract")
  const [requiresSig, setRequiresSig] = useState(false)
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [d, a] = await Promise.all([fetchDocumentsByProject(projectId), fetchAssetsByProject(projectId)])
    setDocs(d); setAssets(a)
  }, [projectId])

  useEffect(() => {
    load()
    const un1 = subscribe(`adm-docs-${projectId}`, { table: "client_documents", filter: `project_id=eq.${projectId}` }, load)
    const un2 = subscribe(`adm-asset-${projectId}`, { table: "client_assets", filter: `project_id=eq.${projectId}` }, load)
    return () => { un1(); un2() }
  }, [projectId, load])

  async function onFiles(files: File[]) {
    if (busy) return
    setBusy(true)
    try {
      for (const f of files) {
        await uploadDocument(clientId, f, type, { projectId, requiresSignature: requiresSig })
      }
      toast.success(files.length === 1 ? "Documento condiviso" : `${files.length} documenti condivisi`)
      setRequiresSig(false)
      await load()
    } catch {
      toast.error("Caricamento non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  async function remove(d: ClientDocument) {
    if (removing) return
    setRemoving(d.id)
    try {
      await deleteDocument(d)
      await load()
    } catch {
      toast.error("Eliminazione non riuscita.")
    } finally {
      setRemoving(null)
    }
  }

  async function openAsset(a: ClientAsset) {
    const url = await getAssetSignedUrl(a)
    if (url) window.open(url, "_blank", "noopener")
    else toast.error("Link non disponibile.")
  }

  if (docs === null) {
    return <Glass variant="panel" style={{ padding: 20 }}><Loading label="Carico i documenti" /></Glass>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Upload bar */}
      <Glass variant="panel" style={{ padding: 18 }}>
        <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.copperLt, margin: "0 0 12px" }}>
          Condividi un documento
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Select value={type} onChange={e => setType(e.target.value as DocType)} style={{ maxWidth: 180 }}>
            {UPLOAD_TYPES.map(t => <option key={t} value={t}>{DOC_TYPE[t].label}</option>)}
          </Select>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: DISPLAY, fontSize: 13, color: T.muted }}>
            <input type="checkbox" checked={requiresSig} onChange={e => setRequiresSig(e.target.checked)} style={{ accentColor: "#B83240", width: 16, height: 16 }} />
            Richiede firma del cliente
          </label>
          <FileBtn variant="primary" icon="plus" busy={busy} onFiles={onFiles}>Carica</FileBtn>
        </div>
      </Glass>

      {/* Shared documents */}
      <Glass variant="panel" style={{ padding: 20 }}>
        <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.faint, margin: "0 0 12px" }}>
          Documenti condivisi
        </p>
        {docs.length === 0 ? (
          <Empty icon="doc" title="Nessun documento" hint="Carica contratti, preventivi o materiali di consegna per il cliente." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map(d => {
              const meta = DOC_TYPE[d.type]
              return (
                <div key={d.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`,
                }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(184,50,64,0.12)", border: "1px solid rgba(184,50,64,0.26)", color: T.copperLt }}>
                    <Icon name={meta.icon} size={15} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span style={{ fontFamily: MONO, fontSize: 8.5, color: T.faint }}>{fmtDate(d.uploadedAt)} · {fmtBytes(d.sizeBytes)}</span>
                      {d.requiresSignature && (
                        d.signedAt
                          ? <Badge tone="green" dot>Firmato</Badge>
                          : <Badge tone="amber" dot>Attesa firma</Badge>
                      )}
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", gap: 7, flexShrink: 0 }}>
                    {d.storagePath && (
                      <a href={getDocumentDownloadUrl(d)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex" }}>
                        <Btn size="sm" variant="ghost" icon="download" />
                      </a>
                    )}
                    <Btn size="sm" variant="danger" icon="trash" busy={removing === d.id} onClick={() => remove(d)} />
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Glass>

      {/* Client-supplied assets */}
      <Glass variant="panel" style={{ padding: 20 }}>
        <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.faint, margin: "0 0 12px" }}>
          Materiali dal cliente
        </p>
        {assets.length === 0 ? (
          <Note tone="silver">Nessun materiale caricato dal cliente per questo progetto.</Note>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assets.map(a => (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`,
              }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.faint }}>
                  <Icon name="doc" size={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  <span style={{ fontFamily: MONO, fontSize: 8.5, color: T.faint }}>{fmtDate(a.createdAt)} · {fmtBytes(a.sizeBytes)}{a.uploadedBy === "admin" ? " · dallo studio" : ""}</span>
                </div>
                <Btn size="sm" variant="ghost" icon="download" onClick={() => openAsset(a)}>Apri</Btn>
              </div>
            ))}
          </div>
        )}
      </Glass>
    </div>
  )
}
