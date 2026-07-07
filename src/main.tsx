import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { BlueprintProvider } from "./context/BlueprintContext"
import AuthModalGate from "./components/AuthModalGate"
import { ToastProvider } from "./context/ToastContext"
import "./admin.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <BlueprintProvider>
        <App />
        <AuthModalGate />
      </BlueprintProvider>
    </ToastProvider>
  </React.StrictMode>
)
