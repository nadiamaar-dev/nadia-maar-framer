import { useCallback, useEffect, useRef, useState } from "react"
import { create } from "zustand"

/* ══════════════════════════════════════════════════════════════════════════
   SOGLIA — lo stato.

   Due cose separate, e la separazione è il punto:

   1. IL MARCHIO (zustand, condiviso) — colore, raggio, logo, testo del
      pulsante, tema chiaro. È ciò che il cliente personalizza dagli
      ispettori, e tocca TUTTE le schede in pagina contemporaneamente:
      è la promessa della sezione «Il tuo marchio, il tuo stile».

   2. IL FLUSSO (hook locale, uno per scheda) — a che punto è l'accesso.
      Se stesse nello store, aprire il secondo fattore nella scheda del
      banco da lavoro lo aprirebbe anche in quella dell'apertura: due
      widget indipendenti che si muovono all'unisono sono un difetto che
      si nota subito.
══════════════════════════════════════════════════════════════════════════ */

export type MarchioColore = "viola" | "brace" | "segnale" | "teal"

export const COLORI: { id: MarchioColore; hex: string; nome: string }[] = [
  { id: "viola",    hex: "#663af3", nome: "Viola" },
  { id: "brace",    hex: "#e46d4c", nome: "Brace" },
  { id: "segnale",  hex: "#027dea", nome: "Blu" },
  { id: "teal",     hex: "#269684", nome: "Teal" },
]

export type LogoId = "soglia" | "cerchio" | "chiave" | "scudo"

interface MarchioState {
  colore: MarchioColore
  raggio: number
  logo: LogoId
  testoPulsante: string
  chiaro: boolean
  setColore: (c: MarchioColore) => void
  setRaggio: (r: number) => void
  setLogo: (l: LogoId) => void
  setTestoPulsante: (t: string) => void
  setChiaro: (c: boolean) => void
}

export const useMarchio = create<MarchioState>(set => ({
  colore: "viola",
  raggio: 16,
  logo: "soglia",
  testoPulsante: "Continua",
  chiaro: false,
  setColore: colore => set({ colore }),
  setRaggio: raggio => set({ raggio }),
  setLogo: logo => set({ logo }),
  /* Un pulsante senza testo è un rettangolo colorato: se il campo resta
     vuoto la scheda torna alla parola predefinita invece di mostrarne
     l'assenza. */
  setTestoPulsante: t => set({ testoPulsante: t.slice(0, 22) }),
  setChiaro: chiaro => set({ chiaro }),
}))

export function hexDi(c: MarchioColore): string {
  return COLORI.find(x => x.id === c)!.hex
}

/* ══════════════════════════════════════════════════════════════════════════
   IL FLUSSO DI ACCESSO
══════════════════════════════════════════════════════════════════════════ */

export type Modo = "password" | "codice" | "sso"
export type Passo = "credenziali" | "codice" | "mfa" | "sso-attesa" | "fatto"

export interface Esito {
  metodo: string
  email: string
  /* Un accesso vero non finisce con «benvenuto»: finisce con un'identità e
     dei permessi. Mostrarli è ciò che distingue la demo di un prodotto di
     autenticazione da una schermata di login disegnata. */
  ruolo: string
  organizzazione: string
  secondoFattore: string
}

const RX_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

/** Il dominio dell'e-mail, che nel modo SSO diventa l'organizzazione. */
export function dominioDi(email: string): string {
  const d = email.split("@")[1] ?? ""
  return d.trim().toLowerCase()
}

/* I domini pubblici non hanno un IdP aziendale: chiedere l'SSO a chi
   scrive gmail.com è il modo più veloce per far sbattere l'utente contro
   un muro. Il widget lo dice prima, non dopo. */
const DOMINI_PUBBLICI = new Set([
  "gmail.com", "libero.it", "outlook.com", "hotmail.com", "yahoo.it", "yahoo.com", "icloud.com",
])

export function dominioAziendale(email: string): boolean {
  const d = dominioDi(email)
  return d.length > 0 && !DOMINI_PUBBLICI.has(d)
}

export interface FlussoApi {
  modo: Modo
  passo: Passo
  email: string
  password: string
  cifre: string[]
  errore: string | null
  inCorso: boolean
  esito: Esito | null
  setModo: (m: Modo) => void
  setEmail: (v: string) => void
  setPassword: (v: string) => void
  setCifra: (i: number, v: string) => void
  incolla: (testo: string) => void
  avanti: () => void
  provider: (nome: string) => void
  ricomincia: () => void
}

