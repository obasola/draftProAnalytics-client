// src/components/jobs/JobList.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useJobStore } from '../../stores/jobStore';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import { formatDistanceToNow } from 'date-fns';
import type { Job, JobStatus } from '../../types/Job';

const router = useRouter();
const jobStore = useJobStore();

const loading = ref(false);

const jobs = computed(() => jobStore.jobs);

onMounted(async () => {
  await loadJobs();
});

async function loadJobs() {
  loading.value = true;
  try {
    await jobStore.fetchJobs();
  } finally {
    loading.value = false;
  }
}
/*
await jobStore.createJob({
  type: 'IMPORT_SCORES_WEEK',
  payload: { seasonYear: 2025, seasonType: 2, week: 7 },
});
*/
function viewJobDetail(job: Job) {
  router.push({ name: 'JobDetail', params: { id: job.id } });
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

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}
</script>

<template>
  <div class="flex flex-column gap-3">
    <div class="flex justify-content-between align-items-center">
      <h2 class="text-2xl font-semibold m-0">Jobs</h2>
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        :loading="loading"
        @click="loadJobs"
      />
    </div>

    <DataTable
      :value="jobs"
      :loading="loading"
      stripedRows
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50]"
      dataKey="id"
      @row-click="(event) => viewJobDetail(event.data)"
      class="cursor-pointer"
    >
      <Column field="id" header="ID" :sortable="true" style="width: 80px" />
      
      <Column field="type" header="Type" :sortable="true">
        <template #body="{ data }">
          <span class="font-semibold">{{ getJobTypeLabel(data.type) }}</span>
        </template>
      </Column>

      <Column field="status" header="Status" :sortable="true" style="width: 140px">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
        </template>
      </Column>

      <Column field="progress" header="Progress" style="width: 200px">
        <template #body="{ data }">
          <div class="flex flex-column gap-1">
            <ProgressBar :value="data.progress" :showValue="false" style="height: 8px" />
            <small class="text-color-secondary">
              {{ data.progress }}% ({{ data.processedItems }}/{{ data.totalItems }})
            </small>
          </div>
        </template>
      </Column>

      <Column field="createdAt" header="Created" :sortable="true" style="width: 150px">
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </Column>

      <Column header="Actions" style="width: 100px">
        <template #body="{ data }">
          <Button
            icon="pi pi-eye"
            text
            rounded
            @click.stop="viewJobDetail(data)"
            v-tooltip.top="'View Details'"
          />
        </template>
        
      </Column>

      <template #empty>
        <div class="text-center p-4 text-color-secondary">
          No jobs found
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--surface-hover);
}
</style>