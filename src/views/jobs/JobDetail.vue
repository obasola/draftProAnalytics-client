
// ──────────────────────────────────────────
// src/views/jobs/JobDetail.vue
// ──────────────────────────────────────────
//export const __views_jobs_JobDetail_vue = `
<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useJobStore } from '../../stores/jobStore';
import JobLogsPanel from '@/components/jobs/JobLogsPanel.vue';

const route = useRoute();
const store = useJobStore();
const timer = ref<number | null>(null);

watch(() => route.params.id, async (id) => {
  if (!id) return;
  await store.detail(Number(id));
  await store.fetchLogs(Number(id), false);
}, { immediate: true });

onMounted(() => {
  timer.value = window.setInterval(async () => {
    const id = Number(route.params.id);
    if (id) await store.fetchLogs(id, true);
  }, 1500);
});

onUnmounted(() => { if (timer.value) clearInterval(timer.value); store.disconnectSse(); });
</script>

<template>
  <div class="p-4 space-y-3">
    <Card v-if="store.current">
      <template #title>Job #{{ store.current.id }} — {{ store.current.type }}</template>
      <template #content>
        <div class="grid md:grid-cols-3 gap-4">
          <div><b>Status:</b> {{ store.current.status }}</div>
          <div><b>Created:</b> {{ store.current.createdAt }}</div>
          <div><b>Started:</b> {{ store.current.startedAt || '-' }}</div>
          <div><b>Finished:</b> {{ store.current.finishedAt || '-' }}</div>
          <div><b>Result:</b> {{ store.current.resultCode || '-' }}</div>
          <div><b>Cancel Reason:</b> {{ store.current.cancelReason || '-' }}</div>
        </div>
      </template>
    </Card>

    <Accordion multiple>
      <AccordionTab header="Logs">
        <JobLogsPanel :job-id="Number(route.params.id)" />
      </AccordionTab>
      <AccordionTab header="Payload / Result">
        <div class="grid md:grid-cols-2 gap-4">
          <Panel header="Payload JSON">
            <pre class="text-xs overflow-auto max-h-[40vh]">{{ JSON.stringify(store.current?.payload ?? {}, null, 2) }}</pre>
          </Panel>
          <Panel header="Result JSON">
            <pre class="text-xs overflow-auto max-h-[40vh]">{{ JSON.stringify(store.current?.resultJson ?? {}, null, 2) }}</pre>
          </Panel>
        </div>
      </AccordionTab>
      <AccordionTab header="Metadata">
        <div class="grid md:grid-cols-2 gap-4">
          <Panel header="Timestamps">
            <ul class="text-sm space-y-1">
              <li><b>createdAt:</b> {{ store.current?.createdAt }}</li>
              <li><b>startedAt:</b> {{ store.current?.startedAt || '-' }}</li>
              <li><b>finishedAt:</b> {{ store.current?.finishedAt || '-' }}</li>
              <li><b>cancelAt:</b> {{ store.current?.cancelAt || '-' }}</li>
            </ul>
          </Panel>
          <Panel header="Status / Codes">
            <ul class="text-sm space-y-1">
              <li><b>status:</b> {{ store.current?.status }}</li>
              <li><b>resultCode:</b> {{ store.current?.resultCode || '-' }}</li>
              <li><b>cancelReason:</b> {{ store.current?.cancelReason || '-' }}</li>
            </ul>
          </Panel>
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>
 

