<script setup lang="ts">
import JobMonitorPanel from '../components/JobMonitorPanel.vue'
</script>

<template>
  <section class="dpa-jobs-queue-page">
    <div class="page-header">
      <h2>Job Queue</h2>
      <p>Monitor and manage pending, running, completed, failed, and canceled jobs.</p>
    </div>

    <JobMonitorPanel />
  </section>
</template>

<style scoped>
.dpa-jobs-queue-page,
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
