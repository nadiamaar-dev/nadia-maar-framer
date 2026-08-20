# Budget di prestazione

Questo sito vende architetture veloci. È l'unico caso in cui il portfolio e il
prodotto coincidono: chi valuta lo studio apre PageSpeed **su questo dominio**
prima di leggere qualsiasi caso studio. Il documento fissa i limiti che ci
diamo e come si verificano, così che «veloce» resti un numero e non
un'opinione.

---

## I limiti

| Metrica | Limite | Dove si misura |
|---|---|---|
| LCP (mobile, 4G) | < 1,8 s | `/`, `/ecommerce`, `/en` |
| INP | < 200 ms | `/` (la pagina con più elementi animati) |
| CLS | < 0,05 | tutte le pagine pubbliche |
| JS del primo caricamento | < 320 kB non compressi | bundle `index-*.js` |
| Richieste a terze parti nel percorso critico | 0 | qualsiasi pagina |

Il limite su LCP è 1,8 s e non 1,2: 1,2 è il valore che promettiamo su un
progetto e-commerce dedicato, dove si controlla anche il catalogo e le
immagini di prodotto. Su un sito di studio con animazioni e demo interattive
il numero onesto è più alto — e dichiararlo alto e rispettarlo vale più che
dichiararlo basso e mancarlo.

---

## Le decisioni che tengono i numeri

**Caratteri serviti da noi.** Le cinque famiglie stanno in `public/fonts` come
woff2 variabili, sottoinsiemi latin e latin-ext. Prima arrivavano da
`fonts.googleapis.com` con ventidue regole `@import` scritte dentro `<style>`
inseriti da React: il browser le scopriva dopo aver eseguito il bundle, cioè
tre viaggi di rete in fila prima che il titolo comparisse. Le due famiglie del
primo schermo sono in `<link rel="preload">`.

> Un `@import` di Google Fonts è una riga sola e rientra facilmente durante un
> refactor. Per questo esiste un test che fallisce se una richiesta parte
> verso `fonts.googleapis.com` o `fonts.gstatic.com`.

**Primo fotogramma già scuro.** `index.html` porta il CSS critico in linea e
una schermata di avvio dentro `#root`, che React sostituisce al montaggio.
Senza, il visitatore vedeva bianco fino all'esecuzione del bundle.

**Immagini nella misura giusta.** Le anteprime erano JPEG da 1600 px (139 e
189 kB) dentro riquadri larghi 360. Ora sono AVIF/WebP/JPEG a 480 e 960 px,
scelte dal browser con `srcset` e `sizes`: 8 kB nel caso normale. Il
contenitore ha `aspect-ratio`, quindi lo spazio è riservato prima del
caricamento.

**Una scrittura per fotogramma.** L'alone che segue il cursore aggiornava
quattro variabili CSS su `<html>` a ogni evento `pointermove`, facendo
ricalcolare lo stile a tutti gli elementi `[data-glow]`. Ora passa da
`requestAnimationFrame` e non si attiva né su touch né con movimento ridotto
(`src/hooks/usePointerGlow.ts`).

**Cache immutabile.** `vercel.json` marca `/assets` e `/fonts` come
`immutable` per un anno: hanno l'hash nel nome, quindi non cambiano mai a
parità di indirizzo.

---

## Come si verifica

```bash
npm run check     # tipi + lint + build
npm test          # test di fumo sulla build di produzione
```

Per le metriche vere serve il dominio pubblicato, non la macchina locale:

```bash
# dopo la pubblicazione
npx unlighthouse --site https://www.nadiamaar.dev --throttle
```

Oppure PageSpeed Insights su `/`, `/ecommerce`, `/en`. I dati di laboratorio
bastano per i confronti fra due versioni; per il giudizio finale contano i
dati di campo in Search Console, che arrivano dopo qualche settimana di
traffico.

**Quando si tocca il percorso critico** — caratteri, CSS iniziale, dimensione
del bundle, immagini sopra la piega — la misura va rifatta prima di
pubblicare. Non dopo: dopo significa scoprirlo da un cliente.
