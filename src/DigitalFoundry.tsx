import React, { useEffect, useState, useMemo } from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Background from "./components/Background"
import FloatingContact from "./components/FloatingContact"
import Sidebar from "./components/Sandbox/Sidebar"
import ProjectCard, { PROJECT_CARD_CSS } from "./components/Sandbox/ProjectCard"
import ProjectOverlay from "./components/Sandbox/preview/ProjectOverlay"
import { sandboxItems, SandboxCategory, SandboxType } from "./data/sandboxData"
import { useLocale } from "./lib/i18n/LocaleContext"
import { useT } from "./lib/i18n/t"
import { LAB_STR } from "./lib/i18n/strings/lab"
import { trackEvent } from "./lib/measure"

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"
const BODY: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif", fontSize: "clamp(16px, 1.4vw, 17px)", fontWeight: 400, lineHeight: 1.85, letterSpacing: "0.01em" }

/* Prima questo blocco veniva iniettato da un useEffect (document.createElement
   + appendChild), che gira DOPO il primo paint del browser. Al refresh, per
   un fotogramma la pagina si dipingeva senza .nm-foundry-hero/-content/-layout
   (niente centratura, niente flex, niente grid: tutto a piena larghezza,
   incollato a sinistra), poi lo stile arrivava e il layout scattava di colpo
   nella posizione corretta — il "salto a sinistra" lamentato. Come nelle altre
   pagine del sito, lo <style> ora vive nel JSX: React lo monta nello stesso
   commit del resto dell'albero, prima che il browser disegni qualsiasi cosa. */
const CSS = `
/* Restano tre colonne, ma il contenitore è passato da 1160 a 1440px: ogni
   scheda guadagna comunque un ~35% di larghezza rispetto a prima — la
   miniatura sopra il testo si legge come uno screenshot vero, non come un
   francobollo — senza scendere a due schede per riga. */
.nm-foundry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 1200px) {
  .nm-foundry-grid { grid-template-columns: repeat(2, 1fr); }
}
/* Stesso punto in cui la barra laterale passa dalla colonna verticale alla
   fascia orizzontale (Sidebar.tsx, 768px): sotto quella soglia non c'è più
   una colonna a sinistra da affiancare, la griglia torna a una sola. */
@media (max-width: 768px) {
  .nm-foundry-grid { grid-template-columns: 1fr; gap: 12px; }
}
.nm-foundry-layout {
  display: flex;
  gap: 48px;
  align-items: flex-start;
}
@media (max-width: 767px) {
  .nm-foundry-layout { flex-direction: column; gap: 0; }
}
/* 1160 → 1440: il contenuto usa più della finestra su schermi larghi, e la
   barra laterale — che prima galleggiava vicino al centro — si sposta con
   lui verso il bordo sinistro. Le schede, di conseguenza, guadagnano lo
   spazio in più sulla destra. */
/* Il testo in alto ha un rientro suo, un po' più largo di quello di sidebar
   e griglia sotto: la stessa identica misura per hero e contenuto li faceva
   sembrare incollati allo stesso righello, mentre il titolo — molto più
   grande — ha bisogno di un filo di respiro in più a sinistra. */
.nm-foundry-hero {
  max-width: 1440px; margin: 0 auto; padding: 0 32px 72px 64px;
  position: relative;
}
@media (max-width: 767px) {
  .nm-foundry-hero { padding: 0 16px 40px; }
  .nm-foundry-h1 { font-size: clamp(30px, 9vw, 48px) !important; line-height: 0.96 !important; }
}
@media (max-width: 400px) {
  .nm-foundry-h1 { font-size: clamp(28px, 10vw, 42px) !important; }
}
.nm-foundry-content {
  max-width: 1440px; margin: 0 auto; padding: 0 32px;
}
@media (max-width: 767px) {
  .nm-foundry-content { padding: 0 16px; }
}
.nm-foundry-main {
  position: relative; z-index: 2; padding-top: 120px; padding-bottom: 100px;
}
@media (max-width: 767px) {
  .nm-foundry-main { padding-top: 88px; padding-bottom: 64px; }
}
.nm-foundry-count {
  font-family: 'JetBrains Mono',monospace; font-size: 9px;
  letter-spacing: 0.22em; color: #FFFFFF;
  text-transform: uppercase; margin-bottom: 22px;
  display: flex; align-items: center; gap: 10px;
}
.nm-foundry-count::before {
  content: ''; display: inline-block; width: 4px; height: 4px;
  border-radius: 50%; background: rgba(184,50,64,0.70);
}
@media (max-width: 767px) {
  .nm-foundry-count { margin-bottom: 14px; }
  /* body copy stays at 16px on phones — !important beats the inline size */
  .hp-body { font-size: 16px !important; }
}
`

