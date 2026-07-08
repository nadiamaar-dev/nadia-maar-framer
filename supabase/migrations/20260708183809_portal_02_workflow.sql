-- ============================================================
-- PORTAL 02 · WORKFLOW ENGINE
-- project_events journal · stage approval gates · unread markers
-- milestone invoices · auto-advance / auto-complete · realtime
-- ============================================================

-- ── 1 · PROJECT EVENTS (the project journal) ────────────────
create table public.project_events (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.client_projects(id) on delete cascade,
  client_id   uuid not null references public.profiles(id) on delete cascade,
  actor_role  text not null default 'system' check (actor_role in ('admin','client','system')),
  type        text not null check (type in (
    'project_submitted','project_approved','project_paused','project_resumed','project_completed',
    'stage_started','stage_completed','approval_requested','approval_granted',
    'invoice_issued','invoice_paid','invoice_overdue',
    'meeting_proposed','meeting_confirmed','meeting_cancelled','meeting_rescheduled','note')),
  title       text not null,
  detail      text,
  created_at  timestamptz not null default now()
);

alter table public.project_events enable row level security;
create policy pe_client_select on public.project_events for select using (client_id = auth.uid());
create policy pe_admin_all on public.project_events for all using (public.is_admin()) with check (public.is_admin());

create index project_events_project_idx on public.project_events (project_id, created_at desc);
create index project_events_client_idx  on public.project_events (client_id, created_at desc);

-- ── 2 · SCHEMA ADDITIONS ────────────────────────────────────
alter table public.project_stages
  add column approval_state   text not null default 'none' check (approval_state in ('none','requested','approved')),
  add column deliverable_url  text,
  add column deliverable_note text;

alter table public.conversations
  add column client_last_read_at timestamptz not null default now(),
  add column admin_last_read_at  timestamptz not null default now();

alter table public.client_invoices
  add column stage_id uuid references public.project_stages(id) on delete set null;
create index if not exists client_invoices_stage_idx on public.client_invoices (stage_id);

-- ── 3 · EVENT LOGGING (security definer, pinned search_path) ─
create or replace function public.actor_role_now() returns text
language sql stable security definer set search_path = public as $$
  select case when auth.uid() is null then 'system'
              when public.is_admin() then 'admin'
              else 'client' end;
$$;
revoke execute on function public.actor_role_now() from public, anon, authenticated;

create or replace function public.log_project_event(
  p_project uuid, p_client uuid, p_type text, p_title text, p_detail text default null
) returns void language sql security definer set search_path = public as $$
  insert into public.project_events (project_id, client_id, actor_role, type, title, detail)
  values (p_project, p_client, public.actor_role_now(), p_type, p_title, nullif(p_detail, ''));
$$;
revoke execute on function public.log_project_event(uuid,uuid,text,text,text) from public, anon, authenticated;

create or replace function public.trg_project_events() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_project_event(new.id, new.client_id, 'project_submitted', 'Progetto inviato: '||new.name, new.description);
  elsif new.status is distinct from old.status then
    if new.status = 'active' and old.status = 'pending_approval' then
      perform public.log_project_event(new.id, new.client_id, 'project_approved', 'Progetto approvato: '||new.name, new.admin_note);
    elsif new.status = 'active' and old.status = 'paused' then
      perform public.log_project_event(new.id, new.client_id, 'project_resumed', 'Progetto ripreso: '||new.name, null);
    elsif new.status = 'paused' then
      perform public.log_project_event(new.id, new.client_id, 'project_paused', 'Progetto in pausa: '||new.name, null);
    elsif new.status = 'completed' then
      perform public.log_project_event(new.id, new.client_id, 'project_completed', 'Progetto completato: '||new.name, null);
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.trg_project_events() from public, anon, authenticated;
create trigger project_events_log after insert or update of status on public.client_projects
  for each row execute function public.trg_project_events();

create or replace function public.trg_stage_events() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_client uuid;
begin
  select client_id into v_client from public.client_projects where id = new.project_id;
  if v_client is null then return new; end if;
  if new.status is distinct from old.status then
    if new.status = 'active' then
      perform public.log_project_event(new.project_id, v_client, 'stage_started', 'Fase avviata: '||new.title, null);
    elsif new.status = 'done' then
      perform public.log_project_event(new.project_id, v_client, 'stage_completed', 'Fase completata: '||new.title, null);
    end if;
  end if;
  if new.approval_state is distinct from old.approval_state then
    if new.approval_state = 'requested' then
      perform public.log_project_event(new.project_id, v_client, 'approval_requested', 'Approvazione richiesta: '||new.title, new.deliverable_note);
    elsif new.approval_state = 'approved' then
      perform public.log_project_event(new.project_id, v_client, 'approval_granted', 'Fase approvata: '||new.title, null);
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.trg_stage_events() from public, anon, authenticated;
create trigger stage_events_log after update on public.project_stages
  for each row execute function public.trg_stage_events();

