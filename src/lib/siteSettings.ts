/* ══════════════════════════════════════════════════════════════════════════
   IMPOSTAZIONI PUBBLICHE — lettore senza dipendenze.

   Il sito pubblico ha bisogno di sapere tre cose prima di disegnare: se
   /foundry è acceso, se il sito è in manutenzione, e quale ID GA4 iniettare.
   Importare supabase-js per ottenerle costerebbe ~50 KB sulla home, che è
   esattamente il file che App.tsx si preoccupa di tenere leggero.

   Quindi: una fetch su PostgREST, contro la vista `public_site_settings` —
   che espone quei campi e NON la chiave API accanto.

   Se la chiamata fallisce (rete, progetto in pausa, migrazione non
   applicata) si tengono i valori predefiniti: un sito che non riesce a
   leggere le proprie impostazioni deve restare acceso, non spegnersi.
══════════════════════════════════════════════════════════════════════════ */

export interface PublicSiteSettings {
  foundryEnabled: boolean
  maintenanceMode: boolean
  maintenanceMessage?: string
  siteName: string
  defaultMetaTitle?: string
  defaultMetaDescription?: string
  defaultOgImageUrl?: string
  googleAnalyticsId?: string
  gscVerificationTag?: string
  gtmContainerId?: string
  metaPixelId?: string
  cookieConsentEnabled: boolean
  promoBarActive: boolean
  promoBarText?: string
  promoBarLink?: string
  /** Dati strutturati dell'organizzazione, iniettati su ogni pagina. */
  organizationSchema?: Record<string, unknown>
}

export const DEFAULT_PUBLIC_SETTINGS: PublicSiteSettings = {
  foundryEnabled: true,
  maintenanceMode: false,
  siteName: "Nadia Maar",
  cookieConsentEnabled: false,
  promoBarActive: false,
}

const URL_ = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ""
const KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ""

/** Una sola richiesta per caricamento di pagina, condivisa da tutti i lettori. */
let inflight: Promise<PublicSiteSettings> | null = null

/* Cache di sessione: attraversa i cambi di rotta senza rifare la chiamata,
   e muore alla chiusura della scheda — così un interruttore girato in
   pannello si vede al reload successivo e non fra un'ora. */
const CACHE_KEY = "nm-site-settings"

function readCache(): PublicSiteSettings | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) as PublicSiteSettings : null
  } catch { return null }
}

export function getSiteSettings(): Promise<PublicSiteSettings> {
  if (inflight) return inflight
  const cached = readCache()
  if (cached) { inflight = Promise.resolve(cached); return inflight }
  if (!URL_ || !KEY) { inflight = Promise.resolve(DEFAULT_PUBLIC_SETTINGS); return inflight }

  inflight = fetch(`${URL_}/rest/v1/public_site_settings?select=*&limit=1`, {
    headers: { apikey: KEY, accept: "application/json" },
  })
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((rows: Record<string, unknown>[]) => {
      const r = rows?.[0]
      if (!r) return DEFAULT_PUBLIC_SETTINGS
      const s: PublicSiteSettings = {
        foundryEnabled: r.foundry_enabled !== false,
        maintenanceMode: r.maintenance_mode === true,
        maintenanceMessage: (r.maintenance_message as string) || undefined,
        siteName: (r.site_name as string) || "Nadia Maar",
        defaultMetaTitle: (r.default_meta_title as string) || undefined,
        defaultMetaDescription: (r.default_meta_description as string) || undefined,
        defaultOgImageUrl: (r.default_og_image_url as string) || undefined,
        googleAnalyticsId: (r.google_analytics_id as string) || undefined,
        gscVerificationTag: (r.gsc_verification_tag as string) || undefined,
        gtmContainerId: (r.gtm_container_id as string) || undefined,
        metaPixelId: (r.meta_pixel_id as string) || undefined,
        cookieConsentEnabled: r.cookie_consent_enabled === true,
        promoBarActive: r.promo_bar_active === true,
        promoBarText: (r.promo_bar_text as string) || undefined,
        promoBarLink: (r.promo_bar_link as string) || undefined,
        organizationSchema: (r.organization_schema as Record<string, unknown>) || undefined,
      }
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(s)) } catch { /* modalità privata */ }
      return s
    })
    .catch(() => DEFAULT_PUBLIC_SETTINGS)

  return inflight
}

/** Da chiamare dopo un salvataggio in pannello, così l'anteprima è subito vera. */
export function invalidateSiteSettings(): void {
  inflight = null
  try { sessionStorage.removeItem(CACHE_KEY) } catch { /* niente da fare */ }
}
