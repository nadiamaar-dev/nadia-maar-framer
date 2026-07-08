import { safeStorageName, supabase } from "./core"
import type { Attachment, Conversation, ConversationStatus, Message } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapConversation(r: any): Conversation {
  return {
    id: r.id,
    clientId: r.client_id,
    clientName: r.profiles?.company_name || r.profiles?.email || undefined,
    projectId: r.project_id ?? undefined,
    stageId: r.stage_id ?? undefined,
    subject: r.subject,
    status: r.status as ConversationStatus,
    lastMessageAt: r.last_message_at,
    clientLastReadAt: r.client_last_read_at,
    adminLastReadAt: r.admin_last_read_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function mapMessage(r: any): Message {
  return {
    id: r.id,
    conversationId: r.conversation_id,
    authorId: r.author_id,
    authorRole: r.author_role,
    content: r.content ?? "",
    attachments: r.attachments ?? [],
    isDeleted: r.is_deleted ?? false,
    editedAt: r.edited_at ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    if (a.status === "closed" && b.status !== "closed") return 1
    if (b.status === "closed" && a.status !== "closed") return -1
    return b.lastMessageAt.localeCompare(a.lastMessageAt)
  })
}

/** General inbox — stage discussions live inside the project dossier, not here. */
export async function fetchConversations(clientId?: string): Promise<Conversation[]> {
  let q = supabase
    .from("conversations")
    .select("*, profiles!client_id(company_name, email)" as any)
    .is("stage_id", null)
    .order("last_message_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return sortConversations((data ?? []).map(mapConversation))
}

/** All threads including stage discussions (action centers derive unread from this). */
export async function fetchThreads(clientId?: string): Promise<Conversation[]> {
  let q = supabase
    .from("conversations")
    .select("*, profiles!client_id(company_name, email)" as any)
    .order("last_message_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapConversation)
}

export function isUnreadFor(c: Conversation, role: "admin" | "client"): boolean {
  const readAt = role === "admin" ? c.adminLastReadAt : c.clientLastReadAt
  return !!c.lastMessageAt && (!readAt || c.lastMessageAt > readAt)
}

export async function createConversation(payload: { clientId: string; subject: string }): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ client_id: payload.clientId, subject: payload.subject.trim() })
    .select()
    .single()
  if (error) throw error
  return mapConversation(data)
}

/** One discussion thread per project stage, created lazily on first open. */
export async function getOrCreateStageConversation(payload: {
  projectId: string
  stageId: string
  clientId: string
  subject: string
}): Promise<Conversation> {
  const { data: existing, error: findErr } = await supabase
    .from("conversations")
    .select("*")
    .eq("stage_id", payload.stageId)
    .limit(1)
    .maybeSingle()
  if (findErr) throw findErr
  if (existing) return mapConversation(existing)
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      client_id: payload.clientId,
      project_id: payload.projectId,
      stage_id: payload.stageId,
      subject: payload.subject.trim(),
    })
    .select()
    .single()
  if (error) throw error
  return mapConversation(data)
}

export async function updateConversationStatus(id: string, status: ConversationStatus): Promise<void> {
  const { error } = await supabase.from("conversations").update({ status }).eq("id", id)
  if (error) throw error
}

/** RPC: stamps the caller's read marker with server-side now() (clock-skew safe, RLS-validated). */
export async function markConversationRead(id: string): Promise<void> {
  const { error } = await supabase.rpc("mark_conversation_read", { p_conversation: id })
  if (error) throw error
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
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
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: payload.conversationId,
      author_id: payload.authorId,
      author_role: payload.authorRole,
      content: payload.content.trim(),
      attachments: payload.attachments ?? [],
    })
    .select()
    .single()
  if (error) throw error
  return mapMessage(data)
}

export async function editMessage(id: string, content: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ content, edited_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

/** Soft delete — keeps the bubble as a tombstone in the thread. */
export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ is_deleted: true, content: "" })
    .eq("id", id)
  if (error) throw error
}

export async function uploadAttachment(conversationId: string, file: File): Promise<Attachment> {
  const path = `${conversationId}/${Date.now()}-${safeStorageName(file.name)}`
  const { error } = await supabase.storage.from("message-attachments").upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from("message-attachments").getPublicUrl(path)
  return { name: file.name, path, size: file.size, type: file.type, publicUrl: data.publicUrl }
}
