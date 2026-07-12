/**
 * On-demand third-party script loader — the Vite/SPA equivalent of
 * Next.js `<Script strategy="lazyOnload">`. Nothing is added to the initial
 * bundle or the HTML: the <script> is injected only when you actually need it
 * (e.g. when the checkout component mounts), so Stripe/PayPal/analytics never
 * block first paint. Each src is loaded at most once and cached.
 *
 *   // inside a Checkout component effect:
 *   await loadScript("https://js.stripe.com/v3/")
 *   const stripe = window.Stripe(PUBLISHABLE_KEY)
 */
const cache = new Map<string, Promise<void>>()

export function loadScript(
  src: string,
  opts: { async?: boolean; defer?: boolean; attrs?: Record<string, string> } = {},
): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve()
  const existing = cache.get(src)
  if (existing) return existing

  const p = new Promise<void>((resolve, reject) => {
    const prior = document.querySelector<HTMLScriptElement>(`script[data-loadscript="${CSS.escape(src)}"]`)
    if (prior && prior.dataset.loaded === "true") { resolve(); return }

    const el = document.createElement("script")
    el.src = src
    el.async = opts.async ?? true
    if (opts.defer) el.defer = true
    el.dataset.loadscript = src
    for (const [k, v] of Object.entries(opts.attrs ?? {})) el.setAttribute(k, v)
    el.addEventListener("load", () => { el.dataset.loaded = "true"; resolve() })
    el.addEventListener("error", () => { cache.delete(src); el.remove(); reject(new Error(`Failed to load ${src}`)) })
    document.head.appendChild(el)
  })

  cache.set(src, p)
  return p
}

/**
 * Defer non-critical work (e.g. analytics init) until the browser is idle,
 * so it never competes with hydration / first interaction.
 */
export function onIdle(fn: () => void, timeout = 2000): void {
  if (typeof window === "undefined") return
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback
  if (ric) ric(fn, { timeout })
  else window.setTimeout(fn, 1)
}
