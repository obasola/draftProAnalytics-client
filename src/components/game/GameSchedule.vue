<template>
  <div class="pgHeader">
    <h1>
      <img :src="getNflLogo()" class="nfl-logo" />
      Season Schedule
    </h1>
    <div class="team">
      <img v-if="selectedTeamObject" :src="getTeamShortNameAndLogo(selectedTeamObject).logoPath"
        :alt="getTeamShortNameAndLogo(selectedTeamObject).fullName" class="team-logo" />
      <span v-if="selectedTeamObject">{{ getTeamShortNameAndLogo(selectedTeamObject).fullName }}</span>
      <span v-else-if="selectedTeam === 'league'">NFL League</span>
      <span v-else>Select Team</span>
    </div>
  </div>
  <div class="schedule-container">
    <!-- Row 1: Season and Schedule Controls -->
    <div class="schedule-controls">
      <div class="control-group">
        <label for="season">Season:</label>
        <select id="season" v-model="selectedSeason" class="schedule-select" @change="loadSchedule">
          <option value="">Select Season</option>
          <option v-for="year in seasonYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label for="week">Season:</label>
        <select id="week" v-model="selectedWeek" class="schedule-select" @change="loadSchedule">
          <option value="0">Select Week</option>
          <option value="99">Preseason</option>
          <option v-for="week in scheduleWeeks" :key="week" :value="week">
            Week&nbsp;{{ week }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label for="schedule">Schedule:</label>
        <select id="schedule" v-model="selectedTeam" class="schedule-select" @change="loadSchedule">
          <option value="">Select Team</option>
          <option value="league">League</option>
          <option v-for="team in nflTeams" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Info text -->
    <div class="info-text">
      <span class="schedule-info">
        Select season and team to view schedule. Use Edit/Save buttons to update scores and game status.
      </span>
    </div>

    <!-- Loading/Error Messages -->
    <div v-if="loading" class="message-container">
      <div class="loading-message">Loading schedule...</div>
    </div>

    <div v-if="error" class="message-container">
      <div class="error-message">{{ error }}</div>
    </div>

    <!-- Schedule Data Table -->
    <div v-if="!loading && !error && scheduleGames.length > 0" class="schedule-table-container">
      <DataTable :value="scheduleGames" responsiveLayout="scroll" sortMode="single" :sortField="'gameWeek'"
        :sortOrder="1" showGridlines stripedRows class="schedule-table">
        <!-- Week Column -->
        <Column field="gameWeek" header="Week" sortable>
          <template #body="{ data }">
            <span v-if="data.preseason">Pre {{ data.preseason }}</span>
            <span v-else-if="data.gameWeek">{{ data.gameWeek }}</span>
            <span v-else>-</span>
          </template>
        </Column>

        <!-- Date Column -->
        <Column field="gameDate" header="Date" sortable>
          <template #body="{ data }">
            <span v-if="data.gameDate">
              {{ formatGameDate(data.gameDate) }}
            </span>
            <span v-else class="text-muted">TBD</span>
          </template>
        </Column>

        <!-- Matchup Column -->
        <Column header="Matchup" class="matchup-column">
          <template #body="{ data }">
            <div class="matchup-display">
              <!-- Away Team -->
              <div class="team-display">
                <span class="checkmark-placeholder">
                  <i v-if="isWinner(data, 'away')" class="pi pi-check winner-check"></i>
                </span>
                <img v-if="data.awayTeam" :src="getTeamLogo(data.awayTeam)" :alt="data.awayTeam.name"
                  class="team-icon" />
                <span class="team-name">{{ getTeamShortName(data.awayTeam) }}</span>
              </div>

              <span class="at-symbol">@</span>

              <!-- Home Team -->
              <div class="team-display">
              
                <span class="team-name">{{getTeamShortName(data.homeTeam) }}</span>
                <img v-if="data.homeTeam" :src="getTeamLogo(data.homeTeam)" :alt="data.homeTeam.name"
                  class="team-icon" />
                 <span class="checkmark-placeholder">
                  <i v-if="isWinner(data, 'home')" class="pi pi-check winner-check"></i>
                </span> 
              </div>
            </div>
          </template>
        </Column>

        <!-- Stadium Column -->
        <Column field="gameLocation" header="Stadium">
          <template #body="{ data }">
            <span>{{ data.gameLocation || 'TBD' }}</span>
          </template>
        </Column>

        <!-- Location Column -->
        <Column header="Location">
          <template #body="{ data }">
            <span>{{ formatLocation(data) }}</span>
          </template>
        </Column>

        <!-- Status Column -->
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

        <!-- Home Score Column -->
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

        <!-- Visitor Score Column -->
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

        <!-- Actions Column -->
        <Column header="Actions" class="actions-column">
          <template #body="{ data }">
            <div class="action-buttons">
              <button v-if="!isRowEditing(data.id)" @click="startEdit(data)" class="edit-btn-row"
                :disabled="isRowSaving(data.id)">
                <i class="pi pi-pencil"></i>
                Edit
              </button>

              <button v-if="isRowEditing(data.id)" @click="saveScore(data)" class="save-btn-row"
                :disabled="isRowSaving(data.id)">
                <i class="pi pi-check"></i>
                {{ isRowSaving(data.id) ? 'Saving...' : 'Save' }}
              </button>

              <button v-if="isRowEditing(data.id)" @click="cancelEdit(data)" class="cancel-btn-row"
                :disabled="isRowSaving(data.id)">
                <i class="pi pi-times"></i>
                Cancel
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No Data Message -->
    <div v-if="!loading && !error && scheduleGames.length === 0 && selectedSeason && selectedTeam"
      class="message-container">
      <div class="no-data-message">
        No games found for the selected season and team.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTeamStore } from '@/stores/teamStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast';
