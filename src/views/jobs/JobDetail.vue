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
  <div class="p-4 space-y-4">
    <Card v-if="jobStore.current">
      <template #title>
        Job #{{ jobStore.current.id }} — {{ jobStore.current.type }}
      </template>
      <template #content>
        <div class="grid grid-cols-2 gap-2">
          <div>Status: <Tag :value="jobStore.current.status" /></div>
          <div>Result: {{ jobStore.current.resultCode || '—' }}</div>
          <div>Created: {{ jobStore.current.createdAt }}</div>
          <div>Started: {{ jobStore.current.startedAt || '—' }}</div>
          <div>Finished: {{ jobStore.current.finishedAt || '—' }}</div>
        </div>
        <pre class="mt-4 bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-auto">
{{ JSON.stringify(jobStore.current.resultJson, null, 2) }}
        </pre>
      </template>
    </Card>

    <Card>
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
