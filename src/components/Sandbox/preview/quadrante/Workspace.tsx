import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import type { Activity, ClientProfile, Deal } from "./types"
import {
  PRIORITY_LABEL, STAGES, STAGE_BY_ID, activitiesFor, clientById, dateLabel,
  dealsForClient, eur, eurShort, isArchived, isFuture, isLate, num, openDeals,
  plural, relativeDay, repById, sumValue, timeLabel,
} from "./data"
import { ACTIVITY_ICON, AvatarOf, Empty, Ico } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   POSTAZIONE DI LAVORO

   Tre colonne, e ognuna risponde a una domanda diversa:

     NERO      chi devo sentire?      elenco di lavoro + i conteggi in cima
     BIANCO    che cosa è successo?   anagrafica, contatti, cronologia
     PASTELLO  che cosa faccio ora?   stato della trattativa e prossima azione

   È la stessa lettura da sinistra a destra che si fa a voce: «con chi sono,
   a che punto siamo, cosa devo fare». Le tre colonne non sono un vezzo di
   composizione — sono quell'ordine.

   Il pannello nero non è scuro per estetica: sta fermo mentre il centro
   cambia a ogni clic, e un fondo scuro che non si muove stanca meno di un
   bianco che lampeggia.
══════════════════════════════════════════════════════════════════════════ */

type Tab = "riepilogo" | "anagrafica" | "trattative"

const TABS: [Tab, string][] = [
  ["riepilogo", "Riepilogo"],
  ["anagrafica", "Dettagli"],
  ["trattative", "Trattative"],
]

