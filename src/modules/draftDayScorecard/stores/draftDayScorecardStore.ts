import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  completeDraftPick,
  createDraftEvent,
  fetchDraftEvent,
  fetchDraftEvents,
  fetchDraftScorecard,
  fetchTeamDraftReportCard,
  markDraftPickOnClock,
  seedDraftPicks,
  updateDraftPick,
} from '../services/draftDayScorecardApi'
import type {
  CompleteDraftPickRequestDto,
  CreateDraftEventRequestDto,
  DraftEventDto,
  DraftPickDto,
  DraftPositionCountDto,
  DraftScorecardDto,
  IDraftScorecardFilters,
  DraftTeamReportCardDto,
  DraftTeamSummary,
  SeedDraftPicksRequestDto,
  UpdateDraftPickRequestDto,
} from '../types/draftDayScorecard.types'

function readErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected Draft Day Scorecard error occurred.'
}

function toGradeScore(grade: string | null): number | null {
  if (!grade) return null
  const normalized = grade.trim().toUpperCase()
  const scores: Record<string, number> = {
    'A+': 98,
    A: 95,
    'A-': 91,
    'B+': 88,
    B: 85,
    'B-': 81,
    'C+': 78,
    C: 75,
    'C-': 71,
    'D+': 68,
    D: 65,
    'D-': 61,
    F: 50,
  }
  return scores[normalized] ?? null
}

function averageNumbers(values: Array<number | null | undefined>): number | null {
  const validValues = values.filter((value): value is number => typeof value === 'number')
  if (validValues.length === 0) return null
  const total = validValues.reduce((sum, value) => sum + value, 0)
  return Math.round(total / validValues.length)
}

function getTeamName(pick: DraftPickDto): string {
  return pick.currentTeamName ?? pick.currentTeamAbbreviation ?? `Team ${pick.currentTeamId}`
}

function getTeamAbbreviation(pick: DraftPickDto): string {
  return pick.currentTeamAbbreviation ?? String(pick.currentTeamId)
}

