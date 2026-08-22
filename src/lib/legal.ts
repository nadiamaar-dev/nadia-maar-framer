/* ══════════════════════════════════════════════════════════════════════════
   IL BLOCCO LEGALE — un solo posto per l'identità dello Studio e per la
   forma dei documenti che la citano.

   PERCHÉ ESISTE. Privacy policy, cookie policy e termini ripetono le stesse
   quattro righe di identificazione (chi è il titolare, dove lo si scrive,
   partita IVA, sede). Ripeterle a mano in sei testi — tre documenti per due
   lingue — significa che il giorno in cui la partita IVA arriva bisogna
   ricordarsi di sei punti, e dimenticarne uno vuol dire pubblicare un
   documento che si contraddice con quello accanto. Qui il dato sta scritto
   una volta e i documenti lo interpolano con i segnaposto {vat}, {address}…

   DATI NON ANCORA ESISTENTI. Sede e partita IVA sono in corso di
   attribuzione: finché valgono "—" i documenti non stampano un campo vuoto
   né inventano un numero, ma mostrano la riga di attesa prevista dalle
   stringhe (§legalCommon → identity.pending). È la stessa regola già usata
   dal blocco amministrativo di /contatti e dal generatore dell'avviso di
   pagamento (src/lib/studio.ts): meglio nessun dato che un dato falso, e
   una partita IVA inventata su un'informativa privacy non è un dettaglio
   grafico — è una dichiarazione non veritiera resa a chi legge.

   QUANDO ARRIVANO I DATI VERI: si riempiono i campi di STUDIO in
   src/lib/studio.ts (ragione sociale, partita IVA, codice fiscale, sede) e,
   se c'è, la PEC qui sotto. Nient'altro da toccare: i tre documenti, il
   blocco di /contatti e l'avviso di pagamento si aggiornano da soli.
══════════════════════════════════════════════════════════════════════════ */

import { CONTACT } from "./contact"
import { STUDIO } from "./studio"

/** Il segnaposto usato in tutto il progetto per «non c'è ancora». */
const TBD = "—"

/** Un campo è utilizzabile solo se contiene qualcosa che non sia il segnaposto. */
export function isSet(v: string | null | undefined): boolean {
  return !!v && v.trim() !== "" && v.trim() !== TBD
}

/** Il dominio pubblico, senza barra finale: entra nei documenti e negli @id. */
export const SITE_ORIGIN = "https://www.nadiamaar.dev"

/**
 * L'identità che i documenti legali dichiarano.
 *
 * `name` ripiega sul nome della persona quando la ragione sociale non è
 * ancora stata registrata: un'informativa privacy senza un titolare
 * identificabile non assolve l'articolo 13, mentre un nome e un indirizzo
 * email a cui si risponde davvero sì.
 */
export const LEGAL_ENTITY = {
  name: isSet(STUDIO.ragioneSociale) ? STUDIO.ragioneSociale : CONTACT.name,
  vat: STUDIO.piva,
  taxCode: STUDIO.codiceFiscale,
  address: [STUDIO.indirizzo, STUDIO.cap, STUDIO.citta, STUDIO.provincia]
    .filter(isSet)
    .join(", "),
  email: CONTACT.email,
  phone: CONTACT.telDisplay,
  /** Posta elettronica certificata: esiste solo con la partita IVA. */
  pec: TBD,
  site: SITE_ORIGIN,
} as const

/** Vero quando sede e partita IVA sono state attribuite e si possono stampare. */
export const HAS_REGISTERED_DETAILS: boolean =
  isSet(LEGAL_ENTITY.vat) && isSet(LEGAL_ENTITY.address)

/**
 * La data dell'ultima revisione sostanziale dei documenti, in formato ISO.
 *
 * Si aggiorna a mano quando cambia il TESTO, non a ogni deploy: una data di
 * build direbbe soltanto «ho ricompilato», e su un documento legale la data
 * è ciò che permette a chi legge di sapere quale versione ha accettato.
 */
export const LEGAL_UPDATED = "2026-08-22"

/** Le rotte dei tre documenti: path canonici, senza prefisso di lingua. */
export const LEGAL_ROUTES = {
  privacy: "/privacy",
  cookie: "/cookie-policy",
  terms: "/termini",
} as const

/* ══════════════════════════════════════════════════════════════════════════
   LA FORMA DI UN DOCUMENTO LEGALE

   I testi non sono JSX: sono dati. Un'informativa scritta dentro i tag
   sarebbe impossibile da tradurre senza duplicare anche l'impaginazione, e
   ogni ritocco tipografico andrebbe fatto due volte — una per lingua, con
   il rischio che le due versioni divergano proprio nei punti che contano.

   Qui il documento è una struttura, il componente che la disegna è uno
   solo (src/components/LegalDoc.tsx) e le lingue sono due valori dello
   stesso oggetto: se una sezione manca in inglese, non compila.
══════════════════════════════════════════════════════════════════════════ */

/** Una tabella: intestazioni e righe, tutte della stessa lunghezza. */
export type LegalTable = { head: string[]; rows: string[][] }

/**
 * Un blocco di contenuto. Ogni variante ha una chiave sola, così le stringhe
 * si scrivono `{ p: "…" }` senza ripetere un campo `kind`.
 *
 * Nel testo si possono usare:
 *   {email} {phone} {entity} {vat} {address} {site} {updated}
 *     → sostituiti con i dati di LEGAL_ENTITY, mai scritti a mano;
 *   [testo](/privacy) o [testo](https://…)
 *     → un link. Quelli interni prendono il prefisso di lingua corrente,
 *       quelli esterni si aprono in una scheda nuova con rel="noopener".
 */
export type LegalBlock =
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  | { note: string }
  | { table: LegalTable }

export type LegalSection = {
  /** Ancora stabile: entra nell'indice e negli indirizzi condivisi (#dati). */
  id: string
  title: string
  blocks: LegalBlock[]
}

export type LegalDoc = {
  /** La riga sopra il titolo: «Informativa privacy». */
  kicker: string
  title: string
  /** Il sommario in cima, prima dell'indice. */
  lead: string
  sections: LegalSection[]
  /** Le due righe finali: rimandi agli altri documenti. */
  seeAlso?: { label: string; href: string }[]
}
