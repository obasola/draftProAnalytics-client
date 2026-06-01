<script setup lang="ts">
import Tag from 'primevue/tag'
import type { DraftPickStatus } from '../types/draftDayScorecard.types'

const props = defineProps<{
  status: DraftPickStatus
}>()

function getSeverity(status: DraftPickStatus): string {
  switch (status) {
    case 'PICKED':
      return 'success'
    case 'ON_CLOCK':
      return 'warning'
    case 'TRADED':
      return 'info'
    case 'FORFEITED':
    case 'SKIPPED':
      return 'danger'
    case 'SCHEDULED':
    default:
      return 'secondary'
  }
}

function getLabel(status: DraftPickStatus): string {
  return status
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}
</script>

<template>
  <Tag :value="getLabel(props.status)" :severity="getSeverity(props.status)" />
</template>
