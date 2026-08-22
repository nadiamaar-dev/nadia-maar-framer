/**
 * LegalDocument.tsx — l'impaginazione dei tre documenti legali.
 *
 * Un componente solo per privacy, cookie e termini: i testi sono dati
 * (src/lib/legal.ts descrive la forma, le stringhe la riempiono), qui c'è
 * soltanto il modo di disegnarli. Tre pagine con tre impaginazioni separate
 * avrebbero significato ritoccare tre volte ogni dettaglio tipografico e,
 * prima o poi, tre indici che si comportano in modo diverso.
 *
 * Che cosa aggiunge oltre al testo:
 * · il riquadro di identificazione del titolare, generato da LEGAL_ENTITY —
 *   così la partita IVA, quando arriverà, comparirà in tutti e tre i
 *   documenti con una modifica sola;
 * · l'indice ancorato, che rende citabile una singola clausola (/termini#recesso);
 * · la data di ultimo aggiornamento, che su un documento legale non è un
 *   ornamento: dice quale versione si sta leggendo;
 * · un foglio di stile per la stampa, perché un'informativa che il cliente
 *   deve allegare a un contratto va salvata in PDF senza sfondo scuro.
 */

import React from "react"
import Header from "./Header"
import Footer from "./Footer"
import Background from "./Background"
import { useLocale } from "../lib/i18n/LocaleContext"
import { DATE_TAG, useT } from "../lib/i18n/t"
import { LEGAL_COMMON_STR } from "../lib/i18n/strings/legalCommon"
import {
  HAS_REGISTERED_DETAILS,
  LEGAL_ENTITY,
  LEGAL_UPDATED,
  type LegalBlock,
  type LegalDoc,
  type LegalTable,
  isSet,
} from "../lib/legal"

/* ── tokens: gli stessi di /architecture, il documento è parte del sito ── */
const T = {
  bg: "#060C18", text: "#FFFFFF", muted: "rgba(255,255,255,0.78)",
  border: "rgba(255,255,255,0.11)", accentLt: "#BE3648", accentTx: "#E4697A",
} as const
const MONO = "'JetBrains Mono','SF Mono',ui-monospace,monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const SANS = "'Geist', system-ui, sans-serif"

const CSS = `
  .lg-wrap { max-width: 1180px; margin: 0 auto; padding: 0 32px; }

  /* L'indice sta a lato e resta in vista mentre si scorre: un documento di
     venti sezioni senza indice ancorato si legge solo dall'inizio. */
  .lg-cols { display: grid; grid-template-columns: 250px 1fr; gap: 56px; align-items: start; }
  .lg-toc { position: sticky; top: 96px; max-height: calc(100vh - 130px); overflow-y: auto; }
  .lg-toc a {
    display: block; padding: 5px 0 5px 12px; border-left: 1px solid rgba(255,255,255,0.12);
    font-family: ${MONO}; font-size: 11px; line-height: 1.5; letter-spacing: 0.02em;
    color: rgba(255,255,255,0.62); text-decoration: none; transition: color .18s, border-color .18s;
  }
  .lg-toc a:hover { color: #fff; border-left-color: rgba(190,54,72,0.75); }

  .lg-sec { scroll-margin-top: 96px; padding: 40px 0; border-top: 1px solid ${T.border}; }
  .lg-sec:first-child { border-top: none; padding-top: 8px; }
  .lg-sec h2 {
    font-family: ${DISPLAY}; font-weight: 800; font-size: clamp(20px, 2.2vw, 27px);
    line-height: 1.18; letter-spacing: -0.025em; color: #FFFFFF; margin: 0 0 18px;
  }
  .lg-sec p, .lg-sec li {
    font-family: ${SANS}; font-size: 15.5px; line-height: 1.85; letter-spacing: 0.005em;
    color: ${T.muted};
  }
  .lg-sec p { margin: 0 0 16px; max-width: 78ch; }
  .lg-sec ul, .lg-sec ol { margin: 0 0 16px; padding-left: 20px; max-width: 78ch; }
  .lg-sec li { margin-bottom: 9px; padding-left: 4px; }
  .lg-sec li::marker { color: ${T.accentTx}; }
  .lg-sec a { color: ${T.accentTx}; text-decoration: underline; text-underline-offset: 3px; }
  .lg-sec a:hover { color: #fff; }

  .lg-note {
    margin: 0 0 18px; padding: 15px 18px; border-radius: 12px; max-width: 78ch;
    background: rgba(190,54,72,0.07); border: 1px solid rgba(190,54,72,0.26);
    border-left: 2px solid rgba(190,54,72,0.75);
  }
  .lg-note p { margin: 0; font-size: 14.5px; color: rgba(255,255,255,0.82); }

  /* Le tabelle sono la parte che si legge davvero (finalità, basi giuridiche,
     durate): su schermo stretto scorrono da sole invece di far scorrere la
     pagina in orizzontale. */
  .lg-tablewrap { overflow-x: auto; margin: 0 0 20px; border-radius: 12px; border: 1px solid ${T.border}; }
  .lg-table { width: 100%; border-collapse: collapse; min-width: 640px; }
  .lg-table th, .lg-table td {
    text-align: left; vertical-align: top; padding: 13px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    font-family: ${SANS}; font-size: 14px; line-height: 1.68; color: ${T.muted};
  }
  .lg-table th {
    font-family: ${MONO}; font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase;
    color: #FFFFFF; background: rgba(255,255,255,0.045); white-space: nowrap;
  }
  .lg-table tr:last-child td { border-bottom: none; }
  .lg-table a { color: ${T.accentTx}; }

  .lg-idcard { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px 34px; }

  @media (max-width: 980px) {
    .lg-cols { grid-template-columns: 1fr; gap: 30px; }
    .lg-toc { position: static; max-height: none; }
    .lg-idcard { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .lg-wrap { padding: 0 20px; }
  }

  /* Stampa: il documento va allegato a un contratto, non ammirato. */
  @media print {
    .lg-toc, header, footer, .lg-noprint { display: none !important; }
    .lg-cols { display: block; }
    .lg-sec { break-inside: avoid; border-top: 1px solid #ccc; }
    .lg-sec p, .lg-sec li, .lg-table th, .lg-table td { color: #111 !important; }
    .lg-sec h2, .lg-hero h1 { color: #000 !important; }
  }
`

