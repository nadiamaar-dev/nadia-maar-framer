-- ============================================================
-- PORTAL 11 · PROJECT REFERENCES (Blueprint / Riferimenti)
-- Per-project inspiration board: the client adds layouts, sites,
-- images or notes as references — during onboarding and design.
-- Both client and admin can contribute; each sees the project's board.
-- ============================================================

create table if not exists public.project_references (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.client_projects(id) on delete cascade,
  client_id   uuid not null references public.profiles(id) on delete cascade,
  kind        text not null default 'link' check (kind in ('link','image','foundry','note')),
  title       text not null,
  url         text,
  image_url   text,
  note        text,
  source      text,
  added_by    text not null default 'client' check (added_by in ('client','admin')),
  created_at  timestamptz not null default now()
);
alter table public.project_references enable row level security;
create index if not exists project_references_project_idx on public.project_references (project_id, created_at desc);
create index if not exists project_references_client_idx  on public.project_references (client_id);

drop policy if exists pr_admin_all     on public.project_references;
drop policy if exists pr_client_select on public.project_references;
drop policy if exists pr_client_insert on public.project_references;
drop policy if exists pr_client_delete on public.project_references;

create policy pr_admin_all on public.project_references for all
  using (public.is_admin()) with check (public.is_admin());
create policy pr_client_select on public.project_references for select
  using (client_id = auth.uid());
create policy pr_client_insert on public.project_references for insert
  with check (client_id = auth.uid() and added_by = 'client');
create policy pr_client_delete on public.project_references for delete
  using (client_id = auth.uid() and added_by = 'client');

alter publication supabase_realtime add table public.project_references;
