<script setup lang="ts">
import Dropdown from 'primevue/dropdown'
import type { DraftEventDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  events: DraftEventDto[]
  modelValue: DraftEventDto | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DraftEventDto | null]
}>()
</script>

<template>
  <Dropdown
    :model-value="props.modelValue"
    :options="props.events"
    option-label="name"
    placeholder="Select draft event"
    :loading="props.loading"
    class="draft-event-selector"
    @update:model-value="emit('update:modelValue', $event as DraftEventDto | null)"
  >
    <template #option="{ option }">
      <div class="draft-event-option">
        <strong>{{ option.name }}</strong>
        <span>{{ option.status }}</span>
      </div>
    </template>
  </Dropdown>
</template>

<style scoped>
.draft-event-selector {
  width: 100%;
  max-width: 24rem;
}

.draft-event-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
</style>
