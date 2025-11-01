<!-- src/components/playerTeam/PlayerTeamCreateForm.vue -->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerTeamStore } from '@/stores/playerTeamStore'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const playerTeamStore = usePlayerTeamStore()
const router = useRouter()
const toast = useToast()

// Form state
const form = reactive({
  playerId: null as number | null,
  teamId: null as number | null,
  startDate: new Date() as Date,
  endDate: null as Date | null,
  startYear: null as number | null,
  endYear: null as number | null,
  isActive: true,
  currentTeam: true,
})

// Mock data - in real app, these would come from stores
const players = ref([
  { label: 'Player 1', value: 1 },
  { label: 'Player 2', value: 2 },
  { label: 'Player 3', value: 3 },
])

const teams = ref([
  { label: 'Team 1', value: 1 },
  { label: 'Team 2', value: 2 },
  { label: 'Team 3', value: 3 },
])

const formErrors = reactive({
  playerId: '',
  teamId: '',
  startDate: '',
  startYear: null,
  endYear: null,
})

onMounted(() => {
  // In a real app, fetch players and teams from their respective stores
})

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  Object.keys(formErrors).forEach(key => {
    formErrors[key as keyof typeof formErrors] = ''
  })

  // Validate required fields
  if (!form.playerId) {
    formErrors.playerId = 'Player is required'
    isValid = false
  }

  if (!form.teamId) {
    formErrors.teamId = 'Team is required'
    isValid = false
  }

  if (!form.startDate) {
    formErrors.startDate = 'Start date is required'
    isValid = false
  }

  // Validate end date is after start date
  if (form.endDate && form.startDate && form.endDate <= form.startDate) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'End date must be after start date',
    })
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
    // Build the payload object, excluding undefined/null optional fields
    const createPayload: Record<string, any> = {
      playerId: form.playerId!,
      teamId: form.teamId!,
      startDate: form.startDate!,
      startYear: form.startYear!,
      endYear: form.endYear!,
      currentTeam: form.currentTeam,
      isActive: form.isActive,
    }

    // Only include endDate if it has a value
    if (form.endDate !== null) {
      createPayload.endDate = form.endDate
    }

    await playerTeamStore.create(createPayload as any)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Player team relationship created successfully',
    })
    router.push('/player-teams')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create player team relationship',
    })
  }
}

const onCancel = () => {
  router.push('/player-teams')
}
</script>

<template>
  <Card class="create-form">
    <template #title>Create New Player Team Relationship</template>

    <template #content>
      <form @submit.prevent="onSubmit" class="playerteam-form">
        <div class="form-grid">
          <!-- Basic Information Section -->
          <div class="form-section">
            <h3>Relationship Information</h3>
            
            <div class="form-row">
              <label for="playerId">Player *</label>
              <Dropdown
                id="playerId"
                v-model="form.playerId"
                :options="players"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a player"
                class="form-input"
                :class="{ 'p-invalid': formErrors.playerId }"
              />
              <small v-if="formErrors.playerId" class="p-error">{{ formErrors.playerId }}</small>
            </div>

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
              <div class="checkbox-container">
                <Checkbox
                  id="currentTeam"
                  v-model="form.currentTeam"
                  binary
                />
                <label for="currentTeam">Current Team</label>
              </div>

              <div class="checkbox-container">
                <Checkbox
                  id="isActive"
                  v-model="form.isActive"
                  binary
                />
                <label for="isActive">Active?</label>
              </div>
            </div>
          </div>

          <!-- Timeline Information Section -->
          <div class="form-section">
            <h3>Timeline Information</h3>
            
            <div class="form-row">
              <label for="startYear">Start Year *</label>
              <Calendar
                id="startYear"
                v-model="form.startDate"
                dateFormat="mm/dd/yy"
                placeholder="Select start year"
                class="form-input"
                :class="{ 'p-invalid': formErrors.startYear }"
              />
              <small v-if="formErrors.startYear" class="p-error">{{ formErrors.startYear }}</small>
            </div>
            <div class="form-row">
              <label for="endYear">Start Year *</label>
              <InputNumber
                id="startYear"
                v-model="form.startYear"
                placeholder="Enter start year"
                class="form-input"
                :class="{ 'p-invalid': formErrors.startYear }"
              />
              <small v-if="formErrors.startYear" class="p-error">{{ formErrors.startYear }}</small>
            </div>            

            <div class="form-row">
              <label for="endDate">End Year</label>
              <InputNumber
                id="endYear"
                v-model="form.endYear"
                placeholder="Enter end year (optional)"
                class="form-input"
              />
              <small class="field-help">Leave empty if this is an ongoing relationship</small>
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
            label="Create Player Team"
            :loading="playerTeamStore.loading"
            class="p-button-primary"
          />
        </div>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.create-form {
  max-width: 800px;
  margin: 0 auto;
}

.playerteam-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
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
}
</style>