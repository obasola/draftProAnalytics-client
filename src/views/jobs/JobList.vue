<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '@/stores/jobStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'

const router = useRouter()
const jobStore = useJobStore()
const statusFilter = ref<string|undefined>(undefined)

onMounted(() => jobStore.fetchJobs())

const year = ref<number>(2025)
const seasons = ref<('pre'|'reg'|'post')[]>(['pre','reg'])
async function enqueue() {
  await jobStore.enqueueImport(year.value, seasons.value)
  await jobStore.fetchJobs()
}

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
  <div class="p-4">
    <div class="flex items-center gap-2 mb-4">
      <Dropdown v-model="statusFilter" :options="['pending','in_progress','completed','failed','canceled']" placeholder="Filter by status" class="w-60" />
      <Button label="Apply" @click="applyFilter" />
    </div>
    <div class="flex items-center gap-2 mb-2">
  <InputNumber v-model="year" :min="2000" :max="2100" placeholder="Year" />
  <MultiSelect v-model="seasons" :options="['pre','reg','post']" placeholder="Seasons" class="w-60" />
  <Button label="Import" @click="enqueue" />
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
