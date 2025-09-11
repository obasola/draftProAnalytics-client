import { gameService } from '@/services/gameService'
// src/stores/gameStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Game, CrudMode, PaginationMeta } from '@/types'

export const useGameStore = defineStore('game', () => {
  // State - in memory only, fetched from server
  const games = ref<Game[]>([])
  const currentGame = ref<Game | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const mode = ref<CrudMode>('read')

  // Pagination state
  const pagination = ref<PaginationMeta | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  // Getters
  const getGameById = computed(() => {
    return (id: number) => games.value.find(item => item.id === id)
  })

  // Actions - All data from REST API with pagination support
  const fetchAll = async (page = 1, limit = 10, refresh = false) => {
    // Only fetch if we don't have data or if explicitly refreshing
    if (games.value.length > 0 && !refresh && currentPage.value === page) {
      console.log(`🔍 Game Store: Using cached data for page ${page}`)
      return
    }

    console.log(`🔍 Game Store: Fetching games page ${page}, limit ${limit}, refresh: ${refresh}`)
    loading.value = true
    error.value = null

    try {
      const response = await gameService.getAll(page, limit)
      console.log(`🔍 Game Store: Received ${response.data.length} games`)

      if (page === 1 || refresh) {
        // Replace data for first page or refresh
        games.value = response.data
        console.log(`🔍 Game Store: Replaced games data with ${response.data.length} items`)
      } else {
        // Append data for subsequent pages (if implementing infinite scroll)
        games.value = [...games.value, ...response.data]
        console.log(`🔍 Game Store: Appended games data, total now: ${games.value.length}`)
      }

      pagination.value = response.pagination
      currentPage.value = page
      itemsPerPage.value = limit

      console.log(`🔍 Game Store: Updated pagination state:`, {
        currentPage: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        total: pagination.value?.total || 0,
        pages: pagination.value?.pages || 0,
      })

      // Check if we're using client-side pagination fallback
      if (response.pagination && response.pagination.total > 0) {
        const isClientSide = !response.pagination.page || response.pagination.total <= limit
        if (isClientSide && page === 1) {
          console.log('🔍 Game Store: Using client-side pagination fallback')
        }
      }
    } catch (err: any) {
      let errorMessage = 'Failed to fetch games from server'
      console.error('❌ Game Store:', errorMessage, err)

      // Enhanced error handling based on error type
      if (err.response?.status === 400) {
        errorMessage = 'Games API configuration issue (400) - check server logs'
      } else if (err.response?.status === 404) {
        errorMessage = 'Games API endpoint not found (404)'
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error while fetching games (500)'
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to games API'
      } else if (err.message?.includes('Invalid response structure')) {
        errorMessage = 'API response format error - check backend structure'
      }

      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchById = async (id: number, useCache = true) => {
    if (useCache) {
      const cached = getGameById.value(id)
      if (cached) {
        currentGame.value = cached
        return cached
      }
    }

    loading.value = true
    error.value = null
    try {
      currentGame.value = await gameService.getById(id)

      const index = games.value.findIndex(item => item.id === id)
      if (index !== -1 && currentGame.value) {
        games.value[index] = currentGame.value
      }

      return currentGame.value
    } catch (err) {
      error.value = 'Failed to fetch game from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAllGamesForSeason = async (teamId: number, seasonYear?: string) => {
    try {
      const games = await gameService.getRegularSeasonGames(teamId, seasonYear)
      return games
    } catch (error) {
      console.log('Error: ' + error)
    }
  }

  const fetchTeamSeasonWeekGames = async (teamId: number, seasonYear?: string, gameWeek?: number) => {
    try {
      const games = await gameService.getByTeamSeasonWeek(teamId, seasonYear, gameWeek)
      return games
    } catch (error) {
      console.log('Error: ' + error)
    }
  }

  const fetchByTeamAndSeason = async (teamId: number, seasonYear: string) => {
    try {
      games.value = await gameService.getByTeamAndSeasonYear(teamId, seasonYear)
      return games
    } catch (error) {
      console.log('Error: ' + error)
    }
  }

  const fetchRegularSeasonGames = async (teamId: number, seasonYear?: string) => {
    try {
      const games = await gameService.getRegularSeasonGames(teamId, seasonYear)
      return games
    } catch (error) {
      console.log('Error: ' + error)
    }
  }
  const fetchPreSeasonGames = async (
    teamId: number,
    seasonYear?: string
  ) => {
    try {
      let searchYear: number = parseInt(seasonYear ? seasonYear : '0')
      const games = await gameService.getPreseasonGames(teamId, searchYear)
      return games
    } catch (error) {
      console.log('Error: ' + error)
    }
  }

  const create = async (
    data: Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>
  ) => {
    loading.value = true
    error.value = null
    try {
      console.log('Calling clientside - gameService.create')
      const newGame = await gameService.create(data)
      games.value.push(newGame)
      currentGame.value = newGame
      return newGame
    } catch (err) {
      error.value = 'Failed to create game on server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (
    id: number,
    data: Partial<Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>>
  ) => {
    loading.value = true
    error.value = null
    try {
      const updatedGame = await gameService.update(id, data)
      const index = games.value.findIndex(item => item.id === id)
      if (index !== -1) {
        games.value[index] = updatedGame
      }
      currentGame.value = updatedGame
      return updatedGame
    } catch (err) {
      error.value = 'Failed to update game on server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await gameService.delete(id)
      games.value = games.value.filter(item => item.id !== id)
      if (currentGame.value?.id === id) {
        currentGame.value = null
      }
    } catch (err) {
      error.value = 'Failed to delete game on server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setMode = (newMode: CrudMode) => {
    mode.value = newMode
  }

  const clearCurrent = () => {
    currentGame.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const refreshData = (page = currentPage.value, limit = itemsPerPage.value) => {
    return fetchAll(page, limit, true)
  }

  return {
    // State
    games,
    currentGame,
    loading,
    error,
    mode,
    pagination,
    currentPage,
    itemsPerPage,
    // Getters
    getGameById,
    // Actions
    fetchAll,
    fetchById,
    fetchByTeamAndSeason,
    fetchRegularSeasonGames,
    fetchTeamSeasonWeekGames,
    fetchPreSeasonGames,
    fetchAllGamesForSeason,
    create,
    update,
    remove,
    setMode,
    clearCurrent,
    clearError,
    refreshData,
  }
})
