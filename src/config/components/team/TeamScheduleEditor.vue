<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTeamStore } from '@/stores/teamStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Message from 'primevue/message'

type RowEdit = { homeScore: number | null; awayScore: number | null }

const props = defineProps<{
  teamId?: number
}>()

const gameStore = useGameStore()
const teamStore = useTeamStore()

const resolvedTeamId = computed(() => props.teamId ?? teamStore.currentTeam?.id)
const currentYear = new Date().getFullYear()
const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map(y => ({ label: String(y), value: String(y) }))
const selectedYear = ref(String(currentYear))

const editMap = ref<Record<number, RowEdit>>({}) // local unsaved edits keyed by game id

const loading = computed(() => gameStore.loading)
const rows = ref(10)
const first = ref(0)

const shortName = (t?: any) => {
  if (!t?.name) return 'Unknown'
  const parts = String(t.name).trim().split(/\s+/)
  return parts[parts.length - 1]
}

const matchup = (g: any) => `${shortName(g.awayTeam)} @ ${shortName(g.homeTeam)}`

const canSave = (g: any) => {
  const e = editMap.value[g.id]
  if (!e) return false
  const hs = e.homeScore ?? g.homeScore ?? null
  const as = e.awayScore ?? g.awayScore ?? null
  // must be non-negative numbers (nullable allowed until set)
  return typeof hs === 'number' && hs >= 0 && typeof as === 'number' && as >= 0
}

const beginEditIfNeeded = (g: any) => {
  if (!editMap.value[g.id]) {
    editMap.value[g.id] = {
      homeScore: g.homeScore ?? 0,
      awayScore: g.awayScore ?? 0
    }
  }
}

const resetRow = (g: any) => {
  editMap.value[g.id] = {
    homeScore: g.homeScore ?? 0,
    awayScore: g.awayScore ?? 0
  }
}

const discardRow = (g: any) => {
  delete editMap.value[g.id]
}

const saveRow = async (g: any) => {
  const e = editMap.value[g.id]
  if (!e) return
  await gameStore.update(g.id, {
    homeScore: e.homeScore ?? 0,
    awayScore: e.awayScore ?? 0,
    // Optional: set completed once both scores entered
    gameStatus: 'completed'
  })
  // refresh defaults from saved
  discardRow(g)
}

const load = async () => {
  if (!resolvedTeamId.value) return
  console.log("components.team.YeamScheduleEditor::load - calling gameStore.fetchByTeamAndSeason");
  await gameStore.fetchByTeamAndSeason(resolvedTeamId.value, selectedYear.value)
  // clear any stale row edits
  editMap.value = {}
}

onMounted(load)
watch([resolvedTeamId, selectedYear], load)
</script>

<template>
  <div class="team-schedule-editor">
    <div class="toolbar">
      <div class="left">
        <h3>Schedule — {{ teamStore.currentTeam?.name ?? 'Team' }}</h3>
      </div>
      <div class="right">
        <Dropdown
          v-model="selectedYear"
          :options="yearOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Season"
          class="season-dropdown"
        />
      </div>
    </div>

    <Message v-if="gameStore.error" severity="error" :closable="false">{{ gameStore.error }}</Message>

    <DataTable
      :value="gameStore.games"
      :loading="loading"
      paginator
      :rows="rows"
      :first="first"
      :rowsPerPageOptions="[5,10,20]"
      responsiveLayout="scroll"
      class="p-datatable-sm fullwidth-table"
      dataKey="id"
    >
      
      <Column header="Week" sortable sortField="gameWeek" style="width: 7rem">
        <template #body="{ data }">
          <span v-if="data.preseason">Pre {{ data.preseason }}</span>
          <span v-else-if="data.gameWeek !== null && data.gameWeek !== undefined">Wk {{ data.gameWeek }}</span>
          <span v-else>-</span>
        </template>
      </Column>

      <Column field="gameDate" header="Date" sortable style="width: 10rem">
        <template #body="{ data }">
          <span v-if="data.gameDate">{{ new Date(data.gameDate).toLocaleDateString() }}</span>
          <span v-else>TBD</span>
        </template>
      </Column>

      <Column header="Matchup" :sortable="false">
        <template #body="{ data }">
          {{ matchup(data) }}
        </template>
      </Column>

      <!-- EDITABLE: Away Score -->
      <Column header="Away" sortField="awayScore" style="width: 8rem">
        <template #body="{ data }">
          <div class="score-cell">
            <InputNumber
              inputId="awayScore"
              :min="0"
              :useGrouping="false"
              @focus="beginEditIfNeeded(data)"
              v-model="(editMap[data.id] ?? (editMap[data.id] = { homeScore: data.homeScore ?? 0, awayScore: data.awayScore ?? 0 })).awayScore"
              :placeholder="String(data.awayScore ?? '')"
              inputClass="score-input"
            />
          </div>
        </template>
      </Column>

      <!-- EDITABLE: Home Score -->
      <Column header="Home" sortField="homeScore" style="width: 8rem">
        <template #body="{ data }">
          <div class="score-cell">
            <InputNumber
              inputId="homeScore"
              :min="0"
              :useGrouping="false"
              @focus="beginEditIfNeeded(data)"
              v-model="(editMap[data.id] ?? (editMap[data.id] = { homeScore: data.homeScore ?? 0, awayScore: data.awayScore ?? 0 })).homeScore"
              :placeholder="String(data.homeScore ?? '')"
              inputClass="score-input"
            />
          </div>
        </template>
      </Column>

      <Column field="gameStatus" header="Status" style="width: 9rem">
        <template #body="{ data }">
          <span>{{ data.gameStatus?.toUpperCase?.() ?? 'SCHEDULED' }}</span>
        </template>
      </Column>

      <Column header="Actions" style="width: 14rem">
        <template #body="{ data }">
          <div class="actions">
            <Button
              label="Save"
              icon="pi pi-save"
              size="small"
              class="p-button-success"
              :disabled="!canSave(data)"
              @click="saveRow(data)"
            />
            <Button
              label="Reset"
              icon="pi pi-refresh"
              size="small"
              class="p-button-secondary"
              @click="resetRow(data)"
            />
            <Button
              label="Discard"
              icon="pi pi-undo"
              size="small"
              class="p-button-text"
              @click="discardRow(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.team-schedule-editor {
  width: 100%;
  margin: 0;
  padding: 0;            /* remove side padding */
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;   /* visually tighter */
  margin-bottom: 0.5rem; /* less vertical padding */
}

.right { display: flex; gap: 0.5rem; }

/* Make the table consume full horizontal space */
.fullwidth-table {
  width: 100%;
}

/* Keep dropdown compact and aligned */
.season-dropdown {
  min-width: 10rem;
}

/* Standard-size score input (no spinner buttons), fixed width */
.score-cell :deep(.p-inputnumber) {
  width: auto; /* let the input define width */
}

.score-cell :deep(.p-inputnumber-input) {
  width: 4.25rem;        /* ~68px; tweak to taste */
  padding: 0.25rem 0.5rem;
  text-align: center;
}

/* action buttons row */
.actions { display: flex; gap: 0.5rem; }
</style>
