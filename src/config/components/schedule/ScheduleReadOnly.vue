<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import Card from 'primevue/card'
import Tag from 'primevue/tag'

const scheduleStore = useScheduleStore()

const schedule = computed(() => scheduleStore.currentSchedule)

onMounted(async () => {
  // Load any related data if needed
})

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'TBD'
  const d = new Date(date)
  return d.toLocaleDateString()
}

const getWonLostTagSeverity = (flag: string | undefined) => {
  switch (flag?.toUpperCase()) {
    case 'W': return 'success'
    case 'L': return 'danger'
    default: return 'info'
  }
}

const getHomeAwayTagSeverity = (homeAway: string | undefined) => {
  return homeAway?.toUpperCase() === 'HOME' ? 'success' : 'warning'
}
</script>

<template>
  <Card v-if="schedule" class="schedule-details">
    <template #title>
      Schedule Details - Week {{ schedule.scheduleWeek || 'TBD' }} ({{ schedule.seasonYear || 'TBD' }})
    </template>

    <template #content>
      <div class="schedule-info-grid">
        <div class="info-section">
          <h3>Game Information</h3>
          <div class="info-row">
            <span class="label">Season:</span>
            <span>{{ schedule.seasonYear || 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Week:</span>
            <span>{{ schedule.scheduleWeek || 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Game Date:</span>
            <span>{{ formatDate(schedule.gameDate) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Home/Away:</span>
            <Tag :value="schedule.homeOrAway || 'TBD'" :severity="getHomeAwayTagSeverity(schedule.homeOrAway)" />
          </div>
        </div>

        <div class="info-section">
          <h3>Teams & Scores</h3>
          <div class="info-row">
            <span class="label">Team ID:</span>
            <span>{{ schedule.teamId || 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Opponent ID:</span>
            <span>{{ schedule.oppTeamId || 'TBD' }}</span>
          </div>

          <div class="info-row">
            <span class="label">Opponent Score:</span>
            <span>{{ schedule.oppTeamScore ?? 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Team Score:</span>
            <span>{{ schedule.teamScore ?? 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Result:</span>
            <Tag v-if="schedule.wonLostFlag" :value="schedule.wonLostFlag"
              :severity="getWonLostTagSeverity(schedule.wonLostFlag)" />
            <span v-else>TBD</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Opponent Details</h3>
          <div class="info-row">
            <span class="label">Conference:</span>
            <span>{{ schedule.oppTeamConference || 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Division:</span>
            <span>{{ schedule.oppTeamDivision || 'TBD' }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Location</h3>
          <div class="info-row">
            <span class="label">Venue:</span>
            <span>{{ schedule.gameLocation || 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">City:</span>
            <span>{{ schedule.gameCity || 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">State/Province:</span>
            <span>{{ schedule.gameStateProvince || 'TBD' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Country:</span>
            <span>{{ schedule.gameCountry || 'TBD' }}</span>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.schedule-details {
  max-width: 1000px;
  margin: 0 auto;
}

.schedule-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-section h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.label {
  font-weight: bold;
  color: var(--text-primary);
}
</style>