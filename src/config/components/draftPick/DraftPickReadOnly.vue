<!-- src/components/draftpick/DraftPickReadOnly.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDraftPickStore } from '@/stores/draftPickStore'
import { useTeamStore } from '@/stores/teamStore'
import { useProspectStore } from '@/stores/prospectStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

const draftPickStore = useDraftPickStore()
const teamStore = useTeamStore()
const prospectStore = useProspectStore()

const draftPick = computed(() => draftPickStore.currentDraftPick)

const team = computed(() => {
  if (draftPick.value?.teamId) {
    return teamStore.getTeamById(draftPick.value.teamId)
  }
  return null
})

const prospect = computed(() => {
  if (draftPick.value?.playerId) {
    return prospectStore.getProspectById(draftPick.value.playerId)
  }
  return null
})

const formatPickInfo = computed(() => {
  if (!draftPick.value) return ''
  return `Round ${draftPick.value.round}, Pick ${draftPick.value.pickNumber}`
})

const formatPlayerName = computed(() => {
  if (draftPick.value?.playerFirstName && draftPick.value?.playerLastName) {
    return `${draftPick.value.playerFirstName} ${draftPick.value.playerLastName}`
  }
  if (prospect.value) {
    return `${prospect.value.firstName} ${prospect.value.lastName}`
  }
  return draftPick.value?.playerId ? `Player ID: ${draftPick.value.playerId}` : 'Unassigned'
})

onMounted(async () => {
  // Load related data
  await Promise.all([
    teamStore.fetchAll(),
    prospectStore.fetchAll()
  ])
})
</script>

<template>
  <Card v-if="draftPick" class="draftpick-details">
    <template #title>
      {{ draftPick.draftYear }} NFL Draft - {{ formatPickInfo }}
    </template>

    <template #content>
      <div class="draftpick-info-grid">
        <div class="info-section">
          <h3>Draft Information</h3>
          <div class="info-row">
            <span class="label">Draft Year:</span>
            <span>{{ draftPick.draftYear }}</span>
          </div>
          <div class="info-row">
            <span class="label">Round:</span>
            <span>{{ draftPick.round }}</span>
          </div>
          <div class="info-row">
            <span class="label">Pick Number:</span>
            <span>{{ draftPick.pickNumber }}</span>
          </div>
          <div class="info-row">
            <span class="label">Pick Range:</span>
            <span>{{ draftPick.pickFrom }} - {{ draftPick.pickTo }}</span>
          </div>
          <div class="info-row">
            <span class="label">Combine Score:</span>
            <span>{{ draftPick.combineScore?.toFixed(2) || 'N/A' }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Player Information</h3>
          <div class="info-row">
            <span class="label">Player:</span>
            <span>{{ formatPlayerName }}</span>
          </div>
          <div class="info-row" v-if="draftPick.playerId">
            <span class="label">Player ID:</span>
            <span>{{ draftPick.playerId }}</span>
          </div>
          <div class="info-row" v-if="prospect">
            <span class="label">Position:</span>
            <span>{{ prospect.position }}</span>
          </div>
          <div class="info-row" v-if="prospect">
            <span class="label">College:</span>
            <span>{{ prospect.college }}</span>
          </div>
        </div>

        <div class="info-section" v-if="team">
          <h3>Team Information</h3>
          <div class="info-row">
            <span class="label">Team:</span>
            <span>{{ team.city }} {{ team.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Conference:</span>
            <span>{{ team.conference }}</span>
          </div>
          <div class="info-row">
            <span class="label">Division:</span>
            <span>{{ team.division }}</span>
          </div>
          <div class="info-row">
            <span class="label">Stadium:</span>
            <span>{{ team.stadium }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Player Details" v-if="prospect">
          <div class="relationship-content">
            <div class="info-row">
              <span class="label">Height:</span>
              <span>{{ prospect.height }}"</span>
            </div>
            <div class="info-row">
              <span class="label">Weight:</span>
              <span>{{ prospect.weight }} lbs</span>
            </div>
            <div class="info-row" v-if="prospect.fortyTime">
              <span class="label">40 Yard Dash:</span>
              <span>{{ prospect.fortyTime }}s</span>
            </div>
            <div class="info-row" v-if="prospect.verticalLeap">
              <span class="label">Vertical Leap:</span>
              <span>{{ prospect.verticalLeap }}"</span>
            </div>
            <div class="info-row" v-if="prospect.benchPress">
              <span class="label">Bench Press:</span>
              <span>{{ prospect.benchPress }} reps</span>
            </div>
            <div class="info-row" v-if="prospect.homeCity && prospect.homeState">
              <span class="label">Hometown:</span>
              <span>{{ prospect.homeCity }}, {{ prospect.homeState }}</span>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab header="Draft Analysis">
          <div class="relationship-content">
            <div class="info-row">
              <span class="label">Expected Range:</span>
              <span>Picks {{ draftPick.pickFrom }} - {{ draftPick.pickTo }}</span>
            </div>
            <div class="info-row">
              <span class="label">Actual Pick:</span>
              <span>Pick {{ draftPick.pickNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">Draft Position:</span>
              <span>
                {{ draftPick.pickNumber < draftPick.pickFrom ? 'Reached' :
                   draftPick.pickNumber > draftPick.pickTo ? 'Steal' : 'As Expected' }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Combine Performance:</span>
              <span>{{ draftPick.combineScore > 75 ? 'Excellent' :
                      draftPick.combineScore > 50 ? 'Good' :
                      draftPick.combineScore > 25 ? 'Average' : 'Below Average' }}</span>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>

<style scoped>
.draftpick-details {
  max-width: 1000px;
  margin: 0 auto;
}

.draftpick-info-grid {
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

.relationships-accordion {
  margin-top: 2rem;
}

.relationship-content {
  padding: 1rem;
}
</style>