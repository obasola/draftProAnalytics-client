<!-- src/components/playerTeam/PlayerTeamReadOnly.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePlayerTeamStore } from '@/stores/playerTeamStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'

const playerTeamStore = usePlayerTeamStore()
const router = useRouter()

const playerTeam = computed(() => playerTeamStore.currentPlayerTeam)

onMounted(async () => {
  // Load any related data if needed
})

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const calculateTenureDuration = () => {
  if (!playerTeam.value?.startDate) return 'N/A'
  
  const startDate = new Date(playerTeam.value.startDate)
  const endDate = playerTeam.value.endDate 
    ? new Date(playerTeam.value.endDate)
    : new Date()
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`
  }
  return `${months} month${months > 1 ? 's' : ''}`
}

const editPlayerTeam = () => {
  if (playerTeam.value?.id) {
    router.push(`/player-teams/${playerTeam.value.id}?mode=edit`)
  }
}

const backToList = () => {
  router.push('/player-teams')
}
</script>

<template>
  <Card v-if="playerTeam" class="playerteam-details">
    <template #title>
      <div class="title-header">
        <span>Player Team Relationship - ID: {{ playerTeam.id }}</span>
        <div class="title-actions">
          <Button
            @click="editPlayerTeam"
            label="Edit"
            icon="pi pi-pencil"
            class="p-button-warning p-button-sm"
          />
          <Button
            @click="backToList"
            label="Back to List"
            icon="pi pi-arrow-left"
            class="p-button-secondary p-button-sm"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div class="playerteam-info-grid">
        <!-- Basic Information -->
        <div class="info-section">
          <h3>Basic Information</h3>
          <div class="info-row">
            <span class="label">ID:</span>
            <span>{{ playerTeam.id }}</span>
          </div>
          <div class="info-row">
            <span class="label">Player ID:</span>
            <span>{{ playerTeam.playerId }}</span>
          </div>
          <div class="info-row">
            <span class="label">Team ID:</span>
            <span>{{ playerTeam.teamId }}</span>
          </div>
          <div class="info-row">
            <span class="label">Current Team:</span>
            <Tag 
              :severity="playerTeam.currentTeam ? 'success' : 'warning'"
              :value="playerTeam.currentTeam ? 'Yes' : 'No'"
            />
          </div>
        </div>

        <!-- Timeline Information -->
        <div class="info-section">
          <h3>Timeline</h3>
          <div class="info-row">
            <span class="label">Start Date:</span>
            <span>{{ formatDate(playerTeam.startDate) }}</span>
          </div>
          <div class="info-row">
            <span class="label">End Date:</span>
            <span>{{ formatDate(playerTeam.endDate) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Duration:</span>
            <span>{{ calculateTenureDuration() }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span>{{ playerTeam.endDate ? 'Completed Tenure' : 'Active Tenure' }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Player Information">
          <div class="relationship-content">
            <p><strong>Player ID:</strong> {{ playerTeam.playerId }}</p>
            <p><em>Player details would be loaded from Player module...</em></p>
            <p>This would show:</p>
            <ul>
              <li>Player name and personal information</li>
              <li>Position and physical attributes</li>
              <li>Performance statistics</li>
              <li>Career history</li>
            </ul>
          </div>
        </AccordionTab>

        <AccordionTab header="Team Information">
          <div class="relationship-content">
            <p><strong>Team ID:</strong> {{ playerTeam.teamId }}</p>
            <p><em>Team details would be loaded from Team module...</em></p>
            <p>This would show:</p>
            <ul>
              <li>Team name and location</li>
              <li>Conference and division</li>
              <li>Stadium information</li>
              <li>Current roster</li>
            </ul>
          </div>
        </AccordionTab>

        <AccordionTab header="Tenure History">
          <div class="relationship-content">
            <p><em>Historical data for this player-team relationship...</em></p>
            <p>This could include:</p>
            <ul>
              <li>Previous tenures with this team</li>
              <li>Performance during this period</li>
              <li>Games played and statistics</li>
              <li>Awards and achievements</li>
            </ul>
          </div>
        </AccordionTab>

        <AccordionTab header="Related Relationships">
          <div class="relationship-content">
            <p><em>Other relationships for this player...</em></p>
            <p>This would show:</p>
            <ul>
              <li>Other teams this player has been with</li>
              <li>Timeline of career moves</li>
              <li>Current vs historical relationships</li>
            </ul>
          </div>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>

<style scoped>
.playerteam-details {
  max-width: 1000px;
  margin: 0 auto;
}

.title-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-actions {
  display: flex;
  gap: 0.5rem;
}

.playerteam-info-grid {
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

.relationship-content p {
  margin-bottom: 0.5rem;
}

.relationship-content ul {
  margin-left: 1rem;
}

.relationship-content li {
  margin-bottom: 0.25rem;
}
</style>