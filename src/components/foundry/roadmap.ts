import type { Blueprint } from "./modules"
import { processo } from "../../data/process"
import { DEFAULT_LOCALE, LOCALE_TAG, type Locale } from "../../lib/i18n/locales"
import { CONFIGURATOR_STR } from "../../lib/i18n/strings/configurator"
import { pick } from "../../lib/i18n/t"
import { A4, COL_W, MG, downloadPdf, safe, slug, wrap as wrapText } from "../../lib/pdf/core"

/* ══════════════════════════════════════════════════════════════════════════
   ROADMAP — il documento che il visitatore porta via
   Due strade per lo stesso contenuto:
     · downloadRoadmapPdf  scarica un vero file .pdf (via pdf-lib, caricata
       solo al click). È la strada normale.
     · printRoadmap        apre la finestra di stampa su un iframe isolato.
       Resta come rete di sicurezza se il modulo PDF non si carica.
   Documento chiaro su fondo bianco: è pensato per la carta, non per lo schermo.
══════════════════════════════════════════════════════════════════════════ */

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/* Le fasi arrivano da src/data/process.ts. Prima erano ridefinite qui, con
   parole diverse, e chi leggeva About e poi apriva il PDF trovava due
   descrizioni dello stesso processo che non coincidevano. */

export function buildRoadmapHtml(bp: Blueprint, dateLabel: string, locale: Locale = DEFAULT_LOCALE): string {
  const t = pick(CONFIGURATOR_STR, locale).roadmap
  const scaffali = bp.scaffali
    .map(
      s => `
      <section class="shelf">
        <h3>${esc(s.label)}</h3>
        ${s.righe
          .map(
            r => `<div class="row"><p class="row-n">${esc(r.node)}</p><p class="row-t">${esc(r.tech)}</p></div>`,
          )
          .join("")}
      </section>`,
    )
    .join("")

  const fasi = processo(locale).map(
    f => `<div class="fase"><span class="fase-n">${f.n}</span><div><p class="fase-t">${esc(f.title)}</p><p class="fase-b">${esc(f.desc)}</p></div></div>`,
  ).join("")

  return `<!doctype html>
<html lang="${LOCALE_TAG[locale]}"><head><meta charset="utf-8"><title>${esc(t.docTitle)} — ${esc(bp.vector.label)}</title>
<style>
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: Helvetica, Arial, sans-serif; color:#14181F; background:#FFFFFF; font-size:11pt; line-height:1.55; }
  .mono { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
  header { border-bottom:2px solid #14181F; padding-bottom:14px; margin-bottom:22px; }
  .brand { font-size:8pt; letter-spacing:2.4px; text-transform:uppercase; color:#5A6572; margin:0 0 12px; }
  h1 { font-size:20pt; line-height:1.15; letter-spacing:-0.4px; margin:0 0 6px; }
  .stack { font-size:8.5pt; letter-spacing:1.6px; text-transform:uppercase; color:#5A6572; margin:0; }
  .meta { display:flex; gap:28px; margin:18px 0 26px; padding:14px 0; border-bottom:1px solid #D8DDE4; }
  .meta div { flex:1; }
  .meta-k { font-size:7.5pt; letter-spacing:1.8px; text-transform:uppercase; color:#5A6572; margin:0 0 4px; }
  .meta-v { font-size:12pt; font-weight:700; margin:0; }
  h2 { font-size:8.5pt; letter-spacing:2px; text-transform:uppercase; color:#5A6572; margin:26px 0 10px; font-weight:700; }
  p { margin:0 0 10px; }
  .shelf { break-inside: avoid; margin-bottom:16px; }
  .shelf h3 { font-size:8pt; letter-spacing:1.8px; text-transform:uppercase; color:#5A6572; margin:18px 0 8px; padding-bottom:5px; border-bottom:1px solid #D8DDE4; font-weight:700; }
  .row { break-inside: avoid; margin-bottom:11px; }
  .row-n { font-size:11pt; font-weight:700; margin:0 0 2px; }
  .row-t { font-size:9.5pt; color:#3C4552; margin:0; }
  .fase { display:flex; gap:12px; break-inside:avoid; margin-bottom:11px; }
  .fase-n { font-family:"SFMono-Regular",Consolas,monospace; font-size:9pt; color:#5A6572; padding-top:2px; }
  .fase-t { font-size:10.5pt; font-weight:700; margin:0 0 2px; }
  .fase-b { font-size:9.5pt; color:#3C4552; margin:0; }
  footer { margin-top:28px; padding-top:12px; border-top:1px solid #D8DDE4; font-size:8pt; letter-spacing:1.4px; text-transform:uppercase; color:#5A6572; }
  .note { font-size:9pt; color:#5A6572; font-style:italic; }
</style></head>
<body>
  <header>
    <p class="brand mono">${esc(t.brand)}</p>
    <h1>${esc(bp.vector.label)}</h1>
    <p class="stack mono">${esc(bp.vector.node)} · ${esc(bp.vector.stack)}</p>
  </header>

  <div class="meta">
    <div><p class="meta-k mono">${esc(t.complexity)}</p><p class="meta-v">${esc(bp.complexity.label)}</p></div>
    <div><p class="meta-k mono">${esc(t.duration)}</p><p class="meta-v">${esc(bp.complexity.weeks)}</p></div>
    <div><p class="meta-k mono">${esc(t.date)}</p><p class="meta-v">${esc(dateLabel)}</p></div>
  </div>

  <h2 class="mono">${esc(t.goal)}</h2>
  <p>${esc(bp.obiettivo)}</p>

  <h2 class="mono">${esc(t.architecture)}</h2>
  <p>${esc(bp.architettura)}</p>
  <p>${esc(bp.vector.tech)}</p>

  <h2 class="mono">${esc(t.components)}</h2>
  ${scaffali}

  <h2 class="mono">${esc(t.phases)}</h2>
  ${fasi}

  <h2 class="mono">${esc(t.noteTitle)}</h2>
  <p class="note">${esc(t.note)}</p>

  <footer class="mono">${esc(t.footer)}</footer>
</body></html>`
}

