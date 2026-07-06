import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { User } from "@supabase/supabase-js"
import { supabase, SUPABASE_READY } from "../lib/supabase"
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
}

const BlueprintContext = createContext<BlueprintContextValue | null>(null)

/* ── helpers ── */
async function fetchUserBlueprints(userId: string): Promise<SandboxItem[]> {
  const { data, error } = await supabase
    .from("blueprints")
    .select("item_data")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return data.map((row) => row.item_data as SandboxItem)
}

async function insertBlueprint(userId: string, item: SandboxItem) {
  await supabase
    .from("blueprints")
    .upsert({ user_id: userId, item_id: item.id, item_data: item }, { onConflict: "user_id,item_id" })
}

async function deleteBlueprint(userId: string, itemId: string) {
  await supabase
    .from("blueprints")
    .delete()
    .eq("user_id", userId)
    .eq("item_id", itemId)
}

async function clearUserBlueprints(userId: string) {
  await supabase.from("blueprints").delete().eq("user_id", userId)
}

/* ══════════════════════════════════════════════════════════ */
export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]               = useState<SandboxItem[]>([])
  const [user, setUser]                 = useState<User | null>(null)
  const [loading, setLoading]           = useState(true)
  const [isAuthModalOpen, setAuthModal] = useState(false)
  const mountedRef                      = useRef(true)

  /* ── bootstrap: read session once, then subscribe to changes ── */
  useEffect(() => {
    mountedRef.current = true

    /* Skip all Supabase calls if credentials are not configured */
    if (!SUPABASE_READY) {
      setLoading(false)
      return () => { mountedRef.current = false }
    }

    supabase.auth.getSession()
      .then(async ({ data }) => {
        const u = data.session?.user ?? null
        if (!mountedRef.current) return
        setUser(u)
        if (u) {
          const saved = await fetchUserBlueprints(u.id)
          if (mountedRef.current) setItems(saved)
        }
        setLoading(false)
      })
      .catch(() => {
        if (mountedRef.current) setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      if (!mountedRef.current) return
      setUser(u)
      if (u) {
        setLoading(true)
        const saved = await fetchUserBlueprints(u.id).catch(() => [] as SandboxItem[])
        if (mountedRef.current) { setItems(saved); setLoading(false) }
        setAuthModal(false)
      } else {
        setItems([])
        setLoading(false)
      }
    })

    return () => { mountedRef.current = false; sub.subscription.unsubscribe() }
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

  return (
    <BlueprintContext.Provider value={{
      items, user, loading,
      isAuthModalOpen, openAuthModal, closeAuthModal,
      addToBlueprint, removeFromBlueprint, isInBlueprint, clearBlueprint,
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
