import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  vectors, addonGroups, canvasBands, GROUP_COLOR,
  baseFor, addonsOf, vectorById, buildBlueprint, complexityOf,
  type Blueprint, type GroupId, type Item, type VectorId,
} from "./modules"
import { downloadRoadmapPdf, printRoadmap } from "./roadmap"
import { useFoundryStore, type Step } from "./store"
import { useLocale } from "../../lib/i18n/LocaleContext"
import { firstTouch, sessionId, trackEvent } from "../../lib/measure"
import { DATE_TAG, useT } from "../../lib/i18n/t"
import { CONFIGURATOR_STR } from "../../lib/i18n/strings/configurator"

/* ══════════════════════════════════════════════════════════════════════════
   DIGITAL FOUNDRY — SOLUTION ARCHITECT
   Configuratore a 4 passi: vettore → funzionalità base → moduli aggiuntivi
   → blueprint. Ogni scelta si materializza sul canvas "Architettura // Live".
   Nessun prezzo, nessun carrello: l'esito è testo, roadmap stampabile e invio.
══════════════════════════════════════════════════════════════════════════ */

const T = { border: "rgba(70,90,108,0.22)", text: "#FFFFFF", accentLt: "#F53E56", green: "#10B981" } as const
const G = {
  bg:     "rgba(70,90,108,0.09)",
  bd:     "rgba(70,90,108,0.28)",
  blur:   "blur(12px) brightness(1.05) saturate(1.0)",
  shadow: "inset 0 1px 0 rgba(255,255,255,0.63), 0 24px 64px rgba(8,12,28,0.55), 0 4px 14px rgba(8,12,28,0.35)",
} as const

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
const MONO    = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
const SANS    = "'Geist', 'Space Grotesk', system-ui, sans-serif"
const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"
const WRAP: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" }
const SEC: React.CSSProperties  = { padding: "80px 0", position: "relative" }

/** I numeri dei passi. Le etichette arrivano dal dizionario, nell'ordine. */
const STEP_NS: Step[] = [1, 2, 3, 4]

/** Stessa sorgente di verità della media query: niente divergenze a zoom frazionari. */
function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const fn = () => setMatch(mq.matches)
    fn()
    mq.addEventListener("change", fn)
    return () => mq.removeEventListener("change", fn)
  }, [query])
  return match
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: reduce ? 0.2 : 0.7, delay: reduce ? 0 : delay, ease }}
    >{children}</motion.div>
  )
}

