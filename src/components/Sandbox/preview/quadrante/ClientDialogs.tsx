import React, { useEffect, useId, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import type { ClientProfile, RepId } from "./types"
import type { NewClientInput } from "./data"
import { ME, REPS, isValidVat, normalizeVat, sectorsOf, vatCheckDigit } from "./data"
import { Ico } from "./parts"

/* ══════════════════════════════════════════════════════════════════════════
   CREARE E CANCELLARE UN'ANAGRAFICA

   Due finestre e una regola sola: la creazione controlla prima di salvare,
   la cancellazione dice prima che cosa porta via.

   La validazione non è cosmetica. Una partita IVA sbagliata non si scopre
   in anagrafica: si scopre quando la fattura torna indietro, settimane
   dopo, e a quel punto costa una nota di credito. Il campo qui verifica la
   cifra di controllo — sei righe di codice — e quando è sbagliata dice
   QUALE dovrebbe essere, invece del solito «valore non valido» che lascia
   la persona a indovinare.

   Gli errori compaiono quando si esce dal campo o quando si prova a
   salvare, mai mentre si scrive: segnalare «e-mail non valida» alla prima
   lettera digitata è tecnicamente vero e praticamente ostile.
══════════════════════════════════════════════════════════════════════════ */

export const EMPTY_CLIENT: NewClientInput = {
  company: "", name: "", vat: "", email: "", phone: "",
  city: "", address: "", sector: "", employees: "", website: "",
  owner: ME, notes: "",
}

type Field = keyof NewClientInput
type Errors = Partial<Record<Field, string>>

/** L'ordine conta: è quello in cui si sposta il fuoco sul primo campo
    sbagliato, e deve corrispondere all'ordine visivo. */
const ORDER: Field[] = [
  "company", "vat", "sector", "employees",
  "name", "email", "phone",
  "address", "city", "website", "owner", "notes",
]

export function validateClient(v: NewClientInput, existing: ClientProfile[]): Errors {
  const e: Errors = {}
  const company = v.company.trim()

  if (company.length < 2) e.company = "Serve la ragione sociale."
  else if (existing.some(c => c.company.toLowerCase() === company.toLowerCase()))
    e.company = "C'è già un cliente con questa ragione sociale."

  const vat = normalizeVat(v.vat)
  if (!vat) e.vat = "Serve la partita IVA."
  else if (!/^\d{11}$/.test(vat)) e.vat = "Undici cifre, senza spazi."
  else if (!isValidVat(vat)) e.vat = `Cifra di controllo errata: dovrebbe finire con ${vatCheckDigit(vat.slice(0, 10))}.`
  else if (existing.some(c => c.vat === vat)) e.vat = "Questa partita IVA è già in anagrafica."

  const email = v.email.trim()
  if (!email) e.email = "Serve un'e-mail per scrivere al referente."
  /* volutamente permissivo: la sola prova vera di un indirizzo è mandarci
     un messaggio, e una regex severa rifiuta indirizzi legittimi */
  else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) e.email = "Indirizzo non riconoscibile."

  const digits = v.phone.replace(/\D/g, "")
  if (!digits) e.phone = "Serve un numero per chiamare."
  else if (digits.length < 8) e.phone = "Sembra troppo corto per un numero italiano."

  if (!v.city.trim()) e.city = "Serve almeno la città."

  if (v.employees.trim() && !/^\d{1,6}$/.test(v.employees.trim()))
    e.employees = "Solo cifre."

  return e
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULO NUOVO CLIENTE
══════════════════════════════════════════════════════════════════════════ */
export function ClientForm({ existing, onSave, onClose }: {
  existing: ClientProfile[]
  onSave: (v: NewClientInput) => void
  onClose: () => void
}) {
  const [v, setV] = useState<NewClientInput>(EMPTY_CLIENT)
  const [seen, setSeen] = useState<Set<Field>>(new Set())
  const [tried, setTried] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const uid = useId()

  const errors = useMemo(() => validateClient(v, existing), [v, existing])
  const show = (f: Field) => (tried || seen.has(f)) && errors[f]

  const sectors = useMemo(() => sectorsOf(existing), [existing])

  useEffect(() => {
    form.current?.querySelector<HTMLInputElement>("input")?.focus()
  }, [])

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV(p => ({ ...p, [f]: e.target.value }))

  const blur = (f: Field) => () => setSeen(p => (p.has(f) ? p : new Set(p).add(f)))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    const bad = ORDER.find(f => errors[f])
    if (bad) {
      /* portare il fuoco sul primo campo sbagliato: senza, su un modulo
         lungo l'errore può stare fuori dallo schermo e sembra che il
         pulsante non funzioni */
      form.current?.querySelector<HTMLElement>(`[name="${bad}"]`)?.focus()
      return
    }
    onSave(v)
  }

  return (
    <Modal label="Nuovo cliente" onClose={onClose} width={620}>
      <form ref={form} onSubmit={submit} noValidate>
        <div className="q-modal-head">
          <span className="q-round" aria-hidden><Ico n="plus" size={16} /></span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 className="q-h1">Nuovo cliente</h2>
            <p className="q-micro" style={{ marginTop: 4 }}>
              I campi con l'asterisco servono per fatturare e per farsi rispondere.
              Il resto si completa dopo la prima chiamata.
            </p>
          </div>
          <button type="button" className="q-icon-btn" onClick={onClose} aria-label="Chiudi">✕</button>
        </div>

        <div className="q-modal-body">
          <Legend>Azienda</Legend>
          <div className="q-form-row">
            <Field label="Ragione sociale" req id={`${uid}-company`} error={show("company")} grow>
              <input className="q-input" name="company" id={`${uid}-company`} value={v.company}
                autoComplete="organization" placeholder="Es. Vinci Impianti S.r.l."
                onChange={set("company")} onBlur={blur("company")} />
            </Field>
          </div>
          <div className="q-form-row">
            <Field label="Partita IVA" req id={`${uid}-vat`} error={show("vat")}
              hint={!show("vat") ? "11 cifre, l'ultima di controllo." : undefined}>
              <input className="q-input q-num" name="vat" id={`${uid}-vat`} value={v.vat}
                inputMode="numeric" maxLength={15} placeholder="01234567890"
                onChange={set("vat")} onBlur={blur("vat")} />
            </Field>
            <Field label="Settore" id={`${uid}-sector`}>
              <input className="q-input" name="sector" id={`${uid}-sector`} value={v.sector}
                list={`${uid}-sectors`} placeholder="Impiantistica"
                onChange={set("sector")} onBlur={blur("sector")} />
              <datalist id={`${uid}-sectors`}>
                {sectors.map(s => <option key={s} value={s} />)}
              </datalist>
            </Field>
            <Field label="Dipendenti" id={`${uid}-emp`} error={show("employees")} narrow>
              <input className="q-input q-num" name="employees" id={`${uid}-emp`} value={v.employees}
                inputMode="numeric" placeholder="25"
                onChange={set("employees")} onBlur={blur("employees")} />
            </Field>
          </div>

          <Legend>Referente</Legend>
          <div className="q-form-row">
            <Field label="Nome e cognome" id={`${uid}-name`} grow>
              <input className="q-input" name="name" id={`${uid}-name`} value={v.name}
                autoComplete="name" placeholder="Chi risponde al telefono"
                onChange={set("name")} onBlur={blur("name")} />
            </Field>
          </div>
          <div className="q-form-row">
            <Field label="E-mail" req id={`${uid}-email`} error={show("email")} grow>
              <input className="q-input" name="email" id={`${uid}-email`} value={v.email}
                type="email" autoComplete="email" placeholder="nome@azienda.it"
                onChange={set("email")} onBlur={blur("email")} />
            </Field>
            <Field label="Telefono" req id={`${uid}-phone`} error={show("phone")} grow>
              <input className="q-input" name="phone" id={`${uid}-phone`} value={v.phone}
                type="tel" autoComplete="tel" placeholder="+39 02 1234567"
                onChange={set("phone")} onBlur={blur("phone")} />
            </Field>
          </div>

          <Legend>Sede e assegnazione</Legend>
          <div className="q-form-row">
            <Field label="Indirizzo" id={`${uid}-addr`} grow>
              <input className="q-input" name="address" id={`${uid}-addr`} value={v.address}
                autoComplete="street-address" placeholder="Via e numero"
                onChange={set("address")} onBlur={blur("address")} />
            </Field>
            <Field label="Città" req id={`${uid}-city`} error={show("city")}>
              <input className="q-input" name="city" id={`${uid}-city`} value={v.city}
                autoComplete="address-level2" placeholder="Milano"
                onChange={set("city")} onBlur={blur("city")} />
            </Field>
          </div>
          <div className="q-form-row">
            <Field label="Sito" id={`${uid}-site`} grow>
              <input className="q-input" name="website" id={`${uid}-site`} value={v.website}
                placeholder="azienda.it" onChange={set("website")} onBlur={blur("website")} />
            </Field>
            <Field label="Responsabile" id={`${uid}-owner`} grow>
              <select className="q-select" name="owner" id={`${uid}-owner`} value={v.owner}
                onChange={e => setV(p => ({ ...p, owner: e.target.value as RepId }))}>
                {REPS.map(r => <option key={r.id} value={r.id}>{r.name} · {r.role}</option>)}
              </select>
            </Field>
          </div>
          <div className="q-form-row">
            <Field label="Da sapere" id={`${uid}-notes`} grow
              hint="Come decide, chi firma, quando rinnova. Compare nella scheda.">
              <textarea className="q-input" name="notes" id={`${uid}-notes`} rows={2} value={v.notes}
                placeholder="Il consorzio decide per tutte le sedi…"
                onChange={set("notes")} onBlur={blur("notes")} />
            </Field>
          </div>
        </div>

        <div className="q-modal-foot">
          <span className="q-micro" style={{ marginRight: "auto" }}>
            {tried && Object.keys(errors).length > 0
              ? `${Object.keys(errors).length} campi da correggere.`
              : "Il cliente nasce senza trattative: si aggiungono dal board."}
          </span>
          <button type="button" className="q-btn q-btn-light q-btn-sm" onClick={onClose}>Annulla</button>
          <button type="submit" className="q-btn q-btn-lime q-btn-sm">
            <Ico n="check" size={14} />Crea cliente
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ── un campo, con etichetta, errore e aiuto ───────────────────────────── */
function Field({ label, id, req, error, hint, children, grow, narrow }: {
  label: string
  id: string
  req?: boolean
  error?: string | false
  hint?: string
  children: React.ReactNode
  grow?: boolean
  narrow?: boolean
}) {
  const noteId = `${id}-note`

  /* Il controllo lo scrive chi chiama, ma aria-invalid e il collegamento
     all'errore li mette il campo: dodici ripetizioni a mano sono dodici
     occasioni di dimenticarne una. */
  const kids = React.Children.map(children, ch => {
    if (!React.isValidElement(ch)) return ch
    const t = ch.type
    if (t !== "input" && t !== "select" && t !== "textarea") return ch
    return React.cloneElement(ch as React.ReactElement<Record<string, unknown>>, {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error || hint ? noteId : undefined,
    })
  })

  return (
    <div className={`q-field${error ? " has-error" : ""}`} style={{
      flex: grow ? "1 1 220px" : narrow ? "0 0 108px" : "1 1 172px",
    }}>
      <label className="q-field-label" htmlFor={id}>
        {label}{req && <span className="q-req" aria-hidden> *</span>}
        {req && <span className="q-sr"> (obbligatorio)</span>}
      </label>
      {kids}
      {/* aria-live: chi non guarda il campo sente comunque l'errore quando
          compare, senza dover ripercorrere il modulo */}
      <p id={noteId} className={`q-field-note${error ? " is-error" : ""}`} aria-live="polite">
        {error || hint || ""}
      </p>
    </div>
  )
}

const Legend = ({ children }: { children: React.ReactNode }) => (
  <p className="q-eyebrow q-form-legend">{children}</p>
)

/* ══════════════════════════════════════════════════════════════════════════
   CONFERMA

   Una finestra di conferma che chiede «sei sicuro?» non aiuta nessuno:
   sicuro di cosa? Questa elenca che cosa sparisce, con i numeri, e mette
   l'azione distruttiva a destra, dove non ci si arriva per inerzia.
══════════════════════════════════════════════════════════════════════════ */
export function ConfirmDialog({
  title, lead, points, confirmLabel, tone = "ink", icon = "help", onConfirm, onClose, footNote,
}: {
  title: string
  lead: string
  points?: string[]
  confirmLabel: string
  tone?: "ink" | "bad"
  icon?: "help" | "exit" | "clock"
  onConfirm: () => void
  onClose: () => void
  footNote?: string
}) {
  const ok = useRef<HTMLButtonElement>(null)
  /* il fuoco parte da «Annulla», non dal pulsante distruttivo: un Invio
     partito per inerzia non deve cancellare niente */
  const cancel = useRef<HTMLButtonElement>(null)
  useEffect(() => { cancel.current?.focus() }, [])

  return (
    <Modal label={title} onClose={onClose} width={470}>
      <div className="q-modal-head">
        <span className={`q-round${tone === "bad" ? " q-round-bad" : " q-round-quiet"}`} aria-hidden>
          <Ico n={icon} size={16} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 className="q-h1" style={{ fontSize: 18 }}>{title}</h2>
        </div>
      </div>

      <div className="q-modal-body">
        <p className="q-small" style={{ color: "var(--q-ink-muted)" }}>{lead}</p>
        {points && points.length > 0 && (
          <ul className="q-conseq">
            {points.map(p => (
              <li key={p}>
                <span className="q-conseq-dot" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        )}
        {footNote && <p className="q-micro" style={{ marginTop: 14 }}>{footNote}</p>}
      </div>

      <div className="q-modal-foot">
        <button ref={cancel} type="button" className="q-btn q-btn-light q-btn-sm" onClick={onClose}>
          Annulla
        </button>
        <button ref={ok} type="button"
          className={`q-btn q-btn-sm ${tone === "bad" ? "q-btn-bad" : "q-btn-ink"}`}
          onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   IL GUSCIO DELLA FINESTRA

   Il fuoco resta dentro finché la finestra è aperta. Senza, con Tab si esce
   dietro il velo e si finisce a navigare un'applicazione che non si vede —
   il modo piu veloce per perdere completamente il filo.
══════════════════════════════════════════════════════════════════════════ */
function Modal({ label, width, children, onClose }: {
  label: string
  width: number
  children: React.ReactNode
  onClose: () => void
}) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !box.current) return
      const f = [...box.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
      )].filter(el => el.offsetParent !== null)
      if (f.length === 0) return
      const first = f[0]
      const last = f[f.length - 1]
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="q-modal-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div ref={box} className="q-modal" role="dialog" aria-modal="true" aria-label={label}
        style={{ maxWidth: width }}
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.99 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}
