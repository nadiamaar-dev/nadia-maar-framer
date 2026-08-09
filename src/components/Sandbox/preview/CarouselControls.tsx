import React from "react"

/* ══════════════════════════════════════════════════════════════════════════
   FRECCE DELLA CAROSELLA

   Su schermo largo galleggiano FUORI dal contenitore, così non coprono mai
   l'interfaccia che si sta guardando — è quella il contenuto, non loro.
   Sotto i 1400px non c'è più margine ai lati e rientrano, semitrasparenti,
   sopra i bordi del riquadro.

   La carosella non è circolare di proposito: arrivati all'ultimo progetto la
   freccia si disattiva invece di riportare al primo. In una griglia filtrata
   di 3 elementi un giro infinito fa perdere il conto di dove si è.
══════════════════════════════════════════════════════════════════════════ */

type Props = {
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
}

/* Fondo SCURO, non vetro bianco: da 1400px in giù le frecce rientrano sopra
   il riquadro, che è un'interfaccia chiara — un pallino bianco traslucido lì
   sopra spariva. Scuro con anello chiaro si legge sia sul velo scuro fuori
   sia sullo schermo chiaro dentro. */
const base =
  "group absolute top-1/2 -translate-y-1/2 z-20 grid place-items-center " +
  "h-11 w-11 rounded-full text-white " +
  "bg-[#0E1116]/78 ring-1 ring-white/22 backdrop-blur-xl " +
  "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.75)] " +
  "transition duration-200 hover:bg-[#0E1116]/92 hover:ring-white/35 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1592A] " +
  "disabled:opacity-0 disabled:pointer-events-none " +
  "max-[1400px]:h-10 max-[1400px]:w-10"

export default function CarouselControls({ onPrev, onNext, canPrev, canNext }: Props) {
  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Progetto precedente"
        className={`${base} left-[-72px] max-[1400px]:left-3`}
      >
        <Chevron dir="left" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Progetto successivo"
        className={`${base} right-[-72px] max-[1400px]:right-3`}
      >
        <Chevron dir="right" />
      </button>

      {/* Il contatore NON sta qui dentro: vedi CarouselCounter, reso
          nell'intestazione. Dentro il riquadro finiva sopra la barra di
          navigazione della demo, sotto sopra i pulsanti azione — l'unico
          posto libero è fuori. */}
    </>
  )
}

/** "3 di 12": dice quanto manca, che è la cosa che una freccia non dice.
    Vive nell'intestazione dell'overlay, l'unica zona che non si sovrappone
    né alla demo né ai pulsanti. */
export function CarouselCounter({ index, total }: { index: number; total: number }) {
  return (
    <span
      aria-live="polite"
      className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 ring-1 ring-white/12
                 font-mono text-[10px] tracking-[0.14em] text-white/60"
    >
      {index + 1} / {total}
    </span>
  )
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden
      className={`transition-transform duration-200 ${
        dir === "left"
          ? "group-hover:-translate-x-0.5 -ml-px"
          : "group-hover:translate-x-0.5 ml-px"
      }`}
    >
      {dir === "left" ? <path d="M10 3L5 8l5 5" /> : <path d="M6 3l5 5-5 5" />}
    </svg>
  )
}
