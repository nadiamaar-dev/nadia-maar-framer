import React from "react"
import { Badge, Btn, DISPLAY, Glass, Icon, MONO, SectionTitle, T, TONE, type IconName, type Tone } from "../../ui"

/* ══════════════════════════════════════════════════════════════════════════
   COLLEGAMENTI RAPIDI.

   Non è un elenco di segnalibri: è la risposta a «dove si guarda quando
   qualcosa non va». Ogni scheda dice a cosa serve quel pannello, così chi
   apre questa pagina alle due di notte non deve ricordarselo.

   Le variabili d'ambiente sono elencate per NOME e mai per valore: i loro
   valori stanno su Vercel e non devono transitare da qui. La tabella dice
   quali esistono, a cosa servono e cosa smette di funzionare se mancano.
══════════════════════════════════════════════════════════════════════════ */

const SUPABASE_REF = "htzgtdmetfecxbygebkb"

type LinkCard = {
  icon: IconName
  tone: Tone
  title: string
  what: string
  when: string
  href: string
  cta: string
}

const CARDS: LinkCard[] = [
  {
    icon: "bolt", tone: "silver",
    title: "Vercel",
    what: "Deploy, log delle funzioni serverless, variabili d'ambiente, domini.",
    when: "Quando il sito è online ma un modulo tace: i log di /api/ stanno qui.",
    href: "https://vercel.com/dashboard",
    cta: "Apri la dashboard",
  },
  {
    icon: "layers", tone: "green",
    title: "Supabase Studio",
    what: "Tabelle, RLS, SQL editor, autenticazione e storage.",
    when: "Quando un dato non compare: quasi sempre è una policy, non un bug.",
    href: `https://supabase.com/dashboard/project/${SUPABASE_REF}`,
    cta: "Apri il progetto",
  },
  {
    icon: "doc", tone: "copper",
    title: "Editor SQL",
    what: "Query dirette sul database di produzione.",
    when: "Per una verifica veloce, e per le migrazioni applicate a mano.",
    href: `https://supabase.com/dashboard/project/${SUPABASE_REF}/sql/new`,
    cta: "Nuova query",
  },
  {
    icon: "warn", tone: "amber",
    title: "Log e advisor Supabase",
    what: "Errori PostgREST, avvisi di sicurezza e di performance.",
    when: "Prima di ogni pubblicazione importante, e dopo ogni migrazione.",
    href: `https://supabase.com/dashboard/project/${SUPABASE_REF}/advisors/security`,
    cta: "Controlla gli avvisi",
  },
  {
    icon: "search", tone: "silver",
    title: "Google Search Console",
    what: "Indicizzazione, query di ricerca, copertura e sitemap.",
    when: "Dopo aver cambiato metadati: qui si vede se Google li ha recepiti.",
    href: "https://search.google.com/search-console",
    cta: "Apri Search Console",
  },
  {
    icon: "bolt", tone: "green",
    title: "PageSpeed Insights",
    what: "Misura pubblica delle prestazioni, con dati reali di campo.",
    when: "Dopo ogni modifica alla home o alle immagini.",
    href: "https://pagespeed.web.dev/",
    cta: "Apri PageSpeed",
  },
]

type EnvVar = { name: string; what: string; missing: string; required: boolean }

const ENV_VARS: EnvVar[] = [
  { name: "VITE_SUPABASE_URL", what: "Endpoint del progetto Supabase.", missing: "Il sito parte ma senza dati: portale, lead e impostazioni tacciono.", required: true },
  { name: "VITE_SUPABASE_ANON_KEY", what: "Chiave pubblica, protetta dalla RLS.", missing: "Come sopra.", required: true },
  { name: "SITE_URL", what: "Dominio pubblico canonico.", missing: "sitemap.xml e llms.txt useranno l'host della richiesta: su una preview elencano URL di preview.", required: false },
  { name: "IP_SALT", what: "Sale per l'impronta anonima degli IP.", missing: "Si usa un sale di ripiego: le impronte restano anonime ma vanno rese uniche.", required: false },
  { name: "PAGESPEED_API_KEY", what: "Alza la quota dell'API PageSpeed.", missing: "Le misure funzionano lo stesso, con quota ridotta.", required: false },
  { name: "TELEGRAM_BOT_TOKEN", what: "Bot che riceve le notifiche.", missing: "Nessuna notifica per lead e attività del portale.", required: false },
  { name: "TELEGRAM_CHAT_ID", what: "Chat di destinazione.", missing: "Come sopra.", required: false },
  { name: "NOTIFY_SECRET", what: "Segreto condiviso col Vault di Supabase.", missing: "/api/notify rifiuta tutto: le notifiche dal database non partono.", required: false },
  { name: "RESEND_API_KEY", what: "Invio email ai clienti.", missing: "Le email restano dormienti (voluto finché non c'è un dominio mittente).", required: false },
]

