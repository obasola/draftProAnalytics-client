<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTeamStore } from '@/stores/teamStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

const teamStore = useTeamStore()

const team = computed(() => teamStore.currentTeam)

onMounted(async () => {
  // Load any related data like players, schedule, etc.
})
const getTeamLogo = (): string => {
  let team = teamStore.currentTeam
  if (!team || !team.name || !team.conference) return ''

  const lastWord = team.name.trim().split(/\s+/).pop() || ''
  const ext = lastWord === 'Chargers' ? 'webp' : 'avif'
  return `/images/${team.conference.toLowerCase()}/${lastWord}.${ext}`
}
</script>

<template>
  <Card v-if="team" class="team-details">
    <template #title>
      <div class="game-title">
        <div class="matchup-header">
          <div class="team-info">
            <h3 class="team-name-with-logo">
              <img :src="getTeamLogo()" :alt="team.name" class="inline-logo" />
              {{ team.name }}
            </h3>            
          </div>
        </div>

      </div>
    </template>


    <template #content>
      <div class="team-info-grid">
        <div class="info-section">
          <h3>Team Information</h3>
          <div class="info-row">
            <span class="label">Team Name:</span>
            <span class="data-value">{{ team.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">City:</span>
            <span class="data-value">{{ team.city }}</span>
          </div>
          <div class="info-row">
            <span class="label">State:</span>
            <span class="data-value">{{ team.state }}</span>
          </div>
          <div class="info-row">
            <span class="label">Country:</span>
            <span class="data-value">{{ team.country }}</span>
          </div>
          <div class="info-row">
            <span class="label">Stadium:</span>
            <span class="data-value">{{ team.stadium }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>League Information</h3>
          <div class="info-row">
            <span class="label">Conference:</span>
            <span class="data-value">{{ team.conference }}</span>
          </div>
          <div class="info-row">
            <span class="label">Division:</span>
            <span class="data-value">{{ team.division }}</span>
          </div>
          <div class="info-row" v-if="team.scheduleId">
            <span class="label">Schedule ID:</span>
            <span class="data-value">{{ team.scheduleId }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Players">
          <p>Players roster will be displayed here when player relationships are implemented.</p>
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

<style scoped>
.inline-logo {
  width: 60px;
  height: 60px;
  margin-right: 0.5rem;
  vertical-align: middle;
  object-fit: contain;
}
/* Enhanced data value styling */
.data-value {
  color: var(--primary-color);
  font-weight: 500;
  font-size: 1.05em;
}
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

.relationships-accordion {
  margin-top: 2rem;
}
.team-name-with-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>