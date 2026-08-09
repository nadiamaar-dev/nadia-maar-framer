import React, { useState } from "react"
import { SandboxItem } from "../../data/sandboxData"
import { useBlueprint } from "../../context/BlueprintContext"

const MONO    = "'JetBrains Mono',monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const BODY    = "'Geist', system-ui, sans-serif"

/* Esportato e montato UNA VOLTA da chi disegna la griglia (DigitalFoundry).
   Prima ogni scheda se lo iniettava da sola in un useEffect, cioè dopo il
   primo paint: al refresh le schede comparivano non stilizzate e poi
   scattavano in posizione. Nel JSX della scheda non può stare, perché si
   ripeterebbe una volta per scheda. */
export const PROJECT_CARD_CSS = `
.nm-card {
  position: relative; overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.09);
  display: flex; flex-direction: column;
  cursor: default;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}
.nm-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.38);
}

/* Glass background — bottom fade */
.nm-card-glass {
  position: absolute; inset: 0; border-radius: 16px;
  background: rgba(255,255,255,0.008);
  backdrop-filter: blur(6px) brightness(1.03);
  -webkit-backdrop-filter: blur(6px) brightness(1.03);
  -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 85%);
  mask-image: linear-gradient(to bottom, black 40%, transparent 85%);
  pointer-events: none;
}

/* Gradient border — top + sides fade to mid */
.nm-card-border {
  position: absolute; inset: 0; border-radius: 16px;
  padding: 1px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.40) 0%, transparent 52%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none; z-index: 2;
}

.nm-card-inner {
  position: relative; z-index: 3;
  padding: 20px 20px 18px;
  display: flex; flex-direction: column; gap: 12px;
  /* prima "height:100%": con la miniatura sopra, la colonna deve occupare
     lo spazio RIMASTO nella scheda, non di nuovo il 100% di essa. */
  flex: 1; min-height: 0;
}

/* ── miniatura in cima alla scheda ──────────────────────────────────────
   Sta PRIMA di .nm-card-inner nel flusso, sopra .nm-card-glass/-border
   (nessun z-index: l'ordine nel DOM basta). Gli angoli superiori si
   arrotondano da soli grazie all'overflow:hidden di .nm-card — qui non
   serve un secondo border-radius. */
.nm-card-thumb {
  position: relative; z-index: 3; flex-shrink: 0;
  aspect-ratio: 16 / 10; width: 100%;
  background: #0B0D12;
  overflow: hidden;
}
.nm-card-thumb img {
  width: 100%; height: 100%; object-fit: cover; object-position: top;
  display: block;
}
/* segnaposto per le schede senza screenshot: le iniziali del titolo sul
   colore dell'item, non un rettangolo vuoto. */
.nm-card-thumb-placeholder {
  display: flex; align-items: center; justify-content: center;
}
.nm-card-thumb-glyph {
  font-family: ${DISPLAY}; font-weight: 800; font-size: 30px;
  letter-spacing: -0.02em; opacity: 0.55;
}

/* ── azioni: una riga sopra (Anteprima + Full Preview), una in fondo
   (Blueprint) ──────────────────────────────────────────────────────────
   La riga sopra segue subito il testo; il Blueprint resta ancorato al
   fondo della scheda con margin-top:auto, qualunque sia l'altezza di
   quello che c'è sopra di lui. */
.nm-card-btn-toprow {
  display: flex; gap: 8px;
}
.nm-card-btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  flex: 1; min-width: 0; padding: 12px 14px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.40);
  border-radius: 9px; cursor: pointer;
  font-family: ${MONO}; font-size: 9.5px; font-weight: 600;
  letter-spacing: 0.10em; text-transform: uppercase;
  color: #FFFFFF; text-decoration: none;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.nm-card-btn-primary:hover {
  background: rgba(255,255,255,0.13);
  border-color: rgba(255,255,255,0.62);
}

/* Blueprint button — [01] mono glass style */
.nm-card-btn-bp {
  margin-top: auto;
  display: flex; align-items: stretch; overflow: hidden;
  border-radius: 9px; cursor: pointer;
  border: 1px solid rgba(184,50,64,0.50);
  background: linear-gradient(90deg, rgba(184,50,64,0.34) 0%, rgba(184,50,64,0.18) 100%);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 0 10px rgba(184,50,64,0.15), inset 0 1px 0 rgba(255,255,255,0.10);
  transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
}
.nm-card-btn-bp:hover {
  border-color: rgba(184,50,64,0.80);
  background: linear-gradient(90deg, rgba(184,50,64,0.50) 0%, rgba(184,50,64,0.30) 100%);
  box-shadow: 0 0 20px rgba(184,50,64,0.28), inset 0 1px 0 rgba(255,255,255,0.14);
}
.nm-card-btn-bp-tag {
  padding: 9px 10px;
  border-right: 1px solid rgba(184,50,64,0.38);
  display: flex; align-items: center;
  font-family: ${MONO}; font-size: 8.5px; letter-spacing: 0.20em;
  color: #FFFFFF; flex-shrink: 0;
}
.nm-card-btn-bp-label {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-family: ${MONO}; font-size: 9.5px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: #fff; padding: 9px 12px;
}

/* In-blueprint glow border */
.nm-card-inbp {
  box-shadow: 0 0 0 1px rgba(184,50,64,0.45), 0 8px 32px rgba(184,50,64,0.12) !important;
}

/* Bottom accent line when in blueprint */
.nm-card-accent-line {
  position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  transition: opacity 0.3s ease; pointer-events: none; z-index: 4;
}

/* body copy stays at 16px on phones — !important beats the inline size */
@media (max-width: 768px) {
  .hp-body { font-size: 16px !important; }
}
`

