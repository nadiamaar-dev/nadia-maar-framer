import { supabase } from "./core"
import type { IndexNowResult, NotFoundStats, Redirect } from "./types"

/* ══════════════════════════════════════════════════════════════════════════
   REDIRECT, 404 E INDICIZZAZIONE IMMEDIATA.

   Le tre cose che trasformano il pannello da «configura» a «recupera
   traffico»: un link rotto verso il sito è una visita già guadagnata e
   buttata via, e un redirect è il modo di riprendersela insieme al
   posizionamento che quell'indirizzo si era conquistato.
══════════════════════════════════════════════════════════════════════════ */

/* eslint-disable @typescript-eslint/no-explicit-any */

function map(r: any): Redirect {
  return {
    id: r.id,
    oldPath: r.old_path,
    newPath: r.new_path,
    type: r.type === 302 ? 302 : 301,
    active: !!r.active,
    hits: r.hits ?? 0,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  }
}

export async function fetchRedirects(): Promise<Redirect[]> {
  const { data, error } = await supabase
    .from("redirects").select("*").order("hits", { ascending: false }).order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(map)
}

export async function saveRedirect(r: {
  id?: string; oldPath: string; newPath: string; type: 301 | 302; active: boolean; note?: string
}): Promise<Redirect> {
  const row = {
    old_path: r.oldPath.trim(),
    new_path: r.newPath.trim(),
    type: r.type,
    active: r.active,
    note: r.note?.trim() || null,
  }
  const q = r.id
    ? supabase.from("redirects").update(row).eq("id", r.id).select().single()
    : supabase.from("redirects").insert(row).select().single()
  const { data, error } = await q
  if (error) throw error
  return map(data)
}

export async function deleteRedirect(id: string): Promise<void> {
  const { error } = await supabase.from("redirects").delete().eq("id", id)
  if (error) throw error
}

/**
 * Un redirect è valido se non punta a se stesso, se non chiude un anello con
 * quelli già presenti, e se l'origine non è una rotta viva — sovrascrivere
 * una pagina esistente con un redirect la fa sparire senza che nessuno se ne
 * accorga finché non manca dalle statistiche.
 */
export function validateRedirect(
  draft: { id?: string; oldPath: string; newPath: string },
  existing: Redirect[],
  liveRoutes: string[],
): string | null {
  const from = draft.oldPath.trim()
  const to = draft.newPath.trim()

  if (!from.startsWith("/")) return "L'origine deve iniziare con «/»."
  if (!/^(\/|https?:\/\/)/.test(to)) return "La destinazione deve essere un percorso «/…» o un URL completo."
  if (from === to) return "Origine e destinazione coincidono: sarebbe un ciclo."
  if (liveRoutes.includes(from)) return `${from} è una pagina esistente del sito: un redirect la nasconderebbe.`

  const others = existing.filter(r => r.id !== draft.id && r.active)
  if (others.some(r => r.oldPath === from)) return `Esiste già un redirect da ${from}.`

  /* Inseguimento della catena: se partendo dalla destinazione si torna
     all'origine, l'anello è chiuso e il browser gira a vuoto. */
  const byFrom = new Map(others.map(r => [r.oldPath, r.newPath]))
  let cursor = to
  for (let i = 0; i < 10; i++) {
    if (cursor === from) return "Questo redirect chiuderebbe un anello: il browser girerebbe a vuoto."
    const next = byFrom.get(cursor)
    if (!next) break
    cursor = next
  }
  return null
}

/* ── 404 ──────────────────────────────────────────────────────────────── */

export async function fetchNotFoundStats(hours: number): Promise<NotFoundStats> {
  const { data, error } = await supabase.rpc("not_found_stats", { p_hours: hours })
  if (error) throw error
  const d = (data ?? {}) as any
  return {
    total: Number(d.total ?? 0),
    humans: Number(d.humans ?? 0),
    paths: (d.paths ?? []).map((x: any) => ({
      path: x.path,
      hits: Number(x.hits),
      humanHits: Number(x.human_hits),
      lastSeen: x.last_seen,
      topReferrer: x.top_referrer ?? undefined,
    })),
  }
}

export async function pruneNotFoundLogs(days: number): Promise<number> {
  const { data, error } = await supabase.rpc("prune_not_found_logs", { p_days: days })
  if (error) throw error
  return Number(data ?? 0)
}

/* ── IndexNow ─────────────────────────────────────────────────────────── */

/** `urls` vuoto = tutte le rotte pubbliche indicizzabili. */
export async function pingIndexNow(urls?: string[]): Promise<IndexNowResult> {
  const res = await fetch("/api/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ urls: urls ?? [] }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, error: (body as any)?.error || `Risposta ${res.status}` }
  return body as IndexNowResult
}
