import { apiService } from './api'
import type { ApiResponse, PlayerTeam } from '@/types'

export class PlayerTeamService {
  private readonly endpoint = '/player-teams'

  async getPlayerHistory(playerId: number): Promise<PlayerTeam[]> {
    const response = await apiService.get<ApiResponse<PlayerTeam[]>>(`${this.endpoint}/player/${playerId}/history`)
    return response.data.data
  }
}

export const playerTeamService = new PlayerTeamService()
