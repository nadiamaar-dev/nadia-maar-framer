/* La scena dell'anteprima di /demo/onboarding-kyc.
 *
 * Porta il flusso al quarto passo — screening concluso e punteggio di
 * rischio a schermo — perché è il fotogramma che dice in un colpo d'occhio
 * cosa fa il prodotto. La prima schermata mostrerebbe un modulo vuoto:
 * corretto, e del tutto muto. */

export default async function scena(page) {
  await page.locator("#kyc-piva").fill("12345678903")
  await page.getByRole("button", { name: /Cerca nel registro/i }).click()
  await page.waitForFunction(
    () => document.querySelector("#kyc-ragioneSociale")?.value?.includes("Aurora"),
    null, { timeout: 20000 })

  await page.locator("#kyc-email").fill("ops@auroraliving.it")
  await page.locator("#kyc-settore").selectOption("E-commerce & Retail")
  await page.getByRole("button", { name: "2 – 10 M€" }).click()
  await page.getByRole("button", { name: "Continua" }).click()

  /* Due titolari: la barra delle quote a due colori si legge anche a 360 px,
     una sola fascia piena no. */
  await page.locator('input[id^="ubo-nome-"]').first().fill("Elena Bruni")
  await page.locator('input[id^="ubo-nascita-"]').first().fill("1979-03-08")
  await page.locator('input[id^="ubo-quota-"]').first().fill("60")
  await page.getByRole("button", { name: /Aggiungi un titolare/i }).click()
  await page.locator('input[id^="ubo-nome-"]').nth(1).fill("Marco Ferrero")
  await page.locator('input[id^="ubo-nascita-"]').nth(1).fill("1968-11-20")
  await page.locator('input[id^="ubo-quota-"]').nth(1).fill("40")
  await page.getByRole("button", { name: "Continua" }).click()

  const pdf = Buffer.from("%PDF-1.4 anteprima")
  for (const d of ["visura", "identita", "indirizzo"]) {
    await page.locator(`[data-testid="kyc-file-${d}"]`).setInputFiles({
      name: `${d}.pdf`, mimeType: "application/pdf", buffer: pdf,
    })
    await page.waitForFunction(
      id => /sha /i.test(document.querySelector(`[data-doc="${id}"]`)?.textContent || ""),
      d, { timeout: 20000 })
  }
  await page.getByRole("button", { name: "Continua" }).click()

  /* Si aspetta il verdetto, non solo la fine delle quattro liste. */
  await page.waitForSelector(".kyc-badge", { timeout: 40000 })
  await page.waitForTimeout(1200)

  /* Il passo intero è più alto del quadro: scorrere taglierebbe la barra dei
     passi a metà — e una fila di semicerchi in cima all'anteprima si legge
     come un difetto. Si rimpicciolisce il contenuto quel tanto che basta a
     far entrare tutto, dall'intestazione ai pulsanti. */
  await page.addStyleTag({ content: ".kyc-wrap { zoom: 0.8; padding-top: 20px; }" })
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
}
