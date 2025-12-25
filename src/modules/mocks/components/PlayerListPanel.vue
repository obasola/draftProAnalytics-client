// ============================================
// File: ssrc/modules/mocks/components/PlayerListPanel.vue
// ============================================

<template>
  <div class="player-list-panel">
    <div class="panel-header">
      <h3 class="panel-title">Available Players</h3>
      <InputText 
        v-model="searchQuery"
        placeholder="Search players..."
        class="search-input"
      >
        <template #prefix>
          <i class="pi pi-search" />
        </template>
      </InputText>
    </div>

    <div class="position-filters">
      <TabView v-model:activeIndex="activePositionTab">
        <TabPanel header="All">
          <template #header>
            <span>All</span>
          </template>
        </TabPanel>
        <TabPanel header="Offense">
          <template #header>
            <span>Offense</span>
          </template>
        </TabPanel>
        <TabPanel header="Defense">
          <template #header>
            <span>Defense</span>
          </template>
        </TabPanel>
      </TabView>

      <div class="position-buttons">
        <Button 
          v-for="position in visiblePositions"
          :key="position"
          :label="position"
          :class="['position-btn', { active: selectedPosition === position }]"
          @click="selectPosition(position)"
          text
          size="small"
        />
      </div>
    </div>

    <div class="players-list">
      <DataView 
        :value="filteredPlayers"
        :rows="20"
        :paginator="true"
        layout="list"
      >
        <template #list="{ data }">
          <div 
            v-for="(player, index) in data" 
            :key="player.id"
            class="player-item"
          >
            <div class="player-rank">{{ player.rank }}</div>
            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-details">
                <Tag :value="player.position" severity="info" />
                <span class="player-college">{{ player.college }}</span>
              </div>
            </div>
            <Button 
              label="Draft"
              icon="pi pi-check"
              size="small"
              @click="$emit('select-player', player)"
              :disabled="player.isDrafted"
            />
            <Button 
              icon="pi pi-info-circle"
              class="p-button-text p-button-sm"
              @click="showPlayerInfo(player)"
            />
          </div>
        </template>
      </DataView>
    </div>

    <PlayerInfoDialog 
      v-model:visible="playerInfoVisible"
      :player="selectedPlayerInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DataView from 'primevue/dataview';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import PlayerInfoDialog from './PlayerInfoDialog.vue';
import type { Player, Position } from '@/types/draft.types';

// Props
interface Props {
  players: Player[];
  selectedPosition: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'select-player': [player: Player];
  'filter-position': [position: string];
}>();

// State
const searchQuery = ref('');
const activePositionTab = ref(0);
const playerInfoVisible = ref(false);
const selectedPlayerInfo = ref<Player | null>(null);

// Position Groups
const OFFENSIVE_POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'OC'];
const DEFENSIVE_POSITIONS: Position[] = ['DT', 'EDGE', 'LB', 'CB', 'S'];
const SPECIAL_TEAMS: Position[] = ['K', 'P'];

// Computed
const visiblePositions = computed(() => {
  switch (activePositionTab.value) {
    case 1: return OFFENSIVE_POSITIONS;
    case 2: return DEFENSIVE_POSITIONS;
    default: return [...OFFENSIVE_POSITIONS, ...DEFENSIVE_POSITIONS, ...SPECIAL_TEAMS];
  }
});

const filteredPlayers = computed(() => {
  let filtered = props.players;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.college.toLowerCase().includes(query)
    );
  }

  // Filter by position
  if (props.selectedPosition !== 'All') {
    filtered = filtered.filter(p => p.position === props.selectedPosition);
  }

  return filtered;
});

// Methods
const selectPosition = (position: string): void => {
  emit('filter-position', position);
};

const showPlayerInfo = (player: Player): void => {
  selectedPlayerInfo.value = player;
  playerInfoVisible.value = true;
};
</script>

<style scoped lang="scss">
.player-list-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.panel-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.search-input {
  min-width: 250px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
}

.position-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.position-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  .position-btn {
    min-width: 60px;
    
    &.active {
      background: #667eea;
      color: white;
    }
  }
}

.players-list {
  .player-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    transition: background 0.2s ease;
    
    &:hover {
      background: #f9fafb;
    }
  }
  
  .player-rank {
    font-weight: 700;
    font-size: 1.125rem;
    color: #667eea;
    min-width: 40px;
  }
  
  .player-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .player-name {
    font-weight: 600;
    font-size: 1rem;
    color: #1f2937;
  }
  
  .player-details {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
  }
  
  .player-college {
    color: #6b7280;
  }
}
</style>