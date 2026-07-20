import React, { useCallback, useEffect, useState } from "react"
import { useBlueprint } from "../../context/BlueprintContext"
import { useToast } from "../../context/ToastContext"
import type { ClientHome, Conversation, Invoice, Meeting, ProjectCredential, ProjectEvent, ProjectStage } from "../../lib/api"
import {
  approveStage, fetchCredentialsByProject, fetchInvoicesByProject, fetchMeetingsByProject, fetchProjectEvents,
  fetchProjectStages, fmtDate, fmtDateTime, fmtEur, getOrCreateStageConversation,
  isUnreadFor, requestStageChanges, subscribe,
} from "../../lib/api"
import ChatThread from "../ChatThread"
import HandoverPanel from "./HandoverPanel"
import ReferencesBoard from "../ReferencesBoard"
import StageGrid from "../StageGrid"
import { stageProgress } from "../StageRail"
import {
  Badge, BriefCard, Btn, DISPLAY, Empty, Field, Glass, Icon, INVOICE_STATUS, Loading, MEETING_STATUS,
  Modal, MONO, Note, PROJECT_STATUS, Ring, Row, T, TL, Tabs, Textarea, Timeline, TONE,
} from "../ui"

type TabId = "fasi" | "diario" | "riferimenti" | "fatture" | "riunioni" | "consegna"

/** Top-of-view project switcher — pill tabs when the client has >1 project,
 *  plus a persistent "Nuovo progetto" affordance. */
