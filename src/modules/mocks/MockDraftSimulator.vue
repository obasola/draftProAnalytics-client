<template>
  <div class="mock-draft-container">
    <!-- Header -->
    <header class="draft-header">
      <div class="header-content">
        <h1 class="title">NFL Mock Draft Simulator</h1>
        <div class="header-actions">
          <ModeSelector 
            v-model:mode="draftMode" 
            @mode-change="handleModeChange"
          />
          <Button 
            icon="pi pi-cog" 
            class="p-button-text" 
            @click="settingsVisible = true"
          />
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="draft-layout">
      <!-- Sidebar -->
      <aside class="draft-sidebar">
        <TeamSelectionPanel 
          v-if="!draftStarted"
          :teams="teams"
          v-model:selected-teams="selectedTeams"
        />
        <DraftSettingsPanel 
          v-if="!draftStarted"
          v-model:settings="draftSettings"
          @start-draft="startDraft"
        />
        <DraftInfo 
          v-else
          :current-pick="currentPick"
          :selected-teams="selectedTeams"
        />
      </aside>

      <!-- Main Content -->
      <main class="draft-main">
        <DraftControls 
          v-if="draftStarted"
          :is-paused="isPaused"
          @toggle-pause="togglePause"
          @propose-trade="openTradeDialog"
          @restart="restartDraft"
          @leave="leaveDraft"
        />
        
        <PlayerListPanel 
          :players="availablePlayers"
          :selected-position="selectedPosition"
          @select-player="selectPlayer"
          @filter-position="filterByPosition"
        />
      </main>
    </div>

    <!-- Dialogs -->
    <SettingsDialog 
      v-model:visible="settingsVisible"
      v-model:settings="draftSettings"
    />
    
    <TradeDialog 
      v-model:visible="tradeDialogVisible"
      :teams="teams"
      :selected-teams="selectedTeams"
    />

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

// Component Imports
import ModeSelector from '../../modules/mocks/ModeSelector.vue';
import TeamSelectionPanel from '../../modules/mocks/components/TeamSelectionPanel.vue';
import DraftSettingsPanel from '../../modules/mocks/components/DraftSettingsPanel.vue';

import DraftControls from '../mocks/DraftControls.vue';
import PlayerListPanel from '../mocks/components/PlayerListPanel.vue';
import SettingsDialog from '../mocks/components/SettingsDialog.vue';
import TradeDialog from '../mocks/TradeDialog.vue';

// Domain Types

// Composables

import { useTeams } from '../mocks/composables/useTeams';
import { usePlayers } from '../mocks/composables/usePlayers';
import { Player } from '@/types';
import { DraftMode } from './draftTypes';

// State
const toast = useToast();
const draftMode = ref<DraftMode>('solo');
const settingsVisible = ref(false);
const tradeDialogVisible = ref(false);
const selectedPosition = ref<string>('All');

// Composables
const { teams } = useTeams();
const { 
  draftStarted, 
  isPaused, 
  currentPick, 
  draftSettings, 
  selectedTeams,
  startDraft,
  togglePause,
  restartDraft,
  leaveDraft
} = useDraftState();

const { 
  availablePlayers,
  filterByPosition,
  selectPlayer: handlePlayerSelection
} = usePlayers();

// Methods
const handleModeChange = (newMode: DraftMode) => {
  toast.add({
    severity: 'info',
    summary: 'Mode Changed',
    detail: `Switched to ${newMode} mode`,
    life: 3000
  });
};

const selectPlayer = (player: Player) => {
  handlePlayerSelection(player);
  toast.add({
    severity: 'success',
    summary: 'Player Drafted',
    detail: `${player.name} selected`,
    life: 3000
  });
};

const openTradeDialog = () => {
  tradeDialogVisible.value = true;
};
</script>

<style scoped lang="scss">
.mock-draft-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.draft-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
}

.draft-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  flex: 1;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.draft-sidebar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;

  @media (max-width: 1024px) {
    position: relative;
    top: 0;
  }
}

.draft-main {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>