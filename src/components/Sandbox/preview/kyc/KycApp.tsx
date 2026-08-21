import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { type CampoId, erroreCampo, SETTORI } from "./schema"
import {
  datiValidi, DOCUMENTI, documentiCompleti, type DocId, type Step, useKycStore,
} from "./store"

/* ══════════════════════════════════════════════════════════════════════════
   ONBOARDING & KYC — l'interfaccia.

   Identità visiva PROPRIA, come ogni demo del Lab: qui è un prodotto
   enterprise chiaro — fondo bianco, grafite, accenti viola, vetro smerigliato
   sul riepilogo — non una pagina del sito. I caratteri sono quelli di
   sistema: su una demo «Apple-inspired» la famiglia nativa È la scelta,
   e non costa un byte di font.

   Le transizioni fra i passi passano da AnimatePresence con direzione:
   avanti scivola da destra, indietro da sinistra — l'occhio capisce dove
   sta andando senza leggere niente.
══════════════════════════════════════════════════════════════════════════ */

export type KycCapability = "compila" | "documenti" | "errore" | "invia"

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, system-ui, sans-serif"

export const KYC_CSS = `
  .kyc-root {
    --ink: #16181D; --ink-2: #4B5160; --ink-3: #8A90A0;
    --line: rgba(22,24,29,0.10); --line-soft: rgba(22,24,29,0.06);
    --purple: #6D5AE6; --purple-deep: #5747C7; --purple-soft: rgba(109,90,230,0.10);
    --ok: #12B76A; --err: #E5484D;
    --card: #FFFFFF; --bg: #F7F7FA;
    font-family: ${FONT};
    background:
      radial-gradient(900px 420px at 85% -10%, rgba(109,90,230,0.10), transparent 60%),
      radial-gradient(700px 380px at -10% 110%, rgba(109,90,230,0.06), transparent 60%),
      var(--bg);
    color: var(--ink);
    min-height: 100%;
    -webkit-font-smoothing: antialiased;
  }
  .kyc-wrap { max-width: 640px; margin: 0 auto; padding: clamp(24px, 5vw, 56px) 20px 72px; }

  /* ── testata ── */
  .kyc-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 34px; }
  .kyc-brand-mark {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--purple), var(--purple-deep));
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 800; font-size: 15px; letter-spacing: -0.02em;
    box-shadow: 0 6px 18px rgba(109,90,230,0.35);
  }
  .kyc-brand-name { font-weight: 700; font-size: 15px; letter-spacing: -0.01em; }
  .kyc-brand-sub { font-size: 12px; color: var(--ink-3); }

  /* ── barra dei passi ── */
  .kyc-steps { display: flex; align-items: center; gap: 8px; margin-bottom: 30px; }
  .kyc-step-dot {
    display: flex; align-items: center; gap: 8px;
    font-size: 12.5px; font-weight: 600; color: var(--ink-3);
    background: none; border: none; padding: 0; font-family: inherit;
  }
  .kyc-step-dot[data-reachable="true"] { cursor: pointer; }
  .kyc-step-dot .n {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    border: 1.5px solid var(--line); color: var(--ink-3); background: #fff;
    transition: all .25s ease;
  }
  .kyc-step-dot[data-state="active"] { color: var(--ink); }
  .kyc-step-dot[data-state="active"] .n {
    border-color: var(--purple); color: #fff; background: var(--purple);
    box-shadow: 0 0 0 4px var(--purple-soft);
  }
  .kyc-step-dot[data-state="done"] .n { border-color: var(--ok); color: var(--ok); background: rgba(18,183,106,0.08); }
  .kyc-step-line { flex: 1; height: 1.5px; background: var(--line-soft); border-radius: 2px; overflow: hidden; }
  .kyc-step-line i { display: block; height: 100%; background: var(--purple); transition: width .45s cubic-bezier(0.16,1,0.3,1); }

  /* ── carta del passo ── */
  .kyc-card {
    background: var(--card); border: 1px solid var(--line-soft); border-radius: 20px;
    padding: clamp(22px, 4vw, 34px);
    box-shadow: 0 1px 2px rgba(22,24,29,0.04), 0 18px 50px rgba(22,24,29,0.07);
  }
  .kyc-h1 { font-size: clamp(21px, 3vw, 26px); font-weight: 800; letter-spacing: -0.03em; margin: 0 0 6px; }
  .kyc-lead { font-size: 14px; line-height: 1.6; color: var(--ink-2); margin: 0 0 26px; }

  /* ── campi ── */
  .kyc-field { margin-bottom: 16px; }
  .kyc-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--ink-2); margin-bottom: 7px; }
  .kyc-label .opt { font-weight: 500; color: var(--ink-3); }
  .kyc-input-wrap { position: relative; }
  .kyc-input {
    width: 100%; box-sizing: border-box;
    padding: 12px 40px 12px 14px;
    font-family: inherit; font-size: 15px; color: var(--ink);
    background: #fff; border: 1.5px solid var(--line); border-radius: 12px;
    outline: none; appearance: none;
    transition: border-color .18s ease, box-shadow .18s ease;
  }
  .kyc-input::placeholder { color: #B4B9C6; }
  .kyc-input:focus { border-color: var(--purple); box-shadow: 0 0 0 4px var(--purple-soft); }
  .kyc-input[data-invalid="true"] { border-color: var(--err); }
  .kyc-input[data-invalid="true"]:focus { box-shadow: 0 0 0 4px rgba(229,72,77,0.10); }
  .kyc-check {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    color: var(--ok); pointer-events: none;
  }
  .kyc-err { display: flex; gap: 6px; align-items: baseline; font-size: 12.5px; color: var(--err); margin-top: 6px; }
  select.kyc-input { padding-right: 36px; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='%238A90A0' stroke-width='1.8' stroke-linecap='round'/></svg>"); background-repeat: no-repeat; background-position: right 14px center; }
  select.kyc-input:invalid, select.kyc-input[data-empty="true"] { color: #B4B9C6; }

  /* ── documenti ── */
  .kyc-doc { border: 1.5px dashed var(--line); border-radius: 14px; padding: 16px; margin-bottom: 12px; transition: border-color .2s, background .2s; }
  .kyc-doc[data-drag="true"] { border-color: var(--purple); background: var(--purple-soft); }
  .kyc-doc[data-status="done"] { border-style: solid; border-color: rgba(18,183,106,0.45); }
  .kyc-doc[data-status="error"] { border-style: solid; border-color: rgba(229,72,77,0.50); }
  .kyc-doc-row { display: flex; align-items: center; gap: 13px; }
  .kyc-doc-ico {
    width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--purple-soft); color: var(--purple);
  }
  .kyc-doc[data-status="done"] .kyc-doc-ico { background: rgba(18,183,106,0.10); color: var(--ok); }
  .kyc-doc[data-status="error"] .kyc-doc-ico { background: rgba(229,72,77,0.10); color: var(--err); }
  .kyc-doc-name { font-size: 14px; font-weight: 650; letter-spacing: -0.01em; }
  .kyc-doc-sub { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
  .kyc-doc-act {
    margin-left: auto; flex-shrink: 0;
    font-family: inherit; font-size: 12.5px; font-weight: 650;
    color: var(--purple); background: none; border: none; cursor: pointer; padding: 6px 4px;
  }
  .kyc-doc-act.muted { color: var(--ink-3); }
  .kyc-bar { height: 4px; border-radius: 3px; background: var(--line-soft); margin-top: 12px; overflow: hidden; }
  .kyc-bar i { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--purple), #8B7CF0); transition: width .14s linear; }
  .kyc-doc-err { font-size: 12.5px; color: var(--err); margin-top: 10px; line-height: 1.5; }

  /* ── riepilogo (vetro) ── */
  .kyc-glass {
    background: rgba(255,255,255,0.62);
    backdrop-filter: blur(22px) saturate(1.4);
    -webkit-backdrop-filter: blur(22px) saturate(1.4);
    border: 1px solid rgba(255,255,255,0.85);
    border-radius: 16px; padding: 20px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 34px rgba(22,24,29,0.08);
    margin-bottom: 18px;
  }
  .kyc-sum-row { display: flex; justify-content: space-between; gap: 16px; padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 13.5px; }
  .kyc-sum-row:last-child { border-bottom: none; }
  .kyc-sum-k { color: var(--ink-3); flex-shrink: 0; }
  .kyc-sum-v { font-weight: 650; text-align: right; overflow-wrap: anywhere; }
  .kyc-sum-v .ok { color: var(--ok); }
  .kyc-edit { font-size: 12px; font-weight: 650; color: var(--purple); background: none; border: none; cursor: pointer; padding: 0; font-family: inherit; }

  .kyc-consent { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; line-height: 1.55; color: var(--ink-2); cursor: pointer; margin-bottom: 22px; }
  .kyc-consent input { width: 17px; height: 17px; margin-top: 1px; accent-color: var(--purple); flex-shrink: 0; }

  /* ── navigazione ── */
  .kyc-nav { display: flex; gap: 10px; margin-top: 26px; }
  .kyc-btn {
    font-family: inherit; font-size: 14.5px; font-weight: 700; letter-spacing: -0.01em;
    border-radius: 12px; padding: 13px 22px; cursor: pointer; border: none;
    transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
  }
  .kyc-btn.primary {
    margin-left: auto; color: #fff;
    background: linear-gradient(135deg, var(--purple), var(--purple-deep));
    box-shadow: 0 8px 22px rgba(109,90,230,0.35);
  }
  .kyc-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(109,90,230,0.42); }
  .kyc-btn.primary:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
  .kyc-btn.ghost { background: none; border: 1.5px solid var(--line); color: var(--ink-2); }
  .kyc-btn.ghost:hover { border-color: var(--ink-3); }

  /* ── esito ── */
  .kyc-done { text-align: center; padding: 26px 8px 10px; }
  .kyc-done-ico {
    width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px;
    background: rgba(18,183,106,0.10); border: 1.5px solid rgba(18,183,106,0.35);
    display: flex; align-items: center; justify-content: center; color: var(--ok);
  }
  .kyc-ref { display: inline-block; font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--purple); background: var(--purple-soft); border-radius: 8px; padding: 6px 12px; margin-top: 14px; }

  @media (max-width: 560px) {
    .kyc-steps .lbl { display: none; }
    .kyc-nav { flex-direction: column-reverse; }
    .kyc-btn.primary { margin-left: 0; }
  }
`

