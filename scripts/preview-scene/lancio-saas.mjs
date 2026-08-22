/* La scena dell'anteprima di /demo/lancio-saas.
 *
 * Il fotogramma che vale è l'apertura intera: il logotipo illuminato e
 * sotto il ventaglio di schede di vetro. Preso a grandezza naturale ci
 * starebbe solo il logotipo — cioè una parola su fondo nero, che non dice
 * che dentro c'è un prodotto funzionante. Si rimpicciolisce quel tanto che
 * basta a far entrare anche le tre schede.
 */

export default async function scena(page) {
  /* Una riga scritta nel campo fa vedere che i campi sono veri, non
     disegnati: un form vuoto in un'anteprima sembra un mockup. */
  await page.getByTestId("sg-scheda-apertura").getByLabel("Indirizzo e-mail").fill("laura@acme.it")
  await page.waitForTimeout(200)

  await page.addStyleTag({ content: ".sg-apertura { zoom: 0.68; padding-top: 26px; }" })
  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))

  /* Il fuoco lasciato nel campo disegnerebbe un bordo acceso fuori
     contesto: si toglie prima dello scatto. */
  await page.evaluate(() => document.activeElement?.blur())
  await page.waitForTimeout(300)
}
