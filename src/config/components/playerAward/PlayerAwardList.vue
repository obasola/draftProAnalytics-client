<!-- src/components/playeraward/PlayerAwardList.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerAwardStore } from '@/stores/playerAwardStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const playerAwardStore = usePlayerAwardStore()
const router = useRouter()

onMounted(() => {
  playerAwardStore.fetchAll()
})

const viewPlayerAward = (id: number) => {
  router.push(`/player-awards/${id}?mode=read`)
}

const editPlayerAward = (id: number) => {
  router.push(`/player-awards/${id}?mode=edit`)
}

const createPlayerAward = () => {
  router.push('/player-awards?mode=create')
}

const deletePlayerAward = async (id: number) => {
  if (confirm('Are you sure you want to delete this player award?')) {
    await playerAwardStore.remove(id)
  }
}
</script>

<template>
  <div class="player-award-list">
    <div class="list-header">
      <h2>Player Awards</h2>
      <Button
        @click="createPlayerAward"
        label="Create Player Award"
        icon="pi pi-plus"
        class="p-button-success"
      />
    </div>

    <DataTable
      :value="playerAwardStore.playerAwards"
      :loading="playerAwardStore.loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="scroll"
    >
      <Column field="id" header="ID" sortable />
      <Column field="awardName" header="Award Name" sortable />
      <Column field="awardYear" header="Year" sortable />
      <Column field="playerId" header="Player ID" sortable />
      <Column field="awardDescription" header="Description" />
      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              @click="viewPlayerAward(data.id)"
              icon="pi pi-eye"
              class="p-button-info p-button-sm"
              v-tooltip="'View'"
            />
            <Button
              @click="editPlayerAward(data.id)"
              icon="pi pi-pencil"
              class="p-button-warning p-button-sm"
              v-tooltip="'Edit'"
            />
            <Button
              @click="deletePlayerAward(data.id)"
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
.player-award-list {
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