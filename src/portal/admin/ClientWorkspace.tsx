import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type {
  AdminHome, ClientAsset, ClientDocument, ClientPlan, ClientRecord, ClientStatus, Conversation,
  DocType, InvoiceStatus,
} from "../../lib/api"
import {
  createConversation, createInvoice, deleteDocument, fetchAssets, fetchDocuments, fmtBytes, fmtDate,
  fmtEur, getAssetSignedUrl, getDocumentDownloadUrl, isUnreadFor, nextInvoiceNumber, relativeDate,
  updateClientProfile, updateInvoiceStatus, uploadDocument,
} from "../../lib/api"
import ChatThread from "../ChatThread"
import {
  Avatar, Badge, Btn, CLIENT_PLAN, CLIENT_STATUS, CONVO_STATUS, DISPLAY, Empty, Field,
  FileBtn, Glass, Icon, Input, INVOICE_STATUS, Loading, Modal, MONO, PROJECT_STATUS, Row,
  Select, T, Tabs, Textarea,
} from "../ui"

type TabId = "progetti" | "fatture" | "documenti" | "materiali" | "messaggi"

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
  const [tab, setTab] = useState<TabId>("progetti")

  const projects = home.projects.filter(p => p.clientId === client.id)
  const invoices = home.invoices.filter(i => i.clientId === client.id)
  const threads = home.threads.filter(c => c.clientId === client.id && !c.stageId)
  const dueCount = invoices.filter(i => i.status === "sent" || i.status === "overdue").length
  const unreadCount = threads.filter(c => isUnreadFor(c, "admin")).length

  /* ── Edit profile ── */
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

  /* ── Invoices ── */
  const [invOpen, setInvOpen] = useState(false)
  const [inv, setInv] = useState({ number: "", description: "", amount: "", dueDate: "", projectId: "", status: "sent" as InvoiceStatus })
  const [invBusy, setInvBusy] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)

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

  async function markPaid(id: string) {
    setPayingId(id)
    try {
      await updateInvoiceStatus(id, "paid")
      toast.success("Fattura incassata")
      reload()
    } catch {
      toast.error("Aggiornamento non riuscito.")
    } finally {
      setPayingId(null)
    }
  }

  /* ── Documents ──
     A document uploaded here used to go out with project_id null and
     requires_signature false, which meant the journal trigger skipped it and
     the client got no action item — a contract just appeared in their list.
     Both are now choices the admin makes at upload time. */
  const [docs, setDocs] = useState<ClientDocument[] | null>(null)
  const [docType, setDocType] = useState<DocType>("report")
  const [docProjectId, setDocProjectId] = useState("")
  const [docRequiresSig, setDocRequiresSig] = useState(false)
  const [uploading, setUploading] = useState(false)

  const loadDocs = useCallback(async () => {
    try { setDocs(await fetchDocuments(client.id)) } catch { setDocs([]) }
  }, [client.id])

  useEffect(() => { if (tab === "documenti" && docs === null) loadDocs() }, [tab, docs, loadDocs])

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

  /* ── Client-supplied materials ──
     The only other reader is fetchAssetsByProject, so anything the client
     uploaded without picking a project was unreachable from every admin
     screen. This tab is that missing reader. */
  const [assets, setAssets] = useState<ClientAsset[] | null>(null)

  const loadAssets = useCallback(async () => {
    try { setAssets(await fetchAssets(client.id)) } catch { setAssets([]) }
  }, [client.id])

  useEffect(() => { if (tab === "materiali" && assets === null) loadAssets() }, [tab, assets, loadAssets])

  async function openAsset(a: ClientAsset) {
    const url = await getAssetSignedUrl(a)
    if (url) window.open(url, "_blank", "noopener")
    else toast.error("Link non disponibile.")
  }

  async function removeDoc(d: ClientDocument) {
    try {
      await deleteDocument(d)
      toast.info("Documento eliminato")
      loadDocs()
    } catch {
      toast.error("Eliminazione non riuscita.")
    }
  }

  /* ── Messages ── */
  const [threadId, setThreadId] = useState<string | null>(null)
  const [convOpen, setConvOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [convBusy, setConvBusy] = useState(false)
  const sortedThreads = useMemo(() => [...threads].sort((a, b) => {
    if (a.status === "closed" && b.status !== "closed") return 1
    if (b.status === "closed" && a.status !== "closed") return -1
    return b.lastMessageAt.localeCompare(a.lastMessageAt)
  }), [threads])
  const thread: Conversation | null = sortedThreads.find(c => c.id === threadId) ?? null

  async function newConversation() {
    if (!subject.trim() || convBusy) return
    setConvBusy(true)
    try {
      const c = await createConversation({ clientId: client.id, subject })
      setConvOpen(false)
      setSubject("")
      setThreadId(c.id)
      reload()
    } catch {
      toast.error("Creazione non riuscita.")
    } finally {
      setConvBusy(false)
    }
  }

  const cs = CLIENT_STATUS[client.status]
  const cp = CLIENT_PLAN[client.plan]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <Glass variant="panel" style={{ padding: 22 }}>
        <button
          onClick={onBack}
          className="portal-link"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none",
            padding: 0, marginBottom: 12, fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em",
            textTransform: "uppercase", color: T.tertiary, cursor: "pointer",
          }}
        >
          <Icon name="arrowL" size={11} /> Clienti
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Avatar name={client.company} size={46} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>
                {client.company}
              </h2>
              <Badge tone={cs.tone} dot>{cs.label}</Badge>
              <Badge tone={cp.tone}>{cp.label}</Badge>
            </div>
            <p style={{ fontFamily: MONO, fontSize: 11, color: T.secondary, margin: "6px 0 0" }}>
              {client.contact} · {client.email}{client.phone ? ` · ${client.phone}` : ""}
              {client.joinedAt ? ` · cliente dal ${fmtDate(client.joinedAt)}` : ""}
            </p>
          </div>
          <Btn variant="outline" icon="edit" onClick={openEdit}>Modifica profilo</Btn>
        </div>
      </Glass>

      <Tabs<TabId>
        items={[
          { id: "progetti", label: "Progetti", badge: projects.filter(p => p.status === "pending_approval").length || undefined },
          { id: "fatture", label: "Fatture", badge: dueCount || undefined },
          { id: "documenti", label: "Documenti" },
          { id: "materiali", label: "Materiali" },
          { id: "messaggi", label: "Messaggi", badge: unreadCount || undefined },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "progetti" && (
        <Glass variant="panel" style={{ padding: 20 }}>
          {projects.length === 0 ? (
            <Empty icon="folder" title="Nessun progetto" hint="I progetti di questo cliente appariranno qui." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {projects.map(p => {
                const st = PROJECT_STATUS[p.status]
                return (
                  <Row
                    key={p.id}
                    icon="folder"
                    iconTone={st.tone}
                    title={p.name}
                    sub={`${st.label} · ${fmtDate(p.createdAt)}`}
                    right={<Icon name="chevronR" size={13} />}
                    onClick={() => onOpenProject(p.id)}
                  />
                )
              })}
            </div>
          )}
        </Glass>
      )}

      {tab === "fatture" && (
        <Glass variant="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn variant="primary" icon="plus" onClick={openInvoice}>Nuova fattura</Btn>
          </div>
          {invoices.length === 0 ? (
            <Empty icon="invoice" title="Nessuna fattura" hint="Emetti la prima fattura per questo cliente." />
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
                        {(i.status === "sent" || i.status === "overdue") && (
                          <Btn size="sm" variant="ghost" icon="check" busy={payingId === i.id} onClick={() => markPaid(i.id)}>Incassata</Btn>
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

      {tab === "documenti" && (
        <Glass variant="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: "flex-end", marginBottom: 12, flexWrap: "wrap" }}>
            <Select value={docType} onChange={e => setDocType(e.target.value as DocType)} style={{ width: 150 }}>
              {(Object.keys(DOC_TYPES) as DocType[]).map(t => <option key={t} value={t}>{DOC_TYPES[t]}</option>)}
            </Select>
            {projects.length > 0 && (
              <Select value={docProjectId} onChange={e => setDocProjectId(e.target.value)} style={{ width: 190 }}
                title="Collega il documento a un progetto: senza, non finisce nel diario del cliente">
                <option value="">Nessun progetto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            )}
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: DISPLAY, fontSize: 13, color: T.secondary }}>
              <input type="checkbox" checked={docRequiresSig} onChange={e => setDocRequiresSig(e.target.checked)} style={{ accentColor: "#B83240", width: 16, height: 16 }} />
              Richiede firma
            </label>
            <FileBtn variant="primary" icon="plus" busy={uploading} onFiles={handleUpload}>Carica</FileBtn>
          </div>
          {docs === null ? (
            <Loading label="Apro i documenti" />
          ) : docs.length === 0 ? (
            <Empty icon="doc" title="Nessun documento" hint="Report, contratti e materiali condivisi con il cliente." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {docs.map(d => (
                <Row
                  key={d.id}
                  icon="doc"
                  iconTone="silver"
                  title={d.name}
                  sub={`${DOC_TYPES[d.type]} · ${fmtBytes(d.sizeBytes)} · ${fmtDate(d.uploadedAt)}`}
                  right={
                    <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}>
                      {d.requiresSignature && (
                        d.signedAt ? <Badge tone="green" dot>Firmato</Badge> : <Badge tone="amber" dot>Attesa firma</Badge>
                      )}
                      <a href={getDocumentDownloadUrl(d)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex" }} onClick={e => e.stopPropagation()}>
                        <Btn size="sm" variant="ghost" icon="download">Apri</Btn>
                      </a>
                      <Btn size="sm" variant="danger" icon="trash" onClick={() => removeDoc(d)} />
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </Glass>
      )}

      {tab === "materiali" && (
        <Glass variant="panel" style={{ padding: 20 }}>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.tertiary, margin: "0 0 12px" }}>
            Caricati dal cliente
          </p>
          {assets === null ? (
            <Loading label="Carico i materiali" />
          ) : assets.length === 0 ? (
            <Empty icon="folder" title="Nessun materiale" hint="Loghi, testi e immagini che il cliente carica compaiono qui." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {assets.map(a => {
                const pname = projects.find(p => p.id === a.projectId)?.name
                return (
                  <Row
                    key={a.id}
                    icon="doc"
                    iconTone="silver"
                    title={a.name}
                    sub={[fmtBytes(a.sizeBytes), fmtDate(a.createdAt), pname ?? "nessun progetto"].join(" · ")}
                    right={<Btn size="sm" variant="ghost" icon="download" onClick={() => openAsset(a)}>Apri</Btn>}
                  />
                )
              })}
            </div>
          )}
        </Glass>
      )}

      {tab === "messaggi" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 16, alignItems: "start" }}>
          <Glass variant="panel" style={{ padding: 12, maxWidth: 380 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <Btn size="sm" variant="copper" icon="plus" onClick={() => setConvOpen(true)}>Nuova</Btn>
            </div>
            {sortedThreads.length === 0 ? (
              <Empty icon="chat" title="Nessuna conversazione" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 520, overflowY: "auto" }}>
                {sortedThreads.map(c => {
                  const cvs = CONVO_STATUS[c.status]
                  const unread = isUnreadFor(c, "admin")
                  const sel = c.id === threadId
                  return (
                    <button
                      key={c.id}
                      onClick={() => setThreadId(c.id)}
                      className={sel ? undefined : "portal-row"}
                      style={{
                        display: "flex", flexDirection: "column", gap: 5, textAlign: "left",
                        padding: "10px 12px", borderRadius: 11, cursor: "pointer",
                        background: sel ? "rgba(184,50,64,0.14)" : "transparent",
                        border: `1px solid ${sel ? "rgba(184,50,64,0.32)" : "transparent"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                        {unread && <span style={{ width: 7, height: 7, borderRadius: 99, background: T.copperLt, flexShrink: 0, boxShadow: "0 0 8px rgba(212,105,90,0.8)" }} />}
                        <span style={{ flex: 1, minWidth: 0, fontFamily: DISPLAY, fontSize: 12.5, fontWeight: unread ? 800 : 600, color: c.status === "closed" ? T.secondary : T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.subject}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 11, color: T.tertiary, flexShrink: 0 }}>{relativeDate(c.lastMessageAt)}</span>
                      </div>
                      <Badge tone={cvs.tone} dot>{cvs.label}</Badge>
                    </button>
                  )
                })}
              </div>
            )}
          </Glass>
          <Glass variant="panel" style={{ padding: 18 }}>
            {thread ? (
              <ChatThread conversation={thread} role="admin" authorId={adminId} height={460} onChanged={reload} />
            ) : (
              <Empty icon="chat" title="Seleziona una conversazione" />
            )}
          </Glass>
        </div>
      )}

      {/* Edit profile modal */}
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
          <Field label="Telefono">
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} inputMode="tel" />
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

      {/* New invoice modal */}
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
              <Input type="date" value={inv.dueDate} onChange={e => setInv(v => ({ ...v, dueDate: e.target.value }))} className="portal-input" />
            </Field>
            <Field label="Stato iniziale">
              <Select value={inv.status} onChange={e => setInv(v => ({ ...v, status: e.target.value as InvoiceStatus }))}>
                <option value="sent">Da saldare</option>
                <option value="draft">Bozza</option>
              </Select>
            </Field>
          </div>
          {projects.length > 0 && (
            <Field label="Progetto (opzionale)">
              <Select value={inv.projectId} onChange={e => setInv(v => ({ ...v, projectId: e.target.value }))}>
                <option value="">Nessun progetto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          )}
        </div>
      </Modal>

      {/* New conversation modal */}
      <Modal
        open={convOpen}
        onClose={() => !convBusy && setConvOpen(false)}
        kicker="Messaggi"
        title={`Nuova conversazione · ${client.company}`}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setConvOpen(false)} disabled={convBusy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={newConversation} busy={convBusy} disabled={!subject.trim()}>Apri</Btn>
          </>
        }
      >
        <Field label="Oggetto">
          <Input value={subject} onChange={e => setSubject(e.target.value)} onKeyDown={e => { if (e.key === "Enter") newConversation() }} autoFocus />
        </Field>
      </Modal>
    </div>
  )
}
