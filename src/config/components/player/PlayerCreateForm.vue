<!-- src/components/player/PlayerCreateForm.vue -->
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { useTeamStore } from '@/stores/teamStore'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const playerStore = usePlayerStore()
const teamStore = useTeamStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  firstName: '',
  lastName: '',
  age: null as number | null,
  height: null as number | null,
  weight: null as number | null,
  handSize: null as number | null,
  armLength: null as number | null,
  homeCity: '',
  homeState: '',
  university: '',
  yearEnteredLeague: null as number | null,
  position: '',
})

const positions = ref([
  'QB',
  'RB',
  'WR',
  'TE',
  'OL',
  'DL',
  'LB',
  'CB',
  'S',
  'K',
  'P',
])

const onSubmit = async () => {
  try {
    await playerStore.create(form)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Player created successfully',
    })
    router.push('/players')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create player',
    })
  }
}

const onCancel = () => {
  router.push('/players')
}
</script>

<template>
  <Card class="create-form">
    <template #title>Create New Player</template>

    <template #content>
      <form @submit.prevent="onSubmit" class="player-form">
        <div class="form-grid">
          <div class="form-section">
            <h3>Basic Information</h3>
            <div class="form-row">
              <label for="firstName">First Name *</label>
              <InputText
                id="firstName"
                v-model="form.firstName"
                required
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="lastName">Last Name *</label>
              <InputText
                id="lastName"
                v-model="form.lastName"
                required
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="position">Position *</label>
              <Dropdown
                id="position"
                v-model="form.position"
                :options="positions"
                placeholder="Select Position"
                required
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="age">Age *</label>
              <InputNumber
                id="age"
                v-model="form.age"
                :min="18"
                :max="50"
                required
                class="form-input"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Physical Measurements</h3>
            <div class="form-row">
              <label for="height">Height (inches) *</label>
              <InputNumber
                id="height"
                v-model="form.height"
                :min="60"
                :max="84"
                required
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="weight">Weight (lbs) *</label>
              <InputNumber
                id="weight"
                v-model="form.weight"
                :min="150"
                :max="400"
                required
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="handSize">Hand Size (inches)</label>
              <InputNumber
                id="handSize"
                v-model="form.handSize"
                :min="7"
                :max="12"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="armLength">Arm Length (inches)</label>
              <InputNumber
                id="armLength"
                v-model="form.armLength"
                :min="28"
                :max="40"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Background</h3>
            <div class="form-row">
              <label for="university">University *</label>
              <InputText
                id="university"
                v-model="form.university"
                required
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="homeCity">Home City</label>
              <InputText
                id="homeCity"
                v-model="form.homeCity"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="homeState">Home State</label>
              <InputText
                id="homeState"
                v-model="form.homeState"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="yearEnteredLeague">Year Entered League *</label>
              <Calendar
                id="yearEnteredLeague"
                v-model="form.yearEnteredLeague"
                view="year"
                dateFormat="yy"
                required
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
            label="Create Player"
            :loading="playerStore.loading"
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

.player-form {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}
</style>