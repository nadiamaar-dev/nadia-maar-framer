import type { LegalDoc } from "../../legal"
import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   TERMINI E CONDIZIONI — uso del sito e condizioni generali dei servizi.

   Due documenti in uno, e volutamente: chi legge questa pagina o sta
   navigando (sezioni 1-10) o sta per affidare un lavoro (11-25). Tenerli
   separati avrebbe significato due pagine che si rimandano a vicenda e un
   cliente che accetta la metà sbagliata.

   TRE SCELTE DI MERITO, perché non sono ovvie:

   · NIENTE CLAUSOLE CHE NON REGGONO. Un'esclusione totale di responsabilità
     sarebbe nulla per l'articolo 1229 del Codice civile, e verso i
     consumatori sarebbe vessatoria ai sensi degli articoli 33 e 36 del
     Codice del Consumo. Qui il limite è espresso come massimale legato al
     corrispettivo, con le eccezioni inderogabili scritte accanto: una
     clausola che regge vale più di una che spaventa.

   · IL FORO NON È INVENTATO. Senza sede legale attribuita non si può
     indicare un tribunale: fino ad allora valgono i criteri ordinari del
     Codice di procedura civile, e per i consumatori il foro inderogabile di
     residenza (articolo 66-bis del Codice del Consumo).

   · LA PIATTAFORMA ODR NON SI CITA. Il regolamento (UE) 524/2013 è stato
     abrogato e la piattaforma europea di risoluzione delle controversie ha
     cessato di operare il 20 luglio 2025: il link che quasi tutti i modelli
     in circolazione riportano ancora oggi porta a una pagina spenta. Al suo
     posto si indicano gli organismi ADR e la mediazione, che esistono.
══════════════════════════════════════════════════════════════════════════ */

