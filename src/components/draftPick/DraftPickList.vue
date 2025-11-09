<!-- src/components/draftPick/DraftPickList.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Card from 'primevue/card'
import { useDraftPickStore } from '@/stores/draftPickStore'
import { useTeamStore } from '@/stores/teamStore'
import { teamService } from '@/services/teamService'
import AppLayout from '@/components/ui/AppLayout.vue'

const router = useRouter()
const draftPickStore = useDraftPickStore()
const teamStore = useTeamStore()

const filterYear = ref<number | undefined>(undefined)
const filterTeam = ref<number | undefined>(undefined)

const yearOptions = ref<{ label: string; value: number }[]>([])
const teamOptions = ref<{ label: string; value: number }[]>([])

const initializeYearOptions = (): void => {
  const currentYear = new Date().getFullYear()
  const years = [{ label: 'All Years', value: 0 }]
  for (let i = currentYear + 5; i >= currentYear - 20; i--) {
    years.push({ label: i.toString(), value: i })
  }
  yearOptions.value = years
}

const loadTeams = async (): Promise<void> => {
  try {
    // Use Pinia store for caching and fallback
    await teamStore.fetchAll()
    const apiTeams = await teamService.getTeamNames()
    teamOptions.value = [
      { label: 'All Teams', value: 0 },
      ...apiTeams.map(team => ({ label: team.name, value: team.id }))
    ]
  } catch (error) {
    console.error('❌ Failed to load teams:', error)
  }
}

const loadDraftPicks = async (): Promise<void> => {
  try {
    if (filterTeam.value && filterTeam.value > 0 && filterYear.value && filterYear.value > 0) {
      await draftPickStore.fetchByTeamAndYear(filterTeam.value, filterYear.value)
    } else if (filterYear.value && filterYear.value > 0) {
      await draftPickStore.fetchByYear(filterYear.value)
    } else {
      await draftPickStore.fetchAllWithRelations()
    }
  } catch (error) {
    console.error('❌ Failed to load draft picks:', error)
  }
}

const filteredPicks = ref<any[]>([])

const applyTeamFilter = () => {
 // alert("Selected Team: "+filterTeam.value+" Selected Year: "+filterYear.value)
  if (filterTeam.value && filterTeam.value > 0) {
    // find the team name corresponding to the selected teamId
    const selectedTeam = teamOptions.value.find(t => t.value === filterTeam.value)
    const teamName = selectedTeam ? selectedTeam.label : undefined
    if(filterYear.value && filterYear.value > 0) {
      draftPickStore.fetchByTeamAndYear(filterTeam.value, filterYear.value)
      filteredPicks.value = draftPickStore.draftPicksWithRelations
    }else 
    if (teamName) {
      filteredPicks.value = draftPickStore.draftPicksWithRelations.filter(
        pick => pick.team?.toLowerCase() === teamName.toLowerCase()
      )
    } else {
      filteredPicks.value = draftPickStore.draftPicksWithRelations
    }
  } else {
    filteredPicks.value = draftPickStore.draftPicksWithRelations
  }
}


const applyFilters = async (): Promise<void> => {
  await loadDraftPicks()
  applyTeamFilter()
}

const clearFilters = async (): Promise<void> => {
  filterYear.value = undefined
  filterTeam.value = undefined
  await loadDraftPicks()
  applyTeamFilter()
}

const refresh = async (): Promise<void> => {
  await loadDraftPicks()
  applyTeamFilter()
}

const viewDraftPick = (draftYear: number, round: number, pickNumber: number): void => {
  router.push(`/draftpicks/${draftYear}/${round}/${pickNumber}?mode=read`)
}

const editDraftPick = (draftYear: number, round: number, pickNumber: number): void => {
  router.push(`/draftpicks/${draftYear}/${round}/${pickNumber}?mode=edit`)
}

const createDraftPick = (): void => {
  router.push('/draftpicks/create')
}

onMounted(async () => {
  initializeYearOptions()
  await loadTeams()
  await loadDraftPicks()
  applyTeamFilter()
})
</script>

<template>
  <Card class="draft-picks-container">
    <template #title>
      <div class="page-header">
        <h2>Draft Picks Management</h2>
        <Button 
          @click="createDraftPick" 
          icon="pi pi-plus" 
          label="Create Draft Pick"
          class="p-button-success"
        />
      </div>
    </template>

    <template #content>
      <div class="filters-section">
        <div class="filter-row">
          <div class="filter-item">
            <label for="yearFilter">Year&nbsp;&nbsp;</label>
            <Dropdown 
              id="yearFilter"
              v-model="filterYear" 
              :options="yearOptions" 
              optionLabel="label" 
              optionValue="value"
              placeholder="All Years"
            />
            <label for="teamFilter">&nbsp;&nbsp;Team&nbsp;&nbsp;</label>
            <Dropdown 
              id="teamFilter"
              v-model="filterTeam" 
              :options="teamOptions" 
              optionLabel="label" 
              optionValue="value"
              placeholder="All Teams"
              @change="applyTeamFilter"
            />

            <Button 
              @click="applyFilters" 
              icon="pi pi-filter" 
              label="Apply"
              class="p-button-primary"
            />
            <Button 
              @click="clearFilters" 
              icon="pi pi-filter-slash" 
              label="Clear"
              class="p-button-secondary"
            />
          </div>
        </div>
      </div>

      <div v-if="draftPickStore.loading" class="loading-message">
        <i class="pi pi-spin pi-spinner"></i> Loading draft picks...
      </div>

      <div v-else-if="draftPickStore.error" class="error-message">
        <i class="pi pi-exclamation-triangle"></i> {{ draftPickStore.error }}
      </div>

      <div v-else-if="filteredPicks.length === 0" class="empty-message">
        <i class="pi pi-info-circle"></i> No draft picks found. Create your first draft pick!
      </div>

      <DataTable 
        v-else
        :value="draftPickStore.draftPicksWithRelations" 
        :paginator="true"
        :rows="25"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        class="draft-picks-table"
        responsiveLayout="scroll"
        sortField="draftYear"
        :sortOrder="-1"
      >
        <Column field="draftYear" header="Year" sortable />
        <Column field="round" header="Round" sortable />
        <Column field="pickNumber" header="Pick #" sortable />
        <Column field="team" header="Team" sortable>
          <template #body="{ data }">{{ data.team }}</template>
        </Column>
        <Column field="player" header="Player" sortable>
          <template #body="{ data }">
            <span v-if="data.player">{{ data.player }}</span>
            <span v-else class="text-muted">Not selected</span>
          </template>
        </Column>
        <Column field="position" header="Position" sortable>
          <template #body="{ data }">
            <span v-if="data.position">{{ data.position }}</span>
            <span v-else>-</span>
          </template>
        </Column>
        <Column header="Actions" :exportable="false">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button 
                @click="viewDraftPick(data.draftYear, data.round, data.pickNumber)" 
                icon="pi pi-eye" 
                class="p-button-info p-button-sm"
                v-tooltip="'View'"
              />
              <Button 
                @click="editDraftPick(data.draftYear, data.round, data.pickNumber)" 
                icon="pi pi-pencil" 
                class="p-button-warning p-button-sm"
                v-tooltip="'Edit'"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <div v-if="filteredPicks.length > 0" class="table-summary">
        <span>Total Draft Picks: <strong>{{ filteredPicks.length }}</strong></span>
      </div>
    </template>
  </Card>
</template>

<style scoped>
/* Existing styles remain unchanged */
</style>
