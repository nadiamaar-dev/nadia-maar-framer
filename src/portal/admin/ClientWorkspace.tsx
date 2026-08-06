import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import { telNormalize, waFor } from "../../lib/contact"
import { STUDIO_READY } from "../../lib/studio"
import type {
  AdminHome, AdminProject, ClientAsset, ClientDocument, ClientPlan, ClientRecord, ClientStatus,
  Conversation, DocType, Invoice, InvoiceStatus, Meeting, ProjectStatus,
} from "../../lib/api"
import {
  createConversation, createInvoice, createProject, deleteDocument, fetchAssets,
  fetchClientEvents, fetchDocuments, fmtBytes, fmtDate, fmtDateTime, fmtEur, getAssetSignedUrl,
  getDocumentDownloadUrl, getInvoicePdfUrl, isUnreadFor, nextInvoiceNumber, proposeMeeting,
  relativeDate, setClientArchived, updateClientProfile, updateInvoiceStatus, updateMeetingStatus,
  uploadDocument,
} from "../../lib/api"
import type { ProjectEvent } from "../../lib/api"
import ChatThread from "../ChatThread"
import Scheduler from "../Scheduler"
import {
  Avatar, Badge, Btn, CLIENT_PLAN, CLIENT_STATUS, Collapsible, ConfirmDialog, CONVO_STATUS,
  DISPLAY, Empty, Field, FileBtn, Glass, Icon, Input, INVOICE_STATUS, Loading, MEETING_STATUS,
  Modal, MONO, Note, Row, SectionTitle, Select, T, Tabs, Textarea,
  TICKET_PRIORITY, TICKET_STATUS,
} from "../ui"
import { CardGrid, ProjectCard } from "./cards"
import { clientLens } from "./clientLens"

/* ══════════════════════════════════════════════════════════════════════════
   SCHEDA CLIENTE — il posto da cui si lavora con una persona sola.

   Prima era una vetrina: mostrava progetti, fatture e documenti, ma per
   fissare una riunione bisognava andare in Agenda e ritrovare il cliente in
   una tendina, per rispondergli in Inbox e ritrovarlo in un elenco, per
   aprirgli un progetto… non si poteva affatto. Ogni salto costava il
   contesto, ed è così che si finisce per fatturare al cliente sbagliato.

   Qui dentro tutto è già filtrato su di lui. Non c'è un solo menù a tendina
   in cui si possa scegliere la persona sbagliata, perché la persona è già
   scelta: è il titolo della pagina.
══════════════════════════════════════════════════════════════════════════ */

type TabId = "panoramica" | "progetti" | "richieste" | "fatture" | "riunioni" | "documenti"

const DOC_TYPES: Record<DocType, string> = {
  report: "Report", contract: "Contratto", invoice: "Fattura", handover: "Consegna", other: "Altro",
}

