<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import type { Game } from '@/types'

const gameStore = useGameStore()

const game = computed(() => gameStore.currentGame)

// Statistics state
const homeTeamGames = ref<Game[]>([])
const awayTeamGames = ref<Game[]>([])
const statsLoading = ref(false)

onMounted(async () => {
  await loadTeamStatistics()
})

const loadTeamStatistics = async () => {
  if (!game.value) return
  
  statsLoading.value = true
  try {
    // Fetch all games for both teams in the current season
    const [homeGames, awayGames] = await Promise.all([
      gameStore.fetchAllGamesForSeason(game.value.homeTeamId, game.value.seasonYear),
      gameStore.fetchAllGamesForSeason(game.value.awayTeamId, game.value.seasonYear)
    ])
    
    homeTeamGames.value = homeGames || []
    awayTeamGames.value = awayGames || []
  } catch (error) {
    console.error('Error loading team statistics:', error)
  } finally {
    statsLoading.value = false
  }
}

// Helper function to calculate team statistics
const calculateTeamStats = (teamId: number, teamGames: Game[], teamConference: string, teamDivision: string) => {
  const stats = {
    season: { won: 0, lost: 0 },
    conference: { won: 0, lost: 0 },
    division: { won: 0, lost: 0 }
  }

  teamGames.forEach(gameRecord => {
    // Skip games that haven't been played yet
    if (gameRecord.homeScore === null || gameRecord.homeScore === undefined || 
        gameRecord.awayScore === null || gameRecord.awayScore === undefined) {
      return
    }

    const isHomeTeam = gameRecord.homeTeamId === teamId
    const teamScore = isHomeTeam ? gameRecord.homeScore : gameRecord.awayScore
    const opponentScore = isHomeTeam ? gameRecord.awayScore : gameRecord.homeScore
    const opponentTeam = isHomeTeam ? gameRecord.awayTeam : gameRecord.homeTeam
    
    const won = teamScore > opponentScore
    
    // Season record
    if (won) {
      stats.season.won++
    } else {
      stats.season.lost++
    }
    
    // Conference record (same conference, different team)
    if (opponentTeam.conference === teamConference) {
      if (won) {
        stats.conference.won++
      } else {
        stats.conference.lost++
      }
    }
    
    // Division record (same division, different team)
    if (opponentTeam.division === teamDivision) {
      if (won) {
        stats.division.won++
      } else {
        stats.division.lost++
      }
    }
  })

  return stats
}

// Computed statistics for both teams
const homeTeamStats = computed(() => {
  if (!game.value || homeTeamGames.value.length === 0) {
    return { season: { won: 0, lost: 0 }, conference: { won: 0, lost: 0 }, division: { won: 0, lost: 0 } }
  }
  
  return calculateTeamStats(
    game.value.homeTeamId, 
    homeTeamGames.value, 
    game.value.homeTeam.conference || '', 
    game.value.homeTeam.division || ''
  )
})

const awayTeamStats = computed(() => {
  if (!game.value || awayTeamGames.value.length === 0) {
    return { season: { won: 0, lost: 0 }, conference: { won: 0, lost: 0 }, division: { won: 0, lost: 0 } }
  }
  
  return calculateTeamStats(
    game.value.awayTeamId, 
    awayTeamGames.value, 
    game.value.awayTeam.conference || '', 
    game.value.awayTeam.division || ''
  )
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
        <!-- Home Team Details with Statistics -->
        <AccordionTab :header="`${game.homeTeam.name} Details & Statistics`">
          <div class="team-details">
            <!-- Team Basic Info -->
            <div class="team-basic-info">
              <h4>Team Information</h4>
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

            <Divider />

            <!-- Team Statistics -->
            <div class="team-statistics">
              <h4>STANDING</h4>
              <div v-if="statsLoading" class="loading-stats">
                Loading statistics...
              </div>
              <div v-else class="standings-grid">
                <div class="standing-section">
                  <h5>Conference</h5>
                  <div class="record-row">
                    <span class="record-label">won:</span>
                    <span class="record-value">{{ homeTeamStats.conference.won }}</span>
                  </div>
                  <div class="record-row">
                    <span class="record-label">lost:</span>
                    <span class="record-value">{{ homeTeamStats.conference.lost }}</span>
                  </div>
                </div>

                <div class="standing-section">
                  <h5>Division</h5>
                  <div class="record-row">
                    <span class="record-label">won:</span>
                    <span class="record-value">{{ homeTeamStats.division.won }}</span>
                  </div>
                  <div class="record-row">
                    <span class="record-label">lost:</span>
                    <span class="record-value">{{ homeTeamStats.division.lost }}</span>
                  </div>
                </div>

                <div class="standing-section season-section">
                  <h5>Season:</h5>
                  <span class="season-record">
                    won: {{ homeTeamStats.season.won }} lost: {{ homeTeamStats.season.lost }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AccordionTab>

        <!-- Away Team Details with Statistics -->
        <AccordionTab :header="`${game.awayTeam.name} Details & Statistics`">
          <div class="team-details">
            <!-- Team Basic Info -->
            <div class="team-basic-info">
              <h4>Team Information</h4>
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

            <Divider />

            <!-- Team Statistics -->
            <div class="team-statistics">
              <h4>STANDING</h4>
              <div v-if="statsLoading" class="loading-stats">
                Loading statistics...
              </div>
              <div v-else class="standings-grid">
                <div class="standing-section">
                  <h5>Conference</h5>
                  <div class="record-row">
                    <span class="record-label">won:</span>
                    <span class="record-value">{{ awayTeamStats.conference.won }}</span>
                  </div>
                  <div class="record-row">
                    <span class="record-label">lost:</span>
                    <span class="record-value">{{ awayTeamStats.conference.lost }}</span>
                  </div>
                </div>

                <div class="standing-section">
                  <h5>Division</h5>
                  <div class="record-row">
                    <span class="record-label">won:</span>
                    <span class="record-value">{{ awayTeamStats.division.won }}</span>
                  </div>
                  <div class="record-row">
                    <span class="record-label">lost:</span>
                    <span class="record-value">{{ awayTeamStats.division.lost }}</span>
                  </div>
                </div>

                <div class="standing-section season-section">
                  <h5>Season:</h5>
                  <span class="season-record">
                    won: {{ awayTeamStats.season.won }} lost: {{ awayTeamStats.season.lost }}
                  </span>
                </div>
              </div>
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

/* Team Statistics Styling */
.team-basic-info h4,
.team-statistics h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.team-statistics {
  margin-top: 1rem;
}

.standings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
}

.season-section {
  grid-column: 1 / -1;
  text-align: center;
  padding: 1rem;
  background: var(--surface-100);
  border-radius: 6px;
  border: 2px solid var(--primary-color);
}

.standing-section h5 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border-color);
}

.record-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--surface-50);
  border-radius: 4px;
}

.record-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.record-value {
  font-weight: bold;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.season-section h5 {
  display: inline;
  margin-right: 1rem;
  border: none;
  padding: 0;
}

.season-record {
  font-weight: bold;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.loading-stats {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 2rem;
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

/* Responsive design for smaller screens */
@media (max-width: 768px) {
  .standings-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .season-section {
    grid-column: 1;
  }
  
  .matchup-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .score-display {
    margin: 0;
  }
}
</style>