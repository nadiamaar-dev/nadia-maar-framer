import React, { useEffect, useMemo, useState } from "react"
import { useToast } from "../../../context/ToastContext"
import type { PageSeoConfig } from "../../../lib/api"
import {
  buildJsonLd, deleteSeoConfig, saveSeoConfig, SEO_LIMITS, seoHealth, SITE_ROUTES,
  type JsonLdKind, type SeoDraft,
} from "../../../lib/api"
import {
  Badge, Btn, ConfirmDialog, DISPLAY, Field, Glass, Icon, Input, MONO, Modal, Note, Row,
  Select, T, Textarea,
} from "../../ui"

/* ══════════════════════════════════════════════════════════════════════════
   EDITOR SEO PER PAGINA.

   Due idee guidano questa schermata:

   · Il contatore dei caratteri è giallo, mai rosso. Google non taglia a un
     numero di caratteri ma a una larghezza in pixel: superare 60 non è un
     errore, è un rischio. Colorarlo di rosso insegnerebbe una regola falsa.

   · L'anteprima mostra il risultato, non i campi. Un titolo si giudica
     vedendolo come apparirà nei risultati di ricerca e nell'anteprima di
     WhatsApp, non leggendolo dentro una casella di testo.
══════════════════════════════════════════════════════════════════════════ */

const EMPTY: SeoDraft = {
  pageSlug: "/", metaTitle: "", metaDescription: "", ogImageUrl: "",
  keywords: [], canonicalUrl: "", isNoindex: false, jsonLdSchema: undefined,
}

