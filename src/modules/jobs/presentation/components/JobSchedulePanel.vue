<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Panel from 'primevue/panel';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { useJobsModuleStore } from '../../application/stores/job.store';
import type { JobPayload, JobSchedule } from '../../domain/job.types';

const store = useJobsModuleStore();
const toast = useToast();

const addVisible = ref<boolean>(false);
const addId = ref<string>('');
const addCron = ref<string>('0 * * * *');
const addType = ref<string>('');
const addPayload = ref<string>('{}');

const isCronExpression = (value: string): boolean => /^\S+\s+\S+\s+\S+\s+\S+\s+\S+$/.test(value.trim());

const parsePayload = (): JobPayload => {
  const parsed = JSON.parse(addPayload.value || '{}') as unknown;

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Payload must be a JSON object.');
  }

  return parsed as JobPayload;
};

const refresh = async (): Promise<void> => {
  await store.fetchSchedules();
};

const add = async (): Promise<void> => {
  try {
    if (!isCronExpression(addCron.value)) {
      throw new Error('Invalid cron expression. Use five fields: minute hour day month weekday.');
    }

    const payload = parsePayload();

    await store.addSchedule({
      id: addId.value,
      cron: addCron.value,
      job: {
        type: addType.value,
        payload,
      },
      active: true,
    });

    addVisible.value = false;
    addId.value = '';
    addType.value = '';
    addPayload.value = '{}';

    toast.add({ severity: 'success', summary: 'Scheduled', detail: 'Job schedule added.', life: 2500 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Unable to add schedule', detail: error instanceof Error ? error.message : 'Invalid schedule.', life: 3500 });
  }
};

const toggle = async (schedule: JobSchedule): Promise<void> => {
  await store.toggleSchedule(schedule.id, !schedule.enabled);
};

const removeOne = async (scheduleId: string): Promise<void> => {
  await store.removeSchedule(scheduleId);
};

onMounted(() => {
  void refresh();
});
</script>

<template>
  <Panel header="Job Schedules">
    <div class="schedule-toolbar">
      <Button label="Refresh" icon="pi pi-refresh" @click="refresh" />
      <Button label="Add" icon="pi pi-plus" @click="addVisible = true" />
    </div>

    <DataTable :value="store.schedules" dataKey="id" responsiveLayout="scroll">
      <Column field="id" header="ID" />
      <Column field="cron" header="Cron" />
      <Column field="enabled" header="Enabled">
        <template #body="{ data }">
          <Tag :value="data.enabled ? 'Yes' : 'No'" :severity="data.enabled ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="row-actions">
            <Button size="small" :label="data.enabled ? 'Disable' : 'Enable'" @click="toggle(data)" />
            <Button size="small" label="Remove" severity="danger" @click="removeOne(data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="addVisible" modal header="Add Schedule" :style="{ width: '560px' }">
      <div class="schedule-form">
        <InputText v-model="addId" placeholder="Schedule ID" />
        <InputText v-model="addCron" placeholder="Cron: min hour day month weekday" />
        <InputText v-model="addType" placeholder="Job type" />

        <div class="field">
          <label for="schedulePayload">Payload JSON</label>
          <Textarea id="schedulePayload" v-model="addPayload" rows="6" class="w-full" />
        </div>

        <div class="dialog-actions">
          <Button label="Cancel" severity="secondary" @click="addVisible = false" />
          <Button label="Save" :disabled="!addId || !addType" @click="add" />
        </div>
      </div>
    </Dialog>
  </Panel>
</template>

<style scoped>
.schedule-toolbar,
.row-actions,
.dialog-actions {
  display: flex;
  gap: 0.65rem;
}

.schedule-toolbar {
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.schedule-form,
.field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dialog-actions {
  justify-content: flex-end;
}

.w-full {
  width: 100%;
}
</style>
