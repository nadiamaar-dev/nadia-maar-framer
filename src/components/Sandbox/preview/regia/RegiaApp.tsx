import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  DOMANDE_ECO, ECCEZIONI, LINGUETTE, NODI, PIASTRELLE, REGISTRO, TABELLE, TESTIMONIANZE,
} from "./model"
import { useMarea, useProva, useRegia } from "./store"

/* ══════════════════════════════════════════════════════════════════════════
   REGIA — la pagina di lancio di una torre di controllo per l'e-commerce.

   Il prodotto è inventato; il quadro comandi no. La tabella degli ordini
   scorre da sola, le eccezioni si risolvono davanti agli occhi, i nodi
   del nastro si interrogano col clic e il pulsante dell'apertura fa
   attraversare la regia a un ordine vero — nodo per nodo, log per log.

   Lo stile è «sala di regia dietro vetro smerigliato»: titoli peso 400
   che sussurrano, capelli da 0.5px, un solo blu. Le animazioni stanno
   DENTRO i pannelli — è il prodotto che si muove, non la pagina.
══════════════════════════════════════════════════════════════════════════ */

function Rivela({ children, ritardo = 0, className }: {
  children: React.ReactNode; ritardo?: number; className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: ritardo, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ── icone: linea 1.5px, monocrome; il colore lo dà il contesto ── */
const ico = {
  width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
}

const ICONE_NODO: Record<string, React.ReactNode> = {
  ingresso: <svg {...ico}><path d="M4 12h11M11 7.5 15.5 12 11 16.5" /><path d="M19.5 4.5v15" /></svg>,
  stock: <svg {...ico}><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" /><path d="M12 12.5V20M4 8.5l8 4 8-4" /></svg>,
  corriere: <svg {...ico}><path d="M3.5 16V7.5h10V16" /><path d="M13.5 10h4l3 3v3h-2" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></svg>,
  chiusura: <svg {...ico}><path d="M5 4.5h14v15H5z" /><path d="m8.5 12 2.3 2.3 4.7-4.8" /></svg>,
}

const ICONE_LINGUETTA: Record<string, React.ReactNode> = {
  ordini: <svg {...ico}><path d="M6 4.5h12v15H6z" /><path d="M9 9h6M9 12.5h6M9 16h3.5" /></svg>,
  magazzino: <svg {...ico}><path d="M4 9.5 12 4l8 5.5V20H4V9.5Z" /><path d="M9 20v-6h6v6" /></svg>,
  corrieri: <svg {...ico}><path d="M3.5 16V7.5h10V16" /><path d="M13.5 10h4l3 3v3h-2" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></svg>,
  regole: <svg {...ico}><path d="M5 7h14M5 12h9M5 17h6" /><circle cx="17.5" cy="15.5" r="3" /><path d="m19.8 17.8 1.7 1.7" /></svg>,
}

function SegnoPiastrella({ i }: { i: number }) {
  const p = { ...ico, width: 14, height: 14 }
  const segni = [
    <svg key="a" {...p}><rect x="4.5" y="4.5" width="15" height="15" rx="3.5" /></svg>,
    <svg key="b" {...p}><circle cx="12" cy="12" r="7.5" /></svg>,
    <svg key="c" {...p}><path d="M12 4l7 14H5l7-14Z" /></svg>,
    <svg key="d" {...p}><path d="M5 12h14M12 5v14" /></svg>,
  ]
  return segni[i % segni.length]
}

/* ══ IL QUADRO COMANDI ══════════════════════════════════════════════════ */

function PannelloOrdini() {
  const feed = useRegia(s => s.feed)
  const arrivati = useRegia(s => s.arrivati)
  const sincronizzati = useRegia(s => s.sincronizzati)
  const aperte = useRegia(s => s.eccezioniAperte)

  return (
    <div className="rg-pannello">
      <div className="rg-pannello-testa">
        <b>Flusso ordini</b> · tutti i canali
        <span className="rg-vivo">In diretta</span>
      </div>
      <div className="rg-kpi-fila">
        <div className="rg-kpi">
          <div className="rg-kpi-num" data-testid="rg-arrivati">{147 + arrivati}</div>
          <div className="rg-kpi-eti">ordini oggi</div>
        </div>
        <div className="rg-kpi">
          <div className="rg-kpi-num">{139 + sincronizzati}</div>
          <div className="rg-kpi-eti">sincronizzati</div>
        </div>
        <div className="rg-kpi">
          <div className="rg-kpi-num" data-testid="rg-ecc-aperte">{aperte.length}</div>
          <div className="rg-kpi-eti">eccezioni aperte</div>
        </div>
      </div>
      <table className="rg-tab" data-testid="rg-feed">
        <thead>
          <tr><th>Ordine</th><th>Cliente</th><th>Canale</th><th>Stato</th><th className="num">Colli</th></tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {feed.map(r => (
              <motion.tr key={r.n}
                initial={{ opacity: 0, backgroundColor: "rgba(59,130,246,0.08)" }}
                animate={{ opacity: 1, backgroundColor: "rgba(59,130,246,0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}>
                <td>{r.ordine.id}</td>
                <td>{r.ordine.cliente} · {r.ordine.citta}</td>
                <td>{r.ordine.canale}</td>
                <td><span className="rg-stato" data-s={r.stato}>{r.stato}</span></td>
                <td className="num">{Math.max(1, Math.ceil(r.ordine.articoli / 8))}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}

function PannelloEccezioni() {
  const aperte = useRegia(s => s.eccezioniAperte)
  const risolte = useRegia(s => s.eccezioniRisolte)
  const rimedio = useRegia(s => s.rimedioInCorso)
  const risolvi = useRegia(s => s.risolvi)

  return (
    <div className="rg-pannello">
      <div className="rg-pannello-testa"><b>Eccezioni</b> · dove serve un occhio umano</div>
      <div className="rg-ecc">
        {ECCEZIONI.map(e => {
          const inCorso = rimedio?.id === e.id
          const risolta = risolte.includes(e.id)
          return (
            <div key={e.id} className="rg-ecc-voce" data-risolta={risolta} data-ecc={e.id}>
              <div className="rg-ecc-testa">
                <span className="rg-ecc-titolo">
                  {!risolta && <span className="rg-ecc-punto">● </span>}{e.titolo}
                </span>
                <span className="rg-ecc-ordine">{e.ordine}</span>
              </div>
              <p className="rg-ecc-dettaglio">{e.dettaglio}</p>

              {risolta ? (
                <span className="rg-ecc-fatta">
                  <svg {...ico} width="13" height="13"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
                  Risolta — {e.rimedio.length} passi, nessun ticket
                </span>
              ) : inCorso ? (
                <ul className="rg-rimedio">
                  {e.rimedio.slice(0, (rimedio?.passo ?? 0) + 1).map(r => (
                    <motion.li key={r} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}>{r}</motion.li>
                  ))}
                </ul>
              ) : (
                <button type="button" className="rg-risolvi" onClick={() => risolvi(e.id)}>
                  Risolvi con la regia
                </button>
              )}
            </div>
          )
        })}
        {aperte.length === 0 && (
          <p className="rg-ecc-vuoto" data-testid="rg-coda-vuota">
            Coda vuota. È così che dovrebbe restare — e la regia ci lavora.
          </p>
        )}
      </div>
    </div>
  )
}

function PannelloNastro({ passoProva }: { passoProva: number }) {
  /* Il clic manuale ricorda anche QUANDO è avvenuto (a che passo della
     prova): un clic fatto prima della corsa non deve sopravvivere alla
     corsa — a fine giro il diario mostra l'ultimo nodo attraversato,
     non la curiosità di due minuti prima. */
  const [manuale, setManuale] = useState<{ id: string; durante: number } | null>(null)
  const setInterrogato = (id: string) => setManuale({ id, durante: passoProva })

  const inCorsa = passoProva >= 0 && passoProva < NODI.length
  const mostrato = inCorsa ? NODI[passoProva].id
    : passoProva >= NODI.length
      ? (manuale && manuale.durante >= NODI.length ? manuale.id : NODI[NODI.length - 1].id)
      : manuale?.id ?? null
  const nodo = NODI.find(n => n.id === mostrato)

  return (
    <div className="rg-pannello">
      <div className="rg-pannello-testa">
        <b>Nastro di lavorazione</b> · clicca un nodo per interrogarlo
      </div>
      <div className="rg-nastro" data-testid="rg-nastro">
        {NODI.map((n, i) => (
          <React.Fragment key={n.id}>
            {i > 0 && <span className="rg-giunto" data-acceso={passoProva >= i}><i /></span>}
            <button type="button" className="rg-nodo" data-tinta={n.tinta} data-nodo={n.id}
              data-attivo={passoProva === i || mostrato === n.id}
              data-fatto={passoProva > i}
              onClick={() => setInterrogato(n.id)}>
              <span className="rg-nodo-nome">{ICONE_NODO[n.id]}{n.nome}</span>
              <span className="rg-nodo-descr">{n.descr}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {nodo && (
          <motion.div key={nodo.id} className="rg-diario" data-testid="rg-diario"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}>
            <pre>{nodo.diario.map((r, i) => (
              <React.Fragment key={i}><span className="blu">{nodo.id}</span>  {r}{"\n"}</React.Fragment>
            ))}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══ ECO — l'agente che risponde sui dati ════════════════════════════════
   Il copione: si sceglie una domanda, la domanda si SCRIVE da sola nella
   riga di comando (il progresso viene dal tempo trascorso, mai da un
   contatore dentro un timer — lezione pagata due demo fa), l'agente
   «pensa» tre puntini e poi la risposta arriva con la sua tabella,
   una riga alla volta. ══ */

const BATTITO_MS = 34      // una lettera ogni ~34 ms: velocità da persona
const PENSA_MS = 900

function Eco() {
  const [scelta, setScelta] = useState<string | null>(null)
  /* Ogni domanda è una corsa nuova; dentro lo stato ci sta il RISULTATO
     del tempo (lettere scritte, fase), calcolato nel tick — non l'ora. */
  const [corsa, setCorsa] = useState(0)
  const [scena, setScena] = useState<{ lettere: number; fase: "scrive" | "pensa" | "risponde" }>({ lettere: 0, fase: "scrive" })

  const domanda = DOMANDE_ECO.find(d => d.id === scelta) ?? null

  useEffect(() => {
    if (corsa === 0 || !domanda) return
    const inizio = performance.now()
    const durataScrittura = domanda.chip.length * BATTITO_MS
    let raf = 0
    const tick = () => {
      const trascorso = performance.now() - inizio
      const lettere = Math.min(domanda.chip.length, Math.floor(trascorso / BATTITO_MS))
      const fase = trascorso < durataScrittura ? "scrive" as const
        : trascorso < durataScrittura + PENSA_MS ? "pensa" as const : "risponde" as const
      setScena({ lettere, fase })
      if (fase !== "risponde") raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [corsa, domanda])

  const chiedi = (id: string) => {
    setScelta(id)
    setScena({ lettere: 0, fase: "scrive" })
    setCorsa(c => c + 1)
  }

  const scritta = domanda ? domanda.chip.slice(0, scena.lettere) : ""
  const finita = domanda !== null && scena.fase !== "scrive"
  const pensa = domanda !== null && scena.fase === "pensa"
  const risponde = domanda !== null && scena.fase === "risponde"
  const occupato = domanda !== null && !risponde

  return (
    <div className="rg-pannello" data-testid="rg-eco">
      <div className="rg-pannello-testa">
        <b>Eco</b> · l&apos;agente della regia
        <span className="rg-vivo">In ascolto</span>
      </div>
      <div className="rg-eco-corpo">
        <div className="rg-eco-chiedi">
          <svg {...ico}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
          {domanda
            ? <span>{scritta}{!finita && <span className="rg-eco-caret" aria-hidden />}</span>
            : <span className="segna">Chiedi qualcosa ai tuoi dati — o scegli una domanda qui sotto.</span>}
        </div>

        <AnimatePresence mode="wait">
          {pensa && (
            <motion.div key="pensa" className="rg-eco-risposta"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="rg-eco-avatar">
                <svg {...ico} width="13" height="13"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.5 2" /></svg>
              </span>
              <span className="rg-eco-pensa" aria-label="Eco sta pensando"><i /><i /><i /></span>
            </motion.div>
          )}
          {risponde && domanda && (
            <motion.div key={domanda.id} className="rg-eco-risposta"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <span className="rg-eco-avatar">
                <svg {...ico} width="13" height="13"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.5 2" /></svg>
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="rg-eco-testo">{domanda.risposta}</p>
                <div className="rg-eco-tab">
                  <table className="rg-tab">
                    <thead><tr>{domanda.tabella.intestazioni.map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {domanda.tabella.righe.map((r, i) => (
                        <motion.tr key={i}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + i * 0.18, duration: 0.3 }}>
                          {r.map((c, j) => <td key={j} className={j >= 1 && /^\d/.test(c) ? "num" : undefined}>{c}</td>)}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rg-eco-chip-fila">
          {DOMANDE_ECO.map(d => (
            <button key={d.id} type="button" className="rg-eco-chip" data-eco-chip={d.id}
              disabled={occupato} onClick={() => chiedi(d.id)}>
              {d.chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══ LE CAPACITÀ — micro-scene animate, non icone ferme ══════════════════ */

function ScenaSincronia() {
  return (
    <motion.svg width="64" height="40" viewBox="0 0 64 40" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <rect x="2" y="12" width="16" height="16" rx="4" />
      <rect x="46" y="12" width="16" height="16" rx="4" />
      <motion.path d="M22 16h18M36 12.5 40 16.5l-4 4" stroke="#60a5fa"
        initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }}
        transition={{ duration: 2.2, times: [0, 0.5, 1], repeat: Infinity, ease: "easeInOut" }} />
      <motion.path d="M42 24H24M28 27.5 24 23.5l4-4" stroke="#60a5fa"
        initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }}
        transition={{ duration: 2.2, times: [0, 0.5, 1], delay: 1.1, repeat: Infinity, ease: "easeInOut" }} />
    </motion.svg>
  )
}

function ScenaIdentita() {
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <motion.circle cy="20" r="10"
        animate={{ cx: [18, 27, 27, 18] }}
        transition={{ duration: 3.6, times: [0, 0.35, 0.75, 1], repeat: Infinity, ease: "easeInOut" }} />
      <motion.circle cy="20" r="10" stroke="#60a5fa"
        animate={{ cx: [46, 37, 37, 46] }}
        transition={{ duration: 3.6, times: [0, 0.35, 0.75, 1], repeat: Infinity, ease: "easeInOut" }} />
    </svg>
  )
}

function ScenaAccesso() {
  return (
    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
      <motion.span aria-hidden style={{
        position: "absolute", width: 34, height: 34, borderRadius: 9999,
        boxShadow: "0 0 0 1px rgba(96, 165, 250, 0.5)",
      }}
        animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 7V4M15 7V4M7.5 7h9v5a4.5 4.5 0 0 1-9 0V7ZM12 16.5V20" />
      </svg>
    </div>
  )
}

function ScenaRegistro() {
  const RIGHE = ["riga 4407 scritta", "firma verificata", "replica in UE — ok"]
  return (
    <div className="rg-capa-log" aria-hidden>
      {RIGHE.map((r, i) => (
        <motion.div key={r}
          animate={{ opacity: [0, 1, 1, 0.35] }}
          transition={{ duration: 3.3, times: [0, 0.15, 0.8, 1], delay: i * 1.1, repeat: Infinity }}>
          {i === 2 ? <>{r.replace(" — ok", "")} — <b>ok</b></> : r}
        </motion.div>
      ))}
    </div>
  )
}

const CAPACITA = [
  {
    titolo: "Sincronia bidirezionale",
    testo: "Chi scrive per ultimo non vince: vince la regola. I conflitti si risolvono, non si sovrascrivono.",
    scena: <ScenaSincronia />,
  },
  {
    titolo: "Identità unificata",
    testo: "Lo stesso cliente sul negozio, nel gestionale e dal corriere è UNA riga, non tre omonimi.",
    scena: <ScenaIdentita />,
  },
  {
    titolo: "Accesso nativo",
    testo: "API e webhook di prima classe: la regia si comanda anche senza aprirla.",
    scena: <ScenaAccesso />,
  },
  {
    titolo: "Registro immutabile",
    testo: "Ogni decisione firmata e replicata in UE. Si può leggere, non riscrivere.",
    scena: <ScenaRegistro />,
  },
]

/* ══ TESTIMONIANZE — giostra che avanza da sola ══════════════════════════ */

function Testimonianze() {
  const [su, setSu] = useState(0)
  const [fermo, setFermo] = useState(false)

  useEffect(() => {
    if (fermo) return
    const t = setInterval(() => setSu(i => (i + 1) % TESTIMONIANZE.length), 5200)
    return () => clearInterval(t)
  }, [fermo])

  const voce = TESTIMONIANZE[su]
  return (
    <div className="rg-teste" data-testid="rg-teste"
      onMouseEnter={() => setFermo(true)} onMouseLeave={() => setFermo(false)}>
      <AnimatePresence mode="wait">
        <motion.figure key={su} className="rg-testimonianza"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ margin: 0 }}>
          <span className="rg-teste-avatar">{voce.iniziali}</span>
          <blockquote className="rg-teste-citazione" style={{ margin: 0 }}>&ldquo;{voce.citazione}&rdquo;</blockquote>
          <figcaption className="rg-teste-chi"><b>{voce.nome}</b> — {voce.ruolo}</figcaption>
        </motion.figure>
      </AnimatePresence>
      <div className="rg-teste-punti" role="tablist" aria-label="Testimonianze">
        {TESTIMONIANZE.map((t, i) => (
          <button key={t.iniziali} type="button" className="rg-teste-punto" role="tab"
            data-on={su === i} aria-selected={su === i} aria-label={t.nome}
            onClick={() => setSu(i)} />
        ))}
      </div>
    </div>
  )
}

/* ══ SEZIONE A LINGUETTE ═════════════════════════════════════════════════ */

function Linguette() {
  const [attiva, setAttiva] = useState(LINGUETTE[0].id)
  const voce = LINGUETTE.find(l => l.id === attiva)!
  const tabella = TABELLE[attiva]

  return (
    <div className="rg-linguette">
      <div className="rg-lista-linguette" role="tablist" aria-label="Capacità della regia">
        {LINGUETTE.map(l => (
          <button key={l.id} type="button" role="tab" className="rg-linguetta"
            data-linguetta={l.id} data-attiva={attiva === l.id} aria-selected={attiva === l.id}
            onClick={() => setAttiva(l.id)}>
            <span className="rg-linguetta-nome">{ICONE_LINGUETTA[l.id]}{l.nome}</span>
            <span className="rg-linguetta-descr">{l.titolo}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={attiva} className="rg-pannello rg-vetrina" data-testid="rg-vetrina"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}>
          <div className="rg-pannello-testa"><b>{voce.nome}</b> · regia.app</div>
          <div className="rg-vetrina-corpo">
            <h3 className="rg-vetrina-titolo">{voce.titolo}</h3>
            <p className="rg-vetrina-testo">{voce.testo}</p>
            <table className="rg-tab">
              <thead><tr>{tabella.intestazioni.map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {tabella.righe.map((r, i) => (
                  <tr key={i}>{r.map((c, j) => (
                    <td key={j} className={j >= 1 && /^[\d,.%]+$/.test(c) ? "num" : undefined}>
                      {c === "attiva" || c === "sincronizzato" ? <span className="rg-stato" data-s="sincronizzato">{c}</span>
                        : c === "in consegna" ? <span className="rg-stato" data-s="in consegna">{c}</span> : c}
                    </td>
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ══ IL REGISTRO ═════════════════════════════════════════════════════════ */

function Terminale() {
  const [righe, setRighe] = useState(3)
  useEffect(() => {
    const t = setInterval(() => setRighe(r => (r >= REGISTRO.length ? 3 : r + 1)), 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="rg-terminale" data-testid="rg-terminale">
      <div className="rg-pannello-testa">
        <b>Registro eventi</b> · regia.app/registro
        <span className="rg-vivo">In diretta</span>
      </div>
      <pre className="rg-terminale-corpo">
        {REGISTRO.slice(0, righe).map((r, i) => {
          const [t, ...resto] = r.split("  ")
          const testo = resto.join("  ")
          const cls = testo.includes("accettata") || testo.includes("confermato") || testo.includes("200") ? "ok"
            : testo.includes("regola") || testo.includes("webhook") ? "blu" : undefined
          return (
            <React.Fragment key={i}>
              <span className="t">{t}</span>  {cls ? <span className={cls}>{testo}</span> : testo}{"\n"}
            </React.Fragment>
          )
        })}
        <span className="rg-caret" aria-hidden />
      </pre>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */

export interface RegiaAppProps {
  /** Il fondo dell'imbuto: il visitatore ha fatto lavorare la regia. */
  onIngaggio?: () => void
}

export default function RegiaApp({ onIngaggio }: RegiaAppProps) {
  useMarea()
  const prova = useProva()
  const risolte = useRegia(s => s.eccezioniRisolte)

  /* Ha risolto un'eccezione o fatto correre un ordine: sta usando il
     prodotto, non leggendo la pagina. */
  const ingaggiato = risolte.length > 0 || prova.passo >= 4
  useEffect(() => { if (ingaggiato) onIngaggio?.() }, [ingaggiato, onIngaggio])

  return (
    <div className="rg-root">
      <div className="rg-annuncio">
        Novità — il connettore <b>fatturazione elettronica v2</b> parla con lo SdI in 400 ms · <b>Leggi la nota</b>
      </div>

      {/* ══ NAVIGAZIONE ══ */}
      <nav className="rg-nav">
        <div className="rg-nav-int">
          <span className="rg-marchio">
            <svg {...ico} width="17" height="17"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.5 2" /></svg>
            Regia
          </span>
          <div className="rg-nav-voci">
            <button type="button" className="rg-nav-voce">Piattaforma</button>
            <button type="button" className="rg-nav-voce">Connettori</button>
            <button type="button" className="rg-nav-voce">Sicurezza</button>
            <button type="button" className="rg-nav-voce">Manuale</button>
          </div>
          <div className="rg-nav-fine">
            <button type="button" className="rg-nav-voce">Accedi</button>
            <button type="button" className="rg-osso">Richiedi una demo</button>
          </div>
        </div>
      </nav>

      {/* ══ APERTURA ══ */}
      <header className="rg-apertura">
        <div className="rg-contenitore">
          <div className="rg-apertura-griglia">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}>
              <span className="rg-occhiello">Torre di controllo per l&apos;e-commerce</span>
              <h1 className="rg-display">La regia dei tuoi ordini, dietro un vetro solo.</h1>
            </motion.div>
            <motion.div className="rg-apertura-destra"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 0.61, 0.36, 1] }}>
              <p className="rg-sotto">
                Negozio, magazzini e corrieri parlano già fra loro — qui sotto, adesso.
                Guarda la coda scorrere, interroga un nodo, risolvi un&apos;eccezione.
              </p>
              <div className="rg-apertura-cta">
                <button type="button" className="rg-osso" data-testid="rg-avvia"
                  disabled={prova.inCorsa} onClick={prova.avvia}>
                  {prova.inCorsa ? "Ordine in transito…" : prova.passo >= 4 ? "Fai correre un altro ordine" : "Fai correre un ordine"}
                </button>
                <button type="button" className="rg-spettro"
                  onClick={() => document.querySelector(".rg-terminale")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                  Apri il registro
                </button>
              </div>
            </motion.div>
          </div>

          {/* il quadro comandi */}
          <motion.div className="rg-quadro"
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 0.61, 0.36, 1] }}>
            <div className="rg-colonna">
              <PannelloOrdini />
              <PannelloNastro passoProva={prova.passo} />
            </div>
            <div className="rg-colonna">
              <PannelloEccezioni />
            </div>
          </motion.div>

          {/* nastro loghi: giostra infinita, due copie della stessa fila */}
          <Rivela className="rg-loghi" ritardo={0.15}>
            <div className="rg-loghi-fila">
              {[0, 1].map(copia => (
                <React.Fragment key={copia}>
                  {["Bottega Prisma", "Arreda Più", "Elettra Forniture", "Marelli Casa", "Studio Manin", "Officine Duso"].map((n, i) => (
                    <span key={`${copia}-${n}`} className="rg-logo-voce" aria-hidden={copia === 1}>
                      <SegnoPiastrella i={i} />{n}
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </Rivela>
        </div>
      </header>

      {/* ══ ECO — chiedi ai dati ══ */}
      <section className="rg-sezione">
        <div className="rg-contenitore">
          <Rivela>
            <span className="rg-occhiello">L&apos;agente</span>
            <h2 className="rg-titolo">Le domande si fanno in italiano. Le risposte arrivano in righe.</h2>
            <p className="rg-sotto">
              Eco legge gli stessi dati del quadro comandi: niente prosa motivazionale,
              tabelle. Scegli una domanda e guardala scriversi da sola.
            </p>
          </Rivela>
          <Rivela ritardo={0.1}><div style={{ marginTop: 44 }}><Eco /></div></Rivela>
        </div>
      </section>

      {/* ══ LINGUETTE ══ */}
      <section className="rg-sezione" style={{ paddingTop: 0 }}>
        <div className="rg-contenitore">
          <Rivela>
            <span className="rg-occhiello">Un&apos;infrastruttura, quattro fronti</span>
            <h2 className="rg-titolo">Tutto quello che oggi vive in cinque schede del browser.</h2>
            <p className="rg-sotto">
              Ogni linguetta è un pezzo di lavoro quotidiano che la regia toglie dalle mani:
              la tabella a destra è quella vera del prodotto, non un&apos;illustrazione.
            </p>
          </Rivela>
          <Rivela ritardo={0.1}><Linguette /></Rivela>

          {/* le quattro capacità, ognuna con la sua micro-scena in moto */}
          <Rivela className="rg-capacita" ritardo={0.1}>
            {CAPACITA.map(c => (
              <div key={c.titolo} className="rg-capa">
                <div className="rg-capa-scena">{c.scena}</div>
                <h3>{c.titolo}</h3>
                <p>{c.testo}</p>
              </div>
            ))}
          </Rivela>
        </div>
      </section>

      {/* ══ LO STACK ══ */}
      <section className="rg-sezione" style={{ paddingTop: 0 }}>
        <div className="rg-contenitore">
          <Rivela>
            <span className="rg-occhiello">I connettori</span>
            <h2 className="rg-titolo">La regia non sostituisce i tuoi strumenti. Li dirige.</h2>
            <p className="rg-sotto">
              Gestionale, negozio, corrieri, fatturazione: restano dove sono.
              Cambia una cosa sola — smettono di aspettarsi a vicenda.
            </p>
          </Rivela>
          <Rivela className="rg-piastrelle" ritardo={0.1}>
            {PIASTRELLE.map((p, i) => (
              /* i tre piani galleggiano a velocità diverse: il primo quasi
                 fermo, il fondo lento e sfocato — è la profondità di campo
                 dello «stack» sull'originale */
              <motion.span key={p.nome} className="rg-piastrella" data-piano={p.piano}
                animate={{ y: [0, p.piano * -3.5, 0] }}
                transition={{ duration: 6 + p.piano * 2.5, delay: i * 0.55, repeat: Infinity, ease: "easeInOut" }}>
                <SegnoPiastrella i={i} />{p.nome}
              </motion.span>
            ))}
          </Rivela>
        </div>
      </section>

      {/* ══ IL REGISTRO ══ */}
      <section className="rg-sezione" style={{ paddingTop: 0 }}>
        <div className="rg-contenitore">
          <Rivela>
            <span className="rg-occhiello">Nessuna magia, solo un registro</span>
            <h2 className="rg-titolo">Ogni decisione lascia una riga che si può leggere.</h2>
            <p className="rg-sotto">
              Quando qualcosa va storto alle 18:47 di un venerdì, la domanda non è «cosa è
              successo» ma «dove sta scritto». Sta scritto qui.
            </p>
          </Rivela>
          <Rivela ritardo={0.1}><Terminale /></Rivela>
        </div>
      </section>

      {/* ══ TESTIMONIANZE ══ */}
      <section className="rg-sezione" style={{ paddingTop: 0 }}>
        <div className="rg-contenitore">
          <Rivela>
            <span className="rg-occhiello">Chi la usa in scena</span>
            <h2 className="rg-titolo">Tre voci dalla sala macchine.</h2>
            <p className="rg-sotto">
              Clienti di scena come tutto il resto — ma le frasi sono quelle che sentiamo
              davvero quando un&apos;integrazione inizia a fare il suo lavoro.
            </p>
          </Rivela>
          <Testimonianze />

          {/* ══ LA FIRMA ══ */}
          <Rivela className="rg-firma" ritardo={0.1}>
            <span className="rg-occhiello">Dietro le quinte</span>
            <h2 className="rg-titolo">Regia non esiste. Chi l&apos;ha costruita sì.</h2>
            <p className="rg-sotto">
              Questa sala di controllo — coda che scorre, eccezioni che si risolvono, nodi
              che si interrogano — è una demo di Nadia Maar: integrazioni e portali su misura
              per aziende italiane. Se i tuoi strumenti non si parlano, questo è il mestiere.
            </p>
            <div className="rg-firma-cta">
              <a className="rg-osso" href="/contatti">Raccontaci il tuo progetto</a>
              <a className="rg-spettro" href="/foundry">Guarda le altre demo</a>
            </div>
            <p className="rg-firma-stack">React · TypeScript · Zustand · Framer Motion — nadiamaar.dev</p>
          </Rivela>
        </div>
      </section>

      <footer className="rg-piede">
        <div className="rg-contenitore">
          <span className="rg-marchio" style={{ justifyContent: "center" }}>
            <svg {...ico} width="15" height="15"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.5 2" /></svg>
            Regia
          </span>
          <p>
            Regia è un prodotto inventato per questa dimostrazione: gli ordini, i clienti e i
            numeri che scorrono qui sopra sono di scena e ricominciano da capo a ogni visita.
            Nessun dato lascia questa pagina.
          </p>
        </div>
      </footer>
    </div>
  )
}
