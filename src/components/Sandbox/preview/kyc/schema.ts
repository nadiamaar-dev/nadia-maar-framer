import { z } from "zod"

/* ══════════════════════════════════════════════════════════════════════════
   ONBOARDING KYC — le regole dei dati.

   La validazione è il prodotto, in questa demo: severa dove i dati mentono
   davvero (una partita IVA si inventa in tre secondi, e il checksum la
   smaschera; le quote dei titolari effettivi devono chiudere al 100%) e
   indulgente mentre l'utente sta ancora scrivendo — gli errori compaiono al
   blur, mai al primo carattere.
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

/* ── Passo 1 · l'impresa ─────────────────────────────────────────────── */

export const PAESI = [
  { code: "IT", label: "Italia" },
  { code: "DE", label: "Germania" },
  { code: "FR", label: "Francia" },
  { code: "ES", label: "Spagna" },
  { code: "NL", label: "Paesi Bassi" },
  { code: "CH", label: "Svizzera" },
] as const

export const SETTORI = [
  "E-commerce & Retail",
  "Manifattura & Logistica",
  "Servizi finanziari",
  "SaaS & Tecnologia",
  "Sanità & Life sciences",
  "Import / Export",
  "Altro",
] as const

/** Fasce di fatturato: incidono sul livello di rischio calcolato al passo 4. */
export const FATTURATI = [
  { id: "s", label: "fino a 2 M€" },
  { id: "m", label: "2 – 10 M€" },
  { id: "l", label: "10 – 50 M€" },
  { id: "xl", label: "oltre 50 M€" },
] as const

export const datiSchema = z.object({
  ragioneSociale: z.string().trim()
    .min(2, "La ragione sociale è troppo corta.")
    .max(120, "Massimo 120 caratteri."),
  piva: z.string().trim()
    .regex(/^\d{11}$/, "La partita IVA è di 11 cifre.")
    .refine(pivaValida, "Il codice di controllo non torna: verifica le cifre."),
  email: z.string().trim()
    .email("Serve un'email valida.")
    .max(160, "Massimo 160 caratteri."),
  pec: z.string().trim()
    .email("La PEC non è un'email valida.")
    .max(160, "Massimo 160 caratteri.")
    .or(z.literal(""))
    .optional(),
  paese: z.string().min(1, "Scegli il paese."),
  settore: z.string().min(1, "Scegli il settore."),
  fatturato: z.string().min(1, "Indica la fascia di fatturato."),
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

/* ── Passo 2 · i titolari effettivi ──────────────────────────────────── */

/**
 * La parte che distingue un onboarding vero da un modulo di contatto: la
 * normativa antiriciclaggio chiede di sapere CHI possiede davvero l'impresa.
 * Le quote devono chiudere al 100% e ogni persona va dichiarata come
 * politicamente esposta o no.
 */
export const uboSchema = z.object({
  id: z.string(),
  nome: z.string().trim().min(2, "Nome e cognome, per esteso."),
  nascita: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida.")
    .refine(d => {
      const anni = (Date.now() - new Date(d).getTime()) / (365.25 * 24 * 3600 * 1000)
      return anni >= 18 && anni <= 110
    }, "Il titolare deve essere maggiorenne."),
  quota: z.number().min(0.01, "La quota dev'essere maggiore di zero.").max(100, "Massimo 100%."),
  pep: z.boolean(),
})

export type Ubo = z.infer<typeof uboSchema>

export function erroreUbo(u: Ubo, campo: "nome" | "nascita" | "quota"): string | null {
  const r = uboSchema.shape[campo].safeParse(u[campo])
  return r.success ? null : r.error.issues[0]?.message ?? "Valore non valido."
}

export function sommaQuote(ubi: Ubo[]): number {
  return Math.round(ubi.reduce((t, u) => t + (Number.isFinite(u.quota) ? u.quota : 0), 0) * 100) / 100
}

/** Il passo è completo solo se ogni riga è valida E le quote fanno 100. */
export function passoUboValido(ubi: Ubo[]): boolean {
  if (ubi.length === 0) return false
  if (!ubi.every(u => uboSchema.safeParse(u).success)) return false
  return sommaQuote(ubi) === 100
}
