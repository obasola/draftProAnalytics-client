<!-- src/components/prospect/ProspectReadOnly.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useProspectStore } from '@/stores/prospectStore'
import { useTeamStore } from '@/stores/teamStore'
import { useDraftPickStore } from '@/stores/draftPickStore'
import { usePlayerAwardStore } from '@/stores/playerAwardStore'
import { useCombineScoreStore } from '@/stores/combineScoreStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const prospectStore = useProspectStore()
const teamStore = useTeamStore()
const draftPickStore = useDraftPickStore()
const playerAwardStore = usePlayerAwardStore()
const combineScoreStore = useCombineScoreStore()

const prospect = computed(() => prospectStore.currentProspect)
const relatedTeam = ref(null)
const relatedDraftPick = ref(null)
const relatedAwards = ref([])
const relatedCombineScore = ref(null)

const formatHeight = (height: number) => {
  const feet = Math.floor(height / 12)
  const inches = height % 12
  return `${feet}'${inches}"`
}

const formatTime = (time?: number) => {
  return time ? `${time.toFixed(2)}s` : 'N/A'
}

const formatDistance = (distance?: number, unit = 'in') => {
  return distance ? `${distance}" ${unit}` : 'N/A'
}

const formatReps = (reps?: number) => {
  return reps ? `${reps} reps` : 'N/A'
}

const getPositionSeverity = (position: string) => {
  const severityMap: Record<string, string> = {
    'QB': 'danger',
    'RB': 'success',
    'WR': 'warning',
    'TE': 'info',
    'OL': 'secondary',
    'DL': 'contrast',
    'LB': 'primary',
    'DB': 'help'
  }
  return severityMap[position] || 'secondary'
}

onMounted(async () => {
  if (prospect.value) {
    // Load related team data
    if (prospect.value.teamId) {
      await teamStore.fetchById(prospect.value.teamId)
      relatedTeam.value = teamStore.getTeamById(prospect.value.teamId)
    }

    // Load related draft pick data
    if (prospect.value.draftPickId) {
      await draftPickStore.fetchById(prospect.value.draftPickId)
      relatedDraftPick.value = draftPickStore.getDraftPickById(prospect.value.draftPickId)
    }

    // Load related awards
    await playerAwardStore.fetchByPlayerId(prospect.value.id)
    relatedAwards.value = playerAwardStore.getAwardsByPlayerId(prospect.value.id)

    // Load combine score
    await combineScoreStore.fetchByPlayerId(prospect.value.id)
    relatedCombineScore.value = combineScoreStore.getScoreByPlayerId(prospect.value.id)
  }
})
</script>

