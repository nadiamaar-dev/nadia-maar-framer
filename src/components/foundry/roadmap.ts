import type { Blueprint } from "./modules"

/* ══════════════════════════════════════════════════════════════════════════
   ROADMAP — documento stampabile (→ PDF via "Salva come PDF" del browser)
   Generato in un iframe nascosto: nessuna dipendenza esterna, nessun popup
   da sbloccare, funziona identico in locale e su Vercel.
   Documento chiaro su fondo bianco: è pensato per la stampa, non per lo schermo.
══════════════════════════════════════════════════════════════════════════ */

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

const FASI = [
  { n: "01", t: "Analisi tecnica e di business", b: "Mappatura di processi, dati e vincoli esistenti. Definizione del perimetro e dei criteri di successo." },
  { n: "02", t: "Design dell'interfaccia e architettura", b: "Progettazione dell'esperienza e dello schema dati. Scelta definitiva dello stack sui requisiti emersi." },
  { n: "03", t: "Sviluppo e integrazioni", b: "Costruzione dei moduli selezionati e collegamento dei sistemi esterni, con rilasci verificabili." },
  { n: "04", t: "Collaudo, lancio e misurazione", b: "Test su dati reali, messa in produzione, tracciamento e ottimizzazione continua." },
]

export function buildRoadmapHtml(bp: Blueprint, dateLabel: string): string {
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

  const fasi = FASI.map(
    f => `<div class="fase"><span class="fase-n">${f.n}</span><div><p class="fase-t">${esc(f.t)}</p><p class="fase-b">${esc(f.b)}</p></div></div>`,
  ).join("")

  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><title>Roadmap — ${esc(bp.vector.label)}</title>
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
    <p class="brand mono">Nadia Maar — Digital Foundry</p>
    <h1>${esc(bp.vector.label)}</h1>
    <p class="stack mono">${esc(bp.vector.node)} · ${esc(bp.vector.stack)}</p>
  </header>

  <div class="meta">
    <div><p class="meta-k mono">Complessità</p><p class="meta-v">${esc(bp.complexity.label)}</p></div>
    <div><p class="meta-k mono">Durata orientativa</p><p class="meta-v">${esc(bp.complexity.weeks)}</p></div>
    <div><p class="meta-k mono">Data</p><p class="meta-v">${esc(dateLabel)}</p></div>
  </div>

  <h2 class="mono">Obiettivo</h2>
  <p>${esc(bp.obiettivo)}</p>

  <h2 class="mono">Architettura</h2>
  <p>${esc(bp.architettura)}</p>
  <p>${esc(bp.vector.tech)}</p>

  <h2 class="mono">Componenti</h2>
  ${scaffali}

  <h2 class="mono">Fasi di lavoro</h2>
  ${fasi}

  <h2 class="mono">Nota</h2>
  <p class="note">Complessità e durata sono una stima tecnica preliminare, basata sui moduli selezionati. Il perimetro definitivo si stabilisce dopo l'analisi dei processi e dei sistemi esistenti.</p>

  <footer class="mono">Nadia Maar · Digital Foundry — Development &amp; Growth</footer>
</body></html>`
}

/** Apre la finestra di stampa del browser su un documento roadmap isolato. */
export function printRoadmap(bp: Blueprint, dateLabel: string): void {
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
  doc.write(buildRoadmapHtml(bp, dateLabel))
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
