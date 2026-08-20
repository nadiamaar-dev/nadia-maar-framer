/* ══════════════════════════════════════════════════════════════════════════
   QUADRANTE CRM — il modello dei dati

   Tre entità e una sola direzione di dipendenza:

     ClientProfile  ←—  Deal  ←—  Activity
     (l'anagrafica)     (la      (che cosa è
                        trattativa) successo, e quando)

   Un Deal non contiene il cliente: lo referenzia. Copiarne nome e azienda
   dentro la trattativa sembra comodo finché il cliente cambia ragione
   sociale e ti ritrovi due nomi diversi per la stessa azienda in due
   schermate. `clientName`/`company` sui Deal esistono solo come denormalizzazione
   di lettura — li scrive il server all'atto della risposta, non il client.

   Gli importi sono in EURO come numero decimale, non in centesimi: una
   trattativa non si somma migliaia di volte al secondo e la leggibilità dei
   dati di demo conta più del centesimo. In un impianto reale con fatturazione
   attiva la scelta si ribalta (interi in centesimi) — vedi il portale
   fornitori, dove infatti si fattura.
══════════════════════════════════════════════════════════════════════════ */

/* ── Pipeline ──────────────────────────────────────────────────────────── */

/** Gli stati sono un'unione chiusa, non `string`: uno stato scritto male
    diventa un errore di compilazione invece di una colonna vuota a runtime. */
export type StageId = "nuovo" | "contatto" | "negoziazione" | "firmato" | "perso"

export interface PipelineStage {
  id: StageId
  title: string
  /** posizione da sinistra; il board ordina su questo, non sull'ordine dell'array */
  order: number
  /** variabile CSS, non un esadecimale: il tema si cambia in un posto solo */
  color: string
  /** probabilità di chiusura, per il valore ponderato della previsione */
  probability: number
  /** stato finale: ci si entra, non se ne esce trascinando */
  terminal?: boolean
  hint: string
}

/* ── Persone ───────────────────────────────────────────────────────────── */

export type RepId = string

export interface Rep {
  id: RepId
  name: string
  initials: string
  role: string
  /** tinta dell'avatar: assegnata all'anagrafica, non calcolata dall'hash del
      nome — due commerciali con lo stesso hash avrebbero lo stesso colore */
  tint: string
}

/* ── Trattative ────────────────────────────────────────────────────────── */

export type Priority = "bassa" | "media" | "alta"

export interface Deal {
  id: string
  title: string
  clientId: string
  /** denormalizzati dal server per elencare senza una join per riga */
  clientName: string
  company: string
  /** valore della trattativa, IVA esclusa */
  value: number
  stage: StageId
  assignedTo: RepId
  priority: Priority
  /** ISO 8601. La demo ha un "oggi" fisso: vedi TODAY in data.ts */
  createdAt: string
  updatedAt: string
  /** chiusura attesa: alimenta la previsione e il segnale di ritardo */
  expectedClose: string
  source: string
  tags: string[]
  /** compilato solo quando stage === "perso": senza motivo, una sconfitta
      non insegna niente al trimestre dopo */
  lostReason?: string
  /**
   * Stato da cui è uscita quando è stata persa. Lo scrive il server alla
   * transizione, leggendolo dal `from` dell'Activity di tipo "stato".
   *
   * Senza questo campo l'imbuto non si può calcolare: «perso» ha l'ordine
   * più alto di tutti, quindi una trattativa persa risulterebbe passata da
   * ogni scalino — compreso «firmato» — e la conversione uscirebbe al 100 %.
   */
  lostFrom?: StageId
}

/* ── Anagrafica ────────────────────────────────────────────────────────── */

export interface ClientProfile {
  id: string
  name: string
  company: string
  /** partita IVA italiana, 11 cifre */
  vat: string
  sector: string
  employees: number
  email: string
  phone: string
  address: string
  city: string
  website: string
  /** cliente dal…: distingue un nome nuovo da uno che torna */
  since: string
  owner: RepId
  notes?: string
  /**
   * Data di archiviazione, ISO. Assente = attivo.
   *
   * È una data e non un booleano perché la domanda che arriva sempre non è
   * «è archiviato?» ma «da quando?». Archiviare non cancella niente: il
   * cliente esce dagli elenchi di lavoro, le sue trattative restano nei
   * conti storici e nell'imbuto — un fatturato che cambia perché qualcuno
   * ha fatto pulizia in anagrafica è un fatturato che nessuno crede piu.
   */
  archivedAt?: string
}

