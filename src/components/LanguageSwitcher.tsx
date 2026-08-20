import React from "react"
import { LOCALES, LOCALE_LABEL, type Locale } from "../lib/i18n/locales"
import { rememberLocale, useLocale } from "../lib/i18n/LocaleContext"

/* ══════════════════════════════════════════════════════════════════════════
   SELETTORE DI LINGUA

   Due <a> veri, non due bottoni con un onClick. La differenza conta più di
   quanto sembri:

   · un crawler segue un <a href> e trova la versione inglese; un bottone
     con JavaScript no, e /en resterebbe una pagina che esiste ma che nessuno
     scopre se non digitandola;
   · si può aprire in una scheda nuova, copiare l'indirizzo, aggiungerlo ai
     preferiti — tutte cose che un bottone toglie senza dare niente in cambio;
   · se JavaScript non parte, il selettore funziona lo stesso.

   Il clic scrive anche il cookie, così il middleware smette di indovinare:
   chi ha scelto EN non deve riscegliere a ogni pagina. Ma la navigazione
   avviene comunque per link — il cookie è una comodità aggiuntiva, non il
   meccanismo.

   `hrefLang` sul link dice al crawler che lingua troverà dall'altra parte;
   `rel="alternate"` che è la stessa pagina, non un'altra.
══════════════════════════════════════════════════════════════════════════ */

export default function LanguageSwitcher({ variant = "bar" }: {
  /** `bar` per l'intestazione, `menu` per il pannello a tutto schermo. */
  variant?: "bar" | "menu"
}) {
  const { locale, switchTo } = useLocale()
  const menu = variant === "menu"

  return (
    <nav
      aria-label={locale === "it" ? "Lingua" : "Language"}
      style={{
        display: "flex", alignItems: "center", flexShrink: 0,
        gap: menu ? 8 : 2,
        padding: menu ? 0 : 2,
        borderRadius: 999,
        background: menu ? "transparent" : "rgba(255,255,255,0.05)",
        border: menu ? "none" : "1px solid rgba(255,255,255,0.16)",
      }}
    >
      {LOCALES.map(l => (
        <Choice
          key={l}
          locale={l}
          current={locale}
          href={switchTo(l)}
          menu={menu}
        />
      ))}
    </nav>
  )
}

function Choice({ locale, current, href, menu }: {
  locale: Locale
  current: Locale
  href: string
  menu: boolean
}) {
  const active = locale === current
  const label = LOCALE_LABEL[locale]

  return (
    <a
      href={href}
      hrefLang={locale}
      rel="alternate"
      /* `aria-current="true"` e non solo il colore: chi non distingue i
         contrasti deve poter sapere quale lingua sta leggendo. */
      aria-current={active ? "true" : undefined}
      /* Il nome completo per la sintesi vocale: "IT" da solo viene letto
         come due lettere staccate, che non aiutano nessuno. */
      aria-label={label.native}
      onClick={() => rememberLocale(locale)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: menu ? "auto" : 34,
        height: menu ? "auto" : 26,
        padding: menu ? "4px 2px" : "0 9px",
        borderRadius: 999,
        textDecoration: "none",
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: menu ? 15 : 11,
        fontWeight: active ? 700 : 500,
        letterSpacing: "0.1em",
        cursor: active ? "default" : "pointer",
        color: active ? (menu ? "#FFFFFF" : "#121418") : "rgba(255,255,255,0.55)",
        background: active && !menu ? "#FFFFFF" : "transparent",
        borderBottom: menu ? `1px solid ${active ? "#FFFFFF" : "transparent"}` : "none",
        transition: "color 0.18s, background 0.18s",
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"
      }}
    >
      {menu ? label.native : label.short}
    </a>
  )
}
