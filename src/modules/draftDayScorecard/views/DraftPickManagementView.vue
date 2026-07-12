<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ConfirmDialog from 'primevue/confirmdialog'
import Message from 'primevue/message'
import { useConfirm } from 'primevue/useconfirm'
import DraftEventSelector from '../components/DraftEventSelector.vue'
import DraftPickEditorDialog from '../components/DraftPickEditorDialog.vue'
import DraftPickManagementToolbar from '../components/DraftPickManagementToolbar.vue'
import DraftPickTable from '../components/DraftPickTable.vue'
import DraftScorecardFilters from '../components/DraftScorecardFilters.vue'
import { useDraftDayScorecardStore } from '../stores/draftDayScorecardStore'
import type {
  CompleteDraftPickRequestDto,
  DraftEventDto,
  DraftPickDto,
  IDraftScorecardFilters,
  UpdateDraftPickRequestDto,
} from '../types/draftDayScorecard.types'

const route = useRoute()
const confirm = useConfirm()
const store = useDraftDayScorecardStore()

const editorVisible = ref(false)
const selectedPick = ref<DraftPickDto | null>(null)

const selectedEventModel = computed<DraftEventDto | null>({
  get: () => store.selectedEvent,
  set: async (event) => {
    if (!event) return
    await store.loadScorecard(event.id)
  },
})

onMounted(async () => {
  await store.loadEvents()

  const routeDraftYear = Number(route.params.draftYear)
  if (Number.isFinite(routeDraftYear)) {
    await store.loadScorecardByDraftYear(routeDraftYear)
    return
  }

  const latestEvent = [...store.events].sort((a, b) => b.draftYear - a.draftYear)[0]
  if (latestEvent) {
    await store.loadScorecard(latestEvent.id)
  }
})

function updateFilters(filters: IDraftScorecardFilters): void {
  store.setFilters(filters)
}

function openEditor(pick: DraftPickDto): void {
  selectedPick.value = pick
  editorVisible.value = true
}

async function savePick(pickId: number, request: UpdateDraftPickRequestDto): Promise<void> {
  await store.saveDraftPick(pickId, request)
  editorVisible.value = false
}

async function sendOnClock(pick: DraftPickDto): Promise<void> {
  await store.sendPickOnClock(pick.id)
}

async function completePick(pick: DraftPickDto): Promise<void> {
  const request: CompleteDraftPickRequestDto = {
    prospectId: pick.prospectId,
    playerId: pick.playerId,
    position: pick.position,
    college: pick.college,
    pickGrade: pick.pickGrade,
    valueGrade: pick.valueGrade,
    needsFitGrade: pick.needsFitGrade,
    analystNotes: pick.analystNotes,
  }

  await store.completePick(pick.id, request)
}

function confirmSeedPicks(): void {
  if (!store.selectedEvent) return

  confirm.require({
    message: 'Seed draft pick slots for this event? Existing backend rules determine whether rows are inserted, skipped, or updated.',
    header: 'Seed Draft Picks',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      if (!store.selectedEvent) return
      await store.seedPicks(store.selectedEvent.id, { mode: 'MANUAL_STANDARD_7_ROUNDS' })
    },
  })
}

async function refreshScorecard(): Promise<void> {
  if (!store.selectedEvent) return
  await store.loadScorecard(store.selectedEvent.id)
}
</script>

<template>
  <main class="draft-management-page">
    <ConfirmDialog />

    <header class="page-header">
      <div>
        <p class="eyebrow">DraftProAnalytics</p>
        <h1>Draft Pick Management</h1>
        <p>Manage draft-night pick status, grades, team ownership, and pick notes.</p>
      </div>

      <DraftEventSelector
        v-model="selectedEventModel"
        :events="store.events"
        :loading="store.loading"
      />
    </header>

    <Message v-if="store.errorMessage" severity="error" :closable="false">
      {{ store.errorMessage }}
    </Message>

    <DraftPickManagementToolbar
      :selected-event="store.selectedEvent"
      :saving="store.saving"
      @seed="confirmSeedPicks"
      @refresh="refreshScorecard"
    />

    <DraftScorecardFilters
      :model-value="store.filters"
      :picks="store.picks"
      @update:model-value="updateFilters"
      @clear="store.clearFilters"
    />

    <DraftPickTable
      :picks="store.filteredPicks"
      :loading="store.loading"
      @edit="openEditor"
      @on-clock="sendOnClock"
      @complete="completePick"
    />

    <DraftPickEditorDialog
      v-model="editorVisible"
      :pick="selectedPick"
      :saving="store.saving"
      @save="savePick"
    />
  </main>
</template>

<style scoped>
.draft-management-page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 1rem;
  background: var(--surface-card);
}

.eyebrow {
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  color: var(--text-color-secondary);
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

h1,
p {
  margin-top: 0;
}

.page-header p:last-child {
  margin-bottom: 0;
  color: var(--text-color-secondary);
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }
}
</style>
