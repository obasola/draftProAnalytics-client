<script setup lang="ts">
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import type { DraftPositionCountDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  positionCounts: DraftPositionCountDto[]
}>()

function getSeverity(positionCount: DraftPositionCountDto): string {
  if (!positionCount.wasNeed) return 'info'
  if (positionCount.needPriority === 'HIGH') return 'success'
  if (positionCount.needPriority === 'MEDIUM') return 'warning'
  return 'secondary'
}
</script>

<template>
  <Card>
    <template #title>Draft Class Position Heatmap</template>
    <template #content>
      <div v-if="props.positionCounts.length > 0" class="position-grid">
        <div
          v-for="positionCount in props.positionCounts"
          :key="positionCount.position"
          class="position-tile"
        >
          <span class="position">{{ positionCount.position }}</span>
          <strong>{{ positionCount.count }}</strong>
          <Tag
            v-if="positionCount.wasNeed"
            :value="positionCount.needPriority ?? 'Need'"
            :severity="getSeverity(positionCount)"
          />
        </div>
      </div>

      <p v-else class="empty-copy">
        Position counts will appear once picks have assigned positions.
      </p>
    </template>
  </Card>
</template>

<style scoped>
.position-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(5.5rem, 1fr));
  gap: 0.75rem;
}

.position-tile {
  display: flex;
  min-height: 5rem;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.75rem;
  border: 1px solid var(--surface-200);
  border-radius: 0.75rem;
  background: var(--surface-50);
  text-align: center;
}

.position {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.position-tile strong {
  font-size: 1.5rem;
}

.empty-copy {
  margin: 0;
  color: var(--text-color-secondary);
}
</style>
