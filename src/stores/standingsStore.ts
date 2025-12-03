// src/stores/standingsStore.ts
import { defineStore } from 'pinia'
import { fetchStandings } from '../services/standingsService'
import StandingsServices from '../services/teamStandingsService'
import type { TeamStandingDto } from '@/types/TeamStandingDto'
import type { TeamLogoInfo, TeamRef } from '@/util/teamLogo'
import { getTeamLogoInfo } from '@/util/teamLogo'

const service = new StandingsServices()

export const useStandingsStore = defineStore('standings', {
  state: () => ({
    standings: [] as TeamStandingDto[],
    loading: false as boolean,
  }),

  getters: {
    // Single row by teamId
    getByTeamId:
      state =>
      (teamId: number | null | undefined): TeamStandingDto | null => {
        if (teamId == null) return null
        return state.standings.find(s => s.teamId === teamId) ?? null
      },

    // "W-L" record
    getRecordByTeamId:
      state =>
      (teamId: number | null | undefined): string | null => {
        if (teamId == null) return null
        const row = state.standings.find(s => s.teamId === teamId)
        if (!row) return null
        return `${row.wins}-${row.losses}`
      },

    // Logo info via teamLogos helper
    getLogoInfoByTeamId:
      state =>
      (teamId: number | null | undefined): TeamLogoInfo | null => {
        if (teamId == null) return null
        const row = state.standings.find(s => s.teamId === teamId)
        if (!row) return null

        const ref: TeamRef = {
          name: row.teamName,
          conference: row.conference,
        }
        return getTeamLogoInfo(ref)
      },

    // Display name (shortName if available, fallback to full name)
    getDisplayNameByTeamId:
      state =>
      (teamId: number | null | undefined): string => {
        if (teamId == null) return 'TBD'
        const row = state.standings.find(s => s.teamId === teamId)
        if (!row) return 'TBD'

        const ref: TeamRef = {
          name: row.teamName,
          conference: row.conference,
        }
        const logoInfo = getTeamLogoInfo(ref)
        return logoInfo.shortName || row.teamName || 'TBD'
      },
    getDivisionWinnersByConference:
      state =>
      (conference: string): TeamStandingDto[] => {
        const conf = conference.toUpperCase()

        // Filter to this conference
        const rows = state.standings.filter(s => s.conference.toUpperCase() === conf)

        if (rows.length === 0) return []

        // Group by division
        const byDivision = new Map<string, TeamStandingDto[]>()
        for (const row of rows) {
          const key = row.division
          const list = byDivision.get(key) ?? []
          list.push(row)
          byDivision.set(key, list)
        }

        // For each division, pick the best record
        const divisionWinners: TeamStandingDto[] = []
        for (const [, list] of byDivision.entries()) {
          const sorted = [...list].sort((a, b) => {
            // Primary: winPct desc
            if (b.winPct !== a.winPct) return b.winPct - a.winPct
            // Secondary: wins desc
            if (b.wins !== a.wins) return b.wins - a.wins
            // Tertiary: pointDiff desc
            if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
            // Fallback: teamName asc
            return a.teamName.localeCompare(b.teamName)
          })

          divisionWinners.push(sorted[0])
        }

        // Now sort division winners by seed (best overall first)
        divisionWinners.sort((a, b) => {
          if (b.winPct !== a.winPct) return b.winPct - a.winPct
          if (b.wins !== a.wins) return b.wins - a.wins
          if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
          return a.teamName.localeCompare(b.teamName)
        })

        return divisionWinners
      },
  },

  actions: {
    async load(year: number, seasonType: number) {
      this.loading = true
      try {
        const data = await fetchStandings(year, seasonType)
        console.log('Fetched data Team:', Array.isArray(data) ? data[0]?.teamName : 'N/A')
        this.standings = Array.isArray(data) ? data : []
        console.log('Stored standings[0]:', this.standings[0]?.teamName)
      } catch (error) {
        console.error('Failed to load standings:', error)
        this.standings = []
      } finally {
        this.loading = false
      }
    },

    async fetchStandings(year: number, seasonType = 2) {
      this.loading = true
      try {
        console.log('[standingsStore] fetchStandings year=%d seasonType=%d', year, seasonType)
        const res = await service.getAll(year, seasonType)
        this.standings = res.data
        console.log(
          '[standingsStore] rows=',
          this.standings.length,
          'example=',
          this.standings[0]?.teamName
        )
      } catch (error) {
        console.error('[standingsStore] fetchStandings error:', error)
        this.standings = []
      } finally {
        this.loading = false
      }
    },
  },
})
