/* La scena dell'anteprima di /demo/preventivo-roi.
 *
 * Porta il configuratore al secondo passo con qualche modulo acceso: è il
 * fotogramma che mostra insieme le due cose che contano — le schede con i
 * vincoli e il preventivo che si è già riscritto a destra. Il primo passo
 * avrebbe il conto vuoto, cioè metà messaggio. */

export default async function scena(page) {
  /* Un preset popola tutto in un colpo: il cruscotto in alto si riempie di
     numeri veri e le schede mostrano gli stati accesi. Con la sola
     piattaforma scelta, metà anteprima sarebbe a zero. */
  await page.getByRole("button", { name: /Scala e integra/ }).click()
  await page.waitForTimeout(900)

  /* Il pannello scende sotto la piega su schermi corti: si rimpicciolisce
     quel tanto che basta a tenere in quadro schede e preventivo interi. */
  await page.addStyleTag({ content: ".qt-shell { zoom: 0.84; padding-top: 12px; }" })
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
}
