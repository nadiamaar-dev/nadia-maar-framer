-- ============================================================
-- PORTAL 19c · CONTENUTI SEO INIZIALI
--
-- Testi veri, non segnaposto: ogni titolo sta sotto i 60
-- caratteri e ogni descrizione sotto i 158, perché oltre quelle
-- soglie Google tende a troncare. Le descrizioni non elencano
-- servizi, danno un motivo per cliccare — è l'unica cosa che
-- una meta description può fare, visto che non è un fattore di
-- posizionamento ma è la riga su cui si decide il clic.
--
-- I dati strutturati usano @graph con nodi collegati per @id:
-- così Organization, WebSite e Person sono la STESSA entità su
-- tutte le pagine invece di tre entità omonime scollegate. È
-- questo che costruisce E-E-A-T, non la ripetizione dello
-- stesso blocco su ogni URL.
--
-- L'inserimento è idempotente e NON sovrascrive: se una scheda
-- è già stata scritta a mano dal pannello, resta. Riapplicare
-- la migrazione non cancella il lavoro di nessuno.
-- ============================================================

insert into public.page_seo_configs
  (page_slug, meta_title, meta_description, keywords, canonical_url, is_noindex, json_ld_schema)
values

-- ── HOME ──────────────────────────────────────────────────
('/',
 'Nadia Maar — Architetture Digitali ad Alte Prestazioni',
 'Sviluppo full-stack su misura: e-commerce, web app e piattaforme scalabili progettate per velocità e conversione. Un solo interlocutore, dal codice alla crescita.',
 array['sviluppo web su misura','architetture digitali','full-stack developer italia',
       'e-commerce personalizzato','web application','performance web','core web vitals'],
 null, false,
 jsonb_build_object(
   '@context', 'https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type', 'ProfessionalService',
       '@id', 'https://nadiamaar.com/#organization',
       'name', 'Nadia Maar',
       'alternateName', 'Nadia Maar — Digital Architecture Studio',
       'url', 'https://nadiamaar.com',
       'description', 'Studio digitale specializzato in architetture web ad alte prestazioni: e-commerce su misura, web application e piattaforme scalabili.',
       'areaServed', jsonb_build_array(
         jsonb_build_object('@type','Country','name','Italia'),
         jsonb_build_object('@type','Place','name','Europa')),
       'availableLanguage', jsonb_build_array('it','en'),
       'knowsAbout', jsonb_build_array(
         'React','TypeScript','Next.js','Node.js','PostgreSQL','Supabase',
         'SEO tecnica','Core Web Vitals','architettura software','e-commerce headless'),
       'founder', jsonb_build_object('@id','https://nadiamaar.com/#person'),
       'hasOfferCatalog', jsonb_build_object(
         '@type','OfferCatalog','name','Servizi di sviluppo',
         'itemListElement', jsonb_build_array(
           jsonb_build_object('@type','Offer','itemOffered', jsonb_build_object('@type','Service','name','Sviluppo e-commerce su misura','url','https://nadiamaar.com/ecommerce')),
           jsonb_build_object('@type','Offer','itemOffered', jsonb_build_object('@type','Service','name','Siti corporate ad alte prestazioni','url','https://nadiamaar.com/corporate')),
           jsonb_build_object('@type','Offer','itemOffered', jsonb_build_object('@type','Service','name','Web application e aree riservate','url','https://nadiamaar.com/web-app')),
           jsonb_build_object('@type','Offer','itemOffered', jsonb_build_object('@type','Service','name','SEO tecnica e Core Web Vitals','url','https://nadiamaar.com/seo')),
           jsonb_build_object('@type','Offer','itemOffered', jsonb_build_object('@type','Service','name','Integrazioni AI','url','https://nadiamaar.com/ai'))))),
     jsonb_build_object(
       '@type', 'Person',
       '@id', 'https://nadiamaar.com/#person',
       'name', 'Nadia Maar',
       'jobTitle', 'Digital Architect & Full-Stack Developer',
       'url', 'https://nadiamaar.com/about',
       'worksFor', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type', 'WebSite',
       '@id', 'https://nadiamaar.com/#website',
       'url', 'https://nadiamaar.com',
       'name', 'Nadia Maar',
       'inLanguage', 'it-IT',
       'publisher', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type', 'WebPage',
       '@id', 'https://nadiamaar.com/#webpage',
       'url', 'https://nadiamaar.com',
       'name', 'Nadia Maar — Architetture Digitali ad Alte Prestazioni',
       'isPartOf', jsonb_build_object('@id','https://nadiamaar.com/#website'),
       'about', jsonb_build_object('@id','https://nadiamaar.com/#organization')))) ),

