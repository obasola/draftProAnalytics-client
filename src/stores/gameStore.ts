// src/stores/gameStore.ts
import { apiService } from '@/services/api'
import { normalizePaged } from '@/util/paging'
import { defineStore } from 'pinia'
import { gameService } from '@/services/gameService'
import type { Game, CrudMode, PaginationMeta } from '@/types'

export interface GameRow {
  id: number
  seasonYear: string
  gameWeek: number | null
  seasonType: number | null
  gameDate: string
  homeTeamId: number
  awayTeamId: number
  homeTeam?: {
    id: number
    name: string
    conference?: string | null
    division?: string | null
    city?: string | null
    state?: string | null
    stadium?: string | null
  }
  awayTeam?: {
    id: number
    name: string
    conference?: string | null
    division?: string | null
    city?: string | null
    state?: string | null
    stadium?: string | null
  }
  gameLocation?: string | null
  gameCity?: string | null
  gameStateProvince?: string | null
  gameCountry?: string | null
  homeScore?: number | null
  awayScore?: number | null
  gameStatus: string
}

export const useGameStore = defineStore('games', {
  state: () => ({
    games: [] as GameRow[],
    currentGame: null as GameRow | null,
    loading: false,
    error: null as string | null,
    mode: 'read' as CrudMode,

    pagination: null as PaginationMeta | null,
    currentPage: 1,
    itemsPerPage: 10,
  }),

  actions: {
    async getGameById(id: number) {
      return this.fetchById(id)
    },

    async fetchById(id: number) {
      this.loading = true
      this.error = null
      try {
        const { data } = await apiService.get<GameRow | { data: GameRow }>(`/games/${id}`)
        const payload =
          data && typeof data === 'object' && 'data' in data ? (data as any).data : data
        this.currentGame = payload as GameRow
        const i = this.games.findIndex(g => g.id === (payload as GameRow).id)
        if (i >= 0) this.games[i] = payload as GameRow
        else this.games.push(payload as GameRow)
        return payload
      } catch (err) {
        this.error = 'Failed to load game by id'
        throw err
      } finally {
        this.loading = false
      }
    },

    // Generic server-paginated fetch
    async fetchAll(page = 1, limit = 500, extraParams: Record<string, unknown> = {}) {
      this.loading = true
      this.error = null
      try {
        const params = mapQueryParams({ page, limit, ...extraParams })
        console.debug('[games] GET /games params =>', params)
        const res = await apiService.get<any>('/games', { params })
        const { rows, total, page: currentPage, pageSize } = normalizePaged<any>(res)
        this.games = rows as GameRow[]
        this.pagination = toPaginationMeta(total, currentPage ?? page, pageSize ?? limit)
        this.currentPage = currentPage ?? page
        this.itemsPerPage = pageSize ?? limit
        return { data: rows, pagination: this.pagination }
      } finally {
        this.loading = false
      }
    },


    async fetchByYear(year: string | number, page = 1, limit = 500) {
      return this.fetchAll(page, limit, { year, seasonType: 2 })
    },

    async fetchLeagueWeek(year: string | number, week: number, page = 1, limit = 500) {
      return this.fetchAll(page, limit, { year, week, seasonType: 2   })
    },

    async fetchLeaguePreseason(year: string | number, page = 1, limit = 500) {
      return this.fetchAll(page, limit, { year, seasonType: 1 })
    },

    async fetchTeamSeason(teamId: number, year: string | number, page = 1, limit = 500) {
      return this.fetchAll(page, limit, { teamId, year, seasonType: 2  })
    },

    async fetchTeamSeasonWeekGames(
      teamId: number,
      year: string | number,
      week: number,
      page = 1,
      limit = 500
    ) {
    },

    async fetchTeamPreseason(teamId: number, year: string | number, page = 1, limit = 500) {
      return this.fetchAll(page, limit, { teamId, year, seasonType: 1 })
    },

    async create(data: Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const newGame = await gameService.create(data)
        const row: GameRow = normalizeToRow(newGame)
        this.games.unshift(row)
        this.currentGame = row
        return row
      } catch (err) {
        this.error = 'Failed to create game on server'
        throw err
      } finally {
        this.loading = false
      }
    },

    async update(
      id: number,
      data: Partial<Omit<Game, 'id' | 'homeTeam' | 'awayTeam' | 'createdAt' | 'updatedAt'>>
    ) {
      this.loading = true
      this.error = null
      try {
        const updated = await gameService.update(id, data)
        const updatedRow = normalizeToRow(updated)
        const idx = this.games.findIndex(g => g.id === id)
        if (idx !== -1) this.games[idx] = updatedRow
        this.currentGame = updatedRow
        return updatedRow
      } catch (err) {
        this.error = 'Failed to update game on server'
        throw err
      } finally {
        this.loading = false
      }
    },

    async remove(id: number) {
      this.loading = true
      this.error = null
      try {
        await gameService.delete(id)
        this.games = this.games.filter(g => g.id !== id)
        if (this.currentGame?.id === id) this.currentGame = null
      } catch (err) {
        this.error = 'Failed to delete game on server'
        throw err
      } finally {
        this.loading = false
      }
    },

    setMode(newMode: CrudMode) {
      this.mode = newMode
    },
    clearCurrent() {
      this.currentGame = null
    },
    clearError() {
      this.error = null
    },
    refreshData() {
      return this.fetchAll(this.currentPage, this.itemsPerPage)
    },
  },
})

// ---------- helpers ----------
function toPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)))
  return { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
}

function normalizeToRow(g: Game): GameRow {
  return {
    id: g.id,
    seasonYear: String(g.seasonYear),
    gameWeek: g.gameWeek ?? null,
    seasonType: (g as any).seasonType ?? null,
    gameDate: g.gameDate as unknown as string,
    homeTeamId: g.homeTeamId,
    awayTeamId: g.awayTeamId,
    homeTeam: g.homeTeam as any,
    awayTeam: g.awayTeam as any,
    gameLocation: (g as any).gameLocation ?? null,
    gameCity: (g as any).gameCity ?? null,
    gameStateProvince: (g as any).gameStateProvince ?? null,
    gameCountry: (g as any).gameCountry ?? null,
    homeScore: (g as any).homeScore ?? null,
    awayScore: (g as any).awayScore ?? null,
    gameStatus: (g as any).gameStatus ?? 'scheduled',
  }
}

function normalizeToRows(payload: unknown): GameRow[] {
  if (Array.isArray(payload)) return payload as GameRow[]
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as GameRow[]
    if (Array.isArray(obj.items)) return obj.items as GameRow[]
    if (Array.isArray(obj.results)) return obj.results as GameRow[]
  }
  return []
}
// helper near bottom
// gameStore.ts (add near the helpers)
function mapQueryParams(p: Record<string, unknown>) {
  // Accept camelCase from callers, send snake_case the server likely expects.
  const out: Record<string, unknown> = {}

  // Common aliases
  const team_id = (p as any).team_id ?? (p as any).teamId
  const year = p.year ?? (p as any).seasonYear
  const week = p.week ?? (p as any).gameWeek

  if (team_id != null) out.team_id = team_id
  if (year != null) out.year = year
  if (week != null) out.week = week

  // If the caller explicitly sets seasonType, forward it (0 or 1)
  if ('seasonType' in p) out.seasonType = (p as any).seasonType

  // carry the rest through unchanged
  for (const [k, v] of Object.entries(p)) if (!(k in out)) out[k] = v
  return out
}
