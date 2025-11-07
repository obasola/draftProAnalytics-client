<!-- src/components/game/GameList.vue -->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { FilterMatchMode } from 'primevue/api'
import GameCreateForm from '@/components/game/GameCreateForm.vue'
import GameEditForm from '@/components/game/GameEditForm.vue'
import { useThemeStore } from '@/stores/theme.store'

const themeStore = useThemeStore()
const gameStore = useGameStore()
const router = useRouter()

// sensible default: regular season year in view
const seasonYear = ref<number>(new Date().getFullYear())

// Server pagination state (PrimeVue uses 0-based paging; server is 1-based)
const rows = ref(10)
const first = ref(0)

// Modal
const showCreateModal = ref(false)

// Filters (PrimeVue UI filters; server still governs the data size)
const filters = ref({
  seasonYear: { value: null, matchMode: FilterMatchMode.CONTAINS },
  'homeTeam.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  gameLocation: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

onMounted(async () => {
  await themeStore.loadTeams() // Ensure teams are loaded
  await gameStore.fetchAll(1, rows.value, { year: seasonYear.value }) // first load
})

// When the year changes, reload page 1
watch(seasonYear, async (y) => {
  first.value = 0
  await gameStore.fetchAll(1, rows.value, { year: y })
})

// PrimeVue page event (server-side)
const onPage = async (event: any) => {
  const page = event.page + 1
  const limit = event.rows
  first.value = event.first
  rows.value = limit
  await gameStore.fetchAll(page, limit, { year: seasonYear.value })
}

const viewGame = (id: number) => router.push(`/games/${id}?mode=read`)
const editGame = (id: number) => router.push(`/games/${id}?mode=edit`)
const createGame = () => { showCreateModal.value = true }

const deleteGame = async (id: number) => {
  if (!confirm('Are you sure you want to delete this game?')) return
  await gameStore.remove(id)
  // reload current page
  const page = Math.floor(first.value / rows.value) + 1
  await gameStore.fetchAll(page, rows.value, { year: seasonYear.value })
}

const onGameCreated = async () => {
  showCreateModal.value = false
  // reload current page
  const page = Math.floor(first.value / rows.value) + 1
  await gameStore.fetchAll(page, rows.value, { year: seasonYear.value })
}

// Helpers
const getTeamShortNameAndLogo = (team: any): { shortName: string; logoPath: string } => {
  // If team object exists, use it
  if (team && team.name && team.conference) {
    const nameParts = team.name.trim().split(' ')
    const shortName = nameParts[nameParts.length - 1]
    const fileExt = shortName === 'Chargers' ? 'webp' : 'avif'
    const logoFile = `${shortName}.${fileExt}`
    return { shortName, logoPath: `/images/${team.conference.toLowerCase()}/${logoFile}` }
  }

  // Fallback: lookup by ID if team object missing
  if (typeof team === 'number') {
    const foundTeam = themeStore.teams.find(t => Number(t.id) === team)
    if (foundTeam) {
      return getTeamShortNameAndLogo(foundTeam)
    }
  }

  return { shortName: 'Unknown', logoPath: '' }
}

const isWinningScore = (score1: number | undefined, score2: number | undefined) => {
  if (score1 == null || score2 == null) return false
  return score1 > score2
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
</script>

<template>
  <div class="team-list">
    <div class="list-header bg-team-primary text-team-accent">
      <div class="flex items-center gap-3">
        <label class="font-semibold">Game Schedule</label>
        <input v-model.number="seasonYear" type="number" class="p-inputtext p-component w-28" min="2000" max="2100" />
      </div>
      <Button @click="createGame" label="Create Game" icon="pi pi-plus" class="p-button-success" />
    </div>

    <DataTable :value="gameStore.games" :loading="gameStore.loading" dataKey="id" :lazy="true" paginator :rows="rows"
      :first="first" :totalRecords="gameStore.pagination?.total || 0" :rowsPerPageOptions="[10, 20, 50, 100]"
      @page="onPage" responsiveLayout="scroll" sortMode="single"
      :globalFilterFields="['seasonYear', 'homeTeam.name', 'awayTeam.name', 'gameLocation']" filterDisplay="menu"
      :filters="filters" showGridlines class="themed-datatable">
      <Column field="seasonYear" header="Season" sortable />
      <Column header="Week" sortable sortField="gameWeek">
        <template #body="{ data }">
          <span v-if="data.seasonType">Pre {{ data.seasonType }}</span>
          <span v-else-if="data.gameWeek">Week {{ data.gameWeek }}</span>
          <span v-else>-</span>
        </template>
      </Column>
      <Column field="gameDate" header="Date" sortable dataType="date">
        <template #body="{ data }">
          <span v-if="data.gameDate">{{ new Date(data.gameDate).toLocaleDateString() }}</span>
          <span v-else>TBD</span>
        </template>
      </Column>
      <Column header="Matchup" sortField="homeTeam.name">
        <template #body="{ data }">
          <div class="matchup-cell">
            <!-- Away Team -->
            <div class="team away-team" :class="{ 'winning-team': isWinningScore(data.awayScore, data.homeScore) }">
              <img v-if="data.awayTeam" :src="getTeamShortNameAndLogo(data.awayTeam).logoPath"
                :alt="getTeamShortNameAndLogo(data.awayTeam).shortName" class="team-logo" />
              <span>{{ getTeamShortNameAndLogo(data.awayTeam).shortName }}</span>
            </div>

            <span class="at-symbol">@</span>

            <!-- Home Team -->
            <div class="team home-team" :class="{ 'winning-team': isWinningScore(data.homeScore, data.awayScore) }">
              <img v-if="data.homeTeam" :src="getTeamShortNameAndLogo(data.homeTeam).logoPath"
                :alt="getTeamShortNameAndLogo(data.homeTeam).shortName" class="team-logo" />
              <span>{{ getTeamShortNameAndLogo(data.homeTeam).shortName }}</span>
            </div>
          </div>

        </template>
      </Column>
      <Column header="Score" sortField="homeScore">
        <template #body="{ data }">
          <span v-if="data.homeScore != null && data.awayScore != null">
            {{ data.awayScore }} - {{ data.homeScore }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>
      </Column>
      <Column field="gameLocation" header="Location" sortable>
        <template #body="{ data }">
          <span v-if="data.gameLocation">{{ data.gameLocation }}</span>
          <span v-else-if="data.gameCity && data.gameStateProvince">{{ data.gameCity }}, {{ data.gameStateProvince
          }}</span>
          <span v-else-if="data.gameCity">{{ data.gameCity }}</span>
          <span v-else-if="data.homeTeam && data.homeTeam.city">{{ data.homeTeam.city }}</span>
          <span v-else class="text-muted">TBD</span>
        </template>
      </Column>
      <Column field="gameStatus" header="Status" sortable>
        <template #body="{ data }">
          <span class="status-badge px-2 py-1 rounded text-xs font-medium" :class="getStatusClass(data.gameStatus)">
            {{ data.gameStatus || 'SCHEDULED' }}
          </span>
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button @click="viewGame(data.id)" icon="pi pi-eye" class="p-button-info p-button-sm" v-tooltip="'View'" />
            <Button @click="editGame(data.id)" icon="pi pi-pencil" class="p-button-warning p-button-sm"
              v-tooltip="'Edit'" />
            <Button @click="deleteGame(data.id)" icon="pi pi-trash" class="p-button-danger p-button-sm"
              v-tooltip="'Delete'" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showCreateModal" modal header="Create New Game" :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <GameCreateForm @game-created="onGameCreated" @cancel="() => (showCreateModal = false)" />
    </Dialog>
  </div>
</template>

<style scoped>
.team-list {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.text-muted {
  color: #6c757d;
  font-style: italic;
}

.matchup-cell {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.team {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.team-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  vertical-align: middle;
}

.at-symbol {
  font-weight: bold;
  margin: 0 0.25rem;
}

/* keep your themed look */
.themed-datatable {}

/* Directional winner checkmark alignment */
.away-team.winning-team::before {
  content: '✔';
  color: #22c55e;
  font-weight: bold;
  margin-right: 0.25em;
}

.home-team.winning-team::after {
  content: '✔';
  color: #22c55e;
  font-weight: bold;
  margin-left: 0.25em;
}
</style>
