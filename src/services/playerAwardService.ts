import { apiService } from './api'
import type { ApiResponse, PlayerAward } from '@/types'

export class PlayerAwardService {
  private readonly endpoint = '/player-awards'

  async getByPlayerId(playerId: number): Promise<PlayerAward[]> {
    const response = await apiService.get<ApiResponse<PlayerAward[]>>(`${this.endpoint}/player/${playerId}`)
    return response.data.data
  }

  async create(data: Omit<PlayerAward, 'id'>): Promise<PlayerAward> {
    const response = await apiService.post<ApiResponse<PlayerAward>>(this.endpoint, data)
    return response.data.data
  }

  async update(id: number, data: Partial<PlayerAward>): Promise<PlayerAward> {
    const response = await apiService.put<ApiResponse<PlayerAward>>(`${this.endpoint}/${id}`, data)
    return response.data.data
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.endpoint}/${id}`)
  }
}

export const playerAwardService = new PlayerAwardService()
