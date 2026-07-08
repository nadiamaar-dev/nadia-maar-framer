import React, { useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { AdminHome, ClientRecord, Meeting } from "../../lib/api"
import { fmtDateTime, proposeMeeting, updateMeetingStatus } from "../../lib/api"
import Scheduler from "../Scheduler"
import {
  Badge, Btn, Empty, Field, Glass, MEETING_STATUS, Modal, Note, Row, SectionTitle,
  Select, T, Tabs, Textarea,
} from "../ui"

export default function MeetingsAdmin({ home, clients, reload }: {
  home: AdminHome
  clients: ClientRecord[]
  reload: () => void
}) {
  const toast = useToast()
  const [tab, setTab] = useState<"prossime" | "archivio">("prossime")
  const [open, setOpen] = useState(false)
  const [slot, setSlot] = useState<string | null>(null)
  const [clientId, setClientId] = useState("")
  const [note, setNote] = useState("")
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

  async function act(m: Meeting, status: "confirmed" | "cancelled") {
    if (actingId) return
    setActingId(m.id)
    try {
      await updateMeetingStatus(m.id, status)
      toast.success(status === "confirmed" ? "Riunione confermata" : "Riunione annullata")
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    } finally {
      setActingId(null)
    }
  }

  async function submit() {
    if (!slot || !clientId || busy) return
    setBusy(true)
    try {
      await proposeMeeting({ clientId, proposedBy: "admin", datetime: slot, note: note.trim() || undefined })
      setOpen(false)
      setSlot(null); setClientId(""); setNote("")
      setRefreshKey(k => k + 1)
      toast.success("Proposta inviata al cliente")
      reload()
    } catch {
      toast.error("Invio non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Agenda"
        title="Riunioni"
        sub="Conferma le richieste dei clienti o proponi tu uno slot."
        right={<Btn variant="primary" icon="plus" onClick={() => setOpen(true)}>Proponi riunione</Btn>}
      />

      <Tabs
        items={[
          { id: "prossime", label: "In programma", badge: upcoming.filter(m => m.status === "pending" && m.proposedBy === "client").length || undefined },
          { id: "archivio", label: "Archivio" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <Glass variant="panel" style={{ padding: 20 }}>
        {list.length === 0 ? (
          <Empty icon="calendar" title={tab === "prossime" ? "Agenda libera" : "Archivio vuoto"} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {list.map(m => {
              const ms = MEETING_STATUS[m.status]
              const needsConfirm = m.status === "pending" && m.proposedBy === "client" && tab === "prossime"
              return (
                <Row
                  key={m.id}
                  icon="calendar"
                  iconTone={ms.tone}
                  title={`${fmtDateTime(m.datetime)} · ${m.clientName ?? "—"}`}
                  sub={[
                    `${m.durationMin} min`,
                    m.proposedBy === "admin" ? "proposta dallo studio" : "richiesta dal cliente",
                    m.clientNote || m.adminNote || null,
                  ].filter(Boolean).join(" · ")}
                  right={
                    needsConfirm ? (
                      <span style={{ display: "inline-flex", gap: 7 }} onClick={e => e.stopPropagation()}>
                        <Btn size="sm" variant="ghost" onClick={() => act(m, "cancelled")} busy={actingId === m.id}>Rifiuta</Btn>
                        <Btn size="sm" variant="primary" icon="check" onClick={() => act(m, "confirmed")} busy={actingId === m.id}>Conferma</Btn>
                      </span>
                    ) : m.status === "confirmed" && tab === "prossime" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }} onClick={e => e.stopPropagation()}>
                        <Badge tone={ms.tone} dot>{ms.label}</Badge>
                        <Btn size="sm" variant="ghost" onClick={() => act(m, "cancelled")} busy={actingId === m.id}>Annulla</Btn>
                      </span>
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
        title="Proponi una riunione"
        width={560}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={submit} busy={busy} disabled={!slot || !clientId}>
              {slot ? `Proponi · ${fmtDateTime(slot)}` : "Scegli uno slot"}
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Cliente">
            <Select value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">Seleziona cliente…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
            </Select>
          </Field>
          <Scheduler value={slot} onChange={setSlot} refreshKey={refreshKey} />
          <Field label="Nota (opzionale)">
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Ordine del giorno…" style={{ resize: "vertical" }} />
          </Field>
          <Note tone="silver">Il cliente riceve la proposta nel suo portale e la conferma con un click.</Note>
        </div>
      </Modal>
    </div>
  )
}
