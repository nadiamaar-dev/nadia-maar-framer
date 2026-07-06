import React from "react"
import { useBlueprint } from "../context/BlueprintContext"
import AuthModal from "./AuthModal"

/* Renders AuthModal globally when isAuthModalOpen is true.
   Lives outside page components so it survives route changes. */
export default function AuthModalGate() {
  const { isAuthModalOpen } = useBlueprint()
  return isAuthModalOpen ? <AuthModal /> : null
}
