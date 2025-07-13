// src/services/teamStats/GameAnalyzer.ts
import type { GameResult, TeamInfo } from '@/services/stats/types'
import { Game } from '@/types'

export class GameAnalyzer {
  /**
   * Analyzes a game from a specific team's perspective
   */
  analyzeGame(game: Game, teamId: number): GameResult | null {
    if (!this.hasValidScore(game)) {
      return null
    }

    const isHomeGame = game.homeTeamId === teamId
    const teamScore = isHomeGame ? game.homeScore! : game.awayScore!
    const opponentScore = isHomeGame ? game.awayScore! : game.homeScore!
    const opponent = isHomeGame ? game.awayTeam : game.homeTeam

    return {
      isWin: teamScore > opponentScore,
      teamScore,
      opponentScore,
      opponent
    }
  }

  /**
   * Checks if a game has valid final scores
   */
  private hasValidScore(game: Game): boolean {
    return game.homeScore !== null && 
           game.homeScore !== undefined &&
           game.awayScore !== null && 
           game.awayScore !== undefined
  }

  /**
   * Determines if two teams are in the same conference
   */
  isConferenceGame(team: TeamInfo, opponent: TeamInfo): boolean {
    return !!(team.conference && 
              opponent.conference && 
              team.conference === opponent.conference)
  }

  /**
   * Determines if two teams are in the same division
   */
  isDivisionGame(team: TeamInfo, opponent: TeamInfo): boolean {
    return !!(team.division && 
              opponent.division && 
              team.division === opponent.division)
  }
}
