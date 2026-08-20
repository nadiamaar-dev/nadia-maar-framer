import type {
  Activity, ClientProfile, Deal, PipelineStage, Priority, Rep, RepId, StageId,
} from "./types"

/* ══════════════════════════════════════════════════════════════════════════
   QUADRANTE CRM · dati dimostrativi

   Aziende, persone, partite IVA e importi sono inventati. Servono a far
   provare il prodotto, non a rappresentare clienti reali.

   L'«oggi» della demo è fisso: con una data di sistema le trattative
   invecchierebbero da sole e domani il racconto non tornerebbe più — un
   appuntamento «di martedì prossimo» diventerebbe passato senza che nessuno
   abbia toccato niente.
══════════════════════════════════════════════════════════════════════════ */

export const TODAY = "2026-08-10"
const T = (iso: string) => iso

/* ── Colonne ───────────────────────────────────────────────────────────── */
export const STAGES: PipelineStage[] = [
  { id: "nuovo",        title: "Nuovo lead",       order: 0, color: "var(--q-st-nuovo)",  probability: 0.10, hint: "Arrivato, non ancora qualificato." },
  { id: "contatto",     title: "Contatto stabilito", order: 1, color: "var(--q-st-contatto)", probability: 0.30, hint: "Abbiamo parlato: c'è un interlocutore." },
  { id: "negoziazione", title: "Negoziazione",     order: 2, color: "var(--q-st-negoz)",  probability: 0.60, hint: "Offerta sul tavolo, si tratta." },
  { id: "firmato",      title: "Contratto firmato", order: 3, color: "var(--q-st-vinto)", probability: 1.00, terminal: true, hint: "Chiusa. Entra nel fatturato." },
  { id: "perso",        title: "Perso",            order: 4, color: "var(--q-st-perso)",  probability: 0.00, terminal: true, hint: "Chiusa senza contratto. Il motivo resta." },
]

export const STAGE_BY_ID: Record<StageId, PipelineStage> =
  Object.fromEntries(STAGES.map(s => [s.id, s])) as Record<StageId, PipelineStage>

/* ── Commerciali ───────────────────────────────────────────────────────── */
export const REPS: Rep[] = [
  { id: "r-elena",  name: "Elena Ricci",     initials: "ER", role: "Responsabile vendite", tint: "#C6F24E" },
  { id: "r-marco",  name: "Marco Bianchi",   initials: "MB", role: "Account senior",       tint: "#7DD3FC" },
  { id: "r-sara",   name: "Sara Conti",      initials: "SC", role: "Account",              tint: "#F0ABFC" },
  { id: "r-davide", name: "Davide Fumagalli", initials: "DF", role: "Inside sales",        tint: "#FDBA74" },
]

export const ME: Rep["id"] = "r-elena"

export function repById(id: string): Rep {
  return REPS.find(r => r.id === id) ?? REPS[0]
}

