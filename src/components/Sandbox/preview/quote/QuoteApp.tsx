import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  type Attivita, eur, MODULI, numero, PIATTAFORME, REGIMI,
} from "./model"
import {
  calcola, componiOrdine, type Passo, prezzoModulo, serveRegime, statoModulo,
  ULTIMO_PASSO, useQuoteStore,
} from "./store"

export { QUOTE_CSS } from "./theme"

/* ══════════════════════════════════════════════════════════════════════════
   PREVENTIVO & ROI — l'interfaccia.

   Quattro passi a sinistra, il preventivo che si riscrive a destra. La
   colonna del conto è appiccicata in alto e sempre visibile: un
   configuratore che nasconde il totale finché non arrivi in fondo è un
   configuratore che si abbandona a metà.

   Il terzo passo appare solo se serve — con nessun modulo che scambia dati
   con l'esterno, scegliere il regime di sincronizzazione sarebbe una
   domanda senza oggetto.
══════════════════════════════════════════════════════════════════════════ */

export type QuoteCapability = "piattaforma" | "moduli" | "vincolo" | "regime" | "roi" | "json"

/* La checklist sta NEL flusso, sotto il preventivo, e non in un riquadro
   che galleggia sopra la pagina: con una colonna a destra larga 358 px, un
   pannello fisso nell'angolo copriva proprio i prezzi. Un aiuto che nasconde
   il contenuto non è un aiuto. */
export const QUOTE_CAPS: { id: QuoteCapability; label: string }[] = [
  { id: "piattaforma", label: "Scegli la piattaforma" },
  { id: "moduli",      label: "Aggiungi qualche modulo" },
  { id: "vincolo",     label: "Tocca un modulo escluso" },
  { id: "regime",      label: "Cambia il regime di sincronia" },
  { id: "roi",         label: "Muovi i tuoi numeri" },
  { id: "json",        label: "Genera l'ordine JSON" },
]

const PASSI: { n: Passo; label: string }[] = [
  { n: 1, label: "Piattaforma" },
  { n: 2, label: "Moduli" },
  { n: 3, label: "Sincronia" },
  { n: 4, label: "Ritorno" },
]

const slide = {
  enter: (d: number) => ({ x: d * 34, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d * -34, opacity: 0 }),
}
const TRANS = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }

