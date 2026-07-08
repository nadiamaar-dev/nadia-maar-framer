import { supabase, SUPABASE_READY } from "../supabase"

export { supabase, SUPABASE_READY }

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
