-- ============================================================
-- PORTAL 23 · IL DOMINIO VERO NEI DATI STRUTTURATI
--
-- I seed 19c e 21 scrivevano i JSON-LD con https://nadiamaar.com
-- come identità (@id di Organization, Person, WebSite, gli URL dei
-- breadcrumb). Quel dominio non è mai stato registrato: il sito
-- vive su https://www.nadiamaar.dev. Finché i dati strutturati
-- puntano a un indirizzo inesistente, Google vede pagine vere che
-- dichiarano di appartenere a un'entità che non risponde.
--
-- La riscrittura è testuale sul jsonb serializzato: il vecchio
-- dominio compare SOLO come prefisso di URL, quindi una replace
-- non può toccare altro. Idempotente per costruzione — al secondo
-- giro non trova più nulla da sostituire.
--
-- canonical_url non si tocca: è null su tutte le righe (verificato
-- prima di scrivere questa migrazione), e il canonico si calcola
-- dall'host della richiesta.
-- ============================================================

-- Le schede SEO per pagina (JSON-LD con @graph, breadcrumb, ecc.)
update public.page_seo_configs
set json_ld_schema = regexp_replace(
      json_ld_schema::text,
      'https://nadiamaar\.com',
      'https://www.nadiamaar.dev',
      'g'
    )::jsonb,
    updated_at = now()
where json_ld_schema::text like '%nadiamaar.com%';

-- Lo schema dell'organizzazione che /api/prerender inietta su OGNI
-- pagina, comprese quelle senza scheda propria.
update public.site_settings
set organization_schema = regexp_replace(
      organization_schema::text,
      'https://nadiamaar\.com',
      'https://www.nadiamaar.dev',
      'g'
    )::jsonb
where organization_schema::text like '%nadiamaar.com%';

-- L'immagine social predefinita, se qualcuno l'avesse salvata con il
-- vecchio dominio dal pannello.
update public.site_settings
set default_og_image_url = replace(default_og_image_url, 'https://nadiamaar.com', 'https://www.nadiamaar.dev')
where default_og_image_url like '%nadiamaar.com%';

-- Controllo leggibile in fondo all'esecuzione: se resta un riferimento
-- al vecchio dominio da qualche parte, meglio saperlo adesso.
do $$
declare n integer;
begin
  select count(*) into n from public.page_seo_configs
  where json_ld_schema::text like '%nadiamaar.com%';
  if n > 0 then
    raise warning 'DOMINIO: % schede SEO citano ancora nadiamaar.com', n;
  else
    raise notice 'DOMINIO: nessun riferimento residuo a nadiamaar.com nelle schede SEO.';
  end if;
end $$;