/* ── Anagrafiche ───────────────────────────────────────────────────────── */
export const CLIENTS: ClientProfile[] = [
  {
    id: "c-idroservice", name: "Giulia Fontana", company: "Idroservice Bergamo S.r.l.",
    vat: "02845710165", sector: "Impiantistica idraulica", employees: 34,
    email: "g.fontana@idroservice.it", phone: "+39 035 21 44 08",
    address: "Via Broseta 118", city: "Bergamo", website: "idroservice.it",
    since: "2023-04-11", owner: "r-marco",
    notes: "Gruppo d'acquisto con altre tre imprese della zona: decide il consorzio, non la singola sede.",
  },
  {
    id: "c-marchiori", name: "Alberto Marchiori", company: "Marchiori Impianti S.p.A.",
    vat: "03119470288", sector: "Impianti industriali", employees: 210,
    email: "a.marchiori@marchiorimpianti.com", phone: "+39 049 87 33 12",
    address: "Viale dell'Industria 44", city: "Padova", website: "marchiorimpianti.com",
    since: "2021-09-02", owner: "r-elena",
    notes: "Ufficio acquisti strutturato. Ogni ordine sopra 50k passa dal CdA: i tempi sono lunghi ma prevedibili.",
  },
  {
    id: "c-tecnoidra", name: "Ufficio acquisti", company: "Tecnoidraulica Vicenza",
    vat: "02277880247", sector: "Distribuzione tecnica", employees: 62,
    email: "acquisti@tecnoidraulica.it", phone: "+39 0444 55 71 90",
    address: "Str. Padana Verso Verona 22", city: "Vicenza", website: "tecnoidraulica.it",
    since: "2024-01-19", owner: "r-marco",
  },
  {
    id: "c-lagorio", name: "Chiara Lagorio", company: "Lagorio Distribuzione",
    vat: "01998320103", sector: "Distribuzione", employees: 145,
    email: "c.lagorio@lagoriodist.it", phone: "+39 010 44 21 76",
    address: "Via San Vincenzo 8", city: "Genova", website: "lagoriodist.it",
    since: "2022-06-30", owner: "r-sara",
    notes: "Rinnovo annuale a settembre. Storicamente confronta due fornitori e sceglie sul livello di servizio.",
  },
  {
    id: "c-ferrandi", name: "Paolo Ferrandi", company: "Ferrandi Utensili S.r.l.",
    vat: "03442190173", sector: "Utensileria", employees: 28,
    email: "p.ferrandi@ferrandiutensili.it", phone: "+39 030 39 88 21",
    address: "Via Orzinuovi 61", city: "Brescia", website: "ferrandiutensili.it",
    since: "2025-02-14", owner: "r-sara",
  },
  {
    id: "c-bassano", name: "Luca Zanella", company: "Bassano Termotecnica",
    vat: "02660110244", sector: "Termotecnica", employees: 19,
    email: "l.zanella@bassanotermo.it", phone: "+39 0424 52 30 11",
    address: "Via Capitelvecchio 3", city: "Bassano del Grappa", website: "bassanotermo.it",
    since: "2025-11-05", owner: "r-davide",
  },
  {
    id: "c-nordimpianti", name: "Silvia Moretti", company: "Nord Impianti Trento",
    vat: "02441880222", sector: "Impiantistica civile", employees: 51,
    email: "s.moretti@nordimpianti.it", phone: "+39 0461 91 22 45",
    address: "Via del Brennero 210", city: "Trento", website: "nordimpianti.it",
    since: "2026-03-18", owner: "r-davide",
  },
  {
    id: "c-adriatica", name: "Ufficio tecnico", company: "Adriatica Servizi S.r.l.",
    vat: "01733420440", sector: "Facility management", employees: 88,
    email: "tecnico@adriaticaservizi.it", phone: "+39 071 28 41 55",
    address: "Via Fioretti 15", city: "Ancona", website: "adriaticaservizi.it",
    since: "2026-06-02", owner: "r-elena",
  },
]

/**
 * L'elenco diventa modificabile (si creano, si archiviano e si cancellano
 * anagrafiche), quindi la lista arriva da fuori. Il valore predefinito serve
 * solo alle costanti qui sotto, che si costruiscono al caricamento del
 * modulo quando stato React non ne esiste ancora.
 */
export function clientById(id: string, list: ClientProfile[] = CLIENTS): ClientProfile {
  return list.find(c => c.id === id) ?? list[0] ?? CLIENTS[0]
}

/** Come sopra, ma dice la verità quando non c'è: serve dopo una cancellazione. */
export const findClient = (id: string, list: ClientProfile[]) => list.find(c => c.id === id)

export const isArchived = (c: ClientProfile) => Boolean(c.archivedAt)

/** «1 trattativa», non «1 trattative». Un conteggio che sbaglia il plurale
    fa sembrare finta anche la parte che è vera. */
export const plural = (n: number, uno: string, molti: string) =>
  `${num(n)} ${n === 1 ? uno : molti}`

