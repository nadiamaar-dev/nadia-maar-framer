import { supabase } from "./supabase"
import { trackEvent } from "./measure"

/* ══════════════════════════════════════════════════════════════════════════
   L'ACCOUNT OSPITE DEL CABINET.

   Le credenziali sono nel bundle DI PROPOSITO: è un account dimostrativo
   pubblico, e la sua innocuità non dipende dal segreto ma dal database —
   policy RESTRICTIVE su ogni tabella scrivibile e una guardia dentro le
   funzioni security-definer (migrazione portal_25). Chiunque entri vede un
   progetto verosimile e scopre che il pulsante «Approva» viene rifiutato
   da Postgres, non da un `disabled` nell'interfaccia. Che è il punto.
══════════════════════════════════════════════════════════════════════════ */

export const DEMO_CABINET = {
  email: "ospite@nadiamaar.dev",
  password: "aurora-demo-2026",
} as const

export function isDemoUser(email?: string | null): boolean {
  return (email ?? "").toLowerCase() === DEMO_CABINET.email
}

/** Accesso ospite. Torna il messaggio d'errore, o null se è andata. */
export async function signInAsDemo(via: string): Promise<string | null> {
  trackEvent("demo_cabinet", { via })
  const { error } = await supabase.auth.signInWithPassword(DEMO_CABINET)
  return error ? error.message : null
}
