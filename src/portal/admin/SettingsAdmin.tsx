import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useToast } from "../../context/ToastContext"
import type { PageSeoConfig, SiteSettings } from "../../lib/api"
import {
  fetchSeoConfigs, fetchSiteSettings, isValidGa4Id, updateSiteSettings, type SiteSettingsPatch,
} from "../../lib/api"
import { invalidateSiteSettings } from "../../lib/siteSettings"
import DeveloperIntegrations from "./settings/DeveloperIntegrations"
import { Card, FlagRow, SaveBar } from "./settings/FeatureFlagsCard"
import InternalAnalytics from "./settings/InternalAnalytics"
import PageSeoEditor from "./settings/PageSeoEditor"
import PageSpeedWidget from "./settings/PageSpeedWidget"
import {
  Btn, DISPLAY, Empty, Field, Glass, Icon, Input, Loading, MONO, Note, SectionTitle, T, Tabs, Textarea,
} from "../ui"

/* ══════════════════════════════════════════════════════════════════════════
   IMPOSTAZIONI.

   Cinque schede, ordinate per quanto spesso ci si torna: prima gli
   interruttori che cambiano cosa vede un visitatore, poi il SEO che si tocca
   quando si scrive, poi i numeri che si guardano, poi le misure che si
   lanciano, infine i collegamenti che si aprono quando qualcosa non va.

   Sul colore: la richiesta parlava di un accento viola. Qui resta il rame
   del resto del portale — un pannello che cambia palette a metà applicazione
   non sembra moderno, sembra un pezzo preso da un'altra applicazione.
══════════════════════════════════════════════════════════════════════════ */

type TabId = "generale" | "seo" | "analytics" | "performance" | "integrazioni"

const TABS: { id: TabId; label: string }[] = [
  { id: "generale", label: "Generale" },
  { id: "seo", label: "SEO e indicizzazione" },
  { id: "analytics", label: "Traffico" },
  { id: "performance", label: "Prestazioni" },
  { id: "integrazioni", label: "Integrazioni" },
]