const it: LegalDoc = {
  kicker: "Termini e condizioni",
  title: "Termini e condizioni d'uso e di servizio",
  lead: "Le regole che governano l'uso di questo sito e le condizioni generali applicabili ai servizi professionali dello Studio: come nasce il contratto, che cosa comprende, chi è titolare di che cosa, come si paga, quali garanzie ci sono e come si risolve una controversia.",

  sections: [
    {
      id: "oggetto",
      title: "Oggetto e ambito di applicazione",
      blocks: [
        { p: "Questi termini disciplinano due cose distinte. Le sezioni da 1 a 10 riguardano l'accesso e l'uso del sito {site} da parte di chiunque, e si applicano dal momento in cui apri una qualsiasi pagina. Le sezioni da 11 a 25 contengono le condizioni generali dei servizi professionali dello Studio e si applicano ai rapporti con i clienti, in quanto richiamate dal preventivo o dall'ordine accettato." },
        { p: "In caso di contrasto fra queste condizioni generali e quanto pattuito per iscritto in un preventivo, in un contratto o in un ordine sottoscritto dalle parti, prevale l'accordo specifico. Le condizioni generali continuano ad applicarsi per tutto ciò che l'accordo specifico non disciplina." },
      ],
    },
    {
      id: "gestore",
      title: "Chi gestisce il sito",
      blocks: [
        { p: "Il sito è gestito da {entity}, i cui dati identificativi e di contatto sono riportati nel riquadro in testa a questa pagina, in adempimento degli obblighi informativi dell'articolo 7 del D.lgs. 70/2003 sul commercio elettronico." },
        { p: "Per qualsiasi comunicazione relativa a questi termini, incluse contestazioni e diffide, l'indirizzo valido è {email}. Le comunicazioni inviate a quell'indirizzo si considerano ricevute il giorno lavorativo successivo all'invio." },
      ],
    },
    {
      id: "accettazione",
      title: "Accettazione e modifiche",
      blocks: [
        { p: "L'uso del sito comporta l'accettazione integrale di questi termini nella versione pubblicata al momento dell'accesso. Se non li condividi, l'unica conseguenza prevista è che non devi usare il sito." },
        { p: "Lo Studio può modificarli per ragioni tecniche, organizzative o normative. Le modifiche hanno effetto dalla pubblicazione a questo indirizzo, con la data di ultimo aggiornamento in testa alla pagina, e non hanno effetto retroattivo sui contratti già conclusi: a quelli si applica la versione in vigore al momento della conclusione, che puoi richiedere in qualsiasi momento a {email}." },
        { p: "Agli utenti registrati le modifiche sostanziali vengono comunicate con un messaggio nell'area riservata con almeno quindici giorni di preavviso; entro quel termine è possibile chiudere l'account senza oneri." },
      ],
    },
    {
      id: "contenuti",
      title: "Natura dei contenuti del sito",
      blocks: [
        { p: "I contenuti pubblicati — descrizioni di servizi, casi studio, articoli tecnici, dimostrazioni interattive — hanno finalità informativa e promozionale. Non costituiscono offerta al pubblico ai sensi dell'articolo 1336 del Codice civile, né consulenza professionale, tecnica, legale o fiscale sulla quale fondare decisioni senza una verifica specifica." },
        { p: "Le stime di tempi, complessità e costo prodotte dal configuratore e dalle demo sono indicative e generate da regole dichiarate: servono a inquadrare un ordine di grandezza, non vincolano lo Studio e non sostituiscono un preventivo, che viene sempre formulato per iscritto dopo aver esaminato il caso concreto." },
        { p: "Le applicazioni dimostrative accessibili dal sito funzionano con dati inventati a scopo illustrativo. Nomi di aziende, importi, documenti e ricevute che vi compaiono non si riferiscono a soggetti reali, non hanno alcun valore contabile, fiscale o probatorio e non vanno utilizzati per scopi diversi dalla dimostrazione." },
        { p: "Lo Studio si impegna a mantenere i contenuti accurati e aggiornati, ma non garantisce che siano privi di errori né che restino attuali nel tempo: la tecnologia descritta cambia più in fretta delle pagine che la raccontano." },
      ],
    },
    {
      id: "proprieta-sito",
      title: "Proprietà intellettuale sui contenuti del sito",
      blocks: [
        { p: "Il sito nel suo insieme e i suoi elementi — testi, struttura, interfacce, grafica, illustrazioni, codice sorgente, dimostrazioni interattive — sono opere dell'ingegno protette dalla legge 22 aprile 1941, n. 633 e, per la parte software, dagli articoli 64-bis e seguenti della stessa legge. Ogni diritto è riservato al Titolare o ai rispettivi aventi diritto." },
        { p: "Il nome «Nadia Maar», il segno grafico che lo accompagna e gli altri segni distintivi presenti nel sito sono di titolarità del Titolare e tutelati dal D.lgs. 30/2005. Marchi, loghi e nomi di terzi eventualmente citati appartengono ai rispettivi titolari e sono usati a soli fini descrittivi, senza alcun rapporto di sponsorizzazione o affiliazione." },
        { p: "È consentito consultare le pagine, stamparle e conservarne copia per uso personale e non commerciale, nonché citarne brani a fini di critica, discussione o insegnamento con indicazione della fonte e del collegamento alla pagina originale, nei limiti dell'articolo 70 della legge sul diritto d'autore." },
        { p: "È vietata, senza autorizzazione scritta, ogni forma di riproduzione, ripubblicazione, adattamento o distribuzione integrale o sostanziale dei contenuti, compresa la loro riproposizione all'interno di prodotti o servizi concorrenti." },
        { p: "Quanto all'estrazione automatizzata di testo e dati, il Titolare consente l'indicizzazione dei contenuti da parte dei motori di ricerca e il loro utilizzo da parte degli assistenti conversazionali per rispondere a domande degli utenti con indicazione della fonte, nei termini dichiarati dal file [robots.txt](/robots.txt) del sito. Resta riservato, ai sensi dell'articolo 70-quater della legge 633/1941, ogni utilizzo diverso, in particolare la riproduzione sistematica dei contenuti in raccolte o servizi che li sostituiscano." },
      ],
    },
    {
      id: "uso-vietato",
      title: "Usi consentiti e usi vietati",
      blocks: [
        { p: "Il sito va usato in modo lecito, corretto e conforme a queste condizioni. In particolare è vietato:" },
        { ul: [
          "tentare di accedere ad aree riservate, dati o funzioni per i quali non si è autorizzati, o aggirare le misure di sicurezza;",
          "sottoporre il sito o le sue funzioni a prove di carico, scansioni di vulnerabilità o attacchi automatizzati senza autorizzazione scritta preventiva;",
          "estrarre i contenuti in modo massivo o sistematico con strumenti automatici, oltre quanto consentito dalla sezione precedente e dal file robots.txt;",
          "inviare attraverso i moduli contenuti illeciti, diffamatori, discriminatori, lesivi di diritti altrui, o comunicazioni commerciali non richieste;",
          "immettere codice dannoso o interferire con il funzionamento del sito, della sua infrastruttura o dei servizi collegati;",
          "riprodurre l'aspetto, il nome o i segni distintivi del sito in modo idoneo a generare confusione sull'origine.",
        ] },
        { p: "Il Titolare può sospendere o impedire l'accesso a chi violi queste regole, fatto salvo il risarcimento del danno e la segnalazione alle autorità competenti quando la condotta abbia rilievo penale. Le segnalazioni responsabili di vulnerabilità sono benvenute e vanno inviate a {email}: chi segnala in buona fede, senza accedere a dati altrui e senza divulgare la vulnerabilità prima che sia corretta, non subirà alcuna iniziativa da parte del Titolare." },
      ],
    },
    {
      id: "account",
      title: "Area riservata, registrazione e credenziali",
      blocks: [
        { p: "Alcune funzioni sono accessibili solo previa registrazione. Registrandoti dichiari di avere la capacità di agire, di fornire dati veritieri e aggiornati e, se agisci per un'organizzazione, di avere il potere di impegnarla." },
        { p: "Le credenziali sono personali e non cedibili: sei responsabile della loro custodia e delle attività compiute con esse fino alla segnalazione di un uso non autorizzato, che va inviata senza ritardo a {email}." },
        { p: "L'account può essere chiuso da te in qualsiasi momento e senza motivazione, scrivendo all'indirizzo indicato sopra. Il Titolare può sospenderlo o chiuderlo, con preavviso salvo casi di urgenza, in caso di violazione di questi termini, di uso fraudolento o di inattività prolungata oltre ventiquattro mesi. Alla chiusura i contenuti caricati vengono cancellati nei tempi indicati nell'[informativa privacy](/privacy), fatti salvi gli obblighi di conservazione documentale." },
        { p: "L'area riservata è uno strumento di lavoro condiviso, non un servizio di archiviazione: conserva sempre una copia autonoma dei documenti che vi carichi." },
      ],
    },
    {
      id: "disponibilita",
      title: "Disponibilità del sito",
      blocks: [
        { p: "Il sito è offerto «così com'è» e nei limiti della disponibilità effettiva. Lo Studio si adopera per garantirne la continuità, ma non assume un obbligo di funzionamento ininterrotto: possono verificarsi interruzioni per manutenzione, aggiornamenti, guasti dell'infrastruttura di terzi o cause di forza maggiore." },
        { p: "Gli interventi programmati vengono, quando possibile, svolti in orari di minore utilizzo e annunciati in anticipo agli utenti registrati. Quanto agli obblighi di continuità dei servizi commissionati dai clienti, valgono i livelli concordati per iscritto nel relativo contratto di manutenzione, non questa sezione." },
      ],
    },
    {
      id: "terzi",
      title: "Collegamenti e servizi di terzi",
      blocks: [
        { p: "Il sito contiene collegamenti a risorse esterne offerte da terzi. Il Titolare non controlla quelle risorse, non ne garantisce contenuti, disponibilità o sicurezza e non risponde di eventuali danni derivanti dal loro utilizzo: una volta aperto un collegamento si applicano le condizioni e le informative del rispettivo gestore." },
        { p: "L'inserimento di un collegamento non implica approvazione, sponsorizzazione o affiliazione." },
      ],
    },
    {
      id: "responsabilita-sito",
      title: "Limitazione di responsabilità per l'uso del sito",
      blocks: [
        { p: "Nei limiti consentiti dalla legge, il Titolare non risponde dei danni derivanti dall'uso o dall'impossibilità di usare il sito, né delle decisioni assunte sulla base dei contenuti informativi in esso pubblicati senza una verifica specifica." },
        { p: "Restano in ogni caso ferme, e prevalgono su qualsiasi disposizione di segno contrario: la nullità di ogni patto che escluda o limiti preventivamente la responsabilità per dolo o colpa grave (articolo 1229 del Codice civile); la responsabilità per danni alla persona; e, nei rapporti con i consumatori, il divieto delle clausole vessatorie previsto dagli articoli 33 e 36 del Codice del Consumo, che rende inefficaci le limitazioni non consentite." },
      ],
    },
    {
      id: "contratto",
      title: "Conclusione del contratto di servizi",
      blocks: [
        { p: "Il contratto si conclude quando lo Studio riceve l'accettazione scritta di un preventivo o di un ordine, prestata per email, tramite sottoscrizione del documento o mediante l'apposita funzione dell'area riservata. La richiesta inviata dal sito, dal configuratore o per messaggio non vincola alcuna delle parti: apre una trattativa." },
        { p: "Salvo diversa indicazione, il preventivo resta valido trenta giorni dalla data di emissione. Scaduto il termine, importi e tempi possono essere riformulati." },
        { p: "Il preventivo indica l'oggetto della prestazione, i corrispettivi, i tempi previsti, le esclusioni e i costi di terzi eventualmente necessari (licenze, servizi in abbonamento, hosting, domini). Ciò che non è scritto nel preventivo non è compreso nel prezzo." },
        { p: "Lo Studio conferma per iscritto la conclusione del contratto e ne conserva copia; su richiesta ne trasmette copia al cliente su supporto durevole." },
      ],
    },
    {
      id: "perimetro",
      title: "Perimetro della prestazione, varianti e obbligazioni assunte",
      blocks: [
        { p: "Salvo che il contratto disponga diversamente, lo Studio assume un'obbligazione di mezzi quanto ai risultati commerciali (traffico, posizionamento, conversioni, fatturato), che dipendono da fattori fuori dal suo controllo, e un'obbligazione di risultato quanto alla realizzazione e alla consegna di quanto descritto nel preventivo." },
        { p: "Le modifiche richieste dopo l'accettazione che incidono su perimetro, architettura o tempi costituiscono varianti: vengono quantificate per iscritto e ne va concordata l'esecuzione prima che lo Studio vi dia corso. In assenza di accordo, restano fermi il perimetro e il prezzo originari." },
        { p: "Salvo diverso accordo scritto, sono esclusi dal perimetro: la produzione dei contenuti editoriali e fotografici, l'acquisto di licenze e servizi di terzi, la migrazione di dati da sistemi preesistenti non documentati, la formazione oltre le ore indicate e la manutenzione successiva alla consegna." },
      ],
    },
    {
      id: "cliente",
      title: "Obblighi e collaborazione del cliente",
      blocks: [
        { p: "L'esecuzione dei lavori richiede una collaborazione attiva. Il cliente si impegna a:" },
        { ul: [
          "fornire contenuti, materiali, accessi e informazioni nei tempi concordati, in forma completa e utilizzabile;",
          "individuare un referente unico con potere di decidere e approvare;",
          "riscontrare le richieste di approvazione entro i termini indicati nel piano di lavoro;",
          "garantire di essere titolare o licenziatario dei diritti sui materiali che consegna — testi, immagini, marchi, banche dati — e manlevare lo Studio da pretese di terzi che riguardino tali materiali;",
          "provvedere agli adempimenti di sua competenza, compresi quelli in materia di protezione dei dati personali rispetto agli utenti dei propri sistemi.",
        ] },
        { p: "I ritardi imputabili al cliente sospendono i termini di consegna per un periodo pari al ritardo. Se l'inerzia si protrae oltre sessanta giorni, lo Studio può fatturare le attività eseguite fino a quel momento e sospendere il progetto fino alla ripresa della collaborazione." },
      ],
    },
    {
      id: "consegne",
      title: "Tempi, consegne e approvazione delle fasi",
      blocks: [
        { p: "I tempi indicati nel preventivo decorrono dalla ricezione di quanto necessario per iniziare — accettazione, acconto se previsto, materiali e accessi — e sono espressi in giorni lavorativi." },
        { p: "Il lavoro è articolato in fasi. Al termine di ciascuna, il cliente dispone di dieci giorni lavorativi per approvarla o per formulare richieste di modifica motivate attraverso l'area riservata. Decorso il termine senza riscontro, la fase si intende approvata e il progetto prosegue: senza questa regola un progetto potrebbe restare aperto a tempo indeterminato per un'approvazione che non arriva mai." },
        { p: "L'approvazione di una fase non pregiudica la garanzia per i vizi che emergano successivamente e che non fossero riconoscibili con l'ordinaria diligenza al momento dell'approvazione." },
        { p: "La messa in produzione avviene previo consenso scritto del cliente. Da quel momento decorre il periodo di garanzia indicato più avanti." },
      ],
    },
    {
      id: "pagamenti",
      title: "Corrispettivi, fatturazione e pagamenti",
      blocks: [
        { p: "I corrispettivi sono quelli indicati nel preventivo. Salvo diverso accordo, il pagamento è ripartito in un acconto alla conclusione del contratto e nel saldo alla consegna; per i progetti articolati in più fasi si possono concordare stati di avanzamento." },
        { p: "Le fatture sono emesse, ove la normativa applicabile lo preveda, in formato elettronico attraverso il Sistema di Interscambio, e sono pagabili entro trenta giorni dalla data di emissione, salvo diverso termine scritto. I costi di terzi anticipati dallo Studio (licenze, hosting, domini, servizi in abbonamento) sono riaddebitati al costo." },
        { p: "Nei rapporti fra imprese e professionisti, il ritardo nel pagamento comporta di diritto e senza necessità di costituzione in mora gli interessi moratori previsti dal D.lgs. 231/2002, nella misura del tasso di riferimento della Banca centrale europea maggiorato di otto punti percentuali, oltre all'importo forfettario di 40 euro a titolo di costi di recupero, salvo il maggior danno." },
        { p: "Decorsi quindici giorni dalla scadenza, lo Studio può sospendere le attività in corso e l'accesso ai servizi collegati, dandone comunicazione scritta. La sospensione non proroga gli obblighi del cliente e non genera diritto ad alcun indennizzo." },
        { p: "Non è ammessa la compensazione con crediti contestati né la ritenzione del corrispettivo per contestazioni relative a parti della prestazione diverse da quelle già consegnate e utilizzabili." },
      ],
    },
    {
      id: "proprieta-opere",
      title: "Proprietà dei risultati, licenze e componenti di terzi",
      blocks: [
        { p: "I diritti di utilizzazione economica sui materiali realizzati su misura per il cliente — codice sorgente specifico, interfacce, testi e grafiche prodotti nell'ambito del progetto — si trasferiscono al cliente al momento del pagamento integrale del corrispettivo, in via esclusiva, senza limiti di tempo e per il territorio mondiale. Fino a quel momento al cliente è concessa una licenza d'uso temporanea, limitata alla verifica e al collaudo." },
        { p: "Restano di titolarità dello Studio, che ne concede al cliente una licenza non esclusiva, perpetua, irrevocabile e non trasferibile per l'uso del prodotto consegnato: le librerie, i componenti, gli schemi e gli strumenti sviluppati in via generale e riutilizzabili in altri progetti, insieme al know-how e alle metodologie impiegate. Questa riserva non limita in alcun modo l'uso, la modifica o la cessione del prodotto realizzato per il cliente." },
        { p: "I componenti di terzi — librerie open source, caratteri tipografici, servizi in abbonamento, immagini su licenza — restano soggetti alle rispettive licenze, che vengono rispettate e delle quali lo Studio fornisce l'elenco su richiesta. La conformità del cliente a tali licenze, incluse le eventuali quote di abbonamento successive alla consegna, resta a suo carico." },
        { p: "I diritti morali dell'autore, inalienabili ai sensi dell'articolo 20 della legge 633/1941, restano in capo a chi ha realizzato l'opera." },
        { p: "Salvo diversa richiesta scritta del cliente, lo Studio ha diritto di citare il lavoro svolto e il nome del committente nel proprio portfolio e nei materiali di presentazione, mostrando immagini del prodotto realizzato e i risultati non riservati. Il cliente può opporsi in qualsiasi momento scrivendo a {email}." },
      ],
    },
    {
      id: "garanzia",
      title: "Garanzia, difetti e assistenza",
      blocks: [
        { p: "Per novanta giorni dalla messa in produzione lo Studio corregge gratuitamente i difetti di conformità del software consegnato, cioè i comportamenti difformi da quanto concordato per iscritto, purché segnalati con una descrizione che ne consenta la riproduzione." },
        { p: "La garanzia non copre: i malfunzionamenti dovuti a modifiche apportate da terzi, l'uso difforme dalle istruzioni fornite, i guasti o le variazioni di servizi e interfacce di terzi, i contenuti immessi dal cliente e le richieste di nuove funzioni, che costituiscono varianti." },
        { p: "Restano ferme le norme inderogabili in materia di vizi dell'opera, in particolare l'articolo 2226 del Codice civile, e — nei contratti con i consumatori aventi a oggetto contenuti o servizi digitali — le disposizioni sulla conformità e sui rimedi previste dagli articoli 135-octies e seguenti del Codice del Consumo, che questa sezione non intende e non può derogare." },
        { p: "L'assistenza successiva alla garanzia, gli aggiornamenti di sicurezza, i salvataggi periodici e i tempi di intervento sono oggetto di un contratto di manutenzione a parte. In assenza di tale contratto, lo Studio non assume obblighi di monitoraggio, aggiornamento o ripristino, e l'esecuzione dei salvataggi resta a carico del cliente." },
      ],
    },
    {
      id: "riservatezza",
      title: "Riservatezza",
      blocks: [
        { p: "Ciascuna parte si impegna a mantenere riservate le informazioni tecniche, commerciali e organizzative apprese dall'altra in ragione del rapporto, a non divulgarle e a usarle solo per l'esecuzione del contratto. L'obbligo vale per cinque anni dalla cessazione del rapporto e non si applica alle informazioni pubbliche, a quelle già legittimamente note e a quelle la cui comunicazione sia imposta dalla legge o dall'autorità." },
        { p: "Su richiesta del cliente lo Studio sottoscrive un accordo di riservatezza specifico prima dell'accesso a sistemi o informazioni sensibili." },
      ],
    },
    {
      id: "dati",
      title: "Protezione dei dati personali",
      blocks: [
        { p: "Il trattamento dei dati personali del cliente e dei suoi referenti è descritto nell'[informativa privacy](/privacy)." },
        { p: "Quando l'esecuzione del contratto comporta l'accesso a dati personali di cui il cliente è titolare, lo Studio agisce come responsabile del trattamento e le parti sottoscrivono, prima di ogni accesso, l'atto di nomina previsto dall'articolo 28 del Regolamento (UE) 2016/679, che disciplina istruzioni, misure di sicurezza, sub-responsabili, assistenza e sorte dei dati alla cessazione del servizio." },
      ],
    },
    {
      id: "recesso-risoluzione",
      title: "Durata, recesso e risoluzione",
      blocks: [
        { p: "I contratti di progetto durano fino al completamento della prestazione; quelli di manutenzione hanno la durata pattuita e, se rinnovabili, si rinnovano solo su conferma scritta: nessun rinnovo tacito." },
        { p: "Il cliente può recedere in qualsiasi momento dal contratto di progetto dandone comunicazione scritta; in tal caso è dovuto il corrispettivo delle attività eseguite fino alla data di ricezione della comunicazione, oltre alle spese sostenute e agli impegni assunti verso terzi non annullabili, ai sensi dell'articolo 2227 del Codice civile." },
        { p: "Ciascuna parte può risolvere il contratto ai sensi dell'articolo 1456 del Codice civile, con comunicazione scritta, in caso di: inadempimento agli obblighi di pagamento protratto oltre trenta giorni dalla diffida; violazione degli obblighi di riservatezza; violazione dei diritti di proprietà intellettuale; mancata collaborazione protratta oltre sessanta giorni." },
        { p: "Alla cessazione, per qualsiasi causa, lo Studio consegna i materiali realizzati e pagati e coopera al passaggio di consegne; il cliente provvede a rimuovere le credenziali di accesso rilasciate allo Studio." },
      ],
    },
    {
      id: "forza-maggiore",
      title: "Forza maggiore",
      blocks: [
        { p: "Nessuna delle parti risponde del ritardo o dell'inadempimento dovuto a eventi imprevedibili e fuori dal proprio controllo, quali guasti estesi delle reti di comunicazione o dei fornitori di infrastruttura, provvedimenti dell'autorità, calamità naturali, conflitti, epidemie o interruzioni prolungate dell'energia elettrica." },
        { p: "La parte che subisce l'evento lo comunica senza ritardo all'altra. Se l'impedimento si protrae oltre sessanta giorni, ciascuna parte può recedere dal contratto senza penali, fermo restando il pagamento delle attività già eseguite." },
      ],
    },
    {
      id: "consumatori",
      title: "Clienti consumatori: diritto di recesso",
      blocks: [
        { p: "Questa sezione si applica soltanto a chi conclude il contratto per scopi estranei all'attività imprenditoriale, commerciale, artigianale o professionale eventualmente svolta, ed è quindi consumatore ai sensi dell'articolo 3 del Codice del Consumo. Non si applica alle imprese, ai professionisti e agli enti." },
        { p: "Trattandosi di contratti conclusi a distanza, il consumatore ha diritto di recedere senza motivazione entro quattordici giorni dalla conclusione del contratto, ai sensi degli articoli 52 e seguenti del Codice del Consumo. È sufficiente una dichiarazione esplicita inviata a {email}, anche utilizzando il modulo tipo dell'allegato I, parte B, del Codice del Consumo." },
        { p: "Se il consumatore chiede espressamente che l'esecuzione inizi prima della scadenza dei quattordici giorni, e lo Studio dà corso alla richiesta:" },
        { ul: [
          "in caso di recesso durante l'esecuzione, è dovuto un importo proporzionale a quanto è stato fornito fino al momento del recesso, calcolato sul corrispettivo complessivo pattuito (articolo 57, comma 3);",
          "se il servizio è stato interamente eseguito entro il termine, il diritto di recesso viene meno, purché il consumatore abbia riconosciuto espressamente e preventivamente tale conseguenza (articolo 59, comma 1, lettera a);",
          "per la fornitura di contenuto digitale non su supporto materiale, il diritto di recesso viene meno con l'inizio dell'esecuzione preceduto dall'accordo espresso e dalla presa d'atto della perdita del diritto (articolo 59, comma 1, lettera o).",
        ] },
        { p: "Le somme eventualmente versate vengono rimborsate entro quattordici giorni dalla ricezione della dichiarazione di recesso, con lo stesso mezzo di pagamento usato per il pagamento originario, al netto dell'importo proporzionale sopra indicato." },
      ],
    },
    {
      id: "controversie",
      title: "Reclami e risoluzione delle controversie",
      blocks: [
        { p: "I reclami vanno indirizzati a {email}. Lo Studio si impegna a rispondere entro quindici giorni lavorativi, proponendo una soluzione o motivando il diniego. Le parti si impegnano a tentare in buona fede una composizione amichevole prima di adire l'autorità giudiziaria." },
        { p: "Se l'accordo non viene raggiunto, il consumatore può rivolgersi a un organismo di risoluzione alternativa delle controversie iscritto nell'elenco tenuto dal Ministero delle imprese e del made in Italy ai sensi dell'articolo 141-decies del Codice del Consumo, oppure attivare la mediazione presso un organismo iscritto nel registro del Ministero della Giustizia ai sensi del D.lgs. 28/2010. L'adesione dello Studio alla procedura è volontaria, salvo i casi in cui la legge la renda obbligatoria." },
        { note: "La piattaforma europea di risoluzione delle controversie online (ODR) istituita dal regolamento (UE) 524/2013 ha cessato di operare il 20 luglio 2025: il collegamento che molti siti riportano ancora non conduce ad alcun servizio attivo, e per questo qui non viene indicato." },
      ],
    },
    {
      id: "legge",
      title: "Legge applicabile e foro competente",
      blocks: [
        { p: "Questi termini e i contratti che vi rinviano sono regolati dalla legge italiana, con esclusione della Convenzione delle Nazioni Unite sui contratti di vendita internazionale di merci." },
        { p: "Per le controversie con soggetti che non rivestono la qualità di consumatore è competente in via esclusiva il foro del luogo in cui il Titolare ha la propria sede; fino all'attribuzione e alla pubblicazione della sede in testa a questa pagina si applicano i criteri ordinari degli articoli 18 e 20 del Codice di procedura civile." },
        { p: "Nei rapporti con i consumatori resta ferma la competenza inderogabile del foro del luogo di residenza o di domicilio elettivo del consumatore, ai sensi dell'articolo 66-bis del Codice del Consumo, e l'applicazione delle norme imperative più favorevoli previste dall'ordinamento del Paese di residenza abituale." },
      ],
    },
    {
      id: "finali",
      title: "Disposizioni finali",
      blocks: [
        { ul: [
          "L'eventuale nullità o inefficacia di una clausola non travolge le altre, che restano valide nella parte non colpita.",
          "La tolleranza di un inadempimento non costituisce rinuncia a farlo valere in seguito.",
          "Il cliente non può cedere il contratto o i diritti che ne derivano senza il consenso scritto dello Studio; lo Studio può avvalersi di collaboratori e fornitori, restando unico responsabile verso il cliente.",
          "Le comunicazioni previste da questi termini sono valide se inviate agli indirizzi email indicati dalle parti nel contratto.",
          "Questi termini sono redatti in italiano e in inglese: in caso di divergenza interpretativa prevale la versione italiana, che è quella sulla quale il testo è stato costruito.",
        ] },
      ],
    },
  ],
}

