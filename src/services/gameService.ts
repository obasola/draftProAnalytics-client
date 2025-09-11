// src/services/gameService.ts
import { apiService } from './api'
import type { Game, ApiResponse, PaginatedResponse } from '@/types'

export class GameService {
  private readonly endpoint = '/games'
  private paginationSupported: boolean | null = null // Cache pagination support detection

  // CRITICAL: Enhanced pagination with fallback for unsupported endpoints
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Game>> {
    const pageNum = Number(page)
    const limitNum = Number(limit)

    // First, try paginated request
    if (this.paginationSupported !== false) {
      try {
        return await this.getPaginated(pageNum, limitNum)
      } catch (error: any) {
        // Check if this is a 400 error indicating unsupported pagination
        if (error.response?.status === 400) {
          console.warn('⚠️ Games API does not support pagination, falling back to full fetch')
          this.paginationSupported = false
          return await this.getFallback(pageNum, limitNum)
        }
        throw error
      }
    } else {
      // We know pagination isn't supported, use fallback
      return await this.getFallback(pageNum, limitNum)
    }
  }

  private async getPaginated(page: number, limit: number): Promise<PaginatedResponse<Game>> {
    // Use manual URL building like other working endpoints
    const url = `${this.endpoint}?page=${page}&limit=${limit}&include=homeTeam,awayTeam`
    console.log(`🔍 Game Service: Making paginated request to ${url}`)

    try {
      const response = await apiService.get<ApiResponse<Game[], any>>(url)

      // Mark pagination as supported
      this.paginationSupported = true

      // Check if backend respected our parameters
      const backendPage = response.data.pagination?.page
      const backendLimit = response.data.pagination?.limit
      console.log(`🔍 Parameter check: requested page=${page}, got page=${backendPage}`)
      console.log(`🔍 Parameter check: requested limit=${limit}, got limit=${backendLimit}`)

      if (backendPage !== page) {
        console.warn(`⚠️ Backend page mismatch! Requested: ${page}, Got: ${backendPage}`)
      }
      if (backendLimit !== limit) {
        console.warn(`⚠️ Backend limit mismatch! Requested: ${limit}, Got: ${backendLimit}`)
      }

      // Handle response structure
      let gameData: Game[]
      let paginationData: any

      if (response.data.data && Array.isArray(response.data.data)) {
        gameData = response.data.data
        paginationData = response.data.pagination
      } else if (Array.isArray(response.data)) {
        gameData = response.data as Game[]
        paginationData = null
      } else {
        console.error('❌ Unexpected paginated response structure:', response.data)
        throw new Error('Invalid response structure from games pagination API')
      }

      // Check if team relationships are populated
      if (gameData.length > 0) {
        const firstGame = gameData[0]
        console.log('🔍 Game Service: Team relationship check:', {
          homeTeam: firstGame.homeTeam ? 'populated' : 'missing',
          awayTeam: firstGame.awayTeam ? 'populated' : 'missing',
          homeTeamId: firstGame.homeTeamId,
          awayTeamId: firstGame.awayTeamId,
        })
      }

      const result = {
        data: gameData,
        pagination: paginationData,
      }

      console.log(`✅ Game Service: Paginated result processed:`, result)
      return result
    } catch (error: any) {
      console.error('❌ Game paginated API call failed:', error)
      if (error.response) {
        console.error('❌ Response status:', error.response.status)
        console.error('❌ Response data:', error.response.data)

        // Provide specific guidance for the coerce issue
        if (
          error.response.status === 400 &&
          error.response.data?.message?.includes('Expected number, received string')
        ) {
          console.error(
            '🔧 BACKEND FIX NEEDED: Games endpoint validation schema needs z.coerce.number().optional() for page and limit parameters'
          )
        }
      }
      throw error
    }
  }

