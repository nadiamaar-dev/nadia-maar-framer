import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { SUPABASE_READY } from "../lib/supabaseEnv"
import { SandboxItem } from "../data/sandboxData"

interface BlueprintContextValue {
  items: SandboxItem[]
  user: User | null
  loading: boolean
  isAuthModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  addToBlueprint: (item: SandboxItem) => void
  removeFromBlueprint: (id: string) => void
  isInBlueprint: (id: string) => boolean
  clearBlueprint: () => void
  signOut: () => Promise<void>
}

const BlueprintContext = createContext<BlueprintContextValue | null>(null)

/* Lazy singleton: dynamically import the shared client so @supabase/supabase-js
   stays OUT of the initial homepage bundle. ES module caching guarantees this is
   the exact same instance the portal uses (no duplicate GoTrue client). */
let clientPromise: Promise<SupabaseClient> | null = null
function getClient(): Promise<SupabaseClient> {
  return (clientPromise ??= import("../lib/supabase").then(m => m.supabase))
}

/* ── helpers ── */
async function fetchUserBlueprints(userId: string): Promise<SandboxItem[]> {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from("blueprints")
    .select("item_data")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return data.map((row) => row.item_data as SandboxItem)
}

async function insertBlueprint(userId: string, item: SandboxItem) {
  const supabase = await getClient()
  await supabase
    .from("blueprints")
    .upsert({ user_id: userId, item_id: item.id, item_data: item }, { onConflict: "user_id,item_id" })
}

async function deleteBlueprint(userId: string, itemId: string) {
  const supabase = await getClient()
  await supabase.from("blueprints").delete().eq("user_id", userId).eq("item_id", itemId)
}

async function clearUserBlueprints(userId: string) {
  const supabase = await getClient()
  await supabase.from("blueprints").delete().eq("user_id", userId)
}

/* ══════════════════════════════════════════════════════════ */
export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]               = useState<SandboxItem[]>([])
  const [user, setUser]                 = useState<User | null>(null)
  const [loading, setLoading]           = useState(true)
  const [isAuthModalOpen, setAuthModal] = useState(false)
  const mountedRef                      = useRef(true)

  /* ── bootstrap: read session once, then subscribe to changes ──
     The client is fetched lazily (async) so it is not part of the initial
     critical bundle; auth state hydrates a beat after first paint. */
  useEffect(() => {
    mountedRef.current = true

    if (!SUPABASE_READY) {
      setLoading(false)
      return () => { mountedRef.current = false }
    }

    let unsub: (() => void) | undefined

    getClient()
      .then(async (supabase) => {
        const { data } = await supabase.auth.getSession()
        const u = data.session?.user ?? null
        if (!mountedRef.current) return
        setUser(u)
        if (u) {
          const saved = await fetchUserBlueprints(u.id).catch(() => [] as SandboxItem[])
          if (mountedRef.current) setItems(saved)
        }
        setLoading(false)

        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
          const nu = session?.user ?? null
          if (!mountedRef.current) return
          setUser(nu)
          if (nu) {
            setLoading(true)
            const saved = await fetchUserBlueprints(nu.id).catch(() => [] as SandboxItem[])
            if (mountedRef.current) { setItems(saved); setLoading(false) }
            setAuthModal(false)
          } else {
            setItems([])
            setLoading(false)
          }
        })
        unsub = () => sub.subscription.unsubscribe()
      })
      .catch(() => { if (mountedRef.current) setLoading(false) })

    return () => { mountedRef.current = false; unsub?.() }
  }, [])

  /* ── actions ── */
  const openAuthModal  = useCallback(() => setAuthModal(true),  [])
  const closeAuthModal = useCallback(() => setAuthModal(false), [])

  const addToBlueprint = useCallback((item: SandboxItem) => {
    if (!user) { openAuthModal(); return }
    setItems(prev => prev.find(i => i.id === item.id) ? prev : [...prev, item])
    insertBlueprint(user.id, item)
  }, [user, openAuthModal])

  const removeFromBlueprint = useCallback((id: string) => {
    if (!user) return
    setItems(prev => prev.filter(i => i.id !== id))
    deleteBlueprint(user.id, id)
  }, [user])

  const isInBlueprint = useCallback((id: string) => items.some(i => i.id === id), [items])

  const clearBlueprint = useCallback(() => {
    if (!user) return
    setItems([])
    clearUserBlueprints(user.id)
  }, [user])

  const signOut = useCallback(async () => {
    const supabase = await getClient()
    await supabase.auth.signOut()
  }, [])

  return (
    <BlueprintContext.Provider value={{
      items, user, loading,
      isAuthModalOpen, openAuthModal, closeAuthModal,
      addToBlueprint, removeFromBlueprint, isInBlueprint, clearBlueprint, signOut,
    }}>
      {children}
    </BlueprintContext.Provider>
  )
}

export function useBlueprint(): BlueprintContextValue {
  const ctx = useContext(BlueprintContext)
  if (!ctx) throw new Error("useBlueprint must be used inside <BlueprintProvider>")
  return ctx
}
