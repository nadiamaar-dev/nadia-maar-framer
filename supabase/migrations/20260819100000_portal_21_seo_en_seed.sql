-- ============================================================
-- PORTAL 21 · SCHEDE SEO INGLESI (e le cinque pagine servizio
-- che non ne avevano in nessuna lingua)
--
-- ── PERCHÉ ADESSO ───────────────────────────────────────────
-- La migrazione 20 aveva seminato la sola home inglese, e lo
-- diceva a chiare lettere: le altre pagine restavano senza riga
-- perché il loro testo era ancora italiano, e /api/prerender
-- marca noindex una pagina in lingua non predefinita che non ha
-- la sua scheda. Era la regola giusta: indicizzare un indirizzo
-- inglese che serve testo italiano significa mettere due URL in
-- concorrenza per la stessa pagina.
--
-- Ora quel presupposto è caduto: l'intero sito pubblico —
-- intestazione, home, metodo, le cinque pagine servizio, casi
-- studio, contatti, configuratore, Lab, area di accesso e
-- pagine di servizio — è tradotto. Le righe qui sotto sono
-- quindi il gesto che accende /en: il prerender smette di
-- marcarle noindex e gli hreflang cominciano ad annunciarle.
--
-- ── PERCHÉ ANCHE CINQUE RIGHE ITALIANE ──────────────────────
-- /ecommerce, /corporate, /web-app, /seo e /ai non hanno mai
-- avuto una scheda: nascevano dopo il seed iniziale. Finora
-- prendevano il titolo predefinito del sito, uguale per tutte e
-- cinque — cinque pagine diverse che si presentavano a Google
-- con lo stesso titolo. E senza riga italiana l'hreflang
-- inglese resterebbe un gruppo di uno, che non è un gruppo:
-- la vista page_seo_alternates li elenca in coppia solo se
-- esistono entrambe.
--
-- ── I VINCOLI DEL MESTIERE ──────────────────────────────────
-- Titoli sotto i 60 caratteri, descrizioni sotto i 158: oltre
-- quelle soglie Google tronca, e una descrizione tagliata a
-- metà frase è peggio di una più corta. La descrizione non
-- posiziona: è la riga su cui si decide il clic, e va scritta
-- per quello.
--
-- I dati strutturati riusano gli @id già esistenti
-- (#organization, #person, #website): sono la STESSA entità in
-- entrambe le lingue, non due entità omonime. `inLanguage`
-- distingue le versioni; l'identità resta una.
--
-- Idempotente e non distruttiva: `do nothing` sul conflitto.
-- Se qualcuno ha già scritto una scheda dal pannello, vince la
-- sua. Riapplicare la migrazione non cancella il lavoro di
-- nessuno.
-- ============================================================

-- ── 1 · LE CINQUE PAGINE SERVIZIO, IN ITALIANO ──────────────
insert into public.page_seo_configs
  (page_slug, locale, meta_title, meta_description, keywords, is_noindex, json_ld_schema)
values

('/ecommerce', 'it',
 'E-commerce su misura e headless | Nadia Maar',
 'Architetture Shopify e headless che reggono cataloghi da decine di migliaia di prodotti: magazzino sincronizzato, checkout veloce, zero over-selling.',
 array['e-commerce su misura','shopify custom','headless commerce',
       'sincronizzazione magazzino','core web vitals e-commerce'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/ecommerce#service',
       'name','Sviluppo e-commerce su misura',
       'url','https://nadiamaar.com/ecommerce',
       'inLanguage','it-IT',
       'serviceType','E-commerce development',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com'),
         jsonb_build_object('@type','ListItem','position',2,'name','E-commerce','item','https://nadiamaar.com/ecommerce'))))) ),

