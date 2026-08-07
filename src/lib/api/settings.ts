import { supabase } from "./core"
import type { SiteSettings } from "./types"

/* ══════════════════════════════════════════════════════════════════════════
   IMPOSTAZIONI DEL SITO — lato studio.

   Il sito pubblico NON passa da qui: legge la vista `public_site_settings`
   con una fetch senza dipendenze (src/lib/siteSettings.ts), perché portarsi
   supabase-js in home solo per sapere se /foundry è acceso costerebbe più
   della risposta. Questo modulo è la metà amministrativa, che vede anche la
   chiave API e può scrivere.
══════════════════════════════════════════════════════════════════════════ */

/* eslint-disable @typescript-eslint/no-explicit-any */

function map(r: any): SiteSettings {
  return {
    id: r.id,
    foundryEnabled: !!r.foundry_enabled,
    maintenanceMode: !!r.maintenance_mode,
    maintenanceMessage: r.maintenance_message ?? undefined,
    siteName: r.site_name ?? "Nadia Maar",
    defaultMetaTitle: r.default_meta_title ?? undefined,
    defaultMetaDescription: r.default_meta_description ?? undefined,
    defaultOgImageUrl: r.default_og_image_url ?? undefined,
    googleAnalyticsId: r.google_analytics_id ?? undefined,
    gscVerificationTag: r.gsc_verification_tag ?? undefined,
    gtmContainerId: r.gtm_container_id ?? undefined,
    metaPixelId: r.meta_pixel_id ?? undefined,
    pagespeedApiKey: r.pagespeed_api_key ?? undefined,
    indexnowKey: r.indexnow_key ?? undefined,
    cookieConsentEnabled: !!r.cookie_consent_enabled,
    promoBarActive: !!r.promo_bar_active,
    promoBarText: r.promo_bar_text ?? undefined,
    promoBarLink: r.promo_bar_link ?? undefined,
    organizationSchema: r.organization_schema ?? undefined,
    updatedAt: r.updated_at,
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle()
  if (error) throw error
  return data ? map(data) : null
}

export type SiteSettingsPatch = Partial<Omit<SiteSettings, "id" | "updatedAt">>

/**
 * Salvataggio parziale: si manda solo ciò che è cambiato. Un update completo
 * farebbe sovrascrivere a un pannello i campi di un altro pannello aperto
 * altrove con dati vecchi.
 */
export async function updateSiteSettings(id: string, patch: SiteSettingsPatch): Promise<SiteSettings> {
  const db: Record<string, unknown> = {}
  const set = (k: string, v: unknown) => { if (v !== undefined) db[k] = v }
  set("foundry_enabled", patch.foundryEnabled)
  set("maintenance_mode", patch.maintenanceMode)
  set("maintenance_message", patch.maintenanceMessage?.trim() || null)
  set("site_name", patch.siteName?.trim())
  set("default_meta_title", patch.defaultMetaTitle?.trim() || null)
  set("default_meta_description", patch.defaultMetaDescription?.trim() || null)
  set("default_og_image_url", patch.defaultOgImageUrl?.trim() || null)
  set("google_analytics_id", patch.googleAnalyticsId?.trim() || null)
  set("gsc_verification_tag", patch.gscVerificationTag?.trim() || null)
  set("gtm_container_id", patch.gtmContainerId?.trim() || null)
  set("meta_pixel_id", patch.metaPixelId?.trim() || null)
  set("pagespeed_api_key", patch.pagespeedApiKey?.trim() || null)
  set("cookie_consent_enabled", patch.cookieConsentEnabled)
  set("promo_bar_active", patch.promoBarActive)
  set("promo_bar_text", patch.promoBarText?.trim() || null)
  set("promo_bar_link", patch.promoBarLink?.trim() || null)
  set("organization_schema", patch.organizationSchema ?? undefined)

  const { data, error } = await supabase
    .from("site_settings").update(db).eq("id", id).select().single()
  if (error) throw error
  return map(data)
}

/** Forme accettate: `G-XXXXXXXXXX`. Vuoto è valido — significa «non misurare». */
export function isValidGa4Id(v: string): boolean {
  const s = v.trim()
  return s === "" || /^G-[A-Z0-9]{6,12}$/i.test(s)
}

/** `GTM-XXXXXXX`. */
export function isValidGtmId(v: string): boolean {
  const s = v.trim()
  return s === "" || /^GTM-[A-Z0-9]{5,10}$/i.test(s)
}

/** Il Pixel di Meta è un numero lungo, niente prefissi. */
export function isValidPixelId(v: string): boolean {
  const s = v.trim()
  return s === "" || /^\d{10,20}$/.test(s)
}
