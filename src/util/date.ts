// =============================
// File: src/util/date.ts
// =============================
export function fmt(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString()
}
