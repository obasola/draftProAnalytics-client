// ──────────────────────────────────────────
// src/components/jobs/JobLogsPanel.vue
// ──────────────────────────────────────────
export const __components_jobs_JobLogsPanel_vue = `
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useJobStore } from '@/stores/jobStore';

const props = defineProps<{ jobId: number }>();
const store = useJobStore();
const follow = ref(true);
const timer = ref<number | null>(null);

async function load(initial = false) {
  await store.fetchLogs(props.jobId, !initial ? true : false);
}

watch(() => props.jobId, async () => { await store.detail(props.jobId); await load(true); });

onMounted(async () => {
  await load(true);
  timer.value = window.setInterval(async () => { await load(false); }, 1500);
});

onUnmounted(() => { if (timer.value) clearInterval(timer.value); });
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-2">
      <Button size="small" label="Refresh" icon="pi pi-refresh" @click="load(false)" />
      <Button size="small" :label="follow ? 'Following' : 'Follow tail'" :severity="follow ? 'success' : 'secondary'" @click="follow = !follow" />
      <Button size="small" label="Clear" severity="secondary" @click="store.logs = []; store.lastLogId = 0;" />
    </div>
    <div class="overflow-auto max-h-[50vh] space-y-1" ref="logBox">
      <div v-for="l in store.logs" :key="l.id" class="text-sm">
        <span class="opacity-70 mr-2">{{ l.createdAt }}</span>
        <span class="uppercase mr-2">{{ l.level }}</span>
        <span>{{ l.message }}</span>
      </div>
    </div>
  </div>
</template>
`;