  private async getFallback(page: number, limit: number): Promise<PaginatedResponse<Game>> {
    console.log(`🔍 Game Service: Using fallback non-paginated request`)

    // Try different approaches to get team relationships
    const endpoints = [
      `${this.endpoint}?include=homeTeam,awayTeam`, // Common approach
      `${this.endpoint}?populate=homeTeam,awayTeam`, // Mongoose/Sequelize approach
      `${this.endpoint}?with=homeTeam,awayTeam`, // Laravel approach
      `${this.endpoint}?expand=homeTeam,awayTeam`, // Some REST APIs
      this.endpoint, // Plain endpoint as final fallback
    ]

    for (const [index, endpoint] of endpoints.entries()) {
      try {
        console.log(`🔍 Game Service: Trying fallback approach ${index + 1}: ${endpoint}`)
        const response = await apiService.get<ApiResponse<Game[]> | Game[]>(endpoint)

        console.log('🔍 Game Service: Fallback response received:', response.data)

        // Handle response structure
        let allGames: Game[]

        if (
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data &&
          Array.isArray(response.data.data)
        ) {
          // Wrapped ApiResponse format
          allGames = response.data.data
        } else if (Array.isArray(response.data)) {
          // Direct array format
          allGames = response.data as Game[]
        } else {
          console.error('❌ Unexpected fallback response structure:', response.data)
          throw new Error('Invalid response structure from games API')
        }

        // Check if this approach gave us team relationships
        if (allGames.length > 0) {
          const firstGame = allGames[0]
          const hasTeamData = firstGame.homeTeam && firstGame.awayTeam
          console.log(`🔍 Game Service: Fallback approach ${index + 1} team relationship check:`, {
            hasTeamData,
            homeTeam: firstGame.homeTeam ? 'populated' : 'missing',
            awayTeam: firstGame.awayTeam ? 'populated' : 'missing',
          })

          if (hasTeamData) {
            console.log(`✅ Game Service: Found working fallback approach with team relationships`)
          }
        }

        // Implement client-side pagination
        const total = allGames.length
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedData = allGames.slice(startIndex, endIndex)

        const result = {
          data: paginatedData,
          pagination: {
            page: page,
            limit: limit,
            total: total,
            pages: Math.ceil(total / limit),
          },
        }

        console.log(`✅ Game Service: Fallback result processed:`, {
          approach: index + 1,
          endpoint: endpoint,
          total: total,
          page: page,
          limit: limit,
          returned: paginatedData.length,
          hasTeamRelationships:
            paginatedData.length > 0 && paginatedData[0].homeTeam ? true : false,
        })

        return result
      } catch (error: any) {
        console.warn(`⚠️ Game Service: Fallback approach ${index + 1} failed:`, error.message)
        if (index === endpoints.length - 1) {
          // This was the last attempt, throw the error
          console.error('❌ Game fallback: All approaches failed')
          if (error.response) {
            console.error('❌ Response status:', error.response.status)
            console.error('❌ Response data:', error.response.data)
          }
          throw error
        }
        // Continue to next approach
      }
    }

    // This shouldn't be reached due to the logic above, but TypeScript requires it
    throw new Error('All fallback approaches failed')
  }

