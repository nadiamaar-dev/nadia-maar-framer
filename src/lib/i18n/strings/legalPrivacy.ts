import type { LegalDoc } from "../../legal"
import type { Bundle } from "../t"

/* ══════════════════════════════════════════════════════════════════════════
   INFORMATIVA PRIVACY — articoli 13 e 14 del Regolamento (UE) 2016/679.

   REGOLA DI SCRITTURA, valida per tutti e tre i documenti legali: qui si
   descrive ciò che il sito FA DAVVERO, verificato leggendo il codice, non
   ciò che un modello scaricato da internet dice che un sito di solito fa.
   Ogni riga della tabella dei destinatari corrisponde a una chiamata di
   rete che esiste nel repository; ogni riga della tabella dei dati
   corrisponde a una colonna di una tabella del database.

   I punti verificati e le loro fonti nel codice:
   · l'indirizzo IP diventa un'impronta con SHA-256 e sale segreto, troncata
     a 128 bit, e non entra mai in chiaro nel database (src/lib/edge.ts,
     api/track.ts);
   · le statistiche interne non usano cookie: l'identificatore di sessione
     vive in sessionStorage e muore con la scheda (src/lib/measure.ts);
   · GA4, Google Tag Manager e Meta Pixel NON vengono caricati se il
     consenso manca — non «caricati e disattivati», proprio non richiesti
     (src/lib/measure.ts, loadThirdParty);
   · i caratteri sono ospitati sul dominio, quindi nessuna richiesta a
     fonts.googleapis.com (src/styles/fonts.css);
   · l'arrivo di una richiesta viene notificato via Telegram (api/contact.ts,
     api/notify.ts): è un destinatario, e come tale va dichiarato.

   Se una di queste cose cambia nel codice, questo testo va cambiato con
   essa: un'informativa che descrive un sito diverso da quello pubblicato è
   il tipo di errore che il Garante contesta per primo.
══════════════════════════════════════════════════════════════════════════ */

