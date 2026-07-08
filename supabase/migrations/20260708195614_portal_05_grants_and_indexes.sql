-- ═══ portal_05: function grant hygiene + index dedupe ═══════════

-- Trigger-internal functions: never callable via the REST API.
revoke execute on function public.seed_project_stages(uuid) from public, anon, authenticated;
revoke execute on function public.on_project_activated() from public, anon, authenticated;

-- Workflow RPCs: signed-in users only. Each has an internal role guard
-- (advance_stage → admin only; approve_stage → owning client or admin;
--  mark_conversation_read → participant only).
revoke execute on function public.advance_stage(uuid) from public, anon;
grant  execute on function public.advance_stage(uuid) to authenticated;

revoke execute on function public.approve_stage(uuid) from public, anon;
grant  execute on function public.approve_stage(uuid) to authenticated;

revoke execute on function public.mark_conversation_read(uuid) from public, anon;
grant  execute on function public.mark_conversation_read(uuid) to authenticated;

revoke execute on function public.get_confirmed_meeting_slots(timestamptz, timestamptz) from public, anon;
grant  execute on function public.get_confirmed_meeting_slots(timestamptz, timestamptz) to authenticated;

-- is_admin() stays broadly executable: RLS policies evaluate it in the
-- caller's context and it only reports the caller's own role.

-- Duplicate indexes (advisor: duplicate_index) — identical definitions.
drop index if exists public.idx_conversations_client_last;
drop index if exists public.conversations_stage_idx;
drop index if exists public.idx_conversations_status_date;
drop index if exists public.idx_messages_conversation_date;
drop index if exists public.messages_conversation_created_idx;
drop index if exists public.project_stages_project_idx;

-- Missing FK index (advisor: unindexed_foreign_keys).
create index if not exists idx_messages_author on public.messages (author_id);
