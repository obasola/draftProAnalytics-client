<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import { useJobStore } from '@/stores/jobStore'

const toast = useToast()
const jobStore = useJobStore()

const loading = ref(false)
const seasonYear = ref(new Date().getFullYear())
const seasonType = ref<1 | 2 | 3>(2) // 1=Pre, 2=Reg, 3=Post
const week = ref<number | null>(null)

const seasonTypeOptions = [
  { label: 'Preseason', value: 1 },
  { label: 'Regular Season', value: 2 },
  { label: 'Postseason', value: 3 }
]

const weeks = Array.from({ length: 18 }, (_, i) => ({ label: `Week ${i + 1}`, value: i + 1 }))

async function runDraftImport() {
  if (!week.value) {
    toast.add({ severity: 'warn', summary: 'Missing Week', detail: 'Please select a week first' })
    return
  }

  loading.value = true
  try {
    const res = await jobStore.createJob({
      type: 'PF_DRAFT_SCRAPER',
      payload: {
        seasonYear: seasonYear.value,
        seasonType: seasonType.value,
        week: week.value
      },
      autoStart: true
    })

    toast.add({
      severity: 'success',
      summary: 'Draft Import Started',
      detail: `Job #${res?.id ?? 'N/A'} queued`
    })
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.message ?? 'Job failed to start' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <Card>
      <template #title>Draft Data Import</template>
      <template #content>
        <div class="flex flex-column gap-3">
          <div class="flex flex-wrap gap-2">
            <Dropdown v-model="seasonYear" :options="[2024, 2025, 2026]" placeholder="Year" />
            <Dropdown v-model="seasonType" :options="seasonTypeOptions" optionLabel="label" optionValue="value" />
            <Dropdown v-model="week" :options="weeks" optionLabel="label" optionValue="value" placeholder="Select Week" />
          </div>

          <div>
            <Button
              label="Start Draft Import"
              icon="pi pi-cloud-upload"
              :loading="loading"
              severity="primary"
              @click="runDraftImport"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.flex-column {
  display: flex;
  flex-direction: column;
}
.flex-wrap {
  flex-wrap: wrap;
}
.gap-3 {
  gap: 1rem;
}
</style>
