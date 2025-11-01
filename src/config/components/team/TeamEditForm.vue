<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme.store'


const themeStore = useThemeStore()
const teamStore = useTeamStore()

const router = useRouter()
const route = useRoute()

const toast = useToast()

const team = computed(() => teamStore.currentTeam)

const form = reactive({
  name: '',
  city: '',
  state: '',
  conference: '',
  division: '',
  stadium: '',
  country: 'USA',
  scheduleId: undefined
})

const conferences = [
  { label: 'AFC', value: 'AFC' },
  { label: 'NFC', value: 'NFC' }
]

const divisions = [
  { label: 'North', value: 'North' },
  { label: 'South', value: 'South' },
  { label: 'East', value: 'East' },
  { label: 'West', value: 'West' }
]

const countries = [
  { label: 'USA', value: 'USA' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Mexico', value: 'Mexico' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Germany', value: 'Germany' }
]

// Populate form when team data is available
watch(
  team,
  (newTeam) => {
    if (newTeam) {
      Object.assign(form, {
        name: newTeam.name || '',
        city: newTeam.city || '',
        state: newTeam.state || '',
        conference: newTeam.conference || '',
        division: newTeam.division || '',
        stadium: newTeam.stadium || '',
        country: newTeam.country || 'USA',
        scheduleId: newTeam.scheduleId
      })
    }
  },
  { immediate: true }
)
const getTeamLogo = (team: any): string => {
  if (!team || !team.name || !team.conference) return ''

  const lastWord = team.name.trim().split(/\s+/).pop() || ''
  const ext = lastWord === 'Chargers' ? 'webp' : 'avif'

  return `/images/${team.conference.toLowerCase()}/${lastWord}.${ext}`
}
onMounted(async () => {
  // Apply theme based on route parameter if present
  if (route.params.teamId && typeof route.params.teamId === 'string') {
    await themeStore.selectTeam(route.params.teamId)
  }
})

const onSubmit = async () => {
  if (!team.value?.id) return

  try {
    await teamStore.update(team.value.id, form)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Team updated successfully',
    })
    router.push(`/teams/${team.value.id}?mode=read`)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update team',
    })
  }
}

const onCancel = () => {
  if (team.value?.id) {
    router.push(`/teams/${team.value.id}?mode=read`)
  } else {
    router.push('/teams')
  }
}
</script>

<template>
  <Card class="edit-form">
    <template #title>Edit Team info</template>
    <template #subtitle v-if="team">
      <div class="info-row">
        <h3 class="team-name-with-logo">
          <img :src="getTeamLogo(team)" :alt="team.name" class="inline-logo" />
          {{ team.name }}
        </h3>
      </div>

    </template>

    <template #content>
      <form @submit.prevent="onSubmit" class="team-form">
        <div class="form-grid">
          <div class="form-section">
            <h3>Basic Information</h3>

            <div class="form-row">
              <label for="name">Team Name *</label>
              <InputText id="name" v-model="form.name" required class="form-input" placeholder="Enter team name" />
            </div>

            <div class="form-row">
              <label for="city">City *</label>
              <InputText id="city" v-model="form.city" required class="form-input" placeholder="Enter city" />
            </div>

            <div class="form-row">
              <label for="state">State *</label>
              <InputText id="state" v-model="form.state" required class="form-input"
                placeholder="Enter state/province" />
            </div>

            <div class="form-row">
              <label for="country">Country *</label>
              <Dropdown id="country" v-model="form.country" :options="countries" optionLabel="label" optionValue="value"
                required class="form-input" placeholder="Select country" />
            </div>

            <div class="form-row">
              <label for="stadium">Stadium *</label>
              <InputText id="stadium" v-model="form.stadium" required class="form-input"
                placeholder="Enter stadium name" />
            </div>
          </div>

          <div class="form-section">
            <h3>League Information</h3>

            <div class="form-row">
              <label for="conference">Conference *</label>
              <Dropdown id="conference" v-model="form.conference" :options="conferences" optionLabel="label"
                optionValue="value" required class="form-input" placeholder="Select conference" />
            </div>

            <div class="form-row">
              <label for="division">Division *</label>
              <Dropdown id="division" v-model="form.division" :options="divisions" optionLabel="label"
                optionValue="value" required class="form-input" placeholder="Select division" />
            </div>

            <div class="form-row">
              <label for="scheduleId">Schedule ID</label>
              <InputText id="scheduleId" v-model.number="form.scheduleId" type="number" class="form-input"
                placeholder="Enter schedule ID (optional)" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button type="button" @click="onCancel" label="Cancel" class="p-button-secondary" />
          <Button type="submit" label="Update Team" :loading="teamStore.loading" class="p-button-primary" />
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

.team-form {
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
.team-name-with-logo {
  display: flex;
  align-items: flex-start;
  /* align top edges */
  gap: 0.5rem;
  /* space between logo and text */
}

.inline-logo {
  height: 32px;
  /* or your preferred size */
  width: auto;
}
</style>
