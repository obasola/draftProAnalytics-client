<!-- src/modules/roster/presentation/components/rosterPlayer/RosterPlayerCreateForm.vue -->
<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import type { CreateRosterPlayerDto } from '@/modules/roster/application/dto/rosterPlayer.dto'
import { useRosterPlayerStore } from '../../application/stores/rosterPlayerStore'

const rosterPlayerStore = useRosterPlayerStore()
const router = useRouter()
const toast = useToast()

// Form state
const form = reactive({
  teamId: null as number | null,
  playerId: null as string | null,
  playerName: '',
  position: null as string | null,
  positionGroup: null as string | null,
  depthChartOrder: 99,
  age: 22,
  yearsExperience: 0,
  performanceGrade: 50.0,
  isStarter: false,
  contractYearsRemaining: 0,
  injuryStatus: null as string | null,
  notes: null as string | null,
})

// Position options
const positions = ref([
  { label: 'QB', value: 'QB', group: 'OFF' },
  { label: 'RB', value: 'RB', group: 'OFF' },
  { label: 'WR', value: 'WR', group: 'OFF' },
  { label: 'TE', value: 'TE', group: 'OFF' },
  { label: 'OL', value: 'OL', group: 'OFF' },
  { label: 'C', value: 'C', group: 'OFF' },
  { label: 'G', value: 'G', group: 'OFF' },
  { label: 'T', value: 'T', group: 'OFF' },
  { label: 'DE', value: 'DE', group: 'DEF' },
  { label: 'DT', value: 'DT', group: 'DEF' },
  { label: 'NT', value: 'NT', group: 'DEF' },
  { label: 'LB', value: 'LB', group: 'DEF' },
  { label: 'CB', value: 'CB', group: 'DEF' },
  { label: 'S', value: 'S', group: 'DEF' },
  { label: 'K', value: 'K', group: 'ST' },
  { label: 'P', value: 'P', group: 'ST' },
  { label: 'LS', value: 'LS', group: 'ST' },
])

const positionGroups = ref([
  { label: 'Offense', value: 'OFF' },
  { label: 'Defense', value: 'DEF' },
  { label: 'Special Teams', value: 'ST' },
])

const injuryStatusOptions = ref([
  { label: 'Healthy', value: 'HEALTHY' },
  { label: 'Questionable', value: 'QUESTIONABLE' },
  { label: 'Doubtful', value: 'DOUBTFUL' },
  { label: 'Out', value: 'OUT' },
  { label: 'Injured Reserve', value: 'INJURED_RESERVE' },
  { label: 'PUP', value: 'PHYSICALLY_UNABLE_TO_PERFORM' },
])

// Mock teams - in real app, would come from team store
const teams = ref([
  { label: 'Team 1', value: 1 },
  { label: 'Team 2', value: 2 },
  { label: 'Team 3', value: 3 },
])

const formErrors = reactive({
  teamId: '',
  playerName: '',
  position: '',
  positionGroup: '',
  age: '',
  depthChartOrder: '',
  performanceGrade: '',
})

// Auto-populate position group when position changes
const selectedPositionObject = computed(() => 
  positions.value.find(p => p.value === form.position)
)

// Watch position changes to update position group
const updatePositionGroup = () => {
  if (selectedPositionObject.value) {
    form.positionGroup = selectedPositionObject.value.group
  }
}

onMounted(() => {
  // In a real app, fetch teams from team store
})

const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  Object.keys(formErrors).forEach(key => {
    formErrors[key as keyof typeof formErrors] = ''
  })

  if (!form.teamId) {
    formErrors.teamId = 'Team is required'
    isValid = false
  }

  if (!form.playerName.trim()) {
    formErrors.playerName = 'Player name is required'
    isValid = false
  }

  if (!form.position) {
    formErrors.position = 'Position is required'
    isValid = false
  }

  if (!form.positionGroup) {
    formErrors.positionGroup = 'Position group is required'
    isValid = false
  }

  if (form.age < 18 || form.age > 50) {
    formErrors.age = 'Age must be between 18 and 50'
    isValid = false
  }

  if (form.depthChartOrder < 1) {
    formErrors.depthChartOrder = 'Depth chart order must be at least 1'
    isValid = false
  }

  if (form.performanceGrade < 0 || form.performanceGrade > 100) {
    formErrors.performanceGrade = 'Performance grade must be between 0 and 100'
    isValid = false
  }

  return isValid
}

const onSubmit = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fix the form errors and try again',
    })
    return
  }

  try {
    const createPayload: CreateRosterPlayerDto = {
      teamId: form.teamId!,
      playerId: form.playerId,
      playerName: form.playerName,
      position: form.position!,
      positionGroup: form.positionGroup!,
      depthChartOrder: form.depthChartOrder,
      age: form.age,
      yearsExperience: form.yearsExperience,
      performanceGrade: form.performanceGrade,
      isStarter: form.isStarter,
      contractYearsRemaining: form.contractYearsRemaining,
      injuryStatus: form.injuryStatus,
      notes: form.notes,
    }

    await rosterPlayerStore.create(createPayload)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Roster player created successfully',
    })
    router.push('/roster-players')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create roster player',
    })
  }
}

const onCancel = () => {
  router.push('/roster-players')
}
</script>

