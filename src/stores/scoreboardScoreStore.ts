// src/stores/useScoreboardStore.ts
import { defineStore } from 'pinia'
import { ScoreboardApi, ScoreboardSyncResult } from '@/services/api'

type Day = 'SUN'|'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'

export const useScoreboardStore = defineStore('scoreboard', {
  state: () => ({
    saving: false,
    loading: false,
    schedule: {
      enabled: true,
      days: ['SUN','MON','THU','SAT'] as Day[],
      hour: 0,
      minute: 0,
      timezone: 'America/Chicago'
    }
  }),
  actions: {
    async refreshByDate(date: string): Promise<ScoreboardSyncResult> {
      this.loading = true
      try {
        const res = await ScoreboardApi.refreshByDate(date)
        return res
      } finally {
        this.loading = false
      }
    },
    async refreshByWeek(season: number, seasonType: 1|2|3, week: number): Promise<ScoreboardSyncResult> {
      this.loading = true
      try {
        const res = await ScoreboardApi.refreshByWeek(season, seasonType, week)
        return res
      } finally {
        this.loading = false
      }
    },
    async loadSchedule() {
      this.loading = true
      try {
        this.schedule = await ScoreboardApi.getSchedule()
      } finally {
        this.loading = false
      }
    },
    async saveSchedule() {
      this.saving = true
      try {
        await ScoreboardApi.saveSchedule(this.schedule)
      } finally {
        this.saving = false
      }
    }
  }
})