/* direzione: +1 avanti, -1 indietro — decide da che lato entra il passo */
const slide = {
  enter: (dir: number) => ({ x: dir * 44, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -44, opacity: 0 }),
}

function Spunta() {
  return (
    <svg className="kyc-check" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <motion.path
        d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.9"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.32, ease: "easeOut" }}
      />
    </svg>
  )
}

/* ── un campo di testo con validazione al blur ── */
function Campo({ id, label, placeholder, opzionale, inputMode }: {
  id: CampoId; label: string; placeholder: string; opzionale?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  const valore = useKycStore(s => s.dati[id]) ?? ""
  const toccato = useKycStore(s => s.toccati[id]) ?? false
  const dati = useKycStore(s => s.dati)
  const { setCampo, tocca } = useKycStore.getState()

  const errore = toccato ? erroreCampo(id, dati) : null
  const valido = valore.trim() !== "" && erroreCampo(id, dati) === null

  return (
    <div className="kyc-field">
      <label className="kyc-label" htmlFor={`kyc-${id}`}>
        {label} {opzionale && <span className="opt">· facoltativa</span>}
      </label>
      <div className="kyc-input-wrap">
        <input
          id={`kyc-${id}`} className="kyc-input" type="text"
          inputMode={inputMode} placeholder={placeholder} value={valore}
          data-invalid={Boolean(errore)}
          onChange={e => setCampo(id, e.target.value)}
          onBlur={() => tocca(id)}
          aria-invalid={Boolean(errore)}
        />
        {valido && <Spunta />}
      </div>
      <AnimatePresence>
        {errore && (
          <motion.p className="kyc-err" role="alert"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <span aria-hidden>⚠</span> {errore}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── passo 1: anagrafica ── */
function PassoDati() {
  const dati = useKycStore(s => s.dati)
  const toccato = useKycStore(s => s.toccati.settore)
  const { setCampo, tocca } = useKycStore.getState()
  const erroreSettore = toccato ? erroreCampo("settore", dati) : null

  return (
    <>
      <h1 className="kyc-h1">Chi state registrando</h1>
      <p className="kyc-lead">
        I dati fiscali si verificano mentre scrivi: la partita IVA passa dal
        checksum ufficiale, non da un controllo di lunghezza.
      </p>
      <Campo id="ragioneSociale" label="Ragione sociale" placeholder="Aurora Living S.r.l." />
      <Campo id="piva" label="Partita IVA" placeholder="11 cifre" inputMode="numeric" />
      <Campo id="email" label="Email aziendale" placeholder="ops@azienda.it" inputMode="email" />
      <Campo id="pec" label="PEC" placeholder="azienda@pec.it" opzionale inputMode="email" />
      <div className="kyc-field">
        <label className="kyc-label" htmlFor="kyc-settore">Settore</label>
        <select
          id="kyc-settore" className="kyc-input" value={dati.settore} data-empty={dati.settore === ""}
          onChange={e => { setCampo("settore", e.target.value); tocca("settore") }} onBlur={() => tocca("settore")}
        >
          <option value="" disabled>Scegli…</option>
          {SETTORI.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {erroreSettore && <p className="kyc-err" role="alert"><span aria-hidden>⚠</span> {erroreSettore}</p>}
      </div>
    </>
  )
}

/* ── passo 2: un documento ── */
function Documento({ id, titolo, nota }: { id: DocId; titolo: string; nota: string }) {
  const doc = useKycStore(s => s.docs[id])
  const { carica, rimuovi } = useKycStore.getState()
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const prendi = (files: FileList | null) => {
    const f = files?.[0]
    if (f) carica(id, { name: f.name, size: f.size, type: f.type })
  }

  const kb = (n: number) => n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`

  return (
    <div
      className="kyc-doc" data-status={doc.status} data-drag={drag} data-doc={id}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); prendi(e.dataTransfer.files) }}
    >
      <div className="kyc-doc-row">
        <span className="kyc-doc-ico" aria-hidden>
          {doc.status === "done" ? (
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : doc.status === "error" ? (
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 4.5v4.2M8 11.4v.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10.5 2.5H5a1.5 1.5 0 00-1.5 1.5v10A1.5 1.5 0 005 15.5h8a1.5 1.5 0 001.5-1.5V6.5m-4-4l4 4m-4-4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="kyc-doc-name">{titolo}</div>
          <div className="kyc-doc-sub">
            {doc.status === "empty" && nota}
            {doc.status === "uploading" && `${doc.nome} · caricamento ${doc.progresso}%`}
            {doc.status === "done" && `${doc.nome} · ${kb(doc.dimensione)} · caricato`}
            {doc.status === "error" && doc.nome}
          </div>
        </div>
        {doc.status === "empty" && (
          <button type="button" className="kyc-doc-act" onClick={() => inputRef.current?.click()}>Scegli file</button>
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

      <input
        ref={inputRef} type="file" hidden data-testid={`kyc-file-${id}`}
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={e => { prendi(e.target.files); e.target.value = "" }}
      />
    </div>
  )
}

function PassoDocumenti() {
  return (
    <>
      <h1 className="kyc-h1">I documenti della pratica</h1>
      <p className="kyc-lead">
        Trascina i file o scegli dal disco — PDF, JPG o PNG fino a 8 MB.
        Il caricamento qui è simulato, gli stati sono quelli veri: in corso,
        riuscito, fallito con spiegazione e ripartenza.
      </p>
      {DOCUMENTI.map(d => <Documento key={d.id} {...d} />)}
    </>
  )
}

/* ── passo 3: verifica e invio ── */
function PassoVerifica() {
  const dati = useKycStore(s => s.dati)
  const docs = useKycStore(s => s.docs)
  const consenso = useKycStore(s => s.consenso)
  const esito = useKycStore(s => s.esito)
  const { vai, setConsenso, invia } = useKycStore.getState()
  const caricati = DOCUMENTI.filter(d => docs[d.id].status === "done").length

  return (
    <>
      <h1 className="kyc-h1">Verifica prima dell'invio</h1>
      <p className="kyc-lead">
        Un ultimo sguardo: tutto quello che parte, in una carta sola.
        Correggere costa un tocco, non un ricominciare.
      </p>

      <div className="kyc-glass">
        <div className="kyc-sum-row"><span className="kyc-sum-k">Ragione sociale</span><span className="kyc-sum-v">{dati.ragioneSociale}</span></div>
        <div className="kyc-sum-row"><span className="kyc-sum-k">Partita IVA</span><span className="kyc-sum-v">{dati.piva} <span className="ok">✓</span></span></div>
        <div className="kyc-sum-row"><span className="kyc-sum-k">Email</span><span className="kyc-sum-v">{dati.email}</span></div>
        {dati.pec ? <div className="kyc-sum-row"><span className="kyc-sum-k">PEC</span><span className="kyc-sum-v">{dati.pec}</span></div> : null}
        <div className="kyc-sum-row"><span className="kyc-sum-k">Settore</span><span className="kyc-sum-v">{dati.settore}</span></div>
        <div className="kyc-sum-row">
          <span className="kyc-sum-k">Documenti</span>
          <span className="kyc-sum-v">{caricati} di {DOCUMENTI.length} <span className="ok">✓</span></span>
        </div>
        <div className="kyc-sum-row">
          <span className="kyc-sum-k" />
          <span><button type="button" className="kyc-edit" onClick={() => vai(1)}>Modifica i dati</button>{" · "}
          <button type="button" className="kyc-edit" onClick={() => vai(2)}>Modifica i documenti</button></span>
        </div>
      </div>

      <label className="kyc-consent">
        <input type="checkbox" checked={consenso} onChange={e => setConsenso(e.target.checked)} />
        <span>
          Confermo che i dati sono corretti e autorizzo la verifica ai fini
          dell'adeguata verifica della clientela (KYC). Demo: non parte niente.
        </span>
      </label>

      <button
        type="button" className="kyc-btn primary" style={{ width: "100%", marginLeft: 0 }}
        disabled={!consenso || esito === "sending"} onClick={invia}
      >
        {esito === "sending" ? "Invio in corso…" : "Invia la pratica"}
      </button>
    </>
  )
}

function Esito() {
  const ricomincia = useKycStore(s => s.ricomincia)
  return (
    <div className="kyc-done">
      <motion.div className="kyc-done-ico"
        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <svg width="28" height="28" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.div>
      <h1 className="kyc-h1">Pratica ricevuta</h1>
      <p className="kyc-lead" style={{ marginBottom: 0 }}>
        La verifica parte adesso: esito entro un giorno lavorativo,
        aggiornamenti via email a ogni cambio di stato.
      </p>
      <span className="kyc-ref">PRATICA № KYC-2026-0187</span>
      <div style={{ marginTop: 26 }}>
        <button type="button" className="kyc-btn ghost" onClick={ricomincia}>Ricomincia la demo</button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Il flusso intero.
══════════════════════════════════════════════════════════════════════════ */
export default function KycApp({ onCaps }: { onCaps?: (caps: KycCapability[]) => void }) {
  const step = useKycStore(s => s.step)
  const dati = useKycStore(s => s.dati)
  const docs = useKycStore(s => s.docs)
  const erroreVisto = useKycStore(s => s.erroreVisto)
  const esito = useKycStore(s => s.esito)
  const { avanti, indietro, vai } = useKycStore.getState()

  /* direzione dell'animazione: si ricorda il passo precedente */
  const prevRef = useRef<Step>(step)
  const dir = step >= prevRef.current ? 1 : -1
  useEffect(() => { prevRef.current = step }, [step])

  const okDati = datiValidi(dati)
  const okDocs = documentiCompleti(docs)

  /* le capacità esercitate salgono alla pagina ospite (checklist) */
  const capsRef = useRef<string>("")
  useEffect(() => {
    const caps: KycCapability[] = []
    if (okDati) caps.push("compila")
    if (okDocs) caps.push("documenti")
    if (erroreVisto) caps.push("errore")
    if (esito === "done") caps.push("invia")
    const chiave = caps.join(",")
    if (chiave !== capsRef.current) { capsRef.current = chiave; onCaps?.(caps) }
  }, [okDati, okDocs, erroreVisto, esito, onCaps])

  const finito = esito === "done"

  return (
    <div className="kyc-root">
      <div className="kyc-wrap">
        <div className="kyc-brand">
          <span className="kyc-brand-mark" aria-hidden>N</span>
          <div>
            <div className="kyc-brand-name">Nimbus Compliance</div>
            <div className="kyc-brand-sub">Onboarding fornitori · ambiente dimostrativo</div>
          </div>
        </div>

        {!finito && (
          <div className="kyc-steps" role="tablist" aria-label="Passi della pratica">
            {([1, 2, 3] as Step[]).map((n, i) => {
              const labels = ["Dati", "Documenti", "Verifica"]
              const raggiungibile = n < step || (n === 2 && okDati) || (n === 3 && okDati && okDocs)
              return (
                <React.Fragment key={n}>
                  {i > 0 && <span className="kyc-step-line"><i style={{ width: step > n - 1 ? "100%" : "0%" }} /></span>}
                  <button
                    type="button" className="kyc-step-dot"
                    data-state={step === n ? "active" : step > n ? "done" : "idle"}
                    data-reachable={raggiungibile}
                    onClick={() => { if (raggiungibile) vai(n) }}
                    aria-current={step === n ? "step" : undefined}
                  >
                    <span className="n">{step > n ? "✓" : n}</span>
                    <span className="lbl">{labels[i]}</span>
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        )}

        <div className="kyc-card">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={finito ? "done" : step} custom={dir} variants={slide}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              {finito ? <Esito /> : step === 1 ? <PassoDati /> : step === 2 ? <PassoDocumenti /> : <PassoVerifica />}
            </motion.div>
          </AnimatePresence>

          {!finito && step < 3 && (
            <div className="kyc-nav">
              {step > 1 && <button type="button" className="kyc-btn ghost" onClick={indietro}>Indietro</button>}
              <button
                type="button" className="kyc-btn primary" onClick={avanti}
                disabled={step === 1 ? !okDati : !okDocs}
              >
                Continua
              </button>
            </div>
          )}
          {!finito && step === 3 && (
            <div className="kyc-nav" style={{ marginTop: 14 }}>
              <button type="button" className="kyc-btn ghost" onClick={indietro}>Indietro</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}