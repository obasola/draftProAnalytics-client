// src/stores/upcomingScheduleStore.ts
import { defineStore } from 'pinia'
import { format } from 'date-fns'
import { scheduleService } from '@/services/scheduleService'
import type { UpcomingGame } from '@/types/upcomingSchedule'
import type { UpcomingApiResponse } from '@/types/upcomingSchedule'
import { resolveTeamLogo } from '@/util/resolveTeamLogo'

export const useUpcomingScheduleStore = defineStore('upcomingSchedule', {
  state: () => ({
    loading: false,
    upcomingEvents: [] as UpcomingGame[],
  }),

  actions: {
    async fetchUpcomingSchedule(year: number, seasonType: number, week: number) {
      this.loading = true
      try {
        const api: UpcomingApiResponse = 
          await scheduleService.getUpcomingSchedule(year, seasonType, week)

        this.upcomingEvents = api.events.map(ev => {
          const [away, home] = ev.name.split(' at ')

          return {
            id: ev.id,
            dateFormatted: {
              day: format(new Date(ev.date), 'MMM d'),
              time: format(new Date(ev.date), 'h:mm a'),
            },
            homeTeamName: home,
            awayTeamName: away,
            homeLogo: resolveTeamLogo(home),
            awayLogo: resolveTeamLogo(away),
            status: ev.status || 'Scheduled',
          }

        })
      } finally {
        this.loading = false
      }
    }
  }
})