/* ── Cronologia ────────────────────────────────────────────────────────── */

export type ActivityKind = "chiamata" | "riunione" | "email" | "nota" | "documento" | "stato"

export interface Activity {
  id: string
  clientId: string
  /** presente se l'attività riguarda una trattativa specifica */
  dealId?: string
  kind: ActivityKind
  title: string
  body?: string
  /** ISO. Nel futuro = appuntamento non ancora avvenuto */
  at: string
  by: RepId
  durationMin?: number
  /** solo kind === "documento" */
  fileName?: string
  fileSize?: string
  /** solo kind === "stato": la traccia di uno spostamento sul board */
  from?: StageId
  to?: StageId
}

/* ══════════════════════════════════════════════════════════════════════════
   CONTRATTO REST

   Documentato qui e non in un README perché è la stessa cosa che i tipi qui
   sopra descrivono: se cambia un campo, si cambiano insieme.

   Convenzioni:
   · lo spostamento di una card è PATCH sul singolo campo, non PUT dell'intero
     oggetto — due commerciali che muovono due trattative diverse nello stesso
     momento non devono sovrascriversi a vicenda;
   · ogni PATCH che cambia `stage` genera lato server una Activity di tipo
     "stato": la cronologia non è compito del client, che potrebbe non
     chiamare mai;
   · le liste sono paginate a cursore (`?after=<id>&limit=`), mai a offset:
     con un board che si riordina di continuo, offset salta o ripete righe.
══════════════════════════════════════════════════════════════════════════ */

export interface ApiRoute {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  path: string
  purpose: string
  /** corpo o parametri significativi, in forma abbreviata */
  payload?: string
}

export const API: ApiRoute[] = [
  { method: "GET", path: "/api/pipeline/stages", purpose: "Colonne del board, con ordine e probabilità." },

  { method: "GET", path: "/api/deals", purpose: "Trattative del perimetro dell'utente.", payload: "?stage=&owner=&q=&after=&limit=50" },
  { method: "POST", path: "/api/deals", purpose: "Nuova trattativa.", payload: "{ title, clientId, value, stage, assignedTo, priority, expectedClose }" },
  { method: "GET", path: "/api/deals/:id", purpose: "Dettaglio di una trattativa." },
  {
    method: "PATCH", path: "/api/deals/:id", purpose: "Sposta una card, cambia priorità o responsabile.",
    payload: "{ stage?, priority?, assignedTo?, value?, lostReason? }",
  },
  { method: "DELETE", path: "/api/deals/:id", purpose: "Elimina (soft delete: resta nello storico)." },

  { method: "GET", path: "/api/clients", purpose: "Anagrafiche del perimetro.", payload: "?stato=attivi|archiviati|tutti&q=&after=&limit=50" },
  {
    method: "POST", path: "/api/clients", purpose: "Nuova anagrafica.",
    payload: "{ company, name, vat, email, phone, city, sector, employees, owner }",
  },
  { method: "GET", path: "/api/clients/:id", purpose: "Anagrafica completa." },
  { method: "PATCH", path: "/api/clients/:id", purpose: "Aggiorna contatti e requisiti." },
  {
    method: "POST", path: "/api/clients/:id/archive",
    purpose: "Archivia o ripristina. Reversibile: niente si perde.",
    payload: "{ archived: boolean }",
  },
  {
    method: "DELETE", path: "/api/clients/:id",
    purpose: "Cancella davvero, con le trattative e la cronologia collegate.",
    payload: "?cascade=true — senza, risponde 409 e l'elenco di cosa resterebbe orfano",
  },
  {
    method: "GET", path: "/api/clients/:id/activities",
    purpose: "Cronologia: chiamate, riunioni, note, file, cambi di stato.",
    payload: "?kind=&before=&limit=50",
  },
  { method: "POST", path: "/api/clients/:id/activities", purpose: "Registra una nota, una chiamata o un appuntamento.", payload: "{ kind, title, body?, at, durationMin? }" },

  { method: "GET", path: "/api/analytics/funnel", purpose: "Conteggi e valore per stato: alimenta l'imbuto.", payload: "?from=&to=&owner=" },
  { method: "GET", path: "/api/analytics/monthly", purpose: "Firmato contro perso, mese per mese.", payload: "?months=12" },
  { method: "POST", path: "/api/reports/pdf", purpose: "Genera il rapporto. Nella demo il PDF si compone nel browser." },
]
