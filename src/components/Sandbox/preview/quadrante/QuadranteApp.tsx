import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { Activity, ClientProfile, Deal, StageId } from "./types"
import { API } from "./types"
import type { NewClientInput } from "./data"
import {
  ACTIVITIES, CLIENTS, DEALS, ME, REPS, STAGE_BY_ID, TODAY,
  clientById, dateLabel, dealsForClient, eur, eurShort, findClient, headline,
  isArchived, isLate, isStale, makeClient, num, openDeals, plural, relativeDay,
  repById, sumValue,
} from "./data"
import { AvatarOf, Empty, Ico, Metric } from "./parts"
import Board from "./Board"
import ClientPanel from "./ClientPanel"
import Analytics from "./Analytics"
import Workspace from "./Workspace"
import { ClientForm, ConfirmDialog } from "./ClientDialogs"
import { downloadSalesReport } from "./reportPdf"

/* ══════════════════════════════════════════════════════════════════════════
   L'APPLICAZIONE

   Ogni mutazione passa da un solo reducer: spostare una card, scrivere una
   nota, cambiare responsabile. È il motivo per cui «Ripristina» è una riga
   sola e non lascia stato orfano da nessuna parte.

   Lo spostamento di una trattativa non cambia solo `stage`: scrive anche
   `updatedAt` e deposita un'attività di tipo "stato" nella cronologia del
   cliente. Nel sistema vero quella riga la scrive il server (vedi API in
   types.ts) proprio perché il client potrebbe non farlo mai — qui la
   scriviamo noi per la stessa ragione: senza, la scheda cliente mentirebbe.
══════════════════════════════════════════════════════════════════════════ */

export type Capability =
  | "sposta" | "cliente" | "nota" | "analisi" | "pdf" | "cerca" | "crea" | "archivia"

export type ScreenId = "pipeline" | "clienti" | "analisi"

const SCREEN_LABEL: Record<ScreenId, string> = {
  pipeline: "Pipeline",
  clienti: "Clienti",
  analisi: "Analisi",
}

const SCREEN_SUB: Record<ScreenId, string> = {
  pipeline: "Trascina una trattativa per cambiarle stato.",
  clienti: "Anagrafiche, referenti e cronologia delle attività.",
  analisi: "Imbuto, andamento mensile e rapporto scaricabile.",
}

const SCREEN_ICON: Record<ScreenId, "board" | "people" | "chart"> = {
  pipeline: "board", clienti: "people", analisi: "chart",
}

/** Quello che una cancellazione porta via, tenuto da parte finché l'avviso
    resta a schermo: è ciò che rende «Annulla» una promessa e non un tasto. */
type Trash = { client: ClientProfile; deals: Deal[]; activities: Activity[] }

type Toast = {
  id: number
  text: string
  /** l'azione che disfa: un'Action vera, rigiocata dal reducer */
  undo?: Action
  undoLabel?: string
}

type State = {
  screen: ScreenId
  clients: ClientProfile[]
  deals: Deal[]
  activities: Activity[]
  /** il cliente aperto nella postazione «Clienti». Sta qui e non nel
      componente perché una cancellazione deve spostare la selezione nello
      stesso istante in cui toglie il cliente: in due stati separati esiste
      un fotogramma in cui la scheda punta a un'anagrafica che non c'è più. */
  focus: string
  /** filtro per commerciale: "" = tutti */
  owner: string
  query: string
  touched: Capability[]
  trash: Trash | null
  toast: Toast | null
}

const initial: State = {
  screen: "pipeline",
  clients: CLIENTS,
  deals: DEALS,
  activities: ACTIVITIES,
  focus: CLIENTS[1].id,
  owner: "",
  query: "",
  touched: [],
  trash: null,
  toast: null,
}

type Action =
  | { t: "screen"; v: ScreenId }
  | { t: "owner"; v: string }
  | { t: "query"; v: string }
  | { t: "focus"; id: string }
  | { t: "move"; id: string; to: StageId }
  | { t: "note"; clientId: string; text: string }
  | { t: "clientAdd"; input: NewClientInput }
  | { t: "clientArchive"; id: string }
  | { t: "clientRestore"; id: string }
  | { t: "clientDelete"; id: string }
  | { t: "clientUndelete" }
  | { t: "toastClose" }
  | { t: "touch"; c: Capability }
  | { t: "reset" }

function touch(s: State, c: Capability): Capability[] {
  return s.touched.includes(c) ? s.touched : [...s.touched, c]
}

let seq = 0
const nextId = (p: string) => `${p}-new-${++seq}`
const stamp = (hhmm: string) => `${TODAY}T${hhmm}:00`

/** Ogni avviso ha un identificativo nuovo: due archiviazioni di fila
    devono far ripartire il conto alla rovescia, non lasciare a schermo il
    primo avviso che sembra congelato. */
const toastOf = (text: string, undo?: Action, undoLabel = "Annulla"): Toast =>
  ({ id: ++seq, text, undo, undoLabel })

