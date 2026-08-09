-- ═══════════════════════════════════════════════════════════════════════════
-- PORTALE FORNITORI · nucleo multi-fornitore e dropshipping
-- PostgreSQL 15+
--
-- Tre idee reggono tutto lo schema:
--
--  1. L'offerta di un fornitore e il prodotto che vendiamo sono due cose
--     diverse. `supplier_products` è ciò che il fornitore dichiara, `products`
--     è ciò che pubblichiamo. Lo stesso prodotto può avere N offerte: è questa
--     separazione a rendere possibile il dropshipping multi-fornitore.
--
--  2. Il prezzo di vendita non si scrive a mano: si ricava dal costo tramite
--     una regola. `products.price_net` è materializzato per far leggere una
--     colonna sola allo storefront, ma resta sempre riconducibile alla regola
--     che l'ha prodotto (`price_rule_id`) e alla corsa che l'ha scritto.
--
--  3. Ogni sincronizzazione lascia una traccia interrogabile: `sync_runs` per
--     il riepilogo, `sync_events` per la riga di log. Il cruscotto legge da qui,
--     non da un file su disco del VPS.
--
-- Il denaro è sempre `numeric`, mai floating point: su 40.000 righe di costo
-- un doppio errore di arrotondamento diventa un margine sbagliato.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;   -- gen_random_uuid + cifratura credenziali
create extension if not exists citext;     -- codici articolo case-insensitive
create extension if not exists pg_trgm;    -- ricerca fuzzy sul nome articolo

-- ═══════════════════════════════════════════════════════════════════════════
-- 1 · FORNITORI E CONNESSIONI
-- ═══════════════════════════════════════════════════════════════════════════

create type supplier_transport as enum (
  'rest_json',   -- API REST che risponde JSON
  'soap_xml',    -- web service SOAP
  'feed_xml',    -- file XML esposto in HTTP
  'feed_csv',    -- file CSV esposto in HTTP
  'sftp_csv'     -- file depositato su SFTP
);

create type supplier_auth as enum (
  'none', 'api_key', 'basic', 'bearer', 'oauth2_cc', 'hmac', 'ssh_key'
);

create type supplier_state as enum ('bozza', 'attivo', 'sospeso', 'errore');

create table suppliers (
  id                uuid primary key default gen_random_uuid(),
  code              citext      not null unique,          -- "ROSSI", "EUROTHERM"
  name              text        not null,
  country           char(2)     not null default 'IT',
  vat_number        text,
  currency          char(3)     not null default 'EUR',

  -- ── come si parla con lui ────────────────────────────────────────────────
  transport         supplier_transport not null,
  auth              supplier_auth      not null default 'none',
  base_url          text,
  catalog_path      text,                                  -- endpoint/file del catalogo
  stock_path        text,                                  -- endpoint separato per le giacenze
  -- Modulo di codice dedicato. NULL = adattatore dichiarativo guidato da
  -- `field_map`: è la via normale, il modulo si scrive solo per le API storte.
  adapter_key       text,
  -- La mappatura è DATO, non codice: aggiungere un fornitore non è un deploy.
  --   {"items":"$.data.products",
  --    "fields":{"supplierSku":"code","costNet":["price.net","number"],
  --              "stock":["availability.qty","int"],"ean":"gtin"}}
  field_map         jsonb       not null default '{}'::jsonb,
  http_headers      jsonb       not null default '{}'::jsonb,

  -- ── ritmo e limiti ───────────────────────────────────────────────────────
  sync_cron         text        not null default '0 * * * *',
  sync_window       int4range,                             -- ore ammesse, es. [1,6)
  rate_limit_rpm    int         not null default 60,
  page_size         int         not null default 500,
  timeout_ms        int         not null default 30000,
  max_retries       int         not null default 3,

  -- ── condizioni commerciali ───────────────────────────────────────────────
  dropship          boolean     not null default false,
  lead_time_days    int         not null default 2,
  shipping_flat     numeric(12,4) not null default 0,
  free_shipping_over numeric(12,4),
  min_order         numeric(12,4) not null default 0,
  -- Sconto contrattuale già applicato dal fornitore sul listino che pubblica.
  cost_discount_pct numeric(5,2) not null default 0,

  -- ── stato osservato ──────────────────────────────────────────────────────
  state             supplier_state not null default 'bozza',
  last_run_at       timestamptz,
  last_ok_at        timestamptz,
  consecutive_errors int        not null default 0,
  notes             text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint suppliers_url_needed
    check (transport = 'sftp_csv' or base_url is not null)
);

create index on suppliers (state) where state = 'attivo';