('/corporate', 'it',
 'Siti corporate e lead generation | Nadia Maar',
 'Presenza digitale che regge il confronto mentre il decisore ti valuta, e trasforma la visita in un contatto già qualificato per il commerciale.',
 array['sito corporate','lead generation b2b','sito aziendale premium',
       'next.js','design system'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/corporate#service',
       'name','Siti corporate e lead generation',
       'url','https://nadiamaar.com/corporate',
       'inLanguage','it-IT',
       'serviceType','Corporate web development',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com'),
         jsonb_build_object('@type','ListItem','position',2,'name','Siti corporate','item','https://nadiamaar.com/corporate'))))) ),

('/web-app', 'it',
 'Applicazioni web e automazione custom | Nadia Maar',
 'Software su misura che collega CRM, ERP e sistemi esterni: via i passaggi manuali, i dati in un posto solo, strumenti che lavorano anche di notte.',
 array['applicazioni web su misura','automazione processi','integrazione crm erp',
       'middleware','portali b2b'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/web-app#service',
       'name','Applicazioni web e automazione',
       'url','https://nadiamaar.com/web-app',
       'inLanguage','it-IT',
       'serviceType','Custom software development',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com'),
         jsonb_build_object('@type','ListItem','position',2,'name','Applicazioni web','item','https://nadiamaar.com/web-app'))))) ),

('/seo', 'it',
 'SEO strategico e performance marketing | Nadia Maar',
 'Posizionamento organico previsto nell''architettura dal primo commit, e campagne Google e Meta governate sugli stessi dati. Nessuna scorciatoia.',
 array['seo tecnico','core web vitals','google ads','meta ads',
       'performance marketing','seo programmatica'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/seo#service',
       'name','SEO tecnico e performance marketing',
       'url','https://nadiamaar.com/seo',
       'inLanguage','it-IT',
       'serviceType','SEO and performance marketing',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com'),
         jsonb_build_object('@type','ListItem','position',2,'name','SEO','item','https://nadiamaar.com/seo'))))) ),

('/ai', 'it',
 'Integrazione AI e sistemi intelligenti | Nadia Maar',
 'Agenti, modelli linguistici e ricerca sui documenti aziendali dentro i processi che già esistono. Casi d''uso scelti perché il ritorno si calcola.',
 array['integrazione ai','agenti ai','llm aziendali','rag',
       'automazione intelligente'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/ai#service',
       'name','Integrazione AI e sistemi intelligenti',
       'url','https://nadiamaar.com/ai',
       'inLanguage','it-IT',
       'serviceType','AI integration',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com'),
         jsonb_build_object('@type','ListItem','position',2,'name','AI','item','https://nadiamaar.com/ai'))))) )

on conflict (page_slug, locale) do nothing;


-- ── 2 · LE NOVE PAGINE MANCANTI, IN INGLESE ─────────────────
-- La home inglese l'ha già seminata la migrazione 20.
--
-- Nota sulle parole chiave: non sono la traduzione parola per
-- parola di quelle italiane. Chi cerca in inglese non cerca
-- "sviluppatrice web italia": cerca "headless commerce agency",
-- "shopify plus developer". Tradurre le query invece di
-- rifarle è il modo più comune di sprecare una versione
-- linguistica.
insert into public.page_seo_configs
  (page_slug, locale, meta_title, meta_description, keywords, is_noindex, json_ld_schema)
values

-- ── METODO ────────────────────────────────────────────────
('/about', 'en',
 'Method & Stack — Digital Architect | Nadia Maar',
 'One contact from analysis to deploy: architecture, code, performance and SEO. No handovers, no responsibility lost along the way.',
 array['digital architect','full-stack developer','technical consulting',
       'react typescript','software architecture'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','ProfilePage',
       '@id','https://nadiamaar.com/en/about#profilepage',
       'url','https://nadiamaar.com/en/about',
       'name','Method & Stack — Nadia Maar',
       'inLanguage','en',
       'isPartOf', jsonb_build_object('@id','https://nadiamaar.com/#website'),
       'mainEntity', jsonb_build_object('@id','https://nadiamaar.com/#person')),
     jsonb_build_object(
       '@type','Person',
       '@id','https://nadiamaar.com/#person',
       'name','Nadia Maar',
       'jobTitle','Digital Architect & Full-Stack Developer',
       'description','I design and build complete web architectures: from the initial analysis to the interface, from the backend to technical SEO and performance.',
       'url','https://nadiamaar.com/en/about',
       'knowsLanguage', jsonb_build_array('Italiano','English'),
       'worksFor', jsonb_build_object('@id','https://nadiamaar.com/#organization')))) ),

