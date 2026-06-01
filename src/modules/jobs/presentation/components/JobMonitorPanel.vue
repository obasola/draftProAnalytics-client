<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import { useDpaJobsStore } from '../stores/useDpaJobsStore';
import { DPA_JOB_STATUS } from '../../domain/NflJobTypes';
import type { DpaJobStatus, DpaJobSummary, DpaJobType } from '../../domain/NflJobTypes';
import { dpaJobStatusOptions, dpaJobTypeOptions, getJobTypeLabel, getStatusSeverity } from '../../domain/NflJobLabels';

const jobsStore = useDpaJobsStore();

const selectedStatus = ref<DpaJobStatus | undefined>(undefined);
const selectedType = ref<DpaJobType | undefined>(undefined);
const resultLimit = ref<number>(50);
const autoRefresh = ref<boolean>(true);
const pollIntervalHandle = ref<number | null>(null);
const logDialogVisible = ref<boolean>(false);
const selectedLogJobId = ref<number | null>(null);
const queueTake = ref<number>(1);

const statusFilterOptions = computed(() => [
  { label: 'All Statuses', value: undefined },
  ...dpaJobStatusOptions,
]);

const typeFilterOptions = computed(() => [
  { label: 'All Job Types', value: undefined },
  ...dpaJobTypeOptions,
]);

const refreshJobs = async (): Promise<void> => {
  await jobsStore.refreshJobs({
    status: selectedStatus.value,
    type: selectedType.value,
    limit: resultLimit.value,
  });
};

const processQueue = async (): Promise<void> => {
  await jobsStore.processJobQueue(queueTake.value);
};

const cancelJob = async (job: DpaJobSummary): Promise<void> => {
  await jobsStore.cancelJob(job.id, 'Canceled from DPA Jobs UI.');
};

const openLogs = async (job: DpaJobSummary): Promise<void> => {
  selectedLogJobId.value = job.id;
  await jobsStore.readJob(job.id);
  await jobsStore.readJobLogs(job.id);
  logDialogVisible.value = true;
};

const closeLogs = (): void => {
  logDialogVisible.value = false;
  selectedLogJobId.value = null;
  jobsStore.clearSelectedJob();
};

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const canCancel = (job: DpaJobSummary): boolean => (
  job.status === DPA_JOB_STATUS.PENDING || job.status === DPA_JOB_STATUS.IN_PROGRESS
);

const renderPayload = (payload: DpaJobSummary['payload']): string => {
  if (!payload || typeof payload !== 'object') {
    return '—';
  }

  const entries = Object.entries(payload)
    .filter(([, value]) => typeof value !== 'object')
    .map(([key, value]) => `${key}: ${String(value)}`);

  return entries.length > 0 ? entries.join(', ') : '—';
};

onMounted(async () => {
  await refreshJobs();

  pollIntervalHandle.value = window.setInterval(() => {
    if (autoRefresh.value) {
      void refreshJobs();
    }
  }, 10000);
});

onUnmounted(() => {
  if (pollIntervalHandle.value !== null) {
    window.clearInterval(pollIntervalHandle.value);
  }
});
</script>

