// Domain Service following DDD and SOLID principles
// Single Responsibility: Handle draft business logic

import axios from 'axios';
import type { DraftPick, DraftSettings } from '../types/draft.types';

interface DraftInitParams {
  teams: string[];
  settings: DraftSettings;
}

export class DraftService {
  private readonly apiUrl: string;
  private draftOrder: DraftPick[] = [];
  private currentPickIndex: number = 0;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  /**
   * Initialize a new draft
   */
  async initializeDraft(params: DraftInitParams): Promise<void> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/draft/initialize`, {
        teamIds: params.teams,
        settings: params.settings
      });

      this.draftOrder = response.data.draftOrder;
      this.currentPickIndex = 0;
    } catch (error) {
      throw new Error('Failed to initialize draft');
    }
  }

  /**
   * Get the next pick in the draft order
   */
  getNextPick(): DraftPick | null {
    if (this.currentPickIndex >= this.draftOrder.length) {
      return null; // Draft completed
    }

    return this.draftOrder[this.currentPickIndex];
  }

  /**
   * Make a draft pick
   */
  async makePick(pick: DraftPick, playerId: string): Promise<DraftPick> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/draft/pick`, {
        pickId: pick.overallPick,
        playerId
      });

      this.currentPickIndex++;
      
      return {
        ...pick,
        playerId,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error('Failed to make pick');
    }
  }

  /**
   * Propose a trade
   */
  async proposeTrade(
    fromTeamId: string,
    toTeamId: string,
    offeredPicks: DraftPick[],
    requestedPicks: DraftPick[]
  ): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/api/draft/trade/propose`, {
        fromTeamId,
        toTeamId,
        offeredPicks,
        requestedPicks
      });
    } catch (error) {
      throw new Error('Failed to propose trade');
    }
  }

  /**
   * Get available players
   */
  async getAvailablePlayers(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/players/available`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch players');
    }
  }

  /**
   * Reset draft state
   */
  reset(): void {
    this.draftOrder = [];
    this.currentPickIndex = 0;
  }

  /**
   * Get draft statistics
   */
  async getDraftStats(draftId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/draft/${draftId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch draft stats');
    }
  }
}