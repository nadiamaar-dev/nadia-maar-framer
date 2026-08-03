-- ═══════════════════════════════════════════════════════════════════════
-- portal_15 — two client-side gaps
--
-- 1. A client could not cancel a meeting. Not even one they proposed
--    themselves: the UPDATE policy only matched rows the studio had
--    proposed and that were still pending. Plans change; this is the
--    single most-missed operation in the cabinet.
--
-- 2. A support ticket carried one admin_note, overwritten on every reply,
--    and the client had nowhere to answer. Tickets get a linked
--    conversation so the existing chat (attachments, unread markers,
--    admin notifications) does the talking.
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Meetings: the client may always cancel, may only confirm ours ────

drop policy if exists client_update_own_meetings on public.meetings;

create policy client_update_own_meetings on public.meetings
  for update
  using (
    client_id = auth.uid()
    and status in ('pending', 'confirmed')
  )
  with check (
    -- cancelling one's own meeting is always allowed
    status = 'cancelled'
    -- confirming only makes sense for a slot the studio proposed
    or (status = 'confirmed' and proposed_by = 'admin')
  );

-- WITH CHECK sees only the NEW row, so on its own the policy above would let
-- a client flip proposed_by to 'admin' and self-confirm in the same
-- statement. Pin everything a client has no business changing — same
-- approach as guard_profile_self_update.
--
-- Verified against the live database (in a rolled-back transaction):
--   client cancels own pending proposal      → allowed
--   client cancels a confirmed meeting       → allowed
--   client confirms a studio proposal        → allowed
--   client self-confirms by faking proposed_by → RLS violation
--   another client touches the same row      → 0 rows
create or replace function public.guard_meeting_client_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No end-user context (service role, table owner, migrations): not our
  -- business. Without this the guard silently reverted such writes instead
  -- of either allowing or refusing them.
  if auth.uid() is null then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;
  new.id           := old.id;
  new.client_id    := old.client_id;
  new.project_id   := old.project_id;
  new.proposed_by  := old.proposed_by;
  new.datetime     := old.datetime;
  new.duration_min := old.duration_min;
  new.admin_note   := old.admin_note;
  new.created_at   := old.created_at;
  return new;
end;
$$;

revoke execute on function public.guard_meeting_client_update() from public, anon, authenticated;

drop trigger if exists trg_guard_meeting_client_update on public.meetings;
create trigger trg_guard_meeting_client_update
  before update on public.meetings
  for each row execute function public.guard_meeting_client_update();

-- ── 2. Conversations may hang off a ticket ─────────────────────────────

alter table public.conversations
  add column if not exists ticket_id uuid references public.support_tickets(id) on delete cascade;

create index if not exists conversations_ticket_idx
  on public.conversations(ticket_id)
  where ticket_id is not null;

comment on column public.conversations.ticket_id is
  'Set when this thread is the discussion attached to a support ticket.';
