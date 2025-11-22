// src/util/schedule/upcomingGamesHelper.ts
import { api } from '@/services/api'
import type { GameStatus, PrimetimeType } from '@/types/schedule/upcomingGames'
import type { UpcomingGameDto } from '@/util/schedule/upcomingGamesHelpers'
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
  // ESPN structure root
  const comp = event.competitions?.[0];
  const competitors = comp?.competitors ?? [];

  // Extract home & away competitors
  const homeRaw = competitors.find((c: any) => c.homeAway === 'home');
  const awayRaw = competitors.find((c: any) => c.homeAway === 'away');

  // Safe fallbacks
  const homeTeam = homeRaw?.team ?? {};
  const awayTeam = awayRaw?.team ?? {};

  const homeName = homeTeam.displayName || homeTeam.shortDisplayName || homeTeam.name || 'TBD';
  const awayName = awayTeam.displayName || awayTeam.shortDisplayName || awayTeam.name || 'TBD';

  // Scores
  const homeScore = homeRaw?.score != null ? Number(homeRaw.score) : null;
  const awayScore = awayRaw?.score != null ? Number(awayRaw.score) : null;

  // Winner flag from ESPN
  const homeWinner = homeRaw?.winner === true;
  const awayWinner = awayRaw?.winner === true;

  // Status from ESPN competitions.status
  const statusText =
    comp?.status?.type?.shortDetail ||
    comp?.status?.type?.description ||
    event.status ||
    'Scheduled';

  const normalizedStatus = normalizeStatus(statusText);

  // Date formatting
  const date = event.date || comp?.date;
  const formatted = formatGameDate(date);

  // Primetime classification
  const primetimeType = getPrimetimeType({ date });

  return {
    id: event.id,

    date,
    dateFormatted: formatted,

    // IDs from ESPN
    homeTeamId: homeTeam.id ?? null,
    awayTeamId: awayTeam.id ?? null,

    // Names
    homeTeamName: homeName,
    awayTeamName: awayName,

    // Logos mapped by your resolver
    homeLogo: resolveTeamLogo(homeName),
    awayLogo: resolveTeamLogo(awayName),

    // Scores
    homeScore,
    awayScore,

    // Winner flags
    homeWinner,
    awayWinner,

    // Team colors
    teamColorHome: resolveTeamColor(homeName),
    teamColorAway: resolveTeamColor(awayName),

    // Status
    status: normalizedStatus,
    statusDetail: statusText,

    // Primetime
    isPrimetime: primetimeType !== null,
    primetimeType,
  };
}


function resolveTeamColor(name: string | undefined): string {
  if (!name) return '#666'
  return TEAM_COLOR_MAP[name] || '#666'
}
