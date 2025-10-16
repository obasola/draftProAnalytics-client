<!-- src/components/combineScore/CombineScoreReadOnly.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCombineScoreStore } from '../../stores/combineScoreStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

const combineScoreStore = useCombineScoreStore()

const combineScore = computed(() => combineScoreStore.currentCombineScore)

onMounted(async () => {
  // Load any related data if needed
})

const formatTime = (time: number) => {
  return time.toFixed(2) + 's'
}

const formatDistance = (distance: number) => {
  return distance.toFixed(1) + '"'
}

const formatReps = (reps: number) => {
  return reps.toString()
}
</script>

<template>
  <Card v-if="combineScore" class="combine-score-details">
    <template #title>
      Combine Score for Player #{{ combineScore.playerId }}
    </template>

    <template #content>
      <div class="combine-score-info-grid">
        <div class="info-section">
          <h3>Speed & Agility Tests</h3>
          <div class="info-row">
            <span class="label">40-Yard Dash:</span>
            <span>{{ formatTime(combineScore.fortyTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">10-Yard Split:</span>
            <span>{{ formatTime(combineScore.tenYardSplit) }}</span>
          </div>
          <div class="info-row">
            <span class="label">3-Cone Drill:</span>
            <span>{{ formatTime(combineScore.threeCone) }}</span>
          </div>
          <div class="info-row">
            <span class="label">20-Yard Shuttle:</span>
            <span>{{ formatTime(combineScore.twentyYardShuttle) }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Power & Strength Tests</h3>
          <div class="info-row">
            <span class="label">Vertical Leap:</span>
            <span>{{ formatDistance(combineScore.verticalLeap) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Broad Jump:</span>
            <span>{{ formatDistance(combineScore.broadJump) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Bench Press:</span>
            <span>{{ formatReps(combineScore.benchPress) }} reps</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Performance Summary</h3>
          <div class="info-row">
            <span class="label">Player ID:</span>
            <span>{{ combineScore.playerId }}</span>
          </div>
          <div class="info-row">
            <span class="label">Score ID:</span>
            <span>{{ combineScore.id }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Performance Analysis">
          <div class="performance-analysis">
            <div class="metric-category">
              <h4>Speed Metrics</h4>
              <p><strong>40-Yard Time:</strong> {{ formatTime(combineScore.fortyTime) }}</p>
              <p><strong>Acceleration:</strong> {{ formatTime(combineScore.tenYardSplit) }} (10-yard split)</p>
            </div>
            
            <div class="metric-category">
              <h4>Agility Metrics</h4>
              <p><strong>Change of Direction:</strong> {{ formatTime(combineScore.threeCone) }} (3-cone)</p>
              <p><strong>Lateral Movement:</strong> {{ formatTime(combineScore.twentyYardShuttle) }} (20-yard shuttle)</p>
            </div>
            
            <div class="metric-category">
              <h4>Power & Strength</h4>
              <p><strong>Vertical Explosion:</strong> {{ formatDistance(combineScore.verticalLeap) }}</p>
              <p><strong>Horizontal Power:</strong> {{ formatDistance(combineScore.broadJump) }}</p>
              <p><strong>Upper Body Strength:</strong> {{ formatReps(combineScore.benchPress) }} reps at 225 lbs</p>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab header="Test Descriptions">
          <div class="test-descriptions">
            <div class="test-description">
              <h4>40-Yard Dash</h4>
              <p>Measures straight-line speed and acceleration over 40 yards.</p>
            </div>
            
            <div class="test-description">
              <h4>10-Yard Split</h4>
              <p>Time to reach 10 yards, measuring initial acceleration and burst.</p>
            </div>
            
            <div class="test-description">
              <h4>Vertical Leap</h4>
              <p>Measures lower body explosive power and jumping ability.</p>
            </div>
            
            <div class="test-description">
              <h4>Broad Jump</h4>
              <p>Tests horizontal explosive power and lower body strength.</p>
            </div>
            
            <div class="test-description">
              <h4>3-Cone Drill</h4>
              <p>Tests agility, change of direction, and body control.</p>
            </div>
            
            <div class="test-description">
              <h4>20-Yard Shuttle</h4>
              <p>Measures lateral quickness and change of direction speed.</p>
            </div>
            
            <div class="test-description">
              <h4>Bench Press</h4>
              <p>Tests upper body strength with 225-pound repetitions.</p>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>

<style scoped>
.combine-score-details {
  max-width: 1000px;
  margin: 0 auto;
}

.combine-score-info-grid {
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

.performance-analysis,
.test-descriptions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.metric-category,
.test-description {
  padding: 1rem;
  background: var(--surface-ground);
  border-radius: 6px;
  border-left: 4px solid var(--primary-color);
}

.metric-category h4,
.test-description h4 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.metric-category p,
.test-description p {
  margin-bottom: 0.25rem;
  color: var(--text-secondary);
}
</style>