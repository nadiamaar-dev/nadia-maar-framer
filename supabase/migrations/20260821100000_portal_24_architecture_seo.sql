-- ============================================================
-- PORTAL 24 · LE SCHEDE SEO DI /architecture (it + en)
--
-- La pagina è il manifesto tecnico del sito: senza riga inglese
-- il prerender la marcherebbe noindex su /en/architecture (regola
-- giusta: lingua non tradotta = niente indice), e senza riga
-- italiana l'hreflang resterebbe un gruppo di uno.
--
-- Stesse regole del seed 21: titoli sotto i 60 caratteri,
-- descrizioni sotto i 158, `do nothing` sul conflitto — se
-- qualcuno ha già scritto la scheda dal pannello, vince la sua.
-- I dati strutturati riusano gli @id esistenti (#organization,
-- #person): stessa entità in entrambe le lingue.
-- ============================================================

insert into public.page_seo_configs
  (page_slug, locale, meta_title, meta_description, keywords, is_noindex, json_ld_schema)
values

('/architecture', 'it',
 'L''architettura di questo sito — Nadia Maar',
 'Come è costruito nadiamaar.dev: prerender per i crawler, sicurezza a livello di database, analytics senza cookie e un budget di prestazione pubblico.',
 array['architettura web','performance web','core web vitals',
       'row level security','jamstack italia'],
 false,
 jsonb_build_object(
   '@context', 'https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type', 'TechArticle',
       '@id', 'https://www.nadiamaar.dev/architecture#article',
       'headline', 'L''architettura di questo sito',
       'description', 'Le decisioni tecniche dietro nadiamaar.dev, documentate perché ogni affermazione sia verificabile: prerender per i crawler, RLS, caratteri self-hosted, analytics senza cookie, budget di prestazione.',
       'inLanguage', 'it',
       'url', 'https://www.nadiamaar.dev/architecture',
       'author', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#person'),
       'publisher', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#organization')
     ),
     jsonb_build_object(
       '@type', 'BreadcrumbList',
       '@id', 'https://www.nadiamaar.dev/architecture#breadcrumb',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://www.nadiamaar.dev/'),
         jsonb_build_object('@type','ListItem','position',2,'name','Architettura','item','https://www.nadiamaar.dev/architecture')
       )
     )
   )
 )),

('/architecture', 'en',
 'How this site is built — Nadia Maar',
 'Under the hood of nadiamaar.dev: crawler prerendering, database-level security, cookieless analytics and a public performance budget.',
 array['web architecture','web performance','core web vitals',
       'row level security','technical seo'],
 false,
 jsonb_build_object(
   '@context', 'https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type', 'TechArticle',
       '@id', 'https://www.nadiamaar.dev/en/architecture#article',
       'headline', 'How this site is built',
       'description', 'The technical decisions behind nadiamaar.dev, documented so every claim can be verified: crawler prerendering, RLS, self-hosted fonts, cookieless analytics, a performance budget.',
       'inLanguage', 'en',
       'url', 'https://www.nadiamaar.dev/en/architecture',
       'author', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#person'),
       'publisher', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#organization')
     ),
     jsonb_build_object(
       '@type', 'BreadcrumbList',
       '@id', 'https://www.nadiamaar.dev/en/architecture#breadcrumb',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://www.nadiamaar.dev/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','Architecture','item','https://www.nadiamaar.dev/en/architecture')
       )
     )
   )
 ))

on conflict (page_slug, locale) do nothing;
