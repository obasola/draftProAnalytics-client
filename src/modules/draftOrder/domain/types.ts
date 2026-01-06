export type DraftOrderMode = "current" | "projection"

export type TimezoneMode = "local" | "UTC" | "America/Chicago"

export function formatWithTz(isoUtc: string, tz: TimezoneMode): string {
  const d = new Date(isoUtc)
  const timeZone = tz === "local" ? undefined : tz

  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d)
}
