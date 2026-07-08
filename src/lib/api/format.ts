export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function fmtEur(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)
}

export function fmtDate(iso: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })
}

export function fmtDateTime(iso: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

export function relativeDate(iso: string): string {
  const d = new Date(iso), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diff < 1) return "Adesso"
  if (diff < 60) return `${diff}m fa`
  if (diff < 1440) return `${Math.floor(diff / 60)}h fa`
  return `${Math.floor(diff / 1440)}g fa`
}
