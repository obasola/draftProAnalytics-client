<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'

const gameStore = useGameStore()

const game = computed(() => gameStore.currentGame)

onMounted(async () => {
  // Load any related data if needed
})

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'TBD'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date: Date | string | undefined) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  })
}

const getGameStatusSeverity = (status: string | undefined) => {
  switch (status) {
    case 'FINAL': return 'success'
    case 'LIVE': return 'warning'
    case 'SCHEDULED': return 'info'
    case 'POSTPONED': return 'danger'
    case 'CANCELLED': return 'secondary'
    default: return 'info'
  }
}

const getTeamLogo = (team: any): string => {
  if (!team || !team.name || !team.conference) return ''

  const lastWord = team.name.trim().split(/\s+/).pop() || ''
  const ext = lastWord === 'Chargers' ? 'webp' : 'avif'

  return `/images/${team.conference.toLowerCase()}/${lastWord}.${ext}`
}

const getGameResult = computed(() => {
  if (!game.value || game.value.homeScore === null || game.value.homeScore === undefined ||
    game.value.awayScore === null || game.value.awayScore === undefined) {
    return null
  }

  const homeScore = game.value.homeScore
  const awayScore = game.value.awayScore

  if (homeScore > awayScore) {
    return { winner: 'home', margin: homeScore - awayScore }
  } else if (awayScore > homeScore) {
    return { winner: 'away', margin: awayScore - homeScore }
  } else {
    return { winner: 'tie', margin: 0 }
  }
})

const getWeekDisplay = computed(() => {
  if (!game.value) return ''

  if (game.value.preseason) {
    return `Preseason Week ${game.value.preseason}`
  } else if (game.value.gameWeek) {
    return `Week ${game.value.gameWeek}`
  }
  return 'Regular Season'
})
</script>

