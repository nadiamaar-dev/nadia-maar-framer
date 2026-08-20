import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion"
import Footer from "./components/Footer"
import { CONTACT, mailLink } from "./lib/contact"
import FloatingContact from "./components/FloatingContact"
import Header from "./components/Header"
import Background from "./components/Background"
import { sendContact } from "./lib/sendContact"
import FoundryConfigurator from "./components/foundry/FoundryConfigurator"
import type { VectorId } from "./components/foundry/modules"
import { useLocale } from "./lib/i18n/LocaleContext"
import { useT } from "./lib/i18n/t"
import { SERVICES_STR } from "./lib/i18n/strings/services"

/* ── tokens ── */
const T = {
  bg: "#060C18", text: "#FFFFFF", muted: "#FFFFFF",
  faint: "#FFFFFF", border: "rgba(255,255,255,0.11)",
  accent: "#B83240", accentLt: "#BE3648", accentTx: "#E4697A", green: "#10B981",
  surface: "rgba(255,255,255,0.055)", surfaceHi: "rgba(255,255,255,0.10)",
} as const
const SANS = "'Geist','Space Grotesk',system-ui,sans-serif"
const MONO = "'JetBrains Mono','SF Mono',ui-monospace,monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const BODY: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif", fontSize: "clamp(16px, 1.4vw, 17px)", fontWeight: 400, lineHeight: 1.85, letterSpacing: "0.01em" }
const WRAP: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" }
const ease: [number,number,number,number] = [0.16,1,0.3,1]

const SVC_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; overflow-x: hidden; scroll-behavior: smooth; }
  body { overflow-x: clip; }
  #root { overflow-x: clip; }
  p, li { font-weight: 300; line-height: 1.75; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #060C18; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 4px; }
  ::placeholder { color: rgba(255,255,255,0.22) !important; }
  /* Lo spotlight che inseguiva il cursore è stato rimosso: in home e su
     About le schede sono vetro piatto, senza riflessi mobili. */
  /* Firma verticale, identica per costruzione a quella dell'hero in home:
     stessa famiglia, stesso peso, stessa quasi-invisibilità. Cambia solo la
     tinta del filo, che prende l'accento della pagina. */
  .svc-wordmark {
    position:absolute; right:14px; top:40px; z-index:0; pointer-events:none;
    writing-mode:vertical-rl; transform:rotate(180deg);
    font-family:'Plus Jakarta Sans',system-ui,sans-serif; font-weight:900;
    font-size:clamp(150px,15vw,214px); letter-spacing:-0.04em; line-height:0.84;
    white-space:nowrap; color:rgba(255,255,255,0.018);
    filter:blur(1px); user-select:none;
  }
  @media(max-width:1024px){ .svc-wordmark{ display:none } }
  /* chi ha chiesto meno movimento non deve vedere nastri e orbite girare */
  @media (prefers-reduced-motion: reduce) {
    .svc-motif * { animation:none !important; transition:none !important; }
  }
  @keyframes colon-blink { 0%,100%{opacity:.55} 50%{opacity:.15} }
  .dt-colon { animation: colon-blink 1s ease-in-out infinite; display:inline-block; }
  @media(max-width:768px){
    /* body copy stays at 16px on phones — !important beats the inline size */
    .hp-body { font-size:16px !important; }
    .svc-wrap { padding:0 20px !important; }
    .svc-hero-title { font-size:clamp(32px,8vw,52px) !important; }
    .svc-offer-grid { grid-template-columns:1fr !important; }
    .svc-bento-lead { grid-column:auto !important; }
    .svc-stagger-cell { margin-top:0 !important; }
    .svc-step-row { grid-template-columns:1fr !important; gap:0 !important; }
    .svc-step-num { display:none !important; }
    .svc-nav-desktop { display:none !important; }
    .svc-nav-burger { display:flex !important; }
    .svc-footer-cols { display:none !important; }
    .svc-footer-brand-name { display:flex !important; }
  }
  @media(min-width:769px){ .svc-nav-burger { display:none !important; } }
`

/* ── icons ── */
const ArrowRightIcon = ({size=13}:{size?:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const ArrowLeftIcon = ({size=13}:{size?:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const XIcon = ({size=13}:{size?:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const MailIcon = ({size=15}:{size?:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/>
  </svg>
)
/* ── PingDot ── */
function PingDot({color=T.green,size=10}:{color?:string;size?:number}) {
  return (
    <span style={{position:"relative",display:"inline-flex",width:size,height:size,flexShrink:0}}>
      <motion.span aria-hidden
        style={{position:"absolute",inset:-2,borderRadius:"50%",background:color,opacity:0.55}}
        animate={{scale:[1,3.2],opacity:[0.55,0]}}
        transition={{duration:1.8,repeat:Infinity,ease:"easeOut"}}
      />
      <span style={{width:"100%",height:"100%",borderRadius:"50%",background:color,display:"block",position:"relative"}} />
    </span>
  )
}

/* ── Reveal ── */
/** full: dentro una griglia il wrapper deve occupare tutta la cella, altrimenti
 *  le schede della stessa riga finiscono con altezze diverse. */
function Reveal({children,delay=0,full=false}:{children:React.ReactNode;delay?:number;full?:boolean}) {
  return (
    <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
      viewport={{once:true,margin:"-10% 0px"}} transition={{duration:0.65,delay,ease}}
      style={full?{height:"100%"}:undefined}>
      {children}
    </motion.div>
  )
}


/* ── ScrollProgress ── */
function ScrollProgress() {
  const {scrollYProgress} = useScroll()
  const scaleX = useSpring(scrollYProgress,{stiffness:140,damping:26,mass:0.3})
  return <motion.div aria-hidden style={{position:"fixed",top:0,left:0,right:0,height:2,zIndex:500,transformOrigin:"0% 50%",scaleX,background:"linear-gradient(90deg,rgba(90,40,40,1),#7C222B,#BE3648)",boxShadow:"0 0 12px rgba(184,50,64,0.7)"}} />
}

/* ── ContactModal ── */
function ContactModal({onClose}:{onClose:()=>void}) {
  const t = useT(SERVICES_STR).ui
  const [sent,setSent] = useState(false)
  const [busy,setBusy] = useState(false)
  const [failed,setFailed] = useState(false)
  const [form,setForm] = useState({name:"",email:"",company:"",message:""})
  const set=(k:keyof typeof form)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setForm(f=>({...f,[k]:e.target.value}))
  const inp:React.CSSProperties={width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.20)",borderRadius:10,padding:"12px 16px",color:"#fff",fontFamily:MONO,fontSize:12,letterSpacing:"0.06em",outline:"none",transition:"border-color 0.2s"}
  return createPortalIfNeeded(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{position:"absolute",inset:0,background:"rgba(10,12,16,0.75)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)"}} onClick={onClose} />
      <motion.div initial={{opacity:0,y:24,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:16,scale:0.97}} transition={{duration:0.32,ease}}
        style={{position:"relative",width:"100%",maxWidth:520,background:"rgba(13,18,30,0.94)",backdropFilter:"blur(72px) brightness(0.92) saturate(1.10)",WebkitBackdropFilter:"blur(72px) brightness(0.92) saturate(1.10)",borderRadius:20,padding:"36px 36px 32px",border:"1px solid rgba(255,255,255,0.20)",boxShadow:"inset 0 1.5px 0 rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.08), 0 40px 100px rgba(0,0,0,0.65)",overflow:"hidden"}}>
        <div aria-hidden style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg, transparent, ${T.accent} 28%, ${T.accentLt} 72%, transparent)`}} />
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",cursor:"pointer",color:T.faint,display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:8,transition:"color 0.18s"}}
          onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color=T.faint)}>
          <XIcon size={14} />
        </button>
        {sent ? (
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{fontSize:32,marginBottom:16}}>✓</div>
            <h3 style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:"#fff",marginBottom:8}}>{t.sentTitle}</h3>
            <p style={{fontFamily:MONO,fontSize:12,color:T.faint}}>{t.sentBody}</p>
          </div>
        ) : (
          <>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:T.accentTx,marginBottom:8}}>{t.modalKicker}</div>
            <h3 style={{fontFamily:DISPLAY,fontSize:22,fontWeight:700,color:"#fff",marginBottom:6}}>{t.modalTitle}</h3>
            <p style={{fontFamily:MONO,fontSize:12,color:T.faint,lineHeight:1.7,marginBottom:24}}>{t.modalLead}</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <input placeholder={t.name} value={form.name} onChange={set("name")} style={inp}
                  onFocus={e=>(e.target.style.borderColor="rgba(184,50,64,0.60)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")} />
                <input placeholder={t.email} type="email" value={form.email} onChange={set("email")} style={inp}
                  onFocus={e=>(e.target.style.borderColor="rgba(184,50,64,0.60)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")} />
              </div>
              <input placeholder={t.company} value={form.company} onChange={set("company")} style={inp}
                onFocus={e=>(e.target.style.borderColor="rgba(184,50,64,0.60)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")} />
              <textarea placeholder={t.messagePlaceholder} value={form.message} onChange={set("message")} rows={4}
                style={{...inp,resize:"none" as const,lineHeight:1.65}}
                onFocus={e=>(e.target.style.borderColor="rgba(184,50,64,0.60)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")} />
              {failed && (
                <p role="alert" style={{fontFamily:MONO,fontSize:10.5,letterSpacing:"0.06em",lineHeight:1.6,color:"rgba(255,120,120,0.95)",margin:0}}>
                  {t.failed.replace("{email}", CONTACT.email)}
                </p>
              )}
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} disabled={busy}
                onClick={async()=>{
                  if (busy) return
                  setBusy(true); setFailed(false)
                  const ok = await sendContact({ name: form.name, email: form.email, company: form.company, message: form.message })
                  setBusy(false)
                  if (ok) setSent(true); else setFailed(true)
                }}
                style={{display:"flex",alignItems:"stretch",borderRadius:12,border:"1px solid rgba(184,50,64,0.80)",background:"linear-gradient(90deg,rgba(184,50,64,0.34) 0%,rgba(184,50,64,0.20) 100%)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 0 12px rgba(184,50,64,0.20), inset 0 1px 0 rgba(255,255,255,0.12)",cursor:"pointer",overflow:"hidden",marginTop:4}}>
                <span style={{padding:"12px 14px 12px 16px",borderRight:"1px solid rgba(184,50,64,0.35)",display:"flex",alignItems:"center",fontFamily:MONO,fontSize:8.5,letterSpacing:"0.22em",color:"#FFFFFF",flexShrink:0}}>[→]</span>
                <span style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"12px 20px",fontFamily:MONO,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:"#FFFFFF",fontWeight:500}}>{t.submit}</span>
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

