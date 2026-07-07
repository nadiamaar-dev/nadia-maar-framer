/**
 * adminApi.ts — Admin Panel data layer
 *
 * Each exported function is a READY placeholder:
 *   • Returns typed mock data immediately so the UI works offline
 *   • Contains a commented `supabase.*` block — uncomment to go live
 *   • All types are defined here so they can be imported throughout the admin
 */

import { supabase, SUPABASE_READY } from "./supabase"

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */

export type TaskStatus   = "todo" | "in-progress" | "review" | "done"
export type TaskPhase    = "strategia" | "design" | "sviluppo" | "testing" | "deploy"
export type DocType      = "report" | "contract" | "invoice" | "other"
export type InvoiceAdminStatus = "draft" | "sent" | "paid" | "overdue"
export type TicketStatus = "new" | "in-progress" | "resolved"
export type TicketPriority = "low" | "medium" | "high" | "critical"

export interface AdminTask {
  id: string
  clientId: string
  title: string
  description: string
  category: string
  phase: TaskPhase
  status: TaskStatus
  progress: number          // 0–100
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface ClientDocument {
  id: string
  clientId: string
  name: string
  type: DocType
  sizeBytes: number
  uploadedAt: string
  storagePath: string       // Supabase Storage path
  publicUrl?: string
}

export interface AdminInvoice {
  id: string
  clientId: string
  number: string
  description: string
  amount: number
  currency: string
  status: InvoiceAdminStatus
  issuedAt: string
  dueDate: string
  pdfPath?: string          // Supabase Storage path for PDF
}

export interface SupportTicket {
  id: string
  clientId: string
  clientName: string
  subject: string
  message: string
  priority: TicketPriority
  status: TicketStatus
  createdAt: string
  adminNote?: string
  respondedAt?: string
}

export type ProjectStatus  = "pending_approval" | "active" | "paused" | "completed"
export type MeetingStatus  = "pending" | "confirmed" | "cancelled" | "rescheduled"
export type MeetingProposer = "admin" | "client"

export interface Meeting {
  id: string
  clientId: string
  clientName?: string       // joined from profiles for admin view
  proposedBy: MeetingProposer
  /** ISO local datetime string: "YYYY-MM-DDTHH:mm" */
  datetime: string
  durationMin: number
  status: MeetingStatus
  adminNote?: string
  clientNote?: string
  createdAt: string
  updatedAt: string
}

export type ConversationStatus = "open" | "answered" | "has_questions" | "closed"

export interface Attachment {
  name: string
  path: string      // Supabase Storage path
  size: number
  type: string
  publicUrl?: string
}

export interface Conversation {
  id: string
  clientId: string
  clientName?: string
  subject: string
  status: ConversationStatus
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  authorId: string
  authorRole: "admin" | "client"
  content: string
  attachments: Attachment[]
  isDeleted: boolean
  editedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ClientProject {
  id: string
  clientId: string
  name: string
  description: string
  status: ProjectStatus
  /** Optional message from admin shown to the client */
  adminNote?: string
  createdAt: string
  updatedAt: string
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */

/**
 * MOCK_TASKS — universal descriptions: suitable for websites, apps, ads, any digital project.
 * Admin updates status/progress via the admin panel; clients see the result in their cabinet.
 *
 * Supabase table: client_tasks
 * Columns: id, client_id, title, description, category, phase,
 *          status (todo|in-progress|review|done), progress 0-100,
 *          due_date, created_at, updated_at
 */
export const MOCK_TASKS: AdminTask[] = [
  /* ── Client c1 ────────────────────────────────────────────── */
  {
    id: "t1", clientId: "c1",
    title: "Analisi & Briefing",
    description: "Raccolta degli obiettivi, analisi del mercato di riferimento e definizione della roadmap operativa.",
    category: "Strategia", phase: "strategia", status: "done", progress: 100,
    dueDate: "Gen 2025", createdAt: "2025-01-05", updatedAt: "2025-01-20",
  },
  {
    id: "t2", clientId: "c1",
    title: "Design System & Identità Visiva",
    description: "Palette cromatica, tipografia, iconografia e libreria di componenti UI riutilizzabili.",
    category: "Design", phase: "design", status: "done", progress: 100,
    dueDate: "Feb 2025", createdAt: "2025-01-21", updatedAt: "2025-02-28",
  },
  {
    id: "t3", clientId: "c1",
    title: "Sviluppo Interfaccia Principale",
    description: "Codice delle sezioni chiave, animazioni, interazioni e ottimizzazione delle performance.",
    category: "Frontend", phase: "sviluppo", status: "in-progress", progress: 72,
    dueDate: "Lug 2025", createdAt: "2025-03-01", updatedAt: "2025-07-01",
  },
  {
    id: "t4", clientId: "c1",
    title: "Visibilità & Distribuzione",
    description: "Ottimizzazione per i motori di ricerca, struttura URL canonici e integrazione canali di distribuzione.",
    category: "Marketing", phase: "sviluppo", status: "todo", progress: 0,
    dueDate: "Ago 2025", createdAt: "2025-06-01", updatedAt: "2025-06-01",
  },
  /* ── Client c2 ────────────────────────────────────────────── */
  {
    id: "t5", clientId: "c2",
    title: "Identità di Marca",
    description: "Concept del marchio, declinazioni del logo, palette e manuale di stile applicativo.",
    category: "Branding", phase: "design", status: "done", progress: 100,
    dueDate: "Feb 2025", createdAt: "2025-02-01", updatedAt: "2025-02-25",
  },
  {
    id: "t6", clientId: "c2",
    title: "Sviluppo Applicativo",
    description: "Funzionalità core, gestione dello stato globale e integrazione con le API di terze parti.",
    category: "Frontend", phase: "sviluppo", status: "in-progress", progress: 48,
    dueDate: "Ago 2025", createdAt: "2025-03-10", updatedAt: "2025-07-03",
  },
  {
    id: "t7", clientId: "c2",
    title: "Controllo Qualità & Compatibilità",
    description: "Test funzionali, verifica cross-browser, accessibilità WCAG e stress test sulle performance.",
    category: "QA", phase: "testing", status: "todo", progress: 0,
    dueDate: "Set 2025", createdAt: "2025-06-15", updatedAt: "2025-06-15",
  },
  /* ── Client c3 ────────────────────────────────────────────── */
  {
    id: "t8", clientId: "c3",
    title: "Pianificazione Strategica",
    description: "Workshop collaborativi, definizione dei KPI di progetto e scelta dello stack tecnologico.",
    category: "Strategia", phase: "strategia", status: "in-progress", progress: 60,
    dueDate: "Lug 2025", createdAt: "2025-05-20", updatedAt: "2025-07-04",
  },
  {
    id: "t9", clientId: "c3",
    title: "Pipeline Dati & Reportistica",
    description: "Configurazione del tracciamento, costruzione delle dashboard e automazione dei report periodici.",
    category: "Analytics", phase: "sviluppo", status: "review", progress: 85,
    dueDate: "Ago 2025", createdAt: "2025-06-01", updatedAt: "2025-07-05",
  },
  /* ── Client c6 ────────────────────────────────────────────── */
  {
    id: "t10", clientId: "c6",
    title: "Architettura di Sistema",
    description: "Progettazione dello schema dati, struttura delle API e scelte infrastrutturali.",
    category: "Backend", phase: "strategia", status: "done", progress: 100,
    dueDate: "Feb 2025", createdAt: "2025-01-15", updatedAt: "2025-02-20",
  },
  {
    id: "t11", clientId: "c6",
    title: "Integrazione Servizi Intelligenti",
    description: "Connessione con provider AI/ML, gestione dei prompt, caching e logica di fallback.",
    category: "AI", phase: "sviluppo", status: "in-progress", progress: 55,
    dueDate: "Ago 2025", createdAt: "2025-05-01", updatedAt: "2025-07-05",
  },
  {
    id: "t12", clientId: "c6",
    title: "Deploy & Rilascio Continuo",
    description: "Pipeline di CI/CD, configurazione ambienti di staging/produzione e monitoraggio post-lancio.",
    category: "DevOps", phase: "deploy", status: "todo", progress: 0,
    dueDate: "Ott 2025", createdAt: "2025-06-20", updatedAt: "2025-06-20",
  },
]

export const MOCK_DOCUMENTS: ClientDocument[] = [
  { id: "d1", clientId: "c1", name: "Contratto Progetto Nexus.pdf",     type: "contract", sizeBytes: 245_000, uploadedAt: "2025-01-15", storagePath: "c1/contracts/contratto-nexus.pdf" },
  { id: "d2", clientId: "c1", name: "Report SEO Maggio 2025.pdf",       type: "report",   sizeBytes: 1_200_000, uploadedAt: "2025-06-02", storagePath: "c1/reports/seo-may25.pdf" },
  { id: "d3", clientId: "c2", name: "Brand Guidelines Arteca.pdf",      type: "report",   sizeBytes: 4_500_000, uploadedAt: "2025-03-10", storagePath: "c2/reports/brand-guidelines.pdf" },
  { id: "d4", clientId: "c3", name: "Contratto Meridia Consulting.pdf", type: "contract", sizeBytes: 310_000, uploadedAt: "2025-05-22", storagePath: "c3/contracts/contratto-meridia.pdf" },
  { id: "d5", clientId: "c6", name: "Technical Spec Orbita Labs.pdf",   type: "report",   sizeBytes: 820_000, uploadedAt: "2025-02-01", storagePath: "c6/reports/tech-spec.pdf" },
]

export const MOCK_ADMIN_INVOICES: AdminInvoice[] = [
  { id: "i1", clientId: "c1", number: "FAT-2025-001", description: "Fase 1 — Design System", amount: 2800, currency: "EUR", status: "paid",    issuedAt: "2025-01-15", dueDate: "2025-01-31" },
  { id: "i2", clientId: "c1", number: "FAT-2025-002", description: "Fase 2 — Frontend Dev",  amount: 3500, currency: "EUR", status: "paid",    issuedAt: "2025-03-15", dueDate: "2025-03-31" },
  { id: "i3", clientId: "c1", number: "FAT-2025-003", description: "Fase 3 — Backend & CMS", amount: 2200, currency: "EUR", status: "sent",    issuedAt: "2025-05-15", dueDate: "2025-06-15" },
  { id: "i4", clientId: "c2", number: "FAT-2025-004", description: "Branding Package",       amount: 1800, currency: "EUR", status: "paid",    issuedAt: "2025-02-20", dueDate: "2025-03-05" },
  { id: "i5", clientId: "c2", number: "FAT-2025-005", description: "Web App Sprint 1",       amount: 2400, currency: "EUR", status: "sent",    issuedAt: "2025-05-01", dueDate: "2025-06-01" },
  { id: "i6", clientId: "c2", number: "FAT-2025-006", description: "Web App Sprint 2",       amount: 2400, currency: "EUR", status: "overdue", issuedAt: "2025-06-15", dueDate: "2025-07-01" },
  { id: "i7", clientId: "c6", number: "FAT-2025-007", description: "Architettura SaaS",      amount: 4300, currency: "EUR", status: "sent",    issuedAt: "2025-05-10", dueDate: "2025-06-10" },
]

export const MOCK_TICKETS: SupportTicket[] = [
  { id: "tk1", clientId: "c2", clientName: "Arteca Studio",       subject: "Dashboard non carica i dati",          message: "Dopo l'ultimo aggiornamento la dashboard mostra un errore 500 sul caricamento delle statistiche. Browser: Chrome 124. Riproducibile al 100%.", priority: "high",     status: "in-progress", createdAt: "2025-07-05T09:14:00Z", adminNote: "Individuato problema nella query aggregazione. Fix in staging." },
  { id: "tk2", clientId: "c3", clientName: "Meridia Consulting",  subject: "Impossibile accedere al cabinet",       message: "Dopo il reset password ricevo un errore 'Invalid token' al momento del login. Ho provato su due browser diversi.", priority: "critical", status: "new",         createdAt: "2025-07-06T08:02:00Z" },
  { id: "tk3", clientId: "c3", clientName: "Meridia Consulting",  subject: "Report di Maggio non visibile",         message: "Nel Centro Report vedo solo i report di Aprile. Quello di Maggio non compare nonostante sia stato caricato.", priority: "medium",   status: "new",         createdAt: "2025-07-04T15:30:00Z" },
  { id: "tk4", clientId: "c1", clientName: "Nexus Italia",        subject: "Richiesta aggiunta pagina FAQ",         message: "Vorremmo aggiungere una sezione FAQ all'interno della homepage, con accordion. È fattibile entro agosto?", priority: "low",      status: "resolved",    createdAt: "2025-06-20T11:00:00Z", adminNote: "Aggiunto nel backlog del prossimo sprint. Stimato 3h di lavoro.", respondedAt: "2025-06-21T10:00:00Z" },
  { id: "tk5", clientId: "c6", clientName: "Orbita Labs",         subject: "Rate limit API troppo restrittivo",     message: "Il wrapper AI che avete implementato triggera il rate limit di OpenAI dopo 20 richieste/min. Dobbiamo aumentarlo a 60 RPM.", priority: "high",     status: "in-progress", createdAt: "2025-07-03T14:20:00Z", adminNote: "Implementando exponential backoff + request queue." },
]

/* ═══════════════════════════════════════════════════════════════
   TASK API
   Table: client_tasks (id, client_id, title, description,
          category, phase, status, progress, due_date,
          created_at, updated_at)
═══════════════════════════════════════════════════════════════ */

export async function fetchTasks(clientId?: string): Promise<AdminTask[]> {
  if (!SUPABASE_READY) {
    return clientId ? MOCK_TASKS.filter(t => t.clientId === clientId) : MOCK_TASKS
  }
  /* ── Live query ────────────────────────────────────────────
  let q = supabase.from("client_tasks").select("*").order("created_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return data as AdminTask[]
  ─────────────────────────────────────────────────────────── */
  return clientId ? MOCK_TASKS.filter(t => t.clientId === clientId) : MOCK_TASKS
}

export async function createTask(payload: Omit<AdminTask, "id" | "createdAt" | "updatedAt">): Promise<AdminTask> {
  const now = new Date().toISOString().slice(0, 10)
  if (!SUPABASE_READY) {
    return { ...payload, id: `t${Date.now()}`, createdAt: now, updatedAt: now }
  }
  /* ── Live mutation ─────────────────────────────────────────
  const { data, error } = await supabase
    .from("client_tasks")
    .insert({ client_id: payload.clientId, title: payload.title,
              description: payload.description, category: payload.category,
              phase: payload.phase, status: payload.status,
              progress: payload.progress, due_date: payload.dueDate })
    .select().single()
  if (error) throw error
  return data as AdminTask
  ─────────────────────────────────────────────────────────── */
  return { ...payload, id: `t${Date.now()}`, createdAt: now, updatedAt: now }
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<AdminTask, "status" | "progress" | "phase" | "title" | "description" | "dueDate">>
): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation ─────────────────────────────────────────
  const { error } = await supabase
    .from("client_tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
  ─────────────────────────────────────────────────────────── */
}

export async function deleteTask(id: string): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation ─────────────────────────────────────────
  const { error } = await supabase.from("client_tasks").delete().eq("id", id)
  if (error) throw error
  ─────────────────────────────────────────────────────────── */
}

/**
 * fetchTasksForClient — called from the CLIENT cabinet (ProjectProgress).
 *
 * When Supabase is live, the row-level security policy on client_tasks
 * ensures the authenticated user only sees rows where client_id matches
 * their profile. The clientId param is used only in the mock fallback.
 *
 * Supabase RLS policy (example):
 *   CREATE POLICY "client_sees_own_tasks" ON client_tasks
 *     FOR SELECT USING (client_id = auth.uid()::text);
 */
export async function fetchTasksForClient(clientId: string): Promise<AdminTask[]> {
  if (!SUPABASE_READY) {
    const tasks = MOCK_TASKS.filter(t => t.clientId === clientId)
    return tasks.length > 0 ? tasks : MOCK_TASKS.filter(t => t.clientId === "c1")
  }
  /* ── Live query ────────────────────────────────────────────
  const { data, error } = await supabase
    .from("client_tasks")
    .select("id, client_id, title, description, category, phase, status, progress, due_date, updated_at")
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map(row => ({
    id:          row.id,
    clientId:    row.client_id,
    title:       row.title,
    description: row.description,
    category:    row.category,
    phase:       row.phase as TaskPhase,
    status:      row.status as TaskStatus,
    progress:    row.progress,
    dueDate:     row.due_date ?? undefined,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  }))
  ─────────────────────────────────────────────────────────── */
  const tasks = MOCK_TASKS.filter(t => t.clientId === clientId)
  return tasks.length > 0 ? tasks : MOCK_TASKS.filter(t => t.clientId === "c1")
}

/**
 * updateTaskProgress — targeted mutation called from the ADMIN panel
 * to update only the progress % and status of a task.
 * More focused than updateTask (which patches any field).
 *
 * Supabase RLS policy (example):
 *   CREATE POLICY "admin_updates_tasks" ON client_tasks
 *     FOR UPDATE USING (
 *       EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
 *     );
 */
export async function updateTaskProgress(
  taskId: string,
  progress: number,
  status: TaskStatus,
): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation ─────────────────────────────────────────
  const { error } = await supabase
    .from("client_tasks")
    .update({
      progress,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
  if (error) throw error
  ─────────────────────────────────────────────────────────── */
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT API
   Table: client_documents (id, client_id, name, type,
          size_bytes, storage_path, uploaded_at)
   Storage bucket: "client-documents" (private)
═══════════════════════════════════════════════════════════════ */

export async function fetchDocuments(clientId?: string): Promise<ClientDocument[]> {
  if (!SUPABASE_READY) {
    return clientId ? MOCK_DOCUMENTS.filter(d => d.clientId === clientId) : MOCK_DOCUMENTS
  }
  /* ── Live query ────────────────────────────────────────────
  let q = supabase.from("client_documents").select("*").order("uploaded_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return data as ClientDocument[]
  ─────────────────────────────────────────────────────────── */
  return clientId ? MOCK_DOCUMENTS.filter(d => d.clientId === clientId) : MOCK_DOCUMENTS
}

export async function uploadDocument(
  clientId: string,
  file: File,
  type: DocType
): Promise<ClientDocument> {
  const storagePath = `${clientId}/${type}s/${Date.now()}-${file.name}`
  if (!SUPABASE_READY) {
    return {
      id: `d${Date.now()}`, clientId, name: file.name, type,
      sizeBytes: file.size, uploadedAt: new Date().toISOString().slice(0, 10),
      storagePath,
    }
  }
  /* ── Live upload ──────────────────────────────────────────
  // 1. Upload file to Storage
  const { error: storageErr } = await supabase.storage
    .from("client-documents")
    .upload(storagePath, file, { upsert: false })
  if (storageErr) throw storageErr

  // 2. Insert metadata record
  const { data, error } = await supabase
    .from("client_documents")
    .insert({
      client_id: clientId, name: file.name, type,
      size_bytes: file.size, storage_path: storagePath,
    })
    .select().single()
  if (error) throw error
  return data as ClientDocument
  ─────────────────────────────────────────────────────────── */
  return {
    id: `d${Date.now()}`, clientId, name: file.name, type,
    sizeBytes: file.size, uploadedAt: new Date().toISOString().slice(0, 10),
    storagePath,
  }
}

export async function deleteDocument(doc: ClientDocument): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation ─────────────────────────────────────────
  await supabase.storage.from("client-documents").remove([doc.storagePath])
  await supabase.from("client_documents").delete().eq("id", doc.id)
  ─────────────────────────────────────────────────────────── */
}

export function getDocumentDownloadUrl(doc: ClientDocument): string {
  if (!SUPABASE_READY || !doc.storagePath) return "#"
  /* ── Live signed URL ───────────────────────────────────────
  const { data } = supabase.storage
    .from("client-documents")
    .getPublicUrl(doc.storagePath)   // or createSignedUrl for private buckets
  return data.publicUrl
  ─────────────────────────────────────────────────────────── */
  return "#"
}

/* ═══════════════════════════════════════════════════════════════
   INVOICE API
   Table: client_invoices (id, client_id, number, description,
          amount, currency, status, issued_at, due_date, pdf_path)
═══════════════════════════════════════════════════════════════ */

export async function fetchInvoices(clientId?: string): Promise<AdminInvoice[]> {
  if (!SUPABASE_READY) {
    return clientId ? MOCK_ADMIN_INVOICES.filter(i => i.clientId === clientId) : MOCK_ADMIN_INVOICES
  }
  /* ── Live query ────────────────────────────────────────────
  let q = supabase.from("client_invoices").select("*").order("issued_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return data as AdminInvoice[]
  ─────────────────────────────────────────────────────────── */
  return clientId ? MOCK_ADMIN_INVOICES.filter(i => i.clientId === clientId) : MOCK_ADMIN_INVOICES
}

export async function createInvoice(
  payload: Omit<AdminInvoice, "id">
): Promise<AdminInvoice> {
  if (!SUPABASE_READY) {
    return { ...payload, id: `i${Date.now()}` }
  }
  /* ── Live mutation ─────────────────────────────────────────
  const { data, error } = await supabase
    .from("client_invoices")
    .insert({
      client_id: payload.clientId, number: payload.number,
      description: payload.description, amount: payload.amount,
      currency: payload.currency, status: payload.status,
      issued_at: payload.issuedAt, due_date: payload.dueDate,
    })
    .select().single()
  if (error) throw error
  return data as AdminInvoice
  ─────────────────────────────────────────────────────────── */
  return { ...payload, id: `i${Date.now()}` }
}

export async function updateInvoiceStatus(id: string, status: InvoiceAdminStatus): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation ─────────────────────────────────────────
  const { error } = await supabase.from("client_invoices").update({ status }).eq("id", id)
  if (error) throw error
  ─────────────────────────────────────────────────────────── */
}

/* ═══════════════════════════════════════════════════════════════
   TICKET API
   Table: support_tickets (id, client_id, client_name, subject,
          message, priority, status, created_at,
          admin_note, responded_at)
═══════════════════════════════════════════════════════════════ */

export async function fetchTickets(status?: TicketStatus): Promise<SupportTicket[]> {
  if (!SUPABASE_READY) {
    return status ? MOCK_TICKETS.filter(t => t.status === status) : MOCK_TICKETS
  }
  /* ── Live query ────────────────────────────────────────────
  let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false })
  if (status) q = q.eq("status", status)
  const { data, error } = await q
  if (error) throw error
  return data as SupportTicket[]
  ─────────────────────────────────────────────────────────── */
  return status ? MOCK_TICKETS.filter(t => t.status === status) : MOCK_TICKETS
}

export async function updateTicket(
  id: string,
  patch: { status?: TicketStatus; adminNote?: string }
): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation ─────────────────────────────────────────
  const update: Record<string, unknown> = {}
  if (patch.status) update.status = patch.status
  if (patch.adminNote !== undefined) {
    update.admin_note = patch.adminNote
    update.responded_at = new Date().toISOString()
  }
  const { error } = await supabase.from("support_tickets").update(update).eq("id", id)
  if (error) throw error
  ─────────────────────────────────────────────────────────── */
}

/* ═══════════════════════════════════════════════════════════════
   PROJECT API
   Table: client_projects (id, client_id, name, description,
          status, admin_note, created_at, updated_at)
   See: supabase/migrations/002_client_projects.sql
═══════════════════════════════════════════════════════════════ */

export const MOCK_PROJECTS: ClientProject[] = [
  {
    id: "p1", clientId: "c1",
    name: "Sito Web Nexus Italia",
    description: "Sviluppo del nuovo sito istituzionale con e-commerce integrato, ottimizzazione SEO e dashboard analytics personalizzata.",
    status: "active",
    adminNote: "Progetto approvato. Siamo nella fase di sviluppo frontend.",
    createdAt: "2025-01-05", updatedAt: "2025-07-01",
  },
  {
    id: "p2", clientId: "c3",
    name: "Portale Analytics Meridia",
    description: "Dashboard personalizzata per il monitoraggio dei KPI aziendali e reportistica automatizzata mensile.",
    status: "pending_approval",
    createdAt: "2025-05-20", updatedAt: "2025-05-20",
  },
]

/**
 * Fetches the most recent active/pending project for a client.
 * Returns null if no project exists (triggers empty state in UI).
 *
 * Supabase RLS: client sees only their own row (client_id = auth.uid()).
 */
export async function fetchClientProject(clientId: string): Promise<ClientProject | null> {
  if (!SUPABASE_READY) {
    return MOCK_PROJECTS.find(p => p.clientId === clientId) ?? null
  }
  /* ── Live query ────────────────────────────────────────────
  const { data, error } = await supabase
    .from("client_projects")
    .select("id, client_id, name, description, status, admin_note, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    id:          data.id,
    clientId:    data.client_id,
    name:        data.name,
    description: data.description ?? "",
    status:      data.status as ProjectStatus,
    adminNote:   data.admin_note ?? undefined,
    createdAt:   data.created_at,
    updatedAt:   data.updated_at,
  }
  ─────────────────────────────────────────────────────────── */
  return MOCK_PROJECTS.find(p => p.clientId === clientId) ?? null
}

/**
 * Creates a new project for the authenticated client.
 * Status is always 'pending_approval' — enforced both here and by DB constraint.
 *
 * Supabase RLS: INSERT policy enforces client_id = auth.uid() AND status = 'pending_approval'.
 */
export async function createProject(payload: {
  clientId: string
  name: string
  description: string
}): Promise<ClientProject> {
  const now = new Date().toISOString().slice(0, 10)
  const newProject: ClientProject = {
    id: `p${Date.now()}`,
    clientId:    payload.clientId,
    name:        payload.name.trim(),
    description: payload.description.trim(),
    status:      "pending_approval",
    createdAt:   now,
    updatedAt:   now,
  }

  if (!SUPABASE_READY) return newProject

  /* ── Live mutation ─────────────────────────────────────────
  const { data, error } = await supabase
    .from("client_projects")
    .insert({
      client_id:   payload.clientId,
      name:        payload.name.trim(),
      description: payload.description.trim(),
      // status defaults to 'pending_approval' in the DB
    })
    .select()
    .single()
  if (error) throw error
  return {
    id:          data.id,
    clientId:    data.client_id,
    name:        data.name,
    description: data.description ?? "",
    status:      data.status as ProjectStatus,
    createdAt:   data.created_at,
    updatedAt:   data.updated_at,
  }
  ─────────────────────────────────────────────────────────── */
  return newProject
}

/* ═══════════════════════════════════════════════════════════════
   MEETING API
   Table: meetings  (see 003_meetings.sql)
   RPC:   get_confirmed_meeting_slots() — bypasses RLS for availability
═══════════════════════════════════════════════════════════════ */

export const MOCK_MEETINGS: Meeting[] = [
  /* Admin proposed to c1 — awaiting client confirmation */
  {
    id: "m1", clientId: "c1", clientName: "Nexus Italia S.r.l.",
    proposedBy: "admin", datetime: "2026-07-10T09:30", durationMin: 30,
    status: "pending", adminNote: "Call di allineamento sullo sprint frontend.",
    createdAt: "2026-07-07", updatedAt: "2026-07-07",
  },
  /* Client c2 proposed — awaiting admin confirmation */
  {
    id: "m2", clientId: "c2", clientName: "Arteca Studio",
    proposedBy: "client", datetime: "2026-07-11T14:00", durationMin: 30,
    status: "pending", clientNote: "Vorrei rivedere il mockup della dashboard.",
    createdAt: "2026-07-06", updatedAt: "2026-07-06",
  },
  /* Confirmed — blocks this slot for everyone */
  {
    id: "m3", clientId: "c1", clientName: "Nexus Italia S.r.l.",
    proposedBy: "admin", datetime: "2026-07-08T10:00", durationMin: 30,
    status: "confirmed", adminNote: "Sprint review settimanale.",
    createdAt: "2026-07-05", updatedAt: "2026-07-06",
  },
  {
    id: "m4", clientId: "c6", clientName: "Orbita Labs",
    proposedBy: "client", datetime: "2026-07-09T15:30", durationMin: 30,
    status: "confirmed", clientNote: "Revisione architettura AI layer.",
    createdAt: "2026-07-03", updatedAt: "2026-07-04",
  },
  /* Past confirmed — for history */
  {
    id: "m5", clientId: "c2", clientName: "Arteca Studio",
    proposedBy: "admin", datetime: "2026-07-02T11:00", durationMin: 30,
    status: "confirmed", adminNote: "Kick-off progetto web app.",
    createdAt: "2026-06-30", updatedAt: "2026-07-01",
  },
]

/* ── Conversation + Message mock data ─────────────────────────────── */
export const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "conv1", clientId: "c1", clientName: "Nexus Italia S.r.l.", subject: "Bug: menu hamburger non si chiude su iOS", status: "has_questions", lastMessageAt: "2026-07-07T10:30", createdAt: "2026-07-05", updatedAt: "2026-07-07" },
  { id: "conv2", clientId: "c1", clientName: "Nexus Italia S.r.l.", subject: "Aggiornamento footer — P.IVA e social", status: "answered", lastMessageAt: "2026-07-06T15:00", createdAt: "2026-07-04", updatedAt: "2026-07-06" },
  { id: "conv3", clientId: "c2", clientName: "Arteca Studio", subject: "Integrazione Stripe — domande tecniche", status: "open", lastMessageAt: "2026-07-07T09:00", createdAt: "2026-07-07", updatedAt: "2026-07-07" },
  { id: "conv4", clientId: "c1", clientName: "Nexus Italia S.r.l.", subject: "Performance Lighthouse — ottimizzazioni", status: "closed", lastMessageAt: "2026-06-28T11:00", createdAt: "2026-06-25", updatedAt: "2026-06-28" },
]

