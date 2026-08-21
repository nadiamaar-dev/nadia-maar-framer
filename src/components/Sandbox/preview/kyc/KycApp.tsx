import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  type CampoId, erroreCampo, erroreUbo, FATTURATI, PAESI, SETTORI, type Ubo, pivaValida,
} from "./schema"
import {
  datiValidi, DOCUMENTI, documentiCompleti, type DocId, LISTE, livelloRischio,
  sommaQuote, type Step, ULTIMO_PASSO, uboValidi, useKycStore, fermaTuttiITimer, esisteBozza,
} from "./store"
import { scaricaRicevuta } from "./receipt"

export { KYC_CSS } from "./theme"

/* ══════════════════════════════════════════════════════════════════════════
   ONBOARDING & KYC — l'interfaccia.

   Cinque passi, ognuno con il suo stato di confine disegnato: la ricerca a
   registro che non trova niente, il caricamento che fallisce a metà, lo
   screening che solleva un riscontro, le quote che non chiudono al 100%.
   È quello che distingue un modulo da un prodotto, ed è ciò che questa
   demo deve dimostrare in novanta secondi.

   Le transizioni fra i passi hanno una direzione: avanti scivola da destra,
   indietro da sinistra — l'occhio capisce dove sta andando senza leggere.
══════════════════════════════════════════════════════════════════════════ */

export type KycCapability = "compila" | "registro" | "titolari" | "documenti" | "errore" | "screening" | "invia" | "pdf"

const PASSI: { n: Step; label: string }[] = [
  { n: 1, label: "Impresa" },
  { n: 2, label: "Titolari" },
  { n: 3, label: "Documenti" },
  { n: 4, label: "Screening" },
  { n: 5, label: "Invio" },
]

const slide = {
  enter: (dir: number) => ({ x: dir * 42, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -42, opacity: 0 }),
}
const TRANS = { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const }

function Spunta() {
  return (
    <svg className="kyc-check" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <motion.path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.9"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} />
    </svg>
  )
}

