-- ============================================================
-- PORTAL 27 · CONSERVAZIONE DEI DATI DI MISURAZIONE
--
-- L'informativa privacy pubblicata con la migrazione 26 dichiara:
-- «14 mesi per gli eventi singoli; oltre tale termine restano
-- soltanto totali aggregati che non si riferiscono a persone
-- identificabili». Un termine di conservazione scritto in
-- un'informativa e non applicato da nessuna parte è una
-- dichiarazione falsa resa all'interessato: è il principio di
-- limitazione della conservazione (articolo 5, paragrafo 1,
-- lettera e, del Regolamento) e va eseguito, non promesso.
--
-- Questa migrazione lo esegue. Prima di cancellare aggrega, così
-- la seconda metà della frase resta vera: i totali per giorno
-- sopravvivono, le righe che contengono l'impronta dell'IP e la
-- stringa del browser no.
--
-- Ridefinisce anche i due pulsanti di pulizia che il pannello
-- aveva già (prune_visitor_logs, prune_funnel_events): stessa
-- firma, ma ora aggregano prima di cancellare come fa il lavoro
-- notturno. Due strade che cancellano gli stessi dati con regole
-- diverse sono il modo più rapido di scoprire, a storico perso,
-- quale delle due era stata usata.
--
-- PERIMETRO. Solo i dati di misurazione (visitor_logs,
-- funnel_events), gli unici la cui cancellazione è puramente
-- meccanica. Le richieste di contatto («24 mesi dall'ultimo
-- contatto utile, salvo che nel frattempo nasca un rapporto
-- contrattuale») e il registro delle azioni del portale non
-- vengono toccati da qui: distinguere una richiesta scaduta da
-- una che è diventata un cliente richiede un giudizio, e un
-- lavoro notturno che cancella per conto suo i dati di un
-- cliente attivo farebbe un danno peggiore di quello che evita.
-- ============================================================

-- ── 1 · GLI AGGREGATI CHE SOPRAVVIVONO ──────────────────────

create table if not exists public.visitor_daily (
  day         date not null,
  page_path   text not null,
  device_type text not null,
  -- '' invece di null: fanno parte della chiave primaria, e una
  -- chiave con dentro un null non tiene insieme niente.
  country     text not null default '',
  views       integer not null default 0,
  -- Visitatori distinti DENTRO QUESTA RIGA. Non è sommabile fra
  -- righe: chi ha visto due pagine conta una volta per pagina.
  -- Scritto qui perché una colonna chiamata «uniques» sommata
  -- per sbaglio produce un numero che nessuno riesce a spiegare.
  uniques     integer not null default 0,
  primary key (day, page_path, device_type, country)
);

comment on table public.visitor_daily is
  'Totali giornalieri delle visite, scritti da enforce_retention() prima di cancellare le righe grezze di visitor_logs. Non contengono impronte IP né stringhe del browser: non si riferiscono a persone identificabili.';

create table if not exists public.funnel_daily (
  day      date not null,
  event    text not null,
  hits     integer not null default 0,
  sessions integer not null default 0,
  primary key (day, event)
);

comment on table public.funnel_daily is
  'Totali giornalieri degli eventi della voronka, scritti da enforce_retention() prima di cancellare le righe grezze di funnel_events.';

alter table public.visitor_daily enable row level security;
alter table public.funnel_daily  enable row level security;

-- Nessuna policy di scrittura: a scrivere è solo enforce_retention(),
-- che è security definer e non passa dalla RLS. Chi ha la chiave anon
-- non deve poter falsificare gli storici.
drop policy if exists vd_admin_read on public.visitor_daily;
create policy vd_admin_read on public.visitor_daily for select using (public.is_admin());

drop policy if exists fd_admin_read on public.funnel_daily;
create policy fd_admin_read on public.funnel_daily for select using (public.is_admin());

-- ── 2 · AGGREGARE, POI CANCELLARE ───────────────────────────
-- Due funzioni minuscole invece di un blocco copiato in tre punti: le
-- usano sia il lavoro notturno sia i due pulsanti di pulizia che il
-- pannello aveva già (prune_visitor_logs, prune_funnel_events), ridefiniti
-- più sotto. Prima quei due cancellavano e basta: chi premeva il pulsante
-- perdeva lo storico per sempre, e la seconda metà della frase
-- dell'informativa — «restano soltanto totali aggregati» — dipendeva da
-- quale strada aveva portato alla cancellazione. Ora la strada è una sola.

create or replace function public.rollup_visitor_daily(p_cutoff timestamptz)
returns integer
language plpgsql
security definer
set search_path = public
as $fn$
declare n integer;
begin
  insert into public.visitor_daily as d (day, page_path, device_type, country, views, uniques)
  select
    created_at::date,
    page_path,
    device_type,
    coalesce(country, ''),
    count(*),
    count(distinct ip_hash)
  from public.visitor_logs
  where created_at < p_cutoff
  group by 1, 2, 3, 4
  on conflict (day, page_path, device_type, country) do update
    -- Un giorno già aggregato può ricomparire solo se qualcosa è arrivato
    -- in ritardo: si somma invece di sovrascrivere, altrimenti il totale
    -- del giorno diventa quello dell'ultima passata. Le visite distinte
    -- non si possono sommare senza contare due volte chi torna, quindi si
    -- tiene il valore più alto: è una stima prudente, non un totale.
    set views = d.views + excluded.views,
        uniques = greatest(d.uniques, excluded.uniques);
  get diagnostics n = row_count;
  return n;
end;
$fn$;

