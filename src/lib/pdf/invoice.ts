/* ══════════════════════════════════════════════════════════════════════════
   AVVISO DI PAGAMENTO (proforma)

   Perché non è "la fattura": in Italia dal 2019 la fattura verso residenti
   esiste solo come fattura elettronica XML trasmessa dal Sistema di
   Interscambio. Un PDF generato da un sito non è quel documento, e
   chiamarlo così sarebbe scorretto verso il cliente.

   Questo è la richiesta di pagamento — legittima, diffusa e utile: il
   cliente vede subito importo, scadenza e IBAN senza aspettare il
   commercialista. La fattura vera, quando esce, si allega alla stessa riga
   (attachInvoicePdf).
══════════════════════════════════════════════════════════════════════════ */

import type { Invoice } from "../api/types"
import {
  BOLLO_IMPORTO, BOLLO_SOGLIA, DICITURA_FORFETTARIO, DISCLAIMER_PROFORMA, STUDIO,
} from "../studio"
import { A4, COL_W, MG, downloadPdf, safe, slug, wrap } from "./core"

export interface InvoiceParty {
  /** ragione sociale o nome del cliente */
  name: string
  email?: string
  piva?: string
  address?: string
}

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " EUR"

const dateIt = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso)) : "—"

/** Imponibile, imposta e totale secondo il regime dichiarato in studio.ts. */
export function invoiceTotals(amount: number) {
  const forfettario = STUDIO.regime === "forfettario"
  const imponibile = amount
  const iva = forfettario ? 0 : imponibile * (STUDIO.aliquotaIva / 100)
  /* la marca da bollo riguarda solo il forfettario, e solo sopra soglia */
  const bollo = forfettario && imponibile > BOLLO_SOGLIA ? BOLLO_IMPORTO : 0
  return { forfettario, imponibile, iva, bollo, totale: imponibile + iva + bollo }
}

export async function buildInvoicePdf(invoice: Invoice, client: InvoiceParty): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib")

  const doc = await PDFDocument.create()
  const sans = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const mono = await doc.embedFont(StandardFonts.Courier)

  const INK = rgb(0.078, 0.094, 0.122)
  const BODY = rgb(0.235, 0.271, 0.322)
  const MUTED = rgb(0.404, 0.447, 0.502)
  const RULE = rgb(0.847, 0.867, 0.894)

  const page = doc.addPage([A4.w, A4.h])
  let y = A4.h - MG.top

  const text = (s: string, x: number, size: number, font: typeof sans, color = INK) =>
    page.drawText(safe(s), { x, y, size, font, color })

  const line = (yy: number) =>
    page.drawLine({ start: { x: MG.x, y: yy }, end: { x: A4.w - MG.x, y: yy }, thickness: 0.7, color: RULE })

  const right = (s: string, size: number, font: typeof sans, color = INK) => {
    const w = font.widthOfTextAtSize(safe(s), size)
    page.drawText(safe(s), { x: A4.w - MG.x - w, y, size, font, color })
  }

  /* ── Intestazione: chi emette ── */
  text(STUDIO.ragioneSociale, MG.x, 15, bold)
  right("AVVISO DI PAGAMENTO", 11, bold, MUTED)
  y -= 16
  for (const l of [
    `${STUDIO.indirizzo} — ${STUDIO.cap} ${STUDIO.citta}${STUDIO.provincia !== "—" ? ` (${STUDIO.provincia})` : ""}`,
    `P.IVA ${STUDIO.piva}${STUDIO.codiceFiscale !== "—" && STUDIO.codiceFiscale !== STUDIO.piva ? ` — C.F. ${STUDIO.codiceFiscale}` : ""}`,
  ]) { text(l, MG.x, 9, sans, MUTED); y -= 12 }

  y -= 10
  line(y)
  y -= 22

  /* ── Numero e date ── */
  text(`Documento n. ${invoice.number}`, MG.x, 12, bold)
  right(`Emesso il ${dateIt(invoice.issuedAt)}`, 9.5, sans, MUTED)
  y -= 15
  if (invoice.dueDate) { text(`Scadenza: ${dateIt(invoice.dueDate)}`, MG.x, 9.5, sans, BODY); y -= 14 }

  y -= 10

  /* ── Destinatario ── */
  text("DESTINATARIO", MG.x, 8, bold, MUTED)
  y -= 14
  text(client.name, MG.x, 11, bold)
  y -= 13
  for (const l of [client.address, client.piva ? `P.IVA ${client.piva}` : "", client.email].filter(Boolean) as string[]) {
    text(l, MG.x, 9, sans, MUTED); y -= 12
  }

  y -= 14
  line(y)
  y -= 20

  /* ── Voce ── */
  text("DESCRIZIONE", MG.x, 8, bold, MUTED)
  right("IMPORTO", 8, bold, MUTED)
  y -= 16
  const descLines = wrap(invoice.description || "Prestazione professionale", sans, 10.5, COL_W - 120)
  const firstY = y
  for (const l of descLines) { text(l, MG.x, 10.5, sans, BODY); y -= 14 }
  const savedY = y
  y = firstY
  right(eur(invoice.amount), 10.5, sans, INK)
  y = savedY

  y -= 8
  line(y)
  y -= 20

  /* ── Totali ── */
  const t = invoiceTotals(invoice.amount)
  const row = (label: string, value: string, strong = false) => {
    text(label, A4.w - MG.x - 220, strong ? 11 : 9.5, strong ? bold : sans, strong ? INK : BODY)
    right(value, strong ? 11 : 9.5, strong ? bold : sans, strong ? INK : BODY)
    y -= strong ? 18 : 14
  }
  row("Imponibile", eur(t.imponibile))
  if (!t.forfettario) row(`IVA ${STUDIO.aliquotaIva}%`, eur(t.iva))
  if (t.bollo) row(`Marca da bollo`, eur(t.bollo))
  y -= 4
  line(y)
  y -= 18
  row("Totale da pagare", eur(t.totale), true)

  y -= 18

  /* ── Pagamento ── */
  text("PAGAMENTO", MG.x, 8, bold, MUTED)
  y -= 14
  text(`Bonifico su IBAN`, MG.x, 9.5, sans, BODY)
  y -= 13
  text(STUDIO.iban, MG.x, 11, mono, INK)
  y -= 13
  if (STUDIO.intestatarioConto !== "—") { text(`Intestato a ${STUDIO.intestatarioConto}`, MG.x, 9, sans, MUTED); y -= 12 }
  text(`Causale: ${invoice.number}`, MG.x, 9, sans, MUTED)
  y -= 22

  /* ── Note di legge ── */
  if (t.forfettario) {
    for (const l of wrap(DICITURA_FORFETTARIO, sans, 8, COL_W)) { text(l, MG.x, 8, sans, MUTED); y -= 10 }
    y -= 6
  }
  if (t.bollo) {
    text(`Imposta di bollo assolta sull'originale.`, MG.x, 8, sans, MUTED)
    y -= 14
  }

  /* ── Il disclaimer che rende onesto questo documento ── */
  y = MG.bottom + 26
  line(y + 14)
  for (const l of wrap(DISCLAIMER_PROFORMA, sans, 7.5, COL_W)) {
    page.drawText(safe(l), { x: MG.x, y, size: 7.5, font: sans, color: MUTED })
    y -= 9.5
  }

  return doc.save()
}

export async function downloadInvoicePdf(invoice: Invoice, client: InvoiceParty): Promise<void> {
  const bytes = await buildInvoicePdf(invoice, client)
  downloadPdf(bytes, `avviso-${slug(invoice.number, "pagamento")}.pdf`)
}
