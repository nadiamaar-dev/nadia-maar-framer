/**
 * adminApi.ts — Admin Panel data layer
 *
 * All functions query Supabase when SUPABASE_READY=true.
 * Falls back to typed mock data when env vars are not set (offline / CI).
 */

import { supabase, SUPABASE_READY } from "./supabase"
import { MOCK_CLIENTS, MOCK_KPI } from "../data/adminData"
import type { ClientRecord, AdminKpi, ClientPlan, ClientStatus } from "../data/adminData"

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */

export type TaskStatus    = "todo" | "in-progress" | "review" | "done"
export type TaskPhase     = "strategia" | "design" | "sviluppo" | "testing" | "deploy"
export type DocType       = "report" | "contract" | "invoice" | "other"
export type InvoiceAdminStatus = "draft" | "sent" | "paid" | "overdue"
export type TicketStatus  = "new" | "in-progress" | "resolved"
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
  pdfPath?: string
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

export type ProjectStatus   = "pending_approval" | "active" | "paused" | "completed"
export type MeetingStatus   = "pending" | "confirmed" | "cancelled" | "rescheduled"
export type MeetingProposer = "admin" | "client"

export interface Meeting {
  id: string
  clientId: string
  clientName?: string
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
  path: string
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
  adminNote?: string
  createdAt: string
  updatedAt: string
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA  (returned when SUPABASE_READY = false)
═══════════════════════════════════════════════════════════════ */

export const MOCK_TASKS: AdminTask[] = [
  /* ── Client c1 ────────────────────────────────────────────── */
  { id: "t1",  clientId: "c1", title: "Analisi & Briefing",              description: "Raccolta degli obiettivi, analisi del mercato di riferimento e definizione della roadmap operativa.", category: "Strategia", phase: "strategia", status: "done",        progress: 100, dueDate: "Gen 2025", createdAt: "2025-01-05", updatedAt: "2025-01-20" },
  { id: "t2",  clientId: "c1", title: "Design System & Identità Visiva",  description: "Palette cromatica, tipografia, iconografia e libreria di componenti UI riutilizzabili.",            category: "Design",    phase: "design",    status: "done",        progress: 100, dueDate: "Feb 2025", createdAt: "2025-01-21", updatedAt: "2025-02-28" },
  { id: "t3",  clientId: "c1", title: "Sviluppo Interfaccia Principale",  description: "Codice delle sezioni chiave, animazioni, interazioni e ottimizzazione delle performance.",           category: "Frontend",  phase: "sviluppo",  status: "in-progress", progress: 72,  dueDate: "Lug 2025", createdAt: "2025-03-01", updatedAt: "2025-07-01" },
  { id: "t4",  clientId: "c1", title: "Visibilità & Distribuzione",       description: "Ottimizzazione per i motori di ricerca, struttura URL canonici e integrazione canali di distribuzione.", category: "Marketing", phase: "sviluppo",  status: "todo",        progress: 0,   dueDate: "Ago 2025", createdAt: "2025-06-01", updatedAt: "2025-06-01" },
  /* ── Client c2 ────────────────────────────────────────────── */
  { id: "t5",  clientId: "c2", title: "Identità di Marca",                description: "Concept del marchio, declinazioni del logo, palette e manuale di stile applicativo.",               category: "Branding",  phase: "design",    status: "done",        progress: 100, dueDate: "Feb 2025", createdAt: "2025-02-01", updatedAt: "2025-02-25" },
  { id: "t6",  clientId: "c2", title: "Sviluppo Applicativo",             description: "Funzionalità core, gestione dello stato globale e integrazione con le API di terze parti.",         category: "Frontend",  phase: "sviluppo",  status: "in-progress", progress: 48,  dueDate: "Ago 2025", createdAt: "2025-03-10", updatedAt: "2025-07-03" },
  { id: "t7",  clientId: "c2", title: "Controllo Qualità & Compatibilità",description: "Test funzionali, verifica cross-browser, accessibilità WCAG e stress test sulle performance.",     category: "QA",        phase: "testing",   status: "todo",        progress: 0,   dueDate: "Set 2025", createdAt: "2025-06-15", updatedAt: "2025-06-15" },
  /* ── Client c3 ────────────────────────────────────────────── */
  { id: "t8",  clientId: "c3", title: "Pianificazione Strategica",        description: "Workshop collaborativi, definizione dei KPI di progetto e scelta dello stack tecnologico.",         category: "Strategia", phase: "strategia", status: "in-progress", progress: 60,  dueDate: "Lug 2025", createdAt: "2025-05-20", updatedAt: "2025-07-04" },
  { id: "t9",  clientId: "c3", title: "Pipeline Dati & Reportistica",     description: "Configurazione del tracciamento, costruzione delle dashboard e automazione dei report periodici.",  category: "Analytics", phase: "sviluppo",  status: "review",      progress: 85,  dueDate: "Ago 2025", createdAt: "2025-06-01", updatedAt: "2025-07-05" },
  /* ── Client c6 ────────────────────────────────────────────── */
  { id: "t10", clientId: "c6", title: "Architettura di Sistema",          description: "Progettazione dello schema dati, struttura delle API e scelte infrastrutturali.",                   category: "Backend",   phase: "strategia", status: "done",        progress: 100, dueDate: "Feb 2025", createdAt: "2025-01-15", updatedAt: "2025-02-20" },
  { id: "t11", clientId: "c6", title: "Integrazione Servizi Intelligenti",description: "Connessione con provider AI/ML, gestione dei prompt, caching e logica di fallback.",               category: "AI",        phase: "sviluppo",  status: "in-progress", progress: 55,  dueDate: "Ago 2025", createdAt: "2025-05-01", updatedAt: "2025-07-05" },
  { id: "t12", clientId: "c6", title: "Deploy & Rilascio Continuo",       description: "Pipeline di CI/CD, configurazione ambienti di staging/produzione e monitoraggio post-lancio.",     category: "DevOps",    phase: "deploy",    status: "todo",        progress: 0,   dueDate: "Ott 2025", createdAt: "2025-06-20", updatedAt: "2025-06-20" },
]

export const MOCK_DOCUMENTS: ClientDocument[] = [
  { id: "d1", clientId: "c1", name: "Contratto Progetto Nexus.pdf",     type: "contract", sizeBytes: 245_000,   uploadedAt: "2025-01-15", storagePath: "c1/contracts/contratto-nexus.pdf" },
  { id: "d2", clientId: "c1", name: "Report SEO Maggio 2025.pdf",       type: "report",   sizeBytes: 1_200_000, uploadedAt: "2025-06-02", storagePath: "c1/reports/seo-may25.pdf" },
  { id: "d3", clientId: "c2", name: "Brand Guidelines Arteca.pdf",      type: "report",   sizeBytes: 4_500_000, uploadedAt: "2025-03-10", storagePath: "c2/reports/brand-guidelines.pdf" },
  { id: "d4", clientId: "c3", name: "Contratto Meridia Consulting.pdf", type: "contract", sizeBytes: 310_000,   uploadedAt: "2025-05-22", storagePath: "c3/contracts/contratto-meridia.pdf" },
  { id: "d5", clientId: "c6", name: "Technical Spec Orbita Labs.pdf",   type: "report",   sizeBytes: 820_000,   uploadedAt: "2025-02-01", storagePath: "c6/reports/tech-spec.pdf" },
]

export const MOCK_ADMIN_INVOICES: AdminInvoice[] = [
  { id: "i1", clientId: "c1", number: "FAT-2025-001", description: "Fase 1 — Design System",  amount: 2800, currency: "EUR", status: "paid",    issuedAt: "2025-01-15", dueDate: "2025-01-31" },
  { id: "i2", clientId: "c1", number: "FAT-2025-002", description: "Fase 2 — Frontend Dev",   amount: 3500, currency: "EUR", status: "paid",    issuedAt: "2025-03-15", dueDate: "2025-03-31" },
  { id: "i3", clientId: "c1", number: "FAT-2025-003", description: "Fase 3 — Backend & CMS",  amount: 2200, currency: "EUR", status: "sent",    issuedAt: "2025-05-15", dueDate: "2025-06-15" },
  { id: "i4", clientId: "c2", number: "FAT-2025-004", description: "Branding Package",        amount: 1800, currency: "EUR", status: "paid",    issuedAt: "2025-02-20", dueDate: "2025-03-05" },
  { id: "i5", clientId: "c2", number: "FAT-2025-005", description: "Web App Sprint 1",        amount: 2400, currency: "EUR", status: "sent",    issuedAt: "2025-05-01", dueDate: "2025-06-01" },
  { id: "i6", clientId: "c2", number: "FAT-2025-006", description: "Web App Sprint 2",        amount: 2400, currency: "EUR", status: "overdue", issuedAt: "2025-06-15", dueDate: "2025-07-01" },
  { id: "i7", clientId: "c6", number: "FAT-2025-007", description: "Architettura SaaS",       amount: 4300, currency: "EUR", status: "sent",    issuedAt: "2025-05-10", dueDate: "2025-06-10" },
]

export const MOCK_TICKETS: SupportTicket[] = [
  { id: "tk1", clientId: "c2", clientName: "Arteca Studio",      subject: "Dashboard non carica i dati",     message: "Dopo l'ultimo aggiornamento la dashboard mostra un errore 500 sul caricamento delle statistiche. Browser: Chrome 124. Riproducibile al 100%.", priority: "high",     status: "in-progress", createdAt: "2025-07-05T09:14:00Z", adminNote: "Individuato problema nella query aggregazione. Fix in staging." },
  { id: "tk2", clientId: "c3", clientName: "Meridia Consulting", subject: "Impossibile accedere al cabinet", message: "Dopo il reset password ricevo un errore 'Invalid token' al momento del login. Ho provato su due browser diversi.", priority: "critical", status: "new",         createdAt: "2025-07-06T08:02:00Z" },
  { id: "tk3", clientId: "c3", clientName: "Meridia Consulting", subject: "Report di Maggio non visibile",   message: "Nel Centro Report vedo solo i report di Aprile. Quello di Maggio non compare nonostante sia stato caricato.", priority: "medium",   status: "new",         createdAt: "2025-07-04T15:30:00Z" },
  { id: "tk4", clientId: "c1", clientName: "Nexus Italia",       subject: "Richiesta aggiunta pagina FAQ",   message: "Vorremmo aggiungere una sezione FAQ all'interno della homepage, con accordion. È fattibile entro agosto?", priority: "low",      status: "resolved",    createdAt: "2025-06-20T11:00:00Z", adminNote: "Aggiunto nel backlog del prossimo sprint. Stimato 3h di lavoro.", respondedAt: "2025-06-21T10:00:00Z" },
  { id: "tk5", clientId: "c6", clientName: "Orbita Labs",        subject: "Rate limit API troppo restrittivo",message: "Il wrapper AI che avete implementato triggera il rate limit di OpenAI dopo 20 richieste/min. Dobbiamo aumentarlo a 60 RPM.", priority: "high",     status: "in-progress", createdAt: "2025-07-03T14:20:00Z", adminNote: "Implementando exponential backoff + request queue." },
]

export const MOCK_PROJECTS: ClientProject[] = [
  { id: "p1", clientId: "c1", name: "Sito Web Nexus Italia",     description: "Sviluppo del nuovo sito istituzionale con e-commerce integrato, ottimizzazione SEO e dashboard analytics personalizzata.", status: "active",           adminNote: "Progetto approvato. Siamo nella fase di sviluppo frontend.", createdAt: "2025-01-05", updatedAt: "2025-07-01" },
  { id: "p2", clientId: "c3", name: "Portale Analytics Meridia", description: "Dashboard personalizzata per il monitoraggio dei KPI aziendali e reportistica automatizzata mensile.",                   status: "pending_approval",                                                                                                      createdAt: "2025-05-20", updatedAt: "2025-05-20" },
]

export const MOCK_MEETINGS: Meeting[] = [
  { id: "m1", clientId: "c1", clientName: "Nexus Italia S.r.l.", proposedBy: "admin",  datetime: "2026-07-10T09:30", durationMin: 30, status: "pending",   adminNote: "Call di allineamento sullo sprint frontend.",    createdAt: "2026-07-07", updatedAt: "2026-07-07" },
  { id: "m2", clientId: "c2", clientName: "Arteca Studio",       proposedBy: "client", datetime: "2026-07-11T14:00", durationMin: 30, status: "pending",   clientNote: "Vorrei rivedere il mockup della dashboard.",    createdAt: "2026-07-06", updatedAt: "2026-07-06" },
  { id: "m3", clientId: "c1", clientName: "Nexus Italia S.r.l.", proposedBy: "admin",  datetime: "2026-07-08T10:00", durationMin: 30, status: "confirmed", adminNote: "Sprint review settimanale.",                     createdAt: "2026-07-05", updatedAt: "2026-07-06" },
  { id: "m4", clientId: "c6", clientName: "Orbita Labs",         proposedBy: "client", datetime: "2026-07-09T15:30", durationMin: 30, status: "confirmed", clientNote: "Revisione architettura AI layer.",              createdAt: "2026-07-03", updatedAt: "2026-07-04" },
  { id: "m5", clientId: "c2", clientName: "Arteca Studio",       proposedBy: "admin",  datetime: "2026-07-02T11:00", durationMin: 30, status: "confirmed", adminNote: "Kick-off progetto web app.",                     createdAt: "2026-06-30", updatedAt: "2026-07-01" },
]

export const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "conv1", clientId: "c1", clientName: "Nexus Italia S.r.l.", subject: "Bug: menu hamburger non si chiude su iOS",     status: "has_questions", lastMessageAt: "2026-07-07T10:30", createdAt: "2026-07-05", updatedAt: "2026-07-07" },
  { id: "conv2", clientId: "c1", clientName: "Nexus Italia S.r.l.", subject: "Aggiornamento footer — P.IVA e social",        status: "answered",      lastMessageAt: "2026-07-06T15:00", createdAt: "2026-07-04", updatedAt: "2026-07-06" },
  { id: "conv3", clientId: "c2", clientName: "Arteca Studio",        subject: "Integrazione Stripe — domande tecniche",      status: "open",          lastMessageAt: "2026-07-07T09:00", createdAt: "2026-07-07", updatedAt: "2026-07-07" },
  { id: "conv4", clientId: "c1", clientName: "Nexus Italia S.r.l.", subject: "Performance Lighthouse — ottimizzazioni",      status: "closed",        lastMessageAt: "2026-06-28T11:00", createdAt: "2026-06-25", updatedAt: "2026-06-28" },
]

