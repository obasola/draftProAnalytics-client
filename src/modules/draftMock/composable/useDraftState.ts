// Composable following SOLID principles and DDD
// Single Responsibility: Manages draft state and operations

import { ref, computed, readonly } from 'vue';
import type { DraftSettings, DraftPick, DraftState } from '../types/draft.types';
import { DraftService } from '../services/draft.service';

// State (private to composable)
const state = ref<DraftState>({
  mode: 'solo',
  isStarted: false,
  isPaused: false,
  currentPick: null,
  selectedTeams: [],
  completedPicks: [],
  settings: {
    rounds: 7,
    draftSpeed: 'normal',
    playersList: 'PFSN',
    autoPickEnabled: false
  }
});

// Service instance (Dependency Injection pattern)
const draftService = new DraftService();

export function useDraftState() {
  // Computed properties (read-only access)
  const draftStarted = computed(() => state.value.isStarted);
  const isPaused = computed(() => state.value.isPaused);
  const currentPick = computed(() => state.value.currentPick);
  const draftSettings = computed(() => state.value.settings);
  const selectedTeams = computed(() => state.value.selectedTeams);
  const completedPicks = computed(() => state.value.completedPicks);

  // Draft progress
  const draftProgress = computed(() => {
    const totalPicks = state.value.settings.rounds * 32;
    const completed = state.value.completedPicks.length;
    return (completed / totalPicks) * 100;
  });

  // Actions
  const startDraft = async (): Promise<void> => {
    try {
      if (state.value.selectedTeams.length === 0) {
        throw new Error('Please select at least one team');
      }

      await draftService.initializeDraft({
        teams: state.value.selectedTeams,
        settings: state.value.settings
      });

      state.value.isStarted = true;
      state.value.currentPick = draftService.getNextPick();
    } catch (error) {
      console.error('Failed to start draft:', error);
      throw error;
    }
  };

  const togglePause = (): void => {
    state.value.isPaused = !state.value.isPaused;
  };

  const makePick = async (playerId: string): Promise<void> => {
    try {
      if (!state.value.currentPick) {
        throw new Error('No current pick available');
      }

      const pick = await draftService.makePick(
        state.value.currentPick,
        playerId
      );

      state.value.completedPicks.push(pick);
      state.value.currentPick = draftService.getNextPick();
    } catch (error) {
      console.error('Failed to make pick:', error);
      throw error;
    }
  };

  const restartDraft = (): void => {
    state.value.isStarted = false;
    state.value.isPaused = false;
    state.value.currentPick = null;
    state.value.completedPicks = [];
    draftService.reset();
  };

  const leaveDraft = (): void => {
    restartDraft();
    state.value.selectedTeams = [];
  };

  const updateSettings = (newSettings: Partial<DraftSettings>): void => {
    state.value.settings = {
      ...state.value.settings,
      ...newSettings
    };
  };

  const selectTeams = (teamIds: string[]): void => {
    state.value.selectedTeams = teamIds;
  };

  // Return public API
  return {
    // Read-only state
    draftStarted: readonly(draftStarted),
    isPaused: readonly(isPaused),
    currentPick: readonly(currentPick),
    draftSettings: readonly(draftSettings),
    selectedTeams: readonly(selectedTeams),
    completedPicks: readonly(completedPicks),
    draftProgress: readonly(draftProgress),

    // Actions
    startDraft,
    togglePause,
    makePick,
    restartDraft,
    leaveDraft,
    updateSettings,
    selectTeams
  };
}