/* ══════════════════════════════════════════════════════════════════════════
   TESTO IN LINEA

   Due sole convenzioni, e non una per capriccio: i segnaposto {email},
   {entity}… evitano che i recapiti siano riscritti a mano in sei testi (tre
   documenti per due lingue), e [testo](/privacy) permette a un'informativa
   di rimandare a un'altra senza che le stringhe debbano contenere JSX.
══════════════════════════════════════════════════════════════════════════ */

const TOKENS: Record<string, string> = {
  "{entity}": LEGAL_ENTITY.name,
  "{email}": LEGAL_ENTITY.email,
  "{phone}": LEGAL_ENTITY.phone,
  "{vat}": LEGAL_ENTITY.vat,
  "{address}": LEGAL_ENTITY.address,
  "{site}": LEGAL_ENTITY.site.replace(/^https?:\/\//, ""),
  "{updated}": LEGAL_UPDATED,
}

function substitute(text: string): string {
  return text.replace(/\{(entity|email|phone|vat|address|site|updated)\}/g, m => TOKENS[m] ?? m)
}

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g

/** Da stringa a nodi: sostituisce i segnaposto e trasforma i link. */
function inline(text: string, L: (p: string) => string): React.ReactNode[] {
  const src = substitute(text)
  const out: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  LINK_RE.lastIndex = 0

  while ((m = LINK_RE.exec(src)) !== null) {
    if (m.index > last) out.push(src.slice(last, m.index))
    const [, label, href] = m
    const external = /^https?:\/\//.test(href)
    out.push(
      external
        ? <a key={`${m.index}-${href}`} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        /* I link interni portano il prefisso di lingua: dalla policy inglese
           si resta in inglese, altrimenti il rimando fra un documento e
           l'altro riporta in italiano a metà lettura. `/robots.txt` e gli
           altri file serviti dalla radice non sono pagine e non lo prendono. */
        : <a key={`${m.index}-${href}`} href={href.includes(".") ? href : L(href)}>{label}</a>,
    )
    last = m.index + m[0].length
  }
  if (last < src.length) out.push(src.slice(last))
  return out
}

/* ── blocchi ── */

function Table({ table, L }: { table: LegalTable; L: (p: string) => string }) {
  return (
    <div className="lg-tablewrap">
      <table className="lg-table">
        <thead>
          <tr>{table.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>{row.map((cell, c) => <td key={c}>{inline(cell, L)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Block({ block, L }: { block: LegalBlock; L: (p: string) => string }) {
  if ("p" in block) return <p>{inline(block.p, L)}</p>
  if ("ul" in block) return <ul>{block.ul.map((x, i) => <li key={i}>{inline(x, L)}</li>)}</ul>
  if ("ol" in block) return <ol>{block.ol.map((x, i) => <li key={i}>{inline(x, L)}</li>)}</ol>
  if ("note" in block) return <div className="lg-note"><p>{inline(block.note, L)}</p></div>
  return <Table table={block.table} L={L} />
}

/* ── il riquadro di identificazione ──────────────────────────────────────
   Compare in cima a tutti e tre i documenti perché tutti e tre devono dire
   chi risponde: l'articolo 13 del GDPR per l'informativa, l'articolo 7 del
   D.lgs. 70/2003 per i termini. I campi non ancora attribuiti non si
   stampano vuoti — al loro posto c'è la riga di attesa, che dice perché
   mancano invece di lasciare pensare a una dimenticanza. */
function IdentityCard() {
  const c = useT(LEGAL_COMMON_STR).identity

  const rows: { label: string; value: string; href?: string }[] = [
    { label: c.name, value: LEGAL_ENTITY.name },
    { label: c.address, value: LEGAL_ENTITY.address },
    { label: c.vat, value: LEGAL_ENTITY.vat },
    { label: c.taxCode, value: LEGAL_ENTITY.taxCode },
    { label: c.email, value: LEGAL_ENTITY.email, href: `mailto:${LEGAL_ENTITY.email}` },
    { label: c.pec, value: LEGAL_ENTITY.pec },
    { label: c.phone, value: LEGAL_ENTITY.phone, href: `tel:${LEGAL_ENTITY.phone.replace(/\s/g, "")}` },
    { label: c.site, value: LEGAL_ENTITY.site.replace(/^https?:\/\//, ""), href: LEGAL_ENTITY.site },
  ].filter(r => isSet(r.value))

  return (
    <div style={{
      borderRadius: 16, padding: "26px 28px", marginBottom: 8,
      background: "rgba(14,24,31,0.30)", border: `1px solid ${T.border}`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: T.accentTx, marginBottom: 18 }}>
        {c.title}
      </div>
      <div className="lg-idcard">
        {rows.map(r => (
          <div key={r.label}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 5 }}>
              {r.label}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.5, color: "#FFFFFF" }}>
              {r.href
                ? <a href={r.href} style={{ color: "#FFFFFF", textDecoration: "none" }}>{r.value}</a>
                : r.value}
            </div>
          </div>
        ))}
      </div>
      {!HAS_REGISTERED_DETAILS && (
        <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.72, color: "rgba(255,255,255,0.62)", margin: "20px 0 0", maxWidth: "70ch" }}>
          {c.pending}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   LA PAGINA
══════════════════════════════════════════════════════════════════════════ */
export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  const c = useT(LEGAL_COMMON_STR)
  const { href: L, locale } = useLocale()

  /* La data si scrive nel formato della lingua che si sta leggendo: «22
     agosto 2026» a chi legge in italiano, «22 August 2026» a chi legge in
     inglese. Un formato numerico sarebbe ambiguo fra le due convenzioni. */
  const updated = new Date(`${LEGAL_UPDATED}T00:00:00Z`).toLocaleDateString(DATE_TAG[locale], {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  })

  const num = (i: number) => String(i + 1).padStart(2, "0")

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: SANS, minHeight: "100vh", position: "relative", overflowX: "clip" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Background />
      <Header />

      <div style={{ position: "relative", zIndex: 1, paddingTop: 64 }}>

        {/* ── intestazione ── */}
        <section className="lg-hero" style={{ padding: "70px 0 44px" }}>
          <div className="lg-wrap">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 13, marginBottom: 20 }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.2em", color: T.accentTx, textTransform: "uppercase" }}>
                {doc.kicker}
              </span>
              <span aria-hidden style={{ width: 28, height: 1, background: "linear-gradient(90deg, rgba(190,54,72,0.6), rgba(190,54,72,0.08))" }} />
            </div>

            <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.05, letterSpacing: "-0.04em", color: "#FFFFFF", margin: "0 0 20px", maxWidth: "20ch" }}>
              {doc.title}
            </h1>

            <p style={{ fontFamily: SANS, fontSize: "clamp(15px,1.4vw,17px)", lineHeight: 1.82, color: T.muted, maxWidth: "72ch", margin: "0 0 26px" }}>
              {doc.lead}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 22px", marginBottom: 34, fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
              <span>{c.updated}: <time dateTime={LEGAL_UPDATED} style={{ color: "#FFFFFF" }}>{updated}</time></span>
              <button type="button" className="lg-noprint" onClick={() => window.print()}
                style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                ↓ {c.print}
              </button>
            </div>

            <IdentityCard />
          </div>
        </section>

        {/* ── indice + testo ── */}
        <section style={{ padding: "0 0 90px" }}>
          <div className="lg-wrap">
            <div className="lg-cols">

              <nav className="lg-toc" aria-label={c.toc}>
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 14 }}>
                  {c.toc}
                </div>
                {doc.sections.map((s, i) => (
                  <a key={s.id} href={`#${s.id}`}>
                    <span style={{ color: T.accentTx, marginRight: 8 }}>{num(i)}</span>{s.title}
                  </a>
                ))}
              </nav>

              <div>
                {doc.sections.map((s, i) => (
                  <section key={s.id} id={s.id} className="lg-sec">
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: T.accentTx, marginBottom: 10 }}>
                      §{num(i)}
                    </div>
                    <h2>{s.title}</h2>
                    {s.blocks.map((b, j) => <Block key={j} block={b} L={L} />)}
                  </section>
                ))}

                {doc.seeAlso && doc.seeAlso.length > 0 && (
                  <div style={{ marginTop: 46, paddingTop: 26, borderTop: `1px solid ${T.border}` }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>
                      {c.seeAlsoTitle}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {doc.seeAlso.map(link => (
                        <a key={link.href} href={L(link.href)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "10px 16px", borderRadius: 10, textDecoration: "none", border: "1px solid rgba(255,255,255,0.20)", background: "rgba(255,255,255,0.035)", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FFFFFF" }}>
                          <span style={{ color: T.accentLt }}>→</span>{link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
