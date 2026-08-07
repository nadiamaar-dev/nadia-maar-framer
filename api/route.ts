/* ══════════════════════════════════════════════════════════════════════════
   /api/route — cosa succede a un indirizzo che non esiste.

   Fino a qui il rewrite mandava *tutto* su index.html e il router, per una
   rotta sconosciuta, mostrava la home con stato 200. Sono due errori in uno:
   per Google è un «soft 404» (una pagina che dice di esistere e non esiste,
   e che quindi finisce indicizzata come duplicato della home), e per noi
   significa non sapere mai quali link verso il sito sono rotti.

   Adesso vercel.json elenca le rotte vere e manda qui tutto il resto:

     1. se esiste un redirect attivo per quel percorso → 301 o 302 veri,
        quelli che i motori seguono trasferendo il posizionamento. Un
        `location.replace()` dal browser non lo fa: è JavaScript, non HTTP;
     2. altrimenti si registra il 404 e si serve il guscio dell'app con
        stato 404 — l'utente vede la pagina «non trovata» disegnata come il
        resto del sito, i crawler leggono lo stato giusto.

   La catena di redirect si risolve qui, fino a tre salti: rimandare il
   browser a un indirizzo che a sua volta rimanda è lento e a ogni salto
   Google perde un po' del segnale che stava trasferendo.
══════════════════════════════════════════════════════════════════════════ */

import {
  clientIpOf, type EdgeReq, type EdgeRes, hashIp, header, isBot, originOf,
  pgInsert, pgSelect, supabaseEnv,
} from "../src/lib/edge"

type Redirect = { id: string; old_path: string; new_path: string; type: number }

const MAX_HOPS = 3

async function lookup(path: string): Promise<Redirect | null> {
  const rows = await pgSelect<Redirect>(
    `redirects?select=id,old_path,new_path,type&active=is.true&old_path=eq.${encodeURIComponent(path)}&limit=1`,
  )
  return rows[0] ?? null
}

/** Il contatore serve a sapere quali redirect si possono ritirare. Non si
 *  attende: l'utente non deve aspettare una statistica. */
function bump(id: string): void {
  const sb = supabaseEnv()
  if (!sb) return
  void fetch(`${sb.url}/rest/v1/rpc/bump_redirect`, {
    method: "POST",
    headers: { apikey: sb.key, authorization: `Bearer ${sb.key}`, "content-type": "application/json" },
    body: JSON.stringify({ p_id: id }),
  }).catch(() => {})
}

let shellCache: { html: string; at: number } | null = null

async function shell(origin: string): Promise<string | null> {
  if (shellCache && Date.now() - shellCache.at < 600_000) return shellCache.html
  try {
    const r = await fetch(`${origin}/index.html`, { headers: { "user-agent": "nm-404" } })
    if (!r.ok) return null
    const html = await r.text()
    shellCache = { html, at: Date.now() }
    return html
  } catch {
    return null
  }
}

export default async function handler(req: EdgeReq, res: EdgeRes) {
  const origin = originOf(req)
  let path = "/"
  let search = ""
  try {
    const u = new URL(req.url ?? "/", origin)
    path = u.pathname || "/"
    search = u.search
  } catch { /* resta "/" */ }

  /* ── 1 · redirect ── */
  let target: string | null = null
  let status = 301
  let cursor = path
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const hit = await lookup(cursor)
    if (!hit) break
    bump(hit.id)
    target = hit.new_path
    /* Il codice è quello del PRIMO salto: è la regola che l'autore ha
       scritto pensando all'indirizzo che il visitatore ha davvero digitato. */
    if (hop === 0) status = hit.type === 302 ? 302 : 301
    if (/^https?:\/\//.test(hit.new_path)) break     // fuori sito: non si insegue
    cursor = hit.new_path
  }

  if (target) {
    const location = /^https?:\/\//.test(target) ? target : `${target}${search}`
    res.setHeader("location", location)
    /* Un 301 lo si cambia idea di rado, ma la cache dei browser lo tiene per
       sempre: un anno di s-maxage sul CDN e niente cache privata è il
       compromesso che permette di correggere un errore. */
    res.setHeader("cache-control", status === 301 ? "public, max-age=0, s-maxage=31536000" : "no-store")
    res.status(status).send(`Redirect: ${location}`)
    return
  }

  /* ── 2 · 404 ── */
  const ua = header(req, "user-agent")
  const ref = header(req, "referer")
  let referrer: string | null = null
  try {
    if (ref) {
      const u = new URL(ref)
      /* Il dominio basta a capire da dove arriva il link rotto; il percorso
         completo sarebbe la cronologia di qualcun altro. */
      referrer = u.hostname.replace(/^www\./, "") + (u.hostname === new URL(origin).hostname ? u.pathname : "")
    }
  } catch { /* referrer non valido: si scarta */ }

  await pgInsert("not_found_logs", {
    path: path.slice(0, 300),
    referrer,
    user_agent: ua.slice(0, 400) || null,
    ip_hash: await hashIp(clientIpOf(req)),
    is_bot: isBot(ua),
  })

  const html = await shell(origin)
  res.setHeader("content-type", "text/html; charset=utf-8")
  res.setHeader("cache-control", "no-store")
  res.setHeader("x-robots-tag", "noindex")
  res.status(404).send(html ?? `<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>Pagina non trovata — Nadia Maar</title><meta name="robots" content="noindex"></head>
<body><h1>404 — Pagina non trovata</h1>
<p><a href="${origin}">Torna alla home</a></p></body></html>`)
}