<template>
  <Card>
    <template #title>Job Queue Monitor</template>
    <template #subtitle>
      Review pending, running, completed, failed, and canceled jobs. Process the queue manually when needed.
    </template>

    <template #content>
      <Message v-if="jobsStore.errorMessage" severity="error" :closable="true" @close="jobsStore.clearError">
        {{ jobsStore.errorMessage }}
      </Message>

      <div class="toolbar-row">
        <Dropdown
          v-model="selectedStatus"
          :options="statusFilterOptions"
          option-label="label"
          option-value="value"
          placeholder="Status"
          class="filter-control"
          @change="refreshJobs"
        />

        <Dropdown
          v-model="selectedType"
          :options="typeFilterOptions"
          option-label="label"
          option-value="value"
          placeholder="Type"
          class="filter-control"
          @change="refreshJobs"
        />

        <InputNumber
          v-model="resultLimit"
          :min="10"
          :max="100"
          :step="10"
          :use-grouping="false"
          input-class="limit-input"
          @blur="refreshJobs"
        />

        <Button
          label="Refresh"
          icon="pi pi-refresh"
          :loading="jobsStore.loading"
          severity="secondary"
          outlined
          @click="refreshJobs"
        />
      </div>

      <div class="queue-row">
        <InputNumber
          v-model="queueTake"
          :min="1"
          :max="10"
          :use-grouping="false"
          input-class="queue-take-input"
        />
        <Button
          label="Process Queue"
          icon="pi pi-play"
          :loading="jobsStore.processingQueue"
          @click="processQueue"
        />
        <Button
          :label="autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'"
          :icon="autoRefresh ? 'pi pi-pause' : 'pi pi-sync'"
          severity="secondary"
          outlined
          @click="autoRefresh = !autoRefresh"
        />
      </div>

      <Message v-if="jobsStore.lastQueueResult" severity="success" :closable="false" class="mt-3">
        Queue processed. Completed: {{ jobsStore.lastQueueResult.completed }}, Failed: {{ jobsStore.lastQueueResult.failed }}, Canceled: {{ jobsStore.lastQueueResult.canceled }}.
      </Message>

      <DataTable
        :value="jobsStore.jobs"
        :loading="jobsStore.loading"
        data-key="id"
        responsive-layout="scroll"
        striped-rows
        class="mt-3"
      >
        <Column field="id" header="Job" style="width: 6rem" />

        <Column header="Type">
          <template #body="slotProps">
            {{ getJobTypeLabel(slotProps.data.type) }}
          </template>
        </Column>

        <Column header="Status" style="width: 9rem">
          <template #body="slotProps">
            <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
          </template>
        </Column>

        <Column header="Progress" style="width: 12rem">
          <template #body="slotProps">
            <ProgressBar :value="slotProps.data.progressPercent" :show-value="true" />
            <small>{{ slotProps.data.processedItems }} / {{ slotProps.data.totalItems }}</small>
          </template>
        </Column>

        <Column header="Payload">
          <template #body="slotProps">
            <span class="payload-text">{{ renderPayload(slotProps.data.payload) }}</span>
          </template>
        </Column>

        <Column header="Created" style="width: 11rem">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.createdAt) }}
          </template>
        </Column>

        <Column header="Actions" style="width: 13rem">
          <template #body="slotProps">
            <div class="action-row">
              <Button
                icon="pi pi-list"
                label="Logs"
                size="small"
                severity="secondary"
                outlined
                @click="openLogs(slotProps.data)"
              />
              <Button
                v-if="canCancel(slotProps.data)"
                icon="pi pi-times"
                label="Cancel"
                size="small"
                severity="danger"
                outlined
                @click="cancelJob(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <Dialog
    v-model:visible="logDialogVisible"
    modal
    header="Job Logs"
    :style="{ width: 'min(900px, 95vw)' }"
    @hide="closeLogs"
  >
    <div v-if="jobsStore.selectedJob" class="selected-job-summary">
      <strong>#{{ jobsStore.selectedJob.id }} - {{ getJobTypeLabel(jobsStore.selectedJob.type) }}</strong>
      <Tag :value="jobsStore.selectedJob.status" :severity="getStatusSeverity(jobsStore.selectedJob.status)" />
    </div>

    <DataTable
      :value="jobsStore.selectedJobLogs"
      :loading="jobsStore.loading"
      responsive-layout="scroll"
      striped-rows
      data-key="id"
    >
      <Column header="Time" style="width: 12rem">
        <template #body="slotProps">
          {{ formatDateTime(slotProps.data.createdAt) }}
        </template>
      </Column>
      <Column field="level" header="Level" style="width: 7rem" />
      <Column field="message" header="Message" />
    </DataTable>
  </Dialog>
</template>

<style scoped>
.toolbar-row,
.queue-row,
.action-row,
.selected-job-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.queue-row {
  margin-top: 1rem;
}

.filter-control {
  min-width: 14rem;
}

.limit-input,
.queue-take-input {
  width: 6rem;
}

.mt-3 {
  margin-top: 1rem;
}

.payload-text {
  white-space: normal;
}

.selected-job-summary {
  justify-content: space-between;
  margin-bottom: 1rem;
}
</style>
