<script setup lang="ts">
import Button from 'primevue/button';
import type { Job } from '../../domain/job.types';

const props = defineProps<{
  readonly job: Job;
}>();

const emit = defineEmits<{
  (event: 'view', jobId: number): void;
  (event: 'run', jobId: number): void;
  (event: 'cancel', jobId: number): void;
}>();

const canRun = (): boolean => ['PENDING', 'QUEUED'].includes(props.job.status);
const canCancel = (): boolean => ['PENDING', 'QUEUED', 'RUNNING'].includes(props.job.status);
</script>

<template>
  <div class="job-actions">
    <Button icon="pi pi-eye" label="View" size="small" text @click="emit('view', props.job.id)" />
    <Button icon="pi pi-play" label="Run" size="small" text :disabled="!canRun()" @click="emit('run', props.job.id)" />
    <Button icon="pi pi-times" label="Cancel" size="small" text severity="danger" :disabled="!canCancel()" @click="emit('cancel', props.job.id)" />
  </div>
</template>

<style scoped>
.job-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
</style>
