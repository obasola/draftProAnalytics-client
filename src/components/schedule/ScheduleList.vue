<!-- sports_mgmt_app_client/src/components/schedule/scheduleList.vue -->
<template>
  <div class="schedule-list">
    <div class="list-header bg-team-primary text-team-accent p-4 rounded-lg shadow-lg mb-6">
      <h2 class="text-2xl font-bold">
        <span v-if="currentTeam">{{ currentTeam.name }}</span>
        Schedules
      </h2>
      <ThemedButton @click="createSchedule" label="Create Schedule" icon="pi pi-plus" variant="secondary" />
    </div>

    <DataTable :value="enrichedSchedules" :loading="scheduleStore.loading" dataKey="id" :lazy="true" :paginator="true"
      :rows="rows" :first="first" :totalRecords="totalRecords" :rowsPerPageOptions="[5, 10, 20, 50]" @page="onPage"
      responsiveLayout="scroll" sortMode="multiple" :globalFilterFields="['gameLocation', 'gameCity']"
      class="themed-datatable">
      <Column field="seasonYear" header="Season" sortable>
        <template #body="{ data }">
          <span class="font-semibold text-team-primary">{{ data.seasonYear }}</span>
        </template>
      </Column>

      <Column field="gameWeek" header="Week" sortable>
        <template #body="{ data }">
          <div class="week-badge bg-team-secondary text-team-accent px-2 py-1 rounded text-sm font-medium">
            Week {{ data.gameWeek || 'TBD' }}
          </div>
        </template>
      </Column>

      <Column field="gameDate" header="Game Date" sortable>
        <template #body="{ data }">
          <span class="text-gray-700">{{ formatDate(data.gameDate) }}</span>
        </template>
      </Column>

      <!-- ✅ FIXED: Use enriched team objects -->
      <Column header="Matchup">DPA
        <template #body="{ data }">
          <div class="matchup">
            <span class="team">
              <img :src="getTeamLogo(data.awayTeam)" :alt="data.awayTeam.name" class="inline-logo" />
              {{ data.awayTeam?.name || 'TBD' }}
            </span>
            <span class="mx-1">@</span>
            <span class="team">
              <div v-if="data.homeTeam">
                <img :src="getTeamLogo(data.homeTeam)" :alt="data.homeTeam.name" class="inline-logo" />
              </div>
              {{ data.homeTeam?.name || 'TBD' }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="gameLocation" header="Location">
        <template #body="{ data }">
          <span class="text-gray-600">{{ data.gameLocation || 'TBD' }}</span>
        </template>
      </Column>

      <Column field="awayScore" header="Away Score" sortable>
        <template #body="{ data }">
          <div v-if="data.awayScore != null" class="score-display opp-score"
            :class="{ 'winning-score': isWinningScore(data.awayScore, data.homeScore) }">
            {{ data.awayScore }}
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>
      </Column>

      <Column field="homeScore" header="Home Score" sortable>
        <template #body="{ data }">
          <div v-if="data.homeScore != null" class="score-display team-score"
            :class="{ 'winning-score': isWinningScore(data.homeScore, data.awayScore) }">
            {{ data.homeScore }}
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>
      </Column>

      <Column field="gameStatus" header="Status">
        <template #body="{ data }">
          <span class="status-badge px-2 py-1 rounded text-xs font-medium" :class="getStatusClass(data.gameStatus)">
            {{ formatStatus(data.gameStatus) }}
          </span>
        </template>
      </Column>

      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <ThemedButton @click="viewSchedule(data.id)" icon="pi pi-eye" variant="neutral" size="small"
              v-tooltip="'View'" />
            <ThemedButton @click="editSchedule(data.id)" icon="pi pi-pencil" variant="primary" size="small"
              v-tooltip="'Edit'" :disabled="auth.role === 1" severity="secondary" />
            <ThemedButton @click="deleteSchedule(data.id)" icon="pi pi-trash" variant="danger" size="small"
              v-tooltip="'Delete'" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Debug Info (remove in production) -->
    <div v-if="false" class="mt-4 p-4 bg-gray-100 rounded text-xs">
      <p>Teams loaded: {{ teams.length }}</p>
      <p>Schedules: {{ scheduleStore.schedules.length }}</p>
      <p>Total records: {{ totalRecords }}</p>
      <p>Pagination: {{ JSON.stringify(scheduleStore.pagination) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useThemeStore } from '@/stores/theme.store'
import { useTeamColors } from '@/composables/useTeamColors'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ThemedButton from '@/components/ThemedButton.vue'
import TeamAwareTag from '@/components/TeamAwareTag.vue'
import GameResultTag from '@/components/GameResultTag.vue'
import type { Team } from '@/types/team.types'
import { useAuthStore } from "@/modules/auth/application/authStore";
import { getTeamLogoInfo, type TeamRef } from '@/util/teamLogo'

const auth = useAuthStore();
const scheduleStore = useScheduleStore()
const themeStore = useThemeStore()
const router = useRouter()
const { currentTeam } = useTeamColors()

const rows = ref(10)
const first = ref(0)
const { teams } = storeToRefs(themeStore)

// ✅ FIXED: Compute total records for pagination
const totalRecords = computed(() => {
  const total = scheduleStore.pagination?.total
  console.log('📊 Total records for pagination:', total)
  return total ?? scheduleStore.schedules.length
})

// ✅ FIXED: Enrich schedules with actual team objects
const enrichedSchedules = computed(() => {
  if (teams.value.length === 0) {
    console.warn('⚠️ Teams not loaded yet')
    return scheduleStore.schedules
  }

  return scheduleStore.schedules.map(schedule => {
    const homeTeam = findTeamById(schedule.teamId)
    const awayTeam = findTeamById(schedule.oppTeamId)

    if (!homeTeam || !awayTeam) {
      console.warn(`⚠️ Missing team for schedule ${schedule.id}:`, {
        homeTeamId: schedule.teamId,
        awayTeamId: schedule.oppTeamId,
        homeTeamFound: !!homeTeam,
        awayTeamFound: !!awayTeam
      })
    }

    return {
      ...schedule,
      homeTeam,
      awayTeam
    }
  })
})

onMounted(async () => {
  console.log('🔄 Component mounting...')

  // CRITICAL: Load teams FIRST
  if (teams.value.length === 0) {
    console.log('📥 Loading teams...')
    await themeStore.initializeTheme()
    console.log('✅ Teams loaded:', teams.value.length)
  }

  // Then load schedules
  console.log('📥 Loading schedules...')
  await scheduleStore.fetchAll(1, rows.value)
  console.log('✅ Schedules loaded:', scheduleStore.schedules.length)
  console.log('📊 Pagination:', scheduleStore.pagination)
})

const onPage = async (event: any) => {
  console.log('📄 Page event:', event)
  const page = event.page + 1
  const limit = event.rows
  first.value = event.first
  rows.value = limit
  await scheduleStore.fetchAll(page, limit)
}

function asTeamRef(team: any): TeamRef | null {
  if (!team || !team.name || !team.conference) return null
  return {
    name: team.name,
    conference: team.conference,
  }
}

const getTeamLogo = (team: any): string => {
  const info = getTeamLogoInfo(asTeamRef(team))
  // alert("Logo: "+ info.logoUrl);
  return info.logoUrl
}
const viewSchedule = (id: number) => router.push(`/schedules/${id}?mode=read`)
const editSchedule = (id: number) => router.push(`/schedules/${id}?mode=edit`)
const createSchedule = () => router.push('/schedules?mode=create')

const deleteSchedule = async (id: number) => {
  if (!confirm('Are you sure you want to delete this schedule?')) return
  await scheduleStore.remove(id)
  const page = Math.floor(first.value / rows.value) + 1
  await scheduleStore.fetchAll(page, rows.value, true)
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'TBD'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatStatus = (status: string | undefined) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getStatusClass = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'scheduled': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'postponed': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// ✅ FIXED: Simple, reliable team lookup by numeric ID
const findTeamById = (teamId: number | string | undefined): Team | undefined => {
  if (teamId == null) return undefined

  const numericId = typeof teamId === 'number' ? teamId : parseInt(String(teamId), 10)

  if (isNaN(numericId)) {
    console.warn('⚠️ Invalid team ID:', teamId)
    return undefined
  }

  return teams.value.find(t => Number(t.id) === numericId)
}

const isWinningScore = (score1: number | undefined, score2: number | undefined) => {
  if (score1 == null || score2 == null) return false
  return score1 > score2
}
</script>

<style scoped>
.schedule-list {
  @apply w-full;
}

.list-header {
  @apply flex justify-between items-center;
}

.action-buttons {
  @apply flex gap-2;
}

.week-badge {
  @apply inline-block;
}

.opponent-info {
  @apply flex flex-col;
}

.opponent-colors {
  @apply flex gap-1;
}

.color-dot {
  @apply w-3 h-3 rounded-full border border-gray-300;
}

.score-display {
  @apply px-2 py-1 rounded text-sm font-bold text-center;
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.score-display.winning-score {
  background-color: var(--team-secondary);
  color: var(--team-accent);
}

.score-display.team-score.winning-score {
  background-color: var(--team-primary);
}

.themed-datatable {
  @apply shadow-lg rounded-lg overflow-hidden;
}

.matchup {
  @apply flex items-center gap-1;
}

.team {
  @apply font-semibold;
}

.status-badge {
  @apply inline-block;
}
</style>