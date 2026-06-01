<script setup lang="ts">
import { computed, ref } from 'vue'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import DraftPickStatusTag from './DraftPickStatusTag.vue'
import DraftRelativeValueChart from './DraftRelativeValueChart.vue'
import type { DraftPickDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  pick: DraftPickDto
  editable?: boolean
}>()

const emit = defineEmits<{
  edit: [pick: DraftPickDto]
  onClock: [pick: DraftPickDto]
  complete: [pick: DraftPickDto]
}>()

const expanded = ref(false)

const playerDisplayName = computed(() => {
  if (props.pick.playerName) return props.pick.playerName

  const firstName = props.pick.playerFirstName ?? ''
  const lastName = props.pick.playerLastName ?? ''
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName.length > 0 ? fullName : 'Selection Pending'
})

const pickLabel = computed(() => {
  const overall = props.pick.overallPick ? ` · Overall ${props.pick.overallPick}` : ''
  return `Round ${props.pick.round} · Pick ${props.pick.pickNumber}${overall}`
})

const initials = computed(() => {
  const words = playerDisplayName.value.split(' ').filter(Boolean)
  if (words.length === 0 || playerDisplayName.value === 'Selection Pending') {
    return props.pick.position ?? 'NFL'
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
})

const quickAnalysis = computed(() => {
  return props.pick.quickAnalysis ?? props.pick.analystNotes ?? 'Quick analysis has not been entered yet.'
})
</script>

<template>
  <Card class="pick-card">
    <template #content>
      <article>
        <header class="pick-header">
          <div class="player-block">
            <Avatar
              v-if="props.pick.headshotUrl"
              :image="props.pick.headshotUrl"
              size="large"
              shape="circle"
            />
            <Avatar v-else :label="initials" size="large" shape="circle" />

            <div>
              <p class="pick-label">{{ pickLabel }}</p>
              <h3>{{ playerDisplayName }}</h3>
              <p class="player-meta">
                <span>{{ props.pick.position ?? 'Position TBD' }}</span>
                <span>·</span>
                <span>{{ props.pick.college ?? 'College TBD' }}</span>
              </p>
            </div>
          </div>

          <div class="status-block">
            <DraftPickStatusTag :status="props.pick.status" />
            <Tag :value="props.pick.pickGrade ?? 'Grade Pending'" severity="info" />
          </div>
        </header>

        <div class="grade-row">
          <div>
            <span>Pick Grade</span>
            <strong>{{ props.pick.pickGrade ?? '—' }}</strong>
          </div>
          <div>
            <span>Value</span>
            <strong>{{ props.pick.valueGrade ?? '—' }}</strong>
          </div>
          <div>
            <span>Needs Fit</span>
            <strong>{{ props.pick.needsFitGrade ?? '—' }}</strong>
          </div>
        </div>

        <p class="analysis-copy">{{ quickAnalysis }}</p>

        <DraftRelativeValueChart :pick="props.pick" />

        <div v-if="props.pick.acquiredViaTrade || props.pick.isCompensatory" class="pick-flags">
          <Tag v-if="props.pick.acquiredViaTrade" value="Trade acquired" severity="warning" />
          <Tag v-if="props.pick.isCompensatory" value="Compensatory" severity="info" />
        </div>

        <div v-if="expanded" class="expanded-notes">
          <div>
            <strong>Scout Notes</strong>
            <p>{{ props.pick.scoutNotes ?? props.pick.analystNotes ?? 'Scout notes pending.' }}</p>
          </div>
          <div>
            <strong>Trade Notes</strong>
            <p>{{ props.pick.tradeNotes ?? 'No trade notes entered.' }}</p>
          </div>
        </div>

        <footer class="pick-actions">
          <Button
            :label="expanded ? 'Hide Details' : 'Show Details'"
            class="p-button-text p-button-sm"
            icon="pi pi-angle-down"
            @click="expanded = !expanded"
          />

          <div v-if="props.editable" class="edit-actions">
            <Button
              label="On Clock"
              class="p-button-sm p-button-warning"
              icon="pi pi-clock"
              @click="emit('onClock', props.pick)"
            />
            <Button
              label="Complete"
              class="p-button-sm p-button-success"
              icon="pi pi-check"
              @click="emit('complete', props.pick)"
            />
            <Button
              label="Edit"
              class="p-button-sm"
              icon="pi pi-pencil"
              @click="emit('edit', props.pick)"
            />
          </div>
        </footer>
      </article>
    </template>
  </Card>
</template>

<style scoped>
.pick-card {
  border-radius: 1rem;
}

.pick-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.player-block {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.pick-label {
  margin: 0 0 0.25rem;
  color: var(--text-color-secondary);
  font-size: 0.85rem;
}

h3 {
  margin: 0;
  font-size: 1.25rem;
}

.player-meta {
  display: flex;
  gap: 0.35rem;
  margin: 0.25rem 0 0;
  color: var(--text-color-secondary);
}

.status-block {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.grade-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}

.grade-row div {
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--surface-50);
}

.grade-row span {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-color-secondary);
  font-size: 0.8rem;
}

.grade-row strong {
  font-size: 1.2rem;
}

.analysis-copy {
  line-height: 1.5;
}

.pick-flags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.expanded-notes {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.expanded-notes div {
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--surface-50);
}

.expanded-notes p {
  margin-bottom: 0;
}

.pick-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-top: 1rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .pick-header,
  .pick-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .status-block {
    justify-content: flex-start;
  }

  .grade-row {
    grid-template-columns: 1fr;
  }
}
</style>
