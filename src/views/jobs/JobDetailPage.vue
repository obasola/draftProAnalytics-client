<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useJobStore } from '@/stores/jobStore';

import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const route = useRoute();
const id = Number(route.params.id);
const store = useJobStore();
const toast = useToast();

let timer: number | undefined;

function startTail() {
  stopTail();
  timer = window.setInterval(() => store.fetchLogs(id).catch(() => {}), 1500);
}
function stopTail() {
  if (timer) { clearInterval(timer); timer = undefined; }
}

onMounted(async () => {
  await store.detail(id);
  store.resetLogs();
  await store.fetchLogs(id);
});

onBeforeUnmount(stopTail);

function statusSeverity(s: string) {
  switch (s) {
    case 'running': return 'info';
    case 'completed': return 'success';
    case 'failed': return 'danger';
    case 'canceled': return 'warn';
    default: return 'secondary';
  }
}

async function runNow() {
  try {
    await store.run(id);
    toast.add({ severity: 'success', summary: 'Run started', life: 2000 });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Run failed', detail: e.message });
  }
}
async function cancelNow() {
  try {
    await store.cancel(id);
    toast.add({ severity: 'info', summary: 'Job canceled', life: 2000 });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Cancel failed', detail: e.message });
  }
}
</script>

<template>
  <div class="p-4 space-y-4">
    <Card>
      <template #title>
        Job {{ store.current?.id }}
      </template>
      <template #content>
        <div class="grid grid-cols-2 gap-3">
          <div><b>Type:</b> {{ store.current?.type }}</div>
          <div><b>Status:</b> <Tag :value="store.current?.status" :severity="statusSeverity(store.current?.status||'')" /></div>
          <div><b>Created:</b> {{ store.current?.createdAt }}</div>
          <div v-if="store.current?.startedAt"><b>Started:</b> {{ store.current?.startedAt }}</div>
          <div v-if="store.current?.finishedAt"><b>Finished:</b> {{ store.current?.finishedAt }}</div>
          <div v-if="store.current?.resultCode"><b>Result:</b> {{ store.current?.resultCode }}</div>
          <div v-if="store.current?.cancelReason"><b>Cancel Reason:</b> {{ store.current?.cancelReason }}</div>
        </div>
        <div class="mt-3 flex gap-2">
          <Button label="Run" @click="runNow" />
          <Button label="Cancel" severity="danger" @click="cancelNow" />
          <Button label="Tail logs" severity="secondary" @click="startTail" />
          <Button label="Stop" severity="secondary" @click="stopTail" />
        </div>
      </template>
    </Card>

    <Card>
      <template #title>Result JSON</template>
      <template #content>
        <pre class="bg-gray-900 text-gray-100 p-3 rounded overflow-auto max-h-64">
{{ JSON.stringify(store.current?.resultJson ?? null, null, 2) }}
        </pre>
      </template>
    </Card>

    <Card>
      <template #title>Logs</template>
      <template #content>
        <div class="h-72 overflow-auto font-mono text-sm bg-gray-900 text-gray-100 p-3 rounded">
          <div v-for="l in store.logs" :key="l.id">[{{ l.createdAt }}] ({{ l.level }}) {{ l.message }}</div>
        </div>
      </template>
    </Card>
  </div>
</template>
