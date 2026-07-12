<script setup lang="ts">
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import type { DraftPickDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  pick: DraftPickDto
}>()

function valueDelta(): number | null {
  if (typeof props.pick.valueDelta === 'number') return props.pick.valueDelta
  if (typeof props.pick.dpaBoardRank === 'number') {
    const slot = props.pick.overallPick ?? props.pick.pickNumber
    return slot - props.pick.dpaBoardRank
  }
  return null
}

function severity(): string {
  const delta = valueDelta()
  if (delta === null) return 'secondary'
  if (delta >= 10) return 'success'
  if (delta >= 0) return 'info'
  if (delta >= -10) return 'warning'
  return 'danger'
}

function label(): string {
  const delta = valueDelta()
  if (delta === null) return 'Value unavailable'
  return delta >= 0 ? `+${delta} value` : `${delta} reach`
}
</script>

<template>
  <Card class="relative-value-card">
    <template #content>
      <div class="value-grid">
        <div>
          <span>Draft Slot</span>
          <strong>{{ props.pick.overallPick ?? props.pick.pickNumber }}</strong>
        </div>
        <div>
          <span>DPA Rank</span>
          <strong>{{ props.pick.dpaBoardRank ?? '—' }}</strong>
        </div>
        <div>
          <span>Talent Rank</span>
          <strong>{{ props.pick.projectedTalentRank ?? '—' }}</strong>
        </div>
        <div>
          <span>Value</span>
          <Tag :value="label()" :severity="severity()" />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.relative-value-card {
  background: var(--surface-50);
}

.value-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.value-grid div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.value-grid span {
  color: var(--text-color-secondary);
  font-size: 0.8rem;
}

.value-grid strong {
  font-size: 1rem;
}

@media (max-width: 640px) {
  .value-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