const it: LegalDoc = {
  kicker: "Informativa privacy",
  title: "Informativa sul trattamento dei dati personali",
  lead: "Chi tratta i tuoi dati quando visiti questo sito, ci scrivi o usi l'area riservata; quali dati, per quali finalità, su quale base giuridica, per quanto tempo e con quali diritti. Resa ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 (GDPR) e del D.lgs. 196/2003 come modificato dal D.lgs. 101/2018.",

  sections: [
    {
      id: "titolare",
      title: "Titolare del trattamento",
      blocks: [
        { p: "Il Titolare del trattamento è {entity} (di seguito «il Titolare» o «lo Studio»), raggiungibile all'indirizzo {email} e al numero {phone}. I dati identificativi completi sono riportati nel riquadro in cima a questa pagina." },
        { p: "Il Titolare non ha nominato un Responsabile della protezione dei dati (DPO): non ricorre nessuno dei casi previsti dall'articolo 37, paragrafo 1, del Regolamento — non si tratta di un'autorità pubblica, l'attività principale non consiste in trattamenti che richiedono il monitoraggio regolare e sistematico degli interessati su larga scala, né nel trattamento su larga scala di categorie particolari di dati. Le richieste degli interessati sono gestite direttamente dal Titolare all'indirizzo {email}." },
        { p: "Il Titolare non ha nominato un rappresentante nell'Unione ai sensi dell'articolo 27 perché è stabilito in uno Stato membro." },
      ],
    },
    {
      id: "ambito",
      title: "A chi si rivolge questa informativa",
      blocks: [
        { p: "Questa informativa riguarda i trattamenti di cui il Titolare decide finalità e mezzi, e in particolare i dati di:" },
        { ul: [
          "chi visita le pagine pubbliche di {site};",
          "chi invia il modulo di contatto, il configuratore di progetto o scrive per email, telefono, WhatsApp o Telegram;",
          "chi si registra e utilizza l'area riservata, compresi i referenti indicati da un cliente;",
          "chi fissa un appuntamento attraverso il calendario del portale;",
          "i clienti e i potenziali clienti, per la gestione del rapporto professionale e per i conseguenti obblighi contabili e fiscali.",
        ] },
        { note: "Non riguarda invece i dati personali che lo Studio tratta per conto di un cliente all'interno dei progetti che sviluppa o mantiene: in quel caso il titolare del trattamento è il cliente e lo Studio agisce come responsabile ai sensi dell'articolo 28. Vedi la sezione «Dati trattati per conto dei clienti»." },
      ],
    },
    {
      id: "dati",
      title: "Quali dati vengono trattati",
      blocks: [
        { table: {
          head: ["Categoria", "Dati", "Origine"],
          rows: [
            ["Dati di contatto", "Nome e cognome, indirizzo email, nome dell'azienda, numero di telefono, nome utente Telegram o WhatsApp quando lo indichi tu.", "Forniti dall'interessato"],
            ["Contenuto delle comunicazioni", "Il testo del messaggio, gli allegati, la cronologia della conversazione nell'area riservata e i documenti caricati.", "Forniti dall'interessato"],
            ["Dati della richiesta di progetto", "Le risposte al configuratore, i moduli selezionati, il blueprint generato, la pagina dalla quale è partita la richiesta.", "Forniti dall'interessato"],
            ["Dati di navigazione", "Pagina visitata, dominio di provenienza, stringa del browser (user agent), tipo di dispositivo, Paese ricavato dalla rete di distribuzione, impronta non reversibile dell'indirizzo IP, identificatore di sessione temporaneo, parametri di campagna (utm_*) del primo accesso.", "Raccolti automaticamente"],
            ["Dati dell'account", "Indirizzo email, nome, password conservata in forma cifrata dal fornitore dell'autenticazione, data di registrazione e di ultimo accesso, registro delle azioni compiute nel portale.", "Forniti dall'interessato e generati dal sistema"],
            ["Dati di progetto e amministrativi", "Preventivi, fasi approvate, richieste di modifica, appuntamenti, dichiarazioni di pagamento e dati necessari alla fatturazione.", "Forniti dall'interessato"],
            ["Log tecnici", "Registri delle richieste conservati dai fornitori di hosting e di database per finalità di sicurezza e diagnostica.", "Generati automaticamente"],
          ],
        } },
        { p: "L'indirizzo IP merita una precisazione, perché è il dato che più spesso viene raccolto senza dirlo. Questo sito non lo conserva: il server lo trasforma in un'impronta con l'algoritmo SHA-256 e un sale segreto, ne tiene i primi 128 bit e scarta l'originale. L'impronta serve a distinguere due visitatori diversi da due ricariche della stessa pagina e non consente di risalire all'indirizzo di partenza né di ricostruire un profilo tra siti diversi." },
        { p: "Non vengono trattate categorie particolari di dati ai sensi dell'articolo 9 (origine etnica, opinioni politiche, convinzioni religiose, dati sanitari, dati biometrici, orientamento sessuale) né dati relativi a condanne penali ai sensi dell'articolo 10. Ti chiediamo di non inserirne nei moduli e nei messaggi: non servono a nessuna delle finalità dichiarate qui." },
      ],
    },
    {
      id: "finalita",
      title: "Finalità, basi giuridiche e tempi di conservazione",
      blocks: [
        { table: {
          head: ["Finalità", "Base giuridica", "Conservazione"],
          rows: [
            ["Rispondere alle richieste di contatto, di informazioni e di preventivo.", "Articolo 6, paragrafo 1, lettera b): esecuzione di misure precontrattuali adottate su richiesta dell'interessato.", "24 mesi dall'ultimo contatto utile, salvo che nel frattempo nasca un rapporto contrattuale."],
            ["Stipulare ed eseguire il contratto: gestione del progetto, delle fasi, dei documenti e degli appuntamenti.", "Articolo 6, paragrafo 1, lettera b): esecuzione del contratto di cui l'interessato è parte.", "Per tutta la durata del rapporto e per i 10 anni successivi limitatamente alla documentazione contrattuale e contabile."],
            ["Adempiere agli obblighi contabili, fiscali e amministrativi.", "Articolo 6, paragrafo 1, lettera c): obbligo legale al quale è soggetto il Titolare.", "10 anni dalla registrazione, ai sensi dell'articolo 2220 del Codice civile e dell'articolo 39 del D.P.R. 633/1972."],
            ["Gestire l'account e l'area riservata: autenticazione, messaggi, documenti, notifiche e registro delle azioni.", "Articolo 6, paragrafo 1, lettera b), e articolo 6, paragrafo 1, lettera f) per il registro delle azioni, che serve a ricostruire chi ha approvato che cosa.", "Per la durata dell'account e per 12 mesi dalla sua chiusura, fatti salvi i termini più lunghi previsti per la documentazione contrattuale."],
            ["Misurare l'uso del sito con statistiche interne di prima parte, senza cookie e senza identificatori persistenti.", "Articolo 6, paragrafo 1, lettera f): interesse legittimo del Titolare a conoscere quali contenuti vengono letti. L'interesse è bilanciato dal fatto che i dati non identificano la persona, non vengono incrociati con altre fonti e non lasciano il perimetro dello Studio.", "14 mesi per gli eventi singoli; oltre tale termine restano soltanto totali aggregati che non si riferiscono a persone identificabili."],
            ["Garantire la sicurezza del sito, prevenire abusi dei moduli e limitare la frequenza degli invii.", "Articolo 6, paragrafo 1, lettera f): interesse legittimo a proteggere il servizio e chi lo usa.", "12 mesi."],
            ["Statistiche e misurazione di terze parti (Google Analytics 4, Google Tag Manager, Meta Pixel), attive soltanto se configurate e previo consenso.", "Articolo 6, paragrafo 1, lettera a): consenso, e articolo 122 del D.lgs. 196/2003 per l'archiviazione delle informazioni sul dispositivo.", "Secondo le durate indicate nella [Cookie Policy](/cookie-policy). Il consenso è revocabile in qualsiasi momento e la revoca non pregiudica la liceità del trattamento precedente."],
            ["Far valere o difendere un diritto in sede giudiziaria o stragiudiziale.", "Articolo 6, paragrafo 1, lettera f): interesse legittimo alla tutela dei propri diritti.", "Per la durata del contenzioso e fino allo spirare dei termini di impugnazione o di prescrizione dell'azione."],
            ["Mostrare il lavoro svolto nel portfolio dello Studio, citando il committente e il risultato ottenuto.", "Articolo 6, paragrafo 1, lettera f), fermo restando quanto pattuito nel contratto e il diritto di opposizione.", "Fino a opposizione o a diversa pattuizione scritta."],
          ],
        } },
        { note: "Lo Studio non svolge attività di marketing diretto: non gestisce newsletter, non invia comunicazioni commerciali a chi non le ha richieste e non cede i tuoi dati a nessuno perché li usi per fini propri. Se in futuro una newsletter verrà attivata, sarà preceduta da una richiesta di consenso separata, facoltativa e revocabile, e questa informativa verrà aggiornata prima del primo invio." },
        { p: "Alla scadenza dei termini indicati i dati vengono cancellati oppure resi anonimi in modo irreversibile, salvo che una norma di legge ne imponga la conservazione più lunga o che siano necessari a una controversia già insorta." },
      ],
    },
    {
      id: "conferimento",
      title: "Natura del conferimento e conseguenze del rifiuto",
      blocks: [
        { p: "Il conferimento dei dati contrassegnati come obbligatori nei moduli — nome, indirizzo email e testo del messaggio — è necessario per ricevere una risposta: senza di essi la richiesta non può essere presa in carico, ed è la ragione per cui il modulo non si invia. Tutti gli altri campi sono facoltativi e servono soltanto a rendere la risposta più pertinente." },
        { p: "Per l'esecuzione del contratto e per gli adempimenti fiscali il conferimento dei dati di fatturazione è obbligatorio per legge: il rifiuto rende impossibile emettere i documenti previsti e, di conseguenza, eseguire la prestazione." },
        { p: "Il conferimento dei dati raccolti dagli strumenti di terze parti è invece sempre facoltativo: il rifiuto del consenso non limita in alcun modo l'accesso al sito né la qualità della navigazione." },
      ],
    },
    {
      id: "cookie",
      title: "Cookie e strumenti di tracciamento",
      blocks: [
        { p: "Questo sito non installa cookie di profilazione propri. Utilizza un cookie tecnico per ricordare la lingua scelta e alcune aree di memoria del browser (localStorage e sessionStorage) per conservare la scelta sul consenso, l'identificatore temporaneo di sessione e — nell'area riservata — il token di autenticazione." },
        { p: "Gli strumenti di terze parti che profilano vengono caricati soltanto se sono stati configurati e se hai prestato il consenso: se rifiuti, gli script non vengono richiesti affatto, non vengono scaricati e non vengono eseguiti." },
        { p: "L'elenco completo, con finalità, durata e istruzioni per revocare il consenso, è nella [Cookie Policy](/cookie-policy), che costituisce parte integrante di questa informativa." },
      ],
    },
    {
      id: "destinatari",
      title: "Destinatari dei dati e responsabili del trattamento",
      blocks: [
        { p: "I dati non vengono diffusi, non vengono venduti e non vengono ceduti a terzi perché li usino per finalità proprie. Possono essere conosciuti dai fornitori che rendono tecnicamente possibile il servizio, nominati responsabili del trattamento ai sensi dell'articolo 28 e vincolati da istruzioni scritte:" },
        { table: {
          head: ["Fornitore", "Ruolo", "Che cosa tratta"],
          rows: [
            ["Vercel Inc. (Stati Uniti)", "Responsabile del trattamento", "Hosting del sito e delle funzioni serverless, rete di distribuzione dei contenuti, log tecnici delle richieste."],
            ["Supabase Inc. (Stati Uniti)", "Responsabile del trattamento", "Database, autenticazione degli account e archiviazione dei file caricati nell'area riservata."],
            ["Telegram FZ-LLC (Emirati Arabi Uniti)", "Responsabile del trattamento", "Notifica immediata al Titolare dell'arrivo di una richiesta o di un evento del portale: contiene nome, indirizzo email e sintesi del messaggio."],
            ["Google Ireland Ltd. (Irlanda)", "Responsabile del trattamento", "Google Analytics 4 e Google Tag Manager, soltanto se attivati e previo consenso; misurazione delle prestazioni delle pagine tramite PageSpeed Insights, richiamato dal server e non dal tuo browser."],
            ["Meta Platforms Ireland Ltd. (Irlanda)", "Contitolare per la raccolta e la trasmissione, titolare autonomo per i trattamenti successivi", "Meta Pixel, soltanto se attivato e previo consenso."],
            ["Consulente fiscale e contabile", "Responsabile del trattamento o titolare autonomo secondo il ruolo professionale", "Dati necessari alla fatturazione e agli adempimenti tributari."],
            ["Professionisti legali e assicurativi", "Titolari autonomi", "Dati necessari alla tutela di un diritto, soltanto in caso di controversia."],
            ["Autorità giudiziarie e amministrative", "Titolari autonomi", "Dati richiesti in forza di un obbligo di legge, di un ordine dell'autorità o di un provvedimento giudiziario."],
          ],
        } },
        { p: "L'elenco aggiornato dei responsabili nominati può essere richiesto in qualsiasi momento scrivendo a {email}." },
      ],
    },
    {
      id: "trasferimenti",
      title: "Trasferimenti fuori dallo Spazio economico europeo",
      blocks: [
        { p: "Alcuni dei fornitori indicati sopra hanno sede negli Stati Uniti o possono avvalersi di infrastrutture situate fuori dallo Spazio economico europeo. In questi casi il trasferimento avviene soltanto in presenza di una delle garanzie previste dal Capo V del Regolamento:" },
        { ul: [
          "la decisione di adeguatezza della Commissione europea del 10 luglio 2023 relativa al EU-U.S. Data Privacy Framework, per i fornitori statunitensi che vi hanno aderito e risultano certificati;",
          "le clausole contrattuali tipo approvate dalla Commissione europea con decisione di esecuzione (UE) 2021/914, integrate — dove necessario — da misure supplementari di natura tecnica e organizzativa;",
          "in via residuale, le deroghe dell'articolo 49 quando il trasferimento è necessario all'esecuzione di un contratto concluso nel tuo interesse.",
        ] },
        { p: "Puoi ottenere una copia delle garanzie adottate, o l'indicazione del luogo in cui sono state rese disponibili, scrivendo a {email}." },
      ],
    },
    {
      id: "responsabile-clienti",
      title: "Dati trattati per conto dei clienti",
      blocks: [
        { p: "Nello sviluppo, nella manutenzione e nell'assistenza dei sistemi realizzati per un cliente, lo Studio può accedere a dati personali dei quali il titolare del trattamento è il cliente stesso: utenti di un sito, clienti di un negozio online, dipendenti che usano un gestionale." },
        { p: "In questi casi lo Studio agisce come responsabile del trattamento e, prima di ricevere qualsiasi accesso, sottoscrive con il cliente l'atto di nomina previsto dall'articolo 28, che disciplina in particolare:" },
        { ul: [
          "l'obbligo di trattare i dati soltanto sulla base di istruzioni documentate del titolare;",
          "il vincolo di riservatezza delle persone autorizzate al trattamento;",
          "le misure di sicurezza adottate ai sensi dell'articolo 32;",
          "le condizioni per il ricorso a eventuali sub-responsabili e il loro elenco;",
          "l'assistenza al titolare nel dare riscontro agli interessati e nel gestire un'eventuale violazione dei dati;",
          "la cancellazione o la restituzione dei dati al termine del servizio.",
        ] },
        { p: "Lo Studio non utilizza per finalità proprie i dati ai quali accede in questa veste e non li conserva oltre il tempo necessario a eseguire la prestazione richiesta." },
      ],
    },
    {
      id: "sicurezza",
      title: "Sicurezza dei dati",
      blocks: [
        { p: "Il Titolare adotta le misure tecniche e organizzative che l'articolo 32 richiede tenendo conto dello stato dell'arte, dei costi e dei rischi. In concreto, e verificabili:" },
        { ul: [
          "tutte le comunicazioni con il sito viaggiano cifrate su TLS;",
          "l'accesso ai dati del database è governato da regole di sicurezza a livello di riga (row level security): il permesso è verificato dal database, non dall'interfaccia, e una schermata sbagliata non basta a leggere i dati di un altro;",
          "le credenziali con privilegi elevati non entrano mai nel codice inviato al browser e restano nelle variabili d'ambiente del server;",
          "l'indirizzo IP dei visitatori viene ridotto a un'impronta non reversibile prima di essere scritto;",
          "i file caricati nell'area riservata sono isolati per cliente e serviti solo a chi ha titolo per leggerli;",
          "i dati raccolti sono limitati a quelli necessari alle finalità dichiarate, secondo il principio di minimizzazione.",
        ] },
        { p: "In caso di violazione dei dati personali il Titolare la notifica al Garante per la protezione dei dati personali entro 72 ore dal momento in cui ne viene a conoscenza, quando ne ricorrono i presupposti dell'articolo 33, e ne dà comunicazione agli interessati senza ingiustificato ritardo quando la violazione è suscettibile di presentare un rischio elevato per i loro diritti e libertà, ai sensi dell'articolo 34." },
      ],
    },
    {
      id: "diritti",
      title: "I tuoi diritti",
      blocks: [
        { p: "In qualsiasi momento puoi esercitare nei confronti del Titolare i diritti previsti dagli articoli da 15 a 22 del Regolamento:" },
        { ul: [
          "accesso (articolo 15): sapere se è in corso un trattamento e ottenere copia dei dati e delle informazioni sul trattamento;",
          "rettifica (articolo 16): correggere dati inesatti o integrare dati incompleti;",
          "cancellazione (articolo 17): ottenere la cancellazione dei dati quando non sono più necessari, quando revochi il consenso e non esiste altra base giuridica, o quando ti opponi al trattamento e non prevalgono motivi legittimi cogenti;",
          "limitazione (articolo 18): chiedere che i dati siano conservati ma non ulteriormente trattati, ad esempio mentre si verifica l'esattezza di una contestazione;",
          "portabilità (articolo 20): ricevere in formato strutturato, di uso comune e leggibile da dispositivo automatico i dati che hai fornito e che sono trattati sulla base del consenso o del contratto, e trasmetterli a un altro titolare;",
          "opposizione (articolo 21): opporti in qualsiasi momento, per motivi connessi alla tua situazione particolare, ai trattamenti fondati sull'interesse legittimo;",
          "revoca del consenso (articolo 7, paragrafo 3): ritirare in qualsiasi momento il consenso prestato, senza che ciò pregiudichi la liceità del trattamento svolto prima della revoca;",
          "non essere sottoposto a una decisione basata unicamente su un trattamento automatizzato (articolo 22): come indicato più avanti, questo sito non ne adotta.",
        ] },
        { p: "Per esercitarli è sufficiente scrivere a {email} indicando il diritto che intendi far valere. Il Titolare risponde senza ingiustificato ritardo e comunque entro un mese dal ricevimento della richiesta; il termine può essere prorogato di due mesi, tenuto conto della complessità e del numero delle richieste, dandotene notizia entro il primo mese (articolo 12, paragrafo 3). L'esercizio dei diritti è gratuito; solo in caso di richieste manifestamente infondate o eccessive, in particolare per il loro carattere ripetitivo, il Titolare può addebitare un contributo spese ragionevole o rifiutare di soddisfarle, motivando (articolo 12, paragrafo 5). Se necessario per accertare la tua identità, potranno esserti chieste informazioni ulteriori." },
        { p: "Se ritieni che il trattamento violi il Regolamento hai diritto di proporre reclamo all'autorità di controllo dello Stato membro in cui risiedi abitualmente, lavori o dove si è verificata la presunta violazione (articolo 77). In Italia: Garante per la protezione dei dati personali, Piazza Venezia 11, 00187 Roma — garante@gpdp.it, protocollo@pec.gpdp.it, [www.garanteprivacy.it](https://www.garanteprivacy.it). Resta impregiudicato il diritto a un ricorso giurisdizionale effettivo ai sensi dell'articolo 79." },
      ],
    },
    {
      id: "automatizzato",
      title: "Assenza di processi decisionali automatizzati e di profilazione",
      blocks: [
        { p: "Il Titolare non adotta processi decisionali automatizzati che producano effetti giuridici o incidano in modo analogamente significativo sulla tua persona, e non svolge profilazione ai sensi dell'articolo 4, punto 4." },
        { p: "La stima di complessità e di tempi che il configuratore mostra alla fine del percorso non è una decisione automatizzata in questo senso: è il risultato di regole deterministiche e dichiarate, non modifica alcuna posizione giuridica e non sostituisce la valutazione del Titolare, che esamina personalmente ogni richiesta prima di formulare una proposta." },
      ],
    },
    {
      id: "minori",
      title: "Minori",
      blocks: [
        { p: "I servizi descritti in questo sito si rivolgono a imprese, professionisti ed enti e non sono destinati ai minori. Il Titolare non raccoglie consapevolmente dati di minori di quattordici anni, età che l'articolo 2-quinquies del D.lgs. 196/2003 individua per il consenso ai servizi della società dell'informazione." },
        { p: "Se ritieni che un minore abbia conferito dati senza il consenso di chi esercita la responsabilità genitoriale, scrivi a {email}: i dati saranno cancellati senza ritardo." },
      ],
    },
    {
      id: "link",
      title: "Collegamenti a siti e servizi di terzi",
      blocks: [
        { p: "Il sito contiene collegamenti a siti gestiti da terzi — profili social, repository di codice, strumenti di misurazione pubblici. Il Titolare non controlla quei siti e non risponde del trattamento dei dati che vi avviene: quando li apri si applicano le informative dei rispettivi gestori, che ti invitiamo a leggere." },
      ],
    },
    {
      id: "modifiche",
      title: "Modifiche a questa informativa",
      blocks: [
        { p: "Questa informativa può essere aggiornata per adeguarla a modifiche del sito, dei servizi o della normativa. La versione in vigore è sempre quella pubblicata a questo indirizzo, con la data di ultimo aggiornamento indicata in testa alla pagina." },
        { p: "Se le modifiche riguardano finalità o basi giuridiche in modo sostanziale, il Titolare ne dà notizia con un avviso visibile sul sito e, per gli utenti registrati, con un messaggio nell'area riservata prima che le modifiche diventino efficaci. Le versioni precedenti possono essere richieste a {email}." },
      ],
    },
  ],
}

