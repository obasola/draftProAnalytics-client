<script setup lang="ts">
import { ref } from 'vue'
import { useJobStore } from '@/stores/jobStore'

const jobStore = useJobStore()

const year = ref(2025)
const seasonType = ref(2)
const week = ref(1)

async function kickoff() {
  await jobStore.kickoffEventSync(year.value, seasonType.value, week.value)
}
</script>

<template>
  <Card>
    <h3>Weekly Schedule Sync (Events API)</h3>

    <div class="p-fluid formgrid grid">
      <div class="field col-4">
        <label>Year</label>
        <InputNumber v-model="year" />
      </div>
      <div class="field col-4">
        <label>Season Type</label>
        <Dropdown
          v-model="seasonType"
          :options="[
            { label: 'Preseason', value: 1 },
            { label: 'Regular', value: 2 },
            { label: 'Postseason', value: 3 }
          ]"
        />
      </div>
      <div class="field col-4">
        <label>Week</label>
        <InputNumber v-model="week" />
      </div>
    </div>

    <Button :loading="jobStore.loading" label="Kickoff Event Sync" @click="kickoff" />
  </Card>
</template>
