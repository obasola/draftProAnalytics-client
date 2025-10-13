// src/stores/playerSyncStore.ts
import { defineStore } from 'pinia'
import axios from 'axios'

export const usePlayerSyncStore = defineStore('playerSync', {
  state: () => ({
    syncing: false,
    logs: [] as string[],
    summary: null as any,
  }),
  actions: {
    async syncAll() {
      this.syncing = true
      this.logs = []
      try {
        const { data } = await axios.post('/api/players/sync')
        this.summary = data.result
        this.logs.push(`✅ Synced all teams: ${data.result.players} players`)
      } catch (err: any) {
        this.logs.push(`❌ ${err.message}`)
      } finally {
        this.syncing = false
      }
    },
    async syncTeam(teamEspnId: number) {
      this.syncing = true
      this.logs = []
      try {
        const { data } = await axios.post(`/api/players/sync?teamEspnId=${teamEspnId}`)
        this.summary = data.result
        this.logs.push(`✅ Synced team ${teamEspnId}: ${data.result.players} players`)
      } catch (err: any) {
        this.logs.push(`❌ ${err.message}`)
      } finally {
        this.syncing = false
      }
    },
  },
})