export const MOCK_MESSAGES: Message[] = [
  { id: "msg1", conversationId: "conv1", authorId: "c1",    authorRole: "client", content: "Il menu hamburger su mobile non si chiude dopo aver cliccato un link di navigazione.", attachments: [], isDeleted: false, createdAt: "2026-07-05T14:00", updatedAt: "2026-07-05T14:00" },
  { id: "msg2", conversationId: "conv1", authorId: "admin", authorRole: "admin",  content: "Grazie per la segnalazione! Stiamo analizzando — probabilmente è un conflitto con il gestore degli eventi touch su Safari iOS. Ti aggiorno entro oggi.", attachments: [], isDeleted: false, createdAt: "2026-07-05T16:30", updatedAt: "2026-07-05T16:30" },
  { id: "msg3", conversationId: "conv1", authorId: "c1",    authorRole: "client", content: "Confermo: si verifica solo su iOS 17 con Safari. Su Android e su Chrome desktop funziona perfettamente. Ho allegato uno screen recording.", attachments: [{ name: "screen-recording-ios.mp4", path: "conv1/screen-recording-ios.mp4", size: 2_400_000, type: "video/mp4" }], isDeleted: false, createdAt: "2026-07-07T10:30", updatedAt: "2026-07-07T10:30" },
  { id: "msg4", conversationId: "conv2", authorId: "c1",    authorRole: "client", content: "Vorremmo aggiornare il footer con i link ai nuovi social (TikTok, LinkedIn) e la P.IVA corretta: IT12345678901.", attachments: [], isDeleted: false, createdAt: "2026-07-04T11:00", updatedAt: "2026-07-04T11:00" },
  { id: "msg5", conversationId: "conv2", authorId: "admin", authorRole: "admin",  content: "Fatto! Ho aggiornato il footer con i nuovi link social e la P.IVA. Controlla il sito e dimmi se è tutto corretto.", attachments: [], isDeleted: false, createdAt: "2026-07-06T15:00", updatedAt: "2026-07-06T15:00" },
  { id: "msg6", conversationId: "conv3", authorId: "c2",    authorRole: "client", content: "Abbiamo attivato l'account Stripe in modalità live. Come procediamo per integrarlo con il backend che avete sviluppato?", attachments: [], isDeleted: false, createdAt: "2026-07-07T09:00", updatedAt: "2026-07-07T09:00" },
  { id: "msg7", conversationId: "conv4", authorId: "c1",    authorRole: "client", content: "Il punteggio Lighthouse è sceso a 72. Ci sono ottimizzazioni che possiamo fare?", attachments: [], isDeleted: false, createdAt: "2026-06-25T10:00", updatedAt: "2026-06-25T10:00" },
  { id: "msg8", conversationId: "conv4", authorId: "admin", authorRole: "admin",  content: "Abbiamo ottimizzato le immagini, implementato lazy loading e ridotto il JS non necessario. Il punteggio è ora 94. Chiudo questo thread.", attachments: [], isDeleted: false, createdAt: "2026-06-28T11:00", updatedAt: "2026-06-28T11:00" },
]

