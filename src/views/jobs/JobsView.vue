// src/views/jobs/JobsView.vue
<script setup lang="ts">
import { ref, onMounted, Ref} from 'vue'
import { useToast } from 'primevue/usetoast'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { JobsApi } from '@/services/api'
import { useScoreboardStore } from '../../stores/scoreboardScoreStore'

const toast = useToast()
const initializing = ref(true)   // 🧩 ADD THIS LINE
const loading = ref(false)
// form fields
const seasonYear: Ref<string> = ref(new Date().getFullYear().toString())
const seasonType = ref<1 | 2 | 3>(2) // default Regular season
const week = ref<number>(1)

const scoreboardStore = useScoreboardStore()
const activeTab = ref(0)

onMounted(async () => {
  try {
    initializing.value = true
    const { year, seasonType: st, week: wk } = await scoreboardStore.getCurrentWeek()
    seasonYear.value = year.toString()
    seasonType.value = st
    week.value = wk
    toast.add({
      severity: 'info',
      summary: 'Auto-filled current week',
      detail: `Detected Week ${wk}, ${year} (${seasonType})`,
    })
  } catch (err) {
    console.warn('⚠️ Could not auto-detect week:', err)
  } finally {
    initializing.value = false
  }
})

// dropdown options
const seasonTypeOptions = [
  { label: 'Preseason', value: 1 },
  { label: 'Regular Season', value: 2 },
  { label: 'Postseason', value: 3 },
]

// helper
async function runImportScoresWeek() {
  loading.value = true
  try {
    const res = await JobsApi.kickoffScoreboardByWeek(Number(seasonYear.value), seasonType.value, week.value)
    toast.add({
      severity: 'success',
      summary: 'Job started',
      detail: `Scoreboard job #${res.id ?? 'N/A'} queued`,
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Failed to start job',
      detail: err.message ?? 'Unknown error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="mb-4">
      <h1 class="text-3xl font-bold m-0">Job Management</h1>
      <p class="text-color-secondary mt-2">Manage and monitor batch import jobs</p>
    </div>

    <div class="card mb-4 p-4 shadow-sm surface-card border-round-lg">
      <h3 class="text-xl font-semibold mb-3">Import NFL Scores by Week</h3>

      <div class="grid align-items-center gap-3">
        <div class="col-12 md:col-3">
          <label for="seasonYear" class="block text-sm font-medium mb-1">Season Year</label>
          <InputText
            id="seasonYear"
            v-model="seasonYear"
            placeholder="2025"
            type="text"
          />
        </div>

        <div class="col-12 md:col-3">
          <label for="seasonType" class="block text-sm font-medium mb-1">Season Type</label>
          <Dropdown
            v-model="seasonType"
            :options="seasonTypeOptions"
            optionLabel="label"
            optionValue="value"
            inputId="seasonType"
            placeholder="Select"
            class="w-full"
          />
        </div>

        <div class="col-12 md:col-3">
          <label for="week" class="block text-sm font-medium mb-1">Week</label>
          <InputNumber
            v-model="week"
            inputId="week"
            :min="1"
            :max="25"
            showButtons
            buttonLayout="horizontal"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
          />
        </div>

        <div class="col-12 md:col-3 flex align-items-end">
          <Button
            label="Run Import"
            icon="pi pi-cloud-download"
            class="p-button-success w-full"
            :loading="loading"
            @click="runImportScoresWeek"
          />
        </div>
      </div>
    </div>

    <!-- Tabs remain below -->
    <TabView v-model:activeIndex="activeTab">
      <TabPanel header="Active Jobs">
        <JobList />
      </TabPanel>

      <TabPanel header="Import Draft Data">
        <div class="max-w-30rem">
          <PFDraftScraperForm />
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--surface-50);
}
</style>
