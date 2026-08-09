import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  CUSTOMERS, NAV_GROUPS, PRODUCTS, ROLES, SCREEN_LABEL, SUPPLIERS,
  customerById, eur, invoiceTotals, orderTotals,
  type Invoice, type Order, type RoleId, type ScreenId,
} from "./data"

/* ══════════════════════════════════════════════════════════════════════════
   L'IMPALCATURA DEL PRODOTTO
   Ricerca globale, notifiche, profilo, impostazioni e guida.
   Il rail laterale NON ripete le sezioni della barra in alto: porta gli
   strumenti trasversali, che è il motivo per cui esiste.
══════════════════════════════════════════════════════════════════════════ */

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]
const pop = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.99 },
  transition: { duration: 0.18, ease },
}

/* ── icone ──────────────────────────────────────────────────────────────── */
const I = {
  search: <><circle cx="7.5" cy="7.5" r="5" /><path d="M11.5 11.5L15 15" /></>,
  bell: <><path d="M5 7a4 4 0 018 0c0 3 1.2 4.2 1.6 4.6a.5.5 0 01-.35.9H3.75a.5.5 0 01-.35-.9C3.8 11.2 5 10 5 7z" /><path d="M7.4 14.5a1.8 1.8 0 003.2 0" /></>,
  help: <><circle cx="9" cy="9" r="7" /><path d="M7.1 7a2 2 0 013.9.6c0 1.3-1.9 1.7-1.9 2.9" /><circle cx="9" cy="13.2" r="0.7" fill="currentColor" stroke="none" /></>,
  gear: <><circle cx="9" cy="9" r="2.4" /><path d="M9 2.2v1.6M9 14.2v1.6M15.8 9h-1.6M3.8 9H2.2M13.8 4.2l-1.1 1.1M5.3 12.7l-1.1 1.1M13.8 13.8l-1.1-1.1M5.3 5.3L4.2 4.2" /></>,
  calendar: <><rect x="2.8" y="4" width="12.4" height="11.2" rx="2" /><path d="M12 2.4v3M6 2.4v3M2.8 7.8h12.4" /></>,
  exit: <><path d="M7 15.2H4.2a1.6 1.6 0 01-1.6-1.6V4.4a1.6 1.6 0 011.6-1.6H7" /><path d="M11.6 12.4L15 9l-3.4-3.4M15 9H7" /></>,
  doc: <><rect x="4" y="2.5" width="10" height="13" rx="2" /><path d="M6.8 6.6h4.4M6.8 9.4h4.4M6.8 12.2h3" /></>,
  box: <><path d="M9 2.4l6 3v6l-6 3-6-3v-6z" /><path d="M3 5.4l6 3 6-3M9 8.4v6.6" /></>,
  user: <><circle cx="9" cy="6.6" r="2.8" /><path d="M3.6 15.4a5.4 5.4 0 0110.8 0" /></>,
  check: <path d="M3.5 9.5l3.6 3.6L14.5 5.7" />,
}

