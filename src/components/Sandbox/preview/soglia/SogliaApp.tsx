import React, { useEffect } from "react"
import { motion } from "framer-motion"
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
              <button type="button" className="sg-nav-link">Prezzi</button>
              <button type="button" className="sg-nav-link">Registro</button>
            </div>
            <div className="sg-nav-destra">
              <button type="button" className="sg-pill sg-pill--vuoto">Accedi</button>
              <button type="button" className="sg-pill">Inizia</button>
            </div>
          </div>
        </nav>

        {/* ══ APERTURA ══ */}
        <header className="sg-apertura">
          <div className="sg-contenitore">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <Sopra>Presentiamo</Sopra>
              <h1 className="sg-logotipo">Soglia</h1>
              <p className="sg-apertura-sub">
                Accesso, SSO aziendale e secondo fattore. Un componente da montare,
                non un trimestre di lavoro.
              </p>
              <div className="sg-apertura-cta">
                <button type="button" className="sg-pill sg-pill--grande">Inizia gratis</button>
                <button type="button" className="sg-pill sg-pill--vuoto sg-pill--grande">Leggi la documentazione</button>
              </div>
            </motion.div>

            {/* il ventaglio: due scenografie ai lati, il widget vivo al centro */}
            <motion.div className="sg-ventaglio"
              initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}>
              <div className="sg-ventaglio-lato sx"><SchedaFinta variante="codice" /></div>
              <div className="sg-ventaglio-lato dx"><SchedaFinta variante="sso" /></div>
              <div className="sg-ventaglio-centro">
                <AuthCard flusso={flussoApertura} uid="apertura" />
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

        {/* ══ FUNZIONI ══ */}
        <section className="sg-sezione">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Tutto quello che serve per entrare"
              titolo="Sei modi di dire «sono io»."
              testo="Attivi quelli che ti servono dal pannello, senza toccare il codice. Chi entra vede solo la porta che gli hai lasciato aperta."
            />
            <div className="sg-funzioni">
              {FUNZIONI.map((f, i) => (
                <Rivela key={f.nome} className="sg-funzione" ritardo={i * 0.06}>
                  <span className="sg-funzione-tile">{f.icona}</span>
                  <span className="sg-funzione-nome">{f.nome}</span>
                </Rivela>
              ))}
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
<span className="k">export default function</span>{" Accesso() {\n  "}<span className="k">return</span>{" (\n    <Soglia\n      progetto="}<span className="s">&quot;acme&quot;</span>{"\n      metodi={["}<span className="s">&quot;password&quot;</span>{", "}<span className="s">&quot;codice&quot;</span>{", "}<span className="s">&quot;sso&quot;</span>{"]}\n      marchio={{ colore: "}<span className="s">&quot;#663af3&quot;</span>{", raggio: 16 }}\n      onAccesso={(sessione) => vai("}<span className="s">&quot;/cruscotto&quot;</span>{")}\n    />\n  )\n}"}
              </pre>
            </Rivela>
          </div>
        </section>

        {/* ══ CHIUSURA ══ */}
        <section className="sg-chiusura">
          <div className="sg-contenitore">
            <Apertura
              etichetta="Si parte"
              titolo="Metti Soglia davanti al tuo prodotto."
              testo="Diecimila accessi al mese sono gratis. Poi si paga a persona che entra davvero, non a utente registrato e dimenticato."
            />
            <Rivela className="sg-apertura-cta" ritardo={0.08}>
              <button type="button" className="sg-pill sg-pill--grande">Crea un progetto</button>
              <button type="button" className="sg-pill sg-pill--vuoto sg-pill--grande">Parla con noi</button>
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
              accetta qualsiasi sequenza tranne 000000 — così si vede anche l&apos;errore.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
