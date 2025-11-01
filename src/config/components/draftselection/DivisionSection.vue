<template>
  <div class="division-container">
    <h4 class="division-name">{{ division.name }}</h4>
    <div class="teams-grid" :class="{ 'four-columns': showFourColumns }">
      <TeamCard
        v-for="team in division.teams"
        :key="team.code"
        :team="team"
        :selected="selectedTeams.includes(team.code)"
        @toggle="$emit('toggleTeam', team.code)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TeamCard from './TeamCard.vue'
import type { Division } from '@/types/Teams'

interface Props {
  division: Division
  selectedTeams: string[]
  showFourColumns?: boolean
}

defineProps<Props>()

defineEmits<{
  toggleTeam: [teamCode: string]
}>()
</script>

<style scoped>
.division-container {
  background: #333;
  border-radius: 6px;
  padding: 0.75rem;
}

/* Optimize division container for horizontal team layout */
.divisions-container.four-columns .division-container {
  padding: 0.6rem;
  min-width: 0; /* Allow container to shrink if needed */
}

.division-name {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #444;
}

/* Smaller division name for 4-column layout */
.divisions-container.four-columns .division-name {
  font-size: 0.8rem;
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.4rem;
}

/* 
 * Default: 2x2 grid of teams within each division
 * Four-columns mode: All 4 teams in a horizontal row within each division
 * Example: [Ravens] [Bengals] [Browns] [Steelers] 
 */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

/* In 4-column layout, display all 4 teams horizontally within each division */
.teams-grid.four-columns {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: space-between;
}

/* Responsive fallback for narrower screens */
@media (max-width: 1000px) {
  .teams-grid.four-columns {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }
}

@media (max-width: 600px) {
  .teams-grid,
  .teams-grid.four-columns {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>