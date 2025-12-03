// src/modules/playoffs/application/playoffStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PlayoffBracket } from '../domain/PlayoffTypes';
import { PlayoffsApi } from '../infrastructure/PlayoffsApi';

export const usePlayoffStore = defineStore('playoffs', () => {
  const bracket = ref<PlayoffBracket | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const hasBracket = computed<boolean>(() => bracket.value != null);

  async function fetchBracket(seasonYear: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const data = await PlayoffsApi.getBracket(seasonYear);
      bracket.value = data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load playoff bracket';
      error.value = message;
    } finally {
      loading.value = false;
    }
  }

  return {
    bracket,
    loading,
    error,
    hasBracket,
    fetchBracket
  };
});
