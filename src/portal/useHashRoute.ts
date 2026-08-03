import { useCallback, useEffect, useState } from "react"

/**
 * Keeps the active section (and optional record id) in the URL hash.
 *
 * Both portals kept this in component state only, which meant F5 and the
 * browser Back button dumped you on the overview, and there was no way to
 * send someone a link to a project. Back used to leave the portal entirely.
 *
 * Hash rather than pathname on purpose: the app has a hand-rolled router
 * that switches on `window.location.pathname`, so a pushState to a new path
 * would not resolve on reload.
 *
 * Shape: `#fatture` or `#progetti/<uuid>`.
 */
export function useHashRoute(fallback: string, valid: readonly string[]) {
  const parse = useCallback((): { section: string; id: string | null } => {
    const raw = window.location.hash.replace(/^#/, "")
    if (!raw) return { section: fallback, id: null }
    const [section, id] = raw.split("/")
    if (!valid.includes(section)) return { section: fallback, id: null }
    return { section, id: id || null }
  }, [fallback, valid])

  const [route, setRoute] = useState(parse)

  useEffect(() => {
    const onHash = () => setRoute(parse())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [parse])

  /** Navigate. `push` false replaces, so programmatic corrections don't
   *  pile up entries the Back button has to chew through. */
  const go = useCallback((section: string, id?: string | null, push = true) => {
    const hash = `#${section}${id ? `/${id}` : ""}`
    if (window.location.hash === hash) {
      setRoute({ section, id: id ?? null })
      return
    }
    if (push) window.history.pushState(null, "", hash)
    else window.history.replaceState(null, "", hash)
    setRoute({ section, id: id ?? null })
  }, [])

  return { section: route.section, id: route.id, go }
}
