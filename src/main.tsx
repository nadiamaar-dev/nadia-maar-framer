import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { BlueprintProvider } from "./context/BlueprintContext"
import AuthModalGate from "./components/AuthModalGate"
import { ToastProvider } from "./context/ToastContext"
import SiteGate from "./components/SiteGate"
import "./admin.css"

/* SiteGate copre l'intero sito, portale compreso: finché è attivo nemmeno un
   cliente con le credenziali arriva all'area riservata. È voluto — è una
   schermata di pre-lancio — ma quando il sito apre va rimossa da qui. */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SiteGate>
      <ToastProvider>
        <BlueprintProvider>
          <App />
          <AuthModalGate />
        </BlueprintProvider>
      </ToastProvider>
    </SiteGate>
  </React.StrictMode>
)
