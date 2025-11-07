<template>
  <div class="pgHeader">
    <div class="team">
      <img v-if="selectedTeamObject" :src="getTeamShortNameAndLogo(selectedTeamObject).logoPath" class="team-logo" />
      <span v-if="selectedTeamObject">
        {{ getTeamShortNameAndLogo(selectedTeamObject).fullName }}&nbsp;Season Schedule
      </span>
      <span v-else-if="selectedTeam === 'league'">
        <img :src="getNflLogo()" class="nfl-logo" />League-wide Season Schedule
      </span>
      <span v-else>Select Team</span>
    </div>
  </div>

  <div class="schedule-container">
    <!-- Controls -->
    <div class="schedule-controls">
      <div class="control-group">
        <label for="season">Season:</label>
        <select id="season" v-model="selectedSeason" class="schedule-select" @change="loadSchedule">
          <option value="">Select Season</option>
          <option v-for="year in seasonYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>

      <div v-show="selectedTeam === 'league'" class="control-group">
        <label for="week">Season:</label>
        <select id="week" v-model="selectedWeek" class="schedule-select" @change="loadSchedule">
          <option value="0">Select Week</option>
          <option value="99">Preseason</option>
          <option v-for="week in scheduleWeeks" :key="week" :value="week">Week&nbsp;{{ week }}</option>
        </select>
      </div>

      <div class="control-group">
        <label for="schedule">Schedule:</label>
        <select id="schedule" v-model="selectedTeam" class="schedule-select" @change="loadSchedule">
          <option value="">Select Team</option>
          <option value="league">League</option>
          <option v-for="team in nflTeams" :key="team.id" :value="team.id">{{ team.name }}</option>
        </select>
      </div>
    </div>

    <!-- Info -->
    <div class="info-text">
      <span class="schedule-info">
        Select season and team to view schedule. Use Edit/Save buttons to update scores and game status.
      </span>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="message-container"><div class="loading-message">Loading schedule...</div></div>
    <div v-if="error" class="message-container"><div class="error-message">{{ error }}</div></div>

    <!-- Table -->
    <div v-if="!loading && !error && scheduleGames.length > 0" class="schedule-table-container">
      <DataTable
        :value="rowsWithKey"
        dataKey="rowKey"
        responsiveLayout="scroll"
        sortMode="single"
        :sortField="'gameWeek'"
        :sortOrder="1"
        showGridlines
        stripedRows
        class="schedule-table"
        paginator
        :rows="25"
        :rowsPerPageOptions="[10, 25, 50]"
      >
        <!-- Week -->
        <Column field="gameWeek" header="Week" sortable>
          <template #body="{ data }">
            <span v-if="data.seasonType">Pre {{ data.seasonType }}</span>
            <span v-else-if="data.gameWeek">{{ data.gameWeek }}</span>
            <span v-else>-</span>
          </template>
        </Column>

        <!-- Date -->
        <Column field="gameDate" header="Date" sortable>
          <template #body="{ data }">
            <span v-if="data.gameDate">{{ formatGameDate(data.gameDate) }}</span>
            <span v-else class="text-muted">TBD</span>
          </template>
        </Column>

        <!-- Matchup (logos + winners) -->
        <Column header="Matchup" class="matchup-column">
          <template #body="{ data }">
            <div class="matchup-display">
              <!-- Away team -->
              <div class="team-display">
                <span class="checkmark-placeholder">
                  <i v-if="isWinner(data, 'away')" class="pi pi-check winner-check"></i>
                </span>
                <img
                  v-if="data.awayTeam"
                  :src="getTeamLogo(data.awayTeam)"
                  class="team-icon"
                  :alt="getTeamShortName(data.awayTeam)"
                />
                <span class="team-name">{{ getTeamShortName(data.awayTeam) }}</span>
              </div>

              <span class="at-symbol">@</span>

              <!-- Home team -->
              <div class="team-display">
                <span class="team-name">{{ getTeamShortName(data.homeTeam) }}</span>
                <img
                  v-if="data.homeTeam"
                  :src="getTeamLogo(data.homeTeam)"
                  class="team-icon"
                  :alt="getTeamShortName(data.homeTeam)"
                />
                <span class="checkmark-placeholder">
                  <i v-if="isWinner(data, 'home')" class="pi pi-check winner-check"></i>
                </span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Stadium -->
        <Column field="gameLocation" header="Stadium">
          <template #body="{ data }"><span>{{ data.gameLocation || 'TBD' }}</span></template>
        </Column>

        <!-- Location -->
        <Column header="Location">
          <template #body="{ data }"><span>{{ formatLocation(data) }}</span></template>
        </Column>

        <!-- Status -->
        <Column field="gameStatus" header="Status" class="status-column">
          <template #body="{ data }">
            <div class="status-cell">
              <span v-if="!isRowEditing(data.id)" class="status-badge" :class="getStatusClass(data.gameStatus)">
                {{ data.gameStatus || 'SCHEDULED' }}
              </span>
              <select v-else v-model="data.gameStatus" class="status-select">
                <option v-for="status in gameStatusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </div>
          </template>
        </Column>

        <!-- Visitor Score -->
        <Column header="Visitor Score" class="score-column">
          <template #body="{ data }">
            <div class="score-cell">
              <span v-if="!isRowEditing(data.id)" class="score-display">
                {{ data.awayScore !== null ? data.awayScore : '-' }}
              </span>
              <input v-else type="number" v-model="data.awayScore" class="score-input" min="0" placeholder="0" />
            </div>
          </template>
        </Column>

        <!-- Home Score -->
        <Column header="Home Score" class="score-column">
          <template #body="{ data }">
            <div class="score-cell">
              <span v-if="!isRowEditing(data.id)" class="score-display">
                {{ data.homeScore !== null ? data.homeScore : '-' }}
              </span>
              <input v-else type="number" v-model="data.homeScore" class="score-input" min="0" placeholder="0" />
            </div>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions" class="actions-column">
          <template #body="{ data }">
            <div class="action-buttons">
              <button v-if="!isRowEditing(data.id)" @click="startEdit(data)" class="edit-btn-row" :disabled="isRowSaving(data.id)">
                <i class="pi pi-pencil"></i> Edit
              </button>
              <button v-if="isRowEditing(data.id)" @click="saveScore(data)" class="save-btn-row" :disabled="isRowSaving(data.id)">
                <i class="pi pi-check"></i> {{ isRowSaving(data.id) ? 'Saving...' : 'Save' }}
              </button>
              <button v-if="isRowEditing(data.id)" @click="cancelEdit(data)" class="cancel-btn-row" :disabled="isRowSaving(data.id)">
                <i class="pi pi-times"></i> Cancel
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No Data -->
    <div v-if="!loading && !error && scheduleGames.length === 0 && selectedSeason && selectedTeam" class="message-container">
      <div class="no-data-message">No games found for the selected season and team.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTeamStore } from '@/stores/teamStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import { Team } from '@/types'

