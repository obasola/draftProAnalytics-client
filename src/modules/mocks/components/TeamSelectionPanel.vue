// ============================================
// File: src/modules/mocks/components/TeamSelectionPanel.vue
// ============================================

<template>
  <div class="team-selection-panel">
    <div class="panel-header">
      <h3 class="panel-title">Select Your Team(s)</h3>
      <Chip 
        :label="`${selectedTeams.length} Selected`" 
        class="selected-count"
      />
    </div>

    <div class="conference-tabs">
      <Button 
        label="All" 
        :class="['tab-button', { active: activeTab === 'all' }]"
        @click="activeTab = 'all'"
        text
      />
      <Button 
        label="AFC" 
        :class="['tab-button', { active: activeTab === 'AFC' }]"
        @click="activeTab = 'AFC'"
        text
      />
      <Button 
        label="NFC" 
        :class="['tab-button', { active: activeTab === 'NFC' }]"
        @click="activeTab = 'NFC'"
        text
      />
    </div>

    <div class="teams-grid">
      <div 
        v-for="team in filteredTeams" 
        :key="team.id"
        :class="['team-card', { selected: isSelected(team.id) }]"
        @click="toggleTeam(team.id)"
      >
        <img 
          :src="team.logoUrl" 
          :alt="team.name"
          class="team-logo"
        />
        <span class="team-abbr">{{ team.abbreviation }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import { Conference, Team } from '../draftTypes';

// Props
interface Props {
  teams: Team[];
  selectedTeams: string[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:selectedTeams': [value: string[]];
}>();

// State
const activeTab = ref<'all' | Conference>('all');

// Computed
const filteredTeams = computed(() => {
  if (activeTab.value === 'all') return props.teams;
  return props.teams.filter(team => team.conference === activeTab.value);
});

// Methods
const isSelected = (teamId: string): boolean => {
  return props.selectedTeams.includes(teamId);
};

const toggleTeam = (teamId: string): void => {
  const updated = isSelected(teamId)
    ? props.selectedTeams.filter(id => id !== teamId)
    : [...props.selectedTeams, teamId];
  
  emit('update:selectedTeams', updated);
};
</script>

<style scoped lang="scss">
.team-selection-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.selected-count {
  background: #667eea;
  color: white;
}

.conference-tabs {
  display: flex;
  gap: 0.5rem;
  
  .tab-button {
    flex: 1;
    
    &.active {
      background: #667eea;
      color: white;
    }
  }
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
  padding: 0.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &.selected {
    border-color: #667eea;
    background: #f3f4ff;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
}

.team-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.team-abbr {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}
</style>