/* ═══════════════════════════════════════════════════════════════
   PRIVATE ROW MAPPERS  (DB snake_case → TS camelCase)
═══════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTask(r: any): AdminTask {
  return {
    id:          r.id,
    clientId:    r.client_id,
    title:       r.title,
    description: r.description ?? "",
    category:    r.category ?? "",
    phase:       r.phase as TaskPhase,
    status:      r.status as TaskStatus,
    progress:    r.progress,
    dueDate:     r.due_date ?? undefined,
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocument(r: any): ClientDocument {
  return {
    id:          r.id,
    clientId:    r.client_id,
    name:        r.name,
    type:        r.type as DocType,
    sizeBytes:   r.size_bytes,
    uploadedAt:  r.uploaded_at,
    storagePath: r.storage_path,
    publicUrl:   r.public_url ?? undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvoice(r: any): AdminInvoice {
  return {
    id:          r.id,
    clientId:    r.client_id,
    number:      r.number,
    description: r.description ?? "",
    amount:      r.amount,
    currency:    r.currency ?? "EUR",
    status:      r.status as InvoiceAdminStatus,
    issuedAt:    r.issued_at,
    dueDate:     r.due_date,
    pdfPath:     r.pdf_path ?? undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTicket(r: any): SupportTicket {
  return {
    id:          r.id,
    clientId:    r.client_id,
    clientName:  r.client_name ?? "",
    subject:     r.subject,
    message:     r.message,
    priority:    r.priority as TicketPriority,
    status:      r.status as TicketStatus,
    createdAt:   r.created_at,
    adminNote:   r.admin_note ?? undefined,
    respondedAt: r.responded_at ?? undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(r: any): Message {
  return {
    id:             r.id,
    conversationId: r.conversation_id,
    authorId:       r.author_id,
    authorRole:     r.author_role as "admin" | "client",
    content:        r.content ?? "",
    attachments:    r.attachments ?? [],
    isDeleted:      r.is_deleted ?? false,
    editedAt:       r.edited_at ?? undefined,
    createdAt:      r.created_at,
    updatedAt:      r.updated_at,
  }
}

/* ═══════════════════════════════════════════════════════════════
   TASK API
   Table: client_tasks
═══════════════════════════════════════════════════════════════ */

