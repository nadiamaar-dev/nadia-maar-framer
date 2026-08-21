import { expect, test } from "@playwright/test"

/* ══════════════════════════════════════════════════════════════════════════
   I QUATTRO CONTROLLI CHE DEVONO PASSARE PRIMA DI PUBBLICARE.

   Il criterio per stare in questo file: se si rompe, smettono di arrivare
   richieste — o ne arrivano di sbagliate. Tutto il resto sta altrove.

   1. La home si disegna e il titolo c'è.
   2. Il configuratore arriva al blueprint: è la macchina che raccoglie i
      contatti qualificati.
   3. L'area riservata resta chiusa a chi non ha fatto accesso.
   4. La versione inglese esiste, si dichiara tale e non è un doppione.

   Più due controlli di regressione sulle prestazioni, scritti dopo aver
   corretto i difetti che coprono: sono le cose che tornano indietro da sole
   al primo refactor distratto.
══════════════════════════════════════════════════════════════════════════ */

test.describe("pagine pubbliche", () => {
  test("la home si disegna e sostituisce la schermata di avvio", async ({ page }) => {
    await page.goto("/")

    /* Il titolo è spezzato in più <span> con trattamenti grafici diversi:
       si cerca la riga, non la stringa intera. */
    /* Quindici secondi e non i cinque predefiniti: qui si sta verificando
       CHE la pagina si disegni, non QUANTO ci mette. La velocità si misura
       con gli strumenti giusti (vedi docs/prestazioni.md) su un dominio
       pubblicato; un test funzionale che fallisce perché la macchina è
       carica non dice niente di vero sul sito. */
    await expect(page.locator("h1").first()).toContainText(/Architect/i, { timeout: 15_000 })

    /* #nm-boot vive dentro #root: se resta a schermo, React non è montato —
       cioè la pagina è bianca per il visitatore. */
    await expect(page.locator("#nm-boot")).toHaveCount(0)

    await expect(page.locator("header")).toBeVisible()
  })

  test("il configuratore arriva fino al blueprint", async ({ page }) => {
    await page.goto("/")

    const configuratore = page.locator("#s7")
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 })
    await configuratore.scrollIntoViewIfNeeded()

    /* Passo 1: si sceglie una direzione. Senza, «Avanti» resta spento — ed è
       proprio quel vincolo che si vuole verificare. */
    const avanti = configuratore.locator(".fc-nav-b.is-next")
    await expect(avanti).toHaveCount(0)

    /* Scegliere la direzione porta già al passo 2 (lo fa `pickVector` nello
       store): il numero di clic che restano è un dettaglio del prodotto, non
       qualcosa che questo test debba sapere. Si avanza finché il pulsante
       esiste — al blueprint sparisce, ed è quello il segnale di arrivo. */
    await configuratore.locator(".fc-card").first().click()

    for (let i = 0; i < 5 && (await avanti.count()) > 0; i++) {
      await avanti.click()
    }
    await expect(avanti, "al blueprint non si va più avanti").toHaveCount(0)

    /* Al quarto passo compaiono la stima di impegno e i due pulsanti che
       portano al contatto e al PDF. */
    await expect(configuratore.locator(".fc-cx")).toBeVisible()
    await expect(configuratore.locator(".fc-cta")).toBeVisible()

    /* Il resoconto si scrive da solo dalla selezione: se resta il testo del
       vuoto, la catena selezione → blueprint si è interrotta. */
    await expect(page.locator(".fc-sum-empty")).toHaveCount(0)
    await expect(page.locator(".fc-shelf").first()).toBeVisible()
  })

  test("le cinque pagine servizio rispondono e hanno titoli distinti", async ({ page }) => {
    const rotte = ["/ecommerce", "/corporate", "/web-app", "/seo", "/ai"]
    const titoli = new Set<string>()

    for (const rotta of rotte) {
      const risposta = await page.goto(rotta)
      expect(risposta?.status(), `${rotta} deve rispondere 200`).toBe(200)
      await expect(page.locator("h1").first()).toBeVisible()
      titoli.add((await page.locator("h1").first().innerText()).trim())
    }

    /* Cinque pagine con lo stesso titolo sono cinque pagine che competono
       fra loro su Google. */
    expect(titoli.size).toBe(rotte.length)
  })
})

