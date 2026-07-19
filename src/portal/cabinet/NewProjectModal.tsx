import React, { useEffect, useState } from "react"
import { useBlueprint } from "../../context/BlueprintContext"
import { useToast } from "../../context/ToastContext"
import type { OwnProfile, ProjectBrief, ReferenceKind } from "../../lib/api"
import { createProject, createReferences, titleFromUrl, updateOwnPhone } from "../../lib/api"
import { Badge, Btn, DISPLAY, Field, Icon, Input, MONO, Modal, Select, T, Textarea } from "../ui"

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
  const [refUrls, setRefUrls] = useState<string[]>([])
  const [refInput, setRefInput] = useState("")
  const [includeFoundry, setIncludeFoundry] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName("")
    setProjectType("")
    setBudgetRange("")
    setDeadline("")
    setReferences("")
    setRefUrls([])
    setRefInput("")
    setIncludeFoundry(true)
    setPhone(profile?.phone ?? "")
    setDesc(items.length > 0
      ? `Elementi selezionati dal Foundry:\n${items.map(i => `• ${i.title} — ${i.category}`).join("\n")}\n\n`
      : "")
  }, [open, profile, items])

  const canSubmit = name.trim() && desc.trim() && !busy

  function addRefUrl() {
    const u = refInput.trim()
    if (!u) return
    setRefUrls(prev => prev.includes(u) ? prev : [...prev, u])
    setRefInput("")
  }

  async function submit() {
    if (!canSubmit) return
    setBusy(true)
    try {
      if (phone.trim() && phone.trim() !== (profile?.phone ?? "")) {
        await updateOwnPhone(userId, phone).catch(() => {})
      }
      const brief: ProjectBrief = { projectType, budgetRange, deadline, references }
      const project = await createProject({ clientId: userId, name, description: desc, brief })

      // Blueprint: seed the project's reference board from the intake.
      const rows: Array<{ projectId: string; clientId: string; kind: ReferenceKind; title: string; url?: string; note?: string; source?: string }> = []
      for (const u of refUrls) {
        rows.push({ projectId: project.id, clientId: userId, kind: "link", title: titleFromUrl(u), url: u })
      }
      if (includeFoundry) {
        for (const it of items) {
          rows.push({ projectId: project.id, clientId: userId, kind: "foundry", title: it.title, note: it.description, source: it.category ? `Foundry · ${it.category}` : "Foundry" })
        }
      }
      if (rows.length > 0) await createReferences(rows).catch(() => {})

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
          background: "rgba(161,44,56,0.08)", border: "1px solid rgba(161,44,56,0.20)",
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
                  background: "rgba(161,44,56,0.16)", border: "1px solid rgba(161,44,56,0.28)",
                  color: T.copperLt,
                }}>
                  <Icon name={step.icon} size={13} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.10em", textTransform: "uppercase", color: T.faint }}>
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ display: "flex", alignItems: "center", paddingBottom: 20, color: "rgba(161,44,56,0.35)", fontSize: 14, flexShrink: 0 }}>
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

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
        <Field label="Note di stile (opzionale)" hint="Cosa ti piace, moodboard, direzione visiva.">
          <Textarea value={references} onChange={e => setReferences(e.target.value)} rows={2} placeholder="Es. minimale, molto bianco, tipografia grande…" style={{ resize: "vertical", minHeight: 60 }} />
        </Field>

        {/* Blueprint — reference sites/layouts */}
        <div style={{ padding: "13px 15px", borderRadius: 12, background: "rgba(161,44,56,0.06)", border: "1px solid rgba(161,44,56,0.20)", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.copperLt, margin: 0 }}>
            <Icon name="sparkle" size={12} /> Blueprint · siti e layout di riferimento
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={refInput} onChange={e => setRefInput(e.target.value)} placeholder="Incolla il link di un sito che ti ispira…" inputMode="url" style={{ flex: 1 }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addRefUrl() } }} />
            <Btn variant="outline" icon="plus" onClick={addRefUrl} disabled={!refInput.trim()}>Aggiungi</Btn>
          </div>
          {refUrls.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {refUrls.map(u => (
                <span key={u} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 99, background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, fontFamily: MONO, fontSize: 10, color: T.muted }}>
                  {titleFromUrl(u)}
                  <button onClick={() => setRefUrls(prev => prev.filter(x => x !== u))} style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, display: "inline-flex", padding: 0 }}>
                    <Icon name="x" size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {items.length > 0 && (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: DISPLAY, fontSize: 12.5, color: T.muted }}>
              <input type="checkbox" checked={includeFoundry} onChange={e => setIncludeFoundry(e.target.checked)} style={{ accentColor: "#A12C38", width: 15, height: 15 }} />
              Includi i miei {items.length} element{items.length === 1 ? "o" : "i"} dal Foundry
              <Badge tone="copper">Blueprint</Badge>
            </label>
          )}
          <p style={{ fontFamily: DISPLAY, fontSize: 11.5, lineHeight: 1.5, color: T.faint, margin: 0 }}>
            Potrai aggiungerne altri in qualsiasi momento dalla scheda «Riferimenti» del progetto.
          </p>
        </div>
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
