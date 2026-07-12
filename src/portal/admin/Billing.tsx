import React, { useCallback, useEffect, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { AdminHome, ClientDocument, ClientRecord, DocType, InvoiceStatus } from "../../lib/api"
import {
  createInvoice, deleteDocument, fetchDocuments, fmtBytes, fmtDate, fmtEur,
  getDocumentDownloadUrl, nextInvoiceNumber, updateInvoiceStatus, uploadDocument,
} from "../../lib/api"
import {
  Badge, Btn, Empty, Field, FileBtn, Glass, Input, INVOICE_STATUS, Loading, Modal, MONO, Row,
  SectionTitle, Select, Stat, T, Tabs, Textarea,
} from "../ui"

const DOC_TYPES: Record<DocType, string> = {
  report: "Report", contract: "Contratto", invoice: "Fattura", handover: "Consegna", other: "Altro",
}

export default function Billing({ home, clients, reload }: {
  home: AdminHome
  clients: ClientRecord[]
  reload: () => void
}) {
  const toast = useToast()
  const [tab, setTab] = useState<"fatture" | "documenti">("fatture")
  const [filter, setFilter] = useState<"tutte" | InvoiceStatus>("tutte")
  const [actingId, setActingId] = useState<string | null>(null)

  const invoices = filter === "tutte" ? home.invoices : home.invoices.filter(i => i.status === filter)
  const due = home.invoices.filter(i => i.status === "sent" || i.status === "overdue")
  const paid = home.invoices.filter(i => i.status === "paid")
  const clientName = (id: string) => clients.find(c => c.id === id)?.company ?? "—"

  /* ── Create invoice ── */
  const [invOpen, setInvOpen] = useState(false)
  const [inv, setInv] = useState({ clientId: "", projectId: "", number: "", description: "", amount: "", dueDate: "", status: "sent" as InvoiceStatus })
  const [invBusy, setInvBusy] = useState(false)

  function openInvoice() {
    setInv({ clientId: "", projectId: "", number: nextInvoiceNumber(home.invoices), description: "", amount: "", dueDate: "", status: "sent" })
    setInvOpen(true)
  }

  const clientProjects = home.projects.filter(p => p.clientId === inv.clientId)

  async function saveInvoice() {
    const amount = Number(inv.amount.replace(",", "."))
    if (!inv.clientId || !inv.number.trim() || !inv.description.trim() || !Number.isFinite(amount) || amount <= 0 || invBusy) return
    setInvBusy(true)
    try {
      await createInvoice({
        clientId: inv.clientId,
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

  async function setStatus(id: string, status: InvoiceStatus, msg: string) {
    setActingId(id)
    try {
      await updateInvoiceStatus(id, status)
      toast.success(msg)
      reload()
    } catch {
      toast.error("Aggiornamento non riuscito.")
    } finally {
      setActingId(null)
    }
  }

  /* ── Documents ── */
  const [docClient, setDocClient] = useState("")
  const [docs, setDocs] = useState<ClientDocument[] | null>(null)
  const [docType, setDocType] = useState<DocType>("report")
  const [uploading, setUploading] = useState(false)

  const loadDocs = useCallback(async (cid: string) => {
    setDocs(null)
    try { setDocs(await fetchDocuments(cid)) } catch { setDocs([]) }
  }, [])

  useEffect(() => { if (docClient) loadDocs(docClient) }, [docClient, loadDocs])

  async function handleUpload(files: File[]) {
    if (!files.length || !docClient) return
    setUploading(true)
    try {
      for (const f of files) await uploadDocument(docClient, f, docType)
      toast.success("Documento caricato")
      loadDocs(docClient)
    } catch {
      toast.error("Caricamento non riuscito.")
    } finally {
      setUploading(false)
    }
  }

  async function removeDoc(d: ClientDocument) {
    try {
      await deleteDocument(d)
      toast.info("Documento eliminato")
      loadDocs(docClient)
    } catch {
      toast.error("Eliminazione non riuscita.")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Amministrazione"
        title="Fatturazione"
        sub="Fatture e documenti condivisi con i clienti."
        right={<Btn variant="primary" icon="plus" onClick={openInvoice}>Nuova fattura</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Stat label="Da incassare" value={fmtEur(due.reduce((s, i) => s + i.amount, 0))} icon="euro" tone={due.length > 0 ? "amber" : "green"} hint={`${due.length} fatture aperte`} />
        <Stat label="Incassato" value={fmtEur(paid.reduce((s, i) => s + i.amount, 0))} icon="checkCircle" tone="green" hint={`${paid.length} fatture`} />
        <Stat label="Scadute" value={String(home.invoices.filter(i => i.status === "overdue").length)} icon="warn" tone={home.invoices.some(i => i.status === "overdue") ? "red" : "steel"} />
      </div>

      <Tabs
        items={[
          { id: "fatture", label: "Fatture" },
          { id: "documenti", label: "Documenti" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "fatture" && (
        <Glass variant="panel" style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <Tabs<"tutte" | InvoiceStatus>
              items={[
                { id: "tutte", label: "Tutte" },
                { id: "sent", label: "Da saldare" },
                { id: "overdue", label: "Scadute" },
                { id: "paid", label: "Pagate" },
                { id: "draft", label: "Bozze" },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          {invoices.length === 0 ? (
            <Empty icon="invoice" title="Nessuna fattura" hint="Emetti la prima fattura con il pulsante in alto." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {invoices.map(i => {
                const is = INVOICE_STATUS[i.status]
                const declared = !!i.clientMarkedPaidAt && i.status !== "paid"
                return (
                  <Row
                    key={i.id}
                    icon="invoice"
                    iconTone={declared ? "copper" : is.tone}
                    title={`${i.number} — ${i.description}`}
                    sub={`${clientName(i.clientId)} · emessa ${fmtDate(i.issuedAt)}${i.dueDate ? ` · scade ${fmtDate(i.dueDate)}` : ""}${declared ? ` · cliente ha dichiarato il pagamento` : ""}`}
                    right={
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }} onClick={e => e.stopPropagation()}>
                        <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: T.text }}>{fmtEur(i.amount)}</span>
                        {declared ? <Badge tone="copper" dot>Da confermare</Badge> : <Badge tone={is.tone} dot>{is.label}</Badge>}
                        {i.status === "draft" && (
                          <Btn size="sm" variant="copper" icon="send" busy={actingId === i.id} onClick={() => setStatus(i.id, "sent", "Fattura inviata")}>Invia</Btn>
                        )}
                        {(i.status === "sent" || i.status === "overdue") && (
                          <Btn size="sm" variant={declared ? "primary" : "ghost"} icon="check" busy={actingId === i.id} onClick={() => setStatus(i.id, "paid", "Fattura incassata")}>
                            {declared ? "Conferma incasso" : "Incassata"}
                          </Btn>
                        )}
                        {i.status === "sent" && !declared && (
                          <Btn size="sm" variant="danger" icon="warn" busy={actingId === i.id} onClick={() => setStatus(i.id, "overdue", "Segnata come scaduta")} title="Segna scaduta" />
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
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 14 }}>
            <Select value={docClient} onChange={e => setDocClient(e.target.value)} style={{ maxWidth: 260 }}>
              <option value="">Seleziona cliente…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
            </Select>
            {docClient && (
              <>
                <Select value={docType} onChange={e => setDocType(e.target.value as DocType)} style={{ width: 150 }}>
                  {(Object.keys(DOC_TYPES) as DocType[]).map(t => <option key={t} value={t}>{DOC_TYPES[t]}</option>)}
                </Select>
                <FileBtn variant="primary" icon="plus" busy={uploading} onFiles={handleUpload}>Carica</FileBtn>
              </>
            )}
          </div>
          {!docClient ? (
            <Empty icon="doc" title="Scegli un cliente" hint="I documenti sono organizzati per cliente." />
          ) : docs === null ? (
            <Loading label="Apro i documenti" />
          ) : docs.length === 0 ? (
            <Empty icon="doc" title="Nessun documento" hint="Carica report, contratti o materiali per questo cliente." />
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
                    <span style={{ display: "inline-flex", gap: 7 }}>
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

      {/* Create invoice modal */}
      <Modal
        open={invOpen}
        onClose={() => !invBusy && setInvOpen(false)}
        kicker="Fatturazione"
        title="Nuova fattura"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setInvOpen(false)} disabled={invBusy}>Annulla</Btn>
            <Btn variant="primary" icon="send" onClick={saveInvoice} busy={invBusy}
              disabled={!inv.clientId || !inv.number.trim() || !inv.description.trim() || !(Number(inv.amount.replace(",", ".")) > 0)}>
              Emetti
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="Cliente">
            <Select value={inv.clientId} onChange={e => setInv(v => ({ ...v, clientId: e.target.value, projectId: "" }))}>
              <option value="">Seleziona cliente…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
            </Select>
          </Field>
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
          {clientProjects.length > 0 && (
            <Field label="Progetto (opzionale)">
              <Select value={inv.projectId} onChange={e => setInv(v => ({ ...v, projectId: e.target.value }))}>
                <option value="">Nessun progetto</option>
                {clientProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          )}
        </div>
      </Modal>
    </div>
  )
}
