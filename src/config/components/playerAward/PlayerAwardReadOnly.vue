<!-- src/components/playeraward/PlayerAwardReadOnly.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePlayerAwardStore } from '@/stores/playerAwardStore'
import { usePlayerStore } from '@/stores/playerStore'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

const playerAwardStore = usePlayerAwardStore()
const playerStore = usePlayerStore()

const playerAward = computed(() => playerAwardStore.currentPlayerAward)
const player = computed(() => {
  if (playerAward.value?.playerId) {
    return playerStore.getPlayerById(playerAward.value.playerId)
  }
  return null
})

onMounted(async () => {
  // Load player data if needed
  if (playerAward.value?.playerId && !player.value) {
    await playerStore.fetchById(playerAward.value.playerId)
  }
})
</script>

<template>
  <Card v-if="playerAward" class="player-award-details">
    <template #title>
      {{ playerAward.awardName }} ({{ playerAward.awardYear }})
    </template>

    <template #content>
      <div class="player-award-info-grid">
        <div class="info-section">
          <h3>Award Information</h3>
          <div class="info-row">
            <span class="label">Award Name:</span>
            <span>{{ playerAward.awardName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Year:</span>
            <span>{{ playerAward.awardYear }}</span>
          </div>
          <div class="info-row" v-if="playerAward.awardDescription">
            <span class="label">Description:</span>
            <span>{{ playerAward.awardDescription }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Player Information</h3>
          <div class="info-row">
            <span class="label">Player ID:</span>
            <span>{{ playerAward.playerId || 'Not specified' }}</span>
          </div>
          <div class="info-row" v-if="player">
            <span class="label">Player Name:</span>
            <span>{{ player.firstName }} {{ player.lastName }}</span>
          </div>
          <div class="info-row" v-if="player">
            <span class="label">Position:</span>
            <span>{{ player.position }}</span>
          </div>
          <div class="info-row" v-if="player">
            <span class="label">College:</span>
            <span>{{ player.university }}</span>
          </div>
        </div>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Player Details" v-if="player && player.pick">
          <div class="relationship-content">
            <div class="info-row">
              <span class="label">Height:</span>
              <span>{{ player.height }}"</span>
            </div>
            <div class="info-row">
              <span class="label">Weight:</span>
              <span>{{ player.weight }} lbs</span>
            </div>
            <div class="info-row" v-if="player.homeCity">
              <span class="label">Hometown:</span>
              <span>{{ player.homeCity }}, {{ player.homeState }}</span>
            </div>
            <div class="info-row">
              <span class="label">Draft Status:</span>
              <span>{{ player.pick.draftYear ? 'Drafted' : 'Undrafted' }}</span>
            </div>
            <div class="info-row" v-if="player.pick !== undefined">
              <span class="label">Draft Year:</span>
              <span>{{ player.pick.draftYear }}</span>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>

<style scoped>
.player-award-details {
  max-width: 1000px;
  margin: 0 auto;
}

.player-award-info-grid {
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