import { createPortal } from "react-dom"
function createPortalIfNeeded(node: React.ReactNode) {
  if (typeof document === "undefined") return null
  return createPortal(node, document.body)
}

/* ══════════════════════════════════════════════════════════════════════════
   SERVICE PAGE CONTENT TYPES & DATA
══════════════════════════════════════════════════════════════════════════ */
interface OfferItem { icon: React.ReactNode; title: string; desc: string }
interface Step      { title: string; desc: string }
/** Il motivo animato che vive nell'hero: uno per servizio, scelto perché
 *  racconta il mestiere invece di essere una decorazione qualsiasi. */
type Motif = "conveyor" | "frame" | "nodes" | "bars" | "orbit"

/** Come si dispongono le schede di "cosa offriamo". */
type OfferLayout = "cards" | "wide" | "rows" | "stagger" | "bento"

/* ── Blocco esclusivo di ogni pagina ────────────────────────────────────────
   Le cinque pagine avevano le stesse identiche sezioni nello stesso ordine.
   Qui ognuna guadagna un blocco che le altre non hanno, scelto per la
   domanda che quel cliente si fa davvero prima di scrivere. */
type ExtraBlock =
  /** e-commerce: che cosa viene verificato prima di dire che è pronto */
  | { kind: "checklist"; kicker: string; heading: string; intro: string; items: string[] }
  /** corporate: due modi di intendere lo stesso sito, messi a confronto */
  | { kind: "compare"; kicker: string; heading: string; left: { title: string; points: string[] }; right: { title: string; points: string[] } }
  /** web app: una giornata prima e dopo l'automazione */
  | { kind: "flow"; kicker: string; heading: string; before: string[]; after: string[] }
  /** SEO: che cosa succede mese per mese, senza promesse di scorciatoie */
  | { kind: "timeline"; kicker: string; heading: string; phases: { when: string; what: string }[] }
  /** AI: dove NON conviene — l'unico modo onesto di parlarne */
  | { kind: "limits"; kicker: string; heading: string; intro: string; items: { t: string; d: string }[] }

/** Ordine delle sezioni: cambia da pagina a pagina. */
type SectionId = "what" | "offer" | "how" | "extra"

interface ServiceData {
  num: string; slug: string; title: string; subtitle: string; eyebrow: string
  gradient: string; accentColor: string
  /** tinta piena del servizio: bordo del motivo, filo delle schede, numeri */
  accent: string
  motif: Motif
  layout: OfferLayout
  /** i tre occhielli di sezione, diversi per servizio: prima erano
   *  "Cosa facciamo / Cosa offriamo / Come lo realizziamo" su tutte e cinque */
  kickers: { what: string; offer: string; how: string }
  /** sequenza delle sezioni, diversa per ogni servizio */
  order: SectionId[]
  extra: ExtraBlock
  whatWeDo: { heading: string; body: string[]; stats: {value:string;label:string}[] }
  whatWeOffer: { heading: string; items: OfferItem[] }
  howWeDoIt: { heading: string; steps: Step[] }
  cta: { heading: string; sub: string; btn: string }
}

