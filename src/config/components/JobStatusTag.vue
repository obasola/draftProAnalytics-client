// ==================================
// File: src/components/JobStatusTag.vue
// ==================================
<template>
  <Tag :value="status" :severity="severity" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'

const props = defineProps<{ status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' }>()

const severity = computed(() => {
  switch (props.status) {
    case 'COMPLETED': return 'success'
    case 'RUNNING': return 'info'
    case 'FAILED': return 'danger'
    case 'CANCELLED': return 'warn'
    default: return 'secondary'
  }
})
</script>



