import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import type { SandboxItem } from "../../../data/sandboxData"
import { useBlueprint } from "../../../context/BlueprintContext"
import CarouselControls, { CarouselCounter } from "./CarouselControls"
import BottomActionBar from "./BottomActionBar"

/* ══════════════════════════════════════════════════════════════════════════
   ANTEPRIMA DI PROGETTO

   Uno strato sopra la griglia: il fondo si sfoca, il progetto si guarda dal
   vivo dentro un riquadro chiaro, e da lì si decide se aprirlo davvero.

   L'anteprima NON sostituisce la demo a schermo intero: quella vive sulla
   sua rotta, si indicizza e si manda a un cliente. Qui dentro si sfoglia —
   il CTA «Preview» porta alla cosa vera in una scheda nuova.
══════════════════════════════════════════════════════════════════════════ */

/* ogni demo ha la sua rotta; le altre schede mostrano il manifesto */
const DEMO_HREF: Record<string, string> = {
  "supplier-portal": "/demo/portale-fornitori",
}

type Props = {
  items: SandboxItem[]
  /** indice di partenza dentro `items`; null = chiuso */
  index: number | null
  onIndex: (i: number) => void
  onClose: () => void
}

export default function ProjectOverlay({ items, index, onIndex, onClose }: Props) {
  const open = index !== null && index >= 0 && index < items.length
  return (
    <AnimatePresence>
      {open && (
        <Overlay
          key="project-overlay"
          items={items}
          index={index as number}
          onIndex={onIndex}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  )
}

function Overlay({ items, index, onIndex, onClose }: {
  items: SandboxItem[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const item = items[index]
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  /* direzione dell'ultimo spostamento: decide da che lato entra il riquadro */
  const [dir, setDir] = useState(0)
  const { user, isInBlueprint, addToBlueprint, removeFromBlueprint, openAuthModal } = useBlueprint()

  const canPrev = index > 0
  const canNext = index < items.length - 1

  const go = useCallback((d: number) => {
    const next = index + d
    if (next < 0 || next >= items.length) return
    setDir(d)
    onIndex(next)
  }, [index, items.length, onIndex])

  const demoUrl = useMemo(() => {
    const path = item.demo ? DEMO_HREF[item.demo] : null
    if (!path) return null
    return typeof window === "undefined" ? path : `${window.location.origin}${path}`
  }, [item.demo])

  /* ── tastiera: Escape chiude, le frecce sfogliano ─────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); return }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1) }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1) }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [go, onClose])

  /* ── il fondo non deve scorrere sotto lo strato ───────────────────────── */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  /* ── fuoco: entra nel pannello, torna alla scheda che l'ha aperto ─────── */
  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => returnTo?.focus?.()
  }, [])

  const inBlueprint = isInBlueprint(item.id)
  const onBlueprint = () => {
    if (!user) { openAuthModal(); return }
    if (inBlueprint) removeFromBlueprint(item.id)
    else addToBlueprint(item)
  }

  return (
    <motion.div
      /* z-420: l'intestazione del sito è fissa a 400 e il pulsante di contatto
         flottante a 401 — sotto di loro il velo non li copriva e restavano
         nitidi sopra l'anteprima. Resta comunque sotto i toast (9999), che
         devono poter parlare anche mentre l'anteprima è aperta. */
      className="fixed inset-0 z-[420] flex items-center justify-center overflow-y-auto
                 bg-[#0A0C11]/82 backdrop-blur-2xl px-6 py-10
                 max-md:px-3 max-md:py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      /* il clic sul vuoto chiude; quello sul pannello no */
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Anteprima · ${item.title}`}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-[1180px] outline-none"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── intestazione ──────────────────────────────────────────────── */}
        <div className="mb-3 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/45">
              {item.category}
            </div>
            <h2 className="mt-1.5 truncate text-[19px] font-bold leading-tight tracking-[-0.015em] text-white
                           max-md:text-[16px]">
              {item.title}
            </h2>
          </div>
          <CarouselCounter index={index} total={items.length} />

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi anteprima"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/60
                       bg-white/[0.06] ring-1 ring-white/12 backdrop-blur-xl
                       transition duration-200 hover:bg-white/[0.13] hover:text-white
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1592A]"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* ── riquadro della demo ───────────────────────────────────────── */}
        <div className="relative">
          <CarouselControls
            onPrev={() => go(-1)}
            onNext={() => go(1)}
            canPrev={canPrev}
            canNext={canNext}
          />

          <div
            className="relative overflow-hidden rounded-[26px] bg-[#EFEFF2]
                       ring-1 ring-white/12 shadow-[0_40px_120px_-40px_rgba(0,0,0,1)]
                       max-md:rounded-[18px]"
            /* Altezza esplicita invece di aspect-ratio + max-height: quella
               coppia, per tenere il rapporto, restringe la LARGHEZZA — il
               riquadro finiva a 900px mentre la barra azioni sotto restava a
               1180, disallineati. Qui la larghezza è sempre piena e l'altezza
               è quella che lascia in vista titolo, barra e descrizione. */
            style={{ height: "min(60vh, 720px)" }}
          >
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={item.id}
                custom={dir}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir >= 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir >= 0 ? -40 : 40 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Stage item={item} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <BottomActionBar
          item={item}
          demoUrl={demoUrl}
          inBlueprint={inBlueprint}
          onBlueprint={onBlueprint}
        />

        <p className="mt-3 max-w-[70ch] text-[13px] leading-relaxed text-white/55 max-md:text-[12.5px]">
          {item.description}
        </p>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   IL PALCO
   Con una demo pubblicata: la demo vera dentro un iframe, in sola lettura di
   fatto — si guarda e si prova, ma per usarla sul serio si apre a schermo
   intero. Senza demo: un manifesto, che è meglio di un riquadro vuoto.
══════════════════════════════════════════════════════════════════════════ */
function Stage({ item }: { item: SandboxItem }) {
  const [loaded, setLoaded] = useState(false)
  const path = item.demo ? DEMO_HREF[item.demo] : null

  if (!path) return <Poster item={item} />

  return (
    <>
      {!loaded && <Skeleton />}
      <iframe
        /* `embed` toglie alla demo la propria fascia d'agenzia: qui la cornice
           la mette già l'overlay, e due intestazioni sovrapposte confondono. */
        src={`${path}?embed=1`}
        title={`Demo interattiva · ${item.title}`}
        loading="lazy"
        className={`h-full w-full border-0 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}

function Skeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#F4F5F7]">
      <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-black/35">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-black/15 border-t-[#CC3F14]" />
        Carico la demo
      </div>
    </div>
  )
}

function Poster({ item }: { item: SandboxItem }) {
  return (
    <div
      className="absolute inset-0 grid place-items-center px-8 text-center"
      style={{ background: `radial-gradient(120% 90% at 50% 0%, ${item.accent}22 0%, #101319 62%)` }}
    >
      <div className="max-w-[46ch]">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/45">
          {item.type === "full-site" ? "Full Site" : "Component"}
        </div>
        <h3 className="mt-2.5 text-[26px] font-bold leading-tight tracking-[-0.02em] text-white max-md:text-[19px]">
          {item.title}
        </h3>
        <p className="mt-3 text-[13.5px] leading-relaxed text-white/60 max-md:text-[12.5px]">
          La demo interattiva di questo modulo non è ancora pubblicata.
          Lo stack e il perimetro sono quelli qui sotto: si può già aggiungere al blueprint.
        </p>
      </div>
    </div>
  )
}
