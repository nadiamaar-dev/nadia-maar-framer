import { createClient } from "@supabase/supabase-js"

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ""
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ""

/* createClient throws if url/key are empty — guard with a no-op placeholder
   so the app renders even when env vars are not set (e.g. Vercel preview builds). */
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key"
)

/** True only when real credentials are present */
export const SUPABASE_READY = Boolean(url && key)