export default function DeveloperIntegrations() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px,100%),1fr))", gap: 14 }}>
        {CARDS.map(c => (
          <Glass key={c.title} variant="work" style={{ padding: 0, borderTop: `2px solid ${TONE[c.tone].fg}`, display: "flex" }}>
            <a
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="pt-card"
              style={{
                display: "flex", flexDirection: "column", gap: 11, width: "100%",
                padding: "16px 18px 15px", borderRadius: 15, textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: TONE[c.tone].bg, border: `1px solid ${TONE[c.tone].bd}`, color: TONE[c.tone].tx,
                }}>
                  <Icon name={c.icon} size={16} />
                </span>
                <span style={{ flex: 1, fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: T.text }}>{c.title}</span>
                <Icon name="external" size={14} />
              </div>
              <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.55, color: T.secondary, margin: 0 }}>
                {c.what}
              </p>
              <p style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.5, color: T.secondary, margin: 0 }}>
                {c.when}
              </p>
              <span style={{ marginTop: "auto", paddingTop: 11, borderTop: `1px solid ${T.border}`, width: "100%" }}>
                <span style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700, color: T.copperTx }}>{c.cta} →</span>
              </span>
            </a>
          </Glass>
        ))}
      </div>

      <Glass variant="panel" style={{ padding: 20 }}>
        <SectionTitle
          kicker="Riferimento"
          title="Variabili d'ambiente"
          sub="Solo i nomi: i valori vivono su Vercel e non passano da questa pagina."
          right={
            <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex" }}>
              <Btn variant="outline" icon="external">Gestisci su Vercel</Btn>
            </a>
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 16 }}>
          {ENV_VARS.map(v => (
            <div key={v.name} style={{
              display: "flex", gap: 13, alignItems: "flex-start", padding: "12px 0",
              borderTop: `1px solid ${T.border}`,
            }}>
              <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {/* VITE_SUPABASE_ANON_KEY è più largo della colonna su uno
                      schermo stretto: un nome di variabile va a capo, non fuori. */}
                  <code style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: T.text, overflowWrap: "anywhere", minWidth: 0 }}>{v.name}</code>
                  <Badge tone={v.required ? "copper" : "steel"}>{v.required ? "Obbligatoria" : "Opzionale"}</Badge>
                </div>
                <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13.5, color: T.secondary, margin: "5px 0 0", lineHeight: 1.5 }}>
                  {v.what}
                </p>
              </div>
              <p style={{
                flex: "1 1 240px", minWidth: 0, fontFamily: MONO, fontSize: 12, lineHeight: 1.5,
                color: T.secondary, margin: 0,
              }}>
                Se manca: {v.missing}
              </p>
            </div>
          ))}
        </div>
      </Glass>

      <Glass variant="panel" style={{ padding: 20 }}>
        <SectionTitle kicker="Generati dal database" title="File per i motori e per le AI"
          sub="Si aggiornano da soli a ogni salvataggio: non c'è nessun pulsante di sincronizzazione da premere." />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 16 }}>
          {[
            { path: "/robots.txt", what: "Regole per Googlebot, Bingbot e i bot delle AI. Riflette i noindex e l'interruttore /foundry." },
            { path: "/sitemap.xml", what: "Le pagine indicizzabili, con la data dell'ultima modifica presa dalle schede SEO." },
            { path: "/llms.txt", what: "Indice e regole d'uso per GPTBot, ClaudeBot e PerplexityBot." },
          ].map(f => (
            <div key={f.path} style={{
              display: "flex", gap: 13, alignItems: "center", padding: "12px 0", borderTop: `1px solid ${T.border}`, flexWrap: "wrap",
            }}>
              <code style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: T.text, minWidth: 120 }}>{f.path}</code>
              <p className="pt-body" style={{ flex: "1 1 240px", fontFamily: DISPLAY, fontSize: 13.5, color: T.secondary, margin: 0, lineHeight: 1.5 }}>
                {f.what}
              </p>
              <a href={f.path} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex" }}>
                <Btn size="sm" variant="ghost" icon="external">Apri</Btn>
              </a>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  )
}
