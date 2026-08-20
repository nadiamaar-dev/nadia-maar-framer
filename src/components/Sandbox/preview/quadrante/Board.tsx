import React, { useCallback, useEffect, useRef, useState } from "react"
import type { Deal, StageId } from "./types"
import {
  STAGES, dealsInStage, eur, eurShort, isLate, isStale, num, relativeDay, repById,
} from "./data"
import { AvatarOf, Ico, PriorityBar } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   BOARD — la pipeline come la si guarda davvero

   Il trascinamento è scritto a mano sui Pointer Events invece di montare una
   libreria: una dipendenza di 30 kB per cinque colonne è un cattivo affare, e
   soprattutto le librerie di DnD più diffuse o non reggono il touch o lo
   reggono con un secondo backend da configurare. Un solo tipo di evento
   copre mouse, dito e penna.

   Tre proprietà che rendono il gesto tollerabile:

   · SOGLIA. Il trascinamento comincia dopo 5 px di movimento, non al
     pointerdown: senza, ogni clic per aprire una scheda diventava un
     micro-trascinamento e la scheda non si apriva mai.
   · COPIA. Sotto il dito si muove un clone in position:fixed con
     pointer-events:none; l'originale resta al suo posto sbiadito. Muovere
     l'elemento vero significherebbe farlo uscire dal flusso e far collassare
     la colonna sotto le dita.
   · BERSAGLIO REALE. La colonna sotto il puntatore si trova con
     elementFromPoint, non con onDragOver: funziona identico col dito, dove
     gli eventi di drag HTML5 non esistono proprio.

   Chi non usa il puntatore non resta fuori: ogni scheda ha un menu «Sposta»
   raggiungibile da tastiera che fa la stessa cosa.
══════════════════════════════════════════════════════════════════════════ */

type DragState = {
  deal: Deal
  /** scarto fra il puntatore e l'angolo della scheda: senza, la copia salta
      sotto il dito invece di restare dov'era stata presa */
  dx: number
  dy: number
  x: number
  y: number
  w: number
  over: StageId | null
}

const START_THRESHOLD = 5

export default function Board({ deals, onMove, onOpen }: {
  deals: Deal[]
  onMove: (dealId: string, to: StageId) => void
  onOpen: (dealId: string) => void
}) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  /* il menu «Sposta» aperto: id della scheda, o null */
  const [moveMenu, setMoveMenu] = useState<string | null>(null)

  /* Il gesto in corso vive in un ref, non nello stato: i gestori sono
     registrati una volta sola e devono leggere il valore aggiornato senza
     rimontarsi a ogni pixel di movimento. */
  const gesture = useRef<{
    id: string
    startX: number
    startY: number
    active: boolean
    pointerId: number
  } | null>(null)

  const stageUnder = (x: number, y: number): StageId | null => {
    const el = document.elementFromPoint(x, y)
    const col = el?.closest<HTMLElement>("[data-stage]")
    return (col?.dataset.stage as StageId | undefined) ?? null
  }

  const onPointerDown = (e: React.PointerEvent, deal: Deal) => {
    /* un clic partito da un pulsante è del pulsante, non della scheda */
    if ((e.target as HTMLElement).closest("button[data-no-drag]")) return
    if (e.button !== 0 && e.pointerType === "mouse") return

    const card = e.currentTarget as HTMLElement
    const r = card.getBoundingClientRect()
    gesture.current = {
      id: deal.id, startX: e.clientX, startY: e.clientY,
      active: false, pointerId: e.pointerId,
    }
    /* la cattura tiene gli eventi su questa scheda anche quando il dito esce
       dai suoi confini — cioè sempre, appena si trascina */
    card.setPointerCapture(e.pointerId)

    setDrag(null)
    /* si prepara il possibile trascinamento senza ancora attivarlo */
    pending.current = {
      deal,
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      w: r.width,
    }
  }

  const pending = useRef<{ deal: Deal; dx: number; dy: number; w: number } | null>(null)

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current
    const p = pending.current
    if (!g || !p || g.pointerId !== e.pointerId) return

    if (!g.active) {
      const moved = Math.hypot(e.clientX - g.startX, e.clientY - g.startY)
      if (moved < START_THRESHOLD) return
      g.active = true
    }

    /* da qui il gesto è nostro: niente selezione del testo né scorrimento */
    e.preventDefault()
    setDrag({
      deal: p.deal, dx: p.dx, dy: p.dy, w: p.w,
      x: e.clientX, y: e.clientY,
      over: stageUnder(e.clientX, e.clientY),
    })
    autoScroll(e.clientX)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current
    if (!g || g.pointerId !== e.pointerId) return
    const wasActive = g.active
    const id = g.id
    const over = wasActive ? stageUnder(e.clientX, e.clientY) : null

    gesture.current = null
    pending.current = null
    setDrag(null)

    if (!wasActive) { onOpen(id); return }
    if (!over) return
    const deal = deals.find(x => x.id === id)
    if (deal && deal.stage !== over) onMove(id, over)
  }

  const onPointerCancel = () => {
    gesture.current = null
    pending.current = null
    setDrag(null)
  }

  /* Il board scorre di lato quando il dito arriva al bordo: senza, le colonne
     fuori vista sono irraggiungibili proprio mentre servono. */
  const autoScroll = useCallback((clientX: number) => {
    const el = boardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const EDGE = 72
    if (clientX < r.left + EDGE) el.scrollLeft -= 14
    else if (clientX > r.right - EDGE) el.scrollLeft += 14
  }, [])

  /* Escape annulla il trascinamento in corso, come ovunque. */
  useEffect(() => {
    if (!drag) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return
      ev.stopPropagation()
      onPointerCancel()
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [drag])

  return (
    <>
      <div className="q-board" ref={boardRef}>
        {[...STAGES].sort((a, b) => a.order - b.order).map(stage => {
          const list = dealsInStage(deals, stage.id)
          const total = list.reduce((a, x) => a + x.value, 0)
          const over = drag?.over === stage.id && drag.deal.stage !== stage.id
          return (
            <section
              key={stage.id}
              data-stage={stage.id}
              className={`q-col${over ? " is-over" : ""}`}
              aria-label={`${stage.title}, ${list.length} trattative`}
            >
              <header className="q-col-head">
                <span className="q-col-dot" style={{ background: stage.color }} />
                <span className="q-h3" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {stage.title}
                </span>
                <span className="q-col-count q-num">{list.length}</span>
              </header>

              <div className="q-col-body">
                {list.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    dim={drag?.deal.id === deal.id}
                    menuOpen={moveMenu === deal.id}
                    onMenu={() => setMoveMenu(m => (m === deal.id ? null : deal.id))}
                    onMoveTo={to => { setMoveMenu(null); onMove(deal.id, to) }}
                    onPointerDown={e => onPointerDown(e, deal)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerCancel}
                  />
                ))}
                {list.length === 0 && (
                  <p className="q-micro" style={{ padding: "14px 2px", textAlign: "center" }}>
                    {over ? "Rilascia qui" : "Nessuna trattativa"}
                  </p>
                )}
              </div>

              <div className="q-col-foot">
                {eurShort(total)}{list.length > 0 && ` · ${num(Math.round(stage.probability * 100))} % di probabilità`}
              </div>
            </section>
          )
        })}
      </div>

      {/* la copia che segue il puntatore */}
      {drag && (
        <div
          className="q-deal q-deal-drag"
          style={{ left: drag.x - drag.dx, top: drag.y - drag.dy, width: drag.w }}
          aria-hidden
        >
          <PriorityBar p={drag.deal.priority} />
          <DealBody deal={drag.deal} />
        </div>
      )}
    </>
  )
}

