<!-- src/components/game/GameList.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import { FilterMatchMode } from 'primevue/api'
import GameCreateForm from '@/components/game/GameCreateForm.vue'
import GameEditForm from '@/components/game/GameEditForm.vue'

const gameStore = useGameStore()
const router = useRouter()

// Pagination refs (now client-side)
const rows = ref(10)
const first = ref(0)
// ✅ Modal visibility control
const showCreateModal = ref(false)

// ✅ Filters for client-side filtering
const filters = ref({
  'seasonYear': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'homeTeam.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'gameLocation': { value: null, matchMode: FilterMatchMode.CONTAINS }
})

onMounted(async () => {
  console.log('🔍 GameList: Component mounted, fetching all data for client-side operations')
  try {
    // Load ALL games for client-side sorting/filtering/pagination
    await gameStore.fetchAll(1, 1000, true) // Fetch a large number or modify store to fetch all
    console.log('🔍 GameList: All data fetch successful')

    // Debug: Check first game's team data structure
    if (gameStore.games.length > 0) {
      const firstGame = gameStore.games[0]
      console.log('🔍 GameList: First game data structure:', {
        id: firstGame.id,
        homeTeam: firstGame.homeTeam,
        awayTeam: firstGame.awayTeam,
        homeTeamId: firstGame.homeTeamId,
        awayTeamId: firstGame.awayTeamId
      })
    }
  } catch (error) {
    console.error('❌ GameList: Initial data fetch failed:', error)
  }
})

// Handle pagination events (client-side only, no server calls)
const onPage = (event: any) => {
  console.log(`🔍 GameList: Client-side page change - page: ${event.page + 1}, rows: ${event.rows}`)
  first.value = event.first
  rows.value = event.rows
  // No server call needed - PrimeVue handles client-side pagination automatically
}

const viewGame = (id: number) => {
  router.push(`/games/${id}?mode=read`)
}

const editGame = (id: number) => {
  router.push(`/games/${id}?mode=edit`)
}

const createGame = () => {
  showCreateModal.value = true
}

const deleteGame = async (id: number) => {
  if (confirm('Are you sure you want to delete this game?')) {
    try {
      await gameStore.remove(id)
      // After delete, refresh all data for client-side operations
      await gameStore.fetchAll(1, 1000, true)
      console.log(`✅ GameList: Successfully deleted game ${id}`)
    } catch (error) {
      console.error(`❌ GameList: Failed to delete game ${id}:`, error)
    }
  }
}

const retryFetch = async () => {
  console.log('🔄 GameList: Retrying data fetch')
  gameStore.clearError()
  try {
    await gameStore.fetchAll(1, 1000, true)
  } catch (error) {
    console.error('❌ GameList: Retry failed:', error)
  }
}

// Helper function to get team display name
const getTeamName = (team: any, teamId: number) => {
  if (team && team.name) {
    return team.name
  }
  if (team && team.city && team.name) {
    return `${team.city} ${team.name}`
  }
  if (team && team.city) {
    return team.city
  }
  return `Team ${teamId}`
}

// Helper function to format matchup
const formatMatchup = (game: any) => {
  const awayTeamName = getTeamName(game.awayTeam, game.awayTeamId)
  const homeTeamName = getTeamName(game.homeTeam, game.homeTeamId)
  return `${awayTeamName} @ ${homeTeamName}`
}

// ✅ Handle successful game creation
const onGameCreated = (newGame: any) => {
  showCreateModal.value = false

  // Refresh all games list for client-side operations
  gameStore.fetchAll(1, 1000, true)

  // Optional: Navigate to the new game
  // router.push(`/games/${newGame.id}`)

  // Optional: Show success message
  // toast.add({ severity: 'success', summary: 'Success', detail: 'Game created successfully!' })
}

const getTeamShortNameAndLogo = (team: any): { shortName: string; logoPath: string } => {
  if (!team || !team.name || !team.conference) {
    return { shortName: 'Unknown', logoPath: '' }
  }

  const nameParts = team.name.trim().split(' ')
  const shortName = nameParts[nameParts.length - 1]
  const fileExt = shortName === 'Chargers' ? 'webp' : 'avif'
  const logoFile = `${shortName}.${fileExt}`
  // Instead of complex URL construction
  const logoPath = `/images/${team.conference.toLowerCase()}/${logoFile}`
  return { shortName, logoPath }
}

const cancelRequest = () => {
  alert('BTN CLICKED!')
}
</script>

