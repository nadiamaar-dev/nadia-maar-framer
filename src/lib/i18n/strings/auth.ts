import type { Bundle } from "../t"

/* La finestra di accesso all'Area Clienti e le due strisce di servizio del
   sito (barra promozionale e richiesta di consenso alle statistiche).

   Gli errori di Supabase non passano di qui: arrivano dal server già scritti,
   in inglese. Tradurli richiederebbe una tabella di codici che oggi non c'è —
   e un messaggio d'errore inventato è peggio di uno in un'altra lingua. */

const it = {
  auth: {
    tabLogin: "Accedi",
    tabRegister: "Registrati",
    titleLogin: "Bentornato.",
    titleRegister: "Crea la tua Architettura.",
    leadLogin: "Accedi per salvare il tuo Blueprint e gestire i progetti.",
    leadRegister: "Registrati gratuitamente per salvare componenti nel Blueprint e collaborare con noi.",
    fullName: "Nome e cognome",
    company: "Azienda (facoltativo)",
    email: "Email aziendale",
    password: "Password",
    submitLogin: "Accedi al Blueprint",
    submitRegister: "Crea Account Gratuito",
    or: "OPPURE",
    magicLink: "Accedi con link magico",
    magicLinkNoEmail: "Inserisci la tua email per ricevere il link.",
    footerRegister: "Registrandoti accetti i nostri termini di servizio.",
    footerLogin: "Senza password: ti inviamo un link di accesso via email.",
    doneCheckEmail: "Controlla la tua email!",
    doneLogin: "Accesso riuscito!",
    doneMagic: "Ti abbiamo inviato un link per accedere senza password.",
    doneRegister: "Abbiamo inviato un link di conferma al tuo indirizzo email.",
    doneWelcome: "Benvenuto nel tuo Blueprint.",
    demoButton: "Entra come ospite — cabinet demo",
    demoHint: "Un progetto vero in sola lettura, senza registrazione.",
  },

  chrome: {
    promoCta: "Scopri →",
    promoClose: "Chiudi l'avviso",
    consentLabel: "Consenso alle statistiche",
    consentTitle: "Statistiche",
    consentBody: "Vorrei usare strumenti di analisi di terze parti per capire come viene usato il sito. Le mie statistiche interne funzionano già senza cookie e senza il tuo indirizzo IP: se rifiuti, non perdo nulla di importante.",
    consentRefuse: "Rifiuta",
    consentAccept: "Accetta",
  },
}

const en: typeof it = {
  auth: {
    tabLogin: "Sign in",
    tabRegister: "Sign up",
    titleLogin: "Welcome back.",
    titleRegister: "Create your Architecture.",
    leadLogin: "Sign in to save your Blueprint and manage your projects.",
    leadRegister: "Sign up free to save components to the Blueprint and work with us.",
    fullName: "Full name",
    company: "Company (optional)",
    email: "Work email",
    password: "Password",
    submitLogin: "Sign in to the Blueprint",
    submitRegister: "Create Free Account",
    or: "OR",
    magicLink: "Sign in with a magic link",
    magicLinkNoEmail: "Enter your email to receive the link.",
    footerRegister: "By signing up you accept our terms of service.",
    footerLogin: "No password: we send you a sign-in link by email.",
    doneCheckEmail: "Check your email!",
    doneLogin: "Signed in!",
    doneMagic: "We've sent you a link to sign in without a password.",
    doneRegister: "We've sent a confirmation link to your email address.",
    doneWelcome: "Welcome to your Blueprint.",
    demoButton: "Enter as a guest — demo cabinet",
    demoHint: "A real project in read-only mode, no sign-up.",
  },

  chrome: {
    promoCta: "Find out →",
    promoClose: "Dismiss the notice",
    consentLabel: "Analytics consent",
    consentTitle: "Analytics",
    consentBody: "I'd like to use third-party analytics tools to understand how the site is used. My own internal statistics already work without cookies and without your IP address: if you decline, I lose nothing important.",
    consentRefuse: "Decline",
    consentAccept: "Accept",
  },
}

export const AUTH_STR = { it, en } satisfies Bundle<typeof it>
