<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import { gameService } from '@/services/gameService'
import type { Game } from '@/types'

const props = defineProps<{
  readonly teamId: number
  readonly playoffYear?: number
}>()

type PlayoffResult = 'W' | 'L' | 'T'

interface TeamPlayoffGameRow {
  readonly id: number
  readonly roundName: string
  readonly opponentName: string
  readonly result: PlayoffResult
  readonly teamScore: number
  readonly opponentScore: number
  readonly venue: 'Home' | 'Away'
  readonly gameDate?: string | Date | null
}

const ROUND_LABELS: Readonly<Record<string, string>> = {
  WILDCARD: 'Wild Card',
  WILD_CARD: 'Wild Card',
  WILD_CARD_ROUND: 'Wild Card',
  DIVISIONAL: 'Divisional Round',
  DIVISIONAL_ROUND: 'Divisional Round',
  CONFERENCE: 'Conference Championship',
  CONFERENCE_CHAMPIONSHIP: 'Conference Championship',
  SUPERBOWL: 'Super Bowl',
  SUPER_BOWL: 'Super Bowl',
}

const ROUND_ORDER: Readonly<Record<string, number>> = {
  'Wild Card': 1,
  'Divisional Round': 2,
  'Conference Championship': 3,
  'Super Bowl': 4,
}

const games = ref<readonly Game[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const formatRoundName = (round?: string | null): string => {
  if (!round) return 'Playoff Game'

  const normalized = round.trim().toUpperCase().replace(/[\s-]+/g, '_')
  const knownLabel = ROUND_LABELS[normalized]
  if (knownLabel) return knownLabel

  return normalized
    .split('_')
    .filter(Boolean)
    .map((word) => `${word.charAt(0)}${word.slice(1).toLowerCase()}`)
    .join(' ')
}

const rows = computed<readonly TeamPlayoffGameRow[]>(() =>
  games.value
    .filter((game) => game.seasonType === 3 || game.isPlayoff === true)
    .filter(
      (game) =>
        (game.gameStatus === 'final' || game.gameStatus === 'completed') &&
        game.homeScore !== null &&
        game.homeScore !== undefined &&
        game.awayScore !== null &&
        game.awayScore !== undefined,
    )
    .map((game) => {
      const isHome = game.homeTeamId === props.teamId
      const teamScore = isHome ? game.homeScore! : game.awayScore!
      const opponentScore = isHome ? game.awayScore! : game.homeScore!
      const opponent = isHome ? game.awayTeam : game.homeTeam

      let result: PlayoffResult = 'T'
      if (teamScore > opponentScore) result = 'W'
      else if (teamScore < opponentScore) result = 'L'

      return {
        id: game.id,
        roundName: formatRoundName(game.playoffRound),
        opponentName: opponent?.name ?? `Team ${isHome ? game.awayTeamId : game.homeTeamId}`,
        result,
        teamScore,
        opponentScore,
        venue: isHome ? 'Home' : 'Away',
        gameDate: game.gameDate,
      }
    })
    .sort((left, right) => {
      const roundDifference =
        (ROUND_ORDER[left.roundName] ?? Number.MAX_SAFE_INTEGER) -
        (ROUND_ORDER[right.roundName] ?? Number.MAX_SAFE_INTEGER)

      if (roundDifference !== 0) return roundDifference

      const leftDate = left.gameDate ? new Date(left.gameDate).getTime() : 0
      const rightDate = right.gameDate ? new Date(right.gameDate).getTime() : 0
      return leftDate - rightDate
    }),
)

const resultLabel = (result: PlayoffResult): string => {
  if (result === 'W') return 'Win'
  if (result === 'L') return 'Loss'
  return 'Tie'
}

const resultSeverity = (result: PlayoffResult): 'success' | 'danger' | 'warn' => {
  if (result === 'W') return 'success'
  if (result === 'L') return 'danger'
  return 'warn'
}

const load = async (): Promise<void> => {
  if (props.playoffYear === undefined) {
    games.value = []
    return
  }

  loading.value = true
  errorMessage.value = null

  try {
    games.value = await gameService.getTeamSeasonGames(props.teamId, props.playoffYear)
  } catch (error) {
    console.error('Failed to load playoff games:', error)
    games.value = []
    errorMessage.value = 'Unable to load playoff results.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => [props.teamId, props.playoffYear] as const, load)
</script>

<template>
  <div class="playoff-results">
    <div v-if="loading" class="loading-state">
      <ProgressSpinner stroke-width="4" />
    </div>

    <Message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <Message v-else-if="rows.length === 0" severity="info" :closable="false">
      No completed playoff games exist for the selected season.
    </Message>

    <DataTable v-else :value="rows" data-key="id" responsive-layout="scroll" striped-rows>
      <Column field="roundName" header="Round" />

      <Column field="opponentName" header="Opponent" />

      <Column header="Result">
        <template #body="{ data }">
          <Tag
            :value="resultLabel(data.result)"
            :severity="resultSeverity(data.result)"
          />
        </template>
      </Column>

      <Column header="Score">
        <template #body="{ data }">
          {{ data.teamScore }} - {{ data.opponentScore }}
        </template>
      </Column>

      <Column field="venue" header="Venue" />
    </DataTable>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
</style>