<template>
  < class="game-list">
    <!-- PATTERN APPLIED: Team-colored header -->

    <div class="nfl-datatable">
      <h2>Games</h2>
      <Button
        @click="createGame"
        label="Create Game"
        icon="pi pi-plus"
        class="p-button-success"
      />
    </div>

      <!-- PATTERN APPLIED: Team-themed DataTable -->
      <DataTable :value="gameStore.games" :loading="gameStore.loading" paginator :rows="rows" :first="first"
        :rowsPerPageOptions="[5, 10, 20, 50, 100]" @page="onPage" responsiveLayout="scroll" sortMode="single"
        :globalFilterFields="['seasonYear', 'homeTeam.name', 'awayTeam.name', 'gameLocation']" filterDisplay="menu"
        :filters="filters" showGridlines class="nfl-datatable">

        <!-- Season Year -->
        <Column field="seasonYear" header="Season" sortable :showFilterMatchModes="false">
          <template #filter="{ filterModel }">
            <input v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by season" />
          </template>
        </Column>

        <!-- Week -->
        <Column header="Week" sortable sortField="gameWeek">
          <template #body="{ data }">
            <span v-if="data.preseason">Pre {{ data.preseason }}</span>
            <span v-else-if="data.gameWeek">Week {{ data.gameWeek }}</span>
            <span v-else>-</span>
          </template>
        </Column>

        <!-- Date -->
        <Column field="gameDate" header="Date" sortable dataType="date">
          <template #body="{ data }">
            <span v-if="data.gameDate">
              {{ new Date(data.gameDate).toLocaleDateString() }}
            </span>
            <span v-else>TBD</span>
          </template>
        </Column>

        <!-- Matchup -->
        <Column header="Matchup" sortField="homeTeam.name">
          <template #body="{ data }">
            <div class="matchup-cell">
              <div class="team">
                <img v-if="data.awayTeam" :src="getTeamShortNameAndLogo(data.awayTeam).logoPath"
                  :alt="getTeamShortNameAndLogo(data.awayTeam).shortName" class="team-logo" />
                <span>{{ getTeamShortNameAndLogo(data.awayTeam).shortName }}</span>
              </div>
              <span class="at-symbol">@</span>
              <div class="team">
                <img v-if="data.homeTeam" :src="getTeamShortNameAndLogo(data.homeTeam).logoPath"
                  :alt="getTeamShortNameAndLogo(data.homeTeam).shortName" class="team-logo" />
                <span>{{ getTeamShortNameAndLogo(data.homeTeam).shortName }}</span>
              </div>
            </div>
          </template>
          <template #filter="{ filterModel }">
            <input v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search teams" />
          </template>
        </Column>

        <!-- Score -->
        <Column header="Score" sortField="homeScore">
          <template #body="{ data }">
            <span v-if="data.homeScore !== null && data.awayScore !== null">
              {{ data.awayScore }} - {{ data.homeScore }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </Column>

        <!-- Location -->
        <Column field="gameLocation" header="Location" sortable>
          <template #body="{ data }">
            <span v-if="data.gameLocation">{{ data.gameLocation }}</span>
            <span v-else-if="data.gameCity && data.gameStateProvince">{{ data.gameCity }}, {{ data.gameStateProvince
              }}</span>
            <span v-else-if="data.gameCity">{{ data.gameCity }}</span>
            <span v-else-if="data.homeTeam && data.homeTeam.city">{{ data.homeTeam.city }}</span>
            <span v-else class="text-muted">TBD</span>
          </template>
          <template #filter="{ filterModel }">
            <input v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search location" />
          </template>
        </Column>

        <!-- Status -->
        <Column field="gameStatus" header="Status" sortable>
          <template #body="{ data }">
            <span>{{ data.gameStatus || 'SCHEDULED' }}</span>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button @click="viewGame(data.id)" icon="pi pi-eye" class="p-button-info p-button-sm"
                v-tooltip="'View'" />
              <Button @click="editGame(data.id)" icon="pi pi-pencil" class="p-button-warning p-button-sm"
                v-tooltip="'Edit'" />
              <Button @click="deleteGame(data.id)" icon="pi pi-trash" class="p-button-danger p-button-sm"
                v-tooltip="'Delete'" />
            </div>
          </template>
        </Column>
      </DataTable>
    
   
      <!-- ✅ Create Game Modal -->
      <Dialog v-model:visible="showCreateModal" modal header="Create New Game" :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <GameCreateForm @game-created="onGameCreated" @cancel="cancelRequest" />
      </Dialog>

</template>

<style scoped>
.game-list {
  width: 100%;
}



.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.text-muted {
  color: #6c757d;
  font-style: italic;
}

.mb-3 {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid;
  border-radius: 8px;
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


</style>