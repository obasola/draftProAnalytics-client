import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { scheduleService } from '@/services/scheduleService'
import type { Schedule, CrudMode, PaginationMeta } from '@/types'

export const useScheduleStore = defineStore('schedule', () => {
  // State - in memory only, fetched from server
  const schedules = ref<Schedule[]>([])
  const currentSchedule = ref<Schedule | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const mode = ref<CrudMode>('read')
  
  // Pagination state
  const pagination = ref<PaginationMeta | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  // Getters
  const getScheduleById = computed(() => {
    return (id: number) => schedules.value.find((item) => item.id === id)
  })

  const getSchedulesByTeam = computed(() => {
    return (teamId: number) => schedules.value.filter((item) => item.teamId === teamId)
  })

  const getSchedulesBySeason = computed(() => {
    return (seasonYear: number) => schedules.value.filter((item) => Number(item.seasonYear) === seasonYear)
  })

  // Actions - All data from REST API with pagination support
  const fetchAll = async (page = 1, limit = 10, refresh = false) => {
    // Only fetch if we don't have data or if explicitly refreshing
    if (schedules.value.length > 0 && !refresh && currentPage.value === page) return

    loading.value = true
    error.value = null
    try {
      const response = await scheduleService.getAll(page, limit)
      
      if (page === 1 || refresh) {
        // Replace data for first page or refresh
        schedules.value = response.data
      } else {
        // Append data for subsequent pages (if implementing infinite scroll)
        schedules.value = [...schedules.value, ...response.data]
      }
      
      pagination.value = response.pagination
      currentPage.value = page
      itemsPerPage.value = limit
      
    } catch (err) {
      error.value = 'Failed to fetch schedules from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchById = async (id: number, useCache = true) => {
    if (useCache) {
      const cached = getScheduleById.value(id)
      if (cached) {
        currentSchedule.value = cached
        return cached
      }
    }

    loading.value = true
    error.value = null
    try {
      currentSchedule.value = await scheduleService.getById(id)
      
      const index = schedules.value.findIndex((item) => item.id === id)
      if (index !== -1 && currentSchedule.value) {
        schedules.value[index] = currentSchedule.value
      }
      
      return currentSchedule.value
    } catch (err) {
      error.value = 'Failed to fetch schedule from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchByTeam = async (teamId: number) => {
    loading.value = true
    error.value = null
    try {
      const teamSchedules = await scheduleService.getByTeam(teamId)
      // Update local cache with team schedules
      teamSchedules.forEach(schedule => {
        const index = schedules.value.findIndex(item => item.id === schedule.id)
        if (index !== -1) {
          schedules.value[index] = schedule
        } else {
          schedules.value.push(schedule)
        }
      })
      return teamSchedules
    } catch (err) {
      error.value = 'Failed to fetch team schedules from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchBySeason = async (seasonYear: number) => {
    loading.value = true
    error.value = null
    try {
      const seasonSchedules = await scheduleService.getBySeason(seasonYear)
      // Update local cache with season schedules
      seasonSchedules.forEach(schedule => {
        const index = schedules.value.findIndex(item => item.id === schedule.id)
        if (index !== -1) {
          schedules.value[index] = schedule
        } else {
          schedules.value.push(schedule)
        }
      })
      return seasonSchedules
    } catch (err) {
      error.value = 'Failed to fetch season schedules from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchByTeamSeason = async (teamId: number, seasonYear: number) => {
    loading.value = true
    error.value = null
    try {
      const seasonSchedules = await scheduleService.getByTeamSeason(teamId, seasonYear)
      // Update local cache with season schedules
      seasonSchedules.forEach(schedule => {
        const index = schedules.value.findIndex(item => item.id === schedule.id)
        if (index !== -1) {
          schedules.value[index] = schedule
        } else {
          schedules.value.push(schedule)
        }
      })
      return seasonSchedules
    } catch (err) {
      error.value = 'Failed to fetch season schedules from server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const create = async (data: Omit<Schedule, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const newSchedule = await scheduleService.create(data)
      schedules.value.push(newSchedule)
      currentSchedule.value = newSchedule
      return newSchedule
    } catch (err) {
      error.value = 'Failed to create schedule on server'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number, data: Partial<Schedule>) => {
    loading.value = true
    error.value = null
    try {
      const updatedSchedule = await scheduleService.update(id, data)
      const index = schedules.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        schedules.value[index] = updatedSchedule
      }
      currentSchedule.value = updatedSchedule
      return updatedSchedule
    } catch (err) {
      error.value = 'Failed to update schedule on server'
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
      await scheduleService.delete(id)
      schedules.value = schedules.value.filter((item) => item.id !== id)
      if (currentSchedule.value?.id === id) {
        currentSchedule.value = null
      }
    } catch (err) {
      error.value = 'Failed to delete schedule on server'
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
    currentSchedule.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const refreshData = (page = currentPage.value, limit = itemsPerPage.value) => {
    return fetchAll(page, limit, true)
  }

  return {
    // State
    schedules,
    currentSchedule,
    loading,
    error,
    mode,
    pagination,
    currentPage,
    itemsPerPage,
    // Getters  
    getScheduleById,
    getSchedulesByTeam,
    getSchedulesBySeason,
    // Actions
    fetchAll,
    fetchById,
    fetchByTeam,
    fetchBySeason,
    fetchByTeamSeason,
    create,
    update,
    remove,
    setMode,
    clearCurrent,
    clearError,
    refreshData,
  }
})