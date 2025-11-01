<template>
  <div class="conference-container">
    <div class="divisions-container" :class="{ 'four-columns': showFourColumns }">
      <DivisionSection
        v-for="division in conference.divisions"
        :key="division.name"
        :division="division"
        :selected-teams="selectedTeams"
        :show-four-columns="showFourColumns"
        @toggle-team="$emit('toggleTeam', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DivisionSection from './DivisionSection.vue'
import type { Conference } from '@/types/Teams'

interface Props {
  conference: Conference
  selectedTeams: string[]
  showFourColumns?: boolean
}

defineProps<Props>() 

defineEmits<{
  toggleTeam: [teamCode: string]
}>()
</script>

<style scoped>
.conference-container {
  background: transparent;
}

.divisions-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.divisions-container.four-columns {
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 1200px) {
  .divisions-container.four-columns {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .divisions-container.four-columns {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .divisions-container,
  .divisions-container.four-columns {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

<style scoped>
.conference-container {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #333;
}

.conference-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #333;
}

.conference-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  background: #555;
}

.conference-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: white;
  border-radius: 50%;
}

.conference-logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.conference-info {
  flex: 1;
}

.conference-name {
  color: #fff;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.team-count {
  color: #aaa;
  font-size: 0.85rem;
}

.divisions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>