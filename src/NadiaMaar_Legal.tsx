/**
 * NadiaMaar_Legal.tsx — le tre pagine legali del sito.
 * Rotte: /privacy · /cookie-policy · /termini (con prefisso /en per l'inglese)
 *
 * Un modulo solo con tre esportazioni, come NadiaMaar_ServicePage: i tre
 * documenti condividono impaginazione e cornice, e chi apre l'informativa
 * privacy spesso apre subito dopo la cookie policy — averle nello stesso
 * pacchetto significa che la seconda si mostra senza un altro viaggio di
 * rete. Restano comunque fuori dal pacchetto della home: nessuno arriva sul
 * sito per leggere i termini, e non devono pesare sul primo caricamento.
 *
 * Il testo NON sta qui: sta in src/lib/i18n/strings/legal*.ts. Qui c'è solo
 * il collegamento fra la rotta, il documento e i rimandi in fondo.
 */

import React from "react"
import LegalDocument from "./components/LegalDocument"
import { LEGAL_ROUTES, type LegalDoc } from "./lib/legal"
import { useT } from "./lib/i18n/t"
import { LEGAL_COMMON_STR } from "./lib/i18n/strings/legalCommon"
import { PRIVACY_STR } from "./lib/i18n/strings/legalPrivacy"
import { COOKIE_STR } from "./lib/i18n/strings/legalCookie"
import { TERMS_STR } from "./lib/i18n/strings/legalTerms"

/**
 * I rimandi in fondo a ogni documento: gli altri due, mai sé stesso.
 * Le etichette vengono dalle stringhe comuni, così un documento non deve
 * conoscere il titolo degli altri — che cambierebbe in due posti.
 */
function useSiblings(current: keyof typeof LEGAL_ROUTES) {
  const links = useT(LEGAL_COMMON_STR).links
  const all = [
    { key: "privacy" as const, label: links.privacy, href: LEGAL_ROUTES.privacy },
    { key: "cookie" as const, label: links.cookie, href: LEGAL_ROUTES.cookie },
    { key: "terms" as const, label: links.terms, href: LEGAL_ROUTES.terms },
  ]
  return all.filter(l => l.key !== current).map(({ label, href }) => ({ label, href }))
}

function useDoc(bundle: typeof PRIVACY_STR, current: keyof typeof LEGAL_ROUTES): LegalDoc {
  const doc = useT(bundle)
  const seeAlso = useSiblings(current)
  return { ...doc, seeAlso }
}

export function PrivacyPage() {
  return <LegalDocument doc={useDoc(PRIVACY_STR, "privacy")} />
}

export function CookiePage() {
  return <LegalDocument doc={useDoc(COOKIE_STR, "cookie")} />
}

export function TermsPage() {
  return <LegalDocument doc={useDoc(TERMS_STR, "terms")} />
}
