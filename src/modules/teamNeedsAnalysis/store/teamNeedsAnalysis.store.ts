// src/stores/teamNeedsAnalysis.store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type {
  TeamNeedsAnalysisDto,
  AllTeamsNeedsDto,
  TeamNeedsDataTableRow,
  PositionNeedsDataTableRow,
  GenerateTeamNeedsRequest,
  GenerateAllTeamsNeedsRequest,
} from '../types/teamNeedsAnalysis.types';

// Option 1: Import from shared config (recommended)
// import { API_ENDPOINTS } from '@/config/api';
// const API_BASE = API_ENDPOINTS.teamNeeds;

// Option 2: Use environment variable directly
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_BASE = `${API_BASE_URL}/team-needs`;

export const useTeamNeedsAnalysisStore = defineStore('teamNeedsAnalysis', () => {
  // State
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentSeasonYear = ref(new Date().getFullYear());
  
  // Team needs data
  const allTeamsNeeds = ref<TeamNeedsDataTableRow[]>([]);
  const selectedTeamNeeds = ref<TeamNeedsAnalysisDto | null>(null);
  const positionNeeds = ref<PositionNeedsDataTableRow[]>([]);

  // Computed
  const hasData = computed(() => allTeamsNeeds.value.length > 0);
  
  const teamNeedsById = computed(() => {
    const map = new Map<number, TeamNeedsDataTableRow>();
    allTeamsNeeds.value.forEach(team => {
      map.set(team.teamId, team);
    });
    return map;
  });

  const criticalNeedsCount = computed(() => {
    return allTeamsNeeds.value.reduce((sum, team) => sum + team.criticalPositions, 0);
  });

  const averageNeedScore = computed(() => {
    if (allTeamsNeeds.value.length === 0) return 0;
    const total = allTeamsNeeds.value.reduce((sum, team) => sum + team.overallNeedScore, 0);
    return Math.round(total / allTeamsNeeds.value.length);
  });

  // Actions
  async function generateTeamNeeds(request: GenerateTeamNeedsRequest): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post(`${API_BASE}/generate`, request);
      
      if (response.data.success) {
        selectedTeamNeeds.value = response.data.data;
        
        // Refresh the teams list if we have it loaded
        if (hasData.value) {
          await fetchTeamsNeedsDataTable(currentSeasonYear.value);
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to generate team needs';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function generateAllTeamsNeeds(request: GenerateAllTeamsNeedsRequest): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post(`${API_BASE}/generate-all`, request);
      
      if (response.data.success) {
        currentSeasonYear.value = request.seasonYear;
        // After generating, fetch the DataTable data
        await fetchTeamsNeedsDataTable(request.seasonYear);
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to generate team needs for all teams';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTeamNeeds(teamId: number, seasonYear?: number): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const params = seasonYear ? { seasonYear } : {};
      const response = await axios.get(`${API_BASE}/${teamId}`, { params });
      
      if (response.data.success) {
        selectedTeamNeeds.value = response.data.data;
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        error.value = 'Team needs analysis not found';
      } else {
        error.value = err.response?.data?.error || 'Failed to fetch team needs';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllTeamsNeeds(seasonYear: number): Promise<AllTeamsNeedsDto | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get(`${API_BASE}/season/${seasonYear}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch all teams needs';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTeamsNeedsDataTable(seasonYear: number): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get(`${API_BASE}/datatable/teams/${seasonYear}`);
      
      if (response.data.success) {
        allTeamsNeeds.value = response.data.data;
        currentSeasonYear.value = seasonYear;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch teams needs data';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPositionNeedsDataTable(seasonYear: number): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get(`${API_BASE}/datatable/positions/${seasonYear}`);
      
      if (response.data.success) {
        positionNeeds.value = response.data.data;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch position needs data';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  function resetStore(): void {
    allTeamsNeeds.value = [];
    selectedTeamNeeds.value = null;
    positionNeeds.value = [];
    error.value = null;
    loading.value = false;
  }

  function selectTeam(teamId: number): TeamNeedsDataTableRow | undefined {
    return teamNeedsById.value.get(teamId);
  }

  return {
    // State
    loading,
    error,
    currentSeasonYear,
    allTeamsNeeds,
    selectedTeamNeeds,
    positionNeeds,
    
    // Computed
    hasData,
    teamNeedsById,
    criticalNeedsCount,
    averageNeedScore,
    
    // Actions
    generateTeamNeeds,
    generateAllTeamsNeeds,
    fetchTeamNeeds,
    fetchAllTeamsNeeds,
    fetchTeamsNeedsDataTable,
    fetchPositionNeedsDataTable,
    clearError,
    resetStore,
    selectTeam,
  };
});