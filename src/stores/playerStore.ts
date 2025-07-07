// src/stores/playerStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { playerService } from '@/services/playerService'
import type { Player, CrudMode } from '@/types'

export const usePlayerStore = defineStore('player', () => {
  // State - stored in memory only, fetched from server
  const players = ref<Player[]>([])
  const currentPlayer = ref<Player | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const mode = ref<CrudMode>('read')

  // Computed getters
  const getPlayerById = computed(() => {
    return (id: number) => players.value.find((p) => p.id === id)
  })

  const getPlayersByTeam = computed(() => {
    return (teamId: number) =>
      players.value.filter((p) => p.team?.id === teamId)
  })

  const getPlayersByPosition = computed(() => {
    return (position: string) =>
      players.value.filter((p) => p.position === position)
  })
  // Actions - All data comes from/goes to REST API
  const fetchAll = async (refresh = false) => {
    // Only fetch if we don't have data or explicitly refreshing
    if (players.value.length > 0 && !refresh) return

    loading.value = true
    error.value = null
    try {
      const resp = await playerService.getAll()  
      players.value = resp.data
    } catch (err) {
      error.value = 'Failed to fetch players from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchById = async (id: number, useCache = true) => {
    // Check cache first if allowed
    if (useCache) {
      const cached = getPlayerById.value(id)
      if (cached) {
        currentPlayer.value = cached
        return cached
      }
    }

    loading.value = true
    error.value = null
    try {
      currentPlayer.value = await playerService.getById(id)
      
      // Update cache if player exists in list
      const index = players.value.findIndex((p) => p.id === id)
      if (index !== -1 && currentPlayer.value) {
        players.value[index] = currentPlayer.value
      }
      
      return currentPlayer.value
    } catch (err) {
      error.value = 'Failed to fetch player from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchByName = async (name: string) => {
    loading.value = true
    error.value = null
    try {
      return await playerService.getByName(name)
    } catch (err) {
      error.value = 'Failed to search players on server'
      console.error(err)
      return []
    } finally {
      loading.value = false
    }
  }

  const create = async (playerData: Omit<Player, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const newPlayer = await playerService.create(playerData)
      
      // Add to local cache
      players.value.push(newPlayer)
      currentPlayer.value = newPlayer
      
      return newPlayer
    } catch (err) {
      error.value = 'Failed to create player on server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number, playerData: Partial<Player>) => {
    loading.value = true
    error.value = null
    try {
      const updatedPlayer = await playerService.update(id, playerData)
      if(playerData && playerData.yearEnteredLeague != 0) {
        throw new ValidationError("yearEnteredLeague is empty or INVALID")
      }
      // Update local cache
      const index = players.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        players.value[index] = updatedPlayer
      }
      currentPlayer.value = updatedPlayer
      
      return updatedPlayer
    } catch (err) {
      error.value = 'Failed to update player on server'
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
      await playerService.delete(id)
      
      // Remove from local cache
      players.value = players.value.filter((p) => p.id !== id)
      if (currentPlayer.value?.id === id) {
        currentPlayer.value = null
      }
      
    } catch (err) {
      error.value = 'Failed to delete player on server'
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
    currentPlayer.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const refreshData = () => {
    return fetchAll(true)
  }

  return {
    // State
    players,
    currentPlayer,
    loading,
    error,
    mode,
    // Getters
    getPlayerById,
    getPlayersByTeam,
    getPlayersByPosition,
    // Actions
    fetchAll,
    fetchById,
    searchByName,
    create,
    update,
    remove,
    setMode,
    clearCurrent,
    clearError,
    refreshData,
  }
})