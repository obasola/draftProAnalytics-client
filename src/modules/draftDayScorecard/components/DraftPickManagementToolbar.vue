<script setup lang="ts">
import Button from 'primevue/button'
import type { DraftEventDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  selectedEvent: DraftEventDto | null
  saving?: boolean
}>()

const emit = defineEmits<{
  seed: []
  refresh: []
}>()
</script>

<template>
  <div class="toolbar">
    <div>
      <h2>Draft-Night Operations</h2>
      <p>
        {{ props.selectedEvent ? props.selectedEvent.name : 'Select a draft event to manage picks.' }}
      </p>
    </div>

    <div class="actions">
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        class="p-button-outlined"
        :disabled="!props.selectedEvent"
        @click="emit('refresh')"
      />
      <Button
        label="Seed Picks"
        icon="pi pi-plus-circle"
        class="p-button-warning"
        :loading="props.saving"
        :disabled="!props.selectedEvent"
        @click="emit('seed')"
      />
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  background: var(--surface-card);
}

h2,
p {
  margin: 0;
}

p {
  margin-top: 0.25rem;
  color: var(--text-color-secondary);
}

.actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 700px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
