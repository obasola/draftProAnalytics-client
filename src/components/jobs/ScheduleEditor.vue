<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useJobStore } from '@/stores/jobStore';

import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

const props = defineProps<{ editId: string | null }>();
const emit = defineEmits<{ (e: 'saved'): void; (e: 'cancel'): void }>();

const store = useJobStore();
const toast = useToast();

const id = ref<string>('');
const cron = ref<string>('0 2 * * *');
const enabled = ref<boolean>(true);
const type = ref<string>('backfillSeason');
const payloadText = ref<string>('{}');

watchEffect(() => {
  if (!props.editId) {
    id.value = '';
    cron.value = '0 2 * * *';
    enabled.value = true;
    type.value = 'backfillSeason';
    payloadText.value = '{}';
  } else {
    const row = store.scheduling.find(s => s.id === props.editId);
    if (row) {
      id.value = row.id;
      cron.value = row.cron;
      enabled.value = row.enabled;
    }
  }
});

async function save() {
  try {
    const payload = payloadText.value?.trim() ? JSON.parse(payloadText.value) : undefined;
    await store.scheduleAdd({
      id: id.value,
      cron: cron.value,
      job: { type: type.value, payload, autoStart: true },
      active: enabled.value,
    });
    toast.add({ severity: 'success', summary: 'Saved', life: 1500 });
    emit('saved');
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Save failed', detail: e.message });
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div>
      <label class="text-sm mb-1 block">ID</label>
      <InputText v-model="id" placeholder="unique-id" />
    </div>
    <div>
      <label class="text-sm mb-1 block">CRON</label>
      <InputText v-model="cron" placeholder="* * * * *" />
    </div>
    <div>
      <label class="text-sm mb-1 block">Job Type</label>
      <Dropdown v-model="type" :options="['backfillSeason','syncTeams','importWeek']" />
    </div>
    <div>
      <label class="text-sm mb-1 block">Payload (JSON)</label>
      <Textarea v-model="payloadText" rows="6" class="w-full font-mono" />
    </div>
    <div class="flex items-center gap-2">
      <Checkbox v-model="enabled" :binary="true" inputId="enabled" />
      <label for="enabled">Enabled</label>
    </div>

    <div class="flex justify-end gap-2">
      <Button label="Cancel" severity="secondary" @click="$emit('cancel')" />
      <Button label="Save" @click="save" />
    </div>
  </div>
</template>
