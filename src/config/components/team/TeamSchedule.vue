<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTeamStore } from '../../stores/teamStore'
import { useGameStore } from '../../stores/gameStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import GameCreateForm from '@/components/game/GameCreateForm.vue'

const teamStore = useTeamStore()
const gameStore = useGameStore()

const team = computed(() => teamStore.currentTeam)
const showCreateGameModal = ref(false)

// Get team's games (home and away) with null safety
const teamGames = computed(() => {
  if (!team.value?.id) return []
  
  return gameStore.games.filter(game => 
    (game.homeTeamId && game.homeTeamId === team.value?.id) || 
    (game.awayTeamId && game.awayTeamId === team.value?.id)
  )
})

const createGameForTeam = () => {
  showCreateGameModal.value = true
}

const onGameCreated = async (newGame: any) => {
  showCreateGameModal.value = false
  // Refresh team's games
  await loadTeamGames()
}

// ✅ Load both regular season and preseason games
const loadTeamGames = async () => {
  if (!team.value?.id) return
  
  const currentSeason = new Date().getFullYear().toString()
  
  try {
    // Load both regular season and preseason games for complete schedule
    await Promise.all([
      gameStore.fetchTeamSeason(team.value.id, currentSeason),
    ])
  } catch (error) {
    console.error('Error loading team games:', error)
  }
}

onMounted(async () => {
  await loadTeamGames()
})

// ✅ Convert Game-centric data to Team-centric view
const formatGame = (game: any) => {
  const isHome = game.homeTeamId === team.value?.id
  const opponent = isHome ? game.awayTeam?.name || `Team ${game.awayTeamId}` : game.homeTeam?.name || `Team ${game.homeTeamId}`
  const location = isHome ? 'vs' : '@'  // Replaces old Schedule.homeOrAway
  return `${location} ${opponent}`
}

const formatGameResult = (game: any) => {
  if (!game.homeScore && !game.awayScore) return 'Not Played'
  
  const isHome = game.homeTeamId === team.value?.id
  // Convert Game scores to team perspective (replaces Schedule.teamScore/oppTeamScore)
  const teamScore = isHome ? game.homeScore : game.awayScore
  const opponentScore = isHome ? game.awayScore : game.homeScore
  
  // Calculate result (replaces Schedule.wonLostFlag)
  if (teamScore > opponentScore) return `W ${teamScore}-${opponentScore}`
  if (teamScore < opponentScore) return `L ${teamScore}-${opponentScore}`
  return `T ${teamScore}-${opponentScore}`
}

// ✅ Get team's complete schedule (replaces individual Schedule records)
const getTeamRecord = computed(() => {
  const wins = teamGames.value.filter(game => {
    const isHome = game.homeTeamId === team.value?.id
    const teamScore = isHome ? game.homeScore : game.awayScore
    const oppScore = isHome ? game.awayScore : game.homeScore
    return teamScore ? teamScore : 0 < (oppScore ? oppScore : 0)
  }).length
  
  const losses = teamGames.value.filter(game => {
    const isHome = game.homeTeamId === team.value?.id
    const teamScore = isHome ? game.homeScore : game.awayScore
    const oppScore = isHome ? game.awayScore : game.homeScore
    return teamScore ? teamScore : 0 < (oppScore ? oppScore : 0)
  }).length
  
  const ties = teamGames.value.filter(game => {
    const isHome = game.homeTeamId === team.value?.id
    const teamScore = isHome ? game.homeScore : game.awayScore
    const oppScore = isHome ? game.awayScore : game.homeScore
    return teamScore === oppScore && teamScore !== null && oppScore !== null
  }).length
  
  return { wins, losses, ties }
})
</script>

