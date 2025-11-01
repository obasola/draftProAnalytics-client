<!-- =====================================================
     COMPONENTS/TeamScheduleManager.vue
     ===================================================== -->

<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Team Schedule Management</h1>
      <p class="text-gray-600">Manage games and view schedule from team perspective</p>
    </div>

    <!-- Team & Season Selection -->
    <TeamSeasonSelector />

    <!-- Quick Stats Overview -->
    <SeasonStatsCard 
      v-if="selectedTeam" 
      :team="selectedTeam"
      :stats="seasonStats"
      :season="uiStore.selectedSeason"
    />

    <!-- Schedule Management -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Schedule</h2>
        <div class="flex space-x-2">
          <button
            @click="uiStore.openGameForm()"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon class="mr-2 h-4 w-4" />
            Add Game
          </button>
          <button
            @click="showBulkActions = !showBulkActions"
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Bulk Actions
          </button>
        </div>
      </div>

      <!-- Bulk Actions Panel -->
      <BulkActionsPanel v-if="showBulkActions" @close="showBulkActions = false" />

      <!-- Schedule List -->
      <ScheduleList />
    </div>

    <!-- Game Form Modal -->
    <GameFormModal v-if="uiStore.showGameForm" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTeamsStore, useGamesStore, useUIStore } from '@/stores/gameStores'
import { PlusIcon } from '@heroicons/vue/24/outline'

// Components
import TeamSeasonSelector from './TeamSeasonSelector.vue'
import SeasonStatsCard from './SeasonStatsCard.vue'
import ScheduleList from './ScheduleList.vue'
import GameFormModal from './GameFormModal.vue'
import BulkActionsPanel from './BulkActionsPanel.vue'

// Stores
const teamsStore = useTeamsStore()
const gamesStore = useGamesStore()
const uiStore = useUIStore()

// Local state
const showBulkActions = ref(false)

// Computed
const selectedTeam = computed(() => 
  teamsStore.getTeamById(uiStore.selectedTeamId)
)

const seasonStats = computed(() => 
  gamesStore.getSeasonStats(uiStore.selectedTeamId, uiStore.selectedSeason)
)

// Lifecycle
onMounted(async () => {
  // Initialize data
  if (teamsStore.teams.length === 0) {
    teamsStore.initializeMockData()
  }
  if (gamesStore.games.length === 0) {
    gamesStore.initializeMockData()
  }
})
</script>

<!-- =====================================================
     COMPONENTS/TeamSeasonSelector.vue
     ===================================================== -->

<template>
  <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Team
        </label>
        <select
          v-model="uiStore.selectedTeamId"
          class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
        >
          <option 
            v-for="team in teamsStore.teams" 
            :key="team.id" 
            :value="team.id"
          >
            {{ team.teamName }} ({{ team.conference }} {{ team.division }})
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Season
        </label>
        <select
          v-model="uiStore.selectedSeason"
          class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
        >
          <option 
            v-for="year in yearOptions" 
            :key="year" 
            :value="year"
          >
            {{ year }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTeamsStore, useUIStore } from '@/stores/gameStores'
import { useYearOptions } from '@/composables/useYearOptions'

const teamsStore = useTeamsStore()
const uiStore = useUIStore()
const { yearOptions } = useYearOptions()
</script>

<!-- =====================================================
     COMPONENTS/SeasonStatsCard.vue
     ===================================================== -->

<template>
  <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
    <h3 class="font-semibold text-gray-800 mb-4">
      {{ team.teamName }} - {{ season }} Season
    </h3>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
      <StatItem 
        :value="stats.wins" 
        label="Wins" 
        color="green"
      />
      <StatItem 
        :value="stats.losses" 
        label="Losses" 
        color="red"
      />
      <StatItem 
        :value="stats.ties" 
        label="Ties" 
        color="yellow"
      />
      <StatItem 
        :value="stats.played" 
        label="Played" 
        color="blue"
      />
      <StatItem 
        :value="stats.remaining" 
        label="Remaining" 
        color="gray"
      />
    </div>
    
    <!-- Win Percentage -->
    <div class="mt-4 text-center">
      <span class="text-sm text-gray-600">Win Percentage: </span>
      <span class="font-semibold">{{ winPercentage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Team, SeasonStats } from '@/types'
import StatItem from './StatItem.vue'

interface Props {
  team: Team
  stats: SeasonStats
  season: string
}

const props = defineProps<Props>()

const winPercentage = computed(() => {
  if (props.stats.played === 0) return '0.000'
  const percentage = props.stats.wins / props.stats.played
  return percentage.toFixed(3)
})
</script>

<!-- =====================================================
     COMPONENTS/StatItem.vue
     ===================================================== -->

<template>
  <div>
    <div 
      :class="[
        'text-2xl font-bold',
        colorClasses[color]
      ]"
    >
      {{ value }}
    </div>
    <div class="text-sm text-gray-600">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: number
  label: string
  color: 'green' | 'red' | 'yellow' | 'blue' | 'gray'
}

