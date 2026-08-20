-- ============================================================
-- PORTAL 20 · SEO MULTILINGUA (it / en)
--
-- ── PERCHÉ UNA RIGA PER LINGUA E NON UN JSONB ───────────────
-- L'alternativa era `meta_title jsonb` = {"it": "...", "en": "..."}.
-- Scartata, per quattro motivi concreti su QUESTO schema:
--
--  1. Compatibilità. meta_title/meta_description sono `text` e li
--     leggono già cinque funzioni serverless (prerender, sitemap,
--     og, robots, llms) più il pannello. Convertirli in jsonb
--     obbligherebbe a riscrivere ogni lettura nello stesso commit,
--     con il sito in produzione. Una colonna `locale` con default
--     'it' non rompe niente: le righe esistenti DIVENTANO le righe
--     italiane, senza toccare un byte di contenuto.
--
--  2. «Non ancora tradotto» ha bisogno di essere rappresentabile.
--     Con il jsonb è una chiave assente dentro una riga che esiste,
--     e ogni lettore deve ricordarsi di gestirla. Con una riga per
--     lingua è semplicemente una riga che non c'è — e questa
--     differenza la usiamo davvero: /en senza riga = noindex, così
--     Google non indicizza una pagina inglese che è ancora italiana.
--
--  3. Vincoli veri. `check (length(meta_title) <= 60)` si scrive su
--     una colonna text; dentro un jsonb diventa un trigger.
--
--  4. Costo di lettura. Il lettore prende UNA riga per (pagina,
--     lingua) attraverso un indice unico. Con il jsonb prenderebbe
--     una riga che contiene anche la lingua che non gli serve, per
--     poi scartarne metà. A due lingue la differenza è trascurabile;
--     a sei lingue, no.
--
-- Il prezzo è una query in più per sapere quali lingue esistono per
-- una pagina (serve agli hreflang). È una select su indice, e la
-- paghiamo solo nel prerender e nella sitemap.
--
-- ── PAGE_SLUG RESTA L'INDIRIZZO CANONICO ────────────────────
-- '/about' per entrambe le lingue. L'URL pubblico inglese (/en/about)
-- si CALCOLA da slug + locale, non si scrive a database: due colonne
-- che devono restare d'accordo fra loro prima o poi non lo sono.
-- ============================================================

-- ── 1 · LA DIMENSIONE LINGUA ────────────────────────────────
alter table public.page_seo_configs
  add column if not exists locale text not null default 'it';

comment on column public.page_seo_configs.locale is
  'Lingua della scheda. Il page_slug resta l''indirizzo canonico senza prefisso: /en si calcola.';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'page_seo_locale_supported'
  ) then
    alter table public.page_seo_configs
      add constraint page_seo_locale_supported check (locale in ('it', 'en'));
  end if;
end $$;

-- ── 2 · UNICITÀ: UNA SCHEDA PER PAGINA **E** LINGUA ─────────
-- Il vincolo vecchio era su page_slug da solo: con due lingue
-- impedirebbe la seconda riga. Va sostituito, non affiancato.
alter table public.page_seo_configs
  drop constraint if exists page_seo_configs_page_slug_key;

create unique index if not exists page_seo_slug_locale_uidx
  on public.page_seo_configs (page_slug, locale);

-- L'upsert del pannello punta a questo vincolo per nome: PostgREST
-- vuole un constraint, non un semplice indice.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'page_seo_slug_locale_key'
  ) then
    alter table public.page_seo_configs
      add constraint page_seo_slug_locale_key unique using index page_seo_slug_locale_uidx;
  end if;
end $$;

-- ── 3 · LINGUE DISPONIBILI PER PAGINA (per gli hreflang) ────
-- Una vista invece di una query ripetuta in tre funzioni: gli
-- hreflang devono essere RECIPROCI (ogni versione elenca tutte le
-- altre, sé stessa compresa) e un elenco calcolato in tre posti
-- diversi prima o poi diventa tre elenchi diversi.
--
-- Le pagine con is_noindex non entrano: dichiarare come alternativa
-- una pagina che chiediamo di non indicizzare è una contraddizione
-- che Google segnala in Search Console.
create or replace view public.page_seo_alternates as
  select
    page_slug,
    array_agg(locale order by locale) as locales,
    max(updated_at)                   as updated_at
  from public.page_seo_configs
  where is_noindex = false
  group by page_slug;

grant select on public.page_seo_alternates to anon, authenticated;

comment on view public.page_seo_alternates is
  'Lingue pubblicate per ogni pagina. Alimenta gli hreflang del prerender e della sitemap.';

-- ── 4 · SEED INGLESE MINIMO ─────────────────────────────────
-- Solo la home. Le altre pagine inglesi restano volutamente SENZA
-- riga: finché il testo della pagina è italiano, /en/<pagina> è un
-- doppione: il prerender la marca noindex e nessun hreflang la
-- annuncia. Si accendono una alla volta dal pannello, man mano che
-- il contenuto viene tradotto davvero — che è l'unico momento in cui
-- ha senso chiedere a Google di indicizzarle.
insert into public.page_seo_configs
  (page_slug, locale, meta_title, meta_description, keywords, is_noindex)
values
  ('/', 'en',
   'Nadia Maar — High-Performance Digital Architecture',
   'Custom full-stack development: e-commerce, web apps and scalable platforms engineered for speed and conversion. One partner, from code to growth.',
   array['custom web development','digital architecture','full-stack developer italy',
         'headless e-commerce','web application','web performance','core web vitals'],
   false)
on conflict (page_slug, locale) do nothing;
