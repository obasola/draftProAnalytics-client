<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import type {
  DraftPickDto,
  DraftPickStatus,
  SelectOption,
  UpdateDraftPickRequestDto,
} from '../types/draftDayScorecard.types'

const props = defineProps<{
  modelValue: boolean
  pick: DraftPickDto | null
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [pickId: number, request: UpdateDraftPickRequestDto]
}>()

const form = reactive<UpdateDraftPickRequestDto>({
  round: undefined,
  pickNumber: undefined,
  overallPick: null,
  currentTeamId: undefined,
  originalTeamId: null,
  prospectId: null,
  playerId: null,
  used: false,
  status: 'SCHEDULED',
  isCompensatory: false,
  acquiredViaTrade: false,
  selectedAt: null,
  position: null,
  college: null,
  pickGrade: null,
  valueGrade: null,
  needsFitGrade: null,
  analystNotes: null,
  tradeNotes: null,
})

const statusOptions: SelectOption<DraftPickStatus>[] = [
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'On Clock', value: 'ON_CLOCK' },
  { label: 'Picked', value: 'PICKED' },
  { label: 'Traded', value: 'TRADED' },
  { label: 'Forfeited', value: 'FORFEITED' },
  { label: 'Skipped', value: 'SKIPPED' },
]

const gradeOptions: SelectOption<string | null>[] = [
  { label: 'Pending', value: null },
  { label: 'A+', value: 'A+' },
  { label: 'A', value: 'A' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B', value: 'B' },
  { label: 'B-', value: 'B-' },
  { label: 'C+', value: 'C+' },
  { label: 'C', value: 'C' },
  { label: 'C-', value: 'C-' },
  { label: 'D+', value: 'D+' },
  { label: 'D', value: 'D' },
  { label: 'D-', value: 'D-' },
  { label: 'F', value: 'F' },
]

const dialogTitle = computed(() => {
  if (!props.pick) return 'Edit Draft Pick'
  const slot = props.pick.overallPick ?? props.pick.pickNumber
  return `Edit Round ${props.pick.round}, Pick ${slot}`
})

watch(
  () => props.pick,
  (pick) => {
    if (!pick) return

    form.round = pick.round
    form.pickNumber = pick.pickNumber
    form.overallPick = pick.overallPick
    form.currentTeamId = pick.currentTeamId
    form.originalTeamId = pick.originalTeamId
    form.prospectId = pick.prospectId
    form.playerId = pick.playerId
    form.used = pick.used
    form.status = pick.status
    form.isCompensatory = pick.isCompensatory
    form.acquiredViaTrade = pick.acquiredViaTrade
    form.selectedAt = pick.selectedAt
    form.position = pick.position
    form.college = pick.college
    form.pickGrade = pick.pickGrade
    form.valueGrade = pick.valueGrade
    form.needsFitGrade = pick.needsFitGrade
    form.analystNotes = pick.analystNotes
    form.tradeNotes = pick.tradeNotes
  },
  { immediate: true },
)

function closeDialog(): void {
  emit('update:modelValue', false)
}

function savePick(): void {
  if (!props.pick) return

  emit('save', props.pick.id, {
    round: form.round,
    pickNumber: form.pickNumber,
    overallPick: form.overallPick,
    currentTeamId: form.currentTeamId,
    originalTeamId: form.originalTeamId,
    prospectId: form.prospectId,
    playerId: form.playerId,
    used: form.used,
    status: form.status,
    isCompensatory: form.isCompensatory,
    acquiredViaTrade: form.acquiredViaTrade,
    selectedAt: form.selectedAt,
    position: form.position,
    college: form.college,
    pickGrade: form.pickGrade,
    valueGrade: form.valueGrade,
    needsFitGrade: form.needsFitGrade,
    analystNotes: form.analystNotes,
    tradeNotes: form.tradeNotes,
  })
}
</script>

<template>
  <Dialog
    :visible="props.modelValue"
    :header="dialogTitle"
    modal
    class="draft-pick-dialog"
    @update:visible="emit('update:modelValue', $event)"
  >
    <div v-if="props.pick" class="form-grid">
      <label>
        Round
        <InputNumber v-model="form.round" :min="1" :max="7" />
      </label>

      <label>
        Pick Number
        <InputNumber v-model="form.pickNumber" :min="1" />
      </label>

      <label>
        Overall Pick
        <InputNumber v-model="form.overallPick" :min="1" />
      </label>

      <label>
        Current Team ID
        <InputNumber v-model="form.currentTeamId" :min="1" />
      </label>

      <label>
        Original Team ID
        <InputNumber v-model="form.originalTeamId" :min="1" />
      </label>

      <label>
        Status
        <Dropdown
          v-model="form.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
        />
      </label>

      <label>
        Prospect ID
        <InputNumber v-model="form.prospectId" :min="1" />
      </label>

      <label>
        Player ID
        <InputNumber v-model="form.playerId" :min="1" />
      </label>

      <label>
        Position
        <InputText v-model="form.position" />
      </label>

      <label>
        College
        <InputText v-model="form.college" />
      </label>

      <label>
        Pick Grade
        <Dropdown
          v-model="form.pickGrade"
          :options="gradeOptions"
          option-label="label"
          option-value="value"
        />
      </label>

      <label>
        Value Grade
        <Dropdown
          v-model="form.valueGrade"
          :options="gradeOptions"
          option-label="label"
          option-value="value"
        />
      </label>

      <label>
        Needs Fit Grade
        <Dropdown
          v-model="form.needsFitGrade"
          :options="gradeOptions"
          option-label="label"
          option-value="value"
        />
      </label>

      <div class="checkbox-row">
        <Checkbox v-model="form.used" :binary="true" input-id="used" />
        <label for="used">Pick used</label>
      </div>

      <div class="checkbox-row">
        <Checkbox v-model="form.acquiredViaTrade" :binary="true" input-id="trade" />
        <label for="trade">Acquired via trade</label>
      </div>

      <div class="checkbox-row">
        <Checkbox v-model="form.isCompensatory" :binary="true" input-id="comp" />
        <label for="comp">Compensatory pick</label>
      </div>

      <label class="full-width">
        Analyst Notes
        <Textarea v-model="form.analystNotes" rows="4" auto-resize />
      </label>

      <label class="full-width">
        Trade Notes
        <Textarea v-model="form.tradeNotes" rows="3" auto-resize />
      </label>
    </div>

    <template #footer>
      <Button label="Cancel" class="p-button-text" @click="closeDialog" />
      <Button label="Save Pick" icon="pi pi-save" :loading="props.saving" @click="savePick" />
    </template>
  </Dialog>
</template>

<style scoped>
.draft-pick-dialog {
  width: min(58rem, 94vw);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-row label {
  display: inline;
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