defineProps<Props>()

const colorClasses = {
  green: 'text-green-600',
  red: 'text-red-600',
  yellow: 'text-yellow-600',
  blue: 'text-blue-600',
  gray: 'text-gray-600'
}
</script>

<!-- =====================================================
     COMPONENTS/GameFormModal.vue
     ===================================================== -->

<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <GameFormHeader @close="uiStore.closeGameForm()" />
        
        <div class="p-6 pt-0">
          <GameFormContent />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/gameStores'
import GameFormHeader from './GameFormHeader.vue'
import GameFormContent from './GameFormContent.vue'

const uiStore = useUIStore()
</script>

<!-- =====================================================
     COMPONENTS/GameFormHeader.vue
     ===================================================== -->

<template>
  <div class="flex justify-between items-center p-6 pb-0">
    <h2 class="text-2xl font-bold text-gray-800">
      {{ isEditing ? 'Edit Game' : 'Schedule New Game' }}
    </h2>
    <button 
      @click="$emit('close')"
      class="text-gray-500 hover:text-gray-700 transition-colors"
    >
      <XMarkIcon class="h-6 w-6" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/gameStores'
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineEmits<{
  close: []
}>()

const uiStore = useUIStore()

const isEditing = computed(() => !!uiStore.editingGame)
</script>

<!-- =====================================================
     COMPONENTS/GameFormContent.vue
     ===================================================== -->

<template>
  <div class="space-y-6">
    <!-- Game Setup Section -->
    <GameSetupSection
      v-model:game-form="gameForm"
      v-model:home-or-away="homeOrAway"
      :context-team="contextTeam"
      :available-opponents="availableOpponents"
      @opponent-change="setOpponent"
    />

    <!-- Location Section -->
    <LocationSection
      v-model:game-form="gameForm"
      :home-or-away="homeOrAway"
      :can-edit-location="canEditLocation"
    />

    <!-- Scores Section -->
    <ScoresSection
      v-model:game-form="gameForm"
      :home-team="homeTeam"
      :away-team="awayTeam"
      :game-outcome="gameOutcome"
    />

    <!-- Validation Messages -->
    <ValidationMessages 
      v-if="hasErrors || hasWarnings"
      :errors="validationErrors"
      :warnings="validationWarnings"
    />

    <!-- Form Actions -->
    <FormActions
      :loading="loading"
      :is-editing="isEditing"
      @save="handleSave"
      @cancel="uiStore.closeGameForm()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useUIStore, useTeamsStore } from '@/stores/gameStores'
import { useGameForm } from '@/composables/useGameForm'
import { useGameValidation } from '@/composables/useGameValidation'

// Components
import GameSetupSection from './form/GameSetupSection.vue'
import LocationSection from './form/LocationSection.vue'
import ScoresSection from './form/ScoresSection.vue'
import ValidationMessages from './form/ValidationMessages.vue'
import FormActions from './form/FormActions.vue'

// Stores
const uiStore = useUIStore()
const teamsStore = useTeamsStore()

// Composables
const {
  gameForm,
  homeOrAway,
  loading,
  contextTeam,
  availableOpponents,
  canEditLocation,
  hasScores,
  gameOutcome,
  initializeForm,
  setOpponent,
  saveGame
} = useGameForm(uiStore.selectedTeamId)

const {
  validationErrors,
  validationWarnings,
  validateGame,
  hasErrors,
  hasWarnings
} = useGameValidation()

// Computed
const isEditing = computed(() => !!uiStore.editingGame)

const homeTeam = computed(() => 
  teamsStore.getTeamById(gameForm.value.homeTeamId)
)

const awayTeam = computed(() => 
  teamsStore.getTeamById(gameForm.value.awayTeamId)
)

// Methods
const handleSave = async () => {
  try {
    await saveGame()
    uiStore.closeGameForm()
  } catch (error) {
    // Error is already logged in saveGame
    alert('Failed to save game. Please check the form and try again.')
  }
}

// Initialize form when component mounts
onMounted(() => {
  initializeForm(uiStore.editingGame || undefined)
})

