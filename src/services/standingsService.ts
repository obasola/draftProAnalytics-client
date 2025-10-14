import { apiService } from '@/services/api'
import type { ApiResponse } from '@/types'
import type { TeamStandingDto } from '@/types/TeamStandingDto'

const endpoint = '/standings'

/**
 * Fetch team standings for a given year and season type.
 * @param year - Season year (e.g. 2025)
 * @param seasonType - Season type (2 = regular, 3 = postseason)
 */
export async function fetchStandings(
  year: number,
  seasonType: number
): Promise<TeamStandingDto[]> {
  const response = await apiService.get<ApiResponse<TeamStandingDto[]>>(
    `${endpoint}?year=${year}&seasonType=${seasonType}`
  )
  console.log("Returning data.data for: "+response.data.data.length+" rows...");
  return response.data.data
}