export async function fetchTasks(clientId?: string): Promise<AdminTask[]> {
  if (!SUPABASE_READY) {
    return clientId ? MOCK_TASKS.filter(t => t.clientId === clientId) : MOCK_TASKS
  }
  let q = supabase.from("client_tasks").select("*").order("created_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapTask)
}

export async function createTask(payload: Omit<AdminTask, "id" | "createdAt" | "updatedAt">): Promise<AdminTask> {
  const now = new Date().toISOString().slice(0, 10)
  if (!SUPABASE_READY) {
    return { ...payload, id: `t${Date.now()}`, createdAt: now, updatedAt: now }
  }
  const { data, error } = await supabase
    .from("client_tasks")
    .insert({
      client_id:   payload.clientId,
      title:       payload.title,
      description: payload.description,
      category:    payload.category,
      phase:       payload.phase,
      status:      payload.status,
      progress:    payload.progress,
      due_date:    payload.dueDate ?? null,
    })
    .select().single()
  if (error) throw error
  return mapTask(data)
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<AdminTask, "status" | "progress" | "phase" | "title" | "description" | "dueDate">>
): Promise<void> {
  if (!SUPABASE_READY) return
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.status      !== undefined) dbPatch.status      = patch.status
  if (patch.progress    !== undefined) dbPatch.progress    = patch.progress
  if (patch.phase       !== undefined) dbPatch.phase       = patch.phase
  if (patch.title       !== undefined) dbPatch.title       = patch.title
  if (patch.description !== undefined) dbPatch.description = patch.description
  if (patch.dueDate     !== undefined) dbPatch.due_date    = patch.dueDate
  const { error } = await supabase.from("client_tasks").update(dbPatch).eq("id", id)
  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  if (!SUPABASE_READY) return
  const { error } = await supabase.from("client_tasks").delete().eq("id", id)
  if (error) throw error
}

