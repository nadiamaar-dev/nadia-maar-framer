import { supabase } from "./core"
import type { Meeting, MeetingProposer, MeetingStatus } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapMeeting(r: any): Meeting {
  return {
    id: r.id,
    clientId: r.client_id,
    clientName: r.profiles?.company_name || r.profiles?.email || undefined,
    projectId: r.project_id ?? undefined,
    proposedBy: r.proposed_by as MeetingProposer,
    datetime: (r.datetime as string).slice(0, 16),
    durationMin: r.duration_min,
    status: r.status as MeetingStatus,
    adminNote: r.admin_note ?? undefined,
    clientNote: r.client_note ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function fetchClientMeetings(clientId: string): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("client_id", clientId)
    .order("datetime", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapMeeting)
}

export async function fetchAllMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select("*, profiles!client_id(company_name, email)" as any)
    .order("datetime", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapMeeting)
}

export async function fetchMeetingsByProject(projectId: string): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("project_id", projectId)
    .order("datetime", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapMeeting)
}

/** Slots already confirmed (both roles use this to avoid double-booking). */
export async function fetchConfirmedSlots(): Promise<Set<string>> {
  const { data, error } = await supabase.rpc("get_confirmed_meeting_slots")
  if (error) throw error
  return new Set((data ?? []).map((r: { slot: string }) => r.slot.slice(0, 16)))
}

export async function proposeMeeting(payload: {
  clientId: string
  proposedBy: MeetingProposer
  datetime: string
  note?: string
  projectId?: string
}): Promise<Meeting> {
  const { data, error } = await supabase
    .from("meetings")
    .insert({
      client_id: payload.clientId,
      project_id: payload.projectId ?? null,
      proposed_by: payload.proposedBy,
      datetime: payload.datetime,
      [payload.proposedBy === "admin" ? "admin_note" : "client_note"]: payload.note?.trim() || null,
    })
    .select()
    .single()
  if (error) throw error
  return mapMeeting(data)
}

export async function updateMeetingStatus(meetingId: string, status: MeetingStatus, adminNote?: string): Promise<void> {
  const patch: Record<string, unknown> = { status }
  if (adminNote !== undefined) patch.admin_note = adminNote
  const { error } = await supabase.from("meetings").update(patch).eq("id", meetingId)
  if (error) throw error
}
