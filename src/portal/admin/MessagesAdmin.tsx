import React, { useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { AdminHome } from "../../lib/api"
import { isUnreadFor, relativeDate, updateConversationStatus } from "../../lib/api"
import ChatThread from "../ChatThread"
import {
  Badge, Btn, CONVO_STATUS, DISPLAY, Empty, Glass, MONO, SectionTitle, T,
} from "../ui"

export default function MessagesAdmin({ home, adminId, reload }: {
  home: AdminHome
  adminId: string
  reload: () => void
}) {
  const toast = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const inbox = useMemo(() => {
    return home.threads
      .filter(c => !c.stageId)
      .sort((a, b) => {
        const ua = isUnreadFor(a, "admin") ? 0 : 1
        const ub = isUnreadFor(b, "admin") ? 0 : 1
        if (ua !== ub) return ua - ub
        if (a.status === "closed" && b.status !== "closed") return 1
        if (b.status === "closed" && a.status !== "closed") return -1
        return b.lastMessageAt.localeCompare(a.lastMessageAt)
      })
  }, [home.threads])

  const selected = inbox.find(c => c.id === selectedId) ?? null

  async function setStatus(status: "closed" | "open") {
    if (!selected) return
    try {
      await updateConversationStatus(selected.id, status)
      toast.info(status === "closed" ? "Conversazione chiusa" : "Conversazione riaperta")
      reload()
    } catch {
      toast.error("Operazione non riuscita.")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Messaggi"
        title="Inbox clienti"
        sub="Le discussioni di fase vivono nei dossier dei progetti."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, alignItems: "start" }}>
        {/* Thread list */}
        <Glass variant="panel" style={{ padding: 12, maxWidth: 420 }}>
          {inbox.length === 0 ? (
            <Empty icon="chat" title="Inbox vuota" hint="Le conversazioni dei clienti appariranno qui." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 580, overflowY: "auto" }}>
              {inbox.map(c => {
                const cs = CONVO_STATUS[c.status]
                const unread = isUnreadFor(c, "admin")
                const sel = c.id === selectedId
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={sel ? undefined : "portal-row"}
                    style={{
                      display: "flex", flexDirection: "column", gap: 5, textAlign: "left",
                      padding: "11px 13px", borderRadius: 11, cursor: "pointer",
                      background: sel ? "rgba(161,44,56,0.14)" : "transparent",
                      border: `1px solid ${sel ? "rgba(161,44,56,0.32)" : "transparent"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                      {unread && <span style={{ width: 7, height: 7, borderRadius: 99, background: T.copperLt, flexShrink: 0, boxShadow: "0 0 8px rgba(212,105,90,0.8)" }} />}
                      <span style={{
                        flex: 1, minWidth: 0, fontFamily: DISPLAY, fontSize: 12.5, fontWeight: unread ? 800 : 600,
                        color: c.status === "closed" ? T.faint : T.text,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {c.subject}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 8.5, color: T.ghost, flexShrink: 0 }}>{relativeDate(c.lastMessageAt)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: T.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.clientName ?? "—"}
                      </span>
                      <Badge tone={cs.tone} dot>{cs.label}</Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </Glass>

        {/* Thread pane */}
        <Glass variant="panel" style={{ padding: 18 }}>
          {selected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 800, color: T.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selected.subject}
                  </h3>
                  <p style={{ fontFamily: MONO, fontSize: 9.5, color: T.faint, margin: "4px 0 0" }}>{selected.clientName ?? "—"}</p>
                </div>
                {selected.status === "closed" ? (
                  <Btn size="sm" variant="outline" icon="play" onClick={() => setStatus("open")}>Riapri</Btn>
                ) : (
                  <Btn size="sm" variant="outline" icon="check" onClick={() => setStatus("closed")}>Chiudi</Btn>
                )}
              </div>
              <ChatThread conversation={selected} role="admin" authorId={adminId} height={460} onChanged={reload} />
            </div>
          ) : (
            <Empty icon="chat" title="Seleziona una conversazione" hint="I messaggi non letti sono in cima alla lista." />
          )}
        </Glass>
      </div>
    </div>
  )
}
