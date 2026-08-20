import { defineConfig, devices } from "@playwright/test"

/* ══════════════════════════════════════════════════════════════════════════
   TEST DI FUMO.

   Non è una suite di regressione: è il minimo indispensabile perché una
   pubblicazione non possa rompere in silenzio le quattro cose da cui
   dipendono i contatti in arrivo — la home si disegna, il configuratore
   arriva in fondo, l'area clienti resta chiusa a chi non ha le chiavi, e la
   versione inglese esiste davvero.

   Girano sulla build di produzione, non sul server di sviluppo: le
   differenze fra i due (minificazione, divisione dei bundle, caratteri
   serviti dal dominio) sono esattamente il territorio in cui nascono i
   guasti che il dev server non mostra.

   `reuseExistingServer` in locale: chi ha già `npm run preview` aperto non
   se lo vede riavviare a ogni esecuzione. In CI mai, altrimenti si
   testerebbe un processo rimasto in piedi da un'esecuzione precedente.
══════════════════════════════════════════════════════════════════════════ */

const PORT = 4173
const BASE = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  /* In locale un solo worker. Con due, su questa macchina girano due Firefox
     più il server di anteprima, e la home — la pagina più pesante del sito —
     impiega più dei cinque secondi predefiniti solo per montare. I test
     diventavano rossi a seconda del carico, che è il modo più rapido per
     insegnare a non guardarli. In CI la macchina è dedicata e i due worker
     restano. */
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE,
    trace: "on-first-retry",
    /* Su un fallimento la traccia dice quale richiesta è andata storta; lo
       screenshot dice come appariva la pagina. Insieme evitano il «da me
       funziona» che costa mezza giornata. */
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    /* Il traffico di questo sito è per metà da telefono e il layout cambia
       parecchio sotto i 900px: testarlo solo su desktop vorrebbe dire
       coprire metà dei visitatori. */
    { name: "mobile", use: { ...devices["iPhone 13"] } },
    /* Firefox non serve alla copertura — i due profili sopra bastano — ma
       serve a POTER eseguire i test in locale: Playwright non distribuisce
       più Chromium per macOS 12, e su una macchina così i due profili
       principali non partono affatto. Meglio un motore diverso che nessun
       test finché non si aggiorna il sistema.

           npm test -- --project=firefox
    */
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],

  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
