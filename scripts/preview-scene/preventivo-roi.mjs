/* La scena dell'anteprima di /demo/preventivo-roi.
 *
 * Porta il configuratore al secondo passo con qualche modulo acceso: è il
 * fotogramma che mostra insieme le due cose che contano — le schede con i
 * vincoli e il preventivo che si è già riscritto a destra. Il primo passo
 * avrebbe il conto vuoto, cioè metà messaggio. */

export default async function scena(page) {
  await page.getByRole("button", { name: /Shopify Plus/ }).click()
  await page.getByRole("button", { name: "Continua" }).click()

  /* Il configuratore tira dentro il PIM da sé: due voci nel conto con una
     mossa sola, e la riga «prezzo adeguato» ben visibile. */
  await page.locator('[data-modulo="configuratore"]').click()
  await page.locator('[data-modulo="magazzino"]').click()
  await page.waitForTimeout(700)

  /* Il pannello scende sotto la piega su schermi corti: si rimpicciolisce
     quel tanto che basta a tenere in quadro schede e preventivo interi. */
  await page.addStyleTag({ content: ".qt-shell { zoom: 0.86; padding-top: 16px; }" })
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
}