create or replace function public.rollup_funnel_daily(p_cutoff timestamptz)
returns integer
language plpgsql
security definer
set search_path = public
as $fn$
declare n integer;
begin
  insert into public.funnel_daily as f (day, event, hits, sessions)
  select created_at::date, event, count(*), count(distinct session_id)
  from public.funnel_events
  where created_at < p_cutoff
  group by 1, 2
  on conflict (day, event) do update
    set hits = f.hits + excluded.hits,
        sessions = greatest(f.sessions, excluded.sessions);
  get diagnostics n = row_count;
  return n;
end;
$fn$;

revoke all on function public.rollup_visitor_daily(timestamptz) from public, anon, authenticated;
revoke all on function public.rollup_funnel_daily(timestamptz)  from public, anon, authenticated;

-- ── 3 · IL LAVORO DI CONSERVAZIONE ──────────────────────────

create or replace function public.enforce_retention(p_months int default 14)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  cutoff       timestamptz := now() - make_interval(months => greatest(p_months, 1));
  rolled_pages int := 0;
  rolled_ev    int := 0;
  killed_pages int := 0;
  killed_ev    int := 0;
begin
  -- Aggregare PRIMA di cancellare, e nella stessa transazione: se la
  -- cancellazione fallisce a metà non resta un aggregato che racconta
  -- righe ancora vive, e se fallisce l'aggregazione non si cancella
  -- niente. L'ordine inverso perderebbe i totali per sempre.
  rolled_pages := public.rollup_visitor_daily(cutoff);
  delete from public.visitor_logs where created_at < cutoff;
  get diagnostics killed_pages = row_count;

  rolled_ev := public.rollup_funnel_daily(cutoff);
  delete from public.funnel_events where created_at < cutoff;
  get diagnostics killed_ev = row_count;

  return jsonb_build_object(
    'cutoff', cutoff,
    'months', greatest(p_months, 1),
    'visitor_days_written', rolled_pages,
    'visitor_rows_deleted', killed_pages,
    'funnel_days_written', rolled_ev,
    'funnel_rows_deleted', killed_ev
  );
end;
$fn$;

comment on function public.enforce_retention(int) is
  'Applica il termine di conservazione dichiarato nell''informativa privacy: aggrega per giorno e cancella le righe di misurazione più vecchie di p_months mesi (14 di default).';

revoke all on function public.enforce_retention(int) from public, anon, authenticated;
-- L'esecuzione manuale resta possibile dall'SQL Editor con un ruolo
-- amministrativo; il lavoro pianificato gira come postgres.
grant execute on function public.enforce_retention(int) to service_role;

-- ── 4 · I DUE PULSANTI DEL PANNELLO, ORA CON L'AGGREGATO ────
-- Stessa firma e stesso valore di ritorno di prima (migrazioni 18 e 22):
-- src/lib/api/analytics.ts continua a chiamarli senza sapere che dentro è
-- cambiato qualcosa. Cambia solo che ciò che se ne va lascia un totale.

create or replace function public.prune_visitor_logs(p_days int default 365)
returns int language plpgsql security definer set search_path = public as $fn$
declare
  cutoff timestamptz := now() - make_interval(days => greatest(p_days, 1));
  n int;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  perform public.rollup_visitor_daily(cutoff);
  delete from public.visitor_logs where created_at < cutoff;
  get diagnostics n = row_count;
  return n;
end $fn$;

create or replace function public.prune_funnel_events(p_days integer default 90)
returns integer language plpgsql security definer set search_path = public as $fn$
declare
  cutoff timestamptz := now() - make_interval(days => greatest(p_days, 1));
  n integer;
begin
  if not public.is_admin() then raise exception 'solo admin'; end if;
  perform public.rollup_funnel_daily(cutoff);
  delete from public.funnel_events where created_at < cutoff;
  get diagnostics n = row_count;
  return n;
end $fn$;

revoke execute on function public.prune_visitor_logs(int) from public, anon;
grant execute on function public.prune_visitor_logs(int) to authenticated;
revoke execute on function public.prune_funnel_events(integer) from public, anon;
grant execute on function public.prune_funnel_events(integer) to authenticated;

-- ── 5 · LA PIANIFICAZIONE ───────────────────────────────────
-- pg_cron non è disponibile su tutti i progetti e non è attivo per
-- impostazione predefinita: se manca, la migrazione NON deve fallire —
-- lascerebbe il database a metà per una funzione accessoria. In quel
-- caso avvisa, e la pianificazione si aggiunge dal pannello Supabase
-- (Database → Extensions → pg_cron) rieseguendo questo blocco.
do $sched$
begin
  -- Un tentativo di accendere l'estensione da qui: su Supabase il ruolo
  -- postgres può farlo, e una pianificazione che richiede un passaggio
  -- manuale nel pannello è una pianificazione che nessuno attiva. Se il
  -- piano non la offre, l'eccezione viene raccolta e si prosegue.
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'Conservazione: pg_cron non attivabile da migrazione (%).', sqlerrm;
  end;

  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('nm-retention') from cron.job where jobname = 'nm-retention';
    -- Le 03:17 UTC e non le 03:00: a un orario tondo si accalca ogni
    -- lavoro pianificato di ogni progetto sulla stessa istanza.
    perform cron.schedule('nm-retention', '17 3 * * *', 'select public.enforce_retention()');
    raise notice 'Conservazione: lavoro nm-retention pianificato ogni notte alle 03:17 UTC.';
  else
    raise notice 'Conservazione: pg_cron non attivo. La funzione public.enforce_retention() esiste ed è eseguibile a mano; attivare pg_cron e rieseguire questo blocco per pianificarla.';
  end if;
end
$sched$;