import { Team } from '@/types'

const gameStore = useGameStore()
const teamStore = useTeamStore()
const toast = useToast()
// Reactive data
const selectedSeason = ref('2025')
const selectedWeek = ref(1);

const selectedTeam = ref('')
const loading = ref(false)
const error = ref('')
const editingRows = ref(new Set()) // Track which rows are being edited
const savingRows = ref(new Set()) // Track which rows are being saved
const originalScores = ref(new Map()) // Store original scores for cancel functionality

// Computed season years
const seasonYears = computed(() => {
  const years = []
  for (let year = 2021; year <= 2031; year++) {
    years.push(year.toString())
  }
  return years
})

// Computed schedule weeks
const scheduleWeeks = computed(() => {
  const weeks = []
  for (let week = 1; week <= 18; week++) {
    weeks.push(week.toString())
  }
  return weeks
})

// Game status options for editing
const gameStatusOptions = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FINAL', label: 'Final' },
  { value: 'POSTPONED', label: 'Postponed' },
  { value: 'CANCELLED', label: 'Cancelled' }
]
const selectedTeamObject = ref<any>(null)

// Watch for selectedTeam changes to handle async team data loading
watch([selectedTeam, () => gameStore.games], async () => {
  if (!selectedTeam.value || selectedTeam.value === 'league') {
    selectedTeamObject.value = null
    return
  }

  // Find the team in nflTeams array
  const team = nflTeams.value.find(t => t.id === selectedTeam.value)
  if (!team) {
    selectedTeamObject.value = null
    return
  }

  // Get conference from loaded games data
  const gameWithTeam = gameStore.games.find(game =>
    game.homeTeamId.toString() === selectedTeam.value ||
    game.awayTeamId.toString() === selectedTeam.value
  )

  let conference = 'unknown'
  if (gameWithTeam) {
    if (gameWithTeam.homeTeamId.toString() === selectedTeam.value) {
      conference = gameWithTeam.homeTeam?.conference || 'unknown'
    } else {
      conference = gameWithTeam.awayTeam?.conference || 'unknown'
    }
  } else {
    // Only fetch if conference is still unknown
    try {
      const teamData: Team | null = await teamStore.fetchById(Number(selectedTeam.value))
      if (teamData?.conference) {
        conference = teamData.conference
      }
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  selectedTeamObject.value = { ...team, conference: conference }
}, { immediate: true })


const getTeamShortNameAndLogo = (team: any): { fullName: string; logoPath: string } => {
  if (!team || !team.name || !team.conference) {
    return { fullName: 'Unknown', logoPath: '' }
  }

  const nameParts = team.name.trim().split(' ')
  const fullName = team.name;
  const shortName = nameParts[nameParts.length - 1]
  const fileExt = shortName === 'Chargers' ? 'webp' : 'avif'
  const logoFile = `${shortName}.${fileExt}`
  const logoPath = new URL(`../../../public/images/${team.conference.toLowerCase()}/${logoFile}`, import.meta.url).href
  console.log("logoPath: " + logoPath)
  return { fullName, logoPath }
}
function getNflLogo() {
  return new URL('../../../public/images/NFLogo.jpeg', import.meta.url).href
}
const cancelRequest = () => {
  alert('BTN CLICKED!')
}
// NFL Teams
const nflTeams = ref([
  { id: '61', name: 'Arizona Cardinals' },
  { id: '62', name: 'Atlanta Falcons' },
  { id: '63', name: 'Baltimore Ravens' },
  { id: '65', name: 'Buffalo Bills' },
  { id: '66', name: 'Carolina Panthers' },
  { id: '67', name: 'Chicago Bears' },
  { id: '68', name: 'Cincinnati Bengals' },
  { id: '69', name: 'Cleveland Browns' },
  { id: '70', name: 'Dallas Cowboys' },
  { id: '72', name: 'Denver Broncos' },
  { id: '71', name: 'Detroit Lions' },
  { id: '73', name: 'Green Bay Packers' },
  { id: '93', name: 'Houston Texans' },
  { id: '75', name: 'Indianapolis Colts' },
  { id: '76', name: 'Jacksonville Jaguars' },
  { id: '78', name: 'Kansas City Chiefs' },
  { id: '79', name: 'Las Vegas Raiders' },
  { id: '95', name: 'Los Angeles Chargers' },
  { id: '77', name: 'Los Angeles Rams' },
  { id: '94', name: 'Miami Dolphins' },
  { id: '80', name: 'Minnesota Vikings' },
  { id: '96', name: 'New England Patriots' },
  { id: '92', name: 'New Orleans Saints' },
  { id: '82', name: 'New York Giants' },
  { id: '83', name: 'New York Jets' },
  { id: '84', name: 'Philadelphia Eagles' },
  { id: '85', name: 'Pittsburgh Steelers' },
  { id: '86', name: 'San Francisco 49ers' },
  { id: '87', name: 'Seattle Seahawks' },
  { id: '88', name: 'Tampa Bay Buccaneers' },
  { id: '89', name: 'Tennessee Titans' },
  { id: '90', name: 'Washington Commanders' }
])

// Computed schedule games
const scheduleGames = computed(() => {
  // Must have both season and team/league selected
  if (!selectedSeason.value || !selectedTeam.value) {
    console.log('Missing selection:', { season: selectedSeason.value, team: selectedTeam.value })
    return []
  }

  // Start with all games for the selected season
  let games = gameStore.games.filter(game =>
    game.seasonYear === selectedSeason.value
  )

  console.log(`Games for season ${selectedSeason.value}:`, games.length)

  // Filter by team if not "league" (league shows all games)
  if (selectedTeam.value !== 'league') {
    const teamId = selectedTeam.value // No need to replace # symbols anymore

    // Debug: Log what we're looking for and what we have
    console.log(`Looking for games with teamId: "${teamId}" (type: ${typeof teamId})`)
    console.log('Sample game homeTeamId:', games[0]?.homeTeamId, '(type:', typeof games[0]?.homeTeamId, ')')
    console.log('Sample game awayTeamId:', games[0]?.awayTeamId, '(type:', typeof games[0]?.awayTeamId, ')')

    games = games.filter(game => {
      const homeMatch = game.homeTeamId.toString() === teamId
      const awayMatch = game.awayTeamId.toString() === teamId
      const isMatch = homeMatch || awayMatch

      if (isMatch) {
        console.log(`Found match: Game ${game.id} - Home: ${game.homeTeamId}, Away: ${game.awayTeamId}`)
      }

      return isMatch
    })
    console.log(`Games filtered for team ${teamId}:`, games.length)
  } else {
    console.log('League selected - showing all games for season:', games.length)
  }

  // Sort by week, then by date
  return games.sort((a, b) => {
    // Sort by week, then by date
    if (a.gameWeek !== b.gameWeek) {
      return (a.gameWeek || 0) - (b.gameWeek || 0)
    }
    if (a.gameDate && b.gameDate) {
      return new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
    }
    return 0
  })
})

// Methods
const loadSchedule = async () => {
  if (!selectedSeason.value || !selectedTeam.value || !selectedWeek.value) return

  if (selectedWeek.value >= 1 && selectedWeek.value <= 18) {
    return loadScheduleByWeek();
  }
  loading.value = true
  error.value = ''

  try {
    console.log("Query for Week: "+selectedWeek.value)
    if (Number(selectedWeek.value) === 99) {
      await gameStore.fetchPreSeasonGames(Number(selectedTeam.value), selectedSeason.value)
    } else {
      // Load all games for the selected season
      await gameStore.fetchAll(1, 1000, true)
    }
  } catch (err) {
    error.value = 'Failed to load schedule data'
    console.error('Schedule load error:', err)
  } finally {
    loading.value = false
  }
}

const loadScheduleByWeek = async () => {
  if (!selectedWeek.value || !selectedWeek.value) return

  loading.value = true
  error.value = ''

  try {
    // Load all games for the selected season
    await gameStore.fetchTeamSeasonWeekGames(Number(selectedTeam.value), selectedSeason.value, Number(selectedWeek.value))
  } catch (err) {
    error.value = 'Failed to load schedule data'
    console.error('Schedule load error:', err)
  } finally {
    loading.value = false
  }
}

const startEdit = (game: any) => {
  const gameId = game.id
  // Store original scores AND status before editing
  originalScores.value.set(gameId, {
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    gameStatus: game.gameStatus
  })
  editingRows.value.add(gameId)
}

const cancelEdit = (game: any) => {
  const gameId = game.id
  // Restore original scores AND status
  const original = originalScores.value.get(gameId)
  if (original) {
    game.homeScore = original.homeScore
    game.awayScore = original.awayScore
    game.gameStatus = original.gameStatus
  }

  editingRows.value.delete(gameId)
  originalScores.value.delete(gameId)
}

const saveScore = async (game: any) => {
  const gameId = game.id

  try {
    savingRows.value.add(gameId)

    // Create update payload
    const updateData = {
      homeScore: game.homeScore !== null ? Number(game.homeScore) : null,
      awayScore: game.awayScore !== null ? Number(game.awayScore) : null,
      //gameStatus: game.gameStatus || 'completed'
      gameStatus: game.gameStatus ? game.gameStatus.toLowerCase() : 'scheduled'
    }

    await gameStore.update(gameId, updateData)
    console.log(`Updated scores for game ${gameId}`)

    // On success: exit edit mode and cleanup
    editingRows.value.delete(gameId)
    originalScores.value.delete(gameId)

  } catch (err: any) {
    console.error('Failed to save game:', err)

    // Extract error message from API response
    let errorMessage = 'Failed to save game changes'

    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err?.response?.data?.error) {
      errorMessage = err.response.data.error
    } else if (err?.message) {
      errorMessage = err.message
    }

    error.value = errorMessage
    console.log('Displaying error to user:', errorMessage)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 4000
    })
  } finally {
    savingRows.value.delete(gameId)
  }
}

