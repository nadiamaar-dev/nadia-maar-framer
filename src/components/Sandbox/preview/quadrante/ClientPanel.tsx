import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import type { Activity, ActivityKind, ClientProfile, Deal } from "./types"
import {
  STAGE_BY_ID, activitiesFor, dateLabel, dealsForClient, eur, isFuture, num,
  relativeDay, repById, sumValue, timeLabel,
} from "./data"
import { ACTIVITY_ICON, AvatarOf, CardHead, Empty, Ico, Kv, StageChip } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   SCHEDA CLIENTE — anagrafica e cronologia

   Pannello laterale e non pagina a sé: si apre da una card del board e ci si
   torna subito, senza perdere la posizione sul board dietro. Il contesto
   resta visibile, che è metà del motivo per cui si è cliccato.

   La cronologia è UNA sola lista, non tre schede separate per chiamate,
   riunioni e note: quello che serve sapere è «cos'è successo per ultimo con
   questo cliente», e la risposta non è divisa per tipo.
══════════════════════════════════════════════════════════════════════════ */

type Tab = "attivita" | "anagrafica" | "trattative"

const KIND_LABEL: Record<ActivityKind, string> = {
  chiamata: "Chiamata",
  riunione: "Riunione",
  email: "E-mail",
  nota: "Nota",
  documento: "Documento",
  stato: "Stato",
}

const FILTERS: { id: ActivityKind | "tutto"; label: string }[] = [
  { id: "tutto", label: "Tutto" },
  { id: "chiamata", label: "Chiamate" },
  { id: "riunione", label: "Riunioni" },
  { id: "nota", label: "Note" },
  { id: "documento", label: "File" },
]

