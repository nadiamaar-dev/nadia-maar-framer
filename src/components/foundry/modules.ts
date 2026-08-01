/* ══════════════════════════════════════════════════════════════════════════
   SOLUTION ARCHITECT — catalogo, indice di complessità, resoconto
   Flusso a 4 passi:
     1. Vettore principale  → il CORE dell'architettura
     2. Funzionalità base   → dipendono dal vettore scelto
     3. Moduli aggiuntivi   → trasversali, raggruppati per famiglia
     4. Blueprint           → resoconto tecnico + complessità + invio
   Nessun prezzo, nessun carrello: il configuratore produce solo testo.
══════════════════════════════════════════════════════════════════════════ */

export type VectorId = "ecommerce" | "webapp" | "ai" | "seo" | "corporate"
export type GroupId  = "base" | "control" | "agents" | "growth" | "brand"

export type Vector = {
  id: VectorId
  label: string
  focus: string
  /** etichetta del nodo CORE sul canvas */
  node: string
  /** stack mostrato sotto il nodo CORE */
  stack: string
  /** riga di apertura del resoconto */
  tech: string
  weight: number
}

export type Item = {
  id: string
  group: GroupId
  /** solo per il gruppo "base": a quale vettore appartiene */
  vector?: VectorId
  /** titolo in linguaggio di business */
  label: string
  /** spiegazione non tecnica */
  plain: string
  /** etichetta corta del nodo sul canvas */
  node: string
  /** riga di specifica professionale per il resoconto e il brief */
  tech: string
  weight: number
}

/* ── Passo 1 — vettori ────────────────────────────────────────────────── */
export const VECTORS: Vector[] = [
  {
    id: "ecommerce",
    label: "E-commerce ad Alta Conversione",
    focus: "Negozi online e scalabilità delle vendite",
    node: "E-commerce Engine",
    stack: "Next.js · Headless Commerce",
    tech: "Nucleo e-commerce headless: storefront Next.js disaccoppiato dal backend, progettato per cataloghi da decine di migliaia di prodotti e per reggere i picchi di traffico senza degrado.",
    weight: 4,
  },
  {
    id: "webapp",
    label: "Applicazioni Web & Automazione Custom",
    focus: "Gestionali, CRM/ERP e aree riservate",
    node: "Web App Core",
    stack: "Next.js · Supabase · API",
    tech: "Nucleo applicativo su misura: ecosistema web con logica di business propria, ruoli e permessi, costruito per eliminare l'errore umano dai processi interni.",
    weight: 4,
  },
  {
    id: "ai",
    label: "Integrazione AI & Sistemi Intelligenti",
    focus: "Agenti autonomi e modelli linguistici",
    node: "AI Core",
    stack: "LLM · RAG · Orchestrazione",
    tech: "Nucleo di intelligenza artificiale: modelli linguistici collegati ai dati aziendali, con agenti autonomi che gestiscono le attività ripetitive e restano operativi 24 ore su 24.",
    weight: 4,
  },
  {
    id: "seo",
    label: "SEO Strutturale & Performance",
    focus: "Traffico organico e velocità",
    node: "SEO Core",
    stack: "SSR · Schema · Web Vitals",
    tech: "Nucleo SEO tecnico: architettura del codice pensata per i motori di ricerca fin dal primo commit, con rendering lato server e Core Web Vitals in fascia verde.",
    weight: 3,
  },
  {
    id: "corporate",
    label: "Corporate & Lead Generation",
    focus: "Immagine di marca e acquisizione contatti",
    node: "Corporate Core",
    stack: "React · Next.js · Motion",
    tech: "Nucleo corporate: presenza digitale premium in React/Next.js con design sartoriale e micro-interazioni, calibrata sulla conversione di contatti qualificati.",
    weight: 3,
  },
]

