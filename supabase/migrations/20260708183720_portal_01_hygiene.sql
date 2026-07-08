-- ============================================================
-- PORTAL 01 · HYGIENE
-- 1. Fix messages (legacy NOT NULL cols broke every insert)
-- 2. Drop dead legacy tables + enums
-- 3. Strict CHECK vocabularies on free-text status columns
-- 4. De-duplicate foreign keys, add FK indexes
-- ============================================================

-- ── 1 · MESSAGES ─────────────────────────────────────────────
drop policy if exists messages_insert on public.messages;
drop policy if exists messages_select on public.messages;

alter table public.messages
  drop column if exists project_id,
  drop column if exists sender_id,
  drop column if exists message_text;

alter table public.messages
  alter column conversation_id set not null,
  alter column author_id set not null,
  alter column author_role set not null,
  alter column content set not null,
  alter column created_at set not null,
  alter column is_deleted set not null;

alter table public.messages
  add constraint messages_author_role_check check (author_role in ('admin','client'));

alter table public.messages drop constraint if exists fk_messages_conversation_id; -- duplicate of fk_messages_conversation
alter table public.messages drop constraint if exists fk_messages_author_id;       -- auth.users, no ON DELETE
alter table public.messages
  add constraint messages_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade;

create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at);

-- ── 2 · LEGACY TABLES (all 0 rows; blueprints stays: Foundry uses it) ──
drop table if exists public.revisions cascade;
drop table if exists public.project_blueprints cascade;
drop table if exists public.projects cascade;
drop table if exists public.client_tasks cascade;
drop type if exists public.revision_status;
drop type if exists public.task_phase;
drop type if exists public.task_status;
drop type if exists public.conversation_status; -- never bound: conversations.status is text

-- ── 3 · STRICT STATUS VOCABULARIES ──────────────────────────
alter table public.conversations
  add constraint conversations_status_check check (status in ('open','answered','has_questions','closed'));
alter table public.project_stages
  add constraint project_stages_status_check check (status in ('locked','active','done'));
alter table public.client_invoices
  add constraint client_invoices_status_check check (status in ('draft','sent','paid','overdue')),
  add constraint client_invoices_amount_check check (amount >= 0);
alter table public.support_tickets
  add constraint support_tickets_status_check check (status in ('new','in-progress','resolved')),
  add constraint support_tickets_priority_check check (priority in ('low','medium','high','critical'));
alter table public.profiles
  add constraint profiles_plan_check check (plan in ('starter','pro','enterprise')),
  add constraint profiles_status_check check (status in ('active','onboarding','paused'));
alter table public.client_documents
  add constraint client_documents_type_check check (type in ('report','contract','invoice','other'));

-- ── 4 · DE-DUPLICATED FKS (profiles(id) FK is canonical; profiles already cascades from auth.users) ──
alter table public.client_projects drop constraint if exists client_projects_client_id_fkey;
alter table public.conversations   drop constraint if exists conversations_client_id_fkey;
alter table public.meetings        drop constraint if exists meetings_client_id_fkey;

create index if not exists client_projects_client_idx   on public.client_projects (client_id);
create index if not exists conversations_client_idx     on public.conversations (client_id);
create index if not exists conversations_stage_idx      on public.conversations (stage_id);
create index if not exists conversations_project_idx    on public.conversations (project_id);
create index if not exists meetings_client_idx          on public.meetings (client_id);
create index if not exists meetings_project_idx         on public.meetings (project_id);
create index if not exists client_invoices_client_idx   on public.client_invoices (client_id);
create index if not exists client_invoices_project_idx  on public.client_invoices (project_id);
create index if not exists project_stages_project_idx   on public.project_stages (project_id, order_index);
create index if not exists support_tickets_client_idx   on public.support_tickets (client_id);
create index if not exists client_documents_client_idx  on public.client_documents (client_id);