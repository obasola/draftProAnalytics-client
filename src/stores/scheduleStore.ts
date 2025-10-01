// src/stores/scheduleStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { scheduleService } from '@/services/scheduleService'
import type { Schedule, CrudMode, PaginationMeta } from '@/types'

// ---- tolerant pagination helpers ----
type MinimalMeta = {
  total?: number
  page?: number
  limit?: number
  pages?: number
} | null | undefined

function toPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)))
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

function coercePagination(
  meta: PaginationMeta | MinimalMeta,
  fallbackTotal: number,
  page: number,
  limit: number
): PaginationMeta {
  if (meta && typeof meta === 'object' && 'totalPages' in meta) {
    const m = meta as PaginationMeta
    const effLimit = m.limit ?? limit
    const effPage  = m.page  ?? page
    const effTotal = m.total ?? fallbackTotal
    const effTotalPages = m.totalPages ?? Math.max(1, Math.ceil(effTotal / effLimit))
    return {
      total: effTotal,
      page: effPage,
      limit: effLimit,
      totalPages: effTotalPages,
      hasNext: m.hasNext ?? (effPage < effTotalPages),
      hasPrev: m.hasPrev ?? (effPage > 1),
    }
  }

  const mm = (meta ?? {}) as Exclude<MinimalMeta, null | undefined>
  const effLimit = mm.limit ?? limit
  const effPage  = mm.page  ?? page
  const effTotal = mm.total ?? (mm.pages && effLimit ? mm.pages * effLimit : fallbackTotal)
  return toPaginationMeta(effTotal, effPage, effLimit)
}

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref<Schedule[]>([])
  const currentSchedule = ref<Schedule | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const mode = ref<CrudMode>('read')

  const pagination = ref<PaginationMeta | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const getScheduleById = computed(() => (id: number) => schedules.value.find(s => s.id === id))
  const getSchedulesByTeam = computed(() => (teamId: number) => schedules.value.filter(s => s.teamId === teamId))
  const getSchedulesBySeason = computed(() => (seasonYear: number) => schedules.value.filter(s => Number(s.seasonYear) === seasonYear))

  const setResult = (
    payload: { data: Schedule[]; pagination?: PaginationMeta | MinimalMeta },
    page: number,
    limit: number,
    refresh: boolean
  ) => {
    if (page === 1 || refresh) {
      schedules.value = payload.data
    } else {
      schedules.value = [...schedules.value, ...payload.data]
    }

    pagination.value = coercePagination(payload.pagination, payload.data.length, page, limit)
    currentPage.value = page
    itemsPerPage.value = limit
  }

  const fetchAll = async (page = 1, limit = 10, refresh = false) => {
    if (schedules.value.length > 0 && !refresh && currentPage.value === page) return
    loading.value = true; error.value = null
    try {
      const res = await scheduleService.getAll(page, limit)
      setResult(res, page, limit, page === 1 || refresh)
    } catch (e) {
      error.value = 'Failed to fetch schedules from server'; throw e
    } finally { loading.value = false }
  }

  const fetchByTeam = async (teamId: number, page = 1, limit = 10) => {
    loading.value = true; error.value = null
    try {
      const res = await scheduleService.getByTeam(teamId, page, limit)
      setResult(res, page, limit, page === 1)
      return res.data
    } catch (e) {
      error.value = 'Failed to fetch team schedules from server'; throw e
    } finally { loading.value = false }
  }

  const fetchBySeason = async (seasonYear: number, page = 1, limit = 10) => {
    loading.value = true; error.value = null
    try {
      const res = await scheduleService.getBySeason(seasonYear, page, limit)
      setResult(res, page, limit, page === 1)
      return res.data
    } catch (e) {
      error.value = 'Failed to fetch season schedules from server'; throw e
    } finally { loading.value = false }
  }

  const fetchByTeamSeason = async (teamId: number, seasonYear: number, page = 1, limit = 10) => {
    loading.value = true; error.value = null
    try {
      const res = await scheduleService.getByTeamSeason(teamId, seasonYear, page, limit)
      setResult(res, page, limit, page === 1)
      return res.data
    } catch (e) {
      error.value = 'Failed to fetch team+season schedules from server'; throw e
    } finally { loading.value = false }
  }

  const fetchById = async (id: number, useCache = true) => {
    if (useCache) {
      const cached = getScheduleById.value(id)
      if (cached) { currentSchedule.value = cached; return cached }
    }
    loading.value = true; error.value = null
    try {
      const s = await scheduleService.getById(id)
      currentSchedule.value = s
      const idx = schedules.value.findIndex(it => it.id === id)
      if (idx !== -1) schedules.value[idx] = s; else schedules.value.push(s)
      return s
    } catch (e) {
      error.value = 'Failed to fetch schedule from server'; throw e
    } finally { loading.value = false }
  }

  const create = async (payload: Omit<Schedule, 'id'>) => {
    loading.value = true; error.value = null
    try {
      const s = await scheduleService.create(payload)
      schedules.value.push(s); currentSchedule.value = s; return s
    } catch (e) {
      error.value = 'Failed to create schedule on server'; throw e
    } finally { loading.value = false }
  }

  const update = async (id: number, patch: Partial<Schedule>) => {
    loading.value = true; error.value = null
    try {
      const s = await scheduleService.update(id, patch)
      const idx = schedules.value.findIndex(it => it.id === id)
      if (idx !== -1) schedules.value[idx] = s
      currentSchedule.value = s; return s
    } catch (e) {
      error.value = 'Failed to update schedule on server'; throw e
    } finally { loading.value = false }
  }

  const remove = async (id: number) => {
    loading.value = true; error.value = null
    try {
      await scheduleService.delete(id)
      schedules.value = schedules.value.filter(it => it.id !== id)
      if (currentSchedule.value?.id === id) currentSchedule.value = null
    } catch (e) {
      error.value = 'Failed to delete schedule on server'; throw e
    } finally { loading.value = false }
  }

  const setMode = (m: CrudMode) => { mode.value = m }
  const clearCurrent = () => { currentSchedule.value = null }
  const clearError = () => { error.value = null }
  const refreshData = (page = currentPage.value, limit = itemsPerPage.value) => fetchAll(page, limit, true)

  return {
    schedules, currentSchedule, loading, error, mode,
    pagination, currentPage, itemsPerPage,
    getScheduleById, getSchedulesByTeam, getSchedulesBySeason,
    fetchAll, fetchById, fetchByTeam, fetchBySeason, fetchByTeamSeason,
    create, update, remove, setMode, clearCurrent, clearError, refreshData,
  }
})