export default function ClientPanel({
  client, deals, activities, focusDealId, onClose, onOpenDeal, onAddNote,
}: {
  client: ClientProfile
  deals: Deal[]
  activities: Activity[]
  /** la trattativa da cui si è aperta questa scheda — cliccata sul board, in
      un risultato di ricerca, o nel link di un evento. Senza questo filo, il
      pannello non racconta perché si è aperto: si vede solo il cliente, mai
      il motivo per cui ci si è finiti sopra proprio ora. */
  focusDealId?: string | null
  onClose: () => void
  onOpenDeal: (id: string) => void
  onAddNote: (clientId: string, text: string) => void
}) {
  const [tab, setTab] = useState<Tab>("attivita")
  const [filter, setFilter] = useState<ActivityKind | "tutto">("tutto")
  const [note, setNote] = useState("")

  const mine = useMemo(() => dealsForClient(client.id, deals), [client.id, deals])
  const events = useMemo(() => activitiesFor(client.id, activities), [client.id, activities])
  const shown = filter === "tutto" ? events : events.filter(e => e.kind === filter)

  const open = mine.filter(d => !STAGE_BY_ID[d.stage].terminal)
  const won = mine.filter(d => d.stage === "firmato")
  const owner = repById(client.owner)
  const focusDeal = focusDealId ? mine.find(d => d.id === focusDealId) : undefined

  const send = () => {
    const t = note.trim()
    if (!t) return
    onAddNote(client.id, t)
    setNote("")
    /* la nota appena scritta è un'attività: si guarda lì, non dove si stava */
    setTab("attivita")
    setFilter("tutto")
  }

  return (
    <>
      <div className="q-scrim" onClick={onClose} />
      <motion.aside
        className="q-slide"
        role="dialog"
        aria-label={`Scheda cliente ${client.company}`}
        initial={{ x: 28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 28, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="q-slide-head">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
            <span className="q-avatar q-avatar-lg" style={{ background: owner.tint }}>
              {client.company.slice(0, 2).toUpperCase()}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <h2 className="q-h1" style={{ fontSize: 18 }}>{client.company}</h2>
                {client.archivedAt && (
                  <span className="q-chip q-chip-warn" style={{ height: 22, fontSize: 10.5 }}>
                    <Ico n="archive" size={11} />archiviato
                  </span>
                )}
              </div>
              <p className="q-micro" style={{ marginTop: 3 }}>
                {client.sector} · {client.city} · {num(client.employees)} dipendenti
              </p>

              {/* le stesse scorciatoie di contatto della postazione «Clienti»:
                  senza, per chiamare bisognava prima aprire la scheda
                  Anagrafica — un passaggio in più per l'azione più frequente */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12 }}>
                <a className="q-round" style={{ width: 32, height: 32 }}
                  href={`tel:${client.phone.replace(/\s/g, "")}`} title="Chiama" aria-label="Chiama">
                  <Ico n="phone" size={14} />
                </a>
                <a className="q-round" style={{ width: 32, height: 32 }}
                  href={`mailto:${client.email}`} title="Scrivi" aria-label="Scrivi un'e-mail">
                  <Ico n="mail" size={14} />
                </a>
                <span className="q-round q-round-quiet" style={{ width: 32, height: 32 }}
                  title="Fissa una riunione" aria-hidden>
                  <Ico n="meeting" size={14} />
                </span>
                <a className="q-round q-round-quiet" style={{ width: 32, height: 32 }}
                  href={`https://${client.website}`} target="_blank" rel="noopener noreferrer"
                  title={client.website} aria-label="Apri il sito">
                  <Ico n="doc" size={14} />
                </a>
              </div>
            </div>
            <button type="button" className="q-icon-btn" onClick={onClose} aria-label="Chiudi">✕</button>
          </div>

          {/* i tre numeri che si cercano prima di chiamare. «Aperte» prende
              il lime perché è l'unico dei tre su cui c'è ancora qualcosa da
              fare — gli altri due sono consultivi */}
          <div style={{ display: "flex", gap: 18, marginTop: 16 }}>
            {([
              ["Aperte", `${open.length} · ${eur(sumValue(open))}`, open.length > 0],
              ["Firmato", eur(sumValue(won)), false],
              ["Cliente dal", dateLabel(client.since).replace(/^\d+ /, ""), false],
            ] as [string, string, boolean][]).map(([k, v, live]) => (
              <span key={k} style={{ minWidth: 0 }}>
                <span className="q-eyebrow" style={{ display: "block" }}>{k}</span>
                <span className="q-h3 q-num" style={{
                  display: "block", marginTop: 3,
                  color: live ? "var(--q-lime-deep)" : undefined,
                }}>{v}</span>
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 2, marginTop: 14, borderBottom: "1px solid var(--q-line-soft)" }}>
            {([["attivita", "Attività"], ["anagrafica", "Anagrafica"], ["trattative", `Trattative (${mine.length})`]] as [Tab, string][]).map(([id, label]) => (
              <button key={id} type="button" className="q-tab" role="tab"
                aria-selected={tab === id} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="q-slide-body">
          {/* ── cronologia ────────────────────────────────────────────── */}
          {tab === "attivita" && (
            <>
              {/* la trattativa da cui si è arrivati: prima riga vista, non un
                  link in fondo alla cronologia. Un primo tentativo la
                  disegnava come scheda lavanda a tutta larghezza — lo stesso
                  trattamento delle schede-decisione della postazione
                  «Clienti». Qui però non è la decisione, è solo il motivo
                  per cui si è aperto il pannello: un riquadro pieno di quel
                  peso schiacciava la cronologia sotto e litigava con il lime
                  già acceso in testata. Una striscia grigia con un filo di
                  colore dice la stessa cosa senza gridare. */}
              {focusDeal && (
                <div className="q-panel-focus">
                  <span className="q-panel-focus-bar"
                    style={{ background: STAGE_BY_ID[focusDeal.stage].color }} aria-hidden />
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span className="q-eyebrow" style={{ display: "block", marginBottom: 4 }}>
                      Trattativa collegata
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span className="q-h3" style={{
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
                      }}>{focusDeal.title}</span>
                      <StageChip id={focusDeal.stage} />
                      <span className="q-micro">{focusDeal.id}</span>
                    </span>
                  </span>
                  <span className="q-h3 q-num" style={{ flexShrink: 0 }}>{eur(focusDeal.value)}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {FILTERS.map(f => (
                  <button key={f.id} type="button"
                    className="q-chip"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    style={filter === f.id
                      ? { background: "var(--q-ink)", color: "#FFFFFF" }
                      : undefined}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* scrivere una nota è l'azione più frequente: sta in cima,
                  non in fondo a una lista che può essere lunga */}
              <div style={{ marginBottom: 18 }}>
                <textarea
                  className="q-input"
                  rows={2}
                  value={note}
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

              {shown.length === 0
                ? <Empty>Nessuna attività di questo tipo.</Empty>
                : (
                  <div className="q-timeline">
                    {shown.map(ev => <Event key={ev.id} ev={ev} onOpenDeal={onOpenDeal} />)}
                  </div>
                )}
            </>
          )}

          {/* ── anagrafica ────────────────────────────────────────────── */}
          {tab === "anagrafica" && (
            <>
              <CardHead title="Referente" />
              <Kv rows={[
                ["Nome", client.name],
                ["E-mail", <a href={`mailto:${client.email}`} style={{ color: "var(--q-lime-deep)" }}>{client.email}</a>],
                ["Telefono", <a href={`tel:${client.phone.replace(/\s/g, "")}`} style={{ color: "var(--q-lime-deep)" }}>{client.phone}</a>],
              ]} />

              <div style={{ marginTop: 22 }}>
                <CardHead title="Azienda" />
                <Kv rows={[
                  ["Ragione sociale", client.company],
                  ["Partita IVA", client.vat],
                  ["Settore", client.sector],
                  ["Dipendenti", num(client.employees)],
                  ["Sede", `${client.address} · ${client.city}`],
                  ["Sito", <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--q-lime-deep)" }}>{client.website}</a>],
                  ["Cliente dal", dateLabel(client.since)],
                  ["Referente interno", <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <AvatarOf id={client.owner} size={22} />{owner.name}
                  </span>],
                ]} />
              </div>

              {client.notes && (
                <div style={{
                  marginTop: 20, padding: 14, borderRadius: "var(--q-r-sm)",
                  background: "var(--q-lime-2)",
                }}>
                  <span className="q-eyebrow" style={{ display: "block", marginBottom: 6 }}>Da sapere</span>
                  <p className="q-small" style={{ color: "var(--q-ink-muted)" }}>{client.notes}</p>
                </div>
              )}
            </>
          )}

          {/* ── trattative ────────────────────────────────────────────── */}
          {tab === "trattative" && (
            mine.length === 0
              ? <Empty>Nessuna trattativa registrata.</Empty>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mine.map(d => (
                    <button key={d.id} type="button"
                      onClick={() => onOpenDeal(d.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, width: "100%",
                        textAlign: "left", padding: "12px 13px",
                        borderRadius: "var(--q-r-sm)", background: "var(--q-sheet-2)",
                        /* la stessa che ha aperto il pannello, riconoscibile
                           anche qui: altrimenti «Attività» e «Trattative»
                           raccontano due storie che non si toccano mai */
                        ...(d.id === focusDealId
                          ? { boxShadow: "inset 0 0 0 1.5px var(--q-lav-deep)" }
                          : {}),
                      }}>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span className="q-h3" style={{ display: "block" }}>{d.title}</span>
                        <span className="q-micro" style={{ display: "block", marginTop: 3 }}>
                          {d.id} · chiusura attesa {dateLabel(d.expectedClose)}
                        </span>
                      </span>
                      <span style={{ textAlign: "right", flexShrink: 0 }}>
                        <span className="q-h3 q-num" style={{ display: "block" }}>{eur(d.value)}</span>
                        <span style={{ display: "block", marginTop: 4 }}><StageChip id={d.stage} /></span>
                      </span>
                    </button>
                  ))}
                </div>
              )
          )}
        </div>
      </motion.aside>
    </>
  )
}

/* ── un evento della cronologia ────────────────────────────────────────── */
function Event({ ev, onOpenDeal }: { ev: Activity; onOpenDeal: (id: string) => void }) {
  const future = isFuture(ev.at)
  const by = repById(ev.by)
  return (
    <div className={`q-ev${future ? " is-future" : ""}`}>
      <span className="q-ev-dot">
        <Ico n={ACTIVITY_ICON[ev.kind]} size={12} />
      </span>

      <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
        <span className="q-h3">{ev.title}</span>
        {future && (
          <span className="q-chip" style={{ background: "var(--q-lime-2)", color: "var(--q-lime-deep)", height: 20 }}>
            in programma
          </span>
        )}
      </div>

      <div className="q-ev-when" style={{ marginTop: 3 }}>
        {dateLabel(ev.at)}{timeLabel(ev.at) && ` · ${timeLabel(ev.at)}`}
        {" · "}{relativeDay(ev.at)}
        {" · "}{by.name}
        {ev.durationMin ? ` · ${ev.durationMin} min` : ""}
      </div>

      {ev.body && <p className="q-ev-body">{ev.body}</p>}

      {ev.kind === "stato" && ev.from && ev.to && (
        <p className="q-ev-body" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StageChip id={ev.from} />
          <Ico n="move" size={12} />
          <StageChip id={ev.to} />
        </p>
      )}

      {ev.fileName && (
        <span className="q-file">
          <Ico n="doc" size={13} />
          {ev.fileName}
          <span className="q-micro">{ev.fileSize}</span>
        </span>
      )}

      {ev.dealId && (
        <button type="button" className="q-micro"
          style={{ marginTop: 7, color: "var(--q-lime-deep)", fontWeight: 500 }}
          onClick={() => onOpenDeal(ev.dealId!)}>
          {ev.dealId} →
        </button>
      )}
    </div>
  )
}

export { KIND_LABEL }