/* ── Passo 2 — funzionalità base, per vettore ─────────────────────────── */
const BASE: Item[] = [
  /* E-commerce */
  {
    id: "b-sync", group: "base", vector: "ecommerce",
    label: "Magazzino e fornitori sempre allineati",
    plain: "Stock, prezzi e ordini si aggiornano da soli, in tempo reale.",
    node: "Sync ERP",
    tech: "Middleware di integrazione con fornitori ed ERP: sincronizzazione in tempo reale di giacenze, listini e ordini, testata su cataloghi da oltre 30.000 referenze.",
    weight: 3,
  },
  {
    id: "b-orders", group: "base", vector: "ecommerce",
    label: "Ordini e clienti in un unico pannello",
    plain: "Una sola schermata per gestire ordini, clienti e documenti.",
    node: "Order Hub",
    tech: "Pannello unificato di gestione ordini e anagrafiche clienti, con stati, documenti e flussi operativi in un'unica interfaccia.",
    weight: 2,
  },
  {
    id: "b-intl", group: "base", vector: "ecommerce",
    label: "Vendere in più lingue e valute",
    plain: "Un catalogo solo, mercati diversi, senza duplicare il lavoro.",
    node: "Multi-Market",
    tech: "Catalogo multilingua e multivaluta con instradamento geografico, listini per mercato e gestione centralizzata dei contenuti.",
    weight: 2,
  },

  /* Web App */
  {
    id: "b-crm", group: "base", vector: "webapp",
    label: "Un gestionale che segue le tue regole",
    plain: "CRM o ERP costruito sui processi reali dell'azienda, non il contrario.",
    node: "CRM Custom",
    tech: "Sistema CRM/ERP su misura modellato sui regolamenti interni: entità, stati e automazioni disegnati sul processo aziendale esistente.",
    weight: 3,
  },
  {
    id: "b-roles", group: "base", vector: "webapp",
    label: "Aree riservate per clienti e team",
    plain: "Ognuno entra e vede soltanto ciò che gli compete.",
    node: "Ruoli & Accessi",
    tech: "Aree riservate per clienti e collaboratori con autenticazione, gerarchia dei ruoli e permessi granulari applicati anche a livello di dati.",
    weight: 2,
  },
  {
    id: "b-docs", group: "base", vector: "webapp",
    label: "Pagamenti e documenti automatizzati",
    plain: "Incassi e documenti generati e archiviati senza passaggi manuali.",
    node: "Pagamenti & Doc",
    tech: "Integrazione dei gateway di pagamento e del ciclo documentale: generazione, firma e archiviazione automatica dei documenti collegati alle transazioni.",
    weight: 3,
  },

  /* AI */
  {
    id: "b-rag", group: "base", vector: "ai",
    label: "L'AI che conosce la tua azienda",
    plain: "Il modello risponde usando i tuoi documenti, non frasi generiche.",
    node: "Knowledge Base",
    tech: "Sistema RAG che collega la base di conoscenza aziendale al modello linguistico: risposte ancorate ai documenti interni e verificabili alla fonte.",
    weight: 3,
  },
  {
    id: "b-intake", group: "base", vector: "ai",
    label: "Richieste e documenti letti in automatico",
    plain: "Email, PDF e moduli in entrata vengono capiti e smistati da soli.",
    node: "Intake AI",
    tech: "Pipeline di estrazione e classificazione automatica di richieste e documenti in entrata, con instradamento ai flussi operativi corretti.",
    weight: 3,
  },

  /* SEO */
  {
    id: "b-arch", group: "base", vector: "seo",
    label: "Un sito costruito per posizionarsi",
    plain: "La struttura tecnica lavora per te su Google, non contro di te.",
    node: "SEO Architecture",
    tech: "Architettura tecnica orientata al posizionamento: struttura semantica delle URL, dati strutturati, gestione di canonical e indicizzazione.",
    weight: 2,
  },
  {
    id: "b-funnel", group: "base", vector: "seo",
    label: "Trasformare le visite in richieste",
    plain: "Percorsi pensati perché chi arriva lasci un contatto.",
    node: "Funnel CRO",
    tech: "Percorsi di conversione con landing dedicate, ottimizzazione CRO continua e tracciamento puntuale di ogni passaggio del funnel.",
    weight: 2,
  },

  /* Corporate */
  {
    id: "b-quiz", group: "base", vector: "corporate",
    label: "Configuratori e quiz interattivi",
    plain: "Strumenti che guidano il visitatore e qualificano la richiesta.",
    node: "Configuratore",
    tech: "Configuratori e quiz interattivi che guidano il visitatore nella definizione della propria esigenza e restituiscono una richiesta già qualificata.",
    weight: 2,
  },
  {
    id: "b-cms", group: "base", vector: "corporate",
    label: "Contenuti gestibili in autonomia",
    plain: "Aggiorni testi e pagine da solo, senza chiamare uno sviluppatore.",
    node: "Headless CMS",
    tech: "CMS headless con modelli di contenuto su misura: pubblicazione autonoma su sito, landing e canali collegati da un'unica fonte.",
    weight: 2,
  },
]

