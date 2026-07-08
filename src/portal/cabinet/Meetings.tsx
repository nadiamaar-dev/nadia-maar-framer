import React, { useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientHome, Meeting } from "../../lib/api"
import { fmtDateTime, proposeMeeting, updateMeetingStatus } from "../../lib/api"
import Scheduler from "../Scheduler"
import {
  Badge, Btn, DISPLAY, Empty, Field, Glass, MEETING_STATUS, Modal, Note, Row,
  SectionTitle, Select, T, Tabs, Textarea,
} from "../ui"

export default function Meetings({ home, userId, reload }: {
  home: ClientHome
  userId: string
  reload: () => void
}) {
  const toast = useToast()
  const [tab, setTab] = useState<"prossime" | "archivio">("prossime")
  const [open, setOpen] = useState(false)
  const [slot, setSlot] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [projectId, setProjectId] = useState("")
  const [busy, setBusy] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const nowKey = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }, [])

  const upcoming = home.meetings
    .filter(m => (m.status === "pending" || m.status === "confirmed") && m.datetime >= nowKey)
    .sort((a, b) => a.datetime.localeCompare(b.datetime))
  const archive = home.meetings
    .filter(m => !upcoming.includes(m))
    .sort((a, b) => b.datetime.localeCompare(a.datetime))
  const list = tab === "prossime" ? upcoming : archive

  const projectName = (id?: string) => home.projects.find(p => p.id === id)?.name

  async function act(m: Meeting, status: "confirmed" | "cancelled") {
    if (actingId) return
    setActingId(m.id)
    try {
      await updateMeetingStatus(m.id, status)
      toast.success(status === "confirmed" ? "Riunione confermata" : "Riunione rifiutata")
      reload()
    } catch {
      toast.error("Operazione non riuscita. Riprova.")
    } finally {
      setActingId(null)
    }
  }

  async function submit() {
    if (!slot || busy) return
    setBusy(true)
    try {
      await proposeMeeting({
        clientId: userId,
        proposedBy: "client",
        datetime: slot,
        note: note.trim() || undefined,
        projectId: projectId || undefined,
      })
      setOpen(false)
      setSlot(null)
      setNote("")
      setProjectId("")
      setRefreshKey(k => k + 1)
      toast.success("Proposta inviata — attendi la conferma dello studio")
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
        kicker="Riunioni"
        title="Calendario incontri"
        sub="Video-call da 30 minuti nei giorni feriali."
        right={<Btn variant="primary" icon="plus" onClick={() => setOpen(true)}>Proponi riunione</Btn>}
      />

      <Tabs
        items={[
          { id: "prossime", label: "In programma", badge: upcoming.length || undefined },
          { id: "archivio", label: "Archivio" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <Glass variant="panel" style={{ padding: 20 }}>
        {list.length === 0 ? (
          <Empty
            icon="calendar"
            title={tab === "prossime" ? "Nessuna riunione in programma" : "Archivio vuoto"}
            hint={tab === "prossime" ? "Proponi un orario: confermiamo in giornata." : undefined}
            action={tab === "prossime" ? <Btn variant="copper" icon="plus" onClick={() => setOpen(true)}>Proponi un orario</Btn> : undefined}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {list.map(m => {
              const ms = MEETING_STATUS[m.status]
              const needsMyConfirm = m.status === "pending" && m.proposedBy === "admin" && tab === "prossime"
              const pname = projectName(m.projectId)
              return (
                <Row
                  key={m.id}
                  icon="calendar"
                  iconTone={ms.tone}
                  title={fmtDateTime(m.datetime)}
                  sub={[
                    `${m.durationMin} min`,
                    m.proposedBy === "admin" ? "proposta dallo studio" : "proposta da te",
                    pname ? `progetto: ${pname}` : null,
                    m.adminNote || m.clientNote || null,
                  ].filter(Boolean).join(" · ")}
                  right={
                    needsMyConfirm ? (
                      <span style={{ display: "inline-flex", gap: 7 }} onClick={e => e.stopPropagation()}>
                        <Btn size="sm" variant="ghost" onClick={() => act(m, "cancelled")} busy={actingId === m.id}>Rifiuta</Btn>
                        <Btn size="sm" variant="primary" icon="check" onClick={() => act(m, "confirmed")} busy={actingId === m.id}>Conferma</Btn>
                      </span>
                    ) : m.status === "pending" && m.proposedBy === "client" ? (
                      <Badge tone="amber" dot>In attesa di conferma</Badge>
                    ) : (
                      <Badge tone={ms.tone} dot>{ms.label}</Badge>
                    )
                  }
                />
              )
            })}
          </div>
        )}
      </Glass>

      {/* Propose modal */}
      <Modal
        open={open}
        onClose={() => !busy && setOpen(false)}
        kicker="Nuova proposta"
        title="Scegli un orario"
        width={560}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={submit} busy={busy} disabled={!slot}>
              {slot ? `Proponi · ${fmtDateTime(slot)}` : "Scegli uno slot"}
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Scheduler value={slot} onChange={setSlot} refreshKey={refreshKey} />
          {home.projects.length > 0 && (
            <Field label="Progetto (opzionale)">
              <Select value={projectId} onChange={e => setProjectId(e.target.value)} className="portal-input">
                <option value="">Nessun progetto specifico</option>
                {home.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          )}
          <Field label="Nota (opzionale)">
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Di cosa vuoi parlare?" style={{ resize: "vertical" }} />
          </Field>
          <Note tone="silver">
            La riunione resta <strong style={{ color: T.muted, fontFamily: DISPLAY }}>in attesa</strong> finché lo studio non conferma lo slot.
          </Note>
        </div>
      </Modal>
    </div>
  )
}
