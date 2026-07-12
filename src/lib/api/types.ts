/* ── Clients (CRM) ─────────────────────────────────────────── */
export type ClientPlan = "starter" | "pro" | "enterprise"
export type ClientStatus = "active" | "onboarding" | "paused"

export interface ClientRecord {
  id: string
  company: string
  contact: string
  email: string
  phone?: string
  plan: ClientPlan
  status: ClientStatus
  projectsActive: number
  invoicesPending: number
  invoicePendingAmount: number
  ticketsOpen: number
  joinedAt: string
  updatedAt: string
  tags: string[]
}

export interface OwnProfile {
  id: string
  email: string
  companyName?: string
  contactName?: string
  phone?: string
}

export interface AdminKpi {
  activeClients: number
  projectsInProgress: number
  invoicesPendingCount: number
  invoicesPendingTotal: number
  ticketsOpen: number
}

/* ── Projects & stages ─────────────────────────────────────── */
export type ProjectStatus = "pending_approval" | "active" | "paused" | "completed"

/** Structured onboarding brief captured when the client submits a project. */
export interface ProjectBrief {
  projectType?: string
  budgetRange?: string
  deadline?: string
  goals?: string
  references?: string
}

export interface ClientProject {
  id: string
  clientId: string
  name: string
  description: string
  status: ProjectStatus
  brief: ProjectBrief
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export interface AdminProject extends ClientProject {
  clientName: string
  clientEmail: string
}

export type StageStatus = "locked" | "active" | "done"
export type ApprovalState = "none" | "requested" | "approved"

export interface ProjectStage {
  id: string
  projectId: string
  key: string
  title: string
  orderIndex: number
  status: StageStatus
  approvalState: ApprovalState
  progress: number
  deliverableUrl?: string
  deliverableNote?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

/* ── Project events (the journal) ──────────────────────────── */
export type EventType =
  | "project_submitted" | "project_approved" | "project_paused" | "project_resumed" | "project_completed"
  | "stage_started" | "stage_completed" | "approval_requested" | "approval_granted"
  | "invoice_issued" | "invoice_paid" | "invoice_overdue" | "payment_declared"
  | "meeting_proposed" | "meeting_confirmed" | "meeting_cancelled" | "meeting_rescheduled"
  | "document_shared" | "document_signed" | "credentials_released"
  | "note"

export interface ProjectEvent {
  id: string
  projectId: string
  clientId: string
  actorRole: "admin" | "client" | "system"
  type: EventType
  title: string
  detail?: string
  createdAt: string
  projectName?: string
  clientName?: string
}

/* ── Meetings ──────────────────────────────────────────────── */
export type MeetingStatus = "pending" | "confirmed" | "cancelled" | "rescheduled"
export type MeetingProposer = "admin" | "client"

export interface Meeting {
  id: string
  clientId: string
  clientName?: string
  projectId?: string
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

/* ── Conversations & messages ──────────────────────────────── */
export type ConversationStatus = "open" | "answered" | "has_questions" | "closed"

export interface Conversation {
  id: string
  clientId: string
  clientName?: string
  projectId?: string
  stageId?: string
  subject: string
  status: ConversationStatus
  lastMessageAt: string
  clientLastReadAt: string
  adminLastReadAt: string
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  name: string
  path: string
  size: number
  type: string
  publicUrl?: string
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

/* ── Billing ───────────────────────────────────────────────── */
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue"

export interface Invoice {
  id: string
  clientId: string
  projectId?: string
  stageId?: string
  number: string
  description: string
  amount: number
  currency: string
  status: InvoiceStatus
  issuedAt: string
  dueDate?: string
  pdfPath?: string
  /** Set when the client declares they have paid; admin confirms → status "paid". */
  clientMarkedPaidAt?: string
}

export type DocType = "report" | "contract" | "invoice" | "handover" | "other"

export interface ClientDocument {
  id: string
  clientId: string
  projectId?: string
  name: string
  type: DocType
  sizeBytes: number
  uploadedAt: string
  storagePath: string
  publicUrl?: string
  requiresSignature: boolean
  signedAt?: string
}

/* ── Support tickets ───────────────────────────────────────── */
export type TicketStatus = "new" | "in-progress" | "resolved"
export type TicketPriority = "low" | "medium" | "high" | "critical"

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
  /** Optional quote for the requested work (Fase 6). */
  estimateAmount?: number
  estimateHours?: number
}

/* ── Handover: credentials & resources (Fase 5) ────────────── */
export type CredentialKind = "access" | "resource"

export interface ProjectCredential {
  id: string
  projectId: string
  clientId: string
  kind: CredentialKind
  label: string
  url?: string
  username?: string
  secret?: string
  note?: string
  releasedAt?: string
  createdAt: string
  updatedAt: string
}

/* ── Client-supplied assets (materials) ────────────────────── */
export type AssetUploader = "client" | "admin"

export interface ClientAsset {
  id: string
  clientId: string
  projectId?: string
  name: string
  storagePath: string
  mime?: string
  sizeBytes: number
  uploadedBy: AssetUploader
  createdAt: string
}

/* ── Audit trail (legal record of client actions) ──────────── */
export interface AuditLog {
  id: string
  actorId?: string
  actorRole: "admin" | "client" | "system"
  action: string
  entityType?: string
  entityId?: string
  projectId?: string
  clientId?: string
  ip?: string
  userAgent?: string
  detail: Record<string, unknown>
  createdAt: string
}

/* ── Action center ─────────────────────────────────────────── */
export type ActionKind =
  | "start_project" | "approve_stage" | "pay_invoice" | "confirm_meeting" | "unread_chat" | "sign_document"
  | "review_project" | "reply_ticket" | "answer_chat" | "overdue_invoice" | "confirm_payment"

export interface PortalAction {
  id: string
  kind: ActionKind
  label: string
  sublabel?: string
  /** Nav section the action links to */
  section: string
  projectId?: string
}
