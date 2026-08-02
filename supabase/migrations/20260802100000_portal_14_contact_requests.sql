-- ============================================================
-- PORTAL 14 · RICHIESTE DAL MODULO CONTATTI
-- Le richieste generiche entrano nella stessa tabella dei lead
-- del configuratore: un solo elenco di posta in arrivo invece
-- di due. La colonna `source` le distingue ('contatti' vs
-- 'configuratore', che resta il valore predefinito).
--
-- Servono due aggiustamenti:
--   1. un posto per il testo libero e per l'azienda, che il
--      configuratore non ha perché lì il messaggio è la
--      configurazione stessa;
--   2. i campi del vettore diventano opzionali: chi scrive dal
--      modulo contatti non ha scelto nessuna architettura, e
--      finora quelle colonne erano NOT NULL.
-- ============================================================

alter table public.foundry_leads
  add column if not exists message text,
  add column if not exists company text;

alter table public.foundry_leads
  alter column vector_id   drop not null,
  alter column vector_label drop not null,
  alter column vector_node  drop not null;

-- Il messaggio libero è l'unico testo che arriva davvero dal
-- visitatore: la policy per anon lo limita, come già fa con nome
-- ed email, così l'endpoint non può essere usato per depositare
-- contenuto di dimensione arbitraria.
drop policy if exists fl_anon_insert on public.foundry_leads;

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
    and (message is null or length(message) <= 4000)
    and (company is null or length(company) <= 200)
    and source in ('configuratore', 'contatti')
  );

-- L'elenco in admin filtra spesso per provenienza.
create index if not exists foundry_leads_source_idx
  on public.foundry_leads (source, created_at desc);