/** Apre la finestra di stampa del browser su un documento roadmap isolato. */
export function printRoadmap(bp: Blueprint, dateLabel: string, locale: Locale = DEFAULT_LOCALE): void {
  const prev = document.getElementById("fc-roadmap-frame")
  if (prev) prev.remove()

  const frame = document.createElement("iframe")
  frame.id = "fc-roadmap-frame"
  frame.setAttribute("aria-hidden", "true")
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;"
  document.body.appendChild(frame)

  const doc = frame.contentDocument
  if (!doc) { frame.remove(); return }
  doc.open()
  doc.write(buildRoadmapHtml(bp, dateLabel, locale))
  doc.close()

  const go = () => {
    try {
      frame.contentWindow?.focus()
      frame.contentWindow?.print()
    } finally {
      /* Safari blocca il thread durante print(): la rimozione differita evita
         di distruggere il documento mentre il dialogo è ancora aperto. */
      setTimeout(() => frame.remove(), 1000)
    }
  }
  if (frame.contentWindow?.document.readyState === "complete") go()
  else frame.onload = go
}

/* ══════════════════════════════════════════════════════════════════════════
   PDF SCARICABILE
   Il testo resta vettoriale: si seleziona, si cerca, si stampa senza sgranare.
   Niente cattura dello schermo, niente browser headless sul server — il file
   nasce nel browser e pesa qualche decina di kB.

   pdf-lib entra con un import dinamico: chi non tocca il pulsante non la
   scarica mai, quindi il peso della pagina non cambia.
══════════════════════════════════════════════════════════════════════════ */

/* A4, margini, safe(), slug() e wrap() vivono in src/lib/pdf/core.ts: da
   quando esiste anche l'avviso di pagamento servono a due documenti. */

