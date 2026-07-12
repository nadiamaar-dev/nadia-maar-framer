import React, { Suspense, lazy } from "react"
import { useBlueprint } from "../context/BlueprintContext"

/* AuthModal statically imports the Supabase client, so it's lazy-loaded here:
   its chunk (and supabase-js) is fetched only when the modal is first opened,
   never on the initial homepage render. */
const AuthModal = lazy(() => import("./AuthModal"))

/* Renders AuthModal globally when isAuthModalOpen is true.
   Lives outside page components so it survives route changes. */
export default function AuthModalGate() {
  const { isAuthModalOpen } = useBlueprint()
  if (!isAuthModalOpen) return null
  return (
    <Suspense fallback={null}>
      <AuthModal />
    </Suspense>
  )
}