export const Ico = ({ n, size = 18 }: { n: keyof typeof I; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
    {I[n]}
  </svg>
)

/* ══════════════════════════════════════════════════════════════════════════
   NAVIGAZIONE
   Le icone e la colonna stanno qui perché la barra in basso del telefono e
   il foglio «Altro» disegnano le stesse voci: definirle due volte era il
   modo sicuro per farle divergere.
══════════════════════════════════════════════════════════════════════════ */
const SCREEN_PATHS: Record<ScreenId, React.ReactNode> = {
  cruscotto: <><rect x="2.5" y="2.5" width="6" height="6" /><rect x="11.5" y="2.5" width="6" height="6" /><rect x="2.5" y="11.5" width="6" height="6" /><rect x="11.5" y="11.5" width="6" height="6" /></>,
  catalogo:  <><rect x="2.5" y="3.5" width="15" height="13" /><line x1="2.5" y1="7.5" x2="17.5" y2="7.5" /><line x1="7.5" y1="7.5" x2="7.5" y2="16.5" /></>,
  ordini:    <><rect x="4" y="2.5" width="12" height="15" /><line x1="7" y1="6.5" x2="13" y2="6.5" /><line x1="7" y1="10" x2="13" y2="10" /><line x1="7" y1="13.5" x2="11" y2="13.5" /></>,
  fatture:   <><path d="M4 2.5h12v15l-2.5-1.5L11 17.5 8.5 16 6 17.5 4 16z" /><line x1="7" y1="7" x2="13" y2="7" /><line x1="7" y1="10.5" x2="13" y2="10.5" /></>,
  preventivi: <><path d="M3.5 4.5h11v9h-11z" /><path d="M6.4 8.2h5.2M6.4 10.8h3" /><circle cx="14.6" cy="13.6" r="2.6" /></>,
  assistenza: <><path d="M3 8.6a6 6 0 1112 0v3.6a2 2 0 01-2 2H9.4" /><rect x="2.4" y="8" width="2.8" height="4.4" rx="1.2" /><rect x="12.8" y="8" width="2.8" height="4.4" rx="1.2" /></>,
  documenti: <><path d="M4 2.5h6l4 4v9H4z" /><path d="M10 2.5v4h4" /><path d="M6.6 10.4h4.8M6.6 12.8h3.4" /></>,
  clienti:   <><circle cx="10" cy="7" r="3" /><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" /></>,
  listini:   <><line x1="3.5" y1="5" x2="16.5" y2="5" /><line x1="3.5" y1="10" x2="16.5" y2="10" /><line x1="3.5" y1="15" x2="16.5" y2="15" /></>,
  /* le regole: un cartellino con la percentuale */
  prezzi:    <><path d="M10.6 2.6H16v5.4L8.4 15.6a1.6 1.6 0 01-2.3 0l-3.1-3.1a1.6 1.6 0 010-2.3z" /><circle cx="13.1" cy="5.5" r="0.9" /></>,
  /* i fornitori: due nodi che confluiscono */
  fornitori: <><path d="M3 4.5h5.6v4.2H3z" /><path d="M11.4 11.2H17v4.2h-5.6z" /><path d="M5.8 8.7v3.4a1.6 1.6 0 001.6 1.6h4" /></>,
}

export const ScreenIcon = ({ id, size = 18 }: { id: ScreenId; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor"
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
    {SCREEN_PATHS[id]}
  </svg>
)

export type NavBadge = { n?: number; alert?: boolean }

function NavLink({ id, current, badge, onGo, pillId }: {
  id: ScreenId; current: boolean; badge?: NavBadge; onGo: (s: ScreenId) => void; pillId: string
}) {
  return (
    <button type="button" className="vt-side-link"
      aria-current={current ? "page" : undefined} onClick={() => onGo(id)}>
      {current && (
        <motion.span className="vt-side-active" layoutId={pillId}
          transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.7 }} />
      )}
      <ScreenIcon id={id} />
      <span className="vt-side-text">{SCREEN_LABEL[id]}</span>
      {badge?.alert
        ? <span className="vt-side-flag" style={{ background: "var(--vt-bad)" }} aria-label="richiede attenzione" />
        : badge?.n ? <span className="vt-side-count">{badge.n}</span> : null}
    </button>
  )
}

function NavGroups({ nav, screen, badges, onGo, pillId }: {
  nav: ScreenId[]; screen: ScreenId; badges: Partial<Record<ScreenId, NavBadge>>
  onGo: (s: ScreenId) => void; pillId: string
}) {
  return (
    <>
      {NAV_GROUPS.map(g => {
        const items = g.items.filter(i => nav.includes(i))
        if (!items.length) return null
        return (
          <div key={g.id}>
            <div className="vt-side-group">{g.label}</div>
            {items.map(id => (
              <NavLink key={id} id={id} current={screen === id} badge={badges[id]} onGo={onGo} pillId={pillId} />
            ))}
          </div>
        )
      })}
    </>
  )
}

