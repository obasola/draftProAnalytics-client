<template>
  <div class="team-schedule-table w-full">
    <div class="list-header bg-team-primary text-team-accent p-4 rounded-lg shadow-lg mb-6">
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <span v-if="currentTeam">{{ currentTeam.name }}</span>
        <span>Schedules</span>
      </h2>

      <div class="flex items-center gap-3">
        <label class="text-sm opacity-90">Season</label>
        <Dropdown
          v-model="seasonYear"
          :options="seasonOptions"
          optionLabel="label"
          optionValue="value"
          class="w-40"
          @change="reloadFirstPage"
        />
        <ThemedButton
          @click="createSchedule"
          label="Create Schedule"
          icon="pi pi-plus"
          variant="secondary"
        />
      </div>
    </div>

    <DataTable
      :value="scheduleStore.schedules"
      :loading="scheduleStore.loading"
      :lazy="true"
      paginator
      :rows="rows"
      :first="first"
      :totalRecords="scheduleStore.pagination?.total || 0"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      @page="onPage"
      responsiveLayout="scroll"
      sortMode="multiple"
      :globalFilterFields="['gameLocation', 'gameCity', 'oppTeamConference']"
      class="themed-datatable"
    >
      <Column field="seasonYear" header="Season" sortable>
        <template #body="{ data }">
          <span class="font-semibold text-team-primary">{{ data.seasonYear }}</span>
        </template>
      </Column>

      <Column field="scheduleWeek" header="Week" sortable>
        <template #body="{ data }">
          <div class="week-badge bg-team-secondary text-team-accent px-2 py-1 rounded text-sm font-medium">
            Week {{ data.scheduleWeek }}
          </div>
        </template>
      </Column>

      <Column field="gameDate" header="Game Date" sortable>
        <template #body="{ data }">
          <span class="text-gray-700">{{ formatDate(data.gameDate) }}</span>
        </template>
      </Column>

      <Column field="oppTeamId" header="Opponent" sortable>
        <template #body="{ data }">
          <div class="opponent-info">
            <span class="font-bold text-gray-900">{{ getOpponentName(data.oppTeamId) }}</span>
            <div class="opponent-colors mt-1" v-if="getOpponentColors(data.oppTeamId)">
              <div
                v-for="(color, index) in getOpponentColors(data.oppTeamId)"
                :key="index"
                class="color-dot"
                :style="{ backgroundColor: color }"
              />
            </div>
          </div>
        </template>
      </Column>

      <Column field="homeOrAway" header="Home/Away">
        <template #body="{ data }">
          <TeamAwareTag
            :value="data.homeOrAway || 'TBD'"
            :is-home="data.homeOrAway?.toUpperCase() === 'HOME'"
            class="home-away-tag"
          />
        </template>
      </Column>

      <Column field="gameLocation" header="Location">
        <template #body="{ data }">
          <span class="text-gray-600">{{ data.gameLocation }}</span>
        </template>
      </Column>

      <Column field="teamScore" header="Team Score" sortable>
        <template #body="{ data }">
          <div
            v-if="data.teamScore !== null && data.teamScore !== undefined"
            class="score-display team-score"
            :class="{ 'winning-score': isWinningScore(data.teamScore, data.oppTeamScore) }"
          >
            {{ data.teamScore }}
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>
      </Column>

      <Column field="oppTeamScore" header="Opp Score" sortable>
        <template #body="{ data }">
          <div
            v-if="data.oppTeamScore !== null && data.oppTeamScore !== undefined"
            class="score-display opp-score"
            :class="{ 'winning-score': isWinningScore(data.oppTeamScore, data.teamScore) }"
          >
            {{ data.oppTeamScore }}
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>
      </Column>

      <Column field="wonLostFlag" header="Result">
        <template #body="{ data }">
          <GameResultTag
            v-if="data.wonLostFlag"
            :result="data.wonLostFlag"
          />
          <span v-else class="text-gray-400 text-sm">TBD</span>
        </template>
      </Column>

      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <ThemedButton
              @click="viewSchedule(data.id)"
              icon="pi pi-eye"
              variant="neutral"
              size="small"
              v-tooltip="'View'"
            />
            <ThemedButton
              @click="editSchedule(data.id)"
              icon="pi pi-pencil"
              variant="primary"
              size="small"
              v-tooltip="'Edit'"
            />
            <ThemedButton
              @click="deleteSchedule(data.id)"
              icon="pi pi-trash"
              variant="danger"
              size="small"
              v-tooltip="'Delete'"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ThemedButton from '@/components/ThemedButton.vue'
import TeamAwareTag from '@/components/TeamAwareTag.vue'
import GameResultTag from '@/components/GameResultTag.vue'

import { useScheduleStore } from '@/stores/scheduleStore'
import { useThemeStore } from '@/stores/theme.store'
import { useTeamColors } from '@/composables/useTeamColors'

