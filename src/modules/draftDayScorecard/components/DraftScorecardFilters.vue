<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import type {
  DraftPickDto,
  DraftPickStatus,
  IDraftScorecardFilters,
  SelectOption,
} from '../types/draftDayScorecard.types'

const props = defineProps<{
  modelValue: IDraftScorecardFilters
  picks: DraftPickDto[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: IDraftScorecardFilters]
  clear: []
}>()

const roundOptions: SelectOption<number | null>[] = [
  { label: 'All Rounds', value: null },
  { label: 'Round 1', value: 1 },
  { label: 'Round 2', value: 2 },
  { label: 'Round 3', value: 3 },
  { label: 'Round 4', value: 4 },
  { label: 'Round 5', value: 5 },
  { label: 'Round 6', value: 6 },
  { label: 'Round 7', value: 7 },
]

const statusOptions: SelectOption<DraftPickStatus | null>[] = [
  { label: 'All Statuses', value: null },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'On Clock', value: 'ON_CLOCK' },
  { label: 'Picked', value: 'PICKED' },
  { label: 'Traded', value: 'TRADED' },
  { label: 'Forfeited', value: 'FORFEITED' },
  { label: 'Skipped', value: 'SKIPPED' },
]

const teamOptions = computed<SelectOption<number | null>[]>(() => {
  const teams = new Map<number, string>()

  props.picks.forEach((pick) => {
    teams.set(
      pick.currentTeamId,
      pick.currentTeamName ?? pick.currentTeamAbbreviation ?? `Team ${pick.currentTeamId}`,
    )
  })

  const options = Array.from(teams.entries())
    .map(([value, label]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return [{ label: 'All Teams', value: null }, ...options]
})

const positionOptions = computed<SelectOption<string | null>[]>(() => {
  const positions = new Set<string>()

  props.picks.forEach((pick) => {
    if (pick.position) positions.add(pick.position)
  })

  const options = Array.from(positions)
    .sort()
    .map((position) => ({ label: position, value: position }))

  return [{ label: 'All Positions', value: null }, ...options]
})

const gradeOptions = computed<SelectOption<string | null>[]>(() => {
  const grades = new Set<string>()

  props.picks.forEach((pick) => {
    if (pick.pickGrade) grades.add(pick.pickGrade)
  })

  const options = Array.from(grades)
    .sort()
    .map((grade) => ({ label: grade, value: grade }))

  return [{ label: 'All Grades', value: null }, ...options]
})

function updateFilter<TKey extends keyof IDraftScorecardFilters>(
  key: TKey,
  value: IDraftScorecardFilters[TKey],
): void {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>

<template>
  <div class="filters">
    <span class="p-input-icon-left search-field">
      <i class="pi pi-search" />
      <InputText
        :model-value="props.modelValue.searchText"
        placeholder="Search player, team, school..."
        @update:model-value="updateFilter('searchText', String($event))"
      />
    </span>

    <Dropdown
      :model-value="props.modelValue.teamId"
      :options="teamOptions"
      option-label="label"
      option-value="value"
      placeholder="Team"
      @update:model-value="updateFilter('teamId', $event as number | null)"
    />

    <Dropdown
      :model-value="props.modelValue.round"
      :options="roundOptions"
      option-label="label"
      option-value="value"
      placeholder="Round"
      @update:model-value="updateFilter('round', $event as number | null)"
    />

    <Dropdown
      :model-value="props.modelValue.position"
      :options="positionOptions"
      option-label="label"
      option-value="value"
      placeholder="Position"
      @update:model-value="updateFilter('position', $event as string | null)"
    />

    <Dropdown
      :model-value="props.modelValue.status"
      :options="statusOptions"
      option-label="label"
      option-value="value"
      placeholder="Status"
      @update:model-value="updateFilter('status', $event as DraftPickStatus | null)"
    />

    <Dropdown
      :model-value="props.modelValue.grade"
      :options="gradeOptions"
      option-label="label"
      option-value="value"
      placeholder="Grade"
      @update:model-value="updateFilter('grade', $event as string | null)"
    />

    <Button label="Clear" class="p-button-text" icon="pi pi-filter-slash" @click="emit('clear')" />
  </div>
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: minmax(16rem, 2fr) repeat(5, minmax(9rem, 1fr)) auto;
  gap: 0.75rem;
  align-items: center;
}

.search-field,
.search-field :deep(input) {
  width: 100%;
}

@media (max-width: 1100px) {
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