-- Le credenziali stanno in una tabella a parte, cifrate, e non escono mai da
-- una select ordinaria. La chiave vive nell'ambiente del worker: il dump del
-- database, da solo, non basta a chiamare le API dei fornitori.
create table supplier_credentials (
  supplier_id  uuid primary key references suppliers(id) on delete cascade,
  secret_enc   bytea       not null,      -- pgp_sym_encrypt(jsonb::text, :key)
  key_id       text        not null,      -- quale chiave l'ha cifrata: serve a ruotare
  fingerprint  text        not null,      -- ultime 4 cifre, per mostrarle nel pannello
  rotated_at   timestamptz not null default now(),
  expires_at   timestamptz
);

-- Vista sicura: è questa che l'API del pannello interroga.
create view suppliers_public as
select s.*,
       (c.supplier_id is not null)              as has_credentials,
       c.fingerprint                            as credential_hint,
       c.rotated_at                             as credential_rotated_at,
       c.expires_at                             as credential_expires_at
from suppliers s
left join supplier_credentials c on c.supplier_id = s.id;

-- Solo il ruolo del worker può decifrare.
create function supplier_secret(p_supplier uuid, p_key text)
returns jsonb language sql security definer stable as $$
  select pgp_sym_decrypt(secret_enc, p_key)::jsonb
  from supplier_credentials where supplier_id = p_supplier
$$;
revoke all on function supplier_secret(uuid, text) from public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2 · ANAGRAFICA, IVA, PRODOTTI
-- ═══════════════════════════════════════════════════════════════════════════

create table tax_rates (
  id        uuid primary key default gen_random_uuid(),
  code      text    not null unique,       -- '22', '10', '4', '0-art41'
  rate      numeric(5,4) not null,         -- 0.2200
  label     text    not null,
  -- Natura ai fini SdI quando l'aliquota è zero (inversione contabile, art. 41…)
  natura    text,
  active    boolean not null default true
);

create table categories (
  id        uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id) on delete set null,
  slug      citext not null unique,
  name      text   not null,
  path      text[] not null default '{}'
);

create table products (
  id              uuid primary key default gen_random_uuid(),
  sku             citext not null unique,          -- il NOSTRO codice
  name            text   not null,
  description     text,
  category_id     uuid references categories(id) on delete set null,
  brand           text,
  uom             text   not null default 'pz',
  pack_size       int    not null default 1,
  tax_rate_id     uuid   not null references tax_rates(id),

  -- ── economia, materializzata dalla sincronizzazione ──────────────────────
  -- Costo dell'offerta migliore, già portato in EUR e comprensivo di trasporto
  -- allocato: è questo il numero su cui la regola calcola.
  cost_net        numeric(14,4),
  price_net       numeric(14,4),                   -- prezzo B2B calcolato
  price_rule_id   uuid,                            -- chi l'ha deciso
  price_computed_at timestamptz,
  -- Il prezzo a mano vince sempre sulla regola: senza questa valvola nessun
  -- commerciale si fida di un motore che riscrive i prezzi di notte.
  price_locked    boolean not null default false,
  price_manual    numeric(14,4),

  stock           int     not null default 0,
  primary_offer   uuid,                            -- FK aggiunta più sotto
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint products_price_positive check (price_net is null or price_net >= 0),
  constraint products_manual_needs_lock
    check (price_manual is null or price_locked)
);

create index on products (category_id);
create index on products using gin (name gin_trgm_ops);
create index on products (published) where published;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3 · OFFERTE DEI FORNITORI
--     Una riga per (fornitore, codice del fornitore). Il legame con il nostro
--     prodotto può mancare: un articolo appena comparso resta in attesa di
--     abbinamento invece di inquinare il catalogo.
-- ═══════════════════════════════════════════════════════════════════════════

create table supplier_products (
  id             uuid primary key default gen_random_uuid(),
  supplier_id    uuid not null references suppliers(id) on delete cascade,
  supplier_sku   citext not null,
  product_id     uuid references products(id) on delete set null,

  ean            text,
  name_raw       text not null,
  brand_raw      text,
  category_raw   text,

  cost_gross     numeric(14,4) not null,          -- come l'ha dichiarato lui
  currency       char(3) not null default 'EUR',
  fx_rate        numeric(14,8) not null default 1,
  cost_net       numeric(14,4) not null,          -- in EUR, sconto contratto applicato
  stock          int not null default 0,
  lead_time_days int,
  moq            int not null default 1,
  pack_size      int not null default 1,

  raw            jsonb not null default '{}'::jsonb,
  -- Impronta della riga normalizzata: se non cambia, la riga non si riscrive.
  -- È la differenza fra una corsa da 40.000 UPDATE e una da 300.
  hash           text not null,

  active         boolean not null default true,
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),

  unique (supplier_id, supplier_sku)
);

create index on supplier_products (product_id);
create index on supplier_products (ean) where ean is not null;
create index on supplier_products (supplier_id, active);