export function Sidebar({ nav, screen, badges, onGo, onSettings, onHelp, settingsOpen, settingsSlot }: {
  nav: ScreenId[]
  screen: ScreenId
  badges: Partial<Record<ScreenId, NavBadge>>
  onGo: (s: ScreenId) => void
  onSettings: () => void
  onHelp: () => void
  settingsOpen: boolean
  /* il pannello vero e proprio: reso QUI, appoggiato al bottone che lo apre.
     Prima veniva issato come fratello dell'intera colonna e ancorato con
     bottom/left sul contenitore sbagliato — un contenitore che, avendo come
     unico figlio un elemento a sua volta position:absolute, collassava ad
     altezza zero. Il pannello si posizionava rispetto a un rettangolo alto 0
     px vicino al fondo della pagina e finiva quasi tutto sotto la piega,
     tagliato dall'overflow:hidden della pagina: cliccare "Impostazioni"
     sembrava non fare nulla. */
  settingsSlot?: React.ReactNode
}) {
  return (
    <nav className="vt-side" aria-label="Sezioni" style={{ position: "relative" }}>
      <div className="vt-side-brand">
        <span className="vt-side-mark">V</span>
        <span className="vt-side-text" style={{ minWidth: 0 }}>
          <span className="vt-side-name" style={{ display: "block" }}>Valtecnica</span>
          <span className="vt-side-env" style={{ display: "block" }}>Portale fornitori</span>
        </span>
      </div>

      <div className="vt-side-scroll">
        <NavGroups nav={nav} screen={screen} badges={badges} onGo={onGo} pillId="vt-nav-pill" />
      </div>

      {/* Gli strumenti, non le destinazioni: è la sola cosa che il piede
          della colonna ha il diritto di contenere. */}
      <div className="vt-side-foot">
        <span className="vt-side-anchor">
          <button type="button" className="vt-side-link" aria-expanded={settingsOpen} onClick={onSettings}>
            <Ico n="gear" />
            <span className="vt-side-text">Impostazioni</span>
          </button>
          {settingsSlot}
        </span>
        <button type="button" className="vt-side-link" onClick={onHelp}>
          <Ico n="help" />
          <span className="vt-side-text">Che cos'è questo portale</span>
        </button>
      </div>
    </nav>
  )
}

/** Il foglio del telefono: le stesse voci, lo stesso ordine, gli stessi gruppi.
    Sotto i 900px la colonna sparisce (`.vt-side { display:none }`), quindi
    senza Impostazioni qui il pannello preferenze non era raggiungibile da
    telefono — non un bug di posizionamento come sulla colonna, proprio
    nessuna via d'accesso. */
export function NavSheet({ nav, screen, badges, onGo, onHelp, onClose, onSettings, settingsOpen, settingsSlot }: {
  nav: ScreenId[]
  screen: ScreenId
  badges: Partial<Record<ScreenId, NavBadge>>
  onGo: (s: ScreenId) => void
  onHelp: () => void
  onClose: () => void
  onSettings: () => void
  settingsOpen: boolean
  settingsSlot?: React.ReactNode
}) {
  return (
    <>
      <motion.div className="vt-nav-scrim" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }} />
      <motion.nav className="vt-nav-sheet" aria-label="Tutte le sezioni"
        initial={{ x: -32, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -32, opacity: 0 }}
        transition={{ duration: 0.22, ease }}>
        <div className="vt-side-brand">
          <span className="vt-side-mark">V</span>
          <span style={{ minWidth: 0 }}>
            <span className="vt-side-name" style={{ display: "block" }}>Valtecnica</span>
            <span className="vt-side-env" style={{ display: "block" }}>Portale fornitori</span>
          </span>
          <button type="button" className="vt-icon-btn" onClick={onClose} aria-label="Chiudi"
            style={{ marginLeft: "auto" }}>✕</button>
        </div>
        <NavGroups nav={nav} screen={screen} badges={badges}
          onGo={s => { onGo(s); onClose() }} pillId="vt-nav-pill-sheet" />
        <div className="vt-side-foot">
          <span className="vt-side-anchor">
            <button type="button" className="vt-side-link" aria-expanded={settingsOpen} onClick={onSettings}>
              <Ico n="gear" /><span>Impostazioni</span>
            </button>
            {settingsSlot}
          </span>
          <button type="button" className="vt-side-link" onClick={() => { onHelp(); onClose() }}>
            <Ico n="help" /><span>Che cos'è questo portale</span>
          </button>
        </div>
      </motion.nav>
    </>
  )
}

