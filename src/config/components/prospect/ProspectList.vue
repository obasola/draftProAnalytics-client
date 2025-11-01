<!-- src/components/prospect/ProspectList.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProspectStore } from '@/stores/prospectStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const prospectStore = useProspectStore()
const router = useRouter()

onMounted(() => {
  prospectStore.fetchAll()
})

const viewProspect = (id: number) => {
  router.push(`/prospects/${id}?mode=read`)
}

const editProspect = (id: number) => {
  router.push(`/prospects/${id}?mode=edit`)
}

const createProspect = () => {
  router.push('/prospects?mode=create')
}

const deleteProspect = async (id: number) => {
  if (confirm('Are you sure you want to delete this prospect?')) {
    await prospectStore.remove(id)
  }
}

const formatHeight = (height: number) => {
  const feet = Math.floor(height / 12)
  const inches = height % 12
  return `${feet}'${inches}"`
}

const getPositionSeverity = (position: string) => {
  const severityMap: Record<string, string> = {
    'QB': 'danger',
    'RB': 'success',
    'WR': 'warning',
    'TE': 'info',
    'OL': 'secondary',
    'DL': 'contrast',
    'LB': 'primary',
    'DB': 'help'
  }
  return severityMap[position] || 'secondary'
}
</script>

<template>
  <div class="prospect-list">
    <div class="list-header">
      <h2>Prospects</h2>
      <Button
        @click="createProspect"
        label="Create Prospect"
        icon="pi pi-plus"
        class="p-button-success"
      />
    </div>

    <DataTable
      :value="prospectStore.prospects"
      :loading="prospectStore.loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="scroll"
      sortField="lastName"
      :sortOrder="1"
      filterDisplay="menu"
      :globalFilterFields="['firstName', 'lastName', 'position', 'college']"
    >
      <Column field="firstName" header="First Name" sortable />
      <Column field="lastName" header="Last Name" sortable />
      <Column field="position" header="Position" sortable>
        <template #body="{ data }">
          <Tag 
            :value="data.position" 
            :severity="getPositionSeverity(data.position)"
          />
        </template>
      </Column>
      <Column field="college" header="College" sortable />
      <Column field="height" header="Height" sortable>
        <template #body="{ data }">
          {{ formatHeight(data.height) }}
        </template>
      </Column>
      <Column field="weight" header="Weight" sortable>
        <template #body="{ data }">
          {{ data.weight }} lbs
        </template>
      </Column>
      <Column field="drafted" header="Status" sortable>
        <template #body="{ data }">
          <Tag 
            :value="data.drafted ? 'Drafted' : 'Available'" 
            :severity="data.drafted ? 'success' : 'warning'"
          />
        </template>
      </Column>
      <Column field="draftYear" header="Draft Year" sortable />
      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              @click="viewProspect(data.id)"
              icon="pi pi-eye"
              class="p-button-info p-button-sm"
              v-tooltip="'View'"
            />
            <Button
              @click="editProspect(data.id)"
              icon="pi pi-pencil"
              class="p-button-warning p-button-sm"
              v-tooltip="'Edit'"
            />
            <Button
              @click="deleteProspect(data.id)"
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
.prospect-list {
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