/* ══════════════════════════════════════════════════════════════════════════
   PARTITA IVA

   Undici cifre, l'ultima è di controllo (variante Luhn). Validarla costa
   sei righe e intercetta il 90 % degli errori di battitura prima che
   finiscano in una fattura — dove costano una nota di credito.

   Le partite IVA di questa demo sono inventate ma superano il controllo:
   un campo che rifiuta i suoi stessi dati di esempio è peggio di un campo
   che non valida niente.
══════════════════════════════════════════════════════════════════════════ */
export function vatCheckDigit(first10: string): number {
  let sum = 0
  for (let i = 0; i < 10; i++) {
    let n = Number(first10[i])
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9 }
    sum += n
  }
  return (10 - (sum % 10)) % 10
}

/** Spazi, punti e il prefisso IT si scrivono per abitudine: toglierli \u00e8
    compito nostro, non di chi digita. */
export const normalizeVat = (raw: string) => raw.replace(/[\s.]/g, "").replace(/^IT/i, "")

export function isValidVat(raw: string): boolean {
  const v = normalizeVat(raw)
  if (!/^\d{11}$/.test(v)) return false
  return vatCheckDigit(v.slice(0, 10)) === Number(v[10])
}

/** I settori già presenti in anagrafica, per suggerirli invece di farli riscrivere. */
export function sectorsOf(list: ClientProfile[]): string[] {
  return [...new Set(list.map(c => c.sector))].sort((a, b) => a.localeCompare(b, "it"))
}

/* ── nuova anagrafica ──────────────────────────────────────────────────── */

/** Quello che il modulo raccoglie: tutto testo, come esce da un <input>. */
export interface NewClientInput {
  company: string
  name: string
  vat: string
  email: string
  phone: string
  city: string
  address: string
  sector: string
  employees: string
  website: string
  owner: RepId
  notes: string
}

/** L'identificativo lo genera il server. Qui lo deriviamo dalla ragione
    sociale — leggibile negli URL — e ci aggiungiamo un progressivo solo
    quando serve davvero, cioè quando due aziende iniziano uguale. */
export function clientIdFrom(company: string, taken: ClientProfile[]): string {
  const stem = company
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(s\.?r\.?l\.?|s\.?p\.?a\.?|s\.?n\.?c\.?|s\.?a\.?s\.?)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-").filter(Boolean).slice(0, 2).join("-")
  const base = `c-${stem || "cliente"}`
  if (!taken.some(c => c.id === base)) return base
  let n = 2
  while (taken.some(c => c.id === `${base}-${n}`)) n++
  return `${base}-${n}`
}

/** Dal modulo all'entità. I campi facoltativi lasciati vuoti diventano un
    valore sensato, mai la stringa vuota: «—» in mezzo a un'anagrafica si
    legge come un dato mancante, "" si legge come un bug. */
export function makeClient(input: NewClientInput, taken: ClientProfile[], today = TODAY): ClientProfile {
  const company = input.company.trim()
  const city = input.city.trim()
  const host = company.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20)
  return {
    id: clientIdFrom(company, taken),
    company,
    name: input.name.trim() || "Da qualificare",
    vat: normalizeVat(input.vat),
    sector: input.sector.trim() || "Da classificare",
    employees: Math.max(0, Math.round(Number(input.employees) || 0)),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    address: input.address.trim() || "Indirizzo da raccogliere",
    city: city || "—",
    website: input.website.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "") || `${host || "azienda"}.it`,
    since: today,
    owner: input.owner,
    ...(input.notes.trim() ? { notes: input.notes.trim() } : {}),
  }
}

/* ── Trattative ────────────────────────────────────────────────────────── */
const d = (
  id: string, title: string, clientId: string, value: number, stage: StageId,
  assignedTo: string, priority: Priority, createdAt: string, expectedClose: string,
  source: string, tags: string[], extra: Partial<Deal> = {},
): Deal => {
  const c = clientById(clientId)
  return {
    id, title, clientId, clientName: c.name, company: c.company,
    value, stage, assignedTo, priority, createdAt,
    updatedAt: extra.updatedAt ?? createdAt,
    expectedClose, source, tags, ...extra,
  }
}

