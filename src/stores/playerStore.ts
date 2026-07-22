import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { playerService } from '@/services/playerService'
import type { Player, CrudMode } from '@/types'

export const usePlayerStore = defineStore('player', () => {
  const players = ref<Player[]>([])
  const currentPlayer = ref<Player | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const mode = ref<CrudMode>('read')
  const page = ref(1)
  const rowsPerPage = ref(10)
  const totalRecords = ref(0)

  const getPlayerById = computed(() => (id: number) => players.value.find((player) => player.id === id))
  const getPlayersByTeam = computed(() => (teamId: number) => players.value.filter((player) => player.team?.id === teamId))
  const getPlayersByPosition = computed(() => (position: string) => players.value.filter((player) => player.position === position))

  const fetchPage = async (requestedPage = page.value, requestedLimit = rowsPerPage.value): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const response = await playerService.getAll(requestedPage, requestedLimit)
      players.value = response.data
      page.value = response.pagination.page
      rowsPerPage.value = response.pagination.limit
      totalRecords.value = response.pagination.total
    } catch (err) {
      error.value = 'Failed to fetch players from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAll = async (refresh = false): Promise<void> => {
    if (players.value.length > 0 && !refresh) return
    await fetchPage(1, rowsPerPage.value)
  }

  const fetchById = async (id: number, useCache = false): Promise<Player> => {
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
      const player = await playerService.getById(id)
      currentPlayer.value = player
      return player
    } catch (err) {
      error.value = 'Failed to fetch player from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchByName = async (name: string): Promise<Player[]> => {
    loading.value = true
    error.value = null
    try {
      return await playerService.getByName(name)
    } finally {
      loading.value = false
    }
  }

  const create = async (playerData: Omit<Player, 'id'>): Promise<Player> => {
    loading.value = true
    error.value = null
    try {
      const created = await playerService.create(playerData)
      await fetchPage(page.value, rowsPerPage.value)
      currentPlayer.value = created
      return created
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number, playerData: Partial<Player>): Promise<Player> => {
    loading.value = true
    error.value = null
    try {
      const updated = await playerService.update(id, playerData)
      currentPlayer.value = updated
      const index = players.value.findIndex((player) => player.id === id)
      if (index >= 0) players.value[index] = updated
      return updated
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await playerService.delete(id)
      await fetchPage(page.value, rowsPerPage.value)
      if (currentPlayer.value?.id === id) currentPlayer.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    players, currentPlayer, loading, error, mode, page, rowsPerPage, totalRecords,
    getPlayerById, getPlayersByTeam, getPlayersByPosition,
    fetchAll, fetchPage, fetchById, searchByName, create, update, remove,
    setMode: (newMode: CrudMode) => { mode.value = newMode },
    clearCurrent: () => { currentPlayer.value = null },
    clearError: () => { error.value = null },
    refreshData: () => fetchPage(page.value, rowsPerPage.value),
  }
})
