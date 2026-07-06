import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { BlueprintProvider } from "./context/BlueprintContext"
import AuthModalGate from "./components/AuthModalGate"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BlueprintProvider>
      <App />
      <AuthModalGate />
    </BlueprintProvider>
  </React.StrictMode>
)