test.describe("architettura e prove", () => {
  test("/architecture esiste in due lingue e misura sé stessa", async ({ page }) => {
    await page.goto("/architecture")
    await expect(page.locator("h1").first()).toContainText(/QUESTO SITO/i, { timeout: 15_000 })

    /* Le misure arrivano dalle Performance API dopo il load: almeno una
       scheda deve smettere di dire «misurazione…». Se restano tutte vuote,
       il hook è rotto e la pagina promette numeri che non mostra. */
    await expect(page.locator(".ar-live-grid")).toContainText(/ms|kB/, { timeout: 15_000 })

    await page.goto("/en/architecture")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.locator("h1").first()).toContainText(/THIS SITE/i, { timeout: 15_000 })
  })

  test("i casi studio mostrano un artefatto e portano al configuratore", async ({ page }) => {
    await page.goto("/projects")
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 })

    /* L'artefatto del primo caso è una policy RLS vera: se sparisce, i casi
       anonimi tornano a essere parole senza prova. */
    await expect(page.locator("pre code").first()).toContainText("create policy")

    /* Ogni caso chiude su un configuratore già impostato: il link porta
       all'ancora #configuratore della pagina servizio corrispondente. */
    const cta = page.locator('a[href*="#configuratore"]')
    expect(await cta.count()).toBeGreaterThanOrEqual(3)
  })

  test("il footer mostra il punteggio Lighthouse quando l'API risponde", async ({ page }) => {
    /* Il numero è finto QUI, non in produzione: si verifica il circuito
       fetch → distintivo, non la misura di Google. */
    /* `?` in un glob è un carattere jolly: si intercetta il percorso e basta,
       la query non fa parte del criterio. */
    await page.route("**/api/pagespeed*", route =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ performance: 97, lcpMs: 1200, cls: 0.01, strategy: "mobile" }) }),
    )

    await page.goto("/")
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 })
    await page.locator("footer").scrollIntoViewIfNeeded()

    await expect(page.locator("footer")).toContainText("Lighthouse 97/100", { timeout: 10_000 })
  })
})

test.describe("demo onboarding kyc", () => {
  test("il flusso si attraversa: validazione, errore gestito, invio", async ({ page }) => {
    await page.goto("/demo/onboarding-kyc")

    /* Passo 1 — una P.IVA sbagliata viene smascherata dal checksum… */
    await page.locator("#kyc-ragioneSociale").fill("Aurora Living S.r.l.")
    await page.locator("#kyc-piva").fill("11111111111")
    await page.locator("#kyc-piva").blur()
    await expect(page.locator(".kyc-err")).toContainText(/codice di controllo/i)

    /* …e una giusta accende la spunta e sblocca il passo. */
    await page.locator("#kyc-piva").fill("12345678903")
    await page.locator("#kyc-email").fill("ops@auroraliving.it")
    await page.locator("#kyc-settore").selectOption("E-commerce & Retail")
    const continua = page.getByRole("button", { name: "Continua" })
    await expect(continua).toBeEnabled()
    await continua.click()

    /* Passo 2 — un file oltre gli 8 MB fallisce CON spiegazione… */
    await page.locator('[data-testid="kyc-file-visura"]').setInputFiles({
      name: "visura-scansione.pdf", mimeType: "application/pdf",
      buffer: Buffer.alloc(9 * 1024 * 1024),
    })
    await expect(page.locator('[data-doc="visura"]')).toContainText(/supera gli 8 MB/i, { timeout: 10_000 })

    /* …e il «Riprova» con un file sano arriva in fondo. */
    const pdf = Buffer.from("%PDF-1.4 demo")
    for (const doc of ["visura", "identita", "indirizzo"]) {
      await page.locator(`[data-testid="kyc-file-${doc}"]`).setInputFiles({
        name: `${doc}.pdf`, mimeType: "application/pdf", buffer: pdf,
      })
      await expect(page.locator(`[data-doc="${doc}"]`)).toContainText(/caricato/i, { timeout: 10_000 })
    }
    await page.getByRole("button", { name: "Continua" }).click()

    /* Passo 3 — il riepilogo mostra i dati, il consenso sblocca l'invio. */
    await expect(page.locator(".kyc-glass")).toContainText("12345678903")
    await page.locator(".kyc-consent input").check()
    await page.getByRole("button", { name: "Invia la pratica" }).click()
    await expect(page.locator(".kyc-card")).toContainText(/Pratica ricevuta/i, { timeout: 10_000 })
  })
})

