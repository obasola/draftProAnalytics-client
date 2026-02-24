// ============================================
// File: src/components/DraftInfo.vue
// ============================================

<template>
  <div class="draft-info">
    <div class="panel-header">
      <h3 class="panel-title">Draft Information</h3>
    </div>

    <!-- Current Pick -->
    <Card v-if="currentPick" class="current-pick-card">
      <template #title>
        <div class="pick-title">
          <i class="pi pi-clock" />
          <span>On The Clock</span>
        </div>
      </template>
      <template #content>
        <div class="pick-details">
          <div class="pick-info">
            <span class="label">Round</span>
            <span class="value">{{ currentPick.round }}</span>
          </div>
          <div class="pick-info">
            <span class="label">Pick</span>
            <span class="value">{{ currentPick.pick }}</span>
          </div>
          <div class="pick-info">
            <span class="label">Overall</span>
            <span class="value">{{ currentPick.overallPick }}</span>
          </div>
        </div>
      </template>
    </Card>

    <!-- Your Teams -->
    <div class="section">
      <h4 class="section-title">Your Teams</h4>
      <div class="teams-list">
        <Chip 
          v-for="teamId in selectedTeams" 
          :key="teamId"
          :label="getTeamName(teamId)"
          class="team-chip"
        />
      </div>
    </div>

    <!-- Next Picks -->
    <div class="section">
      <h4 class="section-title">Your Next Picks</h4>
      <div class="next-picks-list">
        <div 
          v-for="pick in upcomingPicks" 
          :key="`${pick.round}-${pick.pick}`"
          class="next-pick-item"
        >
          <Tag :value="`Round ${pick.round}`" severity="info" />
          <span class="pick-number">Pick {{ pick.pick }}</span>
        </div>
        <div v-if="upcomingPicks.length === 0" class="no-picks">
          <span class="text-muted">No upcoming picks</span>
        </div>
      </div>
    </div>

    <!-- Draft Stats -->
    <div class="section">
      <h4 class="section-title">Draft Stats</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <i class="pi pi-check-circle stat-icon" />
          <div class="stat-content">
            <span class="stat-label">Picks Made</span>
            <span class="stat-value">{{ picksMade }}</span>
          </div>
        </div>
        <div class="stat-item">
          <i class="pi pi-users stat-icon" />
          <div class="stat-content">
            <span class="stat-label">Players Drafted</span>
            <span class="stat-value">{{ playersDrafted }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import type { DraftPick } from '../types/draft.types';

// Props
interface Props {
  currentPick: DraftPick | null;
  selectedTeams: string[];
}

const props = defineProps<Props>();

// Computed
const upcomingPicks = computed(() => {
  // Mock data - would be calculated from actual draft order
  return [
    { round: 2, pick: 5 },
    { round: 3, pick: 5 },
    { round: 4, pick: 5 }
  ].slice(0, 3);
});

const picksMade = computed(() => {
  // Mock data - would come from draft state
  return 3;
});

const playersDrafted = computed(() => {
  // Mock data - would come from draft state
  return 3;
});

// Methods
const getTeamName = (teamId: string): string => {
  // Mock implementation - would lookup from teams data
  return teamId.toUpperCase();
};
</script>

<style scoped>
.draft-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.current-pick-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  :deep(.p-card-title) {
    color: white;
  }

  .pick-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
  }

  .pick-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .pick-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;

    .label {
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 700;
    }
  }
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.teams-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.team-chip {
  background: #667eea;
  color: white;
}

.next-picks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.next-pick-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.pick-number {
  font-weight: 600;
  color: #374151;
}

.no-picks {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.stat-icon {
  font-size: 1.5rem;
  color: #667eea;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}
</style>