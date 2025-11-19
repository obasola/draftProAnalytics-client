<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'

const store = useScheduleStore()
const year = ref(2025)

onMounted(() => { store.fetchUpcomingSchedule
  store.fetchPrimetime(year.value)  // error: fetchPrimetime not exists on store
})
</script>

<template>
  <Card>
    <h3>Primetime Schedule — {{ year }}</h3>

    <DataTable :value="store.primetimeGames" :loading="store.loading">  // error: primetimeGames not exists on store
      <Column field="gameDate" header="Date" />
      <Column field="homeTeam.name" header="Home" />
      <Column field="awayTeam.name" header="Away" />
      <Column field="primetimeSlot" header="Slot" />
    </DataTable>
  </Card>
</template>
