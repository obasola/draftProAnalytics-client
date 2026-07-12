<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import DraftGradeBreakdownPanel from '../components/DraftGradeBreakdownPanel.vue'
import DraftNeedsAddressedPanel from '../components/DraftNeedsAddressedPanel.vue'
import DraftPickEditorDialog from '../components/DraftPickEditorDialog.vue'
import DraftPositionHeatmap from '../components/DraftPositionHeatmap.vue'
import DraftRoundPickTabs from '../components/DraftRoundPickTabs.vue'
import DraftTeamSummaryPanel from '../components/DraftTeamSummaryPanel.vue'
import { useDraftDayScorecardStore } from '../stores/draftDayScorecardStore'
import type {
  CompleteDraftPickRequestDto,
  DraftPickDto,
  UpdateDraftPickRequestDto,
} from '../types/draftDayScorecard.types'

const route = useRoute()
const router = useRouter()
const store = useDraftDayScorecardStore()

const editorVisible = ref(false)
const selectedPick = ref<DraftPickDto | null>(null)

const draftYear = computed(() => Number(route.params.draftYear))
const teamId = computed(() => Number(route.params.teamId))

onMounted(async () => {
  await store.loadScorecardByDraftYear(draftYear.value)

  if (store.selectedEvent) {
    await store.loadTeamReportCard(store.selectedEvent.id, teamId.value)
  }
})

function returnToReportCards(): void {
  router.push({
    name: 'draft-day-scorecard-year',
    params: {
      draftYear: String(draftYear.value),
    },
  })
}

function openEditor(pick: DraftPickDto): void {
  selectedPick.value = pick
  editorVisible.value = true
}

async function savePick(pickId: number, request: UpdateDraftPickRequestDto): Promise<void> {
  await store.saveDraftPick(pickId, request)

  if (store.selectedEvent) {
    await store.loadTeamReportCard(store.selectedEvent.id, teamId.value)
  }

  editorVisible.value = false
}

async function sendOnClock(pick: DraftPickDto): Promise<void> {
  await store.sendPickOnClock(pick.id)

  if (store.selectedEvent) {
    await store.loadTeamReportCard(store.selectedEvent.id, teamId.value)
  }
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

  if (store.selectedEvent) {
    await store.loadTeamReportCard(store.selectedEvent.id, teamId.value)
  }
}
</script>

<template>
  <main class="team-report-card-page">
    <div class="page-actions">
      <Button
        label="Back to Teams"
        icon="pi pi-arrow-left"
        class="p-button-text"
        @click="returnToReportCards"
      />
    </div>

    <Message v-if="store.errorMessage" severity="error" :closable="false">
      {{ store.errorMessage }}
    </Message>

    <ProgressSpinner v-if="store.loading && !store.selectedTeamReportCard" />

    <template v-if="store.selectedTeamReportCard">
      <DraftTeamSummaryPanel :report-card="store.selectedTeamReportCard" />

      <section class="analytics-grid">
        <DraftGradeBreakdownPanel :report-card="store.selectedTeamReportCard" />
        <DraftPositionHeatmap :position-counts="store.selectedTeamReportCard.positionCounts" />
        <DraftNeedsAddressedPanel
          :needs-addressed="store.selectedTeamReportCard.needsAddressed"
          :needs-unaddressed="store.selectedTeamReportCard.needsUnaddressed"
        />
      </section>

      <section class="round-tabs-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">By-Round Analysis</p>
            <h2>Pick Cards</h2>
          </div>
        </div>

        <DraftRoundPickTabs
          :picks="store.selectedTeamReportCard.picks"
          editable
          @edit="openEditor"
          @on-clock="sendOnClock"
          @complete="completePick"
        />
      </section>
    </template>

    <DraftPickEditorDialog
      v-model="editorVisible"
      :pick="selectedPick"
      :saving="store.saving"
      @save="savePick"
    />
  </main>
</template>

<style scoped>
.team-report-card-page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.page-actions {
  display: flex;
  justify-content: flex-start;
}

.analytics-grid {
  display: grid;
  grid-template-columns: minmax(16rem, 1fr) minmax(16rem, 1fr) minmax(16rem, 1fr);
  gap: 1rem;
}

.round-tabs-panel {
  padding: 1rem;
  border-radius: 1rem;
  background: var(--surface-card);
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  color: var(--text-color-secondary);
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

h2 {
  margin: 0;
}

@media (max-width: 1100px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