<template>
  <Card class="create-form">
    <template #title>Add Player to Roster</template>

    <template #content>
      <form @submit.prevent="onSubmit" class="roster-player-form">
        <div class="form-grid">
          <!-- Basic Information Section -->
          <div class="form-section">
            <h3>Player Information</h3>
            
            <div class="form-row">
              <label for="teamId">Team *</label>
              <Dropdown
                id="teamId"
                v-model="form.teamId"
                :options="teams"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a team"
                class="form-input"
                :class="{ 'p-invalid': formErrors.teamId }"
              />
              <small v-if="formErrors.teamId" class="p-error">{{ formErrors.teamId }}</small>
            </div>

            <div class="form-row">
              <label for="playerId">Player ID (ESPN)</label>
              <InputText
                id="playerId"
                v-model="form.playerId"
                placeholder="ESPN Athlete ID (optional)"
                class="form-input"
              />
              <small class="field-help">Optional ESPN athlete identifier</small>
            </div>

            <div class="form-row">
              <label for="playerName">Player Name *</label>
              <InputText
                id="playerName"
                v-model="form.playerName"
                placeholder="Enter player name"
                class="form-input"
                :class="{ 'p-invalid': formErrors.playerName }"
              />
              <small v-if="formErrors.playerName" class="p-error">{{ formErrors.playerName }}</small>
            </div>

            <div class="form-row">
              <label for="position">Position *</label>
              <Dropdown
                id="position"
                v-model="form.position"
                :options="positions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select position"
                class="form-input"
                :class="{ 'p-invalid': formErrors.position }"
                @change="updatePositionGroup"
              />
              <small v-if="formErrors.position" class="p-error">{{ formErrors.position }}</small>
            </div>

            <div class="form-row">
              <label for="positionGroup">Position Group *</label>
              <Dropdown
                id="positionGroup"
                v-model="form.positionGroup"
                :options="positionGroups"
                optionLabel="label"
                optionValue="value"
                placeholder="Select position group"
                class="form-input"
                :class="{ 'p-invalid': formErrors.positionGroup }"
              />
              <small v-if="formErrors.positionGroup" class="p-error">{{ formErrors.positionGroup }}</small>
            </div>

            <div class="form-row">
              <label for="age">Age *</label>
              <InputNumber
                id="age"
                v-model="form.age"
                :min="18"
                :max="50"
                placeholder="Enter age"
                class="form-input"
                :class="{ 'p-invalid': formErrors.age }"
              />
              <small v-if="formErrors.age" class="p-error">{{ formErrors.age }}</small>
            </div>

            <div class="form-row">
              <label for="yearsExperience">Years of Experience</label>
              <InputNumber
                id="yearsExperience"
                v-model="form.yearsExperience"
                :min="0"
                :max="25"
                placeholder="Enter years of experience"
                class="form-input"
              />
            </div>
          </div>

          <!-- Roster Status Section -->
          <div class="form-section">
            <h3>Roster Status</h3>
            
            <div class="form-row">
              <label for="depthChartOrder">Depth Chart Order</label>
              <InputNumber
                id="depthChartOrder"
                v-model="form.depthChartOrder"
                :min="1"
                :max="99"
                placeholder="Enter depth chart order"
                class="form-input"
                :class="{ 'p-invalid': formErrors.depthChartOrder }"
              />
              <small class="field-help">Lower number = higher on depth chart (1 = starter)</small>
              <small v-if="formErrors.depthChartOrder" class="p-error">{{ formErrors.depthChartOrder }}</small>
            </div>

            <div class="form-row">
              <label for="performanceGrade">Performance Grade (0-100)</label>
              <InputNumber
                id="performanceGrade"
                v-model="form.performanceGrade"
                :min="0"
                :max="100"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                placeholder="Enter performance grade"
                class="form-input"
                :class="{ 'p-invalid': formErrors.performanceGrade }"
              />
              <small v-if="formErrors.performanceGrade" class="p-error">{{ formErrors.performanceGrade }}</small>
            </div>

            <div class="form-row">
              <div class="checkbox-container">
                <Checkbox
                  id="isStarter"
                  v-model="form.isStarter"
                  binary
                />
                <label for="isStarter">Starter</label>
              </div>
            </div>

            <div class="form-row">
              <label for="contractYearsRemaining">Contract Years Remaining</label>
              <InputNumber
                id="contractYearsRemaining"
                v-model="form.contractYearsRemaining"
                :min="0"
                :max="10"
                placeholder="Enter contract years"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <label for="injuryStatus">Injury Status</label>
              <Dropdown
                id="injuryStatus"
                v-model="form.injuryStatus"
                :options="injuryStatusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select injury status"
                class="form-input"
                showClear
              />
            </div>

            <div class="form-row">
              <label for="notes">Notes</label>
              <Textarea
                id="notes"
                v-model="form.notes"
                rows="4"
                placeholder="Additional notes about the player..."
                class="form-input"
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button
            type="button"
            @click="onCancel"
            label="Cancel"
            class="p-button-secondary"
          />
          <Button
            type="submit"
            label="Add to Roster"
            :loading="rosterPlayerStore.loading"
            class="p-button-primary"
          />
        </div>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.create-form {
  max-width: 1000px;
  margin: 0 auto;
}

.roster-player-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-section h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.form-row {
  margin-bottom: 1rem;
}

.form-row label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-container label {
  margin-bottom: 0;
  cursor: pointer;
}

.field-help {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.p-error {
  color: var(--red-500);
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}
</style>