import React, { useMemo, useState } from "react"
import type { AdminHome, ClientRecord } from "../../lib/api"
import { clientLens } from "./clientLens"
import { CardGrid, ClientCard } from "./cards"
import { Empty, Glass, Icon, Input, SectionTitle, T, Tabs } from "../ui"

/* ══════════════════════════════════════════════════════════════════════════
   ELENCO CLIENTI.

   Quattro cose che prima non c'erano e che sono il motivo per cui ci si
   perdeva fra un cliente e l'altro:

   · una scheda per cliente, non righe in un pannello unico. Separate solo
     dall'hover, le righe si leggevano come un blocco solo;
   · gli archiviati non stanno con i clienti vivi. Chiuso un rapporto la
     scheda resta — fatture e documenti vanno conservati — ma esce dal
     lavoro di oggi;
   · l'ordine non è alfabetico ma «chi aspetta una mia mossa». Per cercare
     un nome c'è il campo di ricerca, che è più veloce di scorrere;
   · su ogni scheda si vede *cosa* aspetta, non solo che qualcosa aspetta.
══════════════════════════════════════════════════════════════════════════ */

type Filter = "operativi" | "archiviati" | "tutti"

export default function Clients({ clients, home, onOpen }: {
  clients: ClientRecord[]
  home: AdminHome
  onOpen: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("operativi")

  const archivedCount = clients.filter(c => c.status === "archived").length

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clients
      .filter(c => filter === "tutti" ? true : filter === "archiviati" ? c.status === "archived" : c.status !== "archived")
      .filter(c => !q ||
        c.company.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q))
      .map(c => ({ c, lens: clientLens(home, c.id) }))
      .sort((a, b) => b.lens.todo - a.lens.todo || a.c.company.localeCompare(b.c.company, "it"))
  }, [clients, home, query, filter])

  const waiting = rows.filter(r => r.lens.todo > 0).length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="CRM"
        title="Clienti"
        sub={waiting > 0
          ? `${waiting} client${waiting === 1 ? "e aspetta" : "i aspettano"} una tua mossa`
          : `${rows.length} client${rows.length === 1 ? "e" : "i"} · niente in sospeso`}
        right={
          <div style={{ position: "relative", width: 240, maxWidth: "100%" }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.tertiary, display: "flex" }}>
              <Icon name="search" size={13} />
            </span>
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nome, email, telefono…" style={{ paddingLeft: 32 }} />
          </div>
        }
      />

      <Tabs<Filter>
        value={filter}
        onChange={setFilter}
        items={[
          { id: "operativi", label: "In corso", badge: filter === "operativi" && waiting ? waiting : undefined },
          { id: "archiviati", label: "Archivio", badge: archivedCount || undefined },
          { id: "tutti", label: "Tutti" },
        ]}
      />

      {rows.length === 0 ? (
        <Glass variant="panel" style={{ padding: 12 }}>
          <Empty
            icon="users"
            title={query ? "Nessun risultato" : filter === "archiviati" ? "Archivio vuoto" : "Nessun cliente"}
            hint={query ? "Prova con un altro termine." : filter === "archiviati"
              ? "I rapporti che chiudi finiscono qui, con tutto il loro storico."
              : "I clienti registrati appariranno qui."}
          />
        </Glass>
      ) : (
        <CardGrid>
          {rows.map(({ c, lens }) => (
            <ClientCard key={c.id} c={c} lens={lens} onOpen={() => onOpen(c.id)} />
          ))}
        </CardGrid>
      )}
    </div>
  )
}
