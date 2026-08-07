-- ============================================================
-- PORTAL 19 · MOTORE DI CRESCITA
--
-- Espansione di portal_18 con quattro cose che mancavano per
-- passare da «pannello che configura» a «pannello che porta
-- traffico»: misurazione completa (GTM, Pixel), indicizzazione
-- immediata (IndexNow), redirect gestiti a database, e la
-- registrazione dei 404 — che sono link rotti verso il sito,
-- cioè visite già guadagnate e buttate via.
--
-- NOTA SUL NOME DELLA COLONNA: la specifica chiedeva `slug` in
-- page_seo_configs. La colonna si chiama `page_slug` da
-- portal_18 ed è già in uso da sitemap, robots, llms.txt,
-- prerender e SEOHead. Rinominarla sarebbe stato un cambio
-- cosmetico pagato con cinque punti di rottura: resta com'è.
-- ============================================================

alter table public.site_settings
  add column if not exists gtm_container_id       text,
  add column if not exists meta_pixel_id          text,
  add column if not exists indexnow_key           text,
  add column if not exists cookie_consent_enabled boolean not null default false,
  add column if not exists promo_bar_active       boolean not null default false,
  add column if not exists promo_bar_text         text,
  add column if not exists promo_bar_link         text,
  add column if not exists organization_schema    jsonb;

update public.site_settings
set indexnow_key = replace(gen_random_uuid()::text, '-', '')
where indexnow_key is null;

create or replace view public.public_site_settings as
  select foundry_enabled, maintenance_mode, maintenance_message,
         site_name, default_meta_title, default_meta_description, default_og_image_url,
         google_analytics_id, gsc_verification_tag,
         gtm_container_id, meta_pixel_id, cookie_consent_enabled,
         promo_bar_active, promo_bar_text, promo_bar_link,
         organization_schema
  from public.site_settings limit 1;

grant select on public.public_site_settings to anon, authenticated;

create table if not exists public.redirects (
  id         uuid primary key default gen_random_uuid(),
  old_path   text not null unique,
  new_path   text not null,
  type       int  not null default 301 check (type in (301, 302)),
  active     boolean not null default true,
  hits       int not null default 0,
  note       text,
  created_at timestamptz not null default now(),
  constraint redirects_old_shape check (old_path ~ '^/'),
  constraint redirects_new_shape check (new_path ~ '^(/|https?://)'),
  constraint redirects_no_self check (old_path <> new_path)
);

create index if not exists redirects_lookup_idx on public.redirects (old_path) where active;

alter table public.redirects enable row level security;
drop policy if exists rd_public_read on public.redirects;
create policy rd_public_read on public.redirects for select using (true);
drop policy if exists rd_admin_write on public.redirects;
create policy rd_admin_write on public.redirects for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.not_found_logs (
  id         uuid primary key default gen_random_uuid(),
  path       text not null,
  referrer   text,
  user_agent text,
  ip_hash    text,
  is_bot     boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists nfl_created_idx on public.not_found_logs (created_at desc);
create index if not exists nfl_path_idx    on public.not_found_logs (path, created_at desc);

alter table public.not_found_logs enable row level security;
drop policy if exists nfl_insert on public.not_found_logs;
create policy nfl_insert on public.not_found_logs for insert with check (true);
drop policy if exists nfl_admin_read on public.not_found_logs;
create policy nfl_admin_read on public.not_found_logs for select using (public.is_admin());
drop policy if exists nfl_admin_delete on public.not_found_logs;
create policy nfl_admin_delete on public.not_found_logs for delete using (public.is_admin());

create or replace function public.not_found_stats(p_hours int default 168)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  with win as (
    select * from public.not_found_logs
    where created_at >= now() - make_interval(hours => greatest(p_hours, 1))
  )
  select jsonb_build_object(
    'total',  (select count(*) from win),
    'humans', (select count(*) from win where not is_bot),
    'paths',  coalesce((select jsonb_agg(x) from (
                select path, count(*) as hits,
                       count(*) filter (where not is_bot) as human_hits,
                       max(created_at) as last_seen,
                       (array_agg(referrer order by created_at desc)
                          filter (where referrer is not null))[1] as top_referrer
                from win group by path order by count(*) desc limit 25) x), '[]'::jsonb)
  ) into v;
  return v;
end $$;

revoke execute on function public.not_found_stats(int) from public, anon;
grant execute on function public.not_found_stats(int) to authenticated;

create or replace function public.prune_not_found_logs(p_days int default 90)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  delete from public.not_found_logs where created_at < now() - make_interval(days => greatest(p_days, 1));
  get diagnostics n = row_count;
  return n;
end $$;

revoke execute on function public.prune_not_found_logs(int) from public, anon;
grant execute on function public.prune_not_found_logs(int) to authenticated;

create or replace function public.bump_redirect(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.redirects set hits = hits + 1 where id = p_id;
$$;

grant execute on function public.bump_redirect(uuid) to anon, authenticated;
