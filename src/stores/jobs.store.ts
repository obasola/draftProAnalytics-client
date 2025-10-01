import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { JobRow } from '@/services/api'
//import { listJobs, kickoffTeams, kickoffRoster } from '@/services/api'
import { apiService } from '@/services/api'

export const useJobsStore = defineStore('jobs', () => {
  const rows = ref<JobRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // polling state
  const pollTimer = ref<number | undefined>(undefined)
  const pollMs = Number(import.meta.env.VITE_JOBS_REFRESH_MS ?? 5000)
  const inFlight = ref(false)

  function hasActiveJobs(list = rows.value) {
    return list.some(r => r.status === 'PENDING' || r.status === 'RUNNING')
  }

  async function refresh(limit = 50) {
    if (inFlight.value) return // prevent overlapping calls
    inFlight.value = true
    error.value = null
    try {
      const data = await apiService.listJobs(limit)
      rows.value = data
      // auto-stop polling if nothing is active
      if (!hasActiveJobs(data)) stopPolling()
    } catch (e: any) {
      error.value = e?.message || String(e)
    } finally {
      inFlight.value = false
      loading.value = false
    }
  }

  function startPolling() {
    if (pollTimer.value) return
    pollTimer.value = window.setInterval(async () => {
      // only poll while jobs are active and tab is visible
      if (document.hidden) return
      if (!hasActiveJobs()) { stopPolling(); return }
      await refresh()
    }, pollMs)
  }

  function stopPolling() {
    if (pollTimer.value) {
      clearInterval(pollTimer.value)
      pollTimer.value = undefined
    }
  }

  async function init(limit = 50) {
    loading.value = true
    await refresh(limit)
    if (hasActiveJobs()) startPolling()
  }

  async function startTeams() {
    await apiService.kickoffTeams()
    await refresh()
    startPolling() // begin polling because a job was kicked off
  }

  async function startRoster(team: string) {
    await apiService.kickoffRoster(team)
    await refresh()
    startPolling()
  }

  return {
    rows, loading, error,
    refresh, init, startTeams, startRoster,
    startPolling, stopPolling
  }
})
