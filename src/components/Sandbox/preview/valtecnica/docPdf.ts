import { DOC_KIND_LABEL, customerById, eur, invoiceTotals, type Doc, type Invoice } from "./data"
import { A4, COL_W, MG, downloadPdf, safe, slug, wrap } from "../../../../lib/pdf/core"

/* ══════════════════════════════════════════════════════════════════════════
   PDF DEL CENTRO DOCUMENTI E ESTRATTO CONTO
   Documenti veri, non immagini: il testo resta selezionabile e cercabile.
   pdf-lib entra con un import dinamico, quindi chi non scarica nulla non la
   scarica mai. Ogni foglio porta la dicitura di documento dimostrativo.
══════════════════════════════════════════════════════════════════════════ */

const INK = [0.10, 0.086, 0.078] as const
const MUTED = [0.39, 0.357, 0.337] as const
const RULE = [0.93, 0.914, 0.898] as const

async function newDoc() {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib")
  const doc = await PDFDocument.create()
  const sans = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique)
  return { doc, sans, bold, italic, rgb }
}

/** Intestazione comune: chi emette, cosa, e che è una dimostrazione. */
function header(page: any, fonts: any, rgb: any, title: string, sub: string) {
  const { sans, bold } = fonts
  let y = A4.h - MG.top
  page.drawText("VALTECNICA S.r.l.", { x: MG.x, y, size: 9, font: bold, color: rgb(...MUTED) })
  y -= 12
  page.drawText("Via dell'Artigianato 14 · 36100 Vicenza · P.IVA 03871420248", {
    x: MG.x, y, size: 8, font: sans, color: rgb(...MUTED),
  })
  y -= 26
  page.drawText(safe(title), { x: MG.x, y, size: 17, font: bold, color: rgb(...INK) })
  y -= 16
  page.drawText(safe(sub), { x: MG.x, y, size: 9.5, font: sans, color: rgb(...MUTED) })
  y -= 14
  page.drawLine({ start: { x: MG.x, y }, end: { x: A4.w - MG.x, y }, thickness: 1, color: rgb(...RULE) })
  return y - 24
}

function footer(page: any, fonts: any, rgb: any) {
  page.drawText("FAC-SIMILE · DATI DIMOSTRATIVI · Documento generato da una demo, privo di validità.", {
    x: MG.x, y: MG.bottom - 26, size: 7.5, font: fonts.italic, color: rgb(...MUTED),
  })
}

/* ── Documento del centro documenti ─────────────────────────────────────── */
export async function downloadDocPdf(d: Doc): Promise<void> {
  const { doc, sans, bold, italic, rgb } = await newDoc()
  const fonts = { sans, bold, italic }
  const page = doc.addPage([A4.w, A4.h])

  let y = header(page, fonts, rgb, d.title, `${DOC_KIND_LABEL[d.kind]} · ${d.id} · ${d.date}`)

  const rows: [string, string][] = [
    ["Tipo documento", DOC_KIND_LABEL[d.kind]],
    ["Riferimento", d.sku ?? d.ordine ?? "—"],
    ["Intestatario", d.customerId ? customerById(d.customerId).name : "Documento di prodotto"],
    ["Data di emissione", d.date],
    ["Pagine dell'originale", String(d.pages)],
  ]
  for (const [k, v] of rows) {
    page.drawText(safe(k), { x: MG.x, y, size: 9, font: sans, color: rgb(...MUTED) })
    page.drawText(safe(v), { x: MG.x + 170, y, size: 10, font: bold, color: rgb(...INK) })
    y -= 22
  }

  y -= 10
  page.drawLine({ start: { x: MG.x, y }, end: { x: A4.w - MG.x, y }, thickness: 1, color: rgb(...RULE) })
  y -= 24

  const body = `Questo foglio sostituisce il documento originale all'interno della demo del portale fornitori. Nel sistema reale a questo punto verrebbe servito il file archiviato, con la sua firma e la sua marca temporale, insieme allo storico delle revisioni. La struttura dei metadati qui sopra è quella effettivamente usata per indicizzare i documenti: tipo, riferimento all'articolo o all'ordine, intestatario e data.`
  for (const line of wrap(body, sans, 10, COL_W)) {
    page.drawText(line, { x: MG.x, y, size: 10, font: sans, color: rgb(...INK) })
    y -= 15
  }

  footer(page, fonts, rgb)
  downloadPdf(await doc.save(), `${slug(d.title)}-${d.id}.pdf`)
}

/* ── Estratto conto: la partita aperta di un cliente ────────────────────── */
export async function downloadStatement(customerId: string, invoices: Invoice[]): Promise<void> {
  const { doc, sans, bold, italic, rgb } = await newDoc()
  const fonts = { sans, bold, italic }
  const page = doc.addPage([A4.w, A4.h])
  const c = customerById(customerId)
  const mine = invoices.filter(i => i.customerId === customerId)

  let y = header(page, fonts, rgb, "Estratto conto", `${c.name} · ${c.city} · aggiornato al 09/08/2026`)

  const cols = [MG.x, MG.x + 130, MG.x + 215, MG.x + 300, MG.x + 400]
  const head = ["Documento", "Emessa", "Scadenza", "Stato", "Importo"]
  head.forEach((h, i) => page.drawText(h, { x: cols[i], y, size: 8.5, font: bold, color: rgb(...MUTED) }))
  y -= 8
  page.drawLine({ start: { x: MG.x, y }, end: { x: A4.w - MG.x, y }, thickness: 1, color: rgb(...RULE) })
  y -= 16

  let aperto = 0
  for (const i of mine) {
    const t = invoiceTotals(i).totale
    if (i.state !== "pagata") aperto += t
    const cells = [i.id, i.emessa, i.scadenza,
      i.state === "pagata" ? "Pagata" : i.state === "scaduta" ? "Scaduta" : "Da pagare", eur(t)]
    cells.forEach((v, k) => page.drawText(safe(v), {
      x: cols[k], y, size: 9, font: k === 4 ? bold : sans,
      color: i.state === "scaduta" && k === 3 ? rgb(0.69, 0.20, 0.13) : rgb(...INK),
    }))
    y -= 18
  }

  y -= 8
  page.drawLine({ start: { x: MG.x, y }, end: { x: A4.w - MG.x, y }, thickness: 1, color: rgb(...RULE) })
  y -= 20
  page.drawText("Saldo aperto", { x: cols[3], y, size: 10, font: bold, color: rgb(...INK) })
  page.drawText(eur(aperto), { x: cols[4], y, size: 12, font: bold, color: rgb(...INK) })

  y -= 34
  page.drawText(safe(`Condizioni di pagamento: ${c.termini}`), { x: MG.x, y, size: 9, font: sans, color: rgb(...MUTED) })
  y -= 14
  page.drawText(safe(`Fido concesso ${eur(c.fido, 0)} · esposizione ${eur(c.esposizione, 0)}`), {
    x: MG.x, y, size: 9, font: sans, color: rgb(...MUTED),
  })

  footer(page, fonts, rgb)
  downloadPdf(await doc.save(), `estratto-conto-${slug(c.name)}.pdf`)
}
