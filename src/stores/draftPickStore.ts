// src/stores/draftPickStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DraftPick, DraftPickWithRelations, CreateDraftPickData, UpdateDraftPickData } from '@/domain/entities/draftPick';
import { draftPickApiService } from '@/services/draftPickApiService';

export const useDraftPickStore = defineStore('draftPick', () => {
  const draftPicks = ref<DraftPick[]>([]);
  const draftPicksWithRelations = ref<DraftPickWithRelations[]>([]);
  const currentDraftPick = ref<DraftPick | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);


  const handleError = (err: any, operation: string): void => {
    console.error(`Error during ${operation}:`, err);
    error.value = err?.response?.data?.message || err?.message || `Failed to ${operation}`;
  };

  const clearError = (): void => {
    error.value = null;
  };

  const reset = (): void => {
    draftPicks.value = [];
    draftPicksWithRelations.value = [];
    currentDraftPick.value = null;
    error.value = null;
    loading.value = false;
  };

// Getters
  const getDraftPickById = computed(() => {
    return (id: number) => draftPicks.value.find((item) => item.id === id)
  })

  const getDraftPicksByYear = computed(() => {
    return (year: number) => draftPicks.value.filter((item) => item.draftYear === year)
  })

  const getDraftPicksByTeam = computed(() => {
    return (teamId: number) => draftPicks.value.filter((item) => item.currentTeamId === teamId)
  })

  const getDraftPicksByRound = computed(() => {
    return (round: number) => draftPicks.value.filter((item) => item.round === round)
  })

const fetchAll = async (filters?: {
    draftYear?: number;
    currentTeamId?: number;
    used?: boolean;
    round?: number;
  }): Promise<DraftPick[]> => {
    loading.value = true;
    clearError();
    try {
      draftPicks.value = await draftPickApiService.findAll(filters);
      return draftPicks.value;
    } catch (err) {
      handleError(err, 'fetch draft picks');
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchById = async (id: number): Promise<void> => {
    loading.value = true;
    clearError();
    try {
      currentDraftPick.value = await draftPickApiService.findById(id);
    } catch (err) {
      handleError(err, 'fetch draft pick');
      currentDraftPick.value = null;
    } finally {
      loading.value = false;
    }
  };

    const fetchAllWithRelations = async (): Promise<void> => {
    loading.value = true;
    clearError();
    try {
      draftPicksWithRelations.value = await draftPickApiService.fetchAllWithRelations();
    } catch (err) {
      handleError(err, 'fetch draft picks with relations');
    } finally {
      loading.value = false;
    }
  };

  const fetchByYear = async (year: number): Promise<void> => {
    loading.value = true;
    clearError();
    try {
      draftPicksWithRelations.value = await draftPickApiService.fetchByYear(year);
    } catch (err) {
      handleError(err, 'fetch draft picks by year');
    } finally {
      loading.value = false;
    }
  };

  const fetchByTeamAndYear = async (teamId: number, year: number): Promise<void> => {
    loading.value = true;
    clearError();
    try {
      draftPicksWithRelations.value = await draftPickApiService.fetchByTeamAndYear(teamId, year);
    } catch (err) {
      handleError(err, 'fetch draft picks by team and year');
    } finally {
      loading.value = false;
    }
  };

  const create = async (data: CreateDraftPickData): Promise<DraftPick | null> => {
    loading.value = true;
    clearError();
    try {
      const newDraftPick = await draftPickApiService.create(data);
      draftPicks.value.push(newDraftPick);
      return newDraftPick;
    } catch (err) {
      handleError(err, 'create draft pick');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id: number, data: UpdateDraftPickData): Promise<DraftPick | null> => {
    loading.value = true;
    clearError();
    try {
      const updatedDraftPick = await draftPickApiService.update(id, data);
      const index = draftPicks.value.findIndex(dp => dp.id === id);
      if (index !== -1) {
        draftPicks.value[index] = updatedDraftPick;
      }
      if (currentDraftPick.value?.id === id) {
        currentDraftPick.value = updatedDraftPick;
      }
      return updatedDraftPick;
    } catch (err) {
      handleError(err, 'update draft pick');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    loading.value = true;
    clearError();
    try {
      await draftPickApiService.delete(id);
      draftPicks.value = draftPicks.value.filter(dp => dp.id !== id);
      if (currentDraftPick.value?.id === id) {
        currentDraftPick.value = null;
      }
      return true;
    } catch (err) {
      handleError(err, 'delete draft pick');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const setCurrentDraftPick = (draftPick: DraftPick | null): void => {
    currentDraftPick.value = draftPick;
  };

  return {
    draftPicks,
    draftPicksWithRelations,
    currentDraftPick,
    loading,
    error,
    isLoading,
    hasError,
    getDraftPickById,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    fetchAllWithRelations,
    fetchByYear,
    fetchByTeamAndYear,
    setCurrentDraftPick,
    clearError,
    reset,
  };
});