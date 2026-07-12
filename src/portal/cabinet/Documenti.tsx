import React, { useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { ClientDocument, ClientHome } from "../../lib/api"
import { fmtDate, getDocumentDownloadUrl, signDocument } from "../../lib/api"
import { Badge, Btn, DISPLAY, DOC_TYPE, Empty, Glass, Icon, MONO, SectionTitle, Stat, T } from "../ui"

function fmtBytes(n: number): string {
  if (!n) return "—"
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export default function Documenti({ home, reload }: { home: ClientHome; userId: string; reload: () => void }) {
  const toast = useToast()
  const [signing, setSigning] = useState<string | null>(null)
  const docs = home.documents
  const toSign = docs.filter(d => d.requiresSignature && !d.signedAt)

  async function sign(d: ClientDocument) {
    if (signing) return
    setSigning(d.id)
    try {
      await signDocument(d.id)
      toast.success("Documento firmato")
      reload()
    } catch {
      toast.error("Firma non riuscita.")
    } finally {
      setSigning(null)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle kicker="Documenti" title="Contratti & documenti" sub="Contratti, preventivi e materiali di consegna condivisi dallo studio." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Stat label="Totale" value={String(docs.length)} icon="doc" tone="silver" />
        <Stat label="Da firmare" value={String(toSign.length)} icon="edit" tone={toSign.length > 0 ? "amber" : "green"} hint={toSign.length > 0 ? "richiedono la tua firma" : "tutto firmato"} />
      </div>

      <Glass variant="panel" style={{ padding: 20 }}>
        {docs.length === 0 ? (
          <Empty icon="doc" title="Nessun documento" hint="Contratti e documenti condivisi dallo studio appariranno qui." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {docs.map(d => {
              const meta = DOC_TYPE[d.type]
              const pending = d.requiresSignature && !d.signedAt
              return (
                <div key={d.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 13,
                  background: pending ? "rgba(252,211,77,0.06)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${pending ? "rgba(252,211,77,0.28)" : T.border}`,
                  borderLeft: pending ? "2px solid rgba(252,211,77,0.6)" : undefined,
                }}>
                  <span style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `rgba(224,131,106,0.12)`, border: `1px solid rgba(224,131,106,0.28)`, color: T.copperLt,
                  }}>
                    <Icon name={meta.icon} size={17} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: T.faint }}>
                        {fmtDate(d.uploadedAt)} · {fmtBytes(d.sizeBytes)}
                      </span>
                      {d.signedAt && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: MONO, fontSize: 9, color: T.green }}>
                          <Icon name="checkCircle" size={11} /> Firmato {fmtDate(d.signedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {pending && (
                      <Btn size="sm" variant="primary" icon="check" busy={signing === d.id} onClick={() => sign(d)}>
                        Firma
                      </Btn>
                    )}
                    {d.storagePath && (
                      <a href={getDocumentDownloadUrl(d)} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex" }}>
                        <Btn size="sm" variant="ghost" icon="download">Scarica</Btn>
                      </a>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Glass>
    </div>
  )
}
