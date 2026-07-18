<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import { useDpaJobsStore } from '../stores/useDpaJobsStore'

const emit = defineEmits<{ readonly 'job-submitted': [jobId: number] }>()
const jobsStore = useDpaJobsStore()
const currentYear = new Date().getFullYear()
const seasonYear = ref(currentYear - 1)
const overwriteExisting = ref(false)
const localMessage = ref<string | null>(null)
const canSubmit = computed(() => Number.isInteger(seasonYear.value) && seasonYear.value >= 1933 && seasonYear.value <= currentYear)

const enqueue = async (): Promise<void> => {
  if (!canSubmit.value) return
  const job = await jobsStore.enqueueSyncPostSeasonResults({ seasonYear: seasonYear.value, overwriteExisting: overwriteExisting.value })
  localMessage.value = `Queued postseason result synchronization job #${job.id}.`
  emit('job-submitted', job.id)
}
</script>

<template>
  <Card class="job-card">
    <template #title>Build Postseason Results</template>
    <template #subtitle>Summarize completed postseason games already stored in Game into one PostSeasonResult row per team and season.</template>
    <template #content>
      <div class="form-grid">
        <label class="field-label" for="postseasonYear">Season Year</label>
        <InputNumber id="postseasonYear" v-model="seasonYear" :min="1933" :max="currentYear" :use-grouping="false" />
        <div class="field-label">Update Policy</div>
        <div class="checkbox-row">
          <Checkbox v-model="overwriteExisting" input-id="overwritePostseason" binary />
          <label for="overwritePostseason">Overwrite existing postseason summaries</label>
        </div>
      </div>
      <Message severity="info" :closable="false" class="mt-3">Import the postseason schedule and final scores first. This job does not call ESPN again.</Message>
      <Message v-if="localMessage" severity="success" :closable="false" class="mt-3">{{ localMessage }}</Message>
    </template>
    <template #footer>
      <Button label="Queue Postseason Sync" icon="pi pi-sync" :loading="jobsStore.submitting" :disabled="!canSubmit" @click="enqueue" />
    </template>
  </Card>
</template>

<style scoped>
.job-card { height: 100%; }
.form-grid { display: grid; grid-template-columns: 9rem minmax(12rem, 1fr); gap: 1rem; align-items: center; }
.field-label { font-weight: 700; }
.checkbox-row { display: flex; align-items: center; gap: .5rem; }
.mt-3 { margin-top: 1rem; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
