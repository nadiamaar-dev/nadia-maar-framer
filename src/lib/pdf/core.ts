/* ══════════════════════════════════════════════════════════════════════════
   PDF — pezzi comuni.

   Erano funzioni locali dentro buildRoadmapPdf: la roadmap del configuratore
   era l'unico documento del sito. Ora ce n'è un secondo (l'avviso di
   pagamento) e queste servivano a entrambi, così stanno qui invece di essere
   copiate.

   pdf-lib non viene importata da questo file: entra con un import dinamico
   solo dentro chi compone davvero un documento, così chi non scarica niente
   non se la porta a casa.
══════════════════════════════════════════════════════════════════════════ */

export const A4 = { w: 595.28, h: 841.89 }          // punti tipografici
export const MG = { top: 56, bottom: 62, x: 46 }    // il fondo lascia posto al piè di pagina
export const COL_W = A4.w - MG.x * 2

/* Le Standard Font del PDF parlano WinAnsi. Un carattere fuori tabella non
   degrada: fa fallire l'intera generazione. Qui i pochi segni plausibili
   vengono sostituiti e il resto scartato, così il file esce comunque. */
const WIN_EXTRA = new Set([..."€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ"])
const SUBS: Record<string, string> = {
  "→": "->", "←": "<-", "↔": "<->", "✓": "-", "✗": "x", " ": " ", "−": "-",
}

export function safe(s: string): string {
  let out = ""
  for (const ch of s) {
    if (SUBS[ch] !== undefined) { out += SUBS[ch]; continue }
    const c = ch.codePointAt(0)!
    if (c === 9 || c === 10 || c === 13) { out += " "; continue }
    if (c < 32 || c === 127) continue
    if (c >= 128 && c <= 159) continue      // controlli C1: non esistono in WinAnsi
    if (c <= 255 || WIN_EXTRA.has(ch)) out += ch
  }
  return out
}

export function slug(s: string, fallback = "documento"): string {
  const base = s.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase()
  return base || fallback
}

/** Minimo comune di un font pdf-lib: basta a misurare e mandare a capo. */
export interface Measurable {
  widthOfTextAtSize(text: string, size: number): number
}

/**
 * Manda a capo rispettando la larghezza reale del font. Una parola più larga
 * della colonna (un URL, un IBAN) viene spezzata a forza: altrimenti
 * uscirebbe dal margine destro senza che nessuno se ne accorga.
 */
export function wrap(text: string, font: Measurable, size: number, max: number): string[] {
  const out: string[] = []
  let line = ""
  for (const word of safe(text).split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) <= max) { line = next; continue }
    if (line) out.push(line)
    if (font.widthOfTextAtSize(word, size) > max) {
      let chunk = ""
      for (const ch of word) {
        if (font.widthOfTextAtSize(chunk + ch, size) > max) { out.push(chunk); chunk = ch }
        else chunk += ch
      }
      line = chunk
    } else line = word
  }
  if (line) out.push(line)
  return out
}

/** Scarica dei byte come file. Vive qui perché tocca il DOM e i compositori
 *  restano puri: si possono generare e ispezionare fuori dal browser. */
export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  /* revoca differita: Safari legge il blob dopo il click, non durante */
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