function Errore({ testo }: { testo: string | null }) {
  return (
    <AnimatePresence>
      {testo && (
        <motion.p className="kyc-err" role="alert"
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
          <span aria-hidden>⚠</span> {testo}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

/* ── campo di testo con validazione al blur ──────────────────────────── */
function Campo({ id, label, placeholder, opzionale, inputMode, mono }: {
  id: CampoId; label: string; placeholder: string; opzionale?: boolean; mono?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  const valore = useKycStore(s => s.dati[id]) ?? ""
  const toccato = useKycStore(s => s.toccati[id]) ?? false
  const dati = useKycStore(s => s.dati)
  const { setCampo, tocca } = useKycStore.getState()

  const errore = toccato ? erroreCampo(id, dati) : null
  const valido = String(valore).trim() !== "" && erroreCampo(id, dati) === null

  return (
    <div className="kyc-field">
      <label className="kyc-label" htmlFor={`kyc-${id}`}>
        {label} {opzionale && <span className="opt">facoltativa</span>}
      </label>
      <div className="kyc-input-wrap">
        <input
          id={`kyc-${id}`} className={`kyc-input${mono ? " kyc-mono" : ""}`} type="text"
          inputMode={inputMode} placeholder={placeholder} value={String(valore)}
          data-invalid={Boolean(errore)} aria-invalid={Boolean(errore)}
          onChange={e => setCampo(id, e.target.value)}
          onBlur={() => tocca(id)}
        />
        {valido && <Spunta />}
      </div>
      <Errore testo={errore} />
    </div>
  )
}

/* ── §1 · impresa ────────────────────────────────────────────────────── */
function PassoDati() {
  const dati = useKycStore(s => s.dati)
  const toccati = useKycStore(s => s.toccati)
  const lookup = useKycStore(s => s.lookup)
  const { setCampo, tocca, cercaRegistro } = useKycStore.getState()

  return (
    <>
      <h1 className="kyc-h1">Chi state registrando</h1>
      <p className="kyc-lead">
        La partita IVA passa dal <b>checksum ufficiale</b>, non da un controllo di lunghezza:
        un numero inventato non supera questo passo. Con una P.IVA valida potete
        chiedere l'anagrafica al registro imprese.
      </p>

      <Campo id="piva" label="Partita IVA" placeholder="11 cifre" inputMode="numeric" mono />

      <div className="kyc-lookup">
        {lookup === "corso" && <span className="kyc-spinner" aria-hidden />}
        <span>
          {lookup === "idle" && "Recupera ragione sociale, settore e PEC dal registro."}
          {lookup === "corso" && "Interrogazione del registro imprese…"}
          {lookup === "trovato" && "Anagrafica compilata dal registro. Potete correggerla."}
          {lookup === "assente" && "Nessun riscontro: compilate i campi a mano."}
        </span>
        {lookup !== "corso" && (
          <button type="button" className="kyc-lookup-btn" style={{ marginLeft: "auto" }}
            disabled={!pivaValida(dati.piva)} onClick={cercaRegistro}>
            {lookup === "idle" ? "Cerca nel registro" : "Ripeti la ricerca"}
          </button>
        )}
      </div>

      <Campo id="ragioneSociale" label="Ragione sociale" placeholder="Aurora Living S.r.l." />

      <div className="kyc-row">
        <Campo id="email" label="Email aziendale" placeholder="ops@azienda.it" inputMode="email" />
        <Campo id="pec" label="PEC" placeholder="azienda@pec.it" opzionale inputMode="email" />
      </div>

      <div className="kyc-row">
        <div className="kyc-field">
          <label className="kyc-label" htmlFor="kyc-paese">Paese della sede</label>
          <select id="kyc-paese" className="kyc-input" value={dati.paese}
            onChange={e => { setCampo("paese", e.target.value); tocca("paese") }}>
            {PAESI.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
          </select>
        </div>
        <div className="kyc-field">
          <label className="kyc-label" htmlFor="kyc-settore">Settore</label>
          <select id="kyc-settore" className="kyc-input" value={dati.settore} data-empty={dati.settore === ""}
            onChange={e => { setCampo("settore", e.target.value); tocca("settore") }}
            onBlur={() => tocca("settore")}>
            <option value="" disabled>Scegli…</option>
            {SETTORI.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Errore testo={toccati.settore ? erroreCampo("settore", dati) : null} />
        </div>
      </div>

      <div className="kyc-field">
        <label className="kyc-label">Fatturato annuo</label>
        <div className="kyc-pills">
          {FATTURATI.map(f => (
            <button key={f.id} type="button" className="kyc-pill" data-on={dati.fatturato === f.id}
              onClick={() => { setCampo("fatturato", f.id); tocca("fatturato") }}>
              {f.label}
            </button>
          ))}
        </div>
        <Errore testo={toccati.fatturato ? erroreCampo("fatturato", dati) : null} />
      </div>
    </>
  )
}

/* ── §2 · titolari effettivi ─────────────────────────────────────────── */
function UboRiga({ u, i, totale }: { u: Ubo; i: number; totale: number }) {
  const { aggiornaUbo, rimuoviUbo } = useKycStore.getState()
  const [toccato, setToccato] = useState<Record<string, boolean>>({})
  const tocca = (k: string) => setToccato(t => ({ ...t, [k]: true }))

  return (
    <motion.div className="kyc-ubo" layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={TRANS}>
      <div className="kyc-ubo-head">
        <span className="kyc-ubo-n" aria-hidden>{i + 1}</span>
        <span className="kyc-ubo-title">Titolare effettivo</span>
        <button type="button" className="kyc-ubo-del" disabled={totale <= 1}
          onClick={() => rimuoviUbo(u.id)}>Rimuovi</button>
      </div>

      <div className="kyc-field">
        <label className="kyc-label" htmlFor={`ubo-nome-${u.id}`}>Nome e cognome</label>
        <input id={`ubo-nome-${u.id}`} className="kyc-input" type="text" placeholder="Elena Bruni"
          value={u.nome} data-invalid={Boolean(toccato.nome && erroreUbo(u, "nome"))}
          onChange={e => aggiornaUbo(u.id, { nome: e.target.value })} onBlur={() => tocca("nome")} />
        <Errore testo={toccato.nome ? erroreUbo(u, "nome") : null} />
      </div>

      <div className="kyc-row">
        <div className="kyc-field" style={{ marginBottom: 0 }}>
          <label className="kyc-label" htmlFor={`ubo-nascita-${u.id}`}>Data di nascita</label>
          <input id={`ubo-nascita-${u.id}`} className="kyc-input kyc-mono" type="date"
            value={u.nascita} data-invalid={Boolean(toccato.nascita && erroreUbo(u, "nascita"))}
            onChange={e => aggiornaUbo(u.id, { nascita: e.target.value })} onBlur={() => tocca("nascita")} />
          <Errore testo={toccato.nascita ? erroreUbo(u, "nascita") : null} />
        </div>
        <div className="kyc-field" style={{ marginBottom: 0 }}>
          <label className="kyc-label" htmlFor={`ubo-quota-${u.id}`}>Quota</label>
          <div className="kyc-quota-wrap">
            <input id={`ubo-quota-${u.id}`} className="kyc-input kyc-mono" type="number" min={0} max={100} step={0.5}
              value={u.quota || ""} placeholder="0"
              data-invalid={Boolean(toccato.quota && erroreUbo(u, "quota"))}
              onChange={e => aggiornaUbo(u.id, { quota: Number(e.target.value) })} onBlur={() => tocca("quota")} />
            <span className="kyc-quota-suffix" aria-hidden>%</span>
          </div>
          <Errore testo={toccato.quota ? erroreUbo(u, "quota") : null} />
        </div>
      </div>

      <label className="kyc-pep">
        <input type="checkbox" checked={u.pep} onChange={e => aggiornaUbo(u.id, { pep: e.target.checked })} />
        <span>
          È una persona politicamente esposta
          <span className="kyc-pep-hint"> — cariche pubbliche, proprie o di familiari stretti, negli ultimi 12 mesi.</span>
        </span>
      </label>
    </motion.div>
  )
}

function PassoUbo() {
  const ubi = useKycStore(s => s.ubi)
  const { aggiungiUbo } = useKycStore.getState()
  const somma = sommaQuote(ubi)
  const ok = somma === 100
  const colori = ["#7C6BFF", "#A99BFF", "#34E5A0", "#FFC46B", "#FF5D6E"]

  return (
    <>
      <h1 className="kyc-h1">Chi possiede davvero l'impresa</h1>
      <p className="kyc-lead">
        La normativa antiriciclaggio chiede i titolari effettivi, non i soci di facciata.
        Le quote devono chiudere <b>esattamente al 100%</b>: finché non tornano, il passo resta aperto.
      </p>

      <AnimatePresence initial={false}>
        {ubi.map((u, i) => <UboRiga key={u.id} u={u} i={i} totale={ubi.length} />)}
      </AnimatePresence>

      <button type="button" className="kyc-add" onClick={aggiungiUbo}>+ Aggiungi un titolare</button>

      <div className="kyc-quote-bar">
        <div className="kyc-quote-track" role="img" aria-label={`Quote assegnate: ${somma}%`}>
          {ubi.map((u, i) => (
            <span key={u.id} className="kyc-quote-seg"
              style={{ width: `${Math.min(100, Math.max(0, u.quota))}%`, background: colori[i % colori.length] }} />
          ))}
        </div>
        <div className="kyc-quote-legend">
          <span>{ubi.length} {ubi.length === 1 ? "titolare" : "titolari"}</span>
          <span>
            assegnato <b data-ok={ok}>{somma}%</b>
            {!ok && <> · mancano <b data-ok="false">{Math.round((100 - somma) * 100) / 100}%</b></>}
          </span>
        </div>
      </div>
    </>
  )
}

/* ── §3 · documenti ──────────────────────────────────────────────────── */
function Documento({ id, titolo, nota }: { id: DocId; titolo: string; nota: string }) {
  const doc = useKycStore(s => s.docs[id])
  const { carica, rimuovi, annulla } = useKycStore.getState()
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const prendi = (files: FileList | null) => {
    const f = files?.[0]
    if (f) carica(id, { name: f.name, size: f.size, type: f.type })
  }
  const kb = (n: number) => n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`

  return (
    <div className="kyc-doc" data-status={doc.status} data-drag={drag} data-doc={id}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); prendi(e.dataTransfer.files) }}>
      <div className="kyc-doc-row">
        <span className="kyc-doc-ico" aria-hidden>
          {doc.status === "done" ? (
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : doc.status === "error" ? (
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 4.4v4.3M8 11.3v.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10.5 2.5H5A1.5 1.5 0 003.5 4v10A1.5 1.5 0 005 15.5h8a1.5 1.5 0 001.5-1.5V6.5m-4-4l4 4m-4-4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="kyc-doc-name">{titolo}</div>
          <div className="kyc-doc-sub">
            {doc.status === "empty" && nota}
            {doc.status === "uploading" && `${doc.nome} · ${doc.progresso}%`}
            {doc.status === "done" && <>{doc.nome} · {kb(doc.dimensione)} · <span className="hash">sha {doc.hash}</span></>}
            {doc.status === "error" && doc.nome}
          </div>
        </div>
        {doc.status === "empty" && (
          <button type="button" className="kyc-doc-act" onClick={() => inputRef.current?.click()}>Scegli file</button>
        )}
        {doc.status === "uploading" && (
          <button type="button" className="kyc-doc-act muted" onClick={() => annulla(id)}>Annulla</button>
        )}
        {doc.status === "error" && (
          <button type="button" className="kyc-doc-act" onClick={() => inputRef.current?.click()}>Riprova</button>
        )}
        {doc.status === "done" && (
          <button type="button" className="kyc-doc-act muted" onClick={() => rimuovi(id)}>Sostituisci</button>
        )}
      </div>

      {doc.status === "uploading" && (
        <div className="kyc-bar" role="progressbar" aria-valuenow={doc.progresso} aria-valuemin={0} aria-valuemax={100}>
          <i style={{ width: `${doc.progresso}%` }} />
        </div>
      )}
      {doc.status === "error" && <p className="kyc-doc-err" role="alert">{doc.errore}</p>}

      <input ref={inputRef} type="file" hidden data-testid={`kyc-file-${id}`}
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={e => { prendi(e.target.files); e.target.value = "" }} />
    </div>
  )
}

function PassoDocumenti() {
  return (
    <>
      <h1 className="kyc-h1">I documenti della pratica</h1>
      <p className="kyc-lead">
        Trascinateli qui o sceglieteli dal disco — PDF, JPG o PNG fino a 8 MB.
        Il trasferimento è simulato, <b>gli stati sono quelli veri</b>: in corso con annullamento,
        riuscito con impronta del file, fallito con spiegazione e ripartenza.
      </p>
      {DOCUMENTI.map(d => <Documento key={d.id} {...d} />)}
    </>
  )
}

/* ── §4 · screening ──────────────────────────────────────────────────── */
function Gauge({ valore }: { valore: number }) {
  const R = 42, C = 2 * Math.PI * R
  const livello = livelloRischio(valore)
  const colore = livello === "alto" ? "#FF5D6E" : livello === "medio" ? "#FFC46B" : "#34E5A0"
  return (
    <div className="kyc-gauge">
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
        <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="7" />
        <motion.circle cx="48" cy="48" r={R} fill="none" stroke={colore} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={C} initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (C * valore) / 100 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${colore}66)` }} />
      </svg>
      <div className="kyc-gauge-v" style={{ color: colore }}>
        {valore}<small>su 100</small>
      </div>
    </div>
  )
}

function PassoScreening() {
  const liste = useKycStore(s => s.liste)
  const screening = useKycStore(s => s.screening)
  const punteggio = useKycStore(s => s.punteggio)
  const ubi = useKycStore(s => s.ubi)
  const { avviaScreening } = useKycStore.getState()
  const livello = livelloRischio(punteggio)
  const pep = ubi.some(u => u.pep)

  return (
    <>
      <h1 className="kyc-h1">Screening e valutazione</h1>
      <p className="kyc-lead">
        Quattro fonti interrogate in sequenza, poi un punteggio calcolato da <b>regole dichiarate</b> —
        paese, settore, fatturato, esposizione politica, riscontri. Non è una scatola nera:
        un responsabile compliance dev'essere in grado di discuterlo.
      </p>

      <div className="kyc-glass">
        {LISTE.map(l => {
          const c = liste.find(x => x.id === l.id)!
          return (
            <div key={l.id} className="kyc-lista" data-stato={c.stato}>
              <span className="kyc-lista-ico" aria-hidden>
                {c.stato === "corso" ? <span className="kyc-spinner" />
                  : c.stato === "pulito" ? <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : c.stato === "attenzione" ? <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 4.4v4.3M8 11.3v.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  : <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", opacity: 0.5 }} />}
              </span>
              <div>
                <div className="kyc-lista-t">{l.titolo}</div>
                <div className="kyc-lista-f">{l.fonte}</div>
              </div>
              <span className="kyc-lista-e">
                {c.stato === "attesa" && "in coda"}
                {c.stato === "corso" && "verifica…"}
                {c.stato === "pulito" && "nessun riscontro"}
                {c.stato === "attenzione" && `${c.riscontri} riscontro`}
              </span>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {screening === "fatto" && (
          <motion.div className="kyc-glass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={TRANS}>
            <div className="kyc-score">
              <Gauge valore={punteggio} />
              <div>
                <span className="kyc-badge" data-l={livello}>rischio {livello}</span>
                <p className="kyc-score-t">
                  {livello === "basso" ? "Procedura ordinaria" : livello === "medio" ? "Verifica rafforzata" : "Escalation al responsabile"}
                </p>
                <p className="kyc-score-d">
                  {pep
                    ? "Un titolare effettivo è politicamente esposto: la normativa impone adeguata verifica rafforzata e approvazione di un livello superiore."
                    : livello === "basso"
                      ? "Nessun riscontro sulle liste e profilo coerente con il settore dichiarato: la pratica può proseguire con i controlli standard."
                      : "Il profilo somma più fattori di attenzione: la pratica prosegue, con controlli documentali aggiuntivi."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {screening === "idle" && (
        <button type="button" className="kyc-btn primary wide" onClick={avviaScreening}>Avvia lo screening</button>
      )}
    </>
  )
}

/* ── §5 · verifica e invio ───────────────────────────────────────────── */
function PassoVerifica() {
  const dati = useKycStore(s => s.dati)
  const ubi = useKycStore(s => s.ubi)
  const docs = useKycStore(s => s.docs)
  const punteggio = useKycStore(s => s.punteggio)
  const consenso = useKycStore(s => s.consenso)
  const esito = useKycStore(s => s.esito)
  const { vai, setConsenso, invia } = useKycStore.getState()
  const caricati = DOCUMENTI.filter(d => docs[d.id].status === "done").length
  const paese = PAESI.find(p => p.code === dati.paese)?.label ?? dati.paese
  const fatturato = FATTURATI.find(f => f.id === dati.fatturato)?.label ?? "—"

  return (
    <>
      <h1 className="kyc-h1">Verifica prima dell'invio</h1>
      <p className="kyc-lead">
        Un ultimo sguardo: tutto quello che parte, in una carta sola.
        Correggere costa un tocco, non un ricominciare.
      </p>

      <div className="kyc-glass">
        <div className="kyc-sum-row"><span className="kyc-sum-k">Ragione sociale</span><span className="kyc-sum-v">{dati.ragioneSociale}</span></div>
        <div className="kyc-sum-row"><span className="kyc-sum-k">Partita IVA</span><span className="kyc-sum-v kyc-mono">{dati.piva} <span className="ok">✓</span></span></div>
        <div className="kyc-sum-row"><span className="kyc-sum-k">Sede · settore</span><span className="kyc-sum-v">{paese} · {dati.settore}</span></div>
        <div className="kyc-sum-row"><span className="kyc-sum-k">Fatturato</span><span className="kyc-sum-v">{fatturato}</span></div>
        <div className="kyc-sum-row"><span className="kyc-sum-k">Email</span><span className="kyc-sum-v">{dati.email}</span></div>
        {dati.pec ? <div className="kyc-sum-row"><span className="kyc-sum-k">PEC</span><span className="kyc-sum-v">{dati.pec}</span></div> : null}
        <div className="kyc-sum-row">
          <span className="kyc-sum-k" />
          <span><button type="button" className="kyc-edit" onClick={() => vai(1)}>Modifica l'impresa</button></span>
        </div>
      </div>

      <div className="kyc-glass">
        {ubi.map(u => (
          <div key={u.id} className="kyc-sum-row">
            <span className="kyc-sum-k">{u.nome}{u.pep && " · PEP"}</span>
            <span className="kyc-sum-v kyc-mono">{u.quota}%</span>
          </div>
        ))}
        <div className="kyc-sum-row">
          <span className="kyc-sum-k">Documenti</span>
          <span className="kyc-sum-v">{caricati} di {DOCUMENTI.length} <span className="ok">✓</span></span>
        </div>
        <div className="kyc-sum-row">
          <span className="kyc-sum-k">Rischio calcolato</span>
          <span className="kyc-sum-v">{punteggio}/100 · {livelloRischio(punteggio)}</span>
        </div>
        <div className="kyc-sum-row">
          <span className="kyc-sum-k" />
          <span>
            <button type="button" className="kyc-edit" onClick={() => vai(2)}>Titolari</button>{" · "}
            <button type="button" className="kyc-edit" onClick={() => vai(3)}>Documenti</button>
          </span>
        </div>
      </div>

      <label className="kyc-consent">
        <input type="checkbox" checked={consenso} onChange={e => setConsenso(e.target.checked)} />
        <span>
          Confermo che i dati sono corretti e autorizzo la verifica ai fini dell'adeguata
          verifica della clientela. <b>Demo: non parte niente</b>, nessun dato lascia il browser.
        </span>
      </label>

      <button type="button" className="kyc-btn primary wide"
        disabled={!consenso || esito === "sending"} onClick={invia}>
        {esito === "sending" ? "Invio in corso…" : "Invia la pratica"}
      </button>
    </>
  )
}

/* ── esito ───────────────────────────────────────────────────────────── */
function Esito({ onPdf }: { onPdf: () => void }) {
  const protocollo = useKycStore(s => s.protocollo)
  const punteggio = useKycStore(s => s.punteggio)
  const { ricomincia } = useKycStore.getState()
  const [pdf, setPdf] = useState<"idle" | "corso" | "fatto">("idle")

  const scarica = async () => {
    const s = useKycStore.getState()
    if (!s.protocollo) return
    setPdf("corso")
    try {
      await scaricaRicevuta({
        protocollo: s.protocollo, dati: s.dati, ubi: s.ubi,
        docs: s.docs, liste: s.liste, punteggio: s.punteggio,
      })
      setPdf("fatto"); onPdf()
    } catch { setPdf("idle") }
  }

  return (
    <div className="kyc-done">
      <motion.div className="kyc-done-ico"
        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 17 }}>
        <svg width="28" height="28" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.div>
      <h1 className="kyc-h1">Pratica protocollata</h1>
      <p className="kyc-lead" style={{ marginBottom: 0 }}>
        Verifica avviata con rischio {livelloRischio(punteggio)} ({punteggio}/100).
        Esito entro un giorno lavorativo, aggiornamenti a ogni cambio di stato.
      </p>
      <span className="kyc-ref">{protocollo}</span>

      <div className="kyc-nav" style={{ justifyContent: "center", marginTop: 24 }}>
        <button type="button" className="kyc-btn ghost" onClick={ricomincia}>Ricomincia</button>
        <button type="button" className="kyc-btn primary" style={{ marginLeft: 0 }}
          disabled={pdf === "corso"} onClick={scarica}>
          {pdf === "corso" ? "Preparo il PDF…" : pdf === "fatto" ? "Scarica di nuovo" : "Scarica la ricevuta PDF"}
        </button>
      </div>
    </div>
  )
}

/* ── diario ──────────────────────────────────────────────────────────── */
function Diario() {
  const audit = useKycStore(s => s.audit)
  const [aperto, setAperto] = useState(false)
  if (audit.length === 0) return null
  const orario = (t: number) => new Date(t).toLocaleTimeString("it-IT", { hour12: false })

  return (
    <div className="kyc-audit">
      <button type="button" className="kyc-audit-t" data-open={aperto} onClick={() => setAperto(a => !a)}
        aria-expanded={aperto}>
        Diario della pratica · {audit.length}
        <svg className="caret" width="11" height="7" viewBox="0 0 12 8" fill="none" aria-hidden>
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {aperto && (
          <motion.ul className="kyc-audit-l"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={TRANS}>
            {[...audit].reverse().map((v, i) => (
              <li key={`${v.t}-${i}`} className="kyc-audit-i">
                <time dateTime={new Date(v.t).toISOString()}>{orario(v.t)}</time>
                <span>{v.testo}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Il flusso intero.
══════════════════════════════════════════════════════════════════════════ */
export default function KycApp({ onCaps }: { onCaps?: (caps: KycCapability[]) => void }) {
  const step = useKycStore(s => s.step)
  const maxStep = useKycStore(s => s.maxStep)
  const dati = useKycStore(s => s.dati)
  const ubi = useKycStore(s => s.ubi)
  const docs = useKycStore(s => s.docs)
  const lookup = useKycStore(s => s.lookup)
  const screening = useKycStore(s => s.screening)
  const erroreVisto = useKycStore(s => s.erroreVisto)
  const ripresa = useKycStore(s => s.ripresa)
  const esito = useKycStore(s => s.esito)
  const { avanti, indietro, vai, riprendi, scarta } = useKycStore.getState()
  const [pdfFatto, setPdfFatto] = useState(false)

  /* Una bozza di questa sessione si offre, non si impone: chi torna dopo un
     ricaricamento accidentale ringrazia, chi voleva ricominciare no. */
  const [bozza, setBozza] = useState(false)
  useEffect(() => { setBozza(esisteBozza()) }, [])
  useEffect(() => () => fermaTuttiITimer(), [])

  const okDati = datiValidi(dati)
  const okUbo = uboValidi(ubi)
  const okDocs = documentiCompleti(docs)
  const okScreen = screening === "fatto"
  const finito = esito === "done"

  const puoAvanzare = step === 1 ? okDati : step === 2 ? okUbo : step === 3 ? okDocs : step === 4 ? okScreen : false

  /* direzione dell'animazione: si ricorda il passo precedente */
  const prevRef = useRef<Step>(step)
  const dir = step >= prevRef.current ? 1 : -1
  useEffect(() => { prevRef.current = step }, [step])

  /* Invio con Enter: chi compila moduli tutto il giorno non tocca il mouse.
     Non si intercetta dentro le aree di testo lunghe né sui pulsanti. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey || e.metaKey || e.ctrlKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === "BUTTON" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return
      if (!finito && puoAvanzare && step < ULTIMO_PASSO) { e.preventDefault(); avanti() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [puoAvanzare, step, finito, avanti])

  /* le capacità esercitate salgono alla pagina ospite (checklist) */
  const capsChiave = useRef("")
  useEffect(() => {
    const caps: KycCapability[] = []
    if (okDati) caps.push("compila")
    if (lookup === "trovato" || lookup === "assente") caps.push("registro")
    if (okUbo) caps.push("titolari")
    if (okDocs) caps.push("documenti")
    if (erroreVisto) caps.push("errore")
    if (okScreen) caps.push("screening")
    if (finito) caps.push("invia")
    if (pdfFatto) caps.push("pdf")
    const k = caps.join(",")
    if (k !== capsChiave.current) { capsChiave.current = k; onCaps?.(caps) }
  }, [okDati, lookup, okUbo, okDocs, erroreVisto, okScreen, finito, pdfFatto, onCaps])

  /* Cinque confronti booleani per render: memoizzarla costerebbe più di
     quanto risparmi, e il compilatore di React la tiene già a bada. */
  const raggiungibile = (n: Step): boolean => {
    if (n <= maxStep) return true
    if (n === 2) return okDati
    if (n === 3) return okDati && okUbo
    if (n === 4) return okDati && okUbo && okDocs
    if (n === 5) return okDati && okUbo && okDocs && okScreen
    return false
  }

  return (
    <div className="kyc-root">
      <div className="kyc-wrap">
        <div className="kyc-brand">
          <span className="kyc-brand-mark" aria-hidden>N</span>
          <div>
            <div className="kyc-brand-name">Nimbus Compliance</div>
            <div className="kyc-brand-sub">Onboarding fornitori · ambiente dimostrativo</div>
          </div>
          <span className="kyc-brand-live"><i aria-hidden />in linea</span>
        </div>

        <AnimatePresence>
          {bozza && !ripresa && !finito && (
            <motion.div className="kyc-resume"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
              <span><b>Bozza trovata</b> — una pratica di questa sessione è rimasta a metà.</span>
              <span className="kyc-resume-act">
                <button type="button" className="kyc-doc-act muted" onClick={() => { scarta(); setBozza(false) }}>Ignora</button>
                <button type="button" className="kyc-doc-act" onClick={() => { riprendi(); setBozza(false) }}>Riprendi</button>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!finito && (
          <div className="kyc-steps" role="tablist" aria-label="Passi della pratica">
            {PASSI.map((p, i) => (
              <React.Fragment key={p.n}>
                {i > 0 && <span className="kyc-step-line"><i style={{ width: step > p.n - 1 ? "100%" : "0%" }} /></span>}
                <button type="button" className="kyc-step-dot"
                  data-state={step === p.n ? "active" : step > p.n ? "done" : "idle"}
                  data-reachable={raggiungibile(p.n)}
                  onClick={() => { if (raggiungibile(p.n)) vai(p.n) }}
                  aria-current={step === p.n ? "step" : undefined}>
                  <span className="n">{step > p.n ? "✓" : p.n}</span>
                  <span className="lbl">{p.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="kyc-card">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div key={finito ? "done" : step} custom={dir} variants={slide}
              initial="enter" animate="center" exit="exit" transition={TRANS}>
              {finito ? <Esito onPdf={() => setPdfFatto(true)} />
                : step === 1 ? <PassoDati />
                : step === 2 ? <PassoUbo />
                : step === 3 ? <PassoDocumenti />
                : step === 4 ? <PassoScreening />
                : <PassoVerifica />}
            </motion.div>
          </AnimatePresence>

          {!finito && (
            <div className="kyc-nav">
              {step > 1 && <button type="button" className="kyc-btn ghost" onClick={indietro}>Indietro</button>}
              {step < ULTIMO_PASSO && (
                <button type="button" className="kyc-btn primary" onClick={avanti} disabled={!puoAvanzare}>
                  Continua
                </button>
              )}
            </div>
          )}

          {!finito && puoAvanzare && step < ULTIMO_PASSO && (
            <p className="kyc-hint">premi <kbd>Enter</kbd> per continuare</p>
          )}
        </div>

        <Diario />
      </div>
    </div>
  )
}
