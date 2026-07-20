import { apiService } from '@/services/api'
import type { PlayoffGameDetailsDto } from '@/modules/playoffs/domain/dtos/PlayoffGameDetailsDto'

interface PlayoffGameDetailsResponse {
  readonly success: boolean
  readonly data: PlayoffGameDetailsDto
}

export async function fetchPlayoffGameDetails(gameId: number): Promise<PlayoffGameDetailsDto> {
  const response = await apiService.get<PlayoffGameDetailsResponse>(
    `/schedules/games/${gameId}/details`
  )
  const payload = (response as { data?: PlayoffGameDetailsResponse }).data ?? response
  return payload.data
}
