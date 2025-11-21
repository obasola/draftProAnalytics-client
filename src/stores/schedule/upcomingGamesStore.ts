// src/stores/schedule/upcomingGamesStore.ts
import { defineStore } from 'pinia'

import type { UpcomingGameDto } from '@/types/schedule/upcomingGames'
import type { UpcomingGameUI } from '@/util/schedule/upcomingGamesHelpers'

import {
  buildUpcomingGameDto
} from '@/util/schedule/upcomingGamesHelper'

import {
  mapUpcomingGamesToUI
} from '@/util/schedule/upcomingGamesHelpers'
import { api } from '@/services/api'

export const useUpcomingScheduleStore = defineStore('upcomingSchedule', {
  state: () => ({
    games: [] as UpcomingGameUI[],
    isLoading: false,
    error: null as string | null
  }),

  actions: {
    /**
     * Fetches upcoming schedule for the given year/type/week
     * then normalizes to UI-ready models.
     */
    async fetchUpcomingGames(
      seasonYear: number,
      seasonType: number,
      week: number
    ) {
      this.isLoading = true
      this.error = null

      try {
        const { data } = await api.get(
          `/schedules/upcomingSchedule`,
          {
            params: {
              seasonYear,
              seasonType,
              week
            }
          }
        )

        if (!data?.events || !Array.isArray(data.events)) {
          this.games = []
          return
        }

        // -------------------------------------------------------
        // Convert raw events → DTO → UI Model
        // -------------------------------------------------------
        const dtoList: UpcomingGameDto[] = data.events.map((ev: any) =>
          buildUpcomingGameDto(ev)
        )

        this.games = mapUpcomingGamesToUI(dtoList)
      } catch (err: any) {
        console.error('[upcomingScheduleStore] Error:', err)
        this.error = err?.message || 'Unknown error fetching schedule'
      } finally {
        this.isLoading = false
      }
    }
  }
})
