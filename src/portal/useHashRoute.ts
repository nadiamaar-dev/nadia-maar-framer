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
 * Shape: `#fatture`, `#progetti/<uuid>`, or `#clienti/<uuid>/<uuid>`.
 *
 * The third segment exists so a project dossier can be opened *inside* the
 * client it belongs to. Without it, clicking a project from a client card
 * jumped to the global project list and lost track of whose project it was —
 * the fastest way to end up editing the wrong client's work.
 */
export function useHashRoute(fallback: string, valid: readonly string[]) {
  const parse = useCallback((): { section: string; id: string | null; sub: string | null } => {
    const raw = window.location.hash.replace(/^#/, "")
    if (!raw) return { section: fallback, id: null, sub: null }
    const [section, id, sub] = raw.split("/")
    if (!valid.includes(section)) return { section: fallback, id: null, sub: null }
    return { section, id: id || null, sub: sub || null }
  }, [fallback, valid])

  const [route, setRoute] = useState(parse)

  useEffect(() => {
    const onHash = () => setRoute(parse())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [parse])

  /** Navigate. `push` false replaces, so programmatic corrections don't
   *  pile up entries the Back button has to chew through. */
  const go = useCallback((section: string, id?: string | null, sub?: string | null, push = true) => {
    const hash = `#${section}${id ? `/${id}` : ""}${id && sub ? `/${sub}` : ""}`
    const next = { section, id: id ?? null, sub: (id && sub) || null }
    if (window.location.hash === hash) {
      setRoute(next)
      return
    }
    if (push) window.history.pushState(null, "", hash)
    else window.history.replaceState(null, "", hash)
    setRoute(next)
  }, [])

  return { section: route.section, id: route.id, sub: route.sub, go }
}