/**
 * fetchTasksForClient — client cabinet (ProjectProgress).
 * RLS on client_tasks ensures only own rows are returned when authenticated.
 */
export async function fetchTasksForClient(clientId: string): Promise<AdminTask[]> {
  if (!SUPABASE_READY) {
    const tasks = MOCK_TASKS.filter(t => t.clientId === clientId)
    return tasks.length > 0 ? tasks : MOCK_TASKS.filter(t => t.clientId === "c1")
  }
  const { data, error } = await supabase
    .from("client_tasks")
    .select("*")
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapTask)
}

/**
 * updateTaskProgress — admin panel: update progress % and status only.
 */
export async function updateTaskProgress(
  taskId: string,
  progress: number,
  status: TaskStatus,
): Promise<void> {
  if (!SUPABASE_READY) return
  const { error } = await supabase
    .from("client_tasks")
    .update({ progress, status, updated_at: new Date().toISOString() })
    .eq("id", taskId)
  if (error) throw error
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT API
   Table: client_documents  |  Storage bucket: "client-documents"
═══════════════════════════════════════════════════════════════ */

export async function fetchDocuments(clientId?: string): Promise<ClientDocument[]> {
  if (!SUPABASE_READY) {
    return clientId ? MOCK_DOCUMENTS.filter(d => d.clientId === clientId) : MOCK_DOCUMENTS
  }
  let q = supabase.from("client_documents").select("*").order("uploaded_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapDocument)
}

export async function uploadDocument(
  clientId: string,
  file: File,
  type: DocType
): Promise<ClientDocument> {
  const storagePath = `${clientId}/${type}s/${Date.now()}-${file.name}`
  if (!SUPABASE_READY) {
    return { id: `d${Date.now()}`, clientId, name: file.name, type, sizeBytes: file.size, uploadedAt: new Date().toISOString().slice(0, 10), storagePath }
  }
  const { error: storageErr } = await supabase.storage
    .from("client-documents")
    .upload(storagePath, file, { upsert: false })
  if (storageErr) throw storageErr
  const { data, error } = await supabase
    .from("client_documents")
    .insert({ client_id: clientId, name: file.name, type, size_bytes: file.size, storage_path: storagePath })
    .select().single()
  if (error) throw error
  return mapDocument(data)
}

export async function deleteDocument(doc: ClientDocument): Promise<void> {
  if (!SUPABASE_READY) return
  await supabase.storage.from("client-documents").remove([doc.storagePath])
  await supabase.from("client_documents").delete().eq("id", doc.id)
}

export function getDocumentDownloadUrl(doc: ClientDocument): string {
  if (!SUPABASE_READY || !doc.storagePath) return "#"
  const { data } = supabase.storage.from("client-documents").getPublicUrl(doc.storagePath)
  return data.publicUrl
}

/* ═══════════════════════════════════════════════════════════════
   INVOICE API
   Table: client_invoices
═══════════════════════════════════════════════════════════════ */

export async function fetchInvoices(clientId?: string): Promise<AdminInvoice[]> {
  if (!SUPABASE_READY) {
    return clientId ? MOCK_ADMIN_INVOICES.filter(i => i.clientId === clientId) : MOCK_ADMIN_INVOICES
  }
  let q = supabase.from("client_invoices").select("*").order("issued_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapInvoice)
}

export async function createInvoice(payload: Omit<AdminInvoice, "id">): Promise<AdminInvoice> {
  if (!SUPABASE_READY) {
    return { ...payload, id: `i${Date.now()}` }
  }
  const { data, error } = await supabase
    .from("client_invoices")
    .insert({
      client_id:   payload.clientId,
      number:      payload.number,
      description: payload.description,
      amount:      payload.amount,
      currency:    payload.currency,
      status:      payload.status,
      issued_at:   payload.issuedAt,
      due_date:    payload.dueDate,
    })
    .select().single()
  if (error) throw error
  return mapInvoice(data)
}

export async function updateInvoiceStatus(id: string, status: InvoiceAdminStatus): Promise<void> {
  if (!SUPABASE_READY) return
  const { error } = await supabase.from("client_invoices").update({ status }).eq("id", id)
  if (error) throw error
}

/* ═══════════════════════════════════════════════════════════════
   TICKET API
   Table: support_tickets
═══════════════════════════════════════════════════════════════ */

export async function fetchTickets(status?: TicketStatus): Promise<SupportTicket[]> {
  if (!SUPABASE_READY) {
    return status ? MOCK_TICKETS.filter(t => t.status === status) : MOCK_TICKETS
  }
  let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false })
  if (status) q = q.eq("status", status)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapTicket)
}

