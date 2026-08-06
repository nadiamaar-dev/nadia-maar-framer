import React from "react"
import type { AdminProject, ClientRecord } from "../../lib/api"
import { fmtDate, fmtEur } from "../../lib/api"
import {
  Avatar, Badge, CLIENT_PLAN, CLIENT_STATUS, DISPLAY, Glass, Icon, MONO,
  PROJECT_STATUS, T, TONE, type Tone,
} from "../ui"
import type { ClientLens } from "./clientLens"

/* ══════════════════════════════════════════════════════════════════════════
   SCHEDE — un cliente, una scheda. Un progetto, una scheda.

   Prima erano righe in un pannello unico: separate solo da un hover, quindi
   a colpo d'occhio erano un blocco solo e per capire dove finiva un cliente
   e cominciava il successivo bisognava leggere. Una scheda è un oggetto —
   ha un bordo, un'ombra, un colore in cima che dice come sta — e si conta
   senza leggere.

   Il filo di colore in alto è l'unica cosa che distingue le schede fra loro
   a distanza: verde tutto a posto, ambra qualcosa aspetta, rosso qualcosa è
   in ritardo, grigio archiviato.
══════════════════════════════════════════════════════════════════════════ */

export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(min(330px, 100%), 1fr))",
      gap: 14, alignItems: "stretch",
    }}>
      {children}
    </div>
  )
}

function Card({ tone, onClick, muted = false, children }: {
  tone: Tone
  onClick: () => void
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <Glass variant="work" style={{
      padding: 0, borderTop: `2px solid ${TONE[tone].fg}`,
      opacity: muted ? 0.7 : 1, display: "flex",
    }}>
      <button
        type="button"
        onClick={onClick}
        className="pt-card"
        style={{
          display: "flex", flexDirection: "column", gap: 13, width: "100%", textAlign: "left",
          padding: "16px 18px 15px", background: "none", border: "none", borderRadius: 15,
          cursor: "pointer", font: "inherit",
        }}
      >
        {children}
      </button>
    </Glass>
  )
}

/** Piede della scheda: i numeri, separati dal corpo da una riga sottile. */
function Foot({ items }: { items: { label: string; value: string; warn?: boolean }[] }) {
  return (
    <div style={{
      display: "flex", gap: 18, flexWrap: "wrap", width: "100%",
      marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${T.border}`,
    }}>
      {items.map(i => (
        <div key={i.label} style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: MONO, fontSize: 14, fontWeight: 700, margin: 0,
            color: i.warn ? T.amber : T.text, whiteSpace: "nowrap",
          }}>
            {i.value}
          </p>
          <p style={{
            fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase",
            color: T.secondary, margin: "3px 0 0", whiteSpace: "nowrap",
          }}>
            {i.label}
          </p>
        </div>
      ))}
    </div>
  )
}

/* ── Cliente ─────────────────────────────────────────────────────────── */

export function ClientCard({ c, lens, onOpen }: {
  c: ClientRecord
  lens: ClientLens
  onOpen: () => void
}) {
  const archived = c.status === "archived"
  const cs = CLIENT_STATUS[c.status]

  /* Ogni voce è una cosa da fare, scritta come si direbbe a voce — singolare
     compreso: «1 incassi da confermare» fa sembrare l'interfaccia un
     tabulato invece di una frase. */
  const n = (k: number, uno: string, molti: string) => `${k} ${k === 1 ? uno : molti}`
  const todos: { label: string; tone: Tone }[] = []
  if (lens.pendingProjects) todos.push({ label: n(lens.pendingProjects, "progetto da valutare", "progetti da valutare"), tone: "amber" })
  if (lens.unread) todos.push({ label: n(lens.unread, "filo da leggere", "fili da leggere"), tone: "copper" })
  if (lens.openTickets) todos.push({ label: n(lens.openTickets, "richiesta aperta", "richieste aperte"), tone: "red" })
  if (lens.pendingMeetings) todos.push({ label: n(lens.pendingMeetings, "riunione da confermare", "riunioni da confermare"), tone: "amber" })
  if (lens.declaredInvoices) todos.push({ label: n(lens.declaredInvoices, "incasso da confermare", "incassi da confermare"), tone: "copper" })
  if (lens.overdueInvoices) todos.push({ label: n(lens.overdueInvoices, "fattura scaduta", "fatture scadute"), tone: "red" })

  /* Il colore in cima riassume la scheda: il rosso vince perché è quello che
     non può aspettare, il verde resta solo se non c'è davvero nulla. */
  const tone: Tone = archived ? "steel"
    : lens.overdueInvoices || lens.openTickets ? "red"
    : lens.todo > 0 ? "amber"
    : "green"

  return (
    <Card tone={tone} onClick={onOpen} muted={archived}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%" }}>
        <Avatar name={c.company} size={38} tone={archived ? "steel" : "copper"} textColor="#FFFFFF" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: T.text, margin: 0,
            letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {c.company}
          </p>
          <p style={{
            fontFamily: DISPLAY, fontSize: 13.5, color: T.secondary, margin: "3px 0 0",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {c.contact !== "—" ? c.contact : c.email}
          </p>
        </div>
        <Icon name="chevronR" size={15} />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Badge tone={cs.tone} dot>{cs.label}</Badge>
        <Badge tone={CLIENT_PLAN[c.plan].tone}>{CLIENT_PLAN[c.plan].label}</Badge>
      </div>

      {todos.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {todos.map(t => <Badge key={t.label} tone={t.tone} dot>{t.label}</Badge>)}
        </div>
      )}

      <Foot items={[
        { label: archived ? "progetti" : "in corso", value: String(archived ? c.projectsTotal : c.projectsActive) },
        lens.dueAmount > 0
          ? { label: "da incassare", value: fmtEur(lens.dueAmount), warn: true }
          : { label: "incassato", value: fmtEur(lens.paidAmount) },
        { label: "cliente dal", value: c.joinedAt ? fmtDate(c.joinedAt) : "—" },
      ]} />
    </Card>
  )
}

/* ── Progetto ────────────────────────────────────────────────────────── */

export function ProjectCard({ p, unread, onOpen, showClient = true }: {
  p: AdminProject
  unread: number
  onOpen: () => void
  /** dentro la scheda di un cliente il suo nome sarebbe ripetuto su ogni card */
  showClient?: boolean
}) {
  const st = PROJECT_STATUS[p.status]
  const done = p.status === "completed"

  return (
    <Card tone={st.tone} onClick={onOpen} muted={done}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%" }}>
        <span style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: TONE[st.tone].bg, border: `1px solid ${TONE[st.tone].bd}`, color: TONE[st.tone].tx,
        }}>
          <Icon name="folder" size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: T.text, margin: 0,
            letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {p.name}
          </p>
          {showClient && (
            <p style={{
              fontFamily: DISPLAY, fontSize: 13.5, color: T.secondary, margin: "3px 0 0",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {p.clientName}
            </p>
          )}
        </div>
        <Icon name="chevronR" size={15} />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Badge tone={st.tone} dot>{st.label}</Badge>
        {unread > 0 && <Badge tone="copper" dot>{unread} da leggere</Badge>}
      </div>

      {p.description && (
        <p className="pt-body" style={{
          fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.55, color: T.secondary, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {p.description}
        </p>
      )}

      <Foot items={[
        { label: "aperto il", value: fmtDate(p.createdAt) },
        ...(p.brief?.budgetRange ? [{ label: "budget", value: p.brief.budgetRange }] : []),
        ...(p.brief?.deadline ? [{ label: "scadenza", value: p.brief.deadline }] : []),
      ]} />
    </Card>
  )
}