export const MOCK_MESSAGES: Message[] = [
  /* conv1 */
  { id: "msg1", conversationId: "conv1", authorId: "c1", authorRole: "client", content: "Il menu hamburger su mobile non si chiude dopo aver cliccato un link di navigazione.", attachments: [], isDeleted: false, createdAt: "2026-07-05T14:00", updatedAt: "2026-07-05T14:00" },
  { id: "msg2", conversationId: "conv1", authorId: "admin", authorRole: "admin", content: "Grazie per la segnalazione! Stiamo analizzando — probabilmente è un conflitto con il gestore degli eventi touch su Safari iOS. Ti aggiorno entro oggi.", attachments: [], isDeleted: false, createdAt: "2026-07-05T16:30", updatedAt: "2026-07-05T16:30" },
  { id: "msg3", conversationId: "conv1", authorId: "c1", authorRole: "client", content: "Confermo: si verifica solo su iOS 17 con Safari. Su Android e su Chrome desktop funziona perfettamente. Ho allegato uno screen recording.", attachments: [{ name: "screen-recording-ios.mp4", path: "conv1/screen-recording-ios.mp4", size: 2_400_000, type: "video/mp4" }], isDeleted: false, createdAt: "2026-07-07T10:30", updatedAt: "2026-07-07T10:30" },
  /* conv2 */
  { id: "msg4", conversationId: "conv2", authorId: "c1", authorRole: "client", content: "Vorremmo aggiornare il footer con i link ai nuovi social (TikTok, LinkedIn) e la P.IVA corretta: IT12345678901.", attachments: [], isDeleted: false, createdAt: "2026-07-04T11:00", updatedAt: "2026-07-04T11:00" },
  { id: "msg5", conversationId: "conv2", authorId: "admin", authorRole: "admin", content: "Fatto! Ho aggiornato il footer con i nuovi link social e la P.IVA. Controlla il sito e dimmi se è tutto corretto.", attachments: [], isDeleted: false, createdAt: "2026-07-06T15:00", updatedAt: "2026-07-06T15:00" },
  /* conv3 */
  { id: "msg6", conversationId: "conv3", authorId: "c2", authorRole: "client", content: "Abbiamo attivato l'account Stripe in modalità live. Come procediamo per integrarlo con il backend che avete sviluppato?", attachments: [], isDeleted: false, createdAt: "2026-07-07T09:00", updatedAt: "2026-07-07T09:00" },
  /* conv4 */
  { id: "msg7", conversationId: "conv4", authorId: "c1", authorRole: "client", content: "Il punteggio Lighthouse è sceso a 72. Ci sono ottimizzazioni che possiamo fare?", attachments: [], isDeleted: false, createdAt: "2026-06-25T10:00", updatedAt: "2026-06-25T10:00" },
  { id: "msg8", conversationId: "conv4", authorId: "admin", authorRole: "admin", content: "Abbiamo ottimizzato le immagini, implementato lazy loading e ridotto il JS non necessario. Il punteggio è ora 94. Chiudo questo thread.", attachments: [], isDeleted: false, createdAt: "2026-06-28T11:00", updatedAt: "2026-06-28T11:00" },
]

