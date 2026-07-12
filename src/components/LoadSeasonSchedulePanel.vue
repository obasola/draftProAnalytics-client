<script setup lang="ts">
import DpaNflJobsPanel from '@/modules/jobs/presentation/components/DpaNflJobsPanel.vue';

const emit = defineEmits<{
  readonly 'jobs-submitted': [jobIds: number[]];
}>();

const handleJobsSubmitted = (jobIds: number[]): void => {
  emit('jobs-submitted', jobIds);
};
</script>

<template>
  <DpaNflJobsPanel @jobs-submitted="handleJobsSubmitted" />
</template>
