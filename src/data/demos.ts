/* ══════════════════════════════════════════════════════════════════════════
   LE DEMO E LE LORO ROTTE — una sola volta.

   La mappa viveva copiata in ProjectCard e in ProjectOverlay. Due copie della
   stessa tabella significano che la terza demo verrà aggiunta a una sola
   delle due, e il pulsante «Full Preview» resterà muto senza che nessuno
   capisca perché.
══════════════════════════════════════════════════════════════════════════ */

export type DemoId = "supplier-portal" | "crm-dashboard" | "onboarding-kyc"

export const DEMO_HREF: Record<DemoId, string> = {
  "supplier-portal": "/demo/portale-fornitori",
  "crm-dashboard": "/demo/crm-vendite",
  "onboarding-kyc": "/demo/onboarding-kyc",
}

/** Tutte le rotte demo: serve a App.tsx e alla sitemap per non divergere. */
export const DEMO_PATHS = Object.values(DEMO_HREF)
