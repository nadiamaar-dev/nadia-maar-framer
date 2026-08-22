-- ============================================================
-- PORTAL 26 · LE SCHEDE SEO DELLE TRE PAGINE LEGALI (it + en)
--
-- /privacy, /cookie-policy e /termini nascono con la riga in
-- entrambe le lingue per la stessa ragione del seed 24: senza
-- riga inglese il prerender marca noindex /en/privacy — regola
-- giusta, lingua non tradotta uguale niente indice — e qui la
-- traduzione c'è davvero, quindi la regola punirebbe una pagina
-- completa. Senza riga italiana l'hreflang resterebbe un gruppo
-- di uno, che Google scarta per intero.
--
-- Le pagine restano indicizzabili (is_noindex = false): sono
-- documenti che devono essere pubblicamente raggiungibili e
-- citabili, ed è il footer a portarcele da ogni pagina.
--
-- Stesse regole dei seed precedenti: titoli sotto i 60 caratteri,
-- descrizioni sotto i 158, `do nothing` sul conflitto — se
-- qualcuno ha già scritto la scheda dal pannello, vince la sua.
-- I dati strutturati riusano gli @id esistenti (#organization),
-- così le tre pagine restano attaccate all'entità del sito
-- invece di presentarsi come documenti orfani.
-- ============================================================

insert into public.page_seo_configs
  (page_slug, locale, meta_title, meta_description, keywords, is_noindex, json_ld_schema)
values

-- ── /privacy ────────────────────────────────────────────────
('/privacy', 'it',
 'Informativa privacy — Nadia Maar',
 'Quali dati raccoglie il sito, per quali finalità, su quale base giuridica e per quanto tempo. Statistiche senza cookie, IP mai conservato in chiaro, diritti dell''interessato.',
 array['informativa privacy','gdpr','trattamento dati personali',
       'diritti dell''interessato','protezione dei dati'],
 false,
 jsonb_build_object(
   '@context', 'https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type', 'WebPage',
       '@id', 'https://www.nadiamaar.dev/privacy#webpage',
       'name', 'Informativa sul trattamento dei dati personali',
       'description', 'Informativa resa ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679: titolare, dati trattati, finalità, basi giuridiche, destinatari, trasferimenti, conservazione e diritti.',
       'inLanguage', 'it',
       'url', 'https://www.nadiamaar.dev/privacy',
       'publisher', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#organization')
     ),
     jsonb_build_object(
       '@type', 'BreadcrumbList',
       '@id', 'https://www.nadiamaar.dev/privacy#breadcrumb',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://www.nadiamaar.dev/'),
         jsonb_build_object('@type','ListItem','position',2,'name','Privacy','item','https://www.nadiamaar.dev/privacy')
       )
     )
   )
 )),

('/privacy', 'en',
 'Privacy notice — Nadia Maar',
 'What data the site collects, for which purposes, on which legal basis and for how long. Cookieless statistics, IP never stored in clear, data subject rights.',
 array['privacy notice','gdpr','personal data processing',
       'data subject rights','data protection'],
 false,
 jsonb_build_object(
   '@context', 'https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type', 'WebPage',
       '@id', 'https://www.nadiamaar.dev/en/privacy#webpage',
       'name', 'Personal data protection notice',
       'description', 'Notice provided under Articles 13 and 14 of Regulation (EU) 2016/679: controller, data processed, purposes, legal bases, recipients, transfers, retention and rights.',
       'inLanguage', 'en',
       'url', 'https://www.nadiamaar.dev/en/privacy',
       'publisher', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#organization')
     ),
     jsonb_build_object(
       '@type', 'BreadcrumbList',
       '@id', 'https://www.nadiamaar.dev/en/privacy#breadcrumb',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://www.nadiamaar.dev/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','Privacy','item','https://www.nadiamaar.dev/en/privacy')
       )
     )
   )
 )),