export default function ClientWorkspace({ client, home, adminId, onBack, reload, onOpenProject }: {
  client: ClientRecord
  home: AdminHome
  adminId: string
  onBack: () => void
  reload: () => void
  onOpenProject: (id: string) => void
}) {
  const toast = useToast()
  const [tab, setTab] = useState<TabId>("panoramica")
  const lens = useMemo(() => clientLens(home, client.id), [home, client.id])
  const archived = client.status === "archived"

  /* Il cambio cliente azzera tutto: senza, si aprirebbe la scheda del nuovo
     con la conversazione del precedente ancora selezionata. */
  useEffect(() => { setTab("panoramica") }, [client.id])

  /* ── Profilo ── */
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ company: "", contact: "", phone: "", plan: "starter" as ClientPlan, status: "active" as ClientStatus })
  const [editBusy, setEditBusy] = useState(false)

  function openEdit() {
    setForm({ company: client.company, contact: client.contact, phone: client.phone ?? "", plan: client.plan, status: client.status })
    setEditOpen(true)
  }

  async function saveEdit() {
    if (editBusy) return
    setEditBusy(true)
    try {
      await updateClientProfile(client.id, {
        company: form.company.trim(), contact: form.contact.trim(),
        phone: form.phone.trim(), plan: form.plan, status: form.status,
      })
      setEditOpen(false)
      toast.success("Profilo aggiornato")
      reload()
    } catch {
      toast.error("Salvataggio non riuscito.")
    } finally {
      setEditBusy(false)
    }
  }

  /* ── Archivio ──
     Non cancella niente e non toglie l'accesso: il cliente continua a vedere
     il suo portale, le sue fatture e i suoi documenti. Cambia solo dove sta
     la sua scheda per noi. */
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveBusy, setArchiveBusy] = useState(false)

  async function toggleArchive() {
    if (archiveBusy) return
    setArchiveBusy(true)
    try {
      await setClientArchived(client.id, !archived)
      setArchiveOpen(false)
      toast.success(archived ? `${client.company} è di nuovo un cliente attivo` : `${client.company} archiviato`)
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    } finally {
      setArchiveBusy(false)
    }
  }

  /* ── Nuovo progetto ──
     È la seconda metà dell'archivio: si chiude un rapporto sapendo di poterlo
     riaprire con un click, e riaprirlo riattiva anche la scheda. */
  const [projOpen, setProjOpen] = useState(false)
  const [proj, setProj] = useState({ name: "", description: "", status: "active" as ProjectStatus })
  const [projBusy, setProjBusy] = useState(false)

  async function saveProject() {
    if (!proj.name.trim() || projBusy) return
    setProjBusy(true)
    try {
      /* Le fasi non si creano da qui. Un trigger sul database le semina
         quando il progetto diventa attivo — le stesse sei di ogni progetto,
         una volta sola anche se lo stato cambia più volte. Farne un secondo
         elenco lato interfaccia significherebbe due liste destinate a
         divergere, e un progetto con le fasi in doppio. */
      const created = await createProject({
        clientId: client.id,
        name: proj.name,
        description: proj.description,
        status: proj.status,
      })
      if (archived) await setClientArchived(client.id, false)
      setProjOpen(false)
      setProj({ name: "", description: "", status: "active" })
      toast.success(archived ? "Progetto aperto — cliente riattivato" : `Progetto «${created.name}» aperto`)
      reload()
      onOpenProject(created.id)
    } catch {
      toast.error("Creazione non riuscita.")
    } finally {
      setProjBusy(false)
    }
  }

  /* ── Fatture ── */
  const [invOpen, setInvOpen] = useState(false)
  const [inv, setInv] = useState({ number: "", description: "", amount: "", dueDate: "", projectId: "", status: "sent" as InvoiceStatus })
  const [invBusy, setInvBusy] = useState(false)
  const [actingInv, setActingInv] = useState<string | null>(null)
  const [avvisoFor, setAvvisoFor] = useState<string | null>(null)

  function openInvoice() {
    setInv({ number: nextInvoiceNumber(home.invoices), description: "", amount: "", dueDate: "", projectId: "", status: "sent" })
    setInvOpen(true)
  }

  async function saveInvoice() {
    const amount = Number(inv.amount.replace(",", "."))
    if (!inv.number.trim() || !inv.description.trim() || !Number.isFinite(amount) || amount <= 0 || invBusy) return
    setInvBusy(true)
    try {
      await createInvoice({
        clientId: client.id,
        projectId: inv.projectId || undefined,
        number: inv.number, description: inv.description, amount,
        status: inv.status, dueDate: inv.dueDate || undefined,
      })
      setInvOpen(false)
      toast.success(`Fattura ${inv.number} emessa`)
      reload()
    } catch {
      toast.error("Emissione non riuscita.")
    } finally {
      setInvBusy(false)
    }
  }

  async function setInvoice(id: string, status: InvoiceStatus, msg: string) {
    setActingInv(id)
    try {
      await updateInvoiceStatus(id, status)
      toast.success(msg)
      reload()
    } catch {
      toast.error("Aggiornamento non riuscito.")
    } finally {
      setActingInv(null)
    }
  }

  async function avviso(invoice: Invoice) {
    if (avvisoFor) return
    setAvvisoFor(invoice.id)
    try {
      const { downloadInvoicePdf } = await import("../../lib/pdf/invoice")
      await downloadInvoicePdf(invoice, { name: client.company || client.contact, email: client.email })
    } catch {
      toast.error("Generazione non riuscita.")
    } finally {
      setAvvisoFor(null)
    }
  }

  /* ── Riunioni ── */
  const [meetOpen, setMeetOpen] = useState(false)
  const [slot, setSlot] = useState<string | null>(null)
  const [meetProject, setMeetProject] = useState("")
  const [meetNote, setMeetNote] = useState("")
  const [meetBusy, setMeetBusy] = useState(false)
  const [actingMeet, setActingMeet] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  async function saveMeeting() {
    if (!slot || meetBusy) return
    setMeetBusy(true)
    try {
      await proposeMeeting({
        clientId: client.id, proposedBy: "admin", datetime: slot,
        note: meetNote.trim() || undefined, projectId: meetProject || undefined,
      })
      setMeetOpen(false); setSlot(null); setMeetProject(""); setMeetNote("")
      setRefreshKey(k => k + 1)
      toast.success("Proposta inviata al cliente")
      reload()
    } catch {
      toast.error("Invio non riuscito.")
    } finally {
      setMeetBusy(false)
    }
  }

  async function actMeeting(m: Meeting, status: "confirmed" | "cancelled") {
    if (actingMeet) return
    setActingMeet(m.id)
    try {
      await updateMeetingStatus(m.id, status)
      toast.success(status === "confirmed" ? "Riunione confermata" : "Riunione annullata")
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    } finally {
      setActingMeet(null)
    }
  }

  /* ── Documenti condivisi e materiali ricevuti ──
     Due direzioni della stessa cosa, quindi una scheda sola: quello che
     mando io e quello che mi manda lui. Separati, si finiva per cercare un
     file nella metà sbagliata. */
  const [docs, setDocs] = useState<ClientDocument[] | null>(null)
  const [assets, setAssets] = useState<ClientAsset[] | null>(null)
  const [docType, setDocType] = useState<DocType>("report")
  const [docProjectId, setDocProjectId] = useState("")
  const [docRequiresSig, setDocRequiresSig] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState<ClientDocument | null>(null)

  const loadDocs = useCallback(async () => {
    try { setDocs(await fetchDocuments(client.id)) } catch { setDocs([]) }
  }, [client.id])
  const loadAssets = useCallback(async () => {
    try { setAssets(await fetchAssets(client.id)) } catch { setAssets([]) }
  }, [client.id])

  /* il cliente è cambiato: i file del precedente non devono restare a schermo */
  useEffect(() => { setDocs(null); setAssets(null); setDocProjectId("") }, [client.id])
  useEffect(() => {
    if (tab !== "documenti") return
    if (docs === null) loadDocs()
    if (assets === null) loadAssets()
  }, [tab, docs, assets, loadDocs, loadAssets])

  async function handleUpload(files: File[]) {
    if (!files.length) return
    setUploading(true)
    try {
      for (const f of files) {
        await uploadDocument(client.id, f, docType, {
          projectId: docProjectId || undefined,
          requiresSignature: docRequiresSig,
        })
      }
      toast.success(docRequiresSig ? "Documento inviato — il cliente deve firmarlo" : "Documento caricato")
      setDocRequiresSig(false)
      loadDocs()
    } catch {
      toast.error("Caricamento non riuscito.")
    } finally {
      setUploading(false)
    }
  }

  async function removeDoc() {
    if (!removing) return
    try {
      await deleteDocument(removing)
      toast.info("Documento eliminato")
      loadDocs()
    } catch {
      toast.error("Eliminazione non riuscita.")
    } finally {
      setRemoving(null)
    }
  }

  async function openAsset(a: ClientAsset) {
    const url = await getAssetSignedUrl(a)
    if (url) window.open(url, "_blank", "noopener")
    else toast.error("Link non disponibile.")
  }

  /* ── Richieste e messaggi ── */
  const [threadId, setThreadId] = useState<string | null>(null)
  const [convOpen, setConvOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [convBusy, setConvBusy] = useState(false)

  useEffect(() => { setThreadId(null) }, [client.id])

  const sortedThreads = useMemo(() => [...lens.threads].sort((a, b) => {
    const ua = isUnreadFor(a, "admin") ? 0 : 1
    const ub = isUnreadFor(b, "admin") ? 0 : 1
    if (ua !== ub) return ua - ub
    if (a.status === "closed" && b.status !== "closed") return 1
    if (b.status === "closed" && a.status !== "closed") return -1
    return b.lastMessageAt.localeCompare(a.lastMessageAt)
  }), [lens.threads])
  const thread: Conversation | null = sortedThreads.find(c => c.id === threadId) ?? null
  const ticketOf = (c: Conversation) => c.ticketId ? lens.tickets.find(t => t.id === c.ticketId) : undefined

  async function newConversation() {
    if (!subject.trim() || convBusy) return
    setConvBusy(true)
    try {
      const c = await createConversation({ clientId: client.id, subject })
      setConvOpen(false)
      setSubject("")
      setTab("richieste")
      setThreadId(c.id)
      reload()
    } catch {
      toast.error("Creazione non riuscita.")
    } finally {
      setConvBusy(false)
    }
  }

  /* ── Diario del cliente ──
     `home.events` è il giornale globale troncato: per un cliente con poco
     movimento non ci sarebbe dentro niente. Qui si chiede il suo. */
  const [events, setEvents] = useState<ProjectEvent[] | null>(null)
  useEffect(() => {
    let alive = true
    setEvents(null)
    fetchClientEvents(client.id, 40).then(e => { if (alive) setEvents(e) }).catch(() => { if (alive) setEvents([]) })
    return () => { alive = false }
  }, [client.id])

  const projectName = (id?: string) => lens.projects.find(p => p.id === id)?.name
  const tel = telNormalize(client.phone)
  const wa = waFor(client.phone, `Ciao ${client.contact !== "—" ? client.contact : client.company}!`)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ── Intestazione ── */}
      <Glass variant="panel" style={{ padding: 22 }}>
        <button
          onClick={onBack}
          className="portal-link"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none",
            padding: 0, marginBottom: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.11em",
            textTransform: "uppercase", color: T.secondary, cursor: "pointer",
          }}
        >
          <Icon name="arrowL" size={11} /> Tutti i clienti
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <Avatar name={client.company} size={48} tone={archived ? "steel" : "copper"} textColor="#FFFFFF" />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>
                {client.company}
              </h2>
              <Badge tone={CLIENT_STATUS[client.status].tone} dot>{CLIENT_STATUS[client.status].label}</Badge>
              <Badge tone={CLIENT_PLAN[client.plan].tone}>{CLIENT_PLAN[client.plan].label}</Badge>
            </div>
            <p style={{ fontFamily: DISPLAY, fontSize: 14, color: T.secondary, margin: "7px 0 0" }}>
              {client.contact}{client.joinedAt ? ` · cliente dal ${fmtDate(client.joinedAt)}` : ""}
            </p>

            {/* I recapiti come canali, non come testo da ricopiare a mano. */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 11 }}>
              <ContactChip href={`mailto:${client.email}`} icon="mail" label={client.email} />
              {tel && <ContactChip href={`tel:${tel}`} icon="phone" label={client.phone!} />}
              {wa && <ContactChip href={wa} icon="chat" label="WhatsApp" external />}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="primary" icon="plus" onClick={() => setProjOpen(true)}>Nuovo progetto</Btn>
            <Btn variant="copper" icon="chat" onClick={() => setConvOpen(true)}>Scrivi</Btn>
            <Btn variant="outline" icon="edit" onClick={openEdit}>Profilo</Btn>
            <Btn variant={archived ? "ghost" : "outline"} icon={archived ? "play" : "archive"} onClick={() => setArchiveOpen(true)}>
              {archived ? "Riattiva" : "Archivia"}
            </Btn>
          </div>
        </div>

        {archived && (
          <div style={{ marginTop: 16 }}>
            <Note tone="steel">
              Rapporto archiviato. Il cliente vede ancora il suo portale, le sue fatture e i suoi documenti:
              qui cambia solo che la scheda esce dagli elenchi di lavoro. Aprire un progetto lo riattiva.
            </Note>
          </div>
        )}
      </Glass>

      <Tabs<TabId>
        value={tab}
        onChange={setTab}
        items={[
          { id: "panoramica", label: "Panoramica", badge: lens.todo || undefined },
          { id: "progetti", label: "Progetti", badge: lens.pendingProjects || undefined },
          { id: "richieste", label: "Richieste", badge: (lens.unread + lens.openTickets) || undefined },
          { id: "fatture", label: "Fatture", badge: (lens.declaredInvoices + lens.overdueInvoices) || undefined },
          { id: "riunioni", label: "Riunioni", badge: lens.pendingMeetings || undefined },
          { id: "documenti", label: "Documenti" },
        ]}
      />

      {/* ══ PANORAMICA ══ */}
      {tab === "panoramica" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 100%), 1fr))", gap: 12 }}>
            <MiniCard label="Progetti in corso" value={String(lens.running.length)} icon="layers" onClick={() => setTab("progetti")} />
            {/* sempre in euro, anche a zero: accanto a «Incassato 0 €» un
                trattino sembra un dato mancante invece di un conto in pari */}
            <MiniCard label="Da incassare" value={fmtEur(lens.dueAmount)} icon="euro"
              warn={lens.dueAmount > 0} onClick={() => setTab("fatture")} />
            <MiniCard label="Richieste aperte" value={String(lens.openTickets)} icon="ticket"
              warn={lens.openTickets > 0} onClick={() => setTab("richieste")} />
            <MiniCard label="Incassato" value={fmtEur(lens.paidAmount)} icon="checkCircle" onClick={() => setTab("fatture")} />
          </div>

          <Glass variant="panel" style={{ padding: 20 }}>
            <SectionTitle kicker="Con questo cliente" title="Cosa aspetta te"
              sub={lens.todo === 0 ? "Niente in sospeso." : undefined} />
            {lens.todo === 0 ? (
              <div style={{ marginTop: 14 }}>
                <Empty icon="checkCircle" title="Tutto in pari" hint="Nessuna richiesta in attesa da parte sua." />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 14 }}>
                {lens.pendingProjects > 0 && (
                  <Row icon="folder" iconTone="amber" title={`${lens.pendingProjects} progett${lens.pendingProjects === 1 ? "o" : "i"} da valutare`}
                    sub="Il cliente ha inviato un brief e aspetta una risposta"
                    right={<Icon name="chevronR" size={13} />} onClick={() => setTab("progetti")} />
                )}
                {lens.unread > 0 && (
                  <Row icon="chat" iconTone="copper" title={`${lens.unread} conversazion${lens.unread === 1 ? "e" : "i"} da leggere`}
                    sub="Messaggi arrivati dopo la tua ultima apertura"
                    right={<Icon name="chevronR" size={13} />} onClick={() => setTab("richieste")} />
                )}
                {lens.openTickets > 0 && (
                  <Row icon="ticket" iconTone="red" title={`${lens.openTickets} richiest${lens.openTickets === 1 ? "a aperta" : "e aperte"}`}
                    sub="Lavoro chiesto e non ancora chiuso"
                    right={<Icon name="chevronR" size={13} />} onClick={() => setTab("richieste")} />
                )}
                {lens.pendingMeetings > 0 && (
                  <Row icon="calendar" iconTone="amber" title={`${lens.pendingMeetings} riunion${lens.pendingMeetings === 1 ? "e" : "i"} da confermare`}
                    sub="Slot proposti dal cliente"
                    right={<Icon name="chevronR" size={13} />} onClick={() => setTab("riunioni")} />
                )}
                {lens.declaredInvoices > 0 && (
                  <Row icon="euro" iconTone="copper" title={`${lens.declaredInvoices} pagament${lens.declaredInvoices === 1 ? "o dichiarato" : "i dichiarati"}`}
                    sub="Il cliente dice di aver pagato: conferma l'incasso"
                    right={<Icon name="chevronR" size={13} />} onClick={() => setTab("fatture")} />
                )}
                {lens.overdueInvoices > 0 && (
                  <Row icon="warn" iconTone="red" title={`${lens.overdueInvoices} fattur${lens.overdueInvoices === 1 ? "a scaduta" : "e scadute"}`}
                    sub="Oltre la data di scadenza"
                    right={<Icon name="chevronR" size={13} />} onClick={() => setTab("fatture")} />
                )}
              </div>
            )}
          </Glass>

          <Glass variant="panel" style={{ padding: 20 }}>
            <Collapsible
              kicker="Diario"
              title="Storico del cliente"
              sub={events === null ? "Carico…" : events.length === 0 ? "Nessuna attività" : `${events.length} eventi registrati`}
              storageKey="nm-adm-cliente-diario"
            >
              {events === null ? <Loading label="Apro il diario" />
                : events.length === 0 ? <Empty icon="sparkle" title="Nessuna attività" hint="Qui scorre tutto ciò che è successo con questo cliente." />
                : <ClientTimeline events={events} />}
            </Collapsible>
          </Glass>
        </div>
      )}

      {/* ══ PROGETTI ══ */}
      {tab === "progetti" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn variant="primary" icon="plus" onClick={() => setProjOpen(true)}>Nuovo progetto</Btn>
          </div>
          {lens.projects.length === 0 ? (
            <Glass variant="panel" style={{ padding: 20 }}>
              <Empty icon="folder" title="Nessun progetto"
                hint="Apri il primo progetto per questo cliente: le fasi standard nascono con lui."
                action={<Btn variant="primary" icon="plus" onClick={() => setProjOpen(true)}>Nuovo progetto</Btn>} />
            </Glass>
          ) : (
            <CardGrid>
              {lens.projects.map((p: AdminProject) => (
                <ProjectCard
                  key={p.id}
                  p={p}
                  showClient={false}
                  unread={home.threads.filter(c => c.projectId === p.id && isUnreadFor(c, "admin")).length}
                  onOpen={() => onOpenProject(p.id)}
                />
              ))}
            </CardGrid>
          )}
        </div>
      )}

      {/* ══ RICHIESTE ══ */}
      {tab === "richieste" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 16, alignItems: "start" }}>
          <Glass variant="work" style={{ padding: 12, maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <Btn size="sm" variant="copper" icon="plus" onClick={() => setConvOpen(true)}>Nuova</Btn>
            </div>
            {sortedThreads.length === 0 ? (
              <Empty icon="chat" title="Nessuna conversazione" hint="Apri tu il filo, oppure aspetta che scriva lui." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 560, overflowY: "auto" }}>
                {sortedThreads.map(c => {
                  const t = ticketOf(c)
                  const unread = isUnreadFor(c, "admin")
                  const sel = c.id === threadId
                  return (
                    <button
                      key={c.id}
                      onClick={() => setThreadId(c.id)}
                      className={sel ? undefined : "portal-row"}
                      style={{
                        display: "flex", flexDirection: "column", gap: 6, textAlign: "left",
                        padding: "11px 13px", borderRadius: 11, cursor: "pointer",
                        background: sel ? "rgba(184,50,64,0.14)" : "transparent",
                        border: `1px solid ${sel ? "rgba(184,50,64,0.32)" : "transparent"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                        {unread && <span style={{ width: 7, height: 7, borderRadius: 99, background: T.copperLt, flexShrink: 0, boxShadow: "0 0 8px rgba(184,50,64,0.85)" }} />}
                        <span style={{ flex: 1, minWidth: 0, fontFamily: DISPLAY, fontSize: 14, fontWeight: unread ? 800 : 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.subject}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 11.5, color: T.secondary, flexShrink: 0 }}>{relativeDate(c.lastMessageAt)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {t ? (
                          <>
                            <Badge tone={TICKET_PRIORITY[t.priority].tone}>{TICKET_PRIORITY[t.priority].label}</Badge>
                            <Badge tone={TICKET_STATUS[t.status].tone} dot>{TICKET_STATUS[t.status].label}</Badge>
                            {t.estimateAcceptedAt && <Badge tone="green" dot>Preventivo approvato</Badge>}
                          </>
                        ) : (
                          <Badge tone={CONVO_STATUS[c.status].tone} dot>{CONVO_STATUS[c.status].label}</Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </Glass>
          <Glass variant="work" style={{ padding: 18 }}>
            {thread ? (
              <>
                {ticketOf(thread) && (
                  <div style={{ marginBottom: 14 }}>
                    <Note tone="copper">
                      È una richiesta di lavoro: stato, preventivo e sintesi si gestiscono in Inbox.
                    </Note>
                  </div>
                )}
                <ChatThread conversation={thread} role="admin" authorId={adminId} height={460} onChanged={reload} />
              </>
            ) : (
              <Empty icon="chat" title="Seleziona una conversazione" hint="I fili con messaggi non letti sono in cima." />
            )}
          </Glass>
        </div>
      )}

      {/* ══ FATTURE ══ */}
      {tab === "fatture" && (
        <Glass variant="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn variant="primary" icon="plus" onClick={openInvoice}>Nuova fattura</Btn>
          </div>
          {lens.invoices.length === 0 ? (
            <Empty icon="invoice" title="Nessuna fattura" hint="Emetti la prima fattura per questo cliente." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {lens.invoices.map(i => {
                const is = INVOICE_STATUS[i.status]
                const declared = !!i.clientMarkedPaidAt && i.status !== "paid"
                const pdfUrl = getInvoicePdfUrl(i)
                return (
                  <Row
                    key={i.id}
                    icon="invoice"
                    iconTone={declared ? "copper" : is.tone}
                    title={`${i.number} — ${i.description}`}
                    sub={[
                      `emessa ${fmtDate(i.issuedAt)}`,
                      i.dueDate ? `scade ${fmtDate(i.dueDate)}` : null,
                      projectName(i.projectId) ? `progetto: ${projectName(i.projectId)}` : null,
                      declared ? "il cliente dichiara di aver pagato" : null,
                    ].filter(Boolean).join(" · ")}
                    right={
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 9, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: T.text }}>{fmtEur(i.amount)}</span>
                        {declared ? <Badge tone="copper" dot>Da confermare</Badge> : <Badge tone={is.tone} dot>{is.label}</Badge>}
                        {i.status === "draft" && (
                          <Btn size="sm" variant="copper" icon="send" busy={actingInv === i.id} onClick={() => setInvoice(i.id, "sent", "Fattura inviata")}>Invia</Btn>
                        )}
                        {(i.status === "sent" || i.status === "overdue") && (
                          <Btn size="sm" variant={declared ? "primary" : "ghost"} icon="check" busy={actingInv === i.id} onClick={() => setInvoice(i.id, "paid", "Fattura incassata")}>
                            {declared ? "Conferma incasso" : "Incassata"}
                          </Btn>
                        )}
                        {STUDIO_READY && (
                          <Btn size="sm" variant="ghost" icon="download" busy={avvisoFor === i.id} onClick={() => avviso(i)} title="Genera l'avviso di pagamento">Avviso</Btn>
                        )}
                        {pdfUrl && (
                          <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex" }}>
                            <Btn size="sm" variant="ghost" icon="download">Fattura</Btn>
                          </a>
                        )}
                      </span>
                    }
                  />
                )
              })}
            </div>
          )}
        </Glass>
      )}

      {/* ══ RIUNIONI ══ */}
      {tab === "riunioni" && (
        <Glass variant="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn variant="primary" icon="plus" onClick={() => setMeetOpen(true)}>Proponi riunione</Btn>
          </div>
          {lens.meetings.length === 0 ? (
            <Empty icon="calendar" title="Nessuna riunione" hint="Proponi uno slot: il cliente lo conferma dal suo portale." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[...lens.meetings].sort((a, b) => b.datetime.localeCompare(a.datetime)).map(m => {
                const ms = MEETING_STATUS[m.status]
                const needsConfirm = m.status === "pending" && m.proposedBy === "client"
                return (
                  <Row
                    key={m.id}
                    icon="calendar"
                    iconTone={ms.tone}
                    title={fmtDateTime(m.datetime)}
                    sub={[
                      `${m.durationMin} min`,
                      m.proposedBy === "admin" ? "proposta dallo studio" : "richiesta dal cliente",
                      projectName(m.projectId) ? `progetto: ${projectName(m.projectId)}` : null,
                      m.clientNote || m.adminNote || null,
                    ].filter(Boolean).join(" · ")}
                    right={
                      needsConfirm ? (
                        <span style={{ display: "inline-flex", gap: 7 }} onClick={e => e.stopPropagation()}>
                          <Btn size="sm" variant="ghost" onClick={() => actMeeting(m, "cancelled")} busy={actingMeet === m.id}>Rifiuta</Btn>
                          <Btn size="sm" variant="primary" icon="check" onClick={() => actMeeting(m, "confirmed")} busy={actingMeet === m.id}>Conferma</Btn>
                        </span>
                      ) : m.status === "confirmed" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }} onClick={e => e.stopPropagation()}>
                          <Badge tone={ms.tone} dot>{ms.label}</Badge>
                          <Btn size="sm" variant="ghost" icon="x" onClick={() => actMeeting(m, "cancelled")} busy={actingMeet === m.id}>Annulla</Btn>
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
      )}

      {/* ══ DOCUMENTI ══ */}
      {tab === "documenti" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Glass variant="panel" style={{ padding: 20 }}>
            <SectionTitle kicker="Dallo studio" title="Condivisi con il cliente" />
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", margin: "14px 0" }}>
              <Select value={docType} onChange={e => setDocType(e.target.value as DocType)} style={{ width: 150 }}>
                {(Object.keys(DOC_TYPES) as DocType[]).map(t => <option key={t} value={t}>{DOC_TYPES[t]}</option>)}
              </Select>
              {lens.projects.length > 0 && (
                <Select value={docProjectId} onChange={e => setDocProjectId(e.target.value)} style={{ width: 190 }}
                  title="Collega il documento a un progetto: senza, non finisce nel diario del cliente">
                  <option value="">Nessun progetto</option>
                  {lens.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              )}
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: DISPLAY, fontSize: 14, color: T.secondary }}>
                <input type="checkbox" checked={docRequiresSig} onChange={e => setDocRequiresSig(e.target.checked)} style={{ accentColor: "#B83240", width: 16, height: 16 }} />
                Richiede firma
              </label>
              <FileBtn variant="primary" icon="plus" busy={uploading} onFiles={handleUpload}>Carica</FileBtn>
            </div>
            {docs === null ? (
              <Loading label="Apro i documenti" />
            ) : docs.length === 0 ? (
              <Empty icon="doc" title="Nessun documento" hint="Report, contratti e consegne condivisi con il cliente." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {docs.map(d => (
                  <Row
                    key={d.id}
                    icon="doc"
                    iconTone="silver"
                    title={d.name}
                    sub={[DOC_TYPES[d.type], fmtBytes(d.sizeBytes), fmtDate(d.uploadedAt), projectName(d.projectId)].filter(Boolean).join(" · ")}
                    right={
                      <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}>
                        {d.requiresSignature && (
                          d.signedAt ? <Badge tone="green" dot>Firmato</Badge> : <Badge tone="amber" dot>Attesa firma</Badge>
                        )}
                        <a href={getDocumentDownloadUrl(d)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex" }} onClick={e => e.stopPropagation()}>
                          <Btn size="sm" variant="ghost" icon="download">Apri</Btn>
                        </a>
                        <Btn size="sm" variant="danger" icon="trash" onClick={() => setRemoving(d)} title="Elimina" />
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </Glass>

          <Glass variant="panel" style={{ padding: 20 }}>
            <SectionTitle kicker="Dal cliente" title="Materiali ricevuti"
              sub="Loghi, testi e immagini caricati da lui, anche quelli non legati a un progetto." />
            <div style={{ marginTop: 14 }}>
              {assets === null ? (
                <Loading label="Carico i materiali" />
              ) : assets.length === 0 ? (
                <Empty icon="folder" title="Nessun materiale" hint="Quello che il cliente carica compare qui." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {assets.map(a => (
                    <Row
                      key={a.id}
                      icon="doc"
                      iconTone="silver"
                      title={a.name}
                      sub={[fmtBytes(a.sizeBytes), fmtDate(a.createdAt), projectName(a.projectId) ?? "nessun progetto"].join(" · ")}
                      right={<Btn size="sm" variant="ghost" icon="download" onClick={() => openAsset(a)}>Apri</Btn>}
                    />
                  ))}
                </div>
              )}
            </div>
          </Glass>
        </div>
      )}

      {/* ── Modali ── */}
      <Modal
        open={editOpen}
        onClose={() => !editBusy && setEditOpen(false)}
        kicker="CRM"
        title="Modifica profilo cliente"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setEditOpen(false)} disabled={editBusy}>Annulla</Btn>
            <Btn variant="primary" icon="check" onClick={saveEdit} busy={editBusy}>Salva</Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="Azienda">
            <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </Field>
          <Field label="Referente">
            <Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
          </Field>
          <Field label="Telefono" hint="Con il prefisso internazionale il pulsante WhatsApp compare da solo.">
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} inputMode="tel" placeholder="+39 345 697 7475" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Piano">
              <Select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value as ClientPlan }))}>
                {(Object.keys(CLIENT_PLAN) as ClientPlan[]).map(p => <option key={p} value={p}>{CLIENT_PLAN[p].label}</option>)}
              </Select>
            </Field>
            <Field label="Stato">
              <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ClientStatus }))}>
                {(Object.keys(CLIENT_STATUS) as ClientStatus[]).map(s => <option key={s} value={s}>{CLIENT_STATUS[s].label}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={projOpen}
        onClose={() => !projBusy && setProjOpen(false)}
        kicker="Produzione"
        title={`Nuovo progetto · ${client.company}`}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setProjOpen(false)} disabled={projBusy}>Annulla</Btn>
            <Btn variant="primary" icon="plus" onClick={saveProject} busy={projBusy} disabled={!proj.name.trim()}>Apri progetto</Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="Nome del progetto">
            <Input value={proj.name} onChange={e => setProj(p => ({ ...p, name: e.target.value }))} autoFocus placeholder="Sito vetrina, restyling, e-commerce…" />
          </Field>
          <Field label="Descrizione">
            <Textarea value={proj.description} onChange={e => setProj(p => ({ ...p, description: e.target.value }))} rows={3}
              placeholder="Cosa comprende, cosa no, che risultato ci si aspetta." />
          </Field>
          <Field label="Stato iniziale">
            <Select value={proj.status} onChange={e => setProj(p => ({ ...p, status: e.target.value as ProjectStatus }))}>
              <option value="active">Attivo — si parte subito</option>
              <option value="pending_approval">In valutazione — prima si decide</option>
            </Select>
          </Field>
          <Note tone="silver">
            {proj.status === "active"
              ? "Diventando attivo, le sei fasi standard vengono create da sole. Si rinominano, riordinano ed eliminano dal dossier."
              : "Le fasi standard compariranno quando porterai il progetto in stato attivo."}
          </Note>
          {archived && <Note tone="amber">Aprendo un progetto, {client.company} torna fra i clienti attivi.</Note>}
        </div>
      </Modal>

      <Modal
        open={invOpen}
        onClose={() => !invBusy && setInvOpen(false)}
        kicker="Fatturazione"
        title={`Nuova fattura · ${client.company}`}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setInvOpen(false)} disabled={invBusy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={saveInvoice} busy={invBusy}
              disabled={!inv.number.trim() || !inv.description.trim() || !(Number(inv.amount.replace(",", ".")) > 0)}>
              Emetti
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Numero">
              <Input value={inv.number} onChange={e => setInv(v => ({ ...v, number: e.target.value }))} />
            </Field>
            <Field label="Importo (EUR)">
              <Input value={inv.amount} onChange={e => setInv(v => ({ ...v, amount: e.target.value }))} placeholder="1200" inputMode="decimal" />
            </Field>
          </div>
          <Field label="Descrizione">
            <Textarea value={inv.description} onChange={e => setInv(v => ({ ...v, description: e.target.value }))} rows={2} style={{ resize: "vertical" }} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Scadenza (opzionale)">
              <Input type="date" value={inv.dueDate} onChange={e => setInv(v => ({ ...v, dueDate: e.target.value }))} />
            </Field>
            <Field label="Stato iniziale">
              <Select value={inv.status} onChange={e => setInv(v => ({ ...v, status: e.target.value as InvoiceStatus }))}>
                <option value="sent">Da saldare</option>
                <option value="draft">Bozza</option>
              </Select>
            </Field>
          </div>
          {lens.projects.length > 0 && (
            <Field label="Progetto (opzionale)">
              <Select value={inv.projectId} onChange={e => setInv(v => ({ ...v, projectId: e.target.value }))}>
                <option value="">Nessun progetto</option>
                {lens.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          )}
        </div>
      </Modal>

      <Modal
        open={meetOpen}
        onClose={() => !meetBusy && setMeetOpen(false)}
        kicker="Agenda"
        title={`Proponi una riunione · ${client.company}`}
        width={560}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setMeetOpen(false)} disabled={meetBusy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={saveMeeting} busy={meetBusy} disabled={!slot}>
              {slot ? `Proponi · ${fmtDateTime(slot)}` : "Scegli uno slot"}
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {lens.projects.length > 0 && (
            <Field label="Progetto (opzionale)" hint="Collegandolo, la riunione entra nel diario del progetto.">
              <Select value={meetProject} onChange={e => setMeetProject(e.target.value)}>
                <option value="">Nessun progetto specifico</option>
                {lens.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          )}
          <Scheduler value={slot} onChange={setSlot} refreshKey={refreshKey} />
          <Field label="Nota (opzionale)">
            <Textarea value={meetNote} onChange={e => setMeetNote(e.target.value)} rows={2} placeholder="Ordine del giorno…" style={{ resize: "vertical" }} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={convOpen}
        onClose={() => !convBusy && setConvOpen(false)}
        kicker="Richieste"
        title={`Scrivi a ${client.company}`}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setConvOpen(false)} disabled={convBusy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={newConversation} busy={convBusy} disabled={!subject.trim()}>Apri il filo</Btn>
          </>
        }
      >
        <Field label="Oggetto" hint="Il cliente riceve il filo nel suo portale, sotto «Richieste».">
          <Input value={subject} onChange={e => setSubject(e.target.value)} onKeyDown={e => { if (e.key === "Enter") newConversation() }} autoFocus />
        </Field>
      </Modal>

      <ConfirmDialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={toggleArchive}
        busy={archiveBusy}
        kicker="CRM"
        title={archived ? `Riattivare ${client.company}?` : `Archiviare ${client.company}?`}
        confirmLabel={archived ? "Riattiva" : "Archivia"}
        confirmVariant={archived ? "primary" : "copper"}
        confirmIcon={archived ? "play" : "archive"}
        body={
          archived
            ? "Torna negli elenchi di lavoro come cliente attivo. Niente altro cambia."
            : <ArchiveWarning lens={lens} />
        }
      />

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={removeDoc}
        kicker="Documenti"
        title="Eliminare il documento?"
        confirmLabel="Elimina"
        body={removing ? `«${removing.name}» sparisce anche dal portale del cliente. L'operazione non si annulla.` : undefined}
      />
    </div>
  )
}

/* ── Avviso prima di archiviare ──
   Archiviare con del lavoro aperto non è vietato — a volte è proprio quello
   che si vuole — ma va detto ad alta voce, perché quel lavoro esce dagli
   elenchi insieme alla scheda. */
function ArchiveWarning({ lens }: { lens: ReturnType<typeof clientLens> }) {
  const open: string[] = []
  if (lens.running.length) open.push(`${lens.running.length} progett${lens.running.length === 1 ? "o" : "i"} non conclus${lens.running.length === 1 ? "o" : "i"}`)
  if (lens.dueInvoices) open.push(`${lens.dueInvoices} fattur${lens.dueInvoices === 1 ? "a" : "e"} da incassare (${fmtEur(lens.dueAmount)})`)
  if (lens.openTickets) open.push(`${lens.openTickets} richiest${lens.openTickets === 1 ? "a aperta" : "e aperte"}`)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 14.5, lineHeight: 1.6, color: T.secondary, margin: 0 }}>
        Niente viene cancellato: fatture, documenti e diario restano, e il cliente continua ad accedere
        al suo portale. La scheda esce dagli elenchi di lavoro e finisce in Archivio.
      </p>
      {open.length > 0 && (
        <Note tone="amber">Ha ancora {open.join(", ")}. Archiviandolo, spariscono dalla vista insieme a lui.</Note>
      )}
    </div>
  )
}

function ContactChip({ href, icon, label, external = false }: {
  href: string
  icon: "mail" | "phone" | "chat"
  label: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="portal-row"
      style={{
        display: "inline-flex", alignItems: "center", gap: 7, maxWidth: "100%",
        padding: "6px 12px", borderRadius: 99, textDecoration: "none",
        background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`,
        fontFamily: MONO, fontSize: 12.5, color: T.text,
      }}
    >
      <Icon name={icon} size={13} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
    </a>
  )
}

function MiniCard({ label, value, icon, warn = false, onClick }: {
  label: string
  value: string
  icon: "layers" | "euro" | "ticket" | "checkCircle"
  warn?: boolean
  onClick: () => void
}) {
  return (
    <Glass variant="work" style={{ padding: 0 }}>
      <button
        type="button"
        onClick={onClick}
        className="portal-stat"
        style={{
          display: "flex", flexDirection: "column", gap: 8, width: "100%", textAlign: "left",
          padding: "15px 17px", background: "none", border: "none", borderRadius: 16, cursor: "pointer", font: "inherit",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: T.secondary }}>{label}</span>
          <span style={{ display: "flex", color: warn ? T.amber : T.secondary }}><Icon name={icon} size={15} /></span>
        </span>
        <span style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: warn ? T.amber : T.text, lineHeight: 1 }}>
          {value}
        </span>
      </button>
    </Glass>
  )
}

function ClientTimeline({ events }: { events: ProjectEvent[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {events.map(e => (
        <Row
          key={e.id}
          icon="sparkle"
          iconTone="steel"
          title={e.title}
          sub={[fmtDateTime(e.createdAt), e.projectName, e.detail].filter(Boolean).join(" · ")}
        />
      ))}
    </div>
  )
}
