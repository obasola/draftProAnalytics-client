<!-- src/components/draftpick/DraftPickList.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDraftPickStore } from '@/stores/draftPickStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const draftPickStore = useDraftPickStore()
const router = useRouter()

onMounted(() => {
  draftPickStore.fetchAll()
})

const viewDraftPick = (id: number) => {
  router.push(`/draft-picks/${id}?mode=read`)
}

const editDraftPick = (id: number) => {
  router.push(`/draft-picks/${id}?mode=edit`)
}

const createDraftPick = () => {
  router.push('/draft-picks?mode=create')
}

const deleteDraftPick = async (id: number) => {
  if (confirm('Are you sure you want to delete this draft pick?')) {
    await draftPickStore.remove(id)
  }
}

const formatPlayerName = (pick: any) => {
  if (pick.playerFirstName && pick.playerLastName) {
    return `${pick.playerFirstName} ${pick.playerLastName}`
  }
  return pick.playerId ? `Player ID: ${pick.playerId}` : 'Unassigned'
}
</script>

<template>
  <div class="draftpick-list">
    <div class="list-header">
      <h2>Draft Picks</h2>
      <Button
        @click="createDraftPick"
        label="Create Draft Pick"
        icon="pi pi-plus"
        class="p-button-success"
      />
    </div>

    <DataTable
      :value="draftPickStore.draftPicks"
      :loading="draftPickStore.loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="scroll"
      sortField="draftYear"
      :sortOrder="-1"
    >
      <Column field="draftYear" header="Draft Year" sortable />
      <Column field="round" header="Round" sortable />
      <Column field="pickNumber" header="Pick #" sortable />
      <Column header="Player">
        <template #body="{ data }">
          {{ formatPlayerName(data) }}
        </template>
      </Column>
      <Column field="teamId" header="Team ID" sortable />
      <Column field="combineScore" header="Combine Score" sortable>
        <template #body="{ data }">
          {{ data.combineScore?.toFixed(2) || 'N/A' }}
        </template>
      </Column>
      <Column field="pickFrom" header="From Pick" sortable />
      <Column field="pickTo" header="To Pick" sortable />
      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              @click="viewDraftPick(data.id)"
              icon="pi pi-eye"
              class="p-button-info p-button-sm"
              v-tooltip="'View'"
            />
            <Button
              @click="editDraftPick(data.id)"
              icon="pi pi-pencil"
              class="p-button-warning p-button-sm"
              v-tooltip="'Edit'"
            />
            <Button
              @click="deleteDraftPick(data.id)"
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
.draftpick-list {
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