const iconStroke = (d: string, ...extra: string[]) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />{extra.map((e, i) => <path key={i} d={e} />)}
  </svg>
)


/** La parte visiva di un servizio: tutto tranne il testo. */
interface ServiceArt {
  num: string; slug: string
  gradient: string; accentColor: string; accent: string
  motif: Motif; layout: OfferLayout
  order: SectionId[]
  extraKind: ExtraBlock["kind"]
  /** Una icona per ogni voce di `offer.items`, nello stesso ordine. */
  icons: React.ReactNode[]
}

/* ── La parte visiva delle cinque pagine ────────────────────────────────────
   Colori, motivo animato, disposizione delle schede, ordine delle sezioni e
   icone: tutto ciò che non è testo. Il testo sta in src/lib/i18n/strings/
   services.ts e si accoppia per posizione con `icons`. */
const SERVICES_ART: Record<string, ServiceArt> = {
  ecommerce: {
    num:"01", slug:"ecommerce",
    gradient:"linear-gradient(135deg,#B8323F 0%,#F0645C 100%)",
    accentColor:"rgba(184,50,63,0.55)",
    accent:"#E1483F",
    motif:"conveyor",
    layout:"cards",
    order:["what","offer","extra","how"],
    extraKind:"checklist",
    icons:[
      iconStroke("M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18","M16 10a4 4 0 01-8 0"),
      iconStroke("M22 12h-4l-3 9L9 3l-3 9H2"),
      iconStroke("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2","M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"),
      iconStroke("M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z","M12 7v5l3 3"),
      iconStroke("M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"),
      iconStroke("M18 20V10","M12 20V4","M6 20v-6"),
    ],
  },
  corporate: {
    num:"02", slug:"corporate",
    gradient:"linear-gradient(135deg,#3E6E8E 0%,#9FC7DE 100%)",
    accentColor:"rgba(62,110,142,0.50)",
    accent:"#5C93B8",
    motif:"frame",
    layout:"wide",
    order:["extra","what","offer","how"],
    extraKind:"compare",
    icons:[
      iconStroke("M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"),
      iconStroke("M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M12 3a4 4 0 010 8 4 4 0 010-8z"),
      iconStroke("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"),
      iconStroke("M22 12h-4l-3 9L9 3l-3 9H2"),
      iconStroke("M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"),
      iconStroke("M18 20V10","M12 20V4","M6 20v-6"),
    ],
  },
  webapp: {
    num:"03", slug:"webapp",
    gradient:"linear-gradient(135deg,#4E7C6B 0%,#8FD3B4 100%)",
    accentColor:"rgba(78,124,107,0.50)",
    accent:"#5FA987",
    motif:"nodes",
    layout:"rows",
    order:["what","extra","offer","how"],
    extraKind:"flow",
    icons:[
      iconStroke("M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"),
      iconStroke("M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 10H2"),
      iconStroke("M13 10V3L4 14h7v7l9-11h-7z"),
      iconStroke("M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"),
      iconStroke("M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z","M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"),
      iconStroke("M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"),
    ],
  },
  seo: {
    num:"04", slug:"seo",
    gradient:"linear-gradient(135deg,#8A6A2F 0%,#E4C06A 100%)",
    accentColor:"rgba(138,106,47,0.50)",
    accent:"#C9A052",
    motif:"bars",
    layout:"stagger",
    order:["what","offer","how","extra"],
    extraKind:"timeline",
    icons:[
      iconStroke("M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"),
      iconStroke("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"),
      iconStroke("M4 6h16M4 12h16M4 18h7"),
      iconStroke("M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"),
      iconStroke("M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"),
      iconStroke("M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"),
    ],
  },
  ai: {
    num:"05", slug:"ai",
    gradient:"linear-gradient(135deg,#6A4C93 0%,#B79CE0 100%)",
    accentColor:"rgba(106,76,147,0.50)",
    accent:"#9070C4",
    motif:"orbit",
    layout:"bento",
    order:["what","extra","offer","how"],
    extraKind:"limits",
    icons:[
      iconStroke("M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.575 1.548M19.8 15H4.2",""),
      iconStroke("M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"),
      iconStroke("M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"),
      iconStroke("M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18","M16 10a4 4 0 01-8 0"),
      iconStroke("M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"),
      iconStroke("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"),
    ],
  },
}

/**
 * Disegno + testo → la pagina completa, nella lingua che si sta leggendo.
 *
 * L'unione avviene qui e non a mano in cinque punti: se domani si aggiunge
 * una lingua, non c'è nessun altro posto da toccare. Le icone si accoppiano
 * per posizione con le voci di `offer`; se il dizionario ne ha una in più,
 * quella scheda resta senza simbolo invece di far esplodere la pagina.
 */
type ServiceSlug = "ecommerce" | "corporate" | "webapp" | "seo" | "ai"
type ServiceText = (typeof SERVICES_STR)["it"][ServiceSlug]

function buildService(art: ServiceArt, txt: ServiceText): ServiceData {
  const extra = { kind: art.extraKind, ...txt.extra } as ExtraBlock
  return {
    num: art.num, slug: art.slug,
    title: txt.title, subtitle: txt.subtitle, eyebrow: txt.eyebrow,
    gradient: art.gradient, accentColor: art.accentColor, accent: art.accent,
    motif: art.motif, layout: art.layout,
    kickers: txt.kickers,
    order: art.order,
    extra,
    whatWeDo: txt.whatWeDo,
    whatWeOffer: {
      heading: txt.offer.heading,
      items: txt.offer.items.map((item, i) => ({ ...item, icon: art.icons[i] ?? null })),
    },
    howWeDoIt: txt.how,
    cta: txt.cta,
  }
}

/** La pagina del servizio richiesto, già tradotta. */
function useService(slug: ServiceSlug): ServiceData {
  const txt = useT(SERVICES_STR)
  return buildService(SERVICES_ART[slug], txt[slug])
}

/** Le altre quattro pagine, per la striscia in fondo: numero, titolo e
 *  occhiello, che è tutto ciò che quella striscia mostra. */
function useOtherServices(current: string): { slug: string; num: string; title: string; eyebrow: string }[] {
  const txt = useT(SERVICES_STR)
  return (Object.keys(SERVICES_ART) as ServiceSlug[])
    .filter(slug => slug !== current)
    .map(slug => ({ slug, num: SERVICES_ART[slug].num, title: txt[slug].title, eyebrow: txt[slug].eyebrow }))
}

