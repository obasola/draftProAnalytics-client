<!-- src/modules/roster/presentation/components/rosterPlayer/RosterPlayerReadOnly.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRosterPlayerStore } from '../../application/stores/rosterPlayerStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import { useRouter } from 'vue-router'

const rosterPlayerStore = useRosterPlayerStore()
const router = useRouter()

const rosterPlayer = computed(() => rosterPlayerStore.currentRosterPlayer)

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const getInjurySeverity = (status: string | null) => {
  if (!status || status === 'HEALTHY') return 'success'
  if (status === 'QUESTIONABLE') return 'info'
  if (status === 'DOUBTFUL') return 'warning'
  return 'danger'
}

const getInjuryLabel = (status: string | null) => {
  if (!status) return 'Healthy'
  return status.replace(/_/g, ' ')
}

const getPerformanceGradeSeverity = (grade: number) => {
  if (grade >= 80) return 'success'
  if (grade >= 60) return 'info'
  if (grade >= 40) return 'warning'
  return 'danger'
}

const getPositionGroupLabel = (group: string) => {
  const groups: Record<string, string> = {
    OFF: 'Offense',
    DEF: 'Defense',
    ST: 'Special Teams'
  }
  return groups[group] || group
}

const editRosterPlayer = () => {
  if (rosterPlayer.value?.id) {
    router.push(`/roster-players/${rosterPlayer.value.id}?mode=edit`)
  }
}

const backToList = () => {
  router.push('/roster-players')
}
</script>

