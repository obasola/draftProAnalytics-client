<!-- src/components/prospect/ProspectCreateForm.vue -->
<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProspectStore } from '@/stores/prospectStore'
import { useTeamStore } from '@/stores/teamStore'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import { useToast } from 'primevue/usetoast'

const prospectStore = useProspectStore()
const teamStore = useTeamStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  firstName: '',
  lastName: '',
  position: '',
  college: '',
  height: 72, // Default to 6'0"
  weight: 200,
  handSize: undefined,
  armLength: undefined,
  homeCity: '',
  homeState: '',
  fortyTime: undefined,
  tenYardSplit: undefined,
  verticalLeap: undefined,
  broadJump: undefined,
  threeCone: undefined,
  twentyYardShuttle: undefined,
  benchPress: undefined,
  drafted: false,
  draftYear: undefined,
  teamId: undefined,
  draftPickId: undefined
})

const positions = [
  { label: 'Quarterback', value: 'QB' },
  { label: 'Running Back', value: 'RB' },
  { label: 'Wide Receiver', value: 'WR' },
  { label: 'Tight End', value: 'TE' },
  { label: 'Offensive Line', value: 'OL' },
  { label: 'Defensive Line', value: 'DL' },
  { label: 'Linebacker', value: 'LB' },
  { label: 'Defensive Back', value: 'DB' },
  { label: 'Kicker', value: 'K' },
  { label: 'Punter', value: 'P' },
  { label: 'Long Snapper', value: 'LS' }
]

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const draftYears = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + i - 5
  return { label: year.toString(), value: year }
})

onMounted(async () => {
  // Load teams for dropdown
  await teamStore.fetchAll()
})

const onSubmit = async () => {
  try {
    // Clean up undefined values
    const cleanForm = Object.fromEntries(
      Object.entries(form).filter(([_, value]) => value !== undefined && value !== '')
    )
    
    await prospectStore.create(cleanForm)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Prospect created successfully',
    })
    router.push('/prospects')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create prospect',
    })
  }
}

const onCancel = () => {
  router.push('/prospects')
}
</script>