const en: LegalDoc = {
  kicker: "Privacy notice",
  title: "Personal data protection notice",
  lead: "Who processes your data when you visit this site, write to us or use the client area; what data, for which purposes, on which legal basis, for how long and with which rights. Provided under Articles 13 and 14 of Regulation (EU) 2016/679 (GDPR) and Italian Legislative Decree 196/2003 as amended by Legislative Decree 101/2018.",

  sections: [
    {
      id: "titolare",
      title: "Data controller",
      blocks: [
        { p: "The data controller is {entity} (the «Controller» or the «Studio»), reachable at {email} and on {phone}. Full identification details are shown in the box at the top of this page." },
        { p: "The Controller has not appointed a Data Protection Officer: none of the cases in Article 37(1) of the Regulation applies — it is not a public authority, its core activities do not consist of processing operations requiring regular and systematic monitoring of data subjects on a large scale, nor of large-scale processing of special categories of data. Data subject requests are handled directly by the Controller at {email}." },
        { p: "No representative in the Union has been appointed under Article 27, as the Controller is established in a Member State." },
      ],
    },
    {
      id: "ambito",
      title: "Who this notice is for",
      blocks: [
        { p: "This notice covers the processing operations whose purposes and means are determined by the Controller, and in particular the data of:" },
        { ul: [
          "anyone visiting the public pages of {site};",
          "anyone submitting the contact form or the project configurator, or writing by email, phone, WhatsApp or Telegram;",
          "anyone registering for and using the client area, including contacts nominated by a client;",
          "anyone booking a meeting through the portal calendar;",
          "clients and prospective clients, for the management of the professional relationship and the resulting accounting and tax obligations.",
        ] },
        { note: "It does not cover personal data that the Studio processes on behalf of a client within the projects it builds or maintains: in that case the client is the controller and the Studio acts as a processor under Article 28. See «Data processed on behalf of clients» below." },
      ],
    },
    {
      id: "dati",
      title: "What data is processed",
      blocks: [
        { table: {
          head: ["Category", "Data", "Source"],
          rows: [
            ["Contact data", "First and last name, email address, company name, phone number, Telegram or WhatsApp handle where you provide one.", "Provided by the data subject"],
            ["Content of communications", "The text of your message, attachments, the conversation history in the client area and the documents uploaded there.", "Provided by the data subject"],
            ["Project enquiry data", "Your answers in the configurator, the modules selected, the blueprint generated, the page the enquiry started from.", "Provided by the data subject"],
            ["Navigation data", "Page visited, referring domain, browser string (user agent), device type, country derived from the delivery network, an irreversible fingerprint of the IP address, a temporary session identifier, campaign parameters (utm_*) from the first visit.", "Collected automatically"],
            ["Account data", "Email address, name, password stored in encrypted form by the authentication provider, sign-up and last sign-in dates, the log of actions taken in the portal.", "Provided by the data subject and generated by the system"],
            ["Project and administrative data", "Quotes, approved phases, change requests, meetings, payment declarations and the data required for invoicing.", "Provided by the data subject"],
            ["Technical logs", "Request logs kept by the hosting and database providers for security and diagnostics.", "Generated automatically"],
          ],
        } },
        { p: "The IP address deserves a note, because it is the piece of data most often collected without saying so. This site does not keep it: the server turns it into a fingerprint using SHA-256 with a secret salt, keeps the first 128 bits and discards the original. The fingerprint distinguishes two different visitors from two reloads of the same page; it does not allow the original address to be recovered, nor a profile to be built across different sites." },
        { p: "No special categories of data under Article 9 are processed (racial or ethnic origin, political opinions, religious beliefs, health data, biometric data, sexual orientation), nor data relating to criminal convictions under Article 10. Please do not include any in forms or messages: they are not needed for any of the purposes stated here." },
      ],
    },
    {
      id: "finalita",
      title: "Purposes, legal bases and retention periods",
      blocks: [
        { table: {
          head: ["Purpose", "Legal basis", "Retention"],
          rows: [
            ["Replying to contact, information and quotation requests.", "Article 6(1)(b): steps taken at the request of the data subject prior to entering into a contract.", "24 months from the last meaningful contact, unless a contractual relationship arises in the meantime."],
            ["Entering into and performing the contract: managing the project, its phases, documents and meetings.", "Article 6(1)(b): performance of a contract to which the data subject is party.", "For the duration of the relationship and for 10 years thereafter, limited to contractual and accounting records."],
            ["Complying with accounting, tax and administrative obligations.", "Article 6(1)(c): legal obligation to which the Controller is subject.", "10 years from registration, under Article 2220 of the Italian Civil Code and Article 39 of Presidential Decree 633/1972."],
            ["Running the account and the client area: authentication, messages, documents, notifications and the action log.", "Article 6(1)(b), and Article 6(1)(f) for the action log, which exists so that it can be reconstructed who approved what.", "For the life of the account and for 12 months after it is closed, without prejudice to the longer periods applying to contractual records."],
            ["Measuring use of the site with first-party statistics, without cookies and without persistent identifiers.", "Article 6(1)(f): legitimate interest of the Controller in knowing which content is read. The balance is met because the data does not identify the person, is not combined with other sources and never leaves the Studio.", "14 months for individual events; after that only aggregate totals remain, which do not relate to identifiable people."],
            ["Keeping the site secure, preventing form abuse and rate-limiting submissions.", "Article 6(1)(f): legitimate interest in protecting the service and its users.", "12 months."],
            ["Third-party analytics and measurement (Google Analytics 4, Google Tag Manager, Meta Pixel), active only where configured and consented to.", "Article 6(1)(a): consent, and Article 122 of Legislative Decree 196/2003 for storing information on your device.", "As set out in the [Cookie Policy](/cookie-policy). Consent may be withdrawn at any time; withdrawal does not affect the lawfulness of processing before it."],
            ["Establishing, exercising or defending legal claims.", "Article 6(1)(f): legitimate interest in protecting the Controller's rights.", "For the duration of the dispute and until the applicable appeal or limitation periods expire."],
            ["Showing completed work in the Studio's portfolio, naming the client and the outcome achieved.", "Article 6(1)(f), subject to what the contract provides and to the right to object.", "Until you object or a different written agreement is reached."],
          ],
        } },
        { note: "The Studio does not carry out direct marketing: it runs no newsletter, sends no commercial communications to people who did not ask for them, and does not pass your data to anyone to use for their own purposes. Should a newsletter be introduced, it will be preceded by a separate, optional and revocable consent request, and this notice will be updated before the first message is sent." },
        { p: "Once the periods above expire, data is deleted or irreversibly anonymised, unless a legal provision requires longer retention or the data is needed for a dispute that has already arisen." },
      ],
    },
    {
      id: "conferimento",
      title: "Whether providing data is mandatory",
      blocks: [
        { p: "Providing the data marked as required in the forms — name, email address and the message itself — is necessary in order to receive a reply: without it the enquiry cannot be dealt with, which is why the form will not submit. Every other field is optional and only helps make the reply more relevant." },
        { p: "For the performance of the contract and for tax compliance, providing invoicing data is required by law: refusing makes it impossible to issue the mandatory documents and, as a result, to perform the service." },
        { p: "Providing data to third-party tools is always optional: refusing consent in no way limits access to the site or the quality of your visit." },
      ],
    },
    {
      id: "cookie",
      title: "Cookies and tracking tools",
      blocks: [
        { p: "This site sets no first-party profiling cookies. It uses one technical cookie to remember the language you chose, and some browser storage (localStorage and sessionStorage) to keep your consent choice, the temporary session identifier and — in the client area — the authentication token." },
        { p: "Third-party tools that profile are loaded only if they have been configured and you have given consent: if you decline, the scripts are not requested at all, not downloaded and not executed." },
        { p: "The full list, with purposes, durations and instructions for withdrawing consent, is in the [Cookie Policy](/cookie-policy), which forms an integral part of this notice." },
      ],
    },
    {
      id: "destinatari",
      title: "Recipients and processors",
      blocks: [
        { p: "Data is not disseminated, sold, or handed to third parties for their own purposes. It may be accessed by the providers that make the service technically possible, appointed as processors under Article 28 and bound by written instructions:" },
        { table: {
          head: ["Provider", "Role", "What it processes"],
          rows: [
            ["Vercel Inc. (United States)", "Processor", "Hosting of the site and of the serverless functions, content delivery network, technical request logs."],
            ["Supabase Inc. (United States)", "Processor", "Database, account authentication and storage of files uploaded to the client area."],
            ["Telegram FZ-LLC (United Arab Emirates)", "Processor", "Immediate notification to the Controller that an enquiry or a portal event has arrived: it contains name, email address and a summary of the message."],
            ["Google Ireland Ltd. (Ireland)", "Processor", "Google Analytics 4 and Google Tag Manager, only where enabled and consented to; page performance measurement through PageSpeed Insights, called from the server and not from your browser."],
            ["Meta Platforms Ireland Ltd. (Ireland)", "Joint controller for collection and transmission, independent controller for subsequent processing", "Meta Pixel, only where enabled and consented to."],
            ["Tax and accounting adviser", "Processor or independent controller depending on the professional role", "Data needed for invoicing and tax compliance."],
            ["Lawyers and insurers", "Independent controllers", "Data needed to protect a right, and only in the event of a dispute."],
            ["Judicial and administrative authorities", "Independent controllers", "Data requested under a legal obligation, an order of the authorities or a court decision."],
          ],
        } },
        { p: "An up-to-date list of the appointed processors can be requested at any time by writing to {email}." },
      ],
    },
    {
      id: "trasferimenti",
      title: "Transfers outside the European Economic Area",
      blocks: [
        { p: "Some of the providers listed above are established in the United States or may rely on infrastructure located outside the European Economic Area. In those cases the transfer takes place only under one of the safeguards set out in Chapter V of the Regulation:" },
        { ul: [
          "the European Commission adequacy decision of 10 July 2023 on the EU-U.S. Data Privacy Framework, for US providers that have joined it and are certified;",
          "the standard contractual clauses approved by the European Commission with implementing decision (EU) 2021/914, supplemented — where needed — by additional technical and organisational measures;",
          "residually, the derogations in Article 49 where the transfer is necessary for the performance of a contract concluded in your interest.",
        ] },
        { p: "You may obtain a copy of the safeguards in place, or details of where they have been made available, by writing to {email}." },
      ],
    },
    {
      id: "responsabile-clienti",
      title: "Data processed on behalf of clients",
      blocks: [
        { p: "When building, maintaining or supporting the systems it delivers to a client, the Studio may access personal data for which the client is the controller: users of a website, customers of an online shop, employees using an internal tool." },
        { p: "In those cases the Studio acts as a processor and, before receiving any access, signs the appointment required by Article 28 with the client, covering in particular:" },
        { ul: [
          "the obligation to process data only on documented instructions from the controller;",
          "the confidentiality undertaking of the persons authorised to process the data;",
          "the security measures adopted under Article 32;",
          "the conditions for engaging any sub-processors and the list of them;",
          "assistance to the controller in responding to data subjects and in handling any personal data breach;",
          "deletion or return of the data when the service ends.",
        ] },
        { p: "The Studio does not use data accessed in this capacity for its own purposes and does not keep it beyond the time needed to perform the requested service." },
      ],
    },
    {
      id: "sicurezza",
      title: "Security of the data",
      blocks: [
        { p: "The Controller applies the technical and organisational measures required by Article 32, taking into account the state of the art, costs and risks. Concretely, and verifiably:" },
        { ul: [
          "all communication with the site is encrypted over TLS;",
          "access to database records is governed by row level security: permission is enforced by the database rather than by the interface, so a wrong screen is not enough to read someone else's data;",
          "high-privilege credentials never reach the browser bundle and remain in server environment variables;",
          "visitors' IP addresses are reduced to an irreversible fingerprint before anything is written;",
          "files uploaded to the client area are isolated per client and served only to those entitled to read them;",
          "the data collected is limited to what the stated purposes require, following the data minimisation principle.",
        ] },
        { p: "In the event of a personal data breach the Controller notifies the Italian Data Protection Authority within 72 hours of becoming aware of it, where the conditions of Article 33 are met, and informs the data subjects without undue delay where the breach is likely to result in a high risk to their rights and freedoms, under Article 34." },
      ],
    },
    {
      id: "diritti",
      title: "Your rights",
      blocks: [
        { p: "At any time you may exercise the rights granted by Articles 15 to 22 of the Regulation against the Controller:" },
        { ul: [
          "access (Article 15): to know whether processing is taking place and obtain a copy of the data and of the information about the processing;",
          "rectification (Article 16): to correct inaccurate data or complete incomplete data;",
          "erasure (Article 17): to have data erased where it is no longer necessary, where you withdraw consent and no other legal basis applies, or where you object and no overriding legitimate grounds exist;",
          "restriction (Article 18): to have data stored but not otherwise processed, for example while the accuracy of a contested item is verified;",
          "portability (Article 20): to receive, in a structured, commonly used and machine-readable format, the data you provided that is processed on the basis of consent or of a contract, and to transmit it to another controller;",
          "objection (Article 21): to object at any time, on grounds relating to your particular situation, to processing based on legitimate interest;",
          "withdrawal of consent (Article 7(3)): to withdraw consent at any time, without affecting the lawfulness of processing carried out before the withdrawal;",
          "not to be subject to a decision based solely on automated processing (Article 22): as stated below, this site takes none.",
        ] },
        { p: "To exercise them, simply write to {email} stating which right you wish to rely on. The Controller replies without undue delay and in any case within one month of receiving the request; that period may be extended by two further months where necessary, taking into account the complexity and number of requests, and you will be told within the first month (Article 12(3)). Exercising your rights is free of charge; only where requests are manifestly unfounded or excessive, in particular because of their repetitive character, may the Controller charge a reasonable fee or refuse to act, giving reasons (Article 12(5)). Where necessary to confirm your identity, further information may be requested." },
        { p: "If you consider that the processing infringes the Regulation, you have the right to lodge a complaint with the supervisory authority of the Member State of your habitual residence, place of work or of the alleged infringement (Article 77). In Italy: Garante per la protezione dei dati personali, Piazza Venezia 11, 00187 Rome — garante@gpdp.it, protocollo@pec.gpdp.it, [www.garanteprivacy.it](https://www.garanteprivacy.it). Your right to an effective judicial remedy under Article 79 is unaffected." },
      ],
    },
    {
      id: "automatizzato",
      title: "No automated decision-making or profiling",
      blocks: [
        { p: "The Controller takes no automated decisions producing legal effects concerning you or similarly significantly affecting you, and carries out no profiling within the meaning of Article 4(4)." },
        { p: "The complexity and timing estimate shown at the end of the configurator is not an automated decision in that sense: it is the output of deterministic, disclosed rules, it changes no legal position and it does not replace the Controller's own assessment, who reviews every enquiry personally before making a proposal." },
      ],
    },
    {
      id: "minori",
      title: "Minors",
      blocks: [
        { p: "The services described on this site are addressed to companies, professionals and organisations and are not directed at minors. The Controller does not knowingly collect data from children under fourteen, the age set by Article 2-quinquies of Legislative Decree 196/2003 for consent to information society services in Italy." },
        { p: "If you believe a minor has provided data without the consent of the holder of parental responsibility, write to {email}: the data will be deleted without delay." },
      ],
    },
    {
      id: "link",
      title: "Links to third-party sites and services",
      blocks: [
        { p: "The site contains links to sites run by third parties — social profiles, code repositories, public measurement tools. The Controller does not control those sites and is not responsible for the processing that takes place there: once you open them, the privacy notices of their respective operators apply, and we encourage you to read them." },
      ],
    },
    {
      id: "modifiche",
      title: "Changes to this notice",
      blocks: [
        { p: "This notice may be updated to reflect changes to the site, to the services or to the law. The version in force is always the one published at this address, with the last-updated date shown at the top of the page." },
        { p: "Where changes materially affect purposes or legal bases, the Controller gives notice with a visible message on the site and, for registered users, with a message in the client area before the changes take effect. Previous versions can be requested at {email}." },
      ],
    },
  ],
}

export const PRIVACY_STR = { it, en } satisfies Bundle<LegalDoc>