/** Chiude il pannello al clic fuori e con Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); close() } }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey, true)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey, true)
    }
  }, [open, close])
  return ref
}

/* ══════════════════════════════════════════════════════════════════════════
   NOTIFICHE — derivate dallo stato reale, non inventate
══════════════════════════════════════════════════════════════════════════ */
export type Notice = {
  id: string
  tone: "bad" | "warn" | "ok"
  title: string
  body: string
  go: { screen: ScreenId; drawer?: { kind: "order" | "invoice"; id: string } }
}

export function buildNotices(orders: Order[], invoices: Invoice[], role: RoleId): Notice[] {
  const out: Notice[] = []

  for (const o of orders.filter(o => o.state === "approvazione")) {
    out.push({
      id: `ord-${o.id}`, tone: "warn",
      title: `${o.id} attende approvazione`,
      body: `${customerById(o.customerId).name} · ${eur(orderTotals(o).totale)}`,
      go: { screen: "ordini", drawer: { kind: "order", id: o.id } },
    })
  }
  for (const i of invoices.filter(i => i.state === "scaduta")) {
    out.push({
      id: `inv-${i.id}`, tone: "bad",
      title: `${i.id} scaduta`,
      body: `${customerById(i.customerId).name} · ${eur(invoiceTotals(i).totale)} · scadenza ${i.scadenza}`,
      go: { screen: "fatture", drawer: { kind: "invoice", id: i.id } },
    })
  }
  for (const p of PRODUCTS.filter(p => p.stock === 0)) {
    out.push({
      id: `stk-${p.sku}`, tone: "warn",
      title: `${p.sku} esaurito`,
      body: p.name,
      go: { screen: "catalogo" },
    })
  }
  /* Una connessione ferma non è un problema di sistema: è un problema di
     costi che non si aggiornano, e come tale va notificata. */
  if (role === "admin") {
    for (const s of SUPPLIERS.filter(s => s.state === "errore")) {
      out.push({
        id: `sup-${s.id}`, tone: "bad",
        title: `${s.name}: sincronizzazione ferma`,
        body: `Ultima corsa riuscita il ${s.lastOk} · ${s.offers} articoli sul dato vecchio`,
        go: { screen: "fornitori" },
      })
    }
  }
  /* il cliente non deve leggere notifiche di back-office */
  return role === "cliente" ? out.filter(n => !n.id.startsWith("stk-")) : out
}

