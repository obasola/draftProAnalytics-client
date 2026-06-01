<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import { weeklyScoreImportApi } from '../../infrastructure/weeklyScoreImportApi';
import type {
  ImportWeeklyScoresJobRow,
  ImportWeeklyScoresRequest,
  NflSeasonType,
  SeasonTypeOption,
} from '../../domain/weeklyScoreImport.types';

const seasonTypeOptions: readonly SeasonTypeOption[] = [
  { label: 'Preseason', value: 1, defaultStartWeek: 1, defaultEndWeek: 4 },
  { label: 'Regular Season', value: 2, defaultStartWeek: 1, defaultEndWeek: 18 },
  { label: 'Postseason', value: 3, defaultStartWeek: 1, defaultEndWeek: 5 },
];

const seasonYear = ref<number>(2026);
const selectedSeasonType = ref<NflSeasonType>(2);
const startWeek = ref<number>(1);
const endWeek = ref<number>(18);
const autoStart = ref<boolean>(true);
const isSubmitting = ref<boolean>(false);
const isPolling = ref<boolean>(false);
const errorMessage = ref<string>('');
const jobRows = ref<ImportWeeklyScoresJobRow[]>([]);

let pollTimerId: number | undefined;

const selectedSeasonTypeOption = computed<SeasonTypeOption>(() => {
  return seasonTypeOptions.find((option) => option.value === selectedSeasonType.value) ?? seasonTypeOptions[1];
});

const completedCount = computed<number>(() => jobRows.value.filter((job) => job.status === 'COMPLETED').length);
const failedCount = computed<number>(() => jobRows.value.filter((job) => job.status === 'FAILED').length);
const activeCount = computed<number>(() =>
  jobRows.value.filter((job) => ['PENDING', 'QUEUED', 'RUNNING'].includes(job.status)).length,
);

const progressValue = computed<number>(() => {
  if (jobRows.value.length === 0) {
    return 0;
  }

  return Math.round(((completedCount.value + failedCount.value) / jobRows.value.length) * 100);
});

const canSubmit = computed<boolean>(() => {
  return (
    !isSubmitting.value &&
    seasonYear.value >= 2000 &&
    startWeek.value >= 1 &&
    endWeek.value >= startWeek.value &&
    endWeek.value <= 22
  );
});

function seasonTypeLabel(seasonType: NflSeasonType): string {
  return seasonTypeOptions.find((option) => option.value === seasonType)?.label ?? 'Unknown';
}

function statusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'RUNNING':
      return 'info';
    case 'PENDING':
    case 'QUEUED':
      return 'warning';
    case 'FAILED':
    case 'CANCELLED':
      return 'danger';
    default:
      return 'secondary';
  }
}

function applySeasonDefaults(): void {
  const option = selectedSeasonTypeOption.value;
  startWeek.value = option.defaultStartWeek;
  endWeek.value = option.defaultEndWeek;
}

function buildRequests(): ImportWeeklyScoresRequest[] {
  const requests: ImportWeeklyScoresRequest[] = [];

  for (let week = startWeek.value; week <= endWeek.value; week += 1) {
    requests.push({
      seasonYear: seasonYear.value,
      seasonType: selectedSeasonType.value,
      week,
      autoStart: autoStart.value,
    });
  }

  return requests;
}

