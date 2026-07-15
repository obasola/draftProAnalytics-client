<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import { useDpaJobsStore } from '../stores/useDpaJobsStore';

const emit = defineEmits<{ readonly 'job-submitted': [jobId: number] }>();
const store = useDpaJobsStore();
const currentYear = new Date().getFullYear();
const draftYear = ref(currentYear);
const activateMembership = ref(true);
const overwriteExistingPositions = ref(false);
const message = ref<string | null>(null);
const valid = computed(() => Number.isInteger(draftYear.value) && draftYear.value >= 1936 && draftYear.value <= currentYear + 2);

const loadClass = async (): Promise<void> => {
  if (!valid.value) return;
  const job = await store.enqueueLoadEspnDraftClassPlayers({ draftYear: draftYear.value });
  message.value = `Queued draft-class player job #${job.id}.`;
  emit('job-submitted', job.id);
};

const loadResults = async (): Promise<void> => {
  if (!valid.value) return;
  const job = await store.enqueueLoadEspnDraftResults({ draftYear: draftYear.value, activateMembership: activateMembership.value });
  message.value = `Queued draft-results job #${job.id}.`;
  emit('job-submitted', job.id);
};

const enrichPositions = async (): Promise<void> => {
  if (!valid.value) return;
  const job = await store.enqueueEnrichPlayerTeamPositions({
    draftYear: draftYear.value,
    overwriteExisting: overwriteExistingPositions.value,
  });
  message.value = `Queued PlayerTeam position enrichment job #${job.id}.`;
  emit('job-submitted', job.id);
};
</script>

<template>
  <Card>
    <template #title>ESPN Draft Data Import</template>
    <template #subtitle>Load draft classes, completed selections, or backfill PlayerTeam positions for one draft year.</template>
    <template #content>
      <div class="form">
        <label for="draftYear">Draft Year</label>
        <InputNumber id="draftYear" v-model="draftYear" :min="1936" :max="currentYear + 2" :use-grouping="false" />

        <div class="check">
          <Checkbox input-id="activateMembership" v-model="activateMembership" binary />
          <label for="activateMembership">Mark drafted team as the active PlayerTeam membership</label>
        </div>

        <div class="check">
          <Checkbox input-id="overwriteExistingPositions" v-model="overwriteExistingPositions" binary />
          <label for="overwriteExistingPositions">Overwrite existing PlayerTeam positions during position enrichment</label>
        </div>

        <Message v-if="message" severity="success" :closable="false">{{ message }}</Message>
        <Message v-if="store.errorMessage" severity="error" :closable="false">{{ store.errorMessage }}</Message>

        <div class="actions">
          <Button label="Load Draft Class Players" icon="pi pi-users" :disabled="!valid" :loading="store.submitting" @click="loadClass" />
          <Button label="Load Draft Results + Teams" icon="pi pi-download" :disabled="!valid" :loading="store.submitting" @click="loadResults" />
          <Button label="Enrich PlayerTeam Positions" icon="pi pi-refresh" severity="secondary" :disabled="!valid" :loading="store.submitting" @click="enrichPositions" />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 1rem; }
.check, .actions { display: flex; align-items: center; gap: .75rem; }
.actions { flex-wrap: wrap; }
</style>
