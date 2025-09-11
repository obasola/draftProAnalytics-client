<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '../../stores/jobStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'

const router = useRouter()
const jobStore = useJobStore()
const statusFilter = ref<string|undefined>(undefined)

onMounted(() => jobStore.fetchJobs())

function statusSeverity(s: string) {
  return s === 'completed' ? 'success' :
         s === 'failed' ? 'danger' :
         s === 'in_progress' ? 'warning' :
         s === 'pending' ? 'info' : 'secondary'
}

function onRowClick(e: any) {
  const job = e.data
  if (job.status === 'pending' || job.status === 'in_progress') return
  router.push(`/jobs/${job.id}`)
}

async function applyFilter() {
  await jobStore.fetchJobs(statusFilter.value)
}
</script>

<template>
  <div class="page">
    <div class="controls">
      <Dropdown v-model="statusFilter" :options="['pending','in_progress','completed','failed','canceled']" placeholder="Filter by status" class="w-240" />
      <Button label="Apply" @click="applyFilter" />
    </div>

    <DataTable :value="jobStore.jobs" @row-click="onRowClick" dataKey="id" stripedRows>
      <Column field="id" header="ID" style="width: 80px" />
      <Column field="type" header="Type" />
      <Column header="Status">
        <template #body="{ data }">
          <Tag :severity="statusSeverity(data.status)" :value="data.status" />
        </template>
      </Column>
      <Column field="createdAt" header="Created" />
      <Column field="startedAt" header="Started" />
      <Column field="finishedAt" header="Finished" />
      <Column header="">
        <template #body="{ data }">
          <Button label="Details" :disabled="['pending','in_progress'].includes(data.status)" @click="onRowClick({ data })" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.page { padding: 16px; }
.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.w-240 { width: 240px; }
</style>
