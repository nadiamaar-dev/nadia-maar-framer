import React, { useEffect, useState } from "react"
import { useBlueprint } from "../../context/BlueprintContext"
import { useToast } from "../../context/ToastContext"
import type { OwnProfile, ProjectBrief } from "../../lib/api"
import { createProject, updateOwnPhone } from "../../lib/api"
import { Btn, DISPLAY, Field, Icon, Input, MONO, Modal, Note, Select, T, Textarea } from "../ui"

const PROJECT_TYPES = [
  "Sito vetrina",
  "E-commerce",
  "Web app / area riservata",
  "Branding & identità",
  "Restyling / evoluzione",
  "Altro",
]
const BUDGET_RANGES = [
  "Fino a 2.000 €",
  "2.000 – 5.000 €",
  "5.000 – 10.000 €",
  "Oltre 10.000 €",
  "Da definire insieme",
]
const DEADLINES = [
  "Il prima possibile",
  "Entro 1 mese",
  "1 – 3 mesi",
  "3 – 6 mesi",
  "Nessuna scadenza precisa",
]

/** Structured onboarding brief — the client's project intake (Fase 1). */
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
  const [projectType, setProjectType] = useState("")
  const [budgetRange, setBudgetRange] = useState("")
  const [deadline, setDeadline] = useState("")
  const [desc, setDesc] = useState("")
  const [references, setReferences] = useState("")
  const [phone, setPhone] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName("")
    setProjectType("")
    setBudgetRange("")
    setDeadline("")
    setReferences("")
    setPhone(profile?.phone ?? "")
    setDesc(items.length > 0
      ? `Elementi selezionati dal Foundry:\n${items.map(i => `• ${i.title} — ${i.category}`).join("\n")}\n\n`
      : "")
  }, [open, profile, items])

  const canSubmit = name.trim() && desc.trim() && !busy

  async function submit() {
    if (!canSubmit) return
    setBusy(true)
    try {
      if (phone.trim() && phone.trim() !== (profile?.phone ?? "")) {
        await updateOwnPhone(userId, phone).catch(() => {})
      }
      const brief: ProjectBrief = { projectType, budgetRange, deadline, references }
      await createProject({ clientId: userId, name, description: desc, brief })
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
      width={580}
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
            {items.length} element{items.length === 1 ? "o" : "i"} dal tuo Blueprint Foundry inclus{items.length === 1 ? "o" : "i"} nel brief.
          </Note>
        )}

        <Field label="Nome del progetto">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Es. Sito vetrina + area riservata" autoFocus />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <Field label="Tipo di progetto">
            <Select value={projectType} onChange={e => setProjectType(e.target.value)}>
              <option value="">Seleziona…</option>
              {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Budget indicativo">
            <Select value={budgetRange} onChange={e => setBudgetRange(e.target.value)}>
              <option value="">Seleziona…</option>
              {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
            </Select>
          </Field>
          <Field label="Tempistiche">
            <Select value={deadline} onChange={e => setDeadline(e.target.value)}>
              <option value="">Seleziona…</option>
              {DEADLINES.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Obiettivi & descrizione" hint="Cosa vuoi ottenere, funzioni chiave, pubblico: più contesto dai, migliore sarà la proposta.">
          <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Descrivi cosa vuoi realizzare…" style={{ resize: "vertical", minHeight: 110 }} />
        </Field>
        <Field label="Riferimenti (opzionale)" hint="Link a siti che ti piacciono, moodboard, esempi da cui partire.">
          <Textarea value={references} onChange={e => setReferences(e.target.value)} rows={2} placeholder="https://…" style={{ resize: "vertical", minHeight: 60 }} />
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