-- ── CASI STUDIO ───────────────────────────────────────────
('/projects', 'en',
 'Case Studies — E-commerce & Platforms | Nadia Maar',
 'Real projects with context, technical decisions and measured results: e-commerce, scalable platforms and interfaces that hold traffic and convert.',
 array['web development portfolio','e-commerce case study','custom web projects',
       'scalable platforms','shopify plus developer'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','CollectionPage',
       '@id','https://nadiamaar.com/en/projects#collection',
       'url','https://nadiamaar.com/en/projects',
       'name','Selected case studies',
       'inLanguage','en',
       'description','A selection of projects: bespoke e-commerce, platforms and web applications, with the technical choices that made them fast and maintainable.',
       'isPartOf', jsonb_build_object('@id','https://nadiamaar.com/#website'),
       'about', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','Case studies','item','https://nadiamaar.com/en/projects'))))) ),

-- ── CONTATTI ──────────────────────────────────────────────
-- Lo slug resta /contatti anche in inglese: è l'indirizzo
-- canonico della pagina, non una parola da tradurre. L'URL
-- pubblico è /en/contatti e cambiarlo in /en/contact vorrebbe
-- dire due slug per la stessa pagina — esattamente ciò che la
-- migrazione 20 ha deciso di non fare.
('/contatti', 'en',
 'Contact — Request a Quote | Nadia Maar',
 'Tell me about the project and get a technical assessment with timings and costs. A reply within 24 hours, straight from whoever writes the code.',
 array['contact web developer','request a quote','technical assessment',
       'free consultation','project enquiry'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','ContactPage',
       '@id','https://nadiamaar.com/en/contatti#contact',
       'url','https://nadiamaar.com/en/contatti',
       'name','Contact — Nadia Maar',
       'inLanguage','en',
       'isPartOf', jsonb_build_object('@id','https://nadiamaar.com/#website'),
       'about', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','Contact','item','https://nadiamaar.com/en/contatti'))))) ),

-- ── LAB / FOUNDRY ─────────────────────────────────────────
('/foundry', 'en',
 'Digital Foundry — Solutions Library | Nadia Maar',
 'Explore real solutions and components: B2B portals, e-commerce, landing pages and UI. Save what you need to the Blueprint and get a tailored proposal.',
 array['solutions library','b2b portal demo','ui components',
       'interactive configurator','project blueprint'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','WebApplication',
       '@id','https://nadiamaar.com/en/foundry#app',
       'url','https://nadiamaar.com/en/foundry',
       'name','Digital Foundry',
       'applicationCategory','BusinessApplication',
       'operatingSystem','Web',
       'inLanguage','en',
       'description','An interactive configurator: pick the modules of the project and get the resulting architecture with an estimate of complexity and timings.',
       'offers', jsonb_build_object('@type','Offer','price','0','priceCurrency','EUR'),
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','Digital Foundry','item','https://nadiamaar.com/en/foundry'))))) ),

-- ── LE CINQUE PAGINE SERVIZIO ─────────────────────────────
('/ecommerce', 'en',
 'Custom & Headless E-commerce | Nadia Maar',
 'Shopify and headless architectures that carry catalogues of tens of thousands of products: synced stock, fast checkout, zero over-selling.',
 array['custom e-commerce development','shopify plus developer','headless commerce',
       'inventory synchronisation','e-commerce core web vitals'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/en/ecommerce#service',
       'name','Custom e-commerce development',
       'url','https://nadiamaar.com/en/ecommerce',
       'inLanguage','en',
       'serviceType','E-commerce development',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','E-commerce','item','https://nadiamaar.com/en/ecommerce'))))) ),

('/corporate', 'en',
 'Corporate Sites & Lead Generation | Nadia Maar',
 'A digital presence that holds up while the decision-maker is judging you, and turns the visit into a contact your sales team can already use.',
 array['corporate website','b2b lead generation','premium business website',
       'next.js development','design system'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/en/corporate#service',
       'name','Corporate sites and lead generation',
       'url','https://nadiamaar.com/en/corporate',
       'inLanguage','en',
       'serviceType','Corporate web development',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','Corporate','item','https://nadiamaar.com/en/corporate'))))) ),

('/web-app', 'en',
 'Web Apps & Custom Automation | Nadia Maar',
 'Bespoke software connecting CRM, ERP and external systems: manual steps gone, data in one place, tools that keep working overnight.',
 array['custom web application','process automation','crm erp integration',
       'middleware development','b2b portal'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/en/web-app#service',
       'name','Web applications and automation',
       'url','https://nadiamaar.com/en/web-app',
       'inLanguage','en',
       'serviceType','Custom software development',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','Web apps','item','https://nadiamaar.com/en/web-app'))))) ),

('/seo', 'en',
 'Strategic SEO & Performance Marketing | Nadia Maar',
 'Organic ranking planned into the architecture from the first commit, with Google and Meta campaigns governed on the same data. No shortcuts.',
 array['technical seo','core web vitals','google ads management','meta ads',
       'performance marketing','programmatic seo'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/en/seo#service',
       'name','Technical SEO and performance marketing',
       'url','https://nadiamaar.com/en/seo',
       'inLanguage','en',
       'serviceType','SEO and performance marketing',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','SEO','item','https://nadiamaar.com/en/seo'))))) ),

('/ai', 'en',
 'AI Integration & Intelligent Systems | Nadia Maar',
 'Agents, language models and search over company documents, inside the processes you already have. Use cases chosen because the return adds up.',
 array['ai integration','ai agents','enterprise llm','rag system',
       'intelligent automation'],
 false,
 jsonb_build_object(
   '@context','https://schema.org',
   '@graph', jsonb_build_array(
     jsonb_build_object(
       '@type','Service',
       '@id','https://nadiamaar.com/en/ai#service',
       'name','AI integration and intelligent systems',
       'url','https://nadiamaar.com/en/ai',
       'inLanguage','en',
       'serviceType','AI integration',
       'provider', jsonb_build_object('@id','https://nadiamaar.com/#organization')),
     jsonb_build_object(
       '@type','BreadcrumbList',
       'itemListElement', jsonb_build_array(
         jsonb_build_object('@type','ListItem','position',1,'name','Home','item','https://nadiamaar.com/en'),
         jsonb_build_object('@type','ListItem','position',2,'name','AI','item','https://nadiamaar.com/en/ai'))))) )

on conflict (page_slug, locale) do nothing;


-- ── 3 · CONTROLLO ───────────────────────────────────────────
-- Non un test: un promemoria leggibile in `supabase db push`.
-- Se una delle due lingue manca da qualche parte, gli hreflang
-- di quella pagina restano un gruppo di uno e conviene saperlo
-- adesso, non dalla Search Console fra tre settimane.
do $$
declare
  spaiate text;
begin
  select string_agg(page_slug || ' (' || array_to_string(locales, ',') || ')', ', ' order by page_slug)
    into spaiate
  from public.page_seo_alternates
  where array_length(locales, 1) < 2;

  if spaiate is not null then
    raise notice 'SEO: pagine con una lingua sola → %', spaiate;
  else
    raise notice 'SEO: tutte le pagine hanno entrambe le lingue.';
  end if;
end $$;
