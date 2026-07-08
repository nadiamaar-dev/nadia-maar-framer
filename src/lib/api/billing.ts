import { safeStorageName, supabase } from "./core"
import type { ClientDocument, DocType, Invoice, InvoiceStatus } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapInvoice(r: any): Invoice {
  return {
    id: r.id,
    clientId: r.client_id,
    projectId: r.project_id ?? undefined,
    stageId: r.stage_id ?? undefined,
    number: r.number,
    description: r.description ?? "",
    amount: r.amount,
    currency: r.currency ?? "EUR",
    status: r.status as InvoiceStatus,
    issuedAt: r.issued_at,
    dueDate: r.due_date ?? undefined,
    pdfPath: r.pdf_path ?? undefined,
  }
}

function mapDocument(r: any): ClientDocument {
  return {
    id: r.id,
    clientId: r.client_id,
    name: r.name,
    type: r.type as DocType,
    sizeBytes: r.size_bytes,
    uploadedAt: r.uploaded_at,
    storagePath: r.storage_path,
    publicUrl: r.public_url ?? undefined,
  }
}

/* ── Invoices ──────────────────────────────────────────────── */

export async function fetchInvoices(clientId?: string): Promise<Invoice[]> {
  let q = supabase.from("client_invoices").select("*").order("issued_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapInvoice)
}

export async function fetchInvoicesByProject(projectId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("client_invoices")
    .select("*")
    .eq("project_id", projectId)
    .order("issued_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapInvoice)
}

export async function createInvoice(payload: {
  clientId: string
  projectId?: string
  stageId?: string
  number: string
  description: string
  amount: number
  status: InvoiceStatus
  dueDate?: string
}): Promise<Invoice> {
  const { data, error } = await supabase
    .from("client_invoices")
    .insert({
      client_id: payload.clientId,
      project_id: payload.projectId ?? null,
      stage_id: payload.stageId ?? null,
      number: payload.number.trim(),
      description: payload.description.trim(),
      amount: payload.amount,
      currency: "EUR",
      status: payload.status,
      issued_at: new Date().toISOString().slice(0, 10),
      due_date: payload.dueDate || null,
    })
    .select()
    .single()
  if (error) throw error
  return mapInvoice(data)
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
  const { error } = await supabase.from("client_invoices").update({ status }).eq("id", id)
  if (error) throw error
}

/** Next progressive number for the current year: "FAT-2026-004". */
export function nextInvoiceNumber(existing: Invoice[]): string {
  const year = new Date().getFullYear()
  const prefix = `FAT-${year}-`
  const max = existing
    .filter(i => i.number.startsWith(prefix))
    .reduce((m, i) => Math.max(m, parseInt(i.number.slice(prefix.length), 10) || 0), 0)
  return `${prefix}${String(max + 1).padStart(3, "0")}`
}

/* ── Documents ─────────────────────────────────────────────── */

export async function fetchDocuments(clientId?: string): Promise<ClientDocument[]> {
  let q = supabase.from("client_documents").select("*").order("uploaded_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapDocument)
}

export async function uploadDocument(clientId: string, file: File, type: DocType): Promise<ClientDocument> {
  const storagePath = `${clientId}/${type}s/${Date.now()}-${safeStorageName(file.name)}`
  const { error: storageErr } = await supabase.storage
    .from("client-documents")
    .upload(storagePath, file, { upsert: false })
  if (storageErr) throw storageErr
  const { data, error } = await supabase
    .from("client_documents")
    .insert({ client_id: clientId, name: file.name, type, size_bytes: file.size, storage_path: storagePath })
    .select()
    .single()
  if (error) throw error
  return mapDocument(data)
}

export async function deleteDocument(doc: ClientDocument): Promise<void> {
  await supabase.storage.from("client-documents").remove([doc.storagePath])
  const { error } = await supabase.from("client_documents").delete().eq("id", doc.id)
  if (error) throw error
}

export function getDocumentDownloadUrl(doc: ClientDocument): string {
  if (!doc.storagePath) return "#"
  const { data } = supabase.storage.from("client-documents").getPublicUrl(doc.storagePath)
  return data.publicUrl
}
