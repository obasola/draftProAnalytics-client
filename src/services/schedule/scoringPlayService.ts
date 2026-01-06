// src/services/schedule/scoringPlayService.ts

import { api } from '../api'
import type { UpcomingGameDto } from '@/util/schedule/upcomingGamesHelpers'

/**
 * Fetch scoring plays for a given gameId.
 * We follow ESPN's format:
 *   GET https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={id}
 */
export async function fetchScoringPlays(gameId: number) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`

    const { data } = await api.get(url, {
      baseURL: '', // Override axios baseURL
      withCredentials: false // ✅ ADD THIS - ESPN doesn't allow credentials with CORS
    })

    return data?.scoringPlays ?? []
  } catch (err) {
    console.error('[scoringPlayService] Error fetching scoring plays:', err)
    return []
  }
}

export async function getLatestScoringPlayText(game: UpcomingGameDto): Promise<string | null> {
  const scoringPlays = await fetchScoringPlays(game.id)
  if (!scoringPlays || scoringPlays.length === 0) return null

  const last = scoringPlays[scoringPlays.length - 1]
  return last?.text ?? null
}