function reducer(s: State, a: Action): State {
  switch (a.t) {
    /* Guardare l'analisi è una delle promesse della scheda: si spunta
       arrivandoci, perché lì non c'è un'azione da compiere — il valore è
       proprio ciò che si vede. */
    case "screen":
      return { ...s, screen: a.v, touched: a.v === "analisi" ? touch(s, "analisi") : s.touched }
    case "owner": return { ...s, owner: a.v }
    case "query": return { ...s, query: a.v, touched: a.v ? touch(s, "cerca") : s.touched }
    case "focus": return { ...s, focus: a.id, touched: touch(s, "cliente") }

    case "move": {
      const deal = s.deals.find(d => d.id === a.id)
      if (!deal || deal.stage === a.to) return s
      const from = deal.stage

      const stamp = `${TODAY}T10:${String(30 + (seq % 29)).padStart(2, "0")}:00`
      const log: Activity = {
        id: nextId("a"), clientId: deal.clientId, dealId: deal.id,
        kind: "stato",
        title: a.to === "firmato" ? "Contratto firmato"
          : a.to === "perso" ? "Trattativa persa"
          : `Spostata in ${STAGE_BY_ID[a.to].title}`,
        at: stamp, by: ME, from, to: a.to,
      }

      return {
        ...s,
        deals: s.deals.map(d => d.id === a.id
          ? {
            ...d, stage: a.to, updatedAt: TODAY,
            /* uscendo da «perso» il motivo non ha più senso e va tolto,
               altrimenti resta appiccicato a una trattativa che è tornata viva */
            ...(a.to === "perso" ? { lostFrom: from } : { lostFrom: undefined, lostReason: undefined }),
          }
          : d),
        activities: [log, ...s.activities],
        touched: touch(s, "sposta"),
      }
    }

    case "note": {
      const note: Activity = {
        id: nextId("a"), clientId: a.clientId, kind: "nota",
        title: "Nota", body: a.text,
        at: stamp("11:00"), by: ME,
      }
      return { ...s, activities: [note, ...s.activities], touched: touch(s, "nota") }
    }

    /* ── il ciclo di vita di un'anagrafica ─────────────────────────────── */

    case "clientAdd": {
      const client = makeClient(a.input, s.clients)
      /* anche la nascita è un fatto della cronologia: senza questa riga la
         scheda di un cliente nuovo si apre vuota, e «vuoto» e «non ancora
         contattato» si assomigliano troppo per lasciarli indistinguibili */
      const log: Activity = {
        id: nextId("a"), clientId: client.id, kind: "nota",
        title: "Anagrafica creata",
        body: `${client.company} · P. IVA ${client.vat} · referente ${repById(client.owner).name}.`,
        at: stamp("09:00"), by: ME,
      }
      return {
        ...s,
        clients: [...s.clients, client],
        activities: [log, ...s.activities],
        focus: client.id,
        screen: "clienti",
        toast: toastOf(`${client.company} è in anagrafica.`),
        touched: touch(s, "crea"),
      }
    }

    case "clientArchive": {
      const c = findClient(a.id, s.clients)
      if (!c || c.archivedAt) return s
      const log: Activity = {
        id: nextId("a"), clientId: c.id, kind: "stato",
        title: "Cliente archiviato",
        body: "Fuori dagli elenchi di lavoro. Trattative e cronologia restano.",
        at: stamp("12:00"), by: ME,
      }
      return {
        ...s,
        clients: s.clients.map(x => (x.id === a.id ? { ...x, archivedAt: TODAY } : x)),
        activities: [log, ...s.activities],
        toast: toastOf(`${c.company} archiviato.`, { t: "clientRestore", id: a.id }),
        touched: touch(s, "archivia"),
      }
    }

    case "clientRestore": {
      const c = findClient(a.id, s.clients)
      if (!c || !c.archivedAt) return s
      const log: Activity = {
        id: nextId("a"), clientId: c.id, kind: "stato",
        title: "Cliente ripristinato", at: stamp("12:05"), by: ME,
      }
      return {
        ...s,
        clients: s.clients.map(x => {
          if (x.id !== a.id) return x
          /* il campo si toglie, non si mette a "": un archivedAt vuoto è
             ancora un archivedAt, e prima o poi qualcuno lo tratta come tale */
          const { archivedAt: _gone, ...rest } = x
          return rest
        }),
        activities: [log, ...s.activities],
        focus: a.id,
        toast: toastOf(`${c.company} è di nuovo attivo.`),
      }
    }

    case "clientDelete": {
      const c = findClient(a.id, s.clients)
      if (!c) return s
      const gone = s.deals.filter(d => d.clientId === a.id)
      const logs = s.activities.filter(x => x.clientId === a.id)
      const rest = s.clients.filter(x => x.id !== a.id)
      return {
        ...s,
        clients: rest,
        /* le trattative se ne vanno con lui: lasciarle orfane vuol dire un
           board con schede che rimandano a un'anagrafica inesistente */
        deals: s.deals.filter(d => d.clientId !== a.id),
        activities: s.activities.filter(x => x.clientId !== a.id),
        focus: s.focus === a.id ? (rest[0]?.id ?? "") : s.focus,
        trash: { client: c, deals: gone, activities: logs },
        toast: toastOf(
          `${c.company} eliminato${gone.length ? ` con ${plural(gone.length, "trattativa", "trattative")}` : ""}.`,
          { t: "clientUndelete" }, "Ripristina",
        ),
      }
    }

    case "clientUndelete": {
      if (!s.trash) return s
      const { client, deals, activities } = s.trash
      return {
        ...s,
        clients: [...s.clients, client],
        deals: [...s.deals, ...deals],
        activities: [...activities, ...s.activities],
        focus: client.id,
        trash: null,
        toast: toastOf(`${client.company} ripristinato.`),
      }
    }

    case "toastClose": return { ...s, toast: null }

    case "touch": return { ...s, touched: touch(s, a.c) }
    case "reset": return { ...initial }
  }
}

/** Le finestre modali: nessuna o una sola, mai due sovrapposte. */
type Modal =
  | null
  | { kind: "nuovo" }
  | { kind: "archivia"; id: string }
  | { kind: "elimina"; id: string }

