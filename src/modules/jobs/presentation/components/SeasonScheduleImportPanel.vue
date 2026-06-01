<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import { useDpaJobsStore } from '../stores/useDpaJobsStore';
import { NFL_SEASON_TYPE } from '../../domain/NflJobTypes';
import type { NflSeasonType } from '../../domain/NflJobTypes';
import { seasonTypeOptions } from '../../domain/NflJobLabels';

const emit = defineEmits<{
  readonly 'job-submitted': [jobId: number];
}>();

const jobsStore = useDpaJobsStore();

const currentYear = new Date().getFullYear();
const seasonYear = ref<number>(currentYear);
const selectedSeasonTypes = ref<NflSeasonType[]>([
  NFL_SEASON_TYPE.PRESEASON,
  NFL_SEASON_TYPE.REGULAR_SEASON,
  NFL_SEASON_TYPE.POSTSEASON,
]);
const localMessage = ref<string | null>(null);

const canSubmit = computed<boolean>(() => (
  Number.isInteger(seasonYear.value)
  && seasonYear.value >= 2000
  && seasonYear.value <= currentYear + 2
  && selectedSeasonTypes.value.length > 0
));

const enqueueScheduleImport = async (): Promise<void> => {
  if (!canSubmit.value) {
    localMessage.value = 'Enter a valid season year and select at least one season type.';
    return;
  }

  localMessage.value = null;
  const job = await jobsStore.enqueueLoadNflSeasonSchedule({
    seasonYear: seasonYear.value,
    seasonTypes: selectedSeasonTypes.value,
  });

  localMessage.value = `Queued schedule import job #${job.id}.`;
  emit('job-submitted', job.id);
};
</script>

<template>
  <Card class="job-card">
    <template #title>Import NFL Season Schedule</template>
    <template #subtitle>
      Queue one job to load ESPN schedule events into the Game table for a selected NFL season.
    </template>

    <template #content>
      <div class="form-grid">
        <label class="field-label" for="seasonScheduleYear">Season Year</label>
        <InputNumber
          id="seasonScheduleYear"
          v-model="seasonYear"
          :min="2000"
          :max="currentYear + 2"
          :use-grouping="false"
          input-class="w-full"
        />

        <div class="field-label">Season Types</div>
        <div class="season-type-list">
          <div v-for="option in seasonTypeOptions" :key="option.value" class="season-type-option">
            <Checkbox
              v-model="selectedSeasonTypes"
              :input-id="`schedule-season-type-${option.value}`"
              :value="option.value"
            />
            <label :for="`schedule-season-type-${option.value}`">{{ option.label }}</label>
          </div>
        </div>
      </div>

      <Message v-if="localMessage" severity="info" :closable="false" class="mt-3">
        {{ localMessage }}
      </Message>
    </template>

    <template #footer>
      <Button
        label="Queue Schedule Import"
        icon="pi pi-calendar-plus"
        :loading="jobsStore.submitting"
        :disabled="!canSubmit"
        @click="enqueueScheduleImport"
      />
    </template>
  </Card>
</template>

<style scoped>
.job-card {
  height: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 9rem minmax(12rem, 1fr);
  gap: 1rem;
  align-items: center;
}

.field-label {
  font-weight: 700;
}

.season-type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.season-type-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
