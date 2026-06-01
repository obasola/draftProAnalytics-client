<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import { useDpaJobsStore } from '../stores/useDpaJobsStore';
import { NFL_SEASON_TYPE } from '../../domain/NflJobTypes';
import type { NflSeasonType } from '../../domain/NflJobTypes';
import { getWeekOptionsForSeasonType, seasonTypeOptions } from '../../domain/NflJobLabels';

const emit = defineEmits<{
  readonly 'job-submitted': [jobId: number];
}>();

const jobsStore = useDpaJobsStore();

const currentYear = new Date().getFullYear();
const seasonYear = ref<number>(currentYear);
const seasonType = ref<NflSeasonType>(NFL_SEASON_TYPE.REGULAR_SEASON);
const week = ref<number>(1);
const localMessage = ref<string | null>(null);

const weekOptions = computed(() => getWeekOptionsForSeasonType(seasonType.value));

watch(seasonType, () => {
  week.value = weekOptions.value[0]?.value ?? 1;
});

const canSubmit = computed<boolean>(() => (
  Number.isInteger(seasonYear.value)
  && seasonYear.value >= 2000
  && seasonYear.value <= currentYear + 2
  && weekOptions.value.some((option) => option.value === week.value)
));

const enqueueScoresImport = async (): Promise<void> => {
  if (!canSubmit.value) {
    localMessage.value = 'Enter a valid season year, season type, and week.';
    return;
  }

  localMessage.value = null;
  const job = await jobsStore.enqueueImportNflGameScores({
    seasonYear: seasonYear.value,
    seasonType: seasonType.value,
    week: week.value,
  });

  localMessage.value = `Queued weekly score import job #${job.id}.`;
  emit('job-submitted', job.id);
};
</script>

<template>
  <Card class="job-card">
    <template #title>Import Weekly NFL Scores</template>
    <template #subtitle>
      Queue a targeted score refresh for a season year, season type, and week.
    </template>

    <template #content>
      <div class="form-grid">
        <label class="field-label" for="scoreSeasonYear">Season Year</label>
        <InputNumber
          id="scoreSeasonYear"
          v-model="seasonYear"
          :min="2000"
          :max="currentYear + 2"
          :use-grouping="false"
          input-class="w-full"
        />

        <label class="field-label" for="scoreSeasonType">Season Type</label>
        <Dropdown
          id="scoreSeasonType"
          v-model="seasonType"
          :options="seasonTypeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />

        <label class="field-label" for="scoreWeek">Week</label>
        <Dropdown
          id="scoreWeek"
          v-model="week"
          :options="weekOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <Message v-if="localMessage" severity="info" :closable="false" class="mt-3">
        {{ localMessage }}
      </Message>
    </template>

    <template #footer>
      <Button
        label="Queue Score Import"
        icon="pi pi-cloud-download"
        :loading="jobsStore.submitting"
        :disabled="!canSubmit"
        @click="enqueueScoresImport"
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

.mt-3 {
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
