import React from "react"
import { Btn, DISPLAY, Glass, MONO, T } from "./ui"

/**
 * There was no error boundary anywhere in the portal, so a render throw in
 * any single view blanked the whole cabinet — sidebar, header and all — with
 * no way back except a manual reload. This keeps the failure inside the
 * section that caused it.
 *
 * `resetKey` changes when the user navigates: switching section should clear
 * a previous section's error rather than leave the whole app stuck.
 */
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode; resetKey?: string },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[portal] render error", error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <Glass variant="panel" style={{ padding: 30, textAlign: "center" }}>
        <p style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.11em", textTransform: "uppercase", color: T.copperTx, margin: 0 }}>
          Errore
        </p>
        <p style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 800, color: T.text, margin: "10px 0 0" }}>
          Questa schermata non si è aperta
        </p>
        <p className="pt-body" style={{ fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.6, color: T.secondary, margin: "8px auto 20px", maxWidth: 420 }}>
          Il resto del tuo spazio funziona: puoi cambiare sezione dal menu. Se il problema resta, scrivici.
        </p>
        <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Btn variant="primary" onClick={() => this.setState({ error: null })}>Riprova</Btn>
          <Btn variant="ghost" onClick={() => window.location.reload()}>Ricarica la pagina</Btn>
        </div>
      </Glass>
    )
  }
}