// accept defaults from parent (kills "extraneous attrs" warning)
const props = defineProps<{ defaultSeason?: string | number; defaultTeam?: string }>()

const gameStore = useGameStore()
const teamStore = useTeamStore()
const toast = useToast()

// ---- state
const selectedSeason = ref(String(props.defaultSeason ?? '2025'))
const selectedWeek   = ref<number | string>(1)
const selectedTeam   = ref<string>(props.defaultTeam ?? '')
const seasonYearInit = 2025

const loading = ref(false)
const error = ref('')

const editingRows  = ref(new Set<number>())
const savingRows   = ref(new Set<number>())
const originalVals = ref(new Map<number, {homeScore: number|null; awayScore: number|null; gameStatus?: string}>())

const state = reactive({
  week: Number(selectedWeek.value),
  year: String(selectedSeason.value),
})

// keep year in sync
watch(selectedSeason, y => { state.year = String(y) })

// local source for the table — filled by fetch return values
const scheduleRows = ref<any[]>([])

// choices
const seasonYears = computed(() => Array.from({length: 2031-2021+1}, (_,i) => String(2021+i)))
const scheduleWeeks = computed(() => Array.from({length: 18}, (_,i) => String(i+1)))

const gameStatusOptions = [
  { value: 'SCHEDULED',  label: 'Scheduled' },
  { value: 'IN_PROGRESS',label: 'In Progress' },
  { value: 'COMPLETED',  label: 'Completed' },
  { value: 'FINAL',      label: 'Final' },
  { value: 'POSTPONED',  label: 'Postponed' },
  { value: 'CANCELLED',  label: 'Cancelled' }
]

