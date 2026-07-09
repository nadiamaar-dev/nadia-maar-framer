import React, { useEffect, useState } from "react"
import { useBlueprint } from "../../context/BlueprintContext"
import { useToast } from "../../context/ToastContext"
import type { OwnProfile } from "../../lib/api"
import { createProject, updateOwnPhone } from "../../lib/api"
import { Btn, Field, Input, Modal, Note, Textarea } from "../ui"

/** Shared "new project" wizard — reachable from the empty state and the
 *  project switcher bar. Pulls any Blueprint Foundry selections into the brief. */
export default function NewProjectModal({ open, onClose, userId, profile, reload }: {
  open: boolean
  onClose: () => void
  userId: string
  profile: OwnProfile | null
  reload: () => void
}) {
  const { items, clearBlueprint } = useBlueprint()
  const toast = useToast()
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [phone, setPhone] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName("")
    setPhone(profile?.phone ?? "")
    setDesc(items.length > 0
      ? `Elementi selezionati dal Foundry:\n${items.map(i => `• ${i.title} — ${i.category}`).join("\n")}\n\n`
      : "")
  }, [open, profile, items])

  async function submit() {
    if (!name.trim() || !desc.trim() || busy) return
    setBusy(true)
    try {
      if (phone.trim() && phone.trim() !== (profile?.phone ?? "")) {
        await updateOwnPhone(userId, phone).catch(() => {})
      }
      await createProject({ clientId: userId, name, description: desc })
      if (items.length > 0) clearBlueprint()
      onClose()
      toast.success("Progetto inviato — lo valutiamo a breve")
      reload()
    } catch {
      toast.error("Invio non riuscito. Riprova.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      kicker="Nuovo progetto"
      title="Racconta il progetto"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={busy}>Annulla</Btn>
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
  )
}
