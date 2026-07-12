<script setup lang="ts">
import Message from 'primevue/message'
import DraftPickCard from './DraftPickCard.vue'
import type { DraftPickDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  picks: DraftPickDto[]
  emptyMessage?: string
  editable?: boolean
}>()

const emit = defineEmits<{
  edit: [pick: DraftPickDto]
  onClock: [pick: DraftPickDto]
  complete: [pick: DraftPickDto]
}>()
</script>

<template>
  <div>
    <div v-if="props.picks.length > 0" class="pick-card-list">
      <DraftPickCard
        v-for="pick in props.picks"
        :key="pick.id"
        :pick="pick"
        :editable="props.editable"
        @edit="emit('edit', $event)"
        @on-clock="emit('onClock', $event)"
        @complete="emit('complete', $event)"
      />
    </div>

    <Message v-else severity="info" :closable="false">
      {{ props.emptyMessage ?? 'No picks found for this view.' }}
    </Message>
  </div>
</template>

<style scoped>
.pick-card-list {
  display: grid;
  gap: 1rem;
}
</style>
