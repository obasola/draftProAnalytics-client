<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScheduleStore } from '@/stores/scheduleStore'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const scheduleStore = useScheduleStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  id: null,
  teamId: null,
  seasonYear: new Date().getFullYear(),
  oppTeamId: null,
  oppTeamConference: '',
  oppTeamDivision: '',
  scheduleWeek: null,
  gameDate: null,
  gameCity: '',
  gameStateProvince: '',
  gameCountry: 'USA',
  gameLocation: '',
  wonLostFlag: '',
  homeOrAway: '',
  oppTeamScore: null,
  teamScore: null,
})

const homeAwayOptions = [
  { label: 'Home', value: 'HOME' },
  { label: 'Away', value: 'AWAY' },
  { label: 'Neutral', value: 'NEUTRAL' }
]

const wonLostOptions = [
  { label: 'Win', value: 'W' },
  { label: 'Loss', value: 'L' },
  { label: 'Tie', value: 'T' }
]

// Watch for current schedule changes and populate form
watch(
  () => scheduleStore.currentSchedule,
  (schedule) => {
    if (schedule) {
      Object.assign(form, {
        ...schedule,
        gameDate: schedule.gameDate ? new Date(schedule.gameDate) : null
      })
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (scheduleStore.currentSchedule) {
    Object.assign(form, {
      ...scheduleStore.currentSchedule,
      gameDate: scheduleStore.currentSchedule.gameDate ? new Date(scheduleStore.currentSchedule.gameDate) : null
    })
  }
})

const onSubmit = async () => {
  if (!form.id) return
  
  try {
    await scheduleStore.update(form.id, form)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Schedule updated successfully',
    })
    router.push('/schedules')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update schedule',
    })
  }
}

const onCancel = () => {
  router.push('/schedules')
}
</script>

<template>
  <Card class="edit-form">
    <template #title>Edit Schedule</template>

    <template #content>
      <form @submit.prevent="onSubmit" class="schedule-form">
        <div class="form-grid">
          <div class="form-section">
            <h3>Basic Information</h3>
            <div class="form-row">
              <label for="seasonYear">Season Year *</label>
              <InputNumber
                id="seasonYear"
                v-model="form.seasonYear"
                class="form-input"
                :min="2000"
                :max="2030"
                required
              />
            </div>
            <div class="form-row">
              <label for="scheduleWeek">Week</label>
              <InputNumber
                id="scheduleWeek"
                v-model="form.scheduleWeek"
                class="form-input"
                :min="1"
                :max="20"
              />
            </div>
            <div class="form-row">
              <label for="gameDate">Game Date</label>
              <Calendar
                id="gameDate"
                v-model="form.gameDate"
                class="form-input"
                dateFormat="mm/dd/yy"
                showIcon
              />
            </div>
            <div class="form-row">
              <label for="homeOrAway">Home/Away</label>
              <Dropdown
                id="homeOrAway"
                v-model="form.homeOrAway"
                :options="homeAwayOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select..."
                class="form-input"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Teams</h3>
            <div class="form-row">
              <label for="teamId">Team ID *</label>
              <InputNumber
                id="teamId"
                v-model="form.teamId"
                class="form-input"
                required
              />
            </div>
            <div class="form-row">
              <label for="oppTeamId">Opponent Team ID *</label>
              <InputNumber
                id="oppTeamId"
                v-model="form.oppTeamId"
                class="form-input"
                required
              />
            </div>
            <div class="form-row">
              <label for="oppTeamConference">Opponent Conference</label>
              <InputText
                id="oppTeamConference"
                v-model="form.oppTeamConference"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="oppTeamDivision">Opponent Division</label>
              <InputText
                id="oppTeamDivision"
                v-model="form.oppTeamDivision"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Location</h3>
            <div class="form-row">
              <label for="gameLocation">Venue</label>
              <InputText
                id="gameLocation"
                v-model="form.gameLocation"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="gameCity">City</label>
              <InputText
                id="gameCity"
                v-model="form.gameCity"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="gameStateProvince">State/Province</label>
              <InputText
                id="gameStateProvince"
                v-model="form.gameStateProvince"
                class="form-input"
              />
            </div>
            <div class="form-row">
              <label for="gameCountry">Country</label>
              <InputText
                id="gameCountry"
                v-model="form.gameCountry"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Game Results</h3>
            <div class="form-row">
              <label for="teamScore">Team Score</label>
              <InputNumber
                id="teamScore"
                v-model="form.teamScore"
                class="form-input"
                :min="0"
              />
            </div>
            <div class="form-row">
              <label for="oppTeamScore">Opponent Score</label>
              <InputNumber
                id="oppTeamScore"
                v-model="form.oppTeamScore"
                class="form-input"
                :min="0"
              />
            </div>
            <div class="form-row">
              <label for="wonLostFlag">Result</label>
              <Dropdown
                id="wonLostFlag"
                v-model="form.wonLostFlag"
                :options="wonLostOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select..."
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
            label="Update Schedule"
            :loading="scheduleStore.loading"
            class="p-button-primary"
          />
        </div>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.edit-form {
  max-width: 1000px;
  margin: 0 auto;
}

.schedule-form {
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