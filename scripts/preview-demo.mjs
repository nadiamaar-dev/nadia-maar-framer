/* ══════════════════════════════════════════════════════════════════════════
   ANTEPRIME DELLE DEMO — dallo schermo ai sei file che servono alla scheda.

   Le schede del catalogo (components/Sandbox/ProjectCard.tsx) chiedono sei
   file per anteprima: AVIF, WebP e JPEG a 480 e 960 px. Finora si
   producevano a mano, e infatti la terza demo è nata senza. Questo script
   li fa tutti da un indirizzo:

       node scripts/preview-demo.mjs <url> <nome> [scena.mjs] [attesa-ms]

   esempio:
       npx vite preview --port 4173 &
       node scripts/preview-demo.mjs \
         "http://localhost:4173/demo/onboarding-kyc?embed" onboarding-kyc \
         scripts/preview-scene/onboarding-kyc.mjs

   La «scena» è un modulo che esporta una funzione `(page) => Promise<void>`
   e porta la demo nello stato che vale la pena mostrare: un modulo vuoto al
   primo passo non vende niente, un flusso a metà lavoro sì.

   Il rapporto è 16:10 come le anteprime esistenti (960×600): cambiarlo su
   una sola scheda farebbe saltare l'allineamento della griglia.

   Lo scatto usa Firefox perché è l'unico motore che questa macchina
   (macOS 12) sa ancora installare — vedi playwright.config.ts.
══════════════════════════════════════════════════════════════════════════ */

import { firefox } from "@playwright/test"
import sharp from "sharp"
import { mkdir } from "node:fs/promises"

const [url, nome, scena, attesa = "2500"] = process.argv.slice(2)
if (!url || !nome) {
  console.error("uso: node scripts/preview-demo.mjs <url> <nome> [scena.mjs] [attesa-ms]")
  process.exit(1)
}

const DEST = "public/previews"
const W = 1280, H = 800          // 16:10, come le anteprime già in catalogo

await mkdir(DEST, { recursive: true })

const browser = await firefox.launch()
const page = await browser.newPage({
  viewport: { width: W, height: H },
  /* Due volte i pixel: il ridimensionamento a 960 parte da un'immagine più
     fitta e il testo non si sfrangia. */
  deviceScaleFactor: 2,
  colorScheme: "dark",
  reducedMotion: "reduce",       // niente fotogrammi a metà animazione
})

await page.goto(url, { waitUntil: "networkidle" })

if (scena) {
  const mod = await import(new URL(`../${scena}`, import.meta.url).href)
  await (mod.default ?? mod.scena)(page)
}

await page.waitForTimeout(Number(attesa))

const buf = await page.screenshot({ type: "png" })
await browser.close()

for (const w of [480, 960]) {
  const base = sharp(buf).resize(w, Math.round(w / 1.6), { fit: "cover" })
  await base.clone().avif({ quality: 62 }).toFile(`${DEST}/${nome}-${w}.avif`)
  await base.clone().webp({ quality: 78 }).toFile(`${DEST}/${nome}-${w}.webp`)
  await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`${DEST}/${nome}-${w}.jpg`)
  console.log(`${nome}-${w}: avif + webp + jpg`)
}
