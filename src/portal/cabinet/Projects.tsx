import React from "react"
import { Btn, Empty, Glass, SectionTitle } from "../ui"

/** Shown only when the client has no projects yet — otherwise the cabinet
 *  opens the active project's dossier directly (see CabinetApp). */
export default function Projects({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle
        kicker="Progetti"
        title="I tuoi progetti"
        sub="Ogni progetto ha il suo dossier: fasi, diario, fatture e riunioni."
        right={<Btn variant="primary" icon="plus" onClick={onNewProject}>Nuovo progetto</Btn>}
      />
      <Glass variant="panel" style={{ padding: 24 }}>
        <Empty
          icon="folder"
          title="Nessun progetto ancora"
          hint="Racconta cosa vuoi costruire: ricevi una valutazione e un piano in fasi."
          action={<Btn variant="primary" icon="plus" onClick={onNewProject}>Avvia il primo progetto</Btn>}
        />
      </Glass>
    </div>
  )
}