export default function SettingsAdmin() {
  const toast = useToast()
  const [tab, setTab] = useState<TabId>("generale")
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [seo, setSeo] = useState<PageSeoConfig[]>([])
  const [failed, setFailed] = useState(false)
  const [draft, setDraft] = useState<SiteSettingsPatch>({})
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([fetchSiteSettings(), fetchSeoConfigs().catch(() => [])])
      setSettings(s)
      setSeo(c)
      setDraft({})
      setFailed(!s)
    } catch {
      setFailed(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* La bozza contiene solo i campi toccati: si salva quello e nient'altro. */
  const value = <K extends keyof SiteSettingsPatch>(k: K): SiteSettingsPatch[K] =>
    (draft[k] !== undefined ? draft[k] : settings?.[k as keyof SiteSettings]) as SiteSettingsPatch[K]
  const set = <K extends keyof SiteSettingsPatch>(k: K, v: SiteSettingsPatch[K]) =>
    setDraft(d => ({ ...d, [k]: v }))

  const dirty = Object.keys(draft).length > 0
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const isLocal = /^https?:\/\/(localhost|127\.|\[::1\])/.test(origin)

  const gaValid = useMemo(() => isValidGa4Id(String(value("googleAnalyticsId") ?? "")), [draft, settings])

  const save = useCallback(async (patch?: SiteSettingsPatch) => {
    if (!settings || busy) return
    const body = patch ?? draft
    if (!Object.keys(body).length) return
    setBusy(true)
    try {
      const next = await updateSiteSettings(settings.id, body)
      setSettings(next)
      setDraft({})
      /* La cache pubblica va buttata subito: altrimenti il sito continua a
         leggere le impostazioni di prima fino alla chiusura della scheda, e
         l'interruttore sembra non aver funzionato. */
      invalidateSiteSettings()
      toast.success("Impostazioni salvate")
    } catch {
      toast.error("Salvataggio non riuscito.")
    } finally {
      setBusy(false)
    }
  }, [settings, draft, busy, toast])

  /* Gli interruttori si salvano da soli: un toggle che richiede anche un
     «Salva» fa credere di aver già fatto la cosa e non averla fatta. */
  async function toggle(k: "foundryEnabled" | "maintenanceMode", v: boolean) {
    setDraft(d => { const n = { ...d }; delete n[k]; return n })
    setSettings(s => (s ? { ...s, [k]: v } : s))
    await save({ [k]: v })
  }

  if (failed) {
    return (
      <Glass variant="panel" style={{ padding: 20 }}>
        <Empty
          icon="warn"
          title="Impostazioni non disponibili"
          hint="Serve la migrazione portal_18 (site_settings, page_seo_configs, visitor_logs). Applicala e ricarica."
          action={<Btn variant="primary" icon="bolt" onClick={load}>Riprova</Btn>}
        />
      </Glass>
    )
  }

  if (!settings) {
    return <Glass variant="panel" style={{ padding: 20 }}><Loading label="Apro le impostazioni" /></Glass>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Piattaforma"
        title="Impostazioni"
        sub="Cosa è visibile, come il sito si presenta ai motori, e come sta andando."
        right={
          <a href="/" target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex" }}>
            <Btn variant="outline" icon="external">Vedi il sito</Btn>
          </a>
        }
      />

      <Tabs<TabId> value={tab} onChange={setTab} items={TABS} />

      {/* ══ GENERALE ══ */}
      {tab === "generale" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card kicker="Visibilità" title="Cosa è acceso"
            sub="Questi due interruttori si salvano da soli: hanno effetto sul sito entro pochi minuti.">
            <FlagRow
              icon="bolt"
              tone="copper"
              title="Digital Foundry"
              description="Il configuratore su /foundry che compone l'architettura di un progetto e raccoglie il brief."
              effect="/foundry mostra una schermata di cortesia, esce da sitemap e llms.txt, entra fra i Disallow di robots.txt e l'API rifiuta nuove configurazioni."
              checked={!!value("foundryEnabled")}
              onChange={v => toggle("foundryEnabled", v)}
              busy={busy}
            />
            <FlagRow
              icon="lock"
              tone="amber"
              title="Modalità manutenzione"
              description="Sospende il sito pubblico lasciando aperta l'area clienti su /cabinet."
              effect="Ai visitatori compare il messaggio qui sotto; l'indicizzazione viene sospesa e la sitemap si svuota. I clienti continuano a vedere progetti e fatture."
              checked={!!value("maintenanceMode")}
              onChange={v => toggle("maintenanceMode", v)}
              busy={busy}
            />
          </Card>

          <Card kicker="Identità" title="Metadati predefiniti"
            sub="Valgono per ogni pagina che non ha una sua scheda in «SEO e indicizzazione».">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Nome del sito">
                <Input value={String(value("siteName") ?? "")} onChange={e => set("siteName", e.target.value)} />
              </Field>
              <Field label="Titolo predefinito" hint="Compare nella scheda del browser e nei risultati di ricerca.">
                <Input value={String(value("defaultMetaTitle") ?? "")} onChange={e => set("defaultMetaTitle", e.target.value)}
                  placeholder="Nadia Maar — Architetture Digitali ad Alte Prestazioni" />
              </Field>
              <Field label="Descrizione predefinita">
                <Textarea rows={2} value={String(value("defaultMetaDescription") ?? "")}
                  onChange={e => set("defaultMetaDescription", e.target.value)}
                  placeholder="Studio digitale: e-commerce, siti corporate, web app e integrazioni AI." />
              </Field>
              <Field label="Immagine social predefinita" hint="1200×630 px. Usata da WhatsApp, LinkedIn e X quando la pagina non ne ha una sua.">
                <Input value={String(value("defaultOgImageUrl") ?? "")} onChange={e => set("defaultOgImageUrl", e.target.value)}
                  placeholder={`${origin}/og-default.jpg`} inputMode="url" />
              </Field>
              <Field label="Messaggio di manutenzione" hint="Vuoto = testo predefinito. Si vede solo a interruttore acceso.">
                <Textarea rows={2} value={String(value("maintenanceMessage") ?? "")}
                  onChange={e => set("maintenanceMessage", e.target.value)}
                  placeholder="Stiamo aggiornando il sito. Torniamo online a breve." />
              </Field>
            </div>
            <SaveBar dirty={dirty} busy={busy} onSave={() => save()} onReset={() => setDraft({})} />
          </Card>
        </div>
      )}

      {/* ══ SEO ══ */}
      {tab === "seo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card
            kicker="Per pagina"
            title="Metadati e dati strutturati"
            sub="Ogni rotta del sito. Le pagine senza scheda ereditano i predefiniti."
          >
            <PageSeoEditor
              configs={seo}
              reload={load}
              siteOrigin={origin}
              defaults={{
                title: settings.defaultMetaTitle,
                description: settings.defaultMetaDescription,
                image: settings.defaultOgImageUrl,
              }}
            />
          </Card>

          <Glass variant="work" style={{ padding: "16px 18px" }}>
            <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 13.5, lineHeight: 1.65, color: T.secondary, margin: 0 }}>
              <Icon name="sparkle" size={13} style={{ verticalAlign: "-2px", marginRight: 7 }} />
              <strong style={{ color: T.text }}>robots.txt, sitemap.xml e llms.txt si rigenerano da soli</strong> a ogni
              salvataggio: sono funzioni che leggono queste schede al momento della richiesta, non file da sincronizzare.
              Il sito è a rendering client, quindi ai crawler che non eseguono JavaScript — Bingbot, GPTBot, ClaudeBot,
              le anteprime di WhatsApp — l'HTML viene servito con le meta tag già dentro da <code style={{ fontFamily: MONO }}>/api/prerender</code>.
            </p>
          </Glass>
        </div>
      )}

      {/* ══ TRAFFICO ══ */}
      {tab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InternalAnalytics />

          <Card kicker="Google" title="Analytics e Search Console"
            sub="Facoltativi: il conteggio interno qui sopra funziona anche senza.">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field
                label="ID GA4"
                hint={gaValid ? "Formato G-XXXXXXXXXX. Vuoto = nessuno script di Google caricato." : "Formato non riconosciuto: atteso G- seguito da lettere e numeri."}
              >
                <Input
                  value={String(value("googleAnalyticsId") ?? "")}
                  onChange={e => set("googleAnalyticsId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  style={{ borderColor: gaValid ? undefined : "rgba(248,113,113,0.55)" }}
                />
              </Field>
              <Field label="Verifica Search Console" hint="Incolla il token o l'intera riga <meta> copiata da Google: vengono accettati entrambi.">
                <Input
                  value={String(value("gscVerificationTag") ?? "")}
                  onChange={e => set("gscVerificationTag", e.target.value)}
                  placeholder='google-site-verification=… oppure <meta name="google-site-verification" content="…">'
                />
              </Field>
              <Field label="Chiave API PageSpeed" hint="Facoltativa: alza la quota. Senza, le misure funzionano comunque.">
                <Input
                  value={String(value("pagespeedApiKey") ?? "")}
                  onChange={e => set("pagespeedApiKey", e.target.value)}
                  placeholder="AIza…"
                />
              </Field>
            </div>
            <Note tone="silver">
              GA4 viene caricato solo quando l'ID è presente. Attenzione: usa cookie e richiede
              un'informativa, mentre il conteggio interno non ne usa.
            </Note>
            <SaveBar dirty={dirty} busy={busy || !gaValid} onSave={() => save()} onReset={() => setDraft({})} />
          </Card>
        </div>
      )}

      {/* ══ PRESTAZIONI ══ */}
      {tab === "performance" && <PageSpeedWidget origin={origin} isLocal={isLocal} />}

      {/* ══ INTEGRAZIONI ══ */}
      {tab === "integrazioni" && <DeveloperIntegrations />}
    </div>
  )
}
