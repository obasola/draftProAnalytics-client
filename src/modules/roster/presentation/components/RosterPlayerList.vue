<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { useRosterPlayerStore } from '../../application/stores/rosterPlayerStore'

const props = defineProps<{
  teamId?: number
}>()

const rosterPlayerStore = useRosterPlayerStore()
const playerNameSearch = ref('')
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const rosterPlayers = computed(() => rosterPlayerStore.teamRosterPlayers)

const filteredRosterPlayers = computed(() => {
  const search = playerNameSearch.value.trim().toLowerCase()
  if (!search) return rosterPlayers.value
  return rosterPlayers.value.filter((membership) =>
    membership.playerName.toLowerCase().includes(search),
  )
})

const loadRoster = async (): Promise<void> => {
  if (!props.teamId) return
  await rosterPlayerStore.fetchByTeamId(props.teamId)
}

const clearSearch = (): void => {
  playerNameSearch.value = ''
}

const positionSeverity = (position: string | null): 'info' | 'success' | 'warning' | 'secondary' => {
  if (!position) return 'secondary'
  if (['QB', 'RB', 'FB', 'WR', 'TE', 'C', 'G', 'OG', 'T', 'OT', 'OL'].includes(position)) return 'info'
  if (['K', 'P', 'LS', 'RET'].includes(position)) return 'warning'
  return 'success'
}

onMounted(loadRoster)
watch(() => props.teamId, loadRoster)
</script>

<template>
  <section class="team-roster-list">
    <div class="roster-toolbar">
      <div>
        <h2>Roster for Team</h2>
        <span class="roster-count">
          {{ filteredRosterPlayers.length }} player{{ filteredRosterPlayers.length === 1 ? '' : 's' }}
        </span>
      </div>

      <div class="toolbar-actions">
        <span class="p-input-icon-left player-search">
          <i class="pi pi-search" />
          <InputText
            v-model="playerNameSearch"
            placeholder="Search by player name"
            aria-label="Search roster by player name"
          />
        </span>
        <Button
          icon="pi pi-times"
          label="Clear"
          severity="secondary"
          text
          :disabled="!playerNameSearch"
          @click="clearSearch"
        />
        <Button
          icon="pi pi-refresh"
          label="Refresh"
          severity="secondary"
          outlined
          :loading="rosterPlayerStore.loading"
          @click="loadRoster"
        />
      </div>
    </div>

    <div v-if="rosterPlayerStore.error" class="error-message">
      {{ rosterPlayerStore.error }}
    </div>

    <DataTable
      v-model:filters="filters"
      :value="filteredRosterPlayers"
      :loading="rosterPlayerStore.loading"
      paginator
      :rows="20"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      responsiveLayout="scroll"
      sortField="lastName"
      :sortOrder="1"
      dataKey="playerTeamId"
      stripedRows
      removableSort
    >
      <Column field="playerName" header="Player" sortable>
        <template #body="{ data }">
          <div class="player-cell">
            <strong>{{ data.playerName }}</strong>
            <small v-if="data.university">{{ data.university }}</small>
          </div>
        </template>
      </Column>

      <Column field="position" header="Position" sortable>
        <template #body="{ data }">
          <Tag
            :value="data.position || 'Unknown'"
            :severity="positionSeverity(data.position)"
          />
        </template>
      </Column>

      <Column field="jerseyNumber" header="No." sortable>
        <template #body="{ data }">
          {{ data.jerseyNumber ?? '—' }}
        </template>
      </Column>

      <Column field="age" header="Age" sortable />

      <Column field="yearsExperience" header="Experience" sortable>
        <template #body="{ data }">
          {{ data.yearsExperience === 0 ? 'Rookie' : `${data.yearsExperience} yr` }}
        </template>
      </Column>

      <Column field="startYear" header="Joined" sortable>
        <template #body="{ data }">
          {{ data.startYear ?? '—' }}
        </template>
      </Column>

      <Column field="isActive" header="Status" sortable>
        <template #body="{ data }">
          <Tag
            :value="data.isActive ? 'Active' : 'Inactive'"
            :severity="data.isActive ? 'success' : 'secondary'"
          />
        </template>
      </Column>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-users" />
          <p>{{ playerNameSearch ? 'No players match this search.' : 'No current team assignments were found.' }}</p>
        </div>
      </template>
    </DataTable>
  </section>
</template>

<style scoped>
.team-roster-list { width: 100%; }
.roster-toolbar { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.roster-toolbar h2 { margin: 0; }
.roster-count { color: var(--text-color-secondary); font-size: 0.9rem; }
.toolbar-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.player-search { min-width: min(22rem, 100%); }
.player-search :deep(.p-inputtext) { width: 100%; }
.player-cell { display: flex; flex-direction: column; gap: 0.15rem; }
.player-cell small { color: var(--text-color-secondary); }
.error-message { margin-bottom: 1rem; padding: 0.75rem 1rem; border-radius: 6px; background: var(--red-50); color: var(--red-700); }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: var(--text-color-secondary); }
.empty-state i { font-size: 2.5rem; }
.empty-state p { margin: 0; }
@media (max-width: 720px) { .toolbar-actions, .player-search { width: 100%; } }
</style>