// header logo team
const selectedTeamObject = ref<any>(null)
watch([selectedTeam, scheduleRows], async () => {
  if (!selectedTeam.value || selectedTeam.value === 'league') { selectedTeamObject.value = null; return }

  // try from current rows first
  const anyRow = scheduleRows.value.find(g =>
    String(g.homeTeamId) === selectedTeam.value || String(g.awayTeamId) === selectedTeam.value
  )
  let conference = anyRow
    ? (String(anyRow.homeTeamId) === selectedTeam.value ? anyRow.homeTeam?.conference : anyRow.awayTeam?.conference)
    : undefined

  const team = nflTeams.value.find(t => t.id === selectedTeam.value)
  if (!conference && team) {
    try {
      const teamData: Team | null = await teamStore.fetchById(Number(selectedTeam.value))
      conference = teamData?.conference
    } catch {}
  }
  selectedTeamObject.value = team ? { ...team, conference: conference || 'unknown' } : null
}, { immediate: true })

// NFL Teams
const nflTeams = ref([
  { id: '61', name: 'Arizona Cardinals' }, { id: '62', name: 'Atlanta Falcons' }, { id: '63', name: 'Baltimore Ravens' },
  { id: '65', name: 'Buffalo Bills' }, { id: '66', name: 'Carolina Panthers' }, { id: '67', name: 'Chicago Bears' },
  { id: '68', name: 'Cincinnati Bengals' }, { id: '69', name: 'Cleveland Browns' }, { id: '70', name: 'Dallas Cowboys' },
  { id: '72', name: 'Denver Broncos' }, { id: '71', name: 'Detroit Lions' }, { id: '73', name: 'Green Bay Packers' },
  { id: '93', name: 'Houston Texans' }, { id: '75', name: 'Indianapolis Colts' }, { id: '76', name: 'Jacksonville Jaguars' },
  { id: '78', name: 'Kansas City Chiefs' }, { id: '79', name: 'Las Vegas Raiders' }, { id: '95', name: 'Los Angeles Chargers' },
  { id: '77', name: 'Los Angeles Rams' }, { id: '94', name: 'Miami Dolphins' }, { id: '80', name: 'Minnesota Vikings' },
  { id: '96', name: 'New England Patriots' }, { id: '92', name: 'New Orleans Saints' }, { id: '82', name: 'New York Giants' },
  { id: '83', name: 'New York Jets' }, { id: '84', name: 'Philadelphia Eagles' }, { id: '85', name: 'Pittsburgh Steelers' },
  { id: '86', name: 'San Francisco 49ers' }, { id: '87', name: 'Seattle Seahawks' }, { id: '88', name: 'Tampa Bay Buccaneers' },
  { id: '89', name: 'Tennessee Titans' }, { id: '90', name: 'Washington Commanders' }
])

// computed used by the table (source = scheduleRows, not the store)
const scheduleGames = computed(() => {
  if (!selectedSeason.value || !selectedTeam.value) return []

  // season filter (string-safe)
  let games = scheduleRows.value.filter(g => String(g.seasonYear) === String(selectedSeason.value))

  if (selectedTeam.value !== 'league') {
    const teamId = selectedTeam.value
    games = games.filter(g => String(g.homeTeamId) === teamId || String(g.awayTeamId) === teamId)
  }

  return games.slice().sort((a, b) => {
    if (a.gameWeek !== b.gameWeek) return (a.gameWeek || 0) - (b.gameWeek || 0)
    if (a.gameDate && b.gameDate) return new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
    return 0
  })
})

// row identity for PrimeVue
const rowsWithKey = computed(() =>
  scheduleGames.value.map(r => ({
    ...r,
    rowKey: `${r.id ?? 'x'}-${r.seasonYear}-${r.gameWeek ?? 0}-${r.homeTeamId}-${r.awayTeamId}`
  }))
)

