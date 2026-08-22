import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import {
  ACCESSORI, type Configurazione, METALLI, MISURE, PELLI, PREZZO_MONOGRAMMA,
  euro, metalloDi, misuraDi, pelleDi, prezzoBorsa,
} from "./model"
import { descriviRiga, pezzi, subtotale, useAtelier } from "./store"

/* ══════════════════════════════════════════════════════════════════════════
   ATELIER — la boutique.

   Tre scene: la pagina (hero, collezione, atelier), la busta (il cassetto
   di vetro a destra) e il foglio di pagamento (la recita del wallet).

   La borsa non è una fotografia: è un disegno SVG che si ricolora con la
   pelle scelta e si inclina seguendo il puntatore. Una foto per ognuna
   delle 45 combinazioni peserebbe megabyte; un disegno pesa quanto questo
   file e risponde al millisecondo — che è esattamente l'argomento di
   vendita di un configuratore fatto bene.
══════════════════════════════════════════════════════════════════════════ */

/* ── La borsa Vela, parametrica.
     I gradienti hanno un prefisso per istanza: la stessa borsa compare
     nell'hero, nel teatro e nelle miniature del carrello, e in SVG gli id
     duplicati si rubano i colori a vicenda. ── */
function BorsaVela({ config, uid }: { config: Configurazione; uid: string }) {
  const pelle = pelleDi(config.pelle)
  const metallo = metalloDi(config.metallo)
  const iniziali = config.monogramma.trim().toUpperCase()
  return (
    <svg viewBox="0 0 340 320" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-corpo`} x1="0" y1="118" x2="0" y2="290" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={pelle.luce} />
          <stop offset="0.45" stopColor={pelle.base} />
          <stop offset="1" stopColor={pelle.ombra} />
        </linearGradient>
        <linearGradient id={`${uid}-patta`} x1="0" y1="108" x2="0" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={pelle.luce} />
          <stop offset="1" stopColor={pelle.base} />
        </linearGradient>
        <linearGradient id={`${uid}-metallo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={metallo.chiaro} />
          <stop offset="1" stopColor={metallo.scuro} />
        </linearGradient>
      </defs>

      {/* manico: due tratti concentrici danno lo spessore della pelle piegata */}
      <path d="M 106 116 C 112 44, 228 44, 234 116" stroke={pelle.ombra} strokeWidth="14" strokeLinecap="round" />
      <path d="M 106 116 C 112 44, 228 44, 234 116" stroke={pelle.base} strokeWidth="6" strokeLinecap="round" />
      <circle cx="106" cy="114" r="7" stroke={`url(#${uid}-metallo)`} strokeWidth="4" />
      <circle cx="234" cy="114" r="7" stroke={`url(#${uid}-metallo)`} strokeWidth="4" />

      {/* corpo: più largo alla base, come una vela al vento */}
      <path
        d="M 62 122 L 278 122 C 286 122, 292 128, 293 136 L 304 268 C 305 280, 296 290, 284 290 L 56 290 C 44 290, 35 280, 36 268 L 47 136 C 48 128, 54 122, 62 122 Z"
        fill={`url(#${uid}-corpo)`}
      />
      {/* fianchi in ombra: senza, la borsa è un adesivo */}
      <path d="M 62 122 L 47 136 L 36 268 C 35 280, 44 290, 56 290 L 74 290 L 78 122 Z" fill={pelle.ombra} opacity="0.35" />
      <path d="M 278 122 L 293 136 L 304 268 C 305 280, 296 290, 284 290 L 266 290 L 262 122 Z" fill={pelle.ombra} opacity="0.35" />

      {/* l'ombra che la patta getta sul corpo */}
      <path d="M 58 196 L 282 196 L 283 210 L 57 210 Z" fill={pelle.ombra} opacity="0.4" />

      {/* patta con cuciture a vista */}
      <path
        d="M 60 112 L 280 112 C 288 112, 294 118, 294 126 L 294 178 C 294 190, 286 198, 274 198 L 66 198 C 54 198, 46 190, 46 178 L 46 126 C 46 118, 52 112, 60 112 Z"
        fill={`url(#${uid}-patta)`}
      />
      <path
        d="M 60 120 L 280 120 C 284 120, 286 122, 286 126 L 286 176 C 286 184, 281 190, 273 190 L 67 190 C 59 190, 54 184, 54 176 L 54 126 C 54 122, 56 120, 60 120 Z"
        fill="none" stroke={config.pelle === "avorio" ? pelle.ombra : pelle.luce}
        strokeWidth="1.3" strokeDasharray="4 5" opacity="0.65"
      />

      {/* chiusura girevole in metallo */}
      <rect x="156" y="176" width="28" height="20" rx="6" fill={`url(#${uid}-metallo)`} />
      <rect x="161" y="181" width="18" height="10" rx="4" fill={pelle.ombra} opacity="0.55" />
      <circle cx="170" cy="212" r="9" fill={`url(#${uid}-metallo)`} />
      <rect x="166.5" y="204" width="7" height="9" rx="3" fill={`url(#${uid}-metallo)`} />

      {/* le iniziali impresse a caldo, in basso a destra */}
      {iniziali && (
        <text
          x="262" y="272" textAnchor="middle"
          fontFamily="'Fraunces', Georgia, serif" fontStyle="italic" fontWeight="500"
          fontSize="19" letterSpacing="2.5"
          fill={config.pelle === "avorio" ? pelle.ombra : pelle.luce} opacity="0.85"
        >
          {iniziali}
        </text>
      )}
    </svg>
  )
}

