import React, { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { type FlussoApi, type LogoId, dominioDi, hexDi, useMarchio } from "./store"

/* ══════════════════════════════════════════════════════════════════════════
   SOGLIA — la scheda di accesso.

   È il prodotto: tutto il resto della pagina esiste per portarci qui. Si
   veste dalle impostazioni del marchio (colore, raggio, logo, testo del
   pulsante, tema chiaro) e cambia sotto le dita mentre il visitatore
   muove gli ispettori.

   La scheda accetta un flusso dall'esterno invece di crearselo: nella
   pagina ce ne sono due indipendenti, e chi le usa decide quale stato
   guardano.
══════════════════════════════════════════════════════════════════════════ */

/* ── i loghi selezionabili: linea, mai riempimento, 1.5px come le icone ── */
export function LogoMarchio({ id, dim = 20 }: { id: LogoId; dim?: number }) {
  const p = { width: dim, height: dim, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true }
  if (id === "cerchio") return <svg {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>
  if (id === "chiave") return <svg {...p}><circle cx="8.5" cy="12" r="3.5" /><path d="M12 12h8M17 12v3M20 12v2.5" /></svg>
  if (id === "scudo") return <svg {...p}><path d="M12 3.5l6.5 2.4v5.3c0 4-2.7 7.2-6.5 8.3-3.8-1.1-6.5-4.3-6.5-8.3V5.9L12 3.5Z" /></svg>
  /* «soglia»: due montanti e l'architrave — la porta che dà il nome */
  return <svg {...p}><path d="M6 20V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V20" /><path d="M4 20h16" /><path d="M14 12.5h.01" /></svg>
}

function Spinner({ dim = 15 }: { dim?: number }) {
  return (
    <motion.svg width={dim} height={dim} viewBox="0 0 24 24" aria-hidden
      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" fill="none" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.svg>
  )
}

function IconaGoogle() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.3h2.9c1.7-1.6 2.7-3.9 2.7-6.6Z" fill="#4285F4" />
      <path d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.4A9 9 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.9 10.6a5.4 5.4 0 0 1 0-3.4V4.8H.9a9 9 0 0 0 0 8.1l3-2.3Z" fill="#FBBC05" />
      <path d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 0 0 .9 4.8l3 2.4C4.6 5.1 6.6 3.6 9 3.6Z" fill="#EA4335" />
    </svg>
  )
}

function IconaMicrosoft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M1 1h6.6v6.6H1z" fill="#F25022" />
      <path d="M8.4 1H15v6.6H8.4z" fill="#7FBA00" />
      <path d="M1 8.4h6.6V15H1z" fill="#00A4EF" />
      <path d="M8.4 8.4H15V15H8.4z" fill="#FFB900" />
    </svg>
  )
}

function Spunta({ dim = 26 }: { dim?: number }) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <motion.path d="M4.5 12.5l5 5 10-11"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} />
    </svg>
  )
}

const MODI: { id: "password" | "codice" | "sso"; nome: string }[] = [
  { id: "password", nome: "Password" },
  { id: "codice", nome: "Codice" },
  { id: "sso", nome: "SSO" },
]

export interface AuthCardProps {
  flusso: FlussoApi
  /** Distingue le due schede vive in pagina: gli id dei campi devono
   *  restare unici, altrimenti le etichette puntano al campo sbagliato. */
  uid: string
  compatta?: boolean
}

