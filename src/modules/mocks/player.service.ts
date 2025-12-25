
/* ===========================
   player.service.ts
   =========================== */

import axios from 'axios';
import type { Player } from '@/types/draft.types';

export class PlayerService {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  async getPlayers(): Promise<Player[]> {
    const response = await axios.get(`${this.apiUrl}/api/players`);
    return response.data;
  }

  async getPlayerById(id: string): Promise<Player> {
    const response = await axios.get(`${this.apiUrl}/api/players/${id}`);
    return response.data;
  }

  async draftPlayer(playerId: string): Promise<void> {
    await axios.post(`${this.apiUrl}/api/players/${playerId}/draft`);
  }
}
