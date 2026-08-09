import { Queue, QueueEvents, Worker, type Job } from "bullmq"
import { runSync, SyncBusyError, type Db, type SyncTrigger } from "./sync"
import type { SupplierRow } from "./adapters/types"

/* ══════════════════════════════════════════════════════════════════════════
   CODE

   Il VPS gira 24 ore su 24 e non deve dipendere da nessun cron di sistema:
   la pianificazione vive in Redis, insieme al resto della coda, e si ricostruisce
   dalla tabella `suppliers` a ogni avvio.

   Due sorgenti di lavoro:

     · ripetuta   — un job per fornitore, con il cron scritto in `sync_cron`
     · manuale    — «Sincronizza ora» dal pannello, priorità alta

   Entrambe finiscono nella stessa funzione. La corsa manuale non salta la
   coda del fornitore: prende priorità, ma il lock consultivo garantisce che
   non giri insieme a quella pianificata.
══════════════════════════════════════════════════════════════════════════ */

export const QUEUE = "supplier-sync"

export type SyncJob = { supplierId: string; trigger: SyncTrigger }

export function makeQueue(connection: { host: string; port: number; password?: string }) {
  return new Queue<SyncJob>(QUEUE, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 30_000 },
      /* Le corse riuscite si tengono per un giorno: la storia sta in
         `sync_runs`, che è interrogabile. Redis non è un archivio. */
      removeOnComplete: { age: 86_400, count: 200 },
      removeOnFail: { age: 7 * 86_400 },
    },
  })
}

/** Allinea i job ripetuti alla tabella: aggiunge i nuovi, cambia i cron
    modificati, toglie quelli dei fornitori sospesi. Si chiama all'avvio e
    dopo ogni salvataggio dal pannello. */
export async function reconcileSchedules(queue: Queue<SyncJob>, suppliers: {
  id: string; code: string; sync_cron: string; state: string
}[]): Promise<{ added: number; updated: number; removed: number }> {
  const wanted = new Map(suppliers.filter(s => s.state === "attivo").map(s => [`cron:${s.id}`, s]))
  const existing = await queue.getJobSchedulers()
  let added = 0, updated = 0, removed = 0

  for (const sched of existing) {
    const want = wanted.get(sched.key ?? "")
    if (!want) { await queue.removeJobScheduler(sched.key!); removed++; continue }
    if (sched.pattern !== want.sync_cron) {
      await queue.upsertJobScheduler(sched.key!, { pattern: want.sync_cron },
        { name: "sync", data: { supplierId: want.id, trigger: "cron" } })
      updated++
    }
    wanted.delete(sched.key!)
  }

  for (const [key, s] of wanted) {
    await queue.upsertJobScheduler(key, { pattern: s.sync_cron },
      { name: "sync", data: { supplierId: s.id, trigger: "cron" } })
    added++
  }
  return { added, updated, removed }
}

/** «Sincronizza ora». Il `jobId` deduplicato evita che tre clic sul pulsante
    accodino tre corse: la seconda e la terza trovano il posto occupato. */
export async function forceSync(queue: Queue<SyncJob>, supplierId: string): Promise<Job<SyncJob>> {
  const existing = await queue.getJob(`manual:${supplierId}`)
  if (existing && !(await existing.isCompleted()) && !(await existing.isFailed())) return existing
  if (existing) await existing.remove()

  return queue.add("sync", { supplierId, trigger: "manuale" }, {
    jobId: `manual:${supplierId}`,
    priority: 1,
    attempts: 1,           // a mano non si ritenta: l'operatore guarda l'esito
  })
}

export function makeWorker(
  connection: { host: string; port: number; password?: string },
  db: Db,
  loadSupplier: (id: string) => Promise<SupplierRow>,
  secretKey: string,
) {
  const worker = new Worker<SyncJob>(QUEUE, async job => {
    const supplier = await loadSupplier(job.data.supplierId)
    await job.updateProgress({ phase: "connessione", supplier: supplier.code })
    try {
      const summary = await runSync(db, supplier, job.data.trigger, {
        jobId: job.id, secretKey,
      })
      if (summary.status === "errore") throw new Error(`Corsa in errore: ${summary.errors} righe`)
      return summary
    } catch (e) {
      /* Un fornitore già in corsa non è un guasto: si riprova dopo, senza
         consumare un tentativo e senza colorare di rosso il cruscotto. */
      if (e instanceof SyncBusyError) {
        await job.moveToDelayed(Date.now() + 120_000, job.token)
        return { skipped: true as const }
      }
      throw e
    }
  }, {
    connection,
    /* Quattro fornitori in parallelo: oltre, un VPS piccolo passa il tempo a
       fare context switch invece che I/O. Il limite di frequenza per singolo
       fornitore è dentro `makeHttp`, qui si limita il parallelismo globale. */
    concurrency: 4,
    limiter: { max: 8, duration: 1000 },
    stalledInterval: 60_000,
    maxStalledCount: 2,
  })

  worker.on("failed", (job, err) => {
    console.error(`[sync] ${job?.data.supplierId} fallita al tentativo ${job?.attemptsMade}: ${err.message}`)
  })

  return worker
}

/** Gli eventi della coda spingono lo stato al pannello. Il browser resta su
    una SSE: nessun polling ogni due secondi su una tabella che cambia una
    volta all'ora. */
export function makeEvents(connection: { host: string; port: number; password?: string },
  publish: (e: { supplierId: string; phase: string; data?: unknown }) => void) {

  const events = new QueueEvents(QUEUE, { connection })
  events.on("active",   ({ jobId }) => publish({ supplierId: jobId, phase: "in_corso" }))
  events.on("progress", ({ jobId, data }) => publish({ supplierId: jobId, phase: "avanzamento", data }))
  events.on("completed",({ jobId, returnvalue }) => publish({ supplierId: jobId, phase: "ok", data: returnvalue }))
  events.on("failed",   ({ jobId, failedReason }) => publish({ supplierId: jobId, phase: "errore", data: failedReason }))
  return events
}
