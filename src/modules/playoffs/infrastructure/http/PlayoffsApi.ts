import { api } from '@/services/api' // your existing axios wrapper
import type { PlayoffBracketDto } from '../../domain/models'

export interface GetPlayoffBracketParams {
  seasonYear: number
  seasonType: number
  week?: number
}

export const playoffsApi = {
  async getBracket(params: GetPlayoffBracketParams): Promise<PlayoffBracketDto> {
    const { data } = await api.get<PlayoffBracketDto>('/playoffs/bracket', {
      params: {
        seasonYear: params.seasonYear,
        seasonType: params.seasonType,
        week: params.week,
      },
    })
    return data
  },
}
