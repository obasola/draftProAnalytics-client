<script setup lang="ts">
import { onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useJobStore } from '@/stores/jobStore';
import JobFilters from '@/components/jobs/JobFilters.vue';
import JobActions from '@/components/jobs/JobActions.vue';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Paginator from 'primevue/paginator';

const store = useJobStore();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

onMounted(() => store.fetch());

function onRun(id: number) {
  store.run(id).then(() => toast.add({ severity: 'success', summary: 'Job started', life: 2000 }))
    .catch(err => toast.add({ severity: 'error', summary: 'Run failed', detail: err.message, life: 3500 }));
}
function onCancel(id: number) {
  confirm.require({
    message: 'Cancel this job?',
    header: 'Confirm',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      store.cancel(id).then(() => toast.add({ severity: 'info', summary: 'Job canceled', life: 2000 }))
        .catch(err => toast.add({ severity: 'error', summary: 'Cancel failed', detail: err.message, life: 3500 }));
    }
  });
}
function statusSeverity(s: string) {
  switch (s) {
    case 'running': return 'info';
    case 'completed': return 'success';
    case 'failed': return 'danger';
    case 'canceled': return 'warn';
    default: return 'secondary';
  }
}
</script>

<template>
  <div class="p-4 space-y-4">
    <JobFilters @apply="store.fetch()" />

    <JobActions @queued="store.fetch()" />

    <DataTable
      :value="store.items"
      dataKey="id"
      :loading="store.loading"
      responsiveLayout="scroll"
      @rowDblclick="e => router.push({ name: 'job-detail', params: { id: e.data.id } })"
    >
      <Column field="id" header="ID" sortable style="width: 90px" />
      <Column field="type" header="Type" sortable />
      <Column header="Status" :body="row => h(Tag, { value: row.status, severity: statusSeverity(row.status) })" />
      <Column field="createdAt" header="Created" sortable />
      <Column header="Actions" :body="row => h('div', { class: 'flex gap-2' }, [
        h(Button, { label: 'Run', size: 'small', onClick: () => onRun(row.id) }),
        h(Button, { label: 'Cancel', size: 'small', severity: 'danger', onClick: () => onCancel(row.id) }),
        h(Button, { label: 'Detail', size: 'small', severity: 'secondary', onClick: () => router.push({ name: 'job-detail', params: { id: row.id } }) }),
      ])" />
    </DataTable>

    <Paginator
      :rows="store.pageSize"
      :totalRecords="store.total"
      :first="(store.page - 1) * store.pageSize"
      @page="(e) => { store.page = e.page + 1; store.pageSize = e.rows; store.fetch(); }"
    />
  </div>
</template>
