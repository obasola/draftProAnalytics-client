<!-- src/components/playerTeam/PlayerTeamList.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerTeamStore } from '@/stores/playerTeamStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'

const playerTeamStore = usePlayerTeamStore()
const router = useRouter()
const toast = useToast()

onMounted(() => {
  playerTeamStore.fetchAll()
})

const viewPlayerTeam = (id: number) => {
  router.push(`/player-teams/${id}?mode=read`)
}

const editPlayerTeam = (id: number) => {
  router.push(`/player-teams/${id}?mode=edit`)
}

const createPlayerTeam = () => {
  router.push('/player-teams?mode=create')
}

const deletePlayerTeam = async (id: number) => {
  if (confirm('Are you sure you want to delete this player team relationship?')) {
    try {
      await playerTeamStore.remove(id)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Player team relationship deleted successfully',
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete player team relationship',
      })
    }
  }
}

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div class="playerteam-list">
    <div class="list-header">
      <h2>Player Team Relationships</h2>
      <Button
        @click="createPlayerTeam"
        label="Create Player Team"
        icon="pi pi-plus"
        class="p-button-success"
      />
    </div>

    <DataTable
      :value="playerTeamStore.playerTeams"
      :loading="playerTeamStore.loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="scroll"
      sortField="startDate"
      :sortOrder="-1"
    >
      <Column field="id" header="ID" sortable />
      
      <Column field="playerId" header="Player ID" sortable />
      
      <Column field="teamId" header="Team ID" sortable />
      
      <Column field="startDate" header="Start Date" sortable>
        <template #body="{ data }">
          {{ formatDate(data.startDate) }}
        </template>
      </Column>
      
      <Column field="endDate" header="End Date" sortable>
        <template #body="{ data }">
          {{ formatDate(data.endDate) }}
        </template>
      </Column>
      
      <Column field="currentTeam" header="Current Team" sortable>
        <template #body="{ data }">
          <Tag 
            :severity="data.currentTeam ? 'success' : 'warning'"
            :value="data.currentTeam ? 'Current' : 'Past'"
          />
        </template>
      </Column>

      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              @click="viewPlayerTeam(data.id)"
              icon="pi pi-eye"
              class="p-button-info p-button-sm"
              v-tooltip="'View'"
            />
            <Button
              @click="editPlayerTeam(data.id)"
              icon="pi pi-pencil"
              class="p-button-warning p-button-sm"
              v-tooltip="'Edit'"
            />
            <Button
              @click="deletePlayerTeam(data.id)"
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
.playerteam-list {
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