test.describe("cabinet ospite", () => {
  test("l'ospite entra in sola lettura e vede il progetto demo", async ({ page }) => {
    /* Accesso VERO contro Supabase di produzione: le credenziali sono
       pubbliche per progetto (migrazione 25) e la sola lettura la impone il
       database — è esattamente ciò che questo test certifica dal lato UI.
       In CI le variabili Supabase sono vuote DI PROPOSITO (vedi ci.yml): lì
       il cabinet mostra la schermata di configurazione e questo test non ha
       niente da dire. */
    test.skip(!!process.env.CI && !process.env.VITE_SUPABASE_URL,
      "senza Supabase il cabinet non ha un accesso da verificare")

    await page.goto("/cabinet")
    await page.getByText("Entra come ospite", { exact: false }).click()

    /* Il progetto seminato compare: la sessione è attiva e la RLS mostra i
       dati dell'ospite. */
    await expect(page.locator("body")).toContainText("Aurora Living", { timeout: 25_000 })

    /* La targa dichiara la natura dell'account. */
    await expect(page.locator("body")).toContainText(/sola lettura/i)
  })
})

test.describe("area riservata", () => {
  test("il pannello non si apre senza accesso", async ({ page }) => {
    await page.goto("/dashboard")

    /* Chi non ha fatto accesso viene rimandato alla home
       (`window.location.replace("/")` in DashboardGate). Si aspetta che la
       navigazione si sia assestata: la prima versione di questo test
       cercava la schermata di accesso, che però esiste solo per una frazione
       di secondo prima del reindirizzamento — passava o falliva a seconda di
       quanto era carica la macchina, ed è il modo più veloce per farsi
       ignorare da chi legge i risultati. */
    await page.waitForURL(url => !url.pathname.startsWith("/dashboard"), { timeout: 15_000 })

    /* Quello che conta davvero, e che non dipende dai tempi: nessun dato del
       pannello deve essere finito in pagina. */
    await expect(page.locator("body")).not.toContainText(/Fatturato|Clienti attivi|Audit trail/i)
    await expect(page.locator("body")).not.toContainText(/Panoramica|Fatturazione/i)
  })
})

test.describe("versione inglese", () => {
  test("/en si dichiara inglese e traduce la navigazione", async ({ page }) => {
    await page.goto("/en")

    await expect(page.locator("html")).toHaveAttribute("lang", "en")

    /* Il selettore di lingua è fatto di <a> veri: la versione inglese deve
       poter tornare indietro. `toBeAttached` e non `toBeVisible`: su
       schermo stretto il selettore vive dentro il menu, che qui non serve
       aprire — si verifica che il percorso di ritorno ESISTA nel DOM. */
    await expect(page.locator('a[hreflang="it"]').first()).toBeAttached()
  })

  test("/en/contatti mostra il modulo in inglese", async ({ page }) => {
    await page.goto("/en/contatti")
    await expect(page.locator("h1").first()).toContainText(/talk about your project/i)
    await expect(page.getByPlaceholder("Your name")).toBeVisible()
  })
})

test.describe("resilienza", () => {
  test("il sito si disegna anche se Supabase non risponde", async ({ page }) => {
    /* Le pagine pubbliche non hanno bisogno del database: i testi sono nel
       bundle. Prima però <MaintenanceGate> restava in attesa delle
       impostazioni senza scadenza, e con una richiesta appesa il visitatore
       vedeva uno schermo scuro vuoto a tempo indeterminato. Qui la richiesta
       viene fatta sparire del tutto: il sito deve comparire lo stesso. */
    await page.route("**/rest/v1/public_site_settings*", async () => {
      /* Nessuna risposta e nessun errore: la peggiore delle ipotesi, quella
         che un `.catch()` da solo non intercetta. */
      await new Promise(() => {})
    })

    await page.goto("/")
    await expect(page.locator("h1").first()).toContainText(/Architect/i, { timeout: 15_000 })
  })
})