function PingDot({ color = T.green, size = 7 }: { color?: string; size?: number }) {
  const reduce = useReducedMotion()
  return (
    <span style={{ position: "relative", display: "inline-flex", width: size, height: size, flexShrink: 0 }}>
      {!reduce && (
        <motion.span aria-hidden
          style={{ position: "absolute", inset: -2, borderRadius: "50%", background: color, opacity: 0.55 }}
          animate={{ scale: [1, 3], opacity: [0.55, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span style={{ width: "100%", height: "100%", borderRadius: "50%", background: color, display: "block", position: "relative" }} />
    </span>
  )
}

const IconPlus = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconCheck = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/* ══════════════════════════════════════════════════════════════════════════
   STEPPER
══════════════════════════════════════════════════════════════════════════ */
function Stepper() {
  const t = useT(CONFIGURATOR_STR)
  const step    = useFoundryStore(s => s.step)
  const vector  = useFoundryStore(s => s.vector)
  const setStep = useFoundryStore(s => s.setStep)

  return (
    <div className="fc-stepper" role="group" aria-label={t.stepperLabel}>
      {STEP_NS.map((n, i) => {
        const state = n === step ? "on" : n < step ? "done" : "off"
        const reachable = n === 1 || (Boolean(vector) && n <= Math.max(step, 2))
        return (
          <button
            key={n} className={`fc-step is-${state}`} disabled={!reachable}
            onClick={() => reachable && setStep(n)}
            aria-current={n === step ? "step" : undefined}
          >
            <span className="fc-step-n">{state === "done" ? "✓" : `0${n}`}</span>
            <span className="fc-step-l">{t.steps[i]}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PASSO 1 — vettore principale
══════════════════════════════════════════════════════════════════════════ */
function StepVector() {
  const t = useT(CONFIGURATOR_STR)
  const { locale } = useLocale()
  const vector = useFoundryStore(s => s.vector)
  const pick   = useFoundryStore(s => s.pickVector)
  return (
    <>
      <p className="fc-step-hint">{t.hints.vector}</p>
      <div className="fc-list">
        {vectors(locale).map(v => {
          const on = vector === v.id
          return (
            <motion.button key={v.id} className={`fc-card${on ? " is-on" : ""}`} onClick={() => pick(v.id)}
              aria-pressed={on} whileTap={{ scale: 0.985 }} transition={{ duration: 0.18, ease }}>
              <span className={`fc-card-ic${on ? " is-on" : ""}`} aria-hidden>{on ? IconCheck : IconPlus}</span>
              <span style={{ minWidth: 0 }}>
                <span className="fc-card-t">{v.label}</span>
                <span className="fc-card-b">{v.focus}</span>
              </span>
            </motion.button>
          )
        })}
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PASSO 2 / 3 — elenco di moduli selezionabili
══════════════════════════════════════════════════════════════════════════ */
function ItemList({ items }: { items: Item[] }) {
  const selected = useFoundryStore(s => s.selected)
  const toggle   = useFoundryStore(s => s.toggle)
  return (
    <div className="fc-list">
      {items.map(it => {
        const on = selected.includes(it.id)
        return (
          <motion.button key={it.id} className={`fc-card${on ? " is-on" : ""}`} onClick={() => toggle(it.id)}
            aria-pressed={on} whileTap={{ scale: 0.985 }} transition={{ duration: 0.18, ease }}>
            <span className={`fc-card-ic${on ? " is-on" : ""}`} aria-hidden>{on ? IconCheck : IconPlus}</span>
            <span style={{ minWidth: 0 }}>
              <span className="fc-card-t">{it.label}</span>
              <span className="fc-card-b">{it.plain}</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

function StepBase() {
  const t = useT(CONFIGURATOR_STR)
  const { locale } = useLocale()
  const vector = useFoundryStore(s => s.vector)
  const items  = baseFor(vector, locale)
  const v      = vectorById(vector, locale)

  /* La frase contiene il nome della direzione in grassetto: si spezza sul
     segnaposto invece di concatenare due pezzi, così in inglese il nome può
     cadere in un altro punto della frase. */
  const [before, after] = t.hints.base.split("{vector}")
  return (
    <>
      <p className="fc-step-hint">
        {before}<strong>{v?.label ?? "—"}</strong>{after}
      </p>
      <ItemList items={items} />
    </>
  )
}

/** Selettore a tendina delle famiglie di moduli: le etichette sono lunghe e la
    colonna è stretta, una fila di tab si troncherebbe senza preavviso. */
function GroupSelect() {
  const { locale } = useLocale()
  const ADDON_GROUPS = addonGroups(locale)
  const active   = useFoundryStore(s => s.activeGroup) as GroupId
  const setGroup = useFoundryStore(s => s.setActiveGroup)
  const selected = useFoundryStore(s => s.selected)

  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const idx = Math.max(0, ADDON_GROUPS.findIndex(g => g.id === active))
  const current = ADDON_GROUPS[idx]
  const countOf = (g: GroupId) => addonsOf(g, locale).filter(i => selected.includes(i.id)).length

  useEffect(() => {
    if (!open) return
    setCursor(idx)
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open, idx])

  useEffect(() => { if (open) listRef.current?.focus() }, [open])

  const commit = (i: number) => { setGroup(ADDON_GROUPS[i].id); setOpen(false) }

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); return }
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => (c + 1) % ADDON_GROUPS.length); return }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => (c - 1 + ADDON_GROUPS.length) % ADDON_GROUPS.length); return }
    if (e.key === "Home")      { e.preventDefault(); setCursor(0); return }
    if (e.key === "End")       { e.preventDefault(); setCursor(ADDON_GROUPS.length - 1); return }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); commit(cursor) }
  }

  return (
    <div className="fc-sel" ref={rootRef}>
      <button
        className={`fc-sel-btn${open ? " is-open" : ""}`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => {
          if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true) }
        }}
        aria-haspopup="listbox" aria-expanded={open}
      >
        <span aria-hidden className="fc-sel-dot" style={{ background: GROUP_COLOR[current.id] }} />
        <span className="fc-sel-lab">{current.label}</span>
        {countOf(current.id) > 0 && <span className="fc-tab-n">{countOf(current.id)}</span>}
        <motion.span className="fc-sel-arrow" aria-hidden animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22, ease }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef} className="fc-sel-list" role="listbox" tabIndex={-1}
            aria-activedescendant={`fc-opt-${ADDON_GROUPS[cursor].id}`} onKeyDown={onListKey}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease }}
          >
            {ADDON_GROUPS.map((g, i) => {
              const n = countOf(g.id)
              return (
                <li
                  key={g.id} id={`fc-opt-${g.id}`} role="option" aria-selected={g.id === active}
                  className={`fc-sel-opt${i === cursor ? " is-cursor" : ""}${g.id === active ? " is-on" : ""}`}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => commit(i)}
                >
                  <span aria-hidden className="fc-sel-dot" style={{ background: GROUP_COLOR[g.id] }} />
                  <span style={{ minWidth: 0 }}>
                    <span className="fc-sel-opt-l">{g.label}</span>
                    <span className="fc-sel-opt-s">{g.sub}</span>
                  </span>
                  {n > 0 && <span className="fc-tab-n">{n}</span>}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function StepAddons() {
  const t = useT(CONFIGURATOR_STR)
  const { locale } = useLocale()
  const groups = addonGroups(locale)
  const active = useFoundryStore(s => s.activeGroup) as GroupId
  const group  = groups.find(g => g.id === active) ?? groups[0]

  return (
    <>
      <p className="fc-step-hint">{t.hints.addons}</p>
      <GroupSelect />
      <div className="fc-cat-hint">{group.sub}</div>
      <ItemList items={addonsOf(group.id, locale)} />
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PASSO 4 — indice di complessità + azioni
══════════════════════════════════════════════════════════════════════════ */
/* Il PDF nasce nel browser: pdf-lib viene scaricata solo al primo click, per
   questo serve uno stato di attesa invece di un download istantaneo. Se il
   modulo non arriva — rete che cade, deploy in corso — si ripiega sulla
   finestra di stampa: meglio due clic in più che restare a mani vuote. */
function useRoadmapPdf(bp: Blueprint | null) {
  const { locale } = useLocale()
  const [busy, setBusy] = useState(false)
  const run = useCallback(async () => {
    if (!bp || busy) return
    setBusy(true)
    const date = new Date().toLocaleDateString(DATE_TAG[locale], { day: "2-digit", month: "long", year: "numeric" })
    try {
      await downloadRoadmapPdf(bp, date, locale)
      trackEvent("blueprint_pdf", { vector: bp.vector.id })
    } catch (err) {
      console.error("[foundry] PDF non generato, ripiego sulla stampa:", err)
      printRoadmap(bp, date, locale)
    } finally {
      setBusy(false)
    }
  }, [bp, busy, locale])
  return { busy, run }
}

function StepActions() {
  const t = useT(CONFIGURATOR_STR)
  const { locale } = useLocale()
  const vector    = useFoundryStore(s => s.vector)
  const selected  = useFoundryStore(s => s.selected)
  const openModal = useFoundryStore(s => s.openModal)
  const cx        = complexityOf(vector, selected, locale)
  const actionsRef = useRef<HTMLDivElement>(null)

  /* Il pulsante di contatto fisso del sito sta bottom-right e coprirebbe i CTA:
     lo nascondiamo finché questa barra è a schermo (z-index non basta: il
     contenuto della pagina vive in uno stacking context a zIndex:1). */
  useEffect(() => {
    const el = actionsRef.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      ([e]) => { document.body.dataset.fcCta = e.isIntersecting ? "1" : "0" },
      { rootMargin: "0px 0px -8% 0px" },
    )
    io.observe(el)
    return () => { io.disconnect(); delete document.body.dataset.fcCta }
  }, [])

  const bp = useMemo(() => buildBlueprint(vector, selected, locale), [vector, selected, locale])
  const pdf = useRoadmapPdf(bp)

  if (!cx) return null

  return (
    <>
      <p className="fc-step-hint">{t.hints.actions}</p>

      <div className="fc-cx">
        <div className="fc-cx-row">
          <div>
            <div className="fc-cx-k">{t.complexity.label}</div>
            <div className="fc-cx-v">{cx.label}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="fc-cx-k">{t.complexity.duration}</div>
            <div className="fc-cx-v">{cx.weeks}</div>
          </div>
        </div>
        <div className="fc-cx-bar" aria-hidden>
          {[1, 2, 3, 4].map(i => (
            <motion.span key={i} className={`fc-cx-seg${i <= cx.level ? " is-on" : ""}`}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4, delay: i * 0.06, ease }} />
          ))}
        </div>
        <p className="fc-cx-note">{cx.note}</p>
      </div>

      <div className="fc-actions" ref={actionsRef}>
        <motion.button className="fc-cta" onClick={openModal}
          whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
          <span className="fc-cta-ix">[→]</span>
          <span className="fc-cta-tx">{t.actions.cta} <span style={{ fontSize: 14 }}>→</span></span>
        </motion.button>
        <motion.button className="fc-ghost fc-ghost-wide" onClick={pdf.run} disabled={pdf.busy} whileTap={{ scale: 0.98 }}>
          {pdf.busy ? t.actions.pdfBusy : t.actions.pdf}
        </motion.button>
      </div>

      <p className="fc-actions-note">{t.actions.note}</p>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PANNELLO DI SINISTRA — passo corrente + navigazione
══════════════════════════════════════════════════════════════════════════ */
function StepPanel() {
  const t = useT(CONFIGURATOR_STR)
  const step   = useFoundryStore(s => s.step)
  const vector = useFoundryStore(s => s.vector)
  const next   = useFoundryStore(s => s.next)
  const back   = useFoundryStore(s => s.back)
  const reset  = useFoundryStore(s => s.reset)

  const canNext = step < 4 && (step === 1 ? Boolean(vector) : true)
  const nextLabel = step === 3 ? t.nav.seeBlueprint : t.nav.next

  return (
    <div className="fc-panel">
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.32, ease }}
        >
          {step === 1 && <StepVector />}
          {step === 2 && <StepBase />}
          {step === 3 && <StepAddons />}
          {step === 4 && <StepActions />}
        </motion.div>
      </AnimatePresence>

      <div className="fc-nav">
        {step > 1
          ? <button className="fc-nav-b" onClick={back}>{t.nav.back}</button>
          : <span />}
        {canNext
          ? <button className="fc-nav-b is-next" onClick={next} disabled={!canNext}>{nextLabel} →</button>
          : step === 4
            ? <button className="fc-nav-b" onClick={reset}>{t.nav.restart}</button>
            : <span className="fc-nav-hint">{t.nav.pickFirst}</span>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   CANVAS — architettura che si assembla dal vivo
   Desktop: nodi su livelli, collegati a una dorsale verticale (SVG).
   Mobile: stessi dati su un binario verticale (solo CSS, nessuna misura).
══════════════════════════════════════════════════════════════════════════ */
type Wire = { key: string; d: string; color: string }
type Junction = { x: number; y: number; color: string }

/** Offset cumulato risalendo la catena di offsetParent fino a `root`.
    offsetLeft/offsetTop ignorano i transform, quindi le misure restano
    corrette anche mentre i nodi stanno animando l'ingresso. */
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let x = 0, y = 0
  let cur: HTMLElement | null = el
  while (cur && cur !== root) {
    x += cur.offsetLeft
    y += cur.offsetTop
    cur = cur.offsetParent as HTMLElement | null
  }
  if (!cur) return null // catena interrotta: meglio non disegnare che disegnare storto
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

function Canvas({ mobile }: { mobile: boolean }) {
  const reduce   = useReducedMotion()
  const vectorId = useFoundryStore(s => s.vector)
  const selected = useFoundryStore(s => s.selected)
  const toggle   = useFoundryStore(s => s.toggle)
  const t        = useT(CONFIGURATOR_STR)
  const { locale } = useLocale()
  const vector   = vectorById(vectorId, locale)

  const boxRef   = useRef<HTMLDivElement>(null)
  const coreRef  = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>())
  const [wires, setWires] = useState<Wire[]>([])
  const [junctions, setJunctions] = useState<Junction[]>([])
  const [spine, setSpine] = useState<{ x: number; y1: number; y2: number } | null>(null)
  const [tick, setTick] = useState(0)

  const bands = useMemo(
    () => canvasBands(locale)
      .map(b => ({ band: b, items: (b.id === "base" ? baseFor(vectorId, locale) : addonsOf(b.id, locale)).filter(i => selected.includes(i.id)) }))
      .filter(b => b.items.length > 0),
    [vectorId, selected, locale],
  )
  const key = `${vectorId}|${selected.join(",")}`

  const recompute = useCallback(() => {
    const box = boxRef.current
    if (!box || mobile || !coreRef.current) { setWires([]); setJunctions([]); setSpine(null); return }
    const core = offsetWithin(coreRef.current, box)
    if (!core) return

    const spineX = Math.round(core.x + core.w / 2)
    const ws: Wire[] = []
    const js: Junction[] = []
    let maxY = core.y + core.h

    bands.forEach(({ band, items }) => {
      const pts = items
        .map(i => ({ i, el: nodeRefs.current.get(i.id) }))
        .filter((p): p is { i: Item; el: HTMLButtonElement } => Boolean(p.el))
        .map(({ i, el }) => ({ i, m: offsetWithin(el, box) }))
        .filter((p): p is { i: Item; m: NonNullable<ReturnType<typeof offsetWithin>> } => Boolean(p.m))
      if (!pts.length) return

      const color = GROUP_COLOR[band.id]
      const jy = Math.round(pts.reduce((a, p) => a + p.m.y + p.m.h / 2, 0) / pts.length)
      js.push({ x: spineX, y: jy, color })
      maxY = Math.max(maxY, jy)

      pts.forEach(p => {
        const cx = p.m.x + p.m.w / 2
        const cy = p.m.y + p.m.h / 2
        const dx = cx - spineX
        if (Math.abs(dx) < 52) return // nodo già sulla dorsale
        const sx = dx > 0 ? p.m.x : p.m.x + p.m.w
        const mx = Math.round((sx + spineX) / 2)
        ws.push({ key: p.i.id, d: `M ${sx} ${cy} C ${mx} ${cy}, ${mx} ${jy}, ${spineX} ${jy}`, color })
      })
    })

    setWires(ws)
    setJunctions(js)
    setSpine(js.length ? { x: spineX, y1: core.y + core.h, y2: maxY } : null)
  }, [bands, mobile])

  useLayoutEffect(() => { recompute() }, [recompute, key, tick])

  useEffect(() => {
    const box = boxRef.current
    if (!box || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => recompute())
    ro.observe(box)
    const d = document as Document & { fonts?: FontFaceSet }
    d.fonts?.ready.then(() => recompute()).catch(() => {})
    return () => ro.disconnect()
  }, [recompute])

  const count = selected.length

  return (
    <div ref={boxRef} className={`fc-canvas${mobile ? " is-mobile" : ""}${vector ? "" : " is-empty"}`}>
      <div className="fc-cv-head">
        <span className="fc-cv-tag">
          {vector ? <PingDot color={T.green} size={6} />
                  : <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.35)", flexShrink: 0 }} />}
          {t.canvas.tag}
        </span>
        <span className="fc-cv-count">{count} {count === 1 ? t.canvas.moduleOne : t.canvas.moduleMany}</span>
      </div>

      {!mobile && (
        <svg className="fc-svg" aria-hidden>
          {spine && (
            <motion.line x1={spine.x} x2={spine.x} y1={spine.y1} y2={spine.y2}
              stroke="rgba(255,255,255,0.20)" strokeWidth="1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease }} />
          )}
          {wires.map(w => (
            <g key={w.key}>
              <motion.path d={w.d} fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.65, ease }} />
              {!reduce && (
                <path className="fc-dash" d={w.d} fill="none" stroke={w.color} strokeWidth="1.4" strokeDasharray="3 16" opacity="0.55" />
              )}
            </g>
          ))}
          {/* r resta un attributo statico e l'ingresso è animato sull'opacità
              del <g>: animare la geometria di un <circle> (r, o scale che
              framer-motion traduce in r) è la via breve per un r="undefined". */}
          {junctions.map((j, i) => (
            <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease }}>
              <circle cx={j.x} cy={j.y} r={3} fill={j.color} />
            </motion.g>
          ))}
        </svg>
      )}

      <div className="fc-bands">
        <AnimatePresence>
          {vector && (
            <motion.div key="core" ref={coreRef} className="fc-core-wrap"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.94 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.45, ease }}
            >
              <div className="fc-core">
                <span className="fc-core-tag"><PingDot color={T.green} size={5} />NM // Core</span>
                <span className="fc-core-n">{vector.node}</span>
                <span className="fc-core-s">{vector.stack}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence onExitComplete={() => setTick(v => v + 1)}>
          {bands.map(({ band, items }) => (
            <motion.div key={band.id} className="fc-band" layout={!reduce}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease }}
            >
              <div className="fc-band-label">
                <span style={{ color: GROUP_COLOR[band.id] }}>{band.label}</span>
                <span className="fc-band-sub">{band.sub}</span>
              </div>
              <div className="fc-band-row">
                <AnimatePresence>
                  {items.map(i => (
                    <motion.button key={i.id}
                      ref={el => { if (el) nodeRefs.current.set(i.id, el); else nodeRefs.current.delete(i.id) }}
                      className="fc-node" style={{ borderColor: `${GROUP_COLOR[band.id]}52` }}
                      onClick={() => toggle(i.id)} aria-label={t.canvas.removeModule.replace("{node}", i.node)} title={t.canvas.remove}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.82, y: 10 }}
                      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: reduce ? 1 : 0.9, transition: { duration: 0.16 } }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: GROUP_COLOR[band.id], boxShadow: `0 0 8px ${GROUP_COLOR[band.id]}66` }} />
                      {i.node}
                      <span className="fc-node-x" aria-hidden>×</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!vector && (
          <motion.div className="fc-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <span className="fc-empty-badge">{t.canvas.waiting}</span>
            <span className="fc-empty-hint">{t.canvas.waitingHint}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   RESOCONTO — blueprint testuale a scaffali
══════════════════════════════════════════════════════════════════════════ */
function BlueprintPanel() {
  const vector   = useFoundryStore(s => s.vector)
  const selected = useFoundryStore(s => s.selected)
  const t        = useT(CONFIGURATOR_STR)
  const { locale } = useLocale()
  const bp       = useMemo(() => buildBlueprint(vector, selected, locale), [vector, selected, locale])

  return (
    <div className="fc-summary" aria-live="polite">
      <span className="fc-cv-tag" style={{ letterSpacing: "0.2em" }}>{t.summary.tag}</span>

      {!bp ? (
        <p className="fc-sum-empty">{t.summary.empty}</p>
      ) : (
        <motion.div className="fc-shelves" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }}>
          <div className="fc-shelf">
            <div className="fc-shelf-label"><span style={{ color: T.accentLt }}>//</span> {t.summary.goal}</div>
            <p className="fc-shelf-txt">{bp.obiettivo}</p>
          </div>
          <div className="fc-shelf">
            <div className="fc-shelf-label"><span style={{ color: T.accentLt }}>//</span> {t.summary.architecture}</div>
            <p className="fc-shelf-txt">{bp.architettura}</p>
          </div>

          {bp.scaffali.map(s => (
            <div className="fc-shelf fc-shelf-span" key={s.label}>
              <div className="fc-shelf-label">
                <span style={{ color: GROUP_COLOR[s.group] }}>//</span> [ {s.label} ]
              </div>
              <div className="fc-mod-list">
                <AnimatePresence initial={false}>
                  {s.righe.map(r => (
                    <motion.div key={r.node} className="fc-mod-line"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease }}>
                      <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 7, background: GROUP_COLOR[s.group] }} />
                      <span>
                        <span className="fc-mod-line-name">{r.node}</span>
                        <span className="fc-mod-line-tech">{r.tech}</span>
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   LEAD MODAL
══════════════════════════════════════════════════════════════════════════ */
function FInput({ label, placeholder, type = "text", value, onChange, required = false, inputRef }: {
  label: string; placeholder: string; type?: string; value: string
  onChange: (v: string) => void; required?: boolean; inputRef?: React.Ref<HTMLInputElement>
}) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ display: "block", fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: f ? T.accentLt : "rgba(255,255,255,0.72)", marginBottom: 8, transition: "color 0.2s" }}>
        {label}{!required && <span style={{ color: "rgba(255,255,255,0.45)", textTransform: "none", letterSpacing: "0.04em" }}>  · facoltativo</span>}
      </label>
      <input ref={inputRef} type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ width: "100%", padding: "14px 16px", background: f ? "rgba(255,60,92,0.07)" : "rgba(255,255,255,0.012)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${f ? "rgba(255,70,100,0.55)" : "rgba(255,255,255,0.13)"}`, borderRadius: 12, color: T.text, fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: SANS, boxShadow: f ? "0 0 0 3px rgba(255,60,92,0.11), inset 0 1px 0 rgba(255,255,255,0.09)" : "inset 0 1px 0 rgba(255,255,255,0.012)", transition: "background 0.22s, border-color 0.22s, box-shadow 0.22s" }} />
    </div>
  )
}

function LeadModal() {
  const tCfg          = useT(CONFIGURATOR_STR)
  const t             = tCfg.modal
  const { locale }    = useLocale()
  const vector        = useFoundryStore(s => s.vector)
  const selected      = useFoundryStore(s => s.selected)
  const closeModal    = useFoundryStore(s => s.closeModal)
  const leadStatus    = useFoundryStore(s => s.leadStatus)
  const setLeadStatus = useFoundryStore(s => s.setLeadStatus)
  const openSeq       = useFoundryStore(s => s.openSeq)

  const [name, setName]           = useState("")
  const [email, setEmail]         = useState("")
  const [messenger, setMessenger] = useState("")
  const [company, setCompany]     = useState("") // honeypot
  /* Parte da false: la copia al cliente oggi è spenta e si accende solo se il
     server risponde clientCopy:true. L'impostazione predefinita deve essere
     quella che non promette nulla — promettere un'email e non mandarla costa
     molto più che il contrario. Vale anche per l'invio simulato in locale. */
  const [copySent, setCopySent]   = useState(false)
  const nameRef  = useRef<HTMLInputElement>(null)
  const doneRef  = useRef<HTMLHeadingElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const coarse   = useMedia("(pointer: coarse)")
  const reduceMotion = useReducedMotion()

  const bp    = useMemo(() => buildBlueprint(vector, selected, locale), [vector, selected, locale])
  const items = useMemo(
    () => canvasBands(locale).flatMap(b => (b.id === "base" ? baseFor(vector, locale) : addonsOf(b.id, locale)).filter(i => selected.includes(i.id))),
    [vector, selected, locale],
  )

  /* il download non tocca la pagina, quindi il blocco di scroll del modale
     (body position:fixed) non interferisce e la conferma resta aperta */
  const pdf = useRoadmapPdf(bp)

  useEffect(() => {
    /* la tastiera software che si apre durante l'animazione d'ingresso fa
       saltare il modale: su touch niente autofocus */
    const t = coarse ? null : setTimeout(() => nameRef.current?.focus(), 60)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeModal(); return }
      if (e.key !== "Tab" || !panelRef.current) return
      const f = panelRef.current.querySelectorAll<HTMLElement>('button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])')
      const list = Array.from(f).filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null)
      if (!list.length) return
      const first = list[0], last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener("keydown", onKey)

    /* blocco di scroll compatibile con iOS: overflow:hidden su <html> lì non basta */
    const y = window.scrollY
    const b = document.body.style
    const prev = { position: b.position, top: b.top, width: b.width, overflow: b.overflow }
    b.position = "fixed"; b.top = `-${y}px`; b.width = "100%"; b.overflow = "hidden"

    /* alla chiusura il focus deve tornare al pulsante che ha aperto il modale,
       altrimenti chi naviga da tastiera riparte dall'inizio del documento */
    const opener = document.activeElement as HTMLElement | null

    return () => {
      if (t) clearTimeout(t)
      window.removeEventListener("keydown", onKey)
      b.position = prev.position; b.top = prev.top; b.width = prev.width; b.overflow = prev.overflow
      window.scrollTo(0, y)
      opener?.focus?.()
    }
  }, [closeModal, coarse])

  /* lo scambio form → conferma sostituisce il nodo che aveva il focus: senza
     questo, il focus cade sul <body> e lo screen reader non annuncia nulla */
  useEffect(() => {
    if (leadStatus === "sent") doneRef.current?.focus()
  }, [leadStatus])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (leadStatus === "sending") return
    setLeadStatus("sending")

    /* se il modale viene chiuso e riaperto durante l'invio, la risposta
       vecchia non deve sovrascrivere lo stato nuovo */
    const seq = openSeq
    const settle = (s: "sent" | "error") => {
      if (useFoundryStore.getState().openSeq === seq) setLeadStatus(s)
    }

    const payload = {
      contact: { name: name.trim(), email: email.trim(), messenger: messenger.trim() || null },
      company,
      vector: bp ? { id: bp.vector.id, label: bp.vector.label, node: bp.vector.node, stack: bp.vector.stack } : null,
      complexity: bp ? { label: bp.complexity.label, weeks: bp.complexity.weeks, level: bp.complexity.level } : null,
      modules: items.map(({ id, node, tech, group, label }) => ({ id, node, tech, group, label })),
      blueprint: bp ? { obiettivo: bp.obiettivo, architettura: bp.architettura, scaffali: bp.scaffali } : null,
      /* Il primo tocco della sessione (utm/referrer) viaggia col lead: è
         l'attribuzione — senza, non si sa mai quale canale ha portato la
         richiesta. La sessione lega il lead agli eventi della stessa
         visita in funnel_events. */
      meta: {
        page: typeof location !== "undefined" ? location.pathname : "/",
        locale,
        ts: new Date().toISOString(),
        session: sessionId(),
        touch: firstTouch(),
      },
    }

    /* In `vite dev` le funzioni Vercel non vengono servite: l'endpoint
       risponde 404. Solo quel caso (o un fallimento di rete) viene simulato,
       così l'interfaccia è provabile in locale; ogni altro stato HTTP resta
       un errore vero anche in sviluppo. */
    const simulate = async () => {
      console.info("[foundry] DEV — endpoint assente, invio simulato:", payload)
      await new Promise(res => setTimeout(res, 700))
      settle("sent")
    }

    let r: Response
    try {
      r = await fetch("/api/foundry-lead", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      })
    } catch {
      if (import.meta.env.DEV) await simulate()
      else settle("error")
      return
    }
    if (r.ok) {
      /* clientCopy:false = richiesta archiviata ma copia via email non partita
         (posta non configurata o invio fallito): non prometterla. */
      const body = await r.json().catch(() => null) as { clientCopy?: boolean } | null
      setCopySent(body?.clientCopy === true)
      trackEvent("lead_submit", { source: "configuratore", vector: bp?.vector.id ?? null })
      settle("sent")
    }
    else if (import.meta.env.DEV && r.status === 404) await simulate()
    else settle("error")
  }

  return createPortal(
    <motion.div className="fc-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}
      onClick={e => { if (e.target === e.currentTarget) closeModal() }}
    >
      <motion.div ref={panelRef} className="fc-modal" role="dialog" aria-modal="true" aria-labelledby="fc-modal-title"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.4, ease }}
      >
        <button className="fc-modal-x" onClick={closeModal} aria-label={t.close}>×</button>

        {leadStatus === "sent" ? (
          <div style={{ textAlign: "center", padding: "26px 4px 12px" }} role="status">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><PingDot color={T.green} size={12} /></div>
            <h3 id="fc-modal-title" ref={doneRef} tabIndex={-1} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: "#FFFFFF", margin: "0 0 12px", outline: "none" }}>
              {t.sentTitle}
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.7, color: "#FFFFFF", margin: "0 auto 22px", maxWidth: 390 }}>
              {t.sentBody}
              {copySent ? t.sentWithCopy : t.sentWithoutCopy}
            </p>
            {/* Il momento in cui la roadmap serve davvero è questo: ha appena
                lasciato i contatti ed è al massimo dell'interesse. Prima il
                pulsante viveva solo nella pagina dietro al modale, cioè fuori
                portata proprio adesso. */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {bp && (
                <motion.button className="fc-cta" onClick={pdf.run} disabled={pdf.busy}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                  <span className="fc-cta-ix">[↓]</span>
                  <span className="fc-cta-tx">{pdf.busy ? tCfg.actions.pdfBusy : tCfg.actions.pdf}</span>
                </motion.button>
              )}
              <button className="fc-ghost" onClick={closeModal}>{t.close}</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 14 }}>
              <span style={{ color: T.accentLt }}>//</span> {t.kicker}
            </div>
            <h3 id="fc-modal-title" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 23, letterSpacing: "-0.02em", color: "#FFFFFF", margin: "0 0 10px" }}>
              {t.title}
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.65, color: "#FFFFFF", margin: "0 0 18px" }}>
              {t.lead}
            </p>

            {bp && (
              <div className="fc-recap-head">
                <span className="fc-recap-core">{bp.vector.node}</span>
                <span className="fc-recap-cx">{bp.complexity.label} · {bp.complexity.weeks}</span>
              </div>
            )}
            <div className="fc-recap" role="group" aria-label={t.selectedModules}>
              {items.map(i => (
                <span key={i.id} className="fc-recap-chip">
                  <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: GROUP_COLOR[i.group], flexShrink: 0 }} />
                  {i.node}
                </span>
              ))}
            </div>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FInput label={t.name} placeholder={t.namePlaceholder} value={name} onChange={setName} required inputRef={nameRef} />
              <FInput label={t.email} placeholder={t.emailPlaceholder} type="email" value={email} onChange={setEmail} required />
              <FInput label={t.messenger} placeholder={t.messengerPlaceholder} value={messenger} onChange={setMessenger} />
              {/* honeypot. Il nome NON deve somigliare a un campo reale
                  ("company", "organization"…): l'autofill del browser lo
                  riempirebbe e le richieste vere verrebbero scartate. */}
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} tabIndex={-1}
                autoComplete="off" aria-hidden="true" name="fc-ref-token"
                style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />

              {leadStatus === "error" && (
                <p role="alert" style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: "#FF8A96", margin: 0 }}>
                  {t.error}
                </p>
              )}

              <motion.button type="submit" className="fc-submit" disabled={leadStatus === "sending"}
                whileHover={leadStatus === "sending" ? {} : { y: -1 }} whileTap={leadStatus === "sending" ? {} : { scale: 0.985 }}>
                {leadStatus === "sending" ? (
                  <>
                    <motion.span aria-hidden style={{ width: 13, height: 13, borderRadius: "50%", border: "1.6px solid rgba(255,255,255,0.35)", borderTopColor: "#FFFFFF", display: "inline-block" }}
                      animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                    {t.sending}
                  </>
                ) : (<>{t.submit} <span style={{ fontSize: 15 }}>→</span></>)}
              </motion.button>

              <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: "2px 0 0", textAlign: "center" }}>
                {t.privacy}
              </p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SEZIONE