function ProjectSwitcher({ projects, currentId, onSwitch, onNew }: {
  projects: ClientHome["projects"]
  currentId: string
  onSwitch: (id: string) => void
  onNew: () => void
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
      {projects.length > 1 ? (
        <div
          role="tablist"
          aria-label="Seleziona progetto"
          style={{
            display: "flex", gap: 4, padding: 4, borderRadius: 14, maxWidth: "100%",
            overflowX: "auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.17)",
          }}
        >
          {projects.map(p => {
            const active = p.id === currentId
            const ps = PROJECT_STATUS[p.status]
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={active}
                onClick={() => onSwitch(p.id)}
                className={`portal-btn portal-pill ${active ? "is-active" : ""}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 15px", borderRadius: 10, border: "1px solid transparent",
                  background: active ? "rgba(255,255,255,0.14)" : "transparent",
                  borderColor: active ? "rgba(255,255,255,0.20)" : "transparent",
                  boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.28), 0 1px 3px rgba(0,0,0,0.18)" : "none",
                  color: active ? TL.text : TL.muted,
                  fontFamily: DISPLAY, fontSize: 14, fontWeight: active ? 700 : 500, whiteSpace: "nowrap", maxWidth: 240,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 99, background: TONE[ps.tone].fg, flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: TL.ghost }}>
          Dossier progetto
        </span>
      )}
      <Btn variant="outline" size="sm" icon="plus" onClick={onNew}>Nuovo progetto</Btn>
    </div>
  )
}

export default function Dossier({ projectId, home, userId, onSwitchProject, onNewProject, reload }: {
  projectId: string
  home: ClientHome
  userId: string
  onSwitchProject: (id: string) => void
  onNewProject: () => void
  reload: () => void
}) {
  const toast = useToast()
  const { items: foundryItems } = useBlueprint()
  const project = home.projects.find(p => p.id === projectId)

  const [tab, setTab] = useState<TabId>("fasi")
  const [stages, setStages] = useState<ProjectStage[]>([])
  const [events, setEvents] = useState<ProjectEvent[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [creds, setCreds] = useState<ProjectCredential[]>([])
  const [loading, setLoading] = useState(true)

  const [approving, setApproving] = useState<ProjectStage | null>(null)
  const [approveBusy, setApproveBusy] = useState(false)

  const [changesFor, setChangesFor] = useState<ProjectStage | null>(null)
  const [changeNote, setChangeNote] = useState("")
  const [changeBusy, setChangeBusy] = useState(false)

  const [chatStage, setChatStage] = useState<ProjectStage | null>(null)
  const [chatConvo, setChatConvo] = useState<Conversation | null>(null)

  const load = useCallback(async () => {
    try {
      const [s, e, i, m, c] = await Promise.all([
        fetchProjectStages(projectId),
        fetchProjectEvents(projectId),
        fetchInvoicesByProject(projectId),
        fetchMeetingsByProject(projectId),
        fetchCredentialsByProject(projectId),
      ])
      setStages(s); setEvents(e); setInvoices(i); setMeetings(m); setCreds(c)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    setLoading(true)
    load()
    const un1 = subscribe(`dossier-ev-${projectId}`, { table: "project_events", filter: `project_id=eq.${projectId}` }, load)
    const un2 = subscribe(`dossier-st-${projectId}`, { table: "project_stages", filter: `project_id=eq.${projectId}` }, load)
    const un3 = subscribe(`dossier-cr-${projectId}`, { table: "project_credentials", filter: `project_id=eq.${projectId}` }, load)
    return () => { un1(); un2(); un3() }
  }, [projectId, load])

  if (!project) {
    return (
      <Glass variant="panel" style={{ padding: 20 }}>
        <Empty icon="folder" title="Progetto non trovato" action={<Btn variant="primary" icon="plus" onClick={onNewProject}>Nuovo progetto</Btn>} />
      </Glass>
    )
  }

  const st = PROJECT_STATUS[project.status]
  const progress = stageProgress(stages)
  const dueInvoices = invoices.filter(i => i.status === "sent" || i.status === "overdue")

  async function confirmApprove() {
    if (!approving || approveBusy) return
    setApproveBusy(true)
    try {
      await approveStage(approving.id)
      setApproving(null)
      toast.success("Fase approvata — si procede")
      await load()
      reload()
    } catch {
      toast.error("Approvazione non riuscita. Riprova.")
    } finally {
      setApproveBusy(false)
    }
  }

  async function confirmRequestChanges() {
    if (!changesFor || changeBusy || !changeNote.trim()) return
    setChangeBusy(true)
    try {
      await requestStageChanges(changesFor.id, changeNote.trim())
      setChangesFor(null)
      setChangeNote("")
      toast.success("Richiesta inviata allo studio")
      await load()
      reload()
    } catch {
      toast.error("Invio non riuscito. Riprova.")
    } finally {
      setChangeBusy(false)
    }
  }

  async function openStageChat(s: ProjectStage) {
    setChatStage(s)
    setChatConvo(null)
    try {
      const convo = await getOrCreateStageConversation({
        projectId, stageId: s.id, clientId: userId,
        subject: `${project!.name} — ${s.title}`,
      })
      setChatConvo(convo)
    } catch {
      setChatStage(null)
      toast.error("Impossibile aprire la discussione.")
    }
  }

  function stageUnread(s: ProjectStage): boolean {
    const c = home.threads.find(t => t.stageId === s.id)
    return !!c && isUnreadFor(c, "client")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <ProjectSwitcher
        projects={home.projects}
        currentId={project.id}
        onSwitch={onSwitchProject}
        onNew={onNewProject}
      />

      {/* Header */}
      <Glass variant="panel" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>
                {project.name}
              </h2>
              <Badge tone={st.tone} dot>{st.label}</Badge>
            </div>
            {project.description && (
              <p style={{ fontFamily: DISPLAY, fontSize: 14.5, lineHeight: 1.65, color: T.faint, margin: "10px 0 0", maxWidth: 640, whiteSpace: "pre-wrap" }}>
                {project.description}
              </p>
            )}
            <p style={{ fontFamily: MONO, fontSize: 10.5, color: T.ghost, margin: "12px 0 0", letterSpacing: "0.05em" }}>
              Avviato {fmtDate(project.createdAt)}
            </p>
          </div>
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
        {project.status === "pending_approval" && (
          <div style={{ marginTop: 14 }}>
            <Note tone="amber">Progetto in valutazione: stiamo definendo il piano in fasi. Ti avvisiamo appena è attivo.</Note>
          </div>
        )}
        {project.adminNote && (
          <div style={{ marginTop: 14 }}>
            <Note tone="silver"><strong>Nota dello studio:</strong> {project.adminNote}</Note>
          </div>
        )}
      </Glass>

      {(project.brief?.projectType || project.brief?.budgetRange || project.brief?.deadline || project.brief?.references) && (
        <BriefCard brief={project.brief} />
      )}

      <Tabs<TabId>
        items={[
          { id: "fasi", label: "Fasi", badge: stages.filter(s => s.approvalState === "requested").length || undefined },
          { id: "diario", label: "Diario" },
          { id: "riferimenti", label: "Riferimenti" },
          { id: "fatture", label: "Fatture", badge: dueInvoices.length || undefined },
          { id: "riunioni", label: "Riunioni" },
          ...(creds.length > 0 || project.status === "completed"
            ? [{ id: "consegna" as const, label: "Consegna", badge: creds.length || undefined }]
            : []),
        ]}
        value={tab}
        onChange={setTab}
      />

      {loading ? (
        <Glass variant="panel" style={{ padding: 20 }}><Loading label="Apro il dossier" /></Glass>
      ) : (
        <>
          {tab === "fasi" && (
            stages.length === 0 ? (
              <Glass variant="panel" style={{ padding: 22 }}>
                <Empty icon="layers" title="Fasi in definizione" hint="Il piano di lavoro apparirà qui appena il progetto è attivo." />
              </Glass>
            ) : (
              <StageGrid
                  stages={stages}
                  renderAction={s => {
                    if (s.status === "locked") return null
                    const chatBtn = (
                      <span style={{ position: "relative", display: "inline-flex" }}>
                        <Btn size="sm" variant="ghost" icon="chat" onClick={() => openStageChat(s)}>Discussione</Btn>
                        {stageUnread(s) && (
                          <span style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: 99, background: T.copperLt, boxShadow: "0 0 8px rgba(184,50,64,0.85)" }} />
                        )}
                      </span>
                    )
                    if (s.approvalState === "requested") {
                      return (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <Btn size="sm" variant="primary" icon="check" onClick={() => setApproving(s)}>Approva fase</Btn>
                          <Btn size="sm" variant="outline" icon="edit" onClick={() => { setChangeNote(""); setChangesFor(s) }}>Richiedi modifiche</Btn>
                          {chatBtn}
                        </div>
                      )
                    }
                    if (s.approvalState === "changes_requested") {
                      return (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: DISPLAY, fontSize: 12, color: T.amber }}>
                            <Icon name="clock" size={13} /> Modifiche richieste — in attesa dello studio
                          </span>
                          {chatBtn}
                        </div>
                      )
                    }
                    if (!stageUnread(s)) {
                      return <Btn size="sm" variant="ghost" icon="chat" onClick={() => openStageChat(s)}>Discussione</Btn>
                    }
                    return <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{chatBtn}</div>
                  }}
                />
              )
            )}

          {tab === "diario" && (
            <Glass variant="panel" style={{ padding: 22 }}>
              {events.length === 0
                ? <Empty icon="sparkle" title="Diario vuoto" hint="Ogni avanzamento del progetto viene registrato qui." />
                : <Timeline events={events} />}
            </Glass>
          )}

          {tab === "riferimenti" && (
            <Glass variant="panel" style={{ padding: 22 }}>
              <ReferencesBoard projectId={projectId} clientId={userId} role="client" foundryItems={foundryItems} />
            </Glass>
          )}

          {tab === "fatture" && (
            <Glass variant="panel" style={{ padding: 22 }}>
              {invoices.length === 0 ? (
                <Empty icon="invoice" title="Nessuna fattura" hint="Le fatture legate a questo progetto appariranno qui." />
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
                <Empty icon="calendar" title="Nessuna riunione" hint="Proponi una riunione dalla sezione Riunioni." />
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
                        sub={`${m.durationMin} min · propost${m.proposedBy === "admin" ? "a dallo studio" : "a da te"}${m.adminNote ? ` · ${m.adminNote}` : ""}`}
                        right={<Badge tone={ms.tone} dot>{ms.label}</Badge>}
                      />
                    )
                  })}
                </div>
              )}
            </Glass>
          )}

          {tab === "consegna" && (
            <Glass variant="panel" style={{ padding: 22 }}>
              <HandoverPanel credentials={creds} completed={project.status === "completed"} />
            </Glass>
          )}
        </>
      )}

      {/* Approve confirm */}
      <Modal
        open={!!approving}
        onClose={() => !approveBusy && setApproving(null)}
        kicker="Approvazione"
        title={approving ? `Approvi «${approving.title}»?` : ""}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setApproving(null)} disabled={approveBusy}>Annulla</Btn>
            <Btn variant="primary" icon="check" onClick={confirmApprove} busy={approveBusy}>Approva</Btn>
          </>
        }
      >
        <p style={{ fontFamily: DISPLAY, fontSize: 13, lineHeight: 1.6, color: T.muted, margin: 0 }}>
          Confermando dai il via libera su questa fase: verrà chiusa e il lavoro passa alla successiva.
          Se hai dubbi, usa prima la discussione della fase.
        </p>
      </Modal>

      {/* Request changes */}
      <Modal
        open={!!changesFor}
        onClose={() => !changeBusy && setChangesFor(null)}
        kicker="Revisione"
        title={changesFor ? `Richiedi modifiche · ${changesFor.title}` : ""}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setChangesFor(null)} disabled={changeBusy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={confirmRequestChanges} busy={changeBusy} disabled={!changeNote.trim()}>Invia richiesta</Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Note tone="amber">Descrivi cosa vuoi cambiare: lo studio riceve la richiesta e ti ripropone la fase aggiornata.</Note>
          <Field label="Cosa modificare">
            <Textarea value={changeNote} onChange={e => setChangeNote(e.target.value)} rows={4} autoFocus placeholder="Es. La sezione hero troppo scura, il font del titolo più grande…" style={{ resize: "vertical" }} />
          </Field>
        </div>
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
          ? <ChatThread conversation={chatConvo} role="client" authorId={userId} height={440} onChanged={reload} />
          : <Loading label="Apro la discussione" />}
      </Modal>
    </div>
  )
}
