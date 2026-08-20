import type { Deal } from "./types"
import {
  STAGE_BY_ID, TODAY, byRep, dateLabel, eur, funnel, headline, monthlySeries,
  num, openDeals, pct, repById,
} from "./data"
import { A4, COL_W, MG, downloadPdf, safe, wrap } from "../../../../lib/pdf/core"

/* ══════════════════════════════════════════════════════════════════════════
   RAPPORTO PDF

   Documento vero, non un'immagine della schermata: il testo resta
   selezionabile e cercabile, e chi lo riceve può incollarne un numero in una
   mail senza ribatterlo.

   pdf-lib entra con un import dinamico — chi non scarica il rapporto non se
   la porta a casa. È la stessa scelta fatta per il portale fornitori, e per
   lo stesso motivo: il grosso della libreria serve a una minoranza di visite.

   Ogni foglio porta la dicitura di documento dimostrativo: un rapporto
   vendite senza contesto, ritrovato fuori da qui, sembrerebbe vero.
══════════════════════════════════════════════════════════════════════════ */

const INK = [0.06, 0.075, 0.095] as const
const MUTED = [0.41, 0.44, 0.48] as const
const RULE = [0.89, 0.91, 0.93] as const
const LIME = [0.66, 0.83, 0.23] as const

export async function downloadSalesReport(deals: Deal[]): Promise<void> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib")
  const doc = await PDFDocument.create()
  const sans = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique)

  let page = doc.addPage([A4.w, A4.h])
  let y = A4.h - MG.top

  /* Ogni scrittura passa da qui: quando lo spazio finisce si apre un foglio
     nuovo da sola. Senza, l'ultima sezione finiva sotto il margine e spariva
     senza che niente segnalasse l'errore. */
  const room = (needed: number) => {
    if (y - needed >= MG.bottom) return
    footer(page)
    page = doc.addPage([A4.w, A4.h])
    y = A4.h - MG.top
  }

  const footer = (p: typeof page) => {
    p.drawText("QUADRANTE CRM · DATI DIMOSTRATIVI · Documento generato da una demo, privo di validità.", {
      x: MG.x, y: MG.bottom - 26, size: 7.5, font: italic, color: rgb(...MUTED),
    })
  }

  const line = () => {
    room(14)
    page.drawLine({
      start: { x: MG.x, y }, end: { x: A4.w - MG.x, y },
      thickness: 1, color: rgb(...RULE),
    })
    y -= 18
  }

  const h2 = (t: string) => {
    room(34)
    page.drawText(safe(t), { x: MG.x, y, size: 13, font: bold, color: rgb(...INK) })
    y -= 20
  }

  const kv = (k: string, v: string, strong = false) => {
    room(18)
    page.drawText(safe(k), { x: MG.x, y, size: 9.5, font: sans, color: rgb(...MUTED) })
    page.drawText(safe(v), {
      x: MG.x + 200, y, size: strong ? 11 : 10,
      font: bold, color: rgb(...INK),
    })
    y -= 18
  }

  /* ── testata ─────────────────────────────────────────────────────────── */
  page.drawRectangle({ x: MG.x, y: y + 4, width: 34, height: 10, color: rgb(...LIME) })
  y -= 14
  page.drawText("QUADRANTE CRM", { x: MG.x, y, size: 9, font: bold, color: rgb(...MUTED) })
  y -= 26
  page.drawText("Rapporto vendite", { x: MG.x, y, size: 19, font: bold, color: rgb(...INK) })
  y -= 16
  page.drawText(safe(`Situazione al ${dateLabel(TODAY)} · ${deals.length} trattative nel perimetro`), {
    x: MG.x, y, size: 9.5, font: sans, color: rgb(...MUTED),
  })
  y -= 16
  line()

  /* ── sintesi ─────────────────────────────────────────────────────────── */
  const h = headline(deals)
  h2("Sintesi")
  kv("Pipeline aperta", `${eur(h.openValue)}  (${h.openCount} trattative)`, true)
  kv("Previsione ponderata", eur(Math.round(h.forecast)), true)
  kv("Firmato", eur(h.wonValue))
  kv("Ticket medio sulle vinte", eur(h.avgTicket))
  kv("Tasso di successo", pct(h.winRate, 1))
  kv("In ritardo sulla chiusura attesa", `${h.lateCount} trattative`)
  kv("Ferme da oltre 14 giorni", `${h.staleCount} trattative`)
  y -= 6
  line()

  /* ── imbuto ──────────────────────────────────────────────────────────── */
  h2("Imbuto di conversione")
  const rows = funnel(deals)
  const cols = [MG.x, MG.x + 190, MG.x + 250, MG.x + 340, MG.x + 430]
  room(20)
  ;["Stato", "Numero", "Valore", "Sul totale", "Dal prec."].forEach((t, i) => {
    page.drawText(t, { x: cols[i], y, size: 8.5, font: bold, color: rgb(...MUTED) })
  })
  y -= 8
  line()
  for (const r of rows) {
    room(18)
    const cells = [
      r.stage.title, num(r.count), eur(r.value),
      pct(r.reachedPct, 0), r.stage.order === 0 ? "—" : pct(r.stepPct, 0),
    ]
    cells.forEach((v, i) => page.drawText(safe(v), {
      x: cols[i], y, size: 9.5, font: i === 0 ? bold : sans, color: rgb(...INK),
    }))
    y -= 18
  }
  y -= 6
  line()

  /* ── andamento ───────────────────────────────────────────────────────── */
  h2("Andamento mensile")
  const months = monthlySeries(deals)
  room(20)
  ;["Mese", "Firmato", "Perso", "Trattative vinte"].forEach((t, i) => {
    page.drawText(t, { x: cols[i], y, size: 8.5, font: bold, color: rgb(...MUTED) })
  })
  y -= 8
  line()
  for (const m of months) {
    room(17)
    const cells = [`${m.label} ${m.key.slice(0, 4)}`, eur(m.won), eur(m.lost), num(m.count)]
    cells.forEach((v, i) => page.drawText(safe(v), {
      x: cols[i], y, size: 9.5, font: i === 0 ? bold : sans, color: rgb(...INK),
    }))
    y -= 17
  }
  y -= 6
  line()

  /* ── commerciali ─────────────────────────────────────────────────────── */
  h2("Per commerciale")
  room(20)
  ;["Commerciale", "Firmato", "Aperto", "Successo"].forEach((t, i) => {
    page.drawText(t, { x: cols[i], y, size: 8.5, font: bold, color: rgb(...MUTED) })
  })
  y -= 8
  line()
  for (const r of byRep(deals)) {
    room(17)
    const cells = [r.rep.name, eur(r.won), eur(r.open), `${num(r.winRate)} %`]
    cells.forEach((v, i) => page.drawText(safe(v), {
      x: cols[i], y, size: 9.5, font: i === 0 ? bold : sans, color: rgb(...INK),
    }))
    y -= 17
  }
  y -= 6
  line()

  /* ── trattative aperte, dalla più grossa ─────────────────────────────── */
  h2("Trattative aperte")
  const open = [...openDeals(deals)].sort((a, b) => b.value - a.value)
  for (const d of open) {
    room(34)
    page.drawText(safe(`${d.id}  ${d.title}`), { x: MG.x, y, size: 10, font: bold, color: rgb(...INK) })
    page.drawText(safe(eur(d.value)), {
      x: A4.w - MG.x - sans.widthOfTextAtSize(safe(eur(d.value)), 10),
      y, size: 10, font: bold, color: rgb(...INK),
    })
    y -= 13
    const meta = `${d.company} · ${STAGE_BY_ID[d.stage].title} · ${repById(d.assignedTo).name} · chiusura attesa ${dateLabel(d.expectedClose)}`
    page.drawText(safe(meta), { x: MG.x, y, size: 8.5, font: sans, color: rgb(...MUTED) })
    y -= 16
  }

  /* ── perse, con il motivo: è la parte che si rilegge ─────────────────── */
  const lost = deals.filter(d => d.stage === "perso" && d.lostReason)
  if (lost.length) {
    y -= 6
    line()
    h2("Trattative perse e motivo")
    for (const d of lost) {
      room(40)
      page.drawText(safe(`${d.id}  ${d.company} · ${eur(d.value)}`), {
        x: MG.x, y, size: 10, font: bold, color: rgb(...INK),
      })
      y -= 14
      for (const l of wrap(d.lostReason!, sans, 9.5, COL_W)) {
        room(13)
        page.drawText(l, { x: MG.x, y, size: 9.5, font: sans, color: rgb(...MUTED) })
        y -= 13
      }
      y -= 6
    }
  }

  footer(page)
  downloadPdf(await doc.save(), `rapporto-vendite-${TODAY}.pdf`)
}