-- ── /cookie-policy ──────────────────────────────────────────
('/cookie-policy', 'it',
 'Cookie policy — Nadia Maar',
 'Elenco completo di cookie e memorie del browser usati dal sito, con finalità e durata. Nessun cookie di profilazione proprio; le terze parti partono solo col consenso.',
 array['cookie policy','cookie tecnici','consenso cookie',
       'linee guida garante cookie','tracciamento'],
 false,
 jsonb_build_object(
   '@context', 'https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type', 'WebPage',
       '@id', 'https://www.nadiamaar.dev/cookie-policy#webpage',
       'name', 'Cookie e strumenti di tracciamento',
       'description', 'Elenco dei cookie e degli strumenti equivalenti usati dal sito, redatto ai sensi dell''articolo 122 del D.lgs. 196/2003 e delle Linee guida del Garante del 10 giugno 2021.',
       'inLanguage', 'it',
       'url', 'https://www.nadiamaar.dev/cookie-policy',
       'publisher', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#organization')
     ),
     jsonb_build_object(
       '@type', 'BreadcrumbList',
       '@id', 'https://www.nadiamaar.dev/cookie-policy#breadcrumb',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://www.nadiamaar.dev/'),
         jsonb_build_object('@type','ListItem','position',2,'name','Cookie','item','https://www.nadiamaar.dev/cookie-policy')
       )
     )
   )
 )),

('/cookie-policy', 'en',
 'Cookie policy — Nadia Maar',
 'The full list of cookies and browser storage the site uses, with purposes and durations. No first-party profiling cookies; third-party tools load only with consent.',
 array['cookie policy','technical cookies','cookie consent',
       'tracking tools','browser storage'],
 false,
 jsonb_build_object(
   '@context', 'https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type', 'WebPage',
       '@id', 'https://www.nadiamaar.dev/en/cookie-policy#webpage',
       'name', 'Cookies and tracking tools',
       'description', 'The cookies and equivalent tools used by the site, drawn up under Article 122 of Italian Legislative Decree 196/2003 and the Italian Data Protection Authority guidelines of 10 June 2021.',
       'inLanguage', 'en',
       'url', 'https://www.nadiamaar.dev/en/cookie-policy',
       'publisher', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#organization')
     ),
     jsonb_build_object(
       '@type', 'BreadcrumbList',
       '@id', 'https://www.nadiamaar.dev/en/cookie-policy#breadcrumb',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://www.nadiamaar.dev/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','Cookies','item','https://www.nadiamaar.dev/en/cookie-policy')
       )
     )
   )
 )),

-- ── /termini ────────────────────────────────────────────────
('/termini', 'it',
 'Termini e condizioni — Nadia Maar',
 'Regole d''uso del sito e condizioni dei servizi: contratto, perimetro, pagamenti, proprietà del codice consegnato, garanzia, recesso e foro competente.',
 array['termini e condizioni','condizioni generali di servizio',
       'contratto sviluppo software','diritto di recesso','proprietà del codice'],
 false,
 jsonb_build_object(
   '@context', 'https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type', 'WebPage',
       '@id', 'https://www.nadiamaar.dev/termini#webpage',
       'name', 'Termini e condizioni d''uso e di servizio',
       'description', 'Regole di utilizzo del sito e condizioni generali dei servizi professionali: conclusione del contratto, perimetro, corrispettivi, proprietà intellettuale, garanzia, recesso e controversie.',
       'inLanguage', 'it',
       'url', 'https://www.nadiamaar.dev/termini',
       'publisher', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#organization')
     ),
     jsonb_build_object(
       '@type', 'BreadcrumbList',
       '@id', 'https://www.nadiamaar.dev/termini#breadcrumb',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://www.nadiamaar.dev/'),
         jsonb_build_object('@type','ListItem','position',2,'name','Termini','item','https://www.nadiamaar.dev/termini')
       )
     )
   )
 )),

('/termini', 'en',
 'Terms and conditions — Nadia Maar',
 'Site rules and service conditions: contract formation, scope, payments, ownership of delivered code, warranty, withdrawal and jurisdiction.',
 array['terms and conditions','terms of service',
       'software development contract','right of withdrawal','code ownership'],
 false,
 jsonb_build_object(
   '@context', 'https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type', 'WebPage',
       '@id', 'https://www.nadiamaar.dev/en/termini#webpage',
       'name', 'Terms of use and terms of service',
       'description', 'Rules for using the site and general conditions for the professional services: contract formation, scope, fees, intellectual property, warranty, withdrawal and disputes.',
       'inLanguage', 'en',
       'url', 'https://www.nadiamaar.dev/en/termini',
       'publisher', jsonb_build_object('@id', 'https://www.nadiamaar.dev/#organization')
     ),
     jsonb_build_object(
       '@type', 'BreadcrumbList',
       '@id', 'https://www.nadiamaar.dev/en/termini#breadcrumb',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://www.nadiamaar.dev/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','Terms','item','https://www.nadiamaar.dev/en/termini')
       )
     )
   )
 ))

on conflict (page_slug, locale) do nothing;
