// src/composables/schedule/useUpcomingGamesController.ts

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useUpcomingScheduleStore } from '@/stores/schedule/upcomingGamesStore'
import { getLatestScoringPlayText } from '@/services/schedule/scoringPlayService'
import type { UpcomingGameUI } from '@/util/schedule/upcomingGamesHelpers'

export function useUpcomingGamesController() {
  const store = useUpcomingScheduleStore()

  // --- Controls ---
  const selectedYear = ref(2025)
  const selectedSeasonType = ref(2)
  const selectedWeek = ref(11)
  

  const weekOptions = computed<number[]>(() => {
    const type = selectedSeasonType.value

    if (type === 1) return Array.from({ length: 3 }, (_, i) => i + 1)
    if (type === 2) return Array.from({ length: 18 }, (_, i) => i + 1)
    if (type === 3) return Array.from({ length: 5 }, (_, i) => i + 1)

    return [] // ← explicit fallback prevents boolean inference
  })

  // --- Refresh + progress ---
  const lastUpdated = ref<Date | null>(null)
  const isManualRefreshing = ref(false)
  const refreshProgress = ref(0)

  let intervalHandle: number | null = null
  let progressTimer: number | null = null

  // --- Toasts ---
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

  // --- Tracking Maps (typed) ---
  const previousScores = ref(
    new Map<number, { home: number | null; away: number | null; status: string }>()
  )
  const previousLeaders = ref(new Map<number, string | null>())
  const previousScoringPlay = ref(new Map<number, string>())

  // --- Live game checker ---
  const hasLiveGames = computed<boolean>(() =>
    store.games.some((g: UpcomingGameUI) => g.status === 'In Progress')
  )

  // --- Refresh logic ---
  async function refreshGames(manual = false) {
    try {
      if (manual) isManualRefreshing.value = true

      await store.fetchUpcomingGames(
        selectedYear.value,
        selectedSeasonType.value,
        selectedWeek.value
      )

      lastUpdated.value = new Date()

      // Scoring plays
      for (const g of store.games) {
        if (g.status === 'In Progress') {
          const lastText = await getLatestScoringPlayText(g)
          const prevText = previousScoringPlay.value.get(g.id)

          if (lastText && lastText !== prevText) {
            showToast('score', lastText, g.homeLogo)
            previousScoringPlay.value.set(g.id, lastText)
          }
        }
      }

      // Progress bar
      if (hasLiveGames.value) startProgressTimer()
      else refreshProgress.value = 100
    } finally {
      if (manual) setTimeout(() => (isManualRefreshing.value = false), 300)
    }
  }

  function startProgressTimer() {
    if (!hasLiveGames.value) {
      refreshProgress.value = 100
      return
    }

    if (progressTimer) clearInterval(progressTimer)
    const total = 35000
    const start = performance.now()

    refreshProgress.value = 0

    progressTimer = window.setInterval(() => {
      if (!hasLiveGames.value) {
        refreshProgress.value = 100
        clearInterval(progressTimer!)
        progressTimer = null
        return
      }
      const elapsed = performance.now() - start
      refreshProgress.value = Math.min(100, (elapsed / total) * 100)
    }, 200)
  }

  // --- Controls submit ---
  function submitControls() {
    previousScores.value.clear()
    previousLeaders.value.clear()
    previousScoringPlay.value.clear()

    if (intervalHandle) {
      clearInterval(intervalHandle)
      intervalHandle = null
    }
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
    refreshGames(true)
  }

  // --- Auto-refresh ---
  watch(
    hasLiveGames,
    isLive => {
      if (isLive) {
        if (!intervalHandle) intervalHandle = window.setInterval(() => refreshGames(false), 35000)
        startProgressTimer()
      } else {
        if (intervalHandle) {
          clearInterval(intervalHandle)
          intervalHandle = null
        }
        refreshProgress.value = 100
      }
    },
    { immediate: true }
  )

  // --- Initial load ---
  onMounted(() => {
    refreshGames(false)
  })

  onUnmounted(() => {
    if (intervalHandle) clearInterval(intervalHandle)
    if (progressTimer) clearInterval(progressTimer)
  })

  // --- Score watcher ---
  watch(
    () => store.games,
    newList => {
      newList.forEach((g: UpcomingGameUI) => {
        const prev = previousScores.value.get(g.id)

        const currentLeader =
          g.homeScore == null || g.awayScore == null
            ? null
            : g.homeScore > g.awayScore
              ? g.homeTeamName
              : g.awayScore > g.homeScore
                ? g.awayTeamName
                : 'tie'

        const prevLeader = previousLeaders.value.get(g.id)

        // Lead change
        if (
          prevLeader &&
          currentLeader &&
          prevLeader !== currentLeader &&
          currentLeader !== 'tie'
        ) {
          showToast('lead', `${currentLeader} just took the lead!`, g.homeLogo)
        }

        // Game ended
        if (prev && prev.status === 'In Progress' && g.status === 'Final') {
          showToast('final', `${g.homeTeamName} vs ${g.awayTeamName} has ended.`, g.homeLogo)
        }

        // Score change sound
        if (prev && (prev.home !== g.homeScore || prev.away !== g.awayScore)) {
          // your scoreSound.play()
        }

        previousScores.value.set(g.id, {
          home: g.homeScore,
          away: g.awayScore,
          status: g.status,
        })
        previousLeaders.value.set(g.id, currentLeader)
      })
    },
    { deep: true }
  )

  // ---------- RETURN PUBLIC API (FULLY TYPED) ----------
  return {
    // store
    store,

    // controls
    selectedYear,
    selectedSeasonType,
    selectedWeek,
    weekOptions,

    // refresh
    lastUpdated,
    refreshProgress,
    isManualRefreshing,

    // toasts
    toasts,

    // methods
    submitControls,
    refreshGames,
  }
}