/* ══════════════════════════════════════════════════════════════════════════
   SERVICE PAGE TEMPLATE
══════════════════════════════════════════════════════════════════════════ */
/** #RRGGBB + alfa → rgba(). Gli accenti sono definiti in esadecimale una
 *  volta sola, e da lì si ricavano bordi e velature senza duplicarli. */
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "")
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/* ══════════════════════════════════════════════════════════════════════════
   MOTIVI DELL'HERO — uno per servizio
   Tutti in SVG e a bassissimo contrasto: devono leggersi come una filigrana
   dietro al titolo, non competere con il testo. Rispettano prefers-reduced-
   motion tramite la classe svc-motif, che ferma le animazioni.
══════════════════════════════════════════════════════════════════════════ */
function HeroMotif({ motif, accent }: { motif: Motif; accent: string }) {
  const line = hexA(accent, 0.30)
  const soft = hexA(accent, 0.13)
  const base: React.CSSProperties = {
    position: "absolute", inset: 0, width: "100%", height: "100%",
    pointerEvents: "none", zIndex: 0,
  }

  if (motif === "conveyor") {
    /* e-commerce: nastri che scorrono, come merce che si muove */
    return (
      <svg style={base} className="svc-motif" viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden>
        {[70, 140, 210, 280, 350].map((y, i) => (
          <g key={y}>
            <line x1="0" y1={y} x2="1200" y2={y} stroke={soft} strokeWidth="1" />
            <motion.rect y={y - 7} width="46" height="14" rx="3" fill="none" stroke={line} strokeWidth="1.1"
              initial={{ x: -60 }} animate={{ x: 1260 }}
              transition={{ duration: 13 + i * 2.5, repeat: Infinity, ease: "linear", delay: i * 1.7 }} />
          </g>
        ))}
      </svg>
    )
  }

  if (motif === "frame") {
    /* corporate: cornici concentriche che respirano — ordine, misura */
    return (
      <svg style={base} className="svc-motif" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {[0, 1, 2, 3].map(i => (
          <motion.rect key={i}
            x={860 - i * 78} y={40 - i * 26} width={260 + i * 156} height={260 + i * 52} rx="4"
            fill="none" stroke={i === 0 ? line : soft} strokeWidth="1"
            animate={{ opacity: [0.35, 0.85, 0.35] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }} />
        ))}
      </svg>
    )
  }

  if (motif === "nodes") {
    /* web app: nodi collegati che pulsano — sistemi che si parlano */
    const N = [[880, 90], [1050, 150], [960, 250], [1120, 300], [820, 240]]
    return (
      <svg style={base} className="svc-motif" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {N.map(([x, y], i) => N.slice(i + 1).map(([x2, y2], j) => (
          <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke={soft} strokeWidth="0.8" />
        )))}
        {N.map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="5" fill="none" stroke={line} strokeWidth="1.2"
            animate={{ r: [4, 8, 4], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.55 }} />
        ))}
      </svg>
    )
  }

  if (motif === "bars") {
    /* SEO: colonne che salgono a ritmi diversi — la crescita non è lineare */
    return (
      <svg style={base} className="svc-motif" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <line x1="820" y1="340" x2="1160" y2="340" stroke={soft} strokeWidth="1" />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <motion.rect key={i} x={840 + i * 52} width="30" rx="2" fill="none" stroke={line} strokeWidth="1.1"
            initial={{ height: 20, y: 320 }}
            animate={{ height: [20, 60 + i * 26, 20], y: [320, 340 - (60 + i * 26), 320] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }} />
        ))}
      </svg>
    )
  }

  /* AI: anelli in orbita attorno a un nucleo */
  return (
    <svg style={base} className="svc-motif" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <circle cx="1000" cy="200" r="6" fill="none" stroke={line} strokeWidth="1.4" />
      {[52, 92, 132, 172].map((r, i) => (
        <motion.ellipse key={r} cx="1000" cy="200" rx={r} ry={r * 0.42}
          fill="none" stroke={i % 2 ? soft : line} strokeWidth="1"
          style={{ transformOrigin: "1000px 200px" }}
          animate={{ rotate: i % 2 ? [0, 360] : [360, 0] }}
          transition={{ duration: 26 + i * 9, repeat: Infinity, ease: "linear" }} />
      ))}
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   GRIGLIA DELL'OFFERTA — una disposizione per servizio
   Le cinque pagine condividevano la stessa griglia a tre colonne: leggendole
   una dopo l'altra sembravano la stessa pagina con parole diverse. La scheda
   resta una sola, cambia come si dispone e quanto respira.
══════════════════════════════════════════════════════════════════════════ */
function OfferGrid({ data }: { data: ServiceData }) {
  const items = data.whatWeOffer.items
  const L = data.layout

  /* rows: una colonna larga, la scheda diventa una riga con il filo a sinistra */
  if (L === "rows") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <OfferCard item={item} gradient={data.gradient} accent={data.accent} index={i} variant="row" />
          </Reveal>
        ))}
      </div>
    )
  }

  /* wide: due colonne, più aria — adatto a un pubblico che legge, non scorre */
  if (L === "wide") {
    return (
      <div className="svc-offer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 0.06} full>
            <OfferCard item={item} gradient={data.gradient} accent={data.accent} index={i} variant="wide" />
          </Reveal>
        ))}
      </div>
    )
  }

  /* stagger: tre colonne sfalsate in verticale, come posizioni in classifica */
  if (L === "stagger") {
    return (
      <div className="svc-offer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, alignItems: "start" }}>
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 0.06} full>
            <div className="svc-stagger-cell" style={{ marginTop: (i % 3) * 26, height: "100%" }}>
              <OfferCard item={item} gradient={data.gradient} accent={data.accent} index={i} />
            </div>
          </Reveal>
        ))}
      </div>
    )
  }

  /* bento: la prima occupa due colonne — c'è sempre un ambito che pesa di più */
  if (L === "bento") {
    /* La prima scheda occupa due colonne, le altre una: con sei voci restano
       due righe piene e l'ultima si ritrovava sola in un terzo di riga, con
       due buchi accanto. L'ultima prende quindi lo spazio che avanza — con
       sei voci è una fascia a tutta larghezza, che chiude il blocco invece
       di lasciarlo a metà. */
    const n = items.length
    const lastSpan = (3 - (n % 3)) % 3 || 3
    const span = (i: number) => i === 0 ? 2 : i === n - 1 ? lastSpan : 1
    return (
      <div className="svc-offer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {/* lo span deve stare sull'elemento della griglia, non dentro Reveal:
            altrimenti a occupare due colonne sarebbe il wrapper dell'animazione */}
        {items.map((item, i) => {
          const s = span(i)
          return (
            <div key={i} className={s > 1 ? "svc-bento-lead" : undefined}
              style={s > 1 ? { gridColumn: `span ${s}` } : undefined}>
              <Reveal delay={i * 0.06} full>
                <OfferCard item={item} gradient={data.gradient} accent={data.accent} index={i}
                  variant={s === 3 ? "row" : s === 2 ? "wide" : "card"} />
              </Reveal>
            </div>
          )
        })}
      </div>
    )
  }

  /* cards: tre colonne piane, la disposizione di partenza */
  return (
    <div className="svc-offer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
      {items.map((item, i) => (
        <Reveal key={i} delay={i * 0.06} full>
          <OfferCard item={item} gradient={data.gradient} accent={data.accent} index={i} />
        </Reveal>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SEZIONI — escono nell'ordine dichiarato in data.order
══════════════════════════════════════════════════════════════════════════ */
const SEC: React.CSSProperties = { padding: "88px 0", borderBottom: "1px solid rgba(255,255,255,0.12)" }

function SecHead({ kicker, heading, accent, gap = 48 }: { kicker: string; heading: string; accent: string; gap?: number }) {
  return (
    <Reveal>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
        <span style={{ color: accent }}>//</span><span>[ {kicker} ]</span>
      </div>
      <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(22px,2.8vw,38px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#FFFFFF", marginBottom: gap }}>
        {heading}
      </h2>
    </Reveal>
  )
}

function PageSection({ id, data }: { id: SectionId; data: ServiceData }) {
  if (id === "what") {
    return (
      <section style={SEC}>
        <div style={{ ...WRAP }} className="svc-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px 80px", alignItems: "start" }} className="svc-what-grid">
            <style>{`.svc-what-grid{@media(max-width:768px){grid-template-columns:1fr!important}}`}</style>
            <div>
              <Reveal>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 20 }}>
                  <span style={{ color: data.accent }}>//</span><span>[ {data.kickers.what} ]</span>
                </div>
                <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(22px,2.8vw,38px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#FFFFFF", marginBottom: 28 }}>
                  {data.whatWeDo.heading}
                </h2>
                {data.whatWeDo.body.map((p, i) => (
                  <p key={i} style={{ ...BODY, color: T.muted, marginBottom: i < data.whatWeDo.body.length - 1 ? 20 : 0 }}>{p}</p>
                ))}
              </Reveal>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.whatWeDo.stats.map((s, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.25, ease }}
                    style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 24px", borderRadius: 14, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.13)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: data.gradient, borderRadius: "16px 0 0 16px" }} />
                    <div style={{ paddingLeft: 8 }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: 32, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: T.faint, marginTop: 6 }}>{s.label}</div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (id === "offer") {
    return (
      <section style={SEC}>
        <div style={{ ...WRAP }} className="svc-wrap">
          <SecHead kicker={data.kickers.offer} heading={data.whatWeOffer.heading} accent={data.accent} />
          <OfferGrid data={data} />
        </div>
      </section>
    )
  }

  if (id === "how") {
    return (
      <section style={SEC}>
        <div style={{ ...WRAP }} className="svc-wrap">
          <SecHead kicker={data.kickers.how} heading={data.howWeDoIt.heading} accent={data.accent} gap={56} />
          <div style={{ position: "relative" }}>
            <div aria-hidden style={{ position: "absolute", left: 28, top: 48, bottom: 48, width: 1, background: `linear-gradient(180deg, ${hexA(data.accent, 0.55)}, ${hexA(data.accent, 0.06)})`, zIndex: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {data.howWeDoIt.steps.map((step, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <ProcessStep step={step} index={i} total={data.howWeDoIt.steps.length} gradient={data.gradient} accentColor={data.accentColor} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return <ExtraSection data={data} />
}

/* ══════════════════════════════════════════════════════════════════════════
   BLOCCO ESCLUSIVO — cinque forme, una per servizio
══════════════════════════════════════════════════════════════════════════ */
function ExtraSection({ data }: { data: ServiceData }) {
  const t = useT(SERVICES_STR).ui
  const e = data.extra
  const A = data.accent
  const head = <SecHead kicker={e.kicker} heading={e.heading} accent={A} gap={"intro" in e ? 22 : 44} />
  const intro = "intro" in e && e.intro
    ? <Reveal><p style={{ ...BODY, color: T.muted, maxWidth: 720, marginBottom: 44 }}>{e.intro}</p></Reveal>
    : null

  /* e-commerce — elenco di verifiche, due colonne, segno di spunta nell'accento */
  if (e.kind === "checklist") {
    return (
      <section style={SEC}>
        <div style={{ ...WRAP }} className="svc-wrap">
          {head}{intro}
          <style>{`.svc-check{display:grid;grid-template-columns:1fr 1fr;gap:14px 40px}@media(max-width:768px){.svc-check{grid-template-columns:1fr!important}}`}</style>
          <div className="svc-check">
            {e.items.map((it, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <span aria-hidden style={{ flexShrink: 0, marginTop: 3, width: 16, height: 16, borderRadius: 4, border: `1px solid ${hexA(A, 0.55)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke={A} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <span style={{ ...BODY, fontSize: 15, lineHeight: 1.6, color: T.muted }}>{it}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  /* corporate — due colonne a confronto, quella giusta con il filo colorato */
  if (e.kind === "compare") {
    const col = (c: { title: string; points: string[] }, good: boolean) => (
      <div style={{ position: "relative", borderRadius: 16, padding: "30px 28px", background: good ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.008)", border: `1px solid ${good ? hexA(A, 0.34) : "rgba(255,255,255,0.10)"}`, height: "100%", boxSizing: "border-box" as const }}>
        <h3 style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 700, color: good ? "#FFFFFF" : "rgba(255,255,255,0.62)", margin: "0 0 6px" }}>{c.title}</h3>
        <div aria-hidden style={{ width: 28, height: 1.5, background: good ? A : "rgba(255,255,255,0.18)", borderRadius: 2, marginBottom: 20 }} />
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 13 }}>
          {c.points.map((pt, i) => (
            <li key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <span aria-hidden style={{ flexShrink: 0, marginTop: 8, width: 5, height: 5, borderRadius: "50%", background: good ? A : "rgba(255,255,255,0.24)" }} />
              <span style={{ ...BODY, fontSize: 14.5, lineHeight: 1.62, color: good ? T.muted : "rgba(255,255,255,0.55)" }}>{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    )
    return (
      <section style={SEC}>
        <div style={{ ...WRAP }} className="svc-wrap">
          {head}
          <style>{`.svc-cmp{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:stretch}@media(max-width:768px){.svc-cmp{grid-template-columns:1fr!important}}`}</style>
          <div className="svc-cmp">
            <Reveal full>{col(e.left, false)}</Reveal>
            <Reveal delay={0.08} full>{col(e.right, true)}</Reveal>
          </div>
        </div>
      </section>
    )
  }

  /* web app — prima e dopo, due colonne con la freccia in mezzo */
  if (e.kind === "flow") {
    const list = (title: string, rows: string[], good: boolean) => (
      <div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: good ? A : "rgba(255,255,255,0.45)", marginBottom: 18 }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "14px 16px", borderRadius: 11, background: good ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.008)", border: `1px solid ${good ? hexA(A, 0.26) : "rgba(255,255,255,0.09)"}` }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: good ? A : "rgba(255,255,255,0.35)", flexShrink: 0, marginTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ ...BODY, fontSize: 14.5, lineHeight: 1.6, color: good ? T.muted : "rgba(255,255,255,0.55)", textDecoration: good ? "none" : "line-through", textDecorationColor: "rgba(255,255,255,0.22)" }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    )
    return (
      <section style={SEC}>
        <div style={{ ...WRAP }} className="svc-wrap">
          {head}
          <style>{`.svc-flow{display:grid;grid-template-columns:1fr 1fr;gap:40px}@media(max-width:768px){.svc-flow{grid-template-columns:1fr!important;gap:32px}}`}</style>
          <div className="svc-flow">
            <Reveal>{list(t.flowBefore, e.before, false)}</Reveal>
            <Reveal delay={0.1}>{list(t.flowAfter, e.after, true)}</Reveal>
          </div>
        </div>
      </section>
    )
  }

  /* SEO — linea del tempo orizzontale, quattro tappe */
  if (e.kind === "timeline") {
    return (
      <section style={SEC}>
        <div style={{ ...WRAP }} className="svc-wrap">
          {head}
          <style>{`.svc-tl{display:grid;grid-template-columns:repeat(4,1fr);gap:0}@media(max-width:900px){.svc-tl{grid-template-columns:1fr!important;gap:26px}.svc-tl-line{display:none!important}}`}</style>
          <div style={{ position: "relative" }}>
            <div className="svc-tl-line" aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 7, height: 1, background: `linear-gradient(90deg, ${hexA(A, 0.5)}, ${hexA(A, 0.12)})` }} />
            <div className="svc-tl">
              {e.phases.map((ph, i) => (
                <Reveal key={i} delay={i * 0.09}>
                  <div style={{ paddingRight: 26, position: "relative" }}>
                    <motion.span aria-hidden
                      style={{ display: "block", width: 15, height: 15, borderRadius: "50%", border: `1px solid ${hexA(A, 0.75)}`, background: "#060C18", marginBottom: 22 }}
                      animate={{ boxShadow: [`0 0 0 0 ${hexA(A, 0.30)}`, `0 0 0 9px ${hexA(A, 0)}`] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: i * 0.5 }} />
                    <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: A, marginBottom: 10 }}>{ph.when}</div>
                    <p style={{ ...BODY, fontSize: 14.5, lineHeight: 1.65, color: T.muted, margin: 0 }}>{ph.what}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  /* AI — dove non conviene: righe sobrie, nessuna icona allegra */
  return (
    <section style={SEC}>
      <div style={{ ...WRAP }} className="svc-wrap">
        {head}{intro}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {e.items.map((it, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, padding: "24px 0", borderTop: i === 0 ? "1px solid rgba(255,255,255,0.10)" : "none", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                <span aria-hidden style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: hexA(A, 0.75), paddingTop: 4 }}>—</span>
                <div>
                  <h3 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: "#FFFFFF", margin: "0 0 8px" }}>{it.t}</h3>
                  <p style={{ ...BODY, fontSize: 15, lineHeight: 1.68, color: T.muted, margin: 0 }}>{it.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServicePage({data}:{data:ServiceData}) {
  const ui = useT(SERVICES_STR).ui
  const { href: L } = useLocale()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{background:T.bg,color:T.text,fontFamily:"'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,system-ui,sans-serif",minHeight:"100vh",position:"relative"}}>
      <style dangerouslySetInnerHTML={{__html:SVC_CSS}} />
      <ScrollProgress />
      <Background />
      <FloatingContact />
      <Header />
      <AnimatePresence>{modalOpen && <ContactModal onClose={()=>setModalOpen(false)} />}</AnimatePresence>

      <div style={{position:"relative",zIndex:1,paddingTop:64}}>

        {/* ── HERO ── */}
        <section style={{padding:"80px 0 72px",borderBottom:`1px solid rgba(255,255,255,0.12)`,position:"relative",overflow:"hidden"}}>
          {/* Motivo animato: uno per servizio. Non è decorazione generica —
              ognuno prova a dire il mestiere della pagina in cui sta. */}
          <HeroMotif motif={data.motif} accent={data.accent} />
          {/* Stessa firma verticale dell'hero in home, tinta con l'accento
              della pagina, così le cinque schermate restano riconoscibili
              come parte dello stesso sito. */}
          <div className="svc-wordmark" aria-hidden style={{WebkitTextStroke:`1px ${hexA(data.accent,0.16)}`}}>MAAR</div>
          <div style={{...WRAP,position:"relative",zIndex:1}} className="svc-wrap">
            {/* breadcrumb */}
            <Reveal>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
                <motion.a href={L("/")} whileHover={{x:-2}} style={{display:"inline-flex",alignItems:"center",gap:6,fontFamily:MONO,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:T.faint,textDecoration:"none",transition:"color 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color=T.faint)}>
                  <ArrowLeftIcon size={10} /> {ui.home}
                </motion.a>
                <span style={{color:"#FFFFFF"}}>·</span>
                <span style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:data.accent}}>{data.eyebrow}</span>
              </div>
            </Reveal>

            <Reveal delay={0.04}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:MONO,fontSize:10.5,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:"#FFFFFF",marginBottom:20}}>
                <span style={{color:data.accent}}>//</span>
                <span>[ {data.num} · Servizio ]</span>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="svc-hero-title" style={{fontFamily:DISPLAY,fontSize:"clamp(36px,5.5vw,72px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-0.03em",color:"#FFFFFF",maxWidth:840,marginBottom:24}}>
                {data.title}
              </h1>
            </Reveal>

            <Reveal delay={0.14}>
              <p style={{...BODY,color:T.muted,maxWidth:620,marginBottom:40}}>
                {data.subtitle}
              </p>
            </Reveal>

            <Reveal delay={0.20}>
              <div style={{display:"flex",gap:12,flexWrap:"wrap" as const,alignItems:"center"}}>
                <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                  onClick={()=>setModalOpen(true)}
                  style={{display:"flex",alignItems:"stretch",borderRadius:12,border:`1px solid ${hexA(data.accent,0.80)}`,background:`linear-gradient(90deg,${hexA(data.accent,0.30)} 0%,${hexA(data.accent,0.17)} 100%)`,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.12)",cursor:"pointer",overflow:"hidden"}}>
                  <span style={{padding:"14px 12px 14px 16px",borderRight:`1px solid ${hexA(data.accent,0.35)}`,display:"flex",alignItems:"center",fontFamily:MONO,fontSize:8.5,letterSpacing:"0.22em",color:"#FFFFFF",flexShrink:0}}>[{data.num}]</span>
                  <span style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"14px 22px",fontFamily:MONO,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:"#FFFFFF",fontWeight:500}}>
                    {data.cta.btn} <ArrowRightIcon size={11} />
                  </span>
                </motion.button>
                <motion.a href={L("/")} whileHover={{x:-2}} style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:MONO,fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase" as const,color:T.faint,textDecoration:"none",transition:"color 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color=T.faint)}>
                  <ArrowLeftIcon size={10} /> {ui.allServices}
                </motion.a>
              </div>
            </Reveal>

            {/* accent glow orb */}
            {/* il bagliore colorato dietro al titolo è stato tolto: il fondo
                arriva già da <Background />, come in home e su About, e una
                seconda sorgente luminosa per pagina spezzava la continuità */}
          </div>
        </section>

        {/* Le sezioni escono nell'ordine dichiarato dal servizio: su corporate
            il confronto apre la pagina, su web app la giornata tipo arriva
            subito dopo il problema, sulla SEO la linea del tempo chiude. */}
        {data.order.map(id => <PageSection key={id} id={id} data={data} />)}

        {/* ── CTA ── */}
        <section style={{padding:"100px 0 80px"}}>
          <div style={{...WRAP}} className="svc-wrap">
            <Reveal>
              <motion.div transition={{duration:0.4,ease}}
                style={{position:"relative",borderRadius:16,padding:"64px 56px",background:"rgba(255,255,255,0.012)",border:"1px solid rgba(255,255,255,0.13)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.07)",overflow:"hidden",textAlign:"center"}}>
                <div aria-hidden style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${data.accentColor},transparent)`}} />

                <div style={{position:"relative",zIndex:1}}>
                  <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"7px 16px",borderRadius:9999,background:"rgba(184,50,64,0.10)",border:"1px solid rgba(184,50,64,0.35)",marginBottom:24}}>
                    <PingDot color={data.accent} size={6} />
                    <span style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.20em",textTransform:"uppercase" as const,color:data.accent}}>Disponibile · 2026</span>
                  </div>
                  <h2 style={{fontFamily:DISPLAY,fontSize:"clamp(24px,3.2vw,44px)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.025em",color:"#FFFFFF",marginBottom:18,maxWidth:640,margin:"0 auto 18px"}}>
                    {data.cta.heading}
                  </h2>
                  <p style={{...BODY,color:T.muted,maxWidth:500,margin:"0 auto 36px"}}>
                    {data.cta.sub}
                  </p>
                  <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap" as const}}>
                    <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                      onClick={()=>setModalOpen(true)}
                      style={{display:"flex",alignItems:"stretch",borderRadius:12,border:`1px solid ${hexA(data.accent,0.80)}`,background:`linear-gradient(90deg,${hexA(data.accent,0.30)} 0%,${hexA(data.accent,0.17)} 100%)`,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.12)",cursor:"pointer",overflow:"hidden"}}>
                      <span style={{padding:"14px 12px 14px 16px",borderRight:`1px solid ${hexA(data.accent,0.35)}`,display:"flex",alignItems:"center",fontFamily:MONO,fontSize:8.5,letterSpacing:"0.22em",color:"#FFFFFF",flexShrink:0}}>[{data.num}]</span>
                      <span style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"14px 24px",fontFamily:MONO,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:"#FFFFFF",fontWeight:500}}>
                        {data.cta.btn} <ArrowRightIcon size={11} />
                      </span>
                    </motion.button>
                    <motion.a href={mailLink()} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                      style={{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 22px",borderRadius:12,border:`1px solid ${T.border}`,background:"rgba(255,255,255,0.04)",fontFamily:MONO,fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase" as const,color:T.faint,textDecoration:"none",transition:"all 0.2s"}}
                      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color="#fff";el.style.borderColor="rgba(255,255,255,0.28)"}}
                      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color=T.faint;el.style.borderColor=T.border}}>
                      <MailIcon size={13} /> Scrivici
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        {/* Stesso widget della home, ma con il nucleo già impostato su questa
            pagina: gli id dei vettori e gli slug dei servizi coincidono uno a
            uno. Senza, il primo passo avrebbe chiesto di scegliere fra i
            cinque servizi a chi ne sta già leggendo uno. */}
        <div id="configuratore">
          <FoundryConfigurator initialVector={data.slug as VectorId} />
        </div>

        <OtherServices current={data.slug} />

        <Footer onContact={()=>setModalOpen(true)} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ALTRI SERVIZI
   Chi arrivava su una di queste pagine — spesso da una ricerca, non dalla
   home — si trovava in un vicolo cieco: le altre quattro non erano linkate
   da nessuna parte, né qui né nel menu.
══════════════════════════════════════════════════════════════════════════ */
/* slug → rotta: "webapp" nei dati, "/web-app" nell'URL */
const SERVICE_ROUTE: Record<string, string> = {
  ecommerce: "/ecommerce", corporate: "/corporate", webapp: "/web-app", seo: "/seo", ai: "/ai",
}

function OtherServices({ current }: { current: string }) {
  const t = useT(SERVICES_STR).ui
  const { href: L } = useLocale()
  const others = useOtherServices(current)
  return (
    <section style={{ padding: "72px 0", borderTop: `1px solid ${T.border}`, position: "relative" }}>
      <div style={WRAP}>
        <style>{`
          .svc-others { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
          @media(max-width:900px){ .svc-others{grid-template-columns:repeat(2,1fr)!important;} }
          @media(max-width:560px){ .svc-others{grid-template-columns:1fr!important;} }
        `}</style>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "#FFFFFF", marginBottom: 18 }}>
          <span style={{ color: T.accentTx }}>//</span><span>[ {t.otherServices} ]</span>
        </div>
        <div className="svc-others">
          {others.map(s => (
            <a key={s.slug} href={L(SERVICE_ROUTE[s.slug] ?? "/")}
              style={{
                display: "flex", flexDirection: "column" as const, gap: 8,
                padding: "20px 18px", borderRadius: 12, textDecoration: "none",
                background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.13)",
                backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                transition: "background 0.2s, border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.03)"; el.style.borderColor = "rgba(255,255,255,0.26)"; el.style.transform = "translateY(-2px)" }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.012)"; el.style.borderColor = "rgba(255,255,255,0.13)"; el.style.transform = "none" }}
            >
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".18em", color: T.accentTx }}>[ {s.num} ]</span>
              <span style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, lineHeight: 1.28, letterSpacing: "-0.015em", color: "#FFFFFF" }}>{s.title}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "#FFFFFF", opacity: 0.72 }}>{s.eyebrow}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── OfferCard ── */
/** Stessa costruzione della scheda in home (StudioApproach): vetro con la
 *  base che sfuma, bordo a gradiente che si spegne a metà, numero grande in
 *  filigrana dietro al contenuto. Cambia la tinta, che qui è quella della
 *  pagina invece del rosso del sito.
 *  variant: "card" verticale · "wide" più distesa · "row" a riga intera */
function OfferCard({item,gradient,accent,index=0,variant="card"}:{item:OfferItem;gradient:string;accent:string;index?:number;variant?:"card"|"wide"|"row"}) {
  const [hov,setHov] = useState(false)
  const row = variant === "row"
  const num = String(index + 1).padStart(2, "0")
  return (
    <motion.div
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      whileHover={row?{x:4}:{y:-5}} transition={{duration:0.28,ease}}
      style={{position:"relative",borderRadius:16,overflow:"hidden",height:"100%",
        boxShadow:"0 4px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.09)"}}>

      {/* vetro con la base che sfuma */}
      <div aria-hidden style={{position:"absolute",inset:0,borderRadius:16,background:"rgba(255,255,255,0.008)",
        backdropFilter:"blur(6px) brightness(1.03)",WebkitBackdropFilter:"blur(6px) brightness(1.03)",
        WebkitMaskImage:"linear-gradient(to bottom, black 40%, transparent 85%)",
        maskImage:"linear-gradient(to bottom, black 40%, transparent 85%)",pointerEvents:"none"}} />

      {/* bordo a gradiente: pieno in alto, spento a metà scheda */}
      <div aria-hidden style={{position:"absolute",inset:0,borderRadius:16,padding:1,
        background:`linear-gradient(to bottom, ${hov?"rgba(255,255,255,0.60)":"rgba(255,255,255,0.53)"} 0%, transparent 52%)`,
        WebkitMask:"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite:"xor",maskComposite:"exclude",pointerEvents:"none",zIndex:2,transition:"background 0.28s"}} />

      {/* numero in filigrana, nella tinta della pagina */}
      <div aria-hidden style={{position:"absolute",bottom:row?-24:-10,right:16,fontFamily:DISPLAY,
        fontSize:row?96:130,fontWeight:900,lineHeight:1,letterSpacing:"-0.06em",
        color:hexA(accent,0.11),userSelect:"none" as const,pointerEvents:"none",zIndex:1}}>{num}</div>

      <div style={{position:"relative",zIndex:3,height:"100%",boxSizing:"border-box" as const,
        padding: row ? "22px 26px" : variant === "wide" ? "30px 28px 38px" : "28px 26px 36px",
        display:"flex",flexDirection: row ? "row" : "column",alignItems: row ? "flex-start" : "stretch",gap: row ? 20 : 0}}>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom: row?0:26,flexShrink:0}}>
          <div style={{width: row?38:40,height: row?38:40,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",
            background:hov?gradient:"rgba(255,255,255,0.09)",border:`1px solid ${hov?"transparent":"rgba(255,255,255,0.24)"}`,
            color:"#FFFFFF",transition:"background 0.3s,border-color 0.3s"}}>
            {item.icon}
          </div>
          {!row && <span style={{fontFamily:MONO,fontSize:9,fontWeight:600,letterSpacing:"0.22em",color:"#FFFFFF"}}>[ {num} ]</span>}
        </div>

        <div style={{display:"flex",flexDirection:"column",flex:1}}>
          <h3 style={{fontFamily:DISPLAY,fontWeight:700,fontSize: variant==="wide"?21:20,lineHeight:1.22,letterSpacing:"-0.02em",color:"#FFFFFF",margin:"0 0 14px"}}>{item.title}</h3>
          <div aria-hidden style={{width:28,height:1.5,background:`linear-gradient(90deg, ${accent}, transparent)`,marginBottom:14,borderRadius:2,opacity:hov?1:0.55,transition:"opacity 0.28s"}} />
          <p className="hp-body" style={{fontFamily:SANS,fontSize: variant==="wide"?15.5:15,lineHeight:1.72,color:T.muted,margin:0,flex:1}}>{item.desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ── ProcessStep ── */
function ProcessStep({step,index,total,gradient,accentColor}:{step:Step;index:number;total:number;gradient:string;accentColor:string}) {
  const [hov,setHov] = useState(false)
  const isLast = index === total-1
  return (
    <motion.div onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      style={{display:"grid",gridTemplateColumns:"56px 1fr",gap:"0 28px",paddingBottom:isLast?0:40,position:"relative",zIndex:1}} className="svc-step-row">
      {/* step number circle */}
      <div className="svc-step-num" style={{display:"flex",justifyContent:"center",paddingTop:4}}>
        <motion.div animate={{scale:hov?1.08:1,background:hov?gradient:"rgba(255,255,255,0.06)"}} transition={{duration:0.25}}
          style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${hov?accentColor:"rgba(255,255,255,0.16)"}`,flexShrink:0,position:"relative",zIndex:2,fontFamily:MONO,fontSize:10,fontWeight:600,color:hov?"#fff":"#FFFFFF",letterSpacing:"0.10em",boxShadow:hov?`0 0 20px ${accentColor}`:"none",transition:"box-shadow 0.25s,border-color 0.25s"}}>
          {String(index+1).padStart(2,"0")}
        </motion.div>
      </div>
      {/* content */}
      <motion.div animate={{x:hov?4:0}} transition={{duration:0.22}}
        style={{padding:"0 0 0 4px"}}>
        <h3 style={{fontFamily:DISPLAY,fontSize:18,fontWeight:700,color:"#FFFFFF",lineHeight:1.25,marginBottom:10}}>{step.title}</h3>
        <p className="hp-body" style={{fontFamily:"'Inter',sans-serif",fontSize:14.5,color:T.muted,lineHeight:1.78}}>{step.desc}</p>
        {!isLast && <div style={{width:"100%",height:1,background:"rgba(255,255,255,0.05)",marginTop:32}} />}
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   NAMED EXPORTS — one per route
══════════════════════════════════════════════════════════════════════════ */
export function EcommercePage()  { return <ServicePage data={useService("ecommerce")} /> }
export function CorporatePage()  { return <ServicePage data={useService("corporate")} /> }
export function WebAppPage()     { return <ServicePage data={useService("webapp")} /> }
export function SeoPage()        { return <ServicePage data={useService("seo")} /> }
export function AiPage()         { return <ServicePage data={useService("ai")} /> }
