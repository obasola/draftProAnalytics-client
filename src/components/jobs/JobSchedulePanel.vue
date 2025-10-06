// ──────────────────────────────────────────
// src/components/jobs/JobSchedulePanel.vue
// ──────────────────────────────────────────

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useJobStore } from '@/stores/jobStore';
import { useToast } from 'primevue/usetoast';

const store = useJobStore();
const toast = useToast();
const schedules = ref<Array<{ id: string; cron: string; enabled: boolean; req?: any }>>([]);
const addVisible = ref(false);
const addId = ref('');
const addCron = ref('0 * * * *');
const addType = ref('');
const addPayload = ref('{}');

function isCron(v: string) {
  // simple 5-field cron validation
  return /^\S+\s+\S+\s+\S+\s+\S+\s+\S+$/.test(v.trim());
}

async function refresh() {
  schedules.value = await store.scheduleList();
}

async function add() {
  try {
    if (!isCron(addCron.value)) throw new Error('Invalid cron expression');
    const payload = JSON.parse(addPayload.value || '{}');
    await store.scheduleAdd({ id: addId.value, cron: addCron.value, job: { type: addType.value, payload }, active: true });
    addVisible.value = false; addId.value=''; addType.value='';
    await refresh();
    toast.add({ severity: 'success', summary: 'Scheduled', detail: 'Job schedule added', life: 2000 });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: e?.message || 'Failed to add', life: 3000 });
  }
}

async function toggle(s: { id: string; enabled: boolean }) { await store.scheduleToggle(s.id, !s.enabled); await refresh(); }
async function removeOne(id: string) { await store.scheduleRemove(id); await refresh(); }

onMounted(refresh);
</script>

<template>
  <Panel header="Job Schedules">
    <div class="flex justify-between mb-2">
      <Button label="Refresh" icon="pi pi-refresh" @click="refresh" />
      <Button label="Add" icon="pi pi-plus" @click="addVisible = true" />
    </div>

    <DataTable :value="schedules">
      <Column field="id" header="ID" />
      <Column field="cron" header="Cron" />
      <Column field="enabled" header="Enabled">
        <template #body="{ data }">
          <Tag :value="data.enabled ? 'Yes' : 'No'" :severity="data.enabled ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button size="small" :label="data.enabled ? 'Disable' : 'Enable'" @click="toggle(data)" />
            <Button size="small" label="Remove" severity="danger" @click="removeOne(data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="addVisible" modal header="Add Schedule" style="width: 560px">
      <div class="space-y-3">
        <InputText v-model="addId" placeholder="Schedule ID (unique)" />
        <InputText v-model="addCron" placeholder="Cron (min hour day month wkday)" />
        <InputText v-model="addType" placeholder="Job type" />
        <div>
          <label class="block mb-1">Payload (JSON)</label>
          <textarea v-model="addPayload" rows="6" class="w-full p-2"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" @click="addVisible=false" />
          <Button label="Add" @click="add" :disabled="!addId || !addType || !isCron(addCron)" />
        </div>
      </div>
    </Dialog>
  </Panel>
</template>



