<script setup lang="ts">
import Card from 'primevue/card'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import type { DraftTeamReportCardDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  reportCard: DraftTeamReportCardDto
}>()

function gradeText(): string {
  return props.reportCard.overallGrade ?? 'Pending'
}

function scoreText(): string {
  return props.reportCard.overallScore === null ? 'Score pending' : `${props.reportCard.overallScore}/100`
}

function initials(): string {
  return props.reportCard.teamAbbreviation || props.reportCard.teamName.slice(0, 2).toUpperCase()
}
</script>

<template>
  <Card class="summary-panel">
    <template #content>
      <section class="summary-content">
        <div class="team-identity">
          <Avatar
            v-if="props.reportCard.teamLogoUrl"
            :image="props.reportCard.teamLogoUrl"
            size="xlarge"
            shape="circle"
          />
          <Avatar v-else :label="initials()" size="xlarge" shape="circle" />

          <div>
            <p class="eyebrow">{{ props.reportCard.draftYear }} NFL Draft Report Card</p>
            <h1>{{ props.reportCard.teamName }}</h1>
            <p class="team-abbrev">{{ props.reportCard.teamAbbreviation }}</p>
          </div>
        </div>

        <div class="grade-block">
          <span class="grade-label">Overall Grade</span>
          <strong class="grade-value">{{ gradeText() }}</strong>
          <Tag :value="scoreText()" severity="info" />
        </div>

        <div class="summary-copy">
          <h2>Executive Summary</h2>
          <p>
            {{
              props.reportCard.summary ??
              'Draft analysis has not been entered yet. Picks, grades, and value context will appear as the board is updated.'
            }}
          </p>

          <div class="summary-notes">
            <div>
              <strong>Best Pick</strong>
              <p>{{ props.reportCard.bestPickSummary ?? 'Best-pick summary pending.' }}</p>
            </div>
            <div>
              <strong>Questionable Move</strong>
              <p>{{ props.reportCard.questionablePickSummary ?? 'Questionable-move summary pending.' }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </Card>
</template>

<style scoped>
.summary-panel {
  border-radius: 1rem;
}

.summary-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.5rem;
}

.team-identity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--text-color-secondary);
}

h1 {
  margin: 0;
  font-size: 2rem;
}

.team-abbrev {
  margin: 0.25rem 0 0;
  color: var(--text-color-secondary);
}

.grade-block {
  display: flex;
  min-width: 9rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1rem;
  border-radius: 1rem;
  background: var(--surface-100);
}

.grade-label {
  color: var(--text-color-secondary);
  font-size: 0.8rem;
}

.grade-value {
  font-size: 3rem;
  line-height: 1;
}

.summary-copy {
  grid-column: 1 / -1;
}

.summary-copy h2 {
  margin: 0 0 0.5rem;
}

.summary-copy p {
  margin: 0;
  line-height: 1.55;
}

.summary-notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.summary-notes div {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--surface-50);
}

.summary-notes strong {
  display: block;
  margin-bottom: 0.35rem;
}

@media (max-width: 720px) {
  .summary-content {
    grid-template-columns: 1fr;
  }

  .grade-block {
    align-items: flex-start;
  }

  .summary-notes {
    grid-template-columns: 1fr;
  }
}
</style>