async function submitScoreImports(): Promise<void> {
  if (!canSubmit.value) {
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  jobRows.value = [];

  try {
    const requests = buildRequests();

    for (const request of requests) {
      const job = await weeklyScoreImportApi.importWeeklyScores(request);
      jobRows.value.push(weeklyScoreImportApi.toJobRow(job, request));
    }

    startPolling();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to queue weekly score import jobs.';
  } finally {
    isSubmitting.value = false;
  }
}

async function pollJobStatuses(): Promise<void> {
  const activeRows = jobRows.value.filter((job) => ['PENDING', 'QUEUED', 'RUNNING'].includes(job.status));

  if (activeRows.length === 0) {
    stopPolling();
    return;
  }

  isPolling.value = true;

  try {
    const updatedRows = await Promise.all(
      jobRows.value.map(async (row) => {
        if (!['PENDING', 'QUEUED', 'RUNNING'].includes(row.status)) {
          return row;
        }

        const job = await weeklyScoreImportApi.getJobStatus(row.jobId);
        return weeklyScoreImportApi.applyStatusUpdate(row, job);
      }),
    );

    jobRows.value = updatedRows;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to poll weekly score import job statuses.';
  } finally {
    isPolling.value = false;
  }
}

function startPolling(): void {
  stopPolling();
  pollTimerId = window.setInterval(() => {
    void pollJobStatuses();
  }, 3000);
  void pollJobStatuses();
}

function stopPolling(): void {
  if (pollTimerId !== undefined) {
    window.clearInterval(pollTimerId);
    pollTimerId = undefined;
  }
  isPolling.value = false;
}

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <section class="import-game-scores-panel">
    <Card>
      <template #title>Import Game Scores</template>
      <template #subtitle>
        Queue one IMPORT_SCORES_WEEK job for each selected NFL week.
      </template>

      <template #content>
        <div class="form-grid">
          <div class="field">
            <label for="scoreSeasonYear">Season Year</label>
            <InputNumber
              id="scoreSeasonYear"
              v-model="seasonYear"
              :useGrouping="false"
              :min="2000"
              :max="2100"
              inputClass="w-full"
            />
          </div>

          <div class="field">
            <label for="scoreSeasonType">Season Type</label>
            <Dropdown
              id="scoreSeasonType"
              v-model="selectedSeasonType"
              :options="seasonTypeOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              @change="applySeasonDefaults"
            />
          </div>

          <div class="field">
            <label for="scoreStartWeek">Start Week</label>
            <InputNumber id="scoreStartWeek" v-model="startWeek" :min="1" :max="22" inputClass="w-full" />
          </div>

          <div class="field">
            <label for="scoreEndWeek">End Week</label>
            <InputNumber id="scoreEndWeek" v-model="endWeek" :min="1" :max="22" inputClass="w-full" />
          </div>

          <div class="field checkbox-field">
            <Checkbox v-model="autoStart" inputId="autoStartScores" :binary="true" />
            <label for="autoStartScores">Auto start jobs</label>
          </div>
        </div>

        <div class="actions">
          <Button
            label="Queue Score Import Jobs"
            icon="pi pi-stopwatch"
            :loading="isSubmitting"
            :disabled="!canSubmit"
            @click="submitScoreImports"
          />

          <Button
            label="Poll Now"
            icon="pi pi-refresh"
            severity="secondary"
            :disabled="jobRows.length === 0 || isPolling"
            @click="pollJobStatuses"
          />

          <Button
            label="Stop Polling"
            icon="pi pi-pause"
            severity="secondary"
            :disabled="!isPolling"
            @click="stopPolling"
          />
        </div>

        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>
      </template>
    </Card>

    <Card v-if="jobRows.length > 0" class="job-panel">
      <template #title>Score Import Job Queue</template>
      <template #subtitle>
        {{ completedCount }} completed, {{ failedCount }} failed, {{ activeCount }} active.
      </template>

      <template #content>
        <ProgressBar :value="progressValue" />

        <DataTable :value="jobRows" dataKey="jobId" stripedRows showGridlines responsiveLayout="scroll" class="job-table">
          <Column field="jobId" header="Job #" sortable />

          <Column header="Season">
            <template #body="{ data }">{{ data.seasonYear }}</template>
          </Column>

          <Column header="Type">
            <template #body="{ data }">{{ seasonTypeLabel(data.seasonType) }}</template>
          </Column>

          <Column field="week" header="Week" sortable />

          <Column header="Status" sortable>
            <template #body="{ data }">
              <Tag :value="data.status" :severity="statusSeverity(data.status)" />
            </template>
          </Column>

          <Column field="message" header="Message" />
          <Column field="lastCheckedAt" header="Last Checked" />
        </DataTable>
      </template>
    </Card>
  </section>
</template>

<style scoped>
.import-game-scores-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(12rem, 1fr));
  gap: 1rem;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.checkbox-field {
  flex-direction: row;
  align-items: center;
  padding-top: 1.6rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1rem 0;
}

.job-panel {
  margin-top: 1rem;
}

.job-table {
  margin-top: 1rem;
}

.w-full {
  width: 100%;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
