/* ══════════════════════════════════════════════════════════════════════════
   /api/track — una riga per pagina vista, o un evento della voronka.

   Due forme di corpo, stessa porta:
     { path, referrer }                     → visitor_logs (pagina vista)
     { event, path, session_id?, props? }   → funnel_events (passo della voronka)

   Un endpoint solo e non due: il client usa sendBeacon, che non aspetta
   risposta — la distinzione la fa il campo `event`, e tenere insieme la
   validazione è metà del motivo per cui il database ha i CHECK che ha.

   Perché non basta GA4: circa un visitatore su tre lo blocca, e i suoi dati
   arrivano comunque con ore di ritardo. Questo conta tutti e risponde subito.

   Perché passa dal server e non scrive direttamente dal browser: l'indirizzo
   IP il browser non lo conosce, e senza IP non c'è modo di distinguere due
   visitatori da due ricariche. Qui l'IP si vede, si trasforma in impronta e
   si butta — nel database non entra mai in chiaro.

   Niente cookie, niente identificatori persistenti: non serve un banner.
══════════════════════════════════════════════════════════════════════════ */

import {
  clientIpOf, deviceOf, type EdgeReq, type EdgeRes, hashIp, header, isBot, pgInsert,
} from "../src/lib/edge.js"

const MAX_PATH = 300
const MAX_REF = 300
const MAX_SESSION = 64
const MAX_PROPS = 1000
/* Stessa forma del CHECK in tabella: la validazione doppia non è sfiducia
   nel database, è un rifiuto silenzioso invece di un 400 di PostgREST. */
const EVENT_RE = /^[a-z][a-z0-9_]{1,49}$/

/** Le rotte riservate non sono traffico del sito: sono due persone al lavoro. */
const PRIVATE = ["/cabinet", "/dashboard"]

/** Il referrer serve come sorgente, non come cronologia altrui: si tiene il
 *  dominio e si buttano percorso, query e frammento. */
function sourceOf(raw: string, selfHost: string): string | null {
  if (!raw) return null
  try {
    const u = new URL(raw)
    if (u.hostname === selfHost) return null   // navigazione interna: non è una sorgente
    return u.hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

export default async function handler(req: EdgeReq, res: EdgeRes) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" })
    return
  }

  const ua = header(req, "user-agent")
  const device = deviceOf(ua)

  /* I bot si scartano prima di scrivere: un log pieno di crawler farebbe
     sembrare il sito visitato da gente che non esiste. */
  if (isBot(ua)) {
    res.status(204).end()
    return
  }

  let body: { path?: unknown; referrer?: unknown; event?: unknown; session_id?: unknown; props?: unknown } = {}
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body as typeof body) ?? {}
  } catch {
    body = {}
  }

  const path = typeof body.path === "string" && body.path.startsWith("/")
    ? body.path.slice(0, MAX_PATH)
    : null

  if (!path || PRIVATE.some(p => path.startsWith(p))) {
    res.status(204).end()
    return
  }

  /* ── Evento della voronka ─────────────────────────────────────────── */
  if (typeof body.event === "string") {
    if (!EVENT_RE.test(body.event)) { res.status(204).end(); return }

    const sessionId = typeof body.session_id === "string" && body.session_id.length <= MAX_SESSION
      ? body.session_id
      : null

    /* props si accetta solo come oggetto piatto e piccolo: è un dettaglio
       dell'evento, non un posto dove salvare pagine intere. */
    let props: Record<string, unknown> = {}
    if (body.props && typeof body.props === "object" && !Array.isArray(body.props)) {
      const raw = body.props as Record<string, unknown>
      const json = JSON.stringify(raw)
      if (json.length <= MAX_PROPS) props = raw
    }

    await pgInsert("funnel_events", {
      event: body.event,
      session_id: sessionId,
      page_path: path,
      props,
    })
    res.status(204).end()
    return
  }

  const selfHost = (header(req, "x-forwarded-host") || header(req, "host") || "").split(":")[0]
  const referrer = typeof body.referrer === "string" ? sourceOf(body.referrer.slice(0, MAX_REF), selfHost) : null

  await pgInsert("visitor_logs", {
    page_path: path,
    referrer,
    user_agent: ua.slice(0, 400) || null,
    ip_hash: await hashIp(clientIpOf(req)),
    device_type: device,
    country: header(req, "x-vercel-ip-country") || null,
  })

  /* 204 sempre, anche se la scrittura fallisce: chi chiama è un sendBeacon
     che non guarda la risposta, e un errore qui non deve comparire nella
     console di un visitatore. */
  res.status(204).end()
}
