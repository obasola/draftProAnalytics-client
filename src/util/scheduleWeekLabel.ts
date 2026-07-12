export type ScheduleWeekValue = number | string | null | undefined

const PRESEASON_ENCODED_WEEK_MIN = 101
const PRESEASON_ENCODED_WEEK_MAX = 103
const PRESEASON_WEEK_OFFSET = 100

function toNumber(value: ScheduleWeekValue): number | null {
  if (value === null || value === undefined || value === '') return null

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function isPreseasonSeasonType(seasonType: ScheduleWeekValue): boolean {
  return toNumber(seasonType) === 1
}

function getPreseasonWeekFromEncodedWeek(gameWeek: number): number | null {
  if (gameWeek >= PRESEASON_ENCODED_WEEK_MIN && gameWeek <= PRESEASON_ENCODED_WEEK_MAX) {
    return gameWeek - PRESEASON_WEEK_OFFSET
  }

  if (gameWeek < 0 && Math.abs(gameWeek) <= 3) {
    return Math.abs(gameWeek)
  }

  return null
}

/**
 * Formats an NFL schedule week for display.
 *
 * Supported inputs:
 * - seasonType = 1 with gameWeek 1..3 => "Pre 1".."Pre 3"
 * - encoded preseason gameWeek 101..103 => "Pre 1".."Pre 3"
 * - encoded preseason gameWeek -1..-3 => "Pre 1".."Pre 3"
 * - regular season gameWeek 1..18 => "1".."18"
 *
 * The optional seasonType exists because gameWeek 1 is ambiguous without context:
 * preseason week 1 and regular-season week 1 can both be stored as gameWeek = 1.
 */
export function formatScheduleWeekLabel(
  gameWeek: ScheduleWeekValue,
  seasonType?: ScheduleWeekValue,
): string {
  
  const week = toNumber(gameWeek)
  if (week === null) return 'TBD'

  const encodedPreseasonWeek = getPreseasonWeekFromEncodedWeek(week)
  if (encodedPreseasonWeek !== null) return `Pre ${encodedPreseasonWeek}`

  if (isPreseasonSeasonType(seasonType)) return `Pre ${week}`

  return String(week)
}

/**
 * Provides a stable sort value where preseason sorts before the regular season.
 */
export function getScheduleWeekSortValue(
  gameWeek: ScheduleWeekValue,
  seasonType?: ScheduleWeekValue,
): number {
  const week = toNumber(gameWeek)
  if (week === null) return Number.MAX_SAFE_INTEGER

  const encodedPreseasonWeek = getPreseasonWeekFromEncodedWeek(week)
  if (encodedPreseasonWeek !== null) return encodedPreseasonWeek - PRESEASON_WEEK_OFFSET

  if (isPreseasonSeasonType(seasonType)) return week - PRESEASON_WEEK_OFFSET

  return week
}
