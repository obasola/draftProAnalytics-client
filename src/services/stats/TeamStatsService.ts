
// src/services/stats/TeamStatsService.ts
import type { TeamStats, StatsCalculationContext } from '@/services/stats/types'
import { TeamStatsCalculator } from './TeamStatsCalculator'
import { StatsDataLoader } from './StatsDataLoader'
import { GameAnalyzer } from './GameAnalyzer'

export class TeamStatsService {
  private calculator: TeamStatsCalculator
  private dataLoader: StatsDataLoader
  private statsCache = new Map<string, TeamStats>()

  constructor(
    calculator: TeamStatsCalculator = new TeamStatsCalculator(),
    dataLoader: StatsDataLoader = new StatsDataLoader()
  ) {
    this.calculator = calculator
    this.dataLoader = dataLoader
  }

  /**
   * Gets statistics for a team, with caching
   */
  async getTeamStats(context: StatsCalculationContext): Promise<TeamStats> {
    const cacheKey = this.createCacheKey(context.teamId, context.seasonYear)
    
    if (this.statsCache.has(cacheKey)) {
      return this.statsCache.get(cacheKey)!
    }

    const games = await this.dataLoader.loadTeamGames(context.teamId, context.seasonYear)
    const stats = this.calculator.calculateStats(games, context)
    
    this.statsCache.set(cacheKey, stats)
    return stats
  }

  /**
   * Gets statistics for multiple teams
   */
  async getMultipleTeamStats(contexts: StatsCalculationContext[]): Promise<TeamStats[]> {
    const promises = contexts.map(context => this.getTeamStats(context))
    return Promise.all(promises)
  }

  /**
   * Clears the statistics cache
   */
  clearCache(): void {
    this.statsCache.clear()
  }

  /**
   * Creates a cache key for team statistics
   */
  private createCacheKey(teamId: number, seasonYear: string): string {
    return `${teamId}_${seasonYear}`
  }
}