const isRowEditing = (gameId: number) => {
  return editingRows.value.has(gameId)
}

const isRowSaving = (gameId: number) => {
  return savingRows.value.has(gameId)
}

const formatGameDate = (date: string | Date) => {
  if (!date) return 'TBD'
  const gameDate = new Date(date)
  return gameDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatLocation = (game: any) => {
  const parts = []

  if (game.gameCity) parts.push(game.gameCity)
  if (game.gameStateProvince) parts.push(game.gameStateProvince)

  // Only show country if not USA
  if (game.gameCountry && game.gameCountry.toUpperCase() !== 'USA') {
    parts.push(game.gameCountry)
  }

  return parts.length > 0 ? parts.join(', ') : 'TBD'
}

const getTeamShortName = (team: any) => {
  if (!team || !team.name) return 'TBD'
  const nameParts = team.name.trim().split(' ')
  return nameParts[nameParts.length - 1] // Last word
}

const getTeamLogo = (team: any) => {
  if (!team || !team.name || !team.conference) return ''

  const shortName = getTeamShortName(team)
  const fileExt = shortName === 'Chargers' ? 'webp' : 'avif'
  const logoFile = `${shortName}.${fileExt}`
  const logoPath = new URL(`../../../public/images/${team.conference.toLowerCase()}/${logoFile}`, import.meta.url).href
  return logoPath
  // return `../../../public/images/${team.conference.toLowerCase()}/${logoFile}`
}

const isWinner = (game: any, side: 'home' | 'away') => {
  if (game.homeScore === null || game.awayScore === null) return false
  if (game.homeScore === game.awayScore) return false // Tie

  if (side === 'home') {
    return game.homeScore > game.awayScore
  } else {
    return game.awayScore > game.homeScore
  }
}

const getStatusClass = (status: string) => {
  const statusLower = status?.toLowerCase() || 'scheduled'

  switch (statusLower) {
    case 'completed':
    case 'final':
      return 'status-completed'
    case 'in_progress':
      return 'status-in-progress'
    case 'postponed':
      return 'status-postponed'
    case 'cancelled':
      return 'status-cancelled'
    default:
      return 'status-scheduled'
  }
}

// Load initial data
onMounted(() => {
  // Pre-load some games data
  gameStore.fetchAll(1, 1000, true)
})
</script>

<style scoped>
.matchup-cell {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.team {
  font-size: 22pt;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nfl-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  vertical-align: bottom;
}

.team-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  vertical-align: middle;
}

.schedule-container {
  width: 100%;
}

.schedule-controls {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: bold;
  color: #495057;
  min-width: 70px;
}

.schedule-select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 150px;
}

