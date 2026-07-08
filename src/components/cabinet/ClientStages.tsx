/**
 * ClientStages — client-side view of a project's stages (Fasi) inside the
 * "Progetto" section. Read-only stage progression (the admin advances stages)
 * with a per-stage discussion thread the client can write to + attach files.
 */
import React, { useCallback, useEffect, useState } from "react"
import { fetchProjectStages, type ProjectStage } from "../../lib/adminApi"
import { supabase, SUPABASE_READY } from "../../lib/supabase"
import StageChat from "../admin/StageChat"

const COPPER = "#B04A38"
const GREEN  = "#10B981"

const CFG: Record<ProjectStage["status"], { color: string; label: string }> = {
  locked: { color: "rgba(255,255,255,0.35)", label: "In attesa" },
  active: { color: COPPER,                    label: "In corso" },
  done:   { color: GREEN,                     label: "Completato" },
}

const DISPLAY = "'Plus Jakarta Sans',system-ui,sans-serif"
const MONO    = "'JetBrains Mono',monospace"

export default function ClientStages({ projectId, clientId }: { projectId: string; clientId: string }) {
  const [stages,  setStages]  = useState<ProjectStage[]>([])
  const [loading, setLoading] = useState(true)
  const [openId,  setOpenId]  = useState<string | null>(null)

  const load = useCallback(() => {
    fetchProjectStages(projectId).then(setStages).catch(() => {}).finally(() => setLoading(false))
  }, [projectId])
  useEffect(() => { load() }, [load])

  /* Realtime: reflect the admin advancing / editing stages live */
  useEffect(() => {
    if (!SUPABASE_READY) return
    const ch = supabase.channel(`client-stages-${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "project_stages", filter: `project_id=eq.${projectId}` }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [projectId, load])

  // auto-open the active stage the first time
  useEffect(() => {
    if (!openId && stages.length) {
      const active = stages.find(s => s.status === "active")
      if (active) setOpenId(active.id)
    }
  }, [stages, openId])

  const done = stages.filter(s => s.status === "done").length
  const pct  = stages.length ? Math.round((done / stages.length) * 100) : 0

  if (loading) return <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.25)", padding: "20px 0" }}>Caricamento fasi…</div>
  if (stages.length === 0) return null

  return (
    <div style={{ marginTop: 28 }}>
      {/* Header + progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>Fasi del progetto</span>
        <div style={{ flex: 1, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${COPPER}, ${GREEN})`, borderRadius: 99, transition: "width 0.6s" }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: COPPER }}>{done}/{stages.length}</span>
      </div>

      {/* Stage list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stages.map((s, idx) => {
          const cfg = CFG[s.status]
          const isOpen = openId === s.id
          const locked = s.status === "locked"
          return (
            <div key={s.id} style={{
              background: isOpen ? "rgba(30,37,48,0.60)" : "rgba(30,37,48,0.45)",
              border: `1px solid ${isOpen ? "rgba(176,74,56,0.30)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 14, overflow: "hidden", opacity: locked ? 0.75 : 1,
            }}>
              <button onClick={() => setOpenId(isOpen ? null : s.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: MONO, fontSize: 11, fontWeight: 700, background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}45` }}>
                  {s.status === "done" ? "✓" : idx + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: locked ? "rgba(255,255,255,0.50)" : "#fff" }}>{s.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: cfg.color }}>{cfg.label}</div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{isOpen ? "Chiudi" : "Discuti"}</span>
              </button>
              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 18px" }}>
                  <StageChat projectId={projectId} clientId={clientId} stage={s} authorRole="client" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
