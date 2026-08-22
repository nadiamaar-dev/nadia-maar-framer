/* La scena dell'anteprima di /demo/regia.
 *
 * Il fotogramma che vende è il quadro comandi al lavoro: la coda con
 * qualche ordine già maturato, un'eccezione risolta (il verde accanto al
 * rosso racconta il prodotto meglio di qualunque titolo) e il nastro coi
 * nodi. Si lascia correre la marea qualche battito, si risolve la prima
 * eccezione, e si inquadra il quadro — non il titolo.
 */

export default async function scena(page) {
  /* Qualche battito di marea: una tabella con una riga sola sembra rotta. */
  await page.waitForTimeout(6000)

  /* L'eccezione risolta: quattro passi da 750 ms l'uno, più il margine. */
  await page.getByRole("button", { name: "Risolvi con la regia" }).first().click()
  await page.waitForTimeout(4200)

  /* Il quadro comandi al centro dell'inquadratura, appena rimpicciolito
     per far entrare tabella, eccezioni e nastro insieme. */
  await page.addStyleTag({ content: ".rg-apertura { zoom: 0.82; padding-top: 10px; }" })
  await page.waitForTimeout(300)
  const quadro = page.locator(".rg-quadro")
  await quadro.scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy({ top: -60, behavior: "instant" }))
  await page.waitForTimeout(600)
}
