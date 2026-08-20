import { useEffect } from "react"

/* ══════════════════════════════════════════════════════════════════════════
   IL BAGLIORE CHE SEGUE IL CURSORE.

   Le schede con `data-glow` disegnano un alone attorno al puntatore. La
   posizione arriva da quattro variabili CSS su <html>: --x, --y in pixel e
   --xp, --yp normalizzate fra 0 e 1 (le usa la tinta dell'alone).

   ── PERCHÉ UN HOOK E NON TRE COPIE ──────────────────────────────────────
   Lo stesso effetto era scritto a mano in home, About e Projects. Tre copie
   della stessa `useEffect`, e la correzione qui sotto sarebbe stata da fare
   tre volte — cioè, prima o poi, due.

   ── COSA CAMBIA RISPETTO A PRIMA ────────────────────────────────────────
   1. UNA SCRITTURA PER FOTOGRAMMA. Prima ogni evento `pointermove`
      scriveva subito quattro proprietà su documentElement. Un mouse moderno
      emette fino a mille eventi al secondo (coalescing a parte): su una
      pagina con decine di elementi `[data-glow]` ogni scrittura fa
      ricalcolare lo stile a tutti. Adesso l'evento aggiorna solo due numeri
      in memoria e un requestAnimationFrame scrive al massimo una volta per
      fotogramma — cioè al ritmo a cui lo schermo può effettivamente
      mostrare qualcosa. È esattamente il tipo di lavoro che finisce nella
      misura INP.

   2. NIENTE SU TOUCH. Con `(pointer: coarse)` il cursore non esiste:
      l'alone inseguiva l'ultimo punto toccato e restava lì. Su telefono
      l'effetto non si registra proprio, e si risparmia sia il listener sia
      il ricalcolo.

   3. NIENTE CON MOVIMENTO RIDOTTO. Chi ha chiesto al sistema di ridurre le
      animazioni non deve trovarsi un alone che insegue il puntatore.

   4. LISTENER PASSIVO. Non chiamiamo preventDefault: dichiararlo permette
      al browser di non attendere il gestore prima di far scorrere la pagina.

   Le preferenze si riascoltano: chi cambia impostazione di sistema, o passa
   dal trackpad al touch su un portatile convertibile, vede l'effetto
   accendersi e spegnersi senza ricaricare.
══════════════════════════════════════════════════════════════════════════ */

const QUERY = "(pointer: coarse), (prefers-reduced-motion: reduce)"

export function usePointerGlow(): void {
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return

    const off = window.matchMedia(QUERY)
    let detach: (() => void) | null = null

    const attach = () => {
      const root = document.documentElement
      let x = 0
      let y = 0
      let queued = false

      const flush = () => {
        queued = false
        root.style.setProperty("--x", x.toFixed(2))
        root.style.setProperty("--y", y.toFixed(2))
        root.style.setProperty("--xp", (x / window.innerWidth).toFixed(4))
        root.style.setProperty("--yp", (y / window.innerHeight).toFixed(4))
      }

      const onMove = (e: PointerEvent) => {
        x = e.clientX
        y = e.clientY
        if (queued) return
        queued = true
        requestAnimationFrame(flush)
      }

      document.addEventListener("pointermove", onMove, { passive: true })
      return () => {
        document.removeEventListener("pointermove", onMove)
        /* Le variabili tornano fuori schermo: senza, l'ultimo alone
           resterebbe acceso dove si trovava il puntatore. */
        root.style.setProperty("--x", "-9999")
        root.style.setProperty("--y", "-9999")
      }
    }

    const sync = () => {
      if (off.matches) {
        detach?.()
        detach = null
      } else if (!detach) {
        detach = attach()
      }
    }

    sync()
    off.addEventListener("change", sync)
    return () => {
      off.removeEventListener("change", sync)
      detach?.()
    }
  }, [])
}
