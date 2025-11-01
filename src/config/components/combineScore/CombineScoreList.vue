<!-- src/components/combineScore/CombineScoreList.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCombineScoreStore } from '../../stores/combineScoreStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const combineScoreStore = useCombineScoreStore()
const router = useRouter()

onMounted(() => {
  combineScoreStore.fetchAll()
})

const viewCombineScore = (id: number) => {
  router.push(`/combineScores/${id}?mode=read`)
}

const editCombineScore = (id: number) => {
  router.push(`/combineScores/${id}?mode=edit`)
}

const createCombineScore = () => {
  router.push('/combineScores?mode=create')
}

const deleteCombineScore = async (id: number) => {
  if (confirm('Are you sure you want to delete this combine score?')) {
    await combineScoreStore.remove(id)
  }
}

const formatTime = (time: number) => {
  return time.toFixed(2) + 's'
}

const formatDistance = (distance: number) => {
  return distance.toFixed(1) + '"'
}

const formatReps = (reps: number) => {
  return reps.toString()
}
</script>

<template>
  <div class="combine-score-list">
    <div class="list-header">
      <h2>Combine Scores</h2>
      <Button
        @click="createCombineScore"
        label="Create Combine Score"
        icon="pi pi-plus"
        class="p-button-success"
      />
    </div>

    <DataTable
      :value="combineScoreStore.combineScores"
      :loading="combineScoreStore.loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="scroll"
      sortMode="multiple"
    >
      <Column field="playerId" header="Player ID" sortable />
      <Column field="fortyTime" header="40-Yard Dash" sortable>
        <template #body="{ data }">
          {{ formatTime(data.fortyTime) }}
        </template>
      </Column>
      <Column field="tenYardSplit" header="10-Yard Split" sortable>
        <template #body="{ data }">
          {{ formatTime(data.tenYardSplit) }}
        </template>
      </Column>
      <Column field="verticalLeap" header="Vertical Leap" sortable>
        <template #body="{ data }">
          {{ formatDistance(data.verticalLeap) }}
        </template>
      </Column>
      <Column field="broadJump" header="Broad Jump" sortable>
        <template #body="{ data }">
          {{ formatDistance(data.broadJump) }}
        </template>
      </Column>
      <Column field="threeCone" header="3-Cone Drill" sortable>
        <template #body="{ data }">
          {{ formatTime(data.threeCone) }}
        </template>
      </Column>
      <Column field="twentyYardShuttle" header="20-Yard Shuttle" sortable>
        <template #body="{ data }">
          {{ formatTime(data.twentyYardShuttle) }}
        </template>
      </Column>
      <Column field="benchPress" header="Bench Press" sortable>
        <template #body="{ data }">
          {{ formatReps(data.benchPress) }}
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              @click="viewCombineScore(data.id)"
              icon="pi pi-eye"
              class="p-button-info p-button-sm"
              v-tooltip="'View'"
            />
            <Button
              @click="editCombineScore(data.id)"
              icon="pi pi-pencil"
              class="p-button-warning p-button-sm"
              v-tooltip="'Edit'"
            />
            <Button
              @click="deleteCombineScore(data.id)"
              icon="pi pi-trash"
              class="p-button-danger p-button-sm"
              v-tooltip="'Delete'"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.combine-score-list {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}
</style>