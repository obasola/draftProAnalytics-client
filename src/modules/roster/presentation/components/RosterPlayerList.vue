<!-- src/components/rosterPlayer/RosterPlayerList.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRosterPlayerStore } from '../../application/stores/rosterPlayerStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from 'primevue/api'

const rosterPlayerStore = useRosterPlayerStore()
const router = useRouter()
const toast = useToast()

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  playerName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  position: { value: null, matchMode: FilterMatchMode.EQUALS },
  positionGroup: { value: null, matchMode: FilterMatchMode.EQUALS },
  isStarter: { value: null, matchMode: FilterMatchMode.EQUALS },
})

const positionGroupOptions = ref([
  { label: 'Offense', value: 'OFF' },
  { label: 'Defense', value: 'DEF' },
  { label: 'Special Teams', value: 'ST' },
])

const starterOptions = ref([
  { label: 'Yes', value: true },
  { label: 'No', value: false },
])

onMounted(() => {
  rosterPlayerStore.fetchAll()
})

const viewRosterPlayer = (id: string) => {
  router.push(`/roster-players/${id}?mode=read`)
}

const editRosterPlayer = (id: string) => {
  router.push(`/roster-players/${id}?mode=edit`)
}

const createRosterPlayer = () => {
  router.push('/roster-players?mode=create')
}

const deleteRosterPlayer = async (id: string) => {
  if (confirm('Are you sure you want to remove this player from the roster?')) {
    try {
      await rosterPlayerStore.remove(id)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Roster player removed successfully',
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to remove roster player',
      })
    }
  }
}

const getInjurySeverity = (status: string | null) => {
  if (!status || status === 'HEALTHY') return 'success'
  if (status === 'QUESTIONABLE') return 'info'
  if (status === 'DOUBTFUL') return 'warning'
  return 'danger'
}

const getInjuryLabel = (status: string | null) => {
  if (!status) return 'N/A'
  return status.replace(/_/g, ' ')
}

const getPerformanceGradeSeverity = (grade: number) => {
  if (grade >= 80) return 'success'
  if (grade >= 60) return 'info'
  if (grade >= 40) return 'warning'
  return 'danger'
}
</script>

<template>
  <div class="roster-player-list">
    <div class="list-header">
      <h2>Team Roster</h2>
      <Button
        @click="createRosterPlayer"
        label="Add Player"
        icon="pi pi-plus"
        class="p-button-success"
      />
    </div>

    <DataTable
      :value="rosterPlayerStore.rosterPlayers"
      :loading="rosterPlayerStore.loading"
      v-model:filters="filters"
      filterDisplay="row"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      responsiveLayout="scroll"
      sortField="depthChartOrder"
      :sortOrder="1"
      :globalFilterFields="['playerName', 'position', 'positionGroup']"
      :rowClass="(data) => data.isStarter ? 'starter-row' : ''"
    >
      <Column field="playerName" header="Player Name" sortable>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            class="p-column-filter"
            placeholder="Search by name"
          />
        </template>
      </Column>
      
      <Column field="position" header="Position" sortable>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            class="p-column-filter"
            placeholder="Search position"
          />
        </template>
      </Column>
      
      <Column field="positionGroup" header="Group" sortable>
        <template #body="{ data }">
          <Tag 
            :value="data.positionGroup"
            :severity="data.positionGroup === 'OFF' ? 'info' : data.positionGroup === 'DEF' ? 'danger' : 'warning'"
          />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown
            v-model="filterModel.value"
            :options="positionGroupOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by group"
            @change="filterCallback()"
            showClear
            class="p-column-filter"
          />
        </template>
      </Column>
      
      <Column field="depthChartOrder" header="Depth" sortable>
        <template #body="{ data }">
          <span :class="{ 'starter-depth': data.depthChartOrder === 1 }">
            {{ data.depthChartOrder }}
          </span>
        </template>
      </Column>
      
      <Column field="isStarter" header="Starter" sortable>
        <template #body="{ data }">
          <Tag 
            :severity="data.isStarter ? 'success' : 'secondary'"
            :value="data.isStarter ? 'Yes' : 'No'"
          />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown
            v-model="filterModel.value"
            :options="starterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by starter"
            @change="filterCallback()"
            showClear
            class="p-column-filter"
          />
        </template>
      </Column>
      
      <Column field="age" header="Age" sortable />
      
      <Column field="yearsExperience" header="Exp" sortable>
        <template #body="{ data }">
          {{ data.yearsExperience }}yr
        </template>
      </Column>
      
      <Column field="performanceGrade" header="Grade" sortable>
        <template #body="{ data }">
          <Tag 
            :severity="getPerformanceGradeSeverity(data.performanceGrade)"
            :value="data.performanceGrade.toFixed(1)"
          />
        </template>
      </Column>
      
      <Column field="contractYearsRemaining" header="Contract" sortable>
        <template #body="{ data }">
          {{ data.contractYearsRemaining }}yr
        </template>
      </Column>
      
      <Column field="injuryStatus" header="Health" sortable>
        <template #body="{ data }">
          <Tag 
            :severity="getInjurySeverity(data.injuryStatus)"
            :value="getInjuryLabel(data.injuryStatus)"
          />
        </template>
      </Column>

      <Column header="Actions" frozen alignFrozen="right">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              @click="viewRosterPlayer(data.id)"
              icon="pi pi-eye"
              class="p-button-info p-button-sm"
              v-tooltip="'View'"
            />
            <Button
              @click="editRosterPlayer(data.id)"
              icon="pi pi-pencil"
              class="p-button-warning p-button-sm"
              v-tooltip="'Edit'"
            />
            <Button
              @click="deleteRosterPlayer(data.id)"
              icon="pi pi-trash"
              class="p-button-danger p-button-sm"
              v-tooltip="'Remove'"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-users" style="font-size: 3rem; color: var(--text-secondary);"></i>
          <p>No players on roster</p>
          <Button
            @click="createRosterPlayer"
            label="Add First Player"
            icon="pi pi-plus"
            class="p-button-sm"
          />
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.roster-player-list {
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

:deep(.starter-row) {
  background-color: rgba(34, 197, 94, 0.05);
  font-weight: 500;
}

.starter-depth {
  font-weight: bold;
  color: var(--green-600);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

:deep(.p-column-filter) {
  width: 100%;
}
</style>