import { A4, COL_W, MG, downloadPdf, safe, wrap } from "../../../../lib/pdf/core"
import type { Dati, Ubo } from "./schema"
import { DOCUMENTI, type DocId, type DocState, LISTE, type ControlloLista, livelloRischio } from "./store"

/* ══════════════════════════════════════════════════════════════════════════
   RICEVUTA DI VERIFICA — il foglio che il visitatore porta via.

   È l'ultimo pezzo che rende la demo un prodotto invece di una schermata:
   la pratica finisce con un documento vero, generato nel browser con
   pdf-lib (già nel progetto per la roadmap e gli avvisi di pagamento) e
   importato dinamicamente, così i 400 kB della libreria non toccano chi la
   demo non la apre.

   Il testo dichiara in ogni pagina che si tratta di una dimostrazione:
   una ricevuta di compliance che non lo dicesse sarebbe un documento
   ingannevole, e la riga non si toglie.
══════════════════════════════════════════════════════════════════════════ */

export interface DatiRicevuta {
  protocollo: string
  dati: Dati
  ubi: Ubo[]
  docs: Record<DocId, DocState>
  liste: ControlloLista[]
  punteggio: number
}

const dataOra = (t: number) =>
  new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short" }).format(new Date(t))

export async function buildRicevutaPdf(r: DatiRicevuta): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib")

  const doc = await PDFDocument.create()
  const sans = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const mono = await doc.embedFont(StandardFonts.Courier)

  const INK = rgb(0.08, 0.09, 0.13)
  const BODY = rgb(0.28, 0.30, 0.36)
  const MUTED = rgb(0.52, 0.55, 0.62)
  const IRIS = rgb(0.42, 0.36, 0.95)
  const RULE = rgb(0.87, 0.88, 0.92)

  const page = doc.addPage([A4.w, A4.h])
  let y = A4.h - MG.top

  const line = (yy: number) => page.drawLine({
    start: { x: MG.x, y: yy }, end: { x: A4.w - MG.x, y: yy }, thickness: 0.6, color: RULE,
  })
  const txt = (s: string, opts: { x?: number; size?: number; font?: typeof sans; color?: typeof INK }) =>
    page.drawText(safe(s), {
      x: opts.x ?? MG.x, y, size: opts.size ?? 10,
      font: opts.font ?? sans, color: opts.color ?? BODY,
    })
  /** Coppia etichetta/valore su una riga, valore allineato a destra. */
  const kv = (k: string, v: string) => {
    txt(k, { size: 9.5, color: MUTED })
    const w = sans.widthOfTextAtSize(safe(v), 10)
    page.drawText(safe(v), { x: A4.w - MG.x - w, y, size: 10, font: sans, color: INK })
    y -= 17
  }
  const titoloSezione = (s: string) => {
    y -= 10
    page.drawText(safe(s.toUpperCase()), { x: MG.x, y, size: 8.5, font: bold, color: IRIS })
    y -= 8
    line(y)
    y -= 15
  }

  /* ── intestazione ── */
  page.drawRectangle({ x: MG.x, y: y - 4, width: 26, height: 26, color: IRIS })
  page.drawText("N", { x: MG.x + 8.5, y: y + 3, size: 14, font: bold, color: rgb(1, 1, 1) })
  page.drawText("Nimbus Compliance", { x: MG.x + 34, y: y + 9, size: 13, font: bold, color: INK })
  page.drawText("Ricevuta di verifica KYC", { x: MG.x + 34, y: y - 2, size: 9.5, font: sans, color: MUTED })
  y -= 40

  const proto = `PROTOCOLLO ${r.protocollo}`
  const wp = mono.widthOfTextAtSize(proto, 9)
  page.drawText(proto, { x: A4.w - MG.x - wp, y: y + 34, size: 9, font: mono, color: IRIS })

  line(y); y -= 22

  /* ── impresa ── */
  titoloSezione("Impresa richiedente")
  kv("Ragione sociale", r.dati.ragioneSociale)
  kv("Partita IVA", `${r.dati.piva}  (checksum verificato)`)
  kv("Paese", r.dati.paese)
  kv("Settore", r.dati.settore)
  kv("Email", r.dati.email)
  if (r.dati.pec) kv("PEC", r.dati.pec)

  /* ── titolari effettivi ── */
  titoloSezione(`Titolari effettivi (${r.ubi.length})`)
  for (const u of r.ubi) {
    const etichetta = u.pep ? `${u.nome} · PEP dichiarato` : u.nome
    kv(etichetta, `${u.quota}%`)
  }

  /* ── documenti ── */
  titoloSezione("Documenti acquisiti")
  for (const d of DOCUMENTI) {
    const s = r.docs[d.id]
    kv(d.titolo, s.hash ? `${s.nome}  ·  ${s.hash}` : (s.nome ?? "—"))
  }

  /* ── screening ── */
  titoloSezione("Screening")
  for (const l of LISTE) {
    const c = r.liste.find(x => x.id === l.id)
    kv(l.titolo, c?.riscontri ? `${c.riscontri} riscontro/i — da valutare` : "nessun riscontro")
  }

  /* ── rischio ── */
  titoloSezione("Valutazione del rischio")
  const livello = livelloRischio(r.punteggio)
  page.drawText(safe(`${r.punteggio}/100`), { x: MG.x, y: y - 4, size: 22, font: bold, color: INK })
  page.drawText(safe(`rischio ${livello}`), { x: MG.x + 74, y: y + 2, size: 11, font: bold, color: IRIS })
  page.drawText(safe(`Calcolato il ${dataOra(Date.now())}`), { x: MG.x + 74, y: y - 11, size: 8.5, font: sans, color: MUTED })
  y -= 34

  /* ── avvertenza, sempre ── */
  y = MG.bottom + 30
  line(y + 16)
  const avviso = "Documento dimostrativo generato da un ambiente di prova: i dati sono fittizi, " +
    "nessuna verifica di adeguata verifica della clientela è stata realmente eseguita e questa " +
    "ricevuta non ha alcun valore legale o probatorio."
  for (const l of wrap(avviso, sans, 7.5, COL_W)) {
    page.drawText(safe(l), { x: MG.x, y, size: 7.5, font: sans, color: MUTED })
    y -= 9.5
  }

  return doc.save()
}

export async function scaricaRicevuta(r: DatiRicevuta): Promise<void> {
  const bytes = await buildRicevutaPdf(r)
  downloadPdf(bytes, `ricevuta-${r.protocollo.toLowerCase()}.pdf`)
}
