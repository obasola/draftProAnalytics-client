
// ============================================
// File: src/modules/mockDraft/stores/mockDraftStore.ts
// ============================================

import { defineStore } from 'pinia';
import type { 
  DraftMode, 
  DraftSettings, 
  DraftPick, 
  Team, 
  Player 
} from '../types/draft.types';

interface MockDraftState {
  loading: boolean;
  error: string | null;
  mode: DraftMode;
  isStarted: boolean;
  isPaused: boolean;
  currentPick: DraftPick | null;
  selectedTeams: string[];
  completedPicks: DraftPick[];
  settings: DraftSettings;
  teams: Team[];
  players: Player[];
}

export const useMockDraftStore = defineStore('mockDraft', {
  state: (): MockDraftState => ({
    loading: false,
    error: null,
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
    },
    teams: [],
    players: []
  }),

  getters: {
    draftProgress(): number {
      const totalPicks = this.settings.rounds * 32;
      return (this.completedPicks.length / totalPicks) * 100;
    },

    availablePlayers(): Player[] {
      return this.players.filter(p => !p.isDrafted);
    }
  },

  actions: {
    async loadTeams(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        // API call to fetch teams
        // this.teams = await teamService.getTeams();
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to load teams';
      } finally {
        this.loading = false;
      }
    },

    async loadPlayers(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        // API call to fetch players
        // this.players = await playerService.getPlayers();
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to load players';
      } finally {
        this.loading = false;
      }
    },

    async startDraft(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        if (this.selectedTeams.length === 0) {
          throw new Error('Please select at least one team');
        }
        
        this.isStarted = true;
        this.isPaused = false;
        // Initialize draft order and set current pick
        // this.currentPick = await draftService.getNextPick();
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to start draft';
      } finally {
        this.loading = false;
      }
    },

    togglePause(): void {
      this.isPaused = !this.isPaused;
    },

    async makePick(playerId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        if (!this.currentPick) {
          throw new Error('No current pick available');
        }
        
        // Make the pick via API
        // const pick = await draftService.makePick(this.currentPick, playerId);
        
        // Update state
        // this.completedPicks.push(pick);
        // this.currentPick = await draftService.getNextPick();
        
        // Mark player as drafted
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          this.players[playerIndex].isDrafted = true;
          this.players[playerIndex].draftedBy = this.currentPick.teamId;
          this.players[playerIndex].draftedRound = this.currentPick.round;
          this.players[playerIndex].draftedPick = this.currentPick.pick;
        }
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to make pick';
      } finally {
        this.loading = false;
      }
    },

    restartDraft(): void {
      this.isStarted = false;
      this.isPaused = false;
      this.currentPick = null;
      this.completedPicks = [];
      
      // Reset all players to undrafted
      this.players.forEach(player => {
        player.isDrafted = false;
        player.draftedBy = undefined;
        player.draftedRound = undefined;
        player.draftedPick = undefined;
      });
    },

    leaveDraft(): void {
      this.restartDraft();
      this.selectedTeams = [];
    },

    updateSettings(newSettings: Partial<DraftSettings>): void {
      this.settings = {
        ...this.settings,
        ...newSettings
      };
    },

    selectTeams(teamIds: string[]): void {
      this.selectedTeams = teamIds;
    },

    setMode(mode: DraftMode): void {
      this.mode = mode;
    }
  }
});

