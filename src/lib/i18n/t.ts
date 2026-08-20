import { DEFAULT_LOCALE, type Locale } from "./locales"
import { useLocale } from "./LocaleContext"

/* ══════════════════════════════════════════════════════════════════════════
   I TESTI, TRADOTTI.

   Non c'è un registro globale di chiavi e non c'è un `t("home.hero.title")`
   che si scrive a mano sperando di non sbagliarlo. Ogni gruppo di testi è un
   oggetto normale con dentro le due lingue:

       const STR = {
         it: { titolo: "Ciao" },
         en: { titolo: "Hello" },
       } satisfies Bundle<...>

   e il componente lo apre con `useT(STR)`. Da lì in poi `t.titolo` è una
   proprietà vera: TypeScript sa che esiste, l'editor la completa, e una
   chiave scritta male è un errore di compilazione invece di una stringa
   mancante scoperta in produzione da un visitatore.

   Il vantaggio pratico: i testi stanno accanto al componente che li usa (o
   in un file gemello sotto strings/), non in un dizionario da diecimila
   righe dove nessuno sa più quali chiavi siano ancora vive. E il bundle
   inglese di una pagina che non si apre non viene nemmeno scaricato.

   `satisfies Bundle<typeof X.it>` sull'oggetto fa sì che alla versione
   inglese non possa mancare una chiave presente in italiano: è lì che
   nascono i buchi in una traduzione fatta a pezzi.
══════════════════════════════════════════════════════════════════════════ */

/** Un gruppo di testi: le stesse chiavi in tutte le lingue. */
export type Bundle<T> = Record<Locale, T>

/** I testi del gruppo, nella lingua che si sta leggendo. */
export function useT<T>(bundle: Bundle<T>): T {
  const { locale } = useLocale()
  return bundle[locale] ?? bundle[DEFAULT_LOCALE]
}

/**
 * Lo stesso, fuori da un componente: moduli di dati, funzioni serverless,
 * prerender. Non è un hook, quindi si può chiamare ovunque.
 */
export function pick<T>(bundle: Bundle<T>, locale: Locale): T {
  return bundle[locale] ?? bundle[DEFAULT_LOCALE]
}

/**
 * Il formato di data della lingua corrente. Serve perché `toLocaleDateString`
 * scritto con "it-IT" fisso mostrerebbe "18 ago 2026" anche a chi legge in
 * inglese, dove ci si aspetta "Aug 18, 2026".
 */
export const DATE_TAG: Record<Locale, string> = { it: "it-IT", en: "en-GB" }
