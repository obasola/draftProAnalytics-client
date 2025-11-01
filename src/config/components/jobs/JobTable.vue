// ──────────────────────────────────────────
// src/components/jobs/JobTable.vue
// ──────────────────────────────────────────
export const __components_jobs_JobTable_vue = `
<script setup lang="ts">
import JobActions from './JobActions.vue';

const props = defineProps<{
  items: any[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
}>();
const emit = defineEmits<{ (e: 'page', v: { page: number; pageSize: number }): void; (e: 'run', id: number): void; (e: 'cancel', id: number): void }>();

function onPage(e: any) {
  emit('page', { page: Math.floor(e.first / e.rows) + 1, pageSize: e.rows });
}
</script>

<template>
  <DataTable :value="props.items" :loading="props.loading" paginator :rows="props.pageSize" :totalRecords="props.total" :lazy="true" @page="onPage">
    <Column field="id" header="ID" />
    <Column field="type" header="Type" />
    <Column field="status" header="Status" />
    <Column field="createdAt" header="Created" />
    <Column field="startedAt" header="Started" />
    <Column field="finishedAt" header="Finished" />
    <Column header="Actions">
      <template #body="{ data }">
        <JobActions :job="data" @run="$emit('run', data.id)" @cancel="$emit('cancel', data.id)" />
      </template>
    </Column>
  </DataTable>
</template>
`;