function derivePositionCounts(picks: DraftPickDto[]): DraftPositionCountDto[] {
  const counts = new Map<string, number>()

  picks.forEach((pick) => {
    const position = pick.position?.trim()
    if (!position) return
    counts.set(position, (counts.get(position) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([position, count]) => ({
      position,
      count,
      wasNeed: false,
      needPriority: null,
    }))
    .sort((a, b) => b.count - a.count || a.position.localeCompare(b.position))
}

function deriveTeamReportCard(
  draftEvent: DraftEventDto,
  teamId: number,
  picks: DraftPickDto[],
): DraftTeamReportCardDto {
  const teamPicks = picks
    .filter((pick) => pick.currentTeamId === teamId)
    .sort((a, b) => {
      const aOverall = a.overallPick ?? a.pickNumber
      const bOverall = b.overallPick ?? b.pickNumber
      return a.round - b.round || aOverall - bOverall
    })

  const firstPick = teamPicks[0]
  const overallScore = averageNumbers(
    teamPicks.map((pick) => pick.pickScore ?? toGradeScore(pick.pickGrade)),
  )

  return {
    draftYear: draftEvent.draftYear,
    draftEventId: draftEvent.id,
    teamId,
    teamName: firstPick ? getTeamName(firstPick) : `Team ${teamId}`,
    teamAbbreviation: firstPick ? getTeamAbbreviation(firstPick) : String(teamId),
    teamLogoUrl: firstPick?.currentTeamLogoUrl ?? null,

    overallGrade: null,
    overallScore,

    valueScore: averageNumbers(
      teamPicks.map((pick) => pick.valueScore ?? toGradeScore(pick.valueGrade)),
    ),
    talentScore: averageNumbers(teamPicks.map((pick) => pick.talentScore)),
    needsFitScore: averageNumbers(
      teamPicks.map((pick) => pick.needsFitScore ?? toGradeScore(pick.needsFitGrade)),
    ),
    positionalPremiumScore: averageNumbers(teamPicks.map((pick) => pick.positionalPremiumScore)),
    boardDisciplineScore: averageNumbers(teamPicks.map((pick) => pick.boardDisciplineScore)),

    summary: null,
    bestPickSummary: null,
    questionablePickSummary: null,

    needsAddressed: [],
    needsUnaddressed: [],

    positionCounts: derivePositionCounts(teamPicks),
    picks: teamPicks,
  }
}

export const useDraftDayScorecardStore = defineStore('draftDayScorecard', () => {
  const events = ref<DraftEventDto[]>([])
  const selectedEvent = ref<DraftEventDto | null>(null)
  const scorecard = ref<DraftScorecardDto | null>(null)
  const selectedTeamReportCard = ref<DraftTeamReportCardDto | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref<string | null>(null)

  const filters = ref<IDraftScorecardFilters>({
    teamId: null,
    round: null,
    status: null,
    position: null,
    searchText: '',
    grade: null,
  })

  const picks = computed<DraftPickDto[]>(() => scorecard.value?.picks ?? [])

  const filteredPicks = computed<DraftPickDto[]>(() => {
    const currentFilters = filters.value
    const searchText = currentFilters.searchText.trim().toLowerCase()

    return picks.value.filter((pick) => {
      if (currentFilters.teamId !== null && pick.currentTeamId !== currentFilters.teamId) {
        return false
      }

      if (currentFilters.round !== null && pick.round !== currentFilters.round) {
        return false
      }

      if (currentFilters.status !== null && pick.status !== currentFilters.status) {
        return false
      }

      if (currentFilters.position !== null && pick.position !== currentFilters.position) {
        return false
      }

      if (currentFilters.grade !== null && pick.pickGrade !== currentFilters.grade) {
        return false
      }

      if (searchText.length > 0) {
        const searchableText = [
          pick.playerName,
          pick.playerFirstName,
          pick.playerLastName,
          pick.position,
          pick.college,
          pick.currentTeamName,
          pick.currentTeamAbbreviation,
          pick.analystNotes,
          pick.tradeNotes,
        ]
          .filter((value): value is string => typeof value === 'string')
          .join(' ')
          .toLowerCase()

        if (!searchableText.includes(searchText)) return false
      }

      return true
    })
  })

  const teamSummaries = computed<DraftTeamSummary[]>(() => {
    const currentEvent = scorecard.value?.draftEvent
    if (!currentEvent) return []

    const byTeamId = new Map<number, DraftPickDto[]>()

    picks.value.forEach((pick) => {
      const teamPicks = byTeamId.get(pick.currentTeamId) ?? []
      teamPicks.push(pick)
      byTeamId.set(pick.currentTeamId, teamPicks)
    })

    return Array.from(byTeamId.entries())
      .map(([teamId, teamPicks]) => {
        const firstPick = teamPicks[0]
        const picksMade = teamPicks.filter((pick) => pick.used || pick.status === 'PICKED').length
        const overallScore = averageNumbers(
          teamPicks.map((pick) => pick.pickScore ?? toGradeScore(pick.pickGrade)),
        )

        return {
          teamId,
          teamName: getTeamName(firstPick),
          teamAbbreviation: getTeamAbbreviation(firstPick),
          teamLogoUrl: firstPick.currentTeamLogoUrl ?? null,
          draftYear: currentEvent.draftYear,
          draftEventId: currentEvent.id,
          overallGrade: null,
          overallScore,
          picksMade,
          totalPicks: teamPicks.length,
          positionCounts: derivePositionCounts(teamPicks),
        }
      })
      .sort((a, b) => a.teamName.localeCompare(b.teamName))
  })

  async function loadEvents(): Promise<void> {
    loading.value = true
    errorMessage.value = null

    try {
      events.value = await fetchDraftEvents()
    } catch (error: unknown) {
      errorMessage.value = readErrorMessage(error)
    } finally {
      loading.value = false
    }
  }

  async function loadEvent(draftEventId: number): Promise<void> {
    loading.value = true
    errorMessage.value = null

    try {
      selectedEvent.value = await fetchDraftEvent(draftEventId)
    } catch (error: unknown) {
      errorMessage.value = readErrorMessage(error)
    } finally {
      loading.value = false
    }
  }

  async function loadScorecard(draftEventId: number): Promise<void> {
    loading.value = true
    errorMessage.value = null

    try {
      const result = await fetchDraftScorecard(draftEventId)
      scorecard.value = result
      selectedEvent.value = result.draftEvent
    } catch (error: unknown) {
      errorMessage.value = readErrorMessage(error)
    } finally {
      loading.value = false
    }
  }

  async function loadScorecardByDraftYear(draftYear: number): Promise<void> {
    loading.value = true
    errorMessage.value = null

    try {
      if (events.value.length === 0) {
        events.value = await fetchDraftEvents()
      }

      const event = events.value.find((draftEvent) => draftEvent.draftYear === draftYear)

      if (!event) {
        throw new Error(`No draft event exists for ${draftYear}.`)
      }

      const result = await fetchDraftScorecard(event.id)
      scorecard.value = result
      selectedEvent.value = result.draftEvent
    } catch (error: unknown) {
      errorMessage.value = readErrorMessage(error)
    } finally {
      loading.value = false
    }
  }

  async function loadTeamReportCard(draftEventId: number, teamId: number): Promise<void> {
    loading.value = true
    errorMessage.value = null

    try {
      selectedTeamReportCard.value = await fetchTeamDraftReportCard(draftEventId, teamId)
    } catch (error: unknown) {
      if (scorecard.value?.draftEvent) {
        selectedTeamReportCard.value = deriveTeamReportCard(
          scorecard.value.draftEvent,
          teamId,
          scorecard.value.picks,
        )
        errorMessage.value = null
      } else {
        errorMessage.value = readErrorMessage(error)
      }
    } finally {
      loading.value = false
    }
  }

  async function createEvent(request: CreateDraftEventRequestDto): Promise<void> {
    saving.value = true
    errorMessage.value = null

    try {
      const createdEvent = await createDraftEvent(request)
      events.value = [createdEvent, ...events.value.filter((event) => event.id !== createdEvent.id)]
      selectedEvent.value = createdEvent
    } catch (error: unknown) {
      errorMessage.value = readErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  async function seedPicks(
    draftEventId: number,
    request: SeedDraftPicksRequestDto,
  ): Promise<void> {
    saving.value = true
    errorMessage.value = null

    try {
      scorecard.value = await seedDraftPicks(draftEventId, request)
      selectedEvent.value = scorecard.value.draftEvent
    } catch (error: unknown) {
      errorMessage.value = readErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  async function saveDraftPick(
    draftPickId: number,
    request: UpdateDraftPickRequestDto,
  ): Promise<void> {
    saving.value = true
    errorMessage.value = null

    try {
      await updateDraftPick(draftPickId, request)
      if (selectedEvent.value) {
        await loadScorecard(selectedEvent.value.id)
      }
    } catch (error: unknown) {
      errorMessage.value = readErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  async function sendPickOnClock(draftPickId: number): Promise<void> {
    saving.value = true
    errorMessage.value = null

    try {
      await markDraftPickOnClock(draftPickId)
      if (selectedEvent.value) {
        await loadScorecard(selectedEvent.value.id)
      }
    } catch (error: unknown) {
      errorMessage.value = readErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  async function completePick(
    draftPickId: number,
    request: CompleteDraftPickRequestDto,
  ): Promise<void> {
    saving.value = true
    errorMessage.value = null

    try {
      await completeDraftPick(draftPickId, request)
      if (selectedEvent.value) {
        await loadScorecard(selectedEvent.value.id)
      }
    } catch (error: unknown) {
      errorMessage.value = readErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  function setFilters(nextFilters: DraftScorecardFilters): void {
    filters.value = nextFilters
  }

  function clearFilters(): void {
    filters.value = {
      teamId: null,
      round: null,
      status: null,
      position: null,
      searchText: '',
      grade: null,
    }
  }

  return {
    events,
    selectedEvent,
    scorecard,
    selectedTeamReportCard,
    loading,
    saving,
    errorMessage,
    filters,
    picks,
    filteredPicks,
    teamSummaries,

    loadEvents,
    loadEvent,
    loadScorecard,
    loadScorecardByDraftYear,
    loadTeamReportCard,
    createEvent,
    seedPicks,
    saveDraftPick,
    sendPickOnClock,
    completePick,
    setFilters,
    clearFilters,
  }
})
