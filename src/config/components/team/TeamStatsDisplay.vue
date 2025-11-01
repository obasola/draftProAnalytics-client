<!-- src/components/TeamStatsDisplay.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import Divider from 'primevue/divider'

interface TeamStats {
  overall: { won: number; lost: number }
  conference: { won: number; lost: number }
  division: { won: number; lost: number }
}

interface TeamInfo {
  id: number
  name: string
  conference?: string | null
  division?: string | null
  city?: string | null
  state?: string | null
  stadium?: string | null
}

interface Props {
  team: TeamInfo
  stats: TeamStats | null
  seasonYear: string
  loading: boolean
  error: string | null
}

const props = defineProps<Props>()

const hasStats = computed(() => props.stats !== null)

const winPercentage = computed(() => {
  if (!props.stats) return 0
  const totalGames = props.stats.overall.won + props.stats.overall.lost
  return totalGames > 0 ? (props.stats.overall.won / totalGames * 100).toFixed(1) : 0
})

const totalGames = computed(() => {
  if (!props.stats) return 0
  return props.stats.overall.won + props.stats.overall.lost
})
</script>

<template>
  <div class="team-details">
    <!-- Team Basic Info -->
    <div class="team-basic-info">
      <h4>Team Information</h4>
      <div class="info-row">
        <span class="label">Team Name:</span>
        <span class="data-value">{{ team.name }}</span>
      </div>
      <div class="info-row" v-if="team.city">
        <span class="label">City:</span>
        <span class="data-value">{{ team.city }}</span>
      </div>
      <div class="info-row" v-if="team.state">
        <span class="label">State:</span>
        <span class="data-value">{{ team.state }}</span>
      </div>
      <div class="info-row" v-if="team.conference">
        <span class="label">Conference:</span>
        <span class="data-value">{{ team.conference }}</span>
      </div>
      <div class="info-row" v-if="team.division">
        <span class="label">Division:</span>
        <span class="data-value">{{ team.division }}</span>
      </div>
      <div class="info-row" v-if="team.stadium">
        <span class="label">Stadium:</span>
        <span class="data-value">{{ team.stadium }}</span>
      </div>
    </div>

    <Divider />

    <!-- Team Statistics -->
    <div class="team-standings">
      <h4>{{ seasonYear }} Season Standings</h4>
      
      <!-- Loading State -->
      <div v-if="loading" class="state-message loading-message">
        <i class="pi pi-spinner pi-spin"></i>
        Loading statistics...
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="state-message error-message">
        <i class="pi pi-exclamation-triangle"></i>
        {{ error }}
      </div>
      
      <!-- Statistics Display -->
      <div v-else-if="hasStats" class="standings-container">
        <div class="standings-grid">
          <!-- Conference Record -->
          <div class="standing-section">
            <h5>Conference</h5>
            <div class="record-line">
              <span class="record-label">Won:</span>
              <span class="record-value wins">{{ stats!.conference.won }}</span>
            </div>
            <div class="record-line">
              <span class="record-label">Lost:</span>
              <span class="record-value losses">{{ stats!.conference.lost }}</span>
            </div>
          </div>

          <!-- Division Record -->
          <div class="standing-section">
            <h5>Division</h5>
            <div class="record-line">
              <span class="record-label">Won:</span>
              <span class="record-value wins">{{ stats!.division.won }}</span>
            </div>
            <div class="record-line">
              <span class="record-label">Lost:</span>
              <span class="record-value losses">{{ stats!.division.lost }}</span>
            </div>
          </div>
        </div>

        <!-- Season Total -->
        <div class="season-total">
          <h5>Season Total</h5>
          <div class="total-record">
            <div class="record-line">
              <span class="record-label">Won:</span>
              <span class="record-value wins">{{ stats!.overall.won }}</span>
              <span class="record-label ml-4">Lost:</span>
              <span class="record-value losses">{{ stats!.overall.lost }}</span>
            </div>
            <div class="record-line" v-if="totalGames > 0">
              <span class="record-label">Win Percentage:</span>
              <span class="record-value percentage">{{ winPercentage }}%</span>
            </div>
            <div class="record-line" v-if="totalGames > 0">
              <span class="record-label">Total Games:</span>
              <span class="record-value total">{{ totalGames }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No Stats Available -->
      <div v-else class="state-message no-stats-message">
        <i class="pi pi-info-circle"></i>
        No statistics available for {{ team.name }} in {{ seasonYear }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-details {
  padding: 1rem 0;
}

.team-basic-info h4,
.team-standings h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.team-standings h5 {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.label {
  font-weight: bold;
  color: var(--text-primary);
}

.data-value {
  color: var(--primary-color);
  font-weight: 500;
  font-size: 1.05em;
}

.standings-container {
  margin-bottom: 1.5rem;
}

.standings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.standing-section {
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.standing-section:hover {
  background: var(--surface-100);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.season-total {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--surface-100), var(--surface-50));
  border-radius: 12px;
  border: 2px solid var(--primary-color);
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.season-total h5 {
  color: var(--primary-color);
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.total-record {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.record-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.season-total .record-line {
  justify-content: center;
  gap: 2rem;
}

.record-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.record-value {
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 2rem;
  text-align: center;
}

.record-value.wins {
  color: #10b981;
}

.record-value.losses {
  color: #ef4444;
}

.record-value.percentage {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.record-value.total {
  color: var(--text-primary);
}

.state-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
}

.loading-message {
  color: var(--text-secondary);
  background: var(--surface-50);
}

.error-message {
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.no-stats-message {
  color: var(--text-secondary);
  background: var(--surface-50);
  font-style: italic;
}

.ml-4 {
  margin-left: 1rem;
}

.info-row:hover .data-value {
  color: var(--primary-color);
  transform: translateX(2px);
  transition: all 0.2s ease;
}

/* Loading spinner animation */
.pi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .standings-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .season-total .record-line {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .ml-4 {
    margin-left: 0;
    margin-top: 0.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .error-message {
    background: #1f1f1f;
    border-color: #ef4444;
  }
}
</style>