<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DraftPickStatusTag from './DraftPickStatusTag.vue'
import type { DraftPickDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  picks: DraftPickDto[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [pick: DraftPickDto]
  onClock: [pick: DraftPickDto]
  complete: [pick: DraftPickDto]
}>()

function playerName(pick: DraftPickDto): string {
  if (pick.playerName) return pick.playerName

  const firstName = pick.playerFirstName ?? ''
  const lastName = pick.playerLastName ?? ''
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName.length > 0 ? fullName : 'Pending'
}
</script>

<template>
  <DataTable
    :value="props.picks"
    :loading="props.loading"
    data-key="id"
    paginator
    :rows="25"
    :rows-per-page-options="[25, 50, 100]"
    responsive-layout="scroll"
    striped-rows
  >
    <Column field="overallPick" header="Overall" sortable>
      <template #body="{ data }">
        {{ data.overallPick ?? data.pickNumber }}
      </template>
    </Column>

    <Column field="round" header="Round" sortable />
    <Column field="pickNumber" header="Pick" sortable />

    <Column header="Team" sortable>
      <template #body="{ data }">
        {{ data.currentTeamAbbreviation ?? data.currentTeamName ?? data.currentTeamId }}
      </template>
    </Column>

    <Column header="Player">
      <template #body="{ data }">
        {{ playerName(data as DraftPickDto) }}
      </template>
    </Column>

    <Column field="position" header="Pos" sortable />
    <Column field="college" header="College" sortable />

    <Column header="Status">
      <template #body="{ data }">
        <DraftPickStatusTag :status="(data as DraftPickDto).status" />
      </template>
    </Column>

    <Column field="pickGrade" header="Grade" sortable />
    <Column field="valueGrade" header="Value" sortable />
    <Column field="needsFitGrade" header="Need" sortable />

    <Column header="Actions">
      <template #body="{ data }">
        <div class="row-actions">
          <Button
            icon="pi pi-clock"
            class="p-button-rounded p-button-warning p-button-text"
            title="Mark on clock"
            @click="emit('onClock', data as DraftPickDto)"
          />
          <Button
            icon="pi pi-check"
            class="p-button-rounded p-button-success p-button-text"
            title="Complete pick"
            @click="emit('complete', data as DraftPickDto)"
          />
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-text"
            title="Edit pick"
            @click="emit('edit', data as DraftPickDto)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.row-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
