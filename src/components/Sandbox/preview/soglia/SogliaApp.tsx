import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from "framer-motion"
import AuthCard, { LogoMarchio, SchedaFinta } from "./AuthCard"
import { COLORI, type LogoId, useFlusso, useMarchio } from "./store"

/* ══════════════════════════════════════════════════════════════════════════
   SOGLIA — la pagina di lancio.

   Un prodotto di autenticazione inventato, presentato come lo presenterebbe
   chi lo vende davvero: nessuna fotografia, nessuno stock, nessuno
   screenshot. IL PRODOTTO È L'IMMAGINE — schede di accesso di vetro
   disposte come prototipi in uno studio buio.

   Due schede sono vive e indipendenti: quella al centro dell'apertura e
   quella dentro la finestra del banco da lavoro. Le impostazioni del
   marchio invece sono condivise, perché è quello il punto della sezione
   «Il tuo marchio»: si sposta un cursore e cambia tutto ciò che è in
   pagina, non un pezzo isolato.

   Le animazioni seguono una regola sola: raccontano il prodotto, non se
   stesse. L'impulso che viaggia nel diagramma È il token; il bordo di
   luce che gira sulla scheda dell'agenzia È il riflettore. Niente coriandoli.
══════════════════════════════════════════════════════════════════════════ */

/* ── comparsa morbida, sfalsata: la pagina si accende, non salta ── */
function Rivela({ children, ritardo = 0, className }: {
  children: React.ReactNode; ritardo?: number; className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: ritardo, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Sopra({ children }: { children: React.ReactNode }) {
  return <div className="sg-sopra-riga"><span className="sg-sopra">{children}</span></div>
}

function Apertura({ etichetta, titolo, testo }: { etichetta: string; titolo: string; testo?: string }) {
  return (
    <Rivela>
      <Sopra>{etichetta}</Sopra>
      <h2 className="sg-titolo">{titolo}</h2>
      {testo && <p className="sg-sommario">{testo}</p>}
    </Rivela>
  )
}

/* ── il logotipo entra lettera per lettera, sfocato come dietro un vetro
     che si pulisce. Il gradiente sta su OGNI lettera: background-clip
     non attraversa i figli trasformati. ── */
function Logotipo({ testo }: { testo: string }) {
  return (
    <h1 className="sg-logotipo" aria-label={testo}>
      {testo.split("").map((ch, i) => (
        <motion.span
          key={i} aria-hidden className="sg-logotipo-lettera"
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.12 + i * 0.07, duration: 0.75, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {ch}
        </motion.span>
      ))}
    </h1>
  )
}

/* ── granelli di luce nell'apertura. Le posizioni escono da un hash
     dell'indice, non dal caso: due render, due visite, stessa scena. ── */
function Pulviscolo({ quanti = 16 }: { quanti?: number }) {
  const grani = Array.from({ length: quanti }, (_, i) => {
    const h = (k: number) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s) }
    return {
      sx: h(1) * 100, alto: 14 + h(2) * 72,
      durata: 6 + h(3) * 7, ritardo: h(4) * 6, dim: 2 + h(5) * 2,
    }
  })
  return (
    <div className="sg-pulviscolo" aria-hidden>
      {grani.map((g, i) => (
        <motion.span
          key={i}
          style={{ left: `${g.sx}%`, top: `${g.alto}%`, width: g.dim, height: g.dim }}
          animate={{ y: [0, -36], opacity: [0, 0.8, 0] }}
          transition={{ duration: g.durata, delay: g.ritardo, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

/* ── la scheda centrale si inclina verso il puntatore: vetro sospeso,
     non pagina stampata. Solo dove c'è un puntatore fine. ── */
function Inclinabile({ children }: { children: React.ReactNode }) {
  const rx = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 })
  const fine = typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches

  const muovi = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!fine) return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 9)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 7)
  }
  const lascia = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      onPointerMove={muovi} onPointerLeave={lascia}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 950 }}
    >
      {children}
    </motion.div>
  )
}