const CIFRE_VUOTE = ["", "", "", "", "", ""]

export function useFlusso(): FlussoApi {
  const [modo, setModoRaw] = useState<Modo>("password")
  const [passo, setPasso] = useState<Passo>("credenziali")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [cifre, setCifre] = useState<string[]>(CIFRE_VUOTE)
  const [errore, setErrore] = useState<string | null>(null)
  const [inCorso, setInCorso] = useState(false)
  const [esito, setEsito] = useState<Esito | null>(null)

  /* I timer vanno spenti se il componente sparisce a metà verifica:
     altrimenti React scrive su uno stato che non esiste più. */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = [] }, [])
  const attendi = useCallback((ms: number, poi: () => void) => {
    setInCorso(true)
    const t = setTimeout(() => { setInCorso(false); poi() }, ms)
    timers.current.push(t)
  }, [])

  const setModo = useCallback((m: Modo) => {
    setModoRaw(m)
    setPasso("credenziali")
    setErrore(null)
    setCifre(CIFRE_VUOTE)
  }, [])

  const setCifra = useCallback((i: number, v: string) => {
    const solo = v.replace(/\D/g, "").slice(-1)
    setCifre(c => { const n = [...c]; n[i] = solo; return n })
    setErrore(null)
  }, [])

  /* Incollare il codice ricevuto è il gesto naturale: sei caselle che
     accettano solo una cifra alla volta trasformano un incollaggio in sei
     errori silenziosi. */
  const incolla = useCallback((testo: string) => {
    const solo = testo.replace(/\D/g, "").slice(0, 6)
    if (!solo) return
    setCifre(c => c.map((v, i) => solo[i] ?? v))
    setErrore(null)
  }, [])

  const concludi = useCallback((metodo: string, secondoFattore: string) => {
    const dom = dominioDi(email)
    setEsito({
      metodo,
      email,
      ruolo: "amministratore",
      organizzazione: dom || "acme.it",
      secondoFattore,
    })
    setPasso("fatto")
  }, [email])

  const avanti = useCallback(() => {
    setErrore(null)

    if (passo === "credenziali") {
      if (!RX_EMAIL.test(email)) { setErrore("Serve un indirizzo e-mail valido."); return }

      if (modo === "password") {
        if (password.length < 8) { setErrore("La password ha almeno 8 caratteri."); return }
        attendi(750, () => setPasso("mfa"))
        return
      }
      if (modo === "codice") {
        attendi(750, () => setPasso("codice"))
        return
      }
      /* SSO */
      if (!dominioAziendale(email)) {
        setErrore("L'SSO richiede un dominio aziendale, non un indirizzo personale.")
        return
      }
      attendi(900, () => setPasso("sso-attesa"))
      return
    }

    if (passo === "codice" || passo === "mfa") {
      const codice = cifre.join("")
      if (codice.length < 6) { setErrore("Il codice ha sei cifre."); return }
      /* Un codice che va SEMPRE bene non dimostra niente: qui una sequenza
         di zeri viene rifiutata, così si vede anche lo stato di errore. */
      if (codice === "000000") { setErrore("Codice non valido o scaduto."); return }
      attendi(800, () => concludi(
        passo === "mfa" ? "password + secondo fattore" : "codice via e-mail",
        passo === "mfa" ? "app di autenticazione" : "il codice stesso",
      ))
      return
    }

    if (passo === "sso-attesa") {
      attendi(900, () => concludi("SSO aziendale (SAML)", "delegato all'IdP"))
    }
  }, [attendi, cifre, concludi, email, modo, passo, password])

  const provider = useCallback((nome: string) => {
    attendi(900, () => {
      const dom = dominioDi(email)
      setEsito({
        metodo: `accesso social · ${nome}`,
        email: email || `persona@${dom || "esempio.it"}`,
        ruolo: "collaboratore",
        organizzazione: dom || "esempio.it",
        secondoFattore: "delegato al provider",
      })
      setPasso("fatto")
    })
  }, [attendi, email])

  const ricomincia = useCallback(() => {
    setPasso("credenziali"); setCifre(CIFRE_VUOTE); setErrore(null); setEsito(null); setPassword("")
  }, [])

  return {
    modo, passo, email, password, cifre, errore, inCorso, esito,
    setModo, setEmail, setPassword, setCifra, incolla, avanti, provider, ricomincia,
  }
}
