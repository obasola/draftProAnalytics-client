// src/modules/playoffs/infrastructure/PlayoffsApi.ts
// src/modules/playoffs/infrastructure/PlayoffsApi.ts
import { api } from '@/services/api';
import type { PlayoffBracket } from '../domain/PlayoffTypes';

export class PlayoffsApi {
  static async getBracket(
    seasonYear: number,
    mode: 'actual' | 'projected'
  ): Promise<PlayoffBracket> {
    const response = await api.get<PlayoffBracket>('/playoffs/bracket', {
      params: { seasonYear, mode }
    });
    return response.data;
  }
}
