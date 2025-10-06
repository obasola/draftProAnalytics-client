<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useJobStore } from '@/stores/jobStore';
import ScheduleEditor from './ScheduleEditor.vue';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ToggleButton from 'primevue/togglebutton';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const store = useJobStore();
const toast = useToast();

const showEditor = ref(false);
const editId = ref<string | null>(null);

onMounted(() => store.fetchSchedule());

async function toggle(row: any) {
  try {
    await store.toggleSchedule(row.id, !row.enabled);
    toast.add({ severity: 'success', summary: 'Updated', life: 1500 });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Toggle failed', detail: e.message });
  }
}

async function removeRow(id: string) {
  try {
    await store.removeSchedule(id);
    toast.add({ severity: 'info', summary: 'Removed', life: 1500 });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Remove failed', detail: e.message });
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="font-semibold">Scheduler</div>
      <Button label="Add" icon="pi pi-plus" @click="() => { editId = null; showEditor = true; }" />
    </div>

    <DataTable :value="store.scheduling" dataKey="id" responsiveLayout="scroll">
      <Column field="id" header="ID" />
      <Column field="cron" header="CRON" />
      <Column header="Enabled" :body="row => 
        h(ToggleButton, { onChange: () => toggle(row), checked: row.enabled, onLabel: 'On', offLabel: 'Off' })" />
      <Column header="Actions" :body="row =>
        h('div', { class: 'flex gap-2' }, [
          h(Button, { label: 'Edit', size: 'small', severity: 'secondary', onClick: () => { editId = row.id; showEditor = true; } }),
          h(Button, { label: 'Delete', size: 'small', severity: 'danger', onClick: () => removeRow(row.id) }),
        ])" />
    </DataTable>

    <Dialog v-model:visible="showEditor" header="Schedule" modal :style="{ width: '36rem' }">
      <ScheduleEditor :editId="editId" @saved="() => { showEditor = false; }" @cancel="() => showEditor = false" />
    </Dialog>
  </div>
</template>
