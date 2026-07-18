<script setup lang="ts">
import SeasonScheduleImportPanel from './SeasonScheduleImportPanel.vue'
import WeeklyScoresImportPanel from './WeeklyScoresImportPanel.vue'
import PostSeasonResultsSyncPanel from './PostSeasonResultsSyncPanel.vue'

const emit = defineEmits<{
  readonly 'jobs-submitted': [jobIds: number[]]
}>()

const submittedJobIds: number[] = []

const handleJobSubmitted = (jobId: number): void => {
  submittedJobIds.push(jobId)
  emit('jobs-submitted', [...submittedJobIds])
}
</script>

<template>
  <div class="dpa-nfl-jobs-panel">
    <div class="import-grid">
      <SeasonScheduleImportPanel @job-submitted="handleJobSubmitted" />
      <WeeklyScoresImportPanel @job-submitted="handleJobSubmitted" />
      <PostSeasonResultsSyncPanel @job-submitted="handleJobSubmitted" />
    </div>
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

@media (max-width: 960px) {
  .import-grid {
    grid-template-columns: 1fr;
  }
}
</style>
