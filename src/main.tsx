import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { BlueprintProvider } from "./context/BlueprintContext"
import AuthModalGate from "./components/AuthModalGate"
import { ToastProvider } from "./context/ToastContext"
import "./admin.css"

/* Il sito è aperto: la schermata di pre-lancio con parola d'accesso
   (SiteGate) è stata rimossa, come previsto fin da quando è stata scritta.

   Per chiudere il sito adesso c'è la «Modalità manutenzione» in
   /dashboard#impostazioni: si accende senza ripubblicare, si spiega con un
   messaggio, sospende l'indicizzazione — e a differenza della vecchia
   schermata lascia aperta l'area clienti a chi ha un progetto in corso. */
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
