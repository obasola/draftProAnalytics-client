<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useJobStatusPolling } from '../../application/useJobStatusPolling';
import { useJobsModuleStore } from '../../application/stores/job.store';
import JobLogsPanel from './JobLogsPanel.vue';
import { formatOptionalDate, getJobStatusSeverity, getJobTypeLabel } from './jobUi';

const route = useRoute();
const router = useRouter();
const store = useJobsModuleStore();
const { startPolling, stopPolling } = useJobStatusPolling({ intervalMs: 3000 });

const loading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

const jobId = computed<number>(() => Number(route.params.id));
const job = computed(() => store.currentJob);

const isActive = computed<boolean>(() => {
  return job.value !== null && ['PENDING', 'QUEUED', 'RUNNING'].includes(job.value.status);
});

const progressValue = computed<number>(() => {
  if (!job.value) {
    return 0;
  }

  if (job.value.status === 'COMPLETED') {
    return 100;
  }

  if (job.value.status === 'FAILED' || job.value.status === 'CANCELLED') {
    return 100;
  }

  if (job.value.status === 'RUNNING') {
    return 50;
  }

  return 10;
});

const loadJob = async (): Promise<void> => {
  if (!Number.isFinite(jobId.value)) {
    errorMessage.value = 'Invalid job id.';
    return;
  }

  loading.value = true;
  errorMessage.value = null;

  try {
    await store.fetchJob(jobId.value);
    await store.fetchJobLogs(jobId.value);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load job.';
  } finally {
    loading.value = false;
  }
};

const handleCancelJob = async (): Promise<void> => {
  if (!job.value) {
    return;
  }

  try {
    await store.cancelJob(job.value.id);
    await loadJob();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to cancel job.';
  }
};

const handleRunJob = async (): Promise<void> => {
  if (!job.value) {
    return;
  }

  try {
    await store.runJob(job.value.id);
    await loadJob();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to run job.';
  }
};

const goBack = (): void => {
  router.push({ name: 'Jobs' });
};

const startDetailPolling = (): void => {
  startPolling(async () => {
    await loadJob();

    if (!isActive.value) {
      stopPolling();
    }
  });
};

onMounted(async () => {
  await loadJob();

  if (isActive.value) {
    startDetailPolling();
  }
});

watch(
  () => job.value?.status,
  (newStatus) => {
    if (newStatus !== undefined && ['PENDING', 'QUEUED', 'RUNNING'].includes(newStatus)) {
      startDetailPolling();
    }
  },
);
</script>

<template>
  <section class="job-detail">
    <div class="page-actions">
      <Button label="Back to Jobs" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
      <Button v-if="job" label="Refresh" icon="pi pi-refresh" :loading="loading" @click="loadJob" />
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <Card v-if="job">
      <template #title>
        Job #{{ job.id }} — {{ getJobTypeLabel(job.type) }}
      </template>

      <template #subtitle>
        <Tag :value="job.status" :severity="getJobStatusSeverity(job.status)" />
      </template>

      <template #content>
        <ProgressBar :value="progressValue" />
        <Divider />

        <dl class="job-meta-grid">
          <div>
            <dt>Created</dt>
            <dd>{{ formatOptionalDate(job.createdAt) }}</dd>
          </div>
          <div>
            <dt>Started</dt>
            <dd>{{ formatOptionalDate(job.startedAt) }}</dd>
          </div>
          <div>
            <dt>Finished</dt>
            <dd>{{ formatOptionalDate(job.finishedAt) }}</dd>
          </div>
          <div>
            <dt>Result</dt>
            <dd>{{ job.resultCode ?? job.cancelReason ?? 'N/A' }}</dd>
          </div>
        </dl>

        <Divider />

        <div class="job-actions">
          <Button label="Run" icon="pi pi-play" :disabled="!['PENDING', 'QUEUED'].includes(job.status)" @click="handleRunJob" />
          <Button label="Cancel" icon="pi pi-times" severity="danger" :disabled="!isActive" @click="handleCancelJob" />
        </div>

        <Divider />

        <pre class="payload-block">{{ JSON.stringify(job.payload ?? {}, null, 2) }}</pre>
      </template>
    </Card>

    <JobLogsPanel :logs="store.currentJobLogs" />
  </section>
</template>

<style scoped>
.job-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-actions,
.job-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.job-meta-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(10rem, 1fr));
  gap: 1rem;
  margin: 0;
}

.job-meta-grid dt {
  font-weight: 700;
}

.job-meta-grid dd {
  margin: 0.25rem 0 0;
}

.payload-block {
  max-height: 24rem;
  overflow: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--surface-ground);
}

@media (max-width: 900px) {
  .job-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
