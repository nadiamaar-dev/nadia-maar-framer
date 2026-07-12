-- ============================================================
-- PORTAL 12 · REVISION LOOP · TICKET↔PROJECT · ESTIMATE ACCEPT
-- Closes the audit gaps:
--  A) client can request changes on a stage awaiting approval
--  B) support tickets are tied to a project
--  C) client can accept a quoted estimate on a ticket
-- ============================================================

-- ── A · STAGE REVISION LOOP ─────────────────────────────────
alter table public.project_stages
  add column if not exists revision_note text;

alter table public.project_stages drop constraint if exists project_stages_approval_state_check;
alter table public.project_stages add constraint project_stages_approval_state_check
  check (approval_state in ('none','requested','approved','changes_requested'));

alter table public.project_events drop constraint if exists project_events_type_check;
alter table public.project_events add constraint project_events_type_check check (type in (
  'project_submitted','project_approved','project_paused','project_resumed','project_completed',
  'stage_started','stage_completed','approval_requested','approval_granted','changes_requested',
  'invoice_issued','invoice_paid','invoice_overdue','payment_declared',
  'meeting_proposed','meeting_confirmed','meeting_cancelled','meeting_rescheduled',
  'document_shared','document_signed','credentials_released','note'));

-- Client (or admin) asks for changes on a stage that is awaiting approval.
create or replace function public.request_stage_changes(p_stage uuid, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare v record;
begin
  select ps.id, ps.project_id, ps.approval_state, ps.title, cp.client_id
    into v from public.project_stages ps
    join public.client_projects cp on cp.id = ps.project_id
   where ps.id = p_stage;
  if not found then raise exception 'Stage not found'; end if;
  if v.client_id <> auth.uid() and not public.is_admin() then raise exception 'Not allowed'; end if;
  if v.approval_state <> 'requested' then raise exception 'No approval pending on this stage'; end if;
  update public.project_stages
     set approval_state = 'changes_requested', revision_note = nullif(trim(p_note), '')
   where id = p_stage;
  perform public.log_project_event(v.project_id, v.client_id, 'changes_requested',
    'Modifiche richieste: '||v.title, nullif(trim(p_note), ''));
  perform public.log_audit('stage_changes_requested', 'project_stage', p_stage, v.project_id, v.client_id,
    jsonb_build_object('title', v.title, 'note', p_note));
end $$;
revoke execute on function public.request_stage_changes(uuid,text) from public, anon;
grant  execute on function public.request_stage_changes(uuid,text) to authenticated;

-- ── B · TICKETS TIED TO A PROJECT ───────────────────────────
alter table public.support_tickets
  add column if not exists project_id uuid references public.client_projects(id) on delete set null;
create index if not exists support_tickets_project_idx on public.support_tickets (project_id);

-- ── C · ESTIMATE ACCEPTANCE ─────────────────────────────────
alter table public.support_tickets
  add column if not exists estimate_accepted_at timestamptz;

create or replace function public.accept_ticket_estimate(p_ticket uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v record;
begin
  select t.id, t.client_id, t.subject, t.estimate_amount, t.estimate_accepted_at
    into v from public.support_tickets t where t.id = p_ticket;
  if not found then raise exception 'Ticket not found'; end if;
  if v.client_id <> auth.uid() then raise exception 'Not allowed'; end if;
  if v.estimate_amount is null then raise exception 'No estimate to accept'; end if;
  if v.estimate_accepted_at is not null then return; end if;
  update public.support_tickets set estimate_accepted_at = now() where id = p_ticket;
  perform public.log_audit('estimate_accepted', 'ticket', p_ticket, null, v.client_id,
    jsonb_build_object('subject', v.subject, 'amount', v.estimate_amount));
end $$;
revoke execute on function public.accept_ticket_estimate(uuid) from public, anon;
grant  execute on function public.accept_ticket_estimate(uuid) to authenticated;
