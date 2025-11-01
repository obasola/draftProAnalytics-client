<template>
  <div class="create-form">
    <form @submit.prevent="handleSubmit" class="game-form">
      <div class="form-grid">
              <!-- Teams Section -->
        <div class="form-section">
          <h3>Teams</h3>
          
          <div class="form-row">
            <label for="homeTeam">Home Team</label>
            <select 
              id="homeTeam" 
              v-model="formData.homeTeamId" 
              class="form-input"
              required
              @change="onHomeTeamChange"
            >
              <option value="">Select Home Team</option>
              <option v-for="team in nflTeams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <label for="awayTeam">Away Team</label>
            <select 
              id="awayTeam" 
              v-model="formData.awayTeamId" 
              class="form-input"
              required
            >
              <option value="">Select Away Team</option>
              <option v-for="team in nflTeams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>

                    <div class="form-row">
            <label for="gameStatus">Game Status</label>
            <select 
              id="gameStatus" 
              v-model="formData.gameStatus" 
              class="form-input"
            >
              <option value="">Select Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <!-- Basic Game Info Section -->
        <div class="form-section">
          <h3>Game Information</h3>
          
          <div class="form-row">
            <label for="seasonYear">Season Year</label>
            <select 
              id="seasonYear" 
              v-model="formData.seasonYear" 
              class="form-input"
              required
            >
              <option value="">Select Season Year</option>
              <option v-for="year in seasonYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <label>Season Type</label>
            <div class="radio-group">
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="formData.preseason" 
                  :value="1" 
                  name="preseason"
                />
                Preseason
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="formData.preseason" 
                  :value="0" 
                  name="preseason"
                />
                Regular Season
              </label>
            </div>
          </div>

          <div class="form-row">
            <label for="gameWeek">Game Week</label>
            <select 
              id="gameWeek" 
              v-model="formData.gameWeek" 
              class="form-input"
              :required="!isPreseason"
              :disabled="isPreseason"
            >
              <option value="">Select Week</option>
              <option v-for="week in gameWeeks" :key="week" :value="week">
                Week {{ week }}
              </option>
            </select>
            <small v-if="isPreseason" class="form-note">Game week is not applicable for preseason games</small>
          </div>

          <div class="form-row">
            <label for="gameDate">Game Date</label>
            <input 
              id="gameDate"
              type="datetime-local" 
              v-model="formData.gameDate" 
              class="form-input"
            />
          </div>
        </div>

        <!-- Location Section -->
        <div class="form-section">
          <h3>Game Location</h3>
          
          <div class="form-row">
            <label for="gameCountry">Country</label>
            <input 
              id="gameCountry"
              type="text" 
              v-model="formData.gameCountry" 
              class="form-input"
              placeholder="Enter country"
              @input="onCountryChange"
            />
          </div>

          <div class="form-row">
            <label for="gameLocation">Stadium/Venue</label>
            <input 
              id="gameLocation"
              type="text" 
              v-model="formData.gameLocation" 
              class="form-input"
              placeholder="Enter stadium or venue name"
              :disabled="isUSAGame"
            />
            <small v-if="isUSAGame" class="form-note">Stadium auto-populated from home team selection</small>
          </div>

          <div class="form-row">
            <label for="gameCity">City</label>
            <input 
              id="gameCity"
              type="text" 
              v-model="formData.gameCity" 
              class="form-input"
              placeholder="Enter city"
              :disabled="isUSAGame"
            />
            <small v-if="isUSAGame" class="form-note">City auto-populated from home team selection</small>
          </div>

          <div class="form-row">
            <label for="gameState">State/Province</label>
            <input 
              id="gameState"
              type="text" 
              v-model="formData.gameStateProvince" 
              class="form-input"
              placeholder="Enter state or province"
              :disabled="isUSAGame"
            />
            <small v-if="isUSAGame" class="form-note">State auto-populated from home team selection</small>
          </div>
        </div>

        <!-- Game Results Section (only if game date is in the past) -->
        <div class="form-section" v-if="showGameResults">
          <h3>Game Results</h3>
          
          <div class="form-row">
            <label for="homeScore">Home Score</label>
            <input 
              id="homeScore"
              type="number" 
              v-model="formData.homeScore" 
              class="form-input"
              min="0"
            />
          </div>

          <div class="form-row">
            <label for="awayScore">Away Score</label>
            <input 
              id="awayScore"
              type="number" 
              v-model="formData.awayScore" 
              class="form-input"
              min="0"
            />
          </div>

        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="handleCancel" class="btn-cancel">
          Cancel
        </button>
        <button type="submit" class="btn-submit">
          Update Game
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTeamStore } from '@/stores/teamStore'
import { useRoute } from 'vue-router'

