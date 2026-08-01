-- ============================================================
-- PORTAL 13 · FOUNDRY LEADS (Solution Architect configurator)
-- Richieste generate dal configuratore in home page: contatto +
-- architettura scelta (nucleo, moduli, complessità, resoconto).
--
-- Chi scrive: visitatori NON autenticati, tramite la funzione
-- serverless /api/foundry-lead che usa la chiave anon.
-- Per questo il ruolo `anon` ha INSERT — e SOLO insert: non può
-- rileggere nulla, quindi la tabella non è un elenco di contatti
-- esposto al pubblico. La lettura resta agli admin.
-- ============================================================

create table if not exists public.foundry_leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  messenger    text,
  vector_id    text not null,
  vector_label text not null,
  vector_node  text not null,
  vector_stack text,
  complexity   text,
  weeks        text,
  level        smallint,
  module_ids   text[] not null default '{}',
  -- copia leggibile dei moduli: [{node, tech, group}]
  modules      jsonb  not null default '[]'::jsonb,
  -- resoconto rigenerato server-side: {obiettivo, architettura, scaffali}
  blueprint    jsonb,
  status       text not null default 'new' check (status in ('new','contacted','archived')),
  admin_note   text,
  source       text not null default 'configuratore',
  page         text,
  email_sent   boolean not null default false,
  created_at   timestamptz not null default now(),
  handled_at   timestamptz
);

alter table public.foundry_leads enable row level security;

create index if not exists foundry_leads_created_idx on public.foundry_leads (created_at desc);
create index if not exists foundry_leads_status_idx  on public.foundry_leads (status, created_at desc);

drop policy if exists fl_admin_all   on public.foundry_leads;
drop policy if exists fl_anon_insert on public.foundry_leads;

create policy fl_admin_all on public.foundry_leads for all
  using (public.is_admin()) with check (public.is_admin());

-- Il visitatore può solo depositare la richiesta: niente select, update
-- o delete. `status`/`admin_note`/`handled_at` restano ai valori di default
-- perché un INSERT non può scrivere colonne che la policy non consente di
-- rileggere, e comunque il check impone i soli valori iniziali.
create policy fl_anon_insert on public.foundry_leads for insert
  to anon
  with check (
    status = 'new'
    and admin_note is null
    and handled_at is null
    and length(name) between 1 and 200
    and length(email) between 3 and 200
    and email like '%_@_%.__%'
    and coalesce(array_length(module_ids, 1), 0) <= 40
  );

-- RLS filtra le righe, i GRANT aprono la tabella al ruolo: servono entrambi.
grant insert on public.foundry_leads to anon;
grant select, insert, update, delete on public.foundry_leads to authenticated;

-- L'elenco in admin si aggiorna da solo all'arrivo di una richiesta.
do $$
begin
  alter publication supabase_realtime add table public.foundry_leads;
exception when duplicate_object then null;
end $$;
