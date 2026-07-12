-- ============================================================
-- PORTAL 08 · CERTIFICATION (ТЗ gap closure)
-- Structured brief · document sign-off · payment declaration
-- ticket estimates · handover credentials vault · client assets
-- ============================================================

-- ── 1 · EVENT VOCABULARY EXTENSION ──────────────────────────
alter table public.project_events drop constraint if exists project_events_type_check;
alter table public.project_events add constraint project_events_type_check check (type in (
  'project_submitted','project_approved','project_paused','project_resumed','project_completed',
  'stage_started','stage_completed','approval_requested','approval_granted',
  'invoice_issued','invoice_paid','invoice_overdue','payment_declared',
  'meeting_proposed','meeting_confirmed','meeting_cancelled','meeting_rescheduled',
  'document_shared','document_signed','credentials_released','note'));

-- ── 2 · STRUCTURED ONBOARDING BRIEF (Fase 1) ────────────────
alter table public.client_projects
  add column if not exists brief jsonb not null default '{}'::jsonb;
comment on column public.client_projects.brief is
  'Structured onboarding brief: {projectType,budgetRange,deadline,goals,references}';

-- ── 3 · DOCUMENTS: project link + signature (Fase 2) ────────
alter table public.client_documents
  add column if not exists project_id uuid references public.client_projects(id) on delete set null,
  add column if not exists requires_signature boolean not null default false,
  add column if not exists signed_at timestamptz;
create index if not exists client_documents_project_idx on public.client_documents (project_id);

alter table public.client_documents drop constraint if exists client_documents_type_check;
alter table public.client_documents add constraint client_documents_type_check
  check (type in ('report','contract','invoice','handover','other'));

