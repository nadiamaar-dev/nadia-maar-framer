import React, { useCallback, useEffect, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type {
  Conversation, Invoice, Meeting, ProjectEvent, ProjectStage, ProjectStatus,
} from "../../lib/api"
import {
  advanceStage, createStage, deleteStage, fetchInvoicesByProject, fetchMeetingsByProject,
  fetchProjectEvents, fetchProjectStages, fmtDate, fmtDateTime, fmtEur,
  getOrCreateStageConversation, isUnreadFor, requestStageApproval, subscribe,
  updateProjectStatus, updateStage,
} from "../../lib/api"
import type { AdminHome } from "../../lib/api"
import AuditTrail from "./AuditTrail"
import ChatThread from "../ChatThread"
import DossierDocsAdmin from "./DossierDocsAdmin"
import DossierHandoverAdmin from "./DossierHandoverAdmin"
import StageRail, { stageProgress } from "../StageRail"
import {
  Badge, BriefCard, Btn, DISPLAY, Empty, Field, Glass, Icon, Input, INVOICE_STATUS, Loading,
  MEETING_STATUS, Modal, MONO, Note, PROJECT_STATUS, Ring, Row, T, Tabs, Textarea,
  Timeline,
} from "../ui"

type TabId = "fasi" | "diario" | "documenti" | "consegna" | "fatture" | "riunioni"

export default function DossierAdmin({ projectId, home, adminId, onBack, reload }: {
  projectId: string
  home: AdminHome
  adminId: string
  onBack: () => void
  reload: () => void
}) {
  const toast = useToast()
  const project = home.projects.find(p => p.id === projectId)

  const [tab, setTab] = useState<TabId>("fasi")
  const [stages, setStages] = useState<ProjectStage[]>([])
  const [events, setEvents] = useState<ProjectEvent[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [s, e, i, m] = await Promise.all([
        fetchProjectStages(projectId),
        fetchProjectEvents(projectId),
        fetchInvoicesByProject(projectId),
        fetchMeetingsByProject(projectId),
      ])
      setStages(s); setEvents(e); setInvoices(i); setMeetings(m)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    setLoading(true)
    load()
    const un1 = subscribe(`adm-dossier-ev-${projectId}`, { table: "project_events", filter: `project_id=eq.${projectId}` }, load)
    const un2 = subscribe(`adm-dossier-st-${projectId}`, { table: "project_stages", filter: `project_id=eq.${projectId}` }, load)
    return () => { un1(); un2() }
  }, [projectId, load])

  /* ── Project status transition ── */
  const [statusTo, setStatusTo] = useState<ProjectStatus | null>(null)
  const [statusNote, setStatusNote] = useState("")
  const [statusBusy, setStatusBusy] = useState(false)

  function openStatus(to: ProjectStatus) {
    setStatusNote(project?.adminNote ?? "")
    setStatusTo(to)
  }

  async function confirmStatus() {
    if (!statusTo || statusBusy) return
    setStatusBusy(true)
    try {
      await updateProjectStatus(projectId, statusTo, statusNote.trim() || undefined)
      setStatusTo(null)
      toast.success(`Progetto → ${PROJECT_STATUS[statusTo].label}`)
      reload()
    } catch {
      toast.error("Aggiornamento non riuscito.")
    } finally {
      setStatusBusy(false)
    }
  }

  /* ── Stage ops ── */
  const [newStage, setNewStage] = useState("")
  const [addBusy, setAddBusy] = useState(false)
  const [renaming, setRenaming] = useState<ProjectStage | null>(null)
  const [renameText, setRenameText] = useState("")
  const [editNote, setEditNote] = useState("")
  const [editProgress, setEditProgress] = useState(0)
  const [deleting, setDeleting] = useState<ProjectStage | null>(null)
  const [advancing, setAdvancing] = useState<ProjectStage | null>(null)
  const [requesting, setRequesting] = useState<ProjectStage | null>(null)
  const [reqUrl, setReqUrl] = useState("")
  const [reqNote, setReqNote] = useState("")
  const [opBusy, setOpBusy] = useState(false)

  const [chatStage, setChatStage] = useState<ProjectStage | null>(null)
  const [chatConvo, setChatConvo] = useState<Conversation | null>(null)

  async function stageOp(fn: () => Promise<void>, okMsg: string, close: () => void) {
    if (opBusy) return
    setOpBusy(true)
    try {
      await fn()
      close()
      toast.success(okMsg)
      await load()
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    } finally {
      setOpBusy(false)
    }
  }

  async function addStage() {
    const title = newStage.trim()
    if (!title || addBusy) return
    setAddBusy(true)
    try {
      const next = stages.reduce((m, s) => Math.max(m, s.orderIndex), 0) + 1
      await createStage(projectId, title, next)
      setNewStage("")
      await load()
    } catch {
      toast.error("Creazione fase non riuscita.")
    } finally {
      setAddBusy(false)
    }
  }

  async function openStageChat(s: ProjectStage) {
    if (!project) return
    setChatStage(s)
    setChatConvo(null)
    try {
      const convo = await getOrCreateStageConversation({
        projectId, stageId: s.id, clientId: project.clientId,
        subject: `${project.name} — ${s.title}`,
      })
      setChatConvo(convo)
    } catch {
      setChatStage(null)
      toast.error("Impossibile aprire la discussione.")
    }
  }

  if (!project) {
    return (
      <Glass variant="panel" style={{ padding: 20 }}>
        <Empty icon="folder" title="Progetto non trovato" action={<Btn variant="ghost" icon="arrowL" onClick={onBack}>Torna ai progetti</Btn>} />
      </Glass>
    )
  }

  const st = PROJECT_STATUS[project.status]
  const progress = stageProgress(stages)
  const stageUnread = (s: ProjectStage) => {
    const c = home.threads.find(t => t.stageId === s.id)
    return !!c && isUnreadFor(c, "admin")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <Glass variant="panel" style={{ padding: 22 }}>
        <button
          onClick={onBack}
          className="portal-link"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none",
            padding: 0, marginBottom: 10, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em",
            textTransform: "uppercase", color: T.ghost, cursor: "pointer",
          }}
        >
          <Icon name="arrowL" size={11} /> Progetti
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>
                {project.name}
              </h2>
              <Badge tone={st.tone} dot>{st.label}</Badge>
            </div>
            <p style={{ fontFamily: MONO, fontSize: 10.5, color: T.faint, margin: "7px 0 0" }}>
              {project.clientName} · {project.clientEmail} · avviato {fmtDate(project.createdAt)}
            </p>
            {project.description && (
              <p style={{ fontFamily: DISPLAY, fontSize: 12.5, lineHeight: 1.6, color: T.faint, margin: "10px 0 0", maxWidth: 640, whiteSpace: "pre-wrap" }}>
                {project.description}
              </p>
            )}
          </div>
          {(project.brief?.projectType || project.brief?.budgetRange || project.brief?.deadline || project.brief?.references) && (
            <div style={{ flexBasis: "100%", marginTop: 4 }}>
              <BriefCard brief={project.brief} />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <Ring value={progress} size={62} stroke={5} tone={project.status === "completed" ? "green" : "copper"} />
            <div>
              <p style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>
                {stages.filter(s => s.status === "done").length}/{stages.length} fasi
              </p>
              <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ghost, margin: "3px 0 0" }}>
                completate
              </p>
            </div>
          </div>
        </div>

        {/* Status controls */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
          {project.status === "pending_approval" && (
            <Btn variant="primary" icon="check" onClick={() => openStatus("active")}>Approva e attiva</Btn>
          )}
          {project.status === "active" && (
            <>
              <Btn variant="outline" icon="pause" onClick={() => openStatus("paused")}>Metti in pausa</Btn>
              <Btn variant="copper" icon="flag" onClick={() => openStatus("completed")}>Segna completato</Btn>
            </>
          )}
          {project.status === "paused" && (
            <Btn variant="primary" icon="play" onClick={() => openStatus("active")}>Riprendi</Btn>
          )}
          {project.status === "completed" && (
            <Btn variant="outline" icon="play" onClick={() => openStatus("active")}>Riapri</Btn>
          )}
        </div>
        {project.adminNote && (
          <div style={{ marginTop: 12 }}>
            <Note tone="silver"><strong>Nota per il cliente:</strong> {project.adminNote}</Note>
          </div>
        )}
      </Glass>

      <Tabs<TabId>
        items={[
          { id: "fasi", label: "Fasi", badge: stages.filter(s => s.approvalState === "requested").length || undefined },
          { id: "diario", label: "Diario" },
          { id: "documenti", label: "Documenti" },
          { id: "consegna", label: "Consegna" },
          { id: "fatture", label: "Fatture" },
          { id: "riunioni", label: "Riunioni" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {loading ? (
        <Glass variant="panel" style={{ padding: 20 }}><Loading label="Apro il dossier" /></Glass>
      ) : (
        <>
          {tab === "fasi" && (
            <Glass variant="panel" style={{ padding: 22 }}>
              {project.status === "pending_approval" && stages.length === 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Note tone="amber">Definisci il piano in fasi qui sotto, poi approva il progetto: la prima fase parte da sola.</Note>
                </div>
              )}
              {stages.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <StageRail
                    stages={stages}
                    renderAction={s => (
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                        {s.status === "active" && s.approvalState === "none" && (
                          <Btn size="sm" variant="copper" icon="flag" onClick={() => { setReqUrl(s.deliverableUrl ?? ""); setReqNote(s.deliverableNote ?? ""); setRequesting(s) }}>
                            Chiedi approvazione
                          </Btn>
                        )}
                        {s.status === "active" && (
                          <Btn size="sm" variant="primary" icon="check" onClick={() => setAdvancing(s)}>
                            Chiudi fase
                          </Btn>
                        )}
                        {s.status !== "locked" && (
                          <span style={{ position: "relative", display: "inline-flex" }}>
                            <Btn size="sm" variant="ghost" icon="chat" onClick={() => openStageChat(s)}>Discussione</Btn>
                            {stageUnread(s) && (
                              <span style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: 99, background: T.copperLt, boxShadow: "0 0 8px rgba(212,105,90,0.8)" }} />
                            )}
                          </span>
                        )}
                        <Btn size="sm" variant="ghost" icon="edit" onClick={() => { setRenameText(s.title); setEditNote(s.deliverableNote ?? ""); setEditProgress(s.progress); setRenaming(s) }} title="Modifica">
                          Modifica
                        </Btn>
                        {s.status === "locked" && (
                          <Btn size="sm" variant="danger" icon="trash" onClick={() => setDeleting(s)} title="Elimina" />
                        )}
                      </div>
                    )}
                  />
                </div>
              )}
              {/* Add stage */}
              <div style={{ display: "flex", gap: 8, marginTop: stages.length > 0 ? 18 : 0, paddingTop: stages.length > 0 ? 16 : 0, borderTop: stages.length > 0 ? `1px solid ${T.border}` : "none" }}>
                <Input
                  value={newStage}
                  onChange={e => setNewStage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addStage() }}
                  placeholder="Nuova fase — es. Design UI"
                />
                <Btn variant="outline" icon="plus" onClick={addStage} busy={addBusy} disabled={!newStage.trim()}>
                  Aggiungi
                </Btn>
              </div>
            </Glass>
          )}

          {tab === "diario" && (
            <Glass variant="panel" style={{ padding: 22 }}>
              {events.length === 0
                ? <Empty icon="sparkle" title="Diario vuoto" hint="Ogni transizione del progetto viene registrata qui." />
                : <Timeline events={events} />}
              <AuditTrail projectId={projectId} />
            </Glass>
          )}

          {tab === "documenti" && (
            <DossierDocsAdmin projectId={projectId} clientId={project.clientId} />
          )}

          {tab === "consegna" && (
            <DossierHandoverAdmin projectId={projectId} clientId={project.clientId} />
          )}

          {tab === "fatture" && (
            <Glass variant="panel" style={{ padding: 22 }}>
              {invoices.length === 0 ? (
                <Empty icon="invoice" title="Nessuna fattura" hint="Le fatture del progetto si emettono dalla scheda cliente." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {invoices.map(i => {
                    const is = INVOICE_STATUS[i.status]
                    return (
                      <Row
                        key={i.id}
                        icon="invoice"
                        iconTone={is.tone}
                        title={`${i.number} — ${i.description}`}
                        sub={`Emessa ${fmtDate(i.issuedAt)}${i.dueDate ? ` · scade ${fmtDate(i.dueDate)}` : ""}`}
                        right={
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                            <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: T.text }}>{fmtEur(i.amount)}</span>
                            <Badge tone={is.tone} dot>{is.label}</Badge>
                          </span>
                        }
                      />
                    )
                  })}
                </div>
              )}
            </Glass>
          )}

          {tab === "riunioni" && (
            <Glass variant="panel" style={{ padding: 22 }}>
              {meetings.length === 0 ? (
                <Empty icon="calendar" title="Nessuna riunione" hint="Le riunioni legate al progetto appariranno qui." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {meetings.map(m => {
                    const ms = MEETING_STATUS[m.status]
                    return (
                      <Row
                        key={m.id}
                        icon="calendar"
                        iconTone={ms.tone}
                        title={fmtDateTime(m.datetime)}
                        sub={`${m.durationMin} min · proposta ${m.proposedBy === "admin" ? "dallo studio" : "dal cliente"}`}
                        right={<Badge tone={ms.tone} dot>{ms.label}</Badge>}
                      />
                    )
                  })}
                </div>
              )}
            </Glass>
          )}
        </>
      )}

      {/* Status transition modal */}
      <Modal
        open={!!statusTo}
        onClose={() => !statusBusy && setStatusTo(null)}
        kicker="Stato progetto"
        title={statusTo ? `Progetto → ${PROJECT_STATUS[statusTo].label}` : ""}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setStatusTo(null)} disabled={statusBusy}>Annulla</Btn>
            <Btn variant="primary" icon="check" onClick={confirmStatus} busy={statusBusy}>Conferma</Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {statusTo === "active" && project.status === "pending_approval" && stages.length === 0 && (
            <Note tone="amber">Non hai ancora definito le fasi: puoi attivare comunque e aggiungerle dopo.</Note>
          )}
          <Field label="Nota per il cliente (opzionale)" hint="Visibile nel dossier del cliente.">
            <Textarea value={statusNote} onChange={e => setStatusNote(e.target.value)} rows={3} style={{ resize: "vertical" }} />
          </Field>
        </div>
      </Modal>

      {/* Request approval modal */}
      <Modal
        open={!!requesting}
        onClose={() => !opBusy && setRequesting(null)}
        kicker="Approvazione fase"
        title={requesting ? `Chiedi il via libera su «${requesting.title}»` : ""}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setRequesting(null)} disabled={opBusy}>Annulla</Btn>
            <Btn variant="primary" icon="send" busy={opBusy}
              onClick={() => requesting && stageOp(() => requestStageApproval(requesting.id, { url: reqUrl, note: reqNote }), "Richiesta inviata al cliente", () => setRequesting(null))}>
              Invia richiesta
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="Link al deliverable (opzionale)">
            <Input value={reqUrl} onChange={e => setReqUrl(e.target.value)} placeholder="https://…" inputMode="url" />
          </Field>
          <Field label="Nota per il cliente (opzionale)">
            <Textarea value={reqNote} onChange={e => setReqNote(e.target.value)} rows={3} placeholder="Cosa deve guardare, cosa aspettarti…" style={{ resize: "vertical" }} />
          </Field>
          <Note tone="silver">Il cliente vede il deliverable nel dossier e riceve l'azione «Approva fase».</Note>
        </div>
      </Modal>

      {/* Advance stage confirm */}
      <Modal
        open={!!advancing}
        onClose={() => !opBusy && setAdvancing(null)}
        kicker="Avanzamento"
        title={advancing ? `Chiudi «${advancing.title}»?` : ""}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setAdvancing(null)} disabled={opBusy}>Annulla</Btn>
            <Btn variant="primary" icon="check" busy={opBusy}
              onClick={() => advancing && stageOp(() => advanceStage(advancing.id), "Fase chiusa — la prossima è attiva", () => setAdvancing(null))}>
              Chiudi fase
            </Btn>
          </>
        }
      >
        <p style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: T.muted, margin: 0 }}>
          La fase viene segnata come completata e quella successiva si attiva.
          {advancing?.approvalState === "requested" && " C'è una richiesta di approvazione ancora aperta: chiudendo la fase la superi manualmente."}
          {" "}Se era l'ultima, il progetto risulterà completato.
        </p>
      </Modal>

      {/* Edit stage — title, description, progress */}
      <Modal
        open={!!renaming}
        onClose={() => !opBusy && setRenaming(null)}
        kicker="Fasi"
        title="Modifica fase"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setRenaming(null)} disabled={opBusy}>Annulla</Btn>
            <Btn variant="primary" icon="check" busy={opBusy} disabled={!renameText.trim()}
              onClick={() => renaming && stageOp(
                () => updateStage(renaming.id, { title: renameText.trim(), deliverableNote: editNote, progress: editProgress }),
                "Fase aggiornata", () => setRenaming(null),
              )}>
              Salva
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <Field label="Titolo">
            <Input value={renameText} onChange={e => setRenameText(e.target.value)} autoFocus />
          </Field>
          <Field label="Descrizione per il cliente" hint="Cosa succede in questa fase — visibile nella card del dossier.">
            <Textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={4} placeholder="Es. Progettazione UI delle schermate principali e revisione con il cliente…" style={{ resize: "vertical" }} />
          </Field>
          <Field label={`Avanzamento — ${editProgress}%`} hint="Regola la barra di progresso che il cliente vede su questa fase.">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <input
                type="range" min={0} max={100} step={5}
                value={editProgress}
                onChange={e => setEditProgress(Number(e.target.value))}
                className="portal-range"
                style={{ flex: 1 }}
              />
              <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: T.copperLt, minWidth: 44, textAlign: "right" }}>
                {editProgress}%
              </span>
            </div>
          </Field>
          {renaming?.status === "done" && (
            <Note tone="silver">La fase è chiusa: il cliente la vede comunque al 100%.</Note>
          )}
        </div>
      </Modal>

      {/* Delete stage confirm */}
      <Modal
        open={!!deleting}
        onClose={() => !opBusy && setDeleting(null)}
        kicker="Fasi"
        title={deleting ? `Elimini «${deleting.title}»?` : ""}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setDeleting(null)} disabled={opBusy}>Annulla</Btn>
            <Btn variant="danger" icon="trash" busy={opBusy}
              onClick={() => deleting && stageOp(() => deleteStage(deleting.id), "Fase eliminata", () => setDeleting(null))}>
              Elimina
            </Btn>
          </>
        }
      >
        <p style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: T.muted, margin: 0 }}>
          La fase è ancora in coda e non è mai partita: eliminarla non tocca il lavoro fatto.
        </p>
      </Modal>

      {/* Stage discussion */}
      <Modal
        open={!!chatStage}
        onClose={() => { setChatStage(null); setChatConvo(null) }}
        kicker="Discussione fase"
        title={chatStage?.title ?? ""}
        width={680}
      >
        {chatConvo
          ? <ChatThread conversation={chatConvo} role="admin" authorId={adminId} height={440} onChanged={reload} />
          : <Loading label="Apro la discussione" />}
      </Modal>
    </div>
  )
}
