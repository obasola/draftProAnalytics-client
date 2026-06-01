<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import DraftEventSelector from '../components/DraftEventSelector.vue'
import DraftScorecardFilters from '../components/DraftScorecardFilters.vue'
import { useDraftDayScorecardStore } from '../stores/draftDayScorecardStore'
import type { DraftEventDto, IDraftScorecardFilters, DraftTeamSummary } from '../types/draftDayScorecard.types'

const store = useDraftDayScorecardStore()
const router = useRouter()

const selectedEventModel = computed<DraftEventDto | null>({
  get: () => store.selectedEvent,
  set: async (event) => {
    if (!event) return
    await store.loadScorecard(event.id)
  },
})

onMounted(async () => {
  await store.loadEvents()

  if (store.selectedEvent) return

  const latestEvent = [...store.events].sort((a, b) => b.draftYear - a.draftYear)[0]
  if (latestEvent) {
    await store.loadScorecard(latestEvent.id)
  }
})

function viewTeamReportCard(summary: DraftTeamSummary): void {
  router.push({
    name: 'draft-day-scorecard-team',
    params: {
      draftYear: String(summary.draftYear),
      teamId: String(summary.teamId),
    },
  })
}

function updateFilters(filters: IDraftScorecardFilters): void {
  store.setFilters(filters)
}
</script>

<template>
  <main class="draft-report-cards-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">DraftProAnalytics</p>
        <h1>Draft Day Report Cards</h1>
        <p>
          Grade each team’s draft class by talent, value, needs fit, positional premium, and
          board discipline.
        </p>
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

    <ProgressSpinner v-if="store.loading && !store.scorecard" />

    <section v-if="store.scorecard" class="content-stack">
      <DraftScorecardFilters
        :model-value="store.filters"
        :picks="store.picks"
        @update:model-value="updateFilters"
        @clear="store.clearFilters"
      />

      <div class="scorecard-meta">
        <Tag :value="store.scorecard.draftEvent.name" severity="info" />
        <Tag :value="`Teams: ${store.teamSummaries.length}`" />
        <Tag :value="`Picks: ${store.picks.length}`" />
      </div>

      <div class="team-grid">
        <Card
          v-for="summary in store.teamSummaries"
          :key="summary.teamId"
          class="team-card"
        >
          <template #content>
            <article>
              <div class="team-card-header">
                <div>
                  <p class="team-abbrev">{{ summary.teamAbbreviation }}</p>
                  <h2>{{ summary.teamName }}</h2>
                </div>
                <div class="team-grade">
                  <span>Grade</span>
                  <strong>{{ summary.overallGrade ?? 'Pending' }}</strong>
                </div>
              </div>

              <div class="team-score-row">
                <span>Overall Score</span>
                <strong>
                  {{ summary.overallScore === null ? 'Pending' : `${summary.overallScore}/100` }}
                </strong>
              </div>

              <div class="team-score-row">
                <span>Picks Made</span>
                <strong>{{ summary.picksMade }} / {{ summary.totalPicks }}</strong>
              </div>

              <div class="position-chip-row">
                <Tag
                  v-for="positionCount in summary.positionCounts.slice(0, 5)"
                  :key="positionCount.position"
                  :value="`${positionCount.position} x${positionCount.count}`"
                  severity="info"
                />
              </div>

              <Button
                label="View Report Card"
                icon="pi pi-arrow-right"
                class="p-button-sm"
                @click="viewTeamReportCard(summary)"
              />
            </article>
          </template>
        </Card>
      </div>
    </section>
  </main>
</template>

<style scoped>
.draft-report-cards-page {
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
h2,
p {
  margin-top: 0;
}

.page-header p:last-child {
  margin-bottom: 0;
  color: var(--text-color-secondary);
}

.content-stack {
  display: grid;
  gap: 1rem;
}

.scorecard-meta,
.position-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
  gap: 1rem;
}

.team-card {
  border-radius: 1rem;
}

.team-card article {
  display: grid;
  gap: 1rem;
}

.team-card-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.team-abbrev {
  margin-bottom: 0.25rem;
  color: var(--text-color-secondary);
  font-weight: 700;
}

.team-card h2 {
  margin-bottom: 0;
}

.team-grade {
  min-width: 5rem;
  text-align: center;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--surface-100);
}

.team-grade span,
.team-score-row span {
  display: block;
  color: var(--text-color-secondary);
  font-size: 0.8rem;
}

.team-grade strong {
  display: block;
  font-size: 1.75rem;
}

.team-score-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }
}
</style>