/* ── Conversation API ────────────────────────────────────────── */

export async function fetchConversations(clientId?: string): Promise<Conversation[]> {
  if (!SUPABASE_READY) {
    const list = clientId ? MOCK_CONVERSATIONS.filter(c => c.clientId === clientId) : MOCK_CONVERSATIONS
    return sortConversations(list)
  }
  /* ── Live query ────────────────────────────────────────────
  let q = supabase.from("conversations")
    .select("*, profiles!client_id(company_name)")
    .order("last_message_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return sortConversations((data ?? []).map(r => ({
    id: r.id, clientId: r.client_id, clientName: r.profiles?.company_name,
    subject: r.subject, status: r.status as ConversationStatus,
    lastMessageAt: r.last_message_at, createdAt: r.created_at, updatedAt: r.updated_at,
  })))
  ─────────────────────────────────────────────────────────── */
  const list = clientId ? MOCK_CONVERSATIONS.filter(c => c.clientId === clientId) : MOCK_CONVERSATIONS
  return sortConversations(list)
}

/** Active first (by recency), closed last */
function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    if (a.status === "closed" && b.status !== "closed") return 1
    if (b.status === "closed" && a.status !== "closed") return -1
    return b.lastMessageAt.localeCompare(a.lastMessageAt)
  })
}

