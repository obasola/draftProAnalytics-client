<!-- src/views/ShowUpcomingGamesView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUpcomingScheduleStore } from '@/stores/upcomingScheduleStore'

const store = useUpcomingScheduleStore()

const year = ref(2025)
const seasonType = ref(2)   // 1=Pre, 2=Reg, 3=Post
const week = ref(11)

const seasonOptions = [
  { label: 'Preseason', value: 1 },
  { label: 'Regular Season', value: 2 },
  { label: 'Postseason', value: 3 },
]

const weekOptions = [
  { label: 'Preseason', value: 0 },
  ...Array.from({ length: 18 }, (_, i) => ({ label: `Week ${i + 1}`, value: i + 1 })),
  { label: 'Postseason', value: 99 },
]

function load() {
  store.fetchUpcomingSchedule(year.value, seasonType.value, week.value)
}

onMounted(load)


</script>

<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-3">Upcoming NFL Games</h2>
    <div class="toolbar">
  <div class="field">
    <label>Year</label>
    <InputNumber
      v-model="year"
      class="small-input"
      @change="load"
    />
  </div>

  <div class="field">
    <label>Season Type</label>
    <Dropdown
      v-model="seasonType"
      :options="seasonOptions"
      optionLabel="label"
      optionValue="value"
      class="small-input"
      @change="load"
    />
  </div>

  <div class="field">
    <label>Week</label>
    <Dropdown
      v-model="week"
      :options="weekOptions"
      optionLabel="label"
      optionValue="value"
      class="small-input"
      @change="load"
    />
  </div>
</div>

    <DataTable
      :value="store.upcomingEvents"
      :loading="store.loading"
      tableStyle="min-width: 100%"
    >
      <Column field="dateFormatted" header="Date/Time" style="width: 200px" />

      <Column header="Matchup">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <img :src="data.awayLogo" class="w-8 h-8" />
            <span class="font-semibold">{{ data.awayTeamName }}</span>
            <span class="px-2">@</span>
            <img :src="data.homeLogo" class="w-8 h-8" />
            <span class="font-semibold">{{ data.homeTeamName }}</span>
          </div>
        </template>
      </Column>

      <Column field="status" header="Status" style="width: 120px" />
    </DataTable>
  </div>
</template>

<style scoped>
img {
  object-fit: contain;
}
.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.small-input :deep(.p-inputtext),
.small-input :deep(.p-dropdown),
.small-input :deep(.p-dropdown-label) {
  height: 32px !important;        /* reduce height */
  padding: 4px 8px !important;
  font-size: 14px;
}

.small-input :deep(.p-dropdown-trigger) {
  width: 24px;
}

label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 3px;
}

</style>