export default function QuadranteApp({ onCapability, onExit }: {
  onCapability: (list: Capability[]) => void
  onExit: () => void
}) {
  const [s, d] = useReducer(reducer, initial)
  /* la scheda aperta dal board: separata da s.focus, che è il cliente della
     postazione «Clienti» — sono due contesti diversi e chiuderne uno non
     deve spostare l'altro */
  const [client, setClient] = useState<string | null>(null)
  const [deal, setDeal] = useState<string | null>(null)
  const [nav, setNav] = useState(false)
  const [panel, setPanel] = useState<null | "me" | "avvisi">(null)
  const [overlay, setOverlay] = useState<null | "cerca" | "guida">(null)
  const [modal, setModal] = useState<Modal>(null)
  const [exporting, setExporting] = useState(false)

  const ref = useRef({ modal, overlay, panel, nav, client, deal })
  ref.current = { modal, overlay, panel, nav, client, deal }

  useEffect(() => { onCapability(s.touched) }, [s.touched, onCapability])

  /* ── l'avviso effimero sparisce da solo ───────────────────────────────
     Sei secondi: il tempo di leggere una riga e decidere se disfare. Il
     temporizzatore riparte a ogni avviso nuovo perché la chiave dell'effetto
     è l'id, non il testo — due archiviazioni di seguito danno due conti
     alla rovescia, non uno solo che scade a metà del secondo messaggio. */
  const toastId = s.toast?.id ?? 0
  useEffect(() => {
    if (!toastId) return
    const t = window.setTimeout(() => d({ t: "toastClose" }), 6000)
    return () => window.clearTimeout(t)
  }, [toastId])

  /* ── perimetro visibile: filtro commerciale + ricerca ─────────────────── */
  const visible = useMemo(() => {
    const q = s.query.trim().toLowerCase()
    return s.deals.filter(x => {
      if (s.owner && x.assignedTo !== s.owner) return false
      if (!q) return true
      return (
        x.title.toLowerCase().includes(q) ||
        x.company.toLowerCase().includes(q) ||
        x.id.toLowerCase().includes(q) ||
        x.tags.some(t => t.includes(q))
      )
    })
  }, [s.deals, s.owner, s.query])

  const h = useMemo(() => headline(visible), [visible])

  /* Gli avvisi non sono un elenco finto: nascono dallo stato corrente. */
  const alerts = useMemo(() => {
    const out: { id: string; tone: "bad" | "warn"; title: string; body: string; dealId: string }[] = []
    for (const x of openDeals(visible)) {
      if (isLate(x)) out.push({
        id: `late-${x.id}`, tone: "bad",
        title: `${x.id} è in ritardo`,
        body: `${x.company} · chiusura attesa ${relativeDay(x.expectedClose)} · ${eur(x.value)}`,
        dealId: x.id,
      })
      else if (isStale(x)) out.push({
        id: `stale-${x.id}`, tone: "warn",
        title: `${x.id} è ferma`,
        body: `${x.company} · nessun movimento da ${Math.abs(Number(relativeDay(x.updatedAt).replace(/\D/g, "")) || 14)} giorni`,
        dealId: x.id,
      })
    }
    return out
  }, [visible])

  const openDealCard = useCallback((id: string) => {
    const dd = s.deals.find(x => x.id === id)
    if (!dd) return
    setDeal(id)
    setClient(dd.clientId)
    d({ t: "touch", c: "cliente" })
  }, [s.deals])

  /* ── archiviare ───────────────────────────────────────────────────────
     Con trattative aperte si chiede conferma, senza si fa e basta (c'è
     «Annulla» nell'avviso). La domanda non è un rituale: è l'unico caso in
     cui archiviare può essere davvero un errore, perché toglie dall'elenco
     un cliente su cui c'è ancora del denaro in ballo. */
  const askArchive = useCallback((id: string) => {
    const open = openDeals(dealsForClient(id, s.deals))
    if (open.length === 0) d({ t: "clientArchive", id })
    else setModal({ kind: "archivia", id })
  }, [s.deals])

  const exportPdf = useCallback(async () => {
    setExporting(true)
    try {
      await downloadSalesReport(visible)
      d({ t: "touch", c: "pdf" })
    } finally {
      setExporting(false)
    }
  }, [visible])

  /* ⌘K apre la ricerca; Escape chiude UN livello per volta. Senza questa
     gerarchia il tasto arriverebbe alla pagina che ospita la demo e
     chiuderebbe tutto da una scheda cliente aperta. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); e.stopPropagation()
        setOverlay(o => (o === "cerca" ? null : "cerca"))
        return
      }
      if (e.key !== "Escape") return
      const st = ref.current
      if (st.modal) { e.stopPropagation(); setModal(null); return }
      if (st.overlay) { e.stopPropagation(); setOverlay(null); return }
      if (st.panel) { e.stopPropagation(); setPanel(null); return }
      if (st.nav) { e.stopPropagation(); setNav(false); return }
      if (st.client) { e.stopPropagation(); setClient(null); setDeal(null); return }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [])

  const dealOpen = deal ? s.deals.find(x => x.id === deal) : undefined

  return (
    <div className="q-app">
      {/* ── colonna icone ───────────────────────────────────────────────── */}
      <nav className="q-rail" aria-label="Sezioni">
        <span className="q-mark">Q</span>
        {(Object.keys(SCREEN_LABEL) as ScreenId[]).map(id => (
          <button key={id} type="button" className="q-rail-btn"
            data-label={SCREEN_LABEL[id]}
            aria-current={s.screen === id ? "page" : undefined}
            aria-label={SCREEN_LABEL[id]}
            onClick={() => d({ t: "screen", v: id })}>
            <Ico n={SCREEN_ICON[id]} />
          </button>
        ))}
        <span className="q-rail-spacer" />
        <button type="button" className="q-rail-btn" data-label="Che cos'è questa demo"
          aria-label="Che cos'è questa demo" onClick={() => setOverlay("guida")}>
          <Ico n="help" />
        </button>
      </nav>

      <div className="q-main" style={{ position: "relative" }}>
        {/* ── barra superiore ───────────────────────────────────────────── */}
        <div className="q-topbar">
          <button type="button" className="q-tool q-menu-btn" aria-label="Sezioni"
            aria-expanded={nav} onClick={() => setNav(true)}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M3 5h12M3 9h12M3 13h12" />
            </svg>
          </button>

          <span className="q-topbar-title">
            <strong>{SCREEN_LABEL[s.screen]}</strong>
            <span>{SCREEN_SUB[s.screen]}</span>
          </span>

          <span style={{ flex: 1 }} />

          <button type="button" className="q-search" onClick={() => setOverlay("cerca")} aria-label="Cerca">
            <Ico n="search" size={15} />
            <span className="q-search-label">Cerca</span>
            <span className="q-kbd">⌘K</span>
          </button>

          <span style={{ position: "relative" }}>
            <button type="button" className="q-tool"
              aria-label={`Avvisi${alerts.length ? `, ${alerts.length}` : ""}`}
              aria-expanded={panel === "avvisi"}
              onClick={() => setPanel(p => (p === "avvisi" ? null : "avvisi"))}>
              <Ico n="bell" size={16} />
              {alerts.length > 0 && <span className="q-badge">{alerts.length}</span>}
            </button>
            <AnimatePresence>
              {panel === "avvisi" && (
                <Alerts alerts={alerts} onGo={id => { setPanel(null); openDealCard(id) }}
                  onClose={() => setPanel(null)} />
              )}
            </AnimatePresence>
          </span>

          <span style={{ position: "relative" }}>
            <button type="button" className="q-me" aria-label="Profilo"
              aria-expanded={panel === "me"}
              onClick={() => setPanel(p => (p === "me" ? null : "me"))}>
              <AvatarOf id={ME} size={34} />
              <span className="q-me-text" style={{ minWidth: 0, textAlign: "left" }}>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, lineHeight: 1.25 }}>
                  {repById(ME).name}
                </span>
                <span style={{ display: "block", fontSize: 10.5, lineHeight: 1.25, color: "var(--q-ink-faint)" }}>
                  {repById(ME).role}
                </span>
              </span>
              <svg className="q-me-caret" width="11" height="11" viewBox="0 0 12 12" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden
                style={{ color: "var(--q-ink-faint)", flexShrink: 0 }}>
                <path d="M3 4.5L6 7.5L9 4.5" />
              </svg>
            </button>
            <AnimatePresence>
              {panel === "me" && (
                <Me onReset={() => { d({ t: "reset" }); setPanel(null) }} onExit={onExit}
                  onClose={() => setPanel(null)} />
              )}
            </AnimatePresence>
          </span>
        </div>

        {/* ── area di lavoro ────────────────────────────────────────────── */}
        <div className="q-work">
          {s.screen !== "clienti" && (
          <div className="q-page-head">
            <div style={{ minWidth: 0 }}>
              {/* la postazione «Clienti» ha già il nome dell'azienda come
                  titolo: qui restano solo pipeline e analisi */}
              <h1 className="q-display">
                {s.screen === "pipeline" ? "Pipeline commerciale" : "Analisi"}
              </h1>
              <p className="q-label" style={{ marginTop: 5, color: "var(--q-ink-muted)" }}>
                {visible.length} trattative · {eurShort(sumValue(openDeals(visible)))} aperti · aggiornato al {dateLabel(TODAY)}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="q-label" style={{ whiteSpace: "nowrap", color: "var(--q-ink-muted)" }}>
                  Commerciale
                </span>
                <select className="q-select" style={{ width: 190 }}
                  value={s.owner} onChange={e => d({ t: "owner", v: e.target.value })}>
                  <option value="">Tutti</option>
                  {REPS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
              {s.screen !== "analisi" && (
                <button type="button" className="q-btn q-btn-lime q-btn-sm" onClick={exportPdf} disabled={exporting}>
                  <Ico n="download" size={14} />
                  {exporting ? "Genero…" : "Rapporto PDF"}
                </button>
              )}
            </div>
          </div>
          )}

          {/* Niente AnimatePresence qui, e non è una svista.
              Con mode="wait" questo sottoalbero disegnava l'ISTANTANEA del
              render precedente: dopo un «Ripristina» l'intestazione diceva
              15 trattative e il board sotto ne mostrava ancora 13, fino al
              render successivo. Non si vedeva quasi mai perché trascinare
              una scheda provoca due render (l'azione e il rilascio del
              trascinamento) e il secondo copriva il primo.
              La chiave basta da sola: cambiando schermata il blocco si
              rimonta e l'animazione d'ingresso riparte. L'uscita non la
              vedeva nessuno, il ritardo di un render sì. */}
          <motion.div
            key={s.screen}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
          >
              {s.screen === "pipeline" && (
                <>
                  <div className="q-grid q-grid-4" style={{ marginBottom: 14 }}>
                    <Metric label="Pipeline aperta" value={eurShort(h.openValue)} hint={`${h.openCount} trattative`} />
                    <Metric label="Previsione ponderata" value={eurShort(h.forecast)} variant="lime"
                      hint="Per probabilità di stato" />
                    <Metric label="In ritardo" value={num(h.lateCount)}
                      hint={h.lateCount ? "Chiusura attesa superata" : "Nessuna"} />
                    <Metric label="Ferme" value={num(h.staleCount)} hint="Da oltre 14 giorni" />
                  </div>
                  <Board
                    deals={visible}
                    onMove={(id, to) => d({ t: "move", id, to })}
                    onOpen={openDealCard}
                  />
                </>
              )}

              {s.screen === "clienti" && (
                s.clients.length === 0
                  ? (
                    <div className="q-card" style={{ textAlign: "center", padding: "48px 20px" }}>
                      <p className="q-h2">L'anagrafica è vuota.</p>
                      <p className="q-small" style={{ margin: "8px 0 18px", color: "var(--q-ink-muted)" }}>
                        Hai cancellato tutti i clienti. Si riparte da uno nuovo,
                        oppure si ripristinano i dati dal menu del profilo.
                      </p>
                      <button type="button" className="q-btn q-btn-lime" onClick={() => setModal({ kind: "nuovo" })}>
                        <Ico n="plus" size={15} />Nuovo cliente
                      </button>
                    </div>
                  )
                  : (
                    <Workspace
                      clients={s.clients}
                      deals={s.deals}
                      activities={s.activities}
                      selected={s.focus}
                      onSelect={id => d({ t: "focus", id })}
                      onAddNote={(clientId, text) => d({ t: "note", clientId, text })}
                      onNew={() => setModal({ kind: "nuovo" })}
                      onArchive={askArchive}
                      onRestore={id => d({ t: "clientRestore", id })}
                      onDelete={id => setModal({ kind: "elimina", id })}
                    />
                  )
              )}

              {s.screen === "analisi" && (
                <Analytics deals={visible} onExport={exportPdf} exporting={exporting} />
              )}
          </motion.div>
        </div>

        {/* ── barra inferiore del telefono ──────────────────────────────── */}
        <nav className="q-tabbar" aria-label="Sezioni">
          {(Object.keys(SCREEN_LABEL) as ScreenId[]).map(id => (
            <button key={id} type="button"
              aria-current={s.screen === id ? "page" : undefined}
              onClick={() => d({ t: "screen", v: id })}>
              <Ico n={SCREEN_ICON[id]} size={17} />
              <span>{SCREEN_LABEL[id]}</span>
            </button>
          ))}
          <button type="button" aria-label="Che cos'è questa demo" onClick={() => setOverlay("guida")}>
            <Ico n="help" size={17} />
            <span>Guida</span>
          </button>
        </nav>

        {/* ── foglio di navigazione (telefono) ──────────────────────────── */}
        <AnimatePresence>
          {nav && (
            <>
              <motion.div className="q-nav-scrim" onClick={() => setNav(false)}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }} />
              <motion.nav className="q-nav-sheet" aria-label="Tutte le sezioni"
                initial={{ x: -28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -28, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "2px 8px 14px" }}>
                  <span className="q-mark" style={{ marginBottom: 0 }}>Q</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>Quadrante</span>
                    <span style={{ display: "block", fontSize: 10.5, color: "var(--q-ink-faint)" }}>CRM vendite</span>
                  </span>
                  <button type="button" className="q-tool" style={{ marginLeft: "auto" }}
                    onClick={() => setNav(false)} aria-label="Chiudi">✕</button>
                </div>
                {(Object.keys(SCREEN_LABEL) as ScreenId[]).map(id => (
                  <button key={id} type="button" className="q-nav-link"
                    aria-current={s.screen === id ? "page" : undefined}
                    onClick={() => { d({ t: "screen", v: id }); setNav(false) }}>
                    <Ico n={SCREEN_ICON[id]} size={16} />{SCREEN_LABEL[id]}
                  </button>
                ))}
                <button type="button" className="q-nav-link"
                  onClick={() => { setOverlay("guida"); setNav(false) }}>
                  <Ico n="help" size={16} />Che cos'è questa demo
                </button>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        {/* ── scheda cliente ────────────────────────────────────────────── */}
        <AnimatePresence>
          {client && findClient(client, s.clients) && (
            <ClientPanel
              key={client}
              client={clientById(client, s.clients)}
              deals={s.deals}
              activities={s.activities}
              focusDealId={deal}
              onClose={() => { setClient(null); setDeal(null) }}
              onOpenDeal={openDealCard}
              onAddNote={(clientId, text) => d({ t: "note", clientId, text })}
            />
          )}
        </AnimatePresence>

        {/* ── ricerca e guida ───────────────────────────────────────────── */}
        <AnimatePresence>
          {overlay === "cerca" && (
            <Search
              clients={s.clients}
              deals={s.deals}
              onGo={id => { setOverlay(null); openDealCard(id) }}
              onClient={id => { setOverlay(null); setClient(id); setDeal(null) }}
              onClose={() => setOverlay(null)}
            />
          )}
          {overlay === "guida" && <Guide onClose={() => setOverlay(null)} />}
        </AnimatePresence>

        {/* ── creare, archiviare, eliminare ─────────────────────────────── */}
        <AnimatePresence>
          {modal?.kind === "nuovo" && (
            <ClientForm
              key="nuovo"
              existing={s.clients}
              onClose={() => setModal(null)}
              onSave={input => { d({ t: "clientAdd", input }); setModal(null) }}
            />
          )}
          {modal?.kind === "archivia" && <ArchiveAsk key="arch" id={modal.id} s={s} d={d} close={() => setModal(null)} />}
          {modal?.kind === "elimina" && <DeleteAsk key="del" id={modal.id} s={s} d={d} close={() => setModal(null)} />}
        </AnimatePresence>

        {/* ── avvisi effimeri ───────────────────────────────────────────── */}
        <div className="q-toasts" role="status" aria-live="polite">
          <AnimatePresence>
            {s.toast && (
              <motion.div key={s.toast.id} className="q-toast"
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                <span className="q-toast-text">{s.toast.text}</span>
                {s.toast.undo && (
                  <button type="button" className="q-toast-undo"
                    onClick={() => { const u = s.toast!.undo!; d(u) }}>
                    {s.toast.undoLabel}
                  </button>
                )}
                <button type="button" className="q-toast-x" aria-label="Chiudi l'avviso"
                  onClick={() => d({ t: "toastClose" })}>✕</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   LE DUE DOMANDE

   Entrambe elencano le conseguenze con i numeri veri presi dallo stato: una
   conferma che dice «questa azione è irreversibile» e nient'altro obbliga a
   ricordare a memoria che cosa c'era attaccato a quel cliente.
══════════════════════════════════════════════════════════════════════════ */
function ArchiveAsk({ id, s, d, close }: {
  id: string; s: State; d: React.Dispatch<Action>; close: () => void
}) {
  const c = clientById(id, s.clients)
  const open = openDeals(dealsForClient(id, s.deals))
  return (
    <ConfirmDialog
      title="Archiviare questo cliente?"
      icon="clock"
      lead={`${c.company} esce dagli elenchi di lavoro. Non si perde niente: si ripristina dallo stesso menu.`}
      points={[
        `${plural(open.length, "trattativa aperta resta", "trattative aperte restano")} nella pipeline, per ${eur(sumValue(open))}`,
        "La cronologia e i conti storici non cambiano",
        "Resta nel filtro «Archiviati», con la data di oggi",
      ]}
      footNote="Le trattative aperte si chiudono a mano, vinte o perse: deciderlo al posto tuo falserebbe la previsione."
      confirmLabel="Archivia"
      onConfirm={() => { d({ t: "clientArchive", id }); close() }}
      onClose={close}
    />
  )
}

function DeleteAsk({ id, s, d, close }: {
  id: string; s: State; d: React.Dispatch<Action>; close: () => void
}) {
  const c = clientById(id, s.clients)
  const mine = dealsForClient(id, s.deals)
  const open = openDeals(mine)
  const logs = s.activities.filter(x => x.clientId === id)

  const points = [
    `L'anagrafica di ${c.company}, cliente dal ${dateLabel(c.since)}`,
    mine.length
      ? `${plural(mine.length, "trattativa", "trattative")} per ${eur(sumValue(mine))}${
        open.length ? `, di cui ${plural(open.length, "ancora aperta", "ancora aperte")}` : ""}`
      : "Nessuna trattativa collegata",
    logs.length
      ? `${plural(logs.length, "voce di cronologia", "voci di cronologia")}: chiamate, riunioni, note, file`
      : "Nessuna attività registrata",
  ]

  return (
    <ConfirmDialog
      title="Eliminare definitivamente?"
      tone="bad"
      icon="exit"
      lead="Sparisce tutto, anche dai grafici e dal rapporto PDF. Se serve solo togliere il nome dagli elenchi, archiviare fa quello e si può disfare."
      points={points}
      footNote="Dopo l'eliminazione resta un «Ripristina» nell'avviso in basso, per qualche secondo."
      confirmLabel="Elimina tutto"
      onConfirm={() => { d({ t: "clientDelete", id }); close() }}
      onClose={close}
    />
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   AVVISI · PROFILO · RICERCA · GUIDA
══════════════════════════════════════════════════════════════════════════ */
const pop = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.99 },
  transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

/** Il velo che raccoglie il clic di chiusura invece di lasciarlo passare
    a quello che sta sotto. */
const Shade = ({ onClose }: { onClose: () => void }) =>
  <div className="q-shade" onClick={onClose} aria-hidden />

function useDismiss(close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [close])
  return ref
}

function Alerts({ alerts, onGo, onClose }: {
  alerts: { id: string; tone: "bad" | "warn"; title: string; body: string; dealId: string }[]
  onGo: (dealId: string) => void
  onClose: () => void
}) {
  const ref = useDismiss(onClose)
  return (
    <>
    <Shade onClose={onClose} />
    <motion.div ref={ref} className="q-pop" style={{ width: 320 }} {...pop} role="dialog" aria-label="Avvisi">
      <div className="q-pop-head"><span className="q-h3">Avvisi</span></div>
      <div className="q-pop-body">
        {alerts.length === 0 && <Empty>Niente in sospeso.</Empty>}
        {alerts.map(a => (
          <button key={a.id} type="button" className="q-pop-item" onClick={() => onGo(a.dealId)}>
            <span style={{
              width: 7, height: 7, borderRadius: 999, flexShrink: 0, marginTop: 5,
              background: a.tone === "bad" ? "var(--q-bad)" : "var(--q-warn)",
            }} />
            <span style={{ minWidth: 0 }}>
              <span className="q-small" style={{ display: "block", fontWeight: 500 }}>{a.title}</span>
              <span className="q-micro" style={{ display: "block", marginTop: 2 }}>{a.body}</span>
            </span>
          </button>
        ))}
      </div>
    </motion.div>
    </>
  )
}

function Me({ onReset, onExit, onClose }: { onReset: () => void; onExit: () => void; onClose: () => void }) {
  const ref = useDismiss(onClose)
  const me = repById(ME)
  return (
    <>
    <Shade onClose={onClose} />
    <motion.div ref={ref} className="q-pop" style={{ width: 260 }} {...pop} role="menu" aria-label="Profilo">
      <div className="q-pop-head" style={{ display: "flex", gap: 11, alignItems: "center" }}>
        <AvatarOf id={ME} size={38} />
        <span style={{ minWidth: 0 }}>
          <span className="q-h3" style={{ display: "block" }}>{me.name}</span>
          <span className="q-micro" style={{ display: "block" }}>
            {me.name.toLowerCase().replace(" ", ".")}@quadrante.it
          </span>
        </span>
      </div>
      <div className="q-pop-body">
        <button type="button" className="q-pop-item" role="menuitem" onClick={onReset}>
          <Ico n="clock" size={15} />Ripristina i dati della demo
        </button>
        <button type="button" className="q-pop-item" role="menuitem" onClick={onExit}
          style={{ color: "var(--q-bad)" }}>
          <Ico n="exit" size={15} />Chiudi la demo
        </button>
      </div>
    </motion.div>
    </>
  )
}

function Search({ clients, deals, onGo, onClient, onClose }: {
  clients: ClientProfile[]
  deals: Deal[]
  onGo: (id: string) => void
  onClient: (id: string) => void
  onClose: () => void
}) {
  const [q, setQ] = useState("")
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { input.current?.focus() }, [])

  const hits = useMemo(() => {
    const t = q.trim().toLowerCase()
    const out: { group: string; label: string; meta: string; go: () => void }[] = []
    for (const x of deals) {
      if (t && !(`${x.id} ${x.title} ${x.company}`.toLowerCase().includes(t))) continue
      out.push({
        group: "Trattative", label: x.title,
        meta: `${x.company} · ${eur(x.value)} · ${STAGE_BY_ID[x.stage].title}`,
        go: () => onGo(x.id),
      })
    }
    for (const c of clients) {
      if (t && !(`${c.company} ${c.name} ${c.city}`.toLowerCase().includes(t))) continue
      out.push({
        group: "Clienti", label: c.company,
        meta: `${c.name} · ${c.city}${isArchived(c) ? " · archiviato" : ""}`,
        go: () => onClient(c.id),
      })
    }
    return out.slice(0, 24)
  }, [q, clients, deals, onGo, onClient])

  useEffect(() => { setSel(0) }, [q])

  const groups = useMemo(() => {
    const m = new Map<string, typeof hits>()
    hits.forEach(hh => { if (!m.has(hh.group)) m.set(hh.group, []); m.get(hh.group)!.push(hh) })
    return [...m.entries()]
  }, [hits])

  let flat = -1
  return (
    <div className="q-palette-scrim" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="q-palette" role="dialog" aria-label="Ricerca"
        initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.16 }}>
        <input ref={input} className="q-palette-input" value={q} placeholder="Cerca trattative e clienti…"
          aria-label="Cerca" onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel(v => Math.min(hits.length - 1, v + 1)) }
            else if (e.key === "ArrowUp") { e.preventDefault(); setSel(v => Math.max(0, v - 1)) }
            else if (e.key === "Enter") { e.preventDefault(); hits[sel]?.go() }
            else if (e.key === "Escape") { e.preventDefault(); onClose() }
          }} />
        <div className="q-palette-list" role="listbox">
          {hits.length === 0 && <Empty>Nessun risultato per «{q}».</Empty>}
          {groups.map(([g, items]) => (
            <div key={g}>
              <div className="q-palette-group">{g}</div>
              {items.map(hh => {
                flat += 1
                const i = flat
                return (
                  <button key={`${g}-${hh.label}-${i}`} type="button" role="option" aria-selected={i === sel}
                    className="q-palette-item" onMouseEnter={() => setSel(i)} onClick={hh.go}>
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {hh.label}
                    </span>
                    <span className="q-palette-meta" style={{
                      maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{hh.meta}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

const CAPS: { t: string; d: string }[] = [
  { t: "Pipeline trascinabile", d: "Cinque stati, dalla prima segnalazione al contratto. Trascina una scheda per cambiarle stato — col mouse o col dito, funziona uguale. Chi usa la tastiera trova su ogni scheda un menu «Sposta» che fa la stessa cosa: il gesto non è mai l'unica via." },
  { t: "Lo spostamento lascia traccia", d: "Cambiare stato non muove solo una card: aggiorna la data dell'ultimo movimento e scrive una riga nella cronologia del cliente. È il motivo per cui il pannello a destra racconta sempre la verità, anche dopo dieci trascinamenti." },
  { t: "Scheda cliente e cronologia", d: "Anagrafica, referenti e partita IVA da una parte; dall'altra una sola lista con chiamate, riunioni, note, file e cambi di stato in ordine di tempo. Gli appuntamenti futuri restano in cima, accesi: sono impegni, non storia." },
  { t: "Note che restano", d: "Scrivi una nota nella scheda cliente e compare subito nella cronologia, con autore e data. ⌘ + Invio per salvare senza staccare le mani dalla tastiera." },
  { t: "Anagrafica che si crea davvero", d: "«Nuovo cliente» apre un modulo che controlla prima di salvare: ragione sociale doppia, e-mail irriconoscibile, e soprattutto la partita IVA — undici cifre con l'ultima di controllo. Se la cifra è sbagliata il campo dice quale dovrebbe essere, invece del solito «valore non valido». Una partita IVA errata non si scopre in anagrafica: si scopre quando la fattura torna indietro." },
  { t: "Archiviare invece di cancellare", d: "Archiviare toglie il cliente dagli elenchi di lavoro e lascia intatte trattative, cronologia e conti: un fatturato che cambia perché qualcuno ha fatto ordine in anagrafica non lo crede più nessuno. Se ci sono trattative aperte, la demo chiede conferma — è l'unico caso in cui archiviare può essere un errore vero. Cancellare resta possibile, dice prima che cosa porta via, e per qualche secondo si può disfare." },
  { t: "Imbuto onesto", d: "L'imbuto conta quante trattative sono arrivate ALMENO a ogni stato, e le perse contano fino allo stato in cui si sono fermate — non oltre. Contarle come «arrivate in fondo» darebbe una conversione del 100 % e un grafico che mente." },
  { t: "Previsione ponderata", d: "La somma grezza della pipeline è un numero che nessun direttore commerciale crede. Qui ogni trattativa pesa per la probabilità del suo stato: è la previsione minima che si possa difendere in riunione." },
  { t: "Rapporto PDF", d: "Un clic e scarichi un PDF vero — testo selezionabile, non uno screenshot — con sintesi, imbuto, andamento mensile, classifica dei commerciali e le trattative perse col loro motivo. Si compone nel browser, senza passare da un server." },
]

function Guide({ onClose }: { onClose: () => void }) {
  return (
    <div className="q-palette-scrim" style={{ paddingTop: "7vh" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="q-palette" style={{ maxWidth: 660, maxHeight: "min(80vh,700px)" }}
        role="dialog" aria-label="Guida"
        initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.18 }}>

        <div style={{
          padding: "20px 22px 16px", borderBottom: "1px solid var(--q-line-soft)",
          display: "flex", gap: 14, alignItems: "flex-start",
        }}>
          <span className="q-mark" style={{ marginBottom: 0 }}>Q</span>
          <div style={{ minWidth: 0 }}>
            <h3 className="q-h1" style={{ fontSize: 19 }}>Che cos'è questa demo</h3>
            <p className="q-small" style={{ marginTop: 5, color: "var(--q-ink-muted)" }}>
              Un CRM di vendita: la pipeline che si trascina, la scheda cliente con la
              cronologia, l'analisi e il rapporto da mandare al direttore commerciale.
            </p>
          </div>
          <button type="button" className="q-icon-btn" onClick={onClose} aria-label="Chiudi"
            style={{ marginLeft: "auto" }}>✕</button>
        </div>

        <div className="q-palette-list" style={{ padding: "4px 22px 20px" }}>
          <p className="q-small" style={{ padding: "14px 0", color: "var(--q-ink-muted)" }}>
            È una <strong style={{ color: "var(--q-ink)" }}>demo funzionante</strong>, non uno
            screenshot: i dati vivono nel browser e reagiscono davvero. Aziende, persone e
            importi sono inventati.
          </p>

          {CAPS.map((c, i) => (
            <div key={c.t} style={{ display: "flex", gap: 13, padding: "13px 0", borderTop: "1px solid var(--q-line-soft)" }}>
              <span style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                background: "var(--q-sheet-2)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11.5, fontWeight: 700, color: "var(--q-ink-muted)",
              }}>{i + 1}</span>
              <span style={{ minWidth: 0 }}>
                <span className="q-h3" style={{ display: "block", marginBottom: 3 }}>{c.t}</span>
                <span className="q-small" style={{ color: "var(--q-ink-muted)" }}>{c.d}</span>
              </span>
            </div>
          ))}

          <div style={{ marginTop: 18, padding: 15, borderRadius: "var(--q-r-sm)", background: "var(--q-sheet-2)" }}>
            <span className="q-h3" style={{ display: "block", marginBottom: 8 }}>Da dove iniziare</span>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--q-ink-muted)", fontSize: 13, lineHeight: 1.75 }}>
              <li>Trascina «Contratto quadro triennale» in <strong>Contratto firmato</strong>.</li>
              <li>Apri quella stessa scheda: in cronologia c'è già la riga del passaggio.</li>
              <li>Scrivi una nota nella scheda cliente e guardala comparire in cima.</li>
              <li>In <strong>Clienti</strong>, prova <strong>Nuovo cliente</strong> con la partita IVA <code>01234567890</code>: il campo dice con quale cifra dovrebbe finire.</li>
              <li>Dal menu <strong>⋯</strong> archivia un cliente, poi ripristinalo dall'avviso in basso.</li>
              <li>Vai in <strong>Analisi</strong> e scarica il rapporto PDF.</li>
              <li>Premi <strong>⌘K</strong> per cercare una trattativa o un cliente.</li>
            </ul>
          </div>

          <div style={{ marginTop: 16 }}>
            <span className="q-eyebrow" style={{ display: "block", marginBottom: 8 }}>
              Contratto REST · {API.length} rotte
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {API.slice(0, 6).map(r => (
                <div key={`${r.method}-${r.path}`} style={{ display: "flex", gap: 9, alignItems: "baseline" }}>
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em",
                    color: r.method === "GET" ? "var(--q-lime-deep)" : "var(--q-ink-muted)",
                    minWidth: 44,
                  }}>{r.method}</span>
                  <code style={{ fontSize: 11.5, fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", color: "var(--q-ink)" }}>
                    {r.path}
                  </code>
                  <span className="q-micro" style={{ marginLeft: "auto", textAlign: "right", maxWidth: "48%" }}>
                    {r.purpose}
                  </span>
                </div>
              ))}
            </div>
            <p className="q-micro" style={{ marginTop: 8 }}>
              Il contratto completo è in <code>types.ts</code>: gli stessi tipi che il pannello usa.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export { SCREEN_LABEL }
