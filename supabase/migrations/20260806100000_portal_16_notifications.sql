-- ═══════════════════════════════════════════════════════════════════════
-- portal_16 — il campanello dell'area clienti
--
-- Nessuna azione dentro il portale raggiungeva nessuno: il cliente apriva
-- una richiesta, approvava un preventivo o dichiarava un pagamento, e lo
-- studio lo scopriva solo riaprendo la dashboard.
--
-- La notifica parte dal database e non dal browser: una chiamata lato client
-- si può saltare chiudendo la scheda a metà, mentre il trigger è legato al
-- fatto che la riga esista davvero.
--
-- CONFIGURAZIONE, due passi (senza, tutto tace ma niente si rompe):
--   1. select vault.create_secret('https://IL-TUO-DOMINIO/api/notify', 'notify_url');
--   2. la stessa stringa di `notify_secret` va in Vercel come NOTIFY_SECRET.
--
-- Verificato sul database (in transazione annullata): con notifiche non
-- configurate l'insert passa; con URL irraggiungibile l'insert passa lo
-- stesso e pg_net accoda senza bloccare.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists pg_net;

-- Segreto condiviso con l'endpoint. Generato qui: non è mai transitato da
-- nessuna parte, va letto una volta e incollato in Vercel.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'notify_secret') then
    perform vault.create_secret(encode(gen_random_bytes(24), 'hex'), 'notify_secret');
  end if;
end $$;

-- ── Come si chiama il cliente, per non mandare un uuid in Telegram ──────
create or replace function public.client_label(p_client uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(nullif(company_name, ''), nullif(contact_name, ''), email, 'cliente')
  from public.profiles where id = p_client
$$;

-- ── Il campanello ───────────────────────────────────────────────────────
create or replace function public.notify_studio(
  p_event text, p_client text, p_subject text, p_detail text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_secret text;
begin
  select decrypted_secret into v_url    from vault.decrypted_secrets where name = 'notify_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'notify_secret';
  if v_url is null or v_secret is null or v_url = '' then
    return;   -- non configurato: si tace
  end if;

  -- asincrona: mette in coda e torna subito, non allunga la scrittura
  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-notify-secret', v_secret),
    body    := jsonb_build_object(
                 'event', p_event, 'client', p_client,
                 'subject', p_subject, 'detail', p_detail)
  );
exception when others then
  -- il campanello non deve mai far cadere la scrittura che sta annunciando
  return;
end $$;

revoke execute on function public.notify_studio(text, text, text, text) from public, anon, authenticated;
revoke execute on function public.client_label(uuid) from public, anon, authenticated;

-- ── Richieste di lavoro ─────────────────────────────────────────────────
create or replace function public.trg_notify_ticket()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    perform public.notify_studio('request_new', public.client_label(new.client_id),
      new.subject, left(coalesce(new.message, ''), 300));
  elsif new.estimate_accepted_at is not null and old.estimate_accepted_at is null then
    perform public.notify_studio('estimate_accepted', public.client_label(new.client_id),
      new.subject, coalesce(new.estimate_amount::text || ' EUR', ''));
  end if;
  return null;
end $$;

drop trigger if exists notify_ticket on public.support_tickets;
create trigger notify_ticket after insert or update on public.support_tickets
  for each row execute function public.trg_notify_ticket();

-- ── Pagamento dichiarato dal cliente ────────────────────────────────────
create or replace function public.trg_notify_invoice()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.client_marked_paid_at is not null and old.client_marked_paid_at is null then
    perform public.notify_studio('payment_declared', public.client_label(new.client_id),
      new.number, coalesce(new.amount::text || ' EUR', ''));
  end if;
  return null;
end $$;

drop trigger if exists notify_invoice on public.client_invoices;
create trigger notify_invoice after update on public.client_invoices
  for each row execute function public.trg_notify_invoice();

-- ── Fase approvata o rimandata indietro ─────────────────────────────────
create or replace function public.trg_notify_stage()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_client uuid;
begin
  if new.approval_state = old.approval_state then return null; end if;
  select client_id into v_client from public.client_projects where id = new.project_id;

  if new.approval_state = 'approved' then
    perform public.notify_studio('stage_approved', public.client_label(v_client), new.title, '');
  elsif new.approval_state = 'changes_requested' then
    perform public.notify_studio('stage_changes', public.client_label(v_client),
      new.title, left(coalesce(new.revision_note, ''), 300));
  end if;
  return null;
end $$;

drop trigger if exists notify_stage on public.project_stages;
create trigger notify_stage after update on public.project_stages
  for each row execute function public.trg_notify_stage();

-- ── Messaggio scritto dal cliente ───────────────────────────────────────
create or replace function public.trg_notify_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_client uuid; v_subject text;
begin
  if new.author_role <> 'client' then return null; end if;
  select client_id, subject into v_client, v_subject
    from public.conversations where id = new.conversation_id;
  perform public.notify_studio('message_new', public.client_label(v_client),
    v_subject, left(coalesce(new.content, ''), 300));
  return null;
end $$;

drop trigger if exists notify_message on public.messages;
create trigger notify_message after insert on public.messages
  for each row execute function public.trg_notify_message();

-- ── Nuovo progetto proposto ─────────────────────────────────────────────
create or replace function public.trg_notify_project()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_studio('project_new', public.client_label(new.client_id),
    new.name, left(coalesce(new.description, ''), 300));
  return null;
end $$;

drop trigger if exists notify_project on public.client_projects;
create trigger notify_project after insert on public.client_projects
  for each row execute function public.trg_notify_project();