export function NotificationsMenu({ notices, read, onRead, onReadAll, onGo, onClose }: {
  notices: Notice[]
  read: string[]
  onRead: (id: string) => void
  onReadAll: () => void
  onGo: (n: Notice) => void
  onClose: () => void
}) {
  const ref = useDismiss(true, onClose)
  const tone = (t: Notice["tone"]) =>
    t === "bad" ? "var(--vt-bad)" : t === "warn" ? "var(--vt-warn)" : "var(--vt-ok)"

  return (
    <motion.div ref={ref} className="vt-pop" style={{ width: 380 }} {...pop} role="dialog" aria-label="Notifiche">
      <div className="vt-pop-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span className="vt-h3">Notifiche</span>
        <button type="button" className="vt-btn vt-btn-quiet vt-btn-sm" onClick={onReadAll}>
          Segna tutte come lette
        </button>
      </div>
      <div className="vt-pop-body">
        {notices.length === 0 && (
          <p className="vt-body vt-muted" style={{ padding: "24px 16px", textAlign: "center" }}>
            Nessuna notifica: non c'è niente in sospeso.
          </p>
        )}
        {notices.map(n => (
          <button key={n.id} type="button"
            className={`vt-notif${read.includes(n.id) ? " is-read" : ""}`}
            onClick={() => { onRead(n.id); onGo(n) }}>
            <span className="vt-notif-dot" style={{ background: tone(n.tone) }} />
            <span style={{ minWidth: 0 }}>
              <span className="vt-small" style={{ display: "block", fontWeight: 500 }}>{n.title}</span>
              <span className="vt-micro" style={{ display: "block", marginTop: 2 }}>{n.body}</span>
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PROFILO
══════════════════════════════════════════════════════════════════════════ */
export function ProfileMenu({ role, onRole, onReset, onExit, onClose }: {
  role: RoleId
  onRole: (r: RoleId) => void
  onReset: () => void
  onExit: () => void
  onClose: () => void
}) {
  const ref = useDismiss(true, onClose)
  const r = ROLES[role]
  return (
    <motion.div ref={ref} className="vt-pop" style={{ width: 290 }} {...pop} role="menu" aria-label="Profilo">
      <div className="vt-pop-head" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span className="vt-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
          {r.person.split(" ").map(w => w[0]).join("")}
        </span>
        <span style={{ minWidth: 0 }}>
          <span className="vt-profile-name" style={{ display: "block" }}>{r.person}</span>
          <span className="vt-profile-mail" style={{ display: "block" }}>
            {r.person.toLowerCase().replace(" ", ".")}@valtecnica.it
          </span>
        </span>
      </div>

      <div style={{ padding: "10px 16px 4px" }}>
        <span className="vt-micro" style={{ display: "block", marginBottom: 8 }}>Accedi come</span>
        {(["admin", "agente", "cliente"] as RoleId[]).map(id => (
          <button key={id} type="button" role="menuitemradio" aria-checked={role === id}
            onClick={() => { onRole(id); onClose() }}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 0",
              fontSize: 13.5, color: "var(--vt-ink)",
            }}>
            <span style={{
              width: 16, height: 16, borderRadius: 999, flexShrink: 0,
              border: `1px solid ${role === id ? "var(--vt-accent-fill)" : "var(--vt-line)"}`,
              background: role === id ? "var(--vt-accent-fill)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF",
            }}>{role === id && <Ico n="check" size={10} />}</span>
            <span>{ROLES[id].label}</span>
            <span className="vt-micro" style={{ marginLeft: "auto" }}>{ROLES[id].nav.length} sezioni</span>
          </button>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--vt-line-soft)", marginTop: 10 }}>
        <button type="button" className="vt-pop-item" role="menuitem" onClick={() => { onReset(); onClose() }}>
          <Ico n="calendar" size={16} />Ripristina i dati della demo
        </button>
        <button type="button" className="vt-pop-item" role="menuitem" onClick={onExit}
          style={{ color: "var(--vt-bad)" }}>
          <Ico n="exit" size={16} />Chiudi l'anteprima
        </button>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   RICERCA GLOBALE — paletta dei comandi
══════════════════════════════════════════════════════════════════════════ */
type Hit = {
  group: string
  label: string
  meta: string
  icon: keyof typeof I
  go: { screen: ScreenId; drawer?: { kind: "order" | "invoice"; id: string } }
}

export function CommandPalette({ orders, invoices, role, onGo, onClose }: {
  orders: Order[]
  invoices: Invoice[]
  role: RoleId
  onGo: (g: Hit["go"]) => void
  onClose: () => void
}) {
  const [q, setQ] = useState("")
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const hits = useMemo<Hit[]>(() => {
    const t = q.trim().toLowerCase()
    const all: Hit[] = []

    for (const id of ROLES[role].nav) {
      all.push({ group: "Sezioni", label: SCREEN_LABEL[id], meta: "vai alla sezione", icon: "box", go: { screen: id } })
    }
    for (const o of orders) {
      all.push({
        group: "Ordini", label: o.id,
        meta: `${customerById(o.customerId).name} · ${eur(orderTotals(o).totale)}`,
        icon: "doc", go: { screen: "ordini", drawer: { kind: "order", id: o.id } },
      })
    }
    for (const i of invoices) {
      all.push({
        group: "Fatture", label: i.id,
        meta: `${customerById(i.customerId).name} · ${eur(invoiceTotals(i).totale)}`,
        icon: "doc", go: { screen: "fatture", drawer: { kind: "invoice", id: i.id } },
      })
    }
    for (const p of PRODUCTS) {
      all.push({ group: "Articoli", label: p.sku, meta: p.name, icon: "box", go: { screen: "catalogo" } })
    }
    /* le anagrafiche fuori perimetro non entrano nemmeno nell'indice */
    if (role !== "cliente") {
      const visible = role === "admin" ? CUSTOMERS : CUSTOMERS.filter(c => c.agente === "Marco Bianchi")
      for (const c of visible) {
        all.push({ group: "Clienti", label: c.name, meta: `${c.city} · listino ${c.listino}`, icon: "user", go: { screen: "clienti" } })
      }
    }
    if (role === "admin") {
      for (const s of SUPPLIERS) {
        all.push({
          group: "Fornitori", label: s.name,
          meta: `${s.id} · ${s.offers} articoli · ${s.cronLabel}`,
          icon: "box", go: { screen: "fornitori" },
        })
      }
    }

    if (!t) return all.filter(h => h.group === "Sezioni").concat(all.filter(h => h.group === "Ordini").slice(0, 4))
    return all.filter(h => h.label.toLowerCase().includes(t) || h.meta.toLowerCase().includes(t)).slice(0, 24)
  }, [q, orders, invoices, role])

  useEffect(() => { setSel(0) }, [q])

  const grouped = useMemo(() => {
    const m = new Map<string, Hit[]>()
    hits.forEach(h => { if (!m.has(h.group)) m.set(h.group, []); m.get(h.group)!.push(h) })
    return [...m.entries()]
  }, [hits])

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(hits.length - 1, s + 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s - 1)) }
    else if (e.key === "Enter") { e.preventDefault(); const h = hits[sel]; if (h) { onGo(h.go); onClose() } }
    else if (e.key === "Escape") { e.preventDefault(); onClose() }
  }

  /* mantiene la voce scelta dentro la finestra di scorrimento */
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" })
  }, [sel])

  let flat = -1
  return (
    <div className="vt-palette-scrim" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="vt-palette" role="dialog" aria-label="Ricerca globale"
        initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.18, ease }}>
        <input
          ref={inputRef} className="vt-palette-input" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={onKey} placeholder="Cerca ordini, fatture, articoli, clienti…"
          aria-label="Cerca" role="combobox" aria-expanded aria-controls="vt-palette-list"
        />
        <div className="vt-palette-list" id="vt-palette-list" ref={listRef} role="listbox">
          {hits.length === 0 && (
            <p className="vt-body vt-muted" style={{ padding: "28px 16px", textAlign: "center" }}>
              Nessun risultato per «{q}».
            </p>
          )}
          {grouped.map(([g, items]) => (
            <div key={g}>
              <div className="vt-palette-group">{g}</div>
              {items.map(h => {
                flat += 1
                const i = flat
                return (
                  <button key={`${g}-${h.label}`} type="button" role="option" aria-selected={i === sel}
                    className="vt-palette-item" onMouseEnter={() => setSel(i)}
                    onClick={() => { onGo(h.go); onClose() }}>
                    <Ico n={h.icon} size={16} />
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.label}</span>
                    <span className="vt-palette-meta" style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.meta}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="vt-pop-foot" style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span className="vt-micro">↑↓ per scorrere</span>
          <span className="vt-micro">↵ per aprire</span>
          <span className="vt-micro">esc per chiudere</span>
        </div>
      </motion.div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   IMPOSTAZIONI — interruttori che cambiano davvero qualcosa
══════════════════════════════════════════════════════════════════════════ */
export type Prefs = {
  density: "comfortable" | "compact"
  showMargins: boolean
  liveFeed: boolean
}

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="vt-settings-row">
      <span style={{ minWidth: 0 }}>
        <span className="vt-small" style={{ display: "block", fontWeight: 500 }}>{title}</span>
        {hint && <span className="vt-micro" style={{ display: "block", marginTop: 2 }}>{hint}</span>}
      </span>
      {children}
    </div>
  )
}

const Switch = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label}
    className="vt-switch" onClick={onToggle} />
)

export function SettingsPanel({ prefs, setPrefs, role, onClose, rail = false }: {
  prefs: Prefs
  setPrefs: (p: Partial<Prefs>) => void
  role: RoleId
  onClose: () => void
  /* aperta dal rail: si apre di lato invece che sotto */
  rail?: boolean
}) {
  const ref = useDismiss(true, onClose)
  return (
    <motion.div ref={ref} className={`vt-pop${rail ? " vt-pop-rail" : ""}`} style={{ width: 340 }} {...pop} role="dialog" aria-label="Impostazioni">
      <div className="vt-pop-head"><span className="vt-h3">Impostazioni</span></div>
      <div className="vt-pop-body" style={{ padding: "0 16px 8px" }}>
        <Row title="Densità" hint="Righe più alte per leggere, più basse per lavorare.">
          <div className="vt-seg">
            {(["comfortable", "compact"] as const).map(t => (
              <button key={t} type="button" aria-pressed={prefs.density === t} onClick={() => setPrefs({ density: t })}>
                {t === "comfortable" ? "Comoda" : "Compatta"}
              </button>
            ))}
          </div>
        </Row>
        {role !== "cliente" && (
          <Row title="Mostra margini" hint="Nasconde le colonne economiche in presenza del cliente.">
            <Switch on={prefs.showMargins} onToggle={() => setPrefs({ showMargins: !prefs.showMargins })} label="Mostra margini" />
          </Row>
        )}
        <Row title="Attività in tempo reale" hint="Il flusso di eventi sul cruscotto.">
          <Switch on={prefs.liveFeed} onToggle={() => setPrefs({ liveFeed: !prefs.liveFeed })} label="Attività in tempo reale" />
        </Row>
      </div>
      <div className="vt-pop-foot">
        <p className="vt-micro">
          Le preferenze valgono per questa sessione: chiudendo l'anteprima si azzerano.
        </p>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   GUIDA — che cos'è questo cruscotto e cosa fa
══════════════════════════════════════════════════════════════════════════ */
const CAPS: { t: string; d: string }[] = [
  { t: "Catalogo riservato", d: "Ogni cliente vede il proprio prezzo, non il listino pubblico: sconto di fascia, scaglioni per quantità e disponibilità reale. Cambia «Operi come» e l'intero catalogo si riprezza davanti a te." },
  { t: "Gestione ordini", d: "Dal carrello al documento: lotto minimo, controllo del fido, ciclo in sette stati, DDT e collegamento alla fattura. Se il fido non basta, l'ordine non viene bloccato ma instradato in approvazione." },
  { t: "Fatturazione integrata", d: "Scadenzario, insoluti, riepilogo IVA su due aliquote, fac-simile del documento e tracciato XML per lo SdI. Le azioni impossibili sono rifiutate spiegando perché." },
  { t: "Accessi multi-ruolo", d: "Amministratore, agente e cliente vedono dati diversi — non nascosti con il CSS: ciò che un ruolo non può vedere non entra proprio nella pagina. Le azioni vietate restano visibili ma disattivate, con il motivo." },
  { t: "Preventivi (RFQ)", d: "Non tutto ha un prezzo a listino: sulle voci complesse si tratta. Il cliente chiede, il back-office quota con una validità, il cliente accetta e l'offerta diventa un ordine al prezzo concordato." },
  { t: "Assistenza e resi", d: "Il rapporto non finisce alla consegna. Resi di merce difettosa, domande tecniche e pratiche amministrative vivono in una conversazione con uno stato, non in una casella di posta." },
  { t: "Centro documenti", d: "Contratti, certificati CE e schede tecniche archiviati accanto all'articolo o all'ordine a cui si riferiscono, invece che sparsi fra allegati di email." },
  { t: "Indicatori in tempo reale", d: "Fatturato, ticket medio, margine e scaduto per periodo, con lo stato degli ordini cliccabile per filtrare la lista." },
  { t: "Fornitori collegati", d: "Il catalogo non si scrive a mano: quattro fornitori lo alimentano, ognuno con il suo formato — REST, XML, CSV su SFTP — e il suo ritmo. La mappatura dei campi è un dato modificabile dal pannello, non del codice: aggiungere un fornitore non richiede un rilascio. «Sincronizza ora» percorre le fasi vere della corsa." },
  { t: "Regole di prezzo", d: "Il prezzo di vendita si ricava dal costo: ricarico o margine obiettivo, pavimento di margine minimo, arrotondamento, IVA. Muovi un cursore e la tabella si riprezza articolo per articolo, con il passaggio del calcolo visibile riga per riga." },
]

export function HelpPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="vt-palette-scrim" style={{ paddingTop: "8vh" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="vt-palette" style={{ maxWidth: 680, maxHeight: "min(78vh,680px)" }}
        role="dialog" aria-label="Guida al portale"
        initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.2, ease }}>

        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid var(--vt-line-soft)", display: "flex", gap: 16, alignItems: "flex-start" }}>
          <span style={{
            width: 40, height: 40, borderRadius: 13, flexShrink: 0, background: "var(--vt-accent-fill)",
            color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
          }}><Ico n="help" size={20} /></span>
          <div style={{ minWidth: 0 }}>
            <h3 className="vt-h1" style={{ fontSize: 21 }}>Che cos'è questo portale</h3>
            <p className="vt-small vt-muted" style={{ marginTop: 6 }}>
              Un portale fornitori B2B: il posto dove i clienti di un distributore ordinano
              alle proprie condizioni e l'azienda governa ordini, margini e incassi.
            </p>
          </div>
          <button type="button" className="vt-icon-btn" onClick={onClose} aria-label="Chiudi" style={{ marginLeft: "auto" }}>✕</button>
        </div>

        <div className="vt-palette-list" style={{ padding: "6px 24px 20px" }}>
          <p className="vt-body" style={{ padding: "16px 0" }}>
            Quello che stai usando è una <strong>demo funzionante</strong>, non uno screenshot:
            i dati vivono nel browser e reagiscono davvero. Valtecnica S.r.l. e i suoi
            clienti sono inventati; nessun importo descrive un'azienda reale.
          </p>

          {CAPS.map((c, i) => (
            <div key={c.t} style={{ display: "flex", gap: 14, padding: "14px 0", borderTop: "1px solid var(--vt-line-soft)" }}>
              <span style={{
                width: 26, height: 26, borderRadius: 9, flexShrink: 0, background: "var(--vt-sheet-alt)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, color: "var(--vt-ink-muted)",
              }}>{i + 1}</span>
              <span style={{ minWidth: 0 }}>
                <span className="vt-h3" style={{ display: "block", marginBottom: 3 }}>{c.t}</span>
                <span className="vt-small vt-muted">{c.d}</span>
              </span>
            </div>
          ))}

          <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "var(--vt-sheet-alt)" }}>
            <span className="vt-h3" style={{ display: "block", marginBottom: 8 }}>Da dove iniziare</span>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--vt-ink-muted)", fontSize: 13.5, lineHeight: 1.75 }}>
              <li>Apri <strong>Catalogo</strong> e cambia «Operi come»: i prezzi si riscrivono.</li>
              <li>Passa da Amministratore a <strong>Cliente</strong>: l'interfaccia si restringe.</li>
              <li>Aggiungi un articolo e completa l'ordine: guarda il controllo del fido.</li>
              <li>Apri una fattura scaduta e la scheda <strong>XML SdI</strong>.</li>
              <li>In <strong>Catalogo</strong> premi «Configura»: il codice si ricompone da solo.</li>
              <li>Chiedi una quotazione su una voce fuori listino e rispondi da Amministratore.</li>
              <li>Incolla un elenco di codici con «Importa righe», come dal tuo gestionale.</li>
              <li>In <strong>Fornitori</strong> apri IdroPart — è in errore — e premi «Sincronizza ora».</li>
              <li>In <strong>Regole di prezzo</strong> muovi il ricarico: il catalogo si riprezza sotto.</li>
              <li>Apri una riga dell'impatto: mostra ogni passaggio del calcolo.</li>
              <li>Premi <strong>⌘K</strong> per cercare qualsiasi documento.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export { pop, useDismiss }