/* ── Gli accessori: nature morte in vettoriale ── */
function Foulard() {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden>
      <path d="M 10 78 C 34 58, 50 96, 74 74 C 92 58, 104 66, 112 58 L 112 86 C 88 102, 62 84, 40 96 C 26 103, 14 96, 10 90 Z" fill="#C88A5A" opacity="0.9" />
      <path d="M 8 62 C 30 44, 52 76, 76 56 C 94 42, 106 50, 114 44 L 114 66 C 92 80, 66 62, 44 76 C 28 85, 14 76, 8 72 Z" fill="#EADFCC" />
      <path d="M 12 46 C 34 30, 54 58, 78 40 C 94 28, 104 34, 112 30 L 112 50 C 90 62, 66 46, 44 58 C 28 66, 18 58, 12 54 Z" fill="#77816B" opacity="0.85" />
      <circle cx="88" cy="84" r="9" stroke="#C9A24E" strokeWidth="3" />
    </svg>
  )
}

function Portacarte() {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden>
      <rect x="22" y="26" width="76" height="68" rx="12" fill="#8A4E26" />
      <rect x="22" y="26" width="76" height="68" rx="12" fill="url(#pc-luce)" />
      <defs>
        <linearGradient id="pc-luce" x1="0" y1="26" x2="0" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#B97A45" stopOpacity="0.55" />
          <stop offset="1" stopColor="#5E3315" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path d="M 22 52 L 98 52" stroke="#5E3315" strokeWidth="2" opacity="0.7" />
      <path d="M 22 70 L 98 70" stroke="#5E3315" strokeWidth="2" opacity="0.7" />
      <path d="M 30 40 L 62 40" stroke="#E8DFCE" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" strokeDasharray="2 4" />
      <circle cx="88" cy="84" r="4" fill="#C9A24E" />
    </svg>
  )
}

function Cintura() {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden>
      <circle cx="60" cy="60" r="38" stroke="#3E2A1A" strokeWidth="13" />
      <circle cx="60" cy="60" r="38" stroke="#6E4526" strokeWidth="7" />
      <circle cx="60" cy="60" r="25" stroke="#3E2A1A" strokeWidth="11" />
      <circle cx="60" cy="60" r="25" stroke="#835430" strokeWidth="5" />
      <rect x="52" y="14" width="16" height="14" rx="4" stroke="#C9A24E" strokeWidth="3.5" />
      <path d="M 60 28 L 60 40" stroke="#C9A24E" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

const SCENA_ACCESSORIO: Record<string, { sfondo: string; svg: React.ReactNode }> = {
  foulard: { sfondo: "radial-gradient(120% 100% at 30% 20%, #F4EDE0, #E5D9C3)", svg: <Foulard /> },
  portacarte: { sfondo: "radial-gradient(120% 100% at 70% 20%, #F1E9DC, #DFD2BD)", svg: <Portacarte /> },
  cintura: { sfondo: "radial-gradient(120% 100% at 30% 30%, #F2ECE1, #E1D8C6)", svg: <Cintura /> },
}

/* ── piccoli glifi di servizio ── */
function IconaBusta() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4.5 6.5h11l-1 10.5h-9L4.5 6.5Z" strokeLinejoin="round" />
      <path d="M7.2 8.5V5.6a2.8 2.8 0 0 1 5.6 0v2.9" strokeLinecap="round" />
    </svg>
  )
}

