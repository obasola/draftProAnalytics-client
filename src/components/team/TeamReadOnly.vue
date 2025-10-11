<!-- src/components/team/TeamReadOnly.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useTeamStore } from '@/stores/teamStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { gameService } from '@/services/gameService'
import type { Player, PaginatedResponse } from '@/types'
import type { TeamStatistics } from '@/services/gameService'
import TeamDraftPickTable from './TeamDraftPickTable.vue'
import TeamScheduleGamesTable from './TeamScheduleGamesTable.vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme.store'

const route = useRoute()
const themeStore = useThemeStore()
const currentDate: Date = new Date()
const currentYear: number = currentDate.getFullYear()

const teamStore = useTeamStore()
const router = useRouter()

const team = computed(() => teamStore.currentTeam)
const players = ref<Player[]>([])
const playersLoading = ref(false)
const playersError = ref<string | null>(null)

const teamStats = ref<TeamStatistics | null>(null)
const statsLoading = ref(false)
const statsError = ref<string | null>(null)

// Computed values for display
const calc = computed(() => {
  if (!teamStats.value) {
    return {
      wlRecord: 'Loading...',
      conferenceRecord: 'Loading...',
      divisionRecord: 'Loading...',
      homeWL: 'Loading...',
      awayWL: 'Loading...',
      positionInDivision: 'Loading...',
    }
  }

  const {
    overallRecord,
    conferenceRecord,
    divisionRecord,
    homeRecord,
    awayRecord,
    divisionPosition,
    divisionTotal
  } = teamStats.value

  const formatRecord = (rec: { wins: number; losses: number; ties: number }) =>
    `${rec.wins}-${rec.losses}${rec.ties > 0 ? `-${rec.ties}` : ''}`

  let position = 'Out of running'
  if (divisionPosition === 1) position = '1st place'
  else if (divisionPosition === 2) position = '2nd place'
  else if (divisionPosition === 3) position = '3rd place'
  else if (divisionPosition === 4) position = '4th place'

  return {
    wlRecord: formatRecord(overallRecord),
    conferenceRecord: formatRecord(conferenceRecord),
    divisionRecord: formatRecord(divisionRecord),
    homeWL: formatRecord(homeRecord),
    awayWL: formatRecord(awayRecord),
    positionInDivision: `${position} (${divisionPosition}/${divisionTotal})`,
  }
})

const loadTeamPlayers = async (teamId: number) => {
  playersLoading.value = true
  playersError.value = null
  try {
    const response = await apiService.get<PaginatedResponse<Player>>(`/players/team/${teamId}`)
    players.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to load team players:', error)
    playersError.value = 'Failed to load team players'
    players.value = []
  } finally {
    playersLoading.value = false
  }
}

const loadTeamStatistics = async (teamId: number, seasonYear: number) => {
  statsLoading.value = true
  statsError.value = null
  try {
    teamStats.value = await gameService.getTeamStatistics(teamId, seasonYear.toString())
  } catch (error) {
    console.error('Failed to load team statistics:', error)
    statsError.value = 'Failed to load team statistics'
    teamStats.value = null
  } finally {
    statsLoading.value = false
  }
}

const getTeamLogo = (team: any): string => {
  if (!team || !team.name || !team.conference) return ''

  const lastWord = team.name.trim().split(/\s+/).pop() || ''
  const ext = lastWord === 'Chargers' ? 'webp' : 'avif'

  return `/images/${team.conference.toLowerCase()}/${lastWord}.${ext}`
}

onMounted(async () => {
  if (route.params.teamId && typeof route.params.teamId === 'string') {
    await themeStore.selectTeam(route.params.teamId)
  }
  if (team.value?.id) {
    await Promise.all([
      loadTeamPlayers(team.value.id),
      loadTeamStatistics(team.value.id, currentYear)
    ])
  }
})

watch(
  () => team.value?.id,
  async (newTeamId) => {
    if (newTeamId) {
      await Promise.all([
        loadTeamPlayers(newTeamId),
        loadTeamStatistics(newTeamId, currentYear)
      ])
    }
  }
)

const viewPlayer = (playerId: number) => {
  router.push(`/players/${playerId}?mode=read`)
}

const editPlayer = (playerId: number) => {
  router.push(`/players/${playerId}?mode=edit`)
}

const createPlayer = () => {
  router.push(`/players?mode=create&teamId=${team.value?.id}`)
}
</script>

