<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useThemeStore } from '@/stores/theme.store'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

interface Props {
  teamId: number
  initialSeasonYear?: number
}

const props = defineProps<Props>()

const gameStore = useGameStore()
const themeStore = useThemeStore()

// Lazy-load GameReadOnly to avoid upfront bundle cost
const GameReadOnly = defineAsyncComponent(() =>
  import('@/components/game/GameReadOnly.vue')
)

// Filters
const seasonYear = ref<number>(props.initialSeasonYear || new Date().getFullYear())
const seasonType = ref<number>(2) // Default: regular season

// UI state
const loading = ref(false)
const dialogVisible = ref(false)
const selectedGameId = ref<number | null>(null)
const initialized = ref(false)
const scheduleRows = ref<any[]>([])

const seasonTypes = [
  { label: 'Preseason', value: 1 },
  { label: 'Regular Season', value: 2 },
  { label: 'Postseason', value: 3 }
]

const loadSchedule = async () => {
  if (!props.teamId) return
  loading.value = true
  try {
    await themeStore.loadTeams()
    let resp
    switch (seasonType.value) {
      case 1:
        resp = await gameStore.fetchTeamPreseason(props.teamId, seasonYear.value)
        break
      case 2:
        resp = await gameStore.fetchTeamSeason(props.teamId, seasonYear.value)
        break
      case 3:
        // TODO: replace with postseason endpoint when implemented
        resp = await gameStore.fetchTeamSeason(props.teamId, seasonYear.value)
        break
    }
    scheduleRows.value = resp?.data || gameStore.games
  } catch (err) {
    console.error('Failed to load team schedule:', err)
    scheduleRows.value = []
  } finally {
    loading.value = false
  }
}

const onAccordionExpand = async () => {
  if (!initialized.value) {
    initialized.value = true
    await loadSchedule()
  }
}

const viewGame = (id: number) => {
  selectedGameId.value = id
  dialogVisible.value = true
}

const getTeamShortNameAndLogo = (team: any): { shortName: string; logoPath: string } => {
  if (team && team.name && team.conference) {
    const parts = team.name.trim().split(' ')
    const shortName = parts[parts.length - 1]
    const fileExt = shortName === 'Chargers' ? 'webp' : 'avif'
    const logoFile = `${shortName}.${fileExt}`
    return { shortName, logoPath: `/images/${team.conference.toLowerCase()}/${logoFile}` }
  }
  if (typeof team === 'number') {
    const found = themeStore.teams.find(t => Number(t.id) === team)
    if (found) return getTeamShortNameAndLogo(found)
  }
  return { shortName: 'Unknown', logoPath: '' }
}

onMounted(() => {
  // intentionally lazy-loaded on accordion expand
})
</script>

<template>
  <div class="schedule-section" @accordiontab-open="onAccordionExpand">
    <div class="filters">
      <div class="filter-group">
        <label>Season:</label>
        <input
          v-model.number="seasonYear"
          type="number"
          class="p-inputtext p-component w-28"
          min="2000"
          max="2100"
        />
      </div>

      <div class="filter-group">
        <label>Type:</label>
        <Dropdown
          v-model="seasonType"
          :options="seasonTypes"
          optionLabel="label"
          optionValue="value"
          class="w-44"
        />
      </div>

      <Button label="Submit" icon="pi pi-search" class="p-button-primary" @click="loadSchedule" />
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spinner pi-spin"></i> Loading schedule...
    </div>

    <div v-else class="table-container">
      <DataTable
        :value="scheduleRows"
        :loading="loading"
        responsiveLayout="scroll"
        dataKey="id"
        showGridlines
        class="themed-datatable"
      >
        <Column header="Week" sortField="gameWeek">
          <template #body="{ data }">
            <span v-if="data.seasonType === 1">Pre {{ data.seasonType }}</span>
            <span v-else-if="data.gameWeek">Week {{ data.gameWeek }}</span>
            <span v-else>-</span>
          </template>
        </Column>
        <Column field="gameDate" header="Date" sortable>
          <template #body="{ data }">
            <span v-if="data.gameDate">{{ new Date(data.gameDate).toLocaleDateString() }}</span>
            <span v-else>TBD</span>
          </template>
        </Column>
        <Column header="Matchup" sortField="homeTeam.name">
          <template #body="{ data }">
            <div class="matchup-cell">
              <div class="team">
                <img
                  v-if="data.awayTeam"
                  :src="getTeamShortNameAndLogo(data.awayTeam).logoPath"
                  :alt="getTeamShortNameAndLogo(data.awayTeam).shortName"
                  class="team-logo"
                />
                <span>{{ getTeamShortNameAndLogo(data.awayTeam).shortName }}</span>
              </div>
              <span class="at-symbol">@</span>
              <div class="team">
                <img
                  v-if="data.homeTeam"
                  :src="getTeamShortNameAndLogo(data.homeTeam).logoPath"
                  :alt="getTeamShortNameAndLogo(data.homeTeam).shortName"
                  class="team-logo"
                />
                <span>{{ getTeamShortNameAndLogo(data.homeTeam).shortName }}</span>
              </div>
            </div>
          </template>
        </Column>
        <Column header="Score">
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
            <span v-else-if="data.gameCity && data.gameStateProvince">
              {{ data.gameCity }}, {{ data.gameStateProvince }}
            </span>
            <span v-else-if="data.homeTeam && data.homeTeam.city">{{ data.homeTeam.city }}</span>
            <span v-else class="text-muted">TBD</span>
          </template>
        </Column>
        <Column field="gameStatus" header="Status" sortable>
          <template #body="{ data }">
            <span>{{ data.gameStatus || 'SCHEDULED' }}</span>
          </template>
        </Column>
        <Column header="Action">
          <template #body="{ data }">
            <Button
              icon="pi pi-eye"
              class="p-button-info p-button-sm"
              v-tooltip="'View Game'"
              @click="viewGame(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      header="Game Details"
      :style="{ width: '65vw' }"
      :breakpoints="{ '1199px': '85vw', '575px': '95vw' }"
    >
      <GameReadOnly v-if="selectedGameId" :id="selectedGameId" mode="read" />
    </Dialog>
  </div>
</template>

<style scoped>
.schedule-section { display:flex; flex-direction:column; gap:1rem; }
.filters {
  display:flex;
  align-items:flex-end;
  gap:1rem;
  flex-wrap:wrap;
  margin-bottom:0.5rem;
}
.filter-group label {
  display:block;
  font-weight:600;
  margin-bottom:0.25rem;
}
.table-container {
  max-height:70vh;
  overflow-y:auto;
}
.matchup-cell { display:flex; align-items:center; gap:0.25rem; }
.team { display:flex; align-items:center; gap:0.25rem; }
.team-logo { width:36px; height:36px; object-fit:contain; }
.at-symbol { font-weight:bold; margin:0 0.25rem; }
.loading-state { text-align:center; padding:1rem; color:var(--text-color-secondary); }
.text-muted { color:#6c757d; font-style:italic; }
</style>
