-- ============================================================
-- PORTAL 10 · AUDIT TRAIL
-- Tamper-evident record of legally-relevant client actions:
-- stage approvals, document signatures, payment declarations.
-- Captures actor, timestamp, IP and user-agent (via PostgREST
-- request.headers). Written only by SECURITY DEFINER helpers.
-- ============================================================

create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  actor_role  text not null default 'system',
  action      text not null,
  entity_type text,
  entity_id   uuid,
  project_id  uuid references public.client_projects(id) on delete set null,
  client_id   uuid references public.profiles(id) on delete set null,
  ip          text,
  user_agent  text,
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create index if not exists audit_logs_project_idx on public.audit_logs (project_id, created_at desc);
create index if not exists audit_logs_client_idx  on public.audit_logs (client_id, created_at desc);
create index if not exists audit_logs_entity_idx  on public.audit_logs (entity_type, entity_id);

-- Read-only for the API: admins see everything, clients see their own trail.
-- No INSERT/UPDATE/DELETE policy → rows are written solely via log_audit().
drop policy if exists audit_admin_select  on public.audit_logs;
drop policy if exists audit_client_select on public.audit_logs;
create policy audit_admin_select  on public.audit_logs for select using (public.is_admin());
create policy audit_client_select on public.audit_logs for select using (client_id = auth.uid());

-- Writer: captures request metadata; bypasses RLS as definer.
create or replace function public.log_audit(
  p_action text, p_entity_type text, p_entity_id uuid,
  p_project uuid default null, p_client uuid default null, p_detail jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare v_headers json; v_ip text; v_ua text;
begin
  begin
    v_headers := current_setting('request.headers', true)::json;
  exception when others then v_headers := null; end;
  if v_headers is not null then
    v_ip := split_part(coalesce(v_headers->>'x-forwarded-for', v_headers->>'x-real-ip', ''), ',', 1);
    v_ua := v_headers->>'user-agent';
  end if;
  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, project_id, client_id, ip, user_agent, detail)
  values (auth.uid(), public.actor_role_now(), p_action, p_entity_type, p_entity_id, p_project, p_client, nullif(trim(v_ip), ''), v_ua, coalesce(p_detail, '{}'::jsonb));
end $$;
revoke execute on function public.log_audit(text,text,uuid,uuid,uuid,jsonb) from public, anon, authenticated;

-- ── Re-create the mutating RPCs with an audit write ──────────

create or replace function public.approve_stage(p_stage uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v record;
begin
  select ps.id, ps.project_id, ps.approval_state, ps.title, cp.client_id
    into v
    from public.project_stages ps
    join public.client_projects cp on cp.id = ps.project_id
   where ps.id = p_stage;
  if not found then raise exception 'Stage not found'; end if;
  if v.client_id <> auth.uid() and not public.is_admin() then raise exception 'Not allowed'; end if;
  if v.approval_state <> 'requested' then raise exception 'No approval requested for this stage'; end if;
  update public.project_stages set approval_state = 'approved' where id = p_stage;
  perform public.advance_stage_core(v.project_id, p_stage);
  perform public.log_audit('stage_approved', 'project_stage', p_stage, v.project_id, v.client_id,
    jsonb_build_object('title', v.title));
end $$;
revoke execute on function public.approve_stage(uuid) from public, anon;
grant  execute on function public.approve_stage(uuid) to authenticated;

create or replace function public.sign_document(p_doc uuid)
returns void language plpgsql security definer set search_path = public as $$
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
  perform public.log_audit('document_signed', 'document', p_doc, v.project_id, v.client_id,
    jsonb_build_object('name', v.name));
end $$;
revoke execute on function public.sign_document(uuid) from public, anon;
grant  execute on function public.sign_document(uuid) to authenticated;

create or replace function public.declare_invoice_paid(p_invoice uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v record;
begin
  select i.id, i.client_id, i.project_id, i.number, i.amount, i.status, i.client_marked_paid_at
    into v from public.client_invoices i where i.id = p_invoice;
  if not found then raise exception 'Invoice not found'; end if;
  if v.client_id <> auth.uid() then raise exception 'Not allowed'; end if;
  if v.status not in ('sent','overdue') then raise exception 'Invoice not payable'; end if;
  if v.client_marked_paid_at is not null then return; end if;
  update public.client_invoices set client_marked_paid_at = now() where id = p_invoice;
  if v.project_id is not null then
    perform public.log_project_event(v.project_id, v.client_id, 'payment_declared', 'Pagamento dichiarato: '||v.number, null);
  end if;
  perform public.log_audit('payment_declared', 'invoice', p_invoice, v.project_id, v.client_id,
    jsonb_build_object('number', v.number, 'amount', v.amount));
end $$;
revoke execute on function public.declare_invoice_paid(uuid) from public, anon;
grant  execute on function public.declare_invoice_paid(uuid) to authenticated;

create or replace function public.advance_stage(p_stage uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_project uuid; v_title text; v_client uuid;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  select ps.project_id, ps.title, cp.client_id into v_project, v_title, v_client
    from public.project_stages ps join public.client_projects cp on cp.id = ps.project_id
   where ps.id = p_stage;
  if v_project is null then raise exception 'Stage not found'; end if;
  perform public.advance_stage_core(v_project, p_stage);
  perform public.log_audit('stage_advanced', 'project_stage', p_stage, v_project, v_client,
    jsonb_build_object('title', v_title));
end $$;
revoke execute on function public.advance_stage(uuid) from public, anon;
grant  execute on function public.advance_stage(uuid) to authenticated;

-- Realtime so the admin dossier reflects new entries live.
alter publication supabase_realtime add table public.audit_logs;