export default function PageSeoEditor({ configs, reload, siteOrigin, defaults }: {
  configs: PageSeoConfig[]
  reload: () => void
  siteOrigin: string
  defaults: { title?: string; description?: string; image?: string }
}) {
  const toast = useToast()
  const [editing, setEditing] = useState<SeoDraft | null>(null)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState<PageSeoConfig | null>(null)
  const [kwInput, setKwInput] = useState("")

  const bySlug = useMemo(() => new Map(configs.map(c => [c.pageSlug, c])), [configs])

  /* Tutte le rotte del sito, non solo quelle già configurate: una pagina
     senza scheda è proprio quella su cui bisogna intervenire, e se non
     comparisse nell'elenco non si saprebbe che esiste. */
  const rows = useMemo(() => {
    const known = SITE_ROUTES.map(r => ({ ...r, cfg: bySlug.get(r.slug) }))
    const extra = configs
      .filter(c => !SITE_ROUTES.some(r => r.slug === c.pageSlug))
      .map(c => ({ slug: c.pageSlug, label: c.pageSlug, cfg: c }))
    return [...known, ...extra]
  }, [configs, bySlug])

  function open(slug: string, cfg?: PageSeoConfig) {
    setExistingId(cfg?.id ?? null)
    setKwInput("")
    setEditing(cfg
      ? { pageSlug: cfg.pageSlug, metaTitle: cfg.metaTitle ?? "", metaDescription: cfg.metaDescription ?? "",
          ogImageUrl: cfg.ogImageUrl ?? "", keywords: cfg.keywords, canonicalUrl: cfg.canonicalUrl ?? "",
          isNoindex: cfg.isNoindex, jsonLdSchema: cfg.jsonLdSchema }
      : { ...EMPTY, pageSlug: slug })
  }

  async function save() {
    if (!editing || busy) return
    setBusy(true)
    try {
      await saveSeoConfig(editing)
      toast.success(`Scheda salvata per ${editing.pageSlug}`)
      setEditing(null)
      reload()
    } catch {
      toast.error("Salvataggio non riuscito.")
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!removing) return
    try {
      await deleteSeoConfig(removing.id)
      toast.info("Scheda eliminata — la pagina torna ai metadati predefiniti")
      reload()
    } catch {
      toast.error("Eliminazione non riuscita.")
    } finally {
      setRemoving(null)
    }
  }

  function addKeyword() {
    const raw = kwInput.split(",").map(s => s.trim()).filter(Boolean)
    if (!raw.length || !editing) return
    setEditing({ ...editing, keywords: Array.from(new Set([...editing.keywords, ...raw])).slice(0, 25) })
    setKwInput("")
  }

  function genJsonLd(kind: JsonLdKind) {
    if (!editing) return
    setEditing({
      ...editing,
      jsonLdSchema: buildJsonLd(kind, {
        name: editing.metaTitle || defaults.title || "Nadia Maar",
        url: `${siteOrigin}${editing.pageSlug}`,
        description: editing.metaDescription || defaults.description,
        logo: editing.ogImageUrl || defaults.image,
      }),
    })
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map(r => {
          const h = seoHealth(r.cfg ?? {})
          const tone = h.level === "ok" ? "green" : h.level === "warn" ? "amber" : "steel"
          return (
            <Row
              key={r.slug}
              icon={r.cfg?.isNoindex ? "lock" : "doc"}
              iconTone={r.cfg?.isNoindex ? "red" : tone}
              title={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: MONO, fontSize: 14 }}>{r.slug}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: T.secondary }}>{r.label}</span>
                </span>
              }
              sub={r.cfg?.metaTitle || h.note}
              right={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                  {r.cfg?.isNoindex && <Badge tone="red" dot>noindex</Badge>}
                  <Badge tone={tone} dot>{h.level === "ok" ? "Completa" : h.level === "warn" ? "Da rifinire" : "Predefinita"}</Badge>
                  <Btn size="sm" variant="ghost" icon="edit" onClick={() => open(r.slug, r.cfg)}>
                    {r.cfg ? "Modifica" : "Configura"}
                  </Btn>
                  {r.cfg && <Btn size="sm" variant="danger" icon="trash" onClick={() => setRemoving(r.cfg!)} title="Elimina la scheda" />}
                </span>
              }
              onClick={() => open(r.slug, r.cfg)}
            />
          )
        })}
      </div>

      <Modal
        open={!!editing}
        onClose={() => !busy && setEditing(null)}
        kicker="SEO"
        title={editing ? `Metadati · ${editing.pageSlug}` : ""}
        width={720}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setEditing(null)} disabled={busy}>Annulla</Btn>
            <Btn variant="primary" icon="check" onClick={save} busy={busy}>Salva scheda</Btn>
          </>
        }
      >
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <SerpPreview
              origin={siteOrigin}
              slug={editing.pageSlug}
              title={editing.metaTitle || defaults.title || "Titolo predefinito del sito"}
              description={editing.metaDescription || defaults.description || "Descrizione predefinita del sito."}
              image={editing.ogImageUrl || defaults.image}
            />

            <Field
              label="Titolo"
              hint={`${(editing.metaTitle ?? "").length}/${SEO_LIMITS.title} — oltre, Google può troncarlo. Non è un errore: dipende dalla larghezza in pixel.`}
            >
              <Input
                value={editing.metaTitle ?? ""}
                onChange={e => setEditing({ ...editing, metaTitle: e.target.value })}
                placeholder={defaults.title || "Nadia Maar — …"}
                style={{ borderColor: (editing.metaTitle ?? "").length > SEO_LIMITS.title ? "rgba(245,158,11,0.55)" : undefined }}
              />
            </Field>

            <Field
              label="Descrizione"
              hint={`${(editing.metaDescription ?? "").length}/${SEO_LIMITS.description} — è la riga che si legge nei risultati: deve dare un motivo per cliccare.`}
            >
              <Textarea
                rows={3}
                value={editing.metaDescription ?? ""}
                onChange={e => setEditing({ ...editing, metaDescription: e.target.value })}
                placeholder={defaults.description}
                style={{ borderColor: (editing.metaDescription ?? "").length > SEO_LIMITS.description ? "rgba(245,158,11,0.55)" : undefined }}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px,100%),1fr))", gap: 12 }}>
              <Field label="Immagine social (OG)" hint="1200×630 px. Compare su WhatsApp, LinkedIn, X.">
                <Input value={editing.ogImageUrl ?? ""} onChange={e => setEditing({ ...editing, ogImageUrl: e.target.value })}
                  placeholder={`${siteOrigin}/og/home.jpg`} inputMode="url" />
              </Field>
              <Field label="Canonical" hint="Vuoto = l'URL della pagina stessa. Si compila solo se il contenuto vive altrove.">
                <Input value={editing.canonicalUrl ?? ""} onChange={e => setEditing({ ...editing, canonicalUrl: e.target.value })}
                  placeholder={`${siteOrigin}${editing.pageSlug}`} inputMode="url" />
              </Field>
            </div>

            <Field label="Parole chiave" hint="Google le ignora da anni; restano utili a llms.txt e alla ricerca interna.">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Input
                  value={kwInput}
                  onChange={e => setKwInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addKeyword() } }}
                  placeholder="e-commerce, sviluppo su misura…"
                  style={{ flex: 1, minWidth: 180 }}
                />
                <Btn variant="ghost" icon="plus" onClick={addKeyword} disabled={!kwInput.trim()}>Aggiungi</Btn>
              </div>
              {editing.keywords.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {editing.keywords.map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setEditing({ ...editing, keywords: editing.keywords.filter(x => x !== k) })}
                      className="portal-btn"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 99,
                        background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`,
                        fontFamily: MONO, fontSize: 12, color: T.text, cursor: "pointer",
                      }}
                    >
                      {k} <Icon name="x" size={11} />
                    </button>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Dati strutturati (JSON-LD)" hint="Dicono a Google che tipo di cosa è questa pagina. Genera e correggi a mano se serve.">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {(["Organization", "WebSite", "Service", "BreadcrumbList"] as JsonLdKind[]).map(k => (
                  <Btn key={k} size="sm" variant="outline" icon="sparkle" onClick={() => genJsonLd(k)}>{k}</Btn>
                ))}
                {editing.jsonLdSchema && (
                  <Btn size="sm" variant="danger" icon="trash" onClick={() => setEditing({ ...editing, jsonLdSchema: undefined })}>
                    Rimuovi
                  </Btn>
                )}
              </div>
              <Textarea
                rows={6}
                value={editing.jsonLdSchema ? JSON.stringify(editing.jsonLdSchema, null, 2) : ""}
                placeholder="{ }"
                onChange={e => {
                  const v = e.target.value.trim()
                  if (!v) { setEditing({ ...editing, jsonLdSchema: undefined }); return }
                  /* JSON non valido non viene scartato mentre si scrive:
                     resterebbe impossibile digitarlo. Si tiene l'ultimo
                     valido e si segnala sotto. */
                  try { setEditing({ ...editing, jsonLdSchema: JSON.parse(v) }) } catch { /* mostrato sotto */ }
                }}
                style={{ fontFamily: MONO, fontSize: 12.5 }}
              />
            </Field>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={editing.isNoindex}
                onChange={e => setEditing({ ...editing, isNoindex: e.target.checked })}
                style={{ accentColor: "#B83240", width: 16, height: 16, marginTop: 2 }}
              />
              <span style={{ fontFamily: DISPLAY, fontSize: 14, color: T.secondary, lineHeight: 1.5 }}>
                Escludi dai motori di ricerca (<code style={{ fontFamily: MONO }}>noindex</code>).
                La pagina sparisce anche da sitemap.xml e llms.txt, e finisce fra i <code style={{ fontFamily: MONO }}>Disallow</code> di robots.txt.
              </span>
            </label>

            {editing.isNoindex && (
              <Note tone="amber">
                Una pagina già indicizzata impiega giorni o settimane a uscire dai risultati: il noindex è una richiesta, non un interruttore.
              </Note>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        kicker="SEO"
        title="Eliminare la scheda?"
        confirmLabel="Elimina"
        body={removing ? `${removing.pageSlug} tornerà ai metadati predefiniti del sito. La pagina resta online.` : undefined}
      />
    </>
  )
}

/* ── Anteprima ────────────────────────────────────────────────────────────
   Due risultati veri: la riga di Google e la scheda che compare incollando
   il link in chat. Sono i due posti dove questi campi si vedono davvero. */
function SerpPreview({ origin, slug, title, description, image }: {
  origin: string; slug: string; title: string; description: string; image?: string
}) {
  const url = `${origin}${slug === "/" ? "" : slug}`
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px,100%),1fr))", gap: 12 }}>
      <Glass variant="work" style={{ padding: 15 }}>
        <p style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.11em", textTransform: "uppercase", color: T.secondary, margin: "0 0 11px" }}>
          Risultato di ricerca
        </p>
        <p style={{ fontFamily: DISPLAY, fontSize: 12.5, color: T.secondary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {url.replace(/^https?:\/\//, "")}
        </p>
        <p style={{
          fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, color: "#8AB4F8", margin: "4px 0 5px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {title}
        </p>
        <p className="pt-body" style={{
          fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.5, color: T.secondary, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {description}
        </p>
      </Glass>

      <Glass variant="work" style={{ padding: 15 }}>
        <p style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.11em", textTransform: "uppercase", color: T.secondary, margin: "0 0 11px" }}>
          Anteprima social
        </p>
        <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}` }}>
          <div style={{
            height: 108, background: image ? `center/cover no-repeat url("${image}")` : "rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {!image && (
              <span style={{ fontFamily: MONO, fontSize: 12, color: T.secondary }}>nessuna immagine</span>
            )}
          </div>
          <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)" }}>
            <p style={{ fontFamily: MONO, fontSize: 11.5, textTransform: "uppercase", color: T.secondary, margin: 0 }}>
              {url.replace(/^https?:\/\//, "").split("/")[0]}
            </p>
            <p style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: T.text, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {title}
            </p>
          </div>
        </div>
      </Glass>
    </div>
  )
}