export default function Workspace({
  clients, deals, activities, selected, onSelect, onAddNote,
  onNew, onArchive, onRestore, onDelete,
}: {
  clients: ClientProfile[]
  deals: Deal[]
  activities: Activity[]
  selected: string
  onSelect: (clientId: string) => void
  onAddNote: (clientId: string, text: string) => void
  onNew: () => void
  onArchive: (clientId: string) => void
  onRestore: (clientId: string) => void
  onDelete: (clientId: string) => void
}) {
  const client = clientById(selected, clients)
  const [tab, setTab] = useState<Tab>("riepilogo")
  const [note, setNote] = useState("")
  const archived = isArchived(client)

  const mine = useMemo(() => dealsForClient(client.id, deals), [client.id, deals])
  const events = useMemo(() => activitiesFor(client.id, activities), [client.id, activities])
  const open = mine.filter(x => !STAGE_BY_ID[x.stage].terminal)
  /* la trattativa «di riferimento» per le schede a destra: la più grossa
     ancora aperta, o l'ultima toccata se non ce ne sono */
  const focus = open.slice().sort((a, b) => b.value - a.value)[0] ?? mine[0]

  const send = () => {
    const t = note.trim()
    if (!t) return
    onAddNote(client.id, t)
    setNote("")
    setTab("riepilogo")
  }

  return (
    <div className="q-ws">
      <WorkList clients={clients} deals={deals} selected={client.id}
        onSelect={id => { onSelect(id); setTab("riepilogo") }} onNew={onNew} />

      {/* ── il dettaglio ────────────────────────────────────────────────── */}
      <div className="q-ws-mid">
        <div className="q-detail-head">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
            <span className="q-avatar q-avatar-xl" style={{ background: repById(client.owner).tint }}>
              {client.company.slice(0, 2).toUpperCase()}
            </span>

            {/* flex-basis e non `flex:1`: con basis auto questo blocco si
                stringeva fino a mandare a capo una parola per riga, e il
                riquadro del referente ci finiva sopra. Con una base di 200px
                non ci sta piu accanto e va a capo lui, che è il modo giusto
                di perdere spazio. */}
            <div style={{ minWidth: 0, flex: "1 1 200px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                <h2 className="q-display" style={{ fontSize: 27 }}>{client.company}</h2>
                {archived && (
                  <span className="q-chip q-chip-warn">
                    <Ico n="archive" size={12} />
                    Archiviato il {dateLabel(client.archivedAt!)}
                  </span>
                )}
              </div>
              <p className="q-small" style={{ marginTop: 6, color: "var(--q-ink-muted)" }}>
                {client.name} · {client.sector} ({num(client.employees)} dipendenti)
              </p>
              <p className="q-small" style={{ marginTop: 3, color: "var(--q-ink-faint)" }}>
                {client.address}, {client.city} · {client.phone} · {client.email}
              </p>

              {/* i cerchi d'azione: chiamare, scrivere, fissare — le tre cose
                  che si fanno davvero da una scheda cliente */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <a className="q-round" href={`tel:${client.phone.replace(/\s/g, "")}`} title="Chiama" aria-label="Chiama">
                  <Ico n="phone" size={16} />
                </a>
                <a className="q-round" href={`mailto:${client.email}`} title="Scrivi" aria-label="Scrivi un'e-mail">
                  <Ico n="mail" size={16} />
                </a>
                <span className="q-round q-round-quiet" title="Fissa una riunione" aria-hidden>
                  <Ico n="meeting" size={16} />
                </span>
                <a className="q-round q-round-quiet" href={`https://${client.website}`} target="_blank"
                  rel="noopener noreferrer" title={client.website} aria-label="Apri il sito">
                  <Ico n="doc" size={16} />
                </a>

                <span style={{ display: "flex", gap: 7, marginLeft: 6, flexWrap: "wrap" }}>
                  {focus && (
                    <span className={`q-chip ${focus.priority === "alta" ? "q-chip-hot" : focus.priority === "media" ? "q-chip-lav" : ""}`}>
                      Priorità {PRIORITY_LABEL[focus.priority].toLowerCase()}
                    </span>
                  )}
                  {/* il lime vuol dire «c'è qualcosa qui»: su uno zero
                      direbbe il contrario di quello che si vede */}
                  {open.length > 0 ? (
                    <span className="q-chip q-chip-lime">
                      {plural(open.length, "aperta", "aperte")} · {eurShort(sumValue(open))}
                    </span>
                  ) : (
                    <span className="q-chip">Nessuna trattativa aperta</span>
                  )}
                </span>
              </div>
            </div>

            <span className="q-detail-owner">
              <AvatarOf id={client.owner} size={34} />
              <span style={{ minWidth: 0 }}>
                <span className="q-micro" style={{ display: "block" }}>Referente</span>
                <span className="q-h3" style={{ display: "block" }}>{repById(client.owner).name}</span>
              </span>
              <ClientMenu
                archived={archived}
                onArchive={() => onArchive(client.id)}
                onRestore={() => onRestore(client.id)}
                onDelete={() => onDelete(client.id)}
              />
            </span>
          </div>

          {archived && (
            <p className="q-note-arch">
              <Ico n="archive" size={14} />
              <span>
                Fuori dagli elenchi di lavoro.{" "}
                {mine.length === 0
                  ? "Non ha trattative collegate."
                  : `${plural(mine.length, "trattativa resta", "trattative restano")} dove ${mine.length === 1 ? "era" : "erano"}, nella pipeline e nei conti:`}
                {mine.length > 0 && " un fatturato che cambia perché qualcuno ha fatto ordine in anagrafica non lo crede più nessuno."}
              </span>
              <button type="button" className="q-btn q-btn-ink q-btn-sm" onClick={() => onRestore(client.id)}>
                <Ico n="undo" size={13} />Ripristina
              </button>
            </p>
          )}

          <div className="q-tabs" role="tablist">
            {TABS.map(([id, label]) => (
              <button key={id} type="button" className="q-tab" role="tab"
                aria-selected={tab === id} onClick={() => setTab(id)}>
                {label}{id === "trattative" && ` (${mine.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="q-detail-body">
          {tab === "riepilogo" && (
            <>
              <div style={{ marginBottom: 18 }}>
                <textarea
                  className="q-input" rows={2} value={note}
                  placeholder="Scrivi una nota su questo cliente…"
                  onChange={e => setNote(e.target.value)}
                  onKeyDown={e => {
                    /* ⌘/Ctrl+Invio manda: Invio da solo deve poter andare a capo */
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); send() }
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <span className="q-micro">⌘ + Invio per salvare</span>
                  <button type="button" className="q-btn q-btn-ink q-btn-sm"
                    style={{ marginLeft: "auto" }} disabled={!note.trim()} onClick={send}>
                    Aggiungi nota
                  </button>
                </div>
              </div>

              {events.length === 0
                ? <Empty>Nessuna attività registrata.</Empty>
                : <div className="q-timeline">{events.map(ev => <Event key={ev.id} ev={ev} />)}</div>}
            </>
          )}

          {tab === "anagrafica" && (
            <>
              <dl style={{ margin: 0 }}>
                {([
                  ["Ragione sociale", client.company],
                  ["Referente", client.name],
                  ["Partita IVA", client.vat],
                  ["Settore", client.sector],
                  ["Dipendenti", num(client.employees)],
                  ["Sede", `${client.address} · ${client.city}`],
                  ["Telefono", client.phone],
                  ["E-mail", client.email],
                  ["Sito", client.website],
                  ["Cliente dal", dateLabel(client.since)],
                ] as [string, string][]).map(([k, v]) => (
                  <div className="q-kv" key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              {client.notes && (
                <div className="q-card-lav" style={{ marginTop: 18 }}>
                  <span className="q-eyebrow" style={{ display: "block", marginBottom: 7 }}>Da sapere</span>
                  <p className="q-small">{client.notes}</p>
                </div>
              )}
            </>
          )}

          {tab === "trattative" && (
            mine.length === 0
              ? <Empty>Nessuna trattativa registrata.</Empty>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mine.map(x => (
                    <div key={x.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "13px 14px", borderRadius: "var(--q-r)",
                      background: "var(--q-sheet-2)",
                    }}>
                      <span className="q-col-dot" style={{ background: STAGE_BY_ID[x.stage].color }} />
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span className="q-h3" style={{ display: "block" }}>{x.title}</span>
                        <span className="q-micro" style={{ display: "block", marginTop: 3 }}>
                          {x.id} · {STAGE_BY_ID[x.stage].title} · chiusura attesa {dateLabel(x.expectedClose)}
                          {isLate(x) && " · in ritardo"}
                        </span>
                      </span>
                      <span className="q-h3 q-num" style={{ flexShrink: 0 }}>{eur(x.value)}</span>
                    </div>
                  ))}
                </div>
              )
          )}
        </div>
      </div>

      {/* ── le schede pastello: stato e prossima azione ─────────────────── */}
      <div className="q-ws-right">
        {focus ? <DealCard deal={focus} /> : (
          <div className="q-card">
            <span className="q-eyebrow" style={{ display: "block", marginBottom: 7 }}>Trattative</span>
            <p className="q-small" style={{ color: "var(--q-ink-muted)" }}>
              Nessuna trattativa collegata. Si aggiungono dalla pipeline: una
              scheda nuova nella prima colonna, e da lì si trascina.
            </p>
          </div>
        )}
        <NextAction client={client} events={events} deal={focus} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   AZIONI SULL'ANAGRAFICA

   Archiviare sta prima di cancellare, e non per gentilezza: nove volte su
   dieci quello che serve davvero è togliere un nome dall'elenco, non
   distruggere due anni di cronologia. Cancellare resta possibile — è un
   diritto, non un tabù — ma è l'ultima voce, staccata dalle altre e in
   rosso, perché non ci si arrivi per inerzia.
══════════════════════════════════════════════════════════════════════════ */
function ClientMenu({ archived, onArchive, onRestore, onDelete }: {
  archived: boolean
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false) } }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [open])

  const run = (fn: () => void) => () => { setOpen(false); fn() }

  return (
    <span ref={box} style={{ position: "relative", flexShrink: 0 }}>
      <button type="button" className="q-icon-btn" aria-label="Azioni sul cliente"
        aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(o => !o)}>
        <Ico n="dots" size={16} />
      </button>
      {open && <div className="q-shade" onClick={() => setOpen(false)} aria-hidden />}
      {open && (
        <motion.div className="q-pop" style={{ width: 232 }} role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}>
          <div className="q-pop-body">
            {archived ? (
              <button type="button" className="q-pop-item" role="menuitem" onClick={run(onRestore)}>
                <Ico n="undo" size={15} />Ripristina il cliente
              </button>
            ) : (
              <button type="button" className="q-pop-item" role="menuitem" onClick={run(onArchive)}>
                <Ico n="archive" size={15} />Archivia
              </button>
            )}
            <div className="q-pop-rule" />
            <button type="button" className="q-pop-item" role="menuitem"
              style={{ color: "var(--q-bad)" }} onClick={run(onDelete)}>
              <Ico n="trash" size={15} />Elimina definitivamente
            </button>
          </div>
        </motion.div>
      )}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ELENCO DI LAVORO — il pannello nero

   Le righe nascono dall'ANAGRAFICA, non dalle trattative. Derivarle dai
   Deal sembrava naturale — l'elenco serve a lavorare, e senza trattative
   non c'è niente da lavorare — ma un cliente appena creato non ne ha
   nessuna: sarebbe stato salvato correttamente e invisibile, cioè perso.
══════════════════════════════════════════════════════════════════════════ */
type Filtro = "attivi" | "archiviati"

function WorkList({ clients, deals, selected, onSelect, onNew }: {
  clients: ClientProfile[]
  deals: Deal[]
  selected: string
  onSelect: (id: string) => void
  onNew: () => void
}) {
  const [filtro, setFiltro] = useState<Filtro>("attivi")
  const [q, setQ] = useState("")

  const rows = useMemo(() => {
    const byClient = new Map<string, Deal[]>()
    for (const d of deals) {
      const list = byClient.get(d.clientId) ?? []
      list.push(d)
      byClient.set(d.clientId, list)
    }
    return clients.map(c => {
      const list = byClient.get(c.id) ?? []
      const open = list.filter(x => !STAGE_BY_ID[x.stage].terminal)
      return {
        client: c,
        open,
        value: sumValue(open),
        late: open.some(isLate),
        top: open.slice().sort((a, b) => b.value - a.value)[0],
      }
    })
    /* per valore aperto: l'elenco risponde a «chi vale di più adesso», non
       all'ordine alfabetico dell'anagrafica. A parità — tipicamente i nuovi,
       che valgono zero — vince chi è arrivato per ultimo. */
      .sort((a, b) => b.value - a.value || b.client.since.localeCompare(a.client.since))
  }, [clients, deals])

  const attivi = rows.filter(r => !isArchived(r.client))
  const archiviati = rows.filter(r => isArchived(r.client))
  const pool = filtro === "attivi" ? attivi : archiviati

  const t = q.trim().toLowerCase()
  const shown = t
    ? pool.filter(r => `${r.client.company} ${r.client.name} ${r.client.city} ${r.client.sector}`
      .toLowerCase().includes(t))
    : pool

  /* i conteggi in cima guardano i clienti attivi: archiviare deve cambiare
     l'elenco, non i numeri della pipeline */
  const liveIds = new Set(attivi.map(r => r.client.id))
  const live = deals.filter(d => liveIds.has(d.clientId))
  const all = openDeals(live)

  return (
    <aside className="q-ws-left q-dark-panel" aria-label="Elenco di lavoro">
      {/* i quattro conteggi in cima, come nel riferimento */}
      <div className="q-grid q-grid-2" style={{ gap: 8 }}>
        <Mini dot="var(--q-lime)" label="Da lavorare" n={attivi.length} />
        <Mini dot="var(--q-hot)" label="Nuovi lead" n={live.filter(d => d.stage === "nuovo").length} />
        <Mini dot="var(--q-lav)" label="Aperte" n={all.length} />
        <Mini dot="var(--q-st-contatto)" label="In ritardo" n={all.filter(isLate).length} />
      </div>

      <div className="q-wl-tools">
        <button type="button" className="q-wl-new" onClick={onNew}>
          <Ico n="plus" size={15} />Nuovo cliente
        </button>

        <div className="q-wl-find">
          <Ico n="search" size={14} />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Filtra per nome, città, settore" aria-label="Filtra l'elenco dei clienti" />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Azzera il filtro">✕</button>
          )}
        </div>

        <div className="q-seg q-seg-dark" style={{ width: "100%" }}>
          {([["attivi", "Attivi", attivi.length], ["archiviati", "Archiviati", archiviati.length]] as const)
            .map(([id, label, n]) => (
              <button key={id} type="button" style={{ flex: 1 }}
                aria-pressed={filtro === id} onClick={() => setFiltro(id)}>
                {label} {n}
              </button>
            ))}
        </div>
      </div>

      <div className="q-wl" style={{ maxHeight: 400 }}>
        {shown.length === 0 && (
          <p className="q-wl-empty">
            {t
              ? <>Nessun cliente per «{q}».</>
              : filtro === "archiviati"
                ? <>Nessun cliente archiviato. Si archivia dal menu ⋯ della scheda.</>
                : <>Nessun cliente attivo. Creane uno qui sopra.</>}
          </p>
        )}
        {shown.map(r => {
          const on = r.client.id === selected
          const arch = isArchived(r.client)
          return (
            <button key={r.client.id} type="button" className={`q-wl-item${arch ? " is-arch" : ""}`}
              aria-current={on} onClick={() => onSelect(r.client.id)}>
              <AvatarOf id={r.client.owner} size={32} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="q-h3" style={{
                  display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{r.client.company}</span>
                <span className="q-wl-sub" style={{ display: "block", marginTop: 2 }}>
                  {r.client.name} · {r.client.city}
                </span>

                <span className="q-wl-foot">
                  <span className="q-micro" style={{ color: "inherit", opacity: 0.75 }}>
                    {r.open.length
                      ? `${plural(r.open.length, "aperta", "aperte")} · ${eurShort(r.value)}`
                      : "nessuna aperta"}
                  </span>
                  {arch && (
                    <span className="q-micro" style={{ marginLeft: "auto", color: "inherit", opacity: 0.7 }}>
                      archiviato
                    </span>
                  )}
                  {!arch && r.late && (
                    <span className="q-chip q-chip-hot" style={{ height: 20, fontSize: 10, marginLeft: "auto" }}>
                      in ritardo
                    </span>
                  )}
                  {!arch && !r.late && r.top && (
                    <span className="q-micro" style={{ marginLeft: "auto", color: "inherit", opacity: 0.65 }}>
                      {STAGE_BY_ID[r.top.stage].title}
                    </span>
                  )}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

function Mini({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <div className="q-mini">
      <div className="q-mini-top">
        <span className="q-mini-dot" style={{ background: dot }} />
        <span className="q-mini-label">{label}</span>
      </div>
      <div className="q-mini-n q-num">{n}</div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SCHEDE PASTELLO
══════════════════════════════════════════════════════════════════════════ */
function DealCard({ deal }: { deal: Deal }) {
  const stage = STAGE_BY_ID[deal.stage]
  const ladder = STAGES.filter(s => s.id !== "perso")
  return (
    <motion.div className="q-card-lav" layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span className="q-eyebrow" style={{ display: "block", marginBottom: 5 }}>Trattativa in corso</span>
          <span className="q-h2" style={{ display: "block" }}>{deal.title}</span>
        </span>
        <Ico n="chart" size={16} />
      </div>

      {/* lo stato come scala, non come pillola: si vede quanto manca */}
      <div style={{ marginTop: 14 }}>
        {ladder.map(s => {
          const done = s.order < stage.order
          const now = s.id === deal.stage
          return (
            <div key={s.id} className={`q-check${done || now ? " is-on" : " is-off"}`}>
              <span className="q-check-box" style={now ? { background: "var(--q-on-pastel)", color: "var(--q-lav)" } : undefined}>
                {done ? <Ico n="check" size={10} /> : now ? <Ico n="clock" size={10} /> : null}
              </span>
              <span style={{ fontWeight: now ? 700 : 500 }}>{s.title}</span>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid rgba(20,22,26,0.16)" }}>
        <span className="q-eyebrow" style={{ display: "block", marginBottom: 4 }}>Valore potenziale</span>
        <span className="q-figure q-num">{eur(deal.value)}</span>
        <p className="q-micro" style={{ marginTop: 6 }}>
          Ponderato al {Math.round(stage.probability * 100)} %: {eur(Math.round(deal.value * stage.probability))}
          {" · "}chiusura attesa {relativeDay(deal.expectedClose)}
        </p>
      </div>
    </motion.div>
  )
}

/**
 * La prossima azione non è un campo che qualcuno compila: si deduce.
 * Un appuntamento in calendario vince su tutto; poi il ritardo; poi il
 * silenzio. Una scheda «prossima azione» che va riempita a mano resta vuota
 * per sempre — e allora tanto vale non averla.
 */
function NextAction({ client, events, deal }: {
  client: ClientProfile
  events: Activity[]
  deal?: Deal
}) {
  const next = events.find(e => isFuture(e.at))
  const last = events.find(e => !isFuture(e.at))
  const late = deal && isLate(deal)

  const title = next ? next.title
    : late ? "Richiamare: chiusura superata"
    : "Nessun appuntamento fissato"

  const why = next
    ? `${dateLabel(next.at)}${timeLabel(next.at) ? ` alle ${timeLabel(next.at)}` : ""} · ${relativeDay(next.at)}`
    : late
      ? `La chiusura attesa era ${relativeDay(deal!.expectedClose)}.`
      : last
        ? `Ultimo contatto ${relativeDay(last.at)}.`
        : "Nessun contatto registrato."

  return (
    <motion.div className="q-card-lime" layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span className="q-eyebrow" style={{ display: "block", marginBottom: 5 }}>Prossima azione</span>
          <span className="q-h2" style={{ display: "block" }}>{title}</span>
        </span>
        <Ico n={next ? "meeting" : late ? "phone" : "clock"} size={16} />
      </div>

      <p className="q-small" style={{ marginTop: 8, color: "rgba(20,22,26,0.70)" }}>{why}</p>

      {next?.body && (
        <p className="q-micro" style={{
          marginTop: 10, padding: "9px 11px", borderRadius: "var(--q-r-sm)",
          background: "rgba(20,22,26,0.08)", color: "rgba(20,22,26,0.74)", lineHeight: 1.55,
        }}>
          {next.body}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <a className="q-btn q-btn-ink q-btn-sm" href={`tel:${client.phone.replace(/\s/g, "")}`}
          style={{ flex: 1 }}>
          <Ico n="phone" size={13} />Chiama
        </a>
        <a className="q-btn q-btn-light q-btn-sm" href={`mailto:${client.email}`} style={{ flex: 1 }}>
          <Ico n="mail" size={13} />Scrivi
        </a>
      </div>
    </motion.div>
  )
}

/* ── un evento della cronologia ────────────────────────────────────────── */
function Event({ ev }: { ev: Activity }) {
  const future = isFuture(ev.at)
  const by = repById(ev.by)
  return (
    <div className={`q-ev${future ? " is-future" : ""}`}>
      <span className="q-ev-dot"><Ico n={ACTIVITY_ICON[ev.kind]} size={12} /></span>

      <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
        <span className="q-h3">{ev.title}</span>
        {future && <span className="q-chip q-chip-lime" style={{ height: 20, fontSize: 10 }}>in programma</span>}
      </div>

      <div className="q-ev-when" style={{ marginTop: 3 }}>
        {dateLabel(ev.at)}{timeLabel(ev.at) && ` · ${timeLabel(ev.at)}`} · {relativeDay(ev.at)} · {by.name}
        {ev.durationMin ? ` · ${ev.durationMin} min` : ""}
      </div>

      {ev.body && <p className="q-ev-body">{ev.body}</p>}

      {ev.kind === "stato" && ev.from && ev.to && (
        <p className="q-ev-body" style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span className="q-chip">{STAGE_BY_ID[ev.from].title}</span>
          <Ico n="move" size={12} />
          <span className="q-chip q-chip-lime">{STAGE_BY_ID[ev.to].title}</span>
        </p>
      )}

      {ev.fileName && (
        <span className="q-file">
          <Ico n="doc" size={13} />{ev.fileName}
          <span className="q-micro">{ev.fileSize}</span>
        </span>
      )}
    </div>
  )
}
