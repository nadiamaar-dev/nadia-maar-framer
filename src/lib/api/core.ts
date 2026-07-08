import { supabase, SUPABASE_READY } from "../supabase"

export { supabase, SUPABASE_READY }

/**
 * Storage object keys reject non-ASCII characters (e.g. accented Italian
 * filenames fail with "Invalid key"). Display names stay untouched — only
 * the storage path uses the sanitized form.
 */
export function safeStorageName(name: string): string {
  const dot = name.lastIndexOf(".")
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot + 1) : ""
  const clean = (s: string) =>
    s.normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "")
  const b = clean(base) || "file"
  const e = clean(ext)
  return e ? `${b}.${e}` : b
}

type DbEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

/**
 * Subscribe to postgres_changes on a table. Returns an unsubscribe fn.
 * RLS is enforced server-side: subscribers only receive rows they can read.
 */
export function subscribe(
  channel: string,
  opts: { table: string; event?: DbEvent; filter?: string },
  cb: () => void,
): () => void {
  const ch = supabase
    .channel(channel)
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: opts.event ?? "*",
        schema: "public",
        table: opts.table,
        ...(opts.filter ? { filter: opts.filter } : {}),
      },
      cb,
    )
    .subscribe()
  return () => {
    supabase.removeChannel(ch)
  }
}
