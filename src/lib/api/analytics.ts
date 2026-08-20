import { supabase } from "./core"
import type { PageSpeedRun, VisitorStats } from "./types"

/* ══════════════════════════════════════════════════════════════════════════
   ANALYTICS INTERNE E PAGESPEED.

   Le analytics interne esistono perché GA4 risponde con un giorno di ritardo
   e viene bloccato da una buona metà dei visitatori. Queste no: sono una
   riga per pagina vista, senza cookie e senza IP in chiaro, e servono a una
   domanda sola — «cosa è successo sul sito nelle ultime ore».

   L'aggregazione la fa il database (`visitor_stats_guarded`): scaricare le
   righe per contarle nel browser funziona finché le righe sono poche, cioè
   finché le statistiche non servono.
══════════════════════════════════════════════════════════════════════════ */

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function fetchVisitorStats(hours: number): Promise<VisitorStats> {
  const { data, error } = await supabase.rpc("visitor_stats_guarded", { p_hours: hours })
  if (error) throw error
  const d = (data ?? {}) as any
  return {
    pageviews: Number(d.pageviews ?? 0),
    uniques: Number(d.uniques ?? 0),
    topPages: (d.top_pages ?? []).map((x: any) => ({ path: x.path, views: Number(x.views), uniques: Number(x.uniques) })),
    devices: (d.devices ?? []).map((x: any) => ({ device: x.device, views: Number(x.views) })),
    referrers: (d.referrers ?? []).map((x: any) => ({ source: x.source, views: Number(x.views) })),
    byHour: (d.by_hour ?? []).map((x: any) => ({ bucket: x.bucket, views: Number(x.views) })),
  }
}

/* ── La voronka, per settimana ─────────────────────────────────────────────
   L'aggregazione la fa la RPC `funnel_stats` (migrazione 22): il pannello
   riceve numeri già allineati e non scarica mai gli eventi grezzi. Ogni
   colonna è un passo: chi entra, chi tocca una demo, chi avanza nel
   configuratore, chi porta via il blueprint, chi lascia una richiesta —
   e delle richieste, quante avanzano e quante si chiudono. */

export type FunnelWeek = {
  week: string
  sessions: number
  demo: number
  config: number
  blueprint: number
  leads: number
  advanced: number
  won: number
}

export async function fetchFunnelStats(weeks = 4): Promise<FunnelWeek[]> {
  const { data, error } = await supabase.rpc("funnel_stats", { p_weeks: weeks })
  if (error) throw error
  return Array.isArray(data) ? (data as FunnelWeek[]) : []
}

/** Sfoltisce lo storico degli eventi voronka. Ritorna quante righe sono sparite. */
export async function pruneFunnelEvents(days: number): Promise<number> {
  const { data, error } = await supabase.rpc("prune_funnel_events", { p_days: days })
  if (error) throw error
  return Number(data ?? 0)
}

/** Sfoltisce lo storico. Ritorna quante righe sono sparite. */
export async function pruneVisitorLogs(days: number): Promise<number> {
  const { data, error } = await supabase.rpc("prune_visitor_logs", { p_days: days })
  if (error) throw error
  return Number(data ?? 0)
}

/* ── PageSpeed Insights ────────────────────────────────────────────────────
   Passa da /api/pagespeed e non dal browser: così la chiave API resta su
   Vercel invece di finire nella barra degli strumenti di rete di chiunque
   apra il pannello. Senza chiave l'API funziona lo stesso, solo con una
   quota più bassa — quindi la funzione non è mai «spenta».               */

const VITAL_LABELS: Record<string, string> = {
  "largest-contentful-paint": "LCP · caricamento",
  "cumulative-layout-shift": "CLS · stabilità",
  "total-blocking-time": "TBT · reattività",
  "first-contentful-paint": "FCP · primo contenuto",
  "speed-index": "Speed Index",
  "interaction-to-next-paint": "INP · interazione",
}

export async function runPageSpeed(url: string, strategy: "mobile" | "desktop"): Promise<PageSpeedRun> {
  const res = await fetch(`/api/pagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((body as any)?.error || `PageSpeed ha risposto ${res.status}`)

  const cats = (body as any)?.lighthouseResult?.categories ?? {}
  const audits = (body as any)?.lighthouseResult?.audits ?? {}
  const pct = (c: any) => (typeof c?.score === "number" ? Math.round(c.score * 100) : null)

  return {
    strategy,
    performance: pct(cats.performance),
    accessibility: pct(cats.accessibility),
    bestPractices: pct(cats["best-practices"]),
    seo: pct(cats.seo),
    vitals: Object.keys(VITAL_LABELS)
      .filter(k => audits[k])
      .map(k => ({
        key: k,
        label: VITAL_LABELS[k],
        display: audits[k].displayValue ?? "—",
        score: typeof audits[k].score === "number" ? Math.round(audits[k].score * 100) : null,
      })),
    fetchedAt: new Date().toISOString(),
  }
}

/** Le soglie di Lighthouse, non inventate: 90+ verde, 50-89 giallo, sotto rosso. */
export function scoreTone(score: number | null): "green" | "amber" | "red" | "steel" {
  if (score === null) return "steel"
  if (score >= 90) return "green"
  if (score >= 50) return "amber"
  return "red"
}