create or replace function public.trg_invoice_events() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_detail text;
begin
  if new.project_id is null then return new; end if;
  v_detail := new.amount::text || ' ' || new.currency;
  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      perform public.log_project_event(new.project_id, new.client_id, 'invoice_issued', 'Fattura emessa: '||new.number, v_detail);
    end if;
  elsif new.status is distinct from old.status then
    if new.status = 'sent' and old.status = 'draft' then
      perform public.log_project_event(new.project_id, new.client_id, 'invoice_issued', 'Fattura emessa: '||new.number, v_detail);
    elsif new.status = 'paid' then
      perform public.log_project_event(new.project_id, new.client_id, 'invoice_paid', 'Fattura saldata: '||new.number, v_detail);
    elsif new.status = 'overdue' then
      perform public.log_project_event(new.project_id, new.client_id, 'invoice_overdue', 'Fattura scaduta: '||new.number, v_detail);
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.trg_invoice_events() from public, anon, authenticated;
create trigger invoice_events_log after insert or update of status on public.client_invoices
  for each row execute function public.trg_invoice_events();

create or replace function public.trg_meeting_events() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_when text;
begin
  if new.project_id is null then return new; end if;
  v_when := to_char(new.datetime at time zone 'Europe/Rome', 'DD/MM/YYYY HH24:MI');
  if tg_op = 'INSERT' then
    perform public.log_project_event(new.project_id, new.client_id, 'meeting_proposed', 'Riunione proposta: '||v_when, coalesce(new.client_note, new.admin_note));
  elsif new.status is distinct from old.status then
    if new.status = 'confirmed' then
      perform public.log_project_event(new.project_id, new.client_id, 'meeting_confirmed', 'Riunione confermata: '||v_when, null);
    elsif new.status = 'cancelled' then
      perform public.log_project_event(new.project_id, new.client_id, 'meeting_cancelled', 'Riunione annullata: '||v_when, null);
    elsif new.status = 'rescheduled' then
      perform public.log_project_event(new.project_id, new.client_id, 'meeting_rescheduled', 'Riunione da riprogrammare: '||v_when, null);
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.trg_meeting_events() from public, anon, authenticated;
create trigger meeting_events_log after insert or update of status on public.meetings
  for each row execute function public.trg_meeting_events();

-- ── 4 · STAGE FLOW (atomic advance via RPC, not client-side updates) ─
create or replace function public.complete_project_if_done(p_project uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.project_stages where project_id = p_project and status <> 'done') then
    update public.client_projects set status = 'completed' where id = p_project and status = 'active';
  end if;
end $$;
revoke execute on function public.complete_project_if_done(uuid) from public, anon, authenticated;

create or replace function public.advance_stage_core(p_project uuid, p_stage uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.project_stages set status = 'done', completed_at = now()
   where id = p_stage and project_id = p_project and status <> 'done';
  update public.project_stages set status = 'active', started_at = coalesce(started_at, now())
   where id = (select id from public.project_stages
                where project_id = p_project and status = 'locked'
                order by order_index limit 1);
  perform public.complete_project_if_done(p_project);
end $$;
revoke execute on function public.advance_stage_core(uuid,uuid) from public, anon, authenticated;

-- Client (or admin) approves a requested deliverable → stage closes, next unlocks
create or replace function public.approve_stage(p_stage uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v record;
begin
  select ps.id, ps.project_id, ps.approval_state, cp.client_id
    into v
    from public.project_stages ps
    join public.client_projects cp on cp.id = ps.project_id
   where ps.id = p_stage;
  if not found then raise exception 'Stage not found'; end if;
  if v.client_id <> auth.uid() and not public.is_admin() then raise exception 'Not allowed'; end if;
  if v.approval_state <> 'requested' then raise exception 'No approval requested for this stage'; end if;
  update public.project_stages set approval_state = 'approved' where id = p_stage;
  perform public.advance_stage_core(v.project_id, p_stage);
end $$;
revoke execute on function public.approve_stage(uuid) from public, anon;
grant execute on function public.approve_stage(uuid) to authenticated;

-- Admin-only manual advance (stages without an approval gate)
create or replace function public.advance_stage(p_stage uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_project uuid;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  select project_id into v_project from public.project_stages where id = p_stage;
  if v_project is null then raise exception 'Stage not found'; end if;
  perform public.advance_stage_core(v_project, p_stage);
end $$;
revoke execute on function public.advance_stage(uuid) from public, anon;
grant execute on function public.advance_stage(uuid) to authenticated;

-- ── 5 · REALTIME ────────────────────────────────────────────
alter publication supabase_realtime add table public.project_events;
alter publication supabase_realtime add table public.client_invoices;
alter publication supabase_realtime add table public.client_documents;