import React, { useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { FoundryLead, LeadStatus } from "../../lib/api"
import { deleteLead, fmtDateTime, relativeDate, updateLead } from "../../lib/api"
import {
  Badge, Btn, DISPLAY, Empty, Field, Glass, Icon, MONO, SectionTitle, Select,
  T, Tabs, Textarea, type Tone,
} from "../ui"

/* ══════════════════════════════════════════════════════════════════════════
   RICHIESTE DAL CONFIGURATORE
   Elenco dei lead generati dal Solution Architect in home page: contatto,
   architettura scelta e resoconto. Vista densa e opaca, come le altre
   schermate operative dell'area admin.
══════════════════════════════════════════════════════════════════════════ */

const STATUS: Record<LeadStatus, { label: string; tone: Tone }> = {
  new:       { label: "Nuova",      tone: "copper" },
  contacted: { label: "Contattato", tone: "green" },
  archived:  { label: "Archiviata", tone: "steel" },
}

const GROUP_LABEL: Record<string, string> = {
  base:    "Funzionalità base",
  control: "Dashboard & Controllo",
  agents:  "Agenti AI & Automazioni",
  growth:  "SEO & Crescita",
  brand:   "Brand & Design",
}

type Filter = "nuove" | "tutte"

export default function LeadsAdmin({ leads, reload }: { leads: FoundryLead[]; reload: () => void }) {
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>("nuove")
  const [openId, setOpenId] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)

  const newCount = useMemo(() => leads.filter(l => l.status === "new").length, [leads])
  const list = filter === "nuove" ? leads.filter(l => l.status !== "archived") : leads

  function toggle(l: FoundryLead) {
    if (openId === l.id) { setOpenId(null); return }
    setNote(l.adminNote ?? "")
    setOpenId(l.id)
  }

  async function save(l: FoundryLead, patch: { status?: LeadStatus; adminNote?: string }) {
    if (busy) return
    setBusy(true)
    try {
      await updateLead(l.id, patch)
      toast.success("Richiesta aggiornata")
      reload()
    } catch {
      toast.error("Aggiornamento non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  async function remove(l: FoundryLead) {
    if (busy) return
    setBusy(true)
    try {
      await deleteLead(l.id)
      setOpenId(null)
      toast.success("Richiesta eliminata")
      reload()
    } catch {
      toast.error("Eliminazione non riuscita.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Configuratore"
        title="Richieste di architettura"
        sub="Configurazioni inviate dal Solution Architect in home page."
        right={
          <Tabs
            value={filter}
            onChange={setFilter}
            items={[
              { id: "nuove", label: "Da gestire", badge: newCount || undefined },
              { id: "tutte", label: "Tutte" },
            ]}
          />
        }
      />

      {list.length === 0 ? (
        <Empty
          icon="bolt"
          title="Nessuna richiesta"
          hint="Le configurazioni inviate dal sito compaiono qui, in tempo reale."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(l => {
            const open = openId === l.id
            const st = STATUS[l.status]
            return (
              <Glass key={l.id} variant="raised" style={{ padding: 0, overflow: "hidden" }}>
                {/* riga compatta */}
                <button
                  onClick={() => toggle(l)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                    background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                    color: T.text, fontFamily: "inherit", textTransform: "none", letterSpacing: "normal",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: T.text }}>{l.name}</span>
                      <Badge tone={st.tone} dot={l.status === "new"}>{st.label}</Badge>
                      <Badge tone={l.source === "contatti" ? "steel" : "copper"}>
                        {l.source === "contatti" ? "Modulo contatti" : "Configuratore"}
                      </Badge>
                      {/* niente badge sulla copia email: la notifica passa da
                          Telegram e la copia al cliente è disattivata, quindi
                          comparirebbe su ogni riga senza dire nulla. Il campo
                          emailSent resta, se un giorno le email si accendono. */}
                    </div>
                    {/* Una richiesta dal modulo contatti non ha architettura né
                        moduli: mostrarne il conteggio a zero direbbe il falso.
                        Al suo posto l'azienda e l'inizio del messaggio. */}
                    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", color: T.muted }}>
                      {l.source === "contatti"
                        ? [l.company, l.message?.replace(/\s+/g, " ").slice(0, 60)].filter(Boolean).join(" · ") || "—"
                        : `${l.vectorNode} · ${l.modules.length} ${l.modules.length === 1 ? "modulo" : "moduli"}${l.complexity ? ` · ${l.complexity} · ${l.weeks ?? ""}` : ""}`}
                    </div>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: T.muted, flexShrink: 0 }}>
                    {relativeDate(l.createdAt)}
                  </span>
                  <Icon name={open ? "chevronD" : "chevronR"} size={16} />
                </button>

                {open && (
                  <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ height: 1, background: "rgba(255,255,255,0.10)" }} />

                    {/* contatto */}
                    <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
                      <LeadFact k="Email" v={<a href={`mailto:${l.email}`} style={{ color: T.text }}>{l.email}</a>} />
                      {l.messenger && <LeadFact k="Telegram / WhatsApp" v={l.messenger} />}
                      {l.company && <LeadFact k="Azienda" v={l.company} />}
                      <LeadFact k="Ricevuta" v={fmtDateTime(l.createdAt)} />
                      {l.vectorStack && <LeadFact k="Stack" v={l.vectorStack} />}
                    </div>

                    {/* il messaggio: è tutto ciò che una richiesta dal modulo
                        contatti porta con sé, quindi va per esteso e per primo */}
                    {l.message && <LeadBlock k="Messaggio" v={l.message} />}

                    {/* architettura */}
                    {l.blueprint && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <LeadBlock k="Obiettivo" v={l.blueprint.obiettivo} />
                        <LeadBlock k="Architettura" v={l.blueprint.architettura} />
                      </div>
                    )}

                    {/* moduli raggruppati */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {Object.entries(
                        l.modules.reduce<Record<string, typeof l.modules>>((acc, m) => {
                          ;(acc[m.group] ??= []).push(m)
                          return acc
                        }, {}),
                      ).map(([group, mods]) => (
                        <div key={group}>
                          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>
                            {GROUP_LABEL[group] ?? group}
                          </div>
                          {mods.map(m => (
                            <div key={m.node} style={{ marginBottom: 8 }}>
                              <div style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 700, color: T.text }}>{m.node}</div>
                              <div style={{ fontSize: 13, lineHeight: 1.55, color: T.muted }}>{m.tech}</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* gestione */}
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 180px", gap: 12, alignItems: "start" }}>
                      <Field label="Nota interna">
                        <Textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                          placeholder="Esito del contatto, prossimi passi…" />
                      </Field>
                      <Field label="Stato">
                        <Select value={l.status} onChange={e => save(l, { status: e.target.value as LeadStatus })}>
                          {(Object.keys(STATUS) as LeadStatus[]).map(s => (
                            <option key={s} value={s}>{STATUS[s].label}</option>
                          ))}
                        </Select>
                      </Field>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Btn onClick={() => save(l, { adminNote: note })} disabled={busy}>Salva nota</Btn>
                      <Btn variant="ghost" onClick={() => { window.location.href = `mailto:${l.email}` }}>Rispondi</Btn>
                      <Btn variant="ghost" onClick={() => remove(l)} disabled={busy}>Elimina</Btn>
                    </div>
                  </div>
                )}
              </Glass>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LeadFact({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.muted, marginBottom: 3 }}>{k}</div>
      <div style={{ fontSize: 13.5, color: T.text }}>{v}</div>
    </div>
  )
}

function LeadBlock({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: T.muted, marginBottom: 4 }}>{k}</div>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.text, margin: 0 }}>{v}</p>
    </div>
  )
}