function Spunta() {
  return (
    <span className="qt-spunta" aria-hidden>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
        <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/* ── §1 piattaforma ──────────────────────────────────────────────────── */
function PassoPiattaforma() {
  const scelta = useQuoteStore(s => s.piattaforma)
  const { scegliPiattaforma } = useQuoteStore.getState()
  return (
    <>
      <h2 className="qt-h1">Su cosa lo costruiamo</h2>
      <p className="qt-lead">
        È la scelta che vincola tutte le altre: <b>cambia i prezzi dei moduli</b> che le stanno
        sopra e, in due casi, li rende impossibili. Il preventivo a fianco si riscrive a ogni tocco.
      </p>
      <div className="qt-carte" data-col="3">
        {PIATTAFORME.map(p => (
          <button key={p.id} type="button" className="qt-carta" data-on={scelta === p.id}
            onClick={() => scegliPiattaforma(p.id)} aria-pressed={scelta === p.id}>
            {scelta === p.id && <Spunta />}
            <div className="qt-carta-t">
              <span className="qt-carta-n">{p.nome}</span>
            </div>
            <p className="qt-carta-s">{p.sommario}</p>
            <div className="qt-tratti">
              {p.tratti.map(t => <span key={t} className="qt-tratto">{t}</span>)}
            </div>
            <div className="qt-carta-t" style={{ marginTop: 12, marginBottom: 0 }}>
              <span className="qt-carta-p">{eur(p.prezzo)}</span>
              <span className="qt-tratto" style={{ marginLeft: "auto" }}>{p.giorni} gg</span>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

/* ── §2 moduli ───────────────────────────────────────────────────────── */
function PassoModuli({ onVincolo }: { onVincolo: () => void }) {
  const piattaforma = useQuoteStore(s => s.piattaforma)
  const scelti = useQuoteStore(s => s.moduli)
  const regime = useQuoteStore(s => s.regime)
  const { alternaModulo } = useQuoteStore.getState()

  return (
    <>
      <h2 className="qt-h1">Che cosa deve saper fare</h2>
      <p className="qt-lead">
        I prezzi qui sotto sono già <b>adeguati alla piattaforma scelta</b>. Le voci spente
        dicono perché lo sono: un modulo disabilitato senza spiegazione è una porta chiusa in faccia.
      </p>
      <div className="qt-carte" data-col="2">
        {MODULI.map(m => {
          const stato = statoModulo(m, piattaforma, scelti)
          const on = scelti.includes(m.id)
          const off = stato.stato === "escluso"
          const { prezzo, rettificato } = prezzoModulo(m, piattaforma, regime)
          return (
            <button key={m.id} type="button" className="qt-carta"
              data-on={on} data-off={off} data-modulo={m.id}
              disabled={off} aria-pressed={on}
              onClick={() => { if (off) { onVincolo(); return } alternaModulo(m.id) }}>
              {on && <Spunta />}
              <div className="qt-carta-t">
                <span className="qt-carta-n">{m.nome}</span>
                <span className="qt-carta-p">{off ? "non disponibile" : eur(prezzo)}</span>
              </div>
              <p className="qt-carta-s">{m.sommario}</p>
              {stato.stato === "escluso" && (
                <p className="qt-carta-m" data-tipo="escluso">⚠ {stato.motivo}</p>
              )}
              {stato.stato === "richiede" && (
                <p className="qt-carta-m" data-tipo="richiede">↳ Include «{stato.modulo.nome}», che entra da sé.</p>
              )}
              {!off && rettificato && (
                <p className="qt-carta-m" data-tipo="richiede">↳ Prezzo adeguato: base {eur(m.prezzo)}.</p>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

/* ── §3 regime ───────────────────────────────────────────────────────── */
function PassoRegime() {
  const regime = useQuoteStore(s => s.regime)
  const { scegliRegime } = useQuoteStore.getState()
  return (
    <>
      <h2 className="qt-h1">Quanto in fretta i sistemi si parlano</h2>
      <p className="qt-lead">
        Vale solo per i moduli che scambiano dati con l'esterno, e <b>ne moltiplica il costo</b>:
        il tempo reale non è un interruttore, è coda, ritentativi e idempotenza da costruire.
      </p>
      <div className="qt-carte" data-col="3">
        {REGIMI.map(r => (
          <button key={r.id} type="button" className="qt-carta" data-on={regime === r.id}
            onClick={() => scegliRegime(r.id)} aria-pressed={regime === r.id} data-regime={r.id}>
            {regime === r.id && <Spunta />}
            <div className="qt-carta-t">
              <span className="qt-carta-n">{r.nome}</span>
            </div>
            <p className="qt-carta-s">{r.sommario}</p>
            <div className="qt-tratti">
              <span className="qt-tratto">latenza {r.latenza}</span>
              <span className="qt-tratto">×{r.fattore.toFixed(2)} sui moduli</span>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

/* ── §4 attività, ritorno e JSON ─────────────────────────────────────── */
function Cursore({ etichetta, valore, min, max, passo, formato, nota, onChange, id }: {
  etichetta: string; valore: number; min: number; max: number; passo: number
  formato: (n: number) => string; nota?: string; id: string
  onChange: (n: number) => void
}) {
  return (
    <div>
      <div className="qt-campo-t">
        <label className="qt-campo-l" htmlFor={id}>{etichetta}</label>
        <span className="qt-campo-v">{formato(valore)}</span>
      </div>
      <input id={id} className="qt-range" type="range" min={min} max={max} step={passo}
        value={valore} onChange={e => onChange(Number(e.target.value))} />
      {nota && <p className="qt-campo-n">{nota}</p>}
    </div>
  )
}

/** Colora un JSON senza librerie: tre gruppi, una passata sola. */
function jsonColorato(testo: string): string {
  return testo
    .replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string))
    .replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g,
      (m, str, colon, bool, num) => {
        if (str) return colon ? `<span class="k">${str}</span>${colon}` : `<span class="s">${str}</span>`
        if (bool) return `<span class="b">${bool}</span>`
        if (num) return `<span class="n">${num}</span>`
        return m
      })
}

function PassoRitorno({ onRoi, onJson }: { onRoi: () => void; onJson: () => void }) {
  const attivita = useQuoteStore(s => s.attivita)
  const piattaforma = useQuoteStore(s => s.piattaforma)
  const moduli = useQuoteStore(s => s.moduli)
  const regime = useQuoteStore(s => s.regime)
  const { setAttivita } = useQuoteStore.getState()
  const [mostraJson, setMostraJson] = useState(false)
  const [copiato, setCopiato] = useState(false)

  useEffect(() => { onRoi() }, [onRoi])

  const set = (k: keyof Attivita) => (n: number) => setAttivita({ [k]: n })

  /* La data si fissa quando si apre il JSON, non a ogni battito: un
     documento che cambia timbro mentre lo leggi non è un documento. */
  const emessoRef = useRef<string | null>(null)
  const apriJson = () => {
    emessoRef.current = new Date().toISOString()
    setMostraJson(true); onJson()
  }
  const ordine = mostraJson
    ? componiOrdine({ piattaforma, moduli, regime, attivita, emesso: emessoRef.current! })
    : null
  const testo = ordine ? JSON.stringify(ordine, null, 2) : ""

  const copia = async () => {
    try {
      await navigator.clipboard.writeText(testo)
      setCopiato(true); setTimeout(() => setCopiato(false), 1800)
    } catch { /* il browser può negarlo: resta lo scarica */ }
  }
  const scarica = () => {
    const blob = new Blob([testo], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "preventivo.json"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <h2 className="qt-h1">I vostri numeri, non i nostri</h2>
      <p className="qt-lead">
        Il ritorno si calcola da <b>due sole fonti verificabili</b>: le ore di lavoro manuale che
        spariscono e gli ordini che smettono di andare persi. Nessuna promessa di fatturato:
        quella non la sa nessuno.
      </p>

      <div className="qt-campi">
        <Cursore id="qt-ordini" etichetta="Ordini al mese" valore={attivita.ordini}
          min={100} max={8000} passo={100} formato={numero} onChange={set("ordini")} />
        <Cursore id="qt-scontrino" etichetta="Scontrino medio" valore={attivita.scontrino}
          min={20} max={900} passo={10} formato={eur} onChange={set("scontrino")} />
        <Cursore id="qt-ore" etichetta="Ore manuali a settimana" valore={attivita.oreManuali}
          min={0} max={80} passo={1} formato={n => `${n} h`} onChange={set("oreManuali")}
          nota="Riconciliazioni, caricamenti a mano, correzioni di giacenza." />
        <Cursore id="qt-costo" etichetta="Costo orario pieno" valore={attivita.costoOrario}
          min={15} max={90} passo={1} formato={eur} onChange={set("costoOrario")} />
        <Cursore id="qt-errori" etichetta="Ordini persi per disallineamento"
          valore={Math.round(attivita.quotaErrori * 1000)} min={0} max={90} passo={1}
          formato={n => `${(n / 10).toFixed(1)} %`}
          onChange={n => setAttivita({ quotaErrori: n / 1000 })}
          nota="Annullati o rimborsati perché il magazzino diceva un'altra cosa." />
      </div>

      {!mostraJson ? (
        <button type="button" className="qt-btn pri wide" style={{ marginTop: 22 }} onClick={apriJson}>
          Genera l'ordine in JSON
        </button>
      ) : (
        <div style={{ marginTop: 22 }}>
          <p className="qt-lead" style={{ marginBottom: 12 }}>
            L'oggetto che partirebbe verso il backend: configurazione, numeri dell'attività,
            totali e ritorno. Pronto da inviare, senza un solo campo inventato dall'interfaccia.
          </p>
          <pre className="qt-json" data-testid="qt-json"
            dangerouslySetInnerHTML={{ __html: jsonColorato(testo) }} />
          <div className="qt-azioni-json">
            <button type="button" className="qt-btn gho mini" onClick={copia}>
              {copiato ? "Copiato ✓" : "Copia negli appunti"}
            </button>
            <button type="button" className="qt-btn gho mini" onClick={scarica}>Scarica .json</button>
          </div>
        </div>
      )}
    </>
  )
}

/* ── il preventivo, colonna di destra ────────────────────────────────── */
function Conto() {
  const piattaforma = useQuoteStore(s => s.piattaforma)
  const moduli = useQuoteStore(s => s.moduli)
  const regime = useQuoteStore(s => s.regime)
  const attivita = useQuoteStore(s => s.attivita)

  const p = calcola(piattaforma, moduli, regime, attivita)

  /* La pulsazione parte SOLO quando il totale cambia valore: farla partire
     a ogni render vorrebbe dire un pannello che tremola mentre si trascina
     un cursore che non tocca il prezzo. */
  const [batte, setBatte] = useState(false)
  const totaleRef = useRef(p.totale)
  useEffect(() => {
    if (totaleRef.current === p.totale) return
    totaleRef.current = p.totale
    setBatte(true)
    const t = setTimeout(() => setBatte(false), 560)
    return () => clearTimeout(t)
  }, [p.totale])

  const r = p.ritorno
  const rientroBuono = r.rientro !== null && r.rientro <= 18
  /* La barra mostra il peso delle due fonti di risparmio, non una
     percentuale astratta. */
  const tot = Math.max(1, r.risparmioMensile)

  return (
    <aside className="qt-conto" aria-label="Preventivo">
      <p className="qt-conto-t"><span>Preventivo</span><i aria-hidden /></p>

      {p.righe.length === 0 ? (
        <p className="qt-vuoto">Scegli una piattaforma: le voci compaiono qui, con il prezzo già adeguato alle scelte.</p>
      ) : (
        <ul className="qt-righe">
          <AnimatePresence initial={false}>
            {p.righe.map(riga => (
              <motion.li key={riga.id} className="qt-riga" data-rett={riga.rettificata} layout
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                transition={TRANS}>
                <div style={{ minWidth: 0 }}>
                  <div className="qt-riga-v">{riga.voce}</div>
                  <div className="qt-riga-d">{riga.dettaglio}</div>
                </div>
                <span className="qt-riga-p">{eur(riga.prezzo)}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <div className="qt-tot">
        <div className="qt-tot-r">
          <span className="qt-tot-l">Totale una tantum</span>
          <span className="qt-tot-v" data-batte={batte} data-testid="qt-totale">{eur(p.totale)}</span>
        </div>
        <div className="qt-tot-n">
          {p.giorni > 0 ? `${p.giorni} giorni/uomo · circa ${p.settimane} settimane` : "nessuna voce"}
        </div>
        {p.righe.length > 0 && (
          <p className="qt-nota">
            Comprende analisi, sviluppo, collaudo e messa in produzione. Non comprende le licenze
            della piattaforma, i contenuti e le fotografie. IVA esclusa · prezzi dimostrativi.
          </p>
        )}
      </div>

      {r.risparmioMensile > 0 && (
        <div className="qt-roi">
          <p className="qt-conto-t" style={{ margin: "0 0 8px" }}>Risparmio stimato</p>
          <div className="qt-roi-r">
            <span className="qt-roi-l">Ore tolte · {r.oreTolte} h/sett.</span>
            <span className="qt-roi-v">{eur(r.risparmioOre)}/mese</span>
          </div>
          <div className="qt-roi-r">
            <span className="qt-roi-l">Ordini non più persi</span>
            <span className="qt-roi-v">{r.recuperoErrori > 0 ? `${eur(r.recuperoErrori)}/mese` : "—"}</span>
          </div>
          <div className="qt-barra" role="img" aria-label="Peso delle due fonti di risparmio">
            <i style={{ width: `${(r.risparmioOre / tot) * 100}%`, background: "#2DE1C2" }} />
            <i style={{ width: `${(r.recuperoErrori / tot) * 100}%`, background: "#FFC46B" }} />
          </div>

          <p className="qt-formula">
            ({r.oreTolte} h × {attivita.costoOrario} € × 4,33 sett.){r.recuperoErrori > 0
              ? ` + (${numero(attivita.ordini)} ordini × ${eur(attivita.scontrino)} × ${(attivita.quotaErrori * 100).toFixed(1)} % evitati)`
              : ""} = {eur(r.risparmioMensile)}/mese
          </p>

          {r.rientro !== null && (
            <div className="qt-rientro">
              <div className="qt-rientro-n" data-testid="qt-rientro">{r.rientro} mesi</div>
              <div className="qt-rientro-l">
                {rientroBuono
                  ? `Con questi numeri l'investimento si ripaga in ${r.rientro} mesi: dopo, il risparmio resta.`
                  : "Rientro lungo: conviene ridurre il perimetro o partire dai moduli che tolgono più ore."}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   L'insieme.
══════════════════════════════════════════════════════════════════════════ */
export default function QuoteApp({ onCaps, mostraCaps = true }: {
  onCaps?: (caps: QuoteCapability[]) => void; mostraCaps?: boolean
}) {
  const passo = useQuoteStore(s => s.passo)
  const maxPasso = useQuoteStore(s => s.maxPasso)
  const piattaforma = useQuoteStore(s => s.piattaforma)
  const moduli = useQuoteStore(s => s.moduli)
  const regime = useQuoteStore(s => s.regime)
  const { avanti, indietro, vai, azzera } = useQuoteStore.getState()

  const [vincoloVisto, setVincoloVisto] = useState(false)
  const [roiVisto, setRoiVisto] = useState(false)
  const [jsonVisto, setJsonVisto] = useState(false)

  const serve3 = serveRegime(moduli)
  const prevRef = useRef<Passo>(passo)
  const dir = passo >= prevRef.current ? 1 : -1
  useEffect(() => { prevRef.current = passo }, [passo])

  const puoAvanzare =
    passo === 1 ? Boolean(piattaforma)
    : passo === 2 ? moduli.length > 0
    : passo === 3 ? Boolean(regime)
    : false

  const [caps, setCaps] = useState<QuoteCapability[]>([])
  const capsRef = useRef("")
  useEffect(() => {
    const caps: QuoteCapability[] = []
    if (piattaforma) caps.push("piattaforma")
    if (moduli.length > 0) caps.push("moduli")
    if (vincoloVisto) caps.push("vincolo")
    if (regime) caps.push("regime")
    if (roiVisto) caps.push("roi")
    if (jsonVisto) caps.push("json")
    const k = caps.join(",")
    if (k !== capsRef.current) { capsRef.current = k; setCaps(caps); onCaps?.(caps) }
  }, [piattaforma, moduli, regime, vincoloVisto, roiVisto, jsonVisto, onCaps])

  const raggiungibile = (n: Passo): boolean => {
    if (n === 3 && !serve3) return false
    if (n <= maxPasso) return true
    if (n === 2) return Boolean(piattaforma)
    if (n === 3) return Boolean(piattaforma) && moduli.length > 0
    if (n === 4) return Boolean(piattaforma) && moduli.length > 0
    return false
  }

  return (
    <div className="qt-root">
      <div className="qt-shell">
        <div className="qt-brand">
          <span className="qt-mark" aria-hidden>≈</span>
          <div>
            <div className="qt-brand-n">Meridiana · preventivo commerce</div>
            <div className="qt-brand-s">configuratore dimostrativo · prezzi indicativi</div>
          </div>
          <button type="button" className="qt-btn gho mini" style={{ marginLeft: "auto" }} onClick={azzera}>
            Azzera
          </button>
        </div>

        <h1 className="qt-titolone">Quanto costa, quanto dura, quando rientra</h1>
        <p className="qt-sottotitolo">
          Configura un progetto e-commerce come lo configureremmo insieme in call: scegli la
          piattaforma, aggiungi le funzioni che ti servono e guarda il preventivo scriversi da
          solo a destra. <b>I prezzi non sono una tabella fissa</b>: si adeguano alle scelte,
          perché la stessa funzione non costa uguale su piattaforme diverse.
        </p>

        <div className="qt-intro">
          {[
            { n: "01", t: "Configuri", d: "Piattaforma e moduli. Alcune combinazioni sono impossibili, e la scheda dice perché." },
            { n: "02", t: "Il prezzo si adegua", d: "Ogni scelta riprezza le altre: niente listino finto, niente «da concordare»." },
            { n: "03", t: "Vedi quando rientra", d: "Con i tuoi numeri di ordini e ore manuali, in quanti mesi l'investimento si ripaga." },
          ].map(c => (
            <div key={c.n} className="qt-intro-c">
              <div className="qt-intro-n">{c.n}</div>
              <div className="qt-intro-t">{c.t}</div>
              <p className="qt-intro-d">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="qt-passi" role="tablist" aria-label="Passi del preventivo">
          {PASSI.filter(p => p.n !== 3 || serve3).map((p, i) => (
            <React.Fragment key={p.n}>
              {i > 0 && <span className="qt-passo-sep" aria-hidden />}
              <button type="button" className="qt-passo"
                data-stato={passo === p.n ? "attivo" : passo > p.n ? "fatto" : "idle"}
                data-on={raggiungibile(p.n)}
                onClick={() => { if (raggiungibile(p.n)) vai(p.n) }}
                aria-current={passo === p.n ? "step" : undefined}>
                <span className="n">0{p.n}</span>
                <span className="lbl">{p.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="qt-grid">
          <div className="qt-pan">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={passo} custom={dir} variants={slide}
                initial="enter" animate="center" exit="exit" transition={TRANS}>
                {passo === 1 ? <PassoPiattaforma />
                  : passo === 2 ? <PassoModuli onVincolo={() => setVincoloVisto(true)} />
                  : passo === 3 ? <PassoRegime />
                  : <PassoRitorno onRoi={() => setRoiVisto(true)} onJson={() => setJsonVisto(true)} />}
              </motion.div>
            </AnimatePresence>

            <div className="qt-nav">
              {passo > 1 && <button type="button" className="qt-btn gho" onClick={indietro}>Indietro</button>}
              {passo < ULTIMO_PASSO && (
                <button type="button" className="qt-btn pri" onClick={avanti} disabled={!puoAvanzare}>
                  Continua
                </button>
              )}
            </div>
          </div>

          <div>
            <Conto />
            {mostraCaps && (
              <div className="qt-caps">
                <p className="qt-caps-t"><span>Da provare</span><b>{caps.length}/{QUOTE_CAPS.length}</b></p>
                {QUOTE_CAPS.map(c => (
                  <div key={c.id} className="qt-cap" data-done={caps.includes(c.id)}>
                    <span className="dot" aria-hidden>{caps.includes(c.id) ? "✓" : ""}</span>
                    {c.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
