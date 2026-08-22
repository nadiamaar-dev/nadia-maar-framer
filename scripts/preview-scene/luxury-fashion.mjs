/* La scena dell'anteprima di /demo/atelier-moda.
 *
 * Il fotogramma è la sala dell'atelier: la borsa sotto il faro con i due
 * pannelli di vetro ai lati — è il momento che distingue questa demo da
 * un qualunque negozio online. L'hero, per quanto elegante, direbbe solo
 * «una landing di moda». */

export default async function scena(page) {
  /* Una scelta con carattere: bordeaux con le iniziali impresse. La borsa
     di fabbrica (cognac) è bella ma anonima — l'anteprima deve mostrare
     che qui si personalizza, non si sfoglia. */
  await page.locator('[data-pelle="bordeaux"]').click()
  await page.getByLabel("Le tue iniziali").fill("NM")
  await page.waitForTimeout(600)

  /* La sala intera nel riquadro 16:10: un piccolo zoom tiene dentro i due
     pannelli e il cartellino del prezzo senza tagliare il teatro. Lo
     scorrimento arriva al FONDO della sala: così il titolo della sezione
     esce da sotto la barra sticky, che resta in cima come insegna. */
  await page.addStyleTag({ content: ".at-root { zoom: 0.92; }" })
  await page.evaluate(() => {
    document.querySelector(".at-sala")?.scrollIntoView({ block: "end", behavior: "instant" })
    window.scrollBy(0, 60)
  })
  await page.waitForTimeout(900)
}
