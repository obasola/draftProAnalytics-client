<!-- src/components/team/TeamReadOnly.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useTeamStore } from '@/stores/teamStore'
import { useRosterPlayerStore } from '@/modules/roster/application/stores/rosterPlayerStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { gameService } from '@/services/gameService'
import type { TeamStatistics } from '@/services/gameService'
import TeamDraftPickTable from './TeamDraftPickTable.vue'
import TeamScheduleGamesTable from './TeamScheduleGamesTable.vue'
import RosterPlayerList from '@/modules/roster/presentation/components/RosterPlayerList.vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme.store'

const route = useRoute()
const themeStore = useThemeStore()
const currentDate: Date = new Date()
const currentYear: number = currentDate.getFullYear()

const teamStore = useTeamStore()
const rosterPlayerStore = useRosterPlayerStore()
const router = useRouter()

const team = computed(() => teamStore.currentTeam)

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

const loadTeamRoster = async (teamId: number) => {
  try {
    await rosterPlayerStore.fetchByTeamId(teamId)
  } catch (error) {
    console.error('Failed to load team roster:', error)
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
      loadTeamRoster(team.value.id),
      loadTeamStatistics(team.value.id, currentYear)
    ])
  }
})

watch(
  () => team.value?.id,
  async (newTeamId) => {
    if (newTeamId) {
      await Promise.all([
        loadTeamRoster(newTeamId),
        loadTeamStatistics(newTeamId, currentYear)
      ])
    }
  }
)

const createRosterPlayer = () => {
  router.push(`/roster-players?mode=create&teamId=${team.value?.id}`)
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
        <AccordionTab header="Roster">
          <div class="roster-section">
            <RosterPlayerList />
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
/* Replace the .team-details style in TeamReadOnly.vue with: */

.team-details {
  width: 100%;
  margin: 0;
  max-width: none; /* Removed the 1000px constraint */
  box-sizing: border-box;
}

.team-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  box-sizing: border-box;
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
  width: 100%;
}

.roster-section {
  width: 100%;
  box-sizing: border-box;
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

/* Ensure all nested elements use full width */
:deep(.p-card),
:deep(.p-datatable),
:deep(.p-accordion) {
  width: 100%;
  box-sizing: border-box;
}
</style>