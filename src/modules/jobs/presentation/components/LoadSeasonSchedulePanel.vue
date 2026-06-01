<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { seasonScheduleImportApi } from '../../infrastructure/seasonScheduleImportApi';
import type {
  ImportNflScheduleRequest,
  LoadSeasonScheduleJobStatus,
  NflScheduleSeasonType,
  SeasonScheduleLoadJobRow,
  SeasonSchedulePlanCode,
  SeasonSchedulePlanOption,
} from '../../domain/seasonScheduleLoad.types';

const emit = defineEmits<{
  (event: 'jobs-submitted', jobIds: number[]): void;
}>();

const toast = useToast();

const seasonPlans: SeasonSchedulePlanOption[] = [
  {
    label: 'Preseason only',
    code: 'PRESEASON',
    seasonTypes: [1],
    defaultStartWeek: 1,
    defaultEndWeek: 4,
  },
  {
    label: 'Regular season only',
    code: 'REGULAR_SEASON',
    seasonTypes: [2],
    defaultStartWeek: 1,
    defaultEndWeek: 18,
  },
  {
    label: 'Postseason only',
    code: 'POSTSEASON',
    seasonTypes: [3],
    defaultStartWeek: 1,
    defaultEndWeek: 5,
  },
  {
    label: 'Full season: preseason, regular season, postseason',
    code: 'FULL_SEASON',
    seasonTypes: [1, 2, 3],
    defaultStartWeek: 1,
    defaultEndWeek: 18,
  },
];

const seasonYear = ref<number>(new Date().getFullYear());
const selectedPlanCode = ref<SeasonSchedulePlanCode>('REGULAR_SEASON');
const startWeek = ref<number>(1);
const endWeek = ref<number>(18);
const dryRun = ref<boolean>(false);
const continueOnFailure = ref<boolean>(true);
const isSubmitting = ref<boolean>(false);
const isPolling = ref<boolean>(false);
const errorMessage = ref<string | null>(null);
const jobRows = ref<SeasonScheduleLoadJobRow[]>([]);

let pollingTimerId: ReturnType<typeof window.setInterval> | undefined;

const selectedPlan = computed<SeasonSchedulePlanOption>(() => {
  return seasonPlans.find((plan) => plan.code === selectedPlanCode.value) ?? seasonPlans[0];
});

const activeJobRows = computed<SeasonScheduleLoadJobRow[]>(() => {
  return jobRows.value.filter((row) => isActiveStatus(row.status));
});

const completedCount = computed<number>(() => {
  return jobRows.value.filter((row) => row.status === 'COMPLETED').length;
});

const failedCount = computed<number>(() => {
  return jobRows.value.filter((row) => row.status === 'FAILED').length;
});

const cancelledCount = computed<number>(() => {
  return jobRows.value.filter((row) => row.status === 'CANCELLED').length;
});

const terminalCount = computed<number>(() => {
  return completedCount.value + failedCount.value + cancelledCount.value;
});

const progressPercent = computed<number>(() => {
  if (jobRows.value.length === 0) {
    return 0;
  }

  return Math.round((terminalCount.value / jobRows.value.length) * 100);
});

const requestedJobCount = computed<number>(() => {
  return buildRequests().length;
});

const canSubmit = computed<boolean>(() => {
  return (
    seasonYear.value >= 2000 &&
    seasonYear.value <= 2100 &&
    startWeek.value >= 1 &&
    endWeek.value >= startWeek.value &&
    endWeek.value <= 22 &&
    requestedJobCount.value > 0 &&
    !isSubmitting.value
  );
});

function applyPlanDefaults(): void {
  startWeek.value = selectedPlan.value.defaultStartWeek;
  endWeek.value = selectedPlan.value.defaultEndWeek;
}

function getSeasonTypeLabel(seasonType: NflScheduleSeasonType): string {
  switch (seasonType) {
    case 1:
      return 'Preseason';
    case 2:
      return 'Regular';
    case 3:
      return 'Postseason';
    default:
      return 'Unknown';
  }
}

