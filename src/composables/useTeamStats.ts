
// src/composables/useTeamStats.ts
import { ref, computed } from 'vue'
import type { TeamStats, StatsCalculationContext } from '@/services/stats/types'
import { TeamStatsService } from '@/services/stats/TeamStatsService'

export function useTeamStats(statsService: TeamStatsService = new TeamStatsService()) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const homeTeamStats = ref<TeamStats | null>(null)
  const awayTeamStats = ref<TeamStats | null>(null)

  /**
   * Loads statistics for both home and away teams
   */
  const loadBothTeamStats = async (
    homeTeamContext: StatsCalculationContext,
    awayTeamContext: StatsCalculationContext
  ) => {
    loading.value = true
    error.value = null

    try {
      const [homeStats, awayStats] = await statsService.getMultipleTeamStats([
        homeTeamContext,
        awayTeamContext
      ])

      homeTeamStats.value = homeStats
      awayTeamStats.value = awayStats
    } catch (err) {
      error.value = 'Failed to load team statistics'
      console.error('Error loading team statistics:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Loads statistics for a single team
   */
  const loadTeamStats = async (context: StatsCalculationContext): Promise<TeamStats | null> => {
    loading.value = true
    error.value = null

    try {
      return await statsService.getTeamStats(context)
    } catch (err) {
      error.value = 'Failed to load team statistics'
      console.error('Error loading team statistics:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Clears all loaded statistics
   */
  const clearStats = () => {
    homeTeamStats.value = null
    awayTeamStats.value = null
    error.value = null
  }

  /**
   * Computed property to check if both team stats are loaded
   */
  const bothStatsLoaded = computed(() => {
    return !!(homeTeamStats.value && awayTeamStats.value)
  })

  return {
    // State
    loading,
    error,
    homeTeamStats,
    awayTeamStats,
    bothStatsLoaded,
    
    // Actions
    loadBothTeamStats,
    loadTeamStats,
    clearStats
  }
}