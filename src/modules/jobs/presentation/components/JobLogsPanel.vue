<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Panel from 'primevue/panel';
import Tag from 'primevue/tag';
import type { JobLog } from '../../domain/job.types';

const props = defineProps<{
  readonly logs: readonly JobLog[];
}>();

const severityForLevel = (level: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' => {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return 'danger';
    case 'WARN':
      return 'warning';
    case 'INFO':
      return 'info';
    case 'DEBUG':
      return 'secondary';
    default:
      return 'secondary';
  }
};
</script>

<template>
  <Panel header="Job Logs">
    <DataTable :value="props.logs" dataKey="id" responsiveLayout="scroll" stripedRows>
      <Column header="Time">
        <template #body="{ data }">
          {{ new Date(data.createdAt).toLocaleString() }}
        </template>
      </Column>
      <Column header="Level">
        <template #body="{ data }">
          <Tag :value="data.level" :severity="severityForLevel(data.level)" />
        </template>
      </Column>
      <Column field="message" header="Message" />
    </DataTable>
  </Panel>
</template>
