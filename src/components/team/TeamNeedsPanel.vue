<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import { api } from '@/services/api'

interface Props {
  teamId: number
}

interface TeamNeedRow {
  id: number
  teamId: number
  position: string
  priority: number
  draftYear?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

interface PositionOption {
  label: string
  value: string
}

const props = defineProps<Props>()

const positionOptions: readonly PositionOption[] = [
  { label: 'Center', value: 'C' },
  { label: 'Cornerback', value: 'CB' },
  { label: 'Defensive Tackle', value: 'DT' },
  { label: 'Edge Rusher', value: 'EDGE' },
  { label: 'Fullback', value: 'FB' },
  { label: 'Kicker', value: 'K' },
  { label: 'Linebacker', value: 'LB' },
  { label: 'Long Snapper', value: 'LS' },
  { label: 'Offensive Guard', value: 'OG' },
  { label: 'Offensive Tackle', value: 'OT' },
  { label: 'Punter', value: 'P' },
  { label: 'Quarterback', value: 'QB' },
  { label: 'Running Back', value: 'RB' },
  { label: 'Safety', value: 'S' },
  { label: 'Tight End', value: 'TE' },
  { label: 'Wide Receiver', value: 'WR' },
]

const needs = ref<TeamNeedRow[]>([])
const formVisible = ref(false)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const selectedPosition = ref<string | null>(null)
const priority = ref<number>(1)

const sortedNeeds = computed<TeamNeedRow[]>(() =>
  [...needs.value].sort((left, right) =>
    left.position.localeCompare(right.position) || left.priority - right.priority,
  ),
)

const resetForm = (): void => {
  selectedPosition.value = null
  priority.value = 1
}

const readErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown; error?: unknown } } }).response
    const apiMessage = response?.data?.message ?? response?.data?.error
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage
  }

  return error instanceof Error ? error.message : 'The team need operation failed.'
}

const loadNeeds = async (): Promise<void> => {
  loading.value = true
  errorMessage.value = null

  try {
    const response = await api.get<ApiEnvelope<TeamNeedRow[]>>(
      `/team-need-records/team/${props.teamId}`,
    )
    needs.value = response.data.data
  } catch (error: unknown) {
    needs.value = []
    errorMessage.value = readErrorMessage(error)
  } finally {
    loading.value = false
  }
}

const showAddForm = (): void => {
  resetForm()
  errorMessage.value = null
  successMessage.value = null
  formVisible.value = true
}

const cancelAdd = (): void => {
  formVisible.value = false
  resetForm()
  errorMessage.value = null
}

const addNeed = async (): Promise<void> => {
  if (!selectedPosition.value) {
    errorMessage.value = 'Select a position.'
    return
  }

  saving.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    await api.post<ApiEnvelope<TeamNeedRow>>('/team-need-records', {
      teamId: props.teamId,
      position: selectedPosition.value,
      priority: priority.value,
    })

    await loadNeeds()
    formVisible.value = false
    resetForm()
    successMessage.value = 'Team need added successfully.'
  } catch (error: unknown) {
    errorMessage.value = readErrorMessage(error)
  } finally {
    saving.value = false
  }
}

onMounted(loadNeeds)

watch(
  () => props.teamId,
  async () => {
    formVisible.value = false
    resetForm()
    successMessage.value = null
    await loadNeeds()
  },
)
</script>

<template>
  <section class="team-needs-panel">
    <div class="actions-row">
      <Button
        label="Add Need"
        icon="pi pi-plus"
        @click="showAddForm"
      />
    </div>

    <Message v-if="successMessage" severity="success" :closable="true" class="panel-message">
      {{ successMessage }}
    </Message>

    <Message
      v-if="errorMessage && !formVisible"
      severity="error"
      :closable="false"
      class="panel-message"
    >
      {{ errorMessage }}
    </Message>

    <DataTable
      v-if="loading || sortedNeeds.length > 0"
      :value="sortedNeeds"
      data-key="id"
      :loading="loading"
      responsive-layout="scroll"
      striped-rows
      class="needs-table"
    >
      <Column field="position" header="Position" />
      <Column field="priority" header="Priority" />
    </DataTable>

    <div v-else class="empty-state">
      No team needs have been entered for this team.
    </div>

    <Dialog
      v-model:visible="formVisible"
      modal
      header="Add Team Need"
      :draggable="false"
      :dismissable-mask="!saving"
      :closable="!saving"
      class="team-need-dialog"
      @hide="cancelAdd"
    >
      <form class="need-form" @submit.prevent="addNeed">
        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <div class="form-field">
          <label for="team-need-position">Position</label>
          <Dropdown
            id="team-need-position"
            v-model="selectedPosition"
            :options="positionOptions"
            option-label="label"
            option-value="value"
            placeholder="Select position"
            class="field-control"
            autofocus
          />
        </div>

        <div class="form-field">
          <label for="team-need-priority">Priority</label>
          <InputNumber
            id="team-need-priority"
            v-model="priority"
            :min="1"
            :max="10"
            :use-grouping="false"
            show-buttons
            class="field-control"
          />
        </div>

        <div class="form-actions">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            :disabled="saving"
            @click="cancelAdd"
          />
          <Button
            type="submit"
            label="Save Need"
            icon="pi pi-check"
            :loading="saving"
          />
        </div>
      </form>
    </Dialog>
  </section>
</template>

<style scoped>
.team-needs-panel {
  width: 100%;
}

.actions-row {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.panel-message {
  margin-bottom: 1rem;
}

.empty-state {
  padding: 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 0.75rem;
  color: var(--text-color-secondary);
  background: var(--surface-card);
}

.need-form {
  display: flex;
  width: min(24rem, calc(100vw - 3rem));
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-field label {
  font-weight: 600;
}

.field-control {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

:deep(.team-need-dialog) {
  width: auto;
  max-width: calc(100vw - 2rem);
  border-radius: 1rem;
  overflow: hidden;
}

:deep(.team-need-dialog .p-dialog-header) {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

:deep(.team-need-dialog .p-dialog-content) {
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
}
</style>