export async function updateTicket(
  id: string,
  patch: { status?: TicketStatus; adminNote?: string }
): Promise<void> {
  if (!SUPABASE_READY) return
  const update: Record<string, unknown> = {}
  if (patch.status !== undefined) update.status = patch.status
  if (patch.adminNote !== undefined) {
    update.admin_note   = patch.adminNote
    update.responded_at = new Date().toISOString()
  }
  const { error } = await supabase.from("support_tickets").update(update).eq("id", id)
  if (error) throw error
}

/* ═══════════════════════════════════════════════════════════════
   PROJECT API
   Table: client_projects
═══════════════════════════════════════════════════════════════ */

export async function fetchClientProject(clientId: string): Promise<ClientProject | null> {
  if (!SUPABASE_READY) {
    return MOCK_PROJECTS.find(p => p.clientId === clientId) ?? null
  }
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
}

export async function createProject(payload: {
  clientId: string
  name: string
  description: string
}): Promise<ClientProject> {
  const now = new Date().toISOString().slice(0, 10)
  const optimistic: ClientProject = {
    id: `p${Date.now()}`, clientId: payload.clientId,
    name: payload.name.trim(), description: payload.description.trim(),
    status: "pending_approval", createdAt: now, updatedAt: now,
  }
  if (!SUPABASE_READY) return optimistic
  const { data, error } = await supabase
    .from("client_projects")
    .insert({ client_id: payload.clientId, name: payload.name.trim(), description: payload.description.trim() })
    .select().single()
  if (error) throw error
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
}

/* ═══════════════════════════════════════════════════════════════
   CRM API  (admin only)
   Queries: profiles + aggregates from other tables
═══════════════════════════════════════════════════════════════ */

export async function fetchClients(): Promise<ClientRecord[]> {
  if (!SUPABASE_READY) return MOCK_CLIENTS

  const [profilesRes, projectsRes, invoicesRes, ticketsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, company_name, contact_name, email, plan, status, joined_at, tags, updated_at")
      .eq("role", "client")
      .order("company_name"),
    supabase
      .from("client_projects")
      .select("client_id, status")
      .in("status", ["active", "pending_approval", "paused"]),
    supabase
      .from("client_invoices")
      .select("client_id, amount, status")
      .in("status", ["sent", "overdue"]),
    supabase
      .from("support_tickets")
      .select("client_id, status")
      .neq("status", "resolved"),
  ])

  if (profilesRes.error) throw profilesRes.error

  const profiles = profilesRes.data ?? []
  const projects = projectsRes.data ?? []
  const invoices = invoicesRes.data ?? []
  const tickets  = ticketsRes.data ?? []

  return profiles.map(p => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pi = invoices.filter((i: any) => i.client_id === p.id)
    return {
      id:                   p.id,
      company:              (p as Record<string, unknown>).company_name as string ?? "—",
      contact:              (p as Record<string, unknown>).contact_name as string ?? "—",
      email:                (p as Record<string, unknown>).email as string ?? "",
      plan:                 ((p as Record<string, unknown>).plan ?? "starter") as ClientPlan,
      status:               ((p as Record<string, unknown>).status ?? "active") as ClientStatus,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projectsActive:       projects.filter((pr: any) => pr.client_id === p.id).length,
      invoicesPending:      pi.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      invoicePendingAmount: pi.reduce((s: number, i: any) => s + (i.amount ?? 0), 0),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ticketsOpen:          tickets.filter((t: any) => t.client_id === p.id).length,
      joinedAt:             (p as Record<string, unknown>).joined_at as string ?? "",
      lastActivity:         relativeDate(
        (p as Record<string, unknown>).updated_at as string ?? new Date().toISOString()
      ),
      tags: Array.isArray((p as Record<string, unknown>).tags)
        ? (p as Record<string, unknown>).tags as string[]
        : [],
    }
  })
}

