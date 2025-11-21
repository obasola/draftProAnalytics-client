// src/util/schedule/upcomingGamesHelper.ts
import { api } from '@/services/api'
import type { UpcomingGameDto, GameStatus, PrimetimeType } from '@/types/schedule/upcomingGames'
import { TEAM_COLOR_MAP } from '../TEAM_COLOR_MAP'
import { resolveTeamLogo } from '../resolveTeamLogo'

// -----------------------------------------------------
// SAFE HELPERS
// -----------------------------------------------------
function safe<T>(value: T | undefined | null, fallback: T): T {
  return value == null ? fallback : value
}

function safeNum(value: any, fallback: number | null = null): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

// -----------------------------------------------------
// DATE FORMATTER
// -----------------------------------------------------
export function formatGameDate(raw: string) {
  if (!raw) return { day: '--', time: '--' }

  const d = new Date(raw)

  if (String(d) === 'Invalid Date') {
    return { day: '--', time: '--' }
  }

  const day = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })

  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })

  return { day, time }
}

// -----------------------------------------------------
// STATUS NORMALIZATION
// -----------------------------------------------------
export function normalizeStatus(raw: string): GameStatus {
  const lower = raw?.toLowerCase() || ''

  if (lower.includes('final')) return 'Final'
  if (lower.includes('progress')) return 'In Progress'
  if (lower.includes('postpon')) return 'Postponed'

  return 'Scheduled'
}

// -----------------------------------------------------
// SCORING PLAYS
// -----------------------------------------------------
export async function fetchScoringPlays(gameId: number) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`
    const { data } = await api.get(url, { baseURL: '' })
    return data?.scoringPlays ?? []
  } catch (_err) {
    return []
  }
}

// -----------------------------------------------------
// PRIMETIME DETECTION
// -----------------------------------------------------
export function getPrimetimeType(
  game: { date?: string }
): PrimetimeType {
  if (!game?.date) return null

  const d = new Date(game.date)
  if (String(d) === 'Invalid Date') return null

  const day = d.getDay() 
  const hour = d.getHours()

  if (day === 4 && hour >= 19) return 'TNF'
  if (day === 0 && hour >= 19) return 'SNF'
  if (day === 1 && hour >= 19) return 'MNF'

  return null
}

// -----------------------------------------------------
// WINNER HELPERS
// -----------------------------------------------------
export function getWinner(
  homeScore: number | null,
  awayScore: number | null
): 'home' | 'away' | null {
  if (homeScore == null || awayScore == null) return null
  if (homeScore > awayScore) return 'home'
  if (homeScore < awayScore) return 'away'
  return null
}

// CSS class
export function teamNameClass(isWinner: boolean): string {
  return isWinner ? 'winner-text' : ''
}

// -----------------------------------------------------
// ULTRA-SAFE RAW ESPN MERGE → UpcomingGameDto
// -----------------------------------------------------
export function buildUpcomingGameDto(event: any): UpcomingGameDto {
  const formatted = formatGameDate(event.gameDate)

  const status = normalizeStatus(event.gameStatus || '')
  const primetimeType = getPrimetimeType({ date: event.gameDate })

  const homeScore = safeNum(event.homeScore)
  const awayScore = safeNum(event.awayScore)

  const winner = getWinner(homeScore, awayScore)

  const homeName = event.homeTeamName || event.homeTeam?.name || 'TBD'
  const awayName = event.awayTeamName || event.awayTeam?.name || 'TBD'

  return {
    id: event.id,

    date: event.gameDate,
    dateFormatted: formatted,

    homeTeamId: event.homeTeamId,
    homeTeamName: homeName,
    homeLogo: resolveTeamLogo(homeName),
    homeScore,
    teamColorHome: resolveTeamColor(homeName),

    awayTeamId: event.awayTeamId,
    awayTeamName: awayName,
    awayLogo: resolveTeamLogo(awayName),
    awayScore,
    teamColorAway: resolveTeamColor(awayName),

    // 🟩 Winner flags needed by DataTable UI
    homeWinner: winner === 'home',
    awayWinner: winner === 'away',

    status,
    statusDetail: event.statusDetail || status,

    isPrimetime: primetimeType !== null,
    primetimeType
  }
}


function resolveTeamColor(name: string | undefined): string {
  if (!name) return '#666'
  return TEAM_COLOR_MAP[name] || '#666'
}
