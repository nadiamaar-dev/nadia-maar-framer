/**
 * Credentials check WITHOUT importing @supabase/supabase-js — so modules on the
 * critical (homepage) path can read readiness synchronously without pulling the
 * ~205 kB client into the initial bundle. The client itself is imported lazily.
 */
export const SUPABASE_READY = Boolean(
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) &&
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined),
)
