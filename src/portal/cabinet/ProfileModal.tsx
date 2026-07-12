import React, { useEffect, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { OwnProfile } from "../../lib/api"
import { updateOwnProfile } from "../../lib/api"
import { Btn, Field, Input, Modal, Note, T } from "../ui"

/** Client edits their own card — company, contact person, phone. */
export default function ProfileModal({ open, onClose, profile, userId, reload }: {
  open: boolean
  onClose: () => void
  profile: OwnProfile | null
  userId: string
  reload: () => void
}) {
  const toast = useToast()
  const [company, setCompany] = useState("")
  const [contact, setContact] = useState("")
  const [phone, setPhone] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setCompany(profile?.companyName ?? "")
    setContact(profile?.contactName ?? "")
    setPhone(profile?.phone ?? "")
  }, [open, profile])

  async function save() {
    if (busy) return
    setBusy(true)
    try {
      await updateOwnProfile(userId, { companyName: company, contactName: contact, phone })
      onClose()
      toast.success("Profilo aggiornato")
      reload()
    } catch {
      toast.error("Salvataggio non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      kicker="Il tuo profilo"
      title="Modifica i tuoi dati"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={busy}>Annulla</Btn>
          <Btn variant="primary" icon="check" onClick={save} busy={busy}>Salva</Btn>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Azienda / Nome" hint="Come vuoi essere identificato dallo studio.">
          <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Es. Studio Aurora" autoFocus />
        </Field>
        <Field label="Referente">
          <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Nome e cognome" />
        </Field>
        <Field label="Telefono">
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+39 …" inputMode="tel" />
        </Field>
        {profile?.email && (
          <Field label="Email">
            <Input value={profile.email} disabled readOnly style={{ opacity: 0.6, cursor: "not-allowed" }} />
          </Field>
        )}
        <Note tone="silver">L'email di accesso non è modificabile da qui: scrivici in Supporto per cambiarla.</Note>
      </div>
    </Modal>
  )
}