<template>
  <Card class="create-form">
    <template #title>Create New Prospect</template>

    <template #content>
      <form @submit.prevent="onSubmit" class="prospect-form">
        <div class="form-grid">
          <!-- Basic Information Section -->
          <div class="form-section">
            <h3>Basic Information</h3>
            
            <div class="form-row">
              <label for="firstName">First Name *</label>
              <InputText
                id="firstName"
                v-model="form.firstName"
                class="form-input"
                required
              />
            </div>

            <div class="form-row">
              <label for="lastName">Last Name *</label>
              <InputText
                id="lastName"
                v-model="form.lastName"
                class="form-input"
                required
              />
            </div>

            <div class="form-row">
              <label for="position">Position *</label>
              <Dropdown
                id="position"
                v-model="form.position"
                :options="positions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Position"
                class="form-input"
                required
              />
            </div>

            <div class="form-row">
              <label for="college">College *</label>
              <InputText
                id="college"
                v-model="form.college"
                class="form-input"
                required
              />
            </div>
          </div>

          <!-- Physical Measurements Section -->
          <div class="form-section">
            <h3>Physical Measurements</h3>
            
            <div class="form-row">
              <label for="height">Height (inches) *</label>
              <InputNumber
                id="height"
                v-model="form.height"
                class="form-input"
                :min="60"
                :max="90"
                suffix=" in"
                required
              />
            </div>

            <div class="form-row">
              <label for="weight">Weight (lbs) *</label>
              <InputNumber
                id="weight"
                v-model="form.weight"
                class="form-input"
                :min="150"
                :max="400"
                suffix=" lbs"
                required
              />
            </div>

            <div class="form-row">
              <label for="handSize">Hand Size (inches)</label>
              <InputNumber
                id="handSize"
                v-model="form.handSize"
                class="form-input"
                :min="7"
                :max="12"
                :maxFractionDigits="2"
                suffix=" in"
              />
            </div>

            <div class="form-row">
              <label for="armLength">Arm Length (inches)</label>
              <InputNumber
                id="armLength"
                v-model="form.armLength"
                class="form-input"
                :min="28"
                :max="40"
                :maxFractionDigits="2"
                suffix=" in"
              />
            </div>
          </div>

          <!-- Background Information Section -->
          <div class="form-section">
            <h3>Background</h3>
            
            <div class="form-row">
              <label for="homeCity">Hometown City</label>
              <InputText
                id="homeCity"
                v-model="form.homeCity"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <label for="homeState">Home State</label>
              <Dropdown
                id="homeState"
                v-model="form.homeState"
                :options="states"
                placeholder="Select State"
                class="form-input"
                showClear
              />
            </div>
          </div>

          <!-- Combine Performance Section -->
          <div class="form-section">
            <h3>Combine Performance</h3>
            
            <div class="form-row">
              <label for="fortyTime">40-Yard Dash (seconds)</label>
              <InputNumber
                id="fortyTime"
                v-model="form.fortyTime"
                class="form-input"
                :min="3.5"
                :max="6.0"
                :maxFractionDigits="2"
                suffix=" s"
              />
            </div>

            <div class="form-row">
              <label for="tenYardSplit">10-Yard Split (seconds)</label>
              <InputNumber
                id="tenYardSplit"
                v-model="form.tenYardSplit"
                class="form-input"
                :min="1.0"
                :max="2.5"
                :maxFractionDigits="2"
                suffix=" s"
              />
            </div>

            <div class="form-row">
              <label for="verticalLeap">Vertical Leap (inches)</label>
              <InputNumber
                id="verticalLeap"
                v-model="form.verticalLeap"
                class="form-input"
                :min="20"
                :max="50"
                :maxFractionDigits="1"
                suffix=" in"
              />
            </div>

            <div class="form-row">
              <label for="broadJump">Broad Jump (inches)</label>
              <InputNumber
                id="broadJump"
                v-model="form.broadJump"
                class="form-input"
                :min="80"
                :max="150"
                suffix=" in"
              />
            </div>

            <div class="form-row">
              <label for="threeCone">3-Cone Drill (seconds)</label>
              <InputNumber
                id="threeCone"
                v-model="form.threeCone"
                class="form-input"
                :min="6.0"
                :max="9.0"
                :maxFractionDigits="2"
                suffix=" s"
              />
            </div>

            <div class="form-row">
              <label for="twentyYardShuttle">20-Yard Shuttle (seconds)</label>
              <InputNumber
                id="twentyYardShuttle"
                v-model="form.twentyYardShuttle"
                class="form-input"
                :min="3.5"
                :max="5.5"
                :maxFractionDigits="2"
                suffix=" s"
              />
            </div>

            <div class="form-row">
              <label for="benchPress">Bench Press (reps)</label>
              <InputNumber
                id="benchPress"
                v-model="form.benchPress"
                class="form-input"
                :min="0"
                :max="50"
                suffix=" reps"
              />
            </div>
          </div>

          <!-- Draft Status Section -->
          <div class="form-section">
            <h3>Draft Status</h3>
            
            <div class="form-row">
              <div class="checkbox-wrapper">
                <Checkbox
                  id="drafted"
                  v-model="form.drafted"
                  :binary="true"
                />
                <label for="drafted">Player has been drafted</label>
              </div>
            </div>

            <div class="form-row" v-if="form.drafted">
              <label for="draftYear">Draft Year</label>
              <Dropdown
                id="draftYear"
                v-model="form.draftYear"
                :options="draftYears"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Draft Year"
                class="form-input"
              />
            </div>

            <div class="form-row" v-if="form.drafted">
              <label for="teamId">Current Team</label>
              <Dropdown
                id="teamId"
                v-model="form.teamId"
                :options="teamStore.teams"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Team"
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
            label="Create Prospect"
            :loading="prospectStore.loading"
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

.prospect-form {
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

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-wrapper label {
  margin-bottom: 0;
  font-weight: normal;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}
</style>