export async function fetchKpi(): Promise<AdminKpi> {
  if (!SUPABASE_READY) return MOCK_KPI
  const clients = await fetchClients()
  return {
    activeClients:        clients.filter(c => c.status === "active").length,
    projectsInProgress:   clients.reduce((s, c) => s + c.projectsActive, 0),
    invoicesPendingCount: clients.reduce((s, c) => s + c.invoicesPending, 0),
    invoicesPendingTotal: clients.reduce((s, c) => s + c.invoicePendingAmount, 0),
    ticketsOpen:          clients.reduce((s, c) => s + c.ticketsOpen, 0),
  }
}

/* ═══════════════════════════════════════════════════════════════
   MEETING API
   Table: meetings
   RPC:   get_confirmed_meeting_slots()
═══════════════════════════════════════════════════════════════ */

export async function fetchClientMeetings(clientId: string): Promise<Meeting[]> {
  if (!SUPABASE_READY) {
    return MOCK_MEETINGS.filter(m => m.clientId === clientId)
      .sort((a, b) => a.datetime.localeCompare(b.datetime))
  }
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("datetime", { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({
    id:          r.id,
    clientId:    r.client_id,
    proposedBy:  r.proposed_by as MeetingProposer,
    datetime:    (r.datetime as string).slice(0, 16),
    durationMin: r.duration_min,
    status:      r.status as MeetingStatus,
    adminNote:   r.admin_note ?? undefined,
    clientNote:  r.client_note ?? undefined,
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  }))
}

export async function fetchAllMeetings(): Promise<Meeting[]> {
  if (!SUPABASE_READY) {
    return [...MOCK_MEETINGS].sort((a, b) => a.datetime.localeCompare(b.datetime))
  }
  const { data, error } = await supabase
    .from("meetings")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("*, profiles!client_id(company_name)" as any)
    .order("datetime", { ascending: true })
  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id:          r.id,
    clientId:    r.client_id,
    clientName:  r.profiles?.company_name ?? r.client_id,
    proposedBy:  r.proposed_by as MeetingProposer,
    datetime:    (r.datetime as string).slice(0, 16),
    durationMin: r.duration_min,
    status:      r.status as MeetingStatus,
    adminNote:   r.admin_note ?? undefined,
    clientNote:  r.client_note ?? undefined,
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  }))
}

export async function fetchConfirmedSlots(): Promise<Set<string>> {
  if (!SUPABASE_READY) {
    return new Set(
      MOCK_MEETINGS.filter(m => m.status === "confirmed").map(m => m.datetime.slice(0, 16))
    )
  }
  const { data, error } = await supabase.rpc("get_confirmed_meeting_slots")
  if (error) throw error
  return new Set((data ?? []).map((r: { slot: string }) => r.slot.slice(0, 16)))
}

export async function proposeMeeting(payload: {
  clientId: string
  datetime: string
  clientNote?: string
}): Promise<Meeting> {
  const now = new Date().toISOString().slice(0, 10)
  const optimistic: Meeting = {
    id: `m${Date.now()}`, clientId: payload.clientId,
    proposedBy: "client", datetime: payload.datetime,
    durationMin: 30, status: "pending",
    clientNote: payload.clientNote, createdAt: now, updatedAt: now,
  }
  if (!SUPABASE_READY) return optimistic
  const { data, error } = await supabase
    .from("meetings")
    .insert({ client_id: payload.clientId, proposed_by: "client", datetime: payload.datetime, client_note: payload.clientNote ?? null })
    .select().single()
  if (error) throw error
  return { ...optimistic, id: data.id }
}

export async function adminProposeMeeting(payload: {
  clientId: string
  datetime: string
  adminNote?: string
}): Promise<Meeting> {
  const now = new Date().toISOString().slice(0, 10)
  const optimistic: Meeting = {
    id: `m${Date.now()}`, clientId: payload.clientId,
    proposedBy: "admin", datetime: payload.datetime,
    durationMin: 30, status: "pending",
    adminNote: payload.adminNote, createdAt: now, updatedAt: now,
  }
  if (!SUPABASE_READY) return optimistic
  const { data, error } = await supabase
    .from("meetings")
    .insert({ client_id: payload.clientId, proposed_by: "admin", datetime: payload.datetime, admin_note: payload.adminNote ?? null })
    .select().single()
  if (error) throw error
  return { ...optimistic, id: data.id }
}

export async function updateMeetingStatus(
  meetingId: string,
  status: MeetingStatus,
  note?: string,
): Promise<void> {
  if (!SUPABASE_READY) return
  const update: Record<string, unknown> = { status }
  if (note !== undefined) update.admin_note = note
  const { error } = await supabase.from("meetings").update(update).eq("id", meetingId)
  if (error) throw error
}