function getStatusSeverity(
  status: LoadSeasonScheduleJobStatus,
): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'RUNNING':
    case 'QUEUED':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'danger';
    case 'CANCELLED':
    case 'UNKNOWN':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function isActiveStatus(status: LoadSeasonScheduleJobStatus): boolean {
  return status === 'PENDING' || status === 'QUEUED' || status === 'RUNNING' || status === 'UNKNOWN';
}

function buildRequests(): ImportNflScheduleRequest[] {
  const requests: ImportNflScheduleRequest[] = [];

  selectedPlan.value.seasonTypes.forEach((seasonType) => {
    const maxWeek = resolveMaxWeekForSeasonType(seasonType);
    const firstWeek = Math.min(startWeek.value, maxWeek);
    const lastWeek = Math.min(endWeek.value, maxWeek);

    for (let week = firstWeek; week <= lastWeek; week += 1) {
      requests.push({
        seasonYear: seasonYear.value,
        seasonType,
        week,
        dryRun: dryRun.value,
      });
    }
  });

  return requests;
}

function resolveMaxWeekForSeasonType(seasonType: NflScheduleSeasonType): number {
  switch (seasonType) {
    case 1:
      return 4;
    case 2:
      return 18;
    case 3:
      return 5;
    default:
      return 18;
  }
}

async function submitSeasonScheduleLoad(): Promise<void> {
  if (!canSubmit.value) {
    return;
  }

  stopPolling();
  isSubmitting.value = true;
  errorMessage.value = null;
  jobRows.value = [];

  const submittedJobIds: number[] = [];

  try {
    const requests = buildRequests();

    for (const request of requests) {
      try {
        const result = await seasonScheduleImportApi.importNflSchedule(request);
        submittedJobIds.push(result.jobId);
        jobRows.value.push(seasonScheduleImportApi.toJobRow(result, request));
      } catch (error) {
        if (!continueOnFailure.value) {
          throw error;
        }

        jobRows.value.push({
          jobId: -1 * (jobRows.value.length + 1),
          seasonYear: request.seasonYear,
          seasonType: request.seasonType,
          week: request.week,
          status: 'FAILED',
          type: 'IMPORT_NFL_SCHEDULE',
          message: error instanceof Error ? error.message : 'Unable to submit import job.',
          submittedAt: new Date().toISOString(),
        });
      }
    }

    emit('jobs-submitted', submittedJobIds);

    toast.add({
      severity: 'success',
      summary: 'Schedule load submitted',
      detail: `${submittedJobIds.length} NFL schedule import job(s) submitted.`,
      life: 3000,
    });

    startPolling();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to submit schedule load jobs.';
  } finally {
    isSubmitting.value = false;
  }
}

