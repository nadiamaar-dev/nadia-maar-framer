import { z } from "zod"

/* ══════════════════════════════════════════════════════════════════════════
   ONBOARDING KYC — le regole dei dati.

   La validazione è il prodotto, in questa demo: dev'essere severa dove i
   dati mentono davvero (una partita IVA si inventa facilmente, e il
   checksum la smaschera) e indulgente dove l'utente sta ancora scrivendo.
   Gli errori si mostrano al blur, mai al primo carattere.
══════════════════════════════════════════════════════════════════════════ */

/** Checksum ufficiale della partita IVA italiana (11 cifre, algoritmo di
 *  controllo tipo Luhn): le cifre in posizione pari (1-indexed) si
 *  raddoppiano e, se superano 9, si sottrae 9. Una regex accetterebbe
 *  `12345678901`; questo no. */
export function pivaValida(piva: string): boolean {
  if (!/^\d{11}$/.test(piva)) return false
  let somma = 0
  for (let i = 0; i < 11; i++) {
    let n = piva.charCodeAt(i) - 48
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9 }
    somma += n
  }
  return somma % 10 === 0
}

export const datiSchema = z.object({
  ragioneSociale: z
    .string()
    .trim()
    .min(2, "La ragione sociale è troppo corta.")
    .max(120, "Massimo 120 caratteri."),
  piva: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "La partita IVA è di 11 cifre.")
    .refine(pivaValida, "Il codice di controllo non torna: verifica le cifre."),
  email: z
    .string()
    .trim()
    .email("Serve un'email valida.")
    .max(160, "Massimo 160 caratteri."),
  pec: z
    .string()
    .trim()
    .email("La PEC non è un'email valida.")
    .max(160, "Massimo 160 caratteri.")
    .or(z.literal(""))
    .optional(),
  settore: z.string().min(1, "Scegli il settore."),
})

export type Dati = z.infer<typeof datiSchema>

export type CampoId = keyof Dati

/** Errore del singolo campo, o null: la UI valida campo per campo al blur e
 *  l'intero passo al tentativo di avanzare. */
export function erroreCampo(campo: CampoId, dati: Dati): string | null {
  const r = datiSchema.shape[campo].safeParse(dati[campo])
  return r.success ? null : r.error.issues[0]?.message ?? "Valore non valido."
}

export function passoDatiValido(dati: Dati): boolean {
  return datiSchema.safeParse(dati).success
}

export const SETTORI = [
  "E-commerce & Retail",
  "Manifattura & Logistica",
  "Servizi finanziari",
  "SaaS & Tecnologia",
  "Sanità & Life sciences",
  "Altro",
] as const
