/* ══════════════════════════════════════════════════════════════════════════
   DATI AMMINISTRATIVI DELLO STUDIO

   Servono all'avviso di pagamento. Finché contengono "—" il pulsante che lo
   genera resta nascosto: meglio nessun documento che un documento con una
   partita IVA inventata sopra — stesso criterio già usato per il blocco
   legale della pagina /contatti.

   NOTA SUL REGIME, perché cambia il contenuto del documento:
   · forfettario → nessuna IVA in fattura, ma è obbligatoria la dicitura di
     legge, e sopra 77,47 € va applicata una marca da bollo da 2 €.
   · ordinario   → si applica l'IVA all'aliquota indicata.
══════════════════════════════════════════════════════════════════════════ */

export type RegimeFiscale = "forfettario" | "ordinario"

export const STUDIO = {
  ragioneSociale: "—",
  piva: "—",
  codiceFiscale: "—",
  indirizzo: "—",
  cap: "—",
  citta: "—",
  provincia: "—",
  iban: "—",
  intestatarioConto: "—",
  regime: "forfettario" as RegimeFiscale,
  /** usata solo in regime ordinario */
  aliquotaIva: 22,
} as const

/** Il documento si può comporre solo quando i dati obbligatori ci sono. */
export const STUDIO_READY: boolean = [
  STUDIO.ragioneSociale, STUDIO.piva, STUDIO.indirizzo,
  STUDIO.cap, STUDIO.citta, STUDIO.iban,
].every(v => v && v !== "—")

/** Soglia oltre la quale il forfettario richiede la marca da bollo da 2 €. */
export const BOLLO_SOGLIA = 77.47
export const BOLLO_IMPORTO = 2

export const DICITURA_FORFETTARIO =
  "Operazione effettuata ai sensi dell'art. 1, commi 54-89, della Legge n. 190/2014 " +
  "e successive modificazioni. Non soggetta a ritenuta d'acconto ai sensi " +
  "dell'art. 1, comma 67, della Legge n. 190/2014."

/** Quello che rende onesto generare questo PDF: non è una fattura. */
export const DISCLAIMER_PROFORMA =
  "Documento non fiscale. Non costituisce fattura ai sensi dell'art. 21 del DPR 633/72. " +
  "La fattura elettronica viene emessa e trasmessa tramite il Sistema di Interscambio (SdI)."
