import { feedCsvAdapter, feedXmlAdapter, restJsonAdapter } from "./declarative"
import type { SupplierAdapter, SupplierRow, Transport } from "./types"

/* ══════════════════════════════════════════════════════════════════════════
   REGISTRO DEGLI ADATTATORI

   Due livelli, cercati in quest'ordine:

     1. `suppliers.adapter_key` → un modulo scritto a mano per quel fornitore
     2. `suppliers.transport`   → l'adattatore dichiarativo del trasporto

   Il livello 2 è quello che si usa quasi sempre. Il livello 1 esiste perché
   prima o poi arriva il fornitore con la paginazione a cursore firmato o con
   listino e giacenze su due chiamate: quel caso non deve costringere a
   piegare la mappatura dichiarativa fino a spezzarla.
══════════════════════════════════════════════════════════════════════════ */

const byTransport: Record<Transport, SupplierAdapter | undefined> = {
  rest_json: restJsonAdapter,
  feed_xml:  feedXmlAdapter,
  feed_csv:  feedCsvAdapter,
  sftp_csv:  undefined,   // stesso parser, sorgente diversa: vedi bespoke/sftp.ts
  soap_xml:  undefined,   // l'envelope SOAP non si esprime con una mappatura
}

const bespoke = new Map<string, SupplierAdapter>()

/** Un modulo dedicato si registra all'avvio. Aggiungere un fornitore esotico
    è una `register()` in più, non una modifica a `sync.ts`. */
export function register(adapter: SupplierAdapter): void {
  if (bespoke.has(adapter.key)) throw new Error(`Adattatore duplicato: ${adapter.key}`)
  bespoke.set(adapter.key, adapter)
}

export function resolveAdapter(supplier: SupplierRow): SupplierAdapter {
  if (supplier.adapterKey) {
    const a = bespoke.get(supplier.adapterKey)
    if (!a) throw new Error(`Adattatore «${supplier.adapterKey}» non registrato`)
    if (a.transport !== supplier.transport) {
      throw new Error(`«${supplier.adapterKey}» parla ${a.transport}, il fornitore è ${supplier.transport}`)
    }
    return a
  }
  const a = byTransport[supplier.transport]
  if (!a) throw new Error(`Il trasporto ${supplier.transport} richiede un adattatore dedicato`)
  return a
}

export function listAdapters(): { key: string; transport: Transport; bespoke: boolean }[] {
  return [
    ...Object.values(byTransport).filter(Boolean).map(a => ({ key: a!.key, transport: a!.transport, bespoke: false })),
    ...[...bespoke.values()].map(a => ({ key: a.key, transport: a.transport, bespoke: true })),
  ]
}

export * from "./types"
