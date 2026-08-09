import React, { useEffect, useState } from "react"
import type { SandboxItem } from "../../../data/sandboxData"

/* ══════════════════════════════════════════════════════════════════════════
   BARRA AZIONI

   Pannello di vetro appeso sotto il riquadro. A sinistra che cosa è fatto
   (lo stack), a destra che cosa si può fare — nell'ordine in cui uno le vuole:
   guardare la demo vera, metterla nel preventivo, mandarla a un collega.

   Niente prezzi, niente carrello, niente "acquista": il preventivo si compone
   altrove e lo firma una persona.
══════════════════════════════════════════════════════════════════════════ */

type Props = {
  item: SandboxItem
  /** URL assoluto della demo a schermo intero: CTA e condivisione partono da qui. */
  demoUrl: string | null
  inBlueprint: boolean
  onBlueprint: () => void
}

export default function BottomActionBar({ item, demoUrl, inBlueprint, onBlueprint }: Props) {
  const shareUrl = demoUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/foundry` : "")
  const shareText = `${item.title} — ${item.category} · Nadia Maar`

  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[20px] px-4 py-3
                 bg-white/[0.055] ring-1 ring-white/12 backdrop-blur-2xl
                 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)]
                 max-md:rounded-2xl max-md:px-3"
    >
      {/* ── stack ─────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 max-md:order-2 max-md:basis-full">
        {item.tech.map(t => (
          <span
            key={t}
            className="rounded-md px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.08em]
                       text-white/70 bg-white/[0.05] ring-1 ring-white/12 whitespace-nowrap"
          >
            {t}
          </span>
        ))}
      </div>

      {/* ── condivisione: solo icone, il testo lo dice il tooltip ──────── */}
      <div className="flex items-center gap-1 max-md:order-3">
        <Share
          label="Condividi su WhatsApp"
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
        >
          <path d="M13.6 12.1c-.2-.1-1.3-.7-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.7.8-.1.2-.3.2-.5.1-1-.5-1.7-.9-2.4-2-.2-.3.2-.3.5-1 .1-.1 0-.3 0-.4 0-.1-.5-1.2-.6-1.6-.2-.4-.3-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.6 2.5 3.9 3.4 1.5.6 2 .7 2.7.6.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1 0-.1-.2-.2-.4-.3z" />
          <path d="M9 1.6A7.4 7.4 0 002.6 12.7L1.6 16.4l3.8-1a7.4 7.4 0 103.6-13.8zm0 13.5a6 6 0 01-3.1-.9l-.2-.1-2.3.6.6-2.2-.2-.2A6.1 6.1 0 119 15.1z" />
        </Share>

        <Share
          label="Condividi su Telegram"
          href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
        >
          <path d="M16.1 3.2L2.3 8.5c-.7.3-.7.7-.1.9l3.5 1.1 8.1-5.1c.4-.2.7-.1.5.1L7.7 12l-.3 3.6c.3 0 .4-.1.6-.3l1.4-1.4 3 2.2c.5.3.9.1 1.1-.5l2-9.4c.2-.7-.3-1.1-.8-.9z" />
        </Share>

        <Share
          label="Condividi su LinkedIn"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
        >
          <path d="M5.2 6.9H2.8v8.3h2.4V6.9zM4 2.8a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z" />
          <path d="M11.8 6.7c-1.2 0-2 .6-2.3 1.2V6.9H7.1v8.3h2.4v-4.6c0-1 .2-2 1.5-2s1.3 1.2 1.3 2.1v4.5h2.4v-5c0-2.1-.5-3.5-2.9-3.5z" />
        </Share>

        <CopyLink url={shareUrl} />
      </div>

      {/* ── azioni ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 max-md:order-1 max-md:basis-full">
        <button
          type="button"
          onClick={onBlueprint}
          aria-pressed={inBlueprint}
          className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 font-mono text-[10px]
                      font-semibold uppercase tracking-[0.12em] whitespace-nowrap
                      transition duration-200 max-md:flex-1 max-md:justify-center
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1592A]
                      ${inBlueprint
                        ? "bg-white/[0.10] text-white ring-1 ring-white/25"
                        : "bg-white/[0.04] text-white/80 ring-1 ring-white/14 hover:bg-white/[0.09] hover:text-white"}`}
        >
          <span aria-hidden className="font-mono text-[11px] leading-none">
            {inBlueprint ? "[−]" : "[+]"}
          </span>
          {inBlueprint ? "Nel blueprint" : "Blueprint"}
        </button>

        {/* Il CTA porta alla demo VERA, a tutto schermo e in una scheda nuova:
            l'anteprima qui dentro serve a decidere se vale la pena aprirla. */}
        {demoUrl ? (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 font-mono text-[10px]
                       font-semibold uppercase tracking-[0.12em] whitespace-nowrap no-underline
                       bg-[#CC3F14] text-white ring-1 ring-[#F1592A]/60
                       shadow-[0_8px_28px_-10px_rgba(204,63,20,0.9)]
                       transition duration-200 hover:bg-[#B8380F] max-md:flex-1 max-md:justify-center
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Preview
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 10L10 2M10 2H5.5M10 2v4.5" />
            </svg>
          </a>
        ) : (
          <span
            className="inline-flex h-10 items-center rounded-xl px-4 font-mono text-[10px]
                       font-semibold uppercase tracking-[0.12em] whitespace-nowrap
                       bg-white/[0.03] text-white/40 ring-1 ring-white/10 max-md:flex-1 max-md:justify-center"
          >
            Demo in arrivo
          </span>
        )}
      </div>
    </div>
  )
}

/* ── una icona di condivisione ─────────────────────────────────────────── */
function Share({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-lg text-white/55
                 transition duration-200 hover:bg-white/[0.09] hover:text-white
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1592A]"
    >
      <svg width="17" height="17" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </a>
  )
}

/* ── copia link ────────────────────────────────────────────────────────── */
function CopyLink({ url }: { url: string }) {
  const [done, setDone] = useState(false)

  /* Il timer va azzerato allo smontaggio: chiudendo l'overlay subito dopo il
     clic, altrimenti, si chiama setState su un componente che non c'è più. */
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setDone(false), 1800)
    return () => clearTimeout(t)
  }, [done])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setDone(true)
    } catch {
      /* Clipboard API negata (http, permessi): il fallback selezionabile è
         meglio di un pulsante che non fa nulla e non lo dice. */
      window.prompt("Copia il link:", url)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={done ? "Link copiato" : "Copia link"}
      aria-label={done ? "Link copiato" : "Copia link"}
      className={`grid h-9 w-9 place-items-center rounded-lg transition duration-200
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1592A]
                  ${done ? "text-[#8FE3B4]" : "text-white/55 hover:bg-white/[0.09] hover:text-white"}`}
    >
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {done
          ? <path d="M4 9.5l3.2 3.2L14 6" />
          : <>
              <rect x="6.4" y="6.4" width="8.2" height="8.2" rx="2" />
              <path d="M11.6 6.4V5a1.6 1.6 0 00-1.6-1.6H5A1.6 1.6 0 003.4 5v5a1.6 1.6 0 001.6 1.6h1.4" />
            </>}
      </svg>
      <span className="sr-only" aria-live="polite">{done ? "Link copiato" : ""}</span>
    </button>
  )
}
