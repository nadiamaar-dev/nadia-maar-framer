-- ============================================================
-- PORTAL 25 · IL CABINET SI VISITA: ACCOUNT OSPITE IN SOLA LETTURA
--
-- L'area clienti è l'asset più convincente dello studio, ma finora
-- si poteva solo raccontare: per vederla serviva essere clienti.
-- Questo migration crea un account dimostrativo pubblico
-- (ospite@nadiamaar.dev — la password sta nel bundle, per scelta)
-- con un progetto verosimile dentro, e lo rende INCAPACE di
-- scrivere: non nell'interfaccia, nel database.
--
-- ── PERCHÉ NIENTE RUOLO `guest` ──────────────────────────────
-- Un terzo valore dell'enum user_role toccherebbe is_admin(), i
-- CHECK di messages.author_role e project_events.actor_role, il
-- DashboardGate — quattro superfici di regressione per zero
-- guadagno. L'ospite È un client normale; la sola lettura la
-- impongono policy RESTRICTIVE aggiuntive, che si sommano in AND
-- alle policy esistenti senza modificarle.
--
-- ── LE TRE SERRATURE ─────────────────────────────────────────
-- 1. Policy RESTRICTIVE su ogni tabella dove un client può
--    scrivere: insert/update/delete negati se is_demo().
-- 2. Le funzioni SECURITY DEFINER (che scavalcano la RLS per
--    mestiere) ricevono una guardia esplicita in testa.
-- 3. storage.objects: niente upload/cancellazioni dall'ospite.
--
-- Idempotente: rieseguire non duplica niente e non tocca ciò che
-- un admin ha nel frattempo modificato.
-- ============================================================

-- ── 0 · Chi è l'ospite ───────────────────────────────────────
-- Un solo posto conosce l'UUID: questa funzione. Le policy, le
-- guardie e i seed chiedono a lei.
create or replace function public.is_demo()
returns boolean
language sql
stable
set search_path to 'public'
as $$
  select auth.uid() = 'de300000-0000-4000-a000-000000000001'::uuid
$$;

comment on function public.is_demo() is
  'True se la sessione è l''account dimostrativo del cabinet (sola lettura).';

-- ── 1 · L'utente auth + identità ─────────────────────────────
do $$
declare
  v_id constant uuid := 'de300000-0000-4000-a000-000000000001';
  v_email constant text := 'ospite@nadiamaar.dev';
begin
  if not exists (select 1 from auth.users where id = v_id) then
    insert into auth.users
      (instance_id, id, aud, role, email, encrypted_password,
       email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
       created_at, updated_at, confirmation_token, recovery_token,
       email_change_token_new, email_change)
    values
      ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
       v_email, extensions.crypt('aurora-demo-2026', extensions.gen_salt('bf')),
       now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ospite","company_name":"Aurora Living S.r.l."}',
       now(), now(), '', '', '', '');
  end if;

  if not exists (select 1 from auth.identities where user_id = v_id) then
    insert into auth.identities
      (id, user_id, provider_id, identity_data, provider,
       last_sign_in_at, created_at, updated_at)
    values
      (gen_random_uuid(), v_id, v_id::text,
       jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
       'email', now(), now(), now());
  end if;

  -- handle_new_user ha già creato il profilo (o lo creiamo noi se il
  -- trigger un giorno sparisse); in ogni caso i campi vetrina sono nostri.
  insert into public.profiles (id, role, full_name, contact_name, company_name, email, joined_at)
  values (v_id, 'client', 'Ospite', 'Ospite', 'Aurora Living S.r.l.', v_email, now())
  on conflict (id) do nothing;

  update public.profiles
     set company_name = 'Aurora Living S.r.l.',
         contact_name = 'Ospite',
         full_name    = 'Ospite',
         tags         = array['demo']
   where id = v_id;
end $$;

-- ── 2 · Serratura n.1: policy RESTRICTIVE ────────────────────
-- Sulle nove tabelle in cui un client può scrivere. Una policy
-- restrictive si somma in AND alle permissive esistenti: l'admin
-- e i clienti veri non se ne accorgono, l'ospite trova il muro.
do $$
declare
  t text;
  tables constant text[] := array[
    'blueprints','client_assets','client_projects','conversations',
    'meetings','messages','profiles','project_references','support_tickets'
  ];
begin
  foreach t in array tables loop
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='nm_demo_ro_insert') then
      execute format('create policy nm_demo_ro_insert on public.%I as restrictive for insert to authenticated with check (not public.is_demo())', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='nm_demo_ro_update') then
      execute format('create policy nm_demo_ro_update on public.%I as restrictive for update to authenticated using (not public.is_demo())', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='nm_demo_ro_delete') then
      execute format('create policy nm_demo_ro_delete on public.%I as restrictive for delete to authenticated using (not public.is_demo())', t);
    end if;
  end loop;
end $$;

