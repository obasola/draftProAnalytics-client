<script setup lang="ts">
import LoadSeasonSchedulePanel from '../components/LoadSeasonSchedulePanel.vue';

const handleJobsSubmitted = (jobIds: number[]): void => {
  console.info('NFL schedule load jobs submitted:', jobIds);
};
</script>

<template>
  <section class="load-season-schedule-page">
    <div class="page-header">
      <h2>Load Season Schedule</h2>
      <p>Queue weekly NFL schedule imports and monitor the generated job ids without running curl loops.</p>
    </div>

    <LoadSeasonSchedulePanel @jobs-submitted="handleJobsSubmitted" />
  </section>
</template>

<style scoped>
.load-season-schedule-page,
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