const en: LegalDoc = {
  kicker: "Terms and conditions",
  title: "Terms of use and terms of service",
  lead: "The rules governing use of this site and the general conditions applying to the Studio's professional services: how the contract is formed, what it covers, who owns what, how payment works, which warranties apply and how a dispute is resolved.",

  sections: [
    {
      id: "oggetto",
      title: "Subject matter and scope",
      blocks: [
        { p: "These terms govern two distinct things. Sections 1 to 10 concern access to and use of {site} by anyone, and apply from the moment you open any page. Sections 11 to 25 contain the general conditions for the Studio's professional services and apply to client relationships, as referred to in the accepted quote or order." },
        { p: "Where these general conditions conflict with what is agreed in writing in a quote, a contract or an order signed by the parties, the specific agreement prevails. The general conditions continue to apply to everything the specific agreement does not cover." },
      ],
    },
    {
      id: "gestore",
      title: "Who operates the site",
      blocks: [
        { p: "The site is operated by {entity}, whose identification and contact details appear in the box at the top of this page, in compliance with the information duties under Article 7 of Italian Legislative Decree 70/2003 on electronic commerce." },
        { p: "For any communication concerning these terms, including complaints and formal notices, the valid address is {email}. Communications sent to that address are deemed received on the business day following dispatch." },
      ],
    },
    {
      id: "accettazione",
      title: "Acceptance and changes",
      blocks: [
        { p: "Using the site means accepting these terms in full, in the version published at the time of access. If you do not agree with them, the only consequence provided for is that you should not use the site." },
        { p: "The Studio may amend them for technical, organisational or regulatory reasons. Changes take effect on publication at this address, with the last-updated date shown at the top of the page, and have no retroactive effect on contracts already concluded: those remain governed by the version in force when they were entered into, which you may request at any time at {email}." },
        { p: "Registered users are told of material changes through a message in the client area at least fifteen days in advance; within that period the account can be closed at no cost." },
      ],
    },
    {
      id: "contenuti",
      title: "Nature of the content on this site",
      blocks: [
        { p: "The content published — service descriptions, case studies, technical articles, interactive demonstrations — is informational and promotional. It is not an offer to the public within the meaning of Article 1336 of the Italian Civil Code, nor professional, technical, legal or tax advice on which to base decisions without a specific assessment." },
        { p: "The timing, complexity and cost estimates produced by the configurator and by the demos are indicative and generated by disclosed rules: they exist to frame an order of magnitude, they do not bind the Studio and they do not replace a quote, which is always issued in writing after the actual case has been examined." },
        { p: "The demonstration applications reachable from the site run on invented data for illustrative purposes. Company names, amounts, documents and receipts appearing in them do not refer to real parties, have no accounting, tax or evidential value and must not be used for anything other than the demonstration." },
        { p: "The Studio works to keep content accurate and current, but does not warrant that it is free of errors or that it stays up to date: the technology described changes faster than the pages describing it." },
      ],
    },
    {
      id: "proprieta-sito",
      title: "Intellectual property in the site",
      blocks: [
        { p: "The site as a whole and its elements — text, structure, interfaces, graphics, illustrations, source code, interactive demonstrations — are works protected by Italian Law No. 633 of 22 April 1941 and, as regards software, by Articles 64-bis et seq. of that law. All rights are reserved to the Controller or to the respective rights holders." },
        { p: "The name «Nadia Maar», the accompanying mark and the other distinctive signs on the site belong to the Controller and are protected under Legislative Decree 30/2005. Any third-party trade marks, logos and names mentioned belong to their respective owners and are used for descriptive purposes only, without any sponsorship or affiliation." },
        { p: "You may read the pages, print them and keep a copy for personal, non-commercial use, and quote extracts for the purposes of criticism, discussion or teaching, citing the source and linking to the original page, within the limits of Article 70 of the copyright law." },
        { p: "Without written authorisation, any reproduction, republication, adaptation or distribution of the content in whole or in substantial part is prohibited, including its reuse within competing products or services." },
        { p: "As regards automated text and data mining, the Controller allows search engines to index the content and conversational assistants to use it in answering user questions with attribution, on the terms declared in the site's [robots.txt](/robots.txt). Any other use is reserved under Article 70-quater of Law 633/1941, in particular the systematic reproduction of the content in collections or services that substitute for it." },
      ],
    },
    {
      id: "uso-vietato",
      title: "Permitted and prohibited use",
      blocks: [
        { p: "The site must be used lawfully, fairly and in accordance with these conditions. In particular, you must not:" },
        { ul: [
          "attempt to access restricted areas, data or functions you are not authorised to reach, or circumvent security measures;",
          "subject the site or its functions to load testing, vulnerability scanning or automated attacks without prior written authorisation;",
          "extract content in bulk or systematically with automated tools, beyond what the previous section and the robots.txt file allow;",
          "submit through the forms any unlawful, defamatory or discriminatory content, anything infringing third-party rights, or unsolicited commercial communications;",
          "introduce malicious code or interfere with the operation of the site, its infrastructure or connected services;",
          "reproduce the look, name or distinctive signs of the site in a way likely to cause confusion as to origin.",
        ] },
        { p: "The Controller may suspend or block access for anyone breaching these rules, without prejudice to compensation for damages and to reporting conduct of criminal relevance to the competent authorities. Responsible vulnerability disclosures are welcome and should be sent to {email}: anyone reporting in good faith, without accessing other people's data and without disclosing the vulnerability before it is fixed, will face no action from the Controller." },
      ],
    },
    {
      id: "account",
      title: "Client area, registration and credentials",
      blocks: [
        { p: "Some functions are available only after registration. By registering you declare that you have legal capacity, that the data you provide is true and current and that, if you act for an organisation, you have authority to bind it." },
        { p: "Credentials are personal and non-transferable: you are responsible for keeping them safe and for activity carried out with them until you report unauthorised use, which must be sent without delay to {email}." },
        { p: "You may close your account at any time and without giving reasons by writing to the address above. The Controller may suspend or close it, with notice save in urgent cases, in the event of breach of these terms, fraudulent use or inactivity for more than twenty-four months. On closure, uploaded content is deleted within the periods stated in the [privacy notice](/privacy), subject to record-keeping obligations." },
        { p: "The client area is a shared working tool, not a storage service: always keep your own copy of the documents you upload there." },
      ],
    },
    {
      id: "disponibilita",
      title: "Availability of the site",
      blocks: [
        { p: "The site is provided «as is» and subject to actual availability. The Studio works to keep it running, but assumes no obligation of uninterrupted operation: interruptions may occur for maintenance, updates, third-party infrastructure failures or force majeure." },
        { p: "Planned work is carried out, where possible, at quieter times and announced in advance to registered users. Continuity obligations for services commissioned by clients are governed by the service levels agreed in writing in the relevant maintenance contract, not by this section." },
      ],
    },
    {
      id: "terzi",
      title: "Third-party links and services",
      blocks: [
        { p: "The site contains links to external resources offered by third parties. The Controller does not control those resources, does not warrant their content, availability or security, and is not liable for any damage arising from their use: once you follow a link, the terms and notices of the relevant operator apply." },
        { p: "Including a link does not imply endorsement, sponsorship or affiliation." },
      ],
    },
    {
      id: "responsabilita-sito",
      title: "Limitation of liability for use of the site",
      blocks: [
        { p: "To the extent permitted by law, the Controller is not liable for damage arising from the use of, or inability to use, the site, nor for decisions taken on the basis of the informational content published on it without a specific assessment." },
        { p: "The following remain unaffected and prevail over any provision to the contrary: the nullity of any agreement excluding or limiting liability in advance for wilful misconduct or gross negligence (Article 1229 of the Italian Civil Code); liability for personal injury; and, in dealings with consumers, the prohibition of unfair terms under Articles 33 and 36 of the Italian Consumer Code, which renders impermissible limitations ineffective." },
      ],
    },
    {
      id: "contratto",
      title: "Formation of the services contract",
      blocks: [
        { p: "The contract is formed when the Studio receives written acceptance of a quote or order, given by email, by signing the document or through the dedicated function in the client area. An enquiry sent from the site, the configurator or by message binds neither party: it opens a negotiation." },
        { p: "Unless stated otherwise, a quote remains valid for thirty days from its date. After that, amounts and timings may be restated." },
        { p: "The quote sets out the subject matter of the services, the fees, the expected timings, the exclusions and any third-party costs required (licences, subscription services, hosting, domains). Anything not written in the quote is not included in the price." },
        { p: "The Studio confirms formation of the contract in writing and keeps a copy; on request it provides the client with a copy on a durable medium." },
      ],
    },
    {
      id: "perimetro",
      title: "Scope of work, changes and nature of the obligations",
      blocks: [
        { p: "Unless the contract provides otherwise, the Studio assumes an obligation of means as regards commercial outcomes (traffic, rankings, conversions, revenue), which depend on factors beyond its control, and an obligation of result as regards building and delivering what the quote describes." },
        { p: "Changes requested after acceptance that affect scope, architecture or timing are variations: they are quantified in writing and their execution must be agreed before the Studio acts on them. Absent agreement, the original scope and price stand." },
        { p: "Unless otherwise agreed in writing, the following are outside scope: production of editorial and photographic content, purchase of third-party licences and services, migration of data from undocumented legacy systems, training beyond the hours stated, and maintenance after delivery." },
      ],
    },
    {
      id: "cliente",
      title: "Client obligations and cooperation",
      blocks: [
        { p: "Delivery requires active cooperation. The client undertakes to:" },
        { ul: [
          "provide content, materials, access and information within the agreed timescales, complete and in usable form;",
          "nominate a single contact with authority to decide and approve;",
          "respond to approval requests within the deadlines set in the work plan;",
          "warrant that it owns or is licensed for the rights in the materials it supplies — text, images, trade marks, databases — and indemnify the Studio against third-party claims relating to those materials;",
          "carry out the obligations falling to it, including those on personal data protection towards the users of its own systems.",
        ] },
        { p: "Delays attributable to the client suspend delivery deadlines for a period equal to the delay. Where inaction continues beyond sixty days, the Studio may invoice the work performed up to that point and suspend the project until cooperation resumes." },
      ],
    },
    {
      id: "consegne",
      title: "Timings, delivery and phase approval",
      blocks: [
        { p: "The timings in the quote run from receipt of everything needed to start — acceptance, any deposit, materials and access — and are expressed in working days." },
        { p: "Work is organised in phases. At the end of each, the client has ten working days to approve it or to submit reasoned change requests through the client area. If the deadline passes without a response, the phase is deemed approved and the project continues: without that rule a project could stay open indefinitely waiting for an approval that never arrives." },
        { p: "Approving a phase does not affect the warranty for defects that emerge later and were not detectable with ordinary diligence at the time of approval." },
        { p: "Go-live takes place with the client's written consent. The warranty period stated below runs from that moment." },
      ],
    },
    {
      id: "pagamenti",
      title: "Fees, invoicing and payment",
      blocks: [
        { p: "Fees are those stated in the quote. Unless otherwise agreed, payment is split into a deposit on formation of the contract and the balance on delivery; for projects organised in several phases, progress payments may be agreed." },
        { p: "Invoices are issued, where the applicable rules so require, electronically through the Italian Interchange System, and are payable within thirty days of their date, unless a different term is agreed in writing. Third-party costs advanced by the Studio (licences, hosting, domains, subscription services) are recharged at cost." },
        { p: "In dealings between businesses and professionals, late payment gives rise by operation of law and without any notice of default to the interest provided for by Legislative Decree 231/2002, at the European Central Bank reference rate plus eight percentage points, together with the fixed sum of EUR 40 for recovery costs, without prejudice to proof of greater loss." },
        { p: "Fifteen days after the due date the Studio may suspend work in progress and access to connected services, giving written notice. Suspension does not extend the client's obligations and gives rise to no right to compensation." },
        { p: "Set-off against disputed claims is not permitted, nor is withholding of fees for complaints relating to parts of the work other than those already delivered and usable." },
      ],
    },
    {
      id: "proprieta-opere",
      title: "Ownership of deliverables, licences and third-party components",
      blocks: [
        { p: "Economic exploitation rights in materials created specifically for the client — bespoke source code, interfaces, text and graphics produced within the project — transfer to the client upon payment of the fees in full, exclusively, without time limit and worldwide. Until then the client holds a temporary licence limited to review and testing." },
        { p: "The following remain owned by the Studio, which grants the client a non-exclusive, perpetual, irrevocable and non-transferable licence to use them within the delivered product: libraries, components, schemas and tooling developed generally and reusable in other projects, together with the know-how and methods applied. This reservation in no way limits the client's use, modification or transfer of the product built for it." },
        { p: "Third-party components — open source libraries, typefaces, subscription services, licensed images — remain subject to their own licences, which are complied with and a list of which the Studio supplies on request. Compliance with those licences, including any subscription fees falling due after delivery, is the client's responsibility." },
        { p: "The author's moral rights, inalienable under Article 20 of Law 633/1941, remain with the person who created the work." },
        { p: "Unless the client requests otherwise in writing, the Studio may refer to the work performed and name the client in its portfolio and presentation materials, showing images of the delivered product and non-confidential results. The client may object at any time by writing to {email}." },
      ],
    },
    {
      id: "garanzia",
      title: "Warranty, defects and support",
      blocks: [
        { p: "For ninety days from go-live the Studio fixes, free of charge, defects of conformity in the delivered software — behaviour differing from what was agreed in writing — provided they are reported with a description allowing them to be reproduced." },
        { p: "The warranty does not cover: malfunctions caused by changes made by third parties, use contrary to the instructions supplied, failures or changes in third-party services and interfaces, content entered by the client, and requests for new features, which are variations." },
        { p: "Mandatory rules on defects in the work remain unaffected, in particular Article 2226 of the Italian Civil Code and — in contracts with consumers for digital content or digital services — the conformity and remedies provisions of Articles 135-octies et seq. of the Italian Consumer Code, which this section neither intends nor is able to derogate from." },
        { p: "Post-warranty support, security updates, periodic backups and response times are the subject of a separate maintenance contract. Without such a contract, the Studio assumes no monitoring, updating or restoration obligations, and running backups remains the client's responsibility." },
      ],
    },
    {
      id: "riservatezza",
      title: "Confidentiality",
      blocks: [
        { p: "Each party undertakes to keep confidential the technical, commercial and organisational information learned from the other by reason of the relationship, not to disclose it and to use it only to perform the contract. The obligation lasts five years after the relationship ends and does not apply to public information, to information already lawfully known, or to information whose disclosure is required by law or by the authorities." },
        { p: "At the client's request the Studio signs a specific non-disclosure agreement before accessing sensitive systems or information." },
      ],
    },
    {
      id: "dati",
      title: "Personal data protection",
      blocks: [
        { p: "The processing of the personal data of the client and its contacts is described in the [privacy notice](/privacy)." },
        { p: "Where performance of the contract involves access to personal data for which the client is the controller, the Studio acts as processor and the parties sign, before any access, the appointment required by Article 28 of Regulation (EU) 2016/679, governing instructions, security measures, sub-processors, assistance and the fate of the data when the service ends." },
      ],
    },
    {
      id: "recesso-risoluzione",
      title: "Duration, withdrawal and termination",
      blocks: [
        { p: "Project contracts run until the work is completed; maintenance contracts run for the agreed term and, if renewable, renew only on written confirmation: there is no tacit renewal." },
        { p: "The client may withdraw from a project contract at any time by written notice; in that case the fees for work performed up to receipt of the notice are due, together with expenses incurred and non-cancellable commitments entered into with third parties, under Article 2227 of the Italian Civil Code." },
        { p: "Either party may terminate the contract under Article 1456 of the Italian Civil Code, by written notice, in the event of: failure to pay persisting more than thirty days after formal notice; breach of confidentiality obligations; infringement of intellectual property rights; failure to cooperate persisting beyond sixty days." },
        { p: "On termination, for whatever reason, the Studio hands over the materials produced and paid for and cooperates in the handover; the client removes the access credentials issued to the Studio." },
      ],
    },
    {
      id: "forza-maggiore",
      title: "Force majeure",
      blocks: [
        { p: "Neither party is liable for delay or non-performance caused by unforeseeable events beyond its control, such as widespread failures of communication networks or infrastructure providers, measures taken by the authorities, natural disasters, conflicts, epidemics or prolonged power outages." },
        { p: "The party affected notifies the other without delay. If the impediment lasts more than sixty days, either party may withdraw from the contract without penalty, subject to payment for work already performed." },
      ],
    },
    {
      id: "consumatori",
      title: "Consumer clients: right of withdrawal",
      blocks: [
        { p: "This section applies only to those entering into the contract for purposes outside any business, commercial, craft or professional activity, and who are therefore consumers within the meaning of Article 3 of the Italian Consumer Code. It does not apply to companies, professionals or organisations." },
        { p: "As these are distance contracts, the consumer has the right to withdraw without giving reasons within fourteen days of the conclusion of the contract, under Articles 52 et seq. of the Italian Consumer Code. An explicit statement sent to {email} is enough, including by using the model form in Annex I, Part B, of that Code." },
        { p: "Where the consumer expressly requests that performance begin before the fourteen days expire, and the Studio acts on that request:" },
        { ul: [
          "if withdrawal occurs during performance, an amount is due in proportion to what has been supplied up to that point, calculated on the total agreed fee (Article 57(3));",
          "if the service has been fully performed within the period, the right of withdrawal is lost, provided the consumer expressly acknowledged that consequence in advance (Article 59(1)(a));",
          "for the supply of digital content not on a tangible medium, the right of withdrawal is lost once performance begins with the consumer's express agreement and acknowledgement of the loss of that right (Article 59(1)(o)).",
        ] },
        { p: "Any sums paid are refunded within fourteen days of receipt of the withdrawal notice, using the same means of payment as the original transaction, less the proportionate amount referred to above." },
      ],
    },
    {
      id: "controversie",
      title: "Complaints and dispute resolution",
      blocks: [
        { p: "Complaints should be addressed to {email}. The Studio undertakes to reply within fifteen working days, proposing a solution or giving reasons for refusal. The parties undertake to attempt an amicable settlement in good faith before going to court." },
        { p: "If no agreement is reached, a consumer may turn to an alternative dispute resolution body listed by the Italian Ministry of Enterprise and Made in Italy under Article 141-decies of the Consumer Code, or start mediation before a body registered with the Ministry of Justice under Legislative Decree 28/2010. The Studio's participation is voluntary, except where the law makes it mandatory." },
        { note: "The European online dispute resolution (ODR) platform set up by Regulation (EU) 524/2013 ceased operating on 20 July 2025: the link many sites still display leads to no active service, which is why it is not given here." },
      ],
    },
    {
      id: "legge",
      title: "Governing law and jurisdiction",
      blocks: [
        { p: "These terms and the contracts referring to them are governed by Italian law, excluding the United Nations Convention on Contracts for the International Sale of Goods." },
        { p: "For disputes with parties who are not consumers, the courts of the place where the Controller has its registered office have exclusive jurisdiction; until that office is assigned and published at the top of this page, the ordinary criteria of Articles 18 and 20 of the Italian Code of Civil Procedure apply." },
        { p: "In dealings with consumers, the mandatory jurisdiction of the courts of the consumer's place of residence or elected domicile under Article 66-bis of the Italian Consumer Code remains unaffected, as does the application of any more favourable mandatory rules of the country of habitual residence." },
      ],
    },
    {
      id: "finali",
      title: "Final provisions",
      blocks: [
        { ul: [
          "If any clause is void or ineffective, the remaining clauses are unaffected and remain valid to the extent not struck down.",
          "Tolerating a breach does not amount to waiving the right to rely on it later.",
          "The client may not assign the contract or the rights arising from it without the Studio's written consent; the Studio may use collaborators and suppliers while remaining solely responsible towards the client.",
          "Notices under these terms are valid if sent to the email addresses stated by the parties in the contract.",
          "These terms are drafted in Italian and English: in the event of any divergence in interpretation, the Italian version prevails, being the version the text was built on.",
        ] },
      ],
    },
  ],
}

export const TERMS_STR = { it, en } satisfies Bundle<LegalDoc>
