import React, { createContext, useContext, useMemo } from "react"
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
  localizePath,
  splitLocale,
} from "./locales"

/* ══════════════════════════════════════════════════════════════════════════
   LA LINGUA CORRENTE, PER I COMPONENTI.

   Un contesto minuscolo: quale lingua stiamo mostrando e su quale pagina
   canonica siamo. Serve al selettore di lingua per sapere dove mandare chi
   clicca, e a qualunque componente debba costruire un link che resti nella
   lingua in cui si sta leggendo.

   NON è un sistema di traduzioni. I testi delle pagine sono ancora scritti
   in italiano dentro i componenti: tradurli è un lavoro a parte, e fingere
   qui un `t()` che non ha dizionari dietro darebbe solo l'illusione che sia
   già fatto. Quando i testi si sposteranno in dizionari, il posto dove
   agganciarli è questo file — non ce ne sarà bisogno di un altro.
══════════════════════════════════════════════════════════════════════════ */

type LocaleValue = {
  /** La lingua che si sta leggendo. */
  locale: Locale
  /** Il path senza prefisso di lingua: "/about", non "/en/about". */
  path: string
  /** Un indirizzo interno, mantenendo la lingua corrente. */
  href: (canonicalPath: string) => string
  /** Lo stesso indirizzo di adesso, in un'altra lingua. */
  switchTo: (target: Locale) => string
}

const Ctx = createContext<LocaleValue | null>(null)

export function LocaleProvider({ locale, path, children }: {
  locale: Locale
  path: string
  children: React.ReactNode
}) {
  const value = useMemo<LocaleValue>(() => ({
    locale,
    path,
    href: (p: string) => localizePath(p, locale),
    switchTo: (target: Locale) => localizePath(path, target),
  }), [locale, path])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/**
 * Fuori dal provider (pannello, area cliente, componenti montati da soli)
 * non si lancia un errore: si deduce la lingua dall'indirizzo. Un hook che
 * fa esplodere il pannello di amministrazione perché qualcuno ha aggiunto
 * un'intestazione condivisa è un hook progettato male.
 */
export function useLocale(): LocaleValue {
  const ctx = useContext(Ctx)
  const fallback = useMemo<LocaleValue>(() => {
    const { locale, path } = typeof window === "undefined"
      ? { locale: DEFAULT_LOCALE as Locale, path: "/" }
      : splitLocale(window.location.pathname)
    return {
      locale,
      path,
      href: (p: string) => localizePath(p, locale),
      switchTo: (target: Locale) => localizePath(path, target),
    }
  }, [])
  return ctx ?? fallback
}

/**
 * Ricorda la scelta esplicita. Il middleware legge questo cookie e smette di
 * indovinare: chi ha cliccato "EN" non deve ricliccarlo a ogni pagina.
 *
 * Non è `httpOnly` di proposito — deve poterlo scrivere il browser al clic —
 * e non contiene nulla di personale: due lettere, sempre le stesse due.
 */
export function rememberLocale(locale: Locale): void {
  if (typeof document === "undefined") return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie =
    `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}
