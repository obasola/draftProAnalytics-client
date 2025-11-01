<!-- src/components/player/PlayerReadOnly.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { usePlayerAwardStore } from '@/stores/playerAwardStore'
import { useCombineScoreStore } from '@/stores/combineScoreStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const playerStore = usePlayerStore()
const playerAwardStore = usePlayerAwardStore()
const combineScoreStore = useCombineScoreStore()

const player = computed(() => playerStore.currentPlayer)

const playerAwards = computed(() =>
  playerAwardStore.awards.filter(
    (award) => award.playerId === player.value?.id
  )
)

const combineScore = computed(() =>
  combineScoreStore.scores.find(
    (score) => score.playerId === player.value?.id
  )
)
</script>

<template>
  <Card v-if="player" class="player-details">
    <template #title>
      {{ player.firstName }} {{ player.lastName }}
    </template>

    <template #content>
      <div class="player-info-grid">
        <div class="info-section">
          <h3>Basic Information</h3>
          <div class="info-row">
            <span class="label">Position:</span>
            <span>{{ player.position }}</span>
          </div>
          <div class="info-row">
            <span class="label">Age:</span>
            <span>{{ player.age }}</span>
          </div>
          <div class="info-row">
            <span class="label">Height:</span>
            <span>{{ player.height }}"</span>
          </div>
          <div class="info-row">
            <span class="label">Weight:</span>
            <span>{{ player.weight }} lbs</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Physical Measurements</h3>
          <div class="info-row">
            <span class="label">Hand Size:</span>
            <span>{{ player.handSize }}"</span>
          </div>
          <div class="info-row">
            <span class="label">Arm Length:</span>
            <span>{{ player.armLength }}"</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Background</h3>
          <div class="info-row">
            <span class="label">University:</span>
            <span>{{ player.university }}</span>
          </div>
          <div class="info-row">
            <span class="label">Hometown:</span>
            <span>{{ player.homeCity }}, {{ player.homeState }}</span>
          </div>
          <div class="info-row">
            <span class="label">Year Entered League:</span>
            <span>{{ new Date(player.yearEnteredLeague).getFullYear() }}</span>
          </div>
        </div>

        <div class="info-section" v-if="player.team">
          <h3>Team Information</h3>
          <div class="info-row">
            <span class="label">Current Team:</span>
            <span>{{ player.team.name }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Player Awards" v-if="playerAwards.length > 0">
          <DataTable :value="playerAwards">
            <Column field="awardName" header="Award" />
            <Column field="awardYear" header="Year" />
            <Column field="awardDescription" header="Description" />
          </DataTable>
        </AccordionTab>

        <AccordionTab header="Combine Score" v-if="combineScore">
          <div class="combine-grid">
            <div class="combine-stat">
              <span class="label">40-Yard Dash:</span>
              <span>{{ combineScore.fortyTime }}s</span>
            </div>
            <div class="combine-stat">
              <span class="label">10-Yard Split:</span>
              <span>{{ combineScore.tenYardSplit }}s</span>
            </div>
            <div class="combine-stat">
              <span class="label">Vertical Leap:</span>
              <span>{{ combineScore.verticalLeap }}"</span>
            </div>
            <div class="combine-stat">
              <span class="label">Broad Jump:</span>
              <span>{{ combineScore.broadJump }}"</span>
            </div>
            <div class="combine-stat">
              <span class="label">3-Cone:</span>
              <span>{{ combineScore.threeCone }}s</span>
            </div>
            <div class="combine-stat">
              <span class="label">20-Yard Shuttle:</span>
              <span>{{ combineScore.twentyYardShuttle }}s</span>
            </div>
            <div class="combine-stat">
              <span class="label">Bench Press:</span>
              <span>{{ combineScore.benchPress }} reps</span>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>

<style scoped>
.player-details {
  max-width: 1000px;
  margin: 0 auto;
}

.player-info-grid {
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

.combine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.combine-stat {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
</style>