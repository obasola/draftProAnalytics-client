// File: src/stores/teamStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { teamService } from '@/services/teamService'
import type { Team, CrudMode, PaginationMeta } from '@/types'

export const useTeamStore = defineStore('team', () => {
  // State - in memory only, fetched from server
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const mode = ref<CrudMode>('read')
  const pagination = ref<PaginationMeta | null>(null)

  // Getters
  const getTeamById = computed(() => {
    return (id: number) => teams.value.find((item) => item.id === id)
  })

  const teamsByConference = computed(() => {
    return (conference: string) => teams.value.filter((team) => team.conference === conference)
  })

  const teamsByDivision = computed(() => {
    return (division: string) => teams.value.filter((team) => team.division === division)
  })

  // Actions - All data from REST API
  const fetchAll = async (page = 1, limit = 10, refresh = false) => {
    // Ensure parameters are numbers
    const pageNum = Number(page)
    const limitNum = Number(limit)
    
    console.log(`Store.fetchAll called with: page=${page}, limit=${limit}`)
    console.log(`Converted to: pageNum=${pageNum}, limitNum=${limitNum}, refresh=${refresh}`)
    
    loading.value = true
    error.value = null
    try {
      const response = await teamService.getAll(pageNum, limitNum)
      console.log('Teams service response:', response)
      console.log('Response pagination:', response.pagination)
      
      // For pagination, always replace data (don't append)
      teams.value = response.data
      pagination.value = response.pagination
      
      if(teams) {
        console.log('Updated teams count:', teams.value.length)
      }
      if(pagination) {
        console.log('Updated pagination state:', pagination.value)
      }
    } catch (err) {
      error.value = 'Failed to fetch teams from server'
      console.error('fetchAll error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ Fixed fetchById function
  const fetchById = async (id: number, useCache = true): Promise<Team | null> => {
    if (useCache) {
      const cached = getTeamById.value(id)
      if (cached) {
        currentTeam.value = cached
        return cached
      }
    }

    loading.value = true
    error.value = null
    try {
      currentTeam.value = await teamService.getById(id)
      
      const index = teams.value.findIndex((item) => item.id === id)
      if (index !== -1 && currentTeam.value) {
        teams.value[index] = currentTeam.value
      }
      
      return currentTeam.value
    } catch (err) {
      error.value = 'Failed to fetch team from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const create = async (data: Omit<Team, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const newTeam = await teamService.create(data)
      teams.value.push(newTeam)
      currentTeam.value = newTeam
      return newTeam
    } catch (err) {
      error.value = 'Failed to create team on server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number, data: Partial<Team>) => {
    loading.value = true
    error.value = null
    try {
      const updatedTeam = await teamService.update(id, data)
      const index = teams.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        teams.value[index] = updatedTeam
      }
      currentTeam.value = updatedTeam
      return updatedTeam
    } catch (err) {
      error.value = 'Failed to update team on server'
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
      await teamService.delete(id)
      teams.value = teams.value.filter((item) => item.id !== id)
      if (currentTeam.value?.id === id) {
        currentTeam.value = null
      }
    } catch (err) {
      error.value = 'Failed to delete team on server'
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
    currentTeam.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const refreshData = (page = 1, limit = 10) => {
    return fetchAll(Number(page), Number(limit), true)
  }

  return {
    // State
    teams,
    currentTeam,
    loading,
    error,
    mode,
    pagination,
    // Getters  
    getTeamById,
    teamsByConference,
    teamsByDivision,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    setMode,
    clearCurrent,
    clearError,
    refreshData,
  }
})