// Validate form whenever game data changes
watch(gameForm, (newGame) => {
  validateGame(newGame)
}, { deep: true })
</script>

<!-- =====================================================
     COMPONENTS/BulkActionsPanel.vue
     ===================================================== -->

<template>
  <div class="bg-gray-50 rounded-lg p-4 mb-4 border">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-gray-800">Bulk Actions</h3>
      <button 
        @click="$emit('close')"
        class="text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        @click="importFromPreviousSeason"
        class="p-3 border rounded-lg hover:bg-white transition-colors text-left"
      >
        <div class="font-medium text-gray-800">Copy Previous Season</div>
        <div class="text-sm text-gray-600">Import games from last year</div>
      </button>
      
      <button
        @click="generateTemplateSchedule"
        class="p-3 border rounded-lg hover:bg-white transition-colors text-left"
      >
        <div class="font-medium text-gray-800">Generate Template</div>
        <div class="text-sm text-gray-600">Create 17-game schedule</div>
      </button>
      
      <button
        @click="exportSchedule"
        class="p-3 border rounded-lg hover:bg-white transition-colors text-left"
      >
        <div class="font-medium text-gray-800">Export Schedule</div>
        <div class="text-sm text-gray-600">Download as CSV</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGamesStore, useUIStore } from '@/stores/gameStores'
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineEmits<{
  close: []
}>()

const gamesStore = useGamesStore()
const uiStore = useUIStore()

const importFromPreviousSeason = async () => {
  const previousYear = (parseInt(uiStore.selectedSeason) - 1).toString()
  const previousGames = gamesStore.getTeamGames(uiStore.selectedTeamId, previousYear)
  
  if (previousGames.length === 0) {
    alert('No games found for previous season')
    return
  }
  
  const newGames = previousGames.map(game => ({
    ...game,
    id: undefined,
    seasonYear: uiStore.selectedSeason,
    gameDate: undefined,
    homeScore: undefined,
    awayScore: undefined,
    gameStatus: 'scheduled' as const
  }))
  
  try {
    for (const game of newGames) {
      await gamesStore.createGame(game)
    }
    alert(`Imported ${newGames.length} games from ${previousYear} season`)
  } catch (error) {
    alert('Failed to import games from previous season')
  }
}

const generateTemplateSchedule = () => {
  // Implementation for generating template schedule
  alert('Template generation feature coming soon')
}

const exportSchedule = () => {
  const schedule = gamesStore.getTeamScheduleView(uiStore.selectedTeamId, uiStore.selectedSeason)
  
  const csvContent = [
    ['Week', 'Date', 'Opponent', 'Home/Away', 'Location', 'Result', 'Score'].join(','),
    ...schedule.map(s => [
      s.game.gameWeek || '',
      s.game.gameDate?.toLocaleDateString() || '',
      s.opponent.teamName,
      s.isHome ? 'Home' : 'Away',
      s.game.gameLocation || '',
      s.result || '',
      s.game.gameStatus === 'completed' ? `${s.teamScore}-${s.oppScore}` : ''
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${uiStore.selectedTeam?.teamName || 'team'}-${uiStore.selectedSeason}-schedule.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<!-- =====================================================
     PROJECT STRUCTURE
     ===================================================== -->

/*
src/
├── components/
│   ├── TeamScheduleManager.vue       # Main container component
│   ├── TeamSeasonSelector.vue        # Team & season selection
│   ├── SeasonStatsCard.vue          # Statistics display
│   ├── StatItem.vue                 # Individual stat component
│   ├── ScheduleList.vue             # Game list display
│   ├── GameFormModal.vue            # Modal wrapper
│   ├── GameFormHeader.vue           # Form header
│   ├── GameFormContent.vue          # Form content
│   ├── BulkActionsPanel.vue         # Bulk operations
│   └── form/
│       ├── GameSetupSection.vue     # Game basic info
│       ├── LocationSection.vue      # Location details
│       ├── ScoresSection.vue        # Score input
│       ├── ValidationMessages.vue   # Error/warning display
│       └── FormActions.vue          # Save/cancel buttons
├── stores/
│   └── gameStores.ts               # Pinia stores
├── composables/
│   ├── useGameForm.ts              # Form management
│   ├── useGameValidation.ts        # Validation logic
│   ├── useScheduleManagement.ts    # Schedule operations
│   └── useYearOptions.ts           # Year selection
├── utils/
│   └── dateHelpers.ts              # Date formatting
├── types/
│   └── index.ts                    # Type definitions
├── main.ts                         # App initialization
└── App.vue                         # Root component
*/