const route = useRoute()
const gameId = computed(() => route.params.id)
// Props
interface Props {
  gameId?: number | string
  initialData?: any
}

const props = withDefaults(defineProps<Props>(), {
  gameId: undefined,
  initialData: undefined
})

// Emits
const emit = defineEmits<{
  cancel: []
  updated: [game: any]
}>()

// Stores
const gameStore = useGameStore()
const teamStore = useTeamStore()

// Form data
const formData = reactive({
  id: null as number | null,
  seasonYear: '',
  gameWeek: null as number | null,
  preseason: 0,
  gameDate: '',
  homeTeamId: '',
  awayTeamId: '',
  gameLocation: '',
  gameCity: '',
  gameStateProvince: '',
  gameCountry: 'USA',
  homeScore: null as number | null,
  awayScore: null as number | null,
  gameStatus: 'scheduled'
})

// Computed properties
const isPreseason = computed(() => formData.preseason === 1)
const isUSAGame = computed(() => formData.gameCountry.toUpperCase() === 'USA')

const seasonYears = computed(() => {
  const years = []
  for (let year = 2021; year <= 2031; year++) {
    years.push(year.toString())
  }
  return years
})

const showGameResults = computed(() => {
  if (!formData.gameDate) return false
  const gameDate = new Date(formData.gameDate)
  const now = new Date()
  return gameDate < now
})

const gameWeeks = computed(() => {
  const weeks = []
  for (let week = 1; week <= 20; week++) {
    weeks.push(week)
  }
  return weeks
})

// NFL Teams with IDs
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

