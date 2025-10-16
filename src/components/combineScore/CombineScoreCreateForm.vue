<!-- src/components/combineScore/CombineScoreCreateForm.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCombineScoreStore } from '../../stores/combineScoreStore'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const combineScoreStore = useCombineScoreStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  playerId: null as number | null,
  fortyTime: null as number | null,
  tenYardSplit: null as number | null,
  verticalLeap: null as number | null,
  broadJump: null as number | null,
  threeCone: null as number | null,
  twentyYardShuttle: null as number | null,
  benchPress: null as number | null
})

const onSubmit = async () => {
  try {
    // Validate required fields
    if (!form.playerId || !form.fortyTime || !form.tenYardSplit || 
        !form.verticalLeap || !form.broadJump || !form.threeCone || 
        !form.twentyYardShuttle || !form.benchPress) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'All fields are required',
      })
      return
    }

    await combineScoreStore.create({
      playerId: form.playerId,
      fortyTime: form.fortyTime,
      tenYardSplit: form.tenYardSplit,
      verticalLeap: form.verticalLeap,
      broadJump: form.broadJump,
      threeCone: form.threeCone,
      twentyYardShuttle: form.twentyYardShuttle,
      benchPress: form.benchPress
    })
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Combine score created successfully',
    })
    router.push('/combineScores')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create combine score',
    })
  }
}

const onCancel = () => {
  router.push('/combineScores')
}
</script>

<template>
  <Card class="create-form">
    <template #title>Create New Combine Score</template>

    <template #content>
      <form @submit.prevent="onSubmit" class="combine-score-form">
        <div class="form-grid">
          <div class="form-section">
            <h3>Player Information</h3>
            <div class="form-row">
              <label for="playerId">Player ID *</label>
              <InputNumber
                id="playerId"
                v-model="form.playerId"
                class="form-input"
                :useGrouping="false"
                :min="1"
                placeholder="Enter player ID"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Speed & Agility Tests</h3>
            <div class="form-row">
              <label for="fortyTime">40-Yard Dash (seconds) *</label>
              <InputNumber
                id="fortyTime"
                v-model="form.fortyTime"
                class="form-input"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                :min="3.0"
                :max="8.0"
                :step="0.01"
                placeholder="e.g., 4.50"
              />
            </div>
            <div class="form-row">
              <label for="tenYardSplit">10-Yard Split (seconds) *</label>
              <InputNumber
                id="tenYardSplit"
                v-model="form.tenYardSplit"
                class="form-input"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                :min="1.0"
                :max="3.0"
                :step="0.01"
                placeholder="e.g., 1.55"
              />
            </div>
            <div class="form-row">
              <label for="threeCone">3-Cone Drill (seconds) *</label>
              <InputNumber
                id="threeCone"
                v-model="form.threeCone"
                class="form-input"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                :min="6.0"
                :max="10.0"
                :step="0.01"
                placeholder="e.g., 7.25"
              />
            </div>
            <div class="form-row">
              <label for="twentyYardShuttle">20-Yard Shuttle (seconds) *</label>
              <InputNumber
                id="twentyYardShuttle"
                v-model="form.twentyYardShuttle"
                class="form-input"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                :min="3.5"
                :max="6.0"
                :step="0.01"
                placeholder="e.g., 4.35"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Power & Strength Tests</h3>
            <div class="form-row">
              <label for="verticalLeap">Vertical Leap (inches) *</label>
              <InputNumber
                id="verticalLeap"
                v-model="form.verticalLeap"
                class="form-input"
                :minFractionDigits="1"
                :maxFractionDigits="1"
                :min="20.0"
                :max="50.0"
                :step="0.1"
                placeholder="e.g., 35.5"
              />
            </div>
            <div class="form-row">
              <label for="broadJump">Broad Jump (inches) *</label>
              <InputNumber
                id="broadJump"
                v-model="form.broadJump"
                class="form-input"
                :minFractionDigits="1"
                :maxFractionDigits="1"
                :min="90.0"
                :max="150.0"
                :step="0.1"
                placeholder="e.g., 120.5"
              />
            </div>
            <div class="form-row">
              <label for="benchPress">Bench Press (reps) *</label>
              <InputNumber
                id="benchPress"
                v-model="form.benchPress"
                class="form-input"
                :useGrouping="false"
                :min="0"
                :max="50"
                placeholder="e.g., 22"
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
            label="Create Combine Score"
            :loading="combineScoreStore.loading"
            class="p-button-primary"
          />
        </div>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.create-form {
  max-width: 1200px;
  margin: 0 auto;
}

.combine-score-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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