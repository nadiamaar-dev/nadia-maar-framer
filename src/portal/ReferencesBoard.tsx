import React, { useCallback, useEffect, useState } from "react"
import { useToast } from "../context/ToastContext"
import type { ProjectReference, ReferenceKind } from "../lib/api"
import {
  createReference, createReferences, deleteReference, fetchReferences, subscribe, titleFromUrl,
} from "../lib/api"
import { Badge, Btn, DISPLAY, Empty, Icon, Input, Loading, MONO, Note, T } from "./ui"

type FoundryItem = { id: string; title: string; description?: string; category?: string }

const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i

function detectKind(url: string): ReferenceKind {
  if (!url) return "note"
  return IMAGE_RE.test(url) ? "image" : "link"
}

/** Per-project inspiration board (Blueprint). Client & admin both contribute. */
export default function ReferencesBoard({ projectId, clientId, role, foundryItems = [] }: {
  projectId: string
  clientId: string
  role: "client" | "admin"
  foundryItems?: FoundryItem[]
}) {
  const toast = useToast()
  const [refs, setRefs] = useState<ProjectReference[] | null>(null)
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setRefs(await fetchReferences(projectId)) } catch { setRefs([]) }
  }, [projectId])

  useEffect(() => {
    load()
    const un = subscribe(`refs-${projectId}`, { table: "project_references", filter: `project_id=eq.${projectId}` }, load)
    return () => { un() }
  }, [projectId, load])

  const canDelete = (r: ProjectReference) => role === "admin" || r.addedBy === "client"

  async function add() {
    const u = url.trim()
    const t = title.trim()
    if ((!u && !note.trim()) || busy) return
    setBusy(true)
    try {
      await createReference({
        projectId, clientId,
        kind: u ? detectKind(u) : "note",
        title: t || (u ? titleFromUrl(u) : "Nota"),
        url: u || undefined,
        imageUrl: u && detectKind(u) === "image" ? u : undefined,
        note: note.trim() || undefined,
        addedBy: role,
      })
      setUrl(""); setTitle(""); setNote("")
      await load()
    } catch {
      toast.error("Aggiunta non riuscita.")
    } finally {
      setBusy(false)
    }
  }

  async function importFoundry() {
    if (busy || foundryItems.length === 0) return
    const already = new Set((refs ?? []).filter(r => r.kind === "foundry").map(r => r.title))
    const fresh = foundryItems.filter(i => !already.has(i.title))
    if (fresh.length === 0) { toast.info("Elementi del Foundry già inclusi."); return }
    setBusy(true)
    try {
      await createReferences(fresh.map(i => ({
        projectId, clientId, kind: "foundry" as ReferenceKind,
        title: i.title, note: i.description,
        source: i.category ? `Foundry · ${i.category}` : "Foundry",
        addedBy: role,
      })))
      toast.success(`${fresh.length} element${fresh.length === 1 ? "o" : "i"} dal Foundry aggiunt${fresh.length === 1 ? "o" : "i"}`)
      await load()
    } catch {
      toast.error("Importazione non riuscita.")
    } finally {
      setBusy(false)
    }
  }

  async function remove(r: ProjectReference) {
    if (removing) return
    setRemoving(r.id)
    try { await deleteReference(r.id); await load() }
    catch { toast.error("Eliminazione non riuscita.") }
    finally { setRemoving(null) }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Note tone="copper">
        Aggiungi qui layout, siti o immagini che ti piacciono: diventano il <strong>Blueprint</strong> del progetto e guidano il design.
      </Note>

      {/* Add form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, padding: "14px 15px", borderRadius: 13, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL di un sito o di un'immagine…" inputMode="url" style={{ flex: "2 1 240px" }} onKeyDown={e => { if (e.key === "Enter") add() }} />
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Etichetta (opzionale)" style={{ flex: "1 1 140px" }} onKeyDown={e => { if (e.key === "Enter") add() }} />
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Cosa ti piace / nota (opzionale)" style={{ flex: 1 }} onKeyDown={e => { if (e.key === "Enter") add() }} />
          <Btn variant="primary" icon="plus" busy={busy} onClick={add} disabled={!url.trim() && !note.trim()}>Aggiungi</Btn>
        </div>
        {role === "client" && foundryItems.length > 0 && (
          <button
            onClick={importFoundry}
            className="portal-nav-item"
            style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 9, background: "rgba(184,50,64,0.10)", border: "1px solid rgba(184,50,64,0.24)", color: T.copperLt, fontFamily: DISPLAY, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
          >
            <Icon name="sparkle" size={13} /> Importa {foundryItems.length} element{foundryItems.length === 1 ? "o" : "i"} dal Foundry
          </button>
        )}
      </div>

      {/* Board */}
      {refs === null ? (
        <Loading label="Carico i riferimenti" />
      ) : refs.length === 0 ? (
        <Empty icon="sparkle" title="Nessun riferimento" hint="Incolla il link di un sito che ti ispira o carica un'immagine di esempio." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {refs.map(r => (
            <div key={r.id} style={{ display: "flex", flexDirection: "column", borderRadius: 13, overflow: "hidden", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}` }}>
              {r.kind === "image" && (r.imageUrl || r.url) && (
                <a href={r.url || r.imageUrl} target="_blank" rel="noreferrer" style={{ display: "block", aspectRatio: "16/10", overflow: "hidden", background: "rgba(0,0,0,0.25)" }}>
                  <img src={r.imageUrl || r.url} alt={r.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </a>
              )}
              <div style={{ padding: "12px 13px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Icon name={r.kind === "foundry" ? "sparkle" : r.kind === "image" ? "layers" : r.kind === "note" ? "doc" : "external"} size={13} style={{ color: T.copperLt, flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0, fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.title}
                  </span>
                  {canDelete(r) && (
                    <button onClick={() => remove(r)} disabled={removing === r.id} title="Elimina" style={{ background: "none", border: "none", cursor: "pointer", color: T.ghost, display: "inline-flex", padding: 2 }}>
                      <Icon name="trash" size={13} />
                    </button>
                  )}
                </div>
                {r.note && <p style={{ fontFamily: DISPLAY, fontSize: 12, lineHeight: 1.5, color: T.muted, margin: 0 }}>{r.note}</p>}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto", flexWrap: "wrap" }}>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="portal-link" style={{ fontFamily: MONO, fontSize: 9.5, color: T.copperLt, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                      <Icon name="external" size={10} /> {titleFromUrl(r.url)}
                    </a>
                  )}
                  {r.source && <span style={{ fontFamily: MONO, fontSize: 8.5, color: T.faint }}>{r.source}</span>}
                  <span style={{ flex: 1 }} />
                  <Badge tone={r.addedBy === "admin" ? "silver" : "copper"}>{r.addedBy === "admin" ? "studio" : "tu"}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