// ---- actions
const loadSchedule = async () => {
  if (!selectedSeason.value || !selectedTeam.value) return
  loading.value = true; error.value = ''

  try {
    const year = state.year
    const page = 1
    const limit = 500

    if (selectedTeam.value === 'league') {
      if (Number(selectedWeek.value) === 99) {
        const res = await gameStore.fetchLeaguePreseason(year, page, limit)
        scheduleRows.value = res.data
      } else if (Number(selectedWeek.value) >= 1) {
        const res = await gameStore.fetchLeagueWeek(year, Number(selectedWeek.value), page, limit)
        scheduleRows.value = res.data
      } else {
        const res = await gameStore.fetchByYear(year, page, limit)
        scheduleRows.value = res.data
      }
    } else {
      state.week = 0 // full season for team unless user picks a week
      const teamId = Number(selectedTeam.value)
      if (!Number.isFinite(teamId)) { error.value = 'Invalid team selected'; return }
      const res = await gameStore.fetchTeamSeason(teamId, year, page, limit)
      scheduleRows.value = res.data
    }

    // debug
    console.log('store.games length', gameStore.games.length)
    console.log('scheduleRows length', scheduleRows.value.length)
    console.log('scheduleGames length', scheduleGames.value.length)
  } catch (err) {
    console.error('Schedule load error:', err)
    error.value = 'Failed to load schedule data'
  } finally {
    loading.value = false
  }
}

// editing helpers
const startEdit = (g: any) => {
  originalVals.value.set(g.id, { homeScore: g.homeScore, awayScore: g.awayScore, gameStatus: g.gameStatus })
  editingRows.value.add(g.id)
}
const cancelEdit = (g: any) => {
  const snap = originalVals.value.get(g.id)
  if (snap) { g.homeScore = snap.homeScore; g.awayScore = snap.awayScore; g.gameStatus = snap.gameStatus }
  editingRows.value.delete(g.id); originalVals.value.delete(g.id)
}
const saveScore = async (g: any) => {
  try {
    savingRows.value.add(g.id)
    const payload = {
      homeScore: g.homeScore != null ? Number(g.homeScore) : null,
      awayScore: g.awayScore != null ? Number(g.awayScore) : null,
      gameStatus: g.gameStatus ? String(g.gameStatus).toLowerCase() : 'scheduled',
    }
    const updated = await gameStore.update(g.id, payload)
    // also update local copy so UI reflects change without refetch
    const i = scheduleRows.value.findIndex(x => x.id === g.id)
    if (i >= 0) scheduleRows.value[i] = { ...scheduleRows.value[i], ...updated }
    editingRows.value.delete(g.id); originalVals.value.delete(g.id)
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to save game changes'
    error.value = msg
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })
  } finally {
    savingRows.value.delete(g.id)
  }
}
const isRowEditing = (id: number) => editingRows.value.has(id)
const isRowSaving  = (id: number) => savingRows.value.has(id)