══════════════════════════════════════════════════════════════════════════ */
/**
 * initialVector — usato dalle pagine servizio. Chi legge /seo ha già risposto
 * alla domanda del primo passo semplicemente essendo lì: ripeterla sarebbe un
 * passo indietro. Con il nucleo già scelto il configuratore parte dal secondo
 * passo e diventa il seguito della pagina, non un nuovo inizio.
 * Il widget NON prende la tinta della pagina: pulsanti, badge dei passi e
 * nodi del canvas restano rossi ovunque compaia. È un prodotto riconoscibile,
 * e colorarne solo l'occhiello avrebbe fatto sembrare il resto un errore.
 */
export default function FoundryConfigurator({ initialVector }: { initialVector?: VectorId } = {}) {
  const tSec      = useT(CONFIGURATOR_STR).section
  const mobile    = useMedia("(max-width: 900px)")
  const modalOpen = useFoundryStore(s => s.modalOpen)
  const preset    = Boolean(initialVector)

  useEffect(() => {
    if (!initialVector) return
    /* solo se il visitatore non ha ancora scelto da sé: se è tornato su e ha
       cambiato nucleo, la sua scelta vince */
    if (useFoundryStore.getState().vector === null) useFoundryStore.getState().pickVector(initialVector)
  }, [initialVector])

  return (
    <section style={{ ...SEC, borderTop: `1px solid ${T.border}` }} className="hp-sec">
      <style>{CSS}</style>
      <div style={WRAP} className="hp-wrap">
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 18 }}>
            <span style={{ color: T.accentLt }}>//</span>
            <span>{tSec.kicker}</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(34px,5vw,66px)", lineHeight: 0.98, letterSpacing: "-0.04em", margin: 0 }}>
            {preset ? (
              <>
                <span style={{ color: "#FFFFFF" }}>{tSec.titlePresetBefore}</span>
                <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.63)" }}>{tSec.titleHighlight}</span>
              </>
            ) : (
              <>
                <span style={{ color: "#FFFFFF" }}>{tSec.titleBefore}</span>
                <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.63)" }}>{tSec.titleHighlight}</span>
              </>
            )}
          </h2>
          <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.4vw, 17px)", color: "#FFFFFF", lineHeight: 1.8, maxWidth: 620, margin: "20px 0 0" }}>
            {preset ? tSec.leadPreset : tSec.lead}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <Stepper />
          <div className="fc-grid">
            <StepPanel />
            <Canvas mobile={mobile} />
          </div>
          <BlueprintPanel />
        </Reveal>
      </div>

      <AnimatePresence>{modalOpen && <LeadModal />}</AnimatePresence>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   STILI — prefisso fc-; reset espliciti contro le regole globali dei <button>
