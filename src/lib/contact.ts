/* ══════════════════════════════════════════════════════════════════════════
   CONTATTI — un solo posto per i recapiti dello studio.

   Prima erano copiati a mano in una decina di file, e le copie erano
   divergenti: la pagina /contatti aveva il numero vero, il widget flottante
   — montato su home, About, Projects, tutte le pagine servizio e Foundry —
   aveva un segnaposto (`+39 000 000 0000`). Ogni «Chiama» e ogni «WhatsApp»
   del sito portava quindi a un numero inesistente.

   Chiunque aggiunga un recapito da qualche parte: importarlo da qui.
══════════════════════════════════════════════════════════════════════════ */

export const CONTACT = {
  name: "Nadia Maar",
  email: "nadiamaar.dev@gmail.com",
  /** come si legge sullo schermo */
  telDisplay: "+39 3456 977 475",
  /** come si compone: solo cifre e prefisso, per href="tel:" */
  telHref: "+393456977475",
  /** wa.me vuole le sole cifre, senza + né spazi */
  whatsapp: "393456977475",
  telegram: "https://t.me/Nadiamaar_bot",
  location: "Remote · Europa",
  initials: "NM",
} as const

/** mailto: con oggetto opzionale già scritto. */
export function mailLink(subject?: string): string {
  return subject
    ? `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${CONTACT.email}`
}

/** tel: — su mobile compone, su desktop apre l'app predefinita. */
export function telLink(): string {
  return `tel:${CONTACT.telHref}`
}

/**
 * wa.me con il messaggio già impostato. Passare il contesto (il nome del
 * progetto, il numero di una fattura) evita il classico «Salve, avrei una
 * domanda» a cui bisogna rispondere chiedendo di cosa si tratta.
 */
export function waLink(text?: string): string {
  const msg = text?.trim() || `Ciao ${CONTACT.name}!`
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`
}

/* ── Recapiti altrui ──────────────────────────────────────────────────────
   Gli stessi tre canali, ma verso un numero che ha scritto qualcun altro:
   dallo studio verso il cliente. Un numero digitato a mano arriva in ogni
   forma possibile — «+39 345 697 74 75», «0039 345…», «345 6977475» — e
   finché resta così non è cliccabile.
   ──────────────────────────────────────────────────────────────────────── */

/** Riduce a `+<cifre>`. Ritorna null se non resta abbastanza per chiamare. */
export function telNormalize(raw?: string): string | null {
  if (!raw) return null
  let s = raw.replace(/[^\d+]/g, "")
  if (s.startsWith("00")) s = `+${s.slice(2)}`
  const digits = s.replace(/\D/g, "")
  if (digits.length < 6) return null
  return s.startsWith("+") ? `+${digits}` : digits
}

/**
 * wa.me pretende il prefisso internazionale: senza, apre la chat sbagliata o
 * nessuna. Se manca, lo deduciamo solo per il caso che qui è la norma — un
 * mobile italiano, 9-10 cifre che iniziano per 3. In ogni altro caso
 * ritorniamo null e il pulsante WhatsApp semplicemente non compare, che è
 * meglio di un pulsante che scrive a uno sconosciuto.
 */
export function waFor(raw?: string, text?: string): string | null {
  const n = telNormalize(raw)
  if (!n) return null
  let digits = n.replace(/\D/g, "")
  if (!n.startsWith("+")) {
    if (/^3\d{8,9}$/.test(digits)) digits = `39${digits}`
    else return null
  }
  const msg = text?.trim()
  return `https://wa.me/${digits}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`
}