// formatters
const formatGameDate = (date: string | Date) => {
  if (!date) return 'TBD'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
const formatLocation = (g: any) => {
  const parts: string[] = []
  if (g.gameCity) parts.push(g.gameCity)
  if (g.gameStateProvince) parts.push(g.gameStateProvince)
  if (g.gameCountry && g.gameCountry.toUpperCase() !== 'USA') parts.push(g.gameCountry)
  return parts.length ? parts.join(', ') : 'TBD'
}

// matchup helpers
const getTeamShortName = (team: any) => {
  if (!team?.name) return 'TBD'
  const parts = team.name.trim().split(' ')
  return parts[parts.length - 1]
}
const getTeamLogo = (team: any): string => {
  if (!team?.name || !team?.conference) return ''
  const lastWord = team.name.trim().split(' ').pop()!
  const ext = lastWord === 'Chargers' ? 'webp' : 'avif'
  try {
    return new URL(`../../assets/images/${team.conference.toLowerCase()}/${lastWord}.${ext}`, import.meta.url).href
  } catch {
    return ''
  }
}
const isWinner = (g: any, side: 'home'|'away') => {
  if (g.homeScore == null || g.awayScore == null) return false
  if (g.homeScore === g.awayScore) return false
  return side === 'home' ? g.homeScore > g.awayScore : g.awayScore > g.homeScore
}

// header helpers
const getTeamShortNameAndLogo = (team: any): { fullName: string; logoPath: string } => {
  if (!team?.name || !team?.conference) return { fullName: 'Unknown', logoPath: '' }
  const parts = team.name.trim().split(' ')
  const short = parts[parts.length - 1]
  const ext = short === 'Chargers' ? 'webp' : 'avif'
  const logoPath = new URL(`../../assets/images/${team.conference.toLowerCase()}/${short}.${ext}`, import.meta.url).href
  return { fullName: team.name, logoPath }
}
function getNflLogo() { return new URL('../../images/NFLogo.jpeg', import.meta.url).href }

const getStatusClass = (status: string) => {
  const s = (status || 'scheduled').toLowerCase()
  switch (s) {
    case 'completed':
    case 'final': return 'status-completed'
    case 'in_progress': return 'status-in-progress'
    case 'postponed': return 'status-postponed'
    case 'cancelled': return 'status-cancelled'
    default: return 'status-scheduled'
  }
}

// initial load (league by year so the page isn't empty)
onMounted(async () => {
  const res = await gameStore.fetchByYear(seasonYearInit, 1, 500)
  scheduleRows.value = res.data
})
</script>

<style scoped>
.matchup-cell { display:flex; align-items:center; gap:0.25rem; }
.team { font-size:22pt; display:flex; align-items:center; gap:0.25rem; }

.nfl-logo { width:120px; height:120px; object-fit:contain; vertical-align:bottom; }
.team-logo { width:120px; height:120px; object-fit:contain; vertical-align:middle; }

.schedule-container { width:100%; }
.schedule-controls { display:flex; gap:2rem; margin-bottom:1rem; padding:1rem; background:#f8f9fa; border-radius:8px; border:1px solid #dee2e6; }
.control-group { display:flex; align-items:center; gap:0.5rem; }
.control-group label { font-weight:bold; color:#495057; min-width:70px; }
.schedule-select { padding:0.5rem; border:1px solid #ced4da; border-radius:4px; font-size:1rem; min-width:150px; }
.schedule-select:focus { outline:none; border-color:#80bdff; box-shadow:0 0 5px rgba(0,123,255,0.3); }

.info-text { margin-bottom:1rem; padding:0.75rem; background:#e3f2fd; border-radius:4px; border-left:4px solid #2196f3; }
.schedule-info { color:#1565c0; font-size:0.9rem; }

.message-container { padding:2rem; text-align:center; }
.loading-message { color:#6c757d; font-size:1.1rem; }
.error-message { color:#dc3545; font-size:1.1rem; }
.no-data-message { color:#6c757d; font-size:1.1rem; }

.schedule-table-container { border:1px solid #dee2e6; border-radius:8px; overflow:hidden; }

.matchup-display { display:flex; align-items:center; gap:0.5rem; }
.team-display { display:flex; align-items:center; gap:0.25rem; }
.checkmark-placeholder { width:20px; display:inline-flex; justify-content:center; }
.winner-check { color:#28a745; font-weight:bold; }
.team-icon { width:40px; height:40px; object-fit:contain; }
.team-name { font-weight:500; }
.at-symbol { font-weight:bold; color:#6c757d; }

.status-cell { min-width:100px; }
.status-select { width:100%; padding:0.25rem; border:1px solid #ced4da; border-radius:4px; font-size:0.85rem; background:white; }
.status-select:focus { outline:none; border-color:#80bdff; box-shadow:0 0 3px rgba(0,123,255,0.3); }
.status-badge { padding:0.25rem 0.5rem; border-radius:12px; font-size:0.85rem; font-weight:500; text-transform:uppercase; }
.status-scheduled { background:#e9ecef; color:#495057; }
.status-in-progress { background:#fff3cd; color:#856404; }
.status-completed { background:#d4edda; color:#155724; }
.status-postponed, .status-cancelled { background:#f8d7da; color:#721c24; }

.score-cell { min-width:60px; }
.score-display { font-weight:bold; font-size:1.1rem; }
.score-input { width:60px; padding:0.25rem; border:1px solid #ced4da; border-radius:4px; text-align:center; font-weight:bold; }
.score-input:focus { outline:none; border-color:#80bdff; box-shadow:0 0 3px rgba(0,123,255,0.3); }

.text-muted { color:#6c757d; font-style:italic; }
:deep(.schedule-table) { font-size:0.9rem; }
:deep(.schedule-table .p-datatable-tbody > tr > td) { padding:0.75rem 0.5rem; }
:deep(.matchup-column) { min-width:200px; }
:deep(.score-column) { width:100px; text-align:center; }
:deep(.status-column) { width:120px; text-align:center; }
:deep(.actions-column) { width:150px; text-align:center; }
</style>