export const DEALS: Deal[] = [
  /* ── nuovo ── */
  d("OPP-2418", "Fornitura valvolame 2027", "c-nordimpianti", 48500, "nuovo", "r-davide", "media",
    T("2026-08-04"), T("2026-10-15"), "Modulo sito", ["valvolame", "annuale"], { updatedAt: T("2026-08-07") }),
  d("OPP-2421", "Rinnovo contratto manutenzione", "c-adriatica", 22400, "nuovo", "r-elena", "bassa",
    T("2026-08-06"), T("2026-09-30"), "Referenza", ["manutenzione"], { updatedAt: T("2026-08-06") }),
  d("OPP-2423", "Primo ordine strumentazione", "c-bassano", 9800, "nuovo", "r-davide", "bassa",
    T("2026-08-08"), T("2026-09-12"), "Fiera MCE", ["strumentazione"], { updatedAt: T("2026-08-08") }),

  /* ── contatto ── */
  d("OPP-2402", "Ampliamento linea pompe", "c-tecnoidra", 74000, "contatto", "r-marco", "alta",
    T("2026-07-18"), T("2026-09-25"), "Cliente esistente", ["pompe", "upsell"], { updatedAt: T("2026-08-05") }),
  d("OPP-2409", "Sostituzione parco contatori", "c-ferrandi", 31200, "contatto", "r-sara", "media",
    T("2026-07-24"), T("2026-10-02"), "Campagna e-mail", ["contatori"], { updatedAt: T("2026-08-03") }),
  d("OPP-2412", "Fornitura raccorderia cantiere Sud", "c-idroservice", 56800, "contatto", "r-marco", "media",
    T("2026-07-29"), T("2026-09-18"), "Cliente esistente", ["raccorderia", "cantiere"], { updatedAt: T("2026-08-06") }),

  /* ── negoziazione ── */
  d("OPP-2384", "Contratto quadro triennale", "c-marchiori", 186000, "negoziazione", "r-elena", "alta",
    T("2026-06-11"), T("2026-08-29"), "Gara privata", ["quadro", "triennale", "strategico"], { updatedAt: T("2026-08-09") }),
  d("OPP-2391", "Rinnovo annuale distribuzione", "c-lagorio", 96500, "negoziazione", "r-sara", "alta",
    T("2026-06-26"), T("2026-09-05"), "Cliente esistente", ["rinnovo"], { updatedAt: T("2026-08-08") }),
  d("OPP-2397", "Lotto pompe sommerse", "c-idroservice", 41300, "negoziazione", "r-marco", "media",
    T("2026-07-08"), T("2026-08-22"), "Cliente esistente", ["pompe"], { updatedAt: T("2026-08-07") }),

  /* ── firmato ── */
  d("OPP-2350", "Fornitura ricambi Q3", "c-tecnoidra", 28700, "firmato", "r-marco", "media",
    T("2026-05-14"), T("2026-07-10"), "Cliente esistente", ["ricambi"], { updatedAt: T("2026-07-09") }),
  d("OPP-2361", "Utensileria officina", "c-ferrandi", 15400, "firmato", "r-sara", "bassa",
    T("2026-05-28"), T("2026-07-21"), "Campagna e-mail", ["utensili"], { updatedAt: T("2026-07-18") }),
  d("OPP-2372", "Impianto trattamento acque", "c-marchiori", 124000, "firmato", "r-elena", "alta",
    T("2026-06-02"), T("2026-07-31"), "Gara privata", ["impianto", "strategico"], { updatedAt: T("2026-07-30") }),
  d("OPP-2377", "Estensione garanzia parco pompe", "c-lagorio", 18900, "firmato", "r-sara", "bassa",
    T("2026-06-08"), T("2026-08-01"), "Cliente esistente", ["servizio"], { updatedAt: T("2026-08-01") }),

  /* ── perso ── */
  d("OPP-2358", "Fornitura valvolame speciale", "c-bassano", 34500, "perso", "r-davide", "media",
    T("2026-05-20"), T("2026-07-15"), "Fiera MCE", ["valvolame"],
    { updatedAt: T("2026-07-14"), lostFrom: "negoziazione", lostReason: "Prezzo: concorrente sotto del 12% sul lotto completo." }),
  d("OPP-2369", "Ricambi linea storica", "c-idroservice", 12800, "perso", "r-marco", "bassa",
    T("2026-06-01"), T("2026-07-20"), "Modulo sito", ["ricambi"],
    { updatedAt: T("2026-07-19"), lostFrom: "negoziazione", lostReason: "Tempi: consegna richiesta in 10 giorni, la nostra era 4 settimane." }),
]

