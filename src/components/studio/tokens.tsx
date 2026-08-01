/* ══════════════════════════════════════════════════════════════════════════
   TOKEN CONDIVISI DELLE SEZIONI "STUDIO"
   StudioApproach e StudioCapabilities nascono dalla home e devono continuare
   a somigliarle anche ora che vivono su About, che ha una sua palette e i
   suoi caratteri. Invece di ricopiare i valori in ogni file — come era stato
   fatto per FoundryShowcase — stanno qui una volta sola.
══════════════════════════════════════════════════════════════════════════ */

import React from "react"
import { motion } from "framer-motion"

export const T = {
  border:   "rgba(70,90,108,0.22)",
  text:     "#FFFFFF",
  muted:    "#FFFFFF",
  accent:   "#EE3A52",
  accentLt: "#F53E56",
  green:    "#10B981",
} as const

export const MONO    = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace"
export const SANS    = "'Geist', 'Space Grotesk', system-ui, sans-serif"
export const DISPLAY = "'Plus Jakarta Sans', system-ui, sans-serif"

export const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const WRAP: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" }
export const SEC: React.CSSProperties  = { padding: "80px 0", position: "relative" }

/* Le misure sono inline (SEC/WRAP), quindi per accorciarle sul mobile serve
   !important: una regola di classe da sola perderebbe contro lo style attributo. */
export const RESPONSIVE_CSS = `
  @media (max-width: 1024px) {
    .studio-wrap { padding: 0 28px !important; }
    .studio-sec  { padding: 64px 0 !important; position: relative; z-index: 1; }
  }
  @media (max-width: 768px) {
    .studio-wrap { padding: 0 20px !important; }
    .studio-sec  { padding: 56px 0 !important; }
  }
`

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  )
}