/** Compone il documento e restituisce i byte. Separata dallo scaricamento
    perché non tocca il DOM: si può generare e ispezionare fuori dal browser. */
export async function buildRoadmapPdf(bp: Blueprint, dateLabel: string, locale: Locale = DEFAULT_LOCALE): Promise<Uint8Array> {
  const t = pick(CONFIGURATOR_STR, locale).roadmap
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib")

  const doc    = await PDFDocument.create()
  const sans   = await doc.embedFont(StandardFonts.Helvetica)
  const bold   = await doc.embedFont(StandardFonts.HelveticaBold)
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique)
  const mono   = await doc.embedFont(StandardFonts.Courier)

  const INK   = rgb(0.078, 0.094, 0.122)   // #14181F
  const BODY  = rgb(0.235, 0.271, 0.322)   // #3C4552
  const MUTED = rgb(0.353, 0.396, 0.447)   // #5A6572
  const RULE  = rgb(0.847, 0.867, 0.894)   // #D8DDE4

  type Font = typeof sans
  type Color = typeof INK

  let page = doc.addPage([A4.w, A4.h])
  let y = A4.h - MG.top

  /** Apre una pagina nuova se l'altezza richiesta non ci sta più. */
  function room(h: number) {
    if (y - h >= MG.bottom) return
    page = doc.addPage([A4.w, A4.h])
    y = A4.h - MG.top
  }

  const wrap = (text: string, font: Font, size: number, max: number) => wrapText(text, font, size, max)

  /* pdf-lib non espone la spaziatura fra lettere: i micro-titoli in
     monospaziato la usano, quindi si disegnano carattere per carattere. */
  function tracked(text: string, size: number, font: Font, color: Color, gap: number) {
    let x = MG.x
    for (const ch of safe(text)) {
      page.drawText(ch, { x, y, size, font, color })
      x += font.widthOfTextAtSize(ch, size) + gap
    }
  }

  function para(text: string, font: Font, size: number, color: Color, lead: number, after: number, indent = 0) {
    for (const line of wrap(text, font, size, COL_W - indent)) {
      room(lead)
      y -= lead
      page.drawText(line, { x: MG.x + indent, y, size, font, color })
    }
    y -= after
  }

  function rule(color: Color, thickness = 1) {
    page.drawLine({
      start: { x: MG.x, y }, end: { x: A4.w - MG.x, y },
      thickness, color,
    })
  }

  function h2(label: string) {
    room(40)
    y -= 26
    tracked(label.toUpperCase(), 8.5, mono, MUTED, 1.8)
    y -= 12
  }

  /* ── Intestazione ──────────────────────────────────────────────────── */
  y -= 9
  tracked(safe(t.brand).toUpperCase(), 8, mono, MUTED, 1.9)
  y -= 12
  for (const line of wrap(bp.vector.label, bold, 20, COL_W)) {
    y -= 23
    page.drawText(line, { x: MG.x, y, size: 20, font: bold, color: INK })
  }
  y -= 15
  tracked(`${bp.vector.node} · ${bp.vector.stack}`.toUpperCase(), 8.5, mono, MUTED, 1.3)
  y -= 12
  rule(INK, 1.6)

  /* ── Riga dati: complessità · durata · data ────────────────────────── */
  y -= 20
  const cells: [string, string][] = [
    [t.complexity, bp.complexity.label],
    [t.duration, bp.complexity.weeks],
    [t.date, dateLabel],
  ]
  const cellW = (COL_W - 28 * 2) / 3
  cells.forEach(([k, v], i) => {
    const x = MG.x + i * (cellW + 28)
    let cx = x
    for (const ch of safe(k.toUpperCase())) {
      page.drawText(ch, { x: cx, y, size: 7.5, font: mono, color: MUTED })
      cx += mono.widthOfTextAtSize(ch, 7.5) + 1.3
    }
    const val = wrap(v, bold, 12, cellW)[0] ?? ""
    page.drawText(val, { x, y: y - 15, size: 12, font: bold, color: INK })
  })
  y -= 15 + 13
  rule(RULE)

  /* ── Corpo ─────────────────────────────────────────────────────────── */
  h2(t.goal)
  para(bp.obiettivo, sans, 11, INK, 16, 0)

  h2(t.architecture)
  para(bp.architettura, sans, 11, INK, 16, 9)
  para(bp.vector.tech, sans, 11, INK, 16, 0)

  h2(t.components)
  for (const shelf of bp.scaffali) {
    /** Titolo del gruppo con la sua sottolineatura. */
    const shelfHead = (label: string) => {
      y -= 16
      tracked(label.toUpperCase(), 8, mono, MUTED, 1.7)
      y -= 7
      rule(RULE)
      y -= 4
    }

    /* il titolo dello scaffale non deve restare solo in fondo alla pagina */
    room(58)
    shelfHead(shelf.label)

    for (const r of shelf.righe) {
      const tech = wrap(r.tech, sans, 9.5, COL_W)
      const wasOn = page
      room(15 + tech.length * 13 + 8)
      /* se il gruppo è proseguito su una pagina nuova il titolo è rimasto
         indietro, e queste righe sembrerebbero non appartenere a nulla */
      if (page !== wasOn) shelfHead(`${shelf.label} ${t.continued}`)
      y -= 15
      page.drawText(safe(r.node), { x: MG.x, y, size: 11, font: bold, color: INK })
      for (const line of tech) {
        y -= 13
        page.drawText(line, { x: MG.x, y, size: 9.5, font: sans, color: BODY })
      }
      y -= 8
    }
  }

  h2(t.phases)
  for (const f of processo(locale)) {
    const body = wrap(f.desc, sans, 9.5, COL_W - 32)
    room(14 + body.length * 13 + 9)
    y -= 14
    page.drawText(f.n, { x: MG.x, y, size: 9, font: mono, color: MUTED })
    page.drawText(safe(f.title), { x: MG.x + 32, y, size: 10.5, font: bold, color: INK })
    for (const line of body) {
      y -= 13
      page.drawText(line, { x: MG.x + 32, y, size: 9.5, font: sans, color: BODY })
    }
    y -= 9
  }

  h2(t.noteTitle)
  para(t.note, italic, 9, MUTED, 14, 0)

  /* ── Piè di pagina, uguale su ogni pagina ──────────────────────────── */
  const pages = doc.getPages()
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: MG.x, y: MG.bottom - 20 }, end: { x: A4.w - MG.x, y: MG.bottom - 20 },
      thickness: 1, color: RULE,
    })
    let x = MG.x
    for (const ch of safe(t.brand).toUpperCase()) {
      p.drawText(ch, { x, y: MG.bottom - 34, size: 7.5, font: mono, color: MUTED })
      x += mono.widthOfTextAtSize(ch, 7.5) + 1.2
    }
    const num = `${i + 1} / ${pages.length}`
    p.drawText(num, {
      x: A4.w - MG.x - mono.widthOfTextAtSize(num, 7.5),
      y: MG.bottom - 34, size: 7.5, font: mono, color: MUTED,
    })
  })

  doc.setTitle(`${t.docTitle} — ${bp.vector.label}`)
  doc.setAuthor("Nadia Maar")
  doc.setSubject(`${bp.vector.node} · ${bp.complexity.label} · ${bp.complexity.weeks}`)
  doc.setCreator("Nadia Maar — Digital Foundry")
  doc.setProducer("Nadia Maar — Digital Foundry")

  return doc.save()
}

/** Genera il file e lo consegna al browser come download. */
export async function downloadRoadmapPdf(bp: Blueprint, dateLabel: string, locale: Locale = DEFAULT_LOCALE): Promise<void> {
  const bytes = await buildRoadmapPdf(bp, dateLabel, locale)
  const base = pick(CONFIGURATOR_STR, locale).roadmap.fileName
  downloadPdf(bytes, `${base}-${slug(bp.vector.node, base)}.pdf`)
}
