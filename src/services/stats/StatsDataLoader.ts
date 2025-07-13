// src/services/stats/StatsDataLoader.ts
import type { Game } from '@/types'
import { useGameStore } from '@/stores/gameStore'

export interface StatsDataSource {
  getRegularSeasonGames(teamId: number, seasonYear: string): Promise<Game[]>
}

export class GameStoreDataSource implements StatsDataSource {
  private gameStore = useGameStore()

  async getRegularSeasonGames(teamId: number, seasonYear: string): Promise<Game[]> {
    const games = await this.gameStore.fetchRegularSeasonGames(teamId, seasonYear)
    return games || []
  }
}

export class StatsDataLoader {
  constructor(private dataSource: StatsDataSource = new GameStoreDataSource()) {}

  /**
   * Loads game data for statistics calculation
   */
  async loadTeamGames(teamId: number, seasonYear: string): Promise<Game[]> {
    try {
      return await this.dataSource.getRegularSeasonGames(teamId, seasonYear)
    } catch (error) {
      console.error(`Failed to load games for team ${teamId}, season ${seasonYear}:`, error)
      return []
    }
  }

  /**
   * Loads games for multiple teams in parallel
   */
  async loadMultipleTeamGames(requests: Array<{ teamId: number; seasonYear: string }>): Promise<Game[][]> {
    const promises = requests.map(req => this.loadTeamGames(req.teamId, req.seasonYear))
    return Promise.all(promises)
  }
}