export default function AuthCard({ flusso, uid, compatta = false }: AuthCardProps) {
  const colore = useMarchio(s => s.colore)
  const raggio = useMarchio(s => s.raggio)
  const logo = useMarchio(s => s.logo)
  const testoPulsante = useMarchio(s => s.testoPulsante)
  const chiaro = useMarchio(s => s.chiaro)

  const {
    modo, passo, email, password, cifre, errore, inCorso, esito,
    setModo, setEmail, setPassword, setCifra, incolla, avanti, provider, ricomincia,
  } = flusso

  const stile = {
    "--s-accento": hexDi(colore),
    "--s-raggio": `${raggio}px`,
  } as React.CSSProperties

  const invia = (e: React.FormEvent) => { e.preventDefault(); avanti() }

  /* noValidate su tutti i form: il controllo nativo del browser blocca
     l'invio PRIMA che il nostro giri, e al suo posto mostra una bolla
     grigia non traducibile e non vestibile, che dice «compila questo
     campo» dove noi diremmo perché. La validazione qui è nostra. */

  /* Le sei caselle: il fuoco avanza da sé mentre si digita e torna
     indietro col tasto di cancellazione. Senza, si scrive il codice con
     sei clic — che è il difetto più comune di questo componente. */
  const rifCifre = useRef<(HTMLInputElement | null)[]>([])
  const suCifra = (i: number, v: string) => {
    setCifra(i, v)
    if (v && i < 5) rifCifre.current[i + 1]?.focus()
  }
  const suTasto = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !cifre[i] && i > 0) rifCifre.current[i - 1]?.focus()
    if (e.key === "ArrowLeft" && i > 0) rifCifre.current[i - 1]?.focus()
    if (e.key === "ArrowRight" && i < 5) rifCifre.current[i + 1]?.focus()
  }
  useEffect(() => {
    if (passo === "codice" || passo === "mfa") rifCifre.current[0]?.focus({ preventScroll: true })
  }, [passo])

  const titolo =
    passo === "fatto" ? "Accesso eseguito"
      : passo === "mfa" ? "Secondo fattore"
        : passo === "codice" ? "Controlla la posta"
          : passo === "sso-attesa" ? "Reindirizzamento" : "Accedi a Soglia"

  const sottotitolo =
    passo === "mfa" ? "Inserisci il codice a sei cifre dell'app di autenticazione."
      : passo === "codice" ? `Abbiamo inviato un codice a ${email}.`
        : passo === "sso-attesa" ? `Ti portiamo all'identity provider di ${dominioDi(email)}.`
          : passo === "fatto" ? "" : "Un solo accesso per tutti i tuoi strumenti."

  return (
    <div className="sg-scheda" data-chiaro={chiaro} style={stile} data-testid={`sg-scheda-${uid}`}>
      <div className="sg-scheda-testa">
        <span className="sg-scheda-logo"><LogoMarchio id={logo} /></span>
        <span className="sg-scheda-titolo">{titolo}</span>
        {sottotitolo && <span className="sg-scheda-sub">{sottotitolo}</span>}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {/* ── esito ── */}
        {passo === "fatto" && esito && (
          <motion.div key="fatto"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}>
            <div className="sg-esito">
              <motion.span className="sg-esito-cerchio"
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 17 }}>
                <Spunta />
              </motion.span>
              <span className="sg-esito-titolo">Sei dentro.</span>
              <span className="sg-esito-nota">La sessione è firmata e il token porta con sé ruolo e organizzazione.</span>
              <pre className="sg-esito-dati" data-testid={`sg-esito-${uid}`}>
{`{
  "sub":    `}<b>{`"${esito.email}"`}</b>{`,
  "org":    `}<b>{`"${esito.organizzazione}"`}</b>{`,
  "role":   `}<b>{`"${esito.ruolo}"`}</b>{`,
  "amr":    "${esito.metodo}",
  "mfa":    "${esito.secondoFattore}"
}`}
              </pre>
            </div>
            <p className="sg-piede-scheda">
              <button type="button" onClick={ricomincia}>Prova un altro metodo</button>
            </p>
          </motion.div>
        )}

        {/* ── codice a sei cifre (magic code o secondo fattore) ── */}
        {(passo === "codice" || passo === "mfa") && (
          <motion.form key="cifre" noValidate onSubmit={invia}
            initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.25 }}>
            <div className="sg-codice" onPaste={e => { e.preventDefault(); incolla(e.clipboardData.getData("text")) }}>
              {cifre.map((c, i) => (
                <input
                  key={i} ref={el => { rifCifre.current[i] = el }}
                  className="sg-cifra" value={c} inputMode="numeric" autoComplete="one-time-code"
                  aria-label={`Cifra ${i + 1}`} data-cifra={i}
                  onChange={e => suCifra(i, e.target.value)}
                  onKeyDown={e => suTasto(i, e)}
                />
              ))}
            </div>
            {errore && <p className="sg-errore" role="alert">{errore}</p>}
            <button type="submit" className="sg-cta" disabled={inCorso} data-testid={`sg-cta-${uid}`}>
              {inCorso ? <><Spinner /> Verifica…</> : "Verifica il codice"}
            </button>
            <p className="sg-piede-scheda">
              Non è arrivato? <button type="button" onClick={ricomincia}>Ricomincia</button>
            </p>
          </motion.form>
        )}

        {/* ── attesa SSO ── */}
        {passo === "sso-attesa" && (
          <motion.form key="sso" noValidate onSubmit={invia}
            initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.25 }}>
            <p className="sg-esito-dati" style={{ marginBottom: 14 }}>
              {`SAML 2.0 · POST\n`}<b>{`https://idp.${dominioDi(email) || "acme.it"}/sso`}</b>
            </p>
            <button type="submit" className="sg-cta" disabled={inCorso} data-testid={`sg-cta-${uid}`}>
              {inCorso ? <><Spinner /> Attendi…</> : `Vai all'IdP di ${dominioDi(email)}`}
            </button>
            <p className="sg-piede-scheda">
              <button type="button" onClick={ricomincia}>Usa un altro metodo</button>
            </p>
          </motion.form>
        )}

        {/* ── credenziali ── */}
        {passo === "credenziali" && (
          <motion.div key="cred"
            initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }}
            transition={{ duration: 0.25 }}>
            <div className="sg-modi" role="tablist" aria-label="Metodo di accesso">
              {MODI.map(m => (
                <button key={m.id} type="button" role="tab" className="sg-modo"
                  data-modo={m.id} data-on={modo === m.id} aria-selected={modo === m.id}
                  onClick={() => setModo(m.id)}>
                  {m.nome}
                </button>
              ))}
            </div>

            <form noValidate onSubmit={invia}>
              <div className="sg-campo">
                <label className="sg-etichetta" htmlFor={`${uid}-email`}>Indirizzo e-mail</label>
                <input
                  id={`${uid}-email`} className="sg-input" type="email" value={email}
                  placeholder={modo === "sso" ? "nome@azienda.it" : "nome@esempio.it"}
                  autoComplete="email" aria-invalid={!!errore && !password}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {modo === "password" && (
                <div className="sg-campo">
                  <label className="sg-etichetta" htmlFor={`${uid}-password`}>Password</label>
                  <input
                    id={`${uid}-password`} className="sg-input" type="password" value={password}
                    placeholder="Almeno 8 caratteri" autoComplete="current-password"
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              )}

              {errore && <p className="sg-errore" role="alert">{errore}</p>}

              <button type="submit" className="sg-cta" disabled={inCorso} data-testid={`sg-cta-${uid}`}>
                {inCorso
                  ? <><Spinner /> Un attimo…</>
                  : modo === "codice" ? "Inviami il codice"
                    : modo === "sso" ? "Continua con l'SSO"
                      : (testoPulsante.trim() || "Continua")}
              </button>
            </form>

            {!compatta && modo !== "sso" && (
              <>
                <div className="sg-oppure">oppure</div>
                <button type="button" className="sg-provider" onClick={() => provider("Google")}>
                  <IconaGoogle /> Continua con Google
                </button>
                <button type="button" className="sg-provider" onClick={() => provider("Microsoft")}>
                  <IconaMicrosoft /> Continua con Microsoft
                </button>
              </>
            )}

            <p className="sg-piede-scheda">
              {modo === "sso"
                ? "L'organizzazione decide chi entra; noi ci limitiamo a crederle."
                : "Non hai un accesso? Te lo crea la prima e-mail."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Le due schede laterali del ventaglio: sola scenografia, niente stato.
     Mostrano gli altri due volti del prodotto (codice e SSO) senza
     duplicare la logica del widget vivo. ── */
export function SchedaFinta({ variante }: { variante: "codice" | "sso" }) {
  const colore = useMarchio(s => s.colore)
  const raggio = useMarchio(s => s.raggio)
  const logo = useMarchio(s => s.logo)
  const stile = { "--s-accento": hexDi(colore), "--s-raggio": `${raggio}px` } as React.CSSProperties

  return (
    <div className="sg-scheda" style={stile} aria-hidden>
      <div className="sg-scheda-testa">
        <span className="sg-scheda-logo"><LogoMarchio id={logo} /></span>
        <span className="sg-scheda-titolo">{variante === "codice" ? "Controlla la posta" : "Accesso aziendale"}</span>
        <span className="sg-scheda-sub">
          {variante === "codice" ? "Sei cifre, nessuna password da ricordare." : "Entra con l'identità che usi in ufficio."}
        </span>
      </div>

      {variante === "codice" ? (
        <>
          <div className="sg-codice">
            {["4", "7", "1", "9", "", ""].map((c, i) => (
              <div key={i} className="sg-cifra" style={{ display: "grid", placeItems: "center" }}>{c}</div>
            ))}
          </div>
          <div className="sg-cta">Verifica il codice</div>
        </>
      ) : (
        <>
          <div className="sg-campo">
            <span className="sg-etichetta">Dominio</span>
            <div className="sg-input">acme.it</div>
          </div>
          <div className="sg-cta">Vai all&apos;IdP di acme.it</div>
          <div className="sg-oppure">oppure</div>
          <div className="sg-provider"><IconaMicrosoft /> Continua con Microsoft</div>
        </>
      )}
    </div>
  )
}