<template>
  <Card v-if="team" class="team-details">
    <template #title>
      {{ team.name }}
    </template>
    <template #subtitle>
      {{ team.city }}, {{ team.state }} - {{ team.conference }} {{ team.division }}
    </template>

    <template #content>
      <!-- Existing team info grid stays the same -->
      <div class="team-info-grid">
        <div class="info-section">
          <h3>Team Information</h3>
          <div class="info-row">
            <span class="label">Team Name:</span>
            <span>{{ team.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">City:</span>
            <span>{{ team.city }}</span>
          </div>
          <div class="info-row">
            <span class="label">State:</span>
            <span>{{ team.state }}</span>
          </div>
          <div class="info-row">
            <span class="label">Country:</span>
            <span>{{ team.country }}</span>
          </div>
          <div class="info-row">
            <span class="label">Stadium:</span>
            <span>{{ team.stadium }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>League Information</h3>
          <div class="info-row">
            <span class="label">Conference:</span>
            <span>{{ team.conference }}</span>
          </div>
          <div class="info-row">
            <span class="label">Division:</span>
            <span>{{ team.division }}</span>
          </div>
          <div class="info-row" v-if="team.scheduleId">
            <span class="label">Schedule ID:</span>
            <span>{{ team.scheduleId }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Players">
          <p>Players roster will be displayed here when player relationships are implemented.</p>
        </AccordionTab>
        
        <AccordionTab header="Schedule">
          <div class="schedule-section">
            <div class="schedule-header">
              <div class="schedule-title">
                <h4>{{ team.name }} Schedule</h4>
                <span class="team-record" v-if="teamGames.length > 0">
                  ({{ getTeamRecord.wins }}-{{ getTeamRecord.losses }}{{ getTeamRecord.ties > 0 ? `-${getTeamRecord.ties}` : '' }})
                </span>
              </div>
              <Button
                @click="createGameForTeam"
                label="Add Game"
                icon="pi pi-plus"
                class="p-button-success p-button-sm"
              />
            </div>

            <DataTable 
              :value="teamGames" 
              :paginator="true" 
              :rows="10"
              class="schedule-table"
              :emptyMessage="`No games scheduled for ${team.name}`"
            >
              <Column field="gameWeek" header="Week" sortable>
                <template #body="{ data }">
                  <span v-if="data.preseason" class="preseason-badge">
                    Preseason {{ data.preseason }}
                  </span>
                  <span v-else-if="data.gameWeek" class="regular-season-badge">
                    Week {{ data.gameWeek }}
                  </span>
                  <span v-else class="tbd-badge">TBD</span>
                </template>
              </Column>
              
              <Column field="gameDate" header="Date" sortable>
                <template #body="{ data }">
                  {{ data.gameDate ? new Date(data.gameDate).toLocaleDateString() : 'TBD' }}
                </template>
              </Column>
              
              <Column header="Opponent">
                <template #body="{ data }">
                  {{ formatGame(data) }}
                </template>
              </Column>
              
              <Column field="gameLocation" header="Location" />
              
              <Column header="Result">
                <template #body="{ data }">
                  <span :class="formatGameResult(data).startsWith('W') ? 'win' : formatGameResult(data).startsWith('L') ? 'loss' : 'tie'">
                    {{ formatGameResult(data) }}
                  </span>
                </template>
              </Column>
              
              <Column header="Actions">
                <template #body="{ data }">
                  <Button
                    icon="pi pi-eye"
                    class="p-button-sm p-button-text"
                    @click="$router.push(`/games/${data.id}`)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </AccordionTab>
        
        <AccordionTab header="Draft Picks">
          <p>Team draft history will be displayed here when draft pick relationships are implemented.</p>
        </AccordionTab>
        
        <AccordionTab header="Team Needs">
          <p>Team draft needs will be displayed here when team needs relationships are implemented.</p>
        </AccordionTab>
        
        <AccordionTab header="Playoff Results">
          <p>Playoff history will be displayed here when post-season results are implemented.</p>
        </AccordionTab>
      </Accordion>

      <Dialog
        v-model:visible="showCreateGameModal"
        modal
        header="Add Game to Schedule"
        :style="{ width: '90vw' }"
        :breakpoints="{ '1199px': '95vw', '575px': '100vw' }"
      >
        <GameCreateForm 
          :preselected-team="team"
          @game-created="onGameCreated"
          @cancel="showCreateGameModal = false"
        />
      </Dialog>
    </template>
  </Card>
</template>

<style scoped>
.team-details {
  width: 100%;       /* use full width */
  margin: 0;         /* remove centering margin */
  padding: 0;        /* no horizontal padding */
  box-sizing: border-box;
}

.team-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* narrower min col */
  gap: 1rem;
  margin-bottom: 1rem;
}

/* rest of your styles unchanged */
.info-section h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.label {
  font-weight: bold;
  color: var(--text-primary);
}

.relationships-accordion {
  margin-top: 1rem;
}

.schedule-section {
  padding: 0.5rem 0;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.schedule-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.schedule-title h4 {
  margin: 0;
  color: var(--text-primary);
}

.team-record {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: normal;
}

.schedule-table {
  width: 100%;
  margin-top: 0.5rem;
}

/* badges and result colors unchanged */
.win { color: #22c55e; font-weight: bold; }
.loss { color: #ef4444; font-weight: bold; }
.tie { color: #f59e0b; font-weight: bold; }

.preseason-badge {
  background: #6366f1; color: white;
  padding: 0.2rem 0.5rem; border-radius: 0.25rem;
  font-size: 0.8rem; font-weight: bold;
}
.regular-season-badge {
  background: #059669; color: white;
  padding: 0.2rem 0.5rem; border-radius: 0.25rem;
  font-size: 0.8rem; font-weight: bold;
}
.tbd-badge {
  background: #6b7280; color: white;
  padding: 0.2rem 0.5rem; border-radius: 0.25rem;
  font-size: 0.8rem;
}
</style>
