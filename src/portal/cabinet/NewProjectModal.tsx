import React, { useEffect, useState } from "react"
import { useBlueprint } from "../../context/BlueprintContext"
import { useToast } from "../../context/ToastContext"
import type { OwnProfile } from "../../lib/api"
import { createProject, updateOwnPhone } from "../../lib/api"
import { Btn, DISPLAY, Field, Icon, Input, MONO, Modal, Note, T, Textarea } from "../ui"

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
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Steps hint */}
        <div style={{
          display: "flex", gap: 0,
          padding: "12px 16px", borderRadius: 12,
          background: "rgba(224,131,106,0.08)", border: "1px solid rgba(224,131,106,0.20)",
        }}>
          {[
            { icon: "send" as const, label: "Invii il brief" },
            { icon: "sparkle" as const, label: "Valutiamo" },
            { icon: "layers" as const, label: "Attiviamo le fasi" },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, textAlign: "center" }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(224,131,106,0.16)", border: "1px solid rgba(224,131,106,0.28)",
                  color: T.copperLt,
                }}>
                  <Icon name={step.icon} size={13} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.10em", textTransform: "uppercase", color: T.faint }}>
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ display: "flex", alignItems: "center", paddingBottom: 20, color: "rgba(224,131,106,0.35)", fontSize: 14, flexShrink: 0 }}>
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

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
        <div style={{
          padding: "10px 14px", borderRadius: 11,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
        }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: T.faint, margin: 0 }}>
            Il progetto entra <span style={{ color: T.text, fontWeight: 600 }}>in valutazione</span>: definiamo insieme le fasi e ricevi una notifica appena è attivo.
          </p>
        </div>
      </div>
    </Modal>
  )
}
