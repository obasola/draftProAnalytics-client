<!-- src/components/player/PlayerList.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const playerStore = usePlayerStore()
const router = useRouter()

onMounted(() => {
  playerStore.fetchAll()
})

const viewPlayer = (id: number) => {
  router.push(`/players/${id}?mode=read`)
}

const editPlayer = (id: number) => {
  router.push(`/players/${id}?mode=edit`)
}

const createPlayer = () => {
  router.push('/players?mode=create')
}

const deletePlayer = async (id: number) => {
  if (confirm('Are you sure you want to delete this player?')) {
    await playerStore.remove(id)
  }
}
const getNflLogo = (): string => {
  return `../../images/NFLogo.jpeg`
}
</script>

<template>
  <div class="team-list">
    <!-- Updated header with team colors -->
    <div class="list-header bg-team-primary text-team-accent">
      <h2 class="nfl-logo">
        <img :src="getNflLogo()" class="inline-logo" />
        Players
      </h2>
      <Button @click="createPlayer" label="Create Games" icon="pi pi-plus" class="p-button-success" />
    </div>

    <DataTable :value="playerStore.players" :loading="playerStore.loading" paginator :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]" responsiveLayout="scroll" class="themed-datatable">
      <Column field="firstName" header="First Name" sortable />
      <Column field="lastName" header="Last Name" sortable />
      <Column field="position" header="Position" sortable />
      <Column field="team.name" header="Team" sortable />
      <Column field="university" header="University" sortable />
      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button @click="viewPlayer(data.id)" icon="pi pi-eye" class="p-button-info p-button-sm"
              v-tooltip="'View'" />
            <Button @click="editPlayer(data.id)" icon="pi pi-pencil" class="p-button-warning p-button-sm"
              v-tooltip="'Edit'" />
            <Button @click="deletePlayer(data.id)" icon="pi pi-trash" class="p-button-danger p-button-sm"
              v-tooltip="'Delete'" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.team-list {
  width: 100%;
}

/* Updated list-header with team colors */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.myDataTable {
  background-color: saddlebrown;
}

.p-datatable .p-datatable-tbody>tr {
  background: tan;
  color: #4b5563;
  transition: box-shadow 0.2s;
}

.p-datatable-odd {
  background-color: tan;
  /* A light blue background */
}

.p-datatable-even {
  background-color: salmon;
  /* A light blue background */
}
</style>