function LogoApple() {
  return (
    <svg width="15" height="17" viewBox="0 0 15 18" fill="currentColor" aria-hidden>
      <path d="M12.4 9.5c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7C4.2 5 3 5.7 2.3 6.8c-1.4 2.4-.4 6 1 8 .7 1 1.5 2 2.5 2 1 0 1.4-.6 2.6-.6 1.2 0 1.5.6 2.6.6s1.8-1 2.4-1.9c.8-1.1 1.1-2.2 1.1-2.2s-2.1-.9-2.1-3.2ZM10.4 3.3c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.6-.8 2.5.9.1 1.8-.5 2.4-1.2Z" />
    </svg>
  )
}

function LogoGoogle() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.3h2.9c1.7-1.6 2.7-3.9 2.7-6.6Z" fill="#4285F4" />
      <path d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.4A9 9 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.9 10.6a5.4 5.4 0 0 1 0-3.4V4.8H.9a9 9 0 0 0 0 8.1l3-2.3Z" fill="#FBBC05" />
      <path d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 0 0 .9 4.8l3 2.4C4.6 5.1 6.6 3.6 9 3.6Z" fill="#EA4335" />
    </svg>
  )
}

function Spunta({ dim = 30 }: { dim?: number }) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <motion.path
        d="M4.5 12.5l5 5 10-11"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
    </svg>
  )
}

