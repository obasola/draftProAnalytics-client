// ──────────────────────────────────────────
// src/components/jobs/JobActions.vue
// ──────────────────────────────────────────
export const __components_jobs_JobActions_vue = `
<script setup lang="ts">
const props = defineProps<{ job: { id: number; status: string } }>();
const emit = defineEmits<{ (e: 'open', id: number): void; (e: 'run', id: number): void; (e: 'cancel', id: number): void }>();
</script>

<template>
  <div class="flex gap-2">
    
    <Button label="Run" severity="secondary" v-if="props.job.status==='pending'" @click="emit('run', props.job.id)" />
    <Button label="Cancel" severity="danger" v-if="props.job.status==='running'" @click="emit('cancel', props.job.id)" />
  </div>
</template>