test.describe("voronka", () => {
  test("l'apertura di una demo e l'avanzamento del configuratore emettono eventi", async ({ page, browserName }) => {
    /* Gli eventi partono via sendBeacon, e su WebKit page.route non li
       intercetta: il test vedrebbe zero eventi anche col codice sano.
       La logica della voronka è identica sui tre motori — la copre il
       profilo chromium. */
    test.skip(browserName === "webkit", "page.route non intercetta sendBeacon su WebKit")

    /* Si intercetta /api/track: il test verifica che gli eventi PARTANO con
       la forma giusta, non che il database li riceva — quello è compito
       della migrazione e delle policy, non del browser. */
    const eventi: { event?: string; props?: Record<string, unknown> }[] = []
    await page.route("**/api/track", async route => {
      const post = route.request().postData()
      if (post) {
        try {
          const body = JSON.parse(post) as { event?: string; props?: Record<string, unknown> }
          if (body.event) eventi.push(body)
        } catch { /* pageview senza evento: non interessa qui */ }
      }
      await route.fulfill({ status: 204, body: "" })
    })

    await page.goto("/")
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 })

    /* passo 1 → 2 del configuratore: deve partire config_step */
    const configuratore = page.locator("#s7")
    await configuratore.scrollIntoViewIfNeeded()
    await configuratore.locator(".fc-card").first().click()

    await expect.poll(() => eventi.some(e => e.event === "config_step")).toBeTruthy()
    const passo = eventi.find(e => e.event === "config_step")
    expect(passo?.props?.step).toBe(2)
  })
})

test.describe("regressioni sulle prestazioni", () => {
  test("nessun carattere viene chiesto a Google", async ({ page }) => {
    /* I caratteri erano importati da fonts.googleapis.com dentro uno <style>
       inserito da React: tre viaggi di rete in fila prima che il titolo
       potesse comparire. Ora stanno su /fonts. Questo controllo esiste
       perché un @import è una riga sola, ed è facilissimo rimetterla. */
    const esterni: string[] = []
    page.on("request", r => {
      const u = r.url()
      if (u.includes("fonts.googleapis.com") || u.includes("fonts.gstatic.com")) esterni.push(u)
    })

    await page.goto("/", { waitUntil: "networkidle" })
    expect(esterni, "i caratteri devono arrivare dal nostro dominio").toEqual([])
  })

  test("una sola description e le proporzioni delle immagini dichiarate", async ({ page }) => {
    await page.goto("/")

    /* Il guscio ne porta una statica e <SEOHead> ne scrive una sua: se le
       due convivessero, sarebbe il crawler a scegliere quale contare.
       Prima si aspetta che SEOHead abbia scritto la SUA (arriva dopo una
       fetch): senza questa attesa il conteggio fotografava il guscio da
       solo e il test passava anche col difetto — è successo per mesi. */
    await expect(page.locator('meta[name="description"][data-seo]')).toHaveCount(1, { timeout: 15_000 })
    await expect(page.locator('meta[name="description"]')).toHaveCount(1)

    /* Immagini senza dimensioni dichiarate = spostamento di layout mentre
       si legge. Vale per tutte, non solo per quelle che ricordiamo. */
    await page.goto("/foundry")
    const immagini = page.locator("img:visible")
    const n = await immagini.count()
    for (let i = 0; i < n; i++) {
      const img = immagini.nth(i)
      const w = await img.getAttribute("width")
      const ratio = await img.evaluate(el => getComputedStyle(el.parentElement!).aspectRatio)
      expect(
        w !== null || (ratio !== "auto" && ratio !== ""),
        "ogni immagine deve avere width/height o un contenitore con aspect-ratio",
      ).toBeTruthy()
    }
  })
})
