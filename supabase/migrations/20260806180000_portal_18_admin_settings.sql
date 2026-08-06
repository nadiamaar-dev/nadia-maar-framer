-- ============================================================
-- PORTAL 18 · IMPOSTAZIONI, SEO E ANALYTICS INTERNE
--
-- Tre tabelle e una vista. La vista è la parte che conta:
-- `site_settings` contiene una chiave API, quindi non può
-- essere leggibile da chiunque — ma il sito pubblico ha
-- bisogno di due campi (l'interruttore /foundry e l'ID GA4)
-- prima ancora che qualcuno abbia fatto login. La vista
-- espone quei due campi e nient'altro.
-- ============================================================

-- ── 1 · IMPOSTAZIONI DEL SITO (riga singola) ────────────────
create table if not exists public.site_settings (
  id                    uuid primary key default gen_random_uuid(),
  -- interruttore di visibilità della rotta /foundry
  foundry_enabled       boolean not null default true,
  -- modalità manutenzione: spegne il sito pubblico lasciando vivo il portale
  maintenance_mode      boolean not null default false,
  maintenance_message   text,
  -- metadati predefiniti, usati quando una pagina non ha una sua scheda SEO
  site_name             text not null default 'Nadia Maar',
  default_meta_title    text,
  default_meta_description text,
  default_og_image_url  text,
  -- misurazione
  google_analytics_id   text,          -- G-XXXXXXXXXX
  gsc_verification_tag  text,          -- token del meta google-site-verification
  pagespeed_api_key     text,          -- opzionale: alza la quota dell'API PSI
  updated_at            timestamptz not null default now(),
  -- Una riga sola, imposta dallo schema e non dalla buona volontà del codice:
  -- due righe di impostazioni vorrebbero dire due siti diversi a seconda di
  -- quale query arriva prima.
  singleton             boolean not null default true,
  constraint site_settings_one_row unique (singleton),
  constraint site_settings_singleton_true check (singleton)
);

insert into public.site_settings (foundry_enabled)
select true
where not exists (select 1 from public.site_settings);

alter table public.site_settings enable row level security;

drop policy if exists ss_admin_all on public.site_settings;
create policy ss_admin_all on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- La vista pubblica: solo ciò che serve al browser di un visitatore anonimo.
-- `security_invoker = off` (predefinito) la fa girare con i diritti del
-- proprietario, quindi passa sopra la RLS della tabella — che è esattamente
-- lo scopo: dare tre campi senza dare la chiave API accanto.
create or replace view public.public_site_settings as
  select foundry_enabled, maintenance_mode, maintenance_message,
         site_name, default_meta_title, default_meta_description, default_og_image_url,
         google_analytics_id, gsc_verification_tag
  from public.site_settings
  limit 1;

grant select on public.public_site_settings to anon, authenticated;

-- ── 2 · SCHEDE SEO PER PAGINA ───────────────────────────────
create table if not exists public.page_seo_configs (
  id               uuid primary key default gen_random_uuid(),
  page_slug        text not null unique,     -- '/', '/foundry', '/about'…
  meta_title       text,
  meta_description text,
  og_image_url     text,
  keywords         text[] not null default '{}',
  canonical_url    text,
  is_noindex       boolean not null default false,
  json_ld_schema   jsonb,
  updated_at       timestamptz not null default now(),
  -- Uno slug è una rotta: deve iniziare con "/" e non finirci (salvo la home),
  -- altrimenti '/about' e '/about/' diventano due schede per la stessa pagina.
  constraint page_seo_slug_shape check (page_slug ~ '^/([a-z0-9/_-]*[a-z0-9])?$')
);

alter table public.page_seo_configs enable row level security;

-- Lettura pubblica: la usano <SEOHead>, la sitemap e llms.txt, tutti
-- raggiungibili senza login. Non c'è niente di riservato in una meta tag.
drop policy if exists psc_public_read on public.page_seo_configs;
create policy psc_public_read on public.page_seo_configs for select using (true);