/* ── un numero che sale fino al suo valore quando entra in vista ── */
function Contatore({ fino, decimali = 0, prefisso = "", suffisso = "" }: {
  fino: number; decimali?: number; prefisso?: string; suffisso?: string
}) {
  const rif = useRef<HTMLSpanElement>(null)
  const visto = useInView(rif, { once: true, margin: "-40px" })
  const [v, setV] = useState(0)

  useEffect(() => {
    if (!visto) return
    let raf = 0
    const t0 = performance.now()
    const DURATA = 1500
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / DURATA)
      setV(fino * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visto, fino])

  return (
    <span ref={rif} className="sg-stat-num">
      {prefisso}{v.toLocaleString("it-IT", { minimumFractionDigits: decimali, maximumFractionDigits: decimali })}{suffisso}
    </span>
  )
}

/* ══ icone: linea da 1.5px, mai riempimento, mai colore ══ */
const ico = {
  width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
}

const FUNZIONI: { nome: string; icona: React.ReactNode }[] = [
  { nome: "Single Sign-On", icona: <svg {...ico}><path d="M13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13" /><path d="M4 12h9M10 8.5 13.5 12 10 15.5" /></svg> },
  { nome: "Password", icona: <svg {...ico}><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14v2" /></svg> },
  { nome: "Doppio fattore", icona: <svg {...ico}><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M12 17.5h.01M9.5 9.5l1.7 1.7 3.3-3.4" /></svg> },
  { nome: "Accesso social", icona: <svg {...ico}><circle cx="9" cy="9" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="11" r="2.2" /><path d="M14.8 18.4A4.3 4.3 0 0 1 21 16.6" /></svg> },
  { nome: "Ruoli e permessi", icona: <svg {...ico}><path d="M12 3.5 20 8l-8 4.5L4 8l8-4.5Z" /><path d="m4 12 8 4.5L20 12M4 16l8 4.5L20 16" /></svg> },
  { nome: "Codice magico", icona: <svg {...ico}><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m3.8 6.8 8.2 6 8.2-6" /><path d="M17.5 2.5v2M20.5 3.5h-2" /></svg> },
]

const INTEGRAZIONI: { titolo: string; testo: string; tag: string[]; icona: React.ReactNode }[] = [
  {
    titolo: "Un componente, non un cantiere",
    testo: "Si installa da npm e si monta dove serve. Il resto — sessioni, rotazione delle chiavi, scadenze — resta dietro le quinte.",
    tag: ["React", "Vue", "Server-side"],
    icona: <svg {...ico}><path d="M9 7.5 4.5 12 9 16.5M15 7.5 19.5 12 15 16.5" /></svg>,
  },
  {
    titolo: "Le regole stanno nel token",
    testo: "Ruolo, organizzazione e permessi viaggiano firmati nella sessione: il tuo backend li legge senza chiamarci.",
    tag: ["JWT", "RBAC", "Webhook"],
    icona: <svg {...ico}><path d="M12 3.5c3 2 5.5 2.4 7.5 2.4v6c0 4.2-3 7.4-7.5 8.6-4.5-1.2-7.5-4.4-7.5-8.6v-6c2 0 4.5-.4 7.5-2.4Z" /><path d="m9 12 2 2 4-4.2" /></svg>,
  },
  {
    titolo: "L'azienda entra come vuole",
    testo: "SAML e OIDC per chi ha già un identity provider; SCIM per creare e togliere gli utenti da solo, senza ticket.",
    tag: ["SAML 2.0", "OIDC", "SCIM"],
    icona: <svg {...ico}><rect x="3.5" y="9" width="7" height="11" rx="1.5" /><rect x="13.5" y="4" width="7" height="16" rx="1.5" /><path d="M6 12.5h2M6 16h2M16 8h2M16 11.5h2M16 15h2" /></svg>,
  },
]

const LOGHI: LogoId[] = ["soglia", "cerchio", "chiave", "scudo"]

/* ── marchi inventati per il nastro: nomi italiani plausibili, wordmark
     puri. Nessun logo vero: qui niente è rubato, nemmeno la fiducia. ── */
const CLIENTI = ["Nordica", "Fabbrica 44", "Lumen", "Cassiopea", "Altavia", "Perno", "Stelvio", "Brera Studio"]

function SegnoCliente({ i }: { i: number }) {
  const p = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true }
  const segni = [
    <svg key="a" {...p}><path d="M5 19 12 4l7 15" /></svg>,
    <svg key="b" {...p}><rect x="5" y="5" width="14" height="14" rx="3" /></svg>,
    <svg key="c" {...p}><circle cx="12" cy="12" r="7.5" /></svg>,
    <svg key="d" {...p}><path d="M4 17c3-8 13-8 16 0" /></svg>,
  ]
  return segni[i % segni.length]
}

/* ── le difese elencate accanto al radar: quattro, concrete, senza fuffa ── */
const DIFESE: { titolo: string; testo: string; icona: React.ReactNode }[] = [
  {
    titolo: "Password trapelate",
    testo: "Ogni password nuova viene confrontata con gli archivi delle violazioni note: se è già in giro, non entra.",
    icona: <svg {...ico} width="20" height="20"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10M9.5 15l1.7 1.7 3.3-3.4" /></svg>,
  },
  {
    titolo: "Bot alla porta",
    testo: "Ritmo dei tentativi, firma del dispositivo, attese progressive: gli script restano fuori senza CAPTCHA per gli umani.",
    icona: <svg {...ico} width="20" height="20"><rect x="5" y="8" width="14" height="11" rx="2" /><path d="M12 8V5M9.5 12.5h.01M14.5 12.5h.01M9 16h6" /></svg>,
  },
  {
    titolo: "Sessioni revocabili",
    testo: "Ogni token ha una scadenza corta e una firma con chiavi che ruotano: un dispositivo perso si spegne dal pannello.",
    icona: <svg {...ico} width="20" height="20"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>,
  },
  {
    titolo: "Ogni ingresso lascia traccia",
    testo: "Chi, quando, da dove, con quale metodo: il registro degli accessi si legge dal pannello e arriva via webhook.",
    icona: <svg {...ico} width="20" height="20"><path d="M5 4.5h14v15H5z" /><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" /></svg>,
  },
]

/* ── i blip del radar: posizioni fisse, pulsazioni sfalsate. Sono le
     minacce viste e archiviate, non coriandoli. ── */
const BLIP = [
  { x: 68, y: 26, ritardo: 0 },
  { x: 30, y: 38, ritardo: 1.4 },
  { x: 62, y: 66, ritardo: 2.6 },
  { x: 22, y: 62, ritardo: 3.8 },
]

function Radar() {
  return (
    <div className="sg-radar-scena">
      <div className="sg-radar" role="img" aria-label="Radar delle difese in ascolto">
        <span className="sg-radar-assi" aria-hidden />
        <motion.div className="sg-radar-spazzata" aria-hidden
          animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
        {BLIP.map((b, i) => (
          <motion.span key={i} className="sg-blip" style={{ left: `${b.x}%`, top: `${b.y}%` }} aria-hidden
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.25, 0.6] }}
            transition={{ duration: 3, delay: b.ritardo, repeat: Infinity, ease: "easeInOut" }} />
        ))}
        <div className="sg-radar-centro" aria-hidden>
          <span>
            <svg {...ico}><path d="M12 3.5c3 2 5.5 2.4 7.5 2.4v6c0 4.2-3 7.4-7.5 8.6-4.5-1.2-7.5-4.4-7.5-8.6v-6c2 0 4.5-.4 7.5-2.4Z" /><path d="m9 12 2 2 4-4.2" /></svg>
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── l'orbita: sei metodi che girano intorno alla stessa sessione. Gli
     anelli ruotano piano, le icone contro-ruotano per restare dritte. ── */
function Orbita() {
  /* I raggi sono in percento del quadro, gli stessi degli anelli disegnati
     dal CSS (inset 11% → raggio 39%, inset 30% → raggio 20%): le icone
     stanno SULLA riga, non vicino. */
  const anello = (voci: typeof FUNZIONI, raggio: number, durata: number, verso: 1 | -1) => (
    <motion.div style={{ position: "absolute", inset: 0 }} aria-hidden
      animate={{ rotate: 360 * verso }} transition={{ duration: durata, repeat: Infinity, ease: "linear" }}>
      {voci.map((f, i) => {
        const a = (i / voci.length) * Math.PI * 2 - Math.PI / 2
        return (
          <div key={f.nome} className="sg-orb-icona" style={{
            left: `${50 + Math.cos(a) * raggio}%`,
            top: `${50 + Math.sin(a) * raggio}%`,
          }}>
            <motion.span style={{ display: "grid", placeItems: "center" }}
              animate={{ rotate: -360 * verso }} transition={{ duration: durata, repeat: Infinity, ease: "linear" }}>
              {f.icona}
            </motion.span>
          </div>
        )
      })}
    </motion.div>
  )

  return (
    <div className="sg-orbita-scena">
      <div className="sg-orbita">
        <span className="sg-anello sg-anello--uno" aria-hidden />
        <span className="sg-anello sg-anello--due" aria-hidden />
        {anello(FUNZIONI.slice(0, 3), 39, 56, 1)}
        {anello(FUNZIONI.slice(3), 20, 42, -1)}
        <div className="sg-orbita-centro">
          <LogoMarchio id="soglia" dim={26} />
        </div>
      </div>
      <p className="sg-orbita-dida">
        Password, codice, SSO, social, doppio fattore, ruoli: strade diverse,
        una sola sessione firmata. Il tuo prodotto ne verifica una, non sei.
      </p>
    </div>
  )
}

const DOMANDE: { d: string; r: string }[] = [
  {
    d: "Posso portare via i miei utenti?",
    r: "Sempre. Esportazione completa in CSV o via API — credenziali comprese, con gli hash nel formato standard. Gli utenti sono tuoi: noi custodiamo, non tratteniamo.",
  },
  {
    d: "Dove stanno i dati?",
    r: "In un data center nell'Unione Europea, con replica in una seconda regione europea. Il contratto di trattamento dati è parte dell'offerta, non un allegato da chiedere.",
  },
  {
    d: "Quanto ci vuole a integrarlo?",
    r: "Il primo accesso funzionante arriva in un pomeriggio: si installa il componente, si incolla la chiave del progetto, si sceglie dove atterra chi entra. L'SSO aziendale richiede un giro in più con l'IT del cliente — giorni, non mesi.",
  },
  {
    d: "E se un giorno Soglia chiude?",
    r: "Il codice del componente è aperto e il token è un JWT standard: il tuo backend continuerebbe a verificare le sessioni emesse. Nessuna dipendenza che non si possa sciogliere.",
  },
]

function Faq() {
  const [aperta, setAperta] = useState<number | null>(0)
  return (
    <div className="sg-faq">
      {DOMANDE.map((x, i) => (
        <Rivela key={x.d} className="sg-domanda" ritardo={i * 0.05}>
          <button
            type="button" className="sg-domanda-testa"
            aria-expanded={aperta === i}
            onClick={() => setAperta(aperta === i ? null : i)}
          >
            {x.d}
            <svg className="sg-domanda-piu" width="16" height="16" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M8 3v10M3 8h10" />
            </svg>
          </button>
          <AnimatePresence initial={false}>
            {aperta === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <p className="sg-domanda-corpo">{x.r}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Rivela>
      ))}
    </div>
  )
}

/* ── il diagramma: browser → Soglia → il tuo backend. L'impulso che corre
     È il racconto: credenziali all'andata, token firmato al ritorno. ── */
function Flusso() {
  return (
    <div className="sg-flusso">
      <Rivela className="sg-nodo">
        <span className="sg-nodo-icona">
          <svg {...ico}><rect x="3" y="4.5" width="18" height="15" rx="2" /><path d="M3 8.5h18M6 6.6h.01M8.2 6.6h.01" /></svg>
        </span>
        <h3>Il browser</h3>
        <p>Chi entra scrive le credenziali nella scheda di Soglia, mai nel tuo codice.</p>
      </Rivela>

      <div className="sg-tratta" aria-hidden>
        <span className="sg-tratta-eti">credenziali</span>
        <motion.span className="sg-impulso"
          animate={{ left: ["2%", "94%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, times: [0, 0.15, 0.85, 1], repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }} />
      </div>

      <Rivela className="sg-nodo" ritardo={0.1}>
        <span className="sg-nodo-icona">
          <motion.span className="sg-nodo-eco" aria-hidden
            animate={{ scale: [1, 1.65], opacity: [0.55, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }} />
          <LogoMarchio id="soglia" dim={22} />
        </span>
        <h3>Soglia</h3>
        <p>Verifica, chiede il secondo fattore se serve, e firma una sessione.</p>
      </Rivela>

      <div className="sg-tratta" aria-hidden>
        <span className="sg-tratta-eti">JWT firmato</span>
        <motion.span className="sg-impulso"
          animate={{ left: ["2%", "94%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, times: [0, 0.15, 0.85, 1], repeat: Infinity, repeatDelay: 2.4, delay: 2.3, ease: "easeInOut" }} />
      </div>

      <Rivela className="sg-nodo" ritardo={0.2}>
        <span className="sg-nodo-icona">
          <svg {...ico}><rect x="4" y="4" width="16" height="7" rx="1.5" /><rect x="4" y="13" width="16" height="7" rx="1.5" /><path d="M7.5 7.5h.01M7.5 16.5h.01" /></svg>
        </span>
        <h3>Il tuo backend</h3>
        <p>Legge ruolo e organizzazione dal token, senza chiamarci a ogni richiesta.</p>
      </Rivela>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */

export interface SogliaAppProps {
  /** Segnala che il visitatore è arrivato in fondo a un accesso: è il
   *  fondo dell'imbuto di questa demo. */
  onAccesso?: () => void
}

export default function SogliaApp({ onAccesso }: SogliaAppProps) {
  const flussoApertura = useFlusso()
  const flussoBanco = useFlusso()

  const { colore, raggio, logo, testoPulsante, chiaro,
    setColore, setRaggio, setLogo, setTestoPulsante, setChiaro } = useMarchio()

  /* Basta che UNO dei due widget arrivi in fondo. */
  const dentro = flussoApertura.passo === "fatto" || flussoBanco.passo === "fatto"
  useEffect(() => { if (dentro) onAccesso?.() }, [dentro, onAccesso])

  return (
    <div className="sg-root">
      <div className="sg-atmosfera" aria-hidden>
        <div className="sg-griglia" />
        <div className="sg-griglia sg-griglia--bassa" />
        <div className="sg-faro" />
      </div>

      <div className="sg-corpo">
        {/* ══ NAVIGAZIONE ══ */}
        <nav className="sg-nav">
          <div className="sg-nav-int">
            <span className="sg-marchio">
              <LogoMarchio id={logo} dim={18} />
              <span className="sg-marchio-testo">Soglia</span>
            </span>
            <div className="sg-nav-centro">
              <button type="button" className="sg-nav-link">Prodotto</button>
              <button type="button" className="sg-nav-link">Documentazione</button>
              <button type="button" className="sg-nav-link">Sicurezza</button>
              <button type="button" className="sg-nav-link">Registro</button>
            </div>
            <div className="sg-nav-destra">
              <button type="button" className="sg-pill sg-pill--vuoto">Accedi</button>
              <button type="button" className="sg-pill">Inizia</button>
            </div>
          </div>
        </nav>

        {/* ══ APERTURA ══ */}
        <header className="sg-apertura" style={{ position: "relative" }}>
          <Pulviscolo />
          <div className="sg-contenitore">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Sopra>Presentiamo</Sopra>
            </motion.div>
            <Logotipo testo="Soglia" />
            <motion.p className="sg-apertura-sub"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}>
              Accesso, SSO aziendale e secondo fattore. Un componente da montare,
              non un trimestre di lavoro.
            </motion.p>
            <motion.div className="sg-apertura-cta"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}>
              <button type="button" className="sg-pill sg-pill--grande"
                onClick={() => document.getElementById("apertura-email")?.focus({ preventScroll: false })}>
                Prova l&apos;accesso
              </button>
              <button type="button" className="sg-pill sg-pill--vuoto sg-pill--grande"
                onClick={() => document.querySelector(".sg-banco")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                Rivesti la scheda
              </button>
            </motion.div>

            {/* il ventaglio: due scenografie che galleggiano, il widget vivo
                al centro, inclinato verso il puntatore */}
            <motion.div className="sg-ventaglio"
              initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 0.61, 0.36, 1] }}>
              <div className="sg-ventaglio-lato sx">
                <motion.div animate={{ y: [0, -11, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
                  <SchedaFinta variante="codice" />
                </motion.div>
              </div>
              <div className="sg-ventaglio-lato dx">
                <motion.div animate={{ y: [0, -11, 0] }} transition={{ duration: 7, delay: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                  <SchedaFinta variante="sso" />
                </motion.div>
              </div>
              <div className="sg-ventaglio-centro">
                <Inclinabile>
                  <AuthCard flusso={flussoApertura} uid="apertura" />
                </Inclinabile>
              </div>
            </motion.div>

            {/* l'interruttore chiaro/scuro è una funzione del prodotto */}
            <div className="sg-tema">
              <div className="sg-tema-gruppo" role="group" aria-label="Tema della scheda">
                <button type="button" className="sg-tema-btn" data-on={!chiaro} data-tema="scuro" onClick={() => setChiaro(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
                  </svg>
                  Scuro
                </button>
                <button type="button" className="sg-tema-btn" data-on={chiaro} data-tema="chiaro" onClick={() => setChiaro(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
                  </svg>
                  Chiaro
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ══ IL NASTRO — chi ci ha già messo la porta ══ */}
        <section className="sg-nastro-sezione">
          <div className="sg-contenitore">
            <Rivela><Sopra>La porta di chi spedisce ogni giorno</Sopra></Rivela>
          </div>
          <Rivela className="sg-nastro" ritardo={0.1}>
            <div className="sg-nastro-fila">
              {/* due copie della stessa fila: quando la prima esce, la
                  seconda è già lì — il nastro non ha cuciture */}
              {[0, 1].map(copia => (
                <React.Fragment key={copia}>
                  {CLIENTI.map((nome, i) => (
                    <span key={`${copia}-${nome}`} className="sg-cliente" aria-hidden={copia === 1}>
                      <SegnoCliente i={i} /> {nome}
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </Rivela>
        </section>

        {/* ══ FUNZIONI ══ */}
        <section className="sg-sezione">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Tutto quello che serve per entrare"
              titolo="Sei modi di dire «sono io»."
              testo="Attivi quelli che ti servono dal pannello, senza toccare il codice. Chi entra vede solo la porta che gli hai lasciato aperta."
            />
            <div className="sg-funzioni">
              <motion.div className="sg-funzioni-linea" aria-hidden
                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }} />
              {FUNZIONI.map((f, i) => (
                <div key={f.nome} className="sg-funzione">
                  <motion.span className="sg-funzione-tile"
                    initial={{ opacity: 0, scale: 0.55 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 + i * 0.09 }}>
                    {f.icona}
                  </motion.span>
                  <motion.span className="sg-funzione-nome"
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: 0.25 + i * 0.09, duration: 0.5 }}>
                    {f.nome}
                  </motion.span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ COME FUNZIONA ══ */}
        <section className="sg-sezione">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Come funziona"
              titolo="Le credenziali entrano. Esce un token."
              testo="Il tuo prodotto non vede mai una password: riceve una sessione firmata con dentro ruolo e organizzazione, e la verifica da solo."
            />
            <Flusso />

            <div className="sg-statistiche">
              <Rivela className="sg-stat">
                <Contatore fino={99.99} decimali={2} suffisso="%" />
                <span className="sg-stat-eti">di disponibilità negli ultimi dodici mesi</span>
              </Rivela>
              <Rivela className="sg-stat" ritardo={0.08}>
                <Contatore fino={78} prefisso="< " suffisso=" ms" />
                <span className="sg-stat-eti">per verificare un accesso, mediana europea</span>
              </Rivela>
              <Rivela className="sg-stat" ritardo={0.16}>
                <Contatore fino={10000} />
                <span className="sg-stat-eti">sessioni firmate ogni giorno — numeri di scena, come tutto qui</span>
              </Rivela>
            </div>
          </div>
        </section>

        {/* ══ BANCO DA LAVORO ══ */}
        <section className="sg-sezione">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Estendibile per progetto"
              titolo="Il tuo marchio. Il tuo stile."
              testo="Sposta un cursore e la scheda cambia davanti a te: colore, raggio, logo, parole. Nessun foglio di stile da riscrivere, nessun ticket al nostro supporto."
            />

            <div className="sg-banco">
              {/* la finestra finta con dentro il secondo widget vivo */}
              <Rivela className="sg-finestra">
                <div className="sg-finestra-barra">
                  <span className="sg-semaforo"><i /><i /><i /></span>
                  <span className="sg-finestra-url">acme.it/accedi</span>
                </div>
                <div className="sg-finestra-corpo" data-chiaro={chiaro}>
                  <AuthCard flusso={flussoBanco} uid="banco" compatta />
                </div>
              </Rivela>

              <div className="sg-ispettori">
                {/* colore */}
                <Rivela className="sg-ispettore sg-isp-sx-alto" ritardo={0.1}>
                  <div className="sg-isp-titolo">Colore</div>
                  <div className="sg-campioni">
                    {COLORI.map(c => (
                      <button key={c.id} type="button" className="sg-campione"
                        style={{ background: c.hex }} data-colore={c.id} data-on={colore === c.id}
                        aria-label={c.nome} onClick={() => setColore(c.id)} />
                    ))}
                  </div>
                </Rivela>

                {/* raggio */}
                <Rivela className="sg-ispettore sg-isp-dx-alto" ritardo={0.16}>
                  <div className="sg-isp-riga">
                    <span className="sg-isp-titolo" style={{ marginBottom: 0 }}>Raggio</span>
                    <span className="sg-isp-valore" data-testid="sg-raggio">{raggio}px</span>
                  </div>
                  <input className="sg-cursore" type="range" min={0} max={24} step={2}
                    value={raggio} aria-label="Raggio degli angoli"
                    onChange={e => setRaggio(Number(e.target.value))} />
                </Rivela>

                {/* logo */}
                <Rivela className="sg-ispettore sg-isp-sx-basso" ritardo={0.22}>
                  <div className="sg-isp-titolo">Simbolo</div>
                  <div className="sg-isp-loghi">
                    {LOGHI.map(l => (
                      <button key={l} type="button" className="sg-isp-logo"
                        data-logo={l} data-on={logo === l} aria-label={`Simbolo ${l}`}
                        onClick={() => setLogo(l)}>
                        <LogoMarchio id={l} dim={17} />
                      </button>
                    ))}
                  </div>
                </Rivela>

                {/* testo del pulsante */}
                <Rivela className="sg-ispettore sg-isp-dx-basso" ritardo={0.28}>
                  <div className="sg-isp-titolo">Testo del pulsante</div>
                  <input className="sg-isp-input" value={testoPulsante} maxLength={22}
                    aria-label="Testo del pulsante" placeholder="Continua"
                    onChange={e => setTestoPulsante(e.target.value)} />
                </Rivela>
              </div>
            </div>
          </div>
        </section>

        {/* ══ INTEGRAZIONE ══ */}
        <section className="sg-sezione">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Pronto per la produzione"
              titolo="Si innesta dov'è già il tuo prodotto."
              testo="Nessuna migrazione, nessun lock-in sui dati: gli utenti restano tuoi e li porti via quando vuoi."
            />

            <div className="sg-griglia-schede">
              {INTEGRAZIONI.map((c, i) => (
                <Rivela key={c.titolo} className="sg-vetro" ritardo={i * 0.08}>
                  <span className="sg-vetro-icona">{c.icona}</span>
                  <h3>{c.titolo}</h3>
                  <p>{c.testo}</p>
                  <div className="sg-tag-fila">
                    {c.tag.map(t => <span key={t} className="sg-tag">{t}</span>)}
                  </div>
                </Rivela>
              ))}
            </div>

            <Rivela className="sg-codice-blocco" ritardo={0.1}>
              <div className="sg-codice-testa">
                <span className="sg-semaforo"><i /><i /><i /></span>
                app/accedi.tsx
              </div>
              <pre className="sg-codice-corpo">
<span className="c">{"// npm i @soglia/react"}</span>{"\n"}
<span className="k">import</span>{" { Soglia } "}<span className="k">from</span>{" "}<span className="s">&quot;@soglia/react&quot;</span>{"\n\n"}
<span className="k">export default function</span>{" Accesso() {\n  "}<span className="k">return</span>{" (\n    <Soglia\n      progetto="}<span className="s">&quot;acme&quot;</span>{"\n      metodi={["}<span className="s">&quot;password&quot;</span>{", "}<span className="s">&quot;codice&quot;</span>{", "}<span className="s">&quot;sso&quot;</span>{"]}\n      marchio={{ colore: "}<span className="s">&quot;#663af3&quot;</span>{", raggio: 16 }}\n      onAccesso={(sessione) => vai("}<span className="s">&quot;/cruscotto&quot;</span>{")}\n    />\n  )\n}"}<span className="sg-caret" aria-hidden />
              </pre>
            </Rivela>
          </div>
        </section>

        {/* ══ SICUREZZA — il radar spazza, le difese sono elencate ══ */}
        <section className="sg-sezione sg-sicurezza-sezione">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Brilla senza scottare"
              titolo="La sicurezza lavora anche quando dormi."
              testo="Le difese non sono una casella da spuntare in fondo al contratto: sono accese di serie, e si vedono lavorare."
            />
            <div className="sg-sicurezza">
              <Rivela><Radar /></Rivela>
              <div className="sg-difese">
                {DIFESE.map((d, i) => (
                  <Rivela key={d.titolo} className="sg-difesa" ritardo={i * 0.08}>
                    <span className="sg-difesa-icona">{d.icona}</span>
                    <div>
                      <h3>{d.titolo}</h3>
                      <p>{d.testo}</p>
                    </div>
                  </Rivela>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ L'ORBITA — tutto gira intorno alla stessa sessione ══ */}
        <section className="sg-sezione">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Un sistema, sei porte"
              titolo="Tutto orbita intorno alla stessa sessione."
              testo="Aggiungere un metodo di accesso non è un progetto: è una casella nel pannello."
            />
            <Rivela><Orbita /></Rivela>
          </div>
        </section>

        {/* ══ DOMANDE ══ */}
        <section className="sg-sezione">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Le domande vere"
              titolo="Quello che chiedereste al commerciale."
              testo="Risposte scritte prima che le chiediate — comprese quelle che di solito arrivano solo dopo la firma."
            />
            <Faq />
          </div>
        </section>

        {/* ══ CHIUSURA ══ */}
        <section className="sg-chiusura">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Provala fino in fondo"
              titolo="Niente da comprare. Tutto da toccare."
              testo="Tre metodi di accesso, un secondo fattore, un banco per rivestire la scheda del tuo marchio: è tutto in questa pagina, e funziona adesso."
            />
            <Rivela className="sg-apertura-cta" ritardo={0.08}>
              <button type="button" className="sg-pill sg-pill--grande"
                onClick={() => { document.querySelector(".sg-apertura")?.scrollIntoView({ behavior: "smooth" }) }}>
                Torna alla scheda
              </button>
              <button type="button" className="sg-pill sg-pill--vuoto sg-pill--grande"
                onClick={() => document.querySelector(".sg-banco")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                Apri il banco da lavoro
              </button>
            </Rivela>

            {/* ══ LA FIRMA — chi ha costruito questa pagina ══ */}
            <Rivela className="sg-agenzia" ritardo={0.1}>
              <div className="sg-agenzia-luce" aria-hidden />
              <div className="sg-agenzia-int">
                <Sopra>Dietro le quinte</Sopra>
                <h2 className="sg-titolo" style={{ fontSize: 34 }}>Una pagina così può essere tua.</h2>
                <p className="sg-sommario">
                  Soglia non esiste: esiste chi l&apos;ha disegnata e costruita. Nadia Maar progetta
                  siti, portali e prodotti web su misura per aziende italiane — e questa demo,
                  widget funzionante compreso, è il tipo di lavoro che consegniamo.
                </p>
                <div className="sg-apertura-cta">
                  <a className="sg-pill sg-pill--grande" href="/foundry">Guarda le altre demo</a>
                  <a className="sg-pill sg-pill--vuoto sg-pill--grande" href="/contatti">Raccontaci il tuo progetto</a>
                </div>
                <p className="sg-agenzia-stack">React · TypeScript · Framer Motion · nessun template — nadiamaar.dev</p>
              </div>
            </Rivela>
          </div>
        </section>

        <footer className="sg-piede">
          <div className="sg-contenitore">
            <span className="sg-marchio" style={{ justifyContent: "center" }}>
              <LogoMarchio id={logo} dim={16} />
              <span className="sg-marchio-testo">Soglia</span>
            </span>
            <p>
              Soglia è un prodotto inventato per questa dimostrazione: nessun account viene creato,
              nessuna e-mail parte, nessuna password lascia questa scheda. Il codice a sei cifre
              accetta qualsiasi sequenza tranne 000000 — così si vede anche l&apos;errore. Anche i
              marchi nel nastro sono di fantasia.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
