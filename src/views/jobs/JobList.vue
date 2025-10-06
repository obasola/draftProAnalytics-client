// ──────────────────────────────────────────
// src/views/jobs/JobList.vue
// ──────────────────────────────────────────
export const __views_jobs_JobList_vue = `
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useJobStore } from '../../stores/jobStore';
import JobQueueDialog from '@/components/jobs/JobQueueDialog.vue';
import JobFilters from '@/components/jobs/JobFilters.vue';
import JobTable from '@/components/jobs/JobTable.vue';

const store = useJobStore();
const statuses = ['pending','running','completed','failed','canceled'];
const types = ref<string[]>(['sync_teams','backfill_season']); // extend as needed

onMounted(() => { store.fetch(); });

function handlePage({ page, pageSize }: { page: number; pageSize: number }) {
  store.fetch({ page, pageSize });
}
function handleFilters({ status, type }: { status?: string; type?: string }) {
  store.filterStatus = status || '';
  store.filterType = type || '';
  store.fetch({ page: 1 });
}
</script>

<template>
  <div class="p-4 space-y-3">
    <div class="flex items-center gap-2">
      <JobFilters :statuses="statuses" :types="types" :status="store.filterStatus" :type="store.filterType" @update="handleFilters" />
      <Button label="Refresh" icon="pi pi-refresh" @click="store.fetch()" />
      <JobQueueDialog />
    </div>

    <JobTable
      :items="store.items"
      :loading="store.loading"
      :page="store.page"
      :pageSize="store.pageSize"
      :total="store.total"
      @page="handlePage"
    />
  </div>
</template>
`;