async function pollJobStatuses(): Promise<void> {
  const jobsToPoll = jobRows.value.filter((row) => row.jobId > 0 && isActiveStatus(row.status));

  if (jobsToPoll.length === 0) {
    stopPolling();
    return;
  }

  isPolling.value = true;
  errorMessage.value = null;

  try {
    const updatedRows = await Promise.all(
      jobRows.value.map(async (row) => {
        if (row.jobId <= 0 || !isActiveStatus(row.status)) {
          return row;
        }

        const statusResult = await seasonScheduleImportApi.getJobStatus(row.jobId);
        return seasonScheduleImportApi.applyStatusUpdate(row, statusResult);
      }),
    );

    jobRows.value = updatedRows;

    if (activeJobRows.value.length === 0) {
      stopPolling();
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to poll schedule load job statuses.';
  } finally {
    isPolling.value = false;
  }
}

function startPolling(): void {
  stopPolling();

  if (jobRows.value.length === 0) {
    return;
  }

  pollingTimerId = window.setInterval(() => {
    void pollJobStatuses();
  }, 3000);

  void pollJobStatuses();
}

function stopPolling(): void {
  if (pollingTimerId !== undefined) {
    window.clearInterval(pollingTimerId);
    pollingTimerId = undefined;
  }

  isPolling.value = false;
}

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <div class="load-season-schedule-panel">
    <Card>
      <template #title>
        Load NFL Season Schedule
      </template>

      <template #subtitle>
        Submit weekly IMPORT_NFL_SCHEDULE jobs and monitor queue status.
      </template>

      <template #content>
        <div class="selection-grid">
          <div class="field">
            <label for="seasonYear">Season Year</label>
            <InputNumber
              id="seasonYear"
              v-model="seasonYear"
              :min="2000"
              :max="2100"
              :useGrouping="false"
              inputClass="w-full"
            />
          </div>

          <div class="field">
            <label for="seasonPlan">Season Load</label>
            <Dropdown
              id="seasonPlan"
              v-model="selectedPlanCode"
              :options="seasonPlans"
              optionLabel="label"
              optionValue="code"
              class="w-full"
              @change="applyPlanDefaults"
            />
          </div>

          <div class="field">
            <label for="startWeek">Start Week</label>
            <InputNumber
              id="startWeek"
              v-model="startWeek"
              :min="1"
              :max="22"
              inputClass="w-full"
            />
          </div>

          <div class="field">
            <label for="endWeek">End Week</label>
            <InputNumber
              id="endWeek"
              v-model="endWeek"
              :min="1"
              :max="22"
              inputClass="w-full"
            />
          </div>
        </div>

        <div class="option-row">
          <div class="checkbox-field">
            <Checkbox
              v-model="dryRun"
              inputId="dryRun"
              :binary="true"
            />
            <label for="dryRun">Dry run</label>
          </div>

          <div class="checkbox-field">
            <Checkbox
              v-model="continueOnFailure"
              inputId="continueOnFailure"
              :binary="true"
            />
            <label for="continueOnFailure">Continue when one week fails to submit</label>
          </div>
        </div>

        <Message
          severity="info"
          :closable="false"
          class="mt-3"
        >
          This will submit {{ requestedJobCount }} job(s) using POST /api/imports/nfl-schedule.
        </Message>

        <Message
          v-if="errorMessage"
          severity="error"
          :closable="true"
          class="mt-3"
          @close="errorMessage = null"
        >
          {{ errorMessage }}
        </Message>

        <div class="actions">
          <Button
            label="Submit Schedule Load Jobs"
            icon="pi pi-cloud-download"
            :loading="isSubmitting"
            :disabled="!canSubmit"
            @click="submitSeasonScheduleLoad"
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
      </template>
    </Card>

    <Card
      v-if="jobRows.length > 0"
      class="job-status-panel"
    >
      <template #title>
        Schedule Load Queue Status
      </template>

      <template #subtitle>
        {{ completedCount }} completed, {{ failedCount }} failed, {{ cancelledCount }} cancelled,
        {{ activeJobRows.length }} active.
      </template>

      <template #content>
        <ProgressBar :value="progressPercent" />

        <DataTable
          :value="jobRows"
          dataKey="jobId"
          stripedRows
          showGridlines
          responsiveLayout="scroll"
          class="mt-3"
        >
          <Column
            field="jobId"
            header="Job #"
            sortable
            style="width: 7rem"
          />

          <Column
            field="seasonYear"
            header="Season"
            sortable
            style="width: 7rem"
          />

          <Column
            header="Type"
            sortable
          >
            <template #body="{ data }">
              {{ getSeasonTypeLabel(data.seasonType) }}
            </template>
          </Column>

          <Column
            field="week"
            header="Week"
            sortable
            style="width: 6rem"
          />

          <Column
            field="status"
            header="Status"
            sortable
          >
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <Column
            field="message"
            header="Message"
          />

          <Column
            field="lastCheckedAt"
            header="Last Checked"
          />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.load-season-schedule-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(12rem, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.job-status-panel {
  margin-top: 1rem;
}

.w-full {
  width: 100%;
}

.mt-3 {
  margin-top: 1rem;
}

@media (max-width: 1100px) {
  .selection-grid {
    grid-template-columns: repeat(2, minmax(12rem, 1fr));
  }
}

@media (max-width: 700px) {
  .selection-grid {
    grid-template-columns: 1fr;
  }
}
</style>