/* ── Passo 3 — moduli aggiuntivi, trasversali ─────────────────────────── */
const ADDONS: Item[] = [
  /* A · Dashboard & Controllo */
  {
    id: "a-dash", group: "control",
    label: "Cruscotto dei numeri in tempo reale",
    plain: "Vendite, traffico e margini in una schermata sola.",
    node: "Live Dashboard",
    tech: "Dashboard di analitica end-to-end: metriche commerciali e finanziarie aggregate da tutte le fonti e aggiornate in tempo reale.",
    weight: 3,
  },
  {
    id: "a-portal", group: "control",
    label: "Portale trasparente per i clienti",
    plain: "I tuoi clienti seguono da soli lo stato di ordini e progetti.",
    node: "Client Portal",
    tech: "Portale clienti con stato avanzamento di ordini e progetti, documenti condivisi e canale di comunicazione tracciato.",
    weight: 3,
  },

  /* B · Agenti AI & Automazioni */
  {
    id: "a-support", group: "agents",
    label: "Assistente AI per il primo contatto",
    plain: "Risponde alle domande frequenti e accompagna alla vendita, sempre.",
    node: "AI Support",
    tech: "Agente AI di primo livello: gestisce le richieste ricorrenti, qualifica il contatto e passa all'operatore solo i casi che lo richiedono.",
    weight: 3,
  },
  {
    id: "a-copilot", group: "agents",
    label: "Contenuti e schede scritti dall'AI",
    plain: "Descrizioni prodotto e metadati generati e ottimizzati in serie.",
    node: "Content Copilot",
    tech: "Copilot per contenuti e SEO: generazione massiva di descrizioni e metadati, con ottimizzazione continua delle schede prodotto.",
    weight: 2,
  },
  {
    id: "a-workflow", group: "agents",
    label: "I tuoi strumenti che si parlano",
    plain: "CRM, messaggistica, fogli di calcolo ed email collegati tra loro.",
    node: "Workflow Engine",
    tech: "Motore di automazione dei flussi: orchestrazione fra CRM, messaggistica (Telegram/WhatsApp), fogli di calcolo ed email con regole condizionali.",
    weight: 2,
  },

  /* C · SEO & Crescita */
  {
    id: "a-pseo", group: "growth",
    label: "Migliaia di pagine mirate, generate a sistema",
    plain: "Una pagina per ogni micro-ricerca dei tuoi clienti, senza scriverle a mano.",
    node: "Programmatic SEO",
    tech: "SEO programmatica: generazione automatica di landing su base dati per intercettare la coda lunga delle ricerche, con controllo editoriale sui modelli.",
    weight: 3,
  },
  {
    id: "a-geo", group: "growth",
    label: "Essere citati dalle AI, non solo da Google",
    plain: "Comparire nelle risposte di ChatGPT, Perplexity e Gemini.",
    node: "GEO / AI Search",
    tech: "Ottimizzazione per i motori di risposta AI (GEO): struttura dei contenuti, dati strutturati e segnali di autorevolezza leggibili da ChatGPT, Perplexity e Gemini.",
    weight: 2,
  },
  {
    id: "a-speed", group: "growth",
    label: "Velocità garantita in fascia verde",
    plain: "Pagine che caricano subito, su qualsiasi telefono.",
    node: "Speed Shield",
    tech: "Presidio prestazionale sui Core Web Vitals: budget di performance, monitoraggio continuo e obiettivo stabile in fascia verde su dispositivi reali.",
    weight: 2,
  },

  /* D · Brand & Design */
  {
    id: "a-ui", group: "brand",
    label: "Un'interfaccia che si riconosce",
    plain: "Un linguaggio visivo tuo, non un tema comprato.",
    node: "Custom UI System",
    tech: "Sistema visivo su misura (glassmorphism, tipografia e griglia proprietarie) documentato come design system riutilizzabile.",
    weight: 3,
  },
  {
    id: "a-motion", group: "brand",
    label: "Animazioni e micro-interazioni",
    plain: "Ogni gesto risponde: il sito sembra vivo, non statico.",
    node: "Motion Design",
    tech: "Motion design e micro-interazioni calibrate sul gesto dell'utente, con rispetto delle preferenze di movimento ridotto.",
    weight: 2,
  },
]

export const ITEMS: Item[] = [...BASE, ...ADDONS]

export const ADDON_GROUPS: { id: GroupId; label: string; sub: string }[] = [
  { id: "control", label: "Dashboard & Controllo", sub: "Vedere e governare i numeri" },
  { id: "agents",  label: "Agenti AI & Automazioni", sub: "Far lavorare il sistema da solo" },
  { id: "growth",  label: "SEO & Crescita", sub: "Portare e misurare la domanda" },
  { id: "brand",   label: "Brand & Design", sub: "Farsi riconoscere" },
]

