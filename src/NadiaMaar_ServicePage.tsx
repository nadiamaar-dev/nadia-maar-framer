import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion"
import Footer from "./components/Footer"
import FloatingContact from "./components/FloatingContact"
import Header from "./components/Header"
import Background from "./components/Background"

/* ── tokens ── */
const T = {
  bg: "#060C18", text: "#F0F3F9", muted: "rgba(255,255,255,0.78)",
  faint: "rgba(255,255,255,0.58)", border: "rgba(255,255,255,0.11)",
  accent: "#B83240", accentLt: "#BE3648", green: "#10B981",
  surface: "rgba(255,255,255,0.055)", surfaceHi: "rgba(255,255,255,0.10)",
} as const
const MONO = "'JetBrains Mono','SF Mono',ui-monospace,monospace"
const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const BODY: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif", fontSize: "clamp(15px, 1.4vw, 17px)", fontWeight: 400, lineHeight: 1.85, letterSpacing: "0.01em" }
const WRAP: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" }
const ease: [number,number,number,number] = [0.16,1,0.3,1]

const SVC_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; overflow-x: hidden; scroll-behavior: smooth; }
  body { overflow-x: clip; }
  #root { overflow-x: clip; }
  p, li { font-weight: 300; line-height: 1.75; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #060C18; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 4px; }
  ::placeholder { color: rgba(255,255,255,0.22) !important; }
  :root { --x:-9999; --y:-9999; }
  /* brick text — semi-transparent + warm glow, matching button quality */
  [style*="color: #BE3648"],
  [style*='color: "#BE3648"'] {
    color: rgba(184,50,64,0.82) !important;
    text-shadow:
      0 0 52px rgba(184,50,64,0.38),
      0 0 18px rgba(184,50,64,0.26),
      0 2px 6px rgba(0,0,0,0.28);
  }
  [style*="color: #7C222B"],
  [style*='color: "#7C222B"'] {
    text-shadow: 0 0 24px rgba(184,50,64,0.45), 0 0 8px rgba(184,50,64,0.26);
  }
  [data-glow] {
    --border-size: calc(var(--border,1.5) * 1px);
    --spotlight-size: calc(var(--size,260) * 1px);
    --hue: calc(var(--base,28) + (var(--xp,0) * var(--spread,40)));
    background-image: radial-gradient(var(--spotlight-size) var(--spotlight-size) at calc(var(--x,-9999)*1px) calc(var(--y,-9999)*1px), hsl(var(--hue) 24% 82%/0.05), transparent);
    background-size: calc(100% + (2*var(--border-size))) calc(100% + (2*var(--border-size)));
    background-position: 50% 50%; background-attachment: fixed;
  }
  [data-glow]::before,[data-glow]::after {
    pointer-events:none; content:""; position:absolute;
    inset:calc(var(--border-size)*-1); border:var(--border-size) solid transparent;
    border-radius:calc(var(--radius,16)*1px); background-attachment:fixed;
    background-size:calc(100% + (2*var(--border-size))) calc(100% + (2*var(--border-size)));
    background-repeat:no-repeat; background-position:50% 50%;
    mask:linear-gradient(transparent,transparent),linear-gradient(white,white);
    mask-clip:padding-box,border-box; mask-composite:intersect;
    -webkit-mask:linear-gradient(transparent,transparent),linear-gradient(white,white);
    -webkit-mask-clip:padding-box,border-box; -webkit-mask-composite:destination-in;
  }
  [data-glow]::before { background-image:radial-gradient(calc(var(--spotlight-size)*0.7) calc(var(--spotlight-size)*0.7) at calc(var(--x,-9999)*1px) calc(var(--y,-9999)*1px), hsl(var(--hue) 26% 74%/0.50), transparent 100%); filter:brightness(2); }
  [data-glow]::after  { background-image:radial-gradient(calc(var(--spotlight-size)*0.4) calc(var(--spotlight-size)*0.4) at calc(var(--x,-9999)*1px) calc(var(--y,-9999)*1px), hsl(0 100% 100%/0.22), transparent 100%); }
  @keyframes colon-blink { 0%,100%{opacity:.55} 50%{opacity:.15} }
  .dt-colon { animation: colon-blink 1s ease-in-out infinite; display:inline-block; }
  @media(max-width:768px){
    .svc-wrap { padding:0 20px !important; }
    .svc-hero-title { font-size:clamp(32px,8vw,52px) !important; }
    .svc-offer-grid { grid-template-columns:1fr !important; }
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
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
)
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"/>
  </svg>
)
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

const SOCIALS = [
  { label:"LinkedIn",  href:"https://linkedin.com/in/nadia-maar", Icon: LinkedinIcon },
  { label:"GitHub",    href:"https://github.com/nadiamaar-dev",   Icon: GithubIcon },
  { label:"Instagram", href:"https://instagram.com/nadia.maar",   Icon: InstagramIcon },
  { label:"Discord",   href:"#",                                  Icon: DiscordIcon },
]

