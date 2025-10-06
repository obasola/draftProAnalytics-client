// ──────────────────────────────────────────
// src/components/jobs/JobQueueDialog.vue
// ──────────────────────────────────────────
//export const __components_jobs_JobQueueDialog_vue = `
<script setup lang="ts">
import { ref } from 'vue';
import { useJobStore } from '@/stores/jobStore';
import { useToast } from 'primevue/usetoast';

const visible = ref(false);
const type = ref('');
const payloadText = ref('{}');
const autoStart = ref(true);
const store = useJobStore();
const toast = useToast();

async function submit() {
  try {
    const payload = JSON.parse(payloadText.value || '{}');
    await store.queue({ type: type.value, payload, autoStart: autoStart.value });
    toast.add({ severity: 'success', summary: 'Queued', detail: `Job \${type.value} queued`, life: 2000 });
    visible.value = false; type.value='';
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'Invalid JSON', life: 3000 });
  }
}
</script>

<template>
  <div>
    <Button label="Queue Job" icon="pi pi-plus" @click="visible = true" />
    <Dialog v-model:visible="visible" modal header="Queue Job" style="width: 560px">
      <div class="space-y-3">
        <Dropdown v-model="type" :options="['sync_teams','backfill_season']" placeholder="Job Type" />
        <div class="flex items-center gap-2">
          <InputText v-model="type" placeholder="or type a custom job id" class="flex-1" />
        </div>
        <div>
          <label class="block mb-1">Payload (JSON)</label>
          <textarea v-model="payloadText" rows="8" class="w-full p-2"></textarea>
        </div>
        <div class="flex items-center gap-2">
          <input id="chkAuto" type="checkbox" v-model="autoStart" />
          <label for="chkAuto">Auto start</label>
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" @click="visible = false" />
          <Button label="Queue" @click="submit" :disabled="!type" />
        </div>
      </div>
    </Dialog>
  </div>
</template>