export default function DigitalFoundry() {
  const t = useT(LAB_STR)
  const { locale } = useLocale()
  const [category, setCategory] = useState<SandboxCategory>("All")
  const [type, setType] = useState<SandboxType | "all">("all")
  /* indice dentro `filtered`, non id: la carosella sfoglia esattamente ciò
     che è a schermo, quindi cambiare filtro mentre è aperta non ha senso —
     infatti il filtro chiude l'anteprima (vedi sotto). */
  const [preview, setPreview] = useState<number | null>(null)

  useEffect(() => { setPreview(null) }, [category, type])

  const filtered = useMemo(() => {
    return sandboxItems(locale).filter(item => {
      const catMatch = category === "All" || item.category === category
      const typeMatch = type === "all" || item.type === type
      return catMatch && typeMatch
    })
  }, [category, type, locale])

  return (
    <div style={{ minHeight: "100vh", background: "#060C18", position: "relative" }}>
      {/* Lo stile delle schede vive qui, montato una sola volta per la griglia
          intera invece che ripetuto in ognuna delle schede. */}
      <style>{CSS + PROJECT_CARD_CSS}</style>
      <Background />
      <Header />
      <FloatingContact />

      <main className="nm-foundry-main">

        {/* ── Hero ── */}
        <div className="nm-foundry-hero">

          {/* MAAR watermark — `right: -8` sporgeva di 8px oltre il bordo
              destro della finestra. Il genitore non taglia, quindi quegli 8px
              diventavano scorrimento orizzontale dell'intera pagina: la si
              poteva trascinare di lato, ed è il motivo per cui al
              caricamento sembrava spostata. Allineato al bordo: la filigrana
              è identica, la pagina non si muove più. */}
          <div aria-hidden style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            display: "flex", alignItems: "center", pointerEvents: "none",
            zIndex: 0, overflow: "hidden",
          }}>
            <span style={{
              writingMode: "vertical-rl", transform: "rotate(180deg)",
              fontFamily: DISPLAY, fontWeight: 900,
              fontSize: "clamp(120px, 18vw, 220px)",
              letterSpacing: "-0.04em", lineHeight: 0.84,
              color: "rgba(255,255,255,0.012)", filter: "blur(1px)",
              userSelect: "none", whiteSpace: "nowrap",
            }}>MAAR</span>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* eyebrow */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: MONO, fontSize: 11, letterSpacing: ".20em",
              textTransform: "uppercase", color: "#FFFFFF",
              marginBottom: 22,
            }}>
              {/* rame per il testo: #BE3648 è quello dei riempimenti e a 11px dà 3,55:1 */}
              <span style={{ color: "#E4697A" }}>//</span>
              <span>{t.page.kicker}</span>
            </div>

            {/* headline */}
            <h1 className="nm-foundry-h1" style={{
              fontFamily: DISPLAY, fontSize: "clamp(32px, 4.2vw, 56px)", fontWeight: 900,
              color: "#fff", margin: "0 0 8px", lineHeight: 0.96, letterSpacing: "-0.04em",
            }}>
              {t.page.title1}
            </h1>
            <h1 className="nm-foundry-h1" style={{
              fontFamily: DISPLAY, fontSize: "clamp(32px, 4.2vw, 56px)", fontWeight: 900,
              color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.40)",
              margin: "0 0 28px", lineHeight: 0.96, letterSpacing: "-0.04em",
            }}>
              {t.page.title2}
            </h1>

            {/* description */}
            <p className="hp-body" style={{ ...BODY, color: "#FFFFFF", margin: 0, maxWidth: 500 }}>
              {t.page.lead}
            </p>

            {/* thin accent divider */}
            <div style={{
              marginTop: 40, height: 1,
              background: "linear-gradient(90deg, rgba(184,50,64,0.60), rgba(184,50,64,0.15) 50%, transparent)",
              maxWidth: 500,
            }} />
          </div>
        </div>

        {/* ── Layout: Sidebar + Grid ── */}
        <div className="nm-foundry-content">
          <div className="nm-foundry-layout">
            <Sidebar
              activeCategory={category}
              activeType={type}
              onCategoryChange={setCategory}
              onTypeChange={setType}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm-foundry-count">
                {t.page.count.replace("{n}", String(filtered.length))}
              </div>

              {filtered.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "80px 20px",
                  border: "1px dashed rgba(255,255,255,0.10)",
                  borderRadius: 16,
                }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 12 }}>{t.page.emptyTag}</div>
                  <div className="hp-body" style={{ fontFamily: DISPLAY, fontSize: 15, color: "#FFFFFF" }}>{t.page.empty}</div>
                </div>
              ) : (
                <div className="nm-foundry-grid">
                  {filtered.map((item, i) => (
                    <ProjectCard key={item.id} item={item} onOpen={() => {
                      /* «demo aperta» = il momento in cui il visitatore entra
                         nell'anteprima interattiva: è il primo passo misurabile
                         della voronka dopo il pageview. */
                      trackEvent("demo_open", { demo: item.id, via: "overlay" })
                      setPreview(i)
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ProjectOverlay
        items={filtered}
        index={preview}
        onIndex={setPreview}
        onClose={() => setPreview(null)}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <Footer />
      </div>
    </div>
  )
}