export async function createConversation(payload: { clientId: string; subject: string }): Promise<Conversation> {
  const now = new Date().toISOString()
  const conv: Conversation = { id: `conv${Date.now()}`, clientId: payload.clientId, subject: payload.subject.trim(), status: "open", lastMessageAt: now, createdAt: now, updatedAt: now }
  if (!SUPABASE_READY) return conv
  /* ── Live mutation ─────────────────────────────────────────
  const { data, error } = await supabase.from("conversations")
    .insert({ client_id: payload.clientId, subject: payload.subject.trim() })
    .select().single()
  if (error) throw error
  return { id: data.id, clientId: data.client_id, subject: data.subject, status: data.status, lastMessageAt: data.last_message_at, createdAt: data.created_at, updatedAt: data.updated_at }
  ─────────────────────────────────────────────────────────── */
  return conv
}

export async function updateConversationStatus(id: string, status: ConversationStatus): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation ─────────────────────────────────────────
  const { error } = await supabase.from("conversations").update({ status }).eq("id", id)
  if (error) throw error
  ─────────────────────────────────────────────────────────── */
}

/* ── Message API ─────────────────────────────────────────────── */

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if (!SUPABASE_READY) return MOCK_MESSAGES.filter(m => m.conversationId === conversationId)
  /* ── Live query ────────────────────────────────────────────
  const { data, error } = await supabase.from("messages")
    .select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({ id: r.id, conversationId: r.conversation_id, authorId: r.author_id, authorRole: r.author_role, content: r.content, attachments: r.attachments ?? [], isDeleted: r.is_deleted, editedAt: r.edited_at ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at }))
  ─────────────────────────────────────────────────────────── */
  return MOCK_MESSAGES.filter(m => m.conversationId === conversationId)
}