<template>
  <Card v-if="game" class="game-details">
    <template #title>
      <div class="game-title">
        <div class="matchup-header">
          <div class="team-info">
            <h3 class="team-name-with-logo">
              <img :src="getTeamLogo(game.awayTeam)" :alt="game.awayTeam.name" class="inline-logo" />
              {{ game.awayTeam.name }}
            </h3>
            <p class="team-location">{{ game.awayTeam.city }}, {{ game.awayTeam.state }}</p>
          </div>

          <div class="score-display">
            <div v-if="game.homeScore !== null && game.homeScore !== undefined &&
              game.awayScore !== null && game.awayScore !== undefined" class="final-score">
              <div class="away-score" :class="{ 'winner': getGameResult?.winner === 'away' }">
                {{ game.awayScore }}
              </div>
              <div class="score-divider">-</div>
              <div class="home-score" :class="{ 'winner': getGameResult?.winner === 'home' }">
                {{ game.homeScore }}
              </div>
            </div>
            <div v-else class="vs-display">VS</div>
          </div>

          <div class="team-info">

            <h3 class="team-name-with-logo">
              <img :src="getTeamLogo(game.homeTeam)" :alt="game.homeTeam.name" class="inline-logo" />
              {{ game.homeTeam.name }}
            </h3>
            <p class="team-location">{{ game.homeTeam.city }}, {{ game.homeTeam.state }}</p>
          </div>
        </div>

        <div class="game-meta">
          <Tag :value="game.gameStatus || 'SCHEDULED'"
            :severity="getGameStatusSeverity(game.gameStatus ?? undefined)" />
          <span class="season-info">{{ game.seasonYear }} • {{ getWeekDisplay }}</span>
        </div>
      </div>
    </template>

    <template #content>
      <div class="game-info-grid">
        <!-- Game Information -->
        <div class="info-section">
          <h3>Game Information</h3>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="data-value">{{ formatDate(game.gameDate ?? undefined) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Time:</span>
            <span class="data-value">{{ formatTime(game.gameDate ?? undefined) || 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Season:</span>
            <span class="data-value">{{ game.seasonYear }}</span>
          </div>
          <div class="info-row">
            <span class="label">Week:</span>
            <span class="data-value">{{ getWeekDisplay }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <Tag :value="game.gameStatus || 'SCHEDULED'"
              :severity="getGameStatusSeverity(game.gameStatus ?? undefined)" />
          </div>
        </div>

        <!-- Location Information -->
        <div class="info-section">
          <h3>Location</h3>
          <div class="info-row" v-if="game.gameLocation">
            <span class="label">Venue:</span>
            <span class="data-value">{{ game.gameLocation }}</span>
          </div>
          <div class="info-row" v-if="game.gameCity">
            <span class="label">City:</span>
            <span class="data-value">{{ game.gameCity }}</span>
          </div>
          <div class="info-row" v-if="game.gameStateProvince">
            <span class="label">State/Province:</span>
            <span class="data-value">{{ game.gameStateProvince }}</span>
          </div>
          <div class="info-row" v-if="game.gameCountry">
            <span class="label">Country:</span>
            <span class="data-value">{{ game.gameCountry }}</span>
          </div>
          <div v-if="!game.gameLocation && !game.gameCity" class="text-500">
            Location TBD
          </div>
        </div>

        <!-- Score Information -->
        <div class="info-section" v-if="game.homeScore !== null && game.homeScore !== undefined">
          <h3>Final Score</h3>
          <div class="score-breakdown">
            <div class="team-score">
              <span class="team-name">{{ game.awayTeam.name }}</span>
              <span class="score" :class="{ 'winner': getGameResult?.winner === 'away' }">
                {{ game.awayScore }}
              </span>
            </div>
            <div class="team-score">
              <span class="team-name">{{ game.homeTeam.name }}</span>
              <span class="score" :class="{ 'winner': getGameResult?.winner === 'home' }">
                {{ game.homeScore }}
              </span>
            </div>
            <div v-if="getGameResult && getGameResult.winner !== 'tie'" class="game-result">
              {{ getGameResult.winner === 'home' ? game.homeTeam.name : game.awayTeam.name }}
              wins by {{ getGameResult.margin }}
            </div>
            <div v-else-if="getGameResult?.winner === 'tie'" class="game-result">
              Game ended in a tie
            </div>
          </div>
        </div>

        <!-- System Information -->
        <div class="info-section">
          <h3>System Information</h3>
          <div class="info-row">
            <span class="label">Game ID:</span>
            <span class="data-value">{{ game.id }}</span>
          </div>
          <div class="info-row" v-if="game.createdAt">
            <span class="label">Created:</span>
            <span class="data-value">{{ formatDate(game.createdAt) }}</span>
          </div>
          <div class="info-row" v-if="game.updatedAt">
            <span class="label">Last Updated:</span>
            <span class="data-value">{{ formatDate(game.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <!-- Home Team Details -->
        <AccordionTab header="Home Team Details">
          <div class="team-details">
            <div class="info-row">
              <span class="label">Team Name:</span>
              <span class="data-value">{{ game.homeTeam.name }}</span>
            </div>
            <div class="info-row" v-if="game.homeTeam.city">
              <span class="label">City:</span>
              <span class="data-value">{{ game.homeTeam.city }}</span>
            </div>
            <div class="info-row" v-if="game.homeTeam.state">
              <span class="label">State:</span>
              <span class="data-value">{{ game.homeTeam.state }}</span>
            </div>
            <div class="info-row" v-if="game.homeTeam.conference">
              <span class="label">Conference:</span>
              <span class="data-value">{{ game.homeTeam.conference }}</span>
            </div>
            <div class="info-row" v-if="game.homeTeam.division">
              <span class="label">Division:</span>
              <span class="data-value">{{ game.homeTeam.division }}</span>
            </div>
            <div class="info-row" v-if="game.homeTeam.stadium">
              <span class="label">Stadium:</span>
              <span class="data-value">{{ game.homeTeam.stadium }}</span>
            </div>
          </div>
        </AccordionTab>

        <!-- Away Team Details -->
        <AccordionTab header="Away Team Details">
          <div class="team-details">
            <div class="info-row">
              <span class="label">Team Name:</span>
              <span class="data-value">{{ game.awayTeam.name }}</span>
            </div>
            <div class="info-row" v-if="game.awayTeam.city">
              <span class="label">City:</span>
              <span class="data-value">{{ game.awayTeam.city }}</span>
            </div>
            <div class="info-row" v-if="game.awayTeam.state">
              <span class="label">State:</span>
              <span class="data-value">{{ game.awayTeam.state }}</span>
            </div>
            <div class="info-row" v-if="game.awayTeam.conference">
              <span class="label">Conference:</span>
              <span class="data-value">{{ game.awayTeam.conference }}</span>
            </div>
            <div class="info-row" v-if="game.awayTeam.division">
              <span class="label">Division:</span>
              <span class="data-value">{{ game.awayTeam.division }}</span>
            </div>
            <div class="info-row" v-if="game.awayTeam.stadium">
              <span class="label">Stadium:</span>
              <span class="data-value">{{ game.awayTeam.stadium }}</span>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>

<style scoped>
.game-details {
  max-width: 1000px;
  margin: 0 auto;
}

.game-title {
  text-align: center;
}

.matchup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.team-info h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.team-location {
  margin: 0.25rem 0 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.score-display {
  flex: 1;
  text-align: center;
  margin: 0 2rem;
}

.final-score {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: bold;
}

.vs-display {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-secondary);
}

.away-score,
.home-score {
  color: var(--text-primary);
}

.away-score.winner,
.home-score.winner {
  color: var(--primary-color);
}

.score-divider {
  color: var(--text-secondary);
}

.game-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.season-info {
  color: var(--text-secondary);
  font-weight: 500;
}

.game-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

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

/* Enhanced data value styling */
.data-value {
  color: var(--primary-color);
  font-weight: 500;
  font-size: 1.05em;
}

.score-breakdown {
  text-align: center;
}

.team-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: var(--surface-100);
  border-radius: 4px;
}

.team-score .team-name {
  color: var(--text-primary);
  font-weight: 500;
}

.team-score .score {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.team-score .score.winner {
  color: var(--primary-color);
  text-shadow: 0 0 8px rgba(var(--primary-color-rgb, 59, 130, 246), 0.3);
}

.game-result {
  font-weight: bold;
  color: var(--primary-color);
  margin-top: 1rem;
  padding: 0.5rem;
  background: var(--surface-100);
  border-radius: 4px;
}

.relationships-accordion {
  margin-top: 2rem;
}

.team-details {
  padding: 1rem 0;
}

/* Additional enhancement for better visual hierarchy */
.info-row:hover .data-value {
  color: var(--primary-color);
  transform: translateX(2px);
  transition: all 0.2s ease;
}

/* Ensure TBD and fallback text maintains secondary styling */
.text-500 {
  color: var(--text-secondary) !important;
}

.inline-logo {
  width: 60px;
  height: 60px;
  margin-right: 0.5rem;
  vertical-align: middle;
  object-fit: contain;
}

.team-name-with-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>