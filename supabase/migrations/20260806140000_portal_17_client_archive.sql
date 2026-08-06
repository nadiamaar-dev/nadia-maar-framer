-- ============================================================
-- PORTAL 17 · ARCHIVIO CLIENTI E PROGETTI APERTI DALLO STUDIO
--
-- Tre cose, tutte nate dalla stessa mancanza: la scheda cliente
-- era una vetrina, non un posto da cui si lavora.
--
-- 1. 'archived' fra gli stati del cliente. Chiudere un rapporto
--    non è metterlo «in pausa» — la pausa dice che si riprende,
--    l'archivio dice che è finito. Restava solo l'eliminazione,
--    che porta via con sé fatture e documenti: esattamente ciò
--    che per legge va conservato.
--
-- 2. Lo studio può aprire un progetto per un cliente. Finora
--    l'unica policy di INSERT era quella del cliente su se
--    stesso, quindi «ricominciamo con loro» richiedeva che
--    fosse il cliente a compilare il modulo.
--
-- 3. La notifica Telegram su nuovo progetto non parte più
--    quando è lo studio ad averlo creato: avvisarsi da soli di
--    ciò che si è appena fatto è solo rumore, e il rumore fa
--    ignorare anche le notifiche vere.
-- ============================================================

-- ── 1 · Stato cliente: archiviato ───────────────────────────
alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check
  check (status in ('active', 'onboarding', 'paused', 'archived'));

-- ── 2 · Lo studio apre progetti ─────────────────────────────
-- Nessun vincolo sullo stato: il cliente può inserire solo in
-- 'pending_approval' perché sta chiedendo, lo studio no perché
-- sta decidendo.
drop policy if exists admin_insert_projects on public.client_projects;
create policy admin_insert_projects on public.client_projects
  for insert with check (public.is_admin());

-- ── 3 · Niente autonotifica ─────────────────────────────────
create or replace function public.trg_notify_project()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then return null; end if;
  perform public.notify_studio('project_new', public.client_label(new.client_id),
    new.name, left(coalesce(new.description, ''), 300));
  return null;
end $$;

-- ── 4 · Il guardiano del profilo non zittisce più il server ──
-- Stessa correzione già fatta a guard_meeting_client_update in portal_15b,
-- e stessa ragione: il guardiano difende dall'utente che prova ad alzarsi
-- i privilegi da solo, non dal server. Con auth.uid() nullo — service role,
-- proprietario, un job — `is_admin()` è falso, e la scrittura veniva
-- riportata indietro in silenzio invece di passare o di fallire. Un errore
-- si vede; una modifica che sparisce senza dire niente, no.
create or replace function public.guard_profile_self_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if not public.is_admin() then
    new.role       := old.role;
    new.plan       := old.plan;
    new.status     := old.status;
    new.id         := old.id;
    new.email      := old.email;
    new.joined_at  := old.joined_at;
    new.tags       := old.tags;
  end if;
  return new;
end $$;

-- I due guardiani girano in coppia sullo stesso UPDATE: il primo appiattiva
-- i campi, il secondo controllava che non fossero cambiati e quindi non
-- protestava mai. Sbloccato il primo, il secondo va sbloccato con lui,
-- altrimenti al server tocca un errore al posto del silenzio di prima.
create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if not public.is_admin() then
    if new.role is distinct from old.role
       or new.plan is distinct from old.plan
       or new.status is distinct from old.status
       or new.tags is distinct from old.tags
       or new.joined_at is distinct from old.joined_at then
      raise exception 'not allowed to change protected profile fields';
    end if;
  end if;
  return new;
end $$;