/* ── NMmark ── */
function NMmark({size=32,id="nm-sg",hover=false}:{size?:number;id?:string;hover?:boolean}) {
  return (
    <svg viewBox="0 2 28 22" width={size} height={Math.round(size*22/28)} fill="none" strokeLinecap="square" strokeLinejoin="miter">
      <defs>
        <linearGradient id={id} x1="2" y1="12" x2="27" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={hover?"#F0F3F9":"rgba(255,255,255,0.90)"} />
          <stop offset="44%"  stopColor={hover?"#F0F3F9":"rgba(255,255,255,0.90)"} />
          <stop offset="56%"  stopColor="#BE3648" />
          <stop offset="100%" stopColor={hover?"#943830":"#7C222B"} />
        </linearGradient>
      </defs>
      <motion.path d="M 2,22 L 2,2 L 13,22 L 13,2 L 19.5,12 L 26,2 L 26,22"
        stroke={`url(#${id})`} strokeWidth="1.85"
        initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}}
        transition={{pathLength:{duration:0.9,ease,delay:0.15},opacity:{duration:0.01}}}
      />
    </svg>
  )
}

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
function Reveal({children,delay=0}:{children:React.ReactNode;delay?:number}) {
  return (
    <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
      viewport={{once:true,margin:"-10% 0px"}} transition={{duration:0.65,delay,ease}}>
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

/* ── DateTimeWidget ── */
function DateTimeWidget() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    <div style={{display:"flex",flexDirection:"column",gap:1}}>
      <span style={{fontFamily:MONO,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:"rgba(255,255,255,0.37)"}}>
        {now.toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric"})}
      </span>
      <span style={{fontFamily:MONO,fontSize:11,letterSpacing:"0.18em",color:"rgba(255,255,255,0.63)"}}>
        {pad(now.getHours())}<span className="dt-colon">:</span>{pad(now.getMinutes())}<span className="dt-colon">:</span>{pad(now.getSeconds())}
      </span>
    </div>
  )
}

/* ── MenuOverlay (service pages version — hrefs to main page) ── */
const SVC_MENU_LINKS = [
  { label:"Home",       href:"/" },
  { label:"Soluzioni",  href:"/#soluzioni" },
  { label:"Metodo",     href:"/#metodo" },
  { label:"Projects",   href:"/projects" },
  { label:"Portfolio",  href:"/#portfolio" },
  { label:"Contatti",   href:"/#contatti" },
  { label:"About",      href:"/about" },
]

function MenuOverlay({onClose}:{onClose:()=>void}) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.22}}
      style={{position:"fixed",inset:0,zIndex:800,display:"flex"}}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{position:"absolute",inset:0,background:"rgba(11,13,16,0.72)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)"}} onClick={onClose} />
      <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{duration:0.38,ease}}
        style={{position:"absolute",right:0,top:0,bottom:0,width:"min(360px,90vw)",background:"rgba(22,27,34,0.82)",backdropFilter:"blur(40px) saturate(0.80)",WebkitBackdropFilter:"blur(40px) saturate(0.80)",borderLeft:"1px solid rgba(255,255,255,0.16)",display:"flex",flexDirection:"column",padding:"80px 40px 40px"}}>
        <nav style={{display:"flex",flexDirection:"column",gap:4}}>
          {SVC_MENU_LINKS.map(({label,href}) => (
            <motion.a key={label} href={href}
              whileHover={{x:6}} transition={{duration:0.18}}
              style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",textDecoration:"none",borderBottom:"1px solid rgba(255,255,255,0.05)",fontFamily:MONO,fontSize:12,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:T.muted,transition:"color 0.18s"}}
              onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
              onMouseLeave={e=>(e.currentTarget.style.color=T.muted)}>
              <span style={{width:16,height:1,background:"rgba(184,50,64,0.60)",display:"inline-block"}} aria-hidden />
              {label}
            </motion.a>
          ))}
        </nav>
        <div style={{marginTop:"auto",display:"flex",gap:8}}>
          {SOCIALS.map(({label,href,Icon})=>(
            <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              whileHover={{y:-3,scale:1.08}} transition={{type:"spring",stiffness:400,damping:16}}
              style={{width:36,height:36,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:T.faint,border:`1px solid ${T.border}`,backgroundColor:"rgba(255,255,255,0.03)",textDecoration:"none"}}>
              <Icon />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Navbar ── */
function Navbar() {
  const [scrolled,setScrolled] = useState(false)
  const [menuOpen,setMenuOpen] = useState(false)
  const [h,setH] = useState(false)
  useEffect(() => {
    const fn=()=>setScrolled(window.scrollY>48)
    window.addEventListener("scroll",fn,{passive:true})
    return ()=>window.removeEventListener("scroll",fn)
  },[])
  return (
    <>
      <motion.header initial={{y:-70,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.7,ease}}
        style={{position:"fixed",top:0,left:0,right:0,zIndex:400,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",backdropFilter:scrolled?"blur(32px) saturate(0.85)":"none",WebkitBackdropFilter:scrolled?"blur(32px) saturate(0.85)":"none",background:scrolled?"rgba(22,27,34,0.78)":"transparent",borderBottom:`1px solid ${scrolled?"rgba(255,255,255,0.07)":"transparent"}`,transition:"background 0.4s,border-color 0.4s"} as React.CSSProperties}>
        <DateTimeWidget />
        <motion.a href="/" onHoverStart={()=>setH(true)} onHoverEnd={()=>setH(false)}
          whileHover={{scale:1.03}} whileTap={{scale:0.96}}
          style={{display:"inline-flex",alignItems:"center",gap:11,textDecoration:"none"}}>
          <NMmark size={30} id="nm-svc-nav" hover={h} />
          <span aria-hidden style={{width:1,height:14,background:"rgba(255,255,255,0.16)",flexShrink:0}} />
          <motion.span animate={{opacity:h?1:0.70}} transition={{duration:0.25}}
            style={{fontFamily:MONO,fontWeight:600,fontSize:11,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:"#fff",whiteSpace:"nowrap" as const}}>
            Nadia Maar
          </motion.span>
        </motion.a>
        <motion.button onClick={()=>setMenuOpen(o=>!o)}
          whileHover={{scale:1.08}} whileTap={{scale:0.92}}
          aria-label="Menu"
          style={{background:"none",border:"none",cursor:"pointer",padding:"8px 4px",display:"flex",flexDirection:"column",gap:5,zIndex:401,flexShrink:0}}>
          <motion.span animate={{rotate:menuOpen?45:0,y:menuOpen?7:0}} transition={{duration:0.26}}
            style={{display:"block",width:22,height:1.8,background:menuOpen?"#fff":"rgba(255,255,255,0.80)",borderRadius:2,transformOrigin:"center"}} />
          <motion.span animate={{opacity:menuOpen?0:1,width:menuOpen?0:14}} transition={{duration:0.18}}
            style={{display:"block",width:14,height:1.8,background:"rgba(255,255,255,0.80)",borderRadius:2}} />
          <motion.span animate={{rotate:menuOpen?-45:0,y:menuOpen?-7:0}} transition={{duration:0.26}}
            style={{display:"block",width:22,height:1.8,background:menuOpen?"#fff":"rgba(255,255,255,0.80)",borderRadius:2,transformOrigin:"center"}} />
        </motion.button>
      </motion.header>
      <AnimatePresence>{menuOpen && <MenuOverlay onClose={()=>setMenuOpen(false)} />}</AnimatePresence>
    </>
  )
}

/* ── ContactModal ── */
function ContactModal({onClose}:{onClose:()=>void}) {
  const [sent,setSent] = useState(false)
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
            <h3 style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:"#fff",marginBottom:8}}>Messaggio inviato</h3>
            <p style={{fontFamily:MONO,fontSize:12,color:T.faint}}>Ti rispondo entro 24 ore.</p>
          </div>
        ) : (
          <>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:T.accentLt,marginBottom:8}}>// [ Richiesta Consulenza ]</div>
            <h3 style={{fontFamily:DISPLAY,fontSize:22,fontWeight:700,color:"#fff",marginBottom:6}}>Iniziamo a parlarne</h3>
            <p style={{fontFamily:MONO,fontSize:12,color:T.faint,lineHeight:1.7,marginBottom:24}}>Descrivi il tuo progetto. Rispondo entro 24h.</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <input placeholder="Nome" value={form.name} onChange={set("name")} style={inp}
                  onFocus={e=>(e.target.style.borderColor="rgba(184,50,64,0.60)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")} />
                <input placeholder="Email" type="email" value={form.email} onChange={set("email")} style={inp}
                  onFocus={e=>(e.target.style.borderColor="rgba(184,50,64,0.60)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")} />
              </div>
              <input placeholder="Azienda (opzionale)" value={form.company} onChange={set("company")} style={inp}
                onFocus={e=>(e.target.style.borderColor="rgba(184,50,64,0.60)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")} />
              <textarea placeholder="Descrivi il tuo progetto o problema principale..." value={form.message} onChange={set("message")} rows={4}
                style={{...inp,resize:"none" as const,lineHeight:1.65}}
                onFocus={e=>(e.target.style.borderColor="rgba(184,50,64,0.60)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")} />
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                onClick={()=>setSent(true)}
                style={{display:"flex",alignItems:"stretch",borderRadius:12,border:"1px solid rgba(184,50,64,0.80)",background:"linear-gradient(90deg,rgba(184,50,64,0.34) 0%,rgba(184,50,64,0.20) 100%)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 0 12px rgba(184,50,64,0.20), inset 0 1px 0 rgba(255,255,255,0.12)",cursor:"pointer",overflow:"hidden",marginTop:4}}>
                <span style={{padding:"12px 14px 12px 16px",borderRight:"1px solid rgba(184,50,64,0.35)",display:"flex",alignItems:"center",fontFamily:MONO,fontSize:8.5,letterSpacing:"0.22em",color:"rgba(255,255,255,0.85)",flexShrink:0}}>[→]</span>
                <span style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"12px 20px",fontFamily:MONO,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:"rgba(255,255,255,0.90)",fontWeight:500}}>Invia Messaggio</span>
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
interface ServiceData {
  num: string; slug: string; title: string; subtitle: string; eyebrow: string
  gradient: string; accentColor: string
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

const SERVICES: Record<string, ServiceData> = {
  ecommerce: {
    num:"01", slug:"ecommerce",
    title:"E-commerce ad Alta Conversione",
    subtitle:"Architetture Shopify custom e headless commerce scalabili. Automazione totale di magazzini, cataloghi massivi e logistica multi-corriere. Costruiamo infrastrutture che convertono e scalano senza attriti.",
    eyebrow:"E-Commerce · Shopify · Automazione",
    gradient:"linear-gradient(135deg,#7C222B 0%,#BE3648 100%)",
    accentColor:"rgba(184,50,64,0.60)",
    whatWeDo:{
      heading:"Il tuo e-commerce è un asset — non un sito.",
      body:[
        "Troppe aziende trattano il loro store online come una vetrina statica. Noi lo progettiamo come un sistema vivo: inventory sincronizzato in tempo reale, checkout ottimizzato per ridurre l'abbandono, integrazioni con i tuoi fornitori che eliminano l'errore umano.",
        "Lavoriamo con cataloghi da 500 a 30.000+ SKU, marketplace B2B, configuratori di prodotto complessi e architetture multi-store internazionali. Il risultato è un'infrastruttura che scala senza rallentare."
      ],
      stats:[
        {value:"30k+",label:"SKU gestiti in real-time"},
        {value:"<1.2s",label:"Tempo di caricamento target"},
        {value:"99.9%",label:"Uptime garantito"},
      ]
    },
    whatWeOffer:{
      heading:"Cosa costruiamo per te",
      items:[
        {icon:iconStroke("M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18","M16 10a4 4 0 01-8 0"),title:"Shopify Custom & Headless",desc:"Temi su misura, app private, checkout personalizzato. Architetture Hydrogen/Remix per performance estreme."},
        {icon:iconStroke("M22 12h-4l-3 9L9 3l-3 9H2"),title:"Automazione Magazzino",desc:"Sincronizzazione stock in real-time con ERP, fornitori e marketplace. Zero discrepanze, zero perdite di vendita."},
        {icon:iconStroke("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2","M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"),title:"Catalogo & Prezzi B2B",desc:"Gestione avanzata di varianti, listini riservati per cliente, sconti scalabili, cataloghi personalizzati per segmento."},
        {icon:iconStroke("M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z","M12 7v5l3 3"),title:"Logistica Integrata",desc:"Connessione con GLS, DHL, BRT, SDA. Label automation, tracking in tempo reale, resi semplificati."},
        {icon:iconStroke("M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"),title:"Core Web Vitals Perfetti",desc:"LCP <1.2s, CLS 0, INP ottimale. Ottimizzazione immagini, lazy loading, CDN e caching stratificato."},
        {icon:iconStroke("M18 20V10","M12 20V4","M6 20v-6"),title:"Analytics & CRO",desc:"GA4 avanzato, heatmap, funnel di conversione. A/B test continuo per massimizzare il revenue per sessione."},
      ]
    },
    howWeDoIt:{
      heading:"Il nostro processo — dall'audit al lancio",
      steps:[
        {title:"Audit Tecnico & Revenue Analysis",desc:"Analizziamo il tuo stack attuale, identifichiamo i bottleneck di conversione e stimiamo il revenue loss mensile. Uscite con un report dettagliato e priorità chiare."},
        {title:"Architettura & Pianificazione",desc:"Progettiamo l'infrastruttura scalabile: scelta dello stack tecnologico, mappa delle integrazioni, piano migrazioni dati e timeline di rilascio."},
        {title:"Sviluppo & Integrazioni",desc:"Costruiamo tema custom, app private, API connectors. Ogni integrazione è testata su dati reali prima di toccare la produzione."},
        {title:"QA, Load Test & UAT",desc:"Test di carico su traffico simulato, verifica di tutti i flussi critici (checkout, resi, notifiche), sign-off con il tuo team prima del go-live."},
        {title:"Lancio Graduale & Monitoring",desc:"Rollout progressivo con feature flag. Dashboard di monitoring real-time per le prime 72h post-lancio. Sei completamente coperti."},
      ]
    },
    cta:{
      heading:"Vuoi un e-commerce che scala davvero?",
      sub:"Analizziamo gratuitamente il tuo store attuale e identifichiamo i punti di perdita. Nessun impegno.",
      btn:"Richiedi l'Audit Gratuito"
    }
  },

  corporate: {
    num:"02", slug:"corporate",
    title:"Siti Corporate & Lead Generation",
    subtitle:"Identità digitale d'élite per aziende e professionisti. Architetture web studiate per posizionarsi come leader di settore e trasformare visitatori qualificati in clienti B2B.",
    eyebrow:"Corporate · UI/UX Premium · Lead Generation",
    gradient:"linear-gradient(135deg,#AEB6C4 0%,#EDF1F7 100%)",
    accentColor:"rgba(174,182,196,0.50)",
    whatWeDo:{
      heading:"Il tuo sito è il tuo miglior commerciale.",
      body:[
        "Un sito corporate mediocre non è neutro — è attivamente dannoso. Comunica insicurezza, allontana i decision maker e brucia il budget delle tue campagne. Noi costruiamo identità digitali che trasmettono autorità al primo secondo.",
        "Ogni elemento — dalla tipografia alla micro-animazione, dalla struttura degli heading alla velocità di caricamento — è progettato per un obiettivo specifico: convertire il visitatore giusto in una lead qualificata e pronta a parlare con il tuo team commerciale."
      ],
      stats:[
        {value:"2.3×",label:"Aumento medio lead qualificate"},
        {value:"<0.8s",label:"LCP target su desktop"},
        {value:"100",label:"Lighthouse Performance Score"},
      ]
    },
    whatWeOffer:{
      heading:"Architettura completa per la tua presenza digitale",
      items:[
        {icon:iconStroke("M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"),title:"Design System Premium",desc:"Figma-to-code ad alta fedeltà. Design token system, componenti riutilizzabili, dark/light mode e animazioni coerenti."},
        {icon:iconStroke("M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M12 3a4 4 0 010 8 4 4 0 010-8z"),title:"Lead Generation Architecture",desc:"Form ad alta conversione, CRM integration (HubSpot, Salesforce), automazione email follow-up e qualificazione lead automatica."},
        {icon:iconStroke("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"),title:"CMS Headless",desc:"Sanity o Contentful per gestione editoriale autonoma. Il tuo team aggiorna contenuti senza toccare il codice."},
        {icon:iconStroke("M22 12h-4l-3 9L9 3l-3 9H2"),title:"Performance Estrema",desc:"Next.js App Router, SSR/SSG ibrido, ISR per contenuto dinamico. Aziende enterprise su infrastruttura che regge qualsiasi picco."},
        {icon:iconStroke("M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"),title:"SEO Strutturale",desc:"Schema markup, sitemap dinamica, Open Graph, Core Web Vitals ottimizzati. Visibilità organica integrata dall'architettura."},
        {icon:iconStroke("M18 20V10","M12 20V4","M6 20v-6"),title:"Analytics Avanzate",desc:"GA4 con eventi custom, heatmap Hotjar, funnel tracking e dashboard executive per monitorare il ROI in tempo reale."},
      ]
    },
    howWeDoIt:{
      heading:"Dal brief alla lead acquisition — il nostro metodo",
      steps:[
        {title:"Discovery & Strategia",desc:"Workshop di 2h per comprendere il tuo mercato, ICP (Ideal Customer Profile), competitors e obiettivi di crescita. Definiamo KPI misurabili prima di disegnare un pixel."},
        {title:"Design & Prototipo",desc:"Wireframe low-fi → design system → prototipo interattivo in Figma. Approvi ogni schermata prima che inizi lo sviluppo. Zero sorprese."},
        {title:"Sviluppo & Integrazioni",desc:"Next.js + CMS headless + CRM. Coding standard enterprise: TypeScript, test E2E, CI/CD. Performance verificata ad ogni commit."},
        {title:"SEO & Content Setup",desc:"Struttura URL ottimizzata, meta tag template, schema markup, sitemap e configurazione Search Console. Il sito indicizza dal primo giorno."},
        {title:"Lancio & Ottimizzazione",desc:"Go-live con monitoring attivo. Nei 30 giorni successivi analizziamo i dati reali e ottimizziamo headline, CTA e flussi di lead generation."},
      ]
    },
    cta:{
      heading:"Il tuo brand merita una presenza all'altezza.",
      sub:"Mostrati un'analisi del tuo sito attuale e discutiamo come trasformarlo in un asset che genera lead qualificate.",
      btn:"Analizza il mio Sito"
    }
  },

  webapp: {
    num:"03", slug:"webapp",
    title:"Applicazioni Web & Automazione Custom",
    subtitle:"Software su misura che integra CRM, ERP e sistemi terzi. Eliminiamo i processi manuali, connettiamo i tuoi dati e costruiamo strumenti interni che lavorano per te 24/7 senza errori umani.",
    eyebrow:"Web App · CRM/ERP · Automazione Processi",
    gradient:"linear-gradient(135deg,#AEB6C4 0%,#EDF1F7 100%)",
    accentColor:"rgba(174,182,196,0.50)",
    whatWeDo:{
      heading:"Ogni processo manuale è un costo nascosto.",
      body:[
        "Il vero costo di un'operazione manuale non è solo il tempo — è l'errore umano, il ritardo di decisione e la scalabilità zero. Quando un coordinatore trascorre 3 ore al giorno a copiare dati tra sistemi, stai pagando un ingegnere per fare il lavoro di un script.",
        "Costruiamo applicazioni web e sistemi di automazione che integrano i tuoi tool esistenti, eliminano la routine e restituiscono al tuo team il tempo per il lavoro ad alto valore. Ogni euro investito in automazione si ripaga in 3-6 mesi."
      ],
      stats:[
        {value:"-80%",label:"Riduzione tempi operativi"},
        {value:"Zero",label:"Errori da inserimento manuale"},
        {value:"3-6m",label:"Payback period medio"},
      ]
    },
    whatWeOffer:{
      heading:"Soluzioni software per ogni livello di complessità",
      items:[
        {icon:iconStroke("M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"),title:"App Web Custom",desc:"React/Next.js frontend, Node.js o Python backend. Architettura scalabile, auth enterprise, role-based access control."},
        {icon:iconStroke("M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 10H2"),title:"Integrazioni CRM/ERP",desc:"Salesforce, HubSpot, SAP, Odoo, gestionale custom. Dati sincronizzati, flussi automatici, zero copia-incolla."},
        {icon:iconStroke("M13 10V3L4 14h7v7l9-11h-7z"),title:"Automazione Workflow",desc:"n8n, Zapier, script custom Python/Node. Processi trigger-based, alert intelligenti, report automatici."},
        {icon:iconStroke("M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"),title:"API Gateway & Middleware",desc:"Microservizi REST e GraphQL. Centralizza le chiamate API, gestisci i rate limit, monitora in real-time."},
        {icon:iconStroke("M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z","M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"),title:"Dashboard Analitiche",desc:"Dati di business in real-time. KPI customizzati, drill-down interattivi, report schedulati via email o Slack."},
        {icon:iconStroke("M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"),title:"Portali B2B",desc:"Area riservata clienti e partner. Gestione ordini, fatture, documentazione e comunicazione centralizzata."},
      ]
    },
    howWeDoIt:{
      heading:"Analysis → Build → Automate → Support",
      steps:[
        {title:"Analisi dei Processi",desc:"Mappatura completa dei flussi esistenti. Identifichiamo ogni passaggio manuale, ogni integrazione mancante e calcoliamo il costo operativo attuale."},
        {title:"Progettazione dell'Architettura",desc:"Schema tecnico del sistema: quali tool connettiamo, come fluiscono i dati, quali automazioni attivare. Tutto approvato prima di scrivere una riga di codice."},
        {title:"Sviluppo Iterativo",desc:"Sprint settimanali con demo live. Vedi il prodotto crescere in tempo reale e puoi dare feedback ad ogni iterazione."},
        {title:"Integrazione & Test",desc:"Connessione con i sistemi esistenti in ambiente staging. Test di carico, test di sicurezza, verifica dei flussi critici con dati reali anonimi."},
        {title:"Deploy & Formazione",desc:"Rilascio in produzione con rollback automatico in caso di anomalie. Sessione di formazione per il tuo team e documentazione tecnica completa."},
        {title:"Supporto & Evoluzione",desc:"Monitoring proattivo post-lancio. Il sistema cresce con te: nuove automazioni, nuove integrazioni, nuovi moduli su richiesta."},
      ]
    },
    cta:{
      heading:"Ogni ora persa in processi manuali è denaro bruciato.",
      sub:"Raccontaci il tuo workflow più costoso. In 30 minuti ti diciamo come automatizzarlo e quanto risparmieresti.",
      btn:"Parla dei tuoi Processi"
    }
  },

  seo: {
    num:"04", slug:"seo",
    title:"SEO Strategico & Performance Marketing",
    subtitle:"Posizionamento organico integrato nell'architettura dal primo giorno. Google Ads e Meta Ads scalabili a costi decrescenti. Costruiamo canali di acquisizione che lavorano anche mentre dormi.",
    eyebrow:"SEO Tecnico · Google Ads · Meta Ads",
    gradient:"linear-gradient(135deg,#7C222B 0%,#DFA088 100%)",
    accentColor:"rgba(184,50,64,0.60)",
    whatWeDo:{
      heading:"Il traffico organico è il tuo asset più redditizio.",
      body:[
        "Dipendere al 100% dalle Ads è come affittare la tua visibilità: smetti di pagare, sparisci. Il SEO costruisce un asset che si apprezza nel tempo — ogni articolo posizionato, ogni backlink acquisito, ogni pagina ottimizzata è un investimento che restituisce traffico per anni.",
        "Il nostro approccio integra SEO tecnico, content strategy e Performance Marketing in un'unica architettura coerente. Paghiamo le Ads finché il canale organico non è abbastanza forte da sostituirle, riducendo progressivamente il costo di acquisizione."
      ],
      stats:[
        {value:"+340%",label:"Crescita traffico organico medio (12m)"},
        {value:"-60%",label:"Riduzione CPA dopo 6 mesi"},
        {value:"Top 3",label:"Posizionamenti su query transazionali"},
      ]
    },
    whatWeOffer:{
      heading:"L'ecosistema completo per dominare l'acquisizione",
      items:[
        {icon:iconStroke("M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"),title:"SEO Tecnico",desc:"Core Web Vitals, crawlability, hreflang, schema markup, sitemap dinamica, log file analysis. Tutto ciò che Google non riesce a ignorare."},
        {icon:iconStroke("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"),title:"Keyword Strategy",desc:"Analisi intent-based del mercato, keyword gap vs competitor, architettura dei contenuti con cluster tematici e pillar pages."},
        {icon:iconStroke("M4 6h16M4 12h16M4 18h7"),title:"Content Architecture",desc:"Brief SEO-driven per ogni pagina chiave, ottimizzazione on-page, internal linking strategico e aggiornamento dei contenuti esistenti."},
        {icon:iconStroke("M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"),title:"Google Ads",desc:"Search, Shopping e Performance Max ottimizzati con Smart Bidding. ROAS minimo garantito contrattualmente dopo il primo mese."},
        {icon:iconStroke("M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"),title:"Meta & Social Ads",desc:"Campagne Feed, Stories e Reels su Meta. Retargeting stratificato, lookalike audience e creative testing sistematico."},
        {icon:iconStroke("M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"),title:"Reporting & Insights",desc:"Dashboard in real-time con posizioni, traffico, conversioni e ROAS. Report mensile con analisi e raccomandazioni prioritizzate."},
      ]
    },
    howWeDoIt:{
      heading:"Dal silenzio alla top 3 — il percorso strutturato",
      steps:[
        {title:"SEO Audit Completo",desc:"Analisi tecnica del sito, crawl report, analisi dei competitor organici, identificazione delle quick win e delle opportunità a lungo termine. Risultato: roadmap prioritizzata."},
        {title:"Keyword & Content Strategy",desc:"Mappa delle keyword per ogni stadio del funnel, architettura dei contenuti, competitor gap analysis. Decidiamo cosa creare, cosa ottimizzare e cosa eliminare."},
        {title:"Implementazione Tecnica",desc:"Fix tecnici sul sito, schema markup, ottimizzazione velocità, correzione errori di crawl. Parallelo all'implementazione, lancio delle campagne Ads iniziali."},
        {title:"Content Production & Link Building",desc:"Produzione dei contenuti ottimizzati, digital PR per backlink autorevoli, guest posting e menzioni editoriali. Costruiamo autorità domain in modo white-hat."},
        {title:"Ottimizzazione Continua",desc:"Ogni mese: analisi dei dati, A/B test su landing page Ads, aggiornamento contenuti in calo, espansione verso nuovi cluster keyword. Il sistema migliora costantemente."},
      ]
    },
    cta:{
      heading:"Ogni giorno senza SEO è un giorno regalato ai competitor.",
      sub:"Analisi gratuita del tuo posizionamento attuale vs competitor. In 30 minuti sai dove sei e dove puoi arrivare.",
      btn:"Ottieni l'Analisi SEO Gratuita"
    }
  },

  ai: {
    num:"05", slug:"ai",
    title:"Integrazione AI & Sistemi Intelligenti",
    subtitle:"Agenti AI, LLM e sistemi RAG integrati nei tuoi processi aziendali. Riduciamo i costi operativi, acceleriamo le decisioni e liberiamo il tuo team per il lavoro ad alto valore strategico.",
    eyebrow:"AI Agents · LLM · Automazione Intelligente",
    gradient:"linear-gradient(135deg,#BE3648 0%,#DFA088 100%)",
    accentColor:"rgba(184,50,64,0.60)",
    whatWeDo:{
      heading:"L'AI non è il futuro. È il vantaggio competitivo di oggi.",
      body:[
        "Le aziende che stanno integrando AI nei loro processi oggi non stanno sperimentando — stanno costruendo un vantaggio strutturale che diventerà sempre più difficile da colmare. Non si tratta di automazione superficiale: si tratta di sistemi che ragionano, contestualizzano e migliorano nel tempo.",
        "Implementiamo soluzioni AI concrete e misurabili: agenti che gestiscono il supporto clienti 24/7, sistemi RAG che rendono ricercabile la knowledge base aziendale, pipeline di contenuto che producono 1000 descrizioni prodotto in 10 minuti. ROI verificabile entro 90 giorni."
      ],
      stats:[
        {value:"-75%",label:"Riduzione costi operativi routinari"},
        {value:"24/7",label:"Operatività senza intervento umano"},
        {value:"90gg",label:"Time-to-value su implementazione"},
      ]
    },
    whatWeOffer:{
      heading:"Soluzioni AI pronte per l'impresa",
      items:[
        {icon:iconStroke("M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.575 1.548M19.8 15H4.2",""),title:"Agenti AI Custom",desc:"LangChain, AutoGen, CrewAI. Agenti che eseguono task complessi in autonomia: ricerca, analisi, redazione, notifica, escalation."},
        {icon:iconStroke("M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"),title:"RAG Systems",desc:"Rendi ricercabile la tua knowledge base aziendale. Manuali, contratti, email, documenti: il sistema trova e sintetizza in secondi."},
        {icon:iconStroke("M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"),title:"LLM Integration",desc:"OpenAI GPT-4o, Anthropic Claude, Mistral, Llama self-hosted. Scegliamo il modello giusto per costo, latenza e compliance."},
        {icon:iconStroke("M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18","M16 10a4 4 0 01-8 0"),title:"AI per E-commerce",desc:"Generazione massiva di descrizioni prodotto SEO-friendly, pricing dinamico basato su competitor, chatbot di supporto pre-vendita."},
        {icon:iconStroke("M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"),title:"Chatbot B2B",desc:"Assistenti conversazionali per qualificazione lead, supporto tecnico e onboarding clienti. Integrazione con CRM e live chat umana in escalation."},
        {icon:iconStroke("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"),title:"AI Analytics",desc:"Modelli predittivi per churn, inventory e domanda. Anomaly detection automatica. Insight che arrivano prima che il problema emerga."},
      ]
    },
    howWeDoIt:{
      heading:"Dalla valutazione al sistema in produzione",
      steps:[
        {title:"AI Readiness Assessment",desc:"Valutiamo i tuoi dati disponibili, i processi candidati all'automazione e il potenziale ROI di ogni use case. Uscite con una roadmap di implementazione prioritizzata."},
        {title:"Proof of Concept",desc:"Sviluppiamo un PoC funzionante sul caso d'uso più ad alto impatto entro 2 settimane. Misuri i risultati su dati reali prima di impegnarti sull'implementazione completa."},
        {title:"Architettura del Sistema",desc:"Progettazione dell'infrastruttura AI: scelta dei modelli, pipeline di dati, storage vettoriale, guardrail di sicurezza e fallback per i casi edge."},
        {title:"Integrazione nei Processi",desc:"Connessione con i tuoi sistemi esistenti (CRM, ERP, e-commerce, database). Il sistema AI diventa un componente invisibile del workflow quotidiano."},
        {title:"Training & Fine-tuning",desc:"Addestriamo il sistema sui tuoi dati specifici, testiamo i casi limite e configuriamo i meccanismi di feedback per il miglioramento continuo."},
        {title:"Deploy & Monitoring",desc:"Rilascio graduale con A/B contro il processo manuale. Dashboard di monitoring per accuracy, latenza e costi token. Il sistema si ottimizza nel tempo."},
      ]
    },
    cta:{
      heading:"Ogni processo manuale è una opportunità AI.",
      sub:"Identifica con noi i tre processi con più alto ROI di automazione. Sessione gratuita di 45 minuti, output concreto garantito.",
      btn:"Prenota la Sessione AI"
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   SERVICE PAGE TEMPLATE
══════════════════════════════════════════════════════════════════════════ */
function ServicePage({data}:{data:ServiceData}) {
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const sync = (e: PointerEvent) => {
      const r = document.documentElement
      r.style.setProperty("--x", e.clientX.toFixed(2))
      r.style.setProperty("--y", e.clientY.toFixed(2))
      r.style.setProperty("--xp", (e.clientX/window.innerWidth).toFixed(4))
      r.style.setProperty("--yp", (e.clientY/window.innerHeight).toFixed(4))
    }
    document.addEventListener("pointermove", sync)
    return () => document.removeEventListener("pointermove", sync)
  }, [])

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
        <section style={{padding:"80px 0 72px",borderBottom:`1px solid rgba(255,255,255,0.12)`}}>
          <div style={{...WRAP,position:"relative"}} className="svc-wrap">
            {/* breadcrumb */}
            <Reveal>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
                <motion.a href="/" whileHover={{x:-2}} style={{display:"inline-flex",alignItems:"center",gap:6,fontFamily:MONO,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:T.faint,textDecoration:"none",transition:"color 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color=T.faint)}>
                  <ArrowLeftIcon size={10} /> Home
                </motion.a>
                <span style={{color:"rgba(255,255,255,0.20)"}}>·</span>
                <span style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:T.accentLt}}>{data.eyebrow}</span>
              </div>
            </Reveal>

            <Reveal delay={0.04}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:MONO,fontSize:10.5,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:"rgba(255,255,255,0.46)",marginBottom:20}}>
                <span style={{color:T.accentLt}}>//</span>
                <span>[ {data.num} · Servizio ]</span>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="svc-hero-title" style={{fontFamily:DISPLAY,fontSize:"clamp(36px,5.5vw,72px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-0.03em",color:"#F0F3F9",maxWidth:840,marginBottom:24}}>
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
                  style={{display:"flex",alignItems:"stretch",borderRadius:12,border:"1px solid rgba(184,50,64,0.80)",background:"linear-gradient(90deg,rgba(184,50,64,0.34) 0%,rgba(184,50,64,0.20) 100%)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 0 12px rgba(184,50,64,0.20), inset 0 1px 0 rgba(255,255,255,0.12)",cursor:"pointer",overflow:"hidden"}}>
                  <span style={{padding:"14px 12px 14px 16px",borderRight:"1px solid rgba(184,50,64,0.35)",display:"flex",alignItems:"center",fontFamily:MONO,fontSize:8.5,letterSpacing:"0.22em",color:"rgba(255,255,255,0.85)",flexShrink:0}}>[{data.num}]</span>
                  <span style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"14px 22px",fontFamily:MONO,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:"rgba(255,255,255,0.92)",fontWeight:500}}>
                    {data.cta.btn} <ArrowRightIcon size={11} />
                  </span>
                </motion.button>
                <motion.a href="/" whileHover={{x:-2}} style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:MONO,fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase" as const,color:T.faint,textDecoration:"none",transition:"color 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color=T.faint)}>
                  <ArrowLeftIcon size={10} /> Tutti i servizi
                </motion.a>
              </div>
            </Reveal>

            {/* accent glow orb */}
            <div aria-hidden style={{position:"absolute",top:"-20%",right:"-5%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${data.accentColor} 0%,transparent 65%)`,filter:"blur(80px)",pointerEvents:"none",zIndex:-1}} />
          </div>
        </section>

        {/* ── COSA FACCIAMO ── */}
        <section style={{padding:"88px 0",borderBottom:`1px solid rgba(255,255,255,0.12)`}}>
          <div style={{...WRAP}} className="svc-wrap">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"64px 80px",alignItems:"start"}} className="svc-what-grid">
              <style>{`.svc-what-grid{@media(max-width:768px){grid-template-columns:1fr!important}}`}</style>
              <div>
                <Reveal>
                  <div style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:MONO,fontSize:10.5,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:"rgba(255,255,255,0.46)",marginBottom:20}}>
                    <span style={{color:T.accentLt}}>//</span><span>[ Cosa Facciamo ]</span>
                  </div>
                  <h2 style={{fontFamily:DISPLAY,fontSize:"clamp(22px,2.8vw,38px)",fontWeight:700,lineHeight:1.15,letterSpacing:"-0.02em",color:"#F0F3F9",marginBottom:28}}>
                    {data.whatWeDo.heading}
                  </h2>
                  {data.whatWeDo.body.map((p,i)=>(
                    <p key={i} style={{...BODY,color:T.muted,marginBottom:i<data.whatWeDo.body.length-1?20:0}}>
                      {p}
                    </p>
                  ))}
                </Reveal>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {data.whatWeDo.stats.map((s,i)=>(
                  <Reveal key={i} delay={i*0.08}>
                    <motion.div data-glow="" whileHover={{x:6,scale:1.02}} transition={{duration:0.25,ease}}
                      style={{"--base":"28","--spread":"36","--radius":"16","--border":"1","--size":"180",display:"flex",alignItems:"center",gap:20,padding:"22px 24px",borderRadius:16,background:"rgba(255,255,255,0.055)",border:"1px solid rgba(255,255,255,0.20)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",position:"relative",overflow:"hidden"} as React.CSSProperties}>
                      <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:data.gradient,borderRadius:"16px 0 0 16px"}} />
                      <div style={{paddingLeft:8}}>
                        <div style={{fontFamily:DISPLAY,fontSize:32,fontWeight:800,color:"#F0F3F9",letterSpacing:"-0.03em",lineHeight:1}}>{s.value}</div>
                        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:T.faint,marginTop:6}}>{s.label}</div>
                      </div>
                    </motion.div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── COSA OFFRIAMO ── */}
        <section style={{padding:"88px 0",borderBottom:`1px solid rgba(255,255,255,0.12)`}}>
          <div style={{...WRAP}} className="svc-wrap">
            <Reveal>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:MONO,fontSize:10.5,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:"rgba(255,255,255,0.46)",marginBottom:20}}>
                <span style={{color:T.accentLt}}>//</span><span>[ Cosa Offriamo ]</span>
              </div>
              <h2 style={{fontFamily:DISPLAY,fontSize:"clamp(22px,2.8vw,38px)",fontWeight:700,lineHeight:1.15,letterSpacing:"-0.02em",color:"#F0F3F9",marginBottom:48}}>
                {data.whatWeOffer.heading}
              </h2>
            </Reveal>
            <div className="svc-offer-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {data.whatWeOffer.items.map((item,i)=>(
                <Reveal key={i} delay={i*0.06}>
                  <OfferCard item={item} gradient={data.gradient} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── COME LO REALIZZIAMO ── */}
        <section style={{padding:"88px 0",borderBottom:`1px solid rgba(255,255,255,0.12)`}}>
          <div style={{...WRAP}} className="svc-wrap">
            <Reveal>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:MONO,fontSize:10.5,letterSpacing:"0.22em",textTransform:"uppercase" as const,color:"rgba(255,255,255,0.46)",marginBottom:20}}>
                <span style={{color:T.accentLt}}>//</span><span>[ Come lo Realizziamo ]</span>
              </div>
              <h2 style={{fontFamily:DISPLAY,fontSize:"clamp(22px,2.8vw,38px)",fontWeight:700,lineHeight:1.15,letterSpacing:"-0.02em",color:"#F0F3F9",marginBottom:56}}>
                {data.howWeDoIt.heading}
              </h2>
            </Reveal>
            <div style={{position:"relative"}}>
              {/* vertical connector line */}
              <div aria-hidden style={{position:"absolute",left:28,top:48,bottom:48,width:1,background:`linear-gradient(180deg, ${data.accentColor}, rgba(184,50,64,0.08))`,zIndex:0}} />
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {data.howWeDoIt.steps.map((step,i)=>(
                  <Reveal key={i} delay={i*0.07}>
                    <ProcessStep step={step} index={i} total={data.howWeDoIt.steps.length} gradient={data.gradient} accentColor={data.accentColor} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{padding:"100px 0 80px"}}>
          <div style={{...WRAP}} className="svc-wrap">
            <Reveal>
              <motion.div data-glow="" whileHover={{scale:1.005}} transition={{duration:0.4,ease}}
                style={{"--base":"28","--spread":"60","--radius":"24","--border":"1.5","--size":"400",position:"relative",borderRadius:24,padding:"64px 56px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.20)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.63),0 32px 80px rgba(0,0,0,0.50)",overflow:"hidden",textAlign:"center"} as React.CSSProperties}>
                {/* glow orbs */}
                <div aria-hidden style={{position:"absolute",top:"-30%",left:"50%",transform:"translateX(-50%)",width:600,height:400,borderRadius:"50%",background:`radial-gradient(ellipse,${data.accentColor} 0%,transparent 60%)`,filter:"blur(60px)",pointerEvents:"none"}} />
                <div aria-hidden style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${data.accentColor},transparent)`}} />

                <div style={{position:"relative",zIndex:1}}>
                  <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"7px 16px",borderRadius:9999,background:"rgba(184,50,64,0.10)",border:"1px solid rgba(184,50,64,0.35)",marginBottom:24}}>
                    <PingDot color={T.accentLt} size={6} />
                    <span style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.20em",textTransform:"uppercase" as const,color:T.accentLt}}>Disponibile · 2026</span>
                  </div>
                  <h2 style={{fontFamily:DISPLAY,fontSize:"clamp(24px,3.2vw,44px)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.025em",color:"#F0F3F9",marginBottom:18,maxWidth:640,margin:"0 auto 18px"}}>
                    {data.cta.heading}
                  </h2>
                  <p style={{...BODY,color:T.muted,maxWidth:500,margin:"0 auto 36px"}}>
                    {data.cta.sub}
                  </p>
                  <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap" as const}}>
                    <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                      onClick={()=>setModalOpen(true)}
                      style={{display:"flex",alignItems:"stretch",borderRadius:12,border:"1px solid rgba(184,50,64,0.80)",background:"linear-gradient(90deg,rgba(184,50,64,0.34) 0%,rgba(184,50,64,0.20) 100%)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 0 12px rgba(184,50,64,0.20), inset 0 1px 0 rgba(255,255,255,0.12)",cursor:"pointer",overflow:"hidden"}}>
                      <span style={{padding:"14px 12px 14px 16px",borderRight:"1px solid rgba(184,50,64,0.35)",display:"flex",alignItems:"center",fontFamily:MONO,fontSize:8.5,letterSpacing:"0.22em",color:"rgba(255,255,255,0.85)",flexShrink:0}}>[{data.num}]</span>
                      <span style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"14px 24px",fontFamily:MONO,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase" as const,color:"rgba(255,255,255,0.92)",fontWeight:500}}>
                        {data.cta.btn} <ArrowRightIcon size={11} />
                      </span>
                    </motion.button>
                    <motion.a href="mailto:nadiamaar.dev@gmail.com" whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                      style={{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 22px",borderRadius:12,border:`1px solid ${T.border}`,background:"rgba(255,255,255,0.04)",fontFamily:MONO,fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase" as const,color:T.faint,textDecoration:"none",transition:"all 0.2s"}}
                      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color="#fff";el.style.borderColor="rgba(255,255,255,0.28)"}}
                      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color=T.faint;el.style.borderColor=T.border}}>
                      <MailIcon size={13} /> Scrivimi
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        <Footer onContact={()=>setModalOpen(true)} />
      </div>
    </div>
  )
}

/* ── OfferCard ── */
function OfferCard({item,gradient}:{item:OfferItem;gradient:string}) {
  const [hov,setHov] = useState(false)
  return (
    <motion.div data-glow="" onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      whileHover={{y:-6,scale:1.015}} transition={{duration:0.28,ease}}
      style={{"--base":"28","--spread":"36","--radius":"18","--border":"1","--size":"200",height:"100%",position:"relative",borderRadius:18,padding:"28px 24px",background:hov?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.05)",border:`1px solid ${hov?"rgba(255,255,255,0.42)":"rgba(255,255,255,0.12)"}`,backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",boxShadow:hov?"inset 0 1px 0 rgba(255,255,255,0.63),0 20px 50px rgba(0,0,0,0.42)":"inset 0 1px 0 rgba(255,255,255,0.28),0 12px 36px rgba(0,0,0,0.28)",display:"flex",flexDirection:"column",gap:0,overflow:"hidden",transition:"background 0.25s,border-color 0.25s,box-shadow 0.3s"} as React.CSSProperties}>
      <div style={{width:44,height:44,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:hov?gradient:"rgba(255,255,255,0.06)",border:`1px solid ${hov?"transparent":"rgba(255,255,255,0.12)"}`,color:hov?"#fff":"rgba(255,255,255,0.70)",marginBottom:18,flexShrink:0,transition:"background 0.3s,color 0.3s,border-color 0.3s"}}>
        {item.icon}
      </div>
      <h3 style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:"#F0F3F9",marginBottom:10,lineHeight:1.25}}>{item.title}</h3>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:13.5,color:T.muted,lineHeight:1.75,flex:1}}>{item.desc}</p>
      <motion.div animate={{scaleX:hov?1:0}} transition={{duration:0.3,ease}}
        style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:gradient,transformOrigin:"left",borderRadius:"0 0 18px 18px"}} />
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
          style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${hov?accentColor:"rgba(255,255,255,0.16)"}`,flexShrink:0,position:"relative",zIndex:2,fontFamily:MONO,fontSize:10,fontWeight:600,color:hov?"#fff":"rgba(255,255,255,0.53)",letterSpacing:"0.10em",boxShadow:hov?`0 0 20px ${accentColor}`:"none",transition:"box-shadow 0.25s,border-color 0.25s"}}>
          {String(index+1).padStart(2,"0")}
        </motion.div>
      </div>
      {/* content */}
      <motion.div animate={{x:hov?4:0}} transition={{duration:0.22}}
        style={{padding:"0 0 0 4px"}}>
        <h3 style={{fontFamily:DISPLAY,fontSize:18,fontWeight:700,color:"#F0F3F9",lineHeight:1.25,marginBottom:10}}>{step.title}</h3>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:14.5,color:T.muted,lineHeight:1.78}}>{step.desc}</p>
        {!isLast && <div style={{width:"100%",height:1,background:"rgba(255,255,255,0.05)",marginTop:32}} />}
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   NAMED EXPORTS — one per route
══════════════════════════════════════════════════════════════════════════ */
export function EcommercePage()  { return <ServicePage data={SERVICES.ecommerce} /> }
export function CorporatePage()  { return <ServicePage data={SERVICES.corporate} /> }
export function WebAppPage()     { return <ServicePage data={SERVICES.webapp} /> }
export function SeoPage()        { return <ServicePage data={SERVICES.seo} /> }
export function AiPage()         { return <ServicePage data={SERVICES.ai} /> }
