-- ============================================================
-- PORTAL 22 · LA VORONKA SI MISURA
--
-- Tre cose che finora non esistevano, e senza le quali ogni
-- discussione sul funnel è un'opinione:
--
--  1. EVENTI. visitor_logs conta le pagine viste — una riga per
--     pagina, niente di più. Ma la voronka vive FRA le pagine:
--     chi apre una demo, chi arriva al passo 3 del configuratore
--     e si ferma, chi scarica il blueprint e sparisce. Serve una
--     tabella di eventi, non un'altra colonna sui pageview.
--
--  2. STADI. foundry_leads.status conosceva tre valori:
--     new/contacted/archived. «Contattato» non è uno stadio di
--     vendita: dopo il contatto c'è la call, la proposta, l'esito
--     — e senza distinguerli non si può sapere DOVE muoiono le
--     trattative. Il CHECK si allarga; i valori vecchi restano
--     validi, quindi nessuna riga esistente si rompe.
--
--  3. ATTRIBUZIONE. Un lead senza sorgente è un lead che non
--     insegna niente: non si può sapere quale canale ripagare.
--     utm_* e referrer si scrivono UNA volta, alla nascita del
--     lead, con i valori del primo tocco della sessione.
--
-- Più lo scoring: il punteggio si calcola sul server dagli
-- stessi dati che già arrivano (complessità, moduli, sorgente).
-- Nessuna domanda in più al visitatore — per decisione esplicita
-- del proprietario, il sito non chiede budget.
-- ============================================================

-- ── 1 · EVENTI DELLA VORONKA ────────────────────────────────
create table if not exists public.funnel_events (
  id          uuid primary key default gen_random_uuid(),
  -- nome breve e stabile: 'demo_open', 'config_step', 'blueprint_pdf',
  -- 'lead_submit', 'audit_run'… Il CHECK tiene solo la forma, non
  -- l'elenco: un evento nuovo non deve richiedere una migrazione.
  event       text not null check (event ~ '^[a-z][a-z0-9_]{1,49}$'),
  -- identificatore di sessione generato dal browser (crypto.randomUUID,
  -- vive in sessionStorage): lega i passi di UNA visita senza cookie
  -- persistenti e senza identificare la persona. Muore con la scheda.
  session_id  text check (session_id is null or length(session_id) <= 64),
  page_path   text not null check (page_path ~ '^/'),
  -- dettagli dell'evento: {step: 3}, {vector: "ecommerce"}, {demo: "crm"}.
  -- jsonb e non colonne perché ogni evento ha dettagli suoi, e una
  -- tabella con trenta colonne quasi sempre nulle non si interroga meglio.
  props       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

comment on table public.funnel_events is
  'Passi della voronka pubblica: demo aperte, avanzamento configuratore, blueprint scaricati, lead inviati. Una sessione = una visita, non una persona.';

create index if not exists funnel_events_created_idx on public.funnel_events (created_at desc);
create index if not exists funnel_events_event_idx   on public.funnel_events (event, created_at desc);
create index if not exists funnel_events_session_idx on public.funnel_events (session_id);

alter table public.funnel_events enable row level security;

-- Scrittura aperta come per visitor_logs: l'inserimento arriva dal
-- browser via /api/track, che valida forma e dimensioni. Lettura solo
-- admin: sono dati di lavoro, non contenuto pubblico.
drop policy if exists fe_insert on public.funnel_events;
create policy fe_insert on public.funnel_events for insert with check (true);

drop policy if exists fe_admin_read on public.funnel_events;
create policy fe_admin_read on public.funnel_events for select using (public.is_admin());

drop policy if exists fe_admin_delete on public.funnel_events;
create policy fe_admin_delete on public.funnel_events for delete using (public.is_admin());

-- Pulizia gemella di prune_visitor_logs: gli eventi servono per capire
-- la voronka, non per l'archeologia.
create or replace function public.prune_funnel_events(p_days integer default 90)
returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if not public.is_admin() then
    raise exception 'solo admin';
  end if;
  delete from public.funnel_events where created_at < now() - make_interval(days => p_days);
  get diagnostics n = row_count;
  return n;
end $$;

-- ── 2 · STADI DELLA TRATTATIVA ──────────────────────────────
-- I tre valori storici restano validi: le righe esistenti non si toccano.
-- `contacted` diventa un sinonimo pratico di «qualificato a mano» finché
-- il pannello non lo sostituisce; la voronka canonica da qui in poi è
--   new → qualified → call_scheduled → proposal → won | lost | archived
alter table public.foundry_leads drop constraint if exists foundry_leads_status_check;
alter table public.foundry_leads
  add constraint foundry_leads_status_check
  check (status in ('new','contacted','qualified','call_scheduled','proposal','won','lost','archived'));

-- ── 3 · SCORING E ATTRIBUZIONE ──────────────────────────────
-- Lo score lo scrive /api/foundry-lead alla nascita del lead. È un intero
-- 0–100 pensato per ORDINARE la coda, non per decidere al posto di
-- qualcuno: la soglia di che cosa è «caldo» resta un giudizio umano.
alter table public.foundry_leads add column if not exists score smallint
  check (score is null or (score between 0 and 100));

-- Primo tocco della sessione, scritto una volta e mai aggiornato: la
-- domanda a cui risponde è «da dove è ARRIVATO», non «dove ha navigato».
alter table public.foundry_leads add column if not exists utm_source   text check (utm_source   is null or length(utm_source)   <= 120);
alter table public.foundry_leads add column if not exists utm_medium   text check (utm_medium   is null or length(utm_medium)   <= 120);
alter table public.foundry_leads add column if not exists utm_campaign text check (utm_campaign is null or length(utm_campaign) <= 120);
alter table public.foundry_leads add column if not exists first_referrer text check (first_referrer is null or length(first_referrer) <= 200);
alter table public.foundry_leads add column if not exists session_id   text check (session_id is null or length(session_id) <= 64);

comment on column public.foundry_leads.score is
  'Priorità 0–100 calcolata dal server alla nascita (complessità, moduli, sorgente). Ordina la coda: non è una decisione.';

-- La policy di INSERT anonimo elenca condizioni per colonna: le colonne
-- nuove sono scrivibili dall''endpoint perché la policy esistente non le
-- vieta (nessun check su di esse) — si verifica qui che sia ancora così
-- dopo eventuali repliche di questa migrazione su ambienti divergenti.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'foundry_leads' and policyname = 'fl_anon_insert'
  ) then
    raise warning 'fl_anon_insert assente: l''inserimento pubblico dei lead non funziona su questo ambiente';
  end if;