// Props
const props = defineProps<{
  teamId?: number 
  initialSeasonYear?: number
}>()

// Stores / router
const scheduleStore = useScheduleStore()
const themeStore = useThemeStore()
const router = useRouter()

// Team context + colors
const { currentTeam } = useTeamColors()
const { teams } = storeToRefs(themeStore)

// Pagination
const rows = ref(10)
const first = ref(0)

// wherever you resolve team id for queries
const numericTeamId = ref(0);

// Season picker (defaults to current year if not provided)
const nowYear = new Date().getFullYear()
const seasonYear = ref<number>(props.initialSeasonYear ?? nowYear)

// Simple 5-year window picker (opinionated default)
const seasonOptions = computed(() =>
  Array.from({ length: 6 }, (_, i) => {
    const y = nowYear - i
    return { label: `${y}`, value: y }
  })
)

const validTeamId = computed(() =>
  numericTeamId.value = Number(props.teamId) ?? Number(currentTeam?.value?.id)
)

// Fetch
const fetchPage = async (page = 1, limit = rows.value) => {
  if (!numericTeamId.value || !seasonYear.value) return
  await scheduleStore.fetchByTeamSeason(numericTeamId.value,seasonYear.value,page,limit)
}

onMounted(async () => {
  // Initialize theme palette (for opponent color dots) if needed
  if (teams.value.length === 0) {
    await themeStore.initializeTheme()
  }
  await fetchPage(1, rows.value)
})

watch([() => props.teamId, seasonYear], async () => {
  first.value = 0
  await fetchPage(1, rows.value)
})

const onPage = async (event: any) => {
  const page = event.page + 1
  const limit = event.rows
  first.value = event.first
  rows.value = limit
  await fetchPage(page, limit)
}

const reloadFirstPage = async () => {
  first.value = 0
  await fetchPage(1, rows.value)
}

// Actions
const viewSchedule = (id: number) => router.push(`/schedules/${id}?mode=read`)
const editSchedule = (id: number) => router.push(`/schedules/${id}?mode=edit`)
const createSchedule = () => router.push('/schedules?mode=create')
const deleteSchedule = async (id: number) => {
  if (confirm('Delete this game?')) {
    await scheduleStore.remove(id)
    await fetchPage(scheduleStore.currentPage, scheduleStore.itemsPerPage)
  }
}

// Helpers
const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'TBD'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getOpponentName = (oppTeamId: string | undefined): string => {
  if (!oppTeamId) return 'TBD'
  const team = teams.value.find(t => t.id === oppTeamId || t.abbreviation === oppTeamId)
  return team ? team.name : oppTeamId
}

const getOpponentColors = (oppTeamId: string | undefined): string[] | null => {
  if (!oppTeamId) return null
  const team = teams.value.find(t => t.id === oppTeamId || t.abbreviation === oppTeamId)
  return team ? [team.colors.primary, team.colors.secondary] : null
}

const isWinningScore = (a?: number, b?: number) => (a ?? -Infinity) > (b ?? -Infinity)
</script>

<style scoped>
.list-header { @apply flex justify-between items-center; }
.action-buttons { @apply flex gap-2; }
.week-badge { @apply inline-block; }
.opponent-info { @apply flex flex-col; }
.opponent-colors { @apply flex gap-1; }
.color-dot { @apply w-3 h-3 rounded-full border border-gray-300; }
.score-display { @apply px-2 py-1 rounded text-sm font-bold text-center; background-color: var(--color-neutral-100); color: var(--color-neutral-700); }
.score-display.winning-score { background-color: var(--team-secondary); color: var(--team-accent); }
.score-display.team-score.winning-score { background-color: var(--team-primary); }
.themed-datatable { @apply shadow-lg rounded-lg overflow-hidden; }
:deep(.p-datatable) { border: 1px solid var(--team-primary); }
:deep(.p-datatable .p-datatable-header) { background: linear-gradient(135deg, var(--team-primary) 0%, var(--team-secondary) 100%); color: var(--team-accent); border-bottom: 2px solid var(--team-secondary); }
:deep(.p-datatable .p-datatable-thead > tr > th) { background-color: var(--team-primary); color: var(--team-accent); border-bottom: 1px solid var(--team-secondary); font-weight: 600; }
:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) { background-color: rgba(var(--team-primary-rgb), 0.05); }
:deep(.p-datatable .p-datatable-tbody > tr:hover) { background-color: rgba(var(--team-primary-rgb), 0.1); }
:deep(.p-datatable .p-paginator) { background-color: var(--color-neutral-50); border-top: 1px solid var(--team-primary); }
:deep(.p-datatable .p-paginator .p-paginator-pages .p-paginator-page.p-highlight) { background-color: var(--team-primary); color: var(--team-accent); }
:deep(.p-datatable .p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover) { background-color: var(--team-secondary); color: var(--team-accent); }
</style>