/** Etichette dei livelli mostrati sul canvas */
export const CANVAS_BANDS: { id: GroupId; label: string; sub: string }[] = [
  { id: "base", label: "Funzionalità Base", sub: "Il cuore operativo" },
  ...ADDON_GROUPS,
]

export const GROUP_COLOR: Record<GroupId, string> = {
  base:    "#EDF1F7",
  control: "#7FD1FF",
  agents:  "#F53E56",
  growth:  "#10B981",
  brand:   "#C69BFF",
}

export const vectorById  = (id: VectorId | null) => VECTORS.find(v => v.id === id) ?? null
export const itemById    = (id: string) => ITEMS.find(i => i.id === id)
export const baseFor     = (v: VectorId | null) => (v ? BASE.filter(i => i.vector === v) : [])
export const addonsOf    = (g: GroupId) => ADDONS.filter(i => i.group === g)

/* ══════════════════════════════════════════════════════════════════════════
   INDICE DI COMPLESSITÀ — nessun prezzo: solo impegno tecnico e tempi
══════════════════════════════════════════════════════════════════════════ */
export type Complexity = { label: string; weeks: string; level: 1 | 2 | 3 | 4; note: string }

export function complexityOf(vector: VectorId | null, selected: string[]): Complexity | null {
  const v = vectorById(vector)
  if (!v) return null
  const w = v.weight + ITEMS.filter(i => selected.includes(i.id)).reduce((a, i) => a + i.weight, 0)

  if (w <= 7)  return { level: 1, label: "Contenuta", weeks: "2–3 settimane", note: "Impianto lineare, un solo flusso da presidiare." }
  if (w <= 12) return { level: 2, label: "Media",     weeks: "3–5 settimane", note: "Più componenti da coordinare, integrazioni contenute." }
  if (w <= 18) return { level: 3, label: "Alta",      weeks: "5–8 settimane", note: "Integrazioni multiple e logica di business articolata." }
  return          { level: 4, label: "Molto Alta",    weeks: "8–12 settimane", note: "Sistema esteso: va affrontato per fasi, con rilasci progressivi." }
}

/* ══════════════════════════════════════════════════════════════════════════
   RESOCONTO — dalla selezione a un riassunto professionale a scaffali
══════════════════════════════════════════════════════════════════════════ */
const NUM_IT = ["zero", "uno", "due", "tre", "quattro", "cinque"]

function joinIt(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? ""
  return parts.slice(0, -1).join(", ") + " e " + parts[parts.length - 1]
}

const GROUP_PHRASE: Record<Exclude<GroupId, "base">, string> = {
  control: "un livello di controllo che rende leggibili i numeri",
  agents:  "un livello di automazione che toglie lavoro ripetitivo alle persone",
  growth:  "un livello di crescita che porta domanda qualificata e ne misura il ritorno",
  brand:   "un livello di identità che rende l'esperienza riconoscibile",
}

export type Blueprint = {
  vector: Vector
  obiettivo: string
  architettura: string
  scaffali: { label: string; group: GroupId; righe: { node: string; tech: string }[] }[]
  complexity: Complexity
  passo: string
}

export function buildBlueprint(vector: VectorId | null, selected: string[]): Blueprint | null {
  const v = vectorById(vector)
  if (!v) return null
  const chosen = ITEMS.filter(i => selected.includes(i.id))

  const base = chosen.filter(i => i.group === "base")
  const obiettivo = base.length
    ? `${v.focus}. Il perimetro parte da ${joinIt(base.map(b => b.node.toLowerCase()))}.`
    : `${v.focus}.`

  const groups = ADDON_GROUPS.filter(g => chosen.some(i => i.group === g.id))
  const architettura = groups.length
    ? `Sul nucleo ${v.node} si innestano ${NUM_IT[groups.length] ?? groups.length} livelli aggiuntivi: ${joinIt(
        groups.map(g => GROUP_PHRASE[g.id as Exclude<GroupId, "base">]),
      )}. Progettati per funzionare come un unico sistema.`
    : `L'impianto resta concentrato sul nucleo ${v.node}, senza livelli aggiuntivi: perimetro stretto, rilascio rapido.`

  const scaffali = CANVAS_BANDS
    .map(b => ({
      label: b.label,
      group: b.id,
      righe: chosen.filter(i => i.group === b.id).map(i => ({ node: i.node, tech: i.tech })),
    }))
    .filter(s => s.righe.length > 0)

  return {
    vector: v,
    obiettivo,
    architettura,
    scaffali,
    complexity: complexityOf(vector, selected)!,
    passo:
      "Invia la configurazione: la analizzo personalmente e ti rispondo entro 24 ore con una valutazione tecnica e i passi successivi.",
  }
}