export async function sendMessage(payload: { conversationId: string; authorId: string; authorRole: "admin" | "client"; content: string; attachments?: Attachment[] }): Promise<Message> {
  const now = new Date().toISOString()
  const msg: Message = { id: `msg${Date.now()}`, conversationId: payload.conversationId, authorId: payload.authorId, authorRole: payload.authorRole, content: payload.content.trim(), attachments: payload.attachments ?? [], isDeleted: false, createdAt: now, updatedAt: now }
  if (!SUPABASE_READY) return msg
  /* ── Live mutation ─────────────────────────────────────────
  const { data, error } = await supabase.from("messages")
    .insert({ conversation_id: payload.conversationId, author_id: payload.authorId, author_role: payload.authorRole, content: payload.content.trim(), attachments: payload.attachments ?? [] })
    .select().single()
  if (error) throw error
  return { id: data.id, conversationId: data.conversation_id, authorId: data.author_id, authorRole: data.author_role, content: data.content, attachments: data.attachments ?? [], isDeleted: data.is_deleted, editedAt: data.edited_at ?? undefined, createdAt: data.created_at, updatedAt: data.updated_at }
  ─────────────────────────────────────────────────────────── */
  return msg
}

export async function editMessage(id: string, content: string): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation ─────────────────────────────────────────
  const { error } = await supabase.from("messages").update({ content, edited_at: new Date().toISOString() }).eq("id", id)
  if (error) throw error
  ─────────────────────────────────────────────────────────── */
}

