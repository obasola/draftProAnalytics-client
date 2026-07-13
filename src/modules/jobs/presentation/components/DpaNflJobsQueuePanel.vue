// src/modules
<script setup lang="ts">
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import JobMonitorPanel from './JobMonitorPanel.vue';

const emit = defineEmits<{
  readonly 'jobs-submitted': [jobIds: number[]];
}>();

const submittedJobIds: number[] = [];

const handleJobSubmitted = (jobId: number): void => {
  submittedJobIds.push(jobId);
  emit('jobs-submitted', [...submittedJobIds]);
};
</script>

<template>
  <div class="dpa-jobs-queue-panel">
    <TabView class="monitor-tabs">
      <TabPanel header="Job Monitor">
        <JobMonitorPanel />
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped>
.dpa-nfl-jobs-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.import-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.monitor-tabs {
  width: 100%;
}

@media (max-width: 960px) {
  .import-grid {
    grid-template-columns: 1fr;
  }
}
</style>