  // non-paginated queries: fix for double nesting from server
  async getById(id: number): Promise<Game> {
    console.log(`🔍 Game Service: Fetching game by ID: ${id}`)

    // Try different approaches to get team relationships using axios params
    const approaches = [
      { include: 'homeTeam,awayTeam' },
      { populate: 'homeTeam,awayTeam' },
      { with: 'homeTeam,awayTeam' },
      { expand: 'homeTeam,awayTeam' },
      {}, // Plain request as fallback
    ]

    for (const [index, params] of approaches.entries()) {
      try {
        console.log(`🔍 Game Service: Trying getById approach ${index + 1} with params:`, params)
        const response = await apiService.get<ApiResponse<Game> | Game>(`${this.endpoint}/${id}`, {
          params: params,
        })
        console.log('🔍 Game Service: getById response:', response.data)

        // Handle both wrapped and direct responses
        let game: Game

        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          // Wrapped ApiResponse format
          const wrappedResponse = response.data as ApiResponse<Game>
          game = wrappedResponse.data
        } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
          // Direct game object format
          game = response.data as Game
        } else {
          console.error('❌ Unexpected getById response structure:', response.data)
          throw new Error('Invalid response structure from game API')
        }

        // Check if this approach gave us team relationships
        const hasTeamData = game.homeTeam && game.awayTeam
        console.log(`🔍 Game Service: getById approach ${index + 1} team relationship check:`, {
          hasTeamData,
          homeTeam: game.homeTeam ? 'populated' : 'missing',
          awayTeam: game.awayTeam ? 'populated' : 'missing',
        })

        if (hasTeamData) {
          console.log(`✅ Game Service: getById found working approach with team relationships`)
        }

        return game
      } catch (error: any) {
        console.warn(`⚠️ Game Service: getById approach ${index + 1} failed:`, error.message)
        if (index === approaches.length - 1) {
          // This was the last attempt, throw the error
          console.error(`❌ Failed to fetch game ${id} with all approaches`)
          throw error
        }
        // Continue to next approach
      }
    }

    // This shouldn't be reached due to the logic above, but TypeScript requires it
    throw new Error(`All getById approaches failed for game ${id}`)
  }

  async getBySeasonYear(seasonYear: string): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by season: ${seasonYear}`)
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            seasonYear: seasonYear,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(`❌ Failed to fetch games by season ${seasonYear}:`, error)
      throw error
    }
  }

  async getByTeam(teamId: number): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by team: ${teamId}`)
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            teamId: teamId,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(`❌ Failed to fetch games by team ${teamId}:`, error)
      throw error
    }
  }

  async getByTeamAndSeasonYear(teamId: number, seasonYear: string): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by season: ${seasonYear}`)
    const res = await apiService.get<ApiResponse<Game[]> | Game[]>(
      `/games/team/${teamId}/season/${seasonYear}`
    );
    return this.unwrapArray<Game>(res.data);
  }

  // Helper: unwrap envelope-or-array into a plain array
async unwrapArray<T>(payload: ApiResponse<T[]> | T[]): T[] {
  return Array.isArray(payload) ? payload : (payload?.data ?? []);
}
  async getPreseasonGames(
    teamId?: number,
    seasonYear?: number
  ): Promise<Game[]> {
    console.log(
      `🔍 Game Service: Fetching games by season: ${seasonYear}` + ` and team:${teamId}`
    )
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            teamId: teamId,
            seasonYear: seasonYear,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(
        `❌ Failed to fetch games by season ${seasonYear} and teamId ${teamId}:`,
        error
      )
      throw error
    }
  }

  async getRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by season: ${seasonYear}`)
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            teamId: teamId,
            seasonYear: seasonYear,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(`❌ Failed to fetch games by season ${seasonYear}:`, error)
      throw error
    }
  }

  async getByTeamSeasonWeek(
    teamId?: number,
    seasonYear?: string,
    gameWeek?: number
  ): Promise<Game[]> {
    console.log(`🔍 Game Service: Fetching games by season: ${seasonYear}`)
    try {
      const response = await apiService.get<ApiResponse<Game[]> | Game[]>(
        `${this.endpoint}/filter`,
        {
          params: {
            teamId: teamId,
            seasonYear: seasonYear,
            gameWeek: gameWeek,
            include: 'homeTeam,awayTeam', // Try to include team relationships
          },
        }
      )

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game[]>
        return wrappedResponse.data
      } else if (Array.isArray(response.data)) {
        return response.data as Game[]
      } else {
        return []
      }
    } catch (error: any) {
      console.error(`❌ Failed to fetch games by season ${seasonYear}:`, error)
      throw error
    }
  }