<template>
  <Card v-if="team" class="team-details bg-team-primary text-team-accent">
    <template #title>
      {{ team.name }}
    </template>
    <template #subtitle style="background-color: #054DBD;">
      {{ team.city }}, {{ team.state }} - {{ team.conference }} {{ team.division }}
    </template>

    <template #content>
      <div class="team-info-grid bg-team-primary text-team-accent">
        <div class="info-section">
          <div class="info-row">
            <h3 class="team-name-with-logo">
              <img :src="getTeamLogo(team)" :alt="team.name" class="inline-logo" />
              {{ team.name }}
            </h3>
          </div>
          <h3>Team Information</h3>

          <div class="info-row">
            <span class="label">City:</span>
            <span class="value">{{ team.city }}</span>
          </div>
          <div class="info-row">
            <span class="label">State:</span>
            <span class="value">{{ team.state }}</span>
          </div>
          <div class="info-row">
            <span class="label">Country:</span>
            <span class="value">{{ team.country }}</span>
          </div>
          <div class="info-row">
            <span class="label">Stadium:</span>
            <span class="value">{{ team.stadium }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Season Statistics</h3>
          <div class="info-row">
            <span class="label">Won/Loss):</span>
            <span class="value">{{ calc.wlRecord }}</span>
          </div>
          <div class="info-row">
            <span class="label">Conference (W/L):</span>
            <span class="value">{{ calc.conferenceRecord }}</span>
          </div>
          <div class="info-row">
            <span class="label">Division (W/L):</span>
            <span class="value">{{ calc.divisionRecord }}</span>
          </div>
          <div class="info-row">
            <span class="label">Home W/L:</span>
            <span class="value">{{ calc.homeWL }}</span>
          </div>
          <div class="info-row">
            <span class="label">Away W/L:</span>
            <span class="value">{{ calc.awayWL }}</span>
          </div>
          <div class="info-row">
            <span class="label">Division Standing:</span>
            <span class="value">{{ calc.positionInDivision }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Players">
          <div class="players-section">
            <div class="section-header">
              <h4>Team Roster</h4>
              <Button @click="createPlayer" label="Add Player" icon="pi pi-plus" class="p-button-success p-button-sm" />
            </div>

            <div v-if="playersLoading" class="loading-message">
              <i class="pi pi-spinner pi-spin"></i> Loading players...
            </div>

            <div v-else-if="playersError" class="error-message">
              <i class="pi pi-exclamation-triangle"></i> {{ playersError }}
            </div>

            <div v-else-if="players.length === 0" class="empty-message">
              <i class="pi pi-info-circle"></i> No players found for this team.
              <Button @click="createPlayer" label="Add First Player" icon="pi pi-plus" class="p-button-link" />
            </div>

            <DataTable v-else :value="players" responsiveLayout="scroll" :paginator="players.length > 10" :rows="10"
              sortField="lastName" :sortOrder="1">
              <Column header="Name" sortable>
                <template #body="{ data }">
                  <span class="player-name">
                    {{ data.firstName }} {{ data.lastName }}
                  </span>
                </template>
              </Column>
              <Column field="position" header="Position" sortable />
              <Column field="height" header="Height" sortable>
                <template #body="{ data }">
                  <span v-if="data.height">{{ Math.floor(data.height / 12) }}'{{ data.height % 12 }}"</span>
                  <span v-else>-</span>
                </template>
              </Column>
              <Column field="weight" header="Weight" sortable>
                <template #body="{ data }">
                  <span v-if="data.weight">{{ data.weight }} lbs</span>
                  <span v-else>-</span>
                </template>
              </Column>
              <Column field="college" header="College" sortable />
              <Column field="experience" header="Experience" sortable>
                <template #body="{ data }">
                  <span v-if="data.experience !== undefined">{{ data.experience }} years</span>
                  <span v-else>Rookie</span>
                </template>
              </Column>
              <Column header="Actions">
                <template #body="{ data }">
                  <div class="action-buttons">
                    <Button @click="viewPlayer(data.id)" icon="pi pi-eye" class="p-button-info p-button-sm"
                      v-tooltip="'View Player'" />
                    <Button @click="editPlayer(data.id)" icon="pi pi-pencil" class="p-button-warning p-button-sm"
                      v-tooltip="'Edit Player'" />
                  </div>
                </template>
              </Column>
            </DataTable>

            <div v-if="players.length > 0" class="players-summary">
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-label">Total Players:</span>
                  <span class="stat-value">{{ players.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average Height:</span>
                  <span class="stat-value">
                    {{
                      players.filter(p => p.height).length > 0
                        ? Math.round(
                          players.filter(p => p.height).reduce((sum, p) => sum + p.height, 0) /
                          players.filter(p => p.height).length
                        ) + 'feet'
                        : 'N/A'
                    }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average Weight:</span>
                  <span class="stat-value">
                    {{
                      players.filter(p => p.weight).length > 0
                        ? Math.round(
                          players.filter(p => p.weight).reduce((sum, p) => sum + p.weight, 0) /
                          players.filter(p => p.weight).length
                        ) + ' lbs'
                        : 'N/A'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab header="Schedule">
          <TeamScheduleGamesTable :team-id="team?.id" :initialSeasonYear="currentYear" />
        </AccordionTab>

        <AccordionTab header="Draft Picks">
          <TeamDraftPickTable :team-id="team?.id" :initialYear="currentYear" />
        </AccordionTab>

        <AccordionTab header="Team Needs">
          <p>Team draft needs will be displayed here when team needs relationships are implemented.</p>
        </AccordionTab>

        <AccordionTab header="Playoff Results">
          <p>Playoff history will be displayed here when post-season results are implemented.</p>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>

<style scoped>
.team-details {
  max-width: 1000px;
  margin: 0 auto;
}

.team-info-grid {
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

.value {
  font-weight: 500;
  color: #2563eb;
}

.relationships-accordion {
  margin-top: 2rem;
}

.players-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.section-header h4 {
  margin: 0;
  color: var(--text-color);
}

.loading-message,
.error-message,
.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.error-message {
  color: var(--red-500);
}

.loading-message i {
  margin-right: 0.5rem;
}

.player-name {
  font-weight: 500;
  color: var(--text-color);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.players-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.summary-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.team-name-with-logo {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.inline-logo {
  height: 32px;
  width: auto;
}
</style>