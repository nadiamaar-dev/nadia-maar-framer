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
