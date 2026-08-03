import React, { useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientHome, Meeting } from "../../lib/api"
import { fmtDateTime, proposeMeeting, updateMeetingStatus } from "../../lib/api"
import Scheduler from "../Scheduler"
import {
  Btn, DISPLAY, Empty, Field, Glass, Modal, Note,
  SectionTitle, Select, T, Tabs, Textarea,
} from "../ui"
import { MeetingRow } from "./rows"

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
  /* set when the client is cancelling; when `reschedule` is on, the propose
     modal opens straight after so "sposta" is one gesture, not two */
  const [cancelling, setCancelling] = useState<{ m: Meeting; reschedule: boolean } | null>(null)

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

  async function confirmCancel() {
    const target = cancelling
    if (!target || actingId) return
    setActingId(target.m.id)
    try {
      await updateMeetingStatus(target.m.id, "cancelled")
      setCancelling(null)
      if (target.reschedule) {
        setProjectId(target.m.projectId ?? "")
        setNote(target.m.clientNote ?? "")
        setSlot(null)
        setRefreshKey(k => k + 1)
        setOpen(true)
        toast.info("Slot liberato — scegline uno nuovo")
      } else {
        toast.success("Riunione annullata")
      }
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

      <Glass variant="work" style={{ padding: 20 }}>
        {list.length === 0 ? (
          <Empty
            icon="calendar"
            title={tab === "prossime" ? "Nessuna riunione in programma" : "Archivio vuoto"}
            hint={tab === "prossime" ? "Proponi un orario: confermiamo in giornata." : undefined}
            action={tab === "prossime" ? <Btn variant="copper" icon="plus" onClick={() => setOpen(true)}>Proponi un orario</Btn> : undefined}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {list.map(m => (
              <MeetingRow
                key={m.id}
                meeting={m}
                projectName={projectName(m.projectId)}
                actionable={tab === "prossime"}
                busy={actingId === m.id}
                onAct={act}
                onCancel={x => setCancelling({ m: x, reschedule: false })}
                onReschedule={x => setCancelling({ m: x, reschedule: true })}
              />
            ))}
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
            La riunione resta <strong style={{ color: T.text, fontFamily: DISPLAY }}>in attesa</strong> finché lo studio non conferma lo slot.
          </Note>
        </div>
      </Modal>

      {/* Cancel / reschedule confirmation */}
      <Modal
        open={cancelling !== null}
        onClose={() => !actingId && setCancelling(null)}
        kicker={cancelling?.reschedule ? "Sposta" : "Annulla"}
        title={cancelling?.reschedule ? "Spostare la riunione?" : "Annullare la riunione?"}
        width={460}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setCancelling(null)} disabled={!!actingId}>Indietro</Btn>
            <Btn
              variant={cancelling?.reschedule ? "primary" : "danger"}
              icon={cancelling?.reschedule ? "clock" : "x"}
              onClick={confirmCancel}
              busy={!!actingId}
            >
              {cancelling?.reschedule ? "Libera lo slot" : "Annulla la riunione"}
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 14.5, lineHeight: 1.6, color: T.text, margin: 0 }}>
            {cancelling ? fmtDateTime(cancelling.m.datetime) : ""}
            {cancelling?.m.durationMin ? ` · ${cancelling.m.durationMin} min` : ""}
          </p>
          <Note tone={cancelling?.reschedule ? "silver" : "amber"}>
            {cancelling?.reschedule
              ? "Lo slot torna libero e ti chiediamo subito il nuovo orario. Lo studio riceve la modifica."
              : "Lo studio viene avvisato. Per rimettere in agenda dovrai proporre un nuovo orario."}
          </Note>
        </div>
      </Modal>
    </div>
  )
}