//async getUpcomingGames(teamId?: number, limit?: number): Promise<Game[]> {}
//async getCompletedGames(teamId?: number, limit?: number): Promise<Game[]> {}

  async create(
    data: Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>
  ): Promise<Game> {
    console.log('🔍 Game Service: Creating game:', data)
    console.log('🛠️ Payload being sent:', JSON.stringify(data, null, 2))
    try {
      const response = await apiService.post<ApiResponse<Game> | Game>(this.endpoint, data)
      console.log('🔍 Game Service: Create response:', response.data)

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game>
        return wrappedResponse.data
      } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        return response.data as Game
      } else {
        throw new Error('Invalid response structure from create game API')
      }
    } catch (error: any) {
      if (error.response) {
        console.error('❌ Server responded with error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      } else if (error.request) {
        console.error('❌ No response received from server:', error.request)
      } else {
        console.error('❌ Request setup error:', error.message)
      }
      throw error
    }
  }

  async update(
    id: number,
    data: Partial<Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>>
  ): Promise<Game> {
    console.log(`🔍 Game Service: Updating game ${id}:`, data)
    try {
      const response = await apiService.put<ApiResponse<Game> | Game>(
        `${this.endpoint}/${id}`,
        data
      )
      console.log('🔍 Game Service: Update response:', response.data)

      // Handle both wrapped and direct responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as ApiResponse<Game>
        return wrappedResponse.data
      } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        return response.data as Game
      } else {
        throw new Error('Invalid response structure from update game API')
      }
    } catch (error: any) {
      console.error(`❌ Failed to update game ${id}:`, error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    console.log(`🔍 Game Service: Deleting game ${id}`)
    try {
      await apiService.delete(`${this.endpoint}/${id}`)
      console.log(`✅ Game ${id} deleted successfully`)
    } catch (error: any) {
      console.error(`❌ Failed to delete game ${id}:`, error)
      throw error
    }
  }

  // Helper method to manually populate team relationships if backend doesn't support includes
  async populateTeamRelationships(games: Game[]): Promise<Game[]> {
    console.log('🔍 Game Service: Manually populating team relationships...')

    try {
      // Extract unique team IDs
      const teamIds = new Set<number>()
      games.forEach(game => {
        teamIds.add(game.homeTeamId)
        teamIds.add(game.awayTeamId)
      })

      console.log(
        `🔍 Game Service: Need to fetch ${teamIds.size} unique teams:`,
        Array.from(teamIds)
      )

      // Fetch teams (assuming teams endpoint exists)
      const teamsMap = new Map<number, any>()

      for (const teamId of teamIds) {
        try {
          const response = await apiService.get(`/teams/${teamId}`)
          let teamData: any = null

          if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            teamData = response.data.data
          } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
            teamData = response.data
          } else {
            console.warn(`⚠️ Could not fetch team ${teamId}`)
            continue
          }

          teamsMap.set(teamId, teamData)
          console.log(`✅ Fetched team ${teamId}: ${teamData.name || teamData.city || 'Unknown'}`)
        } catch (error: any) {
          console.warn(`⚠️ Failed to fetch team ${teamId}:`, error.message)
          // Create a minimal team object as fallback
          teamsMap.set(teamId, {
            id: teamId,
            name: `Team ${teamId}`,
            city: null,
            state: null,
            conference: null,
            division: null,
            stadium: null,
          })
        }
      }

      // Populate team relationships in games
      const populatedGames = games.map(game => ({
        ...game,
        homeTeam: teamsMap.get(game.homeTeamId) || {
          id: game.homeTeamId,
          name: `Team ${game.homeTeamId}`,
          city: null,
          state: null,
          conference: null,
          division: null,
          stadium: null,
        },
        awayTeam: teamsMap.get(game.awayTeamId) || {
          id: game.awayTeamId,
          name: `Team ${game.awayTeamId}`,
          city: null,
          state: null,
          conference: null,
          division: null,
          stadium: null,
        },
      }))

      console.log(
        `✅ Game Service: Successfully populated team relationships for ${populatedGames.length} games`
      )
      return populatedGames
    } catch (error: any) {
      console.error('❌ Failed to populate team relationships:', error)
      // Return original games with fallback team objects
      return games.map(game => ({
        ...game,
        homeTeam: game.homeTeam || {
          id: game.homeTeamId,
          name: `Team ${game.homeTeamId}`,
          city: null,
          state: null,
          conference: null,
          division: null,
          stadium: null,
        },
        awayTeam: game.awayTeam || {
          id: game.awayTeamId,
          name: `Team ${game.awayTeamId}`,
          city: null,
          state: null,
          conference: null,
          division: null,
          stadium: null,
        },
      }))
    }
  }
}

export const gameService = new GameService()
