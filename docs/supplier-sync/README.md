# Nucleo multi-fornitore e dropshipping

Progetto di riferimento per il retro del *Portale Fornitori*. La demo che si prova
su `/demo/portale-fornitori` disegna l'interfaccia di questo nucleo; qui c'è la
parte che gira sul VPS.

```
docs/supplier-sync/
├── schema.sql                     DDL completo: fornitori, offerte, regole, diario
└── src/
    ├── adapters/
    │   ├── types.ts               il contratto: RawItem → NormalizedItem
    │   ├── declarative.ts         REST JSON / XML / CSV guidati dalla mappatura
    │   └── index.ts               registro: modulo dedicato o dichiarativo
    ├── pricing.ts                 costo → regola → margine → arrotondamento → IVA
    ├── sync.ts                    la corsa: lock, diff, upsert, riprezzatura, diario
    └── queue.ts                   BullMQ: pianificazione, «Sincronizza ora», eventi
```

## La decisione che regge tutto

**L'offerta di un fornitore e il prodotto che vendiamo sono due tabelle diverse.**

```
supplier_products          products
(cosa dichiara lui)   →    (cosa pubblichiamo noi)
  supplier_sku               sku
  cost_gross                 cost_net     ← dall'offerta migliore
  stock                      price_net    ← dalla regola di prezzo
  hash                       price_locked ← la valvola manuale
```

Da qui discende il resto: lo stesso articolo può avere quattro offerte, la vista
`v_best_offer` sceglie chi spedisce (disponibilità, poi costo, poi consegna), e
cambiare fornitore su un articolo non tocca il catalogo pubblico.

Chi tiene una tabella sola finisce, sei mesi dopo, a scrivere `supplier2_cost`.

## Aggiungere un fornitore

Il caso normale **non richiede codice**. Una riga in `suppliers` con la mappatura
compilata dal pannello:

```json
{
  "items": "data.products",
  "fields": {
    "supplierSku": ["code", "trim", "upper"],
    "name":        "description",
    "costGross":   ["price.net", "comma_decimal"],
    "stock":       ["availability.qty", "int"],
    "ean":         "gtin",
    "brand":       "manufacturer.name"
  },
  "skipWhen": [{ "path": "discontinued", "equals": true }]
}
```

`comma_decimal` non è un dettaglio: il fornitore tedesco manda `1.234,56`, dove il
punto separa le migliaia. Leggerlo come decimale sposta il costo di tre ordini di
grandezza, e in silenzio.

Un **modulo dedicato** serve solo quando la mappatura non basta: paginazione a
cursore firmato, listino e giacenze su due chiamate da riconciliare, envelope SOAP.
Si implementa `SupplierAdapter`, si chiama `register()`, si scrive la chiave in
`suppliers.adapter_key`. Il nucleo non cambia — se per aggiungere un fornitore si
tocca `sync.ts`, l'astrazione ha già fallito.

## Il prezzo

Sempre in quest'ordine, sempre spiegabile:

```
costo fornitore → EUR → −sconto contratto → +trasporto allocato   = COSTO SBARCATO
  → regola (ricarico | margine obiettivo | fisso | imposto)
  → pavimento di margine minimo
  → tetto di prezzo
  → arrotondamento                                                = PREZZO B2B NETTO
  → IVA                                                           = LORDO
```

Tre punti su cui si sbaglia sempre:

- **ricarico ≠ margine.** Su un costo di 100, il 30 % di ricarico dà 130 (margine
  23 %); il 30 % di margine dà 142,86. `percent_on_cost` e `target_margin` sono due
  `kind` distinti proprio per non lasciare la cosa all'interpretazione.
- **l'arrotondamento va dopo il pavimento**, e il pavimento si riapplica dopo:
  arrotondare a `.90` per difetto può far scendere sotto il margine minimo.
- **i prezzi si conservano al netto.** Il lordo è una vista: il cliente italiano e
  quello intracomunitario leggono lo stesso `price_net` e vedono due totali diversi,
  e nessuno dei due è memorizzato.

Vince la regola più specifica (SKU 8 · marca 4 · categoria 2 · fornitore 1 · fascia
di costo 1), a parità la priorità più alta. `computePrice` restituisce anche `steps`:
è la colonna «come si arriva a questo prezzo» del pannello. Un motore di cui non si
vede il ragionamento non viene adottato — si continua a scrivere i prezzi a mano.

`price_locked` esiste per la stessa ragione: senza una valvola manuale che vince
sempre, nessun commerciale si fida di un sistema che riscrive i prezzi di notte.

## La corsa

```
lock consultivo → apri sync_run → per pagina: normalizza · confronta hash · upsert
                → riprezza ciò che è cambiato → disattiva ciò che è sparito
                → chiudi sync_run → sblocca
```

- **Idempotente.** La stessa risposta due volte lascia il database uguale.
- **Resiliente.** Una riga sbagliata finisce in `sync_events`, non ferma le altre.
  Solo oltre il 10 % di righe in errore la corsa si dichiara fallita.
- **Economica.** L'impronta (`hash`) decide se riscrivere: 40.000 righe lette,
  300 aggiornate. Confrontare costa un SHA-1; riscrivere costa WAL, indici e trigger
  per ognuna delle 40.000.

Ciò che sparisce dal feed si **disattiva**, non si cancella: un export troncato a
metà non deve svuotare il catalogo, e una riga che torna la settimana dopo mantiene
la sua storia di prezzo.

Il lock è `pg_try_advisory_lock`, legato alla connessione: se il processo muore, il
database lo rilascia. Un flag su tabella resta acceso dopo un OOM e blocca il
fornitore fino all'intervento a mano.

## Le code

Nessun cron di sistema: la pianificazione vive in Redis e si ricostruisce da
`suppliers.sync_cron` a ogni avvio (`reconcileSchedules`). «Sincronizza ora» accoda
con `jobId` deduplicato — tre clic sul pulsante non fanno tre corse.

Ritentativi con attesa esponenziale su 429 e 5xx, **mai su 4xx**: ritentare una
credenziale sbagliata non la fa diventare giusta. Concorrenza 4 in globale, limite
di frequenza per singolo fornitore dentro `makeHttp`. Gli eventi della coda vanno
al browser su SSE: nessun polling ogni due secondi su una tabella che cambia una
volta all'ora.

## Sicurezza operativa

- Le credenziali stanno in `supplier_credentials`, cifrate con `pgp_sym_encrypt`.
  La chiave vive nell'ambiente del worker: **il dump del database, da solo, non
  basta a chiamare le API dei fornitori.** Il pannello legge `suppliers_public`,
  che espone solo le ultime quattro cifre e la data di rotazione.
- Due ruoli: `app_web` non ha `update` sui costi, `sync_agent` sì. L'applicazione
  web non ha nessun motivo di poter scrivere un costo d'acquisto.
- Gli URL nei log passano da `redact()`: nessuna chiave in query string finisce in
  `sync_events`.
- `sync_events` cresce di decine di migliaia di righe al giorno: `prune_sync_events(30)`
  va in un job giornaliero. Il diario serve a capire cosa è successo di recente, non
  per l'eternità.

## Dipendenze

```
pg | postgres.js     accesso al database
bullmq + ioredis     code e pianificazione
fast-xml-parser      solo per i feed XML
undici               fetch con agent e keep-alive
```

Il parser XML è l'unico punto di innesto lasciato aperto in `declarative.ts`,
perché è l'unica riga che cambia davvero fra un feed e l'altro.
