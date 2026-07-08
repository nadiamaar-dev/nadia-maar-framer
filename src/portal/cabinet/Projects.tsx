import React, { useState } from "react"
import { useBlueprint } from "../../context/BlueprintContext"
import { useToast } from "../../context/ToastContext"
import type { ClientHome, OwnProfile } from "../../lib/api"
import { createProject, fmtDate, isUnreadFor, updateOwnPhone } from "../../lib/api"
import { stageProgress } from "../StageRail"
import {
  Badge, Bar, Btn, DISPLAY, Empty, Field, Glass, Icon, Input, Modal, MONO, Note,
  PROJECT_STATUS, SectionTitle, T, Textarea,
} from "../ui"

export default function Projects({ home, profile, userId, onOpenProject, reload }: {
  home: ClientHome
  profile: OwnProfile | null
  userId: string
  onOpenProject: (id: string) => void
  reload: () => void
}) {
  const { items, clearBlueprint } = useBlueprint()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [phone, setPhone] = useState("")
  const [busy, setBusy] = useState(false)

  function openWizard() {
    setName("")
    setPhone(profile?.phone ?? "")
    setDesc(items.length > 0
      ? `Elementi selezionati dal Foundry:\n${items.map(i => `• ${i.title} — ${i.category}`).join("\n")}\n\n`
      : "")
    setOpen(true)
  }

  async function submit() {
    if (!name.trim() || !desc.trim() || busy) return
    setBusy(true)
    try {
      if (phone.trim() && phone.trim() !== (profile?.phone ?? "")) {
        await updateOwnPhone(userId, phone).catch(() => {})
      }
      await createProject({ clientId: userId, name, description: desc })
      if (items.length > 0) clearBlueprint()
      setOpen(false)
      toast.success("Progetto inviato — lo valutiamo a breve")
      reload()
    } catch {
      toast.error("Invio non riuscito. Riprova.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Progetti"
        title="I tuoi progetti"
        sub="Ogni progetto ha il suo dossier: fasi, diario, fatture e riunioni."
        right={<Btn variant="primary" icon="plus" onClick={openWizard}>Nuovo progetto</Btn>}
      />

      {home.projects.length === 0 ? (
        <Glass variant="panel" style={{ padding: 20 }}>
          <Empty
            icon="folder"
            title="Nessun progetto ancora"
            hint="Racconta cosa vuoi costruire: ricevi una valutazione e un piano in fasi."
            action={<Btn variant="primary" icon="plus" onClick={openWizard}>Avvia il primo progetto</Btn>}
          />
        </Glass>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {home.projects.map(p => {
            const st = PROJECT_STATUS[p.status]
            const stages = home.stagesByProject[p.id] ?? []
            const progress = stageProgress(stages)
            const unreadHere = home.threads.filter(c => c.projectId === p.id && isUnreadFor(c, "client")).length
            return (
              <Glass key={p.id} variant="panel" hover onClick={() => onOpenProject(p.id)} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <h3 style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                    {p.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                    {unreadHere > 0 && (
                      <span title={`${unreadHere} discussioni con novità`} style={{ width: 7, height: 7, borderRadius: 99, background: T.copperLt, boxShadow: "0 0 8px rgba(212,105,90,0.8)" }} />
                    )}
                    <Badge tone={st.tone} dot>{st.label}</Badge>
                  </div>
                </div>

                <p style={{
                  fontFamily: DISPLAY, fontSize: 12, lineHeight: 1.55, color: T.faint, margin: 0,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {p.description || "—"}
                </p>

                {stages.length > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ghost }}>Avanzamento</span>
                      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: T.muted }}>{progress}%</span>
                    </div>
                    <Bar value={progress} tone={p.status === "completed" ? "green" : "copper"} />
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 4 }}>
                  <span style={{ fontFamily: MONO, fontSize: 9.5, color: T.ghost, letterSpacing: "0.05em" }}>{fmtDate(p.createdAt)}</span>
                  <span className="portal-link" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: DISPLAY, fontSize: 11.5, fontWeight: 700, color: T.copperLt }}>
                    Apri dossier <Icon name="arrowR" size={12} />
                  </span>
                </div>
              </Glass>
            )
          })}
        </div>
      )}

      {/* New project wizard */}
      <Modal
        open={open}
        onClose={() => !busy && setOpen(false)}
        kicker="Nuovo progetto"
        title="Racconta il progetto"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={submit} busy={busy} disabled={!name.trim() || !desc.trim()}>
              Invia per valutazione
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.length > 0 && (
            <Note tone="copper">
              {items.length} element{items.length === 1 ? "o" : "i"} dal tuo Blueprint Foundry inclus{items.length === 1 ? "o" : "i"} nella descrizione.
            </Note>
          )}
          <Field label="Nome del progetto">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Es. Sito vetrina + area riservata" autoFocus />
          </Field>
          <Field label="Descrizione" hint="Obiettivi, riferimenti, tempi ideali: più contesto dai, migliore sarà la proposta.">
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={6} placeholder="Descrivi cosa vuoi realizzare…" style={{ resize: "vertical", minHeight: 120 }} />
          </Field>
          <Field label="Telefono (opzionale)" hint="Per un contatto rapido in fase di valutazione.">
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+39 …" inputMode="tel" />
          </Field>
          <Note tone="silver">
            Il progetto entra <strong>in valutazione</strong>: definiamo insieme le fasi e ti arriva una notifica appena è attivo.
          </Note>
        </div>
      </Modal>
    </div>
  )
}
