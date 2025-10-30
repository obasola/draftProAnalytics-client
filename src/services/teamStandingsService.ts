// src/services/standingsService.ts
import { apiService } from './api'
import type { ApiResponse } from '@/types'

// Define the shape of standings rows
export interface TeamStanding {
  teamId: number
  teamName: string
  conference: string
  division: string
  wins: number
  losses: number
  ties: number
  winPct: number
  pointsFor: number
  pointsAgainst: number
  pointDiff: number;
  streak: number;
  divisionWins: number;
  divisionLosses: number;
  conferenceWins: number;
  conferenceLosses: number;
}

export default class StandingsService {
  private readonly endpoint = '/teamStandings'

  /**
   * Fetch all standings for given year and season type (default: regular season)
   */
  async getAll(
    year: number,
    seasonType = 0
  ): Promise<{ data: TeamStanding[]; pagination: any }> {
    console.log(`🔍 StandingsService: Fetching standings for year=${year}, seasonType=${seasonType}`)
    const url = `${this.endpoint}?year=${year}&seasonType=${seasonType}`

    try {
      const response = await apiService.get<ApiResponse<TeamStanding[]>>(url)

      // Handle wrapped or direct responses
      let standings: TeamStanding[]
      let pagination: any = null

      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        standings = response.data.data
        pagination = response.data.pagination ?? null
      } else if (Array.isArray(response.data)) {
        standings = response.data as TeamStanding[]
      } else {
        console.error('❌ Unexpected standings response structure:', response.data)
        throw new Error('Invalid response structure from standings API')
      }

      console.log(`✅ StandingsService: Retrieved ${standings.length} standings`)
      return { data: standings, pagination }
    } catch (error: any) {
      console.error('❌ StandingsService: Failed to fetch standings', error)
      throw error
    }
  }
}

export const standingsService = new StandingsService()
