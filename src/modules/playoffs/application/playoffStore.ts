import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { BracketGameDto, Conference, PlayoffBracketDto } from '../domain/models'
import { playoffsApi } from '../infrastructure/http/PlayoffsApi'

const pick = <T>(arr: T[], predicate: (t: T) => boolean): T | undefined => arr.find(predicate)

export const usePlayoffsStore = defineStore('playoffsStore', () => {
  const seasonYear = ref<number>(new Date().getFullYear())
  const seasonType = ref<number>(2)
  const week = ref<number | undefined>(undefined)

  const bracket = ref<PlayoffBracketDto | null>(null)
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)

  const setSeasonContext = (payload: {
    seasonYear: number
    seasonType: number
    week?: number
  }): void => {
    seasonYear.value = payload.seasonYear
    seasonType.value = payload.seasonType
    week.value = payload.week
  }

  const fetchBracket = async (): Promise<void> => {
    isLoading.value = true
    errorMessage.value = null
    try {
      bracket.value = await playoffsApi.getBracket({
        seasonYear: seasonYear.value,
        seasonType: seasonType.value,
        week: week.value,
      })
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to load playoff bracket'
    } finally {
      isLoading.value = false
    }
  }

  const games = computed<BracketGameDto[]>(() => bracket.value?.games ?? [])

  const byConf = (conf: Conference) => games.value.filter(g => g.conference === conf)
  const nfl = computed(() => games.value.filter(g => g.conference === 'NFL'))

  const nfcWildCard = computed(() => byConf('NFC').filter(g => g.round === 'WILD_CARD'))
  const nfcDivisional = computed(() => byConf('NFC').filter(g => g.round === 'DIVISIONAL'))
  const nfcConference = computed(() => pick(byConf('NFC'), g => g.round === 'CONFERENCE') ?? null)

  const afcWildCard = computed(() => byConf('AFC').filter(g => g.round === 'WILD_CARD'))
  const afcDivisional = computed(() => byConf('AFC').filter(g => g.round === 'DIVISIONAL'))
  const afcConference = computed(() => pick(byConf('AFC'), g => g.round === 'CONFERENCE') ?? null)

  const superBowl = computed(() => pick(nfl.value, g => g.round === 'SUPER_BOWL') ?? null)

  return {
    seasonYear,
    seasonType,
    week,
    bracket,
    isLoading,
    errorMessage,

    setSeasonContext,
    fetchBracket,

    nfcWildCard,
    nfcDivisional,
    nfcConference,

    afcWildCard,
    afcDivisional,
    afcConference,

    superBowl,
  }
})
