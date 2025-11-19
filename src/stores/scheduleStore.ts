// src/stores/scheduleStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
//import { scheduleService } from '@/services/scheduleService'
import type { Schedule, CrudMode, PaginationMeta } from '@/types'
import { api } from '@/services/api'
import { ScheduleService } from '@/services/scheduleService'
import { format } from 'date-fns'

type MinimalMeta =
  | {
      total?: number
      page?: number
      limit?: number
      pages?: number
    }
  | null
  | undefined

export interface UpcomingGameRow {
  id: number
  dateFormatted: string
  homeTeamName: string
  awayTeamName: string
  homeLogo: string
  awayLogo: string
  status: string
}



function resolveTeamLogo(teamName: string): string {
  const cleaned = teamName
    //    .replace(/[^A-Za-z]/g, '') // strip symbols
    .replace(/[^A-Za-z0-9]/g, '') // keep digits too
    .toLowerCase()

  // Path prefix
  const afc = '/src/assets/images/afc/'
  const nfc = '/src/assets/images/nfc/'

  // AFC teams
  const afcMap: Record<string, string> = {
    chiefs: 'Chiefs.avif',
    broncos: 'Broncos.avif',
    raiders: 'Raiders.avif',
    chargers: 'Chargers.webp', // special case
    patriots: 'Patriots.avif',
    jets: 'Jets.avif',
    dolphins: 'Dolphins.avif',
    bills: 'Bills.avif',
    steelers: 'Steelers.avif',
    browns: 'Browns.avif',
    ravens: 'Ravens.avif',
    bengals: 'Bengals.avif',
    colts: 'Colts.avif',
    jaguars: 'Jaguars.avif',
    texans: 'Texans.avif',
    titans: 'Titans.avif',
  }

  const nfcMap: Record<string, string> = {
    bears: 'Bears.avif',
    packers: 'Packers.avif',
    lions: 'Lions.avif',
    vikings: 'Vikings.avif',
    cowboys: 'Cowboys.avif',
    giants: 'Giants.avif',
    eagles: 'Eagles.avif',
    commanders: 'Commanders.avif',
    buccaneers: 'Buccaneers.avif',
    saints: 'Saints.avif',
    falcons: 'Falcons.avif',
    panthers: 'Panthers.avif',
    rams: 'Rams.avif',
    seahawks: 'Seahawks.avif',
    '49ers': '49ers.avif',
    cardinals: 'Cardinals.avif',
  }

  if (cleaned in afcMap) return afc + afcMap[cleaned]
  if (cleaned in nfcMap) return nfc + nfcMap[cleaned]

  return '/src/assets/images/default-team.png'
}

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
  dataLen: number,
  page: number,
  limit: number
): PaginationMeta {
  if (meta && typeof meta === 'object' && 'totalPages' in meta) {
    const m = meta as PaginationMeta
    const effLimit = m.limit ?? limit
    const effPage = m.page ?? page
    const effTotal =
      m.total ?? (dataLen < effLimit ? (effPage - 1) * effLimit + dataLen : effPage * effLimit + 1)
    const effTotalPages = m.totalPages ?? Math.max(1, Math.ceil(effTotal / effLimit))

    return {
      total: effTotal,
      page: effPage,
      limit: effLimit,
      totalPages: effTotalPages,
      hasNext: m.hasNext ?? effPage < effTotalPages,
      hasPrev: m.hasPrev ?? effPage > 1,
    }
  }

  if (meta && typeof meta === 'object' && 'total' in meta) {
    const effTotal = meta.total ?? 0
    const effPage = meta.page ?? page
    const effLimit = meta.limit ?? limit
    return toPaginationMeta(effTotal, effPage, effLimit)
  }

  const effLimit = limit
  const effPage = page
  const effTotal = dataLen < limit ? (effPage - 1) * effLimit + dataLen : effPage * effLimit + 1

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

  const year = ref<number>(new Date().getFullYear())
  const seasonType = ref<number>(2)
  const week = ref<number>(1)
  const upcomingEvents = ref<Schedule[]>([])

  const getScheduleById = computed(() => (id: number) => schedules.value.find(s => s.id === id))
  const getSchedulesByTeam = computed(
    () => (teamId: number) => schedules.value.filter(s => s.teamId === teamId)
  )
  const getSchedulesBySeason = computed(
    () => (seasonYear: number) => schedules.value.filter(s => Number(s.seasonYear) === seasonYear)
  )

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

  // ────────────────────────────────────────────────
  //  Existing CRUD fetchers
  // ────────────────────────────────────────────────

  const fetchAll = async (page = 1, limit = 10, refresh = false) => {
    if (schedules.value.length > 0 && !refresh && currentPage.value === page) return
    loading.value = true
    error.value = null
    try {
      const res = await scheduleService.getAll(page, limit)
      setResult(res, page, limit, page === 1 || refresh)
    } catch (e) {
      console.error(e)
      error.value = 'Failed to fetch schedules from server'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchByTeam = async (teamId: number, page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const res = await scheduleService.getByTeam(teamId, page, limit)
      setResult(res, page, limit, page === 1)
      return res.data
    } catch (e) {
      error.value = 'Failed to fetch team schedules from server'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchBySeason = async (seasonYear: number, page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const res = await scheduleService.getBySeason(seasonYear, page, limit)
      setResult(res, page, limit, page === 1)
      return res.data
    } catch (e) {
      error.value = 'Failed to fetch season schedules from server'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchByTeamSeason = async (teamId: number, seasonYear: number, page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const res = await scheduleService.getByTeamSeason(teamId, seasonYear, page, limit)
      setResult(res, page, limit, page === 1)
      return res.data
    } catch (e) {
      error.value = 'Failed to fetch team+season schedules from server'
      throw e
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
      const s = await scheduleService.getById(id)
      currentSchedule.value = s
      const idx = schedules.value.findIndex(it => it.id === id)
      if (idx !== -1) schedules.value[idx] = s
      else schedules.value.push(s)
      return s
    } catch (e) {
      error.value = 'Failed to fetch schedule from server'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ────────────────────────────────────────────────
  //  ✨ New: Upcoming Schedule Fetcher (ESPN endpoint)
  // ────────────────────────────────────────────────
  const fetchUpcomingSchedule = async (
    inputYear = year.value,
    inputSeasonType = seasonType.value,
    inputWeek = week.value
  ) => {
    loading.value = true
    error.value = null
    try {
      const res = await scheduleService.getUpcomingSchedule(inputYear, inputSeasonType, inputWeek)
      upcomingEvents.value = extractEvents(res)

      year.value = inputYear
      seasonType.value = inputSeasonType
      week.value = inputWeek
      return upcomingEvents.value
    } catch (e: any) {
      console.error('❌ Failed to fetch upcoming schedule:', e)
      error.value = e.message || 'Failed to fetch upcoming schedule'
      throw e
    } finally {
      loading.value = false
    }
  }

  function extractEvents(res: unknown): any[] {
    const r = res as any

    // CASE 1: backend sends array
    if (Array.isArray(r)) return r

    // CASE 2: backend sends { data: [...] }
    if (Array.isArray(r?.data)) return r.data

    // CASE 3: backend sends { events: [...] }
    if (Array.isArray(r?.events)) return r.events

    // CASE 4: backend sends { success: true, data: [...] }
    if (Array.isArray(r?.data?.data)) return r.data.data

    return []
  }

  // ────────────────────────────────────────────────
  //  Standard CRUD ops
  // ────────────────────────────────────────────────
  const create = async (payload: Omit<Schedule, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const s = await scheduleService.create(payload)
      schedules.value.push(s)
      currentSchedule.value = s
      return s
    } catch (e) {
      error.value = 'Failed to create schedule on server'
      throw e
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number, patch: Partial<Schedule>) => {
    loading.value = true
    error.value = null
    try {
      const s = await scheduleService.update(id, patch)
      const idx = schedules.value.findIndex(it => it.id === id)
      if (idx !== -1) schedules.value[idx] = s
      currentSchedule.value = s
      return s
    } catch (e) {
      error.value = 'Failed to update schedule on server'
      throw e
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await scheduleService.delete(id)
      schedules.value = schedules.value.filter(it => it.id !== id)
      if (currentSchedule.value?.id === id) currentSchedule.value = null
    } catch (e) {
      error.value = 'Failed to delete schedule on server'
      throw e
    } finally {
      loading.value = false
    }
  }

  const setMode = (m: CrudMode) => {
    mode.value = m
  }
  const clearCurrent = () => {
    currentSchedule.value = null
  }
  const clearError = () => {
    error.value = null
  }
  const refreshData = (page = currentPage.value, limit = itemsPerPage.value) =>
    fetchAll(page, limit, true)

  return {
    // core state
    schedules,
    currentSchedule,
    loading,
    error,
    mode,
    pagination,
    currentPage,
    itemsPerPage,

    // new upcoming schedule state
    upcomingEvents,
    year,
    seasonType,
    week,

    // getters
    getScheduleById,
    getSchedulesByTeam,
    getSchedulesBySeason,

    // CRUD actions
    fetchAll,
    fetchById,
    fetchByTeam,
    fetchBySeason,
    fetchByTeamSeason,
    create,
    update,
    remove,

    // new action
    fetchUpcomingSchedule,

    // utilities
    setMode,
    clearCurrent,
    clearError,
    refreshData,
  }
})

const scheduleService = new ScheduleService()
export const usePrimetimeScheduleStore = defineStore('primetimeScheduleStore', {
  state: () => ({
    primetimeGames: [] as any[],
    upcomingEvents: [] as UpcomingGameRow[],
    loading: false,
  }),

  actions: {
    async fetchPrimetime(year: number) {
      this.loading = true
      try {
        const res = await api.get('/games/primetime', { params: { year } })
        this.primetimeGames = res.data
      } finally {
        this.loading = false
      }
    },
  },
})