<template>
  <Card v-if="rosterPlayer" class="roster-player-details">
    <template #title>
      <div class="title-header">
        <div class="title-main">
          <span class="player-name">{{ rosterPlayer.playerName }}</span>
          <Tag 
            :value="rosterPlayer.position"
            :severity="rosterPlayer.positionGroup === 'OFF' ? 'info' : rosterPlayer.positionGroup === 'DEF' ? 'danger' : 'warning'"
            class="position-tag"
          />
          <Tag 
            v-if="rosterPlayer.isStarter"
            value="Starter"
            severity="success"
            class="starter-tag"
          />
        </div>
        <div class="title-actions">
          <Button
            @click="editRosterPlayer"
            label="Edit"
            icon="pi pi-pencil"
            class="p-button-warning p-button-sm"
          />
          <Button
            @click="backToList"
            label="Back to Roster"
            icon="pi pi-arrow-left"
            class="p-button-secondary p-button-sm"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div class="player-info-grid">
        <!-- Basic Information -->
        <div class="info-section">
          <h3>Player Information</h3>
          <div class="info-row">
            <span class="label">Player Name:</span>
            <span class="value">{{ rosterPlayer.playerName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Position:</span>
            <Tag 
              :value="rosterPlayer.position"
              :severity="rosterPlayer.positionGroup === 'OFF' ? 'info' : rosterPlayer.positionGroup === 'DEF' ? 'danger' : 'warning'"
            />
          </div>
          <div class="info-row">
            <span class="label">Position Group:</span>
            <span class="value">{{ getPositionGroupLabel(rosterPlayer.positionGroup) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Age:</span>
            <span class="value">{{ rosterPlayer.age }} years old</span>
          </div>
          <div class="info-row">
            <span class="label">Experience:</span>
            <span class="value">{{ rosterPlayer.yearsExperience }} {{ rosterPlayer.yearsExperience === 1 ? 'year' : 'years' }}</span>
          </div>
          <div v-if="rosterPlayer.playerId" class="info-row">
            <span class="label">ESPN ID:</span>
            <span class="value">{{ rosterPlayer.playerId }}</span>
          </div>
        </div>

        <!-- Roster Status -->
        <div class="info-section">
          <h3>Roster Status</h3>
          <div class="info-row">
            <span class="label">Depth Chart:</span>
            <span class="value depth-chart-badge" :class="{ 'starter-badge': rosterPlayer.depthChartOrder === 1 }">
              #{{ rosterPlayer.depthChartOrder }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Starter:</span>
            <Tag 
              :severity="rosterPlayer.isStarter ? 'success' : 'secondary'"
              :value="rosterPlayer.isStarter ? 'Yes' : 'No'"
            />
          </div>
          <div class="info-row">
            <span class="label">Performance Grade:</span>
            <div class="performance-grade">
              <Tag 
                :severity="getPerformanceGradeSeverity(rosterPlayer.performanceGrade)"
                :value="rosterPlayer.performanceGrade.toFixed(2)"
              />
              <ProgressBar 
                :value="rosterPlayer.performanceGrade"
                :showValue="false"
                class="grade-bar"
              />
            </div>
          </div>
          <div class="info-row">
            <span class="label">Health Status:</span>
            <Tag 
              :severity="getInjurySeverity(rosterPlayer.injuryStatus)"
              :value="getInjuryLabel(rosterPlayer.injuryStatus)"
            />
          </div>
          <div class="info-row">
            <span class="label">Contract:</span>
            <span class="value">{{ rosterPlayer.contractYearsRemaining }} {{ rosterPlayer.contractYearsRemaining === 1 ? 'year' : 'years' }} remaining</span>
          </div>
        </div>

        <!-- Notes Section (Full Width) -->
        <div v-if="rosterPlayer.notes" class="info-section notes-section">
          <h3>Notes</h3>
          <div class="notes-content">
            {{ rosterPlayer.notes }}
          </div>
        </div>
      </div>

      <!-- Metadata -->
      <div class="metadata-section">
        <div class="metadata-row">
          <span class="label">Created:</span>
          <span class="value">{{ formatDate(rosterPlayer.createdAt) }}</span>
        </div>
        <div class="metadata-row">
          <span class="label">Last Updated:</span>
          <span class="value">{{ formatDate(rosterPlayer.updatedAt) }}</span>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Performance History">
          <div class="relationship-content">
            <p><em>Performance metrics and historical data...</em></p>
            <p>This section would display:</p>
            <ul>
              <li>Season-by-season performance statistics</li>
              <li>Performance grade trends over time</li>
              <li>Comparative analysis with position peers</li>
              <li>Key performance indicators by game</li>
            </ul>
          </div>
        </AccordionTab>

        <AccordionTab header="Team History">
          <div class="relationship-content">
            <p><strong>Current Team ID:</strong> {{ rosterPlayer.teamId }}</p>
            <p><em>Team roster history would be loaded...</em></p>
            <p>This would show:</p>
            <ul>
              <li>Previous teams and tenures</li>
              <li>Position changes over career</li>
              <li>Team performance during tenure</li>
              <li>Contract history</li>
            </ul>
          </div>
        </AccordionTab>

        <AccordionTab header="Injury History">
          <div class="relationship-content">
            <p><strong>Current Status:</strong> {{ getInjuryLabel(rosterPlayer.injuryStatus) }}</p>
            <p><em>Detailed injury history...</em></p>
            <p>This could include:</p>
            <ul>
              <li>Previous injuries and recovery times</li>
              <li>Games missed due to injury</li>
              <li>Impact on performance metrics</li>
              <li>Injury risk assessment</li>
            </ul>
          </div>
        </AccordionTab>

        <AccordionTab header="Depth Chart Analysis">
          <div class="relationship-content">
            <p><strong>Current Depth:</strong> #{{ rosterPlayer.depthChartOrder }} at {{ rosterPlayer.position }}</p>
            <p><em>Depth chart context and competition...</em></p>
            <p>This would display:</p>
            <ul>
              <li>Position group depth chart</li>
              <li>Competition at position</li>
              <li>Historical depth chart movement</li>
              <li>Starter probability trends</li>
            </ul>
          </div>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>

<style scoped>
.roster-player-details {
  max-width: 1200px;
  margin: 0 auto;
}

.title-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.player-name {
  font-size: 1.5rem;
  font-weight: bold;
}

.position-tag {
  font-size: 1rem;
}

.starter-tag {
  font-size: 0.875rem;
}

.title-actions {
  display: flex;
  gap: 0.5rem;
}

.player-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.notes-section {
  grid-column: 1 / -1;
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
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: var(--text-primary);
}

.value {
  color: var(--text-secondary);
}

.depth-chart-badge {
  font-weight: bold;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  background-color: var(--surface-200);
}

.starter-badge {
  background-color: var(--green-100);
  color: var(--green-700);
}

.performance-grade {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  max-width: 250px;
}

.grade-bar {
  flex: 1;
  height: 0.5rem;
}

.notes-content {
  padding: 1rem;
  background-color: var(--surface-50);
  border-radius: 4px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.metadata-section {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background-color: var(--surface-50);
  border-radius: 4px;
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.metadata-row {
  display: flex;
  gap: 0.5rem;
}

.metadata-row .label {
  font-weight: 600;
}

.metadata-row .value {
  color: var(--text-secondary);
}

.relationships-accordion {
  margin-top: 2rem;
}

.relationship-content {
  padding: 1rem;
}

.relationship-content p {
  margin-bottom: 0.5rem;
}

.relationship-content ul {
  margin-left: 1rem;
  margin-top: 0.5rem;
}

.relationship-content li {
  margin-bottom: 0.25rem;
}
</style>