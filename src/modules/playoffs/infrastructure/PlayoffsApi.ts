// src/modules/playoffs/infrastructure/PlayoffsApi.ts
import {api} from '@/services/api';
import type { PlayoffBracket } from '../domain/PlayoffTypes';

export class PlayoffsApi {
  static async getBracket(seasonYear: number): Promise<PlayoffBracket> {
    const response = await api.get<PlayoffBracket>('/playoffs/bracket', {
      params: { seasonYear }
    });
    return response.data;
  }
}