-- Client signs an own document that is pending signature (idempotent).
create or replace function public.sign_document(p_doc uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v record;
begin
  select d.id, d.client_id, d.project_id, d.name, d.requires_signature, d.signed_at
    into v from public.client_documents d where d.id = p_doc;
  if not found then raise exception 'Document not found'; end if;
  if v.client_id <> auth.uid() and not public.is_admin() then raise exception 'Not allowed'; end if;
  if not v.requires_signature then raise exception 'Document does not require signature'; end if;
  if v.signed_at is not null then return; end if;
  update public.client_documents set signed_at = now() where id = p_doc;
  if v.project_id is not null then
    perform public.log_project_event(v.project_id, v.client_id, 'document_signed', 'Documento firmato: '||v.name, null);
  end if;
end $$;
revoke execute on function public.sign_document(uuid) from public, anon;
grant  execute on function public.sign_document(uuid) to authenticated;

-- Journal admin document sharing (only when tied to a project).
create or replace function public.trg_document_events() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.project_id is not null then
    perform public.log_project_event(new.project_id, new.client_id, 'document_shared', 'Documento condiviso: '||new.name, null);
  end if;
  return new;
end $$;
revoke execute on function public.trg_document_events() from public, anon, authenticated;
drop trigger if exists document_events_log on public.client_documents;
create trigger document_events_log after insert on public.client_documents
  for each row execute function public.trg_document_events();

-- ── 4 · PAYMENT DECLARATION (Fase 2/5) ──────────────────────
alter table public.client_invoices
  add column if not exists client_marked_paid_at timestamptz;

-- Client declares a sent/overdue invoice as paid; admin later confirms → 'paid'.
create or replace function public.declare_invoice_paid(p_invoice uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v record;
begin
  select i.id, i.client_id, i.project_id, i.number, i.status, i.client_marked_paid_at
    into v from public.client_invoices i where i.id = p_invoice;
  if not found then raise exception 'Invoice not found'; end if;
  if v.client_id <> auth.uid() then raise exception 'Not allowed'; end if;
  if v.status not in ('sent','overdue') then raise exception 'Invoice not payable'; end if;
  if v.client_marked_paid_at is not null then return; end if;
  update public.client_invoices set client_marked_paid_at = now() where id = p_invoice;
  if v.project_id is not null then
    perform public.log_project_event(v.project_id, v.client_id, 'payment_declared', 'Pagamento dichiarato: '||v.number, null);
  end if;
end $$;
revoke execute on function public.declare_invoice_paid(uuid) from public, anon;
grant  execute on function public.declare_invoice_paid(uuid) to authenticated;

-- ── 5 · TICKET ESTIMATES (Fase 6) ───────────────────────────
alter table public.support_tickets
  add column if not exists estimate_amount numeric check (estimate_amount is null or estimate_amount >= 0),
  add column if not exists estimate_hours  numeric check (estimate_hours  is null or estimate_hours  >= 0);

-- ── 6 · HANDOVER: CREDENTIALS & RESOURCES (Fase 5) ──────────
create table if not exists public.project_credentials (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.client_projects(id) on delete cascade,
  client_id   uuid not null references public.profiles(id) on delete cascade,
  kind        text not null default 'access' check (kind in ('access','resource')),
  label       text not null,
  url         text,
  username    text,
  secret      text,
  note        text,
  released_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.project_credentials enable row level security;
create index if not exists project_credentials_project_idx on public.project_credentials (project_id);
create index if not exists project_credentials_client_idx  on public.project_credentials (client_id);

drop policy if exists pc_admin_all     on public.project_credentials;
drop policy if exists pc_client_select on public.project_credentials;
create policy pc_admin_all on public.project_credentials for all
  using (public.is_admin()) with check (public.is_admin());
-- Client sees a credential only once the admin has released it.
create policy pc_client_select on public.project_credentials for select
  using (client_id = auth.uid() and released_at is not null);

create or replace function public.trg_credentials_events() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.released_at is not null and (tg_op = 'INSERT' or old.released_at is null) then
    perform public.log_project_event(new.project_id, new.client_id, 'credentials_released', 'Accesso rilasciato: '||new.label, null);
  end if;
  return new;
end $$;
revoke execute on function public.trg_credentials_events() from public, anon, authenticated;
drop trigger if exists credentials_events_log on public.project_credentials;
create trigger credentials_events_log after insert or update of released_at on public.project_credentials
  for each row execute function public.trg_credentials_events();

-- ── 7 · CLIENT ASSETS (materials upload) ────────────────────
create table if not exists public.client_assets (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles(id) on delete cascade,
  project_id  uuid references public.client_projects(id) on delete set null,
  name        text not null,
  storage_path text not null,
  mime        text,
  size_bytes  bigint not null default 0,
  uploaded_by text not null default 'client' check (uploaded_by in ('client','admin')),
  created_at  timestamptz not null default now()
);
alter table public.client_assets enable row level security;
create index if not exists client_assets_client_idx  on public.client_assets (client_id);
create index if not exists client_assets_project_idx on public.client_assets (project_id);

drop policy if exists ca_admin_all     on public.client_assets;
drop policy if exists ca_client_select on public.client_assets;
drop policy if exists ca_client_insert on public.client_assets;
drop policy if exists ca_client_delete on public.client_assets;
create policy ca_admin_all on public.client_assets for all
  using (public.is_admin()) with check (public.is_admin());
create policy ca_client_select on public.client_assets for select
  using (client_id = auth.uid());
create policy ca_client_insert on public.client_assets for insert
  with check (client_id = auth.uid() and uploaded_by = 'client');
create policy ca_client_delete on public.client_assets for delete
  using (client_id = auth.uid() and uploaded_by = 'client');

-- ── 8 · STORAGE policies for private bucket 'project-assets' ─
-- path convention: <client_id>/<filename>
drop policy if exists "pa_client_read"   on storage.objects;
drop policy if exists "pa_client_insert" on storage.objects;
drop policy if exists "pa_client_delete" on storage.objects;
drop policy if exists "pa_admin_all"     on storage.objects;
create policy "pa_client_read" on storage.objects for select
  using (bucket_id = 'project-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "pa_client_insert" on storage.objects for insert
  with check (bucket_id = 'project-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "pa_client_delete" on storage.objects for delete
  using (bucket_id = 'project-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "pa_admin_all" on storage.objects for all
  using (bucket_id = 'project-assets' and public.is_admin())
  with check (bucket_id = 'project-assets' and public.is_admin());

-- ── 9 · REALTIME ────────────────────────────────────────────
alter publication supabase_realtime add table public.project_credentials;
alter publication supabase_realtime add table public.client_assets;
