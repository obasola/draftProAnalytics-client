<!-- src/components/playeraward/PlayerAwardEditForm.vue -->
<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerAwardStore } from '@/stores/playerAwardStore'
import { usePlayerStore } from '@/stores/playerStore'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const playerAwardStore = usePlayerAwardStore()
const playerStore = usePlayerStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  playerId: undefined as number | undefined,
  awardName: '',
  awardYear: new Date().getFullYear(),
  awardDescription: ''
})

onMounted(async () => {
  // Load players for dropdown
  await playerStore.fetchAll()
  
  // Initialize form with current player award data
  if (playerAwardStore.currentPlayerAward) {
    Object.assign(form, {
      playerId: playerAwardStore.currentPlayerAward.playerId,
      awardName: playerAwardStore.currentPlayerAward.awardName,
      awardYear: playerAwardStore.currentPlayerAward.awardYear,
      awardDescription: playerAwardStore.currentPlayerAward.awardDescription || ''
    })
  }
})

// Watch for changes to current player award
watch(
  () => playerAwardStore.currentPlayerAward,
  (newPlayerAward) => {
    if (newPlayerAward) {
      Object.assign(form, {
        playerId: newPlayerAward.playerId,
        awardName: newPlayerAward.awardName,
        awardYear: newPlayerAward.awardYear,
        awardDescription: newPlayerAward.awardDescription || ''
      })
    }
  },
  { immediate: true }
)

const onSubmit = async () => {
  if (!playerAwardStore.currentPlayerAward?.id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No player award selected for editing',
    })
    return
  }

  try {
    await playerAwardStore.update(playerAwardStore.currentPlayerAward.id, form)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Player Award updated successfully',
    })
    router.push('/player-awards')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update player award',
    })
  }
}

const onCancel = () => {
  router.push('/player-awards')
}
</script>

<template>
  <Card class="edit-form">
    <template #title>Edit Player Award</template>

    <template #content>
      <form @submit.prevent="onSubmit" class="player-award-form">
        <div class="form-grid">
          <div class="form-section">
            <h3>Award Information</h3>
            
            <div class="form-row">
              <label for="awardName">Award Name *</label>
              <InputText
                id="awardName"
                v-model="form.awardName"
                class="form-input"
                required
                placeholder="Enter award name"
              />
            </div>

            <div class="form-row">
              <label for="awardYear">Award Year *</label>
              <InputNumber
                id="awardYear"
                v-model="form.awardYear"
                class="form-input"
                :min="1900"
                :max="2030"
                required
                placeholder="Enter award year"
              />
            </div>

            <div class="form-row">
              <label for="awardDescription">Description</label>
              <Textarea
                id="awardDescription"
                v-model="form.awardDescription"
                class="form-input"
                rows="3"
                placeholder="Enter award description (optional)"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Player Assignment</h3>
            
            <div class="form-row">
              <label for="playerId">Player</label>
              <Dropdown
                id="playerId"
                v-model="form.playerId"
                :options="playerStore.players"
                optionLabel="displayName"
                optionValue="id"
                class="form-input"
                placeholder="Select a player (optional)"
                filter
                showClear
              >
                <template #option="{ option }">
                  {{ option.firstName }} {{ option.lastName }} - {{ option.position }} ({{ option.college }})
                </template>
                <template #value="{ value }">
                  <span v-if="value">
                    {{ playerStore.getPlayerById(value)?.firstName }} {{ playerStore.getPlayerById(value)?.lastName }}
                  </span>
                  <span v-else class="placeholder">Select a player</span>
                </template>
              </Dropdown>
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
            label="Update Player Award"
            :loading="playerAwardStore.loading"
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

.player-award-form {
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

.placeholder {
  color: var(--text-color-secondary);
}
</style>