/* ── comparsa morbida allo scorrimento ── */
function Rivela({ children, ritardo = 0 }: { children: React.ReactNode; ritardo?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: ritardo, ease: [0.2, 0.65, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

function vai(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

/* ══ IL TEATRO — la borsa che segue la mano ══ */
function Teatro() {
  const config = useAtelier(s => s.config)
  const rx = useSpring(useMotionValue(0), { stiffness: 130, damping: 16 })
  const ry = useSpring(useMotionValue(0), { stiffness: 130, damping: 16 })
  const lx = useSpring(useMotionValue(50), { stiffness: 110, damping: 20 })
  const ly = useSpring(useMotionValue(30), { stiffness: 110, damping: 20 })
  const luce = useMotionTemplate`radial-gradient(340px 300px at ${lx}% ${ly}%, rgba(255, 244, 220, 0.55), rgba(255, 244, 220, 0) 70%)`

  const muovi = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    ry.set(nx * 18); rx.set(-ny * 12)
    lx.set(50 + nx * 60); ly.set(30 + ny * 50)
  }
  const lascia = () => { rx.set(0); ry.set(0); lx.set(50); ly.set(30) }

  return (
    <div className="at-teatro" onPointerMove={muovi} onPointerLeave={lascia}>
      <div className="at-teatro-prezzo">
        <small>Il tuo prezzo</small>
        <strong className="at-serif" data-testid="at-prezzo">{euro(prezzoBorsa(config))}</strong>
      </div>
      <motion.div
        className="at-teatro-borsa"
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 950 }}
        animate={{ scale: misuraDi(config.misura).scala }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
      >
        <BorsaVela config={config} uid="teatro" />
      </motion.div>
      <div className="at-teatro-ombra" />
      <motion.div className="at-teatro-luce" style={{ background: luce }} />
      <span className="at-teatro-hint">Muovi il puntatore per ruotarla</span>
    </div>
  )
}

/* ══ I PANNELLI DI VETRO ══ */
function PannelloMateria() {
  const config = useAtelier(s => s.config)
  const scegli = useAtelier(s => s.scegli)
  const pelle = pelleDi(config.pelle)
  const metallo = metalloDi(config.metallo)
  return (
    <motion.aside
      className="at-pannello"
      initial={{ opacity: 0, x: -34 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.2, 0.65, 0.25, 1] }}
    >
      <div className="at-campo">
        <div className="at-campo-testa">
          <span className="at-campo-nome">La pelle</span>
          <span className="at-campo-extra">{pelle.extra ? "+" + euro(pelle.extra) : "inclusa"}</span>
        </div>
        <div className="at-swatches">
          {PELLI.map(p => (
            <button
              key={p.id} type="button" className="at-swatch"
              style={{ "--sw": `linear-gradient(145deg, ${p.luce}, ${p.base} 55%, ${p.ombra})` } as React.CSSProperties}
              data-pelle={p.id} data-on={config.pelle === p.id}
              aria-label={`Pelle ${p.nome}`}
              onClick={() => scegli({ pelle: p.id })}
            />
          ))}
        </div>
        <span className="at-campo-valore">{pelle.nome} — {pelle.nota}</span>
      </div>

      <div className="at-campo">
        <div className="at-campo-testa">
          <span className="at-campo-nome">Il metallo</span>
          <span className="at-campo-extra">{metallo.extra ? "+" + euro(metallo.extra) : "incluso"}</span>
        </div>
        <div className="at-swatches">
          {METALLI.map(m => (
            <button
              key={m.id} type="button" className="at-swatch"
              style={{ "--sw": `linear-gradient(145deg, ${m.chiaro}, ${m.scuro})` } as React.CSSProperties}
              data-metallo={m.id} data-on={config.metallo === m.id}
              aria-label={`Metallo ${m.nome}`}
              onClick={() => scegli({ metallo: m.id })}
            />
          ))}
        </div>
        <span className="at-campo-valore">{metallo.nome}</span>
      </div>
    </motion.aside>
  )
}

function PannelloMisura() {
  const config = useAtelier(s => s.config)
  const scegli = useAtelier(s => s.scegli)
  const aggiungi = useAtelier(s => s.aggiungiBorsa)
  const pelle = pelleDi(config.pelle)
  const metallo = metalloDi(config.metallo)
  const misura = misuraDi(config.misura)
  const conIniziali = config.monogramma.trim().length > 0

  return (
    <motion.aside
      className="at-pannello"
      initial={{ opacity: 0, x: 34 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: 0.08, ease: [0.2, 0.65, 0.25, 1] }}
    >
      <div className="at-campo">
        <div className="at-campo-testa">
          <span className="at-campo-nome">La misura</span>
          <span className="at-campo-extra">{misura.cm} cm</span>
        </div>
        <div className="at-segmenti">
          {MISURE.map(m => (
            <button
              key={m.id} type="button" className="at-segmento"
              data-misura={m.id} data-on={config.misura === m.id}
              onClick={() => scegli({ misura: m.id })}
            >
              <b>{m.nome}</b>
              <small>{euro(m.prezzo)}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="at-campo">
        <div className="at-campo-testa">
          <span className="at-campo-nome">Le iniziali</span>
          <span className="at-campo-extra">{conIniziali ? "+" + euro(PREZZO_MONOGRAMMA) : "a mano, in foglia"}</span>
        </div>
        <div className="at-monogramma">
          <input
            value={config.monogramma}
            onChange={e => scegli({ monogramma: e.target.value })}
            placeholder="N M"
            aria-label="Le tue iniziali"
            maxLength={3}
          />
          <span>Fino a tre lettere, impresse a caldo accanto alla base.</span>
        </div>
      </div>

      <div className="at-conto">
        <div className="at-conto-riga"><span>Vela {misura.nome}</span><span>{euro(misura.prezzo)}</span></div>
        <div className="at-conto-riga"><span>{pelle.nome}</span><span>{pelle.extra ? "+" + euro(pelle.extra) : "—"}</span></div>
        <div className="at-conto-riga"><span>{metallo.nome}</span><span>{metallo.extra ? "+" + euro(metallo.extra) : "—"}</span></div>
        {conIniziali && (
          <div className="at-conto-riga"><span>Iniziali {config.monogramma.trim().toUpperCase()}</span><span>+{euro(PREZZO_MONOGRAMMA)}</span></div>
        )}
        <div className="at-conto-riga tot"><span>Totale</span><span>{euro(prezzoBorsa(config))}</span></div>
      </div>

      <button type="button" className="at-btn at-btn--avorio" onClick={aggiungi}>
        Aggiungi alla busta — {euro(prezzoBorsa(config))}
      </button>
    </motion.aside>
  )
}

/* ══ LA BUSTA — cassetto, dati, conferma ══ */
function Busta() {
  const righe = useAtelier(s => s.righe)
  const aperto = useAtelier(s => s.aperto)
  const cassa = useAtelier(s => s.cassa)
  const chiudi = useAtelier(s => s.chiudi)
  const cambiaQty = useAtelier(s => s.cambiaQty)
  const rimuovi = useAtelier(s => s.rimuovi)
  const paga = useAtelier(s => s.paga)
  const conferma = useAtelier(s => s.conferma)
  const nuovoOrdine = useAtelier(s => s.nuovoOrdine)

  const [vista, setVista] = useState<"busta" | "dati">("busta")
  useEffect(() => { if (!aperto) setVista("busta") }, [aperto])
  useEffect(() => { if (cassa.fase === "confermato") setVista("busta") }, [cassa.fase])

  /* La recita del pagamento: il wallet «autorizza» in un tempo credibile.
     Lo stato deriva dal tempo trascorso, non da un contatore dentro la
     closure — la lezione della demo KYC, dove i tick si perdevano. */
  useEffect(() => {
    if (cassa.fase !== "pagamento") return
    const t = setTimeout(() => conferma(), 2100)
    return () => clearTimeout(t)
  }, [cassa.fase, conferma])

  useEffect(() => {
    if (!aperto) return
    const suTasto = (e: KeyboardEvent) => { if (e.key === "Escape") chiudi() }
    window.addEventListener("keydown", suTasto)
    return () => window.removeEventListener("keydown", suTasto)
  }, [aperto, chiudi])

  const totale = subtotale(righe)
  const wallet = cassa.fase === "pagamento" && (cassa.metodo === "apple" || cassa.metodo === "google")
  const pagandoCarta = cassa.fase === "pagamento" && cassa.metodo === "carta"

  return (
    <>
      <AnimatePresence>
        {aperto && (
          <>
            <motion.div
              key="velo" className="at-velo"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={chiudi}
            />
            <motion.aside
              key="cassetto" className="at-cassetto" role="dialog" aria-label="La tua busta"
              initial={{ x: "104%" }} animate={{ x: 0 }} exit={{ x: "104%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <header className="at-cassetto-testa">
                <span className="at-cassetto-titolo">
                  {cassa.fase === "confermato" ? "Grazie" : vista === "dati" ? "I tuoi dati" : "La busta"}
                  {cassa.fase !== "confermato" && righe.length > 0 && <small>{pezzi(righe)} {pezzi(righe) === 1 ? "pezzo" : "pezzi"}</small>}
                </span>
                <button type="button" className="at-chiudi" onClick={chiudi} aria-label="Chiudi la busta">
                  <svg width="13" height="13" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                    <path d="M2 2l10 10M12 2L2 12" />
                  </svg>
                </button>
              </header>

              {cassa.fase === "confermato" ? (
                <div className="at-fatto">
                  <motion.div
                    className="at-fatto-cerchio"
                    initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  >
                    <Spunta />
                  </motion.div>
                  <h3>Ordine ricevuto.</h3>
                  <span className="at-fatto-ordine" data-testid="at-ordine">{cassa.ordine} · {euro(cassa.totale)}</span>
                  <p>L'atelier conferma via e-mail entro un giorno. Ogni pezzo parte da Milano in 5–7 giorni lavorativi.</p>
                  <button type="button" className="at-btn at-btn--nero" onClick={nuovoOrdine}>Continua a esplorare</button>
                </div>
              ) : righe.length === 0 ? (
                <div className="at-vuota">
                  <p className="at-serif">La busta è vuota.</p>
                  <span>Il bello di una busta vuota è riempirla.</span>
                  <button type="button" className="at-btn at-btn--filo" onClick={() => { chiudi(); vai("collezione") }}>
                    Scopri la collezione
                  </button>
                </div>
              ) : vista === "dati" ? (
                <>
                  <div className="at-dati">
                    <button type="button" className="at-indietro" onClick={() => setVista("busta")}>← Torna alla busta</button>
                    <label>E-mail
                      <input type="email" placeholder="nome@esempio.it" autoComplete="email" />
                    </label>
                    <label>Indirizzo
                      <input placeholder="Via, numero civico" autoComplete="street-address" />
                    </label>
                    <div className="at-dati-fila">
                      <label>CAP
                        <input placeholder="20121" inputMode="numeric" autoComplete="postal-code" />
                      </label>
                      <label>Città
                        <input placeholder="Milano" autoComplete="address-level2" />
                      </label>
                    </div>
                    <label>Carta
                      <input placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="cc-number" />
                    </label>
                  </div>
                  <footer className="at-cassa">
                    <div className="at-cassa-riga tot"><span>Totale</span><span className="at-serif">{euro(totale)}</span></div>
                    <button
                      type="button" className="at-btn at-btn--nero" style={{ width: "100%", marginTop: 10 }}
                      onClick={() => paga("carta")} disabled={pagandoCarta}
                    >
                      {pagandoCarta ? "Un attimo…" : `Paga ${euro(totale)}`}
                    </button>
                    <p className="at-cassa-nota">Demo del Lab: nessun pagamento reale, nessun dato viene inviato.</p>
                  </footer>
                </>
              ) : (
                <>
                  <div className="at-cassetto-corpo">
                    <AnimatePresence initial={false}>
                      {righe.map(r => {
                        const d = descriviRiga(r)
                        return (
                          <motion.div
                            key={r.chiave} className="at-riga" layout
                            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.28 }}
                          >
                            <div className="at-riga-thumb" style={r.tipo === "accessorio" ? { background: SCENA_ACCESSORIO[r.accessorio].sfondo } : undefined}>
                              {r.tipo === "borsa"
                                ? <BorsaVela config={r.config} uid={`mini-${r.chiave.replace(/[^a-z0-9]/gi, "")}`} />
                                : SCENA_ACCESSORIO[r.accessorio].svg}
                            </div>
                            <div className="at-riga-corpo">
                              <span className="at-riga-nome">{d.nome}</span>
                              <span className="at-riga-dett">{d.dettaglio}</span>
                              <div className="at-riga-piede">
                                <span className="at-qty">
                                  <button type="button" onClick={() => cambiaQty(r.chiave, -1)} aria-label="Riduci quantità">−</button>
                                  <b>{r.qty}</b>
                                  <button type="button" onClick={() => cambiaQty(r.chiave, 1)} aria-label="Aumenta quantità">+</button>
                                </span>
                                <span className="at-riga-prezzo">{euro(r.prezzo * r.qty)}</span>
                              </div>
                            </div>
                            <button type="button" className="at-rimuovi" onClick={() => rimuovi(r.chiave)}>togli</button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>

                  <footer className="at-cassa">
                    <div className="at-cassa-riga"><span>Spedizione e resi</span><span>offerti</span></div>
                    <div className="at-cassa-riga tot">
                      <span>Totale</span>
                      <span className="at-serif" data-testid="at-subtotale">{euro(totale)}</span>
                    </div>
                    <div className="at-express">
                      <button type="button" className="at-pay at-pay--apple" onClick={() => paga("apple")} aria-label="Paga con Apple Pay">
                        <LogoApple /> Pay
                      </button>
                      <button type="button" className="at-pay at-pay--google" onClick={() => paga("google")} aria-label="Paga con Google Pay">
                        <LogoGoogle /> Pay
                      </button>
                    </div>
                    <div className="at-oppure">oppure</div>
                    <button type="button" className="at-btn at-btn--filo" style={{ width: "100%" }} onClick={() => setVista("dati")}>
                      Procedi all'acquisto
                    </button>
                    <p className="at-cassa-nota">Demo del Lab: nessun pagamento reale, nessun dato viene inviato.</p>
                  </footer>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* il foglio del wallet, sopra tutto */}
      <AnimatePresence>
        {wallet && (
          <motion.div
            key="foglio" className="at-foglio-velo"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="at-foglio"
              initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="at-foglio-testa">
                <b>{cassa.fase === "pagamento" && cassa.metodo === "apple" ? "Apple Pay" : "Google Pay"} · demo</b>
                <span>MAAR MILANO</span>
              </div>
              <div className="at-foglio-riga"><span>Borse e accessori</span><span>{euro(totale)}</span></div>
              <div className="at-foglio-riga"><span>Spedizione</span><span>offerta</span></div>
              <div className="at-foglio-riga tot"><span>Totale</span><span>{euro(totale)}</span></div>
              <FoglioStato />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** Dentro il foglio: anello che gira, poi la spunta. Il passaggio dipende
 *  dal tempo trascorso dall'apertura, non da un contatore. */
function FoglioStato() {
  const [fatto, setFatto] = useState(false)
  useEffect(() => {
    const via = Date.now()
    const t = setInterval(() => { if (Date.now() - via >= 1300) { setFatto(true); clearInterval(t) } }, 120)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="at-foglio-stato" aria-live="polite">
      {fatto ? (
        <>
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 15 }}
            style={{ color: "#1B1916" }}
          >
            <Spunta dim={34} />
          </motion.span>
          <p>Autorizzato</p>
        </>
      ) : (
        <>
          <motion.svg width="34" height="34" viewBox="0 0 34 34" aria-hidden
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}>
            <circle cx="17" cy="17" r="14" stroke="rgba(27,25,22,0.15)" strokeWidth="3" fill="none" />
            <path d="M 17 3 A 14 14 0 0 1 31 17" stroke="#1B1916" strokeWidth="3" fill="none" strokeLinecap="round" />
          </motion.svg>
          <p>Conferma sul dispositivo…</p>
        </>
      )}
    </div>
  )
}

/* ══ LA PAGINA ══ */
export default function AtelierApp({ onOrdine }: { onOrdine?: (totale: number) => void }) {
  const config = useAtelier(s => s.config)
  const righe = useAtelier(s => s.righe)
  const cassa = useAtelier(s => s.cassa)
  const apri = useAtelier(s => s.apri)
  const aggiungiAccessorio = useAtelier(s => s.aggiungiAccessorio)
  const nPezzi = pezzi(righe)

  /* Il segnale «qualcuno è arrivato in fondo»: parte una volta per ordine. */
  const ordineVisto = useRef<string | null>(null)
  useEffect(() => {
    if (cassa.fase === "confermato" && ordineVisto.current !== cassa.ordine) {
      ordineVisto.current = cassa.ordine
      onOrdine?.(cassa.totale)
    }
  }, [cassa, onOrdine])

  return (
    <div className="at-root">
      {/* ── navigazione di vetro ── */}
      <nav className="at-nav">
        <div className="at-nav-links">
          <button type="button" className="at-nav-link" onClick={() => vai("collezione")}>Collezione</button>
          <button type="button" className="at-nav-link" onClick={() => vai("atelier")}>Atelier</button>
          <button type="button" className="at-nav-link" onClick={() => vai("maison")}>Maison</button>
        </div>
        <div className="at-brand">
          <span className="at-brand-nome">MAAR</span>
          <span className="at-brand-citta">Milano</span>
        </div>
        <div className="at-nav-destra">
          <button type="button" className="at-busta-btn" onClick={apri} aria-label="Apri la busta">
            <IconaBusta />
            <span className="at-busta-parola">Busta</span>
            {nPezzi > 0 && (
              <motion.span
                key={nPezzi} className="at-badge" data-testid="at-badge"
                initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 16 }}
              >
                {nPezzi}
              </motion.span>
            )}
          </button>
        </div>
      </nav>

      {/* ── hero ── */}
      <header className="at-hero">
        <motion.div className="at-seta at-seta-a" aria-hidden
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 19, ease: "easeInOut" }} />
        <motion.div className="at-seta at-seta-b" aria-hidden
          animate={{ x: [0, 50, 0], y: [0, -24, 0] }} transition={{ repeat: Infinity, duration: 23, ease: "easeInOut" }} />

        <div className="at-hero-griglia">
          <div>
            <motion.span className="at-kicker"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              Autunno – Inverno 2026 · Milano
            </motion.span>
            <motion.h1 className="at-h1"
              initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.2, 0.65, 0.25, 1] }}>
              Cucita per durare <em>una vita.</em>
            </motion.h1>
            <motion.p className="at-hero-sub"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.38 }}>
              Vela è una borsa sola, fatta bene: cinque pelli, tre misure, le tue iniziali
              impresse a caldo. Disegnata e cucita nel nostro atelier di Milano.
            </motion.p>
            <motion.div className="at-hero-cta"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.52 }}>
              <button type="button" className="at-btn at-btn--nero" onClick={() => vai("atelier")}>Componi la tua Vela</button>
              <button type="button" className="at-btn at-btn--filo" onClick={() => vai("collezione")}>La collezione</button>
            </motion.div>
          </div>

          <motion.div className="at-hero-scena"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.65, 0.25, 1] }}>
            <motion.div className="at-hero-borsa"
              animate={{ y: [-7, 7, -7] }} transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut" }}>
              <BorsaVela config={{ ...config, monogramma: config.monogramma || "" }} uid="hero" />
            </motion.div>
            <div className="at-hero-ombra" aria-hidden />
            <motion.div className="at-hero-targa"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}>
              <strong className="at-serif">Vela · {pelleDi(config.pelle).nome}</strong>
              <span>da {euro(MISURE[0].prezzo)} · fatta a mano</span>
            </motion.div>
          </motion.div>
        </div>
        <span className="at-scorri" aria-hidden>Scorri</span>
      </header>

      {/* ── le promesse ── */}
      <div className="at-fascia" role="presentation">
        <span>Fatto a mano a Milano</span>
        <span>Concia al vegetale</span>
        <span>Spedizione e resi offerti</span>
        <span>Garanzia a vita</span>
      </div>

      {/* ── collezione ── */}
      <section className="at-collezione" id="collezione">
        <Rivela>
          <div className="at-sez-testa">
            <div>
              <span className="at-kicker">La collezione</span>
              <h2 className="at-h2">Pochi pezzi, nessuna scusa.</h2>
            </div>
            <p className="at-sez-nota">Ogni pezzo nasce accanto alla Vela, con le stesse pelli e le stesse mani.</p>
          </div>
        </Rivela>

        <div className="at-griglia-prodotti">
          {ACCESSORI.map((a, i) => (
            <Rivela key={a.id} ritardo={i * 0.08}>
              <article className="at-prodotto">
                <div className="at-prod-scena" style={{ background: SCENA_ACCESSORIO[a.id].sfondo }}>
                  {SCENA_ACCESSORIO[a.id].svg}
                </div>
                <div className="at-prod-corpo">
                  <span className="at-prod-nome">{a.nome}</span>
                  <span className="at-prod-materia">{a.materia}</span>
                  <div className="at-prod-piede">
                    <span className="at-prod-prezzo">{euro(a.prezzo)}</span>
                    <button type="button" className="at-prod-aggiungi" aria-label={`Aggiungi ${a.nome} alla busta`}
                      onClick={() => aggiungiAccessorio(a.id)}>
                      Aggiungi
                    </button>
                  </div>
                </div>
              </article>
            </Rivela>
          ))}

          <Rivela ritardo={0.24}>
            <article className="at-prodotto">
              <div className="at-prod-scena" style={{ background: "radial-gradient(120% 100% at 50% 15%, #F0E9DA, #DCD2BC)" }}>
                <BorsaVela config={{ pelle: "bosco", metallo: "oro", misura: "media", monogramma: "" }} uid="card" />
              </div>
              <div className="at-prod-corpo">
                <span className="at-prod-nome">Borsa Vela</span>
                <span className="at-prod-materia">cinque pelli, tre misure, le tue iniziali</span>
                <div className="at-prod-piede">
                  <span className="at-prod-prezzo">da {euro(MISURE[0].prezzo)}</span>
                  <button type="button" className="at-prod-aggiungi" onClick={() => vai("atelier")}>
                    Componi
                  </button>
                </div>
              </div>
            </article>
          </Rivela>
        </div>
      </section>

      {/* ── l'atelier ── */}
      <section className="at-atelier" id="atelier">
        <Rivela>
          <div className="at-atelier-testa">
            <span className="at-kicker">L'atelier digitale</span>
            <h2 className="at-h2">Componi la tua Vela.</h2>
            <p>Ruota la borsa con il puntatore, prova le pelli, imprimi le iniziali.
              Il prezzo si riscrive a ogni scelta — trasparente com'è giusto che sia.</p>
          </div>
        </Rivela>

        <div className="at-sala">
          <PannelloMateria />
          <Teatro />
          <PannelloMisura />
        </div>
        <p className="at-atelier-nota">Il disegno è vettoriale: 45 combinazioni senza scaricare una sola fotografia.</p>
      </section>

      {/* ── maison / piede ── */}
      <footer className="at-piede" id="maison">
        <span className="at-brand-nome at-serif">MAAR</span>
        <span className="at-brand-citta">Milano</span>
        <p>
          Questa boutique è una demo del Lab di Nadia Maar: catalogo, configuratore e cassa
          funzionano davvero, ma nessun pagamento è reale e nessun ordine parte.
          I marchi dei wallet compaiono solo per mostrare il flusso di acquisto.
        </p>
      </footer>

      <Busta />
    </div>
  )
}
