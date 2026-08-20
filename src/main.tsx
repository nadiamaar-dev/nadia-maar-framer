import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { BlueprintProvider } from "./context/BlueprintContext"
import AuthModalGate from "./components/AuthModalGate"
import { ToastProvider } from "./context/ToastContext"
/* I caratteri per primi: sono l'unico foglio di stile che deve esistere prima
   che React disegni qualcosa. Vite lo estrae in un file con hash e lo collega
   nell'<head> della build, quindi il browser lo trova subito invece di
   scoprirlo a bundle già eseguito. */
import "./styles/fonts.css"
import "./admin.css"

/* Il sito è aperto: la schermata di pre-lancio con parola d'accesso
   (SiteGate) è stata rimossa, come previsto fin da quando è stata scritta.

   Per chiudere il sito adesso c'è la «Modalità manutenzione» in
   /dashboard#impostazioni: si accende senza ripubblicare, si spiega con un
   messaggio, sospende l'indicizzazione — e a differenza della vecchia
   schermata lascia aperta l'area clienti a chi ha un progetto in corso. */
/* La schermata di avvio in index.html vive dentro #root e sta a schermo
   intero (`position: fixed; inset: 0`). React, montando su un contenitore
   non vuoto, ne rimuove i figli — ma qui non ci si può appoggiare a un
   dettaglio del funzionamento interno: se un domani cambiasse, o se il
   montaggio fallisse a metà, quel riquadro coprirebbe l'intero sito senza
   che nessuno se ne accorga in fase di pubblicazione.

   Toglierla a mano costa tre righe e rende il comportamento una nostra
   decisione invece che una speranza. `render()` è sincrono fino al primo
   commit, quindi al ritorno l'applicazione è già disegnata: non c'è nessun
   fotogramma vuoto fra la rimozione e il sito. */
const container = document.getElementById("root")!
const boot = document.getElementById("nm-boot")

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <ToastProvider>
      <BlueprintProvider>
        <App />
        <AuthModalGate />
      </BlueprintProvider>
    </ToastProvider>
  </React.StrictMode>
)

boot?.remove()
