<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { useJobsModuleStore } from '../../application/stores/job.store';
import type { JobPayload } from '../../domain/job.types';

const store = useJobsModuleStore();
const toast = useToast();

const visible = ref<boolean>(false);
const type = ref<string>('IMPORT_NFL_SCHEDULE');
const payloadText = ref<string>('{}');
const autoStart = ref<boolean>(true);

const jobTypeOptions = [
  'IMPORT_NFL_SCHEDULE',
  'IMPORT_SCORES_WEEK',
  'PF_DRAFT_SCRAPER',
  'ESPN_PLAYER_IMPORT',
  'NFL_STATS_IMPORT',
];

const parsePayload = (): JobPayload => {
  const parsed = JSON.parse(payloadText.value || '{}') as unknown;

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Payload must be a JSON object.');
  }

  return parsed as JobPayload;
};

const submit = async (): Promise<void> => {
  try {
    const payload = parsePayload();
    await store.queueJob({ type: type.value, payload, autoStart: autoStart.value });
    toast.add({ severity: 'success', summary: 'Queued', detail: `${type.value} queued`, life: 2500 });
    visible.value = false;
    payloadText.value = '{}';
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Unable to queue job', detail: error instanceof Error ? error.message : 'Invalid job request.', life: 3500 });
  }
};
</script>

<template>
  <div>
    <Button label="Queue Job" icon="pi pi-plus" @click="visible = true" />

    <Dialog v-model:visible="visible" modal header="Queue Job" :style="{ width: '560px' }">
      <div class="queue-job-form">
        <Dropdown v-model="type" :options="jobTypeOptions" placeholder="Job Type" class="w-full" />
        <InputText v-model="type" placeholder="Or type a custom job type" class="w-full" />

        <div class="field">
          <label for="payloadText">Payload JSON</label>
          <Textarea id="payloadText" v-model="payloadText" rows="8" class="w-full" />
        </div>

        <div class="checkbox-row">
          <Checkbox v-model="autoStart" inputId="autoStart" :binary="true" />
          <label for="autoStart">Auto start</label>
        </div>

        <div class="dialog-actions">
          <Button label="Cancel" severity="secondary" @click="visible = false" />
          <Button label="Queue" :disabled="!type" @click="submit" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.queue-job-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.checkbox-row,
.dialog-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.dialog-actions {
  justify-content: flex-end;
}

.w-full {
  width: 100%;
}
</style>