alter table products
  add constraint products_primary_offer_fk
  foreign key (primary_offer) references supplier_products(id) on delete set null;

-- L'offerta da servire: prima la disponibilità, poi il costo, poi la consegna.
-- In dropshipping è questa riga a decidere chi spedisce.
create view v_best_offer as
select distinct on (sp.product_id)
       sp.product_id, sp.id as offer_id, sp.supplier_id,
       sp.cost_net, sp.stock, coalesce(sp.lead_time_days, s.lead_time_days) as lead_time_days
from supplier_products sp
join suppliers s on s.id = sp.supplier_id
where sp.active and sp.product_id is not null and s.state = 'attivo'
order by sp.product_id,
         (sp.stock > 0) desc,
         sp.cost_net asc,
         coalesce(sp.lead_time_days, s.lead_time_days) asc;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4 · MOTORE DI PREZZO
--     Una regola dichiara un ambito e un modo di ricaricare. Vince la regola
--     più specifica; a parità, la priorità più alta. La risoluzione avviene
--     in Node (è testabile a unità), la vista qui sotto serve a spiegare in
--     SQL perché un articolo costa quello che costa.
-- ═══════════════════════════════════════════════════════════════════════════

create type markup_kind as enum (
  'percent_on_cost',  -- costo × (1 + v/100)          "ricarico del 30 %"
  'target_margin',    -- costo / (1 − v/100)          "voglio il 30 % di margine"
  'fixed_amount',     -- costo + v
  'fixed_price'       -- v, il costo non conta
);

create type rounding_kind as enum (
  'none', 'cents_99', 'cents_90', 'cents_50', 'integer_up', 'integer_near'
);

create table price_rules (
  id              uuid primary key default gen_random_uuid(),
  name            text    not null,
  active          boolean not null default true,
  priority        int     not null default 100,

  -- ── ambito: NULL significa "qualunque" ───────────────────────────────────
  supplier_id     uuid references suppliers(id) on delete cascade,
  category_id     uuid references categories(id) on delete cascade,
  brand           text,
  sku_pattern     text,                              -- 'VLV-%' (LIKE)
  cost_min        numeric(14,4),
  cost_max        numeric(14,4),

  -- ── che cosa fa ──────────────────────────────────────────────────────────
  kind            markup_kind not null,
  value           numeric(10,4) not null,
  -- Rete di sicurezza: qualunque cosa dica la regola, non si vende sotto questo
  -- margine. Un fornitore che sbaglia un decimale nel feed non ci fa vendere in perdita.
  min_margin_pct  numeric(5,2) not null default 0,
  max_price       numeric(14,4),
  rounding        rounding_kind not null default 'none',

  valid_from      date,
  valid_to        date,
  created_by      text,
  created_at      timestamptz not null default now(),

  constraint price_rules_band check (cost_min is null or cost_max is null or cost_min <= cost_max)
);

create index on price_rules (active, priority desc) where active;
create index on price_rules (supplier_id) where supplier_id is not null;

alter table products
  add constraint products_price_rule_fk
  foreign key (price_rule_id) references price_rules(id) on delete set null;

-- Specificità: quanto una regola "parla di questo articolo".
-- SKU 8 · marca 4 · categoria 2 · fornitore 1 · fascia di costo 1.
create function rule_specificity(r price_rules) returns int
language sql immutable as $$
  select (case when r.sku_pattern is not null then 8 else 0 end)
       + (case when r.brand       is not null then 4 else 0 end)
       + (case when r.category_id is not null then 2 else 0 end)
       + (case when r.supplier_id is not null then 1 else 0 end)
       + (case when r.cost_min is not null or r.cost_max is not null then 1 else 0 end)
$$;

-- Perché questo articolo costa così: una riga per prodotto con la regola vincente.
create view v_price_explain as
select distinct on (p.id)
       p.id as product_id, p.sku, p.cost_net, p.price_net,
       r.id as rule_id, r.name as rule_name, r.kind, r.value,
       rule_specificity(r) as specificity, r.priority
from products p
join v_best_offer bo on bo.product_id = p.id
join price_rules r on r.active
  and (r.supplier_id is null or r.supplier_id = bo.supplier_id)
  and (r.category_id is null or r.category_id = p.category_id)
  and (r.brand       is null or r.brand = p.brand)
  and (r.sku_pattern is null or p.sku like r.sku_pattern)
  and (r.cost_min    is null or p.cost_net >= r.cost_min)
  and (r.cost_max    is null or p.cost_net <= r.cost_max)
  and (r.valid_from  is null or r.valid_from <= current_date)
  and (r.valid_to    is null or r.valid_to   >= current_date)
order by p.id, rule_specificity(r) desc, r.priority desc, r.created_at desc;