// Methods
const onHomeTeamChange = async () => {
  if (formData.homeTeamId) {
    try {
      // Extract number from placeholder ID format (#1# -> 1)
      const teamId = formData.homeTeamId.replace(/#/g, '')
      const team = await teamStore.getTeamById(Number(teamId))
      if (team) {
        // Only populate if this is a USA game
        if (isUSAGame.value) {
          formData.gameLocation = team.stadium || ''
          formData.gameCity = team.city || ''
          formData.gameStateProvince = team.state || ''
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error)
      // Fallback: try to find team in local array if store fails
      const localTeam = nflTeams.value.find(t => t.id === formData.homeTeamId)
      if (localTeam && isUSAGame.value) {
        // For placeholder data, you would populate with mock data or leave empty
        console.log('Using local team data for:', localTeam.name)
      }
    }
  }
}

const onCountryChange = () => {
  // If country changes to USA, try to repopulate from home team
  if (isUSAGame.value && formData.homeTeamId) {
    onHomeTeamChange()
  }
  // If country changes from USA, clear the auto-populated fields to allow manual entry
  else if (!isUSAGame.value) {
    // Don't clear the fields, just enable them for manual editing
  }
}

// Watch for preseason changes to clear game week
watch(() => formData.preseason, (newVal) => {
  if (newVal === 1) {
    formData.gameWeek = null
  }
})

// Watch for country changes to handle location field population
watch(() => formData.gameCountry, () => {
  onCountryChange()
})

// Watch for home team changes to populate location data
watch(() => formData.homeTeamId, () => {
  onHomeTeamChange()
})

const loadGameData = async () => {
  if (props.initialData) {
    populateForm(props.initialData)
  } else if (gameId.value) {
    try {
      const game = await gameStore.getGameById(Number(gameId.value))
      if (game) {
        populateForm(game)
      }
    } catch (error) {
      console.error('Error loading game data:', error)
    }
  } else {
    alert('Error: no initial data or id to fetch by')
  }
}


const populateForm = (game: any) => {
  formData.id = game.id
  formData.seasonYear = game.seasonYear
  formData.gameWeek = game.gameWeek
  formData.preseason = game.preseason || 0
  formData.gameDate = game.gameDate ? formatDateForInput(game.gameDate) : ''
  // Convert numeric team IDs back to placeholder format for form display
  formData.homeTeamId = game.homeTeamId
  formData.awayTeamId = game.awayTeamId
  formData.gameLocation = game.gameLocation || ''
  formData.gameCity = game.gameCity || ''
  formData.gameStateProvince = game.gameStateProvince || ''
  formData.gameCountry = game.gameCountry || 'USA'
  formData.homeScore = game.homeScore
  formData.awayScore = game.awayScore
  formData.gameStatus = game.gameStatus || 'scheduled'
}

const formatDateForInput = (date: string | Date) => {
  const d = new Date(date)
  return d.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
}

const handleSubmit = async () => {
  try {
    // Validate required fields
    if (!formData.seasonYear || !formData.homeTeamId || !formData.awayTeamId) {
      alert('Please fill in all required fields')
      return
    }

    // Game week is only required for regular season games
    if (!isPreseason.value && !formData.gameWeek) {
      alert('Please select a game week for regular season games')
      return
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      alert('Home team and away team cannot be the same')
      return
    }

    // Create payload with proper types for store (exclude id and convert team IDs)
    const gamePayload = {
      seasonYear: formData.seasonYear,
      gameWeek: formData.gameWeek,
      preseason: formData.preseason,
      gameDate: formData.gameDate,
      homeTeamId: Number(formData.homeTeamId.replace(/#/g, '')),
      awayTeamId: Number(formData.awayTeamId.replace(/#/g, '')),
      gameLocation: formData.gameLocation,
      gameCity: formData.gameCity,
      gameStateProvince: formData.gameStateProvince,
      gameCountry: formData.gameCountry,
      homeScore: formData.homeScore,
      awayScore: formData.awayScore,
      gameStatus: formData.gameStatus
    }

    // Submit to store
    const updatedGame = await gameStore.update(Number(formData.id), gamePayload)
    
    // Emit success event
    emit('updated', updatedGame)
    
  } catch (error) {
    console.error('Error updating game:', error)
    alert('Error updating game. Please try again.')
  }
}

const handleCancel = () => {
  emit('cancel')
}

// Lifecycle
onMounted(() => {
  loadGameData()
})

// Watch for changes in props
watch(() => props.gameId, () => {
  loadGameData()
})

watch(() => props.initialData, () => {
  if (props.initialData) {
    populateForm(props.initialData)
  }
})
</script>

<style scoped>
.create-form {
  max-width: 1000px;
  margin: 0 auto;
}

.game-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-section h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.form-row {
  margin-bottom: 1rem;
}

.form-row label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

/* Enhanced form input styling for better UX */
.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 500;
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: var(--text-secondary);
  font-weight: 400;
  opacity: 0.8;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
  font-weight: 400;
}

/* Style for empty select options */
.form-input option[value=""] {
  color: var(--text-secondary);
  font-weight: 400;
}

/* Style for filled select options */
.form-input option:not([value=""]) {
  color: var(--primary-color);
  font-weight: 500;
}

.form-note {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal !important;
  margin-bottom: 0 !important;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.radio-label input {
  width: auto;
  accent-color: var(--primary-color);
}

.radio-label input:checked + span,
.radio-label:has(input:checked) {
  color: var(--primary-color);
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: var(--surface-100);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-submit:hover {
  background: var(--primary-hover-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb, 59, 130, 246), 0.3);
}

/* Enhanced focus and interaction states */
.form-input:hover:not(:disabled) {
  border-color: var(--primary-color);
}

.form-row:hover .form-input:not(:disabled) {
  transform: translateX(2px);
}

/* Ensure consistent styling for different input types */
.form-input[type="datetime-local"],
.form-input[type="number"],
.form-input[type="text"] {
  color: var(--primary-color);
  font-weight: 500;
}

.form-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: hue-rotate(200deg);
}
</style>