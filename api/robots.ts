/* ══════════════════════════════════════════════════════════════════════════
   /robots.txt — generato, non scritto a mano.

   È dinamico per una ragione sola: quando una pagina viene marcata
   `is_noindex` nel pannello, o quando /foundry viene spento, il robots.txt
   deve dirlo subito. Un file statico in public/ resterebbe a raccontare la
   configurazione del giorno del deploy.

   Sui bot delle AI la posizione è esplicita e permissiva: il sito vende
   competenza, e comparire nelle risposte di ChatGPT o Perplexity è
   distribuzione, non furto. Chi volesse invertirla cambia ALLOW_AI qui.
══════════════════════════════════════════════════════════════════════════ */

import { type EdgeReq, type EdgeRes, originOf, pgSelect, text } from "../src/lib/edge.js"

const PRIVATE = ["/cabinet", "/dashboard", "/api/"]

/** I bot che addestrano o rispondono con contenuti altrui. */
const AI_AGENTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-Web", "anthropic-ai",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "Amazonbot",
]

const ALLOW_AI = true

export default async function handler(req: EdgeReq, res: EdgeRes) {
  const origin = originOf(req)

  const [settings, noindex] = await Promise.all([
    pgSelect<{ foundry_enabled: boolean; maintenance_mode: boolean }>("public_site_settings?select=foundry_enabled,maintenance_mode&limit=1"),
    pgSelect<{ page_slug: string }>("page_seo_configs?select=page_slug&is_noindex=eq.true"),
  ])
  const s = settings[0]
  const blocked = [
    ...PRIVATE,
    ...noindex.map(r => r.page_slug).filter(p => p && p !== "/"),
    ...(s && s.foundry_enabled === false ? ["/foundry"] : []),
  ]
  /* In manutenzione si chiude tutto: far indicizzare una tenda di cortesia
     al posto della home è il modo più rapido di perdere il posizionamento. */
  const shutdown = s?.maintenance_mode === true

  const lines: string[] = []

  if (shutdown) {
    lines.push("# Sito in manutenzione — indicizzazione sospesa", "User-agent: *", "Disallow: /", "")
  } else {
    lines.push("User-agent: *")
    for (const p of blocked) lines.push(`Disallow: ${p}`)
    lines.push("Allow: /", "")

    /* Googlebot e Bingbot elencati a parte: alcuni crawler applicano solo il
       blocco più specifico che li nomina, quindi ripetere le regole evita di
       lasciarli sotto il solo "*" con esiti diversi fra motori. */
    for (const agent of ["Googlebot", "Bingbot"]) {
      lines.push(`User-agent: ${agent}`)
      for (const p of blocked) lines.push(`Disallow: ${p}`)
      lines.push("Allow: /", "")
    }

    for (const agent of AI_AGENTS) {
      lines.push(`User-agent: ${agent}`)
      if (ALLOW_AI) {
        for (const p of blocked) lines.push(`Disallow: ${p}`)
        lines.push("Allow: /")
      } else {
        lines.push("Disallow: /")
      }
      lines.push("")
    }

    lines.push("# Indice e regole per gli LLM", `# ${origin}/llms.txt`, "")
  }

  lines.push(`Sitemap: ${origin}/sitemap.xml`)

  /* Cache breve: un interruttore girato in pannello deve valere in minuti,
     non in ore. */
  text(res, lines.join("\n"), 300)
}