-- ── 3 · Serratura n.2: le funzioni SECURITY DEFINER ──────────
-- Scavalcano la RLS per mestiere, quindi la guardia sta dentro.
-- mark_conversation_read resta permessa: segnare «letto» rende la
-- demo naturale e non sporca niente.

create or replace function public.approve_stage(p_stage uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v record;
begin
  if public.is_demo() then
    raise exception 'Account demo: sola lettura. Le scritture sono bloccate a livello di database.';
  end if;
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
end $function$;

create or replace function public.request_stage_changes(p_stage uuid, p_note text)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v record;
begin
  if public.is_demo() then
    raise exception 'Account demo: sola lettura. Le scritture sono bloccate a livello di database.';
  end if;
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
end $function$;

create or replace function public.declare_invoice_paid(p_invoice uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v record;
begin
  if public.is_demo() then
    raise exception 'Account demo: sola lettura. Le scritture sono bloccate a livello di database.';
  end if;
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
end $function$;

create or replace function public.sign_document(p_doc uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v record;
begin
  if public.is_demo() then
    raise exception 'Account demo: sola lettura. Le scritture sono bloccate a livello di database.';
  end if;
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
end $function$;

create or replace function public.accept_ticket_estimate(p_ticket uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v record;
begin
  if public.is_demo() then
    raise exception 'Account demo: sola lettura. Le scritture sono bloccate a livello di database.';
  end if;
  select t.id, t.client_id, t.subject, t.estimate_amount, t.estimate_accepted_at
    into v from public.support_tickets t where t.id = p_ticket;
  if not found then raise exception 'Ticket not found'; end if;
  if v.client_id <> auth.uid() then raise exception 'Not allowed'; end if;
  if v.estimate_amount is null then raise exception 'No estimate to accept'; end if;
  if v.estimate_accepted_at is not null then return; end if;
  update public.support_tickets set estimate_accepted_at = now() where id = p_ticket;
  perform public.log_audit('estimate_accepted', 'ticket', p_ticket, null, v.client_id,
    jsonb_build_object('subject', v.subject, 'amount', v.estimate_amount));
end $function$;

-- ── 4 · Serratura n.3: lo storage ────────────────────────────
-- L'upload di un file parte PRIMA dell'insert a tabella: senza
-- questa policy l'ospite lascerebbe file orfani nei bucket.
do $$
begin
  begin
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='nm_demo_ro_storage_insert') then
      execute 'create policy nm_demo_ro_storage_insert on storage.objects as restrictive for insert to authenticated with check (not public.is_demo())';
    end if;
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='nm_demo_ro_storage_update') then
      execute 'create policy nm_demo_ro_storage_update on storage.objects as restrictive for update to authenticated using (not public.is_demo())';
    end if;
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='nm_demo_ro_storage_delete') then
      execute 'create policy nm_demo_ro_storage_delete on storage.objects as restrictive for delete to authenticated using (not public.is_demo())';
    end if;
  exception when insufficient_privilege then
    raise warning 'storage.objects: privilegi insufficienti — l''upload demo resta bloccato solo a livello di tabella.';
  end;
end $$;

-- ── 5 · Il progetto dimostrativo ─────────────────────────────
-- Verosimile e anonimo: un portale ordini B2B a metà sviluppo,
-- con una fase in attesa di approvazione (così l'ospite trova il
-- pulsante «Approva» e scopre che il database glielo rifiuta).
do $$
declare
  v_demo constant uuid := 'de300000-0000-4000-a000-000000000001';
  v_prj  constant uuid := 'de300000-0000-4000-a000-000000000010';
  v_conv constant uuid := 'de300000-0000-4000-a000-000000000020';
  v_admin uuid;
begin
  select id into v_admin from public.profiles where role = 'admin' order by updated_at desc nulls last limit 1;
  v_admin := coalesce(v_admin, v_demo);

  insert into public.client_projects (id, client_id, name, description, status, brief, created_at, updated_at)
  values (v_prj, v_demo,
          'Portale ordini B2B — Aurora Living',
          'Portale riservato ai rivenditori: catalogo con listini per fascia, ordini con fido, tracciamento spedizioni e import notturno dal gestionale.',
          'active',
          jsonb_build_object('vector','webapp','origine','seed dimostrativo'),
          now() - interval '35 days', now())
  on conflict (id) do nothing;

  insert into public.project_stages (id, project_id, key, title, order_index, status, progress, approval_state, started_at, completed_at, deliverable_note)
  values
    ('de300000-0000-4000-a000-000000000011', v_prj, 'discovery', 'Discovery & requisiti',     0, 'done',   100, 'approved', now() - interval '35 days', now() - interval '28 days', null),
    ('de300000-0000-4000-a000-000000000012', v_prj, 'design',    'Design del sistema',        1, 'done',   100, 'approved', now() - interval '28 days', now() - interval '14 days', null),
    ('de300000-0000-4000-a000-000000000013', v_prj, 'build',     'Sviluppo & integrazioni',   2, 'active',  80, 'requested', now() - interval '14 days', null,
       'Anteprima su staging: flusso ordini completo, fido cliente attivo, import listino notturno funzionante.'),
    ('de300000-0000-4000-a000-000000000014', v_prj, 'launch',    'Collaudo & lancio',         3, 'locked',   0, 'none', null, null, null)
  on conflict (id) do nothing;

  insert into public.project_events (id, project_id, client_id, actor_role, type, title, detail, created_at)
  values
    ('de300000-0000-4000-a000-000000000015', v_prj, v_demo, 'system', 'stage_started',      'Fase avviata: Discovery & requisiti', null, now() - interval '35 days'),
    ('de300000-0000-4000-a000-000000000016', v_prj, v_demo, 'admin',  'stage_completed',    'Fase completata: Design del sistema', 'Architettura approvata: Next.js + Postgres, import notturno via coda.', now() - interval '14 days'),
    ('de300000-0000-4000-a000-000000000017', v_prj, v_demo, 'admin',  'note',               'Anteprima pubblicata su staging', 'Flusso ordini end-to-end con fido cliente e listini per fascia.', now() - interval '3 days'),
    ('de300000-0000-4000-a000-000000000018', v_prj, v_demo, 'system', 'approval_requested', 'Approvazione richiesta: Sviluppo & integrazioni', null, now() - interval '2 days')
  on conflict (id) do nothing;

  insert into public.conversations (id, client_id, project_id, subject, status, last_message_at, client_last_read_at, admin_last_read_at, created_at, updated_at)
  values (v_conv, v_demo, v_prj, 'Import listino: cadenza di aggiornamento', 'answered',
          now() - interval '1 day', now(), now(), now() - interval '2 days', now())
  on conflict (id) do nothing;

  insert into public.messages (id, conversation_id, author_id, author_role, content, attachments, created_at)
  values
    ('de300000-0000-4000-a000-000000000021', v_conv, v_demo,  'client',
     'Il fornitore aggiorna i prezzi ogni notte alle 02:00: possiamo allineare l''import per non vendere mai a listino vecchio?',
     '[]'::jsonb, now() - interval '2 days'),
    ('de300000-0000-4000-a000-000000000022', v_conv, v_admin, 'admin',
     'Sì: spostiamo il job alle 03:30 con retry esponenziale e chiave di idempotenza. Da domani lo vedete in staging, pannello Import.',
     '[]'::jsonb, now() - interval '1 day')
  on conflict (id) do nothing;

  insert into public.meetings (id, client_id, project_id, proposed_by, datetime, duration_min, status, admin_note)
  values
    ('de300000-0000-4000-a000-000000000030', v_demo, v_prj, 'admin', now() - interval '7 days',  45, 'confirmed', 'Review di fine fase: design del sistema'),
    ('de300000-0000-4000-a000-000000000031', v_demo, v_prj, 'admin', date_trunc('hour', now()) + interval '3 days', 30, 'confirmed', 'Demo del flusso ordini su staging')
  on conflict (id) do nothing;

  insert into public.client_invoices (id, client_id, project_id, number, description, amount, currency, status, issued_at, due_date, client_marked_paid_at)
  values
    ('de300000-0000-4000-a000-000000000040', v_demo, v_prj, 'NM-2026-014', 'Acconto — discovery e design del sistema', 4800, 'EUR', 'paid', (now() - interval '30 days')::date, (now() - interval '16 days')::date, now() - interval '25 days'),
    ('de300000-0000-4000-a000-000000000041', v_demo, v_prj, 'NM-2026-021', 'SAL — sviluppo e integrazioni (fase 3)',   3200, 'EUR', 'sent', (now() - interval '5 days')::date,  (now() + interval '10 days')::date, null)
  on conflict (id) do nothing;

  insert into public.support_tickets (id, client_id, project_id, client_name, subject, message, priority, status, estimate_amount, estimate_hours, admin_note, responded_at, created_at)
  values ('de300000-0000-4000-a000-000000000050', v_demo, v_prj, 'Aurora Living',
          'Esportazione ordini in Excel',
          'Per la contabilità servirebbe un esport mensile degli ordini con totali per rivenditore.',
          'medium', 'in-progress', 900, 12,
          'Fattibile: vista dedicata + esport XLSX pianificato a fine mese.',
          now() - interval '1 day', now() - interval '4 days')
  on conflict (id) do nothing;
end $$;

-- ── 6 · Controllo finale leggibile ───────────────────────────
do $$
declare n_pol integer; n_prj integer;
begin
  select count(*) into n_pol from pg_policies where policyname like 'nm_demo_ro_%';
  select count(*) into n_prj from public.client_projects where client_id = 'de300000-0000-4000-a000-000000000001';
  raise notice 'OSPITE: % policy restrictive attive, % progetto/i dimostrativo/i.', n_pol, n_prj;
end $$;