export async function deleteMessage(id: string): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation (soft delete) ───────────────────────────
  const { error } = await supabase.from("messages").update({ is_deleted: true, content: "" }).eq("id", id)
  if (error) throw error
  ─────────────────────────────────────────────────────────── */
}

/** Upload a file to Storage and return an Attachment object.
 *  Bucket: "message-attachments" (private, RLS on storage).
 *  Placeholder: Google Calendar sync block ↓
 *
 *  ── GOOGLE CALENDAR SYNC PLACEHOLDER ──────────────────────────
 *  To block admin's busy slots automatically:
 *  1. Create a Supabase Edge Function: supabase/functions/google-calendar-busy/index.ts
 *  2. Call Google Calendar API: POST https://www.googleapis.com/calendar/v3/freeBusy
 *     { timeMin, timeMax, items: [{ id: "primary" }] }
 *  3. Merge returned busy intervals with confirmed Supabase meetings
 *  4. Update fetchConfirmedSlots() to also call this Edge Function
 *  5. Store OAuth2 tokens in vault.secrets (never in client-side code)
 *  ─────────────────────────────────────────────────────────────
 */
export async function uploadAttachment(conversationId: string, file: File): Promise<Attachment> {
  const path = `${conversationId}/${Date.now()}-${file.name}`
  if (!SUPABASE_READY) {
    return { name: file.name, path, size: file.size, type: file.type }
  }
  /* ── Live upload ──────────────────────────────────────────
  const { error } = await supabase.storage.from("message-attachments").upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from("message-attachments").getPublicUrl(path)
  return { name: file.name, path, size: file.size, type: file.type, publicUrl: data.publicUrl }
  ─────────────────────────────────────────────────────────── */
  return { name: file.name, path, size: file.size, type: file.type }
}

