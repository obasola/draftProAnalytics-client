<script setup lang="ts">
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import type { DraftTeamReportCardDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  reportCard: DraftTeamReportCardDto
}>()

interface ScoreRow {
  label: string
  value: number | null
}

const rows: ScoreRow[] = [
  { label: 'Overall', value: props.reportCard.overallScore },
  { label: 'Talent Acquisition', value: props.reportCard.talentScore },
  { label: 'Value vs Slot', value: props.reportCard.valueScore },
  { label: 'Needs Fit', value: props.reportCard.needsFitScore },
  { label: 'Positional Premium', value: props.reportCard.positionalPremiumScore },
  { label: 'Board Discipline', value: props.reportCard.boardDisciplineScore },
]
</script>

<template>
  <Card>
    <template #title>Grade Breakdown</template>
    <template #content>
      <div class="score-list">
        <div v-for="row in rows" :key="row.label" class="score-row">
          <div class="score-row-header">
            <span>{{ row.label }}</span>
            <strong>{{ row.value === null ? 'Pending' : `${row.value}/100` }}</strong>
          </div>
          <ProgressBar :value="row.value ?? 0" :show-value="false" />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.score-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-row-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
}
</style>
