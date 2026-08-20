/* ══════════════════════════════════════════════════════════════════════════
   IL PROCESSO — fonte unica
   Le stesse quattro fasi comparivano in tre punti con parole diverse: la
   pagina About, la roadmap in PDF e (mancante) la home. Un cliente che
   leggeva About e poi scaricava il PDF trovava due processi diversi.
   Da qui in avanti il testo vive solo in questo file.

   Voce: nominale e impersonale — funziona sia per lo studio sia in un
   documento consegnato al cliente, e non costringe a scegliere fra "io" e
   "noi" a metà frase.

   Campi:
     desc   versione estesa   → About, PDF
     short  una riga          → striscia compatta in home
══════════════════════════════════════════════════════════════════════════ */

export type Fase = {
  /** "01" … "04" */
  n: string
  title: string
  /** descrizione estesa */
  desc: string
  /** una riga sola, per la home */
  short: string
  /** durata compatta, es. "3–5 giorni" */
  dur: string
  /** numero grande sulla scheda About */
  metric: string
  metricLabel: string
}

/* Le stesse quattro fasi nelle due lingue. `PROCESSO` resta esportato con
   l'italiano perché il PDF della roadmap lo consuma fuori da React, dove non
   c'è una lingua corrente da cui partire; i componenti usano `processo(locale)`
   e ottengono la versione giusta. */
export const PROCESSO_EN: Fase[] = [
  {
    n: "01",
    title: "Scoping & Strategy",
    desc: "Mapping goals, processes, data and existing constraints. Defining scope, architecture and success criteria — before the first line of code.",
    short: "Goals, constraints and scope. Architecture is decided before code.",
    dur: "3–5 days",
    metric: "3–5",
    metricLabel: "days of analysis",
  },
  {
    n: "02",
    title: "Design & Architecture",
    desc: "Designing the experience and the data schema. Interface concept refined to the pixel, and the final stack chosen against the requirements that surfaced.",
    short: "Experience, data schema and the final stack.",
    dur: "1–2 weeks",
    metric: "1–2",
    metricLabel: "weeks of design",
  },
  {
    n: "03",
    title: "Development & Integrations",
    desc: "Building the selected modules and wiring the external systems. Clean, scalable code with verifiable releases at every step.",
    short: "Modules, integrations and verifiable releases at every step.",
    dur: "2–4 weeks",
    metric: "2–4",
    metricLabel: "weeks of development",
  },
  {
    n: "04",
    title: "Launch & Growth",
    desc: "Testing on real data, going into production, technical SEO and tracking. Continuous optimisation for conversion.",
    short: "Go-live, measurement and continuous optimisation.",
    dur: "Ongoing",
    metric: "24/7",
    metricLabel: "continuous growth",
  },
]

export const PROCESSO: Fase[] = [
  {
    n: "01",
    title: "Scoping & Strategia",
    desc: "Mappatura di obiettivi, processi, dati e vincoli esistenti. Definizione del perimetro, dell'architettura e dei criteri di successo — prima della prima riga di codice.",
    short: "Obiettivi, vincoli e perimetro. L'architettura si decide prima del codice.",
    dur: "3–5 giorni",
    metric: "3–5",
    metricLabel: "giorni di analisi",
  },
  {
    n: "02",
    title: "Design & Architettura",
    desc: "Progettazione dell'esperienza e dello schema dati. Concept di interfaccia rifinito fino al pixel e scelta definitiva dello stack sui requisiti emersi.",
    short: "Esperienza, schema dati e stack definitivo.",
    dur: "1–2 sett.",
    metric: "1–2",
    metricLabel: "settimane di design",
  },
  {
    n: "03",
    title: "Sviluppo & Integrazioni",
    desc: "Costruzione dei moduli selezionati e collegamento dei sistemi esterni. Codice pulito e scalabile, con rilasci verificabili a ogni passo.",
    short: "Moduli, integrazioni e rilasci verificabili a ogni passo.",
    dur: "2–4 sett.",
    metric: "2–4",
    metricLabel: "settimane di sviluppo",
  },
  {
    n: "04",
    title: "Lancio & Crescita",
    desc: "Test su dati reali, messa in produzione, SEO tecnica e tracciamento. Ottimizzazione continua sulla conversione.",
    short: "Go-live, misurazione e ottimizzazione continua.",
    dur: "Ongoing",
    metric: "24/7",
    metricLabel: "crescita continua",
  },
]

/** Le fasi nella lingua richiesta. */
export function processo(locale: "it" | "en"): Fase[] {
  return locale === "en" ? PROCESSO_EN : PROCESSO
}
