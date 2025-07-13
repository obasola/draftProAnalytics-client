
// src/services/teamStats/TeamStatsCalculator.ts
import type { TeamStats, GameRecord, StatsCalculationContext } from '@/services/stats/types'
import type { Game } from '@/types'

import { GameAnalyzer } from './GameAnalyzer'

export class TeamStatsCalculator {
  private gameAnalyzer: GameAnalyzer

  constructor(gameAnalyzer: GameAnalyzer = new GameAnalyzer()) {
    this.gameAnalyzer = gameAnalyzer
  }

  /**
   * Calculates comprehensive team statistics from a list of games
   */
  calculateStats(games: Game[], context: StatsCalculationContext): TeamStats {
    const stats: TeamStats = {
      overall: { won: 0, lost: 0 },
      conference: { won: 0, lost: 0 },
      division: { won: 0, lost: 0 }
    }

    games.forEach(game => {
      const result = this.gameAnalyzer.analyzeGame(game, context.teamId)
      if (!result) return

      this.updateOverallStats(stats.overall, result.isWin)
      
      if (this.gameAnalyzer.isConferenceGame(context.team, result.opponent)) {
        this.updateOverallStats(stats.conference, result.isWin)
      }

      if (this.gameAnalyzer.isDivisionGame(context.team, result.opponent)) {
        this.updateOverallStats(stats.division, result.isWin)
      }
    })

    return stats
  }

  /**
   * Updates a game record with a win or loss
   */
  private updateOverallStats(record: GameRecord, isWin: boolean): void {
    if (isWin) {
      record.won++
    } else {
      record.lost++
    }
  }

  /**
   * Calculates win percentage for a record
   */
  calculateWinPercentage(record: GameRecord): number {
    const totalGames = record.won + record.lost
    return totalGames > 0 ? record.won / totalGames : 0
  }
}
