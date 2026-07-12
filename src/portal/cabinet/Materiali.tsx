import React, { useEffect, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientAsset, ClientProject } from "../../lib/api"
import { deleteAsset, fetchAssets, fmtDate, getAssetSignedUrl, uploadAsset } from "../../lib/api"
import { Badge, Btn, DISPLAY, Empty, FileBtn, Glass, Icon, Loading, MONO, Note, SectionTitle, Select, Stat, T } from "../ui"

function fmtBytes(n: number): string {
  if (!n) return "—"
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export default function Materiali({ userId, projects }: { userId: string; projects: ClientProject[] }) {
  const toast = useToast()
  const [assets, setAssets] = useState<ClientAsset[] | null>(null)
  const [projectId, setProjectId] = useState<string>("")
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  async function load() {
    try {
      setAssets(await fetchAssets(userId))
    } catch {
      setAssets([])
    }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId])

  async function onFiles(files: File[]) {
    if (busy) return
    setBusy(true)
    try {
      for (const f of files) {
        await uploadAsset(userId, f, { projectId: projectId || undefined })
      }
      toast.success(files.length === 1 ? "Materiale caricato" : `${files.length} file caricati`)
      await load()
    } catch {
      toast.error("Caricamento non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  async function open(a: ClientAsset) {
    const url = await getAssetSignedUrl(a)
    if (url) window.open(url, "_blank", "noopener")
    else toast.error("Link non disponibile.")
  }

  async function remove(a: ClientAsset) {
    if (removing) return
    setRemoving(a.id)
    try {
      await deleteAsset(a)
      await load()
    } catch {
      toast.error("Eliminazione non riuscita.")
    } finally {
      setRemoving(null)
    }
  }

  const projectName = (id?: string) => projects.find(p => p.id === id)?.name

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Materiali"
        title="I tuoi file & asset"
        sub="Carica loghi, testi, foto e ogni materiale utile: lo studio li trova qui."
        right={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {projects.length > 0 && (
              <Select value={projectId} onChange={e => setProjectId(e.target.value)} style={{ maxWidth: 200 }}>
                <option value="">Nessun progetto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            )}
            <FileBtn variant="primary" icon="plus" busy={busy} onFiles={onFiles}>Carica</FileBtn>
          </span>
        }
      />

      {assets === null ? (
        <Glass variant="panel" style={{ padding: 20 }}><Loading label="Carico i materiali" /></Glass>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <Stat label="File caricati" value={String(assets.length)} icon="folder" tone="silver" />
            <Stat label="Spazio usato" value={fmtBytes(assets.reduce((s, a) => s + a.sizeBytes, 0))} icon="layers" tone="copper" />
          </div>

          <Glass variant="panel" style={{ padding: 20 }}>
            {assets.length === 0 ? (
              <Empty
                icon="folder"
                title="Nessun materiale"
                hint="Trascina qui loghi, testi o immagini caricandoli con il pulsante «Carica»."
                action={<FileBtn variant="outline" icon="plus" busy={busy} onFiles={onFiles}>Carica il primo file</FileBtn>}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {assets.map(a => (
                  <div key={a.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "13px 16px", borderRadius: 13,
                    background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`,
                  }}>
                    <span style={{
                      width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.faint,
                    }}>
                      <Icon name="doc" size={17} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: T.faint }}>{fmtDate(a.createdAt)} · {fmtBytes(a.sizeBytes)}</span>
                        {a.projectId && <Badge tone="copper">{projectName(a.projectId) ?? "Progetto"}</Badge>}
                        {a.uploadedBy === "admin" && <Badge tone="silver">dallo studio</Badge>}
                      </div>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <Btn size="sm" variant="ghost" icon="download" onClick={() => open(a)}>Apri</Btn>
                      {a.uploadedBy === "client" && (
                        <Btn size="sm" variant="danger" icon="trash" busy={removing === a.id} onClick={() => remove(a)} title="Elimina" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Glass>

          <Note tone="silver">I file sono privati: solo tu e lo studio potete vederli.</Note>
        </>
      )}
    </div>
  )
}
