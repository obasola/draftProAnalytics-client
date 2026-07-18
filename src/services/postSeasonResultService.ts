import { apiService } from './api'
import type { ApiResponse } from '@/types'

export interface PostSeasonTeamSummary {
  id: number
  name: string
  city?: string
  state?: string
  conference?: string
  division?: string
  fullName?: string
}

export interface PostSeasonResultRow {
  id: number
  playoffYear?: number
  lastRoundReached?: string
  winLose?: string
  opponentScore?: number
  teamScore?: number
  teamId?: number
  scoreDifferential?: number
  isWin: boolean
  gameResult?: string
  playoffRound?: string
  createdAt?: string
  updatedAt?: string
  team?: PostSeasonTeamSummary
}

export interface PostSeasonResultFilters {
  page?: number
  limit?: number
  playoffYear?: number
  teamId?: number
  winLose?: 'W' | 'L'
}

export interface PostSeasonResultPage {
  data: PostSeasonResultRow[]
  pagination?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

class PostSeasonResultService {
  private readonly endpoint = '/post-season-results'

  async getAll(filters: PostSeasonResultFilters = {}): Promise<PostSeasonResultPage> {
    const params = new URLSearchParams()
    params.set('page', String(filters.page ?? 1))
    params.set('limit', String(filters.limit ?? 25))

    if (filters.playoffYear !== undefined) {
      params.set('playoffYear', String(filters.playoffYear))
    }
    if (filters.teamId !== undefined) {
      params.set('teamId', String(filters.teamId))
    }
    if (filters.winLose !== undefined) {
      params.set('winLose', filters.winLose)
    }

    const response = await apiService.get<
      ApiResponse<PostSeasonResultRow[]> & { pagination?: PostSeasonResultPage['pagination'] }
    >(`${this.endpoint}?${params.toString()}`)

    return {
      data: response.data.data ?? [],
      pagination: response.data.pagination,
    }
  }

  async getTeamHistory(teamId: number, playoffYear?: number): Promise<readonly PostSeasonResultRow[]> {
    const params = playoffYear === undefined ? '' : `?year=${playoffYear}`
    const response = await apiService.get<ApiResponse<PostSeasonResultRow[]>>(
      `${this.endpoint}/team/${teamId}/history${params}`
    )
    return response.data.data ?? []
  }
}

export const postSeasonResultService = new PostSeasonResultService()