/* ── Cronologia ────────────────────────────────────────────────────────── */
export const ACTIVITIES: Activity[] = [
  /* Marchiori — la trattativa grossa, la storia più densa */
  { id: "a-901", clientId: "c-marchiori", dealId: "OPP-2384", kind: "riunione", title: "Revisione bozza contratto quadro",
    body: "Presenti l'ufficio acquisti e il direttore tecnico. Restano aperti due punti: penali sui ritardi e revisione prezzi annuale.",
    at: T("2026-08-12T10:00:00"), by: "r-elena", durationMin: 90 },
  { id: "a-899", clientId: "c-marchiori", dealId: "OPP-2384", kind: "chiamata", title: "Allineamento con l'ufficio acquisti",
    body: "Confermano che il CdA valuta il 26. Chiedono di anticipare il piano di consegna.",
    at: T("2026-08-09T15:20:00"), by: "r-elena", durationMin: 22 },
  { id: "a-895", clientId: "c-marchiori", dealId: "OPP-2384", kind: "documento", title: "Offerta rev. 3",
    at: T("2026-08-05T09:12:00"), by: "r-elena", fileName: "offerta-marchiori-rev3.pdf", fileSize: "412 kB" },
  { id: "a-890", clientId: "c-marchiori", dealId: "OPP-2384", kind: "stato", title: "Spostata in Negoziazione",
    at: T("2026-07-14T11:40:00"), by: "r-elena", from: "contatto", to: "negoziazione" },
  { id: "a-884", clientId: "c-marchiori", dealId: "OPP-2384", kind: "nota", title: "Concorrenza",
    body: "In gara c'è anche il fornitore storico. Il nostro vantaggio è la disponibilità a magazzino, non il prezzo.",
    at: T("2026-07-02T17:05:00"), by: "r-elena" },
  { id: "a-878", clientId: "c-marchiori", dealId: "OPP-2372", kind: "stato", title: "Contratto firmato",
    at: T("2026-07-30T16:00:00"), by: "r-elena", from: "negoziazione", to: "firmato" },
  { id: "a-870", clientId: "c-marchiori", kind: "email", title: "Invio condizioni 2027",
    body: "Mandate le condizioni aggiornate con lo sconto di fascia rivisto.",
    at: T("2026-06-18T08:44:00"), by: "r-elena" },

  /* Lagorio */
  { id: "a-861", clientId: "c-lagorio", dealId: "OPP-2391", kind: "riunione", title: "Presentazione livelli di servizio",
    body: "Interessati alla consegna in 48 ore sulle referenze A. Chiedono un impegno scritto.",
    at: T("2026-08-11T14:30:00"), by: "r-sara", durationMin: 60 },
  { id: "a-858", clientId: "c-lagorio", dealId: "OPP-2391", kind: "chiamata", title: "Follow-up rinnovo",
    at: T("2026-08-08T11:05:00"), by: "r-sara", durationMin: 14 },
  { id: "a-852", clientId: "c-lagorio", dealId: "OPP-2391", kind: "documento", title: "Proposta rinnovo 2027",
    at: T("2026-07-30T10:20:00"), by: "r-sara", fileName: "proposta-lagorio-2027.pdf", fileSize: "268 kB" },
  { id: "a-846", clientId: "c-lagorio", dealId: "OPP-2377", kind: "stato", title: "Contratto firmato",
    at: T("2026-08-01T09:30:00"), by: "r-sara", from: "negoziazione", to: "firmato" },

  /* Idroservice */
  { id: "a-840", clientId: "c-idroservice", dealId: "OPP-2397", kind: "chiamata", title: "Verifica quantità lotto",
    body: "Il fabbisogno è salito a 40 pezzi. Rifare l'offerta con lo scaglione superiore.",
    at: T("2026-08-07T16:10:00"), by: "r-marco", durationMin: 18 },
  { id: "a-836", clientId: "c-idroservice", dealId: "OPP-2412", kind: "nota", title: "Decide il consorzio",
    body: "La singola sede non firma: serve passare dal gruppo d'acquisto. Tempi più lunghi del previsto.",
    at: T("2026-08-06T09:00:00"), by: "r-marco" },
  { id: "a-830", clientId: "c-idroservice", dealId: "OPP-2369", kind: "stato", title: "Trattativa persa",
    at: T("2026-07-19T15:45:00"), by: "r-marco", from: "negoziazione", to: "perso" },
  { id: "a-824", clientId: "c-idroservice", kind: "riunione", title: "Visita in sede",
    body: "Giro del magazzino. Hanno spazio per stock in conto deposito: ipotesi da riprendere.",
    at: T("2026-06-24T10:00:00"), by: "r-marco", durationMin: 120 },

  /* Tecnoidraulica */
  { id: "a-818", clientId: "c-tecnoidra", dealId: "OPP-2402", kind: "email", title: "Richiesta scheda tecnica pompe",
    at: T("2026-08-05T12:30:00"), by: "r-marco" },
  { id: "a-812", clientId: "c-tecnoidra", dealId: "OPP-2350", kind: "stato", title: "Contratto firmato",
    at: T("2026-07-09T14:00:00"), by: "r-marco", from: "negoziazione", to: "firmato" },

  /* Ferrandi */
  { id: "a-806", clientId: "c-ferrandi", dealId: "OPP-2409", kind: "chiamata", title: "Qualificazione",
    body: "Sostituiscono 180 contatori entro l'anno. Budget confermato.",
    at: T("2026-08-03T09:40:00"), by: "r-sara", durationMin: 26 },

  /* Bassano */
  { id: "a-800", clientId: "c-bassano", dealId: "OPP-2358", kind: "nota", title: "Perché l'abbiamo persa",
    body: "Sul lotto completo il concorrente è sceso del 12%. Su singole referenze restiamo competitivi: riprovare a settembre.",
    at: T("2026-07-14T18:00:00"), by: "r-davide" },
  { id: "a-796", clientId: "c-bassano", dealId: "OPP-2423", kind: "email", title: "Invio listino introduttivo",
    at: T("2026-08-08T10:15:00"), by: "r-davide" },

  /* Nord Impianti / Adriatica */
  { id: "a-790", clientId: "c-nordimpianti", dealId: "OPP-2418", kind: "chiamata", title: "Primo contatto",
    body: "Arrivati dal modulo del sito. Cercano un secondo fornitore per non dipendere da uno solo.",
    at: T("2026-08-07T11:20:00"), by: "r-davide", durationMin: 12 },
  { id: "a-786", clientId: "c-adriatica", dealId: "OPP-2421", kind: "nota", title: "Segnalazione da Marchiori",
    body: "Ce li ha indicati l'ufficio tecnico di Marchiori. Citare la referenza al primo contatto.",
    at: T("2026-08-06T08:30:00"), by: "r-elena" },
]