/**
 * Fetch meetings for a specific client (cabinet view).
 * Supabase: RLS ensures only own meetings are returned.
 */
export async function fetchClientMeetings(clientId: string): Promise<Meeting[]> {
  if (!SUPABASE_READY) {
    return MOCK_MEETINGS.filter(m => m.clientId === clientId)
      .sort((a, b) => a.datetime.localeCompare(b.datetime))
  }
  /* ── Live query ────────────────────────────────────────────
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("datetime", { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id, clientId: r.client_id, proposedBy: r.proposed_by,
    datetime: r.datetime.slice(0, 16),  // "YYYY-MM-DDTHH:mm"
    durationMin: r.duration_min, status: r.status,
    adminNote: r.admin_note ?? undefined, clientNote: r.client_note ?? undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  })) as Meeting[]
  ─────────────────────────────────────────────────────────── */
  return MOCK_MEETINGS.filter(m => m.clientId === clientId)
    .sort((a, b) => a.datetime.localeCompare(b.datetime))
}

/**
 * Fetch ALL meetings — admin panel view.
 * Supabase: admin_all_meetings policy.
 */
export async function fetchAllMeetings(): Promise<Meeting[]> {
  if (!SUPABASE_READY) {
    return [...MOCK_MEETINGS].sort((a, b) => a.datetime.localeCompare(b.datetime))
  }
  /* ── Live query ────────────────────────────────────────────
  const { data, error } = await supabase
    .from("meetings")
    .select("*, profiles!client_id(company_name, contact_name)")
    .order("datetime", { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id, clientId: r.client_id,
    clientName: r.profiles?.company_name ?? r.client_id,
    proposedBy: r.proposed_by, datetime: r.datetime.slice(0, 16),
    durationMin: r.duration_min, status: r.status,
    adminNote: r.admin_note ?? undefined, clientNote: r.client_note ?? undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  })) as Meeting[]
  ─────────────────────────────────────────────────────────── */
  return [...MOCK_MEETINGS].sort((a, b) => a.datetime.localeCompare(b.datetime))
}