end $$;

-- ── 4 · LA VORONKA IN UNA FUNZIONE ──────────────────────────
-- Un'unica RPC per la carta in Overview: conteggi per settimana degli
-- ultimi p_weeks, già allineati (sessioni → demo → configuratore →
-- blueprint → lead). Il client non deve scaricare gli eventi grezzi.
create or replace function public.funnel_stats(p_weeks integer default 4)
returns jsonb
language sql security definer set search_path = public as $$
  with confini as (
    select date_trunc('week', now()) - make_interval(weeks => greatest(p_weeks, 1) - 1) as inizio
  ),
  settimane as (
    select generate_series(
      (select inizio from confini),
      date_trunc('week', now()),
      interval '1 week'
    ) as settimana
  ),
  sessioni as (
    select date_trunc('week', created_at) as settimana, count(distinct ip_hash) as n
    from visitor_logs
    where created_at >= (select inizio from confini)
    group by 1
  ),
  eventi as (
    select date_trunc('week', created_at) as settimana, event,
           count(distinct coalesce(session_id, id::text)) as n
    from funnel_events
    where created_at >= (select inizio from confini)
    group by 1, 2
  ),
  lead as (
    select date_trunc('week', created_at) as settimana,
           count(*) as tot,
           count(*) filter (where status in ('call_scheduled','proposal','won')) as avanzati,
           count(*) filter (where status = 'won') as vinti
    from foundry_leads
    where created_at >= (select inizio from confini)
    group by 1
  )
  select case when public.is_admin() then
    coalesce(jsonb_agg(jsonb_build_object(
      'week',        to_char(w.settimana, 'YYYY-MM-DD'),
      'sessions',    coalesce(s.n, 0),
      'demo',        coalesce((select n from eventi e where e.settimana = w.settimana and e.event = 'demo_open'), 0),
      'config',      coalesce((select n from eventi e where e.settimana = w.settimana and e.event = 'config_step'), 0),
      'blueprint',   coalesce((select n from eventi e where e.settimana = w.settimana and e.event = 'blueprint_pdf'), 0),
      'leads',       coalesce(l.tot, 0),
      'advanced',    coalesce(l.avanzati, 0),
      'won',         coalesce(l.vinti, 0)
    ) order by w.settimana), '[]'::jsonb)
  else null end
  from settimane w
  left join sessioni s on s.settimana = w.settimana
  left join lead l on l.settimana = w.settimana;
$$;

grant execute on function public.funnel_stats(integer) to authenticated;
grant execute on function public.prune_funnel_events(integer) to authenticated;