/* ══════════════════════════════════════════════════════════════════════════
   FORMATTAZIONE ITALIANA
══════════════════════════════════════════════════════════════════════════ */

/* In italiano il CLDR raggruppa solo da cinque cifre: 9800 uscirebbe senza
   punto accanto a 48.500 che ce l'ha, e in colonna non si incolonnano. */
const GROUP = { useGrouping: "always" } as unknown as Intl.NumberFormatOptions

export function eur(n: number, decimals = 0): string {
  return "€ " + n.toLocaleString("it-IT", { ...GROUP, minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** Importi da cruscotto: 186.000 → «186 k», 1.240.000 → «1,24 M». */
export function eurShort(n: number): string {
  if (Math.abs(n) >= 1_000_000) return "€ " + (n / 1_000_000).toLocaleString("it-IT", { maximumFractionDigits: 2 }) + " M"
  if (Math.abs(n) >= 1_000) return "€ " + Math.round(n / 1000).toLocaleString("it-IT", GROUP) + " k"
  return eur(n)
}

export function num(n: number, decimals = 0): string {
  return n.toLocaleString("it-IT", { ...GROUP, minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function pct(n: number, decimals = 0): string {
  return n.toLocaleString("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + " %"
}

const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"]

/** "2026-08-09" → "9 ago 2026". Parsing manuale: `new Date("2026-08-09")` è
    UTC e in fuso italiano restituisce il giorno prima a mezzanotte. */
export function dateLabel(iso: string): string {
  const [y, m, dd] = iso.slice(0, 10).split("-").map(Number)
  return `${dd} ${MONTHS[m - 1]} ${y}`
}

export function timeLabel(iso: string): string {
  return iso.length > 10 ? iso.slice(11, 16) : ""
}

function dayNumber(iso: string): number {
  const [y, m, dd] = iso.slice(0, 10).split("-").map(Number)
  return Math.floor(Date.UTC(y, m - 1, dd) / 86_400_000)
}

/** Giorni fra due date ISO. Positivo se `b` viene dopo `a`. */
export function daysBetween(a: string, b: string): number {
  return dayNumber(b) - dayNumber(a)
}

/** "fra 3 giorni" / "8 giorni fa" / "oggi", rispetto al TODAY della demo. */
export function relativeDay(iso: string): string {
  const n = daysBetween(TODAY, iso)
  if (n === 0) return "oggi"
  if (n === 1) return "domani"
  if (n === -1) return "ieri"
  return n > 0 ? `fra ${n} giorni` : `${-n} giorni fa`
}

export const isFuture = (iso: string) => daysBetween(TODAY, iso) > 0

/* ══════════════════════════════════════════════════════════════════════════
   DERIVAZIONI — un solo posto in cui si fa la matematica
══════════════════════════════════════════════════════════════════════════ */

export const PRIORITY_ORDER: Record<Priority, number> = { alta: 0, media: 1, bassa: 2 }

export const PRIORITY_LABEL: Record<Priority, string> = { alta: "Alta", media: "Media", bassa: "Bassa" }

export function dealsInStage(deals: Deal[], stage: StageId): Deal[] {
  return deals
    .filter(x => x.stage === stage)
    .sort((a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      b.value - a.value)
}

export const sumValue = (deals: Deal[]) => deals.reduce((a, x) => a + x.value, 0)

/** Valore ponderato: la somma grezza della pipeline è un numero che nessun
    direttore commerciale crede. Pesare per la probabilità dello stato è la
    previsione minima onesta. */
export function weightedValue(deals: Deal[]): number {
  return deals.reduce((a, x) => a + x.value * STAGE_BY_ID[x.stage].probability, 0)
}

/** Aperte = né firmate né perse. */
export const openDeals = (deals: Deal[]) => deals.filter(x => !STAGE_BY_ID[x.stage].terminal)

/** In ritardo: chiusura attesa passata e trattativa ancora aperta. */
export function isLate(deal: Deal): boolean {
  return !STAGE_BY_ID[deal.stage].terminal && daysBetween(TODAY, deal.expectedClose) < 0
}

/** Ferma da troppo: nessun movimento da oltre `days` giorni. Una pipeline
    piena di trattative immobili è una pipeline vuota che sembra piena. */
export function isStale(deal: Deal, days = 14): boolean {
  return !STAGE_BY_ID[deal.stage].terminal && daysBetween(deal.updatedAt, TODAY) > days
}

export function activitiesFor(clientId: string, all: Activity[] = ACTIVITIES): Activity[] {
  return all
    .filter(a => a.clientId === clientId)
    /* dal più recente: la cronologia si legge dall'alto e la cosa che serve
       è quasi sempre l'ultima successa, non la prima */
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
}

export function dealsForClient(clientId: string, deals: Deal[]): Deal[] {
  return deals.filter(x => x.clientId === clientId).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

/* ── Imbuto di conversione ─────────────────────────────────────────────── */
export type FunnelRow = {
  stage: PipelineStage
  count: number
  value: number
  /** quota delle trattative entrate che sono arrivate almeno qui */
  reachedPct: number
  /** conversione dallo stato precedente */
  stepPct: number
}

/**
 * L'imbuto conta quante trattative sono arrivate ALMENO a un certo stato,
 * non quante ci sono adesso: una firmata è passata anche da «contatto», e
 * ignorarlo farebbe sembrare che nessuno converta.
 *
 * «perso» non è uno scalino dell'imbuto — è l'uscita laterale, e infatti
 * viene escluso dal calcolo delle quote.
 */
export function funnel(deals: Deal[]): FunnelRow[] {
  const ladder = STAGES.filter(s => s.id !== "perso").sort((a, b) => a.order - b.order)
  const total = deals.length || 1

  const rows = ladder.map(stage => {
    const reached = deals.filter(x => {
      /* Una persa è comunque passata dagli scalini precedenti a quello in cui
         si è fermata: si conta fino a `lostFrom`. Usare il suo stato attuale
         («perso», ordine 4) la farebbe risultare arrivata anche a «firmato». */
      const reachedOrder = x.stage === "perso"
        ? STAGE_BY_ID[x.lostFrom ?? "nuovo"].order
        : STAGE_BY_ID[x.stage].order
      return reachedOrder >= stage.order
    })
    return {
      stage,
      count: reached.length,
      value: sumValue(reached),
      reachedPct: Math.round((reached.length / total) * 1000) / 10,
      stepPct: 0,
    }
  })

  for (let i = 0; i < rows.length; i++) {
    const prev = i === 0 ? rows[0].count : rows[i - 1].count
    rows[i].stepPct = prev ? Math.round((rows[i].count / prev) * 1000) / 10 : 0
  }
  return rows
}

/* ── Andamento mensile ─────────────────────────────────────────────────── */
export type MonthRow = { key: string; label: string; won: number; lost: number; count: number }

/**
 * Firmato contro perso, per mese di chiusura. I mesi senza movimento restano
 * nella serie a zero: toglierli comprimerebbe l'asse e farebbe sembrare
 * continuo un andamento che ha dei buchi.
 */
export function monthlySeries(deals: Deal[], months = 8): MonthRow[] {
  const [ty, tm] = TODAY.split("-").map(Number)
  const out: MonthRow[] = []

  for (let i = months - 1; i >= 0; i--) {
    const total = ty * 12 + (tm - 1) - i
    const y = Math.floor(total / 12)
    const m = total % 12
    const key = `${y}-${String(m + 1).padStart(2, "0")}`
    const closed = deals.filter(x => STAGE_BY_ID[x.stage].terminal && x.updatedAt.slice(0, 7) === key)
    out.push({
      key,
      label: MONTHS[m],
      won: sumValue(closed.filter(x => x.stage === "firmato")),
      lost: sumValue(closed.filter(x => x.stage === "perso")),
      count: closed.filter(x => x.stage === "firmato").length,
    })
  }
  return out
}

/* ── Riepilogo di testa ────────────────────────────────────────────────── */
export function headline(deals: Deal[]) {
  const open = openDeals(deals)
  const won = deals.filter(x => x.stage === "firmato")
  const lost = deals.filter(x => x.stage === "perso")
  const closed = won.length + lost.length
  return {
    openCount: open.length,
    openValue: sumValue(open),
    forecast: weightedValue(open),
    wonValue: sumValue(won),
    winRate: closed ? Math.round((won.length / closed) * 1000) / 10 : 0,
    lateCount: open.filter(isLate).length,
    staleCount: open.filter(x => isStale(x)).length,
    /* ticket medio sulle vinte: sulle aperte sarebbe una promessa, non un dato */
    avgTicket: won.length ? Math.round(sumValue(won) / won.length) : 0,
  }
}

/** Classifica dei commerciali per firmato. */
export function byRep(deals: Deal[]) {
  return REPS.map(rep => {
    const mine = deals.filter(x => x.assignedTo === rep.id)
    const won = mine.filter(x => x.stage === "firmato")
    const closed = mine.filter(x => STAGE_BY_ID[x.stage].terminal)
    return {
      rep,
      won: sumValue(won),
      open: sumValue(openDeals(mine)),
      count: mine.length,
      winRate: closed.length ? Math.round((won.length / closed.length) * 100) : 0,
    }
  }).sort((a, b) => b.won - a.won)
}