/* iniziali del titolo per il segnaposto della miniatura: "CRM Dashboard" → "CD" */
function initials(title: string): string {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase()
}

/* ogni demo ha la sua rotta: "Full Preview" ci porta direttamente, in una
   scheda nuova — l'Anteprima resta il posto dove si guarda senza uscire
   dalla griglia. */
const DEMO_HREF: Record<string, string> = {
  "supplier-portal": "/demo/portale-fornitori",
}

export default function ProjectCard({ item, onOpen }: { item: SandboxItem; onOpen?: () => void }) {
  const { user, isInBlueprint, addToBlueprint, removeFromBlueprint, openAuthModal } = useBlueprint()
  const inBlueprint = isInBlueprint(item.id)
  const [added, setAdded] = useState(false)
  const handleBlueprint = () => {
    if (!user) { openAuthModal(); return }
    if (inBlueprint) {
      removeFromBlueprint(item.id)
      setAdded(false)
    } else {
      addToBlueprint(item)
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    }
  }

  /* Il clic sulla scheda apre l'anteprima — comodo col mouse. La scheda
     resta però un <div> SENZA role="button" e senza tabIndex: contiene già
     due link e un pulsante, e un controllo non può contenerne altri (né
     l'HTML lo permette né uno screen reader saprebbe leggerlo). La via da
     tastiera è il pulsante "Anteprima" esplicito qui sotto. */
  const open = (e: React.MouseEvent) => {
    if (!onOpen) return
    /* un clic partito da un pulsante o da un link è suo, non della scheda */
    if ((e.target as HTMLElement).closest("a,button")) return
    onOpen()
  }

  return (
    <div
      className={`nm-card${inBlueprint ? " nm-card-inbp" : ""}`}
      onClick={open}
      style={onOpen ? { cursor: "pointer" } : undefined}
    >

      {/* Glass bg — bottom fade */}
      <div className="nm-card-glass" />

      {/* Gradient border */}
      <div className="nm-card-border" />

      {/* Bottom accent glow line when in blueprint */}
      <div className="nm-card-accent-line" style={{
        background: `linear-gradient(90deg, transparent, ${item.accent}88, transparent)`,
        opacity: inBlueprint ? 1 : 0,
      }} />

      {/* Miniatura: lo screenshot vero se c'è, altrimenti le iniziali sul
          colore dell'item — mai un riquadro vuoto sopra il testo. */}
      <div className="nm-card-thumb">
        {item.previewUrl
          ? <img src={item.previewUrl} alt="" loading="lazy" decoding="async" />
          : (
            <div className="nm-card-thumb-placeholder" style={{
              background: `radial-gradient(120% 140% at 30% -10%, ${item.accent}33 0%, rgba(9,11,16,0) 62%)`,
            }}>
              <span className="nm-card-thumb-glyph" style={{ color: item.accent }}>
                {initials(item.title)}
              </span>
            </div>
          )}
      </div>

      <div className="nm-card-inner">

        {/* Top row: category tag + type badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: "0.20em",
            textTransform: "uppercase", color: "#FFFFFF",
          }}>
            {item.category}
          </span>
          <span style={{
            fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#FFFFFF",
            padding: "2px 7px",
            border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: 4,
          }}>
            {item.type === "full-site" ? "Full Site" : "Component"}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: DISPLAY, fontSize: 17, fontWeight: 700,
          color: "#fff", margin: 0, lineHeight: 1.25,
          letterSpacing: "-0.015em",
        }}>
          {item.title}
        </h3>

        {/* Description */}
        <p className="hp-body" style={{
          fontFamily: BODY, fontSize: 14, fontWeight: 400,
          lineHeight: 1.70, letterSpacing: "0.005em",
          color: "#FFFFFF",
          margin: 0,
        }}>
          {item.description}
        </p>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04) 60%, transparent)",
        }} />

        {/* Riga sopra: Anteprima apre lo strato senza lasciare la griglia
            (è anche la via da tastiera, la scheda stessa non è focalizzabile
            perché contiene già dei controlli); Full Preview porta dritto
            alla demo vera, in una scheda nuova. Senza demo resta solo
            Anteprima, a piena larghezza — non c'è una pagina vera da aprire. */}
        <div className="nm-card-btn-toprow">
          {onOpen && (
            <button type="button" className="nm-card-btn-primary" onClick={onOpen}
              aria-label={`Anteprima di ${item.title}`}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor"
                strokeWidth="1.4" aria-hidden>
                <rect x="1.2" y="2.2" width="9.6" height="7.6" rx="1.4" />
                <path d="M1.2 4.6h9.6" />
              </svg>
              Anteprima
            </button>
          )}
          {item.demo && (
            <a href={DEMO_HREF[item.demo]} target="_blank" rel="noopener noreferrer"
              className="nm-card-btn-primary">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor"
                strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2 10L10 2M10 2H5.5M10 2v4.5" />
              </svg>
              Full Preview
            </a>
          )}
        </div>

        {/* Azione sotto: resta ancorata al fondo della scheda (margin-top:auto
            nel CSS), qualunque sia la lunghezza del testo sopra. */}
        <button className="nm-card-btn-bp" onClick={handleBlueprint}>
          <span className="nm-card-btn-bp-tag">{inBlueprint ? "[−]" : "[+]"}</span>
          <span className="nm-card-btn-bp-label">
            {added ? "✓ Aggiunto" : inBlueprint ? "Rimuovi" : "Blueprint"}
          </span>
        </button>
      </div>

    </div>
  )
}