/* ═══════════════════════════════════════════════════════════════
   CONVERSATION API
   Table: conversations
═══════════════════════════════════════════════════════════════ */

export async function fetchConversations(clientId?: string): Promise<Conversation[]> {
  if (!SUPABASE_READY) {
    const list = clientId ? MOCK_CONVERSATIONS.filter(c => c.clientId === clientId) : MOCK_CONVERSATIONS
    return sortConversations(list)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = supabase.from("conversations").select("*, profiles!client_id(company_name)" as any)
    .order("last_message_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return sortConversations((data ?? []).map((r: any) => ({
    id:            r.id,
    clientId:      r.client_id,
    clientName:    r.profiles?.company_name ?? undefined,
    subject:       r.subject,
    status:        r.status as ConversationStatus,
    lastMessageAt: r.last_message_at,
    createdAt:     r.created_at,
    updatedAt:     r.updated_at,
  })))
}

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    if (a.status === "closed" && b.status !== "closed") return 1
    if (b.status === "closed" && a.status !== "closed") return -1
    return b.lastMessageAt.localeCompare(a.lastMessageAt)
  })
}

export async function createConversation(payload: { clientId: string; subject: string }): Promise<Conversation> {
  const now = new Date().toISOString()
  const optimistic: Conversation = {
    id: `conv${Date.now()}`, clientId: payload.clientId,
    subject: payload.subject.trim(), status: "open",
    lastMessageAt: now, createdAt: now, updatedAt: now,
  }
  if (!SUPABASE_READY) return optimistic
  const { data, error } = await supabase
    .from("conversations")
    .insert({ client_id: payload.clientId, subject: payload.subject.trim() })
    .select().single()
  if (error) throw error
  return {
    id:            data.id,
    clientId:      data.client_id,
    subject:       data.subject,
    status:        data.status as ConversationStatus,
    lastMessageAt: data.last_message_at,
    createdAt:     data.created_at,
    updatedAt:     data.updated_at,
  }
}

export async function updateConversationStatus(id: string, status: ConversationStatus): Promise<void> {
  if (!SUPABASE_READY) return
  const { error } = await supabase.from("conversations").update({ status }).eq("id", id)
  if (error) throw error
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE API
   Table: messages
═══════════════════════════════════════════════════════════════ */

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if (!SUPABASE_READY) return MOCK_MESSAGES.filter(m => m.conversationId === conversationId)
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapMessage)
}

export async function sendMessage(payload: {
  conversationId: string
  authorId: string
  authorRole: "admin" | "client"
  content: string
  attachments?: Attachment[]
}): Promise<Message> {
  const now = new Date().toISOString()
  const optimistic: Message = {
    id: `msg${Date.now()}`, conversationId: payload.conversationId,
    authorId: payload.authorId, authorRole: payload.authorRole,
    content: payload.content.trim(), attachments: payload.attachments ?? [],
    isDeleted: false, createdAt: now, updatedAt: now,
  }
  if (!SUPABASE_READY) return optimistic
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: payload.conversationId,
      author_id:       payload.authorId,
      author_role:     payload.authorRole,
      content:         payload.content.trim(),
      attachments:     payload.attachments ?? [],
    })
    .select().single()
  if (error) throw error
  return mapMessage(data)
}

export async function editMessage(id: string, content: string): Promise<void> {
  if (!SUPABASE_READY) return
  const { error } = await supabase
    .from("messages")
    .update({ content, edited_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

export async function deleteMessage(id: string): Promise<void> {
  if (!SUPABASE_READY) return
  const { error } = await supabase
    .from("messages")
    .update({ is_deleted: true, content: "" })
    .eq("id", id)
  if (error) throw error
}

/**
 * Upload a file to the "message-attachments" bucket and return metadata.
 *
 * ── GOOGLE CALENDAR SYNC PLACEHOLDER ─────────────────────────────
 * To block admin's busy slots automatically:
 * 1. Create an Edge Function: supabase/functions/google-calendar-busy/index.ts
 * 2. Call Google Calendar freeBusy API, merge with confirmed Supabase meetings
 * 3. Update fetchConfirmedSlots() to also call this function
 * 4. Store OAuth2 tokens in vault.secrets (never client-side)
 * ─────────────────────────────────────────────────────────────────
 */
export async function uploadAttachment(conversationId: string, file: File): Promise<Attachment> {
  const path = `${conversationId}/${Date.now()}-${file.name}`
  if (!SUPABASE_READY) {
    return { name: file.name, path, size: file.size, type: file.type }
  }
  const { error } = await supabase.storage.from("message-attachments").upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from("message-attachments").getPublicUrl(path)
  return { name: file.name, path, size: file.size, type: file.type, publicUrl: data.publicUrl }
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
  if (diff < 1)    return "Adesso"
  if (diff < 60)   return `${diff}m fa`
  if (diff < 1440) return `${Math.floor(diff / 60)}h fa`
  return `${Math.floor(diff / 1440)}g fa`
}