<template>
  <Card v-if="prospect" class="prospect-details">
    <template #title>
      {{ prospect.firstName }} {{ prospect.lastName }}
      <Tag 
        :value="prospect.position" 
        :severity="getPositionSeverity(prospect.position)"
        class="ml-2"
      />
    </template>

    <template #content>
      <div class="prospect-info-grid">
        <!-- Basic Information -->
        <div class="info-section">
          <h3>Basic Information</h3>
          <div class="info-row">
            <span class="label">Full Name:</span>
            <span>{{ prospect.firstName }} {{ prospect.lastName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Position:</span>
            <span>{{ prospect.position }}</span>
          </div>
          <div class="info-row">
            <span class="label">College:</span>
            <span>{{ prospect.college }}</span>
          </div>
          <div class="info-row">
            <span class="label">Draft Status:</span>
            <Tag 
              :value="prospect.drafted ? 'Drafted' : 'Available'" 
              :severity="prospect.drafted ? 'success' : 'warning'"
            />
          </div>
          <div class="info-row" v-if="prospect.draftYear">
            <span class="label">Draft Year:</span>
            <span>{{ prospect.draftYear }}</span>
          </div>
        </div>

        <!-- Physical Measurements -->
        <div class="info-section">
          <h3>Physical Measurements</h3>
          <div class="info-row">
            <span class="label">Height:</span>
            <span>{{ formatHeight(prospect.height) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Weight:</span>
            <span>{{ prospect.weight }} lbs</span>
          </div>
          <div class="info-row" v-if="prospect.handSize">
            <span class="label">Hand Size:</span>
            <span>{{ formatDistance(prospect.handSize) }}</span>
          </div>
          <div class="info-row" v-if="prospect.armLength">
            <span class="label">Arm Length:</span>
            <span>{{ formatDistance(prospect.armLength) }}</span>
          </div>
        </div>

        <!-- Background Information -->
        <div class="info-section">
          <h3>Background</h3>
          <div class="info-row" v-if="prospect.homeCity">
            <span class="label">Hometown:</span>
            <span>{{ prospect.homeCity }}<span v-if="prospect.homeState">, {{ prospect.homeState }}</span></span>
          </div>
          <div class="info-row" v-if="prospect.createdAt">
            <span class="label">Added:</span>
            <span>{{ new Date(prospect.createdAt).toLocaleDateString() }}</span>
          </div>
          <div class="info-row" v-if="prospect.updatedAt">
            <span class="label">Last Updated:</span>
            <span>{{ new Date(prospect.updatedAt).toLocaleDateString() }}</span>
          </div>
        </div>

        <!-- Combine Performance -->
        <div class="info-section" v-if="prospect.fortyTime || prospect.verticalLeap || prospect.benchPress">
          <h3>Combine Performance</h3>
          <div class="info-row" v-if="prospect.fortyTime">
            <span class="label">40-Yard Dash:</span>
            <span>{{ formatTime(prospect.fortyTime) }}</span>
          </div>
          <div class="info-row" v-if="prospect.tenYardSplit">
            <span class="label">10-Yard Split:</span>
            <span>{{ formatTime(prospect.tenYardSplit) }}</span>
          </div>
          <div class="info-row" v-if="prospect.verticalLeap">
            <span class="label">Vertical Leap:</span>
            <span>{{ formatDistance(prospect.verticalLeap) }}</span>
          </div>
          <div class="info-row" v-if="prospect.broadJump">
            <span class="label">Broad Jump:</span>
            <span>{{ formatDistance(prospect.broadJump) }}</span>
          </div>
          <div class="info-row" v-if="prospect.threeCone">
            <span class="label">3-Cone Drill:</span>
            <span>{{ formatTime(prospect.threeCone) }}</span>
          </div>
          <div class="info-row" v-if="prospect.twentyYardShuttle">
            <span class="label">20-Yard Shuttle:</span>
            <span>{{ formatTime(prospect.twentyYardShuttle) }}</span>
          </div>
          <div class="info-row" v-if="prospect.benchPress">
            <span class="label">Bench Press:</span>
            <span>{{ formatReps(prospect.benchPress) }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <!-- Team Information -->
        <AccordionTab v-if="relatedTeam" header="Current Team">
          <div class="relationship-content">
            <div class="info-row">
              <span class="label">Team:</span>
              <span>{{ relatedTeam.city }} {{ relatedTeam.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Conference:</span>
              <span>{{ relatedTeam.conference }}</span>
            </div>
            <div class="info-row">
              <span class="label">Division:</span>
              <span>{{ relatedTeam.division }}</span>
            </div>
          </div>
        </AccordionTab>

        <!-- Draft Pick Information -->
        <AccordionTab v-if="relatedDraftPick" header="Draft Pick Details">
          <div class="relationship-content">
            <div class="info-row">
              <span class="label">Draft Year:</span>
              <span>{{ relatedDraftPick.draftYear }}</span>
            </div>
            <div class="info-row">
              <span class="label">Round:</span>
              <span>{{ relatedDraftPick.round }}</span>
            </div>
            <div class="info-row">
              <span class="label">Pick Number:</span>
              <span>{{ relatedDraftPick.pickNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">Combine Score:</span>
              <span>{{ relatedDraftPick.combineScore }}</span>
            </div>
          </div>
        </AccordionTab>

        <!-- Awards -->
        <AccordionTab v-if="relatedAwards.length > 0" header="Awards & Honors">
          <DataTable :value="relatedAwards" responsiveLayout="scroll">
            <Column field="awardName" header="Award" />
            <Column field="awardYear" header="Year" />
            <Column field="awardDescription" header="Description" />
          </DataTable>
        </AccordionTab>

        <!-- Detailed Combine Scores -->
        <AccordionTab v-if="relatedCombineScore" header="Detailed Combine Scores">
          <div class="relationship-content">
            <div class="info-row">
              <span class="label">40-Yard Dash:</span>
              <span>{{ formatTime(relatedCombineScore.fortyTime) }}</span>
            </div>
            <div class="info-row">
              <span class="label">10-Yard Split:</span>
              <span>{{ formatTime(relatedCombineScore.tenYardSplit) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Vertical Leap:</span>
              <span>{{ formatDistance(relatedCombineScore.verticalLeap) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Broad Jump:</span>
              <span>{{ formatDistance(relatedCombineScore.broadJump) }}</span>
            </div>
            <div class="info-row">
              <span class="label">3-Cone Drill:</span>
              <span>{{ formatTime(relatedCombineScore.threeCone) }}</span>
            </div>
            <div class="info-row">
              <span class="label">20-Yard Shuttle:</span>
              <span>{{ formatTime(relatedCombineScore.twentyYardShuttle) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Bench Press:</span>
              <span>{{ formatReps(relatedCombineScore.benchPress) }}</span>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>

<style scoped>
.prospect-details {
  max-width: 1000px;
  margin: 0 auto;
}

.prospect-info-grid {
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
  padding: 1rem 0;
}
</style>