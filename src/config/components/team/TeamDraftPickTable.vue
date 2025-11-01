<template>
  <div class="team-draftpick-table w-full">
    <div class="list-header bg-team-primary text-team-accent p-4 rounded-lg shadow-lg mb-6">
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <span v-if="currentTeam">{{ currentTeam.name }}</span>
        <span>Draft Picks</span>
      </h2>

      <div class="flex items-center gap-3">
        <label class="text-sm opacity-90">Year</label>
        <Dropdown
          v-model="draftYear"
          :options="yearOptions"
          optionLabel="label"
          optionValue="value"
          class="w-40"
          @change="reloadFirstPage"
        />
        <Button
          @click="createDraftPick"
          label="Create Draft Pick"
          icon="pi pi-plus"
          class="p-button-success"
        />
      </div>
    </div>

    <DataTable
      :value="draftPickStore.draftPicks"
      :loading="draftPickStore.loading"
      :lazy="true"
      paginator
      :rows="rows"
      :first="first"
      :totalRecords="draftPickStore.pagination?.total || 0"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      @page="onPage"
      responsiveLayout="scroll"
      sortField="draftYear"
      :sortOrder="-1"
      class="themed-datatable"
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

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

import { useDraftPickStore } from '@/stores/draftPickStore'
import { useThemeStore } from '@/stores/theme.store'
import { useTeamColors } from '@/composables/useTeamColors'

// Props (allow passing a team explicitly; otherwise fall back to current themed team)
const props = defineProps<{
  teamId?: number | string
  initialYear?: number
}>()

const router = useRouter()
const draftPickStore = useDraftPickStore()
const themeStore = useThemeStore()
const { currentTeam } = useTeamColors()

// Pagination
const rows = ref(10)
const first = ref(0)

// Year selector (default to current year)
const nowYear = new Date().getFullYear()
const draftYear = ref<number>(props.initialYear ?? nowYear)

// Simple recent-years window
const yearOptions = computed(() =>
  Array.from({ length: 6 }, (_, i) => {
    const y = nowYear - i
    return { label: `${y}`, value: y }
  })
)

// Resolve team id
const effectiveTeamId = computed((): number => {
  const id = props.teamId ?? currentTeam?.value?.id
  const numId = typeof id === 'string' ? parseInt(id, 10) : id
  return numId || 0 // or throw an error if you prefer
})

// Data fetch
const fetchPage = async (page = 1, limit = rows.value) => {
  if (!effectiveTeamId.value || !draftYear.value) return
  await draftPickStore.fetchByTeamYear(effectiveTeamId.value, draftYear.value)
}

onMounted(async () => {
  // Ensure theme teams loaded (if you rely on them elsewhere)
  if (themeStore.teams.length === 0) {
    await themeStore.initializeTheme()
  }
  await fetchPage(1, rows.value)
})

watch([() => props.teamId, draftYear], async () => {
  first.value = 0
  await fetchPage(1, rows.value)
})

const onPage = async (event: any) => {
  const page = event.page + 1
  const limit = event.rows
  first.value = event.first
  rows.value = limit
  await fetchPage(page, limit)
}

const reloadFirstPage = async () => {
  first.value = 0
  await fetchPage(1, rows.value)
}

// Actions
const viewDraftPick = (id: number) => router.push(`/draft-picks/${id}?mode=read`)
const editDraftPick = (id: number) => router.push(`/draft-picks/${id}?mode=edit`)
const createDraftPick = () => router.push('/draft-picks?mode=create')
const deleteDraftPick = async (id: number) => {
  if (confirm('Are you sure you want to delete this draft pick?')) {
    await draftPickStore.remove(id)
   // await fetchPage(draftPickStore.currentPage, draftPickStore.itemsPerPage)
  }
}

// Helpers (kept identical to DraftPickList behavior)
const formatPlayerName = (pick: any) => {
  if (pick.playerFirstName && pick.playerLastName) {
    return `${pick.playerFirstName} ${pick.playerLastName}`
  }
  return pick.playerId ? `Player ID: ${pick.playerId}` : 'Unassigned'
}
</script>

<style scoped>
.list-header { display: flex; justify-content: space-between; align-items: center; }
.action-buttons { display: flex; gap: 0.5rem; }

/* Optional: match your themed DataTable styling used elsewhere */
.themed-datatable { box-shadow: var(--shadow-2); border-radius: 0.5rem; overflow: hidden; }
:deep(.p-datatable) { border: 1px solid var(--team-primary); }
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: var(--team-primary);
  color: var(--team-accent);
  border-bottom: 1px solid var(--team-secondary);
  font-weight: 600;
}
:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background-color: rgba(var(--team-primary-rgb), 0.05);
}
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: rgba(var(--team-primary-rgb), 0.1);
}
</style>