-- ── CHI SONO ──────────────────────────────────────────────
('/about',
 'Chi sono — Digital Architect Full-Stack | Nadia Maar',
 'Un solo interlocutore dall''analisi al deploy: architettura, codice, prestazioni e SEO. Niente passaggi di consegne, niente responsabilità che si perdono per strada.',
 array['digital architect','full-stack developer','sviluppatrice web italia',
       'consulenza tecnica','react typescript','architettura software'],
 null, false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','ProfilePage',
       '@id','https://nadiamaar.com/about#profilepage',
       'url','https://nadiamaar.com/about',
       'name','Chi sono — Nadia Maar',
       'inLanguage','it-IT',
       'isPartOf', jsonb_build_object('@id','https://nadiamaar.com/#website'),
       'mainEntity', jsonb_build_object('@id','https://nadiamaar.com/#person')),
     jsonb_build_object(
       '@type','Person',
       '@id','https://nadiamaar.com/#person',
       'name','Nadia Maar',
       'jobTitle','Digital Architect & Full-Stack Developer',
       'description','Progetto e sviluppo architetture web complete: dall''analisi iniziale all''interfaccia, dal backend alla SEO tecnica e alle prestazioni.',
       'url','https://nadiamaar.com/about',
       'knowsAbout', jsonb_build_array(
         'React','TypeScript','Next.js','Node.js','PostgreSQL','Supabase',
         'architettura software','SEO tecnica','Core Web Vitals','e-commerce headless','integrazioni AI'),
       'knowsLanguage', jsonb_build_array('Italiano','English'),
       'worksFor', jsonb_build_object('@id','https://nadiamaar.com/#organization')))) ),

-- ── PROGETTI ──────────────────────────────────────────────
('/projects',
 'Progetti — E-commerce e piattaforme su misura | Nadia Maar',
 'Casi reali con contesto, scelte tecniche e risultati misurati: e-commerce, piattaforme scalabili e interfacce che reggono il traffico e convertono.',
 array['portfolio sviluppo web','case study e-commerce','progetti web su misura',
       'piattaforme scalabili','realizzazioni web'],
 null, false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','CollectionPage',
       '@id','https://nadiamaar.com/projects#collection',
       'url','https://nadiamaar.com/projects',
       'name','Progetti realizzati',
       'inLanguage','it-IT',
       'description','Selezione di progetti: e-commerce su misura, piattaforme e web application, con le scelte tecniche che li hanno resi veloci e mantenibili.',
       'isPartOf', jsonb_build_object('@id','https://nadiamaar.com/#website'),
       'about', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com'),
         jsonb_build_object('@type','ListItem','position',2,'name','Progetti','item','https://nadiamaar.com/projects'))))) ),

-- ── CONTATTI ──────────────────────────────────────────────
('/contatti',
 'Contatti — Richiedi un preventivo | Nadia Maar',
 'Raccontami il progetto e ricevi una valutazione tecnica con tempi e costi. Risposta entro 24 ore, in italiano, direttamente da chi scriverà il codice.',
 array['preventivo sviluppo web','contatti sviluppatore','consulenza tecnica web',
       'richiesta preventivo e-commerce','call conoscitiva'],
 null, false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','ContactPage',
       '@id','https://nadiamaar.com/contatti#contactpage',
       'url','https://nadiamaar.com/contatti',
       'name','Contatti — Nadia Maar',
       'inLanguage','it-IT',
       'description','Richiedi un preventivo o fissa una call conoscitiva. Risposta entro 24 ore.',
       'isPartOf', jsonb_build_object('@id','https://nadiamaar.com/#website'),
       'about', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com'),
         jsonb_build_object('@type','ListItem','position',2,'name','Contatti','item','https://nadiamaar.com/contatti'))))) ),

-- ── DIGITAL FOUNDRY ───────────────────────────────────────
('/foundry',
 'Digital Foundry — Configura il tuo progetto | Nadia Maar',
 'Componi l''architettura del tuo progetto modulo per modulo e ottieni subito stima di complessità e tempi. Nessun modulo di contatto prima di aver visto i numeri.',
 array['configuratore progetto web','preventivo online sviluppo','stima costi sito',
       'architettura progetto digitale','digital foundry'],
 null, false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','WebApplication',
       '@id','https://nadiamaar.com/foundry#app',
       'url','https://nadiamaar.com/foundry',
       'name','Digital Foundry',
       'applicationCategory','BusinessApplication',
       'operatingSystem','Web',
       'inLanguage','it-IT',
       'description','Configuratore interattivo: si scelgono i moduli del progetto e si ottiene l''architettura risultante con una stima di complessità e tempi.',
       'offers', jsonb_build_object('@type','Offer','price','0','priceCurrency','EUR'),
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com'),
         jsonb_build_object('@type','ListItem','position',2,'name','Digital Foundry','item','https://nadiamaar.com/foundry')))))
)

on conflict (page_slug) do nothing;

-- Lo schema dell'organizzazione vive anche in site_settings: è quello che
-- /api/prerender inietta su OGNI pagina, comprese quelle senza scheda SEO.
update public.site_settings
set organization_schema = (select json_ld_schema from public.page_seo_configs where page_slug = '/'),
    default_meta_title = coalesce(default_meta_title, 'Nadia Maar — Architetture Digitali ad Alte Prestazioni'),
    default_meta_description = coalesce(default_meta_description,
      'Sviluppo full-stack su misura: e-commerce, web app e piattaforme scalabili progettate per velocità e conversione.')
where organization_schema is null;
