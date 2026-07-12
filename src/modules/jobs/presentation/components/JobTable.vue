<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import JobActions from './JobActions.vue';
import type { Job } from '../../domain/job.types';
import { formatOptionalDate, getJobStatusSeverity, getJobTypeLabel } from './jobUi';

const props = defineProps<{
  readonly items: readonly Job[];
  readonly loading: boolean;
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}>();

const emit = defineEmits<{
  (event: 'page', value: { page: number; pageSize: number }): void;
  (event: 'view', jobId: number): void;
  (event: 'run', jobId: number): void;
  (event: 'cancel', jobId: number): void;
}>();

const onPage = (event: { first: number; rows: number }): void => {
  emit('page', {
    page: Math.floor(event.first / event.rows) + 1,
    pageSize: event.rows,
  });
};
</script>

<template>
  <DataTable
    :value="props.items"
    :loading="props.loading"
    :first="(props.page - 1) * props.pageSize"
    :rows="props.pageSize"
    :totalRecords="props.total"
    dataKey="id"
    lazy
    paginator
    responsiveLayout="scroll"
    stripedRows
    @page="onPage"
  >
    <Column field="id" header="ID" sortable />
    <Column header="Type">
      <template #body="{ data }">
        {{ getJobTypeLabel(data.type) }}
      </template>
    </Column>
    <Column header="Status">
      <template #body="{ data }">
        <Tag :value="data.status" :severity="getJobStatusSeverity(data.status)" />
      </template>
    </Column>
    <Column header="Created">
      <template #body="{ data }">
        {{ formatOptionalDate(data.createdAt) }}
      </template>
    </Column>
    <Column header="Started">
      <template #body="{ data }">
        {{ formatOptionalDate(data.startedAt) }}
      </template>
    </Column>
    <Column header="Finished">
      <template #body="{ data }">
        {{ formatOptionalDate(data.finishedAt) }}
      </template>
    </Column>
    <Column header="Actions">
      <template #body="{ data }">
        <JobActions :job="data" @view="emit('view', $event)" @run="emit('run', $event)" @cancel="emit('cancel', $event)" />
      </template>
    </Column>
  </DataTable>
</template>