══════════════════════════════════════════════════════════════════════════ */
const CSS = `
  .fc-grid { display:grid; grid-template-columns:5fr 7fr; gap:14px; align-items:start; margin-top:14px; }
  .fc-grid button:focus-visible, .fc-summary button:focus-visible, .fc-modal button:focus-visible,
  .fc-stepper button:focus-visible, .fc-modal input:focus-visible {
    outline:2px solid rgba(255,255,255,0.85); outline-offset:2px;
  }

  /* ── stepper ────────────────────────────────────────────────────────── */
  .fc-stepper { display:flex; gap:8px; margin-top:40px; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
  .fc-stepper::-webkit-scrollbar { display:none; }
  .fc-step {
    flex:1 1 0; min-width:132px; min-height:52px; display:flex; align-items:center; gap:10px; cursor:pointer;
    padding:12px 14px; border-radius:12px; text-align:left; text-transform:none; letter-spacing:normal;
    background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.12);
    transition:background 0.22s, border-color 0.22s, opacity 0.22s;
  }
  .fc-step:disabled { cursor:default; opacity:0.42; }
  .fc-step.is-on   { border-color:rgba(255,60,92,0.65); background:rgba(255,60,92,0.10); }
  .fc-step.is-done { border-color:rgba(16,185,129,0.42); }
  .fc-step-n {
    flex-shrink:0; width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center;
    font-family:${MONO}; font-size:10px; font-weight:700; color:#FFFFFF;
    background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.18);
  }
    /* Il rosso chiaro dietro un numero bianco di 10px dava 3,47:1, sotto la
     soglia AA di 4,5:1. Il rame profondo porta lo stesso numero a 5,9:1
     restando lo stesso colore della famiglia. */
  .fc-step.is-on .fc-step-n   { background:#B83240; border-color:rgba(255,60,92,0.9); }
  .fc-step.is-done .fc-step-n { background:rgba(16,185,129,0.22); border-color:rgba(16,185,129,0.55); }
  .fc-step-l { font-family:${MONO}; font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#FFFFFF; }

  /* ── pannello passo ─────────────────────────────────────────────────── */
  .fc-panel { display:flex; flex-direction:column; min-width:0; }
  .fc-step-hint { font-family:${SANS}; font-size:15px; line-height:1.65; color:#FFFFFF; margin:0 0 16px; }
  .fc-step-hint strong { font-weight:700; }

  /* ── selettore famiglie ─────────────────────────────────────────────── */
  .fc-sel { position:relative; }
  .fc-sel-btn {
    width:100%; min-height:50px; display:flex; align-items:center; gap:10px; cursor:pointer;
    padding:13px 14px; border-radius:12px; text-align:left;
    font-family:${MONO}; font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#FFFFFF;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.16);
    transition:background 0.22s, border-color 0.22s;
  }
  .fc-sel-btn:hover { border-color:rgba(255,255,255,0.34); }
  .fc-sel-btn.is-open { border-color:rgba(255,60,92,0.65); background:rgba(255,60,92,0.10); }
  .fc-sel-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .fc-sel-lab { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .fc-sel-arrow { display:flex; align-items:center; color:rgba(255,255,255,0.65); flex-shrink:0; }

  /* grafite neutro, non blu: saturate(0.55) toglie la dominante fredda che il
     fondo pagina lascia passare attraverso il blur */
  .fc-sel-list {
    position:absolute; top:calc(100% + 6px); left:0; right:0; z-index:20; margin:0; padding:6px; list-style:none;
    border-radius:12px; background:rgba(23,25,29,0.94);
    backdrop-filter:blur(22px) saturate(0.55); -webkit-backdrop-filter:blur(22px) saturate(0.55);
    border:1px solid rgba(255,255,255,0.16);
    box-shadow:0 24px 60px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.10);
    outline:none; max-height:min(320px, 60vh); overflow-y:auto; overscroll-behavior:contain;
  }
  .fc-sel-opt {
    display:flex; align-items:center; gap:10px; cursor:pointer; padding:11px 12px; border-radius:9px;
    min-height:48px; transition:background 0.16s;
  }
  .fc-sel-opt.is-cursor { background:rgba(255,255,255,0.09); }
  .fc-sel-opt.is-on     { background:rgba(255,60,92,0.16); }
  .fc-sel-opt-l { display:block; font-family:${MONO}; font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#FFFFFF; }
  .fc-sel-opt-s { display:block; font-family:${SANS}; font-size:13px; line-height:1.45; color:rgba(255,255,255,0.72); margin-top:3px; text-transform:none; letter-spacing:normal; }

  .fc-tab-n {
    display:inline-flex; align-items:center; justify-content:center; min-width:16px; height:16px; padding:0 4px;
    border-radius:8px; background:#B01F35; color:#FFFFFF; font-size:9.5px; letter-spacing:0; font-weight:700;
    flex-shrink:0;
  }
  .fc-cat-hint { font-family:${MONO}; font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.55); margin:12px 2px 14px; }

  .fc-list { display:flex; flex-direction:column; gap:8px; }
  .fc-card {
    display:flex; align-items:flex-start; gap:13px; width:100%; text-align:left; cursor:pointer;
    padding:14px 16px; border-radius:12px; font-family:${SANS}; text-transform:none; letter-spacing:normal;
    background:${G.bg}; backdrop-filter:${G.blur}; -webkit-backdrop-filter:${G.blur};
    border:1px solid rgba(255,255,255,0.14); box-shadow:inset 0 1px 0 rgba(255,255,255,0.10);
    transition:border-color 0.22s, background 0.22s, box-shadow 0.22s;
  }
  .fc-card:hover { border-color:rgba(255,255,255,0.34); background:rgba(70,90,108,0.15); }
  .fc-card.is-on { border-color:rgba(255,60,92,0.55); background:rgba(255,60,92,0.08); box-shadow:inset 0 1px 0 rgba(255,255,255,0.12), 0 0 16px rgba(255,60,92,0.10); }
  .fc-card-ic {
    width:24px; height:24px; border-radius:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
    margin-top:1px; color:#FFFFFF; background:rgba(255,255,255,0.09); border:1px solid rgba(255,255,255,0.24);
    transition:background 0.22s, border-color 0.22s;
  }
  .fc-card-ic.is-on { background:rgba(255,60,92,0.80); border-color:rgba(255,60,92,0.9); }
  .fc-card-t { display:block; font-size:15px; font-weight:600; letter-spacing:-0.01em; line-height:1.35; color:#FFFFFF; }
  .fc-card-b { display:block; font-size:14px; font-weight:400; line-height:1.55; color:#FFFFFF; margin-top:3px; }

  .fc-nav { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:18px; }
  .fc-nav-b {
    min-height:46px; padding:0 18px; cursor:pointer; border-radius:11px;
    font-family:${MONO}; font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#FFFFFF;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.18);
    transition:background 0.2s, border-color 0.2s;
  }
  .fc-nav-b:hover { background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.36); }
  .fc-nav-b.is-next { border-color:rgba(255,60,92,0.70); background:rgba(255,60,92,0.16); }
  .fc-nav-b.is-next:hover { background:rgba(255,60,92,0.24); }
  .fc-nav-hint { font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.55); text-align:right; }

  /* ── indice di complessità ──────────────────────────────────────────── */
  .fc-cx { border-radius:14px; padding:18px 20px 20px; margin-bottom:16px;
    background:${G.bg}; backdrop-filter:${G.blur}; -webkit-backdrop-filter:${G.blur};
    border:1px solid rgba(255,255,255,0.14); box-shadow:inset 0 1px 0 rgba(255,255,255,0.10); }
  .fc-cx-row { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:14px; }
  .fc-cx-k { font-family:${MONO}; font-size:9px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.60); margin-bottom:5px; }
  .fc-cx-v { font-family:${DISPLAY}; font-size:19px; font-weight:700; letter-spacing:-0.02em; color:#FFFFFF; line-height:1.1; }
  .fc-cx-bar { display:flex; gap:5px; }
  .fc-cx-seg { flex:1; height:4px; border-radius:2px; background:rgba(255,255,255,0.10); transform-origin:left; }
  .fc-cx-seg.is-on { background:linear-gradient(90deg, rgba(255,60,92,0.85), rgba(255,138,150,0.85)); }
  .fc-cx-note { font-family:${SANS}; font-size:13.5px; line-height:1.6; color:#FFFFFF; margin:12px 0 0; }

  /* colonna stretta: due pulsanti affiancati manderebbero l'etichetta a capo */
  .fc-actions { display:flex; flex-direction:column; gap:10px; }
  .fc-cta-tx, .fc-ghost { white-space:nowrap; }
  .fc-actions-note { font-family:${SANS}; font-size:13px; line-height:1.6; color:rgba(255,255,255,0.72); margin:12px 0 0; }
  .fc-actions-note strong { color:#FFFFFF; font-weight:600; }

  /* ── canvas ─────────────────────────────────────────────────────────── */
  .fc-canvas {
    position:relative; min-height:520px; border-radius:16px; overflow:hidden;
    background:${G.bg}; backdrop-filter:${G.blur}; -webkit-backdrop-filter:${G.blur};
    border:1px solid ${G.bd}; box-shadow:${G.shadow};
    background-image:
      linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
    background-size:44px 44px;
    display:flex; flex-direction:column;
  }
  .fc-cv-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px 0; position:relative; z-index:2; }
  .fc-cv-tag { display:inline-flex; align-items:center; gap:8px; font-family:${MONO}; font-size:9.5px; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:#FFFFFF; }
  .fc-cv-count { font-family:${MONO}; font-size:9.5px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.60); font-variant-numeric:tabular-nums; }

  .fc-svg { position:absolute; inset:0; width:100%; height:100%; z-index:0; pointer-events:none; }
  @keyframes fcDash { to { stroke-dashoffset:-190; } }
  .fc-dash { animation:fcDash 3.4s linear infinite; }

  .fc-bands { position:relative; z-index:1; flex:1; display:flex; flex-direction:column; padding:22px 18px 24px; gap:20px; }
  .fc-core-wrap { display:flex; justify-content:center; }
  .fc-core {
    display:flex; flex-direction:column; align-items:center; gap:3px; padding:12px 22px; border-radius:12px;
    background:rgba(6,12,24,0.80); border:1px solid rgba(255,255,255,0.24);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.16), 0 10px 30px rgba(4,8,18,0.5);
  }
  .fc-core-tag { display:inline-flex; align-items:center; gap:7px; font-family:${MONO}; font-size:8.5px; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.72); }
  .fc-core-n { font-family:${DISPLAY}; font-size:16px; font-weight:800; letter-spacing:-0.02em; color:#FFFFFF; }
  .fc-core-s { font-family:${MONO}; font-size:8.5px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.58); }

  .fc-band { display:flex; flex-direction:column; }
  .fc-band-label { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; font-family:${MONO}; font-size:9px; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; margin-bottom:9px; }
  .fc-band-sub { color:rgba(255,255,255,0.50); letter-spacing:0.10em; font-weight:400; }
  .fc-band-row { display:flex; flex-wrap:wrap; justify-content:space-evenly; align-items:center; gap:10px; }

  .fc-node {
    position:relative; z-index:1; display:inline-flex; align-items:center; gap:9px; cursor:pointer;
    font-family:${DISPLAY}; font-size:13.5px; font-weight:600; letter-spacing:-0.01em; text-transform:none; color:#FFFFFF;
    padding:11px 14px; border-radius:12px;
    background:rgba(10,16,28,0.78); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
    border:1px solid; box-shadow:inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 24px rgba(4,8,18,0.45);
    transition:box-shadow 0.22s, background 0.22s;
  }
  .fc-node:hover { background:rgba(14,21,36,0.86); box-shadow:inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 28px rgba(4,8,18,0.55); }
  .fc-node-x { font-size:13px; color:rgba(255,255,255,0); margin-left:2px; transition:color 0.2s; line-height:1; }
  .fc-node:hover .fc-node-x { color:rgba(255,255,255,0.65); }
  @media (hover:none) { .fc-node-x { color:rgba(255,255,255,0.45); margin-left:auto; } }

  .fc-canvas.is-empty .fc-bands { min-height:420px; }
  .fc-empty { position:absolute; inset:0; z-index:2; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center; padding:24px; pointer-events:none; }
  .fc-empty-badge { font-family:${MONO}; font-size:10px; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.70); padding:10px 16px; border:1px dashed rgba(255,255,255,0.28); border-radius:10px; background:rgba(6,12,24,0.55); }
  .fc-empty-hint { font-family:${SANS}; font-size:14px; color:#FFFFFF; max-width:300px; line-height:1.6; }

  /* ── resoconto ──────────────────────────────────────────────────────── */
  .fc-summary { margin-top:14px; border-radius:16px; padding:24px 26px 26px;
    background:${G.bg}; backdrop-filter:${G.blur}; -webkit-backdrop-filter:${G.blur};
    border:1px solid ${G.bd}; box-shadow:${G.shadow}; }
  .fc-sum-empty { font-family:${SANS}; font-size:15px; line-height:1.7; color:#FFFFFF; margin:14px 0 2px; }
  .fc-shelves { display:grid; grid-template-columns:1fr 1fr; gap:0 36px; }
  .fc-shelf { padding:16px 0 18px; border-top:1px solid rgba(255,255,255,0.12); margin-top:14px; }
  .fc-shelf-span { grid-column:1 / -1; }
  .fc-shelf-label { font-family:${MONO}; font-size:9.5px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:#FFFFFF; margin-bottom:10px; }
  .fc-shelf-txt { font-family:${SANS}; font-size:15px; line-height:1.7; color:#FFFFFF; margin:0; }
  .fc-mod-list { display:grid; grid-template-columns:1fr 1fr; gap:12px 32px; }
  .fc-mod-line { display:flex; gap:10px; align-items:flex-start; }
  .fc-mod-line-name { display:block; font-family:${DISPLAY}; font-size:14.5px; font-weight:700; letter-spacing:-0.01em; color:#FFFFFF; line-height:1.4; }
  .fc-mod-line-tech { display:block; font-family:${SANS}; font-size:13.5px; font-weight:400; line-height:1.6; color:#FFFFFF; margin-top:2px; }

  /* ── CTA ────────────────────────────────────────────────────────────── */
  .fc-cta {
    min-height:54px; border-radius:12px; cursor:pointer; text-decoration:none; padding:0;
    border:1px solid rgba(255,60,92,0.80);
    background:linear-gradient(90deg, rgba(255,60,92,0.34) 0%, rgba(255,60,92,0.20) 100%);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    box-shadow:0 0 12px rgba(255,60,92,0.20), inset 0 1px 0 rgba(255,255,255,0.15);
    display:inline-flex; align-items:stretch; overflow:hidden; font-family:${MONO};
  }
  .fc-cta-ix { padding:0 14px; border-right:1px solid rgba(255,60,92,0.45); display:flex; align-items:center; font-size:9px; letter-spacing:0.22em; color:#FFFFFF; }
  .fc-cta-tx { flex:1; display:flex; align-items:center; justify-content:center; gap:12px; padding:0 18px; font-size:11px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#FFFFFF; }

  .fc-ghost {
    display:inline-flex; align-items:center; justify-content:center; min-height:46px; padding:0 26px; cursor:pointer;
    border-radius:12px; font-family:${MONO}; font-size:11px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#FFFFFF;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.18);
    transition:background 0.2s, border-color 0.2s;
  }
  .fc-ghost:hover { background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.36); }
  .fc-ghost-wide { min-height:54px; }
  /* mentre il modulo PDF si scarica il pulsante resta visibile ma inerte */
  .fc-cta:disabled, .fc-ghost:disabled { opacity:0.62; cursor:progress; }

  /* il pulsante fisso di contatto copre i CTA del configuratore */
  body[data-fc-cta="1"] .nm-float-trigger { opacity:0; pointer-events:none; visibility:hidden; transition:opacity 0.25s; }

  /* ── modal ──────────────────────────────────────────────────────────── */
  .fc-overlay {
    position:fixed; inset:0; z-index:2000; display:flex; align-items:center; justify-content:center;
    background:rgba(3,7,14,0.66); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
    padding:16px; overscroll-behavior:contain;
  }
  .fc-modal {
    position:relative; width:100%; max-width:540px; max-height:90vh; max-height:90dvh; overflow-y:auto; overscroll-behavior:contain;
    background:rgba(13,19,31,0.94); backdrop-filter:blur(24px) saturate(1.1); -webkit-backdrop-filter:blur(24px) saturate(1.1);
    border:1px solid rgba(255,255,255,0.16); border-radius:18px; padding:30px 30px 26px;
    box-shadow:0 40px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10);
  }
  .fc-modal-x {
    position:absolute; top:10px; right:10px; width:44px; height:44px; border-radius:12px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:20px; line-height:1; color:#FFFFFF;
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.14); font-family:${SANS};
    text-transform:none; letter-spacing:normal;
    transition:background 0.2s, border-color 0.2s;
  }
  .fc-modal-x:hover { background:rgba(255,255,255,0.10); border-color:rgba(255,255,255,0.30); }

  .fc-recap-head { display:flex; align-items:baseline; justify-content:space-between; gap:14px; flex-wrap:wrap; padding-bottom:10px; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.12); }
  .fc-recap-core { font-family:${DISPLAY}; font-size:15px; font-weight:700; letter-spacing:-0.01em; color:#FFFFFF; }
  .fc-recap-cx { font-family:${MONO}; font-size:9.5px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.70); }
  .fc-recap { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:20px; }
  .fc-recap-chip { display:inline-flex; align-items:center; gap:7px; font-family:${MONO}; font-size:10px; font-weight:600; letter-spacing:0.10em; text-transform:uppercase; color:#FFFFFF; padding:6px 10px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.16); }

  .fc-submit {
    display:flex; align-items:center; justify-content:center; gap:10px; width:100%; min-height:54px; margin-top:4px;
    border-radius:12px; cursor:pointer;
    font-family:${MONO}; font-size:12px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#FFFFFF;
    border:1px solid rgba(255,60,92,0.80);
    background:linear-gradient(90deg, rgba(255,60,92,0.34) 0%, rgba(255,60,92,0.20) 100%);
    box-shadow:0 0 12px rgba(255,60,92,0.20), inset 0 1px 0 rgba(255,255,255,0.15);
    transition:opacity 0.2s;
  }
  .fc-submit:disabled { opacity:0.7; cursor:default; }

  /* ── mobile ─────────────────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .fc-grid { grid-template-columns:1fr; gap:12px; margin-top:12px; }
    .fc-stepper { margin-top:32px; gap:6px;
      -webkit-mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - 24px),transparent 100%);
      mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - 24px),transparent 100%); }
    .fc-step { flex:0 0 auto; min-width:0; }
    .fc-step-l { display:none; }
    .fc-step.is-on { flex:1 1 auto; }
    .fc-step.is-on .fc-step-l { display:inline; }

    .fc-canvas { min-height:0; background-size:36px 36px; }
    .fc-canvas.is-empty .fc-bands { min-height:0; }
    .fc-canvas.is-mobile .fc-bands { padding:20px 16px 22px 34px; gap:16px; position:relative; }
    .fc-canvas.is-mobile .fc-bands::before {
      content:""; position:absolute; left:19px; top:16px; bottom:16px; width:1px;
      background:linear-gradient(to bottom, transparent, rgba(255,255,255,0.20) 8%, rgba(255,255,255,0.20) 92%, transparent);
    }
    .fc-canvas.is-mobile .fc-core-wrap { justify-content:flex-start; }
    .fc-canvas.is-mobile .fc-core { align-items:flex-start; width:100%; }
    .fc-canvas.is-mobile .fc-band-row { flex-direction:column; align-items:stretch; gap:8px; }
    .fc-canvas.is-mobile .fc-node { width:100%; min-height:48px; justify-content:flex-start; position:relative; }
    .fc-canvas.is-mobile .fc-node::before { content:""; position:absolute; left:-15px; top:50%; width:15px; height:1px; background:rgba(255,255,255,0.22); }
    .fc-canvas.is-mobile .fc-empty { position:relative; inset:auto; padding:36px 20px; }

    .fc-step-hint, .fc-card-t, .fc-card-b, .fc-shelf-txt, .fc-sum-empty,
    .fc-mod-line-tech, .fc-empty-hint, .fc-cx-note, .fc-actions-note { font-size:16px; }
    .fc-mod-line-name { font-size:15.5px; }

    .fc-shelves { grid-template-columns:1fr; gap:0; }
    .fc-mod-list { grid-template-columns:1fr; gap:14px; }
    .fc-summary { padding:20px 18px 22px; }

    .fc-overlay { align-items:flex-start; overflow-y:auto; padding:12px; }
    .fc-modal { max-height:none; margin:12px auto 32px; padding:24px 20px 22px; }
  }
`