-- Ogni movimento di costo o di prezzo resta scritto: è la tabella che risponde
-- a "perché ieri lo vendevamo a 12,40 e oggi a 13,10".
create table price_changes (
  id          bigserial primary key,
  product_id  uuid not null references products(id) on delete cascade,
  run_id      uuid,
  at          timestamptz not null default now(),
  old_cost    numeric(14,4),
  new_cost    numeric(14,4),
  old_price   numeric(14,4),
  new_price   numeric(14,4),
  rule_id     uuid references price_rules(id) on delete set null,
  reason      text not null            -- 'sync', 'regola', 'manuale', 'sblocco'
);

create index on price_changes (product_id, at desc);
create index on price_changes (at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5 · CODE E DIARIO DI SINCRONIZZAZIONE
-- ═══════════════════════════════════════════════════════════════════════════

create type sync_status  as enum ('in_coda','in_corso','ok','parziale','errore','annullato');
create type sync_trigger as enum ('cron','manuale','webhook','retry','primo_avvio');

create table sync_runs (
  id             uuid primary key default gen_random_uuid(),
  supplier_id    uuid not null references suppliers(id) on delete cascade,
  job_id         text,                       -- id BullMQ: lega la riga alla coda
  trigger        sync_trigger not null,
  status         sync_status  not null default 'in_coda',

  started_at     timestamptz,
  finished_at    timestamptz,
  duration_ms    int,

  read_count     int not null default 0,
  created_count  int not null default 0,
  updated_count  int not null default 0,
  unchanged_count int not null default 0,
  skipped_count  int not null default 0,
  error_count    int not null default 0,

  -- Il riassunto che il cruscotto mostra senza aprire il log.
  cost_up        int not null default 0,
  cost_down      int not null default 0,
  went_oos       int not null default 0,     -- finiti a zero
  back_in_stock  int not null default 0,
  price_changed  int not null default 0,

  error_text     text
);

create index on sync_runs (supplier_id, started_at desc);
create index on sync_runs (status) where status in ('in_coda','in_corso');

create table sync_events (
  id           bigserial primary key,
  run_id       uuid not null references sync_runs(id) on delete cascade,
  at           timestamptz not null default now(),
  level        text not null check (level in ('debug','info','warn','error')),
  supplier_sku text,
  code         text,        -- 'ean_mancante', 'costo_zero', 'http_429', 'mapping_ko'
  message      text not null,
  payload      jsonb
);

create index on sync_events (run_id, id);
create index on sync_events (level) where level in ('warn','error');

-- `sync_events` cresce di decine di migliaia di righe al giorno. Il diario
-- serve per capire cosa è successo di recente, non per l'eternità.
create function prune_sync_events(p_keep_days int default 30)
returns bigint language sql as $$
  with gone as (
    delete from sync_events where at < now() - make_interval(days => p_keep_days)
    returning 1
  ) select count(*) from gone
$$;

-- Due corse sullo stesso fornitore non devono sovrapporsi: un "Sincronizza
-- ora" premuto mentre gira il cron altrimenti scrive costi in ordine casuale.
create function try_lock_supplier(p_supplier uuid) returns boolean
language sql as $$
  select pg_try_advisory_lock(hashtext('supplier_sync'), hashtext(p_supplier::text))
$$;

create function unlock_supplier(p_supplier uuid) returns boolean
language sql as $$
  select pg_advisory_unlock(hashtext('supplier_sync'), hashtext(p_supplier::text))
$$;

-- Salute della connessione, così com'è disegnata nel pannello "Fornitori".
create view v_supplier_health as
select s.id, s.code, s.name, s.state, s.sync_cron,
       s.last_run_at, s.last_ok_at, s.consecutive_errors,
       (select count(*) from supplier_products sp where sp.supplier_id = s.id and sp.active) as offers,
       (select count(*) from supplier_products sp where sp.supplier_id = s.id and sp.active and sp.product_id is null) as unmatched,
       r.status  as last_status,
       r.duration_ms as last_duration_ms,
       r.error_count as last_errors,
       r.price_changed as last_price_changes
from suppliers s
left join lateral (
  select * from sync_runs sr
  where sr.supplier_id = s.id and sr.finished_at is not null
  order by sr.finished_at desc limit 1
) r on true;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6 · RUOLI
--     L'applicazione web non ha nessun motivo di poter scrivere sui costi.
-- ═══════════════════════════════════════════════════════════════════════════

create role app_web    nologin;
create role sync_agent nologin;

grant select on products, categories, tax_rates, suppliers_public, v_best_offer to app_web;
grant select, insert, update on price_rules to app_web;
grant select on sync_runs, sync_events, v_supplier_health to app_web;

grant select, insert, update, delete on all tables in schema public to sync_agent;
grant execute on function supplier_secret(uuid, text) to sync_agent;
grant execute on function try_lock_supplier(uuid), unlock_supplier(uuid) to sync_agent;