drop policy if exists psc_admin_write on public.page_seo_configs;
create policy psc_admin_write on public.page_seo_configs
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 3 · ANALYTICS INTERNE ───────────────────────────────────
-- Nessun cookie e nessun IP in chiaro: solo un'impronta salata, che basta a
-- distinguere due visitatori e non basta a risalire a una persona.
create table if not exists public.visitor_logs (
  id          uuid primary key default gen_random_uuid(),
  page_path   text not null,
  referrer    text,
  user_agent  text,
  ip_hash     text,
  device_type text not null default 'desktop' check (device_type in ('mobile','tablet','desktop','bot')),
  country     text,
  created_at  timestamptz not null default now()
);

create index if not exists visitor_logs_created_idx on public.visitor_logs (created_at desc);
create index if not exists visitor_logs_path_idx    on public.visitor_logs (page_path, created_at desc);

alter table public.visitor_logs enable row level security;

-- Inserimento aperto perché a scrivere è la funzione /api/track con la chiave
-- anon: il visitatore non è autenticato, per definizione. Non c'è policy di
-- lettura per anon, quindi la tabella si può riempire ma non sfogliare.
drop policy if exists vl_insert on public.visitor_logs;
create policy vl_insert on public.visitor_logs for insert with check (true);

drop policy if exists vl_admin_read on public.visitor_logs;
create policy vl_admin_read on public.visitor_logs for select using (public.is_admin());

drop policy if exists vl_admin_delete on public.visitor_logs;
create policy vl_admin_delete on public.visitor_logs for delete using (public.is_admin());

-- ── 4 · AGGREGATI ───────────────────────────────────────────
-- Aggregare nel browser vorrebbe dire scaricare ogni singola riga: funziona
-- con mille visite e smette di funzionare proprio quando le analytics
-- iniziano a servire davvero. Qui conta il database e torna un solo JSON.
create or replace function public.visitor_stats(p_hours int default 24)
returns jsonb
language sql stable security definer set search_path = public as $$
  with win as (
    select * from public.visitor_logs
    where created_at >= now() - make_interval(hours => greatest(p_hours, 1))
      and device_type <> 'bot'
  )
  select jsonb_build_object(
    'pageviews',      (select count(*) from win),
    'uniques',        (select count(distinct ip_hash) from win where ip_hash is not null),
    'top_pages',      coalesce((select jsonb_agg(x) from (
                        select page_path as path, count(*) as views,
                               count(distinct ip_hash) as uniques
                        from win group by page_path order by count(*) desc limit 10) x), '[]'::jsonb),
    'devices',        coalesce((select jsonb_agg(x) from (
                        select device_type as device, count(*) as views
                        from win group by device_type order by count(*) desc) x), '[]'::jsonb),
    'referrers',      coalesce((select jsonb_agg(x) from (
                        select coalesce(nullif(referrer, ''), 'diretto') as source, count(*) as views
                        from win group by 1 order by count(*) desc limit 10) x), '[]'::jsonb),
    'by_hour',        coalesce((select jsonb_agg(x order by x.bucket) from (
                        select date_trunc('hour', created_at) as bucket, count(*) as views
                        from win group by 1) x), '[]'::jsonb)
  );
$$;

revoke execute on function public.visitor_stats(int) from public, anon;
grant execute on function public.visitor_stats(int) to authenticated;

-- Il security definer scavalca la RLS, quindi il controllo va rifatto qui:
-- senza, qualunque utente autenticato leggerebbe le statistiche del sito.
create or replace function public.visitor_stats_guarded(p_hours int default 24)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  return public.visitor_stats(p_hours);
end $$;

revoke execute on function public.visitor_stats_guarded(int) from public, anon;
grant execute on function public.visitor_stats_guarded(int) to authenticated;

-- ── 5 · PULIZIA ─────────────────────────────────────────────
-- I log grezzi non servono per sempre: dopo un anno restano peso e rischio.
create or replace function public.prune_visitor_logs(p_days int default 365)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  delete from public.visitor_logs where created_at < now() - make_interval(days => greatest(p_days, 1));
  get diagnostics n = row_count;
  return n;
end $$;

revoke execute on function public.prune_visitor_logs(int) from public, anon;
grant execute on function public.prune_visitor_logs(int) to authenticated;

-- ── 6 · updated_at ──────────────────────────────────────────
drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_page_seo_updated_at on public.page_seo_configs;
create trigger trg_page_seo_updated_at before update on public.page_seo_configs
  for each row execute function public.set_updated_at();
