<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useJobStore } from '../../stores/jobStore'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const route = useRoute()
const jobStore = useJobStore()
const id = Number(route.params.id)

onMounted(async () => {
  await jobStore.fetchJob(id)
  await jobStore.fetchLogs(id)
})
</script>

<template>
  <div class="page">
    <Card v-if="jobStore.current" class="block">
      <template #title>
        Job #{{ jobStore.current.id }} — {{ jobStore.current.type }}
      </template>
      <template #content>
        <div class="grid2">
          <div>Status: <Tag :value="jobStore.current.status" /></div>
          <div>Result: {{ jobStore.current.resultCode || '—' }}</div>
          <div>Created: {{ jobStore.current.createdAt }}</div>
          <div>Started: {{ jobStore.current.startedAt || '—' }}</div>
          <div>Finished: {{ jobStore.current.finishedAt || '—' }}</div>
        </div>
        <pre class="payload">
{{ JSON.stringify(jobStore.current.resultJson, null, 2) }}
        </pre>
      </template>
    </Card>

    <Card class="block">
      <template #title>Logs</template>
      <template #content>
        <DataTable :value="jobStore.logs" dataKey="id" stripedRows>
          <Column field="createdAt" header="Time" />
          <Column field="level" header="Level" />
          <Column field="message" header="Message" />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.page { padding: 16px; }
.block { margin-bottom: 16px; }
.grid2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.payload {
  margin-top: 12px;
  background: #111;
  color: #eaeaea;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  max-height: 320px;
  overflow: auto;
}
</style>
