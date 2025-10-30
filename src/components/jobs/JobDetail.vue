<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useJobStore } from '../../stores/jobStore';
import { useJobPolling } from '../../composables/useJobPolling';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import Divider from 'primevue/divider';
import { format } from 'date-fns';
import type { JobStatus } from '../../types/Job';

const route = useRoute();
const router = useRouter();
const jobStore = useJobStore();
const { isPolling, startPolling, stopPolling } = useJobPolling();

const loading = ref(false);
const errorMessage = ref<string | null>(null);

const jobId = computed(() => parseInt(route.params.id as string, 10));
const job = computed(() => jobStore.currentJob);

onMounted(async () => {
  await loadJob();
  
  // Start polling if job is running
  if (job.value && job.value.status === 'RUNNING') {
    startPolling(jobId.value, handleJobComplete);
  }
});

watch(() => job.value?.status, (newStatus, oldStatus) => {
  // Start polling when job starts running
  if (newStatus === 'RUNNING' && oldStatus !== 'RUNNING') {
    startPolling(jobId.value, handleJobComplete);
  }
});

async function loadJob() {
  loading.value = true;
  errorMessage.value = null;
  
  try {
    await jobStore.fetchJob(jobId.value);
  } catch (error) {
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'Failed to load job';
  } finally {
    loading.value = false;
  }
}

async function handleCancelJob() {
  if (!job.value) return;
  
  try {
    await jobStore.cancelJob(job.value.id);
  } catch (error) {
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'Failed to cancel job';
  }
}

function handleJobComplete() {
  stopPolling();
}

function goBack() {
  router.push({ name: 'Jobs' });
}

function getStatusSeverity(status: JobStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'RUNNING':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'danger';
    case 'CANCELLED':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getJobTypeLabel(type: string): string {
  switch (type) {
    case 'PF_DRAFT_SCRAPER':
      return 'Pro Football Draft Scraper';
    case 'ESPN_PLAYER_IMPORT':
      return 'ESPN Player Import';
    case 'NFL_STATS_IMPORT':
      return 'NFL Stats Import';
    default:
      return type;
  }
}

function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'PPpp');
}

const canCancel = computed(() => {
  return job.value && (job.value.status === 'PENDING' || job.value.status === 'RUNNING');
});
</script>

<template>
  <div class="flex flex-column gap-3">
    <div class="flex justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="goBack"
        />
        <h2 class="text-2xl font-semibold m-0">Job Details</h2>
      </div>
      
      <div class="flex gap-2">
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          :loading="loading"
          outlined
          @click="loadJob"
        />
        <Button
          v-if="canCancel"
          label="Cancel Job"
          icon="pi pi-times"
          severity="danger"
          outlined
          @click="handleCancelJob"
        />
      </div>
    </div>

    <Message 
      v-if="errorMessage" 
      severity="error" 
      :closable="true"
      @close="errorMessage = null"
    >
      {{ errorMessage }}
    </Message>

    <Card v-if="job">
      <template #content>
        <div class="flex flex-column gap-4">
          <!-- Header Info -->
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-2">
                <span class="text-sm text-color-secondary">Job ID</span>
                <span class="text-xl font-semibold">{{ job.id }}</span>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-2">
                <span class="text-sm text-color-secondary">Type</span>
                <span class="text-xl">{{ getJobTypeLabel(job.type) }}</span>
              </div>
            </div>
          </div>

          <!-- Status and Progress -->
          <Divider />
          
          <div class="flex flex-column gap-3">
            <div class="flex justify-content-between align-items-center">
              <span class="text-sm text-color-secondary">Status</span>
              <Tag :value="job.status" :severity="getStatusSeverity(job.status)" />
            </div>

            <div class="flex flex-column gap-2">
              <div class="flex justify-content-between align-items-center">
                <span class="text-sm text-color-secondary">Progress</span>
                <span class="font-semibold">{{ job.progress }}%</span>
              </div>
              <ProgressBar :value="job.progress" :showValue="false" />
              <small class="text-color-secondary">
                {{ job.processedItems }} of {{ job.totalItems }} items processed
              </small>
            </div>

            <Tag v-if="isPolling" icon="pi pi-spin pi-spinner" severity="info" value="Updating..." />
          </div>

          <!-- Parameters -->
          <Divider />
          
          <div class="flex flex-column gap-2">
            <span class="font-semibold">Parameters</span>
            <pre class="bg-gray-100 p-3 border-round text-sm">{{ JSON.stringify(job.parameters, null, 2) }}</pre>
          </div>

          <!-- Results -->
          <div v-if="job.result" class="flex flex-column gap-2">
            <Divider />
            <span class="font-semibold">Results</span>
            
            <div class="grid">
              <div class="col-6 md:col-3">
                <div class="surface-card p-3 border-round">
                  <div class="text-sm text-color-secondary mb-1">Added</div>
                  <div class="text-xl font-semibold text-green-600">
                    {{ job.result.itemsAdded || 0 }}
                  </div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="surface-card p-3 border-round">
                  <div class="text-sm text-color-secondary mb-1">Updated</div>
                  <div class="text-xl font-semibold text-blue-600">
                    {{ job.result.itemsUpdated || 0 }}
                  </div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="surface-card p-3 border-round">
                  <div class="text-sm text-color-secondary mb-1">Skipped</div>
                  <div class="text-xl font-semibold text-yellow-600">
                    {{ job.result.itemsSkipped || 0 }}
                  </div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="surface-card p-3 border-round">
                  <div class="text-sm text-color-secondary mb-1">Failed</div>
                  <div class="text-xl font-semibold text-red-600">
                    {{ job.result.itemsFailed || 0 }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="job.result.details" class="mt-2">
              <Message severity="info" :closable="false">
                {{ job.result.details }}
              </Message>
            </div>
          </div>

          <!-- Error -->
          <div v-if="job.error">
            <Divider />
            <Message severity="error" :closable="false">
              <strong>Error:</strong> {{ job.error }}
            </Message>
          </div>

          <!-- Timestamps -->
          <Divider />
          
          <div class="grid text-sm">
            <div class="col-12 md:col-6 lg:col-3">
              <div class="flex flex-column gap-1">
                <span class="text-color-secondary">Created</span>
                <span>{{ formatDateTime(job.createdAt) }}</span>
              </div>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
              <div class="flex flex-column gap-1">
                <span class="text-color-secondary">Started</span>
                <span>{{ formatDateTime(job.startedAt) }}</span>
              </div>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
              <div class="flex flex-column gap-1">
                <span class="text-color-secondary">Completed</span>
                <span>{{ formatDateTime(job.completedAt) }}</span>
              </div>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
              <div class="flex flex-column gap-1">
                <span class="text-color-secondary">Created By</span>
                <span>{{ job.createdBy || 'System' }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <div v-else-if="!loading" class="text-center p-6">
      <i class="pi pi-exclamation-circle text-4xl text-color-secondary mb-3" />
      <p class="text-color-secondary">Job not found</p>
    </div>
  </div>
</template>

<style scoped>
pre {
  overflow-x: auto;
  max-width: 100%;
}
</style>