/**
 * Returns all CONFIRMED meeting datetimes for availability checking.
 * Supabase: calls get_confirmed_meeting_slots() RPC (SECURITY DEFINER, bypasses RLS).
 * Returns normalized strings "YYYY-MM-DDTHH:mm".
 */
export async function fetchConfirmedSlots(): Promise<Set<string>> {
  if (!SUPABASE_READY) {
    const slots = MOCK_MEETINGS
      .filter(m => m.status === "confirmed")
      .map(m => m.datetime.slice(0, 16))
    return new Set(slots)
  }
  /* ── Live RPC ──────────────────────────────────────────────
  const { data, error } = await supabase
    .rpc("get_confirmed_meeting_slots")
  if (error) throw error
  return new Set((data ?? []).map((r: { slot: string }) => r.slot.slice(0, 16)))
  ─────────────────────────────────────────────────────────── */
  const slots = MOCK_MEETINGS
    .filter(m => m.status === "confirmed")
    .map(m => m.datetime.slice(0, 16))
  return new Set(slots)
}

/**
 * Client proposes a meeting slot.
 * Supabase: RLS enforces proposed_by='client' and status='pending'.
 */
export async function proposeMeeting(payload: {
  clientId: string
  datetime: string
  clientNote?: string
}): Promise<Meeting> {
  const now = new Date().toISOString().slice(0, 10)
  const meeting: Meeting = {
    id: `m${Date.now()}`, clientId: payload.clientId,
    proposedBy: "client", datetime: payload.datetime,
    durationMin: 30, status: "pending",
    clientNote: payload.clientNote, createdAt: now, updatedAt: now,
  }
  if (!SUPABASE_READY) return meeting
  /* ── Live mutation ─────────────────────────────────────────
  const { data, error } = await supabase
    .from("meetings")
    .insert({ client_id: payload.clientId, proposed_by: "client",
              datetime: payload.datetime, client_note: payload.clientNote ?? null })
    .select().single()
  if (error) throw error
  return { ...meeting, id: data.id }
  ─────────────────────────────────────────────────────────── */
  return meeting
}

/**
 * Admin proposes a meeting to a client.
 * Supabase: admin_all_meetings policy.
 */
export async function adminProposeMeeting(payload: {
  clientId: string
  datetime: string
  adminNote?: string
}): Promise<Meeting> {
  const now = new Date().toISOString().slice(0, 10)
  const meeting: Meeting = {
    id: `m${Date.now()}`, clientId: payload.clientId,
    proposedBy: "admin", datetime: payload.datetime,
    durationMin: 30, status: "pending",
    adminNote: payload.adminNote, createdAt: now, updatedAt: now,
  }
  if (!SUPABASE_READY) return meeting
  /* ── Live mutation ─────────────────────────────────────────
  const { data, error } = await supabase
    .from("meetings")
    .insert({ client_id: payload.clientId, proposed_by: "admin",
              datetime: payload.datetime, admin_note: payload.adminNote ?? null })
    .select().single()
  if (error) throw error
  return { ...meeting, id: data.id }
  ─────────────────────────────────────────────────────────── */
  return meeting
}

/**
 * Update meeting status (confirm, cancel, reschedule).
 * Client: can only confirm/cancel admin proposals (enforced by RLS).
 * Admin: can update any status (enforced by admin_all_meetings policy).
 */
export async function updateMeetingStatus(
  meetingId: string,
  status: MeetingStatus,
  note?: string,
): Promise<void> {
  if (!SUPABASE_READY) return
  /* ── Live mutation ─────────────────────────────────────────
  const update: Record<string, unknown> = { status }
  if (note !== undefined) {
    // admin_note or client_note depending on caller — pass both for simplicity
    update.admin_note = note
  }
  const { error } = await supabase.from("meetings").update(update).eq("id", meetingId)
  if (error) throw error
  ─────────────────────────────────────────────────────────── */
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function fmtEur(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)
}

export function relativeDate(iso: string): string {
  const d = new Date(iso), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diff < 60)  return `${diff}m fa`
  if (diff < 1440) return `${Math.floor(diff / 60)}h fa`
  return `${Math.floor(diff / 1440)}g fa`
}
