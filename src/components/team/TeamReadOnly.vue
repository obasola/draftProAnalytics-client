// ReadOnly Component
// File: `src/components/team/TeamReadOnly.vue`**
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
import type { Player, PaginatedResponse } from '@/types'

const teamStore = useTeamStore()
const router = useRouter()

const team = computed(() => teamStore.currentTeam)
const players = ref<Player[]>([])
const playersLoading = ref(false)
const playersError = ref<string | null>(null)

const loadTeamPlayers = async (teamId: number) => {
  playersLoading.value = true
  playersError.value = null
  try {
    // Fetch players for this team with proper typing
    const response = await apiService.get<PaginatedResponse<Player>>(`/players/team/${teamId}`)
    players.value = response.data.data || response.data // Handle both response structures
  } catch (error) {
    console.error('Failed to load team players:', error)
    playersError.value = 'Failed to load team players'
    players.value = []
  } finally {
    playersLoading.value = false
  }
}

onMounted(async () => {
  if (team.value?.id) {
    await loadTeamPlayers(team.value.id)
  }
})

// Watch for team changes
watch(
  () => team.value?.id,
  async (newTeamId) => {
    if (newTeamId) {
      await loadTeamPlayers(newTeamId)
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
  <Card v-if="team" class="team-details">
    <template #title>
      {{ team.name }}
    </template>
    <template #subtitle>
      {{ team.city }}, {{ team.state }} - {{ team.conference }} {{ team.division }}
    </template>

    <template #content>
      <div class="team-info-grid">
        <div class="info-section">
          <h3>Team Information</h3>
          <div class="info-row">
            <span class="label">Team Name:</span>
            <span class="value">{{ team.name }}</span>
          </div>
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
          <h3>League Information</h3>
          <div class="info-row">
            <span class="label">Conference:</span>
            <span class="value">{{ team.conference }}</span>
          </div>
          <div class="info-row">
            <span class="label">Division:</span>
            <span class="value">{{ team.division }}</span>
          </div>
          <div class="info-row" v-if="team.scheduleId">
            <span class="label">Schedule ID:</span>
            <span class="value">{{ team.scheduleId }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Players">
          <div class="players-section">
            <div class="section-header">
              <h4>Team Roster</h4>
              <Button
                @click="createPlayer"
                label="Add Player"
                icon="pi pi-plus"
                class="p-button-success p-button-sm"
              />
            </div>

            <div v-if="playersLoading" class="loading-message">
              <i class="pi pi-spinner pi-spin"></i> Loading players...
            </div>

            <div v-else-if="playersError" class="error-message">
              <i class="pi pi-exclamation-triangle"></i> {{ playersError }}
            </div>

            <div v-else-if="players.length === 0" class="empty-message">
              <i class="pi pi-info-circle"></i> No players found for this team.
              <Button
                @click="createPlayer"
                label="Add First Player"
                icon="pi pi-plus"
                class="p-button-link"
              />
            </div>

            <DataTable
              v-else
              :value="players"
              responsiveLayout="scroll"
              :paginator="players.length > 10"
              :rows="10"
              sortField="lastName"
              :sortOrder="1"
            >
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
                    <Button
                      @click="viewPlayer(data.id)"
                      icon="pi pi-eye"
                      class="p-button-info p-button-sm"
                      v-tooltip="'View Player'"
                    />
                    <Button
                      @click="editPlayer(data.id)"
                      icon="pi pi-pencil"
                      class="p-button-warning p-button-sm"
                      v-tooltip="'Edit Player'"
                    />
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
                        ? Math.round(players.filter(p => p.height).reduce((sum, p) => sum + p.height, 0) / players.filter(p => p.height).length)
                        : 'N/A'
                    }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average Weight:</span>
                  <span class="stat-value">
                    {{ 
                      players.filter(p => p.weight).length > 0 
                        ? Math.round(players.filter(p => p.weight).reduce((sum, p) => sum + p.weight, 0) / players.filter(p => p.weight).length) + ' lbs'
                        : 'N/A'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AccordionTab>
        
        <AccordionTab header="Schedule">
          <p>Team schedule will be displayed here when schedule relationships are implemented.</p>
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
    </template>
  </Card>
</template>

<!-- STYLE SECTION - Replace your existing <style scoped> -->
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
  color: #2563eb; /* Blue color for data values */
  /* Alternative color options:
     color: #059669; - Green
     color: #7c3aed; - Purple  
     color: #dc2626; - Red
     color: #0891b2; - Cyan
  */
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
</style>