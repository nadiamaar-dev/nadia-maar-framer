/* ══════════════════════════════════════════════════════════════════════════
   IL CONTRATTO DELL'ADATTATORE

   Il nucleo non sa niente di nessun fornitore. Sa solo che qualcuno gli
   consegna pagine di righe grezze e sa trasformarle in `NormalizedItem`.
   Aggiungere un fornitore vuol dire, nell'ordine:

     1. una riga in `suppliers` con `field_map` compilato   ← quasi sempre basta
     2. un modulo che implementa questa interfaccia          ← solo per le API storte

   Tutto ciò che è specifico di un fornitore vive dietro questa interfaccia.
   Se per aggiungerne uno si tocca `sync.ts`, l'astrazione ha già fallito.
══════════════════════════════════════════════════════════════════════════ */

export type Transport = "rest_json" | "soap_xml" | "feed_xml" | "feed_csv" | "sftp_csv"

/** La riga come l'ha mandata il fornitore: nessuna promessa sulla forma. */
export type RawItem = Record<string, unknown>

/** La riga come la vuole il nucleo. Tutto ciò che sta qui è obbligatorio
    o esplicitamente opzionale: non esistono campi "a volte presenti". */
export type NormalizedItem = {
  supplierSku: string
  name: string
  /** Costo dichiarato dal fornitore, nella SUA valuta, IVA esclusa. */
  costGross: number
  currency: string
  stock: number
  ean?: string
  brand?: string
  categoryPath?: string[]
  leadTimeDays?: number
  moq?: number
  packSize?: number
  /** La riga originale: si conserva per poter rifare la mappatura senza
      richiamare l'API quando si scopre di aver letto il campo sbagliato. */
  raw: RawItem
}

export type SupplierRow = {
  id: string
  code: string
  name: string
  transport: Transport
  auth: string
  baseUrl: string | null
  catalogPath: string | null
  stockPath: string | null
  adapterKey: string | null
  fieldMap: FieldMap
  httpHeaders: Record<string, string>
  pageSize: number
  timeoutMs: number
  rateLimitRpm: number
  currency: string
  costDiscountPct: number
  leadTimeDays: number
}

/** Le credenziali decifrate. Non attraversano mai un log né una risposta HTTP. */
export type Secret = Record<string, string>

export type Logger = {
  debug(code: string, message: string, payload?: unknown): void
  info(code: string, message: string, payload?: unknown): void
  warn(code: string, message: string, payload?: unknown, supplierSku?: string): void
  error(code: string, message: string, payload?: unknown, supplierSku?: string): void
}

export type AdapterCtx = {
  supplier: SupplierRow
  secret: Secret
  log: Logger
  /** fetch con timeout, retry su 429/5xx e limitatore di frequenza per
      fornitore: nessun adattatore deve reimplementarli. */
  http(url: string, init?: RequestInit): Promise<Response>
  signal: AbortSignal
}

export interface SupplierAdapter {
  readonly key: string
  readonly transport: Transport

  /** "Prova connessione" del pannello: deve costare poco e non scrivere nulla. */
  probe(ctx: AdapterCtx): Promise<ProbeResult>

  /** Le righe a pagine. Un generatore, non un array: il catalogo di un
      grossista sta in memoria una pagina per volta, non tutto insieme. */
  pull(ctx: AdapterCtx): AsyncIterable<RawItem[]>

  /** Da riga grezza a riga normalizzata. `null` scarta la riga: il motivo
      finisce nel diario, non in un throw che ferma la corsa. */
  normalize(raw: RawItem, ctx: AdapterCtx): NormalizedItem | null
}

export type ProbeResult = {
  ok: boolean
  /** Quante righe dichiara il fornitore, se lo dice. */
  declared?: number
  /** Un campione già normalizzato: il pannello lo mostra per far vedere
      all'operatore che la mappatura legge davvero i campi giusti. */
  sample?: NormalizedItem[]
  latencyMs: number
  message: string
}

/* ── Mappatura dichiarativa ────────────────────────────────────────────────
   `path` accetta la notazione a punti con indice: "data.items.0.price.net".
   `transform` è una catena applicata in ordine. Sono deliberatamente poche:
   una mappatura che ha bisogno di più di così ha bisogno di un modulo. */
export type Transform =
  | "trim" | "upper" | "lower"
  | "number"            // "12.40"  → 12.4
  | "comma_decimal"     // "12,40"  → 12.4   (mezza Europa scrive così)
  | "int"
  | "bool"              // "S" | "Y" | "1" | "true" → true
  | `default:${string}`
  | `multiply:${string}`
  | `split:${string}`   // → string[], per il percorso di categoria
  | `strip:${string}`   // toglie un prefisso: "ART-" da "ART-4471"

export type FieldSpec = string | [path: string, ...transforms: Transform[]]

export type FieldMap = {
  /** Dove sta l'array di righe nella risposta. Vuoto = la radice è l'array. */
  items?: string
  /** Nodo XML che rappresenta una riga (solo transport XML). */
  itemNode?: string
  fields?: Partial<Record<keyof Omit<NormalizedItem, "raw">, FieldSpec>>
  /** Righe da scartare prima ancora di normalizzarle. */
  skipWhen?: { path: string; equals?: unknown; empty?: boolean }[]
}