/* ── una scheda ────────────────────────────────────────────────────────── */
function DealCard({
  deal, dim, menuOpen, onMenu, onMoveTo,
  onPointerDown, onPointerMove, onPointerUp, onPointerCancel,
}: {
  deal: Deal
  dim: boolean
  menuOpen: boolean
  onMenu: () => void
  onMoveTo: (to: StageId) => void
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerCancel: () => void
}) {
  return (
    <div style={{ position: "relative" }}>
      <div
        className={`q-deal${dim ? " is-ghost" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <PriorityBar p={deal.priority} />
        <DealBody deal={deal} onMenu={onMenu} menuOpen={menuOpen} />
      </div>

      {menuOpen && (
        <div className="q-pop" style={{ top: "calc(100% - 4px)", right: 6, minWidth: 210 }} role="menu">
          <div className="q-pop-head">
            <span className="q-eyebrow">Sposta in</span>
          </div>
          <div className="q-pop-body">
            {STAGES.filter(s => s.id !== deal.stage).map(s => (
              <button key={s.id} type="button" className="q-pop-item" role="menuitem"
                onClick={() => onMoveTo(s.id)}>
                <span className="q-col-dot" style={{ background: s.color }} />
                {s.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DealBody({ deal, onMenu, menuOpen }: {
  deal: Deal
  onMenu?: () => void
  menuOpen?: boolean
}) {
  const late = isLate(deal)
  const stale = isStale(deal)
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span className="q-deal-title" style={{ flex: 1 }}>{deal.title}</span>
        {onMenu && (
          <button
            type="button"
            data-no-drag
            className="q-icon-btn"
            style={{ width: 24, height: 24, background: "transparent" }}
            aria-label={`Sposta ${deal.title}`}
            aria-expanded={!!menuOpen}
            onClick={e => { e.stopPropagation(); onMenu() }}
          >
            <Ico n="move" size={13} />
          </button>
        )}
      </div>

      <p className="q-micro" style={{
        marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {deal.company}
      </p>

      <div className="q-deal-foot">
        <span className="q-deal-value">{eur(deal.value)}</span>
        {late && (
          <span className="q-flag" title={`In ritardo: chiusura attesa ${relativeDay(deal.expectedClose)}`} />
        )}
        {!late && stale && (
          <span className="q-micro" title="Nessun movimento da oltre due settimane" style={{ color: "var(--q-warn)" }}>
            ferma
          </span>
        )}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <AvatarOf id={deal.assignedTo} size={22} />
        </span>
      </div>
    </div>
  )
}

export { repById }
