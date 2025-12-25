<template>
  <Dialog 
    v-model:visible="isVisible"
    :header="player?.name || 'Player Information'"
    :style="{ width: '600px' }"
    :modal="true"
    :dismissable-mask="true"
  >
    <div v-if="player" class="player-info-content">
      <!-- Player Header -->
      <div class="player-header">
        <div class="player-avatar">
          <i class="pi pi-user" />
        </div>
        <div class="player-basic">
          <h3 class="player-name">{{ player.name }}</h3>
          <div class="player-meta">
            <Tag :value="player.position" severity="info" />
            <span class="college">{{ player.college }}</span>
          </div>
        </div>
      </div>

      <Divider />

      <!-- Player Stats -->
      <div class="player-stats">
        <h4 class="section-title">
          <i class="pi pi-chart-bar" />
          Player Details
        </h4>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Rank</div>
            <div class="stat-value">#{{ player.rank }}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Height</div>
            <div class="stat-value">{{ player.height }}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Weight</div>
            <div class="stat-value">{{ player.weight }} lbs</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Position</div>
            <div class="stat-value">{{ player.position }}</div>
          </div>
        </div>
      </div>

      <Divider />

      <!-- Draft Status -->
      <div class="draft-status">
        <h4 class="section-title">
          <i class="pi pi-info-circle" />
          Draft Status
        </h4>
        
        <div v-if="player.isDrafted" class="status-drafted">
          <i class="pi pi-check-circle" />
          <div class="status-info">
            <span class="status-text">Drafted</span>
            <span class="status-details">
              Round {{ player.draftedRound }}, Pick {{ player.draftedPick }}
            </span>
          </div>
        </div>
        
        <div v-else class="status-available">
          <i class="pi pi-circle" />
          <div class="status-info">
            <span class="status-text">Available</span>
            <span class="status-details">Ready to be drafted</span>
          </div>
        </div>
      </div>

      <!-- Additional Info (Mock) -->
      <Divider />
      
      <div class="additional-info">
        <h4 class="section-title">
          <i class="pi pi-bookmark" />
          Scouting Notes
        </h4>
        <p class="scouting-notes">
          Top prospect from {{ player.college }}. Strong fundamentals and high football IQ. 
          Expected to make an immediate impact at the professional level.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button 
          label="Close" 
          icon="pi pi-times"
          @click="isVisible = false"
          text
        />
        <Button 
          v-if="!player?.isDrafted"
          label="Draft Player" 
          icon="pi pi-check"
          @click="handleDraft"
          severity="success"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import type { Player } from '@/types/draft.types';

// Props
interface Props {
  visible: boolean;
  player: Player | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'draft-player': [player: Player];
}>();

// State
const isVisible = ref(props.visible);

// Watch
watch(() => props.visible, (newVal) => {
  isVisible.value = newVal;
});

watch(isVisible, (newVal) => {
  emit('update:visible', newVal);
});

// Methods
const handleDraft = (): void => {
  if (props.player) {
    emit('draft-player', props.player);
    isVisible.value = false;
  }
};
</script>

<style scoped lang="scss">
.player-info-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.player-header {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.player-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    font-size: 2.5rem;
    color: white;
  }
}

.player-basic {
  flex: 1;
}

.player-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.player-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.college {
  font-weight: 500;
  color: #6b7280;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;

  i {
    color: #667eea;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.draft-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-drafted,
.status-available {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  
  i {
    font-size: 1.5rem;
  }
}

.status-drafted {
  background: #dcfce7;
  border: 1px solid #86efac;
  
  i {
    color: #22c55e;
  }
}

.status-available {
  background: #e0e7ff;
  border: 1px solid #a5b4fc;
  
  i {
    color: #667eea;
  }
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-text {
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
}

.status-details {
  font-size: 0.875rem;
  color: #6b7280;
}

.additional-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.scouting-notes {
  margin: 0;
  line-height: 1.6;
  color: #374151;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
