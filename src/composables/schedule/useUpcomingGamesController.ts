// src/composables/schedule/useUpcomingGamesController.ts
import { ref, computed, watch } from 'vue'
import { useUpcomingScheduleStore } from '@/stores/schedule/upcomingGamesStore'
import { getLatestScoringPlayText } from '@/services/schedule/scoringPlayService'
import type { UpcomingGameUI } from '@/util/schedule/upcomingGamesHelpers'
import { useToast } from 'primevue/usetoast'
import { JobsApi } from '@/services/api'

export function useUpcomingGamesController() {
  const store = useUpcomingScheduleStore()

  const toast = useToast()
  const initializing = ref(true) // 🧩 ADD THIS LINE
  const loading = ref(false)
  // ---------------------------------------------
  // CONTROLS (DEFAULTS — NEVER OVERWRITTEN AGAIN)
  // ---------------------------------------------
  const selectedYear = ref(2025)
  const selectedSeasonType = ref(2)
  const selectedWeek = ref(0)

  // Week options based on season type
  const weekOptions = computed<number[]>(() => {
    switch (selectedSeasonType.value) {
      case 1:
        return Array.from({ length: 3 }, (_, i) => i + 1)
      case 2:
        return Array.from({ length: 18 }, (_, i) => i + 1)
      case 3:
        return Array.from({ length: 5 }, (_, i) => i + 1)
      default:
        return []
    }
  })

  // ---------------------------------------------
  // REFRESH STATE
  // ---------------------------------------------
  const lastUpdated = ref<Date | null>(null)
  const isManualRefreshing = ref(false)
  const refreshProgress = ref(0)

  let intervalHandle: number | null = null
  let progressTimer: number | null = null

  // ---------------------------------------------
  // TOAST SYSTEM
  // ---------------------------------------------
  interface ToastMessage {
    id: number
    type: 'lead' | 'final' | 'score'
    text: string
    icon?: string
  }
  const toasts = ref<ToastMessage[]>([])

  function showToast(type: ToastMessage['type'], text: string, icon?: string) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, type, text, icon })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  }

  // ---------------------------------------------
  // LIVE GAME INDICATOR
  // ---------------------------------------------
  const hasLiveGames = computed(() => store.games.some(g => g.status === 'In Progress'))

  // ---------------------------------------------
  // MAIN REFRESH OPERATION
  // ---------------------------------------------
  async function refreshGames(manual = false) {
    try {
      if (manual) isManualRefreshing.value = true

      await store.fetchUpcomingGames(
        selectedYear.value,
        selectedSeasonType.value,
        selectedWeek.value
      )

      lastUpdated.value = new Date()

      // Scoring play checking
      for (const g of store.games) {
        if (g.status === 'In Progress') {
          const lastText = await getLatestScoringPlayText(g)

          // scoring play logic omitted for brevity
        }
      }

      // Progress bar for live games
      if (hasLiveGames.value) startProgressTimer()
      else refreshProgress.value = 100
    } finally {
      if (manual) setTimeout(() => (isManualRefreshing.value = false), 300)
    }
  }

  // ---------------------------------------------
  // SUBMIT = FULL REFRESH
  // ---------------------------------------------
  function submitControls() {
    stopAutoRefresh()
    refreshGames(true)
  }
  // ---------------------------------------------
  // SUBMIT = REFRESH Scores By Week
  // ---------------------------------------------
  async function runImportScoresWeek() {
    loading.value = true
    const raw = selectedSeasonType.value

    let seasonType123: 1 | 2 | 3
    if (raw === 1 || raw === 2 || raw === 3) {
      seasonType123 = raw
    } else {
      throw new Error(`Invalid season type: ${raw}`)
    }

    try {
      const res = await JobsApi.kickoffScoreboardByWeek(
        selectedYear.value,
        seasonType123,
        selectedWeek.value
      )
      toast.add({
        severity: 'success',
        summary: 'Job started',
        detail: `Scoreboard job #${res.id ?? 'N/A'} queued`,
      })
      //setTimeout(() => {refreshGames(true) }, 3000)
      await new Promise(resolve => setTimeout(resolve, 3000))
      refreshGames(true)
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Failed to start job',
        detail: err.message ?? 'Unknown error',
      })
    } finally {
      loading.value = false
    }
  }
  // ---------------------------------------------
  // AUTO REFRESH LOGIC (clean)
  // ---------------------------------------------
  function stopAutoRefresh() {
    if (intervalHandle) clearInterval(intervalHandle)
    if (progressTimer) clearInterval(progressTimer)
    intervalHandle = null
    progressTimer = null
  }

  function startProgressTimer() {
    if (!hasLiveGames.value) {
      refreshProgress.value = 100
      return
    }

    stopAutoRefresh()

    const total = 35000
    const start = performance.now()

    refreshProgress.value = 0

    progressTimer = window.setInterval(() => {
      if (!hasLiveGames.value) {
        refreshProgress.value = 100
        stopAutoRefresh()
        return
      }

      const elapsed = performance.now() - start
      refreshProgress.value = Math.min(100, (elapsed / total) * 100)
    }, 200)

    intervalHandle = window.setInterval(() => {
      refreshGames(false)
    }, 35000)
  }

  // ---------------------------------------------
  // WATCH LIVE GAMES
  // ---------------------------------------------
  watch(hasLiveGames, live => {
    if (live) startProgressTimer()
    else stopAutoRefresh()
  })

  // ---------------------------------------------
  // EXPOSE PUBLIC API
  // ---------------------------------------------
  return {
    store,

    selectedYear,
    selectedSeasonType,
    selectedWeek,
    weekOptions,

    lastUpdated,
    refreshProgress,
    isManualRefreshing,
    loading,
    toasts,

    submitControls,
    refreshGames,
    runImportScoresWeek,
  }
}
