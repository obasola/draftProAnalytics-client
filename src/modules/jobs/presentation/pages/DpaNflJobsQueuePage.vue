<script setup lang="ts">
import DpaNflJobsQueuePanel from '../components/DpaNflJobsQueuePanel.vue';

const handleJobsSubmitted = (jobIds: number[]): void => {
  console.info('DPA NFL jobs submitted:', jobIds);
};
</script>

<template>
  <section class="dpa-nfl-jobs-queue-page">
    <div class="page-header">
      <h2>NFL Jobs</h2>
      <p>
        Queue NFL season schedule imports, import weekly scores, and monitor pending, running,
        completed, failed, or canceled jobs.
      </p>
    </div>

    <DpaNflJobsQueuePanel @jobs-submitted="handleJobsSubmitted" />
  </section>
</template>

<style scoped>
.dpa-nfl-jobs-queue-page,
.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  gap: 0.35rem;
}

.page-header h2,
.page-header p {
  margin: 0;
}
</style>
