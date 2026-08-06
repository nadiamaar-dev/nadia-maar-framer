import React, { useState } from "react"
import type { AdminHome, ProjectStatus } from "../../lib/api"
import { isUnreadFor } from "../../lib/api"
import { CardGrid, ProjectCard } from "./cards"
import { Empty, Glass, SectionTitle, Tabs } from "../ui"

type Filter = "tutti" | ProjectStatus

/* Stesse schede della sezione Clienti: qui il progetto è l'oggetto e il
   cliente la didascalia, di là è il contrario. Un progetto deve avere lo
   stesso aspetto ovunque lo si incontri, altrimenti va riconosciuto due
   volte. */
export default function ProjectsBoard({ home, onOpenProject }: {
  home: AdminHome
  onOpenProject: (id: string) => void
}) {
  const [filter, setFilter] = useState<Filter>("tutti")
  const counts = (s: ProjectStatus) => home.projects.filter(p => p.status === s).length
  const list = filter === "tutti" ? home.projects : home.projects.filter(p => p.status === filter)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Produzione"
        title="Progetti"
        sub={`${home.projects.length} progett${home.projects.length === 1 ? "o" : "i"} in archivio`}
      />

      <Tabs<Filter>
        items={[
          { id: "tutti", label: "Tutti" },
          { id: "pending_approval", label: "In valutazione", badge: counts("pending_approval") || undefined },
          { id: "active", label: "In corso", badge: counts("active") || undefined },
          { id: "paused", label: "In pausa" },
          { id: "completed", label: "Completati" },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {list.length === 0 ? (
        <Glass variant="panel" style={{ padding: 12 }}>
          <Empty icon="folder" title="Nessun progetto" hint="In questo stato non c'è nulla al momento." />
        </Glass>
      ) : (
        <CardGrid>
          {list.map(p => (
            <ProjectCard
              key={p.id}
              p={p}
              unread={home.threads.filter(c => c.projectId === p.id && isUnreadFor(c, "admin")).length}
              onOpen={() => onOpenProject(p.id)}
            />
          ))}
        </CardGrid>
      )}
    </div>
  )
}