.schedule-select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.info-text {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #e3f2fd;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
}

.schedule-info {
  color: #1565c0;
  font-size: 0.9rem;
}

.message-container {
  padding: 2rem;
  text-align: center;
}

.loading-message {
  color: #6c757d;
  font-size: 1.1rem;
}

.error-message {
  color: #dc3545;
  font-size: 1.1rem;
}

.no-data-message {
  color: #6c757d;
  font-size: 1.1rem;
}

.schedule-table-container {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.matchup-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.team-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.checkmark-placeholder {
  width: 20px;
  display: inline-flex;
  justify-content: center;
}

.winner-check {
  color: #28a745;
  font-weight: bold;
}

.team-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.team-name {
  font-weight: 500;
}

.at-symbol {
  font-weight: bold;
  color: #6c757d;
}

.status-cell {
  min-width: 100px;
}

.status-select {
  width: 100%;
  padding: 0.25rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.85rem;
  background: white;
}

.status-select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 3px rgba(0, 123, 255, 0.3);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-scheduled {
  background: #e9ecef;
  color: #495057;
}

.status-in-progress {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-postponed {
  background: #f8d7da;
  color: #721c24;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.score-cell {
  min-width: 60px;
}

.score-display {
  font-weight: bold;
  font-size: 1.1rem;
}

.score-input {
  width: 60px;
  padding: 0.25rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}

.score-input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 3px rgba(0, 123, 255, 0.3);
}

.text-muted {
  color: #6c757d;
  font-style: italic;
}

:deep(.schedule-table) {
  font-size: 0.9rem;
}

:deep(.schedule-table .p-datatable-tbody > tr > td) {
  padding: 0.75rem 0.5rem;
}

:deep(.matchup-column) {
  min-width: 200px;
}

:deep(.score-column) {
  width: 100px;
  text-align: center;
}

:deep(.status-column) {
  width: 120px;
  text-align: center;
}

:deep(.actions-column) {
  width: 150px;
  text-align: center;
}
</style>